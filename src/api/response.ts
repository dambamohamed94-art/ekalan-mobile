import { AxiosResponse } from "axios";

export type ApiResponse<T> = {
  ok: boolean;
  data: T;
};

export function getApiData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data;
}
