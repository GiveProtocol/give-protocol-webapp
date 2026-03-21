export type CharityProfileStatus = 'unclaimed' | 'claimed-pending' | 'verified';

export type WalletType = 'new_custodial' | 'existing_evm';

export type PaymentProcessor = 'helcim' | 'paypal';

export interface CharityProfile {
  id: string;
  ein: string;
  name: string;
  mission: string | null;
  location: string | null;
  website: string | null;
  logo_url: string | null;
  photo_urls: string[];
  ntee_code: string | null;
  founded: string | null;
  irs_status: string | null;
  employees: number | null;
  status: CharityProfileStatus;
  nominations_count: number;
  interested_donors_count: number;
  authorized_signer_name: string | null;
  authorized_signer_title: string | null;
  authorized_signer_email: string | null;
  authorized_signer_phone: string | null;
  claimed_by: string | null;
  wallet_address: string | null;
  wallet_type: WalletType | null;
  payment_processor: PaymentProcessor | null;
  claimed_at: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CharityNomination {
  id: string;
  charity_id: string;
  nominator_email: string | null;
  created_at: string;
}
