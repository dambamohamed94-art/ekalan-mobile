export type UserRole = "admin" | "student" | "teacher" | "parent";
export type UserStatus = "active" | "pending" | "disabled";

export type User = {
  id: number;
  role: UserRole;
  status?: UserStatus;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  avatar?: string | null;
  class_id?: number | null;
  class_code?: string | null;
  class_name?: string | null;
  school_name?: string | null;
  objective?: string | null;
  birth_date?: string | null;
  whatsapp?: string | null;
  student_message?: string | null;
  student_needs?: string[];
};
