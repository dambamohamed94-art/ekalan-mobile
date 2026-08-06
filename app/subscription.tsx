import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MainBottomNav } from "../components/main-bottom-nav";
import { PremiumPageHeader } from "../components/premium-page-header";
import { colors } from "../src/theme/colors";

const benefits = [
  "Accès à tous les cours et leçons",
  "Quiz et exercices illimités",
  "Suivi détaillé et rapports avancés",
  "Contenus exclusifs",
  "Pas de publicité",
];

export default function Subscription() {
  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <PremiumPageHeader />
      <View style={styles.hero}>
        <View style={styles.sparkOne} /><View style={styles.sparkTwo} />
        <Text style={styles.crown}>♛</Text>
        <Text style={styles.heroTitle}>EKALAN{`\n`}PREMIUM</Text>
        <Text style={styles.heroText}>Débloque tout le potentiel{`\n`}de ton apprentissage !</Text>
        <Image contentFit="contain" source={require("../assets/images/cameleon-official.webp")} style={styles.mascot} />
      </View>

      <View style={styles.planCard}>
        <Text style={styles.sectionTitle}>Ton abonnement actuel</Text>
        <View style={styles.planLine}>
          <Text style={styles.planName}>Premium Mensuel</Text>
          <View style={styles.status}><Text style={styles.statusText}>Aperçu</Text></View>
        </View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Prochain renouvellement</Text><Text style={styles.detailValue}>À confirmer</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Prix</Text><Text style={styles.detailValue}>À confirmer</Text></View>
      </View>

      <View style={styles.benefitsCard}>
        <Text style={styles.sectionTitle}>Avantages Premium</Text>
        {benefits.map((benefit) => <View key={benefit} style={styles.benefit}><MaterialIcons color="#21A446" name="check-circle" size={19} /><Text style={styles.benefitText}>{benefit}</Text></View>)}
      </View>

      <Pressable accessibilityRole="button" style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}>
        <MaterialIcons color="#FFE36B" name="workspace-premium" size={25} />
        <Text style={styles.manageText}>Gérer mon abonnement</Text>
      </Pressable>
      <Text style={styles.notice}>Le branchement de la gestion d’abonnement sera réalisé dans un prochain lot.</Text>
    </ScrollView>
    <MainBottomNav activeTab="profile" />
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8FD" }, content: { padding: 16, paddingBottom: 28 },
  hero: { height: 205, overflow: "hidden", backgroundColor: "#0A225C", borderRadius: 25, marginTop: 12, padding: 20, shadowColor: "#071943", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.24, shadowRadius: 18, elevation: 6 },
  crown: { color: "#FFD34E", fontSize: 34, lineHeight: 40 }, heroTitle: { color: "#FFD45E", fontSize: 28, fontWeight: "900", lineHeight: 31 }, heroText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700", lineHeight: 19, marginTop: 10 }, mascot: { position: "absolute", right: -2, bottom: -9, width: 155, height: 170 }, sparkOne: { position: "absolute", right: 32, top: 25, width: 7, height: 7, backgroundColor: "#FFD34E", borderRadius: 4 }, sparkTwo: { position: "absolute", right: 125, bottom: 25, width: 5, height: 5, backgroundColor: "#FFD34E", borderRadius: 3 },
  planCard: { backgroundColor: "#FFFFFF", borderColor: "#E7EBF2", borderRadius: 22, borderWidth: 1, marginTop: 17, padding: 15, elevation: 3 }, sectionTitle: { color: colors.textStrong, fontSize: 15, fontWeight: "900", marginBottom: 13 }, planLine: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFF8E8", borderColor: "#F5DDA4", borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 }, planName: { color: colors.textStrong, fontSize: 15, fontWeight: "900" }, status: { backgroundColor: "#E3F5E7", borderRadius: 12, paddingHorizontal: 9, paddingVertical: 5 }, statusText: { color: "#16833A", fontSize: 11, fontWeight: "900" }, detailRow: { flexDirection: "row", justifyContent: "space-between", borderBottomColor: "#EDF0F5", borderBottomWidth: 1, paddingHorizontal: 10, paddingVertical: 12 }, detailLabel: { color: colors.muted, fontSize: 11, fontWeight: "700" }, detailValue: { color: colors.textStrong, fontSize: 11, fontWeight: "900" },
  benefitsCard: { backgroundColor: "#FFFFFF", borderColor: "#E7EBF2", borderRadius: 22, borderWidth: 1, marginTop: 15, padding: 16, elevation: 3 }, benefit: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 10 }, benefitText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  manageButton: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#20A43A", borderRadius: 19, marginTop: 16, shadowColor: "#167B2D", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 12, elevation: 5 }, manageText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" }, notice: { color: colors.muted, fontSize: 10, fontWeight: "700", lineHeight: 16, marginTop: 12, textAlign: "center" }, pressed: { opacity: 0.78 },
});
