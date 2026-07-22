import { Resend } from "resend";
import { getResumeData } from "@/server/db/resume";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmailNotification(
  lead: { name: string; email: string; message: string; company?: string | null },
  ownerUserId: string
) {
  if (!resend) {
    console.log("Resend API Key is missing. Skipping email notification.");
    return;
  }

  let targetEmail = process.env.FALLBACK_LEAD_EMAIL || "";
  try {
    const resume = await getResumeData({ userId: ownerUserId });
    if (resume?.contact?.email) {
      targetEmail = resume.contact.email;
    }
  } catch (error) {
    console.error("Failed to query the lead owner's contact email, falling back to FALLBACK_LEAD_EMAIL.", error);
  }

  if (!targetEmail) {
    console.log("No resume contact email or FALLBACK_LEAD_EMAIL configured. Skipping email notification.");
    return;
  }

  try {
    await resend.emails.send({
      from: "Portfolio Lead <portfolio@resend.dev>",
      to: targetEmail,
      subject: `New Lead Inquiry from ${lead.name}`,
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ""}
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f4f4f4; padding: 15px; border-left: 5px solid #ccc;">
          ${lead.message.replace(/\n/g, "<br/>")}
        </blockquote>
      `,
    });
  } catch (error) {
    console.error("Failed to send Resend email:", error);
  }
}
