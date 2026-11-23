/* -*- coding: utf-8 -*-
 * QChinese – Hạng mục 6: Structured Lesson Studio (HSK 3.0 -> Lesson 1..15 -> 6 Skills -> Bài 1, Bài 2...)
 * Split-screen Reading (5 diverse graded questions), Real MP3 Listening Player, Writing/Speaking/Vocab/Grammar,
 * Adaptive "AI – TẠO BÀI TẬP MỚI" targeting learner mistakes, and real-time synced Lesson progress!
 */

window.QLessonStudio = (function () {
  let activeCourse = null;
  let activeHsk = 1;
  let activeCourseId = null;
  let activeLessonIdx = 0;
  let activeSkill = "reading"; // reading | listening | writing | speaking | vocabulary | grammar
  let activeExIdx = 0;
  let showPinyin = true;
  let showEn = true;
  let showVi = false;
  let lastWrongFocuses = [];
  let lastGradeSummary = null;

  function isViMode() {
    return window.QCore && typeof QCore.getUiLang === "function" && QCore.getUiLang() === "vi";
  }

  function pickQuestionFields(q) {
    const useEn = !isViMode();
    return {
      text: (useEn && q.question_en) ? q.question_en : (q.question || ""),
      options: (useEn && Array.isArray(q.options_en) && q.options_en.length) ? q.options_en : (q.options || []),
      answer: (useEn && q.answer_en) ? q.answer_en : (q.answer || ""),
      explain: (useEn && q.explain_en) ? q.explain_en : (q.explain || "")
    };
  }

  function formatAlignedLines(text, refChinese) {
    const raw = String(text || "").trim();
    if (!raw) return "";
    if (raw.includes("\n")) return raw;
    // If legacy data had no newlines but Chinese has multiple lines, split cleanly by sentence punctuation
    const refLines = String(refChinese || "").split("\n").filter((x) => x.trim()).length;
    if (refLines > 1) {
      return raw.replace(/([.!?。！？])\s+(?=[A-ZĐÁÀẢÃẠĂÂÊÔƠƯNǐWǒShìMéiDuìXièBú])/g, "$1\n");
    }
    return raw;
  }

  const SKILLS = [
    { id: "reading", label: "📰 Reading" },
    { id: "listening", label: "🎧 Listening" },
    { id: "writing", label: "🖋️ Writing" },
    { id: "speaking", label: "🎙️ Speaking" },
    { id: "vocabulary", label: "📚 Vocabulary" },
    { id: "grammar", label: "🧩 Grammar" }
  ];

  function sourceTagBadge(tag) {
    if (tag === "extracted_from_pdf") return `<span class="badge badge-jade">📄 Trích xuất từ giáo trình / MP3 gốc</span>`;
    if (tag === "ai_explained") return `<span class="badge badge-blue">💡 AI giải thích</span>`;
    return `<span class="badge badge-amber">✨ AI tạo thêm (theo chuẩn bài học)</span>`;
  }

  async function renderLessons(container, params = {}) {
    if (params && params.hskLevel) activeHsk = Number(params.hskLevel);
    if (params && params.courseId) activeCourseId = params.courseId;
    else if (params && params.hskLevel) activeCourseId = null;

    if (!QCore.getServerHealth().ok) {
      container.innerHTML = `
        <div class="page-header"><div><h2>🎓 Hệ Thống Khóa Học & Lesson (HSK 3.0)</h2></div></div>
        <div class="card" style="padding:28px;border-color:var(--accent-amber);">
          ⚠️ Kết nối Backend Server 24/7 (<code>python server.py</code> hoặc Render) để mở khóa 15 Lesson giáo trình HSK 1 (3.0) kèm 93 MP3 gốc và AI tạo bài tập thích ứng.
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="card" style="text-align:center;padding:38px;">⏳ Đang tải khóa học Lesson HSK 3.0...</div>`;
    try {
      const qs = activeCourseId
        ? `courseId=${encodeURIComponent(activeCourseId)}`
        : `hskLevel=${encodeURIComponent(activeHsk)}`;
      const res = await QCore.apiFetch(`/api/pdf/course?${qs}`);
      activeCourse = res.course;
      if (activeLessonIdx >= (activeCourse.lessons || []).length) activeLessonIdx = 0;
    } catch (err) {
      container.innerHTML = `
        <div class="card" style="padding:28px;">
          <h3 style="margin:0 0 8px;">🔒 Cấp độ HSK ${activeHsk === 7 ? "7–9" : activeHsk} chưa được mở khóa</h3>
          <p style="color:var(--text-secondary);">${QCore.escapeHtml(err.message)}</p>
          <button class="btn btn-primary btn-sm" id="ls-goto-pdf">📄 Mở AI PDF Studio để tải tài liệu →</button>
        </div>
      `;
      container.querySelector("#ls-goto-pdf").onclick = () => window.QApp.navigate("ai-pdf");
      return;
    }

    drawStudio(container);
  }

  function getLessonCompletion(lesson, lp) {
    const ids = [
      ...(lesson.skills.reading || []).map((x) => x.id),
      ...(lesson.skills.listening || []).map((x) => x.id),
      ...(lesson.skills.grammar || []).map((x) => x.id),
      ...(lesson.skills.writing || []).map((x) => x.id),
      ...(lesson.skills.speaking || []).map((x) => x.id)
    ];
    const done = ids.filter((id) => lp[id] && lp[id].status === "completed").length;
    return { done, total: ids.length, pct: ids.length ? Math.round((done / ids.length) * 100) : 0 };
  }

  function drawStudio(container) {
    const st = QCore.getState();
    const lp = (st && st.lessonProgress) || {};
    const lessons = (activeCourse && activeCourse.lessons) || [];
    const lesson = lessons[activeLessonIdx] || lessons[0];
    if (!lesson) return;

    const exList = Array.isArray(lesson.skills[activeSkill]) ? lesson.skills[activeSkill] : [];
    if (activeExIdx >= exList.length) activeExIdx = 0;
    const comp = getLessonCompletion(lesson, lp);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
            <span class="badge badge-jade">${QCore.escapeHtml(activeCourse.code || "HSK 3.0")}</span>
            ${activeCourse.mp3TracksLinked ? `<span class="badge badge-blue">🎧 ${activeCourse.mp3TracksLinked} MP3 giáo trình gốc</span>` : ""}
            <span class="badge badge-amber">Tiến độ bài này: ${comp.done}/${comp.total} (${comp.pct}%)</span>
          </div>
          <h2 style="margin:0;">🎓 ${QCore.escapeHtml(activeCourse.title)}</h2>
          <p style="margin:4px 0 0;font-size:13px;">${QCore.escapeHtml(activeCourse.transparencyNote || "")}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" id="ls-back-pdf">📄 Quản lý AI PDF & Cấp HSK</button>
        </div>
      </div>

      <!-- Lesson Selector Strip (Lesson 1..15) -->
      <div class="card" style="padding:14px 16px;margin-bottom:14px;">
        <div style="font-size:12.5px;font-weight:700;color:var(--text-muted);margin-bottom:8px;">Chọn Lesson (${lessons.length} bài học):</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${lessons.map((l, idx) => {
            const lc = getLessonCompletion(l, lp);
            return `
              <button class="btn ${idx === activeLessonIdx ? "btn-primary" : "btn-outline"} btn-sm" data-pick-lesson="${idx}">
                ${lc.pct === 100 ? "✅ " : lc.done > 0 ? "🟡 " : ""}Lesson ${l.lessonNum}
              </button>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Current Lesson Header + 6-Skill Tabs -->
      <div class="card" style="padding:16px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
          <div>
            <h3 style="margin:0;">${QCore.escapeHtml(lesson.title)}</h3>
            <small style="color:var(--text-muted);">Nguồn: ${QCore.escapeHtml(lesson.sourceLabel || "")} · Trang tham chiếu ~${lesson.sourcePage || 1}</small>
          </div>
          <button class="btn btn-primary btn-sm" id="ls-ai-gen-btn">✨ AI – TẠO BÀI TẬP MỚI (${activeSkill.toUpperCase()})</button>
        </div>

        <div class="tabs-bar" style="flex-wrap:wrap;">
          ${SKILLS.map((sk) => {
            const cnt = Array.isArray(lesson.skills[sk.id]) ? lesson.skills[sk.id].length : 0;
            return `<button class="tab-pill ${activeSkill === sk.id ? "active" : ""}" data-lskill="${sk.id}">${sk.label} (${cnt})</button>`;
          }).join("")}
        </div>

        ${activeSkill !== "vocabulary" && exList.length > 0 ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px solid var(--border-color);">
            ${exList.map((ex, idx) => {
              const pRec = lp[ex.id];
              return `
                <button class="btn ${idx === activeExIdx ? "btn-soft" : "btn-outline"} btn-sm" style="${idx === activeExIdx ? "border-color:var(--primary);font-weight:700;" : ""}" data-pick-ex="${idx}">
                  ${pRec && pRec.status === "completed" ? "✅ " : ""}Bài ${idx + 1}${pRec ? ` (${pRec.bestScore}đ)` : ""}
                </button>
              `;
            }).join("")}
          </div>
        ` : ""}
      </div>

      <div id="lesson-skill-stage"></div>
    `;

    container.querySelector("#ls-back-pdf").onclick = () => window.QApp.navigate("ai-pdf");
    container.querySelectorAll("[data-pick-lesson]").forEach((b) => {
      b.onclick = () => {
        activeLessonIdx = Number(b.getAttribute("data-pick-lesson"));
        activeExIdx = 0;
        lastGradeSummary = null;
        lastWrongFocuses = [];
        drawStudio(container);
      };
    });
    container.querySelectorAll("[data-lskill]").forEach((b) => {
      b.onclick = () => {
        activeSkill = b.getAttribute("data-lskill");
        activeExIdx = 0;
        lastGradeSummary = null;
        drawStudio(container);
      };
    });
    container.querySelectorAll("[data-pick-ex]").forEach((b) => {
      b.onclick = () => {
        activeExIdx = Number(b.getAttribute("data-pick-ex"));
        lastGradeSummary = null;
        drawStudio(container);
      };
    });

    // AI Adaptive Exercise Generator ("AI – TẠO BÀI TẬP MỚI")
    container.querySelector("#ls-ai-gen-btn").onclick = async () => {
      const btn = container.querySelector("#ls-ai-gen-btn");
      btn.disabled = true;
      btn.textContent = "⏳ AI đang phân tích lỗi & tạo bài tập mới...";
      try {
        const targetSkill = activeSkill === "vocabulary" ? "grammar" : activeSkill;
        const currList = lesson.skills[targetSkill] || [];
        const newEx = await QCore.apiFetch("/api/ai/generate-lesson-exercise", {
          method: "POST",
          body: {
            skill: targetSkill,
            hskLevel: activeCourse.hskLevel || 1,
            lessonTitle: lesson.title,
            vocabWords: lesson.skills.vocabulary || [],
            wrongFocuses: lastWrongFocuses,
            variantIndex: currList.length + 1
          }
        });
        if (!Array.isArray(lesson.skills[targetSkill])) lesson.skills[targetSkill] = [];
        lesson.skills[targetSkill].push(newEx);
        activeSkill = targetSkill;
        activeExIdx = lesson.skills[targetSkill].length - 1;
        lastGradeSummary = null;
        QCore.showToast("✨ AI đã tạo xong bài tập mới bám sát lỗi sai & cấp độ bài học!");
        drawStudio(container);
      } catch (err) {
        QCore.showToast("❌ " + err.message);
        drawStudio(container);
      }
    };

    const stage = container.querySelector("#lesson-skill-stage");
    if (activeSkill === "reading") renderReadingSplit(stage, lesson, exList[activeExIdx], container);
    else if (activeSkill === "listening") renderListeningEx(stage, lesson, exList[activeExIdx], container);
    else if (activeSkill === "vocabulary") renderVocabEx(stage, lesson);
    else if (activeSkill === "grammar") renderGrammarEx(stage, lesson, exList[activeExIdx], container);
    else if (activeSkill === "writing") renderWritingEx(stage, lesson, exList[activeExIdx], container);
    else renderSpeakingEx(stage, lesson, exList[activeExIdx], container);
  }

  /* ---------- SPLIT-SCREEN READING (LEFT: PASSAGE · RIGHT: 5 QUESTIONS + GRADING) ---------- */
  function renderReadingSplit(stage, lesson, ex, parentContainer) {
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? 'Chưa có bài đọc. Bấm "✨ AI – TẠO BÀI TẬP MỚI" phía trên!' : 'No reading exercise yet. Click "✨ AI – Generate New Exercise" above!'}</div>`; return; }
    const st = QCore.getState();
    const prog = st.lessonProgress && st.lessonProgress[ex.id];
    const alignedPinyin = formatAlignedLines(ex.pinyin, ex.chinese);
    const alignedEn = formatAlignedLines(ex.english, ex.chinese);
    const alignedVi = formatAlignedLines(ex.vietnamese, ex.chinese);

    stage.innerHTML = `
      <div class="grid-2" style="align-items:start;gap:16px;">
        <!-- LEFT PANE: Chinese Passage + Line-Aligned Pinyin, English & Vietnamese -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            <div>
              ${sourceTagBadge(ex.sourceTag)}
              <h3 style="margin:6px 0 0;font-size:17px;">${QCore.escapeHtml(ex.title)}</h3>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn ${showPinyin ? "btn-primary" : "btn-outline"} btn-sm" id="lrd-py">ā Pinyin</button>
              <button class="btn ${showEn ? "btn-primary" : "btn-outline"} btn-sm" id="lrd-en">🇬🇧 English</button>
              <button class="btn ${showVi ? "btn-primary" : "btn-outline"} btn-sm" id="lrd-vi">🇻🇳 Dịch Việt</button>
              <button class="btn btn-soft btn-sm" id="lrd-speak">🔊 ${vi ? "Nghe đọc" : "Listen"}</button>
            </div>
          </div>

          ${ex.focusReason ? `<div class="vi-hint-banner" style="margin-bottom:10px;"><span>🎯</span><div>${QCore.escapeHtml(ex.focusReason)}</div></div>` : ""}

          <div class="card-subtle hanzi-text" style="font-size:21px;line-height:2.0;white-space:pre-line;margin-bottom:12px;">${QCore.escapeHtml(ex.chinese)}</div>

          ${showPinyin && alignedPinyin ? `
            <div class="card-subtle" style="margin-bottom:10px;border-left:3px solid var(--primary);">
              <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;">ā Pinyin</div>
              <div class="pinyin-text" style="font-size:14.5px;color:var(--primary);line-height:1.9;white-space:pre-line;margin-top:6px;">${QCore.escapeHtml(alignedPinyin)}</div>
            </div>
          ` : ""}

          ${showEn && alignedEn ? `
            <div class="card-subtle" style="margin-bottom:10px;border-left:3px solid #3b82f6;">
              <div style="font-size:12.5px;font-weight:700;color:var(--text-main);">🇬🇧 English Translation:</div>
              <div style="font-size:13.5px;color:var(--text-secondary);line-height:1.85;white-space:pre-line;margin-top:6px;">${QCore.escapeHtml(alignedEn)}</div>
            </div>
          ` : ""}

          ${showVi && alignedVi ? `
            <div class="card-subtle" style="font-size:13.5px;color:var(--text-secondary);border-left:3px solid var(--accent-amber);">
              <div style="font-size:12.5px;font-weight:700;color:var(--text-main);">🇻🇳 Bản dịch tham khảo:</div>
              <div style="line-height:1.85;white-space:pre-line;margin-top:6px;">${QCore.escapeHtml(alignedVi)}</div>
            </div>
          ` : ""}
        </div>

        <!-- RIGHT PANE: 5 Diverse Questions (Default ZH–EN, toggleable to ZH–VI) -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
            <h3 style="margin:0;font-size:16.5px;">📝 ${vi ? `Câu hỏi Đọc hiểu (${(ex.questions || []).length} câu)` : `Reading Questions (${(ex.questions || []).length})`}</h3>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" id="lrd-q-lang" title="Switch question language (ZH-EN / ZH-VI)">
                ${vi ? "🌐 Switch to ZH–EN" : "🇻🇳 Đổi sang Trung–Việt"}
              </button>
              ${prog ? `<span class="badge badge-jade">${vi ? `Điểm cao nhất: ${prog.bestScore}/100 · ${prog.attempts} lần` : `Best: ${prog.bestScore}/100 · ${prog.attempts}x`}</span>` : ""}
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;" id="lrd-q-list">
            ${(ex.questions || []).map((q, qi) => {
              const qf = pickQuestionFields(q);
              return `
              <div class="card-subtle" style="padding:12px;" data-qidx="${qi}">
                <div style="font-weight:700;font-size:14px;margin-bottom:8px;">${vi ? `Câu ${qi + 1}.` : `Question ${qi + 1}.`} ${QCore.escapeHtml(qf.text)}</div>
                ${q.type === "fill" ? `
                  <input class="input-field hanzi-text" id="lrd-ans-${qi}" data-pinyin-ime="true" placeholder="${vi ? "Nhập đáp án chữ Hán Giản thể..." : "Type Simplified Chinese answer..."}" />
                ` : `
                  <div style="display:flex;flex-direction:column;gap:6px;">
                    ${qf.options.map((opt) => `
                      <label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid var(--border-color);border-radius:8px;cursor:pointer;background:var(--bg-surface);font-size:13.5px;">
                        <input type="radio" name="lrd_q_${qi}" value="${QCore.escapeHtml(opt)}" />
                        <span>${QCore.escapeHtml(opt)}</span>
                      </label>
                    `).join("")}
                  </div>
                `}
                <div id="lrd-qfb-${qi}" style="margin-top:8px;font-size:13px;"></div>
              </div>
            `;
            }).join("")}
          </div>

          <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="lrd-submit">✅ ${vi ? "Nộp bài và nhận kết quả" : "Submit & Grade"}</button>
            <button class="btn btn-outline btn-sm" id="lrd-retry">🔄 ${vi ? "Làm lại" : "Retry"}</button>
          </div>

          <div id="lrd-summary" style="margin-top:14px;"></div>
        </div>
      </div>
    `;

    stage.querySelector("#lrd-py").onclick = () => { showPinyin = !showPinyin; renderReadingSplit(stage, lesson, ex, parentContainer); };
    stage.querySelector("#lrd-en").onclick = () => { showEn = !showEn; renderReadingSplit(stage, lesson, ex, parentContainer); };
    stage.querySelector("#lrd-vi").onclick = () => { showVi = !showVi; renderReadingSplit(stage, lesson, ex, parentContainer); };
    stage.querySelector("#lrd-speak").onclick = () => QCore.speakChinese(ex.chinese);
    stage.querySelector("#lrd-retry").onclick = () => renderReadingSplit(stage, lesson, ex, parentContainer);
    stage.querySelector("#lrd-q-lang").onclick = () => {
      QCore.toggleUiLang();
      if (window.QApp && typeof QApp.refreshTopbar === "function") QApp.refreshTopbar();
      if (window.QApp && typeof QApp.refreshCurrentView === "function") QApp.refreshCurrentView();
      else renderReadingSplit(stage, lesson, ex, parentContainer);
    };

    stage.querySelector("#lrd-submit").onclick = () => {
      const qs = ex.questions || [];
      let right = 0;
      const missed = [];
      qs.forEach((q, qi) => {
        const qf = pickQuestionFields(q);
        let userAns = "";
        if (q.type === "fill") {
          userAns = (stage.querySelector(`#lrd-ans-${qi}`).value || "").trim();
        } else {
          const checked = stage.querySelector(`input[name="lrd_q_${qi}"]:checked`);
          userAns = checked ? checked.value : "";
        }
        const norm = (s) => String(s || "").replace(/[。！？\s]/g, "");
        const ok = norm(userAns) === norm(qf.answer) || (q.answer && norm(userAns) === norm(q.answer));
        if (ok) right++;
        else missed.push(q.skillFocus || "detail");
        const fbEl = stage.querySelector(`#lrd-qfb-${qi}`);
        fbEl.innerHTML = ok
          ? `<div style="color:var(--primary);font-weight:700;">✅ ${vi ? "Chính xác!" : "Correct!"} ${QCore.escapeHtml(qf.explain)}</div>`
          : `<div style="color:var(--accent-red);">❌ ${vi ? "Chưa đúng" : "Incorrect"} (${vi ? "bạn chọn" : "selected"}: "${QCore.escapeHtml(userAns || (vi ? "Chưa trả lời" : "No answer"))}"). <strong>${vi ? "Đáp án đúng" : "Correct answer"}: ${QCore.escapeHtml(qf.answer)}</strong><br/><span style="color:var(--text-secondary);">💡 ${QCore.escapeHtml(qf.explain)}</span></div>`;
      });

      const score = qs.length ? Math.round((right / qs.length) * 100) : 100;
      lastWrongFocuses = missed;
      QCore.recordLessonExercise(ex.id, score, missed);
      QCore.updateSkillScore("reading", score);
      if (score >= 60 && !QCore.getState().readingCompleted.includes(ex.id)) {
        QCore.getState().readingCompleted.push(ex.id);
        QCore.saveState(true);
      }

      const sumBox = stage.querySelector("#lrd-summary");
      sumBox.innerHTML = `
        <div class="card-subtle" style="border:2px solid ${score >= 70 ? "var(--primary)" : "var(--accent-amber)"};">
          <strong style="font-size:16px;">🎯 ${vi ? `Kết quả: ${score}/100 điểm (${right}/${qs.length} câu đúng · ${qs.length - right} câu sai)` : `Result: ${score}/100 (${right}/${qs.length} correct · ${qs.length - right} missed)`}</strong>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:6px;">
            ${missed.length
              ? (vi ? `Điểm cần củng cố: <strong>${[...new Set(missed)].join(", ")}</strong>. Bấm nút bên dưới để AI tạo bài Reading mới nhắm đúng lỗ hổng này!` : `Focus areas to review: <strong>${[...new Set(missed)].join(", ")}</strong>. Click below to let AI generate a targeted practice set!`)
              : (vi ? "Xuất sắc! Bạn đã nắm chắc toàn bộ nội dung bài đọc." : "Excellent! You mastered this reading passage.")}
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" id="lrd-gen-more">✨ ${vi ? "AI – TẠO BÀI TẬP MỚI (Nhắm lỗi vừa sai)" : "AI – Generate Targeted Practice"}</button>
          </div>
        </div>
      `;
      sumBox.querySelector("#lrd-gen-more").onclick = () => parentContainer.querySelector("#ls-ai-gen-btn").click();
    };
  }

  /* ---------- LISTENING WITH REAL NEW HSK 1 (3.0) MP3 TRACKS ---------- */
  function renderListeningEx(stage, lesson, ex, parentContainer) {
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? "Chưa có bài nghe." : "No listening exercise yet."}</div>`; return; }
    const hintText = (!vi && ex.targetHint_en) ? ex.targetHint_en : (ex.targetHint || "");
    stage.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          <div>
            ${sourceTagBadge(ex.sourceTag)}
            <h3 style="margin:6px 0 0;">🎧 ${QCore.escapeHtml(ex.title)}</h3>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" id="llis-q-lang">${vi ? "🌐 ZH–EN" : "🇻🇳 Trung–Việt"}</button>
            ${[0.75, 1.0, 1.25].map((s) => `<button class="btn btn-outline btn-sm" data-lspd="${s}">x${s}</button>`).join("")}
          </div>
        </div>

        ${ex.audioUrl ? `
          <audio id="ls-mp3-player" controls src="${QCore.escapeHtml(QCore.resolveApiUrl(ex.audioUrl))}" style="width:100%;margin-bottom:12px;"></audio>
        ` : `
          <div style="margin-bottom:12px;">
            <button class="btn btn-primary" id="ls-tts-play">🔊 ${vi ? "Nghe bài đọc (Putonghua TTS)" : "Play Passage (Putonghua TTS)"}</button>
          </div>
        `}

        <div class="card-subtle" style="margin-bottom:14px;font-size:13.5px;">💡 ${QCore.escapeHtml(hintText)}</div>

        <div style="display:flex;flex-direction:column;gap:12px;">
          ${(ex.questions || []).map((q, qi) => {
            const qf = pickQuestionFields(q);
            return `
            <div class="card-subtle">
              <div style="font-weight:700;margin-bottom:8px;">${vi ? `Câu ${qi + 1}.` : `Question ${qi + 1}.`} ${QCore.escapeHtml(qf.text)}</div>
              <div style="display:flex;flex-direction:column;gap:6px;">
                ${qf.options.map((opt) => `
                  <label style="display:flex;gap:8px;align-items:center;cursor:pointer;font-size:13.5px;">
                    <input type="radio" name="llis_q_${qi}" value="${QCore.escapeHtml(opt)}" />
                    <span>${QCore.escapeHtml(opt)}</span>
                  </label>
                `).join("")}
              </div>
              <div id="llis-fb-${qi}" style="margin-top:6px;font-size:13px;"></div>
            </div>
          `;
          }).join("")}
        </div>

        <div style="margin-top:14px;display:flex;gap:8px;">
          <button class="btn btn-primary" id="llis-submit">✅ ${vi ? "Nộp bài nghe" : "Submit Listening"}</button>
        </div>
        <div id="llis-sum" style="margin-top:12px;"></div>
      </div>
    `;

    stage.querySelector("#llis-q-lang").onclick = () => {
      QCore.toggleUiLang();
      if (window.QApp && typeof QApp.refreshTopbar === "function") QApp.refreshTopbar();
      if (window.QApp && typeof QApp.refreshCurrentView === "function") QApp.refreshCurrentView();
    };

    const player = stage.querySelector("#ls-mp3-player");
    stage.querySelectorAll("[data-lspd]").forEach((b) => {
      b.onclick = () => {
        const rate = Number(b.getAttribute("data-lspd"));
        if (player) player.playbackRate = rate;
        else if (ex.audioText) QCore.speakChinese(ex.audioText, { rate });
      };
    });
    const ttsBtn = stage.querySelector("#ls-tts-play");
    if (ttsBtn) ttsBtn.onclick = () => QCore.speakChinese(ex.audioText || ex.chinese || "");

    stage.querySelector("#llis-submit").onclick = () => {
      const qs = ex.questions || [];
      let okCnt = 0;
      qs.forEach((q, qi) => {
        const qf = pickQuestionFields(q);
        const sel = stage.querySelector(`input[name="llis_q_${qi}"]:checked`);
        const val = sel ? sel.value : "";
        const ok = val === qf.answer || val === q.answer;
        if (ok) okCnt++;
        stage.querySelector(`#llis-fb-${qi}`).innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ ${vi ? "Chính xác!" : "Correct!"} ${QCore.escapeHtml(qf.explain)}</span>`
          : `<span style="color:var(--accent-red);">❌ ${vi ? "Đáp án đúng" : "Correct answer"}: <strong>${QCore.escapeHtml(qf.answer)}</strong> — ${QCore.escapeHtml(qf.explain)}</span>`;
      });
      const score = qs.length ? Math.round((okCnt / qs.length) * 100) : 100;
      QCore.recordLessonExercise(ex.id, score);
      QCore.updateSkillScore("listening", score);
      QCore.logDailyActivity("listeningCount", 1);
      stage.querySelector("#llis-sum").innerHTML = `<div class="card-subtle" style="border-color:var(--primary);"><strong>🎯 ${vi ? `Điểm bài nghe: ${score}/100 (${okCnt}/${qs.length} đúng)` : `Listening Score: ${score}/100 (${okCnt}/${qs.length} correct)`}</strong></div>`;
    };
  }

  /* ---------- VOCABULARY / GRAMMAR / WRITING / SPEAKING INSIDE LESSON ---------- */
  function renderVocabEx(stage, lesson) {
    const words = lesson.skills.vocabulary || [];
    const vi = isViMode();
    stage.innerHTML = `
      <div class="grid-2" style="gap:12px;">
        ${words.map((w) => `
          <div class="card" style="padding:16px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
              <span class="hanzi-text" style="font-size:28px;font-weight:700;">${QCore.escapeHtml(w.hanzi)}</span>
              <span class="pinyin-text" style="font-size:16px;color:var(--primary);font-weight:700;margin-left:8px;">${QCore.escapeHtml(w.pinyin)}</span>
              ${w.en ? `<div style="font-size:13.5px;color:var(--text-main);margin-top:4px;">🇬🇧 ${QCore.escapeHtml(w.en)}</div>` : ""}
              ${vi || !w.en ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">🇻🇳 ${QCore.escapeHtml(w.vi)}</div>` : ""}
            </div>
            <div style="display:flex;gap:6px;">
              <button class="icon-btn" data-lv-sp="${QCore.escapeHtml(w.hanzi)}">🔊</button>
              <button class="btn btn-outline btn-sm" data-lv-nb="${QCore.escapeHtml(w.hanzi)}">📒</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
    stage.querySelectorAll("[data-lv-sp]").forEach((b) => (b.onclick = () => QCore.speakChinese(b.getAttribute("data-lv-sp"))));
    stage.querySelectorAll("[data-lv-nb]").forEach((b) => {
      b.onclick = () => {
        const w = words.find((x) => x.hanzi === b.getAttribute("data-lv-nb"));
        if (w) QCore.addToNotebook({ category: "vocab", hanzi: w.hanzi, pinyin: w.pinyin, english: w.en || "", vietnamese: w.vi });
      };
    });
  }

  function renderGrammarEx(stage, lesson, ex) {
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? "Chưa có bài ngữ pháp." : "No grammar exercise yet."}</div>`; return; }
    const expText = (!vi && ex.explanation_en) ? ex.explanation_en : (ex.explanation || ex.focusReason || "");
    stage.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div>${sourceTagBadge(ex.sourceTag)}</div>
          <button class="btn btn-outline btn-sm" id="lgr-q-lang">${vi ? "🌐 ZH–EN" : "🇻🇳 Trung–Việt"}</button>
        </div>
        <h3 style="margin:6px 0;">🧩 ${QCore.escapeHtml(ex.title)}</h3>
        ${ex.formula ? `<div class="badge badge-amber" style="margin-bottom:8px;white-space:normal;">📐 ${QCore.escapeHtml(ex.formula)}</div>` : ""}
        <p style="font-size:14px;color:var(--text-secondary);">${QCore.escapeHtml(expText)}</p>
        ${(ex.questions || []).map((q, qi) => {
          const qf = pickQuestionFields(q);
          return `
          <div class="card-subtle" style="margin-bottom:10px;">
            <div style="font-weight:700;margin-bottom:6px;">${vi ? `Câu ${qi + 1}.` : `Question ${qi + 1}.`} ${QCore.escapeHtml(qf.text)}</div>
            ${q.type === "fill" ? `<input class="input-field hanzi-text" id="lgr-a-${qi}" />` : qf.options.map((o) => `<label style="display:block;margin:4px 0;cursor:pointer;"><input type="radio" name="lgr_${qi}" value="${QCore.escapeHtml(o)}"/> ${QCore.escapeHtml(o)}</label>`).join("")}
            <div id="lgr-fb-${qi}" style="margin-top:6px;font-size:13px;"></div>
          </div>
        `;
        }).join("")}
        <button class="btn btn-primary" id="lgr-sub">✅ ${vi ? "Kiểm tra ngữ pháp" : "Check Grammar"}</button>
      </div>
    `;
    stage.querySelector("#lgr-q-lang").onclick = () => {
      QCore.toggleUiLang();
      if (window.QApp && typeof QApp.refreshTopbar === "function") QApp.refreshTopbar();
      if (window.QApp && typeof QApp.refreshCurrentView === "function") QApp.refreshCurrentView();
    };
    stage.querySelector("#lgr-sub").onclick = () => {
      const qs = ex.questions || [];
      let right = 0;
      qs.forEach((q, qi) => {
        const qf = pickQuestionFields(q);
        const val = q.type === "fill" ? (stage.querySelector(`#lgr-a-${qi}`).value || "").trim() : ((stage.querySelector(`input[name="lgr_${qi}"]:checked`) || {}).value || "");
        const ok = val === qf.answer || val === q.answer;
        if (ok) right++;
        stage.querySelector(`#lgr-fb-${qi}`).innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ ${vi ? "Đúng!" : "Correct!"} ${QCore.escapeHtml(qf.explain)}</span>`
          : `<span style="color:var(--accent-red);">❌ ${vi ? "Đáp án đúng" : "Correct answer"}: ${QCore.escapeHtml(qf.answer)} — ${QCore.escapeHtml(qf.explain)}</span>`;
      });
      const score = qs.length ? Math.round((right / qs.length) * 100) : 100;
      QCore.recordLessonExercise(ex.id, score);
      QCore.updateSkillScore("grammar", score);
      QCore.logDailyActivity("grammarCount", 1);
    };
  }

  function renderWritingEx(stage, lesson, ex) {
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? "Chưa có bài viết." : "No writing exercise yet."}</div>`; return; }
    const promptTxt = (!vi && ex.prompt_en) ? ex.prompt_en : (ex.prompt || "");
    const titleTxt = (vi && ex.title_vi) ? ex.title_vi : (ex.title || "");
    stage.innerHTML = `
      <div class="card">
        ${sourceTagBadge(ex.sourceTag)}
        <h3 style="margin:6px 0;">🖋️ ${QCore.escapeHtml(titleTxt)}</h3>
        <div class="card-subtle" style="margin-bottom:12px;"><strong>${vi ? "Đề bài:" : "Prompt:"}</strong> ${QCore.escapeHtml(promptTxt)}</div>
        <textarea class="textarea-field hanzi-text" id="lwr-txt" rows="4" data-pinyin-ime="true" placeholder="${vi ? "Viết bài bằng Chữ Hán Giản thể..." : "Write in Simplified Chinese (Pinyin IME supported)..."}"></textarea>
        <button class="btn btn-primary" style="margin-top:10px;" id="lwr-sub">👩‍🏫 ${vi ? "Nộp bài & AI Chấm Rubric" : "Submit & AI Evaluate"}</button>
        <div id="lwr-out" style="margin-top:12px;"></div>
      </div>
    `;
    stage.querySelector("#lwr-sub").onclick = async () => {
      const text = (stage.querySelector("#lwr-txt").value || "").trim();
      if (!text) return;
      const out = stage.querySelector("#lwr-out");
      out.innerHTML = `<div class="card-subtle">⏳ ${vi ? "AI đang chấm bài viết theo rubric 7 tiêu chí..." : "AI is evaluating your Chinese writing..."}</div>`;
      const res = await window.QAiTutor.evaluateSentenceSmart({ text, prompt: promptTxt, targetWord: ex.targetWord || "", hskLevel: ex.hskLevel || 1 });
      QCore.recordLessonExercise(ex.id, res.score || 70);
      QCore.updateSkillScore("writing", res.score || 70);
      out.innerHTML = window.QAiTutor.renderSentenceEvaluationCard(res);
    };
  }

  function renderSpeakingEx(stage, lesson, ex) {
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? "Chưa có bài nói." : "No speaking exercise yet."}</div>`; return; }
    const promptTxt = (!vi && ex.prompt_en) ? ex.prompt_en : (ex.prompt || "");
    const titleTxt = (vi && ex.title_vi) ? ex.title_vi : (ex.title || "");
    stage.innerHTML = `
      <div class="card">
        ${sourceTagBadge(ex.sourceTag)}
        <h3 style="margin:6px 0;">🎙️ ${QCore.escapeHtml(titleTxt)}</h3>
        <div class="card-subtle" style="margin-bottom:12px;">
          <div>${QCore.escapeHtml(promptTxt)}</div>
          ${ex.sampleQuestion ? `<div class="hanzi-text" style="font-size:20px;font-weight:700;margin-top:8px;">${QCore.escapeHtml(ex.sampleQuestion)} <button class="btn btn-soft btn-sm" id="lspk-hear">🔊</button></div>` : ""}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <button class="btn btn-primary" id="lspk-rec">🎙️ ${vi ? "Ghi âm câu trả lời (5 giây)" : "Record Speaking (5s)"}</button>
        </div>
        <div id="lspk-out"></div>
      </div>
    `;
    const hear = stage.querySelector("#lspk-hear");
    if (hear) hear.onclick = () => QCore.speakChinese(ex.sampleQuestion);
    stage.querySelector("#lspk-rec").onclick = () => {
      const out = stage.querySelector("#lspk-out");
      out.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);">🔴 ${vi ? "Đang thu âm 5 giây..." : "Recording for 5 seconds..."}</div>`;
      QCore.captureLearnerVoice({
        durationMs: 5000,
        onAudioReady: (url, tr) => {
          QCore.recordLessonExercise(ex.id, 85);
          QCore.logDailyActivity("speakingMinutes", 1);
          out.innerHTML = `<div class="card-subtle"><audio controls src="${url}" style="width:100%;height:38px;margin-bottom:6px;"></audio><div>${tr ? `✅ ${vi ? "Nhận diện" : "Recognized"}: "${QCore.escapeHtml(tr)}"` : (vi ? "🎧 Đã lưu băng thu âm — hãy bấm Play đối chiếu phát âm!" : "🎧 Recording saved — press Play to review your pronunciation!")}</div></div>`;
        }
      });
    };
  }

  /* ---------- 3-LEVEL HIERARCHICAL SKILL FOLDER BROWSER (Skill -> Lesson Folder -> Exercise 1, 2, 3...) ---------- */
  const SKILL_META = {
    reading: { icon: "📰", en: "Reading", vi: "Luyện đọc", descEn: "Choose a Lesson folder, then pick one bite-sized reading exercise at a time.", descVi: "Chọn thư mục Lesson tương ứng giáo trình PDF, sau đó chọn từng bài đọc nhỏ (Bài 1, Bài 2, Bài 3...)." },
    listening: { icon: "🎧", en: "Listening", vi: "Luyện nghe", descEn: "Choose a Lesson folder to practice individual audio tracks & listening drills.", descVi: "Chọn thư mục Lesson để luyện từng bài nghe nhỏ (Bài 1, Bài 2...) theo đúng tiến độ mỗi ngày." },
    grammar: { icon: "🧩", en: "Grammar", vi: "Ngữ pháp", descEn: "Choose a Lesson folder to master one grammar point per exercise.", descVi: "Chọn thư mục Lesson để học từng điểm ngữ pháp chia nhỏ (Bài 1, Bài 2, Bài 3...)." },
    writing: { icon: "🖋️", en: "Writing", vi: "Luyện viết", descEn: "Choose a Lesson folder and complete one focused writing task at a time.", descVi: "Chọn thư mục Lesson và luyện từng bài viết ngắn (Bài 1, Bài 2, Bài 3...)." },
    speaking: { icon: "🎙️", en: "Speaking", vi: "Luyện nói", descEn: "Choose a Lesson folder for step-by-step shadowing and speaking drills.", descVi: "Chọn thư mục Lesson để luyện phát âm & phản xạ theo từng bài nhỏ." }
  };

  const folderState = {}; // skill -> { view: "levels"|"lessons"|"exercises"|"practice", hskLevel: 1, lessonIdx: 0, exIdx: 0, mode: "lessons"|"classic" }
  let cachedOverview = null;

  function getFolderState(skill) {
    if (!folderState[skill]) {
      folderState[skill] = { view: "levels", hskLevel: 1, lessonIdx: 0, exIdx: 0, mode: "lessons" };
    }
    return folderState[skill];
  }

  async function ensureOverviewLoaded() {
    if (cachedOverview) return cachedOverview;
    if (!QCore.getServerHealth().ok) return null;
    try {
      cachedOverview = await QCore.apiFetch("/api/pdf/overview");
      return cachedOverview;
    } catch (_) {
      return null;
    }
  }

  async function ensureCourseLoaded(params = {}) {
    const reqLvl = params && params.hskLevel ? Number(params.hskLevel) : activeHsk;
    const reqCid = (params && params.courseId) || null;
    const needFetch = !activeCourse || reqLvl !== activeHsk || (reqCid && reqCid !== activeCourseId);
    if (needFetch) {
      activeHsk = reqLvl;
      activeCourseId = reqCid;
    } else {
      return true;
    }
    if (!QCore.getServerHealth().ok) return false;
    try {
      const qs = activeCourseId
        ? `courseId=${encodeURIComponent(activeCourseId)}`
        : `hskLevel=${encodeURIComponent(activeHsk)}`;
      const res = await QCore.apiFetch(`/api/pdf/course?${qs}`);
      activeCourse = res.course;
      return Boolean(activeCourse);
    } catch (_) {
      return false;
    }
  }

  async function renderSkillFolder(container, skillKey, params = {}, legacyRenderer = null) {
    const fState = getFolderState(skillKey);
    if (params && params.resetFolder) {
      fState.mode = "lessons";
      if (params.hskLevel || params.courseId) {
        fState.hskLevel = Number(params.hskLevel || 1);
        fState.view = "lessons";
      } else {
        fState.view = "levels";
      }
    }
    if (params && (params.materialId || params.classic)) {
      fState.mode = "classic";
    }

    const vi = isViMode();
    if (fState.mode === "classic" && typeof legacyRenderer === "function") {
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
          <div class="tabs-bar">
            <button class="tab-pill" id="sf-tab-lessons">📁 ${vi ? "Thư mục HSK (3.0)" : "HSK Folders (3.0)"}</button>
            <button class="tab-pill active" id="sf-tab-classic">📚 ${vi ? "Luyện tập tổng hợp & Tài liệu cá nhân" : "Classic & Personal Materials"}</button>
          </div>
        </div>
        <div id="sf-legacy-host"></div>
      `;
      container.querySelector("#sf-tab-lessons").onclick = () => {
        fState.mode = "lessons";
        renderSkillFolder(container, skillKey, {}, legacyRenderer);
      };
      legacyRenderer(container.querySelector("#sf-legacy-host"));
      return;
    }

    if (fState.view === "levels") {
      if (!cachedOverview) {
        container.innerHTML = `<div class="card" style="text-align:center;padding:38px;">⏳ ${vi ? "Đang tải danh sách thư mục HSK..." : "Loading HSK folders..."}</div>`;
      }
      await ensureOverviewLoaded();
      drawSkillFolderView(container, skillKey, legacyRenderer);
      return;
    }

    if (!activeCourse || (params && params.hskLevel && Number(params.hskLevel) !== activeHsk)) {
      container.innerHTML = `<div class="card" style="text-align:center;padding:38px;">⏳ ${vi ? "Đang mở thư mục bài học..." : "Loading lesson folders..."}</div>`;
    }
    const loaded = await ensureCourseLoaded({ hskLevel: fState.hskLevel, courseId: params && params.courseId });
    if (!loaded || !activeCourse) {
      if (typeof legacyRenderer === "function") {
        legacyRenderer(container);
        return;
      }
      container.innerHTML = `<div class="card" style="padding:28px;">⚠️ ${vi ? "Không tải được khóa học PDF." : "Unable to load PDF course."}</div>`;
      return;
    }

    drawSkillFolderView(container, skillKey, legacyRenderer);
  }

  function drawSkillFolderView(container, skillKey, legacyRenderer) {
    const vi = isViMode();
    const meta = SKILL_META[skillKey] || SKILL_META.reading;
    const fState = getFolderState(skillKey);
    const st = QCore.getState();
    const lp = (st && st.lessonProgress) || {};

    const topSwitcher = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
        <div class="tabs-bar">
          <button class="tab-pill active" id="sf-tab-lessons">📁 ${vi ? "Thư mục HSK (3.0)" : "HSK Folders (3.0)"}</button>
          ${typeof legacyRenderer === "function" ? `<button class="tab-pill" id="sf-tab-classic">📚 ${vi ? "Luyện tập tổng hợp & Tài liệu cá nhân" : "Classic & Personal Materials"}</button>` : ""}
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          ${fState.view !== "levels" && activeCourse ? `<span class="badge badge-jade">${QCore.escapeHtml(activeCourse.code || `HSK ${fState.hskLevel} (3.0)`)}</span>` : ""}
          <button class="btn btn-outline btn-sm" id="sf-goto-pdf">📄 ${vi ? "Quản lý AI PDF" : "AI PDF Manager"}</button>
        </div>
      </div>
    `;

    // LEVEL 0: Top-Level HSK Level Folders (HSK 1, HSK 2, ..., HSK 7–9)
    if (fState.view === "levels") {
      const levels = (cachedOverview && cachedOverview.levels) || [
        { level: 1, code: "HSK 1", title: "HSK 3.0 – Level 1", unlocked: true },
        { level: 2, code: "HSK 2", title: "HSK 3.0 – Level 2", unlocked: false },
        { level: 3, code: "HSK 3", title: "HSK 3.0 – Level 3", unlocked: false },
        { level: 4, code: "HSK 4", title: "HSK 3.0 – Level 4", unlocked: false },
        { level: 5, code: "HSK 5", title: "HSK 3.0 – Level 5", unlocked: false },
        { level: 6, code: "HSK 6", title: "HSK 3.0 – Level 6", unlocked: false },
        { level: 7, code: "HSK 7–9", title: "HSK 3.0 – Level 7–9", unlocked: false }
      ];
      container.innerHTML = `
        ${topSwitcher}
        <div class="page-header" style="margin-bottom:14px;">
          <div>
            <h2 style="margin:0;">${meta.icon} ${vi ? meta.vi : meta.en} — ${vi ? "Chọn cấp độ HSK" : "Select HSK Folder"}</h2>
            <p style="margin:4px 0 0;">${vi ? "Mở thư mục cấp độ (ví dụ HSK 1) để xem các Lesson và bài tập nhỏ bên trong." : "Open an HSK level folder (e.g. HSK 1) to browse Lessons and bite-sized exercises."}</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;">
          ${levels.map((lv) => `
            <div class="card" ${lv.unlocked ? `data-open-hsk="${lv.level}"` : `data-locked-hsk="${lv.level}"`} style="padding:20px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:12px;border-color:${lv.unlocked ? "var(--primary)" : "var(--border-color)"};opacity:${lv.unlocked ? "1" : "0.72"};">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <span style="font-size:28px;">${lv.unlocked ? "📁" : "🔒"}</span>
                  <span class="badge ${lv.unlocked ? "badge-jade" : "badge-amber"}">${lv.unlocked ? (vi ? "Đã mở khóa" : "Unlocked") : (vi ? "Đang khóa" : "Locked")}</span>
                </div>
                <div style="font-weight:800;font-size:20px;color:${lv.unlocked ? "var(--primary)" : "var(--text-muted)"};">${QCore.escapeHtml(lv.code)}</div>
                <div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">${QCore.escapeHtml(lv.title || "")}</div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--border-color);font-size:13px;">
                ${lv.unlocked
                  ? `<span style="color:var(--text-secondary);">📚 ${lv.level === 1 ? "15 Lessons" : (vi ? "Khóa học đã xuất bản" : "Published course")}</span><strong style="color:var(--primary);">${vi ? "Mở thư mục →" : "Open Folder →"}</strong>`
                  : `<span style="color:var(--text-muted);">${vi ? "Tải PDF để mở khóa" : "Upload PDF to unlock"}</span><strong style="color:var(--text-secondary);">📄 PDF →</strong>`}
              </div>
            </div>
          `).join("")}
        </div>
      `;

      bindCommonFolderHeader(container, skillKey, legacyRenderer);
      container.querySelectorAll("[data-open-hsk]").forEach((card) => {
        card.onclick = async () => {
          fState.hskLevel = Number(card.getAttribute("data-open-hsk"));
          fState.view = "lessons";
          container.innerHTML = `<div class="card" style="text-align:center;padding:38px;">⏳ ${vi ? `Đang mở thư mục HSK ${fState.hskLevel}...` : `Opening HSK ${fState.hskLevel} folder...`}</div>`;
          await ensureCourseLoaded({ hskLevel: fState.hskLevel });
          drawSkillFolderView(container, skillKey, legacyRenderer);
        };
      });
      container.querySelectorAll("[data-locked-hsk]").forEach((card) => {
        card.onclick = () => {
          QCore.showToast(vi ? "Hãy tải PDF giáo trình tương ứng trong AI PDF · HSK 3.0 để mở khóa cấp độ này!" : "Upload the corresponding PDF in AI PDF · HSK 3.0 to unlock this HSK level!");
          window.QApp.navigate("ai-pdf");
        };
      });
      return;
    }

    const lessons = (activeCourse && activeCourse.lessons) || [];
    if (fState.lessonIdx >= lessons.length) fState.lessonIdx = 0;

    // LEVEL 1: Clean Lesson Folder Grid (Lesson 1 .. Lesson 15) inside chosen HSK Level
    if (fState.view === "lessons") {
      container.innerHTML = `
        ${topSwitcher}
        <div class="page-header" style="margin-bottom:14px;">
          <div>
            <button class="btn btn-outline btn-sm" id="sf-back-levels" style="margin-bottom:8px;">← ${vi ? "Quay lại thư mục HSK" : "Back to HSK Folders"}</button>
            <h2 style="margin:0;">📁 ${QCore.escapeHtml(activeCourse.code || `HSK ${fState.hskLevel}`)} · ${meta.icon} ${vi ? meta.vi : meta.en} — ${vi ? "Thư mục Lesson" : "Lesson Folders"}</h2>
            <p style="margin:4px 0 0;">${vi ? meta.descVi : meta.descEn}</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">
          ${lessons.map((l, idx) => {
            const exs = Array.isArray(l.skills && l.skills[skillKey]) ? l.skills[skillKey] : [];
            const doneCnt = exs.filter((e) => lp[e.id] && lp[e.id].status === "completed").length;
            const pct = exs.length ? Math.round((doneCnt / exs.length) * 100) : 0;
            return `
              <div class="card" data-open-lfolder="${idx}" style="padding:16px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:10px;border-color:${pct === 100 && exs.length ? "var(--primary)" : "var(--border-color)"};transition:transform .15s ease;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">
                    <span class="badge ${pct === 100 && exs.length ? "badge-jade" : "badge-blue"}">📁 Lesson ${l.lessonNum}</span>
                    <span style="font-size:12px;font-weight:700;color:${doneCnt > 0 ? "var(--primary)" : "var(--text-muted)"};">${doneCnt}/${exs.length} ${vi ? "bài xong" : "done"}</span>
                  </div>
                  <div style="font-weight:700;font-size:15px;line-height:1.45;">${QCore.escapeHtml(l.title.replace(/^Lesson\s*\d+:\s*/i, ""))}</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--border-color);font-size:12.5px;color:var(--text-secondary);">
                  <span>📄 ${exs.length} ${vi ? "bài tập nhỏ" : "exercises"}</span>
                  <strong style="color:var(--primary);">${vi ? "Mở thư mục →" : "Open →"}</strong>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      bindCommonFolderHeader(container, skillKey, legacyRenderer);
      container.querySelector("#sf-back-levels").onclick = () => {
        fState.view = "levels";
        drawSkillFolderView(container, skillKey, legacyRenderer);
      };
      container.querySelectorAll("[data-open-lfolder]").forEach((card) => {
        card.onclick = () => {
          fState.lessonIdx = Number(card.getAttribute("data-open-lfolder"));
          fState.view = "exercises";
          drawSkillFolderView(container, skillKey, legacyRenderer);
        };
      });
      return;
    }

    const lesson = lessons[fState.lessonIdx] || lessons[0];
    const exList = (lesson && lesson.skills && Array.isArray(lesson.skills[skillKey])) ? lesson.skills[skillKey] : [];

    // LEVEL 2: Bite-Sized Exercise List inside selected Lesson (Bài 1, Bài 2, Bài 3...)
    if (fState.view === "exercises") {
      container.innerHTML = `
        ${topSwitcher}
        <div class="card" style="padding:16px;margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div>
              <button class="btn btn-outline btn-sm" id="sf-back-lessons" style="margin-bottom:8px;">← ${vi ? `Quay lại danh sách Lesson ${meta.vi}` : `Back to ${meta.en} Lessons`}</button>
              <h2 style="margin:0;font-size:19px;">📁 ${QCore.escapeHtml(lesson.title)} — ${meta.icon} ${vi ? meta.vi : meta.en}</h2>
              <p style="margin:4px 0 0;font-size:13px;color:var(--text-secondary);">
                ${vi ? `Chọn 1 bài tập nhỏ bên dưới để học tập trung (tổng ${exList.length} bài):` : `Pick one focused exercise below to study at your own pace (${exList.length} exercises):`}
              </p>
            </div>
            <button class="btn btn-primary btn-sm" id="sf-ai-gen-ex">✨ ${vi ? `AI – Tạo thêm Bài ${exList.length + 1}` : `AI – Generate Exercise ${exList.length + 1}`}</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">
          ${exList.map((ex, idx) => {
            const rec = lp[ex.id];
            const exTitle = (vi && ex.title_vi) ? ex.title_vi : (ex.title || `${vi ? "Bài" : "Exercise"} ${idx + 1}`);
            const qCnt = Array.isArray(ex.questions) ? ex.questions.length : 0;
            return `
              <div class="card" data-open-ex="${idx}" style="padding:18px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:12px;border-color:${rec && rec.status === "completed" ? "var(--primary)" : "var(--border-color)"};">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
                    <span class="badge badge-jade">${vi ? `Bài ${idx + 1}` : `Exercise ${idx + 1}`}</span>
                    ${rec
                      ? `<span class="badge ${rec.status === "completed" ? "badge-jade" : "badge-amber"}">${rec.status === "completed" ? "✅" : "🟡"} ${rec.bestScore}/100</span>`
                      : `<span style="font-size:12px;color:var(--text-muted);">${vi ? "Chưa làm" : "Not started"}</span>`}
                  </div>
                  <div style="font-weight:700;font-size:15.5px;line-height:1.45;margin-bottom:6px;">${QCore.escapeHtml(exTitle)}</div>
                  <div style="font-size:12.5px;color:var(--text-muted);">
                    ${qCnt ? `📝 ${qCnt} ${vi ? "câu hỏi" : "questions"}` : (skillKey === "writing" ? (vi ? "🖋️ Luyện viết & AI chấm điểm" : "🖋️ Writing & AI Rubric") : (vi ? "🎙️ Luyện nói & Thu âm" : "🎙️ Speaking & Audio Check"))}
                  </div>
                </div>
                <div style="display:flex;justify-content:flex-end;">
                  <button class="btn btn-primary btn-sm">${rec ? (vi ? "Làm lại →" : "Practice Again →") : (vi ? "Bắt đầu làm →" : "Start Exercise →")}</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      bindCommonFolderHeader(container, skillKey, legacyRenderer);
      container.querySelector("#sf-back-lessons").onclick = () => {
        fState.view = "lessons";
        drawSkillFolderView(container, skillKey, legacyRenderer);
      };
      container.querySelectorAll("[data-open-ex]").forEach((card) => {
        card.onclick = () => {
          fState.exIdx = Number(card.getAttribute("data-open-ex"));
          fState.view = "practice";
          drawSkillFolderView(container, skillKey, legacyRenderer);
        };
      });
      bindAiGenButton(container, "#sf-ai-gen-ex", lesson, skillKey, () => {
        fState.exIdx = lesson.skills[skillKey].length - 1;
        fState.view = "practice";
        drawSkillFolderView(container, skillKey, legacyRenderer);
      });
      return;
    }

    // LEVEL 3: Distraction-Free Single-Exercise Workspace (ONLY 1 exercise on screen!)
    if (fState.exIdx >= exList.length) fState.exIdx = 0;
    const currentEx = exList[fState.exIdx];
    const hasPrev = fState.exIdx > 0;
    const hasNext = fState.exIdx + 1 < exList.length;

    container.innerHTML = `
      <div class="card" style="padding:12px 16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" id="sf-back-exs">← ${vi ? `Danh sách bài tập (Lesson ${lesson.lessonNum})` : `Lesson ${lesson.lessonNum} Exercises`}</button>
          <span style="font-size:13.5px;font-weight:700;color:var(--text-secondary);">
            ${meta.icon} Lesson ${lesson.lessonNum} · ${vi ? `Bài ${fState.exIdx + 1}/${exList.length}` : `Exercise ${fState.exIdx + 1}/${exList.length}`}
          </span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${hasPrev ? `<button class="btn btn-outline btn-sm" id="sf-prev-ex">← ${vi ? "Bài trước" : "Prev"}</button>` : ""}
          ${hasNext ? `<button class="btn btn-soft btn-sm" id="sf-next-ex">${vi ? "Bài tiếp theo →" : "Next Exercise →"}</button>` : ""}
          <button class="btn btn-primary btn-sm" id="ls-ai-gen-btn">✨ ${vi ? "AI – Tạo bài mới" : "AI – New Exercise"}</button>
        </div>
      </div>
      <div id="sf-practice-stage"></div>
    `;

    container.querySelector("#sf-back-exs").onclick = () => {
      fState.view = "exercises";
      drawSkillFolderView(container, skillKey, legacyRenderer);
    };
    const prevBtn = container.querySelector("#sf-prev-ex");
    if (prevBtn) prevBtn.onclick = () => { fState.exIdx--; drawSkillFolderView(container, skillKey, legacyRenderer); };
    const nextBtn = container.querySelector("#sf-next-ex");
    if (nextBtn) nextBtn.onclick = () => { fState.exIdx++; drawSkillFolderView(container, skillKey, legacyRenderer); };

    bindAiGenButton(container, "#ls-ai-gen-btn", lesson, skillKey, () => {
      fState.exIdx = lesson.skills[skillKey].length - 1;
      drawSkillFolderView(container, skillKey, legacyRenderer);
    });

    const stage = container.querySelector("#sf-practice-stage");
    if (skillKey === "reading") renderReadingSplit(stage, lesson, currentEx, container);
    else if (skillKey === "listening") renderListeningEx(stage, lesson, currentEx, container);
    else if (skillKey === "grammar") renderGrammarEx(stage, lesson, currentEx, container);
    else if (skillKey === "writing") renderWritingEx(stage, lesson, currentEx, container);
    else renderSpeakingEx(stage, lesson, currentEx, container);
  }

  function bindCommonFolderHeader(container, skillKey, legacyRenderer) {
    const fState = getFolderState(skillKey);
    const classicBtn = container.querySelector("#sf-tab-classic");
    if (classicBtn && typeof legacyRenderer === "function") {
      classicBtn.onclick = () => {
        fState.mode = "classic";
        renderSkillFolder(container, skillKey, {}, legacyRenderer);
      };
    }
    const pdfBtn = container.querySelector("#sf-goto-pdf");
    if (pdfBtn) pdfBtn.onclick = () => window.QApp.navigate("ai-pdf");
  }

  function bindAiGenButton(container, selector, lesson, skillKey, onCreated) {
    const btn = container.querySelector(selector);
    if (!btn) return;
    btn.onclick = async () => {
      const vi = isViMode();
      btn.disabled = true;
      btn.textContent = vi ? "⏳ AI đang tạo bài tập mới..." : "⏳ Generating new exercise...";
      try {
        const currList = (lesson.skills && lesson.skills[skillKey]) || [];
        const newEx = await QCore.apiFetch("/api/ai/generate-lesson-exercise", {
          method: "POST",
          body: {
            skill: skillKey,
            hskLevel: (activeCourse && activeCourse.hskLevel) || 1,
            lessonTitle: lesson.title,
            vocabWords: (lesson.skills && lesson.skills.vocabulary) || [],
            wrongFocuses: lastWrongFocuses,
            variantIndex: currList.length + 1
          }
        });
        if (!Array.isArray(lesson.skills[skillKey])) lesson.skills[skillKey] = [];
        lesson.skills[skillKey].push(newEx);
        QCore.showToast(vi ? "✨ AI đã tạo xong bài tập mới!" : "✨ AI generated a new focused exercise!");
        onCreated();
      } catch (err) {
        QCore.showToast("❌ " + err.message);
        btn.disabled = false;
      }
    };
  }

  return {
    renderLessons,
    renderSkillFolder
  };
})();
