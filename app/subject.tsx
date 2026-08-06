import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ImageBackground,
    Pressable,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BrandLogo } from "../components/brand-logo";
import { DataState } from "../components/data-state";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { getStudentSubject } from "../src/services/learningService";
import { colors } from "../src/theme/colors";

type Chapter = {
  id: string;
  title: string;
  description?: string;
  lessons?: any[];
  quiz?: any[];
  exos?: any[];
};

export default function SubjectPage() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadSubject = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getStudentSubject(subject);
        setSubjectData(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Impossible de charger cette matière."));
      } finally {
        setLoading(false);
      }
    };

    loadSubject();
  }, [reloadKey, subject]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des chapitres...</Text>
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
  const accent = getSubjectAccent(subject);

  const chapters: Chapter[] = subjectData?.chapters ?? [];
  const subjectProgress = chapters.length ? Math.round(chapters.reduce((sum, item) => sum + getProgress(item), 0) / chapters.length) : 0;
  const completedChapters = chapters.filter((item) => getProgress(item) >= 100).length;

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={chapters}
      keyExtractor={(chapter, index) => String(chapter.id || index)}
      ListHeaderComponent={<>
      <ImageBackground source={require("../assets/images/dashboard-student-bg.webp")} resizeMode="cover" style={styles.premiumHeader} imageStyle={styles.premiumHeaderImage}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour aux matières"
          accessibilityRole="button"
          onPress={() => goBackOrReplace("/(tabs)/subjects")}
          style={styles.backButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <BrandLogo style={styles.logo} />
      </View>

      <View style={[styles.hero, { backgroundColor: accent }]}> 
        <View style={styles.heroDecorOne} /><View style={styles.heroDecorTwo} />
        <View style={styles.heroIcon}><MaterialIcons name={getSubjectIcon(subject)} size={58} color="#FFFFFF" /></View>
        <Text style={styles.title}>{subjectData?.name}</Text>
        <View style={styles.countBadge}><Text style={styles.subtitle}>
          {subjectData?.counts?.chapters || 0} chapitres ·{" "}
          {subjectData?.counts?.lessons || 0} leçons
        </Text></View>
      </View>
      </ImageBackground>

      <View style={styles.progressCard}>
        <Text style={styles.progressCardTitle}>Progression dans la matière</Text>
        <View style={styles.progressRow}><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${subjectProgress}%`, backgroundColor: accent }]} /></View><Text style={[styles.progressValue, { color: accent }]}>{subjectProgress}%</Text></View>
        <Text style={styles.progressMeta}><Text style={{ color: accent }}>{completedChapters}</Text> / {chapters.length} chapitres terminés</Text>
      </View>

      <Text style={styles.sectionTitle}>Chapitres</Text>

      {!chapters.length ? (
        <DataState
          title="Aucun chapitre disponible"
          message="Les chapitres de cette matière apparaîtront ici dès leur publication."
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      ) : null}
      </>}
      renderItem={({ item: chapter, index }) => (
        <Pressable
          accessibilityLabel={`Ouvrir le chapitre ${chapter.title}`}
          accessibilityRole="button"
          style={styles.chapterCard}
          onPress={() =>
            router.push({
              pathname: "/chapter",
              params: {
                subject,
                chapter: chapter.id,
              },
            })
          }
        >
          <View style={[styles.chapterNumber, { backgroundColor: `${accent}16` }]}>
            <Text style={styles.chapterNumberText}>{index + 1}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
            <Text style={styles.chapterDescription}>
              {chapter.description || `${chapter.lessons?.length || 0} leçons`}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.chapterTrack}><View style={[styles.chapterFill, { width: `${getProgress(chapter)}%`, backgroundColor: accent }]} /></View>
              <Text style={[styles.meta, { color: accent }]}>{getProgress(chapter)}%</Text>
            </View>
          </View>

          <View style={[styles.arrowCircle, { backgroundColor: `${accent}12` }]}><MaterialIcons name={getProgress(chapter) >= 100 ? "check" : getProgress(chapter) <= 0 && index > 0 ? "lock-outline" : "chevron-right"} size={25} color={getProgress(chapter) <= 0 && index > 0 ? "#64748B" : accent} /></View>
        </Pressable>
      )}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      style={styles.container}
      windowSize={7}
    />
  );
}

function getSubjectAccent(subject: string) {
  const key = subject.toLowerCase();
  if (key.includes("fran")) return "#F97316";
  if (key.includes("anglais")) return "#3563E9";
  if (key.includes("histoire") || key.includes("geo")) return "#16A34A";
  if (key.includes("science") || key.includes("phys")) return "#0891B2";
  if (key.includes("civ") || key.includes("moral")) return "#D97706";
  return colors.primary;
}
function getSubjectIcon(subject: string): React.ComponentProps<typeof MaterialIcons>["name"] { const key=subject.toLowerCase(); if(key.includes("math")) return "calculate"; if(key.includes("fran")) return "history-edu"; if(key.includes("anglais")) return "translate"; if(key.includes("histoire")||key.includes("geo")) return "public"; if(key.includes("science")) return "science"; return "school"; }
function getProgress(value: any) { const raw = value?.progress_percent ?? value?.progress ?? value?.completion_percentage ?? 0; const number = Number(raw); return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 0; }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F1EC",
  },
  content: {
    padding: 22,
    paddingBottom: 120,
  },
  center: {
    flex: 1,
    backgroundColor: "#F7F1EC",
    justifyContent: "center",
    alignItems: "center",
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
  premiumHeader: { marginHorizontal: -22, marginTop: -22, paddingHorizontal: 22, paddingBottom: 28, minHeight: 320 },
  premiumHeaderImage: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
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
  progressCard: { backgroundColor: "#FFFFFF", borderRadius: 26, marginTop: -30, padding: 20, elevation: 5 },
  progressCardTitle: { color: "#0B1F4D", fontSize: 20, fontWeight: "900" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 18 },
  progressTrack: { flex: 1, height: 10, borderRadius: 6, backgroundColor: "#E8ECF4", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 6 },
  progressValue: { fontSize: 20, fontWeight: "900" },
  progressMeta: { color: "#64748B", fontSize: 15, fontWeight: "800", marginTop: 14 },
  heroDecorOne: { position: "absolute", right: -35, top: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.08)" },
  heroDecorTwo: { position: "absolute", left: -45, bottom: -70, width: 190, height: 190, borderRadius: 95, backgroundColor: "rgba(0,0,0,0.08)" },
  heroIcon: { width: 94, height: 82, alignItems: "center", justifyContent: "center", borderRadius: 25, backgroundColor: "rgba(255,255,255,0.13)" },
  title: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },
  countBadge: { marginTop: 14, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.17)" },
  subtitle: {
    color: "#DDEBFF",
    fontWeight: "800",
  },
  sectionTitle: {
    marginTop: 26,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  chapterCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 5,
  },
  chapterNumber: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  chapterNumberText: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 18,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  chapterDescription: {
    marginTop: 5,
    color: "#64748B",
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  chapterTrack: { flex: 1, height: 7, borderRadius: 5, backgroundColor: "#E7EBF2", overflow: "hidden" },
  chapterFill: { height: "100%", borderRadius: 5 },
  meta: {
    color: "#475569",
    fontWeight: "800",
  },
  chapterVisual: { width: 58, height: 58, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  arrowCircle: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21 },
});
