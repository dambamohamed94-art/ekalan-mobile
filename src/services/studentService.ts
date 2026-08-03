import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";

export type Subject = {
  key: string;
  name: string;
  description: string;
  progress: number;
  last_lesson: string;
  chapters_count?: number;
  lessons_count?: number;
  url: string;
};

export type StudentHome = {
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    class_code: string;
    class_name: string;
    school_name: string;
  };
  global_progress: number;
  subjects: Subject[];
  challenge: unknown;
};

export async function getStudentHome(): Promise<StudentHome> {
  const response =
    await api.get<ApiResponse<StudentHome>>("/student/home");
  return getApiData(response);
}
