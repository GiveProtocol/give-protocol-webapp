import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { setMockResult, resetMockState } from "@/lib/supabase";
import { Logger } from "@/utils/logger";
import { useCharityProfile } from "./useCharityProfile";

// useProfile, supabase, and logger are all mocked via moduleNameMapper.
const mockUseProfile = useProfile as jest.Mock;

describe("useCharityProfile", () => {
  beforeEach(() => {
    resetMockState();
    mockUseProfile.mockReturnValue({
      profile: null,
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });
    (Logger.error as jest.Mock).mockClear();
  });

  // ---------- No profile ----------

  it("returns null profile and loading state when useProfile has no profile", async () => {
    const { result } = renderHook(() => useCharityProfile());

    // loading starts true, but since fetchCharityProfile exits early (no profile?.id),
    // it stays true (the finally block only runs if the async function body executes)
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(typeof result.current.updateProfile).toBe("function");
  });

  // ---------- Successful fetch ----------

  it("fetches and returns charity profile when useProfile has a profile", async () => {
    const charityData = {
      name: "Test Charity",
      description: "A great charity",
      category: "education",
      image_url: "https://example.com/logo.png",
    };

    mockUseProfile.mockReturnValue({
      profile: { id: "profile-1", user_id: "u1", type: "charity", created_at: "2024-01-01" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("charity_details", { data: charityData, error: null });

    const { result } = renderHook(() => useCharityProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(charityData);
    expect(result.current.error).toBeNull();
  });

  // ---------- Fetch error ----------

  it("sets error when fetch fails", async () => {
    mockUseProfile.mockReturnValue({
      profile: { id: "profile-1", user_id: "u1", type: "charity", created_at: "2024-01-01" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("charity_details", {
      data: null,
      error: { message: "relation does not exist" },
    });

    const { result } = renderHook(() => useCharityProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Error fetching charity profile");
    expect(result.current.profile).toBeNull();
    expect(Logger.error).toHaveBeenCalled();
  });

  // ---------- Update profile ----------

  it("updates the charity profile optimistically", async () => {
    const charityData = {
      name: "Original Name",
      description: "Original",
      category: "education",
      image_url: "https://example.com/logo.png",
    };

    mockUseProfile.mockReturnValue({
      profile: { id: "profile-1", user_id: "u1", type: "charity", created_at: "2024-01-01" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("charity_details", { data: charityData, error: null });

    const { result } = renderHook(() => useCharityProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile?.name).toBe("Original Name");

    // Now update -- the supabase mock's update chain resolves with no error
    // by default (the mock from supabaseMock.js handles this)
    await act(async () => {
      await result.current.updateProfile({ name: "Updated Name" });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile?.name).toBe("Updated Name");
  });

  it("does nothing when updateProfile is called without a profile id", async () => {
    const { result } = renderHook(() => useCharityProfile());

    await act(async () => {
      await result.current.updateProfile({ name: "Updated" });
    });

    // Should not throw and profile should remain null
    expect(result.current.profile).toBeNull();
  });

  it("sets error when updateProfile fails", async () => {
    const charityData = {
      name: "Charity",
      description: "Desc",
      category: "education",
      image_url: "https://example.com/logo.png",
    };

    mockUseProfile.mockReturnValue({
      profile: { id: "profile-1", user_id: "u1", type: "charity", created_at: "2024-01-01" },
      loading: false,
      error: null,
      updateProfile: jest.fn(),
    });

    setMockResult("charity_details", { data: charityData, error: null });

    const { result } = renderHook(() => useCharityProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Override the supabase.from mock to make update fail
    const origImpl = (supabase.from as jest.Mock).getMockImplementation();
    (supabase.from as jest.Mock).mockImplementation(() => {
      const chain = {
        update: jest.fn(() => ({
          eq: jest.fn(() =>
            Promise.resolve({
              data: null,
              error: { message: "update failed" },
            }),
          ),
        })),
        select: jest.fn(() => chain),
        eq: jest.fn(() => chain),
        single: jest.fn(() =>
          Promise.resolve({ data: charityData, error: null }),
        ),
      };
      return chain;
    });

    await act(async () => {
      await result.current.updateProfile({ name: "Fail Update" });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Error updating charity profile");
    expect(Logger.error).toHaveBeenCalled();

    // Restore original mock
    if (origImpl) {
      (supabase.from as jest.Mock).mockImplementation(origImpl);
    }
  });

  // ---------- Return shape ----------

  it("exposes profile, updateProfile, loading, and error", () => {
    const { result } = renderHook(() => useCharityProfile());

    expect(result.current).toHaveProperty("profile");
    expect(result.current).toHaveProperty("updateProfile");
    expect(result.current).toHaveProperty("loading");
    expect(result.current).toHaveProperty("error");
  });
});
