import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { premiumColors, premiumRadii, premiumShadow } from "../src/theme/premium";

type PremiumButtonProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel?: string;
  variant?: "light" | "success";
  style?: ViewStyle;
};

export function PremiumButton({
  label,
  onPress,
  accessibilityLabel,
  variant = "light",
  style,
}: PremiumButtonProps) {
  const success = variant === "success";

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        success && styles.success,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, success && styles.successLabel]}>{label}</Text>
      <MaterialIcons
        color={success ? premiumColors.green600 : premiumColors.blue800}
        name={success ? "rocket-launch" : "arrow-forward"}
        size={22}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: premiumRadii.md,
    backgroundColor: premiumColors.white,
    paddingHorizontal: 24,
    ...premiumShadow,
  },
  success: { backgroundColor: premiumColors.green500 },
  label: { color: premiumColors.blue900, fontSize: 18, fontWeight: "900" },
  successLabel: { color: premiumColors.white },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
});
