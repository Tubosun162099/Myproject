"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import BodyMap from "./BodyMap";
import { EquipmentRow, ExerciseRow } from "./ui";
import { equipment, exercises, programExercises, programs } from "@/lib/data";

const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export default function Home() {
  const [query, setQuery] = useState("");
  const q = normalise(query);

  const results = useMemo(() => {
    if (!q) return null;
    const match = (s: string) => normalise(s).includes(q);
    return {
      programs: programs.filter((p) => match(p.name) || match(p.summary)),
      exercises: exercises.filter((e) => match(e.name)),
      equipment: equipment.filter((e) => match(e.name)),
    };
  }, [q]);

  const total = results ? results.programs.length + results.exercises.length + results.equipment.length : 0;

  return (
    <>
      <label className="search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search exercises or machines"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search exercises or machines"
        />
        {query && (
          <button type="button" className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">
            <X size={18} />
          </button>
        )}
      </label>

      {results ? (
        <div className="section" style={{ marginTop: 20 }}>
          {total === 0 && <p className="empty">Nothing found for “{query}”.</p>}
          {results.programs.length > 0 && <ProgramGrid list={results.programs} />}
          {results.exercises.length > 0 && (
            <section className="section" style={{ marginTop: results.programs.length ? 24 : 0 }}>
              <h2 className="section-title">Exercises</h2>
              <div className="list">
                {results.exercises.map((e) => <ExerciseRow key={e.id} exercise={e} />)}
              </div>
            </section>
          )}
          {results.equipment.length > 0 && (
            <section className="section" style={{ marginTop: 24 }}>
              <h2 className="section-title">Machines & equipment</h2>
              <div className="list">
                {results.equipment.map((e) => <EquipmentRow key={e.id} item={e} />)}
              </div>
            </section>
          )}
        </div>
      ) : (
        <section className="section" style={{ marginTop: 24 }}>
          <h2 className="section-title">Workouts</h2>
          <ProgramGrid list={programs} />
        </section>
      )}
    </>
  );
}

function ProgramGrid({ list }: { list: typeof programs }) {
  return (
    <div className="program-grid">
      {list.map((p) => (
        <Link key={p.id} href={`/programs/${p.id}`} className="program-card">
          <div className="thumb" aria-hidden="true">
            <BodyMap primary={p.muscles} size="small" />
          </div>
          <div className="body">
            <div className="name">{p.name}</div>
            <div className="meta">{programExercises(p).length} exercises</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
