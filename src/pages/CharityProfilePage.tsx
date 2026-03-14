import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Share2,
  ChevronDown,
  ChevronUp,
  Heart,
  Globe,
  Mail,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { CharityHeroBanner } from '@/components/charity/CharityHeroBanner';
import { UnclaimedProfileBanner } from '@/components/charity/UnclaimedProfileBanner';
import { OrgDetailsCard } from '@/components/charity/OrgDetailsCard';
import { PhotosCard } from '@/components/charity/PhotosCard';
import { DonateWidget } from '@/components/charity/DonateWidget';
import { DonationModal } from '@/components/web3/donation/DonationModal';
import { getCharityProfileByEin } from '@/services/charityProfileService';
import { getIrsRecordByEin } from '@/services/irsDataService';
import type { IrsRecord } from '@/services/irsDataService';
import type { CharityProfile } from '@/types/charityProfile';
import { formatNteeCode, getNteeCategory } from '@/utils/nteeMap';
import {
  lookupIrsCode,
  formatRulingYear,
  formatActivityCodes,
} from '@/utils/irsCodeMaps';

/* ------------------------------------------------------------------ */
/* Helper: normalize EIN to hyphenated form                            */
/* ------------------------------------------------------------------ */
function normalizeEin(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return raw;
}

/* ------------------------------------------------------------------ */
/* Skeleton loader                                                     */
/* ------------------------------------------------------------------ */
function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">
      <Skeleton height={224} className="rounded-xl" />
      <Skeleton height={96} className="rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <Skeleton height={160} className="rounded-xl" />
          <Skeleton height={160} className="rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton height={200} className="rounded-xl" />
          <Skeleton height={200} className="rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Status pill                                                         */
/* ------------------------------------------------------------------ */
function StatusPill({ profile }: { profile: CharityProfile }) {
  if (profile.status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle className="h-3.5 w-3.5" />
        Verified 501(c)(3)
      </span>
    );
  }
  if (profile.status === 'claimed-pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        <Clock className="h-3.5 w-3.5" />
        Claimed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      <AlertTriangle className="h-3.5 w-3.5" />
      Unclaimed — IRS data only
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* IRS public record (collapsible)                                     */
/* ------------------------------------------------------------------ */
function IrsPublicRecord({ irsRecord }: { irsRecord: IrsRecord }) {
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const rows = useMemo(
    () => [
      { label: 'EIN', value: irsRecord.ein },
      { label: 'Name', value: irsRecord.name },
      {
        label: 'Location',
        value: [irsRecord.city, irsRecord.state, irsRecord.zip]
          .filter(Boolean)
          .join(', ') || '—',
      },
      { label: 'Ruling year', value: formatRulingYear(irsRecord.ruling) },
      { label: 'NTEE code', value: formatNteeCode(irsRecord.ntee_cd) },
      {
        label: 'Deductibility',
        value: lookupIrsCode('deductibility', irsRecord.deductibility),
      },
      {
        label: 'Affiliation',
        value: lookupIrsCode('affiliation', irsRecord.affiliation),
      },
      { label: 'Classification', value: irsRecord.classification ?? '—' },
      {
        label: 'Foundation type',
        value: lookupIrsCode('foundation', irsRecord.foundation),
      },
      { label: 'Activity codes', value: formatActivityCodes(irsRecord.activity) },
      { label: 'Organization type', value: irsRecord.organization ?? '—' },
      { label: 'Subsection', value: irsRecord.subsection ?? '—' },
      { label: 'Status', value: irsRecord.status ?? '—' },
    ],
    [irsRecord],
  );

  return (
    <Card hover={false} className="p-5">
      <button
        type="button"
        onClick={handleToggle}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-sm font-semibold text-gray-900">IRS Public Record</h3>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open && (
        <div className="mt-4 space-y-2">
          <dl className="space-y-2 text-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-gray-500 shrink-0">{row.label}</dt>
                <dd className="text-gray-900 font-medium text-right">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
            Data sourced from IRS Exempt Organizations dataset.
          </p>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Derived display values from profile + IRS data                      */
/* ------------------------------------------------------------------ */
interface ProfileDisplayData {
  orgName: string;
  location: string;
  rulingYear: string;
  isUnclaimed: boolean;
  isClaimed: boolean;
  nteeCategory: string;
  walletAddress: string | null;
  bannerImageUrl: string | null | undefined;
  photo1Url: string | null | undefined;
  photo2Url: string | null | undefined;
  description: string | null | undefined;
  missionStatement: string | null | undefined;
  contactEmail: string | null | undefined;
  website: string | null;
  claimedByUserId: string | null | undefined;
}

/** Extracts display-ready values from the raw profile and IRS record. */
function deriveDisplayData(
  profile: CharityProfile | null,
  irsRecord: IrsRecord | null,
): ProfileDisplayData {
  return {
    orgName: profile?.name ?? irsRecord?.name ?? 'Unknown Organization',
    location:
      profile?.location ??
      [irsRecord?.city, irsRecord?.state].filter(Boolean).join(', ') ??
      '',
    rulingYear: formatRulingYear(irsRecord?.ruling),
    isUnclaimed: !profile || profile.status === 'unclaimed',
    isClaimed: profile?.status === 'claimed-pending' || profile?.status === 'verified',
    nteeCategory: getNteeCategory(irsRecord?.ntee_cd ?? profile?.ntee_code),
    walletAddress: profile?.wallet_address ?? null,
    bannerImageUrl: (profile as Record<string, unknown>)?.banner_image_url as string | null | undefined,
    photo1Url: (profile as Record<string, unknown>)?.photo_1_url as string | null | undefined,
    photo2Url: (profile as Record<string, unknown>)?.photo_2_url as string | null | undefined,
    description: (profile as Record<string, unknown>)?.description as string | null | undefined,
    missionStatement: (profile as Record<string, unknown>)?.mission_statement as string | null | undefined,
    contactEmail: (profile as Record<string, unknown>)?.contact_email as string | null | undefined,
    website: profile?.website ?? null,
    claimedByUserId: (profile as Record<string, unknown>)?.claimed_by_user_id as string | null | undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Header card                                                         */
/* ------------------------------------------------------------------ */
/** Header card displayed flush below the hero banner with org name, status, and actions. */
function ProfileHeaderCard({
  orgName,
  ein,
  location,
  rulingYear,
  nteeCategory,
  profile,
  irsRecord,
  onDonate,
  onShare,
  copied,
}: {
  orgName: string;
  ein: string;
  location: string;
  rulingYear: string;
  nteeCategory: string;
  profile: CharityProfile | null;
  irsRecord: IrsRecord | null;
  onDonate: () => void;
  onShare: () => void;
  copied: boolean;
}) {
  return (
    <Card hover={false} className="rounded-t-none border-t-0 p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-serif text-2xl font-bold text-gray-900">
              {orgName}
            </h1>
            {profile && <StatusPill profile={profile} />}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>EIN {ein}</span>
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location}
              </span>
            )}
            {rulingYear !== '—' && <span>Registered {rulingYear}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {nteeCategory}
            </span>
            {irsRecord?.subsection === '03' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                501(c)(3)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={onDonate} icon={<Heart className="h-4 w-4" />}>
            Donate
          </Button>
          <button
            type="button"
            onClick={onShare}
            className="p-2.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors relative"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
            {copied && (
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs bg-gray-900 text-white px-2 py-0.5 rounded whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* About card                                                          */
/* ------------------------------------------------------------------ */
/** About card showing description, mission, or IRS activity codes as fallback. */
function AboutCard({
  description,
  missionStatement,
  mission,
  activity,
  website,
  einDigits,
}: {
  description: string | null | undefined;
  missionStatement: string | null | undefined;
  mission: string | undefined;
  activity: string | null | undefined;
  website: string | null;
  einDigits: string;
}) {
  return (
    <Card hover={false} className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">About</h3>
      {description || missionStatement || mission ? (
        <p className="text-sm text-gray-600 leading-relaxed">
          {description ?? missionStatement ?? mission}
        </p>
      ) : (
        <div className="text-sm text-gray-600">
          {activity && activity !== '000000000' ? (
            <>
              <p>
                This organization&apos;s activities include: activity codes{' '}
                {formatActivityCodes(activity)}.
              </p>
              <p className="italic text-gray-400 mt-2">
                This description has not been customized yet.{' '}
                <a
                  href={`/claim/${einDigits}`}
                  className="text-emerald-600 hover:underline not-italic"
                >
                  Claim this profile
                </a>
              </p>
            </>
          ) : (
            <p className="italic text-gray-400">
              No description available.{' '}
              <a
                href={`/claim/${einDigits}`}
                className="text-emerald-600 hover:underline not-italic"
              >
                Claim this profile
              </a>{' '}
              to add one.
            </p>
          )}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-emerald-600 hover:underline text-sm"
            >
              <Globe className="h-3.5 w-3.5" />
              {website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Contact card                                                        */
/* ------------------------------------------------------------------ */
/** Contact card shown for claimed profiles with email or website links. */
function ContactCard({
  website,
  contactEmail,
}: {
  website: string | null;
  contactEmail: string | null | undefined;
}) {
  return (
    <Card hover={false} className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact</h3>
      <div className="space-y-2 text-sm">
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-emerald-600 hover:underline"
          >
            <Globe className="h-4 w-4" />
            {website.replace(/^https?:\/\//, '')}
          </a>
        )}
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-2 text-emerald-600 hover:underline"
          >
            <Mail className="h-4 w-4" />
            {contactEmail}
          </a>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

/**
 * Full charity profile page with hero banner, header card, two-column layout,
 * and donate widget. Fetches data from both IRS records and charity_profiles.
 * @returns The rendered charity profile page
 */
function CharityProfilePage() {
  const { ein: rawEin } = useParams<{ ein: string }>();
  const [profile, setProfile] = useState<CharityProfile | null>(null);
  const [irsRecord, setIrsRecord] = useState<IrsRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const ein = rawEin ? normalizeEin(rawEin) : '';
  const einDigits = rawEin?.replace(/\D/g, '') ?? '';

  // Fetch both profile and IRS record in parallel
  const fetchData = useCallback(async () => {
    if (!rawEin) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const [profileResult, irsResult] = await Promise.all([
      getCharityProfileByEin(einDigits),
      getIrsRecordByEin(einDigits),
    ]);

    if (irsResult) {
      setIrsRecord(irsResult);
    }

    if (profileResult) {
      setProfile(profileResult);
    } else if (!irsResult) {
      setNotFound(true);
    }

    setLoading(false);
  }, [rawEin, einDigits]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set page title
  useEffect(() => {
    const name = profile?.name ?? irsRecord?.name;
    if (name) {
      document.title = `${name} | Give Protocol`;
    }
    return () => {
      document.title = 'Give Protocol';
    };
  }, [profile?.name, irsRecord?.name]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleOpenDonate = useCallback(() => {
    setShowDonationModal(true);
  }, []);

  const handleCloseDonate = useCallback(() => {
    setShowDonationModal(false);
  }, []);

  const handlePhotoUploaded = useCallback(
    (_slot: 1 | 2, _url: string) => {
      fetchData();
    },
    [fetchData],
  );

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (notFound && !irsRecord && !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card hover={false} className="p-8 text-center">
          <Building2
            aria-hidden="true"
            className="h-10 w-10 text-gray-300 mx-auto mb-4"
          />
          <p className="text-gray-600">
            We couldn&apos;t find a charity with this EIN.
          </p>
        </Card>
      </div>
    );
  }

  const display = deriveDisplayData(profile, irsRecord);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-5">
      {display.isUnclaimed && <UnclaimedProfileBanner ein={einDigits} />}

      <div>
        <CharityHeroBanner bannerImageUrl={display.bannerImageUrl} orgName={display.orgName} />
        <ProfileHeaderCard
          orgName={display.orgName}
          ein={ein}
          location={display.location}
          rulingYear={display.rulingYear}
          nteeCategory={display.nteeCategory}
          profile={profile}
          irsRecord={irsRecord}
          onDonate={handleOpenDonate}
          onShare={handleShare}
          copied={copied}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <AboutCard
            description={display.description}
            missionStatement={display.missionStatement}
            mission={profile?.mission}
            activity={irsRecord?.activity}
            website={display.website}
            einDigits={einDigits}
          />

          <PhotosCard
            ein={einDigits}
            photo1Url={display.photo1Url}
            photo2Url={display.photo2Url}
            claimedByUserId={display.claimedByUserId}
            onPhotoUploaded={handlePhotoUploaded}
          />

          {irsRecord && <IrsPublicRecord irsRecord={irsRecord} />}
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <DonateWidget
            ein={einDigits}
            charityName={display.orgName}
            walletAddress={display.walletAddress}
            charityId={profile?.id ?? einDigits}
            mode="sidebar"
          />

          {irsRecord && <OrgDetailsCard irsRecord={irsRecord} />}

          {display.isClaimed && (display.contactEmail || display.website) && (
            <ContactCard website={display.website} contactEmail={display.contactEmail} />
          )}
        </div>
      </div>

      {showDonationModal && (
        <DonationModal
          charityName={display.orgName}
          charityAddress={display.walletAddress ?? ''}
          charityId={profile?.id ?? einDigits}
          frequency="once"
          onClose={handleCloseDonate}
        />
      )}
    </div>
  );
}

export default CharityProfilePage;
