import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { logout } from "../../src/services/authService";
import {
  getUser,
  subscribeToUserChanges,
} from "../../src/storage/userStorage";
import { colors } from "../../src/theme/colors";
import { User, UserRole } from "../../src/types/user";

const roleLabels: Record<UserRole, string> = {
  admin: "Administrateur",
  student: "Élève",
  teacher: "Enseignant",
  parent: "Parent",
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    getUser().then((storedUser) => {
      if (active) {
        setUser(storedUser);
        setLoading(false);
      }
    });
    const unsubscribe = subscribeToUserChanges((updatedUser) => {
      if (active) setUser(updatedUser);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  const initial = fullName.trim().charAt(0).toUpperCase() || "E";

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    await logout();
    router.replace("/onboarding");
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerGlow} />
        <View>
          <Text style={styles.eyebrow}>MON COMPTE EKALAN</Text>
          <Text style={styles.pageTitle}>Mon profil</Text>
          <Text style={styles.headerText}>Gère ton espace et tes préférences.</Text>
        </View>
        <Pressable
          accessibilityLabel="Modifier mes informations"
          accessibilityRole="button"
          onPress={() => router.push("/profile-settings")}
          style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
        >
          <MaterialIcons color="#FFFFFF" name="settings" size={27} />
        </Pressable>
      </View>

      <View style={[styles.identityCard, user?.role === "student" && styles.identityCardStudent]}>
        {user?.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatarImage} /> : <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>}
        <View style={styles.identityCopy}>
          <Text style={styles.name}>{fullName || "Utilisateur E-KALAN"}</Text>
          <Text style={styles.role}>{user ? roleLabels[user.role] : "Profil"}</Text>
          <Text style={styles.email}>{user?.email || "Email non renseigné"}</Text>
        </View>
        {user?.role === "student" ? (
          <View style={styles.classBadge}>
            <MaterialIcons color={colors.primary} name="school" size={18} />
            <Text style={styles.classText}>{user.class_name || "Classe à confirmer"}</Text>
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityLabel="S’abonner"
        accessibilityRole="button"
        onPress={() => router.push("/subscription")}
        style={({ pressed }) => [styles.subscribeButton, pressed && styles.pressed]}
      >
        <View style={styles.premiumIcon}><MaterialIcons color="#F59E0B" name="workspace-premium" size={29} /></View>
        <View style={styles.premiumCopy}>
          <Text style={styles.subscribeEyebrow}>EKALAN PREMIUM</Text>
          <Text style={styles.subscribeTitle}>Découvrir l’abonnement</Text>
          <Text style={styles.subscribeText}>Accède à un accompagnement renforcé.</Text>
        </View>
        <MaterialIcons color={colors.surface} name="arrow-forward" size={25} />
      </Pressable>

      <Text style={styles.sectionTitle}>Mon espace</Text>
      <View style={styles.menu}>
        <ProfileAction
          color="#16A34A"
          icon="share"
          label="Partager l’application"
          onPress={() =>
            void Share.share({
              message:
                "Découvre EKALAN, l’application éducative qui accompagne chaque élève dans sa progression.",
            })
          }
        />
        <ProfileAction
          color="#0284C7"
          icon="help-outline"
          label="Aide"
          onPress={() => router.push("/help")}
        />
        <ProfileAction
          color={colors.danger}
          disabled={loggingOut}
          icon="logout"
          label={loggingOut ? "Déconnexion..." : "Se déconnecter"}
          onPress={() => void handleLogout()}
        />
      </View>
    </ScrollView>
  );
}

function ProfileAction({
  color,
  disabled,
  icon,
  label,
  onPress,
}: {
  color: string;
  disabled?: boolean;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${color}16` }]}>
        <MaterialIcons color={color} name={icon} size={25} />
      </View>
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      <View style={styles.menuArrow}><MaterialIcons color={color} name="arrow-forward" size={20} /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  container: { flexGrow: 1, backgroundColor: "#F5F8FD", padding: 16, paddingBottom: 38 },
  header: { minHeight: 210, overflow: "hidden", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginHorizontal: -16, marginTop: -16, marginBottom: 0, paddingHorizontal: 24, paddingTop: 66, borderBottomLeftRadius: 38, borderBottomRightRadius: 38, backgroundColor: colors.primaryDark },
  headerGlow: { position: "absolute", right: -75, top: -45, width: 230, height: 230, borderRadius: 115, backgroundColor: colors.primary, opacity: 0.9 },
  eyebrow: { color: "#8FE0B0", fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  pageTitle: { color: "#FFFFFF", fontSize: 31, fontWeight: "900", marginTop: 5 },
  headerText: { marginTop: 7, color: "#C9D9F6", fontSize: 13, fontWeight: "700" },
  settings: { width: 52, height: 52, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.22)", borderWidth: 1, borderRadius: 18 },
  identityCard: { minHeight: 132, flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderColor: "#E8EEF7", borderWidth: 1, borderRadius: 26, marginTop: -42, padding: 18, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.13, shadowRadius: 18, elevation: 7 },
  identityCardStudent: { paddingBottom: 48 },
  avatar: { width: 78, height: 78, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderColor: "#DDEBFF", borderRadius: 25, borderWidth: 5 },
  avatarImage: { width: 78, height: 78, borderRadius: 25, backgroundColor: "#DDEBFF" },
  avatarText: { color: colors.surface, fontSize: 32, fontWeight: "900" },
  identityCopy: { flex: 1, minWidth: 0 },
  name: { color: colors.textStrong, fontSize: 21, fontWeight: "900" },
  role: { color: colors.primary, fontSize: 13, fontWeight: "900", marginTop: 4 },
  email: { color: colors.muted, fontSize: 12, fontWeight: "700", marginTop: 5 },
  classBadge: { position: "absolute", right: 16, bottom: 12, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#EAF1FF", borderRadius: 13, paddingHorizontal: 10, paddingVertical: 6 },
  classText: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  subscribeButton: { minHeight: 116, flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: colors.primary, borderColor: "#2E66B5", borderWidth: 1, borderRadius: 25, marginTop: 18, paddingHorizontal: 18, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 15, elevation: 6 },
  premiumIcon: { width: 50, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#FFF4D6" },
  premiumCopy: { flex: 1 },
  subscribeEyebrow: { color: "#9CC2FA", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  subscribeTitle: { color: colors.surface, fontSize: 18, fontWeight: "900", marginTop: 3 },
  subscribeText: { color: "#D8E7FF", fontSize: 11, lineHeight: 16, fontWeight: "700", marginTop: 4 },
  sectionTitle: { marginTop: 26, marginBottom: 2, color: colors.textStrong, fontSize: 21, fontWeight: "900" },
  menu: { gap: 12, marginTop: 12 },
  menuItem: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 14, borderColor: "#E8EEF7", borderWidth: 1, borderRadius: 21, backgroundColor: colors.surface, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  menuIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 16 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "900" },
  menuArrow: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#F4F7FB" },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
});
