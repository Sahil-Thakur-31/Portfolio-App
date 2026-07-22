import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Reads a "r, g, b" custom property (e.g. --theme-accent-teal-rgb) defined in
 * globals.css so canvas contexts, which can't resolve CSS variables on their
 * own, stay in sync with the theme instead of hardcoding their own literals.
 */
export function getThemeRgb(varName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return value || fallback
}

/**
 * Builds a wa.me chat link from a raw phone number. Assumes a 10-digit
 * number is a local India number (no manual whatsapp-link field needed).
 */
export function getWhatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "")
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits
  const text = message
    ? `?text=${encodeURIComponent(message)}`
    : ""
  return `https://wa.me/${withCountryCode}${text}`
}

/**
 * Pulls the GitHub handle out of a Supabase user signed in via the GitHub
 * OAuth provider. Returns null for users who signed in with email/password
 * (or another provider) so callers can fall back to manual entry.
 */
export function getGithubUsername(user: { user_metadata?: Record<string, any> } | null | undefined): string | null {
  const metadata = user?.user_metadata
  return metadata?.user_name || metadata?.preferred_username || null
}

// Top-level routes that are NOT a tenant's [username] segment.
const RESERVED_ROUTE_SEGMENTS = new Set(["admin", "auth", "api"])

/**
 * Extracts the tenant username from a pathname for code that only has
 * access to window.location (e.g. site-wide analytics tracking mounted in
 * the root layout), since those routes are always "/{username}/...".
 * Returns null for static top-level routes (admin/auth/api) or the root.
 */
export function getUsernameFromPathname(pathname: string): string | null {
  const [first] = pathname.split("/").filter(Boolean)
  if (!first || RESERVED_ROUTE_SEGMENTS.has(first)) return null
  return first
}
