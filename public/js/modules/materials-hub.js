/* -*- coding: utf-8 -*-
 * QChinese – My Learning Materials (Kho Tài Liệu Cá Nhân) & Public URL / File Importer
 * Integrates directly with Writing, Listening, Speaking, and LWT-Style Interactive Reading!
 */

window.QMaterialsHub = (function () {
  let filterCat = "all";
  let filterFolder = "all";
  let filterHsk = "all";
  let searchQuery = "";
  let addMode = "manual"; // manual | upload | url
  let showAddPanel = false;
  let editingId = null;

  const CATEGORIES = [
    { id: "writing", label: "✍️ Writing – Bài tập viết" },
    { id: "listening", label: "🎧 Listening – Bài tập nghe" },
    { id: "speaking", label: "🎙️ Speaking – Chủ đề nói" },
    { id: "reading", label: "📖 Reading – Bài tập đọc" },
    { id: "vocabulary", label: "📚 Vocabulary – Từ vựng" },
    { id: "grammar", label: "🧩 Grammar – Ngữ pháp" },
    { id: "hsk", label: "🎯 HSK Practice – Đề thi HSK" },
    { id: "other", label: "📌 Other – Tài liệu khác" }
  ];

  const FOLDERS = [
    "Tài liệu trên lớp",
    "Bài tập giảng viên giao",
    "Bài luyện thi HSK",
    "Bài tự học",
    "Tài liệu tham khảo"
  ];

  const STATUS_MAP = {
    not_started: { label: "Chưa học", cls: "badge-blue" },
    in_progress: { label: "Đang học", cls: "badge-amber" },
    completed: { label: "Hoàn thành", cls: "badge-jade" }
  };

  function renderMaterials(container, params = {}) {
    if (params && params.category) filterCat = params.category;
    const st = QCore.getState();
    const allMats = (st && st.materials) || [];

    const filtered = allMats.filter((m) => {
      if (filterCat !== "all" && m.category !== filterCat) return false;
      if (filterFolder !== "all" && m.folder !== filterFolder) return false;
      if (filterHsk !== "all" && Number(m.hskLevel) !== Number(filterHsk)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const hay = [m.title, m.content, m.source, m.topic, m.notes].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>📁 My Learning Materials – Kho Tài Liệu Cá Nhân</h2>
          <p>Đưa đề bài giảng viên giao, file nghe MP3/WAV, file DOCX/TXT/PDF, ảnh hoặc URL bài học công khai vào để luyện trực tiếp Writing, Listening, Speaking & Reading với AI.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="mat-toggle-add">${showAddPanel ? "✕ Đóng biểu mẫu" : "➕ Thêm tài liệu mới"}</button>
          <button class="btn btn-soft btn-sm" id="mat-add-demo">✨ Thêm 3 đề mẫu thử ngay</button>
        </div>
      </div>

      ${showAddPanel ? renderAddPanelHTML() : ""}

      <!-- Filter Bar -->
      <div class="card" style="padding:14px 16px;margin-bottom:16px;">
        <div style="display:grid;grid-template-columns:minmax(200px,1.5fr) repeat(3,minmax(145px,1fr));gap:10px;">
          <input class="input-field" id="mat-search" value="${QCore.escapeHtml(searchQuery)}" placeholder="🔍 Tìm tên tài liệu, nội dung, ghi chú..." />
          <select class="select-field" id="mat-f-cat">
            <option value="all">Tất cả loại (${allMats.length})</option>
            ${CATEGORIES.map((c) => `<option value="${c.id}" ${filterCat === c.id ? "selected" : ""}>${c.label}</option>`).join("")}
          </select>
          <select class="select-field" id="mat-f-folder">
            <option value="all">📂 Tất cả thư mục</option>
            ${FOLDERS.map((f) => `<option value="${QCore.escapeHtml(f)}" ${filterFolder === f ? "selected" : ""}>${QCore.escapeHtml(f)}</option>`).join("")}
          </select>
          <select class="select-field" id="mat-f-hsk">
            <option value="all">🎯 Mọi cấp HSK</option>
            ${[1, 2, 3, 4, 5, 6].map((lv) => `<option value="${lv}" ${String(filterHsk) === String(lv) ? "selected" : ""}>HSK ${lv}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Materials Grid -->
      ${filtered.length ? `
        <div class="grid-2" style="gap:14px;">
          ${filtered.map((m) => renderMaterialCardHTML(m)).join("")}
        </div>
      ` : `
        <div class="card" style="text-align:center;padding:42px;">
          <div style="font-size:40px;margin-bottom:8px;">📂</div>
          <h3 style="margin:0 0 6px;">Kho tài liệu của bạn chưa có mục nào khớp bộ lọc</h3>
          <p style="color:var(--text-secondary);margin-bottom:16px;">Bấm <strong>"➕ Thêm tài liệu mới"</strong> để tải file/dán đề bài giảng viên giao, hoặc bấm <strong>"✨ Thêm 3 đề mẫu thử ngay"</strong> để trải nghiệm tích hợp 4 kỹ năng!</p>
        </div>
      `}
    `;

    // Bind top actions
    container.querySelector("#mat-toggle-add").onclick = () => {
      showAddPanel = !showAddPanel;
      editingId = null;
      renderMaterials(container);
    };
    container.querySelector("#mat-add-demo").onclick = () => {
      QCore.addMaterial({
        title: "Bài tập viết HSK 2: Giới thiệu gia đình của bạn",
        category: "writing",
        folder: "Bài tập giảng viên giao",
        source: "Đề bài mẫu giảng viên",
        hskLevel: 2,
        topic: "Gia đình",
        content: "请写一篇关于你的家庭的短文（不少于50个字），介绍一下你家有几口人、他们做什么工作以及你们周末常做什么。",
        notes: "Chú ý dùng đúng lượng từ 口, 很 + tính từ và trật tự thời gian."
      });
      QCore.addMaterial({
        title: "Bài đọc hiểu tương tác: Con chó và người đàn ông",
        category: "reading",
        folder: "Tài liệu trên lớp",
        source: "Truyện ngắn HSK 2",
        hskLevel: 2,
        topic: "Đời sống",
        content: "一天，一个男人走在街上。突然，他看见前面有一只黑色的大狗，看起来很凶。男人非常害怕，不敢往前走。狗的旁边站着一个女人，男人问她：你的狗咬人吗？女人说：我的狗不咬人。这时，那只狗咬了男人。他气坏了，大叫：你说你的狗不咬人！女人回答：这不是我的狗。",
        notes: "Bấm vào từng chữ Hán trong trình đọc để tra nghĩa & lưu Sổ tay."
      });
      QCore.addMaterial({
        title: "Chủ đề luyện nói HSK 2: Giới thiệu ngôi trường của bạn",
        category: "speaking",
        folder: "Bài tập giảng viên giao",
        source: "Đề luyện nói trên lớp",
        hskLevel: 2,
        topic: "Trường học",
        content: "请介绍一下你的学校：你的学校在哪里？大不大？你最喜欢学校的什么地方？你在学校学习什么专业？",
        notes: "Luyện phản xạ trả lời 3–5 câu đầy đủ."
      });
      QCore.showToast("✨ Đã thêm 3 tài liệu mẫu (Writing, Reading, Speaking)!");
      renderMaterials(container);
    };

    // Filters
    container.querySelector("#mat-search").oninput = (e) => { searchQuery = e.target.value; renderMaterials(container); };
    container.querySelector("#mat-f-cat").onchange = (e) => { filterCat = e.target.value; renderMaterials(container); };
    container.querySelector("#mat-f-folder").onchange = (e) => { filterFolder = e.target.value; renderMaterials(container); };
    container.querySelector("#mat-f-hsk").onchange = (e) => { filterHsk = e.target.value; renderMaterials(container); };

    if (showAddPanel) bindAddPanelEvents(container);

    // Card actions
    container.querySelectorAll("[data-launch-wr]").forEach((b) => (b.onclick = () => window.QApp.navigate("writing", { materialId: b.getAttribute("data-launch-wr") })));
    container.querySelectorAll("[data-launch-lis]").forEach((b) => (b.onclick = () => window.QApp.navigate("listening", { materialId: b.getAttribute("data-launch-lis") })));
    container.querySelectorAll("[data-launch-spk]").forEach((b) => (b.onclick = () => window.QApp.navigate("speaking", { materialId: b.getAttribute("data-launch-spk") })));
    container.querySelectorAll("[data-launch-rd]").forEach((b) => (b.onclick = () => window.QApp.navigate("reading", { materialId: b.getAttribute("data-launch-rd") })));
    container.querySelectorAll("[data-del-mat]").forEach((b) => {
      b.onclick = () => {
        QCore.deleteMaterial(b.getAttribute("data-del-mat"));
        QCore.showToast("Đã xóa tài liệu khỏi kho cá nhân.");
        renderMaterials(container);
      };
    });
    container.querySelectorAll("[data-status-mat]").forEach((sel) => {
      sel.onchange = () => {
        QCore.updateMaterial(sel.getAttribute("data-status-mat"), { status: sel.value });
        QCore.showToast("Đã cập nhật trạng thái tài liệu.");
        renderMaterials(container);
      };
    });
  }

  function renderMaterialCardHTML(m) {
    const catInfo = CATEGORIES.find((c) => c.id === m.category) || CATEGORIES[7];
    const stInfo = STATUS_MAP[m.status] || STATUS_MAP.not_started;
    const preview = (m.content || m.transcript || "").slice(0, 150);
    return `
      <div class="card" style="padding:18px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px;">
            <div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
                <span class="badge badge-jade">${catInfo.label}</span>
                <span class="badge badge-blue">HSK ${m.hskLevel}</span>
                <span class="badge ${stInfo.cls}">${stInfo.label}</span>
                ${m.score != null ? `<span class="badge badge-amber">Điểm: ${m.score}/100</span>` : ""}
              </div>
              <h3 style="margin:0;font-size:16.5px;">${QCore.escapeHtml(m.title)}</h3>
              <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">
                📂 ${QCore.escapeHtml(m.folder)} · Nguồn: ${QCore.escapeHtml(m.source)} · Thêm ngày ${QCore.escapeHtml(m.createdAt)}
              </div>
              ${m.sourceUrl ? `<div style="font-size:12px;margin-top:2px;"><a href="${QCore.escapeHtml(m.sourceUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--primary);">🔗 Nguồn gốc</a></div>` : ""}
            </div>
            <button class="icon-btn" title="Xóa tài liệu" data-del-mat="${QCore.escapeHtml(m.id)}" style="color:var(--accent-red);">🗑️</button>
          </div>

          ${preview ? `<div class="card-subtle hanzi-text" style="font-size:14.5px;margin:8px 0;padding:10px 12px;">${QCore.escapeHtml(preview)}${(m.content || "").length > 150 ? "..." : ""}</div>` : ""}
          ${m.fileName ? `<div style="font-size:12px;color:var(--primary);margin-bottom:6px;">📎 File đính kèm: ${QCore.escapeHtml(m.fileName)}</div>` : ""}
          ${m.notes ? `<div style="font-size:12.5px;color:var(--text-secondary);margin-bottom:8px;">📝 Ghi chú: ${QCore.escapeHtml(m.notes)}</div>` : ""}
        </div>

        <div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;padding-top:10px;border-top:1px solid var(--border-color);">
            <button class="btn btn-primary btn-sm" data-launch-wr="${QCore.escapeHtml(m.id)}">✍️ Luyện Viết</button>
            <button class="btn btn-soft btn-sm" data-launch-rd="${QCore.escapeHtml(m.id)}">📖 Đọc tương tác</button>
            <button class="btn btn-outline btn-sm" data-launch-lis="${QCore.escapeHtml(m.id)}">🎧 Luyện Nghe</button>
            <button class="btn btn-outline btn-sm" data-launch-spk="${QCore.escapeHtml(m.id)}">🎙️ Luyện Nói</button>
            <select class="select-field" data-status-mat="${QCore.escapeHtml(m.id)}" style="width:auto;padding:4px 8px;font-size:12px;margin-left:auto;">
              <option value="not_started" ${m.status === "not_started" ? "selected" : ""}>Chưa học</option>
              <option value="in_progress" ${m.status === "in_progress" ? "selected" : ""}>Đang học</option>
              <option value="completed" ${m.status === "completed" ? "selected" : ""}>Hoàn thành</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  function renderAddPanelHTML() {
    return `
      <div class="card" style="margin-bottom:18px;border-color:var(--primary);">
        <div class="tabs-bar" style="margin-bottom:14px;">
          <button class="tab-pill ${addMode === "manual" ? "active" : ""}" data-addmode="manual">✍️ Nhập / Dán nội dung</button>
          <button class="tab-pill ${addMode === "upload" ? "active" : ""}" data-addmode="upload">📎 Tải File (DOCX · TXT · PDF · MP3/WAV · Video · Ảnh)</button>
          <button class="tab-pill ${addMode === "url" ? "active" : ""}" data-addmode="url">🌐 Nhập từ URL công khai</button>
        </div>

        ${addMode === "url" ? `
          <div class="card-subtle" style="margin-bottom:12px;">
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Dán URL bài học tiếng Trung công khai (QChinese không vượt qua đăng nhập/paywall/CAPTCHA):</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <input class="input-field" id="mat-url-inp" placeholder="https://..." style="flex:1;min-width:220px;" />
              <button class="btn btn-primary btn-sm" id="mat-url-fetch">⬇️ Lấy tài liệu & Xem trước</button>
            </div>
            <div id="mat-url-status" style="font-size:12.5px;margin-top:6px;color:var(--text-secondary);"></div>
          </div>
        ` : ""}

        ${addMode === "upload" ? `
          <div class="card-subtle" style="margin-bottom:12px;">
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:6px;">Chọn file từ máy tính / điện thoại (giới hạn an toàn 8 MB):</label>
            <input type="file" id="mat-file-inp" accept=".txt,.md,.docx,.pdf,.mp3,.wav,.m4a,.ogg,.mp4,.webm,.png,.jpg,.jpeg,.webp" />
            <div id="mat-file-status" style="font-size:12.5px;margin-top:6px;color:var(--text-secondary);">Hỗ trợ trích xuất chữ tự động cho .txt, .md, .docx (và phát trực tiếp file nghe .mp3/.wav/.mp4).</div>
          </div>
        ` : ""}

        <div class="grid-2" style="gap:10px;margin-bottom:10px;">
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Tên tài liệu *</label>
            <input class="input-field" id="mat-title" placeholder="Ví dụ: Bài viết HSK 3 tuần 4 – Gia đình của tôi" />
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Nguồn tài liệu</label>
            <input class="input-field" id="mat-source" placeholder="Giảng viên / Giáo trình HSK / Website..." value="Người học tải lên" />
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:10px;">
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Loại tài liệu</label>
            <select class="select-field" id="mat-cat">
              ${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join("")}
            </select>
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Thư mục quản lý</label>
            <select class="select-field" id="mat-folder">
              ${FOLDERS.map((f) => `<option value="${QCore.escapeHtml(f)}">${QCore.escapeHtml(f)}</option>`).join("")}
            </select>
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Cấp độ HSK</label>
            <select class="select-field" id="mat-hsk">
              ${[1, 2, 3, 4, 5, 6].map((lv) => `<option value="${lv}">HSK ${lv}</option>`).join("")}
            </select>
          </div>
        </div>

        <div style="margin-bottom:10px;">
          <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Nội dung gốc / Đề bài tiếng Trung (được bảo toàn nguyên văn):</label>
          <textarea class="textarea-field hanzi-text" id="mat-content" rows="5" placeholder="Dán đề bài viết, bài đọc hiểu, chủ đề luyện nói hoặc transcript bài nghe tiếng Trung tại đây..."></textarea>
        </div>

        <div class="grid-2" style="gap:10px;margin-bottom:12px;">
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Đường dẫn Audio/Video (tùy chọn – nếu là bài nghe online)</label>
            <input class="input-field" id="mat-media-url" placeholder="https://.../audio.mp3 hoặc tải file bên trên" />
          </div>
          <div>
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Ghi chú cá nhân</label>
            <input class="input-field" id="mat-notes" placeholder="Hạn nộp, lưu ý của giảng viên..." />
          </div>
        </div>

        <input type="hidden" id="mat-hidden-file-name" />
        <input type="hidden" id="mat-hidden-media-type" />
        <input type="hidden" id="mat-hidden-source-url" />

        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="btn btn-outline" id="mat-cancel">Hủy</button>
          <button class="btn btn-primary" id="mat-save-btn">💾 Lưu vào Kho tài liệu cá nhân</button>
        </div>
      </div>
    `;
  }

  function bindAddPanelEvents(container) {
    container.querySelectorAll("[data-addmode]").forEach((b) => {
      b.onclick = () => {
        addMode = b.getAttribute("data-addmode");
        renderMaterials(container);
      };
    });
    container.querySelector("#mat-cancel").onclick = () => {
      showAddPanel = false;
      renderMaterials(container);
    };

    const urlBtn = container.querySelector("#mat-url-fetch");
    if (urlBtn) {
      urlBtn.onclick = async () => {
        const url = (container.querySelector("#mat-url-inp").value || "").trim();
        const stEl = container.querySelector("#mat-url-status");
        if (!url) { stEl.textContent = "Vui lòng nhập URL hợp lệ (https://...)."; return; }
        if (!QCore.getServerHealth().ok) {
          stEl.innerHTML = `<span style="color:var(--accent-amber);">⚠️ Trích xuất URL trực tiếp cần chạy Python Backend (<code>python server.py</code> hoặc Render). Trên bản tĩnh GitHub Pages, vui lòng sao chép văn bản hợp pháp và dán vào ô Nội dung bên dưới!</span>`;
          return;
        }
        stEl.textContent = "⏳ Đang kiểm tra & trích xuất nội dung công khai...";
        try {
          const res = await QCore.apiFetch("/api/materials/fetch-url", { method: "POST", body: { url } });
          container.querySelector("#mat-title").value = res.title || url;
          container.querySelector("#mat-source").value = new URL(url).hostname;
          container.querySelector("#mat-hidden-source-url").value = res.sourceUrl || url;
          container.querySelector("#mat-content").value = res.content || "";
          if (res.suggestedHsk) container.querySelector("#mat-hsk").value = String(res.suggestedHsk);
          stEl.innerHTML = `<span style="color:var(--primary);font-weight:600;">✅ Trích xuất thành công (${res.hanziCount || 0} chữ Hán)! Hãy kiểm tra bản xem trước bên dưới rồi bấm Lưu.</span>`;
        } catch (err) {
          stEl.innerHTML = `<span style="color:var(--accent-red);">❌ ${QCore.escapeHtml(err.message)}</span>`;
        }
      };
    }

    const fileInp = container.querySelector("#mat-file-inp");
    if (fileInp) {
      fileInp.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        const stEl = container.querySelector("#mat-file-status");
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
          stEl.innerHTML = `<span style="color:var(--accent-red);">❌ File vượt quá giới hạn an toàn 8 MB.</span>`;
          return;
        }
        container.querySelector("#mat-hidden-file-name").value = file.name;
        container.querySelector("#mat-hidden-media-type").value = file.type || "";
        if (!container.querySelector("#mat-title").value) {
          container.querySelector("#mat-title").value = file.name.replace(/\.[^.]+$/, "");
        }

        const ext = file.name.split(".").pop().toLowerCase();
        if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
          const objUrl = URL.createObjectURL(file);
          container.querySelector("#mat-media-url").value = objUrl;
          container.querySelector("#mat-cat").value = "listening";
          stEl.innerHTML = `<span style="color:var(--primary);font-weight:600;">✅ Đã nạp file nghe/video "${QCore.escapeHtml(file.name)}" (${(file.size / 1024).toFixed(0)} KB). Bạn có thể nhập thêm transcript (nếu có) rồi bấm Lưu!</span>`;
          return;
        }
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            container.querySelector("#mat-media-url").value = reader.result;
            stEl.innerHTML = `<span style="color:var(--primary);">✅ Đã tải ảnh "${QCore.escapeHtml(file.name)}". Hãy gõ/dán văn bản đề bài trong ảnh vào ô Nội dung để AI chấm trực tiếp!</span>`;
          };
          reader.readAsDataURL(file);
          return;
        }
        if (ext === "txt" || ext === "md") {
          const text = await file.text();
          container.querySelector("#mat-content").value = text.slice(0, 20000);
          stEl.innerHTML = `<span style="color:var(--primary);font-weight:600;">✅ Đã đọc xong file văn bản (${text.length} ký tự)!</span>`;
          return;
        }
        if (ext === "docx" || ext === "pdf") {
          if (!QCore.getServerHealth().ok) {
            stEl.innerHTML = `<span style="color:var(--accent-amber);">⚠️ Đọc trực tiếp file .${ext} cần Python Backend. Bạn hãy copy nội dung từ file dán vào ô bên dưới rồi lưu nhé!</span>`;
            return;
          }
          stEl.textContent = `⏳ Đang trích xuất văn bản từ ${file.name}...`;
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const b64 = String(reader.result || "").split(",")[1] || "";
              const res = await QCore.apiFetch("/api/materials/extract-file", { method: "POST", body: { filename: file.name, dataBase64: b64 } });
              container.querySelector("#mat-content").value = res.content || "";
              stEl.innerHTML = `<span style="color:var(--primary);font-weight:600;">✅ Đã trích xuất văn bản từ ${QCore.escapeHtml(file.name)} (${res.hanziCount || 0} chữ Hán)!</span>`;
            } catch (err) {
              stEl.innerHTML = `<span style="color:var(--accent-red);">❌ ${QCore.escapeHtml(err.message)}</span>`;
            }
          };
          reader.readAsDataURL(file);
        }
      };
    }

    container.querySelector("#mat-save-btn").onclick = () => {
      const title = (container.querySelector("#mat-title").value || "").trim();
      const content = (container.querySelector("#mat-content").value || "").trim();
      const mediaUrl = (container.querySelector("#mat-media-url").value || "").trim();
      if (!title) { QCore.showToast("Vui lòng nhập tên tài liệu!"); return; }
      if (!content && !mediaUrl) { QCore.showToast("Vui lòng nhập nội dung đề bài hoặc tải file audio/tài liệu!"); return; }
      QCore.addMaterial({
        title,
        source: container.querySelector("#mat-source").value.trim() || "Người học tải lên",
        sourceUrl: container.querySelector("#mat-hidden-source-url").value || "",
        category: container.querySelector("#mat-cat").value,
        folder: container.querySelector("#mat-folder").value,
        hskLevel: Number(container.querySelector("#mat-hsk").value || 1),
        content,
        transcript: container.querySelector("#mat-cat").value === "listening" ? content : "",
        mediaUrl,
        mediaType: container.querySelector("#mat-hidden-media-type").value || "",
        fileName: container.querySelector("#mat-hidden-file-name").value || "",
        notes: container.querySelector("#mat-notes").value.trim()
      });
      showAddPanel = false;
      QCore.showToast(`✅ Đã lưu "${title}" vào Kho tài liệu cá nhân!`);
      renderMaterials(container);
    };
  }

  return {
    renderMaterials
  };
})();
