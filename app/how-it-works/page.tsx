import Link from "next/link";

export default function HowItWorks() {
  return (
    <div className="mx-auto flex flex-col justify-center items-center min-h-[80vh] max-w-md">
      <div className="hero">
        <p className="eyebrow">app router demo</p>
        <h1>How it works</h1>
        <p>
          Paste a ticket, the agent searches the corpus of past resolutions,
          proposes a label, and nothing is written until a human approves.
        </p>
      </div>
      <div className="panel">
        <p>
          <strong>1. Static shell</strong>{" "}
          <span className="muted">
            This page is prerendered at build time, no request-time data.
          </span>
        </p>
        <p>
          <strong>2. Client leaf</strong>{" "}
          <span className="muted">
            The demo on the home page hydrates in the browser.
          </span>
        </p>
        <p>
          <strong>3. Dynamic routes</strong>{" "}
          <span className="muted">
            The chat API and this search page depend on the request.
          </span>
        </p>
      </div>
      <p className="nav">
        <Link href="/">Back to demo</Link>
        <Link href="/search?q=preview">Try corpus search</Link>
      </p>
    </div>
  );
}
