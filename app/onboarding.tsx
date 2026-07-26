import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ComponentProps, useRef, useState } from "react";
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
import { BrandLogo } from "../components/brand-logo";
import { markOnboardingAsSeen } from "../src/storage/onboardingStorage";
import { colors } from "../src/theme/colors";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type OnboardingSlide = {
  asset?: "sacko" | "quiz";
  eyebrow: string;
  icon: IconName;
  title: string;
  subtitle: string;
  accent: string;
};

const slides: OnboardingSlide[] = [
  {
    eyebrow: "BIENVENUE",
    icon: "school",
    title: "Apprends mieux\navec EKALAN",
    subtitle:
      "Retrouve tes cours, avance étape par étape et suis tes progrès depuis ton mobile.",
    accent: colors.secondary,
  },
  {
    asset: "sacko",
    eyebrow: "TON ASSISTANT PÉDAGOGIQUE",
    icon: "auto-awesome",
    title: "Découvre\nSacko",
    subtitle:
      "Sacko est l’IA pédagogique d’EKALAN, pensée pour t’accompagner dans ton apprentissage.",
    accent: colors.accent,
  },
  {
    eyebrow: "APPRENDRE EN DIALOGUANT",
    icon: "forum",
    title: "Pose tes questions,\navance sereinement",
    subtitle:
      "Sacko t’aidera à mieux comprendre les notions et à trouver des explications adaptées.",
    accent: "#2563EB",
  },
  {
    asset: "quiz",
    eyebrow: "À TON RYTHME",
    icon: "trending-up",
    title: "Cours, exercices\net progression",
    subtitle:
      "Tout ton parcours EKALAN réuni dans une expérience simple, claire et personnalisée. Conformément au programme malien.",
    accent: colors.secondary,
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const { height, width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const isLastSlide = index === slides.length - 1;
  const isCompactHeight = height < 720;

  const completeOnboarding = async () => {
    await markOnboardingAsSeen();
    router.push("/role-selection");
  };

  const goToLogin = async () => {
    await markOnboardingAsSeen();
    router.push("/login");
  };

  const goNext = () => {
    if (isLastSlide) {
      void completeOnboarding();
      return;
    }

    listRef.current?.scrollToIndex({
      animated: true,
      index: index + 1,
    });
    setIndex((currentIndex) => currentIndex + 1);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentIndex = Math.round(
      event.nativeEvent.contentOffset.x / width,
    );
    setIndex(currentIndex);
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.brand}>
        <BrandLogo size={isCompactHeight ? 64 : 76} />
      </View>

      <FlatList
        ref={listRef}
        accessibilityLabel={`Présentation EKALAN, page ${index + 1} sur ${slides.length}`}
        bounces={false}
        data={slides}
        decelerationRate="fast"
        getItemLayout={(_, itemIndex) => ({
          index: itemIndex,
          length: width,
          offset: width * itemIndex,
        })}
        horizontal
        keyExtractor={(item) => item.eyebrow}
        onMomentumScrollEnd={onScrollEnd}
        pagingEnabled
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View
              style={[
                styles.slideContent,
                isCompactHeight && styles.slideContentCompact,
              ]}
            >
              <View
                style={[
                  styles.iconHalo,
                  { backgroundColor: `${item.accent}22` },
                ]}
              >
                {item.asset ? (
                  <View style={styles.assetCircle}>
                    <Image
                      accessibilityLabel={
                        item.asset === "sacko"
                          ? "Mascotte Sacko"
                          : "Illustration Quiz EKALAN"
                      }
                      contentFit="contain"
                      source={
                        item.asset === "sacko"
                          ? require("../assets/images/sacko-logo-mobile.svg")
                          : require("../assets/images/logo-quiz.svg")
                      }
                      style={[
                        styles.assetIcon,
                        isCompactHeight && styles.assetIconCompact,
                      ]}
                    />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: item.accent },
                    ]}
                  >
                    <MaterialIcons
                      color={colors.surface}
                      name={item.icon}
                      size={isCompactHeight ? 42 : 50}
                    />
                  </View>
                )}
              </View>

              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
              <Text
                style={[
                  styles.title,
                  isCompactHeight && styles.titleCompact,
                ]}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  isCompactHeight && styles.subtitleCompact,
                ]}
              >
                {item.subtitle}
              </Text>
            </View>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View
          accessibilityLabel={`Page ${index + 1} sur ${slides.length}`}
          accessibilityRole="text"
          style={styles.dots}
        >
          {slides.map((slide, slideIndex) => (
            <View
              key={slide.eyebrow}
              style={[
                styles.dot,
                slideIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Pressable
          accessibilityLabel={
            isLastSlide
              ? "Commencer avec EKALAN"
              : `Afficher la page ${index + 2}`
          }
          accessibilityRole="button"
          onPress={goNext}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>
            {isLastSlide ? "Commencer" : "Suivant"}
          </Text>
          <MaterialIcons
            color={colors.primary}
            name={isLastSlide ? "rocket-launch" : "arrow-forward"}
            size={24}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Se connecter"
          accessibilityRole="button"
          hitSlop={10}
          onPress={goToLogin}
        >
          <Text style={styles.loginLink}>
            Déjà inscrit ? <Text style={styles.loginStrong}>Connexion</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    overflow: "hidden",
  },
  glowTop: {
    position: "absolute",
    top: -120,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(22,163,74,0.20)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -130,
    left: -110,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: "rgba(249,115,22,0.16)",
  },
  brand: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slideContent: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 90,
    paddingBottom: 190,
  },
  slideContentCompact: {
    paddingTop: 72,
    paddingBottom: 170,
  },
  iconHalo: {
    width: 132,
    height: 132,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 66,
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  assetCircle: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderRadius: 56,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  assetIcon: {
    width: 100,
    height: 100,
  },
  assetIconCompact: {
    width: 88,
    height: 88,
  },
  eyebrow: {
    color: "#BFDBFE",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginBottom: 12,
    textAlign: "center",
  },
  title: {
    width: "100%",
    color: colors.surface,
    fontSize: 35,
    fontWeight: "900",
    lineHeight: 43,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 30,
    lineHeight: 37,
  },
  subtitle: {
    width: "100%",
    maxWidth: 430,
    color: colors.surface,
    fontSize: 17,
    lineHeight: 26,
    marginTop: 18,
    opacity: 0.92,
    textAlign: "center",
  },
  subtitleCompact: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 9,
    marginBottom: 22,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    width: 28,
    backgroundColor: colors.surface,
  },
  button: {
    width: "100%",
    maxWidth: 380,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingHorizontal: 24,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: "900",
  },
  loginLink: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 16,
    marginTop: 18,
    textAlign: "center",
  },
  loginStrong: {
    color: colors.surface,
    fontWeight: "900",
    textDecorationLine: "underline",
  },
});
