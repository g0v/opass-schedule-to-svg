# OPass Schedule to SVG

將 OPass 格式的 Google Sheets 議程表轉換為高品質的 SVG 圖片。支援自訂樣式配置與即時預覽功能。

[線上預覽](https://g0v.github.io/opass-schedule-to-svg/)

## 功能特色

- 自動轉換: 從 Google Sheets 自動撈取議程資料並生成 SVG。
- 樣式自訂: 提供 `style.config.json` 設定檔，可調整配色、字型、間距等。
- Playground: 網頁版編輯器，支援即時預覽、樣式調整與設定檔匯入/匯出。

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

## Playground 使用說明

本專案包含一個互動式的 Playground，讓您能直接在此工具中調整樣式。

1. **開啟 Playground**：
   - 部署後點擊首頁右上角的 "Playground" 按鈕。
   - 或本地開啟 `playground.html`。

2. **功能**：
   - **版面設定**：調整行高、SVG 寬度。
   - **配色調整**：即時修改議程區塊、標籤背景色與邊框色。
   - **匯出設定**：調整後，點擊 "匯出設定" 下載 JSON，並覆蓋專案中的 `style.config.json` 即可永久生效。
   - **匯出圖片**：直接下載生成的 SVG 檔案。

## 專案結構

- `index.js`: 主程式，負責資料抓取與 SVG 生成。
- `style.config.json`: 樣式設定檔。
- `playground.html`: 樣式調整編輯器。
- `template/`: SVG 模板邏輯。
  - `scheduleTemplate.js`: 主模板。
  - `scheduleItemTemplate.js`: 單一議程項目模板。

## 相關連結

目前使用的資料為 Summit 2024

- [Google Sheets](https://docs.google.com/spreadsheets/d/1bD97q0i9dmHOlG4hoPln157O_VKCwAwIvo8jMLiWnks/)
- [JSON](https://g0v.github.io/opass-schedule-to-svg/data/schedule.json)
