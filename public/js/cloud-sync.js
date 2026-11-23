/* -*- coding: utf-8 -*-
 * QChinese – Supabase Cloud Auth, Multi-Device Sessions & 24/7 Real-Time WSS Sync
 * Modeled on QEnglish & TKB ecosystem architecture (100% isolated `qchinese_*` tables).
 * ZERO secrets stored in frontend — reads public Supabase URL/Anon Key from /api/config.
 */

window.QCloud = (function () {
  const CLOUD_SESSION_KEY = "qchinese_cloud_session_v1";
  const DEVICE_ID_KEY = "qchinese_device_id_v1";
  const DEFAULT_CLOUD_ORIGIN = "https://q-chinese.vercel.app";

  let config = {
    loaded: true,
    authConfigured: true,
    aiConfigured: true,
    aiProvider: "gemini",
    aiModel: "gemini-3.8-flash",
    supabaseUrl: "https://tlgjhakqijpnjnvtpzoj.supabase.co",
    supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZ2poYWtxaWpwbmpudnRwem9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzNTM2MDcsImV4cCI6MjExMDkyOTYwN30.EG9mXfu8eyETbrtXe5p8XgrPcIQIPQzcnRB-Z7MnskI"
  };

  let session = null; // { access_token, refresh_token, expires_at, user }
  let recoveryAccessToken = null;
  let cloudRevision = 0;
  let ws = null;
  let wsHeartbeat = null;
  let wsReconnect = null;
  let wsRef = 0;
  let wsAttempts = 0;
  let wsManualClose = false;
  let fallbackPoll = null;
  let realtimeConnected = false;
  let schemaMissing = false;

  function safeParse(raw, fb = null) {
    try {
      return raw ? JSON.parse(raw) : fb;
    } catch (_) {
      return fb;
    }
  }

  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = "qcn-" + Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  }

  function detectDeviceMeta() {
    const ua = String(navigator.userAgent || "");
    let platform = "PC / Laptop";
    if (/Android/i.test(ua)) platform = "Android";
    else if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) platform = "iPad";
    else if (/iPhone|iPod/i.test(ua)) platform = "iPhone";
    else if (/Macintosh/i.test(ua)) platform = "Mac";
    else if (/Windows/i.test(ua)) platform = "Windows";
    else if (/Linux/i.test(ua)) platform = "Linux";

    let browser = "Browser";
    if (/Edg\//i.test(ua)) browser = "Edge";
    else if (/Chrome\//i.test(ua) && !/Edg/i.test(ua)) browser = "Chrome";
    else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Firefox";

    return {
      deviceName: `${platform} · ${browser}`,
      platform,
      userAgent: ua.slice(0, 240)
    };
  }

  function isCloudMode() {
    return Boolean(config.authConfigured && config.supabaseUrl && config.supabaseAnonKey);
  }

  function getHeaders(useAuth = true) {
    const h = {
      "Content-Type": "application/json",
      apikey: config.supabaseAnonKey
    };
    if (useAuth && session && session.access_token) {
      h.Authorization = `Bearer ${session.access_token}`;
    }
    return h;
  }

  function saveSession(obj) {
    session = obj || null;
    if (obj) localStorage.setItem(CLOUD_SESSION_KEY, JSON.stringify(obj));
    else localStorage.removeItem(CLOUD_SESSION_KEY);
  }

  function translateError(raw) {
    const msg = String(raw || "");
    if (/invalid login credentials/i.test(msg)) return "Email hoặc mật khẩu chưa chính xác.";
    if (/email not confirmed/i.test(msg)) return "Email chưa được xác minh. Vui lòng kiểm tra hộp thư để xác nhận.";
    if (/already registered|user already/i.test(msg)) return "Email này đã có tài khoản. Vui lòng chuyển sang Đăng nhập.";
    if (/rate limit/i.test(msg)) return "Thao tác quá nhanh, vui lòng chờ vài giây rồi thử lại.";
    if (/password/i.test(msg) && /weak|short|6/i.test(msg)) return "Mật khẩu cần tối thiểu 6 ký tự.";
    return msg || "Có lỗi xác thực đám mây.";
  }

  async function initConfig(apiBase = "") {
    const base = String(apiBase || "").trim().replace(/\/+$/, "");
    const host = (typeof window !== "undefined" && window.location && window.location.hostname) || "";
    const isStaticHost = typeof window !== "undefined" && (window.location.protocol === "file:" || /github\.io$/i.test(host));
    const candidates = [];
    if (base) candidates.push(`${base}/api/config`);
    else if (isStaticHost) candidates.push(`${DEFAULT_CLOUD_ORIGIN}/api/config`);
    else {
      candidates.push("/api/config");
      candidates.push(`${DEFAULT_CLOUD_ORIGIN}/api/config`);
    }

    for (const url of candidates) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 7000);
        const res = await fetch(url, { method: "GET", cache: "no-store", signal: ctrl.signal });
        clearTimeout(t);
        if (res.ok) {
          const d = await res.json().catch(() => ({}));
          if (d && d.ok) {
            config = Object.assign({}, config, d, { loaded: true });
            return config;
          }
        }
      } catch (_) {}
    }
    config.loaded = true;
    return config;
  }

  function parseUrlAuthHash() {
    const hash = String(window.location.hash || "").replace(/^#/, "");
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    const errorDesc = params.get("error_description") || params.get("error");
    if (hash && (accessToken || errorDesc || type)) {
      try {
        history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch (_) {}
    }
    return { accessToken, refreshToken, type, errorDesc };
  }

  async function fetchAuthUser(accessToken) {
    try {
      const res = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
        method: "GET",
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      return null;
    }
  }

  async function refreshSessionToken(refreshTokenVal) {
    if (!refreshTokenVal || !config.supabaseUrl) return { ok: false };
    try {
      const res = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: getHeaders(false),
        body: JSON.stringify({ refresh_token: refreshTokenVal })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // Only clear session if token is genuinely revoked or invalid by server
        if (res.status === 400 && (data.error === "invalid_grant" || /invalid|expired|revoked/i.test(data.error_description || ""))) {
          console.warn("QCloud: Refresh token revoked or expired by server.");
          saveSession(null);
        }
        return { ok: false };
      }
      if (!data.access_token || !data.user) {
        return { ok: false };
      }
      const sess = {
        access_token: data.access_token,
        refresh_token: data.refresh_token || refreshTokenVal,
        expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
        user: data.user
      };
      saveSession(sess);
      return { ok: true, user: data.user };
    } catch (_) {
      // Network failure / offline - DO NOT clear session!
      return { ok: false };
    }
  }

  async function ensureValidSession() {
    if (!isCloudMode() || !session || !session.access_token) return false;
    const nowSec = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at - 90 < nowSec && session.refresh_token) {
      const r = await refreshSessionToken(session.refresh_token);
      return r.ok;
    }
    return true;
  }

  function toQChineseUser(sbUser) {
    const email = sbUser.email || "";
    const meta = sbUser.user_metadata || {};
    const displayName = meta.display_name || meta.full_name || (email ? email.split("@")[0] : "Học viên");
    return {
      id: sbUser.id,
      username: email || sbUser.id,
      email,
      displayName,
      sessionId: getDeviceId(),
      cloudProvider: "supabase"
    };
  }

  async function restoreSession() {
    if (!isCloudMode()) return { restored: false };
    const urlAuth = parseUrlAuthHash();
    if (urlAuth.errorDesc) {
      return { restored: false, error: decodeURIComponent(urlAuth.errorDesc) };
    }
    if (urlAuth.type === "recovery" && urlAuth.accessToken) {
      recoveryAccessToken = urlAuth.accessToken;
      return { restored: false, recoveryMode: true };
    }
    if (urlAuth.accessToken && urlAuth.refreshToken) {
      const u = await fetchAuthUser(urlAuth.accessToken);
      if (u) {
        saveSession({
          access_token: urlAuth.accessToken,
          refresh_token: urlAuth.refreshToken,
          expires_at: Math.floor(Date.now() / 1000) + 3500,
          user: u
        });
        return { restored: true, user: toQChineseUser(u) };
      }
    }

    const saved = safeParse(localStorage.getItem(CLOUD_SESSION_KEY), null);
    if (saved && (saved.access_token || saved.refresh_token || saved.user)) {
      session = saved;
      const nowSec = Math.floor(Date.now() / 1000);
      const isExpired = Boolean(saved.expires_at && saved.expires_at - 90 < nowSec);

      // 1. If access_token is still within validity period, restore immediately!
      if (!isExpired && saved.access_token && saved.user) {
        return { restored: true, user: toQChineseUser(saved.user) };
      }

      // 2. If expired or access_token missing, refresh silently in the background
      if (saved.refresh_token) {
        try {
          const ref = await refreshSessionToken(saved.refresh_token);
          if (ref.ok && ref.user) {
            return { restored: true, user: toQChineseUser(ref.user) };
          }
        } catch (_) {}
      }

      // 3. If offline or network delayed, keep cached user profile so user is NEVER abruptly kicked out!
      if (saved.user) {
        return { restored: true, user: toQChineseUser(saved.user), offline: true };
      }

      // 4. Only if neither user nor valid tokens exist
      saveSession(null);
    }
    return { restored: false };
  }

  async function signUp(email, displayName, password) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanName = String(displayName || "").trim() || cleanEmail.split("@")[0] || "Học viên";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error("Vui lòng nhập địa chỉ Email hợp lệ (vd: you@example.com).");
    }
    if (String(password || "").length < 6) {
      throw new Error("Mật khẩu cần tối thiểu 6 ký tự.");
    }
    const res = await fetch(`${config.supabaseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({
        email: cleanEmail,
        password,
        data: { display_name: cleanName },
        options: { emailRedirectTo: window.location.origin + window.location.pathname }
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(translateError(data.msg || data.error_description || data.error));
    }
    if (data.access_token && data.user) {
      saveSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
        user: data.user
      });
      await upsertProfile(data.user, cleanName);
      return { user: toQChineseUser(data.user), needsVerification: false };
    }
    return {
      user: null,
      needsVerification: true,
      message: `Đăng ký thành công! Hãy mở hộp thư ${cleanEmail} và bấm link xác minh trước khi đăng nhập.`
    };
  }

  async function signIn(email, password) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail || !password) {
      throw new Error("Vui lòng nhập đầy đủ Email và Mật khẩu.");
    }
    const res = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email: cleanEmail, password })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token || !data.user) {
      throw new Error(translateError(data.error_description || data.msg || data.error));
    }
    saveSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
      user: data.user
    });
    await upsertProfile(data.user);
    return toQChineseUser(data.user);
  }

  async function sendPasswordReset(email) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error("Vui lòng nhập địa chỉ Email hợp lệ.");
    }
    const redirectTo = window.location.origin + window.location.pathname;
    const res = await fetch(`${config.supabaseUrl}/auth/v1/recover`, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify({ email: cleanEmail, redirect_to: redirectTo })
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(translateError(d.msg || d.error_description || d.error));
    }
    return `Đã gửi liên kết đặt lại mật khẩu tới ${cleanEmail}. Vui lòng kiểm tra hộp thư (kể cả Spam).`;
  }

  async function updatePasswordWithRecovery(newPassword) {
    if (String(newPassword || "").length < 6) {
      throw new Error("Mật khẩu mới cần tối thiểu 6 ký tự.");
    }
    const tok = recoveryAccessToken || (session && session.access_token);
    if (!tok) throw new Error("Liên kết khôi phục đã hết hạn. Vui lòng gửi lại email khôi phục.");
    const res = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${tok}`
      },
      body: JSON.stringify({ password: newPassword })
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(translateError(d.msg || d.error_description || d.error));
    recoveryAccessToken = null;
    return "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.";
  }

  async function updateAccountProfile(displayName, newPassword) {
    await ensureValidSession();
    const body = {};
    if (displayName) body.data = { display_name: displayName };
    if (newPassword) {
      if (newPassword.length < 6) throw new Error("Mật khẩu mới cần tối thiểu 6 ký tự.");
      body.password = newPassword;
    }
    if (Object.keys(body).length) {
      const res = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
        method: "PUT",
        headers: getHeaders(true),
        body: JSON.stringify(body)
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(translateError(d.msg || d.error_description || d.error));
      if (session && d && d.id) {
        session.user = d;
        saveSession(session);
      }
    }
    if (session && session.user && displayName) {
      await upsertProfile(session.user, displayName);
    }
    return { ok: true };
  }

  async function signOut(localOnly = false) {
    disconnectRealtime();
    if (!localOnly && isCloudMode() && session && session.access_token) {
      try {
        // scope=local ensures signing out on 1 device NEVER logs out Laptop/Phone!
        await fetch(`${config.supabaseUrl}/auth/v1/logout?scope=local`, {
          method: "POST",
          headers: getHeaders(true)
        });
      } catch (_) {}
    }
    saveSession(null);
    cloudRevision = 0;
  }

  /* -------------------- QCHINESE ISOLATED TABLES -------------------- */
  async function upsertProfile(sbUser, displayNameOverride = "") {
    if (!isCloudMode() || !sbUser || !sbUser.id || !session || !session.access_token) return;
    try {
      const meta = sbUser.user_metadata || {};
      const res = await fetch(`${config.supabaseUrl}/rest/v1/qchinese_user_profiles?on_conflict=user_id`, {
        method: "POST",
        headers: Object.assign({}, getHeaders(true), { Prefer: "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify({
          user_id: sbUser.id,
          display_name: displayNameOverride || meta.display_name || (sbUser.email || "").split("@")[0] || "Học viên",
          email: sbUser.email || "",
          updated_at: new Date().toISOString()
        })
      });
      if (res.status === 404) schemaMissing = true;
    } catch (_) {}
  }

  async function registerCurrentDevice(forceReactivate = false) {
    const uid = session && session.user && session.user.id;
    if (!isCloudMode() || !uid) return { ok: false };
    await ensureValidSession();
    const devId = getDeviceId();
    const meta = detectDeviceMeta();
    try {
      if (!forceReactivate) {
        const chk = await fetch(
          `${config.supabaseUrl}/rest/v1/qchinese_user_devices?user_id=eq.${encodeURIComponent(uid)}&device_id=eq.${encodeURIComponent(devId)}&select=is_revoked`,
          { method: "GET", headers: getHeaders(true) }
        );
        if (chk.status === 404) {
          schemaMissing = true;
          return { ok: false, schemaMissing: true };
        }
        if (chk.ok) {
          const rows = await chk.json().catch(() => []);
          if (Array.isArray(rows) && rows[0] && rows[0].is_revoked === true) {
            return { ok: true, revoked: true };
          }
        }
      }
      const res = await fetch(`${config.supabaseUrl}/rest/v1/qchinese_user_devices?on_conflict=user_id,device_id`, {
        method: "POST",
        headers: Object.assign({}, getHeaders(true), { Prefer: "resolution=merge-duplicates,return=representation" }),
        body: JSON.stringify({
          user_id: uid,
          device_id: devId,
          device_name: meta.deviceName,
          platform: meta.platform,
          user_agent: meta.userAgent,
          is_revoked: false,
          last_seen_at: new Date().toISOString()
        })
      });
      if (res.status === 404) {
        schemaMissing = true;
        return { ok: false, schemaMissing: true };
      }
      schemaMissing = false;
      return { ok: res.ok };
    } catch (_) {
      return { ok: false };
    }
  }

  async function listActiveDevices() {
    const uid = session && session.user && session.user.id;
    const curId = getDeviceId();
    if (!isCloudMode() || !uid) return [];
    await ensureValidSession();
    try {
      const res = await fetch(
        `${config.supabaseUrl}/rest/v1/qchinese_user_devices?user_id=eq.${encodeURIComponent(uid)}&is_revoked=eq.false&order=last_seen_at.desc`,
        { method: "GET", headers: getHeaders(true) }
      );
      if (res.status === 404) {
        schemaMissing = true;
        return [];
      }
      if (!res.ok) return [];
      const rows = await res.json();
      return (Array.isArray(rows) ? rows : []).map((r) => ({
        sessionId: r.device_id,
        deviceName: r.device_name || "Web Browser",
        ipAddress: r.platform || "Cloud",
        createdAt: r.created_at,
        lastActiveAt: r.last_seen_at || r.created_at,
        isCurrent: r.device_id === curId
      }));
    } catch (_) {
      return [];
    }
  }

  async function revokeDevice(targetDeviceId) {
    const uid = session && session.user && session.user.id;
    if (!isCloudMode() || !uid || !targetDeviceId) return { ok: false };
    await ensureValidSession();
    const res = await fetch(
      `${config.supabaseUrl}/rest/v1/qchinese_user_devices?user_id=eq.${encodeURIComponent(uid)}&device_id=eq.${encodeURIComponent(targetDeviceId)}`,
      {
        method: "PATCH",
        headers: Object.assign({}, getHeaders(true), { Prefer: "return=minimal" }),
        body: JSON.stringify({ is_revoked: true, last_seen_at: new Date().toISOString() })
      }
    );
    return { ok: res.ok, revokedCurrent: targetDeviceId === getDeviceId() };
  }

  async function revokeAllDevices(keepCurrent = true) {
    const uid = session && session.user && session.user.id;
    if (!isCloudMode() || !uid) return { ok: false, revokedCount: 0 };
    const list = await listActiveDevices();
    let count = 0;
    for (const d of list) {
      if (keepCurrent && d.isCurrent) continue;
      const r = await revokeDevice(d.sessionId);
      if (r.ok) count += 1;
    }
    return { ok: true, revokedCount: count };
  }

  async function fetchSnapshot() {
    const uid = session && session.user && session.user.id;
    if (!isCloudMode() || !uid) return { ok: false };
    await ensureValidSession();
    try {
      const res = await fetch(
        `${config.supabaseUrl}/rest/v1/qchinese_user_snapshots?user_id=eq.${encodeURIComponent(uid)}&select=*`,
        { method: "GET", headers: getHeaders(true) }
      );
      if (res.status === 404) {
        schemaMissing = true;
        return { ok: false, schemaMissing: true };
      }
      if (!res.ok) return { ok: false, status: res.status };
      schemaMissing = false;
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0];
        cloudRevision = Math.max(cloudRevision, Number(row.revision) || 1);
        return { ok: true, state: row.state_json || null, revision: Number(row.revision) || 1, updatedAt: row.updated_at };
      }
      return { ok: true, state: null, revision: 0 };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  async function pushSnapshot(stateObj) {
    const uid = session && session.user && session.user.id;
    if (!isCloudMode() || !uid || !stateObj) return { ok: false };
    await ensureValidSession();
    const nextRev = (cloudRevision || 0) + 1;
    const meta = detectDeviceMeta();
    const res = await fetch(`${config.supabaseUrl}/rest/v1/qchinese_user_snapshots?on_conflict=user_id`, {
      method: "POST",
      headers: Object.assign({}, getHeaders(true), { Prefer: "resolution=merge-duplicates,return=representation" }),
      body: JSON.stringify({
        user_id: uid,
        revision: nextRev,
        device_id: getDeviceId(),
        device_name: meta.deviceName,
        state_json: stateObj,
        updated_at: new Date().toISOString()
      })
    });
    if (res.status === 404) {
      schemaMissing = true;
      return { ok: false, schemaMissing: true };
    }
    if (!res.ok) throw new Error(`Supabase sync HTTP ${res.status}`);
    schemaMissing = false;
    cloudRevision = nextRev;
    return { ok: true, revision: nextRev };
  }

  function mergeStates(localSt, remoteSt) {
    if (!remoteSt) return localSt;
    if (!localSt) return remoteSt;
    const out = Object.assign({}, remoteSt, localSt);

    const lp = localSt.profile || {};
    const rp = remoteSt.profile || {};
    out.profile = Object.assign({}, rp, lp, {
      totalStudyMinutes: Math.max(Number(lp.totalStudyMinutes || 0), Number(rp.totalStudyMinutes || 0)),
      streakDays: Math.max(Number(lp.streakDays || 1), Number(rp.streakDays || 1)),
      unlockedHsk: Math.max(Number(lp.unlockedHsk || 1), Number(rp.unlockedHsk || 1))
    });

    for (const k of ["grammarCompleted", "listeningCompleted", "readingCompleted", "markedWords", "customHanzi", "favoriteVocab"]) {
      const merged = [];
      const seen = new Set();
      for (const item of [...(remoteSt[k] || []), ...(localSt[k] || [])]) {
        const key = typeof item === "string" ? item : JSON.stringify(item);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      }
      out[k] = merged;
    }

    const mergeById = (a, b, field = "id") => {
      const map = new Map();
      for (const it of (b || [])) if (it && it[field]) map.set(String(it[field]), it);
      for (const it of (a || [])) if (it && it[field]) map.set(String(it[field]), it);
      return Array.from(map.values());
    };
    out.notebook = mergeById(localSt.notebook, remoteSt.notebook, "id");
    out.materials = mergeById(localSt.materials, remoteSt.materials, "id");
    out.customVocab = mergeById(localSt.customVocab, remoteSt.customVocab, "id");
    out.writingSubmissions = mergeById(localSt.writingSubmissions, remoteSt.writingSubmissions, "id");
    out.testHistory = mergeById(localSt.testHistory, remoteSt.testHistory, "id");

    for (const dk of ["srs", "hanziProgress", "vocabSubSkills", "phoneticErrors", "readingNotes", "lessonProgress", "dailyLogs"]) {
      out[dk] = Object.assign({}, remoteSt[dk] || {}, localSt[dk] || {});
    }

    // Deep-merge externalLibraryProgress (6 External Skills independent of AI PDF HSK 3.0)
    const lExt = localSt.externalLibraryProgress || {};
    const rExt = remoteSt.externalLibraryProgress || {};
    out.externalLibraryProgress = {};
    for (const sk of ["reading", "listening", "grammar", "writing", "speaking"]) {
      const lb = lExt[sk] || {};
      const rb = rExt[sk] || {};
      const cSet = new Set([...(rb.completedIds || []), ...(lb.completedIds || [])]);
      const scoresById = Object.assign({}, rb.scoresById || {}, lb.scoresById || {});
      for (const id of Object.keys(scoresById)) {
        scoresById[id] = Math.max(Number((rb.scoresById && rb.scoresById[id]) || 0), Number((lb.scoresById && lb.scoresById[id]) || 0));
      }
      const attemptsById = Object.assign({}, rb.attemptsById || {}, lb.attemptsById || {});
      out.externalLibraryProgress[sk] = {
        completedIds: Array.from(cSet),
        scoresById,
        attemptsById
      };
      if (sk === "writing") {
        const lt = lb.translation || {};
        const rt = rb.translation || {};
        const tcSet = new Set([...(rt.completedIds || []), ...(lt.completedIds || [])]);
        const tScores = Object.assign({}, rt.scores || {}, lt.scores || {});
        for (const id of Object.keys(tScores)) {
          tScores[id] = Math.max(Number((rt.scores && rt.scores[id]) || 0), Number((lt.scores && lt.scores[id]) || 0));
        }
        out.externalLibraryProgress.writing.translation = {
          drafts: Object.assign({}, rt.drafts || {}, lt.drafts || {}),
          completedIds: Array.from(tcSet),
          scores: tScores,
          history: mergeById(lt.history || [], rt.history || [], "id"),
          weakFocuses: Array.from(new Set([...(rt.weakFocuses || []), ...(lt.weakFocuses || [])])),
          lastLessonId: lt.lastLessonId || rt.lastLessonId || "tr_hsk1_01"
        };
      }
    }
    return out;
  }

  /* -------------------- REAL-TIME WEBSOCKET SYNC (24/7) -------------------- */
  function connectRealtime(onRemoteSnapshot, onRevoked) {
    const uid = session && session.user && session.user.id;
    if (!isCloudMode() || !uid || !session.access_token || typeof WebSocket === "undefined") return;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    wsManualClose = false;
    const wsBase = config.supabaseUrl.replace(/^http/i, "ws");
    const wsUrl = `${wsBase}/realtime/v1/websocket?apikey=${encodeURIComponent(config.supabaseAnonKey)}&vsn=1.0.0`;

    try {
      const sock = new WebSocket(wsUrl);
      ws = sock;
      const topic = `realtime:public:qchinese_${uid}`;

      sock.onopen = () => {
        wsAttempts = 0;
        realtimeConnected = true;
        sock.send(JSON.stringify({
          topic,
          event: "phx_join",
          payload: {
            config: {
              broadcast: { self: false },
              presence: { key: getDeviceId() },
              postgres_changes: [
                { event: "*", schema: "public", table: "qchinese_user_snapshots", filter: `user_id=eq.${uid}` },
                { event: "*", schema: "public", table: "qchinese_user_devices", filter: `user_id=eq.${uid}` }
              ]
            },
            access_token: session.access_token
          },
          ref: String(++wsRef)
        }));

        clearInterval(wsHeartbeat);
        wsHeartbeat = setInterval(() => {
          if (sock.readyState === WebSocket.OPEN) {
            sock.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: String(++wsRef) }));
          }
        }, 25000);
      };

      sock.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (!msg || msg.event !== "postgres_changes") return;
          const data = msg.payload && msg.payload.data;
          if (!data) return;
          const rec = data.record || data.new;
          if (!rec) return;

          if (data.table === "qchinese_user_devices") {
            if (rec.device_id === getDeviceId() && rec.is_revoked === true && typeof onRevoked === "function") {
              onRevoked();
            }
            return;
          }
          if (data.table === "qchinese_user_snapshots") {
            if (rec.device_id === getDeviceId()) return;
            const rev = Number(rec.revision) || 1;
            if (rev > cloudRevision && rec.state_json) {
              cloudRevision = rev;
              if (typeof onRemoteSnapshot === "function") onRemoteSnapshot(rec.state_json, rev);
            }
          }
        } catch (_) {}
      };

      sock.onclose = () => {
        clearInterval(wsHeartbeat);
        wsHeartbeat = null;
        realtimeConnected = false;
        if (!wsManualClose && session && session.user && session.user.id === uid) {
          const delay = Math.min(20000, 1500 * Math.pow(2, wsAttempts++));
          clearTimeout(wsReconnect);
          wsReconnect = setTimeout(() => {
            if (navigator.onLine) connectRealtime(onRemoteSnapshot, onRevoked);
          }, delay);
        }
      };

      sock.onerror = () => {
        try { sock.close(); } catch (_) {}
      };

      clearInterval(fallbackPoll);
      fallbackPoll = setInterval(async () => {
        if (document.hidden || !navigator.onLine || !session || !session.user) return;
        const snap = await fetchSnapshot();
        if (snap.ok && snap.state && snap.revision > cloudRevision && typeof onRemoteSnapshot === "function") {
          cloudRevision = snap.revision;
          onRemoteSnapshot(snap.state, snap.revision);
        }
      }, 30000);
    } catch (_) {}
  }

  function disconnectRealtime() {
    wsManualClose = true;
    clearInterval(wsHeartbeat);
    clearTimeout(wsReconnect);
    clearInterval(fallbackPoll);
    wsHeartbeat = null;
    wsReconnect = null;
    fallbackPoll = null;
    realtimeConnected = false;
    if (ws) {
      try { ws.close(); } catch (_) {}
      ws = null;
    }
  }

  return {
    initConfig,
    isCloudMode,
    getConfig: () => config,
    getDeviceId,
    isRealtimeConnected: () => realtimeConnected,
    isSchemaMissing: () => schemaMissing,
    hasRecoveryToken: () => Boolean(recoveryAccessToken),
    restoreSession,
    signUp,
    signIn,
    sendPasswordReset,
    updatePasswordWithRecovery,
    updateAccountProfile,
    signOut,
    registerCurrentDevice,
    listActiveDevices,
    revokeDevice,
    revokeAllDevices,
    fetchSnapshot,
    pushSnapshot,
    mergeStates,
    connectRealtime,
    disconnectRealtime
  };
})();
