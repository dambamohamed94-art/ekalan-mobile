import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const AnimatedImage = Animated.createAnimatedComponent(Image);

export function AnimatedSackoLogo({
  compact = false,
}: {
  compact?: boolean;
}) {
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animations = [
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(twinkle, {
            duration: 900,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(twinkle, {
            duration: 900,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    ];

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [float, pulse, twinkle]);

  const size = compact ? 54 : 164;

  return (
    <View style={[styles.stage, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.35, 0.85],
            }),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1.08],
                }),
              },
            ],
          },
        ]}
      />
      {!compact ? (
        <>
          <Animated.Text
            style={[
              styles.star,
              styles.starLeft,
              {
                opacity: twinkle,
                transform: [{ scale: twinkle }],
              },
            ]}
          >
            ★
          </Animated.Text>
          <Animated.Text
            style={[
              styles.star,
              styles.starRight,
              {
                opacity: twinkle.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.25],
                }),
              },
            ]}
          >
            ★
          </Animated.Text>
        </>
      ) : null}
      <AnimatedImage
        contentFit="contain"
        source={require("../assets/images/sacko-logo-mobile.svg")}
        style={[
          styles.logo,
          {
            transform: [
              {
                translateY: float.interpolate({
                  inputRange: [0, 1],
                  outputRange: [3, compact ? -3 : -10],
                }),
              },
              {
                rotate: float.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "-1.2deg"],
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: "center", justifyContent: "center" },
  glow: {
    position: "absolute",
    width: "92%",
    height: "92%",
    backgroundColor: "rgba(232,163,23,0.28)",
    borderRadius: 999,
  },
  logo: { width: "92%", height: "92%" },
  star: {
    position: "absolute",
    zIndex: 2,
    color: "#F2A900",
    fontSize: 22,
    fontWeight: "900",
  },
  starLeft: { left: 2, top: 30 },
  starRight: { right: 1, top: 68 },
});
