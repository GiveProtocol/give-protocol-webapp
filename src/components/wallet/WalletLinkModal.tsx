import React, { useState, useCallback } from "react";
import { Wallet, ShieldCheck, X, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Logger } from "@/utils/logger";
import { DOCS_CONFIG } from "@/config/docs";

interface WalletLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinked?: () => void;
}

const BenefitItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start gap-3">
    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
    <span className="text-sm text-gray-700 dark:text-gray-300">{children}</span>
  </li>
);

/** Modal prompting authenticated users to link a wallet to their account. */
export const WalletLinkModal: React.FC<WalletLinkModalProps> = ({
  isOpen,
  onClose,
  onLinked,
}) => {
  const { linkWallet, isWalletConnected, loading } = useUnifiedAuth();
  const [linkError, setLinkError] = useState<string | null>(null);

  const handleLink = useCallback(async () => {
    setLinkError(null);
    try {
      await linkWallet();
      Logger.info("Wallet linked via modal");
      onLinked?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to link wallet";
      if (
        msg.toLowerCase().includes("user rejected") ||
        msg.toLowerCase().includes("user denied")
      ) {
        return;
      }
      setLinkError(msg);
      Logger.error("Wallet link failed in modal", { error: msg });
    }
  }, [linkWallet, onClose, onLinked]);

  const handleSkip = useCallback(() => {
    Logger.info("User dismissed wallet link modal");
    onClose();
  }, [onClose]);

  let buttonLabel: string;
  if (loading) {
    buttonLabel = "Linking\u2026";
  } else if (isWalletConnected) {
    buttonLabel = "Link Wallet";
  } else {
    buttonLabel = "Connect Wallet First";
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      size="md"
      closeOnBackdrop={false}
      showCloseButton={false}
    >
      <div className="text-center mb-6">
        <span className="mx-auto w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />
        </span>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Link Your Wallet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Link a wallet to your account for on-chain donations, token rewards,
          and governance
        </p>
      </div>

      <ul className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 space-y-3">
        <BenefitItem>
          Donate crypto directly to verified charities on-chain
        </BenefitItem>
        <BenefitItem>
          Develop{" "}
          <a
            href={`${DOCS_CONFIG.url}/docs/volunteers/earning-credentials/`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            SBT
          </a>{" "}
          credentials for your contributions
        </BenefitItem>
        <BenefitItem>
          Sign in with either email or wallet — same account
        </BenefitItem>
      </ul>

      {linkError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{linkError}</p>
        </div>
      )}

      <Button
        onClick={handleLink}
        fullWidth
        size="lg"
        disabled={loading || !isWalletConnected}
        icon={<Wallet className="h-4 w-4" />}
        className="font-semibold mb-3"
      >
        {buttonLabel}
      </Button>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          disabled={loading}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4 mr-1" />
          Skip for now
        </Button>
      </div>

      <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
        You can link your wallet anytime from Settings
      </p>
    </Modal>
  );
};

export default WalletLinkModal;
