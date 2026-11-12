/**
 * MindSparks AI Storage & Deck Manager
 * Manages LocalStorage persistence, seed decks, SRS Leitner tracking, and export/import
 */

const STORAGE_KEYS = {
  DECKS: 'mindsparks_decks_v1',
  ACTIVE_DECK_ID: 'mindsparks_active_deck_id',
  SETTINGS: 'mindsparks_settings_v1',
  STATS: 'mindsparks_analytics_v1'
};

const DEFAULT_SETTINGS = {
  theme: 'dark',
  aiProvider: 'offline', // 'offline', 'gemini', 'openai', 'ollama'
  geminiApiKey: '',
  openaiApiKey: '',
  ollamaUrl: 'http://localhost:11434',
  quizTimerSec: 30,
  quizMode: 'practice', // 'practice' (instant feedback) or 'exam' (feedback at end)
  soundEffects: true,
  speechVoice: '',
  speechRate: 1.0
};

// High-quality Starter Study Decks with integrated Flashcards & Quizzes
const STARTER_DECKS = [
  {
    id: 'starter-dsa',
    title: 'Data Structures & Algorithms',
    description: 'Master Big-O notation, trees, graphs, dynamic programming, and core sorting techniques.',
    tags: ['Computer Science', 'Algorithms', 'DSA'],
    createdAt: new Date().toISOString(),
    flashcards: [
      {
        id: 'fc-dsa-1',
        front: 'What is the average and worst-case time complexity of QuickSort?',
        back: 'Average: O(n log n)\nWorst-case: O(n²) when the pivot selection consistently yields unbalanced partitions.',
        hint: 'Think about when the array is already sorted and you pick the first element as pivot.',
        leitnerBox: 1,
        repetitions: 0,
        starred: false
      },
      {
        id: 'fc-dsa-2',
        front: 'Explain the difference between a BFS (Breadth-First Search) and DFS (Depth-First Search).',
        back: 'BFS explores neighbor nodes level by level using a FIFO Queue.\nDFS explores as deep as possible along each branch before backtracking using a LIFO Stack (or recursion).',
        hint: 'Queue vs Stack',
        leitnerBox: 2,
        repetitions: 1,
        starred: true
      },
      {
        id: 'fc-dsa-3',
        front: 'What is the time complexity to search, insert, and delete in an AVL Tree or Red-Black Tree?',
        back: 'O(log n) for all three operations, because the tree maintains a self-balancing height guarantee.',
        hint: 'Logarithmic height balancing',
        leitnerBox: 3,
        repetitions: 2,
        starred: false
      },
      {
        id: 'fc-dsa-4',
        front: 'What is the space complexity of an in-place algorithm?',
        back: 'O(1) auxiliary space (beyond the input itself, requiring only a constant amount of extra memory).',
        hint: 'Auxiliary memory usage',
        leitnerBox: 1,
        repetitions: 0,
        starred: false
      },
      {
        id: 'fc-dsa-5',
        front: 'What two properties define a Dynamic Programming problem?',
        back: '1. Optimal Substructure: Optimal solution of the problem can be constructed from optimal solutions of its subproblems.\n2. Overlapping Subproblems: The problem can be broken down into subproblems which are reused several times.',
        hint: 'Subproblems that repeat and build the global optimum',
        leitnerBox: 2,
        repetitions: 1,
        starred: true
      }
    ],
    quiz: [
      {
        id: 'qz-dsa-1',
        type: 'mcq',
        question: 'Which data structure is fundamentally used to implement Breadth-First Search (BFS)?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Binary Search Tree'],
        answer: 'Queue',
        explanation: 'BFS explores neighbor nodes level by level in First-In-First-Out order, which is natively provided by a Queue.',
        difficulty: 'Easy'
      },
      {
        id: 'qz-dsa-2',
        type: 'mcq',
        question: 'What is the worst-case time complexity of searching for an element in a Hash Table with chaining?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        answer: 'O(n)',
        explanation: 'In the worst case where all keys hash to the exact same bucket, the lookup degrades to searching a linked list of length n, which takes O(n).',
        difficulty: 'Medium'
      },
      {
        id: 'qz-dsa-3',
        type: 'boolean',
        question: 'True or False: MergeSort has a worst-case time complexity of O(n log n) and is a stable sorting algorithm.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'MergeSort divides the array evenly and merges in linear time with O(n log n) worst-case time guarantee, preserving the relative order of equal elements (stable).',
        difficulty: 'Easy'
      },
      {
        id: 'qz-dsa-4',
        type: 'mcq',
        question: 'Which algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights?',
        options: ['Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm', 'Bellman-Ford Algorithm', 'Floyd-Warshall Algorithm'],
        answer: 'Dijkstra\'s Algorithm',
        explanation: 'Dijkstra\'s algorithm uses a priority queue to iteratively pick the closest unvisited vertex, solving single-source shortest path for non-negative weights in O((V + E) log V).',
        difficulty: 'Medium'
      },
      {
        id: 'qz-dsa-5',
        type: 'blank',
        question: 'An in-place algorithm has an auxiliary space complexity of O(______).',
        options: ['1', 'n', 'log n', 'n^2'],
        answer: '1',
        explanation: 'In-place algorithms modify the input structure in place without requiring memory proportional to the input size, thus having O(1) auxiliary space.',
        difficulty: 'Easy'
      }
    ]
  },
  {
    id: 'starter-ml',
    title: 'Machine Learning & Neural Networks',
    description: 'Foundations of Deep Learning, loss functions, backpropagation, and transformer architectures.',
    tags: ['AI', 'Deep Learning', 'Neural Networks'],
    createdAt: new Date().toISOString(),
    flashcards: [
      {
        id: 'fc-ml-1',
        front: 'What is the vanishing gradient problem in deep neural networks?',
        back: 'During backpropagation, gradients shrink exponentially as they propagate backward through many layers with saturating activations (like sigmoid/tanh), causing early layers to train exceedingly slowly or not at all.',
        hint: 'Think of chain rule multiplication with derivatives < 1',
        leitnerBox: 1,
        repetitions: 0,
        starred: false
      },
      {
        id: 'fc-ml-2',
        front: 'What is the Self-Attention mechanism in the Transformer architecture?',
        back: 'Self-attention calculates attention weights between every pair of tokens in a sequence using Query, Key, and Value vectors:\nAttention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V.',
        hint: 'Query, Key, Value matrix multiplication',
        leitnerBox: 2,
        repetitions: 1,
        starred: true
      },
      {
        id: 'fc-ml-3',
        front: 'What is the fundamental difference between L1 (Lasso) and L2 (Ridge) Regularization?',
        back: 'L1 adds the absolute sum of weights (|w|) to the loss, driving non-essential weights to exactly zero (feature selection/sparsity).\nL2 adds the squared sum of weights (w²), shrinking weights close to zero without setting them strictly to zero.',
        hint: 'Absolute values vs Squared values; sparsity',
        leitnerBox: 3,
        repetitions: 2,
        starred: false
      },
      {
        id: 'fc-ml-4',
        front: 'What is Precision vs Recall?',
        back: 'Precision = TP / (TP + FP) -> Out of all predicted positives, how many were correct?\nRecall = TP / (TP + FN) -> Out of all actual positives, how many did the model identify?',
        hint: 'False Positives impact Precision; False Negatives impact Recall',
        leitnerBox: 2,
        repetitions: 1,
        starred: false
      }
    ],
    quiz: [
      {
        id: 'qz-ml-1',
        type: 'mcq',
        question: 'Which activation function is most widely used in hidden layers of modern deep networks to mitigate vanishing gradients?',
        options: ['ReLU (Rectified Linear Unit)', 'Sigmoid', 'Hyperbolic Tangent (Tanh)', 'Linear'],
        answer: 'ReLU (Rectified Linear Unit)',
        explanation: 'ReLU outputs f(x) = max(0, x). For positive inputs, its gradient is always 1, which prevents gradients from diminishing across deep layers.',
        difficulty: 'Easy'
      },
      {
        id: 'qz-ml-2',
        type: 'mcq',
        question: 'In the Transformer Attention equation Attention(Q,K,V) = softmax(QK^T / √d_k) * V, why is the division by √d_k included?',
        options: [
          'To scale down large dot products that would push the softmax into regions with extremely small gradients',
          'To reduce the dimensionality of the key vectors',
          'To ensure the attention weights sum to 100',
          'To speed up GPU matrix multiplication'
        ],
        answer: 'To scale down large dot products that would push the softmax into regions with extremely small gradients',
        explanation: 'For large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions with near-zero gradients. Scaling by √d_k counteracts this effect.',
        difficulty: 'Hard'
      },
      {
        id: 'qz-ml-3',
        type: 'boolean',
        question: 'True or False: Overfitting occurs when a model performs exceptionally well on training data but poorly on unseen test data.',
        options: ['True', 'False'],
        answer: 'True',
        explanation: 'Overfitting happens when a model learns noise and specific details of the training set rather than generalizable underlying patterns.',
        difficulty: 'Easy'
      }
    ]
  },
  {
    id: 'starter-web',
    title: 'Modern JavaScript & React Core',
    description: 'Event loop, closures, promises, React reconciliation, useEffect, and state patterns.',
    tags: ['Web Dev', 'JavaScript', 'React', 'Frontend'],
    createdAt: new Date().toISOString(),
    flashcards: [
      {
        id: 'fc-web-1',
        front: 'What is a JavaScript Closure and when is it created?',
        back: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment. It gives an inner function access to an outer function\'s scope even after the outer function has finished executing.',
        hint: 'Lexical scope retention',
        leitnerBox: 2,
        repetitions: 1,
        starred: true
      },
      {
        id: 'fc-web-2',
        front: 'Explain the difference between the Microtask Queue and the Macrotask (Callback) Queue in the JS Event Loop.',
        back: 'Microtasks (Promises .then/catch, queueMicrotask, MutationObserver) have higher priority and are all executed immediately after the current call stack clears, before the engine renders or picks the next Macrotask (setTimeout, setInterval, I/O).',
        hint: 'Promises take precedence over setTimeout',
        leitnerBox: 3,
        repetitions: 2,
        starred: false
      },
      {
        id: 'fc-web-3',
        front: 'What is the purpose of React keys in lists, and why shouldn\'t array index be used as a key for dynamic lists?',
        back: 'Keys give elements a stable identity across renders so React can efficiently match virtual DOM nodes. Using array indices leads to state bugs, unnecessary re-renders, and animation glitches when items are inserted, deleted, or reordered.',
        hint: 'Stable element identity during reconciliation',
        leitnerBox: 1,
        repetitions: 0,
        starred: false
      }
    ],
    quiz: [
      {
        id: 'qz-web-1',
        type: 'mcq',
        question: 'What is the output order of: console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);?',
        options: ['1, 4, 3, 2', '1, 2, 3, 4', '1, 3, 4, 2', '1, 4, 2, 3'],
        answer: '1, 4, 3, 2',
        explanation: '1 and 4 are synchronous on the call stack. Promise microtask (3) runs immediately after the stack clears. The setTimeout macrotask (2) runs in the next event loop turn.',
        difficulty: 'Medium'
      },
      {
        id: 'qz-web-2',
        type: 'boolean',
        question: 'True or False: React state updates via useState are always synchronous.',
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'React batches state updates and executes them asynchronously for optimal performance and rendering consistency.',
        difficulty: 'Easy'
      }
    ]
  }
];

class StorageManager {
  constructor() {
    this.decks = [];
    this.activeDeckId = null;
    this.settings = { ...DEFAULT_SETTINGS };
    this.stats = {
      totalCardsStudied: 0,
      totalQuizzesTaken: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      currentStreak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0]
    };
    this.init();
  }

  init() {
    // Load Decks
    try {
      const storedDecks = localStorage.getItem(STORAGE_KEYS.DECKS);
      if (storedDecks) {
        this.decks = JSON.parse(storedDecks);
      } else {
        this.decks = [...STARTER_DECKS];
        this.saveDecks();
      }
    } catch (e) {
      console.error('Error loading decks:', e);
      this.decks = [...STARTER_DECKS];
    }

    // Load Active Deck
    const savedActiveId = localStorage.getItem(STORAGE_KEYS.ACTIVE_DECK_ID);
    if (savedActiveId && this.decks.some(d => d.id === savedActiveId)) {
      this.activeDeckId = savedActiveId;
    } else if (this.decks.length > 0) {
      this.activeDeckId = this.decks[0].id;
    }

    // Load Settings
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }
    } catch (e) {
      this.settings = { ...DEFAULT_SETTINGS };
    }

    // Load Stats
    try {
      const storedStats = localStorage.getItem(STORAGE_KEYS.STATS);
      if (storedStats) {
        this.stats = { ...this.stats, ...JSON.parse(storedStats) };
      }
      this.updateStreak();
    } catch (e) {}
  }

  saveDecks() {
    try {
      localStorage.setItem(STORAGE_KEYS.DECKS, JSON.stringify(this.decks));
    } catch (e) {
      console.error('Failed to save decks to localStorage:', e);
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }

  saveStats() {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
  }

  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    if (this.stats.lastStudyDate) {
      const last = new Date(this.stats.lastStudyDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.stats.currentStreak += 1;
        this.stats.lastStudyDate = today;
      } else if (diffDays > 1) {
        this.stats.currentStreak = 1;
        this.stats.lastStudyDate = today;
      }
    } else {
      this.stats.lastStudyDate = today;
      this.stats.currentStreak = 1;
    }
    this.saveStats();
  }

  recordCardStudied(cardId, leitnerRating) {
    // rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
    const deck = this.getActiveDeck();
    if (!deck) return;
    const card = deck.flashcards.find(c => c.id === cardId);
    if (!card) return;

    card.repetitions = (card.repetitions || 0) + 1;
    card.lastReviewed = new Date().toISOString();

    if (leitnerRating === 1) {
      card.leitnerBox = 1; // Reset to box 1 on failure
    } else if (leitnerRating === 2) {
      card.leitnerBox = Math.max(1, (card.leitnerBox || 1));
    } else if (leitnerRating >= 3) {
      card.leitnerBox = Math.min(5, (card.leitnerBox || 1) + 1);
    }

    this.stats.totalCardsStudied += 1;
    this.updateStreak();
    this.saveDecks();
    this.saveStats();
  }

  recordQuizCompleted(totalQuestions, correctAnswers) {
    this.stats.totalQuizzesTaken += 1;
    this.stats.totalQuestionsAnswered += totalQuestions;
    this.stats.totalCorrectAnswers += correctAnswers;
    this.updateStreak();
    this.saveStats();
  }

  getAllDecks() {
    return this.decks;
  }

  getActiveDeck() {
    return this.decks.find(d => d.id === this.activeDeckId) || this.decks[0] || null;
  }

  setActiveDeck(deckId) {
    if (this.decks.some(d => d.id === deckId)) {
      this.activeDeckId = deckId;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DECK_ID, deckId);
    }
  }

  createDeck(deckData) {
    const newDeck = {
      id: 'deck-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: deckData.title || 'Untitled Study Deck',
      description: deckData.description || '',
      tags: deckData.tags || ['Study'],
      createdAt: new Date().toISOString(),
      flashcards: deckData.flashcards || [],
      quiz: deckData.quiz || []
    };

    // Ensure IDs on cards and quiz items
    newDeck.flashcards = newDeck.flashcards.map((fc, i) => ({
      id: fc.id || `fc-${Date.now()}-${i}`,
      front: fc.front || 'Question',
      back: fc.back || 'Answer',
      hint: fc.hint || '',
      leitnerBox: fc.leitnerBox || 1,
      repetitions: 0,
      starred: !!fc.starred
    }));

    newDeck.quiz = newDeck.quiz.map((q, i) => ({
      id: q.id || `qz-${Date.now()}-${i}`,
      type: q.type || 'mcq',
      question: q.question || 'Question',
      options: q.options || ['Option A', 'Option B'],
      answer: q.answer || (q.options ? q.options[0] : 'True'),
      explanation: q.explanation || '',
      difficulty: q.difficulty || 'Medium'
    }));

    this.decks.unshift(newDeck);
    this.activeDeckId = newDeck.id;
    this.saveDecks();
    localStorage.setItem(STORAGE_KEYS.ACTIVE_DECK_ID, newDeck.id);
    return newDeck;
  }

  updateDeck(deckId, updatedData) {
    const idx = this.decks.findIndex(d => d.id === deckId);
    if (idx !== -1) {
      this.decks[idx] = { ...this.decks[idx], ...updatedData };
      this.saveDecks();
      return this.decks[idx];
    }
    return null;
  }

  deleteDeck(deckId) {
    if (this.decks.length <= 1) {
      throw new Error('You must keep at least one study deck.');
    }
    this.decks = this.decks.filter(d => d.id !== deckId);
    if (this.activeDeckId === deckId) {
      this.activeDeckId = this.decks[0].id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DECK_ID, this.activeDeckId);
    }
    this.saveDecks();
  }

  // Add missed quiz questions into the active deck as flashcards for study!
  addQuizMissesToFlashcards(missedQuestions) {
    const deck = this.getActiveDeck();
    if (!deck || !missedQuestions.length) return 0;

    let addedCount = 0;
    missedQuestions.forEach((q, idx) => {
      // Check if duplicate already exists
      const exists = deck.flashcards.some(f => f.front.toLowerCase() === q.question.toLowerCase());
      if (!exists) {
        deck.flashcards.push({
          id: `fc-missed-${Date.now()}-${idx}`,
          front: q.question,
          back: `Correct Answer: ${q.answer}\n\nExplanation: ${q.explanation || ''}`,
          hint: `Quiz Question (${q.difficulty || 'Review'})`,
          leitnerBox: 1, // Start in Box 1
          repetitions: 0,
          starred: true
        });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      this.saveDecks();
    }
    return addedCount;
  }

  // Export to Anki TSV format
  exportDeckToAnki(deck) {
    if (!deck || !deck.flashcards.length) return '';
    const lines = ['#separator:tab', '#html:true', '#tags column:3'];
    deck.flashcards.forEach(card => {
      const front = card.front.replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const back = (card.back + (card.hint ? `<br><i>Hint: ${card.hint}</i>` : '')).replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const tags = (deck.tags || []).join(' ') || 'MindSparks';
      lines.push(`${front}\t${back}\t${tags}`);
    });
    return lines.join('\n');
  }

  // Export to standard JSON
  exportDeckToJson(deck) {
    return JSON.stringify(deck, null, 2);
  }

  // Export full backup of all decks and settings
  exportFullBackup() {
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      decks: this.decks,
      stats: this.stats
    }, null, 2);
  }

  // Import deck from JSON
  importDeckFromJson(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.decks && Array.isArray(data.decks)) {
        // Full backup format
        data.decks.forEach(d => this.createDeck(d));
        return data.decks.length;
      } else if (data.title && (data.flashcards || data.quiz)) {
        // Single deck format
        this.createDeck(data);
        return 1;
      } else {
        throw new Error('Unrecognized JSON deck format');
      }
    } catch (e) {
      throw new Error('Invalid JSON: ' + e.message);
    }
  }
}

window.storageManager = new StorageManager();
