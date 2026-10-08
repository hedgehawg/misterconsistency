/* Book of the Dead World: sound for the journey. One music bed per act, looped and crossfaded between acts; one
   narration clip per room, ducking the music; subtitles by sentence. Every play() runs inside the click that asked for
   it, so it works where autoplay is gated. Data: journey.js (generated from journey/SCRIPT.md). */
export function createJourneyAudio(J, hooks = {}) {
  const MUSIC = 0.55, DUCK = 0.2, XFADE = 4;
  const A = { ctx: null, master: null, music: null, narr: null, analyser: null, acts: {}, act: null, clips: {}, clip: null, muted: false, on: false };
  const now = () => A.ctx.currentTime;
  const ramp = (g, v, s) => { const t = now(); g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(v, t + s); };
  const quiet = p => { if (p && p.catch) p.catch(() => {}); return p; };
  function init() {
    if (A.ctx) { if (A.ctx.state === 'suspended') quiet(A.ctx.resume()); return; }
    A.ctx = new (window.AudioContext || window.webkitAudioContext)();
    A.master = A.ctx.createGain(); A.master.gain.value = A.muted ? 0 : 1;
    A.analyser = A.ctx.createAnalyser(); A.analyser.fftSize = 1024;
    A.master.connect(A.analyser); A.analyser.connect(A.ctx.destination);
    A.music = A.ctx.createGain(); A.music.gain.value = MUSIC; A.music.connect(A.master);
    A.narr = A.ctx.createGain(); A.narr.connect(A.master);
  }
  function element(url, loop, bus, gain) {
    const el = new Audio(url); el.loop = loop; el.preload = 'auto';
    const g = A.ctx.createGain(); g.gain.value = gain; A.ctx.createMediaElementSource(el).connect(g); g.connect(bus);
    return { el, g };
  }
  const actFor = id => A.acts[id] || (A.acts[id] = element(J.music[id].file, true, A.music, 0));
  const clipFor = i => A.clips[i] || (A.clips[i] = element(J.rooms[i].clip, false, A.narr, 1));
  function setAct(id) {
    if (A.act === id) return;
    const oldId = A.act, old = oldId && A.acts[oldId]; A.act = id;
    const a = actFor(id), fadeIn = () => ramp(a.g, 1, XFADE);
    const p = a.el.play(); if (p && p.then) p.then(fadeIn, () => {}); else fadeIn();
    if (old) { ramp(old.g, 0, XFADE); setTimeout(() => { if (A.act !== oldId) old.el.pause(); }, XFADE * 1000 + 300); }
  }
  function stopClip() {
    if (A.clip == null) return;
    const c = A.clips[A.clip]; if (c.cleanup) c.cleanup(); c.el.pause(); A.clip = null;
  }
  function narrate(i) {
    stopClip();
    const r = J.rooms[i], c = clipFor(i), lines = r.lines; A.clip = i;
    const total = lines.reduce((s, l) => s + l.length, 0), bounds = []; let acc = 0, shown = -1;
    for (const l of lines) { acc += l.length; bounds.push(acc / total); }
    const onTime = () => {
      const d = c.el.duration || r.dur, f = d ? c.el.currentTime / d : 0; let k = bounds.findIndex(b => f < b); if (k < 0) k = lines.length - 1;
      if (k !== shown) { shown = k; if (hooks.onLine) hooks.onLine(lines[k], k, i); }
    };
    const onEnd = () => { cleanup(); A.clip = null; ramp(A.music, MUSIC, 2); if (hooks.onEnd) hooks.onEnd(i); };
    const cleanup = () => { c.el.removeEventListener('timeupdate', onTime); c.el.removeEventListener('ended', onEnd); c.cleanup = null; };
    c.cleanup = cleanup; c.el.addEventListener('timeupdate', onTime); c.el.addEventListener('ended', onEnd);
    try { c.el.currentTime = 0; } catch (e) { /* not loaded yet: starts at 0 anyway */ }
    ramp(A.music, DUCK, 0.6); quiet(c.el.play()); onTime();
  }
  return {
    start() { init(); A.on = true; ramp(A.music, MUSIC, 0.05); },
    room(i) {
      if (!A.on) this.start();
      setAct(J.rooms[i].act); narrate(i);
      const n = J.rooms[i + 1]; if (n) { clipFor(i + 1); if (n.act !== J.rooms[i].act) actFor(n.act); }   // fetch the next room's sound now
    },
    stop() {
      if (!A.ctx || !A.on) return;
      stopClip(); A.on = false; A.act = null; ramp(A.music, 0, 1.5);
      const acts = Object.values(A.acts);
      setTimeout(() => { if (!A.on) for (const a of acts) { a.el.pause(); a.g.gain.cancelScheduledValues(now()); a.g.gain.value = 0; } }, 1600);
    },
    mute(m) { A.muted = m; if (A.master) ramp(A.master, m ? 0 : 1, 0.1); return m; },
    get muted() { return A.muted; },
    get on() { return A.on; },
    state() {   // for tests and the console
      let rms = 0; if (A.analyser) { const b = new Float32Array(A.analyser.fftSize); A.analyser.getFloatTimeDomainData(b); rms = Math.sqrt(b.reduce((s, v) => s + v * v, 0) / b.length); }
      const el = A.clip != null && A.clips[A.clip].el, act = A.act && A.acts[A.act].el;
      return { on: A.on, muted: A.muted, ctx: A.ctx && A.ctx.state, act: A.act, actTime: act ? act.currentTime : null, actPaused: act ? act.paused : null, actGain: A.act ? A.acts[A.act].g.gain.value : null,
        clip: A.clip, clipTime: el ? el.currentTime : null, clipPaused: el ? el.paused : null, musicGain: A.music ? A.music.gain.value : null, masterGain: A.master ? A.master.gain.value : null, rms,
        acts: Object.fromEntries(Object.entries(A.acts).map(([k, a]) => [k, { paused: a.el.paused, gain: a.g.gain.value, t: a.el.currentTime }])) };
    }
  };
}
