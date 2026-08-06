import { useCallback, useEffect, useState } from "react";
import { getStudentDashboard } from "../services/roleDashboardService";
import { StudentDashboard } from "../types/dashboard";

export function useStudentProgress() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const reload = useCallback(async () => {
    setLoading(true); setError(false);
    try { setDashboard(await getStudentDashboard()); }
    catch { setError(true); setDashboard(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  return { dashboard, loading, error, reload };
}
