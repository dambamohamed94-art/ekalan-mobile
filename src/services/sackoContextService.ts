import { LearningSubject } from "../types/learning";
import { getStudentSubject } from "./learningService";
import { getStudentHome, StudentHome } from "./studentService";

export type SackoTab =
  | "cours"
  | "revision"
  | "quiz"
  | "exercices"
  | "video";

export type SackoContext = {
  level: string;
  normalized_level: string;
  subject: string;
  chapter: string;
  lesson: string;
  tab: SackoTab;
  scene_index: number;
  question_id?: string;
  student_answer?: unknown;
  result?: string;
  attempted?: boolean;
};

export type SackoContextInput = Partial<SackoContext>;

const SACKO_TABS: SackoTab[] = [
  "cours",
  "revision",
  "quiz",
  "exercices",
  "video",
];

function normalized(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeTab(value: unknown): SackoTab {
  return SACKO_TABS.includes(value as SackoTab)
    ? (value as SackoTab)
    : "cours";
}

function selectSubject(home: StudentHome, requestedSubject?: string) {
  const requested = normalized(requestedSubject);
  if (requested) {
    return home.subjects.find((subject) => subject.key === requested);
  }

  return (
    home.subjects.find((subject) => normalized(subject.last_lesson)) ??
    home.subjects[0]
  );
}

export function selectSackoLessonContext(
  home: StudentHome,
  subject: LearningSubject,
  input: SackoContextInput = {},
): SackoContext {
  const requestedChapter = normalized(input.chapter);
  const requestedLesson = normalized(input.lesson);
  const dashboardSubject = selectSubject(home, input.subject);
  const lastLesson = normalized(dashboardSubject?.last_lesson).toLocaleLowerCase(
    "fr",
  );

  const chapters = subject.chapters ?? [];
  const exactChapter = requestedChapter
    ? chapters.find((chapter) => String(chapter.id) === requestedChapter)
    : undefined;
  const candidateChapters = exactChapter ? [exactChapter] : chapters;

  let selectedChapter = exactChapter;
  let selectedLesson = candidateChapters
    .flatMap((chapter) =>
      (chapter.lessons ?? []).map((lesson) => ({ chapter, lesson })),
    )
    .find(({ lesson }) => {
      if (requestedLesson) {
        return (
          String(lesson.id) === requestedLesson ||
          normalized(lesson.title).toLocaleLowerCase("fr") ===
            requestedLesson.toLocaleLowerCase("fr")
        );
      }

      return (
        Boolean(lastLesson) &&
        normalized(lesson.title).toLocaleLowerCase("fr") === lastLesson
      );
    });

  if (!selectedLesson) {
    selectedChapter ??= candidateChapters[0];
    const lesson = selectedChapter?.lessons?.[0];
    selectedLesson = lesson ? { chapter: selectedChapter, lesson } : undefined;
  }

  if (!selectedLesson) {
    throw new Error("SACKO_CONTEXT_UNAVAILABLE");
  }

  // Le niveau renvoyé par le backend est la source de vérité. Une route
  // profonde ne doit pas pouvoir injecter le contexte d'une autre classe.
  const level = normalized(home.student.class_code);
  if (!level) {
    throw new Error("SACKO_LEVEL_UNAVAILABLE");
  }

  return {
    level,
    normalized_level: level.toLocaleLowerCase("fr"),
    subject: normalized(subject.key),
    chapter: String(selectedLesson.chapter.id),
    lesson: String(selectedLesson.lesson.id),
    tab: normalizeTab(input.tab),
    scene_index: Math.min(
      10_000,
      Math.max(0, Math.trunc(Number(input.scene_index) || 0)),
    ),
    question_id: normalized(input.question_id).slice(0, 190) || undefined,
    student_answer: input.student_answer,
    result: normalized(input.result).slice(0, 30) || undefined,
    attempted: Boolean(input.attempted),
  };
}

export async function resolveSackoContext(
  input: SackoContextInput = {},
): Promise<SackoContext> {
  const home = await getStudentHome();
  const selectedSubject = selectSubject(home, input.subject);

  if (!selectedSubject) {
    throw new Error("SACKO_SUBJECT_UNAVAILABLE");
  }

  const subject = await getStudentSubject(selectedSubject.key);
  return selectSackoLessonContext(home, subject, {
    ...input,
    subject: selectedSubject.key,
  });
}
