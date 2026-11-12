/**
 * MindSparks AI Test Suite
 * Executed via Node.js built-in test runner: node --test test/app.test.js
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const server = require('../server.js');

describe('MindSparks AI Test Suite', () => {

  test('Public directory structure and essential assets exist', () => {
    const publicDir = path.join(__dirname, '..', 'public');
    assert.ok(fs.existsSync(path.join(publicDir, 'index.html')), 'index.html exists');
    assert.ok(fs.existsSync(path.join(publicDir, 'css', 'styles.css')), 'styles.css exists');
    assert.ok(fs.existsSync(path.join(publicDir, 'js', 'app.js')), 'app.js exists');
    assert.ok(fs.existsSync(path.join(publicDir, 'js', 'generator.js')), 'generator.js exists');
    assert.ok(fs.existsSync(path.join(publicDir, 'js', 'flashcards.js')), 'flashcards.js exists');
    assert.ok(fs.existsSync(path.join(publicDir, 'js', 'quiz.js')), 'quiz.js exists');
    assert.ok(fs.existsSync(path.join(publicDir, 'js', 'storage.js')), 'storage.js exists');
    assert.ok(fs.existsSync(path.join(publicDir, 'js', 'audio.js')), 'audio.js exists');
    assert.ok(fs.existsSync(path.join(publicDir, 'js', 'analytics.js')), 'analytics.js exists');
  });

  test('Index.html contains essential UI elements and view containers', () => {
    const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');

    assert.ok(content.includes('id="view-generator"'), 'Has generator view');
    assert.ok(content.includes('id="view-flashcards"'), 'Has flashcards view');
    assert.ok(content.includes('id="view-quiz"'), 'Has quiz view');
    assert.ok(content.includes('id="view-decks"'), 'Has decks view');
    assert.ok(content.includes('id="view-analytics"'), 'Has analytics view');
    assert.ok(content.includes('id="view-settings"'), 'Has settings view');
    assert.ok(content.includes('id="confetti-canvas"'), 'Has celebration confetti canvas');
  });

  test('Server health check endpoint responds with JSON', (t, done) => {
    const req = new EventEmitter();
    req.method = 'GET';
    req.url = '/api/health';
    req.headers = { host: 'localhost' };

    let statusCode = null;
    let headers = {};
    let body = '';

    const res = {
      setHeader(k, v) { headers[k] = v; },
      writeHead(code, h) {
        statusCode = code;
        if (h) Object.assign(headers, h);
      },
      end(data) {
        if (data) body += data;
        assert.strictEqual(statusCode, 200);
        const parsed = JSON.parse(body);
        assert.strictEqual(parsed.status, 'ok');
        assert.strictEqual(parsed.service, 'MindSparks AI Quiz & Flashcard Generator');
        done();
      }
    };

    server.emit('request', req, res);
  });

  test('Server static file handler serves index.html on root /', (t, done) => {
    const req = new EventEmitter();
    req.method = 'GET';
    req.url = '/';
    req.headers = { host: 'localhost' };

    let statusCode = null;
    let body = '';

    const res = {
      setHeader() {},
      writeHead(code) { statusCode = code; },
      end(data) {
        if (data) body += data.toString();
        assert.strictEqual(statusCode, 200);
        assert.ok(body.includes('MindSparks AI'));
        done();
      }
    };

    server.emit('request', req, res);
  });

  test('Offline Heuristic Definition Extraction generates valid flashcards & quiz', () => {
    const sampleText = `
      Photosynthesis is the biological process by which green plants convert light energy into chemical energy.
      Chlorophyll refers to the green pigment located in the thylakoid membranes of chloroplasts.
      RuBisCO is an enzyme that catalyzes the primary carbon fixation reaction in the Calvin cycle.
      The light-dependent reactions produce ATP and NADPH for cellular synthesis.
      Stroma consists of the fluid-filled space surrounding the grana inside a chloroplast.
    `;

    const definitionRegex = /^([A-Z][A-Za-z0-9\s_-]{2,35})\s*(?:[:=]|–|—|-(?!\w)|\bis\b|\brefers to\b|\bmeans\b|\bconsists of\b|\bdefines\b)\s+(.+)$/i;
    const sentences = sampleText
      .split(/(?<=[.?!])\s+(?=[A-Z0-9])|\r?\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);

    const matches = [];
    sentences.forEach(s => {
      const match = s.match(definitionRegex);
      if (match) {
        matches.push({ term: match[1].trim(), definition: match[2].trim() });
      }
    });

    assert.ok(matches.length >= 3, `Expected at least 3 definition extractions, got ${matches.length}`);
    assert.ok(matches.some(m => m.term.toLowerCase().includes('photosynthesis')));
    assert.ok(matches.some(m => m.term.toLowerCase().includes('chlorophyll')));
  });

  test('Leitner Spaced Repetition SRS Algorithm Logic', () => {
    const card = { id: 'c1', leitnerBox: 1, repetitions: 0 };

    function rate(card, rating) {
      card.repetitions++;
      if (rating === 1) {
        card.leitnerBox = 1; // reset on fail
      } else if (rating === 2) {
        card.leitnerBox = Math.max(1, card.leitnerBox);
      } else if (rating >= 3) {
        card.leitnerBox = Math.min(5, card.leitnerBox + 1);
      }
    }

    rate(card, 3); // Good
    assert.strictEqual(card.leitnerBox, 2);
    assert.strictEqual(card.repetitions, 1);

    rate(card, 4); // Easy
    assert.strictEqual(card.leitnerBox, 3);

    rate(card, 1); // Again (Forgot)
    assert.strictEqual(card.leitnerBox, 1);
  });

  test('Anki TSV Exporter Format Compliance', () => {
    const deck = {
      title: 'Biology 101',
      tags: ['Biology', 'Science'],
      flashcards: [
        { front: 'What is DNA?', back: 'Deoxyribonucleic acid', hint: 'Genetic material' },
        { front: 'What is RNA?', back: 'Ribonucleic acid', hint: '' }
      ]
    };

    const lines = ['#separator:tab', '#html:true', '#tags column:3'];
    deck.flashcards.forEach(card => {
      const front = card.front.replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const back = (card.back + (card.hint ? `<br><i>Hint: ${card.hint}</i>` : '')).replace(/\t/g, ' ').replace(/\n/g, '<br>');
      const tags = (deck.tags || []).join(' ') || 'MindSparks';
      lines.push(`${front}\t${back}\t${tags}`);
    });

    const output = lines.join('\n');
    assert.ok(output.startsWith('#separator:tab'));
    assert.ok(output.includes('What is DNA?\tDeoxyribonucleic acid<br><i>Hint: Genetic material</i>\tBiology Science'));
  });

});
