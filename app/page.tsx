import Home from "@/components/Home";
import { Footnote } from "@/components/ui";

export default function Page() {
  return (
    <main className="page">
      <div className="topbar">
        <span className="wordmark">GEEM</span>
      </div>
      <h1>What are you training today?</h1>
      <p className="lede">Pick a workout to see exercises, equipment and how to do each one.</p>
      <Home />
      <Footnote />
    </main>
  );
}
