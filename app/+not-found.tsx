import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page introuvable</Text>
      <Text style={styles.message}>
        Cette page n’existe pas ou n’est plus disponible.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retourner à l’accueil"
        onPress={() => router.replace("/")}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Retour à l’accueil</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 28,
  },
  code: {
    color: colors.primary,
    fontSize: 72,
    fontWeight: "900",
  },
  title: {
    color: colors.textStrong,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "center",
  },
  message: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25,
    marginTop: 12,
    maxWidth: 360,
    textAlign: "center",
  },
  button: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 18,
    marginTop: 32,
    minWidth: 220,
    paddingHorizontal: 24,
    paddingVertical: 17,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900",
  },
});
