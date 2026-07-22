"use server";

import { createGuestbookEntry, deleteGuestbookEntry } from "@/server/db/guestbook";
import { guestbookSchema } from "@/lib/validators";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { assertNotRateLimited, guestbookLimiter } from "@/lib/rate-limit";

export async function postGuestbookMessageAction(username: string, userName: string, message: string) {
  await assertNotRateLimited(guestbookLimiter, "You've posted too many messages. Please try again later.");
  const validated = guestbookSchema.parse({ name: userName, message });

  // Sanitization to prevent XSS
  const sanitizedMessage = sanitizeHtml(validated.message, {
    allowedTags: [],
    allowedAttributes: {},
  });

  const sanitizedName = sanitizeHtml(validated.name, {
    allowedTags: [],
    allowedAttributes: {},
  });

  const supabase = await createClient();
  const { data: owner, error: ownerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (ownerError || !owner) {
    throw new Error("Portfolio owner not found.");
  }

  const { data: { user } } = await supabase.auth.getUser();

  const entry = await createGuestbookEntry({
    owner_id: (owner as any).id,
    user_id: user?.id ?? null,
    user_name: sanitizedName,
    user_avatar: null,
    message: sanitizedMessage,
  });

  revalidatePath(`/${username}/guestbook`);
  return entry;
}

export async function deleteGuestbookMessageAction(id: string, username: string) {
  await deleteGuestbookEntry(id);
  revalidatePath(`/${username}/guestbook`);
}
