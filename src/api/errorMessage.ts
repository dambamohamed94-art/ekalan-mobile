import { isAxiosError } from "axios";

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (!isAxiosError<ApiErrorPayload>(error)) {
    return fallback;
  }

  const apiMessage = error.response?.data?.error || error.response?.data?.message;

  if (apiMessage) {
    return apiMessage;
  }

  if (!error.response) {
    return "Connexion au serveur impossible. Vérifiez votre connexion internet.";
  }

  return fallback;
}
