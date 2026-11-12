/**
 * MindSparks AI Main Application Controller
 */

class App {
  constructor() {
    this.currentTab = 'generator';
    this.theme = 'dark';
  }

  init() {
    this.applyTheme(window.storageManager.settings.theme || 'dark');
    this.populateDeckSelector();
    this.bindGlobalNavigation();
    this.bindGeneratorControls();
    this.bindSettingsControls();
    this.bindDeckManagerControls();

    // Initialize sub-controllers
    window.flashcardController.init();
    window.quizController.init();

    // Default to active deck in selector
    const activeDeck = window.storageManager.getActiveDeck();
    if (activeDeck) {
      this.updateActiveDeckDisplay(activeDeck);
    }

    // Switch to initial tab
    this.switchTab('generator');
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update Tab Navigation Buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.classList.add('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
        btn.classList.remove('text-slate-400', 'hover:text-slate-200');
      } else {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-lg', 'shadow-indigo-600/30');
        btn.classList.add('text-slate-400', 'hover:text-slate-200');
      }
    });

    // Toggle Content Views
    document.querySelectorAll('.tab-view').forEach(view => {
      view.classList.add('hidden');
    });

    const activeView = document.getElementById(`view-${tabId}`);
    if (activeView) {
      activeView.classList.remove('hidden');
    }

    // Tab-specific lifecycle callbacks
    if (tabId === 'flashcards') {
      window.flashcardController.loadActiveDeckCards();
    } else if (tabId === 'quiz') {
      if (window.quizController.quizState !== 'in_progress') {
        window.quizController.startQuiz();
      }
    } else if (tabId === 'decks') {
      this.renderDeckManager();
    } else if (tabId === 'analytics') {
      window.analyticsController.render();
    }
  }

  populateDeckSelector() {
    const selector = document.getElementById('global-deck-selector');
    if (!selector) return;

    const decks = window.storageManager.getAllDecks();
    const activeDeck = window.storageManager.getActiveDeck();

    selector.innerHTML = decks.map(d => `
      <option value="${d.id}" ${activeDeck && d.id === activeDeck.id ? 'selected' : ''}>
        ${d.title} (${d.flashcards ? d.flashcards.length : 0} cards, ${d.quiz ? d.quiz.length : 0} quiz)
      </option>
    `).join('');
  }

  updateActiveDeckDisplay(deck) {
    const badgeEl = document.getElementById('header-active-deck-title');
    if (badgeEl && deck) {
      badgeEl.textContent = deck.title;
    }
    const selector = document.getElementById('global-deck-selector');
    if (selector && deck) {
      selector.value = deck.id;
    }
  }

  selectDeckAndStudy(deckId) {
    window.storageManager.setActiveDeck(deckId);
    const deck = window.storageManager.getActiveDeck();
    this.updateActiveDeckDisplay(deck);
    this.populateDeckSelector();
    this.switchTab('flashcards');
  }

  toggleTheme() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    window.storageManager.saveSettings({ theme: newTheme });
  }

  applyTheme(theme) {
    this.theme = theme;
    const root = document.documentElement;
    const body = document.body;
    const icon = document.getElementById('theme-toggle-icon');

    if (theme === 'light') {
      root.classList.remove('dark');
      body.classList.remove('bg-slate-950', 'text-slate-100');
      body.classList.add('bg-slate-50', 'text-slate-900');
      if (icon) icon.className = 'fa-solid fa-moon text-slate-700';
    } else {
      root.classList.add('dark');
      body.classList.remove('bg-slate-50', 'text-slate-900');
      body.classList.add('bg-slate-950', 'text-slate-100');
      if (icon) icon.className = 'fa-solid fa-sun text-amber-400';
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      info: 'fa-solid fa-circle-info text-indigo-400',
      success: 'fa-solid fa-circle-check text-emerald-400',
      error: 'fa-solid fa-circle-exclamation text-rose-400',
      warning: 'fa-solid fa-triangle-exclamation text-amber-400'
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-slate-200 text-xs md:text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0`;
    toast.innerHTML = `
      <i class="${icons[type] || icons.info} text-base"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Remove after 3s
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', '-translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  bindGlobalNavigation() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchTab(e.currentTarget.dataset.tab);
      });
    });

    // Deck Selector dropdown
    const selector = document.getElementById('global-deck-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        window.storageManager.setActiveDeck(e.target.value);
        const active = window.storageManager.getActiveDeck();
        this.updateActiveDeckDisplay(active);
        if (this.currentTab === 'flashcards') {
          window.flashcardController.loadActiveDeckCards();
        } else if (this.currentTab === 'quiz') {
          window.quizController.startQuiz();
        }
      });
    }

    // Theme toggle
    document.getElementById('btn-toggle-theme')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Sound toggle
    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isMuted = window.soundEffects.toggleMute();
        const icon = soundBtn.querySelector('i');
        if (icon) {
          icon.className = isMuted ? 'fa-solid fa-volume-xmark text-slate-500' : 'fa-solid fa-volume-high text-indigo-400';
        }
        this.showToast(isMuted ? 'Sound muted' : 'Sound enabled', 'info');
      });
    }
  }

  bindGeneratorControls() {
    // Source Type Switcher (Topic vs Custom Text vs File)
    const sourceTabs = document.querySelectorAll('.gen-source-tab');
    sourceTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        sourceTabs.forEach(t => t.classList.remove('bg-indigo-600', 'text-white'));
        e.currentTarget.classList.add('bg-indigo-600', 'text-white');

        const mode = e.currentTarget.dataset.source;
        document.getElementById('gen-panel-topic')?.classList.toggle('hidden', mode !== 'topic');
        document.getElementById('gen-panel-text')?.classList.toggle('hidden', mode !== 'text');
        document.getElementById('gen-panel-file')?.classList.toggle('hidden', mode !== 'file');
      });
    });

    // Preset Topic Pills
    document.querySelectorAll('.topic-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const topicInput = document.getElementById('gen-topic-input');
        if (topicInput) {
          topicInput.value = e.currentTarget.dataset.topic;
          topicInput.focus();
        }
      });
    });

    // File Upload Handler
    const fileInput = document.getElementById('gen-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          const preview = document.getElementById('gen-file-preview');
          const previewText = document.getElementById('gen-file-text');
          if (preview && previewText) {
            preview.classList.remove('hidden');
            previewText.value = content;
          }
          this.showToast(`Loaded file: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'success');
        };
        reader.readAsText(file);
      });
    }

    // Generate Button Click
    const generateBtn = document.getElementById('btn-run-generate');
    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        await this.handleGenerate();
      });
    }
  }

  async handleGenerate() {
    const btn = document.getElementById('btn-run-generate');
    const spinner = document.getElementById('gen-spinner');
    const btnText = document.getElementById('gen-btn-text');

    // Determine active input mode
    let sourceType = 'topic';
    const activeTab = document.querySelector('.gen-source-tab.bg-indigo-600');
    if (activeTab) sourceType = activeTab.dataset.source;

    let topic = document.getElementById('gen-topic-input')?.value || '';
    let content = '';

    if (sourceType === 'text') {
      content = document.getElementById('gen-text-input')?.value || '';
    } else if (sourceType === 'file') {
      content = document.getElementById('gen-file-text')?.value || '';
    }

    const itemCount = parseInt(document.getElementById('gen-item-count')?.value || '5', 10);
    const difficulty = document.getElementById('gen-difficulty')?.value || 'Medium';
    const questionType = document.getElementById('gen-question-type')?.value || 'mix';
    const provider = document.getElementById('gen-ai-provider')?.value || 'offline';
    const apiKey = document.getElementById('gen-api-key')?.value || '';

    // Validate
    if (sourceType === 'topic' && !topic.trim()) {
      this.showToast('Please type a study topic or click a suggestion.', 'warning');
      return;
    }
    if ((sourceType === 'text' || sourceType === 'file') && !content.trim()) {
      this.showToast('Please provide notes or document text to analyze.', 'warning');
      return;
    }

    // UI Loading state
    if (btn) btn.disabled = true;
    if (spinner) spinner.classList.remove('hidden');
    if (btnText) btnText.textContent = 'Generating AI Study Deck...';

    try {
      const generatedDeck = await window.aiGenerator.generateDeck({
        sourceType,
        topic,
        content,
        itemCount,
        difficulty,
        questionType,
        provider,
        apiKey
      });

      // Save as new active deck
      const newDeck = window.storageManager.createDeck(generatedDeck);
      this.populateDeckSelector();
      this.updateActiveDeckDisplay(newDeck);

      this.showToast(`Created deck: "${newDeck.title}" with ${newDeck.flashcards.length} cards & ${newDeck.quiz.length} questions!`, 'success');
      
      // Auto navigate to Flashcards Arena
      setTimeout(() => {
        this.switchTab('flashcards');
      }, 500);

    } catch (err) {
      console.error(err);
      this.showToast(err.message || 'Generation failed. Try another topic or engine.', 'error');
    } finally {
      if (btn) btn.disabled = false;
      if (spinner) spinner.classList.add('hidden');
      if (btnText) btnText.textContent = 'Generate Flashcards & Quiz';
    }
  }

  bindSettingsControls() {
    // Save API keys
    document.getElementById('btn-save-settings')?.addEventListener('click', () => {
      const geminiApiKey = document.getElementById('settings-gemini-key')?.value.trim();
      const openaiApiKey = document.getElementById('settings-openai-key')?.value.trim();
      const quizTimerSec = parseInt(document.getElementById('settings-quiz-timer')?.value || '30', 10);
      const speechRate = parseFloat(document.getElementById('settings-speech-rate')?.value || '1.0');

      window.storageManager.saveSettings({
        geminiApiKey,
        openaiApiKey,
        quizTimerSec,
        speechRate
      });

      this.showToast('Settings saved successfully!', 'success');
    });

    // Backup & Restore
    document.getElementById('btn-export-backup')?.addEventListener('click', () => {
      const backupJson = window.storageManager.exportFullBackup();
      this.downloadFile('mindsparks_backup.json', backupJson, 'application/json');
      this.showToast('Full study backup downloaded!', 'success');
    });

    document.getElementById('btn-import-backup')?.addEventListener('click', () => {
      const fileInput = document.getElementById('backup-file-input');
      if (fileInput) fileInput.click();
    });

    document.getElementById('backup-file-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const count = window.storageManager.importDeckFromJson(event.target.result);
          this.populateDeckSelector();
          this.showToast(`Imported ${count} study deck(s)!`, 'success');
          this.switchTab('decks');
        } catch (err) {
          this.showToast('Import failed: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  renderDeckManager() {
    const container = document.getElementById('deck-manager-list');
    if (!container) return;

    const decks = window.storageManager.getAllDecks();
    const activeDeck = window.storageManager.getActiveDeck();

    container.innerHTML = decks.map(deck => {
      const isActive = activeDeck && deck.id === activeDeck.id;
      return `
        <div class="p-6 rounded-2xl border ${isActive ? 'bg-indigo-950/40 border-indigo-500/50' : 'bg-slate-900/80 border-slate-800'} backdrop-blur-xl transition hover:border-slate-700">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-xl font-bold text-white">${deck.title}</h3>
                ${isActive ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">ACTIVE</span>' : ''}
              </div>
              <p class="text-xs text-slate-400 max-w-xl">${deck.description || 'No description provided.'}</p>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap">
              <button type="button" onclick="window.app.selectDeckAndStudy('${deck.id}')" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition">
                <i class="fa-solid fa-play mr-1"></i> Study Deck
              </button>
              <button type="button" onclick="window.app.exportAnki('${deck.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700" title="Export to Anki TSV">
                <i class="fa-solid fa-file-export mr-1"></i> Anki
              </button>
              <button type="button" onclick="window.app.printStudySheet('${deck.id}')" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700" title="Printable Study Sheet">
                <i class="fa-solid fa-print mr-1"></i> Print
              </button>
              <button type="button" onclick="window.app.deleteDeck('${deck.id}')" class="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition" title="Delete Deck">
                <i class="fa-regular fa-trash-can text-sm"></i>
              </button>
            </div>
          </div>

          <!-- Deck details -->
          <div class="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span><i class="fa-solid fa-layer-group mr-1.5 text-indigo-400"></i> ${deck.flashcards ? deck.flashcards.length : 0} Flashcards</span>
            <span><i class="fa-solid fa-circle-question mr-1.5 text-purple-400"></i> ${deck.quiz ? deck.quiz.length : 0} Quiz Questions</span>
            <div class="flex items-center gap-1.5 ml-auto">
              ${(deck.tags || []).map(t => `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">${t}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  bindDeckManagerControls() {
    // Create new manual deck button
    document.getElementById('btn-open-create-deck')?.addEventListener('click', () => {
      const title = prompt('Enter a title for the new study deck:');
      if (title && title.trim()) {
        const newDeck = window.storageManager.createDeck({
          title: title.trim(),
          description: 'Custom created study set',
          flashcards: [
            { front: 'Sample Prompt: What is the key concept?', back: 'Sample Answer: Explanatory text goes here.', hint: 'Recall hint' }
          ],
          quiz: [
            { type: 'mcq', question: 'Sample Question: Which option is correct?', options: ['Option A', 'Option B', 'Option C', 'Option D'], answer: 'Option A', explanation: 'Option A is correct.' }
          ]
        });
        this.populateDeckSelector();
        this.renderDeckManager();
        this.showToast(`Deck "${newDeck.title}" created!`, 'success');
      }
    });
  }

  exportAnki(deckId) {
    const deck = window.storageManager.getAllDecks().find(d => d.id === deckId);
    if (!deck) return;
    const ankiTsv = window.storageManager.exportDeckToAnki(deck);
    const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_anki.txt`;
    this.downloadFile(filename, ankiTsv, 'text/tab-separated-values');
    this.showToast(`Exported "${deck.title}" for Anki!`, 'success');
  }

  printStudySheet(deckId) {
    const deck = window.storageManager.getAllDecks().find(d => d.id === deckId);
    if (!deck) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${deck.title} - Printable Study Sheet</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
          h1 { color: #0f172a; margin-bottom: 4px; }
          .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; }
          .section-title { font-size: 18px; font-weight: bold; margin-top: 32px; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
          .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; }
          .card-box { border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; page-break-inside: avoid; }
          .card-q { font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #1e1b4b; }
          .card-a { font-size: 13px; color: #334155; }
          .quiz-item { margin-bottom: 20px; page-break-inside: avoid; }
          .quiz-q { font-weight: bold; font-size: 15px; margin-bottom: 6px; }
          .quiz-opts { list-style-type: upper-alpha; padding-left: 20px; font-size: 14px; }
          .page-break { page-break-before: always; }
          .answer-key { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>${deck.title}</h1>
        <div class="meta">MindSparks AI Study Sheet • ${new Date().toLocaleDateString()} • Tags: ${(deck.tags || []).join(', ')}</div>

        <!-- FLASHCARDS SECTION -->
        <div class="section-title">I. Flashcards & Core Concepts (${(deck.flashcards || []).length} items)</div>
        <div class="card-grid">
          ${(deck.flashcards || []).map((c, i) => `
            <div class="card-box">
              <div class="card-q">#${i + 1}. ${c.front}</div>
              <div class="card-a">${c.back}</div>
            </div>
          `).join('')}
        </div>

        <div class="page-break"></div>

        <!-- QUIZ WORKSHEET SECTION -->
        <div class="section-title">II. Quiz Worksheet (${(deck.quiz || []).length} questions)</div>
        <div>
          ${(deck.quiz || []).map((q, i) => `
            <div class="quiz-item">
              <div class="quiz-q">${i + 1}. ${q.question}</div>
              <ul class="quiz-opts">
                ${q.options.map(opt => `<li>${opt}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="page-break"></div>

        <!-- ANSWER KEY SECTION -->
        <div class="section-title">III. Answer Key & Detailed Explanations</div>
        <div class="answer-key">
          ${(deck.quiz || []).map((q, i) => `
            <div style="margin-bottom: 12px;">
              <strong>Q${i + 1}:</strong> Correct: <u>${q.answer}</u><br>
              <span style="font-size: 13px; color: #475569;">Explanation: ${q.explanation || 'N/A'}</span>
            </div>
          `).join('')}
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  deleteDeck(deckId) {
    if (confirm('Are you sure you want to delete this study deck?')) {
      try {
        window.storageManager.deleteDeck(deckId);
        this.populateDeckSelector();
        this.renderDeckManager();
        this.showToast('Study deck deleted.', 'info');
      } catch (err) {
        this.showToast(err.message, 'error');
      }
    }
  }

  downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
