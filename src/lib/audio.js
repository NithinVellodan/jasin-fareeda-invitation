// Background music: starts on the guest's first touch (browsers require a user gesture), fades via Web Audio
// (iOS ignores element.volume), pauses while the tab is hidden.

export class Music {
  constructor({ src = '', volume = 0.6, startAt = 0 } = {}) {
    this.volume = volume;
    this.startAt = startAt;
    this.available = Boolean(src);
    this.started = false;
    this.muted = false;
    this.listeners = new Set();
    if (!this.available) return;
    this.el = new Audio();
    this.el.preload = 'auto';
    this.el.loop = true;
    this.el.setAttribute('playsinline', '');
    this.el.src = src;
    this.el.addEventListener('error', () => {
      this.available = false;
      this.emit();
    });
    document.addEventListener('visibilitychange', () => {
      if (!this.started || this.muted) return;
      if (document.hidden) this.el.pause();
      else {
        this.ctx?.resume();
        this.el.play().catch(() => {});
      }
    });
  }

  onChange(fn) {
    this.listeners.add(fn);
  }

  emit() {
    this.listeners.forEach((fn) => fn(this));
  }

  // Resolves when enough audio is buffered to start smoothly (or after a short cap).
  preload(capMs = 3500) {
    if (!this.available) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      this.el.addEventListener('canplaythrough', done, { once: true });
      this.el.addEventListener('error', done, { once: true });
      setTimeout(done, capMs);
      this.el.load();
    });
  }

  start() {
    if (!this.available || this.started) return;
    this.started = true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !this.ctx) {
      try {
        this.ctx = new AC();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0;
        this.ctx.createMediaElementSource(this.el).connect(this.gain).connect(this.ctx.destination);
        this.ctx.resume();
      } catch {
        this.ctx = null;
        this.gain = null;
      }
    }
    this.ctx?.resume();
    if (!this.gain) this.el.volume = 0;
    if (this.startAt) {
      const seek = () => (this.el.currentTime = this.startAt);
      if (this.el.readyState >= 1) seek();
      else this.el.addEventListener('loadedmetadata', seek, { once: true });
    }
    this.el.play().catch(() => {
      // the browser did not count this touch as a gesture: the next one tries again
      this.started = false;
      this.emit();
    });
    this.fadeTo(this.volume, 2.8);
    this.emit();
  }

  fadeTo(value, seconds) {
    if (this.gain) {
      const t = this.ctx.currentTime;
      const g = this.gain.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(value, t + seconds);
      return;
    }
    const from = this.el.volume;
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / (seconds * 1000));
      this.el.volume = from + (value - from) * k;
      if (k < 1) requestAnimationFrame(step);
    };
    step();
  }

  toggle() {
    if (!this.started) return;
    this.muted = !this.muted;
    clearTimeout(this.pauseTimer);
    if (this.muted) {
      this.fadeTo(0, 0.4);
      this.pauseTimer = setTimeout(() => this.muted && this.el.pause(), 450);
    } else {
      this.ctx?.resume();
      this.el.play().catch(() => {});
      this.fadeTo(this.volume, 0.9);
    }
    this.emit();
  }

  get playing() {
    return this.started && !this.muted;
  }
}
