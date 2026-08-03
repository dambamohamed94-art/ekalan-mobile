import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ErrorMessage } from "../components/error-message";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import {
  assignExercise,
  getStudentAssignments,
  getTeacherExerciseCatalog,
  getTeacherStudentAssignments,
  openStudentAssignment,
  reviewStudentAssignment,
  submitStudentAssignment,
} from "../src/services/assignmentService";
import { getLinkedDashboardStudents } from "../src/services/roleDashboardService";
import { getUser } from "../src/storage/userStorage";
import { colors } from "../src/theme/colors";
import { LinkedDashboardStudent } from "../src/types/dashboard";
import {
  ExerciseCatalog,
  TeacherAssignment,
} from "../src/types/teacherAssignments";
import { User } from "../src/types/user";

export default function AssignmentsPage() {
  const params = useLocalSearchParams<{ mode?: string; studentId?: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [students, setStudents] = useState<LinkedDashboardStudent[]>([]);
  const [studentId, setStudentId] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [catalog, setCatalog] = useState<ExerciseCatalog | null>(null);
  const [subjectKey, setSubjectKey] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [scores, setScores] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadStudentAssignments = useCallback(async () => {
    setAssignments(await getStudentAssignments());
  }, []);

  const loadTeacherStudent = useCallback(async (targetId: number) => {
    const [nextCatalog, nextAssignments] = await Promise.all([
      getTeacherExerciseCatalog(targetId),
      getTeacherStudentAssignments(targetId),
    ]);
    setCatalog(nextCatalog);
    setAssignments(nextAssignments);
    const firstSubject = nextCatalog.subjects[0];
    const firstChapter = firstSubject?.chapters[0];
    const firstLesson = firstChapter?.lessons[0];
    setSubjectKey(firstSubject?.key ?? "");
    setChapterId(firstChapter?.id ?? "");
    setLessonId(firstLesson?.id ?? "");
    setTitle(firstLesson?.title ?? "");
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await getUser();
      setUser(currentUser);
      if (currentUser?.role === "student") {
        await loadStudentAssignments();
      } else if (currentUser?.role === "teacher") {
        const linked = await getLinkedDashboardStudents("teacher");
        setStudents(linked);
        const requestedStudentId = Number(params.studentId);
        const targetId =
          linked.find(
            (student) =>
              Number.isInteger(requestedStudentId) &&
              student.student_user_id === requestedStudentId,
          )?.student_user_id ?? linked[0]?.student_user_id ?? null;
        setStudentId(targetId);
        if (targetId) await loadTeacherStudent(targetId);
      }
    } catch (caught: unknown) {
      setError(getErrorMessage(caught, "Impossible de charger les exercices."));
    } finally {
      setLoading(false);
    }
  }, [loadStudentAssignments, loadTeacherStudent, params.studentId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const subject = catalog?.subjects.find((item) => item.key === subjectKey);
  const chapter = subject?.chapters.find((item) => item.id === chapterId);
  const lesson = chapter?.lessons.find((item) => item.id === lessonId);

  const pendingCount = useMemo(
    () => assignments.filter((item) => item.status === "submitted").length,
    [assignments],
  );

  const selectStudent = async (targetId: number) => {
    setStudentId(targetId);
    setLoading(true);
    setError(null);
    try { await loadTeacherStudent(targetId); }
    catch (caught: unknown) { setError(getErrorMessage(caught, "Impossible de charger cet élève.")); }
    finally { setLoading(false); }
  };

  const submitAnswer = async (assignment: TeacherAssignment) => {
    const answer = answers[assignment.id]?.trim() ?? "";
    if (!answer) return setError("Écris une réponse avant de l’envoyer.");
    setSubmitting(true); setError(null); setNotice(null);
    try {
      await openStudentAssignment(assignment.id);
      await submitStudentAssignment(assignment.id, answer);
      setNotice("Réponse envoyée au professeur.");
      await loadStudentAssignments();
    } catch (caught: unknown) { setError(getErrorMessage(caught, "Impossible d’envoyer la réponse.")); }
    finally { setSubmitting(false); }
  };

  const createAssignment = async () => {
    if (!studentId || !subjectKey || !chapterId || !lessonId || !title.trim()) {
      return setError("Sélectionne un élève, une matière, un chapitre et une leçon.");
    }
    setSubmitting(true); setError(null); setNotice(null);
    try {
      const result = await assignExercise({ student_user_id: studentId, subject_key: subjectKey, chapter_id: chapterId, lesson_id: lessonId, title, instructions });
      setNotice(result.duplicate ? "Cet exercice est déjà attribué à l’élève." : "Exercice attribué avec succès.");
      setAssignments(await getTeacherStudentAssignments(studentId));
    } catch (caught: unknown) { setError(getErrorMessage(caught, "Impossible d’attribuer l’exercice.")); }
    finally { setSubmitting(false); }
  };

  const review = async (assignment: TeacherAssignment) => {
    const score = Number(scores[assignment.id]);
    if (!Number.isInteger(score) || score < 0 || score > 100) return setError("La note doit être comprise entre 0 et 100.");
    setSubmitting(true); setError(null); setNotice(null);
    try {
      await reviewStudentAssignment(assignment.id, score, feedbacks[assignment.id] ?? "");
      setNotice("Correction envoyée à l’élève.");
      if (studentId) setAssignments(await getTeacherStudentAssignments(studentId));
    } catch (caught: unknown) { setError(getErrorMessage(caught, "Impossible d’enregistrer la correction.")); }
    finally { setSubmitting(false); }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable style={styles.back} onPress={() => goBackOrReplace("/(tabs)/subjects")}><MaterialIcons name="arrow-back" size={24} color={colors.primary} /><Text style={styles.backText}>Retour</Text></Pressable>
      <View style={styles.hero}><MaterialIcons name="assignment" size={36} color="#FFFFFF" /><Text style={styles.heroTitle}>{user?.role === "teacher" ? "Exercices de mes élèves" : "Mes exercices attribués"}</Text>{user?.role === "teacher" ? <Text style={styles.heroMeta}>{pendingCount} remise(s) à corriger</Text> : null}</View>
      <ErrorMessage message={error} />
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      {user?.role === "teacher" ? (
        <>
          <View style={styles.modeHeader}>
            <MaterialIcons
              color={colors.primary}
              name={["list", "history"].includes(params.mode ?? "") ? "history" : "edit-note"}
              size={25}
            />
            <View style={styles.modeHeaderCopy}>
              <Text style={styles.modeTitle}>
                {["list", "history"].includes(params.mode ?? "")
                  ? "Historique des exercices attribués"
                  : "Créer et attribuer un exercice"}
              </Text>
              <Text style={styles.modeText}>
                {["list", "history"].includes(params.mode ?? "")
                  ? "Consulte tous les travaux, les réponses remises et les corrections de l’élève."
                  : "Le catalogue correspond à la classe réelle de l’élève sélectionné."}
              </Text>
            </View>
          </View>
          <Text style={styles.heading}>Choisir un élève</Text>
          <ScrollView horizontal contentContainerStyle={styles.row} showsHorizontalScrollIndicator={false}>{students.map((student) => <Pressable key={student.student_user_id} style={[styles.chip, studentId === student.student_user_id && styles.chipActive]} onPress={() => void selectStudent(student.student_user_id)}><Text style={[styles.chipText, studentId === student.student_user_id && styles.chipTextActive]}>{student.full_name || `${student.first_name} ${student.last_name}`}</Text></Pressable>)}</ScrollView>
          {studentId && catalog && !["list", "history"].includes(params.mode ?? "") ? <View style={styles.card}>
            <Text style={styles.cardTitle}>Attribuer un exercice</Text>
            <Text style={styles.label}>Matière</Text><ScrollView horizontal contentContainerStyle={styles.row}>{catalog.subjects.map((item) => <Pressable key={item.key} style={[styles.smallChip, subjectKey === item.key && styles.smallChipActive]} onPress={() => { const nextChapter=item.chapters[0]; const nextLesson=nextChapter?.lessons[0]; setSubjectKey(item.key); setChapterId(nextChapter?.id ?? ""); setLessonId(nextLesson?.id ?? ""); setTitle(nextLesson?.title ?? ""); }}><Text>{item.name}</Text></Pressable>)}</ScrollView>
            <Text style={styles.label}>Chapitre</Text><ScrollView horizontal contentContainerStyle={styles.row}>{subject?.chapters.map((item) => <Pressable key={item.id} style={[styles.smallChip, chapterId === item.id && styles.smallChipActive]} onPress={() => { const nextLesson=item.lessons[0]; setChapterId(item.id); setLessonId(nextLesson?.id ?? ""); setTitle(nextLesson?.title ?? ""); }}><Text>{item.title}</Text></Pressable>)}</ScrollView>
            <Text style={styles.label}>Leçon</Text><ScrollView horizontal contentContainerStyle={styles.row}>{chapter?.lessons.map((item) => <Pressable key={item.id} style={[styles.smallChip, lessonId === item.id && styles.smallChipActive]} onPress={() => { setLessonId(item.id); setTitle(item.title); }}><Text>{item.title}</Text></Pressable>)}</ScrollView>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={params.mode === "challenge" ? "Titre du challenge" : "Titre"} />
            <TextInput style={[styles.input, styles.multiline]} value={instructions} onChangeText={setInstructions} placeholder="Consignes pour l’élève" multiline />
            <Pressable disabled={submitting || !lesson} style={styles.button} onPress={() => void createAssignment()}><Text style={styles.buttonText}>Attribuer l’exercice</Text></Pressable>
          </View> : !["list", "history"].includes(params.mode ?? "") ? <Text style={styles.empty}>Aucun élève lié.</Text> : null}
        </>
      ) : null}

      <Text style={styles.heading}>{user?.role === "teacher" ? "Travaux attribués" : "Travaux reçus"}</Text>
      {!assignments.length ? <Text style={styles.empty}>Aucun exercice pour le moment.</Text> : assignments.map((assignment) => <View key={assignment.id} style={styles.card}>
        <View style={styles.assignmentHeader}><Text style={styles.cardTitle}>{assignment.title}</Text><Text style={styles.status}>{readAssignmentStatus(assignment.status)}</Text></View>
        <Text style={styles.meta}>{assignment.subject_key} · {assignment.instructions || "Aucune consigne supplémentaire"}</Text>
        {assignment.created_at ? <Text style={styles.dateText}>Attribué le {formatAssignmentDate(assignment.created_at)}</Text> : null}
        {assignment.answer_text || assignment.submission ? <View style={styles.responseCard}><Text style={styles.responseLabel}>Réponse de l’élève</Text><Text style={styles.responseText}>{assignment.answer_text || assignment.submission}</Text>{assignment.submitted_at ? <Text style={styles.responseDate}>Remise le {formatAssignmentDate(assignment.submitted_at)}</Text> : null}</View> : <Text style={styles.waitingText}>Aucune réponse remise pour le moment.</Text>}
        {user?.role === "student" && ["assigned", "opened"].includes(assignment.status) ? <><TextInput style={[styles.input, styles.multiline]} value={answers[assignment.id] ?? ""} onChangeText={(value) => setAnswers((current) => ({ ...current, [assignment.id]: value }))} placeholder="Écris ta réponse" multiline /><Pressable disabled={submitting} style={styles.button} onPress={() => void submitAnswer(assignment)}><Text style={styles.buttonText}>Envoyer au professeur</Text></Pressable></> : null}
        {user?.role === "teacher" && assignment.status === "submitted" ? <><TextInput style={styles.input} value={scores[assignment.id] ?? ""} onChangeText={(value) => setScores((current) => ({ ...current, [assignment.id]: value }))} keyboardType="number-pad" placeholder="Note sur 100" /><TextInput style={[styles.input, styles.multiline]} value={feedbacks[assignment.id] ?? ""} onChangeText={(value) => setFeedbacks((current) => ({ ...current, [assignment.id]: value }))} placeholder="Commentaire" multiline /><Pressable disabled={submitting} style={styles.button} onPress={() => void review(assignment)}><Text style={styles.buttonText}>Envoyer la correction</Text></Pressable></> : null}
        {assignment.status === "completed" && assignment.score_pct != null ? <View style={styles.correctionCard}><Text style={styles.score}>Résultat : {assignment.score_pct}/100</Text>{assignment.teacher_feedback || assignment.feedback ? <Text style={styles.correctionText}>{assignment.teacher_feedback || assignment.feedback}</Text> : null}</View> : null}
      </View>)}
    </ScrollView>
  );
}

function readAssignmentStatus(status: TeacherAssignment["status"]) {
  return ({ assigned: "Attribué", opened: "Ouvert", submitted: "Remis", completed: "Corrigé", cancelled: "Annulé" } as const)[status] ?? status;
}

function formatAssignmentDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:"#F7F1EC"},content:{padding:20,paddingBottom:50},center:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#F7F1EC"},back:{flexDirection:"row",alignItems:"center",gap:7,paddingVertical:12},backText:{color:colors.primary,fontWeight:"900"},hero:{padding:22,borderRadius:26,backgroundColor:colors.primary},heroTitle:{marginTop:9,color:"#FFF",fontSize:25,fontWeight:"900"},heroMeta:{marginTop:5,color:"#DCEBFF",fontWeight:"700"},heading:{marginTop:24,marginBottom:10,fontSize:21,fontWeight:"900",color:"#0F172A"},row:{gap:8,paddingVertical:4},chip:{paddingHorizontal:15,paddingVertical:12,borderRadius:16,backgroundColor:"#FFF"},chipActive:{backgroundColor:colors.primary},chipText:{fontWeight:"800",color:"#0F172A"},chipTextActive:{color:"#FFF"},smallChip:{maxWidth:210,padding:10,borderRadius:13,backgroundColor:"#EDF2F8"},smallChipActive:{borderWidth:2,borderColor:colors.success},card:{marginTop:12,padding:18,borderRadius:22,backgroundColor:"#FFF"},cardTitle:{flex:1,fontSize:18,fontWeight:"900",color:"#0F172A"},label:{marginTop:14,marginBottom:3,color:"#475569",fontWeight:"800"},input:{marginTop:12,paddingHorizontal:14,paddingVertical:12,borderRadius:14,backgroundColor:"#F1F5F9",color:"#0F172A"},multiline:{minHeight:90,textAlignVertical:"top"},button:{marginTop:14,alignItems:"center",padding:14,borderRadius:15,backgroundColor:colors.primary},buttonText:{color:"#FFF",fontWeight:"900"},assignmentHeader:{flexDirection:"row",gap:10},status:{color:colors.success,fontWeight:"900",textTransform:"capitalize"},meta:{marginTop:7,color:"#64748B",lineHeight:20},answer:{marginTop:12,padding:12,borderRadius:12,backgroundColor:"#EFF6FF",color:"#0F172A"},score:{marginTop:12,color:colors.success,fontSize:18,fontWeight:"900"},notice:{marginTop:14,padding:12,borderRadius:12,backgroundColor:"#DCFCE7",color:"#166534",fontWeight:"800"},empty:{padding:20,color:"#64748B",textAlign:"center"}
  ,modeHeader:{flexDirection:"row",alignItems:"flex-start",gap:12,marginTop:16,padding:15,borderRadius:19,backgroundColor:"#EAF1FF"},modeHeaderCopy:{flex:1},modeTitle:{color:"#0F172A",fontSize:17,fontWeight:"900"},modeText:{marginTop:4,color:"#475569",fontSize:12,lineHeight:18,fontWeight:"700"},dateText:{marginTop:7,color:"#94A3B8",fontSize:12,fontWeight:"700"},responseCard:{marginTop:13,padding:14,borderRadius:15,backgroundColor:"#EFF6FF",borderLeftWidth:4,borderLeftColor:colors.primary},responseLabel:{color:colors.primary,fontSize:12,fontWeight:"900",textTransform:"uppercase"},responseText:{marginTop:6,color:"#0F172A",fontSize:15,lineHeight:22},responseDate:{marginTop:7,color:"#64748B",fontSize:11,fontWeight:"700"},waitingText:{marginTop:12,color:"#94A3B8",fontStyle:"italic"},correctionCard:{marginTop:12,padding:13,borderRadius:14,backgroundColor:"#ECFDF5"},correctionText:{marginTop:5,color:"#166534",lineHeight:20,fontWeight:"700"}
});
