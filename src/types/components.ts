import { ReactNode, CSSProperties } from 'react';
import { Charity, Campaign, CharityCategory } from './charity';
import { TokenAmount } from './blockchain';

// Base Component Props
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  testId?: string;
  children?: ReactNode;
}

// Charity Component Props
export interface CharityCardProps extends BaseComponentProps {
  charity: Charity;
  onDonate?: (_charityId: string) => void; // Prefixed as unused
  onShare?: (_charityId: string) => void; // Prefixed as unused
  showStats?: boolean;
  compact?: boolean;
}

export interface CharityListProps extends BaseComponentProps {
  charities: Charity[];
  loading?: boolean;
  error?: Error;
  onCharityClick?: (_charity: Charity) => void; // Prefixed as unused
  layout?: 'grid' | 'list';
  showPagination?: boolean;
}

export interface CharityFilterProps extends BaseComponentProps {
  categories: CharityCategory[];
  selectedCategories: CharityCategory[];
  onCategoryChange: (_categories: CharityCategory[]) => void; // Prefixed as unused
  showVerifiedOnly: boolean;
  onVerifiedChange: (_verified: boolean) => void; // Prefixed as unused
}

// Campaign Component Props
export interface CampaignCardProps extends BaseComponentProps {
  campaign: Campaign;
  onDonate?: (_campaignId: string) => void; // Prefixed as unused
  showProgress?: boolean;
  showTimeLeft?: boolean;
}

export interface CampaignListProps extends BaseComponentProps {
  campaigns: Campaign[];
  loading?: boolean;
  error?: Error;
  onCampaignClick?: (_campaign: Campaign) => void; // Prefixed as unused
  layout?: 'grid' | 'list';
}

// Form Component Props
export interface DonationFormProps extends BaseComponentProps {
  charityId: string;
  campaignId?: string;
  onSubmit: (_amount: TokenAmount) => Promise<void>; // Prefixed as unused
  onCancel?: () => void;
  minAmount?: TokenAmount;
  maxAmount?: TokenAmount;
}

// Context Types
export interface CharityContextType {
  selectedCharity?: Charity;
  setSelectedCharity: (_charity?: Charity) => void; // Prefixed as unused
  loading: boolean;
  error?: Error;
}

export interface DonationContextType {
  pendingDonations: PendingDonation[];
  addDonation: (_donation: Omit<PendingDonation, 'status'>) => void; // Prefixed as unused
  removeDonation: (_donationId: string) => void; // Prefixed as unused
}

export interface PendingDonation {
  id: string;
  charityId: string;
  campaignId?: string;
  amount: TokenAmount;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// UI Component Props
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
  label?: string;
  error?: string;
  helperText?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  value: string | number;
  onChange: (_value: string) => void; // Prefixed as unused
  required?: boolean;
  disabled?: boolean;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}