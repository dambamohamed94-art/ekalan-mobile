import { router } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ErrorMessage } from "../components/error-message";
import { AuthFieldLabel, AuthPage, AuthStepHeader } from "../components/auth-premium";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { registerTeacher } from "../src/services/authService";
import { colors } from "../src/theme/colors";
import { isValidEmail } from "../src/utils/formValidation";

export default function RegisterTeacher() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [diploma, setDiploma] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (submitting) {
      return;
    }

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !passwordConfirmation
    ) {
      setError("Remplissez tous les champs obligatoires.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Saisissez une adresse email valide.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("Les deux mots de passe doivent être identiques.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await registerTeacher({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        whatsapp_phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        diploma: diploma.trim() || undefined,
        bio: bio.trim() || undefined,
      });

      router.replace("/register-success");
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Impossible de créer le compte enseignant."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPage bottomPadding={280}>
      <AuthStepHeader onBack={() => goBackOrReplace("/role-selection")} step={1} total={1} />
      <View style={styles.emojiBox}>
        <Image contentFit="contain" source={require("../assets/images/auth-role-teacher-clean.png")} style={styles.roleImage} />
      </View>
      <Text style={styles.title}>Créer un compte enseignant</Text>
      <Text style={styles.subtitle}>
        Présentez votre profil pour accompagner les élèves sur E-KALAN.
      </Text>

      <ErrorMessage message={error} />

      <View style={styles.card}>
        <AuthFieldLabel icon="person-outline">Prénom *</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Prénom"
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Ex: Mohamed"
          autoComplete="given-name"
        />

        <AuthFieldLabel icon="badge">Nom *</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Nom"
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Ex: Camara"
          autoComplete="family-name"
        />

        <AuthFieldLabel icon="mail-outline">Email *</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="enseignant@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <AuthFieldLabel icon="lock-outline">Mot de passe *</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Mot de passe"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 8 caractères"
          secureTextEntry
          autoComplete="new-password"
        />

        <AuthFieldLabel icon="verified-user">Confirmer le mot de passe *</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Confirmer le mot de passe"
          style={styles.input}
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          placeholder="Saisissez à nouveau le mot de passe"
          secureTextEntry
          autoComplete="new-password"
          returnKeyType="done"
          textContentType="newPassword"
        />

        <AuthFieldLabel icon="phone">WhatsApp / téléphone</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Numéro WhatsApp ou téléphone"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+224..."
          keyboardType="phone-pad"
          autoComplete="tel"
        />

        <AuthFieldLabel icon="location-city">Ville</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Ville"
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Ex: Conakry"
        />

        <AuthFieldLabel icon="school">Diplôme</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Diplôme"
          style={styles.input}
          value={diploma}
          onChangeText={setDiploma}
          placeholder="Ex: Master en mathématiques"
        />

        <AuthFieldLabel icon="description">Présentation</AuthFieldLabel>
        <TextInput
          accessibilityLabel="Présentation"
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Décrivez brièvement votre expérience."
          multiline
          textAlignVertical="top"
        />

        <Pressable
          accessibilityLabel={
            submitting ? "Création du compte en cours" : "Créer mon compte"
          }
          accessibilityRole="button"
          accessibilityState={{ disabled: submitting, busy: submitting }}
          disabled={submitting}
          onPress={handleRegister}
          style={[styles.button, submitting && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Envoi..." : "Envoyer ma demande ✨"}
          </Text>
        </Pressable>
      </View>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    padding: 22,
    paddingBottom: 50,
  },
  header: {
    marginTop: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
  },
  back: {
    fontSize: 48,
    color: "#4B5563",
  },
  logo: {
    width: 58,
    height: 58,
  },
  emojiBox: { width: 78, height: 78, borderRadius: 39, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#EAF2FF", marginTop: 4, overflow: "hidden" },
  roleImage: { width: 70, height: 70 },
  title: {
    marginTop: 12,
    fontSize: 27,
    lineHeight: 36,
    fontWeight: "900",
    textAlign: "center",
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#64748B",
  },
  card: {
    marginTop: 18,
    padding: 22,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  label: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "800",
    color: "#334155",
  },
  input: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E3F0",
    fontSize: 16,
  },
  bioInput: {
    minHeight: 110,
  },
  button: {
    marginTop: 8,
    paddingVertical: 18,
    borderRadius: 22,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});
