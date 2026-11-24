/**
 * J.A.R.V.I.S. PREDICT - Sci-Fi Effects, Canvases, Radar & Audio Engine
 * High-performance, 60fps, responsive, respects prefers-reduced-motion & tab visibility
 */

/**
 * Web Audio Synthesizer (No external audio files needed)
 */
export class JarvisAudioSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.isInitialized = true;
      }
    } catch {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playBootSound() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(45, now);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 1.2);

      gain1.gain.setValueAtTime(0.01, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.6);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 1.2);

      osc1.connect(filter);
      filter.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 1.6);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.8);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 1.1);

      gain2.gain.setValueAtTime(0.001, now + 0.8);
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.95);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now + 0.8);
      osc2.stop(now + 1.3);
    } catch {}
  }

  playTypingClick() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = 1200 + (Math.random() * 200 - 100);
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  playAcceptSound() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      
      [587.33, 880, 1174.66].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.3);
      });
    } catch {}
  }

  playDismissSound() {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }
}

/**
 * Background Quantum Grid & Particles Canvas
 */
export class BackgroundCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 45;
    this.animId = null;
    this.isPaused = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (!this.isPaused && !this.animId) {
        this.animate();
      }
    });

    this.resize();
    this.initParticles();
    if (!this.reducedMotion) {
      this.animate();
    } else {
      this.drawStatic();
    }
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    if (this.reducedMotion) this.drawStatic();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
  }

  drawStatic() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
    this.ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x < this.width; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  animate() {
    if (this.isPaused || this.reducedMotion) {
      this.animId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)';
    this.ctx.lineWidth = 1;
    const step = 60;
    for (let x = 0; x < this.width; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    const pLen = this.particles.length;
    for (let i = 0; i < pLen; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      for (let j = i + 1; j < pLen; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 10000) {
          const dist = Math.sqrt(distSq);
          const lineAlpha = (1 - dist / 100) * 0.12;
          this.ctx.strokeStyle = `rgba(0, 229, 255, ${lineAlpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(this.animate);
  }
}

/**
 * Arc Reactor Orb in Header
 */
export class ArcReactorOrb {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.angle1 = 0;
    this.angle2 = 0;
    this.angle3 = 0;
    this.isThinking = false;
    this.glowIntensity = 0.5;
    this.targetGlow = 0.5;

    this.animate = this.animate.bind(this);
    this.animate();
  }

  setThinking(thinking) {
    this.isThinking = thinking;
    this.targetGlow = thinking ? 1.0 : 0.45;
  }

  animate() {
    if (document.hidden) {
      requestAnimationFrame(this.animate);
      return;
    }

    const speedMult = this.isThinking ? 3.0 : 1.0;
    this.angle1 += 0.015 * speedMult;
    this.angle2 -= 0.025 * speedMult;
    this.angle3 += 0.008 * speedMult;

    this.glowIntensity += (this.targetGlow - this.glowIntensity) * 0.1;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    this.ctx.clearRect(0, 0, w, h);

    const grad = this.ctx.createRadialGradient(cx, cy, 2, cx, cy, cx * 0.95);
    grad.addColorStop(0, `rgba(0, 229, 255, ${0.4 * this.glowIntensity})`);
    grad.addColorStop(0.5, `rgba(0, 180, 216, ${0.15 * this.glowIntensity})`);
    grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, cx * 0.95, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle1);
    this.ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 + this.glowIntensity * 0.4})`;
    this.ctx.lineWidth = 1.5;
    const outerR = cx * 0.85;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, outerR, 0, Math.PI * 2);
    this.ctx.stroke();

    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const x1 = Math.cos(a) * (outerR - 3);
      const y1 = Math.sin(a) * (outerR - 3);
      const x2 = Math.cos(a) * (outerR + 3);
      const y2 = Math.sin(a) * (outerR + 3);
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
    this.ctx.restore();

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle2);
    this.ctx.strokeStyle = `rgba(128, 216, 255, ${0.5 + this.glowIntensity * 0.5})`;
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 6]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, cx * 0.65, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle3);
    const innerR = cx * 0.45;
    this.ctx.fillStyle = `rgba(0, 229, 255, ${0.6 + this.glowIntensity * 0.4})`;
    for (let i = 0; i < 3; i++) {
      const a = (i * 2 * Math.PI) / 3;
      const px = Math.cos(a) * innerR;
      const py = Math.sin(a) * innerR;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#00e5ff';
    this.ctx.shadowBlur = 12 * this.glowIntensity;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 3 + this.glowIntensity * 1.5, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
    this.ctx.restore();

    requestAnimationFrame(this.animate);
  }
}

/**
 * Live Typing Speed Oscilloscope Waveform
 */
export class LiveWaveformVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.activity = 0;
    this.phase = 0;

    this.animate = this.animate.bind(this);
    this.animate();
  }

  pulse() {
    this.activity = Math.min(this.activity + 0.35, 1.0);
  }

  animate() {
    if (document.hidden) {
      requestAnimationFrame(this.animate);
      return;
    }

    this.phase += 0.08 + this.activity * 0.12;
    this.activity = Math.max(this.activity - 0.015, 0);

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cy = h / 2;

    this.ctx.clearRect(0, 0, w, h);

    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, cy);
    this.ctx.lineTo(w, cy);
    this.ctx.stroke();

    this.ctx.strokeStyle = this.activity > 0.4 ? '#00e5ff' : 'rgba(0, 229, 255, 0.6)';
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = '#00e5ff';
    this.ctx.shadowBlur = this.activity * 10;

    this.ctx.beginPath();
    const amplitude = 3 + this.activity * (h * 0.35);
    const frequency = 0.04 + this.activity * 0.03;

    for (let x = 0; x < w; x++) {
      const edgeFactor = Math.sin((x / w) * Math.PI);
      const y = cy + Math.sin(x * frequency + this.phase) * amplitude * edgeFactor
        + Math.sin(x * 0.08 - this.phase * 1.5) * (amplitude * 0.3) * edgeFactor;

      if (x === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;

    requestAnimationFrame(this.animate);
  }
}

/**
 * Full Neural Prediction Graph Visualizer
 * Modes:
 * 1. 'network' : Markov Transition Directed Network Graph (Root Node -> Branching Target Nodes + Flowing Laser Pulses)
 * 2. 'spectrum': Vertical Probability Distribution Histogram Bar Graph
 * 3. 'radar'   : Polar Radar Chart
 */
export class NeuralGraphVisualizer {
  constructor(canvas, onNodeClick = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onNodeClick = onNodeClick;

    this.mode = 'network'; // 'network' | 'spectrum' | 'radar'
    this.rootToken = 'START';
    this.items = [];
    this.currentValues = []; // animated radius/height values
    this.targetValues = [];
    this.particlePhase = 0;

    // Interactive clickable node bounds
    this.clickableNodes = [];
    this.hoveredNode = null;

    this.bindEvents();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      let found = null;
      for (const node of this.clickableNodes) {
        const dx = x - node.x;
        const dy = y - node.y;
        if (dx * dx + dy * dy <= node.r * node.r * 1.5) {
          found = node;
          break;
        }
      }
      this.hoveredNode = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';
    });

    this.canvas.addEventListener('click', (e) => {
      if (this.hoveredNode && this.onNodeClick) {
        this.onNodeClick(this.hoveredNode.word);
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredNode = null;
      this.canvas.style.cursor = 'default';
    });
  }

  setMode(mode) {
    if (['network', 'spectrum', 'radar'].includes(mode)) {
      this.mode = mode;
    }
  }

  setData(predictions, rootToken = '') {
    this.items = (predictions || []).slice(0, 5);
    this.rootToken = rootToken ? rootToken.trim() : 'START';
    if (this.rootToken.length > 8) this.rootToken = this.rootToken.slice(0, 7) + '..';

    this.targetValues = this.items.map(p => p.probability || 0.5);
    while (this.currentValues.length < this.targetValues.length) {
      this.currentValues.push(0);
    }
  }

  animate() {
    if (document.hidden) {
      requestAnimationFrame(this.animate);
      return;
    }

    const w = this.canvas.width;
    const h = this.canvas.height;
    this.ctx.clearRect(0, 0, w, h);

    // Smooth value interpolation
    for (let i = 0; i < this.targetValues.length; i++) {
      const target = this.targetValues[i];
      const cur = this.currentValues[i] || 0;
      this.currentValues[i] = cur + (target - cur) * 0.15;
    }

    this.particlePhase = (this.particlePhase + 0.02) % 1.0;
    this.clickableNodes = [];

    if (this.mode === 'network') {
      this.drawNetworkGraph(w, h);
    } else if (this.mode === 'spectrum') {
      this.drawSpectrumGraph(w, h);
    } else {
      this.drawRadarGraph(w, h);
    }

    requestAnimationFrame(this.animate);
  }

  /**
   * Mode 1: Directed Markov Transition Network Graph
   */
  drawNetworkGraph(w, h) {
    if (this.items.length === 0) {
      this.drawEmptyPlaceholder(w, h, 'AWAITING NEURAL CONTEXT');
      return;
    }

    const rootX = w * 0.20;
    const rootY = h * 0.50;
    const rootR = 24;

    // Root Node Glow & Core
    const grad = this.ctx.createRadialGradient(rootX, rootY, 4, rootX, rootY, rootR * 1.8);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(rootX, rootY, rootR * 1.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Root Circle Border
    this.ctx.strokeStyle = '#00e5ff';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(rootX, rootY, rootR, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = 'rgba(6, 22, 40, 0.9)';
    this.ctx.fill();

    // Root Label
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 10px "Orbitron", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(this.rootToken, rootX, rootY);

    // Target Candidates Nodes
    const count = this.items.length;
    const targetX = w * 0.76;
    const spacing = (h - 40) / Math.max(count, 1);

    for (let i = 0; i < count; i++) {
      const item = this.items[i];
      const prob = this.currentValues[i] || item.probability || 0.1;
      const targetY = 24 + i * spacing + spacing / 2;

      // Node radius based on confidence percentage
      const nodeR = Math.max(14, Math.min(22, 12 + prob * 14));

      // Draw Curved Branch Edge
      const cpX1 = rootX + (targetX - rootX) * 0.45;
      const cpY1 = rootY;
      const cpX2 = rootX + (targetX - rootX) * 0.55;
      const cpY2 = targetY;

      // Glowing edge line
      this.ctx.strokeStyle = i === 0 
        ? `rgba(0, 229, 255, ${0.4 + prob * 0.5})` 
        : `rgba(128, 216, 255, ${0.2 + prob * 0.35})`;
      this.ctx.lineWidth = Math.max(1.2, prob * 3.5);
      this.ctx.beginPath();
      this.ctx.moveTo(rootX + rootR, rootY);
      this.ctx.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, targetX - nodeR, targetY);
      this.ctx.stroke();

      // Flowing Energy Pulse particle along curve
      const t = (this.particlePhase + i * 0.22) % 1.0;
      const pt = this.getBezierPoint(rootX + rootR, rootY, cpX1, cpY1, cpX2, cpY2, targetX - nodeR, targetY, t);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#00e5ff';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;

      // Target Node Body
      const isHovered = this.hoveredNode && this.hoveredNode.index === i;
      this.clickableNodes.push({ x: targetX, y: targetY, r: nodeR, word: item.word, index: i });

      // Node background & stroke
      this.ctx.fillStyle = isHovered 
        ? 'rgba(0, 229, 255, 0.35)' 
        : (i === 0 ? 'rgba(0, 229, 255, 0.2)' : 'rgba(8, 26, 48, 0.85)');
      this.ctx.strokeStyle = isHovered ? '#ffffff' : (i === 0 ? '#00e5ff' : 'rgba(128, 216, 255, 0.6)');
      this.ctx.lineWidth = isHovered ? 2 : 1.2;

      this.ctx.beginPath();
      this.ctx.arc(targetX, targetY, nodeR, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Node text label (Word + Confidence)
      this.ctx.fillStyle = isHovered ? '#ffffff' : '#e6f6ff';
      this.ctx.font = '600 11px "Inter", "Noto Sans", sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      
      const displayWord = item.word.length > 10 ? item.word.slice(0, 9) + '..' : item.word;
      this.ctx.fillText(`${displayWord}`, targetX + nodeR + 8, targetY - 5);

      // Percentage sub-label
      this.ctx.fillStyle = i === 0 ? '#00e5ff' : 'rgba(144, 184, 212, 0.8)';
      this.ctx.font = '10px "Orbitron", monospace';
      this.ctx.fillText(`${Math.round(prob * 100)}% [${i + 1}]`, targetX + nodeR + 8, targetY + 8);
    }
  }

  /**
   * Mode 2: Probability Distribution Histogram Bar Graph
   */
  drawSpectrumGraph(w, h) {
    if (this.items.length === 0) {
      this.drawEmptyPlaceholder(w, h, 'SPECTRUM STANDBY');
      return;
    }

    const count = this.items.length;
    const paddingX = 35;
    const paddingBottom = 30;
    const paddingTop = 25;
    const chartH = h - paddingTop - paddingBottom;
    const barWidth = Math.min(36, (w - paddingX * 2) / count - 12);
    const spacing = (w - paddingX * 2) / count;

    // Baseline grid
    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(paddingX - 10, h - paddingBottom);
    this.ctx.lineTo(w - paddingX + 10, h - paddingBottom);
    this.ctx.stroke();

    for (let i = 0; i < count; i++) {
      const item = this.items[i];
      const prob = this.currentValues[i] || item.probability || 0.1;
      const barH = Math.max(8, prob * chartH);

      const x = paddingX + i * spacing + (spacing - barWidth) / 2;
      const y = h - paddingBottom - barH;

      const isHovered = this.hoveredNode && this.hoveredNode.index === i;
      this.clickableNodes.push({ x: x + barWidth / 2, y: y + barH / 2, r: barWidth / 2 + 6, word: item.word, index: i });

      // Bar gradient
      const grad = this.ctx.createLinearGradient(x, y, x, h - paddingBottom);
      if (i === 0) {
        grad.addColorStop(0, '#00e5ff');
        grad.addColorStop(1, 'rgba(0, 229, 255, 0.15)');
      } else {
        grad.addColorStop(0, '#80d8ff');
        grad.addColorStop(1, 'rgba(128, 216, 255, 0.1)');
      }

      this.ctx.fillStyle = isHovered ? 'rgba(0, 229, 255, 0.85)' : grad;
      this.ctx.fillRect(x, y, barWidth, barH);

      // Glowing top cap
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + barWidth, y);
      this.ctx.stroke();

      // Top percentage label
      this.ctx.fillStyle = '#00e5ff';
      this.ctx.font = '10px "Orbitron", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${Math.round(prob * 100)}%`, x + barWidth / 2, y - 6);

      // Bottom word label
      this.ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(230, 246, 255, 0.9)';
      this.ctx.font = '11px "Inter", "Noto Sans", sans-serif';
      const displayWord = item.word.length > 7 ? item.word.slice(0, 6) + '..' : item.word;
      this.ctx.fillText(displayWord, x + barWidth / 2, h - paddingBottom + 16);
    }
  }

  /**
   * Mode 3: Polar Radar Chart
   */
  drawRadarGraph(w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(cx, cy) * 0.72;

    const count = Math.max(this.items.length, 3);
    const angleStep = (Math.PI * 2) / count;

    // Background concentric rings
    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
    this.ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1.0].forEach(factor => {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, maxR * factor, 0, Math.PI * 2);
      this.ctx.stroke();
    });

    for (let i = 0; i < count; i++) {
      const angle = i * angleStep - Math.PI / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
      this.ctx.stroke();
    }

    if (this.items.length >= 2) {
      this.ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
      this.ctx.strokeStyle = '#00e5ff';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();

      for (let i = 0; i < this.items.length; i++) {
        const val = this.currentValues[i] || 0.1;
        const r = Math.max(val * maxR, maxR * 0.15);
        const angle = i * angleStep - Math.PI / 2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;

        if (i === 0) this.ctx.moveTo(px, py);
        else this.ctx.lineTo(px, py);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const val = this.currentValues[i] || 0.1;
        const r = Math.max(val * maxR, maxR * 0.15);
        const angle = i * angleStep - Math.PI / 2;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        const labelR = maxR + 14;
        const lx = cx + Math.cos(angle) * labelR;
        const ly = cy + Math.sin(angle) * labelR;

        this.ctx.fillStyle = 'rgba(128, 216, 255, 0.9)';
        this.ctx.font = '10px "Inter", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const displayWord = item.word.length > 7 ? item.word.slice(0, 6) + '..' : item.word;
        this.ctx.fillText(`${displayWord} (${Math.round((item.probability || 0) * 100)}%)`, lx, ly);

        this.clickableNodes.push({ x: px, y: py, r: 12, word: item.word, index: i });
      }
    } else {
      this.drawEmptyPlaceholder(w, h, 'RADAR STANDBY');
    }
  }

  drawEmptyPlaceholder(w, h, message) {
    this.ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    this.ctx.font = '10px "Orbitron", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(message, w / 2, h / 2);
  }

  getBezierPoint(x0, y0, x1, y1, x2, y2, x3, y3, t) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const x = uuu * x0 + 3 * uu * t * x1 + 3 * u * tt * x2 + ttt * x3;
    const y = uuu * y0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * y3;
    return { x, y };
  }
}

/**
 * Cyber Scramble Text Decrypter
 */
export class TextDecrypter {
  constructor() {
    this.glyphs = '01#@!$%^&*<>[]{}|~+=ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }

  scramble(finalWord, onUpdate, duration = 140) {
    if (!finalWord) return;
    const start = performance.now();
    const len = finalWord.length;

    const frame = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / duration, 1.0);

      const settledCount = Math.floor(progress * len);
      let output = '';

      for (let i = 0; i < len; i++) {
        if (i < settledCount || progress >= 1.0) {
          output += finalWord[i];
        } else {
          output += this.glyphs[Math.floor(Math.random() * this.glyphs.length)];
        }
      }

      onUpdate(output);

      if (progress < 1.0) {
        requestAnimationFrame(frame);
      } else {
        onUpdate(finalWord);
      }
    };

    requestAnimationFrame(frame);
  }
}

/**
 * Click Ripple Sparks (Cyan Quantum Sparks)
 */
export class SparkSparksBurst {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99999';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.sparks = [];
    this.animId = null;

    this.resize = this.resize.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.resize, { passive: true });
    this.resize();

    window.addEventListener('pointerdown', (e) => {
      this.spawnSparks(e.clientX, e.clientY);
    }, { passive: true });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  spawnSparks(x, y) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        decay: Math.random() * 0.04 + 0.03,
        size: Math.random() * 2 + 1
      });
    }

    if (!this.animId) {
      this.animate();
    }
  }

  animate() {
    if (this.sparks.length === 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animId = null;
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= s.decay;

      if (s.alpha <= 0) {
        this.sparks.splice(i, 1);
        continue;
      }

      this.ctx.fillStyle = `rgba(0, 229, 255, ${s.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.animId = requestAnimationFrame(this.animate);
  }
}

/**
 * Holographic 3D Tilt on Container
 */
export function setupHolographicTilt(element) {
  if (!element) return;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isFinePointer) return;

  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rotX = ((y - cy) / cy) * -4.0;
    const rotY = ((x - cx) / cx) * 4.0;

    element.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    element.style.setProperty('--cursor-x', `${x}px`);
    element.style.setProperty('--cursor-y', `${y}px`);
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  });
}
