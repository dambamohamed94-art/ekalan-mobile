import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";

export type SchoolClass = {
  id: number;
  level_code: string;
  name: string;
};

export async function getClasses(): Promise<SchoolClass[]> {
  const response = await api.get<ApiResponse<SchoolClass[]>>("/classes");
  return getApiData(response);
}
