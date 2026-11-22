/* -*- coding: utf-8 -*-
 * QChinese – Verified HSK 2.0 (1–6) & HSK 3.0 (1–6 & 7–9) Vocabulary Store
 * Lazily loads compact JSON shards from public/data/vocab/{hsk2|hsk3}/L*.json,
 * merges legacy curated QCHINESE_VOCAB & user customVocab without losing SRS IDs.
 */

window.QVocabStore = (function () {
  let manifest = null;
  const shardCache = {}; // key: "hsk2:1" -> normalized word array
  const hanziIndex = new Map(); // hanzi -> normalized word (for instant lookup / reading segmentation)
  let initialized = false;

  const TONE_MAP = {
    ā: "a", á: "a", ǎ: "a", à: "a",
    ē: "e", é: "e", ě: "e", è: "e",
    ī: "i", í: "i", ǐ: "i", ì: "i",
    ō: "o", ó: "o", ǒ: "o", ò: "o",
    ū: "u", ú: "u", ǔ: "u", ù: "u",
    ǖ: "u", ǘ: "u", ǚ: "u", ǜ: "u", ü: "u"
  };

  const POS_LABEL_MAP = {
    noun: "Danh từ",
    verb: "Động từ",
    adj: "Tính từ",
    pron: "Đại từ",
    adv: "Phó từ",
    prep: "Giới từ",
    conj: "Liên từ",
    measure: "Lượng từ",
    particle: "Trợ từ",
    numeral: "Số từ",
    other: "Khác"
  };

  const TOPIC_ICON_MAP = {
    greeting: "👋", family: "👨‍👩‍👧", school: "🎓", work: "💼", time: "⏰",
    numbers: "🔢", food: "🍜", shopping: "🛍️", travel: "✈️", transport: "🚆",
    health: "🩺", emotion: "😊", weather: "🌤️", tech: "💻", society: "🏙️",
    culture: "🎭", economy: "📈", politics: "🏛️", environment: "🌿", other: "📌"
  };

  function stripTone(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, (ch) => TONE_MAP[ch] || ch)
      .replace(/\s+/g, " ")
      .trim();
  }

  function stripDiacritics(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  function normalizeRow(raw, version, level) {
    const legacyById = (window.QCHINESE_VOCAB || []).find((w) => w.id === raw.id || w.hanzi === raw.h);
    const posList = Array.isArray(raw.pos) ? raw.pos : ["other"];
    const posLabel = legacyById
      ? legacyById.part_of_speech
      : posList.map((k) => POS_LABEL_MAP[k] || k).join(" / ");
    const py = raw.p || "";
    const pyPlain = stripTone(py).replace(/\s+/g, "");
    const viList = Array.isArray(raw.vi) ? raw.vi : legacyById ? legacyById.meanings.vietnamese : [];
    const enList = Array.isArray(raw.e) ? raw.e : legacyById ? legacyById.meanings.english : [];

    const word = {
      id: raw.id,
      hanzi: raw.h,
      traditional: raw.t || "",
      pinyin: py,
      pinyin_number: raw.n || "",
      pinyin_plain: pyPlain,
      hsk_version: version,
      hsk_level: Number(level),
      topic: raw.c || "other",
      pos: posList,
      part_of_speech: posLabel,
      han_viet: raw.hv || "",
      radical: raw.r || "",
      classifiers: raw.cl || [],
      alt_forms: raw.alt || [],
      frequency: raw.f || 99999,
      curated: Boolean(raw.cur || raw.man || legacyById),
      vietnamese_pronunciation_hint: raw.vh || (legacyById && legacyById.vietnamese_pronunciation_hint) || "",
      confused_with: raw.cf || (legacyById && legacyById.confused_with) || "",
      meanings: {
        vietnamese: viList,
        english: enList,
        chinese: legacyById ? legacyById.meanings.chinese : []
      },
      senses: legacyById ? legacyById.senses : [],
      examples: Array.isArray(raw.ex) && raw.ex.length ? raw.ex : (legacyById && legacyById.examples) || [],
      _searchKey: [
        raw.h,
        raw.t || "",
        py.toLowerCase(),
        pyPlain,
        (raw.n || "").toLowerCase().replace(/\s+/g, ""),
        stripDiacritics(viList.join(" ")),
        enList.join(" ").toLowerCase(),
        stripDiacritics(raw.hv || "")
      ].join(" | ")
    };

    if (!hanziIndex.has(word.hanzi) || word.curated) {
      hanziIndex.set(word.hanzi, word);
    }
    return word;
  }

  function seedLegacyIndex() {
    (window.QCHINESE_VOCAB || []).forEach((w) => {
      if (!hanziIndex.has(w.hanzi)) {
        hanziIndex.set(w.hanzi, {
          id: w.id,
          hanzi: w.hanzi,
          traditional: "",
          pinyin: w.pinyin,
          pinyin_number: w.pinyin_number || "",
          pinyin_plain: (w.pinyin_plain || stripTone(w.pinyin)).replace(/\s+/g, ""),
          hsk_version: "hsk2",
          hsk_level: w.hsk_level,
          topic: w.topic || "other",
          pos: ["other"],
          part_of_speech: w.part_of_speech || "",
          han_viet: "",
          curated: true,
          vietnamese_pronunciation_hint: w.vietnamese_pronunciation_hint || "",
          confused_with: w.confused_with || "",
          meanings: w.meanings,
          senses: w.senses || [],
          examples: w.examples || []
        });
      }
    });
  }

  async function init() {
    seedLegacyIndex();
    if (initialized && manifest) return manifest;
    try {
      const res = await fetch("data/vocab/manifest.json");
      if (res.ok) {
        manifest = await res.json();
        initialized = true;
      }
    } catch (_) {}
    // Preload HSK 2.0 L1 & L2 in background for instant search & reading lookup
    loadLevel("hsk2", 1).catch(() => {});
    loadLevel("hsk2", 2).catch(() => {});
    return manifest;
  }

  async function loadLevel(version, level) {
    const key = `${version}:${level}`;
    if (shardCache[key]) return shardCache[key];
    try {
      const res = await fetch(`data/vocab/${version}/L${level}.json`);
      if (!res.ok) return [];
      const rows = await res.json();
      const list = rows.map((r) => normalizeRow(r, version, level));
      shardCache[key] = list;
      return list;
    } catch (_) {
      return [];
    }
  }

  async function loadLevels(version, levels) {
    const arr = await Promise.all(levels.map((l) => loadLevel(version, l)));
    return arr.flat();
  }

  function getCustomWords() {
    const st = window.QCore && QCore.getState();
    if (!st || !Array.isArray(st.customVocab)) return [];
    return st.customVocab.map((w) =>
      Object.assign({}, w, {
        _searchKey: [
          w.hanzi,
          w.traditional || "",
          (w.pinyin || "").toLowerCase(),
          stripTone(w.pinyin || "").replace(/\s+/g, ""),
          stripDiacritics((w.meanings && w.meanings.vietnamese ? w.meanings.vietnamese : []).join(" ")),
          (w.meanings && w.meanings.english ? w.meanings.english : []).join(" ").toLowerCase(),
          stripDiacritics(w.han_viet || "")
        ].join(" | ")
      })
    );
  }

  function filterWords(words, opts = {}) {
    const st = window.QCore && QCore.getState();
    const srs = (st && st.srs) || {};
    const favs = new Set((st && st.favoriteVocab) || []);
    const now = Date.now();
    const qRaw = String(opts.query || "").trim();
    const qNorm = stripDiacritics(qRaw);
    const qCompact = stripTone(qRaw).replace(/\s+/g, "");

    return words.filter((w) => {
      if (opts.level && opts.level !== "all" && Number(w.hsk_level) !== Number(opts.level)) return false;
      if (opts.topic && opts.topic !== "all" && w.topic !== opts.topic) return false;
      if (opts.pos && opts.pos !== "all" && !(w.pos || []).includes(opts.pos)) return false;

      if (opts.status && opts.status !== "all") {
        const rec = srs[w.id];
        if (opts.status === "new" && rec) return false;
        if (opts.status === "learning" && (!rec || rec.reps >= 3)) return false;
        if (opts.status === "due" && (!rec || rec.nextReview > now)) return false;
        if (opts.status === "mastered" && (!rec || rec.reps < 3 || rec.lastQuality < 4)) return false;
        if (opts.status === "lapses" && (!rec || (rec.lapses || 0) < 1)) return false;
        if (opts.status === "favorite" && !favs.has(w.id)) return false;
      }

      if (qRaw) {
        const key = w._searchKey || "";
        if (!key.includes(qRaw.toLowerCase()) && !key.includes(qNorm) && (!qCompact || !key.includes(qCompact))) {
          return false;
        }
      }
      return true;
    });
  }

  function lookupHanzi(text) {
    const clean = String(text || "").trim();
    if (!clean) return null;
    if (hanziIndex.has(clean)) return hanziIndex.get(clean);
    const st = window.QCore && QCore.getState();
    const custom = (st && st.customVocab || []).find((w) => w.hanzi === clean);
    if (custom) return custom;
    return null;
  }

  /* Maximum-matching Chinese word segmenter using all loaded dictionary entries (LWT-style Reading!) */
  function segmentChineseText(text) {
    const tokens = [];
    const str = String(text || "");
    let i = 0;
    while (i < str.length) {
      const ch = str[i];
      if (!/[\u4e00-\u9fff]/.test(ch)) {
        tokens.push({ text: ch, isHanzi: false, entry: null });
        i += 1;
        continue;
      }
      let matched = null;
      let matchLen = 1;
      for (let len = Math.min(4, str.length - i); len >= 1; len--) {
        const sub = str.slice(i, i + len);
        if (hanziIndex.has(sub)) {
          matched = hanziIndex.get(sub);
          matchLen = len;
          break;
        }
      }
      const subText = str.slice(i, i + matchLen);
      tokens.push({ text: subText, isHanzi: true, entry: matched });
      i += matchLen;
    }
    return tokens;
  }

  function searchLoaded(query, limit = 10) {
    const qRaw = String(query || "").trim();
    if (!qRaw) return [];
    const qNorm = stripDiacritics(qRaw);
    const qCompact = stripTone(qRaw).replace(/\s+/g, "");
    const results = [];
    for (const w of hanziIndex.values()) {
      const key = w._searchKey || [w.hanzi, w.pinyin, w.pinyin_plain].join(" ").toLowerCase();
      if (w.hanzi === qRaw || w.pinyin_plain === qCompact) {
        results.unshift(w);
      } else if (key.includes(qRaw.toLowerCase()) || key.includes(qNorm) || (qCompact && key.includes(qCompact))) {
        results.push(w);
      }
      if (results.length >= limit * 3) break;
    }
    return results.slice(0, limit);
  }

  function getDisplayMeaning(w) {
    if (!w || !w.meanings) return "";
    if (w.meanings.vietnamese && w.meanings.vietnamese.length) {
      return w.meanings.vietnamese.join("; ");
    }
    if (w.meanings.english && w.meanings.english.length) {
      return w.meanings.english.slice(0, 3).join("; ");
    }
    return "";
  }

  return {
    init,
    loadLevel,
    loadLevels,
    getManifest: () => manifest,
    getCustomWords,
    filterWords,
    lookupHanzi,
    segmentChineseText,
    searchLoaded,
    getDisplayMeaning,
    stripTone,
    stripDiacritics,
    POS_LABEL_MAP,
    TOPIC_ICON_MAP
  };
})();
