import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ErrorMessage } from "../../components/error-message";
import { getErrorMessage } from "../../src/api/errorMessage";
import { readProgressPercent } from "../../src/api/contractAdapters";
import {
  getLinkedDashboardStudents,
  getStudentDashboard,
  getTeacherDashboard,
  TeacherDashboard,
} from "../../src/services/roleDashboardService";
import { sendTeacherMessage } from "../../src/services/messageService";
import { getUser } from "../../src/storage/userStorage";
import { colors } from "../../src/theme/colors";
import {
  LinkedDashboardStudent,
  StudentDashboard,
} from "../../src/types/dashboard";
import { User } from "../../src/types/user";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [teacher, setTeacher] = useState<TeacherDashboard | null>(null);
  const [linkedStudents, setLinkedStudents] = useState<LinkedDashboardStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const selectedStudentIdRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const currentUser = await getUser();
      setUser(currentUser);
      setDashboard(null);
      setTeacher(null);

      if (!currentUser) return;

      if (currentUser.role === "student") {
        setDashboard(await getStudentDashboard());
        return;
      }

      if (currentUser.role === "parent" || currentUser.role === "teacher") {
        const [students, teacherData] = await Promise.all([
          getLinkedDashboardStudents(currentUser.role),
          currentUser.role === "teacher"
            ? getTeacherDashboard()
            : Promise.resolve(null),
        ]);
        setLinkedStudents(students);
        setTeacher(teacherData);
        const targetId = currentUser.role === "teacher"
          ? selectedStudentIdRef.current
          : selectedStudentIdRef.current ?? students[0]?.student_user_id;
        selectedStudentIdRef.current = targetId ?? null;
        setSelectedStudentId(targetId ?? null);
        if (targetId) setDashboard(await getStudentDashboard(targetId));
      }
    } catch (caught: unknown) {
      setError(getErrorMessage(caught, "Impossible de charger le tableau de bord."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const selectStudent = async (studentId: number) => {
    if (studentId === selectedStudentId) return;
    selectedStudentIdRef.current = studentId;
    setSelectedStudentId(studentId);
    setLoading(true);
    setError(null);
    try {
      setDashboard(await getStudentDashboard(studentId));
    } catch (caught: unknown) {
      setError(getErrorMessage(caught, "Impossible de charger cet élève."));
    } finally {
      setLoading(false);
    }
  };

  const showStudentList = () => {
    selectedStudentIdRef.current = null;
    setSelectedStudentId(null);
    setDashboard(null);
    setShowMessageForm(false);
  };

  const sendMessage = async () => {
    if (!selectedStudentId || !messageSubject.trim() || !messageBody.trim()) {
      setError("L’objet et le message sont obligatoires.");
      return;
    }
    setSendingMessage(true);
    setError(null);
    setNotice(null);
    try {
      await sendTeacherMessage({
        studentId: selectedStudentId,
        subject: messageSubject,
        message: messageBody,
      });
      setNotice("Message remis à l’élève.");
      setMessageSubject("");
      setMessageBody("");
      setShowMessageForm(false);
    } catch (caught: unknown) {
      setError(getErrorMessage(caught, "Impossible d’envoyer le message."));
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const progress = dashboard
    ? readProgressPercent({
        progress_pct: dashboard.progress?.global_progress_pct,
        overall_progress: dashboard.overview?.global_progress_pct,
      })
    : 0;
  const subjects = dashboard?.progress?.subjects ?? [];
  const roleTitle = user?.role === "teacher" ? "Espace enseignant" : user?.role === "parent" ? "Suivi parent" : "Mon tableau de bord";

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
    >
      <View style={[styles.hero, Boolean(selectedStudentId) && user?.role === "teacher" && styles.heroCompact]}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}><MaterialIcons name={user?.role === "teacher" ? "school" : user?.role === "parent" ? "family-restroom" : "auto-graph"} size={27} color={colors.primary} /></View>
          <View style={styles.notificationIcon}><MaterialIcons name="notifications-none" size={24} color="#FFFFFF" /><View style={styles.notificationDot} /></View>
        </View>
        <Text style={styles.eyebrow}>{roleTitle}</Text>
        <Text style={styles.title}>
          Bonjour {user?.first_name || dashboard?.student.first_name || ""}
        </Text>
        {teacher ? <Text style={styles.subtitle}>{teacher.stats.students} élève(s) lié(s)</Text> : null}
        <MaterialIcons name="school" size={94} color="rgba(255,255,255,0.20)" style={styles.heroDecoration} />
      </View>

      <ErrorMessage message={error} />
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {user?.role === "parent" ? (
        <View style={styles.parentIntroCard}>
          <View style={styles.parentIntroIcon}><MaterialIcons name="insights" size={25} color="#FFFFFF" /></View>
          <View style={styles.parentIntroCopy}>
            <Text style={styles.parentIntroTitle}>Suivi pédagogique</Text>
            <Text style={styles.parentIntroText}>Consultez les progrès, les acquis et les points à renforcer de chaque enfant.</Text>
          </View>
        </View>
      ) : null}

      {user?.role === "student" ? (
        <Pressable style={styles.assignmentButton} onPress={() => router.push("/assignments")}>
          <MaterialIcons name="assignment" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>Voir mes exercices attribués</Text>
        </Pressable>
      ) : null}

      {(user?.role === "parent" || user?.role === "teacher") && linkedStudents.length > 0 ? (
        <View style={styles.section}>
          {user.role === "teacher" && selectedStudentId ? (
            <Pressable style={styles.listBack} onPress={showStudentList}>
              <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.listBackText}>Mes élèves</Text>
            </Pressable>
          ) : <View style={styles.sectionHeadingRow}><View><Text style={styles.sectionEyebrow}>ACCOMPAGNEMENT</Text><Text style={styles.sectionTitle}>{user.role === "parent" ? "Mes enfants" : "Mes élèves"}</Text></View><Text style={styles.seeAll}>Voir tous  →</Text></View>}
          <View style={user.role === "teacher" ? styles.studentList : styles.studentSelector}>
            {linkedStudents.map((student) => {
              const selected = student.student_user_id === selectedStudentId;
              if (user.role === "teacher" && selectedStudentId && !selected) return null;
              return (
                <Pressable
                  key={student.student_user_id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.studentChip, user.role === "teacher" && styles.teacherStudentCard, selected && styles.studentChipSelected]}
                  onPress={() => void selectStudent(student.student_user_id)}
                >
                  {student.avatar ? <Image source={{ uri: student.avatar }} style={styles.avatar} /> : <View style={styles.avatarFallback}><MaterialIcons name="person" size={25} color={selected ? "#FFFFFF" : colors.primary} /></View>}
                  <View style={styles.studentChipCopy}>
                    <Text style={[styles.studentChipText, selected && styles.studentChipTextSelected]}>{student.full_name || `${student.first_name} ${student.last_name}`}</Text>
                    <Text style={[styles.studentChipMeta, selected && styles.studentChipTextSelected]}>{student.class_name || student.class_code || "Classe non renseignée"}</Text>
                  </View>
                  <MaterialIcons name={selected && user.role === "parent" ? "check-circle" : "chevron-right"} size={24} color={selected ? "#FFFFFF" : colors.primary} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {(user?.role === "parent" || user?.role === "teacher") && linkedStudents.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialIcons name="link-off" size={34} color="#64748B" />
          <Text style={styles.emptyTitle}>Aucun élève lié</Text>
          <Text style={styles.emptyText}>Les données apparaîtront après confirmation de la liaison par EKALAN.</Text>
        </View>
      ) : null}

      {dashboard ? (
        <>
          <View style={styles.identityCard}>
            {dashboard.student.avatar ? <Image source={{ uri: dashboard.student.avatar }} style={styles.identityAvatar} /> : <View style={styles.identityIcon}><MaterialIcons name="person" size={28} color={colors.primary} /></View>}
            <View style={styles.identityText}>
              <Text style={styles.identityName}>{dashboard.student.full_name || `${dashboard.student.first_name} ${dashboard.student.last_name}`}</Text>
              <Text style={styles.identityMeta}>{dashboard.student.class_name || dashboard.student.class_code || "Classe à confirmer"}</Text>
            </View>
          </View>

          {user?.role === "teacher" && selectedStudentId ? (
            <>
              <View style={styles.actionGrid}>
                <ActionButton tone="purple" icon="assignment-add" label="Attribuer un exercice" onPress={() => router.push({ pathname: "/assignments", params: { studentId: String(selectedStudentId) } })} />
                <ActionButton tone="green" icon="mail" label="Contacter l’élève" onPress={() => setShowMessageForm((value) => !value)} />
                <ActionButton tone="orange" wide icon="emoji-events" label="Lancer un challenge" onPress={() => router.push({ pathname: "/assignments", params: { studentId: String(selectedStudentId), mode: "challenge" } })} />
                <ActionButton tone="purple" wide icon="history" label="Voir les exercices attribués et les réponses" onPress={() => router.push({ pathname: "/assignments", params: { studentId: String(selectedStudentId), mode: "history" } })} />
              </View>
              {showMessageForm ? (
                <View style={styles.messageCard}>
                  <Text style={styles.cardHeading}>Nouveau message</Text>
                  <TextInput style={styles.input} value={messageSubject} onChangeText={setMessageSubject} placeholder="Objet" />
                  <TextInput style={[styles.input, styles.messageInput]} value={messageBody} onChangeText={setMessageBody} placeholder="Message pédagogique" multiline />
                  <Pressable disabled={sendingMessage} style={styles.button} onPress={() => void sendMessage()}><Text style={styles.buttonText}>{sendingMessage ? "Envoi…" : "Envoyer le message"}</Text></Pressable>
                </View>
              ) : null}
            </>
          ) : null}

          <PremiumMetricGrid dashboard={dashboard} progress={progress} />

          <Text style={styles.sectionTitle}>Progression par matière</Text>
          {subjects.length ? subjects.map((subject) => {
            const value = readProgressPercent(subject);
            return (
              <View key={subject.subject_key} style={styles.subjectCard}>
                <View style={styles.subjectIcon}><MaterialIcons name={subject.subject_key.toLowerCase().includes("math") ? "calculate" : "translate"} size={28} color="#FFFFFF" /></View>
                <View style={styles.subjectContent}>
                  <View style={styles.subjectHeader}>
                    <Text style={styles.subjectName}>{subject.subject_name || subject.subject_key}</Text>
                    <Text style={styles.subjectValue}>{value}%</Text>
                  </View>
                  <View style={styles.track}><View style={[styles.fill, { width: `${value}%` }]} /></View>
                  <Text style={styles.subjectMeta}>{subject.completed_lessons ?? 0}/{subject.total_lessons ?? 0} leçons terminées</Text>
                </View>
              </View>
            );
          }) : <Text style={styles.emptyText}>Aucune progression disponible pour le moment.</Text>}

          <DashboardDetailSections dashboard={dashboard} />

          {user?.role === "student" ? (
            <Pressable style={styles.button} onPress={() => router.push("/(tabs)/subjects")}>
              <Text style={styles.buttonText}>Continuer mes matières</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

function ActionButton({ icon, label, onPress, tone = "purple", wide = false }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string; onPress: () => void; tone?: "purple" | "green" | "orange"; wide?: boolean }) {
  const toneStyle = tone === "green" ? styles.actionGreen : tone === "orange" ? styles.actionOrange : styles.actionPurple;
  const iconColor = tone === "green" ? "#059669" : tone === "orange" ? "#F59E0B" : "#6D4AFF";
  return <Pressable style={[styles.actionButton, toneStyle, wide && styles.actionButtonWide]} onPress={onPress}><View style={styles.actionIcon}><MaterialIcons name={icon} size={27} color={iconColor} /></View><Text style={styles.actionText}>{label}</Text><MaterialIcons name="arrow-forward" size={19} color={iconColor} /></Pressable>;
}

function DashboardDetailSections({ dashboard }: { dashboard: StudentDashboard }) {
  const lessonsToReview = (dashboard.lesson_progress?.items ?? []).filter((item) => ["to_review", "to_strengthen"].includes(item.status ?? ""));
  const profile = dashboard.pedagogical_profile ?? {};
  const strengths = Array.isArray(profile.strengths) ? profile.strengths : [];
  const weaknesses = Array.isArray(profile.weaknesses) ? profile.weaknesses : [];
  const recommendations = dashboard.recommendations ?? [];
  const activities = dashboard.recent_activity ?? [];

  return (
    <>
      <Text style={styles.sectionTitle}>Vue pédagogique</Text>
      <View style={styles.detailCard}>
        <DetailMetric label="Maîtrise" value={`${Math.round(Number(profile.mastery_score ?? 0))}%`} />
        <DetailMetric label="Régularité" value={`${Math.round(Number(profile.regularity_score ?? 0))}%`} />
        <DetailMetric label="Tendance" value={`${Math.round(Number(profile.trend_pct ?? 0))}%`} />
        {strengths.length ? <Text style={styles.detailText}>Points forts : {strengths.map(readItemLabel).filter(Boolean).join(", ")}</Text> : null}
        {weaknesses.length ? <Text style={styles.detailText}>À renforcer : {weaknesses.map(readItemLabel).filter(Boolean).join(", ")}</Text> : null}
      </View>

      <Text style={styles.sectionTitle}>Leçons à revoir</Text>
      {lessonsToReview.length ? lessonsToReview.slice(0, 6).map((lesson, index) => (
        <View key={`${lesson.lesson_id ?? index}`} style={styles.listCard}>
          <Text style={styles.listCardTitle}>{lesson.lesson_title || lesson.lesson_id || "Leçon"}</Text>
          <Text style={styles.listCardMeta}>{lesson.subject_key || "Matière"} · {lesson.status_label || "À revoir"} · maîtrise {Math.round(lesson.mastery_pct ?? 0)}%</Text>
        </View>
      )) : <Text style={styles.emptyText}>Aucune leçon signalée à revoir.</Text>}

      <Text style={styles.sectionTitle}>Recommandations</Text>
      {recommendations.length ? recommendations.map((item, index) => (
        <View key={`${item.type ?? "recommendation"}-${index}`} style={styles.listCard}>
          <Text style={styles.listCardTitle}>{item.title || "Recommandation"}</Text>
          <Text style={styles.listCardMeta}>{item.message || item.subject_key || "Poursuivre l’accompagnement."}</Text>
        </View>
      )) : <Text style={styles.emptyText}>Aucune recommandation disponible.</Text>}

      <Text style={styles.sectionTitle}>Activité récente</Text>
      {activities.length ? activities.slice(0, 8).map((item, index) => (
        <View key={`${item.type ?? "activity"}-${item.occurred_at ?? index}`} style={styles.activityRow}>
          <MaterialIcons name={item.type === "quiz" ? "quiz" : "history-edu"} size={22} color={colors.primary} />
          <View style={styles.activityCopy}><Text style={styles.listCardTitle}>{item.type === "quiz" ? "Quiz" : "Leçon"} · {item.subject_key || "Matière"}</Text><Text style={styles.listCardMeta}>{item.lesson_id || item.status || "Activité pédagogique"}{item.score_pct != null ? ` · ${Math.round(item.score_pct)}%` : ""}</Text></View>
        </View>
      )) : <Text style={styles.emptyText}>Aucune activité récente.</Text>}
    </>
  );
}

function readItemLabel(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(item.skill_label ?? item.lesson_title ?? item.title ?? item.label ?? "");
  }
  return "";
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return <View style={styles.detailMetric}><Text style={styles.detailMetricValue}>{value}</Text><Text style={styles.detailMetricLabel}>{label}</Text></View>;
}

function PremiumMetricGrid({ dashboard, progress }: { dashboard: StudentDashboard; progress: number }) {
  const profile = dashboard.pedagogical_profile ?? {};
  return <View style={styles.metricGrid}>
    <Stat icon="show-chart" tone="mint" value={`${Math.round(Number(profile.mastery_score ?? 0))}%`} label="Maîtrise" />
    <Stat icon="timeline" tone="blue" value={`${Math.round(Number(profile.regularity_score ?? 0))}%`} label="Régularité" />
    <Stat icon="trending-down" tone="rose" value={`${Math.round(Number(profile.trend_pct ?? 0))}%`} label="Tendance" />
    <Stat icon="trending-up" value={`${progress}%`} label="Progression" />
    <Stat icon="track-changes" value={`${Math.round(dashboard.overview?.quiz_success_rate ?? 0)}%`} label="Réussite quiz" />
    <Stat icon="menu-book" value={`${dashboard.overview?.lessons_mastered ?? 0}`} label="Leçons maîtrisées" />
    <Stat icon="refresh" value={`${dashboard.overview?.lessons_to_review ?? 0}`} label="Leçons à revoir" />
    <Stat icon="military-tech" value={`${dashboard.overview?.skills_mastered ?? 0}`} label="Compétences maîtrisées" />
    <Stat icon="star" tone="gold" value={`${dashboard.overview?.xp ?? 0}`} label="XP" />
  </View>;
}

function Stat({ value, label, icon, tone = "white" }: { value: string; label: string; icon: React.ComponentProps<typeof MaterialIcons>["name"]; tone?: "white" | "mint" | "blue" | "rose" | "gold" }) {
  const toneStyle = tone === "mint" ? styles.statMint : tone === "blue" ? styles.statBlue : tone === "rose" ? styles.statRose : styles.statWhite;
  const iconColor = tone === "mint" ? "#20C997" : tone === "blue" ? "#3B82F6" : tone === "rose" ? "#FF745E" : tone === "gold" ? "#FFAA00" : "#7667EF";
  return <View style={[styles.stat, toneStyle]}><MaterialIcons name={icon} size={21} color={iconColor} /><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text>{tone !== "white" && tone !== "gold" ? <MaterialIcons name="show-chart" size={37} color={iconColor} style={styles.statChart} /> : null}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F7F1EC" },
  content: { padding: 16, paddingTop: 12, paddingBottom: 36 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F1EC" },
  hero: { minHeight: 270, overflow: "hidden", padding: 26, paddingTop: 68, borderRadius: 34, backgroundColor: "#09245F" },
  heroCompact: { minHeight: 210 },
  heroGlow: { position: "absolute", right: -80, bottom: -90, width: 280, height: 280, borderRadius: 140, backgroundColor: "#154DB0", opacity: 0.8 },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#E9F2FF" },
  notificationIcon: { width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)" },
  notificationDot: { position: "absolute", right: 8, top: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#FF5C77" },
  heroDecoration: { position: "absolute", right: 20, bottom: 10, transform: [{ rotate: "-8deg" }] },
  eyebrow: { marginTop: 18, color: "#BFE0FF", fontWeight: "800" },
  title: { marginTop: 5, color: "#FFFFFF", fontSize: 30, fontWeight: "900" },
  subtitle: { marginTop: 14, color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  section: { marginTop: 22 },
  sectionHeadingRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  sectionEyebrow: { color: colors.secondary, fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  sectionTitle: { marginTop: 6, marginBottom: 12, color: "#0F172A", fontSize: 21, fontWeight: "900" },
  seeAll: { marginBottom: 13, color: colors.primary, fontSize: 12, fontWeight: "900" },
  studentSelector: { gap: 11, paddingVertical: 4 },
  studentList: { gap: 10 },
  teacherStudentCard: { width: "100%", minHeight: 82, flexDirection: "row", alignItems: "center", gap: 12 },
  studentChipCopy: { flex: 1 },
  studentChip: { width: "100%", minHeight: 80, flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 20, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EEF7", shadowColor: "#123E8A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 3 },
  studentChipSelected: { backgroundColor: "#10297B", borderColor: "#1664D9" },
  avatar: { width: 50, height: 50, borderRadius: 16, backgroundColor: "#E9F2FF" },
  avatarFallback: { width: 50, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#E9F2FF" },
  studentChipText: { color: "#0F172A", fontWeight: "900" },
  studentChipTextSelected: { color: "#FFFFFF" },
  studentChipMeta: { marginTop: 4, color: "#64748B", fontSize: 12, fontWeight: "700" },
  emptyCard: { marginTop: 22, alignItems: "center", padding: 24, borderRadius: 24, backgroundColor: "#FFFFFF" },
  emptyTitle: { marginTop: 10, color: "#0F172A", fontSize: 19, fontWeight: "900" },
  emptyText: { marginTop: 7, color: "#64748B", lineHeight: 21, textAlign: "center" },
  identityCard: { marginTop: 18, flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 22, backgroundColor: "#FFFFFF", shadowColor: "#123E8A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  identityIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#E3F0FF" },
  identityAvatar: { width: 52, height: 52, borderRadius: 17, backgroundColor: "#E3F0FF" },
  identityText: { flex: 1, marginLeft: 13 },
  identityName: { color: "#0F172A", fontSize: 19, fontWeight: "900" },
  identityMeta: { marginTop: 3, color: "#64748B", fontWeight: "700" },
  metricGrid: { marginTop: 18, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 13 },
  stat: { width: "31.5%", minHeight: 126, overflow: "hidden", alignItems: "center", justifyContent: "center", padding: 9, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.9)", shadowColor: "#0B2556", shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 5 },
  statWhite: { backgroundColor: "#FFFFFF" },
  statMint: { backgroundColor: "#E0FBF3" },
  statBlue: { backgroundColor: "#E9F2FF" },
  statRose: { backgroundColor: "#FFF0F0" },
  statValue: { zIndex: 1, marginTop: 4, color: colors.primaryDark, fontSize: 22, fontWeight: "900" },
  statLabel: { zIndex: 1, marginTop: 3, color: "#52627A", fontSize: 10, lineHeight: 13, fontWeight: "800", textAlign: "center" },
  statChart: { position: "absolute", bottom: 4, opacity: 0.45, transform: [{ scaleX: 1.9 }] },
  subjectCard: { marginBottom: 13, flexDirection: "row", alignItems: "center", gap: 13, padding: 15, borderRadius: 20, backgroundColor: "#FFFFFF", shadowColor: "#123E8A", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 15, elevation: 4 },
  subjectIcon: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#57DCC0" },
  subjectContent: { flex: 1 },
  subjectHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  subjectName: { flex: 1, color: "#0F172A", fontWeight: "900", textTransform: "capitalize" },
  subjectValue: { color: colors.primary, fontWeight: "900" },
  track: { marginTop: 12, height: 9, overflow: "hidden", borderRadius: 9, backgroundColor: "#E4EBF4" },
  fill: { height: "100%", borderRadius: 9, backgroundColor: colors.success },
  subjectMeta: { marginTop: 8, color: "#64748B", fontSize: 12, fontWeight: "700" },
  button: { marginTop: 20, alignItems: "center", padding: 16, borderRadius: 18, backgroundColor: colors.primary },
  buttonText: { color: "#FFFFFF", fontWeight: "900" },
  assignmentButton: { marginTop: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 15, borderRadius: 18, backgroundColor: colors.success },
  notice: { marginTop: 12, padding: 12, borderRadius: 12, color: "#166534", backgroundColor: "#DCFCE7", fontWeight: "800" },
  parentIntroCard: { marginTop: -24, marginHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 13, padding: 17, borderRadius: 22, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E8EEF7", shadowColor: "#0B2556", shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  parentIntroIcon: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: colors.secondary },
  parentIntroCopy: { flex: 1 },
  parentIntroTitle: { color: "#0F172A", fontSize: 16, fontWeight: "900" },
  parentIntroText: { marginTop: 4, color: "#64748B", fontSize: 12, lineHeight: 17, fontWeight: "700" },
  listBack: { marginTop: 18, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 7, alignSelf: "flex-start", paddingVertical: 8 },
  listBackText: { color: colors.primary, fontWeight: "900" },
  actionGrid: { marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 9 },
  actionButton: { width: "48%", minHeight: 126, padding: 16, justifyContent: "space-between", borderRadius: 22, borderWidth: 1, borderColor: "#E9E7FF" },
  actionButtonWide: { width: "100%", minHeight: 88, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 14 },
  actionPurple: { backgroundColor: "#F0E9FF" },
  actionGreen: { backgroundColor: "#E2FAF3" },
  actionOrange: { backgroundColor: "#FFF2DD" },
  actionIcon: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: "rgba(255,255,255,0.72)" },
  actionText: { flex: 1, color: "#0F172A", fontSize: 14, lineHeight: 19, fontWeight: "900" },
  messageCard: { marginTop: 14, padding: 17, borderRadius: 20, backgroundColor: "#FFFFFF" },
  cardHeading: { color: "#0F172A", fontSize: 18, fontWeight: "900" },
  input: { marginTop: 11, paddingHorizontal: 13, paddingVertical: 12, borderRadius: 13, backgroundColor: "#F1F5F9", color: "#0F172A" },
  messageInput: { minHeight: 100, textAlignVertical: "top" },
  detailCard: { flexDirection: "row", flexWrap: "wrap", gap: 9, padding: 16, borderRadius: 20, backgroundColor: "#FFFFFF" },
  detailMetric: { width: "30%", minWidth: 80, padding: 10, borderRadius: 14, backgroundColor: "#EFF6FF" },
  detailMetricValue: { color: colors.primary, fontSize: 19, fontWeight: "900" },
  detailMetricLabel: { marginTop: 3, color: "#64748B", fontSize: 11, fontWeight: "800" },
  detailText: { width: "100%", color: "#475569", lineHeight: 20, fontWeight: "700" },
  listCard: { marginBottom: 9, padding: 15, borderRadius: 17, backgroundColor: "#FFFFFF" },
  listCardTitle: { color: "#0F172A", fontWeight: "900" },
  listCardMeta: { marginTop: 4, color: "#64748B", lineHeight: 18, fontSize: 12, fontWeight: "700" },
  activityRow: { marginBottom: 9, flexDirection: "row", alignItems: "center", gap: 11, padding: 14, borderRadius: 17, backgroundColor: "#FFFFFF" },
  activityCopy: { flex: 1 },
});
