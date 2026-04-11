/**
 * Supabase Edge Function for wallet-based authentication
 * @module wallet-auth
 * @description Verifies a wallet signature and returns a Supabase session.
 * Supports EVM (MetaMask, etc.) and Polkadot (Talisman, SubWallet) wallets.
 * If the wallet is already linked to a user, signs them in.
 * If not, creates a new user + identity record and signs them in.
 * @version 5 — dynamic Polkadot crypto import
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ethers } from "https://esm.sh/ethers@6.9.0";

const FUNCTION_VERSION = "v5";

// Polkadot crypto is loaded dynamically to avoid crashing the module on Deno Deploy
// deno-lint-ignore no-explicit-any
let polkadotCrypto: any = null;

/** Lazily initialize Polkadot crypto on first use */
async function getPolkadotCrypto() {
  if (polkadotCrypto) return polkadotCrypto;

  try {
    const mod = await import("https://esm.sh/@polkadot/util-crypto@12.6.2");
    await mod.cryptoWaitReady();
    polkadotCrypto = mod;
    console.log("Polkadot crypto initialized (lazy)");
    return polkadotCrypto;
  } catch (err) {
    console.error("Failed to load @polkadot/util-crypto:", err);
    return null;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChainType = "evm" | "polkadot" | "solana";

interface WalletAuthRequest {
  walletAddress: string;
  signature: string;
  message: string;
  nonce: string;
  accountType?: "donor" | "charity";
  chainType?: ChainType;
}

/**
 * Detect chain type from wallet address format if not explicitly provided
 * @param address - Wallet address
 * @returns Detected chain type
 */
function detectChainType(address: string): ChainType {
  if (address.startsWith("0x") && address.length === 42) return "evm";
  // SS58 addresses (Polkadot/Kusama) are base58, typically 47-48 chars
  if (/^[1-9A-HJ-NP-Za-km-z]{46,48}$/.test(address)) return "polkadot";
  return "evm";
}

/** Type guard for incoming request body */
function validateRequest(body: unknown): body is WalletAuthRequest {
  if (typeof body !== "object" || body === null) return false;
  const req = body as Record<string, unknown>;

  const validAccountType =
    req.accountType === undefined ||
    req.accountType === "donor" ||
    req.accountType === "charity";

  const validChainType =
    req.chainType === undefined ||
    req.chainType === "evm" ||
    req.chainType === "polkadot" ||
    req.chainType === "solana";

  const hasBaseFields =
    typeof req.walletAddress === "string" &&
    req.walletAddress.length > 0 &&
    typeof req.signature === "string" &&
    req.signature.length > 0 &&
    typeof req.message === "string" &&
    typeof req.nonce === "string";

  if (!hasBaseFields || !validAccountType || !validChainType) return false;

  // Validate address format based on chain type
  const chainType =
    (req.chainType as ChainType) || detectChainType(req.walletAddress as string);

  if (chainType === "evm") {
    return (
      (req.walletAddress as string).length === 42 &&
      (req.walletAddress as string).startsWith("0x")
    );
  }

  // For Polkadot: SS58 base58 addresses (46-48 chars, no 0x prefix)
  if (chainType === "polkadot") {
    const addr = req.walletAddress as string;
    return addr.length >= 46 && addr.length <= 48 && !addr.startsWith("0x");
  }

  // Other chain types: just check non-empty (already verified above)
  return true;
}

/**
 * Verify an EVM signature using ethers.js
 * @param message - Original message
 * @param signature - EVM signature (hex)
 * @param address - Expected EVM address (0x...)
 * @returns Whether signature is valid
 */
function verifyEVMSignature(
  message: string,
  signature: string,
  address: string,
): boolean {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (err) {
    console.error("EVM signature verification error:", err);
    return false;
  }
}

/**
 * Verify a Polkadot signature using @polkadot/util-crypto (dynamically loaded)
 * Handles both raw message and <Bytes>-wrapped message formats
 * @param message - Original message string
 * @param signature - Polkadot signature (hex)
 * @param address - SS58 encoded address
 * @returns Whether signature is valid
 */
async function verifyPolkadotSignature(
  message: string,
  signature: string,
  address: string,
): Promise<boolean> {
  const crypto = await getPolkadotCrypto();
  if (!crypto) {
    console.error("Polkadot crypto not available");
    return false;
  }

  try {
    // Try verifying the raw message first
    const result = crypto.signatureVerify(message, signature, address);
    if (result.isValid) return true;

    // Some wallets wrap signRaw data with <Bytes>...</Bytes>
    const wrappedMessage = `<Bytes>${message}</Bytes>`;
    const wrappedResult = crypto.signatureVerify(wrappedMessage, signature, address);
    return wrappedResult.isValid;
  } catch (err) {
    console.error("Polkadot signature verification error:", err);
    return false;
  }
}

/** Build a JSON response with CORS headers */
function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Build an error JSON response with CORS headers, includes version for debugging */
function errorResponse(message: string, status: number): Response {
  return jsonResponse({ success: false, error: message, _v: FUNCTION_VERSION }, status);
}

/**
 * Normalize wallet address for storage.
 * EVM addresses are lowercased; Polkadot SS58 addresses are case-sensitive.
 * @param address - Wallet address
 * @param chainType - Chain type
 * @returns Normalized address
 */
function normalizeAddress(address: string, chainType: ChainType): string {
  if (chainType === "evm") return address.toLowerCase();
  return address;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return errorResponse("Method not allowed", 405);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    // Log request shape for debugging (omit signature value for security)
    const reqShape = body as Record<string, unknown>;
    console.log(`[${FUNCTION_VERSION}] Request:`, {
      hasWalletAddress: typeof reqShape.walletAddress === "string",
      walletAddressLen: typeof reqShape.walletAddress === "string" ? (reqShape.walletAddress as string).length : 0,
      hasSignature: typeof reqShape.signature === "string" && (reqShape.signature as string).length > 0,
      hasMessage: typeof reqShape.message === "string",
      hasNonce: typeof reqShape.nonce === "string",
      chainType: reqShape.chainType,
      accountType: reqShape.accountType,
    });

    if (!validateRequest(body)) {
      // Include debug shape in error for troubleshooting (no secrets)
      const shape = {
        walletAddressLen: typeof reqShape.walletAddress === "string" ? (reqShape.walletAddress as string).length : null,
        walletAddressPrefix: typeof reqShape.walletAddress === "string" ? (reqShape.walletAddress as string).slice(0, 4) : null,
        hasSig: typeof reqShape.signature === "string" && (reqShape.signature as string).length > 0,
        hasMsg: typeof reqShape.message === "string",
        hasNonce: typeof reqShape.nonce === "string",
        chainType: reqShape.chainType,
      };
      return jsonResponse(
        {
          success: false,
          error: "Invalid request. Required: walletAddress, signature, message, nonce",
          _v: FUNCTION_VERSION,
          _debug: shape,
        },
        400,
      );
    }

    const chainType: ChainType =
      body.chainType || detectChainType(body.walletAddress);

    // Verify signature server-side based on chain type
    let signatureValid = false;

    if (chainType === "evm") {
      signatureValid = verifyEVMSignature(
        body.message,
        body.signature,
        body.walletAddress,
      );
    } else if (chainType === "polkadot") {
      signatureValid = await verifyPolkadotSignature(
        body.message,
        body.signature,
        body.walletAddress,
      );
    } else {
      return errorResponse(
        `Authentication for ${chainType} wallets is not yet supported`,
        400,
      );
    }

    if (!signatureValid) {
      // For Polkadot: indicate if crypto library failed to load
      if (chainType === "polkadot" && !polkadotCrypto) {
        return jsonResponse(
          { success: false, error: "Polkadot crypto library unavailable", _v: FUNCTION_VERSION },
          503,
        );
      }
      return errorResponse("Signature verification failed", 401);
    }

    // Verify the message contains the expected nonce
    if (!body.message.includes(body.nonce)) {
      return errorResponse("Invalid nonce in message", 401);
    }

    // Verify message timestamp is within 5 minutes to prevent replay attacks
    const timestampMatch = body.message.match(/Timestamp: (.+)$/m);
    if (!timestampMatch) {
      return errorResponse("Missing timestamp in message", 401);
    }
    const messageTime = new Date(timestampMatch[1]).getTime();
    if (Number.isNaN(messageTime)) {
      return errorResponse("Invalid timestamp in message", 401);
    }
    const fiveMinutesMs = 5 * 60 * 1000;
    if (Date.now() - messageTime > fiveMinutesMs) {
      return errorResponse(
        "Signature has expired. Please sign in again.",
        401,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse("Server configuration error", 503);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const normalizedAddress = normalizeAddress(body.walletAddress, chainType);

    const { data: existingIdentity } = await supabase
      .from("user_identities")
      .select("user_id")
      .eq("wallet_address", normalizedAddress)
      .single();

    let userId: string;

    if (existingIdentity) {
      userId = existingIdentity.user_id;
    } else {
      // No existing identity — create or find user
      const emailPrefix =
        chainType === "evm"
          ? normalizedAddress
          : `${chainType}-${normalizedAddress}`;
      const placeholderEmail = `${emailPrefix}@wallet.giveprotocol.io`;
      const profileType = body.accountType ?? "donor";

      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          email: placeholderEmail,
          email_confirm: true,
          user_metadata: {
            type: profileType,
            auth_method: "wallet",
            chain_type: chainType,
          },
        });

      if (createError || !newUser.user) {
        // User may already exist in Auth (e.g. identity record was deleted).
        // Use generateLink as a reliable email-based lookup — unlike listUsers()
        // it is not paginated and will find the user directly.
        console.warn("createUser failed, attempting email lookup:", createError?.message);

        const { data: fallbackLink, error: fallbackError } =
          await supabase.auth.admin.generateLink({
            type: "magiclink",
            email: placeholderEmail,
          });

        if (fallbackError || !fallbackLink?.user) {
          console.error("Failed to create or find wallet user:", createError, fallbackError);
          return errorResponse("Failed to create user account", 500);
        }

        userId = fallbackLink.user.id;
        console.log("Found existing auth user via email lookup for wallet:", normalizedAddress);
      } else {
        userId = newUser.user.id;
      }

      // Create profile (upsert to handle re-registration)
      const { error: profileError } = await supabase.from("profiles").upsert(
        { user_id: userId, type: profileType, role: profileType },
        { onConflict: "user_id" },
      );

      if (profileError) {
        console.error("Failed to create profile:", profileError);
      }

      // Create or update user_identities with wallet address
      const { error: identityError } = await supabase
        .from("user_identities")
        .upsert(
          {
            user_id: userId,
            wallet_address: normalizedAddress,
            primary_auth_method: "wallet",
            wallet_linked_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

      if (identityError) {
        console.error("Failed to create identity:", identityError);
      }
    }

    // Generate a magic link / session for the user
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "magiclink",
        email:
          (await supabase.auth.admin.getUserById(userId)).data.user?.email ??
          "",
      });

    if (linkError || !linkData) {
      console.error("Failed to generate session link:", linkError);
      return errorResponse("Failed to create session", 500);
    }

    // Extract the token from the link and verify it to get a session
    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get("token");
    const tokenType = url.searchParams.get("type") ?? "magiclink";

    if (!token) {
      return errorResponse("Failed to generate auth token", 500);
    }

    // Verify the OTP to get back a session
    const { data: sessionData, error: verifyError } =
      await supabase.auth.verifyOtp({
        token_hash: token,
        type: tokenType as "magiclink",
      });

    if (verifyError || !sessionData.session) {
      console.error("Failed to verify OTP:", verifyError);
      return errorResponse("Failed to establish session", 500);
    }

    return jsonResponse(
      {
        success: true,
        session: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          expires_in: sessionData.session.expires_in,
          token_type: sessionData.session.token_type,
          user: {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            user_metadata: sessionData.session.user.user_metadata,
          },
        },
        isNewUser: !existingIdentity,
        chainType,
        _v: FUNCTION_VERSION,
      },
      200,
    );
  } catch (error) {
    console.error("Wallet auth error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";
    return errorResponse(errorMessage, 500);
  }
});
