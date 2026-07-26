import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from "react-native";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { getUser } from "../src/storage/userStorage";
import { colors } from "../src/theme/colors";
import { User } from "../src/types/user";

export default function ProfileSettings() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    getUser().then(setUser);
  }, []);

  if (!user) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
      <Pressable
        accessibilityLabel="Retour au profil"
        accessibilityRole="button"
        onPress={() => goBackOrReplace("/(tabs)/profile")}
        style={styles.back}
      >
        <MaterialIcons color={colors.primary} name="arrow-back" size={25} />
        <Text style={styles.backText}>Profil</Text>
      </Pressable>
      <Text style={styles.eyebrow}>INFORMATIONS PERSONNELLES</Text>
      <Text style={styles.title}>Modifier mon profil</Text>
      <View style={styles.notice}>
        <MaterialIcons color={colors.primary} name="info-outline" size={23} />
        <Text style={styles.noticeText}>
          La modification en ligne sera activée dès que le service sécurisé sera disponible.
        </Text>
      </View>
      <Field label="Prénom" value={user.first_name} />
      <Field label="Nom" value={user.last_name} />
      <Field label="Adresse email" value={user.email} />
      <Field label="Pays" value="" placeholder="Non renseigné" />
      {user.role === "student" ? <Field label="Classe" value={user.class_name || ""} /> : null}
      <Field label="Rôle" value={user.role} />
    </ScrollView>
  );
}

function Field({ label, placeholder, value }: { label: string; placeholder?: string; value?: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput editable={false} placeholder={placeholder} style={styles.input} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 50 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  back: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 24, marginTop: 8 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  eyebrow: { color: colors.secondary, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.textStrong, fontSize: 29, fontWeight: "900", marginTop: 5 },
  notice: { flexDirection: "row", gap: 10, backgroundColor: "#EAF1FF", borderRadius: 20, marginVertical: 20, padding: 15 },
  noticeText: { flex: 1, color: colors.primaryDark, fontSize: 12, fontWeight: "700", lineHeight: 18 },
  field: { marginBottom: 15 },
  label: { color: colors.textStrong, fontSize: 13, fontWeight: "900", marginBottom: 7 },
  input: { minHeight: 52, color: colors.text, backgroundColor: colors.surface, borderColor: "#E2E8F0", borderRadius: 17, borderWidth: 1, fontSize: 15, paddingHorizontal: 15 },
});
