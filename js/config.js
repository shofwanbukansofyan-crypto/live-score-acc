// ==============================================================================
// CONFIG.JS - Konfigurasi Supabase & Live Score ACC Futsal Cup 2026
// ==============================================================================

function cleanSupabaseUrl(rawUrl) {
  if (!rawUrl) return "";
  let url = rawUrl.trim();
  url = url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

const defaultUrl = "https://lomckvgwqlfuxtucfwtn.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvbWNrdmd3cWxmdXh0dWNmd3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1MDEzOTMsImV4cCI6MjExMTA3NzM5M30.gjEIGKm8KR9uCK4m8xDOuJq7CHcVeSSTVKtlO_sRaWo";

let rawSavedUrl = null;
try { rawSavedUrl = localStorage.getItem("acc_supabase_url"); } catch (_) {}
let activeUrl = cleanSupabaseUrl(rawSavedUrl) || defaultUrl;
if (rawSavedUrl && rawSavedUrl !== activeUrl) {
  try { localStorage.setItem("acc_supabase_url", activeUrl); } catch (_) {}
}

const CONFIG = {
  // Masukkan kredensial Supabase baru Anda di sini atau lewat form Pengaturan di UI
  SUPABASE_URL: activeUrl,
  SUPABASE_ANON_KEY: (function () {
    let k = null;
    try { k = localStorage.getItem("acc_supabase_key"); } catch (_) {}
    return (k && k.trim()) ? k.trim() : defaultKey;
  })(),

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
  if (url) {
    let clean = url.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
    localStorage.setItem("acc_supabase_url", clean);
    CONFIG.SUPABASE_URL = clean;
  }
  if (key) {
    localStorage.setItem("acc_supabase_key", key.trim());
    CONFIG.SUPABASE_ANON_KEY = key.trim();
  }
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
