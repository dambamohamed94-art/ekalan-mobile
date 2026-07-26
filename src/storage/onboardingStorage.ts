import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_SEEN_KEY = "onboarding_seen";

export async function hasSeenOnboarding() {
  return (await AsyncStorage.getItem(ONBOARDING_SEEN_KEY)) === "true";
}

export async function markOnboardingAsSeen() {
  await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, "true");
}
