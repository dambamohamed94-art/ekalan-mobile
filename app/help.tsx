import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { colors } from "../src/theme/colors";

const topics = [
  ["school", "Accéder à mes matières", "Retrouve les contenus correspondant à ta classe depuis l’onglet Matières."],
  ["quiz", "Comprendre les quiz", "Les quiz sont liés à une leçon et servent à vérifier tes acquis."],
  ["auto-awesome", "Demander de l’aide à Sacko", "Sacko peut te guider étape par étape dans tes révisions."],
] as const;

export default function Help() {
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
      <Text style={styles.eyebrow}>CENTRE D’AIDE</Text>
      <Text style={styles.title}>Comment pouvons-nous t’aider ?</Text>
      {topics.map(([icon, title, text]) => (
        <View key={title} style={styles.card}>
          <View style={styles.icon}><MaterialIcons color={colors.primary} name={icon} size={27} /></View>
          <View style={styles.copy}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.text}>{text}</Text></View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 50 },
  back: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 24, marginTop: 8 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  eyebrow: { color: colors.secondary, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: colors.textStrong, fontSize: 29, fontWeight: "900", lineHeight: 35, marginBottom: 12, marginTop: 5 },
  card: { flexDirection: "row", gap: 14, backgroundColor: colors.surface, borderRadius: 23, marginTop: 14, padding: 17, elevation: 3 },
  icon: { width: 50, height: 50, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF1FF", borderRadius: 16 },
  copy: { flex: 1 },
  cardTitle: { color: colors.textStrong, fontSize: 16, fontWeight: "900" },
  text: { color: colors.muted, fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 6 },
});
