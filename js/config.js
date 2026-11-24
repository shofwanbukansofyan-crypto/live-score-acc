// ==============================================================================
// CONFIG.JS - Konfigurasi Supabase & Live Score ACC Futsal Cup 2026
// ==============================================================================

const CONFIG = {
  // Masukkan kredensial Supabase baru Anda di sini atau lewat form Pengaturan di UI
  SUPABASE_URL: localStorage.getItem("acc_supabase_url") || "",
  SUPABASE_ANON_KEY: localStorage.getItem("acc_supabase_key") || "",

  // PIN default untuk akses Operator Console (bisa diubah sesuai keinginan)
  OPERATOR_PIN: localStorage.getItem("acc_operator_pin") || "ACCdisplay2026",

  // Nama turnamen & default settings
  TOURNAMENT_NAME: "AL-FAYYADH CHAMPIONS CUP 2026",
  SUBTITLE: "Turnamen Futsal Antar-Sekolah & Pesantren se-Sulawesi Selatan",
  VENUE: "GOR Futsal Ma'had Tahfizhul Qur'an Al Fayyadh",

  // Durasi babak (dalam detik): default 15 menit (900 detik) atau 10 menit (600 detik)
  DEFAULT_HALF_DURATION_SMP: 900, // 15 menit
  DEFAULT_HALF_DURATION_SD: 600,  // 10 menit
  TIMEOUT_DURATION: 60,           // 1 menit (60 detik)

  // Batas foul sebelum second penalty spot (aturan futsal resmi)
  MAX_FOULS_LIMIT: 5,

  // Channel name untuk Realtime & BroadcastChannel
  REALTIME_CHANNEL: "acc_live_scoreboard",
  LOCAL_BROADCAST_CHANNEL: "acc_futsal_local_sync"
};

// Fungsi helper untuk menyimpan kredensial Supabase dari UI
function saveSupabaseConfig(url, key) {
  if (url) localStorage.setItem("acc_supabase_url", url.trim());
  if (key) localStorage.setItem("acc_supabase_key", key.trim());
  CONFIG.SUPABASE_URL = localStorage.getItem("acc_supabase_url") || "";
  CONFIG.SUPABASE_ANON_KEY = localStorage.getItem("acc_supabase_key") || "";
}

function saveOperatorPin(newPin) {
  if (newPin && newPin.trim()) {
    localStorage.setItem("acc_operator_pin", newPin.trim());
    CONFIG.OPERATOR_PIN = newPin.trim();
  }
}

if (typeof module !== "undefined") {
  module.exports = CONFIG;
}
