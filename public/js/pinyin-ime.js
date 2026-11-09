/* -*- coding: utf-8 -*-
 * QChinese – Smart Pinyin-to-Hanzi Live Candidate Bar (IME & Pinyin Word Suggester)
 * When learner types Pinyin (e.g. "ni", "nihao", "xihuan", "lvyou", "ni3"), suggests matching
 * Simplified Chinese words + tone-marked Pinyin + Vietnamese meaning!
 */

window.QPinyinIME = (function () {
  let lexicon = [];
  let barEl = null;
  let activeInput = null;
  let currentMatches = [];
  let currentTokenRange = null;

  function stripTones(py) {
    if (!py) return "";
    return py
      .toLowerCase()
      .replace(/[āáǎà]/g, "a")
      .replace(/[ēéěè]/g, "e")
      .replace(/[īíǐì]/g, "i")
      .replace(/[ōóǒò]/g, "o")
      .replace(/[ūúǔù]/g, "u")
      .replace(/[ǖǘǚǜü]/g, "v")
      .replace(/[^a-zv0-9]/g, "");
  }

  function buildLexicon() {
    const map = new Map();

    const addEntry = (hanzi, pinyin, numPy, vi, priority = 1) => {
      if (!hanzi || !pinyin) return;
      const key = `${hanzi}|${pinyin.toLowerCase()}`;
      if (map.has(key)) return;
      const plain = stripTones(pinyin);
      const plainU = plain.replace(/v/g, "u");
      map.set(key, {
        hanzi,
        pinyin,
        numPy: (numPy || "").toLowerCase().replace(/\s+/g, ""),
        plain,
        plainU,
        vi: vi || "",
        priority
      });
    };

    (window.QCHINESE_VOCAB || []).forEach((v) => {
      addEntry(v.hanzi, v.pinyin, v.pinyin_number, v.meanings.vietnamese[0], 3);
    });

    (window.QCHINESE_HANZI_LIST || []).forEach((h) => {
      addEntry(h.hanzi, h.pinyin, h.pinyin_number, h.meanings.vietnamese.split(/[;,.]/)[0], 3);
    });

    (window.PINYIN_IME_EXTRAS || []).forEach((e) => {
      addEntry(e.hanzi, e.pinyin, "", e.vi, 2);
    });

    lexicon = Array.from(map.values());
  }

  function searchByPinyin(rawToken, limit = 8) {
    if (!lexicon.length) buildLexicon();
    const q = String(rawToken || "").trim().toLowerCase().replace(/ü/g, "v");
    if (!q) return [];
    const qNoDigits = q.replace(/[1-5]/g, "");
    if (!qNoDigits) return [];

    const scored = [];
    for (const item of lexicon) {
      let score = 0;
      if (/[1-5]/.test(q) && item.numPy) {
        if (item.numPy === q) score = 120;
        else if (item.numPy.startsWith(q)) score = 85;
      }
      if (score === 0) {
        if (item.plain === qNoDigits || item.plainU === qNoDigits) {
          score = 100 + item.priority * 4 - item.hanzi.length;
        } else if (item.plain.startsWith(qNoDigits) || item.plainU.startsWith(qNoDigits)) {
          score = 65 + item.priority * 3 - (item.plain.length - qNoDigits.length);
        }
      }
      if (score > 0) {
        scored.push({ item, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.item);
  }

  function ensureBar() {
    if (barEl) return barEl;
    barEl = document.createElement("div");
    barEl.id = "pinyin-ime-bar";
    barEl.className = "pinyin-ime-bar";
    document.body.appendChild(barEl);

    document.addEventListener("mousedown", (e) => {
      if (barEl && !barEl.contains(e.target) && e.target !== activeInput) {
        hideBar();
      }
    });
    return barEl;
  }

  function hideBar() {
    if (barEl) barEl.classList.remove("visible");
    currentMatches = [];
    currentTokenRange = null;
  }

  function extractTrailingPinyinToken(val, cursorPos) {
    const before = val.slice(0, cursorPos);
    const m = before.match(/([a-zA-ZüÜ]+[1-5]?)$/);
    if (!m) return null;
    return {
      token: m[1],
      start: cursorPos - m[1].length,
      end: cursorPos
    };
  }

  function applyCandidate(idx) {
    if (!activeInput || !currentMatches[idx] || !currentTokenRange) return;
    const chosen = currentMatches[idx];
    const mode = activeInput.getAttribute("data-pinyin-mode") || "hanzi";
    const insertText = mode === "pinyin-only" ? chosen.pinyin : chosen.hanzi;

    const val = activeInput.value;
    const nextVal = val.slice(0, currentTokenRange.start) + insertText + val.slice(currentTokenRange.end);
    activeInput.value = nextVal;
    const newPos = currentTokenRange.start + insertText.length;
    activeInput.focus();
    try {
      activeInput.setSelectionRange(newPos, newPos);
    } catch (_) {}

    activeInput.dispatchEvent(new Event("input", { bubbles: true }));
    hideBar();
  }

  function positionBar(inputEl) {
    const rect = inputEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    barEl.style.left = `${Math.max(10, Math.min(rect.left, window.innerWidth - 360))}px`;
    if (spaceBelow < 130 && rect.top > 140) {
      barEl.style.top = `${Math.max(8, rect.top - 108)}px`;
    } else {
      barEl.style.top = `${rect.bottom + 6}px`;
    }
  }

  function handleInputEvent(e) {
    const st = window.QCore ? window.QCore.getState() : null;
    if (st && st.profile && st.profile.enablePinyinIme === false) {
      hideBar();
      return;
    }

    const el = e.target;
    if (!el || el.getAttribute("data-pinyin-ime") !== "true") return;
    activeInput = el;

    const pos = typeof el.selectionStart === "number" ? el.selectionStart : el.value.length;
    const tok = extractTrailingPinyinToken(el.value, pos);
    if (!tok || tok.token.length < 1) {
      hideBar();
      return;
    }

    const matches = searchByPinyin(tok.token, 8);
    if (!matches.length) {
      hideBar();
      return;
    }

    currentMatches = matches;
    currentTokenRange = tok;
    const bar = ensureBar();
    const mode = el.getAttribute("data-pinyin-mode") || "hanzi";

    bar.innerHTML = `
      <div class="ime-header">
        <span>✨ Gợi ý từ Pinyin <strong>"${QCore.escapeHtml(tok.token)}"</strong> (${mode === "pinyin-only" ? "bấm để điền dấu Pinyin chuẩn + xem chữ Hán" : "bấm hoặc nhấn Tab để chọn chữ Hán Giản thể"})</span>
        <button type="button" class="btn btn-sm" style="padding:1px 7px;font-size:11px;" id="ime-close-btn">✕</button>
      </div>
      <div class="ime-candidates">
        ${matches
          .map(
            (m, i) => `
          <button type="button" class="ime-chip ${i === 0 ? "first" : ""}" data-ime-idx="${i}">
            <span style="font-size:11px;color:var(--text-muted);">${i + 1}.</span>
            <span class="ime-hz">${QCore.escapeHtml(m.hanzi)}</span>
            <span class="ime-py">${QCore.escapeHtml(m.pinyin)}</span>
            <span class="ime-vi">${QCore.escapeHtml(m.vi)}</span>
          </button>
        `
          )
          .join("")}
      </div>
    `;

    positionBar(el);
    bar.classList.add("visible");

    const closeBtn = bar.querySelector("#ime-close-btn");
    if (closeBtn) closeBtn.onclick = hideBar;
    bar.querySelectorAll("[data-ime-idx]").forEach((btn) => {
      btn.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        applyCandidate(Number(btn.getAttribute("data-ime-idx")));
      });
    });
  }

  function handleKeyDown(e) {
    if (!barEl || !barEl.classList.contains("visible") || e.target !== activeInput) return;
    if (e.key === "Tab") {
      e.preventDefault();
      applyCandidate(0);
    } else if (e.key === "Escape") {
      hideBar();
    } else if (e.altKey && /^[1-8]$/.test(e.key)) {
      e.preventDefault();
      applyCandidate(Number(e.key) - 1);
    }
  }

  function initGlobalListeners() {
    buildLexicon();
    document.addEventListener("input", handleInputEvent);
    document.addEventListener("keydown", handleKeyDown);
  }

  return {
    initGlobalListeners,
    searchByPinyin,
    stripTones,
    hideBar
  };
})();
