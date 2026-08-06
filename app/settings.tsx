import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { MainBottomNav } from "../components/main-bottom-nav";
import { PremiumPageHeader } from "../components/premium-page-header";
import { colors } from "../src/theme/colors";

const general = [
  ["translate", "Langue de l’application", "Français", "#263B8E"],
  ["dark-mode", "Thème", "Système", "#3F2B96"],
  ["accessibility", "Accessibilité", "Taille du texte, contraste…", "#1473D4"],
  ["notifications", "Notifications", "Gérer vos préférences", "#536EAE"],
] as const;

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PremiumPageHeader />
        <Text style={styles.title}>Paramètres</Text>
        <Text style={styles.sectionLabel}>GÉNÉRAL</Text>
        <View style={styles.card}>
          {general.map(([icon, title, subtitle, color]) => <SettingRow color={color} icon={icon} key={title} subtitle={subtitle} title={title} />)}
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: "#E4F4F8" }]}><MaterialIcons color="#368AA0" name="volume-up" size={23} /></View>
            <View style={styles.rowCopy}><Text style={styles.rowTitle}>Son</Text><Text style={styles.rowSubtitle}>Effets sonores et musique</Text></View>
            <Switch trackColor={{ false: "#CBD5E1", true: "#22A447" }} value />
          </View>
        </View>
        <Text style={styles.sectionLabel}>APPARENCE ET COMPTE</Text>
        <View style={styles.card}>
          <SettingRow color="#3B82F6" icon="image" subtitle="Choisir un fond" title="Arrière-plan" />
          <SettingRow color="#169B51" icon="face" subtitle="Personnaliser Sacko" title="Mascotte" />
          <SettingRow color="#6D3BD1" icon="verified-user" onPress={() => router.push("/security")} subtitle="Protection du compte" title="Sécurité" />
        </View>
      </ScrollView>
      <MainBottomNav activeTab="profile" />
    </View>
  );
}

function SettingRow({ color, icon, onPress, subtitle, title }: { color: string; icon: React.ComponentProps<typeof MaterialIcons>["name"]; onPress?: () => void; subtitle: string; title: string }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
    <View style={[styles.rowIcon, { backgroundColor: `${color}18` }]}><MaterialIcons color={color} name={icon} size={23} /></View>
    <View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowSubtitle}>{subtitle}</Text></View>
    <MaterialIcons color="#244A86" name="chevron-right" size={25} />
  </Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F9FE" }, content: { padding: 18, paddingBottom: 30 },
  title: { color: colors.textStrong, fontSize: 29, fontWeight: "900", marginTop: 10 },
  sectionLabel: { color: "#4338CA", fontSize: 12, fontWeight: "900", letterSpacing: 1.1, marginBottom: 10, marginTop: 24 },
  card: { overflow: "hidden", backgroundColor: "#FFFFFF", borderColor: "#E4EAF4", borderRadius: 22, borderWidth: 1, shadowColor: "#8CA3C5", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.13, shadowRadius: 14, elevation: 4 },
  row: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, borderBottomColor: "#E8EDF5", borderBottomWidth: 1, paddingHorizontal: 14 },
  rowIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 13 }, rowCopy: { flex: 1 },
  rowTitle: { color: colors.textStrong, fontSize: 14, fontWeight: "900" }, rowSubtitle: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 4 }, pressed: { opacity: 0.72 },
});
