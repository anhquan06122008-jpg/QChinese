/* -*- coding: utf-8 -*-
 * QChinese – Modules 6, 8, 9, 10:
 * - Grammar Studio (6.2)
 * - AI Speaking Tutor (6.4)
 * - Split-Screen Reading Studio (6.5)
 * - Dual Writing Studio: Part A Hanzi & Part B AI 7-Criteria Sentence/Paragraph Grading (6.6)
 */

window.QGrammarReadingWriting = (function () {
  /* ==================== 6.2. GRAMMAR STUDIO ==================== */
  let activeGrammarId = "g_shi";
  let grammarReorderDraft = [];

  function renderGrammar(container) {
    const list = window.QCHINESE_GRAMMAR || [];
    const lesson = list.find((g) => g.id === activeGrammarId) || list[0];
    const st = QCore.getState();
    const isDone = st.grammarCompleted.includes(lesson.id);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🧩 Học Ngữ Pháp Tiếng Trung Từ Cơ Bản Đến HSK 6</h2>
          <p>Mỗi cấu trúc đều có công thức rõ ràng, giải thích Việt – Anh, lỗi người Việt hay mắc và 4 bài tập thực hành.</p>
        </div>
        <button class="btn btn-outline btn-sm" id="gr-save-nb">📒 Lưu cấu trúc này vào Sổ tay</button>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
        ${list
          .map(
            (g) => `
          <button class="btn ${g.id === lesson.id ? "btn-primary" : st.grammarCompleted.includes(g.id) ? "btn-soft" : "btn-outline"} btn-sm" data-grid="${g.id}">
            ${st.grammarCompleted.includes(g.id) ? "✓ " : ""}HSK ${g.hsk_level}: ${QCore.escapeHtml(g.title.split("–")[0])}
          </button>
        `
          )
          .join("")}
      </div>

      <div class="grid-2">
        <!-- Theory & Examples -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span class="badge badge-jade">HSK ${lesson.hsk_level}</span>
            ${isDone ? `<span class="badge badge-jade">✓ Đã hoàn thành</span>` : ""}
          </div>
          <h3 style="margin:0 0 10px;font-size:20px;">${QCore.escapeHtml(lesson.title)}</h3>
          <div class="card-subtle" style="border-left:4px solid var(--primary);font-weight:700;font-size:15.5px;margin-bottom:14px;">
            📐 Công thức: ${QCore.escapeHtml(lesson.formula)}
          </div>

          <div style="margin-bottom:12px;">
            <strong>🇻🇳 Giải thích tiếng Việt:</strong>
            <p style="margin:4px 0 0;font-size:14px;">${QCore.escapeHtml(lesson.explainVi)}</p>
          </div>
          <div style="margin-bottom:14px;">
            <strong>🇬🇧 English Explanation:</strong>
            <p style="margin:4px 0 0;font-size:13.5px;color:var(--text-secondary);">${QCore.escapeHtml(lesson.explainEn)}</p>
          </div>

          <div class="vi-hint-banner" style="margin-bottom:16px;">
            <span>⚠️</span>
            <div><strong>Lỗi thường gặp cần tránh:</strong> ${QCore.escapeHtml(lesson.commonMistakes)}</div>
          </div>

          <h4 style="margin:0 0 8px;">💬 Ví dụ minh họa ba ngôn ngữ</h4>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${lesson.examples
              .map(
                (ex) => `
              <div class="card-subtle" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                <div>
                  <div class="hanzi-text" style="font-size:18px;font-weight:700;">${QCore.escapeHtml(ex.chinese)}</div>
                  <div class="pinyin-text" style="font-size:13.5px;color:var(--primary);font-weight:600;">${QCore.escapeHtml(ex.pinyin)}</div>
                  <div style="font-size:13px;color:var(--text-secondary);">🇬🇧 ${QCore.escapeHtml(ex.english)} · 🇻🇳 <strong>${QCore.escapeHtml(ex.vietnamese)}</strong></div>
                </div>
                <button class="btn btn-soft btn-sm" data-speak="${QCore.escapeHtml(ex.chinese)}">🔊</button>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- 4 Interactive Grammar Exercises -->
        <div class="card">
          <h3 style="margin:0 0 14px;">✍️ Thực hành 4 dạng bài tập</h3>

          <!-- Ex 1: Fill blank -->
          <div class="card-subtle" style="margin-bottom:12px;">
            <strong>1. Điền từ còn thiếu:</strong>
            <div class="hanzi-text" style="font-size:18px;margin:6px 0;">${QCore.escapeHtml(lesson.exercises.fillBlank.sentence)}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${lesson.exercises.fillBlank.options
                .map((o) => `<button class="btn btn-outline btn-sm hanzi-text" data-gr-fb="${QCore.escapeHtml(o)}">${QCore.escapeHtml(o)}</button>`)
                .join("")}
            </div>
            <div id="gr-fb-msg" style="margin-top:6px;font-size:13px;"></div>
          </div>

          <!-- Ex 2: Reorder -->
          <div class="card-subtle" style="margin-bottom:12px;">
            <strong>2. Sắp xếp các từ thành câu đúng:</strong>
            <div class="hanzi-text" style="min-height:34px;font-size:18px;font-weight:700;color:var(--primary);margin:6px 0;">
              ${QCore.escapeHtml(grammarReorderDraft.join("")) || "Bấm chọn từng từ bên dưới..."}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${lesson.exercises.reorder.words
                .map((w) => `<button class="btn btn-outline btn-sm hanzi-text" data-gr-word="${QCore.escapeHtml(w)}">${QCore.escapeHtml(w)}</button>`)
                .join("")}
              <button class="btn btn-danger btn-sm" id="gr-ord-clear">Xóa</button>
              <button class="btn btn-primary btn-sm" id="gr-ord-check">Kiểm tra</button>
            </div>
            <div id="gr-ord-msg" style="margin-top:6px;font-size:13px;"></div>
          </div>

          <!-- Ex 3: Choose right structure -->
          <div class="card-subtle" style="margin-bottom:12px;">
            <strong>3. ${QCore.escapeHtml(lesson.exercises.multipleChoice.question)}</strong>
            <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px;">
              ${lesson.exercises.multipleChoice.options
                .map((o) => `<button class="btn btn-outline btn-sm hanzi-text" style="justify-content:flex-start;" data-gr-mcq="${QCore.escapeHtml(o)}">${QCore.escapeHtml(o)}</button>`)
                .join("")}
            </div>
            <div id="gr-mcq-msg" style="margin-top:6px;font-size:13px;"></div>
          </div>

          <!-- Ex 4: Free sentence writing with AI feedback -->
          <div class="card-subtle">
            <strong>4. Tự viết câu & nhận giải thích từ AI Giáo viên:</strong>
            <p style="margin:4px 0 8px;font-size:13px;color:var(--text-secondary);">${QCore.escapeHtml(lesson.exercises.freeWritePrompt)}</p>
            <textarea class="textarea-field hanzi-text" id="gr-free-inp" rows="2" data-pinyin-ime="true" placeholder="Gõ Pinyin để chọn chữ Hán Giản thể..."></textarea>
            <div style="margin-top:8px;">
              <button class="btn btn-primary btn-sm" id="gr-free-btn">👩‍🏫 Chấm câu & Hoàn thành bài ngữ pháp</button>
            </div>
            <div id="gr-free-msg" style="margin-top:8px;font-size:13px;"></div>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-grid]").forEach((b) => {
      b.onclick = () => {
        activeGrammarId = b.getAttribute("data-grid");
        grammarReorderDraft = [];
        renderGrammar(container);
      };
    });

    container.querySelectorAll("[data-speak]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak"));
    });

    container.querySelector("#gr-save-nb").onclick = () => {
      QCore.addToNotebook({
        category: "grammar",
        hanzi: lesson.title,
        pinyin: lesson.formula,
        english: lesson.explainEn,
        vietnamese: lesson.explainVi,
        example: lesson.examples[0] ? `${lesson.examples[0].chinese} (${lesson.examples[0].vietnamese})` : "",
        note: lesson.commonMistakes
      });
    };

    container.querySelectorAll("[data-gr-fb]").forEach((b) => {
      b.onclick = () => {
        const ok = b.getAttribute("data-gr-fb") === lesson.exercises.fillBlank.answer;
        QCore.updateSkillScore("grammar", ok ? 92 : 60);
        container.querySelector("#gr-fb-msg").innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ Đúng rồi! ${QCore.escapeHtml(lesson.exercises.fillBlank.explain)}</span>`
          : `<span style="color:var(--accent-red);">❌ Chưa đúng. ${QCore.escapeHtml(lesson.exercises.fillBlank.explain)}</span>`;
      };
    });

    container.querySelectorAll("[data-gr-word]").forEach((b) => {
      b.onclick = () => {
        grammarReorderDraft.push(b.getAttribute("data-gr-word"));
        renderGrammar(container);
      };
    });
    container.querySelector("#gr-ord-clear").onclick = () => {
      grammarReorderDraft = [];
      renderGrammar(container);
    };
    container.querySelector("#gr-ord-check").onclick = () => {
      const s = grammarReorderDraft.join("");
      const ex = lesson.exercises.reorder;
      const ok = s === ex.answer || (ex.altAnswers && ex.altAnswers.includes(s));
      QCore.updateSkillScore("grammar", ok ? 95 : 60);
      container.querySelector("#gr-ord-msg").innerHTML = ok
        ? `<span style="color:var(--primary);font-weight:700;">✅ Chính xác! ${QCore.escapeHtml(ex.answer)} (${QCore.escapeHtml(ex.pinyin)})</span>`
        : `<span style="color:var(--accent-red);">Đáp án chuẩn: <strong>${QCore.escapeHtml(ex.answer)}</strong> — ${QCore.escapeHtml(ex.explain)}</span>`;
    };

    container.querySelectorAll("[data-gr-mcq]").forEach((b) => {
      b.onclick = () => {
        const ok = b.getAttribute("data-gr-mcq") === lesson.exercises.multipleChoice.answer;
        QCore.updateSkillScore("grammar", ok ? 95 : 58);
        container.querySelector("#gr-mcq-msg").innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ Hoàn toàn chính xác! ${QCore.escapeHtml(lesson.exercises.multipleChoice.explain)}</span>`
          : `<span style="color:var(--accent-red);">❌ Chưa đúng. ${QCore.escapeHtml(lesson.exercises.multipleChoice.explain)}</span>`;
      };
    });

    container.querySelector("#gr-free-btn").onclick = async () => {
      const val = container.querySelector("#gr-free-inp").value.trim();
      const msgEl = container.querySelector("#gr-free-msg");
      if (!val) {
        QCore.showToast("Hãy viết câu của bạn trước nhé!");
        return;
      }
      msgEl.textContent = "⏳ Giáo viên AI đang kiểm tra ngữ pháp...";
      try {
        const res = await QCore.apiFetch("/api/ai/writing", {
          method: "POST",
          body: {
            text: val,
            prompt: lesson.exercises.freeWritePrompt,
            expected: lesson.examples[0].chinese,
            expectedPinyin: lesson.examples[0].pinyin,
            expectedEn: lesson.examples[0].english,
            expectedVi: lesson.examples[0].vietnamese,
            hskLevel: lesson.hsk_level
          }
        });
        if (!st.grammarCompleted.includes(lesson.id)) {
          st.grammarCompleted.push(lesson.id);
          QCore.logDailyActivity("grammarCount", 1);
        }
        QCore.updateSkillScore("grammar", res.score);
        QCore.saveState(true);
        msgEl.innerHTML = `
          <div style="padding:10px;border-radius:10px;background:var(--bg-surface);border:1px solid var(--primary);">
            <strong>Điểm ngữ pháp: ${res.score}/100</strong> · Câu chuẩn: <strong class="hanzi-text" style="color:var(--primary);">${QCore.escapeHtml(res.corrected)}</strong>
            <div style="margin-top:4px;">${QCore.escapeHtml(res.whyWrong)}</div>
          </div>
        `;
      } catch (e) {
        msgEl.textContent = e.message;
      }
    };
  }

  /* ==================== 6.4. SPEAKING – AI CONVERSATION TUTOR ==================== */
  let spkMode = "basic"; // "basic" | "free"
  let spkTopic = "greeting";
  let spkShowPinyin = true;
  let spkShowTrans = true;
  let chatHistory = [];
  let latestSuggestions = [];

  const BASIC_TOPICS = [
    { id: "greeting", label: "👋 Chào hỏi" },
    { id: "intro", label: "🙋 Giới thiệu bản thân" },
    { id: "name", label: "🪪 Hỏi tên" },
    { id: "age", label: "🎂 Hỏi tuổi" },
    { id: "family", label: "🏠 Gia đình" },
    { id: "school", label: "📚 Trường học" },
    { id: "food", label: "🍜 Gọi món" },
    { id: "direction", label: "🗺️ Hỏi đường" }
  ];

  async function startNewConversation(container) {
    const st = QCore.getState();
    chatHistory = [];
    try {
      const res = await QCore.apiFetch("/api/ai/speaking", {
        method: "POST",
        body: { mode: spkMode, topic: spkTopic, hskLevel: st.profile.hskLevel, message: "" }
      });
      chatHistory.push({
        role: "ai",
        chinese: res.reply,
        pinyin: res.pinyin,
        english: res.english,
        vietnamese: res.vietnamese
      });
      latestSuggestions = res.suggestions || [];
      QCore.speakChinese(res.reply);
      renderSpeaking(container, true);
    } catch (e) {
      QCore.showToast(e.message);
    }
  }

  function renderSpeaking(container, skipAutoInit = false) {
    const st = QCore.getState();
    if (!chatHistory.length && !skipAutoInit) {
      container.innerHTML = `<div class="card">⏳ Đang kết nối với AI Giáo viên tiếng Trung...</div>`;
      startNewConversation(container);
      return;
    }

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🎙️ Luyện Nói Tiếng Trung Với AI Giáo Viên (HSK ${st.profile.hskLevel})</h2>
          <p>Trò chuyện ở tốc độ phù hợp người mới, có Pinyin, dịch Anh–Việt, sửa lỗi ngữ pháp/dùng từ và gợi ý câu trả lời.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn ${spkShowPinyin ? "btn-primary" : "btn-outline"} btn-sm" id="spk-tog-py">ā Hiện Pinyin</button>
          <button class="btn ${spkShowTrans ? "btn-primary" : "btn-outline"} btn-sm" id="spk-tog-tr">🌐 Hiện Dịch Việt–Anh</button>
          <button class="btn btn-outline btn-sm" id="spk-restart">🔄 Bắt đầu hội thoại mới</button>
        </div>
      </div>

      <!-- Mode & Topic Selector -->
      <div class="card" style="padding:16px;margin-bottom:18px;">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:${spkMode === "basic" ? "12px" : "0"};">
          <div class="tabs-bar">
            <button class="tab-pill ${spkMode === "basic" ? "active" : ""}" data-spkmode="basic">Chế độ 1: Giao tiếp cơ bản (8 tình huống)</button>
            <button class="tab-pill ${spkMode === "free" ? "active" : ""}" data-spkmode="free">Chế độ 2: Hội thoại tự do theo HSK ${st.profile.hskLevel}</button>
          </div>
        </div>
        ${
          spkMode === "basic"
            ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${BASIC_TOPICS.map(
              (t) => `<button class="btn ${spkTopic === t.id ? "btn-primary" : "btn-outline"} btn-sm" data-spktopic="${t.id}">${t.label}</button>`
            ).join("")}
          </div>
        `
            : ""
        }
      </div>

      <div class="card">
        <div class="chat-stream" id="spk-chat-stream">
          ${chatHistory
            .map(
              (m, idx) => `
            <div class="chat-bubble ${m.role}">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:4px;">
                <strong style="font-size:12.5px;color:var(--text-muted);">${m.role === "ai" ? "👩‍🏫 AI Giáo viên" : "🙋 Bạn"}</strong>
                <div style="display:flex;gap:4px;">
                  <button class="btn btn-outline btn-sm" style="padding:2px 8px;font-size:11.5px;" data-chat-speak="${QCore.escapeHtml(m.chinese)}">🔊 Nghe</button>
                  <button class="btn btn-outline btn-sm" style="padding:2px 8px;font-size:11.5px;" data-chat-slow="${QCore.escapeHtml(m.chinese)}">🐢 Chậm</button>
                </div>
              </div>
              ${spkShowPinyin && m.pinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--primary);font-weight:600;">${QCore.escapeHtml(m.pinyin)}</div>` : ""}
              <div class="hanzi-text" style="font-size:19px;font-weight:600;">${QCore.escapeHtml(m.chinese)}</div>
              ${
                spkShowTrans && (m.vietnamese || m.english)
                  ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">🇻🇳 ${QCore.escapeHtml(m.vietnamese || "")} ${m.english ? `<br>🇬🇧 ${QCore.escapeHtml(m.english)}` : ""}</div>`
                  : ""
              }
              ${
                m.feedback
                  ? `
                <div class="card-subtle" style="margin-top:8px;padding:8px 10px;font-size:12.5px;border-left:3px solid ${m.feedback.isCorrect ? "var(--primary)" : "var(--accent-amber)"};">
                  ${m.feedback.isCorrect ? "✅" : "🛠️ <strong>Sửa lỗi:</strong>"}
                  ${!m.feedback.isCorrect && m.feedback.correctedSentence ? `<span class="hanzi-text" style="font-weight:700;color:var(--primary);"> ${QCore.escapeHtml(m.feedback.correctedSentence)}</span> — ` : ""}
                  ${QCore.escapeHtml(m.feedback.explanationVi || "")}
                </div>
              `
                  : ""
              }
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Suggested Replies for Beginners -->
        ${
          latestSuggestions.length
            ? `
          <div style="margin-top:12px;">
            <small style="color:var(--text-muted);display:block;margin-bottom:6px;">💡 Gợi ý câu trả lời (bấm để điền hoặc nghe thử trước khi tự nói):</small>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${latestSuggestions
                .map(
                  (s) => `
                <button class="btn btn-soft btn-sm" style="text-align:left;" data-sug-hz="${QCore.escapeHtml(s.chinese)}">
                  <span class="hanzi-text" style="font-size:15px;font-weight:700;">${QCore.escapeHtml(s.chinese)}</span>
                  <span style="font-size:12px;">(${QCore.escapeHtml(s.pinyin)} · ${QCore.escapeHtml(s.vietnamese)})</span>
                </button>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
          <button class="btn btn-soft" id="spk-mic-btn">🎙️ Nói bằng Micro</button>
          <input class="input-field hanzi-text" id="spk-input" data-pinyin-ime="true" style="flex:1;min-width:220px;" placeholder="Hoặc gõ Pinyin (vd: wo shi yuenan ren) để chọn chữ Hán trả lời...">
          <button class="btn btn-primary" id="spk-send-btn">Gửi câu nói →</button>
        </div>
      </div>
    `;

    const streamEl = container.querySelector("#spk-chat-stream");
    if (streamEl) streamEl.scrollTop = streamEl.scrollHeight;

    container.querySelector("#spk-tog-py").onclick = () => { spkShowPinyin = !spkShowPinyin; renderSpeaking(container, true); };
    container.querySelector("#spk-tog-tr").onclick = () => { spkShowTrans = !spkShowTrans; renderSpeaking(container, true); };
    container.querySelector("#spk-restart").onclick = () => startNewConversation(container);

    container.querySelectorAll("[data-spkmode]").forEach((b) => {
      b.onclick = () => {
        spkMode = b.getAttribute("data-spkmode");
        startNewConversation(container);
      };
    });
    container.querySelectorAll("[data-spktopic]").forEach((b) => {
      b.onclick = () => {
        spkTopic = b.getAttribute("data-spktopic");
        startNewConversation(container);
      };
    });

    container.querySelectorAll("[data-chat-speak]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-chat-speak"));
    });
    container.querySelectorAll("[data-chat-slow]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-chat-slow"), { slow: true });
    });

    const inp = container.querySelector("#spk-input");
    container.querySelectorAll("[data-sug-hz]").forEach((b) => {
      b.onclick = () => {
        inp.value = b.getAttribute("data-sug-hz");
        QCore.speakChinese(inp.value);
        inp.focus();
      };
    });

    const sendUserTurn = async () => {
      const msg = inp.value.trim();
      if (!msg) return;
      inp.value = "";
      chatHistory.push({ role: "user", chinese: msg });
      renderSpeaking(container, true);

      try {
        const res = await QCore.apiFetch("/api/ai/speaking", {
          method: "POST",
          body: {
            mode: spkMode,
            topic: spkTopic,
            hskLevel: st.profile.hskLevel,
            message: msg,
            history: chatHistory.map((h) => ({ role: h.role, text: h.chinese }))
          }
        });
        // Attach grammar/word feedback to user's message bubble
        chatHistory[chatHistory.length - 1].feedback = res.feedback;
        chatHistory.push({
          role: "ai",
          chinese: res.reply,
          pinyin: res.pinyin,
          english: res.english,
          vietnamese: res.vietnamese
        });
        latestSuggestions = res.suggestions || [];
        st.speakingSessions = (st.speakingSessions || 0) + 1;
        QCore.logDailyActivity("speakingMinutes", 1);
        QCore.updateSkillScore("speaking", res.feedback && res.feedback.isCorrect ? 90 : 72);
        QCore.speakChinese(res.reply);
        renderSpeaking(container, true);
      } catch (e) {
        QCore.showToast(e.message);
      }
    };

    container.querySelector("#spk-send-btn").onclick = sendUserTurn;
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendUserTurn();
    });

    container.querySelector("#spk-mic-btn").onclick = () => {
      const micBtn = container.querySelector("#spk-mic-btn");
      micBtn.textContent = "🔴 Đang nghe (hãy nói tiếng Trung)...";
      QCore.captureLearnerVoice({
        durationMs: 4200,
        onAudioReady: (_, transcript) => {
          micBtn.textContent = "🎙️ Nói bằng Micro";
          if (transcript) {
            inp.value = transcript;
            QCore.showToast(`Đã nhận diện: "${transcript}" — bấm Gửi để AI phản hồi!`);
          } else {
            QCore.showToast("Trình duyệt chưa nhận diện được câu tiếng Trung rõ ràng, bạn có thể nói lại hoặc dùng thanh gợi ý Pinyin nhé!");
          }
        }
      });
    };
  }

  /* ==================== 6.5. READING – SPLIT-SCREEN STUDIO ==================== */
  let activeReadId = "read_hsk1_day";
  let rdShowPinyin = true;
  let rdShowTrans = false;
  let selectedToken = null;
  let selectedSentIdx = 0;
  let showReadQuiz = false;

  function renderReading(container) {
    const passages = window.QCHINESE_READING || [];
    const passage = passages.find((p) => p.id === activeReadId) || passages[0];
    const st = QCore.getState();
    const sent = passage.sentences[selectedSentIdx] || passage.sentences[0];
    const tok = selectedToken || sent.tokens.find((t) => !t.punct) || sent.tokens[0];
    const noteKey = `${passage.id}_${selectedSentIdx}`;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>📰 Luyện Đọc Hiểu Song Song (HSK 1 – HSK 6)</h2>
          <p>Bên trái: Văn bản chữ Hán Giản thể (bấm từng từ để nghe âm & xem nghĩa). Bên phải: Từ điển ngữ cảnh, ghi chú câu và bài kiểm tra đọc hiểu.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${passages
            .map(
              (p) => `<button class="btn ${p.id === passage.id ? "btn-primary" : "btn-outline"} btn-sm" data-rdid="${p.id}">HSK ${p.hsk_level}: ${QCore.escapeHtml(p.title.split("(")[0])}</button>`
            )
            .join("")}
        </div>
      </div>

      <div class="reading-layout">
        <!-- LEFT PANE: Chinese Text -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--border-color);margin-bottom:14px;">
            <div>
              <span class="badge badge-jade">HSK ${passage.hsk_level}</span>
              <h3 style="margin:4px 0 0;">${QCore.escapeHtml(passage.title)}</h3>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn ${rdShowPinyin ? "btn-primary" : "btn-outline"} btn-sm" id="rd-tog-py">ā Pinyin</button>
              <button class="btn ${rdShowTrans ? "btn-primary" : "btn-outline"} btn-sm" id="rd-tog-tr">👁️ Bản dịch</button>
              <button class="btn btn-soft btn-sm" id="rd-play-passage">🔊 Nghe cả bài</button>
              <button class="btn btn-outline btn-sm" id="rd-open-quiz">📝 Kiểm tra sau đọc</button>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;">
            ${passage.sentences
              .map(
                (s, sIdx) => `
              <div class="card-subtle" style="border-color:${selectedSentIdx === sIdx ? "var(--primary)" : "var(--border-color)"};">
                <div style="display:flex;flex-wrap:wrap;align-items:flex-end;">
                  ${s.tokens
                    .map((t, tIdx) => {
                      if (t.punct) {
                        return `<span class="hanzi-text" style="font-size:23px;padding:3px 2px;">${QCore.escapeHtml(t.w)}</span>`;
                      }
                      const isMarked = st.markedWords.includes(t.w);
                      const isSel = selectedToken && selectedToken.w === t.w && selectedSentIdx === sIdx;
                      return `
                        <span class="reading-token ${isSel ? "selected" : ""} ${isMarked ? "marked" : ""}" data-sidx="${sIdx}" data-tidx="${tIdx}">
                          ${rdShowPinyin ? `<span class="rt-py pinyin-text">${QCore.escapeHtml(t.py)}</span>` : ""}
                          <span class="rt-hz">${QCore.escapeHtml(t.w)}</span>
                        </span>
                      `;
                    })
                    .join("")}
                  <button class="btn btn-outline btn-sm" style="margin-left:8px;padding:3px 8px;" data-speak-sent="${QCore.escapeHtml(s.zh)}" data-sel-sent="${sIdx}">🔊 Câu ${sIdx + 1}</button>
                </div>
                ${
                  rdShowTrans
                    ? `<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border-color);font-size:13.5px;color:var(--text-secondary);">🇻🇳 <strong>${QCore.escapeHtml(s.vi)}</strong><br>🇬🇧 ${QCore.escapeHtml(s.en)}</div>`
                    : ""
                }
              </div>
            `
              )
              .join("")}
          </div>

          ${
            showReadQuiz
              ? `
            <div class="card-subtle" style="margin-top:18px;border:1.5px solid var(--primary);">
              <h4 style="margin:0 0 10px;">📝 Bài kiểm tra đọc hiểu</h4>
              ${passage.quiz
                .map(
                  (qz, qi) => `
                <div style="margin-bottom:12px;">
                  <strong style="display:block;margin-bottom:6px;">Câu ${qi + 1}: ${QCore.escapeHtml(qz.q)}</strong>
                  <div class="grid-2" style="gap:6px;">
                    ${qz.options
                      .map(
                        (opt) => `<button class="btn btn-outline btn-sm" style="justify-content:flex-start;" data-rd-q="${qi}" data-rd-opt="${QCore.escapeHtml(opt)}">${QCore.escapeHtml(opt)}</button>`
                      )
                      .join("")}
                  </div>
                  <div id="rd-q-fb-${qi}" style="margin-top:4px;font-size:13px;"></div>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
        </div>

        <!-- RIGHT PANE: Explanation, Word Inspector, Highlight, Save to Notebook & Sentence Notes -->
        <div class="card" style="position:sticky;top:76px;">
          <span class="badge badge-blue" style="margin-bottom:8px;">🔍 Giải thích từ & Dịch câu đang chọn</span>
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;">
            <div>
              <div class="hanzi-calligraphy" style="font-size:44px;line-height:1.1;">${QCore.escapeHtml(tok.w)}</div>
              <div class="pinyin-text" style="font-size:18px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(tok.py || "")}</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              <button class="btn btn-primary btn-sm" id="rd-tok-speak">🔊 Nghe từ</button>
              <button class="btn btn-outline btn-sm" id="rd-tok-stroke">✍️ Xem nét chữ đầu</button>
            </div>
          </div>

          <div class="card-subtle" style="margin-bottom:12px;">
            <div>🇻🇳 <strong>Nghĩa tiếng Việt:</strong> ${QCore.escapeHtml(tok.vi || "Dấu câu")}</div>
            <div style="margin-top:4px;">🇬🇧 <strong>Nghĩa tiếng Anh:</strong> ${QCore.escapeHtml(tok.en || "")}</div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
            <button class="btn btn-soft btn-sm" id="rd-mark-word">
              ${st.markedWords.includes(tok.w) ? "★ Bỏ đánh dấu từ mới" : "☆ Đánh dấu từ mới"}
            </button>
            <button class="btn btn-outline btn-sm" id="rd-save-nb">📒 Lưu từ vào Sổ tay</button>
          </div>

          <hr style="border:none;border-top:1px solid var(--border-color);margin:14px 0;">

          <h4 style="margin:0 0 6px;font-size:14.5px;">📖 Dịch nghĩa Câu ${selectedSentIdx + 1}</h4>
          <div class="card-subtle" style="margin-bottom:12px;font-size:13.5px;">
            <div class="hanzi-text" style="font-weight:700;margin-bottom:4px;">${QCore.escapeHtml(sent.zh)}</div>
            <div style="color:var(--primary);margin-bottom:4px;">${QCore.escapeHtml(sent.py)}</div>
            <div>🇻🇳 <strong>${QCore.escapeHtml(sent.vi)}</strong></div>
            <div style="color:var(--text-secondary);">🇬🇧 ${QCore.escapeHtml(sent.en)}</div>
          </div>

          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">📝 Ghi chú cá nhân cho câu này:</label>
          <textarea class="textarea-field" id="rd-sent-note" rows="2" placeholder="Ghi chú ngữ pháp hoặc từ mới của riêng bạn...">${QCore.escapeHtml(st.readingNotes[noteKey] || "")}</textarea>
          <button class="btn btn-outline btn-sm" style="margin-top:8px;" id="rd-save-note">Lưu ghi chú câu</button>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-rdid]").forEach((b) => {
      b.onclick = () => {
        activeReadId = b.getAttribute("data-rdid");
        selectedSentIdx = 0;
        selectedToken = null;
        showReadQuiz = false;
        renderReading(container);
      };
    });

    container.querySelector("#rd-tog-py").onclick = () => { rdShowPinyin = !rdShowPinyin; renderReading(container); };
    container.querySelector("#rd-tog-tr").onclick = () => { rdShowTrans = !rdShowTrans; renderReading(container); };
    container.querySelector("#rd-open-quiz").onclick = () => { showReadQuiz = !showReadQuiz; renderReading(container); };

    container.querySelector("#rd-play-passage").onclick = () => {
      const fullText = passage.sentences.map((s) => s.zh).join(" ");
      QCore.speakChinese(fullText);
    };

    container.querySelectorAll("[data-sidx]").forEach((el) => {
      el.onclick = () => {
        selectedSentIdx = Number(el.getAttribute("data-sidx"));
        const tIdx = Number(el.getAttribute("data-tidx"));
        selectedToken = passage.sentences[selectedSentIdx].tokens[tIdx];
        QCore.speakChinese(selectedToken.w);
        renderReading(container);
      };
    });

    container.querySelectorAll("[data-speak-sent]").forEach((b) => {
      b.onclick = () => {
        selectedSentIdx = Number(b.getAttribute("data-sel-sent"));
        QCore.speakChinese(b.getAttribute("data-speak-sent"));
        renderReading(container);
      };
    });

    container.querySelector("#rd-tok-speak").onclick = () => QCore.speakChinese(tok.w);
    container.querySelector("#rd-tok-stroke").onclick = () => window.QApp.navigate("hanzi", { char: tok.w.charAt(0) });
    container.querySelector("#rd-mark-word").onclick = () => {
      const idx = st.markedWords.indexOf(tok.w);
      if (idx >= 0) st.markedWords.splice(idx, 1);
      else st.markedWords.push(tok.w);
      QCore.saveState(false);
      renderReading(container);
    };
    container.querySelector("#rd-save-nb").onclick = () => {
      QCore.addToNotebook({
        category: "vocab",
        hanzi: tok.w,
        pinyin: tok.py,
        english: tok.en,
        vietnamese: tok.vi,
        example: `${sent.zh} (${sent.vi})`
      });
    };
    container.querySelector("#rd-save-note").onclick = () => {
      const val = container.querySelector("#rd-sent-note").value.trim();
      st.readingNotes[noteKey] = val;
      if (val) {
        QCore.addToNotebook({
          category: "sentence",
          hanzi: sent.zh,
          pinyin: sent.py,
          english: sent.en,
          vietnamese: sent.vi,
          note: val
        });
      } else {
        QCore.saveState(true);
        QCore.showToast("Đã lưu ghi chú!");
      }
    };

    container.querySelectorAll("[data-rd-q]").forEach((b) => {
      b.onclick = () => {
        const qi = Number(b.getAttribute("data-rd-q"));
        const opt = b.getAttribute("data-rd-opt");
        const ok = opt === passage.quiz[qi].answer;
        QCore.updateSkillScore("reading", ok ? 95 : 60);
        if (ok && !st.readingCompleted.includes(passage.id)) {
          st.readingCompleted.push(passage.id);
          QCore.saveState(true);
        }
        container.querySelector(`#rd-q-fb-${qi}`).innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ Chính xác!</span>`
          : `<span style="color:var(--accent-red);">❌ Đáp án đúng là: ${QCore.escapeHtml(passage.quiz[qi].answer)}</span>`;
      };
    });
  }

  /* ==================== 6.6. WRITING STUDIO (PART A HANZI + PART B SENTENCE/PARAGRAPH AI) ==================== */
  let wrSection = "partB"; // "partA" | "partB"
  let activeTaskIdx = 0;
  let lastAiGrade = null;

  function renderWriting(container) {
    const tasks = window.QCHINESE_WRITING_TASKS || [];
    const task = tasks[activeTaskIdx % tasks.length];
    const st = QCore.getState();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🖋️ Luyện Viết Tiếng Trung Toàn Diện (Chữ Hán & Viết Câu/Đoạn AI)</h2>
          <p>Phân chia rõ 2 phần: A. Luyện viết chữ Hán chuẩn thứ tự nét & B. Viết câu, dịch câu, viết đoạn văn được AI sửa chi tiết theo 7 tiêu chí.</p>
        </div>
        <div class="tabs-bar">
          <button class="tab-pill ${wrSection === "partA" ? "active" : ""}" data-wrtab="partA">Phần A: Viết chữ Hán theo nét</button>
          <button class="tab-pill ${wrSection === "partB" ? "active" : ""}" data-wrtab="partB">Phần B: Viết câu & đoạn văn (AI sửa 7 tiêu chí)</button>
        </div>
      </div>

      <div id="writing-stage"></div>
    `;

    container.querySelectorAll("[data-wrtab]").forEach((b) => {
      b.onclick = () => {
        wrSection = b.getAttribute("data-wrtab");
        renderWriting(container);
      };
    });

    const stage = container.querySelector("#writing-stage");

    if (wrSection === "partA") {
      // Embed the full Hanzi Writing Studio directly for Part A!
      window.QHanziStudio.renderHanzi(stage);
      return;
    }

    // Part B: Sentence & Paragraph Writing with 7-Criteria AI Feedback
    stage.innerHTML = `
      <div class="grid-2">
        <div class="card">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
            ${tasks
              .map(
                (t, idx) => `
              <button class="btn ${idx === activeTaskIdx ? "btn-primary" : "btn-outline"} btn-sm" data-wtask="${idx}">
                Đề ${idx + 1}: HSK ${t.hsk_level}
              </button>
            `
              )
              .join("")}
          </div>

          <span class="badge badge-jade" style="margin-bottom:8px;">${QCore.escapeHtml(task.badge)}</span>
          <h3 style="margin:0 0 10px;font-size:18px;">${QCore.escapeHtml(task.prompt)}</h3>
          <div class="card-subtle" style="margin-bottom:14px;font-size:13px;color:var(--text-secondary);">
            💡 ${QCore.escapeHtml(task.hint)}
          </div>

          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">1. Nhập câu / đoạn văn bằng Chữ Hán Giản thể (gõ Pinyin tự động hiện gợi ý chữ Hán):</label>
          <textarea class="textarea-field hanzi-text" id="wr-main-text" rows="4" data-pinyin-ime="true" style="font-size:18px;margin-bottom:12px;" placeholder="Ví dụ gõ: wo shi yuenan ren..."></textarea>

          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">2. Nhập Pinyin của câu (tùy chọn – nếu nhập AI sẽ chấm cả lỗi Pinyin cho bạn):</label>
          <input class="input-field pinyin-text" id="wr-opt-py" data-pinyin-ime="true" data-pinyin-mode="pinyin-only" placeholder="Tùy chọn: gõ Pinyin để luyện thêm dấu thanh..." style="margin-bottom:14px;">

          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="wr-submit-ai">👩‍🏫 Chấm & Sửa bài chi tiết (7 tiêu chí)</button>
            <button class="btn btn-outline" id="wr-save-wrong">📒 Lưu câu vào Sổ tay</button>
          </div>
        </div>

        <div class="card" id="wr-feedback-panel">
          ${
            lastAiGrade
              ? renderAiWritingFeedbackHTML(lastAiGrade)
              : `
            <div style="text-align:center;padding:40px 18px;color:var(--text-muted);">
              <div style="font-size:42px;margin-bottom:10px;">📝</div>
              <strong style="color:var(--text-main);font-size:16px;">Bảng chấm bài chi tiết 7 tiêu chí của AI Giáo viên</strong>
              <p style="font-size:13.5px;margin-top:6px;">
                Sau khi bạn nộp bài viết bên trái, AI Giáo viên sẽ phân tích: Chữ Hán Giản thể, Pinyin, Ngữ pháp, Dùng từ, Trật tự từ, Độ tự nhiên, Phù hợp ngữ cảnh — kèm giải thích tại sao sai và ví dụ tương tự để bạn tự sửa được lần sau!
              </p>
            </div>
          `
          }
        </div>
      </div>
    `;

    stage.querySelectorAll("[data-wtask]").forEach((b) => {
      b.onclick = () => {
        activeTaskIdx = Number(b.getAttribute("data-wtask"));
        lastAiGrade = null;
        renderWriting(container);
      };
    });

    bindGradePanelAudio(stage);

    stage.querySelector("#wr-submit-ai").onclick = async () => {
      const text = stage.querySelector("#wr-main-text").value.trim();
      const py = stage.querySelector("#wr-opt-py").value.trim();
      if (!text) {
        QCore.showToast("Vui lòng nhập câu hoặc đoạn văn tiếng Trung trước khi chấm bài!");
        return;
      }
      const panel = stage.querySelector("#wr-feedback-panel");
      panel.innerHTML = `<div style="padding:30px;text-align:center;">⏳ Giáo viên AI đang chấm từng tiêu chí chữ Hán, ngữ pháp và trật tự từ...</div>`;
      try {
        const res = await QCore.apiFetch("/api/ai/writing", {
          method: "POST",
          body: {
            text,
            pinyin: py,
            prompt: task.prompt,
            targetWord: task.targetWord,
            expected: task.expected,
            expectedPinyin: task.expectedPinyin,
            expectedEn: task.expectedEn,
            expectedVi: task.expectedVi,
            hskLevel: task.hsk_level
          }
        });
        lastAiGrade = res;
        st.writingSubmissions.unshift({
          date: QCore.todayStr(),
          original: res.original,
          corrected: res.corrected,
          score: res.score
        });
        QCore.updateSkillScore("writing", res.score);
        QCore.saveState(true);
        panel.innerHTML = renderAiWritingFeedbackHTML(res);
        bindGradePanelAudio(panel);
      } catch (e) {
        panel.innerHTML = `<div style="color:var(--accent-red);">${QCore.escapeHtml(e.message)}</div>`;
      }
    };

    stage.querySelector("#wr-save-wrong").onclick = () => {
      if (!lastAiGrade) {
        QCore.showToast("Hãy bấm Chấm bài trước để lưu kèm câu sửa chuẩn vào Sổ tay nhé!");
        return;
      }
      QCore.addToNotebook({
        category: "wrong_write",
        hanzi: lastAiGrade.corrected,
        pinyin: lastAiGrade.pinyin,
        english: lastAiGrade.english,
        vietnamese: lastAiGrade.vietnamese,
        example: `Câu đã viết: ${lastAiGrade.original}`,
        note: lastAiGrade.whyWrong
      });
    };
  }

  function renderAiWritingFeedbackHTML(g) {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span class="badge ${g.score >= 80 ? "badge-jade" : "badge-amber"}">Điểm bài viết: ${g.score}/100</span>
        <button class="btn btn-soft btn-sm" data-speak-corr="${QCore.escapeHtml(g.corrected)}">🔊 Nghe câu chuẩn</button>
      </div>

      <div class="card-subtle" style="margin-bottom:12px;">
        <div style="font-size:13px;color:var(--text-muted);">Câu bạn đã viết:</div>
        <div class="hanzi-text" style="font-size:17px;margin-bottom:8px;">${QCore.escapeHtml(g.original)}</div>
        <div style="font-size:13px;color:var(--primary);font-weight:700;">✅ Câu sửa đúng chuẩn Giản thể:</div>
        <div class="hanzi-text" style="font-size:21px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(g.corrected)}</div>
        <div class="pinyin-text" style="font-size:13.5px;margin-top:3px;"><strong>Pinyin:</strong> ${QCore.escapeHtml(g.pinyin)}</div>
        <div style="font-size:13px;margin-top:3px;">🇬🇧 <strong>English:</strong> ${QCore.escapeHtml(g.english)}</div>
        <div style="font-size:13px;margin-top:2px;">🇻🇳 <strong>Tiếng Việt:</strong> ${QCore.escapeHtml(g.vietnamese)}</div>
      </div>

      <div class="vi-hint-banner" style="margin-bottom:12px;">
        <span>💡</span>
        <div><strong>Giải thích tại sao sai & cách nhớ:</strong> ${QCore.escapeHtml(g.whyWrong)}</div>
      </div>

      <h4 style="margin:0 0 8px;font-size:14px;">📋 Đánh giá theo 7 tiêu chí bắt buộc</h4>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
        ${(g.criteria || [])
          .map((c) => {
            const icon = c.status === "good" ? "✅" : c.status === "warn" ? "⚠️" : "❌";
            return `<div style="font-size:12.5px;padding:7px 10px;border-radius:9px;background:var(--bg-subtle);"><strong>${icon} ${QCore.escapeHtml(c.name)}:</strong> ${QCore.escapeHtml(c.comment)}</div>`;
          })
          .join("")}
      </div>

      <h4 style="margin:0 0 8px;font-size:14px;">🔁 Ví dụ tương tự để luyện lại</h4>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${(g.similarExamples || [])
          .map(
            (ex) => `
          <div class="card-subtle" style="padding:8px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div style="font-size:13px;">
              <strong class="hanzi-text" style="font-size:15.5px;">${QCore.escapeHtml(ex.chinese)}</strong> (${QCore.escapeHtml(ex.pinyin)})<br>
              <span>🇬🇧 ${QCore.escapeHtml(ex.english)} · 🇻🇳 ${QCore.escapeHtml(ex.vietnamese)}</span>
            </div>
            <button class="btn btn-outline btn-sm" data-speak-corr="${QCore.escapeHtml(ex.chinese)}">🔊</button>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  function bindGradePanelAudio(root) {
    root.querySelectorAll("[data-speak-corr]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak-corr"));
    });
  }

  return {
    renderGrammar,
    renderSpeaking,
    renderReading,
    renderWriting
  };
})();
