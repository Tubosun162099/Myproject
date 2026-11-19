import { equipment } from "./equipment";
import { exercises } from "./exercises";
import type { Equipment, Exercise, MuscleId, Program } from "./types";

export { equipment, exercises };

export const muscleNames: Record<MuscleId, string> = {
  chest: "Chest",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  abs: "Abs",
  obliques: "Obliques (side abs)",
  traps: "Traps (upper back and neck)",
  "upper-back": "Upper back",
  lats: "Lats (sides of back)",
  "lower-back": "Lower back",
  glutes: "Glutes (bum)",
  quads: "Quads (front of thigh)",
  hamstrings: "Hamstrings (back of thigh)",
  adductors: "Inner thighs",
  calves: "Calves",
};

export const programs: Program[] = [
  {
    id: "legs",
    name: "Leg Day",
    summary: "Thighs, glutes and calves.",
    muscles: ["quads", "hamstrings", "glutes", "adductors", "calves"],
    exercises: [
      "back-squat", "leg-press", "leg-extension", "leg-curl", "dumbbell-lunge",
      "romanian-deadlift", "hip-thrust", "goblet-squat", "standing-calf-raise",
      "bodyweight-squat", "reverse-lunge", "glute-bridge", "wall-sit", "jump-squat",
      "single-leg-calf-raise",
    ],
  },
  {
    id: "chest",
    name: "Chest Day",
    summary: "Chest, with some shoulders and triceps.",
    muscles: ["chest"],
    exercises: [
      "bench-press", "incline-dumbbell-press", "chest-press", "pec-deck-fly",
      "cable-crossover", "chest-dip", "push-up", "incline-push-up", "wide-push-up",
    ],
  },
  {
    id: "back",
    name: "Back Day",
    summary: "Upper, middle and lower back.",
    muscles: ["lats", "upper-back", "lower-back", "traps"],
    exercises: [
      "pull-up", "lat-pulldown", "seated-cable-row", "bent-over-row", "single-arm-row",
      "deadlift", "face-pull", "superman", "prone-y-t-raise", "reverse-snow-angel", "bird-dog",
    ],
  },
  {
    id: "arms",
    name: "Arm Day",
    summary: "Biceps, triceps and forearms.",
    muscles: ["biceps", "triceps", "forearms"],
    exercises: [
      "barbell-curl", "hammer-curl", "preacher-curl", "triceps-pushdown",
      "overhead-triceps-extension", "skull-crusher", "diamond-push-up", "chair-dip", "plank-up-down",
    ],
  },
  {
    id: "shoulders",
    name: "Shoulders",
    summary: "Front, side and back of the shoulders, plus traps.",
    muscles: ["shoulders", "traps"],
    exercises: [
      "overhead-press", "dumbbell-shoulder-press", "lateral-raise", "rear-delt-fly",
      "face-pull", "dumbbell-shrug", "pike-push-up", "plank-shoulder-tap", "prone-y-t-raise",
    ],
  },
  {
    id: "core",
    name: "Abs & Core",
    summary: "Stomach, sides and lower back.",
    muscles: ["abs", "obliques", "lower-back"],
    exercises: [
      "cable-crunch", "hanging-leg-raise", "ab-wheel-rollout", "russian-twist",
      "plank", "side-plank", "dead-bug", "bicycle-crunch", "mountain-climber", "bird-dog",
    ],
  },
  {
    id: "full-body",
    name: "Full Body",
    summary: "A bit of everything in one session.",
    muscles: ["quads", "glutes", "hamstrings", "chest", "lats", "upper-back", "shoulders", "abs"],
    exercises: [
      "deadlift", "goblet-squat", "bench-press", "lat-pulldown", "kettlebell-swing",
      "dumbbell-thruster", "burpee", "push-up", "bodyweight-squat", "mountain-climber", "plank",
    ],
  },
];

const exerciseById = new Map(exercises.map((e) => [e.id, e]));
const equipmentById = new Map(equipment.map((e) => [e.id, e]));
const programById = new Map(programs.map((p) => [p.id, p]));

export const getExercise = (id: string) => exerciseById.get(id);
export const getEquipment = (id: string) => equipmentById.get(id);
export const getProgram = (id: string) => programById.get(id);

export const equipmentList = (ids: string[]) =>
  ids.map((id) => equipmentById.get(id)).filter((e): e is Equipment => Boolean(e));

export const programExercises = (p: Program) =>
  p.exercises.map((id) => exerciseById.get(id)).filter((e): e is Exercise => Boolean(e));

export const needsNoEquipment = (e: Exercise) => e.equipment.length === 0;

/** Exercises that use this equipment, either as required or as a swap-in. */
export const exercisesForEquipment = (equipmentId: string) => ({
  main: exercises.filter((e) => e.equipment.includes(equipmentId)),
  alternative: exercises.filter((e) => e.alternatives.includes(equipmentId)),
});

/** Programs that include at least one exercise needing this equipment. */
export const programsForEquipment = (equipmentId: string) =>
  programs.filter((p) =>
    programExercises(p).some((e) => e.equipment.includes(equipmentId)),
  );

/** Muscles worked by the exercises that need this equipment. */
export const musclesForEquipment = (equipmentId: string) => {
  const { main } = exercisesForEquipment(equipmentId);
  const primary = new Set<MuscleId>();
  const secondary = new Set<MuscleId>();
  for (const e of main) e.primary.forEach((m) => primary.add(m));
  for (const e of main) e.secondary.forEach((m) => !primary.has(m) && secondary.add(m));
  return { primary: [...primary], secondary: [...secondary] };
};

export const muscleLabel = (ids: MuscleId[]) =>
  ids.map((m) => muscleNames[m].replace(/ \(.*\)$/, "")).join(", ");
