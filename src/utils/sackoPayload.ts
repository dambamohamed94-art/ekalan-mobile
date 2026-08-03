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

  if (
    !cleanMessage ||
    cleanMessage.length > 2000 ||
    requiredContext.some((value) => !value?.trim())
  ) {
    throw new Error("INVALID_SACKO_PAYLOAD");
  }

  const serializedAnswer =
    context.student_answer === undefined
      ? undefined
      : typeof context.student_answer === "string"
        ? context.student_answer
        : JSON.stringify(context.student_answer);

  return {
    ...context,
    scene_index: Math.min(
      10_000,
      Math.max(0, Math.trunc(Number(context.scene_index) || 0)),
    ),
    question_id: context.question_id?.trim().slice(0, 190) || undefined,
    student_answer: serializedAnswer?.slice(0, 500),
    result: context.result?.trim().slice(0, 30) || undefined,
    message: cleanMessage,
    hint_level: Math.min(5, Math.max(1, Math.trunc(hintLevel) || 1)),
  };
}
