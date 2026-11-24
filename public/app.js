/**
 * J.A.R.V.I.S. PREDICT // Main Application Controller
 * High-performance, production-quality, multilingual next-word prediction assistant
 */

import { MultilingualTokenizer, LocalNGramEngine, LLMProxyClient } from './engine.js';
import {
  JarvisAudioSynth,
  BackgroundCanvas,
  ArcReactorOrb,
  LiveWaveformVisualizer,
  NeuralGraphVisualizer,
  TextDecrypter,
  SparkSparksBurst,
  setupHolographicTilt
} from './effects.js';

class JarvisPredictApp {
  constructor() {
    // Core Engines
    this.tokenizer = new MultilingualTokenizer();
    this.localEngine = new LocalNGramEngine(this.tokenizer);
    this.llmClient = new LLMProxyClient();
    this.audio = new JarvisAudioSynth();
    this.decrypter = new TextDecrypter();

    // App State
    this.isComposing = false; // IME state (CJK/Indic keyboards)
    this.debounceTimer = null;
    this.debounceDelay = 150; // ms
    this.maxSuggestions = 5;
    this.currentPredictions = [];
    this.activeGhostWord = '';
    this.activeGhostFull = '';
    this.manualLanguage = 'auto';
    this.isLocalOnly = false;
    this.soundEnabled = true;

    // Analytics State
    this.suggestedCount = 0;
    this.acceptedCount = 0;
    this.wordsTypedCount = 0;
    this.keystrokesCount = 0;
    this.sessionStartTime = Date.now();
    this.lastKeystrokeTime = Date.now();

    // DOM Elements
    this.bindDOMElements();

    // Visualizers & Canvases
    this.initVisualizers();

    // Event Bindings
    this.bindEvents();

    // Start Clock
    this.startClock();

    // Run Cinematic Boot Sequence
    this.runBootSequence();

    // Check Backend Health
    this.checkBackendHealth();
  }

  bindDOMElements() {
    // Boot
    this.bootScreen = document.getElementById('bootScreen');
    this.bootProgressCircle = document.getElementById('bootProgressCircle');
    this.bootPercent = document.getElementById('bootPercent');
    this.bootConsoleLines = document.getElementById('bootConsoleLines');
    this.skipBootBtn = document.getElementById('skipBootBtn');

    // Header & HUD
    this.hudClock = document.getElementById('hudClock');
    this.modelStatusBadge = document.getElementById('modelStatusBadge');
    this.latencyBadge = document.getElementById('latencyBadge');
    this.langScriptBadge = document.getElementById('langScriptBadge');
    this.wordsTypedBadge = document.getElementById('wordsTypedBadge');
    this.langSelector = document.getElementById('langSelector');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.soundIconOn = document.getElementById('soundIconOn');
    this.soundIconOff = document.getElementById('soundIconOff');
    this.settingsModalBtn = document.getElementById('settingsModalBtn');
    this.connectionBadge = document.getElementById('connectionBadge');

    // Console Deck
    this.consoleDeck = document.getElementById('consoleDeck');
    this.editorViewport = document.getElementById('editorViewport');
    this.consoleInput = document.getElementById('consoleInput');
    this.editorBackdrop = document.getElementById('editorBackdrop');
    this.backdropPrefix = document.getElementById('backdropPrefix');
    this.ghostTextSpan = document.getElementById('ghostTextSpan');
    this.backdropSuffix = document.getElementById('backdropSuffix');
    this.lightSweepBar = document.getElementById('lightSweepBar');
    this.decodeOverlay = document.getElementById('decodeOverlay');

    // Controls
    this.voiceInputBtn = document.getElementById('voiceInputBtn');
    this.voiceBtnLabel = document.getElementById('voiceBtnLabel');
    this.speakTextBtn = document.getElementById('speakTextBtn');
    this.copyTextBtn = document.getElementById('copyTextBtn');
    this.copyBtnLabel = document.getElementById('copyBtnLabel');
    this.clearConsoleBtn = document.getElementById('clearConsoleBtn');

    // Predictions Chips
    this.predictionChipsCluster = document.getElementById('predictionChipsCluster');
    this.predictionMeta = document.getElementById('predictionMeta');

    // Analytics Cards
    this.wpmValue = document.getElementById('wpmValue');
    this.cpmValue = document.getElementById('cpmValue');
    this.accuracyValue = document.getElementById('accuracyValue');
    this.statSuggestedCount = document.getElementById('statSuggestedCount');
    this.statAcceptedCount = document.getElementById('statAcceptedCount');
    this.statTrainedCount = document.getElementById('statTrainedCount');
    this.statScriptText = document.getElementById('statScriptText');
    this.radarTopProb = document.getElementById('radarTopProb');

    // Modal
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.closeModalFooterBtn = document.getElementById('closeModalFooterBtn');
    this.localOnlyToggle = document.getElementById('localOnlyToggle');
    this.debounceRange = document.getElementById('debounceRange');
    this.debounceValueLabel = document.getElementById('debounceValueLabel');
    this.maxSuggestionsRange = document.getElementById('maxSuggestionsRange');
    this.maxSuggestionsLabel = document.getElementById('maxSuggestionsLabel');
    this.soundFxToggle = document.getElementById('soundFxToggle');
    this.resetModelBtn = document.getElementById('resetModelBtn');

    // Accessibility
    this.srAnnouncements = document.getElementById('srAnnouncements');
  }

  initVisualizers() {
    // Quantum background
    const bgCanvas = document.getElementById('bgCanvas');
    if (bgCanvas) this.bgVisualizer = new BackgroundCanvas(bgCanvas);

    // Arc reactor orb
    const reactorCanvas = document.getElementById('reactorCanvas');
    if (reactorCanvas) this.reactorOrb = new ArcReactorOrb(reactorCanvas);

    // Live typing waveform
    const waveformCanvas = document.getElementById('waveformCanvas');
    if (waveformCanvas) this.waveform = new LiveWaveformVisualizer(waveformCanvas);

    // Neural Prediction Graph visualizer
    const radarCanvas = document.getElementById('radarCanvas');
    if (radarCanvas) {
      this.graphVisualizer = new NeuralGraphVisualizer(radarCanvas, (word) => {
        this.acceptCandidate(word);
      });
      this.radarChart = this.graphVisualizer; // alias for backwards compatibility
    }

    // Click sparks
    this.sparks = new SparkSparksBurst();

    // Holographic tilt on console
    setupHolographicTilt(this.consoleDeck);
  }

  runBootSequence() {
    const logs = [
      '> INITIALIZING J.A.R.V.I.S. PROTOCOLS...',
      '> CALIBRATING MULTILINGUAL INTL TOKENIZER...',
      '> ENGAGING LOCAL N-GRAM SYNAPSES [TRIGRAM / BIGRAM]...',
      '> ESTABLISHING SECURE LLM HYBRID PROXY TUNNEL...',
      '> LOADING BROAD UNICODE SCRIPT DEFINITIONS...',
      '> SYSTEM ONLINE. ALL MODULES OPERATIONAL.'
    ];

    let step = 0;
    const totalSteps = logs.length;
    const interval = 450; // ~2.7s total

    const advanceBoot = () => {
      step++;
      const percent = Math.min(Math.round((step / totalSteps) * 100), 100);
      
      // Update circular ring offset (201 is perimeter)
      if (this.bootProgressCircle) {
        const offset = 201 - (201 * percent) / 100;
        this.bootProgressCircle.style.strokeDashoffset = offset;
      }
      if (this.bootPercent) {
        this.bootPercent.textContent = `${percent}%`;
      }

      if (step < logs.length) {
        const line = document.createElement('div');
        line.className = 'boot-line';
        line.textContent = logs[step];
        this.bootConsoleLines.appendChild(line);
      }

      if (step >= totalSteps) {
        this.finishBoot();
      } else {
        this._bootTimeout = setTimeout(advanceBoot, interval);
      }
    };

    this._bootTimeout = setTimeout(advanceBoot, 300);

    this.skipBootBtn.addEventListener('click', () => {
      this.finishBoot();
    });
  }

  finishBoot() {
    if (this._bootTimeout) clearTimeout(this._bootTimeout);
    this.audio.init();
    if (this.soundEnabled) this.audio.playBootSound();

    this.bootScreen.classList.add('fade-out');
    document.body.classList.remove('booting');

    setTimeout(() => {
      this.bootScreen.style.display = 'none';
      this.consoleInput.focus();
      // Initial trigger for starters
      this.handleInputOrFocus();
    }, 600);
  }

  bindEvents() {
    // Enable audio on first interaction anywhere
    const unlockAudio = () => {
      this.audio.init();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    // IME Composition listeners (Essential for Chinese, Japanese, Korean, Indic keyboards)
    this.consoleInput.addEventListener('compositionstart', () => {
      this.isComposing = true;
      this.clearGhostText();
    });

    this.consoleInput.addEventListener('compositionend', (e) => {
      this.isComposing = false;
      this.handleInput(e);
    });

    // Console Input & Keystrokes
    this.consoleInput.addEventListener('input', (e) => this.handleInput(e));
    this.consoleInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.consoleInput.addEventListener('focus', () => this.handleInputOrFocus());
    this.consoleInput.addEventListener('click', () => this.syncGhostPosition());
    this.consoleInput.addEventListener('scroll', () => this.syncScroll());

    // Graph Mode Switcher Tabs
    const graphTabBtns = document.querySelectorAll('.graph-tab-btn');
    const graphBadge = document.getElementById('graphActiveModeBadge');
    graphTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.graphMode;
        graphTabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        if (this.graphVisualizer) {
          this.graphVisualizer.setMode(mode);
        }
        if (graphBadge) {
          const labels = { network: 'MARKOV TREE', spectrum: 'PROB BARS', radar: 'POLAR RADAR' };
          graphBadge.textContent = labels[mode] || mode.toUpperCase();
        }
      });
    });

    // Language Selector Override
    this.langSelector.addEventListener('change', (e) => {
      this.manualLanguage = e.target.value;
      this.handleInputOrFocus();
    });

    // Action Buttons
    this.voiceInputBtn.addEventListener('click', () => this.toggleVoiceDictation());
    this.speakTextBtn.addEventListener('click', () => this.speakCompletedText());
    this.copyTextBtn.addEventListener('click', () => this.copyToClipboard());
    this.clearConsoleBtn.addEventListener('click', () => this.clearConsole());

    // Sound Toggle
    this.soundToggleBtn.addEventListener('click', () => this.toggleSound());

    // Settings Modal
    this.settingsModalBtn.addEventListener('click', () => this.openSettings());
    this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    this.closeModalFooterBtn.addEventListener('click', () => this.closeSettings());
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.closeSettings();
    });

    // Setting inputs
    this.localOnlyToggle.addEventListener('change', (e) => {
      this.isLocalOnly = e.target.checked;
      this.llmClient.setLocalOnly(this.isLocalOnly);
      this.updateModelStatusDisplay();
    });

    this.debounceRange.addEventListener('input', (e) => {
      this.debounceDelay = parseInt(e.target.value, 10);
      this.debounceValueLabel.textContent = this.debounceDelay;
    });

    this.maxSuggestionsRange.addEventListener('input', (e) => {
      this.maxSuggestions = parseInt(e.target.value, 10);
      this.maxSuggestionsLabel.textContent = this.maxSuggestions;
      this.handleInputOrFocus();
    });

    this.soundFxToggle.addEventListener('change', (e) => {
      this.soundEnabled = e.target.checked;
      this.audio.enabled = this.soundEnabled;
      this.updateSoundIcons();
    });

    this.resetModelBtn.addEventListener('click', () => {
      if (confirm('Reset J.A.R.V.I.S. local n-gram memory to factory seed corpora?')) {
        this.localEngine.clearModel();
        this.updateStatsDisplay();
        this.handleInputOrFocus();
      }
    });

    // Keyboard hotkeys 1-5 for predictions
    window.addEventListener('keydown', (e) => {
      if (document.activeElement === this.consoleInput) {
        if ((e.altKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
          const idx = parseInt(e.key, 10) - 1;
          if (this.currentPredictions[idx]) {
            e.preventDefault();
            this.acceptCandidate(this.currentPredictions[idx].word);
          }
        }
      }
    });
  }

  syncScroll() {
    this.editorBackdrop.scrollTop = this.consoleInput.scrollTop;
    this.editorBackdrop.scrollLeft = this.consoleInput.scrollLeft;
  }

  startClock() {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      this.hudClock.textContent = `${h}:${m}:${s}`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  async checkBackendHealth() {
    const health = await this.llmClient.checkHealth();
    if (health.status === 'online') {
      this.connectionBadge.textContent = 'SYSTEM ONLINE';
      this.connectionBadge.className = 'footer-status-pill online';
      if (!this.isLocalOnly && (health.activeProvider === 'distilgpt2' || health.activeProvider === 'chatty-claude' || health.activeProvider === 'claude' || health.activeProvider === 'grok' || health.activeProvider === 'gemini' || health.activeProvider === 'openai')) {
        let providerName = 'DISTILGPT-2';
        if (health.activeProvider === 'chatty-claude') providerName = 'CHATTY CLAUDE';
        else if (health.activeProvider !== 'distilgpt2') providerName = health.activeProvider.toUpperCase();
        this.modelStatusBadge.textContent = `● HYBRID (${providerName} + LOCAL)`;
        this.modelStatusBadge.className = 'telemetry-value active-cyan';
      } else {
        this.modelStatusBadge.textContent = '● LOCAL N-GRAM';
        this.modelStatusBadge.className = 'telemetry-value active-cyan';
      }
    } else {
      this.connectionBadge.textContent = 'OFFLINE / LOCAL';
      this.connectionBadge.className = 'footer-status-pill offline';
      this.modelStatusBadge.textContent = '● LOCAL N-GRAM (OFFLINE)';
      this.modelStatusBadge.className = 'telemetry-value';
    }
  }

  updateModelStatusDisplay() {
    if (this.isLocalOnly) {
      this.modelStatusBadge.textContent = '● LOCAL-ONLY MODE';
      this.modelStatusBadge.className = 'telemetry-value';
      this.latencyBadge.textContent = '0 ms';
    } else {
      this.checkBackendHealth();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.audio.enabled = this.soundEnabled;
    this.soundFxToggle.checked = this.soundEnabled;
    this.updateSoundIcons();
  }

  updateSoundIcons() {
    if (this.soundEnabled) {
      this.soundIconOn.classList.remove('hidden');
      this.soundIconOff.classList.add('hidden');
    } else {
      this.soundIconOn.classList.add('hidden');
      this.soundIconOff.classList.remove('hidden');
    }
  }

  openSettings() {
    this.settingsModal.classList.remove('hidden');
  }

  closeSettings() {
    this.settingsModal.classList.add('hidden');
    this.consoleInput.focus();
  }

  /**
   * Handle user typing in console
   */
  handleInput(e) {
    if (this.isComposing) return; // Do not interrupt IME

    // Waveform & Audio dynamics
    if (this.waveform) this.waveform.pulse();
    if (this.soundEnabled) this.audio.playTypingClick();

    // Track analytics
    this.keystrokesCount++;
    this.updateTypingMetrics();

    // Check if immediate prediction should fire (e.g., right after a space)
    const val = this.consoleInput.value;
    const cursorPos = this.consoleInput.selectionEnd;
    const lastChar = val.slice(cursorPos - 1, cursorPos);
    const isImmediate = lastChar === ' ' || lastChar === '\n';

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    if (isImmediate) {
      // Immediate prediction on space!
      this.executePredictionFlow();
    } else {
      // Debounce prediction on pause (~150ms)
      this.debounceTimer = setTimeout(() => {
        this.executePredictionFlow();
      }, this.debounceDelay);
    }

    // Train local engine on completed sentences
    if (lastChar === '.' || lastChar === '?' || lastChar === '!' || lastChar === '।') {
      this.localEngine.trainText(val, this.getActiveLanguage());
      this.updateStatsDisplay();
    }
  }

  handleInputOrFocus() {
    if (this.isComposing) return;
    this.executePredictionFlow();
  }

  /**
   * Primary Prediction Flow (Two Layers: Layer 1 Local -> Layer 2 LLM)
   */
  async executePredictionFlow() {
    const text = this.consoleInput.value;
    const cursorPos = this.consoleInput.selectionEnd;
    const context = text.slice(0, cursorPos);

    // Multi-language & Script Auto-Detection
    const detection = this.tokenizer.detectScriptAndLanguage(text || 'hello');
    const activeLang = this.manualLanguage !== 'auto' ? this.manualLanguage : detection.lang;
    const isRTL = detection.isRTL || activeLang === 'ar' || activeLang === 'he';

    // Update RTL and Language Badge in HUD
    this.updateLanguageHUD(detection, activeLang, isRTL);

    // Pulse reactor orb to thinking mode
    if (this.reactorOrb) this.reactorOrb.setThinking(true);
    this.consoleDeck.classList.add('predicting');

    // -----------------------------------------------------------------
    // LAYER 1: Instant Local N-Gram Prediction (0ms execution)
    // -----------------------------------------------------------------
    const localStart = performance.now();
    const localPredictions = this.localEngine.predict(context, activeLang, this.maxSuggestions);
    const localLatency = Math.round(performance.now() - localStart);

    if (localPredictions.length > 0) {
      this.applyPredictions(localPredictions, 'local', localLatency);
    }

    // -----------------------------------------------------------------
    // LAYER 2: LLM Model via Proxy (Asynchronous upgrade with AbortController)
    // -----------------------------------------------------------------
    if (!this.isLocalOnly) {
      try {
        const llmResult = await this.llmClient.requestPredictions(
          context,
          activeLang,
          detection.script,
          this.maxSuggestions
        );

        if (llmResult && !llmResult.offline && Array.isArray(llmResult.predictions) && llmResult.predictions.length > 0) {
          // Seamlessly upgrade predictions with LLM result!
          this.applyPredictions(llmResult.predictions, llmResult.provider || 'llm', llmResult.latencyMs);
          this.triggerLightSweep();
        } else if (llmResult && llmResult.offline) {
          this.latencyBadge.textContent = `${localLatency} ms`;
        }
      } catch (err) {
        // Silently fall back to Layer 1 local predictions
      }
    }

    // Calm reactor orb
    if (this.reactorOrb) this.reactorOrb.setThinking(false);
    this.consoleDeck.classList.remove('predicting');
  }

  updateLanguageHUD(detection, activeLang, isRTL) {
    // Set direction on console and mirror
    const dir = isRTL ? 'rtl' : 'ltr';
    this.consoleInput.dir = dir;
    this.editorBackdrop.dir = dir;

    // Badge text
    const scriptName = detection.script || 'Latin';
    const langUpper = activeLang.toUpperCase();
    this.langScriptBadge.textContent = `LANG: ${langUpper} · ${scriptName}${isRTL ? ' (RTL)' : ''}`;
    this.statScriptText.textContent = `${scriptName} [${dir.toUpperCase()}]`;
  }

  /**
   * Apply predictions to ghost text, chips bar, radar chart, and ARIA
   */
  applyPredictions(predictions, source = 'local', latencyMs = 0) {
    if (!predictions || predictions.length === 0) {
      this.clearGhostText();
      this.renderChips([]);
      return;
    }

    this.currentPredictions = predictions;
    this.suggestedCount++;
    this.updateStatsDisplay();

    // Update latency in HUD
    this.latencyBadge.textContent = `${latencyMs} ms`;

    // Candidate 1 becomes the ghost text
    const topCandidate = predictions[0];
    this.activeGhostWord = topCandidate.word;
    this.activeGhostFull = topCandidate.word;

    // Render ghost text inline at cursor
    this.renderGhostText(this.activeGhostWord);

    // Render clickable candidate chips
    this.renderChips(predictions);

    // Extract root token from previous word
    const textBefore = this.consoleInput.value.slice(0, this.consoleInput.selectionEnd).trim();
    const tokens = this.tokenizer.tokenize(textBefore, this.getActiveLanguage());
    const rootToken = tokens.length > 0 ? tokens[tokens.length - 1] : 'START';

    // Update confidence radar & neural graph
    if (this.graphVisualizer) this.graphVisualizer.setData(predictions, rootToken);
    else if (this.radarChart) this.radarChart.setPredictions(predictions);

    if (this.radarTopProb) {
      this.radarTopProb.textContent = `${Math.round(topCandidate.probability * 100)}% (${topCandidate.word})`;
    }

    // Announce to screen reader polite region
    if (this.srAnnouncements) {
      this.srAnnouncements.textContent = `Prediction: ${topCandidate.word}`;
    }

    this.predictionMeta.textContent = `${source.toUpperCase()} // ${predictions.length} CANDIDATES`;
  }

  renderGhostText(suggestionWord) {
    const val = this.consoleInput.value;
    const cursorPos = this.consoleInput.selectionEnd;

    const prefix = val.slice(0, cursorPos);
    const suffix = val.slice(cursorPos);

    // Check if prefix ends with a space or needs leading space
    const needsSpace = prefix.length > 0 && !/\s$/.test(prefix) && !/^[\s\p{P}]/u.test(suggestionWord);
    const displayGhost = (needsSpace ? ' ' : '') + suggestionWord;

    this.backdropPrefix.textContent = prefix;
    this.ghostTextSpan.textContent = displayGhost;
    this.backdropSuffix.textContent = suffix;

    this.syncScroll();
  }

  clearGhostText() {
    this.activeGhostWord = '';
    this.activeGhostFull = '';
    this.ghostTextSpan.textContent = '';
  }

  syncGhostPosition() {
    if (this.activeGhostWord) {
      this.renderGhostText(this.activeGhostWord);
    }
  }

  renderChips(predictions) {
    this.predictionChipsCluster.innerHTML = '';

    if (!predictions || predictions.length === 0) {
      const hint = document.createElement('div');
      hint.className = 'chip empty-hint';
      hint.textContent = 'Type to generate predictions...';
      this.predictionChipsCluster.appendChild(hint);
      return;
    }

    predictions.slice(0, this.maxSuggestions).forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.className = 'chip-btn';
      btn.type = 'button';
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-label', `Select prediction ${p.word}, probability ${Math.round(p.probability * 100)}%`);

      const mainRow = document.createElement('div');
      mainRow.className = 'chip-main-row';

      const wordSpan = document.createElement('span');
      wordSpan.className = 'chip-word';
      wordSpan.textContent = p.word;

      const hotkey = document.createElement('span');
      hotkey.className = 'chip-hotkey';
      hotkey.textContent = `[${idx + 1}]`;

      mainRow.appendChild(wordSpan);
      mainRow.appendChild(hotkey);

      const probLabel = document.createElement('div');
      probLabel.className = 'chip-prob-label';
      probLabel.textContent = `${Math.round(p.probability * 100)}%`;

      const bar = document.createElement('div');
      bar.className = 'chip-confidence-bar';
      bar.style.width = `${Math.round(p.probability * 100)}%`;

      btn.appendChild(mainRow);
      btn.appendChild(probLabel);
      btn.appendChild(bar);

      btn.addEventListener('click', () => {
        this.acceptCandidate(p.word);
      });

      this.predictionChipsCluster.appendChild(btn);
    });
  }

  triggerLightSweep() {
    if (this.lightSweepBar) {
      this.lightSweepBar.classList.remove('sweep-active');
      void this.lightSweepBar.offsetWidth; // trigger reflow
      this.lightSweepBar.classList.add('sweep-active');
    }
  }

  /**
   * Keyboard Interaction Handling: Tab, Ctrl+Right, Esc
   */
  handleKeyDown(e) {
    if (this.isComposing) return;

    // [Tab] -> Accept whole ghost suggestion
    if (e.key === 'Tab') {
      if (this.activeGhostWord) {
        e.preventDefault();
        this.acceptCandidate(this.activeGhostWord);
      }
      return;
    }

    // [Ctrl + ArrowRight] or [Alt + ArrowRight] -> Accept next one word of suggestion
    if ((e.ctrlKey || e.altKey || e.metaKey) && e.key === 'ArrowRight') {
      if (this.activeGhostWord) {
        e.preventDefault();
        // Extract first word token
        const tokens = this.tokenizer.tokenize(this.activeGhostWord, this.getActiveLanguage());
        const wordToAccept = tokens.length > 0 ? tokens[0] : this.activeGhostWord;
        this.acceptCandidate(wordToAccept);
      }
      return;
    }

    // [Escape] -> Dismiss suggestion
    if (e.key === 'Escape') {
      if (this.activeGhostWord) {
        e.preventDefault();
        this.clearGhostText();
        if (this.soundEnabled) this.audio.playDismissSound();
      }
      return;
    }
  }

  /**
   * Accept word candidate with cyber scramble decode animation
   */
  acceptCandidate(wordToInsert) {
    if (!wordToInsert) return;

    const val = this.consoleInput.value;
    const cursorPos = this.consoleInput.selectionEnd;
    const prefix = val.slice(0, cursorPos);
    const suffix = val.slice(cursorPos);

    const needsSpace = prefix.length > 0 && !/\s$/.test(prefix) && !/^[\s\p{P}]/u.test(wordToInsert);
    const insertedChunk = (needsSpace ? ' ' : '') + wordToInsert + ' ';

    // Update textarea content and caret
    this.consoleInput.value = prefix + insertedChunk + suffix;
    const newPos = cursorPos + insertedChunk.length;
    this.consoleInput.setSelectionRange(newPos, newPos);

    // Audio & Analytics
    if (this.soundEnabled) this.audio.playAcceptSound();
    this.acceptedCount++;
    this.updateStatsDisplay();

    // Train local engine on accepted selection!
    this.localEngine.trainText(wordToInsert, this.getActiveLanguage());

    // Run cyber decode scramble animation
    this.triggerDecodeAnimation(wordToInsert);

    // Clear ghost and immediately predict next word
    this.clearGhostText();
    this.executePredictionFlow();
  }

  triggerDecodeAnimation(word) {
    if (!this.decodeOverlay) return;
    this.decodeOverlay.classList.remove('hidden');
    this.decodeOverlay.textContent = word;

    this.decrypter.scramble(word, (currentText) => {
      this.decodeOverlay.textContent = currentText;
    }, 120);

    setTimeout(() => {
      this.decodeOverlay.classList.add('hidden');
    }, 180);
  }

  getActiveLanguage() {
    if (this.manualLanguage !== 'auto') return this.manualLanguage;
    return this.tokenizer.detectScriptAndLanguage(this.consoleInput.value).lang;
  }

  updateTypingMetrics() {
    const text = this.consoleInput.value;
    const words = this.tokenizer.tokenize(text, this.getActiveLanguage());
    this.wordsTypedCount = words.length;
    this.wordsTypedBadge.textContent = this.wordsTypedCount;

    const elapsedMin = Math.max((Date.now() - this.sessionStartTime) / 60000, 0.05);
    const wpm = Math.round(this.wordsTypedCount / elapsedMin);
    const cpm = Math.round(this.keystrokesCount / elapsedMin);

    this.wpmValue.textContent = `${wpm} WPM`;
    this.cpmValue.textContent = `${cpm} CPM`;
  }

  updateStatsDisplay() {
    this.statSuggestedCount.textContent = this.suggestedCount;
    this.statAcceptedCount.textContent = this.acceptedCount;
    this.statTrainedCount.textContent = this.localEngine.totalWordsTrained;

    const accuracy = this.suggestedCount > 0 
      ? Math.round((this.acceptedCount / this.suggestedCount) * 100)
      : 100;
    this.accuracyValue.textContent = `${accuracy}% ACCURACY`;
  }

  /**
   * Voice Input (Web Speech API)
   */
  toggleVoiceDictation() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Speech Recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
      return;
    }

    this.recognition = new SpeechRec();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.getActiveLanguage();

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.voiceInputBtn.classList.add('recording');
      this.voiceBtnLabel.textContent = 'LISTENING...';
    };

    this.recognition.onresult = (e) => {
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        const val = this.consoleInput.value;
        this.consoleInput.value = val + (val.length > 0 && !/\s$/.test(val) ? ' ' : '') + finalTranscript;
        this.handleInputOrFocus();
      }
    };

    this.recognition.onerror = () => {
      this.stopVoice();
    };

    this.recognition.onend = () => {
      this.stopVoice();
    };

    this.recognition.start();
  }

  stopVoice() {
    this.isRecording = false;
    this.voiceInputBtn.classList.remove('recording');
    this.voiceBtnLabel.textContent = 'VOICE';
  }

  /**
   * Voice of JARVIS: Speech Synthesis
   */
  speakCompletedText() {
    const text = this.consoleInput.value.trim();
    if (!text) return;

    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.getActiveLanguage();
    utterance.rate = 1.0;
    utterance.pitch = 0.95; // Sophisticated tone

    // Try finding robotic/JARVIS-like voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith(utterance.lang) && (v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Natural')));
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  }

  async copyToClipboard() {
    const text = this.consoleInput.value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      this.copyBtnLabel.textContent = 'COPIED!';
      setTimeout(() => {
        this.copyBtnLabel.textContent = 'COPY';
      }, 1500);
    } catch {
      // Fallback
      this.consoleInput.select();
      document.execCommand('copy');
      this.copyBtnLabel.textContent = 'COPIED!';
      setTimeout(() => {
        this.copyBtnLabel.textContent = 'COPY';
      }, 1500);
    }
  }

  clearConsole() {
    if (this.consoleInput.value.trim().length > 0) {
      this.consoleInput.value = '';
      this.clearGhostText();
      this.renderChips([]);
      this.handleInputOrFocus();
    }
  }
}

// Boot application upon DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.jarvisApp = new JarvisPredictApp();
});
