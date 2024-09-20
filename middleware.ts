import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth3DPOS, authSUMS } from "./lib/auth";

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/3DPOS')) {
        return handle3DPOSAuth(request);
    } else if (request.nextUrl.pathname.startsWith('/api/SUMS')) {
        return handleSUMSAuth(request);
    }
}

async function handle3DPOSAuth(request: NextRequest) {
    try {
        const session = await auth3DPOS();
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-printer-session', session);
        return NextResponse.next({
            headers: requestHeaders
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
        );
    }
}

async function handleSUMSAuth(request: NextRequest) {
    try {
        const token = await authSUMS();
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-sums-token', token);
        return NextResponse.next({
            headers: requestHeaders
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
        );
    }
}

export const config = {
    matcher: ['/api/3DPOS/:path*', '/api/SUMS/:path*'],
};