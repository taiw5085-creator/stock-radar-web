# stock-radar-web

台股飆股雷達 / 股票篩選器 — 獨立專案，與社區代購完全分離。

## 技術棧

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## 開發

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000/stock-radar](http://localhost:3000/stock-radar)

## 專案結構

```
src/
├── app/
│   └── stock-radar/       # 飆股雷達主頁
├── components/stock-radar/ # UI 元件
├── data/
│   └── mock-stocks.ts     # 假資料（第一階段）
└── lib/stock-radar/
    ├── types.ts           # 型別定義
    ├── scoring.ts         # 飆股條件計分邏輯
    ├── format.ts          # 數字格式化
    └── get-stocks.ts      # 資料取得層（待接 API）
```

## 部署規劃

| 服務 | 名稱 |
|------|------|
| GitHub Repo | `stock-radar-web` |
| Vercel Project | `stock-radar-web` |
| Supabase Project | `stock-radar-db`（之後建立） |

## 後續串接

1. **台股 API** — 在 `get-stocks.ts` 替換 mock 為正式行情
2. **Supabase** — 建立 `stock-radar-db`，每日快取篩選結果
3. **Cron** — Vercel Cron 或 Supabase Edge Function 每日自動更新

## 免責聲明

本工具僅做條件篩選，不代表投資建議。
