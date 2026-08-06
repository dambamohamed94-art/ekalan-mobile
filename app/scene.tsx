import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DataState } from "../components/data-state";
import { LessonSceneKey, LessonSceneTabs } from "../components/lesson-scene-tabs";
import { SackoContextButton } from "../components/sacko-context-button";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import {
  getStudentLessonContext,
  getStudentLessonSceneContent,
  markLessonSceneCompleted,
  markLessonSceneOpened,
} from "../src/services/learningService";
import { colors } from "../src/theme/colors";
import {
  LearningVideo,
  StudentLessonContext,
} from "../src/types/learning";

const sceneLabels: Record<string, string> = {
  course: "Cours",
  video: "Vidéo",
  revision: "Révision",
  quiz: "Quiz",
  exercise: "Exercice",
  challenge: "Défi",
};

const sackoTabs = {
  course: "cours",
  video: "video",
  revision: "revision",
  quiz: "quiz",
  exercise: "exercices",
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function firstAvailable(...values: unknown[]) {
  return values.find((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (isRecord(value)) return Object.keys(value).length > 0;
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  });
}

function getSceneContent(context: StudentLessonContext | null, type: string) {
  const lesson = context?.lesson;
  const chapter = context?.chapter_assets;

  if (type === "course") {
    return firstAvailable(lesson?.fiche_cours, lesson?.content);
  }
  if (type === "video") {
    return firstAvailable(lesson?.videos, chapter?.medias);
  }
  if (type === "revision") {
    return firstAvailable(lesson?.fiche_revision, chapter?.fiche_revision);
  }
  if (type === "quiz") {
    return firstAvailable(lesson?.quiz_interactifs, chapter?.quiz);
  }
  if (type === "exercise") {
    return firstAvailable(lesson?.exercices, chapter?.exercices);
  }
  return null;
}

function selectSceneContent(
  content: unknown,
  type: string,
  itemIndex?: string,
) {
  if (
    !Array.isArray(content) ||
    !["quiz", "exercise"].includes(type)
  ) {
    return content;
  }

  const index = Number(itemIndex);
  return content[Number.isInteger(index) && index >= 0 ? index : 0] ?? null;
}

function findUrl(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("/")) return `https://ekalan.com${value}`;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const nestedUrl = findUrl(item);
      if (nestedUrl) return nestedUrl;
    }
  }
  if (isRecord(value)) {
    for (const key of ["url", "video_url", "src", "link"]) {
      const nestedUrl = findUrl(value[key]);
      if (nestedUrl) return nestedUrl;
    }
  }
  return null;
}

function formatLabel(value: string) {
  const labels: Record<string, string> = {
    a_retenir: "À retenir",
    explication_simple: "Explication",
    fiche_revision: "Fiche de révision",
    micro_lessons: "Étapes du cours",
    mini_defis: "Mini-défis",
    mots_cles: "Mots clés",
    objectif: "Objectif",
    objectifs: "Objectifs",
    resume_court: "Résumé",
    summary_fun: "En résumé",
    front: "Question",
    back: "Réponse",
    answer: "Réponse",
    question: "Question",
    instruction: "Consigne",
  };
  return labels[value] ?? value.replaceAll("_", " ");
}

function shouldHideTechnicalLabel(key: string) {
  return [
    "block",
    "blocks",
    "body",
    "card",
    "cards",
    "children",
    "column",
    "columns",
    "content",
    "contents",
    "data",
    "elements",
    "entries",
    "header",
    "headers",
    "heading",
    "headings",
    "item",
    "items",
    "kind",
    "label",
    "layout",
    "list",
    "meta",
    "metadata",
    "paragraph",
    "paragraphs",
    "row",
    "rows",
    "scene",
    "scenes",
    "section",
    "sections",
    "style",
    "table",
    "tables",
    "text",
    "value",
    "values",
    "variant",
  ].includes(key.toLowerCase()) || /^[a-z]$/i.test(key);
}

function cleanText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|details)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const structuralKeys = new Set([
  "id",
  "illustration_svg",
  "link",
  "pdf_url",
  "poster_svg",
  "printable",
  "scene_type",
  "src",
  "thumbnail",
  "title",
  "titre",
  "type",
  "url",
  "video_url",
]);

function remainingContent(value: Record<string, unknown>, excluded: string[]) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, item]) => !excluded.includes(key.toLowerCase()) && item != null,
    ),
  );
}

function ParagraphContent({ value }: { value: unknown }) {
  const paragraphs = Array.isArray(value) ? value : [value];
  return (
    <View style={styles.paragraphGroup}>
      {paragraphs.map((paragraph, index) => (
        <View key={index}>
          <ContentValue value={paragraph} />
        </View>
      ))}
    </View>
  );
}

function CalloutContent({
  value,
  fallbackLabel = "À retenir",
}: {
  value: unknown;
  fallbackLabel?: string;
}) {
  const record = isRecord(value) ? value : null;
  const label = cleanText(
    String(record?.title ?? record?.titre ?? record?.label ?? fallbackLabel),
  );
  const payload = record
    ? firstAvailable(
        record.content,
        record.text,
        record.body,
        record.paragraph,
        record.paragraphs,
        remainingContent(record, [
          "title",
          "titre",
          "label",
          "type",
          "kind",
          "variant",
          "icon",
        ]),
      )
    : value;

  return (
    <View style={styles.callout}>
      <View style={styles.calloutLabel}>
        <MaterialIcons color="#FFFFFF" name="visibility" size={18} />
        <Text style={styles.calloutLabelText}>{label || fallbackLabel}</Text>
      </View>
      <View style={styles.calloutBody}>
        <ContentValue value={payload} />
      </View>
    </View>
  );
}

function TableContent({ value }: { value: Record<string, unknown> }) {
  const headers = Array.isArray(value.headers) ? value.headers : [];
  const rows = Array.isArray(value.rows)
    ? value.rows
    : Array.isArray(value.data)
      ? value.data
      : [];

  if (!headers.length && !rows.length) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        {headers.length ? (
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            {headers.map((header, index) => (
              <Text key={index} style={[styles.tableCell, styles.tableHeaderCell]}>
                {cleanText(String(header))}
              </Text>
            ))}
          </View>
        ) : null}
        {rows.map((row, rowIndex) => {
          const cells = Array.isArray(row)
            ? row
            : isRecord(row)
              ? Object.values(row)
              : [row];
          return (
            <View key={rowIndex} style={styles.tableRow}>
              {cells.map((cell, cellIndex) => (
                <View key={cellIndex} style={styles.tableCell}>
                  <ContentValue value={cell} />
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function SectionsContent({ value }: { value: unknown }) {
  const sections = Array.isArray(value) ? value : [value];
  return (
    <View style={styles.sectionsList}>
      {sections.map((section, index) => {
        const record = isRecord(section) ? section : null;
        const title = record
          ? cleanText(
              String(
                record.title ??
                  record.titre ??
                  record.heading ??
                  record.header ??
                  `Étape ${index + 1}`,
              ),
            )
          : `Étape ${index + 1}`;
        const content = record
          ? remainingContent(record, ["title", "titre", "heading", "header"])
          : section;
        return (
          <View key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeading}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <ContentValue value={content} />
          </View>
        );
      })}
    </View>
  );
}

function SemanticEntry({ name, value }: { name: string; value: unknown }) {
  const key = name.toLowerCase();
  if (["section", "sections"].includes(key)) {
    return <SectionsContent value={value} />;
  }
  if (["paragraph", "paragraphs", "text", "body"].includes(key)) {
    return <ParagraphContent value={value} />;
  }
  if (["callout", "callouts", "note", "notes", "reminder", "rappel"].includes(key)) {
    if (Array.isArray(value)) {
      return (
        <View style={styles.blockList}>
          {value.map((item, index) => <CalloutContent key={index} value={item} />)}
        </View>
      );
    }
    return <CalloutContent value={value} fallbackLabel={key === "rappel" ? "Rappel" : "À retenir"} />;
  }
  if (["heading", "header"].includes(key)) {
    return <Text style={styles.inlineHeading}>{cleanText(String(value))}</Text>;
  }
  if (key === "table" && isRecord(value)) {
    return <TableContent value={value} />;
  }
  if (shouldHideTechnicalLabel(key)) {
    return <ContentValue value={value} />;
  }
  return (
    <View style={styles.contentBlock}>
      <Text style={styles.blockTitle}>{formatLabel(name)}</Text>
      <ContentValue value={value} />
    </View>
  );
}

function ContentValue({ value }: { value: unknown }) {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number") {
    const text = cleanText(String(value));
    return text ? <Text style={styles.paragraph}>{text}</Text> : null;
  }
  if (Array.isArray(value)) {
    return (
      <View style={styles.blockList}>
        {value.map((item, index) => (
          <View key={index} style={styles.listRow}>
            <Text style={styles.bullet}>•</Text>
            <View style={styles.listCopy}><ContentValue value={item} /></View>
          </View>
        ))}
      </View>
    );
  }
  if (isRecord(value)) {
    if (
      (Array.isArray(value.headers) && Array.isArray(value.rows)) ||
      (Array.isArray(value.headers) && Array.isArray(value.data))
    ) {
      return <TableContent value={value} />;
    }
    const kind = String(value.type ?? value.kind ?? value.variant ?? "").toLowerCase();
    if (["callout", "note", "reminder", "tip", "important"].includes(kind)) {
      return <CalloutContent value={value} />;
    }
    return (
      <View style={styles.blockList}>
        {Object.entries(value)
          .filter(
            ([key, item]) =>
              !structuralKeys.has(key) && item != null,
          )
          .map(([key, item]) =>
            key === "icon" ? (
              <Text accessibilityElementsHidden key={key} style={styles.courseIcon}>
                {String(item)}
              </Text>
            ) : (
              <View key={key}>
                <SemanticEntry name={key} value={item} />
              </View>
            ),
          )}
      </View>
    );
  }
  return null;
}

function DocumentContent({
  content,
  scene,
}: {
  content: unknown;
  scene: "course" | "revision";
}) {
  return (
    <View>
      <View
        style={[
          styles.documentHeading,
          scene === "revision" && styles.revisionHeading,
        ]}
      >
        <MaterialIcons
          color={scene === "revision" ? "#0F766E" : colors.primary}
          name={scene === "revision" ? "fact-check" : "menu-book"}
          size={28}
        />
        <View style={styles.documentHeadingCopy}>
          <Text style={styles.documentTitle}>
            {scene === "revision" ? "L’essentiel à retenir" : "Découvrir le cours"}
          </Text>
          <Text style={styles.documentSubtitle}>
            {scene === "revision"
              ? "Relis les notions importantes de la leçon."
              : "Avance étape par étape dans la leçon."}
          </Text>
        </View>
      </View>
      <ContentValue value={content} />
    </View>
  );
}

function VideoContent({ content }: { content: unknown }) {
  const videos = (Array.isArray(content) ? content : [content]).filter(
    (video): video is LearningVideo => isRecord(video),
  );

  return (
    <View style={styles.videoList}>
      {videos.map((video, index) => {
        const url = findUrl(video);
        const title =
          String(video.title ?? video.titre ?? "").trim() ||
          `Vidéo ${index + 1}`;
        const description = String(video.description ?? "").trim();
        const duration = String(video.duration ?? "").trim();

        return (
          <View key={String(video.id ?? `${title}-${index}`)} style={styles.videoCard}>
            <View style={styles.videoIcon}>
              <MaterialIcons color="#0284C7" name="play-arrow" size={30} />
            </View>
            <View style={styles.videoCopy}>
              <Text style={styles.videoTitle}>{title}</Text>
              {description ? (
                <Text style={styles.videoDescription}>{description}</Text>
              ) : null}
              {duration ? <Text style={styles.videoDuration}>{duration}</Text> : null}
              {url ? (
                <Pressable
                  accessibilityLabel={`Ouvrir la vidéo ${title}`}
                  accessibilityRole="link"
                  onPress={() => void WebBrowser.openBrowserAsync(url)}
                  style={styles.videoButton}
                >
                  <MaterialIcons
                    color={colors.surface}
                    name="play-circle"
                    size={20}
                  />
                  <Text style={styles.videoButtonText}>Regarder la vidéo</Text>
                </Pressable>
              ) : (
                <Text style={styles.videoUnavailable}>
                  Vidéo en attente de publication
                </Text>
              )}
            </View>
          </View>
        );
      })}
      <View style={styles.videoTip}>
        <View style={styles.videoTipCopy}>
          <Text style={styles.videoTipTitle}>💡 À retenir</Text>
          <Text style={styles.videoTipText}>
            Observe attentivement l’explication, puis vérifie que tu peux la reformuler avec tes mots.
          </Text>
        </View>
        <Image
          contentFit="contain"
          source={require("../assets/images/dashboard-student-cameleon.svg")}
          style={styles.videoTipMascot}
        />
      </View>
    </View>
  );
}

function svgUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function PedagogicalScenes({
  content,
  scene,
}: {
  content: unknown[];
  scene: string;
}) {
  return (
    <View style={styles.pedagogicalList}>
      {content.map((rawScene, index) => {
        const item = isRecord(rawScene) ? rawScene : {};
        const title = String(item.title ?? item.titre ?? `Étape ${index + 1}`);
        const svg = String(
          item.illustration_svg ?? item.poster_svg ?? "",
        ).trim();
        const url = findUrl(item);
        return (
          <View key={String(item.id ?? index)} style={styles.pedagogicalCard}>
            <Text style={styles.pedagogicalTitle}>{title}</Text>
            {svg ? (
              <Image
                contentFit="contain"
                source={{ uri: svgUri(svg) }}
                style={[
                  styles.pedagogicalImage,
                  scene === "course" && styles.coursePedagogicalImage,
                ]}
              />
            ) : null}
            <ContentValue value={item} />
            {url ? (
              <Pressable
                accessibilityRole="link"
                onPress={() => void WebBrowser.openBrowserAsync(url)}
                style={styles.videoButton}
              >
                <MaterialIcons color={colors.surface} name="play-circle" size={20} />
                <Text style={styles.videoButtonText}>Ouvrir le contenu</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export default function ScenePage() {
  const {
    subject,
    chapter,
    lessonIndex = "0",
    lesson,
    scene = "course",
    itemIndex,
  } = useLocalSearchParams<{
    subject: string;
    chapter: string;
    lessonIndex: string;
    lesson?: string;
    scene: string;
    itemIndex?: string;
  }>();
  const [context, setContext] = useState<StudentLessonContext | null>(null);
  const [engineContent, setEngineContent] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const load =
      scene === "course" || scene === "video" || scene === "revision"
        ? getStudentLessonSceneContent(
            subject,
            chapter,
            lessonIndex,
            lesson,
            scene,
          )
        : getStudentLessonContext(subject, chapter, lessonIndex, lesson).then(
            (data) => ({ context: data, content: [] }),
          );
    load
      .then((data) => {
        if (!active) return;
        setContext(data.context);
        setEngineContent(data.content);
        if (["course", "video", "revision"].includes(scene)) {
          const mobileScene = scene === "course" ? "cours" : scene;
          void markLessonSceneOpened({
            subject,
            chapter,
            lesson_id: data.context.lesson.id,
            scene: mobileScene as "cours" | "video" | "revision",
          }).catch(() => undefined);
        }
      })
      .catch((loadError: unknown) =>
        active &&
        setError(getErrorMessage(loadError, "Impossible de charger cette scène.")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [chapter, lesson, lessonIndex, reloadKey, scene, subject]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Chargement du contenu...</Text>
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

  const content = selectSceneContent(
    engineContent?.length ? engineContent : getSceneContent(context, scene),
    scene,
    itemIndex,
  );
  const canComplete = Boolean(content) && ["course", "video", "revision"].includes(scene);

  const openScene = (nextScene: LessonSceneKey) => {
    if (nextScene === scene) return;
    const params = {
      subject,
      chapter,
      lessonIndex,
      lesson: String(context?.lesson?.id ?? lesson ?? ""),
    };
    if (nextScene === "quiz" || nextScene === "exercise") {
      router.replace({ pathname: "/quiz", params: { ...params, mode: nextScene === "quiz" ? "quiz" : "exercise" } });
      return;
    }
    router.replace({ pathname: "/scene", params: { ...params, scene: nextScene } });
  };

  const completeScene = async () => {
    if (!context || !canComplete || completing) return;
    setCompleting(true);
    setCompletionError(null);
    try {
      const mobileScene = scene === "course" ? "cours" : scene;
      await markLessonSceneCompleted({
        subject,
        chapter,
        lesson_id: context.lesson.id,
        scene: mobileScene as "cours" | "video" | "revision",
      });
      setCompleted(true);
    } catch (caught: unknown) {
      setCompletionError(
        getErrorMessage(caught, "Impossible d'enregistrer cette scène."),
      );
    } finally {
      setCompleting(false);
    }
  };
  return (
    <ScrollView
      bouncesZoom
      contentContainerStyle={styles.content}
      maximumZoomScale={3}
      minimumZoomScale={1}
      style={styles.container}
    >
      <Pressable
        accessibilityLabel="Retour à la leçon"
        accessibilityRole="button"
        onPress={() =>
          goBackOrReplace({
            pathname: "/lesson",
            params: {
              subject,
              chapter,
              index: lessonIndex,
              lesson: lesson ?? "",
            },
          })
        }
        style={styles.backButton}
      >
        <MaterialIcons color={colors.primary} name="arrow-back" size={25} />
        <Text style={styles.backText}>Leçon</Text>
      </Pressable>

      <View
        style={[
          styles.hero,
          scene === "course" && styles.heroCourse,
          scene === "revision" && styles.heroRevision,
          scene === "video" && styles.heroVideo,
        ]}
      >
        <Text style={styles.eyebrow}>{context?.lesson?.title || "LEÇON"}</Text>
        <Text style={styles.title}>{sceneLabels[scene] || "Contenu"}</Text>
        <Text style={styles.subtitle}>Contenu pédagogique EKALAN</Text>
      </View>

      <LessonSceneTabs
        active={scene as LessonSceneKey}
        onSelect={openScene}
      />

      <SackoContextButton
        chapter={chapter}
        lesson={String(context?.lesson?.id ?? lesson ?? "")}
        level={context?.student?.class_code}
        sceneIndex={Math.max(0, Number(itemIndex) || 0)}
        subject={subject}
        tab={sackoTabs[scene as keyof typeof sackoTabs] ?? "cours"}
      />

      <View style={styles.card}>
        {content ? (
          Array.isArray(content) &&
          ["course", "video", "revision"].includes(scene) ? (
            <PedagogicalScenes content={content} scene={scene} />
          ) : scene === "video" ? (
            <VideoContent content={content} />
          ) : scene === "course" || scene === "revision" ? (
            <DocumentContent content={content} scene={scene} />
          ) : (
            <ContentValue value={content} />
          )
        ) : (
          <DataState
            message="Ce contenu n’est pas encore disponible pour cette leçon."
            title="Contenu indisponible"
          />
        )}
      </View>
      {canComplete ? (
        <>
          {completionError ? <Text style={styles.completionError}>{completionError}</Text> : null}
          <Pressable
            accessibilityRole="button"
            disabled={completing || completed}
            onPress={() => void completeScene()}
            style={[styles.completeButton, completed && styles.completeButtonDone]}
          >
            {completing ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <MaterialIcons color={colors.surface} name="check-circle" size={22} />
            )}
            <Text style={styles.completeButtonText}>
              {completed ? "Scène terminée" : "J'ai terminé cette scène"}
            </Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 100 },
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
  hero: { backgroundColor: colors.primary, borderRadius: 30, padding: 24 },
  heroCourse: { backgroundColor: "#128C3E" },
  heroVideo: { backgroundColor: "#1459D9" },
  heroRevision: { backgroundColor: "#7027B8" },
  eyebrow: { color: "#BFDBFE", fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  title: { color: colors.surface, fontSize: 30, fontWeight: "900", marginTop: 7 },
  subtitle: { color: "#DDEBFF", fontSize: 13, fontWeight: "700", marginTop: 7 },
  card: {
    backgroundColor: colors.surface,
    borderColor: "#E6EAF0",
    borderRadius: 26,
    borderWidth: 1,
    marginTop: 20,
    padding: 20,
    elevation: 3,
  },
  blockList: { gap: 12 },
  contentBlock: {
    gap: 5,
    backgroundColor: "#F8FAFC",
    borderColor: "#E7EDF5",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  blockTitle: {
    color: colors.textStrong,
    fontSize: 16,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  paragraph: { color: colors.text, fontSize: 15, fontWeight: "600", lineHeight: 24 },
  paragraphGroup: { gap: 12 },
  listRow: { flexDirection: "row", gap: 8 },
  bullet: { color: colors.secondary, fontSize: 20, fontWeight: "900" },
  listCopy: { flex: 1 },
  sectionsList: { gap: 22 },
  sectionCard: {
    gap: 16,
    backgroundColor: "#FFFFFF",
    borderColor: "#F2D6E9",
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 11 },
  sectionNumber: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D63FA2",
    borderRadius: 17,
  },
  sectionNumberText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  sectionTitle: {
    flex: 1,
    color: colors.textStrong,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 27,
  },
  inlineHeading: {
    color: colors.textStrong,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 27,
    marginTop: 4,
  },
  callout: { marginTop: 4 },
  calloutLabel: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#D63FA2",
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  calloutLabelText: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  calloutBody: {
    borderLeftColor: "#EADCF0",
    borderLeftWidth: 3,
    marginLeft: 9,
    paddingLeft: 16,
    paddingTop: 12,
  },
  table: {
    minWidth: 430,
    borderColor: "#DCE5F2",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableRow: { flexDirection: "row", backgroundColor: "#FFFFFF" },
  tableHeaderRow: { backgroundColor: "#EAF7F4" },
  tableCell: {
    width: 140,
    minHeight: 48,
    justifyContent: "center",
    borderBottomColor: "#DCE5F2",
    borderBottomWidth: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    padding: 11,
  },
  tableHeaderCell: { color: "#0F766E", fontWeight: "900", textAlign: "center" },
  documentHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#EAF1FF",
    borderRadius: 18,
    marginBottom: 20,
    padding: 14,
  },
  revisionHeading: { backgroundColor: "#E4F7EA" },
  documentHeadingCopy: { flex: 1 },
  documentTitle: { color: colors.textStrong, fontSize: 16, fontWeight: "900" },
  documentSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 3,
  },
  videoList: { gap: 14 },
  videoCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  videoIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4EFFA",
    borderRadius: 16,
  },
  videoCopy: { flex: 1 },
  videoTitle: { color: colors.textStrong, fontSize: 16, fontWeight: "900" },
  videoDescription: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 5,
  },
  videoDuration: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
  },
  videoButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.primary,
    borderRadius: 14,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  videoButtonText: { color: colors.surface, fontSize: 12, fontWeight: "900" },
  videoUnavailable: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 10,
  },
  videoTip: {
    minHeight: 118,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF5FF",
    borderColor: "#BFDBFE",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingLeft: 16,
  },
  videoTipCopy: { flex: 1, paddingVertical: 14 },
  videoTipTitle: { color: colors.primary, fontSize: 16, fontWeight: "900" },
  videoTipText: { color: colors.text, fontSize: 12, fontWeight: "700", lineHeight: 18, marginTop: 6 },
  videoTipMascot: { width: 108, height: 108, marginRight: -7, alignSelf: "flex-end" },
  pedagogicalList: { gap: 16 },
  pedagogicalCard: {
    backgroundColor: "#F8FAFC",
    borderColor: "#DCE5F2",
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  pedagogicalTitle: {
    color: colors.textStrong,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  pedagogicalImage: {
    width: "100%",
    height: 190,
    marginBottom: 14,
  },
  coursePedagogicalImage: { height: 280 },
  courseIcon: {
    fontSize: 44,
    lineHeight: 54,
    marginBottom: 4,
    textAlign: "center",
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: colors.secondary,
    borderRadius: 18,
    marginTop: 18,
    minHeight: 56,
    paddingHorizontal: 18,
  },
  completeButtonDone: { backgroundColor: "#15803D" },
  completeButtonText: { color: colors.surface, fontSize: 15, fontWeight: "900" },
  completionError: { color: "#B91C1C", fontWeight: "800", marginTop: 14, textAlign: "center" },
});
