import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
        <View>
          <Text style={styles.eyebrow}>MON ESPACE</Text>
          <Text style={styles.pageTitle}>Profil</Text>
        </View>
        <Pressable
          accessibilityLabel="Modifier mes informations"
          accessibilityRole="button"
          onPress={() => router.push("/profile-settings")}
          style={({ pressed }) => [styles.settings, pressed && styles.pressed]}
        >
          <MaterialIcons color={colors.primary} name="settings" size={27} />
        </Pressable>
      </View>

      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{fullName || "Utilisateur E-KALAN"}</Text>
        <Text style={styles.role}>{user ? roleLabels[user.role] : "Profil"}</Text>
        <Text style={styles.email}>{user?.email || "Email non renseigné"}</Text>
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
        <View>
          <Text style={styles.subscribeEyebrow}>EKALAN PREMIUM</Text>
          <Text style={styles.subscribeTitle}>S’abonner</Text>
        </View>
        <MaterialIcons color={colors.surface} name="workspace-premium" size={31} />
      </Pressable>

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
      <MaterialIcons color="#94A3B8" name="chevron-right" size={26} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  container: { flexGrow: 1, backgroundColor: colors.background, padding: 20, paddingBottom: 38 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, marginTop: 8 },
  eyebrow: { color: colors.secondary, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  pageTitle: { color: colors.textStrong, fontSize: 31, fontWeight: "900", marginTop: 3 },
  settings: { width: 52, height: 52, alignItems: "center", justifyContent: "center", backgroundColor: "#DDEBFF", borderRadius: 18 },
  identityCard: { alignItems: "center", backgroundColor: colors.surface, borderRadius: 30, padding: 23, elevation: 5 },
  avatar: { width: 92, height: 92, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderColor: "#DDEBFF", borderRadius: 46, borderWidth: 6 },
  avatarText: { color: colors.surface, fontSize: 38, fontWeight: "900" },
  name: { color: colors.textStrong, fontSize: 24, fontWeight: "900", marginTop: 16, textAlign: "center" },
  role: { color: colors.primary, fontSize: 14, fontWeight: "900", marginTop: 5 },
  email: { color: colors.muted, fontSize: 13, fontWeight: "700", marginTop: 7 },
  classBadge: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "#EAF1FF", borderRadius: 15, marginTop: 15, paddingHorizontal: 13, paddingVertical: 8 },
  classText: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  subscribeButton: { minHeight: 90, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.primary, borderRadius: 26, marginTop: 20, paddingHorizontal: 22, elevation: 5 },
  subscribeEyebrow: { color: "#BFDBFE", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  subscribeTitle: { color: colors.surface, fontSize: 22, fontWeight: "900", marginTop: 4 },
  menu: { overflow: "hidden", backgroundColor: colors.surface, borderRadius: 26, marginTop: 20, paddingHorizontal: 16 },
  menuItem: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 13, borderBottomColor: "#EEF1F5", borderBottomWidth: 1 },
  menuIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 15 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "900" },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
});
