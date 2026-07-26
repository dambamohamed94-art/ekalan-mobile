import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { colors } from "../src/theme/colors";

type Offer = "standard" | "premium";
type BillingPeriod = "annual" | "monthly";
type SubscriptionStatus =
  | "not_subscribed"
  | "standard_active"
  | "standard_expired"
  | "premium_active"
  | "premium_expired";

const statusLabels: Record<SubscriptionStatus, string> = {
  not_subscribed: "Non abonné",
  standard_active: "Standard · actif",
  standard_expired: "Standard · expiré",
  premium_active: "Premium · actif",
  premium_expired: "Premium · expiré",
};

const standardFeatures = [
  ["menu-book", "100 % des contenus", "Cours, révisions, quiz et exercices concernés."],
  ["track-changes", "Suivi pédagogique ciblé", "Une progression adaptée aux apprentissages disponibles."],
  ["support-agent", "Accompagnement personnalisé", "Des outils d’aide selon les fonctionnalités activées."],
] as const;

const premiumFeatures = [
  ["devices", "Services numériques EKALAN", "Les outils éducatifs et services numériques disponibles."],
  ["groups", "Professeur à domicile ou mini-groupe", "Un accompagnement humain selon les modalités proposées."],
  ["workspace-premium", "Accompagnement renforcé", "Un suivi plus approfondi des objectifs pédagogiques."],
] as const;

export default function Subscription() {
  const [offer, setOffer] = useState<Offer>("standard");
  const [period, setPeriod] = useState<BillingPeriod>("annual");
  const status: SubscriptionStatus = "not_subscribed";
  const isStandard = offer === "standard";

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.container}
      >
        <Pressable
          accessibilityLabel="Retour au profil"
          accessibilityRole="button"
          onPress={() => goBackOrReplace("/(tabs)/profile")}
          style={styles.back}
        >
          <MaterialIcons color={colors.surface} name="arrow-back" size={26} />
          <Text style={styles.backText}>Retour</Text>
        </Pressable>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>ABONNEMENT EKALAN</Text>
          <Text style={styles.pageTitle}>Choisis ton accompagnement</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{statusLabels[status]}</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <OfferTab
            active={isStandard}
            icon="school"
            label="Standard"
            onPress={() => setOffer("standard")}
          />
          <OfferTab
            active={!isStandard}
            icon="workspace-premium"
            label="Premium"
            onPress={() => setOffer("premium")}
          />
        </View>

        {isStandard ? (
          <View style={styles.offerCard}>
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>RECOMMANDÉ</Text>
            </View>
            <Text style={styles.offerTitle}>Tout pour progresser sereinement</Text>
            <Text style={styles.offerDescription}>
              Accède aux contenus EKALAN et bénéficie d’un suivi pédagogique
              adapté.
            </Text>

            <BillingOption
              active={period === "annual"}
              badge="4 mois économisés"
              description="38 400 FCFA par an"
              label="Offre annuelle"
              onPress={() => setPeriod("annual")}
              price="3 200 FCFA / mois"
            />
            <BillingOption
              active={period === "monthly"}
              description="Facturation mensuelle"
              label="Offre mensuelle"
              onPress={() => setPeriod("monthly")}
              price="4 800 FCFA / mois"
            />

            <View style={styles.features}>
              {standardFeatures.map(([icon, title, text]) => (
                <Feature icon={icon} key={title} text={text} title={title} />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.offerCard}>
            <View style={[styles.recommendedBadge, styles.premiumBadge]}>
              <Text style={styles.premiumBadgeText}>ACCOMPAGNEMENT RENFORCÉ</Text>
            </View>
            <Text style={styles.offerTitle}>EKALAN Premium</Text>
            <Text style={styles.offerDescription}>
              Combine les services numériques EKALAN et un accompagnement
              pédagogique humain.
            </Text>

            <View style={styles.features}>
              {premiumFeatures.map(([icon, title, text]) => (
                <Feature icon={icon} key={title} text={text} title={title} />
              ))}
            </View>

            <View style={styles.contactBox}>
              <MaterialIcons color={colors.primary} name="info-outline" size={25} />
              <Text style={styles.contactText}>
                Nous contacter pour plus d’informations.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.backendNotice}>
          <MaterialIcons color={colors.primary} name="lock-outline" size={22} />
          <Text style={styles.backendNoticeText}>
            Le paiement sécurisé sera disponible après intégration des services
            Web, API et backend nécessaires.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.disabledButton}>
          <Text style={styles.disabledButtonText}>
            {isStandard ? "Paiement bientôt disponible" : "Nous contacter bientôt"}
          </Text>
        </View>
        <Text style={styles.cancelText}>Résiliable à tout moment, sans frais</Text>
      </View>
    </View>
  );
}

function OfferTab({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}
    >
      <MaterialIcons color={active ? colors.surface : colors.primary} name={icon} size={23} />
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </Pressable>
  );
}

function BillingOption({
  active,
  badge,
  description,
  label,
  onPress,
  price,
}: {
  active: boolean;
  badge?: string;
  description: string;
  label: string;
  onPress: () => void;
  price: string;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label}, ${price}`}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      onPress={onPress}
      style={[styles.billing, active && styles.billingActive]}
    >
      {badge ? (
        <View style={styles.savingBadge}>
          <Text style={styles.savingText}>{badge}</Text>
        </View>
      ) : null}
      <View style={[styles.radio, active && styles.radioActive]}>
        {active ? <MaterialIcons color={colors.surface} name="check" size={20} /> : null}
      </View>
      <View style={styles.billingCopy}>
        <Text style={styles.billingLabel}>{label}</Text>
        <Text style={styles.billingPrice}>{price}</Text>
        <Text style={styles.billingDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

function Feature({
  icon,
  text,
  title,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  text: string;
  title: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <MaterialIcons color={colors.primary} name={icon} size={25} />
      </View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.primary },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 150 },
  back: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 22, marginTop: 8, paddingVertical: 7 },
  backText: { color: colors.surface, fontSize: 17, fontWeight: "900" },
  heading: { marginBottom: 20 },
  eyebrow: { color: "#BFDBFE", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  pageTitle: { color: colors.surface, fontSize: 29, fontWeight: "900", lineHeight: 35, marginTop: 5 },
  statusBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 13, marginTop: 13, paddingHorizontal: 11, paddingVertical: 7 },
  statusDot: { width: 8, height: 8, backgroundColor: "#F2A900", borderRadius: 4 },
  statusText: { color: colors.surface, fontSize: 11, fontWeight: "900" },
  tabs: { flexDirection: "row", gap: 7, backgroundColor: colors.surface, borderRadius: 24, marginBottom: 18, padding: 6 },
  tab: { flex: 1, minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 19 },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.textStrong, fontSize: 15, fontWeight: "900" },
  activeTabText: { color: colors.surface },
  offerCard: { backgroundColor: colors.backgroundSoft, borderRadius: 30, padding: 20 },
  recommendedBadge: { alignSelf: "flex-start", backgroundColor: "#DDEBFF", borderRadius: 10, paddingHorizontal: 11, paddingVertical: 6 },
  recommendedText: { color: colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },
  premiumBadge: { backgroundColor: "#EAF8EF" },
  premiumBadgeText: { color: colors.secondary, fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  offerTitle: { color: colors.textStrong, fontSize: 27, fontWeight: "900", lineHeight: 33, marginTop: 14 },
  offerDescription: { color: colors.muted, fontSize: 14, fontWeight: "700", lineHeight: 21, marginBottom: 8, marginTop: 8 },
  billing: { minHeight: 132, flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: colors.surface, borderColor: "#E2E8F0", borderRadius: 23, borderWidth: 2, marginTop: 16, padding: 16 },
  billingActive: { borderColor: "#F2A900", borderWidth: 3 },
  savingBadge: { position: "absolute", zIndex: 1, top: -13, right: 16, backgroundColor: "#F2A900", borderRadius: 12, paddingHorizontal: 11, paddingVertical: 6 },
  savingText: { color: colors.textStrong, fontSize: 10, fontWeight: "900" },
  radio: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderColor: "#CBD5E1", borderRadius: 18, borderWidth: 3 },
  radioActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  billingCopy: { flex: 1 },
  billingLabel: { color: colors.textStrong, fontSize: 17, fontWeight: "900" },
  billingPrice: { color: colors.primary, fontSize: 18, fontWeight: "900", marginTop: 5 },
  billingDescription: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 4 },
  features: { overflow: "hidden", backgroundColor: colors.surface, borderRadius: 24, marginTop: 20, paddingHorizontal: 16 },
  feature: { flexDirection: "row", gap: 13, borderBottomColor: "#E2E8F0", borderBottomWidth: 1, paddingVertical: 17 },
  featureIcon: { width: 43, height: 43, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF1FF", borderRadius: 14 },
  featureCopy: { flex: 1 },
  featureTitle: { color: colors.textStrong, fontSize: 15, fontWeight: "900" },
  featureText: { color: colors.muted, fontSize: 12, fontWeight: "700", lineHeight: 18, marginTop: 5 },
  contactBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#EAF1FF", borderRadius: 20, marginTop: 20, padding: 16 },
  contactText: { flex: 1, color: colors.primaryDark, fontSize: 14, fontWeight: "900", lineHeight: 20 },
  backendNotice: { flexDirection: "row", gap: 10, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: 20, marginTop: 18, padding: 15 },
  backendNoticeText: { flex: 1, color: colors.primaryDark, fontSize: 11, fontWeight: "700", lineHeight: 17 },
  footer: { position: "absolute", right: 0, bottom: 0, left: 0, backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: 10, paddingTop: 14, elevation: 14 },
  disabledButton: { minHeight: 58, alignItems: "center", justifyContent: "center", backgroundColor: "#94A3B8", borderRadius: 23 },
  disabledButtonText: { color: colors.surface, fontSize: 16, fontWeight: "900" },
  cancelText: { color: colors.muted, fontSize: 11, fontWeight: "700", marginTop: 9, textAlign: "center" },
});
