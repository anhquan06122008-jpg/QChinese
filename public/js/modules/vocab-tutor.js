/* -*- coding: utf-8 -*-
 * QChinese – Module 3: Trilingual Vocabulary (8 Study Modes + SRS SM-2) & Section 12: 12-Step AI Word Teacher
 */

window.QVocabTutor = (function () {
  let filterHsk = "all";
  let filterTopic = "all";
  let onlyDueSRS = false;
  let studyMode = "mode1_hanzi_mean"; // 8 modes + list view
  let currentIdx = 0;
  let cardRevealed = false;
  let matchState = null;

  const MODES = [
    { id: "list", label: "📚 Danh sách Ba ngôn ngữ" },
    { id: "mode1_hanzi_mean", label: "1. Chữ Hán → Đoán nghĩa (SRS)" },
    { id: "mode2_vi_hanzi", label: "2. Nghĩa Việt → Nhớ chữ Hán" },
    { id: "mode3_audio_word", label: "3. Nghe âm → Chọn từ đúng" },
    { id: "mode4_py_write", label: "4. Nghe Pinyin → Viết chữ Hán" },
    { id: "mode5_hanzi_py", label: "5. Nhìn chữ Hán → Đọc Pinyin" },
    { id: "mode6_match", label: "6. Ghép từ với nghĩa" },
    { id: "mode7_fill", label: "7. Điền từ vào câu" },
    { id: "mode8_sentence", label: "8. Đặt câu với từ mới (AI)" }
  ];

  function getFilteredVocab() {
    const st = QCore.getState();
    const now = Date.now();
    let list = (window.QCHINESE_VOCAB || []).slice();
    if (filterHsk !== "all") {
      list = list.filter((v) => v.hsk_level === Number(filterHsk));
    }
    if (filterTopic !== "all") {
      list = list.filter((v) => v.topic === filterTopic);
    }
    if (onlyDueSRS) {
      list = list.filter((v) => {
        const rec = st.srs[v.id];
        return !rec || rec.nextReview <= now;
      });
    }
    // Sort SRS: forgotten/unseen words prioritized before well-remembered words
    list.sort((a, b) => {
      const sa = st.srs[a.id];
      const sb = st.srs[b.id];
      const na = sa ? sa.nextReview : 0;
      const nb = sb ? sb.nextReview : 0;
      return na - nb;
    });
    return list;
  }

  function pickDistractors(target, pool, count = 3) {
    const others = pool.filter((x) => x.id !== target.id);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, count);
    return [...shuffled, target].sort(() => Math.random() - 0.5);
  }

  function renderVocab(container) {
    const st = QCore.getState();
    const list = getFilteredVocab();
    if (currentIdx >= list.length) currentIdx = 0;

    const allVocab = window.QCHINESE_VOCAB || [];
    const dueCount = allVocab.filter((v) => !st.srs[v.id] || st.srs[v.id].nextReview <= Date.now()).length;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>📖 Học Từ Vựng Ba Ngôn Ngữ (Trung – Anh – Việt) & SRS</h2>
          <p>Tất cả từ vựng đều giảng dạy theo Chữ Hán Giản thể (简体中文), phân tách rõ nghĩa theo ngữ cảnh và lặp lại ngắt quãng thông minh.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn ${onlyDueSRS ? "btn-primary" : "btn-soft"} btn-sm" id="voc-toggle-due">
            🔄 Từ cần ôn SRS (${dueCount})
          </button>
          <button class="btn btn-outline btn-sm" id="voc-start-12step">
            👩‍🏫 Học từng từ 12 bước với AI
          </button>
        </div>
      </div>

      <!-- Filters: HSK & Topic -->
      <div class="card" style="padding:16px;margin-bottom:16px;">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between;">
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <strong style="font-size:13px;color:var(--text-muted);margin-right:4px;">Cấp HSK:</strong>
            ${["all", "1", "2", "3", "4", "5", "6"]
              .map(
                (lv) => `
              <button class="btn ${String(filterHsk) === lv ? "btn-primary" : "btn-outline"} btn-sm" data-vhsk="${lv}">
                ${lv === "all" ? "Tất cả" : `HSK ${lv}`}
              </button>
            `
              )
              .join("")}
          </div>

          <div style="min-width:220px;">
            <select class="select-field" id="voc-topic-sel" style="padding:7px 12px;font-size:13.5px;">
              ${(window.QCHINESE_TOPICS || [])
                .map(
                  (t) => `<option value="${t.id}" ${filterTopic === t.id ? "selected" : ""}>${t.icon} ${QCore.escapeHtml(t.label)}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>

        <!-- 8 Study Modes Switcher -->
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);display:flex;gap:6px;flex-wrap:wrap;">
          ${MODES.map(
            (m) => `
            <button class="btn ${studyMode === m.id ? "btn-primary" : "btn-outline"} btn-sm" data-vmode="${m.id}">
              ${m.label}
            </button>
          `
          ).join("")}
        </div>
      </div>

      <div id="vocab-stage"></div>
    `;

    container.querySelector("#voc-toggle-due").onclick = () => {
      onlyDueSRS = !onlyDueSRS;
      currentIdx = 0;
      renderVocab(container);
    };

    container.querySelectorAll("[data-vhsk]").forEach((btn) => {
      btn.onclick = () => {
        filterHsk = btn.getAttribute("data-vhsk");
        currentIdx = 0;
        cardRevealed = false;
        matchState = null;
        renderVocab(container);
      };
    });

    container.querySelector("#voc-topic-sel").onchange = (e) => {
      filterTopic = e.target.value;
      currentIdx = 0;
      cardRevealed = false;
      matchState = null;
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

    const step12Btn = container.querySelector("#voc-start-12step");
    step12Btn.onclick = () => {
      const targetWord = list[currentIdx] || (window.QCHINESE_VOCAB || [])[0];
      if (targetWord) openStepByStepWordModal(targetWord.id);
    };

    const stage = container.querySelector("#vocab-stage");
    if (!list.length) {
      stage.innerHTML = `<div class="card" style="text-align:center;padding:36px;">Không có từ vựng nào khớp bộ lọc hiện tại. Hãy chọn "Tất cả" để tiếp tục học nhé!</div>`;
      return;
    }

    if (studyMode === "list") {
      renderTrilingualList(stage, list);
    } else if (studyMode === "mode6_match") {
      renderMatchGame(stage, list);
    } else {
      renderInteractiveStudyCard(stage, list, container);
    }
  }

  function renderTrilingualList(stage, list) {
    const st = QCore.getState();
    const showViHint = st.profile.showVietnameseHint !== false;

    stage.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px;">
        ${list
          .map((v) => {
            const srs = st.srs[v.id];
            return `
              <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
                  <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;">
                    <div class="hanzi-calligraphy" style="font-size:46px;line-height:1.1;cursor:pointer;" data-inspect-hz="${QCore.escapeHtml(v.hanzi.charAt(0))}" title="Bấm xem chi tiết nét chữ">
                      ${QCore.escapeHtml(v.hanzi)}
                    </div>
                    <div>
                      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <span class="pinyin-text" style="font-size:20px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(v.pinyin)}</span>
                        <span class="badge">HSK ${v.hsk_level}</span>
                        <span class="badge badge-blue">${QCore.escapeHtml(v.part_of_speech)}</span>
                        ${srs ? `<span class="badge badge-jade">Đã ôn ${srs.reps} lần</span>` : `<span class="badge">Từ mới</span>`}
                      </div>
                      ${
                        showViHint
                          ? `<div style="font-size:12.5px;color:var(--accent-amber);margin-top:4px;">💡 Phiên âm hỗ trợ người mới: <strong>${QCore.escapeHtml(v.vietnamese_pronunciation_hint)}</strong> <em>(chỉ tham khảo ban đầu, ưu tiên nghe âm chuẩn)</em></div>`
                          : ""
                      }
                    </div>
                  </div>

                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-primary btn-sm" data-speak="${QCore.escapeHtml(v.hanzi)}">🔊 Nghe chuẩn</button>
                    <button class="btn btn-outline btn-sm" data-speak-slow="${QCore.escapeHtml(v.hanzi)}">🐢 Chậm</button>
                    <button class="btn btn-soft btn-sm" data-step12="${v.id}">👩‍🏫 Học 12 bước</button>
                    <button class="btn btn-outline btn-sm" data-write-char="${QCore.escapeHtml(v.hanzi.charAt(0))}">✍️ Tập viết nét</button>
                    <button class="btn btn-outline btn-sm" data-save-nb="${v.id}">📒 Lưu sổ tay</button>
                  </div>
                </div>

                <!-- Trilingual Table (Section 7) -->
                <table class="tri-table" style="margin-bottom:12px;">
                  <tr>
                    <th>🇨🇳 Tiếng Trung</th>
                    <td class="hanzi-text">${v.meanings.chinese.map((m) => QCore.escapeHtml(m)).join("<br>")}</td>
                  </tr>
                  <tr>
                    <th>🇬🇧 Tiếng Anh</th>
                    <td><ul style="margin:0;padding-left:18px;">${v.meanings.english.map((m) => `<li>${QCore.escapeHtml(m)}</li>`).join("")}</ul></td>
                  </tr>
                  <tr>
                    <th>🇻🇳 Tiếng Việt</th>
                    <td><ul style="margin:0;padding-left:18px;font-weight:600;">${v.meanings.vietnamese.map((m) => `<li>${QCore.escapeHtml(m)}</li>`).join("")}</ul></td>
                  </tr>
                </table>

                ${
                  v.polyphonic && v.polyphonic.length
                    ? `
                  <div class="card-subtle" style="margin-bottom:10px;border-left:3px solid var(--accent-blue);">
                    <strong style="font-size:13px;">🔀 Từ / Chữ nhiều cách đọc theo ngữ cảnh (多音字):</strong>
                    <div style="margin-top:4px;font-size:13px;">
                      ${v.polyphonic.map((p) => `<div>• <strong>${QCore.escapeHtml(p.pinyin)}</strong>: ${QCore.escapeHtml(p.meaningVi)} — <em>${QCore.escapeHtml(p.example)}</em></div>`).join("")}
                    </div>
                  </div>
                `
                    : ""
                }

                ${
                  v.confused_with
                    ? `<div style="font-size:13px;color:var(--text-secondary);margin-bottom:10px;">⚠️ <strong>Lưu ý phân biệt & ngữ cảnh:</strong> ${QCore.escapeHtml(v.confused_with)}</div>`
                    : ""
                }

                <div style="display:flex;flex-direction:column;gap:6px;">
                  ${v.examples
                    .map(
                      (ex) => `
                    <div class="card-subtle" style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
                      <div>
                        <div class="hanzi-text" style="font-size:16px;font-weight:600;">${QCore.escapeHtml(ex.chinese)} <span class="pinyin-text" style="font-size:13.5px;color:var(--primary);font-weight:500;">(${QCore.escapeHtml(ex.pinyin)})</span></div>
                        <div style="font-size:13px;color:var(--text-secondary);">🇬🇧 ${QCore.escapeHtml(ex.english)} · 🇻🇳 <strong>${QCore.escapeHtml(ex.vietnamese)}</strong></div>
                      </div>
                      <button class="btn btn-outline btn-sm" data-speak="${QCore.escapeHtml(ex.chinese)}">🔊</button>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    bindCommonVocabButtons(stage);
  }

  function bindCommonVocabButtons(root) {
    root.querySelectorAll("[data-speak]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak"));
    });
    root.querySelectorAll("[data-speak-slow]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak-slow"), { slow: true });
    });
    root.querySelectorAll("[data-step12]").forEach((b) => {
      b.onclick = () => openStepByStepWordModal(b.getAttribute("data-step12"));
    });
    root.querySelectorAll("[data-write-char],[data-inspect-hz]").forEach((b) => {
      b.onclick = () => {
        const ch = b.getAttribute("data-write-char") || b.getAttribute("data-inspect-hz");
        window.QApp.navigate("hanzi", { char: ch });
      };
    });
    root.querySelectorAll("[data-save-nb]").forEach((b) => {
      b.onclick = () => {
        const v = (window.QCHINESE_VOCAB || []).find((x) => x.id === b.getAttribute("data-save-nb"));
        if (!v) return;
        QCore.addToNotebook({
          category: "vocab",
          hanzi: v.hanzi,
          pinyin: v.pinyin,
          english: v.meanings.english.join("; "),
          vietnamese: v.meanings.vietnamese.join("; "),
          example: v.examples[0] ? `${v.examples[0].chinese} (${v.examples[0].vietnamese})` : ""
        });
      };
    });
  }

  function renderMatchGame(stage, list) {
    if (!matchState) {
      const sample = list.slice(0, Math.min(6, list.length));
      const left = sample.map((v) => ({ id: v.id, text: `${v.hanzi} (${v.pinyin})`, hanzi: v.hanzi })).sort(() => Math.random() - 0.5);
      const right = sample.map((v) => ({ id: v.id, text: v.meanings.vietnamese[0] })).sort(() => Math.random() - 0.5);
      matchState = { left, right, pickedLeft: null, matchedIds: [] };
    }

    const doneAll = matchState.matchedIds.length === matchState.left.length;

    stage.innerHTML = `
      <div class="card" style="max-width:860px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h3 style="margin:0;">🎯 Chế độ 6: Ghép từ tiếng Trung với nghĩa tiếng Việt</h3>
            <small style="color:var(--text-muted);">Chọn 1 thẻ chữ Hán bên trái rồi bấm nghĩa tương ứng bên phải</small>
          </div>
          <button class="btn btn-outline btn-sm" id="match-reset">🔄 Đổi bộ thẻ mới</button>
        </div>

        ${
          doneAll
            ? `
          <div class="card-subtle" style="text-align:center;padding:24px;border-color:var(--primary);">
            <h3 style="color:var(--primary);margin:0 0 8px;">🎉 Tuyệt vời! Bạn đã ghép đúng toàn bộ các từ!</h3>
            <button class="btn btn-primary" id="match-again">Chơi lượt tiếp theo</button>
          </div>
        `
            : `
          <div class="grid-2">
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${matchState.left
                .map((item) => {
                  const matched = matchState.matchedIds.includes(item.id);
                  const active = matchState.pickedLeft === item.id;
                  return `<button class="btn ${matched ? "btn-soft" : active ? "btn-primary" : "btn-outline"} hanzi-text" style="font-size:18px;padding:14px;" ${matched ? "disabled" : ""} data-mleft="${item.id}" data-mhz="${QCore.escapeHtml(item.hanzi)}">${matched ? "✓ " : ""}${QCore.escapeHtml(item.text)}</button>`;
                })
                .join("")}
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${matchState.right
                .map((item) => {
                  const matched = matchState.matchedIds.includes(item.id);
                  return `<button class="btn ${matched ? "btn-soft" : "btn-outline"}" style="padding:14px;" ${matched ? "disabled" : ""} data-mright="${item.id}">${matched ? "✓ " : ""}${QCore.escapeHtml(item.text)}</button>`;
                })
                .join("")}
            </div>
          </div>
        `
        }
      </div>
    `;

    const resetFn = () => {
      matchState = null;
      renderMatchGame(stage, list.slice().sort(() => Math.random() - 0.5));
    };
    stage.querySelector("#match-reset").onclick = resetFn;
    const againBtn = stage.querySelector("#match-again");
    if (againBtn) againBtn.onclick = resetFn;

    stage.querySelectorAll("[data-mleft]").forEach((btn) => {
      btn.onclick = () => {
        matchState.pickedLeft = btn.getAttribute("data-mleft");
        QCore.speakChinese(btn.getAttribute("data-mhz"));
        renderMatchGame(stage, list);
      };
    });

    stage.querySelectorAll("[data-mright]").forEach((btn) => {
      btn.onclick = () => {
        if (!matchState.pickedLeft) {
          QCore.showToast("Hãy chọn 1 từ chữ Hán ở cột bên trái trước nhé!");
          return;
        }
        const rightId = btn.getAttribute("data-mright");
        if (matchState.pickedLeft === rightId) {
          matchState.matchedIds.push(rightId);
          QCore.reviewWordSRS(rightId, 4);
          matchState.pickedLeft = null;
        } else {
          QCore.reviewWordSRS(matchState.pickedLeft, 2);
          QCore.showToast("Chưa khớp rồi, hãy nghe lại âm và thử cặp khác nhé!");
          matchState.pickedLeft = null;
        }
        renderMatchGame(stage, list);
      };
    });
  }

  function renderInteractiveStudyCard(stage, list, parentContainer) {
    const v = list[currentIdx];
    const allPool = window.QCHINESE_VOCAB || list;
    const choices = pickDistractors(v, allPool, 3);
    const ex = v.examples[0] || { chinese: v.hanzi, pinyin: v.pinyin, english: v.meanings.english[0], vietnamese: v.meanings.vietnamese[0] };
    const blankedSentence = ex.chinese.includes(v.hanzi)
      ? ex.chinese.replace(v.hanzi, " ______ ")
      : `请用“______”造句（${v.meanings.vietnamese[0]}）。`;

    let bodyHtml = "";

    if (studyMode === "mode1_hanzi_mean") {
      bodyHtml = `
        <div style="text-align:center;padding:12px 0 18px;">
          <div class="hanzi-calligraphy" style="font-size:84px;line-height:1.15;margin-bottom:8px;">${QCore.escapeHtml(v.hanzi)}</div>
          <div style="display:flex;justify-content:center;gap:8px;margin-bottom:14px;">
            <button class="btn btn-soft btn-sm" id="card-audio">🔊 Nghe phát âm</button>
            <button class="btn btn-outline btn-sm" id="card-slow">🐢 Nghe chậm</button>
          </div>
          ${
            !cardRevealed
              ? `<button class="btn btn-primary" id="btn-reveal-card">👁️ Tự nhẩm nghĩa trước → Bấm xem đáp án</button>`
              : `
              <div class="card-subtle" style="text-align:left;max-width:620px;margin:0 auto 16px;">
                <div style="font-size:22px;font-weight:700;color:var(--primary);text-align:center;margin-bottom:8px;">${QCore.escapeHtml(v.pinyin)}</div>
                <div class="vi-hint-banner" style="margin-bottom:10px;">
                  <span>💡</span>
                  <span>Gợi ý đọc gần đúng cho người Việt: <strong>${QCore.escapeHtml(v.vietnamese_pronunciation_hint)}</strong></span>
                </div>
                <p style="margin:4px 0;">🇻🇳 <strong>Tiếng Việt:</strong> ${QCore.escapeHtml(v.meanings.vietnamese.join(" · "))}</p>
                <p style="margin:4px 0;">🇬🇧 <strong>English:</strong> ${QCore.escapeHtml(v.meanings.english.join(" · "))}</p>
                <p style="margin:4px 0;" class="hanzi-text">🇨🇳 <strong>Giải thích Trung:</strong> ${QCore.escapeHtml(v.meanings.chinese[0])}</p>
                <p style="margin:8px 0 0;font-size:13.5px;color:var(--text-secondary);">Ví dụ: <strong class="hanzi-text">${QCore.escapeHtml(ex.chinese)}</strong> (${QCore.escapeHtml(ex.pinyin)}) — ${QCore.escapeHtml(ex.vietnamese)}</p>
              </div>
              <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">Đánh giá mức độ nhớ để thuật toán Spaced Repetition lên lịch ôn:</div>
              <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
                <button class="btn btn-danger btn-sm" data-srs-q="1">1. Chưa nhớ (Ôn lại ngay)</button>
                <button class="btn btn-outline btn-sm" data-srs-q="3">2. Hơi khó (1 ngày)</button>
                <button class="btn btn-soft btn-sm" data-srs-q="4">3. Đã nhớ (3+ ngày)</button>
                <button class="btn btn-primary btn-sm" data-srs-q="5">4. Rất chắc chắn!</button>
              </div>
            `
          }
        </div>
      `;
    } else if (studyMode === "mode2_vi_hanzi") {
      bodyHtml = `
        <div style="text-align:center;padding:10px 0;">
          <span class="badge badge-blue">Nhìn nghĩa tiếng Việt → Chọn đúng chữ Hán Giản thể</span>
          <h3 style="font-size:24px;margin:14px 0 6px;">🇻🇳 ${QCore.escapeHtml(v.meanings.vietnamese.join(" / "))}</h3>
          <p style="color:var(--text-muted);margin:0 0 18px;">🇬🇧 ${QCore.escapeHtml(v.meanings.english.join(" / "))}</p>
          <div class="grid-2" style="max-width:540px;margin:0 auto;">
            ${choices
              .map(
                (c) => `
              <button class="btn btn-outline hanzi-calligraphy" style="font-size:32px;padding:16px;" data-quiz-ans="${c.id === v.id ? "1" : "0"}" data-speak-opt="${QCore.escapeHtml(c.hanzi)}">
                ${QCore.escapeHtml(c.hanzi)}
              </button>
            `
              )
              .join("")}
          </div>
          <div id="quiz-feedback" style="margin-top:14px;"></div>
        </div>
      `;
    } else if (studyMode === "mode3_audio_word") {
      bodyHtml = `
        <div style="text-align:center;padding:10px 0;">
          <span class="badge badge-jade">Nghe âm thanh chuẩn → Chọn từ đúng</span>
          <div style="margin:18px 0;">
            <button class="btn btn-primary" id="mode3-play">🔊 Bấm nghe phát âm từ vựng</button>
            <button class="btn btn-outline btn-sm" id="mode3-slow" style="margin-left:6px;">🐢 Nghe chậm</button>
          </div>
          <div class="grid-2" style="max-width:600px;margin:0 auto;">
            ${choices
              .map(
                (c) => `
              <button class="btn btn-outline" style="padding:14px;flex-direction:column;gap:2px;" data-quiz-ans="${c.id === v.id ? "1" : "0"}">
                <span class="hanzi-text" style="font-size:24px;font-weight:700;">${QCore.escapeHtml(c.hanzi)}</span>
                <span style="font-size:13px;color:var(--text-secondary);">${QCore.escapeHtml(c.meanings.vietnamese[0])}</span>
              </button>
            `
              )
              .join("")}
          </div>
          <div id="quiz-feedback" style="margin-top:14px;"></div>
        </div>
      `;
    } else if (studyMode === "mode4_py_write") {
      bodyHtml = `
        <div style="max-width:580px;margin:0 auto;text-align:center;">
          <span class="badge badge-amber">Nghe & Nhìn Pinyin → Gõ hoặc viết chữ Hán Giản thể</span>
          <h3 class="pinyin-text" style="font-size:34px;color:var(--primary);margin:12px 0 6px;">${QCore.escapeHtml(v.pinyin)}</h3>
          <p style="margin:0 0 14px;color:var(--text-secondary);">Nghĩa: <strong>${QCore.escapeHtml(v.meanings.vietnamese[0])}</strong> · <button class="btn btn-soft btn-sm" id="mode4-play">🔊 Nghe âm</button></p>
          <input class="input-field hanzi-text" id="mode4-input" data-pinyin-ime="true" placeholder="Gõ Pinyin không dấu (vd: ${QCore.escapeHtml(v.pinyin_plain)}) để chọn chữ Hán..." style="font-size:22px;text-align:center;margin-bottom:12px;">
          <div style="display:flex;justify-content:center;gap:8px;">
            <button class="btn btn-primary" id="mode4-check">Kiểm tra chữ Hán</button>
            <button class="btn btn-outline" id="mode4-open-canvas">✍️ Tập viết từng nét chữ này</button>
          </div>
          <div id="quiz-feedback" style="margin-top:14px;"></div>
        </div>
      `;
    } else if (studyMode === "mode5_hanzi_py") {
      bodyHtml = `
        <div style="max-width:580px;margin:0 auto;text-align:center;">
          <span class="badge badge-blue">Nhìn chữ Hán → Chọn hoặc gõ Pinyin chuẩn dấu thanh</span>
          <div class="hanzi-calligraphy" style="font-size:74px;margin:8px 0;">${QCore.escapeHtml(v.hanzi)}</div>
          <div class="grid-2" style="margin-bottom:12px;">
            ${choices
              .map(
                (c) => `
              <button class="btn btn-outline pinyin-text" style="font-size:18px;padding:12px;" data-quiz-ans="${c.id === v.id ? "1" : "0"}">
                ${QCore.escapeHtml(c.pinyin)}
              </button>
            `
              )
              .join("")}
          </div>
          <div id="quiz-feedback" style="margin-top:12px;"></div>
        </div>
      `;
    } else if (studyMode === "mode7_fill") {
      bodyHtml = `
        <div style="max-width:620px;margin:0 auto;text-align:center;">
          <span class="badge badge-jade">Điền từ đúng vào ngữ cảnh câu</span>
          <div class="card-subtle" style="margin:14px 0;">
            <div class="hanzi-text" style="font-size:24px;font-weight:700;margin-bottom:6px;">${QCore.escapeHtml(blankedSentence)}</div>
            <div style="font-size:14px;color:var(--text-secondary);">🇻🇳 Nghĩa câu: ${QCore.escapeHtml(ex.vietnamese)}</div>
          </div>
          <div class="grid-2">
            ${choices
              .map(
                (c) => `
              <button class="btn btn-outline hanzi-text" style="font-size:20px;padding:12px;" data-quiz-ans="${c.id === v.id ? "1" : "0"}">
                ${QCore.escapeHtml(c.hanzi)} (${QCore.escapeHtml(c.pinyin)})
              </button>
            `
              )
              .join("")}
          </div>
          <div id="quiz-feedback" style="margin-top:14px;"></div>
        </div>
      `;
    } else if (studyMode === "mode8_sentence") {
      bodyHtml = `
        <div style="max-width:660px;margin:0 auto;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;">
            <span class="badge badge-jade">Chế độ 8: Tự đặt câu với từ "${QCore.escapeHtml(v.hanzi)} (${QCore.escapeHtml(v.pinyin)})"</span>
            <span style="font-size:13px;color:var(--text-secondary);">Nghĩa: <strong>${QCore.escapeHtml(v.meanings.vietnamese[0])}</strong></span>
          </div>
          <p style="font-size:13.5px;color:var(--text-secondary);margin:0 0 10px;">
            Ví dụ mẫu: <strong class="hanzi-text">${QCore.escapeHtml(ex.chinese)}</strong> (${QCore.escapeHtml(ex.pinyin)}) — ${QCore.escapeHtml(ex.vietnamese)}
          </p>
          <textarea class="textarea-field hanzi-text" id="mode8-text" rows="3" data-pinyin-ime="true" placeholder="Gõ Pinyin để hiện gợi ý chữ Hán và đặt 1 câu có chứa từ '${QCore.escapeHtml(v.hanzi)}'..."></textarea>
          <div style="margin-top:10px;display:flex;gap:8px;">
            <button class="btn btn-primary" id="mode8-grade">👩‍🏫 Nhờ AI Giáo viên chấm câu</button>
          </div>
          <div id="mode8-result" style="margin-top:14px;"></div>
        </div>
      `;
    }

    stage.innerHTML = `
      <div class="card" style="max-width:820px;margin:0 auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span class="badge">Thẻ ${currentIdx + 1} / ${list.length} · HSK ${v.hsk_level}</span>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm" id="voc-prev">← Trước</button>
            <button class="btn btn-outline btn-sm" id="voc-next">Tiếp theo →</button>
          </div>
        </div>
        ${bodyHtml}
      </div>
    `;

    stage.querySelector("#voc-prev").onclick = () => {
      currentIdx = (currentIdx - 1 + list.length) % list.length;
      cardRevealed = false;
      renderInteractiveStudyCard(stage, list, parentContainer);
    };
    stage.querySelector("#voc-next").onclick = () => {
      currentIdx = (currentIdx + 1) % list.length;
      cardRevealed = false;
      renderInteractiveStudyCard(stage, list, parentContainer);
    };

    const audioBtn = stage.querySelector("#card-audio");
    if (audioBtn) audioBtn.onclick = () => QCore.speakChinese(v.hanzi);
    const slowBtn = stage.querySelector("#card-slow");
    if (slowBtn) slowBtn.onclick = () => QCore.speakChinese(v.hanzi, { slow: true });

    const revealBtn = stage.querySelector("#btn-reveal-card");
    if (revealBtn) {
      revealBtn.onclick = () => {
        cardRevealed = true;
        QCore.speakChinese(v.hanzi);
        renderInteractiveStudyCard(stage, list, parentContainer);
      };
    }

    stage.querySelectorAll("[data-srs-q]").forEach((btn) => {
      btn.onclick = () => {
        const q = Number(btn.getAttribute("data-srs-q"));
        QCore.reviewWordSRS(v.id, q);
        currentIdx = (currentIdx + 1) % list.length;
        cardRevealed = false;
        renderInteractiveStudyCard(stage, list, parentContainer);
      };
    });

    if (studyMode === "mode3_audio_word") {
      QCore.speakChinese(v.hanzi);
      stage.querySelector("#mode3-play").onclick = () => QCore.speakChinese(v.hanzi);
      stage.querySelector("#mode3-slow").onclick = () => QCore.speakChinese(v.hanzi, { slow: true });
    }

    stage.querySelectorAll("[data-quiz-ans]").forEach((btn) => {
      btn.onclick = () => {
        const ok = btn.getAttribute("data-quiz-ans") === "1";
        const fb = stage.querySelector("#quiz-feedback");
        QCore.speakChinese(v.hanzi);
        if (ok) {
          QCore.reviewWordSRS(v.id, 4);
          fb.innerHTML = `<div class="card-subtle" style="border-color:var(--primary);color:var(--primary);font-weight:700;">✅ Chính xác! ${QCore.escapeHtml(v.hanzi)} (${QCore.escapeHtml(v.pinyin)}) — ${QCore.escapeHtml(v.meanings.vietnamese.join(", "))}</div>`;
        } else {
          QCore.reviewWordSRS(v.id, 1);
          fb.innerHTML = `<div class="card-subtle" style="border-color:var(--accent-red);color:var(--accent-red);font-weight:600;">❌ Chưa đúng rồi! Đáp án chuẩn là: <strong>${QCore.escapeHtml(v.hanzi)} (${QCore.escapeHtml(v.pinyin)})</strong> — ${QCore.escapeHtml(v.meanings.vietnamese[0])}</div>`;
        }
      };
    });

    if (studyMode === "mode4_py_write") {
      stage.querySelector("#mode4-play").onclick = () => QCore.speakChinese(v.hanzi);
      stage.querySelector("#mode4-open-canvas").onclick = () => window.QApp.navigate("hanzi", { char: v.hanzi.charAt(0) });
      stage.querySelector("#mode4-check").onclick = () => {
        const val = stage.querySelector("#mode4-input").value.trim();
        const fb = stage.querySelector("#quiz-feedback");
        if (val === v.hanzi) {
          QCore.reviewWordSRS(v.id, 5);
          QCore.speakChinese(v.hanzi);
          fb.innerHTML = `<div class="card-subtle" style="border-color:var(--primary);color:var(--primary);font-weight:700;">🎉 Hoàn hảo! Bạn đã viết đúng chữ Giản thể ${QCore.escapeHtml(v.hanzi)}!</div>`;
        } else {
          QCore.reviewWordSRS(v.id, 2);
          fb.innerHTML = `<div class="card-subtle" style="border-color:var(--accent-amber);">Đáp án chuẩn là <strong class="hanzi-text" style="font-size:22px;">${QCore.escapeHtml(v.hanzi)}</strong> (${QCore.escapeHtml(v.pinyin)}). Bạn hãy gõ lại hoặc bấm Tập viết từng nét nhé!</div>`;
        }
      };
    }

    if (studyMode === "mode8_sentence") {
      stage.querySelector("#mode8-grade").onclick = async () => {
        const text = stage.querySelector("#mode8-text").value.trim();
        const resBox = stage.querySelector("#mode8-result");
        if (!text) {
          QCore.showToast("Hãy nhập câu của bạn trước khi chấm nhé!");
          return;
        }
        resBox.innerHTML = `<div class="card-subtle">⏳ AI Giáo viên đang phân tích câu của bạn...</div>`;
        try {
          const data = await QCore.apiFetch("/api/ai/writing", {
            method: "POST",
            body: {
              text,
              targetWord: v.hanzi,
              prompt: `Đặt câu với từ ${v.hanzi} (${v.meanings.vietnamese[0]})`,
              expected: ex.chinese,
              expectedPinyin: ex.pinyin,
              expectedEn: ex.english,
              expectedVi: ex.vietnamese,
              hskLevel: v.hsk_level
            }
          });
          QCore.reviewWordSRS(v.id, data.score >= 75 ? 4 : 2);
          resBox.innerHTML = `
            <div class="card-subtle" style="border-left:4px solid var(--primary);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <strong>Điểm đánh giá: ${data.score}/100</strong>
                <button class="btn btn-soft btn-sm" id="mode8-speak-corr">🔊 Nghe câu chuẩn</button>
              </div>
              <div><strong>Câu gợi ý chuẩn:</strong> <span class="hanzi-text" style="font-size:18px;color:var(--primary);">${QCore.escapeHtml(data.corrected)}</span></div>
              <div style="font-size:13.5px;margin-top:6px;">💡 <strong>Nhận xét của Giáo viên:</strong> ${QCore.escapeHtml(data.whyWrong)}</div>
            </div>
          `;
          const spk = resBox.querySelector("#mode8-speak-corr");
          if (spk) spk.onclick = () => QCore.speakChinese(data.corrected);
        } catch (err) {
          resBox.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);">${QCore.escapeHtml(err.message)}</div>`;
        }
      };
    }
  }

  /* ==================== SECTION 12: AI 12-STEP NEW WORD TEACHER MODAL ==================== */
  function openStepByStepWordModal(wordId) {
    const allVocab = window.QCHINESE_VOCAB || [];
    let wIdx = allVocab.findIndex((x) => x.id === wordId);
    if (wIdx < 0) wIdx = 0;

    let stepStage = 1; // 1: Steps 1-8 (Look/Listen/Understand), 2: Step 9-10 (Stroke & Pronounce), 3: Step 11 (Write Quiz), 4: Step 12 (Memory Check)
    let recordedUrl = null;
    let stepWriter = null;

    let backdrop = document.getElementById("step12-modal");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "step12-modal";
      backdrop.className = "modal-backdrop";
      document.body.appendChild(backdrop);
    }
    backdrop.classList.add("open");

    function renderStep() {
      const v = allVocab[wIdx];
      const ex = v.examples[0] || { chinese: v.hanzi, pinyin: v.pinyin, english: v.meanings.english[0], vietnamese: v.meanings.vietnamese[0] };
      const firstChar = v.hanzi.charAt(0);

      backdrop.innerHTML = `
        <div class="modal-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px;flex-wrap:wrap;">
            <span class="badge badge-jade">👩‍🏫 AI Giáo viên dạy từ mới từng bước (${wIdx + 1}/${allVocab.length})</span>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-outline btn-sm" id="s12-skip-word">Chủ động bỏ qua sang từ tiếp →</button>
              <button class="btn btn-outline btn-sm" id="s12-close">✕ Đóng</button>
            </div>
          </div>

          <!-- Progress pills for the 4 pedagogical phases covering all 12 steps -->
          <div class="tabs-bar" style="width:100%;justify-content:space-between;margin-bottom:16px;">
            <button class="tab-pill ${stepStage === 1 ? "active" : ""}" data-s12-tab="1">Bước 1–8: Nhìn · Nghe · Hiểu</button>
            <button class="tab-pill ${stepStage === 2 ? "active" : ""}" data-s12-tab="2">Bước 9–10: Nét viết & Phát âm</button>
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
        b.onclick = () => {
          stepStage = Number(b.getAttribute("data-s12-tab"));
          renderStep();
        };
      });

      const body = backdrop.querySelector("#s12-body");

      if (stepStage === 1) {
        QCore.speakChinese(v.hanzi);
        body.innerHTML = `
          <div style="text-align:center;margin-bottom:14px;">
            <div class="hanzi-calligraphy" style="font-size:68px;line-height:1.1;">${QCore.escapeHtml(v.hanzi)}</div>
            <div class="pinyin-text" style="font-size:24px;font-weight:700;color:var(--primary);margin:4px 0;">${QCore.escapeHtml(v.pinyin)}</div>
            <div style="display:flex;justify-content:center;gap:8px;margin-top:6px;">
              <button class="btn btn-primary btn-sm" id="s12-speak">🔊 2. Nghe phát âm mẫu</button>
              <button class="btn btn-outline btn-sm" id="s12-slow">🐢 Nghe chậm</button>
            </div>
          </div>

          <div class="vi-hint-banner" style="margin-bottom:12px;">
            <span>4️⃣</span>
            <span><strong>Phiên âm hỗ trợ tiếng Việt:</strong> ${QCore.escapeHtml(v.vietnamese_pronunciation_hint)} <em>(chỉ dùng làm điểm tựa ban đầu, hãy nghe kỹ âm mẫu ở trên)</em></span>
          </div>

          <div class="card-subtle" style="margin-bottom:12px;">
            <div>5️⃣ <strong>Nghĩa tiếng Anh:</strong> ${QCore.escapeHtml(v.meanings.english.join("; "))}</div>
            <div style="margin-top:4px;">6️⃣ <strong>Nghĩa tiếng Việt:</strong> ${QCore.escapeHtml(v.meanings.vietnamese.join("; "))}</div>
            <div style="margin-top:4px;">7️⃣ <strong>Cách sử dụng (${QCore.escapeHtml(v.part_of_speech)}):</strong> ${QCore.escapeHtml(v.senses && v.senses[0] ? v.senses[0].vi + " " + (v.senses[0].context || "") : v.meanings.chinese[0])}</div>
          </div>

          <div class="card-subtle" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
              <div>8️⃣ <strong>Ví dụ thực tế:</strong> <span class="hanzi-text" style="font-size:18px;font-weight:700;">${QCore.escapeHtml(ex.chinese)}</span> (${QCore.escapeHtml(ex.pinyin)})</div>
              <div style="font-size:13px;color:var(--text-secondary);">🇬🇧 ${QCore.escapeHtml(ex.english)} · 🇻🇳 ${QCore.escapeHtml(ex.vietnamese)}</div>
            </div>
            <button class="btn btn-soft btn-sm" id="s12-speak-ex">🔊 Nghe câu</button>
          </div>

          <div style="text-align:right;">
            <button class="btn btn-primary" id="s12-next-2">Tiếp tục sang Bước 9–10 (Xem nét & Luyện đọc) →</button>
          </div>
        `;
        body.querySelector("#s12-speak").onclick = () => QCore.speakChinese(v.hanzi);
        body.querySelector("#s12-slow").onclick = () => QCore.speakChinese(v.hanzi, { slow: true });
        body.querySelector("#s12-speak-ex").onclick = () => QCore.speakChinese(ex.chinese);
        body.querySelector("#s12-next-2").onclick = () => {
          stepStage = 2;
          renderStep();
        };
      } else if (stepStage === 2) {
        body.innerHTML = `
          <div class="grid-2" style="margin-bottom:16px;">
            <div class="card-subtle" style="text-align:center;">
              <strong style="display:block;margin-bottom:8px;">9️⃣ Hướng dẫn viết từng nét chữ "${QCore.escapeHtml(firstChar)}"</strong>
              <div class="mizige-box" style="width:200px;height:200px;">
                <svg class="mizige-guides" viewBox="0 0 100 100">
                  <line x1="50" y1="0" x2="50" y2="100" stroke="var(--grid-guide)" stroke-dasharray="3,3"/>
                  <line x1="0" y1="50" x2="100" y2="50" stroke="var(--grid-guide)" stroke-dasharray="3,3"/>
                </svg>
                <div id="s12-anim-box" class="mizige-target"></div>
              </div>
              <button class="btn btn-soft btn-sm" style="margin-top:10px;" id="s12-replay-stroke">▶️ Phát lại từng nét</button>
            </div>

            <div class="card-subtle">
              <strong style="display:block;margin-bottom:8px;">🔟 Luyện phát âm theo giáo viên</strong>
              <p style="font-size:13px;color:var(--text-secondary);margin-top:0;">Nghe mẫu trước, sau đó bấm Thu âm giọng đọc của bạn cho từ <strong>${QCore.escapeHtml(v.hanzi)} (${QCore.escapeHtml(v.pinyin)})</strong>:</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
                <button class="btn btn-outline btn-sm" id="s12-model-voice">🔊 Nghe mẫu</button>
                <button class="btn btn-primary btn-sm" id="s12-rec-btn">🎙️ Thu âm 3.5 giây</button>
              </div>
              <div id="s12-rec-feedback" style="font-size:13px;color:var(--text-secondary);">
                ${recordedUrl ? `<audio controls src="${recordedUrl}" style="width:100%;height:36px;"></audio>` : "Chưa có bản ghi âm."}
              </div>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;">
            <button class="btn btn-outline" id="s12-back-1">← Quay lại</button>
            <button class="btn btn-primary" id="s12-next-3">Sang Bước 11: Tự tay viết chữ →</button>
          </div>
        `;

        if (window.HanziWriter) {
          stepWriter = HanziWriter.create("s12-anim-box", firstChar, {
            width: 200,
            height: 200,
            padding: 12,
            strokeColor: "#2d6a4f",
            radicalColor: "#d94343",
            strokeAnimationSpeed: 0.9,
            delayBetweenStrokes: 260,
            charDataLoader: (ch, onComplete) => {
              QCore.fetchStrokeData(ch).then((d) => d && onComplete(d));
            }
          });
          stepWriter.animateCharacter();
          body.querySelector("#s12-replay-stroke").onclick = () => stepWriter.animateCharacter();
        }

        body.querySelector("#s12-model-voice").onclick = () => QCore.speakChinese(v.hanzi);
        body.querySelector("#s12-rec-btn").onclick = () => {
          const fb = body.querySelector("#s12-rec-feedback");
          fb.textContent = "🔴 Đang lắng nghe giọng của bạn... Hãy đọc to: " + v.pinyin;
          QCore.captureLearnerVoice({
            durationMs: 3500,
            onAudioReady: (url, transcript) => {
              recordedUrl = url;
              const matchOk = transcript && transcript.includes(v.hanzi);
              fb.innerHTML = `
                <audio controls src="${url}" style="width:100%;height:36px;margin-bottom:6px;"></audio>
                <div>${
                  transcript
                    ? matchOk
                      ? `✅ Nhận diện giọng nói: "${QCore.escapeHtml(transcript)}" — Phát âm rất chuẩn!`
                      : `🎙️ Hệ thống nghe được: "${QCore.escapeHtml(transcript)}". Hãy bấm nghe lại băng thu so với âm mẫu nhé!`
                    : "🎧 Đã thu âm! Hãy bấm Play bên trên để tự đối chiếu độ cao thanh điệu với âm mẫu nhé."
                }</div>
              `;
            }
          });
        };

        body.querySelector("#s12-back-1").onclick = () => { stepStage = 1; renderStep(); };
        body.querySelector("#s12-next-3").onclick = () => { stepStage = 3; renderStep(); };
      } else if (stepStage === 3) {
        body.innerHTML = `
          <div style="text-align:center;margin-bottom:14px;">
            <strong>1️⃣1️⃣ Thực hành tự viết chữ "${QCore.escapeHtml(firstChar)}" trên ô vuông chuẩn</strong>
            <p style="font-size:13px;color:var(--text-secondary);margin:4px 0 12px;">Dùng chuột hoặc ngón tay tô đúng thứ tự từng nét của chữ <strong>${QCore.escapeHtml(firstChar)}</strong>:</p>
            <div class="mizige-box" style="width:230px;height:230px;">
              <svg class="mizige-guides" viewBox="0 0 100 100">
                <line x1="50" y1="0" x2="50" y2="100" stroke="var(--grid-guide)" stroke-dasharray="3,3"/>
                <line x1="0" y1="50" x2="100" y2="50" stroke="var(--grid-guide)" stroke-dasharray="3,3"/>
              </svg>
              <div id="s12-quiz-box" class="mizige-target"></div>
            </div>
            <div id="s12-quiz-status" style="margin-top:10px;font-weight:600;color:var(--primary);">Hãy viết nét đầu tiên!</div>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <button class="btn btn-outline" id="s12-back-2">← Quay lại</button>
            <button class="btn btn-primary" id="s12-next-4">Sang Bước 12: Kiểm tra ghi nhớ →</button>
          </div>
        `;

        if (window.HanziWriter) {
          const qWriter = HanziWriter.create("s12-quiz-box", firstChar, {
            width: 230,
            height: 230,
            padding: 14,
            showCharacter: false,
            showOutline: true,
            showHintAfterMisses: 2,
            highlightOnComplete: true,
            charDataLoader: (ch, onComplete) => {
              QCore.fetchStrokeData(ch).then((d) => d && onComplete(d));
            }
          });
          qWriter.quiz({
            onMistake: (strokeData) => {
              const stEl = body.querySelector("#s12-quiz-status");
              if (stEl) stEl.textContent = `⚠️ Nét thứ ${strokeData.strokeNum + 1} chưa đúng hướng/thứ tự — hãy thử lại nhé!`;
            },
            onComplete: (summary) => {
              const acc = Math.max(60, 100 - summary.totalMistakes * 10);
              QCore.recordHanziPractice(firstChar, acc);
              const stEl = body.querySelector("#s12-quiz-status");
              if (stEl) stEl.textContent = `🎉 Xuất sắc! Bạn đã viết hoàn chỉnh chữ ${firstChar} (Độ chính xác: ${acc}%)!`;
            }
          });
        }
        body.querySelector("#s12-back-2").onclick = () => { stepStage = 2; renderStep(); };
        body.querySelector("#s12-next-4").onclick = () => { stepStage = 4; renderStep(); };
      } else if (stepStage === 4) {
        const opts = pickDistractors(v, allVocab, 3);
        body.innerHTML = `
          <div style="text-align:center;">
            <strong>1️⃣2️⃣ Kiểm tra khả năng ghi nhớ trước khi sang từ tiếp theo</strong>
            <div class="hanzi-calligraphy" style="font-size:64px;margin:10px 0;">${QCore.escapeHtml(v.hanzi)}</div>
            <p style="margin:0 0 14px;color:var(--text-secondary);">Từ này phát âm và có nghĩa tiếng Việt là gì?</p>
            <div class="grid-2" style="margin-bottom:16px;">
              ${opts
                .map(
                  (o) => `
                <button class="btn btn-outline" style="padding:12px;" data-s12-ans="${o.id === v.id ? "1" : "0"}">
                  <strong>${QCore.escapeHtml(o.pinyin)}</strong> — ${QCore.escapeHtml(o.meanings.vietnamese[0])}
                </button>
              `
                )
                .join("")}
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
              msg.innerHTML = `
                <div class="card-subtle" style="border-color:var(--primary);">
                  <strong style="color:var(--primary);">🎉 Hoàn thành trọn vẹn 12 bước cho từ "${QCore.escapeHtml(v.hanzi)}"!</strong>
                  <div style="margin-top:10px;">
                    <button class="btn btn-primary" id="s12-go-next-word">Học từ tiếp theo →</button>
                  </div>
                </div>
              `;
              msg.querySelector("#s12-go-next-word").onclick = () => {
                wIdx = (wIdx + 1) % allVocab.length;
                stepStage = 1;
                recordedUrl = null;
                renderStep();
              };
            } else {
              msg.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);">Chưa chính xác rồi! Hãy thử chọn lại hoặc bấm về Bước 1 để xem lại nhé.</div>`;
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
