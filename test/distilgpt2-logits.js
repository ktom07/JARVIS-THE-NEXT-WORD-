import { AutoTokenizer, AutoModelForCausalLM } from '@xenova/transformers';

console.log('Testing AutoModelForCausalLM with Xenova/distilgpt2...');
const tokenizer = await AutoTokenizer.from_pretrained('Xenova/distilgpt2');
const model = await AutoModelForCausalLM.from_pretrained('Xenova/distilgpt2');

const prompt = 'The artificial intelligence system will';
const inputs = await tokenizer(prompt);

console.log('Running forward pass...');
const output = await model(inputs);
const logits = output.logits; // shape: [1, seq_len, vocab_size]

// Logits for the last token position
const dims = logits.dims;
const seqLen = dims[1];
const vocabSize = dims[2];

const lastTokenOffset = (seqLen - 1) * vocabSize;
const lastLogits = logits.data.subarray(lastTokenOffset, lastTokenOffset + vocabSize);

// Find top 5 tokens using partial sort / scan
const indexed = [];
for (let i = 0; i < vocabSize; i++) {
  indexed.push({ id: i, logit: lastLogits[i] });
}
indexed.sort((a, b) => b.logit - a.logit);

// Softmax on top 5
const top5 = indexed.slice(0, 5);
const maxLogit = top5[0].logit;
let sumExp = 0;
top5.forEach(t => {
  t.exp = Math.exp(t.logit - maxLogit);
  sumExp += t.exp;
});

const predictions = top5.map(t => {
  const word = tokenizer.decode([t.id]).trim();
  const prob = t.exp / sumExp;
  return {
    token: t.id,
    word,
    probability: Math.round(prob * 100) / 100,
    confidencePercent: Math.round(prob * 100)
  };
}).filter(p => p.word.length > 0);

console.log('Top 5 DistilGPT-2 predictions for "' + prompt + '":');
console.table(predictions);
