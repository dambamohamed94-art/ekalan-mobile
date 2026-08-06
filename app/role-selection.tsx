import { MaterialIcons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AuthHeader, AuthPage } from "../components/auth-premium";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { premiumColors, premiumShadow } from "../src/theme/premium";

type RoleRoute = "/register-parent" | "/register-student" | "/register-teacher";

const roles: {
  title: string;
  description: string;
  route: RoleRoute;
  image: ImageSource;
  color: string;
  background: string;
}[] = [
  {
    title: "Parent",
    description: "Je souhaite suivre la progression de mon enfant.",
    route: "/register-parent",
    image: require("../assets/images/auth-role-parent-clean.png"),
    color: premiumColors.orange500,
    background: "#FFF7ED",
  },
  {
    title: "Élève",
    description: "Je veux apprendre et progresser avec EKALAN.",
    route: "/register-student",
    image: require("../assets/images/auth-role-student-clean.png"),
    color: premiumColors.green600,
    background: "#EFFBF3",
  },
  {
    title: "Prof",
    description: "Je veux accompagner mes élèves sur EKALAN.",
    route: "/register-teacher",
    image: require("../assets/images/auth-role-teacher-clean.png"),
    color: premiumColors.blue600,
    background: "#EFF6FF",
  },
];

export default function RoleSelection() {
  return (
    <AuthPage>
      <AuthHeader onBack={() => goBackOrReplace("/onboarding")} />
      <Text style={styles.title}>Je suis un...</Text>
      <Text style={styles.subtitle}>Choisis ton profil pour créer un espace qui te ressemble.</Text>
      <View style={styles.cards}>
        {roles.map((role) => (
          <Pressable
            accessibilityLabel={`Créer un compte ${role.title}`}
            accessibilityRole="button"
            key={role.route}
            onPress={() => router.push(role.route)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: role.background, borderColor: `${role.color}45` },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: `${role.color}18` }]}>
              <Image contentFit="contain" source={role.image} style={styles.roleImage} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>{role.title}</Text>
              <Text style={styles.description}>{role.description}</Text>
            </View>
            <MaterialIcons color={role.color} name="chevron-right" size={34} />
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => router.push("/login")}>
        <Text style={styles.loginText}>Déjà un compte ? <Text style={styles.loginLink}>Se connecter</Text></Text>
      </Pressable>
    </AuthPage>
  );
}

const styles = StyleSheet.create({
  title: { color: premiumColors.blue950, textAlign: "center", fontSize: 34, fontWeight: "900", marginTop: 10 },
  subtitle: { color: "#475569", textAlign: "center", fontSize: 15, lineHeight: 21, marginTop: 7, marginBottom: 24 },
  cards: { gap: 16 },
  card: { minHeight: 132, flexDirection: "row", alignItems: "center", padding: 17, borderRadius: 25, borderWidth: 1.5, ...premiumShadow },
  iconBox: { width: 82, height: 82, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  roleImage: { width: 72, height: 72 },
  copy: { flex: 1, paddingHorizontal: 16 },
  cardTitle: { color: premiumColors.blue950, fontSize: 26, fontWeight: "900" },
  description: { color: "#334155", fontSize: 14, lineHeight: 20, marginTop: 4 },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.9 },
  loginText: { color: "#475569", textAlign: "center", marginTop: 26, fontWeight: "700" },
  loginLink: { color: premiumColors.green600, fontWeight: "900" },
});
