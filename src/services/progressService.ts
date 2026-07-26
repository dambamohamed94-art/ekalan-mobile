import { getStudentHome } from "./studentService";

export async function getStudentProgress() {
  return getStudentHome();
}
