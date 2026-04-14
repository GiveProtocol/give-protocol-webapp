// Mock for @/utils/validation
// Mapped via moduleNameMapper — all exports are jest.fn() for per-test overrides.
import { jest } from "@jest/globals";

export const validateEmail = jest.fn((email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
);
export const validatePassword = jest.fn(
  (password) => typeof password === "string" && password.length >= 8,
);
export const validateRequired = jest.fn(
  (value) => value !== "" && value !== null && value !== undefined,
);
export const validateName = jest.fn(
  (name) => typeof name === "string" && name.trim().length >= 2,
);
export const validateUrl = jest.fn((url) => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
});
export const validatePhoneNumber = jest.fn(
  (phone) => typeof phone === "string" && phone.replace(/\D/g, "").length >= 7,
);
export const validateAmount = jest.fn((amount) => amount > 0);
export const sanitizeInput = jest.fn((input) => input);
export const validateAuthInput = jest.fn();
export const validateFileUpload = jest.fn();
export const isValidAmount = jest.fn((amount) => amount > 0);
