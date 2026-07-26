import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { hasSeenOnboarding } from "../src/storage/onboardingStorage";

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [onboardingSeen, setOnboardingSeen] = useState(false);

  useEffect(() => {
    const loadOnboardingState = async () => {
      setOnboardingSeen(await hasSeenOnboarding());
      setLoading(false);
    };

    loadOnboardingState();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={onboardingSeen ? "/login" : "/onboarding"} />;
}
