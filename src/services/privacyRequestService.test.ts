import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  supabase,
  setMockResult,
  resetMockState,
} from '@/test-utils/supabaseMock';
import type {
  ExportRequestResult,
  ExportStatusResult,
  ErasureRequestResult,
} from './privacyRequestService';

// The supabase and env modules are remapped by jest moduleNameMapper;
// no jest.mock() calls needed for those.

const MOCK_TOKEN = 'mock-access-token';
const MOCK_REQUEST_ID = 'abcd1234-0000-0000-0000-000000000001';

/** Set up authenticated session on the supabase mock. */
function mockAuthenticatedSession(): void {
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: { access_token: MOCK_TOKEN } },
    error: null,
  });
}

/** Set up unauthenticated session on the supabase mock. */
function mockNoSession(): void {
  (supabase.auth.getSession as jest.Mock).mockResolvedValue({
    data: { session: null },
    error: null,
  });
}

/** Helper to mock global.fetch with a specific status and body. */
function mockFetch(status: number, body: Record<string, unknown>): jest.Mock {
  const mockFn = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  }) as jest.Mock;
  global.fetch = mockFn as unknown as typeof fetch;
  return mockFn;
}

describe('requestDataExport', () => {
  let importedModule: typeof import('./privacyRequestService');

  beforeEach(async () => {
    resetMockState();
    mockAuthenticatedSession();
    importedModule = await import('./privacyRequestService');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return export result on success', async () => {
    mockFetch(202, {
      request_id: MOCK_REQUEST_ID,
      status: 'ready',
      download_url: 'https://signed.url/export.json',
      expires_at: '2026-04-08T00:00:00Z',
    });

    const result = await importedModule.requestDataExport();

    expect(result.request_id).toBe(MOCK_REQUEST_ID);
    expect(result.status).toBe('ready');
    expect(result.download_url).toBe('https://signed.url/export.json');
  });

  it('should throw when rate limited (429)', async () => {
    mockFetch(429, {
      error: 'Rate limit exceeded. You may request one export per 30 days.',
      next_allowed_at: '2026-05-07T00:00:00Z',
    });

    await expect(importedModule.requestDataExport()).rejects.toThrow('Rate limit exceeded');
  });

  it('should throw when not authenticated', async () => {
    mockNoSession();

    await expect(importedModule.requestDataExport()).rejects.toThrow('Not authenticated');
  });

  it('should throw with server error message on 500', async () => {
    mockFetch(500, { error: 'Failed to generate export file' });

    await expect(importedModule.requestDataExport()).rejects.toThrow('Failed to generate export file');
  });
});

describe('getExportStatus', () => {
  let importedModule: typeof import('./privacyRequestService');

  beforeEach(async () => {
    resetMockState();
    mockAuthenticatedSession();
    importedModule = await import('./privacyRequestService');
  });

  it('should return status and download URL for ready request', async () => {
    mockFetch(200, {
      request_id: MOCK_REQUEST_ID,
      status: 'ready',
      download_url: 'https://signed.url/export.json',
      expires_at: '2026-04-08T00:00:00Z',
    });

    const result: ExportStatusResult = await importedModule.getExportStatus(MOCK_REQUEST_ID);

    expect(result.status).toBe('ready');
    expect(result.download_url).toBeDefined();
  });

  it('should return pending status for in-progress request', async () => {
    mockFetch(200, {
      request_id: MOCK_REQUEST_ID,
      status: 'pending',
      requested_at: '2026-04-07T00:00:00Z',
    });

    const result: ExportStatusResult = await importedModule.getExportStatus(MOCK_REQUEST_ID);
    expect(result.status).toBe('pending');
    expect(result.download_url).toBeUndefined();
  });

  it('should throw when request not found (404)', async () => {
    mockFetch(404, { error: 'Export request not found' });

    await expect(importedModule.getExportStatus('nonexistent')).rejects.toThrow('Export request not found');
  });
});

describe('requestAccountErasure', () => {
  let importedModule: typeof import('./privacyRequestService');

  beforeEach(async () => {
    resetMockState();
    mockAuthenticatedSession();
    importedModule = await import('./privacyRequestService');
  });

  it('should return erasure request on success', async () => {
    const deletionDate = '2026-05-07T00:00:00Z';
    mockFetch(202, {
      request_id: MOCK_REQUEST_ID,
      status: 'pending',
      scheduled_deletion_date: deletionDate,
      message: 'Your account is scheduled for deletion',
      blockchain_notice: 'Your volunteer verification records are permanent.',
    });

    const result: ErasureRequestResult = await importedModule.requestAccountErasure('Testing');

    expect(result.request_id).toBe(MOCK_REQUEST_ID);
    expect(result.status).toBe('pending');
    expect(result.scheduled_deletion_date).toBe(deletionDate);
    expect(result.blockchain_notice).toBeDefined();
  });

  it('should throw conflict when erasure already pending (409)', async () => {
    mockFetch(409, {
      error: 'An erasure request is already pending for your account.',
      existing_request_id: MOCK_REQUEST_ID,
    });

    await expect(importedModule.requestAccountErasure()).rejects.toThrow(
      'An erasure request is already pending',
    );
  });

  it('should include confirm: true in request body', async () => {
    const fetchMock = mockFetch(202, {
      request_id: MOCK_REQUEST_ID,
      status: 'pending',
      scheduled_deletion_date: '2026-05-07T00:00:00Z',
    });

    await importedModule.requestAccountErasure('my reason');

    const fetchCall = fetchMock.mock.calls[0] as [string, { body: string }];
    const body = JSON.parse(fetchCall[1].body) as { confirm: boolean; reason: string };
    expect(body.confirm).toBe(true);
    expect(body.reason).toBe('my reason');
  });
});

describe('cancelErasureRequest', () => {
  let importedModule: typeof import('./privacyRequestService');

  beforeEach(async () => {
    resetMockState();
    mockAuthenticatedSession();
    importedModule = await import('./privacyRequestService');
  });

  it('should return cancelled status on success', async () => {
    mockFetch(200, {
      request_id: MOCK_REQUEST_ID,
      status: 'cancelled',
      message: 'Your account deletion request has been cancelled.',
    });

    const result: ErasureRequestResult = await importedModule.cancelErasureRequest(MOCK_REQUEST_ID);

    expect(result.status).toBe('cancelled');
    expect(result.request_id).toBe(MOCK_REQUEST_ID);
  });

  it('should throw when request not found (404)', async () => {
    mockFetch(404, { error: 'Erasure request not found' });

    await expect(importedModule.cancelErasureRequest('bad-id')).rejects.toThrow(
      'Erasure request not found',
    );
  });

  it('should throw when cooling-off period has passed (409)', async () => {
    mockFetch(409, {
      error: 'The cooling-off period has passed. This erasure request can no longer be cancelled.',
    });

    await expect(importedModule.cancelErasureRequest(MOCK_REQUEST_ID)).rejects.toThrow(
      'cooling-off period',
    );
  });
});

describe('getActiveErasureRequest', () => {
  let importedModule: typeof import('./privacyRequestService');

  beforeEach(async () => {
    resetMockState();
    importedModule = await import('./privacyRequestService');
  });

  it('should return pending erasure request when one exists', async () => {
    setMockResult('erasure_requests', {
      data: {
        id: MOCK_REQUEST_ID,
        status: 'pending',
        scheduled_deletion_date: '2026-05-07T00:00:00Z',
        requested_at: '2026-04-07T00:00:00Z',
      },
      error: null,
    });

    const result = await importedModule.getActiveErasureRequest();

    expect(result).not.toBeNull();
    expect(result?.id).toBe(MOCK_REQUEST_ID);
    expect(result?.status).toBe('pending');
  });

  it('should return null when no active erasure request exists', async () => {
    setMockResult('erasure_requests', { data: null, error: null });

    const result = await importedModule.getActiveErasureRequest();
    expect(result).toBeNull();
  });

  it('should throw on database error', async () => {
    setMockResult('erasure_requests', {
      data: null,
      error: { message: 'DB error' },
    });

    await expect(importedModule.getActiveErasureRequest()).rejects.toThrow(
      'Failed to fetch erasure request',
    );
  });
});

describe('getMostRecentExportRequest', () => {
  let importedModule: typeof import('./privacyRequestService');

  beforeEach(async () => {
    resetMockState();
    importedModule = await import('./privacyRequestService');
  });

  it('should return most recent export request when one exists', async () => {
    setMockResult('export_requests', {
      data: {
        id: MOCK_REQUEST_ID,
        status: 'ready',
        requested_at: '2026-04-07T00:00:00Z',
        completed_at: '2026-04-07T00:01:00Z',
      },
      error: null,
    });

    const result = await importedModule.getMostRecentExportRequest();

    expect(result).not.toBeNull();
    expect(result?.id).toBe(MOCK_REQUEST_ID);
    expect(result?.status).toBe('ready');
  });

  it('should return null when no export requests exist', async () => {
    setMockResult('export_requests', { data: null, error: null });

    const result = await importedModule.getMostRecentExportRequest();
    expect(result).toBeNull();
  });

  it('should throw on database error', async () => {
    setMockResult('export_requests', {
      data: null,
      error: { message: 'Permission denied' },
    });

    await expect(importedModule.getMostRecentExportRequest()).rejects.toThrow(
      'Failed to fetch export request',
    );
  });
});
