import { Platform } from "react-native";
import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";

export type QuizFeedback = {
  status: "correct" | "incorrect";
  title: string;
  message: string;
  explanation: string;
  mascot_state: string;
  auto_next: boolean;
  delay_ms: number;
};

export type QuizAnswerResult = {
  correct: boolean;
  validation_source?: "server" | "client";
  attempt_counted?: boolean;
  status?: "in_progress" | "completed";
  xp_earned: number;
  lives_remaining: number;
  score_pct: number;
  answered_questions: number;
  total_questions: number;
  has_next: boolean;
  feedback: QuizFeedback;
};

export type QuizCompletion = {
  session_uuid: string;
  status: "completed";
  score_pct: number;
  correct_answers: number;
  answered_questions: number;
  xp_earned: number;
};

export function createQuizSessionUuid() {
  const template = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return template.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export async function startStudentQuiz(data: {
  session_uuid: string;
  class_code: string;
  subject_key: string;
  chapter_id: string;
  lesson_id: string;
  total_questions: number;
}) {
  const response = await api.post<
    ApiResponse<{
      session_id: number;
      session_uuid: string;
      status: string;
      total_questions: number;
      current_question_index: number;
    }>
  >("/student/quiz/start", {
    ...data,
    current_question_index: 0,
    device_type: "mobile",
    platform: Platform.OS,
    source_type: "lesson_json",
  });
  return getApiData(response);
}

export async function answerStudentQuiz(data: {
  session_uuid: string;
  question_id: string;
  question_type: string;
  question_index: number;
  answer: unknown;
  correct_answer: unknown;
  explanation?: string;
  difficulty?: string;
  is_correct?: boolean;
  response_time_ms?: number;
  hint_used?: boolean;
}) {
  const response = await api.post<ApiResponse<QuizAnswerResult>>(
    "/student/quiz/answer",
    {
      ...data,
      current_question_index: data.question_index + 1,
    },
  );
  return getApiData(response);
}

export async function updateStudentQuizIndex(
  sessionUuid: string,
  currentQuestionIndex: number,
) {
  const response = await api.post<
    ApiResponse<{
      session_uuid: string;
      current_question_index: number;
      total_questions: number;
      status: "in_progress";
    }>
  >("/student/quiz/index", {
    session_uuid: sessionUuid,
    current_question_index: currentQuestionIndex,
  });
  return getApiData(response);
}

export async function completeStudentQuiz(sessionUuid: string) {
  const response = await api.post<ApiResponse<QuizCompletion>>(
    "/student/quiz/complete",
    { session_uuid: sessionUuid },
  );
  return getApiData(response);
}
