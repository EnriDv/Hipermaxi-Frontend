import React, { useState, useRef, useEffect } from 'react';
import type { Conversation, MockDashboardState, Message } from '../types';
import { ChatHistory } from './ChatHistory';

interface ChatWindowProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isLoading: boolean;
  onSendMessage: (text: string, analyzeScreen: boolean) => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onCreateConversation: () => void;
  onMinimize: () => void;
  dashboardState: MockDashboardState;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversations,
  activeConversation,
  isLoading,
  onSendMessage,
  onSelectConversation,
  onDeleteConversation,
  onCreateConversation,
  onMinimize,
  dashboardState,
}) => {
  const [inputText, setInputText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isLoading, showHistory]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText, false);
    setInputText('');
  };

  const handleInspectScreen = () => {
    if (isLoading) return;

    let label = '';
    if (!dashboardState.isAuthenticated) {
      label = 'Pantalla de Login';
    } else if (dashboardState.activeTab === 'catalogo') {
      label = 'Catálogo Electrónico';
      if (dashboardState.newProductForm && dashboardState.newProductForm.sanitaryRegister !== undefined) {
        label = 'Modal Registrar Producto';
      }
    } else {
      label = 'Órdenes de Compra';
      if (dashboardState.selectedOrderForInvoice) {
        label = `Modal Factura OC ${dashboardState.selectedOrderForInvoice.id} (Escenario ${dashboardState.invoiceScenario})`;
      } else if (dashboardState.selectedOrderForAVD) {
        label = `Modal AVD OC ${dashboardState.selectedOrderForAVD.id} (${dashboardState.selectedOrderForAVD.despatchAlert})`;
      }
    }

    // Automatically send a trigger question about the screen
    onSendMessage(`Analizar Pantalla: Por favor analiza la vista actual de "${label}" y explícame el estado o los errores si existen.`, true);
  };

  // Simple formatter to convert markdown-like syntax to HTML safely
  const renderMessageContent = (content: string) => {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    let formatted = escaped.replace(/^### (.*$)/gim, '<h4 class="msg-h4">$1</h4>');
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
  const getSuggestedChips = () => {
    const chips: Array<{ label: string; query: string; isSupport?: boolean }> = [];
    const state = dashboardState;

    if (!state.isAuthenticated) {
      chips.push({ label: '🔑 Crear accesos (Flujo 1)', query: '¿Cómo solicito credenciales por primera vez?' });
      chips.push({ label: '🔄 Reenvío de clave (Flujo 3)', query: 'Olvidé mi contraseña o necesito reenvío' });
      chips.push({ label: '⚙️ Activar código (Flujo 2)', query: '¿Cómo activo mi código de proveedor?' });
    } else if (state.activeTab === 'catalogo') {
      if (state.newProductForm && state.newProductForm.sanitaryRegister !== undefined) {
        chips.push({ label: '🖼️ Formatos de imagen (Flujo 4)', query: '¿Qué formatos de imagen se aceptan?' });
        chips.push({ label: '📋 Registro Sanitario AGEMED', query: '¿Cómo ingreso el Registro Sanitario AGEMED?' });
        chips.push({ label: '💰 Catálogo de precios', query: '¿Cómo agrego un precio al catálogo?' });
      } else {
        chips.push({ label: '📥 Importación Excel masiva', query: '¿Cómo hago la carga masiva con Excel?' });
        chips.push({ label: '✚ Registrar producto nuevo', query: '¿Cómo cargo un producto al portal?' });
      }
    } else if (state.activeTab === 'compras') {
      if (state.selectedOrderForInvoice) {
        chips.push({ label: '🚫 Botón oculto (Escenario A)', query: 'No me aparece la opción de cargar factura' });
        chips.push({ label: '📄 Formato PDF (Escenario B)', query: 'El sistema rechaza mi archivo de factura' });
        chips.push({ label: '⚠️ Factura Observada (Escenario C)', query: 'Mi factura aparece como Factura Observada' });
      } else if (state.selectedOrderForAVD) {
        chips.push({ label: '✏️ Editar cantidades AVD', query: '¿Cómo edito las cantidades de mi Aviso de Despacho?' });
        chips.push({ label: '🔒 AVD Confirmado bloqueado', query: 'Mi Aviso de Despacho está Confirmado y bloqueado (Flujo 6)' });
        chips.push({ label: '📋 Copiar cantidades de OC', query: '¿Cómo funciona Copiar cantidades de la OC?' });
      } else {
        chips.push({ label: '🧾 ¿Cómo cargo facturas? (SOP-05)', query: '¿Cómo subo mi factura PDF a las órdenes?' });
        chips.push({ label: '🚚 ¿Cómo hago el AVD? (SOP-06)', query: '¿Cómo completo el Aviso de Despacho (AVD)?' });
      }
    }

    // Always append WhatsApp support chip
    chips.push({ label: '📞 Servicio Técnico (WhatsApp)', query: 'Hablar con el Servicio Técnico', isSupport: true });
    return chips;
  };

  const handleChipClick = (query: string, isSupport?: boolean) => {
    if (isSupport) {
      window.open('https://wa.me/59178401543?text=Hola,%20necesito%20asistencia%20técnica%20en%20el%20portal%20de%20proveedores%20Hipermaxi.', '_blank');
    }
    onSendMessage(query, false);
  };

  return (
    <div className="chat-window-card animate-scale-up">
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
        {showHistory || !activeConversation ? (
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
                  <button onClick={() => onSendMessage('¿Cómo solicito credenciales por primera vez?', false)}>
                    💡 Solicitar accesos (Flujo 1)
                  </button>
                  <button onClick={() => onSendMessage('¿Cómo cargo un producto al portal?', false)}>
                    💡 Registrar un producto (Flujo 4)
                  </button>
                  <button onClick={handleInspectScreen}>
                    🔍 Analizar pantalla actual
                  </button>
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
                    <div className="message-bubble-wrapper">
                      <div className="message-bubble typing">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUGGESTION CHIPS: Rendered below the last assistant message when idle */}
                {!isLoading && activeConversation.messages.length > 0 && activeConversation.messages[activeConversation.messages.length - 1].role === 'assistant' && (
                  <div className="followup-suggestions-box animate-fade-in">
                    <span className="followup-label">🤖 ¿Necesitas algo más?</span>
                    <div className="followup-chips">
                      {getSuggestedChips().map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChipClick(chip.query, chip.isSupport)}
                          className={`followup-chip ${chip.isSupport ? 'support' : ''}`}
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
              disabled={isLoading}
              title="Permite al bot leer la tabla, campos y errores en pantalla"
            >
              🔍 Analizar Pantalla
            </button>
            {dashboardState.activeError && (
              <span className="error-indicator-badge animate-pulse">
                🚨 Alerta en Pantalla
              </span>
            )}
          </div>

          <form className="chat-input-form" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Escribe tu consulta aquí..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading || !inputText.trim()}>
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
