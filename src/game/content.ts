import raw from "../../docs/content/day1.json";

export interface DayChore {
  id: string;
  label: string;
}

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
  copy: {
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
    earlyPrefix: string;
    seconds: string;
    onTheDot: string;
    endings: Record<
      "onTime" | "aBitLate" | "missed",
      { label: string; line: string }
    >;
    tags: Record<string, string>;
    flavor: Record<string, string>;
    recap: Record<string, string>;
  };
}

export const day1 = raw as DayContent;
