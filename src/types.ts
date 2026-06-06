export type FactionId =
  | "druids"
  | "dwarves"
  | "fremennik"
  | "pirates"
  | "desert-merchants"
  | "arceuus-scholars";

export type ContentStatus = "allowed" | "conditional" | "locked";
export type ContentCategory = "regions" | "skills" | "gear" | "themes";
export type RankName = "Neutral" | "Acquainted" | "Trusted" | "Honored" | "Allied";

export interface ContentItem {
  name: string;
  status?: ContentStatus;
}

export interface Duty {
  id: string;
  label: string;
  detail: string;
  favor: number;
  target: number;
  unit: string;
}

export interface Faction {
  id: FactionId;
  name: string;
  sigil: string;
  tagline: string;
  ethos: string;
  regions: ContentItem[];
  skills: ContentItem[];
  gear: ContentItem[];
  themes: ContentItem[];
  duties: Duty[];
  allianceCost: number;
  accent: string;
}

export interface RankThreshold {
  name: RankName;
  favor: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  message: string;
  detail: string;
}

export interface RunSettings {
  strictMode: boolean;
  favorStep: number;
}

export interface RunState {
  runName: string;
  startingFactionId: FactionId | null;
  alliedFactionIds: FactionId[];
  favor: number;
  factionFavor: Partial<Record<FactionId, number>>;
  completedDutyIds: string[];
  dutyProgress: Record<string, number>;
  history: HistoryEntry[];
  settings: RunSettings;
}
