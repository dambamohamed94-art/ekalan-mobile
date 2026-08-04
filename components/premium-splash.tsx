import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text } from "react-native";
import { PremiumBackground } from "./premium-background";
import { premiumColors } from "../src/theme/premium";

export function PremiumSplash() {
  const entrance = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [entrance, float]);

  return (
    <PremiumBackground>
      <Animated.View
        style={[
          styles.content,
          { opacity: entrance, transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] },
        ]}
      >
        <Animated.View
          style={[
            styles.logoCard,
            { transform: [{ scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }] },
          ]}
        >
          <Image contentFit="contain" source={require("../assets/images/ekalan-logo-official.svg")} style={styles.logo} />
        </Animated.View>
        <Text style={styles.tagline}>Apprendre <Text style={styles.dot}>•</Text> Comprendre <Text style={styles.dot}>•</Text> Réussir</Text>
        <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [4, -8] }) }] }}>
          <Image contentFit="contain" source={require("../assets/images/cameleon-official.webp")} style={styles.mascot} />
        </Animated.View>
        <Text style={styles.promise}>Ton parcours. Ton rythme. <Text style={styles.success}>Ton succès.</Text></Text>
      </Animated.View>
    </PremiumBackground>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingVertical: 38 },
  logoCard: {
    width: 248,
    height: 176,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: premiumColors.white,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    shadowColor: "#00102F",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: { width: 270, height: 270 },
  tagline: { color: premiumColors.white, fontSize: 16, fontWeight: "800", textAlign: "center", marginTop: 18 },
  dot: { color: premiumColors.green500 },
  mascot: { width: 290, height: 330, marginTop: 24 },
  promise: { color: premiumColors.white, fontSize: 18, fontWeight: "800", textAlign: "center", marginTop: 18 },
  success: { color: premiumColors.green500 },
});
