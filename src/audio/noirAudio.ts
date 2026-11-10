// Procedural Noir Jazz & SFX Synthesizer using Web Audio API (Zero external audio dependencies)

class NoirAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.6;
  private sfxVolume: number = 0.8;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;

  // Jazz scales and chords in C minor / Dorian noir
  // C, Eb, F, F#, G, Bb, D
  private readonly noirChords = [
    [130.81, 155.56, 196.00, 233.08], // Cm7
    [116.54, 146.83, 174.61, 207.65], // Bb7
    [103.83, 130.81, 155.56, 185.00], // Abmaj7
    [123.47, 146.83, 185.00, 220.00], // G7b9
    [87.31, 110.00, 130.81, 164.81],  // Fm7
  ];

  private readonly leadNotes = [
    261.63, 293.66, 311.13, 349.23, 369.99, 392.00, 466.16, 523.25
  ];

  private chordIndex = 0;
  private beatStep = 0;

  constructor() {
    // Lazy init on first user touch
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startMusic() {
    this.initCtx();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.startRainAtmosphere();
    this.scheduleJazzLoop();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.rainGain && this.ctx) {
      try {
        this.rainGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      } catch {}
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08 * this.musicVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private startRainAtmosphere() {
    if (!this.ctx || this.rainNode) return;
    // Generate pink noise buffer for rain
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to sound like rain against glass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08 * this.musicVolume, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);
    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  private scheduleJazzLoop() {
    if (!this.isMusicPlaying || !this.ctx) return;

    const tempo = 72; // slow moody noir tempo (BPM)
    const beatDuration = 60 / tempo; // ~0.833 sec

    if (!this.isMuted) {
      this.playJazzBeat(this.beatStep, this.chordIndex);
    }

    this.beatStep = (this.beatStep + 1) % 4;
    if (this.beatStep === 0) {
      this.chordIndex = (this.chordIndex + 1) % this.noirChords.length;
    }

    this.musicTimer = window.setTimeout(() => {
      this.scheduleJazzLoop();
    }, beatDuration * 1000);
  }

  private playJazzBeat(beat: number, chordIdx: number) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chord = this.noirChords[chordIdx];

    // 1. Walking Bass on every beat
    const rootFreq = chord[0] / 2; // sub octave
    const bassFreq = beat === 0 ? rootFreq : (beat === 2 ? chord[1] / 2 : (beat === 1 ? chord[2] / 2 : rootFreq * 1.12));
    this.synthBassNote(bassFreq, now, 0.5);

    // 2. Jazz Piano / Rhodes Chords on beat 0 and syncopated beat 2.5
    if (beat === 0) {
      chord.forEach((freq, idx) => {
        this.synthPianoNote(freq, now + idx * 0.02, 1.8, 0.12 * this.musicVolume);
      });
    } else if (beat === 2 && Math.random() > 0.4) {
      chord.forEach((freq, idx) => {
        this.synthPianoNote(freq * 1.002, now + idx * 0.015, 1.2, 0.09 * this.musicVolume);
      });
    }

    // 3. Noir Muted Trumpet / Saxophone Improvisation (occasional expressive phrase)
    if (beat === 1 && Math.random() > 0.45) {
      const note = this.leadNotes[Math.floor(Math.random() * this.leadNotes.length)];
      this.synthMutedHorn(note, now + 0.1, 1.2, 0.14 * this.musicVolume);
    } else if (beat === 3 && Math.random() > 0.6) {
      const note = this.leadNotes[Math.floor(Math.random() * this.leadNotes.length)];
      this.synthMutedHorn(note * 1.189, now, 0.9, 0.11 * this.musicVolume);
    }

    // 4. Subtle brushed jazz cymbal / snare brush
    if (beat % 2 === 1) {
      this.synthBrush(now, 0.04 * this.musicVolume);
    }
  }

  private synthBassNote(freq: number, time: number, duration: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, time);
    filter.frequency.exponentialRampToValueAtTime(90, time + duration);

    gain.gain.setValueAtTime(0.22 * this.musicVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthPianoNote(freq: number, time: number, duration: number, vol: number) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + duration);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  private synthMutedHorn(freq: number, time: number, duration: number, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Subtle jazz vibrato
    osc.frequency.setValueAtTime(freq * 0.98, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.15);

    // Bandpass to imitate cup mute trumpet/sax
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, time);
    filter.Q.setValueAtTime(3.5, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vol, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  private synthBrush(time: number, vol: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
  }

  // --- SOUND EFFECTS (SFX) ---
  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90 + Math.random() * 30, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, time);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.08);
  }

  public playElevatorChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    // Vintage dual-bell chime
    [1046.50, 1318.51].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + idx * 0.15);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, time + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.15 + 1.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time + idx * 0.15);
      osc.stop(time + idx * 0.15 + 1.4);
    });
  }

  public playClueFound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    // Noir detective discovery arpeggio
    [523.25, 622.25, 783.99, 987.77].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + idx * 0.09);
      gain.gain.setValueAtTime(0.22 * this.sfxVolume, time + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.09 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time + idx * 0.09);
      osc.stop(time + idx * 0.09 + 0.6);
    });
  }

  public playDialogueBlip() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320 + Math.random() * 80, time);
    gain.gain.setValueAtTime(0.05 * this.sfxVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.035);
  }

  public playDramaticChord() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    // Low sinister minor chord with brass edge
    [130.81, 155.56, 185.00, 261.63].forEach(freq => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 2.0);
    });
  }

  public playPageTurn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const time = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.08;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12 * this.sfxVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
  }
}

export const noirAudio = new NoirAudioEngine();
