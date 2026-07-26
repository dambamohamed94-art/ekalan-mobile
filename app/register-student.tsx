import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
import { registerStudent } from "../src/services/authService";
import { getClasses, SchoolClass } from "../src/services/classService";
import { colors } from "../src/theme/colors";
import { isValidEmail } from "../src/utils/formValidation";

export default function RegisterStudent() {
  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [schoolName, setSchoolName] = useState("");
  const [objective, setObjective] = useState("");
  const [classId, setClassId] = useState<number | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);

        if (data.length > 0) {
          setClassId(data[0].id);
        }
      } catch (err: unknown) {
        setError(
          getErrorMessage(err, "Impossible de charger la liste des classes."),
        );
      }
    };

    loadClasses();
  }, []);

  const continueToSchool = () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !passwordConfirmation
    ) {
      setError("Remplissez tous les champs obligatoires de l’étape 1.");
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
    setStep(2);
  };

  const handleRegister = async () => {
  if (submitting) {
    return;
  }

  if (!firstName || !lastName || !email || !password) {
    setError("Tous les champs obligatoires doivent être remplis.");
    return;
  }

  if (password.length < 8) {
    setError("Le mot de passe doit contenir au moins 8 caractères.");
    return;
  }

  if (!classId) {
    setError("Sélectionnez une classe avant de créer le compte.");
    return;
  }

  try {
    setError(null);
    setSubmitting(true);
    await registerStudent({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password,
      class_id: classId,
      school_name: schoolName,
      objective: objective.trim() || undefined,
    });

    router.replace("/register-success");
  } catch (err: unknown) {
    setError(
      getErrorMessage(err, "Impossible de créer le compte élève."),
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
          accessibilityLabel={step === 1 ? "Retour" : "Étape précédente"}
          accessibilityRole="button"
          onPress={() =>
            step === 1 ? goBackOrReplace("/role-selection") : setStep(1)
          }
          style={styles.backButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <BrandLogo style={styles.logo} />
      </View>

      <Text style={styles.emoji}>{step === 1 ? "🎒" : "🏫"}</Text>

      <Text style={styles.title}>
        {step === 1 ? "Bienvenue futur champion !" : "Parle-nous de ton école"}
      </Text>

      <Text style={styles.subtitle}>
        {step === 1
          ? "Créons ton espace élève en quelques secondes."
          : "On adapte les cours à ta classe et ton parcours."}
      </Text>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: step === 1 ? "50%" : "100%" },
          ]}
        />
      </View>

      <Text style={styles.progressText}>Étape {step}/2</Text>

      <ErrorMessage message={error} />

      <View style={styles.card}>
        {step === 1 ? (
          <>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Prénom"
              placeholder="Ex: Aminata"
              value={firstName}
              onChangeText={setFirstName}
              autoComplete="given-name"
            />

            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Nom"
              placeholder="Ex: Diallo"
              value={lastName}
              onChangeText={setLastName}
              autoComplete="family-name"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Email"
              placeholder="eleve@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              textContentType="emailAddress"
            />

            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Mot de passe"
              placeholder="Minimum 8 caractères"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoComplete="new-password"
              textContentType="newPassword"
            />

            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Confirmer le mot de passe"
              placeholder="Saisis à nouveau ton mot de passe"
              secureTextEntry
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              autoComplete="new-password"
              returnKeyType="done"
              textContentType="newPassword"
            />

            <Pressable
              accessibilityLabel="Continuer vers les informations scolaires"
              accessibilityRole="button"
              style={styles.button}
              onPress={continueToSchool}
            >
              <Text style={styles.buttonText}>Continuer 🚀</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.label}>Établissement</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Établissement"
              placeholder="Nom de ton école"
              value={schoolName}
              onChangeText={setSchoolName}
            />

            <Text style={styles.label}>Objectif d’apprentissage</Text>
            <TextInput
              style={styles.input}
              accessibilityLabel="Objectif d’apprentissage"
              placeholder="Ex: Améliorer mes résultats en mathématiques"
              value={objective}
              onChangeText={setObjective}
            />

            <Text style={styles.label}>Classe</Text>
            <View style={styles.pickerBox}>
              <Picker
                accessibilityLabel="Classe"
                selectedValue={classId}
                onValueChange={(value) => setClassId(value)}
              >
                {classes.map((item) => (
                  <Picker.Item
                    key={item.id}
                    label={item.name}
                    value={item.id}
                  />
                ))}
              </Picker>
            </View>

            <Pressable
              accessibilityLabel={
                submitting ? "Création du compte en cours" : "Créer mon compte"
              }
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting, busy: submitting }}
              disabled={submitting}
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>
                {submitting ? "Création..." : "Créer mon compte ✨"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Revenir aux informations personnelles"
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={() => setStep(1)}
            >
              <Text style={styles.secondaryText}>Retour</Text>
            </Pressable>
          </>
        )}
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
  back: {
    fontSize: 48,
    color: "#4B5563",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
  },
  logo: {
    width: 58,
    height: 58,
  },
  emoji: {
    textAlign: "center",
    fontSize: 54,
    marginTop: 34,
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
  progressTrack: {
    height: 12,
    backgroundColor: "#DDE7F5",
    borderRadius: 20,
    marginTop: 26,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  progressText: {
    marginTop: 8,
    textAlign: "right",
    color: "#64748B",
    fontWeight: "800",
  },
  card: {
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#B8C7DD",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  pickerBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    marginBottom: 20,
    overflow: "hidden",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: "center",
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900",
  },
});
