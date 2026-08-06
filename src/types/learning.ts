export type PedagogicalContent = unknown;

export type StudentLearningIdentity = {
  id: number;
  first_name: string;
  last_name: string;
  class_code: string;
  name?: string;
};

export type LearningResource = {
  id?: string | number;
  title?: string;
  titre?: string;
  summary?: string;
  description?: string;
  url?: string;
  video_url?: string;
  src?: string;
  link?: string;
  [key: string]: unknown;
};

export type LearningQuiz = LearningResource & {
  question_id?: string | number;
  question_type?: string;
  scene_type?: string;
  type?: string;
  level?: string;
  question?: string;
  consigne?: string;
  options?: PedagogicalContent[];
  choices?: PedagogicalContent[];
  bonne_reponse?: PedagogicalContent;
  correct_answer?: PedagogicalContent;
  answer?: PedagogicalContent;
  instruction?: string;
  sentence?: string;
  explanation?: string;
  explication?: string;
  feedback_success?: string;
  feedback_error?: string;
  pairs?: {
    left: PedagogicalContent;
    right: PedagogicalContent;
  }[];
  questions?: PedagogicalContent[];
  items?: PedagogicalContent[];
  categories?: PedagogicalContent[];
  blanks?: PedagogicalContent[];
  alternatives?: PedagogicalContent[];
  text?: string;
  model?: string;
  image?: string;
  illustration_svg?: string;
  score?: number | string;
};

export type LearningExercise = LearningResource & {
  questions?: PedagogicalContent[];
};

export type LearningVideo = LearningResource;

export type LearningLesson = {
  id: string;
  index: number;
  total?: number;
  title: string;
  summary: string;
  objectifs: PedagogicalContent[];
  fiche_cours: PedagogicalContent | null;
  content: PedagogicalContent;
  content_file?: string | null;
  activites_interactives: PedagogicalContent[];
  quiz_interactifs: LearningQuiz[];
  quiz?: LearningQuiz[];
  exercices: LearningExercise[];
  videos: LearningVideo[];
  fiche_revision: PedagogicalContent | null;
  progress_pct?: number;
  progress_percent?: number;
  progress_percentage?: number;
  completed?: boolean;
  is_completed?: boolean;
};

export type LearningChapter = {
  id: string;
  title: string;
  description: string;
  section?: string;
  competences: PedagogicalContent[];
  lessons: LearningLesson[];
  fiches?: LearningResource[];
  exos?: LearningExercise[];
  exercices: LearningExercise[];
  quiz?: LearningQuiz[];
  quiz_interactifs?: LearningQuiz[];
  medias: LearningVideo[];
  fiche_revision: PedagogicalContent | null;
};

export type LearningSubject = {
  key: string;
  name: string;
  description: string;
  counts: {
    chapters: number;
    lessons: number;
    fiches: number;
    exos: number;
    quiz: number;
  };
  chapters: LearningChapter[];
};

export type StudentLessonContext = {
  student: StudentLearningIdentity;
  subject: {
    key: string;
    name: string;
  };
  chapter: {
    id: string;
    title: string;
    description: string;
  };
  lesson: LearningLesson;
  chapter_assets: {
    fiche_revision: PedagogicalContent | null;
    exercices: LearningExercise[];
    quiz: LearningQuiz[];
    medias: LearningVideo[];
  };
  navigation: {
    prev_index: number | null;
    next_index: number | null;
  };
  lesson_progress_pct?: number;
};
