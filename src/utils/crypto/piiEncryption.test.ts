import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { resetMockState } from '@/test-utils/supabaseMock';
import {
  encryptPII,
  decryptPII,
  hmacPII,
  encryptVolunteerApplicationPII,
  encryptProfilePII,
  decryptProfilePII,
} from './piiEncryption';
import { supabase } from '@/lib/supabase';

const mockInvoke = supabase.functions.invoke as jest.Mock;

beforeEach(() => {
  resetMockState();
  jest.clearAllMocks();
});

describe('encryptPII', () => {
  it('returns ciphertext on success', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { ciphertext: 'v1:abc:def' },
      error: null,
    });

    const result = await encryptPII('John Doe', 'full_name');

    expect(result).toBe('v1:abc:def');
    expect(mockInvoke).toHaveBeenCalledWith('pii-crypto', {
      body: { operation: 'encrypt', value: 'John Doe', field: 'full_name' },
    });
  });

  it('throws when invoke returns an error', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Function error' },
    });

    await expect(encryptPII('test', 'email')).rejects.toThrow(
      'PII encryption failed for field "email": Function error',
    );
  });

  it('throws when ciphertext is missing from response', async () => {
    mockInvoke.mockResolvedValueOnce({ data: {}, error: null });

    await expect(encryptPII('test', 'email')).rejects.toThrow(
      'PII encryption returned no ciphertext for field "email"',
    );
  });
});

describe('decryptPII', () => {
  it('returns plaintext on success', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { plaintext: 'John Doe' },
      error: null,
    });

    const result = await decryptPII('v1:abc:def', 'full_name');

    expect(result).toBe('John Doe');
    expect(mockInvoke).toHaveBeenCalledWith('pii-crypto', {
      body: { operation: 'decrypt', value: 'v1:abc:def', field: 'full_name' },
    });
  });

  it('handles empty string plaintext as valid result', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { plaintext: '' },
      error: null,
    });

    const result = await decryptPII('v1:abc:def', 'phone');

    expect(result).toBe('');
  });

  it('throws when invoke returns an error', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Unauthorized' },
    });

    await expect(decryptPII('v1:abc:def', 'email')).rejects.toThrow(
      'PII decryption failed for field "email": Unauthorized',
    );
  });

  it('throws when plaintext is absent from response', async () => {
    mockInvoke.mockResolvedValueOnce({ data: {}, error: null });

    await expect(decryptPII('v1:abc:def', 'email')).rejects.toThrow(
      'PII decryption returned no plaintext for field "email"',
    );
  });
});

describe('hmacPII', () => {
  it('returns hex digest on success', async () => {
    const hexDigest = 'a'.repeat(64);
    mockInvoke.mockResolvedValueOnce({
      data: { digest: hexDigest },
      error: null,
    });

    const result = await hmacPII('test@example.com', 'email');

    expect(result).toBe(hexDigest);
    expect(mockInvoke).toHaveBeenCalledWith('pii-crypto', {
      body: { operation: 'hmac', value: 'test@example.com', field: 'email' },
    });
  });

  it('throws when invoke returns an error', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Service unavailable' },
    });

    await expect(hmacPII('test@example.com', 'email')).rejects.toThrow(
      'PII HMAC failed for field "email": Service unavailable',
    );
  });

  it('throws when digest is missing from response', async () => {
    mockInvoke.mockResolvedValueOnce({ data: {}, error: null });

    await expect(hmacPII('test@example.com', 'email')).rejects.toThrow(
      'PII HMAC returned no digest for field "email"',
    );
  });
});

describe('encryptVolunteerApplicationPII', () => {
  it('encrypts all required fields and returns DB column values', async () => {
    mockInvoke
      .mockResolvedValueOnce({ data: { ciphertext: 'ct_name' }, error: null })
      .mockResolvedValueOnce({ data: { ciphertext: 'ct_email' }, error: null })
      .mockResolvedValueOnce({ data: { digest: 'hmac_email' }, error: null })
      .mockResolvedValueOnce({ data: { ciphertext: 'ct_phone' }, error: null });

    const result = await encryptVolunteerApplicationPII({
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-555-000-1234',
    });

    expect(result).toEqual({
      full_name_encrypted: 'ct_name',
      email_encrypted: 'ct_email',
      email_hmac: 'hmac_email',
      phone_encrypted: 'ct_phone',
    });
    expect(mockInvoke).toHaveBeenCalledTimes(4);
  });

  it('omits phone_encrypted when phone is not provided', async () => {
    mockInvoke
      .mockResolvedValueOnce({ data: { ciphertext: 'ct_name' }, error: null })
      .mockResolvedValueOnce({ data: { ciphertext: 'ct_email' }, error: null })
      .mockResolvedValueOnce({ data: { digest: 'hmac_email' }, error: null });

    const result = await encryptVolunteerApplicationPII({
      fullName: 'Jane Smith',
      email: 'jane@example.com',
    });

    expect(result).toEqual({
      full_name_encrypted: 'ct_name',
      email_encrypted: 'ct_email',
      email_hmac: 'hmac_email',
    });
    expect('phone_encrypted' in result).toBe(false);
    expect(mockInvoke).toHaveBeenCalledTimes(3);
  });

  it('omits phone_encrypted when phone is empty string', async () => {
    mockInvoke
      .mockResolvedValueOnce({ data: { ciphertext: 'ct_name' }, error: null })
      .mockResolvedValueOnce({ data: { ciphertext: 'ct_email' }, error: null })
      .mockResolvedValueOnce({ data: { digest: 'hmac_email' }, error: null });

    const result = await encryptVolunteerApplicationPII({
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '',
    });

    expect('phone_encrypted' in result).toBe(false);
  });
});

describe('encryptProfilePII', () => {
  it('serializes and encrypts the PII blob', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: { ciphertext: 'ct_profile' },
      error: null,
    });

    const result = await encryptProfilePII({
      contact: { email: 'user@example.com', phone: '+1-555-111-2222' },
      address: { city: 'Toronto', country: 'CA' },
    });

    expect(result).toBe('ct_profile');
    const callArg = (mockInvoke.mock.calls[0] as unknown[])[1] as {
      body: { operation: string; field: string; value: string };
    };
    expect(callArg.body.operation).toBe('encrypt');
    expect(callArg.body.field).toBe('profile_pii');
    const parsed = JSON.parse(callArg.body.value) as {
      contact: { email: string };
      address: { city: string };
    };
    expect(parsed.contact.email).toBe('user@example.com');
    expect(parsed.address.city).toBe('Toronto');
  });
});

describe('decryptProfilePII', () => {
  it('decrypts and parses the PII blob', async () => {
    const piiObj = {
      contact: { email: 'user@example.com', phone: '+1-555-111-2222' },
      address: { city: 'Toronto', country: 'CA' },
    };
    mockInvoke.mockResolvedValueOnce({
      data: { plaintext: JSON.stringify(piiObj) },
      error: null,
    });

    const result = await decryptProfilePII('ct_profile');

    expect(result).toEqual(piiObj);
  });

  it('throws when decryption fails', async () => {
    mockInvoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid ciphertext' },
    });

    await expect(decryptProfilePII('ct_bad')).rejects.toThrow(
      'PII decryption failed for field "profile_pii": Invalid ciphertext',
    );
  });
});
