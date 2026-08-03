import { LearningQuiz } from "../types/learning";

export type QuizMedia = {
  label: string;
  image?: string;
  svg?: string;
  value: string;
};

export type QuizPair = {
  left: QuizMedia;
  right: QuizMedia;
};

export type QuizCategory = {
  id: string;
  label: string;
  slots: number;
};

export type QuizToken = QuizMedia & {
  answer?: string;
};

export type NormalizedQuiz = {
  id: string;
  type:
    | "choice"
    | "fill"
    | "pair"
    | "category"
    | "order"
    | "unsupported";
  sourceType: string;
  title: string;
  prompt: string;
  instruction: string;
  explanation: string;
  visual?: QuizMedia;
  choices: QuizMedia[];
  correctAnswer: unknown;
  text: string;
  blanks: string[];
  pairs: QuizPair[];
  categories: QuizCategory[];
  tokens: QuizToken[];
  order: string[];
  raw: LearningQuiz;
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'");
}

function plainText(value: string) {
  return decodeHtml(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function text(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return typeof value === "string" ? plainText(value) : String(value);
  }
  if (typeof value === "boolean") return value ? "Vrai" : "Faux";
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return text(item.label ?? item.text ?? item.value ?? item.name ?? item.title);
  }
  return "";
}

function media(value: unknown): QuizMedia {
  const item =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : undefined;
  const rawString = typeof value === "string" ? decodeHtml(value) : "";
  const embeddedSvgMatch = rawString.match(/<svg[\s\S]*?<\/svg>/i);
  const strongMatch = rawString.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
  const label = strongMatch ? plainText(strongMatch[1]) : text(value);
  const rawImage = item?.image ?? item?.image_url ?? item?.src;
  const image = typeof rawImage === "string" ? decodeHtml(rawImage) : "";
  const embeddedSvg = image.trim().startsWith("<svg") ? image : "";
  const rawSvg = item?.image_svg ?? item?.svg;
  const explicitSvg = typeof rawSvg === "string" ? decodeHtml(rawSvg) : "";
  const svg = explicitSvg || embeddedSvg || embeddedSvgMatch?.[0];
  return {
    label,
    value: text(item?.value ?? item?.label ?? item?.text ?? label),
    image: image && !embeddedSvg
      ? image.startsWith("http")
        ? image
        : `https://ekalan.com/${image.replace(/^\/+/, "")}`
      : undefined,
    svg: svg || undefined,
  };
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function sourceType(question: LearningQuiz) {
  return String(question.question_type ?? question.scene_type ?? question.type ?? "")
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/_/g, "-");
}

function normalizedType(type: string): NormalizedQuiz["type"] {
  if (
    [
      "choose-answer",
      "image-choice",
      "choice",
      "qcm",
      "vrai-faux",
      "true-false",
    ].includes(type)
  ) {
    return "choice";
  }
  if (["fill-missing", "fill-blank", "texte-trous", "texte-a-trou", "texte-a-trous"].includes(type)) return "fill";
  if (["pair-match", "association", "matching"].includes(type)) return "pair";
  if (
    ["click-drop", "schema-drop", "image-schema-drop", "category", "classification", "classement"].includes(
      type,
    )
  ) {
    return "category";
  }
  if (["order-sequence", "order", "sequence", "mise-en-ordre"].includes(type)) return "order";
  return "unsupported";
}

function normalizeCategories(question: LearningQuiz): QuizCategory[] {
  return list(question.categories).map((category, index) => {
    const item =
      category && typeof category === "object"
        ? (category as Record<string, unknown>)
        : undefined;
    return {
      id: text(item?.id ?? item?.value ?? category) || `category-${index}`,
      label: text(item?.label ?? item?.text ?? category) || `Catégorie ${index + 1}`,
      slots: Math.max(1, Number(item?.slots ?? 1) || 1),
    };
  });
}

function normalizeTokens(question: LearningQuiz): QuizToken[] {
  return list(question.items).map((value) => {
    const item =
      value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : undefined;
    return {
      ...media(value),
      answer: text(item?.answer ?? item?.category ?? item?.category_id) || undefined,
    };
  });
}

export function normalizeQuiz(question: LearningQuiz, index = 0): NormalizedQuiz {
  const rawType = sourceType(question);
  const type = normalizedType(rawType);
  const choices = list(question.choices ?? question.options).map(media);
  const explicitAnswer =
    question.correct_answer ?? question.bonne_reponse ?? question.answer;
  const pairs = list(question.pairs).map((value) => {
    const pair = value as Record<string, unknown>;
    return {
      left: media(pair?.left ?? pair?.source ?? pair?.question ?? pair?.a),
      right: media(pair?.right ?? pair?.target ?? pair?.answer ?? pair?.b),
    };
  });
  const blankValues = list(question.blanks).map((value) => {
    const blank = value as Record<string, unknown>;
    return text(blank?.answer ?? value);
  });
  const fallbackAnswers = list(explicitAnswer).map(text);
  const sentence = text(question.text ?? question.sentence);
  const rawQuestionImage = question.image ?? question.illustration_svg;
  const questionImage =
    typeof rawQuestionImage === "string" ? decodeHtml(rawQuestionImage) : "";
  const answers = blankValues.length
    ? blankValues
    : fallbackAnswers.length
      ? fallbackAnswers
      : explicitAnswer !== undefined
        ? [text(explicitAnswer)]
        : [];
  const fillChoices = choices.length
    ? choices
    : [...list(question.alternatives), ...answers]
        .map(media)
        .filter(
          (choice, index, all) =>
            all.findIndex((candidate) => candidate.value === choice.value) === index,
        );

  return {
    id: String(question.question_id ?? question.id ?? `quiz-${index}`),
    type,
    sourceType: rawType,
    title: text(question.title ?? question.titre ?? question.model) || "Quiz EKALAN",
    prompt: text(question.question ?? question.consigne),
    instruction: text(question.instruction),
    explanation:
      text(
        question.explanation ??
          question.explication ??
          question.feedback_success ??
          question.feedback_error,
      ) || "Continue tes efforts.",
    visual: questionImage
      ? media({
          label: "",
          ...(questionImage.trim().startsWith("<svg")
            ? { svg: questionImage }
            : { image: questionImage }),
        })
      : undefined,
    choices:
      type === "choice" &&
      !choices.length &&
      (typeof explicitAnswer === "boolean" || rawType.includes("true"))
        ? [media("Vrai"), media("Faux")]
        : fillChoices,
    correctAnswer:
      type === "choice"
        ? media(explicitAnswer).value
        : typeof explicitAnswer === "boolean"
          ? text(explicitAnswer)
          : explicitAnswer,
    text: sentence,
    blanks: answers,
    pairs,
    categories: normalizeCategories(question),
    tokens: normalizeTokens(question),
    order: list(explicitAnswer).map(text),
    raw: question,
  };
}

export function normalizeQuizList(questions: LearningQuiz[]) {
  return questions.map(normalizeQuiz).filter((question) => question.type !== "unsupported");
}

export function isNativeQuizScene(question: LearningQuiz) {
  return normalizeQuiz(question).type !== "unsupported";
}

export function hasOfficialQuestionId(question: LearningQuiz) {
  return String(question.question_id ?? question.id ?? "").trim().length > 0;
}

export function comparable(value: unknown): string {
  if (Array.isArray(value)) return value.map(comparable).join("|");
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${key}:${comparable(item)}`);
    return entries.join("|");
  }
  return text(value).trim().toLocaleLowerCase("fr");
}
