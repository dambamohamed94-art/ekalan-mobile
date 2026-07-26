export function clampProgress(value: unknown) {
  const progress = Number(value);

  if (!Number.isFinite(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
}
