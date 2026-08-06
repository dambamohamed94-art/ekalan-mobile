export type DashboardSubjectProgress = {
  subject_key: string;
  subject_name?: string;
  progress_pct?: number;
  progress_percent?: number;
  progress_percentage?: number;
  completed_lessons?: number;
  total_lessons?: number;
  last_lesson?: string | null;
  updated_at?: string | null;
};

export type StudentDashboard = {
  version: "1.1" | string;
  generated_at?: string;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    full_name?: string;
    email?: string;
    class_id?: number;
    class_code?: string;
    class_name?: string;
    school_name?: string | null;
    objective?: string | null;
    avatar?: string | null;
    xp?: number;
    level?: number;
  };
  overview: {
    xp?: number;
    level?: number | { level?: number; current_xp?: number; next_level_xp?: number };
    global_progress_pct?: number;
    lessons_mastered?: number;
    lessons_to_review?: number;
    skills_mastered?: number;
    skills_to_review?: number;
    quiz_success_rate?: number;
    exercise_success_rate?: number;
  };
  progress: {
    global_progress_pct?: number;
    subjects: DashboardSubjectProgress[];
    activities?: Record<string, { opened: number; completed: number }>;
    weights?: Record<string, number>;
  };
  lesson_progress?: {
    summary?: Record<string, number>;
    items?: {
      subject_key?: string;
      chapter_id?: string;
      lesson_id?: string;
      lesson_title?: string;
      mastery_pct?: number;
      score_pct?: number;
      status?: string;
      status_label?: string;
      last_activity_at?: string | null;
    }[];
  };
  quiz?: Record<string, unknown>;
  exercises?: Record<string, unknown>;
  skills?: Record<string, unknown>;
  recent_activity?: {
    type?: string;
    subject_key?: string;
    chapter_id?: string;
    lesson_id?: string;
    status?: string;
    score_pct?: number;
    occurred_at?: string | null;
  }[];
  continue_learning?: Record<string, unknown> | null;
  recommendations?: {
    type?: string;
    priority?: number;
    title?: string;
    message?: string;
    subject_key?: string;
  }[];
  badges?: unknown[];
  pedagogical_profile?: Record<string, unknown> | null;
  goals?: Record<string, unknown>;
};

export type LinkedDashboardStudent = {
  student_user_id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  class_id?: number;
  class_code?: string;
  class_name?: string;
  school_name?: string | null;
  avatar?: string | null;
  link_status?: string;
  status?: string;
};
