import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DataState } from "../components/data-state";
import { ErrorMessage } from "../components/error-message";
import { SackoContextButton } from "../components/sacko-context-button";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import {
  getStudentLessonContext,
  markLessonAsDone,
} from "../src/services/learningService";
import { colors } from "../src/theme/colors";

type IconName = ComponentProps<typeof MaterialIcons>["name"];
type SceneType = "course" | "video" | "revision" | "quiz" | "exercise" | "challenge";
type Scene = {
  type: SceneType;
  title: string;
  subtitle: string;
  icon: IconName;
  color: string;
  index?: number;
};

function buildScenes(): Scene[] {
  return [
    {
      type: "course",
      title: "Cours",
      subtitle: "Comprendre la leçon",
      icon: "menu-book",
      color: colors.primary,
    },
    {
      type: "video",
      title: "Vidéo",
      subtitle: "Voir l’explication",
      icon: "play-circle",
      color: "#0284C7",
    },
    {
      type: "revision",
      title: "Révision",
      subtitle: "Retenir l’essentiel",
      icon: "fact-check",
      color: "#0F766E",
    },
    {
      type: "quiz",
      title: "Quiz",
      subtitle: "Tester ses connaissances",
      icon: "quiz",
      color: "#EA580C",
    },
    {
      type: "exercise",
      title: "Exercice",
      subtitle: "S’entraîner",
      icon: "edit-note",
      color: "#16A34A",
    },
  ];
}

export default function LessonPage() {
  const { subject, chapter, index = "0", lesson: lessonId } = useLocalSearchParams<{
    subject: string;
    chapter: string;
    index: string;
    lesson?: string;
  }>();
  const [context, setContext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);
  const lesson = context?.lesson;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    getStudentLessonContext(subject, chapter, index, lessonId)
      .then((data) => active && setContext(data))
      .catch((error: unknown) =>
        active &&
        setLoadError(getErrorMessage(error, "Impossible de charger cette leçon.")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [chapter, index, lessonId, reloadKey, subject]);

  const scenes = useMemo(() => buildScenes(), []);

  const openScene = (scene: Scene) => {
    const currentLessonIndex = String(lesson?.index ?? index ?? "0");
    const currentLessonId = String(lesson?.id ?? lessonId ?? "");

    if (scene.type === "quiz") {
      router.push({
        pathname: "/quiz",
        params: {
          subject,
          chapter,
          lessonIndex: currentLessonIndex,
          lesson: currentLessonId,
        },
      });
      return;
    }
    if (scene.type === "exercise") {
      router.push({
        pathname: "/quiz",
        params: {
          subject,
          chapter,
          lessonIndex: currentLessonIndex,
          lesson: currentLessonId,
          mode: "exercise",
        },
      });
      return;
    }

    router.push({
      pathname: "/scene",
      params: {
        subject,
        chapter,
        lessonIndex: currentLessonIndex,
        lesson: currentLessonId,
        scene: scene.type,
        itemIndex: String(scene.index ?? 0),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Chargement de la leçon...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.center}>
        <DataState
          message={loadError}
          onRetry={() => setReloadKey((value) => value + 1)}
          title="Chargement impossible"
        />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.container}>
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
        <MaterialIcons color={colors.primary} name="arrow-back" size={25} />
        <Text style={styles.backText}>Chapitre</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>
          LEÇON {(Number(lesson?.index) || 0) + 1} SUR {lesson?.total || 1}
        </Text>
        <Text style={styles.title}>{lesson?.title || "Leçon"}</Text>
        {lesson?.summary ? <Text style={styles.summary}>{lesson.summary}</Text> : null}
      </View>

      <SackoContextButton
        chapter={chapter}
        lesson={String(lesson?.id ?? lessonId ?? "")}
        level={context?.student?.class_code}
        subject={subject}
      />

      <View style={styles.headingRow}>
        <View>
          <Text style={styles.sectionEyebrow}>PARCOURS</Text>
          <Text style={styles.sectionTitle}>Scènes pédagogiques</Text>
        </View>
        <Text style={styles.sceneCount}>{scenes.length}</Text>
      </View>

      {scenes.length === 0 ? (
        <DataState
          message="Les contenus de cette leçon seront affichés dès leur publication."
          title="Aucune scène disponible"
        />
      ) : (
        <View style={styles.sceneGrid}>
        {scenes.map((scene) => (
          <Pressable
            accessibilityLabel={`Ouvrir ${scene.title}`}
            accessibilityHint={
              scene.type === "quiz"
                ? "Ouvre le quiz associé à cette leçon"
                : `Ouvre le contenu ${scene.title}`
            }
            accessibilityRole="button"
            key={`${scene.type}-${scene.index ?? 0}`}
            onPress={() => openScene(scene)}
            style={({ pressed }) => [
              styles.sceneCard,
              pressed && styles.sceneCardPressed,
            ]}
          >
            <View style={[styles.sceneIcon, { backgroundColor: `${scene.color}18` }]}>
              <MaterialIcons color={scene.color} name={scene.icon} size={32} />
            </View>
            <View style={styles.sceneCopy}>
              <Text style={styles.sceneTitle}>{scene.title}</Text>
              <Text style={styles.sceneSubtitle}>{scene.subtitle}</Text>
            </View>
            <View style={styles.status}>
              <Text style={styles.statusText}>À faire</Text>
            </View>
          </Pressable>
        ))}
        </View>
      )}

      <ErrorMessage message={actionError} />
      <Pressable
        accessibilityLabel="Marquer cette leçon comme terminée"
        accessibilityRole="button"
        onPress={async () => {
          setActionError(null);
          try {
            await markLessonAsDone({
              subject,
              chapter,
              lesson_id: lesson?.id,
            });
            setShowCompleted(true);
            setTimeout(() => {
              setShowCompleted(false);
              goBackOrReplace("/(tabs)/subjects");
            }, 1000);
          } catch (error: unknown) {
            setActionError(
              getErrorMessage(error, "Impossible d’enregistrer votre progression."),
            );
          }
        }}
        style={styles.completeButton}
      >
        <MaterialIcons color={colors.surface} name="check-circle" size={22} />
        <Text style={styles.completeText}>J’ai terminé cette leçon</Text>
      </Pressable>

      <Modal animationType="fade" transparent visible={showCompleted}>
        <View style={styles.modalBackdrop}>
          <View style={styles.completedPopup}>
            <Image
              contentFit="contain"
              source={require("../assets/images/logo-quiz.svg")}
              style={styles.completedImage}
            />
            <Text style={styles.completedTitle}>Leçon validée !</Text>
            <Text style={styles.completedText}>
              Bravo, ta progression est enregistrée.
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 110 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 22,
  },
  loadingText: { color: colors.muted, fontWeight: "800", marginTop: 12 },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
    marginBottom: 18,
    paddingVertical: 8,
  },
  backText: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 24,
    overflow: "hidden",
  },
  eyebrow: { color: "#BFDBFE", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.surface, fontSize: 28, fontWeight: "900", marginTop: 8 },
  summary: { color: "#DDEBFF", fontSize: 14, fontWeight: "700", lineHeight: 21, marginTop: 8 },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 2,
  },
  sectionEyebrow: { color: colors.secondary, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  sectionTitle: { color: colors.textStrong, fontSize: 23, fontWeight: "900", marginTop: 3 },
  sceneCount: {
    color: colors.primary,
    backgroundColor: "#EAF1FF",
    borderRadius: 14,
    fontSize: 16,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  sceneCard: {
    width: "47.8%",
    minHeight: 188,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: "#E6EAF0",
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    elevation: 3,
  },
  sceneGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    marginTop: 14,
  },
  sceneCardPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  sceneIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  sceneCopy: { alignItems: "center", marginTop: 13 },
  sceneTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  sceneSubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  status: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: { color: colors.primary, fontSize: 10, fontWeight: "900" },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: colors.primary,
    borderRadius: 22,
    marginTop: 26,
    paddingVertical: 17,
  },
  completeText: { color: colors.surface, fontSize: 16, fontWeight: "900" },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.55)",
    padding: 28,
  },
  completedPopup: {
    width: "100%",
    maxWidth: 330,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 30,
    padding: 24,
  },
  completedImage: { width: 106, height: 106 },
  completedTitle: {
    color: colors.textStrong,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 12,
  },
  completedText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 7,
    textAlign: "center",
  },
});
