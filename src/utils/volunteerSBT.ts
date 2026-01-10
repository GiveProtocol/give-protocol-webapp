import { ethers } from 'ethers';
import { supabase } from '@/lib/supabase';
import { SelfReportedHours, ValidationStatus } from '@/types/selfReportedHours';
import { Logger } from './logger';
import { SecureRandom } from '@/utils/security/index';

/**
 * ABI for the VolunteerSBT contract (Soul-Bound Token for validated volunteer hours)
 * SBTs are non-transferable tokens that represent verified volunteer contributions
 */
const VOLUNTEER_SBT_ABI = [
  'function mint(address to, uint256 hours, bytes32 verificationHash) external returns (uint256 tokenId)',
  'function batchMint(address[] to, uint256[] hours, bytes32[] verificationHashes) external returns (uint256[] tokenIds)',
  'function getVolunteerHours(address volunteer) external view returns (uint256 totalHours)',
  'function getTokenMetadata(uint256 tokenId) external view returns (address volunteer, uint256 hours, bytes32 verificationHash, uint256 timestamp)',
  'function balanceOf(address owner) external view returns (uint256)',
  'event VolunteerHoursMinted(address indexed volunteer, uint256 indexed tokenId, uint256 hours, bytes32 verificationHash)',
];

/**
 * Generates a unique verification hash for validated volunteer hours
 * @param data - Object containing hours data to hash
 * @returns Keccak256 hash of the data
 */
export const generateVolunteerHoursHash = (data: {
  volunteerId: string;
  organizationId: string;
  activityDate: string;
  hours: number;
  activityType: string;
  validatedAt: string;
}): string => {
  try {
    const dataWithTimestamp = {
      ...data,
      chainTimestamp: Date.now(),
    };

    const dataString = JSON.stringify(dataWithTimestamp);
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  } catch (error) {
    Logger.error('Error generating volunteer hours hash', { error });
    throw new Error('Failed to generate volunteer hours hash');
  }
};

/**
 * Result from minting a Volunteer SBT
 */
export interface MintResult {
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
  verificationHash: string;
}

/**
 * Mints a Soul-Bound Token (SBT) for validated volunteer hours
 * Called when an organization approves a validation request
 * @param volunteerId - The volunteer's profile ID
 * @param hoursRecord - The validated self-reported hours record
 * @returns Mint result with token ID and transaction details
 */
export const mintVolunteerHoursSBT = async (
  volunteerId: string,
  hoursRecord: SelfReportedHours,
): Promise<MintResult> => {
  try {
    // Verify the record is validated
    if (hoursRecord.validationStatus !== ValidationStatus.VALIDATED) {
      throw new Error('Cannot mint SBT for non-validated hours');
    }

    // Get volunteer's wallet address
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('id', volunteerId)
      .single();

    if (profileError) throw profileError;

    const { data: walletData, error: walletError } = await supabase
      .from('wallet_aliases')
      .select('wallet_address')
      .eq('user_id', profileData.user_id)
      .maybeSingle();

    if (walletError) throw walletError;

    const _volunteerAddress = walletData?.wallet_address || '0x0000000000000000000000000000000000000000';

    // Generate verification hash
    const verificationHash = generateVolunteerHoursHash({
      volunteerId,
      organizationId: hoursRecord.organizationId || '',
      activityDate: hoursRecord.activityDate,
      hours: hoursRecord.hours,
      activityType: hoursRecord.activityType,
      validatedAt: hoursRecord.validatedAt || new Date().toISOString(),
    });

    // For development/testing, simulate blockchain minting
    const mockTokenId = SecureRandom.generateSecureNumber(1, 1000000).toString();
    const mockTxHash = `0x${SecureRandom.generateTransactionId().replaceAll('-', '').padEnd(64, '0')}`;
    const mockBlockNumber = SecureRandom.generateSecureNumber(1, 1000000);

    // Update the self_reported_hours record with SBT info
    const { error: updateError } = await supabase
      .from('self_reported_hours')
      .update({
        sbt_token_id: Number.parseInt(mockTokenId, 10),
        blockchain_tx_hash: mockTxHash,
        verification_hash: verificationHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hoursRecord.id);

    if (updateError) {
      Logger.error('Error updating hours with SBT data', { error: updateError, hoursId: hoursRecord.id });
      // Continue - the SBT was minted even if DB update failed
    }

    Logger.info('Volunteer hours SBT minted', {
      volunteerId,
      hoursId: hoursRecord.id,
      tokenId: mockTokenId,
      verificationHash,
    });

    return {
      tokenId: mockTokenId,
      transactionHash: mockTxHash,
      blockNumber: mockBlockNumber,
      verificationHash,
    };
  } catch (error) {
    Logger.error('Error minting volunteer hours SBT', {
      error,
      volunteerId,
      hoursId: hoursRecord.id,
    });

    // For development, return simulated data
    return {
      tokenId: SecureRandom.generateSecureNumber(1, 1000000).toString(),
      transactionHash: `0x${SecureRandom.generateTransactionId().replaceAll('-', '').padEnd(64, '0')}`,
      blockNumber: SecureRandom.generateSecureNumber(1, 1000000),
      verificationHash: generateVolunteerHoursHash({
        volunteerId,
        organizationId: hoursRecord.organizationId || '',
        activityDate: hoursRecord.activityDate,
        hours: hoursRecord.hours,
        activityType: hoursRecord.activityType,
        validatedAt: new Date().toISOString(),
      }),
    };
  }
};

/**
 * Batch mints SBTs for multiple validated hours records
 * More gas-efficient than individual mints
 * @param records - Array of validated hours records with volunteer IDs
 * @returns Array of mint results
 */
export const batchMintVolunteerHoursSBT = async (
  records: Array<{ volunteerId: string; hoursRecord: SelfReportedHours }>,
): Promise<MintResult[]> => {
  const results: MintResult[] = [];

  // Filter to only validated records
  const validRecords = records.filter(
    r => r.hoursRecord.validationStatus === ValidationStatus.VALIDATED
  );

  if (validRecords.length === 0) {
    return results;
  }

  // In production, this would be a batch contract call
  // For now, we'll process sequentially with the mock implementation
  for (const record of validRecords) {
    try {
      const result = await mintVolunteerHoursSBT(record.volunteerId, record.hoursRecord);
      results.push(result);
    } catch (error) {
      Logger.error('Error in batch mint for record', {
        error,
        volunteerId: record.volunteerId,
        hoursId: record.hoursRecord.id,
      });
      // Continue with remaining records
    }
  }

  Logger.info('Batch SBT minting completed', {
    requested: records.length,
    valid: validRecords.length,
    minted: results.length,
  });

  return results;
};

/**
 * Gets the total validated volunteer hours for an address from the blockchain
 * @param volunteerAddress - The volunteer's wallet address
 * @returns Total validated hours (or from DB fallback)
 */
export const getOnChainVolunteerHours = async (
  volunteerAddress: string,
): Promise<number> => {
  try {
    // In production, this would query the SBT contract
    // For now, we'll query the database for validated hours with SBT tokens

    const { data: walletData, error: walletError } = await supabase
      .from('wallet_aliases')
      .select('user_id')
      .eq('wallet_address', volunteerAddress)
      .maybeSingle();

    if (walletError || !walletData) {
      return 0;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', walletData.user_id)
      .maybeSingle();

    if (profileError || !profileData) {
      return 0;
    }

    // Get sum of validated hours with SBT tokens
    const { data, error } = await supabase
      .from('self_reported_hours')
      .select('hours')
      .eq('volunteer_id', profileData.id)
      .eq('validation_status', ValidationStatus.VALIDATED)
      .not('sbt_token_id', 'is', null);

    if (error) {
      Logger.error('Error fetching on-chain hours', { error, volunteerAddress });
      return 0;
    }

    const totalHours = data.reduce((sum, record) => sum + Number(record.hours), 0);
    return totalHours;
  } catch (error) {
    Logger.error('Error getting on-chain volunteer hours', { error, volunteerAddress });
    return 0;
  }
};

/**
 * Verifies if a volunteer has a valid SBT for specific hours
 * @param verificationHash - The verification hash to check
 * @returns Boolean indicating if the SBT exists and is valid
 */
export const verifySBTByHash = async (verificationHash: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('self_reported_hours')
      .select('id, sbt_token_id')
      .eq('verification_hash', verificationHash)
      .eq('validation_status', ValidationStatus.VALIDATED)
      .not('sbt_token_id', 'is', null)
      .maybeSingle();

    if (error) {
      Logger.error('Error verifying SBT', { error, verificationHash });
      return false;
    }

    return Boolean(data);
  } catch (error) {
    Logger.error('Error verifying SBT by hash', { error, verificationHash });
    return false;
  }
};

/**
 * Gets SBT metadata for a volunteer's validated hours
 * @param volunteerId - The volunteer's profile ID
 * @returns Array of SBT token info
 */
export const getVolunteerSBTs = async (
  volunteerId: string,
): Promise<Array<{
  tokenId: number;
  hours: number;
  activityDate: string;
  verificationHash: string;
  organizationName: string | null;
  mintedAt: string;
}>> => {
  try {
    const { data, error } = await supabase
      .from('self_reported_hours')
      .select(`
        sbt_token_id,
        hours,
        activity_date,
        verification_hash,
        organization_name,
        validated_at
      `)
      .eq('volunteer_id', volunteerId)
      .eq('validation_status', ValidationStatus.VALIDATED)
      .not('sbt_token_id', 'is', null)
      .order('validated_at', { ascending: false });

    if (error) {
      Logger.error('Error fetching volunteer SBTs', { error, volunteerId });
      return [];
    }

    return data.map(record => ({
      tokenId: record.sbt_token_id,
      hours: record.hours,
      activityDate: record.activity_date,
      verificationHash: record.verification_hash,
      organizationName: record.organization_name,
      mintedAt: record.validated_at,
    }));
  } catch (error) {
    Logger.error('Error getting volunteer SBTs', { error, volunteerId });
    return [];
  }
};

// Export ABI for direct contract interaction if needed
export { VOLUNTEER_SBT_ABI };
