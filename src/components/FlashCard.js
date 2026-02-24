import React, { useState, useEffect, useMemo, useRef } from 'react';
import TextSlot from './TextSlot';
import { toKatakana, toRomaji, toHiragana } from 'wanakana';

const SCRIPT_MODES = [
  { id: 'katakana', label: 'カタ', transform: (value) => toKatakana(value || '') },
  { id: 'hiragana', label: 'ひら', transform: (value) => toHiragana(value || '') },
  { id: 'romaji', label: 'RO', transform: (value) => toRomaji(value || '') || value },
];
const LONG_PRESS_DELAY = 600;

function FlashCard({ word = '', onNext }) {
  const characters = useMemo(() => Array.from(word || ''), [word]);
  const [scriptModes, setScriptModes] = useState([]);
  const [globalMode, setGlobalMode] = useState(0);
  const longPressTimeout = useRef(null);
  const longPressTriggered = useRef(false);

  useEffect(() => {
    setScriptModes(Array(characters.length).fill(0));
    setGlobalMode(0);
  }, [characters]);

  useEffect(() => {
    return () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };
  }, []);

  const cycleSlot = (index) => {
    setScriptModes((prev) => {
      if (!prev.length) return prev;
      const updated = [...prev];
      updated[index] = (updated[index] + 1) % SCRIPT_MODES.length;
      return updated;
    });
  };

  const handleSlotPress = (index) => {
    if (longPressTriggered.current) return;
    cycleSlot(index);
  };

  const cycleAll = () => {
    const nextMode = (globalMode + 1) % SCRIPT_MODES.length;
    setGlobalMode(nextMode);
    setScriptModes(Array(characters.length).fill(nextMode));
  };

  const startLongPress = () => {
    if (!characters.length) return;
    longPressTriggered.current = false;
    clearTimeout(longPressTimeout.current);
    longPressTimeout.current = setTimeout(() => {
      longPressTriggered.current = true;
      if (typeof onNext === 'function') {
        onNext();
      }
    }, LONG_PRESS_DELAY);
  };

  const endLongPress = (event) => {
    clearTimeout(longPressTimeout.current);
    if (longPressTriggered.current) {
      return;
    }
    const tappedSlot = event.target.closest('[data-slot="true"]');
    if (!tappedSlot) {
      cycleAll();
    }
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimeout.current);
  };

  return (
    <div
      className="flash-card"
      onPointerDown={startLongPress}
      onPointerUp={endLongPress}
      onPointerLeave={cancelLongPress}
      onPointerCancel={cancelLongPress}
    >
      <div className="slot-row">
        {characters.map((char, index) => {
          const modeIndex = scriptModes[index] ?? 0;
          const mode = SCRIPT_MODES[modeIndex];
          const displayValue = mode.transform(char);

          return (
            <TextSlot
              key={`${char}-${index}`}
              value={displayValue}
              scriptLabel={mode.label}
              modeId={mode.id}
              onClick={() => handleSlotPress(index)}
            />
          );
        })}
      </div>
      <p className="card-footnote">Tap the blank space to switch every character. Long press to skip.</p>
    </div>
  );
}

export default FlashCard;
