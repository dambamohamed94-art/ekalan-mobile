import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DataState } from "../../components/data-state";
import { getErrorMessage } from "../../src/api/errorMessage";
import { getStudentProgress } from "../../src/services/progressService";
import { colors } from "../../src/theme/colors";
import { clampProgress } from "../../src/utils/progress";

export default function Progress() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void reloadKey;
      let active = true;

      const loadProgress = async () => {
        setError(null);

        try {
          const res = await getStudentProgress();

          if (active) {
            setData(res);
          }
        } catch (err: unknown) {
          if (active) {
            setError(
              getErrorMessage(err, "Impossible de charger votre progression."),
            );
          }
        } finally {
          if (active) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      };

      void loadProgress();

      return () => {
        active = false;
      };
    }, [reloadKey]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement de ta progression...</Text>
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

  const progress = clampProgress(data?.global_progress);
  const refreshProgress = () => {
    setRefreshing(true);
    setReloadKey((value) => value + 1);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          colors={[colors.primary, colors.secondary]}
          onRefresh={refreshProgress}
          refreshing={refreshing}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.emoji}>🎯</Text>
        <Text style={styles.title}>Ta progression</Text>
        <Text style={styles.subtitle}>
          Continue comme ça, chaque leçon compte 🚀
        </Text>
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.percent}>{progress}%</Text>
        <Text style={styles.label}>Progression globale</Text>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Par matière</Text>

      {!data?.subjects?.length ? (
        <DataState
          title="Aucune progression par matière"
          message="Les détails apparaîtront après le début de tes cours."
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      ) : null}

      {data?.subjects?.map((subject: any, index: number) => {
        const subjectProgress = clampProgress(subject.progress);

        return (
          <View key={subject.key || index} style={styles.subjectCard}>
            <Text style={styles.subjectName}>{subject.name}</Text>
            <Text style={styles.subjectPercent}>{subjectProgress}%</Text>

            <View style={styles.trackSmall}>
              <View
                style={[styles.fill, { width: `${subjectProgress}%` }]}
              />
            </View>
          </View>
        );
      })}
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
    paddingBottom: 30,
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
  hero: {
    marginTop: 52,
    backgroundColor: colors.primary,
    borderRadius: 32,
    padding: 26,
    alignItems: "center",
  },
  emoji: {
    fontSize: 58,
  },
  title: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 8,
    color: "#DDEBFF",
    fontWeight: "800",
    textAlign: "center",
  },
  progressCard: {
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
  },
  percent: {
    fontSize: 54,
    fontWeight: "900",
    color: colors.primary,
  },
  label: {
    marginTop: 4,
    color: "#64748B",
    fontWeight: "900",
  },
  track: {
    marginTop: 20,
    height: 14,
    width: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    overflow: "hidden",
  },
  trackSmall: {
    marginTop: 14,
    height: 10,
    width: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  sectionTitle: {
    marginTop: 28,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  subjectCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
  },
  subjectPercent: {
    marginTop: 6,
    color: colors.primary,
    fontWeight: "900",
  },
});
