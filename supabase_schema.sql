-- ==============================================================================
-- ACC FUTSAL CUP 2026 - DEDICATED REAL-TIME LIVE SCORE & TV DISPLAY DATABASE SCHEMA
-- ==============================================================================
-- Jalankan skrip SQL ini di SQL Editor dashboard Supabase baru Anda (akun baru).
-- Skrip ini menyiapkan tabel realtime untuk live scoreboard TV dan konsol operator.

-- 1. TABEL UTAMA: live_match (Menyimpan status pertandingan aktif)
CREATE TABLE IF NOT EXISTS public.live_match (
    id TEXT PRIMARY KEY DEFAULT 'current_match',
    category TEXT DEFAULT 'SMP',             -- 'SMP' atau 'SD'
    stage TEXT DEFAULT 'FASE GRUP',           -- 'FASE GRUP', 'PEREMPAT FINAL', 'SEMIFINAL', 'FINAL'
    pitch TEXT DEFAULT 'Lapangan Utama',      -- 'Lapangan Utama' atau 'Lapangan 2'
    
    -- Tim Home
    home_id TEXT DEFAULT 'T01',
    home_name TEXT DEFAULT 'SMP 1 Mandai',
    home_short TEXT DEFAULT 'SMP1M',
    home_logo TEXT DEFAULT '/assets/logo.png',
    home_color TEXT DEFAULT '#10b981',        -- Warna tema tim / jersey
    home_score INTEGER DEFAULT 0,
    home_penalties INTEGER DEFAULT NULL,
    home_fouls INTEGER DEFAULT 0,             -- Pelanggaran (Maks 5 di futsal)
    home_timeout BOOLEAN DEFAULT FALSE,
    
    -- Tim Away
    away_id TEXT DEFAULT 'T02',
    away_name TEXT DEFAULT 'SMP 2 Mandai',
    away_short TEXT DEFAULT 'SMP2M',
    away_logo TEXT DEFAULT '/assets/logo.png',
    away_color TEXT DEFAULT '#3b82f6',
    away_score INTEGER DEFAULT 0,
    away_penalties INTEGER DEFAULT NULL,
    away_fouls INTEGER DEFAULT 0,
    away_timeout BOOLEAN DEFAULT FALSE,
    
    -- Status & Timer Pertandingan
    period TEXT DEFAULT 'upcoming',           -- 'upcoming', '1st', 'halftime', '2nd', 'et', 'penalties', 'finished'
    period_label TEXT DEFAULT 'BELUM DIMULAI', -- 'BELUM DIMULAI', 'BABAK 1', 'ISTIRAHAT', 'BABAK 2', 'BABAK TAMBAHAN', 'ADU PENALTI', 'SELESAI (FT)'
    timer_seconds INTEGER DEFAULT 0,          -- Waktu berjalan dalam detik (misal: 120 = 02:00)
    target_duration INTEGER DEFAULT 900,      -- Durasi per babak dalam detik (900s = 15 menit, 600s = 10 menit)
    is_running BOOLEAN DEFAULT FALSE,         -- True jika timer sedang berjalan
    timer_started_at TIMESTAMPTZ,             -- Timestamp saat timer dimulai (untuk sinkronisasi presisi)
    
    -- Timeout Countdown
    timeout_running BOOLEAN DEFAULT FALSE,
    timeout_seconds INTEGER DEFAULT 60,
    timeout_started_at TIMESTAMPTZ,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL EVENT / MOMEN PERTANDINGAN: match_events (Gol, Kartu, Pelanggaran, Timeout)
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id TEXT DEFAULT 'current_match',
    type TEXT NOT NULL,                       -- 'goal', 'card_yellow', 'card_red', 'foul', 'timeout'
    team TEXT NOT NULL,                       -- 'home' atau 'away'
    player_name TEXT DEFAULT '',              -- Nama pemain pencetak gol atau penerima kartu
    minute TEXT DEFAULT '',                   -- Menit kejadian, contoh: "12'"
    note TEXT DEFAULT '',                     -- Catatan opsional (misal: 'Assist: Ahmad', 'Own Goal')
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AKTIFKAN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.live_match ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- 4. KEBIJAKAN AKSES (POLICIES)
-- Mode Display TV & Publik: Dapat membaca data secara real-time tanpa login
DROP POLICY IF EXISTS "Public Read live_match" ON public.live_match;
CREATE POLICY "Public Read live_match" ON public.live_match 
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public Read match_events" ON public.match_events;
CREATE POLICY "Public Read match_events" ON public.match_events 
FOR SELECT TO anon, authenticated USING (true);

-- Penginput / Operator: Dapat mengubah dan menambah data
DROP POLICY IF EXISTS "Operator All live_match" ON public.live_match;
CREATE POLICY "Operator All live_match" ON public.live_match 
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Operator All match_events" ON public.match_events;
CREATE POLICY "Operator All match_events" ON public.match_events 
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. AKTIFKAN REPLICA IDENTITY FULL (Wajib untuk Supabase Realtime broadcast)
ALTER TABLE public.live_match REPLICA IDENTITY FULL;
ALTER TABLE public.match_events REPLICA IDENTITY FULL;

-- 6. TAMBAHKAN TABEL KE PUBLIKASI REALTIME
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'live_match'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_match;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'match_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
  END IF;
END $$;

-- 7. MASUKKAN DATA AWAL (DEFAULT MATCH ROW)
INSERT INTO public.live_match (
    id, category, stage, pitch,
    home_id, home_name, home_short, home_color, home_score, home_fouls,
    away_id, away_name, away_short, away_color, away_score, away_fouls,
    period, period_label, timer_seconds, target_duration, is_running
) VALUES (
    'current_match', 'SMP', 'FASE GRUP - GRUP A', 'Lapangan Utama',
    'T01', 'SMP 1 Mandai', 'SMP1M', '#10b981', 0, 0,
    'T02', 'SMP 2 Mandai', 'SMP2M', '#3b82f6', 0, 0,
    'upcoming', 'BELUM DIMULAI', 0, 900, FALSE
) ON CONFLICT (id) DO NOTHING;
