/**
 * PII Encryption Service — client-side wrapper for the pii-crypto Edge Function.
 * Keys (DEK/KEK/HMAC) are held server-side in Supabase Vault; this module never
 * accesses raw key material.
 * @module piiEncryption
 */
import { supabase } from '@/lib/supabase';

interface EncryptResponse {
  ciphertext: string;
}

interface DecryptResponse {
  plaintext: string;
}

interface HmacResponse {
  digest: string;
}

/** Decrypted shape stored in profiles.pii_encrypted */
export interface ProfilePII {
  contact?: {
    email?: string;
    phone?: string;
  };
  address?: {
    street?: string;
    city?: string;
    stateProvince?: string;
    postalCode?: string;
    country?: string;
  };
}

/**
 * Encrypt a single PII field via the pii-crypto Edge Function.
 * @param plaintext - The PII value to encrypt
 * @param field - Field name used for audit logging
 * @returns Ciphertext in format v1:<base64_iv>:<base64_ciphertext>
 */
export async function encryptPII(plaintext: string, field: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<EncryptResponse>('pii-crypto', {
    body: { operation: 'encrypt', value: plaintext, field },
  });
  if (error) {
    throw new Error(`PII encryption failed for field "${field}": ${error.message}`);
  }
  if (!data?.ciphertext) {
    throw new Error(`PII encryption returned no ciphertext for field "${field}"`);
  }
  return data.ciphertext;
}

/**
 * Decrypt a single PII field via the pii-crypto Edge Function.
 * Requires service-role authorization on the server side.
 * @param ciphertext - Encrypted value in format v1:<base64_iv>:<base64_ciphertext>
 * @param field - Field name used for audit logging
 * @returns Decrypted plaintext
 */
export async function decryptPII(ciphertext: string, field: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<DecryptResponse>('pii-crypto', {
    body: { operation: 'decrypt', value: ciphertext, field },
  });
  if (error) {
    throw new Error(`PII decryption failed for field "${field}": ${error.message}`);
  }
  if (data?.plaintext === undefined || data.plaintext === null) {
    throw new Error(`PII decryption returned no plaintext for field "${field}"`);
  }
  return data.plaintext;
}

/**
 * Compute HMAC-SHA256 blind index for searchable PII (email) via the pii-crypto Edge Function.
 * The HMAC key is fixed and never rotated to preserve index stability.
 * @param value - The value to hash
 * @param field - Field name used for audit logging
 * @returns Hex HMAC-SHA256 digest for use as a blind search index
 */
export async function hmacPII(value: string, field: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<HmacResponse>('pii-crypto', {
    body: { operation: 'hmac', value, field },
  });
  if (error) {
    throw new Error(`PII HMAC failed for field "${field}": ${error.message}`);
  }
  if (!data?.digest) {
    throw new Error(`PII HMAC returned no digest for field "${field}"`);
  }
  return data.digest;
}

/**
 * Encrypt all PII fields from a volunteer application in parallel.
 * @param params - The PII fields to encrypt
 * @returns Encrypted DB column values ready for insert
 */
export async function encryptVolunteerApplicationPII(params: {
  fullName: string;
  email: string;
  phone?: string;
}): Promise<{
  full_name_encrypted: string;
  email_encrypted: string;
  email_hmac: string;
  phone_encrypted?: string;
}> {
  const encryptPhone = params.phone !== undefined && params.phone !== '';

  const promises: [
    Promise<string>,
    Promise<string>,
    Promise<string>,
    Promise<string | undefined>,
  ] = [
    encryptPII(params.fullName, 'full_name'),
    encryptPII(params.email, 'email'),
    hmacPII(params.email, 'email'),
    encryptPhone ? encryptPII(params.phone as string, 'phone') : Promise.resolve(undefined),
  ];

  const [full_name_encrypted, email_encrypted, email_hmac, phone_encrypted] =
    await Promise.all(promises);

  return {
    full_name_encrypted,
    email_encrypted,
    email_hmac,
    ...(phone_encrypted !== undefined && { phone_encrypted }),
  };
}

/**
 * Encrypt the PII blob for a user profile.
 * Contact (email, phone) and address fields are extracted from meta and stored
 * in the dedicated pii_encrypted column as an encrypted JSON blob.
 * @param pii - The PII fields to encrypt
 * @returns Ciphertext string for storage in profiles.pii_encrypted
 */
export function encryptProfilePII(pii: ProfilePII): Promise<string> {
  const piiJson = JSON.stringify(pii);
  return encryptPII(piiJson, 'profile_pii');
}

/**
 * Decrypt the PII blob from a user profile.
 * @param ciphertext - Encrypted profile PII from profiles.pii_encrypted
 * @returns Parsed PII object with contact and address fields
 */
export async function decryptProfilePII(ciphertext: string): Promise<ProfilePII> {
  const plaintext = await decryptPII(ciphertext, 'profile_pii');
  return JSON.parse(plaintext) as ProfilePII;
}
