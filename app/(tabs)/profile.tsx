import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../../components/brand-logo";
import { logout } from "../../src/services/authService";
import { getStudentDashboard } from "../../src/services/roleDashboardService";
import { getUser, subscribeToUserChanges } from "../../src/storage/userStorage";
import { colors } from "../../src/theme/colors";
import { StudentDashboard } from "../../src/types/dashboard";
import { User, UserRole } from "../../src/types/user";

const roleLabels: Record<UserRole, string> = { admin: "Administrateur", student: "Élève", teacher: "Enseignant", parent: "Parent" };
const roleCharacters = {
  student: require("../../assets/images/dashboard-student-character.svg"),
  teacher: require("../../assets/images/dashboard-teacher-character.svg"),
  parent: require("../../assets/images/dashboard-parent-character.svg"),
  admin: require("../../assets/images/dashboard-teacher-character.svg"),
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;
    getUser().then(async (storedUser) => {
      if (!active) return;
      setUser(storedUser);
      if (storedUser?.role === "student") {
        try { setDashboard(await getStudentDashboard()); } catch { setDashboard(null); }
      }
      setLoading(false);
    });
    const unsubscribe = subscribeToUserChanges((updatedUser) => active && setUser(updatedUser));
    return () => { active = false; unsubscribe(); };
  }, []);

  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></View>;

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.full_name || "Utilisateur EKALAN";
  const xp = dashboard?.overview.xp ?? dashboard?.student.xp;
  const level = typeof dashboard?.overview.level === "number" ? dashboard.overview.level : dashboard?.overview.level?.level ?? dashboard?.student.level;
  const badges = dashboard?.badges?.length;

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    router.replace("/onboarding");
  };

  return <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.topBar}>
      <View style={styles.logoShell}><BrandLogo size={49} /></View>
      <Pressable accessibilityLabel="Ouvrir les paramètres" accessibilityRole="button" onPress={() => router.push("/settings")} style={styles.headerButton}><MaterialIcons color={colors.primaryDark} name="settings" size={25} /></Pressable>
    </View>

    <View style={styles.hero}>
      <Image contentFit="cover" source={require("../../assets/images/dashboard-student-bg.webp")} style={StyleSheet.absoluteFill} />
      <View style={styles.heroOverlay} />
      <Image contentFit="contain" source={roleCharacters[user?.role ?? "student"]} style={styles.character} />
      {user?.role === "student" ? <Image contentFit="contain" source={require("../../assets/images/dashboard-student-cameleon.svg")} style={styles.cameleon} /> : null}
      <View style={styles.identity}>
        <Text numberOfLines={1} style={styles.name}>{fullName}</Text>
        <Text style={styles.role}>{user ? roleLabels[user.role] : "Profil"}</Text>
        {user?.class_name ? <View style={styles.classBadge}><Text style={styles.classText}>{user.class_name}</Text></View> : null}
      </View>
    </View>

    <View style={styles.stats}>
      <Stat label="Niveau" value={level == null ? "—" : String(level)} />
      <Stat label="XP" value={xp == null ? "—" : String(xp)} />
      <Stat label="Étoiles" value={badges == null ? "—" : String(badges)} />
    </View>

    <View style={styles.menu}>
      <ProfileRow color="#7655D9" icon="person" onPress={() => router.push("/profile-settings")} subtitle="Modifier mon profil" title="Informations personnelles" />
      <ProfileRow color="#3D72E5" icon="school" subtitle={user?.class_name || "Consulter mes classes"} title="Mes classes" />
      <ProfileRow color="#3567C4" icon="insert-chart" onPress={() => router.push("/progress-overview")} subtitle="Voir mes statistiques" title="Mes progrès" />
      <ProfileRow color="#F5A133" icon="star" onPress={() => router.push("/progress-rewards")} subtitle={badges == null ? "Consulter mes récompenses" : `${badges} badge(s) obtenu(s)`} title="Mes badges" />
      <ProfileRow color="#28A568" icon="history" subtitle="Consulter mon activité" title="Historique d’activités" />
      <ProfileRow color="#6D3BD1" icon="verified-user" onPress={() => router.push("/security")} subtitle="Protéger mon compte" title="Sécurité" />
      <ProfileRow color="#F1A900" icon="workspace-premium" onPress={() => router.push("/subscription")} subtitle="Voir mon offre actuelle" title="Abonnement" />
    </View>

    <View style={styles.secondaryActions}>
      <Pressable onPress={() => void Share.share({ message: "Découvre EKALAN, l’application éducative qui accompagne chaque élève." })} style={styles.secondaryButton}><MaterialIcons color={colors.primary} name="share" size={20} /><Text style={styles.secondaryText}>Partager</Text></Pressable>
      <Pressable disabled={loggingOut} onPress={() => void handleLogout()} style={styles.secondaryButton}><MaterialIcons color={colors.danger} name="logout" size={20} /><Text style={[styles.secondaryText, { color: colors.danger }]}>{loggingOut ? "Déconnexion…" : "Se déconnecter"}</Text></Pressable>
    </View>
  </ScrollView>;
}

function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }
function ProfileRow({ color, icon, onPress, subtitle, title }: { color: string; icon: React.ComponentProps<typeof MaterialIcons>["name"]; onPress?: () => void; subtitle: string; title: string }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}><View style={[styles.rowIcon, { backgroundColor: `${color}18` }]}><MaterialIcons color={color} name={icon} size={24} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowSubtitle}>{subtitle}</Text></View><MaterialIcons color="#274B83" name="chevron-right" size={25} /></Pressable>; }

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F4F8FD" }, container: { flexGrow: 1, backgroundColor: "#F4F8FD", padding: 16, paddingBottom: 36 },
  topBar: { height: 66, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, logoShell: { width: 58, height: 58, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderRadius: 18, elevation: 3 }, headerButton: { width: 46, height: 46, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderRadius: 15, elevation: 3 },
  hero: { height: 225, overflow: "hidden", backgroundColor: "#E9F5FF", borderRadius: 28, marginTop: 7 }, heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.12)" }, character: { position: "absolute", left: -12, bottom: -35, width: 190, height: 220 }, cameleon: { position: "absolute", right: -25, bottom: -20, width: 145, height: 145 }, identity: { position: "absolute", left: 155, top: 49, right: 75 }, name: { color: colors.textStrong, fontSize: 22, fontWeight: "900" }, role: { color: colors.secondary, fontSize: 13, fontWeight: "900", marginTop: 6 }, classBadge: { alignSelf: "flex-start", backgroundColor: "#4A48B8", borderRadius: 10, marginTop: 10, paddingHorizontal: 12, paddingVertical: 6 }, classText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  stats: { minHeight: 91, flexDirection: "row", backgroundColor: "#132D78", borderRadius: 20, marginTop: -23, marginHorizontal: 13, paddingVertical: 14, elevation: 6 }, stat: { flex: 1, alignItems: "center", justifyContent: "center", borderRightColor: "rgba(255,255,255,0.18)", borderRightWidth: 1 }, statLabel: { color: "#D7E2FF", fontSize: 11, fontWeight: "800" }, statValue: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", marginTop: 6 },
  menu: { overflow: "hidden", backgroundColor: "#FFFFFF", borderColor: "#E4EAF4", borderRadius: 24, borderWidth: 1, marginTop: 18, elevation: 4 }, row: { minHeight: 71, flexDirection: "row", alignItems: "center", gap: 12, borderBottomColor: "#E8EDF5", borderBottomWidth: 1, paddingHorizontal: 14 }, rowIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 13 }, rowCopy: { flex: 1 }, rowTitle: { color: colors.textStrong, fontSize: 14, fontWeight: "900" }, rowSubtitle: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 4 },
  secondaryActions: { flexDirection: "row", gap: 10, marginTop: 17 }, secondaryButton: { flex: 1, minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, backgroundColor: "#FFFFFF", borderColor: "#E3E9F2", borderRadius: 16, borderWidth: 1 }, secondaryText: { color: colors.primary, fontSize: 12, fontWeight: "900" }, pressed: { opacity: 0.72 },
});
