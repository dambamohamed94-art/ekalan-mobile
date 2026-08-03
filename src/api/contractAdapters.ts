export type MobileSceneType =
  | "cours"
  | "video"
  | "revision"
  | "quiz"
  | "exercice";

export type ApiSceneType =
  | "course"
  | "video"
  | "revision"
  | "quiz"
  | "exercise";

const mobileToApiScene: Record<MobileSceneType, ApiSceneType> = {
  cours: "course",
  video: "video",
  revision: "revision",
  quiz: "quiz",
  exercice: "exercise",
};

const apiToMobileScene: Record<ApiSceneType, MobileSceneType> = {
  course: "cours",
  video: "video",
  revision: "revision",
  quiz: "quiz",
  exercise: "exercice",
};

export function toApiSceneType(scene: MobileSceneType): ApiSceneType {
  return mobileToApiScene[scene];
}

export function toMobileSceneType(scene: ApiSceneType): MobileSceneType {
  return apiToMobileScene[scene];
}

export function readProgressPercent(value: {
  progress_pct?: number | null;
  progress_percent?: number | null;
  progress_percentage?: number | null;
  overall_progress?: number | null;
}) {
  return Math.max(
    0,
    Math.min(
      100,
      value.progress_pct ??
        value.progress_percent ??
        value.progress_percentage ??
        value.overall_progress ??
        0,
    ),
  );
}
