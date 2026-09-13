import type { GameAssets } from "./assets";
import { ROOM, SIZES, containFit, coverFit, toCanvas } from "./layout";
import { catOnBadge } from "./state";
import type { GameState, SceneFit, Vec } from "./types";

function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  fit: SceneFit,
  pos: Vec,
  size: { w: number; h: number },
  opts?: { shake?: number; alpha?: number; rot?: number },
): void {
  const p = toCanvas(pos, fit);
  const w = size.w * fit.w;
  const h = size.h * fit.h;
  const sx = (opts?.shake ?? 0) * (Math.random() - 0.5) * 10;
  const sy = (opts?.shake ?? 0) * (Math.random() - 0.5) * 8;
  ctx.save();
  ctx.globalAlpha = opts?.alpha ?? 1;
  ctx.translate(p.x + sx, p.y + sy);
  if (opts?.rot) ctx.rotate(opts.rot);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function ring(
  ctx: CanvasRenderingContext2D,
  fit: SceneFit,
  pos: Vec,
  r: number,
  t: number,
  color: string,
): void {
  const p = toCanvas(pos, fit);
  const pulse = 0.65 + Math.sin(t * 4) * 0.35;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35 + pulse * 0.35;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, r * fit.w * pulse, r * fit.h * pulse * 0.85, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawRoom(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  assets: GameAssets,
  cssW: number,
  cssH: number,
): SceneFit {
  const fit = containFit(assets.room.naturalWidth, assets.room.naturalHeight, cssW, cssH);
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake * 14, (Math.random() - 0.5) * state.shake * 10);
  }
  ctx.drawImage(assets.room, fit.x, fit.y, fit.w, fit.h);

  const doorOff = state.doorShake * Math.sin(state.doorShake * 40) * 8;
  if (doorOff) {
    ctx.save();
    ctx.beginPath();
    const d = toCanvas({ x: ROOM.door.x, y: ROOM.door.y }, fit);
    ctx.rect(d.x - ROOM.door.w * fit.w / 2 + doorOff, d.y - ROOM.door.h * fit.h / 2, ROOM.door.w * fit.w, ROOM.door.h * fit.h);
    ctx.strokeStyle = "rgba(235,228,214,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  if (!state.badgeTaken) {
    drawSprite(ctx, assets.badge, fit, state.badgePos, SIZES.badge, {
      alpha: catOnBadge(state) ? 0.45 : 1,
    });
  }

  if (!state.shoeL.worn || true) {
    drawSprite(ctx, assets.shoeL, fit, state.shoeL.pos, SIZES.shoe, {
      alpha: state.shoeL.worn ? 0.95 : 1,
    });
  }
  drawSprite(ctx, assets.shoeR, fit, state.shoeR.pos, SIZES.shoe, {
    alpha: state.shoeR.worn ? 0.95 : 1,
  });

  const catImg = assets.cat[state.catFrame] ?? assets.cat[0];
  drawSprite(ctx, catImg, fit, state.catPos, SIZES.cat);

  if (!state.alarmUnderBed || state.alarmOn) {
    drawSprite(ctx, assets.alarm, fit, state.alarmPos, SIZES.alarm, {
      shake: state.alarmOn ? 0.8 : 0,
      rot: state.alarmOn ? Math.sin(state.hintT * 30) * 0.08 : 0,
    });
  } else {
    drawSprite(ctx, assets.alarm, fit, state.alarmPos, SIZES.alarm, { alpha: 0.4, rot: 0.4 });
  }

  if (state.hintT < 10) {
    if (state.alarmOn) ring(ctx, fit, state.alarmPos, 0.1, state.hintT, "#ebe4d6");
    if (catOnBadge(state)) ring(ctx, fit, state.catPos, 0.13, state.hintT + 0.4, "#ebe4d6");
    if (!state.shoeL.worn) ring(ctx, fit, state.shoeL.pos, 0.09, state.hintT + 0.8, "#ebe4d6");
    if (!state.shoeR.worn) ring(ctx, fit, state.shoeR.pos, 0.09, state.hintT + 1.1, "#ebe4d6");
    if (!state.leftRoom) ring(ctx, fit, { x: ROOM.door.x, y: ROOM.door.y }, 0.14, state.hintT + 1.6, "#ebe4d6");
  }

  for (const p of state.particles) {
    const c = toCanvas({ x: p.x, y: p.y }, fit);
    ctx.save();
    ctx.globalAlpha = p.life / p.max;
    ctx.fillStyle = p.tone === "danger" ? "#c45c4a" : p.tone === "ink" ? "#ebe4d6" : "#d8c4a0";
    ctx.font = `600 ${Math.round(15 * (fit.w / 420))}px "Noto Sans SC", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(p.text, c.x, c.y);
    ctx.restore();
  }

  ctx.restore();
  return fit;
}

export function drawElevator(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  assets: GameAssets,
  cssW: number,
  cssH: number,
): SceneFit {
  const fit = coverFit(
    assets.elevator.naturalWidth,
    assets.elevator.naturalHeight,
    cssW,
    cssH,
  );
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * state.shake * 16, (Math.random() - 0.5) * state.shake * 10);
  }
  ctx.drawImage(assets.elevator, fit.x, fit.y, fit.w, fit.h);

  const close = state.doors;
  const doorW = fit.w * 0.5 * close;
  ctx.fillStyle = "rgba(18, 16, 14, 0.92)";
  ctx.fillRect(fit.x, fit.y, doorW, fit.h);
  ctx.fillRect(fit.x + fit.w - doorW, fit.y, doorW, fit.h);
  ctx.fillStyle = "rgba(235,228,214,0.12)";
  ctx.fillRect(fit.x + doorW - 3, fit.y, 3, fit.h);
  ctx.fillRect(fit.x + fit.w - doorW, fit.y, 3, fit.h);

  if (state.bagCaught || (close > 0.82 && state.mash < 1)) {
    const bagX = fit.x + fit.w / 2;
    const bagY = fit.y + fit.h * 0.72;
    ctx.fillStyle = "#6b4a32";
    ctx.fillRect(bagX - 22, bagY - 28, 44, 36);
    ctx.strokeStyle = "#2a221c";
    ctx.lineWidth = 2;
    ctx.strokeRect(bagX - 22, bagY - 28, 44, 36);
  }

  for (const p of state.particles) {
    const c = toCanvas({ x: p.x, y: p.y }, fit);
    ctx.save();
    ctx.globalAlpha = p.life / p.max;
    ctx.fillStyle = "#ebe4d6";
    ctx.font = `600 ${Math.round(18 * (fit.w / 420))}px "Noto Sans SC", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(p.text, c.x, c.y);
    ctx.restore();
  }

  ctx.restore();
  return fit;
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#14110e";
  ctx.fillRect(0, 0, w, h);
}
