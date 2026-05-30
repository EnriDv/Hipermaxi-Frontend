import React, { useState, useEffect } from 'react';
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
  getOrCreateAnonId
} from '../services/chatStorage';
import { sendChatMessageToDifyStream, createSession, createTicket } from '../services/difyService';

interface ChatInterfaceProps {
  dashboardState: MockDashboardState;
  onDashboardError: (error: any) => void;
  helpTrigger: { query: string; timestamp: number } | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  dashboardState,
  onDashboardError,
  helpTrigger,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ 
    x: window.innerWidth - 90, 
    y: window.innerHeight - 100 
  });
  const [bubbleAlignment, setBubbleAlignment] = useState<'left' | 'right'>('right');
  const [chatWindowSize, setChatWindowSize] = useState({ width: 400, height: 600 });

  // Initialize and load conversations
  useEffect(() => {
    const loaded = loadConversations();
    setConversations(loaded);

    const lastActiveId = loadLastActiveConversationId();
    if (lastActiveId) {
      const active = loaded.find((c) => c.id === lastActiveId);
      if (active) {
        setActiveConversation(active);
      }
    }
  }, []);

  // Listen for global window errors and unhandled promise rejections
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      onDashboardError({
        code: 500,
        message: `Excepción no controlada: ${event.message} en ${event.filename}:${event.lineno}`,
        timestamp: Date.now(),
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      onDashboardError({
        code: 500,
        message: `Rechazo de promesa no controlado: ${event.reason}`,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onDashboardError]);

  // Listen to outer help triggers (e.g. login links)
  useEffect(() => {
    if (helpTrigger) {
      handleSendMessage(helpTrigger.query, false);
      if (!isOpen) {
        setIsOpen(true);
      }
    }
  }, [helpTrigger]);

  const handleSendMessage = async (text: string, analyzeScreen: boolean) => {
    let currentConv = activeConversation;
    
    // Create new conversation if none exists
    if (!currentConv) {
      setIsLoading(true);
      try {
        const anonId = getOrCreateAnonId();
        const sessionRes = await createSession({
          anon_id: anonId,
          layer: 'external',
          process_type: 'provider_support'
        });
        currentConv = createNewConversation(sessionRes.session_id, text.length > 30 ? text.substring(0, 30) + '...' : text);
        const updated = loadConversations();
        setConversations(updated);
      } catch (err) {
        setIsLoading(false);
        console.error('Failed to create session', err);
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
        (chunk, _convId) => {
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
      addMessageToConversation(
        currentConv.id,
        'assistant',
        '⚠️ Lo siento, ha ocurrido un error al conectar con el servidor de inteligencia artificial. Por favor intenta de nuevo.'
      );
    } finally {
      setIsLoading(false);
      setConversations(loadConversations());
    }
  };

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
      const anonId = getOrCreateAnonId();
      const sessionRes = await createSession({
        anon_id: anonId,
        layer: 'external',
        process_type: 'provider_support'
      });
      const newConv = createNewConversation(sessionRes.session_id);
      setConversations(loadConversations());
      setActiveConversation(newConv);
    } catch (err) {
      console.error('Error creating new session manually', err);
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
      const updatedConv = addMessageToConversation(
        activeConversation.id,
        'assistant',
        `✅ **Ticket Creado Exitosamente**\nSe ha generado el ticket de soporte número **${ticketRes.ticket_id}** en GLPI.\n\nUn agente de Soporte TI revisará tu caso y se comunicará contigo a la brevedad.`
      );
      if (updatedConv) setActiveConversation(updatedConv);
    } catch (err) {
      console.error('Error creating ticket', err);
      addMessageToConversation(
        activeConversation.id,
        'assistant',
        '⚠️ Hubo un error al intentar generar el ticket. Por favor contacta al soporte por WhatsApp.'
      );
    } finally {
      setIsLoading(false);
      setConversations(loadConversations());
    }
  };

  const hasErrors = !!dashboardState.activeError;

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
          hasErrorsOnScreen={hasErrors}
          position={bubblePosition}
          onPositionChange={(pos, align) => {
            setBubblePosition(pos);
            setBubbleAlignment(align);
          }}
        />
      )}
    </div>
  );
};
export default ChatInterface;
