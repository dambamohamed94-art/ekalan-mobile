import { getStudentHome } from "./studentService";

export type Course = {
  id?: number;
  key?: string;
  name: string;
  description: string;
  progress: number;
};

export async function getStudentCourses(): Promise<Course[]> {
  const home = await getStudentHome();
  return home.subjects;
}
