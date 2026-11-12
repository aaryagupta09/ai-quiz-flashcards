/**
 * Analytics, Spaced Repetition Mastery & Study Insights
 */

class AnalyticsController {
  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('analytics-render-area');
    if (!container) return;

    const stats = window.storageManager.stats;
    const allDecks = window.storageManager.getAllDecks();

    // Calculate aggregated Leitner box distribution
    let boxCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalCardsAcrossAll = 0;
    let starredCount = 0;

    allDecks.forEach(d => {
      (d.flashcards || []).forEach(c => {
        totalCardsAcrossAll++;
        const box = c.leitnerBox || 1;
        boxCounts[box] = (boxCounts[box] || 0) + 1;
        if (c.starred) starredCount++;
      });
    });

    const overallAccuracy = stats.totalQuestionsAnswered > 0
      ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100)
      : 0;

    // Mastered cards (Box 4 & 5)
    const masteredCards = (boxCounts[4] || 0) + (boxCounts[5] || 0);
    const masteryPct = totalCardsAcrossAll > 0
      ? Math.round((masteredCards / totalCardsAcrossAll) * 100)
      : 0;

    container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto space-y-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-white mb-1">Study Analytics & Mastery</h2>
            <p class="text-slate-400 text-sm">Track your spaced repetition progression and quiz performance.</p>
          </div>
          <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-bold">
            <i class="fa-solid fa-fire text-amber-500"></i> ${stats.currentStreak} Day Streak
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 text-lg">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Cards Studied</span>
            <span class="text-2xl md:text-3xl font-extrabold text-white">${stats.totalCardsStudied}</span>
          </div>

          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 text-lg">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Quiz Accuracy</span>
            <span class="text-2xl md:text-3xl font-extrabold text-white">${overallAccuracy}%</span>
          </div>

          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 text-lg">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Mastery Rate</span>
            <span class="text-2xl md:text-3xl font-extrabold text-emerald-400">${masteryPct}%</span>
          </div>

          <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 text-lg">
              <i class="fa-solid fa-star"></i>
            </div>
            <span class="text-xs text-slate-400 uppercase tracking-wider block mb-1">Starred Cards</span>
            <span class="text-2xl md:text-3xl font-extrabold text-amber-400">${starredCount}</span>
          </div>
        </div>

        <!-- Leitner Spaced Repetition Distribution Chart -->
        <div class="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-bold text-white mb-1">Leitner Spaced Repetition Distribution</h3>
              <p class="text-xs text-slate-400">Cards progress from Box 1 (Learning) to Box 5 (Permanent Mastery).</p>
            </div>
            <span class="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              ${totalCardsAcrossAll} Total Cards
            </span>
          </div>

          <div class="space-y-4">
            ${[1, 2, 3, 4, 5].map(box => {
              const count = boxCounts[box] || 0;
              const pct = totalCardsAcrossAll > 0 ? Math.round((count / totalCardsAcrossAll) * 100) : 0;
              const meta = {
                1: { name: 'Box 1: Learning / Needs Review', color: 'bg-rose-500' },
                2: { name: 'Box 2: Reviewing', color: 'bg-orange-500' },
                3: { name: 'Box 3: Familiar', color: 'bg-amber-500' },
                4: { name: 'Box 4: Proficient', color: 'bg-blue-500' },
                5: { name: 'Box 5: Mastered', color: 'bg-emerald-500' }
              }[box];

              return `
                <div>
                  <div class="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                    <span>${meta.name}</span>
                    <span class="text-slate-400">${count} cards (${pct}%)</span>
                  </div>
                  <div class="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div class="${meta.color} h-full rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Per-Deck Breakdown -->
        <div class="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 class="text-lg font-bold text-white mb-4">Study Set Breakdown</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-300">
              <thead class="text-xs uppercase bg-slate-800/60 text-slate-400">
                <tr>
                  <th class="px-4 py-3 rounded-l-lg">Study Deck</th>
                  <th class="px-4 py-3">Flashcards</th>
                  <th class="px-4 py-3">Quiz Items</th>
                  <th class="px-4 py-3">Tags</th>
                  <th class="px-4 py-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${allDecks.map(deck => `
                  <tr class="hover:bg-slate-800/30 transition">
                    <td class="px-4 py-3 font-semibold text-white">
                      ${deck.title}
                    </td>
                    <td class="px-4 py-3 text-slate-300">
                      ${deck.flashcards ? deck.flashcards.length : 0}
                    </td>
                    <td class="px-4 py-3 text-slate-300">
                      ${deck.quiz ? deck.quiz.length : 0}
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1">
                        ${(deck.tags || []).slice(0, 2).map(t => `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">${t}</span>`).join('')}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <button type="button" onclick="window.app.selectDeckAndStudy('${deck.id}')" class="px-3 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold transition">
                        Study
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }
}

window.analyticsController = new AnalyticsController();
