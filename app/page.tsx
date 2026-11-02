import CorpusStats from "@/components/CorpusStats";
import Chat from "../components/Chat";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <nav className="nav">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/search?q=preview">Try corpus search</Link>
      </nav>
      <div className="mx-auto flex flex-col justify-center items-center min-h-[80vh] max-w-md">
        <div className="hero">
          <p className="eyebrow">agent demo</p>
          <h1>Ticket Triage Agent</h1>
          <p>
            Paste a ticket. The agent finds the past resolution and proposes a
            label. Nothing is written until you approve.
          </p>
        </div>
        <CorpusStats />
        <Chat />
      </div>
    </>
  );
}
