import { NextRequest, NextResponse } from 'next/server';

const CAS_CONFIG = {
  version: '3.0',
  protocol: 'https',
  hostname: 'sso.gatech.edu',
  port: 443,
  uri: '/cas'
};

export function getCasLoginUrl(service: string) {
  return `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/login?service=${encodeURIComponent(service)}`;
}

export function getCasLogoutUrl(service: string) {
  return `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/logout?service=${encodeURIComponent(service)}`;
}

export function getCasValidateUrl(ticket: string, service: string) {
  return `${CAS_CONFIG.protocol}://${CAS_CONFIG.hostname}:${CAS_CONFIG.port}${CAS_CONFIG.uri}/p3/serviceValidate?ticket=${ticket}&service=${encodeURIComponent(service)}`;
}