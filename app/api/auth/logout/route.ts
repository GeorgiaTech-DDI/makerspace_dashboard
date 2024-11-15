// api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCasLogoutUrl, getBaseUrl } from '@/lib/cas';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const service = searchParams.get('service') || `${getBaseUrl(request)}/account`;
  
  // Get the CAS logout URL
  const casLogoutUrl = getCasLogoutUrl(service);
  
  // Delete the session cookie
  cookies().delete('gt_session');
  
  // Create the response with the redirect
  const response = NextResponse.redirect(casLogoutUrl);
  
  // Add CORS headers for Amplify environment
  if (request.headers.get('host')?.includes('amplifyapp.com')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
  }
  
  return response;
}