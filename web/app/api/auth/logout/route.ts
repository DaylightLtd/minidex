import { NextRequest, NextResponse } from "next/server";

import { handleUpstreamError, respondWithError } from "@/app/api/auth/utils";
import { clearAuthCookie, getAuthTokenFromRequest } from "@/lib/auth-cookies";
import { getApiUrl } from "@/lib/env";

export async function POST(request: NextRequest) {
  const token = getAuthTokenFromRequest(request);

  if (!token) {
    return respondWithSuccess();
  }

  try {
    const logoutUrl = await getApiUrl("/v1/auth/logout");
    const upstream = await fetch(logoutUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      const payload = await upstream.json().catch(() => ({}));
      return handleUpstreamError(upstream, payload, "Failed to logout");
    }
  } catch (error) {
    console.error("Logout route error:", error);
    return respondWithError(500, "Internal server error");
  }

  return respondWithSuccess();
}

function respondWithSuccess(): NextResponse {
  const response = NextResponse.json({ success: true }, { status: 200 });
  clearAuthCookie(response);
  return response;
}
