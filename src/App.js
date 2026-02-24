import './App.css';
import { useState, useEffect, useMemo } from 'react';
import Menu from './components/Menu';
import FlashCard from './components/FlashCard';

const googleSheetsApi = 'https://script.google.com/macros/s/AKfycbw9eyQPQ39enZaVVH8bHZk92lCYSx-9_LsBBup8Inx-J_DE6nJyE1rjZ0h_SFSZjV0/exec';

function App() {
  const [decks, setDecks] = useState([]);
  const [selectedDeckLabel, setSelectedDeckLabel] = useState('');
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    const currentDeck = decks.find((deck) => deck.label === selectedDeckLabel);
    const cards = currentDeck?.cards || [];
    if (cards.length === 0) return;
    setIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrevious = () => {
    const currentDeck = decks.find((deck) => deck.label === selectedDeckLabel);
    const cards = currentDeck?.cards || [];
    if (cards.length === 0) return;
    setIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  };

  useEffect(() => {
    fetch(googleSheetsApi)
      .then((res) => res.json())
      .then((payload) => {
        const nextDecks = Array.isArray(payload?.decks)
          ? payload.decks
              .map((deck) => ({
                label: deck?.label || 'Untitled Deck',
                cards: Array.isArray(deck?.cards)
                  ? deck.cards.filter((card) => card?.front || card?.back)
                  : [],
              }))
              .filter((deck) => deck.cards.length > 0)
          : [];
        setDecks(nextDecks);
        setSelectedDeckLabel(nextDecks[0]?.label || '');
      })
      .catch((err) => console.error('Error fetching data:', err));
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [selectedDeckLabel]);

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.label === selectedDeckLabel),
    [decks, selectedDeckLabel]
  );
  const cards = useMemo(() => selectedDeck?.cards || [], [selectedDeck]);
  const currentCard = useMemo(() => cards[index], [cards, index]);
  const hasSelection = cards.length > 0;

  return (
    <div className="App app-shell">
      <Menu
        timeout={5000}
        decks={decks}
        selectedDeckLabel={selectedDeckLabel}
        onSelect={setSelectedDeckLabel}
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
                  <p>Go to the next card in the selected deck.</p>
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
            <h2>Select a deck to begin</h2>
            <p>
              Use the menu button to choose a deck. Cards from that deck will appear here and respond to touch,
              pen, or mouse gestures.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
