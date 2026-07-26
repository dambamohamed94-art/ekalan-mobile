import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedSackoLogo } from "../../components/animated-sacko-logo";
import { getSackoConfig } from "../../src/services/sackoService";
import { colors } from "../../src/theme/colors";

export default function Sacko() {
  const [accessMode, setAccessMode] = useState<"basic" | "premium">("basic");

  useEffect(() => {
    let active = true;

    getSackoConfig()
      .then((config) => {
        if (active) {
          setAccessMode(config.access_mode ?? "basic");
        }
      })
      .catch(() => {
        if (active) {
          setAccessMode("basic");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.hero}>
        <View style={styles.logoHalo}>
          <AnimatedSackoLogo />
        </View>
        <Text style={styles.eyebrow}>COACH PÉDAGOGIQUE EKALAN</Text>
        <Text style={styles.title}>Sacko, ton coach pédagogique</Text>
        <Text style={styles.subtitle}>
          Comprends tes cours et avance étape par étape, à ton rythme.
        </Text>
        <View
          accessibilityLabel={
            accessMode === "premium"
              ? "Sacko IA Premium actif"
              : "Sacko Basic inclus"
          }
          style={[
            styles.accessBadge,
            accessMode === "premium" && styles.premiumBadge,
          ]}
        >
          <MaterialIcons
            color={accessMode === "premium" ? "#B45309" : colors.secondary}
            name={accessMode === "premium" ? "workspace-premium" : "school"}
            size={18}
          />
          <Text
            style={[
              styles.accessBadgeText,
              accessMode === "premium" && styles.premiumBadgeText,
            ]}
          >
            {accessMode === "premium"
              ? "Sacko IA Premium actif"
              : "Sacko Basic inclus"}
          </Text>
        </View>
      </View>

      <View style={styles.futureLabel}>
        <Text style={styles.futureLabelText}>BIENTÔT</Text>
      </View>
      <View style={[styles.actionCard, styles.futureCard]}>
        <View style={styles.actionIcon}>
          <MaterialIcons color={colors.primary} name="photo-camera" size={32} />
        </View>
        <View style={styles.actionCopy}>
          <Text style={styles.actionTitle}>Résoudre mon exercice</Text>
          <Text style={styles.actionText}>
            Prends ton exercice en photo et Sacko t’aidera étape par étape.
          </Text>
        </View>
        <MaterialIcons color="#94A3B8" name="lock-clock" size={27} />
      </View>

      <Pressable
        accessibilityLabel="Lancer une discussion avec Sacko"
        accessibilityRole="button"
        onPress={() => router.push("/sacko-chat")}
        style={({ pressed }) => [
          styles.actionCard,
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.actionIcon, styles.chatIcon]}>
          <MaterialIcons color={colors.secondary} name="chat-bubble-outline" size={32} />
        </View>
        <View style={styles.actionCopy}>
          <Text style={styles.actionTitle}>Lancer une discussion</Text>
          <Text style={styles.actionText}>
            Grâce au chat, Sacko te coache dans toutes tes révisions.
          </Text>
        </View>
        <View style={styles.arrow}>
          <MaterialIcons color={colors.primary} name="arrow-forward" size={26} />
        </View>
      </Pressable>

      <View style={styles.teacherHeader}>
        <View style={styles.teacherIllustration}>
          <MaterialIcons color={colors.primary} name="support-agent" size={42} />
          <View style={styles.teacherBubble}>
            <MaterialIcons color={colors.surface} name="more-horiz" size={22} />
          </View>
        </View>
        <Text style={styles.teacherHeading}>Mon prof</Text>
      </View>

      <View style={styles.actionCard}>
        <View style={[styles.actionIcon, styles.teacherIcon]}>
          <MaterialIcons color="#EA580C" name="question-answer" size={32} />
        </View>
        <View style={styles.actionCopy}>
          <Text style={styles.actionTitle}>Poser une question à mon prof</Text>
          <Text style={styles.actionText}>
            Un espace d’échange avec ton professeur sera bientôt disponible.
          </Text>
        </View>
        <View style={styles.soonBadge}>
          <Text style={styles.soonText}>Bientôt</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <MaterialIcons color={colors.primary} name="verified-user" size={25} />
        <Text style={styles.infoText}>
          Sacko te guide sans faire le travail à ta place. Vérifie toujours les
          réponses importantes avec ton cours.
        </Text>
      </View>

      {accessMode === "basic" ? (
        <Pressable
          accessibilityLabel="Découvrir les services Premium"
          accessibilityRole="button"
          onPress={() => router.push("/subscription")}
          style={({ pressed }) => [
            styles.premiumInfo,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.premiumInfoIcon}>
            <MaterialIcons
              color="#B45309"
              name="workspace-premium"
              size={25}
            />
          </View>
          <View style={styles.actionCopy}>
            <Text style={styles.premiumInfoTitle}>Services Premium</Text>
            <Text style={styles.premiumInfoText}>
              Sacko Basic reste disponible. Découvre les services avancés
              proposés avec les offres EKALAN.
            </Text>
          </View>
          <MaterialIcons color={colors.primary} name="arrow-forward" size={24} />
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  hero: { alignItems: "center", marginBottom: 24 },
  logoHalo: {
    width: 178,
    height: 144,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F4FF",
    borderRadius: 34,
    marginTop: 8,
  },
  eyebrow: { color: colors.secondary, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 18 },
  title: { color: colors.textStrong, fontSize: 29, fontWeight: "900", marginTop: 5, textAlign: "center" },
  subtitle: { color: colors.muted, fontSize: 14, fontWeight: "700", lineHeight: 21, marginTop: 8, textAlign: "center" },
  accessBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#EAF8EF",
    borderRadius: 999,
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  accessBadgeText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "900",
  },
  premiumBadge: { backgroundColor: "#FFF7D6" },
  premiumBadgeText: { color: "#B45309" },
  futureLabel: {
    alignSelf: "flex-start",
    zIndex: 1,
    backgroundColor: "#F43F5E",
    borderRadius: 10,
    marginBottom: -12,
    marginLeft: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    transform: [{ rotate: "-4deg" }],
  },
  futureLabelText: { color: colors.surface, fontSize: 12, fontWeight: "900", letterSpacing: 0.8 },
  actionCard: {
    minHeight: 144,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: colors.surface,
    borderColor: "#E6EAF0",
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 18,
    padding: 18,
    shadowColor: "#DCC8B7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 4,
  },
  futureCard: { opacity: 0.82 },
  actionIcon: {
    width: 57,
    height: 57,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDEBFF",
    borderRadius: 18,
  },
  chatIcon: { backgroundColor: "#EAF8EF" },
  actionCopy: { flex: 1 },
  actionTitle: { color: colors.textStrong, fontSize: 18, fontWeight: "900", lineHeight: 23 },
  actionText: { color: colors.muted, fontSize: 13, fontWeight: "700", lineHeight: 20, marginTop: 8 },
  arrow: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF1FF",
    borderRadius: 23,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  teacherHeader: {
    alignItems: "center",
    marginBottom: 18,
    marginTop: 10,
  },
  teacherIllustration: {
    width: 92,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF1FF",
    borderRadius: 26,
  },
  teacherBubble: {
    position: "absolute",
    top: -8,
    right: -10,
    width: 42,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    borderRadius: 17,
  },
  teacherHeading: {
    color: colors.textStrong,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 12,
  },
  teacherIcon: { backgroundColor: "#FFF0E8" },
  soonBadge: {
    backgroundColor: "#FFF0E8",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  soonText: { color: "#EA580C", fontSize: 10, fontWeight: "900" },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    backgroundColor: "#EAF1FF",
    borderRadius: 22,
    padding: 17,
  },
  infoText: { flex: 1, color: colors.primaryDark, fontSize: 12, fontWeight: "700", lineHeight: 19 },
  premiumInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFDF4",
    borderColor: "#F5D77A",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  premiumInfoIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF2B8",
    borderRadius: 16,
  },
  premiumInfoTitle: {
    color: colors.textStrong,
    fontSize: 15,
    fontWeight: "900",
  },
  premiumInfoText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 4,
  },
});
