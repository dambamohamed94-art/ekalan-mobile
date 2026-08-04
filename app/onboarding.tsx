import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PremiumBackground } from "../components/premium-background";
import { PremiumButton } from "../components/premium-button";
import { markOnboardingAsSeen } from "../src/storage/onboardingStorage";
import { premiumColors } from "../src/theme/premium";

type Slide = {
  id: "welcome" | "sacko" | "dialogue" | "journey";
  eyebrow: string;
  title: string;
  subtitle: string;
};

const slides: Slide[] = [
  {
    id: "welcome",
    eyebrow: "BIENVENUE",
    title: "Apprends mieux\navec EKALAN",
    subtitle: "Retrouve tes cours, avance étape par étape et suis tes progrès depuis ton mobile.",
  },
  {
    id: "sacko",
    eyebrow: "TON ASSISTANT PÉDAGOGIQUE",
    title: "Découvre\nSacko",
    subtitle: "Sacko est l’IA pédagogique d’EKALAN, pensée pour t’accompagner dans ton apprentissage.",
  },
  {
    id: "dialogue",
    eyebrow: "APPRENDRE EN DIALOGUANT",
    title: "Pose tes questions,\navance sereinement",
    subtitle: "Sacko t’aide à mieux comprendre les notions et te propose des explications adaptées à ton parcours.",
  },
  {
    id: "journey",
    eyebrow: "À TON RYTHME",
    title: "Cours, exercices\net progression",
    subtitle: "Tout ton parcours EKALAN réuni dans une expérience simple, claire et personnalisée. Conformément au programme malien.",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const { height, width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const compact = height < 720;
  const isLast = index === slides.length - 1;

  const finish = async (destination: "/role-selection" | "/login") => {
    await markOnboardingAsSeen();
    router.push(destination);
  };

  const next = () => {
    if (isLast) {
      void finish("/role-selection");
      return;
    }
    listRef.current?.scrollToIndex({ animated: true, index: index + 1 });
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <PremiumBackground>
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={[styles.logoCard, compact && styles.logoCardCompact]}>
          <Image
            accessibilityLabel="Logo officiel EKALAN"
            contentFit="contain"
            source={require("../assets/images/ekalan-logo-official.svg")}
            style={[styles.logo, compact && styles.logoCompact]}
          />
        </View>

        <FlatList
          ref={listRef}
          accessibilityLabel={`Présentation EKALAN, page ${index + 1} sur ${slides.length}`}
          bounces={false}
          data={slides}
          decelerationRate="fast"
          getItemLayout={(_, itemIndex) => ({ index: itemIndex, length: width, offset: width * itemIndex })}
          horizontal
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={onScrollEnd}
          pagingEnabled
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={[styles.visualHalo, compact && styles.visualHaloCompact]}>
                {item.id === "welcome" ? (
                  <View style={styles.schoolIcon}>
                    <MaterialIcons color={premiumColors.white} name="school" size={compact ? 50 : 60} />
                  </View>
                ) : (
                  <Image
                    accessibilityLabel={item.id === "journey" ? "Caméléon EKALAN" : "Sacko"}
                    contentFit="contain"
                    source={item.id === "journey" ? require("../assets/images/cameleon-official.webp") : require("../assets/images/sacko-official.webp")}
                    style={[styles.character, compact && styles.characterCompact]}
                  />
                )}
              </View>
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
              <Text style={[styles.title, compact && styles.titleCompact]}>{item.title}</Text>
              <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>{item.subtitle}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
        />

        <View style={styles.footer}>
          <View accessibilityLabel={`Page ${index + 1} sur ${slides.length}`} style={styles.dots}>
            {slides.map((slide, slideIndex) => (
              <View key={slide.id} style={[styles.dot, slideIndex === index && styles.dotActive]} />
            ))}
          </View>
          <PremiumButton
            accessibilityLabel={isLast ? "Commencer avec EKALAN" : `Afficher la page ${index + 2}`}
            label={isLast ? "Commencer" : "Suivant"}
            onPress={next}
            variant={isLast ? "success" : "light"}
          />
          <Pressable accessibilityLabel="Se connecter" accessibilityRole="button" hitSlop={10} onPress={() => void finish("/login")}>
            <Text style={styles.login}>Déjà inscrit ? <Text style={styles.loginLink}>Connexion</Text></Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </PremiumBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  logoCard: {
    width: 92,
    height: 78,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 4,
    zIndex: 2,
    borderRadius: 18,
    backgroundColor: premiumColors.white,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.82)",
    shadowColor: "#001035",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
  logoCardCompact: { width: 76, height: 64, borderRadius: 15 },
  logo: { width: 116, height: 116 },
  logoCompact: { width: 96, height: 96 },
  carousel: { flex: 1 },
  slide: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingBottom: 8 },
  visualHalo: {
    width: 184,
    height: 184,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 92,
    borderWidth: 1,
    borderColor: premiumColors.borderOnDark,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginBottom: 20,
  },
  visualHaloCompact: { width: 142, height: 142, borderRadius: 71, marginBottom: 12 },
  schoolIcon: {
    width: 122,
    height: 122,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 61,
    backgroundColor: premiumColors.green600,
    borderWidth: 12,
    borderColor: "rgba(40,218,98,0.18)",
  },
  character: { width: 178, height: 178 },
  characterCompact: { width: 137, height: 137 },
  eyebrow: { color: premiumColors.green500, fontSize: 13, fontWeight: "900", letterSpacing: 1.1, textAlign: "center" },
  title: { color: premiumColors.white, fontSize: 36, lineHeight: 42, fontWeight: "900", textAlign: "center", marginTop: 10 },
  titleCompact: { fontSize: 29, lineHeight: 34 },
  subtitle: { maxWidth: 390, color: premiumColors.textOnDark, fontSize: 17, lineHeight: 25, fontWeight: "600", textAlign: "center", marginTop: 15 },
  subtitleCompact: { fontSize: 14, lineHeight: 20, marginTop: 10 },
  footer: { paddingHorizontal: 20, paddingBottom: 4 },
  dots: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 17 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(255,255,255,0.28)" },
  dotActive: { width: 24, backgroundColor: premiumColors.green500 },
  login: { color: premiumColors.textMutedOnDark, fontSize: 15, textAlign: "center", marginTop: 15, paddingBottom: 3 },
  loginLink: { color: premiumColors.green500, fontWeight: "900", textDecorationLine: "underline" },
});
