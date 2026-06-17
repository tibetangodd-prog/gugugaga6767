(() => {
  const chat = document.getElementById("chat");
  const form = document.getElementById("composer");
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  // ============================================================
  // 純關鍵字判斷，不呼叫任何 AI API、不需要任何金鑰。
  // 純前端、零設定，GitHub Pages 開箱即用，訪客打開就能直接聊天。
  // 判斷優先順序：互嗆 > 感謝 > 要求做某事 > 誇獎 > 其他（隨機回覆）
  // 想要更精準，就直接在下面對應的陣列裡增減關鍵字即可。
  // ============================================================

  // ---------- 互嗆：命中就直接回嗆，不進入下面的意圖判斷 ----------
  const INSULT_PATTERNS = [
    { keyword: "煞筆", reply: "你才煞筆" },
    { keyword: "傻逼", reply: "你才傻逼" },
  ];

  // ---------- 感謝 ----------
  const THANKS_KEYWORDS = [
    "謝謝", "謝謝你", "謝謝妳", "謝謝您", "謝謝大家",
    "感謝", "感謝你", "感謝妳", "感謝您", "多謝", "多謝你",
    "謝了", "謝啦", "謝拉", "感恩", "感恩你", "感恩在心",
    "太感謝了", "非常感謝", "十分感謝", "萬分感謝", "感激", "感激不盡",
    "揪甘心", "真感心", "阿里嘎多", "謝主隆恩",
    "thank you", "thank u", "thanks", "thank", "thx", "tks", "tysm",
    "3q", "三q", "三Q", "3Q",
  ];

  // ---------- 誇獎 ----------
  const PRAISE_KEYWORDS = [
    "好棒", "真棒", "太棒了", "超棒", "很棒", "棒棒", "棒呆", "棒欸", "棒喔",
    "厲害", "好厲害", "真厲害", "太厲害了", "超厲害", "很厲害", "厲害了",
    "厲害欸", "厲害喔", "好強", "真強", "太強了", "超強", "很強", "強欸",
    "強喔", "強到", "聰明", "好聰明", "真聰明", "太聰明了", "超聰明",
    "很聰明", "可愛", "好可愛", "真可愛", "超可愛", "太可愛了", "萌",
    "好萌", "卡哇伊", "漂亮", "好漂亮", "真漂亮", "美", "好美", "帥",
    "好帥", "真帥", "超帥", "讚", "真讚", "超讚", "給讚", "給力", "神",
    "太神了", "真神", "神人", "大神", "是神", "牛", "真牛", "太牛了",
    "牛逼", "屌", "好屌", "真屌", "超屌", "優秀", "很優秀", "不錯",
    "很不錯", "真不錯", "完美", "太完美了", "滿分", "了不起", "佩服",
    "我服了", "服了你", "amazing", "awesome", "great", "nice", "cool",
    "perfect", "smart", "good job", "well done", "genius",
  ];

  // ---------- 要求做某事 ----------
  const REQUEST_KEYWORDS = [
    "幫我", "幫忙", "幫個忙", "幫幫我", "幫一下",
    "麻煩你", "麻煩妳", "麻煩您", "拜託你", "拜託妳", "拜託",
    "求你", "求妳", "求求你", "可以幫", "能不能", "能否", "可否",
    "你可以", "妳可以", "你能", "妳能", "您可以", "您能",
    "請幫", "請你", "請妳", "請您",
    "給我", "給個", "告訴我", "教我", "跟我說", "順便幫", "可以的話",
    "寫一個", "寫個", "寫一篇", "畫一個", "畫個", "做一個", "做個",
    "弄一個", "弄個", "來一個", "給一個", "幫我寫", "幫我做", "幫我查",
    "查一下", "查查", "查詢", "搜尋", "搜一下", "搜尋一下", "找一下",
    "幫忙找", "翻譯", "幫我翻", "解釋", "說明一下", "講解", "規劃",
    "安排", "設計一個", "修改", "改一下", "幫我改", "整理", "統整",
    "總結", "摘要", "推薦", "建議", "提醒我", "設定", "預約", "訂一個",
    "列出", "列舉", "生成", "產生", "製作", "編寫", "撰寫", "創作",
    "計算", "算一下", "幫我算", "去",
    "please", "can you", "could you", "would you", "help me", "can u",
    "plz", "pls",
  ];

  function detectInsultMirror(text) {
    const hit = INSULT_PATTERNS.find((item) => text.includes(item.keyword));
    return hit ? hit.reply : null;
  }

  function classifyIntent(text) {
    if (THANKS_KEYWORDS.some((kw) => text.includes(kw))) return "thanks";
    if (REQUEST_KEYWORDS.some((kw) => text.includes(kw))) return "request";
    if (PRAISE_KEYWORDS.some((kw) => text.includes(kw))) return "praise";
    return "other";
  }

  // 意圖判斷出來後，由這支程式決定固定的回覆文字
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

    const typingEl = showTyping();
    const delay = 300 + Math.random() * 400;

    setTimeout(() => {
      typingEl.remove();
      const mirrorReply = detectInsultMirror(text);
      const reply = mirrorReply || buildReply(classifyIntent(text));
      appendMessage(reply, "bot");
      sendBtn.disabled = false;
    }, delay);
  }

  form.addEventListener("submit", handleSend);

  appendMessage("泥豪", "bot");
})();
