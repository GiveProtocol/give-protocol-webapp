import { jest } from '@jest/globals';
import type {
  MockUIComponentProps,
  MockButtonProps,
  MockInputProps,
  MockCardProps,
  MockAuthReturn,
  MockWeb3Return,
  MockProfileReturn,
  MockTranslationReturn,
  MockVolunteerVerificationReturn,
  MockDonationExportModalProps,
  MockComponentWithClose,
  MockComponentWithDonations,
  MockDonation,
  MockCharity,
  MockUser,
  MockSupabaseQuery,
  MockSupabaseOverrides,
} from "../types";
import { cssClasses } from "../types";

describe("types", () => {
  describe("MockUIComponentProps", () => {
    it("includes all expected properties", () => {
      const mockUIComponent: MockUIComponentProps = {
        children: "Test children",
        className: "test-class",
        onClick: jest.fn(),
        variant: "primary",
        disabled: false,
        type: "button",
        value: "test-value",
        onChange: jest.fn(),
        placeholder: "test-placeholder",
        customProp: "custom",
      };

      expect(mockUIComponent.children).toBe("Test children");
      expect(mockUIComponent.className).toBe("test-class");
      expect(typeof mockUIComponent.onClick).toBe("function");
      expect(mockUIComponent.variant).toBe("primary");
      expect(mockUIComponent.disabled).toBe(false);
      expect(mockUIComponent.type).toBe("button");
      expect(mockUIComponent.value).toBe("test-value");
      expect(typeof mockUIComponent.onChange).toBe("function");
      expect(mockUIComponent.placeholder).toBe("test-placeholder");
      expect(mockUIComponent.customProp).toBe("custom");
    });
  });

  describe("MockButtonProps", () => {
    it("includes expected properties", () => {
      const mockButton: MockButtonProps = {
        children: "Test",
        onClick: jest.fn(),
        variant: "primary",
        disabled: false,
        className: "test-class",
        type: "button",
      };

      expect(mockButton.children).toBe("Test");
      expect(typeof mockButton.onClick).toBe("function");
      expect(mockButton.variant).toBe("primary");
      expect(mockButton.disabled).toBe(false);
      expect(mockButton.className).toBe("test-class");
      expect(mockButton.type).toBe("button");
    });
  });

  describe("MockInputProps", () => {
    it("includes expected properties", () => {
      const mockInput: MockInputProps = {
        value: "test-value",
        onChange: jest.fn(),
        placeholder: "Enter text",
        type: "text",
      };

      expect(mockInput.value).toBe("test-value");
      expect(typeof mockInput.onChange).toBe("function");
      expect(mockInput.placeholder).toBe("Enter text");
      expect(mockInput.type).toBe("text");
    });
  });

  describe("MockCardProps", () => {
    it("includes expected properties", () => {
      const mockCard: MockCardProps = {
        children: "Card content",
        className: "card-class",
      };

      expect(mockCard.children).toBe("Card content");
      expect(mockCard.className).toBe("card-class");
    });
  });

  describe("MockAuthReturn", () => {
    it("includes expected properties", () => {
      const mockAuth: MockAuthReturn = {
        user: { id: "user-123" },
        userType: "donor",
        signOut: jest.fn(),
        loading: false,
      };

      expect(mockAuth.user).toEqual({ id: "user-123" });
      expect(mockAuth.userType).toBe("donor");
      expect(typeof mockAuth.signOut).toBe("function");
      expect(mockAuth.loading).toBe(false);
    });

    it("handles null user", () => {
      const mockAuth: MockAuthReturn = {
        user: null,
        userType: null,
        signOut: jest.fn(),
        loading: true,
      };

      expect(mockAuth.user).toBe(null);
      expect(mockAuth.userType).toBe(null);
      expect(mockAuth.loading).toBe(true);
    });
  });

  describe("MockWeb3Return", () => {
    it("includes expected properties", () => {
      const mockWeb3: MockWeb3Return = {
        address: "0x123",
        isConnected: true,
      };

      expect(mockWeb3.address).toBe("0x123");
      expect(mockWeb3.isConnected).toBe(true);
    });

    it("handles disconnected state", () => {
      const mockWeb3: MockWeb3Return = {
        address: null,
        isConnected: false,
      };

      expect(mockWeb3.address).toBe(null);
      expect(mockWeb3.isConnected).toBe(false);
    });
  });

  describe("MockProfileReturn", () => {
    it("includes expected properties", () => {
      const mockProfile: MockProfileReturn = {
        profile: { id: "profile-123", name: "Test Profile" },
        loading: false,
        error: null,
        refetch: jest.fn(),
      };

      expect(mockProfile.profile).toEqual({
        id: "profile-123",
        name: "Test Profile",
      });
      expect(mockProfile.loading).toBe(false);
      expect(mockProfile.error).toBe(null);
      expect(typeof mockProfile.refetch).toBe("function");
    });

    it("handles error state", () => {
      const mockProfile: MockProfileReturn = {
        profile: null,
        loading: false,
        error: "Failed to load profile",
        refetch: jest.fn(),
      };

      expect(mockProfile.profile).toBe(null);
      expect(mockProfile.error).toBe("Failed to load profile");
    });
  });

  describe("MockTranslationReturn", () => {
    it("includes expected properties", () => {
      const mockTranslation: MockTranslationReturn = {
        t: jest.fn(),
      };

      expect(typeof mockTranslation.t).toBe("function");
    });
  });

  describe("MockVolunteerVerificationReturn", () => {
    it("includes expected properties", () => {
      const mockVolunteerVerification: MockVolunteerVerificationReturn = {
        verifyHours: jest.fn(),
        acceptApplication: jest.fn(),
        loading: false,
        error: null,
      };

      expect(typeof mockVolunteerVerification.verifyHours).toBe("function");
      expect(typeof mockVolunteerVerification.acceptApplication).toBe(
        "function",
      );
      expect(mockVolunteerVerification.loading).toBe(false);
      expect(mockVolunteerVerification.error).toBe(null);
    });

    it("handles error state", () => {
      const mockVolunteerVerification: MockVolunteerVerificationReturn = {
        verifyHours: jest.fn(),
        acceptApplication: jest.fn(),
        loading: false,
        error: "Verification failed",
      };

      expect(mockVolunteerVerification.error).toBe("Verification failed");
    });
  });

  describe("MockDonationExportModalProps", () => {
    it("includes expected properties", () => {
      const mockProps: MockDonationExportModalProps = {
        donations: [
          {
            id: "donation-123",
            amount: 100,
            timestamp: "2024-01-01T00:00:00Z",
            donor: "donor-123",
          },
        ],
        onClose: jest.fn(),
      };

      expect(mockProps.donations).toHaveLength(1);
      expect(mockProps.donations[0].id).toBe("donation-123");
      expect(mockProps.donations[0].amount).toBe(100);
      expect(typeof mockProps.onClose).toBe("function");
    });
  });

  describe("MockComponentWithClose", () => {
    it("includes expected properties", () => {
      const mockComponent: MockComponentWithClose = {
        onClose: jest.fn(),
      };

      expect(typeof mockComponent.onClose).toBe("function");
    });
  });

  describe("MockComponentWithDonations", () => {
    it("includes expected properties", () => {
      const mockComponent: MockComponentWithDonations = {
        donations: [
          {
            id: "donation-123",
            amount: "100",
            donor_id: "donor-123",
            charity_id: "charity-123",
            status: "completed",
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
        onClose: jest.fn(),
      };

      expect(mockComponent.donations).toHaveLength(1);
      expect(typeof mockComponent.onClose).toBe("function");
    });
  });

  describe("MockDonation", () => {
    it("includes expected properties", () => {
      const mockDonation: MockDonation = {
        id: "donation-123",
        amount: "100",
        donor_id: "donor-123",
        charity_id: "charity-123",
        status: "completed",
        created_at: "2024-01-01T00:00:00Z",
        customField: "custom-value",
      };

      expect(mockDonation.id).toBe("donation-123");
      expect(mockDonation.amount).toBe("100");
      expect(mockDonation.donor_id).toBe("donor-123");
      expect(mockDonation.charity_id).toBe("charity-123");
      expect(mockDonation.status).toBe("completed");
      expect(mockDonation.created_at).toBe("2024-01-01T00:00:00Z");
      expect(mockDonation.customField).toBe("custom-value");
    });
  });

  describe("MockCharity", () => {
    it("includes expected properties", () => {
      const mockCharity: MockCharity = {
        id: "charity-123",
        name: "Test Charity",
        description: "Test Description",
        category: "education",
        country: "US",
        verified: true,
        created_at: "2024-01-01T00:00:00Z",
        tags: ["education", "children"],
      };

      expect(mockCharity.id).toBe("charity-123");
      expect(mockCharity.name).toBe("Test Charity");
      expect(mockCharity.description).toBe("Test Description");
      expect(mockCharity.category).toBe("education");
      expect(mockCharity.country).toBe("US");
      expect(mockCharity.verified).toBe(true);
      expect(mockCharity.created_at).toBe("2024-01-01T00:00:00Z");
      expect(mockCharity.tags).toEqual(["education", "children"]);
    });
  });

  describe("MockUser", () => {
    it("includes expected properties", () => {
      const mockUser: MockUser = {
        id: "user-123",
        email: "test@example.com",
        user_metadata: { user_type: "donor" },
        app_metadata: { provider: "email" },
        aud: "authenticated",
        created_at: "2024-01-01T00:00:00Z",
        phone: "+1234567890",
      };

      expect(mockUser.id).toBe("user-123");
      expect(mockUser.email).toBe("test@example.com");
      expect(mockUser.user_metadata).toEqual({ user_type: "donor" });
      expect(mockUser.app_metadata).toEqual({ provider: "email" });
      expect(mockUser.aud).toBe("authenticated");
      expect(mockUser.created_at).toBe("2024-01-01T00:00:00Z");
      expect(mockUser.phone).toBe("+1234567890");
    });
  });

  describe("MockSupabaseQuery", () => {
    it("includes expected properties with data", () => {
      const mockQuery: MockSupabaseQuery<MockDonation> = {
        data: [
          {
            id: "donation-123",
            amount: "100",
            donor_id: "donor-123",
            charity_id: "charity-123",
            status: "completed",
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
        error: null,
      };

      expect(mockQuery.data).toHaveLength(1);
      expect(mockQuery.error).toBe(null);
    });

    it("includes expected properties with error", () => {
      const mockQuery: MockSupabaseQuery = {
        data: null,
        error: { message: "Database error" },
      };

      expect(mockQuery.data).toBe(null);
      expect(mockQuery.error).toEqual({ message: "Database error" });
    });
  });

  describe("MockSupabaseOverrides", () => {
    it("includes expected properties", () => {
      const mockOverrides: MockSupabaseOverrides = {
        select: { data: [], error: null },
        selectEq: { data: null, error: { message: "Not found" } },
        insert: { data: {}, error: null },
        update: { data: {}, error: null },
        updateEq: { data: {}, error: null },
        deleteEq: { data: null, error: null },
        from: { donations: {} },
        client: { supabase: {} },
      };

      expect(mockOverrides.select).toEqual({ data: [], error: null });
      expect(mockOverrides.selectEq).toEqual({
        data: null,
        error: { message: "Not found" },
      });
      expect(mockOverrides.insert).toEqual({ data: {}, error: null });
      expect(mockOverrides.update).toEqual({ data: {}, error: null });
      expect(mockOverrides.updateEq).toEqual({ data: {}, error: null });
      expect(mockOverrides.deleteEq).toEqual({ data: null, error: null });
      expect(mockOverrides.from).toEqual({ donations: {} });
      expect(mockOverrides.client).toEqual({ supabase: {} });
    });
  });

  describe("cssClasses", () => {
    it("contains expected card classes", () => {
      expect(cssClasses.card.default).toEqual([
        "bg-white",
        "border",
        "border-gray-200",
        "rounded-lg",
        "p-4",
      ]);
      expect(cssClasses.card.success).toEqual([
        "bg-green-50",
        "border",
        "border-green-200",
        "rounded-lg",
        "p-4",
      ]);
      expect(cssClasses.card.error).toEqual([
        "p-3",
        "bg-red-50",
        "text-red-700",
        "text-sm",
        "rounded-md",
      ]);
    });

    it("contains expected button classes", () => {
      expect(cssClasses.button.primary).toEqual(["flex", "items-center"]);
      expect(cssClasses.button.secondary).toEqual(["flex", "items-center"]);
    });

    it("contains expected spinner classes", () => {
      expect(cssClasses.spinner.default).toEqual(["animate-spin"]);
    });
  });
});
