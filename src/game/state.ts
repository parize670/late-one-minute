import { day1, type FlavorKey, type TagKey } from "./content";
import { ROOM } from "./layout";
import type { EndingId, GameState } from "./types";

export function createState(): GameState {
  return {
    phase: "title",
    timeLeft: day1.roomSeconds,
    clockOn: false,
    briefT: 0,
    flavor: "",
    flavorT: 0,
    alarmOn: true,
    alarmTaps: 0,
    alarmPos: { ...ROOM.alarm },
    alarmUnderBed: false,
    shoeL: { pos: { ...ROOM.shoeL }, worn: false, slot: null },
    shoeR: { pos: { ...ROOM.shoeR }, worn: false, slot: null },
    shoesSwapped: false,
    catPos: { ...ROOM.catHome },
    catHome: { ...ROOM.catHome },
    catMoved: false,
    catHopBackUsed: false,
    catHopWait: 0,
    catHopping: false,
    catHopFrom: { ...ROOM.catHome },
    catHopTo: { ...ROOM.catHome },
    catHopU: 0,
    catClicks: 0,
    catFrame: 0,
    catFrameT: 0,
    badgeTaken: false,
    badgePos: { ...ROOM.badge },
    doorLocked: false,
    doorPopped: false,
    doorShake: 0,
    leftRoom: false,
    mash: 0,
    doors: 0,
    lastMileT: 0,
    squeezed: false,
    bagCaught: false,
    endingId: null,
    lateness: 0,
    tags: [],
    recap: [],
    shake: 0,
    particles: [],
    drag: null,
    hintT: 0,
    stoodPrompted: false,
  };
}

export function say(state: GameState, key: FlavorKey): void {
  const line = day1.copy.flavor[key];
  if (!line) return;
  state.flavor = line;
  state.flavorT = 2.4;
}

export function addTag(state: GameState, key: TagKey): void {
  const label = day1.copy.tags[key];
  if (!label) return;
  if (!state.tags.includes(label)) state.tags.push(label);
}

export function catOnBadge(state: GameState): boolean {
  if (state.badgeTaken) return false;
  const dx = state.catPos.x - state.badgePos.x;
  const dy = state.catPos.y - state.badgePos.y;
  return Math.hypot(dx, dy) < 0.09;
}

export function shoesDone(state: GameState): boolean {
  return state.shoeL.worn && state.shoeR.worn;
}

export function settleEnding(state: GameState): void {
  const lateness = Math.max(0, -state.timeLeft);
  state.lateness = lateness;
  const made = state.squeezed;
  let id: EndingId;
  if (!made || lateness > day1.lateWindow) id = "missed";
  else if (lateness > 0.05) id = "aBitLate";
  else id = "onTime";
  state.endingId = id;

  if (!state.alarmOn) {
    /* turned off */
  } else {
    addTag(state, "alarmSkipped");
  }
  if (!shoesDone(state)) addTag(state, "shoesSkipped");
  else if (state.shoesSwapped) addTag(state, "shoesSwapped");
  if (!state.badgeTaken) addTag(state, "badgeSkipped");
  if (state.catHopBackUsed) addTag(state, "catHopped");
  if (!state.doorLocked) addTag(state, "doorUnlocked");
  if (state.bagCaught) addTag(state, "bagCaught");
  if (state.phase === "room" && !state.leftRoom) addTag(state, "stoodStill");

  const r = day1.copy.recap;
  state.recap = [
    state.alarmOn ? r.alarmFail : r.alarmOk,
    state.badgeTaken ? r.badgeOk : r.badgeFail,
    state.squeezed ? r.elevOk : r.elevFail,
  ];
}
