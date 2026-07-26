import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

const items = [
  { label: "Matières", icon: "school" as const, href: "/(tabs)/subjects" as const },
  { label: "Mon quiz", icon: "quiz" as const, href: "/(tabs)/my-quiz" as const },
  { label: "Sacko", icon: "auto-awesome" as const, href: "/(tabs)/sacko" as const },
  { label: "Profil", icon: "person" as const, href: "/(tabs)/profile" as const },
];

export function MainBottomNav({
  activeTab = "subjects",
}: {
  activeTab?: "subjects" | "quiz" | "sacko" | "profile";
}) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const active =
          (index === 0 && activeTab === "subjects") ||
          (index === 1 && activeTab === "quiz") ||
          (index === 2 && activeTab === "sacko") ||
          (index === 3 && activeTab === "profile");
        return (
          <Pressable
            accessibilityLabel={`Ouvrir ${item.label}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={item.label}
            onPress={() => router.replace(item.href)}
            style={({ pressed }) => [
              styles.item,
              active && styles.activeItem,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              color={active ? colors.primary : "#64748B"}
              name={item.icon}
              size={26}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 78,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 4,
    backgroundColor: colors.surface,
    borderColor: "#DDE7F5",
    borderRadius: 26,
    borderWidth: 1,
    marginHorizontal: 10,
    marginBottom: 7,
    padding: 6,
    elevation: 10,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  activeItem: { backgroundColor: "#DDEBFF" },
  pressed: { opacity: 0.75 },
  label: { color: "#64748B", fontSize: 11, fontWeight: "900", marginTop: 3 },
  activeLabel: { color: colors.primary },
});
