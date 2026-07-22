import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { analyticsLimiter } from "@/lib/rate-limit";

// Guestbook and contact form submissions run as Server Actions (POST to the
// page's own URL), not a dedicated /api/* route, so they're rate limited
// from inside the action itself (see assertNotRateLimited in lib/rate-limit)
// instead of here.
export async function proxy(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const path = request.nextUrl.pathname;

  // Analytics Rate Limiter
  if (path.startsWith("/api/analytics") && request.method === "POST" && analyticsLimiter) {
    const { success } = await analyticsLimiter.limit(ip);
    if (!success) return new NextResponse("Rate limit exceeded", { status: 429 });
  }

  // Update Supabase Auth Session
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
