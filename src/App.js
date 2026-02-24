import './App.css';
import { useState, useEffect, useMemo } from 'react';
import Menu from './components/Menu';
import FlashCard from './components/FlashCard';

const googleSheetsApi = 'https://script.google.com/macros/s/AKfycbyKeLFla2mIBQEBQCCwoXJdFQ9QvEBeV9mRQh3RY6RLyzOAexNHceRgWGvZJwMLr-iK/exec';

function App() {
  const [data, setData] = useState({});
  const [categories, setCategories] = useState([]);
  const [toggledCategories, setToggledCategories] = useState([]);
  const [randomPool, setRandomPool] = useState([]);
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (randomPool.length === 0) return;
    setIndex((prevIndex) => (prevIndex + 1) % randomPool.length);
  };

  const handleToggle = (item) => {
    setToggledCategories((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  useEffect(() => {
    const combined = toggledCategories.flatMap((cat) => data[cat] || []);
    const shuffled = combined
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setRandomPool(shuffled);
    setIndex(0); // reset to first card on category change
  }, [toggledCategories, data]);

  useEffect(() => {
    fetch(googleSheetsApi)
      .then((res) => res.json())
      .then((data) => {
        for (let key in data) {
          if (Array.isArray(data[key])) {
            data[key] = data[key].filter((item) => item !== '');
          }
        }
        setData(data);
      })
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  useEffect(() => {
    setCategories(Object.keys(data));
  }, [data]);

  const currentWord = useMemo(() => randomPool[index], [randomPool, index]);
  const hasSelection = randomPool.length > 0;

  return (
    <div className="App app-shell">
      <Menu
        timeout={5000}
        categories={categories}
        toggledCategories={toggledCategories}
        onToggle={handleToggle}
      />
      <main className="workspace">
        <header className="hero">
          <p className="eyebrow">Study anywhere</p>
          <h1>Japanese Flash Cards</h1>
          <p className="hero-copy">
            Choose a category from the menu, then tap through the characters. The experience adapts for desktop,
            tablet, and phone so you can drill vocab wherever you are.
          </p>
        </header>

        {hasSelection ? (
          <section className="card-stage">
            <FlashCard word={currentWord} onNext={handleNext} />
            <div className="card-actions">
              <div className="action-card">
                <span className="action-emoji" aria-hidden="true">👉</span>
                <div>
                  <strong>Tap a letter</strong>
                  <p>Cycle Katakana → Hiragana → Romaji per character.</p>
                </div>
              </div>
              <div className="action-card">
                <span className="action-emoji" aria-hidden="true">🀄</span>
                <div>
                  <strong>Tap the card</strong>
                  <p>Cycle every letter at once when you tap the card background.</p>
                </div>
              </div>
              <div className="action-card">
                <span className="action-emoji" aria-hidden="true">⏩</span>
                <div>
                  <strong>Press &amp; hold</strong>
                  <p>Hold for a moment anywhere on the card to jump to the next word.</p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="empty-state">
            <h2>Select a category to begin</h2>
            <p>
              Use the menu button to choose at least one category. Your flash cards will appear here and
              adapt automatically for touch, pen, or mouse.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
