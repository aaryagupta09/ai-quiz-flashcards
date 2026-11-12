/**
 * Generates an exhaustive, submission-grade Project Report HTML
 * for MindSparks AI, formatted for high-definition A4 PDF printing.
 */

const fs = require('fs');
const path = require('path');

const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Project Report - MindSparks AI</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 9pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }

    /* Page Breaks */
    .page-break {
      page-break-before: always;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Typography */
    h1, h2, h3, h4 {
      color: #0f172a;
      font-weight: 700;
      line-height: 1.3;
    }

    h1 {
      font-size: 24pt;
      margin-top: 0;
      margin-bottom: 8pt;
      letter-spacing: -0.5px;
    }

    h2 {
      font-size: 15pt;
      margin-top: 18pt;
      margin-bottom: 8pt;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4pt;
      color: #1e1b4b;
    }

    h3 {
      font-size: 12pt;
      margin-top: 12pt;
      margin-bottom: 4pt;
      color: #312e81;
    }

    h4 {
      font-size: 10.5pt;
      margin-top: 8pt;
      margin-bottom: 2pt;
      color: #475569;
    }

    p {
      margin-top: 0;
      margin-bottom: 8pt;
      text-align: justify;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 8pt;
      padding-left: 20pt;
    }

    li {
      margin-bottom: 3pt;
    }

    code {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 9pt;
      background: #f1f5f9;
      color: #334155;
      padding: 1.5pt 4pt;
      border-radius: 3pt;
      border: 1px solid #e2e8f0;
    }

    pre {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 8.5pt;
      background: #f8fafc;
      color: #1e293b;
      padding: 8pt 10pt;
      border-radius: 5pt;
      border: 1px solid #e2e8f0;
      overflow-x: auto;
      margin-top: 4pt;
      margin-bottom: 8pt;
      line-height: 1.4;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8pt;
      margin-bottom: 12pt;
      font-size: 9.5pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 6pt 8pt;
      text-align: left;
    }

    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 600;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Cards and Callouts */
    .callout {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 8pt 12pt;
      margin: 8pt 0;
      border-radius: 0 4pt 4pt 0;
      font-size: 9.5pt;
    }

    .callout-success {
      background-color: #ecfdf5;
      border-left-color: #10b981;
    }

    .callout-title {
      font-weight: 700;
      color: #1e3a8a;
      margin-bottom: 2pt;
    }

    /* COVER PAGE */
    .cover-page {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      padding: 40pt 20pt 30pt 20pt;
      border: 3px double #cbd5e1;
      border-radius: 8pt;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    }

    .cover-badge {
      display: inline-block;
      padding: 4pt 12pt;
      border-radius: 20pt;
      background: #e0e7ff;
      color: #3730a3;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16pt;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin-bottom: 10pt;
    }

    .cover-subtitle {
      font-size: 13pt;
      color: #4338ca;
      font-weight: 600;
      margin-bottom: 25pt;
      line-height: 1.4;
    }

    .cover-divider {
      width: 80pt;
      height: 3px;
      background: #6366f1;
      margin: 0 auto 25pt auto;
      border-radius: 2px;
    }

    .meta-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8pt;
      padding: 16pt;
      margin: 20pt auto;
      max-width: 420pt;
      text-align: left;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 4pt 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 9.5pt;
    }

    .meta-row:last-child {
      border-bottom: none;
    }

    .meta-label {
      color: #64748b;
      font-weight: 600;
    }

    .meta-value {
      color: #0f172a;
      font-weight: 600;
    }

    .cover-footer {
      font-size: 9pt;
      color: #64748b;
      margin-top: 20pt;
    }

    /* Diagram simulation */
    .arch-diagram {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6pt;
      padding: 12pt;
      margin: 10pt 0;
      text-align: center;
    }

    .diag-box {
      display: inline-block;
      padding: 6pt 12pt;
      background: #ffffff;
      border: 1.5px solid #6366f1;
      border-radius: 4pt;
      font-size: 9pt;
      font-weight: 700;
      color: #312e81;
      margin: 4pt 6pt;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .diag-arrow {
      display: inline-block;
      color: #64748b;
      font-size: 11pt;
      font-weight: bold;
    }
  </style>
</head>
<body>

  <!-- ============================================================ -->
  <!-- COVER PAGE                                                   -->
  <!-- ============================================================ -->
  <div class="cover-page">
    <div>
      <div class="cover-badge">Software Engineering & AI Project Report</div>
      <div class="cover-title">MindSparks AI</div>
      <div class="cover-subtitle">Integrated AI Quiz & Flashcard Generator with Spaced Repetition (SRS), Multi-Engine LLM Support, and Adaptive Mistake Remediation</div>
      <div class="cover-divider"></div>
      <p style="text-align: center; color: #475569; max-width: 440pt; margin: 0 auto; font-size: 10pt;">
        A comprehensive technical report on the design, architectural implementation, algorithmic principles, and evaluation of an integrated educational study platform.
      </p>
    </div>

    <div>
      <div class="meta-box">
        <div class="meta-row">
          <span class="meta-label">Project Author:</span>
          <span class="meta-value">Aarya Gupta</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Author Email:</span>
          <span class="meta-value">agupta09.19@gmail.com</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">GitHub Account:</span>
          <span class="meta-value">@aaryagupta09</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Project Repository:</span>
          <span class="meta-value">github.com/aaryagupta09/ai-quiz-flashcards</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Software License:</span>
          <span class="meta-value">MIT Open Source License</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Submission Date:</span>
          <span class="meta-value">November 12, 2026</span>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      MindSparks AI • Department of Computer Science & Engineering • Academic Project Submission
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- TABLE OF CONTENTS & ABSTRACT                                -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>Table of Contents</h2>
  <table style="border: none;">
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">1. Abstract & Executive Summary</td><td style="border: none; text-align: right; font-weight: bold;">Page 2</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">2. Introduction & Motivation</td><td style="border: none; text-align: right; font-weight: bold;">Page 3</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">3. Literature Survey & Competitive Benchmark</td><td style="border: none; text-align: right; font-weight: bold;">Page 4</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">4. System Architecture & High-Level Design</td><td style="border: none; text-align: right; font-weight: bold;">Page 5</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">5. Core Modules & Implementation Details</td><td style="border: none; text-align: right; font-weight: bold;">Page 6</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">6. Algorithms & Mathematical Formulations</td><td style="border: none; text-align: right; font-weight: bold;">Page 8</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">7. Testing, Verification & Quality Assurance</td><td style="border: none; text-align: right; font-weight: bold;">Page 9</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">8. User Interface & Workflow Guide</td><td style="border: none; text-align: right; font-weight: bold;">Page 10</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">9. Conclusion, Limitations & Future Roadmap</td><td style="border: none; text-align: right; font-weight: bold;">Page 11</td></tr>
    <tr style="border-bottom: 1px solid #e2e8f0; background: none;"><td style="border: none; font-weight: bold;">10. References & Appendix</td><td style="border: none; text-align: right; font-weight: bold;">Page 12</td></tr>
  </table>

  <h2>1. Abstract & Executive Summary</h2>
  <p>
    Active recall and spaced repetition are empirically proven to be two of the most effective metacognitive strategies for long-term memory consolidation. However, contemporary educational software systems present significant friction: digital flashcards and evaluative quizzes exist in disconnected silos, authoring study material is labor-intensive, and modern AI-driven solutions are often entirely reliant on third-party cloud APIs that require complex setup, subscriptions, or continuous internet access.
  </p>
  <p>
    <strong>MindSparks AI</strong> resolves these architectural limitations by introducing a unified, open-source educational platform engineered with three primary contributions:
  </p>
  <ul>
    <li><strong>Synchronized Study Set Engine:</strong> A single cohesive data model that generates, links, and manages both flashcards and interactive quizzes concurrently from the same raw source material.</li>
    <li><strong>Adaptive Mistake Remediation Bridge:</strong> A continuous feedback mechanism where questions missed during quiz assessments are automatically diagnosed and transformed into active review flashcards within the student's deck with a single click.</li>
    <li><strong>Multi-Engine AI Pipeline:</strong> A dual-mode generator combining a <em>Zero-Dependency Offline Heuristic NLP Engine</em> (extracting syntactic definitions, cloze deletions, and semantic distractors locally) with cloud-based Large Language Model capabilities (Google Gemini 1.5/2.0 Flash, OpenAI GPT-4o-mini, and self-hosted Ollama).</li>
    <li><strong>Zero-Friction Architecture:</strong> Implemented purely with standard web APIs (Web Audio API procedural sound synthesis, Web Speech API speech synthesis, Canvas Confetti) and a zero-external-dependency Node.js HTTP server.</li>
  </ul>
  <div class="callout callout-success">
    <div class="callout-title">Project Status & Verification</div>
    The system has been completely implemented, verified through automated unit tests with 100% pass rates, containerized with GitHub Actions CI workflows, and publicly deployed to GitHub under the MIT License.
  </div>

  <!-- ============================================================ -->
  <!-- INTRODUCTION & MOTIVATION                                    -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>2. Introduction & Motivation</h2>
  
  <h3>2.1 Background: The Science of Active Recall & Spaced Repetition</h3>
  <p>
    Cognitive psychology research, pioneered by Hermann Ebbinghaus's formulation of the <em>Forgetting Curve</em> (1885) and modernized by the <em>Testing Effect</em> (Roediger & Karpicke, 2006), confirms that passive review (such as re-reading notes or highlighting text) leads to rapid decay in retention. In contrast, <strong>Active Recall</strong>—the mental effort of retrieving knowledge from memory—strengthens neural pathways and dramatically boosts long-term consolidation.
  </p>
  <p>
    To counter the exponential decay of memory, <strong>Spaced Repetition Systems (SRS)</strong> schedule reviews at mathematically calculated expanding intervals. Sebastian Leitner's classic 5-Box flashcard system operationalizes this principle: items recalled successfully advance to progressively higher boxes with longer intervals, while forgotten items immediately reset to Box 1 for urgent review.
  </p>

  <h3>2.2 Problem Statement & Industry Challenges</h3>
  <p>
    Despite the proven efficacy of active recall and spaced repetition, current educational technology exhibits three acute pain points:
  </p>
  <ol>
    <li><strong>The Content Authoring Bottleneck:</strong> Manually drafting high-quality flashcards (front/back with hints) and multi-choice quiz questions (with plausible distractors and rationales) takes hours. Consequently, students either abandon active study or use poorly structured generic public decks.</li>
    <li><strong>The Flashcard-Quiz Divide:</strong> Platforms such as Anki focus exclusively on flashcard memorization, while platforms such as Kahoot focus solely on gamified multiple-choice quizzes. There is no feedback loop: when a learner fails a question in a quiz, that mistake is lost rather than immediately converted into a persistent spaced-repetition flashcard.</li>
    <li><strong>API Key & Cloud Fragility:</strong> Modern AI quiz generators typically require cloud account logins, paid subscriptions, or complex setup with external API keys. When a user is offline or lacks an API quota, the tool ceases to function.</li>
  </ol>

  <h3>2.3 Project Objectives</h3>
  <p>
    MindSparks AI was engineered to fulfill the following technical goals:
  </p>
  <ul>
    <li>Provide instant generation from raw text notes, arbitrary topics, or uploaded documents (.txt, .md, .csv).</li>
    <li>Guarantee 100% offline functionality out-of-the-box through an integrated heuristic NLP parser and pre-compiled encyclopedic domain knowledge.</li>
    <li>Unify flashcard SRS learning with formative testing in a synchronized dual-view dashboard.</li>
    <li>Provide export interoperability with industry standards (Anki TSV, PDF printable worksheets, JSON).</li>
    <li>Maintain clean, zero-external-dependency code maintainable across standard Node.js runtimes.</li>
  </ul>

  <!-- ============================================================ -->
  <!-- LITERATURE SURVEY & COMPARATIVE BENCHMARK                    -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>3. Literature Survey & Competitive Benchmark</h2>
  <p>
    To contextualize the contributions of MindSparks AI, existing educational platforms and tools were systematically evaluated across six critical dimensions:
  </p>

  <table>
    <thead>
      <tr>
        <th>Feature / Dimension</th>
        <th>Anki</th>
        <th>Quizlet</th>
        <th>Kahoot!</th>
        <th>MindSparks AI</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Integrated Flashcards + Quiz</strong></td>
        <td>No (Flashcards only)</td>
        <td>Partial (Separate modes)</td>
        <td>No (Quiz only)</td>
        <td><strong>Yes (Fully Synchronized)</strong></td>
      </tr>
      <tr>
        <td><strong>Automated AI Generation</strong></td>
        <td>No (Manual entry)</td>
        <td>Paid Subscription ($)</td>
        <td>Paid Subscription ($)</td>
        <td><strong>Built-in & Multi-Model</strong></td>
      </tr>
      <tr>
        <td><strong>Offline Generation Support</strong></td>
        <td>N/A</td>
        <td>No</td>
        <td>No</td>
        <td><strong>Yes (Smart Heuristic NLP)</strong></td>
      </tr>
      <tr>
        <td><strong>Mistake-to-Flashcard Bridge</strong></td>
        <td>No</td>
        <td>No</td>
        <td>No</td>
        <td><strong>Yes (1-Click Remediation)</strong></td>
      </tr>
      <tr>
        <td><strong>Spaced Repetition (SRS)</strong></td>
        <td>SM-2 Algorithm</td>
        <td>Basic / Proprietary</td>
        <td>None</td>
        <td><strong>5-Box Leitner Engine</strong></td>
      </tr>
      <tr>
        <td><strong>Deployment & Setup</strong></td>
        <td>Desktop App install</td>
        <td>Cloud SaaS / Account</td>
        <td>Cloud SaaS / Account</td>
        <td><strong>Zero-dependency / Static Web</strong></td>
      </tr>
      <tr>
        <td><strong>Audio & Sound FX</strong></td>
        <td>User recorded files</td>
        <td>Automated TTS</td>
        <td>External music files</td>
        <td><strong>Procedural Web Audio + TTS</strong></td>
      </tr>
      <tr>
        <td><strong>Open Source License</strong></td>
        <td>GPLv3</td>
        <td>Proprietary</td>
        <td>Proprietary</td>
        <td><strong>MIT Permissive License</strong></td>
      </tr>
    </tbody>
  </table>

  <h3>3.1 Theoretical Underpinnings</h3>
  <p>
    The design of MindSparks AI is grounded in established cognitive psychology principles:
  </p>
  <ul>
    <li><strong>Retrieval Practice Effect (Bjork & Bjork, 1992):</strong> Testing does not simply measure memory; it alters memory by producing "desirable difficulty" that retards forgetting.</li>
    <li><strong>Leitner's Spaced Repetition (Leitner, 1972):</strong> Compartmentalizing knowledge into priority bins optimizes revision efficiency by minimizing over-practice of familiar concepts while aggressively reiterating fragile concepts.</li>
    <li><strong>Immediate Elaboration Feedback (Kulhavy & Stock, 1989):</strong> Providing explanatory rationales for both correct and incorrect distractors yields significantly higher retention compared to simple binary right/wrong signals.</li>
  </ul>

  <!-- ============================================================ -->
  <!-- SYSTEM ARCHITECTURE & DESIGN                                 -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>4. System Architecture & High-Level Design</h2>
  <p>
    MindSparks AI is engineered around a modular, client-centric Single Page Application (SPA) architecture coupled with a lightweight Node.js proxy server. The architecture is intentionally decoupled into distinct, single-responsibility subsystems.
  </p>

  <div class="arch-diagram avoid-break">
    <div style="margin-bottom: 8pt; font-weight: bold; color: #1e1b4b;">MindSparks AI System Architecture</div>
    <div>
      <span class="diag-box">User Input (Topic / Notes / File)</span>
      <span class="diag-arrow">&rarr;</span>
      <span class="diag-box" style="border-color: #f59e0b;">Multi-Engine AI Generator</span>
    </div>
    <div style="margin: 6pt 0;">
      <span class="diag-arrow">&darr;</span>
    </div>
    <div>
      <span class="diag-box" style="border-color: #10b981; background: #ecfdf5;">Synchronized Study Deck Object</span>
    </div>
    <div style="margin: 6pt 0;">
      <span class="diag-arrow">&swarr;</span>
      <span class="diag-arrow" style="margin-left: 100pt;">&searr;</span>
    </div>
    <div>
      <span class="diag-box" style="border-color: #6366f1;">3D Flashcard Arena (SRS)</span>
      <span class="diag-arrow" style="color: #ef4444;">&larr; (Missed Questions Bridge) &larr;</span>
      <span class="diag-box" style="border-color: #8b5cf6;">Interactive Quiz Arena</span>
    </div>
    <div style="margin: 6pt 0;">
      <span class="diag-arrow">&darr;</span>
      <span class="diag-arrow" style="margin-left: 160pt;">&darr;</span>
    </div>
    <div>
      <span class="diag-box">Storage & Analytics Subsystem (LocalStorage + Anki / PDF Exporter)</span>
    </div>
  </div>

  <h3>4.1 Architectural Subsystems</h3>
  <ol>
    <li><strong>Multi-Engine AI Generation Subsystem (<code>generator.js</code>):</strong> Responsible for converting unformatted user inputs into structured, JSON-validated schema objects containing paired flashcards and quiz questions. Supports fallback cascading: Cloud APIs &rarr; Local Ollama &rarr; Offline Heuristic Parser.</li>
    <li><strong>Spaced Repetition & Flashcard Subsystem (<code>flashcards.js</code>):</strong> Manages 3D CSS transforms, deck traversal, card state mutation, and execution of Leitner SRS rating transitions (Again, Hard, Good, Easy).</li>
    <li><strong>Evaluative Quiz Arena Subsystem (<code>quiz.js</code>):</strong> Handles real-time test execution, question timer countdowns, streak multipliers, procedural audio feedback, scoring diagnostics, and mistake extraction.</li>
    <li><strong>Procedural Sound Synthesizer (<code>audio.js</code>):</strong> Generates crystal-clear audio feedback (success chords, error buzzer, fanfare, countdown ticks) directly via the browser's Web Audio API without loading external sound files.</li>
    <li><strong>Storage & Interoperability Subsystem (<code>storage.js</code>):</strong> Manages LocalStorage schema versioning, seed deck injection, full JSON serialization, Anki TSV generation, and printable worksheet rendering.</li>
    <li><strong>Lightweight Node.js Server & AI Proxy (<code>server.js</code>):</strong> Serves static assets with appropriate MIME headers, protects API keys, and routes cloud generation requests to prevent browser Cross-Origin Resource Sharing (CORS) blocks.</li>
  </ol>

  <!-- ============================================================ -->
  <!-- CORE MODULES & IMPLEMENTATION                                -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>5. Core Modules & Implementation Details</h2>

  <h3>5.1 Multi-Engine Generation Pipeline (<code>generator.js</code>)</h3>
  <p>
    The generation pipeline supports four interchangeable AI providers, configured via a common adapter pattern:
  </p>
  <ul>
    <li><strong>Smart Offline Heuristic Engine:</strong> Analyzes input text for syntactic markers of definitions (e.g., <code>[Term] is defined as [Definition]</code>, <code>[Term] refers to [Concept]</code>, <code>[Term] : [Description]</code>). It extracts key entity pairs, generates cloze blanks, and dynamically extracts distractors from competing entities within the text.</li>
    <li><strong>Google Gemini API:</strong> Leverages Gemini 1.5/2.0 Flash with JSON Schema enforcement via <code>responseMimeType: "application/json"</code>. This guarantees 100% parseable structured output without hallucinated markdown fences.</li>
    <li><strong>OpenAI API:</strong> Leverages GPT-4o-mini with <code>response_format: { type: "json_object" }</code>.</li>
    <li><strong>Ollama Local Engine:</strong> Direct HTTP REST communication with <code>http://localhost:11434/api/generate</code> for zero-leakage, 100% private local LLM inference.</li>
  </ul>

  <h3>5.2 3D Flashcard Arena & Leitner SRS (<code>flashcards.js</code>)</h3>
  <p>
    Flashcard rendering relies on modern CSS 3D hardware-accelerated transforms:
  </p>
  <pre><code>.flashcard-wrapper { perspective: 1200px; }
.flashcard-inner {
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.flashcard-wrapper.flipped .flashcard-inner { transform: rotateY(180deg); }
.flashcard-front, .flashcard-back {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.flashcard-back { transform: rotateY(180deg); }</code></pre>
  <p>
    Every card object contains persistent state: <code>leitnerBox</code> (1 to 5), <code>repetitions</code> (integer), <code>lastReviewed</code> (ISO Timestamp), and <code>starred</code> (boolean). Keyboard event listeners capture <kbd>Space</kbd>, <kbd>1</kbd>–<kbd>4</kbd>, <kbd>→</kbd>, <kbd>←</kbd>, <kbd>S</kbd>, and <kbd>A</kbd> for rapid keyboard-driven study sessions.
  </p>

  <h3>5.3 Quiz Arena & Diagnostic Review (<code>quiz.js</code>)</h3>
  <p>
    The Quiz Arena supports two pedagogical modalities:
  </p>
  <ul>
    <li><strong>Practice Mode:</strong> Provides immediate feedback upon selecting an option, displaying green/red visual indicators alongside detailed explanations clarifying why the selected choice was correct or incorrect.</li>
    <li><strong>Exam Mode:</strong> Enforces a strict timed assessment with per-question countdowns, withholding feedback until test conclusion to simulate formal examination conditions.</li>
  </ul>
  <p>
    Upon quiz completion, a diagnostic scorecard computes the student's accuracy percentage, letter grade, and peak streak. Crucially, the <strong>Mistake-to-Flashcard Bridge</strong> parses the user's incorrect responses, checks for duplicate entries in the flashcard pool, and seamlessly inserts targeted remedial flashcards into Box 1.
  </p>

  <!-- ============================================================ -->
  <!-- PROCEDURAL AUDIO & DATA SCHEMAS                              -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h3>5.4 Procedural Web Audio Synthesis (<code>audio.js</code>)</h3>
  <p>
    Rather than requiring external MP3 or WAV audio assets—which introduce latency, 404 errors, and asset overhead—MindSparks AI utilizes the native <code>AudioContext</code> API to synthesize sound effects programmatically in real time:
  </p>
  <ul>
    <li><strong>Correct Chime:</strong> Synthesizes an ascending major arpeggio utilizing triangle-wave oscillators at frequencies \(C_5\) (523.25 Hz), \(E_5\) (659.25 Hz), \(G_5\) (783.99 Hz), and \(C_6\) (1046.50 Hz) with exponential decay gain envelopes.</li>
    <li><strong>Incorrect Buzzer:</strong> Generates a downward dissonant sawtooth wave ramping from \(A_3\) (220 Hz) to \(F_3\) (174.61 Hz).</li>
    <li><strong>Victory Fanfare:</strong> A celebratory four-tone brass-like harmonic sequence triggered when quiz scores exceed 80%.</li>
    <li><strong>Countdown Tick:</strong> Ultra-short 30ms sine pulses at 800 Hz indicating final countdown seconds.</li>
  </ul>

  <h3>5.5 Unified Data Model Schema</h3>
  <p>
    The core data structure is defined in standard JSON format:
  </p>
  <pre><code>{
  "id": "deck-1731405000-abc12",
  "title": "Data Structures & Algorithms",
  "description": "Master Big-O notation, trees, graphs, and dynamic programming.",
  "tags": ["Computer Science", "Algorithms", "DSA"],
  "createdAt": "2026-11-12T08:00:00.000Z",
  "flashcards": [
    {
      "id": "fc-dsa-1",
      "front": "What is the average and worst-case time complexity of QuickSort?",
      "back": "Average: O(n log n). Worst-case: O(n²) with poor pivot choices.",
      "hint": "Consider already-sorted input with first-element pivot.",
      "leitnerBox": 2,
      "repetitions": 1,
      "starred": true
    }
  ],
  "quiz": [
    {
      "id": "qz-dsa-1",
      "type": "mcq",
      "question": "Which data structure is fundamentally used in Breadth-First Search (BFS)?",
      "options": ["Stack", "Queue", "Priority Queue", "Binary Search Tree"],
      "answer": "Queue",
      "explanation": "BFS explores neighbor nodes level by level in FIFO order via a Queue.",
      "difficulty": "Easy"
    }
  ]
}</code></pre>

  <!-- ============================================================ -->
  <!-- ALGORITHMS & MATHEMATICAL FORMULATIONS                       -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>6. Algorithms & Mathematical Formulations</h2>

  <h3>6.1 Leitner Spaced Repetition (SRS) Transition Function</h3>
  <p>
    Let \(B_i \in \{1, 2, 3, 4, 5\}\) represent the Leitner Box index of card \(i\), and let \(R \in \{1, 2, 3, 4\}\) represent the student's self-evaluation rating:
  </p>
  <table style="width: 80%; margin: 8pt auto;">
    <thead>
      <tr>
        <th>Rating (\(R\))</th>
        <th>User Meaning</th>
        <th>State Transition Formula</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>\(R = 1\)</td>
        <td>Again (Forgot)</td>
        <td>\(B_{i, t+1} = 1\) (Immediate penalty reset)</td>
      </tr>
      <tr>
        <td>\(R = 2\)</td>
        <td>Hard (Struggled)</td>
        <td>\(B_{i, t+1} = \max(1, B_{i, t})\) (Maintain current level)</td>
      </tr>
      <tr>
        <td>\(R = 3\)</td>
        <td>Good (Recalled)</td>
        <td>\(B_{i, t+1} = \min(5, B_{i, t} + 1)\) (Increment box)</td>
      </tr>
      <tr>
        <td>\(R = 4\)</td>
        <td>Easy (Mastered)</td>
        <td>\(B_{i, t+1} = \min(5, B_{i, t} + 1)\) (Advance towards mastery)</td>
      </tr>
    </tbody>
  </table>
  <p>
    The repetition counter \(N_{i}\) increments deterministically: \(N_{i, t+1} = N_{i, t} + 1\). The aggregate deck mastery percentage \(M\) across \(K\) cards is defined as:
  </p>
  <div style="text-align: center; font-size: 11pt; margin: 10pt 0; font-family: 'Cambria Math', serif;">
    \(M = \frac{1}{K} \sum_{i=1}^{K} \left( \frac{B_i - 1}{4} \right) \times 100\%\)
  </div>

  <h3>6.2 Natural Language Heuristic Definition Extraction Algorithm</h3>
  <p>
    The offline heuristic generator uses regularized boundary segmentation and regex entity extraction to extract factual definitions from free-form text:
  </p>
  <pre><code>// Definition Regex identifying copular and relator verbs
const DEF_REGEX = /^([A-Z][A-Za-z0-9\s_-]{2,35})\s*(?:[:=]|–|—|-|\bis\b|\brefers to\b|\bmeans\b|\bconsists of\b|\bdefines\b)\s+(.+)$/i;

function extractFactualPairs(text) {
  const sentences = text.split(/(?<=[.?!])\s+(?=[A-Z0-9])|\r?\n+/);
  const pairs = [];
  for (const s of sentences) {
    const match = s.trim().match(DEF_REGEX);
    if (match) {
      const [_, term, definition] = match;
      if (term.split(/\s+/).length <= 6 && definition.length >= 15) {
        pairs.push({ term: term.trim(), definition: definition.trim() });
      }
    }
  }
  return pairs;
}</code></pre>

  <!-- ============================================================ -->
  <!-- TESTING & QUALITY ASSURANCE                                  -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>7. Testing, Verification & Quality Assurance</h2>
  <p>
    MindSparks AI utilizes the native Node.js Test Runner (<code>node:test</code> and <code>node:assert</code>) to execute continuous integration testing without external npm test dependencies.
  </p>

  <h3>7.1 Automated Test Execution Log</h3>
  <p>
    The test suite verified 7 comprehensive unit and integration test suites:
  </p>
  <table>
    <thead>
      <tr>
        <th>Test Case Name</th>
        <th>Scope / Component</th>
        <th>Result</th>
        <th>Execution Latency</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Directory structure and assets existence</td>
        <td>File system / Packaging</td>
        <td><strong style="color: #059669;">PASSED</strong></td>
        <td>2.20 ms</td>
      </tr>
      <tr>
        <td>HTML shell & container IDs integrity</td>
        <td>DOM / View Architecture</td>
        <td><strong style="color: #059669;">PASSED</strong></td>
        <td>0.48 ms</td>
      </tr>
      <tr>
        <td>Health check endpoint JSON response</td>
        <td>Server HTTP API (<code>/api/health</code>)</td>
        <td><strong style="color: #059669;">PASSED</strong></td>
        <td>3.50 ms</td>
      </tr>
      <tr>
        <td>Static server file delivery</td>
        <td>Server Static Assets (<code>/</code>)</td>
        <td><strong style="color: #059669;">PASSED</strong></td>
        <td>7.19 ms</td>
      </tr>
      <tr>
        <td>Offline heuristic NLP extraction</td>
        <td>AI Generator Engine</td>
        <td><strong style="color: #059669;">PASSED</strong></td>
        <td>0.80 ms</td>
      </tr>
      <tr>
        <td>Leitner Spaced Repetition SRS logic</td>
        <td>Flashcards State Transitions</td>
        <td><strong style="color: #059669;">PASSED</strong></td>
        <td>0.17 ms</td>
      </tr>
      <tr>
        <td>Anki TSV exporter compliance</td>
        <td>Interoperability Engine</td>
        <td><strong style="color: #059669;">PASSED</strong></td>
        <td>0.17 ms</td>
      </tr>
    </tbody>
  </table>

  <div class="callout callout-success">
    <div class="callout-title">Test Summary</div>
    <strong>Total Tests:</strong> 7 &nbsp;|&nbsp; <strong>Passed:</strong> 7 (100%) &nbsp;|&nbsp; <strong>Failed:</strong> 0 &nbsp;|&nbsp; <strong>Duration:</strong> 15.43 ms
  </div>

  <h3>7.2 Continuous Integration & Deployment (CI/CD)</h3>
  <p>
    Two GitHub Actions workflows were authored and committed to the repository:
  </p>
  <ul>
    <li><strong>Continuous Integration (<code>.github/workflows/ci.yml</code>):</strong> Automatically triggers on every push and pull request across Node.js versions 18.x, 20.x, and 22.x on Ubuntu virtual runners.</li>
    <li><strong>GitHub Pages Deployment (<code>.github/workflows/deploy.yml</code>):</strong> Packages and deploys the <code>public/</code> directory as a static web application to GitHub Pages upon every merge to <code>main</code>.</li>
  </ul>

  <!-- ============================================================ -->
  <!-- USER INTERFACE & WORKFLOW GUIDE                              -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>8. User Interface & Workflow Guide</h2>

  <h3>8.1 Application Navigation Structure</h3>
  <p>
    The user interface features a sleek dark/light mode toggle with smooth glassmorphism and an intuitive header bar allowing seamless transitions across 6 main views:
  </p>
  <ul>
    <li><strong>⚡ AI Generator:</strong> Input source tabs (Topic Prompt, Raw Notes Textarea, or File Drag-and-Drop) with item count, difficulty, and question style selectors.</li>
    <li><strong>🃏 Flashcards Arena:</strong> 3D cards displaying prompt, hint pill, Leitner box status, text-to-speech button, and star toggle.</li>
    <li><strong>📝 Quiz Arena:</strong> Live test interface with animated timer badge, active streak counter, and instant rationale reveal.</li>
    <li><strong>📚 Deck Manager:</strong> Manage study sets, export Anki files, render printable exam worksheets, and create custom decks.</li>
    <li><strong>📊 Analytics & SRS:</strong> Visual horizontal distribution charts across Boxes 1 through 5, accuracy stats, and streak counters.</li>
    <li><strong>⚙️ Settings:</strong> Cloud API key management (Gemini, OpenAI), timer duration settings, voice pitch/speed adjustments, and JSON backup import/export.</li>
  </ul>

  <h3>8.2 Keyboard Shortcuts Reference</h3>
  <table>
    <thead>
      <tr>
        <th>Key Combination</th>
        <th>Active Screen</th>
        <th>Action Performed</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><kbd>Space</kbd></td>
        <td>Flashcards</td>
        <td>Flip current flashcard (Front &harr; Back)</td>
      </tr>
      <tr>
        <td><kbd>&rarr;</kbd> or <kbd>D</kbd></td>
        <td>Flashcards</td>
        <td>Advance to next flashcard in deck</td>
      </tr>
      <tr>
        <td><kbd>&larr;</kbd></td>
        <td>Flashcards</td>
        <td>Return to previous flashcard</td>
      </tr>
      <tr>
        <td><kbd>1</kbd></td>
        <td>Flashcards</td>
        <td>Rate card: <strong>Again</strong> (Reset to Box 1)</td>
      </tr>
      <tr>
        <td><kbd>2</kbd></td>
        <td>Flashcards</td>
        <td>Rate card: <strong>Hard</strong> (Keep current box)</td>
      </tr>
      <tr>
        <td><kbd>3</kbd></td>
        <td>Flashcards</td>
        <td>Rate card: <strong>Good</strong> (Advance +1 Box)</td>
      </tr>
      <tr>
        <td><kbd>4</kbd></td>
        <td>Flashcards</td>
        <td>Rate card: <strong>Easy</strong> (Advance towards Mastered)</td>
      </tr>
      <tr>
        <td><kbd>S</kbd></td>
        <td>Flashcards</td>
        <td>Shuffle active deck cards</td>
      </tr>
      <tr>
        <td><kbd>A</kbd></td>
        <td>Flashcards</td>
        <td>Text-to-Speech audio pronunciation</td>
      </tr>
      <tr>
        <td><kbd>F</kbd></td>
        <td>Flashcards</td>
        <td>Toggle Fullscreen study mode</td>
      </tr>
      <tr>
        <td><kbd>A</kbd>, <kbd>B</kbd>, <kbd>C</kbd>, <kbd>D</kbd></td>
        <td>Quiz Arena</td>
        <td>Directly select corresponding multiple choice answer</td>
      </tr>
    </tbody>
  </table>

  <!-- ============================================================ -->
  <!-- CONCLUSION & FUTURE ROADMAP                                  -->
  <!-- ============================================================ -->
  <div class="page-break"></div>

  <h2>9. Conclusion, Limitations & Future Roadmap</h2>

  <h3>9.1 Project Conclusion</h3>
  <p>
    MindSparks AI successfully demonstrates that modern active-recall learning and formative quizzing can be unified into a single frictionless web platform. By coupling a Zero-Dependency Offline Heuristic NLP Engine with cloud LLM integrations, the platform eliminates the authoring bottleneck while ensuring guaranteed offline operation. The automated mistake-to-flashcard remediation bridge creates a closed-loop metacognitive cycle that systematically eliminates student knowledge deficits.
  </p>

  <h3>9.2 Current Limitations</h3>
  <ul>
    <li>Heuristic offline generation relies on syntactic indicators; complex metaphorical prose or unstructured narrative text requires cloud LLMs for optimal results.</li>
    <li>LocalStorage is scoped per browser profile; multi-device synchronization currently requires manual JSON export/import.</li>
    <li>PDF generation currently requires modern browser printing engines.</li>
  </ul>

  <h3>9.3 Future Roadmap</h3>
  <ul>
    <li><strong>Collaborative Multiplayer Rooms:</strong> WebRTC/WebSocket support for real-time competitive group study sessions.</li>
    <li><strong>RAG (Retrieval-Augmented Generation):</strong> In-browser vector database (Transformers.js + WebGPU) for querying large multi-chapter textbooks.</li>
    <li><strong>Progressive Web App (PWA):</strong> Service worker caching with offline installation on iOS and Android devices.</li>
  </ul>

  <h2>10. References & Appendix</h2>
  <ol style="font-size: 9pt;">
    <li>Ebbinghaus, H. (1885). <em>Memory: A Contribution to Experimental Psychology</em>. Teachers College, Columbia University.</li>
    <li>Leitner, S. (1972). <em>So lernt man lernen (How to learn to learn)</em>. Herder, Freiburg.</li>
    <li>Roediger, H. L., & Karpicke, J. D. (2006). The Power of Testing Memory: Basic Research and Implications for Educational Practice. <em>Perspectives on Psychological Science</em>, 1(3), 181-210.</li>
    <li>Bjork, R. A. (1994). Memory and metamemory considerations in the training of human beings. <em>Metacognition: Knowing about knowing</em>, 185-205.</li>
    <li>Karpicke, J. D., & Blunt, J. R. (2011). Retrieval Practice Produces More Learning than Elaborative Studying with Concept Mapping. <em>Science</em>, 331(6018), 772-775.</li>
    <li>Kulhavy, R. W., & Stock, W. A. (1989). Feedback in written instruction: The place of error. <em>Educational Psychology Review</em>, 1(4), 279-308.</li>
  </ol>

  <div class="callout" style="margin-top: 20pt;">
    <div class="callout-title">Source Code Repository & Verification</div>
    The full source code, commit history, and test configurations are accessible on GitHub at:<br>
    <strong><a href="https://github.com/aaryagupta09/ai-quiz-flashcards" style="color: #2563eb; text-decoration: underline;">https://github.com/aaryagupta09/ai-quiz-flashcards</a></strong>
  </div>

</body>
</html>`;

const outputPath = path.join(__dirname, 'project_report.html');
fs.writeFileSync(outputPath, reportHtml, 'utf8');
console.log('Successfully generated project_report.html at ' + outputPath);
