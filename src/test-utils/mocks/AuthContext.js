/**
 * Mock implementation of AuthContext for testing
 */
import React, { createContext, useContext } from 'react';

const mockValue = {
  user: null,
  loading: false,
  error: null,
  userType: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  refreshSession: async () => {},
  register: async () => {},
  sendUsernameReminder: async () => {},
};

const AuthContext = createContext(mockValue);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => (
  React.createElement(AuthContext.Provider, { value: mockValue }, children)
);
