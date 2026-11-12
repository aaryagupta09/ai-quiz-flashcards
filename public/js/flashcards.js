/**
 * Flashcard Study Arena & Leitner Spaced Repetition Engine
 */

class FlashcardController {
  constructor() {
    this.currentIndex = 0;
    this.isFlipped = false;
    this.filteredCards = [];
    this.filterMode = 'all'; // 'all', 'starred', 'box1'
    this.isFullscreen = false;
    this.synth = window.speechSynthesis;
  }

  init() {
    this.bindEvents();
  }

  loadActiveDeckCards() {
    const deck = window.storageManager.getActiveDeck();
    if (!deck || !deck.flashcards || deck.flashcards.length === 0) {
      this.filteredCards = [];
      this.currentIndex = 0;
      this.renderEmptyState();
      return;
    }

    if (this.filterMode === 'starred') {
      this.filteredCards = deck.flashcards.filter(c => c.starred);
    } else if (this.filterMode === 'box1') {
      this.filteredCards = deck.flashcards.filter(c => (c.leitnerBox || 1) === 1);
    } else {
      this.filteredCards = [...deck.flashcards];
    }

    if (this.filteredCards.length === 0) {
      this.currentIndex = 0;
      this.renderEmptyFilterState();
      return;
    }

    if (this.currentIndex >= this.filteredCards.length) {
      this.currentIndex = 0;
    }

    this.isFlipped = false;
    this.renderCurrentCard();
    this.updateProgress();
  }

  setFilter(mode) {
    this.filterMode = mode;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.loadActiveDeckCards();
  }

  getCurrentCard() {
    return this.filteredCards[this.currentIndex] || null;
  }

  flip() {
    if (!this.getCurrentCard()) return;
    this.isFlipped = !this.isFlipped;
    const cardEl = document.getElementById('flashcard-wrapper');
    if (cardEl) {
      if (this.isFlipped) {
        cardEl.classList.add('flipped');
      } else {
        cardEl.classList.remove('flipped');
      }
    }
    window.soundEffects.playFlip();
  }

  next() {
    if (this.filteredCards.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.filteredCards.length;
    this.isFlipped = false;
    this.renderCurrentCard();
    this.updateProgress();
  }

  prev() {
    if (this.filteredCards.length <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + this.filteredCards.length) % this.filteredCards.length;
    this.isFlipped = false;
    this.renderCurrentCard();
    this.updateProgress();
  }

  shuffle() {
    if (this.filteredCards.length <= 1) return;
    for (let i = this.filteredCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.filteredCards[i], this.filteredCards[j]] = [this.filteredCards[j], this.filteredCards[i]];
    }
    this.currentIndex = 0;
    this.isFlipped = false;
    this.renderCurrentCard();
    this.updateProgress();
    window.app.showToast('Deck shuffled!', 'info');
  }

  rateCard(rating) {
    const card = this.getCurrentCard();
    if (!card) return;

    window.storageManager.recordCardStudied(card.id, rating);

    // Audio cue
    if (rating >= 3) {
      window.soundEffects.playCorrect();
    } else {
      window.soundEffects.playIncorrect();
    }

    // Auto advance to next card after a brief moment
    setTimeout(() => {
      this.next();
    }, 200);
  }

  toggleStar() {
    const card = this.getCurrentCard();
    if (!card) return;
    card.starred = !card.starred;
    window.storageManager.saveDecks();
    this.renderCurrentCard();
    window.app.showToast(card.starred ? 'Card starred!' : 'Card unstarred', 'info');
  }

  speakCurrentCard() {
    const card = this.getCurrentCard();
    if (!card || !this.synth) return;

    this.synth.cancel(); // Stop any pending speech
    const textToSpeak = this.isFlipped ? card.back : card.front;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    utterance.rate = window.storageManager.settings.speechRate || 1.0;
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google'))) || voices[0];
      utterance.voice = englishVoice;
    }

    this.synth.speak(utterance);
  }

  toggleFullscreen() {
    const container = document.getElementById('flashcard-arena-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        this.isFullscreen = true;
      }).catch(err => console.warn(err));
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen = false;
      }).catch(err => console.warn(err));
    }
  }

  renderCurrentCard() {
    const card = this.getCurrentCard();
    const container = document.getElementById('flashcard-render-area');
    if (!container) return;

    if (!card) {
      this.renderEmptyState();
      return;
    }

    const boxNum = card.leitnerBox || 1;
    const boxLabels = {
      1: 'Box 1: Learning',
      2: 'Box 2: Reviewing',
      3: 'Box 3: Familiar',
      4: 'Box 4: Proficient',
      5: 'Box 5: Mastered'
    };

    container.innerHTML = `
      <div id="flashcard-wrapper" class="flashcard-wrapper w-full max-w-2xl mx-auto ${this.isFlipped ? 'flipped' : ''}">
        <div class="flashcard-inner relative bg-gradient-to-br from-slate-800/90 to-indigo-950/80 border border-slate-700/60 shadow-2xl backdrop-blur-xl">
          
          <!-- FRONT FACE -->
          <div class="flashcard-front">
            <div class="flex items-center justify-between w-full text-xs font-semibold tracking-wider uppercase text-slate-400">
              <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                <span class="w-2 h-2 rounded-full box-badge-${boxNum}"></span>
                ${boxLabels[boxNum]}
              </span>
              <div class="flex items-center gap-2">
                <button type="button" class="btn-star p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-amber-400 transition" title="Bookmark Card">
                  <i class="fa-star ${card.starred ? 'fa-solid text-amber-400' : 'fa-regular'} text-base"></i>
                </button>
                <button type="button" class="btn-tts p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-indigo-400 transition" title="Speak Text (A)">
                  <i class="fa-solid fa-volume-high text-base"></i>
                </button>
              </div>
            </div>

            <div class="my-auto px-4 py-6">
              <span class="inline-block mb-3 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                PROMPT / QUESTION
              </span>
              <h3 class="text-xl md:text-2xl font-bold text-white leading-relaxed select-text">
                ${this.escapeHtml(card.front)}
              </h3>
              ${card.hint ? `
                <div class="mt-4 inline-block text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                  <i class="fa-regular fa-lightbulb text-amber-400 mr-1.5"></i> Hint: ${this.escapeHtml(card.hint)}
                </div>
              ` : ''}
            </div>

            <div class="w-full text-center text-xs text-slate-400 tracking-wide flex items-center justify-center gap-2">
              <i class="fa-solid fa-arrow-rotate-right text-indigo-400"></i> Click card or press <kbd class="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono">Space</kbd> to flip
            </div>
          </div>

          <!-- BACK FACE -->
          <div class="flashcard-back">
            <div class="flex items-center justify-between w-full text-xs font-semibold tracking-wider uppercase text-slate-400">
              <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <i class="fa-solid fa-check"></i> ANSWER & EXPLANATION
              </span>
              <div class="flex items-center gap-2">
                <button type="button" class="btn-star p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-amber-400 transition" title="Bookmark Card">
                  <i class="fa-star ${card.starred ? 'fa-solid text-amber-400' : 'fa-regular'} text-base"></i>
                </button>
                <button type="button" class="btn-tts p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-indigo-400 transition" title="Speak Text (A)">
                  <i class="fa-solid fa-volume-high text-base"></i>
                </button>
              </div>
            </div>

            <div class="my-auto px-4 py-6 overflow-y-auto">
              <div class="text-lg md:text-xl font-medium text-slate-100 leading-relaxed whitespace-pre-line select-text text-left">
                ${this.escapeHtml(card.back)}
              </div>
            </div>

            <div class="w-full text-center text-xs text-slate-400 tracking-wide flex items-center justify-center gap-2">
              <i class="fa-solid fa-arrow-rotate-left text-emerald-400"></i> Click to flip back
            </div>
          </div>

        </div>
      </div>
    `;

    // Reattach listeners to newly created card elements
    const cardWrapper = document.getElementById('flashcard-wrapper');
    if (cardWrapper) {
      cardWrapper.addEventListener('click', (e) => {
        // Prevent flipping if clicked on star, tts, or interactive buttons
        if (e.target.closest('button') || e.target.closest('.select-text')) {
          if (!e.target.closest('button')) return;
        }
        this.flip();
      });

      const starBtns = cardWrapper.querySelectorAll('.btn-star');
      starBtns.forEach(b => b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleStar();
      }));

      const ttsBtns = cardWrapper.querySelectorAll('.btn-tts');
      ttsBtns.forEach(b => b.addEventListener('click', (e) => {
        e.stopPropagation();
        this.speakCurrentCard();
      }));
    }
  }

  updateProgress() {
    const counterEl = document.getElementById('flashcard-counter');
    const progressBar = document.getElementById('flashcard-progress-bar');
    const total = this.filteredCards.length;

    if (total === 0) {
      if (counterEl) counterEl.textContent = '0 / 0';
      if (progressBar) progressBar.style.width = '0%';
      return;
    }

    const current = this.currentIndex + 1;
    if (counterEl) counterEl.textContent = `${current} / ${total}`;
    if (progressBar) {
      const pct = (current / total) * 100;
      progressBar.style.width = `${pct}%`;
    }
  }

  renderEmptyState() {
    const container = document.getElementById('flashcard-render-area');
    if (!container) return;
    container.innerHTML = `
      <div class="w-full max-w-xl mx-auto p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">No Flashcards in this Deck</h3>
        <p class="text-slate-400 text-sm mb-6">Use the AI Generator to automatically create flashcards from any topic, or add custom cards in Deck Manager.</p>
        <button type="button" onclick="window.app.switchTab('generator')" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30">
          <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> Open AI Generator
        </button>
      </div>
    `;
    this.updateProgress();
  }

  renderEmptyFilterState() {
    const container = document.getElementById('flashcard-render-area');
    if (!container) return;
    container.innerHTML = `
      <div class="w-full max-w-xl mx-auto p-10 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
        <i class="fa-regular fa-bookmark text-4xl text-slate-500 mb-3"></i>
        <h3 class="text-lg font-bold text-white mb-2">No cards matching filter "${this.filterMode}"</h3>
        <p class="text-slate-400 text-sm mb-4">No cards found under this filter.</p>
        <button type="button" onclick="window.flashcardController.setFilter('all')" class="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold">
          Show All Cards
        </button>
      </div>
    `;
    this.updateProgress();
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  bindEvents() {
    // Navigation buttons
    document.getElementById('fc-btn-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('fc-btn-next')?.addEventListener('click', () => this.next());
    document.getElementById('fc-btn-shuffle')?.addEventListener('click', () => this.shuffle());
    document.getElementById('fc-btn-flip')?.addEventListener('click', () => this.flip());
    document.getElementById('fc-btn-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());

    // Leitner Spaced Repetition Rating Buttons
    document.getElementById('fc-rate-again')?.addEventListener('click', () => this.rateCard(1));
    document.getElementById('fc-rate-hard')?.addEventListener('click', () => this.rateCard(2));
    document.getElementById('fc-rate-good')?.addEventListener('click', () => this.rateCard(3));
    document.getElementById('fc-rate-easy')?.addEventListener('click', () => this.rateCard(4));

    // Filter Buttons
    document.querySelectorAll('.fc-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.fc-filter-btn').forEach(b => b.classList.remove('bg-indigo-600', 'text-white'));
        e.currentTarget.classList.add('bg-indigo-600', 'text-white');
        this.setFilter(e.currentTarget.dataset.filter);
      });
    });

    // Global Keyboard Shortcuts (active when flashcards tab is visible and not typing in an input)
    window.addEventListener('keydown', (e) => {
      const activeTab = window.app?.currentTab;
      if (activeTab !== 'flashcards') return;

      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.code === 'Space') {
        e.preventDefault();
        this.flip();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        this.next();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA' && e.ctrlKey) {
        e.preventDefault();
        this.prev();
      } else if (e.key === '1') {
        this.rateCard(1);
      } else if (e.key === '2') {
        this.rateCard(2);
      } else if (e.key === '3') {
        this.rateCard(3);
      } else if (e.key === '4') {
        this.rateCard(4);
      } else if (e.code === 'KeyS') {
        this.shuffle();
      } else if (e.code === 'KeyF') {
        this.toggleFullscreen();
      } else if (e.code === 'KeyA') {
        this.speakCurrentCard();
      }
    });
  }
}

window.flashcardController = new FlashcardController();
