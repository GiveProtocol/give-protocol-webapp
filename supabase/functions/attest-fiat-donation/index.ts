/**
 * Supabase Edge Function for attesting fiat donations on-chain
 * @module attest-fiat-donation
 * @description Bridge between the fiat_donations table and the FiatDonationAttestation
 * smart contract. Supports two modes:
 *   - Single: POST { donationId } → attest one donation
 *   - Batch:  POST {} (no donationId) → sweep up to 50 pending/failed donations
 *
 * Called fire-and-forget from helcim-validate after payment confirmation,
 * and periodically via cron as a backup sweep.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ethers } from 'https://esm.sh/ethers@6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

// ---------------------------------------------------------------------------
// Minimal ABI — only the functions we call + the event we parse
// ---------------------------------------------------------------------------
const ATTESTATION_ABI = [
  'function attest(address charity, uint256 amountInCents, bytes3 currencyCode, bytes32 offChainRefHash) external returns (bytes32)',
  'function batchAttest(address[] calldata _charities, uint256[] calldata amounts, bytes3[] calldata currencies, bytes32[] calldata refHashes) external returns (bytes32[])',
  'function isRefHashProcessed(bytes32 refHash) external view returns (bool)',
  'event AttestationRecorded(bytes32 indexed attestationHash, address indexed charity, uint256 amountInCents, bytes3 currencyCode, uint256 timestamp, bytes32 offChainRefHash, uint8 status)',
];

const MAX_BATCH_SIZE = 50;
const MAX_ATTESTATION_ATTEMPTS = 5;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FiatDonationRow {
  id: string;
  transaction_id: string;
  amount_cents: number;
  currency: string;
  charity_id: string;
  attestation_status: string;
  attestation_attempts: number;
}

interface CharityAddress {
  address: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a 3-letter currency string (e.g. "USD") to bytes3
 */
function currencyToBytes3(currency: string): string {
  const code = currency.toUpperCase().padEnd(3, '\0').slice(0, 3);
  return ethers.hexlify(ethers.toUtf8Bytes(code));
}

/**
 * Compute the off-chain reference hash for a donation.
 * Uses Helcim transaction ID (no PII), amount in cents, and currency.
 * Deterministic — same donation always produces same hash.
 */
function computeOffChainRefHash(
  transactionId: string,
  amountCents: number,
  currency: string
): string {
  return ethers.solidityPackedKeccak256(
    ['string', 'uint256', 'string'],
    [transactionId, amountCents, currency]
  );
}

// ---------------------------------------------------------------------------
// Database operations
// ---------------------------------------------------------------------------

/**
 * Fetch donations that need attestation
 */
async function fetchPendingDonations(
  supabase: ReturnType<typeof createClient>,
  donationId?: string
): Promise<FiatDonationRow[]> {
  if (donationId) {
    const { data, error } = await supabase
      .from('fiat_donations')
      .select('id, transaction_id, amount_cents, currency, charity_id, attestation_status, attestation_attempts')
      .eq('id', donationId)
      .single();

    if (error || !data) {
      console.error('Donation not found:', donationId, error);
      return [];
    }

    // Already confirmed — nothing to do
    if (data.attestation_status === 'confirmed') {
      return [];
    }

    return [data as FiatDonationRow];
  }

  // Batch sweep: pending completed donations + failed with retries left
  const { data, error } = await supabase
    .from('fiat_donations')
    .select('id, transaction_id, amount_cents, currency, charity_id, attestation_status, attestation_attempts')
    .eq('status', 'completed')
    .in('attestation_status', ['pending', 'failed'])
    .lt('attestation_attempts', MAX_ATTESTATION_ATTEMPTS)
    .order('created_at', { ascending: true })
    .limit(MAX_BATCH_SIZE);

  if (error) {
    console.error('Failed to fetch pending donations:', error);
    return [];
  }

  return (data || []) as FiatDonationRow[];
}

/**
 * Look up the blockchain address for a charity on the target chain
 */
async function getCharityAddress(
  supabase: ReturnType<typeof createClient>,
  charityId: string,
  chain: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('charity_blockchain_addresses')
    .select('address')
    .eq('charity_id', charityId)
    .eq('chain', chain)
    .single();

  if (error || !data) {
    return null;
  }

  return (data as CharityAddress).address;
}

/**
 * Update attestation status for a donation
 */
async function updateAttestationStatus(
  supabase: ReturnType<typeof createClient>,
  donationId: string,
  updates: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase
    .from('fiat_donations')
    .update(updates)
    .eq('id', donationId);

  if (error) {
    console.error(`Failed to update attestation status for ${donationId}:`, error);
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ success: false, error: 'Method not allowed' }),
        { status: 405, headers: jsonHeaders }
      );
    }

    // -----------------------------------------------------------------------
    // Environment validation
    // -----------------------------------------------------------------------
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const rpcUrl = Deno.env.get('ATTESTATION_RPC_URL');
    const contractAddress = Deno.env.get('ATTESTATION_CONTRACT_ADDRESS');
    const privateKey = Deno.env.get('ATTESTER_PRIVATE_KEY');
    const chain = Deno.env.get('ATTESTATION_CHAIN') || 'moonbase';

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ success: false, error: 'Service unavailable' }),
        { status: 503, headers: jsonHeaders }
      );
    }

    if (!rpcUrl || !contractAddress || !privateKey) {
      console.error('Missing attestation configuration (RPC_URL, CONTRACT_ADDRESS, or PRIVATE_KEY)');
      return new Response(
        JSON.stringify({ success: false, error: 'Attestation service not configured' }),
        { status: 503, headers: jsonHeaders }
      );
    }

    // -----------------------------------------------------------------------
    // Parse request
    // -----------------------------------------------------------------------
    let donationId: string | undefined;
    try {
      const body = await req.json();
      donationId = body.donationId;
    } catch {
      // Empty body is fine — triggers batch mode
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // -----------------------------------------------------------------------
    // Step 1: Fetch donations needing attestation
    // -----------------------------------------------------------------------
    const donations = await fetchPendingDonations(supabase, donationId);

    if (donations.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No donations to attest', attested: 0 }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // -----------------------------------------------------------------------
    // Step 2: Resolve charity addresses and prepare attestation data
    // -----------------------------------------------------------------------
    interface AttestationItem {
      donation: FiatDonationRow;
      charityAddress: string;
      refHash: string;
      currencyBytes: string;
    }

    const toAttest: AttestationItem[] = [];

    for (const donation of donations) {
      // Check if already submitted — verify on-chain
      if (donation.attestation_status === 'submitted') {
        const refHash = computeOffChainRefHash(
          donation.transaction_id,
          donation.amount_cents,
          donation.currency
        );

        try {
          const provider = new ethers.JsonRpcProvider(rpcUrl);
          const contract = new ethers.Contract(contractAddress, ATTESTATION_ABI, provider);
          const processed = await contract.isRefHashProcessed(refHash);

          if (processed) {
            await updateAttestationStatus(supabase, donation.id, {
              attestation_status: 'confirmed',
              attested_at: new Date().toISOString(),
            });
            continue;
          }
        } catch (err) {
          console.error(`On-chain check failed for ${donation.id}:`, err);
        }
      }

      // Look up charity blockchain address
      const charityAddress = await getCharityAddress(supabase, donation.charity_id, chain);

      if (!charityAddress) {
        await updateAttestationStatus(supabase, donation.id, {
          attestation_status: 'skipped',
          attestation_error: `No blockchain address for charity ${donation.charity_id} on ${chain}`,
        });
        continue;
      }

      const refHash = computeOffChainRefHash(
        donation.transaction_id,
        donation.amount_cents,
        donation.currency
      );

      toAttest.push({
        donation,
        charityAddress,
        refHash,
        currencyBytes: currencyToBytes3(donation.currency),
      });
    }

    if (toAttest.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All donations skipped or already confirmed', attested: 0 }),
        { status: 200, headers: jsonHeaders }
      );
    }

    // -----------------------------------------------------------------------
    // Step 3: Mark as submitted and increment attempts
    // -----------------------------------------------------------------------
    for (const item of toAttest) {
      await updateAttestationStatus(supabase, item.donation.id, {
        attestation_status: 'submitted',
        attestation_attempts: item.donation.attestation_attempts + 1,
      });
    }

    // -----------------------------------------------------------------------
    // Step 4: Send transaction(s) to the contract
    // -----------------------------------------------------------------------
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, ATTESTATION_ABI, wallet);

    let tx: ethers.TransactionResponse;
    try {
      if (toAttest.length === 1) {
        const item = toAttest[0];
        tx = await contract.attest(
          item.charityAddress,
          item.donation.amount_cents,
          item.currencyBytes,
          item.refHash
        );
      } else {
        tx = await contract.batchAttest(
          toAttest.map((i) => i.charityAddress),
          toAttest.map((i) => i.donation.amount_cents),
          toAttest.map((i) => i.currencyBytes),
          toAttest.map((i) => i.refHash)
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);

      // Check for duplicate refHash (idempotent — treat as confirmed)
      if (message.includes('already processed') || message.includes('RefHashAlreadyProcessed')) {
        for (const item of toAttest) {
          await updateAttestationStatus(supabase, item.donation.id, {
            attestation_status: 'confirmed',
            attested_at: new Date().toISOString(),
            attestation_chain: chain,
          });
        }
        return new Response(
          JSON.stringify({ success: true, message: 'Already attested on-chain (idempotent)', attested: toAttest.length }),
          { status: 200, headers: jsonHeaders }
        );
      }

      // Other contract errors — mark failed
      console.error('Contract call failed:', message);
      for (const item of toAttest) {
        await updateAttestationStatus(supabase, item.donation.id, {
          attestation_status: 'failed',
          attestation_error: message.slice(0, 500),
        });
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Attestation transaction failed', detail: message.slice(0, 200) }),
        { status: 502, headers: jsonHeaders }
      );
    }

    // -----------------------------------------------------------------------
    // Step 5: Wait for confirmation and parse events
    // -----------------------------------------------------------------------
    let receipt: ethers.TransactionReceipt | null;
    try {
      receipt = await tx.wait(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Transaction confirmation failed:', message);

      for (const item of toAttest) {
        await updateAttestationStatus(supabase, item.donation.id, {
          attestation_status: 'failed',
          attestation_error: `Tx sent but confirmation failed: ${message.slice(0, 400)}`,
          attestation_tx_hash: tx.hash,
        });
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Transaction sent but not confirmed', txHash: tx.hash }),
        { status: 502, headers: jsonHeaders }
      );
    }

    if (!receipt || receipt.status === 0) {
      for (const item of toAttest) {
        await updateAttestationStatus(supabase, item.donation.id, {
          attestation_status: 'failed',
          attestation_error: 'Transaction reverted',
          attestation_tx_hash: tx.hash,
        });
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Transaction reverted', txHash: tx.hash }),
        { status: 502, headers: jsonHeaders }
      );
    }

    // -----------------------------------------------------------------------
    // Step 6: Parse AttestationRecorded events and update DB
    // -----------------------------------------------------------------------
    const iface = new ethers.Interface(ATTESTATION_ABI);

    // Map refHash → attestationHash from events
    const refHashToAttestationHash = new Map<string, string>();
    for (const log of receipt.logs) {
      try {
        const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
        if (parsed && parsed.name === 'AttestationRecorded') {
          const attestationHash = parsed.args[0] as string;
          const offChainRefHash = parsed.args[5] as string;
          refHashToAttestationHash.set(offChainRefHash, attestationHash);
        }
      } catch {
        // Not our event — skip
      }
    }

    const now = new Date().toISOString();
    for (const item of toAttest) {
      const attestationHash = refHashToAttestationHash.get(item.refHash);

      await updateAttestationStatus(supabase, item.donation.id, {
        attestation_status: 'confirmed',
        attestation_hash: attestationHash || null,
        attestation_tx_hash: tx.hash,
        attestation_chain: chain,
        attested_at: now,
        attestation_error: null,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        attested: toAttest.length,
        txHash: tx.hash,
        chain,
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    console.error('Attestation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Attestation failed';

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
