(() => {
  const chat = document.getElementById("chat");
  const form = document.getElementById("composer");
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  // ============================================================
  // 規則設定：依需求增減關鍵字即可調整判斷結果，不需要串接任何 AI API
  // 判斷順序：感謝 > 要求做某事 > 誇獎 > 其他（隨機回覆）
  // ============================================================

  const THANKS_PATTERNS = [
    /謝謝/, /感謝/, /多謝/, /謝了/, /感恩/, /3q/i, /thank/i, /thx/i,
  ];

  const REQUEST_PATTERNS = [
    /幫(我|忙)/,
    /麻煩(你|妳)/,
    /請(幫|你|妳)/,
    /可以(幫|教|給|告訴)/,
    /能不能/,
    /能否/,
    /你可以.*嗎/,
    /給我/,
    /告訴我/,
    /^(寫|畫|做|算|查|翻譯|解釋|生成|找|訂|設定|教|列)(一下|一個|出|給我)?/,
  ];

  const PRAISE_PATTERNS = [
    /好棒/, /真棒/, /太棒/, /厲害/, /太強/, /好強/, /好聰明/, /聰明/,
    /可愛/, /漂亮/, /好帥/, /帥/, /讚/, /棒棒/, /優秀/, /不錯/,
    /amazing/i, /awesome/i, /great/i, /nice/i, /cool/i, /perfect/i,
  ];

  function classify(text) {
    const t = text.trim();
    if (THANKS_PATTERNS.some((re) => re.test(t))) return "thanks";
    if (REQUEST_PATTERNS.some((re) => re.test(t))) return "request";
    if (PRAISE_PATTERNS.some((re) => re.test(t))) return "praise";
    return "other";
  }

  function buildReply(intent) {
    switch (intent) {
      case "request":
        return "窩補藥";
      case "praise":
        return "🦀🦀";
      case "thanks":
        return "補客氣";
      default: {
        const options = ["好強", "？"];
        return options[Math.floor(Math.random() * options.length)];
      }
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

  function handleSend(event) {
    event.preventDefault();
    const text = input.value;
    if (!text.trim()) return;

    appendMessage(text, "user");
    input.value = "";
    input.focus();
    sendBtn.disabled = true;

    const intent = classify(text);
    const typingEl = showTyping();
    const delay = 450 + Math.random() * 500;

    setTimeout(() => {
      typingEl.remove();
      appendMessage(buildReply(intent), "bot");
      sendBtn.disabled = false;
    }, delay);
  }

  form.addEventListener("submit", handleSend);

  appendMessage("哈囉，我是糖宣，想跟我說什麼？", "bot");
})();
