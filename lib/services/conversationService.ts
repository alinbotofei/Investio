import { prisma } from "@/lib/prisma";

export async function createConversation(userId: string, title?: string) {
  try {
    const conversation = await prisma.conversation.create({
      data: {
        userId,
        title: title || 'New Conversation',
      },
    });
    return conversation;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

export async function getConversations(userId: string) {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function getConversation(conversationId: string, userId: string) {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return conversation;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}

export async function deleteConversation(conversationId: string, userId: string) {
  try {
    await prisma.conversation.delete({
      where: {
        id: conversationId,
        userId,
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

export async function addMessage(conversationId: string, role: string, text: string) {
  try {
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
  } catch (error) {
    console.error('Error adding message:', error);
    return null;
  }
}

export async function updateConversationTitle(conversationId: string, userId: string, title: string) {
  try {
    const conversation = await prisma.conversation.update({
      where: {
        id: conversationId,
        userId,
      },
      data: { title },
    });
    return conversation;
  } catch (error) {
    console.error('Error updating conversation title:', error);
    return null;
  }
}
