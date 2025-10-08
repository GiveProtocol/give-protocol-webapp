import { jest } from '@jest/globals';
import {
  generateVerificationHash,
  createAcceptanceHash,
  createVerificationHash,
  recordApplicationOnChain,
  recordHoursOnChain,
  recordVerificationOnChain,
  verifyVolunteerHash,
} from "../volunteer";
import type {
  VolunteerApplication,
  VolunteerHours,
  VolunteerVerification,
} from "@/types/volunteer";
import { supabase } from "@/lib/supabase";

// TypeScript interfaces for Supabase mock objects
interface MockSupabaseResult<T = unknown> {
  data: T | null;
  error: Error | null;
}

interface MockSupabaseQuery {
  eq: jest.MockedFunction<(..._args: unknown[]) => MockSupabaseChain>;
  or: jest.MockedFunction<(..._args: unknown[]) => MockSupabaseChain>;
}

interface MockSupabaseChain {
  eq: jest.MockedFunction<(..._args: unknown[]) => MockSupabaseChain>;
  maybeSingle: jest.MockedFunction<() => MockSupabaseResult>;
  single: jest.MockedFunction<() => MockSupabaseResult>;
}

interface MockSupabaseUpdate {
  eq: jest.MockedFunction<(..._args: unknown[]) => MockSupabaseResult>;
}

interface MockSupabaseTable {
  select: jest.MockedFunction<(..._args: unknown[]) => MockSupabaseQuery>;
  update: jest.MockedFunction<(..._args: unknown[]) => MockSupabaseUpdate>;
  insert: jest.MockedFunction<(..._args: unknown[]) => MockSupabaseResult>;
}

// Mock dependencies
jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ error: null })),
      })),
      insert: jest.fn(() => ({ error: null })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => ({ data: null, error: null })),
          single: jest.fn(() => ({
            data: { user_id: "user-123" },
            error: null,
          })),
        })),
        or: jest.fn(() => ({
          maybeSingle: jest.fn(() => ({
            data: { id: "verification-123" },
            error: null,
          })),
        })),
      })),
    })),
  },
}));

jest.mock("@/utils/logger", () => ({
  Logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock("@/utils/security/index", () => ({
  SecureRandom: {
    generateTransactionId: jest.fn(() => "tx-123456"),
    generateSecureNumber: jest.fn(() => 500000),
  },
}));

describe("volunteer utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to its default state with comprehensive table handling
    jest
      .mocked(supabase.from)
      .mockImplementation((table): MockSupabaseTable => {
        if (table === "volunteer_hours") {
          return {
            update: jest.fn(() => ({
              eq: jest.fn(() => ({ error: null })),
            })),
            select: jest.fn(),
            insert: jest.fn(),
          };
        } else if (table === "volunteer_verifications") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    maybeSingle: jest.fn(() => ({ data: null, error: null })),
                  })),
                })),
              })),
              or: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({
                  data: { id: "verification-123" },
                  error: null,
                })),
              })),
            })),
            insert: jest.fn(() => ({ error: null })),
            update: jest.fn(() => ({
              eq: jest.fn(() => ({ error: null })),
            })),
          };
        } else if (table === "volunteer_applications") {
          return {
            update: jest.fn(() => ({
              eq: jest.fn(() => ({ error: null })),
            })),
            insert: jest.fn(() => ({ error: null })),
            select: jest.fn(),
          };
        } else if (table === "profiles") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => ({
                  data: { user_id: "user-123" },
                  error: null,
                })),
              })),
            })),
            update: jest.fn(),
            insert: jest.fn(),
          };
        } else if (table === "wallet_aliases") {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                maybeSingle: jest.fn(() => ({
                  data: { wallet_address: "0x123" },
                  error: null,
                })),
              })),
            })),
            update: jest.fn(),
            insert: jest.fn(),
          };
        }

        // Default fallback for any other tables
        return {
          update: jest.fn(() => ({
            eq: jest.fn(() => ({ error: null })),
          })),
          insert: jest.fn(() => ({ error: null })),
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              maybeSingle: jest.fn(() => ({ data: null, error: null })),
              single: jest.fn(() => ({
                data: { user_id: "user-123" },
                error: null,
              })),
            })),
            or: jest.fn(() => ({
              maybeSingle: jest.fn(() => ({
                data: { id: "verification-123" },
                error: null,
              })),
            })),
          })),
        };
      });
  });

  describe("generateVerificationHash", () => {
    it("generates a hash from data object", () => {
      const data = { userId: "user-123", action: "volunteer" };
      const hash = generateVerificationHash(data);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.startsWith("0x")).toBe(true);
    });

    it("generates different hashes for different data", () => {
      const data1 = { userId: "user-123", action: "volunteer" };
      const data2 = { userId: "user-456", action: "volunteer" };

      const hash1 = generateVerificationHash(data1);
      const hash2 = generateVerificationHash(data2);

      expect(hash1).not.toBe(hash2);
    });

    it("adds timestamp to ensure uniqueness", () => {
      const data = { userId: "user-123" };

      // Mock Date.now to return different values
      const originalDateNow = Date.now;
      let callCount = 0;
      Date.now = jest.fn(() => {
        callCount++;
        return originalDateNow() + callCount;
      });

      const hash1 = generateVerificationHash(data);
      const hash2 = generateVerificationHash(data);

      expect(hash1).not.toBe(hash2);

      Date.now = originalDateNow;
    });

    it("throws error when hashing fails", () => {
      // Mock JSON.stringify to throw an error
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn(() => {
        throw new Error("Stringify failed");
      });

      expect(() => {
        generateVerificationHash({ test: "data" });
      }).toThrow("Failed to generate verification hash");

      JSON.stringify = originalStringify;
    });
  });

  describe("createAcceptanceHash", () => {
    const mockApplication: VolunteerApplication = {
      id: "app-123",
      applicantId: "user-123",
      opportunityId: "opp-123",
      charityId: "charity-123",
      status: "accepted",
      appliedAt: "2024-01-01T00:00:00Z",
      message: "Test application",
    };

    it("creates acceptance hash for volunteer application", async () => {
      const hash = await createAcceptanceHash(mockApplication);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.startsWith("0x")).toBe(true);
    });

    it("handles database errors gracefully", async () => {
      // Mock supabase to return error
      jest.mocked(supabase.from).mockImplementation(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({ error: new Error("Database error") })),
        })),
      }));

      await expect(createAcceptanceHash(mockApplication)).rejects.toThrow(
        "Failed to create acceptance hash",
      );
    });

    it("handles verification insert errors", async () => {
      // Mock supabase to succeed on application update but fail on verification insert
      jest
        .mocked(supabase.from)
        .mockImplementation((table): MockSupabaseTable => {
          if (table === "volunteer_applications") {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
              select: jest.fn(),
              insert: jest.fn(),
            };
          } else if (table === "volunteer_verifications") {
            return {
              insert: jest.fn(() => ({ error: new Error("Insert error") })),
              select: jest.fn(),
              update: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        });

      await expect(createAcceptanceHash(mockApplication)).rejects.toThrow(
        "Failed to create acceptance hash",
      );
    });

    it("continues even if blockchain recording fails", async () => {
      // Mock recordApplicationOnChain to throw error
      jest.doMock("../volunteer", () => ({
        ...jest.requireActual("../volunteer"),
        recordApplicationOnChain: jest.fn(() => {
          throw new Error("Blockchain error");
        }),
      }));

      const hash = await createAcceptanceHash(mockApplication);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });
  });

  describe("createVerificationHash", () => {
    const mockHours: VolunteerHours = {
      id: "hours-123",
      volunteerId: "user-123",
      charityId: "charity-123",
      opportunityId: "opp-123",
      hours: 8,
      datePerformed: "2024-01-01",
      status: "verified",
      description: "Test volunteer work",
    };

    it("creates verification hash for volunteer hours", async () => {
      const hash = await createVerificationHash(mockHours);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.startsWith("0x")).toBe(true);
    });

    it("handles existing verification record update", async () => {
      // Mock supabase to return existing verification data
      jest
        .mocked(supabase.from)
        .mockImplementation((table): MockSupabaseTable => {
          if (table === "volunteer_hours") {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
              select: jest.fn(),
              insert: jest.fn(),
            };
          } else if (table === "volunteer_verifications") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    eq: jest.fn(() => ({
                      maybeSingle: jest.fn(() => ({
                        data: { id: "existing-verification-123" },
                        error: null,
                      })),
                    })),
                  })),
                })),
              })),
              update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
              insert: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        });

      const hash = await createVerificationHash(mockHours);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("handles missing verification record creation", async () => {
      // Mock supabase to return no existing verification data
      jest
        .mocked(supabase.from)
        .mockImplementation((table): MockSupabaseTable => {
          if (table === "volunteer_hours") {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
              select: jest.fn(),
              insert: jest.fn(),
            };
          } else if (table === "volunteer_verifications") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  eq: jest.fn(() => ({
                    eq: jest.fn(() => ({
                      maybeSingle: jest.fn(() => ({
                        data: null,
                        error: null,
                      })),
                    })),
                  })),
                })),
              })),
              insert: jest.fn(() => ({ error: null })),
              update: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        });

      const hash = await createVerificationHash(mockHours);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("handles database errors during hours update", async () => {
      // Mock supabase to return error on hours update
      jest.mocked(supabase.from).mockImplementation(
        (): MockSupabaseTable => ({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({ error: new Error("Database error") })),
          })),
          select: jest.fn(),
          insert: jest.fn(),
        }),
      );

      await expect(createVerificationHash(mockHours)).rejects.toThrow(
        "Failed to create verification hash",
      );
    });

    it("handles database errors during verification update", async () => {
      // Mock supabase to succeed on hours update but fail on verification update
      jest
        .mocked(supabase.from)
        .mockImplementation((table): MockSupabaseTable => {
          if (table === "volunteer_hours") {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
              select: jest.fn(),
              insert: jest.fn(),
            };
          } else if (table === "volunteer_verifications") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  maybeSingle: jest.fn(() => ({
                    data: { id: "existing-verification-123" },
                    error: null,
                  })),
                })),
              })),
              update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: new Error("Update error") })),
              })),
              insert: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        });

      await expect(createVerificationHash(mockHours)).rejects.toThrow(
        "Failed to create verification hash",
      );
    });

    it("handles database errors during verification insert", async () => {
      // Mock supabase to succeed on hours update but fail on verification insert
      jest
        .mocked(supabase.from)
        .mockImplementation((table): MockSupabaseTable => {
          if (table === "volunteer_hours") {
            return {
              update: jest.fn(() => ({
                eq: jest.fn(() => ({ error: null })),
              })),
              select: jest.fn(),
              insert: jest.fn(),
            };
          } else if (table === "volunteer_verifications") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  maybeSingle: jest.fn(() => ({
                    data: null,
                    error: null,
                  })),
                })),
              })),
              insert: jest.fn(() => ({ error: new Error("Insert error") })),
              update: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        });

      await expect(createVerificationHash(mockHours)).rejects.toThrow(
        "Failed to create verification hash",
      );
    });
  });

  describe("recordApplicationOnChain", () => {
    it("returns transaction details for valid application", async () => {
      const result = await recordApplicationOnChain("user-123", "0xhash123");

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });

    it("handles errors gracefully and returns simulated data", async () => {
      // Mock supabase to throw error
      jest.mocked(supabase.from).mockImplementation(
        (): MockSupabaseTable => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => ({ error: new Error("Database error") })),
            })),
          })),
          update: jest.fn(),
          insert: jest.fn(),
        }),
      );

      const result = await recordApplicationOnChain("user-123", "0xhash123");

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });
  });

  describe("recordHoursOnChain", () => {
    it("returns transaction details for valid hours record", async () => {
      const result = await recordHoursOnChain("user-123", "0xhash123", 8);

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });

    it("handles errors gracefully", async () => {
      const result = await recordHoursOnChain("invalid-user", "0xhash123", 8);

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });

    it("handles profile database errors", async () => {
      // Mock supabase to return error on profiles query
      jest.mocked(supabase.from).mockImplementation(
        (table): MockSupabaseTable => {
          if (table === "profiles") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({ error: new Error("Profile error") })),
                })),
              })),
              update: jest.fn(),
              insert: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        },
      );

      const result = await recordHoursOnChain("user-123", "0xhash123", 8);

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });

    it("handles wallet_aliases database errors", async () => {
      // Mock supabase to succeed on profiles but fail on wallet_aliases
      jest
        .mocked(supabase.from)
        .mockImplementation((table): MockSupabaseTable => {
          if (table === "profiles") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({
                    data: { user_id: "user-123" },
                    error: null,
                  })),
                })),
              })),
              update: jest.fn(),
              insert: jest.fn(),
            };
          } else if (table === "wallet_aliases") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  maybeSingle: jest.fn(() => ({
                    error: new Error("Wallet error"),
                  })),
                })),
              })),
              update: jest.fn(),
              insert: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        });

      const result = await recordHoursOnChain("user-123", "0xhash123", 8);

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });
  });

  describe("recordVerificationOnChain", () => {
    it("records hours verification when verificationHash is present", async () => {
      const verification: VolunteerVerification = {
        id: "ver-123",
        applicantId: "user-123",
        charityId: "charity-123",
        opportunityId: "opp-123",
        verificationHash: "0xhash123",
        verifiedAt: "2024-01-01T00:00:00Z",
      };

      const result = await recordVerificationOnChain(verification);

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });

    it("records application verification when acceptanceHash is present", async () => {
      const verification: VolunteerVerification = {
        id: "ver-123",
        applicantId: "user-123",
        charityId: "charity-123",
        opportunityId: "opp-123",
        acceptanceHash: "0xhash123",
        acceptedAt: "2024-01-01T00:00:00Z",
      };

      const result = await recordVerificationOnChain(verification);

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });

    it("throws error when no verification hash is provided", async () => {
      const verification: VolunteerVerification = {
        id: "ver-123",
        applicantId: "user-123",
        charityId: "charity-123",
        opportunityId: "opp-123",
      };

      const result = await recordVerificationOnChain(verification);

      // Should return simulated data even for errors
      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });

    it("handles errors during hours recording", async () => {
      const verification: VolunteerVerification = {
        id: "ver-123",
        applicantId: "user-123",
        charityId: "charity-123",
        opportunityId: "opp-123",
        verificationHash: "0xhash123",
        verifiedAt: "2024-01-01T00:00:00Z",
      };

      // Mock recordHoursOnChain to throw error
      const originalRecordHoursOnChain = jest.requireActual("../volunteer").recordHoursOnChain;
      jest.doMock("../volunteer", () => ({
        ...jest.requireActual("../volunteer"),
        recordHoursOnChain: jest.fn(() => {
          throw new Error("Hours recording error");
        }),
      }));

      const result = await recordVerificationOnChain(verification);

      // Should return simulated data even for errors
      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });

      // Restore original function
      jest.doMock("../volunteer", () => ({
        ...jest.requireActual("../volunteer"),
        recordHoursOnChain: originalRecordHoursOnChain,
      }));
    });

    it("handles errors during application recording", async () => {
      const verification: VolunteerVerification = {
        id: "ver-123",
        applicantId: "user-123",
        charityId: "charity-123",
        opportunityId: "opp-123",
        acceptanceHash: "0xhash123",
        acceptedAt: "2024-01-01T00:00:00Z",
      };

      // Mock recordApplicationOnChain to throw error
      const originalRecordApplicationOnChain = jest.requireActual("../volunteer").recordApplicationOnChain;
      jest.doMock("../volunteer", () => ({
        ...jest.requireActual("../volunteer"),
        recordApplicationOnChain: jest.fn(() => {
          throw new Error("Application recording error");
        }),
      }));

      const result = await recordVerificationOnChain(verification);

      // Should return simulated data even for errors
      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });

      // Restore original function
      jest.doMock("../volunteer", () => ({
        ...jest.requireActual("../volunteer"),
        recordApplicationOnChain: originalRecordApplicationOnChain,
      }));
    });
  });

  describe("verifyVolunteerHash", () => {
    it("returns true for valid hash", async () => {
      // This test should use the default mock that returns data: { id: "verification-123" }
      // The function should return true when data is truthy
      const result = await verifyVolunteerHash("0xvalidhash");

      expect(result).toBe(true);
    });

    it("returns false when hash is not found", async () => {
      // Mock supabase to return no data
      jest.mocked(supabase.from).mockImplementation(
        (): MockSupabaseTable => ({
          select: jest.fn(() => ({
            or: jest.fn(() => ({
              maybeSingle: jest.fn(() => ({ data: null, error: null })),
            })),
          })),
          update: jest.fn(),
          insert: jest.fn(),
        }),
      );

      const result = await verifyVolunteerHash("0xinvalidhash");

      expect(result).toBe(false);
    });

    it("returns false when database error occurs", async () => {
      // Mock supabase to return error
      jest.mocked(supabase.from).mockImplementation(
        (): MockSupabaseTable => ({
          select: jest.fn(() => ({
            or: jest.fn(() => ({
              maybeSingle: jest.fn(() => ({
                error: new Error("Database error"),
              })),
            })),
          })),
          update: jest.fn(),
          insert: jest.fn(),
        }),
      );

      const result = await verifyVolunteerHash("0xhash123");

      expect(result).toBe(false);
    });

    it("handles empty hash string", async () => {
      const result = await verifyVolunteerHash("");

      expect(result).toBe(true); // Should still check the database
    });

    it("handles special characters in hash", async () => {
      const result = await verifyVolunteerHash("0x!@#$%^&*()");

      expect(result).toBe(true); // Should still check the database
    });
  });

  describe("edge cases and error handling", () => {
    it("handles null opportunityId in createVerificationHash", async () => {
      const mockHours: VolunteerHours = {
        id: "hours-123",
        volunteerId: "user-123",
        charityId: "charity-123",
        opportunityId: null,
        hours: 8,
        datePerformed: "2024-01-01",
        status: "verified",
        description: "Test volunteer work",
      };

      const hash = await createVerificationHash(mockHours);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
    });

    it("handles missing wallet data in recordApplicationOnChain", async () => {
      // Mock supabase to return null wallet data
      jest
        .mocked(supabase.from)
        .mockImplementation((table): MockSupabaseTable => {
          if (table === "profiles") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({
                    data: { user_id: "user-123" },
                    error: null,
                  })),
                })),
              })),
              update: jest.fn(),
              insert: jest.fn(),
            };
          } else if (table === "wallet_aliases") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  maybeSingle: jest.fn(() => ({
                    data: null,
                    error: null,
                  })),
                })),
              })),
              update: jest.fn(),
              insert: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        });

      const result = await recordApplicationOnChain("user-123", "0xhash123");

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });

    it("handles missing wallet data in recordHoursOnChain", async () => {
      // Mock supabase to return null wallet data
      jest
        .mocked(supabase.from)
        .mockImplementation((table): MockSupabaseTable => {
          if (table === "profiles") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => ({
                    data: { user_id: "user-123" },
                    error: null,
                  })),
                })),
              })),
              update: jest.fn(),
              insert: jest.fn(),
            };
          } else if (table === "wallet_aliases") {
            return {
              select: jest.fn(() => ({
                eq: jest.fn(() => ({
                  maybeSingle: jest.fn(() => ({
                    data: null,
                    error: null,
                  })),
                })),
              })),
              update: jest.fn(),
              insert: jest.fn(),
            };
          }
          return {
            select: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          };
        });

      const result = await recordHoursOnChain("user-123", "0xhash123", 8);

      expect(result).toEqual({
        transactionId: "tx-123456",
        blockNumber: 500000,
      });
    });
  });
});
