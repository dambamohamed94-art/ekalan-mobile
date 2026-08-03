import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";
import {
  ExerciseCatalog,
  TeacherAssignment,
} from "../types/teacherAssignments";

export async function getStudentAssignments() {
  const response = await api.get<
    ApiResponse<{ assignments: TeacherAssignment[] }>
  >("/student/assigned-exercises");
  return getApiData(response).assignments;
}

export async function openStudentAssignment(assignmentId: number) {
  const response = await api.post<
    ApiResponse<{ assignment: TeacherAssignment }>
  >(`/student/assigned-exercises/${assignmentId}/open`);
  return getApiData(response).assignment;
}

export async function submitStudentAssignment(
  assignmentId: number,
  answerText: string,
) {
  const form = new FormData();
  form.append("answer_text", answerText.trim());
  const response = await api.post<
    ApiResponse<{ assignment_id: number; status: "submitted" }>
  >(`/student/assigned-exercises/${assignmentId}/submit`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return getApiData(response);
}

export async function getTeacherExerciseCatalog(studentId: number) {
  const response = await api.get<ApiResponse<ExerciseCatalog>>(
    "/teacher/student-exercise-catalog",
    { params: { student_id: studentId } },
  );
  return getApiData(response);
}

export async function assignExercise(data: {
  student_user_id: number;
  subject_key: string;
  chapter_id: string;
  lesson_id: string;
  title: string;
  instructions?: string;
  due_at?: string;
}) {
  const response = await api.post<
    ApiResponse<{
      assignment_id: number;
      status: string;
      due_at?: string | null;
      duplicate: boolean;
    }>
  >("/teacher/actions", {
    action: "assign_exercise",
    target_scope: "student",
    ...data,
  });
  return getApiData(response);
}

export async function getTeacherStudentAssignments(studentId: number) {
  const response = await api.get<
    ApiResponse<{ assignments: TeacherAssignment[] }>
  >("/teacher/student-exercise-assignments", {
    params: { student_id: studentId },
  });
  return getApiData(response).assignments;
}

export async function reviewStudentAssignment(
  assignmentId: number,
  scorePct: number,
  feedback: string,
) {
  const response = await api.post<
    ApiResponse<{ assignment_id: number; status: "completed"; score_pct: number }>
  >(`/teacher/student-exercise-assignments/${assignmentId}/review`, {
    score_pct: scorePct,
    feedback: feedback.trim(),
  });
  return getApiData(response);
}
