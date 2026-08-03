import { isAxiosError } from "axios";
import { ApiContractError, ApiFailure } from "./response";

type ApiErrorPayload = Partial<ApiFailure> & {
  message?: string;
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiContractError) {
    return error.message || fallback;
  }

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
