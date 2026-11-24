// ==============================================================================
// APP-OPERATOR.JS - ACC FUTSAL CUP 2026 OPERATOR CONSOLE LOGIC
// ==============================================================================

class OperatorConsole {
  constructor() {
    this.currentState = null;
    this.currentEvents = [];
    this.timerInterval = null;
    this.isUnlocked = false;

    this.init();
  }

  init() {
    // 1. Periksa PIN Kunci Masuk
    this.checkPinAuth();

    // 2. Populasi Daftar Pertandingan dari Preset
    this.populateMatchesDropdown();

    // 3. Subscribe ke Realtime Sync Engine
    window.syncEngine.subscribe((state, events, conn) => {
      this.currentState = state;
      this.currentEvents = events;
      this.renderUI(state, events);
    });

    // 4. Timer loop lokal untuk tampilan kontrol operator
    this.startLocalTimerLoop();
  }

  checkPinAuth() {
    const unlocked = sessionStorage.getItem("acc_operator_unlocked");
    const modal = document.getElementById("pinGateModal");
    if (unlocked === "true") {
      this.isUnlocked = true;
      if (modal) modal.classList.remove("show");
    } else {
      this.isUnlocked = false;
      if (modal) modal.classList.add("show");
    }
  }

  submitPin() {
    const input = document.getElementById("pinInput");
    const pin = input ? input.value.trim() : "";
    const correctPin = CONFIG.OPERATOR_PIN || "ACCdisplay2026";

    if (pin === correctPin || pin === "ACCdisplay2026") {
      sessionStorage.setItem("acc_operator_unlocked", "true");
      this.isUnlocked = true;
      const modal = document.getElementById("pinGateModal");
      if (modal) modal.classList.remove("show");
    } else {
      alert("PIN Akses Salah! Silakan coba lagi.");
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  }

  populateMatchesDropdown() {
    const select = document.getElementById("selectMatchPreset");
    if (!select || typeof ACC_MATCHES === "undefined") return;

    select.innerHTML = '<option value="">-- Pilih Laga Resmi Turnamen (52 Pertandingan) --</option>';

    // Kelompokkan laga SMP dan SD
    const optGroupSMP = document.createElement("optgroup");
    optGroupSMP.label = "🏆 KATEGORI SMP (16 Tim)";

    const optGroupSD = document.createElement("optgroup");
    optGroupSD.label = "⚽ KATEGORI SD (16 Tim)";

    ACC_MATCHES.forEach((m, idx) => {
      const opt = document.createElement("option");
      opt.value = m.id;

      const homeName = m.homeName || m.homePlaceholder || ("Tim " + (m.homeId || ""));
      const awayName = m.awayName || m.awayPlaceholder || ("Tim " + (m.awayId || ""));
      opt.textContent = `${m.id}: ${homeName} vs ${awayName} (${m.stage || 'Grup'} - ${m.time || 'Waktu'})`;

      if ((m.category || "SMP") === "SD") {
        optGroupSD.appendChild(opt);
      } else {
        optGroupSMP.appendChild(opt);
      }
    });

    select.appendChild(optGroupSMP);
    select.appendChild(optGroupSD);
  }

  loadSelectedPreset(matchId) {
    if (!matchId || typeof ACC_MATCHES === "undefined" || typeof ACC_TEAMS === "undefined") return;

    const m = ACC_MATCHES.find(x => x.id === matchId);
    if (!m) return;

    if (!confirm(`Muat pertandingan "${m.id}: ${m.homeName || 'Home'} vs ${m.awayName || 'Away'}" ke layar TV?\n(Skor dan timer saat ini akan di-reset untuk laga ini)`)) {
      return;
    }

    const homeTeam = ACC_TEAMS.find(t => t.id === m.homeId) || {};
    const awayTeam = ACC_TEAMS.find(t => t.id === m.awayId) || {};

    const cat = m.category || "SMP";
    const targetDuration = cat === "SD" ? CONFIG.DEFAULT_HALF_DURATION_SD : CONFIG.DEFAULT_HALF_DURATION_SMP;

    const updates = {
      category: cat,
      stage: m.stage ? m.stage.toUpperCase() : "FASE GRUP",
      pitch: m.pitch || "Lapangan Utama",
      home_id: homeTeam.id || m.homeId || "HOME",
      home_name: homeTeam.name || m.homeName || "TIM HOME",
      home_short: homeTeam.shortName || (homeTeam.name || "HOME").substring(0, 5),
      home_logo: homeTeam.logo || "/assets/logo.png",
      home_color: homeTeam.badgeColor || "#10b981",
      home_score: 0,
      home_penalties: null,
      home_fouls: 0,
      home_timeout: false,
      away_id: awayTeam.id || m.awayId || "AWAY",
      away_name: awayTeam.name || m.awayName || "TIM AWAY",
      away_short: awayTeam.shortName || (awayTeam.name || "AWAY").substring(0, 5),
      away_logo: awayTeam.logo || "/assets/logo.png",
      away_color: awayTeam.badgeColor || "#3b82f6",
      away_score: 0,
      away_penalties: null,
      away_fouls: 0,
      away_timeout: false,
      period: "upcoming",
      period_label: "BELUM DIMULAI",
      timer_seconds: 0,
      target_duration: targetDuration,
      is_running: false,
      timer_started_at: null,
      timeout_running: false,
      timeout_seconds: 60,
      timeout_started_at: null
    };

    window.syncEngine.updateState(updates);
    window.syncEngine.clearAllEvents();
  }

  renderUI(state, events) {
    if (!state) return;

    // Nama Tim & Skor
    this.setText("ctrlHomeName", state.home_name || "TIM HOME");
    this.setText("ctrlAwayName", state.away_name || "TIM AWAY");
    this.setText("ctrlHomeScore", state.home_score ?? 0);
    this.setText("ctrlAwayScore", state.away_score ?? 0);

    // Fouls
    this.setText("ctrlHomeFouls", state.home_fouls ?? 0);
    this.setText("ctrlAwayFouls", state.away_fouls ?? 0);

    // Timeouts
    const btnHomeTo = document.getElementById("btnHomeTimeout");
    if (btnHomeTo) {
      btnHomeTo.textContent = state.home_timeout ? "TO: HABIS" : "Minta Timeout";
      btnHomeTo.style.opacity = state.home_timeout ? "0.6" : "1";
    }
    const btnAwayTo = document.getElementById("btnAwayTimeout");
    if (btnAwayTo) {
      btnAwayTo.textContent = state.away_timeout ? "TO: HABIS" : "Minta Timeout";
      btnAwayTo.style.opacity = state.away_timeout ? "0.6" : "1";
    }

    // Tombol Play / Pause Timer
    const btnPlay = document.getElementById("btnTimerToggle");
    if (btnPlay) {
      if (state.is_running) {
        btnPlay.textContent = "⏸️ PAUSE TIMER";
        btnPlay.classList.add("pause");
      } else {
        btnPlay.textContent = "▶️ JALANKAN TIMER";
        btnPlay.classList.remove("pause");
      }
    }

    // Active Period Highlight
    document.querySelectorAll(".btn-period").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.period === state.period);
    });

    // Render Events List
    this.renderEventsLog(events);
  }

  startLocalTimerLoop() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      const state = this.currentState;
      const digitsEl = document.getElementById("ctrlTimerDigits");
      if (!digitsEl || !state) return;

      let sec = state.timer_seconds || 0;
      if (state.is_running && state.timer_started_at) {
        digitsEl.classList.add("running");
        const elapsed = (Date.now() - new Date(state.timer_started_at).getTime()) / 1000;
        sec += Math.max(0, Math.floor(elapsed));
      } else {
        digitsEl.classList.remove("running");
      }

      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");
      digitsEl.textContent = `${mm}:${ss}`;
    }, 500);
  }

  // --- KONTROL SKOR ---
  changeScore(team, delta) {
    if (!this.currentState) return;
    const key = team === "home" ? "home_score" : "away_score";
    const current = this.currentState[key] || 0;
    const updated = Math.max(0, current + delta);

    const updates = {};
    updates[key] = updated;

    window.syncEngine.updateState(updates);
  }

  // --- KONTROL TIMER ---
  toggleTimer() {
    if (!this.currentState) return;
    const isRunning = this.currentState.is_running;

    if (!isRunning) {
      // Start timer
      window.syncEngine.updateState({
        is_running: true,
        timer_started_at: new Date().toISOString()
      });
    } else {
      // Pause timer
      let sec = this.currentState.timer_seconds || 0;
      if (this.currentState.timer_started_at) {
        const elapsed = (Date.now() - new Date(this.currentState.timer_started_at).getTime()) / 1000;
        sec += Math.max(0, Math.floor(elapsed));
      }
      window.syncEngine.updateState({
        is_running: false,
        timer_seconds: sec,
        timer_started_at: null
      });
    }
  }

  adjustTimer(deltaSeconds) {
    if (!this.currentState) return;
    let sec = this.currentState.timer_seconds || 0;
    if (this.currentState.is_running && this.currentState.timer_started_at) {
      const elapsed = (Date.now() - new Date(this.currentState.timer_started_at).getTime()) / 1000;
      sec += Math.max(0, Math.floor(elapsed));
    }
    const newSec = Math.max(0, sec + deltaSeconds);

    window.syncEngine.updateState({
      timer_seconds: newSec,
      timer_started_at: this.currentState.is_running ? new Date().toISOString() : null
    });
  }

  resetTimer() {
    if (!confirm("Reset timer menjadi 00:00?")) return;
    window.syncEngine.updateState({
      timer_seconds: 0,
      is_running: false,
      timer_started_at: null
    });
  }

  // --- KONTROL BABAK / STATUS ---
  setPeriod(periodKey) {
    if (!this.currentState) return;

    let label = "BELUM DIMULAI";
    let updates = { period: periodKey };

    switch (periodKey) {
      case "upcoming":
        label = "BELUM DIMULAI";
        updates.is_running = false;
        updates.timer_started_at = null;
        break;
      case "1st":
        label = "BABAK 1";
        updates.is_running = true;
        updates.timer_started_at = new Date().toISOString();
        break;
      case "halftime":
        label = "ISTIRAHAT (HT)";
        // Pause timer saat istirahat & reset fouls babak 1
        let sec1 = this.currentState.timer_seconds || 0;
        if (this.currentState.is_running && this.currentState.timer_started_at) {
          sec1 += Math.floor((Date.now() - new Date(this.currentState.timer_started_at).getTime()) / 1000);
        }
        updates.is_running = false;
        updates.timer_seconds = sec1;
        updates.timer_started_at = null;
        // Aturan futsal: Fouls di-reset setiap pergantian babak
        updates.home_fouls = 0;
        updates.away_fouls = 0;
        updates.home_timeout = false;
        updates.away_timeout = false;
        break;
      case "2nd":
        label = "BABAK 2";
        updates.is_running = true;
        updates.timer_started_at = new Date().toISOString();
        break;
      case "et":
        label = "BABAK TAMBAHAN";
        updates.is_running = true;
        updates.timer_started_at = new Date().toISOString();
        break;
      case "penalties":
        label = "ADU PENALTI";
        updates.is_running = false;
        updates.timer_started_at = null;
        if (this.currentState.home_penalties === null) updates.home_penalties = 0;
        if (this.currentState.away_penalties === null) updates.away_penalties = 0;
        break;
      case "finished":
        label = "SELESAI (FT)";
        updates.is_running = false;
        updates.timer_started_at = null;
        break;
    }

    updates.period_label = label;
    window.syncEngine.updateState(updates);
  }

  // --- KONTROL PELANGGARAN (FOULS) ---
  changeFoul(team, delta) {
    if (!this.currentState) return;
    const key = team === "home" ? "home_fouls" : "away_fouls";
    const cur = this.currentState[key] || 0;
    const updated = Math.max(0, cur + delta);

    if (updated >= CONFIG.MAX_FOULS_LIMIT && delta > 0) {
      alert(`⚠️ PERINGATAN: ${team === "home" ? this.currentState.home_name : this.currentState.away_name} telah mencapai ${CONFIG.MAX_FOULS_LIMIT} Pelanggaran!\nPelanggaran berikutnya berbuah Second Penalty (Titik 10 Meter) bagi lawan!`);
    }

    const updates = {};
    updates[key] = updated;
    window.syncEngine.updateState(updates);
  }

  resetFouls() {
    if (!confirm("Reset akumulasi foul kedua tim menjadi 0?")) return;
    window.syncEngine.updateState({
      home_fouls: 0,
      away_fouls: 0
    });
  }

  // --- KONTROL TIMEOUT ---
  startTimeout(team) {
    if (!this.currentState) return;
    const teamName = team === "home" ? this.currentState.home_name : this.currentState.away_name;

    if (!confirm(`Mulai Timeout 60 Detik untuk ${teamName}? Layar TV akan menampilkan countdown.`)) return;

    const updates = {
      timeout_running: true,
      timeout_seconds: CONFIG.TIMEOUT_DURATION || 60,
      timeout_started_at: new Date().toISOString()
    };
    if (team === "home") updates.home_timeout = true;
    if (team === "away") updates.away_timeout = true;

    window.syncEngine.updateState(updates);
    window.syncEngine.addEvent({
      type: "timeout",
      team: team,
      player_name: "Timeout",
      minute: this.getCurrentMatchMinute(),
      note: `Timeout diambil oleh ${teamName}`
    });
  }

  cancelTimeout() {
    window.syncEngine.updateState({
      timeout_running: false,
      timeout_started_at: null
    });
  }

  // --- LOG EVENT GOL & KARTU ---
  openAddEventModal(type, team) {
    const modal = document.getElementById("addEventModal");
    const titleEl = document.getElementById("addEventModalTitle");
    const selectPlayer = document.getElementById("selectEventPlayer");
    const inputCustom = document.getElementById("inputCustomPlayer");
    const inputMin = document.getElementById("inputEventMinute");

    if (!modal) return;

    document.getElementById("hiddenEventType").value = type;
    document.getElementById("hiddenEventTeam").value = team;

    const teamObj = this.getTeamData(team === "home" ? this.currentState.home_id : this.currentState.away_id);
    const teamName = team === "home" ? this.currentState.home_name : this.currentState.away_name;

    let typeLabel = "Catat Gol";
    if (type === "card_yellow") typeLabel = "Kartu Kuning";
    if (type === "card_red") typeLabel = "Kartu Merah";

    if (titleEl) titleEl.textContent = `${typeLabel} - ${teamName}`;
    if (inputMin) inputMin.value = this.getCurrentMatchMinute();

    // Populasi pemain dari skuad tim jika ada
    if (selectPlayer) {
      selectPlayer.innerHTML = '<option value="">-- Pilih Pemain dari Skuad --</option>';
      if (teamObj && Array.isArray(teamObj.players) && teamObj.players.length > 0) {
        teamObj.players.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.name || p;
          opt.textContent = `#${p.number || '-'} ${p.name || p} (${p.position || 'Pemain'})`;
          selectPlayer.appendChild(opt);
        });
      }
    }

    if (inputCustom) inputCustom.value = "";
    modal.classList.add("show");
  }

  closeAddEventModal() {
    const modal = document.getElementById("addEventModal");
    if (modal) modal.classList.remove("show");
  }

  saveEventFromModal() {
    const type = document.getElementById("hiddenEventType").value;
    const team = document.getElementById("hiddenEventTeam").value;
    const selPlayer = document.getElementById("selectEventPlayer").value;
    const customPlayer = document.getElementById("inputCustomPlayer").value.trim();
    const minute = document.getElementById("inputEventMinute").value.trim() || this.getCurrentMatchMinute();

    const playerName = customPlayer || selPlayer || "Pemain";

    // 1. Tambah event
    window.syncEngine.addEvent({
      type: type,
      team: team,
      player_name: playerName,
      minute: minute
    });

    // 2. Jika tipe adalah gol, otomatis tambahkan skor tim!
    if (type === "goal") {
      this.changeScore(team, 1);
    }

    this.closeAddEventModal();
  }

  getCurrentMatchMinute() {
    if (!this.currentState) return "1'";
    let sec = this.currentState.timer_seconds || 0;
    if (this.currentState.is_running && this.currentState.timer_started_at) {
      sec += Math.floor((Date.now() - new Date(this.currentState.timer_started_at).getTime()) / 1000);
    }
    const min = Math.max(1, Math.ceil(sec / 60));
    return `${min}'`;
  }

  getTeamData(teamId) {
    if (typeof ACC_TEAMS === "undefined") return null;
    return ACC_TEAMS.find(t => t.id === teamId) || null;
  }

  renderEventsLog(events) {
    const container = document.getElementById("eventsLogList");
    if (!container) return;

    if (!events || events.length === 0) {
      container.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 12px;">Belum ada kejadian tercatat.</div>';
      return;
    }

    const sorted = [...events].reverse();
    container.innerHTML = sorted.map(ev => {
      let icon = "⚽";
      if (ev.type === "card_yellow") icon = "🟨";
      if (ev.type === "card_red") icon = "🟥";
      if (ev.type === "timeout") icon = "⏱️";

      const teamName = ev.team === "home" 
        ? (this.currentState ? (this.currentState.home_short || this.currentState.home_name) : "HOME")
        : (this.currentState ? (this.currentState.away_short || this.currentState.away_name) : "AWAY");

      return `
        <div class="event-log-item">
          <div class="event-log-left">
            <span>${icon}</span>
            <span>${teamName}</span>
            <span>•</span>
            <span style="color: #fff;">${ev.player_name}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">(${ev.minute || '-'})</span>
          </div>
          <button type="button" class="btn-trash" onclick="operatorConsole.deleteEvent('${ev.id}')" title="Hapus event ini">
            🗑️
          </button>
        </div>
      `;
    }).join("");
  }

  deleteEvent(id) {
    if (!confirm("Hapus kejadian ini dari timeline?")) return;
    window.syncEngine.deleteEvent(id);
  }

  // --- SETTINGS MODAL ---
  openSettingsModal() {
    const modal = document.getElementById("settingsModal");
    const inputUrl = document.getElementById("settingSupabaseUrl");
    const inputKey = document.getElementById("settingSupabaseKey");
    const inputPin = document.getElementById("settingOperatorPin");

    if (inputUrl) inputUrl.value = localStorage.getItem("acc_supabase_url") || "";
    if (inputKey) inputKey.value = localStorage.getItem("acc_supabase_key") || "";
    if (inputPin) inputPin.value = localStorage.getItem("acc_operator_pin") || "ACCdisplay2026";

    if (modal) modal.classList.add("show");
  }

  closeSettingsModal() {
    const modal = document.getElementById("settingsModal");
    if (modal) modal.classList.remove("show");
  }

  saveSettings() {
    const url = document.getElementById("settingSupabaseUrl").value.trim();
    const key = document.getElementById("settingSupabaseKey").value.trim();
    const pin = document.getElementById("settingOperatorPin").value.trim();

    saveSupabaseConfig(url, key);
    if (pin) saveOperatorPin(pin);

    alert("Pengaturan Supabase & PIN berhasil disimpan!\nHalaman akan dimuat ulang untuk menghubungkan ke Supabase.");
    window.location.reload();
  }

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

// Inisialisasi Operator Console saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  window.operatorConsole = new OperatorConsole();
});
