# 專案敘述

這是一個提供各種服務的專案

此專案所有畫面都必須支持多語系以及明暗模式

且會將效能及隱私放在第一考量

## 圖片轉 webp

用戶可以選擇上傳或拖放多張圖片到頁面上，頁面會顯示轉換後的圖片，使用 swiper 來預覽已經選擇的圖片。

當用戶選擇圖片並點擊轉換按鈕時，會開始轉換圖片，轉換完成後畫面上會顯示轉換成功多少張圖片，以及失敗多少張圖片，並顯示下載按鈕。

若有轉換失敗的圖片會顯示失敗的圖片，並顯示失敗的原因。

當用戶按下下載按鈕時，會將轉換好的圖片壓縮成 zip 檔案，並下載到用戶的電腦上。

## 專案概覽

這是一個用於建構網路應用程式的 Nuxt.js 專案範本。它包含豐富的功能和工具，可加速開發。

**主要技術：**

*   **框架：** Nuxt 4
*   **UI 框架：** Vuetify
*   **狀態管理：** Pinia
*   **樣式：** UnoCSS
*   **國際化：** @nuxtjs/i18n
*   **部署：** 透過 Wrangler 部署到 Cloudflare Pages

**架構：**

*   專案遵循標準的 Nuxt.js 結構。
*   主要應用程式入口點是 `app/app.vue`，它使用 `NuxtLayout` 和 `NuxtPage` 來渲染應用程式。
*   頁面位於 `app/pages` 目錄中。
*   可重複使用的組件可以放在 `app/components` 目錄中。
*   Pinia store 位於 `app/stores`。
*   國際化 (i18n) 在 `i18n/i18n.config.ts` 中配置，語系檔案在 `i18n/locales` 中。

# 建置與執行

**安裝：**

```bash
pnpm install
```

**開發：**

在 `http://localhost:3000` 啟動開發伺服器：

```bash
pnpm dev
```

**建置正式環境：**

```bash
pnpm build
```

**預覽正式環境建置：**

```bash
pnpm preview
```

**部署：**

部署到 Cloudflare Pages：

```bash
pnpm deploy
```

# 開發規範

**程式碼檢查：**

專案使用 ESLint 進行程式碼檢查。

*   執行 `pnpm lint` 以檢查程式碼檢查錯誤。
*   執行 `pnpm lint:fix` 以自動修復程式碼檢查錯誤。

**型別檢查：**

專案使用 TypeScript 進行型別檢查。

*   執行 `pnpm typecheck` 以檢查型別錯誤。

**樣式：**

*   專案使用 UnoCSS 進行原子化 CSS。
*   也使用 Vuetify 組件來建構 UI。
*   全域樣式和 Vuetify 覆寫可以在 `app/assets/vuetify/settings.scss` 中找到。
