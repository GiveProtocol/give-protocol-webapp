import { ethers } from "ethers";
import { supabase } from "@/lib/supabase";
import {
  VolunteerApplication,
  VolunteerHours,
  VolunteerVerification,
} from "@/types/volunteer";
import { Logger } from "./logger";
// import { useWeb3 } from '@/contexts/Web3Context'; // Unused import
// import { getContractAddress } from '@/config/contracts'; // Unused import
import { SecureRandom } from "@/utils/security/index";

// ABI for the VolunteerVerification contract
// @ts-expect-error - Variable defined but not used in current implementation, kept for future smart contract integration
// eslint-disable-next-line no-unused-vars
const _VOLUNTEER_VERIFICATION_ABI = [
  // Prefixed as unused
  "function verifyApplication(bytes32 _applicationHash, address _applicant) external",
  "function verifyHours(bytes32 _hoursHash, address _volunteer, uint256 _hours) external",
  "function checkApplicationVerification(bytes32 _applicationHash) external view returns (bool isVerified, address applicant, address charity, uint256 timestamp)",
  "function checkHoursVerification(bytes32 _hoursHash) external view returns (bool isVerified, address volunteer, address charity, uint256 hours, uint256 timestamp)",
];

/**
 * Generates a unique hash for volunteer activity verification
 * @param data Object containing data to hash
 * @returns Keccak256 hash of the data
 */
export const generateVerificationHash = (
  data: Record<string, unknown>,
): string => {
  try {
    // Add timestamp to ensure uniqueness
    const dataWithTimestamp = {
      ...data,
      timestamp: Date.now(),
    };

    // Convert to string and hash using ethers v6 pattern
    const dataString = JSON.stringify(dataWithTimestamp);
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  } catch (error) {
    Logger.error("Error generating verification hash", { error });
    throw new Error("Failed to generate verification hash");
  }
};

/**
 * Records application verification on blockchain
 * @param applicantId The applicant's ID
 * @param hash The verification hash
 */
export const recordApplicationOnChain = async (
  applicantId: string,
  hash: string,
): Promise<{ transactionId: string; blockNumber: number }> => {
  try {
    // Get applicant's wallet address from profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("id", applicantId)
      .single();

    if (profileError) throw profileError;

    // Get wallet address from wallet_aliases
    const { data: walletData, error: walletError } = await supabase
      .from("wallet_aliases")
      .select("wallet_address")
      .eq("user_id", profileData.user_id)
      .maybeSingle();

    if (walletError) throw walletError;

    const _applicantAddress =
      walletData?.wallet_address ||
      "0x0000000000000000000000000000000000000000"; // Prefixed as unused

    // For development/testing, return simulated blockchain data
    return {
      transactionId: SecureRandom.generateTransactionId(),
      blockNumber: SecureRandom.generateSecureNumber(1, 1000000),
    };
  } catch (error) {
    Logger.error("Error recording application on chain", {
      error,
      applicantId,
      hash,
    });

    // For development/testing, return simulated blockchain data
    return {
      transactionId: SecureRandom.generateTransactionId(),
      blockNumber: SecureRandom.generateSecureNumber(1, 1000000),
    };
  }
};

/**
 * Records hours verification on blockchain
 * @param volunteerId The volunteer's ID
 * @param hash The verification hash
 * @param hours The number of hours
 */
export const recordHoursOnChain = async (
  volunteerId: string,
  hash: string,
  _hours: number, // Prefixed as unused
): Promise<{ transactionId: string; blockNumber: number }> => {
  try {
    // Get volunteer's wallet address from profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("id", volunteerId)
      .single();

    if (profileError) throw profileError;

    // Get wallet address from wallet_aliases
    const { data: walletData, error: walletError } = await supabase
      .from("wallet_aliases")
      .select("wallet_address")
      .eq("user_id", profileData.user_id)
      .maybeSingle();

    if (walletError) throw walletError;

    const _volunteerAddress =
      walletData?.wallet_address ||
      "0x0000000000000000000000000000000000000000"; // Prefixed as unused

    // For development/testing, return simulated blockchain data
    return {
      transactionId: SecureRandom.generateTransactionId(),
      blockNumber: SecureRandom.generateSecureNumber(1, 1000000),
    };
  } catch (error) {
    Logger.error("Error recording hours on chain", {
      error,
      volunteerId,
      hash,
    });

    // For development/testing, return simulated blockchain data
    return {
      transactionId: SecureRandom.generateTransactionId(),
      blockNumber: SecureRandom.generateSecureNumber(1, 1000000),
    };
  }
};

/**
 * Creates a hash for volunteer application acceptance
 * @param application The volunteer application
 * @returns The generated hash
 */
export const createAcceptanceHash = async (
  application: VolunteerApplication,
): Promise<string> => {
  try {
    // Generate hash from application data
    const hash = generateVerificationHash({
      applicantId: application.applicantId,
      opportunityId: application.opportunityId,
      status: application.status,
      acceptedAt: new Date().toISOString(),
    });

    // Update application with hash
    const { error } = await supabase
      .from("volunteer_applications")
      .update({
        acceptance_hash: hash,
        updated_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    if (error) throw error;

    // Create verification record
    const { error: verificationError } = await supabase
      .from("volunteer_verifications")
      .insert({
        applicant_id: application.applicantId,
        opportunity_id: application.opportunityId,
        charity_id: application.charityId, // Assuming this is available
        acceptance_hash: hash,
        accepted_at: new Date().toISOString(),
      });

    if (verificationError) throw verificationError;

    // Record on blockchain
    try {
      await recordApplicationOnChain(application.applicantId, hash);
    } catch (blockchainError) {
      Logger.warn("Failed to record application on blockchain", {
        error: blockchainError,
        applicationId: application.id,
      });
      // Continue even if blockchain recording fails
    }

    return hash;
  } catch (error) {
    Logger.error("Error creating acceptance hash", {
      error,
      applicationId: application.id,
    });
    throw new Error("Failed to create acceptance hash");
  }
};

/**
 * Creates a hash for volunteer hours verification
 * @param hours The volunteer hours record
 * @returns The generated hash
 */
export const createVerificationHash = async (
  hours: VolunteerHours,
): Promise<string> => {
  try {
    // Generate hash from hours data
    const hash = generateVerificationHash({
      volunteerId: hours.volunteerId,
      charityId: hours.charityId,
      opportunityId: hours.opportunityId,
      hours: hours.hours,
      datePerformed: hours.datePerformed,
      status: hours.status,
      verifiedAt: new Date().toISOString(),
    });

    // Update hours with hash
    const { error } = await supabase
      .from("volunteer_hours")
      .update({
        verification_hash: hash,
        approved_at: new Date().toISOString(),
      })
      .eq("id", hours.id);

    if (error) throw error;

    // Update verification record if exists
    const { data: verificationData } = await supabase
      .from("volunteer_verifications")
      .select("id")
      .eq("applicant_id", hours.volunteerId)
      .eq("charity_id", hours.charityId)
      .eq("opportunity_id", hours.opportunityId || "")
      .maybeSingle();

    if (verificationData) {
      const { error: updateError } = await supabase
        .from("volunteer_verifications")
        .update({
          verification_hash: hash,
          verified_at: new Date().toISOString(),
        })
        .eq("id", verificationData.id);

      if (updateError) throw updateError;
    } else {
      // Create new verification record if not exists
      const { error: insertError } = await supabase
        .from("volunteer_verifications")
        .insert({
          applicant_id: hours.volunteerId,
          opportunity_id: hours.opportunityId || "",
          charity_id: hours.charityId,
          verification_hash: hash,
          verified_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
    }

    // Record on blockchain
    try {
      await recordHoursOnChain(hours.volunteerId, hash, hours.hours);
    } catch (blockchainError) {
      Logger.warn("Failed to record hours on blockchain", {
        error: blockchainError,
        hoursId: hours.id,
      });
      // Continue even if blockchain recording fails
    }

    return hash;
  } catch (error) {
    Logger.error("Error creating verification hash", {
      error,
      hoursId: hours.id,
    });
    throw new Error("Failed to create verification hash");
  }
};

/**
 * Records verification hash on blockchain
 * @param verification The volunteer verification record
 * @returns Transaction details
 */
export const recordVerificationOnChain = async (
  verification: VolunteerVerification,
): Promise<{ transactionId: string; blockNumber: number }> => {
  try {
    if (verification.verificationHash) {
      // This is a hours verification
      return await recordHoursOnChain(
        verification.applicantId,
        verification.verificationHash,
        10, // Default hours value, should be retrieved from the actual hours record
      );
    } else if (verification.acceptanceHash) {
      // This is an application verification
      return await recordApplicationOnChain(
        verification.applicantId,
        verification.acceptanceHash,
      );
    }

    throw new Error("No verification hash provided");
  } catch (error) {
    Logger.error("Error recording verification on chain", {
      error,
      verificationId: verification.id,
    });

    // For development/testing, return simulated blockchain data
    return {
      transactionId: SecureRandom.generateTransactionId(),
      blockNumber: SecureRandom.generateSecureNumber(1, 1000000),
    };
  }
};

/**
 * Verifies a volunteer verification hash
 * @param hash The hash to verify
 * @returns Boolean indicating if hash is valid
 */
export const verifyVolunteerHash = async (hash: string): Promise<boolean> => {
  try {
    // Check if hash exists in database
    const { data, error } = await supabase
      .from("volunteer_verifications")
      .select("*")
      .or(`acceptance_hash.eq.${hash},verification_hash.eq.${hash}`)
      .maybeSingle();

    if (error) throw error;

    return Boolean(data);
  } catch (error) {
    Logger.error("Error verifying volunteer hash", { error, hash });
    return false;
  }
};
