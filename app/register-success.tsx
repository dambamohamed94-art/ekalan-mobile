import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/colors";

export default function RegisterSuccess() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎉</Text>

      <Text style={styles.title}>Inscription réussie !</Text>

      <Text style={styles.message}>
        Votre demande a été enregistrée avec succès.
        {"\n\n"}
        Votre compte sera validé sous 24h par notre équipe.
      </Text>

      <Pressable
        accessibilityLabel="Aller à la connexion"
        accessibilityRole="button"
        style={styles.button}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.buttonText}>Se connecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emoji: {
    fontSize: 70,
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    color: "#475569",
    lineHeight: 24,
  },
  button: {
    marginTop: 30,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16,
  },
});
