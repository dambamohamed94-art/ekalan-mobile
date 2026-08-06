import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ComponentProps, useCallback, useMemo, useState } from "react";
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
import { BrandLogo } from "../components/brand-logo";
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

  useFocusEffect(useCallback(() => {
    // La clé force une nouvelle requête depuis l'action « Réessayer ».
    void reloadKey;
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
  }, [chapter, index, lessonId, reloadKey, subject]));

  const scenes = useMemo(() => buildScenes(), []);

  const openScene = (scene: Scene) => {
    // L'index de route est zéro-based. `lesson.index` peut être un numéro
    // d'affichage un-based et ne doit pas être envoyé aux scènes.
    const currentLessonIndex = String(index ?? "0");
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
      </Pressable>
      <BrandLogo style={styles.topLogo} />

      <View style={styles.hero}>
        <View pointerEvents="none" style={styles.heroGlow} />
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>LEÇON {(Number(lesson?.index) || 0) + 1} SUR {lesson?.total || 1}</Text>
          <Text style={styles.title}>{lesson?.title || "Leçon"}</Text>
        </View>
        <Image
          contentFit="contain"
          pointerEvents="none"
          source={require("../assets/images/dashboard-student-character.svg")}
          style={styles.mascot}
        />
        <View style={styles.sceneMenu}>
          {scenes.map((scene) => <Pressable key={`menu-${scene.type}`} onPress={() => openScene(scene)} style={styles.sceneMenuItem}><Text style={styles.sceneMenuText}>{scene.title}</Text></Pressable>)}
        </View>
      </View>

      <View style={styles.lessonProgressCard}>
        <Text style={styles.lessonProgressTitle}>Ma progression</Text>
        <View style={styles.lessonProgressRow}><View style={styles.lessonTrack}><View style={[styles.lessonFill, { width: `${getLessonProgress(context)}%` }]} /></View><Text style={styles.lessonProgressValue}>{getLessonProgress(context)}%</Text></View>
        <View style={styles.rewardRow}>
          <Reward icon="star" color="#F59E0B" label="XP gagnée" value={getLessonProgress(context) >= 100 ? "+80 XP" : "À gagner"} />
          <Reward icon="track-changes" color="#7C3AED" label="Score Quiz" value={lesson?.quiz_score != null ? `${lesson.quiz_score}/10` : "—"} />
          <Reward icon="task-alt" color="#F97316" label="Exercices" value={String(lesson?.exercise_score ?? lesson?.exercises_completed ?? "—")} />
        </View>
      </View>

      <View style={styles.objectiveCard}><View style={{ flex: 1 }}><Text style={styles.objectiveTitle}>Objectif de la leçon</Text><Text style={styles.objectiveText}>{lesson?.summary || lesson?.objective || "Comprendre et maîtriser les notions essentielles de cette leçon."}</Text></View><MaterialIcons color="#6D28D9" name="track-changes" size={55} /></View>

      <SackoContextButton chapter={chapter} lesson={String(lesson?.id ?? lessonId ?? "")} level={context?.student?.class_code} subject={subject} />

      {scenes.length === 0 ? (
        <DataState
          message="Les contenus de cette leçon seront affichés dès leur publication."
          title="Aucune scène disponible"
        />
      ) : null}

      <ErrorMessage message={actionError} />
      <Pressable
        accessibilityLabel="Marquer cette leçon comme terminée"
        accessibilityRole="button"
        onPress={async () => {
          setActionError(null);
          try {
            const progress = await markLessonAsDone({
              subject,
              chapter,
              lesson_id: lesson?.id,
            });
            setContext((current: any) => current ? ({
              ...current,
              lesson_progress_pct: progress.lesson_progress_pct,
              lesson: {
                ...current.lesson,
                completed: true,
                progress_pct: progress.lesson_progress_pct,
              },
            }) : current);
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

function Reward({ icon, color, label, value }: { icon: IconName; color: string; label: string; value: string }) {
  return <View style={styles.reward}><MaterialIcons color={color} name={icon} size={27} /><Text style={styles.rewardLabel}>{label}</Text><Text style={[styles.rewardValue, { color }]}>{value}</Text></View>;
}

function getLessonProgress(context: any) {
  const lesson = context?.lesson ?? {};
  const raw =
    lesson.progress_pct ??
    lesson.progress_percent ??
    lesson.progress_percentage ??
    lesson.completion_percentage ??
    lesson.progress ??
    context?.lesson_progress_pct ??
    context?.progress_pct ??
    context?.progress_percent ??
    context?.progress?.lesson_progress_pct ??
    context?.progress?.progress_pct ??
    (lesson.completed || lesson.is_completed ? 100 : 0);
  const value = Number(raw);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
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
    position: "absolute",
    left: 20,
    top: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
    marginBottom: 18,
    paddingVertical: 8,
  },
  topLogo: { width: 132, height: 52, alignSelf: "center", marginBottom: 18 },
  backText: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  hero: {
    backgroundColor: "#0B8F3B",
    borderRadius: 30,
    padding: 24,
    minHeight: 275,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  heroGlow: { position: "absolute", right: -70, top: -50, width: 240, height: 240, borderRadius: 120, backgroundColor: "rgba(51,211,153,.16)" },
  heroCopy: { flex: 1, zIndex: 2 },
  mascot: { width: "48%", height: 235, alignSelf: "flex-end", marginRight: -25, marginBottom: -25 },
  eyebrow: { color: "#BFDBFE", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.surface, fontSize: 28, fontWeight: "900", marginTop: 8 },
  summary: { color: "#DDEBFF", fontSize: 14, fontWeight: "700", lineHeight: 21, marginTop: 8 },
  heroProgress: { width: "88%", height: 8, borderRadius: 5, backgroundColor: "rgba(255,255,255,.22)", marginTop: 19, overflow: "hidden" },
  heroProgressFill: { height: "100%", borderRadius: 5, backgroundColor: "#4ADE80" },
  heroProgressText: { color: "#86EFAC", fontSize: 12, fontWeight: "900", marginTop: 7 },
  sceneMenu: { position: "absolute", left: 18, right: 18, bottom: 18, flexDirection: "row", gap: 5, zIndex: 5 },
  sceneMenuItem: { flex: 1, minHeight: 31, alignItems: "center", justifyContent: "center", borderColor: "rgba(255,255,255,.65)", borderRadius: 15, borderWidth: 1, backgroundColor: "rgba(5,69,31,.36)", paddingHorizontal: 3 },
  sceneMenuText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  lessonProgressCard: { backgroundColor: "#FFFFFF", borderRadius: 24, marginTop: -4, padding: 18, elevation: 5 },
  lessonProgressTitle: { color: "#0B1F4D", fontSize: 17, fontWeight: "900" },
  lessonProgressRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 14 },
  lessonTrack: { flex: 1, height: 10, borderRadius: 6, backgroundColor: "#E6EAF2", overflow: "hidden" },
  lessonFill: { height: "100%", borderRadius: 6, backgroundColor: "#39A844" },
  lessonProgressValue: { color: "#15933A", fontSize: 18, fontWeight: "900" },
  rewardRow: { flexDirection: "row", borderTopColor: "#E6EAF2", borderTopWidth: 1, marginTop: 16, paddingTop: 14 },
  reward: { flex: 1, alignItems: "center", borderRightColor: "#E6EAF2", borderRightWidth: 1 },
  rewardLabel: { color: "#475569", fontSize: 9, fontWeight: "700", marginTop: 4 },
  rewardValue: { fontSize: 11, fontWeight: "900", marginTop: 3 },
  objectiveCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#EFF9EC", borderRadius: 22, marginTop: 20, padding: 17 },
  objectiveTitle: { color: "#0B1F4D", fontSize: 15, fontWeight: "900" },
  objectiveText: { color: "#334155", fontSize: 12, lineHeight: 18, marginTop: 6 },
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
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: "#E6EAF0",
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    shadowColor: "#8FA5C4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 15,
    elevation: 4,
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
    width: 72,
    height: 72,
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
