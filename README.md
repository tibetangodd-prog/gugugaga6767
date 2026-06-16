# 糖宣人機

一個純前端、規則判斷式的小聊天機器人，不需要任何後端或 AI API，純粹用關鍵字判斷使用者的意圖，再依規則回覆。

## 本機預覽

直接用瀏覽器打開 `index.html` 即可使用，不需要安裝套件或啟動伺服器。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個新的 repository（Public）。
2. 把 `index.html`、`style.css`、`script.js` 三個檔案推送（或上傳）到 repository 的根目錄。
3. 進入該 repository 的 **Settings → Pages**。
4. 在「Build and deployment」的 Source 選擇 **Deploy from a branch**；Branch 選 `main`（或你推送的分支），資料夾選 `/ (root)`，按 **Save**。
5. 等待約 1 分鐘，GitHub 會給一個網址，格式類似 `https://你的帳號.github.io/repo名稱/`，打開即可看到「糖宣人機」上線。

## 回覆規則

判斷順序為：感謝 > 要求做某事 > 誇獎 > 其他。

- 偵測到「要求做某事」（例如：幫我、可以幫、麻煩你…）→ 回覆「窩補藥」
- 偵測到「誇獎」（例如：好棒、厲害、太強…）→ 回覆「🦀🦀」
- 偵測到「感謝」（例如：謝謝、感謝、多謝…）→ 回覆「補客氣」
- 其他情況 → 隨機回覆「好強」或「？」

所有關鍵字清單都放在 `script.js` 最上方的 `THANKS_PATTERNS`／`REQUEST_PATTERNS`／`PRAISE_PATTERNS`，可自行增減調整辨識的準確度。
