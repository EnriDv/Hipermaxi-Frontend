import React, { useState, useRef, useEffect } from 'react';
import type { Conversation, MockDashboardState, Message } from '../types';
import { ChatHistory } from './ChatHistory';
import {
  buildScreenLabel,
  buildSuggestedChips,
  buildWelcomeSuggestions,
} from './chat/chatHelpers';

interface ChatWindowProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  isChatSwitching: boolean;
  isInPortal: boolean;
  onSendMessage: (text: string, analyzeScreen: boolean) => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onCreateConversation: () => void;
  onMinimize: () => void;
  dashboardState: MockDashboardState;
  alignment?: 'left' | 'right';
  windowSize: { width: number; height: number };
  onWindowResize: (size: { width: number; height: number }) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversations,
  activeConversation,
  isLoading,
  isChatSwitching,
  isInPortal,
  onSendMessage,
  onSelectConversation,
  onDeleteConversation,
  onCreateConversation,
  onMinimize,
  dashboardState,
  alignment = 'right',
  windowSize,
  onWindowResize,
}) => {
  const [inputText, setInputText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const isBusy = isLoading || isChatSwitching;
  const suggestedChips = buildSuggestedChips({
    dashboardState,
    activeConversation,
    isInPortal,
  });
  const welcomeSuggestions = buildWelcomeSuggestions(suggestedChips);
  
  // Resize states
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ w: 0, h: 0 });
  const resizeDirection = useRef<'top' | 'side' | 'corner'>('corner');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Resize Handlers
  const handleResizeStart = (e: React.MouseEvent, direction: 'top' | 'side' | 'corner') => {
    e.preventDefault();
    setIsResizing(true);
    resizeDirection.current = direction;
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = { w: windowSize.width, h: windowSize.height };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      let newW = resizeStartSize.current.w;
      let newH = resizeStartSize.current.h;
      
      const dx = e.clientX - resizeStartPos.current.x;
      const dy = e.clientY - resizeStartPos.current.y;

      if (resizeDirection.current === 'top' || resizeDirection.current === 'corner') {
        newH = resizeStartSize.current.h - dy; // expanding upwards means negative dy increases height
      }
      
      if (resizeDirection.current === 'side' || resizeDirection.current === 'corner') {
        if (alignment === 'right') {
          newW = resizeStartSize.current.w - dx; // expanding leftwards means negative dx increases width
        } else {
          newW = resizeStartSize.current.w + dx; // expanding rightwards means positive dx increases width
        }
      }

      // Constrain sizes
      newW = Math.max(300, Math.min(newW, window.innerWidth - 40));
      newH = Math.max(400, Math.min(newH, window.innerHeight - 40));

      onWindowResize({ width: newW, height: newH });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Disable text selection while resizing
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing, alignment, onWindowResize]);

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isLoading, showHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isBusy) return;
    onSendMessage(inputText, false);
    setInputText('');
  };

  const handleInspectScreen = () => {
    if (isBusy) return;
    const label = buildScreenLabel(dashboardState);
    onSendMessage(`Analizar Pantalla: Por favor analiza la vista actual de "${label}" y explícame el estado o los errores si existen.`, true);
  };

  // Simple formatter to convert markdown-like syntax to HTML safely
  const renderMessageContent = (content: string) => {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    let formatted = escaped.replace(/^# (.*$)/gim, '<h2 class="msg-h2">$1</h2>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h3 class="msg-h3">$1</h3>');
    formatted = formatted.replace(/^### (.*$)/gim, '<h4 class="msg-h4">$1</h4>');
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/`(.*?)`/g, '<code class="msg-code">$1</code>');

    formatted = formatted.split('\n').map(line => {
      if (line.trim().startsWith('* ')) {
        return `<li class="msg-li">${line.trim().substring(2)}</li>`;
      }
      if (line.trim().startsWith('- ')) {
        return `<li class="msg-li">${line.trim().substring(2)}</li>`;
      }
      return line;
    }).join('\n');

    formatted = formatted.replace(/(<li class="msg-li">.*<\/li>)/gs, '<ul class="msg-ul">$1</ul>');

    return <div dangerouslySetInnerHTML={{ __html: formatted.replace(/\n/g, '<br />') }} />;
  };

  // DYNAMIC SUGGESTED CHIPS GENERATION
  const handleChipClick = (query: string, isSupport?: boolean, isTicket?: boolean) => {
    if (isSupport) {
      window.open('https://wa.me/59178401543?text=Hola,%20necesito%20asistencia%20técnica%20en%20el%20portal%20de%20proveedores%20Hipermaxi.', '_blank');
      onSendMessage(query, false);
      return;
    }
    onSendMessage(query, false);
  };

  return (
    <div 
      className={`chat-window-card animate-scale-up ${alignment === 'left' ? 'left-aligned' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{ width: `${windowSize.width}px`, height: `${windowSize.height}px` }}
    >
      {/* Invisible resize handles */}
      <div 
        className="resize-handle top" 
        onMouseDown={(e) => handleResizeStart(e, 'top')} 
      />
      <div 
        className={`resize-handle side ${alignment === 'left' ? 'right-side' : 'left-side'}`} 
        onMouseDown={(e) => handleResizeStart(e, 'side')} 
      />
      <div 
        className={`resize-handle corner ${alignment === 'left' ? 'top-right' : 'top-left'}`} 
        onMouseDown={(e) => handleResizeStart(e, 'corner')} 
      />

      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          {activeConversation && (
            <button
              className={`header-back-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
              title={showHistory ? 'Volver al Chat' : 'Ver Historial'}
            >
              {showHistory ? '💬 Chat' : '⬅️ Historial'}
            </button>
          )}
          <div className="header-bot-info">
            <span className="bot-status-dot"></span>
            <span className="bot-name">Asistente Hipermaxi</span>
          </div>
        </div>
        <button className="minimize-btn" onClick={onMinimize} title="Minimizar chat">
          ✕
        </button>
      </div>

      {/* Body Content */}
      <div className="chat-body">
        {isChatSwitching ? (
          <div className="chat-loading">
            <div className="chat-loading-spinner" aria-hidden="true"></div>
            <div className="chat-loading-text">Cargando chat...</div>
          </div>
        ) : showHistory || !activeConversation ? (
          <ChatHistory
            conversations={conversations}
            activeId={activeConversation?.id || null}
            onSelect={(id) => {
              onSelectConversation(id);
              setShowHistory(false);
            }}
            onDelete={onDeleteConversation}
            onCreateNew={() => {
              onCreateConversation();
              setShowHistory(false);
            }}
          />
        ) : (
          <div className="chat-messages-viewport">
            {activeConversation.messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-avatar">🤖</div>
                <h3>¡Hola! Soy tu Asistente Inteligente</h3>
                <p>Puedo ayudarte a navegar y completar las tareas de este portal de proveedores de Hipermaxi.</p>
                <div className="welcome-suggestions">
                  {welcomeSuggestions.map((suggestion) => (
                    <button key={suggestion.label} onClick={() => onSendMessage(suggestion.query, false)}>
                      {suggestion.label}
                    </button>
                  ))}
                  {isInPortal ? (
                    <button onClick={handleInspectScreen}>
                      🔍 Analizar pantalla actual
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="messages-list">
                {activeConversation.messages.map((msg: Message) => (
                  <div key={msg.id} className={`message-bubble-row ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'assistant' ? '🤖' : '👤'}
                    </div>
                    <div className="message-bubble-wrapper">
                      <div className="message-bubble">
                        {renderMessageContent(msg.content)}
                      </div>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {isLoading && (!activeConversation.messages.length || activeConversation.messages[activeConversation.messages.length - 1].role !== 'assistant' || !activeConversation.messages[activeConversation.messages.length - 1].content) && (
                  <div className="message-bubble-row assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-bubble-wrapper" style={{ width: '100%' }}>
                      <div className="message-bubble skeleton-bubble">
                        <div className="skeleton-line" style={{ width: '90%' }}></div>
                        <div className="skeleton-line" style={{ width: '70%' }}></div>
                        <div className="skeleton-line" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUGGESTION CHIPS: Rendered below the last assistant message when idle */}
                {!isLoading && activeConversation.messages.length > 0 && activeConversation.messages[activeConversation.messages.length - 1].role === 'assistant' && (
                  <div className="followup-suggestions-box animate-fade-in">
                    <span className="followup-label">🤖 ¿Necesitas algo más?</span>
                    <div className="followup-chips">
                      {suggestedChips.map((chip, idx) => (
                        <button 
                          key={idx} 
                          className={`suggest-chip ${chip.isSupport ? 'support-chip' : ''} ${chip.isTicket ? 'ticket-chip' : ''}`}
                          onClick={() => handleChipClick(chip.query, chip.isSupport, chip.isTicket)}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Input (Only show when in active chat view) */}
      {!showHistory && activeConversation && (
        <div className="chat-footer">
          <div className="footer-actions">
            <button
              type="button"
              className="inspect-screen-btn"
              onClick={handleInspectScreen}
              disabled={isBusy}
              title="Permite al bot leer la tabla, campos y errores en pantalla"
            >
              🔍 Analizar Pantalla
            </button>
          </div>

          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Escribe tu consulta aquí..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isBusy}
            />
            <button type="submit" className="send-btn" disabled={isBusy || !inputText.trim()}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
