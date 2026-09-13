# 《迟到一分钟》 Late One Minute

60 秒出门倒计时小游戏。你被时间诅咒了：无论计划几点出门，真实只剩 60 秒。

## 协作工具

| 工具 | 职责 |
|---|---|
| **Grok Bot** | 产品经理：文案、关卡表、结局、Issue、验收 |
| **Grok Build** | 主程序：本地 `D:\\late-one-minute` 里写代码、跑游戏、提交 |
| **Codex** | 技术主管：架构、测试、Playwright 试玩、修 bug、代码审查 |

详细规则见 `AGENTS.md`。  
玩法见 `docs/GAME_DESIGN.md`。  
三份可直接粘贴的提示词见 `docs/PROMPTS.md`。

## 本地（Windows D 盘）

```bat
D:
mkdir D:\late-one-minute
cd /d D:\late-one-minute
git clone https://github.com/parize670/late-one-minute.git .
```

代码就绪后：

```bat
npm install
npm run dev
```

## 目标栈

- Vite + TypeScript + 原生 Canvas / DOM
- 手机优先，点击 / 拖拽
- 中文 UI
- 无后端（v1 单机）
- GitHub Pages 或本地静态可玩

## v1 验收

- Day 1 上班关可玩
- 60 秒房间 + 电梯最后一公里
- 猫会占目标物
- 3 个结算结局：卡点 / 晚一点 / 没赶上
