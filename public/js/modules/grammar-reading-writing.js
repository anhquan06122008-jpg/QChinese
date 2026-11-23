/* -*- coding: utf-8 -*-
 * QChinese – External Learning Library Modules (100% Independent of AI PDF HSK 3.0)
 * - 6.2. External Grammar Studio (Cards Library + 5 Exercise Types: Cấu trúc câu, Điền từ, Chọn đáp án, Sắp xếp câu, Sửa lỗi ngữ pháp)
 * - 6.4. External Speaking Studio (4 Modes: Hội thoại, Trả lời câu hỏi, Mô phỏng tình huống, Phản xạ giao tiếp)
 * - 6.5. External Reading Academic & Real-Life Library (QEnglish-style Card Grid + Split-Screen Comprehension Workspace)
 * - 6.6. External Writing Hub:
 *        + Tab 1: Vietnamese -> Chinese Paragraph & Sentence Translation (10-part AI Grading Engine)
 *        + Tab 2: Writing Studio (Custom Prompt Grading + Topic Cards + Hanzi Stroke Studio)
 */

window.QGrammarReadingWriting = (function () {
  function isViMode() {
    return window.QCore && typeof QCore.getUiLang === "function" && QCore.getUiLang() === "vi";
  }

  function renderHskBadge(level) {
    const lv = Number(level || 1);
    const colors = {
      1: "background:rgba(16,185,129,0.16);color:#10b981;border:1px solid rgba(16,185,129,0.35);",
      2: "background:rgba(59,130,246,0.16);color:#3b82f6;border:1px solid rgba(59,130,246,0.35);",
      3: "background:rgba(139,92,246,0.16);color:#8b5cf6;border:1px solid rgba(139,92,246,0.35);",
      4: "background:rgba(245,158,11,0.16);color:#f59e0b;border:1px solid rgba(245,158,11,0.35);",
      5: "background:rgba(236,72,153,0.16);color:#ec4899;border:1px solid rgba(236,72,153,0.35);",
      6: "background:rgba(239,68,68,0.16);color:#ef4444;border:1px solid rgba(239,68,68,0.35);"
    };
    return `<span class="badge" style="${colors[lv] || colors[1]}font-weight:800;">HSK ${lv}</span>`;
  }

  /* ==================== 6.2. EXTERNAL GRAMMAR STUDIO ==================== */
  let grViewMode = "library"; // "library" | "session"
  let grLevelFilter = "all";
  let grSearchQuery = "";
  let activeGrammarId = "g_shi";
  let grammarReorderDraft = [];

  function renderGrammar(container, params = {}) {
    const list = window.QCHINESE_GRAMMAR || [];
    const st = QCore.getState();
    const extProg = (st.externalLibraryProgress && st.externalLibraryProgress.grammar) || { completedIds: [], scoresById: {} };

    if (params && params.grammarId) {
      activeGrammarId = params.grammarId;
      grViewMode = "session";
    } else if (params && params.view === "library") {
      grViewMode = "library";
    }

    if (grViewMode === "library") {
      const q = grSearchQuery.trim().toLowerCase();
      const filtered = list.filter((g) => {
        if (grLevelFilter !== "all" && String(g.hsk_level) !== String(grLevelFilter)) return false;
        if (q) {
          const hay = `${g.title} ${g.formula} ${g.topic || ""} ${g.explainVi || ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      container.innerHTML = `
        <div class="page-header">
          <div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
              <span class="badge badge-jade">🧩 External Grammar Library</span>
              <span class="badge badge-blue">Độc lập hoàn toàn với AI PDF HSK 3.0</span>
            </div>
            <h2 style="margin:0;">🧩 Grammar — Thư Viện Ngữ Pháp Tiếng Trung (HSK 1 – HSK 6)</h2>
            <p style="margin:4px 0 0;">Mỗi chuyên đề gồm công thức, giải thích Việt – Anh, lỗi sai kinh điển và 5 dạng bài tập (Cấu trúc câu, Điền từ, Chọn đáp án, Sắp xếp câu, Sửa lỗi ngữ pháp).</p>
          </div>
        </div>

        <div class="card" style="padding:14px 16px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;flex:1;">
            <select class="select-field" id="gr-filter-level" style="width:auto;min-width:170px;">
              <option value="all" ${grLevelFilter === "all" ? "selected" : ""}>Tất cả cấp độ (${list.length} chuyên đề)</option>
              ${[1, 2, 3, 4, 5, 6].map((lv) => `<option value="${lv}" ${String(grLevelFilter) === String(lv) ? "selected" : ""}>HSK ${lv}</option>`).join("")}
            </select>
            <input class="input-field" id="gr-search-inp" value="${QCore.escapeHtml(grSearchQuery)}" placeholder="🔍 Tìm cấu trúc ngữ pháp (vd: 是, 把, 被, 虽然, 得...)" style="max-width:340px;">
          </div>
          <div style="font-size:13px;font-weight:700;color:var(--primary);">
            ✅ Đã hoàn thành: ${(st.grammarCompleted || []).length} / ${list.length} chuyên đề
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px;">
          ${filtered.map((g) => {
            const isDone = st.grammarCompleted.includes(g.id) || (extProg.completedIds || []).includes(g.id);
            const best = (extProg.scoresById && extProg.scoresById[g.id]) || (isDone ? 95 : null);
            return `
              <div class="card" data-open-gr-card="${QCore.escapeHtml(g.id)}" style="padding:20px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:14px;border-color:${isDone ? "var(--primary)" : "var(--border-color)"};">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px;">
                    <div style="display:flex;gap:6px;align-items:center;">
                      ${renderHskBadge(g.hsk_level)}
                      <span class="badge badge-amber">${QCore.escapeHtml(g.topic || "Ngữ pháp HSK")}</span>
                    </div>
                    ${isDone ? `<span style="font-size:12px;font-weight:700;color:var(--primary);">✅ Đã học (${best}%)</span>` : `<span style="font-size:12px;color:var(--text-muted);">5 dạng bài tập</span>`}
                  </div>
                  <h3 style="margin:0 0 8px;font-size:17px;line-height:1.4;">${QCore.escapeHtml(g.title)}</h3>
                  <div class="card-subtle" style="padding:8px 10px;font-size:12.5px;font-weight:700;color:var(--primary);margin-bottom:8px;">
                    📐 ${QCore.escapeHtml(g.formula)}
                  </div>
                  <p style="margin:0;font-size:13px;color:var(--text-secondary);line-height:1.5;">${QCore.escapeHtml((g.explainVi || "").slice(0, 115))}...</p>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--border-color);font-size:12.5px;">
                  <span style="color:var(--text-muted);">5 bài tập • 📦 Thư viện mở rộng</span>
                  <strong style="color:var(--primary);">Mở chuyên đề →</strong>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      container.querySelector("#gr-filter-level").onchange = (e) => { grLevelFilter = e.target.value; renderGrammar(container); };
      const sInp = container.querySelector("#gr-search-inp");
      sInp.oninput = (e) => { grSearchQuery = e.target.value; renderGrammar(container); };
      container.querySelectorAll("[data-open-gr-card]").forEach((card) => {
        card.onclick = () => {
          activeGrammarId = card.getAttribute("data-open-gr-card");
          grammarReorderDraft = [];
          grViewMode = "session";
          renderGrammar(container);
        };
      });
      return;
    }

    const lesson = list.find((g) => g.id === activeGrammarId) || list[0];
    const isDone = st.grammarCompleted.includes(lesson.id);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <button class="btn btn-outline btn-sm" id="gr-back-lib" style="margin-bottom:8px;">← Quay lại Thư viện Ngữ pháp (${list.length} chuyên đề)</button>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
            ${renderHskBadge(lesson.hsk_level)}
            <span class="badge badge-amber">${QCore.escapeHtml(lesson.topic || "Ngữ pháp trọng tâm")}</span>
            <span class="badge badge-blue">📦 Nguồn: QChinese Open Grammar Library (CC BY-SA 4.0)</span>
            ${isDone ? `<span class="badge badge-jade">✓ Đã hoàn thành</span>` : ""}
          </div>
          <h2 style="margin:0;">🧩 ${QCore.escapeHtml(lesson.title)}</h2>
        </div>
        <button class="btn btn-outline btn-sm" id="gr-save-nb">📒 Lưu cấu trúc vào Sổ tay</button>
      </div>

      <div class="grid-2" style="align-items:start;">
        <!-- LEFT: Theory, Formula & Examples -->
        <div class="card">
          <div class="card-subtle" style="border-left:4px solid var(--primary);font-weight:700;font-size:15.5px;margin-bottom:14px;">
            📐 Công thức: ${QCore.escapeHtml(lesson.formula)}
          </div>

          <div style="margin-bottom:12px;">
            <strong>🇻🇳 Giải thích tiếng Việt:</strong>
            <p style="margin:4px 0 0;font-size:14px;line-height:1.6;">${QCore.escapeHtml(lesson.explainVi)}</p>
          </div>
          <div style="margin-bottom:14px;">
            <strong>🇬🇧 English Explanation:</strong>
            <p style="margin:4px 0 0;font-size:13.5px;color:var(--text-secondary);line-height:1.55;">${QCore.escapeHtml(lesson.explainEn)}</p>
          </div>

          <div class="vi-hint-banner" style="margin-bottom:16px;">
            <span>⚠️</span>
            <div><strong>Lỗi thường gặp cần tránh:</strong> ${QCore.escapeHtml(lesson.commonMistakes)}</div>
          </div>

          <h4 style="margin:0 0 8px;">💬 Ví dụ minh họa ba ngôn ngữ</h4>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${lesson.examples.map((ex) => `
              <div class="card-subtle" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                <div>
                  <div class="hanzi-text" style="font-size:18px;font-weight:700;">${QCore.escapeHtml(ex.chinese)}</div>
                  <div class="pinyin-text" style="font-size:13.5px;color:var(--primary);font-weight:600;">${QCore.escapeHtml(ex.pinyin)}</div>
                  <div style="font-size:13px;color:var(--text-secondary);">🇬🇧 ${QCore.escapeHtml(ex.english)} · 🇻🇳 <strong>${QCore.escapeHtml(ex.vietnamese)}</strong></div>
                </div>
                <button class="btn btn-soft btn-sm" data-speak="${QCore.escapeHtml(ex.chinese)}">🔊</button>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- RIGHT: 5 Interactive Grammar Exercise Types + AI Sentence Check -->
        <div class="card">
          <h3 style="margin:0 0 14px;">✍️ Thực hành 5 dạng bài tập Ngữ pháp</h3>

          ${lesson.exercises.structureMatch ? `
            <div class="card-subtle" style="margin-bottom:12px;">
              <strong>1. Bài tập cấu trúc câu:</strong>
              <p style="margin:6px 0 8px;font-size:13.5px;">${QCore.escapeHtml(lesson.exercises.structureMatch.question)}</p>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${lesson.exercises.structureMatch.options.map((o) => `
                  <button class="btn btn-outline btn-sm" style="justify-content:flex-start;text-align:left;" data-gr-struct="${QCore.escapeHtml(o)}">${QCore.escapeHtml(o)}</button>
                `).join("")}
              </div>
              <div id="gr-struct-msg" style="margin-top:6px;font-size:13px;"></div>
            </div>
          ` : ""}

          <div class="card-subtle" style="margin-bottom:12px;">
            <strong>2. Điền từ phù hợp vào chỗ trống:</strong>
            <div class="hanzi-text" style="font-size:18px;margin:6px 0;">${QCore.escapeHtml(lesson.exercises.fillBlank.sentence)}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${lesson.exercises.fillBlank.options.map((o) => `<button class="btn btn-outline btn-sm hanzi-text" data-gr-fb="${QCore.escapeHtml(o)}">${QCore.escapeHtml(o)}</button>`).join("")}
            </div>
            <div id="gr-fb-msg" style="margin-top:6px;font-size:13px;"></div>
          </div>

          <div class="card-subtle" style="margin-bottom:12px;">
            <strong>3. Chọn đáp án đúng ngữ pháp:</strong>
            <p style="margin:6px 0 8px;font-size:13.5px;">${QCore.escapeHtml(lesson.exercises.multipleChoice.question)}</p>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${lesson.exercises.multipleChoice.options.map((o) => `<button class="btn btn-outline btn-sm hanzi-text" style="justify-content:flex-start;" data-gr-mcq="${QCore.escapeHtml(o)}">${QCore.escapeHtml(o)}</button>`).join("")}
            </div>
            <div id="gr-mcq-msg" style="margin-top:6px;font-size:13px;"></div>
          </div>

          <div class="card-subtle" style="margin-bottom:12px;">
            <strong>4. Sắp xếp các từ thành câu hoàn chỉnh:</strong>
            <div class="hanzi-text" style="min-height:34px;font-size:18px;font-weight:700;color:var(--primary);margin:6px 0;">
              ${QCore.escapeHtml(grammarReorderDraft.join("")) || "Bấm chọn từng từ bên dưới..."}
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${lesson.exercises.reorder.words.map((w) => `<button class="btn btn-outline btn-sm hanzi-text" data-gr-word="${QCore.escapeHtml(w)}">${QCore.escapeHtml(w)}</button>`).join("")}
              <button class="btn btn-danger btn-sm" id="gr-ord-clear">Xóa</button>
              <button class="btn btn-primary btn-sm" id="gr-ord-check">Kiểm tra</button>
            </div>
            <div id="gr-ord-msg" style="margin-top:6px;font-size:13px;"></div>
          </div>

          ${lesson.exercises.errorCorrection ? `
            <div class="card-subtle" style="margin-bottom:12px;">
              <strong>5. Sửa lỗi ngữ pháp:</strong>
              <div style="margin:6px 0;font-size:13.5px;color:var(--accent-red);">❌ Câu sai: <span class="hanzi-text" style="text-decoration:line-through;font-weight:700;">${QCore.escapeHtml(lesson.exercises.errorCorrection.wrongSentence)}</span></div>
              <div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:6px;">Chọn cách sửa đúng ngữ pháp bên dưới:</div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${lesson.exercises.errorCorrection.options.map((o) => `
                  <button class="btn btn-outline btn-sm hanzi-text" style="justify-content:flex-start;" data-gr-err="${QCore.escapeHtml(o)}">${QCore.escapeHtml(o)}</button>
                `).join("")}
              </div>
              <div id="gr-err-msg" style="margin-top:6px;font-size:13px;"></div>
            </div>
          ` : ""}

          <div class="card-subtle">
            <strong>6. Tự đặt câu & nhận giải thích từ AI Giáo viên:</strong>
            <p style="margin:4px 0 8px;font-size:13px;color:var(--text-secondary);">${QCore.escapeHtml(lesson.exercises.freeWritePrompt)}</p>
            <textarea class="textarea-field hanzi-text" id="gr-free-inp" rows="2" data-pinyin-ime="true" placeholder="Gõ Pinyin hoặc chữ Hán Giản thể..."></textarea>
            <div style="margin-top:8px;">
              <button class="btn btn-primary btn-sm" id="gr-free-btn">👩‍🏫 Chấm câu & Hoàn thành chuyên đề</button>
            </div>
            <div id="gr-free-msg" style="margin-top:8px;font-size:13px;"></div>
          </div>
        </div>
      </div>
    `;

    if (window.QPinyinIME) QPinyinIME.attachAll(container);
    container.querySelector("#gr-back-lib").onclick = () => { grViewMode = "library"; renderGrammar(container); };
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

    container.querySelectorAll("[data-gr-struct]").forEach((b) => {
      b.onclick = () => {
        const ok = b.getAttribute("data-gr-struct") === lesson.exercises.structureMatch.answer;
        QCore.recordExternalExercise("grammar", lesson.id, ok ? 92 : 60, { step: "structureMatch" });
        container.querySelector("#gr-struct-msg").innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ Chính xác! ${QCore.escapeHtml(lesson.exercises.structureMatch.explain)}</span>`
          : `<span style="color:var(--accent-red);">❌ Chưa đúng. ${QCore.escapeHtml(lesson.exercises.structureMatch.explain)}</span>`;
      };
    });

    container.querySelectorAll("[data-gr-fb]").forEach((b) => {
      b.onclick = () => {
        const ok = b.getAttribute("data-gr-fb") === lesson.exercises.fillBlank.answer;
        QCore.recordExternalExercise("grammar", lesson.id, ok ? 92 : 60, { step: "fillBlank" });
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
      QCore.recordExternalExercise("grammar", lesson.id, ok ? 95 : 60, { step: "reorder" });
      container.querySelector("#gr-ord-msg").innerHTML = ok
        ? `<span style="color:var(--primary);font-weight:700;">✅ Chính xác! ${QCore.escapeHtml(ex.answer)} (${QCore.escapeHtml(ex.pinyin)})</span>`
        : `<span style="color:var(--accent-red);">Đáp án chuẩn: <strong>${QCore.escapeHtml(ex.answer)}</strong> — ${QCore.escapeHtml(ex.explain)}</span>`;
    };

    container.querySelectorAll("[data-gr-mcq]").forEach((b) => {
      b.onclick = () => {
        const ok = b.getAttribute("data-gr-mcq") === lesson.exercises.multipleChoice.answer;
        QCore.recordExternalExercise("grammar", lesson.id, ok ? 95 : 58, { step: "mcq" });
        container.querySelector("#gr-mcq-msg").innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ Hoàn toàn chính xác! ${QCore.escapeHtml(lesson.exercises.multipleChoice.explain)}</span>`
          : `<span style="color:var(--accent-red);">❌ Chưa đúng. ${QCore.escapeHtml(lesson.exercises.multipleChoice.explain)}</span>`;
      };
    });

    container.querySelectorAll("[data-gr-err]").forEach((b) => {
      b.onclick = () => {
        const ok = b.getAttribute("data-gr-err") === lesson.exercises.errorCorrection.answer;
        QCore.recordExternalExercise("grammar", lesson.id, ok ? 96 : 62, { step: "errorCorrection" });
        if (ok && !st.grammarCompleted.includes(lesson.id)) {
          st.grammarCompleted.push(lesson.id);
          QCore.logDailyActivity("grammarCount", 1);
          QCore.saveState(true);
        }
        container.querySelector("#gr-err-msg").innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ Sửa lỗi chính xác! ${QCore.escapeHtml(lesson.exercises.errorCorrection.explain)}</span>`
          : `<span style="color:var(--accent-red);">❌ Chưa đúng. Câu đúng là: <strong>${QCore.escapeHtml(lesson.exercises.errorCorrection.answer)}</strong> — ${QCore.escapeHtml(lesson.exercises.errorCorrection.explain)}</span>`;
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
        QCore.recordExternalExercise("grammar", lesson.id, res.score || 90, { step: "freeWrite" });
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

  /* ==================== 6.4. EXTERNAL SPEAKING STUDIO ==================== */
  let spkMode = "dialogue"; // "dialogue" | "qa" | "simulation" | "reflex"
  let spkTopic = "greeting";
  let spkShowPinyin = true;
  let spkShowTrans = true;
  let activeSpkMatId = null;

  const SPEAKING_TOPICS = {
    greeting: {
      title: "Chào hỏi & Giới thiệu bản thân",
      hsk: 1,
      modeLabel: "Luyện hội thoại",
      opening: {
        chinese: "你好！很高兴认识你。请问你叫什么名字？你是哪国人？",
        pinyin: "Nǐ hǎo! Hěn gāoxìng rènshi nǐ. Qǐngwèn nǐ jiào shénme míngzi? Nǐ shì nǎ guó rén?",
        english: "Hello! Nice to meet you. What is your name and nationality?",
        vietnamese: "Xin chào! Rất vui được làm quen với bạn. Bạn tên là gì và là người nước nào?"
      },
      suggestions: [
        { chinese: "你好！我叫明安，我是越南人。", pinyin: "Nǐ hǎo! Wǒ jiào Míng'ān, wǒ shì Yuènán rén.", vietnamese: "Xin chào! Mình tên là Minh An, là người Việt Nam." },
        { chinese: "我是大学生，我每天学习中文。", pinyin: "Wǒ shì dàxuéshēng, wǒ měitiān xuéxí Zhōngwén.", vietnamese: "Mình là sinh viên, ngày nào mình cũng học tiếng Trung." }
      ]
    },
    food: {
      title: "Gọi món tại nhà hàng & Quán trà",
      hsk: 1,
      modeLabel: "Mô phỏng tình huống",
      opening: {
        chinese: "欢迎光临！请问你想吃什么？想喝茶还是咖啡？",
        pinyin: "Huānyíng guānglín! Qǐngwèn nǐ xiǎng chī shénme? Xiǎng hē chá háishi kāfēi?",
        english: "Welcome! What would you like to eat? Would you like tea or coffee?",
        vietnamese: "Chào mừng quý khách! Bạn muốn ăn món gì? Muốn uống trà hay cà phê?"
      },
      suggestions: [
        { chinese: "我要一碗牛肉面和一杯热茶。", pinyin: "Wǒ yào yì wǎn niúròumiàn hé yì bēi rè chá.", vietnamese: "Cho tôi một bát mì bò và một cốc trà nóng." },
        { chinese: "请问一共多少钱？", pinyin: "Qǐngwèn yígòng duōshao qián?", vietnamese: "Xin hỏi tổng cộng bao nhiêu tiền?" }
      ]
    },
    shopping: {
      title: "Mua sắm & Hỏi giá cả",
      hsk: 2,
      modeLabel: "Mô phỏng tình huống",
      opening: {
        chinese: "你好！这件衣服很漂亮，你想买什么颜色的？",
        pinyin: "Nǐ hǎo! Zhè jiàn yīfu hěn piàoliang, nǐ xiǎng mǎi shénme yánsè de?",
        english: "Hello! This piece of clothing is very pretty; what color would you like to buy?",
        vietnamese: "Xin chào! Bộ quần áo này đẹp lắm, bạn muốn mua màu gì?"
      },
      suggestions: [
        { chinese: "这件衣服太贵了，可以便宜一点儿吗？", pinyin: "Zhè jiàn yīfu tài guì le, kěyǐ piányi yìdiǎnr ma?", vietnamese: "Chiếc áo này đắt quá, có thể rẻ hơn chút không?" }
      ]
    },
    travel: {
      title: "Du lịch, Hỏi đường & Đặt khách sạn",
      hsk: 3,
      modeLabel: "Luyện phản xạ giao tiếp",
      opening: {
        chinese: "假期快到了，你打算去中国哪个城市旅游？怎么去？",
        pinyin: "Jiàqī kuài dào le, nǐ dǎsuàn qù Zhōngguó nǎge chéngshì lǚyóu? Zěnme qù?",
        english: "The holiday is coming soon; which Chinese city do you plan to visit and how?",
        vietnamese: "Kỳ nghỉ sắp đến rồi, bạn dự định đi thành phố nào của Trung Quốc du lịch?"
      },
      suggestions: [
        { chinese: "我想坐飞机去北京看长城。", pinyin: "Wǒ xiǎng zuò fēijī qù Běijīng kàn Chángchéng.", vietnamese: "Mình muốn đi máy bay đến Bắc Kinh ngắm Trường Thành." }
      ]
    },
    school_work: {
      title: "Trả lời câu hỏi Trường học & Phỏng vấn công việc",
      hsk: 4,
      modeLabel: "Trả lời câu hỏi",
      opening: {
        chinese: "你平时怎么学习汉字？如果遇到难记的生词，你会怎么做？",
        pinyin: "Nǐ píngshí zěnme xuéxí Hànzì? Rúguǒ yùdào nán jì de shēngcí, nǐ huì zěnme zuò?",
        english: "How do you usually study Chinese characters? What do you do when encountering hard words?",
        vietnamese: "Thường ngày bạn học chữ Hán thế nào? Nếu gặp từ mới khó nhớ bạn sẽ làm gì?"
      },
      suggestions: [
        { chinese: "虽然汉字有点儿难，但是我每天都练习写句子。", pinyin: "Suīrán Hànzì yǒudiǎnr nán, dànshì wǒ měitiān dōu liànxí xiě jùzi.", vietnamese: "Tuy chữ Hán hơi khó nhưng ngày nào mình cũng luyện viết câu." }
      ]
    }
  };

  let chatHistory = [];
  let latestSuggestions = [];

  function initSpeakingSession() {
    const t = SPEAKING_TOPICS[spkTopic];
    chatHistory = [
      {
        role: "ai",
        chinese: t.opening.chinese,
        pinyin: t.opening.pinyin,
        english: t.opening.english,
        vietnamese: t.opening.vietnamese
      }
    ];
    latestSuggestions = t.suggestions;
  }

  function renderSpeaking(container, keepSession = false, params = {}) {
    const st = QCore.getState();
    if (params && params.materialId) {
      activeSpkMatId = params.materialId;
    } else if (params && params.materialId === null) {
      activeSpkMatId = null;
    }
    const customMat = activeSpkMatId ? (st.materials || []).find((m) => m.id === activeSpkMatId) : null;
    if (customMat) {
      renderMaterialSpeakingStudio(container, customMat);
      return;
    }

    if (!keepSession || chatHistory.length === 0) {
      initSpeakingSession();
    }

    const SPEAKING_MODES = [
      { id: "dialogue", label: "💬 Luyện hội thoại", desc: "Đối thoại tự nhiên nhiều lượt với Giáo viên AI" },
      { id: "qa", label: "❓ Trả lời câu hỏi", desc: "Luyện trả lời câu hỏi theo chủ đề HSK 1–6" },
      { id: "simulation", label: "🎭 Mô phỏng tình huống", desc: "Nhập vai nhà hàng, mua sắm, sân bay, khách sạn" },
      { id: "reflex", label: "⚡ Luyện phản xạ giao tiếp", desc: "Phản xạ nhanh câu nói tiếng Trung trong 5 giây" }
    ];

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
            <span class="badge badge-jade">🎙️ External Speaking Library</span>
            <span class="badge badge-blue">Độc lập hoàn toàn với AI PDF HSK 3.0</span>
          </div>
          <h2 style="margin:0;">🎙️ Speaking — Thư Viện Luyện Nói & Phản Xạ Giao Tiếp</h2>
          <p style="margin:4px 0 0;">4 chế độ thực hành: Luyện hội thoại, Trả lời câu hỏi, Mô phỏng tình huống và Phản xạ giao tiếp với nhận diện giọng nói & AI sửa lỗi.</p>
        </div>
        <div class="tabs-bar" style="flex-wrap:wrap;">
          ${SPEAKING_MODES.map((m) => `<button class="tab-pill ${spkMode === m.id ? "active" : ""}" data-spkmode="${m.id}">${m.label}</button>`).join("")}
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${Object.entries(SPEAKING_TOPICS).map(([key, val]) => `
            <button class="btn ${spkTopic === key ? "btn-primary" : "btn-outline"} btn-sm" data-spktopic="${key}">
              HSK ${val.hsk}: ${QCore.escapeHtml(val.title)}
            </button>
          `).join("")}
        </div>
        <div style="display:flex;gap:6px;">
          <button class="btn ${spkShowPinyin ? "btn-primary" : "btn-outline"} btn-sm" id="spk-tog-py">ā Pinyin</button>
          <button class="btn ${spkShowTrans ? "btn-primary" : "btn-outline"} btn-sm" id="spk-tog-tr">👁️ Bản dịch</button>
        </div>
      </div>

      <div class="card">
        <div class="chat-container">
          <div class="chat-messages" id="spk-chat-box">
            ${chatHistory.map((m) => `
              <div class="chat-bubble ${m.role}">
                ${m.role === "ai" && spkShowPinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--primary);font-weight:600;">${QCore.escapeHtml(m.pinyin || "")}</div>` : ""}
                <div class="hanzi-text" style="font-size:19px;font-weight:600;">
                  ${QCore.escapeHtml(m.chinese)}
                  <button class="btn btn-outline btn-sm" style="padding:2px 8px;margin-left:6px;font-size:12px;" data-speak-msg="${QCore.escapeHtml(m.chinese)}">🔊</button>
                </div>
                ${m.role === "ai" && spkShowTrans ? `<div style="font-size:13px;margin-top:4px;opacity:0.88;">🇻🇳 ${QCore.escapeHtml(m.vietnamese || "")}<br>🇬🇧 ${QCore.escapeHtml(m.english || "")}</div>` : ""}
                ${m.feedback ? `
                  <div style="margin-top:8px;padding:8px 10px;border-radius:8px;background:rgba(0,0,0,0.18);font-size:12.5px;">
                    <div><strong>👩‍🏫 Nhận xét câu nói của bạn:</strong> ${QCore.escapeHtml(m.feedback.comment)}</div>
                    <div>✨ Cách diễn đạt tự nhiên hơn: <strong>${QCore.escapeHtml(m.feedback.betterExpression)}</strong> (${QCore.escapeHtml(m.feedback.betterPinyin)})</div>
                  </div>
                ` : ""}
              </div>
            `).join("")}
          </div>

          <div style="margin:12px 0;">
            <small style="color:var(--text-muted);font-weight:600;display:block;margin-bottom:6px;">💡 Gợi ý câu trả lời mẫu (bấm để điền nhanh hoặc nghe mẫu):</small>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              ${latestSuggestions.map((s) => `
                <button class="btn btn-soft btn-sm" data-sug-zh="${QCore.escapeHtml(s.chinese)}" title="${QCore.escapeHtml(s.vietnamese)}">
                  <span class="hanzi-text">${QCore.escapeHtml(s.chinese)}</span>
                  <span style="font-size:11.5px;opacity:0.85;">(${QCore.escapeHtml(s.pinyin)})</span>
                </button>
              `).join("")}
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-outline" id="spk-mic-btn">🎙️ Nói bằng Micro</button>
            <input class="input-field hanzi-text" id="spk-user-inp" data-pinyin-ime="true" placeholder="Nói qua Micro hoặc gõ Pinyin/chữ Hán Giản thể để trả lời AI..." style="flex:1;min-width:220px;">
            <button class="btn btn-primary" id="spk-send-btn">Gửi câu trả lời ➤</button>
          </div>
        </div>
      </div>
    `;

    if (window.QPinyinIME) QPinyinIME.attachAll(container);
    const chatBox = container.querySelector("#spk-chat-box");
    chatBox.scrollTop = chatBox.scrollHeight;

    container.querySelectorAll("[data-spkmode]").forEach((b) => {
      b.onclick = () => {
        spkMode = b.getAttribute("data-spkmode");
        renderSpeaking(container, true);
      };
    });
    container.querySelectorAll("[data-spktopic]").forEach((b) => {
      b.onclick = () => {
        spkTopic = b.getAttribute("data-spktopic");
        renderSpeaking(container, false);
      };
    });

    container.querySelector("#spk-tog-py").onclick = () => { spkShowPinyin = !spkShowPinyin; renderSpeaking(container, true); };
    container.querySelector("#spk-tog-tr").onclick = () => { spkShowTrans = !spkShowTrans; renderSpeaking(container, true); };

    container.querySelectorAll("[data-speak-msg]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak-msg"));
    });

    const inp = container.querySelector("#spk-user-inp");
    container.querySelectorAll("[data-sug-zh]").forEach((b) => {
      b.onclick = () => {
        const zh = b.getAttribute("data-sug-zh");
        inp.value = zh;
        QCore.speakChinese(zh);
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
        const sc = res.feedback && res.feedback.isCorrect ? 92 : 76;
        QCore.recordExternalExercise("speaking", `spk_${spkTopic}`, sc, { mode: spkMode });
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

  /* ==================== 6.5. EXTERNAL READING LIBRARY (QEnglish-style Cards Grid & Split-Screen) ==================== */
  let rdViewMode = "library"; // "library" | "session"
  let rdLevelFilter = "all";
  let rdTopicFilter = "all";
  let rdSearchQuery = "";
  let activeReadId = "ext_rd_hsk1_cafe";
  let rdShowPinyin = true;
  let rdShowEn = true;
  let rdShowVi = false;
  let rdRightPaneMode = "questions"; // "questions" | "inspector"
  let selectedToken = null;
  let selectedSentIdx = 0;

  let activeReadMatId = null;
  let matRdShowGloss = true;
  let matRdSelectedWord = null;

  function getPassageCharCount(p) {
    const full = (p.sentences || []).map((s) => s.zh || "").join("");
    return full.replace(/[^\u4e00-\u9fff]/g, "").length || full.length || 80;
  }

  function getPassagePreviewText(p) {
    return (p.sentences || []).map((s) => s.zh || "").join(" ").slice(0, 95);
  }

  function renderReading(container, params = {}) {
    const st = QCore.getState();
    if (params && params.materialId) {
      activeReadMatId = params.materialId;
      matRdSelectedWord = null;
    } else if (params && params.materialId === null) {
      activeReadMatId = null;
    }
    if (params && params.passageId) {
      activeReadId = params.passageId;
      rdViewMode = "session";
    } else if (params && params.view === "library") {
      rdViewMode = "library";
    }

    const customMat = activeReadMatId ? (st.materials || []).find((m) => m.id === activeReadMatId) : null;
    if (customMat) {
      renderMaterialReadingStudio(container, customMat);
      return;
    }

    const passages = window.QCHINESE_READING || [];
    const extProg = (st.externalLibraryProgress && st.externalLibraryProgress.reading) || { completedIds: [], scoresById: {} };

    // VIEW 1: QEnglish-style Reading Academic Cards Grid (Matches Screenshot 2!)
    if (rdViewMode === "library") {
      const topics = Array.from(new Set(passages.map((p) => p.topic).filter(Boolean)));
      const q = rdSearchQuery.trim().toLowerCase();
      const filtered = passages.filter((p) => {
        if (rdLevelFilter !== "all" && String(p.hsk_level) !== String(rdLevelFilter)) return false;
        if (rdTopicFilter !== "all" && p.topic !== rdTopicFilter) return false;
        if (q) {
          const hay = `${p.title} ${p.topic} ${p.topicVi || ""} ${p.summary || ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      container.innerHTML = `
        <div class="page-header">
          <div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
              <span class="badge badge-jade">📰 External Reading Library</span>
              <span class="badge badge-blue">Độc lập hoàn toàn với AI PDF HSK 3.0</span>
            </div>
            <h2 style="margin:0;">Reading — Đọc hiểu học thuật & Đời sống (HSK 1 – HSK 6)</h2>
            <p style="margin:4px 0 0;">Thư viện bài đọc mở rộng đa chủ đề: Trường học, Đời sống, Văn hóa Trung Quốc, Công nghệ & AI, Công việc, Du lịch, Xã hội, Khoa học.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="rd-goto-my-materials">Bắt đầu đọc tài liệu của tôi →</button>
        </div>

        <!-- Filter & Search Bar -->
        <div class="card" style="padding:14px 16px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;flex:1;">
            <select class="select-field" id="rd-filter-level" style="width:auto;min-width:165px;">
              <option value="all" ${rdLevelFilter === "all" ? "selected" : ""}>Tất cả cấp độ (HSK 1–6)</option>
              ${[1, 2, 3, 4, 5, 6].map((lv) => `<option value="${lv}" ${String(rdLevelFilter) === String(lv) ? "selected" : ""}>HSK ${lv}</option>`).join("")}
            </select>
            <select class="select-field" id="rd-filter-topic" style="width:auto;min-width:190px;">
              <option value="all" ${rdTopicFilter === "all" ? "selected" : ""}>Tất cả chủ đề (${passages.length} bài)</option>
              ${topics.map((tp) => `<option value="${QCore.escapeHtml(tp)}" ${rdTopicFilter === tp ? "selected" : ""}>${QCore.escapeHtml(tp)}</option>`).join("")}
            </select>
            <input class="input-field" id="rd-search-inp" value="${QCore.escapeHtml(rdSearchQuery)}" placeholder="🔍 Tìm bài đọc theo tên, chủ đề..." style="max-width:280px;">
          </div>
          <div style="font-size:13px;font-weight:700;color:var(--primary);">
            ✅ Đã đọc: ${(st.readingCompleted || []).length} / ${passages.length} bài
          </div>
        </div>

        <!-- QEnglish-style 3-Column Reading Cards Grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:16px;">
          ${filtered.map((p) => {
            const isDone = st.readingCompleted.includes(p.id) || (extProg.completedIds || []).includes(p.id);
            const bestScore = (extProg.scoresById && extProg.scoresById[p.id]) || (isDone ? 100 : null);
            const charCount = getPassageCharCount(p);
            const preview = getPassagePreviewText(p);
            const qCount = (p.quiz || []).length;
            return `
              <div class="card" data-open-rd-card="${QCore.escapeHtml(p.id)}" style="padding:20px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:14px;border-color:${isDone ? "var(--primary)" : "var(--border-color)"};transition:transform .15s ease;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
                    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                      ${renderHskBadge(p.hsk_level)}
                      <span class="badge badge-amber">${QCore.escapeHtml(p.topic || "Academic")}</span>
                    </div>
                    ${isDone
                      ? `<span style="font-size:12px;font-weight:700;color:var(--primary);">✅ Đã đọc (${bestScore}%)</span>`
                      : `<span style="font-size:12px;color:var(--text-muted);">~${charCount} chữ</span>`}
                  </div>
                  <h3 style="margin:0 0 8px;font-size:17.5px;font-weight:800;line-height:1.38;">${QCore.escapeHtml(p.title)}</h3>
                  <p class="hanzi-text" style="margin:0 0 6px;font-size:13.5px;color:var(--text-secondary);line-height:1.6;">${QCore.escapeHtml(preview)}...</p>
                  <p style="margin:0;font-size:12px;color:var(--text-muted);line-height:1.45;">${QCore.escapeHtml(p.summary || "")}</p>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--border-color);font-size:12.5px;">
                  <span style="color:var(--text-muted);">${qCount} câu hỏi • 📦 Mặc định</span>
                  <strong style="color:var(--primary);">Mở bài đọc →</strong>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      container.querySelector("#rd-goto-my-materials").onclick = () => window.QApp.navigate("materials", { category: "reading" });
      container.querySelector("#rd-filter-level").onchange = (e) => { rdLevelFilter = e.target.value; renderReading(container); };
      container.querySelector("#rd-filter-topic").onchange = (e) => { rdTopicFilter = e.target.value; renderReading(container); };
      container.querySelector("#rd-search-inp").oninput = (e) => { rdSearchQuery = e.target.value; renderReading(container); };
      container.querySelectorAll("[data-open-rd-card]").forEach((card) => {
        card.onclick = () => {
          activeReadId = card.getAttribute("data-open-rd-card");
          selectedSentIdx = 0;
          selectedToken = null;
          rdViewMode = "session";
          renderReading(container);
        };
      });
      return;
    }

    // VIEW 2: Active Reading Split-Screen Workspace
    const passage = passages.find((p) => p.id === activeReadId) || passages[0];
    const sent = passage.sentences[selectedSentIdx] || passage.sentences[0];
    const tok = selectedToken || sent.tokens.find((t) => !t.punct) || sent.tokens[0];
    const noteKey = `${passage.id}_${selectedSentIdx}`;
    const vi = isViMode();
    const charCount = getPassageCharCount(passage);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <button class="btn btn-outline btn-sm" id="rd-back-library" style="margin-bottom:8px;">← Quay lại danh sách bài đọc (${passages.length} bài)</button>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
            ${renderHskBadge(passage.hsk_level)}
            <span class="badge badge-amber">${QCore.escapeHtml(passage.topic || "Reading")}</span>
            <span class="badge badge-blue">~${charCount} chữ · ${(passage.quiz || []).length} câu hỏi</span>
            <span class="badge badge-jade">📦 Nguồn: ${QCore.escapeHtml((passage.sourceAttribution && passage.sourceAttribution.name) || "QChinese Open Reading Corpus")} (${QCore.escapeHtml((passage.sourceAttribution && passage.sourceAttribution.license) || "CC BY-SA 4.0")})</span>
          </div>
          <h2 style="margin:0;">📰 ${QCore.escapeHtml(passage.title)}</h2>
          <p style="margin:4px 0 0;">${QCore.escapeHtml(passage.summary || "")}</p>
        </div>
      </div>

      <div class="grid-2" style="align-items:start;gap:16px;">
        <!-- LEFT PANE: Chinese Passage (Interactive Tokens + Line-aligned Pinyin / EN / VI) -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:12px;border-bottom:1px solid var(--border-color);margin-bottom:14px;">
            <strong style="font-size:15px;">📖 Nội dung bài đọc (Bấm vào từng từ để tra nghĩa & nghe âm)</strong>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn ${rdShowPinyin ? "btn-primary" : "btn-outline"} btn-sm" id="rd-tog-py">ā Pinyin</button>
              <button class="btn ${rdShowEn ? "btn-primary" : "btn-outline"} btn-sm" id="rd-tog-en">🇬🇧 English</button>
              <button class="btn ${rdShowVi ? "btn-primary" : "btn-outline"} btn-sm" id="rd-tog-vi">🇻🇳 Dịch Việt</button>
              <button class="btn btn-soft btn-sm" id="rd-play-passage">🔊 Nghe cả bài</button>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;">
            ${passage.sentences.map((s, sIdx) => `
              <div class="card-subtle" style="border-color:${selectedSentIdx === sIdx ? "var(--primary)" : "var(--border-color)"};">
                <div style="display:flex;flex-wrap:wrap;align-items:flex-end;">
                  ${s.tokens.map((t, tIdx) => {
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
                  }).join("")}
                  <button class="btn btn-outline btn-sm" style="margin-left:8px;padding:3px 8px;" data-speak-sent="${QCore.escapeHtml(s.zh)}" data-sel-sent="${sIdx}">🔊 Câu ${sIdx + 1}</button>
                </div>
                ${rdShowPinyin ? `<div class="pinyin-text" style="margin-top:6px;font-size:13.5px;color:var(--primary);">${QCore.escapeHtml(s.py)}</div>` : ""}
                ${rdShowEn ? `<div style="margin-top:6px;font-size:13.5px;color:var(--text-secondary);">🇬🇧 ${QCore.escapeHtml(s.en)}</div>` : ""}
                ${rdShowVi ? `<div style="margin-top:4px;font-size:13.5px;color:var(--text-main);">🇻🇳 <strong>Bản dịch tham khảo:</strong><br>${QCore.escapeHtml(s.vi)}</div>` : ""}
              </div>
            `).join("")}
          </div>
        </div>

        <!-- RIGHT PANE: Multi-Question Comprehension & Word Inspector -->
        <div class="card" style="position:sticky;top:76px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
            <div class="tabs-bar">
              <button class="tab-pill ${rdRightPaneMode === "questions" ? "active" : ""}" id="rd-tab-qs">📝 Câu hỏi Đọc hiểu (${(passage.quiz || []).length})</button>
              <button class="tab-pill ${rdRightPaneMode === "inspector" ? "active" : ""}" id="rd-tab-insp">🔍 Tra từ & Ghi chú</button>
            </div>
            <button class="btn btn-outline btn-sm" id="rd-q-lang">${vi ? "🌐 Switch to ZH–EN" : "🇻🇳 Đổi sang Trung–Việt"}</button>
          </div>

          ${rdRightPaneMode === "questions" ? `
            <div style="display:flex;flex-direction:column;gap:14px;">
              ${(passage.quiz || []).map((qz, qi) => {
                const qText = (!vi && qz.q_en) ? qz.q_en : qz.q;
                const opts = (!vi && Array.isArray(qz.options_en) && qz.options_en.length) ? qz.options_en : qz.options;
                return `
                  <div class="card-subtle" style="padding:14px;">
                    <div style="font-weight:700;font-size:14px;margin-bottom:10px;">${vi ? `Câu ${qi + 1}:` : `Question ${qi + 1}:`} ${QCore.escapeHtml(qText)}</div>
                    <div style="display:flex;flex-direction:column;gap:6px;">
                      ${opts.map((opt) => `
                        <label style="display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;cursor:pointer;background:var(--bg-surface);font-size:13.5px;">
                          <input type="radio" name="ext_rd_q_${qi}" value="${QCore.escapeHtml(opt)}" />
                          <span>${QCore.escapeHtml(opt)}</span>
                        </label>
                      `).join("")}
                    </div>
                    <div id="rd-q-fb-${qi}" style="margin-top:8px;font-size:13px;"></div>
                  </div>
                `;
              }).join("")}
            </div>
            <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-primary" id="rd-submit-quiz">✅ ${vi ? "Nộp bài & Xem giải thích" : "Submit & Check Answers"}</button>
              <button class="btn btn-outline btn-sm" id="rd-reset-quiz">🔄 ${vi ? "Làm lại" : "Reset"}</button>
            </div>
            <div id="rd-quiz-summary" style="margin-top:14px;"></div>
          ` : `
            <div>
              <span class="badge badge-blue" style="margin-bottom:8px;">🔍 Giải thích từ & Dịch câu đang chọn</span>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;">
                <div>
                  <div class="hanzi-calligraphy" style="font-size:44px;line-height:1.1;">${QCore.escapeHtml(tok.w)}</div>
                  <div class="pinyin-text" style="font-size:18px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(tok.py || "")}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;">
                  <button class="btn btn-primary btn-sm" id="rd-tok-speak">🔊 Nghe từ</button>
                  <button class="btn btn-outline btn-sm" id="rd-tok-stroke">✍️ Xem nét chữ</button>
                </div>
              </div>

              <div class="card-subtle" style="margin-bottom:12px;">
                <div>🇻🇳 <strong>Nghĩa tiếng Việt:</strong> ${QCore.escapeHtml(tok.vi || "Dấu câu")}</div>
                <div style="margin-top:4px;">🇬🇧 <strong>English Meaning:</strong> ${QCore.escapeHtml(tok.en || "")}</div>
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
          `}
        </div>
      </div>
    `;

    container.querySelector("#rd-back-library").onclick = () => { rdViewMode = "library"; renderReading(container); };
    container.querySelector("#rd-tog-py").onclick = () => { rdShowPinyin = !rdShowPinyin; renderReading(container); };
    container.querySelector("#rd-tog-en").onclick = () => { rdShowEn = !rdShowEn; renderReading(container); };
    container.querySelector("#rd-tog-vi").onclick = () => { rdShowVi = !rdShowVi; renderReading(container); };
    container.querySelector("#rd-tab-qs").onclick = () => { rdRightPaneMode = "questions"; renderReading(container); };
    container.querySelector("#rd-tab-insp").onclick = () => { rdRightPaneMode = "inspector"; renderReading(container); };
    container.querySelector("#rd-q-lang").onclick = () => {
      QCore.toggleUiLang();
      if (window.QApp && typeof QApp.refreshTopbar === "function") QApp.refreshTopbar();
      renderReading(container);
    };

    container.querySelector("#rd-play-passage").onclick = () => {
      const fullText = passage.sentences.map((s) => s.zh).join(" ");
      QCore.speakChinese(fullText);
    };

    container.querySelectorAll("[data-sidx]").forEach((el) => {
      el.onclick = () => {
        selectedSentIdx = Number(el.getAttribute("data-sidx"));
        const tIdx = Number(el.getAttribute("data-tidx"));
        selectedToken = passage.sentences[selectedSentIdx].tokens[tIdx];
        rdRightPaneMode = "inspector";
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

    if (rdRightPaneMode === "questions") {
      container.querySelector("#rd-reset-quiz").onclick = () => renderReading(container);
      container.querySelector("#rd-submit-quiz").onclick = () => {
        const qs = passage.quiz || [];
        let right = 0;
        qs.forEach((qz, qi) => {
          const checked = container.querySelector(`input[name="ext_rd_q_${qi}"]:checked`);
          const userVal = checked ? checked.value : "";
          const ansText = (!vi && qz.answer_en) ? qz.answer_en : qz.answer;
          const expText = (!vi && qz.explain_en) ? qz.explain_en : (qz.explain || "");
          const ok = userVal === ansText || userVal === qz.answer || userVal === qz.answer_en;
          if (ok) right++;
          const fb = container.querySelector(`#rd-q-fb-${qi}`);
          fb.innerHTML = ok
            ? `<div style="color:var(--primary);font-weight:700;">✅ ${vi ? "Chính xác!" : "Correct!"} ${QCore.escapeHtml(expText)}</div>`
            : `<div style="color:var(--accent-red);">❌ ${vi ? "Chưa đúng" : "Incorrect"} (${vi ? "Đáp án đúng" : "Correct answer"}: <strong>${QCore.escapeHtml(ansText)}</strong>)<br><span style="color:var(--text-secondary);">💡 ${QCore.escapeHtml(expText)}</span></div>`;
        });
        const score = qs.length ? Math.round((right / qs.length) * 100) : 100;
        QCore.recordExternalExercise("reading", passage.id, score, { right, total: qs.length });
        container.querySelector("#rd-quiz-summary").innerHTML = `
          <div class="card-subtle" style="border:2px solid ${score >= 70 ? "var(--primary)" : "var(--accent-amber)"};">
            <strong style="font-size:15.5px;">🎯 ${vi ? `Kết quả bài đọc: ${score}/100 điểm (${right}/${qs.length} câu đúng)` : `Reading Score: ${score}/100 (${right}/${qs.length} correct)`}</strong>
          </div>
        `;
      };
    } else {
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
    }
  }

  /* ==================== 6.6. EXTERNAL WRITING HUB (VIETNAMESE -> CHINESE TRANSLATION + WRITING STUDIO) ==================== */
  let wrHubMode = "translation"; // "translation" | "studio" | "hanzi"
  let transLevelFilter = "all";
  let transModeFilter = "all"; // "all" | "paragraph" | "sentence" | "weakness"
  let transSearchQuery = "";
  let activeTransId = "tr_hsk1_01";
  let showTransVocabHint = false;
  let lastTransEvaluation = null;

  let activeTaskIdx = 0;
  let activeWriteMatId = null;
  let lastAiGrade = null;

  function getTransState() {
    const st = QCore.getState();
    if (!st.externalLibraryProgress) st.externalLibraryProgress = {};
    if (!st.externalLibraryProgress.writing) st.externalLibraryProgress.writing = { completedIds: [], scoresById: {} };
    if (!st.externalLibraryProgress.writing.translation) {
      st.externalLibraryProgress.writing.translation = {
        drafts: {},
        completedIds: [],
        scores: {},
        history: [],
        weakFocuses: [],
        lastLessonId: "tr_hsk1_01"
      };
    }
    return st.externalLibraryProgress.writing.translation;
  }

  function evaluateTranslationSmartLocal(lesson, userZh, userPy = "") {
    const clean = (s) => String(s || "").replace(/[\s，。！？、；：“”‘’,.!?;:"'()（）]/g, "");
    const uClean = clean(userZh);
    const refClean = clean(lesson.referenceZh);
    const altCleans = (lesson.acceptedAlternatives || []).map(clean);

    // Check exact or alternative match
    const isExactOrAlt = uClean === refClean || altCleans.includes(uClean);

    // Check key vocabulary coverage
    const keyVocab = lesson.keyVocab || [];
    let matchedVocab = 0;
    const missingVocab = [];
    keyVocab.forEach((kv) => {
      const variants = String(kv.hanzi || "").split("/").map((x) => x.trim()).filter(Boolean);
      if (variants.some((v) => userZh.includes(v))) {
        matchedVocab++;
      } else {
        missingVocab.push(kv);
      }
    });

    // Analyze common Vietnamese -> Chinese translation errors
    const specificErrors = [];

    // 1. Measure word error check (Lượng từ)
    if (/二(个|本|杯|件|口|家|间|门)/.test(userZh)) {
      specificErrors.push({
        category: "Lỗi sử dụng lượng từ (量词)",
        wrongFragment: userZh.match(/二(个|本|杯|件|口|家|间|门)/)[0],
        whyWrong: "Khi đếm số lượng 2 đứng trước lượng từ, tiếng Trung bắt buộc dùng 两 (liǎng) chứ không dùng 二 (èr).",
        correction: userZh.replace(/二(个|本|杯|件|口|家|间|门)/g, "两$1")
      });
    }

    // 2. Copula 是 before adjective error
    if (/是(很|非常)?(好|忙|漂亮|贵|便宜|难|高兴|热情|好吃)/.test(userZh)) {
      const m = userZh.match(/是(很|非常)?(好|忙|漂亮|贵|便宜|难|高兴|热情|好吃)/)[0];
      specificErrors.push({
        category: "Lỗi cấu trúc câu & tính từ vị ngữ",
        wrongFragment: m,
        whyWrong: "Trong tiếng Trung, tính từ làm vị ngữ trực tiếp đi với phó từ 很 / 非常 mà KHÔNG dùng động từ hệ từ 是.",
        correction: m.replace(/^是/, "很").replace(/^很很/, "很")
      });
    }

    // 3. Particle negation error (没...了 or 不有)
    if (/不有/.test(userZh)) {
      specificErrors.push({
        category: "Lỗi phó từ phủ định",
        wrongFragment: "不有",
        whyWrong: "Động từ 有 (có) luôn phủ định bằng 没 → 没有, tuyệt đối không dùng *不有.",
        correction: "没有"
      });
    }
    if (/没[^。，！？]*了/.test(userZh)) {
      specificErrors.push({
        category: "Lỗi sử dụng trợ từ động thái 了",
        wrongFragment: userZh.match(/没[^。，！？]*了/)[0],
        whyWrong: "Khi đã dùng 没 để phủ định hành động trong quá khứ ('chưa/đã không làm'), phải lược bỏ trợ từ 了 ở cuối vế câu.",
        correction: "Bỏ trợ từ 了 ở cuối câu phủ định có 没"
      });
    }

    // 4. Time / Location adverbial order error (đặt thời gian hoặc địa điểm ở cuối câu theo thói quen tiếng Việt)
    if (/(到学校|去学校|学习中文|吃饭|看书)(在[^。，！？]+|早上[^。，！？]+|今天[^。，！？]+|晚上[^。，！？]+)/.test(userZh)) {
      const m = userZh.match(/(到学校|去学校|学习中文|吃饭|看书)(在[^。，！？]+|早上[^。，！？]+|今天[^。，！？]+|晚上[^。，！？]+)/)[0];
      specificErrors.push({
        category: "Lỗi trật tự từ: Thời gian & Trạng ngữ địa điểm",
        wrongFragment: m,
        whyWrong: "Khác với tiếng Việt đặt thời gian/địa điểm ở cuối câu, tiếng Trung BẮT BUỘC đặt Trạng ngữ Thời gian và Cụm địa điểm (在 + nơi chốn) TRƯỚC động từ chính!",
        correction: lesson.referenceZh
      });
    }

    // 5. Missing key vocabulary or incomplete meaning
    if (!isExactOrAlt && missingVocab.length > 0) {
      missingVocab.slice(0, 2).forEach((mv) => {
        specificErrors.push({
          category: "Từ vựng & Truyền tải ý nghĩa tiếng Việt",
          wrongFragment: `(Thiếu hoặc dùng từ khác cho nghĩa "${mv.vi}")`,
          whyWrong: `Để truyền tải sát nghĩa "${mv.vi}" ở cấp độ HSK ${lesson.hsk_level}, nên sử dụng từ/cụm từ chuẩn: ${mv.hanzi} (${mv.pinyin}).`,
          correction: `${mv.hanzi} (${mv.pinyin})`
        });
      });
    }

    // Calculate score out of 100 and 10
    const vocabRatio = keyVocab.length ? matchedVocab / keyVocab.length : 0.85;
    const lenRatio = Math.min(1.15, Math.max(0.3, uClean.length / Math.max(1, refClean.length)));
    let rawScore = isExactOrAlt
      ? 98
      : Math.round((vocabRatio * 65 + Math.min(1, lenRatio) * 35) - specificErrors.length * 6);
    rawScore = Math.max(45, Math.min(100, rawScore));
    const score10 = Number((rawScore / 10).toFixed(1));

    if (specificErrors.length === 0) {
      specificErrors.push({
        category: "Chính xác & Tự nhiên (Chấp nhận nhiều cách dịch)",
        wrongFragment: "Không phát hiện lỗi ngữ pháp hay trật tự từ",
        whyWrong: "Bản dịch của bạn đúng trật tự ngữ pháp tiếng Trung Giản thể (Chủ ngữ + Thời gian + Địa điểm + Động từ) và truyền tải đầy đủ ý nghĩa đoạn văn tiếng Việt.",
        correction: lesson.referenceZh
      });
    }

    return {
      score100: rawScore,
      score10,
      subScores: {
        grammar: Math.min(10, Number((score10 + 0.2).toFixed(1))),
        wordOrder: specificErrors.some((e) => e.category.includes("trật tự")) ? Math.max(5.5, Number((score10 - 1.2).toFixed(1))) : score10,
        vocabulary: Number((Math.min(1, vocabRatio + 0.15) * 10).toFixed(1)),
        naturalness: score10,
        meaningAccuracy: score10
      },
      userTranslation: userZh,
      userPinyin: userPy,
      referenceTranslation: lesson.referenceZh,
      referencePinyin: lesson.referencePinyin,
      acceptedAlternatives: lesson.acceptedAlternatives || [],
      vietnameseOriginal: lesson.viText,
      specificErrors,
      betterCorrection: isExactOrAlt ? userZh : lesson.referenceZh,
      newVocabulary: lesson.keyVocab || [],
      grammarToRemember: lesson.grammarNotes || [],
      sentenceBreakdown: lesson.sentenceBreakdown || []
    };
  }

  function renderTranslationEvaluationHTML(ev) {
    return `
      <div class="card" style="margin-top:18px;border:2px solid ${ev.score100 >= 80 ? "var(--primary)" : "var(--accent-amber)"};">
        <!-- 1. ĐIỂM SỐ & SUB-SCORES -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding-bottom:14px;border-bottom:1px solid var(--border-color);margin-bottom:16px;">
          <div>
            <span class="badge ${ev.score100 >= 80 ? "badge-jade" : "badge-amber"}" style="font-size:14px;padding:6px 12px;">
              🎯 1. Điểm số AI chấm: ${ev.score10} / 10 (${ev.score100} / 100)
            </span>
            <span style="font-size:12.5px;color:var(--text-secondary);margin-left:8px;">
              ✅ Chấp nhận nhiều cách dịch khác nhau nếu đúng ngữ pháp & giữ nguyên ý nghĩa
            </span>
          </div>
          <button class="btn btn-soft btn-sm" data-speak-tr="${QCore.escapeHtml(ev.referenceTranslation)}">🔊 Nghe bản dịch chuẩn</button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-bottom:16px;">
          <div class="card-subtle" style="padding:10px;text-align:center;">
            <div style="font-size:12px;color:var(--text-muted);">Ngữ pháp & Trợ từ</div>
            <strong style="font-size:18px;color:var(--primary);">${ev.subScores.grammar}/10</strong>
          </div>
          <div class="card-subtle" style="padding:10px;text-align:center;">
            <div style="font-size:12px;color:var(--text-muted);">Trật tự từ & Trạng ngữ</div>
            <strong style="font-size:18px;color:var(--primary);">${ev.subScores.wordOrder}/10</strong>
          </div>
          <div class="card-subtle" style="padding:10px;text-align:center;">
            <div style="font-size:12px;color:var(--text-muted);">Từ vựng & Lượng từ</div>
            <strong style="font-size:18px;color:var(--primary);">${ev.subScores.vocabulary}/10</strong>
          </div>
          <div class="card-subtle" style="padding:10px;text-align:center;">
            <div style="font-size:12px;color:var(--text-muted);">Độ tự nhiên & Ý nghĩa</div>
            <strong style="font-size:18px;color:var(--primary);">${ev.subScores.naturalness}/10</strong>
          </div>
        </div>

        <!-- 2. BẢN DỊCH THAM KHẢO & 3. BÀI LÀM CỦA TÔI & 7. PINYIN & 8. NGHĨA TIẾNG VIỆT -->
        <div class="grid-2" style="gap:14px;margin-bottom:16px;">
          <div class="card-subtle" style="border-left:4px solid #3b82f6;">
            <div style="font-size:12.5px;font-weight:800;color:#3b82f6;margin-bottom:6px;">3. BÀI LÀM CỦA TÔI:</div>
            <div class="hanzi-text" style="font-size:19px;font-weight:700;line-height:1.75;">${QCore.escapeHtml(ev.userTranslation)}</div>
            ${ev.userPinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--text-secondary);margin-top:4px;">Pinyin bạn nhập: ${QCore.escapeHtml(ev.userPinyin)}</div>` : ""}
            <hr style="border:none;border-top:1px dashed var(--border-color);margin:10px 0;">
            <div style="font-size:12.5px;font-weight:800;color:var(--text-muted);margin-bottom:4px;">8. NGHĨA TIẾNG VIỆT GỐC:</div>
            <div style="font-size:13.5px;color:var(--text-secondary);line-height:1.6;">${QCore.escapeHtml(ev.vietnameseOriginal)}</div>
          </div>

          <div class="card-subtle" style="border-left:4px solid var(--primary);">
            <div style="font-size:12.5px;font-weight:800;color:var(--primary);margin-bottom:6px;">2. BẢN DỊCH THAM KHẢO & 6. CÁCH SỬA CHÍNH XÁC HƠN:</div>
            <div class="hanzi-text" style="font-size:20px;font-weight:700;color:var(--primary);line-height:1.75;">${QCore.escapeHtml(ev.referenceTranslation)}</div>
            <div style="font-size:12.5px;font-weight:800;color:var(--text-muted);margin-top:8px;">7. PINYIN CHUẨN:</div>
            <div class="pinyin-text" style="font-size:14px;color:var(--primary);line-height:1.7;margin-top:2px;">${QCore.escapeHtml(ev.referencePinyin)}</div>
            ${(ev.acceptedAlternatives || []).length ? `
              <div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border-color);font-size:12.5px;color:var(--text-secondary);">
                <strong>Các cách diễn đạt khác cũng được chấp nhận:</strong>
                ${ev.acceptedAlternatives.map((alt) => `<div class="hanzi-text" style="margin-top:3px;">• ${QCore.escapeHtml(alt)}</div>`).join("")}
              </div>
            ` : ""}
          </div>
        </div>

        <!-- 4. NHỮNG LỖI SAI CỤ THỂ & 5. GIẢI THÍCH VÌ SAO SAI & 6. CÁCH SỬA -->
        <div style="margin-bottom:16px;">
          <h4 style="margin:0 0 10px;font-size:15px;">🔍 4. Những lỗi sai cụ thể · 5. Giải thích vì sao sai · 6. Cách sửa chính xác hơn</h4>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${(ev.specificErrors || []).map((err) => `
              <div class="card-subtle" style="padding:12px;border-left:4px solid ${err.category.includes("Chính xác") ? "var(--primary)" : "var(--accent-amber)"};">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
                  <span class="badge ${err.category.includes("Chính xác") ? "badge-jade" : "badge-amber"}">${QCore.escapeHtml(err.category)}</span>
                  <span class="hanzi-text" style="font-size:13.5px;font-weight:700;color:var(--accent-red);">${QCore.escapeHtml(err.wrongFragment)}</span>
                </div>
                <div style="font-size:13.5px;line-height:1.6;margin-bottom:6px;">
                  <strong>Vì sao sai / Phân tích:</strong> ${QCore.escapeHtml(err.whyWrong)}
                </div>
                <div style="font-size:13.5px;color:var(--primary);font-weight:700;">
                  ✅ Cách sửa chính xác hơn: <span class="hanzi-text">${QCore.escapeHtml(err.correction)}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- 9. TỪ VỰNG MỚI & 10. NGỮ PHÁP CẦN GHI NHỚ -->
        <div class="grid-2" style="gap:14px;">
          <div class="card-subtle">
            <h4 style="margin:0 0 10px;font-size:14.5px;">📚 9. Từ vựng mới cần nắm trong đoạn dịch</h4>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${(ev.newVocabulary || []).map((w) => `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;background:var(--bg-surface);border:1px solid var(--border-color);">
                  <div>
                    <strong class="hanzi-text" style="font-size:16.5px;">${QCore.escapeHtml(w.hanzi)}</strong>
                    <span class="pinyin-text" style="font-size:13px;color:var(--primary);font-weight:600;margin-left:6px;">${QCore.escapeHtml(w.pinyin)}</span>
                    <div style="font-size:12.5px;color:var(--text-secondary);">🇻🇳 ${QCore.escapeHtml(w.vi)} ${w.en ? `· 🇬🇧 ${QCore.escapeHtml(w.en)}` : ""}</div>
                  </div>
                  <div style="display:flex;gap:4px;">
                    <button class="btn btn-outline btn-sm" data-speak-tr="${QCore.escapeHtml(w.hanzi.split("/")[0].trim())}">🔊</button>
                    <button class="btn btn-outline btn-sm" data-save-tr-vocab="${QCore.escapeHtml(w.hanzi)}" data-py="${QCore.escapeHtml(w.pinyin)}" data-vi="${QCore.escapeHtml(w.vi)}" data-en="${QCore.escapeHtml(w.en || "")}">📒</button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="card-subtle">
            <h4 style="margin:0 0 10px;font-size:14.5px;">📐 10. Ngữ pháp cần ghi nhớ</h4>
            <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;font-size:13.5px;line-height:1.6;">
              ${(ev.grammarToRemember || []).map((gn) => `<li>${QCore.escapeHtml(gn)}</li>`).join("")}
            </ul>
            ${(ev.sentenceBreakdown || []).length ? `
              <hr style="border:none;border-top:1px solid var(--border-color);margin:12px 0;">
              <strong style="font-size:13px;display:block;margin-bottom:6px;">📖 Phân tích dịch từng câu:</strong>
              <div style="display:flex;flex-direction:column;gap:8px;">
                ${ev.sentenceBreakdown.map((sb, idx) => `
                  <div style="padding:8px 10px;border-radius:8px;background:var(--bg-surface);font-size:12.5px;">
                    <div style="color:var(--text-secondary);">Câu ${idx + 1}: ${QCore.escapeHtml(sb.vi)}</div>
                    <div class="hanzi-text" style="font-size:15px;font-weight:700;color:var(--primary);margin-top:2px;">→ ${QCore.escapeHtml(sb.zh)}</div>
                    <div class="pinyin-text" style="font-size:12px;color:var(--text-muted);">${QCore.escapeHtml(sb.py)}</div>
                  </div>
                `).join("")}
              </div>
            ` : ""}
          </div>
        </div>
      </div>
    `;
  }

  function renderWriting(container, params = {}) {
    const st = QCore.getState();
    if (params && params.materialId) {
      activeWriteMatId = params.materialId;
      lastAiGrade = null;
    } else if (params && params.materialId === null) {
      activeWriteMatId = null;
    }
    if (params && params.hubMode) {
      wrHubMode = params.hubMode;
    }

    const customMat = activeWriteMatId ? (st.materials || []).find((m) => m.id === activeWriteMatId) : null;
    if (customMat) {
      renderMaterialWritingStudio(container, customMat);
      return;
    }

    const transLessons = window.QCHINESE_TRANSLATION_LESSONS || [];
    const tState = getTransState();

    // Top Switcher Bar (Matches QEnglish Screenshot 3 & 4!)
    const topHubBar = `
      <div class="card" style="padding:12px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
        <div class="tabs-bar" style="flex-wrap:wrap;">
          <button class="tab-pill ${wrHubMode === "translation" ? "active" : ""}" data-wrhub="translation">🔄 Luyện Dịch Việt – Trung (${transLessons.length} Bài HSK 1–6)</button>
          <button class="tab-pill ${wrHubMode === "studio" ? "active" : ""}" data-wrhub="studio">✍️ Writing Studio (Đoạn văn / Tự nộp bài)</button>
          <button class="tab-pill ${wrHubMode === "hanzi" ? "active" : ""}" data-wrhub="hanzi">🖌️ Viết chữ Hán theo nét</button>
        </div>
        <div style="font-size:12.5px;color:var(--text-muted);font-weight:600;">
          ${wrHubMode === "translation"
            ? "Lộ trình HSK 1–6 • Chia đôi màn hình • Tự động lưu nháp • AI chấm 10 tiêu chí"
            : "Writing Studio • Chấm bài tự do & Đoạn văn theo chủ đề HSK"}
        </div>
      </div>
    `;

    // MODE 1: VIETNAMESE -> CHINESE PARAGRAPH & SENTENCE TRANSLATION (QEnglish style!)
    if (wrHubMode === "translation") {
      const q = transSearchQuery.trim().toLowerCase();
      const filtered = transLessons.filter((l) => {
        if (transLevelFilter !== "all" && String(l.hsk_level) !== String(transLevelFilter)) return false;
        if (transModeFilter === "paragraph" && l.mode !== "paragraph") return false;
        if (transModeFilter === "sentence" && l.mode !== "sentence") return false;
        if (transModeFilter === "weakness") {
          const s = tState.scores && tState.scores[l.id];
          if (s == null || s >= 85) return false;
        }
        if (q) {
          const hay = `${l.num} ${l.title} ${l.topic} ${l.grammarFocus} ${l.viText}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      const activeList = filtered.length > 0 ? filtered : transLessons;
      let lesson = activeList.find((l) => l.id === activeTransId) || activeList[0];
      if (lesson) activeTransId = lesson.id;
      const curIdx = activeList.findIndex((l) => l.id === lesson.id);

      const completedCount = (tState.completedIds || []).length;
      const pct = transLessons.length ? Math.round((completedCount / transLessons.length) * 100) : 0;
      const scoreVals = Object.values(tState.scores || {}).map(Number).filter((n) => n > 0);
      const avg10 = scoreVals.length ? (scoreVals.reduce((a, b) => a + b, 0) / scoreVals.length / 10).toFixed(1) : "—";
      const savedDraft = (tState.drafts && tState.drafts[lesson.id]) || "";
      const bestLessonScore10 = tState.scores && tState.scores[lesson.id] ? (tState.scores[lesson.id] / 10).toFixed(1) : null;

      const viWords = lesson.viText.trim().split(/\s+/).length;
      const viSents = lesson.viText.split(/[.!?。！？]+/).filter((x) => x.trim()).length;
      const zhChars = savedDraft.replace(/\s+/g, "").length;
      const zhSents = savedDraft ? savedDraft.split(/[。！？.!?]+/).filter((x) => x.trim()).length : 0;

      container.innerHTML = `
        ${topHubBar}

        <!-- Progress & Navigation Header Card -->
        <div class="card" style="padding:14px 16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span class="badge badge-jade">${completedCount} / ${transLessons.length} bài đã hoàn thành (${pct}%)</span>
              <span class="badge badge-blue">TB AI: ${avg10} / 10</span>
              <span class="badge badge-amber">Vietnamese → Chinese Writing Practice</span>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" id="tr-prev-btn" ${curIdx <= 0 ? "disabled" : ""}>← Bài trước</button>
              <button class="btn btn-primary btn-sm" id="tr-next-btn" ${curIdx >= activeList.length - 1 ? "disabled" : ""}>Bài tiếp theo →</button>
            </div>
          </div>

          <!-- Filter Row -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
            <select class="select-field" id="tr-filter-level">
              <option value="all" ${transLevelFilter === "all" ? "selected" : ""}>Tất cả cấp độ (${transLessons.length} bài HSK 1–6)</option>
              ${[1, 2, 3, 4, 5, 6].map((lv) => `<option value="${lv}" ${String(transLevelFilter) === String(lv) ? "selected" : ""}>Cấp độ HSK ${lv}</option>`).join("")}
            </select>

            <select class="select-field" id="tr-filter-mode">
              <option value="all" ${transModeFilter === "all" ? "selected" : ""}>Tất cả chế độ luyện dịch</option>
              <option value="paragraph" ${transModeFilter === "paragraph" ? "selected" : ""}>📄 Dịch đoạn văn</option>
              <option value="sentence" ${transModeFilter === "sentence" ? "selected" : ""}>📝 Dịch câu ngắn</option>
              <option value="weakness" ${transModeFilter === "weakness" ? "selected" : ""}>🎯 Luyện dịch theo lỗi sai trước đó (< 8.5đ)</option>
            </select>

            <input class="input-field" id="tr-search-inp" value="${QCore.escapeHtml(transSearchQuery)}" placeholder="🔍 Tìm bài theo số, tiêu đề hoặc trọng tâm ngữ pháp...">

            <select class="select-field" id="tr-pick-lesson">
              ${activeList.map((l) => {
                const done = (tState.completedIds || []).includes(l.id);
                const sc = tState.scores && tState.scores[l.id] ? ` (${(tState.scores[l.id] / 10).toFixed(1)}/10)` : "";
                return `<option value="${QCore.escapeHtml(l.id)}" ${l.id === lesson.id ? "selected" : ""}>${done ? "✅ " : ""}Bài ${l.num} [HSK ${l.hsk_level}] — ${QCore.escapeHtml(l.title)}${sc}</option>`;
              }).join("")}
            </select>
          </div>
        </div>

        <!-- Active Translation Lesson Workspace Card -->
        <div class="card" style="padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:16px;">
            <div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;">
                <span class="badge badge-blue">Bài ${lesson.num} / ${transLessons.length}</span>
                ${renderHskBadge(lesson.hsk_level)}
                <span class="badge badge-amber">${QCore.escapeHtml(lesson.topic)}</span>
                <h3 style="margin:0;font-size:21px;">${QCore.escapeHtml(lesson.title)}</h3>
              </div>
              <div style="font-size:13px;color:var(--text-secondary);">
                <strong>Trọng tâm:</strong> <span style="color:var(--primary);font-weight:600;">${QCore.escapeHtml(lesson.grammarFocus)}</span>
              </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              ${bestLessonScore10 ? `<span class="badge badge-jade" style="font-size:13px;padding:6px 12px;">✅ Cao nhất: ${bestLessonScore10}/10</span>` : `<span class="badge badge-amber">Chưa nộp bài</span>`}
            </div>
          </div>

          <!-- SPLIT SCREEN: LEFT VIETNAMESE SOURCE · RIGHT CHINESE TRANSLATION INPUT -->
          <div class="grid-2" style="align-items:stretch;gap:16px;">
            <!-- LEFT PANE: TIẾNG VIỆT (ĐỀ BÀI GỐC) -->
            <div class="card-subtle" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between;border:1.5px solid var(--border-color);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                  <span style="font-size:12.5px;font-weight:800;color:#06b6d4;letter-spacing:0.4px;">🌐 TIẾNG VIỆT — ĐỀ BÀI GỐC</span>
                  <span style="font-size:12px;color:var(--text-muted);">${viWords} từ • ${viSents} câu</span>
                </div>
                <div style="font-size:12.5px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">Hãy dịch đoạn văn sau sang tiếng Trung Giản thể:</div>
                <div style="font-size:17.5px;line-height:1.85;font-weight:600;color:var(--text-main);padding:14px;border-radius:12px;background:var(--bg-surface);border:1px solid var(--border-color);">
                  ${QCore.escapeHtml(lesson.viText)}
                </div>
              </div>

              <div style="margin-top:14px;">
                <button class="btn btn-outline btn-sm" id="tr-tog-hint">
                  ${showTransVocabHint ? "🙈 Ẩn gợi ý từ vựng" : "💡 Xem gợi ý từ vựng & cấu trúc (Không lộ đáp án)"}
                </button>
                ${showTransVocabHint ? `
                  <div style="margin-top:10px;padding:12px;border-radius:10px;background:var(--bg-surface);border:1px solid var(--border-color);font-size:13px;">
                    <strong style="display:block;margin-bottom:6px;color:var(--primary);">🔑 Từ vựng gợi ý cho bài này:</strong>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                      ${(lesson.keyVocab || []).map((kv) => `
                        <span class="badge badge-blue" style="font-size:12.5px;padding:5px 9px;">
                          <strong class="hanzi-text">${QCore.escapeHtml(kv.hanzi)}</strong> (${QCore.escapeHtml(kv.pinyin)}): ${QCore.escapeHtml(kv.vi)}
                        </span>
                      `).join("")}
                    </div>
                  </div>
                ` : ""}
              </div>
            </div>

            <!-- RIGHT PANE: CHINESE WRITING (NHẬP BẢN DỊCH CỦA BẠN) -->
            <div class="card-subtle" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between;border:1.5px solid var(--primary);">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                  <span style="font-size:12.5px;font-weight:800;color:var(--primary);letter-spacing:0.4px;">✍️ CHINESE WRITING — NHẬP BẢN DỊCH CỦA BẠN</span>
                  <span id="tr-char-counter" style="font-size:12px;color:var(--text-muted);">${zhChars} chữ • ${zhSents} câu</span>
                </div>
                <textarea
                  class="textarea-field hanzi-text"
                  id="tr-user-zh"
                  rows="5"
                  data-pinyin-ime="true"
                  style="font-size:19px;line-height:1.75;margin-bottom:10px;"
                  placeholder="请在这里输入你的中文翻译... (Nhập bản dịch bằng chữ Hán Giản thể — gõ Pinyin tự động hiện thanh chọn chữ Hán)"
                >${QCore.escapeHtml(savedDraft)}</textarea>

                <label style="font-size:12.5px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px;">
                  Có thể nhập thêm Pinyin (tùy chọn):
                </label>
                <input
                  class="input-field pinyin-text"
                  id="tr-user-py"
                  data-pinyin-ime="true"
                  data-pinyin-mode="pinyin-only"
                  placeholder="Tùy chọn: Nhập Pinyin của đoạn dịch (vd: Jīntiān wǒ zǎoshang qī diǎn dào xuéxiào...)"
                  style="font-size:13.5px;margin-bottom:12px;"
                />
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--border-color);">
                <span id="tr-draft-status" style="font-size:12px;color:var(--text-muted);">💾 Tự động lưu nháp khi bạn gõ</span>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button class="btn btn-outline btn-sm" id="tr-clear-draft">🔄 Xóa nháp</button>
                  <button class="btn btn-soft btn-sm" id="tr-listen-mine">🔊 Nghe bài của tôi</button>
                  <button class="btn btn-primary" id="tr-submit-ai">🤖 AI chấm bài</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI EVALUATION RESULT CONTAINER -->
        <div id="tr-eval-result">
          ${lastTransEvaluation && lastTransEvaluation.lessonId === lesson.id ? renderTranslationEvaluationHTML(lastTransEvaluation) : ""}
        </div>
      `;

      if (window.QPinyinIME) QPinyinIME.attachAll(container);
      bindWritingHubTabs(container);

      container.querySelector("#tr-filter-level").onchange = (e) => { transLevelFilter = e.target.value; renderWriting(container); };
      container.querySelector("#tr-filter-mode").onchange = (e) => { transModeFilter = e.target.value; renderWriting(container); };
      container.querySelector("#tr-search-inp").oninput = (e) => { transSearchQuery = e.target.value; renderWriting(container); };
      container.querySelector("#tr-pick-lesson").onchange = (e) => {
        activeTransId = e.target.value;
        lastTransEvaluation = null;
        renderWriting(container);
      };
      const prevBtn = container.querySelector("#tr-prev-btn");
      if (prevBtn) prevBtn.onclick = () => {
        if (curIdx > 0) {
          activeTransId = activeList[curIdx - 1].id;
          lastTransEvaluation = null;
          renderWriting(container);
        }
      };
      const nextBtn = container.querySelector("#tr-next-btn");
      if (nextBtn) nextBtn.onclick = () => {
        if (curIdx + 1 < activeList.length) {
          activeTransId = activeList[curIdx + 1].id;
          lastTransEvaluation = null;
          renderWriting(container);
        }
      };
      container.querySelector("#tr-tog-hint").onclick = () => {
        showTransVocabHint = !showTransVocabHint;
        renderWriting(container);
      };

      const zhTa = container.querySelector("#tr-user-zh");
      zhTa.addEventListener("input", () => {
        const val = zhTa.value;
        tState.drafts[lesson.id] = val;
        tState.lastLessonId = lesson.id;
        QCore.saveState(false);
        const chars = val.replace(/\s+/g, "").length;
        const sents = val ? val.split(/[。！？.!?]+/).filter((x) => x.trim()).length : 0;
        const counter = container.querySelector("#tr-char-counter");
        if (counter) counter.textContent = `${chars} chữ • ${sents} câu`;
        const ds = container.querySelector("#tr-draft-status");
        if (ds) ds.textContent = "💾 Đã lưu nháp tự động";
      });

      container.querySelector("#tr-clear-draft").onclick = () => {
        zhTa.value = "";
        delete tState.drafts[lesson.id];
        lastTransEvaluation = null;
        QCore.saveState(false);
        renderWriting(container);
      };

      container.querySelector("#tr-listen-mine").onclick = () => {
        const val = zhTa.value.trim();
        if (!val) { QCore.showToast("Hãy nhập bản dịch tiếng Trung trước để nghe phát âm!"); return; }
        QCore.speakChinese(val);
      };

      container.querySelector("#tr-submit-ai").onclick = async () => {
        const userZh = zhTa.value.trim();
        const userPy = (container.querySelector("#tr-user-py").value || "").trim();
        if (!userZh) {
          QCore.showToast("Vui lòng nhập bản dịch tiếng Trung của bạn trước khi bấm AI chấm bài!");
          return;
        }
        const resBox = container.querySelector("#tr-eval-result");
        resBox.innerHTML = `<div class="card" style="text-align:center;padding:30px;">⏳ Giáo viên AI đang phân tích ngữ pháp, trật tự từ, lượng từ, trợ từ và mức độ truyền tải ý nghĩa tiếng Việt...</div>`;

        let evalObj = evaluateTranslationSmartLocal(lesson, userZh, userPy);
        try {
          const apiRes = await QCore.apiFetch("/api/ai/writing", {
            method: "POST",
            body: {
              text: userZh,
              pinyin: userPy,
              prompt: `Dịch đoạn văn tiếng Việt sau sang tiếng Trung Giản thể: ${lesson.viText}`,
              expected: lesson.referenceZh,
              expectedPinyin: lesson.referencePinyin,
              expectedVi: lesson.viText,
              hskLevel: lesson.hsk_level
            }
          });
          if (apiRes && typeof apiRes.score === "number") {
            const combinedScore = Math.round((evalObj.score100 + apiRes.score) / 2);
            evalObj.score100 = combinedScore;
            evalObj.score10 = Number((combinedScore / 10).toFixed(1));
            if (apiRes.whyWrong && !evalObj.specificErrors.some((x) => x.whyWrong === apiRes.whyWrong)) {
              evalObj.specificErrors.unshift({
                category: "Nhận xét chuyên sâu từ AI Giáo viên",
                wrongFragment: userZh,
                whyWrong: apiRes.whyWrong,
                correction: apiRes.corrected || lesson.referenceZh
              });
            }
          }
        } catch (_) {}

        evalObj.lessonId = lesson.id;
        lastTransEvaluation = evalObj;

        tState.scores[lesson.id] = Math.max(Number(tState.scores[lesson.id] || 0), evalObj.score100);
        if (evalObj.score100 >= 60 && !tState.completedIds.includes(lesson.id)) {
          tState.completedIds.push(lesson.id);
        }
        tState.history.unshift({
          id: "trh_" + Date.now(),
          lessonId: lesson.id,
          title: lesson.title,
          score100: evalObj.score100,
          score10: evalObj.score10,
          userTranslation: userZh,
          at: new Date().toISOString()
        });
        if (tState.history.length > 50) tState.history = tState.history.slice(0, 50);

        st.writingSubmissions.unshift({
          date: QCore.todayStr(),
          original: userZh,
          corrected: evalObj.referenceTranslation,
          score: evalObj.score100
        });
        QCore.recordExternalExercise("writing", lesson.id, evalObj.score100, { mode: "translation" });
        renderWriting(container);
      };

      bindTransEvalActions(container);
      return;
    }

    // MODE 2: HANZI STROKE WRITING STUDIO
    if (wrHubMode === "hanzi") {
      container.innerHTML = `${topHubBar}<div id="wr-hanzi-mount"></div>`;
      bindWritingHubTabs(container);
      window.QHanziStudio.renderHanzi(container.querySelector("#wr-hanzi-mount"));
      return;
    }

    // MODE 3: WRITING STUDIO (QEnglish Screenshot 4: Custom Prompt Submission + Topic Cards Grid!)
    const tasks = window.QCHINESE_WRITING_TASKS || [];
    const task = tasks[activeTaskIdx % tasks.length];
    const extWrProg = (st.externalLibraryProgress && st.externalLibraryProgress.writing) || { completedIds: [], scoresById: {} };

    container.innerHTML = `
      ${topHubBar}

      <!-- Custom Writing Prompt Submission Box (Matches QEnglish Screenshot 4!) -->
      <div class="card" style="padding:20px;margin-bottom:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          <strong style="font-size:15.5px;">📄 Nộp bài tập / bài viết của riêng bạn để chấm (Chấm thang /10 & /100 • 7 tiêu chí HSK 1–6)</strong>
          <span class="badge badge-blue">7 tiêu chí × Chấm chi tiết</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:10px;">
          <input class="input-field" id="wstu-custom-title" placeholder="Tiêu đề bài tập (không bắt buộc)">
          <select class="select-field" id="wstu-custom-level">
            ${[1, 2, 3, 4, 5, 6].map((lv) => `<option value="${lv}">📚 Chấm theo chuẩn HSK ${lv} (/100 • 7 tiêu chí)</option>`).join("")}
          </select>
          <input class="input-field" id="wstu-custom-target" type="number" value="120" placeholder="Số chữ mục tiêu (vd: 120)">
        </div>
        <textarea class="textarea-field" id="wstu-custom-prompt" rows="2" placeholder="Dán đề bài / câu hỏi Writing của bạn vào đây (không bắt buộc)..."></textarea>
        <div style="margin-top:10px;">
          <button class="btn btn-primary btn-sm" id="wstu-start-custom">Viết / dán bài của tôi →</button>
        </div>
      </div>

      <!-- Topic Cards Grid (Matches QEnglish Introduce Yourself, My Family, My Daily Routine cards!) -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;margin-bottom:20px;">
        ${tasks.map((t, idx) => {
          const isDone = (extWrProg.completedIds || []).includes(t.id);
          const best = extWrProg.scoresById && extWrProg.scoresById[t.id];
          return `
            <div class="card" data-pick-wtask="${idx}" style="padding:18px;cursor:pointer;border-color:${idx === activeTaskIdx ? "var(--primary)" : "var(--border-color)"};">
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
                ${renderHskBadge(t.hsk_level)}
                <span class="badge badge-amber">${QCore.escapeHtml(t.badge || "PARAGRAPH")}</span>
                ${isDone ? `<span class="badge badge-jade">✅ Đã nộp (${best}/100)</span>` : ""}
              </div>
              <h3 style="margin:0 0 6px;font-size:17px;">${QCore.escapeHtml(t.title || `Đề ${idx + 1}: HSK ${t.hsk_level}`)}</h3>
              <p style="margin:0 0 6px;font-size:12.5px;color:var(--text-secondary);line-height:1.5;">${QCore.escapeHtml(t.promptEn || "")}</p>
              <p style="margin:0;font-size:12.5px;color:var(--text-muted);line-height:1.5;font-style:italic;">${QCore.escapeHtml(t.prompt)}</p>
            </div>
          `;
        }).join("")}
      </div>

      <!-- Active Writing Studio Workspace -->
      <div class="grid-2" id="wstu-workspace">
        <div class="card">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
            ${renderHskBadge(task.hsk_level)}
            <span class="badge badge-amber">${QCore.escapeHtml(task.badge)}</span>
          </div>
          <h3 style="margin:0 0 8px;font-size:19px;">${QCore.escapeHtml(task.title || task.prompt)}</h3>
          <p style="margin:0 0 10px;font-size:14px;color:var(--text-main);">${QCore.escapeHtml(task.prompt)}</p>
          <div class="card-subtle" style="margin-bottom:14px;font-size:13px;color:var(--text-secondary);">
            💡 ${QCore.escapeHtml(task.hint)}
          </div>

          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">1. Nhập đoạn văn bằng Chữ Hán Giản thể (hỗ trợ gõ Pinyin IME):</label>
          <textarea class="textarea-field hanzi-text" id="wr-main-text" rows="5" data-pinyin-ime="true" style="font-size:18px;margin-bottom:12px;" placeholder="请在这里输入你的中文段落..."></textarea>

          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">2. Nhập Pinyin (tùy chọn):</label>
          <input class="input-field pinyin-text" id="wr-opt-py" data-pinyin-ime="true" data-pinyin-mode="pinyin-only" placeholder="Tùy chọn: gõ Pinyin..." style="margin-bottom:14px;">

          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="wr-submit-ai">👩‍🏫 Chấm & Sửa bài chi tiết (7 tiêu chí)</button>
            <button class="btn btn-outline" id="wr-save-wrong">📒 Lưu câu vào Sổ tay</button>
          </div>
        </div>

        <div class="card" id="wr-feedback-panel">
          ${lastAiGrade
            ? renderAiWritingFeedbackHTML(lastAiGrade)
            : `
            <div style="text-align:center;padding:40px 18px;color:var(--text-muted);">
              <div style="font-size:42px;margin-bottom:10px;">📝</div>
              <strong style="color:var(--text-main);font-size:16px;">Bảng chấm bài chi tiết 7 tiêu chí của AI Giáo viên</strong>
              <p style="font-size:13.5px;margin-top:6px;">
                Sau khi bạn nộp bài viết bên trái, AI Giáo viên sẽ phân tích: Chữ Hán Giản thể, Pinyin, Ngữ pháp, Dùng từ, Trật tự từ, Độ tự nhiên, Phù hợp ngữ cảnh — kèm giải thích vì sao sai và câu mẫu tham khảo!
              </p>
            </div>
          `}
        </div>
      </div>
    `;

    if (window.QPinyinIME) QPinyinIME.attachAll(container);
    bindWritingHubTabs(container);

    container.querySelectorAll("[data-pick-wtask]").forEach((card) => {
      card.onclick = () => {
        activeTaskIdx = Number(card.getAttribute("data-pick-wtask"));
        lastAiGrade = null;
        renderWriting(container);
        container.querySelector("#wstu-workspace")?.scrollIntoView({ behavior: "smooth" });
      };
    });

    container.querySelector("#wstu-start-custom").onclick = () => {
      const customTitle = (container.querySelector("#wstu-custom-title").value || "").trim() || "Bài viết tự chọn";
      const customPrompt = (container.querySelector("#wstu-custom-prompt").value || "").trim() || "Viết đoạn văn tự do bằng tiếng Trung Giản thể.";
      const customLv = Number(container.querySelector("#wstu-custom-level").value || 2);
      tasks.unshift({
        id: "wt_custom_" + Date.now(),
        contentSource: "EXTERNAL_LIBRARY",
        hsk_level: customLv,
        type: "paragraph",
        badge: "CUSTOM",
        title: customTitle,
        promptEn: customPrompt,
        prompt: customPrompt,
        targetWord: "",
        expected: "",
        expectedPinyin: "",
        expectedEn: "",
        expectedVi: customPrompt,
        hint: "Hãy vận dụng cấu trúc câu và liên từ phù hợp với cấp độ HSK đã chọn."
      });
      activeTaskIdx = 0;
      lastAiGrade = null;
      renderWriting(container);
      container.querySelector("#wstu-workspace")?.scrollIntoView({ behavior: "smooth" });
    };

    bindGradePanelAudio(container);

    container.querySelector("#wr-submit-ai").onclick = async () => {
      const text = container.querySelector("#wr-main-text").value.trim();
      const py = container.querySelector("#wr-opt-py").value.trim();
      if (!text) {
        QCore.showToast("Vui lòng nhập câu hoặc đoạn văn tiếng Trung trước khi chấm bài!");
        return;
      }
      const panel = container.querySelector("#wr-feedback-panel");
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
        QCore.recordExternalExercise("writing", task.id, res.score, { mode: "studio" });
        panel.innerHTML = renderAiWritingFeedbackHTML(res);
        bindGradePanelAudio(panel);
      } catch (e) {
        panel.innerHTML = `<div style="color:var(--accent-red);">${QCore.escapeHtml(e.message)}</div>`;
      }
    };

    container.querySelector("#wr-save-wrong").onclick = () => {
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

  function bindWritingHubTabs(container) {
    container.querySelectorAll("[data-wrhub]").forEach((b) => {
      b.onclick = () => {
        wrHubMode = b.getAttribute("data-wrhub");
        renderWriting(container);
      };
    });
  }

  function bindTransEvalActions(container) {
    container.querySelectorAll("[data-speak-tr]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak-tr"));
    });
    container.querySelectorAll("[data-save-tr-vocab]").forEach((b) => {
      b.onclick = () => {
        QCore.addToNotebook({
          category: "vocab",
          hanzi: b.getAttribute("data-save-tr-vocab"),
          pinyin: b.getAttribute("data-py"),
          vietnamese: b.getAttribute("data-vi"),
          english: b.getAttribute("data-en")
        });
      };
    });
  }

  function renderAiWritingFeedbackHTML(g) {
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span class="badge ${g.score >= 80 ? "badge-jade" : "badge-amber"}">Điểm bài viết: ${g.score}/100 (${(g.score / 10).toFixed(1)}/10)</span>
        <button class="btn btn-soft btn-sm" data-speak-corr="${QCore.escapeHtml(g.corrected)}">🔊 Nghe câu chuẩn</button>
      </div>

      <div class="card-subtle" style="margin-bottom:12px;">
        <div style="font-size:13px;color:var(--text-muted);">Bài làm của bạn:</div>
        <div class="hanzi-text" style="font-size:17px;margin-bottom:8px;">${QCore.escapeHtml(g.original)}</div>
        <div style="font-size:13px;color:var(--primary);font-weight:700;">✅ Bản dịch / Câu sửa đúng chuẩn Giản thể:</div>
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
        ${(g.criteria || []).map((c) => {
          const icon = c.status === "good" ? "✅" : c.status === "warn" ? "⚠️" : "❌";
          return `<div style="font-size:12.5px;padding:7px 10px;border-radius:9px;background:var(--bg-subtle);"><strong>${icon} ${QCore.escapeHtml(c.name)}:</strong> ${QCore.escapeHtml(c.comment)}</div>`;
        }).join("")}
      </div>

      <h4 style="margin:0 0 8px;font-size:14px;">🔁 Ví dụ tương tự để luyện lại</h4>
      <div style="display:flex;flex-direction:column;gap:6px;">
        ${(g.similarExamples || []).map((ex) => `
          <div class="card-subtle" style="padding:8px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <div style="font-size:13px;">
              <strong class="hanzi-text" style="font-size:15.5px;">${QCore.escapeHtml(ex.chinese)}</strong> (${QCore.escapeHtml(ex.pinyin)})<br>
              <span>🇬🇧 ${QCore.escapeHtml(ex.english)} · 🇻🇳 ${QCore.escapeHtml(ex.vietnamese)}</span>
            </div>
            <button class="btn btn-outline btn-sm" data-speak-corr="${QCore.escapeHtml(ex.chinese)}">🔊</button>
          </div>
        `).join("")}
      </div>
    `;
  }

  function bindGradePanelAudio(root) {
    root.querySelectorAll("[data-speak-corr]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak-corr"));
    });
  }

  /* ==================== PERSONAL MATERIAL INTEGRATIONS (WRITING / READING / SPEAKING) ==================== */

  function renderMaterialWritingStudio(container, mat) {
    const st = QCore.getState();
    container.innerHTML = `
      <div class="page-header">
        <div>
          <span class="badge badge-blue">📁 ĐỀ BÀI TỪ KHO TÀI LIỆU CÁ NHÂN · HSK ${mat.hskLevel}</span>
          <h2 style="margin:6px 0 4px;">✍️ Luyện Viết: ${QCore.escapeHtml(mat.title)}</h2>
          <p>AI chấm bài bám sát đúng đề bài gốc bạn cung cấp, đánh giá bài làm gốc trước rồi mới đưa ra phiên bản sửa chuẩn.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" id="mwr-back-std">← Về đề viết chuẩn HSK</button>
          <button class="btn btn-soft btn-sm" id="mwr-back-lib">📁 Về Kho tài liệu</button>
        </div>
      </div>

      <div class="grid-2" style="align-items:start;">
        <div class="card">
          <div class="card-subtle" style="margin-bottom:14px;border-left:4px solid var(--primary);">
            <strong style="font-size:12.5px;color:var(--primary);">📋 ĐỀ BÀI GỐC (Không thay đổi):</strong>
            <div class="hanzi-text" style="font-size:19px;font-weight:700;margin-top:6px;white-space:pre-wrap;">${QCore.escapeHtml(mat.content || mat.title)}</div>
            ${mat.notes ? `<div style="font-size:12.5px;color:var(--text-secondary);margin-top:6px;">📝 Ghi chú: ${QCore.escapeHtml(mat.notes)}</div>` : ""}
          </div>

          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Bài làm của bạn (Chữ Hán Giản thể – gõ Pinyin tự hiện gợi ý):</label>
          <textarea class="textarea-field hanzi-text" id="mwr-text" rows="6" data-pinyin-ime="true" style="font-size:18px;margin-bottom:10px;" placeholder="Viết đoạn văn/câu trả lời bằng tiếng Trung Giản thể..."></textarea>

          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="mwr-submit">👩‍🏫 Nộp bài & Đánh giá chi tiết</button>
            <button class="btn btn-outline" id="mwr-speak-prompt">🔊 Nghe đọc đề bài</button>
          </div>
        </div>

        <div class="card">
          <h3 style="margin:0 0 12px;">📊 Kết quả đánh giá của AI Giáo viên</h3>
          <div id="mwr-grade-panel">
            ${lastAiGrade ? renderAiWritingFeedbackHTML(lastAiGrade) : `<div class="card-subtle" style="color:var(--text-muted);font-size:13.5px;">Nhập bài viết bên trái và bấm "Nộp bài & Đánh giá chi tiết". Kết quả và điểm số sẽ được lưu vào lịch sử tài liệu này!</div>`}
          </div>
        </div>
      </div>
    `;
    if (window.QPinyinIME) QPinyinIME.attachAll(container);
    container.querySelector("#mwr-back-std").onclick = () => { activeWriteMatId = null; renderWriting(container); };
    container.querySelector("#mwr-back-lib").onclick = () => window.QApp.navigate("materials");
    container.querySelector("#mwr-speak-prompt").onclick = () => QCore.speakChinese(mat.content || mat.title);

    container.querySelector("#mwr-submit").onclick = async () => {
      const text = (container.querySelector("#mwr-text").value || "").trim();
      if (!text) { QCore.showToast("Vui lòng viết bài tiếng Trung trước khi nộp!"); return; }
      const panel = container.querySelector("#mwr-grade-panel");
      panel.innerHTML = `<div class="card-subtle">⏳ AI Giáo viên đang chấm bài bám sát đề "${QCore.escapeHtml(mat.title)}"...</div>`;
      const res = await window.QAiTutor.evaluateSentenceSmart({
        text,
        prompt: mat.content || mat.title,
        hskLevel: mat.hskLevel || st.profile.hskLevel
      });
      lastAiGrade = res;
      QCore.recordMaterialPractice(mat.id, { mode: "Luyện Viết", score: res.score, answer: text, status: (res.score || 0) >= 70 ? "completed" : "in_progress" });
      st.writingSubmissions.unshift({ date: QCore.todayStr(), original: res.original, corrected: res.corrected, score: res.score, materialTitle: mat.title });
      QCore.updateSkillScore("writing", res.score || 70);
      QCore.saveState(true);
      renderMaterialWritingStudio(container, mat);
    };
    if (lastAiGrade) bindGradePanelAudio(container.querySelector("#mwr-grade-panel"));
  }

  async function renderMaterialReadingStudio(container, mat) {
    await QVocabStore.init();
    const tokens = QVocabStore.segmentChineseText(mat.content || "");
    const st = QCore.getState();
    const markedSet = new Set(st.markedWords || []);
    const sel = matRdSelectedWord;
    const sentences = (mat.content || "").split(/[。！？\n]+/).map((s) => s.trim()).filter((s) => s.length >= 4);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <span class="badge badge-blue">📁 ĐỌC HIỂU TƯƠNG TÁC (LWT-STYLE) · HSK ${mat.hskLevel}</span>
          <h2 style="margin:6px 0 4px;">📖 ${QCore.escapeHtml(mat.title)}</h2>
          <p>Giữ nguyên văn bản gốc — bấm vào bất kỳ từ chữ Hán nào để nghe phát âm, tra nghĩa Trung–Anh–Việt, đánh dấu từ mới và lưu vào Sổ tay.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn ${matRdShowGloss ? "btn-primary" : "btn-outline"} btn-sm" id="mrd-tog-gloss">👁️ ${matRdShowGloss ? "Đang hiện Chú thích dưới từ" : "Ẩn chú thích (Tự luyện đọc)"}</button>
          <button class="btn btn-soft btn-sm" id="mrd-speak-all">🔊 Đọc toàn bài</button>
          <button class="btn btn-outline btn-sm" id="mrd-back-std">← Về Thư viện bài đọc</button>
          <button class="btn btn-outline btn-sm" id="mrd-back-lib">📁 Kho tài liệu</button>
        </div>
      </div>

      <div class="reading-layout">
        <div class="card">
          <div style="display:flex;flex-wrap:wrap;gap:6px 4px;align-items:flex-end;line-height:1.4;">
            ${tokens.map((tk, idx) => {
              if (!tk.isHanzi) {
                return tk.text === "\n" ? `<div style="flex-basis:100%;height:8px;"></div>` : `<span style="font-size:22px;padding:0 2px;">${QCore.escapeHtml(tk.text)}</span>`;
              }
              const isMarked = markedSet.has(tk.text);
              const gloss = tk.entry ? (tk.entry.meanings.vietnamese[0] || tk.entry.meanings.english[0] || "").split(/[;,]/)[0].slice(0, 18) : "";
              const py = tk.entry ? tk.entry.pinyin : "";
              return `
                <button type="button" data-mrd-tok="${idx}" style="background:${isMarked ? "var(--bg-warn-soft)" : "transparent"};border:none;border-bottom:2px solid ${isMarked ? "var(--accent-amber)" : tk.entry ? "var(--primary-light)" : "var(--border-color)"};border-radius:6px;padding:4px 5px;cursor:pointer;display:inline-flex;flex-direction:column;align-items:center;color:var(--text-main);">
                  ${matRdShowGloss && py ? `<span class="pinyin-text" style="font-size:11px;color:var(--primary);">${QCore.escapeHtml(py)}</span>` : ""}
                  <span class="hanzi-text" style="font-size:24px;font-weight:500;">${QCore.escapeHtml(tk.text)}</span>
                  ${matRdShowGloss && gloss ? `<span style="font-size:10.5px;color:var(--text-muted);max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${QCore.escapeHtml(gloss)}</span>` : ""}
                </button>
              `;
            }).join("")}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:14px;">
          <div class="card">
            <h3 style="margin:0 0 10px;font-size:16px;">🔍 Từ điển tức thì khi bấm từ</h3>
            ${sel ? `
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div>
                  <span class="hanzi-text" style="font-size:34px;font-weight:700;">${QCore.escapeHtml(sel.text)}</span>
                  ${sel.entry ? `<span class="pinyin-text" style="font-size:18px;color:var(--primary);font-weight:700;margin-left:8px;">${QCore.escapeHtml(sel.entry.pinyin)}</span>` : ""}
                </div>
                <button class="btn btn-primary btn-sm" id="mrd-speak-tok">🔊 Nghe</button>
              </div>
              <div class="card-subtle" style="margin-bottom:10px;font-size:13.5px;">
                ${sel.entry ? `
                  ${sel.entry.meanings.vietnamese.length ? `<div><strong>🇻🇳 Việt:</strong> ${QCore.escapeHtml(sel.entry.meanings.vietnamese.join("; "))}</div>` : ""}
                  ${sel.entry.meanings.english.length ? `<div style="margin-top:4px;color:var(--text-secondary);"><strong>🇬🇧 Anh:</strong> ${QCore.escapeHtml(sel.entry.meanings.english.slice(0, 3).join("; "))}</div>` : ""}
                ` : `<div>Chưa có trong cấp HSK đang nạp — bấm "AI giải thích sâu" hoặc mở Kho từ vựng cấp cao hơn.</div>`}
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn btn-soft btn-sm" id="mrd-mark-tok">🖍️ Đánh dấu từ mới</button>
                <button class="btn btn-outline btn-sm" id="mrd-save-nb">📒 Lưu Sổ tay</button>
                <button class="btn btn-outline btn-sm" id="mrd-ask-ai">🤖 AI giải thích</button>
              </div>
            ` : `<div class="card-subtle" style="font-size:13px;color:var(--text-muted);">Bấm vào bất kỳ từ chữ Hán nào bên trái để nghe phát âm & tra nghĩa ngay lập tức!</div>`}
          </div>

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <h3 style="margin:0;font-size:16px;">📝 Tự kiểm tra Đọc hiểu</h3>
              <span class="badge badge-amber">Personal Material</span>
            </div>
            <textarea class="textarea-field" id="mrd-summary" rows="3" placeholder="Nhập câu tóm tắt nội dung bài đọc..."></textarea>
            <button class="btn btn-primary btn-sm" style="margin-top:8px;" id="mrd-complete">✅ Ghi nhận hoàn thành bài đọc</button>
            ${sentences.length ? `<div style="margin-top:10px;font-size:12px;color:var(--text-muted);">Số câu trong bài gốc: ${sentences.length} câu.</div>` : ""}
          </div>
        </div>
      </div>
    `;

    container.querySelector("#mrd-tog-gloss").onclick = () => { matRdShowGloss = !matRdShowGloss; renderMaterialReadingStudio(container, mat); };
    container.querySelector("#mrd-speak-all").onclick = () => QCore.speakChinese((mat.content || "").slice(0, 260));
    container.querySelector("#mrd-back-std").onclick = () => { activeReadMatId = null; renderReading(container); };
    container.querySelector("#mrd-back-lib").onclick = () => window.QApp.navigate("materials");

    container.querySelectorAll("[data-mrd-tok]").forEach((btn) => {
      btn.onclick = () => {
        const tk = tokens[Number(btn.getAttribute("data-mrd-tok"))];
        matRdSelectedWord = tk;
        QCore.speakChinese(tk.text);
        renderMaterialReadingStudio(container, mat);
      };
    });

    if (sel) {
      container.querySelector("#mrd-speak-tok").onclick = () => QCore.speakChinese(sel.text);
      container.querySelector("#mrd-mark-tok").onclick = () => {
        const idx = st.markedWords.indexOf(sel.text);
        if (idx >= 0) st.markedWords.splice(idx, 1);
        else st.markedWords.push(sel.text);
        QCore.saveState(false);
        renderMaterialReadingStudio(container, mat);
      };
      container.querySelector("#mrd-save-nb").onclick = () => {
        QCore.addToNotebook({
          category: "vocab",
          hanzi: sel.text,
          pinyin: sel.entry ? sel.entry.pinyin : "",
          english: sel.entry ? (sel.entry.meanings.english || []).slice(0, 2).join("; ") : "",
          vietnamese: sel.entry ? (sel.entry.meanings.vietnamese[0] || sel.entry.meanings.english[0] || "") : ""
        });
      };
      container.querySelector("#mrd-ask-ai").onclick = () => window.QApp.navigate("ai-tutor", { tab: "explain_word", word: sel.text });
    }

    container.querySelector("#mrd-complete").onclick = () => {
      const sum = (container.querySelector("#mrd-summary").value || "").trim();
      QCore.recordMaterialPractice(mat.id, { mode: "Đọc hiểu tương tác", score: 100, answer: sum || "Đã hoàn thành đọc hiểu", status: "completed" });
      QCore.updateSkillScore("reading", 90);
      QCore.showToast("🎉 Đã lưu hoàn thành bài đọc vào Kho tài liệu!");
    };
  }

  function renderMaterialSpeakingStudio(container, mat) {
    container.innerHTML = `
      <div class="page-header">
        <div>
          <span class="badge badge-blue">📁 CHỦ ĐỀ NÓI TỪ KHO TÀI LIỆU CÁ NHÂN · HSK ${mat.hskLevel}</span>
          <h2 style="margin:6px 0 4px;">🎙️ Luyện Nói: ${QCore.escapeHtml(mat.title)}</h2>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-outline btn-sm" id="mspk-back-std">← Về luyện nói chuẩn</button>
          <button class="btn btn-soft btn-sm" id="mspk-back-lib">📁 Kho tài liệu</button>
        </div>
      </div>

      <div class="grid-2" style="align-items:start;">
        <div class="card">
          <div class="card-subtle" style="border-left:4px solid var(--primary);margin-bottom:14px;">
            <strong style="color:var(--primary);font-size:12.5px;">🎯 ĐỀ BÀI / CHỦ ĐỀ LUYỆN NÓI:</strong>
            <div class="hanzi-text" style="font-size:20px;font-weight:700;margin-top:6px;">${QCore.escapeHtml(mat.content || mat.title)}</div>
            <button class="btn btn-soft btn-sm" style="margin-top:8px;" id="mspk-listen">🔊 Nghe đọc đề bài</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            <button class="btn btn-primary" id="mspk-rec">🎙️ Ghi âm câu trả lời (6 giây)</button>
          </div>
          <div id="mspk-rec-out"></div>
        </div>

        <div class="card">
          <h3 style="margin:0 0 8px;">✍️ Soạn & Kiểm tra kịch bản nói với AI</h3>
          <textarea class="textarea-field hanzi-text" id="mspk-script" rows="5" data-pinyin-ime="true" placeholder="Ghi âm ở bên trái hoặc gõ câu trả lời tiếng Trung vào đây..."></textarea>
          <button class="btn btn-primary" style="margin-top:10px;" id="mspk-eval">🤖 Chấm nội dung bài nói & Lưu tiến độ</button>
          <div id="mspk-eval-out" style="margin-top:12px;"></div>
        </div>
      </div>
    `;
    if (window.QPinyinIME) QPinyinIME.attachAll(container);
    container.querySelector("#mspk-back-std").onclick = () => { activeSpkMatId = null; renderSpeaking(container); };
    container.querySelector("#mspk-back-lib").onclick = () => window.QApp.navigate("materials");
    container.querySelector("#mspk-listen").onclick = () => QCore.speakChinese(mat.content || mat.title);

    container.querySelector("#mspk-rec").onclick = () => {
      const out = container.querySelector("#mspk-rec-out");
      out.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);">🔴 Đang thu âm 6 giây... Hãy trả lời bằng tiếng Trung!</div>`;
      QCore.captureLearnerVoice({
        durationMs: 6000,
        onAudioReady: (url, transcript) => {
          if (transcript) {
            const ta = container.querySelector("#mspk-script");
            ta.value = (ta.value ? ta.value + " " : "") + transcript;
          }
          out.innerHTML = `
            <div class="card-subtle">
              <audio controls src="${url}" style="width:100%;height:36px;margin-bottom:6px;"></audio>
              <div style="font-size:12.5px;color:var(--text-secondary);">${transcript ? `✅ Nhận diện: "${QCore.escapeHtml(transcript)}"` : "🎧 Đã lưu băng thu âm."}</div>
            </div>
          `;
        }
      });
    };

    container.querySelector("#mspk-eval").onclick = async () => {
      const text = (container.querySelector("#mspk-script").value || "").trim();
      if (!text) { QCore.showToast("Vui lòng thu âm hoặc nhập câu trả lời trước!"); return; }
      const out = container.querySelector("#mspk-eval-out");
      out.innerHTML = `<div class="card-subtle">⏳ AI đang chấm bài nói...</div>`;
      const res = await window.QAiTutor.evaluateSentenceSmart({
        text,
        prompt: mat.content || mat.title,
        hskLevel: mat.hskLevel || 1
      });
      QCore.recordMaterialPractice(mat.id, { mode: "Luyện Nói", score: res.score, answer: text, status: (res.score || 0) >= 70 ? "completed" : "in_progress" });
      QCore.logDailyActivity("speakingMinutes", 2);
      QCore.updateSkillScore("speaking", res.score || 75);
      out.innerHTML = window.QAiTutor.renderSentenceEvaluationCard(res);
    };
  }

  return {
    renderGrammar,
    renderSpeaking,
    renderReading,
    renderWriting
  };
})();
