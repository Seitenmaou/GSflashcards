import React, { useState, useEffect, useRef } from 'react';

const LONG_PRESS_DELAY = 550;
const DOUBLE_TAP_DELAY = 250;

function FlashCard({ card, onNext, onPrevious }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const longPressTimeout = useRef(null);
  const singleTapTimeout = useRef(null);
  const longPressTriggered = useRef(false);
  const lastTapAt = useRef(0);

  useEffect(() => {
    setIsFlipped(false);
  }, [card?.front, card?.backLeft, card?.backRight]);

  useEffect(() => {
    return () => {
      clearTimeout(longPressTimeout.current);
      clearTimeout(singleTapTimeout.current);
    };
  }, []);

  const startLongPress = () => {
    if (!card) return;
    longPressTriggered.current = false;
    clearTimeout(longPressTimeout.current);
    longPressTimeout.current = setTimeout(() => {
      longPressTriggered.current = true;
      clearTimeout(singleTapTimeout.current);
      if (typeof onNext === 'function') {
        onNext();
      }
    }, LONG_PRESS_DELAY);
  };

  const endPress = () => {
    if (!card) return;
    clearTimeout(longPressTimeout.current);
    if (longPressTriggered.current) {
      return;
    }

    const now = Date.now();
    const isDoubleTap = now - lastTapAt.current < DOUBLE_TAP_DELAY;

    if (isDoubleTap) {
      clearTimeout(singleTapTimeout.current);
      lastTapAt.current = 0;
      if (typeof onPrevious === 'function') {
        onPrevious();
      }
      return;
    }

    lastTapAt.current = now;
    clearTimeout(singleTapTimeout.current);
    singleTapTimeout.current = setTimeout(() => {
      setIsFlipped((prev) => !prev);
      lastTapAt.current = 0;
    }, DOUBLE_TAP_DELAY);
  };

  const cancelPress = () => {
    clearTimeout(longPressTimeout.current);
  };

  return (
    <div
      className={`flash-card ${isFlipped ? 'is-flipped' : ''}`}
      onPointerDown={startLongPress}
      onPointerUp={endPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(event) => event.preventDefault()}
    >
      <p className="card-side-label">{isFlipped ? 'Back' : 'Front'}</p>
      {isFlipped ? (
        <div className={`card-value card-back ${card?.hasSplitBack ? 'card-back-split' : ''}`}>
          <div className="card-back-panel card-back-left">{card?.backLeft || ''}</div>
          {card?.hasSplitBack && <div className="card-back-panel card-back-right">{card?.backRight || ''}</div>}
        </div>
      ) : (
        <div className="card-value">{card?.front || ''}</div>
      )}
      <p className="card-footnote">Tap to flip. Long press: next card. Double tap: previous card.</p>
    </div>
  );
}

export default FlashCard;
