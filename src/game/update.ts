import { day1 } from "./content";
import { ROOM, HIT, dist, hitSprite, inRect } from "./layout";
import { catOnBadge, say, settleEnding, shoesDone } from "./state";
import type { DragKind, GameState, Particle, Vec } from "./types";

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

function spawn(
  state: GameState,
  x: number,
  y: number,
  text: string,
  tone: Particle["tone"] = "warm",
): void {
  state.particles.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 0.12,
    vy: -0.18 - Math.random() * 0.08,
    life: 0.7,
    max: 0.7,
    size: 14,
    text,
    tone,
  });
}

function hopCat(state: GameState, to: Vec): void {
  state.catHopping = true;
  state.catHopFrom = { ...state.catPos };
  state.catHopTo = { ...to };
  state.catHopU = 0;
}

function occupySlot(state: GameState, which: "L" | "R", slot: 0 | 1): void {
  const shoe = which === "L" ? state.shoeL : state.shoeR;
  const other = which === "L" ? state.shoeR : state.shoeL;
  if (other.slot === slot) {
    other.worn = false;
    other.slot = null;
    other.pos = slot === 0 ? { ...ROOM.shoeL } : { ...ROOM.shoeR };
  }
  shoe.worn = true;
  shoe.slot = slot;
  shoe.pos = slot === 0 ? { ...ROOM.foot0 } : { ...ROOM.foot1 };
  const both = shoesDone(state);
  if (both) {
    state.shoesSwapped = state.shoeL.slot === 1 && state.shoeR.slot === 0;
    if (state.shoesSwapped) say(state, "shoesSwapped");
    else say(state, "shoesOn");
  } else {
    say(state, "shoeOne");
  }
}

function tryWear(state: GameState, which: "L" | "R"): boolean {
  const shoe = which === "L" ? state.shoeL : state.shoeR;
  const near0 = dist(shoe.pos, ROOM.foot0) < 0.1;
  const near1 = dist(shoe.pos, ROOM.foot1) < 0.1;
  if (near0) {
    occupySlot(state, which, 0);
    return true;
  }
  if (near1) {
    occupySlot(state, which, 1);
    return true;
  }
  return false;
}

function startHopBackClock(state: GameState): void {
  if (state.catHopBackUsed || state.badgeTaken) return;
  state.catHopWait = 2.2;
}

export function moveCatOff(state: GameState): void {
  if (state.catHopping) return;
  state.catMoved = true;
  state.catClicks = 2;
  hopCat(state, ROOM.catAside);
  startHopBackClock(state);
  say(state, "catMoved");
}

function turnOffAlarm(state: GameState, swiped: boolean): void {
  if (!state.alarmOn) return;
  state.alarmOn = false;
  state.alarmTaps = 3;
  state.shake = 0.18;
  say(state, swiped ? "alarmSwipe" : "alarmOff");
  spawn(state, state.alarmPos.x, state.alarmPos.y - 0.08, "关");
}

function leaveRoom(state: GameState, locked: boolean): void {
  if (state.leftRoom) return;
  state.leftRoom = true;
  state.doorLocked = locked;
  if (state.alarmOn) {
    state.alarmUnderBed = true;
    state.alarmPos = { ...ROOM.alarmBed };
  }
  state.phase = "lastMile";
  state.lastMileT = 0;
  state.mash = 0.08;
  state.doors = 0;
  state.clockOn = true;
  say(state, locked ? "doorLocked" : "doorRush");
}

function finishLastMile(state: GameState, squeezed: boolean): void {
  if (state.phase !== "lastMile") return;
  state.squeezed = squeezed;
  if (!squeezed) state.bagCaught = true;
  settleEnding(state);
  state.phase = "ending";
  state.clockOn = false;
}

export function startBrief(state: GameState): void {
  state.phase = "brief";
  state.briefT = 0;
}

export function startRoom(state: GameState): void {
  state.phase = "room";
  state.clockOn = true;
  state.timeLeft = day1.roomSeconds;
  state.hintT = 0;
}

export function step(state: GameState, dt: number): void {
  const elapsed = Math.max(0, dt);
  const d = Math.min(elapsed, 0.1);
  state.hintT += d;
  if (state.flavorT > 0) state.flavorT -= d;

  if (state.phase === "brief") {
    state.briefT += d;
    if (state.briefT >= 2.6) startRoom(state);
  }

  if (state.clockOn && (state.phase === "room" || state.phase === "lastMile")) {
    state.timeLeft -= elapsed;
  }

  state.shake = Math.max(0, state.shake - d * 2.4);
  state.doorShake = Math.max(0, state.doorShake - d * 4);

  state.catFrameT += d;
  if (state.catFrameT > 0.22) {
    state.catFrameT = 0;
    state.catFrame = (state.catFrame + 1) % 4;
  }

  if (state.catHopping) {
    state.catHopU += d / 0.38;
    const u = clamp(state.catHopU, 0, 1);
    const lift = Math.sin(u * Math.PI) * 0.06;
    state.catPos = {
      x: state.catHopFrom.x + (state.catHopTo.x - state.catHopFrom.x) * u,
      y: state.catHopFrom.y + (state.catHopTo.y - state.catHopFrom.y) * u - lift,
    };
    if (u >= 1) {
      state.catHopping = false;
      state.catPos = { ...state.catHopTo };
    }
  } else if (
    state.phase === "room" &&
    state.catMoved &&
    !state.catHopBackUsed &&
    !state.badgeTaken &&
    state.drag?.kind !== "cat"
  ) {
    state.catHopWait -= d;
    if (state.catHopWait <= 0) {
      state.catHopBackUsed = true;
      hopCat(state, { x: state.badgePos.x, y: state.badgePos.y - 0.04 });
      say(state, "catBack");
      state.shake = 0.12;
    }
  }

  if (state.alarmOn && state.phase === "room") {
    state.alarmPos.x = ROOM.alarm.x + Math.sin(state.hintT * 28) * 0.004;
  }

  if (state.phase === "room" && state.timeLeft <= 0 && !state.stoodPrompted) {
    state.stoodPrompted = true;
    say(state, "timeZero");
  }
  if (
    state.phase === "room" &&
    !state.leftRoom &&
    state.timeLeft <= -day1.standStillLimit
  ) {
    settleEnding(state);
    state.phase = "ending";
    state.clockOn = false;
  }

  if (state.phase === "lastMile") {
    state.lastMileT += d;
    const close = clamp(state.lastMileT / day1.lastMileSeconds, 0, 1);
    state.doors = close;
    if (state.mash >= 1) {
      finishLastMile(state, true);
    } else if (close >= 1 || state.timeLeft <= -day1.lateWindow) {
      finishLastMile(state, false);
    } else {
      state.mash = clamp(state.mash - d * 0.03, 0, 1);
    }
  }

  for (const p of state.particles) {
    p.life -= d;
    p.x += p.vx * d;
    p.y += p.vy * d;
    p.vy += d * 0.25;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
}

export function onPointerDown(state: GameState, nx: number, ny: number, id: number): void {
  if (state.phase === "lastMile") {
    state.mash = clamp(state.mash + 0.11 + Math.random() * 0.03, 0, 1);
    state.shake = 0.16;
    spawn(state, 0.5 + (Math.random() - 0.5) * 0.3, 0.62, "挤", "ink");
    return;
  }
  if (state.phase !== "room") return;

  const n = { x: nx, y: ny };

  const tryDrag = (kind: DragKind, pos: Vec): boolean => {
    state.drag = {
      kind,
      pointerId: id,
      grabX: n.x - pos.x,
      grabY: n.y - pos.y,
    };
    return true;
  };

  if (!state.badgeTaken && catOnBadge(state) && hitSprite(n, state.catPos, HIT.cat)) {
    tryDrag("cat", state.catPos);
    return;
  }
  if (hitSprite(n, state.catPos, HIT.cat)) {
    tryDrag("cat", state.catPos);
    return;
  }
  if (
    !state.badgeTaken &&
    !catOnBadge(state) &&
    hitSprite(n, state.badgePos, HIT.badge)
  ) {
    tryDrag("badge", state.badgePos);
    return;
  }
  if (state.alarmOn && hitSprite(n, state.alarmPos, HIT.alarm)) {
    tryDrag("alarm", state.alarmPos);
    return;
  }
  if (!state.shoeL.worn && hitSprite(n, state.shoeL.pos, HIT.shoe)) {
    tryDrag("shoeL", state.shoeL.pos);
    return;
  }
  if (!state.shoeR.worn && hitSprite(n, state.shoeR.pos, HIT.shoe)) {
    tryDrag("shoeR", state.shoeR.pos);
    return;
  }
  if (inRect(n, ROOM.door)) {
    handleDoor(state);
  }
}

export function onPointerMove(state: GameState, nx: number, ny: number, id: number): void {
  if (!state.drag || state.drag.pointerId !== id) return;
  const pos = {
    x: clamp(nx - state.drag.grabX, 0.06, 0.94),
    y: clamp(ny - state.drag.grabY, 0.08, 0.94),
  };
  switch (state.drag.kind) {
    case "cat":
      state.catPos = pos;
      break;
    case "badge":
      state.badgePos = pos;
      break;
    case "alarm":
      state.alarmPos = pos;
      break;
    case "shoeL":
      state.shoeL.pos = pos;
      break;
    case "shoeR":
      state.shoeR.pos = pos;
      break;
    default:
      break;
  }
}

export function onPointerUp(
  state: GameState,
  nx: number,
  ny: number,
  id: number,
  start: Vec | null,
): void {
  if (state.phase === "lastMile") return;
  if (state.phase !== "room") {
    state.drag = null;
    return;
  }

  const n = { x: nx, y: ny };
  const drag = state.drag;
  const travel = start ? dist(n, start) : 0;

  if (drag && drag.pointerId === id) {
    if (drag.kind === "cat") {
      const moved = dist(state.catPos, state.catHome) > 0.1;
      if (moved) {
        state.catMoved = true;
        state.catClicks = 2;
        startHopBackClock(state);
        say(state, "catMoved");
      } else if (travel < 0.03) {
        handleCatTap(state);
      }
    } else if (drag.kind === "alarm") {
      if (travel > 0.08) {
        turnOffAlarm(state, true);
        state.alarmPos = { ...ROOM.alarmBed };
        state.alarmUnderBed = true;
      } else {
        handleAlarmTap(state);
        state.alarmPos = { ...ROOM.alarm };
      }
    } else if (drag.kind === "shoeL") {
      if (!tryWear(state, "L") && travel < 0.03) {
        /* tap does nothing extra */
      }
    } else if (drag.kind === "shoeR") {
      tryWear(state, "R");
    } else if (drag.kind === "badge") {
      if (!catOnBadge(state)) {
        takeBadge(state);
      } else {
        state.badgePos = { ...ROOM.badge };
      }
    }
    state.drag = null;
    return;
  }

  state.drag = null;
  if (travel > 0.04) return;
}

function handleCatTap(state: GameState): void {
  if (state.catHopping) return;
  state.catClicks += 1;
  if (state.catClicks === 1) {
    say(state, "catOnce");
    return;
  }
  moveCatOff(state);
}

function handleAlarmTap(state: GameState): void {
  if (!state.alarmOn) return;
  state.alarmTaps += 1;
  state.shake = 0.2;
  if (state.alarmTaps === 1) say(state, "alarmTap1");
  else if (state.alarmTaps === 2) say(state, "alarmTap2");
  if (state.alarmTaps >= 3) turnOffAlarm(state, false);
}

function takeBadge(state: GameState): void {
  if (state.badgeTaken) return;
  if (catOnBadge(state)) {
    say(state, "badgeBlocked");
    return;
  }
  state.badgeTaken = true;
  state.catHopWait = 0;
  say(state, "badgeTaken");
  spawn(state, state.badgePos.x, state.badgePos.y, "拿");
}

function handleDoor(state: GameState): void {
  if (state.leftRoom) return;
  if (!state.badgeTaken && !state.doorPopped) {
    state.doorPopped = true;
    state.doorShake = 1;
    state.shake = 0.22;
    say(state, "doorNoBadge");
    return;
  }
  leaveRoom(state, state.badgeTaken);
}

export function mashKey(state: GameState): void {
  if (state.phase !== "lastMile") return;
  onPointerDown(state, 0.5, 0.5, -1);
}
