import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";
import {
  LearningChapter,
  LearningLesson,
  LearningQuiz,
  LearningSubject,
  StudentLessonContext,
} from "../types/learning";
import { getStudentHome } from "./studentService";
import { isNativeQuizScene } from "../quiz/quizAdapter";

type LearningEndpoint =
  | "/student/subject"
  | "/student/chapter"
  | "/student/lesson";

type LearningParams = {
  subject: string;
  chapter?: string;
  index?: string;
  lesson?: string;
};

export type StudentQuizCatalogItem = {
  id: string;
  title: string;
  summary: string;
  subjectKey: string;
  subjectName: string;
  chapterId: string;
  chapterTitle: string;
  lessonIndex?: number;
  lessonId?: string;
  lessonTitle?: string;
  quizIndex: number;
  score?: number;
  isRecommended?: boolean;
};

type EngineLesson = {
  id?: string;
  content_file?: string;
  quiz_scenes?: LearningQuiz[];
  exercise_scenes?: LearningQuiz[];
  course_scenes?: LearningQuiz[];
  video_scenes?: LearningQuiz[];
  revision_scenes?: LearningQuiz[];
};

type ContentEngine = {
  subjectsContent?: Record<
    string,
    {
      chapters?: {
        id?: string;
        levels?: string[];
        lessons?: EngineLesson[];
      }[];
    }
  >;
};

const SERVER_ORIGIN = "https://ekalan.com";

function requireLearningParam(value: string | undefined, label: string) {
  const normalized = value?.trim() ?? "";

  if (!normalized) {
    throw new Error(`Le paramètre ${label} est requis.`);
  }

  return normalized;
}

async function getLearningPayload<T>(
  endpoint: LearningEndpoint,
  params: LearningParams,
): Promise<T> {
  const response = await api.get<ApiResponse<T>>(endpoint, { params });
  return getApiData(response);
}

export async function getStudentSubject(
  subject: string,
): Promise<LearningSubject> {
  const subjectKey = requireLearningParam(subject, "subject");
  const data = await getLearningPayload<{ subject: LearningSubject }>(
    "/student/subject",
    { subject: subjectKey },
  );
  return data.subject;
}

export async function getStudentChapter(
  subject: string,
  chapter: string,
): Promise<LearningChapter> {
  const subjectKey = requireLearningParam(subject, "subject");
  const chapterId = requireLearningParam(chapter, "chapter");
  const data = await getLearningPayload<{ chapter: LearningChapter }>(
    "/student/chapter",
    { subject: subjectKey, chapter: chapterId },
  );
  return data.chapter;
}

export async function getStudentLesson(
  subject: string,
  chapter: string,
  index: string,
  lesson?: string,
): Promise<LearningLesson> {
  const context = await getStudentLessonContext(
    subject,
    chapter,
    index,
    lesson,
  );
  return context.lesson;
}

export async function getStudentLessonContext(
  subject: string,
  chapter: string,
  index: string,
  lesson?: string,
): Promise<StudentLessonContext> {
  const subjectKey = requireLearningParam(subject, "subject");
  const chapterId = requireLearningParam(chapter, "chapter");
  const lessonIndex = String(
    Math.max(0, Number.parseInt(index || "0", 10) || 0),
  );
  return getLearningPayload<StudentLessonContext>(
    "/student/lesson",
    {
      subject: subjectKey,
      chapter: chapterId,
      index: lessonIndex,
      lesson: lesson?.trim() || undefined,
    },
  );
}

function asQuizQuestions(quiz: LearningQuiz): LearningQuiz[] {
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return [quiz];
  }

  return quiz.questions
    .filter(
      (question): question is LearningQuiz =>
        Boolean(question) && typeof question === "object",
    )
    .map((question, questionIndex) => ({
      ...question,
      id: question.id ?? `${String(quiz.id ?? "quiz")}-${questionIndex}`,
      title: question.title ?? quiz.title,
      titre: question.titre ?? quiz.titre,
    }));
}

function selectQuizQuestions(
  quizzes: LearningQuiz[] | undefined,
  quizIndex?: string,
) {
  const available = quizzes ?? [];
  if (!available.length) return [];

  if (quizIndex !== undefined && quizIndex !== "") {
    const selectedIndex = Math.max(0, Number.parseInt(quizIndex, 10) || 0);
    const selected = available[selectedIndex];
    return selected ? asQuizQuestions(selected).filter(isPlayableQuiz) : [];
  }

  return available.flatMap(asQuizQuestions).filter(isPlayableQuiz);
}

function isPlayableQuiz(quiz: LearningQuiz) {
  return Boolean(
    quiz.question ||
      quiz.consigne ||
      quiz.instruction ||
      quiz.sentence ||
      quiz.options?.length ||
      quiz.choices?.length ||
      quiz.pairs?.length ||
      quiz.items?.length ||
      quiz.categories?.length,
  );
}

function engineLevel(classCode: string) {
  const normalized = classCode.trim().toLocaleLowerCase("fr");
  return normalized === "cm1" ? "4e" : normalized === "cm2" ? "5e" : normalized;
}

async function getEngineLessonQuiz(
  context: StudentLessonContext,
  subject: string,
  chapter: string,
  index: string,
  lesson?: string,
  activity: "quiz" | "exercise" | "course" | "video" | "revision" = "quiz",
) {
  const level = engineLevel(context.student.class_code);
  if (!level) return { questions: [] as LearningQuiz[] };

  const engineResponse = await api.get<ContentEngine>(
    `${SERVER_ORIGIN}/data/content.engine.${encodeURIComponent(level)}.json`,
  );
  const subjectData = engineResponse.data.subjectsContent?.[subject];
  const chapterData = subjectData?.chapters?.find(
    (candidate) => String(candidate.id ?? "") === String(chapter).trim(),
  );
  const requestedIndex = Math.max(0, Number.parseInt(index || "0", 10) || 0);
  const requestedLesson = String(lesson ?? context.lesson.id ?? "");
  const lessonData =
    chapterData?.lessons?.find(
      (candidate) =>
        requestedLesson !== "" &&
        String(candidate.id ?? "") === requestedLesson,
    ) ?? chapterData?.lessons?.[requestedIndex];

  if (!lessonData) return { questions: [] as LearningQuiz[] };

  let contentLesson = lessonData;
  if (lessonData.content_file) {
    const contentUrl = new URL(lessonData.content_file, SERVER_ORIGIN).toString();
    const contentResponse = await api.get<EngineLesson>(contentUrl);
    contentLesson = contentResponse.data;
  }

  const sceneMap = {
    quiz: contentLesson.quiz_scenes,
    exercise: contentLesson.exercise_scenes,
    course: contentLesson.course_scenes,
    video: contentLesson.video_scenes,
    revision: contentLesson.revision_scenes,
  };
  const activityScenes = Array.isArray(sceneMap[activity])
    ? sceneMap[activity] ?? []
    : [];
  const questions =
    activity === "quiz" || activity === "exercise"
      ? activityScenes.filter(isNativeQuizScene)
      : activityScenes;
  const requiresWebEngine =
    (activity === "quiz" || activity === "exercise") &&
    activityScenes.some(
    (scene) =>
      String(scene.scene_type ?? scene.type ?? "")
        .trim()
        .toLocaleLowerCase("fr") === "quiz-generator",
    );

  return {
    questions,
    externalQuizUrl:
      requiresWebEngine
        ? `${SERVER_ORIGIN}/dashboard/lecture.html?level=${encodeURIComponent(
            context.student.class_code,
          )}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(
            chapter,
          )}&lesson=${encodeURIComponent(
            requestedLesson,
          )}&index=${encodeURIComponent(index)}&tab=${
            activity === "exercise" ? "exercices" : activity
          }`
        : undefined,
  };
}

export async function getStudentLessonSceneContent(
  subject: string,
  chapter: string,
  index: string,
  lesson: string | undefined,
  activity: "course" | "video" | "revision",
) {
  const context = await getStudentLessonContext(subject, chapter, index, lesson);
  const engine = await getEngineLessonQuiz(
    context,
    subject,
    chapter,
    index,
    lesson,
    activity,
  );
  return { context, content: engine.questions };
}

export async function getStudentLessonExercise(
  subject: string,
  chapter: string,
  index: string,
  lesson?: string,
) {
  const context = await getStudentLessonContext(subject, chapter, index, lesson);
  const engine = await getEngineLessonQuiz(
    context,
    subject,
    chapter,
    index,
    lesson,
    "exercise",
  );
  const apiExercises = (context.lesson.exercices ?? []) as LearningQuiz[];
  return {
    context,
    questions: engine.questions.length ? engine.questions : apiExercises,
    externalQuizUrl: engine.externalQuizUrl,
  };
}

export async function getStudentLessonQuiz(
  subject: string,
  chapter: string,
  index: string,
  lesson?: string,
  quizIndex?: string,
): Promise<{
  context: StudentLessonContext;
  questions: LearningQuiz[];
  externalQuizUrl?: string;
}> {
  const context = await getStudentLessonContext(
    subject,
    chapter,
    index,
    lesson,
  );

  try {
    const engineQuiz = await getEngineLessonQuiz(
      context,
      subject,
      chapter,
      index,
      lesson,
    );
    if (engineQuiz.questions.length || engineQuiz.externalQuizUrl) {
      return {
        context,
        questions: engineQuiz.questions,
        externalQuizUrl: engineQuiz.externalQuizUrl,
      };
    }
  } catch {
    // Repli sur les quiz simples exposés par l'API.
  }

  const contextQuizzes =
    context.lesson.quiz_interactifs?.length
      ? context.lesson.quiz_interactifs
      : context.lesson.quiz;
  let questions = selectQuizQuestions(contextQuizzes, quizIndex);

  if (!questions.length) {
    questions = selectQuizQuestions(context.chapter_assets.quiz, quizIndex);
  }

  if (!questions.length) {
    const chapterData = await getStudentChapter(subject, chapter);
    const requestedIndex = Math.max(0, Number.parseInt(index || "0", 10) || 0);
    const lessonId = String(lesson ?? context.lesson.id ?? "");
    const chapterLesson =
      chapterData.lessons?.find(
        (candidate) =>
          lessonId !== "" && String(candidate.id ?? "") === lessonId,
      ) ??
      chapterData.lessons?.find(
        (candidate) => Number(candidate.index) === requestedIndex,
      ) ??
      chapterData.lessons?.[requestedIndex];
    const lessonQuizzes =
      chapterLesson?.quiz_interactifs?.length
        ? chapterLesson.quiz_interactifs
        : chapterLesson?.quiz;
    questions = selectQuizQuestions(lessonQuizzes, quizIndex);

    if (!questions.length) {
      questions = selectQuizQuestions(
        chapterData.quiz_interactifs?.length
          ? chapterData.quiz_interactifs
          : chapterData.quiz,
        quizIndex,
      );
    }
  }

  let externalQuizUrl: string | undefined;
  if (!questions.length) {
    try {
      const engineQuiz = await getEngineLessonQuiz(
        context,
        subject,
        chapter,
        index,
        lesson,
      );
      questions = engineQuiz.questions;
      externalQuizUrl = engineQuiz.externalQuizUrl;
    } catch {
      // Les données pédagogiques API restent prioritaires lorsque le moteur
      // de contenu officiel est temporairement indisponible.
    }
  }

  return { context, questions, externalQuizUrl };
}

export async function getStudentQuizCatalog(): Promise<StudentQuizCatalogItem[]> {
  const home = await getStudentHome();
  const subjects = await Promise.all(
    (home.subjects ?? []).map(async (subject) => ({
      key: subject.key,
      name: subject.name,
      data: await getStudentSubject(subject.key),
    })),
  );
  const lastLessons = new Map(
    (home.subjects ?? []).map((subject) => [
      subject.key,
      String(subject.last_lesson ?? "").trim().toLocaleLowerCase("fr"),
    ]),
  );
  const catalog: StudentQuizCatalogItem[] = [];

  for (const subject of subjects) {
    for (const chapter of subject.data?.chapters ?? []) {
      (chapter.quiz ?? chapter.quiz_interactifs ?? []).forEach(
        (quiz: LearningQuiz, quizIndex: number) => {
          catalog.push({
            id: String(quiz.id ?? `${subject.key}-${chapter.id}-quiz-${quizIndex}`),
            title: quiz.title ?? quiz.titre ?? `Quiz ${quizIndex + 1}`,
            summary: quiz.summary ?? quiz.description ?? "",
            subjectKey: subject.key,
            subjectName: subject.name,
            chapterId: String(chapter.id),
            chapterTitle: chapter.title ?? "Chapitre",
            quizIndex,
            score: Number.isFinite(Number(quiz.score)) ? Number(quiz.score) : undefined,
          });
        },
      );

      (chapter.lessons ?? []).forEach((lesson, lessonIndex) => {
        (lesson.quiz_interactifs ?? lesson.quiz ?? []).forEach(
          (quiz: LearningQuiz, quizIndex: number) => {
            catalog.push({
              id: String(
                quiz.id ??
                  `${subject.key}-${chapter.id}-${lesson.id ?? lessonIndex}-quiz-${quizIndex}`,
              ),
              title: quiz.title ?? quiz.titre ?? `Quiz ${quizIndex + 1}`,
              summary: quiz.summary ?? quiz.description ?? "",
              subjectKey: subject.key,
              subjectName: subject.name,
              chapterId: String(chapter.id),
              chapterTitle: chapter.title ?? "Chapitre",
              lessonIndex,
              lessonId: String(lesson.id ?? ""),
              lessonTitle: lesson.title ?? `Leçon ${lessonIndex + 1}`,
              quizIndex,
              score: Number.isFinite(Number(quiz.score)) ? Number(quiz.score) : undefined,
              isRecommended:
                Boolean(lastLessons.get(subject.key)) &&
                String(lesson.title ?? "")
                  .trim()
                  .toLocaleLowerCase("fr") === lastLessons.get(subject.key),
            });
          },
        );
      });
    }
  }

  return catalog;
}

export async function markLessonAsDone(data: {
  subject: string;
  chapter: string;
  lesson_id: number | string;
}) {
  const response = await api.post<ApiResponse<{
    message: string;
    lesson_progress_pct: number;
    subject_progress_pct: number;
  }>>("/student/progress", {
    ...data,
    type: "lesson",
    status: "done",
  });

  return getApiData(response);
}
