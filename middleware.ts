// /middleware.ts (Dashboard)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const COOKIE_NAME = "maloof_dashboard_session";
const SECRET = process.env.NEXTAUTH_SECRET; // ensure this exists in your .env

export async function middleware(req: NextRequest) {
    const { nextUrl } = req;
    const pathname = nextUrl.pathname;

    // read cookie value (it may be a string JWT or NextAuth cookie format)
    const rawCookie = req.cookies.get(COOKIE_NAME)?.value;

    // try to decode/verify the token using NextAuth helper
    // cookieName tells getToken which cookie to read/decode
    let token = null;
    try {
        token = await getToken({
            req,
            secret: SECRET,
            cookieName: COOKIE_NAME,
        });
    } catch (err) {
        // decoding failed — token stays null
        token = null;
    }

    // If getToken didn't decode and we have a raw cookie, keep it (fallback)
    // (we don't try to parse raw JWT manually here; getToken should work if cookie was created by NextAuth)
    if (!token && !rawCookie) {
        // not authenticated — redirect to login
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // If token exists, take role from it (or undefined)
    const role = token?.role as string | undefined;

    // Director => full access
    if (role === "director") return NextResponse.next();

    // Employees & Staff → access to /reservations only
    if (pathname.startsWith("/reservations")) {
        if (role === "employee" || role === "staff") {
            return NextResponse.next();
        }
        // unauthorized
        const url = req.nextUrl.clone();
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
    }

    // Default: allow (you can tighten this if needed)
    return NextResponse.next();
}

export const config = {
    // protect everything except next internals and auth pages
    matcher: [
        "/((?!login|unauthorized|_next|api|static|favicon.ico).*)",
    ],
};
