export type SackoTutorPayloadContext = {
  level: string;
  normalized_level: string;
  subject: string;
  chapter: string;
  lesson: string;
  tab: "cours" | "revision" | "quiz" | "exercices" | "video";
  scene_index: number;
  question_id?: string;
  student_answer?: unknown;
  result?: string;
  attempted?: boolean;
};

export function buildSackoTutorPayload(
  message: string,
  context: SackoTutorPayloadContext,
  hintLevel = 2,
) {
  const cleanMessage = message.trim();
  const requiredContext = [
    context.level || context.normalized_level,
    context.subject,
    context.chapter,
    context.lesson,
  ];

  if (!cleanMessage || requiredContext.some((value) => !value?.trim())) {
    throw new Error("INVALID_SACKO_PAYLOAD");
  }

  return {
    ...context,
    message: cleanMessage,
    hint_level: Math.min(5, Math.max(1, Math.trunc(hintLevel) || 1)),
  };
}
