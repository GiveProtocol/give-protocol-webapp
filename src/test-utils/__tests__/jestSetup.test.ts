import { commonMocks, createHookMocks } from '../jestSetup';

describe('jestSetup', () => {
  describe('commonMocks', () => {
    it('provides logger mock with expected methods', () => {
      expect(commonMocks.logger.error).toBeInstanceOf(Function);
      expect(commonMocks.logger.info).toBeInstanceOf(Function);
      expect(commonMocks.logger.warn).toBeInstanceOf(Function);
    });

    it('formatDate mock formats dates correctly', () => {
      const result = commonMocks.formatDate('2024-01-15');
      expect(result).toBe('1/15/2024');
    });

    it('shortenAddress mock shortens addresses correctly', () => {
      const address = '0x1234567890123456789012345678901234567890';
      const result = commonMocks.shortenAddress(address);
      expect(result).toBe('0x1234...7890');
    });
  });

  describe('createHookMocks', () => {
    it('creates web3 mock with expected properties', () => {
      const mocks = createHookMocks();
      
      expect(mocks.web3).toEqual({
        address: null,
        chainId: null,
        isConnected: false,
        connect: expect.any(Function),
        disconnect: expect.any(Function),
        switchChain: expect.any(Function),
      });
    });

    it('creates auth mock with expected properties', () => {
      const mocks = createHookMocks();
      
      expect(mocks.auth).toEqual({
        user: null,
        signOut: expect.any(Function),
      });
    });

    it('creates wallet mock with expected properties', () => {
      const mocks = createHookMocks();
      
      expect(mocks.wallet.getInstalledWallets).toBeInstanceOf(Function);
      expect(mocks.wallet.connectWallet).toBeInstanceOf(Function);
      
      const wallets = mocks.wallet.getInstalledWallets();
      expect(wallets).toEqual([
        { name: 'MetaMask', id: 'metamask' },
        { name: 'WalletConnect', id: 'walletconnect' },
      ]);
    });

    it('wallet.getInstalledWallets returns correct wallet list', () => {
      const mocks = createHookMocks();
      
      // Call the function to cover the lines inside it
      const result = mocks.wallet.getInstalledWallets();
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: 'MetaMask', id: 'metamask' });
      expect(result[1]).toEqual({ name: 'WalletConnect', id: 'walletconnect' });
    });

    it('creates walletAlias mock with expected properties', () => {
      const mocks = createHookMocks();
      
      expect(mocks.walletAlias).toEqual({
        alias: null,
        aliases: {},
        isLoading: false,
        loading: false,
        error: null,
        setWalletAlias: expect.any(Function),
        deleteWalletAlias: expect.any(Function),
      });
    });

    it('creates volunteerVerification mock with expected properties', () => {
      const mocks = createHookMocks();
      
      expect(mocks.volunteerVerification).toEqual({
        verifyHours: expect.any(Function),
        acceptApplication: expect.any(Function),
        loading: false,
        error: null,
      });
    });

    it('creates translation mock with expected functionality', () => {
      const mocks = createHookMocks();
      
      expect(mocks.translation.t).toBeInstanceOf(Function);
      expect(mocks.translation.t('key')).toBe('key');
      expect(mocks.translation.t('key', 'fallback')).toBe('fallback');
    });

    it('translation.t function works correctly with various inputs', () => {
      const mocks = createHookMocks();
      
      // Test with just key
      expect(mocks.translation.t('test.key')).toBe('test.key');
      
      // Test with key and fallback
      expect(mocks.translation.t('test.key', 'Default Text')).toBe('Default Text');
      
      // Test with empty key
      expect(mocks.translation.t('')).toBe('');
      
      // Test with empty fallback
      expect(mocks.translation.t('key', '')).toBe('');
      
      // Test with undefined fallback
      expect(mocks.translation.t('key', undefined)).toBe('key');
    });
  });
});
