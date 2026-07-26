import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SackoTab } from "../src/services/sackoContextService";
import { colors } from "../src/theme/colors";

type SackoContextButtonProps = {
  subject: string;
  chapter: string;
  lesson: string;
  level?: string;
  tab?: SackoTab;
  sceneIndex?: number;
  questionId?: string;
  attempted?: boolean;
  result?: string;
  compact?: boolean;
};

export function SackoContextButton({
  subject,
  chapter,
  lesson,
  level,
  tab = "cours",
  sceneIndex = 0,
  questionId,
  attempted = false,
  result,
  compact = false,
}: SackoContextButtonProps) {
  const available = Boolean(subject?.trim() && chapter?.trim() && lesson?.trim());

  return (
    <Pressable
      accessibilityHint="Transmet à Sacko le contexte pédagogique affiché"
      accessibilityLabel="Demander de l’aide à Sacko"
      accessibilityRole="button"
      disabled={!available}
      onPress={() =>
        router.push({
          pathname: "/sacko-chat",
          params: {
            subject,
            chapter,
            lesson,
            level: level ?? "",
            tab,
            sceneIndex: String(sceneIndex),
            questionId: questionId ?? "",
            attempted: attempted ? "1" : "0",
            result: result ?? "",
          },
        })
      }
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        !available && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, compact && styles.compactIcon]}>
        <MaterialIcons
          color={colors.secondary}
          name="auto-awesome"
          size={compact ? 19 : 23}
        />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, compact && styles.compactTitle]}>
          Besoin d’aide ?
        </Text>
        {!compact ? (
          <Text style={styles.subtitle}>
            Demande à Sacko pour ce contenu
          </Text>
        ) : null}
      </View>
      <MaterialIcons color={colors.primary} name="arrow-forward" size={21} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#F0F8F3",
    borderColor: "#BBE4C8",
    borderRadius: 22,
    borderWidth: 1,
    marginVertical: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  compact: {
    minHeight: 54,
    borderRadius: 18,
    marginVertical: 10,
    paddingVertical: 8,
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DDF3E4",
    borderRadius: 15,
  },
  compactIcon: { width: 36, height: 36, borderRadius: 12 },
  copy: { flex: 1 },
  title: { color: colors.primaryDark, fontSize: 16, fontWeight: "900" },
  compactTitle: { fontSize: 14 },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});
