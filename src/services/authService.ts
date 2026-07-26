import { isAxiosError } from "axios";
import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";
import { getUser, removeUser, saveUser } from "../storage/userStorage";
import { User } from "../types/user";

type LoginResult = {
  message: string;
  user: Pick<User, "id" | "role">;
};

type CurrentUserResult = {
  user: User;
};

type StudentHomeIdentity = {
  student: {
    class_code?: string;
    class_name?: string;
  };
};

export async function getCurrentUser(): Promise<User> {
  const response =
    await api.get<ApiResponse<CurrentUserResult>>("/auth/me");
  const user = getApiData(response).user;

  if (user.role !== "student") {
    return user;
  }

  try {
    const homeResponse =
      await api.get<ApiResponse<StudentHomeIdentity>>("/student/home");
    const home = getApiData(homeResponse);

    return {
      ...user,
      class_code: home.student.class_code ?? null,
      class_name: home.student.class_name ?? null,
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      throw error;
    }

    return user;
  }
}

export async function restoreSession(): Promise<User | null> {
  const cachedUser = await getUser();
  if (!cachedUser) {
    return null;
  }

  try {
    const user = await getCurrentUser();
    await saveUser(user);
    return user;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      await removeUser();
      return null;
    }

    return cachedUser;
  }
}

export async function login(email: string, password: string): Promise<User> {
  await api.post<ApiResponse<LoginResult>>("/auth/login", {
    email,
    password,
  });

  const user = await getCurrentUser();
  await saveUser(user);

  return user;
}

export async function logout() {
  await removeUser();

  await api.post("/auth/logout").catch((error) => {
    console.warn("LOGOUT SERVER ERROR:", error);
  });
}

export async function registerStudent(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  class_id: number;
  school_name?: string;
  objective?: string;
  birth_date?: string;
  whatsapp_phone?: string;
}) {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/register",
    {
    role: "student",
    ...data,
    },
  );

  return getApiData(response);
}

export async function registerParent(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  whatsapp_phone?: string;
  student_first_name?: string;
  student_last_name?: string;
  student_class?: string;
  student_school_name?: string;
}) {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/register",
    {
    role: "parent",
    ...data,
    },
  );

  return getApiData(response);
}

export async function registerTeacher(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  whatsapp_phone?: string;
  city?: string;
  diploma?: string;
  bio?: string;
}) {
  const response = await api.post<ApiResponse<{ message: string }>>(
    "/auth/register",
    {
    role: "teacher",
    ...data,
    },
  );

  return getApiData(response);
}
