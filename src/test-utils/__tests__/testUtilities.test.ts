import React from 'react';
import { testValidCases, testInvalidCases } from '../validationTestData';
import { expectBlockchainLink, renderWithRouter } from '../testHelpers';
import { commonMocks, createHookMocks, componentMocks } from '../jestSetup';
import { jest } from '@jest/globals';

describe('Test Utilities', () => {
  describe('validationTestData', () => {
    it('testValidCases should call validator for each case', () => {
      const mockValidator = jest.fn().mockReturnValue(true);
      const testCases = ['test1', 'test2', { value: 'test3' }];
      
      testValidCases(mockValidator, testCases);
      
      expect(mockValidator).toHaveBeenCalledTimes(3);
      expect(mockValidator).toHaveBeenCalledWith('test1');
      expect(mockValidator).toHaveBeenCalledWith('test2');
      expect(mockValidator).toHaveBeenCalledWith('test3');
    });

    it('testInvalidCases should call validator for each case', () => {
      const mockValidator = jest.fn().mockReturnValue(false);
      const testCases = ['invalid1', { value: 'invalid2' }];
      
      testInvalidCases(mockValidator, testCases);
      
      expect(mockValidator).toHaveBeenCalledTimes(2);
      expect(mockValidator).toHaveBeenCalledWith('invalid1');
      expect(mockValidator).toHaveBeenCalledWith('invalid2');
    });
  });

  describe('testHelpers', () => {
    it('expectBlockchainLink should validate link attributes', () => {
      // Create a mock element with proper typing
      interface MockElement {
        toHaveAttribute: jest.Mock;
      }
      
      const mockElement: MockElement = {
        toHaveAttribute: jest.fn(),
      };
      
      // Mock the expect function
      const originalExpect = global.expect;
      global.expect = jest.fn().mockReturnValue(mockElement);
      
      expectBlockchainLink(mockElement as unknown as HTMLElement, 'test-hash');
      
      global.expect = originalExpect;
      expect(global.expect).toHaveBeenCalledWith(mockElement);
    });

    it('renderWithRouter should render component with router context', () => {
      const TestComponent = React.createElement('div', {}, 'Test');
      const result = renderWithRouter(TestComponent);
      expect(result).toBeDefined();
    });
  });

  describe('jestSetup', () => {
    it('commonMocks should provide standard mock functions', () => {
      expect(commonMocks.logger.error).toBeInstanceOf(Function);
      expect(commonMocks.formatDate).toBeInstanceOf(Function);
      expect(commonMocks.shortenAddress).toBeInstanceOf(Function);
    });

    it('createHookMocks should return hook mock objects', () => {
      const hooks = createHookMocks();
      expect(hooks.web3.connect).toBeInstanceOf(Function);
      expect(hooks.auth.signOut).toBeInstanceOf(Function);
      expect(hooks.walletAlias.setWalletAlias).toBeInstanceOf(Function);
    });

    it('componentMocks should provide React component mocks', () => {
      expect(componentMocks.Button).toBeInstanceOf(Function);
      expect(componentMocks.Input).toBeInstanceOf(Function);
      expect(componentMocks.Card).toBeInstanceOf(Function);
    });
  });
});