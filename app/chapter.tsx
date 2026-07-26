import { router, useLocalSearchParams } from "expo-router";
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

export default function ChapterPage() {
  const { subject, chapter } = useLocalSearchParams<{
    subject: string;
    chapter: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getStudentChapter(subject, chapter);
        setChapterData(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Impossible de charger ce chapitre."));
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [subject, chapter, reloadKey]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement du chapitre...</Text>
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Retour à la matière"
          accessibilityRole="button"
          onPress={() =>
            goBackOrReplace({
              pathname: "/subject",
              params: { subject },
            })
          }
          style={styles.backButton}
        >
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <BrandLogo style={styles.logo} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.emoji}>📘</Text>
        <Text style={styles.title}>{chapterData?.title}</Text>
        <Text style={styles.subtitle}>
          {chapterData?.lessons?.length || 0} leçons
        </Text>
      </View>

      {!chapterData?.lessons?.length ? (
        <DataState
          title="Chapitre vide"
          message="Les leçons apparaîtront ici dès leur publication."
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      ) : null}

      <Text style={styles.sectionTitle}>Leçons</Text>

      {chapterData?.lessons?.map((lesson: any, index: number) => (
        <Pressable
          accessibilityLabel={`Ouvrir la leçon ${lesson.title || index + 1}`}
          accessibilityRole="button"
          key={lesson.id || index}
          style={styles.itemCard}
          onPress={() =>
            router.push({
              pathname: "/lesson",
             params: {
                subject,
                chapter,
                index: String(index),
                lesson: String(lesson.id ?? ""),
              },
            })
          }
        >
          <Text style={styles.itemEmoji}>📖</Text>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{lesson.title}</Text>
            <Text style={styles.itemMeta}>Leçon {index + 1}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}

    </ScrollView>
  );
}

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
    alignItems: "center",
    justifyContent: "center",
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
  emoji: {
    fontSize: 52,
  },
  title: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: "#DDEBFF",
    fontWeight: "800",
    textAlign: "center",
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 4,
    fontSize: 23,
    fontWeight: "900",
    color: "#0F172A",
  },
  itemCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#E5CDB7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 5,
  },
  itemEmoji: {
    fontSize: 34,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
  },
  itemMeta: {
    marginTop: 5,
    color: "#64748B",
    fontWeight: "700",
  },
  arrow: {
    fontSize: 34,
    color: colors.primary,
    fontWeight: "900",
  },
});
