import React from "react";
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Trees,
  Droplets,
  Heart,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { GivingOptionsCard } from "@/components/web3/donation/GivingButtons";
import { HeroSection } from "@/components/ui/HeroSection";
import type { CauseProfileData, ImpactStat } from "@/types/charity";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/** Maps icon name strings to Lucide components for impact stat cards. */
const IMPACT_ICON_MAP: Record<string, LucideIcon> = {
  Users,
  GraduationCap,
  School,
  BookOpen,
  Trees,
  Droplets,
  Heart,
  Globe,
};

/** Card showing project timeline, location, key partners, and on-chain verified badge. */
function ProjectDetailsCard({ cause }: {
  cause: CauseProfileData;
}): React.ReactElement {
  return (
    <div className="bg-white dark:bg-[#111110] p-6 rounded-2xl shadow-sm space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-[#f2f0ec]">
        Project Details
      </h2>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Timeline</p>
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-3">{cause.timeline}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
        <p className="font-medium text-gray-900 dark:text-gray-100 mb-3">{cause.location}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Key Partners</p>
        <ul className="list-disc list-inside space-y-1">
          {cause.partners.map((partner) => (
            <li key={partner} className="text-gray-700 dark:text-gray-300">
              {partner}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">On-chain Verified</span>
      </div>
    </div>
  );
}

/** Parses a number from the start of an impact string (e.g. "10,000+ people" → "10,000+"). */
function parseImpactString(item: string): ImpactStat {
  const match = item.match(/^([\d,]+\+?%?)/);
  const value = match ? match[1] : "—";
  const label = match ? item.slice(match[0].length).trim() : item;
  return { value, label, icon: "Heart" };
}

/** Single impact stat card with icon, value, and label. */
function ImpactStatCard({ stat }: { stat: ImpactStat }): React.ReactElement {
  const IconComponent = IMPACT_ICON_MAP[stat.icon ?? "Heart"] ?? Heart;
  return (
    <div className="bg-white dark:bg-[#111110] rounded-2xl shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200">
      <IconComponent className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
    </div>
  );
}

/** Full-width section displaying impact statistics as a horizontal card row. */
function ImpactHighlightsSection({ cause }: {
  cause: CauseProfileData;
}): React.ReactElement {
  const stats: ImpactStat[] = cause.impactStats ?? cause.impact.map(parseImpactString);

  return (
    <div className="mt-12">
      <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Impact Highlights
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <ImpactStatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </div>
  );
}

interface CausePageTemplateProps {
  /** The cause profile data to display */
  cause: CauseProfileData;
}

/**
 * Reusable template component for rendering cause/project detail pages.
 * Premium narrative layout with sticky sidebar and impact statistics.
 *
 * @param props - Component props containing cause data
 * @returns Rendered cause page
 */
export const CausePageTemplate: React.FC<CausePageTemplateProps> = ({
  cause,
}) => {
  const solutionFallback = `Through dedicated partnerships and community engagement, this initiative is making measurable progress toward its goals. Working with ${cause.partners.length} key partners in ${cause.location}, the project delivers sustainable outcomes that create lasting change.`;

  return (
    <>
      <HeroSection
        image={cause.image}
        title={cause.name}
        description={cause.description}
      />

      <main className="bg-slate-50/50 dark:bg-transparent min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column (60%) — Narrative */}
            <div className="lg:col-span-3 space-y-8">
              <ScrollReveal direction="up" delay={100}>
                <div className="bg-white dark:bg-[#111110] rounded-2xl shadow-sm p-8">
                  <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    The Problem
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {cause.problem ?? cause.description}
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200}>
                <div className="bg-white dark:bg-[#111110] rounded-2xl shadow-sm p-8">
                  <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    How We&apos;re Helping
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {cause.solution ?? solutionFallback}
                  </p>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column (40%) — Sticky Sidebar */}
            <aside className="lg:col-span-2">
              <div className="sticky top-8 space-y-6">
                <ScrollReveal direction="up" delay={100}>
                  <GivingOptionsCard heading="Support This Cause" charityName={cause.name} charityAddress={cause.charityId} />
                </ScrollReveal>
                <ScrollReveal direction="up" delay={200}>
                  <ProjectDetailsCard cause={cause} />
                </ScrollReveal>
              </div>
            </aside>
          </div>

          {/* Full-Width Impact Highlights (bottom) */}
          <ScrollReveal direction="up" delay={300}>
            <ImpactHighlightsSection cause={cause} />
          </ScrollReveal>
        </div>
      </main>
    </>
  );
};

export default CausePageTemplate;
