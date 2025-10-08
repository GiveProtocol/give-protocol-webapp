// Contribution Types
export interface ContributionFilters {
  organization: string;
  category: string;
  region: string;
  timeRange: string;
}

export interface DonationStatsProps {
  stats?: {
    totalDonated: number;
    volunteerHours: number;
    skillsEndorsed: number;
  };
  isPersonal?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  alias: string;
  walletAddress: string;
  displayName?: string;
  totalDonated: number;
  rank: number;
}

export interface VolunteerStats {
  totalHours: number;
  skillsEndorsed: number;
  organizationsHelped: number;
  recentAchievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  organization: string;
  date: string;
}

export interface Donation {
  id: string;
  amount: number;
  organization: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface VolunteerLeader {
  id: string;
  alias: string;
  walletAddress: string;
  displayName?: string;
  hours: number;
  endorsements: number;
  rank: number;
}

// Transaction data for blockchain transactions
export interface Transaction {
  id: string;
  hash?: string;
  from?: string;
  to?: string;
  amount: number;
  cryptoType?: string;
  fiatValue?: number;
  fee?: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  purpose?: string;
  metadata?: TransactionMetadata;
}

// Enhanced metadata structure for all transaction types
export interface TransactionMetadata extends Record<string, unknown> {
  // Common fields
  organization?: string;
  category?: string;
  description?: string;
  verificationHash?: string;
  blockNumber?: number;
  
  // Volunteer-specific fields
  opportunity?: string;
  hours?: number;
  startTime?: string;
  endTime?: string;
  skills?: string[];
  endorsementText?: string;
  applicationText?: string;
  availability?: string;
  acceptanceDate?: string;
  acceptedBy?: string;
  transactionInitiator?: 'volunteer' | 'charity';
  relatedTransactionId?: string;
}

export interface TransactionExportOptions {
  includePersonalInfo?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  cryptoTypes?: string[];
}