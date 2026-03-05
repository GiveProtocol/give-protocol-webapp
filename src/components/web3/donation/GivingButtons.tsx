import React, { useCallback } from "react";
import { DonationButton } from "@/components/web3/donation/DonationButton";
import { ScheduledDonationButton } from "@/components/web3/donation/ScheduledDonationButton";

const SYNE_BUTTON_STYLE: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.85rem',
  fontWeight: 600,
  letterSpacing: '0.05em',
};

const SYNE_LINK_STYLE: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '0.72rem',
  letterSpacing: '0.1em',
};

interface GivingOptionsCardProps {
  /** Display name of the charity or fund */
  charityName: string;
  /** Wallet address or ID for receiving donations */
  charityAddress: string;
  /** Card heading (defaults to "Giving Options") */
  heading?: string;
}

/**
 * Card with branded one-time and monthly donation buttons.
 *
 * @param props - Component props
 * @returns Rendered giving options card
 */
export function GivingOptionsCard({
  charityName,
  charityAddress,
  heading = "Giving Options",
}: GivingOptionsCardProps): React.ReactElement {
  const renderGiveOnce = useCallback(
    ({ onClick }: { onClick: () => void }) => (
      <button
        onClick={onClick}
        className="w-full h-[58px] rounded-full border-2 border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center justify-center gap-2.5 uppercase transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9f6e] focus-visible:ring-offset-2"
        style={SYNE_BUTTON_STYLE}
      >
        <span className="w-5 h-5 rounded-full bg-emerald-600/10 dark:bg-emerald-400/10 flex items-center justify-center text-[0.65rem] leading-none">&#9829;</span>{' '}
        Give Once
      </button>
    ),
    [],
  );

  const renderGiveMonthly = useCallback(
    ({ onClick }: { onClick: () => void }) => (
      <button
        onClick={onClick}
        className="w-full h-[58px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2.5 uppercase transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9f6e] focus-visible:ring-offset-2"
        style={SYNE_BUTTON_STYLE}
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[0.65rem] leading-none">&#8635;</span>{' '}
        Give Monthly
      </button>
    ),
    [],
  );

  return (
    <div className="bg-white dark:bg-[#111110] p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-[#f2f0ec] mb-4">{heading}</h2>
      <div className="flex flex-col gap-4">
        <ScheduledDonationButton charityName={charityName} charityAddress={charityAddress} renderTrigger={renderGiveMonthly} />
        <DonationButton charityName={charityName} charityAddress={charityAddress} renderTrigger={renderGiveOnce} />
        <a
          href="https://docs.giveprotocol.io/docs/donors/making-donations/"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[#0d9f6e] dark:text-[#2dd4a2] hover:opacity-80 mt-2 text-center uppercase"
          style={SYNE_LINK_STYLE}
        >
          Learn about giving options →
        </a>
      </div>
    </div>
  );
}
