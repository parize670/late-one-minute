import { loadAssets, type GameAssets } from "./assets";
import { AudioBus } from "./audio";
import { coverFit, toNorm } from "./layout";
import { buildHud, syncHud } from "./hud";
import { clearCanvas, drawElevator, drawRoom } from "./render";
import { createState } from "./state";
import {
  mashKey,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  startBrief,
  startRoom,
  step,
} from "./update";
import type { GameState, Vec } from "./types";

export function mountGame(host: HTMLElement): () => void {
  host.classList.add("lom-mount");
  const hud = buildHud(host);
  const canvas = host.querySelector(".lom-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  let state = createState();
  let assets: GameAssets | null = null;
  let raf = 0;
  let last = performance.now();
  let running = true;
  const audio = new AudioBus();
  const pointers = new Map<number, Vec>();
  let fit = { x: 0, y: 0, w: 1, h: 1 };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resize = (): void => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = host.clientWidth || window.innerWidth;
    const h = host.clientHeight || window.innerHeight;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const scenePoint = (e: PointerEvent): Vec => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return toNorm({ x, y }, fit);
  };

  const onDown = (e: PointerEvent): void => {
    audio.unlock();
    if (state.phase === "title" || state.phase === "brief" || state.phase === "ending") {
      return;
    }
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const n = scenePoint(e);
    pointers.set(e.pointerId, n);
    onPointerDown(state, n.x, n.y, e.pointerId);
    if (state.phase === "lastMile") audio.tap();
    if (state.phase === "room") audio.click();
  };

  const onMove = (e: PointerEvent): void => {
    if (!pointers.has(e.pointerId) && !state.drag) return;
    const n = scenePoint(e);
    onPointerMove(state, n.x, n.y, e.pointerId);
  };

  const onUp = (e: PointerEvent): void => {
    const start = pointers.get(e.pointerId) ?? null;
    const n = scenePoint(e);
    onPointerUp(state, n.x, n.y, e.pointerId, start);
    pointers.delete(e.pointerId);
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const onKey = (e: KeyboardEvent): void => {
    if (e.code === "Space" || e.code === "KeyE") {
      if (state.phase === "lastMile") {
        e.preventDefault();
        mashKey(state);
        audio.tap();
      }
    }
  };

  const onClick = (e: MouseEvent): void => {
    const t = e.target as HTMLElement | null;
    const act = t?.closest("[data-act]")?.getAttribute("data-act");
    if (!act) return;
    audio.unlock();
    audio.click();
    if (act === "start") startBrief(state);
    if (act === "brief") startRoom(state);
    if (act === "again") {
      state = createState();
    }
  };

  const frame = (now: number): void => {
    if (!running) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    step(state, dt);
    audio.tickAlarm(dt, state.phase === "room" && state.alarmOn);

    const cssW = host.clientWidth || window.innerWidth;
    const cssH = host.clientHeight || window.innerHeight;
    clearCanvas(ctx, cssW, cssH);

    if (assets) {
      if (state.phase === "title") {
        const bg = coverFit(assets.title.naturalWidth, assets.title.naturalHeight, cssW, cssH);
        fit = bg;
        ctx.drawImage(assets.title, bg.x, bg.y, bg.w, bg.h);
        ctx.fillStyle = "rgba(20,17,14,0.38)";
        ctx.fillRect(0, 0, cssW, cssH);
      } else if (state.phase === "brief") {
        ctx.fillStyle = "#14110e";
        ctx.fillRect(0, 0, cssW, cssH);
      } else if (state.phase === "room") {
        fit = drawRoom(ctx, state, assets, cssW, cssH);
      } else if (state.phase === "lastMile") {
        fit = drawElevator(ctx, state, assets, cssW, cssH);
      } else {
        ctx.fillStyle = "#14110e";
        ctx.fillRect(0, 0, cssW, cssH);
      }
    }

    if (reduced) state.shake = 0;
    syncHud(hud, state);
    raf = requestAnimationFrame(frame);
  };

  resize();
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  window.addEventListener("keydown", onKey);
  hud.root.addEventListener("click", onClick);

  void loadAssets()
    .then((a) => {
      assets = a;
    })
    .catch((err) => {
      console.error(err);
    });

  last = performance.now();
  raf = requestAnimationFrame(frame);

  const api = {
    getPhase: () => state.phase,
    getDebug() {
      return {
        phase: state.phase,
        timeLeft: state.timeLeft,
        alarmOn: state.alarmOn,
        alarmTaps: state.alarmTaps,
        catMoved: state.catMoved,
        catHopBackUsed: state.catHopBackUsed,
        badgeTaken: state.badgeTaken,
        shoes: state.shoeL.worn && state.shoeR.worn,
        swapped: state.shoesSwapped,
        doorLocked: state.doorLocked,
        mash: state.mash,
        squeezed: state.squeezed,
        ending: state.endingId,
        tags: [...state.tags],
      };
    },
    getTimeLeft: () => state.timeLeft,
    getTags: () => [...state.tags],
    getEnding: () => state.endingId,
    tapNorm(nx: number, ny: number) {
      onPointerDown(state, nx, ny, 99);
      onPointerMove(state, nx, ny, 99);
      onPointerUp(state, nx, ny, 99, { x: nx, y: ny });
    },
    dragNorm(ax: number, ay: number, bx: number, by: number) {
      onPointerDown(state, ax, ay, 99);
      onPointerMove(state, bx, by, 99);
      onPointerUp(state, bx, by, 99, { x: ax, y: ay });
    },
  };
  (window as unknown as { __lateOneMinute: typeof api }).__lateOneMinute = api;

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("keydown", onKey);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    hud.root.removeEventListener("click", onClick);
  };
}
