import { NextRequest, NextResponse } from 'next/server';
import { getCasLogoutUrl } from '@/lib/cas';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(
    getCasLogoutUrl(request.nextUrl.origin)
  );
  
  response.cookies.delete('gt_session');
  
  return response;
}