import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Check } from "lucide-react";
import {
  BackLink, EquipmentRow, Footnote, MuscleSection, NoEquipmentRow, Video,
} from "@/components/ui";
import { equipmentList, exercises, getExercise, programs } from "@/lib/data";
import { getVideo } from "@/lib/videos";

export const generateStaticParams = () => exercises.map((e) => ({ id: e.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const e = getExercise((await params).id);
  return { title: e ? `${e.name} · GEEM` : "GEEM" };
}

export default async function ExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const exercise = getExercise((await params).id);
  if (!exercise) notFound();

  const { from: fromId } = await searchParams;
  const inPrograms = programs.filter((p) => p.exercises.includes(exercise.id));
  const from = programs.find((p) => p.id === fromId) ?? inPrograms[0];
  const needs = equipmentList(exercise.equipment);
  const swaps = equipmentList(exercise.alternatives);
  const noKit = needs.length === 0;
  const video = (await getVideo("exercise", exercise.id)) ?? exercise.video;

  return (
    <main className="page">
      <div className="topbar">
        {from ? <BackLink href={`/programs/${from.id}`} label={from.name} /> : <BackLink href="/" label="Workouts" />}
      </div>

      <h1>{exercise.name}</h1>
      <p className="lede">{exercise.summary}</p>

      <Video src={video} name={exercise.name} />

      <MuscleSection primary={exercise.primary} secondary={exercise.secondary} />

      <section className="section">
        <h2 className="section-title">How to do it</h2>
        <ol className="steps">
          {exercise.steps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </section>

      <section className="section">
        <h2 className="section-title">What you need</h2>
        <div className="list">
          {noKit ? <NoEquipmentRow /> : needs.map((q) => <EquipmentRow key={q.id} item={q} />)}
        </div>
      </section>

      {swaps.length > 0 && (
        <section className="section">
          <h2 className="section-title">{noKit ? "Make it harder with" : "Or use instead"}</h2>
          <div className="list">
            {swaps.map((q) => <EquipmentRow key={q.id} item={q} />)}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Avoid these mistakes</h2>
        <ul className="bullets">
          {exercise.mistakes.map((m, i) => (
            <li key={i}><AlertTriangle size={16} aria-hidden="true" />{m}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2 className="section-title">Why it helps</h2>
        <ul className="bullets">
          {exercise.benefits.map((b, i) => (
            <li key={i}><Check size={16} aria-hidden="true" />{b}</li>
          ))}
        </ul>
      </section>

      {inPrograms.length > 0 && (
        <section className="section">
          <h2 className="section-title">Part of</h2>
          <div className="chips">
            {inPrograms.map((p) => (
              <Link key={p.id} href={`/programs/${p.id}`} className="chip">{p.name}</Link>
            ))}
          </div>
        </section>
      )}

      <Footnote />
    </main>
  );
}
