/* -*- coding: utf-8 -*-
 * QChinese – Module 1 (Dashboard) & Module 2 (Placement Test 7 Skills + HSK 1–6 Competency Roadmap)
 */

window.QDashboardAssessment = (function () {
  /* ==================== 3.1. DASHBOARD ==================== */
  function renderDashboard(container) {
    const st = QCore.getState();
    const p = st.profile;
    const today = QCore.todayStr();
    const log = st.dailyLogs[today] || {
      minutes: 0,
      newWords: 0,
      reviewWords: 0,
      grammarCount: 0,
      listeningCount: 0,
      hanziWriteCount: 0,
      speakingMinutes: 0
    };
    const targets = p.dailyTargets;

    const vocabLearned = Object.keys(st.srs).length;
    const hanziMemorized = Object.values(st.hanziProgress).filter((h) => h.memorized).length;
    const listeningDone = st.listeningCompleted.length;
    const writingDone = Object.values(st.hanziProgress).reduce((a, b) => a + (b.attempts || 0), 0) + st.writingSubmissions.length;
    const lastScoreText = p.lastTestScore != null ? `${p.lastTestScore}/100` : "Chưa kiểm tra";

    // Calculate daily goal completion across the 6 tasks + study time
    const tasks = [
      {
        id: "t1",
        title: `1. Học ${targets.newWords} từ vựng mới`,
        done: log.newWords || 0,
        goal: targets.newWords,
        unit: "từ",
        route: "vocab",
        btnLabel: "Học từ mới",
        icon: "📖"
      },
      {
        id: "t2",
        title: `2. Ôn tập ${targets.reviewWords} từ cũ (SRS)`,
        done: log.reviewWords || 0,
        goal: targets.reviewWords,
        unit: "từ",
        route: "vocab",
        btnLabel: "Ôn tập ngay",
        icon: "🔄"
      },
      {
        id: "t3",
        title: `3. Học ${targets.grammarCount} cấu trúc ngữ pháp`,
        done: log.grammarCount || 0,
        goal: targets.grammarCount,
        unit: "bài",
        route: "grammar",
        btnLabel: "Học ngữ pháp",
        icon: "🧩"
      },
      {
        id: "t4",
        title: `4. Luyện nghe ${targets.listeningCount} đoạn hội thoại`,
        done: log.listeningCount || 0,
        goal: targets.listeningCount,
        unit: "bài",
        route: "listening",
        btnLabel: "Luyện nghe",
        icon: "🎧"
      },
      {
        id: "t5",
        title: `5. Viết ${targets.hanziWriteCount} chữ Hán chuẩn nét`,
        done: log.hanziWriteCount || 0,
        goal: targets.hanziWriteCount,
        unit: "chữ",
        route: "hanzi",
        btnLabel: "Luyện viết nét",
        icon: "✍️"
      },
      {
        id: "t6",
        title: `6. Luyện nói ${targets.speakingMinutes} phút với AI`,
        done: log.speakingMinutes || 0,
        goal: targets.speakingMinutes,
        unit: "phút",
        route: "speaking",
        btnLabel: "Trò chuyện AI",
        icon: "🎙️"
      }
    ];

    const ratios = tasks.map((t) => Math.min(1, t.goal > 0 ? t.done / t.goal : 1));
    const overallGoalPct = Math.round((ratios.reduce((a, b) => a + b, 0) / tasks.length) * 100);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
            <span class="badge badge-jade">🌱 Trình độ: ${QCore.escapeHtml(p.levelLabel)}</span>
            <span class="badge badge-blue">🎯 Cấp độ đang học: HSK ${p.hskLevel} (Giản thể 简体)</span>
            <span class="badge badge-amber">🔥 Chuỗi học liên tục: ${p.streakDays} ngày</span>
          </div>
          <h2>Xin chào, ${QCore.escapeHtml(p.name)}! 👋</h2>
          <p>Chào mừng bạn đến với giáo viên tiếng Trung Giản thể cá nhân. Đi từng bước thật chắc từ Pinyin, thanh điệu đến chữ Hán và giao tiếp nhé!</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          ${
            !p.placementCompleted
              ? `<button class="btn btn-primary" data-goto="assessment">🧭 Làm bài Đánh giá đầu vào</button>`
              : `<button class="btn btn-outline" data-goto="assessment">📊 Xem lộ trình HSK 1–6</button>`
          }
          <button class="btn btn-soft" id="btn-open-tutor-12">👩‍🏫 Học 1 từ mới theo 12 bước AI</button>
        </div>
      </div>

      ${
        !p.placementCompleted
          ? `
        <div class="card" style="margin-bottom:20px;background:linear-gradient(120deg, var(--bg-accent-soft), var(--bg-surface));border-color:var(--primary);">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
            <div>
              <strong style="font-size:16px;color:var(--primary);">✨ Gợi ý cho người mới bắt đầu từ con số 0</strong>
              <p style="margin:4px 0 0;color:var(--text-secondary);font-size:14px;">
                Nếu bạn hoàn toàn chưa biết Pinyin hay chữ Hán, bạn có thể <strong>làm bài Đánh giá đầu vào</strong> (có nút <em>"Chưa biết câu này"</em> không áp lực) hoặc bắt đầu ngay với <strong>Bảng Pinyin & 4 Thanh điệu</strong>!
              </p>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-primary btn-sm" data-goto="pinyin">1. Học Pinyin & 4 Thanh điệu</button>
              <button class="btn btn-outline btn-sm" data-goto="hanzi">2. Khám phá chữ 你 đầu tiên</button>
            </div>
          </div>
        </div>
      `
          : ""
      }

      <!-- 8 Overview Metric Cards -->
      <div class="grid-4" style="margin-bottom:22px;">
        <div class="kpi-card">
          <span class="kpi-label">Tổng từ vựng đã học</span>
          <span class="kpi-value">${vocabLearned}</span>
          <span class="kpi-sub">Hệ thống lặp lại ngắt quãng SRS</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Chữ Hán đã ghi nhớ</span>
          <span class="kpi-value">${hanziMemorized}</span>
          <span class="kpi-sub">Viết đúng nét ≥ 75%</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Bài nghe hoàn thành</span>
          <span class="kpi-value">${listeningDone}</span>
          <span class="kpi-sub">Chuẩn âm Phổ thông zh-CN</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Lượt viết đã thực hành</span>
          <span class="kpi-value">${writingDone}</span>
          <span class="kpi-sub">Chữ Hán & viết câu AI</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Điểm kiểm tra gần nhất</span>
          <span class="kpi-value">${lastScoreText}</span>
          <span class="kpi-sub">Đánh giá năng lực thực tế</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Thời gian học tập</span>
          <span class="kpi-value">${log.minutes}p <small style="font-size:13px;font-weight:500;color:var(--text-muted);">/ ${p.dailyGoalMinutes}p hôm nay</small></span>
          <span class="kpi-sub">Tổng tích lũy: ${p.totalStudyMinutes} phút</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Chuỗi ngày liên tục</span>
          <span class="kpi-value">🔥 ${p.streakDays} ngày</span>
          <span class="kpi-sub">Duy trì thói quen mỗi ngày</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Hoàn thành mục tiêu ngày</span>
          <span class="kpi-value">${overallGoalPct}%</span>
          <div class="progress-track" style="margin-top:4px;"><div class="progress-fill" style="width:${overallGoalPct}%"></div></div>
        </div>
      </div>

      <!-- Today's Study Area & Goal Customizer -->
      <div class="grid-2">
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:10px;flex-wrap:wrap;">
            <div>
              <h3 style="margin:0;font-size:18px;">📅 Khu vực học hôm nay</h3>
              <small style="color:var(--text-muted);">Hoàn thành từng nhiệm vụ nhỏ để xây nền tảng HSK ${p.hskLevel} vững chắc</small>
            </div>
            <button class="btn btn-outline btn-sm" id="btn-edit-goals">⚙️ Tùy chỉnh mục tiêu</button>
          </div>

          <div style="display:flex;flex-direction:column;gap:11px;">
            ${tasks
              .map((t) => {
                const pct = Math.min(100, Math.round((t.done / Math.max(1, t.goal)) * 100));
                const isDone = t.done >= t.goal;
                return `
                  <div class="card-subtle" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:200px;">
                      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
                        <strong style="font-size:14px;">${t.icon} ${t.title}</strong>
                        <span class="badge ${isDone ? "badge-jade" : ""}">${isDone ? "✓ Hoàn thành" : `${t.done}/${t.goal} ${t.unit}`}</span>
                      </div>
                      <div class="progress-track" style="height:7px;"><div class="progress-fill" style="width:${pct}%"></div></div>
                    </div>
                    <button class="btn ${isDone ? "btn-outline" : "btn-primary"} btn-sm" data-goto="${t.route}">${t.btnLabel}</button>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:18px;">
          <!-- Featured Character of the Day -->
          <div class="card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <h3 style="margin:0;font-size:17px;">✨ Chữ Hán tiêu điểm hôm nay</h3>
              <span class="badge badge-jade">Giản thể · HSK 1</span>
            </div>
            <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
              <div style="width:96px;height:96px;border-radius:18px;background:var(--bg-subtle);border:1.5px solid var(--primary);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;" id="dash-hero-char">
                <span class="hanzi-calligraphy" style="font-size:48px;line-height:1.1;">你</span>
                <span class="pinyin-text" style="font-size:13px;color:var(--primary);font-weight:700;">nǐ</span>
              </div>
              <div style="flex:1;min-width:190px;">
                <div style="font-weight:700;font-size:16px;margin-bottom:4px;">你 (nǐ) — Bạn · You</div>
                <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">
                  Bộ Nhân đứng <strong>亻</strong> + <strong>尔</strong> · 7 nét · Gợi ý đọc gần đúng: <em>nỉ</em>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  <button class="btn btn-soft btn-sm" id="dash-play-ni">🔊 Nghe phát âm</button>
                  <button class="btn btn-primary btn-sm" id="dash-practice-ni">✍️ Xem nét & Tập viết</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Daily Goal Customizer Form (Collapsible) -->
          <div class="card" id="goal-editor-card" style="display:none;">
            <h3 style="margin:0 0 12px;font-size:16px;">⚙️ Tùy chỉnh mục tiêu học tập hàng ngày</h3>
            <div class="grid-2" style="gap:10px;">
              <label style="font-size:13px;">Thời gian học / ngày (phút)
                <input type="number" min="5" max="240" class="input-field" id="goal-minutes" value="${p.dailyGoalMinutes}">
              </label>
              <label style="font-size:13px;">Từ vựng mới / ngày
                <input type="number" min="1" max="50" class="input-field" id="goal-new-words" value="${targets.newWords}">
              </label>
              <label style="font-size:13px;">Ôn tập từ cũ / ngày
                <input type="number" min="1" max="100" class="input-field" id="goal-rev-words" value="${targets.reviewWords}">
              </label>
              <label style="font-size:13px;">Cấu trúc ngữ pháp / ngày
                <input type="number" min="1" max="10" class="input-field" id="goal-grammar" value="${targets.grammarCount}">
              </label>
              <label style="font-size:13px;">Bài hội thoại nghe / ngày
                <input type="number" min="1" max="10" class="input-field" id="goal-listening" value="${targets.listeningCount}">
              </label>
              <label style="font-size:13px;">Chữ Hán luyện viết / ngày
                <input type="number" min="1" max="30" class="input-field" id="goal-hanzi" value="${targets.hanziWriteCount}">
              </label>
            </div>
            <div style="margin-top:12px;display:flex;justify-content:flex-end;gap:8px;">
              <button class="btn btn-outline btn-sm" id="btn-cancel-goals">Đóng</button>
              <button class="btn btn-primary btn-sm" id="btn-save-goals">Lưu mục tiêu</button>
            </div>
          </div>

          <!-- Quick Smart Pinyin Lookup Tip -->
          <div class="card-subtle">
            <strong style="font-size:14px;">💡 Mẹo cho người mới: Gõ Pinyin tự động gợi ý chữ Hán!</strong>
            <p style="margin:5px 0 0;font-size:13px;color:var(--text-secondary);">
              Bạn chưa cài bàn phím tiếng Trung? Không sao cả! Ở bất kỳ ô luyện viết hay trò chuyện nào trên QChinese, chỉ cần gõ Pinyin (ví dụ <code>nihao</code>, <code>xihuan</code>, <code>zhongwen</code>), thanh gợi ý sẽ hiện ngay chữ Hán Giản thể kèm dấu thanh điệu và nghĩa tiếng Việt cho bạn chọn!
            </p>
          </div>
        </div>
      </div>
    `;

    container.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.onclick = () => window.QApp.navigate(btn.getAttribute("data-goto"));
    });

    const tutorBtn = container.querySelector("#btn-open-tutor-12");
    if (tutorBtn) {
      tutorBtn.onclick = () => window.QVocabTutor.openStepByStepWordModal("v_xuesheng");
    }

    container.querySelector("#dash-play-ni").onclick = () => QCore.speakChinese("你，你好！");
    const openNi = () => window.QApp.navigate("hanzi", { char: "你" });
    container.querySelector("#dash-practice-ni").onclick = openNi;
    container.querySelector("#dash-hero-char").onclick = openNi;

    const editorCard = container.querySelector("#goal-editor-card");
    container.querySelector("#btn-edit-goals").onclick = () => {
      editorCard.style.display = editorCard.style.display === "none" ? "block" : "none";
    };
    container.querySelector("#btn-cancel-goals").onclick = () => {
      editorCard.style.display = "none";
    };
    container.querySelector("#btn-save-goals").onclick = () => {
      p.dailyGoalMinutes = Math.max(5, Number(container.querySelector("#goal-minutes").value) || 30);
      p.dailyTargets.newWords = Math.max(1, Number(container.querySelector("#goal-new-words").value) || 10);
      p.dailyTargets.reviewWords = Math.max(1, Number(container.querySelector("#goal-rev-words").value) || 15);
      p.dailyTargets.grammarCount = Math.max(1, Number(container.querySelector("#goal-grammar").value) || 2);
      p.dailyTargets.listeningCount = Math.max(1, Number(container.querySelector("#goal-listening").value) || 1);
      p.dailyTargets.hanziWriteCount = Math.max(1, Number(container.querySelector("#goal-hanzi").value) || 5);
      QCore.saveState(true);
      QCore.showToast("Đã cập nhật mục tiêu học tập hàng ngày!");
      renderDashboard(container);
    };
  }

  /* ==================== 3.2. PLACEMENT TEST & HSK 1-6 ROADMAP ==================== */
  let activeTestState = null;

  function renderAssessment(container) {
    const st = QCore.getState();
    const p = st.profile;
    const roadmap = window.QCHINESE_HSK_ROADMAP || [];

    if (activeTestState && activeTestState.mode === "placement") {
      renderPlacementSession(container);
      return;
    }
    if (activeTestState && activeTestState.mode === "levelup") {
      renderLevelUpExam(container);
      return;
    }

    const report = st.placementReport;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🧭 Đánh giá trình độ & Lộ trình HSK 1 – HSK 6</h2>
          <p>Xác định chính xác năng lực 7 kỹ năng. Lưu ý: Hệ thống chỉ nâng cấp độ HSK dựa trên bài kiểm tra thành thạo thực tế, không tự động nhảy cấp theo số ngày học.</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="btn-start-placement">
            ${p.placementCompleted ? "🔄 Làm lại bài Kiểm tra đầu vào" : "🚀 Bắt đầu Kiểm tra đầu vào (7 phần)"}
          </button>
          <button class="btn btn-outline" id="btn-beginner-zero">🌱 Tôi bắt đầu từ con số 0 tuyệt đối (Vào thẳng HSK 1)</button>
        </div>
      </div>

      ${
        report
          ? `
        <div class="card" style="margin-bottom:24px;border-color:var(--primary);">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px;">
            <div>
              <span class="badge badge-jade">Kết quả đánh giá gần nhất (${QCore.escapeHtml(report.date)})</span>
              <h3 style="margin:6px 0 0;font-size:20px;">Trình độ: ${QCore.escapeHtml(report.levelLabel)} · Đề xuất học: HSK ${report.recommendedHsk} (Tổng điểm: ${report.totalScore}/100)</h3>
            </div>
          </div>

          <div class="grid-2" style="margin-bottom:16px;">
            <div>
              <h4 style="margin:0 0 10px;">📊 Điểm chi tiết 7 kỹ năng</h4>
              <div style="display:flex;flex-direction:column;gap:9px;">
                ${Object.entries(report.skillBreakdown)
                  .map(
                    ([k, item]) => `
                  <div>
                    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;">
                      <span>${QCore.escapeHtml(item.label)}</span>
                      <strong>${item.pct}%</strong>
                    </div>
                    <div class="progress-track" style="height:8px;"><div class="progress-fill" style="width:${item.pct}%"></div></div>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>

            <div style="display:flex;flex-direction:column;gap:10px;">
              <div class="card-subtle">
                <strong style="color:var(--primary);">✅ Kiến thức đã nắm vững:</strong>
                <p style="margin:4px 0 0;font-size:13.5px;">${QCore.escapeHtml(report.masteredText)}</p>
              </div>
              <div class="card-subtle">
                <strong style="color:var(--accent-amber);">⚠️ Kiến thức còn yếu:</strong>
                <p style="margin:4px 0 0;font-size:13.5px;">${QCore.escapeHtml(report.weakText)}</p>
              </div>
              <div class="card-subtle">
                <strong style="color:var(--accent-blue);">🎯 Ưu tiên & Lộ trình đề xuất:</strong>
                <p style="margin:4px 0 0;font-size:13.5px;">${QCore.escapeHtml(report.priorityText)}</p>
              </div>
            </div>
          </div>
        </div>
      `
          : ""
      }

      <h3 style="margin:0 0 14px;font-size:19px;">🗺️ Hệ thống cấp độ Lộ trình HSK 1 – HSK 6 (Giản thể)</h3>
      <div class="grid-3">
        ${roadmap
          .map((r) => {
            const isCurrent = p.hskLevel === r.level;
            const isUnlocked = r.level <= (p.unlockedHsk || 1);
            return `
              <div class="card" style="border-color:${isCurrent ? "var(--primary)" : "var(--border-color)"};display:flex;flex-direction:column;justify-content:space-between;gap:14px;">
                <div>
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                    <span class="badge ${isCurrent ? "badge-jade" : isUnlocked ? "badge-blue" : ""}">${r.badge} · ${r.stage}</span>
                    <span style="font-size:12px;color:var(--text-muted);">${r.vocabTarget}</span>
                  </div>
                  <p style="font-size:13.5px;color:var(--text-secondary);margin:0 0 10px;">${r.desc}</p>
                  <ul style="margin:0;padding-left:18px;font-size:13px;color:var(--text-main);">
                    ${r.milestones.map((m) => `<li style="margin-bottom:4px;">${m}</li>`).join("")}
                  </ul>
                </div>

                <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:10px;border-top:1px solid var(--border-color);">
                  ${
                    isUnlocked
                      ? `<button class="btn ${isCurrent ? "btn-primary" : "btn-outline"} btn-sm" data-select-hsk="${r.level}">
                          ${isCurrent ? "✓ Đang theo học cấp này" : `Chọn học HSK ${r.level}`}
                        </button>`
                      : `<span class="badge">🔒 Cần đạt ≥75% bài thi HSK ${r.level - 1}</span>`
                  }
                  ${
                    r.level <= 5 && isUnlocked
                      ? `<button class="btn btn-soft btn-sm" data-exam-hsk="${r.level}">📝 Thi lên HSK ${r.level + 1}</button>`
                      : ""
                  }
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    container.querySelector("#btn-start-placement").onclick = () => {
      activeTestState = {
        mode: "placement",
        idx: 0,
        answers: {},
        reorderDraft: []
      };
      renderPlacementSession(container);
    };

    container.querySelector("#btn-beginner-zero").onclick = () => {
      p.levelLabel = "Người mới bắt đầu (Con số 0)";
      p.hskLevel = 1;
      p.unlockedHsk = Math.max(p.unlockedHsk || 1, 1);
      p.placementCompleted = true;
      st.placementReport = {
        date: QCore.todayStr(),
        totalScore: 0,
        recommendedHsk: 1,
        levelLabel: "Người mới bắt đầu (Con số 0)",
        skillBreakdown: {
          pinyin: { label: "Pinyin & Thanh điệu", pct: 0 },
          vocab: { label: "Từ vựng", pct: 0 },
          hanzi: { label: "Chữ Hán", pct: 0 },
          grammar: { label: "Ngữ pháp", pct: 0 },
          listening: { label: "Nghe hiểu", pct: 0 },
          reading: { label: "Đọc hiểu", pct: 0 },
          writing: { label: "Viết & Sắp xếp câu", pct: 0 }
        },
        masteredText: "Bạn chọn bắt đầu từ nền tảng 0 — giáo viên AI sẽ giải thích hoàn toàn bằng tiếng Việt từng bước một!",
        weakText: "Chưa làm quen Pinyin, 4 thanh điệu và nét cơ bản chữ Hán Giản thể.",
        priorityText: "Bước 1: Học bảng Pinyin & 4 thanh điệu → Bước 2: Tập viết 10 chữ Hán HSK 1 đầu tiên (你, 好, 我, 是, 人, 月, 学, 生...)."
      };
      QCore.saveState(true);
      QCore.showToast("Đã thiết lập lộ trình HSK 1 từ con số 0 cho bạn!");
      renderAssessment(container);
    };

    container.querySelectorAll("[data-select-hsk]").forEach((btn) => {
      btn.onclick = () => {
        const lv = Number(btn.getAttribute("data-select-hsk"));
        p.hskLevel = lv;
        const found = roadmap.find((x) => x.level === lv);
        if (found) p.levelLabel = found.stage;
        QCore.saveState(true);
        QCore.showToast(`Đã chuyển cấp độ đang học sang HSK ${lv}!`);
        renderAssessment(container);
      };
    });

    container.querySelectorAll("[data-exam-hsk]").forEach((btn) => {
      btn.onclick = () => {
        const lv = Number(btn.getAttribute("data-exam-hsk"));
        activeTestState = {
          mode: "levelup",
          targetFromLevel: lv,
          answers: {}
        };
        renderLevelUpExam(container);
      };
    });
  }

  function renderPlacementSession(container) {
    const questions = window.QCHINESE_PLACEMENT_TEST || [];
    const q = questions[activeTestState.idx];
    const progressPct = Math.round(((activeTestState.idx + 1) / questions.length) * 100);

    container.innerHTML = `
      <div class="card" style="max-width:780px;margin:0 auto;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:10px;flex-wrap:wrap;">
          <span class="badge badge-jade">Phần kiểm tra: ${QCore.escapeHtml(q.skillLabel)} (Câu ${activeTestState.idx + 1}/${questions.length})</span>
          <button class="btn btn-outline btn-sm" id="pt-exit">✕ Thoát bài kiểm tra</button>
        </div>
        <div class="progress-track" style="margin-bottom:20px;"><div class="progress-fill" style="width:${progressPct}%"></div></div>

        <p style="font-size:13px;color:var(--text-muted);margin:0 0 8px;">
          💡 Nếu bạn mới bắt đầu và chưa biết câu này, hãy thoải mái bấm nút <strong>"Mình chưa biết câu này"</strong> ở dưới nhé!
        </p>

        ${
          q.audioText
            ? `
          <div class="card-subtle" style="margin-bottom:14px;display:flex;align-items:center;gap:12px;">
            <button class="btn btn-primary" id="pt-play-audio">🔊 Nghe âm thanh chuẩn</button>
            <button class="btn btn-outline btn-sm" id="pt-play-slow">🐢 Nghe chậm (0.65x)</button>
          </div>
        `
            : ""
        }

        ${
          q.passage
            ? `
          <div class="card-subtle hanzi-text" style="margin-bottom:14px;font-size:20px;line-height:1.8;">
            ${QCore.escapeHtml(q.passage)}
          </div>
        `
            : ""
        }

        <h3 style="margin:0 0 16px;font-size:18px;">${QCore.escapeHtml(q.prompt)}</h3>

        ${
          q.type === "choice"
            ? `
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
            ${q.options
              .map(
                (opt) => `
              <button class="btn ${activeTestState.answers[q.id] === opt ? "btn-primary" : "btn-outline"}" style="justify-content:flex-start;padding:13px 16px;font-size:15px;" data-pt-opt="${QCore.escapeHtml(opt)}">
                ${QCore.escapeHtml(opt)}
              </button>
            `
              )
              .join("")}
          </div>
        `
            : `
          <div class="card-subtle" style="margin-bottom:14px;">
            <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:6px;">Câu bạn đang ghép (bấm vào từ bên dưới để xếp câu):</div>
            <div style="min-height:42px;font-size:20px;font-weight:700;" class="hanzi-text" id="pt-reorder-preview">
              ${QCore.escapeHtml((activeTestState.reorderDraft || []).join("")) || "—"}
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">
            ${q.words
              .map(
                (w, wi) => `
              <button class="btn btn-outline hanzi-text" style="font-size:18px;" data-pt-word="${QCore.escapeHtml(w)}" data-wi="${wi}">${QCore.escapeHtml(w)}</button>
            `
              )
              .join("")}
            <button class="btn btn-danger btn-sm" id="pt-clear-reorder">Xóa xếp lại</button>
          </div>
        `
        }

        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-top:1px solid var(--border-color);padding-top:16px;">
          <button class="btn btn-soft" id="pt-skip">🌱 Mình chưa biết câu này (Bỏ qua)</button>
          <div style="display:flex;gap:8px;">
            ${activeTestState.idx > 0 ? `<button class="btn btn-outline" id="pt-prev">← Câu trước</button>` : ""}
            <button class="btn btn-primary" id="pt-next">${activeTestState.idx === questions.length - 1 ? "Hoàn thành & Xem đánh giá" : "Câu tiếp theo →"}</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#pt-exit").onclick = () => {
      activeTestState = null;
      renderAssessment(container);
    };

    if (q.audioText) {
      container.querySelector("#pt-play-audio").onclick = () => QCore.speakChinese(q.audioText);
      container.querySelector("#pt-play-slow").onclick = () => QCore.speakChinese(q.audioText, { slow: true });
    }

    container.querySelectorAll("[data-pt-opt]").forEach((btn) => {
      btn.onclick = () => {
        activeTestState.answers[q.id] = btn.getAttribute("data-pt-opt");
        renderPlacementSession(container);
      };
    });

    container.querySelectorAll("[data-pt-word]").forEach((btn) => {
      btn.onclick = () => {
        activeTestState.reorderDraft = activeTestState.reorderDraft || [];
        activeTestState.reorderDraft.push(btn.getAttribute("data-pt-word"));
        activeTestState.answers[q.id] = activeTestState.reorderDraft.join("");
        renderPlacementSession(container);
      };
    });

    const clearBtn = container.querySelector("#pt-clear-reorder");
    if (clearBtn) {
      clearBtn.onclick = () => {
        activeTestState.reorderDraft = [];
        delete activeTestState.answers[q.id];
        renderPlacementSession(container);
      };
    }

    const goNext = () => {
      if (activeTestState.idx < questions.length - 1) {
        activeTestState.idx += 1;
        activeTestState.reorderDraft = [];
        renderPlacementSession(container);
      } else {
        finalizePlacementTest(container);
      }
    };

    container.querySelector("#pt-skip").onclick = () => {
      activeTestState.answers[q.id] = "__SKIP__";
      goNext();
    };
    const prevBtn = container.querySelector("#pt-prev");
    if (prevBtn) {
      prevBtn.onclick = () => {
        activeTestState.idx -= 1;
        renderPlacementSession(container);
      };
    }
    container.querySelector("#pt-next").onclick = goNext;
  }

  function finalizePlacementTest(container) {
    const questions = window.QCHINESE_PLACEMENT_TEST || [];
    const skillStats = {
      pinyin: { label: "Pinyin & Thanh điệu", right: 0, total: 0 },
      vocab: { label: "Từ vựng", right: 0, total: 0 },
      hanzi: { label: "Chữ Hán", right: 0, total: 0 },
      grammar: { label: "Ngữ pháp", right: 0, total: 0 },
      listening: { label: "Nghe hiểu", right: 0, total: 0 },
      reading: { label: "Đọc hiểu", right: 0, total: 0 },
      writing: { label: "Viết & Sắp xếp câu", right: 0, total: 0 }
    };

    let totalRight = 0;
    questions.forEach((q) => {
      skillStats[q.skill].total += 1;
      const ans = activeTestState.answers[q.id] || "";
      if (ans === q.answer) {
        skillStats[q.skill].right += 1;
        totalRight += 1;
      }
    });

    const totalScore = Math.round((totalRight / questions.length) * 100);
    let recHsk = 1;
    let levelLabel = "Người mới bắt đầu";
    if (totalScore >= 85) {
      recHsk = 3;
      levelLabel = "Sơ trung cấp (HSK 3)";
    } else if (totalScore >= 55) {
      recHsk = 2;
      levelLabel = "Sơ cấp (HSK 2)";
    }

    const breakdown = {};
    const mastered = [];
    const weak = [];
    Object.entries(skillStats).forEach(([k, v]) => {
      const pct = v.total ? Math.round((v.right / v.total) * 100) : 0;
      breakdown[k] = { label: v.label, pct };
      QCore.updateSkillScore(k, pct);
      if (pct >= 75) mastered.push(v.label);
      else weak.push(v.label);
    });

    const st = QCore.getState();
    st.profile.placementCompleted = true;
    st.profile.lastTestScore = totalScore;
    st.profile.hskLevel = recHsk;
    st.profile.unlockedHsk = Math.max(st.profile.unlockedHsk || 1, recHsk);
    st.profile.levelLabel = levelLabel;

    st.placementReport = {
      date: QCore.todayStr(),
      totalScore,
      recommendedHsk: recHsk,
      levelLabel,
      skillBreakdown: breakdown,
      masteredText: mastered.length ? mastered.join(", ") : "Bạn đang bắt đầu từ nền tảng mới hoàn toàn — rất tuyệt vời để học chuẩn ngay từ đầu!",
      weakText: weak.length ? weak.join(", ") : "Bạn nắm rất đều cả 7 kỹ năng cơ bản!",
      priorityText:
        recHsk === 1
          ? "Ưu tiên 1: Nắm chắc Bảng Pinyin & 4 Thanh điệu → Ưu tiên 2: Học thứ tự nét các chữ Hán HSK 1 cốt lõi → Ưu tiên 3: Ghép câu với 是, 很, 在."
          : recHsk === 2
          ? "Ưu tiên 1: Mở rộng từ vựng đa nghĩa HSK 2 & chữ đa âm (多音字) → Ưu tiên 2: Phân biệt 不/没 và luyện nghe hội thoại."
          : "Ưu tiên 1: Luyện đọc đoạn văn HSK 3 không phụ thuộc Pinyin → Ưu tiên 2: Thực hành hội thoại tự do với AI và viết đoạn văn."
    };

    st.testHistory.unshift({
      date: QCore.todayStr(),
      type: "Kiểm tra đầu vào (Placement Test)",
      score: totalScore,
      level: `HSK ${recHsk}`
    });

    activeTestState = null;
    QCore.saveState(true);
    QCore.showToast(`Hoàn thành đánh giá! Đề xuất lộ trình: HSK ${recHsk} (${totalScore}/100 điểm).`);
    renderAssessment(container);
  }

  function renderLevelUpExam(container) {
    const lv = activeTestState.targetFromLevel;
    const questions = (window.QCHINESE_LEVEL_EXAMS && window.QCHINESE_LEVEL_EXAMS[lv]) || [];

    container.innerHTML = `
      <div class="card" style="max-width:780px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <span class="badge badge-blue">📝 Bài thi kiểm tra năng lực mở khóa HSK ${lv + 1} (Cần đạt ≥ 75%)</span>
          <button class="btn btn-outline btn-sm" id="lv-cancel">← Quay lại</button>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:20px;">
          ${questions
            .map(
              (item, idx) => `
            <div class="card-subtle">
              <strong style="display:block;margin-bottom:10px;">Câu ${idx + 1}: ${QCore.escapeHtml(item.q)}</strong>
              <div class="grid-2" style="gap:8px;">
                ${item.options
                  .map(
                    (opt) => `
                  <button class="btn ${activeTestState.answers[idx] === opt ? "btn-primary" : "btn-outline"} btn-sm hanzi-text" style="justify-content:flex-start;padding:10px 12px;" data-qidx="${idx}" data-opt="${QCore.escapeHtml(opt)}">
                    ${QCore.escapeHtml(opt)}
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <button class="btn btn-primary" id="lv-submit">Nộp bài kiểm tra lên cấp HSK ${lv + 1}</button>
      </div>
    `;

    container.querySelector("#lv-cancel").onclick = () => {
      activeTestState = null;
      renderAssessment(container);
    };

    container.querySelectorAll("[data-qidx]").forEach((btn) => {
      btn.onclick = () => {
        activeTestState.answers[btn.getAttribute("data-qidx")] = btn.getAttribute("data-opt");
        renderLevelUpExam(container);
      };
    });

    container.querySelector("#lv-submit").onclick = () => {
      let correct = 0;
      questions.forEach((item, idx) => {
        if (activeTestState.answers[idx] === item.answer) correct += 1;
      });
      const score = Math.round((correct / Math.max(1, questions.length)) * 100);
      const st = QCore.getState();
      st.profile.lastTestScore = score;
      st.testHistory.unshift({
        date: QCore.todayStr(),
        type: `Thi vượt cấp HSK ${lv} → HSK ${lv + 1}`,
        score,
        level: score >= 75 ? `Đạt HSK ${lv + 1}` : `Chưa đạt (${score}%)`
      });

      if (score >= 75) {
        st.profile.unlockedHsk = Math.max(st.profile.unlockedHsk || 1, lv + 1);
        st.profile.hskLevel = lv + 1;
        const found = (window.QCHINESE_HSK_ROADMAP || []).find((x) => x.level === lv + 1);
        if (found) st.profile.levelLabel = found.stage;
        QCore.showToast(`🎉 Chúc mừng! Bạn đạt ${score}% và chính thức mở khóa cấp độ HSK ${lv + 1}!`);
      } else {
        QCore.showToast(`Bạn đạt ${score}% (cần tối thiểu 75% để lên cấp). Hãy ôn tập thêm từ vựng & ngữ pháp HSK ${lv} rồi thi lại nhé!`);
      }
      activeTestState = null;
      QCore.saveState(true);
      renderAssessment(container);
    };
  }

  return {
    renderDashboard,
    renderAssessment
  };
})();
