# Agent Protocol — 《迟到一分钟》

Repo: https://github.com/parize670/late-one-minute  
Local (Windows): `D:\\late-one-minute`

## Roles

### Grok Bot — Product / Content
- Own `docs/` narrative, day tables, ending copy, acceptance notes.
- Open and close GitHub Issues. Do not rewrite gameplay engine code unless asked.
- Keep Chinese player-facing text. Keep file/code identifiers in English.

### Grok Build — Implementation owner
- Work in `D:\\late-one-minute` (or the cloned repo root).
- Implement the playable game. Prefer small commits on feature branches.
- Run the game after every meaningful change.
- Do not invent new core systems before Day 1 slice is fun.

### Codex — Tech lead / QA
- Own architecture, types, tests, Playwright smoke playthrough.
- Fix bugs Grok Build leaves. Refuse scope creep.
- After code changes, play the loop or script a headless smoke test.

## Stack lock

- Vite 5+ / TypeScript / vanilla DOM + Canvas. No React/Vue unless all three agree.
- No backend, no accounts, no ads in v1.
- 16:9 desktop + 9:16 mobile layout. Touch first.
- State in plain TypeScript modules. No hidden global soup.

## Branch rule

- `main` always playable.
- Feature branches: `feat/room-loop`, `feat/day-1`, `feat/last-mile`, `feat/endings`.
- Commit messages in English. Player copy in Chinese.

## Definition of Done for v1 slice

1. Title → Day 1 brief → 60s room → elevator last-mile → ending screen.
2. Required room actions: alarm, shoes, badge, cat-on-badge, lock door.
3. Timer visible and honest.
4. Three endings based on lateness.
5. `npm run dev` works. README matches reality.

## Do not

- Add idle/gacha/inventory RPG systems.
- Remove the curse (“always start with 60 seconds”).
- Auto-win tutorials that skip the joke.
- Commit `node_modules` or secrets.
