import React, { useState, useEffect, useRef } from 'react';

interface ChatBubbleProps {
  onOpen: () => void;
  hasErrorsOnScreen: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ onOpen, hasErrorsOnScreen }) => {
  // Dragging states
  const [position, setPosition] = useState({ x: window.innerWidth - 90, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Attention-seeking states:
  // - 'normal': White background, orange icon
  // - 'attention': Orange background, pulsing ring, message tooltip
  const [bubbleState, setBubbleState] = useState<'normal' | 'attention'>('normal');
  const timerRef = useRef<any>(null);

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // If we were in attention state, go back to normal
    setBubbleState('normal');

    timerRef.current = setTimeout(() => {
      setBubbleState('attention');
    }, 10000); // 10 seconds of inactivity triggers attention state
  };

  useEffect(() => {
    resetInactivityTimer();

    // Re-adjust bubble position if window resizes
    const handleResize = () => {
      setPosition((prev) => {
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;
        return {
          x: Math.min(prev.x, maxX),
          y: Math.min(prev.y, maxY),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keypress', resetInactivityTimer);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keypress', resetInactivityTimer);
    };
  }, []);

  // Force attention state if a server error or exception appears on the screen
  useEffect(() => {
    if (hasErrorsOnScreen) {
      setBubbleState('attention');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    } else {
      resetInactivityTimer();
    }
  }, [hasErrorsOnScreen]);

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const dx = e.clientX - mouseDownPos.current.x;
      const dy = e.clientY - mouseDownPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        hasDraggedRef.current = true;
      }

      let newX = e.clientX - dragStart.current.x;
      let newY = e.clientY - dragStart.current.y;

      // Bound checking (contain inside viewport)
      const bubbleSize = 65; // px
      const minX = 10;
      const maxX = window.innerWidth - bubbleSize - 10;
      const minY = 10;
      const maxY = window.innerHeight - bubbleSize - 10;

      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Touch Handlers for mobile/touch screens
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    const touch = e.touches[0];
    mouseDownPos.current = { x: touch.clientX, y: touch.clientY };
    dragStart.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    const dx = touch.clientX - mouseDownPos.current.x;
    const dy = touch.clientY - mouseDownPos.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      hasDraggedRef.current = true;
    }

    let newX = touch.clientX - dragStart.current.x;
    let newY = touch.clientY - dragStart.current.y;

    const bubbleSize = 65;
    const minX = 10;
    const maxX = window.innerWidth - bubbleSize - 10;
    const minY = 10;
    const maxY = window.innerHeight - bubbleSize - 10;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleBubbleClick = () => {
    // If they were dragging, don't trigger click action
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    onOpen();
  };

  return (
    <div
      ref={bubbleRef}
      className={`chat-bubble-wrapper ${bubbleState} ${hasErrorsOnScreen ? 'has-error' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleBubbleClick}
    >
      {/* Wave pulse animation when in attention state */}
      {bubbleState === 'attention' && (
        <>
          <div className="pulse-ring ring-1"></div>
          <div className="pulse-ring ring-2"></div>
        </>
      )}

      {/* Actual bubble inner */}
      <div className="bubble-circle">
        {hasErrorsOnScreen ? (
          <div className="bubble-error-badge">!</div>
        ) : null}
        
        {/* Robot / Chat SVG Icon */}
        <svg className="bubble-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 14.3361 2.79813 16.4858 4.1287 18.2109L2.29289 20.2929C1.90237 20.6834 1.90237 21.3166 2.29289 21.7071C2.68342 22.0976 3.31658 22.0976 3.70711 21.7071L6.09631 19.3179C7.75338 20.3958 9.79979 21 12 21C17.5228 21 22 16.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
          <path d="M7 10.5C7 9.67157 7.67157 9 8.5 9C9.32843 9 10 9.67157 10 10.5C10 11.3284 9.32843 12 8.5 12C7.67157 12 7 11.3284 7 10.5ZM14 10.5C14 9.67157 14.6716 9 15.5 9C16.3284 9 17 9.67157 17 10.5C17 11.3284 16.3284 12 15.5 12C14.6716 12 14 11.3284 14 10.5ZM9.5 15C9.5 15 10.5 17 12 17C13.5 17 14.5 15 14.5 15H9.5Z" fill="white"/>
        </svg>
      </div>

      {/* Floating tooltip message */}
      {bubbleState === 'attention' && (
        <div className="bubble-tooltip animate-fade-in">
          {hasErrorsOnScreen ? (
            <span>🚨 ¡Veo un error en pantalla! Pregúntame cómo solucionarlo.</span>
          ) : (
            <span>🤖 ¿Necesitas ayuda con el producto o despacho? ¡Pregúntame!</span>
          )}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};
