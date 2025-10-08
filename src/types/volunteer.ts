import { UUID, Timestamp } from './common';
// import { Address } from './common'; // Unused import

/* eslint-disable no-unused-vars */

export enum VolunteerOpportunityStatus {
  _ACTIVE = 'active', // Prefixed with _ as currently unused
  _COMPLETED = 'completed', // Prefixed with _ as currently unused
  _CANCELLED = 'cancelled' // Prefixed with _ as currently unused
}

export enum VolunteerApplicationStatus {
  _PENDING = 'pending', // Prefixed with _ as currently unused
  _APPROVED = 'approved', // Prefixed with _ as currently unused
  _REJECTED = 'rejected' // Prefixed with _ as currently unused
}

export enum VolunteerHoursStatus {
  _PENDING = 'pending', // Prefixed with _ as currently unused
  _APPROVED = 'approved', // Prefixed with _ as currently unused
  _REJECTED = 'rejected' // Prefixed with _ as currently unused
}

export enum CommitmentType {
  _ONE_TIME = 'one-time', // Prefixed with _ as currently unused
  _SHORT_TERM = 'short-term', // Prefixed with _ as currently unused
  _LONG_TERM = 'long-term' // Prefixed with _ as currently unused
}

export enum OpportunityType {
  _ONSITE = 'onsite', // Prefixed with _ as currently unused
  _REMOTE = 'remote', // Prefixed with _ as currently unused
  _HYBRID = 'hybrid' // Prefixed with _ as currently unused
}

export enum WorkLanguage {
  ENGLISH = 'english', // Used in VolunteerOpportunities.tsx
  SPANISH = 'spanish', // Used in VolunteerOpportunities.tsx
  GERMAN = 'german', // Used in VolunteerOpportunities.tsx
  FRENCH = 'french', // Used in VolunteerOpportunities.tsx
  JAPANESE = 'japanese', // Used in VolunteerOpportunities.tsx
  _CHINESE_SIMPLIFIED = 'chinese_simplified', // Prefixed with _ as currently unused
  _CHINESE_TRADITIONAL = 'chinese_traditional', // Prefixed with _ as currently unused
  _THAI = 'thai', // Prefixed with _ as currently unused
  _VIETNAMESE = 'vietnamese', // Prefixed with _ as currently unused
  _KOREAN = 'korean', // Prefixed with _ as currently unused
  _ARABIC = 'arabic', // Prefixed with _ as currently unused
  _HINDI = 'hindi', // Prefixed with _ as currently unused
  _MULTIPLE = 'multiple' // Prefixed with _ as currently unused
}

export interface VolunteerOpportunity {
  id: UUID;
  charityId: UUID;
  title: string;
  description: string;
  skills: string[];
  commitment: CommitmentType;
  location: string;
  type: OpportunityType;
  status: VolunteerOpportunityStatus;
  workLanguage: WorkLanguage;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VolunteerApplication {
  id: UUID;
  opportunityId: UUID;
  applicantId: UUID;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  availability: {
    days: string[];
    times: string[];
  };
  commitmentType: CommitmentType;
  experience?: string;
  skills?: string[];
  certifications?: string[];
  interests?: string[];
  referenceContacts?: {
    name: string;
    contact: string;
  }[];
  workSamples?: string[];
  status: VolunteerApplicationStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  acceptanceHash?: string; // Hash created when application is accepted
}

export interface VolunteerHours {
  id: UUID;
  volunteerId: UUID;
  charityId: UUID;
  opportunityId?: UUID;
  hours: number;
  description?: string;
  datePerformed: string;
  status: VolunteerHoursStatus;
  createdAt: Timestamp;
  approvedAt?: Timestamp;
  approvedBy?: UUID;
  verificationHash?: string; // Hash created when hours are verified
}

export interface VolunteerVerification {
  id: UUID;
  applicantId: UUID;
  opportunityId: UUID;
  charityId: UUID;
  acceptanceHash: string; // Hash for application acceptance
  verificationHash?: string; // Hash for hours verification
  acceptedAt: Timestamp;
  verifiedAt?: Timestamp;
  blockchainReference?: {
    network: string;
    transactionId: string;
    blockNumber: number;
  };
}