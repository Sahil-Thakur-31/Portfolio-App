"use server";

import { createLead } from "@/server/db/leads";
import { leadSchema } from "@/lib/validators";
import { sendEmailNotification } from "@/server/notifications/email";
import { sendDiscordNotification } from "@/server/notifications/discord";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { assertNotRateLimited, contactLimiter } from "@/lib/rate-limit";

export async function submitInquiryAction(username: string, formData: any) {
  await assertNotRateLimited(contactLimiter, "You've submitted too many inquiries. Please try again later.");
  const validated = leadSchema.parse(formData);

  const supabase = await createClient();
  const { data: owner, error: ownerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (ownerError || !owner) {
    throw new Error("Portfolio owner not found.");
  }
  const ownerId = (owner as any).id as string;

  const data = await createLead({
    owner_id: ownerId,
    name: validated.name,
    email: validated.email,
    company: validated.company || null,
    budget: validated.budget || null,
    message: validated.message,
  });

  // Trigger notification pipelines in parallel
  await Promise.all([
    sendEmailNotification(data, ownerId),
    sendDiscordNotification(data),
  ]);

  revalidatePath("/admin/leads");
  return data;
}
