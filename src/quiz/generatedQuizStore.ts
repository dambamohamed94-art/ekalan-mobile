import { LearningQuiz } from "../types/learning";

const generatedQuizzes = new Map<string, LearningQuiz[]>();

export function saveGeneratedQuiz(questions: LearningQuiz[]) {
  const key = `generated-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  generatedQuizzes.set(key, questions);
  return key;
}

export function getGeneratedQuiz(key: string | undefined) {
  if (!key) return undefined;
  return generatedQuizzes.get(key);
}

export function removeGeneratedQuiz(key: string | undefined) {
  if (key) generatedQuizzes.delete(key);
}
