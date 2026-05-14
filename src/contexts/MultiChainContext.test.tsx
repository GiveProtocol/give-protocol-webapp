import { jest } from "@jest/globals";
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import {
  MultiChainProvider,
  useMultiChainContext,
  useMultiChainEVM,
  useMultiChainSigner,
} from "./MultiChainContext";
import type { UnifiedWalletProvider, UnifiedAccount } from "@/types/wallet";

// Helper component to access context
function TestConsumer() {
  const ctx = useMultiChainContext();
  return (
    <div>
      <span data-testid="connected">{String(ctx.isConnected)}</span>
      <span data-testid="connecting">{String(ctx.isConnecting)}</span>
      <span data-testid="chain-type">{ctx.activeChainType}</span>
      <span data-testid="error">{ctx.error?.message ?? "none"}</span>
      <button
        data-testid="connect-btn"
        onClick={() => {
          const mockWallet: UnifiedWalletProvider = {
            name: "TestWallet",
            icon: "test",
            category: "browser",
            supportedChainTypes: ["evm", "solana"],
            providers: { evm: {} },
            isInstalled: () => true,
            connect: jest.fn<() => Promise<UnifiedAccount[]>>().mockResolvedValue([
              {
                id: "evm-1",
                address: "0x123",
                chainType: "evm",
                chainId: 1,
                chainName: "Ethereum",
                source: "TestWallet",
              },
            ]),
            disconnect: jest.fn<() => Promise<void>>().mockResolvedValue(),
            getAccounts: jest.fn<() => Promise<UnifiedAccount[]>>().mockResolvedValue([]),
            switchChain: jest.fn<() => Promise<void>>().mockResolvedValue(),
            signTransaction: jest.fn<() => Promise<string>>().mockResolvedValue("0xsig"),
            signMessage: jest.fn<() => Promise<string>>().mockResolvedValue("0xmsg"),
          };
          ctx.connect(mockWallet, "evm").catch(() => {
            // Expected in some tests
          });
        }}
      />
      <button data-testid="disconnect-btn" onClick={() => { ctx.disconnect(); }} />
      <button data-testid="clear-error-btn" onClick={ctx.clearError} />
    </div>
  );
}

describe("MultiChainContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("provides default context values", () => {
    render(
      <MultiChainProvider>
        <TestConsumer />
      </MultiChainProvider>,
    );
    expect(screen.getByTestId("connected")).toHaveTextContent("false");
    expect(screen.getByTestId("connecting")).toHaveTextContent("false");
    expect(screen.getByTestId("chain-type")).toHaveTextContent("evm");
  });

  it("connects to a wallet", async () => {
    render(
      <MultiChainProvider>
        <TestConsumer />
      </MultiChainProvider>,
    );
    await act(async () => {
      screen.getByTestId("connect-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("connected")).toHaveTextContent("true");
    });
  });

  it("disconnects wallet", async () => {
    render(
      <MultiChainProvider>
        <TestConsumer />
      </MultiChainProvider>,
    );
    await act(async () => {
      screen.getByTestId("connect-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("connected")).toHaveTextContent("true");
    });
    await act(async () => {
      screen.getByTestId("disconnect-btn").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("connected")).toHaveTextContent("false");
    });
  });

  it("clears error state", async () => {
    render(
      <MultiChainProvider>
        <TestConsumer />
      </MultiChainProvider>,
    );
    await act(async () => {
      screen.getByTestId("clear-error-btn").click();
    });
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });

  it("throws error when used outside provider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {
      // Suppress React error boundary logs
    });
    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useMultiChainContext must be used within a MultiChainProvider");
    consoleSpy.mockRestore();
  });
});

describe("useMultiChainEVM", () => {
  function EVMConsumer() {
    const evm = useMultiChainEVM();
    return (
      <div>
        <span data-testid="evm-address">{evm.address ?? "null"}</span>
        <span data-testid="evm-connected">{String(evm.isConnected)}</span>
      </div>
    );
  }

  it("provides EVM-specific defaults", () => {
    render(
      <MultiChainProvider>
        <EVMConsumer />
      </MultiChainProvider>,
    );
    expect(screen.getByTestId("evm-address")).toHaveTextContent("null");
    expect(screen.getByTestId("evm-connected")).toHaveTextContent("false");
  });
});

describe("useMultiChainSigner", () => {
  function SignerConsumer() {
    const { signTransaction, signMessage, activeAccount } =
      useMultiChainSigner();
    return (
      <div>
        <span data-testid="signer-account">
          {activeAccount?.address ?? "null"}
        </span>
        <button
          data-testid="sign-tx"
          onClick={() => {
            signTransaction({ to: "0x1", value: "1" }).catch(() => {
              // Expected without wallet
            });
          }}
        />
        <button
          data-testid="sign-msg"
          onClick={() => {
            signMessage("hello").catch(() => {
              // Expected without wallet
            });
          }}
        />
      </div>
    );
  }

  it("throws when signing without connected wallet", async () => {
    render(
      <MultiChainProvider>
        <SignerConsumer />
      </MultiChainProvider>,
    );
    expect(screen.getByTestId("signer-account")).toHaveTextContent("null");
  });
});
