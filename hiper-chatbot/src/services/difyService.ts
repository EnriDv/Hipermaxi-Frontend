import type { 
  CreateSessionRequest, 
  CreateSessionResponse, 
  CreateTicketRequest, 
  CreateTicketResponse, 
  ChatStreamRequest,
  LoginRequest,
  LoginResponse,
  ClaimSessionRequest
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
  screenContext: any,
  onChunk: (chunk: string, sessionId: string) => void
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
        session_id: request.session_id,
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
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunkText = decoder.decode(value, { stream: true });
      
      // SSE format check (data: ... )
      if (chunkText.includes('data:')) {
        const lines = chunkText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const dataObj = JSON.parse(dataStr);
              if (dataObj.answer) {
                onChunk(dataObj.answer, request.session_id);
              }
            } catch (error) {
              if (!reportedInvalidJson) {
                reportedInvalidJson = true;
                console.warn('SSE chunk was not valid JSON. Falling back to raw text.', error);
              }
              onChunk(dataStr, request.session_id);
            }
          }
        }
      } else {
        onChunk(chunkText, request.session_id);
      }
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

export const claimSession = async (sessionId: string, request: ClaimSessionRequest): Promise<any> => {
  return await apiFetchJson(`/sessions/${sessionId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
};

export const getSessionMessages = async (sessionId: string): Promise<any[]> => {
  return await apiFetchJson<any[]>(`/sessions/${sessionId}/messages`);
};

export const getTickets = async (): Promise<any[]> => {
  return await apiFetchJson<any[]>('/tickets');
};

export const getHealth = async (): Promise<any> => {
  return await apiFetchJson('/health');
};
