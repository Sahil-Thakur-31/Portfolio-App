import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { headers } from "next/headers";

// Initialize Redis if configuration exists
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Helper to generate a ratelimiter
 * @param limit Number of requests
 * @param window Duration string (e.g. "1 h", "1 m")
 */
export function getRateLimiter(limit: number, window: any) {
  if (!redis) {
    return null;
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(limit, window, limit),
    analytics: true,
  });
}

export const guestbookLimiter = getRateLimiter(5, "1 h"); // max 5 comments per hour
export const contactLimiter = getRateLimiter(3, "1 h");   // max 3 submissions per hour
export const analyticsLimiter = getRateLimiter(60, "1 m"); // max 60 events per minute

/**
 * Guestbook posts and contact form submissions run as Server Actions, which
 * POST to the page's own URL rather than a dedicated /api/* route — so they
 * can't be rate limited by path in middleware. Call this from inside the
 * action itself instead.
 */
export async function assertNotRateLimited(limiter: Ratelimit | null, errorMessage = "Too many requests. Please try again later.") {
  if (!limiter) return;
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const { success } = await limiter.limit(ip);
  if (!success) {
    throw new Error(errorMessage);
  }
}
