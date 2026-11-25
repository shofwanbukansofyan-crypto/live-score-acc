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
    this.siuAudio = null;
    this.audioUnlocked = false;

    this.init();
  }

  init() {
    // 1. Inisialisasi Audio Selebrasi Ronaldo Siu
    this.initAudio();

    // 2. Subscribe ke Realtime Sync Engine
    if (window.syncEngine) {
      window.syncEngine.subscribe((state, events) => {
        this.handleStateUpdate(state);
        this.handleEventsUpdate(events);
      });
    }

    // 3. Minta Screen Wake Lock agar layar TV tidak mati/sleep
    this.requestWakeLock();

    // 4. Setup event listeners
    this.setupListeners();
  }

  initAudio() {
    try {
      this.siuAudio = new Audio("/assets/sounds/siu.mp3?v=20261124");
      this.siuAudio.preload = "auto";

      // Buka kunci AudioContext / Autoplay saat ada interaksi pertama di layar TV
      const unlock = () => {
        if (this.audioUnlocked) return;
        this.audioUnlocked = true;
        if (this.siuAudio) {
          const playPromise = this.siuAudio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              this.siuAudio.pause();
              this.siuAudio.currentTime = 0;
            }).catch(() => { });
          }
        }
        document.removeEventListener("click", unlock);
        document.removeEventListener("keydown", unlock);
        document.removeEventListener("touchstart", unlock);
      };

      document.addEventListener("click", unlock);
      document.addEventListener("keydown", unlock);
      document.addEventListener("touchstart", unlock);
    } catch (e) {
      console.warn("Audio initialization notice:", e);
    }
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

    // Resolusi Logo Tim Resmi (Gunakan logo tim asli dari ACC_TEAMS jika logo masih default)
    let homeLogo = state.home_logo;
    let homeColor = state.home_color;
    if (typeof ACC_TEAMS !== "undefined" && Array.isArray(ACC_TEAMS)) {
      const ht = ACC_TEAMS.find(x => x.id === state.home_id || x.name === state.home_name);
      if (ht) {
        if (!homeLogo || homeLogo === "/assets/logo.png" || homeLogo.includes("acc_logo")) {
          homeLogo = ht.logo;
        }
        if (!homeColor) homeColor = ht.badgeColor;
      }
    }

    let awayLogo = state.away_logo;
    let awayColor = state.away_color;
    if (typeof ACC_TEAMS !== "undefined" && Array.isArray(ACC_TEAMS)) {
      const at = ACC_TEAMS.find(x => x.id === state.away_id || x.name === state.away_name);
      if (at) {
        if (!awayLogo || awayLogo === "/assets/logo.png" || awayLogo.includes("acc_logo")) {
          awayLogo = at.logo;
        }
        if (!awayColor) awayColor = at.badgeColor;
      }
    }

    // Render Data Tim Home
    this.updateText("homeTeamName", state.home_name || "TIM HOME");
    this.updateText("homeScoreDigits", state.home_score ?? 0);
    this.updateTeamLogo("homeTeamLogo", "homeTeamFallback", homeLogo, state.home_short || state.home_name, homeColor);
    this.renderFouls("homeFoulsContainer", state.home_fouls || 0);
    this.updateTimeoutTag("homeTimeoutTag", state.home_timeout);

    // Set warna border tim home jika ada
    const homeCard = document.getElementById("homeCard");
    if (homeCard && homeColor) {
      homeCard.style.setProperty("--team-color", homeColor);
    }

    // Render Data Tim Away
    this.updateText("awayTeamName", state.away_name || "TIM AWAY");
    this.updateText("awayScoreDigits", state.away_score ?? 0);
    this.updateTeamLogo("awayTeamLogo", "awayTeamFallback", awayLogo, state.away_short || state.away_name, awayColor);
    this.renderFouls("awayFoulsContainer", state.away_fouls || 0);
    this.updateTimeoutTag("awayTimeoutTag", state.away_timeout);

    const awayCard = document.getElementById("awayCard");
    if (awayCard && awayColor) {
      awayCard.style.setProperty("--team-color", awayColor);
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

    const renderEventChips = (list, alignRight = false) => {
      const eventItems = list || [];
      const MAX_ROWS = 5; // Maksimal 5 baris per kolom sesuai permintaan user

      if (eventItems.length === 0) {
        return "";
      }

      // Bagi daftar kejadian menjadi sub-kolom (maksimal 5 kejadian per sub-kolom)
      const subcols = [];
      for (let i = 0; i < eventItems.length; i += MAX_ROWS) {
        subcols.push(eventItems.slice(i, i + MAX_ROWS));
      }

      // Bangun elemen per sub-kolom
      const subcolsHtml = subcols.map((chunk) => {
        const rows = chunk.map((ev) => {
          let icon = "⚽";
          let chipClass = "goal";
          let defaultLabel = "Gol";
          let ogTag = "";

          const isOG = ev.type === "own_goal" || ev.is_own_goal || (ev.player_name && ev.player_name.includes("(GBD)"));
          if (isOG) {
            chipClass = "goal own-goal";
            defaultLabel = "Gol Bunuh Diri";
            ogTag = '<span class="chip-og-tag">GBD</span>';
          } else if (ev.type === "card_yellow") {
            icon = "🟨";
            chipClass = "card-yellow";
            defaultLabel = "Kartu Kuning";
          } else if (ev.type === "card_red") {
            icon = "🟥";
            chipClass = "card-red";
            defaultLabel = "Kartu Merah";
          }

          const rawPlayer = ev.player_name || defaultLabel;
          const cleanName = isOG
            ? (rawPlayer.replace(/\s*\(GBD\)/gi, '').trim() || "Gol Bunuh Diri")
            : rawPlayer;
          const displayName = this.formatPersonName(cleanName);

          const minuteText = ev.minute ? `<span class="chip-minute">${ev.minute}'</span>` : "";

          return `
            <div class="momentum-row ${alignRight ? 'align-right' : 'align-left'}">
              <div class="event-chip ${chipClass}">
                <span class="chip-icon">${icon}</span>
                ${minuteText}
                <span class="chip-player">${displayName}</span>
                ${ogTag}
              </div>
            </div>
          `;
        });

        return `
          <div class="momentum-subcol ${alignRight ? 'align-right' : 'align-left'}">
            ${rows.join("")}
          </div>
        `;
      });

      return subcolsHtml.join("");
    };

    homeContainer.innerHTML = renderEventChips(homeEvents, true);
    awayContainer.innerHTML = renderEventChips(awayEvents, false);
  }

  formatPersonName(name) {
    if (!name || name.trim() === "-") return name || "";
    return name.trim().replace(/\s+/g, " ").split(" ").map(tok => {
      if (!tok) return tok;
      if (/^(s\.pd\.?i?\.?|m\.pd\.?|s\.or\.?|s\.h\.?|s\.ag\.?|s\.sos\.?|s\.tr\.pi|a\.md\.?|gr\.?|fc|\(c\))$/i.test(tok)) {
        return tok;
      }
      return tok.replace(/(^|[-'‘])([a-zA-Z])([a-zA-Z]*)/g, (_, p, first, rest) => p + first.toUpperCase() + rest.toLowerCase());
    }).join(" ");
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

  updateTeamLogo(imgId, fallbackId, logoUrl, teamName, badgeColor) {
    const imgEl = document.getElementById(imgId);
    const fallEl = document.getElementById(fallbackId);
    if (!imgEl || !fallEl) return;

    const container = imgEl.parentElement;
    if (container && badgeColor) {
      container.style.borderColor = badgeColor + '55';
    }

    if (logoUrl && logoUrl.trim() !== "") {
      imgEl.src = logoUrl;
      imgEl.style.display = "block";
      fallEl.style.display = "none";
      imgEl.onerror = () => {
        imgEl.style.display = "none";
        fallEl.style.display = "flex";
        const cleanName = (teamName || "TBD").replace(/^(SMP|SDIT|SDN|SD|UPTD|UPT SPF)\s*/i, '').trim();
        fallEl.textContent = cleanName.substring(0, 4).toUpperCase();
        if (container && badgeColor) {
          container.style.background = `radial-gradient(circle, ${badgeColor}55 0%, rgba(0, 0, 0, 0.7) 100%)`;
        }
      };
    } else {
      imgEl.style.display = "none";
      fallEl.style.display = "flex";
      const cleanName = (teamName || "TBD").replace(/^(SMP|SDIT|SDN|SD|UPTD|UPT SPF)\s*/i, '').trim();
      fallEl.textContent = cleanName.substring(0, 4).toUpperCase();
      if (container && badgeColor) {
        container.style.background = `radial-gradient(circle, ${badgeColor}55 0%, rgba(0, 0, 0, 0.7) 100%)`;
      }
    }
  }

  triggerGoalCelebration(teamName, newScore) {
    const banner = document.getElementById("goalCelebrationBanner");
    const nameEl = document.getElementById("goalTeamName");
    if (!banner || !nameEl) return;

    nameEl.textContent = `${teamName} (Skor: ${newScore})`;
    banner.classList.add("show");

    // Mainkan sound effect SIUUU Cristiano Ronaldo!
    this.playSiuSound();

    setTimeout(() => {
      banner.classList.remove("show");
    }, 4500);
  }

  playSiuSound() {
    try {
      if (!this.siuAudio) {
        this.siuAudio = new Audio("/assets/sounds/siu.mp3?v=20261124");
      }
      this.siuAudio.currentTime = 0;
      const playPromise = this.siuAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Autoplay blocked or audio playback error:", err);
          this.playWhistleFallback();
        });
      }
    } catch (_) {
      this.playWhistleFallback();
    }
  }

  playWhistleFallback() {
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
