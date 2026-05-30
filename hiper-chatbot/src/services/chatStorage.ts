import type { Conversation, Message } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'hiper_chatbot_conversations',
  LAST_ACTIVE_ID: 'hiper_chatbot_last_active_id',
};

export const loadConversations = (): Conversation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading conversations from localStorage:', error);
    return [];
  }
};

export const saveConversations = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations to localStorage:', error);
  }
};

export const loadLastActiveConversationId = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_ID);
  } catch {
    return null;
  }
};

export const saveLastActiveConversationId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVE_ID);
    }
  } catch (error) {
    console.error('Error saving last active conversation id:', error);
  }
};

export const createNewConversation = (title = 'Conversación nueva'): Conversation => {
  const conversations = loadConversations();
  const newId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const newConv: Conversation = {
    id: newId,
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  conversations.push(newConv);
  saveConversations(conversations);
  saveLastActiveConversationId(newId);
  return newConv;
};

export const addMessageToConversation = (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  screenSnapshot?: string
): Conversation | null => {
  const conversations = loadConversations();
  const index = conversations.findIndex((c) => c.id === conversationId);
  if (index === -1) return null;

  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: Date.now(),
    screenSnapshot,
  };

  conversations[index].messages.push(newMessage);
  conversations[index].updatedAt = Date.now();
  
  // Update title if it's the first message
  if (conversations[index].messages.filter(m => m.role === 'user').length === 1 && role === 'user') {
    conversations[index].title = content.length > 30 ? content.substring(0, 30) + '...' : content;
  }

  saveConversations(conversations);
  return conversations[index];
};

export const deleteConversation = (conversationId: string): Conversation[] => {
  let conversations = loadConversations();
  conversations = conversations.filter((c) => c.id !== conversationId);
  saveConversations(conversations);

  const lastActiveId = loadLastActiveConversationId();
  if (lastActiveId === conversationId) {
    const nextActive = conversations.length > 0 ? conversations[conversations.length - 1].id : null;
    saveLastActiveConversationId(nextActive);
  }
  return conversations;
};
