/* -*- coding: utf-8 -*-
 * QChinese – Module 3 (Upgraded): Full HSK 1–6 (+ HSK 3.0 7–9) Smart Vocabulary Library,
 * Multi-Level Filtering, Smart Flashcards, SM-2 Sub-Skill SRS, 10 Exercise Modes & 12-Step AI Word Teacher
 */

window.QVocabTutor = (function () {
  let version = "hsk2"; // "hsk2" | "hsk3"
  let filterHsk = "1"; // "1".."6", "7" (HSK 3.0 7-9), or "all"
  let filterTopic = "all";
  let filterPos = "all";
  let filterStatus = "all"; // all | new | learning | due | mastered | lapses | favorite
  let searchQuery = "";
  let studyMode = "list"; // list | flashcard | quiz_h2m | quiz_m2h | audio_pick | audio_py | fill_blank | match | speak_word | sentence_ai
  let page = 1;
  const PAGE_SIZE = 30;
  let currentIdx = 0;
  let cardRevealed = false;
  let showPinyinFront = false;
  let showTrad = true;
  let matchState = null;
  let loadedWords = [];
  let isLoading = false;
  let showManifestInfo = false;

  const MODES = [
    { id: "list", label: "📚 Kho từ vựng" },
    { id: "flashcard", label: "🃏 Flashcard SRS" },
    { id: "quiz_h2m", label: "1. Chữ Hán → Nghĩa" },
    { id: "quiz_m2h", label: "2. Nghĩa → Chữ Hán" },
    { id: "audio_pick", label: "3. Nghe → Chọn từ" },
    { id: "audio_py", label: "4. Nghe → Gõ Pinyin" },
    { id: "fill_blank", label: "5. Điền từ vào câu" },
    { id: "match", label: "6. Ghép cặp" },
    { id: "speak_word", label: "7. Đọc & Ghi âm" },
    { id: "sentence_ai", label: "8. Đặt câu (AI)" }
  ];

  async function ensureLoaded() {
    const st = QCore.getState();
    if (st && st.profile && st.profile.vocabVersion) {
      version = st.profile.vocabVersion;
    }
    await QVocabStore.init();
    const manifest = QVocabStore.getManifest();
    const vLevels = version === "hsk3" ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5, 6];
    if (filterHsk === "7" && version !== "hsk3") filterHsk = "1";
    const levelsToLoad = filterHsk === "all" ? vLevels : [Number(filterHsk)];
    const shardWords = await QVocabStore.loadLevels(version, levelsToLoad);
    const customWords = QVocabStore.getCustomWords();
    loadedWords = [...customWords, ...shardWords];
    return { manifest, loadedWords };
  }

  function getFilteredList() {
    const st = QCore.getState();
    const list = QVocabStore.filterWords(loadedWords, {
      level: filterHsk,
      topic: filterTopic,
      pos: filterPos,
      status: filterStatus,
      query: searchQuery
    });
    if (studyMode !== "list") {
      // Prioritize due / lapsed / unseen words in practice modes
      list.sort((a, b) => {
        const sa = st.srs[a.id];
        const sb = st.srs[b.id];
        const la = sa ? sa.lapses || 0 : 0;
        const lb = sb ? sb.lapses || 0 : 0;
        if (lb !== la) return lb - la;
        const na = sa ? sa.nextReview : 0;
        const nb = sb ? sb.nextReview : 0;
        return na - nb;
      });
    }
    return list;
  }

  function pickDistractors(target, pool, count = 3) {
    const src = pool.length >= count + 1 ? pool : loadedWords;
    const others = src.filter((x) => x.id !== target.id && x.hanzi !== target.hanzi);
    const picked = [];
    const used = new Set([target.hanzi]);
    let tries = 0;
    while (picked.length < count && tries < 60 && others.length > 0) {
      tries++;
      const cand = others[Math.floor(Math.random() * others.length)];
      if (!used.has(cand.hanzi)) {
        used.add(cand.hanzi);
        picked.push(cand);
      }
    }
    return [...picked, target].sort(() => Math.random() - 0.5);
  }

  function getWordStatusBadge(w, st) {
    const rec = st.srs[w.id];
    const now = Date.now();
    if (!rec) return `<span class="badge" style="background:var(--bg-subtle);color:var(--text-muted);">Chưa học</span>`;
    if ((rec.lapses || 0) >= 2) return `<span class="badge badge-red">Hay quên (${rec.lapses} lần)</span>`;
    if (rec.nextReview <= now) return `<span class="badge badge-amber">Đến hạn ôn</span>`;
    if (rec.reps >= 3 && rec.lastQuality >= 4) return `<span class="badge badge-jade">Đã thuộc</span>`;
    return `<span class="badge badge-blue">Đang học (${rec.reps} lượt)</span>`;
  }

  function getPrimaryVi(w) {
    if (w.meanings && w.meanings.vietnamese && w.meanings.vietnamese.length) return w.meanings.vietnamese[0];
    if (w.meanings && w.meanings.english && w.meanings.english.length) return w.meanings.english[0];
    return "(Chưa có nghĩa)";
  }

  async function renderVocab(container, opts = {}) {
    if (opts && opts.mode) studyMode = opts.mode;
    if (opts && opts.status) filterStatus = opts.status;
    if (opts && opts.level) filterHsk = String(opts.level);

    if (!isLoading) {
      isLoading = true;
      container.innerHTML = `
        <div class="card" style="text-align:center;padding:42px;">
          <div style="font-size:28px;margin-bottom:8px;">📚</div>
          <strong>Đang tải kho từ vựng HSK xác thực...</strong>
        </div>
      `;
      await ensureLoaded();
      isLoading = false;
    }

    const st = QCore.getState();
    const manifest = QVocabStore.getManifest();
    const vInfo = manifest && manifest.versions ? manifest.versions[version] : null;
    const topics = (manifest && manifest.topics) || [];
    const posList = (manifest && manifest.pos) || [];
    const list = getFilteredList();
    if (currentIdx >= list.length) currentIdx = 0;

    const now = Date.now();
    const srsKeys = Object.keys(st.srs);
    const dueCount = srsKeys.filter((id) => st.srs[id].nextReview <= now).length;
    const lapseCount = srsKeys.filter((id) => (st.srs[id].lapses || 0) >= 1).length;
    const masteredCount = srsKeys.filter((id) => st.srs[id].reps >= 3 && st.srs[id].lastQuality >= 4).length;
    const favCount = (st.favoriteVocab || []).length;

    const levelButtons = version === "hsk3"
      ? ["1", "2", "3", "4", "5", "6", "7", "all"]
      : ["1", "2", "3", "4", "5", "6", "all"];

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>📚 Kho Từ Vựng Thông Minh HSK 1–6 ${version === "hsk3" ? "& 7–9" : ""} · Flashcard & SRS</h2>
          <p>${vInfo ? QCore.escapeHtml(vInfo.note) : "Dữ liệu HSK chuẩn hóa kèm Pinyin, Hán Việt, âm thanh Putonghua và lặp lại ngắt quãng SM-2."}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <button class="btn btn-primary btn-sm" id="voc-new-card">➕ Tạo Flashcard mới</button>
          <button class="btn btn-soft btn-sm" id="voc-start-12step">👩‍🏫 Học 12 bước AI</button>
          <button class="btn btn-outline btn-sm" id="voc-toggle-info">ℹ️ Nguồn & Thống kê HSK</button>
        </div>
      </div>

      <!-- Version Switcher & Real Stats Banner -->
      <div class="card" style="padding:14px 16px;margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <strong style="font-size:13px;color:var(--text-muted);">Phiên bản HSK:</strong>
            <button class="btn ${version === "hsk2" ? "btn-primary" : "btn-outline"} btn-sm" data-vver="hsk2">
              HSK 2.0 (${manifest && manifest.versions.hsk2 ? manifest.versions.hsk2.total.toLocaleString("vi-VN") : "4.991"} từ · 6 cấp)
            </button>
            <button class="btn ${version === "hsk3" ? "btn-primary" : "btn-outline"} btn-sm" data-vver="hsk3">
              HSK 3.0 (${manifest && manifest.versions.hsk3 ? manifest.versions.hsk3.total.toLocaleString("vi-VN") : "10.969"} từ · 9 cấp)
            </button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12.5px;">
            <span class="badge badge-jade">Đã thuộc: ${masteredCount}</span>
            <span class="badge badge-amber">Đến hạn ôn: ${dueCount}</span>
            <span class="badge badge-red">Hay quên: ${lapseCount}</span>
            <span class="badge badge-blue">Yêu thích: ${favCount}</span>
          </div>
        </div>

        ${showManifestInfo && manifest ? renderManifestInfoHTML(manifest) : ""}
      </div>

      <!-- Multi-Level Filter & Instant Search Bar -->
      <div class="card" style="padding:16px;margin-bottom:16px;">
        <div style="display:grid;grid-template-columns:minmax(220px,1.5fr) repeat(3,minmax(150px,1fr));gap:10px;margin-bottom:12px;">
          <input class="input-field" id="voc-search-inp" value="${QCore.escapeHtml(searchQuery)}" placeholder="🔍 Tìm Chữ Hán, Pinyin (vd: xihuan, ni3), Việt, Anh, Hán Việt..." />
          <select class="select-field" id="voc-topic-sel">
            <option value="all">🌐 Tất cả chủ đề (${topics.length})</option>
            ${topics.map((t) => `<option value="${t.id}" ${filterTopic === t.id ? "selected" : ""}>${QVocabStore.TOPIC_ICON_MAP[t.id] || "📌"} ${QCore.escapeHtml(t.label)}</option>`).join("")}
          </select>
          <select class="select-field" id="voc-pos-sel">
            <option value="all">🏷️ Tất cả từ loại</option>
            ${posList.map((p) => `<option value="${p.id}" ${filterPos === p.id ? "selected" : ""}>${QCore.escapeHtml(p.label)}</option>`).join("")}
          </select>
          <select class="select-field" id="voc-status-sel">
            <option value="all" ${filterStatus === "all" ? "selected" : ""}>📊 Mọi trạng thái</option>
            <option value="new" ${filterStatus === "new" ? "selected" : ""}>🆕 Từ chưa học</option>
            <option value="learning" ${filterStatus === "learning" ? "selected" : ""}>📖 Đang học</option>
            <option value="due" ${filterStatus === "due" ? "selected" : ""}>⏰ Đến hạn ôn SRS</option>
            <option value="mastered" ${filterStatus === "mastered" ? "selected" : ""}>✅ Đã thuộc</option>
            <option value="lapses" ${filterStatus === "lapses" ? "selected" : ""}>⚠️ Thường xuyên quên</option>
            <option value="favorite" ${filterStatus === "favorite" ? "selected" : ""}>⭐ Danh sách yêu thích</option>
          </select>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <strong style="font-size:13px;color:var(--text-muted);margin-right:4px;">Cấp độ:</strong>
            ${levelButtons.map((lv) => {
              const cnt = vInfo && vInfo.levels && vInfo.levels[lv] ? vInfo.levels[lv].count : null;
              const lbl = lv === "all" ? `Tất cả (${vInfo ? vInfo.total : ""})` : lv === "7" ? `HSK 7–9 (${cnt || ""})` : `HSK ${lv}${cnt ? ` (${cnt})` : ""}`;
              return `<button class="btn ${String(filterHsk) === lv ? "btn-primary" : "btn-outline"} btn-sm" data-vhsk="${lv}">${lbl}</button>`;
            }).join("")}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);">
            Đang hiển thị: <strong>${list.length.toLocaleString("vi-VN")}</strong> từ khớp bộ lọc
          </div>
        </div>

        <!-- 10 Study Modes Switcher -->
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);display:flex;gap:6px;flex-wrap:wrap;">
          ${MODES.map((m) => `
            <button class="btn ${studyMode === m.id ? "btn-primary" : "btn-outline"} btn-sm" data-vmode="${m.id}">
              ${m.label}
            </button>
          `).join("")}
        </div>
      </div>

      <div id="vocab-stage"></div>
    `;

    // Bind events
    container.querySelector("#voc-toggle-info").onclick = () => {
      showManifestInfo = !showManifestInfo;
      renderVocab(container);
    };

    container.querySelector("#voc-new-card").onclick = () => openCreateFlashcardModal(container);

    container.querySelectorAll("[data-vver]").forEach((btn) => {
      btn.onclick = async () => {
        const nextVer = btn.getAttribute("data-vver");
        if (nextVer === version) return;
        version = nextVer;
        st.profile.vocabVersion = version;
        QCore.saveState(false);
        if (filterHsk === "7" && version !== "hsk3") filterHsk = "1";
        page = 1;
        currentIdx = 0;
        await ensureLoaded();
        renderVocab(container);
      };
    });

    container.querySelectorAll("[data-vhsk]").forEach((btn) => {
      btn.onclick = async () => {
        filterHsk = btn.getAttribute("data-vhsk");
        page = 1;
        currentIdx = 0;
        cardRevealed = false;
        matchState = null;
        await ensureLoaded();
        renderVocab(container);
      };
    });

    let searchTimer = null;
    const searchEl = container.querySelector("#voc-search-inp");
    searchEl.oninput = (e) => {
      searchQuery = e.target.value;
      page = 1;
      currentIdx = 0;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => renderStageOnly(container), 140);
    };

    container.querySelector("#voc-topic-sel").onchange = (e) => {
      filterTopic = e.target.value;
      page = 1;
      currentIdx = 0;
      renderVocab(container);
    };
    container.querySelector("#voc-pos-sel").onchange = (e) => {
      filterPos = e.target.value;
      page = 1;
      currentIdx = 0;
      renderVocab(container);
    };
    container.querySelector("#voc-status-sel").onchange = (e) => {
      filterStatus = e.target.value;
      page = 1;
      currentIdx = 0;
      renderVocab(container);
    };

    container.querySelectorAll("[data-vmode]").forEach((btn) => {
      btn.onclick = () => {
        studyMode = btn.getAttribute("data-vmode");
        cardRevealed = false;
        matchState = null;
        renderVocab(container);
      };
    });

    container.querySelector("#voc-start-12step").onclick = () => {
      const target = list[currentIdx] || (window.QCHINESE_VOCAB || [])[0];
      openStepByStepWordModal(target ? target.id : "v_ni");
    };

    renderStageOnly(container);
  }

  function renderManifestInfoHTML(manifest) {
    const v2 = manifest.versions.hsk2;
    const v3 = manifest.versions.hsk3;
    return `
      <div class="card-subtle" style="margin-top:12px;font-size:13px;">
        <strong>📊 Minh bạch Nguồn Dữ Liệu & Thống Kê Số Lượng Từ HSK</strong>
        <div class="grid-2" style="margin-top:10px;gap:12px;">
          <div>
            <strong>${QCore.escapeHtml(v2.label)}</strong> (Tổng: ${v2.total.toLocaleString("vi-VN")} / ${v2.officialTotal.toLocaleString("vi-VN")})
            <ul style="margin:6px 0 0;padding-left:18px;">
              ${Object.entries(v2.levels).map(([lv, d]) => `<li>HSK ${lv}: <strong>${d.count}</strong> từ (chuẩn: ${d.official}) · Nghĩa Việt sẵn: ${d.withVietnamese} · Hán Việt: ${d.withHanViet}</li>`).join("")}
            </ul>
          </div>
          <div>
            <strong>${QCore.escapeHtml(v3.label)}</strong> (Tổng: ${v3.total.toLocaleString("vi-VN")} / ${v3.officialTotal.toLocaleString("vi-VN")})
            <ul style="margin:6px 0 0;padding-left:18px;">
              ${Object.entries(v3.levels).map(([lv, d]) => `<li>HSK ${lv === "7" ? "7–9" : lv}: <strong>${d.count}</strong> từ (chuẩn: ${d.official}) · Nghĩa Việt sẵn: ${d.withVietnamese} · Hán Việt: ${d.withHanViet}</li>`).join("")}
            </ul>
          </div>
        </div>
        <div style="margin-top:10px;color:var(--text-secondary);">
          <strong>Nguồn xác thực:</strong> ${manifest.sources.map((s) => `${QCore.escapeHtml(s.name)} (${QCore.escapeHtml(s.license || "Project")})`).join(" · ")}.<br/>
          <em>Ghi chú:</em> ${QCore.escapeHtml(manifest.notes.vi)}
        </div>
      </div>
    `;
  }

  function renderStageOnly(container) {
    const stage = container.querySelector("#vocab-stage");
    if (!stage) return;
    const list = getFilteredList();

    if (!list.length) {
      stage.innerHTML = `
        <div class="card" style="text-align:center;padding:42px;">
          <div style="font-size:38px;margin-bottom:10px;">🔎</div>
          <h3 style="margin:0 0 6px;">Không tìm thấy từ nào khớp bộ lọc hiện tại</h3>
          <p style="color:var(--text-secondary);margin-bottom:16px;">Thử xóa ô tìm kiếm, chuyển sang cấp độ HSK khác hoặc đổi trạng thái lọc nhé!</p>
          <button class="btn btn-primary" id="voc-reset-filter">🔄 Đặt lại toàn bộ bộ lọc</button>
        </div>
      `;
      stage.querySelector("#voc-reset-filter").onclick = () => {
        filterTopic = "all";
        filterPos = "all";
        filterStatus = "all";
        searchQuery = "";
        renderVocab(container);
      };
      return;
    }

    if (studyMode === "list") {
      renderLibraryList(stage, list, container);
    } else if (studyMode === "flashcard") {
      renderFlashcardStudio(stage, list, container);
    } else if (studyMode === "match") {
      renderMatchGame(stage, list);
    } else {
      renderExerciseMode(stage, list, container);
    }
  }

  /* ==================== LIBRARY LIST VIEW (PAGINATED) ==================== */
  function renderLibraryList(stage, list, parentContainer) {
    const st = QCore.getState();
    const favs = new Set(st.favoriteVocab || []);
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;
    const slice = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    stage.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div style="font-size:13.5px;color:var(--text-secondary);">
          Trang <strong>${page}/${totalPages}</strong> · Hiển thị ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, list.length)} trong tổng <strong>${list.length.toLocaleString("vi-VN")}</strong> từ
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <button class="btn btn-outline btn-sm" id="voc-pg-prev" ${page <= 1 ? "disabled" : ""}>← Trước</button>
          <button class="btn btn-outline btn-sm" id="voc-pg-next" ${page >= totalPages ? "disabled" : ""}>Tiếp →</button>
        </div>
      </div>

      <div class="grid-2" style="gap:14px;">
        ${slice.map((w) => {
          const isFav = favs.has(w.id);
          const viText = w.meanings.vietnamese && w.meanings.vietnamese.length ? w.meanings.vietnamese.join("; ") : "";
          const enText = w.meanings.english && w.meanings.english.length ? w.meanings.english.slice(0, 3).join("; ") : "";
          const ex = w.examples && w.examples[0];
          const sub = st.vocabSubSkills && st.vocabSubSkills[w.id];
          return `
            <div class="card" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px;">
                  <div>
                    <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
                      <span class="hanzi-text" style="font-size:34px;font-weight:700;line-height:1.1;">${QCore.escapeHtml(w.hanzi)}</span>
                      ${w.traditional && showTrad ? `<span class="hanzi-text" style="font-size:15px;color:var(--text-muted);" title="Chữ Phồn thể tham khảo">(${QCore.escapeHtml(w.traditional)})</span>` : ""}
                      <span class="pinyin-text" style="font-size:17px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(w.pinyin)}</span>
                      ${w.pinyin_number ? `<span style="font-size:11.5px;color:var(--text-muted);">[${QCore.escapeHtml(w.pinyin_number)}]</span>` : ""}
                    </div>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
                      <span class="badge badge-jade">${w.isCustom ? "Cá nhân" : `HSK ${w.hsk_level === 7 ? "7–9" : w.hsk_level}`}</span>
                      <span class="badge badge-blue">${QCore.escapeHtml(w.part_of_speech || "Từ vựng")}</span>
                      ${w.han_viet ? `<span class="badge badge-amber" title="Âm Hán Việt (Unicode Unihan)">Hán Việt: ${QCore.escapeHtml(w.han_viet.toUpperCase())}</span>` : ""}
                      ${getWordStatusBadge(w, st)}
                    </div>
                  </div>
                  <div style="display:flex;gap:6px;flex-shrink:0;">
                    <button class="icon-btn" title="Nghe phát âm chuẩn" data-speak="${QCore.escapeHtml(w.hanzi)}">🔊</button>
                    <button class="icon-btn" title="Nghe chậm" data-speak-slow="${QCore.escapeHtml(w.hanzi)}">🐢</button>
                    <button class="icon-btn" title="${isFav ? "Bỏ yêu thích" : "Thêm vào yêu thích"}" data-fav="${QCore.escapeHtml(w.id)}" style="${isFav ? "color:#d97706;border-color:#d97706;" : ""}">${isFav ? "★" : "☆"}</button>
                  </div>
                </div>

                <div class="card-subtle" style="padding:10px 12px;margin:8px 0;font-size:13.5px;">
                  ${viText ? `<div><strong>🇻🇳 Tiếng Việt:</strong> ${QCore.escapeHtml(viText)}</div>` : ""}
                  ${enText ? `<div style="${viText ? "margin-top:3px;color:var(--text-secondary);font-size:12.5px;" : ""}"><strong>🇬🇧 English:</strong> ${QCore.escapeHtml(enText)}</div>` : ""}
                  ${w.classifiers && w.classifiers.length ? `<div style="margin-top:3px;font-size:12px;color:var(--text-muted);">Lượng từ đi kèm: ${QCore.escapeHtml(w.classifiers.join(", "))}</div>` : ""}
                </div>

                ${w.confused_with ? `<div style="font-size:12.5px;color:var(--accent-amber);margin-bottom:6px;">⚠️ ${QCore.escapeHtml(w.confused_with)}</div>` : ""}

                ${ex ? `
                  <div style="font-size:13px;padding:8px 10px;border-left:3px solid var(--primary);background:var(--bg-subtle);border-radius:6px;margin-bottom:8px;">
                    <div><strong class="hanzi-text">${QCore.escapeHtml(ex.chinese)}</strong> <span class="pinyin-text" style="color:var(--primary);">${QCore.escapeHtml(ex.pinyin || "")}</span></div>
                    <div style="color:var(--text-secondary);font-size:12.5px;">🇻🇳 ${QCore.escapeHtml(ex.vietnamese || "")}</div>
                  </div>
                ` : ""}

                ${sub ? `
                  <div style="font-size:11.5px;color:var(--text-muted);margin-bottom:6px;">
                    Ghi nhớ: Nghĩa ${sub.meaning.ok}/${sub.meaning.ok + sub.meaning.err} · Pinyin ${sub.pinyin.ok}/${sub.pinyin.ok + sub.pinyin.err} · Nghe ${sub.listening.ok}/${sub.listening.ok + sub.listening.err}
                  </div>
                ` : ""}
              </div>

              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-color);">
                <button class="btn btn-soft btn-sm" data-open-hanzi="${QCore.escapeHtml(w.hanzi.charAt(0))}">✍️ Tập viết nét</button>
                <button class="btn btn-outline btn-sm" data-ask-ai="${QCore.escapeHtml(w.hanzi)}">🤖 AI giải thích sâu</button>
                <button class="btn btn-outline btn-sm" data-save-nb="${QCore.escapeHtml(w.id)}">📒 Sổ tay</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div style="display:flex;justify-content:center;gap:10px;margin-top:16px;">
        <button class="btn btn-outline btn-sm" id="voc-pg-prev-b" ${page <= 1 ? "disabled" : ""}>← Trang trước</button>
        <span style="align-self:center;font-size:13px;color:var(--text-muted);">Trang ${page} / ${totalPages}</span>
        <button class="btn btn-outline btn-sm" id="voc-pg-next-b" ${page >= totalPages ? "disabled" : ""}>Trang tiếp →</button>
      </div>
    `;

    const goPrev = () => { if (page > 1) { page--; renderStageOnly(parentContainer); window.scrollTo({ top: 0, behavior: "smooth" }); } };
    const goNext = () => { if (page < totalPages) { page++; renderStageOnly(parentContainer); window.scrollTo({ top: 0, behavior: "smooth" }); } };
    stage.querySelector("#voc-pg-prev").onclick = goPrev;
    stage.querySelector("#voc-pg-prev-b").onclick = goPrev;
    stage.querySelector("#voc-pg-next").onclick = goNext;
    stage.querySelector("#voc-pg-next-b").onclick = goNext;

    stage.querySelectorAll("[data-speak]").forEach((b) => (b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak"))));
    stage.querySelectorAll("[data-speak-slow]").forEach((b) => (b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak-slow"), { slow: true })));
    stage.querySelectorAll("[data-fav]").forEach((b) => {
      b.onclick = () => {
        const added = QCore.toggleFavoriteVocab(b.getAttribute("data-fav"));
        QCore.showToast(added ? "⭐ Đã thêm vào danh sách yêu thích!" : "Đã bỏ khỏi danh sách yêu thích.");
        renderVocab(parentContainer);
      };
    });
    stage.querySelectorAll("[data-open-hanzi]").forEach((b) => {
      b.onclick = () => window.QApp.navigate("hanzi", { char: b.getAttribute("data-open-hanzi") });
    });
    stage.querySelectorAll("[data-ask-ai]").forEach((b) => {
      b.onclick = () => window.QApp.navigate("ai-tutor", { tab: "explain_word", word: b.getAttribute("data-ask-ai") });
    });
    stage.querySelectorAll("[data-save-nb]").forEach((b) => {
      b.onclick = () => {
        const w = slice.find((x) => x.id === b.getAttribute("data-save-nb"));
        if (w) {
          QCore.addToNotebook({
            category: "vocab",
            hanzi: w.hanzi,
            pinyin: w.pinyin,
            english: (w.meanings.english || []).slice(0, 2).join("; "),
            vietnamese: getPrimaryVi(w),
            example: w.examples && w.examples[0] ? w.examples[0].chinese : ""
          });
        }
      };
    });
  }

  /* ==================== SMART FLASHCARD STUDIO (SM-2) ==================== */
  function renderFlashcardStudio(stage, list, parentContainer) {
    const st = QCore.getState();
    const w = list[currentIdx % list.length];
    const isFav = (st.favoriteVocab || []).includes(w.id);
    const rec = st.srs[w.id];
    const viText = w.meanings.vietnamese && w.meanings.vietnamese.length ? w.meanings.vietnamese.join("; ") : "";
    const enText = w.meanings.english && w.meanings.english.length ? w.meanings.english.slice(0, 4).join("; ") : "";

    stage.innerHTML = `
      <div class="card" style="max-width:740px;margin:0 auto;padding:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
          <div style="display:flex;gap:8px;align-items:center;">
            <span class="badge badge-jade">Thẻ ${currentIdx + 1} / ${list.length}</span>
            <span class="badge badge-blue">HSK ${w.hsk_level === 7 ? "7–9" : w.hsk_level}</span>
            ${getWordStatusBadge(w, st)}
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <label style="font-size:12.5px;display:flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" id="fc-show-py" ${showPinyinFront ? "checked" : ""} /> Hiện Pinyin mặt trước
            </label>
            <button class="icon-btn" id="fc-fav" title="Yêu thích">${isFav ? "★" : "☆"}</button>
          </div>
        </div>

        <div id="fc-card-face" style="text-align:center;padding:30px 18px;border:2px solid var(--border-color);border-radius:18px;background:var(--bg-subtle);cursor:pointer;transition:all 0.2s;">
          <div class="hanzi-calligraphy" style="font-size:78px;line-height:1.12;color:var(--text-main);">${QCore.escapeHtml(w.hanzi)}</div>
          ${w.traditional ? `<div class="hanzi-text" style="font-size:16px;color:var(--text-muted);margin-top:4px;">Phồn thể: ${QCore.escapeHtml(w.traditional)}</div>` : ""}
          ${showPinyinFront || cardRevealed ? `<div class="pinyin-text" style="font-size:24px;font-weight:700;color:var(--primary);margin-top:8px;">${QCore.escapeHtml(w.pinyin)}</div>` : `<div style="font-size:13px;color:var(--text-muted);margin-top:10px;">(Bấm vào thẻ hoặc nút Lật thẻ để xem Pinyin & Nghĩa)</div>`}

          <div style="display:flex;justify-content:center;gap:8px;margin-top:14px;">
            <button class="btn btn-soft btn-sm" id="fc-speak">🔊 Nghe chuẩn</button>
            <button class="btn btn-outline btn-sm" id="fc-slow">🐢 Nghe chậm</button>
            <button class="btn btn-outline btn-sm" id="fc-flip">🔄 ${cardRevealed ? "Úp thẻ" : "Lật thẻ"}</button>
          </div>

          ${cardRevealed ? `
            <div style="margin-top:20px;padding-top:18px;border-top:1px dashed var(--border-strong);text-align:left;">
              ${viText ? `<div style="font-size:18px;font-weight:700;color:var(--text-main);margin-bottom:6px;">🇻🇳 ${QCore.escapeHtml(viText)}</div>` : ""}
              ${enText ? `<div style="font-size:14.5px;color:var(--text-secondary);margin-bottom:6px;">🇬🇧 ${QCore.escapeHtml(enText)}</div>` : ""}
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;font-size:12.5px;">
                <span class="badge badge-blue">${QCore.escapeHtml(w.part_of_speech || "")}</span>
                ${w.han_viet ? `<span class="badge badge-amber">Hán Việt: ${QCore.escapeHtml(w.han_viet.toUpperCase())}</span>` : ""}
                ${w.radical ? `<span class="badge badge-jade">Bộ thủ: ${QCore.escapeHtml(w.radical)}</span>` : ""}
              </div>
              ${w.examples && w.examples.length ? `
                <div class="card" style="padding:12px;margin-bottom:10px;">
                  <strong style="font-size:12.5px;color:var(--primary);">Ví dụ ngữ cảnh:</strong>
                  <div class="hanzi-text" style="font-size:17px;font-weight:700;margin-top:4px;">${QCore.escapeHtml(w.examples[0].chinese)}</div>
                  <div class="pinyin-text" style="font-size:13px;color:var(--primary);">${QCore.escapeHtml(w.examples[0].pinyin || "")}</div>
                  <div style="font-size:13px;color:var(--text-secondary);">🇻🇳 ${QCore.escapeHtml(w.examples[0].vietnamese || "")}</div>
                </div>
              ` : ""}
              ${w.confused_with ? `<div class="vi-hint-banner" style="margin-bottom:8px;">⚠️ ${QCore.escapeHtml(w.confused_with)}</div>` : ""}
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
                <button class="btn btn-outline btn-sm" id="fc-hanzi">✍️ Luyện viết chữ</button>
                <button class="btn btn-outline btn-sm" id="fc-ai">🤖 AI giải thích sâu</button>
                <button class="btn btn-outline btn-sm" id="fc-nb">📒 Lưu Sổ tay</button>
              </div>
            </div>
          ` : ""}
        </div>

        <div style="margin-top:18px;">
          <div style="text-align:center;font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">
            Đánh giá mức độ ghi nhớ (Thuật toán Spaced Repetition SM-2 tự tính lịch ôn):
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
            <button class="btn btn-danger" data-srs-q="1">😰 Quên<br/><small style="font-weight:400;">Ôn lại ngay</small></button>
            <button class="btn btn-outline" style="border-color:var(--accent-amber);color:var(--accent-amber);" data-srs-q="3">🤔 Khó<br/><small style="font-weight:400;">1 ngày</small></button>
            <button class="btn btn-soft" data-srs-q="4">🙂 Nhớ<br/><small style="font-weight:400;">${rec && rec.reps >= 1 ? Math.max(3, Math.round((rec.intervalDays || 1) * (rec.ease || 2.5))) + " ngày" : "1–3 ngày"}</small></button>
            <button class="btn btn-primary" data-srs-q="5">😎 Rất chắc<br/><small style="font-weight:400;">Giãn dài</small></button>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:14px;">
            <button class="btn btn-outline btn-sm" id="fc-prev">← Thẻ trước</button>
            <button class="btn btn-outline btn-sm" id="fc-next">Bỏ qua / Thẻ tiếp →</button>
          </div>
        </div>
      </div>
    `;

    stage.querySelector("#fc-show-py").onchange = (e) => {
      showPinyinFront = e.target.checked;
      renderFlashcardStudio(stage, list, parentContainer);
    };
    stage.querySelector("#fc-fav").onclick = () => {
      QCore.toggleFavoriteVocab(w.id);
      renderFlashcardStudio(stage, list, parentContainer);
    };
    stage.querySelector("#fc-speak").onclick = (e) => { e.stopPropagation(); QCore.speakChinese(w.hanzi); };
    stage.querySelector("#fc-slow").onclick = (e) => { e.stopPropagation(); QCore.speakChinese(w.hanzi, { slow: true }); };
    stage.querySelector("#fc-flip").onclick = (e) => {
      e.stopPropagation();
      cardRevealed = !cardRevealed;
      renderFlashcardStudio(stage, list, parentContainer);
    };
    stage.querySelector("#fc-card-face").onclick = (e) => {
      if (e.target.closest("button")) return;
      cardRevealed = !cardRevealed;
      if (cardRevealed) QCore.speakChinese(w.hanzi);
      renderFlashcardStudio(stage, list, parentContainer);
    };

    if (cardRevealed) {
      stage.querySelector("#fc-hanzi").onclick = (e) => { e.stopPropagation(); window.QApp.navigate("hanzi", { char: w.hanzi.charAt(0) }); };
      stage.querySelector("#fc-ai").onclick = (e) => { e.stopPropagation(); window.QApp.navigate("ai-tutor", { tab: "explain_word", word: w.hanzi }); };
      stage.querySelector("#fc-nb").onclick = (e) => {
        e.stopPropagation();
        QCore.addToNotebook({ category: "vocab", hanzi: w.hanzi, pinyin: w.pinyin, english: enText, vietnamese: getPrimaryVi(w) });
      };
    }

    stage.querySelectorAll("[data-srs-q]").forEach((btn) => {
      btn.onclick = () => {
        const q = Number(btn.getAttribute("data-srs-q"));
        QCore.reviewWordSRS(w.id, q);
        QCore.recordVocabSubSkill(w.id, "meaning", q >= 3);
        cardRevealed = false;
        currentIdx = (currentIdx + 1) % list.length;
        renderVocab(parentContainer);
      };
    });
    stage.querySelector("#fc-prev").onclick = () => {
      cardRevealed = false;
      currentIdx = (currentIdx - 1 + list.length) % list.length;
      renderFlashcardStudio(stage, list, parentContainer);
    };
    stage.querySelector("#fc-next").onclick = () => {
      cardRevealed = false;
      currentIdx = (currentIdx + 1) % list.length;
      renderFlashcardStudio(stage, list, parentContainer);
    };
  }

  /* ==================== MATCHING GAME ==================== */
  function renderMatchGame(stage, list) {
    if (!matchState || !matchState.words.length) {
      const sample = list.slice(0, 6);
      matchState = {
        words: sample,
        left: sample.map((w) => ({ id: w.id, text: w.hanzi, py: w.pinyin })).sort(() => Math.random() - 0.5),
        right: sample.map((w) => ({ id: w.id, text: getPrimaryVi(w) })).sort(() => Math.random() - 0.5),
        selLeft: null,
        matched: new Set(),
        mistakes: 0
      };
    }

    const done = matchState.matched.size === matchState.words.length;
    stage.innerHTML = `
      <div class="card" style="max-width:780px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div>
            <h3 style="margin:0;">🎯 Ghép Chữ Hán với Nghĩa tương ứng</h3>
            <small style="color:var(--text-muted);">Đã ghép: ${matchState.matched.size}/${matchState.words.length} · Sai: ${matchState.mistakes}</small>
          </div>
          <button class="btn btn-outline btn-sm" id="match-reset">🔄 Bộ thẻ mới</button>
        </div>

        ${done ? `
          <div class="card-subtle" style="text-align:center;padding:28px;border-color:var(--primary);">
            <div style="font-size:40px;">🎉</div>
            <h3 style="color:var(--primary);margin:6px 0;">Hoàn thành xuất sắc!</h3>
            <p style="color:var(--text-secondary);">Bạn đã ghép đúng toàn bộ ${matchState.words.length} cặp từ (số lần nhầm: ${matchState.mistakes}).</p>
            <button class="btn btn-primary" id="match-next-set">Chơi ván tiếp theo →</button>
          </div>
        ` : `
          <div class="grid-2">
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${matchState.left.map((item) => {
                const isDone = matchState.matched.has(item.id);
                const isSel = matchState.selLeft === item.id;
                return `
                  <button class="btn ${isDone ? "btn-soft" : isSel ? "btn-primary" : "btn-outline"}" style="justify-content:space-between;padding:12px 14px;${isDone ? "opacity:0.45;" : ""}" data-ml="${item.id}" ${isDone ? "disabled" : ""}>
                    <span class="hanzi-text" style="font-size:22px;font-weight:700;">${QCore.escapeHtml(item.text)}</span>
                    <span class="pinyin-text" style="font-size:13px;">${QCore.escapeHtml(item.py)}</span>
                  </button>
                `;
              }).join("")}
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${matchState.right.map((item) => {
                const isDone = matchState.matched.has(item.id);
                return `
                  <button class="btn ${isDone ? "btn-soft" : "btn-outline"}" style="justify-content:flex-start;text-align:left;padding:12px 14px;${isDone ? "opacity:0.45;" : ""}" data-mr="${item.id}" ${isDone ? "disabled" : ""}>
                    ${QCore.escapeHtml(item.text)}
                  </button>
                `;
              }).join("")}
            </div>
          </div>
        `}
      </div>
    `;

    const reshuffle = () => {
      const shuffledPool = list.slice().sort(() => Math.random() - 0.5).slice(0, 6);
      matchState = {
        words: shuffledPool,
        left: shuffledPool.map((w) => ({ id: w.id, text: w.hanzi, py: w.pinyin })).sort(() => Math.random() - 0.5),
        right: shuffledPool.map((w) => ({ id: w.id, text: getPrimaryVi(w) })).sort(() => Math.random() - 0.5),
        selLeft: null,
        matched: new Set(),
        mistakes: 0
      };
      renderMatchGame(stage, list);
    };
    stage.querySelector("#match-reset").onclick = reshuffle;
    const nextSet = stage.querySelector("#match-next-set");
    if (nextSet) nextSet.onclick = reshuffle;

    stage.querySelectorAll("[data-ml]").forEach((btn) => {
      btn.onclick = () => {
        matchState.selLeft = btn.getAttribute("data-ml");
        const w = matchState.words.find((x) => x.id === matchState.selLeft);
        if (w) QCore.speakChinese(w.hanzi);
        renderMatchGame(stage, list);
      };
    });

    stage.querySelectorAll("[data-mr]").forEach((btn) => {
      btn.onclick = () => {
        if (!matchState.selLeft) {
          QCore.showToast("Hãy chọn 1 chữ Hán ở cột bên trái trước nhé!");
          return;
        }
        const rid = btn.getAttribute("data-mr");
        if (rid === matchState.selLeft) {
          matchState.matched.add(rid);
          QCore.reviewWordSRS(rid, 4);
          QCore.recordVocabSubSkill(rid, "meaning", true);
          matchState.selLeft = null;
          renderMatchGame(stage, list);
        } else {
          matchState.mistakes += 1;
          QCore.recordVocabSubSkill(matchState.selLeft, "meaning", false);
          QCore.showToast("Chưa khớp! Hãy nghe lại chữ bên trái và chọn lại nhé.");
        }
      };
    });
  }

  /* ==================== INTERACTIVE EXERCISE MODES ==================== */
  function renderExerciseMode(stage, list, parentContainer) {
    const w = list[currentIdx % list.length];
    const opts = pickDistractors(w, list, 3);

    let promptHTML = "";
    let bodyHTML = "";

    if (studyMode === "quiz_h2m") {
      promptHTML = `
        <div class="hanzi-calligraphy" style="font-size:66px;line-height:1.15;">${QCore.escapeHtml(w.hanzi)}</div>
        <div style="margin:8px 0;"><button class="btn btn-soft btn-sm" id="ex-speak">🔊 Nghe phát âm</button></div>
        <p style="color:var(--text-secondary);margin:4px 0 14px;">Từ trên có nghĩa là gì?</p>
      `;
      bodyHTML = `
        <div class="grid-2" style="gap:10px;">
          ${opts.map((o) => `
            <button class="btn btn-outline" style="padding:14px;text-align:left;justify-content:flex-start;" data-ex-ans="${o.id === w.id ? "1" : "0"}" data-dim="meaning">
              <span><strong>${QCore.escapeHtml(getPrimaryVi(o))}</strong>${o.han_viet ? `<br/><small style="color:var(--text-muted);">Hán Việt: ${QCore.escapeHtml(o.han_viet)}</small>` : ""}</span>
            </button>
          `).join("")}
        </div>
      `;
    } else if (studyMode === "quiz_m2h") {
      promptHTML = `
        <div style="font-size:24px;font-weight:700;color:var(--primary);margin:10px 0;">${QCore.escapeHtml(getPrimaryVi(w))}</div>
        ${w.meanings.english && w.meanings.english.length ? `<div style="font-size:14px;color:var(--text-secondary);margin-bottom:10px;">🇬🇧 ${QCore.escapeHtml(w.meanings.english.slice(0, 2).join("; "))}</div>` : ""}
        <p style="color:var(--text-muted);margin:0 0 14px;">Chọn đúng chữ Hán Giản thể tương ứng:</p>
      `;
      bodyHTML = `
        <div class="grid-2" style="gap:10px;">
          ${opts.map((o) => `
            <button class="btn btn-outline" style="padding:16px;justify-content:center;" data-ex-ans="${o.id === w.id ? "1" : "0"}" data-dim="meaning">
              <span class="hanzi-text" style="font-size:32px;font-weight:700;">${QCore.escapeHtml(o.hanzi)}</span>
            </button>
          `).join("")}
        </div>
      `;
    } else if (studyMode === "audio_pick") {
      promptHTML = `
        <div style="margin:12px 0;">
          <button class="btn btn-primary" style="font-size:16px;padding:14px 26px;" id="ex-speak">🔊 Nghe âm thanh từ vựng</button>
          <button class="btn btn-outline btn-sm" id="ex-slow" style="margin-left:8px;">🐢 Nghe chậm</button>
        </div>
        <p style="color:var(--text-secondary);margin:6px 0 14px;">Nghe thật kỹ thanh mẫu, vận mẫu & thanh điệu rồi chọn đúng từ:</p>
      `;
      bodyHTML = `
        <div class="grid-2" style="gap:10px;">
          ${opts.map((o) => `
            <button class="btn btn-outline" style="padding:14px;justify-content:space-between;" data-ex-ans="${o.id === w.id ? "1" : "0"}" data-dim="listening">
              <span class="hanzi-text" style="font-size:26px;font-weight:700;">${QCore.escapeHtml(o.hanzi)}</span>
              <span style="font-size:13px;color:var(--text-secondary);">${QCore.escapeHtml(getPrimaryVi(o))}</span>
            </button>
          `).join("")}
        </div>
      `;
    } else if (studyMode === "audio_py") {
      promptHTML = `
        <div class="hanzi-calligraphy" style="font-size:58px;line-height:1.15;">${QCore.escapeHtml(w.hanzi)}</div>
        <div style="font-size:15px;color:var(--text-secondary);margin:4px 0 10px;">${QCore.escapeHtml(getPrimaryVi(w))}</div>
        <button class="btn btn-soft btn-sm" id="ex-speak">🔊 Nghe âm thanh</button>
        <p style="color:var(--text-muted);font-size:13px;margin:10px 0 8px;">Gõ Pinyin của từ (có thể gõ có dấu hoặc dạng số như <code>ni3 hao3</code> hoặc không dấu <code>nihao</code>):</p>
      `;
      bodyHTML = `
        <div style="display:flex;gap:8px;max-width:460px;margin:0 auto;">
          <input class="input-field pinyin-text" id="ex-py-inp" placeholder="Nhập Pinyin..." autocomplete="off" />
          <button class="btn btn-primary" id="ex-py-check">Kiểm tra</button>
        </div>
      `;
    } else if (studyMode === "fill_blank") {
      const ex = w.examples && w.examples[0];
      const sentence = ex && ex.chinese && ex.chinese.includes(w.hanzi)
        ? ex.chinese.replace(w.hanzi, " ______ ")
        : `请用这个词造句：______ （${getPrimaryVi(w)}）`;
      promptHTML = `
        <div class="card-subtle" style="padding:18px;margin-bottom:14px;">
          <div class="hanzi-text" style="font-size:24px;font-weight:700;margin-bottom:6px;">${QCore.escapeHtml(sentence)}</div>
          ${ex && ex.vietnamese ? `<div style="font-size:14px;color:var(--text-secondary);">🇻🇳 ${QCore.escapeHtml(ex.vietnamese)}</div>` : `<div style="font-size:14px;color:var(--text-secondary);">Gợi ý nghĩa: ${QCore.escapeHtml(getPrimaryVi(w))} (${QCore.escapeHtml(w.pinyin)})</div>`}
        </div>
      `;
      bodyHTML = `
        <div class="grid-2" style="gap:10px;">
          ${opts.map((o) => `
            <button class="btn btn-outline" style="padding:14px;justify-content:center;" data-ex-ans="${o.id === w.id ? "1" : "0"}" data-dim="usage">
              <span class="hanzi-text" style="font-size:24px;font-weight:700;">${QCore.escapeHtml(o.hanzi)}</span>
              <span class="pinyin-text" style="margin-left:8px;color:var(--primary);">${QCore.escapeHtml(o.pinyin)}</span>
            </button>
          `).join("")}
        </div>
      `;
    } else if (studyMode === "speak_word") {
      promptHTML = `
        <div class="hanzi-calligraphy" style="font-size:66px;line-height:1.15;">${QCore.escapeHtml(w.hanzi)}</div>
        <div class="pinyin-text" style="font-size:24px;font-weight:700;color:var(--primary);margin:6px 0;">${QCore.escapeHtml(w.pinyin)}</div>
        <div style="font-size:15px;color:var(--text-secondary);margin-bottom:14px;">${QCore.escapeHtml(getPrimaryVi(w))}</div>
      `;
      bodyHTML = `
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
          <button class="btn btn-outline" id="ex-speak">🔊 Nghe mẫu</button>
          <button class="btn btn-outline" id="ex-slow">🐢 Nghe chậm</button>
          <button class="btn btn-primary" id="ex-rec">🎙️ Ghi âm giọng đọc (3.5s)</button>
        </div>
        <div id="ex-rec-out" class="card-subtle" style="text-align:left;font-size:13.5px;color:var(--text-secondary);">
          Bấm "Ghi âm giọng đọc", đọc rõ <strong>${QCore.escapeHtml(w.pinyin)}</strong>. Hệ thống sẽ ghi lại audio để bạn nghe đối chiếu và dùng nhận diện giọng nói <code>zh-CN</code> (lưu ý: trình duyệt không đo chính xác cao độ từng thanh điệu, hãy luôn đối chiếu bằng tai với âm mẫu).
        </div>
      `;
    } else if (studyMode === "sentence_ai") {
      promptHTML = `
        <div style="margin-bottom:12px;">
          <span class="badge badge-jade">Từ mục tiêu</span>
          <div class="hanzi-text" style="font-size:44px;font-weight:700;margin:6px 0;">${QCore.escapeHtml(w.hanzi)} <span class="pinyin-text" style="font-size:20px;color:var(--primary);">${QCore.escapeHtml(w.pinyin)}</span></div>
          <div style="font-size:14.5px;color:var(--text-secondary);">${QCore.escapeHtml(getPrimaryVi(w))}</div>
        </div>
      `;
      bodyHTML = `
        <div style="text-align:left;">
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Đặt 1 câu tiếng Trung Giản thể có chứa từ <strong>${QCore.escapeHtml(w.hanzi)}</strong>:</label>
          <textarea class="textarea-field hanzi-text" id="ex-sent-inp" rows="3" data-pinyin-ime="true" placeholder="Ví dụ gõ Pinyin rồi chọn chữ Hán..."></textarea>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="ex-sent-check">👩‍🏫 Chấm câu với AI Tutor</button>
            <button class="btn btn-outline" id="ex-sent-explain">🤖 Xem cách dùng từ này</button>
          </div>
        </div>
      `;
    }

    stage.innerHTML = `
      <div class="card" style="max-width:740px;margin:0 auto;padding:28px;text-align:center;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <span class="badge badge-jade">Câu ${currentIdx + 1} / ${list.length}</span>
          <span class="badge badge-blue">HSK ${w.hsk_level === 7 ? "7–9" : w.hsk_level}</span>
        </div>
        ${promptHTML}
        ${bodyHTML}
        <div id="ex-feedback" style="margin-top:16px;text-align:left;"></div>
        <div style="display:flex;justify-content:space-between;margin-top:18px;padding-top:12px;border-top:1px solid var(--border-color);">
          <button class="btn btn-outline btn-sm" id="ex-prev">← Từ trước</button>
          <button class="btn btn-primary btn-sm" id="ex-next">Từ tiếp theo →</button>
        </div>
      </div>
    `;

    const speakBtn = stage.querySelector("#ex-speak");
    if (speakBtn) speakBtn.onclick = () => QCore.speakChinese(w.hanzi);
    const slowBtn = stage.querySelector("#ex-slow");
    if (slowBtn) slowBtn.onclick = () => QCore.speakChinese(w.hanzi, { slow: true });
    if (studyMode === "audio_pick" || studyMode === "audio_py") {
      setTimeout(() => QCore.speakChinese(w.hanzi), 180);
    }

    const fb = stage.querySelector("#ex-feedback");
    stage.querySelectorAll("[data-ex-ans]").forEach((btn) => {
      btn.onclick = () => {
        const ok = btn.getAttribute("data-ex-ans") === "1";
        const dim = btn.getAttribute("data-dim") || "meaning";
        QCore.reviewWordSRS(w.id, ok ? 4 : 1);
        QCore.recordVocabSubSkill(w.id, dim, ok);
        QCore.speakChinese(w.hanzi);
        fb.innerHTML = `
          <div class="card-subtle" style="border-color:${ok ? "var(--primary)" : "var(--accent-red)"};">
            <strong style="color:${ok ? "var(--primary)" : "var(--accent-red)"};">${ok ? "✅ Chính xác!" : "❌ Chưa chính xác — đã đưa vào danh sách ôn lại!"}</strong>
            <div style="margin-top:6px;">
              <strong class="hanzi-text" style="font-size:20px;">${QCore.escapeHtml(w.hanzi)}</strong>
              <span class="pinyin-text" style="color:var(--primary);font-weight:700;margin-left:6px;">${QCore.escapeHtml(w.pinyin)}</span>
              — ${QCore.escapeHtml(getPrimaryVi(w))}
              ${w.han_viet ? ` <span style="color:var(--text-muted);">(Hán Việt: ${QCore.escapeHtml(w.han_viet)})</span>` : ""}
            </div>
          </div>
        `;
      };
    });

    const pyCheck = stage.querySelector("#ex-py-check");
    if (pyCheck) {
      const checkFn = () => {
        const raw = (stage.querySelector("#ex-py-inp").value || "").trim().toLowerCase();
        if (!raw) return;
        const normIn = QVocabStore.stripTone(raw).replace(/[^a-z0-9]/g, "");
        const normNoTone = normIn.replace(/[0-9]/g, "");
        const targetPlain = QVocabStore.stripTone(w.pinyin).replace(/[^a-z]/g, "");
        const targetNum = (w.pinyin_number || "").toLowerCase().replace(/\s+/g, "");
        const exactMatch = raw.replace(/\s+/g, "") === w.pinyin.toLowerCase().replace(/\s+/g, "") || (targetNum && normIn === targetNum);
        const plainMatch = normNoTone === targetPlain;
        const ok = exactMatch || plainMatch;
        QCore.reviewWordSRS(w.id, exactMatch ? 5 : plainMatch ? 3 : 1);
        QCore.recordVocabSubSkill(w.id, "pinyin", ok);
        QCore.speakChinese(w.hanzi);
        fb.innerHTML = `
          <div class="card-subtle" style="border-color:${ok ? "var(--primary)" : "var(--accent-red)"};">
            <strong style="color:${ok ? "var(--primary)" : "var(--accent-red)"};">${exactMatch ? "✅ Tuyệt vời! Chính xác cả Pinyin và thanh điệu!" : plainMatch ? "🟡 Đúng âm tiết! Chú ý thêm thanh điệu chuẩn:" : "❌ Chưa đúng Pinyin!"}</strong>
            <div style="margin-top:6px;">Đáp án chuẩn: <strong class="pinyin-text" style="color:var(--primary);font-size:18px;">${QCore.escapeHtml(w.pinyin)}</strong> (${QCore.escapeHtml(w.pinyin_number || "")})</div>
          </div>
        `;
      };
      pyCheck.onclick = checkFn;
      stage.querySelector("#ex-py-inp").onkeydown = (e) => { if (e.key === "Enter") checkFn(); };
    }

    const recBtn = stage.querySelector("#ex-rec");
    if (recBtn) {
      recBtn.onclick = () => {
        const out = stage.querySelector("#ex-rec-out");
        out.innerHTML = `🔴 Đang thu âm... Hãy đọc to: <strong>${QCore.escapeHtml(w.hanzi)} (${QCore.escapeHtml(w.pinyin)})</strong>`;
        QCore.captureLearnerVoice({
          durationMs: 3500,
          onAudioReady: (url, transcript) => {
            const matched = transcript && transcript.includes(w.hanzi);
            QCore.recordVocabSubSkill(w.id, "listening", Boolean(matched));
            out.innerHTML = `
              <audio controls src="${url}" style="width:100%;height:38px;margin-bottom:8px;"></audio>
              <div>${
                transcript
                  ? matched
                    ? `✅ Trình duyệt nhận diện: "<strong>${QCore.escapeHtml(transcript)}</strong>" — Khớp chữ mục tiêu! Hãy bấm nghe lại bản ghi âm để tự kiểm tra thêm độ chuẩn thanh điệu.`
                    : `🎙️ Trình duyệt nhận diện: "<strong>${QCore.escapeHtml(transcript)}</strong>" (mục tiêu: ${QCore.escapeHtml(w.hanzi)} · ${QCore.escapeHtml(w.pinyin)}). Hãy bấm nghe âm mẫu rồi thử lại nhé!`
                  : "🎧 Đã lưu bản thu âm. Bấm Play ở trên để tự đối chiếu với âm mẫu Putonghua."
              }</div>
            `;
          }
        });
      };
    }

    const sentBtn = stage.querySelector("#ex-sent-check");
    if (sentBtn) {
      if (window.QPinyinIME) QPinyinIME.attachAll(stage);
      stage.querySelector("#ex-sent-explain").onclick = () => window.QApp.navigate("ai-tutor", { tab: "explain_word", word: w.hanzi });
      sentBtn.onclick = async () => {
        const txt = (stage.querySelector("#ex-sent-inp").value || "").trim();
        if (!txt) {
          QCore.showToast("Vui lòng nhập câu tiếng Trung trước khi chấm.");
          return;
        }
        fb.innerHTML = `<div class="card-subtle">⏳ AI Giáo viên đang phân tích câu của bạn...</div>`;
        const res = await window.QAiTutor.evaluateSentenceSmart({
          text: txt,
          targetWord: w.hanzi,
          prompt: `Đặt câu với từ ${w.hanzi} (${w.pinyin} - ${getPrimaryVi(w)})`,
          hskLevel: w.hsk_level
        });
        const ok = (res.score || 0) >= 75;
        QCore.reviewWordSRS(w.id, ok ? 4 : 2);
        QCore.recordVocabSubSkill(w.id, "usage", ok);
        fb.innerHTML = window.QAiTutor.renderSentenceEvaluationCard(res);
      };
    }

    stage.querySelector("#ex-prev").onclick = () => {
      currentIdx = (currentIdx - 1 + list.length) % list.length;
      renderExerciseMode(stage, list, parentContainer);
    };
    stage.querySelector("#ex-next").onclick = () => {
      currentIdx = (currentIdx + 1) % list.length;
      renderExerciseMode(stage, list, parentContainer);
    };
  }

  /* ==================== CREATE CUSTOM FLASHCARD MODAL ==================== */
  function openCreateFlashcardModal(parentContainer) {
    let modal = document.getElementById("custom-vocab-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "custom-vocab-modal";
      modal.className = "modal-backdrop";
      document.body.appendChild(modal);
    }
    modal.classList.add("open");
    modal.innerHTML = `
      <div class="modal-card" style="max-width:520px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <h3 style="margin:0;">➕ Tạo Flashcard từ vựng cá nhân</h3>
          <button class="icon-btn" id="cv-close">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Chữ Hán Giản thể *</label>
            <div style="display:flex;gap:8px;">
              <input class="input-field hanzi-text" id="cv-hanzi" placeholder="Ví dụ: 办公室" style="font-size:18px;" />
              <button class="btn btn-soft btn-sm" id="cv-autofill" style="white-space:nowrap;">✨ Tự điền từ kho HSK</button>
            </div>
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Pinyin có dấu thanh *</label>
            <input class="input-field pinyin-text" id="cv-pinyin" placeholder="Ví dụ: bàn gōng shì" />
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Nghĩa tiếng Việt *</label>
            <input class="input-field" id="cv-vi" placeholder="Ví dụ: văn phòng" />
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Nghĩa tiếng Anh (tùy chọn)</label>
            <input class="input-field" id="cv-en" placeholder="Ví dụ: office" />
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Câu ví dụ (tùy chọn)</label>
            <input class="input-field hanzi-text" id="cv-ex" placeholder="Ví dụ: 我在办公室工作。" />
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;">
            <button class="btn btn-outline" id="cv-cancel">Hủy</button>
            <button class="btn btn-primary" id="cv-save">Lưu Flashcard</button>
          </div>
        </div>
      </div>
    `;
    const close = () => modal.classList.remove("open");
    modal.querySelector("#cv-close").onclick = close;
    modal.querySelector("#cv-cancel").onclick = close;

    modal.querySelector("#cv-autofill").onclick = () => {
      const hz = (modal.querySelector("#cv-hanzi").value || "").trim();
      if (!hz) return;
      const found = QVocabStore.lookupHanzi(hz);
      if (found) {
        modal.querySelector("#cv-pinyin").value = found.pinyin || "";
        modal.querySelector("#cv-vi").value = (found.meanings.vietnamese || []).join("; ") || "";
        modal.querySelector("#cv-en").value = (found.meanings.english || []).slice(0, 2).join("; ") || "";
        QCore.showToast("✨ Đã tự điền dữ liệu từ từ điển HSK!");
      } else {
        QCore.showToast("Từ này chưa có trong các cấp HSK đang tải — bạn có thể nhập thủ công nhé.");
      }
    };

    modal.querySelector("#cv-save").onclick = async () => {
      const hz = (modal.querySelector("#cv-hanzi").value || "").trim();
      const py = (modal.querySelector("#cv-pinyin").value || "").trim();
      const vi = (modal.querySelector("#cv-vi").value || "").trim();
      const en = (modal.querySelector("#cv-en").value || "").trim();
      const ex = (modal.querySelector("#cv-ex").value || "").trim();
      if (!hz || !vi) {
        QCore.showToast("Vui lòng nhập ít nhất Chữ Hán và Nghĩa tiếng Việt!");
        return;
      }
      QCore.addCustomVocab({
        hanzi: hz,
        pinyin: py,
        vietnamese: vi,
        english: en,
        examples: ex ? [{ chinese: ex, pinyin: "", vietnamese: "" }] : []
      });
      close();
      QCore.showToast(`✅ Đã tạo Flashcard "${hz}"!`);
      await ensureLoaded();
      renderVocab(parentContainer);
    };
  }

  /* ==================== SECTION 12: 12-STEP AI WORD TEACHER MODAL (PRESERVED) ==================== */
  function openStepByStepWordModal(startWordId) {
    const allVocab = window.QCHINESE_VOCAB || [];
    if (!allVocab.length) return;
    let wIdx = Math.max(0, allVocab.findIndex((x) => x.id === startWordId));
    let stepStage = 1;
    let recordedUrl = null;

    let backdrop = document.getElementById("step12-modal");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "step12-modal";
      backdrop.className = "modal-backdrop";
      document.body.appendChild(backdrop);
    }
    backdrop.classList.add("open");

    function renderStep() {
      const v = allVocab[wIdx % allVocab.length];
      const firstChar = v.hanzi.charAt(0);
      const ex = v.examples[0] || { chinese: v.hanzi, pinyin: v.pinyin, english: v.meanings.english[0], vietnamese: v.meanings.vietnamese[0] };

      backdrop.innerHTML = `
        <div class="modal-card" style="max-width:760px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <div>
              <span class="badge badge-jade">👩‍🏫 GIÁO VIÊN AI DẠY TỪNG TỪ THEO 12 BƯỚC</span>
              <strong style="margin-left:8px;font-size:14px;">Từ ${wIdx + 1}/${allVocab.length} · HSK ${v.hsk_level}</strong>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-outline btn-sm" id="s12-skip-word">Đổi từ khác ↻</button>
              <button class="icon-btn" id="s12-close">✕</button>
            </div>
          </div>

          <div class="tabs-bar" style="margin-bottom:16px;">
            <button class="tab-pill ${stepStage === 1 ? "active" : ""}" data-s12-tab="1">Bước 1–8: Nghe · Nghĩa · Ví dụ</button>
            <button class="tab-pill ${stepStage === 2 ? "active" : ""}" data-s12-tab="2">Bước 9–10: Xem nét & Đọc theo</button>
            <button class="tab-pill ${stepStage === 3 ? "active" : ""}" data-s12-tab="3">Bước 11: Tự viết chữ</button>
            <button class="tab-pill ${stepStage === 4 ? "active" : ""}" data-s12-tab="4">Bước 12: Kiểm tra nhớ</button>
          </div>

          <div id="s12-body"></div>
        </div>
      `;

      backdrop.querySelector("#s12-close").onclick = () => backdrop.classList.remove("open");
      backdrop.querySelector("#s12-skip-word").onclick = () => {
        wIdx = (wIdx + 1) % allVocab.length;
        stepStage = 1;
        recordedUrl = null;
        renderStep();
      };
      backdrop.querySelectorAll("[data-s12-tab]").forEach((b) => {
        b.onclick = () => { stepStage = Number(b.getAttribute("data-s12-tab")); renderStep(); };
      });

      const body = backdrop.querySelector("#s12-body");

      if (stepStage === 1) {
        QCore.speakChinese(v.hanzi);
        body.innerHTML = `
          <div style="text-align:center;margin-bottom:14px;">
            <div class="hanzi-calligraphy" style="font-size:68px;line-height:1.1;">${QCore.escapeHtml(v.hanzi)}</div>
            <div class="pinyin-text" style="font-size:24px;font-weight:700;color:var(--primary);margin:4px 0;">${QCore.escapeHtml(v.pinyin)}</div>
            <div style="display:flex;justify-content:center;gap:8px;margin-top:6px;">
              <button class="btn btn-primary btn-sm" id="s12-speak">🔊 Nghe phát âm mẫu</button>
              <button class="btn btn-outline btn-sm" id="s12-slow">🐢 Nghe chậm</button>
            </div>
          </div>
          <div class="vi-hint-banner" style="margin-bottom:12px;">
            <span>💡</span>
            <span><strong>Gợi ý cho người mới:</strong> ${QCore.escapeHtml(v.vietnamese_pronunciation_hint)}</span>
          </div>
          <div class="card-subtle" style="margin-bottom:12px;">
            <div>🇬🇧 <strong>Nghĩa tiếng Anh:</strong> ${QCore.escapeHtml(v.meanings.english.join("; "))}</div>
            <div style="margin-top:4px;">🇻🇳 <strong>Nghĩa tiếng Việt:</strong> ${QCore.escapeHtml(v.meanings.vietnamese.join("; "))}</div>
          </div>
          <div class="card-subtle" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
              <div><strong>Ví dụ:</strong> <span class="hanzi-text" style="font-size:18px;font-weight:700;">${QCore.escapeHtml(ex.chinese)}</span> (${QCore.escapeHtml(ex.pinyin)})</div>
              <div style="font-size:13px;color:var(--text-secondary);">🇻🇳 ${QCore.escapeHtml(ex.vietnamese)}</div>
            </div>
            <button class="btn btn-soft btn-sm" id="s12-speak-ex">🔊 Nghe câu</button>
          </div>
          <div style="text-align:right;">
            <button class="btn btn-primary" id="s12-next-2">Tiếp tục Bước 9–10 →</button>
          </div>
        `;
        body.querySelector("#s12-speak").onclick = () => QCore.speakChinese(v.hanzi);
        body.querySelector("#s12-slow").onclick = () => QCore.speakChinese(v.hanzi, { slow: true });
        body.querySelector("#s12-speak-ex").onclick = () => QCore.speakChinese(ex.chinese);
        body.querySelector("#s12-next-2").onclick = () => { stepStage = 2; renderStep(); };
      } else if (stepStage === 2) {
        body.innerHTML = `
          <div class="grid-2" style="margin-bottom:16px;">
            <div class="card-subtle" style="text-align:center;">
              <strong style="display:block;margin-bottom:8px;">Hướng dẫn nét chữ "${QCore.escapeHtml(firstChar)}"</strong>
              <div class="mizige-box" style="width:200px;height:200px;"><div id="s12-anim-box" class="mizige-target"></div></div>
              <button class="btn btn-soft btn-sm" style="margin-top:10px;" id="s12-replay-stroke">▶️ Phát lại nét</button>
            </div>
            <div class="card-subtle">
              <strong style="display:block;margin-bottom:8px;">Luyện phát âm theo giáo viên</strong>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
                <button class="btn btn-outline btn-sm" id="s12-model-voice">🔊 Nghe mẫu</button>
                <button class="btn btn-primary btn-sm" id="s12-rec-btn">🎙️ Thu âm 3.5s</button>
              </div>
              <div id="s12-rec-feedback" style="font-size:13px;color:var(--text-secondary);">
                ${recordedUrl ? `<audio controls src="${recordedUrl}" style="width:100%;height:36px;"></audio>` : "Chưa có bản ghi âm."}
              </div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <button class="btn btn-outline" id="s12-back-1">← Quay lại</button>
            <button class="btn btn-primary" id="s12-next-3">Sang Bước 11 →</button>
          </div>
        `;
        if (window.HanziWriter) {
          const sw = HanziWriter.create("s12-anim-box", firstChar, {
            width: 200, height: 200, padding: 12, strokeColor: "#2d6a4f", radicalColor: "#d94343",
            charDataLoader: (ch, onComplete) => QCore.fetchStrokeData(ch).then((d) => d && onComplete(d))
          });
          sw.animateCharacter();
          body.querySelector("#s12-replay-stroke").onclick = () => sw.animateCharacter();
        }
        body.querySelector("#s12-model-voice").onclick = () => QCore.speakChinese(v.hanzi);
        body.querySelector("#s12-rec-btn").onclick = () => {
          const fbEl = body.querySelector("#s12-rec-feedback");
          fbEl.textContent = "🔴 Đang thu âm...";
          QCore.captureLearnerVoice({
            durationMs: 3500,
            onAudioReady: (url, transcript) => {
              recordedUrl = url;
              fbEl.innerHTML = `<audio controls src="${url}" style="width:100%;height:36px;margin-bottom:6px;"></audio><div>${transcript ? `Nhận diện: "${QCore.escapeHtml(transcript)}"` : "Đã thu âm xong!"}</div>`;
            }
          });
        };
        body.querySelector("#s12-back-1").onclick = () => { stepStage = 1; renderStep(); };
        body.querySelector("#s12-next-3").onclick = () => { stepStage = 3; renderStep(); };
      } else if (stepStage === 3) {
        body.innerHTML = `
          <div style="text-align:center;margin-bottom:14px;">
            <strong>Thực hành tự viết chữ "${QCore.escapeHtml(firstChar)}"</strong>
            <div class="mizige-box" style="width:220px;height:220px;margin:10px auto;"><div id="s12-quiz-box" class="mizige-target"></div></div>
            <div id="s12-quiz-status" style="font-weight:600;color:var(--primary);">Hãy viết nét đầu tiên!</div>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <button class="btn btn-outline" id="s12-back-2">← Quay lại</button>
            <button class="btn btn-primary" id="s12-next-4">Sang Bước 12 →</button>
          </div>
        `;
        if (window.HanziWriter) {
          const qw = HanziWriter.create("s12-quiz-box", firstChar, {
            width: 220, height: 220, padding: 14, showCharacter: false, showOutline: true, showHintAfterMisses: 2,
            charDataLoader: (ch, onComplete) => QCore.fetchStrokeData(ch).then((d) => d && onComplete(d))
          });
          qw.quiz({
            onMistake: (sd) => { const el = body.querySelector("#s12-quiz-status"); if (el) el.textContent = `⚠️ Nét ${sd.strokeNum + 1} chưa đúng hướng!`; },
            onComplete: (sum) => {
              const acc = Math.max(60, 100 - sum.totalMistakes * 10);
              QCore.recordHanziPractice(firstChar, acc);
              const el = body.querySelector("#s12-quiz-status");
              if (el) el.textContent = `🎉 Hoàn thành! Độ chính xác: ${acc}%`;
            }
          });
        }
        body.querySelector("#s12-back-2").onclick = () => { stepStage = 2; renderStep(); };
        body.querySelector("#s12-next-4").onclick = () => { stepStage = 4; renderStep(); };
      } else {
        const opts = pickDistractors(v, allVocab, 3);
        body.innerHTML = `
          <div style="text-align:center;">
            <div class="hanzi-calligraphy" style="font-size:62px;margin:8px 0;">${QCore.escapeHtml(v.hanzi)}</div>
            <p style="color:var(--text-secondary);">Chọn phát âm và nghĩa đúng:</p>
            <div class="grid-2" style="margin-bottom:14px;">
              ${opts.map((o) => `<button class="btn btn-outline" style="padding:12px;" data-s12-ans="${o.id === v.id ? "1" : "0"}"><strong>${QCore.escapeHtml(o.pinyin)}</strong> — ${QCore.escapeHtml(o.meanings.vietnamese[0])}</button>`).join("")}
            </div>
            <div id="s12-final-msg"></div>
          </div>
        `;
        body.querySelectorAll("[data-s12-ans]").forEach((btn) => {
          btn.onclick = () => {
            const ok = btn.getAttribute("data-s12-ans") === "1";
            const msg = body.querySelector("#s12-final-msg");
            if (ok) {
              QCore.reviewWordSRS(v.id, 5);
              QCore.speakChinese(v.hanzi);
              msg.innerHTML = `<div class="card-subtle" style="border-color:var(--primary);"><strong style="color:var(--primary);">🎉 Hoàn thành 12 bước cho "${QCore.escapeHtml(v.hanzi)}"!</strong><div style="margin-top:8px;"><button class="btn btn-primary" id="s12-go-next">Học từ tiếp theo →</button></div></div>`;
              msg.querySelector("#s12-go-next").onclick = () => { wIdx = (wIdx + 1) % allVocab.length; stepStage = 1; recordedUrl = null; renderStep(); };
            } else {
              msg.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);">Chưa chính xác! Thử chọn lại nhé.</div>`;
            }
          };
        });
      }
    }
    renderStep();
  }

  return {
    renderVocab,
    openStepByStepWordModal
  };
})();
