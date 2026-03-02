import './App.css';
import { useState, useEffect, useMemo } from 'react';
import Menu from './components/Menu';
import FlashCard from './components/FlashCard';

const googleSheetsApi = 'https://script.google.com/macros/s/AKfycbw9RZf2p5DGRaZfUF6gKB-bRIRjNPTcSpkvZ6gnjvHKRxKwIX8EkBS8LD4GcWjXK6k/exec';

function normalizeCell(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function buildCardsFromRow(row) {
  const cells = Array.isArray(row)
    ? row.map(normalizeCell)
    : Object.values(row || {}).map(normalizeCell);
  const cards = [];

  for (let index = 0; index < cells.length; index += 3) {
    const front = cells[index];
    const backLeft = cells[index + 1];
    const backRight = cells[index + 2];

    if (!front || !backLeft) {
      continue;
    }

    cards.push({
      front,
      backLeft,
      backRight: backRight || '',
      hasSplitBack: Boolean(backRight),
    });
  }

  return cards;
}

function buildDeckCards(sourceCards) {
  if (!Array.isArray(sourceCards)) {
    return [];
  }

  return sourceCards.flatMap((entry) => {
    if (Array.isArray(entry)) {
      return buildCardsFromRow(entry);
    }

    if (entry && typeof entry === 'object' && !('front' in entry)) {
      return buildCardsFromRow(entry);
    }

    if (!entry?.front || !entry?.back) {
      return [];
    }

    return [
      {
        front: normalizeCell(entry.front),
        backLeft: normalizeCell(entry.back),
        backRight: normalizeCell(entry.extra),
        hasSplitBack: Boolean(normalizeCell(entry.extra)),
      },
    ];
  });
}

function shuffleCards(cards) {
  return [...cards]
    .map((card) => ({ card, sort: Math.random() }))
    .sort((left, right) => left.sort - right.sort)
    .map(({ card }) => card);
}

function App() {
  const [decks, setDecks] = useState([]);
  const [selectedDeckLabels, setSelectedDeckLabels] = useState([]);
  const [activeCards, setActiveCards] = useState([]);
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (activeCards.length === 0) return;
    setIndex((prevIndex) => (prevIndex + 1) % activeCards.length);
  };

  const handlePrevious = () => {
    if (activeCards.length === 0) return;
    setIndex((prevIndex) => (prevIndex - 1 + activeCards.length) % activeCards.length);
  };

  const handleToggleDeck = (label) => {
    setSelectedDeckLabels((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    fetch(googleSheetsApi)
      .then((res) => res.json())
      .then((payload) => {
        const nextDecks = Array.isArray(payload?.decks)
          ? payload.decks
              .map((deck) => ({
                label: deck?.label || 'Untitled Deck',
                cards: buildDeckCards(deck?.cards),
              }))
              .filter((deck) => deck.cards.length > 0)
          : [];
        setDecks(nextDecks);
        setSelectedDeckLabels(nextDecks[0]?.label ? [nextDecks[0].label] : []);
      })
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  useEffect(() => {
    const mixedCards = decks
      .filter((deck) => selectedDeckLabels.includes(deck.label))
      .flatMap((deck) => deck.cards);
    setActiveCards(shuffleCards(mixedCards));
    setIndex(0);
  }, [decks, selectedDeckLabels]);

  const currentCard = useMemo(() => activeCards[index], [activeCards, index]);
  const hasSelection = activeCards.length > 0;

  return (
    <div className="App app-shell">
      <Menu
        timeout={5000}
        decks={decks}
        selectedDeckLabels={selectedDeckLabels}
        onToggle={handleToggleDeck}
      />
      <main className="workspace">
        <header className="hero">
          <p className="eyebrow">Study anywhere</p>
          <h1>Flash Cards</h1>
          <p className="hero-copy">
            Pick a deck from the menu and review cards with simple gestures. Works on desktop, tablet, and phone.
          </p>
        </header>

        {hasSelection ? (
          <section className="card-stage">
            <FlashCard card={currentCard} onNext={handleNext} onPrevious={handlePrevious} />
            <div className="card-actions">
              <div className="action-card">
                <span className="action-emoji" aria-hidden="true">👆</span>
                <div>
                  <strong>Tap</strong>
                  <p>Flip the card between front and back.</p>
                </div>
              </div>
              <div className="action-card">
                <span className="action-emoji" aria-hidden="true">⏩</span>
                <div>
                  <strong>Long press</strong>
                  <p>Go to the next card in the shuffled study pool.</p>
                </div>
              </div>
              <div className="action-card">
                <span className="action-emoji" aria-hidden="true">⏪</span>
                <div>
                  <strong>Double tap</strong>
                  <p>Return to the previous card.</p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="empty-state">
            <h2>Select at least one deck to begin</h2>
            <p>
              Use the menu button to choose one or more decks. Cards from those decks will be mixed together and
              respond to touch, pen, or mouse gestures.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
