import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth3DPOS, authSUMS, checkSession3DPOS } from "./lib/auth";
import { getCasLoginUrl, getCasValidateUrl, getBaseUrl } from './lib/cas';

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
  '/pi': ['PI'], // Only users with PI role can access
  '/dashboard': ['PI', 'STAFF', 'STUDENT'], // Multiple roles can access
  '/admin': ['ADMIN']
} as const;

async function validateUserRole(username: string): Promise<string[]> {
  // In a real implementation, you would query your database or GT's API
  // For now, we'll use a simple mapping for demonstration
  const userRoles: Record<string, string[]> = {
    // Add some test PI usernames
    'gburdell3': ['PI'],
    'professor1': ['PI'],
    // Add other role mappings as needed
  };
  
  return userRoles[username] || ['STUDENT']; // Default to STUDENT role
}

export async function middleware(request: NextRequest) {
  console.log("Middleware executing for path:", request.nextUrl.pathname);

  // Handle existing auth routes for 3DPOS and SUMS
  if (request.nextUrl.pathname.startsWith("/api/3DPOS")) {
    return handle3DPOSAuth(request);
  } else if (request.nextUrl.pathname.startsWith("/api/SUMS")) {
    return handleSUMSAuth(request);
  }

  // Check if the current path requires protection
  const pathToCheck = Object.keys(PROTECTED_ROUTES).find(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (pathToCheck) {
    // Get the required roles for this path
    const requiredRoles = PROTECTED_ROUTES[pathToCheck as keyof typeof PROTECTED_ROUTES];
    const session = request.cookies.get('gt_session');
    const ticket = request.nextUrl.searchParams.get('ticket');
    const baseUrl = getBaseUrl(request);
    const serviceUrl = `${baseUrl}${request.nextUrl.pathname}`;

    // If no session and no ticket, redirect to CAS login
    if (!session && !ticket) {
      const loginUrl = getCasLoginUrl(serviceUrl);
      return NextResponse.redirect(loginUrl);
    }

    // If ticket present, validate it
    if (ticket) {
      try {
        const validateUrl = getCasValidateUrl(ticket, serviceUrl);
        const response = await fetch(validateUrl);
        const text = await response.text();
        
        if (text.includes('<cas:authenticationSuccess>')) {
          const username = text.match(/<cas:user>(.*?)<\/cas:user>/)?.[1];
          
          if (username) {
            // Validate user role
            const userRoles = await validateUserRole(username);
            const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

            if (!hasRequiredRole) {
              // Redirect to unauthorized page if user doesn't have required role
              return NextResponse.redirect(new URL('/unauthorized', request.url));
            }

            const response = NextResponse.redirect(serviceUrl);
            response.cookies.set('gt_session', username, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 24 * 60 * 60 // 24 hours
            });
            return response;
          }
        }
      } catch (error) {
        console.error('CAS validation error:', error);
      }
    }

    // If we have a session, validate the role
    if (session) {
      const userRoles = await validateUserRole(session.value);
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        // Redirect to unauthorized page if user doesn't have required role
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/3DPOS/:path*', 
    '/api/SUMS/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/pi/:path*'  // Added PI route protection
  ]
};

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