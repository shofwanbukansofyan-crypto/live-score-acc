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
    this.pendingEventUpdates = {};
    this.pendingEventDeletes = new Set();
    this.idAliases = {};

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
    let url = typeof cleanSupabaseUrl === "function"
      ? cleanSupabaseUrl(CONFIG.SUPABASE_URL || localStorage.getItem("acc_supabase_url"))
      : (CONFIG.SUPABASE_URL || "").trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    let key = (CONFIG.SUPABASE_ANON_KEY || localStorage.getItem("acc_supabase_key") || "").trim();

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
        try { this.cachedState = JSON.parse(saved); } catch (_) { }
      }
      const savedEv = localStorage.getItem("acc_live_events");
      if (savedEv) {
        try { this.cachedEvents = JSON.parse(savedEv); } catch (_) { }
      }
      this.notifyListeners(this.cachedState, this.cachedEvents);
    }
  }

  setupRealtimeSubscription() {
    if (!this.supabase) return;

    const channel = this.supabase.channel(CONFIG.REALTIME_CHANNEL, {
      config: { broadcast: { self: false } }
    });
    this.realtimeChannel = channel;

    // 1. Supabase WebSocket Broadcast: Komunikasi instan antar-perangkat (HP Operator <-> TV Laptop)
    channel.on("broadcast", { event: "STATE_UPDATE" }, ({ payload }) => {
      if (payload) {
        this.cachedState = Object.assign({}, this.cachedState, payload);
        this.saveLocalBackup(this.cachedState, null);
        this.notifyListeners(this.cachedState, this.cachedEvents);
      }
    });

    channel.on("broadcast", { event: "EVENTS_UPDATE" }, ({ payload }) => {
      if (payload && Array.isArray(payload)) {
        this.cachedEvents = payload;
        this.saveLocalBackup(null, this.cachedEvents);
        this.notifyListeners(this.cachedState, this.cachedEvents);
      }
    });

    channel.on("broadcast", { event: "SYNC_REQUEST" }, () => {
      if (this.cachedState && this.realtimeChannel) {
        try {
          this.realtimeChannel.send({
            type: "broadcast",
            event: "STATE_UPDATE",
            payload: this.cachedState
          });
          this.realtimeChannel.send({
            type: "broadcast",
            event: "EVENTS_UPDATE",
            payload: this.cachedEvents
          });
        } catch (_) { }
      }
    });

    // 2. Dengar perubahan tabel live_match (PostgreSQL Realtime fallback)
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
      if (this.isConnected) {
        // Minta state terkini dari operator yang aktif jika ini layar TV
        try {
          channel.send({
            type: "broadcast",
            event: "SYNC_REQUEST",
            payload: {}
          });
        } catch (_) { }
      }
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
      } catch (_) { }
    }

    // 2b. Broadcast ke channel Supabase Realtime (Lintas-Perangkat: HP Operator -> Laptop TV)
    if (this.realtimeChannel && this.isConnected) {
      try {
        this.realtimeChannel.send({
          type: "broadcast",
          event: "STATE_UPDATE",
          payload: this.cachedState
        });
      } catch (_) { }
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

  resolveEventId(eventId) {
    return (eventId && this.idAliases[eventId]) ? this.idAliases[eventId] : eventId;
  }

  sanitizeEventPayload(eventData) {
    const allowed = ["match_id", "type", "team", "player_name", "minute", "note"];
    const clean = {};
    allowed.forEach((key) => {
      if (eventData[key] !== undefined) {
        clean[key] = eventData[key];
      }
    });
    return clean;
  }

  broadcastEventsUpdate() {
    this.saveLocalBackup(null, this.cachedEvents);

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: "EVENTS_UPDATE",
          payload: this.cachedEvents
        });
      } catch (_) { }
    }

    if (this.realtimeChannel && this.isConnected) {
      try {
        this.realtimeChannel.send({
          type: "broadcast",
          event: "EVENTS_UPDATE",
          payload: this.cachedEvents
        });
      } catch (_) { }
    }

    this.notifyListeners(this.cachedState, this.cachedEvents);
  }

  async addEvent(eventData) {
    // 1. Siapkan payload yang valid untuk kolom tabel match_events Supabase
    const dbPayload = this.sanitizeEventPayload(Object.assign({
      match_id: "current_match"
    }, eventData));

    // 2. Buat objek sementara untuk Optimistic UI lokal
    const tempId = "ev_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
    const newEvent = Object.assign({
      id: tempId,
      created_at: new Date().toISOString()
    }, dbPayload);

    // Update lokal seketika
    this.cachedEvents.push(newEvent);
    this.broadcastEventsUpdate();

    // 3. Kirim dbPayload ke Supabase
    if (this.supabase && this.isUsingSupabase) {
      try {
        const { data, error } = await this.supabase
          .from("match_events")
          .insert([dbPayload])
          .select();

        if (error) {
          console.error("Supabase insert event error:", error.message, error.details);
          return null;
        }

        if (data && data[0]) {
          const realId = data[0].id;
          this.idAliases[tempId] = realId;

          // Jika user sempat menghapus event ini saat insert masih berjalan
          if (this.pendingEventDeletes.has(tempId)) {
            this.pendingEventDeletes.delete(tempId);
            delete this.pendingEventUpdates[tempId];
            await this.supabase.from("match_events").delete().eq("id", realId);
            return null;
          }

          // Jika user sempat mengedit event ini sebelum UUID asli diterima
          const queuedUpdates = this.pendingEventUpdates[tempId];
          if (queuedUpdates) {
            delete this.pendingEventUpdates[tempId];
            const cleanQueued = this.sanitizeEventPayload(queuedUpdates);
            const { data: updatedData } = await this.supabase
              .from("match_events")
              .update(cleanQueued)
              .eq("id", realId)
              .select();
            const merged = (updatedData && updatedData[0]) ? updatedData[0] : Object.assign({}, data[0], cleanQueued);
            const idx = this.cachedEvents.findIndex(e => e.id === tempId);
            if (idx !== -1) {
              this.cachedEvents[idx] = merged;
              this.broadcastEventsUpdate();
            }
            return merged;
          }

          // Ganti event sementara dengan baris asli (ber-UUID valid) dari Supabase
          const idx = this.cachedEvents.findIndex(e => e.id === tempId);
          if (idx !== -1) {
            this.cachedEvents[idx] = data[0];
            this.broadcastEventsUpdate();
          }
          return data[0];
        }
      } catch (err) {
        console.error("Supabase insert event exception:", err);
      }
    }
    return newEvent;
  }

  async updateEvent(eventId, updates) {
    eventId = this.resolveEventId(eventId);
    if (!eventId) return;
    const cleanUpdates = this.sanitizeEventPayload(updates);
    const idx = this.cachedEvents.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      this.cachedEvents[idx] = Object.assign({}, this.cachedEvents[idx], cleanUpdates);
      this.broadcastEventsUpdate();
    }

    if (this.supabase && this.isUsingSupabase) {
      if (String(eventId).startsWith("ev_")) {
        // Masih menunggu UUID asli dari insert: antrekan update
        this.pendingEventUpdates[eventId] = Object.assign(
          this.pendingEventUpdates[eventId] || {},
          cleanUpdates
        );
        return;
      }
      try {
        const { error } = await this.supabase
          .from("match_events")
          .update(cleanUpdates)
          .eq("id", eventId);

        if (error) {
          console.error("Supabase update event error:", error.message, error.details);
        }
      } catch (err) {
        console.error("Supabase update event exception:", err);
      }
    }
  }

  async deleteEvent(eventId) {
    eventId = this.resolveEventId(eventId);
    if (!eventId) return;
    this.cachedEvents = this.cachedEvents.filter(e => e.id !== eventId);
    this.broadcastEventsUpdate();

    if (this.supabase && this.isUsingSupabase) {
      if (String(eventId).startsWith("ev_")) {
        this.pendingEventDeletes.add(eventId);
        return;
      }
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
      } catch (_) { }
    }

    if (this.realtimeChannel && this.isConnected) {
      try {
        this.realtimeChannel.send({
          type: "broadcast",
          event: "EVENTS_UPDATE",
          payload: []
        });
      } catch (_) { }
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
    } catch (_) { }
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
