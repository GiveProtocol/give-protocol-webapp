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

interface AttestationItem {
  donation: FiatDonationRow;
  charityAddress: string;
  refHash: string;
  currencyBytes: string;
}

interface EnvConfig {
  supabaseUrl: string;
  supabaseKey: string;
  rpcUrl: string;
  contractAddress: string;
  privateKey: string;
  chain: string;
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

/**
 * Build a JSON success response
 */
function jsonOk(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ success: true, ...body }), { status: 200, headers: jsonHeaders });
}

/**
 * Build a JSON error response
 */
function jsonError(status: number, error: string, extra?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ success: false, error, ...extra }), { status, headers: jsonHeaders });
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

    if (data.attestation_status === 'confirmed') {
      return [];
    }

    return [data as FiatDonationRow];
  }

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
// Attestation pipeline stages
// ---------------------------------------------------------------------------

/**
 * Resolve charity addresses and prepare attestation items.
 * Skips donations without a charity address or already confirmed on-chain.
 */
async function resolveAttestationItems(
  supabase: ReturnType<typeof createClient>,
  donations: FiatDonationRow[],
  env: EnvConfig
): Promise<AttestationItem[]> {
  const toAttest: AttestationItem[] = [];

  for (const donation of donations) {
    if (donation.attestation_status === 'submitted') {
      const refHash = computeOffChainRefHash(donation.transaction_id, donation.amount_cents, donation.currency);
      const alreadyProcessed = await checkOnChainStatus(env, refHash);
      if (alreadyProcessed) {
        await updateAttestationStatus(supabase, donation.id, {
          attestation_status: 'confirmed',
          attested_at: new Date().toISOString(),
        });
        continue;
      }
    }

    const charityAddress = await getCharityAddress(supabase, donation.charity_id, env.chain);
    if (!charityAddress) {
      await updateAttestationStatus(supabase, donation.id, {
        attestation_status: 'skipped',
        attestation_error: `No blockchain address for charity ${donation.charity_id} on ${env.chain}`,
      });
      continue;
    }

    toAttest.push({
      donation,
      charityAddress,
      refHash: computeOffChainRefHash(donation.transaction_id, donation.amount_cents, donation.currency),
      currencyBytes: currencyToBytes3(donation.currency),
    });
  }

  return toAttest;
}

/**
 * Check if a refHash has already been processed on-chain
 */
async function checkOnChainStatus(env: EnvConfig, refHash: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(env.rpcUrl);
    const contract = new ethers.Contract(env.contractAddress, ATTESTATION_ABI, provider);
    return await contract.isRefHashProcessed(refHash);
  } catch (err) {
    console.error('On-chain status check failed:', err);
    return false;
  }
}

/**
 * Send the attestation transaction (single or batch) and return the tx response.
 * On duplicate refHash errors, marks items as confirmed and returns null.
 */
async function sendAttestationTx(
  supabase: ReturnType<typeof createClient>,
  toAttest: AttestationItem[],
  env: EnvConfig
): Promise<{ tx: ethers.TransactionResponse } | { response: Response }> {
  const provider = new ethers.JsonRpcProvider(env.rpcUrl);
  const wallet = new ethers.Wallet(env.privateKey, provider);
  const contract = new ethers.Contract(env.contractAddress, ATTESTATION_ABI, wallet);

  try {
    let tx: ethers.TransactionResponse;
    if (toAttest.length === 1) {
      const item = toAttest[0];
      tx = await contract.attest(item.charityAddress, item.donation.amount_cents, item.currencyBytes, item.refHash);
    } else {
      tx = await contract.batchAttest(
        toAttest.map((i) => i.charityAddress),
        toAttest.map((i) => i.donation.amount_cents),
        toAttest.map((i) => i.currencyBytes),
        toAttest.map((i) => i.refHash)
      );
    }
    return { tx };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes('already processed') || message.includes('RefHashAlreadyProcessed')) {
      for (const item of toAttest) {
        await updateAttestationStatus(supabase, item.donation.id, {
          attestation_status: 'confirmed',
          attested_at: new Date().toISOString(),
          attestation_chain: env.chain,
        });
      }
      return { response: jsonOk({ message: 'Already attested on-chain (idempotent)', attested: toAttest.length }) };
    }

    console.error('Contract call failed:', message);
    for (const item of toAttest) {
      await updateAttestationStatus(supabase, item.donation.id, {
        attestation_status: 'failed',
        attestation_error: message.slice(0, 500),
      });
    }
    return { response: jsonError(502, 'Attestation transaction failed', { detail: message.slice(0, 200) }) };
  }
}

/**
 * Wait for tx confirmation, parse events, and update DB rows
 */
async function confirmAndUpdateRows(
  supabase: ReturnType<typeof createClient>,
  tx: ethers.TransactionResponse,
  toAttest: AttestationItem[],
  chain: string
): Promise<Response> {
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
    return jsonError(502, 'Transaction sent but not confirmed', { txHash: tx.hash });
  }

  if (!receipt || receipt.status === 0) {
    for (const item of toAttest) {
      await updateAttestationStatus(supabase, item.donation.id, {
        attestation_status: 'failed',
        attestation_error: 'Transaction reverted',
        attestation_tx_hash: tx.hash,
      });
    }
    return jsonError(502, 'Transaction reverted', { txHash: tx.hash });
  }

  // Parse AttestationRecorded events
  const iface = new ethers.Interface(ATTESTATION_ABI);
  const refHashToAttestationHash = new Map<string, string>();
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed && parsed.name === 'AttestationRecorded') {
        refHashToAttestationHash.set(parsed.args[5] as string, parsed.args[0] as string);
      }
    } catch {
      // Not our event — skip
    }
  }

  const now = new Date().toISOString();
  for (const item of toAttest) {
    await updateAttestationStatus(supabase, item.donation.id, {
      attestation_status: 'confirmed',
      attestation_hash: refHashToAttestationHash.get(item.refHash) || null,
      attestation_tx_hash: tx.hash,
      attestation_chain: chain,
      attested_at: now,
      attestation_error: null,
    });
  }

  return jsonOk({ attested: toAttest.length, txHash: tx.hash, chain });
}

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

/**
 * Read and validate required environment variables
 */
function loadEnvConfig(): EnvConfig | Response {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration');
    return jsonError(503, 'Service unavailable');
  }

  const rpcUrl = Deno.env.get('ATTESTATION_RPC_URL');
  const contractAddress = Deno.env.get('ATTESTATION_CONTRACT_ADDRESS');
  const privateKey = Deno.env.get('ATTESTER_PRIVATE_KEY');
  const chain = Deno.env.get('ATTESTATION_CHAIN') || 'moonbase';

  if (!rpcUrl || !contractAddress || !privateKey) {
    console.error('Missing attestation configuration (RPC_URL, CONTRACT_ADDRESS, or PRIVATE_KEY)');
    return jsonError(503, 'Attestation service not configured');
  }

  return { supabaseUrl, supabaseKey, rpcUrl, contractAddress, privateKey, chain };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

/**
 * Process the attestation request
 */
async function handleAttestationRequest(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonError(405, 'Method not allowed');
  }

  const envResult = loadEnvConfig();
  if (envResult instanceof Response) return envResult;
  const env = envResult;

  // Parse optional donationId
  let donationId: string | undefined;
  try {
    const body = await req.json();
    donationId = body.donationId;
  } catch {
    // Empty body is fine — triggers batch mode
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseKey);

  // Fetch donations needing attestation
  const donations = await fetchPendingDonations(supabase, donationId);
  if (donations.length === 0) {
    return jsonOk({ message: 'No donations to attest', attested: 0 });
  }

  // Resolve charity addresses and build attestation items
  const toAttest = await resolveAttestationItems(supabase, donations, env);
  if (toAttest.length === 0) {
    return jsonOk({ message: 'All donations skipped or already confirmed', attested: 0 });
  }

  // Mark as submitted
  for (const item of toAttest) {
    await updateAttestationStatus(supabase, item.donation.id, {
      attestation_status: 'submitted',
      attestation_attempts: item.donation.attestation_attempts + 1,
    });
  }

  // Send transaction
  const txResult = await sendAttestationTx(supabase, toAttest, env);
  if ('response' in txResult) return txResult.response;

  // Confirm and update DB
  return confirmAndUpdateRows(supabase, txResult.tx, toAttest, env.chain);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    return await handleAttestationRequest(req);
  } catch (error) {
    console.error('Attestation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Attestation failed';
    return jsonError(500, errorMessage);
  }
});
