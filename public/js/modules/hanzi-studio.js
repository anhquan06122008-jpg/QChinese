/* -*- coding: utf-8 -*-
 * QChinese – Module 4: Deep Hanzi Character Studio (PHẦN 4.1, 4.2, 4.3)
 * Features:
 * - All 15 linguistic & structural character fields in Simplified Chinese (简体中文)
 * - Verified Make-Me-a-Hanzi SVG stroke animation with Play, Pause, Replay, Slow, Step-by-Step + Numbered Medians & Direction Arrows
 * - Progressive Red-Highlight Stroke Breakdown Strip (inspired by traditional character practice sheets)
 * - Dual Interactive Writing Board:
 *     (1) Guided/Blind Stroke-by-Stroke Validator (HanziWriter Quiz)
 *     (2) Freehand HTML5 Canvas Calligraphy Pad with 5-Criteria Geometric & Stroke-Order Evaluation
 */

window.QHanziStudio = (function () {
  let activeChar = "你";
  let practiceTab = "guided"; // "guided" | "freehand"
  let showGhostOutline = true;
  let animWriter = null;
  let quizWriter = null;
  let stepIndex = 0;
  let isPaused = false;
  let currentStrokeData = null;

  function transformMakeMeAHanziPoint(pt, boxSize = 280) {
    // Make Me a Hanzi coordinate system: x in [0..1024], y in [-124..900] flipped vertically (y_svg = 900 - y)
    const scale = boxSize / 1024;
    return {
      x: pt[0] * scale,
      y: (900 - pt[1]) * scale
    };
  }

  function buildStepStripSVG(strokeData, upToIndex) {
    const strokes = strokeData.strokes || [];
    const radStrokes = strokeData.radStrokes || [];
    const paths = strokes
      .map((d, idx) => {
        let fill = "rgba(140,155,145,0.18)";
        if (idx < upToIndex) {
          fill = radStrokes.includes(idx) ? "#2d6a4f" : "#1e2923";
        } else if (idx === upToIndex) {
          fill = "#d94343"; // Vermilion highlight for the current stroke!
        }
        return `<path d="${d}" fill="${fill}"></path>`;
      })
      .join("");

    return `
      <svg class="stroke-step-svg" viewBox="0 0 1024 1024">
        <line x1="512" y1="0" x2="512" y2="1024" stroke="var(--grid-line)" stroke-width="14" stroke-dasharray="28,28"/>
        <line x1="0" y1="512" x2="1024" y2="512" stroke="var(--grid-line)" stroke-width="14" stroke-dasharray="28,28"/>
        <g transform="scale(1, -1) translate(0, -900)">
          ${paths}
        </g>
      </svg>
    `;
  }

  function buildDirectionOverlaySVG(strokeData, highlightIdx = null) {
    if (!strokeData || !Array.isArray(strokeData.medians)) return "";
    const items = [];
    strokeData.medians.forEach((med, idx) => {
      if (highlightIdx !== null && idx !== highlightIdx) return;
      if (!med || med.length < 2) return;
      const start = transformMakeMeAHanziPoint(med[0], 280);
      const end = transformMakeMeAHanziPoint(med[med.length - 1], 280);
      const pts = med.map((p) => {
        const tp = transformMakeMeAHanziPoint(p, 280);
        return `${tp.x.toFixed(1)},${tp.y.toFixed(1)}`;
      });

      // Arrowhead at end
      const prev = transformMakeMeAHanziPoint(med[med.length - 2], 280);
      const angle = Math.atan2(end.y - prev.y, end.x - prev.x);
      const aLen = 7;
      const ax1 = end.x - aLen * Math.cos(angle - Math.PI / 6);
      const ay1 = end.y - aLen * Math.sin(angle - Math.PI / 6);
      const ax2 = end.x - aLen * Math.cos(angle + Math.PI / 6);
      const ay2 = end.y - aLen * Math.sin(angle + Math.PI / 6);

      items.push(`
        <polyline points="${pts.join(" ")}" fill="none" stroke="#d94343" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <polygon points="${end.x.toFixed(1)},${end.y.toFixed(1)} ${ax1.toFixed(1)},${ay1.toFixed(1)} ${ax2.toFixed(1)},${ay2.toFixed(1)}" fill="#d94343"/>
        <circle cx="${start.x.toFixed(1)}" cy="${start.y.toFixed(1)}" r="8.5" fill="#d94343"/>
        <text x="${start.x.toFixed(1)}" y="${(start.y + 3.5).toFixed(1)}" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">${idx + 1}</text>
      `);
    });
    return items.join("");
  }

  async function renderHanzi(container, params = {}) {
    if (params && params.char) {
      activeChar = String(params.char).trim().charAt(0) || "你";
    }

    const st = QCore.getState();
    const detail = QCore.resolveHanziDetail(activeChar);
    const charList = window.QCHINESE_HANZI_LIST || [];
    const prog = st.hanziProgress[activeChar] || { attempts: 0, bestScore: 0, memorized: false };

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>✍️ Hệ Thống Học Chữ Hán Chuyên Sâu (Giản Thể 简体)</h2>
          <p>Nhìn – Nghe – Hiểu bộ thủ – Xem hoạt ảnh từng nét – Thực hành viết trực tiếp và nhận chấm điểm chi tiết.</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <input class="input-field hanzi-text" id="hz-custom-input" data-pinyin-ime="true" placeholder="Gõ Pinyin (vd: ai, jia, xue) hoặc nhập 1 chữ Hán..." style="width:270px;padding:8px 12px;">
          <button class="btn btn-primary btn-sm" id="hz-load-btn">Mở chữ này</button>
        </div>
      </div>

      <!-- Quick Core Character Selector Strip -->
      <div class="card" style="padding:14px 18px;margin-bottom:20px;">
        <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:8px;">Chọn nhanh chữ Hán HSK nền tảng để học chi tiết & luyện viết:</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${charList
            .map((item) => {
              const done = st.hanziProgress[item.hanzi] && st.hanziProgress[item.hanzi].memorized;
              return `
                <button class="btn ${item.hanzi === activeChar ? "btn-primary" : done ? "btn-soft" : "btn-outline"} btn-sm" data-pick-hz="${QCore.escapeHtml(item.hanzi)}" style="min-width:58px;flex-direction:column;gap:1px;padding:6px 10px;">
                  <span class="hanzi-calligraphy" style="font-size:22px;line-height:1.1;">${QCore.escapeHtml(item.hanzi)}</span>
                  <span style="font-size:11px;opacity:0.88;">${QCore.escapeHtml(item.pinyin)}</span>
                </button>
              `;
            })
            .join("")}
        </div>
      </div>

      <!-- 4.1. Character Detail Hero & 15 Information Fields -->
      <div class="grid-2" style="margin-bottom:20px;">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="badge badge-jade">Từ vựng đang học · HSK ${detail.hsk_level}</span>
              <span class="badge" id="hz-stroke-badge">${detail.stroke_count ? `${detail.stroke_count} nét` : "Đang tải số nét..."}</span>
              ${prog.memorized ? `<span class="badge badge-jade">✓ Đã ghi nhớ (${prog.bestScore}%)</span>` : ""}
            </div>
            <button class="btn btn-outline btn-sm" id="hz-save-notebook">📒 Lưu chữ khó vào Sổ tay</button>
          </div>

          <div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin-bottom:14px;">
            <div class="hanzi-calligraphy" style="font-size:92px;line-height:1.05;padding:8px 18px;border-radius:20px;background:var(--bg-subtle);border:1.5px solid var(--border-strong);">
              ${QCore.escapeHtml(detail.hanzi)}
            </div>
            <div style="flex:1;min-width:200px;">
              <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
                <span class="pinyin-text" style="font-size:30px;font-weight:800;color:var(--primary);">${QCore.escapeHtml(detail.pinyin)}</span>
                ${detail.pinyin_number ? `<span class="badge">Pinyin số: ${QCore.escapeHtml(detail.pinyin_number)}</span>` : ""}
              </div>
              <div style="font-size:15px;font-weight:700;margin:4px 0;">${QCore.escapeHtml(detail.meanings.vietnamese)} · <span style="color:var(--text-secondary);font-weight:500;">${QCore.escapeHtml(detail.meanings.english)}</span></div>
              <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px;">Từ loại: ${QCore.escapeHtml(detail.part_of_speech)}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="btn btn-primary btn-sm" id="hz-btn-audio">🔊 Phát âm chuẩn</button>
                <button class="btn btn-outline btn-sm" id="hz-btn-slow">🐢 Phát âm chậm</button>
              </div>
            </div>
          </div>

          ${
            st.profile.showVietnameseHint !== false
              ? `
            <div class="vi-hint-banner" style="margin-bottom:14px;">
              <span>📌</span>
              <div>
                <strong>Phiên âm hỗ trợ người Việt:</strong> ${QCore.escapeHtml(detail.vietnamese_hint)}<br>
                <small style="color:var(--text-secondary);">Quy định sư phạm: Phiên âm tiếng Việt chỉ là công cụ gợi nhớ ban đầu, không tương đương hoàn toàn với âm chuẩn tiếng Trung. Hãy luôn ưu tiên nghe audio và nhìn Pinyin!</small>
              </div>
            </div>
          `
              : ""
          }

          <!-- Trilingual Meaning Table -->
          <h4 style="margin:0 0 8px;font-size:14.5px;">🌐 Nghĩa trong ba ngôn ngữ</h4>
          <table class="tri-table" style="margin-bottom:14px;">
            <tr>
              <th>🇨🇳 Trung</th>
              <td class="hanzi-text"><strong>${QCore.escapeHtml(detail.hanzi)}</strong> – ${QCore.escapeHtml(detail.meanings.chinese)}</td>
            </tr>
            <tr>
              <th>🇬🇧 Anh</th>
              <td>${QCore.escapeHtml(detail.meanings.english)}</td>
            </tr>
            <tr>
              <th>🇻🇳 Việt</th>
              <td><strong>${QCore.escapeHtml(detail.meanings.vietnamese)}</strong></td>
            </tr>
          </table>

          <!-- Radical & Structure -->
          <div class="card-subtle" style="margin-bottom:12px;">
            <div style="font-size:13.5px;margin-bottom:4px;">🧩 <strong>Bộ thủ:</strong> ${QCore.escapeHtml(detail.radical)}</div>
            <div style="font-size:13.5px;">🏗️ <strong>Cấu tạo chữ:</strong> ${QCore.escapeHtml(detail.decomposition)}</div>
          </div>

          <!-- Common Mistakes -->
          <div class="card-subtle" style="border-left:3px solid var(--accent-red);margin-bottom:12px;">
            <strong style="font-size:13.5px;color:var(--accent-red);">⚠️ Những lỗi người học thường mắc:</strong>
            <p style="margin:4px 0 0;font-size:13px;">${QCore.escapeHtml(detail.common_mistakes)}</p>
          </div>

          <!-- Compound Words & Examples -->
          ${
            detail.compounds && detail.compounds.length
              ? `
            <h4 style="margin:0 0 8px;font-size:14.5px;">🔗 Các từ ghép liên quan</h4>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
              ${detail.compounds
                .map(
                  (c) => `
                <button class="btn btn-outline btn-sm" data-speak-word="${QCore.escapeHtml(c.word)}">
                  <strong class="hanzi-text" style="font-size:16px;">${QCore.escapeHtml(c.word)}</strong>
                  <span style="color:var(--primary);">${QCore.escapeHtml(c.pinyin)}</span>
                  <span style="color:var(--text-secondary);">· ${QCore.escapeHtml(c.vi)}</span>
                  <span>🔊</span>
                </button>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }

          <h4 style="margin:0 0 8px;font-size:14.5px;">💬 Ví dụ sử dụng thực tế</h4>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${(detail.examples || [])
              .map(
                (ex) => `
              <div class="card-subtle" style="padding:10px 12px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <div>
                  <div class="hanzi-text" style="font-weight:700;font-size:16px;">${QCore.escapeHtml(ex.chinese)} <span class="pinyin-text" style="color:var(--primary);font-weight:500;font-size:13.5px;">– ${QCore.escapeHtml(ex.pinyin)}</span></div>
                  <div style="font-size:13px;color:var(--text-secondary);">${QCore.escapeHtml(ex.english)} – <strong>${QCore.escapeHtml(ex.vietnamese)}</strong></div>
                </div>
                <button class="btn btn-soft btn-sm" data-speak-word="${QCore.escapeHtml(ex.chinese)}">🔊</button>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- RIGHT COLUMN: 4.2 Stroke Order Animation + 4.3 Interactive Handwriting Practice -->
        <div style="display:flex;flex-direction:column;gap:18px;">
          <!-- 4.2. Stroke Animation Player -->
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
              <div>
                <h3 style="margin:0;font-size:17px;">🎬 4.2. Hoạt ảnh hướng dẫn viết từng nét</h3>
                <small style="color:var(--text-muted);">Dữ liệu bút thuận chuẩn xác từ Make Me a Hanzi (màu xanh ngọc = bộ thủ)</small>
              </div>
              <label style="font-size:12.5px;display:inline-flex;align-items:center;gap:5px;cursor:pointer;">
                <input type="checkbox" id="hz-toggle-arrows" checked> Hiện số nét & hướng bút
              </label>
            </div>

            <div class="mizige-box" id="hz-anim-wrapper">
              <svg class="mizige-guides" viewBox="0 0 280 280">
                <line x1="140" y1="0" x2="140" y2="280" stroke="var(--grid-guide)" stroke-width="1.2" stroke-dasharray="5,5"/>
                <line x1="0" y1="140" x2="280" y2="140" stroke="var(--grid-guide)" stroke-width="1.2" stroke-dasharray="5,5"/>
                <line x1="0" y1="0" x2="280" y2="280" stroke="var(--grid-line)" stroke-width="1" stroke-dasharray="6,6"/>
                <line x1="280" y1="0" x2="0" y2="280" stroke="var(--grid-line)" stroke-width="1" stroke-dasharray="6,6"/>
                <g id="hz-direction-layer"></g>
              </svg>
              <div id="hz-anim-target" class="mizige-target"></div>
            </div>

            <div id="hz-step-caption" style="text-align:center;font-size:13.5px;font-weight:600;color:var(--primary);margin:10px 0;">
              Đang tải dữ liệu nét chuẩn...
            </div>

            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <button class="btn btn-primary btn-sm" id="hz-ctl-play">▶️ Phát quy trình</button>
              <button class="btn btn-outline btn-sm" id="hz-ctl-pause">⏸️ Tạm dừng</button>
              <button class="btn btn-outline btn-sm" id="hz-ctl-replay">🔁 Phát lại</button>
              <button class="btn btn-outline btn-sm" id="hz-ctl-slow">🐢 Xem chậm</button>
              <button class="btn btn-soft btn-sm" id="hz-ctl-step">⏭️ Xem từng nét</button>
            </div>

            <!-- Progressive Red-Stroke Breakdown Strip (like Image 3!) -->
            <div>
              <strong style="font-size:13px;color:var(--text-secondary);">📏 Bảng phân tách thứ tự từng nét (nét màu đỏ là nét đang viết):</strong>
              <div class="stroke-strip" id="hz-stroke-strip"></div>
            </div>
          </div>

          <!-- 4.3. Direct Interactive Writing Practice Area -->
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
              <div>
                <h3 style="margin:0;font-size:17px;">✍️ 4.3. Khu vực thực hành tự viết chữ "${QCore.escapeHtml(detail.hanzi)}"</h3>
                <small style="color:var(--text-muted);">Hỗ trợ chuột máy tính, ngón tay điện thoại và bút cảm ứng</small>
              </div>
              <div class="tabs-bar">
                <button class="tab-pill ${practiceTab === "guided" ? "active" : ""}" data-ptab="guided">Theo từng nét chuẩn</button>
                <button class="tab-pill ${practiceTab === "freehand" ? "active" : ""}" data-ptab="freehand">Viết tự do & Chấm 5 tiêu chí</button>
              </div>
            </div>

            <div id="hz-practice-stage"></div>
          </div>
        </div>
      </div>
    `;

    // Bind audio & navigation events
    container.querySelector("#hz-btn-audio").onclick = () => QCore.speakChinese(detail.hanzi);
    container.querySelector("#hz-btn-slow").onclick = () => QCore.speakChinese(detail.hanzi, { slow: true });
    container.querySelectorAll("[data-speak-word]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak-word"));
    });
    container.querySelector("#hz-save-notebook").onclick = () => {
      QCore.addToNotebook({
        category: "hard_hanzi",
        hanzi: detail.hanzi,
        pinyin: detail.pinyin,
        english: detail.meanings.english,
        vietnamese: detail.meanings.vietnamese,
        example: detail.examples && detail.examples[0] ? detail.examples[0].chinese : "",
        note: detail.common_mistakes
      });
    };

    container.querySelectorAll("[data-pick-hz]").forEach((btn) => {
      btn.onclick = () => {
        activeChar = btn.getAttribute("data-pick-hz");
        renderHanzi(container);
      };
    });

    container.querySelector("#hz-load-btn").onclick = () => {
      const raw = container.querySelector("#hz-custom-input").value.trim();
      const m = raw.match(/[\u3400-\u9fff]/);
      if (!m) {
        QCore.showToast("Hãy chọn chữ Hán từ thanh gợi ý Pinyin hoặc nhập ít nhất 1 chữ Hán Giản thể nhé!");
        return;
      }
      activeChar = m[0];
      renderHanzi(container);
    };

    container.querySelectorAll("[data-ptab]").forEach((b) => {
      b.onclick = () => {
        practiceTab = b.getAttribute("data-ptab");
        setupPracticeBoard(container, detail);
      };
    });

    // Load verified Make-Me-a-Hanzi stroke data
    currentStrokeData = await QCore.fetchStrokeData(detail.hanzi);
    const captionEl = container.querySelector("#hz-step-caption");
    const badgeEl = container.querySelector("#hz-stroke-badge");
    const stripEl = container.querySelector("#hz-stroke-strip");
    const dirLayer = container.querySelector("#hz-direction-layer");
    const toggleArrows = container.querySelector("#hz-toggle-arrows");

    if (!currentStrokeData) {
      captionEl.textContent = "Không tải được dữ liệu nét cho ký tự này.";
      return;
    }

    const totalStrokes = currentStrokeData.strokes.length;
    badgeEl.textContent = `${totalStrokes} nét chuẩn`;
    stepIndex = 0;
    isPaused = false;

    const refreshArrows = (onlyIdx = null) => {
      if (!dirLayer) return;
      dirLayer.innerHTML = toggleArrows.checked ? buildDirectionOverlaySVG(currentStrokeData, onlyIdx) : "";
    };
    refreshArrows(null);
    toggleArrows.onchange = () => refreshArrows(null);

    // Render progressive stroke breakdown strip (Image 3 style!)
    stripEl.innerHTML = currentStrokeData.strokes
      .map(
        (_, i) => `
      <div class="stroke-step-cell" data-step-cell="${i}" title="Bấm xem nét số ${i + 1}">
        <div class="stroke-step-head">Nét ${i + 1}/${totalStrokes}</div>
        ${buildStepStripSVG(currentStrokeData, i)}
      </div>
    `
      )
      .join("");

    // Initialize HanziWriter Animation Player
    if (window.HanziWriter) {
      const makeWriter = (speed = 0.95) => {
        const target = container.querySelector("#hz-anim-target");
        target.innerHTML = "";
        return HanziWriter.create("hz-anim-target", detail.hanzi, {
          width: 280,
          height: 280,
          padding: 16,
          strokeColor: document.documentElement.getAttribute("data-theme") === "dark" ? "#edf4ef" : "#1e2923",
          radicalColor: "#2d6a4f",
          outlineColor: "rgba(130, 148, 138, 0.24)",
          showOutline: true,
          strokeAnimationSpeed: speed,
          delayBetweenStrokes: speed < 0.6 ? 520 : 260,
          charDataLoader: (_, onComplete) => onComplete(currentStrokeData)
        });
      };

      animWriter = makeWriter(0.95);
      captionEl.textContent = `Chữ "${detail.hanzi}" gồm ${totalStrokes} nét. Bấm Phát quy trình hoặc Xem từng nét!`;

      const playFull = (slow = false) => {
        animWriter = makeWriter(slow ? 0.35 : 0.95);
        isPaused = false;
        container.querySelector("#hz-ctl-pause").textContent = "⏸️ Tạm dừng";
        refreshArrows(null);
        captionEl.textContent = slow
          ? `🐢 Đang phát chậm từng nét của chữ "${detail.hanzi}" (0.35x)...`
          : `▶️ Đang mô phỏng thứ tự ${totalStrokes} nét của chữ "${detail.hanzi}"...`;
        animWriter.hideCharacter();
        animWriter.animateCharacter({
          onComplete: () => {
            captionEl.textContent = `✅ Hoàn thiện ${totalStrokes} nét chữ "${detail.hanzi}"! Bây giờ bạn hãy tự viết ở khung bên dưới nhé.`;
          }
        });
      };

      container.querySelector("#hz-ctl-play").onclick = () => playFull(false);
      container.querySelector("#hz-ctl-replay").onclick = () => playFull(false);
      container.querySelector("#hz-ctl-slow").onclick = () => playFull(true);

      container.querySelector("#hz-ctl-pause").onclick = () => {
        if (!animWriter) return;
        if (!isPaused) {
          animWriter.pauseAnimation();
          isPaused = true;
          container.querySelector("#hz-ctl-pause").textContent = "▶️ Tiếp tục";
          captionEl.textContent = "⏸️ Đã tạm dừng hoạt ảnh.";
        } else {
          animWriter.resumeAnimation();
          isPaused = false;
          container.querySelector("#hz-ctl-pause").textContent = "⏸️ Tạm dừng";
          captionEl.textContent = "▶️ Đang tiếp tục phát hoạt ảnh...";
        }
      };

      const showSingleStep = (idx) => {
        stepIndex = idx;
        stripEl.querySelectorAll(".stroke-step-cell").forEach((c, ci) => c.classList.toggle("active", ci === idx));
        refreshArrows(idx);
        const guideName =
          detail.stroke_names && detail.stroke_names[idx]
            ? detail.stroke_names[idx]
            : `Nét số ${idx + 1} / ${totalStrokes}: bắt đầu từ chấm tròn số ${idx + 1} kéo theo hướng mũi tên đỏ.`;
        captionEl.textContent = guideName;
        if (animWriter) {
          animWriter.hideCharacter();
          // Reveal strokes 0..idx-1 and animate stroke idx
          for (let k = 0; k < idx; k++) {
            // Use SVG path visibility via animateStroke chain
          }
          animWriter.animateStroke(idx);
        }
      };

      container.querySelector("#hz-ctl-step").onclick = () => {
        showSingleStep(stepIndex);
        stepIndex = (stepIndex + 1) % totalStrokes;
      };

      stripEl.querySelectorAll("[data-step-cell]").forEach((cell) => {
        cell.onclick = () => {
          const i = Number(cell.getAttribute("data-step-cell"));
          showSingleStep(i);
          stepIndex = (i + 1) % totalStrokes;
        };
      });
    }

    setupPracticeBoard(container, detail);
  }

  function setupPracticeBoard(container, detail) {
    const stage = container.querySelector("#hz-practice-stage");
    if (!stage || !currentStrokeData) return;

    if (practiceTab === "guided") {
      stage.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <label style="font-size:13px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="checkbox" id="quiz-ghost-chk" ${showGhostOutline ? "checked" : ""}>
            Hiện chữ mẫu mờ để viết đè (bỏ chọn để luyện "Nhớ rồi tự viết")
          </label>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm" id="quiz-reset-btn">🔄 Xóa / Viết lại</button>
            <button class="btn btn-soft btn-sm" id="quiz-hint-btn">💡 Xem gợi ý nét</button>
            <button class="btn btn-outline btn-sm" id="quiz-ans-btn">👁️ Xem đáp án</button>
          </div>
        </div>

        <div class="mizige-box">
          <svg class="mizige-guides" viewBox="0 0 280 280">
            <line x1="140" y1="0" x2="140" y2="280" stroke="var(--grid-guide)" stroke-width="1.2" stroke-dasharray="5,5"/>
            <line x1="0" y1="140" x2="280" y2="140" stroke="var(--grid-guide)" stroke-width="1.2" stroke-dasharray="5,5"/>
            <line x1="0" y1="0" x2="280" y2="280" stroke="var(--grid-line)" stroke-width="1" stroke-dasharray="6,6"/>
            <line x1="280" y1="0" x2="0" y2="280" stroke="var(--grid-line)" stroke-width="1" stroke-dasharray="6,6"/>
          </svg>
          <div id="hz-quiz-target" class="mizige-target"></div>
        </div>

        <div class="card-subtle" id="hz-quiz-feedback" style="margin-top:12px;text-align:center;font-size:13.5px;">
          ✏️ Hãy dùng chuột hoặc ngón tay viết <strong>Nét 1</strong> của chữ <strong>${QCore.escapeHtml(detail.hanzi)}</strong>!
        </div>
      `;

      const startGuidedQuiz = () => {
        const target = stage.querySelector("#hz-quiz-target");
        target.innerHTML = "";
        const fb = stage.querySelector("#hz-quiz-feedback");
        let currentStrokeIdx = 0;

        quizWriter = HanziWriter.create("hz-quiz-target", detail.hanzi, {
          width: 280,
          height: 280,
          padding: 16,
          showCharacter: false,
          showOutline: showGhostOutline,
          strokeColor: "#2d6a4f",
          drawingColor: "#d94343",
          drawingWidth: 22,
          showHintAfterMisses: 2,
          highlightOnComplete: true,
          charDataLoader: (_, onComplete) => onComplete(currentStrokeData)
        });

        quizWriter.quiz({
          onCorrectStroke: (data) => {
            currentStrokeIdx = data.strokeNum + 1;
            const total = currentStrokeData.strokes.length;
            if (currentStrokeIdx < total) {
              fb.innerHTML = `✅ Nét ${data.strokeNum + 1} rất chuẩn! Tiếp tục viết <strong>Nét ${currentStrokeIdx + 1}/${total}</strong> nhé.`;
            }
          },
          onMistake: (data) => {
            const sName =
              detail.stroke_names && detail.stroke_names[data.strokeNum]
                ? detail.stroke_names[data.strokeNum]
                : `Nét số ${data.strokeNum + 1}`;
            fb.innerHTML = `<span style="color:var(--accent-red);font-weight:600;">⚠️ Viết lệch thứ tự hoặc hướng ở ${QCore.escapeHtml(sName)}!</span><br><small>Hướng dẫn sửa: Chú ý điểm bắt đầu và kéo đúng hướng từ trên xuống / từ trái sang phải (sai 2 lần hệ thống sẽ nhấp nháy nét mẫu cho bạn).</small>`;
          },
          onComplete: (summary) => {
            const total = currentStrokeData.strokes.length;
            const penalty = summary.totalMistakes * Math.round(70 / Math.max(3, total));
            const score = Math.max(45, 100 - penalty + (showGhostOutline ? 0 : 5));
            const cappedScore = Math.min(100, score);
            QCore.recordHanziPractice(detail.hanzi, cappedScore);
            QCore.speakChinese(detail.hanzi);
            fb.innerHTML = `
              <div style="color:var(--primary);font-weight:700;font-size:15px;">🎉 Hoàn thành chữ "${QCore.escapeHtml(detail.hanzi)}"! Điểm chính xác thứ tự & vị trí nét: ${cappedScore}/100</div>
              <div style="font-size:12.5px;color:var(--text-secondary);margin-top:4px;">Tổng số lần lệch nét: ${summary.totalMistakes} · Chế độ: ${showGhostOutline ? "Có chữ mẫu mờ" : "Tự nhớ không nhìn mẫu"}</div>
            `;
          }
        });

        stage.querySelector("#quiz-hint-btn").onclick = () => {
          quizWriter.highlightStroke(currentStrokeIdx);
        };
        stage.querySelector("#quiz-ans-btn").onclick = () => {
          quizWriter.showCharacter();
          fb.innerHTML = `👁️ Đang hiển thị đáp án chữ mẫu. Bấm <strong>Xóa / Viết lại</strong> để tự thực hành lại từ đầu nhé!`;
        };
      };

      stage.querySelector("#quiz-ghost-chk").onchange = (e) => {
        showGhostOutline = e.target.checked;
        startGuidedQuiz();
      };
      stage.querySelector("#quiz-reset-btn").onclick = startGuidedQuiz;
      startGuidedQuiz();
    } else {
      // Freehand HTML5 Canvas Calligraphy Board + 5-Criteria Geometric & Order Evaluator
      stage.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <label style="font-size:13px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
            <input type="checkbox" id="fh-ghost-chk" ${showGhostOutline ? "checked" : ""}>
            Hiện chữ mẫu mờ bên dưới
          </label>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" id="fh-undo">↩️ Xóa nét vừa viết</button>
            <button class="btn btn-outline btn-sm" id="fh-clear">🗑️ Viết lại</button>
            <button class="btn btn-outline btn-sm" id="fh-show-ans">👁️ Xem đáp án</button>
            <button class="btn btn-primary btn-sm" id="fh-grade">✅ Kiểm tra kết quả</button>
          </div>
        </div>

        <div class="mizige-box" style="width:280px;height:280px;">
          <svg class="mizige-guides" viewBox="0 0 1024 1024" id="fh-bg-svg">
            <line x1="512" y1="0" x2="512" y2="1024" stroke="var(--grid-guide)" stroke-width="8" stroke-dasharray="22,22"/>
            <line x1="0" y1="512" x2="1024" y2="512" stroke="var(--grid-guide)" stroke-width="8" stroke-dasharray="22,22"/>
            <line x1="0" y1="0" x2="1024" y2="1024" stroke="var(--grid-line)" stroke-width="6" stroke-dasharray="24,24"/>
            <line x1="1024" y1="0" x2="0" y2="1024" stroke="var(--grid-line)" stroke-width="6" stroke-dasharray="24,24"/>
            <g id="fh-ghost-group" transform="scale(1, -1) translate(0, -900)" style="opacity:${showGhostOutline ? "0.18" : "0"};">
              ${currentStrokeData.strokes.map((d) => `<path d="${d}" fill="#2d6a4f"></path>`).join("")}
            </g>
          </svg>
          <canvas id="fh-canvas" width="280" height="280" style="position:relative;z-index:3;cursor:crosshair;touch-action:none;"></canvas>
        </div>

        <div id="fh-eval-box" style="margin-top:12px;">
          <div class="card-subtle" style="font-size:12.5px;color:var(--text-secondary);">
            ℹ️ <strong>Chế độ viết tự do:</strong> Hãy tự viết đầy đủ các nét của chữ <strong>${QCore.escapeHtml(detail.hanzi)}</strong> rồi bấm <strong>Kiểm tra kết quả</strong>. Hệ thống sẽ đối chiếu tọa độ vector các nét bạn vẽ với dữ liệu chuẩn Make Me a Hanzi theo 5 tiêu chí (lưu ý: đây là đánh giá hình học tham khảo trên nét vẽ tay, không thay thế giám khảo thư pháp).
          </div>
        </div>
      `;

      const canvas = stage.querySelector("#fh-canvas");
      const ctx = canvas.getContext("2d");
      const ghostGroup = stage.querySelector("#fh-ghost-group");
      let userStrokes = [];
      let drawing = false;
      let currPts = [];

      function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 10;
        ctx.strokeStyle = document.documentElement.getAttribute("data-theme") === "dark" ? "#52b788" : "#1b2a22";

        userStrokes.forEach((stroke) => {
          if (stroke.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(stroke[0].x, stroke[0].y);
          for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
          ctx.stroke();
        });
      }

      function getPos(e) {
        const r = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: ((clientX - r.left) / r.width) * 280,
          y: ((clientY - r.top) / r.height) * 280
        };
      }

      canvas.addEventListener("pointerdown", (e) => {
        drawing = true;
        currPts = [getPos(e)];
        canvas.setPointerCapture(e.pointerId);
      });
      canvas.addEventListener("pointermove", (e) => {
        if (!drawing) return;
        const p = getPos(e);
        currPts.push(p);
        redrawCanvas();
        if (currPts.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(currPts[0].x, currPts[0].y);
          for (let i = 1; i < currPts.length; i++) ctx.lineTo(currPts[i].x, currPts[i].y);
          ctx.stroke();
        }
      });
      const finishStroke = () => {
        if (!drawing) return;
        drawing = false;
        if (currPts.length >= 2) {
          const dx = currPts[currPts.length - 1].x - currPts[0].x;
          const dy = currPts[currPts.length - 1].y - currPts[0].y;
          if (Math.hypot(dx, dy) > 4) userStrokes.push(currPts);
        }
        currPts = [];
        redrawCanvas();
      };
      canvas.addEventListener("pointerup", finishStroke);
      canvas.addEventListener("pointercancel", finishStroke);

      stage.querySelector("#fh-ghost-chk").onchange = (e) => {
        showGhostOutline = e.target.checked;
        ghostGroup.style.opacity = showGhostOutline ? "0.18" : "0";
      };
      stage.querySelector("#fh-undo").onclick = () => {
        userStrokes.pop();
        redrawCanvas();
      };
      stage.querySelector("#fh-clear").onclick = () => {
        userStrokes = [];
        redrawCanvas();
      };
      stage.querySelector("#fh-show-ans").onclick = () => {
        ghostGroup.style.opacity = "0.75";
        setTimeout(() => {
          ghostGroup.style.opacity = showGhostOutline ? "0.18" : "0";
        }, 2200);
      };

      stage.querySelector("#fh-grade").onclick = () => {
        const evalBox = stage.querySelector("#fh-eval-box");
        if (!userStrokes.length) {
          QCore.showToast("Bạn chưa viết nét nào trên bảng! Hãy viết chữ trước khi chấm nhé.");
          return;
        }

        const expectedMedians = currentStrokeData.medians.map((m) =>
          m.map((pt) => transformMakeMeAHanziPoint(pt, 280))
        );
        const expCount = expectedMedians.length;
        const usrCount = userStrokes.length;

        // 1. Stroke Count & Order Score
        const countDiff = Math.abs(usrCount - expCount);
        let orderScore = Math.max(20, 100 - countDiff * 24);
        const compareN = Math.min(usrCount, expCount);

        let posDistSum = 0;
        let dirMatchSum = 0;
        const wrongStrokes = [];

        for (let i = 0; i < compareN; i++) {
          const u = userStrokes[i];
          const e = expectedMedians[i];
          const uStart = u[0], uEnd = u[u.length - 1];
          const eStart = e[0], eEnd = e[e.length - 1];

          const dStart = Math.hypot(uStart.x - eStart.x, uStart.y - eStart.y);
          const dEnd = Math.hypot(uEnd.x - eEnd.x, uEnd.y - eEnd.y);
          const avgDist = (dStart + dEnd) / 2;
          posDistSum += avgDist;

          const uAngle = Math.atan2(uEnd.y - uStart.y, uEnd.x - uStart.x);
          const eAngle = Math.atan2(eEnd.y - eStart.y, eEnd.x - eStart.x);
          let angleDiff = Math.abs(uAngle - eAngle);
          if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
          const dirScore = Math.max(0, 100 - (angleDiff / Math.PI) * 140);
          dirMatchSum += dirScore;

          if (avgDist > 58 || dirScore < 55) {
            wrongStrokes.push(i + 1);
          }
        }

        const posScore = Math.round(Math.max(15, 100 - (posDistSum / Math.max(1, compareN)) * 1.15));
        const shapeDirScore = Math.round(dirMatchSum / Math.max(1, compareN));
        orderScore = Math.round((orderScore + shapeDirScore) / 2);

        // Bounding-box proportion & centering check
        const allUserPts = userStrokes.flat();
        const allExpPts = expectedMedians.flat();
        const bbox = (pts) => {
          const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
          const minX = Math.min(...xs), maxX = Math.max(...xs);
          const minY = Math.min(...ys), maxY = Math.max(...ys);
          return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: Math.max(10, maxX - minX), h: Math.max(10, maxY - minY) };
        };
        const ub = bbox(allUserPts), eb = bbox(allExpPts);
        const centerShift = Math.hypot(ub.cx - eb.cx, ub.cy - eb.cy);
        const scaleDiff = Math.abs(ub.w / eb.w - 1) + Math.abs(ub.h / eb.h - 1);
        const layoutScore = Math.round(Math.max(20, 100 - centerShift * 0.9 - scaleDiff * 35));

        // Never give 100% absolute perfection in freehand heuristic mode (honest engineering per Section 4.3!)
        const rawOverall = Math.round(orderScore * 0.28 + shapeDirScore * 0.24 + posScore * 0.24 + layoutScore * 0.24);
        const overall = Math.min(96, Math.max(18, rawOverall));

        QCore.recordHanziPractice(detail.hanzi, overall);

        const adviceList = [];
        if (usrCount !== expCount) {
          adviceList.push(`Bạn viết <strong>${usrCount} nét</strong> trong khi chữ "${detail.hanzi}" chuẩn có <strong>${expCount} nét</strong> (${usrCount < expCount ? "bị thiếu hoặc nối gộp nét" : "bị thừa nét"}).`);
        }
        if (wrongStrokes.length) {
          adviceList.push(`Các nét số <strong>${wrongStrokes.join(", ")}</strong> đang lệch vị trí điểm đặt bút hoặc ngược hướng kéo bút. Hãy đối chiếu với ô phân tách nét màu đỏ phía trên.`);
        }
        if (centerShift > 28) {
          adviceList.push("Chữ hơi lệch khỏi tâm giao điểm chữ thập của ô vuông 米字格 — hãy căn trọng tâm chữ vào giữa ô.");
        }
        if (!adviceList.length) {
          adviceList.push("Thứ tự nét, hướng đi của bút và tỷ lệ bố cục trong ô vuông rất cân đối!");
        }

        evalBox.innerHTML = `
          <div class="card-subtle" style="border-left:4px solid ${overall >= 75 ? "var(--primary)" : "var(--accent-amber)"};">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <strong style="font-size:15px;">📊 Đánh giá tham khảo chữ viết tay: ${overall}/100 điểm</strong>
              <span class="badge ${overall >= 75 ? "badge-jade" : "badge-amber"}">${overall >= 75 ? "Đạt yêu cầu" : "Cần chỉnh nét"}</span>
            </div>
            <div class="grid-2" style="gap:6px;font-size:12.5px;margin-bottom:8px;">
              <div>• Thứ tự & số nét (${usrCount}/${expCount}): <strong>${orderScore}%</strong></div>
              <div>• Hướng & hình dạng nét: <strong>${shapeDirScore}%</strong></div>
              <div>• Vị trí các nét: <strong>${posScore}%</strong></div>
              <div>• Tỷ lệ & bố cục ô vuông: <strong>${layoutScore}%</strong></div>
            </div>
            <div style="font-size:13px;margin-bottom:6px;">💡 <strong>Chỉ dẫn sửa lỗi:</strong> ${adviceList.join(" ")}</div>
            <div style="font-size:11.5px;color:var(--text-muted);">
              * Lưu ý minh bạch: Điểm số ở chế độ vẽ tự do được tính bằng thuật toán so khớp vector tọa độ với dữ liệu chuẩn Make Me a Hanzi nên mang tính tham khảo hỗ trợ luyện tập. Để kiểm tra chính xác tuyệt đối từng nét một, hãy kết hợp thêm tab "Theo từng nét chuẩn".
            </div>
          </div>
        `;
      };
    }
  }

  return {
    renderHanzi
  };
})();
