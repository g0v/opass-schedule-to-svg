# OPass Schedule to SVG

將 OPass 格式的 Google Sheets 議程表轉換為高品質的 SVG 圖片。支援自訂樣式配置與即時預覽功能。

[線上預覽](https://g0v.github.io/opass-schedule-to-svg/)

## 功能特色

- **自動轉換**: 從 Google Sheets 自動撈取議程資料並生成 SVG。
- **自訂資料來源**: 支援透過 URL 或上傳 JSON 檔案，載入自訂的 OPass 格式議程與樣式表。
- **批量匯出**: 支援一鍵打包下載所有日期、所有廳別的議程圖檔 (ZIP)。
- **本機字型支援**: 支援讀取本機系統字型（需 Chrome/Edge 授權），並提供即時預覽與搜尋功能。
- **Playground**: 互動式編輯器，支援即時預覽、樣式調整、設定檔匯入/匯出與狀態記憶。

## 快速開始

### 1. 安裝依賴

本專案使用 Node.js v22 以上版本。

```bash
npm install
```

### 2. 設定環境變數

複製 `.env` 範例設定如下：

```ini
GCP_API_KEY="Google Cloud API Key"
SPREADSHEET_ID="Google Sheets ID"

# 若未設定，將自動使用預設的 g0v Summit 2024 議程表資料進行測試
```

### 3. 執行生成

執行以下指令，程式將讀取 `style.config.json` 並在 `dist/` 資料夾生成 SVG 與靜態網頁：

```bash
npm run build
```

## 使用自訂資料

您可以不需要修改原始碼，直接在網頁介面上載入自己的議程資料進行預覽與匯出：

1. **進入首頁**：若系統未偵測到預設資料，會自動彈出「自訂資料匯入」面板（亦可手動開啟）。
2. **載入議程**：支援輸入 OPass 格式的 JSON URL 或直接上傳 `.json` 檔案。
3. **載入樣式**：同樣支援 URL 或檔案上傳自訂的 `style.config.json` 樣式檔。
4. **批量匯出**：設定完成後，點擊「打包下載所有廳別」，程式會自動生成所有組合並打包為 ZIP 檔下載。

## Playground 使用說明

本專案包含一個互動式的 Playground，讓您能直接在此工具中調整樣式。

1. **開啟 Playground**：
   - 部署後點擊首頁右上角的 "Playground" 按鈕。
   - 或本地開啟 `playground.html`。

2. **功能**：
   - **版面設定**：調整行高、SVG 寬度、字型樣式與字重。
   - **本機字型整合**：開啟「使用本機字型」開關並授權後，可直接搜尋並選用電腦中的系統字型（如：微軟正黑體、PingFang 等）。
   - **配色調整**：即時修改議程區塊、標籤背景色與邊框色。
   - **同步與記憶**：支援從首頁同步樣式，並自動記住您的編輯狀態與字型授權設定，關閉分頁後進度不遺失。
   - **匯出設定**：調整後，點擊「導出樣式設定檔」下載 JSON，並覆蓋專案中的 `style.config.json` 即可永久生效。
   - **匯出圖片**：直接下載生成的 SVG 檔案。

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
