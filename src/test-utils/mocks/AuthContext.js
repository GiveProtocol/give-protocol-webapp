/**
 * Mock implementation of AuthContext for testing
 */
import React, { createContext, useContext } from "react";

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

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) =>
  React.createElement(AuthContext.Provider, { value: mockValue }, children);
