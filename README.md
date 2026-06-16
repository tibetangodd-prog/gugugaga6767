# 糖宣人機

一個部署在 GitHub Pages 的純前端聊天網站。判斷使用者意圖的部分用 **Google Gemini API**（免費額度、不需要信用卡）來理解語意，不再依靠關鍵字比對；但實際要回覆的固定文字仍由程式碼決定，確保一定符合需求。

金鑰直接寫在 `script.js` 裡（由你自己申請、自己貼上），訪客打開網站就能直接聊天，**完全不需要自己申請任何東西**。

## 運作方式

版面已針對手機螢幕優化（安全區域、避免輸入框被 iOS 自動放大、避免整頁橡皮筋彈動），在桌面瀏覽器打開也會置中顯示成手機寬度。

1. 使用者輸入一句話。
2. 如果這句話包含「煞筆」或「傻逼」，不會呼叫 AI，直接回嗆「你才煞筆」／「你才傻逼」。
3. 否則前端把這句話送給 Gemini API，請 AI 判斷它屬於「request（要求做事）/ praise（誇獎）/ thanks（感謝）/ other（其他）」四種意圖中的哪一種（AI 只回傳意圖標籤，格式是固定的 JSON）。
4. 程式依照判斷結果回覆固定文字：
   - request → 窩補藥
   - praise → 🦀🦀
   - thanks → 補客氣
   - other → 隨機回覆「好強」「？」「咕咕嘎嘎」「阿巴阿巴」其中一句

打開網站的第一句開場白固定是「泥豪」。

## 部署前：先填上你的免費金鑰

1. 前往 [Google AI Studio](https://aistudio.google.com/apikey)，用 Google 帳號登入，點選建立 API 金鑰（不需要信用卡）。
2. 打開 `script.js`，找到最上面這一行：
   ```js
   const GEMINI_API_KEY = "PASTE_YOUR_FREE_GEMINI_API_KEY_HERE";
   ```
   把 `PASTE_YOUR_FREE_GEMINI_API_KEY_HERE` 換成你剛剛申請的金鑰。
3. 存檔後，就可以照下面步驟部署了。

如果忘記填、還是放著預設文字，網站會在聊天時顯示「給網站建立者的提醒」，提示你回來檢查這一步。

## 本機預覽

填好金鑰後，直接用瀏覽器打開 `index.html` 即可使用，不需要安裝套件或啟動伺服器。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個新的 repository（Public）。
2. 把 `index.html`、`style.css`、`script.js` 三個檔案推送到 repository 的根目錄（記得 script.js 裡的金鑰要先填好）。
3. 進入該 repository 的 **Settings → Pages**。
4. Source 選 **Deploy from a branch**；Branch 選 `main`，資料夾選 `/ (root)`，按 **Save**。
5. 等待約 1 分鐘，打開 GitHub 給的網址（格式類似 `https://你的帳號.github.io/repo名稱/`），就能看到「糖宣人機」上線，任何人打開都能直接聊天。

## ⚠️ 關於金鑰曝光的風險（重要，請務必看完）

因為網站是純前端、GitHub Pages 沒有伺服器能藏金鑰，把金鑰直接寫進 `script.js` 代表**任何訪客只要打開瀏覽器開發者工具（網路分析）都能看到這把金鑰**，理論上可能被複製去呼叫 API、消耗掉你的每日免費額度。

為了把風險降到最低，務必做到：

- **不要**讓申請這把金鑰的 Google Cloud 專案連結任何付款方式／信用卡。只要沒有連結付款方式，超過免費額度就只會被拒絕（額度用完、隔天重置），**不會產生任何費用**。
- 如果發現額度常常被用完，代表金鑰可能被別人抓去用了：回 [Google AI Studio](https://aistudio.google.com/apikey) 刪掉這把金鑰、申請一把新的，換到 `script.js` 裡重新部署即可，舊金鑰會立刻失效。
- 不要把這把金鑰用在任何其他重要或正式的專案上，當它是「會被看到」的金鑰來用。

## 可以調整的地方（在 `script.js` 最上方／對應函式裡）

- `GEMINI_API_KEY`：你的金鑰。
- `MODEL`：目前用 `gemini-2.5-flash`，想更省額度可以換成 `gemini-2.5-flash-lite`。
- `SYSTEM_PROMPT`：給 AI 的判斷規則說明，可依需要調整四種意圖的定義或新增意圖。
- `detectInsultMirror()`：互嗆關鍵字與對應回嗆文字，要新增其他關鍵字就加在這個函式裡。
- `buildReply()`：四種意圖各自對應的固定回覆文字，other 情境的隨機選項也在這裡。
