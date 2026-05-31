import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Conversation, MockDashboardState } from '../types';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import { 
  loadConversations, 
  loadLastActiveConversationId, 
  saveLastActiveConversationId,
  createNewConversation,
  addMessageToConversation,
  deleteConversation,
  createAnonId
} from '../services/chatStorage';
import { sendChatMessageToDifyStream, createSession, createTicket } from '../services/difyService';
import { getAccessToken } from '../services/authStorage';
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
  const [isLoading, setIsLoading] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ 
    x: window.innerWidth - 90, 
    y: window.innerHeight - 100 
  });
  const [bubbleAlignment, setBubbleAlignment] = useState<'left' | 'right'>('right');
  const [chatWindowSize, setChatWindowSize] = useState({ width: 400, height: 600 });
  const lastHelpTriggerRef = useRef<number | null>(null);

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
        const sessionRes = await createSession({
          ...(accessToken ? {} : { anon_id: createAnonId() }),
          layer: 'external',
          process_type: sessionProcessType
        });
        currentConv = createNewConversation(sessionRes.session_id, text.length > 30 ? text.substring(0, 30) + '...' : text);
        const updated = loadConversations();
        setConversations(updated);
      } catch (err) {
        setIsLoading(false);
        console.error('Failed to create session', err);
        handleApiError(err, 'Error al Iniciar Chat', 'No se pudo crear la sesión para enviar tu consulta.');
        return;
      }
    }

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
        session_id: currentConv.id,
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
  }, [activeConversation, dashboardState, handleApiError, sessionProcessType]);

  // Listen to outer help triggers (e.g. login links)
  useEffect(() => {
    if (!helpTrigger) return;
    if (helpTrigger.timestamp === lastHelpTriggerRef.current) return;
    lastHelpTriggerRef.current = helpTrigger.timestamp;
    void handleSendMessage(helpTrigger.query, false, { openChat: true });
  }, [helpTrigger, handleSendMessage]);

  const handleSelectConversation = (id: string) => {
    const loaded = loadConversations();
    const active = loaded.find((c) => c.id === id);
    if (active) {
      setActiveConversation(active);
      saveLastActiveConversationId(id);
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
    setIsLoading(true);
    try {
      const accessToken = getAccessToken();
      const sessionRes = await createSession({
        ...(accessToken ? {} : { anon_id: createAnonId() }),
        layer: 'external',
        process_type: sessionProcessType
      });
      const newConv = createNewConversation(sessionRes.session_id);
      setConversations(loadConversations());
      setActiveConversation(newConv);
    } catch (err) {
      console.error('Error creating new session manually', err);
      handleApiError(err, 'Error al Crear Chat', 'No se pudo crear una nueva sesión de chat.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOpen = () => {
    setIsOpen(!isOpen);
    
    // Auto-create or auto-select conversation when opening
    if (!isOpen) {
      const loaded = loadConversations();
      setConversations(loaded);
      
      const lastActiveId = loadLastActiveConversationId();
      const active = loaded.find((c) => c.id === lastActiveId);
      
      if (active) {
        setActiveConversation(active);
      } else if (loaded.length > 0) {
        setActiveConversation(loaded[loaded.length - 1]);
        saveLastActiveConversationId(loaded[loaded.length - 1].id);
      } else {
        // Direct creation of new chat if none exists
        handleCreateConversation();
      }
    }
  };

  const handleCreateTicket = async () => {
    if (!activeConversation) return;
    setIsLoading(true);
    try {
      const ticketRes = await createTicket({
        session_id: activeConversation.id,
        issue_summary: 'Soporte solicitado desde el Asistente Hipermaxi',
        process_type: dashboardState.activeTab === 'compras' ? 'SOP-05/06' : 'SOP-04'
      });
      
      addMessageToConversation(
        activeConversation.id,
        'assistant',
        `✅ He generado un ticket para derivar tu caso a soporte de segundo nivel.\n\n**ID de Ticket:** \`${ticketRes.ticket_id}\`\n\nEl equipo se contactará contigo por correo electrónico en las próximas 24 horas hábiles.`
      );
    } catch (error) {
      console.error('Error creating ticket:', error);
      handleApiError(error, 'Error al Crear Ticket', 'No se pudo generar el ticket de soporte.');
      
      const userMessage = getUserMessageFromError(error);
      const errorMessage = userMessage
        ? `<div class="error-message-placeholder">⚠️ ${userMessage}</div>`
        : '<div class="error-message-placeholder">⚠️ Ups, algo salio mal al generar el ticket. Intenta nuevamente o contacta a soporte.</div>';

      addMessageToConversation(
        activeConversation.id,
        'assistant',
        errorMessage
      );
    } finally {
      setIsLoading(false);
      setConversations(loadConversations());
    }
  };

  return (
    <div className="hiper-chatbot-widget">
      {isOpen ? (
        <ChatWindow
          conversations={conversations}
          activeConversation={activeConversation}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onCreateConversation={handleCreateConversation}
          onCreateTicket={handleCreateTicket}
          onMinimize={handleToggleOpen}
          dashboardState={dashboardState}
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
