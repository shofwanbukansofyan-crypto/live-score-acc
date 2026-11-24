-- ==============================================================================
-- SEED TEAMS AND MATCHES FOR SUPABASE live-score-acc
-- ==============================================================================
-- Jalankan di SQL Editor jika Anda ingin tabel teams dan matches juga tersimpan di Supabase!

CREATE TABLE IF NOT EXISTS public.teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    category TEXT DEFAULT 'SMP',
    badge_color TEXT,
    city TEXT,
    logo TEXT,
    group_letter TEXT,
    official JSONB DEFAULT '{}'::jsonb,
    players JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.matches (
    id TEXT PRIMARY KEY,
    category TEXT DEFAULT 'SMP',
    stage TEXT DEFAULT 'group',
    group_letter TEXT,
    pitch TEXT,
    date TEXT,
    time TEXT,
    home_id TEXT,
    away_id TEXT,
    home_name TEXT,
    away_name TEXT,
    status TEXT DEFAULT 'upcoming',
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    scorers JSONB DEFAULT '[]'::jsonb,
    cards JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON public.teams TO anon, authenticated, service_role;
GRANT ALL ON public.matches TO anon, authenticated, service_role;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read teams" ON public.teams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Read matches" ON public.matches FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Modify teams" ON public.teams FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Modify matches" ON public.matches FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T01', 'SMP 5 Mandai', 'SMP 5 MANDAI', 'SMP', '#0284c7', 'Maros', '/assets/logo.png', 'A', '{"manager":"Ust. Syamsuddin, S.Pd","coach":"Coach Pep Guardiola","phone":"0812-4411-2233","jerseyHome":"Biru Langit - Putih","jerseyAway":"Hitam - Perak"}', '[{"no":1,"name":"Gianluigi Donnarumma","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/moment_gk_save.jpg"},{"no":3,"name":"Julian Ryerson","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":8,"name":"Martin Odegaard","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":9,"name":"Erling Haaland (C)","pos":"Pivot","goals":4,"yc":0,"rc":0,"photo":"assets/player_athar.jpg"},{"no":11,"name":"Alexander Sorloth","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":12,"name":"Mike Maignan","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Leo Ostigard","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Oscar Bobb","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T02', 'SMP 16 Mandai', 'SMP 16 MANDAI', 'SMP', '#e11d48', 'Maros', '/assets/logo.png', 'A', '{"manager":"Ust. Rahmat Hidayat","coach":"Coach Didier Deschamps","phone":"0813-5522-3344","jerseyHome":"Merah - Putih","jerseyAway":"Biru Navy"}', '[{"no":1,"name":"Thibaut Courtois","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"William Saliba","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":7,"name":"Antoine Griezmann","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":10,"name":"Kylian Mbappe (C)","pos":"Pivot","goals":4,"yc":0,"rc":0},{"no":11,"name":"Ousmane Dembele","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":13,"name":"Yann Sommer","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":6,"name":"Eduardo Camavinga","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":9,"name":"Marcus Thuram","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T03', 'MA''HAD HABIBURRAHMAN A', 'HABIBURRAHMAN A', 'SMP', '#16a34a', 'Maros', 'assets/habiburrahman_logo.jpg', 'A', '{"manager":"Coach Ade Irzan Rizaldi","coach":"Coach Reyfhank AL","medic":"Muh. Yusnul Maulana Syam","phone":"-","jerseyHome":"-","jerseyAway":"-"}', '[{"no":12,"name":"Baso Hasbi","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":15,"name":"Naufal Abeng","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":14,"name":"Muh. Alfatih Basmin","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":19,"name":"Fayyadh Arghad","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":87,"name":"Fikran Mustanir","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":20,"name":"Faqih Hilwan","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":25,"name":"Haekal","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Abu Bakar","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":78,"name":"Iqrha Al-Gifary Vemal","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":30,"name":"Muh. Resqy Naufal Faisal","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":3,"name":"Abdullah Arrayyan","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":99,"name":"Abdurrahman Al-Faruq","pos":"Kiper","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T04', 'IQIS', 'IQIS SMP', 'SMP', '#d97706', 'Makassar', '/assets/logo.png', 'A', '{"manager":"Ust. Fadhil Rahman","coach":"Coach Roberto Martinez","phone":"0852-7744-5566","jerseyHome":"Marun - Emas","jerseyAway":"Putih - Hijau"}', '[{"no":1,"name":"Diogo Costa","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":3,"name":"Ruben Dias","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":8,"name":"Bruno Fernandes","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":7,"name":"Cristiano Ronaldo (C)","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":10,"name":"Bernardo Silva","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":12,"name":"Rui Patricio","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":6,"name":"Joao Palhinha","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":17,"name":"Rafael Leao","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T05', 'AHIS', 'AHIS SMP', 'SMP', '#2563eb', 'Makassar', '/assets/logo.png', 'B', '{"manager":"Ust. Irwan Saputra","coach":"Coach Zlatko Dalicc","phone":"0812-8855-6677","jerseyHome":"Kotak Merah-Putih","jerseyAway":"Hitam - Biru"}', '[{"no":1,"name":"Dominik Livakovicc","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"Josko Gvardiol","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Luka Modricc (C)","pos":"Flank","goals":3,"yc":0,"rc":0},{"no":9,"name":"Andrej Kramaricc","pos":"Pivot","goals":2,"yc":0,"rc":0},{"no":8,"name":"Mateo Kovacic","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":12,"name":"Nediljko Labrovicc","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":11,"name":"Marcelo Brozovicc","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":14,"name":"Ivan Perisic","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T06', 'Al-Akhyar', 'AL-AKHYAR SMP', 'SMP', '#dc2626', 'Makassar', '/assets/logo.png', 'B', '{"manager":"Ust. Burhanuddin","coach":"Coach Luis de la Fuente","phone":"0813-9966-7788","jerseyHome":"Merah - Emas","jerseyAway":"Kuning - Biru"}', '[{"no":1,"name":"Unai Simon","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":2,"name":"Dani Carvajal","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":16,"name":"Rodri (C)","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":19,"name":"Lamine Yamal","pos":"Flank","goals":3,"yc":0,"rc":0},{"no":7,"name":"Alvaro Morata","pos":"Pivot","goals":1,"yc":0,"rc":0},{"no":13,"name":"Alex Remiro","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":8,"name":"Fabian Ruiz","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":11,"name":"Nico Williams","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T07', 'SMPIT Al Madinah', 'AFC AL-MADINAH', 'SMP', '#059669', 'Maros', 'assets/teams/T07/logo.jpg', 'C', '{"manager":"Nabil","managerPhoto":"assets/teams/T07/manager.jpg","coach":"Muh. Imam S, S.Pd","coachPhoto":"assets/teams/T07/coach.jpg","medic":"Alghy","phone":"0822-1177-8899","jerseyHome":"Hitam - Emas","jerseyAway":"Putih - Abu"}', '[{"no":1,"name":"Dizam-Azzam","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_1.jpg"},{"no":4,"name":"Shafar","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_4.jpg"},{"no":8,"name":"Alwan-Aufan","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_8.jpg"},{"no":9,"name":"Ubaid","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_9.jpg"},{"no":10,"name":"Abdullah","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_10.jpg"},{"no":12,"name":"Aqil","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_12.jpg"},{"no":13,"name":"Naufal","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_13.jpg"},{"no":27,"name":"Danis","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_27.jpg"},{"no":71,"name":"Hisyam","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_71.jpg"},{"no":99,"name":"Rinra","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T07/p_99.jpg"}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T08', 'SMPIT Al Hikmah', 'AL-HIKMAH SMP', 'SMP', '#9333ea', 'Maros', '/assets/logo.png', 'B', '{"manager":"Ust. Lukman Hakim","coach":"Coach Michal Probierz","phone":"0853-2288-9900","jerseyHome":"Putih - Merah","jerseyAway":"Ungu - Putih"}', '[{"no":1,"name":"Wojciech Szczesny","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":14,"name":"Jakub Kiwior","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Piotr Zielinski","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":9,"name":"Robert Lewandowski (C)","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":21,"name":"Nicola Zalewski","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":12,"name":"Lukasz Skorupski","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Jan Bednarek","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":20,"name":"Sebastian Szymanski","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T09', 'SMPN 1 Maros', 'SMPN 1 MAROS', 'SMP', '#0d9488', 'Maros', '/assets/logo.png', 'C', '{"manager":"H. Sudirman, S.Pd","coach":"Coach Julian Nagelsmann","phone":"0812-3399-0011","jerseyHome":"Putih - Hitam","jerseyAway":"Pink - Ungu"}', '[{"no":1,"name":"Manuel Neuer","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":2,"name":"Antonio Rudiger","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":6,"name":"Joshua Kimmich","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":10,"name":"Jamal Musiala (C)","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":17,"name":"Florian Wirtz","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":22,"name":"Oliver Baumann","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"Jonathan Tah","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":7,"name":"Kai Havertz","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T10', 'SMPN 2 Maros', 'SMPN 2 MAROS', 'SMP', '#ea580c', 'Maros', '/assets/logo.png', 'C', '{"manager":"Drs. Bahtiar, M.M","coach":"Coach Ronald Koeman","phone":"0813-4400-1122","jerseyHome":"Oranye - Hitam","jerseyAway":"Biru - Putih"}', '[{"no":1,"name":"Bart Verbruggen","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"Virgil van Dijk (C)","pos":"Anchor","goals":1,"yc":0,"rc":0},{"no":14,"name":"Tijjani Reijnders","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":7,"name":"Xavi Simons","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":11,"name":"Cody Gakpo","pos":"Pivot","goals":2,"yc":0,"rc":0},{"no":13,"name":"Mark Flekken","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Nathan Ake","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":9,"name":"Memphis Depay","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T11', 'Pesantren Hj. Haniah Maros', 'PESANTREN HANIAH', 'SMP', '#047857', 'Maros', 'assets/pesantren_haniah_logo.jpg', 'C', '{"manager":"Muhammad Idris, S.Pd.","coach":"Abd. Rahmat, S.Pd.I., M.Pd.","coachPhoto":"assets/coach_t11_haniah.jpg","phone":"0821-5511-2233","jerseyHome":"Putih - Biru","jerseyAway":""}', '[{"no":1,"name":"Gibran Fauzan Samana","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":25,"name":"Wira Noval","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":17,"name":"Muh. Syabil","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":7,"name":"M. Fatur","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Faturrahman","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":11,"name":"Muh Arya Jaya Putera","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":12,"name":"Andi Alif Permana","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":19,"name":"Muh. Dimasqi Atras","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":29,"name":"Mochammad Fadhil","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":30,"name":"Muh Faiz Urbun Anaqi","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":67,"name":"Muh Alif Al-Fajri","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":9,"name":"Muh Syahril","pos":"Anchor","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T12', 'Pesantren Shohwatul Is''ad Pangkep', 'SHOHWATUL IS''AD', 'SMP', '#b91c1c', 'Pangkep', '/assets/logo.png', 'C', '{"manager":"Ust. Masrur, S.Pd.I","coach":"Coach Murat Yakin","phone":"0852-6622-3344","jerseyHome":"Merah - Putih","jerseyAway":"Hitam - Merah"}', '[{"no":1,"name":"Gregor Kobel","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Manuel Akanji","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Granit Xhaka (C)","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":7,"name":"Breel Embolo","pos":"Pivot","goals":2,"yc":0,"rc":0},{"no":19,"name":"Dan Ndoye","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":12,"name":"Yvon Mvogo","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":6,"name":"Denis Zakaria","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":20,"name":"Michel Aebischer","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T13', 'SMP Alfayyadh', 'SMP AL-FAYYADH', 'SMP', '#15803d', 'Maros', '/assets/logo.png', 'D', '{"manager":"Ust. Muhammad Fikri Haekal","coach":"Coach Carlo Ancelotti","phone":"0812-9876-5432","jerseyHome":"Hijau Emerald - Emas","jerseyAway":"Putih - Hijau"}', '[{"no":1,"name":"Andriy Lunin","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"David Alaba","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":8,"name":"Toni Kroos (C)","pos":"Flank","goals":3,"yc":0,"rc":0},{"no":13,"name":"Thomas Muller","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":22,"name":"Ilkay Gundogan","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":12,"name":"Sven Ulreich","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":6,"name":"Marcel Sabitzer","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":9,"name":"Christoph Baumgartner","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T14', 'SMPIT QA', 'SMPIT QA', 'SMP', '#4f46e5', 'Makassar', '/assets/logo.png', 'D', '{"manager":"Ust. Qasim Basalamah","coach":"Coach Kasper Hjulmand","phone":"0813-7733-4455","jerseyHome":"Merah - Putih","jerseyAway":"Biru - Putih"}', '[{"no":1,"name":"Kasper Schmeichel","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":6,"name":"Andreas Christensen","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Christian Eriksen (C)","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":9,"name":"Rasmus Hojlund","pos":"Pivot","goals":2,"yc":0,"rc":0},{"no":14,"name":"Mikkel Damsgaard","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":16,"name":"Frederik Ronnow","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":23,"name":"Pierre-Emile Hojbjerg","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":11,"name":"Jonas Wind","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T15', 'Mahad Imam Bukhari', 'IMB FC', 'SMP', '#0284c7', 'Maros', 'assets/teams/T15/logo.jpg', 'D', '{"manager":"Ust. Bukhari","coach":"Coach IMB","phone":"-","jerseyHome":"Biru - Putih","jerseyAway":"Hitam"}', '[{"no":1,"name":"Afif Fidaus","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_1.jpg"},{"no":2,"name":"Ahmad Al Bukhari","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_2.jpg"},{"no":3,"name":"Al Safwan","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_3.jpg"},{"no":4,"name":"Dzar Andar","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_4.jpg"},{"no":5,"name":"Hammad","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_5.jpg"},{"no":6,"name":"Muhammad Afif Ghozali","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_6.jpg"},{"no":7,"name":"Muhammad Dayyan","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_7.jpg"},{"no":8,"name":"Muhammad Rafa Azka","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_8.jpg"},{"no":9,"name":"Muhammad Zakaria","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_9.jpg"},{"no":10,"name":"Ubaidillah","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_10.jpg"},{"no":11,"name":"Wahid Ramadhan","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T15/p_11.jpg"}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T16', 'SMP Habiburrahman Luwu', 'HABIBURRAHMAN B', 'SMP', '#16a34a', 'Luwu', 'assets/teams/T16/logo.jpg', 'D', '{"manager":"Coach Habiburrahman B","coach":"Coach Habiburrahman B","phone":"-","jerseyHome":"Hijau - Putih","jerseyAway":"Hitam"}', '[{"no":1,"name":"Aimar Fadhil Nasrullah","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_1.jpg"},{"no":2,"name":"Alif Mustafa Ahmad","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_2.jpg"},{"no":3,"name":"Muh. Resky Maulana","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_3.jpg"},{"no":4,"name":"Muh.Imam Buhari","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_4.jpg"},{"no":5,"name":"Muh.Razzaq Dzulhijjah","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_5.jpg"},{"no":6,"name":"Muh.Tegar Al-Gifari","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_6.jpg"},{"no":7,"name":"Rey Alteza Bilfaqih","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_7.jpg"},{"no":8,"name":"Stiev Jihad Abdullah","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_8.jpg"},{"no":9,"name":"Zahir Zacky Mustapa","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_9.jpg"},{"no":10,"name":"Zakir Zacky Mustapa","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T16/p_10.jpg"}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T17', 'IQIS MAKASSAR', 'IQIS SD', 'SD', '#0284c7', 'Makassar', '/assets/logo.png', 'A', '{"manager":"Ust. Zulkifli, S.Pd","coach":"Coach Sir Alex Ferguson","phone":"0812-1001-2001","jerseyHome":"Biru - Emas","jerseyAway":"Putih - Biru"}', '[{"no":1,"name":"Joe Hart","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Rio Ferdinand","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":7,"name":"David Beckham (C)","pos":"Flank","goals":3,"yc":0,"rc":0},{"no":10,"name":"Wayne Rooney","pos":"Pivot","goals":4,"yc":0,"rc":0},{"no":8,"name":"Steven Gerrard","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":13,"name":"Ben Foster","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":6,"name":"John Terry","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":11,"name":"Frank Lampard","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T18', 'AHIS MAKASSAR', 'AHIS SD', 'SD', '#2563eb', 'Makassar', '/assets/logo.png', 'A', '{"manager":"Ust. Syarifuddin","coach":"Coach Arsene Wenger","phone":"0813-2002-3002","jerseyHome":"Biru Navy - Merah","jerseyAway":"Putih - Biru"}', '[{"no":1,"name":"Fabien Barthez","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":3,"name":"Eric Abidal","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Zinedine Zidane (C)","pos":"Flank","goals":3,"yc":0,"rc":0},{"no":14,"name":"Thierry Henry","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":7,"name":"Franck Ribery","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":16,"name":"Gregory Coupet","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"Patrick Vieira","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":9,"name":"Karim Benzema","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T19', 'AL-AKHYAR MAKASSAR', 'AL-AKHYAR SD', 'SD', '#dc2626', 'Makassar', '/assets/logo.png', 'A', '{"manager":"Ust. Basri Kasim","coach":"Coach Vicente del Bosque","phone":"0821-3003-4003","jerseyHome":"Merah - Biru","jerseyAway":"Putih - Emas"}', '[{"no":1,"name":"Iker Casillas (C)","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"Sergio Ramos","pos":"Anchor","goals":1,"yc":0,"rc":0},{"no":8,"name":"Andres Iniesta","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":6,"name":"Xavi Hernandez","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":9,"name":"Fernando Torres","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":12,"name":"Victor Valdes","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Carles Puyol","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":21,"name":"David Silva","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T20', 'QOF', 'QOF', 'SD', '#1e3a8a', 'Makassar', '/assets/logo.png', 'A', '{"manager":"Ust. Qudamah Mansyur","coach":"Coach Marcello Lippi","phone":"0852-4004-5004","jerseyHome":"Biru Tua - Putih","jerseyAway":"Kuning - Hitam"}', '[{"no":1,"name":"Gianluigi Buffon (C)","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":3,"name":"Paolo Maldini","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":21,"name":"Andrea Pirlo","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":10,"name":"Alessandro Del Piero","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":8,"name":"Gennaro Gattuso","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":12,"name":"Francesco Toldo","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Fabio Cannavaro","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":9,"name":"Filippo Inzaghi","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T21', 'SDIT QA', 'SDIT QA', 'SD', '#ea580c', 'Makassar', '/assets/logo.png', 'B', '{"manager":"Ust. Qashim Abdullah","coach":"Coach Louis van Gaal","phone":"0812-5005-6005","jerseyHome":"Oranye - Putih","jerseyAway":"Biru - Hitam"}', '[{"no":1,"name":"Edwin van der Sar","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":3,"name":"Jaap Stam","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Wesley Sneijder (C)","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":9,"name":"Robin van Persie","pos":"Pivot","goals":4,"yc":0,"rc":0},{"no":11,"name":"Arjen Robben","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":12,"name":"Maarten Stekelenburg","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":8,"name":"Edgar Davids","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":19,"name":"Ruud van Nistelrooy","pos":"Pivot","goals":1,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T22', 'SDIT AL MADINAH', 'AL-MADINAH SD', 'SD', '#059669', 'Maros', '/assets/logo.png', 'B', '{"manager":"Ust. Munir Syam","coach":"Coach Joachim Low","phone":"0813-6006-7006","jerseyHome":"Hijau Daun - Putih","jerseyAway":"Merah - Hitam"}', '[{"no":1,"name":"Oliver Kahn","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":16,"name":"Philipp Lahm (C)","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":7,"name":"Bastian Schweinsteiger","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":11,"name":"Miroslav Klose","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":10,"name":"Mesut Ozil","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":12,"name":"Jens Lehmann","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Mats Hummels","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":19,"name":"Mario Gotze","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T23', 'SDIT AL HIKMAH', 'AL-HIKMAH SD', 'SD', '#7c3aed', 'Maros', '/assets/logo.png', 'B', '{"manager":"Ust. Taufik Hidayat","coach":"Coach Roberto Martinez","phone":"0821-7007-8007","jerseyHome":"Ungu - Kuning","jerseyAway":"Putih - Ungu"}', '[{"no":1,"name":"Thibaut Courtois","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"Vincent Kompany (C)","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Eden Hazard","pos":"Flank","goals":3,"yc":0,"rc":0},{"no":8,"name":"Marouane Fellaini","pos":"Pivot","goals":2,"yc":0,"rc":0},{"no":11,"name":"Dries Mertens","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":12,"name":"Simon Mignolet","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Jan Vertonghen","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":9,"name":"Christian Benteke","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T24', 'SDIT IBNU RAJAB', 'IBNU RAJAB', 'SD', '#15803d', 'Maros', '/assets/logo.png', 'B', '{"manager":"Ust. Rajab Al-Makassari","coach":"Coach Fernando Santos","phone":"0852-8008-9008","jerseyHome":"Hijau Lumut - Putih","jerseyAway":"Marun - Emas"}', '[{"no":1,"name":"Vitor Baia","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":6,"name":"Ricardo Carvalho","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":7,"name":"Luis Figo (C)","pos":"Flank","goals":2,"yc":0,"rc":0},{"no":10,"name":"Rui Costa","pos":"Pivot","goals":2,"yc":0,"rc":0},{"no":20,"name":"Deco","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":12,"name":"Ricardo Pereira","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":3,"name":"Pepe","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":17,"name":"Nani","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T25', 'Kuttab Nurul wahyain', 'NURUL WAHYAIN', 'SD', '#b45309', 'Maros', '/assets/logo.png', 'C', '{"manager":"Ust. Wahyuddin, S.Pd","coach":"Coach Ryan Giggs","phone":"0812-9009-0001","jerseyHome":"Cokelat Emas - Putih","jerseyAway":"Hitam - Merah"}', '[{"no":1,"name":"Wayne Hennessey","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Ashley Williams (C)","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Aaron Ramsey","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":11,"name":"Gareth Bale","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":7,"name":"Daniel James","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":12,"name":"Danny Ward","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":4,"name":"Ben Davies","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":9,"name":"Kieffer Moore","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T26', 'UPT SPF SD INPRES PAJJAIANG', 'SIPA FC', 'SD', '#0284c7', 'Makassar', 'assets/teams/T26/logo.jpg', 'C', '{"manager":"Manager SIPA FC","managerPhoto":"assets/teams/T26/manager.jpg","coach":"Pelatih SIPA FC","coachPhoto":"assets/teams/T26/coach.jpg","phone":"0813-0010-1002","jerseyHome":"Kuning - Biru","jerseyAway":"Putih - Biru"}', '[{"no":1,"name":"Abinaya Azka Masagena","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_1.jpg"},{"no":11,"name":"Akbar Nurdaffah","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_2.jpg"},{"no":12,"name":"Dimas Triputra Arisandy","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_3.jpg"},{"no":10,"name":"Fadli Adrian","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_4.jpg"},{"no":9,"name":"Faizal Ode","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_5.jpg"},{"no":14,"name":"MT Dyandra Raffasya P","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_6.jpg"},{"no":5,"name":"Muh Ali Muttaqin","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_7.jpg"},{"no":24,"name":"Muh Dzaky Paloloi","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_8.jpg"},{"no":17,"name":"Muh Mirza Aditya Ibnu","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_9.jpg"},{"no":18,"name":"Rafli Nur Wahid","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_10.jpg"},{"no":6,"name":"Rifki Nahlan Syauqi","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_11.jpg"},{"no":80,"name":"Rizqi Nahlan Syauqi","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T26/p_12.jpg"}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T27', 'UPTD SDN 82 PATTENE (TIM A)', 'PATTENE A', 'SD', '#047857', 'Maros', 'assets/teams/T27/logo.jpg', 'C', '{"manager":"Official Pattene A","coach":"Coach Pattene A","phone":"-","jerseyHome":"Biru - Putih","jerseyAway":"Merah"}', '[{"no":1,"name":"Fardan Akbar","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":9,"name":"Andi Ogi Mawakka","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":7,"name":"Fatir Al A''raf","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":10,"name":"Moch Badrus Zaman","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":11,"name":"Muh. Naufal Azka","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":2,"name":"Adley AM Lamma","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":8,"name":"Althaf Syahputra Ramadan","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":3,"name":"Andi Muh Nukta","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":4,"name":"Jefry Al Buchory","pos":"Anchor","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T28', 'SDN 234 BARAMBANG 2', 'BRADA FC', 'SD', '#b91c1c', 'Maros', 'assets/brada_fc_logo.png', 'C', '{"manager":"Muhammad Ansar, S.Pd.","coach":"A. Muh Alif Rakasiwi, S.Pd","coachPhoto":"assets/coach_t28_barambang.jpg","medic":"Pamadeng Rukka, S.Pd.","phone":"081998494011","jerseyHome":"UNGU","jerseyAway":""}', '[{"no":1,"name":"Muh Habib Al  Habsy","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":7,"name":"Afif Putra Mubarak","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":10,"name":"Richard Ivander Winda","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":17,"name":"Andi Muhammad Sakha","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":6,"name":"A Muhammad Berkah","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":11,"name":"A Qabil Abu Bakar HS","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":9,"name":"Hafiz Al Ghazali","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":16,"name":"Muh Pangeran","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":22,"name":"Arsyl Batara Ilham","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":2,"name":"Akmal","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":19,"name":"Haikal Al Khalifi","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":26,"name":"Aditya A","pos":"Anchor","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T29', 'UPTD SDN 2 Maros', 'SDN 2 MAROS', 'SD', '#0284c7', 'Maros', '/assets/logo.png', 'D', '{"manager":"Hj. Hasnah, S.Pd","coach":"Coach Matjaz Kek","phone":"0812-3343-4353","jerseyHome":"Biru Langit - Putih","jerseyAway":"Hijau - Putih"}', '[{"no":1,"name":"Jan Oblak (C)","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":6,"name":"Jaka Bijol","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":7,"name":"Josip Ilicic","pos":"Flank","goals":1,"yc":0,"rc":0},{"no":9,"name":"Benjamin Sesko","pos":"Pivot","goals":3,"yc":0,"rc":0},{"no":10,"name":"Miha Zajc","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":12,"name":"Vid Belec","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":2,"name":"Petar Stojanovicc","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":11,"name":"Andraz Sporar","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T30', 'UPTD SDN 57 BULU-BULU', 'SDN 57 BULU-BULU', 'SD', '#1e3a8a', 'Maros', 'assets/sdn_57_bulubulu_logo.jpg', 'D', '{"manager":"Ikram Abi Rafdi, S.Pd.","managerPhoto":"assets/coach_bayu.jpg","coach":"Ahmad Mubarak, S.Pd., M.Pd.","coachPhoto":"assets/coach_t30_bulubulu.jpg","medic":"Ina Oktaviana Namang, S.Pd.","phone":"082190825414","jerseyHome":"Biru Elektrik - Putih","jerseyAway":"Putih - Biru"}', '[{"no":1,"name":"Muhammad Arifin A","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_1.jpeg"},{"no":10,"name":"Muh. Fakhar Zhafar Rahmat","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_2.png"},{"no":17,"name":"Muh. Ayyub","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_3.png"},{"no":5,"name":"Meichael Ananda Pangestu","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_4.png"},{"no":3,"name":"Muh. Alvian Rasya","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_5.png"},{"no":69,"name":"Muhammad Rasul Umar","pos":"Pivot","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_6.png"},{"no":2,"name":"Muh. Sadiq Sabri","pos":"Kiper","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_8.jpeg"},{"no":13,"name":"Andi Azka Maulan","pos":"Anchor","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_9.jpeg"},{"no":28,"name":"Adam Faiz Al Arkhan","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_10.jpeg"},{"no":11,"name":"Muhammad Al Gazali","pos":"Flank","goals":0,"yc":0,"rc":0,"photo":"assets/teams/T30/media_11.png"}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T31', 'UPTD SDN 146 BARAMBANG 1', 'BARAMBANG 1', 'SD', '#b45309', 'Maros', 'assets/teams/T31/logo.jpg', 'D', '{"manager":"Official Barambang 1","coach":"Muh. Ismail, S.Pd","phone":"-","jerseyHome":"Kuning - Hitam","jerseyAway":"Putih"}', '[{"no":21,"name":"Muh Rafa Zaka Putra Yogasara","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":11,"name":"Muh Yusran","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":9,"name":"Muh Fitrah Ramadhan","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":17,"name":"Muh Raihan Rh","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":22,"name":"Mirza Ukail","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":20,"name":"Ahmad Nur Ramdani","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":15,"name":"Muh Daffa Raditya","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":14,"name":"Muh Daffa Fajri Asis","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":7,"name":"Nizar Rafiq","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":19,"name":"Muh Irfail Adzan","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":10,"name":"Muh Novri","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":28,"name":"Muh Hasrullah","pos":"Pivot","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;
INSERT INTO public.teams (id, name, short_name, category, badge_color, city, logo, group_letter, official, players)
VALUES ('T32', 'UPTD SDN 82 PATTENE (TIM B)', 'PATTENE B', 'SD', '#0284c7', 'Maros', 'assets/teams/T32/logo.jpg', 'D', '{"manager":"Official Pattene B","coach":"Coach Pattene B","phone":"-","jerseyHome":"Biru - Putih","jerseyAway":"Hitam"}', '[{"no":2,"name":"Riswan Alfa Reza","pos":"Kiper","goals":0,"yc":0,"rc":0},{"no":5,"name":"Muh Alif Saputra","pos":"Anchor","goals":0,"yc":0,"rc":0},{"no":3,"name":"Hamid Fadhil Hasan","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":7,"name":"Diaz Putra Ramadhan","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":6,"name":"Muh. Fadhil","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":11,"name":"Muh. Restu Kadir","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":8,"name":"Muh. Reski Kadir","pos":"Flank","goals":0,"yc":0,"rc":0},{"no":10,"name":"Muh. Gibran","pos":"Pivot","goals":0,"yc":0,"rc":0},{"no":4,"name":"Muh. Arsil","pos":"Anchor","goals":0,"yc":0,"rc":0}]')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, official = EXCLUDED.official, players = EXCLUDED.players;

-- MATCHES SEED
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M01', 'SMP', 'group', 'A', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '08:00 - 08:40 WITA', 'T01', 'T02', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M02', 'SMP', 'group', 'A', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '08:45 - 09:25 WITA', 'T03', 'T04', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M03', 'SMP', 'group', 'B', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '09:30 - 10:10 WITA', 'T05', 'T06', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M04', 'SMP', 'group', 'B', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '10:15 - 10:55 WITA', 'T07', 'T08', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M05', 'SMP', 'group', 'C', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '11:00 - 11:40 WITA', 'T09', 'T10', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M06', 'SMP', 'group', 'C', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '13:00 - 13:40 WITA', 'T11', 'T12', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M07', 'SMP', 'group', 'D', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '13:45 - 14:25 WITA', 'T13', 'T14', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M08', 'SMP', 'group', 'D', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '14:30 - 15:10 WITA', 'T15', 'T16', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M09', 'SD', 'group', 'A', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '15:15 - 15:55 WITA', 'T17', 'T18', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M10', 'SD', 'group', 'A', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '16:00 - 16:40 WITA', 'T19', 'T20', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M11', 'SD', 'group', 'B', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '16:45 - 17:25 WITA', 'T21', 'T22', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M12', 'SD', 'group', 'B', 'Lapangan Utama (Vinyl)', '22 Nov 2026', '17:30 - 18:10 WITA', 'T23', 'T24', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M13', 'SD', 'group', 'C', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '08:00 - 08:40 WITA', 'T25', 'T26', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M14', 'SD', 'group', 'C', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '08:45 - 09:25 WITA', 'T27', 'T28', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M15', 'SD', 'group', 'D', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '09:30 - 10:10 WITA', 'T29', 'T30', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M16', 'SD', 'group', 'D', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '10:15 - 10:55 WITA', 'T31', 'T32', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M17', 'SMP', 'group', 'A', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '11:00 - 11:40 WITA', 'T01', 'T03', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M18', 'SMP', 'group', 'A', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '13:00 - 13:40 WITA', 'T02', 'T04', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M19', 'SMP', 'group', 'B', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '13:45 - 14:25 WITA', 'T05', 'T07', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M20', 'SMP', 'group', 'B', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '14:30 - 15:10 WITA', 'T06', 'T08', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M21', 'SMP', 'group', 'C', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '15:15 - 15:55 WITA', 'T09', 'T11', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M22', 'SMP', 'group', 'C', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '16:00 - 16:40 WITA', 'T10', 'T12', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M23', 'SMP', 'group', 'D', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '16:45 - 17:25 WITA', 'T13', 'T15', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M24', 'SMP', 'group', 'D', 'Lapangan Utama (Vinyl)', '23 Nov 2026', '17:30 - 18:10 WITA', 'T14', 'T16', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M25', 'SMP', 'group', 'A', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '08:00 - 08:40 WITA', 'T01', 'T04', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M26', 'SMP', 'group', 'A', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '08:45 - 09:25 WITA', 'T02', 'T03', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M27', 'SMP', 'group', 'B', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '09:30 - 10:10 WITA', 'T05', 'T08', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M28', 'SMP', 'group', 'B', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '10:15 - 10:55 WITA', 'T06', 'T07', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M29', 'SMP', 'group', 'C', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '11:00 - 11:40 WITA', 'T09', 'T12', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M30', 'SMP', 'group', 'C', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '13:00 - 13:40 WITA', 'T10', 'T11', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M31', 'SMP', 'group', 'D', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '13:45 - 14:25 WITA', 'T13', 'T16', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M32', 'SMP', 'group', 'D', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '14:30 - 15:10 WITA', 'T14', 'T15', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M33', 'SD', 'group', 'A', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '15:15 - 15:55 WITA', 'T17', 'T20', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M34', 'SD', 'group', 'A', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '16:00 - 16:40 WITA', 'T18', 'T19', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M35', 'SD', 'group', 'B', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '16:45 - 17:25 WITA', 'T21', 'T24', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('M36', 'SD', 'group', 'B', 'Lapangan Utama (Vinyl)', '24 Nov 2026', '17:30 - 18:10 WITA', 'T22', 'T23', '', '', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('QF1_SMP', 'SMP', 'knockout', '', 'Lapangan Utama (Vinyl)', '25 Nov 2026', '08:30 - 09:15 WITA', 'T01', 'T06', 'Juara Grup A (SMP)', 'Runner-up Grup B (SMP)', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('QF2_SMP', 'SMP', 'knockout', '', 'Lapangan Utama (Vinyl)', '25 Nov 2026', '09:30 - 10:15 WITA', 'T09', 'T15', 'Juara Grup C (SMP)', 'Runner-up Grup D (SMP)', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('QF3_SMP', 'SMP', 'knockout', '', 'Lapangan Utama (Vinyl)', '25 Nov 2026', '10:30 - 11:15 WITA', 'T05', 'T02', 'Juara Grup B (SMP)', 'Runner-up Grup A (SMP)', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('QF4_SMP', 'SMP', 'knockout', '', 'Lapangan Utama (Vinyl)', '25 Nov 2026', '11:30 - 12:15 WITA', 'T13', 'T12', 'Juara Grup D (SMP)', 'Runner-up Grup C (SMP)', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('QF1_SD', 'SD', 'knockout', '', 'Lapangan Utama (Vinyl)', '25 Nov 2026', '13:30 - 14:15 WITA', 'T17', 'T23', 'Juara Grup A (SD)', 'Runner-up Grup B (SD)', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('QF2_SD', 'SD', 'knockout', '', 'Lapangan Utama (Vinyl)', '25 Nov 2026', '14:30 - 15:15 WITA', 'T26', 'T29', 'Juara Grup C (SD)', 'Runner-up Grup D (SD)', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('QF3_SD', 'SD', 'knockout', '', 'Lapangan Utama (Vinyl)', '25 Nov 2026', '15:30 - 16:15 WITA', 'T21', 'T19', 'Juara Grup B (SD)', 'Runner-up Grup A (SD)', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('QF4_SD', 'SD', 'knockout', '', 'Lapangan Utama (Vinyl)', '25 Nov 2026', '16:30 - 17:15 WITA', 'T32', 'T27', 'Juara Grup D (SD)', 'Runner-up Grup C (SD)', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('SF1_SMP', 'SMP', 'knockout', '', 'Lapangan Utama (Vinyl)', '26 Nov 2026', '08:30 - 09:20 WITA', '', '', 'Pemenang QF1 SMP', 'Pemenang QF2 SMP', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('SF2_SMP', 'SMP', 'knockout', '', 'Lapangan Utama (Vinyl)', '26 Nov 2026', '09:30 - 10:20 WITA', '', '', 'Pemenang QF3 SMP', 'Pemenang QF4 SMP', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('SF1_SD', 'SD', 'knockout', '', 'Lapangan Utama (Vinyl)', '26 Nov 2026', '10:30 - 11:20 WITA', '', '', 'Pemenang QF1 SD', 'Pemenang QF2 SD', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('SF2_SD', 'SD', 'knockout', '', 'Lapangan Utama (Vinyl)', '26 Nov 2026', '11:30 - 12:20 WITA', '', '', 'Pemenang QF3 SD', 'Pemenang QF4 SD', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('3RD_SD', 'SD', 'knockout', '', 'Lapangan Utama (Vinyl)', '26 Nov 2026', '13:30 - 14:15 WITA', '', '', 'Kalah Semifinal 1 SD', 'Kalah Semifinal 2 SD', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('3RD_SMP', 'SMP', 'knockout', '', 'Lapangan Utama (Vinyl)', '26 Nov 2026', '14:15 - 15:00 WITA', '', '', 'Kalah Semifinal 1 SMP', 'Kalah Semifinal 2 SMP', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('FINAL_SD', 'SD', 'knockout', '', 'Lapangan Utama (Vinyl)', '26 Nov 2026', '15:00 - 16:00 WITA', '', '', 'Pemenang SF1 SD', 'Pemenang SF2 SD', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.matches (id, category, stage, group_letter, pitch, date, time, home_id, away_id, home_name, away_name, status, home_score, away_score, scorers, cards)
VALUES ('FINAL_SMP', 'SMP', 'knockout', '', 'Lapangan Utama (Vinyl)', '26 Nov 2026', '16:00 - 17:00 WITA', '', '', 'Pemenang SF1 SMP', 'Pemenang SF2 SMP', 'upcoming', 0, 0, '[]', '[]')
ON CONFLICT (id) DO NOTHING;
