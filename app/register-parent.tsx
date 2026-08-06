import { Picker } from "@react-native-picker/picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
import { registerParent } from "../src/services/authService";
import { getClasses, SchoolClass } from "../src/services/classService";
import { colors } from "../src/theme/colors";
import { isValidEmail } from "../src/utils/formValidation";

export default function RegisterParent() {
  const [step, setStep] = useState(1);

  const [parentFirstName, setParentFirstName] = useState("");
  const [parentLastName, setParentLastName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [childFirstName, setChildFirstName] = useState("");
  const [childLastName, setChildLastName] = useState("");
  const [childSchoolName, setChildSchoolName] = useState("");
  const [childClassName, setChildClassName] = useState("");

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await getClasses();
        setClasses(data);

        if (data.length > 0) {
          setChildClassName(data[0].name);
        }
      } catch (err: unknown) {
        setError(
          getErrorMessage(err, "Impossible de charger la liste des classes."),
        );
      }
    };

    loadClasses();
  }, []);

  const continueToChild = () => {
    if (
      !parentFirstName.trim() ||
      !parentLastName.trim() ||
      !parentEmail.trim() ||
      !password ||
      !passwordConfirmation
    ) {
      setError("Remplissez tous les champs obligatoires du parent.");
      return;
    }

    if (!isValidEmail(parentEmail)) {
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

    if (!parentFirstName || !parentLastName || !parentEmail || !password) {
      setError("Remplissez tous les champs obligatoires du parent.");
      return;
    }

    if (!childFirstName || !childLastName || !childSchoolName || !childClassName) {
      setError("Remplissez tous les champs obligatoires de l’enfant.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);
      await registerParent({
        first_name: parentFirstName.trim(),
        last_name: parentLastName.trim(),
        email: parentEmail.trim(),
        password,
        whatsapp_phone: parentPhone,
        student_first_name: childFirstName,
        student_last_name: childLastName,
        student_school_name: childSchoolName,
        student_class: childClassName,
      });

      router.replace("/register-success");
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Impossible de créer le compte parent."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthPage bottomPadding={280}>
      <AuthStepHeader onBack={() => step === 1 ? goBackOrReplace("/role-selection") : setStep(1)} step={step} total={2} />
      <View style={styles.emojiBox}>
        <Image
          contentFit="contain"
          source={step === 1
            ? require("../assets/images/auth-group-clean.png")
            : require("../assets/images/auth-role-student-clean.png")}
          style={styles.roleImage}
        />
      </View>
      <Text style={styles.title}>
        {step === 1 ? "Créer un compte parent" : "Inscrire mon enfant"}
      </Text>
      <Text style={styles.subtitle}>
        {step === 1
          ? "Renseignez vos informations pour suivre la progression de votre enfant."
          : "Ces informations permettront à l’équipe E-KALAN de valider le compte sous 24h."}
      </Text>

      <ErrorMessage message={error} />

      <View style={styles.card}>
        {step === 1 ? (
          <>
            <AuthFieldLabel icon="person-outline">Prénom du parent</AuthFieldLabel>
            <TextInput accessibilityLabel="Prénom du parent" style={styles.input} value={parentFirstName} onChangeText={setParentFirstName} placeholder="Ex: Mariam" autoComplete="given-name" />

            <AuthFieldLabel icon="badge">Nom du parent</AuthFieldLabel>
            <TextInput accessibilityLabel="Nom du parent" style={styles.input} value={parentLastName} onChangeText={setParentLastName} placeholder="Ex: Camara" autoComplete="family-name" />

            <AuthFieldLabel icon="mail-outline">Email du parent</AuthFieldLabel>
            <TextInput accessibilityLabel="Email du parent" style={styles.input} value={parentEmail} onChangeText={setParentEmail} placeholder="parent@email.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false} textContentType="emailAddress" />

            <AuthFieldLabel icon="phone">Numéro WhatsApp / téléphone</AuthFieldLabel>
            <TextInput accessibilityLabel="Numéro WhatsApp ou téléphone" style={styles.input} value={parentPhone} onChangeText={setParentPhone} placeholder="+223..." keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />

            <AuthFieldLabel icon="lock-outline">Mot de passe</AuthFieldLabel>
            <TextInput accessibilityLabel="Mot de passe" style={styles.input} value={password} onChangeText={setPassword} placeholder="Minimum 8 caractères" secureTextEntry autoComplete="new-password" textContentType="newPassword" />

            <AuthFieldLabel icon="verified-user">Confirmer le mot de passe</AuthFieldLabel>
            <TextInput accessibilityLabel="Confirmer le mot de passe" style={styles.input} value={passwordConfirmation} onChangeText={setPasswordConfirmation} placeholder="Saisissez à nouveau le mot de passe" secureTextEntry autoComplete="new-password" returnKeyType="done" textContentType="newPassword" />

            <Pressable
              accessibilityLabel="Continuer vers les informations de l’enfant"
              accessibilityRole="button"
              style={styles.button}
              onPress={continueToChild}
            >
              <Text style={styles.buttonText}>Continuer 🚀</Text>
            </Pressable>
          </>
        ) : (
          <>
            <AuthFieldLabel icon="child-care">Prénom de l’enfant</AuthFieldLabel>
            <TextInput accessibilityLabel="Prénom de l’enfant" style={styles.input} value={childFirstName} onChangeText={setChildFirstName} placeholder="Ex: Ali" />

            <AuthFieldLabel icon="badge">Nom de l’enfant</AuthFieldLabel>
            <TextInput accessibilityLabel="Nom de l’enfant" style={styles.input} value={childLastName} onChangeText={setChildLastName} placeholder="Ex: Diallo" />

            <AuthFieldLabel icon="school">Établissement de l’enfant</AuthFieldLabel>
            <TextInput accessibilityLabel="Établissement de l’enfant" style={styles.input} value={childSchoolName} onChangeText={setChildSchoolName} placeholder="Nom de l’école" />

            <AuthFieldLabel icon="class">Classe de l’enfant</AuthFieldLabel>
            <View style={styles.pickerBox}>
              <Picker
                accessibilityLabel="Classe de l’enfant"
                style={styles.picker}
                selectedValue={childClassName}
                onValueChange={(value) => setChildClassName(value)}
              >
                {classes.map((item) => (
                  <Picker.Item key={item.id} label={item.name} value={item.name} />
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
                {submitting ? "Envoi..." : "Envoyer ma demande ✨"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Revenir aux informations du parent"
              accessibilityRole="button"
              style={styles.secondaryButton}
              onPress={() => setStep(1)}
            >
              <Text style={styles.secondaryText}>Retour</Text>
            </Pressable>
          </>
        )}
      </View>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  content: { padding: 22, paddingBottom: 50 },
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#94A3B8",
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
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#D9E3F0",
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
  picker: { height: 56 },
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
