import React from "react";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useWeb3 } from "@/contexts/Web3Context";
import { DonateWidget } from "../DonateWidget";

// Card, Button, DonationModal, and Web3Context are mocked via moduleNameMapper

const mockUseWeb3 = jest.mocked(useWeb3);

const defaultProps = {
  ein: "12-3456789",
  charityName: "Test Charity",
  walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
  charityId: "charity-1",
  mode: "sidebar" as const,
  isVerified: false,
};

const renderWidget = (props = defaultProps) =>
  render(
    <MemoryRouter>
      <DonateWidget {...props} />
    </MemoryRouter>,
  );

describe("DonateWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseWeb3.mockReturnValue({
      provider: null,
      signer: null,
      address: null,
      chainId: 1287,
      isConnected: false,
      isConnecting: false,
      error: null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      switchChain: jest.fn(),
    });
  });

  describe("Sidebar mode rendering", () => {
    it("renders the charity name in the heading", () => {
      renderWidget();
      expect(screen.getByText("Support Test Charity")).toBeInTheDocument();
    });

    it("renders the Card wrapper in sidebar mode", () => {
      renderWidget();
      expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("renders crypto preset amount buttons by default", () => {
      renderWidget();
      expect(screen.getByText("Ξ0.01")).toBeInTheDocument();
      expect(screen.getByText("Ξ0.05")).toBeInTheDocument();
      expect(screen.getByText("Ξ0.1")).toBeInTheDocument();
      expect(screen.getByText("Ξ0.5")).toBeInTheDocument();
    });

    it("renders custom amount input", () => {
      renderWidget();
      expect(screen.getByPlaceholderText("Custom amount")).toBeInTheDocument();
    });

    it("renders the donate button", () => {
      renderWidget();
      expect(screen.getByText("Connect wallet")).toBeInTheDocument();
    });

    it("renders fee disclosure text for crypto tab", () => {
      renderWidget();
      expect(
        screen.getByText(/0% platform fee on direct donations/),
      ).toBeInTheDocument();
    });
  });

  describe("Modal mode rendering", () => {
    it("does not render Card wrapper in modal mode", () => {
      renderWidget({ ...defaultProps, mode: "modal" });
      expect(screen.queryByTestId("card")).not.toBeInTheDocument();
    });

    it("does not render charity name heading in modal mode", () => {
      renderWidget({ ...defaultProps, mode: "modal" });
      expect(
        screen.queryByText("Support Test Charity"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Payment tab toggle", () => {
    it("renders Crypto and Fiat tab buttons when not verified", () => {
      renderWidget();
      expect(screen.getByText("Crypto")).toBeInTheDocument();
      expect(screen.getByText("Fiat (USD)")).toBeInTheDocument();
    });

    it("hides the tab toggle when isVerified is true", () => {
      renderWidget({ ...defaultProps, isVerified: true });
      expect(screen.queryByText("Crypto")).not.toBeInTheDocument();
      expect(screen.queryByText("Fiat (USD)")).not.toBeInTheDocument();
    });

    it("shows fiat fee disclosure after switching to fiat tab", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      expect(screen.getByText(/Secure checkout/)).toBeInTheDocument();
    });

    it("shows Donate with card button after switching to fiat tab", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      expect(screen.getByText("Donate with card")).toBeInTheDocument();
    });
  });

  describe("Amount selection", () => {
    it("selects a preset amount on click", () => {
      mockUseWeb3.mockReturnValue({
        provider: null,
        signer: null,
        address: "0xabc",
        chainId: 1287,
        isConnected: true,
        isConnecting: false,
        error: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        switchChain: jest.fn(),
      });
      renderWidget();
      fireEvent.click(screen.getByText("Ξ0.05"));
      expect(screen.getByText(/Donate Ξ0.05/)).toBeInTheDocument();
    });

    it("accepts custom amount input", () => {
      mockUseWeb3.mockReturnValue({
        provider: null,
        signer: null,
        address: "0xabc",
        chainId: 1287,
        isConnected: true,
        isConnecting: false,
        error: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        switchChain: jest.fn(),
      });
      renderWidget();
      const input = screen.getByPlaceholderText("Custom amount");
      fireEvent.change(input, { target: { value: "5" } });
      expect(screen.getByText(/Donate Ξ5/)).toBeInTheDocument();
    });

    it("disables donate button when amount is zero", () => {
      renderWidget();
      const button = screen.getByText("Connect wallet");
      expect(button).toBeDisabled();
    });
  });

  describe("Wallet warning", () => {
    it("shows wallet warning when charity has no wallet", () => {
      renderWidget({ ...defaultProps, walletAddress: null });
      expect(
        screen.getByText(/hasn.t set up a wallet yet/),
      ).toBeInTheDocument();
    });

    it("does not show wallet warning when charity has a wallet", () => {
      renderWidget();
      expect(
        screen.queryByText(/hasn.t set up a wallet yet/),
      ).not.toBeInTheDocument();
    });

    it("does not show wallet warning on fiat tab even without wallet", () => {
      renderWidget({ ...defaultProps, walletAddress: null });
      fireEvent.click(screen.getByText("Fiat (USD)"));
      expect(
        screen.queryByText(/hasn.t set up a wallet yet/),
      ).not.toBeInTheDocument();
    });
  });

  describe("Connect wallet flow", () => {
    it("shows Connect wallet text when not connected on crypto tab", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Ξ0.1"));
      expect(screen.getByText("Connect wallet")).toBeInTheDocument();
    });

    it("calls connect when clicking donate while not connected on crypto tab", () => {
      const mockConnect = jest.fn();
      mockUseWeb3.mockReturnValue({
        provider: null,
        signer: null,
        address: null,
        chainId: 1287,
        isConnected: false,
        isConnecting: false,
        error: null,
        connect: mockConnect,
        disconnect: jest.fn(),
        switchChain: jest.fn(),
      });
      renderWidget();
      fireEvent.click(screen.getByText("Ξ0.1"));
      fireEvent.click(screen.getByText("Connect wallet"));
      expect(mockConnect).toHaveBeenCalled();
    });
  });

  describe("Donation modal", () => {
    it("shows donation modal when connected user clicks donate", async () => {
      mockUseWeb3.mockReturnValue({
        provider: null,
        signer: null,
        address: "0xabc",
        chainId: 1287,
        isConnected: true,
        isConnecting: false,
        error: null,
        connect: jest.fn(),
        disconnect: jest.fn(),
        switchChain: jest.fn(),
      });
      renderWidget();
      fireEvent.click(screen.getByText("Ξ0.05"));
      fireEvent.click(screen.getByText(/Donate Ξ/));
      await waitFor(() => {
        expect(screen.getByTestId("donation-modal")).toBeInTheDocument();
      });
    });

    it("shows donation modal when clicking donate on fiat tab", async () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      fireEvent.click(screen.getByText("$50"));
      fireEvent.click(screen.getByText("Donate with card"));
      await waitFor(() => {
        expect(screen.getByTestId("donation-modal")).toBeInTheDocument();
      });
    });
  });

  describe("Currency-aware presets", () => {
    it("renders crypto presets (Ξ) on crypto tab", () => {
      renderWidget();
      expect(screen.getByText("Ξ0.01")).toBeInTheDocument();
      expect(screen.getByText("Ξ0.05")).toBeInTheDocument();
      expect(screen.getByText("Ξ0.1")).toBeInTheDocument();
      expect(screen.getByText("Ξ0.5")).toBeInTheDocument();
      expect(screen.queryByText("$25")).not.toBeInTheDocument();
    });

    it("renders fiat presets ($) after switching to fiat tab", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      expect(screen.getByText("$25")).toBeInTheDocument();
      expect(screen.getByText("$50")).toBeInTheDocument();
      expect(screen.getByText("$100")).toBeInTheDocument();
      expect(screen.getByText("$250")).toBeInTheDocument();
      expect(screen.queryByText("Ξ0.01")).not.toBeInTheDocument();
    });

    it("shows Ξ symbol in custom input prefix on crypto tab", () => {
      renderWidget();
      expect(screen.getByText("Ξ")).toBeInTheDocument();
    });

    it("shows $ symbol in custom input prefix on fiat tab", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      expect(screen.getByText("$")).toBeInTheDocument();
    });

    it("resets amount and error when switching tabs", () => {
      renderWidget();
      const input = screen.getByPlaceholderText("Custom amount");
      fireEvent.change(input, { target: { value: "15" } });
      expect(screen.getByText("Maximum donation is Ξ10")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      expect(screen.queryByText(/Maximum donation is/)).not.toBeInTheDocument();
    });
  });

  describe("Max donation cap", () => {
    it("shows error when custom crypto amount exceeds max (10 ETH)", () => {
      renderWidget();
      const input = screen.getByPlaceholderText("Custom amount");
      fireEvent.change(input, { target: { value: "15" } });
      expect(screen.getByText("Maximum donation is Ξ10")).toBeInTheDocument();
    });

    it("shows error when custom fiat amount exceeds max ($10000)", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      const input = screen.getByPlaceholderText("Custom amount");
      fireEvent.change(input, { target: { value: "15000" } });
      expect(
        screen.getByText("Maximum donation is $10000"),
      ).toBeInTheDocument();
    });

    it("clears error when a valid amount is entered after an error", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      const input = screen.getByPlaceholderText("Custom amount");
      fireEvent.change(input, { target: { value: "15000" } });
      expect(screen.getByText(/Maximum donation is/)).toBeInTheDocument();
      fireEvent.change(input, { target: { value: "500" } });
      expect(screen.queryByText(/Maximum donation is/)).not.toBeInTheDocument();
    });

    it("disables donate button when amount exceeds cap", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      const input = screen.getByPlaceholderText("Custom amount");
      fireEvent.change(input, { target: { value: "15000" } });
      const button = screen.getByText("Donate with card");
      expect(button).toBeDisabled();
    });

    it("sets max attribute to crypto max on crypto tab", () => {
      renderWidget();
      const input = screen.getByPlaceholderText("Custom amount");
      expect(input).toHaveAttribute("max", "10");
    });

    it("sets max attribute to fiat max on fiat tab", () => {
      renderWidget();
      fireEvent.click(screen.getByText("Fiat (USD)"));
      const input = screen.getByPlaceholderText("Custom amount");
      expect(input).toHaveAttribute("max", "10000");
    });
  });
});
