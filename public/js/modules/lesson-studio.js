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
      await syncSharedExercisesForCourse(activeCourse);
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

  const SHARED_EX_LOCAL_KEY = "qchinese_shared_exercises_v1";

  function readLocalSharedExercises() {
    try {
      const raw = JSON.parse(localStorage.getItem(SHARED_EX_LOCAL_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (_) {
      return [];
    }
  }

  function saveLocalSharedExercise(ex) {
    if (!ex || !ex.id) return;
    try {
      const list = readLocalSharedExercises();
      const idx = list.findIndex((x) => x && x.id === ex.id);
      if (idx >= 0) list[idx] = ex;
      else list.push(ex);
      localStorage.setItem(SHARED_EX_LOCAL_KEY, JSON.stringify(list.slice(-300)));
    } catch (_) {}
  }

  function mergeSharedExercisesIntoCourse(course, items) {
    if (!course || !Array.isArray(course.lessons) || !Array.isArray(items) || !items.length) return false;
    let addedAny = false;
    const hskLvl = Number(course.hskLevel || 1);
    const byLessonNum = {};
    course.lessons.forEach((ls, i) => {
      byLessonNum[Number(ls.lessonNum || i + 1)] = ls;
    });
    const sorted = items.slice().sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    sorted.forEach((sh) => {
      if (!sh || !sh.id) return;
      if (Number(sh.hskLevel || 1) !== hskLvl) return;
      const ls = byLessonNum[Number(sh.lessonNum || 1)];
      const sk = String(sh.skill || "").toLowerCase();
      if (!ls || !["reading", "listening", "grammar", "writing", "speaking"].includes(sk)) return;
      ls.skills = ls.skills || {};
      if (!Array.isArray(ls.skills[sk])) ls.skills[sk] = [];
      if (!ls.skills[sk].some((x) => x && x.id === sh.id)) {
        ls.skills[sk].push(Object.assign({}, sh, { isSharedPublic: true }));
        addedAny = true;
      }
    });
    return addedAny;
  }

  async function syncSharedExercisesForCourse(course) {
    if (!course) return;
    const hskLvl = Number(course.hskLevel || 1);
    const collected = readLocalSharedExercises();

    // 1. Fetch from Backend SQLite shared pool
    if (QCore.getServerHealth().ok) {
      try {
        const bRes = await QCore.apiFetch(`/api/pdf/shared-exercises?hskLevel=${encodeURIComponent(hskLvl)}`);
        if (bRes && Array.isArray(bRes.items)) {
          bRes.items.forEach((it) => {
            collected.push(it);
            saveLocalSharedExercise(it);
          });
        }
      } catch (_) {}
    }

    // 2. Fetch from Supabase Cloud shared pool (24/7 cross-account & cross-device!)
    if (window.QCloud && typeof QCloud.fetchSharedExercises === "function") {
      try {
        const cRes = await QCloud.fetchSharedExercises(hskLvl);
        if (cRes && cRes.ok && Array.isArray(cRes.items)) {
          cRes.items.forEach((it) => {
            collected.push(it);
            saveLocalSharedExercise(it);
          });
        }
      } catch (_) {}
    }

    mergeSharedExercisesIntoCourse(course, collected);
  }

  function isExCompleted(rec, skillKey) {
    if (!rec || rec.status !== "completed") return false;
    if (skillKey === "writing" || skillKey === "speaking") return true;
    return Number(rec.bestScore || 0) >= 100;
  }

  function getLessonCompletion(lesson, lp) {
    const skillKeys = ["reading", "listening", "grammar", "writing", "speaking"];
    let total = 0;
    let done = 0;
    skillKeys.forEach((sk) => {
      const arr = (lesson.skills && Array.isArray(lesson.skills[sk])) ? lesson.skills[sk] : [];
      arr.forEach((ex) => {
        total += 1;
        if (isExCompleted(lp[ex.id], sk)) done += 1;
      });
    });
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  // Listen for live shared exercises published by friends on Supabase Realtime
  if (window.QCloud && typeof QCloud.onSharedExercise === "function") {
    QCloud.onSharedExercise((ex) => {
      saveLocalSharedExercise(ex);
      if (activeCourse && mergeSharedExercisesIntoCourse(activeCourse, [ex])) {
        const vi = isViMode();
        QCore.showToast(
          vi
            ? `🌐 ${ex.authorName || "Bạn học"} vừa chia sẻ bài mới vào Lesson ${ex.lessonNum}!`
            : `🌐 ${ex.authorName || "A learner"} shared a new exercise in Lesson ${ex.lessonNum}!`
        );
      }
    });
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
    stopActiveTtsPlayer();
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? 'Chưa có bài đọc. Bấm "✨ AI – TẠO BÀI TẬP MỚI" phía trên!' : 'No reading exercise yet. Click "✨ AI – Generate New Exercise" above!'}</div>`; return; }
    const st = QCore.getState();
    const prog = st.lessonProgress && st.lessonProgress[ex.id];
    const alignedPinyin = formatAlignedLines(ex.pinyin, ex.chinese);
    const alignedEn = formatAlignedLines(ex.english, ex.chinese);
    const alignedVi = formatAlignedLines(ex.vietnamese, ex.chinese);

    const rdTitle = (vi && ex.title_vi) ? ex.title_vi : (ex.title || "");
    const rdFocus = (!vi && ex.focusReason_en) ? ex.focusReason_en : (ex.focusReason || "");

    stage.innerHTML = `
      <div class="grid-2" style="align-items:start;gap:16px;">
        <!-- LEFT PANE: Chinese Passage + Line-Aligned Pinyin, English & Vietnamese -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
            <div>
              ${sourceTagBadge(ex.sourceTag)}
              <h3 style="margin:6px 0 0;font-size:17px;">${QCore.escapeHtml(rdTitle)}</h3>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn ${showPinyin ? "btn-primary" : "btn-outline"} btn-sm" id="lrd-py">ā Pinyin</button>
              <button class="btn ${showEn ? "btn-primary" : "btn-outline"} btn-sm" id="lrd-en">🇬🇧 English</button>
              <button class="btn ${showVi ? "btn-primary" : "btn-outline"} btn-sm" id="lrd-vi">🇻🇳 Dịch Việt</button>
              <button class="btn btn-soft btn-sm" id="lrd-speak">🔊 ${vi ? "Nghe đọc" : "Listen"}</button>
            </div>
          </div>

          ${rdFocus ? `<div class="vi-hint-banner" style="margin-bottom:10px;"><span>🎯</span><div>${QCore.escapeHtml(rdFocus)}</div></div>` : ""}

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

  /* ---------- LISTENING INSIDE AI PDF HSK 3.0 (QEnglish-style Full Audio Player + Collapsible Synced Transcript) ---------- */
  let lisPlaybackRate = 1.0;
  let lisVolume = 1.0;
  let lisMuted = false;
  let lisTranscriptOpen = false;
  let lisActiveLineIdx = -1;
  let activeTtsCleanup = null;

  function stopActiveTtsPlayer() {
    if (typeof activeTtsCleanup === "function") {
      try { activeTtsCleanup(); } catch (_) {}
      activeTtsCleanup = null;
    }
    if (window.QCore && typeof QCore.stopSpeech === "function") {
      QCore.stopSpeech();
    }
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  }

  function buildTranscriptLinesForEx(lesson, ex) {
    if (Array.isArray(ex.transcriptLines) && ex.transcriptLines.length > 0) {
      return ex.transcriptLines;
    }
    // CRITICAL: Never substitute the Reading passage onto a real MP3 track — prevents mismatched subtitles!
    if (ex.audioSource === "real_mp3" || ex.audioFile) {
      return [];
    }
    const rd0 = (lesson.skills && lesson.skills.reading && lesson.skills.reading[0]) || null;
    const rawZh = String(ex.audioText || (rd0 && rd0.chinese) || "").trim();
    const rawPy = String((rd0 && rd0.pinyin) || "").trim();
    const rawVi = String((rd0 && rd0.vietnamese) || "").trim();
    const rawEn = String((rd0 && rd0.english) || "").trim();
    if (!rawZh) return [];
    const zLines = rawZh.split("\n").map((x) => x.trim()).filter(Boolean);
    const pLines = rawPy.split("\n").map((x) => x.trim()).filter(Boolean);
    const vLines = rawVi.split("\n").map((x) => x.trim()).filter(Boolean);
    const eLines = rawEn.split("\n").map((x) => x.trim()).filter(Boolean);
    const spk = ["明安", "兰英", "王老师", "同学"];
    return zLines.map((zl, idx) => ({
      speaker: zLines.length > 1 ? spk[idx % 2] : "课文",
      chinese: zl,
      pinyin: pLines[idx] || "",
      vietnamese: vLines[idx] || "",
      english: eLines[idx] || ""
    }));
  }

  function resolveMp3Src(ex) {
    if (ex.audioFile) {
      const isFileProto = typeof window !== "undefined" && window.location && window.location.protocol === "file:";
      if (isFileProto) return `public/audio/hsk1/${ex.audioFile}`;
      const isLocal = typeof window !== "undefined" && window.location && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || "");
      if (isLocal) return `/audio/hsk1/${ex.audioFile}`;
      return `https://q-chinese.vercel.app/audio/hsk1/${ex.audioFile}`;
    }
    if (ex.audioUrl) return QCore.resolveApiUrl(ex.audioUrl);
    if (ex.staticAudioUrl) return ex.staticAudioUrl;
    return "";
  }

  function renderListeningEx(stage, lesson, ex, parentContainer) {
    stopActiveTtsPlayer();
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? "Chưa có bài nghe." : "No listening exercise yet."}</div>`; return; }
    lisActiveLineIdx = -1;
    const hintText = (!vi && ex.targetHint_en) ? ex.targetHint_en : (ex.targetHint || "");
    const tLines = buildTranscriptLinesForEx(lesson, ex);
    const mp3Src = resolveMp3Src(ex);
    const trackName = ex.audioFile || (ex.audioUrl ? ex.audioUrl.split("file=")[1] : "") || "HSK 3.0 Audio";
    const isAiTrans = ex.transcriptSource === "ai_generated";
    const isAsrVerified = ex.transcriptSource === "audio_asr_verified";

    stage.innerHTML = `
      <div class="card" style="padding:20px;">
        <!-- Header matching QEnglish Screenshot 5 -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
          <div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
              ${sourceTagBadge(ex.sourceTag)}
              <span class="badge badge-blue">📖 ${vi ? `Nguồn PDF (Tr.${lesson.sourcePage || 1})` : `PDF Source (P.${lesson.sourcePage || 1})`}</span>
            </div>
            <h3 style="margin:4px 0 0;font-size:18.5px;">🎧 [Listening – HSK ${activeCourse ? activeCourse.hskLevel : 1} – Lesson ${lesson.lessonNum}] ${QCore.escapeHtml(vi && ex.title_vi ? ex.title_vi : ex.title)}</h3>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" id="llis-q-lang">${vi ? "🌐 Switch to ZH–EN" : "🇻🇳 Đổi sang Trung–Việt"}</button>
          </div>
        </div>

        <!-- QEnglish-style Rich Audio Player Box -->
        <div style="padding:16px 18px;border-radius:16px;background:rgba(16,185,129,0.08);border:1.5px solid rgba(16,185,129,0.35);margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;font-size:13px;">
            <span style="font-weight:800;color:var(--primary);">
              🎧 ${mp3Src ? `Audio bản xứ gốc: <code style="color:var(--text-main);font-weight:700;">${QCore.escapeHtml(trackName)}</code>` : "Audio bài học (Putonghua TTS)"}
            </span>
            <span id="ls-audio-status" style="font-size:12px;font-weight:700;color:#10b981;">
              ✅ Audio Ready · Sẵn sàng phát giọng bản xứ
            </span>
          </div>

          ${mp3Src ? `
            <audio id="ls-mp3-player" preload="metadata" src="${QCore.escapeHtml(mp3Src)}" style="display:none;"></audio>
          ` : ""}

          <!-- Custom Interactive Control Bar (Play/Pause, Time, Draggable Seek Slider, Volume) -->
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 14px;border-radius:999px;background:var(--bg-surface);border:1px solid var(--border-color);margin-bottom:12px;">
            <button type="button" class="btn btn-primary btn-sm" id="ls-play-pause" style="border-radius:999px;min-width:42px;height:36px;padding:0 12px;font-size:14px;">
              ▶
            </button>

            <div style="font-family:monospace;font-size:13.5px;font-weight:700;color:var(--text-main);min-width:95px;text-align:center;">
              <span id="ls-time-curr">00:00</span> / <span id="ls-time-dur">01:28</span>
            </div>

            <input
              type="range"
              id="ls-seek-slider"
              min="0"
              max="100"
              step="0.1"
              value="0"
              aria-label="Thanh tiến trình âm thanh"
              style="flex:1;min-width:140px;accent-color:var(--primary);cursor:pointer;height:6px;"
            />

            <div style="display:flex;align-items:center;gap:6px;">
              <button type="button" class="btn btn-outline btn-sm" id="ls-mute-btn" style="padding:4px 8px;border:none;font-size:15px;" title="Bật/Tắt tiếng">🔊</button>
              <input
                type="range"
                id="ls-vol-slider"
                min="0"
                max="1"
                step="0.05"
                value="1"
                aria-label="Điều chỉnh âm lượng"
                style="width:72px;accent-color:var(--primary);cursor:pointer;height:5px;"
              />
            </div>
          </div>

          <!-- Rewind -5s & 5 Speed Controls (0.75x, 1.0x, 1.25x, 1.5x, 2.0x) -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <button type="button" class="btn btn-outline btn-sm" id="ls-rewind-5" style="font-weight:700;">
                ⏪ -5s (-5 giây)
              </button>
              ${[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => `
                <button
                  type="button"
                  class="btn ${lisPlaybackRate === spd ? "btn-primary" : "btn-outline"} btn-sm"
                  data-lspd="${spd}"
                  style="font-weight:700;min-width:54px;"
                >${spd}x</button>
              `).join("")}
            </div>
            <span style="font-size:12px;color:var(--text-muted);">
              Tốc độ hiện tại: <strong id="ls-rate-label" style="color:var(--primary);">${lisPlaybackRate}x</strong>
            </span>
          </div>
        </div>

        <!-- Collapsible Transcript / Phụ đề Box right below the Audio Player -->
        <div style="margin-bottom:16px;border-radius:14px;border:1px solid var(--border-color);background:var(--bg-subtle);overflow:hidden;">
          <div style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <button type="button" class="btn ${lisTranscriptOpen ? "btn-primary" : "btn-outline"} btn-sm" id="ls-toggle-transcript" style="font-weight:700;">
                📜 ${lisTranscriptOpen ? "ẨN PHỤ ĐỀ" : "HIỂN THỊ PHỤ ĐỀ"}
              </button>
              <span style="font-size:12.5px;color:var(--text-secondary);font-weight:600;">
                ${QCore.escapeHtml(ex.transcriptLabel || "Xem / Ẩn Transcript gốc từ bài học PDF")}
              </span>
            </div>
            <span class="badge ${isAiTrans ? "badge-amber" : "badge-jade"}" style="font-size:11.5px;">
              ${isAsrVerified ? "🎧 Phụ đề chuẩn khớp 100% Audio MP3 gốc" : (isAiTrans ? "🤖 Transcript AI tạo từ bài học (cho phép kiểm tra lại)" : "📄 Transcript từ giáo trình HSK 3.0")}
            </span>
          </div>

          <div id="ls-transcript-body" style="display:${lisTranscriptOpen ? "block" : "none"};padding:14px;border-top:1px solid var(--border-color);max-height:360px;overflow-y:auto;background:var(--bg-surface);">
            ${tLines.length > 0 ? `
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
                💡 Bấm vào từng câu bên dưới để phát âm thanh từ vị trí tương ứng. Khi audio chạy, câu đang phát sẽ tự động làm nổi bật:
              </div>
              <div style="display:flex;flex-direction:column;gap:8px;" id="ls-transcript-list">
                ${tLines.map((ln, lIdx) => `
                  <div
                    class="card-subtle ls-ts-row"
                    data-ts-idx="${lIdx}"
                    style="padding:10px 12px;cursor:pointer;transition:all .18s ease;border-left:4px solid ${lisActiveLineIdx === lIdx ? "var(--primary)" : "transparent"};background:${lisActiveLineIdx === lIdx ? "rgba(16,185,129,0.12)" : "var(--bg-subtle)"};"
                  >
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap;">
                      <div style="flex:1;min-width:200px;">
                        <span style="font-weight:800;color:var(--primary);font-size:13.5px;margin-right:6px;">${QCore.escapeHtml(ln.speaker || `Câu ${lIdx + 1}`)}:</span>
                        <span class="hanzi-text" style="font-size:18px;font-weight:700;">${QCore.escapeHtml(ln.chinese)}</span>
                        ${ln.pinyin ? `<div class="pinyin-text" style="font-size:13.5px;color:var(--primary);margin-top:3px;">${QCore.escapeHtml(ln.pinyin)}</div>` : ""}
                      </div>
                      <div style="font-size:13px;color:var(--text-secondary);text-align:right;">
                        ${ln.english ? `<div>🇬🇧 ${QCore.escapeHtml(ln.english)}</div>` : ""}
                        ${ln.vietnamese ? `<div>🇻🇳 ${QCore.escapeHtml(ln.vietnamese)}</div>` : ""}
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            ` : `
              <div style="font-size:13.5px;color:var(--text-muted);">Chưa có dữ liệu phụ đề cho bài nghe này.</div>
            `}
          </div>
        </div>

        <div class="card-subtle" style="margin-bottom:14px;font-size:13.5px;">💡 ${QCore.escapeHtml(hintText)}</div>

        <div style="display:flex;flex-direction:column;gap:12px;">
          ${(ex.questions || []).map((q, qi) => {
            const qf = pickQuestionFields(q);
            return `
            <div class="card-subtle">
              <div style="font-weight:700;margin-bottom:8px;">${vi ? `Câu ${qi + 1}.` : `Question ${qi + 1}.`} ${QCore.escapeHtml(qf.text)}</div>
              ${q.type === "fill" ? `
                <input class="input-field hanzi-text" id="llis-fill-${qi}" data-pinyin-ime="true" placeholder="${vi ? "Nhập đáp án chữ Hán Giản thể..." : "Type Simplified Chinese answer..."}" />
              ` : `
                <div style="display:flex;flex-direction:column;gap:6px;">
                  ${qf.options.map((opt) => `
                    <label style="display:flex;gap:8px;align-items:center;cursor:pointer;font-size:13.5px;">
                      <input type="radio" name="llis_q_${qi}" value="${QCore.escapeHtml(opt)}" />
                      <span>${QCore.escapeHtml(opt)}</span>
                    </label>
                  `).join("")}
                </div>
              `}
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

    // Toggle Transcript Button
    const togTransBtn = stage.querySelector("#ls-toggle-transcript");
    const transBody = stage.querySelector("#ls-transcript-body");
    if (togTransBtn && transBody) {
      togTransBtn.onclick = () => {
        lisTranscriptOpen = !lisTranscriptOpen;
        transBody.style.display = lisTranscriptOpen ? "block" : "none";
        togTransBtn.textContent = `📜 ${lisTranscriptOpen ? "ẨN PHỤ ĐỀ" : "HIỂN THỊ PHỤ ĐỀ"}`;
        togTransBtn.className = `btn ${lisTranscriptOpen ? "btn-primary" : "btn-outline"} btn-sm`;
      };
    }

    const player = stage.querySelector("#ls-mp3-player");
    const playPauseBtn = stage.querySelector("#ls-play-pause");
    const currTimeEl = stage.querySelector("#ls-time-curr");
    const durTimeEl = stage.querySelector("#ls-time-dur");
    const seekSlider = stage.querySelector("#ls-seek-slider");
    const volSlider = stage.querySelector("#ls-vol-slider");
    const muteBtn = stage.querySelector("#ls-mute-btn");
    const rewindBtn = stage.querySelector("#ls-rewind-5");
    const statusEl = stage.querySelector("#ls-audio-status");

    function highlightTranscriptRow(activeIdx, force) {
      if (!force && activeIdx === lisActiveLineIdx) return;
      lisActiveLineIdx = activeIdx;
      const rows = stage.querySelectorAll(".ls-ts-row");
      rows.forEach((r, idx) => {
        const isAct = idx === activeIdx;
        r.setAttribute("data-active", isAct ? "true" : "false");
        r.style.borderLeftColor = isAct ? "var(--primary)" : "transparent";
        r.style.background = isAct ? "rgba(16,185,129,0.18)" : "var(--bg-subtle)";
        r.style.boxShadow = isAct ? "0 0 0 1.5px rgba(16,185,129,0.55)" : "none";
        if (isAct && lisTranscriptOpen) {
          r.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }

    // Apply saved volume/mute UI state
    if (volSlider) volSlider.value = String(lisMuted ? 0 : lisVolume);
    if (muteBtn) muteBtn.textContent = (lisMuted || lisVolume === 0) ? "🔇" : "🔊";

    // Controller hook for speed & transcript-row clicks (works identically for MP3 AND TTS!)
    let onSpeedChanged = null;
    let onTranscriptRowClicked = null;

    if (player) {
      player.playbackRate = lisPlaybackRate;
      player.volume = lisVolume;
      player.muted = lisMuted;

      // Fallback to static path if API route fails (e.g. offline or static server)
      player.addEventListener("error", () => {
        if (ex.audioFile && !player.getAttribute("data-retried-static")) {
          player.setAttribute("data-retried-static", "1");
          player.src = `audio/hsk1/${ex.audioFile}`;
          player.load();
        } else if (ex.audioFile && player.getAttribute("data-retried-static") === "1") {
          player.setAttribute("data-retried-static", "2");
          player.src = `public/audio/hsk1/${ex.audioFile}`;
          player.load();
        }
      });

      player.addEventListener("loadedmetadata", () => {
        if (player.duration && isFinite(player.duration)) {
          durTimeEl.textContent = fmtTime(player.duration);
          seekSlider.max = String(player.duration);
        }
      });

      player.addEventListener("timeupdate", () => {
        currTimeEl.textContent = fmtTime(player.currentTime);
        if (player.duration && isFinite(player.duration)) {
          durTimeEl.textContent = fmtTime(player.duration);
          seekSlider.max = String(player.duration);
          seekSlider.value = String(player.currentTime);
          if (tLines.length > 0) {
            const ratio = player.currentTime / Math.max(0.1, player.duration);
            const idx = Math.min(tLines.length - 1, Math.floor(ratio * tLines.length));
            highlightTranscriptRow(idx);
          }
        }
      });

      player.addEventListener("play", () => {
        playPauseBtn.textContent = "⏸";
        if (statusEl) statusEl.textContent = `🔊 Đang phát (${player.playbackRate}x)`;
      });

      player.addEventListener("pause", () => {
        playPauseBtn.textContent = "▶";
        if (statusEl) statusEl.textContent = "⏸ Đã tạm dừng";
      });

      player.addEventListener("ended", () => {
        playPauseBtn.textContent = "▶";
        highlightTranscriptRow(-1, true);
        if (statusEl) statusEl.textContent = "✅ Đã phát xong";
      });

      playPauseBtn.onclick = () => {
        if (player.paused) {
          player.playbackRate = lisPlaybackRate;
          player.play().catch(() => {
            QCore.speakChinese(tLines.map((x) => x.chinese).join("。"), { rate: lisPlaybackRate, volume: lisMuted ? 0 : lisVolume });
          });
        } else {
          player.pause();
        }
      };

      seekSlider.addEventListener("input", () => {
        const targetSec = Number(seekSlider.value);
        currTimeEl.textContent = fmtTime(targetSec);
        if (player.duration && isFinite(player.duration)) {
          player.currentTime = targetSec;
          if (tLines.length > 0) {
            const ratio = targetSec / Math.max(0.1, player.duration);
            highlightTranscriptRow(Math.min(tLines.length - 1, Math.floor(ratio * tLines.length)), true);
          }
        }
      });

      rewindBtn.onclick = () => {
        player.currentTime = Math.max(0, (player.currentTime || 0) - 5);
        currTimeEl.textContent = fmtTime(player.currentTime);
      };

      volSlider.addEventListener("input", () => {
        lisVolume = Number(volSlider.value);
        lisMuted = lisVolume === 0;
        player.volume = lisVolume;
        player.muted = lisMuted;
        muteBtn.textContent = lisMuted ? "🔇" : "🔊";
      });

      muteBtn.onclick = () => {
        lisMuted = !lisMuted;
        player.muted = lisMuted;
        muteBtn.textContent = lisMuted ? "🔇" : "🔊";
        if (volSlider) volSlider.value = String(lisMuted ? 0 : (lisVolume || 1));
      };

      onSpeedChanged = (rate) => {
        player.playbackRate = rate;
        if (!player.paused && statusEl) statusEl.textContent = `🔊 Đang phát (${rate}x)`;
      };

      onTranscriptRowClicked = (idx) => {
        highlightTranscriptRow(idx, true);
        if (player.duration && isFinite(player.duration) && tLines.length > 0) {
          player.currentTime = (idx / tLines.length) * player.duration;
          player.playbackRate = lisPlaybackRate;
          player.play().catch(() => {
            if (tLines[idx]) QCore.speakChinese(tLines[idx].chinese, { rate: lisPlaybackRate, volume: lisMuted ? 0 : lisVolume });
          });
        } else if (tLines[idx]) {
          QCore.speakChinese(tLines[idx].chinese, { rate: lisPlaybackRate, volume: lisMuted ? 0 : lisVolume });
        }
      };
    } else {
      // FULL INTERACTIVE SENTENCE-SYNCED TTS PLAYER (for AI-generated Listening exercises!)
      const ttsLines = tLines.length > 0
        ? tLines
        : (ex.audioText ? [{ speaker: "AI", chinese: ex.audioText, pinyin: "", english: "", vietnamese: "" }] : []);

      let ttsSegments = [];
      let ttsTotalDur = 15;
      let ttsCurrentTime = 0;
      let ttsCurrentIdx = 0;
      let ttsIsPlaying = false;
      let ttsRunToken = 0;
      let ttsTimer = null;

      function computeTtsSegments(rate) {
        const effRate = Math.max(0.5, Math.min(2.0, Number(rate) || 1.0));
        let cursor = 0;
        ttsSegments = ttsLines.map((ln, idx) => {
          const chLen = Math.max(6, String(ln.chinese || "").replace(/\s+/g, "").length);
          const dur = Math.max(2.0, (chLen * 0.30) / effRate);
          const seg = { idx, start: cursor, end: cursor + dur, dur };
          cursor += dur;
          return seg;
        });
        ttsTotalDur = Math.max(4, cursor);
        durTimeEl.textContent = fmtTime(ttsTotalDur);
        seekSlider.max = String(Number(ttsTotalDur.toFixed(2)));
      }

      function segIndexForTime(sec) {
        if (!ttsSegments.length) return 0;
        for (let i = 0; i < ttsSegments.length; i++) {
          if (sec < ttsSegments[i].end - 0.05) return i;
        }
        return ttsSegments.length - 1;
      }

      function syncTtsUi() {
        const clamped = Math.max(0, Math.min(ttsTotalDur, ttsCurrentTime));
        currTimeEl.textContent = fmtTime(clamped);
        seekSlider.value = String(Number(clamped.toFixed(2)));
      }

      function clearTtsTimer() {
        if (ttsTimer) {
          clearInterval(ttsTimer);
          ttsTimer = null;
        }
      }

      function ttsPause(markEnded) {
        ttsRunToken += 1;
        ttsIsPlaying = false;
        clearTtsTimer();
        if (window.QCore && typeof QCore.stopSpeech === "function") QCore.stopSpeech();
        playPauseBtn.textContent = "▶";
        if (markEnded) {
          ttsCurrentTime = ttsTotalDur;
          ttsCurrentIdx = 0;
          syncTtsUi();
          highlightTranscriptRow(-1, true);
          if (statusEl) statusEl.textContent = "✅ Đã phát xong";
        } else {
          if (statusEl) statusEl.textContent = "⏸ Đã tạm dừng";
        }
      }

      function ttsSpeakLine(idx, myToken) {
        if (myToken !== ttsRunToken || !ttsIsPlaying) return;
        if (idx >= ttsLines.length) {
          ttsPause(true);
          return;
        }
        ttsCurrentIdx = idx;
        const seg = ttsSegments[idx] || { start: 0, end: ttsTotalDur, dur: 3 };
        ttsCurrentTime = seg.start;
        syncTtsUi();
        highlightTranscriptRow(idx, true);
        if (statusEl) statusEl.textContent = `🔊 Đang phát câu ${idx + 1}/${ttsLines.length} (${lisPlaybackRate}x)`;

        clearTtsTimer();
        const startedAt = Date.now();
        ttsTimer = setInterval(() => {
          if (myToken !== ttsRunToken || !ttsIsPlaying) {
            clearTtsTimer();
            return;
          }
          const elapsed = (Date.now() - startedAt) / 1000;
          ttsCurrentTime = Math.min(seg.end - 0.05, seg.start + elapsed);
          syncTtsUi();
        }, 100);

        const effVol = lisMuted ? 0 : lisVolume;
        QCore.speakChinese(ttsLines[idx].chinese, {
          rate: lisPlaybackRate,
          volume: effVol,
          onStart: () => {
            if (myToken === ttsRunToken && ttsIsPlaying) {
              highlightTranscriptRow(idx, true);
            }
          },
          onEnd: () => {
            if (myToken !== ttsRunToken || !ttsIsPlaying) return;
            clearTtsTimer();
            ttsCurrentTime = seg.end;
            syncTtsUi();
            setTimeout(() => {
              if (myToken === ttsRunToken && ttsIsPlaying) {
                ttsSpeakLine(idx + 1, myToken);
              }
            }, 220);
          }
        });
      }

      function ttsStartFromIndex(idx) {
        if (!ttsLines.length) return;
        ttsRunToken += 1;
        const myToken = ttsRunToken;
        ttsIsPlaying = true;
        playPauseBtn.textContent = "⏸";
        ttsSpeakLine(Math.max(0, Math.min(ttsLines.length - 1, idx)), myToken);
      }

      computeTtsSegments(lisPlaybackRate);
      syncTtsUi();

      activeTtsCleanup = () => {
        ttsRunToken += 1;
        ttsIsPlaying = false;
        clearTtsTimer();
      };

      playPauseBtn.onclick = () => {
        if (ttsIsPlaying) {
          ttsPause(false);
        } else {
          const startIdx = (ttsCurrentTime >= ttsTotalDur - 0.2) ? 0 : segIndexForTime(ttsCurrentTime);
          ttsStartFromIndex(startIdx);
        }
      };

      seekSlider.addEventListener("input", () => {
        const targetSec = Number(seekSlider.value) || 0;
        ttsCurrentTime = Math.max(0, Math.min(ttsTotalDur, targetSec));
        const targetIdx = segIndexForTime(ttsCurrentTime);
        ttsCurrentIdx = targetIdx;
        currTimeEl.textContent = fmtTime(ttsCurrentTime);
        highlightTranscriptRow(targetIdx, true);
      });

      seekSlider.addEventListener("change", () => {
        const targetSec = Number(seekSlider.value) || 0;
        ttsCurrentTime = Math.max(0, Math.min(ttsTotalDur, targetSec));
        const targetIdx = segIndexForTime(ttsCurrentTime);
        if (ttsIsPlaying) {
          ttsStartFromIndex(targetIdx);
        } else {
          ttsCurrentIdx = targetIdx;
          highlightTranscriptRow(targetIdx, true);
        }
      });

      rewindBtn.onclick = () => {
        const nextTime = Math.max(0, ttsCurrentTime - 5);
        ttsCurrentTime = nextTime;
        const targetIdx = segIndexForTime(nextTime);
        ttsCurrentIdx = targetIdx;
        syncTtsUi();
        highlightTranscriptRow(targetIdx, true);
        if (ttsIsPlaying) {
          ttsStartFromIndex(targetIdx);
        }
      };

      volSlider.addEventListener("input", () => {
        lisVolume = Number(volSlider.value);
        lisMuted = lisVolume === 0;
        muteBtn.textContent = lisMuted ? "🔇" : "🔊";
        if (window.QCore && typeof QCore.setSpeechVolume === "function") {
          QCore.setSpeechVolume(lisMuted ? 0 : lisVolume);
        }
      });

      muteBtn.onclick = () => {
        lisMuted = !lisMuted;
        muteBtn.textContent = lisMuted ? "🔇" : "🔊";
        if (volSlider) volSlider.value = String(lisMuted ? 0 : (lisVolume || 1));
        if (window.QCore && typeof QCore.setSpeechVolume === "function") {
          QCore.setSpeechVolume(lisMuted ? 0 : lisVolume);
        }
      };

      onSpeedChanged = (rate) => {
        const prevRatio = ttsTotalDur > 0 ? (ttsCurrentTime / ttsTotalDur) : 0;
        computeTtsSegments(rate);
        ttsCurrentTime = prevRatio * ttsTotalDur;
        syncTtsUi();
        if (window.QCore && typeof QCore.setSpeechRate === "function") {
          QCore.setSpeechRate(rate);
        }
        if (ttsIsPlaying) {
          ttsStartFromIndex(ttsCurrentIdx);
        }
      };

      onTranscriptRowClicked = (idx) => {
        if (idx >= 0 && idx < ttsLines.length) {
          ttsStartFromIndex(idx);
        }
      };
    }

    // Speed buttons (0.75x, 1.0x, 1.25x, 1.5x, 2.0x)
    stage.querySelectorAll("[data-lspd]").forEach((b) => {
      b.onclick = () => {
        const rate = Number(b.getAttribute("data-lspd"));
        lisPlaybackRate = rate;
        if (typeof onSpeedChanged === "function") onSpeedChanged(rate);
        const rateLbl = stage.querySelector("#ls-rate-label");
        if (rateLbl) rateLbl.textContent = `${rate}x`;
        stage.querySelectorAll("[data-lspd]").forEach((btn) => {
          const r = Number(btn.getAttribute("data-lspd"));
          btn.className = `btn ${r === rate ? "btn-primary" : "btn-outline"} btn-sm`;
        });
      };
    });

    // Clicking a transcript sentence jumps audio to that sentence's timestamp and highlights it
    stage.querySelectorAll("[data-ts-idx]").forEach((row) => {
      row.onclick = () => {
        const idx = Number(row.getAttribute("data-ts-idx"));
        if (typeof onTranscriptRowClicked === "function") onTranscriptRowClicked(idx);
      };
    });

    stage.querySelector("#llis-submit").onclick = () => {
      const qs = ex.questions || [];
      let okCnt = 0;
      const norm = (s) => String(s || "").replace(/[。！？!?,，\s]/g, "");
      qs.forEach((q, qi) => {
        const qf = pickQuestionFields(q);
        let val = "";
        if (q.type === "fill") {
          const inp = stage.querySelector(`#llis-fill-${qi}`);
          val = inp ? inp.value.trim() : "";
        } else {
          const sel = stage.querySelector(`input[name="llis_q_${qi}"]:checked`);
          val = sel ? sel.value : "";
        }
        const ok = norm(val) === norm(qf.answer) || (q.answer && norm(val) === norm(q.answer));
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
    stopActiveTtsPlayer();
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
    stopActiveTtsPlayer();
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? "Chưa có bài ngữ pháp." : "No grammar exercise yet."}</div>`; return; }
    const titleTxt = (vi && ex.title_vi) ? ex.title_vi : (ex.title || "");
    const focusTxt = (!vi && ex.focusReason_en) ? ex.focusReason_en : (ex.focusReason || "");
    const expText = (!vi && ex.explanation_en) ? ex.explanation_en : (ex.explanation || focusTxt || "");
    stage.innerHTML = `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
          <div>${sourceTagBadge(ex.sourceTag)}</div>
          <button class="btn btn-outline btn-sm" id="lgr-q-lang">${vi ? "🌐 ZH–EN" : "🇻🇳 Trung–Việt"}</button>
        </div>
        <h3 style="margin:6px 0;">🧩 ${QCore.escapeHtml(titleTxt)}</h3>
        ${focusTxt ? `<div class="vi-hint-banner" style="margin-bottom:8px;"><span>🎯</span><div>${QCore.escapeHtml(focusTxt)}</div></div>` : ""}
        ${ex.formula ? `<div class="badge badge-amber" style="margin-bottom:8px;white-space:normal;">📐 ${QCore.escapeHtml(ex.formula)}</div>` : ""}
        <p style="font-size:14px;color:var(--text-secondary);">${QCore.escapeHtml(expText)}</p>
        ${(ex.questions || []).map((q, qi) => {
          const qf = pickQuestionFields(q);
          return `
          <div class="card-subtle" style="margin-bottom:10px;">
            <div style="font-weight:700;margin-bottom:6px;">${vi ? `Câu ${qi + 1}.` : `Question ${qi + 1}.`} ${QCore.escapeHtml(qf.text)}</div>
            ${q.type === "fill" ? `<input class="input-field hanzi-text" id="lgr-a-${qi}" data-pinyin-ime="true" placeholder="${vi ? "Nhập chữ Hán Giản thể..." : "Type Simplified Chinese..."}" />` : qf.options.map((o) => `<label style="display:block;margin:4px 0;cursor:pointer;"><input type="radio" name="lgr_${qi}" value="${QCore.escapeHtml(o)}"/> ${QCore.escapeHtml(o)}</label>`).join("")}
            <div id="lgr-fb-${qi}" style="margin-top:6px;font-size:13px;"></div>
          </div>
        `;
        }).join("")}
        <button class="btn btn-primary" id="lgr-sub">✅ ${vi ? "Kiểm tra ngữ pháp" : "Check Grammar"}</button>
        <div id="lgr-sum" style="margin-top:12px;"></div>
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
      const norm = (s) => String(s || "").replace(/[。！？!?,，\s]/g, "");
      qs.forEach((q, qi) => {
        const qf = pickQuestionFields(q);
        const val = q.type === "fill" ? (stage.querySelector(`#lgr-a-${qi}`).value || "").trim() : ((stage.querySelector(`input[name="lgr_${qi}"]:checked`) || {}).value || "");
        const ok = norm(val) === norm(qf.answer) || (q.answer && norm(val) === norm(q.answer));
        if (ok) right++;
        stage.querySelector(`#lgr-fb-${qi}`).innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ ${vi ? "Đúng!" : "Correct!"} ${QCore.escapeHtml(qf.explain)}</span>`
          : `<span style="color:var(--accent-red);">❌ ${vi ? "Đáp án đúng" : "Correct answer"}: ${QCore.escapeHtml(qf.answer)} — ${QCore.escapeHtml(qf.explain)}</span>`;
      });
      const score = qs.length ? Math.round((right / qs.length) * 100) : 100;
      QCore.recordLessonExercise(ex.id, score);
      QCore.updateSkillScore("grammar", score);
      QCore.logDailyActivity("grammarCount", 1);
      stage.querySelector("#lgr-sum").innerHTML = `<div class="card-subtle" style="border-color:var(--primary);"><strong>🎯 ${vi ? `Điểm ngữ pháp: ${score}/100 (${right}/${qs.length} đúng)` : `Grammar Score: ${score}/100 (${right}/${qs.length} correct)`}</strong></div>`;
    };
  }

  function renderWritingEx(stage, lesson, ex) {
    stopActiveTtsPlayer();
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? "Chưa có bài viết." : "No writing exercise yet."}</div>`; return; }
    const promptTxt = (!vi && ex.prompt_en) ? ex.prompt_en : (ex.prompt || "");
    const titleTxt = (vi && ex.title_vi) ? ex.title_vi : (ex.title || "");
    const focusTxt = (!vi && ex.focusReason_en) ? ex.focusReason_en : (ex.focusReason || "");
    stage.innerHTML = `
      <div class="card">
        ${sourceTagBadge(ex.sourceTag)}
        <h3 style="margin:6px 0;">🖋️ ${QCore.escapeHtml(titleTxt)}</h3>
        ${focusTxt ? `<div class="vi-hint-banner" style="margin-bottom:10px;"><span>🎯</span><div>${QCore.escapeHtml(focusTxt)}</div></div>` : ""}
        <div class="card-subtle" style="margin-bottom:12px;"><strong>${vi ? "Đề bài:" : "Prompt:"}</strong> ${QCore.escapeHtml(promptTxt)}</div>
        ${ex.sampleAnswer ? `
          <div style="margin-bottom:12px;">
            <button type="button" class="btn btn-outline btn-sm" id="lwr-toggle-sample">💡 ${vi ? "Xem câu mẫu tham khảo" : "Show Model Answer"}</button>
            <div id="lwr-sample-box" class="card-subtle" style="display:none;margin-top:8px;border-left:3px solid var(--primary);">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                <span class="hanzi-text" style="font-size:18px;font-weight:700;">${QCore.escapeHtml(ex.sampleAnswer)}</span>
                <button type="button" class="btn btn-soft btn-sm" id="lwr-sample-speak">🔊</button>
              </div>
              ${ex.samplePinyin ? `<div class="pinyin-text" style="font-size:13.5px;color:var(--primary);margin-top:4px;">${QCore.escapeHtml(ex.samplePinyin)}</div>` : ""}
              ${ex.sampleEnglish ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">🇬🇧 ${QCore.escapeHtml(ex.sampleEnglish)}</div>` : ""}
              ${ex.sampleVietnamese ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">🇻🇳 ${QCore.escapeHtml(ex.sampleVietnamese)}</div>` : ""}
            </div>
          </div>
        ` : ""}
        <textarea class="textarea-field hanzi-text" id="lwr-txt" rows="4" data-pinyin-ime="true" placeholder="${vi ? "Viết bài bằng Chữ Hán Giản thể..." : "Write in Simplified Chinese (Pinyin IME supported)..."}"></textarea>
        <button class="btn btn-primary" style="margin-top:10px;" id="lwr-sub">👩‍🏫 ${vi ? "Nộp bài & AI Chấm Rubric" : "Submit & AI Evaluate"}</button>
        <div id="lwr-out" style="margin-top:12px;"></div>
      </div>
    `;
    const togS = stage.querySelector("#lwr-toggle-sample");
    const boxS = stage.querySelector("#lwr-sample-box");
    if (togS && boxS) {
      togS.onclick = () => {
        const show = boxS.style.display === "none";
        boxS.style.display = show ? "block" : "none";
        togS.textContent = show ? (vi ? "🙈 Ẩn câu mẫu" : "🙈 Hide Model Answer") : (vi ? "💡 Xem câu mẫu tham khảo" : "💡 Show Model Answer");
      };
    }
    const spS = stage.querySelector("#lwr-sample-speak");
    if (spS) spS.onclick = () => QCore.speakChinese(ex.sampleAnswer);
    stage.querySelector("#lwr-sub").onclick = async () => {
      const text = (stage.querySelector("#lwr-txt").value || "").trim();
      if (!text) return;
      const out = stage.querySelector("#lwr-out");
      out.innerHTML = `<div class="card-subtle">⏳ ${vi ? "AI đang chấm bài viết theo rubric 7 tiêu chí..." : "AI is evaluating your Chinese writing..."}</div>`;
      const res = await window.QAiTutor.evaluateSentenceSmart({ text, prompt: promptTxt, targetWord: ex.targetWord || "", hskLevel: ex.hskLevel || 1 });
      QCore.recordLessonExercise(ex.id, res.score || 70, [], { perfectRequired: false });
      QCore.updateSkillScore("writing", res.score || 70);
      out.innerHTML = window.QAiTutor.renderSentenceEvaluationCard(res);
    };
  }

  function renderSpeakingEx(stage, lesson, ex) {
    stopActiveTtsPlayer();
    const vi = isViMode();
    if (!ex) { stage.innerHTML = `<div class="card">${vi ? "Chưa có bài nói." : "No speaking exercise yet."}</div>`; return; }
    const promptTxt = (!vi && ex.prompt_en) ? ex.prompt_en : (ex.prompt || "");
    const titleTxt = (vi && ex.title_vi) ? ex.title_vi : (ex.title || "");
    const focusTxt = (!vi && ex.focusReason_en) ? ex.focusReason_en : (ex.focusReason || "");
    stage.innerHTML = `
      <div class="card">
        ${sourceTagBadge(ex.sourceTag)}
        <h3 style="margin:6px 0;">🎙️ ${QCore.escapeHtml(titleTxt)}</h3>
        ${focusTxt ? `<div class="vi-hint-banner" style="margin-bottom:10px;"><span>🎯</span><div>${QCore.escapeHtml(focusTxt)}</div></div>` : ""}
        <div class="card-subtle" style="margin-bottom:12px;">
          <div style="margin-bottom:6px;">${QCore.escapeHtml(promptTxt)}</div>
          ${ex.sampleQuestion ? `
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px;">
              <span class="hanzi-text" style="font-size:21px;font-weight:700;">${QCore.escapeHtml(ex.sampleQuestion)}</span>
              <button class="btn btn-soft btn-sm" id="lspk-hear" title="Nghe tốc độ chuẩn">🔊</button>
              <button class="btn btn-outline btn-sm" id="lspk-slow" title="Nghe chậm 0.7x">🐢</button>
            </div>
          ` : ""}
          ${ex.samplePinyin ? `<div class="pinyin-text" style="font-size:14px;color:var(--primary);margin-top:6px;">${QCore.escapeHtml(ex.samplePinyin)}</div>` : ""}
          ${ex.sampleEnglish ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:4px;">🇬🇧 ${QCore.escapeHtml(ex.sampleEnglish)}</div>` : ""}
          ${ex.sampleVietnamese ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">🇻🇳 ${QCore.escapeHtml(ex.sampleVietnamese)}</div>` : ""}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
          <button class="btn btn-primary" id="lspk-rec">🎙️ ${vi ? "Ghi âm câu trả lời (5 giây)" : "Record Speaking (5s)"}</button>
        </div>
        <div id="lspk-out"></div>
      </div>
    `;
    const hear = stage.querySelector("#lspk-hear");
    if (hear) hear.onclick = () => QCore.speakChinese(ex.sampleQuestion);
    const slow = stage.querySelector("#lspk-slow");
    if (slow) slow.onclick = () => QCore.speakChinese(ex.sampleQuestion, { slow: true });
    stage.querySelector("#lspk-rec").onclick = () => {
      const out = stage.querySelector("#lspk-out");
      out.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);">🔴 ${vi ? "Đang thu âm 5 giây..." : "Recording for 5 seconds..."}</div>`;
      QCore.captureLearnerVoice({
        durationMs: 5000,
        onAudioReady: (url, tr) => {
          QCore.recordLessonExercise(ex.id, 85, [], { perfectRequired: false });
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
      await syncSharedExercisesForCourse(activeCourse);
      return true;
    }
    if (!QCore.getServerHealth().ok) return false;
    try {
      const qs = activeCourseId
        ? `courseId=${encodeURIComponent(activeCourseId)}`
        : `hskLevel=${encodeURIComponent(activeHsk)}`;
      const res = await QCore.apiFetch(`/api/pdf/course?${qs}`);
      activeCourse = res.course;
      if (activeCourse) await syncSharedExercisesForCourse(activeCourse);
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
            const doneCnt = exs.filter((e) => isExCompleted(lp[e.id], skillKey)).length;
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
            const isDone = isExCompleted(rec, skillKey);
            const exTitle = (vi && ex.title_vi) ? ex.title_vi : (ex.title || `${vi ? "Bài" : "Exercise"} ${idx + 1}`);
            const qCnt = Array.isArray(ex.questions) ? ex.questions.length : 0;
            return `
              <div class="card" data-open-ex="${idx}" style="padding:18px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:12px;border-color:${isDone ? "var(--primary)" : "var(--border-color)"};">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
                    <span class="badge badge-jade">${vi ? `Bài ${idx + 1}` : `Exercise ${idx + 1}`}</span>
                    ${isDone
                      ? `<span class="badge badge-jade">💯 ${rec.bestScore}/100</span>`
                      : (rec && rec.attempts > 0 ? `<span class="badge badge-amber">🟡 ${rec.bestScore}/100</span>` : "")}
                  </div>
                  <div style="font-weight:700;font-size:15.5px;line-height:1.45;margin-bottom:6px;">${QCore.escapeHtml(exTitle)}</div>
                  <div style="font-size:12.5px;color:var(--text-muted);display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
                    <span>${qCnt ? `📝 ${qCnt} ${vi ? "câu hỏi" : "questions"}` : (skillKey === "writing" ? (vi ? "🖋️ Luyện viết & AI chấm điểm" : "🖋️ Writing & AI Rubric") : (vi ? "🎙️ Luyện nói & Thu âm" : "🎙️ Speaking & Audio Check"))}</span>
                    ${ex.isSharedPublic && ex.authorName ? `<span class="badge badge-blue" style="font-size:11px;">🌐 ${vi ? `Tạo bởi ${ex.authorName}` : `By ${ex.authorName}`}</span>` : ""}
                  </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--border-color);">
                  ${isDone
                    ? `<span class="badge badge-jade" data-ex-completed="true" style="font-weight:700;">✅ ${vi ? "Đã hoàn thành" : "Completed"}</span>`
                    : `<span></span>`}
                  <button class="btn btn-primary btn-sm">${isDone ? (vi ? "Làm lại →" : "Practice Again →") : (vi ? "Bắt đầu làm →" : "Start Exercise →")}</button>
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
      btn.textContent = vi ? "⏳ AI đang tạo & chia sẻ bài mới..." : "⏳ Generating & sharing exercise...";
      try {
        const currList = (lesson.skills && lesson.skills[skillKey]) || [];
        const user = (QCore.getUser && QCore.getUser()) || null;
        const authorName = (user && (user.displayName || user.username)) || "Học viên QChinese";
        const hskLevel = (activeCourse && activeCourse.hskLevel) || 1;
        const lessonNum = Number(lesson.lessonNum || 1);
        const newEx = await QCore.apiFetch("/api/ai/generate-lesson-exercise", {
          method: "POST",
          body: {
            skill: skillKey,
            hskLevel,
            lessonNum,
            lessonTitle: lesson.title,
            vocabWords: (lesson.skills && lesson.skills.vocabulary) || [],
            wrongFocuses: lastWrongFocuses,
            variantIndex: currList.length + 1,
            authorName,
            sharePublic: true
          }
        });
        newEx.hskLevel = hskLevel;
        newEx.lessonNum = lessonNum;
        newEx.skill = skillKey;
        newEx.authorName = newEx.authorName || authorName;
        newEx.isSharedPublic = true;
        newEx.createdAt = newEx.createdAt || new Date().toISOString();

        if (!Array.isArray(lesson.skills[skillKey])) lesson.skills[skillKey] = [];
        if (!lesson.skills[skillKey].some((x) => x && x.id === newEx.id)) {
          lesson.skills[skillKey].push(newEx);
        }
        saveLocalSharedExercise(newEx);
        if (window.QCloud && typeof QCloud.publishSharedExercise === "function") {
          QCloud.publishSharedExercise({
            hskLevel,
            lessonNum,
            skill: skillKey,
            exercise: newEx,
            authorName: newEx.authorName
          }).catch(() => {});
        }
        QCore.showToast(vi ? "✨ AI đã tạo bài mới & chia sẻ công khai cho mọi tài khoản!" : "✨ AI generated & publicly shared the new exercise!");
        onCreated();
      } catch (err) {
        QCore.showToast("❌ " + err.message);
        btn.disabled = false;
      }
    };
  }

  /* ---------- COURSE HUB (QEnglish-style: AI PDF HSK 1 -> Lesson 1..15 -> 6 Skill Cards -> Exercise 1, 2, 3 -> Practice) ---------- */
  const SKILL_CARDS_6 = [
    { id: "reading", icon: "📄", en: "Reading", vi: "Reading", descEn: "Split-screen passage & bilingual comprehension questions", descVi: "Đọc hiểu chia đôi màn hình & bộ câu hỏi song ngữ" },
    { id: "listening", icon: "🎧", en: "Listening", vi: "Listening", descEn: "Audio tracks, speed control & listening drills", descVi: "Audio chuẩn, chỉnh tốc độ & câu hỏi nghe hiểu" },
    { id: "writing", icon: "✍️", en: "Writing", vi: "Writing", descEn: "Guided writing, Pinyin IME & AI rubric feedback", descVi: "Luyện viết câu/đoạn, gợi ý Pinyin & AI chấm điểm" },
    { id: "speaking", icon: "🎙️", en: "Speaking", vi: "Speaking", descEn: "Shadowing, pronunciation & voice recording practice", descVi: "Luyện đọc theo mẫu, phát âm & thu giọng nói" },
    { id: "vocabulary", icon: "📖", en: "Vocabulary", vi: "Vocabulary", descEn: "Lesson core words, Pinyin, audio & Notebook save", descVi: "Từ vựng trọng tâm của bài, Pinyin, loa & lưu Sổ tay" },
    { id: "grammar", icon: "🧩", en: "Grammar", vi: "Grammar", descEn: "Core grammar patterns & targeted exercises", descVi: "Công thức ngữ pháp trọng tâm & bài tập trắc nghiệm" }
  ];

  const hubState = { view: "lessons", hskLevel: 1, courseId: null, lessonIdx: 0, skill: "reading", exIdx: 0 };

  async function renderCourseHub(container, params = {}) {
    const vi = isViMode();
    if (params && params.resetHub) {
      hubState.view = "lessons";
      hubState.hskLevel = Number(params.hskLevel || 1);
      hubState.courseId = params.courseId || null;
      hubState.lessonIdx = 0;
      hubState.exIdx = 0;
    } else {
      if (params && params.hskLevel) hubState.hskLevel = Number(params.hskLevel);
      if (params && params.courseId) hubState.courseId = params.courseId;
    }

    if (!activeCourse || hubState.hskLevel !== activeHsk || (hubState.courseId && hubState.courseId !== activeCourseId)) {
      container.innerHTML = `<div class="card" style="text-align:center;padding:38px;">⏳ ${vi ? "Đang mở khóa học HSK..." : "Loading HSK course..."}</div>`;
    }
    const ok = await ensureCourseLoaded({ hskLevel: hubState.hskLevel, courseId: hubState.courseId });
    if (!ok || !activeCourse) {
      container.innerHTML = `
        <div class="card" style="padding:28px;">
          <h3 style="margin:0 0 8px;">🔒 ${vi ? `HSK ${hubState.hskLevel} chưa có giáo trình` : `HSK ${hubState.hskLevel} is locked`}</h3>
          <button class="btn btn-primary btn-sm" id="hub-back-pdf">← ${vi ? "Quay lại AI PDF · HSK 3.0" : "Back to AI PDF · HSK 3.0"}</button>
        </div>
      `;
      container.querySelector("#hub-back-pdf").onclick = () => window.QApp.navigate("ai-pdf");
      return;
    }

    drawCourseHub(container);
  }

  function drawCourseHub(container) {
    const vi = isViMode();
    const st = QCore.getState();
    const lp = (st && st.lessonProgress) || {};
    const lessons = (activeCourse && activeCourse.lessons) || [];
    if (hubState.lessonIdx >= lessons.length) hubState.lessonIdx = 0;

    // STEP 2 (Image 2): Inside HSK 1 -> Grid of Lesson 1..15 Folders
    if (hubState.view === "lessons") {
      container.innerHTML = `
        <div class="page-header" style="margin-bottom:16px;">
          <div>
            <button class="btn btn-outline btn-sm" id="hub-to-pdf" style="margin-bottom:8px;">← ${vi ? "Quay lại AI PDF · HSK 3.0" : "Back to AI PDF · HSK 3.0"}</button>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:4px;">
              <span class="badge badge-jade">${QCore.escapeHtml(activeCourse.code || `HSK ${hubState.hskLevel} (3.0)`)}</span>
              <span class="badge badge-blue">📚 ${lessons.length} Lessons · 6 ${vi ? "kỹ năng" : "skills"}</span>
            </div>
            <h2 style="margin:0;">📁 ${QCore.escapeHtml(activeCourse.title || `HSK ${hubState.hskLevel}`)}</h2>
            <p style="margin:4px 0 0;font-size:13px;">${vi ? "Chọn 1 Lesson bên dưới để xem đầy đủ 6 kỹ năng (Reading, Listening, Writing, Speaking, Vocabulary, Grammar)." : "Pick a Lesson folder below to access all 6 skills (Reading, Listening, Writing, Speaking, Vocabulary, Grammar)."}</p>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(275px,1fr));gap:12px;">
          ${lessons.map((l, idx) => {
            const comp = getLessonCompletion(l, lp);
            return `
              <div class="card" data-hub-lesson="${idx}" style="padding:16px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:10px;border-color:${comp.pct === 100 && comp.total ? "var(--primary)" : "var(--border-color)"};">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">
                    <span class="badge ${comp.pct === 100 && comp.total ? "badge-jade" : "badge-blue"}">📁 Lesson ${l.lessonNum}</span>
                    <span style="font-size:12px;font-weight:700;color:${comp.done > 0 ? "var(--primary)" : "var(--text-muted)"};">${comp.done}/${comp.total} ${vi ? "bài xong" : "done"}</span>
                  </div>
                  <div style="font-weight:700;font-size:15px;line-height:1.45;">${QCore.escapeHtml(l.title.replace(/^Lesson\s*\d+:\s*/i, ""))}</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px solid var(--border-color);font-size:12.5px;color:var(--text-secondary);">
                  <span>🧩 6 ${vi ? "kỹ năng" : "skills"} · ${comp.total} ${vi ? "bài tập" : "exercises"}</span>
                  <strong style="color:var(--primary);">${vi ? "Mở thư mục →" : "Open →"}</strong>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      container.querySelector("#hub-to-pdf").onclick = () => window.QApp.navigate("ai-pdf");
      container.querySelectorAll("[data-hub-lesson]").forEach((card) => {
        card.onclick = () => {
          hubState.lessonIdx = Number(card.getAttribute("data-hub-lesson"));
          hubState.view = "skills";
          drawCourseHub(container);
        };
      });
      return;
    }

    const lesson = lessons[hubState.lessonIdx] || lessons[0];

    // STEP 3 (Image 3 — QEnglish style): Inside Lesson X -> 6-Skill Cards Grid (3x2)
    if (hubState.view === "skills") {
      const comp = getLessonCompletion(lesson, lp);
      container.innerHTML = `
        <div class="card" style="padding:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div>
              <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px;">
                <button class="btn btn-outline btn-sm" id="hub-back-lessons">← ${vi ? `Quay lại ${activeCourse.code || "HSK 1"}` : `Back to ${activeCourse.code || "HSK 1"} Lessons`}</button>
                <span class="badge badge-jade">${vi ? `Hoàn thành ${comp.done}/${comp.total} (${comp.pct}%)` : `Completed ${comp.done}/${comp.total} (${comp.pct}%)`}</span>
                <span class="badge badge-blue">📖 ${vi ? `Trang PDF ~${lesson.sourcePage || 1}` : `PDF Page ~${lesson.sourcePage || 1}`}</span>
              </div>
              <h2 style="margin:0;font-size:20px;">📁 ${QCore.escapeHtml(lesson.title)}</h2>
              <p style="margin:4px 0 0;font-size:13px;color:var(--text-secondary);">${vi ? "Chọn kỹ năng bạn muốn luyện trong bài học này:" : "Choose a skill to study inside this lesson:"}</p>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:14px;">
          ${SKILL_CARDS_6.map((sk) => {
            const list = (lesson.skills && Array.isArray(lesson.skills[sk.id])) ? lesson.skills[sk.id] : [];
            const isVocab = sk.id === "vocabulary";
            const doneCnt = isVocab ? 0 : list.filter((e) => isExCompleted(lp[e.id], sk.id)).length;
            const pct = (!isVocab && list.length) ? Math.round((doneCnt / list.length) * 100) : 0;
            return `
              <div class="card" data-hub-skill="${sk.id}" style="padding:20px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:16px;border-color:${pct === 100 && list.length ? "var(--primary)" : "var(--border-color)"};transition:transform .15s ease;">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                    <span style="font-size:30px;">${sk.icon}</span>
                    <span class="badge badge-blue">${list.length} ${isVocab ? (vi ? "từ" : "words") : (vi ? "bài" : "exercises")}</span>
                  </div>
                  <div style="font-weight:800;font-size:19px;margin-bottom:6px;">${vi ? sk.vi : sk.en}</div>
                  <div style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${vi ? sk.descVi : sk.descEn}</div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid var(--border-color);font-size:13px;">
                  <span style="font-weight:700;color:var(--primary);">${isVocab ? `${list.length} ${vi ? "từ trọng tâm" : "core words"}` : (vi ? `Hoàn thành ${doneCnt}/${list.length} (${pct}%)` : `Completed ${doneCnt}/${list.length} (${pct}%)`)}</span>
                  <strong style="color:var(--primary);">${vi ? "Vào học →" : "Start →"}</strong>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      container.querySelector("#hub-back-lessons").onclick = () => {
        hubState.view = "lessons";
        drawCourseHub(container);
      };
      container.querySelectorAll("[data-hub-skill]").forEach((card) => {
        card.onclick = () => {
          hubState.skill = card.getAttribute("data-hub-skill");
          hubState.exIdx = 0;
          hubState.view = hubState.skill === "vocabulary" ? "practice" : "exercises";
          drawCourseHub(container);
        };
      });
      return;
    }

    const skKey = hubState.skill;
    const skInfo = SKILL_CARDS_6.find((x) => x.id === skKey) || SKILL_CARDS_6[0];
    const exList = (lesson.skills && Array.isArray(lesson.skills[skKey])) ? lesson.skills[skKey] : [];

    // STEP 4 (Image 4): Inside Lesson X -> Skill Y -> Separate Exercise Cards (Bài 1, Bài 2, Bài 3...)
    if (hubState.view === "exercises") {
      container.innerHTML = `
        <div class="card" style="padding:16px;margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
            <div>
              <button class="btn btn-outline btn-sm" id="hub-back-skills" style="margin-bottom:8px;">← ${vi ? `Quay lại Lesson ${lesson.lessonNum} (6 kỹ năng)` : `Back to Lesson ${lesson.lessonNum} (6 Skills)`}</button>
              <h2 style="margin:0;font-size:19px;">📁 ${QCore.escapeHtml(lesson.title)} — ${skInfo.icon} ${vi ? skInfo.vi : skInfo.en}</h2>
              <p style="margin:4px 0 0;font-size:13px;color:var(--text-secondary);">
                ${vi ? `Chọn 1 bài tập nhỏ bên dưới để làm tập trung (tổng ${exList.length} bài):` : `Pick one focused exercise below (${exList.length} exercises):`}
              </p>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
              <button class="btn btn-outline btn-sm" id="hub-share-link">🔗 ${vi ? "Chia sẻ công khai" : "Share Course"}</button>
              <button class="btn btn-primary btn-sm" id="hub-ai-gen">✨ ${vi ? `AI – Tạo thêm Bài ${exList.length + 1}` : `AI – Generate Exercise ${exList.length + 1}`}</button>
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;">
          ${exList.map((ex, idx) => {
            const rec = lp[ex.id];
            const isDone = isExCompleted(rec, skKey);
            const exTitle = (vi && ex.title_vi) ? ex.title_vi : (ex.title || `${vi ? "Bài" : "Exercise"} ${idx + 1}`);
            const qCnt = Array.isArray(ex.questions) ? ex.questions.length : 0;
            return `
              <div class="card" data-hub-ex="${idx}" style="padding:18px;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;gap:12px;border-color:${isDone ? "var(--primary)" : "var(--border-color)"};">
                <div>
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px;">
                    <span class="badge badge-jade">${vi ? `Bài ${idx + 1}` : `Exercise ${idx + 1}`}</span>
                    ${isDone
                      ? `<span class="badge badge-jade">💯 ${rec.bestScore}/100</span>`
                      : (rec && rec.attempts > 0 ? `<span class="badge badge-amber">🟡 ${rec.bestScore}/100</span>` : "")}
                  </div>
                  <div style="font-weight:700;font-size:15.5px;line-height:1.45;margin-bottom:6px;">${QCore.escapeHtml(exTitle)}</div>
                  <div style="font-size:12.5px;color:var(--text-muted);display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
                    <span>${qCnt ? `📝 ${qCnt} ${vi ? "câu hỏi" : "questions"}` : (skKey === "writing" ? (vi ? "🖋️ Luyện viết & AI chấm điểm" : "🖋️ Writing & AI Rubric") : (vi ? "🎙️ Luyện nói & Thu âm" : "🎙️ Speaking & Audio Check"))}</span>
                    ${ex.isSharedPublic && ex.authorName ? `<span class="badge badge-blue" style="font-size:11px;">🌐 ${vi ? `Công khai · Tạo bởi ${ex.authorName}` : `Shared · By ${ex.authorName}`}</span>` : ""}
                  </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--border-color);">
                  ${isDone
                    ? `<span class="badge badge-jade" data-ex-completed="true" style="font-weight:700;">✅ ${vi ? "Đã hoàn thành" : "Completed"}</span>`
                    : `<span></span>`}
                  <button class="btn btn-primary btn-sm">${isDone ? (vi ? "Làm lại →" : "Practice Again →") : (vi ? "Bắt đầu làm →" : "Start Exercise →")}</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;

      const shareBtn = container.querySelector("#hub-share-link");
      if (shareBtn) {
        shareBtn.onclick = () => {
          const url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).catch(() => {});
          }
          QCore.showToast(
            vi
              ? "🔗 Đã sao chép link! Mọi bài AI tạo mới trong khóa học đều chia sẻ công khai giữa các tài khoản (tiến trình làm bài vẫn riêng tư từng acc)."
              : "🔗 Link copied! All AI exercises are publicly shared across accounts, while completion progress stays 100% private per account."
          );
        };
      }

      container.querySelector("#hub-back-skills").onclick = () => {
        hubState.view = "skills";
        drawCourseHub(container);
      };
      container.querySelectorAll("[data-hub-ex]").forEach((card) => {
        card.onclick = () => {
          hubState.exIdx = Number(card.getAttribute("data-hub-ex"));
          hubState.view = "practice";
          drawCourseHub(container);
        };
      });
      bindAiGenButton(container, "#hub-ai-gen", lesson, skKey, () => {
        hubState.exIdx = lesson.skills[skKey].length - 1;
        hubState.view = "practice";
        drawCourseHub(container);
      });
      return;
    }

    // STEP 5: Single Focused Exercise (or Vocabulary) Workspace
    const isVocab = skKey === "vocabulary";
    if (!isVocab && hubState.exIdx >= exList.length) hubState.exIdx = 0;
    const currentEx = isVocab ? null : exList[hubState.exIdx];
    const hasPrev = !isVocab && hubState.exIdx > 0;
    const hasNext = !isVocab && hubState.exIdx + 1 < exList.length;

    container.innerHTML = `
      <div class="card" style="padding:12px 16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" id="hub-back-up">
            ← ${isVocab
              ? (vi ? `Quay lại Lesson ${lesson.lessonNum} (6 kỹ năng)` : `Back to Lesson ${lesson.lessonNum} (6 Skills)`)
              : (vi ? `Bài tập ${skInfo.vi} (Lesson ${lesson.lessonNum})` : `Lesson ${lesson.lessonNum} ${skInfo.en} Exercises`)}
          </button>
          <span style="font-size:13.5px;font-weight:700;color:var(--text-secondary);">
            ${skInfo.icon} Lesson ${lesson.lessonNum} · ${skInfo.en}${!isVocab ? ` · ${vi ? `Bài ${hubState.exIdx + 1}/${exList.length}` : `Exercise ${hubState.exIdx + 1}/${exList.length}`}` : ""}
          </span>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${hasPrev ? `<button class="btn btn-outline btn-sm" id="hub-prev-ex">← ${vi ? "Bài trước" : "Prev"}</button>` : ""}
          ${hasNext ? `<button class="btn btn-soft btn-sm" id="hub-next-ex">${vi ? "Bài tiếp theo →" : "Next Exercise →"}</button>` : ""}
          ${!isVocab ? `<button class="btn btn-primary btn-sm" id="ls-ai-gen-btn">✨ ${vi ? "AI – Tạo bài mới" : "AI – New Exercise"}</button>` : ""}
        </div>
      </div>
      <div id="hub-practice-stage"></div>
    `;

    container.querySelector("#hub-back-up").onclick = () => {
      stopActiveTtsPlayer();
      hubState.view = isVocab ? "skills" : "exercises";
      drawCourseHub(container);
    };
    const prevBtn = container.querySelector("#hub-prev-ex");
    if (prevBtn) prevBtn.onclick = () => { stopActiveTtsPlayer(); hubState.exIdx--; drawCourseHub(container); };
    const nextBtn = container.querySelector("#hub-next-ex");
    if (nextBtn) nextBtn.onclick = () => { stopActiveTtsPlayer(); hubState.exIdx++; drawCourseHub(container); };
    if (!isVocab) {
      bindAiGenButton(container, "#ls-ai-gen-btn", lesson, skKey, () => {
        hubState.exIdx = lesson.skills[skKey].length - 1;
        drawCourseHub(container);
      });
    }

    const stage = container.querySelector("#hub-practice-stage");
    if (skKey === "reading") renderReadingSplit(stage, lesson, currentEx, container);
    else if (skKey === "listening") renderListeningEx(stage, lesson, currentEx, container);
    else if (skKey === "grammar") renderGrammarEx(stage, lesson, currentEx, container);
    else if (skKey === "writing") renderWritingEx(stage, lesson, currentEx, container);
    else if (skKey === "speaking") renderSpeakingEx(stage, lesson, currentEx, container);
    else renderVocabEx(stage, lesson);
  }

  return {
    renderLessons,
    renderSkillFolder,
    renderCourseHub
  };
})();
