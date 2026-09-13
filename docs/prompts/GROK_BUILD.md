You are Grok Build, implementation owner for 《迟到一分钟》.

Repo: https://github.com/parize670/late-one-minute
Work ONLY in D:\\late-one-minute on this Windows machine. If the folder is empty except git files, that is expected.

Read first:
- AGENTS.md
- docs/GAME_DESIGN.md
- docs/content/day1.json if it exists, otherwise use GAME_DESIGN defaults.

Build v1 slice, nothing else:
1. Vite + TypeScript + vanilla DOM/Canvas. `npm create vite@latest` in the repo root if no package.json yet. Keep existing docs.
2. Screens: Title → Day1 briefing → Room 60s → Elevator last-mile → Ending.
3. Room hotspots: alarm, shoes, badge+cat, door lock.
4. Cat sits on badge until the player moves it. Then cat may hop back once.
5. Visible countdown. Actions can be skipped; skipped actions change ending tags.
6. Mobile tap/drag and desktop mouse.
7. Chinese UI.
8. npm run dev must work.

Git:
- Branch feat/day-1-slice
- Small commits
- Do not force-push main
- Do not add React/Vue
- Do not implement Day 2+

When playable, push and summarize what to click to finish a run.
