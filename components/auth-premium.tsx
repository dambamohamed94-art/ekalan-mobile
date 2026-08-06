import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { premiumColors, premiumRadii, premiumShadow } from "../src/theme/premium";
import { BrandLogo } from "./brand-logo";

type Accent = "green" | "blue" | "orange" | "violet";

const accents: Record<Accent, string> = {
  green: premiumColors.green600,
  blue: premiumColors.blue600,
  orange: premiumColors.orange500,
  violet: premiumColors.violet500,
};

export function AuthPage({
  children,
  landscape = true,
  bottomPadding = 48,
}: PropsWithChildren<{ landscape?: boolean; bottomPadding?: number }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {landscape ? (
        <Image
          source={require("../assets/images/auth-landscape.webp")}
          contentFit="cover"
          style={styles.landscape}
          pointerEvents="none"
        />
      ) : null}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[styles.pageContent, { paddingBottom: bottomPadding }]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthHeader({ onBack, compact = false }: { onBack?: () => void; compact?: boolean }) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      {onBack ? (
        <Pressable
          accessibilityLabel="Retour"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={styles.backButton}
        >
          <MaterialIcons color={premiumColors.blue900} name="arrow-back" size={27} />
        </Pressable>
      ) : null}
      <View style={styles.logoPlate}>
        <BrandLogo style={styles.logo} />
      </View>
    </View>
  );
}

export function AuthIntro({
  icon,
  title,
  subtitle,
  accent = "blue",
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  accent?: Accent;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 360, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, damping: 14, stiffness: 130, useNativeDriver: true }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={[styles.intro, { opacity, transform: [{ translateY }] }]}>
      <View style={[styles.introIcon, { backgroundColor: `${accents[accent]}18` }]}>{icon}</View>
      <Text style={styles.introTitle}>{title}</Text>
      <Text style={styles.introSubtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

export function AuthProgress({ step, total, accent = "blue" }: { step: number; total: number; accent?: Accent }) {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressTrack}>
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[
              styles.progressSegment,
              index < step && { backgroundColor: accents[accent] },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.progressText, { color: accents[accent] }]}>Étape {step}/{total}</Text>
    </View>
  );
}

export function AuthStepHeader({
  onBack,
  step,
  total,
  accent = "blue",
}: {
  onBack: () => void;
  step: number;
  total: number;
  accent?: Accent;
}) {
  return (
    <View style={styles.stepHeader}>
      <Pressable
        accessibilityLabel="Retour"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onBack}
        style={styles.stepBackButton}
      >
        <MaterialIcons color={premiumColors.blue950} name="arrow-back" size={25} />
      </Pressable>
      <View style={styles.stepProgress}>
        <AuthProgress accent={accent} step={step} total={total} />
      </View>
    </View>
  );
}

export function AuthCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}

export function AuthField({
  label,
  icon = "person-outline",
  ...inputProps
}: TextInputProps & { label: string; icon?: keyof typeof MaterialIcons.glyphMap }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputShell}>
        <MaterialIcons color="#64748B" name={icon} size={20} />
        <TextInput
          placeholderTextColor="#94A3B8"
          style={styles.input}
          {...inputProps}
        />
      </View>
    </View>
  );
}

export function AuthFieldLabel({
  children,
  icon,
  accent = "blue",
}: PropsWithChildren<{
  icon: keyof typeof MaterialIcons.glyphMap;
  accent?: Accent;
}>) {
  return (
    <View style={styles.fieldLabelRow}>
      <View style={[styles.fieldLabelIcon, { backgroundColor: `${accents[accent]}16` }]}>
        <MaterialIcons color={accents[accent]} name={icon} size={17} />
      </View>
      <Text style={styles.label}>{children}</Text>
    </View>
  );
}

export function AuthButton({
  children,
  onPress,
  disabled,
  accent = "blue",
}: PropsWithChildren<{ onPress: () => void; disabled?: boolean; accent?: Accent }>) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: accents[accent] },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.primaryButtonText}>{children}</Text>
      <View style={styles.buttonArrow}>
        <MaterialIcons color={accents[accent]} name="arrow-forward" size={21} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  landscape: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 250,
    opacity: 0.85,
  },
  pageContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    paddingHorizontal: 20,
  },
  header: { height: 94, alignItems: "center", justifyContent: "center" },
  headerCompact: { height: 72 },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 2,
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: premiumColors.white,
    ...premiumShadow,
  },
  logoPlate: {
    width: 72,
    height: 72,
    borderRadius: 20,
    padding: 8,
    backgroundColor: premiumColors.white,
    ...premiumShadow,
  },
  logo: { width: "100%", height: "100%" },
  intro: { alignItems: "center", paddingHorizontal: 12, marginBottom: 18 },
  introIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  introTitle: {
    color: premiumColors.blue950,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    textAlign: "center",
  },
  introSubtitle: {
    color: "#475569",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 420,
  },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  progressTrack: { flex: 1, flexDirection: "row", gap: 5 },
  progressSegment: { flex: 1, height: 6, borderRadius: 8, backgroundColor: "#E2E8F0" },
  progressText: { fontSize: 12, fontWeight: "900" },
  stepHeader: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 14, paddingTop: 8 },
  stepBackButton: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: premiumColors.white, ...premiumShadow },
  stepProgress: { flex: 1, paddingTop: 14 },
  card: {
    padding: 20,
    borderRadius: premiumRadii.lg,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...premiumShadow,
  },
  fieldGroup: { marginBottom: 14 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  fieldLabelIcon: { width: 29, height: 29, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  label: { color: premiumColors.blue950, fontSize: 14, fontWeight: "800", marginBottom: 7 },
  inputShell: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: premiumRadii.md,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: premiumColors.blue950, fontSize: 16, paddingVertical: 14 },
  primaryButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginTop: 6,
    ...premiumShadow,
  },
  primaryButtonText: { color: premiumColors.white, fontSize: 18, fontWeight: "900" },
  buttonArrow: {
    position: "absolute",
    right: 9,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: premiumColors.white,
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  disabled: { opacity: 0.6 },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: premiumRadii.md,
    backgroundColor: "#F8FAFC",
    marginBottom: 16,
    overflow: "hidden",
  },
  secondaryButton: { alignItems: "center", paddingVertical: 16 },
  secondaryText: { color: premiumColors.blue800, fontWeight: "900" },
  multiline: { minHeight: 110, textAlignVertical: "top" },
});
