import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth3DPOS, authSUMS, checkSession3DPOS } from "./lib/auth";

declare module "next/server" {
  interface NextRequest {
    auth?: {
      session?: string;
      token?: string;
    };
  }
}

export async function middleware(request: NextRequest) {
  console.log("Middleware executing for path:", request.nextUrl.pathname);

  if (request.nextUrl.pathname.startsWith("/api/3DPOS")) {
    return handle3DPOSAuth(request);
  } else if (request.nextUrl.pathname.startsWith("/api/SUMS")) {
    return handleSUMSAuth(request);
  }
}

async function handle3DPOSAuth(request: NextRequest) {
  try {
    console.log("Attempting 3DPOS authentication");
    let session = request.headers.get("x-printer-session");

    console.log("Environment check:", {
      has_username: !!process.env.USER_3DOS,
      has_password: !!process.env.PASS_3DOS,
    });

    if (!session) {
      console.log("No session found, authenticating...");
      session = await auth3DPOS();
    } else {
      console.log("Checking existing session...");
      const isValid = await checkSession3DPOS(session);
      if (!isValid) {
        console.log("Session invalid, re-authenticating...");
        session = await auth3DPOS();
      }
    }

    if (!session) {
      throw new Error("Authentication flow failed");
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-printer-session", session);
    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }
}

async function handleSUMSAuth(request: NextRequest) {
  try {
    const token = await authSUMS();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-sums-token", token);
    // this will still expose the token to the client since we're pretending to authenticate
    // the token will never rotate or change (not good) but it's fine for now
    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: ["/api/3DPOS/:path*", "/api/SUMS/:path*"],
};
