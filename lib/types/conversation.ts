export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: ConversationMessage[];
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: string;
  text: string;
  createdAt: Date;
}
