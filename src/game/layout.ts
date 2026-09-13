import type { SceneFit, Vec } from "./types";

/** Normalized positions against the 3:4 room painting. */
export const ROOM = {
  alarm: { x: 0.2, y: 0.58 },
  alarmBed: { x: 0.28, y: 0.7 },
  catHome: { x: 0.42, y: 0.74 },
  catAside: { x: 0.62, y: 0.7 },
  badge: { x: 0.42, y: 0.78 },
  shoeL: { x: 0.26, y: 0.84 },
  shoeR: { x: 0.74, y: 0.82 },
  foot0: { x: 0.5, y: 0.88 },
  foot1: { x: 0.64, y: 0.88 },
  door: { x: 0.86, y: 0.48, w: 0.22, h: 0.46 },
  mat: { x: 0.57, y: 0.88, w: 0.32, h: 0.12 },
};

export const SIZES = {
  alarm: { w: 0.16, h: 0.12 },
  cat: { w: 0.22, h: 0.22 },
  badge: { w: 0.12, h: 0.14 },
  shoe: { w: 0.16, h: 0.11 },
};

export const HIT = {
  alarm: { w: 0.22, h: 0.18 },
  cat: { w: 0.26, h: 0.26 },
  badge: { w: 0.16, h: 0.18 },
  shoe: { w: 0.2, h: 0.16 },
};

export function containFit(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): SceneFit {
  const scale = Math.min(dstW / srcW, dstH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  return { x: (dstW - w) / 2, y: (dstH - h) / 2, w, h };
}

export function coverFit(
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
): SceneFit {
  const scale = Math.max(dstW / srcW, dstH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  return { x: (dstW - w) / 2, y: (dstH - h) / 2, w, h };
}

export function toCanvas(n: Vec, fit: SceneFit): Vec {
  return { x: fit.x + n.x * fit.w, y: fit.y + n.y * fit.h };
}

export function toNorm(p: Vec, fit: SceneFit): Vec {
  return { x: (p.x - fit.x) / fit.w, y: (p.y - fit.y) / fit.h };
}

export function dist(a: Vec, b: Vec): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function inRect(
  n: Vec,
  r: { x: number; y: number; w: number; h: number },
): boolean {
  return (
    n.x >= r.x - r.w / 2 &&
    n.x <= r.x + r.w / 2 &&
    n.y >= r.y - r.h / 2 &&
    n.y <= r.y + r.h / 2
  );
}

export function hitSprite(n: Vec, pos: Vec, size: { w: number; h: number }): boolean {
  return (
    Math.abs(n.x - pos.x) <= size.w / 2 && Math.abs(n.y - pos.y) <= size.h / 2
  );
}
