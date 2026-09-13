# GAME DESIGN — 《迟到一分钟》

## Promise

You are cursed to always leave home with only 60 seconds left.  
Winning still looks like barely making it. Losing is a collectible humiliation.

## Loop

1. Task card (destination + checklist preview) ~2s
2. Room phase 60s — click/drag chores
3. Last mile 15–25s — elevator / gate / crosswalk
4. Ending — lateness + 3-frame recap + one line of copy

Skipped chores are allowed and must change the ending.

## Day 1 — Work meeting (build this first)

Checklist:
- Turn off alarm
- Put on shoes
- Find badge (cat sits on it until clicked twice or dragged off)
- Lock door
- Enter elevator (last mile)

Success window:
- Finish room + elevator before 0:00 → 卡点
- Finish 1–20s late → 晚一点
- Miss elevator or stand still at 0:00 → 没赶上

## Interactions

| Id | Action | Input | Fail flavor |
|---|---|---|---|
| alarm | wake | tap 3 times or swipe | alarm slides under bed |
| shoes | wear | drag pair onto feet | left/right swapped still counts but noted |
| badge | find | move cat, then take badge | cat hops back once |
| lock | leave | click door | door pops open if badge missing |
| elevator | last mile | tap mash / squeeze in | doors close on bag |

## Tone

Dry, specific, slightly mean, never cruel. No moral lecture. Chinese short lines.

## Later days (do not implement until Day 1 feels good)

Day 2 date, Day 3 interview, Day 4 train, Day 5 parents. See conversation notes.
