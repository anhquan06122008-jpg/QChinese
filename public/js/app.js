/* -*- coding: utf-8 -*-
 * QChinese – Main Application Router, 13-Section Sidebar, Top Quick Pinyin/Hanzi Search & Multi-User Auth Gate
 */

window.QApp = (function () {
  let currentRoute = "dashboard";

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "assessment", label: "Đánh giá trình độ", icon: "🧭" },
    { id: "vocab", label: "Học từ vựng", icon: "📖" },
    { id: "hanzi", label: "Học chữ Hán", icon: "✍️" },
    { id: "pinyin", label: "Pinyin và phát âm", icon: "🎵" },
    { id: "grammar", label: "Ngữ pháp", icon: "🧩" },
    { id: "listening", label: "Luyện nghe", icon: "🎧" },
    { id: "speaking", label: "Luyện nói", icon: "🎙️" },
    { id: "reading", label: "Luyện đọc", icon: "📰" },
    { id: "writing", label: "Luyện viết", icon: "🖋️" },
    { id: "notebook", label: "Sổ tay", icon: "📒" },
    { id: "analytics", label: "Thống kê tiến độ", icon: "📊" },
    { id: "settings", label: "Cài đặt", icon: "⚙️" }
  ];

  function renderSidebar() {
    const navEl = document.getElementById("sidebar-nav");
    if (!navEl) return;
    navEl.innerHTML = NAV_ITEMS.map(
      (item) => `
      <button class="nav-btn ${currentRoute === item.id ? "active" : ""}" data-route="${item.id}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `
    ).join("");

    navEl.querySelectorAll("[data-route]").forEach((btn) => {
      btn.onclick = () => {
        navigate(btn.getAttribute("data-route"));
        document.getElementById("sidebar").classList.remove("open");
      };
    });
  }

  function refreshTopbar() {
    const st = QCore.getState();
    const user = QCore.getUser();
    if (!st) return;

    const p = st.profile;
    const streakEl = document.getElementById("top-streak");
    const hanziEl = document.getElementById("top-hanzi");
    const hskEl = document.getElementById("top-hsk");
    const themeBtn = document.getElementById("top-theme-btn");
    const sbName = document.getElementById("sb-user-name");
    const sbSub = document.getElementById("sb-user-sub");
    const sbAvatar = document.getElementById("sb-user-avatar");

    const memHanzi = Object.values(st.hanziProgress).filter((x) => x.memorized).length;

    if (streakEl) streakEl.textContent = `🔥 ${p.streakDays || 1} ngày`;
    if (hanziEl) hanziEl.textContent = `✿ ${memHanzi} chữ`;
    if (hskEl) hskEl.textContent = `✦ HSK ${p.hskLevel}`;
    if (themeBtn) themeBtn.textContent = p.theme === "dark" ? "☀️ Sáng" : "🌙 Tối";

    if (sbName) sbName.textContent = p.name || (user && user.displayName) || "Học viên";
    if (sbSub) sbSub.textContent = `@${(user && user.username) || "user"} · HSK ${p.hskLevel}`;
    if (sbAvatar) sbAvatar.textContent = (p.name || "H").trim().charAt(0).toUpperCase();
  }

  function navigate(route, params = {}) {
    currentRoute = route;
    QPinyinIME.hideBar();
    renderSidebar();
    refreshTopbar();

    const main = document.getElementById("page-content");
    if (!main) return;
    // Trigger gentle entrance animation
    main.style.animation = "none";
    void main.offsetWidth;
    main.style.animation = "";

    switch (route) {
      case "dashboard":
        QDashboardAssessment.renderDashboard(main);
        break;
      case "assessment":
        QDashboardAssessment.renderAssessment(main);
        break;
      case "vocab":
        QVocabTutor.renderVocab(main);
        break;
      case "hanzi":
        QHanziStudio.renderHanzi(main, params);
        break;
      case "pinyin":
        QPinyinListening.renderPinyin(main);
        break;
      case "grammar":
        QGrammarReadingWriting.renderGrammar(main);
        break;
      case "listening":
        QPinyinListening.renderListening(main);
        break;
      case "speaking":
        QGrammarReadingWriting.renderSpeaking(main);
        break;
      case "reading":
        QGrammarReadingWriting.renderReading(main);
        break;
      case "writing":
        QGrammarReadingWriting.renderWriting(main);
        break;
      case "notebook":
        QNotebookAnalyticsSettings.renderNotebook(main);
        break;
      case "analytics":
        QNotebookAnalyticsSettings.renderAnalytics(main);
        break;
      case "settings":
        QNotebookAnalyticsSettings.renderSettings(main);
        break;
      default:
        QDashboardAssessment.renderDashboard(main);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initQuickSearch() {
    const inp = document.getElementById("quick-search-input");
    const drop = document.getElementById("quick-search-dropdown");
    if (!inp || !drop) return;

    inp.addEventListener("input", () => {
      const q = inp.value.trim();
      if (!q) {
        drop.classList.remove("open");
        return;
      }
      const ql = q.toLowerCase();
      // Combine Pinyin IME suggestions + Vietnamese/English/Hanzi dictionary matches
      const pyHits = QPinyinIME.searchByPinyin(ql, 6);
      const vocabHits = (window.QCHINESE_VOCAB || [])
        .filter(
          (v) =>
            v.hanzi.includes(q) ||
            v.meanings.vietnamese.join(" ").toLowerCase().includes(ql) ||
            v.meanings.english.join(" ").toLowerCase().includes(ql) ||
            v.pinyin.toLowerCase().includes(ql)
        )
        .slice(0, 5)
        .map((v) => ({ hanzi: v.hanzi, pinyin: v.pinyin, vi: v.meanings.vietnamese[0] }));

      const seen = new Set();
      const merged = [];
      [...pyHits, ...vocabHits].forEach((item) => {
        if (!seen.has(item.hanzi)) {
          seen.add(item.hanzi);
          merged.push(item);
        }
      });

      if (!merged.length) {
        drop.innerHTML = `<div style="padding:12px 14px;font-size:13px;color:var(--text-muted);">Không tìm thấy từ phù hợp. Nếu bạn nhập 1 chữ Hán, bấm Enter để xem thứ tự nét!</div>`;
        drop.classList.add("open");
        return;
      }

      drop.innerHTML = merged
        .slice(0, 8)
        .map(
          (m) => `
        <div class="qs-item" data-qs-hz="${QCore.escapeHtml(m.hanzi)}">
          <div>
            <strong class="hanzi-text" style="font-size:20px;">${QCore.escapeHtml(m.hanzi)}</strong>
            <span class="pinyin-text" style="color:var(--primary);font-weight:700;margin-left:8px;">${QCore.escapeHtml(m.pinyin)}</span>
            <div style="font-size:12.5px;color:var(--text-secondary);">🇻🇳 ${QCore.escapeHtml(m.vi)}</div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-soft btn-sm" data-qs-audio="${QCore.escapeHtml(m.hanzi)}">🔊</button>
            <button class="btn btn-outline btn-sm" data-qs-write="${QCore.escapeHtml(m.hanzi.charAt(0))}">✍️ Nét chữ</button>
          </div>
        </div>
      `
        )
        .join("");
      drop.classList.add("open");

      drop.querySelectorAll("[data-qs-audio]").forEach((b) => {
        b.onclick = (ev) => {
          ev.stopPropagation();
          QCore.speakChinese(b.getAttribute("data-qs-audio"));
        };
      });
      drop.querySelectorAll("[data-qs-write],[data-qs-hz]").forEach((el) => {
        el.onclick = () => {
          const hz = el.getAttribute("data-qs-write") || el.getAttribute("data-qs-hz");
          drop.classList.remove("open");
          inp.value = "";
          navigate("hanzi", { char: hz.charAt(0) });
        };
      });
    });

    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const m = inp.value.match(/[\u3400-\u9fff]/);
        if (m) {
          drop.classList.remove("open");
          inp.value = "";
          navigate("hanzi", { char: m[0] });
        }
      }
    });

    document.addEventListener("click", (e) => {
      if (!drop.contains(e.target) && e.target !== inp) {
        drop.classList.remove("open");
      }
    });
  }

  /* Multi-User Authentication Modal Gate */
  function showAuthGate() {
    const gate = document.getElementById("auth-modal");
    if (!gate) return;
    let authTab = "login"; // "login" | "register"

    function drawAuth() {
      gate.classList.add("open");
      gate.innerHTML = `
        <div class="modal-card" style="max-width:460px;">
          <div style="text-align:center;margin-bottom:18px;">
            <div class="brand-seal" style="margin:0 auto 10px;width:54px;height:54px;font-size:28px;">练</div>
            <h2 style="margin:0;font-size:22px;">CHINESE PERSONAL TUTOR</h2>
            <div style="color:var(--primary);font-weight:700;font-size:14px;">AI 汉语私人教师 · Tiếng Trung Giản Thể</div>
            <p style="font-size:13px;color:var(--text-secondary);margin:6px 0 0;">
              Mỗi người học có một tài khoản & mật khẩu riêng — chia sẻ web cho bạn bè học cùng thoải mái mà không lo trùng tiến độ!
            </p>
          </div>

          <div class="tabs-bar" style="width:100%;margin-bottom:16px;">
            <button class="tab-pill ${authTab === "login" ? "active" : ""}" style="flex:1;" id="auth-tab-login">Đăng nhập</button>
            <button class="tab-pill ${authTab === "register" ? "active" : ""}" style="flex:1;" id="auth-tab-reg">Tạo tài khoản mới</button>
          </div>

          <div id="auth-err" style="color:var(--accent-red);font-size:13px;margin-bottom:10px;display:none;"></div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <label style="font-size:13px;font-weight:600;">Tên tài khoản (viết liền không dấu, vd: minh_an)
              <input class="input-field" id="auth-user" placeholder="Nhập tên tài khoản...">
            </label>

            ${
              authTab === "register"
                ? `
              <label style="font-size:13px;font-weight:600;">Tên gọi hiển thị của bạn (vd: Minh An)
                <input class="input-field" id="auth-disp" placeholder="Giáo viên AI sẽ chào bạn bằng tên này...">
              </label>
            `
                : ""
            }

            <label style="font-size:13px;font-weight:600;">Mật khẩu (tối thiểu 6 ký tự)
              <input type="password" class="input-field" id="auth-pw" placeholder="Nhập mật khẩu bảo mật...">
            </label>

            <button class="btn btn-primary" style="margin-top:6px;width:100%;padding:12px;" id="auth-submit">
              ${authTab === "login" ? "🚀 Đăng nhập vào lớp học" : "✨ Tạo tài khoản & Bắt đầu từ con số 0"}
            </button>
          </div>

          <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border-color);text-align:center;">
            <small style="color:var(--text-muted);display:block;margin-bottom:6px;">Lần đầu ghé thăm? Bấm nút dưới để chuyển sang tạo tài khoản riêng trong 5 giây:</small>
            <button class="btn btn-soft btn-sm" id="auth-switch-quick">
              ${authTab === "login" ? "Chưa có tài khoản? Đăng ký ngay →" : "Đã có tài khoản? Đăng nhập →"}
            </button>
          </div>
        </div>
      `;

      gate.querySelector("#auth-tab-login").onclick = () => { authTab = "login"; drawAuth(); };
      gate.querySelector("#auth-tab-reg").onclick = () => { authTab = "register"; drawAuth(); };
      gate.querySelector("#auth-switch-quick").onclick = () => {
        authTab = authTab === "login" ? "register" : "login";
        drawAuth();
      };

      const doSubmit = async () => {
        const u = gate.querySelector("#auth-user").value.trim();
        const pw = gate.querySelector("#auth-pw").value;
        const dispEl = gate.querySelector("#auth-disp");
        const disp = dispEl ? dispEl.value.trim() : u;
        const errBox = gate.querySelector("#auth-err");
        errBox.style.display = "none";

        try {
          if (authTab === "login") {
            await QCore.loginAccount(u, pw);
          } else {
            await QCore.registerAccount(u, disp || u, pw);
          }
          gate.classList.remove("open");
          QCore.showToast(`Chào mừng ${QCore.getState().profile.name} đến với QChinese!`);
          navigate("dashboard");
        } catch (err) {
          errBox.textContent = "⚠️ " + err.message;
          errBox.style.display = "block";
        }
      };

      gate.querySelector("#auth-submit").onclick = doSubmit;
      gate.querySelector("#auth-pw").addEventListener("keydown", (e) => {
        if (e.key === "Enter") doSubmit();
      });
    }

    drawAuth();
  }

  async function init() {
    QPinyinIME.initGlobalListeners();
    initQuickSearch();

    const mobBtn = document.getElementById("mobile-menu-btn");
    if (mobBtn) {
      mobBtn.onclick = () => {
        document.getElementById("sidebar").classList.toggle("open");
      };
    }

    const themeBtn = document.getElementById("top-theme-btn");
    if (themeBtn) {
      themeBtn.onclick = () => {
        QCore.toggleTheme();
        refreshTopbar();
      };
    }

    const sbSwitchBtn = document.getElementById("sb-switch-account");
    if (sbSwitchBtn) {
      sbSwitchBtn.onclick = async () => {
        await QCore.logoutAccount();
        showAuthGate();
      };
    }

    const session = await QCore.initSession();
    if (!session.authenticated) {
      renderSidebar();
      showAuthGate();
    } else {
      navigate("dashboard");
    }
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    navigate,
    refreshTopbar,
    showAuthGate
  };
})();
