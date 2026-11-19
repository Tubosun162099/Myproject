import type { MuscleId } from "@/lib/types";

// Figures are drawn on a 120 x 240 grid, centred on x = 60.
// Each shape is listed for the figure's right side only and mirrored.
type Pt = [number, number];

const mirrorPts = (pts: Pt[]): Pt[] => pts.map(([x, y]) => [120 - x, y]);

/** Closed Catmull-Rom spline through the points, as an SVG path. */
function smooth(pts: Pt[], tension = 0.5): string {
  const n = pts.length;
  const p = (i: number) => pts[(i + n) % n];
  let d = `M${p(0)[0].toFixed(2)},${p(0)[1].toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const t = tension / 3;
    const c1x = x1 + (x2 - x0) * t;
    const c1y = y1 + (y2 - y0) * t;
    const c2x = x2 - (x3 - x1) * t;
    const c2y = y2 - (y3 - y1) * t;
    d += `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)}`;
  }
  return d + "Z";
}

const both = (pts: Pt[]) => [smooth(pts), smooth(mirrorPts(pts))];

// Right half of the body outline, from the neck down to the crotch.
const outlineRight: Pt[] = [
  [64.5, 25], [66, 31], [74, 35.5], [83, 38.5], [89, 45], [91, 56], [92.5, 70],
  [94, 84], [95.5, 98], [97, 106], [96, 113], [92, 113], [90.5, 104], [88, 90],
  [85.5, 76], [83.5, 63], [80, 56], [78.5, 68], [77, 82], [79.5, 96], [81, 112],
  [80, 130], [78, 146], [79.5, 162], [77, 182], [75, 200], [78, 207], [70, 209],
  [66.5, 202], [66, 184], [64.5, 164], [64, 148], [62.5, 128], [61, 110],
];
const outline = smooth([...outlineRight, ...mirrorPts(outlineRight).reverse()]);

type Region = { muscle: MuscleId; d: string[] };

const front: Region[] = [
  { muscle: "shoulders", d: both([[73, 36.5], [82.5, 39], [88.5, 45.5], [89.5, 55], [84, 54.5], [78, 46]]) },
  { muscle: "chest", d: both([[61, 40], [72, 38.5], [77.5, 45], [77, 54], [69, 59.5], [61, 57.5]]) },
  { muscle: "biceps", d: both([[83.5, 57.5], [89.5, 57], [91.5, 66], [90, 75], [86, 74.5], [84, 66]]) },
  { muscle: "forearms", d: both([[86, 78], [92, 77], [94.5, 90], [94.5, 99], [90.5, 100], [88, 89]]) },
  {
    muscle: "abs",
    d: [0, 1, 2].flatMap((row) => {
      const y = 61.5 + row * 10.5;
      const block: Pt[] = [[61, y], [68, y + 0.5], [68.5, y + 9], [61, y + 9]];
      return both(block);
    }),
  },
  { muscle: "obliques", d: both([[70.5, 61], [76.5, 58], [77, 72], [77.5, 86], [72, 94], [70.5, 78]]) },
  { muscle: "quads", d: both([[67.5, 104], [78.5, 99], [80.5, 116], [78.5, 136], [71, 143], [66, 130], [66, 114]]) },
  { muscle: "adductors", d: both([[61.2, 109], [66, 105], [65, 122], [62.5, 127]]) },
];

const back: Region[] = [
  { muscle: "traps", d: [smooth([[60, 26], [65, 30], [76, 37], [68, 43], [62, 57], [60, 58], [58, 57], [52, 43], [44, 37], [55, 30]])] },
  { muscle: "shoulders", d: both([[74, 37], [82.5, 39], [88.5, 45.5], [89.5, 55], [84, 54.5], [78, 46]]) },
  { muscle: "upper-back", d: both([[63.5, 45], [69, 41.5], [77, 46], [76, 52.5], [69, 55], [63.5, 56]]) },
  { muscle: "lats", d: both([[66, 59], [77.5, 54], [78, 66], [75.5, 80], [67, 87], [64.5, 73]]) },
  { muscle: "lower-back", d: [smooth([[60, 82.5], [66, 80.5], [72.5, 86], [73, 95], [60, 97.5], [47, 95], [47.5, 86], [54, 80.5]])] },
  { muscle: "triceps", d: both([[83.5, 57.5], [89.5, 57], [91.5, 66], [90, 75], [86, 74.5], [84, 66]]) },
  { muscle: "forearms", d: both([[86, 78], [92, 77], [94.5, 90], [94.5, 99], [90.5, 100], [88, 89]]) },
  { muscle: "glutes", d: both([[61, 99], [72, 96], [79.5, 102], [80, 114], [72, 119.5], [61.5, 116]]) },
  { muscle: "hamstrings", d: both([[63, 122], [72.5, 121.5], [79.5, 124], [77.5, 141], [70.5, 146], [64.5, 139]]) },
  { muscle: "calves", d: both([[65.5, 152], [72.5, 149.5], [78.5, 158], [77, 175], [71, 181], [66.5, 171]]) },
];

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
      <svg viewBox="20 0 80 212" aria-hidden="true">
        <g>
          <ellipse cx={60} cy={13.5} rx={9} ry={11} fill="var(--body)" />
          <path d={outline} fill="var(--body)" />
          {regions.map((r) => {
            const tone = primary.has(r.muscle)
              ? "var(--muscle-primary)"
              : secondary.has(r.muscle)
                ? "var(--muscle-secondary)"
                : "var(--muscle-base)";
            return (
              <g key={r.muscle} fill={tone}>
                {r.d.map((d, i) => <path key={i} d={d} />)}
              </g>
            );
          })}
        </g>
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
