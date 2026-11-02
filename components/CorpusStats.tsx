import { cacheLife, cacheTag } from "next/cache";
import { corpus } from "@/lib/corpus";

export default async function CorpusStats() {
  "use cache";
  cacheTag("tickets");
  cacheLife("hours");

  return <p>{corpus.length} ticket records in the corpus</p>;
}
