# 🏆 ACC FUTSAL CUP 2026 - DEDICATED LIVE SCORE & SCOREBOARD TV

Aplikasi web khusus **Live Scoreboard & Operator Console** Turnamen Futsal **Al-Fayyadh Champions Cup (ACC) 2026**. 
Dirancang khusus untuk ditampilkan di **Layar TV Besar / Layar Videotron Lapangan**, berjalan pada domain mandiri yang sangat ringan, terpisah dari website utama turnamen demi performa real-time ultra cepat, tanpa lag, dan stabil.

---

## 🌟 FITUR UTAMA & ARSITEKTUR DUA MODE

Aplikasi ini memiliki 2 mode akses yang tersinkronisasi secara real-time:

### 1. 🖥️ Mode Display (Layar TV Besar / Scoreboard Stadium) - URL: `/` atau `/display`
- **Desain Khusus TV Layar Besar**: Tipografi raksasa dengan kontras tinggi (Obsidian Black & Cyber Neon) yang sangat jelas terlihat dari kejauhan lapangan futsal.
- **Stopwatch Digital Raksasa**: Format `MM:SS` dengan sinkronisasi presisi tinggi via `requestAnimationFrame` (bebas lag dan drift).
- **Indikator Aturan Resmi Futsal**:
  - Akumulasi Pelanggaran (*Fouls*): Indikator visual 5 titik foul per babak dengan lampu merah berkedip saat mencapai foul ke-5 (peringatan *second penalty spot* 10 meter).
  - Indikator Time Out (TO).
  - Mode Adu Penalti (*Penalty Shootout*).
- **Banner Hitung Mundur Time Out**: Saat wasit meniup peluit timeout, layar TV otomatis menampilkan banner hitung mundur 60 detik.
- **Selebrasi Gol Otomatis**: Banner animasi *"GOOOOL!"* muncul seketika di layar TV disertai efek suara peluit wasit.
- **Ticker Berjalan Kejadian Laga**: Menampilkan pencetak gol, menit gol, kartu kuning, dan kartu merah.
- **Anti-Sleep / Screen Wake Lock**: Layar TV dijamin tidak akan mati atau masuk mode hemat daya (*sleep*) selama pertandingan berlangsung.
- **Tombol Layar Penuh (Fullscreen)**: Satu klik atau tekan tombol `F` / `F11`.

---

### 2. 🎛️ Mode Penginput (Operator Console / Meja Wasit) - URL: `/operator`
- **Akses Aman Terkunci PIN**: Dilindungi PIN panitia (Default: `ACCdisplay2026`).
- **52 Jadwal Pertandingan Siap Pakai**: Operator cukup memilih nomor pertandingan dari *dropdown* (misal: *Match 1: SMP 1 Mandai vs SMP 2 Mandai*), seluruh nama tim, kategori (SD/SMP), logo, dan babak akan langsung otomatis dimuat ke layar TV!
- **Kendali Skor Cepat**: Tombol raksasa `[+1 GOL]` dan `[-1]` dengan respons instan < 10ms.
- **Catat Gol & Kartu Berdasarkan Skuad**: Operator dapat memilih langsung nama pemain dari daftar susunan pemain (DSP) resmi 32 tim peserta, dengan deteksi otomatis menit pertandingan.
- **Kendali Stopwatch Presisi**: Tombol *Start/Pause*, *Reset 00:00*, `+1m`, `-1m`, dan `+10s`.
- **Pengatur Babak Sesuai Regulasi**:
  - `Belum Mulai`
  - `Babak 1`
  - `Istirahat (Halftime)`: Otomatis me-reset foul untuk babak berikutnya sesuai aturan futsal.
  - `Babak 2`
  - `Extra Time`
  - `Adu Penalti`
  - `Selesai Pertandingan (FT)`
- **Kendali Time Out 60 Detik**: Sekali klik untuk mengaktifkan hitung mundur timeout di layar TV.
- **Log Kejadian & Koreksi**: Riwayat gol dan kartu dapat dihapus seketika jika panitia salah memasukkan data.

---

## ⚡ PANDUAN SETUP SUPABASE BARU (AKUN LAIN)

Ikuti 3 langkah mudah berikut untuk menghubungkan database Supabase baru Anda:

1. **Buat Project Supabase Baru**:
   - Buka [supabase.com](https://supabase.com) dan buat project baru (bebas pilih region, misal: *Singapore*).
2. **Jalankan Skrip Database SQL**:
   - Buka menu **SQL Editor** di dashboard Supabase.
   - Buka file [`supabase_schema.sql`](file:///d:/live-score-acc/supabase_schema.sql) dari repositori ini, salin seluruh kodenya, tempel ke SQL Editor Supabase, lalu klik **Run**.
   - Tabel `live_match` dan `match_events` serta *Supabase Realtime* akan otomatis aktif!
3. **Hubungkan ke Aplikasi**:
   - Buka menu **Project Settings -> API** di Supabase, salin:
     - **Project URL** (contoh: `https://xxxx.supabase.co`)
     - **anon / public key**
   - Buka halaman `/operator` di browser, klik tombol **⚙️ Supabase** di pojok kanan atas, tempelkan URL dan Anon Key Anda, lalu klik **Simpan Pengaturan**.

> **💡 Catatan Menarik:** Aplikasi ini dilengkapi arsitektur *Dual-Layer Realtime*. Meskipun internet sedang gangguan atau Supabase belum diisi, aplikasi tetap bisa melakukan sinkronisasi lokal antar-tab browser di perangkat yang sama menggunakan *BroadcastChannel API*!

---

## 🚀 PANDUAN DEPLOY KE VERCEL

1. Buka [vercel.com](https://vercel.com) dan login.
2. Klik **Add New -> Project**.
3. Import repositori GitHub:
   `https://github.com/shofwanbukansofyan-crypto/live-score-acc.git`
4. Biarkan *Framework Preset* sebagai **Other** (karena aplikasi ini adalah *pure high-performance vanilla web*).
5. Klik **Deploy**!
6. Website live scoreboard Anda kini telah aktif dan siap dipasang di TV monitor GOR Futsal.

---

## 📂 STRUKTUR DIREKTORI

```
d:/live-score-acc/
├── index.html            # Mode Display (Scoreboard TV Layar Besar)
├── operator.html         # Mode Penginput (Konsol Meja Wasit / Panitia)
├── vercel.json           # Konfigurasi routing Vercel & Cache-Control
├── supabase_schema.sql   # Skrip SQL tabel realtime untuk Supabase baru
├── css/
│   ├── display.css       # Styling stadium scoreboard layar besar
│   └── operator.css      # Styling kontroler ergonomis meja wasit
├── js/
│   ├── config.js         # Konfigurasi Supabase, durasi babak, & PIN
│   ├── supabase-sync.js  # Engine sinkronisasi Supabase Realtime + Polling
│   ├── teams.js          # Database lokal 32 tim resmi (SMP & SD)
│   ├── matches.js        # Database lokal 52 pertandingan turnamen
│   ├── app-display.js    # Logika layar TV (animasi timer, selebrasi gol)
│   └── app-operator.js   # Logika operator (kontrol skor, babak, timeout)
└── assets/               # Logo turnamen & logo tim peserta
```

---

*Al-Fayyadh Champions Cup 2026 • Maksimal dalam Perjuangan, Mulia dalam Persaudaraan*
