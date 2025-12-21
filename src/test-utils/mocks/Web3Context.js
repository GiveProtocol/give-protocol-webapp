/**
 * Mock implementation of Web3Context for testing
 */
import React, { createContext, useContext } from 'react';

const mockValue = {
  provider: null,
  signer: null,
  address: null,
  chainId: 1287,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: async () => {},
  switchChain: async () => {},
};

const Web3Context = createContext(mockValue);

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => (
  React.createElement(Web3Context.Provider, { value: mockValue }, children)
);
