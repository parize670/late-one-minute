/** Tiny WebAudio bus. Unlocks on first gesture. */
export class AudioBus {
  private ctx: AudioContext | null = null;
  private alarmTimer = 0;
  private muted = false;

  unlock(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    void this.ctx.resume();
  }

  tickAlarm(dt: number, on: boolean): void {
    if (!on || !this.ctx) {
      this.alarmTimer = 0;
      return;
    }
    this.alarmTimer -= dt;
    if (this.alarmTimer > 0) return;
    this.alarmTimer = 0.42;
    this.beep(880, 0.09, "square", 0.04);
    window.setTimeout(() => this.beep(660, 0.09, "square", 0.04), 110);
  }

  tap(): void {
    this.beep(420, 0.05, "square", 0.035);
  }

  meow(): void {
    this.beep(520, 0.08, "sine", 0.05);
    window.setTimeout(() => this.beep(380, 0.12, "sine", 0.04), 90);
  }

  click(): void {
    this.beep(240, 0.04, "triangle", 0.03);
  }

  ding(): void {
    this.beep(784, 0.12, "sine", 0.05);
    window.setTimeout(() => this.beep(1175, 0.18, "sine", 0.04), 120);
  }

  slam(): void {
    this.beep(90, 0.18, "sawtooth", 0.06);
  }

  private beep(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
  ): void {
    if (this.muted || !this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }
}
