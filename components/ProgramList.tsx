"use client";

import { useEffect, useState } from "react";
import { ExerciseRow } from "./ui";
import { getProgram, needsNoEquipment, programExercises } from "@/lib/data";

const KEY = "geem:no-equipment";

export default function ProgramList({ programId }: { programId: string }) {
  const program = getProgram(programId)!;
  const [noEquipment, setNoEquipment] = useState(false);

  // Remember the choice across workouts: someone training at home wants it on everywhere.
  useEffect(() => {
    try {
      setNoEquipment(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  const toggle = () => {
    const next = !noEquipment;
    setNoEquipment(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
  };

  const all = programExercises(program);
  const list = noEquipment ? all.filter(needsNoEquipment) : all.filter((e) => !needsNoEquipment(e));

  return (
    <>
      <button type="button" className="switch-row" role="switch" aria-checked={noEquipment} onClick={toggle}>
        <span>
          <span className="label">I have no equipment</span>
          <span className="hint">Show exercises you can do with just your body</span>
        </span>
        <span className="switch" data-on={noEquipment} aria-hidden="true" />
      </button>
      <p className="count">
        {list.length} {noEquipment ? "no-equipment exercises" : "exercises with gym equipment"}
      </p>
      <div className="list">
        {list.map((e) => <ExerciseRow key={e.id} exercise={e} from={programId} />)}
      </div>
    </>
  );
}
