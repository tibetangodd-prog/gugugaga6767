(() => {
  const chat = document.getElementById("chat");
  const form = document.getElementById("composer");
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  // ============================================================
  // 把你自己在 Google AI Studio 申請的免費 Gemini API 金鑰貼在這裡，
  // 訪客就完全不用自己申請金鑰，打開網站就能直接聊天。
  // 取得免費金鑰：https://aistudio.google.com/apikey
  //
  // 注意：這把金鑰會直接出現在公開的網頁程式碼裡，任何訪客只要打開
  // 瀏覽器開發者工具都能看到它，理論上可能被拿去消耗你的每日免費額度。
  // 因為是免費額度，最多就是被用完、隔天重置，不會產生任何費用——
  // 只要確保這把金鑰所在的 Google Cloud 專案沒有連結任何付款方式即可。
  // 如果額度被濫用，直接去 AI Studio 刪掉這把金鑰、申請一把新的換上即可。
  // ============================================================
  const GEMINI_API_KEY = "PASTE_YOUR_FREE_GEMINI_API_KEY_HERE";

  // 想換模型只要改這個字串，例如想要更省額度可以換成 "gemini-2.5-flash-lite"
  const MODEL = "gemini-2.5-flash";

  // ============================================================
  // 用 Google Gemini API（有免費額度，不需要信用卡）當作「簡單 AI agent」。
  // 由 AI 理解語意來判斷使用者的意圖，而不是用關鍵字比對。
  // 為了確保回覆內容一定符合需求，AI 只負責「判斷意圖」，
  // 實際要回的文字仍由下面的 buildReply() 決定，AI 不會自由發揮回覆內容。
  // ============================================================
  const SYSTEM_PROMPT = [
    "你是一個訊息意圖分類器。請判斷使用者傳來的單則訊息屬於以下四種意圖中的哪一種：",
    "",
    "1. request：使用者在請求、指示、拜託對方做某件具體的事（例如撰寫、查詢、計算、翻譯、規劃、推薦、提醒、修改等），不論是直接命令或委婉的「可以幫我…嗎」、「麻煩你…」都算。",
    "2. praise：使用者在稱讚、誇獎對方本身，例如說對方很棒、很聰明、很厲害、很可愛等正向評價。",
    "3. thanks：使用者在表達感謝，例如謝謝、感謝、多謝。",
    "4. other：以上三者都不是，例如閒聊、打招呼、抱怨、單純陳述、與請求無關的問題等。",
    "",
    "如果一句話同時包含感謝與請求（例如「謝謝你幫我查」），請判斷為 thanks。",
    "只能回傳一個意圖，不要加任何說明文字。",
  ].join("\n");

  const RESPONSE_SCHEMA = {
    type: "object",
    properties: {
      intent: {
        type: "string",
        enum: ["request", "praise", "thanks", "other"],
      },
    },
    required: ["intent"],
  };

  // ---------- 呼叫 Gemini API 做意圖判斷 ----------
  async function classifyIntent(text) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_YOUR_FREE_GEMINI_API_KEY_HERE") {
      const err = new Error("尚未在 script.js 設定 Gemini API 金鑰");
      err.code = "NOT_CONFIGURED";
      throw err;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 50,
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      });
    } catch (networkErr) {
      const err = new Error("網路連線失敗");
      err.code = "NETWORK";
      throw err;
    }

    if (!res.ok) {
      const err = new Error(`Gemini API 錯誤（${res.status}）`);
      if (res.status === 400 || res.status === 403) {
        err.code = "BAD_KEY";
      } else if (res.status === 429) {
        err.code = "RATE_LIMIT";
      } else {
        err.code = "API_ERROR";
      }
      throw err;
    }

    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) {
      const err = new Error("AI 沒有回應內容");
      err.code = "EMPTY";
      throw err;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const err = new Error("AI 回應格式不是 JSON");
      err.code = "PARSE";
      throw err;
    }

    const validIntents = ["request", "praise", "thanks", "other"];
    return validIntents.includes(parsed.intent) ? parsed.intent : "other";
  }

  // ---------- 互嗆偵測：不用 AI，直接關鍵字比對，命中就跳過 AI 分類 ----------
  function detectInsultMirror(text) {
    if (text.includes("煞筆")) return "你才煞筆";
    if (text.includes("傻逼")) return "你才傻逼";
    return null;
  }

  // 意圖判斷出來後，由這支程式決定固定的回覆文字（不交給 AI 自由發揮）
  function buildReply(intent) {
    switch (intent) {
      case "request":
        return "窩補藥";
      case "praise":
        return "🦀🦀";
      case "thanks":
        return "補客氣";
      default: {
        const options = ["好強", "？", "咕咕嘎嘎", "阿巴阿巴"];
        return options[Math.floor(Math.random() * options.length)];
      }
    }
  }

  function errorMessageFor(err) {
    switch (err.code) {
      case "NOT_CONFIGURED":
        return "（給網站建立者的提醒：還沒在 script.js 設定 Gemini API 金鑰，請依照 README 設定後再部署。）";
      case "BAD_KEY":
        return "（給網站建立者的提醒：Gemini 金鑰好像失效或沒有權限，去 AI Studio 檢查一下。）";
      case "RATE_LIMIT":
        return "今天的免費額度好像用完了，明天再試試看～";
      case "NETWORK":
        return "連不上網路，檢查一下連線再試一次吧。";
      default:
        return "糖宣連不到 AI 大腦，稍後再試一次看看吧。";
    }
  }

  function appendMessage(text, who) {
    const el = document.createElement("div");
    el.className = `msg ${who}`;
    el.textContent = text;
    chat.appendChild(el);
    scrollToBottom();
    return el;
  }

  function showTyping() {
    const el = document.createElement("div");
    el.className = "msg bot typing";
    el.innerHTML = "<span></span><span></span><span></span>";
    chat.appendChild(el);
    scrollToBottom();
    return el;
  }

  function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
  }

  async function handleSend(event) {
    event.preventDefault();
    const text = input.value;
    if (!text.trim()) return;

    appendMessage(text, "user");
    input.value = "";
    input.focus();
    sendBtn.disabled = true;

    const typingEl = showTyping();

    const mirrorReply = detectInsultMirror(text);
    if (mirrorReply) {
      setTimeout(() => {
        typingEl.remove();
        appendMessage(mirrorReply, "bot");
        sendBtn.disabled = false;
      }, 350);
      return;
    }

    try {
      const intent = await classifyIntent(text);
      typingEl.remove();
      appendMessage(buildReply(intent), "bot");
    } catch (err) {
      console.error(err);
      typingEl.remove();
      appendMessage(errorMessageFor(err), "error");
    } finally {
      sendBtn.disabled = false;
    }
  }

  form.addEventListener("submit", handleSend);

  appendMessage("泥豪", "bot");
})();
