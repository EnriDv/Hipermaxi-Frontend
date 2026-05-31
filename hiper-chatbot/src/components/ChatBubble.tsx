import React, { useState, useEffect, useRef } from 'react';
import bubbleMessages from '../data/bubbleMessages.json';

interface ChatBubbleProps {
  onOpen: () => void;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }, align: 'left' | 'right') => void;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ onOpen, position, onPositionChange }) => {
  // Dragging states
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mouseDownPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(position);

  useEffect(() => {
    posRef.current = position;
  }, [position]);

  const [showTooltip, setShowTooltip] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  // Periodic reminder tooltip
  useEffect(() => {
    // Show a tooltip shortly after mount (5 seconds)
    const initialTimer = setTimeout(() => {
      if (!isDragging) {
        setShowTooltip(true);
      }
    }, 5000);

    // Set up interval to show it every 45 seconds
    const interval = setInterval(() => {
      if (!isDragging) {
        setShowTooltip(true);
        setMessageIndex((prev) => (prev + 1) % bubbleMessages.length);
      }
    }, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDragging]);

  // Dismiss tooltip after 6 seconds
  useEffect(() => {
    if (showTooltip) {
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 6000);
      return () => clearTimeout(hideTimer);
    }
  }, [showTooltip]);

  // Attention-seeking states:
  // - 'normal': White background, orange icon
  // - 'attention': Orange background, pulsing ring, message tooltip
  const bubbleState = (showTooltip || isDragging) ? 'attention' : 'normal';

  useEffect(() => {
    // Re-adjust bubble position if window resizes
    const handleResize = () => {
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      const align = position.x < window.innerWidth / 2 ? 'left' : 'right';
      onPositionChange({
        x: Math.min(position.x, maxX),
        y: Math.min(position.y, maxY),
      }, align);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force attention state if a server error or exception appears on the screen
  // This is now purely handled by the bubbleState derived variable


  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setShowTooltip(false); // Hide tooltip when starting to drag
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

      onPositionChange({ x: newX, y: newY }, newX < window.innerWidth / 2 ? 'left' : 'right');
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Snap logic
      if (isDragging) {
        let finalX = posRef.current.x;
        let align: 'left' | 'right' = 'right';
        if (posRef.current.x < window.innerWidth / 2) {
          finalX = 20;
          align = 'left';
        } else {
          finalX = window.innerWidth - 65 - 20; // bubble width is approx 60-65
          align = 'right';
        }
        onPositionChange({ x: finalX, y: posRef.current.y }, align);
      }
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
    setShowTooltip(false); // Hide tooltip when starting to drag
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

    onPositionChange({ x: newX, y: newY }, newX < window.innerWidth / 2 ? 'left' : 'right');
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Snap logic
    if (isDragging) {
      let finalX = posRef.current.x;
      let align: 'left' | 'right' = 'right';
      if (posRef.current.x < window.innerWidth / 2) {
        finalX = 20;
        align = 'left';
      } else {
        finalX = window.innerWidth - 65 - 20;
        align = 'right';
      }
      onPositionChange({ x: finalX, y: posRef.current.y }, align);
    }
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
      className={`chat-bubble-wrapper ${bubbleState}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1), top 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
        {/* Robot / Chat SVG Icon */}
        <svg className="bubble-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 14.3361 2.79813 16.4858 4.1287 18.2109L2.29289 20.2929C1.90237 20.6834 1.90237 21.3166 2.29289 21.7071C2.68342 22.0976 3.31658 22.0976 3.70711 21.7071L6.09631 19.3179C7.75338 20.3958 9.79979 21 12 21C17.5228 21 22 16.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
          <path d="M7 10.5C7 9.67157 7.67157 9 8.5 9C9.32843 9 10 9.67157 10 10.5C10 11.3284 9.32843 12 8.5 12C7.67157 12 7 11.3284 7 10.5ZM14 10.5C14 9.67157 14.6716 9 15.5 9C16.3284 9 17 9.67157 17 10.5C17 11.3284 16.3284 12 15.5 12C14.6716 12 14 11.3284 14 10.5ZM9.5 15C9.5 15 10.5 17 12 17C13.5 17 14.5 15 14.5 15H9.5Z" fill="white"/>
        </svg>
      </div>

      {/* Floating tooltip message from JSON list */}
      {showTooltip && !isDragging && (
        <div className={`bubble-tooltip animate-fade-in ${position.x < window.innerWidth / 2 ? 'left-aligned' : ''}`}>
          <span>{bubbleMessages[messageIndex]}</span>
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};
