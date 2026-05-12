import { create } from "zustand";
import type { UserProfile, UserPreferences, DailyFortune } from "@/types";
import { DEFAULT_PREFERENCES } from "@/types";
import {
  loadProfile,
  saveProfile,
  loadPreferences,
  savePreferences,
  loadDailyFortune,
  saveDailyFortune,
  clearAllData,
} from "@/lib/store";
import { generateDailyFortune } from "@/lib/fortune";
import { invoke } from "@tauri-apps/api/core";

type AppState = {
  profile: UserProfile | null;
  preferences: UserPreferences;
  fortune: DailyFortune | null;
  isLoading: boolean;
  isGenerating: boolean;
  initialized: boolean;
  debugError: string;
  detached: boolean;
  currentView: "home" | "card" | "tarot" | "onboarding" | "settings";

  initialize: () => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  fetchFortune: (forceRefresh?: boolean) => Promise<void>;
  clearFortune: () => void;
  resetAll: () => Promise<void>;
  toggleDetached: () => Promise<void>;
  setView: (view: "home" | "card" | "tarot" | "onboarding" | "settings") => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  preferences: DEFAULT_PREFERENCES,
  fortune: null,
  isLoading: true,
  isGenerating: false,
  initialized: false,
  debugError: "",
  detached: false,
  currentView: "card",

  initialize: async () => {
    try {
      const [profile, preferences] = await Promise.all([
        loadProfile(),
        loadPreferences(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      let fortune: DailyFortune | null = null;
      if (profile) {
        fortune = await loadDailyFortune(today);
      }

      set({
        profile,
        preferences,
        fortune,
        isLoading: false,
        initialized: true,
        currentView: profile ? "home" : "onboarding",
      });
    } catch (e) {
      set({ isLoading: false, initialized: true, currentView: "onboarding", debugError: `init: ${e}` });
    }
  },

  setProfile: async (profile) => {
    await saveProfile(profile);
    set({ profile, currentView: "home" });
  },

  updatePreferences: async (updates) => {
    const current = get().preferences;
    const merged = { ...current, ...updates };
    await savePreferences(merged);
    set({ preferences: merged });
  },

  fetchFortune: async (forceRefresh = false) => {
    const { profile, preferences } = get();
    if (!profile) return;

    if (!forceRefresh) {
      const today = new Date().toISOString().split("T")[0];
      const cached = await loadDailyFortune(today);
      if (cached) {
        set({ fortune: cached });
        return;
      }
    }

    set({ isGenerating: true, debugError: "" });
    try {
      const fortune = await generateDailyFortune(
        profile,
        preferences.jobRole,
        preferences.tone,
      );
      await saveDailyFortune(fortune);
      set({ fortune, isGenerating: false });
    } catch (e) {
      set({ isGenerating: false, debugError: `fortune: ${e}` });
    }
  },

  clearFortune: () => set({ fortune: null }),

  resetAll: async () => {
    await clearAllData();
    set({
      profile: null,
      preferences: DEFAULT_PREFERENCES,
      fortune: null,
      currentView: "onboarding",
    });
  },

  toggleDetached: async () => {
    const next = !get().detached;
    await invoke("set_detached", { detached: next });
    set({ detached: next });
  },

  setView: (view) => set({ currentView: view }),
}));
