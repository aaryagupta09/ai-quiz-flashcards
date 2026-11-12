/**
 * Interactive Quiz Arena & Diagnostic Review Engine
 */

class QuizController {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.userAnswers = {}; // { questionId: { selected: '', isCorrect: false } }
    this.streak = 0;
    this.maxStreak = 0;
    this.score = 0;
    this.timer = null;
    this.timeLeft = 30;
    this.isAnswered = false;
    this.quizState = 'idle'; // 'idle', 'in_progress', 'completed'
    this.startTime = null;
    this.totalDurationSeconds = 0;
  }

  init() {
    this.bindEvents();
  }

  startQuiz(customQuestions = null) {
    const deck = window.storageManager.getActiveDeck();
    if (!deck) {
      window.app.showToast('No active study deck found.', 'error');
      return;
    }

    this.questions = customQuestions || (deck.quiz && deck.quiz.length > 0 ? [...deck.quiz] : []);
    if (this.questions.length === 0) {
      this.renderEmptyQuizState();
      return;
    }

    this.currentIndex = 0;
    this.userAnswers = {};
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.quizState = 'in_progress';
    this.startTime = Date.now();

    this.renderQuestion();
  }

  restartQuiz() {
    this.startQuiz();
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  renderQuestion() {
    const q = this.getCurrentQuestion();
    const container = document.getElementById('quiz-render-area');
    if (!container || !q) return;

    this.isAnswered = false;
    this.startTimer();

    const currentNum = this.currentIndex + 1;
    const totalNum = this.questions.length;
    const progressPct = ((this.currentIndex) / totalNum) * 100;

    // Difficulty badge color
    const diffBadge = {
      'Easy': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Medium': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Hard': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }[q.difficulty || 'Medium'] || 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

    container.innerHTML = `
      <div class="w-full max-w-3xl mx-auto">
        
        <!-- Header Bar: Progress, Timer, Streak -->
        <div class="flex items-center justify-between mb-4 px-2">
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-slate-300">
              Question <span class="text-indigo-400">${currentNum}</span> of ${totalNum}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-medium border ${diffBadge}">
              ${q.difficulty || 'Medium'}
            </span>
          </div>

          <div class="flex items-center gap-4">
            <!-- Streak Counter -->
            <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 text-xs font-bold">
              <i class="fa-solid fa-fire text-amber-500 animate-pulse"></i> Streak: ${this.streak}
            </div>

            <!-- Timer Indicator -->
            <div id="quiz-timer-box" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-indigo-400 text-xs font-mono font-bold">
              <i class="fa-regular fa-clock"></i> <span id="quiz-timer-display">${this.timeLeft}s</span>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
        </div>

        <!-- Question Card -->
        <div class="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/60 border border-slate-800 backdrop-blur-xl shadow-xl mb-6">
          <h2 class="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed select-text">
            ${this.escapeHtml(q.question)}
          </h2>

          <!-- Options Grid -->
          <div id="quiz-options-grid" class="space-y-3">
            ${q.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              return `
                <button type="button" data-option="${this.escapeHtml(opt)}" class="quiz-option-btn w-full text-left p-4 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 hover:text-white font-medium text-sm md:text-base transition duration-150 flex items-center justify-between group">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded-lg bg-slate-700 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center font-bold text-xs text-slate-300 transition">
                      ${letter}
                    </span>
                    <span class="option-text">${this.escapeHtml(opt)}</span>
                  </div>
                  <i class="option-icon fa-regular fa-circle text-slate-500 text-lg"></i>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Instant Feedback Section (revealed after selection) -->
          <div id="quiz-feedback-box" class="hidden mt-6 p-4 rounded-xl border transition-all duration-300">
            <div id="quiz-feedback-title" class="flex items-center gap-2 font-bold text-sm mb-1"></div>
            <p id="quiz-feedback-text" class="text-xs md:text-sm text-slate-300"></p>
          </div>
        </div>

        <!-- Next / Action Controls -->
        <div class="flex items-center justify-between px-2">
          <button type="button" id="quiz-skip-btn" class="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition">
            <i class="fa-solid fa-forward-step mr-1"></i> Skip Question
          </button>

          <button type="button" id="quiz-next-btn" class="hidden px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 flex items-center gap-2">
            <span>Next Question</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>

      </div>
    `;

    // Bind option click handlers
    const optionBtns = container.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = btn.dataset.option;
        this.selectAnswer(selected);
      });
    });

    document.getElementById('quiz-skip-btn')?.addEventListener('click', () => {
      this.skipQuestion();
    });

    document.getElementById('quiz-next-btn')?.addEventListener('click', () => {
      this.nextQuestion();
    });
  }

  startTimer() {
    this.stopTimer();
    const configTimer = window.storageManager.settings.quizTimerSec || 30;
    this.timeLeft = configTimer;

    const timerBox = document.getElementById('quiz-timer-box');
    const timerDisplay = document.getElementById('quiz-timer-display');

    this.timer = setInterval(() => {
      this.timeLeft--;
      if (timerDisplay) timerDisplay.textContent = `${this.timeLeft}s`;

      if (this.timeLeft <= 5) {
        window.soundEffects.playTick();
        if (timerBox) {
          timerBox.classList.remove('bg-slate-800/80', 'text-indigo-400');
          timerBox.classList.add('bg-rose-500/20', 'text-rose-400', 'border-rose-500/30', 'animate-pulse');
        }
      }

      if (this.timeLeft <= 0) {
        this.stopTimer();
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  selectAnswer(selectedText) {
    if (this.isAnswered) return;
    this.isAnswered = true;
    this.stopTimer();

    const q = this.getCurrentQuestion();
    const isCorrect = (selectedText.trim().toLowerCase() === q.answer.trim().toLowerCase());

    this.userAnswers[q.id] = {
      question: q.question,
      selected: selectedText,
      correctAnswer: q.answer,
      isCorrect: isCorrect,
      explanation: q.explanation || '',
      difficulty: q.difficulty
    };

    if (isCorrect) {
      this.score++;
      this.streak++;
      if (this.streak > this.maxStreak) this.maxStreak = this.streak;
      window.soundEffects.playCorrect();
    } else {
      this.streak = 0;
      window.soundEffects.playIncorrect();
    }

    this.highlightOptions(selectedText, q.answer, isCorrect);
    this.showFeedback(isCorrect, q.explanation);

    // Show Next button
    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
      nextBtn.classList.remove('hidden');
      if (this.currentIndex === this.questions.length - 1) {
        nextBtn.innerHTML = `<span>Complete Quiz</span> <i class="fa-solid fa-flag-checkered"></i>`;
      }
    }
  }

  handleTimeout() {
    if (this.isAnswered) return;
    this.isAnswered = true;
    const q = this.getCurrentQuestion();

    this.streak = 0;
    this.userAnswers[q.id] = {
      question: q.question,
      selected: '(Timed Out)',
      correctAnswer: q.answer,
      isCorrect: false,
      explanation: q.explanation || '',
      difficulty: q.difficulty
    };

    window.soundEffects.playIncorrect();
    this.highlightOptions(null, q.answer, false);
    this.showFeedback(false, `Time expired! The correct answer is: ${q.answer}. ${q.explanation || ''}`);

    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
      nextBtn.classList.remove('hidden');
    }
  }

  skipQuestion() {
    if (this.isAnswered) return;
    this.isAnswered = true;
    this.stopTimer();
    const q = this.getCurrentQuestion();

    this.streak = 0;
    this.userAnswers[q.id] = {
      question: q.question,
      selected: '(Skipped)',
      correctAnswer: q.answer,
      isCorrect: false,
      explanation: q.explanation || '',
      difficulty: q.difficulty
    };

    this.highlightOptions(null, q.answer, false);
    this.showFeedback(false, `Skipped. Correct answer: ${q.answer}`);

    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) nextBtn.classList.remove('hidden');
  }

  highlightOptions(selectedText, correctText, isCorrect) {
    const optionBtns = document.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
      btn.disabled = true;
      btn.classList.remove('hover:bg-slate-700/80', 'hover:text-white');
      const opt = btn.dataset.option;
      const icon = btn.querySelector('.option-icon');

      if (opt.trim().toLowerCase() === correctText.trim().toLowerCase()) {
        // Correct option
        btn.classList.add('bg-emerald-500/20', 'border-emerald-500', 'text-emerald-200');
        if (icon) {
          icon.className = 'option-icon fa-solid fa-circle-check text-emerald-400 text-lg';
        }
      } else if (selectedText && opt.trim().toLowerCase() === selectedText.trim().toLowerCase() && !isCorrect) {
        // Selected wrong option
        btn.classList.add('bg-rose-500/20', 'border-rose-500', 'text-rose-200');
        if (icon) {
          icon.className = 'option-icon fa-solid fa-circle-xmark text-rose-400 text-lg';
        }
      } else {
        btn.classList.add('opacity-40');
      }
    });
  }

  showFeedback(isCorrect, explanation) {
    const fbBox = document.getElementById('quiz-feedback-box');
    const fbTitle = document.getElementById('quiz-feedback-title');
    const fbText = document.getElementById('quiz-feedback-text');
    if (!fbBox || !fbTitle || !fbText) return;

    fbBox.classList.remove('hidden');
    if (isCorrect) {
      fbBox.className = 'mt-6 p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-200';
      fbTitle.innerHTML = `<i class="fa-solid fa-check text-emerald-400"></i> Excellent! That is correct.`;
    } else {
      fbBox.className = 'mt-6 p-4 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-200';
      fbTitle.innerHTML = `<i class="fa-solid fa-xmark text-rose-400"></i> Incorrect`;
    }
    fbText.textContent = explanation || '';
  }

  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      this.renderQuestion();
    } else {
      this.completeQuiz();
    }
  }

  completeQuiz() {
    this.stopTimer();
    this.quizState = 'completed';
    this.totalDurationSeconds = Math.round((Date.now() - this.startTime) / 1000);

    const total = this.questions.length;
    const correct = this.score;
    const accuracy = Math.round((correct / total) * 100);

    // Save stats in persistent storage
    window.storageManager.recordQuizCompleted(total, correct);

    // Play sounds & fireworks
    if (accuracy >= 80) {
      window.soundEffects.playFanfare();
      this.triggerConfetti();
    } else if (accuracy >= 50) {
      window.soundEffects.playCorrect();
    } else {
      window.soundEffects.playIncorrect();
    }

    this.renderScorecard(accuracy, total, correct);
  }

  renderScorecard(accuracy, total, correct) {
    const container = document.getElementById('quiz-render-area');
    if (!container) return;

    let grade = 'Needs Practice';
    let gradeBadge = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    if (accuracy === 100) {
      grade = 'Perfect Score! A+';
      gradeBadge = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    } else if (accuracy >= 85) {
      grade = 'Mastery Level! A';
      gradeBadge = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    } else if (accuracy >= 70) {
      grade = 'Proficient! B';
      gradeBadge = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    } else if (accuracy >= 50) {
      grade = 'Satisfactory C';
      gradeBadge = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }

    // Collect missed questions
    const missedList = Object.values(this.userAnswers).filter(a => !a.isCorrect);

    container.innerHTML = `
      <div class="w-full max-w-3xl mx-auto p-6 md:p-10 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/70 border border-slate-800 shadow-2xl backdrop-blur-xl">
        
        <!-- Scorecard Header -->
        <div class="text-center mb-8">
          <span class="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border mb-4 ${gradeBadge}">
            ${grade}
          </span>
          <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-2">Quiz Summary</h2>
          <p class="text-slate-400 text-sm">Here is a comprehensive breakdown of your performance.</p>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Accuracy</span>
            <span class="text-2xl md:text-3xl font-extrabold text-indigo-400">${accuracy}%</span>
          </div>
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Score</span>
            <span class="text-2xl md:text-3xl font-extrabold text-emerald-400">${correct} / ${total}</span>
          </div>
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Max Streak</span>
            <span class="text-2xl md:text-3xl font-extrabold text-amber-400">${this.maxStreak}</span>
          </div>
          <div class="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Time</span>
            <span class="text-2xl md:text-3xl font-extrabold text-purple-400">${this.totalDurationSeconds}s</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button type="button" id="quiz-btn-retry" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30">
            <i class="fa-solid fa-rotate-right mr-2"></i> Retake Quiz
          </button>
          
          ${missedList.length > 0 ? `
            <button type="button" id="quiz-btn-convert-flashcards" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm transition shadow-lg shadow-orange-600/30">
              <i class="fa-solid fa-wand-magic mr-2"></i> Turn Missed into Flashcards (${missedList.length})
            </button>
          ` : ''}

          <button type="button" onclick="window.app.switchTab('flashcards')" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition border border-slate-700">
            <i class="fa-solid fa-layer-group mr-2"></i> Study Flashcards
          </button>
        </div>

        <!-- Detailed Review Section -->
        <div class="mt-8 border-t border-slate-800 pt-6">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center justify-between">
            <span>Detailed Question Review</span>
            <span class="text-xs font-normal text-slate-400">Review answers & explanations</span>
          </h3>

          <div class="space-y-4">
            ${this.questions.map((q, idx) => {
              const res = this.userAnswers[q.id];
              const isCorrect = res ? res.isCorrect : false;
              return `
                <div class="p-4 rounded-xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}">
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <span class="text-xs font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}">
                      Q${idx + 1}: ${isCorrect ? '✓ Correct' : '✗ Missed'}
                    </span>
                    <span class="text-xs text-slate-500">${q.difficulty || 'Medium'}</span>
                  </div>
                  <p class="text-sm font-semibold text-slate-200 mb-2">${this.escapeHtml(q.question)}</p>
                  
                  <div class="text-xs space-y-1 mb-2">
                    <div class="text-slate-400">Your Answer: <span class="${isCorrect ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}">${this.escapeHtml(res ? res.selected : 'No answer')}</span></div>
                    ${!isCorrect ? `<div class="text-emerald-400">Correct Answer: <span class="font-semibold">${this.escapeHtml(q.answer)}</span></div>` : ''}
                  </div>

                  ${q.explanation ? `
                    <div class="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span class="font-semibold text-slate-300">Explanation:</span> ${this.escapeHtml(q.explanation)}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>
    `;

    document.getElementById('quiz-btn-retry')?.addEventListener('click', () => {
      this.startQuiz();
    });

    document.getElementById('quiz-btn-convert-flashcards')?.addEventListener('click', () => {
      const added = window.storageManager.addQuizMissesToFlashcards(missedList);
      window.app.showToast(`Added ${added} new review flashcards to deck!`, 'success');
      window.app.switchTab('flashcards');
    });
  }

  renderEmptyQuizState() {
    const container = document.getElementById('quiz-render-area');
    if (!container) return;
    container.innerHTML = `
      <div class="w-full max-w-xl mx-auto p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-2xl">
          <i class="fa-solid fa-circle-question"></i>
        </div>
        <h3 class="text-xl font-bold text-white mb-2">No Quiz Questions Available</h3>
        <p class="text-slate-400 text-sm mb-6">Use the AI Generator to automatically craft quiz questions from any topic or document.</p>
        <button type="button" onclick="window.app.switchTab('generator')" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/30">
          <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> Open AI Generator
        </button>
      </div>
    `;
  }

  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.rotation += p.vr;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
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
    // Keyboard answer shortcuts (A, B, C, D)
    window.addEventListener('keydown', (e) => {
      if (window.app?.currentTab !== 'quiz' || this.quizState !== 'in_progress' || this.isAnswered) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        const idx = key.charCodeAt(0) - 65;
        const optionBtns = document.querySelectorAll('.quiz-option-btn');
        if (optionBtns[idx]) {
          optionBtns[idx].click();
        }
      }
    });
  }
}

window.quizController = new QuizController();
