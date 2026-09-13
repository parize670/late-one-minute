import raw from "../../docs/content/day1.json";
import type { ChoreId, EndingId } from "./types";

export interface DayChore {
  id: ChoreId;
  label: string;
}

type EndingCopy = Record<EndingId, { label: string; line: string }>;

interface DayCopy {
  gameTitle: string;
  tagline: string;
  start: string;
  briefKicker: string;
  briefCta: string;
  briefLine: string;
  timerLabel: string;
  mash: string;
  mashHint: string;
  again: string;
  latePrefix: string;
  seconds: string;
  onTheDot: string;
  endings: EndingCopy;
  tags: Record<
    | "alarmSkipped"
    | "shoesSkipped"
    | "shoesSwapped"
    | "badgeSkipped"
    | "catHopped"
    | "doorUnlocked"
    | "bagCaught"
    | "stoodStill",
    string
  >;
  flavor: Record<
    | "alarmTap1"
    | "alarmTap2"
    | "alarmOff"
    | "alarmSwipe"
    | "catOnce"
    | "catMoved"
    | "catBack"
    | "badgeTaken"
    | "badgeBlocked"
    | "shoeOne"
    | "shoesOn"
    | "shoesSwapped"
    | "doorNoBadge"
    | "doorLocked"
    | "doorRush"
    | "timeZero",
    string
  >;
  recap: Record<
    "alarmOk" | "alarmFail" | "badgeOk" | "badgeFail" | "elevOk" | "elevFail",
    string
  >;
}

export type FlavorKey = keyof DayCopy["flavor"];
export type TagKey = keyof DayCopy["tags"];

export interface DayContent {
  id: string;
  title: string;
  destination: string;
  when: string;
  now: string;
  roomSeconds: number;
  lastMileSeconds: number;
  lateWindow: number;
  standStillLimit: number;
  chores: DayChore[];
  copy: DayCopy;
}

export const day1 = raw as DayContent;
