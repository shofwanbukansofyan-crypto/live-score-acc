// ==============================================================================
// APP-DISPLAY.JS - ACC FUTSAL CUP 2026 SCOREBOARD TV DISPLAY LOGIC
// ==============================================================================

class ScoreboardDisplay {
  constructor() {
    this.currentState = null;
    this.currentEvents = [];
    this.timerAnimationId = null;
    this.timeoutAnimationId = null;
    this.wakeLock = null;

    this.init();
  }

  init() {
    // 1. Subscribe ke Realtime Sync Engine
    if (window.syncEngine) {
      window.syncEngine.subscribe((state, events) => {
        this.handleStateUpdate(state);
        this.handleEventsUpdate(events);
      });
    }

    // 2. Minta Screen Wake Lock agar layar TV tidak mati/sleep
    this.requestWakeLock();

    // 3. Setup event listeners
    this.setupListeners();
  }

  setupListeners() {
    // Keyboard shortcut F atau F11 untuk layar penuh
    document.addEventListener("keydown", (e) => {
      if (e.key === "f" || e.key === "F") {
        this.toggleFullscreen();
      }
    });

    // Klik dua kali (double click) di mana saja pada layar TV untuk fullscreen
    document.addEventListener("dblclick", () => {
      this.toggleFullscreen();
    });

    // Re-request wake lock jika tab kembali terlihat
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.requestWakeLock();
      }
    });
  }

  async requestWakeLock() {
    if ("wakeLock" in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request("screen");
        console.log("Screen Wake Lock aktif: Layar TV tidak akan sleep.");
      } catch (err) {
        console.warn("Wake Lock notice:", err);
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Gagal masuk fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  handleStateUpdate(state) {
    if (!state) return;
    const prevState = this.currentState;
    this.currentState = state;

    // Deteksi Gol Baru untuk Selebrasi Banner
    if (prevState) {
      if (state.home_score > prevState.home_score) {
        this.triggerGoalCelebration(state.home_name, state.home_score);
      } else if (state.away_score > prevState.away_score) {
        this.triggerGoalCelebration(state.away_name, state.away_score);
      }
    }

    // Render Data Fase Turnamen
    this.updateText("stagePillText", state.stage || "FASE GRUP");

    // Render Data Tim Home
    this.updateText("homeTeamName", state.home_name || "TIM HOME");
    this.updateText("homeScoreDigits", state.home_score ?? 0);
    this.updateTeamLogo("homeTeamLogo", "homeTeamFallback", state.home_logo, state.home_short || state.home_name);
    this.renderFouls("homeFoulsContainer", state.home_fouls || 0);
    this.updateTimeoutTag("homeTimeoutTag", state.home_timeout);

    // Set warna border tim home jika ada
    const homeCard = document.getElementById("homeCard");
    if (homeCard && state.home_color) {
      homeCard.style.setProperty("--team-color", state.home_color);
    }

    // Render Data Tim Away
    this.updateText("awayTeamName", state.away_name || "TIM AWAY");
    this.updateText("awayScoreDigits", state.away_score ?? 0);
    this.updateTeamLogo("awayTeamLogo", "awayTeamFallback", state.away_logo, state.away_short || state.away_name);
    this.renderFouls("awayFoulsContainer", state.away_fouls || 0);
    this.updateTimeoutTag("awayTimeoutTag", state.away_timeout);

    const awayCard = document.getElementById("awayCard");
    if (awayCard && state.away_color) {
      awayCard.style.setProperty("--team-color", state.away_color);
    }

    // Render Adu Penalti jika ada
    const penRow = document.getElementById("penaltyShootoutRow");
    if (penRow) {
      if (state.period === "penalties" || (state.home_penalties !== null && state.away_penalties !== null && state.home_penalties !== undefined && state.away_penalties !== undefined)) {
        penRow.style.display = "flex";
        this.updateText("homePenScore", state.home_penalties ?? 0);
        this.updateText("awayPenScore", state.away_penalties ?? 0);
      } else {
        penRow.style.display = "none";
      }
    }

    // Render Timeout Countdown Overlay jika aktif
    this.handleTimeoutState(state);

    // Mulai / Sinkronkan Loop Timer Pertandingan
    this.syncTimerLoop();
  }

  handleEventsUpdate(events) {
    this.currentEvents = events || [];
    const homeContainer = document.getElementById("momentumHomeEvents");
    const awayContainer = document.getElementById("momentumAwayEvents");
    if (!homeContainer || !awayContainer) return;

    // Filter kejadian berdasarkan tim
    const homeEvents = this.currentEvents.filter(ev => ev.team === "home");
    const awayEvents = this.currentEvents.filter(ev => ev.team === "away");

    const renderEventChips = (list) => {
      if (!list || list.length === 0) {
        return '<span class="momentum-empty">-</span>';
      }

      return list.map(ev => {
        let icon = "⚽";
        let chipClass = "goal";
        let defaultLabel = "Gol";

        if (ev.type === "card_yellow") {
          icon = "🟨";
          chipClass = "card-yellow";
          defaultLabel = "Kartu Kuning";
        } else if (ev.type === "card_red") {
          icon = "🟥";
          chipClass = "card-red";
          defaultLabel = "Kartu Merah";
        }

        const playerName = ev.player_name || defaultLabel;
        const minuteText = ev.minute ? `<span class="chip-minute">${ev.minute}'</span>` : "";

        return `
          <div class="event-chip ${chipClass}">
            <span>${icon}</span>
            ${minuteText}
            <span class="chip-player">${playerName}</span>
          </div>
        `;
      }).join("");
    };

    homeContainer.innerHTML = renderEventChips(homeEvents);
    awayContainer.innerHTML = renderEventChips(awayEvents);
  }

  syncTimerLoop() {
    if (this.timerAnimationId) {
      cancelAnimationFrame(this.timerAnimationId);
      this.timerAnimationId = null;
    }

    const clockEl = document.getElementById("tvDigitalClock");
    if (!clockEl || !this.currentState) return;

    const renderTick = () => {
      const state = this.currentState;
      if (!state) return;

      let totalSec = state.timer_seconds || 0;

      if (state.is_running && state.timer_started_at) {
        clockEl.classList.add("running");
        const elapsedSinceStart = (Date.now() - new Date(state.timer_started_at).getTime()) / 1000;
        totalSec += Math.max(0, Math.floor(elapsedSinceStart));
      } else {
        clockEl.classList.remove("running");
      }

      // Format Menit:Detik (MM:SS)
      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;
      const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

      clockEl.textContent = formatted;

      if (state.is_running) {
        this.timerAnimationId = requestAnimationFrame(renderTick);
      }
    };

    renderTick();
  }

  handleTimeoutState(state) {
    const overlay = document.getElementById("timeoutActiveOverlay");
    const countClock = document.getElementById("timeoutCountdownClock");
    if (!overlay || !countClock) return;

    if (this.timeoutAnimationId) {
      cancelAnimationFrame(this.timeoutAnimationId);
      this.timeoutAnimationId = null;
    }

    if (state.timeout_running && state.timeout_started_at) {
      overlay.classList.add("active");

      const updateTimeoutTick = () => {
        const elapsed = (Date.now() - new Date(state.timeout_started_at).getTime()) / 1000;
        const remain = Math.max(0, Math.ceil((state.timeout_seconds || 60) - elapsed));
        countClock.textContent = `00:${String(remain).padStart(2, "0")}`;

        if (remain > 0 && state.timeout_running) {
          this.timeoutAnimationId = requestAnimationFrame(updateTimeoutTick);
        } else {
          overlay.classList.remove("active");
        }
      };

      updateTimeoutTick();
    } else {
      overlay.classList.remove("active");
    }
  }

  renderFouls(containerId, count) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const limit = (typeof CONFIG !== "undefined" && CONFIG.MAX_FOULS_LIMIT) ? CONFIG.MAX_FOULS_LIMIT : 5;
    let html = '';
    for (let i = 1; i <= limit; i++) {
      let className = 'foul-dot';
      if (i <= count) {
        className += i >= limit ? ' critical' : ' active';
      }
      html += `<div class="${className}" title="Foul ${i}"></div>`;
    }
    el.innerHTML = html;
  }

  updateTimeoutTag(tagId, isUsed) {
    const el = document.getElementById(tagId);
    if (!el) return;
    if (isUsed) {
      el.classList.add("used");
      el.textContent = "TO: HABIS";
    } else {
      el.classList.remove("used");
      el.textContent = "TO: ADA";
    }
  }

  updateTeamLogo(imgId, fallbackId, logoUrl, teamName) {
    const imgEl = document.getElementById(imgId);
    const fallEl = document.getElementById(fallbackId);
    if (!imgEl || !fallEl) return;

    if (logoUrl && logoUrl.trim() !== "") {
      imgEl.src = logoUrl;
      imgEl.style.display = "block";
      fallEl.style.display = "none";
      imgEl.onerror = () => {
        imgEl.style.display = "none";
        fallEl.style.display = "block";
        fallEl.textContent = (teamName || "TBD").substring(0, 3).toUpperCase();
      };
    } else {
      imgEl.style.display = "none";
      fallEl.style.display = "block";
      fallEl.textContent = (teamName || "TBD").substring(0, 3).toUpperCase();
    }
  }

  triggerGoalCelebration(teamName, newScore) {
    const banner = document.getElementById("goalCelebrationBanner");
    const nameEl = document.getElementById("goalTeamName");
    if (!banner || !nameEl) return;

    nameEl.textContent = `${teamName} (Skor: ${newScore})`;
    banner.classList.add("show");

    // Mainkan audio peluit / suara selebrasi
    this.playWhistleSound();

    setTimeout(() => {
      banner.classList.remove("show");
    }, 4500);
  }

  playWhistleSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (_) { }
  }

  updateText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
}

// Inisialisasi Scoreboard TV saat dokumen siap
document.addEventListener("DOMContentLoaded", () => {
  window.scoreboardDisplay = new ScoreboardDisplay();
});
