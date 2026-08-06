import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, View } from "react-native";
import { BrandLogo } from "./brand-logo";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { colors } from "../src/theme/colors";

export function PremiumPageHeader({ fallback = "/(tabs)/profile" }: { fallback?: "/(tabs)/profile" | "/settings" }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Retour" accessibilityRole="button" onPress={() => goBackOrReplace(fallback)} style={styles.iconButton}>
        <MaterialIcons color={colors.primaryDark} name="arrow-back-ios-new" size={22} />
      </Pressable>
      <View style={styles.logoShell}><BrandLogo size={54} /></View>
      <View style={styles.notification}>
        <MaterialIcons color={colors.primaryDark} name="notifications-none" size={27} />
        <View style={styles.badge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 74, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 15 },
  logoShell: { width: 64, height: 64, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderRadius: 19, shadowColor: "#9FB3D1", shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 4 },
  notification: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", right: 7, top: 7, width: 9, height: 9, backgroundColor: "#EF4444", borderColor: "#FFFFFF", borderRadius: 5, borderWidth: 2 },
});
