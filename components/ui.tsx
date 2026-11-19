import Link from "next/link";
import { ChevronLeft, ChevronRight, Dumbbell, Play, User } from "lucide-react";
import BodyMap from "./BodyMap";
import { equipmentList, muscleLabel, muscleNames } from "@/lib/data";
import type { Equipment, Exercise, MuscleId } from "@/lib/types";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="back">
      <ChevronLeft size={18} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function equipmentText(e: Exercise) {
  if (e.equipment.length === 0) return "No equipment needed";
  return equipmentList(e.equipment).map((q) => q.name).join(" + ");
}

export function ExerciseRow({ exercise, from }: { exercise: Exercise; from?: string }) {
  const href = `/exercises/${exercise.id}${from ? `?from=${from}` : ""}`;
  return (
    <Link href={href} className="row">
      <div className="row-mini-map" aria-hidden="true">
        <BodyMap primary={exercise.primary} size="small" />
      </div>
      <div className="text">
        <div className="title">{exercise.name}</div>
        <div className="sub">{equipmentText(exercise)}</div>
        <div className="sub">{muscleLabel(exercise.primary)}</div>
      </div>
      <ChevronRight className="chev" size={18} aria-hidden="true" />
    </Link>
  );
}

export function EquipmentRow({ item, note }: { item: Equipment; note?: string }) {
  return (
    <Link href={`/equipment/${item.id}`} className="row">
      <div className="icon" aria-hidden="true">
        <Dumbbell size={18} />
      </div>
      <div className="text">
        <div className="title">{item.name}</div>
        {note && <div className="sub">{note}</div>}
      </div>
      <ChevronRight className="chev" size={18} aria-hidden="true" />
    </Link>
  );
}

export function NoEquipmentRow() {
  return (
    <div className="row" style={{ cursor: "default" }}>
      <div className="icon" aria-hidden="true">
        <User size={18} />
      </div>
      <div className="text">
        <div className="title">No equipment needed</div>
        <div className="sub">Just your body and some floor space</div>
      </div>
    </div>
  );
}

export function Video({ src, name }: { src?: string; name: string }) {
  return (
    <div className="video">
      {src ? (
        <video src={src} controls playsInline loop muted preload="metadata" aria-label={`${name} demo`} />
      ) : (
        <div className="video-empty">
          <div className="play" aria-hidden="true">
            <Play size={22} />
          </div>
          Demo video coming soon
        </div>
      )}
    </div>
  );
}

export function MuscleSection({
  primary,
  secondary,
  title = "Where you'll feel it",
}: {
  primary: MuscleId[];
  secondary: MuscleId[];
  title?: string;
}) {
  const extra = secondary.filter((m) => !primary.includes(m));
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      <div className="map-card">
        <BodyMap primary={primary} secondary={extra} />
        <div className="legend" aria-hidden="true">
          <span><i style={{ background: "var(--muscle-primary)" }} />Main muscles</span>
          {extra.length > 0 && (
            <span><i style={{ background: "var(--muscle-secondary)" }} />Also works</span>
          )}
        </div>
        <div className="muscle-lists">
          <div>
            <h3>Main muscles</h3>
            <ul>{primary.map((m) => <li key={m}>{muscleNames[m]}</li>)}</ul>
          </div>
          {extra.length > 0 && (
            <div>
              <h3>Also works</h3>
              <ul>{extra.map((m) => <li key={m}>{muscleNames[m]}</li>)}</ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function Footnote() {
  return (
    <p className="footnote">
      General guidance, not medical advice. Stop if anything hurts.
    </p>
  );
}
