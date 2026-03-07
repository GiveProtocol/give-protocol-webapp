import React, { useCallback, useState } from "react";
import { FaFacebook, FaXTwitter, FaLinkedin, FaWhatsapp, FaTelegram } from "react-icons/fa6";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/components/Wallet/utils";
import { useToast } from "@/hooks/useToast";

/** Farcaster logo as inline SVG (not available in react-icons). */
function FarcasterIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5.13 3h13.74v1.2l-1.5 1.5H6.63l-1.5-1.5V3Zm-1.5 3.6h16.74v13.8h-2.4v-9.6H6.03v9.6H3.63V6.6Zm5.4 4.2h5.94v2.4h-1.77v7.2H10.8v-7.2H9.03V10.8Z" />
    </svg>
  );
}

interface SocialPlatform {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  getShareUrl: (url: string, message: string) => string;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: "facebook",
    label: "Share on Facebook",
    icon: FaFacebook,
    getShareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: "twitter",
    label: "Share on X",
    icon: FaXTwitter,
    getShareUrl: (url, msg) => `https://x.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: "linkedin",
    label: "Share on LinkedIn",
    icon: FaLinkedin,
    getShareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: "whatsapp",
    label: "Share on WhatsApp",
    icon: FaWhatsapp,
    getShareUrl: (url, msg) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${msg} ${url}`)}`,
  },
  {
    id: "telegram",
    label: "Share on Telegram",
    icon: FaTelegram,
    getShareUrl: (url, msg) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`,
  },
  {
    id: "farcaster",
    label: "Share on Farcaster",
    icon: FarcasterIcon,
    getShareUrl: (url, msg) => `https://warpcast.com/~/compose?text=${encodeURIComponent(msg)}&embeds[]=${encodeURIComponent(url)}`,
  },
];

/** Single social share icon button. */
function SocialButton({ platform, onClick }: {
  platform: SocialPlatform;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}): React.ReactElement {
  const Icon = platform.icon;
  return (
    <button
      type="button"
      data-platform={platform.id}
      onClick={onClick}
      aria-label={platform.label}
      className="p-2 text-gray-400 hover:text-emerald-400 hover:scale-110 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}

/** Copy link button with check icon feedback. */
function CopyLinkButton({ copied, onClick }: {
  copied: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Link copied" : "Copy link"}
      className="p-2 text-gray-400 hover:text-emerald-400 hover:scale-110 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
    >
      {copied
        ? <Check className="w-5 h-5 text-emerald-400" />
        : <Copy className="w-5 h-5" />}
    </button>
  );
}

interface FloatingSocialSidebarProps {
  /** Page title for share messages. Falls back to document.title. */
  title?: string;
  /** Custom share URL. Falls back to window.location.href. */
  url?: string;
}

/**
 * Floating social sharing sidebar with desktop and mobile layouts.
 * Desktop: fixed vertical pill on the left side.
 * Mobile: fixed horizontal bar at the bottom.
 *
 * @param props - Component props
 * @returns Rendered social sidebar
 */
export const FloatingSocialSidebar: React.FC<FloatingSocialSidebarProps> = ({
  title,
  url,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const getShareUrl = useCallback(() => url ?? window.location.href, [url]);
  const getShareMessage = useCallback(() => title ?? document.title, [title]);

  const handleShare = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const platformId = e.currentTarget.dataset.platform;
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    if (!platform) return;

    const shareUrl = platform.getShareUrl(getShareUrl(), getShareMessage());
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  }, [getShareUrl, getShareMessage]);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(getShareUrl());
    if (success) {
      showToast("success", "Link Copied");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [getShareUrl, showToast]);

  return (
    <>
      {/* Desktop — vertical pill on left */}
      <nav
        role="complementary"
        aria-label="Share this page"
        className="hidden md:flex md:flex-col fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-full shadow-lg p-2 gap-1"
      >
        {SOCIAL_PLATFORMS.map((platform) => (
          <SocialButton key={platform.id} platform={platform} onClick={handleShare} />
        ))}
        <div className="border-t border-white/10 my-1" />
        <CopyLinkButton copied={copied} onClick={handleCopy} />
      </nav>

      {/* Mobile — bottom bar */}
      <nav
        role="complementary"
        aria-label="Share this page"
        className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-white/10 shadow-lg justify-center items-center gap-1 px-2 py-1"
      >
        {SOCIAL_PLATFORMS.map((platform) => (
          <SocialButton key={platform.id} platform={platform} onClick={handleShare} />
        ))}
        <div className="border-l border-white/10 h-6 mx-1" />
        <CopyLinkButton copied={copied} onClick={handleCopy} />
      </nav>
    </>
  );
};

export default FloatingSocialSidebar;
