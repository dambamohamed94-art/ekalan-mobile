import { Image } from "expo-image";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import {
  AuthButton,
  AuthCard,
  AuthField,
  AuthHeader,
  AuthIntro,
  AuthPage,
} from "../components/auth-premium";
import { ErrorMessage } from "../components/error-message";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { requestPasswordReset } from "../src/services/authService";
import { premiumColors } from "../src/theme/premium";
import { isValidEmail } from "../src/utils/formValidation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    if (!isValidEmail(email)) {
      setError("Saisissez une adresse e-mail valide.");
      return;
    }
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const result = await requestPasswordReset(email.trim());
      setMessage(result.message || "Le lien de réinitialisation a été envoyé.");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Impossible d’envoyer le lien de réinitialisation."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPage>
      <AuthHeader onBack={() => goBackOrReplace("/login")} />
      <AuthIntro
        accent="violet"
        icon={(
          <Image
            contentFit="contain"
            source={require("../assets/images/auth-lock.webp")}
            style={styles.lockImage}
          />
        )}
        title="Mot de passe oublié ?"
        subtitle="Pas de panique ! Entre ton adresse e-mail et nous t’enverrons un lien pour le réinitialiser."
      />
      <AuthCard>
        <ErrorMessage message={error} />
        {message ? <Text style={styles.success}>{message}</Text> : null}
        <AuthField
          accessibilityLabel="Adresse e-mail"
          autoCapitalize="none"
          autoComplete="email"
          icon="mail-outline"
          keyboardType="email-address"
          label="Adresse e-mail"
          onChangeText={setEmail}
          placeholder="Ex: eleve@email.com"
          value={email}
        />
        <AuthButton accent="orange" disabled={submitting} onPress={handleSubmit}>
          {submitting ? "Envoi..." : "Envoyer le lien"}
        </AuthButton>
      </AuthCard>
      <Text onPress={() => goBackOrReplace("/login")} style={styles.backLink}>Retour à la connexion</Text>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  lockImage: { width: 62, height: 62 },
  success: { color: premiumColors.green600, backgroundColor: "#EAFBF0", borderRadius: 14, padding: 12, marginBottom: 14, fontWeight: "700" },
  backLink: { color: premiumColors.orange500, textAlign: "center", fontWeight: "900", marginTop: 18 },
});
