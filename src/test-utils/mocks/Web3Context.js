/**
 * Mock implementation of Web3Context for testing
 */
import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";

const mockValue = {
  provider: null,
  signer: null,
  address: null,
  chainId: 1287,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => {
    /* no-op mock for testing */
  },
  disconnect: async () => {
    /* no-op mock for testing */
  },
  switchChain: async () => {
    /* no-op mock for testing */
  },
};

const Web3Context = createContext(mockValue);

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) =>
  React.createElement(Web3Context.Provider, { value: mockValue }, children);

Web3Provider.propTypes = {
  children: PropTypes.node.isRequired,
};
