# 🌐 J.A.R.V.I.S. PREDICT // Next-Word Neural Prediction Assistant

> **STARK INDUSTRIES // MARK VII OS**  
> A professional, production-quality, real-time next-word prediction assistant that suggests words inline as you write in **ANY language and script**.

---

## ⚡ Highlights & Key Features

- **Dual-Layer Prediction Architecture**:
  - **Layer 1 (Instant Local N-Gram)**: 1-gram, 2-gram, and 3-gram model executing in **0 ms**. Continuously learns from the user's keystrokes and completed sentences, persisted in `localStorage`. Pre-seeded with rich multilingual starter corpora.
  - **Layer 2 (LLM API Proxy)**: Calls Google Gemini or OpenAI through a secure Node/Express backend proxy. The client sends the last ~200 characters of context with strict JSON instructions. **API keys are NEVER exposed to the browser**.
  - **Seamless Layer Merging**: Displays the local prediction instantly, then seamlessly upgrades when the LLM answer arrives.
  - **Graceful Fallback & Local-Only Mode**: If offline or if the API fails, it silently falls back to Layer 1. Includes a 1-click **"Local-Only Mode"** toggle in Settings that halts all network transmissions for 100% on-device privacy.
- **True Multi-Language & Multi-Script Coverage**:
  - English, Hindi (हिन्दी), Arabic (العربية), Japanese (日本語), Gujarati (ગુજરાતી), Marathi (मराठी), Hebrew (עברית), Chinese (中文), Korean (한국어), Russian (Русский), Spanish, French, German, and more.
  - **Intl.Segmenter Tokenization**: Handles word boundaries in non-space languages (Japanese, Chinese, Thai).
  - **Bidirectional & RTL Mirroring**: Full support for right-to-left scripts (Arabic, Hebrew) with dynamic `dir="rtl"` and mirrored ghost-text overlay.
  - **IME Composition Guard**: Actively tracks `compositionstart` and `compositionend` so prediction never interferes with complex CJK or Indic input method editors.
  - **Unicode-Safe String Operations**: Full support for combining marks (`\p{M}`), surrogate pairs, and astral Unicode planes.
- **Authentic J.A.R.V.I.S. Holographic Interface**:
  - **Color Palette**: Deep space `#03080f`, arc-reactor cyan `#00e5ff`, ice blue `#80d8ff`, and amber warning accents `#ffb300`.
  - **Interactive Arc-Reactor Orb**: Multi-ring animated canvas reactor in the header that pulses brighter and spins faster when thinking, and calms when idle.
  - **Cinematic Boot Sequence**: ~3s "SYSTEM ONLINE" boot sequence with typing logs, circular progress ring, and a skip button.
  - **Live Typing Waveform (Oscilloscope)**: Real-time canvas oscilloscope line reacting to typing speed (WPM/CPM) and keystroke dynamics.
  - **Confidence Radar Chart**: Polar chart animating probabilities across candidate predictions.
  - **Cyber Scramble Decode Effect**: Accepted predictions decrypt with a high-speed matrix glitch scramble before settling.
  - **Cyan Spark Bursts & Holographic Tilt**: Interactive pointer spark ripples and 3D parallax on panels.
  - **Web Audio Sound Synthesizer**: Pure Web Audio API synthesizing futuristic boot hums, typing blips, and harmonic chimes (no external audio files required).
- **Accessibility & Performance**:
  - Keyboard accessible (`Tab`, `Ctrl+→`, `Esc`, `1-5`).
  - Screen-reader friendly with ARIA live regions and semantic landmarks.
  - 44px minimum touch targets and responsive mobile/tablet layout.
  - Respects `prefers-reduced-motion` and pauses canvas animations when the browser tab is hidden.

---

## 🏗️ Architecture

```
                                [ User Typing in Console ]
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
          [ Layer 1: Local Engine ]                     [ Layer 2: LLM Proxy ]
       • Intl.Segmenter Tokenization               • Context window: last ~200 chars
       • Trigram / Bigram / Unigram                • AbortController (cancels stale calls)
       • Live Keystroke Learning                   • Strict JSON schema: { predictions }
       • Zero-latency (0 ms)                       • POST /api/predict -> Express Proxy
                     │                                             │
                     ▼                                             ▼
          [ Immediate Display ] ──────────────► [ Seamless Upgrade (120-250 ms) ]
          (Ghost Text + Radar + Chips)                (Light Sweep Laser Effect)
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+ installed.

### 2. Installation
Clone or navigate to the project directory:
```bash
cd "bigram model"
npm install
```

### 3. Configure API Key (Optional for LLM Mode)
Copy the example environment file:
```bash
cp .env.example .env
```
Open `.env` and add your preferred API key:
```env
PORT=3000

# Choose provider: "gemini", "openai", or "auto"
LLM_PROVIDER=auto

# Free Google Gemini API Key (Get at https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Or OpenAI API Key:
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```
> **Note**: If no API key is provided, J.A.R.V.I.S. operates in **100% offline Local N-Gram Mode** with pre-seeded multilingual intelligence and continuous self-learning.

### 4. Start the Application
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## ⌨️ Keyboard Shortcuts Reference

| Key Combination | Action |
| :--- | :--- |
| <kbd>Tab</kbd> | Accept the full ghost-text suggestion |
| <kbd>Ctrl</kbd> + <kbd>&rarr;</kbd> or <kbd>Cmd</kbd> + <kbd>&rarr;</kbd> | Accept one word at a time |
| <kbd>Esc</kbd> | Dismiss ghost-text suggestion |
| <kbd>Alt</kbd> / <kbd>Cmd</kbd> + <kbd>1</kbd>..kbd>5</kbd> | Select candidate chip 1 to 5 directly |
| Click on Chip | Insert candidate with cyber decode animation |

---

## 🧪 Verified Languages & Test Cases

The included test suite (`npm test`) verifies predictions across major scripts:

| Language | Script | Direction | Tokenizer | Context Tested | Top Prediction |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **English** | Latin | LTR | Intl.Segmenter | `"I would like"` | `"to"` (62%) |
| **Hindi** | Devanagari | LTR | Intl.Segmenter | `"आप कैसे"` | `"हैं"` (62%) |
| **Arabic** | Arabic | **RTL** | Intl.Segmenter | `"السلام"` | `"عليكم"` (52%) |
| **Japanese**| Japanese | LTR | Intl.Segmenter | `"よろしく"` | `"お願い"` (52%) |

Run the automated test suite anytime:
```bash
npm test
```

---

## 🛡️ Privacy & Security
- **No Client-Side Secrets**: All API keys remain strictly on the backend inside `.env`.
- **Minimal Context Transmission**: When LLM mode is active, only the preceding ~200 characters of text are sent over HTTPS.
- **Local-Only Mode**: Users can toggle on "Local-Only Mode" in Settings at any time to guarantee that zero keystrokes or text leave their device.
- **Data Persistence**: Learned n-grams are stored purely in the user's browser `localStorage` and can be wiped with one click using the "Reset Memory" button.

---

## 📁 Project Structure

```
├── package.json              # Project scripts and dependencies
├── .env.example              # Environment variables template
├── .env                      # Active environment configuration
├── server/
│   └── index.js              # Express proxy server with LLM & static hosting
├── public/
│   ├── index.html            # Semantic accessible HUD layout & boot screen
│   ├── styles.css            # High-tech HUD styling, responsive & RTL CSS
│   ├── engine.js             # Tokenizer, script detection, N-Gram engine, LLM client
│   ├── effects.js            # Web Audio synth, arc reactor, waveform, radar, decrypter
│   └── app.js                # Main application orchestrator & event bindings
├── test/
│   ├── multilang.test.js     # Multilingual unit test suite (EN, HI, AR, JA)
│   └── server.test.js        # API endpoints integration test
└── README.md                 # System documentation & setup guide
```
