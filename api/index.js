import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  const hasClaude = Boolean((process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CHATTY_API_KEY)?.trim());
  const hasGrok = Boolean((process.env.XAI_API_KEY || process.env.GROK_API_KEY)?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  
  let activeProvider = 'offline';
  const providerPref = (process.env.LLM_PROVIDER || 'auto').toLowerCase();
  
  if ((providerPref === 'claude' || providerPref === 'chatty' || providerPref === 'anthropic') && hasClaude) activeProvider = 'chatty-claude';
  else if ((providerPref === 'grok' || providerPref === 'xai') && hasGrok) activeProvider = 'grok';
  else if (providerPref === 'gemini' && hasGemini) activeProvider = 'gemini';
  else if (providerPref === 'openai' && hasOpenAI) activeProvider = 'openai';
  else if (providerPref === 'auto') {
    if (hasGemini) activeProvider = 'gemini';
    else if (hasGrok) activeProvider = 'grok';
    else if (hasClaude) activeProvider = 'chatty-claude';
    else if (hasOpenAI) activeProvider = 'openai';
  }

  res.json({
    status: 'online',
    platform: 'vercel-serverless',
    activeProvider,
    hasClaude,
    hasGrok,
    hasGemini,
    hasOpenAI,
    timestamp: new Date().toISOString()
  });
});

async function callGemini(context, language, script, maxSuggestions = 5) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const systemInstruction = `You are J.A.R.V.I.S., a real-time predictive text assistant.
Given the context, predict the ${maxSuggestions} most likely next words that continue right at the cursor.
Continue in the exact same language and script. Return strictly valid JSON: { "predictions": [ { "word": "string", "probability": 0.85 } ] }`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nContext: "${context}"` }] }],
      generationConfig: { temperature: 0.2, topP: 0.9, maxOutputTokens: 250, responseMimeType: 'application/json' }
    })
  });

  if (!response.ok) throw new Error(`Gemini error ${response.status}`);
  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return [];
  const parsed = JSON.parse(rawText.replace(/```json/g, '').replace(/```/g, '').trim());
  return Array.isArray(parsed.predictions) ? parsed.predictions : [];
}

async function callGrok(context, language, script, maxSuggestions = 5) {
  const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  const model = process.env.GROK_MODEL || 'grok-2-mini';
  const endpoint = process.env.GROK_BASE_URL || 'https://api.x.ai/v1/chat/completions';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: `Predict top ${maxSuggestions} next words as JSON: { "predictions": [ { "word": "str", "probability": 0.8 } ] }` },
        { role: 'user', content: `Context: "${context}"` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2
    })
  });

  if (!response.ok) throw new Error(`Grok error ${response.status}`);
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) return [];
  const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
  return Array.isArray(parsed.predictions) ? parsed.predictions : [];
}

async function callClaude(context, language, script, maxSuggestions = 5) {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CHATTY_API_KEY;
  const model = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-20241022';
  const endpoint = 'https://api.anthropic.com/v1/messages';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model,
      max_tokens: 150,
      system: `Predict top ${maxSuggestions} next words as JSON: { "predictions": [ { "word": "str", "probability": 0.8 } ] }`,
      messages: [{ role: 'user', content: `Context: "${context}"` }]
    })
  });

  if (!response.ok) throw new Error(`Claude error ${response.status}`);
  const data = await response.json();
  const content = data?.content?.[0]?.text;
  if (!content) return [];
  const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
  return Array.isArray(parsed.predictions) ? parsed.predictions : [];
}

app.post('/api/predict', async (req, res) => {
  const startTime = performance.now();
  const { context = '', language = '', script = '', maxSuggestions = 5 } = req.body;
  const truncatedContext = context.slice(-250);

  const hasClaude = Boolean((process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.CHATTY_API_KEY)?.trim());
  const hasGrok = Boolean((process.env.XAI_API_KEY || process.env.GROK_API_KEY)?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim());
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());
  const providerPref = (process.env.LLM_PROVIDER || 'auto').toLowerCase();

  let selectedProvider = null;
  if ((providerPref === 'claude' || providerPref === 'chatty') && hasClaude) selectedProvider = 'chatty-claude';
  else if ((providerPref === 'grok' || providerPref === 'xai') && hasGrok) selectedProvider = 'grok';
  else if (providerPref === 'gemini' && hasGemini) selectedProvider = 'gemini';
  else if (providerPref === 'auto') {
    if (hasGemini) selectedProvider = 'gemini';
    else if (hasGrok) selectedProvider = 'grok';
    else if (hasClaude) selectedProvider = 'chatty-claude';
  }

  if (!selectedProvider) {
    return res.json({
      success: true,
      offline: true,
      predictions: [],
      provider: 'local-only',
      latencyMs: Math.round(performance.now() - startTime)
    });
  }

  try {
    let rawPredictions = [];
    if (selectedProvider === 'chatty-claude') rawPredictions = await callClaude(truncatedContext, language, script, maxSuggestions);
    else if (selectedProvider === 'grok') rawPredictions = await callGrok(truncatedContext, language, script, maxSuggestions);
    else if (selectedProvider === 'gemini') rawPredictions = await callGemini(truncatedContext, language, script, maxSuggestions);

    const predictions = rawPredictions
      .filter(p => p && typeof p.word === 'string' && p.word.trim().length > 0)
      .slice(0, maxSuggestions)
      .map(p => ({
        word: p.word.trim(),
        probability: Math.round((p.probability || 0.65) * 100) / 100,
        confidencePercent: Math.round((p.probability || 0.65) * 100)
      }));

    res.json({
      success: true,
      offline: false,
      predictions,
      provider: selectedProvider,
      latencyMs: Math.round(performance.now() - startTime)
    });
  } catch (err) {
    res.json({
      success: false,
      offline: true,
      predictions: [],
      provider: 'fallback-local',
      latencyMs: Math.round(performance.now() - startTime)
    });
  }
});

export default app;
