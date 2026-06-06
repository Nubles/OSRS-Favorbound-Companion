export type FactionId =
  | "druids"
  | "dwarves"
  | "fremennik"
  | "pirates"
  | "desert-merchants"
  | "arceuus-scholars";

export interface Duty {
  id: string;
  label: string;
  favor: number;
}

export interface Faction {
  id: FactionId;
  name: string;
  sigil: string;
  tagline: string;
  ethos: string;
  allowedThemes: string[];
  regions: string[];
  skills: string[];
  gear: string[];
  duties: Duty[];
  allianceCost: number;
  accent: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  message: string;
  detail: string;
}

export interface RunState {
  runName: string;
  startingFactionId: FactionId | null;
  alliedFactionIds: FactionId[];
  favor: number;
  completedDutyIds: string[];
  history: HistoryEntry[];
}
