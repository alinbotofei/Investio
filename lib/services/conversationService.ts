import { prisma } from "@/lib/prisma";

export async function createConversation(userId: string, title?: string) {
  return await prisma.conversation.create({
    data: {
      userId,
      title: title || "New Conversation",
    },
  });
}

export async function getConversations(userId: string) {
  return await prisma.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      messages: {
        select: {
          id: true,
          role: true,
          text: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
}

export async function getConversation(conversationId: string, userId: string) {
  return await prisma.conversation.findFirstOrThrow({
    where: {
      id: conversationId,
      userId,
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function deleteConversation(conversationId: string, userId: string) {
  return await prisma.conversation.delete({
    where: {
      id: conversationId,
      userId,
    },
  });
}

export async function addMessage(conversationId: string, role: string, text: string) {
  return await prisma.message.create({
    data: {
      conversationId,
      role,
      text,
    },
  });
}

export async function updateConversationTitle(conversationId: string, userId: string, title: string) {
  return await prisma.conversation.update({
    where: {
      id: conversationId,
      userId,
    },
    data: {
      title,
    },
  });
}
