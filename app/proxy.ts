import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    if (request.nextUrl.pathname === "/old") {
        return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
}