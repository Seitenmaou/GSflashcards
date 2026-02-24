import './menu.css';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function Menu({ timeout = 5000, categories, toggledCategories, onToggle }) {
  const initialVisible = typeof window !== 'undefined' ? window.innerWidth >= 960 : true;
  const [visible, setVisible] = useState(initialVisible);
  const menuRef = useRef(null);
  const timeoutRef = useRef(null);
  const touchStartX = useRef(null);

  // Inactivity Timer
  const resetTimer = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (visible) {
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, timeout);
    }
  }, [visible, timeout]);

  // Reset timer on interaction inside menu
  useEffect(() => {
    const menuEl = menuRef.current;
    if (!menuEl) return;

    const handleActivity = () => resetTimer();
    menuEl.addEventListener('mousemove', handleActivity);
    menuEl.addEventListener('touchstart', handleActivity);
    resetTimer();

    return () => {
      menuEl.removeEventListener('mousemove', handleActivity);
      menuEl.removeEventListener('touchstart', handleActivity);
      clearTimeout(timeoutRef.current);
    };
  }, [resetTimer]);

  // Click / tap outside to close
  useEffect(() => {
    if (!visible) return;

    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [visible]);

  // Swipe to open (left edge swipe right)
  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches[0].clientX < 30) {
        touchStartX.current = e.touches[0].clientX;
      } else {
        touchStartX.current = null;
      }
    };

    const handleTouchEnd = (e) => {
      if (touchStartX.current !== null) {
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        if (deltaX > 50) {
          setVisible(true);
        }
        touchStartX.current = null;
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <>
      <button
        className="menu-toggle"
        type="button"
        aria-label={`${visible ? 'Hide' : 'Show'} study menu`}
        aria-pressed={visible}
        onClick={() => setVisible((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      {visible && <div className="menu-overlay" onClick={() => setVisible(false)} />}

      <aside
        ref={menuRef}
        className={`side-menu ${visible ? 'visible' : 'hidden'}`}
      >
        <div className="menu-header">
          <div>
            <p className="menu-eyebrow">Study sets</p>
            <h2>Pick categories</h2>
          </div>
          <button
            className="close-button"
            aria-label="Hide study menu"
            onClick={() => setVisible(false)}
          >
            ×
          </button>
        </div>
        <p className="menu-subtitle">Toggle one or more decks to build your random pool.</p>
        <ul className="menu-list">
          {categories.length === 0 && <li className="menu-empty">Loading categories…</li>}
          {categories.map((category, index) => (
            <li key={index} className="menu-item">
              <label>
                <input
                  type="checkbox"
                  checked={toggledCategories.includes(category)}
                  onChange={() => onToggle(category)}
                />
                <span>{category}</span>
              </label>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
