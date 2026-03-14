import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { conversationService } from "@/lib/services/conversationService";
import { getUserIdFromEmail } from "@/lib/services/userService";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdFromEmail(session.user.email);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const conversations = await conversationService.getUserConversations(userId);
  return NextResponse.json(conversations);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await getUserIdFromEmail(session.user.email);
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { title } = await request.json();
  const conversation = await conversationService.createConversation(
    userId,
    title
  );

  return NextResponse.json(conversation);
}
