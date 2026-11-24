/**
 * Automated Verification Test Suite for J.A.R.V.I.S. Predict
 * Tests multilingual tokenization, script auto-detection, RTL flags,
 * and Layer 1 local N-gram predictions across English, Hindi, Arabic, and Japanese.
 */

import { MultilingualTokenizer, LocalNGramEngine } from '../public/engine.js';
import assert from 'assert';

console.log('======================================================');
console.log('   RUNNING J.A.R.V.I.S. MULTILINGUAL TEST SUITE');
console.log('======================================================\n');

const tokenizer = new MultilingualTokenizer();
const engine = new LocalNGramEngine(tokenizer);

// Test 1: Language & Script Auto-Detection + RTL Direction
console.log('[TEST 1] Testing Script & Language Detection with RTL Check...');

const testCases = [
  { text: 'Hello, I would like to review the project.', expectedLang: 'en', expectedScript: 'Latin', expectedRTL: false },
  { text: 'नमस्ते, आप कैसे हैं? आज का मौसम बहुत अच्छा है।', expectedLang: 'hi', expectedScript: 'Devanagari', expectedRTL: false },
  { text: 'السلام عليكم ورحمة الله وبركاته، كيف حالك؟', expectedLang: 'ar', expectedScript: 'Arabic', expectedRTL: true },
  { text: 'こんにちは、本日の会議はよろしくお願いいたします。', expectedLang: 'ja', expectedScript: 'Japanese', expectedRTL: false }
];

testCases.forEach((tc, idx) => {
  const result = tokenizer.detectScriptAndLanguage(tc.text);
  console.log(`  Case ${idx + 1}: "${tc.text.slice(0, 30)}..."`);
  console.log(`    -> Detected: ${result.lang} (${result.script}), RTL: ${result.isRTL}`);
  
  assert.strictEqual(result.lang, tc.expectedLang, `Language mismatch for ${tc.text}`);
  assert.strictEqual(result.script, tc.expectedScript, `Script mismatch for ${tc.text}`);
  assert.strictEqual(result.isRTL, tc.expectedRTL, `RTL mismatch for ${tc.text}`);
});
console.log('  ✓ Language, Script, and RTL detection PASSED.\n');

// Test 2: Tokenization across distinct scripts (including non-space languages)
console.log('[TEST 2] Testing Intl.Segmenter Word Tokenization across languages...');

const englishTokens = tokenizer.tokenize('I would like to inform you.', 'en');
console.log('  English tokens:', englishTokens);
assert(englishTokens.includes('would') && englishTokens.includes('inform'));

const hindiTokens = tokenizer.tokenize('नमस्ते, आप कैसे हैं?', 'hi');
console.log('  Hindi tokens:', hindiTokens);
assert(hindiTokens.includes('नमस्ते') && hindiTokens.includes('आप'));

const arabicTokens = tokenizer.tokenize('السلام عليكم ورحمة الله', 'ar');
console.log('  Arabic tokens:', arabicTokens);
assert(arabicTokens.includes('السلام') && arabicTokens.includes('عليكم'));

const japaneseTokens = tokenizer.tokenize('本日はよろしくお願いいたします', 'ja');
console.log('  Japanese tokens (space-less segmenting):', japaneseTokens);
assert(japaneseTokens.length >= 3, 'Japanese tokenization should parse multi-token phrase');

console.log('  ✓ Multilingual tokenization PASSED.\n');

// Test 3: Layer 1 Local N-Gram Predictions (Empty Context -> Starters)
console.log('[TEST 3] Testing Sentence Starters on Empty Context...');

const langs = ['en', 'hi', 'ar', 'ja'];
langs.forEach(l => {
  const starters = engine.predict('', l, 5);
  console.log(`  Starters for [${l}]:`, starters.map(s => `${s.word} (${s.confidencePercent}%)`).join(', '));
  assert(starters.length > 0, `Starters should exist for language ${l}`);
  assert(starters[0].probability > 0, 'Starters should have valid probability');
});
console.log('  ✓ Multilingual sentence starters PASSED.\n');

// Test 4: Layer 1 Trigram / Bigram Context Predictions
console.log('[TEST 4] Testing Context-Based Predictions for English, Hindi, Arabic, Japanese...');

// English context prediction
const enPreds = engine.predict('I would like', 'en', 5);
console.log('  Prediction after "I would like":', enPreds.map(p => `${p.word} (${p.confidencePercent}%)`).join(', '));
assert(enPreds.length > 0);
assert.strictEqual(enPreds[0].word, 'to', 'Top prediction after "I would like" should be "to"');

// Hindi context prediction
const hiPreds = engine.predict('आप कैसे', 'hi', 5);
console.log('  Prediction after "आप कैसे":', hiPreds.map(p => `${p.word} (${p.confidencePercent}%)`).join(', '));
assert(hiPreds.length > 0);
assert.strictEqual(hiPreds[0].word, 'हैं', 'Top prediction after "आप कैसे" should be "हैं"');

// Arabic context prediction
const arPreds = engine.predict('السلام', 'ar', 5);
console.log('  Prediction after "السلام":', arPreds.map(p => `${p.word} (${p.confidencePercent}%)`).join(', '));
assert(arPreds.length > 0);
assert.strictEqual(arPreds[0].word, 'عليكم', 'Top prediction after "السلام" should be "عليكم"');

// Japanese context prediction
const jaPreds = engine.predict('よろしく', 'ja', 5);
console.log('  Prediction after "よろしく":', jaPreds.map(p => `${p.word} (${p.confidencePercent}%)`).join(', '));
assert(jaPreds.length > 0);
assert(jaPreds.some(p => p.word.includes('お願い') || p.word.includes('いたします')), 'Japanese should predict follow-up keigo token');

console.log('  ✓ Multilingual context-based predictions PASSED.\n');

// Test 5: Live Learning Adaptation
console.log('[TEST 5] Testing Real-Time Learning Adaptation from User Typing...');
const customPhrase = 'J.A.R.V.I.S. is an extraordinarily advanced artificial intelligence system.';
engine.trainText(customPhrase, 'en', false);

const learnedPreds = engine.predict('extraordinarily advanced', 'en', 5);
console.log('  Prediction after "extraordinarily advanced":', learnedPreds.map(p => `${p.word} (${p.confidencePercent}%)`).join(', '));
assert(learnedPreds.length > 0);
assert.strictEqual(learnedPreds[0].word, 'artificial', 'Model should have learned and predicted "artificial"');

console.log('  ✓ Real-time user learning adaptation PASSED.\n');

console.log('======================================================');
console.log('  ALL MULTILINGUAL ENGINE TESTS SUCCESSFULLY PASSED!');
console.log('======================================================\n');
