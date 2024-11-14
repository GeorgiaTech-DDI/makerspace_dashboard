// lib/cas.ts
import { NextRequest } from 'next/server';

const CAS_CONFIG = {
  version: '3.0',
  protocol: 'https',
  hostname: 'sso.gatech.edu',
  port: 443,
  uri: '/cas'
};

export function getBaseUrl(request?: NextRequest): string {
  if (process.env.NODE_ENV === 'production') {
    // Use NEXTAUTH_URL in production
    return process.env.NEXTAUTH_URL || 'https://prod.d21mn6i8vq0ak1.amplifyapp.com';
  }
  // In development, use the request URL or default to localhost
  return request ? `${request.nextUrl.protocol}//${request.headers.get('host')}` : 'http://localhost:3000';
}

export function getCasLoginUrl(service: string) {
  return `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/login?service=${encodeURIComponent(service)}`;
}

export function getCasLogoutUrl(service: string) {
  return `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/logout?service=${encodeURIComponent(service)}`;
}

export function getCasValidateUrl(ticket: string, service: string) {
  return `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/p3/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(service)}`;
}