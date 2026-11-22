/* -*- coding: utf-8 -*-
 * QChinese – Dedicated AI Chinese Tutor Hub (6 Specialized Modes):
 * 1. Word Explainer  2. Sentence Corrector  3. 10-Scenario Roleplay Chat (toggleable Pinyin/Vi)
 * 4. Pronunciation Coach (honest STT limitations)  5. Grammar Explainer  6. Personalized Drills
 * Works seamlessly with Backend (/api/ai/*) AND Static Fallback (GitHub Pages).
 */

window.QAiTutor = (function () {
  let activeTab = "explain_word"; // explain_word | fix_sentence | conversation | pronunciation | explain_grammar | personalized
  let selectedHsk = 1;
  let chatScenario = "greeting";
  let chatShowPinyin = true;
  let chatShowVi = false; // Off by default to train reflex!
  let chatMessages = [];
  let lastWordRes = null;
  let lastSentRes = null;
  let lastGramRes = null;
  let lastPronRes = null;
  let lastDrillRes = null;

  const SCENARIOS = [
    { id: "greeting", label: "👋 Chào hỏi" },
    { id: "intro", label: "🪪 Giới thiệu bản thân" },
    { id: "shopping", label: "🛍️ Đi mua sắm" },
    { id: "food", label: "🍜 Gọi món ăn" },
    { id: "direction", label: "🗺️ Hỏi đường" },
    { id: "travel", label: "✈️ Đi du lịch" },
    { id: "friends", label: "☕ Bạn bè" },
    { id: "school", label: "🎓 Trường học" },
    { id: "interview", label: "💼 Phỏng vấn xin việc" },
    { id: "office", label: "🏢 Giao tiếp công sở" }
  ];

  const LOCAL_CONFUSED = {
    "了解": {
      pinyin: "liǎojiě", pos: "Động từ (动词)", vietnamese: "hiểu rõ, nắm tường tận, tìm hiểu sâu",
      english: "to understand deeply; to find out about",
      usage: "Nhấn mạnh mức độ hiểu sâu sắc về con người, sự việc hoặc văn hóa.",
      context: "Học tập, công việc và giao tiếp khi muốn nói hiểu rõ bản chất.",
      synonyms: ["明白 (míngbai)", "熟悉 (shúxī)"], antonyms: ["误解 (wùjiě)", "陌生 (mòshēng)"],
      confusedPair: "了解 vs 知道: 知道 chỉ là 'biết thông tin' (我知道他的名字), còn 了解 là 'hiểu sâu' (我很了解他). Dùng được 很了解, KHÔNG dùng 很知道!",
      vietnamesePitfalls: "Người Việt hay dịch 'rất biết' thành '很知道' (sai) → phải dùng '很了解'.",
      examples: [{ chinese: "我想更多地了解中国文化。", pinyin: "Wǒ xiǎng gèng duō de liǎojiě Zhōngguó wénhuà.", vietnamese: "Tôi muốn tìm hiểu sâu hơn về văn hóa Trung Quốc." }]
    },
    "还是": {
      pinyin: "háishi", pos: "Liên từ / Phó từ", vietnamese: "hay là (câu hỏi); vẫn cứ",
      english: "or (in questions); still",
      usage: "Nối hai lựa chọn trong CÂU HỎI lựa chọn (A 还是 B?).",
      context: "Hỏi lựa chọn trong ăn uống, mua sắm, kế hoạch.",
      synonyms: ["或者 (huòzhě - câu kể)"], antonyms: [],
      confusedPair: "还是 (câu HỎI: 你喝茶还是喝咖啡？) vs 或者 (câu TRẦN THUẬT: 喝茶或者喝咖啡都可以).",
      vietnamesePitfalls: "Không dùng 或者 để đặt câu hỏi lựa chọn!",
      examples: [{ chinese: "你喝茶还是喝咖啡？", pinyin: "Nǐ hē chá háishi hē kāfēi?", vietnamese: "Bạn uống trà hay uống cà phê?" }]
    }
  };

  function localAnalyzeChinese(text) {
    const cleaned = String(text || "").trim();
    let corrected = cleaned;
    const issues = [];
    if (cleaned.includes("不有")) {
      corrected = corrected.replace(/不有/g, "没有");
      issues.push({ category: "Ngữ pháp (不 vs 没)", detail: "Động từ '有' luôn phủ định bằng '没' → '没有', không dùng '不有'." });
    }
    const adjRe = /(我|你|他|她|我们|你们|他们|中文|汉字|天气)是(好|忙|累|高|大|难|贵|漂亮|高兴|冷|热)(?!的)/g;
    if (adjRe.test(corrected)) {
      corrected = corrected.replace(adjRe, "$1很$2");
      issues.push({ category: "Câu vị ngữ tính từ", detail: "Chủ ngữ + Tính từ KHÔNG nối bằng '是', hãy dùng phó từ mức độ '很' (vd: 我很好)." });
    }
    const erRe = /二(个|口|本|杯|碗|岁|块|件|位|条|张)/g;
    if (erRe.test(corrected)) {
      corrected = corrected.replace(erRe, "两$1");
      issues.push({ category: "Dùng từ (二 vs 两)", detail: "Trước lượng từ phải dùng '两' (两个人, 两本书) chứ không dùng '二'." });
    }
    const timeEndRe = /(我|你|他|她|我们)([^，。！？]+?)(今天|明天|昨天|现在|每天)(?=[，。！？]|$)/;
    if (timeEndRe.test(corrected)) {
      corrected = corrected.replace(timeEndRe, "$1$3$2");
      issues.push({ category: "Trật tự thời gian", detail: "Từ chỉ thời gian (今天, 明天, 昨天...) phải đặt TRƯỚC động từ hoặc đầu câu, không đặt cuối câu như tiếng Việt." });
    }
    const hasHanzi = /[\u4e00-\u9fff]/.test(cleaned);
    if (!hasHanzi) {
      issues.push({ category: "Chưa có chữ Hán", detail: "Hãy nhập câu bằng Chữ Hán Giản thể (简体中文)." });
    }
    return { original: cleaned, corrected, issues, hasHanzi };
  }

  /* Shared helper callable from Vocab, Writing & Materials modules! */
  async function evaluateSentenceSmart(payload) {
    try {
      if (QCore.getServerHealth().ok) {
        return await QCore.apiFetch("/api/ai/writing", { method: "POST", body: payload });
      }
    } catch (_) {}
    const a = localAnalyzeChinese(payload.text || "");
    const missingTarget = payload.targetWord && !a.corrected.includes(payload.targetWord);
    const score = !a.hasHanzi ? 30 : Math.max(35, 94 - a.issues.length * 15 - (missingTarget ? 18 : 0));
    return {
      score,
      original: a.original,
      corrected: a.corrected,
      whyWrong: a.issues.length ? a.issues.map((i) => i.detail).join(" ") : (missingTarget ? `Bạn chưa đưa từ mục tiêu "${payload.targetWord}" vào câu.` : "Câu đúng cấu trúc cơ bản tiếng Trung Giản thể!"),
      criteria: [
        { name: "Chữ Hán (Giản thể)", status: a.hasHanzi ? "good" : "error", comment: a.hasHanzi ? "Đúng chữ Giản thể." : "Chưa có chữ Hán." },
        { name: "Ngữ pháp & Trật tự từ", status: a.issues.length ? "error" : "good", comment: a.issues.length ? a.issues[0].detail : "Trật tự Chủ – (Thời gian/Địa điểm) – Động – Tân hợp lý." },
        { name: "Đáp ứng yêu cầu đề bài", status: missingTarget ? "warn" : "good", comment: missingTarget ? `Cần dùng từ '${payload.targetWord}'.` : "Bám sát đề bài." }
      ],
      provider: "offline-pedagogical"
    };
  }

  function renderSentenceEvaluationCard(g) {
    if (!g) return "";
    return `
      <div class="card-subtle" style="border-color:${(g.score || 0) >= 80 ? "var(--primary)" : "var(--accent-amber)"};">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong>🎯 Điểm đánh giá: <span style="color:var(--primary);font-size:18px;">${g.score != null ? g.score : "—"}/100</span></strong>
          <span class="badge badge-blue">${QCore.escapeHtml(g.provider || "AI Tutor")}</span>
        </div>
        <div style="margin-bottom:6px;"><strong>Bài gốc của bạn:</strong> <span class="hanzi-text" style="font-size:17px;">${QCore.escapeHtml(g.original)}</span></div>
        <div style="margin-bottom:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <strong>Phiên bản sửa chuẩn:</strong>
          <span class="hanzi-text" style="font-size:18px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(g.corrected)}</span>
          <button class="btn btn-soft btn-sm" onclick="QCore.speakChinese('${QCore.escapeHtml(g.corrected).replace(/'/g, "")}')">🔊 Nghe</button>
        </div>
        ${g.pinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--primary);margin-bottom:4px;">${QCore.escapeHtml(g.pinyin)}</div>` : ""}
        ${g.vietnamese ? `<div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px;">🇻🇳 ${QCore.escapeHtml(g.vietnamese)}</div>` : ""}
        <p style="margin:6px 0 8px;font-size:13.5px;">💡 ${QCore.escapeHtml(g.whyWrong || g.explanation || "")}</p>
        ${Array.isArray(g.criteria) ? `
          <div style="display:flex;flex-direction:column;gap:4px;font-size:12.5px;">
            ${g.criteria.map((c) => `<div>${c.status === "good" ? "✅" : c.status === "warn" ? "⚠️" : "❌"} <strong>${QCore.escapeHtml(c.name)}:</strong> ${QCore.escapeHtml(c.comment)}</div>`).join("")}
          </div>
        ` : ""}
      </div>
    `;
  }

  function renderAiTutor(container, params = {}) {
    const st = QCore.getState();
    selectedHsk = st && st.profile ? st.profile.hskLevel || 1 : 1;
    if (params && params.tab) activeTab = params.tab;
    const health = QCore.getServerHealth();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🤖 QChinese AI Tutor – Gia Sư Tiếng Trung Thông Minh</h2>
          <p>Giải thích từ vựng sâu, sửa câu tiếng Trung, luyện hội thoại 10 tình huống, luyện phát âm, giải thích ngữ pháp và tự tạo bài tập từ lỗi thực tế của bạn.</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <span class="badge ${health.aiConfigured ? "badge-jade" : "badge-blue"}">
            ${health.aiConfigured ? `⚡ AI Live: ${QCore.escapeHtml(health.aiProvider)}` : "🧠 Chế độ Sư phạm Tích hợp (cấu hình GEMINI_API_KEY để bật LLM)"}
          </span>
          <select class="select-field" id="ait-hsk-sel" style="width:auto;padding:6px 10px;font-size:13px;">
            ${[1, 2, 3, 4, 5, 6].map((lv) => `<option value="${lv}" ${selectedHsk === lv ? "selected" : ""}>Trình độ: HSK ${lv}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="tabs-bar" style="margin-bottom:20px;flex-wrap:wrap;">
        <button class="tab-pill ${activeTab === "explain_word" ? "active" : ""}" data-aitab="explain_word">1. 📖 Giải thích từ vựng</button>
        <button class="tab-pill ${activeTab === "fix_sentence" ? "active" : ""}" data-aitab="fix_sentence">2. ✍️ Sửa câu tiếng Trung</button>
        <button class="tab-pill ${activeTab === "conversation" ? "active" : ""}" data-aitab="conversation">3. 💬 Hội thoại 10 tình huống</button>
        <button class="tab-pill ${activeTab === "pronunciation" ? "active" : ""}" data-aitab="pronunciation">4. 🎙️ Luyện phát âm</button>
        <button class="tab-pill ${activeTab === "explain_grammar" ? "active" : ""}" data-aitab="explain_grammar">5. 🧩 Giải thích ngữ pháp</button>
        <button class="tab-pill ${activeTab === "personalized" ? "active" : ""}" data-aitab="personalized">6. 🎯 Bài tập cá nhân hóa</button>
      </div>

      <div id="ai-tutor-stage"></div>
    `;

    container.querySelector("#ait-hsk-sel").onchange = (e) => {
      selectedHsk = Number(e.target.value);
    };
    container.querySelectorAll("[data-aitab]").forEach((b) => {
      b.onclick = () => {
        activeTab = b.getAttribute("data-aitab");
        renderAiTutor(container);
      };
    });

    const stage = container.querySelector("#ai-tutor-stage");
    if (activeTab === "explain_word") renderWordExplainer(stage, params.word || "");
    else if (activeTab === "fix_sentence") renderSentenceCorrector(stage);
    else if (activeTab === "conversation") renderConversationHub(stage);
    else if (activeTab === "pronunciation") renderPronunciationCoach(stage);
    else if (activeTab === "explain_grammar") renderGrammarExplainer(stage);
    else renderPersonalizedDrills(stage);
  }

  /* ---------- 1. AI WORD EXPLAINER ---------- */
  function renderWordExplainer(stage, presetWord) {
    stage.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <h3 style="margin:0 0 8px;">📖 AI Giải thích từ vựng & Phân biệt từ dễ nhầm</h3>
        <p style="margin:0 0 12px;font-size:13.5px;color:var(--text-secondary);">Nhập bất kỳ từ tiếng Trung nào (vd: <code>了解</code>, <code>知道</code>, <code>还是</code>, <code>一点儿</code>, <code>会</code>...) để xem nghĩa Việt, Pinyin, ngữ cảnh, từ đồng nghĩa/trái nghĩa và lỗi người Việt hay gặp:</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <input class="input-field hanzi-text" id="ait-word-inp" data-pinyin-ime="true" value="${QCore.escapeHtml(presetWord)}" placeholder="Nhập chữ Hán hoặc gõ Pinyin..." style="flex:1;min-width:220px;font-size:18px;" />
          <button class="btn btn-primary" id="ait-word-go">🤖 Giải thích từ này</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <span style="font-size:12.5px;color:var(--text-muted);align-self:center;">Thử nhanh:</span>
          ${["了解", "知道", "还是", "一点儿", "会", "便宜", "习惯"].map((w) => `<button class="btn btn-outline btn-sm hanzi-text" data-qword="${w}">${w}</button>`).join("")}
        </div>
      </div>
      <div id="ait-word-out">${lastWordRes ? renderWordResultHTML(lastWordRes) : ""}</div>
    `;
    if (window.QPinyinIME) QPinyinIME.attachAll(stage);

    const runExplain = async (wStr) => {
      const w = (wStr || stage.querySelector("#ait-word-inp").value || "").trim();
      if (!w) return;
      stage.querySelector("#ait-word-inp").value = w;
      const out = stage.querySelector("#ait-word-out");
      out.innerHTML = `<div class="card">⏳ Đang phân tích từ "${QCore.escapeHtml(w)}"...</div>`;

      await QVocabStore.init();
      const found = QVocabStore.lookupHanzi(w);
      const knownData = found ? {
        pinyin: found.pinyin,
        vietnamese: (found.meanings.vietnamese || []).join("; "),
        english: (found.meanings.english || []).slice(0, 3).join("; "),
        han_viet: found.han_viet || "",
        pos: found.part_of_speech || "",
        hsk_level: found.hsk_level,
        confused_with: found.confused_with || "",
        examples: found.examples || []
      } : {};

      let res = null;
      try {
        if (QCore.getServerHealth().ok) {
          res = await QCore.apiFetch("/api/ai/explain-word", { method: "POST", body: { word: w, hskLevel: selectedHsk, knownData } });
        }
      } catch (_) {}

      if (!res) {
        if (LOCAL_CONFUSED[w]) {
          res = Object.assign({ word: w, provider: "offline-pedagogical" }, LOCAL_CONFUSED[w]);
        } else {
          res = {
            word: w,
            pinyin: knownData.pinyin || "(Mở Kho từ vựng cấp cao hơn hoặc bật GEMINI_API_KEY để tra toàn bộ từ ngoài HSK)",
            pos: knownData.pos || "Từ vựng tiếng Trung Giản thể",
            vietnamese: knownData.vietnamese || (knownData.english ? `Nghĩa Anh (CC-CEDICT): ${knownData.english}` : "Chưa tìm thấy trong từ điển cục bộ."),
            english: knownData.english || "",
            han_viet: knownData.han_viet || "",
            usage: knownData.hsk_level ? `Thuộc trình độ HSK ${knownData.hsk_level}.` : "Dùng trong giao tiếp tiếng Trung Giản thể.",
            context: "Ngữ cảnh giao tiếp và đọc hiểu tiếng Trung phổ thông.",
            synonyms: [], antonyms: [],
            confusedPair: knownData.confused_with || "Thử hỏi các cặp dễ nhầm: 了解 vs 知道, 还是 vs 或者, 一点儿 vs 有点儿, 会 vs 能/可以.",
            vietnamesePitfalls: "Chú ý phát âm rõ dấu thanh điệu và trật tự từ trong câu.",
            examples: knownData.examples || [],
            provider: "offline-pedagogical"
          };
        }
      }
      lastWordRes = res;
      QCore.logAiHistory({ mode: "explain_word", input: w });
      out.innerHTML = renderWordResultHTML(res);
      bindWordResultActions(out, res);
    };

    stage.querySelector("#ait-word-go").onclick = () => runExplain();
    stage.querySelectorAll("[data-qword]").forEach((b) => (b.onclick = () => runExplain(b.getAttribute("data-qword"))));
    if (presetWord) runExplain(presetWord);
    else if (lastWordRes) bindWordResultActions(stage.querySelector("#ait-word-out"), lastWordRes);
  }

  function renderWordResultHTML(r) {
    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
          <div>
            <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
              <span class="hanzi-calligraphy" style="font-size:48px;line-height:1.1;">${QCore.escapeHtml(r.word)}</span>
              <span class="pinyin-text" style="font-size:22px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(r.pinyin)}</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
              <span class="badge badge-blue">${QCore.escapeHtml(r.pos || "")}</span>
              ${r.han_viet ? `<span class="badge badge-amber">Hán Việt: ${QCore.escapeHtml(r.han_viet.toUpperCase())}</span>` : ""}
              <span class="badge badge-jade">${QCore.escapeHtml(r.provider || "AI Tutor")}</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" id="wr-speak">🔊 Nghe chuẩn</button>
            <button class="btn btn-outline btn-sm" id="wr-save-nb">📒 Lưu Sổ tay</button>
          </div>
        </div>

        <div class="card-subtle" style="margin-bottom:12px;">
          <div><strong>🇻🇳 Nghĩa tiếng Việt:</strong> ${QCore.escapeHtml(r.vietnamese)}</div>
          ${r.english ? `<div style="margin-top:4px;color:var(--text-secondary);"><strong>🇬🇧 Nghĩa tiếng Anh:</strong> ${QCore.escapeHtml(r.english)}</div>` : ""}
          <div style="margin-top:6px;"><strong>📌 Cách dùng & Ngữ cảnh:</strong> ${QCore.escapeHtml(r.usage || "")} ${QCore.escapeHtml(r.context || "")}</div>
        </div>

        ${r.confusedPair ? `<div class="vi-hint-banner" style="margin-bottom:12px;"><span>⚡</span><div><strong>Phân biệt từ dễ nhầm:</strong> ${QCore.escapeHtml(r.confusedPair)}</div></div>` : ""}

        <div class="grid-2" style="margin-bottom:12px;">
          <div class="card-subtle">
            <strong>⚠️ Lỗi người Việt hay mắc:</strong>
            <p style="margin:6px 0 0;font-size:13.5px;">${QCore.escapeHtml(r.vietnamesePitfalls || "")}</p>
          </div>
          <div class="card-subtle">
            <strong>🔗 Đồng nghĩa / Trái nghĩa:</strong>
            <div style="margin-top:6px;font-size:13.5px;">
              <div>Đồng nghĩa: ${r.synonyms && r.synonyms.length ? QCore.escapeHtml(r.synonyms.join(", ")) : "—"}</div>
              <div>Trái nghĩa: ${r.antonyms && r.antonyms.length ? QCore.escapeHtml(r.antonyms.join(", ")) : "—"}</div>
            </div>
          </div>
        </div>

        ${r.examples && r.examples.length ? `
          <div>
            <strong>💬 Ví dụ thực tế:</strong>
            <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
              ${r.examples.map((ex) => `
                <div class="card-subtle" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                  <div>
                    <div class="hanzi-text" style="font-size:18px;font-weight:700;">${QCore.escapeHtml(ex.chinese)}</div>
                    ${ex.pinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--primary);">${QCore.escapeHtml(ex.pinyin)}</div>` : ""}
                    <div style="font-size:13px;color:var(--text-secondary);">🇻🇳 ${QCore.escapeHtml(ex.vietnamese || "")}</div>
                  </div>
                  <button class="btn btn-soft btn-sm" onclick="QCore.speakChinese('${QCore.escapeHtml(ex.chinese).replace(/'/g, "")}')">🔊</button>
                </div>
              `).join("")}
            </div>
          </div>
        ` : ""}
      </div>
    `;
  }

  function bindWordResultActions(out, res) {
    const sp = out.querySelector("#wr-speak");
    if (sp) sp.onclick = () => QCore.speakChinese(res.word);
    const nb = out.querySelector("#wr-save-nb");
    if (nb) nb.onclick = () => QCore.addToNotebook({ category: "vocab", hanzi: res.word, pinyin: res.pinyin, english: res.english, vietnamese: res.vietnamese });
  }

  /* ---------- 2. AI SENTENCE CORRECTOR ---------- */
  function renderSentenceCorrector(stage) {
    stage.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <h3 style="margin:0 0 8px;">✍️ AI Sửa câu tiếng Trung (Phân biệt: Đúng · Chưa tự nhiên · Sai ngữ pháp)</h3>
        <p style="margin:0 0 12px;font-size:13.5px;color:var(--text-secondary);">Nhập câu tiếng Trung bạn tự viết. AI phân biệt rõ lỗi ngữ pháp thật sự với câu đúng ngữ pháp nhưng chưa tự nhiên, gợi ý cả cách nói trang trọng & khẩu ngữ:</p>
        <textarea class="textarea-field hanzi-text" id="ait-sent-inp" rows="3" data-pinyin-ime="true" placeholder="Thử nhập ví dụ: 我学习中文在学校今天 hoặc 我不有时间 hoặc 我很喜欢学中文。"></textarea>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center;">
          <button class="btn btn-primary" id="ait-sent-go">🔍 Phân tích & Sửa câu</button>
          <span style="font-size:12.5px;color:var(--text-muted);">Mẫu thử nhanh:</span>
          ${["我是很忙今天", "我不有钱", "二个人去学校", "我每天都在家学习中文。"].map((s) => `<button class="btn btn-outline btn-sm hanzi-text" data-qsent="${s}">${s}</button>`).join("")}
        </div>
      </div>
      <div id="ait-sent-out">${lastSentRes ? renderFixSentenceHTML(lastSentRes) : ""}</div>
    `;
    if (window.QPinyinIME) QPinyinIME.attachAll(stage);

    const runFix = async (txt) => {
      const sentence = (txt || stage.querySelector("#ait-sent-inp").value || "").trim();
      if (!sentence) return;
      stage.querySelector("#ait-sent-inp").value = sentence;
      const out = stage.querySelector("#ait-sent-out");
      out.innerHTML = `<div class="card">⏳ AI đang phân tích câu...</div>`;

      let res = null;
      try {
        if (QCore.getServerHealth().ok) {
          res = await QCore.apiFetch("/api/ai/fix-sentence", { method: "POST", body: { text: sentence, hskLevel: selectedHsk } });
        }
      } catch (_) {}

      if (!res) {
        const a = localAnalyzeChinese(sentence);
        res = {
          verdict: a.issues.length ? "grammar_error" : "correct",
          score: a.issues.length ? Math.max(35, 92 - a.issues.length * 16) : 94,
          original: a.original,
          corrected: a.corrected,
          naturalVersion: a.corrected,
          formalVersion: a.corrected,
          casualVersion: a.corrected,
          pinyin: "Bấm nút Loa để nghe phát âm chuẩn Putonghua.",
          vietnamese: a.issues.length ? "Câu đã được chuẩn hóa lỗi ngữ pháp/trật tự thường gặp." : "Câu hợp lệ về cấu trúc ngữ pháp cơ bản!",
          explanation: a.issues.length ? a.issues.map((i) => i.detail).join(" ") : "Câu của bạn đúng ngữ pháp cơ bản và không mắc các lỗi chuyển di từ tiếng Việt!",
          issues: a.issues,
          provider: "offline-pedagogical"
        };
      }
      lastSentRes = res;
      QCore.logAiHistory({ mode: "fix_sentence", input: sentence, score: res.score });
      out.innerHTML = renderFixSentenceHTML(res);
    };

    stage.querySelector("#ait-sent-go").onclick = () => runFix();
    stage.querySelectorAll("[data-qsent]").forEach((b) => (b.onclick = () => runFix(b.getAttribute("data-qsent"))));
  }

  function renderFixSentenceHTML(r) {
    const badgeMap = {
      correct: `<span class="badge badge-jade">✅ Đúng ngữ pháp & Tự nhiên</span>`,
      unnatural: `<span class="badge badge-amber">🟡 Đúng ngữ pháp nhưng chưa tự nhiên</span>`,
      grammar_error: `<span class="badge badge-red">❌ Có lỗi ngữ pháp / chữ Hán</span>`
    };
    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <div style="display:flex;gap:8px;align-items:center;">${badgeMap[r.verdict] || badgeMap.correct} <strong>Điểm: ${r.score}/100</strong></div>
          <span class="badge badge-blue">${QCore.escapeHtml(r.provider || "AI")}</span>
        </div>
        <div class="grid-2" style="margin-bottom:12px;">
          <div class="card-subtle"><strong>Câu gốc của bạn:</strong><div class="hanzi-text" style="font-size:20px;margin-top:4px;">${QCore.escapeHtml(r.original)}</div></div>
          <div class="card-subtle" style="border-color:var(--primary);">
            <div style="display:flex;justify-content:space-between;align-items:center;"><strong>Câu chuẩn xác:</strong><button class="btn btn-soft btn-sm" onclick="QCore.speakChinese('${QCore.escapeHtml(r.corrected).replace(/'/g, "")}')">🔊 Nghe</button></div>
            <div class="hanzi-text" style="font-size:21px;font-weight:700;color:var(--primary);margin-top:4px;">${QCore.escapeHtml(r.corrected)}</div>
            ${r.pinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--primary);">${QCore.escapeHtml(r.pinyin)}</div>` : ""}
          </div>
        </div>
        <div class="card-subtle" style="margin-bottom:12px;">
          <strong>💡 Giải thích chi tiết:</strong>
          <p style="margin:6px 0 0;font-size:13.8px;">${QCore.escapeHtml(r.explanation || "")}</p>
          ${r.vietnamese ? `<div style="margin-top:6px;font-size:13px;color:var(--text-secondary);">🇻🇳 ${QCore.escapeHtml(r.vietnamese)}</div>` : ""}
        </div>
        ${(r.formalVersion || r.casualVersion) ? `
          <div class="grid-2">
            <div class="card-subtle"><strong>🎩 Cách nói trang trọng:</strong><div class="hanzi-text" style="font-size:17px;margin-top:4px;">${QCore.escapeHtml(r.formalVersion || r.corrected)}</div></div>
            <div class="card-subtle"><strong>☕ Cách nói khẩu ngữ giao tiếp:</strong><div class="hanzi-text" style="font-size:17px;margin-top:4px;">${QCore.escapeHtml(r.casualVersion || r.naturalVersion || r.corrected)}</div></div>
          </div>
        ` : ""}
      </div>
    `;
  }

  /* ---------- 3. AI 10-SCENARIO ROLEPLAY CONVERSATION ---------- */
  function renderConversationHub(stage) {
    stage.innerHTML = `
      <div class="card" style="margin-bottom:14px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
          <strong>🎭 Chọn 1 trong 10 tình huống hội thoại thực tế:</strong>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <label style="font-size:12.5px;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" id="chat-tog-py" ${chatShowPinyin ? "checked" : ""}/> Hiện Pinyin</label>
            <label style="font-size:12.5px;display:flex;align-items:center;gap:4px;cursor:pointer;"><input type="checkbox" id="chat-tog-vi" ${chatShowVi ? "checked" : ""}/> Hiện dịch Việt (tắt để luyện phản xạ)</label>
            <button class="btn btn-outline btn-sm" id="chat-restart">🔄 Bắt đầu lại</button>
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${SCENARIOS.map((sc) => `<button class="btn ${chatScenario === sc.id ? "btn-primary" : "btn-outline"} btn-sm" data-sc="${sc.id}">${sc.label}</button>`).join("")}
        </div>
      </div>

      <div class="card">
        <div id="ait-chat-box" style="max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;padding:8px 4px;margin-bottom:14px;">
          ${chatMessages.length ? chatMessages.map((m) => renderChatBubble(m)).join("") : `<div class="card-subtle" style="text-align:center;color:var(--text-muted);">Bấm chọn 1 tình huống bên trên để AI Giáo viên mở đầu cuộc hội thoại bằng tiếng Trung!</div>`}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <input class="input-field hanzi-text" id="ait-chat-inp" data-pinyin-ime="true" placeholder="Trả lời bằng tiếng Trung Giản thể (gõ Pinyin sẽ hiện chữ Hán)..." style="flex:1;min-width:220px;font-size:16px;" />
          <button class="btn btn-outline" id="ait-chat-mic" title="Nói tiếng Trung vào Micro">🎙️</button>
          <button class="btn btn-primary" id="ait-chat-send">Gửi →</button>
        </div>
      </div>
    `;
    if (window.QPinyinIME) QPinyinIME.attachAll(stage);

    stage.querySelector("#chat-tog-py").onchange = (e) => { chatShowPinyin = e.target.checked; renderConversationHub(stage); };
    stage.querySelector("#chat-tog-vi").onchange = (e) => { chatShowVi = e.target.checked; renderConversationHub(stage); };

    const startScenario = async (scId) => {
      chatScenario = scId;
      chatMessages = [];
      let starter = null;
      try {
        if (QCore.getServerHealth().ok) {
          starter = await QCore.apiFetch("/api/ai/speaking", { method: "POST", body: { mode: "basic", topic: scId, hskLevel: selectedHsk, message: "" } });
        }
      } catch (_) {}
      if (!starter) {
        const offlineStarters = {
          greeting: { chinese: "你好！很高兴认识你。你今天好吗？", pinyin: "Nǐ hǎo! Hěn gāoxìng rènshi nǐ. Nǐ jīntiān hǎo ma?", vietnamese: "Xin chào! Rất vui được quen biết bạn. Hôm nay bạn khỏe không?" },
          shopping: { chinese: "欢迎光临！请问您想买什么？", pinyin: "Huānyíng guānglín! Qǐngwèn nín xiǎng mǎi shénme?", vietnamese: "Chào mừng quý khách! Bạn muốn mua gì ạ?" },
          food: { chinese: "你好！请问你想吃什么？想喝什么？", pinyin: "Nǐ hǎo! Qǐngwèn nǐ xiǎng chī shénme? Xiǎng hē shénme?", vietnamese: "Xin chào! Bạn muốn ăn gì và uống gì?" },
          interview: { chinese: "你好，请先用中文简单介绍一下你自己。", pinyin: "Nǐ hǎo, qǐng xiān yòng Zhōngwén jiǎndān jièshào yíxià nǐ zìjǐ.", vietnamese: "Xin chào, mời bạn giới thiệu ngắn gọn về bản thân bằng tiếng Trung." }
        };
        starter = offlineStarters[scId] || offlineStarters.greeting;
      }
      chatMessages.push({ role: "ai", chinese: starter.chinese, pinyin: starter.pinyin, vietnamese: starter.vietnamese, suggestions: starter.suggestions || [] });
      QCore.speakChinese(starter.chinese);
      renderConversationHub(stage);
    };

    stage.querySelectorAll("[data-sc]").forEach((b) => (b.onclick = () => startScenario(b.getAttribute("data-sc"))));
    stage.querySelector("#chat-restart").onclick = () => startScenario(chatScenario);
    if (!chatMessages.length) {
      startScenario(chatScenario);
      return;
    }

    const sendMsg = async (overrideMsg) => {
      const inp = stage.querySelector("#ait-chat-inp");
      const text = (overrideMsg || inp.value || "").trim();
      if (!text) return;
      inp.value = "";
      chatMessages.push({ role: "user", chinese: text });
      renderConversationHub(stage);

      let reply = null;
      try {
        if (QCore.getServerHealth().ok) {
          reply = await QCore.apiFetch("/api/ai/speaking", {
            method: "POST",
            body: { mode: "basic", topic: chatScenario, hskLevel: selectedHsk, message: text, history: chatMessages.slice(-6) }
          });
        }
      } catch (_) {}

      if (!reply) {
        const check = localAnalyzeChinese(text);
        reply = {
          chinese: "很好！你可以再多说一点吗？",
          pinyin: "Hěn hǎo! Nǐ kěyǐ zài duō shuō yìdiǎn ma?",
          vietnamese: "Rất tốt! Bạn có thể nói thêm một chút nữa không?",
          correction: check.issues.length ? { corrected: check.corrected, explanation: check.issues[0].detail } : null
        };
      }
      chatMessages.push({
        role: "ai",
        chinese: reply.chinese || reply.reply || "很好！继续加油！",
        pinyin: reply.pinyin || "",
        vietnamese: reply.vietnamese || "",
        correction: reply.correction || null
      });
      QCore.logDailyActivity("speakingMinutes", 1);
      QCore.speakChinese(reply.chinese || reply.reply || "");
      renderConversationHub(stage);
    };

    stage.querySelector("#ait-chat-send").onclick = () => sendMsg();
    stage.querySelector("#ait-chat-inp").onkeydown = (e) => { if (e.key === "Enter") sendMsg(); };
    stage.querySelector("#ait-chat-mic").onclick = () => {
      QCore.showToast("🔴 Đang lắng nghe tiếng Trung (4 giây)...");
      QCore.captureLearnerVoice({
        durationMs: 4000,
        onAudioReady: (_, tr) => {
          if (tr) {
            stage.querySelector("#ait-chat-inp").value = tr;
            QCore.showToast(`🎙️ Nhận diện: "${tr}" — Bấm Gửi để tiếp tục!`);
          } else {
            QCore.showToast("Không nhận được giọng nói tiếng Trung, bạn có thể thử lại hoặc gõ Pinyin nhé.");
          }
        }
      });
    };
    stage.querySelectorAll("[data-use-sug]").forEach((b) => (b.onclick = () => sendMsg(b.getAttribute("data-use-sug"))));
  }

  function renderChatBubble(m) {
    if (m.role === "user") {
      return `<div style="align-self:flex-end;background:var(--primary);color:#fff;padding:10px 14px;border-radius:14px 14px 2px 14px;max-width:80%;"><div class="hanzi-text" style="font-size:17px;">${QCore.escapeHtml(m.chinese)}</div></div>`;
    }
    return `
      <div style="align-self:flex-start;background:var(--bg-subtle);border:1px solid var(--border-color);padding:12px 14px;border-radius:14px 14px 14px 2px;max-width:85%;">
        <div style="display:flex;align-items:center;gap:8px;justify-content:space-between;">
          <div class="hanzi-text" style="font-size:18px;font-weight:700;">${QCore.escapeHtml(m.chinese)}</div>
          <button class="icon-btn" style="padding:4px 8px;" onclick="QCore.speakChinese('${QCore.escapeHtml(m.chinese).replace(/'/g, "")}')">🔊</button>
        </div>
        ${chatShowPinyin && m.pinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--primary);margin-top:3px;">${QCore.escapeHtml(m.pinyin)}</div>` : ""}
        ${chatShowVi && m.vietnamese ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:3px;">🇻🇳 ${QCore.escapeHtml(m.vietnamese)}</div>` : ""}
        ${m.correction && m.correction.corrected ? `<div style="margin-top:8px;padding:8px;background:var(--bg-warn-soft);border-radius:8px;font-size:12.5px;">✏️ <strong>Góp ý sửa nhẹ:</strong> <span class="hanzi-text">${QCore.escapeHtml(m.correction.corrected)}</span> — ${QCore.escapeHtml(m.correction.explanation || "")}</div>` : ""}
        ${m.suggestions && m.suggestions.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">${m.suggestions.map((s) => `<button class="btn btn-outline btn-sm hanzi-text" data-use-sug="${QCore.escapeHtml(s.chinese)}">💬 ${QCore.escapeHtml(s.chinese)}</button>`).join("")}</div>` : ""}
      </div>
    `;
  }

  /* ---------- 4. AI PRONUNCIATION COACH ---------- */
  function renderPronunciationCoach(stage) {
    const samples = [
      { hz: "中国菜很好吃", py: "Zhōngguó cài hěn hǎochī", vi: "Món ăn Trung Quốc rất ngon (luyện zh/c/ch + 3+3)" },
      { hz: "四十不是十四", py: "Sìshí bú shì shísì", vi: "40 không phải 14 (luyện s/sh + biến điệu 不)" },
      { hz: "今天天气太好了", py: "Jīntiān tiānqì tài hǎo le", vi: "Hôm nay thời tiết quá đẹp (luyện t bật hơi + q + in/ian)" },
      { hz: "认识你很高兴", py: "Rènshi nǐ hěn gāoxìng", vi: "Rất vui được quen biết bạn (luyện r/sh + ing + 3+3)" }
    ];
    stage.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <h3 style="margin:0 0 8px;">🎙️ AI Luyện phát âm (Phân tích Thanh mẫu · Vận mẫu · Biến điệu)</h3>
        <div class="vi-hint-banner" style="margin-bottom:12px;">
          <span>ℹ️</span>
          <div><strong>Minh bạch kỹ thuật:</strong> Trình duyệt dùng nhận diện giọng nói <code>zh-CN</code> để đối chiếu chữ Hán và ghi lại băng thu âm của bạn, kết hợp phân tích điểm khó ngữ âm (bật hơi, cong lưỡi, mũi -ng, biến điệu). QChinese <strong>không bịa điểm số thanh điệu giả</strong> khi không có bộ đo tần số âm thanh chuyên sâu.</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
          ${samples.map((s, i) => `<button class="btn btn-outline btn-sm hanzi-text" data-psamp="${i}">${s.hz}</button>`).join("")}
        </div>
        <div class="grid-2" style="margin-bottom:12px;">
          <input class="input-field hanzi-text" id="pr-hz" value="${samples[0].hz}" placeholder="Câu/từ chữ Hán muốn luyện..." style="font-size:18px;" />
          <input class="input-field pinyin-text" id="pr-py" value="${samples[0].py}" placeholder="Pinyin tương ứng..." />
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-soft" id="pr-listen">🔊 Nghe âm mẫu</button>
          <button class="btn btn-outline" id="pr-slow">🐢 Nghe chậm</button>
          <button class="btn btn-primary" id="pr-record">🎙️ Ghi âm & Phân tích (4.5 giây)</button>
        </div>
      </div>
      <div id="pr-out"></div>
    `;
    stage.querySelectorAll("[data-psamp]").forEach((b) => {
      b.onclick = () => {
        const s = samples[Number(b.getAttribute("data-psamp"))];
        stage.querySelector("#pr-hz").value = s.hz;
        stage.querySelector("#pr-py").value = s.py;
        QCore.speakChinese(s.hz);
      };
    });
    stage.querySelector("#pr-listen").onclick = () => QCore.speakChinese(stage.querySelector("#pr-hz").value);
    stage.querySelector("#pr-slow").onclick = () => QCore.speakChinese(stage.querySelector("#pr-hz").value, { slow: true });
    stage.querySelector("#pr-record").onclick = () => {
      const hz = stage.querySelector("#pr-hz").value.trim();
      const py = stage.querySelector("#pr-py").value.trim();
      const out = stage.querySelector("#pr-out");
      out.innerHTML = `<div class="card">🔴 Đang ghi âm giọng của bạn... Hãy đọc rõ: <strong class="hanzi-text">${QCore.escapeHtml(hz)}</strong> (${QCore.escapeHtml(py)})</div>`;
      QCore.captureLearnerVoice({
        durationMs: 4500,
        onAudioReady: async (url, transcript) => {
          let analysis = null;
          try {
            if (QCore.getServerHealth().ok) {
              analysis = await QCore.apiFetch("/api/ai/pronunciation", {
                method: "POST",
                body: { targetHanzi: hz, targetPinyin: py, spokenTranscript: transcript || "" }
              });
            }
          } catch (_) {}
          if (!analysis) {
            analysis = {
              spokenTranscript: transcript || "",
              matchStatus: transcript && hz && transcript.includes(hz.slice(0, 2)) ? "matched" : "no_transcript",
              coachingTips: [
                "So sánh trực tiếp bản ghi âm của bạn với nút 'Nghe mẫu' ở trên.",
                "Chú ý tách rõ âm bật hơi (p, t, k, q, ch, c), âm cong lưỡi (zh, ch, sh, r) và âm mũi sau (-ng)."
              ],
              honestLimitation: "Nhận diện giọng nói trình duyệt chỉ kiểm tra chuỗi chữ nhận diện được, không đo đường cao độ F0 từng thanh điệu."
            };
          }
          lastPronRes = analysis;
          out.innerHTML = `
            <div class="card">
              <h4 style="margin:0 0 10px;">🎧 Bản thu âm của bạn (so sánh với âm mẫu):</h4>
              <audio controls src="${url}" style="width:100%;height:40px;margin-bottom:10px;"></audio>
              <div class="card-subtle" style="margin-bottom:10px;">
                <strong>Nhận diện giọng nói (zh-CN):</strong> ${analysis.spokenTranscript ? `<span class="hanzi-text" style="font-size:18px;font-weight:700;">"${QCore.escapeHtml(analysis.spokenTranscript)}"</span> (${analysis.matchedChars != null ? `khớp ${analysis.matchedChars}/${analysis.totalChars} chữ` : ""})` : "Không thu được văn bản tự động (bạn vẫn có thể nghe lại audio phía trên để tự đối chiếu)."}
              </div>
              <div class="card-subtle" style="margin-bottom:10px;">
                <strong>🎯 Các điểm ngữ âm cần chú ý trong câu này:</strong>
                <ul style="margin:6px 0 0;padding-left:18px;font-size:13.5px;">
                  ${(analysis.coachingTips || []).map((t) => `<li>${QCore.escapeHtml(t)}</li>`).join("")}
                </ul>
              </div>
              <div style="font-size:12.5px;color:var(--text-muted);">ℹ️ ${QCore.escapeHtml(analysis.honestLimitation || "")}</div>
            </div>
          `;
        }
      });
    };
  }

  /* ---------- 5. AI GRAMMAR EXPLAINER ---------- */
  function renderGrammarExplainer(stage) {
    stage.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <h3 style="margin:0 0 8px;">🧩 AI Giải thích Ngữ pháp HSK (Công thức · Lỗi sai · Bài tập)</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <input class="input-field" id="ait-gram-inp" placeholder="Nhập điểm ngữ pháp muốn hỏi (vd: câu chữ 把, so sánh 比, trợ từ 了, phân biệt 不 và 没)..." style="flex:1;min-width:220px;" />
          <button class="btn btn-primary" id="ait-gram-go">🤖 Giải thích ngữ pháp</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${["Câu chữ 把", "So sánh 比", "Trợ từ 了", "Phân biệt 不 và 没", "Trật tự thời gian & địa điểm"].map((g) => `<button class="btn btn-outline btn-sm" data-qgram="${g}">${g}</button>`).join("")}
        </div>
      </div>
      <div id="ait-gram-out">${lastGramRes ? renderGrammarResHTML(lastGramRes) : ""}</div>
    `;
    const runGram = async (qStr) => {
      const q = (qStr || stage.querySelector("#ait-gram-inp").value || "").trim();
      if (!q) return;
      stage.querySelector("#ait-gram-inp").value = q;
      const out = stage.querySelector("#ait-gram-out");
      out.innerHTML = `<div class="card">⏳ AI đang tổng hợp bài giảng ngữ pháp...</div>`;
      let res = null;
      try {
        if (QCore.getServerHealth().ok) {
          res = await QCore.apiFetch("/api/ai/explain-grammar", { method: "POST", body: { query: q, hskLevel: selectedHsk } });
        }
      } catch (_) {}
      if (!res) {
        res = {
          title: `Giải thích ngữ pháp: ${q}`,
          formula: "Chủ ngữ + [Thời gian] + [Tại địa điểm 在...] + Động từ + Tân ngữ",
          meaning: "Trong tiếng Trung Giản thể, thành phần trạng ngữ thời gian và địa điểm (在 + nơi chốn) luôn đứng TRƯỚC động từ chính.",
          correctExamples: [{ chinese: "我今天在图书馆学习中文。", pinyin: "Wǒ jīntiān zài túshūguǎn xuéxí Zhōngwén.", vietnamese: "Hôm nay tôi học tiếng Trung ở thư viện." }],
          commonMistakes: [{ wrong: "我学习中文在图书馆今天。", right: "我今天在图书馆学习中文。", why: "Không đặt thời gian/địa điểm ở cuối câu như tiếng Việt." }],
          practiceQuiz: { question: "Sắp xếp câu đúng: 在家 / 我 / 晚上 / 看书", answer: "我晚上在家看书。" },
          provider: "offline-pedagogical"
        };
      }
      lastGramRes = res;
      out.innerHTML = renderGrammarResHTML(res);
    };
    stage.querySelector("#ait-gram-go").onclick = () => runGram();
    stage.querySelectorAll("[data-qgram]").forEach((b) => (b.onclick = () => runGram(b.getAttribute("data-qgram"))));
  }

  function renderGrammarResHTML(r) {
    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 style="margin:0;color:var(--primary);">${QCore.escapeHtml(r.title)}</h3>
          <span class="badge badge-blue">${QCore.escapeHtml(r.provider || "AI")}</span>
        </div>
        <div class="badge badge-amber" style="display:inline-block;margin-bottom:10px;font-size:13.5px;white-space:normal;">📐 Công thức: ${QCore.escapeHtml(r.formula)}</div>
        <p style="margin:0 0 12px;font-size:14px;">${QCore.escapeHtml(r.meaning)}</p>
        <div class="grid-2" style="margin-bottom:12px;">
          <div class="card-subtle">
            <strong style="color:var(--primary);">✅ Ví dụ đúng:</strong>
            ${(r.correctExamples || []).map((ex) => `
              <div style="margin-top:8px;">
                <span class="hanzi-text" style="font-size:17px;font-weight:700;">${QCore.escapeHtml(ex.chinese)}</span>
                <button class="btn btn-soft btn-sm" style="padding:2px 6px;margin-left:4px;" onclick="QCore.speakChinese('${QCore.escapeHtml(ex.chinese).replace(/'/g, "")}')">🔊</button>
                <div class="pinyin-text" style="font-size:12.5px;color:var(--primary);">${QCore.escapeHtml(ex.pinyin || "")}</div>
                <div style="font-size:12.5px;color:var(--text-secondary);">🇻🇳 ${QCore.escapeHtml(ex.vietnamese || "")}</div>
              </div>
            `).join("")}
          </div>
          <div class="card-subtle">
            <strong style="color:var(--accent-red);">❌ Lỗi sai thường gặp:</strong>
            ${(r.commonMistakes || []).map((m) => `
              <div style="margin-top:8px;font-size:13px;">
                <div style="color:var(--accent-red);text-decoration:line-through;">${QCore.escapeHtml(m.wrong)}</div>
                <div style="color:var(--primary);font-weight:700;">→ ${QCore.escapeHtml(m.right)}</div>
                <div style="color:var(--text-secondary);margin-top:2px;">${QCore.escapeHtml(m.why)}</div>
              </div>
            `).join("")}
          </div>
        </div>
        ${r.practiceQuiz ? `
          <div class="card-subtle">
            <strong>📝 Câu hỏi áp dụng nhanh:</strong> ${QCore.escapeHtml(r.practiceQuiz.question)}
            <details style="margin-top:6px;"><summary style="cursor:pointer;color:var(--primary);font-weight:600;">Xem đáp án chuẩn</summary><div class="hanzi-text" style="margin-top:4px;font-weight:700;">${QCore.escapeHtml(r.practiceQuiz.answer)}</div></details>
          </div>
        ` : ""}
      </div>
    `;
  }

  /* ---------- 6. AI PERSONALIZED DRILLS ---------- */
  async function renderPersonalizedDrills(stage) {
    const st = QCore.getState();
    const lapsedIds = Object.keys(st.srs || {}).filter((id) => (st.srs[id].lapses || 0) >= 1);
    const lapsedWords = lapsedIds.map((id) => {
      const legacy = (window.QCHINESE_VOCAB || []).find((w) => w.id === id);
      return { id, hanzi: legacy ? legacy.hanzi : id.replace(/^hsk[23]_/, "") };
    });

    stage.innerHTML = `<div class="card">⏳ AI đang đọc dữ liệu học tập thực tế của bạn (lỗi phát âm, từ hay quên, điểm kỹ năng)...</div>`;
    let res = null;
    try {
      if (QCore.getServerHealth().ok) {
        res = await QCore.apiFetch("/api/ai/personalized-drills", {
          method: "POST",
          body: { hskLevel: selectedHsk, phoneticErrors: st.phoneticErrors || {}, lapsedWords, skillScores: st.skillScores || {} }
        });
      }
    } catch (_) {}

    if (!res) {
      const weakPairs = Object.entries(st.phoneticErrors || {}).filter(([, v]) => (v.wrong || 0) > 0).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 3);
      const drills = [];
      weakPairs.forEach(([k, v]) => drills.push({
        type: "phonetic", title: `Luyện cặp âm hay nhầm: ${k}`,
        reason: `Bạn đã nhầm ${k} ${v.wrong} lần trong Challenge nghe phân biệt.`,
        actionRoute: "pinyin", actionParams: { pair: k }, cta: `Vào phòng đối chiếu ${k} →`
      }));
      if (lapsedWords.length) {
        drills.push({
          type: "vocab", title: `Ôn gấp ${lapsedWords.length} từ vựng thường quên`,
          reason: `Từ gần đây hay quên: ${lapsedWords.slice(0, 6).map((x) => x.hanzi).join(", ")}.`,
          actionRoute: "vocab", actionParams: { mode: "flashcard", status: "lapses" }, cta: "Mở Flashcard từ hay quên →"
        });
      }
      drills.push({
        type: "skill", title: `Chinh phục bài Challenge phân biệt âm bật hơi & cong lưỡi`,
        reason: "Rèn tai nghe phân biệt b/p, d/t, g/k, zh/z, an/ang là nền tảng cho người Việt học tiếng Trung.",
        actionRoute: "pinyin", actionParams: { tab: "challenge" }, cta: "Vào Challenge Pinyin ngay →"
      });
      res = { summary: `Phân tích từ dữ liệu thực tế HSK ${selectedHsk} của bạn:`, drills };
    }
    lastDrillRes = res;

    stage.innerHTML = `
      <div class="card" style="margin-bottom:14px;">
        <h3 style="margin:0 0 6px;">🎯 Lộ trình Bài tập Cá nhân hóa theo Lỗi học tập Thực tế</h3>
        <p style="margin:0;color:var(--text-secondary);">${QCore.escapeHtml(res.summary || "")}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${(res.drills || []).map((d, idx) => `
          <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
            <div>
              <span class="badge ${d.type === "phonetic" ? "badge-red" : d.type === "vocab" ? "badge-amber" : "badge-jade"}">${d.type === "phonetic" ? "🎵 Lỗi Phát âm" : d.type === "vocab" ? "📚 Từ hay quên" : "🧭 Kỹ năng trọng tâm"}</span>
              <h4 style="margin:6px 0 4px;">${QCore.escapeHtml(d.title)}</h4>
              <p style="margin:0;font-size:13.5px;color:var(--text-secondary);">${QCore.escapeHtml(d.reason)}</p>
            </div>
            <button class="btn btn-primary" data-run-drill="${idx}">${QCore.escapeHtml(d.cta || "Bắt đầu →")}</button>
          </div>
        `).join("")}
      </div>
    `;
    stage.querySelectorAll("[data-run-drill]").forEach((b) => {
      b.onclick = () => {
        const d = res.drills[Number(b.getAttribute("data-run-drill"))];
        if (d) window.QApp.navigate(d.actionRoute, d.actionParams || {});
      };
    });
  }

  return {
    renderAiTutor,
    evaluateSentenceSmart,
    renderSentenceEvaluationCard
  };
})();
