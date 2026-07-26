import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { ComponentProps, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { DataState } from "../../components/data-state";
import { getErrorMessage } from "../../src/api/errorMessage";
import {
  getStudentHome,
  StudentHome,
  Subject,
} from "../../src/services/studentService";
import { getUser } from "../../src/storage/userStorage";
import { colors } from "../../src/theme/colors";
import { User } from "../../src/types/user";
import { clampProgress } from "../../src/utils/progress";
import { RoleHome } from "../../components/role-home";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

type SubjectVisual = {
  accent: string;
  background: string;
  icon: IconName;
};

const fallbackVisuals: SubjectVisual[] = [
  { accent: "#2563EB", background: "#CFE0FF", icon: "menu-book" },
  { accent: "#16A34A", background: "#D3F3DE", icon: "science" },
  { accent: "#EA580C", background: "#FFE0CC", icon: "public" },
  { accent: "#0F766E", background: "#CFF1EC", icon: "translate" },
];

function getGreeting() {
  return new Date().getHours() >= 18 ? "Bonsoir" : "Bonjour";
}

function getSubjectVisual(subject: Subject, index: number): SubjectVisual {
  const value = `${subject.key} ${subject.name}`.toLocaleLowerCase("fr");

  if (value.includes("math")) {
    return { accent: "#2563EB", background: "#CFE0FF", icon: "calculate" };
  }

  if (value.includes("fran") || value.includes("langue")) {
    return { accent: "#0F766E", background: "#CFF1EC", icon: "translate" };
  }

  if (value.includes("science") || value.includes("techn")) {
    return { accent: "#16A34A", background: "#D3F3DE", icon: "science" };
  }

  if (
    value.includes("histoire") ||
    value.includes("géographie") ||
    value.includes("geographie")
  ) {
    return { accent: "#EA580C", background: "#FFE0CC", icon: "public" };
  }

  if (value.includes("anglais")) {
    return { accent: "#0284C7", background: "#D4EFFA", icon: "language" };
  }

  if (value.includes("informat")) {
    return { accent: "#1D4ED8", background: "#CFE0FF", icon: "computer" };
  }

  return fallbackVisuals[index % fallbackVisuals.length];
}

export default function Subjects() {
  const [user, setUser] = useState<User | null>(null);
  const [home, setHome] = useState<StudentHome | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const manualRefreshRef = useRef(false);
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  useFocusEffect(
    useCallback(() => {
      void reloadKey;
      let active = true;

      const load = async () => {
        if (manualRefreshRef.current) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        try {
          const storedUser = await getUser();

          if (!active) {
            return;
          }

          setUser(storedUser);

          if (storedUser?.role === "student") {
            const studentHome = await getStudentHome();

            if (active) {
              setHome(studentHome);
            }
          }
        } catch (loadError: unknown) {
          if (active) {
            setError(
              getErrorMessage(
                loadError,
                "Impossible de charger les matières.",
              ),
            );
          }
        } finally {
          if (active) {
            setLoading(false);
            setRefreshing(false);
            manualRefreshRef.current = false;
          }
        }
      };

      void load();

      return () => {
        active = false;
      };
    }, [reloadKey]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Chargement des matières...</Text>
      </View>
    );
  }

  if (user?.role !== "student") {
    return user ? <RoleHome user={user} /> : null;
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

  const subjects = home?.subjects ?? [];
  const progress = clampProgress(home?.global_progress);
  const completedSubjects = subjects.filter(
    (subject) => clampProgress(subject.progress) >= 100,
  ).length;
  const activeSubjects = subjects.filter((subject) => {
    const subjectProgress = clampProgress(subject.progress);
    return subjectProgress > 0 && subjectProgress < 100;
  }).length;
  const nextSubject =
    subjects.find(
      (subject) =>
        Boolean(subject.last_lesson?.trim()) &&
        clampProgress(subject.progress) < 100,
    ) ??
    subjects.find((subject) => clampProgress(subject.progress) < 100) ??
    subjects[0];

  const openSubject = (subject: Subject) => {
    router.push({
      pathname: "/subject",
      params: { subject: subject.key },
    });
  };

  const refreshDashboard = () => {
    manualRefreshRef.current = true;
    setReloadKey((value) => value + 1);
  };

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={subjects}
      keyExtractor={(item) => item.key}
      ListEmptyComponent={
        <DataState
          message="Tes matières apparaîtront ici dès qu’elles seront disponibles pour ta classe."
          onRetry={() => setReloadKey((value) => value + 1)}
          title="Aucune matière disponible"
        />
      }
      ListHeaderComponent={
        <>
          <View
            style={[
              styles.hero,
              isCompact && styles.heroCompact,
            ]}
          >
            <View style={styles.heroCircleLarge} />
            <View style={styles.heroCircleSmall} />

            <View style={styles.heroRow}>
              <View style={styles.greetingBlock}>
                <Text style={styles.eyebrow}>ESPACE ÉLÈVE</Text>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.greeting,
                    isCompact && styles.greetingCompact,
                  ]}
                >
                  {getGreeting()}{" "}
                  {home?.student.first_name || user.first_name || "élève"}
                </Text>
              </View>

              <View style={styles.classBadge}>
                <Text style={styles.classLabel}>Classe</Text>
                <Text numberOfLines={2} style={styles.className}>
                  {home?.student.class_name || user.class_name || "À confirmer"}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityHint={
              nextSubject
                ? `Ouvre ${nextSubject.name}`
                : "Aucune matière disponible"
            }
            accessibilityLabel="Continuer mon apprentissage"
            accessibilityRole="button"
            disabled={!nextSubject}
            onPress={() => nextSubject && openSubject(nextSubject)}
            style={({ pressed }) => [
              styles.progressBanner,
              pressed && styles.progressBannerPressed,
            ]}
          >
            <View style={styles.progressIcon}>
              <MaterialIcons
                color={colors.primary}
                name="auto-graph"
                size={30}
              />
            </View>
            <View style={styles.progressCopy}>
              <Text style={styles.progressTitle}>
                {nextSubject ? "Reprendre mon parcours" : "Ma progression"}
              </Text>
              <Text style={styles.progressText}>
                {nextSubject?.last_lesson?.trim() ||
                  nextSubject?.name ||
                  `${progress}% de progression globale`}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>
            </View>
            <MaterialIcons
              color={colors.surface}
              name={nextSubject ? "arrow-forward" : "auto-graph"}
              size={26}
            />
          </Pressable>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, styles.summaryIconActive]}>
                <MaterialIcons
                  color={colors.primary}
                  name="pending-actions"
                  size={23}
                />
              </View>
              <Text style={styles.summaryValue}>{activeSubjects}</Text>
              <Text style={styles.summaryLabel}>En cours</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, styles.summaryIconCompleted]}>
                <MaterialIcons
                  color={colors.secondary}
                  name="task-alt"
                  size={23}
                />
              </View>
              <Text style={styles.summaryValue}>{completedSubjects}</Text>
              <Text style={styles.summaryLabel}>Terminées</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={[styles.summaryIcon, styles.summaryIconProgress]}>
                <MaterialIcons
                  color="#EA580C"
                  name="trending-up"
                  size={23}
                />
              </View>
              <Text style={styles.summaryValue}>{progress}%</Text>
              <Text style={styles.summaryLabel}>Progression</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>APPRENDRE</Text>
              <Text style={styles.sectionTitle}>Mes matières</Text>
            </View>
            <View style={styles.subjectCount}>
              <Text style={styles.subjectCountText}>{subjects.length}</Text>
            </View>
          </View>
        </>
      }
      renderItem={({ index, item }) => {
        const visual = getSubjectVisual(item, index);
        const subjectProgress = clampProgress(item.progress);

        return (
          <Pressable
            accessibilityLabel={`Ouvrir la matière ${item.name}`}
            accessibilityRole="button"
            onPress={() => openSubject(item)}
            style={({ pressed }) => [
              styles.subjectCard,
              pressed && styles.subjectCardPressed,
            ]}
          >
            <View style={styles.subjectCopy}>
              <View
                style={[
                  styles.subjectAccent,
                  { backgroundColor: visual.accent },
                ]}
              />
              <Text numberOfLines={2} style={styles.subjectName}>
                {item.name}
              </Text>
              <Text numberOfLines={1} style={styles.lessonText}>
                {item.last_lesson || "Découvrir les leçons"}
              </Text>

              <View style={styles.subjectProgressRow}>
                <View style={styles.subjectTrack}>
                  <View
                    style={[
                      styles.subjectFill,
                      {
                        backgroundColor: visual.accent,
                        width: `${subjectProgress}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.subjectPercent, { color: visual.accent }]}>
                  {subjectProgress}%
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.subjectIllustration,
                { backgroundColor: visual.background },
              ]}
            >
              <View
                style={[
                  styles.decorativeCircle,
                  { backgroundColor: `${visual.accent}20` },
                ]}
              />
              <MaterialIcons
                color={visual.accent}
                name={visual.icon}
                size={isCompact ? 48 : 58}
              />
              <View
                style={[
                  styles.openIcon,
                  { backgroundColor: visual.accent },
                ]}
              >
                <MaterialIcons
                  color={colors.surface}
                  name="arrow-forward"
                  size={18}
                />
              </View>
            </View>
          </Pressable>
        );
      }}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={refreshDashboard}
          refreshing={refreshing}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 34,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 22,
  },
  loadingText: {
    color: colors.muted,
    fontWeight: "800",
    marginTop: 12,
  },
  hero: {
    minHeight: 245,
    overflow: "hidden",
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 38,
    borderBottomRightRadius: 38,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 74,
  },
  heroCompact: {
    paddingHorizontal: 18,
  },
  heroCircleLarge: {
    position: "absolute",
    top: -90,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(22,163,74,0.22)",
  },
  heroCircleSmall: {
    position: "absolute",
    bottom: -70,
    left: 80,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  greetingBlock: {
    flex: 1,
  },
  eyebrow: {
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  greeting: {
    color: colors.surface,
    fontSize: 33,
    fontWeight: "900",
    lineHeight: 40,
    marginTop: 7,
  },
  greetingCompact: {
    fontSize: 27,
    lineHeight: 34,
  },
  classBadge: {
    minWidth: 105,
    maxWidth: 132,
    backgroundColor: colors.primaryDark,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  classLabel: {
    color: "#BFDBFE",
    fontSize: 12,
    fontWeight: "800",
  },
  className: {
    color: colors.surface,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 4,
  },
  progressBanner: {
    minHeight: 126,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.primaryDark,
    borderColor: "#2A579C",
    borderRadius: 28,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: -53,
    padding: 18,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
  progressBannerPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  progressIcon: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
  },
  progressCopy: {
    flex: 1,
  },
  progressTitle: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "900",
  },
  progressText: {
    color: "#BFDBFE",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  progressTrack: {
    height: 7,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 4,
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
  },
  summaryCard: {
    flex: 1,
    minHeight: 112,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderColor: "#E6EAF0",
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 12,
  },
  summaryIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  summaryIconActive: {
    backgroundColor: "#EAF1FF",
  },
  summaryIconCompleted: {
    backgroundColor: "#E4F7EA",
  },
  summaryIconProgress: {
    backgroundColor: "#FFF0E5",
  },
  summaryValue: {
    color: colors.textStrong,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 7,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 22,
    marginBottom: 4,
    marginTop: 34,
  },
  sectionEyebrow: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  sectionTitle: {
    color: colors.textStrong,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 3,
  },
  subjectCount: {
    minWidth: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF1FF",
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  subjectCountText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },
  subjectCard: {
    minHeight: 154,
    flexDirection: "row",
    alignItems: "stretch",
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderColor: "#E6EAF0",
    borderRadius: 30,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: "#DCC8B7",
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 4,
  },
  subjectCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  subjectCopy: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 12,
    paddingVertical: 18,
  },
  subjectAccent: {
    width: 34,
    height: 5,
    borderRadius: 3,
    marginBottom: 10,
  },
  subjectName: {
    color: colors.textStrong,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 27,
  },
  lessonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7,
  },
  subjectProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 13,
  },
  subjectTrack: {
    flex: 1,
    height: 6,
    overflow: "hidden",
    backgroundColor: "#E9EDF2",
    borderRadius: 3,
  },
  subjectFill: {
    height: "100%",
    borderRadius: 3,
  },
  subjectPercent: {
    fontSize: 12,
    fontWeight: "900",
  },
  subjectIllustration: {
    width: "37%",
    minWidth: 116,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  decorativeCircle: {
    position: "absolute",
    top: -35,
    right: -35,
    width: 125,
    height: 125,
    borderRadius: 63,
  },
  openIcon: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
});
