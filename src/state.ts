import { FactionId, HistoryEntry, RunState } from "./types";

export const STORAGE_KEY = "favorbound-companion-state-v1";

export const defaultRunState: RunState = {
  runName: "",
  startingFactionId: null,
  alliedFactionIds: [],
  favor: 0,
  completedDutyIds: [],
  history: []
};

export function createHistory(message: string, detail: string): HistoryEntry {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    message,
    detail
  };
}

export function loadRunState(): RunState {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return defaultRunState;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultRunState;
    const parsed = JSON.parse(raw) as Partial<RunState>;
    return {
      ...defaultRunState,
      ...parsed,
      startingFactionId: parsed.startingFactionId ?? null,
      alliedFactionIds: Array.isArray(parsed.alliedFactionIds) ? parsed.alliedFactionIds as FactionId[] : [],
      completedDutyIds: Array.isArray(parsed.completedDutyIds) ? parsed.completedDutyIds : [],
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch {
    return defaultRunState;
  }
}

export function saveRunState(state: RunState): void {
  try {
    if (typeof window === "undefined" || !("localStorage" in window)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in strict privacy modes; the app should still run.
  }
}
