export type Phase = "title" | "brief" | "room" | "lastMile" | "ending";

export type EndingId = "onTime" | "aBitLate" | "missed";

export type ChoreId = "alarm" | "shoes" | "badge" | "lock" | "elevator";

export type DragKind = "cat" | "shoeL" | "shoeR" | "alarm" | "badge";

export interface Vec {
  x: number;
  y: number;
}

export interface Shoe {
  pos: Vec;
  worn: boolean;
  slot: 0 | 1 | null;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  text: string;
  tone: "warm" | "ink" | "danger";
}

export interface DragState {
  kind: DragKind;
  pointerId: number;
  grabX: number;
  grabY: number;
}

export interface GameState {
  phase: Phase;
  timeLeft: number;
  clockOn: boolean;
  briefT: number;
  flavor: string;
  flavorT: number;
  alarmOn: boolean;
  alarmTaps: number;
  alarmPos: Vec;
  alarmUnderBed: boolean;
  shoeL: Shoe;
  shoeR: Shoe;
  shoesSwapped: boolean;
  catPos: Vec;
  catHome: Vec;
  catMoved: boolean;
  catHopBackUsed: boolean;
  catHopWait: number;
  catHopping: boolean;
  catHopFrom: Vec;
  catHopTo: Vec;
  catHopU: number;
  catClicks: number;
  catFrame: number;
  catFrameT: number;
  badgeTaken: boolean;
  badgePos: Vec;
  doorLocked: boolean;
  doorPopped: boolean;
  doorShake: number;
  leftRoom: boolean;
  mash: number;
  doors: number;
  lastMileT: number;
  squeezed: boolean;
  bagCaught: boolean;
  endingId: EndingId | null;
  lateness: number;
  tags: string[];
  recap: string[];
  shake: number;
  particles: Particle[];
  drag: DragState | null;
  hintT: number;
  stoodPrompted: boolean;
}

export interface SceneFit {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PointerSample {
  id: number;
  x: number;
  y: number;
  nx: number;
  ny: number;
  down: boolean;
}
