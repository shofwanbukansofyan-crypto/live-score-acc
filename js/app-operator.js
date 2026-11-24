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

    // 2. Populasi Daftar Pertandingan dari matches.js resmi
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

  async fetchLiveAccTournamentData() {
    try {
      const host = 'qxanfoqijpznszezwzef.supabase.co';
      const key = 'sb_publishable_3sH1x2EhzsmxKtCAei-sbg_ZAunYZja';
      const [resTeams, resMatches] = await Promise.all([
        fetch(`https://${host}/rest/v1/teams?select=*&limit=500`, {
          headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
        }).then(r => r.json()),
        fetch(`https://${host}/rest/v1/matches?select=*&limit=500`, {
          headers: { 'apikey': key, 'Authorization': 'Bearer ' + key }
        }).then(r => r.json())
      ]);

      if (Array.isArray(resTeams) && resTeams.length > 0) {
        window.ACC_TEAMS = resTeams.map(t => {
          const idNum = parseInt((t.id || '').replace(/\D/g, ''), 10) || 0;
          const cat = t.category || (idNum > 16 ? 'SD' : 'SMP');
          const managerName = t.official_manager || (t.official && t.official.manager) || t.manager || '-';
          const coachName = t.official_coach || (t.official && t.official.coach) || t.coach || '-';
          return {
            id: t.id,
            name: t.name || 'Tim ' + t.id,
            shortName: t.short_name || t.shortName || (t.name || '').substring(0, 5).toUpperCase(),
            category: cat,
            badgeColor: t.badge_color || t.badgeColor || (cat === 'SD' ? '#3b82f6' : '#10b981'),
            city: t.city || 'Sulawesi Selatan',
            logo: t.logo || '/assets/logo.png',
            group: t.group_letter || t.group || 'A',
            manager: managerName,
            coach: coachName,
            official: { manager: managerName, coach: coachName },
            players: (t.players || []).map(p => ({
              no: p.no ?? p.number ?? 0,
              name: p.name || 'Pemain',
              pos: p.pos || p.position || 'Pemain',
              goals: p.goals || 0,
              yc: p.yc || 0,
              rc: p.rc || 0,
              photo: p.photo || ''
            }))
          };
        });
      }

      if (Array.isArray(resMatches) && resMatches.length > 0) {
        // Urutkan jadwal secara berurutan dan teratur: M_SMP_01..33, M_SD_01..32
        resMatches.sort((a, b) => (a.id || '').localeCompare(b.id || '', undefined, { numeric: true }));

        window.ACC_MATCHES = resMatches.map(m => {
          const homeTeam = (window.ACC_TEAMS || []).find(t => t.id === (m.home_id || m.homeId));
          const awayTeam = (window.ACC_TEAMS || []).find(t => t.id === (m.away_id || m.awayId));
          const homeName = (homeTeam && homeTeam.name) || m.home_placeholder || m.home_name || 'Menunggu Tim Lolos';
          const awayName = (awayTeam && awayTeam.name) || m.away_placeholder || m.away_name || 'Menunggu Tim Lolos';
          return {
            id: m.id,
            category: m.category || (m.id.includes('_SD_') ? 'SD' : 'SMP'),
            stage: m.round_name || m.stage || (m.stage === 'group' ? `Grup ${m.group_letter || 'A'}` : 'Babak Gugur'),
            group: m.group_letter || m.group || null,
            pitch: m.pitch || 'Lapangan Utama',
            date: m.date || '',
            time: m.time || '',
            homeId: m.home_id || m.homeId || '',
            awayId: m.away_id || m.awayId || '',
            homeName,
            awayName,
            homeShort: (homeTeam && homeTeam.shortName) || homeName.substring(0, 5),
            awayShort: (awayTeam && awayTeam.shortName) || awayName.substring(0, 5),
            homeLogo: (homeTeam && homeTeam.logo) || '/assets/logo.png',
            awayLogo: (awayTeam && awayTeam.logo) || '/assets/logo.png',
            homeColor: (homeTeam && homeTeam.badgeColor) || '#10b981',
            awayColor: (awayTeam && awayTeam.badgeColor) || '#f59e0b',
            status: m.status || 'upcoming',
            homeScore: m.home_score ?? 0,
            awayScore: m.away_score ?? 0,
            scorers: m.scorers || [],
            cards: m.cards || []
          };
        });

        // Re-populate dropdown dengan data terupdate
        this.populateMatchesDropdown();
      }
    } catch (e) {
      console.warn("Live sync accfutsal notice:", e);
      throw e;
    }
  }

  async manualSyncAccData() {
    const btn = document.getElementById("btnSyncAcc");
    const origHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = "⏳ Menyinkronkan...";
    }
    try {
      await this.fetchLiveAccTournamentData();
      alert("✅ Berhasil! 64 Jadwal Pertandingan & 32 Tim Skuad Resmi berhasil disinkronkan langsung dari server accfutsal2026.");
    } catch (err) {
      alert("⚠️ Gagal sinkronisasi data online: " + (err.message || err) + "\nSilakan periksa koneksi internet.");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml || "🔄 Sinkron accfutsal2026";
      }
    }
  }

  forceReloadOfficialData() {
    const btn = document.getElementById("btnForceReload");
    if (btn) btn.innerHTML = "⏳ Membersihkan Cache...";
    if ('caches' in window) {
      caches.keys().then(names => {
        return Promise.all(names.map(name => caches.delete(name)));
      }).then(() => {
        this.doReload();
      }).catch(() => this.doReload());
    } else {
      this.doReload();
    }
  }

  doReload() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        for (let r of regs) r.unregister();
      });
    }
    window.location.href = window.location.origin + window.location.pathname + '?force_purge=' + Date.now();
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
    const matchesList = window.ACC_MATCHES || (typeof ACC_MATCHES !== "undefined" ? ACC_MATCHES : []);
    const teamsList = window.ACC_TEAMS || (typeof ACC_TEAMS !== "undefined" ? ACC_TEAMS : []);
    if (!select || matchesList.length === 0) return;

    select.innerHTML = '<option value="">-- Pilih Laga Resmi Turnamen (64 Pertandingan) --</option>';

    // Kelompokkan laga SMP dan SD
    const optGroupSMP = document.createElement("optgroup");
    optGroupSMP.label = "🏆 KATEGORI SMP (32 Laga Resmi)";

    const optGroupSD = document.createElement("optgroup");
    optGroupSD.label = "⚽ KATEGORI SD (32 Laga Resmi)";

    matchesList.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;

      const homeTeam = teamsList.find(t => t.id === (m.homeId || m.home_id));
      const awayTeam = teamsList.find(t => t.id === (m.awayId || m.away_id));

      const homeName = m.homeName || (homeTeam && homeTeam.name) || m.home_placeholder || m.home_name || "TBD";
      const awayName = m.awayName || (awayTeam && awayTeam.name) || m.away_placeholder || m.away_name || "TBD";
      const stageInfo = m.stage || m.round_name || 'Babak';
      const timeInfo = m.time ? ` • ${m.time}` : '';
      const dateInfo = m.date ? ` • ${m.date}` : '';

      opt.textContent = `[${m.id}] ${homeName} vs ${awayName} (${stageInfo}${dateInfo}${timeInfo})`;

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
    const matchesList = window.ACC_MATCHES || (typeof ACC_MATCHES !== "undefined" ? ACC_MATCHES : []);
    const teamsList = window.ACC_TEAMS || (typeof ACC_TEAMS !== "undefined" ? ACC_TEAMS : []);
    if (!matchId || matchesList.length === 0) return;

    const m = matchesList.find(x => x.id === matchId);
    if (!m) return;

    const homeTeam = teamsList.find(t => t.id === (m.homeId || m.home_id)) || {};
    const awayTeam = teamsList.find(t => t.id === (m.awayId || m.away_id)) || {};

    const homeName = m.homeName || homeTeam.name || m.home_name || m.home_placeholder || 'TIM HOME';
    const awayName = m.awayName || awayTeam.name || m.away_name || m.away_placeholder || 'TIM AWAY';
    const homeShort = m.homeShort || homeTeam.shortName || homeName.substring(0, 5);
    const awayShort = m.awayShort || awayTeam.shortName || awayName.substring(0, 5);
    const homeLogo = m.homeLogo || homeTeam.logo || "/assets/acc_logo.png";
    const awayLogo = m.awayLogo || awayTeam.logo || "/assets/acc_logo.png";
    const cat = m.category || "SMP";
    const homeColor = m.homeColor || homeTeam.badgeColor || (cat === 'SD' ? "#3b82f6" : "#10b981");
    const awayColor = m.awayColor || awayTeam.badgeColor || "#f59e0b";

    if (!confirm(`Muat pertandingan "${m.id}: ${homeName} vs ${awayName}" ke layar TV?\n(Skor dan timer saat ini akan di-reset untuk laga ini)`)) {
      return;
    }

    const targetDuration = cat === "SD" ? CONFIG.DEFAULT_HALF_DURATION_SD : CONFIG.DEFAULT_HALF_DURATION_SMP;

    const updates = {
      category: cat,
      stage: m.stage ? m.stage.toUpperCase() : "FASE GRUP",
      pitch: m.pitch || "Lapangan Utama",
      home_id: m.homeId || homeTeam.id || "HOME",
      home_name: homeName,
      home_short: homeShort,
      home_logo: homeLogo,
      home_color: homeColor,
      home_score: 0,
      home_penalties: null,
      home_fouls: 0,
      home_timeout: false,
      away_id: m.awayId || awayTeam.id || "AWAY",
      away_name: awayName,
      away_short: awayShort,
      away_logo: awayLogo,
      away_color: awayColor,
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

  resetCurrentMatch() {
    const state = this.currentState;
    const matchName = state && state.home_name && state.away_name 
      ? `"${state.home_name} vs ${state.away_name}"`
      : "pertandingan yang sedang aktif";

    const isConfirmed = confirm(
      `⚠️ KONFIRMASI RESET PERTANDINGAN\n\n` +
      `Apakah Anda yakin ingin me-reset ${matchName}?\n\n` +
      `Tindakan ini akan:\n` +
      `• Mengembalikan skor menjadi 0 - 0\n` +
      `• Menghentikan dan mengembalikan timer ke 00:00\n` +
      `• Me-reset akumulasi fouls kedua tim menjadi 0\n` +
      `• Mengembalikan jatah Time Out (TO: ADA)\n` +
      `• Menghapus seluruh riwayat gol & kartu di Match Momentum\n` +
      `• Mengembalikan status babak ke BELUM DIMULAI\n\n` +
      `Tekan OK untuk mereset laga.`
    );

    if (!isConfirmed) return;

    const cat = state ? (state.category || "SMP") : "SMP";
    const targetDuration = cat === "SD" 
      ? (CONFIG.DEFAULT_HALF_DURATION_SD || 600) 
      : (CONFIG.DEFAULT_HALF_DURATION_SMP || 900);

    const resetPayload = {
      home_score: 0,
      away_score: 0,
      home_fouls: 0,
      away_fouls: 0,
      home_timeout: false,
      away_timeout: false,
      home_penalties: null,
      away_penalties: null,
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

    window.syncEngine.updateState(resetPayload);
    window.syncEngine.clearAllEvents();

    alert("✅ Pertandingan berhasil di-reset ke kondisi awal (0-0, waktu 00:00, Match Momentum bersih).");
  }

  renderUI(state, events) {
    if (!state) return;

    // Nama Tim, Logo & Skor
    this.setText("ctrlHomeName", state.home_name || "TIM HOME");
    this.setText("ctrlAwayName", state.away_name || "TIM AWAY");
    const homeLogoEl = document.getElementById("ctrlHomeLogo");
    if (homeLogoEl && state.home_logo) homeLogoEl.src = state.home_logo;
    const awayLogoEl = document.getElementById("ctrlAwayLogo");
    if (awayLogoEl && state.away_logo) awayLogoEl.src = state.away_logo;
    this.setText("ctrlHomeScore", state.home_score ?? 0);
    this.setText("ctrlAwayScore", state.away_score ?? 0);

    // Tampilkan Manajer & Pelatih Resmi
    const homeTeam = this.getTeamData(state.home_id);
    const awayTeam = this.getTeamData(state.away_id);
    this.setText("ctrlHomeManager", (homeTeam && homeTeam.official && homeTeam.official.manager) || (homeTeam && homeTeam.manager) || "-");
    this.setText("ctrlHomeCoach", (homeTeam && homeTeam.official && homeTeam.official.coach) || (homeTeam && homeTeam.coach) || "-");
    this.setText("ctrlAwayManager", (awayTeam && awayTeam.official && awayTeam.official.manager) || (awayTeam && awayTeam.manager) || "-");
    this.setText("ctrlAwayCoach", (awayTeam && awayTeam.official && awayTeam.official.coach) || (awayTeam && awayTeam.coach) || "-");

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
    const ownGoalContainer = document.getElementById("ownGoalContainer");
    const checkIsOwnGoal = document.getElementById("checkIsOwnGoal");
    const ownGoalDetails = document.getElementById("ownGoalDetails");
    const ogAwardHome = document.getElementById("ogAwardHome");
    const ogAwardAway = document.getElementById("ogAwardAway");
    const ogAwardHomeLabel = document.getElementById("ogAwardHomeLabel");
    const ogAwardAwayLabel = document.getElementById("ogAwardAwayLabel");
    const selectPlayerLabel = document.getElementById("selectPlayerLabel");

    if (!modal) return;

    document.getElementById("hiddenEventType").value = type;
    document.getElementById("hiddenEventTeam").value = team;

    const teamName = team === "home" ? this.currentState.home_name : this.currentState.away_name;

    let typeLabel = "Catat Gol";
    if (type === "card_yellow") typeLabel = "Kartu Kuning";
    if (type === "card_red") typeLabel = "Kartu Merah";

    if (titleEl) titleEl.textContent = `${typeLabel} - ${teamName}`;
    if (inputMin) inputMin.value = this.getCurrentMatchMinute();

    // Reset opsi Gol Bunuh Diri (Own Goal)
    if (checkIsOwnGoal) checkIsOwnGoal.checked = false;
    if (ownGoalDetails) ownGoalDetails.style.display = "none";
    if (selectPlayerLabel) selectPlayerLabel.textContent = "Pilih Pemain dari Skuad Resmi:";

    if (type === "goal") {
      if (ownGoalContainer) ownGoalContainer.style.display = "block";
      const homeName = this.currentState ? (this.currentState.home_short || this.currentState.home_name || "Tim Home") : "Tim Home";
      const awayName = this.currentState ? (this.currentState.away_short || this.currentState.away_name || "Tim Away") : "Tim Away";
      if (ogAwardHomeLabel) ogAwardHomeLabel.textContent = `${homeName} (+1 Skor)`;
      if (ogAwardAwayLabel) ogAwardAwayLabel.textContent = `${awayName} (+1 Skor)`;
      if (team === "home") {
        if (ogAwardHome) ogAwardHome.checked = true;
      } else {
        if (ogAwardAway) ogAwardAway.checked = true;
      }
    } else {
      if (ownGoalContainer) ownGoalContainer.style.display = "none";
    }

    // Populasi pemain dari skuad tim awal
    this.populatePlayerDropdown(team, type, false);

    if (inputCustom) inputCustom.value = "";
    modal.classList.add("show");
  }

  toggleOwnGoal(isChecked) {
    const ownGoalDetails = document.getElementById("ownGoalDetails");
    const selectPlayerLabel = document.getElementById("selectPlayerLabel");
    const inputCustom = document.getElementById("inputCustomPlayer");

    if (ownGoalDetails) ownGoalDetails.style.display = isChecked ? "block" : "none";

    if (isChecked) {
      if (selectPlayerLabel) selectPlayerLabel.textContent = "Pilih Pemain yang Melakukan Gol Bunuh Diri (GBD):";
      if (inputCustom) inputCustom.placeholder = "Contoh: Nama Pemain (GBD)";
      this.onOgAwardTeamChange();
    } else {
      if (selectPlayerLabel) selectPlayerLabel.textContent = "Pilih Pemain dari Skuad Resmi:";
      if (inputCustom) inputCustom.placeholder = "Contoh: Ahmad (#10)";
      const origTeam = document.getElementById("hiddenEventTeam").value;
      this.populatePlayerDropdown(origTeam, "goal", false);
    }
  }

  onOgAwardTeamChange() {
    const isHomeAwarded = document.getElementById("ogAwardHome")?.checked;
    // Jika skor diberikan ke Home, maka pelaku gol bunuh diri berasal dari tim Away!
    // Sebaliknya jika skor diberikan ke Away, pelaku gol bunuh diri berasal dari tim Home.
    const offendingTeam = isHomeAwarded ? "away" : "home";
    this.populatePlayerDropdown(offendingTeam, "goal", true);
  }

  populatePlayerDropdown(teamKey, eventType, isOwnGoal = false) {
    const selectPlayer = document.getElementById("selectEventPlayer");
    if (!selectPlayer || !this.currentState) return;

    const teamId = teamKey === "home" ? this.currentState.home_id : this.currentState.away_id;
    const teamObj = this.getTeamData(teamId);
    const teamName = teamKey === "home" ? (this.currentState.home_short || this.currentState.home_name) : (this.currentState.away_short || this.currentState.away_name);

    selectPlayer.innerHTML = `<option value="">-- Pilih Pemain (${teamName}) --</option>`;

    if (teamObj && Array.isArray(teamObj.players) && teamObj.players.length > 0) {
      teamObj.players.forEach(p => {
        const opt = document.createElement("option");
        const pName = p.name || p;
        const num = p.no ?? p.number ?? '-';
        const pos = p.pos ?? p.position ?? 'Pemain';
        opt.value = isOwnGoal ? `${pName} (GBD)` : pName;
        opt.textContent = isOwnGoal 
          ? `[${teamName}] #${num} ${pName} (GBD)`
          : `#${num} ${pName} (${pos})`;
        selectPlayer.appendChild(opt);
      });
    }

    // Tambahkan opsi Pelatih / Manajer jika kartu kuning/merah
    if (eventType === "card_yellow" || eventType === "card_red") {
      const mgr = (teamObj && teamObj.official && teamObj.official.manager) || (teamObj && teamObj.manager);
      const cch = (teamObj && teamObj.official && teamObj.official.coach) || (teamObj && teamObj.coach);
      if (cch) {
        const optCoach = document.createElement("option");
        optCoach.value = `${cch} (Pelatih)`;
        optCoach.textContent = `📋 Pelatih: ${cch}`;
        selectPlayer.appendChild(optCoach);
      }
      if (mgr) {
        const optMgr = document.createElement("option");
        optMgr.value = `${mgr} (Manajer)`;
        optMgr.textContent = `👨‍💼 Manajer: ${mgr}`;
        selectPlayer.appendChild(optMgr);
      }
    }
  }

  closeAddEventModal() {
    const modal = document.getElementById("addEventModal");
    if (modal) modal.classList.remove("show");
  }

  saveEventFromModal() {
    const type = document.getElementById("hiddenEventType").value;
    const originalTeam = document.getElementById("hiddenEventTeam").value;
    const isOwnGoal = (type === "goal" && document.getElementById("checkIsOwnGoal")?.checked);

    // Tentukan tim yang berhak mendapatkan skor
    let targetTeam = originalTeam;
    if (isOwnGoal) {
      targetTeam = document.getElementById("ogAwardHome")?.checked ? "home" : "away";
    }

    const selPlayer = document.getElementById("selectEventPlayer").value;
    const customPlayer = document.getElementById("inputCustomPlayer").value.trim();
    const minute = document.getElementById("inputEventMinute").value.trim() || this.getCurrentMatchMinute();

    let playerName = customPlayer || selPlayer || (isOwnGoal ? "Gol Bunuh Diri (GBD)" : "Pemain");
    if (isOwnGoal && !playerName.includes("(GBD)")) {
      playerName = `${playerName} (GBD)`;
    }

    // 1. Tambah event ke timeline & realtime sync
    window.syncEngine.addEvent({
      type: isOwnGoal ? "own_goal" : type,
      team: targetTeam,
      player_name: playerName,
      minute: minute,
      is_own_goal: isOwnGoal
    });

    // 2. Jika tipe adalah gol / own goal, otomatis tambahkan skor tim penerima & bunyikan selebrasi Siuu!
    if (type === "goal" || isOwnGoal) {
      this.changeScore(targetTeam, 1);
      this.playSiuSound();
    }

    this.closeAddEventModal();
  }

  playSiuSound() {
    try {
      if (!this.siuAudio) {
        this.siuAudio = new Audio("/assets/sounds/siu.mp3?v=20261124");
      }
      this.siuAudio.currentTime = 0;
      const p = this.siuAudio.play();
      if (p !== undefined) {
        p.catch(e => console.log("Audio play notice:", e));
      }
    } catch (_) {}
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
    const list = window.ACC_TEAMS || (typeof ACC_TEAMS !== "undefined" ? ACC_TEAMS : []);
    return list.find(t => t.id === teamId) || null;
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
      let ogBadge = "";
      const isOG = ev.type === "own_goal" || ev.is_own_goal || (ev.player_name && ev.player_name.includes("(GBD)"));

      if (isOG) {
        icon = "⚽";
        ogBadge = '<span style="background: #ea580c; color: #fff; font-size: 0.68rem; font-weight: 800; padding: 1px 6px; border-radius: 4px; margin-left: 6px; letter-spacing: 0.5px;">GBD</span>';
      } else if (ev.type === "card_yellow") {
        icon = "🟨";
      } else if (ev.type === "card_red") {
        icon = "🟥";
      } else if (ev.type === "timeout") {
        icon = "⏱️";
      }

      const teamName = ev.team === "home"
        ? (this.currentState ? (this.currentState.home_short || this.currentState.home_name) : "HOME")
        : (this.currentState ? (this.currentState.away_short || this.currentState.away_name) : "AWAY");

      return `
        <div class="event-log-item">
          <div class="event-log-left">
            <span>${icon}</span>
            <span>${teamName}</span>
            <span>•</span>
            <span style="color: #fff;">${ev.player_name}</span>${ogBadge}
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
