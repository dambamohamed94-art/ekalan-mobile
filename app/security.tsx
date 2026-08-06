import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MainBottomNav } from "../components/main-bottom-nav";
import { PremiumPageHeader } from "../components/premium-page-header";
import { colors } from "../src/theme/colors";

const actions = [
  ["vpn-key", "Changer le mot de passe", "Modifier votre mot de passe"],
  ["enhanced-encryption", "Authentification à deux facteurs", "Protéger votre compte"],
  ["devices", "Appareils connectés", "Gérer vos sessions actives"],
  ["history", "Historique de connexion", "Voir les connexions récentes"],
  ["phonelink-erase", "Déconnexion de tous les appareils", "Sécurité avancée"],
] as const;

export default function SecurityScreen() {
  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PremiumPageHeader fallback="/settings" />
      <View style={styles.hero}>
        <View style={styles.shield}><MaterialIcons color="#FFFFFF" name="shield" size={54} /></View>
        <View style={styles.heroCopy}><Text style={styles.heroTitle}>Votre compte est sécurisé</Text><Text style={styles.heroText}>Dernière activité :{`\n`}Aujourd’hui</Text></View>
        <View style={styles.check}><MaterialIcons color="#FFFFFF" name="check" size={19} /></View>
      </View>
      <View style={styles.card}>{actions.map(([icon, title, subtitle], index) => <Pressable accessibilityRole="button" key={title} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.icon}><MaterialIcons color="#6D3BD1" name={icon} size={24} /></View>
        <View style={styles.copy}><Text style={styles.title}>{title}</Text><Text style={styles.subtitle}>{subtitle}</Text></View>
        {index === 1 ? <View style={styles.active}><Text style={styles.activeText}>Activée</Text></View> : null}
        {index === 2 ? <View style={styles.count}><Text style={styles.countText}>2</Text></View> : null}
        <MaterialIcons color="#244A86" name="chevron-right" size={24} />
      </Pressable>)}</View>
      <Text style={styles.notice}>Les actions de sécurité seront branchées lors du prochain lot fonctionnel.</Text>
    </ScrollView>
    <MainBottomNav activeTab="profile" />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F7FF" }, content: { padding: 18, paddingBottom: 28 },
  hero: { minHeight: 160, flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#4B2BB8", borderRadius: 24, marginTop: 18, padding: 20, shadowColor: "#39228B", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.28, shadowRadius: 18, elevation: 7 },
  shield: { width: 68, height: 82, alignItems: "center", justifyContent: "center", borderColor: "#BBA7FF", borderRadius: 28, borderWidth: 3 }, heroCopy: { flex: 1 }, heroTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" }, heroText: { color: "#E4DBFF", fontSize: 12, fontWeight: "700", lineHeight: 19, marginTop: 10 }, check: { width: 34, height: 34, alignItems: "center", justifyContent: "center", backgroundColor: "#35208F", borderRadius: 17 },
  card: { overflow: "hidden", backgroundColor: "#FFFFFF", borderColor: "#E5E8F2", borderRadius: 23, borderWidth: 1, marginTop: 20, shadowColor: "#7B8CA8", shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.13, shadowRadius: 16, elevation: 4 },
  row: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 11, borderBottomColor: "#E8EAF2", borderBottomWidth: 1, paddingHorizontal: 13 }, icon: { width: 43, height: 43, alignItems: "center", justifyContent: "center", backgroundColor: "#EFE9FF", borderRadius: 14 }, copy: { flex: 1 }, title: { color: colors.textStrong, fontSize: 13, fontWeight: "900" }, subtitle: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 4 }, active: { backgroundColor: "#E1F5E5", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5 }, activeText: { color: "#148539", fontSize: 10, fontWeight: "900" }, count: { width: 27, height: 27, alignItems: "center", justifyContent: "center", backgroundColor: "#E8ECFA", borderRadius: 14 }, countText: { color: "#314584", fontWeight: "900" }, notice: { color: colors.muted, fontSize: 11, fontWeight: "700", lineHeight: 17, marginTop: 18, textAlign: "center" }, pressed: { opacity: 0.72 },
});
