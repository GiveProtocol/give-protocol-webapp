import { supabase } from "@/lib/supabase";
import { Logger } from "@/utils/logger";

interface PrivacySettings {
  showDonations?: boolean;
  showVolunteerHours?: boolean;
  showSkillEndorsements?: boolean;
  publicProfile?: boolean;
}

interface UserPreferenceRow {
  user_id: string;
  privacy_settings: PrivacySettings | null;
}

/**
 * Fetches the set of user IDs who have opted out of public visibility
 * for a specific privacy field. Users are considered private if either
 * `publicProfile` is false OR the specific field is false.
 *
 * @param field - The privacy field to check (e.g., "showDonations", "showVolunteerHours")
 * @returns A Set of user IDs who should be excluded from public views
 */
export async function getPrivateUserIds(
  field: "showDonations" | "showVolunteerHours" | "showSkillEndorsements",
): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("user_id, privacy_settings");

    if (error) {
      Logger.warn("Error fetching user privacy preferences", { error });
      return new Set();
    }

    if (!data) return new Set();

    const privateIds = new Set<string>();

    (data as UserPreferenceRow[]).forEach((row) => {
      const settings = row.privacy_settings;
      if (!settings) return;

      if (settings.publicProfile === false || settings[field] === false) {
        privateIds.add(row.user_id);
      }
    });

    return privateIds;
  } catch (error) {
    Logger.warn("Failed to fetch privacy settings, defaulting to no exclusions", { error });
    return new Set();
  }
}
