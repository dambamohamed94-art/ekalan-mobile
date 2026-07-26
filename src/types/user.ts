export type UserRole = "admin" | "student" | "teacher" | "parent";

export type User = {
  id: number;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  email?: string;
  class_id?: number | null;
  class_code?: string | null;
  class_name?: string | null;
};
