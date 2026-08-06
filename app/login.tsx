import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  AuthButton,
  AuthCard,
  AuthField,
  AuthHeader,
  AuthPage,
} from "../components/auth-premium";
import { ErrorMessage } from "../components/error-message";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { login } from "../src/services/authService";
import { premiumColors } from "../src/theme/premium";
import { isValidEmail } from "../src/utils/formValidation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (submitting) return;
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
      setError(getErrorMessage(err, "Connexion impossible. Vérifiez vos identifiants."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPage>
      <AuthHeader compact onBack={() => goBackOrReplace("/onboarding")} />

      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>Bienvenue !</Text>
          <Text style={styles.subtitle}>Connecte-toi pour continuer l’aventure avec EKALAN.</Text>
        </View>
        <Image
          source={require("../assets/images/auth-character.webp")}
          contentFit="contain"
          style={styles.character}
        />
      </View>

      <AuthCard>
        <ErrorMessage message={error} />
        <AuthField
          accessibilityLabel="Adresse e-mail"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          icon="mail-outline"
          keyboardType="email-address"
          label="Adresse e-mail"
          onChangeText={setEmail}
          placeholder="Entre ton adresse e-mail"
          returnKeyType="next"
          textContentType="emailAddress"
          value={email}
        />
        <AuthField
          accessibilityLabel="Mot de passe"
          autoComplete="current-password"
          icon={passwordVisible ? "lock-open" : "lock-outline"}
          label="Mot de passe"
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
          placeholder="Entre ton mot de passe"
          returnKeyType="go"
          secureTextEntry={!passwordVisible}
          textContentType="password"
          value={password}
        />
        <Pressable
          accessibilityLabel={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          accessibilityRole="button"
          onPress={() => setPasswordVisible((current) => !current)}
          style={styles.visibilityButton}
        >
          <MaterialIcons
            color={premiumColors.blue800}
            name={passwordVisible ? "visibility-off" : "visibility"}
            size={20}
          />
          <Text style={styles.visibilityText}>{passwordVisible ? "Masquer" : "Afficher"}</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgot}>Mot de passe oublié ?</Text>
        </Pressable>
        <AuthButton accent="green" disabled={submitting} onPress={handleLogin}>
          {submitting ? "Connexion..." : "Se connecter"}
        </AuthButton>

        <View style={styles.registerBox}>
          <View style={styles.registerIcon}>
            <MaterialIcons color={premiumColors.violet500} name="groups" size={26} />
          </View>
          <View style={styles.registerCopy}>
            <Text style={styles.registerTitle}>Pas encore de compte ?</Text>
            <Text style={styles.registerText}>Rejoins les élèves qui apprennent avec EKALAN.</Text>
          </View>
          <Pressable onPress={() => router.push("/role-selection")} style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Créer</Text>
            <MaterialIcons color={premiumColors.violet500} name="chevron-right" size={22} />
          </Pressable>
        </View>
      </AuthCard>

      <View style={styles.security}>
        <MaterialIcons color={premiumColors.blue800} name="verified-user" size={20} />
        <Text style={styles.securityText}>Tes données sont sécurisées et protégées</Text>
      </View>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 190, flexDirection: "row", alignItems: "center", marginTop: 4 },
  heroCopy: { flex: 1, paddingLeft: 6, zIndex: 2 },
  title: { color: premiumColors.blue950, fontSize: 31, fontWeight: "900" },
  subtitle: { color: premiumColors.blue900, fontSize: 16, lineHeight: 23, marginTop: 8 },
  character: { width: 190, height: 205, marginLeft: -28 },
  visibilityButton: { flexDirection: "row", gap: 5, alignSelf: "flex-end", marginTop: -6, marginBottom: 6 },
  visibilityText: { color: premiumColors.blue800, fontSize: 12, fontWeight: "800" },
  forgot: { color: premiumColors.green600, fontWeight: "800", textAlign: "right", marginBottom: 10 },
  registerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#F5F1FF",
  },
  registerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#EAE1FF", alignItems: "center", justifyContent: "center" },
  registerCopy: { flex: 1 },
  registerTitle: { color: premiumColors.blue950, fontWeight: "900" },
  registerText: { color: "#475569", fontSize: 12, lineHeight: 17, marginTop: 2 },
  registerButton: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#D9C9FF", borderRadius: 13, paddingVertical: 8, paddingLeft: 10, paddingRight: 5 },
  registerButtonText: { color: premiumColors.violet500, fontWeight: "900" },
  security: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 },
  securityText: { color: premiumColors.blue900, fontSize: 13, fontWeight: "700" },
});
