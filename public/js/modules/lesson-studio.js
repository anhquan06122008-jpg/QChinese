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
    if (!ex) { stage.innerHTML = `<div class="card">Chưa có bài viết.</div>`; return; }
    stage.innerHTML = `
      <div class="card">
        ${sourceTagBadge(ex.sourceTag)}
        <h3 style="margin:6px 0;">🖋️ ${QCore.escapeHtml(ex.title)}</h3>
        <div class="card-subtle" style="margin-bottom:12px;"><strong>Đề bài:</strong> ${QCore.escapeHtml(ex.prompt)}</div>
        <textarea class="textarea-field hanzi-text" id="lwr-txt" rows="4" data-pinyin-ime="true" placeholder="Viết bài bằng Chữ Hán Giản thể..."></textarea>
        <button class="btn btn-primary" style="margin-top:10px;" id="lwr-sub">👩‍🏫 Nộp bài & AI Chấm Rubric</button>
        <div id="lwr-out" style="margin-top:12px;"></div>
      </div>
    `;
    stage.querySelector("#lwr-sub").onclick = async () => {
      const text = (stage.querySelector("#lwr-txt").value || "").trim();
      if (!text) return;
      const out = stage.querySelector("#lwr-out");
      out.innerHTML = `<div class="card-subtle">⏳ AI đang chấm bài viết theo rubric 7 tiêu chí...</div>`;
      const res = await window.QAiTutor.evaluateSentenceSmart({ text, prompt: ex.prompt, targetWord: ex.targetWord || "", hskLevel: ex.hskLevel || 1 });
      QCore.recordLessonExercise(ex.id, res.score || 70);
      QCore.updateSkillScore("writing", res.score || 70);
      out.innerHTML = window.QAiTutor.renderSentenceEvaluationCard(res);
    };
  }

  function renderSpeakingEx(stage, lesson, ex) {
    if (!ex) { stage.innerHTML = `<div class="card">Chưa có bài nói.</div>`; return; }
    stage.innerHTML = `
      <div class="card">
        ${sourceTagBadge(ex.sourceTag)}
        <h3 style="margin:6px 0;">🎙️ ${QCore.escapeHtml(ex.title)}</h3>
        <div class="card-subtle" style="margin-bottom:12px;">
          <div>${QCore.escapeHtml(ex.prompt)}</div>
          ${ex.sampleQuestion ? `<div class="hanzi-text" style="font-size:20px;font-weight:700;margin-top:6px;">${QCore.escapeHtml(ex.sampleQuestion)} <button class="btn btn-soft btn-sm" id="lspk-hear">🔊</button></div>` : ""}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <button class="btn btn-primary" id="lspk-rec">🎙️ Ghi âm câu trả lời (5 giây)</button>
        </div>
        <div id="lspk-out"></div>
      </div>
    `;
    const hear = stage.querySelector("#lspk-hear");
    if (hear) hear.onclick = () => QCore.speakChinese(ex.sampleQuestion);
    stage.querySelector("#lspk-rec").onclick = () => {
      const out = stage.querySelector("#lspk-out");
      out.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);">🔴 Đang thu âm 5 giây...</div>`;
      QCore.captureLearnerVoice({
        durationMs: 5000,
        onAudioReady: (url, tr) => {
          QCore.recordLessonExercise(ex.id, 85);
          QCore.logDailyActivity("speakingMinutes", 1);
          out.innerHTML = `<div class="card-subtle"><audio controls src="${url}" style="width:100%;height:38px;margin-bottom:6px;"></audio><div>${tr ? `✅ Nhận diện: "${QCore.escapeHtml(tr)}"` : "🎧 Đã lưu băng thu âm — hãy bấm Play đối chiếu phát âm!"}</div></div>`;
        }
      });
    };
  }

  return {
    renderLessons
  };
})();
