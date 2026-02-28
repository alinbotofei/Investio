import { prisma } from "@/lib/prisma";

export const conversationService = {
  async createConversation(userId: string, title?: string) {
    return await prisma.conversation.create({
      data: {
        userId,
        title: title || "New conversation",
      },
    });
  },

  async getUserConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  async getConversationById(conversationId: string, userId: string) {
    return await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  },

  async updateConversationTitle(
    conversationId: string,
    userId: string,
    title: string
  ) {
    return await prisma.conversation.updateMany({
      where: { id: conversationId, userId },
      data: { title },
    });
  },

  async deleteConversation(conversationId: string, userId: string) {
    return await prisma.conversation.deleteMany({
      where: { id: conversationId, userId },
    });
  },

  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    text: string
  ) {
    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        text,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  },
};
