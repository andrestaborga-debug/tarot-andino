// Tarot Andino — lógica de la app

const state = {
  cards: [],
  spread: 0,        // 1 o 3
  drawn: [],        // [carta, carta, carta]
};

const POSITIONS = {
  1: ["La carta del día"],
  3: ["Pasado", "Presente", "Porvenir"],
};

const CLOSINGS = {
  1: "Cuando dudes, vuelve a barajar. La misma carta querrá decirte algo distinto mañana.",
  3: "Tres cartas leen una misma vida en tres tiempos. Lee la primera con compasión, la segunda con honestidad, la tercera sin miedo.",
};

const CARD_BACK_SVG = `
<svg viewBox="0 0 200 350" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#3a2a66"/>
      <stop offset="60%" stop-color="#15102e"/>
      <stop offset="100%" stop-color="#08051a"/>
    </radialGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0cc7a"/>
      <stop offset="50%" stop-color="#d4a85a"/>
      <stop offset="100%" stop-color="#8b6a2c"/>
    </linearGradient>
  </defs>
  <rect width="200" height="350" fill="url(#bgGrad)"/>
  <rect x="8" y="8" width="184" height="334" fill="none" stroke="url(#goldGrad)" stroke-width="0.8" opacity="0.85"/>
  <rect x="14" y="14" width="172" height="322" fill="none" stroke="url(#goldGrad)" stroke-width="0.4" opacity="0.6"/>
  <g stroke="url(#goldGrad)" stroke-width="0.6" fill="none" opacity="0.85">
    <path d="M14 30 Q14 14 30 14"/>
    <path d="M170 14 Q186 14 186 30"/>
    <path d="M14 320 Q14 336 30 336"/>
    <path d="M170 336 Q186 336 186 320"/>
    <circle cx="22" cy="22" r="2.2" fill="url(#goldGrad)"/>
    <circle cx="178" cy="22" r="2.2" fill="url(#goldGrad)"/>
    <circle cx="22" cy="328" r="2.2" fill="url(#goldGrad)"/>
    <circle cx="178" cy="328" r="2.2" fill="url(#goldGrad)"/>
  </g>
  <g transform="translate(100,175)" opacity="0.95">
    <circle r="62" fill="none" stroke="url(#goldGrad)" stroke-width="0.5" opacity="0.5"/>
    <circle r="50" fill="none" stroke="url(#goldGrad)" stroke-width="0.4" opacity="0.7"/>
    <circle r="34" fill="none" stroke="url(#goldGrad)" stroke-width="0.6"/>
    <g stroke="url(#goldGrad)" stroke-width="0.25" opacity="0.35" fill="none">
      <line x1="0" y1="-50" x2="0" y2="50"/>
      <line x1="-50" y1="0" x2="50" y2="0"/>
      <line x1="-35" y1="-35" x2="35" y2="35"/>
      <line x1="-35" y1="35" x2="35" y2="-35"/>
    </g>
    <path d="M -8,-8 L -8,-20 L -20,-20 L -20,-8 L -32,-8 L -32,8 L -20,8 L -20,20 L -8,20 L -8,32 L 8,32 L 8,20 L 20,20 L 20,8 L 32,8 L 32,-8 L 20,-8 L 20,-20 L 8,-20 L 8,-8 Z"
          fill="none" stroke="url(#goldGrad)" stroke-width="1.1"/>
    <g stroke="url(#goldGrad)" stroke-width="0.35" fill="none" opacity="0.7">
      <path d="M -20,-8 L -8,-8 L -8,-20"/>
      <path d="M 20,-8 L 8,-8 L 8,-20"/>
      <path d="M -20,8 L -8,8 L -8,20"/>
      <path d="M 20,8 L 8,8 L 8,20"/>
    </g>
    <rect x="-8" y="-8" width="16" height="16" fill="none" stroke="url(#goldGrad)" stroke-width="0.6" opacity="0.95"/>
    <circle r="5.5" fill="none" stroke="url(#goldGrad)" stroke-width="0.8"/>
    <circle r="1.6" fill="url(#goldGrad)"/>
    <g stroke="url(#goldGrad)" stroke-width="0.3" opacity="0.6">
      <line x1="0" y1="-62" x2="0" y2="-78"/>
      <line x1="0" y1="62" x2="0" y2="78"/>
      <line x1="-62" y1="0" x2="-78" y2="0"/>
      <line x1="62" y1="0" x2="78" y2="0"/>
    </g>
  </g>
  <g fill="none" stroke="url(#goldGrad)" stroke-width="0.6" opacity="0.78">
    <polygon points="100,46 95,55 105,55"/>
    <polygon points="95,295 105,295 100,304"/>
    <rect x="30" y="170" width="9" height="9"/>
    <circle cx="166" cy="174" r="4.5"/>
  </g>
</svg>`;

// ---------- INIT ----------
async function init() {
  try {
    const res = await fetch('cards.json');
    const data = await res.json();
    state.cards = [...(data.majors || []), ...(data.minors || [])];
    console.log(`Cargados ${state.cards.length} arcanos (${(data.majors||[]).length} mayores + ${(data.minors||[]).length} menores).`);
  } catch (e) {
    console.error('Error cargando cards.json', e);
    return;
  }

  // Selector
  document.querySelectorAll('.spread-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.spread, 10);
      startShuffle(n);
    });
  });

  // Mazo de baraje
  const deck = document.getElementById('deck-stage');
  deck.addEventListener('click', stopShuffle);
  deck.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopShuffle(); }
  });

  // Reshuffle
  document.getElementById('reshuffle').addEventListener('click', resetToSelect);
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('active', s.dataset.screen === name);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startShuffle(n) {
  state.spread = n;
  state.drawn = [];
  showScreen('shuffle');
}

function stopShuffle() {
  // Sacar n cartas al azar SIN repetir
  const pool = [...state.cards];
  const drawn = [];
  for (let i = 0; i < state.spread; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    drawn.push(pool.splice(idx, 1)[0]);
  }
  state.drawn = drawn;
  renderCardSelection();
  showScreen('cards');
}

function renderCardSelection() {
  const row = document.getElementById('cards-row');
  row.innerHTML = '';
  state.drawn.forEach((card, i) => {
    const positionLabel = POSITIONS[state.spread][i] || '';
    const slot = document.createElement('div');
    slot.className = 'card-slot';
    slot.innerHTML = `
      ${state.spread > 1 ? `<span class="card-slot-label">${positionLabel}</span>` : ''}
      <div class="card" data-idx="${i}" role="button" tabindex="0" aria-label="Revelar ${positionLabel || 'la carta'}">
        <div class="card-face card-back">${CARD_BACK_SVG}</div>
        <div class="card-face card-front">
          <img src="${card.image}" alt="${card.arcanum}" onerror="this.parentElement.classList.add('placeholder'); this.style.display='none';">
          <div class="card-label">${cardShortLabel(card)}</div>
        </div>
      </div>
    `;
    row.appendChild(slot);
  });

  // Listeners para revelar
  row.querySelectorAll('.card').forEach(cardEl => {
    const reveal = () => {
      if (cardEl.classList.contains('flipped')) return;
      cardEl.classList.add('flipped');
      checkAllRevealed();
    };
    cardEl.addEventListener('click', reveal);
    cardEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); }
    });
  });
}

function checkAllRevealed() {
  const all = document.querySelectorAll('#cards-row .card');
  const flipped = document.querySelectorAll('#cards-row .card.flipped');
  if (flipped.length === all.length && all.length > 0) {
    setTimeout(showReadings, 1300);
  }
}

function showReadings() {
  const cont = document.getElementById('readings-container');
  cont.className = `readings-container spread-${state.spread}`;
  cont.innerHTML = '';

  state.drawn.forEach((card, i) => {
    const positionLabel = POSITIONS[state.spread][i] || '';
    const reading = document.createElement('article');
    reading.className = `reading spread-${state.spread}`;
    reading.innerHTML = `
      ${state.spread > 1 ? `
        <div class="reading-card-wrap">
          <div class="card flipped">
            <div class="card-face card-back">${CARD_BACK_SVG}</div>
            <div class="card-face card-front">
              <img src="${card.image}" alt="${card.arcanum}" onerror="this.parentElement.classList.add('placeholder'); this.style.display='none';">
              <div class="card-label">${card.arcanum}</div>
            </div>
          </div>
        </div>
      ` : ''}
      <div class="reading-text">
        ${state.spread > 1 ? `<p class="position-label">${positionLabel}</p>` : ''}
        <p class="arcano-num">${cardKindLabel(card)}</p>
        <h2 class="arcano-name">${card.arcanum}</h2>
        <p class="arcano-andean">${card.andean}</p>
        <div class="divider"></div>
        <blockquote class="message">${card.message}</blockquote>
        <div class="section meaning">
          <h3>Lo que la carta muestra</h3>
          <p>${card.meaning}</p>
        </div>
        <div class="section question">
          <h3>La pregunta para ti</h3>
          <p>${card.question}</p>
        </div>
      </div>
    `;
    cont.appendChild(reading);

    // Para el modo 1 carta, agregar la imagen como elemento hermano (display:contents en .reading)
    if (state.spread === 1) {
      const cardWrap = document.createElement('div');
      cardWrap.className = 'reading-card-wrap';
      cardWrap.innerHTML = `
        <div class="card flipped">
          <div class="card-face card-back">${CARD_BACK_SVG}</div>
          <div class="card-face card-front">
            <img src="${card.image}" alt="${card.arcanum}" onerror="this.parentElement.classList.add('placeholder'); this.style.display='none';">
            <div class="card-label">${cardShortLabel(card)}</div>
          </div>
        </div>
      `;
      // Insertar antes del reading-text dentro de cont
      reading.insertBefore(cardWrap, reading.firstElementChild);
    }
  });

  // Cierre
  const closing = document.getElementById('closing');
  closing.textContent = CLOSINGS[state.spread] || '';
  setTimeout(() => closing.classList.add('visible'), 500);

  showScreen('reading');
}

function resetToSelect() {
  state.drawn = [];
  state.spread = 0;
  document.getElementById('closing').classList.remove('visible');
  showScreen('select');
}

// Helper: romanos para Arcanos Mayores 0-21
function romanNumeral(num) {
  if (num === 0) return '0';
  const romans = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  let n = num;
  for (const [v, r] of romans) {
    while (n >= v) { result += r; n -= v; }
  }
  return result;
}

// Etiqueta superior del arcano (en la lectura)
function cardKindLabel(card) {
  if (card.id < 22) return `Arcano Mayor · ${romanNumeral(card.id)}`;
  const suitES = {
    chakitajllas: 'Chakitajllas',
    keros: 'Keros',
    tumis: 'Tumis',
    chakanas: 'Chakanas',
  };
  return `Arcano Menor · ${suitES[card.suit] || ''}`;
}

// Etiqueta corta inferior de la carta (sobre la imagen)
function cardShortLabel(card) {
  if (card.id < 22) return `${card.arcanum} · ${romanNumeral(card.id)}`;
  return card.arcanum;
}

// Boot
document.addEventListener('DOMContentLoaded', init);
