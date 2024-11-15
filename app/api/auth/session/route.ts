// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('gt_session');
  
  return NextResponse.json({
    user: sessionCookie?.value || null,
    isAuthenticated: !!sessionCookie?.value
  });
}