import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

type DataStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
};

export function DataState({
  title,
  message,
  onRetry,
  actionLabel = "Réessayer",
}: DataStateProps) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 18,
    padding: 22,
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: "900",
  },
});
