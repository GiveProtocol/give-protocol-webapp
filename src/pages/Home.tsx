import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  TrendingUp,
  Users,
  Globe,
  Shield,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const Home: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-gray-100 overflow-hidden">
      {/* Animated Background Elements - Emerald/Teal Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
        {/* Existing Logo with Emerald Theme Colors */}
        <div className="flex items-center space-x-2">
          <Logo className="w-8 h-8 text-emerald-400" />
          <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Give Protocol
          </span>
        </div>

        <div className="hidden md:flex space-x-8">
          <a
            href="#features"
            className="hover:text-emerald-400 transition-colors"
          >
            Features
          </a>
          <a
            href="#impact"
            className="hover:text-emerald-400 transition-colors"
          >
            Impact
          </a>
          <a
            href="#charities"
            className="hover:text-emerald-400 transition-colors"
          >
            Charities
          </a>
          <a
            href="#volunteer"
            className="hover:text-emerald-400 transition-colors"
          >
            Volunteer
          </a>
        </div>
        <button
          disabled
          className="bg-gradient-to-r from-emerald-500/50 to-teal-500/50 px-6 py-2 rounded-full font-semibold cursor-not-allowed opacity-60"
        >
          Coming Soon
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20 text-center">
        <div
          className="transform transition-transform duration-300"
          style={{
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Transparent Giving
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Sustainable Impact
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Revolutionizing philanthropy through blockchain transparency.
            Verified charities and projects. Complete on-chain visibility.
          </p>
        </div>

        {/* Vision Statement */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-12 max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Our Vision
          </h3>
          <p className="text-gray-300 text-lg leading-relaxed">
            Give Protocol is building the infrastructure for transparent,
            sustainable philanthropy on the blockchain. By leveraging
            Moonbeam&apos;s EVM compatibility and Polkadot&apos;s security,
            we&apos;re creating innovative funding mechanisms that transform
            one-time donations into lasting impact for verified charitable
            organizations worldwide.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            disabled
            className="bg-gradient-to-r from-emerald-500/50 to-teal-500/50 px-8 py-4 rounded-full font-semibold text-lg cursor-not-allowed opacity-60 flex items-center space-x-2"
          >
            <span>Coming Soon</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="https://docs.giveprotocol.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/20 transition-all"
          >
            Read Documentation
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="features"
        className="relative z-10 container mx-auto px-6 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Your Gateway to Transparent Philanthropy
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built on Moonbeam for seamless blockchain giving and complete
            transparency
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Heart className="w-10 h-10" />,
              title: "Direct Donations",
              description:
                "Send crypto directly to verified charities and projects. Transparent on-chain tracking ensures your donation reaches those in need.",
              color: "from-emerald-500 to-teal-500",
              badge: null,
            },
            {
              icon: <TrendingUp className="w-10 h-10" />,
              title: "Charitable Equity Funds",
              description:
                "Transform donations into sustainable yield streams. Your contribution generates ongoing support through conservative DeFi strategies.",
              color: "from-teal-500 to-cyan-500",
              badge: "Coming Soon",
            },
            {
              icon: <Users className="w-10 h-10" />,
              title: "Impact Funds",
              description:
                "Pool resources for specific causes. Environmental, education, poverty relief - your donation amplified through collective action.",
              color: "from-cyan-500 to-sky-500",
              badge: null,
            },
            {
              icon: <Shield className="w-10 h-10" />,
              title: "Verified Organizations",
              description:
                "Every charity undergoes rigorous verification. Legitimate charitable organizations and projects thoroughly vetted for authenticity.",
              color: "from-green-500 to-emerald-500",
              badge: null,
            },
            {
              icon: <Zap className="w-10 h-10" />,
              title: "Blockchain Verified",
              description:
                "Soul-bound tokens recognize volunteer contributions. Skills, hours, and impact - all permanently recorded on-chain.",
              color: "from-lime-500 to-green-500",
              badge: null,
            },
            {
              icon: <Globe className="w-10 h-10" />,
              title: "Cross-Chain Connected",
              description:
                "Seamless connections across multiple blockchains via Moonbeam. Give in DOT, GLMR, or major stablecoins.",
              color: "from-teal-500 to-emerald-500",
              badge: "Coming Soon",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-emerald-500/30 transition-all hover:scale-105 cursor-pointer relative"
            >
              {feature.badge && (
                <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/50 px-3 py-1 rounded-full text-xs text-emerald-300">
                  {feature.badge}
                </div>
              )}
              <div
                className={`inline-block p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}
              >
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Different Users Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div
          className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 backdrop-blur-lg border border-white/10 rounded-3xl p-12"
          style={{
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
          }}
        >
          <h2 className="text-4xl font-bold text-center mb-12">
            Built for Everyone Changing the World
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-emerald-400 font-semibold mb-3">
                For Crypto-Native Donors
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Seamless crypto donation mechanisms</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Governance participation via NFTs</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>On-chain reputation building</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-teal-400 font-semibold mb-3">
                For Non-Profit Organizations
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Access new donor demographics</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Sustainable funding via CEFs</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Enhanced transparency reporting</span>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-cyan-400 font-semibold mb-3">
                For Volunteers
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Verifiable contribution records</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Portable skill credentials (SBTs)</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Achievement badges & recognition</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Showcase */}
      <section
        id="impact"
        className="relative z-10 container mx-auto px-6 py-20"
      >
        <h2 className="text-4xl font-bold text-center mb-12">
          Planned Impact Funds
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all">
            <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Globe className="w-24 h-24 text-white/80" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">
                Environmental Impact Fund
              </h3>
              <p className="text-gray-400 mb-4">
                Supporting reforestation, ocean cleanup, and renewable energy
                initiatives. Pooled donations directed to verified environmental
                organizations making measurable impact.
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all">
            <div className="h-48 bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Users className="w-24 h-24 text-white/80" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">
                Education Opportunity Fund
              </h3>
              <p className="text-gray-400 mb-4">
                Providing scholarships, digital learning tools, and teacher
                training. Collective funding amplified to support educational
                initiatives in underserved communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Moonbeam Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Why We&apos;re Building on Moonbeam
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Moonbeam&apos;s EVM compatibility, Polkadot security, and
            interoperability make it the perfect foundation for transparent,
            global philanthropy.
          </p>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">
                51+
              </div>
              <div className="text-sm text-gray-400">Polkadot Parachains</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-400 mb-2">
                Low Fees
              </div>
              <div className="text-sm text-gray-400">Transaction Costs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">~12s</div>
              <div className="text-sm text-gray-400">Block Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">EVM</div>
              <div className="text-sm text-gray-400">Compatible</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-12 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to Transform Giving?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be among the first to experience transparent, blockchain-powered
            philanthropy. Join our community building a better future for
            charitable giving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              disabled
              className="bg-white/50 text-emerald-600/70 px-8 py-4 rounded-full font-semibold text-lg cursor-not-allowed opacity-60"
            >
              Coming Soon
            </button>
            <a
              href="https://docs.giveprotocol.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 transition-all"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-white/10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img
                src="/give_logo_gradient.svg"
                alt="Give Protocol"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold">Give Protocol</span>
            </div>
            <p className="text-gray-400 text-sm">
              Transforming philanthropy through blockchain transparency and
              sustainable funding.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#features" className="hover:text-emerald-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#impact" className="hover:text-emerald-400">
                  Impact Funds
                </a>
              </li>
              <li>
                <a href="#charities" className="hover:text-emerald-400">
                  For Charities
                </a>
              </li>
              <li>
                <a href="#volunteer" className="hover:text-emerald-400">
                  For Volunteers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/documentation" className="hover:text-emerald-400">
                  Documentation
                </Link>
              </li>
              <li>
                <span className="opacity-60">Whitepaper (Coming Soon)</span>
              </li>
              <li>
                <span className="opacity-60">Blog (Coming Soon)</span>
              </li>
              <li>
                <span className="opacity-60">Community (Coming Soon)</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a
                  href="https://giveprotocol.bsky.social"
                  className="hover:text-emerald-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bluesky
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/giveprotocol"
                  className="hover:text-emerald-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/giveprotocol"
                  className="hover:text-emerald-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <span className="opacity-60">Contact (Coming Soon)</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
          <p>
            © 2025 Give Protocol Foundation. Building on Moonbeam. Powered by
            Give Protocol volunteers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
