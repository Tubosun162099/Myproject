import type { MuscleId } from "@/lib/types";

type Shape =
  | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { kind: "rect"; x: number; y: number; w: number; h: number; r: number }
  | { kind: "poly"; points: string };

type Region = { muscle?: MuscleId; shapes: Shape[] };

const mirror = (s: Shape): Shape => {
  if (s.kind === "ellipse") return { ...s, cx: 100 - s.cx };
  if (s.kind === "rect") return { ...s, x: 100 - s.x - s.w };
  return {
    kind: "poly",
    points: s.points
      .split(" ")
      .map((p) => {
        const [x, y] = p.split(",").map(Number);
        return `${100 - x},${y}`;
      })
      .join(" "),
  };
};
const pair = (s: Shape) => [s, mirror(s)];

// Shared, non-muscle parts that make the figure read as a body.
const frame: Region[] = [
  { shapes: [{ kind: "ellipse", cx: 50, cy: 13, rx: 8.5, ry: 10 }] },
  { shapes: [{ kind: "rect", x: 45.5, y: 22, w: 9, h: 8, r: 3 }] },
  { shapes: pair({ kind: "ellipse", cx: 18.5, cy: 99, rx: 3.6, ry: 4.5 }) },
  { shapes: pair({ kind: "ellipse", cx: 39, cy: 183, rx: 5.5, ry: 3.2 }) },
];

const front: Region[] = [
  ...frame,
  { shapes: [{ kind: "rect", x: 37, y: 86, w: 26, h: 12, r: 5 }] }, // hips
  { shapes: pair({ kind: "ellipse", cx: 39, cy: 141, rx: 4.2, ry: 4 }) }, // knees
  { shapes: pair({ kind: "ellipse", cx: 39, cy: 162, rx: 4.6, ry: 15 }) }, // shins
  { muscle: "shoulders", shapes: pair({ kind: "ellipse", cx: 28, cy: 38, rx: 7.5, ry: 6.5 }) },
  { muscle: "chest", shapes: pair({ kind: "rect", x: 34, y: 33, w: 15.2, h: 17, r: 5 }) },
  { muscle: "biceps", shapes: pair({ kind: "ellipse", cx: 24, cy: 57, rx: 4.8, ry: 10 }) },
  { muscle: "forearms", shapes: pair({ kind: "ellipse", cx: 20.5, cy: 80, rx: 4, ry: 11 }) },
  {
    muscle: "abs",
    shapes: [0, 1, 2].flatMap((row) =>
      pair({ kind: "rect", x: 42.5, y: 52.5 + row * 11, w: 7, h: 10, r: 2.5 }),
    ),
  },
  { muscle: "obliques", shapes: pair({ kind: "rect", x: 35, y: 53, w: 6.5, h: 29, r: 3 }) },
  { muscle: "quads", shapes: pair({ kind: "ellipse", cx: 39, cy: 117, rx: 6.8, ry: 19 }) },
  { muscle: "adductors", shapes: pair({ kind: "ellipse", cx: 47.4, cy: 109, rx: 2.4, ry: 10 }) },
];

const back: Region[] = [
  ...frame,
  { muscle: "traps", shapes: [{ kind: "poly", points: "42,25 58,25 66,33 50,45 34,33" }] },
  { muscle: "shoulders", shapes: pair({ kind: "ellipse", cx: 28, cy: 38, rx: 7.5, ry: 6.5 }) },
  { muscle: "upper-back", shapes: pair({ kind: "poly", points: "36,36 49,47 49,57 37,49" }) },
  { muscle: "lats", shapes: pair({ kind: "poly", points: "34,44 36,51 48.6,59 47.5,72 40,73 34.5,61" }) },
  { muscle: "lower-back", shapes: [{ kind: "rect", x: 41.5, y: 74, w: 17, h: 12, r: 3.5 }] },
  { muscle: "triceps", shapes: pair({ kind: "ellipse", cx: 24, cy: 57, rx: 4.8, ry: 10 }) },
  { muscle: "forearms", shapes: pair({ kind: "ellipse", cx: 20.5, cy: 80, rx: 4, ry: 11 }) },
  { muscle: "glutes", shapes: pair({ kind: "ellipse", cx: 43, cy: 96, rx: 7.2, ry: 9 }) },
  { muscle: "hamstrings", shapes: pair({ kind: "ellipse", cx: 39.5, cy: 123, rx: 6.6, ry: 17 }) },
  { muscle: "calves", shapes: pair({ kind: "ellipse", cx: 39, cy: 158, rx: 5.4, ry: 13 }) },
  { shapes: pair({ kind: "ellipse", cx: 39, cy: 174, rx: 3, ry: 5 }) }, // heels
];

function renderShape(s: Shape, key: number) {
  if (s.kind === "ellipse") return <ellipse key={key} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} />;
  if (s.kind === "rect") return <rect key={key} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r} />;
  return <polygon key={key} points={s.points} />;
}

function Figure({
  regions,
  primary,
  secondary,
  label,
}: {
  regions: Region[];
  primary: Set<MuscleId>;
  secondary: Set<MuscleId>;
  label?: string;
}) {
  return (
    <figure className="body-figure">
      <svg viewBox="0 0 100 190" aria-hidden="true">
        {regions.map((r, i) => {
          const tone = r.muscle && primary.has(r.muscle)
            ? "var(--muscle-primary)"
            : r.muscle && secondary.has(r.muscle)
              ? "var(--muscle-secondary)"
              : "var(--muscle-base)";
          return (
            <g key={i} fill={tone} stroke="var(--surface)" strokeWidth={1.2} strokeLinejoin="round">
              {r.shapes.map(renderShape)}
            </g>
          );
        })}
      </svg>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  );
}

export default function BodyMap({
  primary,
  secondary = [],
  size = "large",
}: {
  primary: MuscleId[];
  secondary?: MuscleId[];
  size?: "large" | "small";
}) {
  const p = new Set(primary);
  const s = new Set(secondary.filter((m) => !p.has(m)));
  const showLabels = size === "large";
  return (
    <div className={`body-map body-map--${size}`} role="img" aria-label="Body diagram of the muscles worked">
      <Figure regions={front} primary={p} secondary={s} label={showLabels ? "Front" : undefined} />
      <Figure regions={back} primary={p} secondary={s} label={showLabels ? "Back" : undefined} />
    </div>
  );
}
