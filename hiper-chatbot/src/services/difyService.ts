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

/**
 * Real POST /sessions
 */
export const createSession = async (request: CreateSessionRequest): Promise<CreateSessionResponse> => {
  const response = await fetch('/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    throw new Error(`Error creating session: ${response.statusText}`);
  }
  
  return await response.json();
};

/**
 * Real POST /tickets
 */
export const createTicket = async (request: CreateTicketRequest): Promise<CreateTicketResponse> => {
  const response = await fetch('/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    throw new Error(`Error creating ticket: ${response.statusText}`);
  }
  
  return await response.json();
};

/**
 * Real streaming request to POST /chat/stream endpoint
 */
export const sendChatMessageToDifyStream = async (
  request: ChatStreamRequest,
  screenContext: any,
  onChunk: (chunk: string, sessionId: string) => void
): Promise<void> => {
  // In a real scenario, you might send screenContext in another way if the API allows it.
  // For now, we only send what the ChatStreamRequest contract dictates: session_id, message, image_url
  
  const response = await fetch('/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream' // or application/json if chunked, usually SSE is text/event-stream
    },
    body: JSON.stringify({
      session_id: request.session_id,
      message: request.message,
      image_url: request.image_url
    })
  });

  if (!response.ok) {
    throw new Error(`Error streaming chat: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported by the browser or no body returned.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

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
            } catch {
              // If it's not JSON, it might just be the raw text string
              onChunk(dataStr, request.session_id);
            }
          }
        }
      } else {
        // If the API just returns raw chunked text
        onChunk(chunkText, request.session_id);
      }
    }
  } finally {
    reader.releaseLock();
  }
};

/**
 * Real POST /auth/login
 */
export const loginAPI = async (request: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error(`Error login: ${response.statusText}`);
  return await response.json();
};

/**
 * Real POST /auth/logout
 */
export const logoutAPI = async (): Promise<any> => {
  const response = await fetch('/auth/logout', { method: 'POST' });
  if (!response.ok) throw new Error(`Error logout: ${response.statusText}`);
  return await response.json();
};

/**
 * Real POST /sessions/{session_id}/claim
 */
export const claimSession = async (sessionId: string, request: ClaimSessionRequest): Promise<any> => {
  const response = await fetch(`/sessions/${sessionId}/claim`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error(`Error claiming session: ${response.statusText}`);
  return await response.json();
};

/**
 * Real GET /sessions/{session_id}/messages
 */
export const getSessionMessages = async (sessionId: string): Promise<any[]> => {
  const response = await fetch(`/sessions/${sessionId}/messages`);
  if (!response.ok) throw new Error(`Error fetching messages: ${response.statusText}`);
  return await response.json();
};

/**
 * Real GET /tickets
 */
export const getTickets = async (): Promise<any[]> => {
  const response = await fetch('/tickets');
  if (!response.ok) throw new Error(`Error fetching tickets: ${response.statusText}`);
  return await response.json();
};

/**
 * Real GET /health
 */
export const getHealth = async (): Promise<any> => {
  const response = await fetch('/health');
  if (!response.ok) throw new Error(`Error health check: ${response.statusText}`);
  return await response.json();
};
