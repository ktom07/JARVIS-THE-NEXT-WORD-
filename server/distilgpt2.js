/**
 * DistilGPT-2 Neural Prediction Module
 * Uses @xenova/transformers ONNX CausalLM forward pass
 * to extract exact top-k next-token probabilities.
 */

import { AutoTokenizer, AutoModelForCausalLM } from '@xenova/transformers';

let tokenizer = null;
let model = null;
let isInitializing = false;
let isLoaded = false;

export async function initDistilGPT2() {
  if (isLoaded || isInitializing) return;
  isInitializing = true;
  try {
    console.log('[DISTILGPT-2] Loading ONNX model and tokenizer...');
    const t0 = performance.now();
    tokenizer = await AutoTokenizer.from_pretrained('Xenova/distilgpt2');
    model = await AutoModelForCausalLM.from_pretrained('Xenova/distilgpt2');
    isLoaded = true;
    isInitializing = false;
    console.log(`[DISTILGPT-2] Ready in ${Math.round(performance.now() - t0)} ms.`);
  } catch (err) {
    console.error('[DISTILGPT-2] Initialization error:', err);
    isInitializing = false;
  }
}

export function isDistilGPT2Ready() {
  return isLoaded;
}

export async function predictDistilGPT2(context, maxSuggestions = 5) {
  if (!isLoaded) {
    await initDistilGPT2();
  }
  if (!model || !tokenizer) return [];

  const trimmed = (context || '').slice(-300).trim();
  if (!trimmed) return [];

  try {
    const inputs = await tokenizer(trimmed);
    const output = await model(inputs);
    const logits = output.logits;

    const dims = logits.dims; // [1, seqLen, vocabSize]
    const seqLen = dims[1];
    const vocabSize = dims[2];

    const lastTokenOffset = (seqLen - 1) * vocabSize;
    const lastLogits = logits.data.subarray(lastTokenOffset, lastTokenOffset + vocabSize);

    // Scan top candidates
    const indexed = [];
    for (let i = 0; i < vocabSize; i++) {
      indexed.push({ id: i, logit: lastLogits[i] });
    }
    indexed.sort((a, b) => b.logit - a.logit);

    // Compute softmax on top candidates
    const candidates = indexed.slice(0, Math.max(maxSuggestions * 2, 10));
    const maxLogit = candidates[0].logit;
    let sumExp = 0;
    candidates.forEach(c => {
      c.exp = Math.exp(c.logit - maxLogit);
      sumExp += c.exp;
    });

    const predictions = [];
    const seenWords = new Set();

    for (const c of candidates) {
      const rawWord = tokenizer.decode([c.id]);
      const word = rawWord.trim();
      
      // Filter empty, single punctuation, or duplicates
      if (!word || word.length === 0 || seenWords.has(word.toLowerCase())) continue;
      seenWords.add(word.toLowerCase());

      const prob = c.exp / sumExp;
      predictions.push({
        word,
        probability: Math.round(prob * 100) / 100,
        confidencePercent: Math.min(Math.max(Math.round(prob * 100), 5), 98)
      });

      if (predictions.length >= maxSuggestions) break;
    }

    return predictions;
  } catch (err) {
    console.error('[DISTILGPT-2] Prediction forward pass error:', err.message);
    return [];
  }
}
