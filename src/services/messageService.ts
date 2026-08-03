import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";

export async function sendTeacherMessage(data: {
  studentId: number;
  subject: string;
  message: string;
}) {
  const response = await api.post<ApiResponse<{
    message: string;
    message_id: number;
    status: "delivered";
    email_status: string;
  }>>("/teachers/students/send-message", {
    student_id: data.studentId,
    subject: data.subject.trim(),
    message: data.message.trim(),
  });
  return getApiData(response);
}
