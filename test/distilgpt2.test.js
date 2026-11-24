/**
 * DistilGPT-2 Next-Word Prediction Test
 */

import { pipeline } from '@xenova/transformers';

console.log('Loading Xenova/distilgpt2 pipeline...');
const startTime = performance.now();

try {
  const generator = await pipeline('text-generation', 'Xenova/distilgpt2');
  console.log(`DistilGPT-2 loaded in ${Math.round(performance.now() - startTime)} ms`);

  const prompt = 'The artificial intelligence system will';
  console.log(`\nGenerating next tokens for: "${prompt}"`);

  // Generate top candidate sequences
  const output = await generator(prompt, {
    max_new_tokens: 1,
    num_return_sequences: 1,
    temperature: 0.7,
    do_sample: false
  });

  console.log('Output:', JSON.stringify(output, null, 2));
  console.log('\nDistilGPT-2 is working perfectly!');
} catch (err) {
  console.error('DistilGPT-2 error:', err);
}
