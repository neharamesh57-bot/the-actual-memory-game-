const LEVELS = [
  3, 4, 5, 6, 7, 8, 9, 10, 11, 12
];

const EMOJIS = [
  '🌟', '🍀', '🌙', '☀️', '🎯', '🍉', '🚀', '⚽', '🎲', '🪐',
  '🌼', '🦋', '🌈', '🌊', '🔥', '🎵', '🍋', '🍒', '🍇', '🌵'
];

const boardEl = document.getElementById('board');
const levelLabelEl = document.getElementById('levelLabel');
const movesLabelEl = document.getElementById('movesLabel');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

let currentLevel = 0;
let moves = 0;
let hasWon = false;
let isBoardLocked = false;
let firstCard = null;
let secondCard = null;

function shuffle(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getBoardColumns(totalPairs) {
  if (totalPairs <= 4) return 4;
  if (totalPairs <= 7) return 4;
  if (totalPairs <= 10) return 5;
  return 6;
}

function buildLevel(levelIndex) {
  const pairs = LEVELS[levelIndex];
  const cards = shuffle([...EMOJIS].slice(0, pairs).flatMap((emoji, index) => [
    { id: `${emoji}-${index}-a`, type: emoji },
    { id: `${emoji}-${index}-b`, type: emoji }
  ]));

  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${getBoardColumns(pairs)}, minmax(70px, 1fr))`;

  cards.forEach((cardData) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'card';
    button.dataset.cardId = cardData.id;
    button.dataset.type = cardData.type;
    button.setAttribute('aria-label', 'Hidden memory card');

    button.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-back">?</div>
        <div class="card-face card-front">${cardData.type}</div>
      </div>
    `;

    button.addEventListener('click', () => handleCardClick(button));
    boardEl.appendChild(button);
  });

  levelLabelEl.textContent = `${levelIndex + 1} / ${LEVELS.length}`;
  movesLabelEl.textContent = String(moves);
  messageEl.textContent = `Level ${levelIndex + 1}: find every matching pair.`;
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  isBoardLocked = false;
}

function updateMatchState() {
  const matchedCards = document.querySelectorAll('.card.is-matched');
  const totalCards = document.querySelectorAll('.card').length;

  if (matchedCards.length === totalCards) {
    const nextLevel = currentLevel + 1;

    if (nextLevel < LEVELS.length) {
      messageEl.textContent = 'Nice work! Loading the next level...';
      setTimeout(() => {
        currentLevel += 1;
        moves = 0;
        buildLevel(currentLevel);
      }, 850);
    } else {
      hasWon = true;
      messageEl.textContent = 'You cleared all 10 levels! Press Restart to play again.';
    }
  }
}

function handleCardClick(card) {
  if (
    isBoardLocked ||
    card === firstCard ||
    card.classList.contains('is-flipped') ||
    card.classList.contains('is-matched') ||
    hasWon
  ) {
    return;
  }

  card.classList.add('is-flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  isBoardLocked = true;
  moves += 1;
  movesLabelEl.textContent = String(moves);

  const isMatch = firstCard.dataset.type === secondCard.dataset.type;

  if (isMatch) {
    firstCard.classList.add('is-matched');
    secondCard.classList.add('is-matched');
    messageEl.textContent = 'Match found!';
    firstCard.disabled = true;
    secondCard.disabled = true;
    resetTurn();
    updateMatchState();
    return;
  }

  messageEl.textContent = 'Not a match. Try again!';

  setTimeout(() => {
    firstCard.classList.remove('is-flipped');
    secondCard.classList.remove('is-flipped');
    resetTurn();
  }, 700);
}

function startGame() {
  currentLevel = 0;
  moves = 0;
  hasWon = false;
  firstCard = null;
  secondCard = null;
  isBoardLocked = false;
  buildLevel(currentLevel);
}

restartBtn.addEventListener('click', startGame);

startGame();
