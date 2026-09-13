import { day1 } from "./content";
import { catOnBadge, shoesDone } from "./state";
import type { GameState } from "./types";

export interface HudRefs {
  root: HTMLElement;
  timer: HTMLElement;
  timerNum: HTMLElement;
  list: HTMLElement;
  flavor: HTMLElement;
  mash: HTMLElement;
  mashFill: HTMLElement;
  title: HTMLElement;
  brief: HTMLElement;
  ending: HTMLElement;
  endLabel: HTMLElement;
  endLine: HTMLElement;
  endTime: HTMLElement;
  endRecap: HTMLElement;
  endTags: HTMLElement;
}

function formatTime(t: number): string {
  const late = t < 0;
  const abs = Math.min(999, Math.abs(t));
  const whole = Math.floor(abs);
  const frac = Math.floor((abs - whole) * 10);
  const mm = String(whole).padStart(2, "0");
  return `${late ? "−" : ""}${mm}.${frac}`;
}

export function syncHud(hud: HudRefs, state: GameState): void {
  const playing = state.phase === "room" || state.phase === "lastMile";
  hud.root.dataset.phase = state.phase;
  hud.timer.hidden = !playing;
  hud.list.hidden = state.phase !== "room";
  hud.mash.hidden = state.phase !== "lastMile";
  hud.title.hidden = state.phase !== "title";
  hud.brief.hidden = state.phase !== "brief";
  hud.ending.hidden = state.phase !== "ending";
  hud.flavor.hidden = !(playing && state.flavorT > 0);
  if (state.flavorT > 0) hud.flavor.textContent = state.flavor;

  if (playing) {
    hud.timerNum.textContent = formatTime(state.timeLeft);
    hud.timer.classList.toggle("is-late", state.timeLeft < 10);
    hud.timer.classList.toggle("is-over", state.timeLeft < 0);
  }

  if (state.phase === "room") {
    const items = [
      { id: "alarm", on: !state.alarmOn },
      { id: "shoes", on: shoesDone(state) },
      { id: "badge", on: state.badgeTaken },
      { id: "lock", on: state.doorLocked },
      { id: "elevator", on: false },
    ];
    const nodes = hud.list.querySelectorAll("[data-chore]");
    nodes.forEach((node) => {
      const el = node as HTMLElement;
      const id = el.dataset.chore;
      const hit = items.find((i) => i.id === id);
      el.classList.toggle("is-done", Boolean(hit?.on));
      if (id === "badge" && !state.badgeTaken && catOnBadge(state)) {
        el.classList.add("is-blocked");
      } else {
        el.classList.remove("is-blocked");
      }
    });
  }

  if (state.phase === "lastMile") {
    hud.mashFill.style.transform = `scaleX(${Math.max(0.02, state.mash)})`;
    hud.mash.classList.toggle("is-ready", state.mash > 0.75);
  }

  if (state.phase === "ending" && state.endingId) {
    const ending = day1.copy.endings[state.endingId];
    hud.endLabel.textContent = ending.label;
    hud.endLine.textContent = ending.line;
    hud.ending.dataset.ending = state.endingId;
    if (state.lateness <= 0.05) {
      hud.endTime.textContent = day1.copy.onTheDot;
    } else {
      hud.endTime.textContent = `${day1.copy.latePrefix} ${state.lateness.toFixed(1)} ${day1.copy.seconds}`;
    }
    hud.endRecap.replaceChildren(
      ...state.recap.map((line) => {
        const li = document.createElement("li");
        li.textContent = line;
        return li;
      }),
    );
    hud.endTags.replaceChildren(
      ...state.tags.map((tag) => {
        const span = document.createElement("span");
        span.className = "lom-tag";
        span.textContent = tag;
        return span;
      }),
    );
  }
}

export function buildHud(host: HTMLElement): HudRefs {
  host.innerHTML = `
    <div class="lom-app" data-phase="title">
      <canvas class="lom-canvas" aria-hidden="true"></canvas>
      <div class="lom-timer" hidden>
        <span class="lom-timer-label">${day1.copy.timerLabel}</span>
        <span class="lom-timer-num">60.0</span>
      </div>
      <ul class="lom-list" hidden>
        ${day1.chores
          .map(
            (c) =>
              `<li data-chore="${c.id}"><span class="lom-check"></span>${c.label}</li>`,
          )
          .join("")}
      </ul>
      <p class="lom-flavor" hidden></p>
      <div class="lom-mash" hidden>
        <p class="lom-mash-label">${day1.copy.mash}</p>
        <div class="lom-mash-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
          <div class="lom-mash-fill"></div>
        </div>
        <p class="lom-mash-hint">${day1.copy.mashHint}</p>
      </div>
      <section class="lom-screen lom-title">
        <div class="lom-title-copy">
          <p class="lom-kicker">Late One Minute</p>
          <h1>${day1.copy.gameTitle}</h1>
          <p class="lom-tagline">${day1.copy.tagline}</p>
          <button type="button" class="lom-btn" data-act="start">${day1.copy.start}</button>
        </div>
      </section>
      <section class="lom-screen lom-brief" hidden>
        <article class="lom-card">
          <p class="lom-kicker">${day1.copy.briefKicker}</p>
          <h2>${day1.title}</h2>
          <p class="lom-dest">${day1.destination}</p>
          <p class="lom-when">${day1.when} 开始 · 现在 ${day1.now}</p>
          <ul class="lom-brief-list">
            ${day1.chores.map((c) => `<li>${c.label}</li>`).join("")}
          </ul>
          <p class="lom-brief-line">${day1.copy.briefLine}</p>
          <button type="button" class="lom-btn" data-act="brief">${day1.copy.briefCta}</button>
        </article>
      </section>
      <section class="lom-screen lom-ending" hidden>
        <div class="lom-end-inner">
          <p class="lom-kicker">结算</p>
          <h2 class="lom-end-label"></h2>
          <p class="lom-end-time"></p>
          <p class="lom-end-line"></p>
          <ul class="lom-recap"></ul>
          <div class="lom-tags"></div>
          <button type="button" class="lom-btn" data-act="again">${day1.copy.again}</button>
        </div>
      </section>
    </div>
  `;

  const root = host.querySelector(".lom-app") as HTMLElement;
  return {
    root,
    timer: root.querySelector(".lom-timer") as HTMLElement,
    timerNum: root.querySelector(".lom-timer-num") as HTMLElement,
    list: root.querySelector(".lom-list") as HTMLElement,
    flavor: root.querySelector(".lom-flavor") as HTMLElement,
    mash: root.querySelector(".lom-mash") as HTMLElement,
    mashFill: root.querySelector(".lom-mash-fill") as HTMLElement,
    title: root.querySelector(".lom-title") as HTMLElement,
    brief: root.querySelector(".lom-brief") as HTMLElement,
    ending: root.querySelector(".lom-ending") as HTMLElement,
    endLabel: root.querySelector(".lom-end-label") as HTMLElement,
    endLine: root.querySelector(".lom-end-line") as HTMLElement,
    endTime: root.querySelector(".lom-end-time") as HTMLElement,
    endRecap: root.querySelector(".lom-recap") as HTMLElement,
    endTags: root.querySelector(".lom-tags") as HTMLElement,
  };
}
