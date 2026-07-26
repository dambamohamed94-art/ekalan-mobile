import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ErrorMessage } from "../components/error-message";
import { BrandLogo } from "../components/brand-logo";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { login } from "../src/services/authService";
import { colors } from "../src/theme/colors";
import { isValidEmail } from "../src/utils/formValidation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleBack = () => {
    goBackOrReplace("/onboarding");
  };

  const handleLogin = async () => {
    if (submitting) {
      return;
    }

    if (!email.trim() || !password) {
      setError("Renseignez votre email et votre mot de passe.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Saisissez une adresse email valide.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/subjects");
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Connexion impossible. Vérifiez vos identifiants.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardView}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.container}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour"
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.backButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>

        <BrandLogo style={styles.logo} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Connecte-toi</Text>

        <ErrorMessage message={error} />

        <Text style={styles.label}>Email</Text>
        <TextInput
          accessibilityLabel="Email"
          style={styles.input}
          placeholder="ton@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="next"
          textContentType="emailAddress"
        />

        <View style={styles.row}>
          <Text style={styles.label}>Mot de passe</Text>
          <Text style={styles.forgot}>J’ai oublié 😅</Text>
        </View>

        <TextInput
          accessibilityLabel="Mot de passe"
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoComplete="current-password"
          onSubmitEditing={handleLogin}
          returnKeyType="go"
          textContentType="password"
        />

         <Pressable
              accessibilityLabel={
                submitting ? "Connexion en cours" : "Se connecter"
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting, busy: submitting }}
              disabled={submitting}
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleLogin}
            >
            <Text style={styles.buttonText}>
              {submitting ? "Connexion..." : "Je me connecte"}
            </Text>
          </Pressable>
      </View>

      <Text style={styles.register}>
        Tu n’as pas de compte ?{" "}
        <Text
          style={{ color: colors.primary, fontWeight: "800" }}
          onPress={() => router.push("/role-selection")}
        >
          Inscris-toi ici !
        </Text>
      </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#F7F1EC",
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
  },
  back: {
    fontSize: 44,
    color: "#444",
  },
  logo: {
    width: 58,
    height: 58,
  },
  card: {
    marginTop: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 24,
    shadowColor: "#D8C3B5",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 22,
    textAlign: "center",
    color: "#444",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#666",
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#EFE8E3",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgot: {
    color: "#999",
    fontWeight: "700",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#0B2556",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 0,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  register: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
});
