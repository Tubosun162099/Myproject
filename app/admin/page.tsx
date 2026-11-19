import type { Metadata } from "next";
import Admin from "@/components/Admin";

export const metadata: Metadata = { title: "Videos · GEEM", robots: { index: false } };

export default function AdminPage() {
  return (
    <main className="page">
      <div className="topbar"><span className="wordmark">GEEM</span></div>
      <h1>Demo videos</h1>
      <p className="lede">Generate a video, watch it, and approve it. Approved videos show for everyone.</p>
      <Admin />
    </main>
  );
}
