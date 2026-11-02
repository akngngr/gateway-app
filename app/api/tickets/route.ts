import { NextResponse } from "next/server";
import { corpus } from "@/lib/corpus";

export async function GET() {
    return NextResponse.json(corpus, {
        headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
        },
    });
}