/* -*- coding: utf-8 -*-
 * QChinese – Hạng mục 1: AI Evolution Tournament Dashboard (Pilot 8/16 & Full 100 AI Agents)
 * Connects live to /api/tournament/* with real-time polling, 7-weight Independent Judge breakdown,
 * knockout bracket history, selective inheritance audit, cost/token telemetry & Champion blueprint.
 */

window.QAiTournament = (function () {
  let tournaments = [];
  let activeId = null;
  let detail = null;
  let pollTimer = null;
  let filterStatus = "all"; // all | remaining | eliminated

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  async function loadList() {
    if (!QCore.getServerHealth().ok) return [];
    const res = await QCore.apiFetch("/api/tournament/list");
    tournaments = res.tournaments || [];
    if (!activeId && tournaments.length) activeId = tournaments[0].id;
    return tournaments;
  }

  async function loadDetail(id) {
    if (!id || !QCore.getServerHealth().ok) return null;
    detail = await QCore.apiFetch(`/api/tournament/detail?id=${encodeURIComponent(id)}`);
    return detail;
  }

  async function renderTournament(container) {
    stopPolling();
    const health = QCore.getServerHealth();
    if (!health.ok) {
      container.innerHTML = `
        <div class="page-header">
          <div>
            <h2>🏆 Hệ Thống 100 AI Thi Đấu & Tiến Hóa (AI Evolution Tournament)</h2>
            <p>Agent Registry · Worker Pool · Independent Judge (7 trọng số) · Selective Inheritance · Artifact Provenance.</p>
          </div>
        </div>
        <div class="card" style="padding:28px;border-color:var(--accent-amber);">
          <h3 style="margin:0 0 8px;">⚠️ Cần kết nối Backend Python để vận hành Hệ thống Orchestration 100 AI</h3>
          <p style="color:var(--text-secondary);margin:0;">Hệ thống Agent Registry, Worker Pool, SQLite Artifact Storage và Independent Judge chạy trên backend <code>python server.py</code> (hoặc server Render/Docker 24/7). Trang tĩnh GitHub Pages không thể chạy tiến trình worker nền.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `<div class="card" style="text-align:center;padding:38px;">⏳ Đang tải trạng thái Hệ thống 100 AI Thi đấu...</div>`;
    try {
      await loadList();
      if (activeId) await loadDetail(activeId);
    } catch (err) {
      container.innerHTML = `<div class="card" style="color:var(--accent-red);">❌ Lỗi tải dữ liệu giải đấu: ${QCore.escapeHtml(err.message)}</div>`;
      return;
    }

    drawView(container);
  }

  function drawView(container) {
    const trn = detail && detail.tournament;
    const sum = detail && detail.summary;
    const champ = detail && detail.champion;
    const agents = (detail && detail.agents) || [];
    const matches = (detail && detail.matches) || [];
    const logs = (detail && detail.logs) || [];

    const filteredAgents = agents.filter((a) => {
      if (filterStatus === "remaining") return a.status !== "eliminated";
      if (filterStatus === "eliminated") return a.status === "eliminated";
      return true;
    });

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🏆 AI Evolution Tournament – Hệ Thống 100 AI Thi Đấu & Tiến Hóa</h2>
          <p>Agent Registry · Worker Pool giới hạn tài nguyên · Independent Judge (25/20/15/15/10/10/5) · Kế thừa chọn lọc & Kiểm thử lại sau tích hợp.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-soft btn-sm" id="trn-create-pilot">🧪 Tạo Pilot 16 AI (Thử nghiệm trước)</button>
          <button class="btn btn-primary btn-sm" id="trn-create-100">🚀 Tạo Đại hội 100 AI (100→50→25→13→7→4→2→1)</button>
        </div>
      </div>

      <!-- Existing Tournaments Switcher -->
      ${tournaments.length ? `
        <div class="card" style="padding:12px 16px;margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <strong style="font-size:13px;color:var(--text-muted);">Giải đấu đã lưu (${tournaments.length}):</strong>
          ${tournaments.slice(0, 6).map((t) => `
            <button class="btn ${t.id === activeId ? "btn-primary" : "btn-outline"} btn-sm" data-pick-trn="${QCore.escapeHtml(t.id)}">
              ${t.status === "completed" ? "🏆" : "⚡"} ${QCore.escapeHtml(t.name)} (Vòng ${t.current_round}/${t.total_rounds})
            </button>
          `).join("")}
        </div>
      ` : ""}

      ${trn && sum ? `
        <!-- Live Telemetry KPI Row -->
        <div class="grid-4" style="margin-bottom:16px;">
          <div class="card" style="padding:16px;">
            <div style="font-size:12.5px;color:var(--text-muted);">Tổng số AI / Còn lại</div>
            <div style="font-size:26px;font-weight:800;color:var(--primary);">${sum.remainingAgents} / ${sum.totalAgents}</div>
            <div style="font-size:12px;color:var(--text-secondary);">Đã bị loại: ${sum.eliminatedAgents} AI</div>
          </div>
          <div class="card" style="padding:16px;">
            <div style="font-size:12.5px;color:var(--text-muted);">Tiến độ Vòng đấu</div>
            <div style="font-size:26px;font-weight:800;color:var(--accent-blue);">Vòng ${trn.current_round} / ${trn.total_rounds}</div>
            <div style="font-size:12px;color:var(--text-secondary);">Trạng thái: <strong>${QCore.escapeHtml(trn.status.toUpperCase())}</strong></div>
          </div>
          <div class="card" style="padding:16px;">
            <div style="font-size:12.5px;color:var(--text-muted);">Artifacts lưu trữ (Provenance)</div>
            <div style="font-size:26px;font-weight:800;">${sum.archivedArtifacts}</div>
            <div style="font-size:12px;color:var(--text-secondary);">Tổng số trận: ${sum.totalMatches}</div>
          </div>
          <div class="card" style="padding:16px;">
            <div style="font-size:12.5px;color:var(--text-muted);">Chi phí ước tính (LLM Flash)</div>
            <div style="font-size:26px;font-weight:800;color:var(--accent-amber);">$${Number(trn.estimated_cost_usd || 0).toFixed(4)}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${Number(trn.total_tokens || 0).toLocaleString("vi-VN")} tokens · Local Judge: $0</div>
          </div>
        </div>

        <!-- Controls & Weight Policy -->
        <div class="card" style="margin-bottom:16px;padding:16px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <div style="font-size:12.5px;color:var(--text-secondary);">
            <strong>Tiêu chí Independent Judge:</strong> Học tập 25% · Chính xác AI 20% · Thực tế 15% · Ổn định 15% · UI/UX 10% · Hiệu năng 10% · Mở rộng 5%
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${trn.status !== "completed" ? `
              <button class="btn btn-primary btn-sm" id="trn-step-btn">▶️ Đấu tiếp 1 vòng (Vòng ${trn.current_round + 1})</button>
              <button class="btn btn-soft btn-sm" id="trn-runall-btn">⚡ Tự động đấu tới Chung kết</button>
            ` : `<span class="badge badge-jade" style="font-size:13px;">🏆 Giải đấu đã hoàn tất!</span>`}
            <button class="btn btn-outline btn-sm" id="trn-refresh-btn">🔄 Làm mới</button>
          </div>
        </div>

        <!-- Champion Spotlight -->
        ${champ ? `
          <div class="card" style="margin-bottom:18px;border:2px solid var(--primary);background:linear-gradient(135deg,var(--bg-accent-soft),var(--bg-surface));">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:10px;">
              <div>
                <span class="badge badge-jade">🏆 NHÀ VÔ ĐỊCH · ULTIMATE QCHINESE AI</span>
                <h3 style="margin:6px 0 4px;">${QCore.escapeHtml(champ.shortId)} — ${QCore.escapeHtml(champ.role)} (${QCore.escapeHtml(champ.artifactVersion)})</h3>
                <div style="font-size:13px;color:var(--text-secondary);">Chiến lược: ${QCore.escapeHtml(champ.strategy)} · Điểm thẩm định độc lập: <strong style="color:var(--primary);font-size:18px;">${champ.totalScore}/100</strong></div>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;font-size:12px;">
                ${Object.entries(champ.scores || {}).map(([k, v]) => `<span class="badge badge-blue">${k}: ${v}</span>`).join("")}
              </div>
            </div>
            <div class="grid-2" style="gap:10px;">
              <div class="card-subtle">
                <strong>✨ Tính năng lõi tự phát triển (${champ.features.length}):</strong>
                <ul style="margin:6px 0 0;padding-left:18px;font-size:13px;">
                  ${champ.features.map((f) => `<li>${QCore.escapeHtml(f.name)} (điểm ${f.quality})</li>`).join("")}
                </ul>
              </div>
              <div class="card-subtle">
                <strong>🧬 Tính năng kế thừa chọn lọc từ các đối thủ (${champ.inherited.length}):</strong>
                <ul style="margin:6px 0 0;padding-left:18px;font-size:13px;">
                  ${champ.inherited.map((f) => `<li>${QCore.escapeHtml(f.name)} <small style="color:var(--text-muted);">(từ ${QCore.escapeHtml((f.inherited_from || "").split("_").pop())} · Vòng ${f.inherited_round})</small></li>`).join("") || "<li>Chưa kế thừa</li>"}
                </ul>
              </div>
            </div>
          </div>
        ` : ""}

        <div class="grid-2" style="align-items:start;">
          <!-- Match Bracket History & Selective Inheritance -->
          <div class="card">
            <h3 style="margin:0 0 10px;font-size:16px;">⚔️ Lịch sử Trận đấu & Kế thừa Chọn lọc (${matches.length})</h3>
            <div style="max-height:460px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
              ${matches.length ? matches.slice(0, 40).map((m) => `
                <div class="card-subtle" style="padding:10px 12px;font-size:12.5px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">
                    <strong>Vòng ${m.round} · Trận #${m.matchIndex}: ${QCore.escapeHtml(m.agentA)} (${m.scoreA}) vs ${QCore.escapeHtml(m.agentB)} (${m.isBye ? "BYE" : m.scoreB})</strong>
                    <div style="display:flex;gap:4px;">
                      ${m.isBye ? `<span class="badge badge-blue">Fair BYE</span>` : `<span class="badge badge-jade">Thắng: ${QCore.escapeHtml(m.winner)} → ${m.postIntegrationScore}</span>`}
                      ${m.tiebreakerUsed ? `<span class="badge badge-amber">Tie-Breaker</span>` : ""}
                    </div>
                  </div>
                  <div style="color:var(--text-secondary);margin-top:4px;">${QCore.escapeHtml(m.judgeNotes)}</div>
                  ${m.inheritedFeatures.length ? `<div style="color:var(--primary);margin-top:3px;">🧬 Kế thừa: ${m.inheritedFeatures.map((f) => QCore.escapeHtml(f.name)).join(" · ")}</div>` : ""}
                  ${m.rejectedFeatures.length ? `<div style="color:var(--text-muted);margin-top:2px;">⛔ Từ chối tích hợp: ${m.rejectedFeatures.length} tính năng không tương thích/dư thừa</div>` : ""}
                </div>
              `).join("") : `<div class="card-subtle" style="color:var(--text-muted);">Chưa có trận nào diễn ra. Bấm "▶️ Đấu tiếp 1 vòng" ở trên để bắt đầu Vòng 1!</div>`}
            </div>
          </div>

          <!-- Agents Table + Audit Logs -->
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
                <h3 style="margin:0;font-size:16px;">🤖 Danh sách AI Agents (${filteredAgents.length})</h3>
                <div style="display:flex;gap:4px;">
                  <button class="btn ${filterStatus === "all" ? "btn-primary" : "btn-outline"} btn-sm" data-agf="all">Tất cả</button>
                  <button class="btn ${filterStatus === "remaining" ? "btn-primary" : "btn-outline"} btn-sm" data-agf="remaining">Còn lại (${sum.remainingAgents})</button>
                  <button class="btn ${filterStatus === "eliminated" ? "btn-primary" : "btn-outline"} btn-sm" data-agf="eliminated">Bị loại (${sum.eliminatedAgents})</button>
                </div>
              </div>
              <div style="max-height:260px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
                ${filteredAgents.slice(0, 50).map((a) => `
                  <div class="card-subtle" style="padding:8px 10px;display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12.5px;">
                    <div>
                      <strong>${QCore.escapeHtml(a.shortId)}</strong> · ${QCore.escapeHtml(a.role)} <span style="color:var(--text-muted);">(${QCore.escapeHtml(a.artifactVersion)})</span>
                      <div style="font-size:11.5px;color:var(--text-muted);">Tính năng: ${a.features.length} gốc + ${a.inherited.length} kế thừa</div>
                    </div>
                    <div style="text-align:right;white-space:nowrap;">
                      <strong>${a.totalScore}</strong>
                      <span class="badge ${a.status === "champion" ? "badge-jade" : a.status === "eliminated" ? "badge-red" : "badge-blue"}" style="margin-left:4px;">${QCore.escapeHtml(a.status)}</span>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

            <div class="card">
              <h3 style="margin:0 0 8px;font-size:15.5px;">📜 Nhật ký Hoạt động (Audit Logs thời gian thực)</h3>
              <div style="max-height:175px;overflow-y:auto;font-family:monospace;font-size:12px;display:flex;flex-direction:column;gap:4px;">
                ${logs.map((l) => `<div style="padding:4px 8px;background:var(--bg-subtle);border-radius:6px;"><strong>[${QCore.escapeHtml(l.stage)}]</strong> ${QCore.escapeHtml(l.message)}</div>`).join("")}
              </div>
            </div>
          </div>
        </div>
      ` : `
        <div class="card" style="text-align:center;padding:42px;">
          <div style="font-size:44px;margin-bottom:8px;">🏆</div>
          <h3 style="margin:0 0 8px;">Chưa có giải đấu 100 AI nào được khởi tạo</h3>
          <p style="color:var(--text-secondary);max-width:560px;margin:0 auto 16px;">Khuyến nghị chạy <strong>Pilot 16 AI</strong> trước để kiểm tra tốc độ & chi phí, sau đó mở rộng sang <strong>Đại hội 100 AI</strong> (100→50→25→13→7→4→2→1).</p>
        </div>
      `}
    `;

    // Bind buttons
    container.querySelector("#trn-create-pilot").onclick = async () => {
      QCore.showToast("🧪 Đang khởi tạo Pilot 16 AI Agents độc lập...");
      const res = await QCore.apiFetch("/api/tournament/create", { method: "POST", body: { name: "Pilot 16 AI QChinese", agentCount: 16, mode: "pilot" } });
      detail = res;
      activeId = res.tournament.id;
      await loadList();
      drawView(container);
    };

    container.querySelector("#trn-create-100").onclick = async () => {
      QCore.showToast("🚀 Đang đăng ký 100 AI Agents độc lập qua Worker Pool...");
      const res = await QCore.apiFetch("/api/tournament/create", { method: "POST", body: { name: "Đại hội Tiến hóa 100 AI", agentCount: 100, mode: "full" } });
      detail = res;
      activeId = res.tournament.id;
      await loadList();
      drawView(container);
    };

    container.querySelectorAll("[data-pick-trn]").forEach((b) => {
      b.onclick = async () => {
        activeId = b.getAttribute("data-pick-trn");
        await loadDetail(activeId);
        drawView(container);
      };
    });

    container.querySelectorAll("[data-agf]").forEach((b) => {
      b.onclick = () => { filterStatus = b.getAttribute("data-agf"); drawView(container); };
    });

    const stepBtn = container.querySelector("#trn-step-btn");
    if (stepBtn) {
      stepBtn.onclick = async () => {
        stepBtn.disabled = true;
        stepBtn.textContent = "⏳ Đang thi đấu & thẩm định Judge...";
        detail = await QCore.apiFetch("/api/tournament/step", { method: "POST", body: { tournamentId: activeId } });
        await loadList();
        drawView(container);
      };
    }

    const runAllBtn = container.querySelector("#trn-runall-btn");
    if (runAllBtn) {
      runAllBtn.onclick = async () => {
        await QCore.apiFetch("/api/tournament/run-all", { method: "POST", body: { tournamentId: activeId } });
        QCore.showToast("⚡ Đang tự động chạy các vòng đấu trên Worker nền...");
        stopPolling();
        pollTimer = setInterval(async () => {
          try {
            await loadDetail(activeId);
            await loadList();
            drawView(container);
            if (detail && detail.tournament && detail.tournament.status === "completed") {
              stopPolling();
              QCore.showToast("🏆 Đã tìm ra Nhà vô địch Ultimate QChinese AI!");
            }
          } catch (_) {
            stopPolling();
          }
        }, 650);
      };
    }

    const refBtn = container.querySelector("#trn-refresh-btn");
    if (refBtn) {
      refBtn.onclick = async () => {
        await loadList();
        if (activeId) await loadDetail(activeId);
        drawView(container);
      };
    }
  }

  return {
    renderTournament,
    stopPolling
  };
})();
