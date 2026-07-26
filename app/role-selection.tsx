import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../components/brand-logo";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";

export default function RoleSelection() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour"
          accessibilityRole="button"
          onPress={() => goBackOrReplace("/onboarding")}
          style={styles.backButton}
        >
        <Text style={styles.back}>‹</Text>
        </Pressable>
        <BrandLogo style={styles.logo} />
      </View>

      <Text style={styles.title}>Je suis un...</Text>

      <View style={styles.cards}>
       <RoleCard emoji="☕" title="Parent" route="/register-parent" />
        <RoleCard emoji="🎒" title="Élève" route="/register-student" />
        <RoleCard emoji="👨‍🏫" title="Prof" route="/register-teacher" />
      </View>

      <Pressable
        accessibilityLabel="Se connecter avec un compte existant"
        accessibilityRole="button"
        onPress={() => router.push("/login")}
      >
        <Text style={styles.loginText}>J’ai déjà un compte</Text>
      </Pressable>
    </View>
  );
}

function RoleCard({
  emoji,
  title,
  route,
}: {
  emoji: string;
  title: string;
  route: "/register-parent" | "/register-student" | "/register-teacher";
}) {
  return (
    <Pressable
      accessibilityLabel={`Créer un compte ${title}`}
      accessibilityRole="button"
      style={styles.card}
      onPress={() => router.push(route)}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F1EC",
    paddingHorizontal: 24,
  },
  header: {
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    position: "absolute",
    left: 0,
    fontSize: 54,
    color: "#555",
  },
  logo: {
    width: 58,
    height: 58,
  },
  title: {
    marginTop: 60,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "900",
    color: "#4B4B4B",
  },
  backButton: {
  position: "absolute",
  left: 0,
  padding: 10,
  zIndex: 10,
},
  cards: {
    marginTop: 50,
    gap: 28,
    alignItems: "center",
  },
  card: {
    width: "78%",
    height: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E5CDB7",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  emoji: {
    fontSize: 46,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#555",
  },
  loginText: {
    marginTop: 70,
    textAlign: "center",
    fontSize: 24,
    color: "#555",
    fontWeight: "600",
  },
});
