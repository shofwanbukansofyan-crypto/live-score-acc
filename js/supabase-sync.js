// ==============================================================================
// SUPABASE-SYNC.JS - Real-Time Synchronization Engine
// ==============================================================================
// Mengelola koneksi Supabase Realtime + BroadcastChannel + Fallback Polling

class SyncEngine {
  constructor() {
    this.supabase = null;
    this.broadcastChannel = null;
    this.listeners = [];
    this.isConnected = false;
    this.isUsingSupabase = false;
    this.pollInterval = null;
    this.cachedState = this.getDefaultState();
    this.cachedEvents = [];

    this.initBroadcastChannel();
    this.initSupabase();
  }

  getDefaultState() {
    return {
      id: "current_match",
      category: "SMP",
      stage: "FASE GRUP - GRUP A",
      pitch: "Lapangan Utama",
      home_id: "T01",
      home_name: "SMP 1 Mandai",
      home_short: "SMP1M",
      home_logo: "/assets/logo.png",
      home_color: "#10b981",
      home_score: 0,
      home_penalties: null,
      home_fouls: 0,
      home_timeout: false,
      away_id: "T02",
      away_name: "SMP 2 Mandai",
      away_short: "SMP2M",
      away_logo: "/assets/logo.png",
      away_color: "#3b82f6",
      away_score: 0,
      away_penalties: null,
      away_fouls: 0,
      away_timeout: false,
      period: "upcoming",
      period_label: "BELUM DIMULAI",
      timer_seconds: 0,
      target_duration: 900,
      is_running: false,
      timer_started_at: null,
      timeout_running: false,
      timeout_seconds: 60,
      timeout_started_at: null,
      updated_at: new Date().toISOString()
    };
  }

  initBroadcastChannel() {
    if (typeof BroadcastChannel !== "undefined") {
      try {
        this.broadcastChannel = new BroadcastChannel(CONFIG.LOCAL_BROADCAST_CHANNEL);
        this.broadcastChannel.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === "STATE_UPDATE") {
            this.cachedState = Object.assign({}, this.cachedState, payload);
            this.notifyListeners(this.cachedState, this.cachedEvents);
          } else if (type === "EVENTS_UPDATE") {
            this.cachedEvents = payload;
            this.notifyListeners(this.cachedState, this.cachedEvents);
          }
        };
      } catch (e) {
        console.warn("BroadcastChannel error:", e);
      }
    }
  }

  initSupabase() {
    const url = CONFIG.SUPABASE_URL || localStorage.getItem("acc_supabase_url");
    const key = CONFIG.SUPABASE_ANON_KEY || localStorage.getItem("acc_supabase_key");

    if (url && key && typeof window.supabase !== "undefined") {
      try {
        this.supabase = window.supabase.createClient(url, key, {
          realtime: {
            params: {
              eventsPerSecond: 10
            }
          }
        });
        this.isUsingSupabase = true;
        this.setupRealtimeSubscription();
        this.fetchInitialData();
        this.startPollingFallback();
      } catch (err) {
        console.error("Gagal inisialisasi Supabase client:", err);
        this.isUsingSupabase = false;
      }
    } else {
      this.isUsingSupabase = false;
      // Muat dari localStorage jika ada
      const saved = localStorage.getItem("acc_live_state");
      if (saved) {
        try { this.cachedState = JSON.parse(saved); } catch (_) {}
      }
      const savedEv = localStorage.getItem("acc_live_events");
      if (savedEv) {
        try { this.cachedEvents = JSON.parse(savedEv); } catch (_) {}
      }
      this.notifyListeners(this.cachedState, this.cachedEvents);
    }
  }

  setupRealtimeSubscription() {
    if (!this.supabase) return;

    const channel = this.supabase.channel(CONFIG.REALTIME_CHANNEL);

    // Dengar perubahan tabel live_match
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "live_match" },
      (payload) => {
        if (payload.new && payload.new.id === "current_match") {
          this.cachedState = Object.assign({}, this.cachedState, payload.new);
          this.saveLocalBackup(this.cachedState, null);
          this.notifyListeners(this.cachedState, this.cachedEvents);
        }
      }
    );

    // Dengar perubahan tabel match_events
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "match_events" },
      () => {
        this.fetchEvents();
      }
    );

    channel.subscribe((status) => {
      this.isConnected = (status === "SUBSCRIBED");
      this.notifyConnection(this.isConnected, this.isUsingSupabase);
    });
  }

  async fetchInitialData() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from("live_match")
        .select("*")
        .eq("id", "current_match")
        .maybeSingle();

      if (!error && data) {
        this.cachedState = Object.assign({}, this.cachedState, data);
        this.saveLocalBackup(this.cachedState, null);
      } else if (!data) {
        // Baris belum ada, inisialisasi data default
        await this.supabase.from("live_match").insert(this.cachedState);
      }

      await this.fetchEvents();
      this.notifyListeners(this.cachedState, this.cachedEvents);
    } catch (err) {
      console.warn("Fetch initial data notice:", err);
    }
  }

  async fetchEvents() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from("match_events")
        .select("*")
        .eq("match_id", "current_match")
        .order("created_at", { ascending: true });

      if (!error && Array.isArray(data)) {
        this.cachedEvents = data;
        this.saveLocalBackup(null, this.cachedEvents);
        this.notifyListeners(this.cachedState, this.cachedEvents);
      }
    } catch (err) {
      console.warn("Fetch events error:", err);
    }
  }

  startPollingFallback() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    // Polling setiap 4 detik untuk memastikan tidak ada event yang terlewat
    this.pollInterval = setInterval(() => {
      if (this.supabase) {
        this.fetchInitialData();
      }
    }, 4000);
  }

  async updateState(updates) {
    // 1. Perbarui cache lokal seketika
    this.cachedState = Object.assign({}, this.cachedState, updates, {
      updated_at: new Date().toISOString()
    });
    this.saveLocalBackup(this.cachedState, null);

    // 2. Broadcast ke tab lokal (BroadcastChannel)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: "STATE_UPDATE",
          payload: this.cachedState
        });
      } catch (_) {}
    }

    // 3. Beri tahu listener internal
    this.notifyListeners(this.cachedState, this.cachedEvents);

    // 4. Kirim ke Supabase jika aktif
    if (this.supabase && this.isUsingSupabase) {
      try {
        const { error } = await this.supabase
          .from("live_match")
          .update(updates)
          .eq("id", "current_match");

        if (error) {
          console.error("Supabase update error:", error);
        }
      } catch (err) {
        console.error("Gagal mengirim update ke Supabase:", err);
      }
    }
  }

  async addEvent(eventData) {
    const newEvent = Object.assign({
      id: "ev_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      match_id: "current_match",
      created_at: new Date().toISOString()
    }, eventData);

    // Update lokal
    this.cachedEvents.push(newEvent);
    this.saveLocalBackup(null, this.cachedEvents);

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: "EVENTS_UPDATE",
          payload: this.cachedEvents
        });
      } catch (_) {}
    }

    this.notifyListeners(this.cachedState, this.cachedEvents);

    if (this.supabase && this.isUsingSupabase) {
      try {
        const { data, error } = await this.supabase
          .from("match_events")
          .insert(eventData)
          .select();

        if (!error && data && data[0]) {
          // Replace temp id with Supabase UUID
          const idx = this.cachedEvents.findIndex(e => e.id === newEvent.id);
          if (idx !== -1) {
            this.cachedEvents[idx] = data[0];
          }
        }
      } catch (err) {
        console.error("Supabase insert event error:", err);
      }
    }
  }

  async deleteEvent(eventId) {
    this.cachedEvents = this.cachedEvents.filter(e => e.id !== eventId);
    this.saveLocalBackup(null, this.cachedEvents);

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: "EVENTS_UPDATE",
          payload: this.cachedEvents
        });
      } catch (_) {}
    }

    this.notifyListeners(this.cachedState, this.cachedEvents);

    if (this.supabase && this.isUsingSupabase) {
      try {
        await this.supabase
          .from("match_events")
          .delete()
          .eq("id", eventId);
      } catch (err) {
        console.error("Supabase delete event error:", err);
      }
    }
  }

  async clearAllEvents() {
    this.cachedEvents = [];
    this.saveLocalBackup(null, []);

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: "EVENTS_UPDATE",
          payload: []
        });
      } catch (_) {}
    }

    this.notifyListeners(this.cachedState, this.cachedEvents);

    if (this.supabase && this.isUsingSupabase) {
      try {
        await this.supabase
          .from("match_events")
          .delete()
          .eq("match_id", "current_match");
      } catch (err) {
        console.error("Supabase clear events error:", err);
      }
    }
  }

  saveLocalBackup(state, events) {
    try {
      if (state) localStorage.setItem("acc_live_state", JSON.stringify(state));
      if (events) localStorage.setItem("acc_live_events", JSON.stringify(events));
    } catch (_) {}
  }

  subscribe(listener) {
    if (typeof listener === "function") {
      this.listeners.push(listener);
      // Panggil segera dengan state saat ini
      listener(this.cachedState, this.cachedEvents, {
        connected: this.isConnected,
        isUsingSupabase: this.isUsingSupabase
      });
    }
  }

  notifyListeners(state, events) {
    this.listeners.forEach(fn => {
      try {
        fn(state, events, {
          connected: this.isConnected,
          isUsingSupabase: this.isUsingSupabase
        });
      } catch (e) {
        console.error("Listener error:", e);
      }
    });
  }

  notifyConnection(connected, isUsingSupabase) {
    const el = document.getElementById("connectionStatusPill");
    if (el) {
      if (isUsingSupabase) {
        if (connected) {
          el.className = "status-indicator online";
          el.innerHTML = '<span class="status-dot"></span> <span>Supabase Realtime Terhubung</span>';
        } else {
          el.className = "status-indicator connecting";
          el.innerHTML = '<span class="status-dot"></span> <span>Menghubungkan ke Supabase...</span>';
        }
      } else {
        el.className = "status-indicator local";
        el.innerHTML = '<span class="status-dot"></span> <span>Mode Sinkronisasi Lokal (Tab Sync)</span>';
      }
    }
  }
}

// Instance singleton global
window.syncEngine = new SyncEngine();
