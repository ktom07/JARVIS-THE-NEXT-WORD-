/**
 * J.A.R.V.I.S. PREDICT - Multilingual Tokenizer & Prediction Engine
 * Layer 1: Instant local N-Gram model with live learning & persistence
 * Layer 2: LLM API proxy client with AbortController
 */

// Script Unicode Ranges for Auto-Detection
const SCRIPT_PATTERNS = [
  { name: 'Devanagari', lang: 'hi', label: 'LANG: HI · Devanagari', regex: /[\u0900-\u097F]/, rtl: false },
  { name: 'Arabic', lang: 'ar', label: 'LANG: AR · Arabic (RTL)', regex: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/, rtl: true },
  { name: 'Hebrew', lang: 'he', label: 'LANG: HE · Hebrew (RTL)', regex: /[\u0590-\u05FF\uFB1D-\uFB4F]/, rtl: true },
  { name: 'Japanese', lang: 'ja', label: 'LANG: JA · Japanese', regex: /[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/, rtl: false },
  { name: 'Chinese', lang: 'zh', label: 'LANG: ZH · Chinese', regex: /[\u4E00-\u9FFF]/, rtl: false },
  { name: 'Korean', lang: 'ko', label: 'LANG: KO · Korean', regex: /[\uAC00-\uD7AF\u1100-\u11FF]/, rtl: false },
  { name: 'Gujarati', lang: 'gu', label: 'LANG: GU · Gujarati', regex: /[\u0A80-\u0AFF]/, rtl: false },
  { name: 'Marathi', lang: 'mr', label: 'LANG: MR · Marathi', regex: /[\u0900-\u097F]/, rtl: false },
  { name: 'Cyrillic', lang: 'ru', label: 'LANG: RU · Russian', regex: /[\u0400-\u04FF]/, rtl: false },
  { name: 'Greek', lang: 'el', label: 'LANG: EL · Greek', regex: /[\u0370-\u03FF]/, rtl: false },
  { name: 'Latin', lang: 'en', label: 'LANG: EN · Latin', regex: /[A-Za-z\u00C0-\u024F]/, rtl: false }
];

// Rich multilingual seed corpora for offline zero-config intelligence
const SEED_CORPUS = [
  // English
  "I would like to inform you that our project is ready for review.",
  "Thank you very much for your prompt response and assistance.",
  "Looking forward to hearing from you soon regarding the meeting.",
  "Please let me know if you need any additional information from our team.",
  "We are working on the next generation of artificial intelligence assistants.",
  "The real-time prediction model learns as you continue writing.",
  "Could you please review the attached document at your earliest convenience?",
  "In order to achieve optimal performance, we must calibrate the system.",
  "Good morning, I hope you are having a productive and wonderful day.",
  "Have a great weekend and take care.",
  
  // Hindi (Devanagari)
  "नमस्ते, आप कैसे हैं? मुझे आशा है कि आप सब कुशल मंगल हैं।",
  "मैं आज बहुत खुश हूँ क्योंकि हमारा काम समय पर पूरा हो गया।",
  "कृपया मुझे बताइए कि इस प्रोजेक्ट में आगे क्या करना है।",
  "यह काम आज शाम तक पूरी तरह से समाप्त हो जाएगा।",
  "भारत एक बहुत ही सुंदर, विविधतापूर्ण और महान देश है।",
  "आपका बहुत-बहुत धन्यवाद इस सहायता और मार्गदर्शन के लिए।",
  "हम कल सुबह एक महत्वपूर्ण बैठक आयोजित करने जा रहे हैं।",
  "कृपया अपना संदेश यहाँ टाइप करें और परिणाम देखें।",

  // Arabic (RTL)
  "السلام عليكم ورحمة الله وبركاته، أتمنى أن تكون بأفضل حال.",
  "شكرا جزيلا لك على هذه المساعدة القيمة والجهد الرائع.",
  "أتمنى لك يوما سعيدا ومليئا بالنجاح والإنجازات.",
  "إن شاء الله سنتحدث قريبا حول تفاصيل العمل الجديد.",
  "كيف حالك اليوم يا صديقي العزيز، أرجو أن تكون بخير.",
  "يسعدني جدا التعاون معك في تطوير هذا النظام المتطور.",
  "يرجى مراجعة التقرير وإعلامنا بأي ملاحظات إضافية.",

  // Japanese
  "こんにちは、本日はよろしくお願いいたします。",
  "お忙しいところ恐縮ですが、詳細についてご確認いただけますでしょうか。",
  "ありがとうございます。とても助かりました。",
  "明日の会議は予定通り午前十時から開始いたします。",
  "新しいプロジェクトの進行状況についてご報告いたします。",
  "何かご不明な点がございましたら、いつでもお知らせください。",
  "引き続きよろしくお願いいたします。",

  // Gujarati
  "નમસ્તે, તમે કેમ છો? તમારો દિવસ સારો રહે તેવી શુભેચ્છા.",
  "તમારો ખૂબ ખૂબ આભાર આ સુંદર મદદ માટે.",
  "આજે હવામાન ખૂબ જ સરસ અને ખુશનુમા છે.",
  "આપણે કાલે સવારે મહત્વપૂર્ણ વિષય પર ચર્ચા કરીશું.",

  // French
  "Bonjour, j'espère que vous passez une excellente journée.",
  "Merci beaucoup pour votre collaboration et votre soutien.",
  "Je reste à votre entière disposition pour tout renseignement complémentaire.",

  // Spanish
  "Hola, espero que tengas un excelente y productivo día.",
  "Muchas gracias por tu valiosa colaboración y apoyo.",
  "Quedo a tu disposición para cualquier consulta adicional.",

  // German
  "Guten Tag, vielen Dank für Ihre schnelle und freundliche Rückmeldung.",
  "Ich freue mich auf unsere erfolgreiche Zusammenarbeit.",
  "Bitte geben Sie mir Bescheid, wenn Sie weitere Informationen benötigen.",

  // Chinese
  "你好，非常感谢你的支持与帮助。",
  "我们期待与您在接下来的项目中紧密合作。",
  "今天的天气非常好，祝你工作顺利。"
];

/**
 * Universal Multilingual Tokenizer using Intl.Segmenter with fallback
 */
export class MultilingualTokenizer {
  constructor() {
    this.hasSegmenter = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function';
    this.segmenterCache = new Map();
  }

  getSegmenter(lang = 'en') {
    if (!this.hasSegmenter) return null;
    if (!this.segmenterCache.has(lang)) {
      try {
        this.segmenterCache.set(lang, new Intl.Segmenter(lang, { granularity: 'word' }));
      } catch {
        this.segmenterCache.set(lang, new Intl.Segmenter('en', { granularity: 'word' }));
      }
    }
    return this.segmenterCache.get(lang);
  }

  /**
   * Tokenizes text into word-tokens preserving script boundaries
   */
  tokenize(text, lang = 'en') {
    if (!text || typeof text !== 'string') return [];
    
    if (this.hasSegmenter) {
      const seg = this.getSegmenter(lang);
      const segments = Array.from(seg.segment(text));
      return segments
        .filter(s => s.isWordLike)
        .map(s => s.segment.trim())
        .filter(s => s.length > 0);
    }

    // Fallback Unicode-aware tokenization
    // Uses Unicode property escapes (\p{L}\p{N}\p{M}) to match letters, numbers, and combining marks across scripts
    try {
      const matches = text.match(/[\p{L}\p{N}\p{M}]+/gu);
      return matches ? matches.map(m => m.trim()).filter(Boolean) : [];
    } catch {
      // Basic fallback
      return text.trim().split(/\s+/).filter(Boolean);
    }
  }

  /**
   * Detects language and script from raw text
   */
  detectScriptAndLanguage(text) {
    if (!text || text.trim().length === 0) {
      return {
        lang: 'en',
        script: 'Latin',
        label: 'LANG: EN · Latin',
        isRTL: false,
        confidence: 0
      };
    }

    const scriptCounts = {};
    for (const pattern of SCRIPT_PATTERNS) {
      scriptCounts[pattern.name] = 0;
    }

    // Sample characters
    for (const char of text) {
      for (const pattern of SCRIPT_PATTERNS) {
        if (pattern.regex.test(char)) {
          scriptCounts[pattern.name] = (scriptCounts[pattern.name] || 0) + 1;
          break;
        }
      }
    }

    let dominantScript = 'Latin';
    let maxCount = 0;
    for (const [script, count] of Object.entries(scriptCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantScript = script;
      }
    }

    const match = SCRIPT_PATTERNS.find(p => p.name === dominantScript) || SCRIPT_PATTERNS[SCRIPT_PATTERNS.length - 1];
    return {
      lang: match.lang,
      script: match.name,
      label: match.label,
      isRTL: match.rtl,
      confidence: maxCount / Math.max(text.length, 1)
    };
  }
}

/**
 * Layer 1: Local N-Gram Model (1-gram, 2-gram, 3-gram) with Real-Time Learning
 */
export class LocalNGramEngine {
  constructor(tokenizer) {
    this.tokenizer = tokenizer || new MultilingualTokenizer();
    this.storageKey = 'jarvis_ngram_store_v2';
    
    // N-gram frequency tables
    this.unigrams = Object.create(null); // word -> count
    this.bigrams = Object.create(null);  // w1 -> { w2: count }
    this.trigrams = Object.create(null); // w1_w2 -> { w3: count }
    this.sentenceStarters = Object.create(null); // lang -> { word: count }

    this.totalWordsTrained = 0;
    this.loadFromStorage();

    // Train seed corpus if first time or empty
    if (Object.keys(this.unigrams).length < 20) {
      this.seedInitialCorpus();
    }
  }

  seedInitialCorpus() {
    for (const sentence of SEED_CORPUS) {
      const detection = this.tokenizer.detectScriptAndLanguage(sentence);
      this.trainText(sentence, detection.lang, false);
    }
    this.saveToStorage();
  }

  /**
   * Train model on a piece of text
   */
  trainText(text, lang = 'en', persist = true) {
    if (!text || text.trim().length === 0) return;

    // Detect language if not provided
    if (!lang || lang === 'auto') {
      lang = this.tokenizer.detectScriptAndLanguage(text).lang;
    }

    const tokens = this.tokenizer.tokenize(text, lang);
    if (tokens.length === 0) return;

    // Track sentence starter
    if (!this.sentenceStarters[lang]) this.sentenceStarters[lang] = Object.create(null);
    const firstWord = tokens[0];
    this.sentenceStarters[lang][firstWord] = (this.sentenceStarters[lang][firstWord] || 0) + 1;

    for (let i = 0; i < tokens.length; i++) {
      const w1 = tokens[i];
      this.unigrams[w1] = (this.unigrams[w1] || 0) + 1;
      this.totalWordsTrained++;

      if (i < tokens.length - 1) {
        const w2 = tokens[i + 1];
        if (!this.bigrams[w1]) this.bigrams[w1] = Object.create(null);
        this.bigrams[w1][w2] = (this.bigrams[w1][w2] || 0) + 1;

        if (i < tokens.length - 2) {
          const w3 = tokens[i + 2];
          const biKey = `${w1}___${w2}`;
          if (!this.trigrams[biKey]) this.trigrams[biKey] = Object.create(null);
          this.trigrams[biKey][w3] = (this.trigrams[biKey][w3] || 0) + 1;
        }
      }
    }

    if (persist) {
      this.debouncedSave();
    }
  }

  /**
   * Predict next word candidates based on context
   */
  predict(context, lang = 'en', maxResults = 5) {
    const tokens = this.tokenizer.tokenize(context, lang);
    const candidates = new Map();

    // Case 1: Empty context -> return top sentence starters for this language
    if (tokens.length === 0) {
      const starters = this.sentenceStarters[lang] || this.sentenceStarters['en'] || {};
      const sortedStarters = Object.entries(starters).sort((a, b) => b[1] - a[1]);
      
      let sum = 0;
      for (const [, count] of sortedStarters.slice(0, maxResults)) sum += count;

      const results = sortedStarters.slice(0, maxResults).map(([word, count]) => {
        const prob = sum > 0 ? count / sum : 0.5;
        return {
          word,
          probability: Math.round(prob * 100) / 100,
          confidencePercent: Math.min(Math.round(prob * 100), 95),
          source: 'local-starter'
        };
      });

      if (results.length > 0) return results;

      // Fallback default starters if none learned yet
      const defaultStarters = {
        hi: ['नमस्ते', 'कृपया', 'मैं', 'यह', 'आज'],
        ar: ['السلام', 'شكراً', 'أتمنى', 'كيف', 'يسعدني'],
        ja: ['こんにちは', '本日は', 'よろしく', 'ありがとう', '明日の'],
        en: ['I', 'The', 'Please', 'Thank', 'Looking']
      };
      const defs = defaultStarters[lang] || defaultStarters.en;
      return defs.slice(0, maxResults).map((w, idx) => ({
        word: w,
        probability: Math.max(0.3, 0.9 - idx * 0.15),
        confidencePercent: Math.round(Math.max(30, 90 - idx * 15)),
        source: 'local-default'
      }));
    }

    const lastToken = tokens[tokens.length - 1];
    const secondLastToken = tokens.length >= 2 ? tokens[tokens.length - 2] : null;

    // Check Trigrams (highest confidence)
    if (secondLastToken) {
      const triKey = `${secondLastToken}___${lastToken}`;
      const triMatches = this.trigrams[triKey];
      if (triMatches) {
        let triTotal = 0;
        for (const count of Object.values(triMatches)) triTotal += count;
        for (const [w, count] of Object.entries(triMatches)) {
          const score = (count / triTotal) * 0.75 + 0.25;
          candidates.set(w, { word: w, score, tier: 'trigram' });
        }
      }
    }

    // Check Bigrams (medium confidence)
    const biMatches = this.bigrams[lastToken];
    if (biMatches) {
      let biTotal = 0;
      for (const count of Object.values(biMatches)) biTotal += count;
      for (const [w, count] of Object.entries(biMatches)) {
        const biScore = (count / biTotal) * 0.65;
        if (candidates.has(w)) {
          // Boost existing candidate
          const existing = candidates.get(w);
          existing.score = Math.min(existing.score + 0.15, 0.98);
        } else {
          candidates.set(w, { word: w, score: biScore, tier: 'bigram' });
        }
      }
    }

    // Fallback: Check Unigrams if candidates are sparse
    if (candidates.size < maxResults) {
      const sortedUnigrams = Object.entries(this.unigrams)
        .sort((a, b) => b[1] - a[1]);

      for (const [w, count] of sortedUnigrams) {
        if (w === lastToken) continue;
        if (!candidates.has(w)) {
          candidates.set(w, { word: w, score: 0.15, tier: 'unigram' });
        }
        if (candidates.size >= maxResults) break;
      }
    }

    // Normalize candidate scores to probabilities
    const sorted = Array.from(candidates.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    let scoreSum = sorted.reduce((acc, c) => acc + c.score, 0) || 1;
    return sorted.map(c => {
      const normalizedProb = Math.min(Math.max(c.score / scoreSum, 0.1), 0.98);
      return {
        word: c.word,
        probability: Math.round(normalizedProb * 100) / 100,
        confidencePercent: Math.round(normalizedProb * 100),
        source: `local-${c.tier}`
      };
    });
  }

  saveToStorage() {
    try {
      const data = {
        unigrams: this.unigrams,
        bigrams: this.bigrams,
        trigrams: this.trigrams,
        sentenceStarters: this.sentenceStarters,
        totalWordsTrained: this.totalWordsTrained
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // Storage quota or unavailable, silent fallback
    }
  }

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.unigrams) this.unigrams = data.unigrams;
      if (data.bigrams) this.bigrams = data.bigrams;
      if (data.trigrams) this.trigrams = data.trigrams;
      if (data.sentenceStarters) this.sentenceStarters = data.sentenceStarters;
      if (data.totalWordsTrained) this.totalWordsTrained = data.totalWordsTrained;
    } catch {
      // Reset if corrupted
    }
  }

  debouncedSave() {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => this.saveToStorage(), 1000);
  }

  clearModel() {
    this.unigrams = Object.create(null);
    this.bigrams = Object.create(null);
    this.trigrams = Object.create(null);
    this.sentenceStarters = Object.create(null);
    this.totalWordsTrained = 0;
    try {
      localStorage.removeItem(this.storageKey);
    } catch {}
    this.seedInitialCorpus();
  }
}

/**
 * Layer 2: LLM Proxy Service with AbortController
 */
export class LLMProxyClient {
  constructor(apiBaseUrl = '') {
    this.apiBaseUrl = apiBaseUrl;
    this.currentAbortController = null;
    this.requestId = 0;
    this.lastLatencyMs = 0;
    this.isLocalOnly = false;
  }

  setLocalOnly(value) {
    this.isLocalOnly = Boolean(value);
    if (this.isLocalOnly && this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  /**
   * Request LLM predictions for context with cancellation of stale calls
   */
  async requestPredictions(context, language, script, maxSuggestions = 5) {
    if (this.isLocalOnly) {
      return { offline: true, predictions: [], source: 'local-only-setting' };
    }

    // Cancel in-flight stale request immediately
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }

    this.currentAbortController = new AbortController();
    const currentId = ++this.requestId;
    const signal = this.currentAbortController.signal;

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: context.slice(-250),
          language,
          script,
          maxSuggestions
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      
      // If a newer request was dispatched while this was in flight, ignore this response
      if (currentId !== this.requestId) {
        return null;
      }

      this.lastLatencyMs = data.latencyMs || 0;
      return {
        offline: data.offline || false,
        predictions: data.predictions || [],
        provider: data.provider || 'llm',
        latencyMs: this.lastLatencyMs
      };
    } catch (err) {
      if (err.name === 'AbortError') {
        // Normal cancellation of stale request
        return null;
      }
      return {
        offline: true,
        predictions: [],
        error: err.message,
        source: 'llm-error-fallback'
      };
    } finally {
      if (currentId === this.requestId) {
        this.currentAbortController = null;
      }
    }
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.apiBaseUrl}/api/health`);
      if (!res.ok) return { status: 'offline' };
      return await res.json();
    } catch {
      return { status: 'offline', activeProvider: 'offline' };
    }
  }
}
