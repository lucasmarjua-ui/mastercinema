// Efectos de sonido sintetizados con Web Audio API. Sin archivos de audio externos.
const MUTE_KEY = 'mastercinema.audio-muted';
let context;
let tickTimer;

function muted() { return localStorage.getItem(MUTE_KEY) === '1'; }
function getContext() {
  context ||= new (window.AudioContext || window.webkitAudioContext)();
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone({ frequency, endFrequency, duration, type = 'sine', delay = 0, gain = 0.09, detune = 0 }) {
  const audio = getContext();
  const oscillator = audio.createOscillator();
  const gainNode = audio.createGain();
  oscillator.type = type;
  oscillator.detune.value = detune;
  oscillator.frequency.setValueAtTime(frequency, audio.currentTime + delay);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, audio.currentTime + delay + duration);
  gainNode.gain.setValueAtTime(0.0001, audio.currentTime + delay);
  gainNode.gain.exponentialRampToValueAtTime(gain, audio.currentTime + delay + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + delay + duration);
  oscillator.connect(gainNode).connect(audio.destination);
  oscillator.start(audio.currentTime + delay);
  oscillator.stop(audio.currentTime + delay + duration + 0.05);
}

// Ráfaga de ruido filtrado: la unidad básica de un "clap" de aplauso.
function clap(delay, gain = 0.16) {
  const audio = getContext();
  const bufferSize = Math.floor(audio.sampleRate * 0.09);
  const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  const noise = audio.createBufferSource();
  noise.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800 + Math.random() * 800;
  filter.Q.value = 0.8;
  const gainNode = audio.createGain();
  gainNode.gain.setValueAtTime(gain, audio.currentTime + delay);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + delay + 0.09);
  noise.connect(filter).connect(gainNode).connect(audio.destination);
  noise.start(audio.currentTime + delay);
}

export const Audio = {
  // Aplauso corto: varias palmadas superpuestas con timing ligeramente aleatorio.
  playCorrect() {
    if (muted()) return;
    const claps = 7;
    for (let i = 0; i < claps; i++) clap(i * 0.045 + Math.random() * 0.02);
    tone({ frequency: 660, endFrequency: 880, duration: 0.25, type: 'triangle', delay: 0.05, gain: 0.05 });
  },
  // Buzzer/gong grave: dos osciladores desafinados con caída larga.
  playWrong() {
    if (muted()) return;
    tone({ frequency: 140, endFrequency: 70, duration: 0.7, type: 'sawtooth', gain: 0.11 });
    tone({ frequency: 196, endFrequency: 98, duration: 0.7, type: 'square', detune: -12, gain: 0.05, delay: 0.02 });
  },
  // Tic-tac de reloj: alterna dos tonos de "click" cortos, uno por segundo.
  startTick() {
    if (this._ticking) return;
    this._ticking = true;
    let tock = false;
    const beat = () => {
      if (!muted()) tone({ frequency: tock ? 1400 : 1650, duration: 0.045, type: 'square', gain: 0.045 });
      tock = !tock;
    };
    beat();
    tickTimer = setInterval(beat, 1000);
  },
  stopTick() {
    clearInterval(tickTimer);
    tickTimer = undefined;
    this._ticking = false;
  },
  toggleMute() {
    const next = !muted();
    localStorage.setItem(MUTE_KEY, next ? '1' : '0');
    if (next) this.stopTick();
    window.dispatchEvent(new CustomEvent('audiochange', { detail: { muted: next } }));
    return next;
  },
  isMuted() { return muted(); }
};
