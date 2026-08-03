import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BrandLogo } from "../components/brand-logo";
import { DataState } from "../components/data-state";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { getStudentChapter } from "../src/services/learningService";
import { colors } from "../src/theme/colors";

export default function ExercisePage() {
  const { subject, chapter, exercise } = useLocalSearchParams<{
    subject: string;
    chapter: string;
    exercise: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [exoInfo, setExoInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadExercise = async () => {
      setLoading(true);
      setError(null);

      try {
        const chapterData = await getStudentChapter(subject, chapter);
        const exercises = chapterData.exercices ?? chapterData.exos ?? [];
        const foundExo = exercises.find(
          (e: any) => String(e.id) === exercise,
        );

        setExoInfo(foundExo);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Impossible de charger cet exercice."));
      } finally {
        setLoading(false);
      }
    };

    loadExercise();
  }, [subject, chapter, exercise, reloadKey]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de l’exercice...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <DataState
          title="Chargement impossible"
          message={error}
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      </View>
    );
  }

  if (!exoInfo) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Exercice introuvable ✍️</Text>
        <Pressable
          accessibilityLabel="Retour au chapitre"
          accessibilityRole="button"
          style={styles.button}
          onPress={() =>
            goBackOrReplace({
              pathname: "/chapter",
              params: { subject, chapter },
            })
          }
        >
          <Text style={styles.buttonText}>Retour au chapitre</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour au chapitre"
          accessibilityRole="button"
          onPress={() =>
            goBackOrReplace({
              pathname: "/chapter",
              params: { subject, chapter },
            })
          }
          style={styles.backButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <BrandLogo style={styles.logo} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.emoji}>✍️</Text>
        <Text style={styles.title}>{exoInfo.title}</Text>
        <Text style={styles.subtitle}>
          {exoInfo.summary || "Exercice pratique pour t’entraîner."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Objectif</Text>
        <Text style={styles.cardText}>
          Réalise cet exercice pour consolider tes acquis. Les exercices
          interactifs IA seront branchés ici.
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Commencer l’exercice"
        accessibilityRole="button"
        style={styles.button}
        disabled
      >
        <Text style={styles.buttonText}>Commencer l’exercice 🚀</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F1EC" },
  content: { padding: 22, paddingBottom: 120 },
  center: {
    flex: 1,
    backgroundColor: "#F7F1EC",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "800",
  },
  header: {
    marginTop: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  back: {
    fontSize: 50,
    color: "#4B5563",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
  },
  logo: {
    width: 58,
    height: 58,
  },
  hero: {
    marginTop: 30,
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
  },
  emoji: { fontSize: 56 },
  title: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    color: "#DDEBFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 23,
  },
  card: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
  },
  cardTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#0F172A",
  },
  cardText: {
    marginTop: 10,
    color: "#64748B",
    fontWeight: "700",
    lineHeight: 23,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 17,
  },
});
