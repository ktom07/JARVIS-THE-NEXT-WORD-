import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDistilGPT2, predictDistilGPT2, isDistilGPT2Ready } from './distilgpt2.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Preload DistilGPT-2 ONNX neural model in background
initDistilGPT2().catch(e => console.error('DistilGPT-2 warmup error:', e));

// Serve static frontend files from 'public' directory
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
app.use(express.static(path.join(__dirname, '..')));

/**
 * Health & Configuration check
 */
app.get('/api/health', (req, res) => {
  const hasClaude = Boolean((process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CHATTY_API_KEY)?.trim());
  const hasGrok = Boolean((process.env.XAI_API_KEY || process.env.GROK_API_KEY)?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  const hasDistilGPT2 = true;
  
  let activeProvider = 'distilgpt2';
  const providerPref = (process.env.LLM_PROVIDER || 'distilgpt2').toLowerCase();
  
  if (providerPref === 'distilgpt2' || providerPref === 'distilgpt-2') activeProvider = 'distilgpt2';
  else if ((providerPref === 'claude' || providerPref === 'chatty' || providerPref === 'anthropic') && hasClaude) activeProvider = 'chatty-claude';
  else if ((providerPref === 'grok' || providerPref === 'xai') && hasGrok) activeProvider = 'grok';
  else if (providerPref === 'gemini' && hasGemini) activeProvider = 'gemini';
  else if (providerPref === 'openai' && hasOpenAI) activeProvider = 'openai';
  else if (providerPref === 'auto') {
    activeProvider = 'distilgpt2';
  }

  res.json({
    status: 'online',
    activeProvider,
    hasDistilGPT2,
    distilGPT2Ready: isDistilGPT2Ready(),
    hasClaude,
    hasGrok,
    hasGemini,
    hasOpenAI,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

/**
 * Call Chatty Powered by Claude (Anthropic API)
 */
async function callClaude(context, language, script, maxSuggestions = 5) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CHATTY_API_KEY;
  const model = process.env.CLAUDE_MODEL || process.env.CHATTY_MODEL || 'claude-3-5-haiku-20241022';
  const endpoint = process.env.CLAUDE_BASE_URL || process.env.CHATTY_BASE_URL || 'https://api.anthropic.com/v1/messages';

  const systemPrompt = `You are J.A.R.V.I.S., a real-time predictive text assistant powered by Chatty / Claude.
Given the preceding text context, predict the ${maxSuggestions} most likely next words that naturally continue right at the cursor.
Context may be in ANY language or script (English, Hindi, Arabic, Japanese, Chinese, Hebrew, Russian, etc.).
STRICT RULES:
1. Continue in the EXACT SAME language, dialect, and script as the context provided.
2. Predict only the NEXT single word (or very short natural atomic token) for each candidate.
3. Return strictly a raw JSON object with NO markdown formatting, NO backticks.
Schema:
{
  "predictions": [
    { "word": "string", "probability": 0.85 }
  ]
}`;

  const userPrompt = `Context: "${context}"
Language: ${language || 'auto'}
Script: ${script || 'auto'}
Next ${maxSuggestions} predictions as JSON:`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 150,
      temperature: 0.2,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chatty / Claude API error [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.content?.[0]?.text;
  if (!content) return [];
  const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed.predictions) ? parsed.predictions : [];
}

/**
 * Call xAI Grok API
 */
async function callGrok(context, language, script, maxSuggestions = 5) {
  const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const model = process.env.GROK_MODEL || 'grok-2-mini';
  const endpoint = process.env.GROK_BASE_URL || 'https://api.x.ai/v1/chat/completions';

  const systemPrompt = `You are J.A.R.V.I.S., a real-time predictive text assistant.
Given the preceding text context, predict the ${maxSuggestions} most likely next words that naturally continue right at the cursor.
Context may be in ANY language or script (English, Hindi, Arabic, Japanese, Chinese, Hebrew, Russian, etc.).
STRICT RULES:
1. Continue in the EXACT SAME language, dialect, and script as the context provided.
2. Predict only the NEXT single word (or very short natural atomic token) for each candidate.
3. Return strictly a raw JSON object with NO markdown formatting, NO backticks.
Schema:
{
  "predictions": [
    { "word": "string", "probability": 0.85 }
  ]
}`;

  const userPrompt = `Context: "${context}"
Language: ${language || 'auto'}
Script: ${script || 'auto'}
Next ${maxSuggestions} predictions as JSON:`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 150
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`xAI Grok API error [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return [];
  const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed.predictions) ? parsed.predictions : [];
}

/**
 * Call Gemini API using native fetch
 */
async function callGemini(context, language, script, maxSuggestions = 5) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `You are J.A.R.V.I.S., a real-time predictive text assistant.
Given the preceding text context, predict the ${maxSuggestions} most likely next words (or concise natural tokens) that naturally continue right at the cursor.
Context may be in ANY language or script (English, Hindi, Arabic, Japanese, Chinese, Hebrew, Russian, etc.).
STRICT RULES:
1. Continue in the EXACT SAME language, dialect, and script as the context provided.
2. If context is Hindi in Devanagari, predict Hindi in Devanagari.
3. If context is Arabic (RTL), predict Arabic.
4. If context is Japanese, predict Japanese tokens (kanji/kana).
5. If context is empty, suggest natural sentence starters in the detected language or English if unknown.
6. Provide distinct, realistic alternatives.
7. Return strictly a raw JSON object with NO markdown formatting, NO backticks, NO explanation.
Schema:
{
  "predictions": [
    { "word": "string", "probability": 0.85 }
  ]
}`;

  const userPrompt = `Context: "${context}"
Language: ${language || 'auto-detect'}
Script: ${script || 'auto-detect'}
Predict next ${maxSuggestions} words now as JSON.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 250,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return [];

  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return Array.isArray(parsed.predictions) ? parsed.predictions : [];
}

/**
 * Call OpenAI API
 */
async function callOpenAI(context, language, script, maxSuggestions = 5) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const systemPrompt = `You are J.A.R.V.I.S., a real-time predictive text assistant.
Predict the top ${maxSuggestions} next words for the given context.
Return ONLY valid JSON matching:
{ "predictions": [ { "word": "word", "probability": 0.8 } ] }
Continue strictly in the same language and script as the input context.`;

  const userPrompt = `Context: "${context}"
Language: ${language || 'auto'}
Script: ${script || 'auto'}
Next ${maxSuggestions} predictions:`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 150
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error [${response.status}]: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return [];
  const parsed = JSON.parse(content);
  return Array.isArray(parsed.predictions) ? parsed.predictions : [];
}

/**
 * Prediction endpoint
 */
app.post('/api/predict', async (req, res) => {
  const startTime = performance.now();
  const { context = '', language = '', script = '', maxSuggestions = 5 } = req.body;

  // Truncate context to last ~250 characters as specified
  const truncatedContext = context.slice(-250);

  const hasClaude = Boolean((process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CHATTY_API_KEY)?.trim());
  const hasGrok = Boolean((process.env.XAI_API_KEY || process.env.GROK_API_KEY)?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  const providerPref = (process.env.LLM_PROVIDER || 'distilgpt2').toLowerCase();

  let selectedProvider = 'distilgpt2';
  if (providerPref === 'distilgpt2' || providerPref === 'distilgpt-2') selectedProvider = 'distilgpt2';
  else if ((providerPref === 'claude' || providerPref === 'chatty' || providerPref === 'anthropic') && hasClaude) selectedProvider = 'chatty-claude';
  else if ((providerPref === 'grok' || providerPref === 'xai') && hasGrok) selectedProvider = 'grok';
  else if (providerPref === 'gemini' && hasGemini) selectedProvider = 'gemini';
  else if (providerPref === 'openai' && hasOpenAI) selectedProvider = 'openai';
  else if (providerPref === 'auto') {
    selectedProvider = 'distilgpt2';
  }

  try {
    let rawPredictions = [];
    if (selectedProvider === 'distilgpt2') {
      rawPredictions = await predictDistilGPT2(truncatedContext, maxSuggestions);
    } else if (selectedProvider === 'chatty-claude') {
      rawPredictions = await callClaude(truncatedContext, language, script, maxSuggestions);
    } else if (selectedProvider === 'grok') {
      rawPredictions = await callGrok(truncatedContext, language, script, maxSuggestions);
    } else if (selectedProvider === 'gemini') {
      rawPredictions = await callGemini(truncatedContext, language, script, maxSuggestions);
    } else if (selectedProvider === 'openai') {
      rawPredictions = await callOpenAI(truncatedContext, language, script, maxSuggestions);
    }

    // Sanitize and normalize predictions
    const predictions = rawPredictions
      .filter(p => p && typeof p.word === 'string' && p.word.trim().length > 0)
      .slice(0, maxSuggestions)
      .map(p => {
        const prob = typeof p.probability === 'number' ? Math.min(Math.max(p.probability, 0.05), 0.99) : 0.65;
        return {
          word: p.word.trim(),
          probability: Math.round(prob * 100) / 100,
          confidencePercent: Math.round(prob * 100)
        };
      });

    // Ensure probabilities are sorted descending
    predictions.sort((a, b) => b.probability - a.probability);

    const latencyMs = Math.round(performance.now() - startTime);

    return res.json({
      success: true,
      offline: false,
      predictions,
      provider: selectedProvider,
      latencyMs
    });
  } catch (err) {
    console.error('Prediction Error:', err.message);
    const latencyMs = Math.round(performance.now() - startTime);
    return res.json({
      success: false,
      offline: true,
      error: err.message,
      predictions: [],
      provider: 'fallback-local',
      latencyMs
    });
  }
});

// Fallback to index.html for root requests
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  J.A.R.V.I.S. PREDICT BACKEND ONLINE ON PORT ${PORT}`);
  console.log(`  MODEL: DISTILGPT-2 NEURAL ENGINE ONLINE`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
