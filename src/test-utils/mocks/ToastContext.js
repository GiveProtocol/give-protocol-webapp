/**
 * Mock implementation of ToastContext for testing
 */
import React, { createContext, useContext } from "react";

const mockValue = {
  showToast: () => {
    /* no-op mock for testing */
  },
};

export const ToastContext = createContext(mockValue);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) =>
  React.createElement(ToastContext.Provider, { value: mockValue }, children);
