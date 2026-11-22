/* -*- coding: utf-8 -*-
 * QChinese – Core Engine: Multi-User Auth, Synced State, Putonghua Audio, Voice Recorder, SRS (SM-2) & Utilities
 */

window.QCore = (function () {
  let currentUser = null;
  let appState = null;
  let syncTimer = null;
  let activeAudio = null;
  let studyInterval = null;
  let serverHealth = { ok: false, aiConfigured: false, aiProvider: "pedagogical-engine" };

  function todayStr() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function createDefaultState(name = "Học viên") {
    const today = todayStr();
    return {
      version: 1,
      profile: {
        name: name,
        levelLabel: "Người mới bắt đầu",
        hskLevel: 1,
        unlockedHsk: 1,
        placementCompleted: false,
        lastTestScore: null,
        streakDays: 1,
        lastActiveDate: today,
        totalStudyMinutes: 0,
        theme: "light",
        showVietnameseHint: true,
        showPinyinDefault: true,
        enablePinyinIme: true,
        vocabVersion: "hsk2",
        audioSpeed: 1.0,
        dailyGoalMinutes: 30,
        dailyTargets: {
          newWords: 10,
          reviewWords: 15,
          grammarCount: 2,
          listeningCount: 1,
          hanziWriteCount: 5,
          speakingMinutes: 5
        }
      },
      srs: {},
      hanziProgress: {},
      grammarCompleted: [],
      listeningCompleted: [],
      readingCompleted: [],
      readingNotes: {},
      markedWords: [],
      customHanzi: [],
      favoriteVocab: [],
      customVocab: [],
      vocabSubSkills: {},
      phoneticErrors: {},
      pronunciationSessions: 0,
      materials: [],
      aiHistory: [],
      writingSubmissions: [],
      speakingSessions: 0,
      skillScores: {
        pinyin: 0,
        vocab: 0,
        hanzi: 0,
        grammar: 0,
        listening: 0,
        speaking: 0,
        reading: 0,
        writing: 0
      },
      placementReport: null,
      testHistory: [],
      notebook: [],
      dailyLogs: {
        [today]: {
          minutes: 0,
          newWords: 0,
          reviewWords: 0,
          grammarCount: 0,
          listeningCount: 0,
          hanziWriteCount: 0,
          speakingMinutes: 0
        }
      }
    };
  }

  function ensureStateIntegrity(st, fallbackName) {
    const def = createDefaultState(fallbackName);
    if (!st || typeof st !== "object") return def;
    st.profile = Object.assign({}, def.profile, st.profile || {});
    st.profile.dailyTargets = Object.assign({}, def.profile.dailyTargets, (st.profile && st.profile.dailyTargets) || {});
    st.srs = st.srs || {};
    st.hanziProgress = st.hanziProgress || {};
    st.grammarCompleted = Array.isArray(st.grammarCompleted) ? st.grammarCompleted : [];
    st.listeningCompleted = Array.isArray(st.listeningCompleted) ? st.listeningCompleted : [];
    st.readingCompleted = Array.isArray(st.readingCompleted) ? st.readingCompleted : [];
    st.readingNotes = st.readingNotes || {};
    st.markedWords = Array.isArray(st.markedWords) ? st.markedWords : [];
    st.customHanzi = Array.isArray(st.customHanzi) ? st.customHanzi : [];
    st.favoriteVocab = Array.isArray(st.favoriteVocab) ? st.favoriteVocab : [];
    st.customVocab = Array.isArray(st.customVocab) ? st.customVocab : [];
    st.vocabSubSkills = st.vocabSubSkills && typeof st.vocabSubSkills === "object" ? st.vocabSubSkills : {};
    st.phoneticErrors = st.phoneticErrors && typeof st.phoneticErrors === "object" ? st.phoneticErrors : {};
    st.pronunciationSessions = Number(st.pronunciationSessions || 0);
    st.materials = Array.isArray(st.materials) ? st.materials : [];
    st.aiHistory = Array.isArray(st.aiHistory) ? st.aiHistory : [];
    st.writingSubmissions = Array.isArray(st.writingSubmissions) ? st.writingSubmissions : [];
    st.skillScores = Object.assign({}, def.skillScores, st.skillScores || {});
    st.testHistory = Array.isArray(st.testHistory) ? st.testHistory : [];
    st.notebook = Array.isArray(st.notebook) ? st.notebook : [];
    st.dailyLogs = st.dailyLogs || {};

    const today = todayStr();
    if (!st.dailyLogs[today]) {
      st.dailyLogs[today] = {
        minutes: 0,
        newWords: 0,
        reviewWords: 0,
        grammarCount: 0,
        listeningCount: 0,
        hanziWriteCount: 0,
        speakingMinutes: 0
      };
    }

    // Update streak accurately by calendar days
    if (st.profile.lastActiveDate && st.profile.lastActiveDate !== today) {
      const prev = new Date(st.profile.lastActiveDate + "T00:00:00");
      const curr = new Date(today + "T00:00:00");
      const diffDays = Math.round((curr - prev) / 86400000);
      if (diffDays === 1) {
        st.profile.streakDays = (st.profile.streakDays || 1) + 1;
      } else if (diffDays > 1) {
        st.profile.streakDays = 1;
      }
      st.profile.lastActiveDate = today;
    } else if (!st.profile.lastActiveDate) {
      st.profile.lastActiveDate = today;
    }

    return st;
  }

  function getAuthToken() {
    return localStorage.getItem("qchinese_auth_token") || "";
  }

  function setAuthToken(tok) {
    if (tok) localStorage.setItem("qchinese_auth_token", tok);
    else localStorage.removeItem("qchinese_auth_token");
  }

  async function apiFetch(url, options = {}) {
    const headers = Object.assign({}, options.headers || {});
    const tok = getAuthToken();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
    options.headers = headers;
    if (!serverHealth.ok && /^\/?api\/(ai|user)\//.test(String(url))) {
      throw new Error("Tính năng AI cần chạy backend (python server.py hoặc deploy lên Render). Bản GitHub Pages chỉ có phần học tĩnh, tài khoản lưu trong trình duyệt này.");
    }
    const res = await fetch(String(url).replace(/^\//, ""), options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Lỗi kết nối (${res.status})`);
    }
    return data;
  }

  function localUserKey(username) {
    return `qchinese_local_state_${String(username || "guest").toLowerCase()}`;
  }

  async function initSession() {
    try {
      serverHealth = await apiFetch("/api/health");
    } catch (_) {
      serverHealth = { ok: false, aiConfigured: false, aiProvider: "local-offline" };
    }

    if (serverHealth.ok) {
      try {
        const me = await apiFetch("/api/auth/me");
        if (me.authenticated && me.user) {
          currentUser = me.user;
          appState = ensureStateIntegrity(me.state, me.user.displayName);
          applyTheme(appState.profile.theme);
          startStudyTimer();
          return { authenticated: true, user: currentUser };
        }
        return { authenticated: false };
      } catch (_) {
        return { authenticated: false };
      }
    } else {
      // Pure static deployment fallback (e.g., GitHub Pages) with multi-account local storage
      const savedUser = JSON.parse(localStorage.getItem("qchinese_static_active_user") || "null");
      if (savedUser && savedUser.username) {
        currentUser = savedUser;
        const raw = JSON.parse(localStorage.getItem(localUserKey(savedUser.username)) || "null");
        appState = ensureStateIntegrity(raw, savedUser.displayName);
        applyTheme(appState.profile.theme);
        startStudyTimer();
        return { authenticated: true, user: currentUser };
      }
      return { authenticated: false };
    }
  }

  async function registerAccount(username, displayName, password) {
    if (serverHealth.ok) {
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        body: { username, displayName, password }
      });
      setAuthToken(res.token);
      currentUser = res.user;
      appState = ensureStateIntegrity(res.state, res.user.displayName);
      localStorage.setItem(localUserKey(username), JSON.stringify(appState));
      applyTheme(appState.profile.theme);
      startStudyTimer();
      return res.user;
    } else {
      // Static fallback multi-account registry
      const accounts = JSON.parse(localStorage.getItem("qchinese_static_accounts") || "{}");
      const key = username.trim().toLowerCase();
      if (key.length < 3) throw new Error("Tên tài khoản cần ít nhất 3 ký tự.");
      if (password.length < 6) throw new Error("Mật khẩu cần ít nhất 6 ký tự.");
      if (accounts[key]) throw new Error("Tài khoản này đã tồn tại, vui lòng đăng nhập.");
      accounts[key] = { username: username.trim(), displayName: displayName || username.trim(), pw: btoa(unescape(encodeURIComponent(password))) };
      localStorage.setItem("qchinese_static_accounts", JSON.stringify(accounts));
      currentUser = { username: username.trim(), displayName: displayName || username.trim() };
      localStorage.setItem("qchinese_static_active_user", JSON.stringify(currentUser));
      appState = createDefaultState(currentUser.displayName);
      localStorage.setItem(localUserKey(key), JSON.stringify(appState));
      applyTheme(appState.profile.theme);
      startStudyTimer();
      return currentUser;
    }
  }

  async function loginAccount(username, password) {
    if (serverHealth.ok) {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { username, password }
      });
      setAuthToken(res.token);
      currentUser = res.user;
      appState = ensureStateIntegrity(res.state, res.user.displayName);
      localStorage.setItem(localUserKey(username), JSON.stringify(appState));
      applyTheme(appState.profile.theme);
      startStudyTimer();
      return res.user;
    } else {
      const accounts = JSON.parse(localStorage.getItem("qchinese_static_accounts") || "{}");
      const key = username.trim().toLowerCase();
      const acc = accounts[key];
      if (!acc || acc.pw !== btoa(unescape(encodeURIComponent(password)))) {
        throw new Error("Sai tên tài khoản hoặc mật khẩu.");
      }
      currentUser = { username: acc.username, displayName: acc.displayName };
      localStorage.setItem("qchinese_static_active_user", JSON.stringify(currentUser));
      const raw = JSON.parse(localStorage.getItem(localUserKey(key)) || "null");
      appState = ensureStateIntegrity(raw, acc.displayName);
      applyTheme(appState.profile.theme);
      startStudyTimer();
      return currentUser;
    }
  }

  async function logoutAccount() {
    if (studyInterval) clearInterval(studyInterval);
    if (serverHealth.ok) {
      try { await apiFetch("/api/auth/logout", { method: "POST", body: {} }); } catch (_) {}
    }
    setAuthToken("");
    localStorage.removeItem("qchinese_static_active_user");
    currentUser = null;
    appState = null;
  }

  function saveState(immediate = false) {
    if (!appState || !currentUser) return;
    localStorage.setItem(localUserKey(currentUser.username), JSON.stringify(appState));
    if (window.QApp && typeof window.QApp.refreshTopbar === "function") {
      window.QApp.refreshTopbar();
    }
    if (!serverHealth.ok) return;

    if (syncTimer) clearTimeout(syncTimer);
    const pushFn = async () => {
      try {
        await apiFetch("/api/user/state", { method: "POST", body: { state: appState } });
      } catch (e) {
        console.warn("Background state sync deferred:", e.message);
      }
    };
    if (immediate) pushFn();
    else syncTimer = setTimeout(pushFn, 600);
  }

  function startStudyTimer() {
    if (studyInterval) clearInterval(studyInterval);
    studyInterval = setInterval(() => {
      if (document.hidden || !appState) return;
      appState.profile.totalStudyMinutes = (appState.profile.totalStudyMinutes || 0) + 1;
      const t = todayStr();
      if (!appState.dailyLogs[t]) {
        appState.dailyLogs[t] = { minutes: 0, newWords: 0, reviewWords: 0, grammarCount: 0, listeningCount: 0, hanziWriteCount: 0, speakingMinutes: 0 };
      }
      appState.dailyLogs[t].minutes += 1;
      saveState(false);
    }, 60000);
  }

  function logDailyActivity(field, delta = 1) {
    if (!appState) return;
    const t = todayStr();
    if (!appState.dailyLogs[t]) {
      appState.dailyLogs[t] = { minutes: 0, newWords: 0, reviewWords: 0, grammarCount: 0, listeningCount: 0, hanziWriteCount: 0, speakingMinutes: 0 };
    }
    appState.dailyLogs[t][field] = (appState.dailyLogs[t][field] || 0) + delta;
    saveState(false);
  }

  function updateSkillScore(skill, newScore) {
    if (!appState) return;
    const cur = appState.skillScores[skill] || 0;
    appState.skillScores[skill] = cur === 0 ? Math.round(newScore) : Math.round(cur * 0.35 + newScore * 0.65);
    saveState(false);
  }

  /* Spaced Repetition System (SM-2) for Vocabulary */
  function reviewWordSRS(wordId, quality /* 1: Quên, 3: Khó, 4: Nhớ, 5: Rất chắc */) {
    if (!appState) return;
    const now = Date.now();
    const isNew = !appState.srs[wordId];
    const card = appState.srs[wordId] || {
      ease: 2.5,
      intervalDays: 0,
      reps: 0,
      lapses: 0,
      nextReview: now,
      lastQuality: 0
    };

    if (quality < 3) {
      card.reps = 0;
      card.intervalDays = 0.01; // Show again soon in session (~15 mins)
      card.lapses += 1;
    } else {
      if (card.reps === 0) card.intervalDays = 1;
      else if (card.reps === 1) card.intervalDays = 3;
      else card.intervalDays = Math.round(card.intervalDays * card.ease);
      card.reps += 1;
    }

    card.ease = Math.max(1.3, card.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    card.lastQuality = quality;
    card.nextReview = now + card.intervalDays * 86400000;
    appState.srs[wordId] = card;

    if (isNew) logDailyActivity("newWords", 1);
    else logDailyActivity("reviewWords", 1);

    const learnedIds = Object.keys(appState.srs);
    const masteredCount = learnedIds.filter((id) => appState.srs[id].lastQuality >= 3).length;
    const ratio = learnedIds.length ? Math.round((masteredCount / learnedIds.length) * 100) : 0;
    appState.skillScores.vocab = Math.max(appState.skillScores.vocab || 0, ratio);
    saveState(false);
    return card;
  }

  function recordVocabSubSkill(wordId, dim /* meaning|pinyin|listening|usage */, isCorrect) {
    if (!appState || !wordId) return;
    if (!appState.vocabSubSkills[wordId]) {
      appState.vocabSubSkills[wordId] = {
        meaning: { ok: 0, err: 0 },
        pinyin: { ok: 0, err: 0 },
        listening: { ok: 0, err: 0 },
        usage: { ok: 0, err: 0 }
      };
    }
    const slot = appState.vocabSubSkills[wordId][dim] || { ok: 0, err: 0 };
    if (isCorrect) slot.ok += 1;
    else slot.err += 1;
    appState.vocabSubSkills[wordId][dim] = slot;
    saveState(false);
  }

  function toggleFavoriteVocab(wordId) {
    if (!appState || !wordId) return false;
    const idx = appState.favoriteVocab.indexOf(wordId);
    let added = false;
    if (idx >= 0) {
      appState.favoriteVocab.splice(idx, 1);
    } else {
      appState.favoriteVocab.unshift(wordId);
      added = true;
    }
    saveState(false);
    return added;
  }

  function addCustomVocab(word) {
    if (!appState || !word || !word.hanzi) return null;
    const entry = {
      id: "custom_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      hanzi: String(word.hanzi).trim(),
      traditional: String(word.traditional || "").trim(),
      pinyin: String(word.pinyin || "").trim(),
      pinyin_number: String(word.pinyin_number || word.pinyin || "").trim(),
      pinyin_plain: String(word.pinyin || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, ""),
      hsk_level: Number(word.hsk_level || appState.profile.hskLevel || 1),
      topic: word.topic || "other",
      pos: Array.isArray(word.pos) ? word.pos : ["other"],
      part_of_speech: word.part_of_speech || "Từ cá nhân",
      meanings: {
        vietnamese: Array.isArray(word.vietnamese) ? word.vietnamese : [String(word.vietnamese || "").trim()].filter(Boolean),
        english: Array.isArray(word.english) ? word.english : [String(word.english || "").trim()].filter(Boolean),
        chinese: []
      },
      han_viet: word.han_viet || "",
      examples: Array.isArray(word.examples) ? word.examples : [],
      usage_note: word.usage_note || "",
      isCustom: true,
      createdAt: todayStr()
    };
    appState.customVocab.unshift(entry);
    saveState(false);
    return entry;
  }

  function recordPhoneticAttempt(pairKey, isCorrect) {
    if (!appState || !pairKey) return;
    const rec = appState.phoneticErrors[pairKey] || { right: 0, wrong: 0, lastWrongAt: null };
    if (isCorrect) rec.right += 1;
    else {
      rec.wrong += 1;
      rec.lastWrongAt = new Date().toISOString();
    }
    appState.phoneticErrors[pairKey] = rec;
    appState.pronunciationSessions = (appState.pronunciationSessions || 0) + 1;
    const totals = Object.values(appState.phoneticErrors).reduce(
      (acc, r) => ({ ok: acc.ok + (r.right || 0), all: acc.all + (r.right || 0) + (r.wrong || 0) }),
      { ok: 0, all: 0 }
    );
    if (totals.all > 0) {
      updateSkillScore("pinyin", Math.round((totals.ok / totals.all) * 100));
    }
    saveState(false);
  }

  function addMaterial(mat) {
    if (!appState) return null;
    const item = {
      id: "mat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      title: String(mat.title || "Tài liệu không tiêu đề").trim(),
      category: mat.category || "reading", // writing|listening|speaking|reading|vocabulary|grammar|hsk|other
      folder: mat.folder || "Tài liệu trên lớp",
      source: String(mat.source || "Người học tải lên").trim(),
      sourceUrl: String(mat.sourceUrl || "").trim(),
      hskLevel: Number(mat.hskLevel || appState.profile.hskLevel || 1),
      topic: String(mat.topic || "").trim(),
      content: String(mat.content || "").trim(),
      transcript: String(mat.transcript || "").trim(),
      mediaUrl: String(mat.mediaUrl || "").trim(),
      mediaType: String(mat.mediaType || "").trim(),
      fileName: String(mat.fileName || "").trim(),
      status: mat.status || "not_started", // not_started | in_progress | completed
      score: mat.score != null ? Number(mat.score) : null,
      notes: String(mat.notes || "").trim(),
      aiGeneratedExercises: Array.isArray(mat.aiGeneratedExercises) ? mat.aiGeneratedExercises : [],
      history: Array.isArray(mat.history) ? mat.history : [],
      createdAt: todayStr()
    };
    appState.materials.unshift(item);
    saveState(false);
    return item;
  }

  function updateMaterial(id, patch) {
    if (!appState) return null;
    const item = appState.materials.find((m) => m.id === id);
    if (!item) return null;
    Object.assign(item, patch);
    saveState(false);
    return item;
  }

  function deleteMaterial(id) {
    if (!appState) return;
    appState.materials = appState.materials.filter((m) => m.id !== id);
    saveState(false);
  }

  function recordMaterialPractice(id, entry) {
    if (!appState) return;
    const item = appState.materials.find((m) => m.id === id);
    if (!item) return;
    item.history = Array.isArray(item.history) ? item.history : [];
    item.history.unshift(Object.assign({ date: new Date().toISOString() }, entry));
    if (entry.score != null) item.score = Number(entry.score);
    item.status = entry.status || "completed";
    saveState(false);
  }

  function logAiHistory(entry) {
    if (!appState) return;
    appState.aiHistory.unshift(Object.assign({ id: "ai_" + Date.now(), at: new Date().toISOString() }, entry));
    if (appState.aiHistory.length > 40) appState.aiHistory = appState.aiHistory.slice(0, 40);
    saveState(false);
  }

  function recordHanziPractice(hanzi, accuracyScore) {
    if (!appState) return;
    const prev = appState.hanziProgress[hanzi] || { attempts: 0, bestScore: 0, memorized: false };
    prev.attempts += 1;
    prev.bestScore = Math.max(prev.bestScore, Math.round(accuracyScore));
    if (accuracyScore >= 75) prev.memorized = true;
    prev.updatedAt = new Date().toISOString();
    appState.hanziProgress[hanzi] = prev;
    logDailyActivity("hanziWriteCount", 1);
    updateSkillScore("hanzi", accuracyScore);
    updateSkillScore("writing", accuracyScore);
    saveState(false);
  }

  /* Personal Chinese Notebook Manager */
  function addToNotebook(entry) {
    if (!appState) return false;
    const exists = appState.notebook.find(
      (item) => item.hanzi === entry.hanzi && item.category === (entry.category || "vocab")
    );
    if (exists) {
      exists.note = entry.note || exists.note;
      exists.updatedAt = todayStr();
      saveState(false);
      showToast(`Đã cập nhật "${entry.hanzi}" trong Sổ tay cá nhân!`);
      return true;
    }
    appState.notebook.unshift({
      id: "nb_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      category: entry.category || "vocab", // vocab | hard_hanzi | grammar | sentence | wrong_write | wrong_pron | note
      hanzi: entry.hanzi || "",
      pinyin: entry.pinyin || "",
      english: entry.english || "",
      vietnamese: entry.vietnamese || "",
      example: entry.example || "",
      note: entry.note || "",
      memoryLevel: entry.memoryLevel || 1, // 1..5 stars
      savedAt: todayStr()
    });
    saveState(false);
    showToast(`Đã lưu "${entry.hanzi}" vào Sổ tay cá nhân!`);
    return true;
  }

  /* Mandarin Putonghua Audio Synthesis (Server Cached MP3 + Web Speech zh-CN Fallback) */
  function speakChinese(text, opts = {}) {
    if (!text) return;
    const cleanText = String(text).trim();
    if (!cleanText) return;

    const baseRate = appState ? appState.profile.audioSpeed || 1.0 : 1.0;
    const rate = opts.rate || (opts.slow ? 0.65 : baseRate);
    const slowFlag = opts.slow || rate <= 0.7 ? "1" : "0";

    if (activeAudio) {
      try { activeAudio.pause(); } catch (_) {}
      activeAudio = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }

    const fallbackWebSpeech = () => {
      if (!window.speechSynthesis) {
        showToast("Trình duyệt không hỗ trợ phát âm thanh.");
        return;
      }
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = "zh-CN";
      utter.rate = Math.max(0.45, Math.min(1.4, rate));
      const voices = window.speechSynthesis.getVoices() || [];
      const zhVoice =
        voices.find((v) => v.lang === "zh-CN" && /Xiaoxiao|Yunxi|Huihui|Kangkang|Google|Putonghua/i.test(v.name)) ||
        voices.find((v) => /^zh(-|_)?CN/i.test(v.lang)) ||
        voices.find((v) => /^zh/i.test(v.lang));
      if (zhVoice) utter.voice = zhVoice;
      if (opts.onEnd) utter.onend = opts.onEnd;
      window.speechSynthesis.speak(utter);
    };

    if (serverHealth.ok) {
      const audio = new Audio(`api/tts?text=${encodeURIComponent(cleanText)}&slow=${slowFlag}`);
      audio.playbackRate = slowFlag === "1" ? 0.92 : Math.max(0.5, Math.min(1.4, rate));
      activeAudio = audio;
      audio.onended = () => {
        if (opts.onEnd) opts.onEnd();
      };
      audio.onerror = () => fallbackWebSpeech();
      audio.play().catch(() => fallbackWebSpeech());
    } else {
      fallbackWebSpeech();
    }
  }

  /* Voice Recording + Speech Recognition (zh-CN) for Tone & Speaking Comparison */
  async function captureLearnerVoice({ durationMs = 4000, onTranscript, onAudioReady, onStatus } = {}) {
    let recognition = null;
    let transcript = "";
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRec) {
      recognition = new SpeechRec();
      recognition.lang = "zh-CN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (ev) => {
        if (ev.results && ev.results[0] && ev.results[0][0]) {
          transcript = ev.results[0][0].transcript;
          if (onTranscript) onTranscript(transcript, ev.results[0][0].confidence || 0.8);
        }
      };
      recognition.onerror = () => {};
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recognition) {
          try { recognition.stop(); } catch (_) {}
        }
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        if (onAudioReady) onAudioReady(url, transcript);
        if (onStatus) onStatus("idle");
      };

      if (onStatus) onStatus("recording");
      if (recognition) {
        try { recognition.start(); } catch (_) {}
      }
      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, durationMs);

      return () => {
        if (recorder.state === "recording") recorder.stop();
      };
    } catch (err) {
      if (onStatus) onStatus("error");
      showToast("Không thể mở Microphone. Vui lòng cấp quyền Micro trên trình duyệt nhé!");
      return null;
    }
  }

  /* Resolve Deep Character Detail (15 fields) for ANY Simplified Chinese Character */
  function resolveHanziDetail(char) {
    const clean = String(char || "").trim().charAt(0);
    const curated = (window.QCHINESE_HANZI_LIST || []).find((h) => h.hanzi === clean);
    if (curated) return curated;

    // Synthesize rich character profile from vocabulary & IME dictionary
    const matchingVocab = (window.QCHINESE_VOCAB || []).filter((v) => v.hanzi.includes(clean));
    const exactVocab = matchingVocab.find((v) => v.hanzi === clean);
    const imeMatch = (window.PINYIN_IME_EXTRAS || []).find((x) => x.hanzi === clean);

    const py = exactVocab ? exactVocab.pinyin : imeMatch ? imeMatch.pinyin : (matchingVocab[0] ? matchingVocab[0].pinyin : "");
    const pyNum = exactVocab ? exactVocab.pinyin_number : py;
    const viMean = exactVocab
      ? exactVocab.meanings.vietnamese.join("; ")
      : imeMatch
      ? imeMatch.vi
      : matchingVocab.length
      ? `Xuất hiện trong từ: ${matchingVocab.map((m) => `${m.hanzi} (${m.meanings.vietnamese[0]})`).join(", ")}`
      : "Chữ Hán Giản thể thông dụng (bấm nghe phát âm & xem hoạt ảnh thứ tự nét chuẩn bên cạnh).";

    const enMean = exactVocab
      ? exactVocab.meanings.english.join("; ")
      : matchingVocab.length
      ? `Used in: ${matchingVocab.map((m) => `${m.hanzi} (${m.meanings.english[0]})`).join(", ")}`
      : "Standard Simplified Chinese character.";

    return {
      hanzi: clean,
      hsk_level: exactVocab ? exactVocab.hsk_level : (matchingVocab[0] ? matchingVocab[0].hsk_level : 1),
      pinyin: py || "Tra âm trực tiếp",
      pinyin_number: pyNum || "",
      vietnamese_hint: exactVocab ? exactVocab.vietnamese_pronunciation_hint : "Ưu tiên bấm nút Loa để nghe chuẩn âm tiếng Trung phổ thông.",
      part_of_speech: exactVocab ? exactVocab.part_of_speech : "汉字 · Chữ Hán Giản thể",
      meanings: {
        chinese: exactVocab ? exactVocab.meanings.chinese[0] : `现代汉语常用简体字“${clean}”。`,
        english: enMean,
        vietnamese: viMean
      },
      radical: "Xem phần nét màu xanh ngọc (Bộ thủ) trên khung phân tích nét",
      decomposition: "Chữ Hán Giản thể chuẩn — hệ thống tải dữ liệu nét chuẩn xác từ Make Me a Hanzi.",
      stroke_count: exactVocab ? exactVocab.stroke_count : null,
      stroke_names: [],
      compounds: matchingVocab.slice(0, 4).map((m) => ({
        word: m.hanzi,
        pinyin: m.pinyin,
        vi: m.meanings.vietnamese[0],
        en: m.meanings.english[0]
      })),
      examples: exactVocab
        ? exactVocab.examples
        : matchingVocab[0]
        ? matchingVocab[0].examples
        : [{ chinese: clean, pinyin: py, english: enMean, vietnamese: viMean }],
      common_mistakes: "Chú ý viết đúng quy tắc bút thuận cơ bản: Ngang trước sổ sau, phẩy trước mác sau, từ trên xuống dưới, từ trái sang phải, vào nhà trước đóng cửa sau."
    };
  }

  /* Fetch Verified Stroke Data (Make Me a Hanzi) */
  const strokeMemCache = {};
  async function fetchStrokeData(char) {
    if (strokeMemCache[char]) return strokeMemCache[char];
    const urls = serverHealth.ok
      ? [`api/strokes?char=${encodeURIComponent(char)}`, `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`]
      : [`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(char)}.json`];

    for (const u of urls) {
      try {
        const r = await fetch(u);
        if (r.ok) {
          const data = await r.json();
          if (data && Array.isArray(data.strokes)) {
            strokeMemCache[char] = data;
            return data;
          }
        }
      } catch (_) {}
    }
    return null;
  }

  function applyTheme(theme) {
    const t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    if (appState) appState.profile.theme = t;
  }

  function toggleTheme() {
    const curr = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(curr);
    saveState(false);
    return curr;
  }

  function showToast(msg) {
    let stack = document.getElementById("toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.id = "toast-stack";
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    const item = document.createElement("div");
    item.className = "toast-item";
    item.textContent = msg;
    stack.appendChild(item);
    setTimeout(() => {
      item.style.opacity = "0";
      setTimeout(() => item.remove(), 220);
    }, 3200);
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return {
    todayStr,
    initSession,
    registerAccount,
    loginAccount,
    logoutAccount,
    apiFetch,
    getUser: () => currentUser,
    getState: () => appState,
    setState: (st) => { appState = ensureStateIntegrity(st, currentUser ? currentUser.displayName : "Học viên"); saveState(true); },
    getServerHealth: () => serverHealth,
    saveState,
    logDailyActivity,
    updateSkillScore,
    reviewWordSRS,
    recordVocabSubSkill,
    toggleFavoriteVocab,
    addCustomVocab,
    recordPhoneticAttempt,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    recordMaterialPractice,
    logAiHistory,
    recordHanziPractice,
    addToNotebook,
    speakChinese,
    captureLearnerVoice,
    resolveHanziDetail,
    fetchStrokeData,
    applyTheme,
    toggleTheme,
    showToast,
    escapeHtml
  };
})();
