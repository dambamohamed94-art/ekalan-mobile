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
import { getStudentDashboard } from "./roleDashboardService";
import { isNativeQuizScene } from "../quiz/quizAdapter";
import { MobileSceneType, toApiSceneType } from "../api/contractAdapters";

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
  revisions?: LearningQuiz[];
  revision?: LearningQuiz[] | LearningQuiz;
  fiche_revision?: LearningQuiz[] | LearningQuiz;
  videos?: LearningQuiz[];
  medias?: LearningQuiz[];
  fiche_cours?: LearningQuiz[] | LearningQuiz;
  content?: LearningQuiz[] | LearningQuiz;
  quiz_interactifs?: LearningQuiz[];
  exercices?: LearningQuiz[];
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
  try {
    const dashboard = await getStudentDashboard();
    data.chapter.lessons = data.chapter.lessons.map((lesson) =>
      applySavedLessonProgress(lesson, dashboard, subjectKey, chapterId),
    );
    const lessonValues = data.chapter.lessons.map(
      (lesson) => Number(lesson.progress_pct ?? 0) || 0,
    );
    (data.chapter as LearningChapter & { progress_pct?: number }).progress_pct =
      lessonValues.length
        ? Math.round(lessonValues.reduce((sum, value) => sum + value, 0) / lessonValues.length)
        : 0;
  } catch {
    // Le contenu du chapitre reste accessible si le dashboard est indisponible.
  }
  return data.chapter;
}

function applySavedLessonProgress(
  lesson: LearningLesson,
  dashboard: Awaited<ReturnType<typeof getStudentDashboard>>,
  subjectKey: string,
  chapterId: string,
) {
  const activity = dashboard.recent_activity?.find(
    (item) =>
      String(item.subject_key ?? "") === subjectKey &&
      String(item.chapter_id ?? "") === chapterId &&
      String(item.lesson_id ?? "") === String(lesson.id) &&
      ["done", "in_progress"].includes(String(item.status ?? "")),
  );
  if (!activity) return lesson;

  const progress = activity.status === "done" ? 100 : 50;
  return { ...lesson, progress_pct: progress, completed: progress >= 100 };
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
  const context = await getLearningPayload<StudentLessonContext>(
    "/student/lesson",
    {
      subject: subjectKey,
      chapter: chapterId,
      index: lessonIndex,
      lesson: lesson?.trim() || undefined,
    },
  );

  // `/student/lesson` exposes pedagogical content but no saved progress.
  // Reconcile it with the canonical dashboard so a focus refresh never resets
  // the lesson bar to 0 after a scene or the lesson has been completed.
  try {
    const dashboard = await getStudentDashboard();
    context.lesson = applySavedLessonProgress(
      context.lesson,
      dashboard,
      subjectKey,
      chapterId,
    );
    context.lesson_progress_pct = context.lesson.progress_pct;
  } catch {
    // The lesson remains usable if the optional dashboard reconciliation fails.
  }

  return context;
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

function officialContentUrl(path: string) {
  const normalized = path.trim();
  if (!normalized) return null;
  const url = new URL(normalized, SERVER_ORIGIN);
  if (url.origin !== SERVER_ORIGIN) {
    throw new Error("Chemin de contenu pédagogique invalide.");
  }
  return url.toString();
}

async function getOfficialLessonScenes(
  context: StudentLessonContext,
  subject: string,
  chapter: string,
  index: string,
  lesson?: string,
  activity: "quiz" | "exercise" | "course" | "video" | "revision" = "quiz",
) {
  const requestedLesson = String(lesson ?? context.lesson.id ?? "");
  let contentLesson: EngineLesson = {};
  if (requestedLesson) {
    try {
      const contentResponse = await api.get<ApiResponse<EngineLesson>>(
        "/student/lesson-content",
        {
          params: {
            subject,
            chapter,
            lesson: requestedLesson,
          },
        },
      );
      contentLesson = getApiData(contentResponse);
    } catch {
      // Certaines anciennes entrées du moteur ne sont pas encore résolues par
      // cette route, alors que leur `content_file` officiel est bien publié.
    }
  }

  if (Object.keys(contentLesson).length === 0) {
    const contentUrl = officialContentUrl(context.lesson.content_file ?? "");
    if (contentUrl) {
      const contentResponse = await api.get<EngineLesson>(contentUrl);
      contentLesson = contentResponse.data;
    }
  }

  if (Object.keys(contentLesson).length === 0) {
    contentLesson = context.lesson as EngineLesson;
  }

  const sceneMap = {
    quiz: contentLesson.quiz_scenes ?? contentLesson.quiz_interactifs,
    exercise: contentLesson.exercise_scenes ?? contentLesson.exercices,
    course:
      contentLesson.course_scenes ??
      contentLesson.fiche_cours ??
      contentLesson.content,
    video:
      contentLesson.video_scenes ??
      contentLesson.videos ??
      contentLesson.medias ??
      context.chapter_assets.medias,
    revision:
      contentLesson.revision_scenes ??
      contentLesson.revisions ??
      contentLesson.revision ??
      contentLesson.fiche_revision,
  };
  const rawScenes = sceneMap[activity];
  const activityScenes = Array.isArray(rawScenes)
    ? rawScenes
    : rawScenes == null
      ? []
      : [rawScenes];
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
  try {
    const engine = await getOfficialLessonScenes(
      context,
      subject,
      chapter,
      index,
      lesson,
      activity,
    );
    return { context, content: engine.questions };
  } catch {
    // Le contexte API contient déjà les fiches pédagogiques. Une ressource
    // externe absente ou temporairement inaccessible ne doit pas masquer la
    // révision, le cours ou la vidéo disponibles côté backend.
    return { context, content: [] };
  }
}

export async function getStudentLessonExercise(
  subject: string,
  chapter: string,
  index: string,
  lesson?: string,
) {
  const context = await getStudentLessonContext(subject, chapter, index, lesson);
  const apiExercises = (context.lesson.exercices ?? []) as LearningQuiz[];
  try {
    const engine = await getOfficialLessonScenes(
      context,
      subject,
      chapter,
      index,
      lesson,
      "exercise",
    );
    return {
      context,
      questions: engine.questions.length ? engine.questions : apiExercises,
      externalQuizUrl: engine.externalQuizUrl,
    };
  } catch {
    // Les exercices déjà présents dans le contexte de leçon restent
    // utilisables lorsque la ressource détaillée est absente ou indisponible.
    return { context, questions: apiExercises, externalQuizUrl: undefined };
  }
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
    const engineQuiz = await getOfficialLessonScenes(
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
      const engineQuiz = await getOfficialLessonScenes(
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
    event_type: "lesson:completed",
    status: "done",
  });

  return getApiData(response);
}

export async function markLessonSceneOpened(data: {
  subject: string;
  chapter: string;
  lesson_id: number | string;
  scene: MobileSceneType;
}) {
  const response = await api.post<ApiResponse<{
    message: string;
    status: "in_progress" | "done";
    lesson_progress_pct: number;
    subject_progress_pct: number;
    scene_progress?: Record<string, unknown> | null;
  }>>("/student/progress", {
    subject: data.subject,
    chapter: data.chapter,
    lesson_id: data.lesson_id,
    current_tab: toApiSceneType(data.scene),
    event_type: "scene:opened",
    status: "in_progress",
  });
  return getApiData(response);
}

export async function markLessonSceneCompleted(data: {
  subject: string;
  chapter: string;
  lesson_id: number | string;
  scene: MobileSceneType;
}) {
  const response = await api.post<ApiResponse<{
    message: string;
    status: "in_progress" | "done";
    lesson_progress_pct: number;
    subject_progress_pct: number;
    scene_progress?: Record<string, unknown> | null;
  }>>("/student/progress", {
    subject: data.subject,
    chapter: data.chapter,
    lesson_id: data.lesson_id,
    current_tab: toApiSceneType(data.scene),
    event_type: "scene:completed",
    status: "in_progress",
  });
  return getApiData(response);
}
