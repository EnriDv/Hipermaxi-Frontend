import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Conversation, MockDashboardState } from '../types';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import {
  loadConversations,
  saveConversations,
  loadLastActiveConversationId,
  saveLastActiveConversationId,
  createNewConversation,
  addMessageToConversation,
  deleteConversation,
  createAnonId,
  updateConversation
} from '../services/chatStorage';
import { sendChatMessageToDifyStream, createSession, createTicket, claimSession, createConversation, getSessionsConversations, getConversationMessages, resolveSession } from '../services/difyService';
import { getAccessToken, getProviderProfile } from '../services/authStorage';
import { getUserMessageFromError } from '../services/apiClient';

interface ChatInterfaceProps {
  dashboardState: MockDashboardState;
  helpTrigger: { query: string; timestamp: number } | null;
}

interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'warning';
  title: string;
  message: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  dashboardState,
  helpTrigger,
}) => {
  const sessionProcessType = import.meta.env.VITE_SESSION_PROCESS_TYPE || 'activacion_codigo';
  const isAuthenticated = Boolean(getAccessToken());
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(() => {
    const loaded = loadConversations();
    const lastActiveId = loadLastActiveConversationId();
    if (lastActiveId) {
      return loaded.find((c) => c.id === lastActiveId) ?? null;
    }
    return loaded.length > 0 ? loaded[loaded.length - 1] : null;
  });
  const [sessionId, setSessionId] = useState<string | null>(null);

  const fetchAndSyncConversations = useCallback(async (sId: string, anonId: string | null) => {
    try {
      const backendConvs = await getSessionsConversations(sId, anonId);
      const syncedConversations: Conversation[] = [];
      
      for (const backendConv of backendConvs) {
        const convId = backendConv.conversation_id || backendConv.id;
        if (!convId) continue;
        
        try {
          const messagesData = await getConversationMessages(convId);
          const messages = messagesData.map((m: any) => ({
            id: m.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content || m.text || m.query || m.answer || '',
            timestamp: m.timestamp || m.created_at || Date.now()
          }));
          
          syncedConversations.push({
            id: convId,
            title: backendConv.title || (messages.find(msg => msg.role === 'user')?.content.substring(0, 30) + '...') || 'Chat de soporte',
            messages: messages,
            createdAt: backendConv.created_at || Date.now(),
            updatedAt: backendConv.updated_at || Date.now(),
            anonId: anonId,
            isClaimed: Boolean(isAuthenticated)
          });
        } catch (msgErr) {
          console.error(`Failed to fetch messages for conversation ${convId}:`, msgErr);
        }
      }
      
      if (syncedConversations.length > 0) {
        syncedConversations.sort((a, b) => b.updatedAt - a.updatedAt);
        setConversations(syncedConversations);
        saveConversations(syncedConversations);
      }
      return syncedConversations;
    } catch (error) {
      console.error('Failed to sync conversations from backend:', error);
      return [];
    }
  }, [isAuthenticated]);

  // Initialize Session and Sync Conversations from backend
  useEffect(() => {
    let isMounted = true;
    
    const initSession = async () => {
      try {
        const accessToken = getAccessToken();
        const anonId = accessToken ? null : (localStorage.getItem('hiper_chatbot_anon_id') || createAnonId());
        const providerProfile = getProviderProfile();
        const providerId = providerProfile ? (providerProfile.provider_id as string || providerProfile.id as string || null) : null;
        
        let sessionRes;
        if (accessToken) {
          sessionRes = await resolveSession({ provider_id: providerId });
        } else {
          sessionRes = await resolveSession({ anon_id: anonId });
        }
        
        if (!isMounted) return;
        
        const newSessionId = sessionRes.session_id;
        setSessionId(newSessionId);
        
        // Sync conversations from backend if authenticated
        if (accessToken) {
          await fetchAndSyncConversations(newSessionId, anonId);
        } else {
          setConversations([]);
          saveConversations([]);
          setActiveConversation(null);
          saveLastActiveConversationId(null);
        }
      } catch (err) {
        console.error('Failed to initialize session:', err);
      }
    };
    
    initSession();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, fetchAndSyncConversations]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatSwitching, setIsChatSwitching] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({
    x: window.innerWidth - 90,
    y: window.innerHeight - 100
  });
  const [bubbleAlignment, setBubbleAlignment] = useState<'left' | 'right'>('right');
  const [chatWindowSize, setChatWindowSize] = useState({ width: 400, height: 600 });
  const lastHelpTriggerRef = useRef<number | null>(null);
  const location = useLocation();
  const isInPortal = location.pathname.startsWith('/portal');
  const visibleConversations = isAuthenticated ? conversations : [];

  const showToast = useCallback(
    (type: 'error' | 'success' | 'warning', title: string, message: string) => {
      const id = `toast_${Date.now()}_${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    },
    []
  );

  const handleApiError = useCallback(
    (err: unknown, fallbackTitle: string, fallbackMessage: string) => {
      const userMessage = getUserMessageFromError(err);
      const title = fallbackTitle || 'Ups, algo salio mal';
      const msg = userMessage || fallbackMessage || 'No pudimos completar la solicitud. Intenta nuevamente o contacta a soporte.';
      showToast('error', title, msg);
    },
    [showToast]
  );

  const claimConversationIfNeeded = useCallback(
    async (conv: Conversation): Promise<Conversation | null> => {
      if (!isAuthenticated) return conv;
      if (!conv.anonId || conv.isClaimed) return conv;

      try {
        const sId = sessionId;
        if (sId) {
          await claimSession(sId, { anon_id: conv.anonId });
        }
        const updated = updateConversation(conv.id, { isClaimed: true });
        return updated || conv;
      } catch (error) {
        handleApiError(error, 'Error de Sesion', 'No pudimos validar tu sesion. Crea un nuevo chat o contacta a soporte.');
        return null;
      }
    },
    [handleApiError, isAuthenticated, sessionId]
  );

  const handleSendMessage = useCallback(async (
    text: string,
    analyzeScreen: boolean,
    options?: { openChat?: boolean }
  ) => {
    if (options?.openChat) {
      setIsOpen(true);
    }
    let currentConv = activeConversation;

    // Create new conversation if none exists
    if (!currentConv) {
      setIsLoading(true);
      try {
        const accessToken = getAccessToken();
        const anonId = accessToken ? null : (localStorage.getItem('hiper_chatbot_anon_id') || createAnonId());

        let sId = sessionId;
        if (!sId) {
          const providerProfile = getProviderProfile();
          const providerId = providerProfile ? (providerProfile.provider_id as string || providerProfile.id as string || null) : null;

          let sessionRes;
          if (accessToken) {
            sessionRes = await resolveSession({ provider_id: providerId });
          } else {
            sessionRes = await resolveSession({ anon_id: anonId });
          }

          sId = sessionRes.session_id;
          setSessionId(sId);
        }

        const layer = accessToken ? 'internal' : 'external';
        const processType = accessToken
          ? (dashboardState.activeTab === 'compras' ? 'carga_factura' : 'registro_sanitario')
          : sessionProcessType;

        const convRes = await createConversation({
          session_id: sId,
          layer,
          process_type: processType
        });

        currentConv = createNewConversation(
          convRes.conversation_id,
          text.length > 30 ? text.substring(0, 30) + '...' : text,
          { anonId, isClaimed: Boolean(accessToken) }
        );
        const updated = loadConversations();
        setConversations(updated);
      } catch (err) {
        setIsLoading(false);
        console.error('Failed to create conversation', err);
        handleApiError(err, 'Error al Iniciar Chat', 'No se pudo crear la conversación para enviar tu consulta.');
        return;
      }
    }

    const claimedConversation = currentConv
      ? await claimConversationIfNeeded(currentConv)
      : null;
    if (!claimedConversation) {
      setIsLoading(false);
      return;
    }
    currentConv = claimedConversation;

    // 1. Add user message to conversation
    // Capture snapshot of screen to attach if analyzed
    const snapshotText = analyzeScreen ? JSON.stringify(dashboardState) : undefined;

    const updatedConv = addMessageToConversation(currentConv.id, 'user', text, snapshotText);
    if (!updatedConv) return;

    setActiveConversation(updatedConv);
    setConversations(loadConversations());
    setIsLoading(true);

    try {
      // 2. Prepare streaming message in local React state
      const tempMessageId = `msg_stream_${Date.now()}`;
      let accumulatedAnswer = '';

      // Initialize empty assistant message in local state
      setActiveConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: tempMessageId,
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
            },
          ],
        };
      });

      // 3. Format Dify Request
      const streamRequest = {
        conversation_id: currentConv.id,
        message: text,
      };

      // 4. Send to Dify API as stream
      const screenContextParam = snapshotText ? JSON.parse(snapshotText) : dashboardState;
      await sendChatMessageToDifyStream(
        streamRequest,
        screenContextParam,
        (chunk) => {
          accumulatedAnswer += chunk;

          // Update message in real-time UI state
          setActiveConversation((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === tempMessageId
                  ? { ...msg, content: accumulatedAnswer }
                  : msg
              ),
            };
          });
        }
      );

      // 5. Finally, write the completed message to storage
      const finalConv = addMessageToConversation(
        currentConv.id,
        'assistant',
        accumulatedAnswer
      );

      if (finalConv) {
        // Override with the stored conversation to ensure correct IDs and timestamps
        setActiveConversation(finalConv);
      }
    } catch (error) {
      console.error('Error calling Dify API:', error);
      setIsLoading(false);
      handleApiError(error, 'Error de Comunicación', 'Error al transmitir la respuesta de la IA.');

      const userMessage = getUserMessageFromError(error);
      const errorMessage = userMessage
        ? `<div class="error-message-placeholder">⚠️ ${userMessage}</div>`
        : '<div class="error-message-placeholder">⚠️ Ups, algo salio mal. Intenta nuevamente o contacta a soporte.</div>';

      addMessageToConversation(
        currentConv.id,
        'assistant',
        errorMessage
      );
    } finally {
      setIsLoading(false);
      setConversations(loadConversations());
    }
  }, [activeConversation, dashboardState, handleApiError, sessionProcessType, claimConversationIfNeeded]);

  // Listen to outer help triggers (e.g. login links)
  useEffect(() => {
    if (!helpTrigger) return;
    if (helpTrigger.timestamp === lastHelpTriggerRef.current) return;
    lastHelpTriggerRef.current = helpTrigger.timestamp;
    void handleSendMessage(helpTrigger.query, false, { openChat: true });
  }, [helpTrigger, handleSendMessage]);

  const handleSelectConversation = async (id: string) => {
    const previousConversation = activeConversation;
    setIsChatSwitching(true);
    setActiveConversation(null);
    
    try {
      const messagesData = await getConversationMessages(id);
      const messages = messagesData.map((m: any) => ({
        id: m.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content || m.text || m.query || m.answer || '',
        timestamp: m.timestamp || m.created_at || Date.now()
      }));

      const loaded = loadConversations();
      const index = loaded.findIndex((c) => c.id === id);
      if (index !== -1) {
        loaded[index].messages = messages;
        loaded[index].updatedAt = Date.now();
        saveConversations(loaded);
      }

      const selected = loaded.find((c) => c.id === id) || {
        id,
        title: messages.find(msg => msg.role === 'user')?.content.substring(0, 30) + '...' || 'Conversación nueva',
        messages,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        anonId: isAuthenticated ? null : localStorage.getItem('hiper_chatbot_anon_id')
      };

      const claimed = await claimConversationIfNeeded(selected);
      if (!claimed) {
        setIsChatSwitching(false);
        setActiveConversation(previousConversation || null);
        return;
      }

      setActiveConversation(claimed);
      setConversations(loadConversations());
      saveLastActiveConversationId(claimed.id);
    } catch (err) {
      console.error('Failed to select conversation from backend:', err);
      const loaded = loadConversations();
      const selected = loaded.find((c) => c.id === id);
      if (!selected) {
        setIsChatSwitching(false);
        setActiveConversation(previousConversation || null);
        return;
      }

      const claimed = await claimConversationIfNeeded(selected);
      if (!claimed) {
        setIsChatSwitching(false);
        setActiveConversation(previousConversation || null);
        return;
      }

      setActiveConversation(claimed);
      setConversations(loadConversations());
      saveLastActiveConversationId(claimed.id);
    } finally {
      setIsChatSwitching(false);
    }
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Confirmation prompt
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este chat? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;

    const remaining = deleteConversation(id);
    setConversations(remaining);

    const lastActiveId = loadLastActiveConversationId();
    if (lastActiveId) {
      const active = remaining.find((c) => c.id === lastActiveId);
      setActiveConversation(active || null);
    } else {
      setActiveConversation(null);
    }
  };

  const handleCreateConversation = async () => {
    const previousConversation = activeConversation;
    setIsLoading(true);
    setIsChatSwitching(true);
    setActiveConversation(null);
    try {
      const accessToken = getAccessToken();
      const anonId = accessToken ? null : (localStorage.getItem('hiper_chatbot_anon_id') || createAnonId());

      let sId = sessionId;
      if (!sId) {
        const providerProfile = getProviderProfile();
        const providerId = providerProfile ? (providerProfile.provider_id as string || providerProfile.id as string || null) : null;

        let sessionRes;
        if (accessToken) {
          sessionRes = await resolveSession({ provider_id: providerId });
        } else {
          sessionRes = await resolveSession({ anon_id: anonId });
        }

        sId = sessionRes.session_id;
        setSessionId(sId);
      }

      const layer = accessToken ? 'internal' : 'external';
      const processType = accessToken
        ? (dashboardState.activeTab === 'compras' ? 'carga_factura' : 'registro_sanitario')
        : sessionProcessType;

      const convRes = await createConversation({
        session_id: sId,
        layer,
        process_type: processType
      });

      const newConv = createNewConversation(convRes.conversation_id, 'Conversación nueva', {
        anonId,
        isClaimed: Boolean(accessToken),
      });
      setConversations(loadConversations());
      setActiveConversation(newConv);
    } catch (err) {
      console.error('Error creating new conversation manually', err);
      handleApiError(err, 'Error al Crear Chat', 'No se pudo crear una nueva sesión de chat.');
      setActiveConversation(previousConversation || null);
    } finally {
      setIsLoading(false);
      setIsChatSwitching(false);
    }
  };

  const handleToggleOpen = async () => {
    setIsOpen(!isOpen);
    
    // Auto-create or auto-select conversation when opening
    if (!isOpen) {
      const anonId = isAuthenticated ? null : (localStorage.getItem('hiper_chatbot_anon_id') || createAnonId());
      
      let sId = sessionId;
      if (isAuthenticated && !sId) {
        setIsLoading(true);
        const providerProfile = getProviderProfile();
        const providerId = providerProfile ? (providerProfile.provider_id as string || providerProfile.id as string || null) : null;
        try {
          const sessionRes = await resolveSession({ provider_id: providerId });
          sId = sessionRes.session_id;
          setSessionId(sId);
        } catch (err) {
          console.error('Failed to resolve session on toggle open:', err);
        }
        setIsLoading(false);
      }

      if (isAuthenticated && sId) {
        setIsLoading(true);
        const synced = await fetchAndSyncConversations(sId, anonId);
        setIsLoading(false);
        
        const lastActiveId = loadLastActiveConversationId();
        const active = synced.find((c) => c.id === lastActiveId) || synced[0];
        
        if (active) {
          setActiveConversation(active);
          saveLastActiveConversationId(active.id);
        } else {
          handleCreateConversation();
        }
      } else {
        if (!activeConversation) {
          handleCreateConversation();
        }
      }
    }
  };

  return (
    <div className="hiper-chatbot-widget">
      {isOpen ? (
        <ChatWindow
          conversations={visibleConversations}
          activeConversation={activeConversation}
          isLoading={isLoading}
          isChatSwitching={isChatSwitching}
          onSendMessage={handleSendMessage}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onCreateConversation={handleCreateConversation}
          onMinimize={handleToggleOpen}
          dashboardState={dashboardState}
          isInPortal={isInPortal}
          alignment={bubbleAlignment}
          windowSize={chatWindowSize}
          onWindowResize={setChatWindowSize}
        />
      ) : (
        <ChatBubble
          onOpen={handleToggleOpen}
          position={bubblePosition}
          onPositionChange={(pos, align) => {
            setBubblePosition(pos);
            setBubbleAlignment(align);
          }}
        />
      )}

      {/* Toast Notifications */}
      <div className="hiper-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`hiper-toast ${toast.type}`}>
            <div className="toast-header">
              <div className="toast-header-left">
                <span>{toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '✅'}</span>
                <span className="toast-title" style={{ marginLeft: '6px' }}>{toast.title}</span>
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              >
                ✕
              </button>
            </div>
            <div className="toast-body">{toast.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ChatInterface;
