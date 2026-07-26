import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DataState } from "../../components/data-state";
import { getErrorMessage } from "../../src/api/errorMessage";
import {
  getStudentQuizCatalog,
  StudentQuizCatalogItem,
} from "../../src/services/learningService";
import { colors } from "../../src/theme/colors";

function openQuiz(quiz: StudentQuizCatalogItem) {
  router.push({
    pathname: "/quiz",
    params: {
      subject: quiz.subjectKey,
      chapter: quiz.chapterId,
      quiz: quiz.id,
      quizIndex: String(quiz.quizIndex),
      lessonIndex:
        quiz.lessonIndex === undefined ? "" : String(quiz.lessonIndex),
      lesson: quiz.lessonId ?? "",
    },
  });
}

function chooseNextQuiz(quizzes: StudentQuizCatalogItem[]) {
  return (
    quizzes.find((quiz) => quiz.isRecommended && quiz.lessonIndex !== undefined) ??
    [...quizzes].reverse().find((quiz) => quiz.lessonIndex !== undefined) ??
    quizzes[0]
  );
}

export default function MyQuiz() {
  const [quiz, setQuiz] = useState<StudentQuizCatalogItem | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void reloadKey;
      let active = true;
      setLoading(true);
      setError(null);

      getStudentQuizCatalog()
        .then((catalog) => active && setQuiz(chooseNextQuiz(catalog)))
        .catch((loadError: unknown) =>
          active &&
          setError(getErrorMessage(loadError, "Impossible de préparer ton quiz.")),
        )
        .finally(() => active && setLoading(false));

      return () => {
        active = false;
      };
    }, [reloadKey]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Préparation du quiz du jour...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <DataState
          message={error}
          onRetry={() => setReloadKey((value) => value + 1)}
          title="Chargement impossible"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.streakBadge}>
        <MaterialIcons color="#F43F5E" name="local-fire-department" size={31} />
        <Text style={styles.streakValue}>0</Text>
      </View>

      <View style={styles.quizCard}>
        <View style={styles.circleTop} />
        <View style={styles.circleLeft} />
        <View style={styles.circleBottom} />
        <View style={styles.innerBorder} />

        <View style={styles.quizMark}>
          <MaterialIcons color="#FFFFFF" name="quiz" size={68} />
        </View>

        <Text style={styles.title}>Quiz du jour</Text>
        <Text style={styles.description}>
          Fais ton quiz tous les jours pour maintenir ta série de flammes !
        </Text>

        {quiz ? (
          <Text numberOfLines={2} style={styles.context}>
            {quiz.subjectName} · {quiz.lessonTitle || quiz.chapterTitle}
          </Text>
        ) : null}

        <View style={styles.buttonArea}>
          {quiz ? (
            <Pressable
              accessibilityLabel="Lancer le quiz du jour"
              accessibilityRole="button"
              onPress={() => openQuiz(quiz)}
              style={({ pressed }) => [
                styles.launchButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.launchText}>Lancer la partie</Text>
            </Pressable>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Quiz bientôt disponible</Text>
              <Text style={styles.emptyText}>
                Aucun quiz n’est encore publié pour ta classe.
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 22,
  },
  loadingText: { color: colors.muted, fontWeight: "800", marginTop: 12 },
  streakBadge: {
    alignSelf: "flex-end",
    minWidth: 92,
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 14,
    marginRight: 3,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  streakValue: { color: colors.textStrong, fontSize: 25, fontWeight: "900" },
  quizCard: {
    flex: 1,
    minHeight: 510,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#8B1BC2",
    borderRadius: 34,
    paddingHorizontal: 30,
    paddingBottom: 28,
    paddingTop: 48,
  },
  innerBorder: {
    position: "absolute",
    top: 12,
    right: 12,
    bottom: 12,
    left: 12,
    borderColor: colors.surface,
    borderRadius: 27,
    borderWidth: 4,
  },
  circleTop: {
    position: "absolute",
    top: -50,
    left: 125,
    width: 190,
    height: 190,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 95,
  },
  circleLeft: {
    position: "absolute",
    top: 170,
    left: -35,
    width: 190,
    height: 190,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 95,
  },
  circleBottom: {
    position: "absolute",
    right: -55,
    bottom: -45,
    width: 230,
    height: 230,
    backgroundColor: "rgba(75,0,130,0.24)",
    borderRadius: 115,
  },
  quizMark: {
    width: 128,
    height: 128,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F43F5E",
    borderColor: "#6B118F",
    borderRadius: 64,
    borderWidth: 10,
    marginTop: 20,
  },
  title: {
    color: colors.surface,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 28,
    textAlign: "center",
  },
  description: {
    maxWidth: 310,
    color: colors.surface,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 27,
    marginTop: 20,
    textAlign: "center",
  },
  context: {
    color: "#F3D7FF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
    marginTop: 16,
    textAlign: "center",
  },
  buttonArea: {
    width: "100%",
    marginTop: "auto",
    paddingTop: 24,
  },
  launchButton: {
    minHeight: 66,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 28,
    shadowColor: "#E5CDB7",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  launchText: { color: "#4B5563", fontSize: 20, fontWeight: "900" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  empty: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    padding: 17,
  },
  emptyTitle: { color: colors.textStrong, fontSize: 16, fontWeight: "900" },
  emptyText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
    textAlign: "center",
  },
});
