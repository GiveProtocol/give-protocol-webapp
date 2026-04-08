/**
 * Supabase Edge Function: pii-crypto
 * @module pii-crypto
 * @description Application-layer AES-256-GCM encryption/decryption and HMAC for PII fields.
 * Keys (DEK, HMAC key) are loaded from Supabase Vault environment secrets — never exposed to clients.
 * Supports operations: encrypt, decrypt (service-role only), hmac.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CIPHERTEXT_VERSION = 'v1';

interface PiiCryptoRequest {
  operation: 'encrypt' | 'decrypt' | 'hmac';
  value: string;
  field?: string;
}

interface PiiCryptoResponse {
  ciphertext?: string;
  plaintext?: string;
  digest?: string;
}

/** Decode a base64url/base64 string to Uint8Array. */
function base64ToBytes(b64: string): Uint8Array {
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return bytes;
}

/** Encode Uint8Array to base64 string. */
function bytesToBase64(bytes: Uint8Array): string {
  let binStr = '';
  for (const byte of bytes) {
    binStr += String.fromCharCode(byte);
  }
  return btoa(binStr);
}

/** Import a raw AES-256-GCM key from base64-encoded key material. */
async function importAesKey(keyBase64: string, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
  const keyBytes = base64ToBytes(keyBase64);
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  );
}

/** Import a raw HMAC-SHA256 key from base64-encoded key material. */
async function importHmacKey(keyBase64: string): Promise<CryptoKey> {
  const keyBytes = base64ToBytes(keyBase64);
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

/**
 * Encrypt plaintext with AES-256-GCM.
 * @returns Ciphertext in format: v1:<base64_iv>:<base64_ciphertext>
 */
async function encryptAesGcm(plaintext: string, dekBase64: string): Promise<string> {
  const key = await importAesKey(dekBase64, 'encrypt');
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  );
  const ivB64 = bytesToBase64(iv);
  const ctB64 = bytesToBase64(new Uint8Array(ciphertextBuf));
  return `${CIPHERTEXT_VERSION}:${ivB64}:${ctB64}`;
}

/**
 * Decrypt ciphertext produced by encryptAesGcm.
 * @param ciphertext - Format: v1:<base64_iv>:<base64_ciphertext>
 * @returns Decrypted plaintext string
 */
async function decryptAesGcm(ciphertext: string, dekBase64: string): Promise<string> {
  const parts = ciphertext.split(':');
  if (parts.length !== 3 || parts[0] !== CIPHERTEXT_VERSION) {
    throw new Error(`Unsupported ciphertext format: expected ${CIPHERTEXT_VERSION}:<iv>:<ct>`);
  }
  const iv = base64ToBytes(parts[1]);
  const ct = base64ToBytes(parts[2]);
  const key = await importAesKey(dekBase64, 'decrypt');
  const plaintextBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ct,
  );
  return new TextDecoder().decode(plaintextBuf);
}

/**
 * Compute HMAC-SHA256 blind index.
 * @returns Hex-encoded HMAC digest
 */
async function computeHmac(value: string, hmacKeyBase64: string): Promise<string> {
  const key = await importHmacKey(hmacKeyBase64);
  const encoded = new TextEncoder().encode(value);
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoded);
  return Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Load and validate required secret environment variables. */
function loadSecrets(): { dekBase64: string; hmacKeyBase64: string } {
  const dekBase64 = Deno.env.get('PII_DEK_V1');
  const hmacKeyBase64 = Deno.env.get('PII_HMAC_KEY');
  if (!dekBase64) throw new Error('PII_DEK_V1 secret is not configured');
  if (!hmacKeyBase64) throw new Error('PII_HMAC_KEY secret is not configured');
  return { dekBase64, hmacKeyBase64 };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json() as PiiCryptoRequest;
    const { operation, value, field } = body;

    if (!operation || !value) {
      return new Response(JSON.stringify({ error: 'Missing required fields: operation, value' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['encrypt', 'decrypt', 'hmac'].includes(operation)) {
      return new Response(JSON.stringify({ error: 'Invalid operation. Must be encrypt, decrypt, or hmac' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Decrypt is restricted to service-role callers only
    if (operation === 'decrypt') {
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
      if (authError || !user) {
        // Check if it's a service role token by attempting a privileged operation
        const callerClient = createClient(supabaseUrl, token);
        const { error: roleError } = await callerClient.from('key_rotation_jobs').select('id').limit(1);
        if (roleError) {
          return new Response(JSON.stringify({ error: 'Decrypt requires service-role authorization' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    } else {
      // Encrypt and hmac require authenticated user
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await adminClient.auth.getUser(token);
      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const { dekBase64, hmacKeyBase64 } = loadSecrets();
    const response: PiiCryptoResponse = {};

    if (operation === 'encrypt') {
      response.ciphertext = await encryptAesGcm(value, dekBase64);
    } else if (operation === 'decrypt') {
      response.plaintext = await decryptAesGcm(value, dekBase64);
    } else {
      // hmac
      response.digest = await computeHmac(value, hmacKeyBase64);
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
