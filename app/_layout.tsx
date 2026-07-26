import { router, Stack, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  subscribeToUserChanges,
} from "../src/storage/userStorage";
import { restoreSession } from "../src/services/authService";
import { colors } from "../src/theme/colors";
import { User } from "../src/types/user";
import { MainBottomNav } from "../components/main-bottom-nav";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = subscribeToUserChanges(setUser);

    const checkAuth = async () => {
      const u = await restoreSession();
      setUser(u);
      setLoading(false);
    };

    checkAuth();

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const rootSegment = segments[0];
    const tabSegment = segments[1];
    const isPrivateRoute =
      rootSegment === "(tabs)" ||
        ["subject", "chapter", "lesson", "scene", "quiz", "quiz-interactive", "exercise", "sacko-chat", "profile-settings", "help", "subscription"].includes(
        rootSegment,
      );
    const isStudentRoute =
      ["subject", "chapter", "lesson", "scene", "quiz", "quiz-interactive", "exercise", "sacko-chat"].includes(
        rootSegment,
      ) ||
      (rootSegment === "(tabs)" &&
        Boolean(
          tabSegment &&
            ["courses", "progress", "my-quiz", "sacko"].includes(
              tabSegment,
            ),
        ));

    if (!user && isPrivateRoute) {
      router.replace("/onboarding");
      return;
    }

    if (user && !isPrivateRoute) {
      router.replace("/(tabs)/subjects");
      return;
    }

    if (user && user.role !== "student" && isStudentRoute) {
      router.replace("/(tabs)/subjects");
    }
  }, [loading, segments, user]);

  const rootSegment = segments[0];
  const safeAreaBackgroundColor =
    rootSegment === "onboarding"
      ? "#123E8A"
      : rootSegment?.startsWith("register-")
        ? colors.backgroundSoft
        : colors.background;
  const showLearningNavigation =
    user?.role === "student" &&
    ["subject", "chapter", "lesson", "scene", "sacko-chat"].includes(rootSegment);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top", "right", "bottom", "left"]}
        style={{ flex: 1, backgroundColor: safeAreaBackgroundColor }}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="login" />
            <Stack.Screen name="role-selection" />
            <Stack.Screen name="register-student" />
            <Stack.Screen name="register-parent" />
            <Stack.Screen name="register-teacher" />
            <Stack.Screen name="register-success" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="subject" />
            <Stack.Screen name="chapter" />
            <Stack.Screen name="lesson" />
            <Stack.Screen name="scene" />
            <Stack.Screen name="sacko-chat" />
            <Stack.Screen name="profile-settings" />
            <Stack.Screen name="help" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="quiz" />
            <Stack.Screen name="quiz-interactive" />
            <Stack.Screen name="exercise" />
            <Stack.Screen name="+not-found" />
          </Stack>
        )}
        {!loading && showLearningNavigation ? (
          <MainBottomNav
            activeTab={rootSegment === "sacko-chat" ? "sacko" : "subjects"}
          />
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
