export type MuscleId =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "abs"
  | "obliques"
  | "traps"
  | "upper-back"
  | "lats"
  | "lower-back"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "adductors"
  | "calves";

export type Equipment = {
  id: string;
  name: string;
  /** One plain sentence: what this is and what it's for. */
  summary: string;
  /** How to set the machine or tool up before you start. */
  setup: string[];
  safety: string[];
  /** Saved, approved demo video. Empty until one is generated and approved. */
  video?: string;
};

export type Exercise = {
  id: string;
  name: string;
  summary: string;
  primary: MuscleId[];
  secondary: MuscleId[];
  /** Equipment ids you need. Empty means no equipment needed. */
  equipment: string[];
  /** Equipment ids you can swap in instead (or add, for no-equipment moves). */
  alternatives: string[];
  steps: string[];
  mistakes: string[];
  benefits: string[];
  /** Saved, approved demo video. Empty until one is generated and approved. */
  video?: string;
};

export type Accent = "blue" | "red" | "green" | "purple" | "orange" | "yellow" | "pink" | "gray";

export type Program = {
  id: string;
  name: string;
  /** Soft Notion-style colour used to tint this workout's cards and tags. */
  accent: Accent;
  summary: string;
  /** Muscles shown on the program's body map. */
  muscles: MuscleId[];
  /** Exercise ids, in the order they should be listed. */
  exercises: string[];
};
