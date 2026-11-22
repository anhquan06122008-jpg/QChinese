/* -*- coding: utf-8 -*-
 * QChinese – Module 5 (Flagship Interactive Pinyin Pronunciation Lab: 21 Initials, 38 Finals, 16 Whole Syllables,
 * SVG Articulation Diagrams, Aspirated/Retroflex/Nasal Contrast Room, 4-Tier Discrimination Challenge)
 * & Module 7 (Listening Replay + Custom Personal Material Audio/Video Listening Studio)
 */

window.QPinyinListening = (function () {
  /* ==================== PHẦN 5: INTERACTIVE PINYIN LAB ==================== */
  let pyTab = "chart"; // "chart" | "contrast" | "tones" | "combiner" | "challenge"
  let selectedSound = null;
  let selectedKind = "initial"; // "initial" | "final" | "whole"
  let activeContrastGroup = "aspirated";
  let activePairKey = "b/p";
  let challengeGroup = "all"; // all | aspirated | retroflex | nasals | tones
  let challengeTier = "easy"; // easy | medium | hard | advanced
  let currentChallenge = null;
  let challengeAnswered = false;
  let challengeStreak = 0;
  let lastVoiceUrl = null;
  let lastTranscript = "";

  /* SVG Vocal-Tract & Lip/Tongue Diagram for Vietnamese Learners */
  function getArticulationType(sym) {
    const s = String(sym || "").toLowerCase();
    if (["b", "m"].includes(s)) return "bilabial";
    if (s === "p") return "bilabial_asp";
    if (s === "f") return "labiodental";
    if (["d", "n", "l"].includes(s)) return "alveolar";
    if (s === "t") return "alveolar_asp";
    if (["g", "h"].includes(s)) return "velar";
    if (s === "k") return "velar_asp";
    if (["j", "x"].includes(s)) return "palatal";
    if (s === "q") return "palatal_asp";
    if (["z", "s", "zi", "si"].includes(s)) return "dental";
    if (["c", "ci"].includes(s)) return "dental_asp";
    if (["zh", "sh", "r", "zhi", "shi", "ri", "er"].includes(s)) return "retroflex";
    if (["ch", "chi"].includes(s)) return "retroflex_asp";
    if (/(ang|eng|ing|ong|iang|uang|ueng|iong|ying)/.test(s)) return "nasal_back";
    if (/(an|en|in|un|ün|ian|uan|üan|yin|yun|yuan)/.test(s)) return "nasal_front";
    if (/(ü|yu|yue|u|wu)/.test(s)) return "rounded_u";
    return "open";
  }

  function renderArticulationSVG(symbol, compact = false) {
    const type = getArticulationType(symbol);
    const isAsp = type.endsWith("_asp");
    const base = type.replace("_asp", "");
    const h = compact ? 112 : 146;

    // Tongue path shapes inside vocal tract (viewBox 0 0 240 140)
    let tonguePath = "M 65 112 Q 115 94 172 104"; // neutral open
    let highlightDot = "";
    let caption = "Khẩu hình mở tự nhiên";

    if (base === "bilabial") {
      tonguePath = "M 70 112 Q 120 100 175 106";
      highlightDot = `<circle cx="48" cy="78" r="9" fill="var(--accent-red)" opacity="0.28"/><circle cx="48" cy="78" r="4" fill="var(--accent-red)"/>`;
      caption = isAsp ? "Khép 2 môi → BẬT MẠNH luồng hơi ra!" : "Khép 2 môi mở nhanh — KHÔNG bật hơi";
    } else if (base === "labiodental") {
      tonguePath = "M 70 112 Q 120 100 175 106";
      highlightDot = `<circle cx="56" cy="74" r="8" fill="var(--accent-blue)" opacity="0.28"/>`;
      caption = "Răng cửa trên chạm nhẹ môi dưới";
    } else if (base === "alveolar") {
      tonguePath = "M 72 64 Q 110 88 175 104";
      highlightDot = `<circle cx="72" cy="58" r="8" fill="var(--accent-red)" opacity="0.28"/>`;
      caption = isAsp ? "Đầu lưỡi chạm lợi trên → BẬT HƠI mạnh" : "Đầu lưỡi chạm lợi trên — KHÔNG bật hơi";
    } else if (base === "velar") {
      tonguePath = "M 75 104 Q 132 54 176 92";
      highlightDot = `<circle cx="136" cy="56" r="9" fill="var(--accent-red)" opacity="0.28"/>`;
      caption = isAsp ? "Gốc lưỡi nâng chạm ngạc mềm → BẬT HƠI từ họng" : "Gốc lưỡi chạm ngạc mềm — KHÔNG bật hơi";
    } else if (base === "palatal") {
      tonguePath = "M 66 94 Q 104 54 174 96";
      highlightDot = `<circle cx="102" cy="54" r="9" fill="var(--primary)" opacity="0.3"/>`;
      caption = isAsp ? "Đầu lưỡi chạm răng dưới, mặt lưỡi nâng → BẬT HƠI" : "Đầu lưỡi chạm răng dưới, mặt lưỡi nâng (không hơi)";
    } else if (base === "dental") {
      tonguePath = "M 62 72 Q 108 92 175 102";
      highlightDot = `<circle cx="62" cy="70" r="8" fill="var(--accent-blue)" opacity="0.32"/>`;
      caption = isAsp ? "Lưỡi THẲNG sát răng cửa → BẬT HƠI xì mạnh" : "Lưỡi THẲNG sát răng cửa — KHÔNG cong lưỡi";
    } else if (base === "retroflex") {
      tonguePath = "M 92 52 Q 80 76 116 92 Q 150 96 176 102";
      highlightDot = `<circle cx="92" cy="50" r="10" fill="var(--accent-red)" opacity="0.3"/>`;
      caption = isAsp ? "Đầu lưỡi UỐN CONG lên ngạc cứng → BẬT HƠI mạnh!" : "Đầu lưỡi UỐN CONG lên ngạc cứng (âm dày)";
    } else if (base === "nasal_front") {
      tonguePath = "M 70 60 Q 112 92 175 102";
      highlightDot = `<path d="M 142 42 Q 105 18 52 38" fill="none" stroke="var(--accent-blue)" stroke-width="2.5" stroke-dasharray="4,3"/>`;
      caption = "Mũi trước (-n): Đầu lưỡi chạm lợi trên, kết gọn";
    } else if (base === "nasal_back") {
      tonguePath = "M 76 104 Q 134 52 176 92";
      highlightDot = `<path d="M 150 42 Q 112 14 52 36" fill="none" stroke="var(--accent-amber)" stroke-width="3" stroke-dasharray="4,3"/>`;
      caption = "Mũi sau (-ng): Gốc lưỡi nâng, vang sâu khoang mũi";
    } else if (base === "rounded_u") {
      tonguePath = "M 74 96 Q 124 80 175 96";
      highlightDot = `<ellipse cx="44" cy="78" rx="6" ry="11" fill="none" stroke="var(--primary)" stroke-width="3"/>`;
      caption = "Giữ hai môi CHỤM TRÒN cố định (như huýt sáo)";
    }

    const puffArrows = isAsp
      ? `<g stroke="var(--accent-red)" stroke-width="2.5" stroke-linecap="round">
           <line x1="38" y1="74" x2="10" y2="66"/><polyline points="16,62 10,66 15,71" fill="none"/>
           <line x1="38" y1="80" x2="8" y2="80"/><polyline points="14,76 8,80 14,84" fill="none"/>
           <line x1="38" y1="86" x2="12" y2="94"/><polyline points="17,89 12,94 18,97" fill="none"/>
         </g>`
      : `<text x="10" y="84" font-size="10" fill="var(--text-muted)">Hơi êm</text>`;

    return `
      <div style="background:var(--bg-subtle);border:1px solid var(--border-color);border-radius:12px;padding:8px;text-align:center;">
        <svg viewBox="0 0 240 132" style="width:100%;max-width:260px;height:${h}px;display:block;margin:0 auto;">
          <!-- Nasal cavity & palate outline -->
          <path d="M 52 40 Q 95 26 148 36 Q 178 44 186 78" fill="none" stroke="var(--border-strong)" stroke-width="2"/>
          <!-- Hard & soft palate -->
          <path d="M 58 62 Q 92 44 136 48 Q 162 52 174 72" fill="none" stroke="var(--text-secondary)" stroke-width="3" stroke-linecap="round"/>
          <!-- Upper & lower teeth -->
          <rect x="54" y="62" width="6" height="10" rx="2" fill="var(--bg-surface)" stroke="var(--text-secondary)" stroke-width="1.5"/>
          <rect x="54" y="84" width="6" height="9" rx="2" fill="var(--bg-surface)" stroke="var(--text-secondary)" stroke-width="1.5"/>
          <!-- Lips -->
          <path d="M 46 66 Q 52 72 48 75" fill="none" stroke="var(--text-main)" stroke-width="3" stroke-linecap="round"/>
          <path d="M 46 92 Q 52 86 48 83" fill="none" stroke="var(--text-main)" stroke-width="3" stroke-linecap="round"/>
          <!-- Tongue -->
          <path d="${tonguePath}" fill="none" stroke="var(--primary)" stroke-width="6" stroke-linecap="round"/>
          ${highlightDot}
          ${puffArrows}
          <text x="182" y="34" font-size="9" fill="var(--text-muted)">Khoang mũi</text>
          <text x="104" y="126" font-size="9.5" fill="var(--text-secondary)" text-anchor="middle">Lưỡi</text>
        </svg>
        <div style="font-size:12px;font-weight:600;color:var(--primary);margin-top:2px;">${QCore.escapeHtml(caption)}</div>
      </div>
    `;
  }

  function renderPinyin(container, params = {}) {
    const data = window.QCHINESE_PINYIN;
    if (params && params.tab) pyTab = params.tab;
    if (params && params.pair) {
      activePairKey = params.pair;
      pyTab = "contrast";
      for (const g of data.contrastGroups || []) {
        if (g.pairs.some((p) => p.key === params.pair)) {
          activeContrastGroup = g.id;
          break;
        }
      }
    }

    const st = QCore.getState();
    const weakPairs = Object.entries((st && st.phoneticErrors) || {})
      .filter(([, v]) => (v.wrong || 0) > 0)
      .sort((a, b) => b[1].wrong - a[1].wrong)
      .slice(0, 4);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🎵 Phòng Luyện Phát Âm Pinyin Chuyên Sâu (Thanh mẫu · Vận mẫu · Thanh điệu)</h2>
          <p>Thiết kế riêng cho người Việt: Sơ đồ lưỡi – môi trực quan, phân biệt chính xác âm bật hơi, cong lưỡi, mũi -n/-ng và bài luyện nghe 4 cấp độ.</p>
        </div>
        ${weakPairs.length ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <span style="font-size:12.5px;color:var(--text-muted);">Âm bạn hay nhầm:</span>
            ${weakPairs.map(([k, v]) => `<button class="btn btn-outline btn-sm" style="border-color:var(--accent-red);color:var(--accent-red);" data-jump-pair="${QCore.escapeHtml(k)}">⚠️ ${QCore.escapeHtml(k)} (${v.wrong} lỗi)</button>`).join("")}
          </div>
        ` : ""}
      </div>

      <div class="tabs-bar" style="margin-bottom:20px;flex-wrap:wrap;">
        <button class="tab-pill ${pyTab === "chart" ? "active" : ""}" data-pytab="chart">1. Bảng Pinyin Tương Tác (21+38+16)</button>
        <button class="tab-pill ${pyTab === "contrast" ? "active" : ""}" data-pytab="contrast">2. Đối chiếu Âm Khó (b/p · zh/z · an/ang)</button>
        <button class="tab-pill ${pyTab === "tones" ? "active" : ""}" data-pytab="tones">3. 4 Thanh điệu & Biến điệu</button>
        <button class="tab-pill ${pyTab === "combiner" ? "active" : ""}" data-pytab="combiner">4. Bảng Ghép Âm</button>
        <button class="tab-pill ${pyTab === "challenge" ? "active" : ""}" data-pytab="challenge">5. CHALLENGE Nghe & Phân biệt</button>
      </div>

      <div id="pinyin-stage"></div>
    `;

    container.querySelectorAll("[data-jump-pair]").forEach((b) => {
      b.onclick = () => renderPinyin(container, { pair: b.getAttribute("data-jump-pair") });
    });

    container.querySelectorAll("[data-pytab]").forEach((btn) => {
      btn.onclick = () => {
        pyTab = btn.getAttribute("data-pytab");
        renderPinyin(container);
      };
    });

    const stage = container.querySelector("#pinyin-stage");
    if (pyTab === "chart") renderInteractiveChart(stage, data, container);
    else if (pyTab === "contrast") renderContrastLab(stage, data, container);
    else if (pyTab === "tones") renderTonesTab(stage, data);
    else if (pyTab === "combiner") renderCombinerTab(stage, data);
    else renderChallengeTab(stage, data, container);
  }

  /* ---------- TAB 1: FULL INTERACTIVE PINYIN CHART ---------- */
  function renderInteractiveChart(stage, data, container) {
    const allFinals = [...data.finals.single, ...data.finals.compound, ...data.finals.nasal];
    const wholes = data.wholeSyllables || [];
    if (!selectedSound) {
      selectedSound = data.initials[0];
      selectedKind = "initial";
    }
    const curr = selectedSound;
    const groups = [...new Set(data.initials.map((i) => i.group))];

    stage.innerHTML = `
      <div class="grid-2" style="align-items:start;">
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- 21 Initials + y/w -->
          <div class="card" style="padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <h3 style="margin:0;font-size:16px;">🟦 Thanh mẫu (声母 · 21 âm đầu + 2 quy ước y/w)</h3>
              <span class="badge badge-jade">Bấm để nghe</span>
            </div>
            ${groups.map((g) => `
              <div style="margin-bottom:10px;">
                <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:5px;">${QCore.escapeHtml(g)}</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${data.initials.filter((i) => i.group === g).map((i) => `
                    <button class="btn ${selectedKind === "initial" && curr.symbol === i.symbol ? "btn-primary" : "btn-outline"} btn-sm" style="min-width:48px;font-size:16px;font-weight:700;" data-pick-kind="initial" data-pick-sym="${QCore.escapeHtml(i.symbol)}">
                      ${QCore.escapeHtml(i.symbol)}
                    </button>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>

          <!-- 38 Finals -->
          <div class="card" style="padding:18px;">
            <h3 style="margin:0 0 10px;font-size:16px;">🟩 Vận mẫu (韵母 · Đơn · Kép · Mũi -n/-ng)</h3>
            ${[
              ["Đơn vận mẫu (6)", data.finals.single],
              ["Phức vận mẫu (13)", data.finals.compound],
              ["Vận mẫu mũi trước (-n), mũi sau (-ng) & er", data.finals.nasal]
            ].map(([title, arr]) => `
              <div style="margin-bottom:10px;">
                <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:5px;">${title}</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${arr.map((f) => `
                    <button class="btn ${selectedKind === "final" && curr.symbol === f.symbol ? "btn-primary" : "btn-outline"} btn-sm" style="font-size:14.5px;font-weight:700;" data-pick-kind="final" data-pick-sym="${QCore.escapeHtml(f.symbol)}">
                      ${QCore.escapeHtml(f.symbol)}
                    </button>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>

          <!-- 16 Whole-Reading Syllables -->
          <div class="card" style="padding:18px;">
            <h3 style="margin:0 0 8px;font-size:16px;">🟨 16 Âm tiết đọc liền (整体认读音节)</h3>
            <p style="margin:0 0 10px;font-size:12.5px;color:var(--text-secondary);">Đọc trực tiếp nguyên âm tiết, KHÔNG tách ghép đánh vần:</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${wholes.map((w) => `
                <button class="btn ${selectedKind === "whole" && curr.symbol === w.symbol ? "btn-primary" : "btn-outline"} btn-sm" style="font-size:14.5px;font-weight:700;" data-pick-kind="whole" data-pick-sym="${QCore.escapeHtml(w.symbol)}">
                  ${QCore.escapeHtml(w.symbol)}
                </button>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Sticky Articulation Inspector -->
        <div class="card" style="position:sticky;top:76px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:8px;flex-wrap:wrap;">
            <span class="badge badge-jade">${selectedKind === "initial" ? QCore.escapeHtml(curr.group || "Thanh mẫu") : selectedKind === "final" ? "Vận mẫu (韵母)" : "Âm tiết đọc liền (整体认读)"}</span>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-primary btn-sm" data-speak="${QCore.escapeHtml(curr.readAudio)}">🔊 Nghe chuẩn (${QCore.escapeHtml(curr.readPy)})</button>
              <button class="btn btn-outline btn-sm" data-speak-slow="${QCore.escapeHtml(curr.readAudio)}">🐢 Chậm</button>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:110px 1fr;gap:14px;align-items:center;margin-bottom:12px;">
            <div style="text-align:center;background:var(--bg-accent-soft);border-radius:16px;padding:16px 8px;">
              <div style="font-size:46px;font-weight:800;color:var(--primary);line-height:1.05;">${QCore.escapeHtml(curr.symbol)}</div>
              <div class="hanzi-text" style="font-size:18px;margin-top:4px;">${QCore.escapeHtml(curr.readAudio)} (${QCore.escapeHtml(curr.readPy)})</div>
            </div>
            ${renderArticulationSVG(curr.symbol)}
          </div>

          <div class="card-subtle" style="margin-bottom:10px;">
            <strong>👄 Vị trí lưỡi, môi, răng & luồng hơi:</strong>
            <p style="margin:4px 0 0;font-size:13.8px;">${QCore.escapeHtml(curr.mouth || curr.note || "")}</p>
          </div>

          ${curr.howVi ? `
            <div class="vi-hint-banner" style="margin-bottom:10px;">
              <span>🇻🇳</span>
              <div><strong>Lưu ý đặc biệt cho người Việt:</strong> ${QCore.escapeHtml(curr.howVi)}</div>
            </div>
          ` : ""}

          ${curr.example && typeof curr.example === "object" ? `
            <div class="card-subtle" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <div>
                <strong>Ví dụ thực tế:</strong>
                <span class="hanzi-text" style="font-size:22px;font-weight:700;margin-left:8px;">${QCore.escapeHtml(curr.example.hz)}</span>
                <span class="pinyin-text" style="color:var(--primary);font-weight:600;">(${QCore.escapeHtml(curr.example.py)})</span> — ${QCore.escapeHtml(curr.example.vi)}
              </div>
              <button class="btn btn-soft btn-sm" data-speak="${QCore.escapeHtml(curr.example.hz)}">🔊 Nghe</button>
            </div>
          ` : curr.example ? `<div class="card-subtle" style="margin-bottom:12px;"><strong>Ví dụ:</strong> ${QCore.escapeHtml(curr.example)}</div>` : ""}

          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" id="py-chart-rec">🎙️ Ghi âm đọc thử "${QCore.escapeHtml(curr.symbol)}"</button>
            <button class="btn btn-outline btn-sm" id="py-goto-contrast">⚡ Luyện phân biệt cặp dễ nhầm →</button>
          </div>
          <div id="py-chart-rec-out" style="margin-top:10px;"></div>
        </div>
      </div>
    `;

    stage.querySelectorAll("[data-pick-kind]").forEach((b) => {
      b.onclick = () => {
        const k = b.getAttribute("data-pick-kind");
        const sym = b.getAttribute("data-pick-sym");
        selectedKind = k;
        if (k === "initial") selectedSound = data.initials.find((x) => x.symbol === sym);
        else if (k === "final") selectedSound = allFinals.find((x) => x.symbol === sym);
        else selectedSound = wholes.find((x) => x.symbol === sym);
        if (selectedSound) QCore.speakChinese(selectedSound.readAudio);
        renderInteractiveChart(stage, data, container);
      };
    });

    stage.querySelector("#py-goto-contrast").onclick = () => {
      pyTab = "contrast";
      renderPinyin(container);
    };

    stage.querySelector("#py-chart-rec").onclick = () => {
      const out = stage.querySelector("#py-chart-rec-out");
      out.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);">🔴 Đang thu âm 3 giây... Hãy đọc rõ <strong>${QCore.escapeHtml(curr.readPy)}</strong>!</div>`;
      QCore.captureLearnerVoice({
        durationMs: 3000,
        onAudioReady: (url, tr) => {
          out.innerHTML = `
            <div class="card-subtle">
              <audio controls src="${url}" style="width:100%;height:34px;margin-bottom:4px;"></audio>
              <div style="font-size:12.5px;color:var(--text-secondary);">${tr ? `Nhận diện: "${QCore.escapeHtml(tr)}". ` : ""}Bấm Play để tự nghe đối chiếu khẩu hình & luồng hơi với âm mẫu!</div>
            </div>
          `;
        }
      });
    };

    bindSpeakBtns(stage);
  }

  /* ---------- TAB 2: CONTRAST LAB (ASPIRATED / RETROFLEX / NASALS) ---------- */
  function renderContrastLab(stage, data, container) {
    const groups = data.contrastGroups || [];
    const grp = groups.find((g) => g.id === activeContrastGroup) || groups[0];
    const pair = grp.pairs.find((p) => p.key === activePairKey) || grp.pairs[0];
    activePairKey = pair.key;

    stage.innerHTML = `
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        ${groups.map((g) => `
          <button class="btn ${g.id === grp.id ? "btn-primary" : "btn-outline"} btn-sm" data-cgrp="${g.id}">${QCore.escapeHtml(g.title)}</button>
        `).join("")}
      </div>

      <div class="vi-hint-banner" style="margin-bottom:16px;">
        <span>🎯</span>
        <div>${QCore.escapeHtml(grp.warning)}</div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        ${grp.pairs.map((p) => `
          <button class="btn ${p.key === pair.key ? "btn-primary" : "btn-soft"}" style="font-size:16px;font-weight:700;" data-cpair="${QCore.escapeHtml(p.key)}">
            ${QCore.escapeHtml(p.a)}  ⚡  ${QCore.escapeHtml(p.b)}
          </button>
        `).join("")}
      </div>

      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <h3 style="margin:0;">So sánh trực diện: <span style="color:var(--primary);">${QCore.escapeHtml(pair.a)}</span> vs <span style="color:var(--accent-red);">${QCore.escapeHtml(pair.b)}</span></h3>
          <button class="btn btn-primary btn-sm" id="pair-drill-jump">🎮 Vào Challenge nghe phân biệt cặp ${QCore.escapeHtml(pair.key)} →</button>
        </div>

        <p style="margin:0 0 14px;font-size:14px;color:var(--text-secondary);">${QCore.escapeHtml(pair.explain)}</p>

        <div class="grid-2" style="margin-bottom:16px;">
          <div>
            <div style="text-align:center;font-weight:800;font-size:24px;color:var(--primary);margin-bottom:6px;">Âm A: ${QCore.escapeHtml(pair.a)}</div>
            ${renderArticulationSVG(pair.a, true)}
          </div>
          <div>
            <div style="text-align:center;font-weight:800;font-size:24px;color:var(--accent-red);margin-bottom:6px;">Âm B: ${QCore.escapeHtml(pair.b)}</div>
            ${renderArticulationSVG(pair.b, true)}
          </div>
        </div>

        <h4 style="margin:0 0 10px;">🎧 Nghe đối chiếu từng cặp âm tiết tối thiểu (Minimal Pairs):</h4>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
          ${pair.syllables.map((row, idx) => `
            <div class="card-subtle" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
              <button class="btn btn-outline" style="flex:1;min-width:170px;justify-content:space-between;" data-speak="${QCore.escapeHtml(row.a.hz)}">
                <span><strong style="color:var(--primary);font-size:17px;">${QCore.escapeHtml(row.a.py)}</strong> · <span class="hanzi-text" style="font-size:19px;">${QCore.escapeHtml(row.a.hz)}</span></span>
                <small style="color:var(--text-muted);">${QCore.escapeHtml(row.a.vi)} 🔊</small>
              </button>
              <button class="btn btn-soft btn-sm" data-seq-a="${QCore.escapeHtml(row.a.hz)}" data-seq-b="${QCore.escapeHtml(row.b.hz)}">▶️ Nghe A → B</button>
              <button class="btn btn-outline" style="flex:1;min-width:170px;justify-content:space-between;" data-speak="${QCore.escapeHtml(row.b.hz)}">
                <span><strong style="color:var(--accent-red);font-size:17px;">${QCore.escapeHtml(row.b.py)}</strong> · <span class="hanzi-text" style="font-size:19px;">${QCore.escapeHtml(row.b.hz)}</span></span>
                <small style="color:var(--text-muted);">${QCore.escapeHtml(row.b.vi)} 🔊</small>
              </button>
            </div>
          `).join("")}
        </div>

        <h4 style="margin:0 0 10px;">📖 Luyện trong từ hoàn chỉnh & câu giao tiếp:</h4>
        <div class="grid-2" style="gap:10px;">
          ${pair.words.map((w) => `
            <div class="card-subtle" style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-outline btn-sm" data-speak="${QCore.escapeHtml(w.a.hz)}"><strong class="hanzi-text">${QCore.escapeHtml(w.a.hz)}</strong> (${QCore.escapeHtml(w.a.py)} · ${QCore.escapeHtml(w.a.vi)}) 🔊</button>
              <button class="btn btn-outline btn-sm" data-speak="${QCore.escapeHtml(w.b.hz)}"><strong class="hanzi-text">${QCore.escapeHtml(w.b.hz)}</strong> (${QCore.escapeHtml(w.b.py)} · ${QCore.escapeHtml(w.b.vi)}) 🔊</button>
            </div>
          `).join("")}
        </div>

        ${pair.sentences && pair.sentences[0] ? `
          <div class="grid-2" style="gap:10px;margin-top:10px;">
            <div class="card-subtle">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="badge badge-jade">Câu mẫu âm ${QCore.escapeHtml(pair.a)}</span>
                <button class="btn btn-soft btn-sm" data-speak="${QCore.escapeHtml(pair.sentences[0].a.hz)}">🔊 Nghe câu</button>
              </div>
              <div class="hanzi-text" style="font-size:18px;font-weight:700;margin-top:6px;">${QCore.escapeHtml(pair.sentences[0].a.hz)}</div>
              <div class="pinyin-text" style="font-size:13px;color:var(--primary);">${QCore.escapeHtml(pair.sentences[0].a.py)}</div>
              <div style="font-size:12.5px;color:var(--text-secondary);">${QCore.escapeHtml(pair.sentences[0].a.vi)}</div>
            </div>
            <div class="card-subtle">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="badge badge-red">Câu mẫu âm ${QCore.escapeHtml(pair.b)}</span>
                <button class="btn btn-soft btn-sm" data-speak="${QCore.escapeHtml(pair.sentences[0].b.hz)}">🔊 Nghe câu</button>
              </div>
              <div class="hanzi-text" style="font-size:18px;font-weight:700;margin-top:6px;">${QCore.escapeHtml(pair.sentences[0].b.hz)}</div>
              <div class="pinyin-text" style="font-size:13px;color:var(--accent-red);">${QCore.escapeHtml(pair.sentences[0].b.py)}</div>
              <div style="font-size:12.5px;color:var(--text-secondary);">${QCore.escapeHtml(pair.sentences[0].b.vi)}</div>
            </div>
          </div>
        ` : ""}

        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-color);display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary btn-sm" id="pair-rec-btn">🎙️ Ghi âm đọc cặp "${QCore.escapeHtml(pair.syllables[0].a.py)} — ${QCore.escapeHtml(pair.syllables[0].b.py)}"</button>
          <div id="pair-rec-out" style="flex:1;min-width:220px;"></div>
        </div>
      </div>
    `;

    stage.querySelectorAll("[data-cgrp]").forEach((b) => {
      b.onclick = () => {
        activeContrastGroup = b.getAttribute("data-cgrp");
        const nextGrp = groups.find((g) => g.id === activeContrastGroup);
        if (nextGrp && nextGrp.pairs[0]) activePairKey = nextGrp.pairs[0].key;
        renderContrastLab(stage, data, container);
      };
    });
    stage.querySelectorAll("[data-cpair]").forEach((b) => {
      b.onclick = () => {
        activePairKey = b.getAttribute("data-cpair");
        renderContrastLab(stage, data, container);
      };
    });
    stage.querySelectorAll("[data-seq-a]").forEach((b) => {
      b.onclick = () => {
        const a = b.getAttribute("data-seq-a");
        const bb = b.getAttribute("data-seq-b");
        QCore.speakChinese(a, {
          onEnd: () => setTimeout(() => QCore.speakChinese(bb), 420)
        });
      };
    });
    stage.querySelector("#pair-drill-jump").onclick = () => {
      challengeGroup = grp.id;
      currentChallenge = null;
      pyTab = "challenge";
      renderPinyin(container);
    };
    stage.querySelector("#pair-rec-btn").onclick = () => {
      const out = stage.querySelector("#pair-rec-out");
      out.innerHTML = `<span style="color:var(--accent-red);font-weight:600;">🔴 Đang thu âm 4 giây...</span>`;
      QCore.captureLearnerVoice({
        durationMs: 4000,
        onAudioReady: (url, tr) => {
          out.innerHTML = `<audio controls src="${url}" style="width:100%;height:34px;"></audio><div style="font-size:12px;color:var(--text-secondary);">${tr ? `Nhận diện: "${QCore.escapeHtml(tr)}". ` : ""}Nghe lại để kiểm tra độ bật hơi / cong lưỡi của bạn!</div>`;
        }
      });
    };

    bindSpeakBtns(stage);
  }

  /* ---------- TAB 3: 4 TONES & TONE SANDHI ---------- */
  function renderTonesTab(stage, data) {
    stage.innerHTML = `
      <div class="grid-3" style="margin-bottom:20px;">
        ${data.tones.map((t) => `
          <div class="card" style="padding:18px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <strong style="font-size:15.5px;color:var(--primary);">${QCore.escapeHtml(t.name)}</strong>
              <span class="badge badge-jade" style="font-size:15px;">${QCore.escapeHtml(t.symbol)}</span>
            </div>
            <svg viewBox="0 0 180 105" style="width:100%;height:76px;background:var(--bg-subtle);border-radius:12px;margin-bottom:10px;">
              <line x1="10" y1="22" x2="170" y2="22" stroke="var(--border-strong)" stroke-dasharray="3,3"/>
              <line x1="10" y1="55" x2="170" y2="55" stroke="var(--border-strong)" stroke-dasharray="3,3"/>
              <line x1="10" y1="88" x2="170" y2="88" stroke="var(--border-strong)" stroke-dasharray="3,3"/>
              <path d="${t.svgPath}" fill="none" stroke="var(--accent-red)" stroke-width="4" stroke-linecap="round"/>
            </svg>
            <div style="font-size:12.5px;font-weight:700;margin-bottom:4px;">Độ cao: ${QCore.escapeHtml(t.pitch)}</div>
            <p style="font-size:13px;color:var(--text-secondary);margin:0 0 8px;">${QCore.escapeHtml(t.desc)}</p>
            <div class="card-subtle" style="padding:8px 10px;font-size:12.5px;margin-bottom:10px;">💡 ${QCore.escapeHtml(t.tipVi)}</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${t.examples.map((ex) => `
                <button class="btn btn-outline btn-sm" data-speak="${QCore.escapeHtml(ex.hz)}">
                  <strong class="hanzi-text">${QCore.escapeHtml(ex.hz)}</strong> (${QCore.escapeHtml(ex.py)} · ${QCore.escapeHtml(ex.vi)}) 🔊
                </button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      <div class="card" style="margin-bottom:20px;">
        <h3 style="margin:0 0 6px;">🎧 So sánh trực tiếp 4 thanh điệu cùng âm tiết</h3>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:12px;">
          ${data.quadSets.map((qs) => `
            <div class="card-subtle" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
              <strong style="min-width:80px;color:var(--primary);">Gốc "${QCore.escapeHtml(qs.base)}"</strong>
              <div style="display:flex;gap:8px;flex-wrap:wrap;flex:1;">
                ${qs.items.map((it) => `
                  <button class="btn btn-outline" style="flex:1;min-width:130px;justify-content:space-between;" data-speak="${QCore.escapeHtml(it.hz)}">
                    <span><strong class="pinyin-text" style="color:var(--primary);">${QCore.escapeHtml(it.py)}</strong> · <span class="hanzi-text" style="font-size:18px;">${QCore.escapeHtml(it.hz)}</span></span>
                    <span style="font-size:12px;color:var(--text-muted);">${QCore.escapeHtml(it.vi)} 🔊</span>
                  </button>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="card">
        <h3 style="margin:0 0 12px;">🔀 Quy tắc Biến điệu thực tế (Thanh từ điển vs Cách đọc trong câu)</h3>
        <div class="grid-2">
          ${data.sandhiRules.map((r) => `
            <div class="card-subtle">
              <strong style="color:var(--primary);font-size:14.5px;">${QCore.escapeHtml(r.title)}</strong>
              <div class="badge badge-amber" style="margin:6px 0;display:inline-block;">${QCore.escapeHtml(r.formula)}</div>
              <p style="font-size:13px;color:var(--text-secondary);margin:4px 0 10px;">${QCore.escapeHtml(r.explanation)}</p>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${r.examples.map((ex) => `
                  <button class="btn btn-outline btn-sm" data-speak="${QCore.escapeHtml(ex.hz)}">
                    <span class="hanzi-text" style="font-weight:700;">${QCore.escapeHtml(ex.hz)}</span>
                    <span>(${QCore.escapeHtml(ex.written)} → đọc <strong>${QCore.escapeHtml(ex.spoken)}</strong>)</span> 🔊
                  </button>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    bindSpeakBtns(stage);
  }

  /* ---------- TAB 4: SYLLABLE COMBINER ---------- */
  function renderCombinerTab(stage, data) {
    const cols = ["a", "o", "e", "i", "u", "ü", "ai", "ei", "ao", "ou", "ia", "ie", "ua", "uo", "üe", "an", "en", "in", "ian", "uan", "ang", "eng", "ing", "ong"];
    stage.innerHTML = `
      <div class="card">
        <h3 style="margin:0 0 6px;">🧩 Bảng Ghép Âm Tương Tác (Thanh mẫu + Vận mẫu → Chữ Hán thực tế)</h3>
        <p style="margin:0 0 14px;font-size:13.5px;color:var(--text-secondary);">Bấm vào bất kỳ ô ghép âm nào để nghe ngay âm thanh chuẩn Putonghua:</p>
        <div style="margin-bottom:14px;max-width:480px;">
          <input class="input-field" data-pinyin-ime="true" placeholder="Thử gõ Pinyin bất kỳ (vd: xue, lv, zhong, qing, mai)..." />
        </div>
        <div style="overflow-x:auto;">
          <table class="tri-table" style="min-width:880px;">
            <thead><tr><th>Thanh \\ Vận</th>${cols.map((c) => `<th style="text-align:center;width:auto;padding:8px 6px;">${c}</th>`).join("")}</tr></thead>
            <tbody>
              ${data.combinerGrid.map((row) => `
                <tr>
                  <th style="font-size:16px;color:var(--primary);text-align:center;">${row.initial}</th>
                  ${cols.map((c) => {
                    const cell = row.combos[c];
                    if (!cell) return `<td style="text-align:center;color:var(--border-strong);">—</td>`;
                    return `<td style="text-align:center;padding:6px;cursor:pointer;" class="qs-item" data-speak="${QCore.escapeHtml(cell.hz)}" title="${QCore.escapeHtml(cell.vi)}"><div class="pinyin-text" style="font-size:12.5px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(cell.py)}</div><div class="hanzi-text" style="font-size:16px;">${QCore.escapeHtml(cell.hz)}</div></td>`;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
    if (window.QPinyinIME) QPinyinIME.attachAll(stage);
    bindSpeakBtns(stage);
  }

  /* ---------- TAB 5: 4-TIER LISTENING DISCRIMINATION CHALLENGE ---------- */
  function buildChallengeQuestion(data) {
    if (challengeGroup === "tones") {
      const drills = data.listeningDrills || [];
      const d = drills[Math.floor(Math.random() * drills.length)];
      return {
        pairKey: `tone_${d.correctTone}`,
        audioText: d.audioText,
        prompt: "Nghe thật kỹ đường cao độ và chọn đúng Thanh điệu:",
        options: d.options.map((opt, idx) => ({ label: opt, isCorrect: idx + 1 === d.correctTone })),
        explain: d.hint,
        contrastPair: null
      };
    }

    const groups = (data.contrastGroups || []).filter((g) => challengeGroup === "all" || g.id === challengeGroup);
    const allPairs = groups.flatMap((g) => g.pairs);
    const pair = allPairs[Math.floor(Math.random() * allPairs.length)];
    const pickA = Math.random() < 0.5;

    let itemPair = null;
    if (challengeTier === "easy" || challengeTier === "medium") {
      itemPair = pair.syllables[Math.floor(Math.random() * pair.syllables.length)];
    } else if (challengeTier === "hard" && pair.words && pair.words.length) {
      itemPair = pair.words[Math.floor(Math.random() * pair.words.length)];
    } else if (challengeTier === "advanced" && pair.sentences && pair.sentences.length) {
      itemPair = pair.sentences[Math.floor(Math.random() * pair.sentences.length)];
    } else {
      itemPair = pair.syllables[0];
    }

    const target = pickA ? itemPair.a : itemPair.b;
    const other = pickA ? itemPair.b : itemPair.a;
    const labelA = challengeTier === "easy"
      ? `Âm "${pair.a}" — ${itemPair.a.py}`
      : `${itemPair.a.py} (${itemPair.a.hz} · ${itemPair.a.vi})`;
    const labelB = challengeTier === "easy"
      ? `Âm "${pair.b}" — ${itemPair.b.py}`
      : `${itemPair.b.py} (${itemPair.b.hz} · ${itemPair.b.vi})`;

    return {
      pairKey: pair.key,
      audioText: target.hz,
      otherAudio: other.hz,
      prompt: `Bạn vừa nghe thấy âm "${pair.a}" hay "${pair.b}"?`,
      options: [
        { label: labelA, isCorrect: pickA },
        { label: labelB, isCorrect: !pickA }
      ],
      explain: `${pair.explain} | Âm đúng: ${target.hz} (${target.py} – ${target.vi}) vs âm đối chiếu: ${other.hz} (${other.py} – ${other.vi}).`,
      target,
      other
    };
  }

  function renderChallengeTab(stage, data, container) {
    if (!currentChallenge) {
      currentChallenge = buildChallengeQuestion(data);
      challengeAnswered = false;
    }
    const q = currentChallenge;
    const st = QCore.getState();
    const errEntries = Object.entries((st && st.phoneticErrors) || {})
      .sort((a, b) => (b[1].wrong || 0) - (a[1].wrong || 0));

    stage.innerHTML = `
      <div class="card" style="margin-bottom:16px;padding:16px;">
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center;">
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <strong style="font-size:13px;color:var(--text-muted);">Nhóm âm:</strong>
            ${[
              ["all", "Tất cả âm khó"],
              ["aspirated", "Bật hơi (b/p · d/t · g/k · j/q)"],
              ["retroflex", "Cong lưỡi (zh/z · ch/c · sh/s · r/l)"],
              ["nasals", "Mũi -n/-ng & u/ü"],
              ["tones", "4 Thanh điệu"]
            ].map(([id, lbl]) => `<button class="btn ${challengeGroup === id ? "btn-primary" : "btn-outline"} btn-sm" data-ch-grp="${id}">${lbl}</button>`).join("")}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
            <strong style="font-size:13px;color:var(--text-muted);">Độ khó:</strong>
            ${[
              ["easy", "Dễ (Âm đơn)"],
              ["medium", "Trung bình (Âm tiết)"],
              ["hard", "Khó (Từ hoàn chỉnh)"],
              ["advanced", "Nâng cao (Trong câu)"]
            ].map(([id, lbl]) => `<button class="btn ${challengeTier === id ? "btn-primary" : "btn-outline"} btn-sm" data-ch-tier="${id}">${lbl}</button>`).join("")}
          </div>
        </div>
      </div>

      <div class="grid-2" style="align-items:start;">
        <div class="card" style="text-align:center;padding:28px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
            <span class="badge badge-jade">🎯 Cặp luyện: ${QCore.escapeHtml(q.pairKey)}</span>
            <span class="badge badge-amber">🔥 Chuỗi đúng: ${challengeStreak}</span>
          </div>

          <h3 style="margin:0 0 14px;">${QCore.escapeHtml(q.prompt)}</h3>
          <div style="margin-bottom:20px;">
            <button class="btn btn-primary" style="font-size:16px;padding:14px 28px;" id="ch-play">🔊 Nghe âm thanh chuẩn</button>
            <button class="btn btn-outline btn-sm" id="ch-slow" style="margin-left:8px;">🐢 Nghe chậm</button>
          </div>

          <div class="grid-2" style="gap:12px;margin-bottom:16px;">
            ${q.options.map((opt, idx) => `
              <button class="btn btn-outline pinyin-text" style="padding:16px;font-size:16px;font-weight:700;justify-content:center;" data-ch-opt="${idx}">
                ${QCore.escapeHtml(opt.label)}
              </button>
            `).join("")}
          </div>

          <div id="ch-feedback" style="text-align:left;"></div>

          <div style="margin-top:16px;">
            <button class="btn btn-soft" id="ch-next">Câu tiếp theo →</button>
          </div>
        </div>

        <div class="card">
          <h3 style="margin:0 0 8px;">📊 Bản đồ Điểm yếu Phát âm của bạn</h3>
          <p style="margin:0 0 12px;font-size:13px;color:var(--text-secondary);">Mọi lần trả lời trong Challenge đều được lưu thực tế để Dashboard và AI Tutor tự động tạo bài luyện đúng cặp âm bạn hay nhầm!</p>
          ${errEntries.length ? `
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${errEntries.slice(0, 8).map(([k, v]) => {
                const total = (v.right || 0) + (v.wrong || 0);
                const acc = total ? Math.round(((v.right || 0) / total) * 100) : 0;
                return `
                  <div class="card-subtle" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;">
                    <div>
                      <strong style="font-size:15px;">${QCore.escapeHtml(k)}</strong>
                      <div style="font-size:12px;color:var(--text-muted);">Đúng ${v.right || 0} · Nhầm ${v.wrong || 0}</div>
                    </div>
                    <span class="badge ${acc >= 80 ? "badge-jade" : acc >= 55 ? "badge-amber" : "badge-red"}">${acc}%</span>
                  </div>
                `;
              }).join("")}
            </div>
          ` : `<div class="card-subtle" style="font-size:13px;color:var(--text-muted);">Chưa có dữ liệu luyện nghe phân biệt âm. Hãy bấm nghe và chọn đáp án ở bên trái nhé!</div>`}
        </div>
      </div>
    `;

    stage.querySelector("#ch-play").onclick = () => QCore.speakChinese(q.audioText);
    stage.querySelector("#ch-slow").onclick = () => QCore.speakChinese(q.audioText, { slow: true });
    setTimeout(() => QCore.speakChinese(q.audioText), 200);

    stage.querySelectorAll("[data-ch-grp]").forEach((b) => {
      b.onclick = () => {
        challengeGroup = b.getAttribute("data-ch-grp");
        currentChallenge = null;
        renderChallengeTab(stage, data, container);
      };
    });
    stage.querySelectorAll("[data-ch-tier]").forEach((b) => {
      b.onclick = () => {
        challengeTier = b.getAttribute("data-ch-tier");
        currentChallenge = null;
        renderChallengeTab(stage, data, container);
      };
    });

    stage.querySelectorAll("[data-ch-opt]").forEach((btn) => {
      btn.onclick = () => {
        if (challengeAnswered) return;
        challengeAnswered = true;
        const idx = Number(btn.getAttribute("data-ch-opt"));
        const ok = q.options[idx].isCorrect;
        QCore.recordPhoneticAttempt(q.pairKey, ok);
        if (ok) challengeStreak += 1;
        else challengeStreak = 0;

        const fb = stage.querySelector("#ch-feedback");
        fb.innerHTML = `
          <div class="card-subtle" style="border-color:${ok ? "var(--primary)" : "var(--accent-red)"};">
            <strong style="color:${ok ? "var(--primary)" : "var(--accent-red)"};">${ok ? "✅ Chính xác! Tai bạn đã phân biệt rất tốt!" : "❌ Chưa chính xác — đã ghi nhận cặp âm này vào danh sách cần luyện lại!"}</strong>
            <p style="margin:6px 0 10px;font-size:13.5px;">${QCore.escapeHtml(q.explain)}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-soft btn-sm" id="ch-rep-ok">🔊 Nghe lại đáp án đúng</button>
              ${q.otherAudio ? `<button class="btn btn-outline btn-sm" id="ch-rep-other">🔊 Nghe âm đối chiếu để so sánh</button>` : ""}
            </div>
          </div>
        `;
        fb.querySelector("#ch-rep-ok").onclick = () => QCore.speakChinese(q.audioText);
        const ro = fb.querySelector("#ch-rep-other");
        if (ro) ro.onclick = () => QCore.speakChinese(q.otherAudio);
      };
    });

    stage.querySelector("#ch-next").onclick = () => {
      currentChallenge = buildChallengeQuestion(data);
      challengeAnswered = false;
      renderChallengeTab(stage, data, container);
    };
  }

  function bindSpeakBtns(root) {
    root.querySelectorAll("[data-speak]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak"));
    });
    root.querySelectorAll("[data-speak-slow]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak-slow"), { slow: true });
    });
  }

  /* ==================== SECTION 6.3: LISTENING STUDIO + PERSONAL MATERIAL LISTENING ==================== */
  let activeLessonId = "lis_greeting_1";
  let activeMaterialId = null;
  let showHanzi = true;
  let showPinyin = true;
  let showTranslation = false;
  let playbackSpeed = 1.0;
  let playingIdx = -1;
  let reorderAttempt = [];
  let unlockedAnalysis = false;
  let showMatTranscript = false;
  let loopA = null;
  let loopB = null;

  function renderListening(container, params = {}) {
    if (params && params.materialId) {
      activeMaterialId = params.materialId;
    } else if (params && params.materialId === null) {
      activeMaterialId = null;
    }

    const st = QCore.getState();
    const customMat = activeMaterialId ? (st.materials || []).find((m) => m.id === activeMaterialId) : null;
    if (customMat) {
      renderMaterialListeningStudio(container, customMat);
      return;
    }

    const lessons = window.QCHINESE_LISTENING || [];
    const lesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];
    const isCompleted = st.listeningCompleted.includes(lesson.id);
    const audioMaterials = (st.materials || []).filter((m) => m.category === "listening" || m.mediaUrl);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🎧 Luyện Nghe Tiếng Trung Chuẩn Phổ Thông</h2>
          <p>Luyện nghe từ hội thoại chuẩn HSK hoặc mở trực tiếp file nghe MP3/WAV/Video từ Kho tài liệu cá nhân của bạn.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${lessons.map((l) => `
            <button class="btn ${l.id === lesson.id ? "btn-primary" : "btn-outline"} btn-sm" data-lis-id="${l.id}">
              ${st.listeningCompleted.includes(l.id) ? "✓ " : ""}HSK ${l.hsk_level}: ${QCore.escapeHtml(l.title.split(":")[0])}
            </button>
          `).join("")}
          <button class="btn btn-soft btn-sm" id="lis-open-materials">📁 Mở file nghe cá nhân (${audioMaterials.length})</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding-bottom:14px;border-bottom:1px solid var(--border-color);margin-bottom:16px;">
          <div>
            <span class="badge badge-jade">HSK ${lesson.hsk_level} · ${QCore.escapeHtml(lesson.category)}</span>
            <h3 style="margin:4px 0 0;">${QCore.escapeHtml(lesson.title)}</h3>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button class="btn ${showPinyin ? "btn-primary" : "btn-outline"} btn-sm" id="lis-tog-py">ā Pinyin</button>
            <button class="btn ${showHanzi ? "btn-primary" : "btn-outline"} btn-sm" id="lis-tog-hz">字 Chữ Hán</button>
            <button class="btn ${showTranslation ? "btn-primary" : "btn-outline"} btn-sm" id="lis-tog-tr">👁️ Bản dịch</button>
            <div class="tabs-bar" style="padding:3px;">
              ${[0.5, 0.75, 1.0, 1.25].map((spd) => `<button class="tab-pill ${playbackSpeed === spd ? "active" : ""}" style="padding:4px 9px;font-size:12px;" data-spd="${spd}">x${spd}</button>`).join("")}
            </div>
            <button class="btn btn-soft btn-sm" id="lis-play-all">▶️ Phát toàn bộ hội thoại</button>
          </div>
        </div>

        <div>
          ${lesson.lines.map((line, idx) => `
            <div class="dialogue-row ${playingIdx === idx ? "playing" : ""}" data-line-idx="${idx}">
              <div style="display:flex;align-items:flex-start;gap:12px;flex:1;">
                <span class="badge badge-blue" style="min-width:66px;justify-content:center;margin-top:3px;">🔊 ${QCore.escapeHtml(line.speaker)}</span>
                <div>
                  ${showPinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--primary);font-weight:600;">${QCore.escapeHtml(line.pinyin)}</div>` : ""}
                  <div class="hanzi-text" style="font-size:19px;font-weight:600;">${showHanzi ? QCore.escapeHtml(line.chinese) : "•••••••• (Bấm để nghe câu thoại)"}</div>
                </div>
              </div>
              <div style="flex:1;text-align:right;font-size:13.5px;color:var(--text-secondary);">
                ${showTranslation ? `<div>🇻🇳 <strong>${QCore.escapeHtml(line.vietnamese)}</strong></div><div style="font-size:12px;">🇬🇧 ${QCore.escapeHtml(line.english)}</div>` : `<span style="font-size:12px;color:var(--text-muted);">(Đang ẩn bản dịch để luyện nghe)</span>`}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px;">
        <div class="card">
          <h3 style="margin:0 0 12px;font-size:16.5px;">📝 Bài 1: Nghe hiểu & Chọn đáp án</h3>
          <p style="margin:0 0 10px;font-weight:600;">${QCore.escapeHtml(lesson.exercises.mcq.question)}</p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
            ${lesson.exercises.mcq.options.map((opt) => `<button class="btn btn-outline btn-sm" style="justify-content:flex-start;padding:10px 12px;" data-lis-mcq="${QCore.escapeHtml(opt)}">${QCore.escapeHtml(opt)}</button>`).join("")}
          </div>
          <div id="lis-mcq-fb" style="margin-bottom:16px;"></div>

          <hr style="border:none;border-top:1px solid var(--border-color);margin:14px 0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:16.5px;">✏️ Bài 2: Nghe & Điền từ còn thiếu</h3>
            <button class="btn btn-soft btn-sm" id="lis-fb-audio">🔊 Nghe câu</button>
          </div>
          <p class="hanzi-text" style="font-size:19px;font-weight:700;margin:6px 0;">${QCore.escapeHtml(lesson.exercises.fillBlank.before)}</p>
          <small style="color:var(--text-muted);display:block;margin-bottom:8px;">Gợi ý: ${QCore.escapeHtml(lesson.exercises.fillBlank.hint)}</small>
          <div style="display:flex;gap:8px;">
            <input class="input-field hanzi-text" id="lis-fb-inp" data-pinyin-ime="true" placeholder="Gõ Pinyin chọn chữ Hán cần điền...">
            <button class="btn btn-primary btn-sm" id="lis-fb-check">Kiểm tra</button>
          </div>
          <div id="lis-fb-res" style="margin-top:8px;"></div>
        </div>

        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:16.5px;">⌨️ Bài 3: Nghe chép chính tả</h3>
            <button class="btn btn-soft btn-sm" id="lis-dic-audio">🔊 Nghe câu đọc</button>
          </div>
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <input class="input-field hanzi-text" id="lis-dic-inp" data-pinyin-ime="true" placeholder="Gõ câu bạn nghe được...">
            <button class="btn btn-primary btn-sm" id="lis-dic-check">Chấm</button>
          </div>
          <div id="lis-dic-res" style="margin-bottom:16px;"></div>

          <hr style="border:none;border-top:1px solid var(--border-color);margin:14px 0;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:16.5px;">🧩 Bài 4: Nghe & Sắp xếp câu</h3>
            <button class="btn btn-soft btn-sm" id="lis-ord-audio">🔊 Nghe câu</button>
          </div>
          <div class="card-subtle hanzi-text" style="font-size:18px;font-weight:700;min-height:42px;margin-bottom:8px;">
            ${QCore.escapeHtml(reorderAttempt.join("")) || "Bấm vào các từ bên dưới theo đúng thứ tự nghe được..."}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            ${lesson.exercises.reorder.words.map((w) => `<button class="btn btn-outline btn-sm hanzi-text" style="font-size:16px;" data-lis-word="${QCore.escapeHtml(w)}">${QCore.escapeHtml(w)}</button>`).join("")}
            <button class="btn btn-danger btn-sm" id="lis-ord-clear">Xóa</button>
            <button class="btn btn-primary btn-sm" id="lis-ord-check">Kiểm tra & Hoàn thành</button>
          </div>
          <div id="lis-ord-res"></div>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <h3 style="margin:0;font-size:17px;">📚 Giải thích chi tiết Từ vựng, Bản dịch & Ngữ pháp sau bài nghe</h3>
          <button class="btn btn-outline btn-sm" id="lis-unlock-btn">${unlockedAnalysis || isCompleted ? "Đang mở chi tiết" : "🔓 Mở xem toàn bộ giải thích"}</button>
        </div>
        ${unlockedAnalysis || isCompleted ? `
          <div class="grid-2" style="margin-top:14px;">
            <div class="card-subtle">
              <strong>Từ vựng trọng tâm:</strong>
              <ul style="margin:8px 0 0;padding-left:18px;">
                ${lesson.vocabNotes.map((vn) => `<li><strong class="hanzi-text">${QCore.escapeHtml(vn.hz)}</strong> (${QCore.escapeHtml(vn.py)}): ${QCore.escapeHtml(vn.vi)}</li>`).join("")}
              </ul>
            </div>
            <div class="card-subtle">
              <strong>Điểm ngữ pháp & phát âm cần nhớ:</strong>
              <p style="margin:8px 0 0;font-size:13.5px;">${QCore.escapeHtml(lesson.grammarNotes)}</p>
            </div>
          </div>
        ` : `<p style="margin:10px 0 0;font-size:13.5px;color:var(--text-muted);">Hãy thử tự nghe và làm bài tập trước, sau đó bấm mở khóa hoặc hoàn thành Bài 4 để xem toàn bộ giải thích nhé!</p>`}
      </div>
    `;

    if (window.QPinyinIME) QPinyinIME.attachAll(container);
    container.querySelector("#lis-open-materials").onclick = () => window.QApp.navigate("materials", { category: "listening" });
    container.querySelectorAll("[data-lis-id]").forEach((b) => {
      b.onclick = () => {
        activeLessonId = b.getAttribute("data-lis-id");
        reorderAttempt = [];
        unlockedAnalysis = false;
        renderListening(container);
      };
    });
    container.querySelector("#lis-tog-py").onclick = () => { showPinyin = !showPinyin; renderListening(container); };
    container.querySelector("#lis-tog-hz").onclick = () => { showHanzi = !showHanzi; renderListening(container); };
    container.querySelector("#lis-tog-tr").onclick = () => { showTranslation = !showTranslation; renderListening(container); };
    container.querySelectorAll("[data-spd]").forEach((b) => {
      b.onclick = () => { playbackSpeed = Number(b.getAttribute("data-spd")); renderListening(container); };
    });
    container.querySelectorAll("[data-line-idx]").forEach((row) => {
      row.onclick = () => {
        const idx = Number(row.getAttribute("data-line-idx"));
        playingIdx = idx;
        renderListening(container);
        QCore.speakChinese(lesson.lines[idx].chinese, { rate: playbackSpeed, onEnd: () => { playingIdx = -1; } });
      };
    });
    container.querySelector("#lis-play-all").onclick = () => {
      let i = 0;
      const playNext = () => {
        if (i >= lesson.lines.length) { playingIdx = -1; renderListening(container); return; }
        playingIdx = i;
        renderListening(container);
        QCore.speakChinese(lesson.lines[i].chinese, { rate: playbackSpeed, onEnd: () => { i += 1; setTimeout(playNext, 350); } });
      };
      playNext();
    };
    container.querySelectorAll("[data-lis-mcq]").forEach((b) => {
      b.onclick = () => {
        const ok = b.getAttribute("data-lis-mcq") === lesson.exercises.mcq.answer;
        QCore.updateSkillScore("listening", ok ? 90 : 55);
        container.querySelector("#lis-mcq-fb").innerHTML = ok
          ? `<span style="color:var(--primary);font-weight:700;">✅ Chính xác!</span>`
          : `<span style="color:var(--accent-red);">❌ Chưa đúng. Đáp án là: ${QCore.escapeHtml(lesson.exercises.mcq.answer)}</span>`;
      };
    });
    container.querySelector("#lis-fb-audio").onclick = () => QCore.speakChinese(lesson.exercises.fillBlank.audioText, { rate: playbackSpeed });
    container.querySelector("#lis-fb-check").onclick = () => {
      const val = container.querySelector("#lis-fb-inp").value.trim();
      const ok = val === lesson.exercises.fillBlank.answer;
      QCore.updateSkillScore("listening", ok ? 92 : 60);
      container.querySelector("#lis-fb-res").innerHTML = ok
        ? `<span style="color:var(--primary);font-weight:700;">✅ Tuyệt vời!</span>`
        : `<span style="color:var(--accent-amber);">Đáp án chuẩn là: <strong>${QCore.escapeHtml(lesson.exercises.fillBlank.answer)}</strong></span>`;
    };
    container.querySelector("#lis-dic-audio").onclick = () => QCore.speakChinese(lesson.exercises.dictation.audioText, { rate: playbackSpeed });
    container.querySelector("#lis-dic-check").onclick = () => {
      const val = container.querySelector("#lis-dic-inp").value.trim().replace(/[。！？.!?]/g, "");
      const exp = lesson.exercises.dictation.answer.replace(/[。！？.!?]/g, "");
      const ok = val === exp;
      QCore.updateSkillScore("listening", ok ? 95 : 65);
      container.querySelector("#lis-dic-res").innerHTML = ok
        ? `<span style="color:var(--primary);font-weight:700;">✅ Chính xác tuyệt đối!</span>`
        : `<span style="color:var(--accent-amber);">Câu chuẩn: <strong>${QCore.escapeHtml(lesson.exercises.dictation.answer)}</strong></span>`;
    };
    container.querySelector("#lis-ord-audio").onclick = () => QCore.speakChinese(lesson.exercises.reorder.audioText, { rate: playbackSpeed });
    container.querySelectorAll("[data-lis-word]").forEach((b) => {
      b.onclick = () => { reorderAttempt.push(b.getAttribute("data-lis-word")); renderListening(container); };
    });
    container.querySelector("#lis-ord-clear").onclick = () => { reorderAttempt = []; renderListening(container); };
    container.querySelector("#lis-ord-check").onclick = () => {
      const ok = reorderAttempt.join("") === lesson.exercises.reorder.answer;
      if (ok) {
        if (!st.listeningCompleted.includes(lesson.id)) {
          st.listeningCompleted.push(lesson.id);
          QCore.logDailyActivity("listeningCount", 1);
        }
        unlockedAnalysis = true;
        showTranslation = true;
        QCore.updateSkillScore("listening", 95);
        QCore.saveState(true);
        QCore.showToast("🎉 Hoàn thành bài Luyện nghe!");
        renderListening(container);
      } else {
        container.querySelector("#lis-ord-res").innerHTML = `<span style="color:var(--accent-red);">Câu chuẩn là: <strong>${QCore.escapeHtml(lesson.exercises.reorder.answer)}</strong></span>`;
      }
    };
    container.querySelector("#lis-unlock-btn").onclick = () => { unlockedAnalysis = true; showTranslation = true; renderListening(container); };
  }

  /* ---------- PERSONAL MATERIAL LISTENING STUDIO (MP3/WAV/VIDEO + A-B LOOP + DICTATION) ---------- */
  function renderMaterialListeningStudio(container, mat) {
    const isVideo = mat.mediaType && mat.mediaType.startsWith("video/");
    const transcript = mat.transcript || mat.content || "";
    const sentences = transcript.split(/[。！？\n]+/).map((s) => s.trim()).filter(Boolean);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <span class="badge badge-blue">📁 TÀI LIỆU CÁ NHÂN · HSK ${mat.hskLevel}</span>
          <h2 style="margin:6px 0 4px;">🎧 ${QCore.escapeHtml(mat.title)}</h2>
          <p>Nguồn: ${QCore.escapeHtml(mat.source)} · Hỗ trợ tốc độ 0.5x–1.5x, lặp đoạn A–B, ẩn/hiện transcript và chấm bài nghe.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" id="mlis-back-std">← Về bài nghe chuẩn HSK</button>
          <button class="btn btn-soft btn-sm" id="mlis-back-lib">📁 Về Kho tài liệu</button>
        </div>
      </div>

      <div class="card" style="margin-bottom:18px;">
        ${mat.mediaUrl ? (isVideo
          ? `<video id="mlis-player" controls src="${QCore.escapeHtml(mat.mediaUrl)}" style="width:100%;max-height:360px;border-radius:12px;background:#000;"></video>`
          : `<audio id="mlis-player" controls src="${QCore.escapeHtml(mat.mediaUrl)}" style="width:100%;"></audio>`)
          : `<div class="card-subtle" style="margin-bottom:10px;">Tài liệu này chưa có file audio đính kèm — bạn có thể bấm nút bên dưới để đọc toàn bộ nội dung bằng giọng chuẩn Putonghua (TTS):
               <div style="margin-top:8px;"><button class="btn btn-primary btn-sm" id="mlis-tts-play">🔊 Đọc bằng giọng Putonghua</button></div>
             </div>`}

        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px;">
          <strong style="font-size:13px;color:var(--text-muted);">Tốc độ:</strong>
          ${[0.5, 0.75, 1.0, 1.25, 1.5].map((s) => `<button class="btn ${playbackSpeed === s ? "btn-primary" : "btn-outline"} btn-sm" data-mspd="${s}">x${s}</button>`).join("")}
          ${mat.mediaUrl ? `
            <button class="btn btn-outline btn-sm" id="mlis-set-a">📍 Điểm A (${loopA != null ? loopA.toFixed(1) + "s" : "—"})</button>
            <button class="btn btn-outline btn-sm" id="mlis-set-b">📍 Điểm B (${loopB != null ? loopB.toFixed(1) + "s" : "—"})</button>
            <button class="btn btn-outline btn-sm" id="mlis-clear-ab">✕ Tắt lặp A-B</button>
          ` : ""}
          <button class="btn ${showMatTranscript ? "btn-primary" : "btn-soft"} btn-sm" id="mlis-tog-tr">👁️ ${showMatTranscript ? "Ẩn Transcript" : "Hiện Transcript"}</button>
        </div>

        ${showMatTranscript ? `
          <div class="card-subtle" style="margin-top:14px;">
            <strong>📝 Nội dung Transcript gốc:</strong>
            <div class="hanzi-text" style="font-size:17px;line-height:1.9;margin-top:6px;white-space:pre-wrap;">${QCore.escapeHtml(transcript || "(Chưa nhập transcript — bạn có thể cập nhật trong Kho tài liệu)")}</div>
            ${sentences.length ? `<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;">${sentences.slice(0, 8).map((s, idx) => `<button class="btn btn-outline btn-sm" data-speak="${QCore.escapeHtml(s)}">🔊 Câu ${idx + 1}</button>`).join("")}</div>` : ""}
          </div>
        ` : ""}
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 style="margin:0 0 8px;">⌨️ Nghe chép chính tả / Tóm tắt nội dung</h3>
          <p style="font-size:13px;color:var(--text-secondary);margin:0 0 10px;">Nghe kỹ bài nghe và chép lại những câu nghe được (hoặc tóm tắt bằng tiếng Trung Giản thể):</p>
          <textarea class="textarea-field hanzi-text" id="mlis-dictation" rows="5" data-pinyin-ime="true" placeholder="Nhập câu bạn nghe được..."></textarea>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="mlis-grade-btn">✅ Chấm điểm & Lưu tiến độ</button>
          </div>
          <div id="mlis-grade-out" style="margin-top:12px;"></div>
        </div>

        <div class="card">
          <h3 style="margin:0 0 8px;">📊 Lịch sử luyện nghe tài liệu này</h3>
          ${(mat.history || []).length ? mat.history.slice(0, 5).map((h) => `
            <div class="card-subtle" style="margin-bottom:8px;font-size:13px;">
              <strong>${QCore.escapeHtml(h.mode || "Luyện nghe")}</strong> · Điểm: <strong>${h.score != null ? h.score + "/100" : "—"}</strong>
              <div style="font-size:11.5px;color:var(--text-muted);">${new Date(h.date).toLocaleString("vi-VN")}</div>
            </div>
          `).join("") : `<div class="card-subtle" style="font-size:13px;color:var(--text-muted);">Chưa có lượt làm bài nào. Hoàn thành chép chính tả/tóm tắt bên trái để lưu kết quả!</div>`}
        </div>
      </div>
    `;

    if (window.QPinyinIME) QPinyinIME.attachAll(container);
    bindSpeakBtns(container);

    const player = container.querySelector("#mlis-player");
    if (player) {
      player.playbackRate = playbackSpeed;
      player.ontimeupdate = () => {
        if (loopA != null && loopB != null && loopB > loopA && player.currentTime >= loopB) {
          player.currentTime = loopA;
        }
      };
      container.querySelector("#mlis-set-a").onclick = () => { loopA = player.currentTime; renderMaterialListeningStudio(container, mat); };
      container.querySelector("#mlis-set-b").onclick = () => { loopB = player.currentTime; renderMaterialListeningStudio(container, mat); };
      container.querySelector("#mlis-clear-ab").onclick = () => { loopA = null; loopB = null; renderMaterialListeningStudio(container, mat); };
    }
    const ttsBtn = container.querySelector("#mlis-tts-play");
    if (ttsBtn) ttsBtn.onclick = () => QCore.speakChinese(transcript || mat.title, { rate: playbackSpeed });

    container.querySelectorAll("[data-mspd]").forEach((b) => {
      b.onclick = () => {
        playbackSpeed = Number(b.getAttribute("data-mspd"));
        if (player) player.playbackRate = playbackSpeed;
        renderMaterialListeningStudio(container, mat);
      };
    });
    container.querySelector("#mlis-tog-tr").onclick = () => { showMatTranscript = !showMatTranscript; renderMaterialListeningStudio(container, mat); };
    container.querySelector("#mlis-back-std").onclick = () => { activeMaterialId = null; renderListening(container); };
    container.querySelector("#mlis-back-lib").onclick = () => window.QApp.navigate("materials");

    container.querySelector("#mlis-grade-btn").onclick = () => {
      const ans = (container.querySelector("#mlis-dictation").value || "").trim();
      if (!ans) { QCore.showToast("Hãy nhập nội dung bạn nghe được trước nhé!"); return; }
      const out = container.querySelector("#mlis-grade-out");
      if (transcript) {
        const normA = ans.replace(/[^\u4e00-\u9fff]/g, "");
        const normT = transcript.replace(/[^\u4e00-\u9fff]/g, "");
        if (normT.length > 0) {
          const setT = new Set(normT.split(""));
          const matched = normA.split("").filter((c) => setT.has(c)).length;
          const coverage = Math.min(100, Math.round((matched / Math.max(normT.length, 1)) * 100));
          const score = Math.max(25, coverage);
          QCore.recordMaterialPractice(mat.id, { mode: "Nghe chép chính tả", score, answer: ans, status: score >= 70 ? "completed" : "in_progress" });
          QCore.logDailyActivity("listeningCount", 1);
          QCore.updateSkillScore("listening", score);
          out.innerHTML = `<div class="card-subtle" style="border-color:var(--primary);"><strong>📊 Mức độ khớp chữ Hán so với Transcript gốc: ${score}/100</strong><p style="margin:6px 0 0;font-size:13px;">Bấm "Hiện Transcript" ở trên để đối chiếu từng câu nhé!</p></div>`;
          return;
        }
      }
      QCore.recordMaterialPractice(mat.id, { mode: "Ghi chép bài nghe", score: null, answer: ans, status: "in_progress" });
      QCore.logDailyActivity("listeningCount", 1);
      out.innerHTML = `<div class="card-subtle">✅ Đã lưu bản ghi chép bài nghe của bạn! (Tài liệu chưa có transcript gốc nên hệ thống không tự bịa điểm số).</div>`;
    };
  }

  return {
    renderPinyin,
    renderListening
  };
})();
