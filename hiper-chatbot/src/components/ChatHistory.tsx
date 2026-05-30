import React from 'react';
import type { Conversation } from '../types';

interface ChatHistoryProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onCreateNew: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onCreateNew,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // Check if same day
    if (date.toDateString() === now.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chat-history-container">
      <div className="history-header">
        <h3>Historial de Chats</h3>
        <button className="new-chat-btn" onClick={onCreateNew} title="Iniciar nuevo chat">
          ➕ Nuevo Chat
        </button>
      </div>

      <div className="history-list">
        {conversations.length === 0 ? (
          <div className="empty-history">
            <div className="empty-icon">💬</div>
            <p>No tienes chats guardados.</p>
            <button className="create-first-btn" onClick={onCreateNew}>
              Crear tu primer chat
            </button>
          </div>
        ) : (
          conversations
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((conv) => {
              return (
                <div
                  key={conv.id}
                  className={`history-item ${conv.id === activeId ? 'active' : ''}`}
                  onClick={() => onSelect(conv.id)}
                >
                  <div className="history-item-content">
                    <div className="item-title">{conv.title}</div>
                    <div className="item-meta">
                      <span>{formatTime(conv.updatedAt)}</span>
                      <span className="dot">•</span>
                      <span>{conv.messages.length} mensaje(s)</span>
                    </div>
                  </div>
                  <button
                    className="delete-conv-btn"
                    onClick={(e) => onDelete(conv.id, e)}
                    title="Eliminar conversación"
                  >
                    &times;
                  </button>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};
