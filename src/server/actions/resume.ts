"use server";

import { updateResumeData as updateResumeDataDb } from "@/server/db/resume";
import { resumeDataSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateResumeDataAction(id: string, formDataJson: string) {
  try {
    const parsedFormData = JSON.parse(formDataJson);
    const validated = resumeDataSchema.parse(parsedFormData);
    await updateResumeDataDb(id, validated);
    revalidatePath("/admin/resume");
    return { success: true };
  } catch (err: any) {
    console.error("SERVER ACTION ERROR:", err);
    return { error: err.message || String(err) };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const file = formData.get("avatar") as File;
  if (!file) {
    throw new Error("No file uploaded.");
  }

  const mimeType = file.type;
  // Validate file type
  if (mimeType !== "image/jpeg" && mimeType !== "image/png" && mimeType !== "image/jpg") {
    throw new Error("Only JPG, JPEG, and PNG images are allowed.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Validate file size is less than 3MB
  if (buffer.length > 3 * 1024 * 1024) {
    throw new Error("Avatar image size must be under 3MB.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("You must be signed in to upload an avatar.");
  }

  // Upload to Supabase project-images storage bucket, namespaced under the
  // uploader's own user id so storage RLS can enforce per-tenant ownership.
  const fileExtension = file.name.split(".").pop();
  const storagePath = `${user.id}/avatars/avatar-${Date.now()}.${fileExtension}`;

  const { error } = await supabase.storage
    .from("project-images")
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }

  // Fetch Public Asset URL
  const { data: { publicUrl } } = supabase.storage
    .from("project-images")
    .getPublicUrl(storagePath);

  return publicUrl;
}
