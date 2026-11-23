/* -*- coding: utf-8 -*-
 * QChinese – Hạng mục 5: AI PDF Curriculum Studio (HSK 3.0 Level Lock/Unlock + 7-Stage Pipeline Manager)
 */

window.QAiPdfStudio = (function () {
  let overview = null;
  let uploadHsk = 2;
  let pollTimer = null;

  function stopPoll() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }

  async function renderPdfStudio(container) {
    stopPoll();
    const health = QCore.getServerHealth();
    if (!health.ok) {
      container.innerHTML = `
        <div class="page-header">
          <div>
            <h2>📄 AI PDF – Tự Động Phân Tích Giáo Trình HSK 3.0</h2>
            <p>Cần kết nối Backend Server 24/7 để tải PDF lớn, xử lý 7 bước nền và phát 93 file MP3 giáo trình HSK 1 (3.0).</p>
          </div>
        </div>
        <div class="card" style="padding:28px;border-color:var(--accent-amber);">
          ⚠️ Chạy <code>python server.py</code> hoặc cấu hình URL Backend 24/7 trong <strong>Cài đặt</strong> để mở khóa hệ thống AI PDF & Giáo trình HSK 3.0.
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="card" style="text-align:center;padding:38px;">⏳ Đang tải hệ thống giáo trình AI PDF (HSK 3.0)...</div>`;
    overview = await QCore.apiFetch("/api/pdf/overview");
    drawStudio(container);
  }

  function drawStudio(container) {
    const levels = (overview && overview.levels) || [];
    const docs = (overview && overview.documents) || [];
    const courses = (overview && overview.courses) || [];
    const anyProcessing = docs.some((d) => d.status === "processing");

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>📄 AI PDF – Tự Động Phân Tích Giáo Trình (HSK 3.0)</h2>
          <p>Quy trình 7 bước: Upload → Trích xuất → AI Phân tích → Phân loại 6 kỹ năng → Tạo Lesson → Kiểm định → Xuất bản. HSK 1 đã mở khóa với giáo trình & 93 MP3 gốc; HSK 2–9 mở khóa khi bạn tải PDF tương ứng.</p>
        </div>
        <button class="btn btn-outline btn-sm" id="pdf-refresh-btn">🔄 Làm mới trạng thái</button>
      </div>

      <!-- HSK 3.0 Level Lock/Unlock Map -->
      <div class="card" style="margin-bottom:18px;">
        <h3 style="margin:0 0 12px;font-size:16.5px;">🗂️ Cấu trúc Khóa học HSK 3.0 (Cơ chế Khóa/Mở theo Tài liệu thực)</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:10px;">
          ${levels.map((lv) => `
            <div class="card-subtle" style="padding:14px;border-color:${lv.unlocked ? "var(--primary)" : "var(--border-color)"};opacity:${lv.unlocked ? "1" : "0.78"};display:flex;flex-direction:column;justify-content:space-between;gap:8px;">
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="font-size:16px;color:${lv.unlocked ? "var(--primary)" : "var(--text-muted)"};">${QCore.escapeHtml(lv.code)}</strong>
                  <span>${lv.unlocked ? "🔓" : "🔒"}</span>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">${QCore.escapeHtml(lv.statusLabel)}</div>
              </div>
              ${lv.unlocked
                ? `<button class="btn btn-primary btn-sm" data-open-course="${lv.level}">📚 Vào học Lesson →</button>`
                : `<button class="btn btn-outline btn-sm" data-prep-upload="${lv.level}">⬆️ Tải PDF mở khóa</button>`}
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Upload PDF & 7-Stage Pipeline Form -->
      <div class="grid-2" style="align-items:start;margin-bottom:18px;">
        <div class="card">
          <h3 style="margin:0 0 10px;font-size:16.5px;">⬆️ Tải Giáo Trình PDF Mới (Tự động Phân tích 7 bước)</h3>
          <div style="margin-bottom:10px;">
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Cấp độ HSK 3.0 mục tiêu:</label>
            <select class="select-field" id="pdf-up-level">
              ${levels.map((lv) => `<option value="${lv.level}" ${uploadHsk === lv.level ? "selected" : ""}>${QCore.escapeHtml(lv.title)} ${lv.unlocked ? "(Đã mở)" : "(Đang khóa)"}</option>`).join("")}
            </select>
          </div>
          <div style="margin-bottom:10px;">
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Chọn file PDF (kiểm tra magic header %PDF-, tối đa 25 MB qua web):</label>
            <input type="file" id="pdf-up-file" accept=".pdf,application/pdf" />
          </div>
          <div style="margin-bottom:10px;">
            <label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px;">Nội dung văn bản / Bài khóa đi kèm (khuyên dùng nếu PDF là bản scan ảnh chưa có OCR):</label>
            <textarea class="textarea-field hanzi-text" id="pdf-up-text" rows="4" placeholder="Ví dụ: 第1课 旅游计划&#10;今天我打算去北京旅游... (AI sẽ tự tách thành từng Lesson & tạo bài tập 6 kỹ năng)"></textarea>
          </div>
          <button class="btn btn-primary" id="pdf-up-submit">🚀 Tải lên & Chạy Pipeline 7 bước</button>
          <div id="pdf-up-msg" style="margin-top:8px;font-size:13px;"></div>
        </div>

        <!-- Draft & Published Courses -->
        <div class="card">
          <h3 style="margin:0 0 10px;font-size:16.5px;">🎓 Khóa học đã tạo từ PDF (${courses.length})</h3>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;">
            ${courses.map((c) => `
              <div class="card-subtle" style="padding:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
                  <strong>${QCore.escapeHtml(c.title)}</strong>
                  <span class="badge ${c.is_published ? "badge-jade" : "badge-amber"}">${c.is_published ? "Đã xuất bản" : "Bản nháp (Chờ xuất bản)"}</span>
                </div>
                <div style="font-size:12.5px;color:var(--text-secondary);margin:4px 0 8px;">
                  Cấp độ: HSK ${c.hsk_level === 7 ? "7–9" : c.hsk_level} · ${c.total_lessons} Lesson · ${c.total_exercises} bài tập 6 kỹ năng
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  <button class="btn btn-soft btn-sm" data-open-cid="${QCore.escapeHtml(c.id)}" data-open-clvl="${c.hsk_level}">👁️ Xem & Học ngay</button>
                  ${!c.is_published ? `<button class="btn btn-primary btn-sm" data-pub-cid="${QCore.escapeHtml(c.id)}">✅ Xuất bản & Mở khóa HSK ${c.hsk_level === 7 ? "7–9" : c.hsk_level}</button>` : ""}
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Uploaded PDF Management Table -->
      <div class="card">
        <h3 style="margin:0 0 12px;font-size:16.5px;">📋 Quản lý Tài liệu PDF đã tải (${docs.length})</h3>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${docs.map((d) => `
            <div class="card-subtle" style="padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
              <div style="flex:1;min-width:240px;">
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                  <strong>📄 ${QCore.escapeHtml(d.filename)}</strong>
                  <span class="badge badge-blue">HSK ${d.hsk_level === 7 ? "7–9" : d.hsk_level}</span>
                  <span class="badge ${d.status === "published" ? "badge-jade" : d.status === "ready" ? "badge-amber" : d.status === "processing" ? "badge-blue" : "badge-red"}">${QCore.escapeHtml(d.stage)} (${d.progress_pct}%)</span>
                  ${d.ocr_required ? `<span class="badge badge-amber">Ảnh scan / Cần OCR</span>` : ""}
                </div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">
                  ${d.page_count} trang · ${(d.file_size / 1048576).toFixed(2)} MB · ${d.lessons_detected} Lesson · ${d.exercises_created} bài tập · Ngày tải: ${new Date(d.created_at).toLocaleDateString("vi-VN")}
                </div>
                ${d.error_message ? `<div style="font-size:12px;color:var(--accent-amber);margin-top:3px;">ℹ️ ${QCore.escapeHtml(d.error_message)}</div>` : ""}
              </div>
              ${!d.is_system_seed ? `<button class="btn btn-outline btn-sm" style="color:var(--accent-red);" data-del-doc="${QCore.escapeHtml(d.id)}">🗑️ Xóa</button>` : `<span class="badge badge-jade">Giáo trình gốc</span>`}
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Bind events
    container.querySelector("#pdf-refresh-btn").onclick = () => renderPdfStudio(container);
    container.querySelector("#pdf-up-level").onchange = (e) => { uploadHsk = Number(e.target.value); };
    container.querySelectorAll("[data-prep-upload]").forEach((b) => {
      b.onclick = () => {
        uploadHsk = Number(b.getAttribute("data-prep-upload"));
        container.querySelector("#pdf-up-level").value = String(uploadHsk);
        container.querySelector("#pdf-up-text").focus();
        QCore.showToast(`Hãy tải PDF giáo trình HSK ${uploadHsk === 7 ? "7–9" : uploadHsk} để mở khóa cấp độ này!`);
      };
    });
    container.querySelectorAll("[data-open-course]").forEach((b) => {
      b.onclick = () => window.QApp.navigate("course-hub", { hskLevel: Number(b.getAttribute("data-open-course")), resetHub: true });
    });
    container.querySelectorAll("[data-open-cid]").forEach((b) => {
      b.onclick = () => window.QApp.navigate("course-hub", { courseId: b.getAttribute("data-open-cid"), hskLevel: Number(b.getAttribute("data-open-clvl")), resetHub: true });
    });
    container.querySelectorAll("[data-pub-cid]").forEach((b) => {
      b.onclick = async () => {
        const res = await QCore.apiFetch("/api/pdf/publish", { method: "POST", body: { courseId: b.getAttribute("data-pub-cid") } });
        QCore.showToast(`✅ Đã xuất bản khóa học và mở khóa HSK ${res.hskLevel === 7 ? "7–9" : res.hskLevel}!`);
        renderPdfStudio(container);
      };
    });
    container.querySelectorAll("[data-del-doc]").forEach((b) => {
      b.onclick = async () => {
        await QCore.apiFetch("/api/pdf/delete", { method: "POST", body: { documentId: b.getAttribute("data-del-doc") } });
        QCore.showToast("Đã xóa tài liệu PDF.");
        renderPdfStudio(container);
      };
    });

    container.querySelector("#pdf-up-submit").onclick = async () => {
      const fileInput = container.querySelector("#pdf-up-file");
      const file = fileInput.files && fileInput.files[0];
      const text = (container.querySelector("#pdf-up-text").value || "").trim();
      const lvl = Number(container.querySelector("#pdf-up-level").value || 2);
      const msgEl = container.querySelector("#pdf-up-msg");
      if (!file && !text) {
        msgEl.innerHTML = `<span style="color:var(--accent-red);">Vui lòng chọn file PDF hoặc dán nội dung giáo trình!</span>`;
        return;
      }
      msgEl.textContent = "⏳ Đang gửi tài liệu vào Background Pipeline 7 bước...";
      let b64 = "";
      let fname = file ? file.name : `HSK${lvl}_curriculum.pdf`;
      if (file) {
        b64 = await new Promise((resolve) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result || "").split(",")[1] || "");
          r.readAsDataURL(file);
        });
      }
      try {
        await QCore.apiFetch("/api/pdf/upload", {
          method: "POST",
          body: { hskLevel: lvl, filename: fname, dataBase64: b64, companionText: text }
        });
        QCore.showToast("🚀 Đã nhận tài liệu! Đang chạy phân tích 7 bước trên Worker nền...");
        setTimeout(() => renderPdfStudio(container), 600);
      } catch (err) {
        msgEl.innerHTML = `<span style="color:var(--accent-red);">❌ ${QCore.escapeHtml(err.message)}</span>`;
      }
    };

    if (anyProcessing) {
      pollTimer = setInterval(async () => {
        try {
          overview = await QCore.apiFetch("/api/pdf/overview");
          drawStudio(container);
        } catch (_) {
          stopPoll();
        }
      }, 900);
    }
  }

  return {
    renderPdfStudio,
    stopPoll
  };
})();
