/**
 * MindSparks AI Generator Engine
 * Multi-Engine Architecture: Smart Offline Heuristic AI + Gemini API + OpenAI API + Ollama
 */

class AIGenerator {
  constructor() {
    this.knowledgeBase = this.initKnowledgeBase();
  }

  // Generate both Flashcards and Quiz questions in a unified study deck
  async generateDeck(options) {
    const {
      sourceType = 'topic', // 'topic' | 'text' | 'file'
      topic = '',
      content = '',
      itemCount = 5,
      difficulty = 'Medium', // 'Easy' | 'Medium' | 'Hard'
      questionType = 'mix',  // 'mcq' | 'boolean' | 'blank' | 'mix'
      provider = 'offline',  // 'offline' | 'gemini' | 'openai' | 'ollama'
      apiKey = ''
    } = options;

    const effectiveText = sourceType === 'topic' ? topic : content;
    if (!effectiveText.trim()) {
      throw new Error('Please provide a topic or source text to generate from.');
    }

    if (provider === 'gemini') {
      return await this.generateWithGemini(effectiveText, itemCount, difficulty, questionType, apiKey);
    } else if (provider === 'openai') {
      return await this.generateWithOpenAI(effectiveText, itemCount, difficulty, questionType, apiKey);
    } else if (provider === 'ollama') {
      return await this.generateWithOllama(effectiveText, itemCount, difficulty, questionType);
    } else {
      // Default: High-intelligence Offline Heuristic Generator
      return this.generateOffline(effectiveText, itemCount, difficulty, questionType);
    }
  }

  // Construct standard JSON system prompt for LLMs
  getLLMPrompt(text, count, difficulty, type) {
    return `You are an elite educational AI and curriculum designer.
Analyze the following source material and generate an integrated study deck containing BOTH Flashcards and Quiz questions.

SOURCE MATERIAL:
"""${text.slice(0, 8000)}"""

REQUIREMENTS:
1. Generate ${count} Flashcards.
   - Each flashcard must have: "front" (concise, clear prompt or question), "back" (authoritative, informative answer/explanation), and "hint" (subtle recall clue).
2. Generate ${count} Quiz questions with difficulty "${difficulty}".
   - Allowed question types: ${type === 'mix' ? 'mix of "mcq", "boolean", and "blank"' : `"${type}"`}.
   - For "mcq": 4 distinct options, exactly one correct "answer", and detailed "explanation".
   - For "boolean": options ["True", "False"], correct "answer", and "explanation".
   - For "blank": 4 short candidate options to fill the blank, correct "answer", and "explanation".
3. Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Concise Deck Title",
  "description": "1-2 sentence description of what this study set covers.",
  "tags": ["Tag1", "Tag2"],
  "flashcards": [
    { "front": "...", "back": "...", "hint": "..." }
  ],
  "quiz": [
    {
      "type": "mcq",
      "question": "...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "...",
      "difficulty": "${difficulty}"
    }
  ]
}`;
  }

  // Google Gemini API generator
  async generateWithGemini(text, count, difficulty, type, userApiKey) {
    const prompt = this.getLLMPrompt(text, count, difficulty, type);
    const key = userApiKey || window.storageManager.settings.geminiApiKey;

    // Try server proxy first, fallback to direct fetch if standalone
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'gemini',
          prompt: prompt,
          apiKey: key,
          model: 'gemini-1.5-flash'
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Server proxy unavailable, falling back to direct API client...');
    }

    if (!key) {
      throw new Error('Gemini API key is required. Please enter it in the Generator settings or choose Offline AI.');
    }

    // Direct Gemini client call
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Gemini API request failed (${res.status})`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText);
  }

  // OpenAI API generator
  async generateWithOpenAI(text, count, difficulty, type, userApiKey) {
    const prompt = this.getLLMPrompt(text, count, difficulty, type);
    const key = userApiKey || window.storageManager.settings.openaiApiKey;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'openai',
          prompt: prompt,
          apiKey: key,
          model: 'gpt-4o-mini'
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) return json.data;
      }
    } catch (e) {}

    if (!key) {
      throw new Error('OpenAI API key is required. Please enter it in the Generator settings or choose Offline AI.');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI API failed (${res.status})`);
    }

    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  }

  // Ollama local AI generator
  async generateWithOllama(text, count, difficulty, type) {
    const url = window.storageManager.settings.ollamaUrl || 'http://localhost:11434';
    const prompt = this.getLLMPrompt(text, count, difficulty, type);

    const res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3:latest',
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama connection failed at ${url}. Ensure Ollama is running.`);
    }

    const data = await res.json();
    return JSON.parse(data.response);
  }

  // ==========================================
  // SMART OFFLINE HEURISTIC AI ENGINE
  // ==========================================
  generateOffline(text, count, difficulty, type) {
    const cleanedText = text.trim();
    const lower = cleanedText.toLowerCase();

    // 1. Check if the input matches any curated encyclopedic domain
    for (const [key, domain] of Object.entries(this.knowledgeBase)) {
      if (lower.includes(key) || key.includes(lower)) {
        return this.sliceCuratedDeck(domain, count, difficulty, type);
      }
    }

    // 2. Otherwise perform natural language extraction from the supplied text
    return this.extractFromFreeformText(cleanedText, count, difficulty, type);
  }

  // Extract structured cards & quiz from arbitrary notes/text
  extractFromFreeformText(text, targetCount, difficulty, questionType) {
    const title = this.inferTitle(text);
    const sentences = text
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])|\r?\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 25 && s.length < 300);

    const flashcards = [];
    const quiz = [];
    const keyTerms = [];

    // Heuristics for definition extraction: "X is a Y", "X refers to Y", "X: Y", "X = Y"
    const definitionRegex = /^([A-Z][A-Za-z0-9\s_-]{2,35})\s*(?:[:=]|–|—|-(?!\w)|\bis\b|\brefers to\b|\bmeans\b|\bconsists of\b|\bdefines\b)\s+(.+)$/i;

    sentences.forEach((s, idx) => {
      const match = s.match(definitionRegex);
      if (match) {
        const term = match[1].trim();
        const definition = match[2].trim();
        if (term.split(/\s+/).length <= 6 && definition.length > 15) {
          keyTerms.push({ term, definition, originalSentence: s });
        }
      }
    });

    // If few strict definitions found, extract important clauses
    if (keyTerms.length < targetCount) {
      sentences.forEach(s => {
        if (!keyTerms.some(k => k.originalSentence === s)) {
          const words = s.split(/\s+/);
          if (words.length >= 8) {
            // Pick subject or key phrase
            const subject = words.slice(0, 3).join(' ');
            keyTerms.push({
              term: subject,
              definition: s,
              originalSentence: s
            });
          }
        }
      });
    }

    // Shuffle and pick
    const selected = keyTerms.slice(0, Math.max(targetCount, 4));

    // Generate Flashcards
    selected.forEach((item, i) => {
      flashcards.push({
        id: `fc-gen-${Date.now()}-${i}`,
        front: `What is the significance or definition of: ${item.term}?`,
        back: item.definition.charAt(0).toUpperCase() + item.definition.slice(1),
        hint: `Related to ${title}`,
        leitnerBox: 1,
        repetitions: 0,
        starred: false
      });
    });

    // Generate Quiz Questions
    selected.forEach((item, i) => {
      // Determine question style
      let chosenType = questionType;
      if (questionType === 'mix') {
        const types = ['mcq', 'boolean', 'blank'];
        chosenType = types[i % types.length];
      }

      if (chosenType === 'mcq') {
        // Collect distractors from other terms or generate realistic ones
        const distractors = selected
          .filter(other => other.term !== item.term)
          .map(other => other.term)
          .slice(0, 3);

        while (distractors.length < 3) {
          distractors.push(`Alternative concept ${distractors.length + 1}`);
        }

        const options = this.shuffleArray([item.term, ...distractors]);
        quiz.push({
          id: `qz-gen-${Date.now()}-${i}`,
          type: 'mcq',
          question: `Which concept corresponds to: "${item.definition.slice(0, 140)}${item.definition.length > 140 ? '...' : ''}"?`,
          options: options,
          answer: item.term,
          explanation: `"${item.term}" is defined as: ${item.definition}`,
          difficulty: difficulty
        });
      } else if (chosenType === 'boolean') {
        const isTrue = i % 2 === 0;
        let statement = '';
        let answer = '';
        let expl = '';

        if (isTrue) {
          statement = `True or False: ${item.term} is accurately described by: "${item.definition.slice(0, 140)}"`;
          answer = 'True';
          expl = `Correct! ${item.term} correctly corresponds to this description.`;
        } else {
          // Invert statement with another term
          const other = selected.find(o => o.term !== item.term) || { term: 'An unrelated mechanism' };
          statement = `True or False: ${other.term} is defined as: "${item.definition.slice(0, 140)}"`;
          answer = 'False';
          expl = `False. That description actually defines "${item.term}", not "${other.term}".`;
        }

        quiz.push({
          id: `qz-gen-${Date.now()}-${i}`,
          type: 'boolean',
          question: statement,
          options: ['True', 'False'],
          answer: answer,
          explanation: expl,
          difficulty: difficulty
        });
      } else {
        // Fill in the blank
        const options = this.shuffleArray([
          item.term,
          ...selected.filter(o => o.term !== item.term).map(o => o.term).slice(0, 3)
        ]);

        quiz.push({
          id: `qz-gen-${Date.now()}-${i}`,
          type: 'blank',
          question: `Fill in the blank: "______ ${item.definition.slice(0, 120)}..."`,
          options: options.length >= 2 ? options : [item.term, 'None of the above'],
          answer: item.term,
          explanation: `The missing term is "${item.term}".`,
          difficulty: difficulty
        });
      }
    });

    return {
      title: title,
      description: `AI-extracted study deck covering key concepts from your provided notes.`,
      tags: ['Study Notes', 'AI-Generated'],
      flashcards: flashcards.slice(0, targetCount),
      quiz: quiz.slice(0, targetCount)
    };
  }

  inferTitle(text) {
    const firstLine = text.trim().split(/\r?\n/)[0].replace(/[#*`_]/g, '').trim();
    if (firstLine.length > 3 && firstLine.length < 50) {
      return firstLine;
    }
    const words = text.trim().split(/\s+/).slice(0, 4).join(' ');
    return `${words} Study Set`;
  }

  sliceCuratedDeck(domain, count, difficulty, type) {
    const flashcards = this.shuffleArray([...domain.flashcards]).slice(0, count);
    let quizItems = [...domain.quiz];

    if (type !== 'mix') {
      const filtered = quizItems.filter(q => q.type === type);
      if (filtered.length >= 2) {
        quizItems = filtered;
      }
    }

    return {
      title: domain.title,
      description: domain.description,
      tags: domain.tags,
      flashcards: flashcards,
      quiz: this.shuffleArray(quizItems).slice(0, count)
    };
  }

  shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Pre-loaded encyclopedic knowledge domains for high-demand topics
  initKnowledgeBase() {
    return {
      'photosynthesis': {
        title: 'Biology: Photosynthesis & Cellular Respiration',
        description: 'Comprehensive study of light-dependent reactions, the Calvin cycle, chloroplasts, and ATP synthesis.',
        tags: ['Biology', 'Science', 'Plant Physiology'],
        flashcards: [
          { front: 'What is the primary photosynthetic pigment in plants and what light wavelengths does it absorb?', back: 'Chlorophyll a is the primary pigment; it absorbs blue-violet (430 nm) and red (660 nm) light while reflecting green light.', hint: 'Absorbs ends of visible spectrum, reflects green' },
          { front: 'Where do the light-dependent reactions take place inside a plant cell?', back: 'Across the thylakoid membranes within chloroplasts.', hint: 'Membrane disc structures' },
          { front: 'What is the role of RuBisCO in the Calvin Cycle (light-independent reactions)?', back: 'RuBisCO (Ribulose-1,5-bisphosphate carboxylase-oxygenase) catalyzes the fixation of atmospheric CO2 onto ribulose-1,5-bisphosphate (RuBP).', hint: 'Carbon fixation enzyme' },
          { front: 'What molecule serves as the direct electron donor that replenishes Photosystem II?', back: 'Water (H2O), through photolysis, releasing O2 and protons into the thylakoid lumen.', hint: 'Water splitting' },
          { front: 'What is the net chemical equation for oxygenic photosynthesis?', back: '6CO2 + 6H2O + Light Energy -> C6H12O6 (Glucose) + 6O2.', hint: 'Carbon dioxide + Water -> Glucose + Oxygen' }
        ],
        quiz: [
          { type: 'mcq', question: 'Which enzyme is responsible for catalyzing the first major step of carbon fixation in the Calvin cycle?', options: ['RuBisCO', 'ATP Synthase', 'DNA Polymerase', 'Hexokinase'], answer: 'RuBisCO', explanation: 'RuBisCO fixes carbon dioxide onto RuBP to create 3-PGA.', difficulty: 'Medium' },
          { type: 'boolean', question: 'True or False: Oxygen released during photosynthesis originates from carbon dioxide (CO2).', options: ['True', 'False'], answer: 'False', explanation: 'Oxygen originates from the photolysis (splitting) of water (H2O) at Photosystem II.', difficulty: 'Easy' },
          { type: 'mcq', question: 'Where does the Calvin cycle take place within the chloroplast?', options: ['Stroma', 'Thylakoid lumen', 'Outer membrane', 'Cristae'], answer: 'Stroma', explanation: 'The stroma is the fluid-filled interior space surrounding thylakoids where Calvin cycle enzymes operate.', difficulty: 'Easy' }
        ]
      },
      'kubernetes': {
        title: 'Cloud DevOps: Kubernetes Architecture',
        description: 'Pods, control plane, kubelet, etcd, services, ingress, and container orchestration.',
        tags: ['DevOps', 'Cloud', 'Kubernetes', 'Containers'],
        flashcards: [
          { front: 'What is a Pod in Kubernetes?', back: 'The smallest deployable computing unit in Kubernetes, representing a single instance of a running process consisting of one or more co-located containers sharing storage and network namespace.', hint: 'Smallest deployable unit' },
          { front: 'What is the role of etcd in the Kubernetes control plane?', back: 'A consistent, highly-available key-value store used as Kubernetes\' backing store for all cluster state, configurations, and metadata.', hint: 'Distributed key-value store' },
          { front: 'What is the function of the Kubelet on worker nodes?', back: 'An agent that runs on each node in the cluster, ensuring that containers described in PodSpecs are running and healthy.', hint: 'Node daemon/agent' },
          { front: 'What distinguishes a Kubernetes ClusterIP Service from a NodePort Service?', back: 'ClusterIP exposes the Service on a cluster-internal IP (only reachable within the cluster).\nNodePort exposes the Service on each Node\'s IP at a static port, reachable from outside the cluster.', hint: 'Internal IP vs Port on every node' }
        ],
        quiz: [
          { type: 'mcq', question: 'Which component in the Kubernetes control plane is responsible for assigning pods to specific worker nodes?', options: ['kube-scheduler', 'kube-apiserver', 'kube-controller-manager', 'etcd'], answer: 'kube-scheduler', explanation: 'kube-scheduler watches for newly created Pods with no assigned node, and selects an optimal node for them based on resource constraints.', difficulty: 'Medium' },
          { type: 'boolean', question: 'True or False: A Kubernetes DaemonSet ensures that all (or some) nodes run a copy of a specific Pod.', options: ['True', 'False'], answer: 'True', explanation: 'DaemonSets are commonly used for cluster storage daemons, log collection daemons, and node monitoring agents on every node.', difficulty: 'Easy' }
        ]
      },
      'python': {
        title: 'Python Core & Advanced Concepts',
        description: 'Generators, decorators, GIL, memory management, list comprehensions, and OOP in Python.',
        tags: ['Python', 'Programming', 'Backend'],
        flashcards: [
          { front: 'What is a Python Generator and what keyword creates it?', back: 'A generator is a function that returns an iterator which produces a sequence of values on the fly using the `yield` keyword instead of `return`, minimizing memory consumption.', hint: 'Lazy evaluation with yield' },
          { front: 'What is the Global Interpreter Lock (GIL) in CPython?', back: 'A mutex that prevents multiple native threads from executing Python bytecodes at once, ensuring CPython\'s memory management is thread-safe at the cost of restricting CPU-bound multithreading to a single core.', hint: 'CPython thread mutex' },
          { front: 'Explain the difference between `deepcopy` and `copy` (shallow copy) in Python.', back: 'A shallow copy constructs a new compound object and inserts references into it to the objects found in the original.\nA deep copy recursively copies all objects found in the original, creating fully independent replicas.', hint: 'Reference copying vs recursive object cloning' }
        ],
        quiz: [
          { type: 'mcq', question: 'What does the `*args` syntax in a Python function definition accomplish?', options: ['Allows passing a variable number of non-keyword positional arguments as a tuple', 'Passes keyword arguments as a dictionary', 'Multiplies all arguments by 2', 'Unpacks a pointer'], answer: 'Allows passing a variable number of non-keyword positional arguments as a tuple', explanation: '*args captures extra positional arguments as a tuple, while **kwargs captures keyword arguments as a dictionary.', difficulty: 'Easy' },
          { type: 'boolean', question: 'True or False: In Python, strings and tuples are immutable data types.', options: ['True', 'False'], answer: 'True', explanation: 'Once created, elements of strings and tuples cannot be modified in place.', difficulty: 'Easy' }
        ]
      }
    };
  }
}

window.aiGenerator = new AIGenerator();
