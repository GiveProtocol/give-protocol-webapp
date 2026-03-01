import React, { useState, useEffect } from "react";
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

interface FooterLink {
  label: string;
  href?: string;
  isExternal?: boolean;
  isDisabled?: boolean;
}

const features = [
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
      "Browse any registered organization, or look for the verified badge. Organizations that opt in to our vetting process earn on-chain verification donors can trust.",
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
      "Live on Base, Optimism, and Moonbeam. Give in ETH, USDC, or other major tokens — with more chains on the way.",
    color: "from-teal-500 to-emerald-500",
    badge: "Coming Soon",
  },
];

/** Hero section with animated title, vision statement, and CTA buttons. */
function HeroSection({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  return (
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
          Crypto-native giving with full on-chain transparency.
          Fiat-friendly when you need it. Every dollar traceable.
        </p>
      </div>

      {/* Vision Statement */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-12 max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Our Vision
        </h3>
        <p className="text-gray-300 text-lg leading-relaxed">
          Give Protocol is building the infrastructure for transparent,
          sustainable philanthropy across multiple blockchains. By deploying
          on Base, Optimism, and Moonbeam, we&apos;re meeting donors where
          they already are — whether they give in crypto or fiat — and
          creating funding mechanisms that transform one-time donations
          into lasting impact for charitable organizations worldwide.
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
  );
}

/** Individual feature card with icon, title, description, and optional badge. */
function FeatureCard({ feature }: { feature: { icon: React.ReactNode; title: string; description: string; color: string; badge: string | null } }) {
  return (
    <div className="group bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-emerald-500/30 transition-all hover:scale-105 cursor-pointer relative">
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
  );
}

/** Column listing benefits for a specific user role. */
function UserRoleColumn({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div>
      <div className={`${color} font-semibold mb-3`}>{title}</div>
      <ul className="space-y-2 text-gray-300">
        {items.map((item) => (
          <li key={item} className="flex items-start">
            <Check className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Section showcasing benefits for donors, organizations, and volunteers. */
function UserRoleSection({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  return (
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
        <UserRoleColumn
          title="For Donors"
          color="text-emerald-400"
          items={[
            "Give in crypto or fiat — your choice",
            "Governance participation via NFTs",
            "On-chain reputation building",
          ]}
        />
        <UserRoleColumn
          title="For Non-Profit Organizations"
          color="text-teal-400"
          items={[
            "Access new donor demographics",
            "Sustainable funding via CEFs",
            "Enhanced transparency reporting",
          ]}
        />
        <UserRoleColumn
          title="For Volunteers"
          color="text-cyan-400"
          items={[
            "Verifiable contribution records",
            "Portable skill credentials (SBTs)",
            "Achievement badges & recognition",
          ]}
        />
      </div>
    </div>
  );
}

/** Footer brand section with logo and tagline. */
function HomeFooterBrand() {
  return (
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
  );
}

/** Footer column with title and list of links. */
function HomeFooterLinks({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>
      <ul className="space-y-2 text-gray-400 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            {link.isDisabled ? (
              <span className="opacity-60">{link.label}</span>
            ) : link.isExternal ? (
              <a href={link.href} className="hover:text-emerald-400" target="_blank" rel="noopener noreferrer">{link.label}</a>
            ) : (
              <a href={link.href} className="hover:text-emerald-400">{link.label}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Card showcasing an individual planned impact fund. */
function ImpactFundCard({ icon, gradient, hoverBorder, title, description }: {
  icon: React.ReactNode;
  gradient: string;
  hoverBorder: string;
  title: string;
  description: string;
}) {
  return (
    <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden ${hoverBorder} transition-all`}>
      <div className={`h-48 ${gradient} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
      </div>
    </div>
  );
}

/** Single statistic item in the multichain section. */
function MultichainStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div className={`text-3xl font-bold ${color} mb-2`}>{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

/** Section explaining the multichain deployment strategy with key stats. */
function MultichainSection() {
  return (
    <section className="relative z-10 container mx-auto px-6 py-20">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-12 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Why We&apos;re Building Multichain
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          No single chain serves every donor. By deploying across leading
          EVM networks, we keep fees low, reach more wallets, and let
          organizations receive funds however works best for them.
        </p>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <MultichainStat value="3+" label="Supported Chains" color="text-emerald-400" />
          <MultichainStat value="Low Fees" label="L2 Transaction Costs" color="text-teal-400" />
          <MultichainStat value="Crypto + Fiat" label="Donation Options" color="text-cyan-400" />
          <MultichainStat value="EVM" label="Compatible" color="text-green-400" />
        </div>
      </div>
    </section>
  );
}

/** Call-to-action section inviting users to join the platform. */
function CTASection() {
  return (
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
  );
}

/** Home page footer with links and copyright. */
function HomeFooter() {
  const productLinks: FooterLink[] = [
    { label: "Features", href: "#features" },
    { label: "Impact Funds", href: "#impact" },
    { label: "For Charities", href: "#charities" },
    { label: "For Volunteers", href: "#volunteer" },
  ];
  const resourceLinks: FooterLink[] = [
    { label: "Documentation", href: "/documentation" },
    { label: "Whitepaper (Coming Soon)", isDisabled: true },
    { label: "Blog (Coming Soon)", isDisabled: true },
    { label: "Community (Coming Soon)", isDisabled: true },
  ];
  const connectLinks: FooterLink[] = [
    { label: "Bluesky", href: "https://giveprotocol.bsky.social", isExternal: true },
    { label: "Discord", href: "https://discord.gg/giveprotocol", isExternal: true },
    { label: "GitHub", href: "https://github.com/giveprotocol", isExternal: true },
    { label: "Contact (Coming Soon)", isDisabled: true },
  ];

  return (
    <footer className="relative z-10 container mx-auto px-6 py-12 border-t border-white/10">
      <div className="grid md:grid-cols-4 gap-8 mb-8">
        <HomeFooterBrand />
        <HomeFooterLinks title="Product" links={productLinks} />
        <HomeFooterLinks title="Resources" links={resourceLinks} />
        <HomeFooterLinks title="Connect" links={connectLinks} />
      </div>
      <div className="pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} Give Protocol Foundation. Multichain
          by design. Powered by Give Protocol volunteers.
        </p>
      </div>
    </footer>
  );
}

/** Landing page showcasing Give Protocol features, impact funds, and multichain strategy. */
const Home: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    /** Calculates mouse position offset for parallax animation effects. */
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

      <HeroSection mousePosition={mousePosition} />

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
            Multichain infrastructure for seamless giving — crypto or fiat —
            with complete transparency
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      {/* For Different Users Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <UserRoleSection mousePosition={mousePosition} />
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
          <ImpactFundCard
            icon={<Globe className="w-24 h-24 text-white/80" />}
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            hoverBorder="hover:border-emerald-500/30"
            title="Environmental Impact Fund"
            description="Supporting reforestation, ocean cleanup, and renewable energy initiatives. Pooled donations directed to verified environmental organizations making measurable impact."
          />
          <ImpactFundCard
            icon={<Users className="w-24 h-24 text-white/80" />}
            gradient="bg-gradient-to-br from-teal-500 to-cyan-600"
            hoverBorder="hover:border-teal-500/30"
            title="Education Opportunity Fund"
            description="Providing scholarships, digital learning tools, and teacher training. Collective funding amplified to support educational initiatives in underserved communities."
          />
        </div>
      </section>

      {/* Why Multichain Section */}
      <MultichainSection />

      {/* CTA Section */}
      <CTASection />

      <HomeFooter />
    </div>
  );
};

export default Home;
