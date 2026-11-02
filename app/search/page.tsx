import Link from "next/link";
import { Suspense } from "react";
import { corpus } from "@/lib/corpus";

export default function Search({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <div className="mx-auto flex flex-col justify-center items-center min-h-[80dvh] max-w-md">
      <div className="hero">
        <p className="eyebrow">app router demo</p>
        <h1>Corpus search</h1>
        <p>
          The shell prerenders at build time, the results hole streams in after
          the request params resolve.
        </p>
      </div>
      <Suspense fallback={<p className="muted">Loading results…</p>}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
      <p className="nav">
        <Link href="/">Back to demo</Link>
      </p>
    </div>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim() ?? "";

  const hits = q
    ? corpus.filter(
        (pair) =>
          pair.issue.toLowerCase().includes(q.toLowerCase()) ||
          pair.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase())),
      )
    : [];

  return (
    <>
      <form action="/search" className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search tickets, e.g. preview"
        />
        <button type="submit" className="send">
          Search
        </button>
      </form>
      {q && (
        <div className="panel">
          {hits.length === 0 ? (
            <p className="muted">No matches for "{q}".</p>
          ) : (
            hits.map((hit, i) => (
              <p key={i}>
                <strong>{hit.issue}</strong>
                <span className="muted"> {hit.resolution}</span>
              </p>
            ))
          )}
        </div>
      )}
    </>
  );
}
