import { UUID, Timestamp } from './common';

export interface UserProfile {
  id: UUID;
  userId: UUID;
  type: 'donor' | 'charity' | 'admin';
  createdAt: Timestamp;
}

export interface DonorProfile extends UserProfile {
  preferredCategories?: UUID[];
  donationFrequency?: 'one-time' | 'monthly' | 'quarterly' | 'yearly';
  totalDonated: number;
}

export interface CharityProfile extends UserProfile {
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  totalReceived: number;
  availableBalance: number;
}

export interface UserPreferences {
  id: UUID;
  userId: UUID;
  notificationPreferences: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    donationReceipts?: boolean;
    marketingUpdates?: boolean;
    impactReports?: boolean;
  };
  privacySettings: {
    showDonations?: boolean;
    showVolunteerHours?: boolean;
    showSkillEndorsements?: boolean;
    publicProfile?: boolean;
  };
}

export interface WalletAlias {
  id: UUID;
  userId: UUID;
  walletAddress: string;
  alias: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}