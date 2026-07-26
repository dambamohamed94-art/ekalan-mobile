import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";

export type LinkedStudent = {
  student_user_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  school_name?: string;
  class_code?: string;
  class_name?: string;
  status?: string;
};

export type ParentStudentDashboard = {
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    class_code?: string;
    class_name?: string;
    school_name?: string;
  };
  global_progress: number;
  stats?: {
    completed_courses?: number;
    in_progress_courses?: number;
  };
  subjects: {
    key: string;
    name: string;
    description?: string;
    progress: number;
    completed_lessons?: number;
    total_lessons?: number;
    last_lesson?: string;
  }[];
  history: {
    title: string;
    subject?: string;
    status?: string;
    date?: string;
  }[];
  class_contents: {
    subject?: string;
    title: string;
    description?: string;
  }[];
  challenge: {
    title?: string;
    message?: string;
  } | null;
};

export type TeacherDashboard = {
  teacher: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    city?: string;
    diploma?: string;
    bio?: string;
    status?: string;
  };
  stats: {
    students: number;
    lessons: number;
    challenges: number;
    status: string;
  };
  students: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    class_code?: string;
    class_name?: string;
    school_name?: string;
    objective?: string;
    subject?: string;
  }[];
  lessons: { title: string; meta?: string }[];
  challenges: { title: string; meta?: string }[];
};

export async function getParentStudents(): Promise<LinkedStudent[]> {
  const response =
    await api.get<ApiResponse<LinkedStudent[]>>("/parents/me/students");
  return getApiData(response);
}

export async function getParentStudentDashboard(
  studentId: number,
): Promise<ParentStudentDashboard> {
  const response = await api.get<ApiResponse<ParentStudentDashboard>>(
    "/parents/student-dashboard",
    {
    params: { student_id: studentId },
    },
  );
  return getApiData(response);
}

export async function getTeacherDashboard(): Promise<TeacherDashboard> {
  const response =
    await api.get<ApiResponse<TeacherDashboard>>("/teachers/me/dashboard");
  return getApiData(response);
}
