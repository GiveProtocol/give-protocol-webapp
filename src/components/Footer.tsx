import React from "react";
import { Link } from "react-router-dom";
import { FaBluesky, FaGithub, FaDiscord } from "react-icons/fa6";
import { Logo } from "@/components/Logo";
import { DOCS_CONFIG } from "@/config/docs";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/50 backdrop-blur-lg border-t border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-8">
          <div className="flex-1 min-w-0 lg:pr-16 mb-4 lg:mb-0">
            <Link
              to="/"
              className="flex items-center mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded text-xl font-bold text-gray-100"
            >
              <Logo className="h-6 w-6 mr-2" />
              Give Protocol
            </Link>
            <p className="text-sm text-gray-400">
              Empowering charitable giving through transparent and efficient
              blockchain technology.
            </p>
          </div>

          <div className="flex-1 min-w-0 lg:pl-16">
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={DOCS_CONFIG.url}
                  className="text-sm text-gray-400 hover:text-emerald-400 focus:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 -mx-1 transition-colors inline-block"
                >
                  Documentation & FAQ
                </a>
              </li>
              <li>
                <Link
                  to="/governance"
                  className="text-sm text-gray-400 hover:text-emerald-400 focus:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 -mx-1 transition-colors inline-block"
                >
                  Governance
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-400 hover:text-emerald-400 focus:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 -mx-1 transition-colors inline-block"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/legal"
                  className="text-sm text-gray-400 hover:text-emerald-400 focus:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 -mx-1 transition-colors inline-block"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-gray-400 hover:text-emerald-400 focus:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 -mx-1 transition-colors inline-block"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-4">
              Connect
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://giveprotocol.bsky.social"
                className="text-gray-400 hover:text-emerald-400 transition-colors focus:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-1"
                aria-label="Bluesky"
              >
                <FaBluesky className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/giveprotocol"
                className="text-gray-400 hover:text-emerald-400 transition-colors focus:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-1"
                aria-label="GitHub"
              >
                <FaGithub className="h-5 w-5" />
              </a>
              <a
                href="https://discord.gg/giveprotocol"
                className="text-gray-400 hover:text-emerald-400 transition-colors focus:text-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-1"
                aria-label="Discord"
              >
                <FaDiscord className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-emerald-500/20 pt-8">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Give Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
