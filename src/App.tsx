import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { HomePage } from "@/pages/HomePage";
import { FortuneCard } from "@/pages/FortuneCard";
import { TarotPage } from "@/pages/TarotPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Loader2 } from "lucide-react";

export default function App() {
  const { currentView, isLoading, initialized, initialize, preferences } =
    useAppStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === "dark") {
      root.classList.add("dark");
    } else if (preferences.theme === "light") {
      root.classList.remove("dark");
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
      };
      root.classList.toggle("dark", mq.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [preferences.theme]);

  if (isLoading || !initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      {currentView === "onboarding" && <OnboardingPage />}
      {currentView === "home" && <HomePage />}
      {currentView === "card" && <FortuneCard />}
      {currentView === "tarot" && <TarotPage />}
      {currentView === "settings" && <SettingsPage />}
    </div>
  );
}
