import type { 
  CreateSessionRequest, 
  CreateSessionResponse, 
  CreateTicketRequest, 
  CreateTicketResponse, 
  ChatStreamRequest,
  LoginRequest,
  LoginResponse,
  CreateConversationRequest,
  CreateConversationResponse
} from '../types';
import { apiFetch, apiFetchJson, createApiErrorFromStatus, normalizeApiError } from './apiClient';

export const createSession = async (request: CreateSessionRequest): Promise<CreateSessionResponse> => {
  return await apiFetchJson<CreateSessionResponse>('/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });
};

export const resolveSession = async (params: { anon_id?: string | null; provider_id?: string | null }): Promise<any> => {
  const queryParts: string[] = [];
  if (params.anon_id) queryParts.push(`anon_id=${encodeURIComponent(params.anon_id)}`);
  if (params.provider_id) queryParts.push(`provider_id=${encodeURIComponent(params.provider_id)}`);
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  
  return await apiFetchJson<any>(`/sessions/resolve${query}`);
};

export const createTicket = async (request: CreateTicketRequest): Promise<CreateTicketResponse> => {
  return await apiFetchJson<CreateTicketResponse>('/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });
};

export const sendChatMessageToDifyStream = async (
  request: ChatStreamRequest,
  _screenContext: any,
  onChunk: (chunk: string, conversationId: string) => void
): Promise<void> => {
 
  let response: Response;
  try {
    response = await apiFetch('/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream' 
      },
      body: JSON.stringify({
        conversation_id: request.conversation_id,
        message: request.message,
        image_url: request.image_url
      })
    });
  } catch (error) {
    throw normalizeApiError(error);
  }

  if (!response.ok) {
    throw createApiErrorFromStatus(response.status, response.statusText);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by the browser or no body returned.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  let reportedInvalidJson = false;
  let buffer = '';
  let shouldStop = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const eventBlock of events) {
        if (shouldStop) break;
        const lines = eventBlock.split('\n');
        const dataLines: string[] = [];

        for (const line of lines) {
          if (line.startsWith('data:')) {
            dataLines.push(line.replace(/^data:\s?/, ''));
          }
        }

        const dataStr = dataLines.join('\n').trim();
        if (!dataStr) continue;
        if (dataStr === '[DONE]') {
          shouldStop = true;
          break;
        }

        try {
          const dataObj = JSON.parse(dataStr);
          if (dataObj?.done === true) {
            shouldStop = true;
            break;
          }
          if (typeof dataObj?.text === 'string') {
            onChunk(dataObj.text, request.conversation_id);
            continue;
          }
          if (typeof dataObj?.answer === 'string') {
            onChunk(dataObj.answer, request.conversation_id);
            continue;
          }
        } catch (error) {
          if (!reportedInvalidJson) {
            reportedInvalidJson = true;
            console.warn('SSE chunk was not valid JSON. Falling back to raw text.', error);
          }
        }

        onChunk(dataStr, request.conversation_id);
      }

      if (shouldStop) break;
    }
  } finally {
    reader.releaseLock();
  }
};

export const loginAPI = async (request: LoginRequest): Promise<LoginResponse> => {
  return await apiFetchJson<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
};

export const logoutAPI = async (): Promise<any> => {
  return await apiFetchJson('/auth/logout', { method: 'POST' });
};

export const getSessionMessages = async (sessionId: string): Promise<any[]> => {
  return await apiFetchJson<any[]>(`/sessions/${sessionId}/messages`);
};

export const createConversation = async (request: CreateConversationRequest): Promise<CreateConversationResponse> => {
  return await apiFetchJson<CreateConversationResponse>('/conversations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });
};

export const getSessionsConversations = async (
  sessionId: string,
  anonId?: string | null,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> => {
  const queryParts: string[] = [];
  if (anonId) queryParts.push(`anon_id=${encodeURIComponent(anonId)}`);
  queryParts.push(`limit=${limit}`);
  queryParts.push(`offset=${offset}`);
  const query = `?${queryParts.join('&')}`;
  return await apiFetchJson<any[]>(`/sessions/${sessionId}/conversations${query}`);
};

export const getConversationMessages = async (
  conversationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> => {
  const query = `?limit=${limit}&offset=${offset}`;
  return await apiFetchJson<any[]>(`/conversations/${conversationId}/messages${query}`);
};

export const getTickets = async (): Promise<any[]> => {
  return await apiFetchJson<any[]>('/tickets');
};

export const getHealth = async (): Promise<any> => {
  return await apiFetchJson('/health');
};
