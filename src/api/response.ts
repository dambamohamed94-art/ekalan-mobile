import { AxiosResponse } from "axios";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiContractError extends Error {
  details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ApiContractError";
    this.details = details;
  }
}

export function getApiData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  if (!response.data.ok) {
    throw new ApiContractError(response.data.error, response.data.details);
  }

  return response.data.data;
}
