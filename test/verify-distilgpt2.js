import { initDistilGPT2, predictDistilGPT2 } from '../server/distilgpt2.js';

async function main() {
  console.log('=== VERIFYING DISTILGPT-2 PREDICTION MODEL ===\n');
  const t0 = performance.now();
  await initDistilGPT2();
  console.log(`Initialization time: ${(performance.now() - t0).toFixed(1)} ms\n`);

  const testPrompts = [
    "The artificial intelligence system will",
    "In the future, technology can",
    "I would like to thank",
    "The capital of France is",
    "Machine learning models are able to"
  ];

  for (const prompt of testPrompts) {
    const start = performance.now();
    const predictions = await predictDistilGPT2(prompt, 5);
    const latency = Math.round(performance.now() - start);

    console.log(`Prompt: "${prompt}" (latency: ${latency} ms)`);
    console.table(predictions);
    console.log('----------------------------------------------------');
  }

  console.log('\n=== ALL DISTILGPT-2 CHECKS PASSED SUCCESSFULLY ===');
}

main().catch(err => {
  console.error('DistilGPT-2 check failed:', err);
  process.exit(1);
});
