import { notFound } from "next/navigation";
import BodyMap from "@/components/BodyMap";
import ProgramList from "@/components/ProgramList";
import { BackLink, Footnote } from "@/components/ui";
import { getProgram, programs } from "@/lib/data";

export const generateStaticParams = () => programs.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = getProgram((await params).id);
  return { title: p ? `${p.name} · GEEM` : "GEEM" };
}

export default async function ProgramPage({ params }: { params: Promise<{ id: string }> }) {
  const program = getProgram((await params).id);
  if (!program) notFound();
  return (
    <main className="page">
      <div className="topbar"><BackLink href="/" label="Workouts" /></div>
      <div className={`program-hero accent-${program.accent}`} aria-hidden="true">
        <BodyMap primary={program.muscles} size="small" />
      </div>
      <h1>{program.name}</h1>
      <p className="lede">{program.summary}</p>
      <ProgramList programId={program.id} />
      <Footnote />
    </main>
  );
}
