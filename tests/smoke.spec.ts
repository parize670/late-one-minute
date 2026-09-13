import { expect, test, type Page } from "@playwright/test";

interface LateOneMinuteApi {
  getPhase(): string;
  getDebug(): {
    alarmOn: boolean;
    shoes: boolean;
    badgeTaken: boolean;
    doorLocked: boolean;
    ending: string | null;
    tags: string[];
  };
  tapNorm(x: number, y: number): void;
  dragNorm(fromX: number, fromY: number, toX: number, toY: number): void;
}

declare global {
  interface Window {
    __lateOneMinute: LateOneMinuteApi;
  }
}

async function getPhase(page: Page): Promise<string> {
  return page.evaluate(() => window.__lateOneMinute.getPhase());
}

async function enterRoom(page: Page): Promise<void> {
  await page.goto("/");
  await page.getByRole("button", { name: "开始上班" }).click();
  await expect(page.locator(".lom-brief")).toBeVisible();
  await page.getByRole("button", { name: "只剩 60 秒" }).click();
  await expect.poll(() => getPhase(page)).toBe("room");
}

async function mashIntoElevator(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (let tap = 0; tap < 12; tap += 1) {
      window.__lateOneMinute.tapNorm(0.5, 0.5);
    }
  });
  await expect.poll(() => getPhase(page)).toBe("ending");
}

test("标题页能出来", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "迟到一分钟" })).toBeVisible();
  await expect(page.getByRole("button", { name: "开始上班" })).toBeVisible();
  await expect.poll(() => getPhase(page)).toBe("title");
});

test("进入 Day 1 看得到倒计时", async ({ page }) => {
  await enterRoom(page);
  await expect(page.locator(".lom-timer")).toBeVisible();
  await expect(page.locator(".lom-timer-num")).toContainText(/^[0-5]\d\.\d$/);
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflows).toBe(false);
});

test("做完全部家务能进入结算", async ({ page }) => {
  await enterRoom(page);
  await page.evaluate(() => {
    const game = window.__lateOneMinute;
    game.tapNorm(0.2, 0.58);
    game.tapNorm(0.2, 0.58);
    game.tapNorm(0.2, 0.58);
    game.dragNorm(0.26, 0.84, 0.5, 0.88);
    game.dragNorm(0.74, 0.82, 0.64, 0.88);
    game.tapNorm(0.42, 0.74);
    game.tapNorm(0.42, 0.74);
  });
  await page.waitForTimeout(450);
  await page.evaluate(() => {
    const game = window.__lateOneMinute;
    game.tapNorm(0.42, 0.78);
    game.tapNorm(0.86, 0.48);
  });
  await expect.poll(() => getPhase(page)).toBe("lastMile");
  await mashIntoElevator(page);
  await expect(page.locator(".lom-ending")).toBeVisible();
  await expect(page.locator(".lom-end-label")).toHaveText("卡点");
  const debug = await page.evaluate(() => window.__lateOneMinute.getDebug());
  expect(debug).toMatchObject({
    alarmOn: false,
    shoes: true,
    badgeTaken: true,
    doorLocked: true,
    ending: "onTime",
  });
});

test("跳过全部家务也能结算且留下后果", async ({ page }) => {
  await enterRoom(page);
  await page.evaluate(() => {
    window.__lateOneMinute.tapNorm(0.86, 0.48);
    window.__lateOneMinute.tapNorm(0.86, 0.48);
  });
  await expect.poll(() => getPhase(page)).toBe("lastMile");
  await mashIntoElevator(page);
  const debug = await page.evaluate(() => window.__lateOneMinute.getDebug());
  expect(debug.tags).toEqual(
    expect.arrayContaining([
      "闹钟还在床底下响",
      "光脚进的电梯",
      "工牌还在猫身下",
      "门没锁",
    ]),
  );
});
