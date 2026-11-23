/* -*- coding: utf-8 -*-
 * QChinese – Main Application Router, 13-Section Sidebar, Top Quick Pinyin/Hanzi Search & Multi-User Auth Gate
 */

window.QApp = (function () {
  let currentRoute = "dashboard";
  let currentParams = {};

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "vocab", label: "Kho từ vựng HSK", icon: "📚" },
    { id: "pinyin", label: "Phòng luyện Pinyin", icon: "🎵" },
    { id: "ai-tutor", label: "QChinese AI Tutor", icon: "🤖" },
    { id: "ai-tournament", label: "Đấu trường 100 AI", icon: "🏆" },
    { id: "ai-pdf", label: "AI PDF · HSK 3.0", icon: "📄" },
    { id: "lessons", label: "Khóa học & Lesson", icon: "🎓" },
    { id: "materials", label: "Kho tài liệu cá nhân", icon: "📁" },
    { id: "hanzi", label: "Học chữ Hán", icon: "✍️" },
    { id: "assessment", label: "Đánh giá trình độ", icon: "🧭" },
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
    currentParams = params || {};
    if (window.QAiTournament && typeof window.QAiTournament.stopPolling === "function") {
      window.QAiTournament.stopPolling();
    }
    if (window.QAiPdfStudio && typeof window.QAiPdfStudio.stopPoll === "function") {
      window.QAiPdfStudio.stopPoll();
    }
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
        QVocabTutor.renderVocab(main, params);
        break;
      case "hanzi":
        QHanziStudio.renderHanzi(main, params);
        break;
      case "pinyin":
        QPinyinListening.renderPinyin(main, params);
        break;
      case "ai-tutor":
        QAiTutor.renderAiTutor(main, params);
        break;
      case "ai-tournament":
        QAiTournament.renderTournament(main);
        break;
      case "ai-pdf":
        QAiPdfStudio.renderPdfStudio(main);
        break;
      case "lessons":
        QLessonStudio.renderLessons(main, params);
        break;
      case "materials":
        QMaterialsHub.renderMaterials(main, params);
        break;
      case "grammar":
        QGrammarReadingWriting.renderGrammar(main);
        break;
      case "listening":
        QPinyinListening.renderListening(main, params);
        break;
      case "speaking":
        QGrammarReadingWriting.renderSpeaking(main, false, params);
        break;
      case "reading":
        QGrammarReadingWriting.renderReading(main, params);
        break;
      case "writing":
        QGrammarReadingWriting.renderWriting(main, params);
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
      const pyHits = QPinyinIME.searchByPinyin(ql, 5);
      const storeHits = (window.QVocabStore ? QVocabStore.searchLoaded(q, 8) : []).map((v) => ({
        hanzi: v.hanzi,
        pinyin: v.pinyin,
        vi: QVocabStore.getDisplayMeaning(v)
      }));
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
      [...storeHits, ...pyHits, ...vocabHits].forEach((item) => {
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
  function showAuthGate(initialMode = "login") {
    const gate = document.getElementById("auth-modal");
    if (!gate) return;
    const cloudMode = QCore.isCloudAuthMode();
    let authTab = initialMode === "recovery-reset" ? "recovery-reset" : "login"; // "login" | "register" | "recover" | "recovery-reset"

    function drawAuth() {
      gate.classList.add("open");
      const idLabel = cloudMode ? "Email" : "Tên tài khoản (viết liền không dấu, vd: minh_an)";
      const idPlaceholder = cloudMode ? "vd: anhquan06122008@gmail.com" : "Nhập tên tài khoản...";
      const idType = cloudMode ? "email" : "text";
      gate.innerHTML = `
        <div class="modal-card" style="max-width:440px;">
          <div style="text-align:center;margin-bottom:16px;">
            <div class="brand-seal" style="margin:0 auto 8px;width:50px;height:50px;font-size:26px;">练</div>
            <h2 style="margin:0;font-size:21px;">CHINESE PERSONAL TUTOR</h2>
            <div style="color:var(--primary);font-weight:700;font-size:13.5px;margin-top:2px;">AI 汉语私人教师 · Tiếng Trung Giản Thể</div>
            <p style="font-size:12.5px;color:var(--text-secondary);margin:6px 0 0;">
              ${cloudMode
                ? "Đăng nhập bằng tài khoản Cloud (dùng chung hệ sinh thái QEnglish · TKB) để tự động đồng bộ tiến độ 24/7."
                : "Mỗi người học có một tài khoản & mật khẩu riêng — chia sẻ web cho bạn bè học cùng thoải mái mà không lo trùng tiến độ!"}
            </p>
          </div>

          ${
            authTab === "recover" || authTab === "recovery-reset"
              ? `
            <div style="text-align:center;margin-bottom:14px;">
              <div style="font-size:15px;font-weight:700;color:var(--text-primary);">🔑 Khôi phục mật khẩu</div>
              <div style="font-size:12.5px;color:var(--text-muted);margin-top:2px;">
                ${authTab === "recovery-reset"
                  ? "Nhập mật khẩu mới cho tài khoản của bạn"
                  : cloudMode
                    ? "Nhập Email đã đăng ký để nhận liên kết đặt lại mật khẩu"
                    : "Nhập tên tài khoản và mã khôi phục đã lưu để đặt mật khẩu mới"}
              </div>
            </div>
          `
              : `
            <div class="tabs-bar" style="width:100%;margin-bottom:16px;">
              <button class="tab-pill ${authTab === "login" ? "active" : ""}" style="flex:1;" id="auth-tab-login">Đăng nhập</button>
              <button class="tab-pill ${authTab === "register" ? "active" : ""}" style="flex:1;" id="auth-tab-reg">Tạo tài khoản</button>
            </div>
          `
          }

          <div id="auth-err" style="color:var(--accent-red);font-size:13px;margin-bottom:10px;display:none;"></div>
          <div id="auth-ok" style="color:var(--primary);font-size:13px;margin-bottom:10px;display:none;"></div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            ${
              authTab === "recovery-reset"
                ? `
              <label style="font-size:13px;font-weight:600;">Mật khẩu mới (tối thiểu 6 ký tự)
                <input type="password" class="input-field" id="auth-pw" placeholder="Nhập mật khẩu mới...">
              </label>
            `
                : `
              <label style="font-size:13px;font-weight:600;">${idLabel}
                <input type="${idType}" class="input-field" id="auth-user" placeholder="${idPlaceholder}">
              </label>

              ${
                authTab === "register"
                  ? `
                <label style="font-size:13px;font-weight:600;">Tên gọi hiển thị của bạn (vd: Anh Quân)
                  <input class="input-field" id="auth-disp" placeholder="Giáo viên AI sẽ chào bạn bằng tên này...">
                </label>
              `
                  : ""
              }

              ${
                authTab === "recover"
                  ? cloudMode
                    ? ""
                    : `
                  <label style="font-size:13px;font-weight:600;">Mã khôi phục (QCN-XXXX-XXXX-XXXX)
                    <input class="input-field" id="auth-reckey" placeholder="Nhập mã khôi phục đã lưu...">
                  </label>
                  <label style="font-size:13px;font-weight:600;">Mật khẩu mới (tối thiểu 6 ký tự)
                    <input type="password" class="input-field" id="auth-pw" placeholder="Nhập mật khẩu mới...">
                  </label>
                `
                  : `
                <label style="font-size:13px;font-weight:600;">Mật khẩu (tối thiểu 6 ký tự)
                  <input type="password" class="input-field" id="auth-pw" placeholder="Nhập mật khẩu bảo mật...">
                </label>
              `
              }
            `
            }

            <button class="btn btn-primary" style="margin-top:6px;width:100%;padding:12px;font-weight:700;" id="auth-submit">
              ${
                authTab === "login"
                  ? "Đăng nhập"
                  : authTab === "register"
                    ? "Tạo tài khoản"
                    : authTab === "recover" && cloudMode
                      ? "Gửi liên kết khôi phục"
                      : "Đặt lại mật khẩu"
              }
            </button>

            ${
              authTab === "login"
                ? `
              <div style="text-align:center;margin-top:2px;">
                <button type="button" id="auth-tab-rec" style="background:none;border:none;color:var(--primary);font-size:13px;font-weight:600;cursor:pointer;padding:4px 8px;text-decoration:underline;text-underline-offset:3px;">
                  Khôi phục mật khẩu
                </button>
              </div>
            `
                : authTab === "recover" || authTab === "recovery-reset"
                ? `
              <div style="text-align:center;margin-top:2px;">
                <button type="button" id="auth-back-login" style="background:none;border:none;color:var(--primary);font-size:13px;font-weight:600;cursor:pointer;padding:4px 8px;">
                  ← Quay lại đăng nhập
                </button>
              </div>
            `
                : ""
            }
          </div>

          <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--border-color);text-align:center;">
            <button class="btn btn-soft btn-sm" id="auth-switch-quick">
              ${authTab === "login" ? "Chưa có tài khoản? Đăng ký ngay →" : "Đã có tài khoản? Đăng nhập →"}
            </button>
          </div>
        </div>
      `;

      const tabLoginBtn = gate.querySelector("#auth-tab-login");
      const tabRegBtn = gate.querySelector("#auth-tab-reg");
      const tabRecBtn = gate.querySelector("#auth-tab-rec");
      const backLoginBtn = gate.querySelector("#auth-back-login");
      if (tabLoginBtn) tabLoginBtn.onclick = () => { authTab = "login"; drawAuth(); };
      if (tabRegBtn) tabRegBtn.onclick = () => { authTab = "register"; drawAuth(); };
      if (tabRecBtn) tabRecBtn.onclick = () => { authTab = "recover"; drawAuth(); };
      if (backLoginBtn) backLoginBtn.onclick = () => { authTab = "login"; drawAuth(); };
      gate.querySelector("#auth-switch-quick").onclick = () => {
        authTab = authTab === "login" ? "register" : "login";
        drawAuth();
      };

      const doSubmit = async () => {
        const uEl = gate.querySelector("#auth-user");
        const pwEl = gate.querySelector("#auth-pw");
        const u = uEl ? uEl.value.trim() : "";
        const pw = pwEl ? pwEl.value : "";
        const dispEl = gate.querySelector("#auth-disp");
        const recEl = gate.querySelector("#auth-reckey");
        const disp = dispEl ? dispEl.value.trim() : u;
        const errBox = gate.querySelector("#auth-err");
        const okBox = gate.querySelector("#auth-ok");
        const submitBtn = gate.querySelector("#auth-submit");
        errBox.style.display = "none";
        if (okBox) okBox.style.display = "none";
        if (submitBtn) submitBtn.disabled = true;

        try {
          if (authTab === "recovery-reset" && cloudMode && window.QCloud) {
            const msg = await QCloud.updatePasswordWithRecovery(pw);
            if (okBox) { okBox.textContent = "✅ " + msg; okBox.style.display = "block"; }
            return;
          }
          if (authTab === "recover") {
            if (cloudMode && window.QCloud) {
              const msg = await QCloud.sendPasswordReset(u);
              if (okBox) { okBox.textContent = "✅ " + msg; okBox.style.display = "block"; }
              return;
            }
            const res = await QCore.apiFetch("/api/auth/recover-password", {
              method: "POST",
              body: { username: u, recoveryKey: recEl ? recEl.value.trim() : "", newPassword: pw }
            });
            if (okBox) {
              okBox.textContent = "✅ " + (res.message || "Đặt lại mật khẩu thành công! Hãy quay lại Đăng nhập.");
              okBox.style.display = "block";
            }
            return;
          }
          if (authTab === "login") {
            await QCore.loginAccount(u, pw);
          } else {
            const usr = await QCore.registerAccount(u, disp || u, pw);
            if (usr && usr.needsVerification) {
              if (okBox) { okBox.textContent = "✅ " + usr.message; okBox.style.display = "block"; }
              return;
            }
            if (usr && usr.recoveryKey) {
              QCore.showToast(`🔑 Mã khôi phục của bạn: ${usr.recoveryKey} (hãy lưu lại!)`);
            }
          }
          gate.classList.remove("open");
          QCore.showToast(`Chào mừng ${QCore.getState().profile.name} đến với QChinese!`);
          navigate("dashboard");
        } catch (err) {
          errBox.textContent = "⚠️ " + err.message;
          errBox.style.display = "block";
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      };

      gate.querySelector("#auth-submit").onclick = doSubmit;
      const pwInput = gate.querySelector("#auth-pw") || gate.querySelector("#auth-user");
      if (pwInput) {
        pwInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") doSubmit();
        });
      }
    }

    drawAuth();
  }

  async function init() {
    if (window.QVocabStore) QVocabStore.init();
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
      showAuthGate(session.recoveryMode ? "recovery-reset" : "login");
    } else {
      navigate("dashboard");
    }
  }

  document.addEventListener("DOMContentLoaded", init);

  function refreshCurrentView() {
    if (currentRoute) {
      navigate(currentRoute, currentParams);
    }
  }

  return {
    navigate,
    refreshCurrentView,
    refreshTopbar,
    showAuthGate
  };
})();
