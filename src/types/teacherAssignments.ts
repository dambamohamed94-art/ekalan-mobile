export type AssignmentStatus =
  | "assigned"
  | "opened"
  | "submitted"
  | "completed"
  | "cancelled";

export type TeacherAssignment = {
  id: number;
  assignment_id?: number;
  teacher_user_id?: number;
  student_user_id?: number;
  class_code?: string;
  title: string;
  instructions?: string | null;
  subject_key?: string | null;
  chapter_id?: string | null;
  lesson_id?: string | null;
  due_at?: string | null;
  status: AssignmentStatus;
  submission?: string | null;
  score_pct?: number | null;
  answer_text?: string | null;
  feedback?: string | null;
  teacher_feedback?: string | null;
  reviewed_at?: string | null;
  attachment_name?: string | null;
  attachment_mime?: string | null;
  attachment_size?: number | null;
  submitted_at?: string | null;
  teacher_first_name?: string;
  teacher_last_name?: string;
  created_at?: string;
  updated_at?: string;
};

export type ExerciseCatalog = {
  class_code: string;
  subjects: {
    key: string;
    name: string;
    chapters: {
      id: string;
      title: string;
      lessons: { id: string; title: string; index: number }[];
    }[];
  }[];
};

export type TeacherMessage = {
  id: number;
  sender_id: number;
  recipient_id: number;
  subject?: string | null;
  body: string;
  read_at?: string | null;
  created_at: string;
};
