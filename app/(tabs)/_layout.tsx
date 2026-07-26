import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {
  getUser,
  subscribeToUserChanges,
} from "../../src/storage/userStorage";
import { colors } from "../../src/theme/colors";
import { User } from "../../src/types/user";

export default function TabLayout() {
  const [user, setUser] = useState<User | null>(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const unsubscribe = subscribeToUserChanges(setUser);
    getUser().then(setUser);

    return unsubscribe;
  }, []);

  const isStudent = user?.role === "student";
  const homeTabLabel = isStudent ? "Matières" : "Accueil";
  const homeTabIcon = isStudent ? "school" : "home";
  const isCompact = width < 390;
  const iconSize = isCompact ? 25 : 28;
  const tabItemStyle = {
    borderRadius: isCompact ? 16 : 19,
    marginHorizontal: isCompact ? 2 : 4,
    marginVertical: 6,
  };

  return (
    <Tabs
      initialRouteName="subjects"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarButton: ActiveTabButton,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: "#64748B",
        tabBarItemStyle: tabItemStyle,
        tabBarLabelPosition: "below-icon",
        tabBarLabelStyle: {
          fontSize: isCompact ? 10 : 12,
          fontWeight: "900",
          marginTop: 2,
        },
        tabBarStyle: {
          height: isCompact ? 70 : 80,
          marginHorizontal: isCompact ? 6 : 14,
          marginBottom: isCompact ? 5 : 9,
          borderRadius: isCompact ? 22 : 28,
          backgroundColor: colors.surface,
          borderTopColor: "#DDE7F5",
          borderTopWidth: 1,
          paddingHorizontal: isCompact ? 4 : 8,
          shadowColor: "#B8C7DD",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 18,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="subjects"
        options={{
          title: homeTabLabel,
          tabBarAccessibilityLabel: homeTabLabel,
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} icon={homeTabIcon} size={iconSize} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-quiz"
        options={{
          title: "Mon quiz",
          tabBarAccessibilityLabel: "Mon quiz",
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} icon="quiz" size={iconSize} />
          ),
          tabBarItemStyle: {
            ...tabItemStyle,
            display: isStudent ? "flex" : "none",
          },
        }}
      />
      <Tabs.Screen
        name="sacko"
        options={{
          title: "Sacko",
          tabBarAccessibilityLabel: "Sacko",
          href: isStudent ? undefined : null,
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} icon="auto-awesome" size={iconSize} />
          ),
          tabBarItemStyle: {
            ...tabItemStyle,
            display: isStudent ? "flex" : "none",
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarAccessibilityLabel: "Profil",
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} icon="person" size={iconSize} />
          ),
        }}
      />

      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="courses" options={{ href: null }} />
      <Tabs.Screen name="progress" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}

function TabIcon({
  color,
  icon,
  size,
}: {
  color: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  size: number;
}) {
  return (
    <View style={styles.icon}>
      <MaterialIcons color={color} name={icon} size={size} />
    </View>
  );
}

function ActiveTabButton({
  accessibilityState,
  children,
  ref: _ref,
  style,
  ...props
}: BottomTabBarButtonProps) {
  const isActive = accessibilityState?.selected === true;

  return (
    <Pressable
      {...props}
      accessibilityState={accessibilityState}
      style={({ pressed }) => [
        style,
        styles.tabButton,
        isActive && styles.tabButtonActive,
        pressed && styles.tabButtonPressed,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#DDEBFF",
  },
  tabButtonPressed: {
    opacity: 0.78,
  },
  icon: {
    minWidth: 38,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
});
