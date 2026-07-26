import { router } from "expo-router";
import { useState } from "react";
import {
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
    <ScrollView
      automaticallyAdjustKeyboardInsets
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour"
          accessibilityRole="button"
          onPress={() => goBackOrReplace("/role-selection")}
          style={styles.backButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <BrandLogo style={styles.logo} />
      </View>

      <Text style={styles.emoji}>👨‍🏫</Text>
      <Text style={styles.title}>Créer un compte enseignant</Text>
      <Text style={styles.subtitle}>
        Présentez votre profil pour accompagner les élèves sur E-KALAN.
      </Text>

      <ErrorMessage message={error} />

      <View style={styles.card}>
        <Text style={styles.label}>Prénom *</Text>
        <TextInput
          accessibilityLabel="Prénom"
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Ex: Mohamed"
          autoComplete="given-name"
        />

        <Text style={styles.label}>Nom *</Text>
        <TextInput
          accessibilityLabel="Nom"
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Ex: Camara"
          autoComplete="family-name"
        />

        <Text style={styles.label}>Email *</Text>
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

        <Text style={styles.label}>Mot de passe *</Text>
        <TextInput
          accessibilityLabel="Mot de passe"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 8 caractères"
          secureTextEntry
          autoComplete="new-password"
        />

        <Text style={styles.label}>Confirmer le mot de passe *</Text>
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

        <Text style={styles.label}>WhatsApp / téléphone</Text>
        <TextInput
          accessibilityLabel="Numéro WhatsApp ou téléphone"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+224..."
          keyboardType="phone-pad"
          autoComplete="tel"
        />

        <Text style={styles.label}>Ville</Text>
        <TextInput
          accessibilityLabel="Ville"
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Ex: Conakry"
        />

        <Text style={styles.label}>Diplôme</Text>
        <TextInput
          accessibilityLabel="Diplôme"
          style={styles.input}
          value={diploma}
          onChangeText={setDiploma}
          placeholder="Ex: Master en mathématiques"
        />

        <Text style={styles.label}>Présentation</Text>
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
    </ScrollView>
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
  emoji: {
    marginTop: 34,
    textAlign: "center",
    fontSize: 54,
  },
  title: {
    marginTop: 12,
    fontSize: 30,
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
    shadowColor: "#B8C7DD",
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
    backgroundColor: "#F1F5F9",
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
