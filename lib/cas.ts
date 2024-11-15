import { NextRequest } from "next/server";

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// Set default bypass behavior: true in production, false in dev
// Override with BYPASS_CAS env var if it exists
const BYPASS_CAS =
  process.env.BYPASS_CAS !== undefined
    ? process.env.BYPASS_CAS === "true"
    : isProduction;

const CAS_CONFIG = {
  version: "3.0",
  protocol: "https",
  hostname: "sso.gatech.edu",
  port: 443,
  uri: "/cas",
};

export function getBaseUrl(request?: NextRequest): string {
  // For client-side requests
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (request) {
    const protocol = request.nextUrl.protocol;
    const host = request.headers.get("host");
    return `${protocol}//${host}`;
  }

  // Fallback for server-side when request is not available
  return process.env.NEXTAUTH_URL || "http://localhost:3005";
}

export function getCasLoginUrl(service: string) {
  // In bypass mode, create a mock ticket
  if (BYPASS_CAS) {
    return service;
  }

  // Real CAS mode
  return `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/login?service=${encodeURIComponent(service)}`;
}

export function getCasLogoutUrl(service: string) {
  if (BYPASS_CAS) {
    return service;
  }
  return `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/logout?service=${encodeURIComponent(service)}`;
}

export async function validateCasTicket(ticket: string, service: string) {
  // In bypass mode, always return success with gburdell3
  if (BYPASS_CAS) {
    return {
      success: true,
      username: "gburdell3",
    };
  }

  // Real CAS validation
  try {
    const validateUrl = `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/p3/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(service)}`;
    const response = await fetch(validateUrl);
    const text = await response.text();

    if (text.includes("<cas:authenticationSuccess>")) {
      const username = text.match(/<cas:user>(.*?)<\/cas:user>/)?.[1];
      return {
        success: true,
        username: username || "",
      };
    }

    return {
      success: false,
      username: "",
    };
  } catch (error) {
    console.error("CAS validation error:", error);
    return {
      success: false,
      username: "",
    };
  }
}
