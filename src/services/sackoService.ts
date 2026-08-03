import { isAxiosError } from "axios";
import { api } from "../api/client";
import { ApiResponse, getApiData } from "../api/response";
import { buildSackoTutorPayload } from "../utils/sackoPayload";
import { SackoContext } from "./sackoContextService";

export type SackoReply = {
  success: true;
  message: string;
  hint_level: number;
  help_mode: "adaptive";
  recommended_action: "continue" | "retry";
  recommended_lesson?: Record<string, unknown> | null;
  profile_version?: string | null;
  session_id: number;
  contract_version: "ai-tutor-v1" | "sacko-basic-v1";
  request_id: string;
  access_mode?: "basic" | "premium";
  provider?: string;
  requested_hint_level?: number;
  help_adapted?: boolean;
};

export type SackoConfig = {
  enabled: boolean;
  display_name: string;
  logo?: string;
  avatar?: string;
  alt?: string;
  access_mode?: "basic" | "premium";
  provider?: string;
};

export async function getSackoConfig(): Promise<SackoConfig> {
  try {
    const response = await api.get<ApiResponse<SackoConfig>>("/ai/config");
    return getApiData(response);
  } catch (error: unknown) {
    if (
      isAxiosError(error) &&
      [403, 404, 500, 502, 503, 504].includes(error.response?.status ?? 0)
    ) {
      return {
        enabled: true,
        display_name: "Sacko",
        access_mode: "basic",
      };
    }

    throw error;
  }
}

export type AskSackoInput = {
  message: string;
  context: SackoContext;
  hintLevel?: number;
};

type BasicLessonHelp = {
  response: {
    title?: string;
    content?: string;
  };
};

function canUseBasicFallback(error: unknown) {
  return (
    isAxiosError(error) &&
    [403, 404, 500, 502, 503, 504].includes(error.response?.status ?? 0)
  );
}

function isTechnicalReply(message: string) {
  return /exception\s+ia|route\s+inconnue|fatal\s+error|temporarily unavailable/i.test(
    message,
  );
}

async function askSackoBasic(
  message: string,
  context: SackoContext,
): Promise<SackoReply> {
  const response = await api.post<ApiResponse<BasicLessonHelp>>(
    "/ai/lesson-help",
    {
      subject_key: context.subject,
      chapter_id: context.chapter,
      lesson_id: context.lesson,
      mode: "explain",
      message,
    },
  );
  const basic = getApiData(response);
  const title = basic.response?.title?.trim();
  const content = basic.response?.content?.trim();

  if (!content) {
    throw new Error("EMPTY_SACKO_BASIC_REPLY");
  }

  return {
    success: true,
    message: [title, content].filter(Boolean).join("\n\n"),
    hint_level: 2,
    help_mode: "adaptive",
    recommended_action: "continue",
    recommended_lesson: null,
    profile_version: null,
    session_id: 0,
    contract_version: "sacko-basic-v1",
    request_id: `basic-${Date.now()}`,
    access_mode: "basic",
  };
}

export async function askSacko({
  message,
  context,
  hintLevel = 2,
}: AskSackoInput): Promise<SackoReply> {
  try {
    const response = await api.post<ApiResponse<SackoReply>>(
      "/ai/tutor",
      buildSackoTutorPayload(message, context, hintLevel),
    );

    const reply = getApiData(response);
    if (
      !reply?.message?.trim() ||
      isTechnicalReply(reply.message) ||
      reply.contract_version !== "ai-tutor-v1" ||
      !reply.request_id
    ) {
      return askSackoBasic(message, context);
    }

    return { ...reply, access_mode: "premium" };
  } catch (error: unknown) {
    if (!canUseBasicFallback(error)) {
      throw error;
    }

    return askSackoBasic(message, context);
  }
}
