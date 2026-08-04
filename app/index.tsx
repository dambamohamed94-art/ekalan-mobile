import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { PremiumSplash } from "../components/premium-splash";
import { hasSeenOnboarding } from "../src/storage/onboardingStorage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    const loadOnboardingState = async () => {
      const [seen] = await Promise.all([
        hasSeenOnboarding(),
        new Promise((resolve) => setTimeout(resolve, 1350)),
      ]);
      setOnboardingSeen(seen);
      setLoading(false);
    };

    loadOnboardingState();
  }, []);

  if (loading) {
    return <PremiumSplash />;
  }

  return <Redirect href={onboardingSeen ? "/login" : "/onboarding"} />;
}
