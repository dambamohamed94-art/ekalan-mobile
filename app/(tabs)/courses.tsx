import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DataState } from "../../components/data-state";
import { getErrorMessage } from "../../src/api/errorMessage";
import { getStudentHome, StudentHome } from "../../src/services/studentService";
import { colors } from "../../src/theme/colors";
import { clampProgress } from "../../src/utils/progress";

export default function Courses() {
  const [home, setHome] = useState<StudentHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void reloadKey;
      let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getStudentHome();

        if (active) {
          setHome(data);
        }
      } catch (e: unknown) {
        if (active) {
          setError(
            getErrorMessage(e, "Impossible de charger les matières."),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

      return () => {
        active = false;
      };
    }, [reloadKey]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des matières...</Text>
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
    <FlatList
      data={home?.subjects || []}
      keyExtractor={(item) => item.key}
      style={styles.container}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <DataState
          title="Aucune matière disponible"
          message="Tes matières apparaîtront ici dès qu’elles seront ajoutées à ta classe."
          onRetry={() => setReloadKey((value) => value + 1)}
        />
      }
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <View>
              <Text style={styles.greeting}>
                Bonjour {home?.student.first_name || "👋"}
              </Text>
              <Text style={styles.smallText}>Continue ton apprentissage</Text>
            </View>

            <View style={styles.classBadge}>
              <Text style={styles.classLabel}>Classe de</Text>
              <Text style={styles.className}>
                {home?.student.class_name || "-"}
              </Text>
            </View>
          </View>

          <View style={styles.unlockCard}>
            <Text style={styles.unlockEmoji}>⭐</Text>
            <Text style={styles.unlockText}>
              Débloque ton potentiel avec tes matières du jour
            </Text>
            <Text style={styles.unlockArrow}>→</Text>
          </View>

          <Text style={styles.sectionTitle}>Mes matières</Text>
        </>
      }
      renderItem={({ item, index }) => {
        const progress = clampProgress(item.progress);

        return (
          <Pressable
            accessibilityLabel={`Ouvrir la matière ${item.name}`}
            accessibilityRole="button"
            style={styles.subjectCard}
            onPress={() =>
              router.push({
                pathname: "/subject",
                params: { subject: item.key },
              })
            }
          >
          <View style={styles.subjectLeft}>
            <Text style={styles.subjectName}>{item.name}</Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>

            <Text style={styles.lessonText}>
              {item.description || "Cours, exercices et quiz disponibles"}
            </Text>
          </View>

          <View style={styles.illustration}>
            <Text style={styles.illustrationEmoji}>
              {["📘", "🧮", "🌍", "🇬🇧", "🔬", "✍️"][index % 6]}
            </Text>
          </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F1EC",
  },
  content: {
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
    fontWeight: "700",
  },
  hero: {
    backgroundColor: colors.primary,
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 90,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "900",
  },
  smallText: {
    marginTop: 8,
    color: "#DDEBFF",
    fontSize: 15,
    fontWeight: "700",
  },
  classBadge: {
    backgroundColor: "#0B2556",
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: 110,
    alignSelf: "flex-start",
  },
  classLabel: {
    color: "#DDEBFF",
    fontSize: 13,
    fontWeight: "800",
  },
  className: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  unlockCard: {
    marginHorizontal: 22,
    marginTop: -46,
    backgroundColor: "#0B2556",
    borderRadius: 26,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#0B2556",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  unlockEmoji: {
    fontSize: 34,
  },
  unlockText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "900",
  },
  unlockArrow: {
    backgroundColor: "#FFFFFF",
    color: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    textAlign: "center",
    lineHeight: 44,
    fontSize: 28,
    fontWeight: "900",
  },
  sectionTitle: {
    marginTop: 30,
    marginHorizontal: 22,
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  subjectCard: {
    marginHorizontal: 22,
    marginTop: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 20,
    minHeight: 130,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#E5CDB7",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 5,
  },
  subjectLeft: {
    flex: 1,
  },
  subjectName: {
    fontSize: 26,
    fontWeight: "900",
    color: "#3F3F46",
  },
  progressTrack: {
    height: 10,
    width: "82%",
    backgroundColor: "#EFE8E3",
    borderRadius: 20,
    marginTop: 18,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  lessonText: {
    marginTop: 12,
    color: "#64748B",
    fontWeight: "700",
  },
  illustration: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-6deg" }],
  },
  illustrationEmoji: {
    fontSize: 46,
  },
});
