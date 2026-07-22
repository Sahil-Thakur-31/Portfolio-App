import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary, resolveOwnerIdFromUsername, trackEvent } from "@/server/db/analytics";

export async function GET(request: NextRequest) {
  try {
    const username = request.nextUrl.searchParams.get("username") || undefined;
    const summary = await getAnalyticsSummary({ username });
    return NextResponse.json(summary);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { username, ...event } = await request.json();
    if (!username) {
      return NextResponse.json({ error: "Missing username for analytics event" }, { status: 400 });
    }

    const ownerId = await resolveOwnerIdFromUsername(username);
    if (!ownerId) {
      return NextResponse.json({ error: "Unknown portfolio owner" }, { status: 404 });
    }

    const result = await trackEvent({ ...event, owner_id: ownerId });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
