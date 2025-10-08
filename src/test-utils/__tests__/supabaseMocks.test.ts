import { jest } from '@jest/globals';
import {
  createMockSupabaseQuery,
  createMockSupabaseClient,
  setupSupabaseMocks,
  mockCharityData,
  mockDonationData,
  mockVolunteerData
} from '../supabaseMocks';

describe('supabaseMocks', () => {
  describe('createMockSupabaseQuery', () => {
    it('creates query response with default values', () => {
      const result = createMockSupabaseQuery();
      
      expect(result).toEqual({
        data: [],
        error: null
      });
    });

    it('creates query response with custom data', () => {
      const customData = [{ id: 1, name: 'Test' }];
      const result = createMockSupabaseQuery(customData);
      
      expect(result).toEqual({
        data: customData,
        error: null
      });
    });

    it('creates query response with single item data', () => {
      const singleItem = { id: 1, name: 'Test' };
      const result = createMockSupabaseQuery(singleItem);
      
      expect(result).toEqual({
        data: singleItem,
        error: null
      });
    });

    it('creates query response with null data', () => {
      const result = createMockSupabaseQuery(null);
      
      expect(result).toEqual({
        data: null,
        error: null
      });
    });

    it('creates query response with error', () => {
      const error = { message: 'Database error' };
      const result = createMockSupabaseQuery(null, error);
      
      expect(result).toEqual({
        data: null,
        error
      });
    });
  });

  describe('createMockSupabaseClient', () => {
    it('creates mock client with from method', () => {
      const client = createMockSupabaseClient();
      
      expect(client.from).toBeInstanceOf(Function);
    });

    it('from method returns query builder with select', () => {
      const client = createMockSupabaseClient();
      const queryBuilder = client.from('test_table');
      
      expect(queryBuilder.select).toBeInstanceOf(Function);
      expect(queryBuilder.insert).toBeInstanceOf(Function);
      expect(queryBuilder.update).toBeInstanceOf(Function);
      expect(queryBuilder.delete).toBeInstanceOf(Function);
    });

    it('select method returns chainable methods', () => {
      const client = createMockSupabaseClient();
      const selectResult = client.from('test_table').select();
      
      expect(selectResult.eq).toBeInstanceOf(Function);
      expect(selectResult.order).toBeInstanceOf(Function);
      expect(selectResult.single).toBeInstanceOf(Function);
    });

    it('eq method returns nested chainable methods', async () => {
      const client = createMockSupabaseClient();
      const eqResult = client.from('test_table').select().eq('id', '123');
      
      expect(eqResult.eq).toBeInstanceOf(Function);
      expect(eqResult.single).toBeInstanceOf(Function);
      expect(eqResult.order).toBeInstanceOf(Function);
      expect(eqResult.in).toBeInstanceOf(Function);
      
      // Test nested eq
      const nestedEq = await eqResult.eq('status', 'active');
      expect(nestedEq).toEqual({ data: [], error: null });
      
      // Test single
      const single = await eqResult.single();
      expect(single).toEqual({ data: null, error: null });
      
      // Test order
      const ordered = await eqResult.order('created_at');
      expect(ordered).toEqual({ data: [], error: null });
      
      // Test in with order
      const inResult = eqResult.in('ids', ['1', '2']);
      expect(inResult.order).toBeInstanceOf(Function);
      const inOrdered = await inResult.order('name');
      expect(inOrdered).toEqual({ data: [], error: null });
    });

    it('insert method returns proper methods', async () => {
      const client = createMockSupabaseClient();
      const insertResult = client.from('test_table').insert({ name: 'Test' });
      
      expect(insertResult.select).toBeInstanceOf(Function);
      expect(insertResult.single).toBeInstanceOf(Function);
      
      const selectResult = await insertResult.select();
      expect(selectResult).toEqual({ data: [], error: null });
      
      const singleResult = await insertResult.single();
      expect(singleResult).toEqual({ data: null, error: null });
    });

    it('update method returns chainable eq', async () => {
      const client = createMockSupabaseClient();
      const updateResult = client.from('test_table').update({ name: 'Updated' });
      
      expect(updateResult.eq).toBeInstanceOf(Function);
      
      const eqResult = updateResult.eq('id', '123');
      expect(eqResult.select).toBeInstanceOf(Function);
      
      const selected = await eqResult.select();
      expect(selected).toEqual({ data: [], error: null });
    });

    it('delete method returns chainable eq', async () => {
      const client = createMockSupabaseClient();
      const deleteResult = client.from('test_table').delete();
      
      expect(deleteResult.eq).toBeInstanceOf(Function);
      
      const eqResult = await deleteResult.eq('id', '123');
      expect(eqResult).toEqual({ data: [], error: null });
    });

    it('order method resolves with data', async () => {
      const client = createMockSupabaseClient();
      const result = await client.from('test_table').select().order('created_at', { ascending: false });
      
      expect(result).toEqual({ data: [], error: null });
    });

    it('single method resolves with null data', async () => {
      const client = createMockSupabaseClient();
      const result = await client.from('test_table').select().single();
      
      expect(result).toEqual({ data: null, error: null });
    });

    it('applies custom overrides', () => {
      const client = createMockSupabaseClient({
        select: { customMethod: jest.fn() }
      });
      
      const queryBuilder = client.from('test_table');
      const selectResult = queryBuilder.select();
      
      expect(selectResult.customMethod).toBeInstanceOf(Function);
    });

    it('applies nested overrides for selectEq', () => {
      const customData = { data: [{ id: '123' }], error: null };
      const client = createMockSupabaseClient({
        selectEq: { customData: jest.fn(() => customData) }
      });
      
      const eqResult = client.from('test_table').select().eq('id', '123');
      expect(eqResult.customData).toBeInstanceOf(Function);
    });

    it('applies overrides for insert operations', () => {
      const client = createMockSupabaseClient({
        insert: { customInsert: jest.fn() }
      });
      
      const insertResult = client.from('test_table').insert({ data: 'test' });
      expect(insertResult.customInsert).toBeInstanceOf(Function);
    });

    it('applies overrides for update operations', () => {
      const client = createMockSupabaseClient({
        update: { customUpdate: jest.fn() },
        updateEq: { customUpdateEq: jest.fn() }
      });
      
      const updateResult = client.from('test_table').update({ data: 'test' });
      expect(updateResult.customUpdate).toBeInstanceOf(Function);
      
      const eqResult = updateResult.eq('id', '123');
      expect(eqResult.customUpdateEq).toBeInstanceOf(Function);
    });

    it('applies overrides for delete operations', () => {
      const client = createMockSupabaseClient({
        deleteEq: { customDeleteEq: jest.fn() }
      });
      
      const deleteResult = client.from('test_table').delete();
      const eqResult = deleteResult.eq('id', '123');
      expect(eqResult.customDeleteEq).toBeInstanceOf(Function);
    });

    it('applies client-level overrides', () => {
      const client = createMockSupabaseClient({
        client: { auth: { getUser: jest.fn() } }
      });
      
      expect(client.auth).toBeDefined();
      expect(client.auth.getUser).toBeInstanceOf(Function);
    });

    it('applies from-level overrides', () => {
      const client = createMockSupabaseClient({
        from: { customFrom: jest.fn() }
      });
      
      const fromResult = client.from('test_table');
      expect(fromResult.customFrom).toBeInstanceOf(Function);
    });
  });

  describe('setupSupabaseMocks', () => {
    it('sets up supabase mocks', () => {
      setupSupabaseMocks();
      
      // Verify function runs without errors
      expect(jest.mock).toBeDefined();
    });

    it('accepts custom data overrides', () => {
      const customOverrides = {
        select: { data: [{ id: 1 }] }
      };
      
      setupSupabaseMocks(customOverrides);
      
      // Verify function runs without errors with custom data
      expect(jest.mock).toBeDefined();
    });
  });

  describe('mockCharityData', () => {
    it('contains expected charity data structure', () => {
      expect(mockCharityData).toHaveLength(2);
      expect(mockCharityData[0]).toEqual({
        id: 'charity-1',
        name: 'Test Charity 1',
        description: 'A test charity',
        category: 'education',
        country: 'US',
        verified: true,
        created_at: '2024-01-01T00:00:00Z'
      });
    });
  });

  describe('mockDonationData', () => {
    it('contains expected donation data structure', () => {
      expect(mockDonationData).toHaveLength(2);
      expect(mockDonationData[0]).toEqual({
        id: 'donation-1',
        amount: '100.00',
        donor_id: 'donor-1',
        charity_id: 'charity-1',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z'
      });
    });
  });

  describe('mockVolunteerData', () => {
    it('contains expected volunteer data structure', () => {
      expect(mockVolunteerData).toHaveLength(1);
      expect(mockVolunteerData[0]).toEqual({
        id: 'volunteer-1',
        user_id: 'user-1',
        charity_id: 'charity-1',
        hours: 10,
        status: 'verified',
        created_at: '2024-01-01T00:00:00Z'
      });
    });
  });
});