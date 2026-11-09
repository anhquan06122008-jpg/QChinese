/* -*- coding: utf-8 -*-
 * QChinese – Modules 11, 12, 13:
 * - Personal Chinese Notebook (PHẦN 8)
 * - Progress Analytics & AI Diagnosis Charts by Day/Week/Month (PHẦN 9)
 * - Settings, Multi-User Account Security & Backup/Restore (PHẦN 10 & 11)
 */

window.QNotebookAnalyticsSettings = (function () {
  /* ==================== PHẦN 8: CHINESE NOTEBOOK ==================== */
  const NB_CATEGORIES = [
    { id: "all", label: "Tất cả mục lưu" },
    { id: "vocab", label: "📖 Từ vựng mới" },
    { id: "hard_hanzi", label: "✍️ Chữ Hán khó nhớ" },
    { id: "grammar", label: "🧩 Ngữ pháp quan trọng" },
    { id: "sentence", label: "💬 Câu ví dụ" },
    { id: "wrong_write", label: "⚠️ Thường viết sai" },
    { id: "wrong_pron", label: "🎙️ Thường phát âm sai" },
    { id: "note", label: "📝 Ghi chú cá nhân" }
  ];

  let nbCat = "all";
  let nbSearch = "";
  let nbReviewMode = false;
  let nbReviewIdx = 0;
  let nbRevealed = false;
  let editingId = null;

  function renderNotebook(container) {
    const st = QCore.getState();
    const allItems = st.notebook || [];

    const filtered = allItems.filter((item) => {
      if (nbCat !== "all" && item.category !== nbCat) return false;
      if (nbSearch) {
        const q = nbSearch.toLowerCase();
        const hay = `${item.hanzi} ${item.pinyin} ${item.english} ${item.vietnamese} ${item.note} ${item.example}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>📒 Sổ Tay Cá Nhân – Chinese Notebook (${allItems.length} mục)</h2>
          <p>Lưu trữ riêng biệt trên tài khoản của bạn: từ mới, chữ khó, ngữ pháp, lỗi hay sai và ôn tập bất cứ lúc nào.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn ${nbReviewMode ? "btn-primary" : "btn-soft"} btn-sm" id="nb-tog-review">
            ${nbReviewMode ? "← Quay lại danh sách" : "🔄 Ôn tập Flashcard từ Sổ tay"}
          </button>
          <button class="btn btn-outline btn-sm" id="nb-export-json">⬇️ Xuất dữ liệu Sổ tay (.json)</button>
        </div>
      </div>

      ${
        nbReviewMode
          ? renderNotebookReviewHTML(filtered)
          : `
        <!-- Add / Edit Form -->
        <div class="card" style="margin-bottom:18px;">
          <h3 style="margin:0 0 12px;font-size:16px;">${editingId ? "✏️ Chỉnh sửa mục Sổ tay" : "➕ Thêm mục mới vào Sổ tay"}</h3>
          <div class="grid-3" style="gap:10px;margin-bottom:10px;">
            <select class="select-field" id="nb-f-cat">
              ${NB_CATEGORIES.filter((c) => c.id !== "all")
                .map((c) => `<option value="${c.id}">${c.label}</option>`)
                .join("")}
            </select>
            <input class="input-field hanzi-text" id="nb-f-hz" data-pinyin-ime="true" placeholder="Chữ Hán Giản thể (gõ Pinyin để gợi ý)...">
            <input class="input-field pinyin-text" id="nb-f-py" data-pinyin-ime="true" data-pinyin-mode="pinyin-only" placeholder="Pinyin có dấu (vd: xǐhuan)...">
            <input class="input-field" id="nb-f-vi" placeholder="Nghĩa tiếng Việt...">
            <input class="input-field" id="nb-f-en" placeholder="Nghĩa tiếng Anh...">
            <input class="input-field hanzi-text" id="nb-f-ex" data-pinyin-ime="true" placeholder="Câu ví dụ thực tế...">
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <input class="input-field" id="nb-f-note" style="flex:1;min-width:220px;" placeholder="Ghi chú cá nhân / mẹo nhớ...">
            <select class="select-field" id="nb-f-mem" style="width:170px;">
              <option value="1">Mức nhớ: ★☆☆☆☆ (1)</option>
              <option value="2">Mức nhớ: ★★☆☆☆ (2)</option>
              <option value="3" selected>Mức nhớ: ★★★☆☆ (3)</option>
              <option value="4">Mức nhớ: ★★★★☆ (4)</option>
              <option value="5">Mức nhớ: ★★★★★ (5)</option>
            </select>
            ${editingId ? `<button class="btn btn-outline" id="nb-cancel-edit">Hủy</button>` : ""}
            <button class="btn btn-primary" id="nb-save-btn">${editingId ? "Cập nhật" : "Lưu vào Sổ tay"}</button>
          </div>
        </div>

        <!-- Search & Category Filter -->
        <div class="card" style="padding:14px 18px;margin-bottom:18px;">
          <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${NB_CATEGORIES.map(
                (c) => `<button class="btn ${nbCat === c.id ? "btn-primary" : "btn-outline"} btn-sm" data-nbcat="${c.id}">${c.label}</button>`
              ).join("")}
            </div>
            <input class="input-field" id="nb-search-inp" style="max-width:280px;padding:7px 12px;" placeholder="🔍 Tìm chữ Hán, Pinyin, nghĩa Việt..." value="${QCore.escapeHtml(nbSearch)}">
          </div>
        </div>

        <!-- Entries List -->
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${
            !filtered.length
              ? `<div class="card" style="text-align:center;padding:34px;color:var(--text-muted);">Chưa có mục nào trong phân mục này. Bạn có thể lưu trực tiếp từ trang Học từ vựng, Học chữ Hán, Luyện đọc hoặc thêm ở khung phía trên!</div>`
              : filtered
                  .map((item) => {
                    const catObj = NB_CATEGORIES.find((c) => c.id === item.category) || NB_CATEGORIES[1];
                    const stars = "★".repeat(item.memoryLevel || 1) + "☆".repeat(5 - (item.memoryLevel || 1));
                    return `
                    <div class="card" style="padding:16px 20px;">
                      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;">
                        <div>
                          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:6px;">
                            <span class="badge badge-jade">${catObj.label}</span>
                            <span class="badge badge-amber" title="Mức độ ghi nhớ">${stars}</span>
                            <span style="font-size:12px;color:var(--text-muted);">Ngày lưu: ${QCore.escapeHtml(item.savedAt || "")}</span>
                          </div>
                          <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
                            <span class="hanzi-calligraphy" style="font-size:32px;">${QCore.escapeHtml(item.hanzi)}</span>
                            <span class="pinyin-text" style="font-size:18px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(item.pinyin)}</span>
                          </div>
                          <div style="font-size:14px;margin-top:4px;">🇻🇳 <strong>${QCore.escapeHtml(item.vietnamese)}</strong> ${item.english ? `· 🇬🇧 ${QCore.escapeHtml(item.english)}` : ""}</div>
                          ${item.example ? `<div style="font-size:13px;color:var(--text-secondary);margin-top:4px;" class="hanzi-text">💬 Ví dụ: ${QCore.escapeHtml(item.example)}</div>` : ""}
                          ${item.note ? `<div style="font-size:13px;color:var(--accent-amber);margin-top:4px;">📝 Ghi chú: ${QCore.escapeHtml(item.note)}</div>` : ""}
                        </div>

                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                          <button class="btn btn-soft btn-sm" data-nb-speak="${QCore.escapeHtml(item.hanzi)}">🔊 Phát âm</button>
                          <button class="btn btn-outline btn-sm" data-nb-edit="${item.id}">✏️ Sửa</button>
                          <button class="btn btn-danger btn-sm" data-nb-del="${item.id}">🗑️ Xóa</button>
                        </div>
                      </div>
                    </div>
                  `;
                  })
                  .join("")
          }
        </div>
      `
      }
    `;

    container.querySelector("#nb-tog-review").onclick = () => {
      nbReviewMode = !nbReviewMode;
      nbReviewIdx = 0;
      nbRevealed = false;
      renderNotebook(container);
    };

    container.querySelector("#nb-export-json").onclick = () => {
      const blob = new Blob([JSON.stringify(allItems, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qchinese_notebook_${QCore.todayStr()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    if (nbReviewMode) {
      bindNotebookReviewEvents(container, filtered);
      return;
    }

    // Populate form if editing
    if (editingId) {
      const target = allItems.find((x) => x.id === editingId);
      if (target) {
        container.querySelector("#nb-f-cat").value = target.category || "vocab";
        container.querySelector("#nb-f-hz").value = target.hanzi || "";
        container.querySelector("#nb-f-py").value = target.pinyin || "";
        container.querySelector("#nb-f-vi").value = target.vietnamese || "";
        container.querySelector("#nb-f-en").value = target.english || "";
        container.querySelector("#nb-f-ex").value = target.example || "";
        container.querySelector("#nb-f-note").value = target.note || "";
        container.querySelector("#nb-f-mem").value = String(target.memoryLevel || 3);
      }
      const cancelBtn = container.querySelector("#nb-cancel-edit");
      if (cancelBtn) {
        cancelBtn.onclick = () => {
          editingId = null;
          renderNotebook(container);
        };
      }
    }

    container.querySelector("#nb-save-btn").onclick = () => {
      const hz = container.querySelector("#nb-f-hz").value.trim();
      if (!hz) {
        QCore.showToast("Vui lòng nhập Chữ Hán hoặc tiêu đề ghi chú!");
        return;
      }
      const payload = {
        category: container.querySelector("#nb-f-cat").value,
        hanzi: hz,
        pinyin: container.querySelector("#nb-f-py").value.trim(),
        vietnamese: container.querySelector("#nb-f-vi").value.trim(),
        english: container.querySelector("#nb-f-en").value.trim(),
        example: container.querySelector("#nb-f-ex").value.trim(),
        note: container.querySelector("#nb-f-note").value.trim(),
        memoryLevel: Number(container.querySelector("#nb-f-mem").value) || 3
      };

      if (editingId) {
        const idx = st.notebook.findIndex((x) => x.id === editingId);
        if (idx >= 0) {
          st.notebook[idx] = Object.assign({}, st.notebook[idx], payload);
        }
        editingId = null;
        QCore.saveState(true);
        QCore.showToast("Đã cập nhật mục Sổ tay!");
      } else {
        QCore.addToNotebook(payload);
      }
      renderNotebook(container);
    };

    container.querySelectorAll("[data-nbcat]").forEach((b) => {
      b.onclick = () => {
        nbCat = b.getAttribute("data-nbcat");
        renderNotebook(container);
      };
    });

    const searchInp = container.querySelector("#nb-search-inp");
    searchInp.oninput = (e) => {
      nbSearch = e.target.value;
      renderNotebook(container);
      const ni = container.querySelector("#nb-search-inp");
      ni.focus();
      ni.setSelectionRange(ni.value.length, ni.value.length);
    };

    container.querySelectorAll("[data-nb-speak]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-nb-speak"));
    });
    container.querySelectorAll("[data-nb-edit]").forEach((b) => {
      b.onclick = () => {
        editingId = b.getAttribute("data-nb-edit");
        renderNotebook(container);
      };
    });
    container.querySelectorAll("[data-nb-del]").forEach((b) => {
      b.onclick = () => {
        const id = b.getAttribute("data-nb-del");
        st.notebook = st.notebook.filter((x) => x.id !== id);
        QCore.saveState(true);
        renderNotebook(container);
      };
    });
  }

  function renderNotebookReviewHTML(list) {
    if (!list.length) {
      return `<div class="card" style="text-align:center;padding:34px;">Sổ tay hiện chưa có mục nào để ôn tập.</div>`;
    }
    const item = list[nbReviewIdx % list.length];
    return `
      <div class="card" style="max-width:640px;margin:0 auto;text-align:center;">
        <span class="badge badge-jade">Ôn tập Sổ tay (${(nbReviewIdx % list.length) + 1}/${list.length})</span>
        <div class="hanzi-calligraphy" style="font-size:66px;margin:14px 0 8px;">${QCore.escapeHtml(item.hanzi)}</div>
        <button class="btn btn-soft btn-sm" id="nbr-speak" style="margin-bottom:14px;">🔊 Nghe phát âm</button>
        ${
          !nbRevealed
            ? `<div><button class="btn btn-primary" id="nbr-reveal">👁️ Hiện Pinyin & Nghĩa</button></div>`
            : `
            <div class="card-subtle" style="text-align:left;margin-bottom:14px;">
              <div style="font-size:20px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(item.pinyin)}</div>
              <div>🇻🇳 <strong>${QCore.escapeHtml(item.vietnamese)}</strong></div>
              <div>🇬🇧 ${QCore.escapeHtml(item.english)}</div>
              ${item.example ? `<div style="margin-top:4px;">💬 ${QCore.escapeHtml(item.example)}</div>` : ""}
            </div>
            <div style="display:flex;justify-content:center;gap:8px;">
              <button class="btn btn-outline btn-sm" data-nbr-mem="2">Cần ôn thêm (★★)</button>
              <button class="btn btn-primary btn-sm" data-nbr-mem="5">Đã thuộc lòng (★★★★★)</button>
            </div>
          `
        }
      </div>
    `;
  }

  function bindNotebookReviewEvents(container, list) {
    if (!list.length) return;
    const item = list[nbReviewIdx % list.length];
    const spk = container.querySelector("#nbr-speak");
    if (spk) spk.onclick = () => QCore.speakChinese(item.hanzi);
    const rev = container.querySelector("#nbr-reveal");
    if (rev) {
      rev.onclick = () => {
        nbRevealed = true;
        QCore.speakChinese(item.hanzi);
        renderNotebook(container);
      };
    }
    container.querySelectorAll("[data-nbr-mem]").forEach((b) => {
      b.onclick = () => {
        item.memoryLevel = Number(b.getAttribute("data-nbr-mem"));
        nbRevealed = false;
        nbReviewIdx = (nbReviewIdx + 1) % list.length;
        QCore.saveState(true);
        renderNotebook(container);
      };
    });
  }

  /* ==================== PHẦN 9: ANALYTICS & AI PROGRESS DIAGNOSIS ==================== */
  let chartRange = "day"; // "day" | "week" | "month"
  let cachedAiAdvice = null;

  function buildTimeSeries(dailyLogs, mode) {
    const today = new Date();
    const points = [];
    if (mode === "day") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const log = dailyLogs[key] || {};
        points.push({ label: `${d.getDate()}/${d.getMonth() + 1}`, minutes: log.minutes || 0, words: (log.newWords || 0) + (log.reviewWords || 0) });
      }
    } else if (mode === "week") {
      for (let w = 3; w >= 0; w--) {
        let mins = 0, words = 0;
        for (let k = 0; k < 7; k++) {
          const d = new Date(today);
          d.setDate(today.getDate() - (w * 7 + k));
          const key = d.toISOString().slice(0, 10);
          const log = dailyLogs[key] || {};
          mins += log.minutes || 0;
          words += (log.newWords || 0) + (log.reviewWords || 0);
        }
        points.push({ label: w === 0 ? "Tuần này" : `${w} tuần trước`, minutes: mins, words });
      }
    } else {
      for (let m = 5; m >= 0; m--) {
        const d = new Date(today.getFullYear(), today.getMonth() - m, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        let mins = 0, words = 0;
        Object.entries(dailyLogs).forEach(([k, v]) => {
          if (k.startsWith(ym)) {
            mins += v.minutes || 0;
            words += (v.newWords || 0) + (v.reviewWords || 0);
          }
        });
        points.push({ label: `T${d.getMonth() + 1}`, minutes: mins, words });
      }
    }
    return points;
  }

  function renderAnalytics(container) {
    const st = QCore.getState();
    const srsEntries = Object.values(st.srs);
    const vocabLearned = srsEntries.length;
    const vocabRemembered = srsEntries.filter((x) => x.lastQuality >= 3).length;
    const retentionRate = vocabLearned ? Math.round((vocabRemembered / vocabLearned) * 100) : 0;

    const hanziEntries = Object.values(st.hanziProgress);
    const hanziLearned = hanziEntries.length;
    const hanziRight = hanziEntries.filter((x) => x.memorized).length;

    const todayLog = st.dailyLogs[QCore.todayStr()] || { minutes: 0 };
    const goalRate = Math.min(100, Math.round(((todayLog.minutes || 0) / Math.max(1, st.profile.dailyGoalMinutes)) * 100));

    const series = buildTimeSeries(st.dailyLogs, chartRange);
    const maxMin = Math.max(30, ...series.map((s) => s.minutes));

    const sc = st.skillScores;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>📊 Thống Kê & AI Phân Tích Tiến Độ Học Tập</h2>
          <p>Theo dõi đầy đủ 12 chỉ số chuyên sâu, biểu đồ theo Ngày / Tuần / Tháng và nhận lộ trình điều chỉnh từ AI Giáo viên.</p>
        </div>
        <button class="btn btn-primary btn-sm" id="ana-refresh-ai">🤖 Phân tích tiến độ bằng AI ngay</button>
      </div>

      <!-- 12 Required Metrics -->
      <div class="grid-4" style="margin-bottom:20px;">
        <div class="kpi-card"><span class="kpi-label">1. Số từ đã học</span><span class="kpi-value">${vocabLearned}</span></div>
        <div class="kpi-card"><span class="kpi-label">2. Số chữ Hán đã học</span><span class="kpi-value">${hanziLearned}</span></div>
        <div class="kpi-card"><span class="kpi-label">3. Số chữ viết đúng</span><span class="kpi-value">${hanziRight}</span></div>
        <div class="kpi-card"><span class="kpi-label">4. Tỷ lệ nhớ từ vựng</span><span class="kpi-value">${retentionRate}%</span></div>
        <div class="kpi-card"><span class="kpi-label">5. Điểm Nghe</span><span class="kpi-value">${sc.listening || 0}/100</span></div>
        <div class="kpi-card"><span class="kpi-label">6. Điểm Nói</span><span class="kpi-value">${sc.speaking || 0}/100</span></div>
        <div class="kpi-card"><span class="kpi-label">7. Điểm Đọc</span><span class="kpi-value">${sc.reading || 0}/100</span></div>
        <div class="kpi-card"><span class="kpi-label">8. Điểm Viết</span><span class="kpi-value">${sc.writing || 0}/100</span></div>
        <div class="kpi-card"><span class="kpi-label">9. Điểm Ngữ pháp</span><span class="kpi-value">${sc.grammar || 0}/100</span></div>
        <div class="kpi-card"><span class="kpi-label">10. Thời gian học hôm nay</span><span class="kpi-value">${todayLog.minutes || 0} phút</span></div>
        <div class="kpi-card"><span class="kpi-label">11. Hoàn thành mục tiêu giờ</span><span class="kpi-value">${goalRate}%</span></div>
        <div class="kpi-card"><span class="kpi-label">12. Cấp HSK hiện tại</span><span class="kpi-value">HSK ${st.profile.hskLevel}</span></div>
      </div>

      <div class="grid-2" style="margin-bottom:20px;">
        <!-- SVG Bar Chart by Day / Week / Month -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
            <h3 style="margin:0;font-size:17px;">📈 Biểu đồ thời gian học & từ vựng</h3>
            <div class="tabs-bar">
              <button class="tab-pill ${chartRange === "day" ? "active" : ""}" data-crange="day">Theo Ngày</button>
              <button class="tab-pill ${chartRange === "week" ? "active" : ""}" data-crange="week">Theo Tuần</button>
              <button class="tab-pill ${chartRange === "month" ? "active" : ""}" data-crange="month">Theo Tháng</button>
            </div>
          </div>

          <svg viewBox="0 0 460 210" style="width:100%;height:210px;background:var(--bg-subtle);border-radius:14px;padding:10px;">
            ${series
              .map((pt, i) => {
                const slotW = 420 / series.length;
                const barW = Math.min(36, slotW * 0.55);
                const x = 24 + i * slotW + (slotW - barW) / 2;
                const barH = Math.max(4, Math.round((pt.minutes / maxMin) * 130));
                const y = 165 - barH;
                return `
                  <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="6" fill="var(--primary)"/>
                  <text x="${x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="11" fill="var(--text-main)" font-weight="700">${pt.minutes}p</text>
                  <text x="${x + barW / 2}" y="186" text-anchor="middle" font-size="11" fill="var(--text-muted)">${pt.label}</text>
                `;
              })
              .join("")}
          </svg>
        </div>

        <!-- AI Progress Diagnosis Card -->
        <div class="card" id="ana-ai-card">
          <h3 style="margin:0 0 10px;font-size:17px;">👩‍🏫 AI Giáo viên nhận xét & đề xuất lộ trình</h3>
          <div id="ana-ai-body">
            ${cachedAiAdvice ? renderAiAdviceHTML(cachedAiAdvice) : `<div style="color:var(--text-muted);font-size:13.5px;">Đang tổng hợp dữ liệu học tập thực tế của bạn...</div>`}
          </div>
        </div>
      </div>

      <!-- Test History by Level -->
      <div class="card">
        <h3 style="margin:0 0 12px;font-size:17px;">🏆 Lịch sử kết quả kiểm tra theo từng cấp độ</h3>
        ${
          !st.testHistory.length
            ? `<p style="margin:0;color:var(--text-muted);">Bạn chưa có bài kiểm tra nào. Hãy vào mục <strong>Đánh giá trình độ</strong> để làm bài kiểm tra đầu tiên nhé!</p>`
            : `
            <table class="tri-table">
              <thead><tr><th>Ngày</th><th>Bài kiểm tra</th><th>Điểm số</th><th>Kết quả cấp độ</th></tr></thead>
              <tbody>
                ${st.testHistory
                  .map(
                    (h) => `<tr><td>${QCore.escapeHtml(h.date)}</td><td>${QCore.escapeHtml(h.type)}</td><td><strong>${h.score}/100</strong></td><td><span class="badge badge-jade">${QCore.escapeHtml(h.level)}</span></td></tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          `
        }
      </div>
    `;

    container.querySelectorAll("[data-crange]").forEach((b) => {
      b.onclick = () => {
        chartRange = b.getAttribute("data-crange");
        renderAnalytics(container);
      };
    });

    const loadAdvice = async () => {
      const bodyEl = container.querySelector("#ana-ai-body");
      if (bodyEl) bodyEl.innerHTML = `<div style="font-size:13.5px;">⏳ AI đang phân tích kết quả thực tế...</div>`;
      try {
        cachedAiAdvice = await QCore.apiFetch("/api/ai/analytics", {
          method: "POST",
          body: {
            stats: {
              vocabLearned,
              hanziMemorized: hanziRight,
              retentionRate,
              hskLevel: st.profile.hskLevel,
              skillScores: sc
            }
          }
        });
        if (bodyEl) bodyEl.innerHTML = renderAiAdviceHTML(cachedAiAdvice);
      } catch (e) {
        if (bodyEl) bodyEl.textContent = e.message;
      }
    };

    container.querySelector("#ana-refresh-ai").onclick = loadAdvice;
    if (!cachedAiAdvice) loadAdvice();
  }

  function renderAiAdviceHTML(adv) {
    return `
      <div class="card-subtle" style="border-left:4px solid var(--primary);margin-bottom:12px;font-size:14px;">
        “${QCore.escapeHtml(adv.summary)}”
      </div>
      <div style="font-size:13px;margin-bottom:8px;">
        <strong style="color:var(--primary);">✅ Điểm mạnh:</strong>
        <ul style="margin:4px 0 0;padding-left:18px;">${(adv.strengths || []).map((s) => `<li>${QCore.escapeHtml(s)}</li>`).join("")}</ul>
      </div>
      <div style="font-size:13px;margin-bottom:8px;">
        <strong style="color:var(--accent-amber);">⚠️ Cần khắc phục:</strong>
        <ul style="margin:4px 0 0;padding-left:18px;">${(adv.weaknesses || []).map((w) => `<li>${QCore.escapeHtml(w)}</li>`).join("")}</ul>
      </div>
      <div style="font-size:13px;">
        <strong style="color:var(--accent-blue);">🎯 Đề xuất ưu tiên tuần tới:</strong>
        <ul style="margin:4px 0 0;padding-left:18px;">${(adv.recommendations || []).map((r) => `<li>${QCore.escapeHtml(r)}</li>`).join("")}</ul>
      </div>
    `;
  }

  /* ==================== PHẦN 10 & 11: SETTINGS & MULTI-USER ACCOUNT ==================== */
  function renderSettings(container) {
    const st = QCore.getState();
    const p = st.profile;
    const user = QCore.getUser() || { username: "guest", displayName: p.name };
    const health = QCore.getServerHealth();

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>⚙️ Cài Đặt Hệ Thống & Quản Lý Tài Khoản</h2>
          <p>Mỗi người học có một tài khoản và mật khẩu riêng biệt để khi chia sẻ website không bị học trùng tiến độ lên nhau.</p>
        </div>
        <button class="btn btn-danger btn-sm" id="set-logout-btn">🚪 Đăng xuất / Đổi sang tài khoản khác</button>
      </div>

      <div class="grid-2">
        <!-- Multi-User Account & Password Security -->
        <div class="card">
          <h3 style="margin:0 0 12px;font-size:17px;">👤 Tài khoản cá nhân & Mật khẩu</h3>
          <div class="card-subtle" style="margin-bottom:14px;">
            <div>Tên đăng nhập (ID riêng): <strong>@${QCore.escapeHtml(user.username)}</strong></div>
            <div>Chế độ lưu trữ: <strong>${health.ok ? "SQLite Database trên Server + Sao lưu trình duyệt" : "Lưu trữ độc lập theo tài khoản trên trình duyệt"}</strong></div>
            <div>Trạng thái AI Backend: <strong>${health.aiConfigured ? `Đã kết nối ${health.aiProvider.toUpperCase()} (${health.aiModel})` : "Động cơ Sư phạm Tiếng Trung tích hợp sẵn (Cấu hình thêm GEMINI_API_KEY trong .env nếu muốn mở rộng)"}</strong></div>
          </div>

          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Tên hiển thị của người học</label>
          <input class="input-field" id="set-disp-name" value="${QCore.escapeHtml(p.name)}" style="margin-bottom:12px;">

          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Đổi mật khẩu (bỏ trống nếu không đổi)</label>
          <input type="password" class="input-field" id="set-curr-pw" placeholder="Mật khẩu hiện tại..." style="margin-bottom:8px;">
          <input type="password" class="input-field" id="set-new-pw" placeholder="Mật khẩu mới (tối thiểu 6 ký tự)..." style="margin-bottom:12px;">

          <button class="btn btn-primary btn-sm" id="set-save-account">Lưu thông tin tài khoản</button>
        </div>

        <!-- Learning Preferences & Backup/Restore -->
        <div class="card">
          <h3 style="margin:0 0 12px;font-size:17px;">🎨 Tùy chọn học tập & Sao lưu dữ liệu</h3>

          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:18px;">
            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <span>🌗 Giao diện Tối (Dark Mode)</span>
              <input type="checkbox" id="set-dark-chk" ${p.theme === "dark" ? "checked" : ""}>
            </label>

            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <span>⌨️ Tự động gợi ý chữ Hán Giản thể khi gõ Pinyin</span>
              <input type="checkbox" id="set-ime-chk" ${p.enablePinyinIme !== false ? "checked" : ""}>
            </label>

            <label style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
              <span>🇻🇳 Hiển thị phiên âm hỗ trợ người Việt mới bắt đầu</span>
              <input type="checkbox" id="set-vihint-chk" ${p.showVietnameseHint !== false ? "checked" : ""}>
            </label>

            <label style="display:flex;justify-content:space-between;align-items:center;">
              <span>🔊 Tốc độ phát âm tiếng Trung mặc định</span>
              <select class="select-field" id="set-speed-sel" style="width:150px;padding:6px 10px;">
                <option value="0.75" ${p.audioSpeed === 0.75 ? "selected" : ""}>Chậm (0.75x)</option>
                <option value="1" ${!p.audioSpeed || p.audioSpeed === 1 ? "selected" : ""}>Chuẩn (1.0x)</option>
                <option value="1.15" ${p.audioSpeed === 1.15 ? "selected" : ""}>Khá nhanh (1.15x)</option>
              </select>
            </label>
          </div>

          <hr style="border:none;border-top:1px solid var(--border-color);margin:14px 0;">

          <h4 style="margin:0 0 8px;font-size:15px;">💾 Sao lưu & Phục hồi tiến độ an toàn</h4>
          <p style="font-size:12.5px;color:var(--text-secondary);margin:0 0 10px;">
            Đảm bảo không bao giờ mất tiến độ khi đổi máy tính hoặc cập nhật website.
          </p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-soft btn-sm" id="set-export-backup">⬇️ Tải file Sao lưu toàn bộ (.json)</button>
            <label class="btn btn-outline btn-sm" style="cursor:pointer;">
              ⬆️ Khôi phục từ file Sao lưu
              <input type="file" id="set-import-file" accept=".json" style="display:none;">
            </label>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#set-logout-btn").onclick = async () => {
      await QCore.logoutAccount();
      window.QApp.showAuthGate();
    };

    container.querySelector("#set-save-account").onclick = async () => {
      const newDisp = container.querySelector("#set-disp-name").value.trim() || p.name;
      const currPw = container.querySelector("#set-curr-pw").value;
      const newPw = container.querySelector("#set-new-pw").value;

      p.name = newDisp;
      QCore.saveState(true);

      if (health.ok) {
        try {
          await QCore.apiFetch("/api/auth/profile", {
            method: "POST",
            body: { displayName: newDisp, currentPassword: currPw, newPassword: newPw }
          });
          QCore.showToast("Đã lưu thông tin tài khoản thành công!");
          window.QApp.refreshTopbar();
          renderSettings(container);
        } catch (e) {
          QCore.showToast(e.message);
        }
      } else {
        QCore.showToast("Đã cập nhật tên hiển thị!");
        window.QApp.refreshTopbar();
      }
    };

    container.querySelector("#set-dark-chk").onchange = (e) => {
      QCore.applyTheme(e.target.checked ? "dark" : "light");
      QCore.saveState(false);
    };
    container.querySelector("#set-ime-chk").onchange = (e) => {
      p.enablePinyinIme = e.target.checked;
      QCore.saveState(false);
      QCore.showToast(p.enablePinyinIme ? "Đã bật gợi ý chữ Hán khi gõ Pinyin!" : "Đã tắt thanh gợi ý Pinyin.");
    };
    container.querySelector("#set-vihint-chk").onchange = (e) => {
      p.showVietnameseHint = e.target.checked;
      QCore.saveState(false);
    };
    container.querySelector("#set-speed-sel").onchange = (e) => {
      p.audioSpeed = Number(e.target.value) || 1.0;
      QCore.saveState(false);
    };

    container.querySelector("#set-export-backup").onclick = () => {
      const backupObj = {
        app: "QChinese Personal Tutor",
        exportedAt: new Date().toISOString(),
        account: user,
        state: st
      };
      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qchinese_backup_${user.username}_${QCore.todayStr()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    container.querySelector("#set-import-file").onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          const restoredState = parsed.state || parsed;
          if (!restoredState.profile) throw new Error("File sao lưu không hợp lệ.");
          if (health.ok) {
            const r = await QCore.apiFetch("/api/user/restore", { method: "POST", body: { state: restoredState } });
            QCore.setState(r.state);
          } else {
            QCore.setState(restoredState);
          }
          QCore.showToast("🎉 Đã phục hồi toàn bộ dữ liệu học tập thành công!");
          renderSettings(container);
        } catch (err) {
          QCore.showToast("Lỗi đọc file sao lưu: " + err.message);
        }
      };
      reader.readAsText(file);
    };
  }

  return {
    renderNotebook,
    renderAnalytics,
    renderSettings
  };
})();
