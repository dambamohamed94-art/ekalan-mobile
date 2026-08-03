import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getErrorMessage } from "../src/api/errorMessage";
import {
  getParentStudentDashboard,
  getParentStudents,
  getTeacherDashboard,
  LinkedStudent,
  ParentStudentDashboard,
  TeacherDashboard,
} from "../src/services/roleDashboardService";
import { colors } from "../src/theme/colors";
import { User } from "../src/types/user";
import { clampProgress } from "../src/utils/progress";
import { DataState } from "./data-state";

export function RoleHome({ user }: { user: User }) {
  if (user.role === "parent") return <ParentHome user={user} />;
  if (user.role === "teacher") return <TeacherHome user={user} />;
  return null;
}

function ParentHome({ user }: { user: User }) {
  const [students, setStudents] = useState<LinkedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [dashboard, setDashboard] =
    useState<ParentStudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const manualRefreshRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      void reloadKey;
      let active = true;
      if (manualRefreshRef.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      getParentStudents()
        .then((data) => {
          if (!active) return;
          setStudents(data);
          setSelectedStudentId((currentId) => {
            if (
              currentId &&
              data.some((student) => student.student_user_id === currentId)
            ) {
              return currentId;
            }
            return data[0]?.student_user_id ?? null;
          });
        })
        .catch((loadError: unknown) => {
          if (!active) return;
          setError(
            getErrorMessage(
              loadError,
              "Impossible de charger le suivi des enfants.",
            ),
          );
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
          setRefreshing(false);
          manualRefreshRef.current = false;
        });

      return () => {
        active = false;
      };
    }, [reloadKey]),
  );

  useEffect(() => {
    if (!selectedStudentId) {
      setDashboard(null);
      setDashboardError(null);
      return;
    }

    let active = true;
    setDashboardLoading(true);
    setDashboardError(null);
    getParentStudentDashboard(selectedStudentId)
      .then((data) => active && setDashboard(data))
      .catch((loadError: unknown) => {
        if (!active) return;
        setDashboard(null);
        setDashboardError(
          getErrorMessage(
            loadError,
            "Impossible de charger le suivi de cet enfant.",
          ),
        );
      })
      .finally(() => active && setDashboardLoading(false));

    return () => {
      active = false;
    };
  }, [reloadKey, selectedStudentId]);

  if (loading) return <Loading label="Chargement du suivi familial..." />;
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={() => {
            manualRefreshRef.current = true;
            setReloadKey((value) => value + 1);
          }}
          refreshing={refreshing}
          tintColor={colors.primary}
        />
      }
      style={styles.container}
    >
      <Hero
        icon="family-restroom"
        subtitle="Retrouvez la progression et les informations de vos enfants associés."
        title={`Bienvenue ${user.first_name || "parent"}`}
      />

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>SUIVI FAMILIAL</Text>
          <Text style={styles.sectionTitle}>Mes enfants</Text>
        </View>
        <Text style={styles.count}>{students.length}</Text>
      </View>

      {students.length === 0 ? (
        <DataState
          message="Aucun enfant confirmé n’est encore associé à votre compte."
          title="Association en attente"
        />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.studentSwitcher}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {students.map((student) => {
              const selected =
                student.student_user_id === selectedStudentId;
              return (
                <Pressable
                  accessibilityLabel={`Afficher le suivi de ${student.first_name}`}
                  accessibilityRole="button"
                  key={student.student_user_id}
                  onPress={() =>
                    setSelectedStudentId(student.student_user_id)
                  }
                  style={({ pressed }) => [
                    styles.studentChip,
                    selected && styles.studentChipSelected,
                    pressed && styles.studentChipPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.studentChipName,
                      selected && styles.studentChipNameSelected,
                    ]}
                  >
                    {student.first_name} {student.last_name}
                  </Text>
                  <Text
                    style={[
                      styles.studentChipMeta,
                      selected && styles.studentChipMetaSelected,
                    ]}
                  >
                    {student.class_name ||
                      student.class_code ||
                      "Classe à confirmer"}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {dashboardLoading ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.loadingText}>Chargement du suivi...</Text>
            </View>
          ) : dashboardError ? (
            <DataState
              message={dashboardError}
              onRetry={() => setReloadKey((value) => value + 1)}
              title="Suivi indisponible"
            />
          ) : dashboard ? (
            <ParentStudentDetails dashboard={dashboard} />
          ) : null}
        </>
      )}

      <SubscriptionInfo />
    </ScrollView>
  );
}

function ParentStudentDetails({
  dashboard,
}: {
  dashboard: ParentStudentDashboard;
}) {
  const progress = clampProgress(dashboard.global_progress);
  const subjects = dashboard.subjects ?? [];
  const history = dashboard.history ?? [];

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {dashboard.student.first_name?.charAt(0).toUpperCase() || "E"}
            </Text>
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>
              {dashboard.student.first_name} {dashboard.student.last_name}
            </Text>
            <Text style={styles.meta}>
              {dashboard.student.class_name || "Classe à confirmer"}
              {dashboard.student.school_name
                ? ` · ${dashboard.student.school_name}`
                : ""}
            </Text>
          </View>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Progression globale</Text>
          <Text style={styles.progressValue}>{progress}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.statsRow}>
          <MiniStat
            label="Terminés"
            value={dashboard.stats?.completed_courses ?? 0}
          />
          <MiniStat
            label="En cours"
            value={dashboard.stats?.in_progress_courses ?? 0}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>PROGRESSION</Text>
          <Text style={styles.sectionTitle}>Ses matières</Text>
        </View>
        <Text style={styles.count}>{subjects.length}</Text>
      </View>
      {subjects.length ? (
        subjects.map((subject) => {
          const subjectProgress = clampProgress(subject.progress);
          return (
            <View key={subject.key} style={styles.subjectRow}>
              <View style={styles.subjectRowTop}>
                <View style={styles.cardCopy}>
                  <Text style={styles.studentName}>{subject.name}</Text>
                  <Text numberOfLines={1} style={styles.meta}>
                    Dernière leçon : {subject.last_lesson || "Aucune"}
                  </Text>
                </View>
                <Text style={styles.progressValue}>{subjectProgress}%</Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[styles.fill, { width: `${subjectProgress}%` }]}
                />
              </View>
            </View>
          );
        })
      ) : (
        <DataState
          message="Aucune progression par matière n’est encore disponible."
          title="Aucune matière"
        />
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>ACTIVITÉ RÉCENTE</Text>
          <Text style={styles.sectionTitle}>Historique</Text>
        </View>
      </View>
      {history.length ? (
        history.slice(0, 5).map((item, index) => (
          <View
            key={`${item.subject}-${item.title}-${item.date}-${index}`}
            style={styles.historyRow}
          >
            <View style={styles.historyIcon}>
              <MaterialIcons
                color={colors.primary}
                name={item.status === "done" ? "task-alt" : "schedule"}
                size={22}
              />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.studentName}>{item.title || "Leçon"}</Text>
              <Text style={styles.meta}>
                {[item.subject, item.date].filter(Boolean).join(" · ")}
              </Text>
            </View>
            <Text style={styles.historyStatus}>
              {item.status === "done" ? "Terminé" : "En cours"}
            </Text>
          </View>
        ))
      ) : (
        <DataState
          message="Les dernières activités apparaîtront ici."
          title="Aucun historique"
        />
      )}
    </>
  );
}

function TeacherHome({ user }: { user: User }) {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const manualRefreshRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      void reloadKey;
      let active = true;
      if (manualRefreshRef.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      getTeacherDashboard()
        .then((data) => active && setDashboard(data))
        .catch((loadError: unknown) =>
          active &&
          setError(
            getErrorMessage(
              loadError,
              "Impossible de charger l’espace enseignant.",
            ),
          ),
        )
        .finally(() => {
          if (!active) return;
          setLoading(false);
          setRefreshing(false);
          manualRefreshRef.current = false;
        });
      return () => {
        active = false;
      };
    }, [reloadKey]),
  );

  if (loading) return <Loading label="Chargement de l’espace enseignant..." />;
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          colors={[colors.primary]}
          onRefresh={() => {
            manualRefreshRef.current = true;
            setReloadKey((value) => value + 1);
          }}
          refreshing={refreshing}
          tintColor={colors.primary}
        />
      }
      style={styles.container}
    >
      <Hero
        icon="co-present"
        subtitle="Suivez vos élèves et retrouvez vos outils pédagogiques autorisés."
        title={`Bienvenue ${user.first_name || "enseignant"}`}
      />

      {dashboard ? (
        <View style={styles.teacherIdentity}>
          <View style={styles.teacherIdentityIcon}>
            <MaterialIcons
              color={colors.primary}
              name="school"
              size={27}
            />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>
              {dashboard.teacher.first_name} {dashboard.teacher.last_name}
            </Text>
            <Text style={styles.meta}>
              {[dashboard.teacher.diploma, dashboard.teacher.city]
                .filter(Boolean)
                .join(" · ") || "Informations professionnelles à compléter"}
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {dashboard.stats.status || "Actif"}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <MiniStat label="Élèves" value={dashboard?.stats.students ?? 0} />
        <MiniStat label="Leçons" value={dashboard?.stats.lessons ?? 0} />
        <MiniStat label="Défis" value={dashboard?.stats.challenges ?? 0} />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>CENTRE D’ACTIONS PÉDAGOGIQUES</Text>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
        </View>
      </View>
      <View style={styles.teacherActions}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.teacherActionPrimary,
            pressed && styles.teacherActionPressed,
          ]}
          onPress={() =>
            router.push({ pathname: "/assignments", params: { mode: "create" } })
          }
        >
          <View style={styles.teacherActionIconPrimary}>
            <MaterialIcons color={colors.surface} name="edit-note" size={27} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.teacherActionPrimaryTitle}>Créer un exercice</Text>
            <Text style={styles.teacherActionPrimaryText}>
              Choisir un élève, une matière et une leçon.
            </Text>
          </View>
          <MaterialIcons color={colors.surface} name="arrow-forward" size={23} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.teacherActionSecondary,
            pressed && styles.teacherActionPressed,
          ]}
          onPress={() =>
            router.push({ pathname: "/assignments", params: { mode: "list" } })
          }
        >
          <View style={styles.teacherActionIconSecondary}>
            <MaterialIcons color={colors.primary} name="assignment" size={25} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.studentName}>Exercices attribués</Text>
            <Text style={styles.meta}>Consulter les travaux et corriger les remises.</Text>
          </View>
          <MaterialIcons color={colors.primary} name="chevron-right" size={25} />
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>ACCOMPAGNEMENT</Text>
          <Text style={styles.sectionTitle}>Mes élèves</Text>
        </View>
        <Text style={styles.count}>{dashboard?.students.length ?? 0}</Text>
      </View>

      {!dashboard?.students.length ? (
        <DataState
          message="Aucun élève ou groupe confirmé n’est encore associé à votre compte."
          title="Aucun élève associé"
        />
      ) : (
        dashboard.students.map((student) => (
          <View key={student.id} style={styles.studentRow}>
            <View style={styles.avatarSmall}>
              <MaterialIcons color={colors.primary} name="person" size={25} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.meta}>
                {[
                  student.class_name || student.class_code,
                  student.subject,
                  student.school_name,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Informations à confirmer"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={`Créer un exercice pour ${student.name}`}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => [
                styles.studentExerciseButton,
                pressed && styles.teacherActionPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: "/assignments",
                  params: { mode: "create", studentId: String(student.id) },
                })
              }
            >
              <MaterialIcons color={colors.surface} name="add" size={22} />
            </Pressable>
          </View>
        ))
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>CONTENUS PÉDAGOGIQUES</Text>
          <Text style={styles.sectionTitle}>Mes leçons</Text>
        </View>
        <Text style={styles.count}>{dashboard?.lessons.length ?? 0}</Text>
      </View>
      {dashboard?.lessons.length ? (
        dashboard.lessons.map((item, index) => (
          <View key={`${item.title}-${item.meta}-${index}`} style={styles.toolRow}>
            <View style={styles.lessonIcon}>
              <MaterialIcons color={colors.primary} name="menu-book" size={22} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.studentName}>{item.title}</Text>
              {item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
            </View>
          </View>
        ))
      ) : (
        <DataState
          message="Les leçons créées apparaîtront dans cette section."
          title="Aucune leçon récente"
        />
      )}

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.eyebrow}>ENTRAÎNEMENT</Text>
          <Text style={styles.sectionTitle}>Quiz et exercices</Text>
        </View>
        <Text style={styles.count}>{dashboard?.challenges.length ?? 0}</Text>
      </View>
      {dashboard?.challenges.length ? (
        dashboard.challenges.map((item, index) => (
          <View
            key={`${item.title}-${item.meta}-${index}`}
            style={styles.toolRow}
          >
            <View style={styles.challengeIcon}>
              <MaterialIcons
                color={colors.secondary}
                name="emoji-events"
                size={22}
              />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.studentName}>{item.title}</Text>
              {item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
            </View>
          </View>
        ))
      ) : (
        <DataState
          message="Les quiz et exercices créés apparaîtront dans cette section."
          title="Aucune activité récente"
        />
      )}
    </ScrollView>
  );
}

function Hero({
  icon,
  subtitle,
  title,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.hero}>
      <MaterialIcons color={colors.surface} name={icon} size={42} />
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SubscriptionInfo() {
  return (
    <View style={styles.subscription}>
      <MaterialIcons color={colors.primary} name="workspace-premium" size={26} />
      <View style={styles.cardCopy}>
        <Text style={styles.studentName}>Abonnement</Text>
        <Text style={styles.meta}>
          Statut indisponible jusqu’au branchement de l’API abonnement
        </Text>
      </View>
    </View>
  );
}

function Loading({ label }: { label: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.center}>
      <DataState
        message={message}
        onRetry={onRetry}
        title="Chargement impossible"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, padding: 22 },
  loadingText: { color: colors.muted, fontWeight: "800", marginTop: 12 },
  hero: { backgroundColor: colors.primary, borderRadius: 30, padding: 24 },
  heroTitle: { color: colors.surface, fontSize: 27, fontWeight: "900", marginTop: 12 },
  heroSubtitle: { color: "#DDEBFF", fontSize: 14, fontWeight: "700", lineHeight: 21, marginTop: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3, marginTop: 27 },
  eyebrow: { color: colors.secondary, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  sectionTitle: { color: colors.textStrong, fontSize: 23, fontWeight: "900", marginTop: 3 },
  count: { color: colors.primary, backgroundColor: "#EAF1FF", borderRadius: 13, fontSize: 15, fontWeight: "900", overflow: "hidden", paddingHorizontal: 12, paddingVertical: 8 },
  card: { backgroundColor: colors.surface, borderRadius: 25, marginTop: 14, padding: 17, elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 54, height: 54, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 18 },
  avatarText: { color: colors.surface, fontSize: 22, fontWeight: "900" },
  cardCopy: { flex: 1 },
  cardTitle: { color: colors.textStrong, fontSize: 17, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 11, fontWeight: "700", lineHeight: 17, marginTop: 4 },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 17 },
  progressLabel: { color: colors.textStrong, fontSize: 12, fontWeight: "800" },
  progressValue: { color: colors.primary, fontSize: 13, fontWeight: "900" },
  track: { height: 8, overflow: "hidden", backgroundColor: "#E2E8F0", borderRadius: 4, marginTop: 8 },
  fill: { height: "100%", backgroundColor: colors.secondary, borderRadius: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  stat: { flex: 1, alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, padding: 14, elevation: 2 },
  statValue: { color: colors.primary, fontSize: 22, fontWeight: "900" },
  statLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", marginTop: 4, textAlign: "center" },
  studentRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 21, marginTop: 12, padding: 14 },
  avatarSmall: { width: 47, height: 47, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF1FF", borderRadius: 15 },
  studentName: { color: colors.textStrong, fontSize: 15, fontWeight: "900" },
  toolRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 19, marginTop: 10, padding: 14 },
  subscription: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#EAF1FF", borderRadius: 21, marginTop: 22, padding: 16 },
  studentSwitcher: { gap: 10, paddingBottom: 4, paddingTop: 12 },
  studentChip: { minWidth: 145, backgroundColor: colors.surface, borderColor: "#DDE3EC", borderRadius: 18, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 12 },
  studentChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  studentChipPressed: { opacity: 0.86 },
  studentChipName: { color: colors.textStrong, fontSize: 13, fontWeight: "900" },
  studentChipNameSelected: { color: colors.surface },
  studentChipMeta: { color: colors.muted, fontSize: 10, fontWeight: "700", marginTop: 3 },
  studentChipMetaSelected: { color: "#DDEBFF" },
  inlineLoading: { alignItems: "center", justifyContent: "center", minHeight: 170 },
  subjectRow: { backgroundColor: colors.surface, borderRadius: 19, marginTop: 11, padding: 15 },
  subjectRowTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: colors.surface, borderRadius: 18, marginTop: 10, padding: 13 },
  historyIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF1FF", borderRadius: 13 },
  historyStatus: { color: colors.secondary, fontSize: 10, fontWeight: "900" },
  teacherIdentity: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 22, marginTop: 16, padding: 15 },
  teacherIdentityIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF1FF", borderRadius: 16 },
  statusBadge: { backgroundColor: "#E4F7EA", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 },
  statusBadgeText: { color: colors.secondary, fontSize: 10, fontWeight: "900" },
  lessonIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF1FF", borderRadius: 13 },
  challengeIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#E4F7EA", borderRadius: 13 },
  teacherActions: { gap: 11, marginTop: 9 },
  teacherActionPrimary: { flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: colors.primary, borderRadius: 22, padding: 16, elevation: 4 },
  teacherActionSecondary: { flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: colors.surface, borderColor: "#DDE7F5", borderRadius: 22, borderWidth: 1, padding: 15, elevation: 2 },
  teacherActionPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
  teacherActionIconPrimary: { width: 47, height: 47, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 15 },
  teacherActionIconSecondary: { width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF1FF", borderRadius: 14 },
  teacherActionPrimaryTitle: { color: colors.surface, fontSize: 17, fontWeight: "900" },
  teacherActionPrimaryText: { color: "#DDEBFF", fontSize: 11, fontWeight: "700", lineHeight: 17, marginTop: 3 },
  studentExerciseButton: { width: 42, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, borderRadius: 14 },
});
