# OPass Schedule to SVG

將 OPass 格式的 Google Sheets 議程表轉換為高品質的 SVG 圖片。支援自訂樣式配置與即時預覽功能。

[線上預覽](https://g0v.github.io/opass-schedule-to-svg/)

## 功能特色

- **零設定自動轉換**: 從 Google Sheets 自動撈取 OPass 格式的議程資料，一鍵產出高品質、不失真的 SVG 議程表。
- **純向量動態 QR Code**: 根據議程自動生成原生 SVG 格式的 QR Code，保證縮放絕對清晰。
- **強大且直覺的 Playground**: 內建視覺化編輯器，支援「即時預覽」、「本機字型直接套用」與「靈活版面設定」，讓排版像用設計軟體一樣簡單。
- **一鍵批量匯出**: 樣式調好後，點擊 Download All，自動幫你把所有日期、所有廳別的議程圖檔打包成 ZIP 下載。

## 快速開始

### 1. 安裝依賴

本專案使用 Node.js v24 以上版本。

```bash
npm install
```

### 2. 設定環境變數

`.env` 範例設定如下：

```ini
SPREADSHEET_ID="Google Sheets ID" # 若未設定，將自動使用預設當前 Repo 議程表資料進行測試
DEFAULT_AVATAR=""
AVATAR_BASE_URL=""
```

### 3. 執行生成

執行以下指令，程式將讀取 `style.config.json` 並在 `dist/` 資料夾生成 SVG 與靜態網頁：

```bash
npm run build
```

## 使用自訂資料

您可以不需要修改原始碼，直接在網頁介面上載入自己的議程資料進行預覽與匯出：

1. **進入首頁**：若系統未偵測到預設資料，會自動彈出「自訂資料匯入」面板。
2. **載入議程與樣式**：支援輸入 JSON URL 或直接上傳 `schedule.json` 與 `style.config.json` 檔案。
3. **打包下載**：點擊「Download All」即可獲得完整的 SVG 檔案包。

## Playground 使用說明

Playground 是一個所見即所得的編輯器，讓你能無痛客製化專屬的議程表樣式。

1. **開啟方式**：部署後點擊首頁右上角的 "Playground" 按鈕，或本地開啟 `playground.html`。
2. **核心功能**：
   - **排版與字型**：自訂行高、版面寬度，並無縫套用你電腦裡的本機系統字型（如：PingFang、微軟正黑體）。
   - **色彩與細節**：自由更改背景色、邊框與時間標籤樣式，亦可精準微調 QR Code 與講者的位置及大小。
   - **狀態記憶與匯出**：所有修改都會自動暫存。滿意後，點擊「導出樣式設定檔」並覆蓋專案底下的 `style.config.json`，就能永久套用你的完美設計！

## 專案結構

- `index.js`: 主程式，負責資料抓取與 SVG 生成。
- `style.config.json`: 樣式設定檔。
- `playground.html`: 樣式調整編輯器。
- `template/`: SVG 模板邏輯。
  - `scheduleTemplate.js`: 主模板。
  - `scheduleItemTemplate.js`: 單一議程項目模板。

## 相關連結

目前使用的資料為 Summit 2026

- [Google Sheets](https://docs.google.com/spreadsheets/d/1jD0RtB_J4XxcwbgABtHJWo6XECffTLP6_bgzrcy_rqo)
- [JSON](https://g0v.github.io/opass-schedule-to-svg/data/schedule.json)
