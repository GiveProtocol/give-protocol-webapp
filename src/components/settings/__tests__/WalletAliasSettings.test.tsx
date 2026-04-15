import { jest } from "@jest/globals";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { WalletAliasSettings } from "../WalletAliasSettings";
import { useWalletAlias } from "@/hooks/useWalletAlias";
import { useWeb3 } from "@/contexts/Web3Context";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import {
  createMockWalletAlias,
  createMockWeb3,
  createMockAuth,
  testAddresses,
} from "@/test-utils/mockSetup";

// All mocks handled via moduleNameMapper:
// useWalletAlias, Web3Context, AuthContext/useAuth, useToast/ToastContext,
// utils/web3, useTranslation, logger, ui/Button, ui/Input, ui/Card

const mockUseWalletAlias = jest.mocked(useWalletAlias);
const mockUseWeb3 = jest.mocked(useWeb3);
const mockUseAuth = jest.mocked(useAuth);
const mockUseToast = jest.mocked(useToast);

describe("WalletAliasSettings", () => {
  const mockSetWalletAlias = jest.fn();
  const mockDeleteWalletAlias = jest.fn();
  const mockShowToast = jest.fn();

  const defaultMocks = {
    walletAlias: createMockWalletAlias({
      aliases: [],
      setWalletAlias: mockSetWalletAlias,
      deleteWalletAlias: mockDeleteWalletAlias,
    }),
    web3: createMockWeb3({
      address: testAddresses.mainWallet,
      isConnected: true,
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWalletAlias.mockReturnValue(defaultMocks.walletAlias);
    mockUseWeb3.mockReturnValue(defaultMocks.web3);
    mockUseAuth.mockReturnValue(
      createMockAuth({
        user: { id: "user-123" },
      }),
    );
    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
    });
    mockSetWalletAlias.mockResolvedValue(true);
    mockDeleteWalletAlias.mockResolvedValue(true);
  });

  // Helper: enter edit mode and submit with a value
  const enterEditAndSubmit = async (value: string) => {
    render(<WalletAliasSettings />);
    // Click "Set Wallet Alias" to enter edit mode
    fireEvent.click(screen.getByText("Set Wallet Alias"));
    const input = screen.getByRole("textbox");
    if (value) fireEvent.change(input, { target: { value } });
    // Submit form via Save Alias button; drain microtasks so async
    // handleSubmit state updates stay inside the act() boundary.
    await act(async () => {
      fireEvent.click(screen.getByText(/save alias/i));
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });
  };

  describe("Component Rendering", () => {
    it("renders the wallet alias settings component", () => {
      render(<WalletAliasSettings />);
      expect(screen.getByText("Wallet Alias")).toBeInTheDocument();
    });

    it("shows current wallet address when connected", () => {
      render(<WalletAliasSettings />);
      expect(screen.getByText("0x1234...7890")).toBeInTheDocument();
    });

    it("renders the card container", () => {
      render(<WalletAliasSettings />);
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });
  });

  describe("No Alias Set", () => {
    it("shows set wallet alias button by default", () => {
      render(<WalletAliasSettings />);
      expect(screen.getByText("Set Wallet Alias")).toBeInTheDocument();
    });

    it("enters edit mode when set wallet alias is clicked", () => {
      render(<WalletAliasSettings />);
      fireEvent.click(screen.getByText("Set Wallet Alias"));
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("allows user to enter alias in edit mode", () => {
      render(<WalletAliasSettings />);
      fireEvent.click(screen.getByText("Set Wallet Alias"));
      fireEvent.change(screen.getByRole("textbox"), {
        target: { value: "MyWallet" },
      });
      expect(screen.getByRole("textbox")).toHaveValue("MyWallet");
    });

    it("submits alias when form is submitted", async () => {
      await enterEditAndSubmit("MyWallet");

      await waitFor(() => {
        expect(mockSetWalletAlias).toHaveBeenCalledWith("MyWallet");
      });
    });
  });

  describe("Existing Alias", () => {
    const existingAliasMock = createMockWalletAlias({
      alias: "ExistingAlias",
      aliases: [],
      setWalletAlias: mockSetWalletAlias,
      deleteWalletAlias: mockDeleteWalletAlias,
    });

    beforeEach(() => {
      mockUseWalletAlias.mockReturnValue(existingAliasMock);
    });

    it("displays the existing alias", () => {
      render(<WalletAliasSettings />);
      expect(screen.getByText("ExistingAlias")).toBeInTheDocument();
    });

    it("shows edit button", () => {
      render(<WalletAliasSettings />);
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("enters edit mode when edit button is clicked", () => {
      render(<WalletAliasSettings />);

      fireEvent.click(screen.getByText("Edit"));

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("ExistingAlias");
    });

    describe("Edit Mode", () => {
      it("shows save and cancel buttons in edit mode", () => {
        render(<WalletAliasSettings />);

        fireEvent.click(screen.getByText("Edit"));

        expect(screen.getByText(/save alias/i)).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      it("cancels edit mode when cancel is clicked", () => {
        render(<WalletAliasSettings />);

        fireEvent.click(screen.getByText("Edit"));
        fireEvent.click(screen.getByText("Cancel"));

        expect(screen.getByText("ExistingAlias")).toBeInTheDocument();
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      });
    });
  });

  describe("Validation", () => {
    // eslint-disable-next-line jest/expect-expect
    it("shows error for empty alias", async () => {
      render(<WalletAliasSettings />);
      fireEvent.click(screen.getByText("Set Wallet Alias"));
      // Submit without entering text
      fireEvent.click(screen.getByText(/save alias/i));

      await waitFor(() => {
        expect(screen.getByText("Alias cannot be empty")).toBeInTheDocument();
      });
    });

    // eslint-disable-next-line jest/expect-expect
    it("shows error for alias too short", async () => {
      await enterEditAndSubmit("ab");

      await waitFor(() => {
        expect(
          screen.getByText("Alias must be between 3 and 20 characters"),
        ).toBeInTheDocument();
      });
    });

    // eslint-disable-next-line jest/expect-expect
    it("shows error for alias too long", async () => {
      await enterEditAndSubmit("a".repeat(21));

      await waitFor(() => {
        expect(
          screen.getByText("Alias must be between 3 and 20 characters"),
        ).toBeInTheDocument();
      });
    });

    // eslint-disable-next-line jest/expect-expect
    it("shows error for invalid characters", async () => {
      await enterEditAndSubmit("invalid@alias!");

      await waitFor(() => {
        expect(
          screen.getByText(
            "Alias can only contain letters, numbers, underscores, and hyphens",
          ),
        ).toBeInTheDocument();
      });
    });

    it("accepts valid alias", async () => {
      await enterEditAndSubmit("valid_alias-123");

      await waitFor(() => {
        expect(mockSetWalletAlias).toHaveBeenCalledWith("valid_alias-123");
      });
    });
  });

  describe("State Handling", () => {
    it("shows loading state when setting alias", () => {
      mockUseWalletAlias.mockReturnValue({
        ...defaultMocks.walletAlias,
        loading: true,
      });

      render(<WalletAliasSettings />);
      expect(screen.getByText("Wallet Alias")).toBeInTheDocument();
    });

    it("handles disconnected wallet state", () => {
      mockUseWeb3.mockReturnValue(
        createMockWeb3({
          address: null,
          isConnected: false,
        }),
      );

      render(<WalletAliasSettings />);
      expect(screen.getByText("Wallet Alias")).toBeInTheDocument();
    });

    it("handles unauthenticated state", () => {
      mockUseAuth.mockReturnValue(
        createMockAuth({
          user: null,
        }),
      );

      render(<WalletAliasSettings />);
      expect(screen.getByText("Wallet Alias")).toBeInTheDocument();
      expect(screen.getByText("Authentication Required")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("handles setWalletAlias failure gracefully", async () => {
      mockSetWalletAlias.mockResolvedValue(false);
      await enterEditAndSubmit("TestAlias");

      await waitFor(() => {
        expect(mockSetWalletAlias).toHaveBeenCalledWith("TestAlias");
      });
    });
  });
});
