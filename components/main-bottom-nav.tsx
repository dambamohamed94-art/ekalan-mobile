import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
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
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.itemContent, active && styles.activeItem]}>
              {item.label === "Sacko" ? (
                <Image contentFit="contain" source={require("../assets/images/sacko-logo-mobile.svg")} style={styles.sackoIcon} />
              ) : (
                <MaterialIcons color={active ? colors.primary : "#64748B"} name={item.icon} size={26} />
              )}
              <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
            </View>
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
  },
  itemContent: {
    width: "94%",
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderColor: "transparent",
    borderWidth: 1.5,
  },
  activeItem: {
    backgroundColor: "#FFF4C2",
    borderColor: "#F2C94C",
    borderWidth: 1.5,
  },
  pressed: { opacity: 0.75 },
  label: { color: "#64748B", fontSize: 11, fontWeight: "900", marginTop: 3 },
  activeLabel: { color: colors.primary },
  sackoIcon: { width: 31, height: 31 },
});
