import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { setMockResult, resetMockState } from "@/test-utils/supabaseMock";
import { ValidationStatus, ActivityType } from "@/types/selfReportedHours";
import {
  VOLUNTEER_SBT_ABI,
  generateVolunteerHoursHash,
  mintVolunteerHoursSBT,
  batchMintVolunteerHoursSBT,
  getOnChainVolunteerHours,
  verifySBTByHash,
  getVolunteerSBTs,
} from "./volunteerSBT";

// Mock ethers
jest.mock("ethers", () => ({
  ethers: {
    keccak256: jest
      .fn()
      .mockReturnValue(
        "0xmockhash1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      ),
    toUtf8Bytes: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    Contract: jest.fn().mockImplementation(() => ({
      mintVolunteerHours: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: "0xtxhash" }),
      }),
      batchMintVolunteerHours: jest.fn().mockResolvedValue({
        wait: jest.fn().mockResolvedValue({ hash: "0xtxhash" }),
      }),
      getVolunteerTotalHours: jest.fn().mockResolvedValue(100n),
      verifyHash: jest.fn().mockResolvedValue(true),
      getVolunteerSBTs: jest.fn().mockResolvedValue([1n, 2n]),
    })),
    BrowserProvider: jest.fn().mockImplementation(() => ({
      getSigner: jest.fn().mockResolvedValue({}),
    })),
  },
}));

describe("volunteerSBT", () => {
  beforeEach(() => {
    resetMockState();
    jest.clearAllMocks();
  });

  describe("VOLUNTEER_SBT_ABI", () => {
    it("should export the contract ABI", () => {
      expect(VOLUNTEER_SBT_ABI).toBeDefined();
      expect(Array.isArray(VOLUNTEER_SBT_ABI)).toBe(true);
    });

    it("should contain mint function", () => {
      const hasMint = VOLUNTEER_SBT_ABI.some(
        (item) => typeof item === "string" && item.includes("mint"),
      );
      expect(hasMint).toBe(true);
    });

    it("should contain getVolunteerHours function", () => {
      const hasGetHours = VOLUNTEER_SBT_ABI.some(
        (item) =>
          typeof item === "string" && item.includes("getVolunteerHours"),
      );
      expect(hasGetHours).toBe(true);
    });

    it("should have multiple ABI entries", () => {
      expect(VOLUNTEER_SBT_ABI.length).toBeGreaterThan(0);
    });
  });

  describe("generateVolunteerHoursHash", () => {
    it("should generate a hash for volunteer hours", () => {
      const hours = {
        id: "hours-1",
        volunteerId: "user-1",
        activityDate: "2024-01-15",
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description: "Test volunteer work",
        organizationName: "Test Org",
        validationStatus: ValidationStatus.VALIDATED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const hash = generateVolunteerHoursHash(hours);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.startsWith("0x")).toBe(true);
    });
  });

  describe("mintVolunteerHoursSBT", () => {
    it("should mint SBT for validated hours", async () => {
      const hoursRecord = {
        id: "hours-1",
        volunteerId: "user-1",
        activityDate: "2024-01-15",
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description: "Test volunteer work",
        organizationName: "Test Org",
        validationStatus: ValidationStatus.VALIDATED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // With mock supabase, should return a result
      const result = await mintVolunteerHoursSBT("user-1", hoursRecord);
      expect(result).toBeDefined();
      expect(result.tokenId).toBeDefined();
      expect(result.transactionHash).toBeDefined();
      expect(result.verificationHash).toBeDefined();
    });

    it("should handle non-validated hours gracefully", async () => {
      const hoursRecord = {
        id: "hours-1",
        volunteerId: "user-1",
        activityDate: "2024-01-15",
        hours: 4,
        activityType: ActivityType.DIRECT_SERVICE,
        description: "Test",
        organizationName: "Test Org",
        validationStatus: ValidationStatus.UNVALIDATED,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Function catches errors and returns simulated data
      const result = await mintVolunteerHoursSBT("user-1", hoursRecord);
      expect(result).toBeDefined();
    });
  });

  describe("batchMintVolunteerHoursSBT", () => {
    it("should process batch of validated records", async () => {
      const records = [
        {
          volunteerId: "user-1",
          hoursRecord: {
            id: "hours-1",
            volunteerId: "user-1",
            activityDate: "2024-01-15",
            hours: 4,
            activityType: ActivityType.DIRECT_SERVICE,
            description: "Test",
            organizationName: "Test Org",
            validationStatus: ValidationStatus.VALIDATED,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      ];

      const result = await batchMintVolunteerHoursSBT(records);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for non-validated records", async () => {
      const records = [
        {
          volunteerId: "user-1",
          hoursRecord: {
            id: "hours-1",
            volunteerId: "user-1",
            activityDate: "2024-01-15",
            hours: 4,
            activityType: ActivityType.DIRECT_SERVICE,
            description: "Test",
            organizationName: "Test Org",
            validationStatus: ValidationStatus.UNVALIDATED,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      ];

      const result = await batchMintVolunteerHoursSBT(records);
      expect(result).toEqual([]);
    });
  });

  describe("getOnChainVolunteerHours", () => {
    it("should return hours or 0", async () => {
      const result = await getOnChainVolunteerHours("0x1234");
      expect(typeof result).toBe("number");
    });
  });

  describe("verifySBTByHash", () => {
    it("should handle hash verification", async () => {
      const result = await verifySBTByHash("0xhash");
      expect(typeof result).toBe("boolean");
    });
  });

  describe("getVolunteerSBTs", () => {
    it("should return array", async () => {
      const result = await getVolunteerSBTs("0x1234");
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
