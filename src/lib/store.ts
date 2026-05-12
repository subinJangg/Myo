import { LazyStore } from "@tauri-apps/plugin-store";
import type { UserProfile, UserPreferences, DailyFortune } from "@/types";
import { DEFAULT_PREFERENCES } from "@/types";

const profileStore = new LazyStore("profile.json");
const preferencesStore = new LazyStore("preferences.json");
const fortuneStore = new LazyStore("fortunes.json");

export async function saveProfile(profile: UserProfile): Promise<void> {
  await profileStore.set("profile", profile);
  await profileStore.save();
}

export async function loadProfile(): Promise<UserProfile | null> {
  const profile = await profileStore.get<UserProfile>("profile");
  return profile ?? null;
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  await preferencesStore.set("preferences", prefs);
  await preferencesStore.save();
}

export async function loadPreferences(): Promise<UserPreferences> {
  const prefs = await preferencesStore.get<UserPreferences>("preferences");
  return prefs ?? DEFAULT_PREFERENCES;
}

export async function saveDailyFortune(fortune: DailyFortune): Promise<void> {
  await fortuneStore.set(fortune.date, fortune);
  await fortuneStore.save();
}

export async function loadDailyFortune(
  date: string,
): Promise<DailyFortune | null> {
  const fortune = await fortuneStore.get<DailyFortune>(date);
  return fortune ?? null;
}

export async function clearAllData(): Promise<void> {
  await profileStore.clear();
  await profileStore.save();
  await preferencesStore.clear();
  await preferencesStore.save();
  await fortuneStore.clear();
  await fortuneStore.save();
}
