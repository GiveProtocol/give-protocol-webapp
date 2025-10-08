import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Logger } from "@/utils/logger";

interface Profile {
  id: string;
  user_id: string;
  type: "donor" | "charity";
  created_at: string;
}

/**
 * User profile management hook for fetching and managing user profile data
 * @function useProfile
 * @description Manages user profile lifecycle including automatic creation for new users, retry logic with exponential backoff,
 * and comprehensive error handling. Automatically fetches or creates profile based on authenticated user's metadata.
 * @returns {Object} Profile management state and data
 * @returns {Profile | null} returns.profile - User profile object containing id, user_id, type ('donor' | 'charity'), and created_at
 * @returns {boolean} returns.loading - Loading state for profile fetch/create operations
 * @returns {Error | null} returns.error - Error object if profile operations fail, null otherwise
 * @example
 * ```tsx
 * const { profile, loading, error } = useProfile();
 *
 * if (loading) return <ProfileSkeleton />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!profile) return <NoProfile />;
 *
 * return (
 *   <div>
 *     <h2>Profile Type: {profile.type}</h2>
 *     <p>User ID: {profile.user_id}</p>
 *     <p>Created: {new Date(profile.created_at).toLocaleDateString()}</p>
 *   </div>
 * );
 * ```
 */
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second base delay

  useEffect(() => {
    let mounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const fetchProfile = async () => {
      if (!user) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        // First try to get existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        // If no profile exists, create one
        if (!existingProfile) {
          const userType = user.user_metadata?.type || "donor";
          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert({
              user_id: user.id,
              type: userType,
            })
            .select()
            .single();

          if (insertError) throw insertError;

          if (mounted) {
            setProfile(newProfile);
            setError(null);
          }
        } else {
          if (mounted) {
            setProfile(existingProfile);
            setError(null);
          }
        }

        // Reset retry count on success
        setRetryCount(0);
      } catch (err) {
        Logger.error("Profile fetch failed", {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          retryCount,
        });

        if (mounted) {
          setError(
            err instanceof Error ? err : new Error("Failed to fetch profile"),
          );

          // Implement retry with exponential backoff
          if (retryCount < MAX_RETRIES) {
            const delay = RETRY_DELAY * Math.pow(2, retryCount);
            Logger.info(
              `Retrying profile fetch in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`,
            );

            retryTimeout = setTimeout(() => {
              setRetryCount((prev) => prev + 1);
              fetchProfile();
            }, delay);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [user, retryCount]);

  return { profile, loading, error };
}
