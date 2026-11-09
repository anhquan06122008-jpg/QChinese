/* -*- coding: utf-8 -*-
 * QChinese – Module 5 (Pinyin, Articulation & 4 Tones Studio) & Module 7 (Listening Replay & 9 Modes)
 */

window.QPinyinListening = (function () {
  /* ==================== PHẦN 5: PINYIN & 4 TONES ==================== */
  let pyTab = "tones"; // "tones" | "initials" | "finals" | "combiner" | "practice"
  let selectedSound = null;
  let drillIdx = 0;
  let lastVoiceUrl = null;
  let lastTranscript = "";

  function renderPinyin(container) {
    const data = window.QCHINESE_PINYIN;

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🎵 Hệ Thống Phát Âm, Bảng Pinyin & 4 Thanh Điệu</h2>
          <p>Dành riêng cho người Việt bắt đầu từ con số 0: Hướng dẫn vị trí lưỡi – môi dễ hiểu, phân biệt bật hơi và luyện 4 thanh điệu + biến điệu thực tế.</p>
        </div>
      </div>

      <div class="tabs-bar" style="margin-bottom:20px;">
        <button class="tab-pill ${pyTab === "tones" ? "active" : ""}" data-pytab="tones">1. 4 Thanh điệu & Biến điệu</button>
        <button class="tab-pill ${pyTab === "initials" ? "active" : ""}" data-pytab="initials">2. Thanh mẫu (Phụ âm đầu)</button>
        <button class="tab-pill ${pyTab === "finals" ? "active" : ""}" data-pytab="finals">3. Vận mẫu (Đơn · Kép · Mũi)</button>
        <button class="tab-pill ${pyTab === "combiner" ? "active" : ""}" data-pytab="combiner">4. Cách ghép âm Pinyin</button>
        <button class="tab-pill ${pyTab === "practice" ? "active" : ""}" data-pytab="practice">5. Luyện nghe & Thu âm giọng đọc</button>
      </div>

      <div id="pinyin-stage"></div>
    `;

    container.querySelectorAll("[data-pytab]").forEach((btn) => {
      btn.onclick = () => {
        pyTab = btn.getAttribute("data-pytab");
        selectedSound = null;
        renderPinyin(container);
      };
    });

    const stage = container.querySelector("#pinyin-stage");

    if (pyTab === "tones") {
      stage.innerHTML = `
        <div class="grid-3" style="margin-bottom:20px;">
          ${data.tones
            .map(
              (t) => `
            <div class="card" style="padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <strong style="font-size:16px;color:var(--primary);">${QCore.escapeHtml(t.name)}</strong>
                <span class="badge badge-jade" style="font-size:15px;">${QCore.escapeHtml(t.symbol)}</span>
              </div>
              <svg viewBox="0 0 180 105" style="width:100%;height:78px;background:var(--bg-subtle);border-radius:12px;margin-bottom:10px;">
                <line x1="10" y1="22" x2="170" y2="22" stroke="var(--border-strong)" stroke-dasharray="3,3"/>
                <line x1="10" y1="55" x2="170" y2="55" stroke="var(--border-strong)" stroke-dasharray="3,3"/>
                <line x1="10" y1="88" x2="170" y2="88" stroke="var(--border-strong)" stroke-dasharray="3,3"/>
                <path d="${t.svgPath}" fill="none" stroke="var(--accent-red)" stroke-width="4" stroke-linecap="round"/>
              </svg>
              <div style="font-size:12.5px;font-weight:700;margin-bottom:4px;">Độ cao: ${QCore.escapeHtml(t.pitch)}</div>
              <p style="font-size:13px;color:var(--text-secondary);margin:0 0 8px;">${QCore.escapeHtml(t.desc)}</p>
              <div class="card-subtle" style="padding:8px 10px;font-size:12.5px;margin-bottom:10px;">💡 ${QCore.escapeHtml(t.tipVi)}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${t.examples
                  .map(
                    (ex) => `
                  <button class="btn btn-outline btn-sm" data-speak="${QCore.escapeHtml(ex.hz)}">
                    <strong class="hanzi-text">${QCore.escapeHtml(ex.hz)}</strong> (${QCore.escapeHtml(ex.py)} · ${QCore.escapeHtml(ex.vi)}) 🔊
                  </button>
                `
                  )
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Minimal-Pair Quad Comparison (mā, má, mǎ, mà) -->
        <div class="card" style="margin-bottom:20px;">
          <h3 style="margin:0 0 6px;">🎧 So sánh trực tiếp các âm cùng Pinyin nhưng khác Thanh điệu</h3>
          <p style="margin:0 0 14px;color:var(--text-secondary);font-size:13.5px;">Bấm nghe lần lượt Thanh 1 → Thanh 2 → Thanh 3 → Thanh 4 để tai quen với sự thay đổi độ cao và ý nghĩa chữ Hán:</p>
          <div style="display:flex;flex-direction:column;gap:12px;">
            ${data.quadSets
              .map(
                (qs) => `
              <div class="card-subtle" style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;">
                <strong style="min-width:80px;color:var(--primary);">Gốc "${QCore.escapeHtml(qs.base)}"</strong>
                <div style="display:flex;gap:8px;flex-wrap:wrap;flex:1;">
                  ${qs.items
                    .map(
                      (it) => `
                    <button class="btn btn-outline" style="flex:1;min-width:130px;justify-content:space-between;" data-speak="${QCore.escapeHtml(it.hz)}">
                      <span><strong class="pinyin-text" style="color:var(--primary);">${QCore.escapeHtml(it.py)}</strong> · <span class="hanzi-text" style="font-size:18px;">${QCore.escapeHtml(it.hz)}</span></span>
                      <span style="font-size:12px;color:var(--text-muted);">${QCore.escapeHtml(it.vi)} 🔊</span>
                    </button>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Tone Sandhi Rules -->
        <div class="card">
          <h3 style="margin:0 0 12px;">🔀 Các quy tắc biến điệu bắt buộc phải nhớ</h3>
          <div class="grid-2">
            ${data.sandhiRules
              .map(
                (r) => `
              <div class="card-subtle">
                <strong style="color:var(--primary);font-size:14.5px;">${QCore.escapeHtml(r.title)}</strong>
                <div class="badge badge-amber" style="margin:6px 0;display:inline-block;">${QCore.escapeHtml(r.formula)}</div>
                <p style="font-size:13px;color:var(--text-secondary);margin:4px 0 10px;">${QCore.escapeHtml(r.explanation)}</p>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                  ${r.examples
                    .map(
                      (ex) => `
                    <button class="btn btn-outline btn-sm" data-speak="${QCore.escapeHtml(ex.hz)}">
                      <span class="hanzi-text" style="font-weight:700;">${QCore.escapeHtml(ex.hz)}</span>
                      <span>(${QCore.escapeHtml(ex.written)} → đọc <strong>${QCore.escapeHtml(ex.spoken)}</strong>)</span> 🔊
                    </button>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
      bindSpeakBtns(stage);
    } else if (pyTab === "initials") {
      const curr = selectedSound || data.initials[0];
      const groups = [...new Set(data.initials.map((i) => i.group))];

      stage.innerHTML = `
        <div class="grid-2">
          <div class="card">
            <h3 style="margin:0 0 12px;">Bảng 23 Thanh mẫu (Bấm vào từng âm để nghe & xem khẩu hình)</h3>
            ${groups
              .map(
                (g) => `
              <div style="margin-bottom:14px;">
                <div style="font-size:12.5px;font-weight:700;color:var(--text-muted);margin-bottom:6px;">${QCore.escapeHtml(g)}</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                  ${data.initials
                    .filter((i) => i.group === g)
                    .map(
                      (i) => `
                    <button class="btn ${curr.symbol === i.symbol ? "btn-primary" : "btn-outline"}" style="min-width:54px;font-size:17px;font-weight:700;" data-pick-init="${i.symbol}">
                      ${i.symbol}
                    </button>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span class="badge badge-jade">${QCore.escapeHtml(curr.group)}</span>
              <button class="btn btn-primary btn-sm" data-speak="${QCore.escapeHtml(curr.readAudio)}">🔊 Nghe âm mẫu (${curr.readPy})</button>
            </div>
            <div style="font-size:54px;font-weight:800;color:var(--primary);line-height:1.1;margin-bottom:12px;">${curr.symbol}</div>
            <div class="card-subtle" style="margin-bottom:10px;">
              <strong>👄 Khẩu hình miệng & vị trí lưỡi:</strong>
              <p style="margin:4px 0 0;font-size:14px;">${QCore.escapeHtml(curr.mouth)}</p>
            </div>
            <div class="vi-hint-banner" style="margin-bottom:12px;">
              <span>🇻🇳</span>
              <div><strong>Mẹo phát âm cho người Việt:</strong> ${QCore.escapeHtml(curr.howVi)}</div>
            </div>
            <div class="card-subtle" style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <strong>Từ vựng ví dụ:</strong>
                <span class="hanzi-text" style="font-size:22px;font-weight:700;margin-left:8px;">${QCore.escapeHtml(curr.example.hz)}</span>
                <span class="pinyin-text" style="color:var(--primary);font-weight:600;">(${QCore.escapeHtml(curr.example.py)})</span> — ${QCore.escapeHtml(curr.example.vi)}
              </div>
              <button class="btn btn-soft btn-sm" data-speak="${QCore.escapeHtml(curr.example.hz)}">🔊 Nghe từ</button>
            </div>
          </div>
        </div>
      `;

      stage.querySelectorAll("[data-pick-init]").forEach((b) => {
        b.onclick = () => {
          selectedSound = data.initials.find((x) => x.symbol === b.getAttribute("data-pick-init"));
          if (selectedSound) QCore.speakChinese(selectedSound.readAudio);
          renderPinyin(container);
        };
      });
      bindSpeakBtns(stage);
    } else if (pyTab === "finals") {
      const allFinals = [...data.finals.single, ...data.finals.compound, ...data.finals.nasal];
      const curr = selectedSound || allFinals[0];

      const renderFinalGroup = (title, arr) => `
        <div style="margin-bottom:14px;">
          <div style="font-size:12.5px;font-weight:700;color:var(--text-muted);margin-bottom:6px;">${title}</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;">
            ${arr
              .map(
                (f) => `
              <button class="btn ${curr.symbol === f.symbol ? "btn-primary" : "btn-outline"} btn-sm" style="font-size:15px;font-weight:700;" data-pick-fin="${QCore.escapeHtml(f.symbol)}">
                ${QCore.escapeHtml(f.symbol)}
              </button>
            `
              )
              .join("")}
          </div>
        </div>
      `;

      stage.innerHTML = `
        <div class="grid-2">
          <div class="card">
            <h3 style="margin:0 0 12px;">Bảng Vận mẫu (Âm đơn · Âm kép · Âm mũi)</h3>
            ${renderFinalGroup("1. Đơn vận mẫu (6 nguyên âm đơn gốc)", data.finals.single)}
            ${renderFinalGroup("2. Phức vận mẫu (Âm kép lướt mượt)", data.finals.compound)}
            ${renderFinalGroup("3. Mũi vận mẫu (-n / -ng) & Âm uốn lưỡi er", data.finals.nasal)}
          </div>

          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span class="badge badge-blue">Chi tiết Vận mẫu</span>
              <button class="btn btn-primary btn-sm" data-speak="${QCore.escapeHtml(curr.readAudio)}">🔊 Nghe âm mẫu (${QCore.escapeHtml(curr.readPy)})</button>
            </div>
            <div style="font-size:48px;font-weight:800;color:var(--primary);margin-bottom:12px;">${QCore.escapeHtml(curr.symbol)}</div>
            <div class="card-subtle" style="margin-bottom:10px;">
              <strong>👄 Khẩu hình & luồng hơi:</strong>
              <p style="margin:4px 0 0;font-size:14px;">${QCore.escapeHtml(curr.mouth)}</p>
            </div>
            <div class="vi-hint-banner" style="margin-bottom:12px;">
              <span>🇻🇳</span>
              <div><strong>Cách đọc cho người Việt:</strong> ${QCore.escapeHtml(curr.howVi)}</div>
            </div>
            <div class="card-subtle" style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <strong>Ví dụ:</strong>
                <span class="hanzi-text" style="font-size:22px;font-weight:700;margin-left:8px;">${QCore.escapeHtml(curr.example.hz)}</span>
                <span class="pinyin-text" style="color:var(--primary);font-weight:600;">(${QCore.escapeHtml(curr.example.py)})</span> — ${QCore.escapeHtml(curr.example.vi)}
              </div>
              <button class="btn btn-soft btn-sm" data-speak="${QCore.escapeHtml(curr.example.hz)}">🔊 Nghe từ</button>
            </div>
          </div>
        </div>
      `;

      stage.querySelectorAll("[data-pick-fin]").forEach((b) => {
        b.onclick = () => {
          selectedSound = allFinals.find((x) => x.symbol === b.getAttribute("data-pick-fin"));
          if (selectedSound) QCore.speakChinese(selectedSound.readAudio);
          renderPinyin(container);
        };
      });
      bindSpeakBtns(stage);
    } else if (pyTab === "combiner") {
      const cols = ["a", "o", "e", "i", "u", "ü", "ai", "ei", "ao", "ou", "ia", "ie", "ua", "uo", "üe", "an", "en", "in", "ian", "uan", "ang", "eng", "ing", "ong"];
      stage.innerHTML = `
        <div class="card">
          <h3 style="margin:0 0 6px;">🧩 Bảng Ghép Âm Tương Tác (Thanh mẫu + Vận mẫu → Chữ Hán thực tế)</h3>
          <p style="margin:0 0 14px;font-size:13.5px;color:var(--text-secondary);">Bấm vào bất kỳ ô ghép âm nào để nghe ngay âm thanh chuẩn và xem từ chữ Hán Giản thể tương ứng! Ngoài ra bạn có thể gõ thử Pinyin ở ô tra cứu bên dưới để xem toàn bộ từ gợi ý:</p>

          <div style="margin-bottom:16px;max-width:480px;">
            <input class="input-field" data-pinyin-ime="true" placeholder="Thử gõ Pinyin bất kỳ (vd: xue, lv, zhong, qing, mai)..." />
          </div>

          <div style="overflow-x:auto;">
            <table class="tri-table" style="min-width:880px;">
              <thead>
                <tr>
                  <th>Thanh \\ Vận</th>
                  ${cols.map((c) => `<th style="text-align:center;width:auto;padding:8px 6px;">${c}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${data.combinerGrid
                  .map(
                    (row) => `
                  <tr>
                    <th style="font-size:16px;color:var(--primary);text-align:center;">${row.initial}</th>
                    ${cols
                      .map((c) => {
                        const cell = row.combos[c];
                        if (!cell) return `<td style="text-align:center;color:var(--border-strong);">—</td>`;
                        return `
                          <td style="text-align:center;padding:6px;cursor:pointer;" class="qs-item" data-speak="${QCore.escapeHtml(cell.hz)}" title="${QCore.escapeHtml(cell.vi)}">
                            <div class="pinyin-text" style="font-size:12.5px;font-weight:700;color:var(--primary);">${QCore.escapeHtml(cell.py)}</div>
                            <div class="hanzi-text" style="font-size:16px;">${QCore.escapeHtml(cell.hz)}</div>
                          </td>
                        `;
                      })
                      .join("")}
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
      bindSpeakBtns(stage);
    } else if (pyTab === "practice") {
      const drills = data.listeningDrills;
      const d = drills[drillIdx % drills.length];

      stage.innerHTML = `
        <div class="grid-2">
          <!-- Tone Identification Quiz -->
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
              <span class="badge badge-jade">🎧 Bài tập 1: Nghe âm thanh & Chọn đúng Thanh điệu (${(drillIdx % drills.length) + 1}/${drills.length})</span>
              <button class="btn btn-outline btn-sm" id="pd-next">Câu tiếp →</button>
            </div>
            <div style="text-align:center;padding:16px 0;">
              <button class="btn btn-primary" id="pd-play">🔊 Bấm nghe âm mẫu</button>
              <button class="btn btn-outline btn-sm" id="pd-slow" style="margin-left:6px;">🐢 Nghe chậm</button>
            </div>
            <div class="grid-2" style="gap:10px;margin-bottom:12px;">
              ${d.options
                .map(
                  (opt, idx) => `
                <button class="btn btn-outline pinyin-text" style="padding:12px;font-size:16px;" data-pd-tone="${idx + 1}">
                  ${QCore.escapeHtml(opt)}
                </button>
              `
                )
                .join("")}
            </div>
            <div id="pd-feedback"></div>
          </div>

          <!-- Voice Recorder & Self-Comparison -->
          <div class="card">
            <span class="badge badge-blue" style="margin-bottom:10px;">🎙️ Bài tập 2: Ghi âm giọng đọc & So sánh với âm mẫu</span>
            <h3 style="margin:0 0 8px;">Luyện đọc bộ 4 thanh: mā · má · mǎ · mà (妈 · 麻 · 马 · 骂)</h3>
            <p style="font-size:13.5px;color:var(--text-secondary);margin:0 0 14px;">
              Bước 1: Nghe giáo viên đọc chuẩn → Bước 2: Bấm Ghi âm và đọc rõ chữ hoặc cụm âm → Bước 3: Nghe lại giọng mình đặt cạnh giọng mẫu!
            </p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
              <button class="btn btn-soft btn-sm" data-speak="妈，麻，马，骂">🔊 Nghe mẫu 4 thanh (mā má mǎ mà)</button>
              <button class="btn btn-soft btn-sm" data-speak="你好，我是学生">🔊 Nghe mẫu câu (Nǐ hǎo, wǒ shì xuésheng)</button>
            </div>
            <button class="btn btn-primary" id="py-rec-start">🎙️ Bắt đầu ghi âm giọng của bạn (4 giây)</button>
            <div id="py-rec-status" style="margin-top:14px;">
              ${
                lastVoiceUrl
                  ? `<div class="card-subtle"><audio controls src="${lastVoiceUrl}" style="width:100%;height:38px;"></audio><div style="font-size:13px;margin-top:6px;">${QCore.escapeHtml(lastTranscript)}</div></div>`
                  : `<div class="card-subtle" style="font-size:13px;color:var(--text-muted);">Bấm nút Ghi âm phía trên để kiểm tra phát âm của bạn.</div>`
              }
            </div>
          </div>
        </div>
      `;

      bindSpeakBtns(stage);
      stage.querySelector("#pd-play").onclick = () => QCore.speakChinese(d.audioText);
      stage.querySelector("#pd-slow").onclick = () => QCore.speakChinese(d.audioText, { slow: true });
      stage.querySelector("#pd-next").onclick = () => {
        drillIdx = (drillIdx + 1) % drills.length;
        renderPinyin(container);
      };

      stage.querySelectorAll("[data-pd-tone]").forEach((btn) => {
        btn.onclick = () => {
          const picked = Number(btn.getAttribute("data-pd-tone"));
          const fb = stage.querySelector("#pd-feedback");
          QCore.speakChinese(d.audioText);
          if (picked === d.correctTone) {
            QCore.updateSkillScore("pinyin", 92);
            fb.innerHTML = `<div class="card-subtle" style="border-color:var(--primary);color:var(--primary);font-weight:700;">✅ Chính xác! ${QCore.escapeHtml(d.hint)}</div>`;
          } else {
            QCore.updateSkillScore("pinyin", 55);
            fb.innerHTML = `<div class="card-subtle" style="border-color:var(--accent-red);color:var(--accent-red);">❌ Nhầm thanh rồi! Đáp án đúng là Thanh ${d.correctTone}: ${QCore.escapeHtml(d.hint)}</div>`;
          }
        };
      });

      stage.querySelector("#py-rec-start").onclick = () => {
        const stBox = stage.querySelector("#py-rec-status");
        stBox.innerHTML = `<div class="card-subtle" style="color:var(--accent-red);font-weight:700;">🔴 Đang thu âm... Hãy đọc to rõ ràng vào Micro!</div>`;
        QCore.captureLearnerVoice({
          durationMs: 4200,
          onAudioReady: (url, transcript) => {
            lastVoiceUrl = url;
            lastTranscript = transcript
              ? `✅ Nhận diện giọng nói tiếng Trung: "${transcript}" — Hãy bấm Play nghe lại độ cao thanh điệu của bạn so với mẫu nhé!`
              : "🎧 Đã ghi âm xong! Hãy bấm Play nghe lại và so sánh độ cao/trầm với nút Nghe mẫu nhé.";
            renderPinyin(container);
          }
        });
      };
    }
  }

  function bindSpeakBtns(root) {
    root.querySelectorAll("[data-speak]").forEach((b) => {
      b.onclick = () => QCore.speakChinese(b.getAttribute("data-speak"));
    });
  }

  /* ==================== SECTION 6.3: LISTENING STUDIO ==================== */
  let activeLessonId = "lis_greeting_1";
  let showHanzi = true;
  let showPinyin = true;
  let showTranslation = false; // Encourages listening first before revealing translation!
  let playbackSpeed = 1.0;
  let playingIdx = -1;
  let reorderAttempt = [];
  let unlockedAnalysis = false;

  function renderListening(container) {
    const lessons = window.QCHINESE_LISTENING || [];
    const lesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];
    const st = QCore.getState();
    const isCompleted = st.listeningCompleted.includes(lesson.id);

    container.innerHTML = `
      <div class="page-header">
        <div>
          <h2>🎧 Luyện Nghe Tiếng Trung Chuẩn Phổ Thông</h2>
          <p>Luyện nghe từ hội thoại thực tế, tắt/bật Pinyin & bản dịch để rèn phản xạ tai, điều chỉnh tốc độ và làm 4 dạng bài tập.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${lessons
            .map(
              (l) => `
            <button class="btn ${l.id === lesson.id ? "btn-primary" : "btn-outline"} btn-sm" data-lis-id="${l.id}">
              ${st.listeningCompleted.includes(l.id) ? "✓ " : ""}HSK ${l.hsk_level}: ${QCore.escapeHtml(l.title.split(":")[0])}
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Dialogue Replay Card (Inspired by Image 5!) -->
      <div class="card" style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding-bottom:14px;border-bottom:1px solid var(--border-color);margin-bottom:16px;">
          <div>
            <span class="badge badge-jade">HSK ${lesson.hsk_level} · ${QCore.escapeHtml(lesson.category)}</span>
            <h3 style="margin:4px 0 0;">${QCore.escapeHtml(lesson.title)}</h3>
          </div>

          <!-- Top Replay Controls: Toggle Pinyin (ā), Hanzi (字), Translation (👁), Speed (0.5x..1.25x) -->
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <button class="btn ${showPinyin ? "btn-primary" : "btn-outline"} btn-sm" id="lis-tog-py" title="Hiện/Ẩn Pinyin">ā Pinyin</button>
            <button class="btn ${showHanzi ? "btn-primary" : "btn-outline"} btn-sm" id="lis-tog-hz" title="Hiện/Ẩn Chữ Hán (luyện nghe mù)">字 Chữ Hán</button>
            <button class="btn ${showTranslation ? "btn-primary" : "btn-outline"} btn-sm" id="lis-tog-tr" title="Hiện/Ẩn Bản dịch">👁️ Bản dịch</button>
            <div class="tabs-bar" style="padding:3px;">
              ${[0.5, 0.75, 1.0, 1.25]
                .map(
                  (spd) => `<button class="tab-pill ${playbackSpeed === spd ? "active" : ""}" style="padding:4px 9px;font-size:12px;" data-spd="${spd}">x${spd}</button>`
                )
                .join("")}
            </div>
            <button class="btn btn-soft btn-sm" id="lis-play-all">▶️ Phát toàn bộ hội thoại</button>
          </div>
        </div>

        <div>
          ${lesson.lines
            .map(
              (line, idx) => `
            <div class="dialogue-row ${playingIdx === idx ? "playing" : ""}" data-line-idx="${idx}">
              <div style="display:flex;align-items:flex-start;gap:12px;flex:1;">
                <span class="badge badge-blue" style="min-width:66px;justify-content:center;margin-top:3px;">🔊 ${QCore.escapeHtml(line.speaker)}</span>
                <div>
                  ${showPinyin ? `<div class="pinyin-text" style="font-size:13px;color:var(--primary);font-weight:600;">${QCore.escapeHtml(line.pinyin)}</div>` : ""}
                  <div class="hanzi-text" style="font-size:19px;font-weight:600;">
                    ${showHanzi ? QCore.escapeHtml(line.chinese) : "•••••••• (Bấm để nghe câu thoại)"}
                  </div>
                </div>
              </div>
              <div style="flex:1;text-align:right;font-size:13.5px;color:var(--text-secondary);">
                ${
                  showTranslation
                    ? `<div>🇻🇳 <strong>${QCore.escapeHtml(line.vietnamese)}</strong></div><div style="font-size:12px;">🇬🇧 ${QCore.escapeHtml(line.english)}</div>`
                    : `<span style="font-size:12px;color:var(--text-muted);">(Đang ẩn bản dịch để luyện nghe)</span>`
                }
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- 4 Interactive Listening Exercises -->
      <div class="grid-2" style="margin-bottom:20px;">
        <!-- 1. MCQ + 2. Fill Blank -->
        <div class="card">
          <h3 style="margin:0 0 12px;font-size:16.5px;">📝 Bài 1: Nghe hiểu & Chọn đáp án</h3>
          <p style="margin:0 0 10px;font-weight:600;">${QCore.escapeHtml(lesson.exercises.mcq.question)}</p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
            ${lesson.exercises.mcq.options
              .map(
                (opt) => `<button class="btn btn-outline btn-sm" style="justify-content:flex-start;padding:10px 12px;" data-lis-mcq="${QCore.escapeHtml(opt)}">${QCore.escapeHtml(opt)}</button>`
              )
              .join("")}
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

        <!-- 3. Dictation + 4. Sentence Reorder -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h3 style="margin:0;font-size:16.5px;">⌨️ Bài 3: Nghe chép chính tả</h3>
            <button class="btn btn-soft btn-sm" id="lis-dic-audio">🔊 Nghe câu đọc</button>
          </div>
          <p style="font-size:13px;color:var(--text-secondary);margin:0 0 8px;">Nghe kỹ âm thanh rồi gõ lại cả câu chữ Hán Giản thể (gõ Pinyin sẽ hiện thanh gợi ý):</p>
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
            ${lesson.exercises.reorder.words
              .map((w) => `<button class="btn btn-outline btn-sm hanzi-text" style="font-size:16px;" data-lis-word="${QCore.escapeHtml(w)}">${QCore.escapeHtml(w)}</button>`)
              .join("")}
            <button class="btn btn-danger btn-sm" id="lis-ord-clear">Xóa</button>
            <button class="btn btn-primary btn-sm" id="lis-ord-check">Kiểm tra & Hoàn thành bài nghe</button>
          </div>
          <div id="lis-ord-res"></div>
        </div>
      </div>

      <!-- Post-Listening Unlocked Vocabulary & Grammar Explanation -->
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <h3 style="margin:0;font-size:17px;">📚 Giải thích chi tiết Từ vựng, Bản dịch & Ngữ pháp sau bài nghe</h3>
          <button class="btn btn-outline btn-sm" id="lis-unlock-btn">${unlockedAnalysis || isCompleted ? "Đang mở chi tiết" : "🔓 Mở xem toàn bộ giải thích"}</button>
        </div>
        ${
          unlockedAnalysis || isCompleted
            ? `
          <div class="grid-2" style="margin-top:14px;">
            <div class="card-subtle">
              <strong>Từ vựng trọng tâm trong hội thoại:</strong>
              <ul style="margin:8px 0 0;padding-left:18px;">
                ${lesson.vocabNotes.map((vn) => `<li><strong class="hanzi-text">${QCore.escapeHtml(vn.hz)}</strong> (${QCore.escapeHtml(vn.py)}): ${QCore.escapeHtml(vn.vi)}</li>`).join("")}
              </ul>
            </div>
            <div class="card-subtle">
              <strong>Điểm ngữ pháp & phát âm cần nhớ:</strong>
              <p style="margin:8px 0 0;font-size:13.5px;">${QCore.escapeHtml(lesson.grammarNotes)}</p>
            </div>
          </div>
        `
            : `<p style="margin:10px 0 0;font-size:13.5px;color:var(--text-muted);">Hãy thử tự nghe và làm bài tập trước, sau đó bấm mở khóa hoặc hoàn thành Bài 4 để xem toàn bộ giải thích nhé!</p>`
        }
      </div>
    `;

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
        QCore.speakChinese(lesson.lines[idx].chinese, {
          rate: playbackSpeed,
          onEnd: () => { playingIdx = -1; }
        });
      };
    });

    container.querySelector("#lis-play-all").onclick = () => {
      let i = 0;
      const playNext = () => {
        if (i >= lesson.lines.length) {
          playingIdx = -1;
          renderListening(container);
          return;
        }
        playingIdx = i;
        renderListening(container);
        QCore.speakChinese(lesson.lines[i].chinese, {
          rate: playbackSpeed,
          onEnd: () => {
            i += 1;
            setTimeout(playNext, 350);
          }
        });
      };
      playNext();
    };

    // Exercises handlers
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
        ? `<span style="color:var(--primary);font-weight:700;">✅ Tuyệt vời! Từ cần điền là "${QCore.escapeHtml(lesson.exercises.fillBlank.answer)}".</span>`
        : `<span style="color:var(--accent-amber);">Đáp án chuẩn là: <strong>${QCore.escapeHtml(lesson.exercises.fillBlank.answer)}</strong></span>`;
    };

    container.querySelector("#lis-dic-audio").onclick = () => QCore.speakChinese(lesson.exercises.dictation.audioText, { rate: playbackSpeed });
    container.querySelector("#lis-dic-check").onclick = () => {
      const val = container.querySelector("#lis-dic-inp").value.trim().replace(/[。！？.!?]/g, "");
      const exp = lesson.exercises.dictation.answer.replace(/[。！？.!?]/g, "");
      const ok = val === exp;
      QCore.updateSkillScore("listening", ok ? 95 : 65);
      container.querySelector("#lis-dic-res").innerHTML = ok
        ? `<span style="color:var(--primary);font-weight:700;">✅ Chép chính tả chính xác tuyệt đối!</span>`
        : `<span style="color:var(--accent-amber);">Câu chuẩn là: <strong>${QCore.escapeHtml(lesson.exercises.dictation.answer)}</strong> (${QCore.escapeHtml(lesson.exercises.dictation.pinyinHint)})</span>`;
    };

    container.querySelector("#lis-ord-audio").onclick = () => QCore.speakChinese(lesson.exercises.reorder.audioText, { rate: playbackSpeed });
    container.querySelectorAll("[data-lis-word]").forEach((b) => {
      b.onclick = () => {
        reorderAttempt.push(b.getAttribute("data-lis-word"));
        renderListening(container);
      };
    });
    container.querySelector("#lis-ord-clear").onclick = () => {
      reorderAttempt = [];
      renderListening(container);
    };
    container.querySelector("#lis-ord-check").onclick = () => {
      const joined = reorderAttempt.join("");
      const ok = joined === lesson.exercises.reorder.answer;
      const resEl = container.querySelector("#lis-ord-res");
      if (ok) {
        if (!st.listeningCompleted.includes(lesson.id)) {
          st.listeningCompleted.push(lesson.id);
          QCore.logDailyActivity("listeningCount", 1);
        }
        unlockedAnalysis = true;
        showTranslation = true;
        QCore.updateSkillScore("listening", 95);
        QCore.saveState(true);
        QCore.showToast("🎉 Chúc mừng bạn đã hoàn thành bài Luyện nghe!");
        renderListening(container);
      } else {
        resEl.innerHTML = `<span style="color:var(--accent-red);">Chưa đúng trật tự. Câu chuẩn là: <strong>${QCore.escapeHtml(lesson.exercises.reorder.answer)}</strong></span>`;
      }
    };

    container.querySelector("#lis-unlock-btn").onclick = () => {
      unlockedAnalysis = true;
      showTranslation = true;
      renderListening(container);
    };
  }

  return {
    renderPinyin,
    renderListening
  };
})();
