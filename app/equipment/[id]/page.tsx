import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { BackLink, Callout, ExerciseRow, Footnote, MuscleSection, ProgramTag, Video } from "@/components/ui";
import {
  equipment, exercisesForEquipment, getEquipment, musclesForEquipment, programsForEquipment,
} from "@/lib/data";
import { getVideo } from "@/lib/videos";

export const revalidate = 60;

export const generateStaticParams = () => equipment.map((e) => ({ id: e.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const e = getEquipment((await params).id);
  return { title: e ? `${e.name} · GEEM` : "GEEM" };
}

export default async function EquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const item = getEquipment((await params).id);
  if (!item) notFound();

  const { main, alternative } = exercisesForEquipment(item.id);
  const muscles = musclesForEquipment(item.id);
  const usedIn = programsForEquipment(item.id);
  const video = (await getVideo("equipment", item.id)) ?? item.video;

  return (
    <main className="page">
      <div className="topbar"><BackLink href="/" label="Workouts" /></div>

      <h1>{item.name}</h1>
      <p className="lede">{item.summary}</p>

      <Video src={video} name={item.name} />

      {usedIn.length > 0 && (
        <section className="section">
          <h2 className="section-title">Used for</h2>
          <div className="chips">
            {usedIn.map((p) => <ProgramTag key={p.id} program={p} />)}
          </div>
        </section>
      )}

      {muscles.primary.length > 0 && (
        <MuscleSection primary={muscles.primary} secondary={muscles.secondary} />
      )}

      <section className="section">
        <h2 className="section-title">How to set it up</h2>
        <ol className="steps">
          {item.setup.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </section>

      <section className="section">
        <h2 className="section-title">Stay safe</h2>
        <Callout tone="yellow" icon={<ShieldCheck size={16} />} items={item.safety} />
      </section>

      {main.length > 0 && (
        <section className="section">
          <h2 className="section-title">Exercises on this</h2>
          <div className="list">
            {main.map((e) => <ExerciseRow key={e.id} exercise={e} />)}
          </div>
        </section>
      )}

      {alternative.length > 0 && (
        <section className="section">
          <h2 className="section-title">Can also be used for</h2>
          <div className="list">
            {alternative.map((e) => <ExerciseRow key={e.id} exercise={e} />)}
          </div>
        </section>
      )}

      <Footnote />
    </main>
  );
}
