export async function sendDiscordNotification(lead: { name: string; email: string; message: string; company?: string | null; budget?: string | null }) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("Discord Webhook URL is missing. Skipping Discord notification.");
    return;
  }

  try {
    const embed = {
      title: "💼 New Portfolio Inquiry/Lead",
      color: 3066993, // Greenish blue color
      fields: [
        { name: "Name", value: lead.name, inline: true },
        { name: "Email", value: lead.email, inline: true },
        { name: "Company", value: lead.company || "N/A", inline: true },
        { name: "Budget", value: lead.budget || "N/A", inline: true },
        { name: "Message", value: lead.message },
      ],
      timestamp: new Date().toISOString(),
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (error) {
    console.error("Failed to send Discord webhook:", error);
  }
}
