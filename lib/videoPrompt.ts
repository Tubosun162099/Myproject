import { equipmentList, exercisesForEquipment, getEquipment, getExercise } from "./data";
import type { VideoKind } from "./videos";

const STYLE =
  "Instructional fitness demonstration video. Bright, clean, modern gym with plain light grey walls. " +
  "Steady tripod camera, side-on angle, the whole body in frame at all times. Natural soft lighting. " +
  "One fit adult in plain dark athletic clothing. Slow, controlled, textbook-correct technique. " +
  "No text, captions, logos, music or other people.";

/** Builds the video prompt from the same library text the app shows, so the video matches the steps. */
export function buildPrompt(kind: VideoKind, id: string): string | null {
  if (kind === "exercise") {
    const e = getExercise(id);
    if (!e) return null;
    const kit = e.equipment.length
      ? `Equipment: ${equipmentList(e.equipment).map((q) => q.name.toLowerCase()).join(" and ")}.`
      : "No equipment, bodyweight only, on a gym floor mat.";
    return [
      STYLE,
      `The person demonstrates the ${e.name}. ${kit}`,
      `They perform two full repetitions: ${e.steps.join(" ")}`,
      `Avoid these mistakes: ${e.mistakes.join(" ")}`,
    ].join("\n\n");
  }
  const q = getEquipment(id);
  if (!q) return null;
  const first = exercisesForEquipment(id).main[0];
  return [
    STYLE,
    `The person shows how to use a ${q.name.toLowerCase()}. ${q.summary}`,
    `Set-up: ${q.setup.join(" ")}`,
    first
      ? `Then they perform two slow repetitions of the ${first.name}: ${first.steps.join(" ")}`
      : "Then they demonstrate one slow, controlled use of it.",
  ].join("\n\n");
}
