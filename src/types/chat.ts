export interface MessageImage {
  id: string;
  data: string; // Base64 encoded
  mimeType: string;
  createdAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: MessageImage[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ConversationDetail extends Omit<Conversation, 'messageCount'> {
  messages: Message[];
}
