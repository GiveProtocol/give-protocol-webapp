/**
 * Mock implementation of AuthContext for testing
 */
import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";

const mockValue = {
  user: null,
  loading: false,
  error: null,
  userType: null,
  login: async () => {
    /* no-op mock for testing */
  },
  loginWithGoogle: async () => {
    /* no-op mock for testing */
  },
  logout: async () => {
    /* no-op mock for testing */
  },
  resetPassword: async () => {
    /* no-op mock for testing */
  },
  refreshSession: async () => {
    /* no-op mock for testing */
  },
  register: async () => {
    /* no-op mock for testing */
  },
  sendUsernameReminder: async () => {
    /* no-op mock for testing */
  },
};

const AuthContext = createContext(mockValue);

/**
 * Mock useAuth hook that returns the mock auth context value
 * @returns The mock auth context value
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Mock AuthProvider component that wraps children with the mock auth context
 * @param props - Component props
 * @param props.children - Child elements to render within the provider
 * @returns A React element wrapping children with the mock auth context
 */
export const AuthProvider = ({ children }) =>
  React.createElement(AuthContext.Provider, { value: mockValue }, children);

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
