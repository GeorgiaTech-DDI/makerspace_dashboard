// api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCasLogoutUrl, getBaseUrl } from "@/lib/cas";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const service =
    searchParams.get("service") || `${getBaseUrl(request)}/account`;

  const response = NextResponse.redirect(getCasLogoutUrl(service));
  response.cookies.delete("gt_session");

  return response;
}
