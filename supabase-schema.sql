-- ============================================
-- SQL скрипт для настройки мультиплеера Тетрис
-- Выполните этот скрипт в Supabase SQL Editor
-- ============================================

-- Удаляем старые таблицы если они есть
drop table if exists players;
drop table if exists game_rooms;

-- Таблица игровых комнат
create table game_rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  status text default 'waiting' check (status in ('waiting', 'playing', 'finished')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Таблица игроков
create table players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references game_rooms(id) on delete cascade,
  player_number integer check (player_number in (1, 2)),
  score integer default 0,
  lines integer default 0,
  level integer default 1,
  board_state jsonb default '[]'::jsonb,
  is_alive boolean default true,
  next_piece text,
  last_update timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(room_id, player_number)
);

-- Индексы для производительности
create index idx_players_room_id on players(room_id);
create index idx_game_rooms_code on game_rooms(code);
create index idx_game_rooms_status on game_rooms(status);

-- ============================================
-- Включаем Realtime для обеих таблиц
-- ============================================

-- Удаляем старые публикации если есть
alter publication supabase_realtime drop table if exists players;
alter publication supabase_realtime drop table if exists game_rooms;

-- Добавляем таблицы в Realtime
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table game_rooms;

-- ============================================
-- Настройка Row Level Security (RLS)
-- ============================================

-- Включаем RLS для таблиц
alter table game_rooms enable row level security;
alter table players enable row level security;

-- Удаляем старые политики если есть
drop policy if exists "Enable all access for game_rooms" on game_rooms;
drop policy if exists "Enable all access for players" on players;

-- Политики для game_rooms - разрешаем всё
create policy "Enable all access for game_rooms" on game_rooms
  for all
  using (true)
  with check (true);

-- Политики для players - разрешаем всё
create policy "Enable all access for players" on players
  for all
  using (true)
  with check (true);

-- ============================================
-- Функция для автоматического обновления updated_at
-- ============================================

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Удаляем старый триггер если есть
drop trigger if exists update_game_rooms_updated_at on game_rooms;

-- Создаём триггер
create trigger update_game_rooms_updated_at
  before update on game_rooms
  for each row
  execute function update_updated_at_column();

-- ============================================
-- Готово! Теперь мультиплеер должен работать
-- ============================================

-- Проверка: выводим список таблиц
select '✅ Таблицы созданы успешно' as status;
select tablename from pg_tables where schemaname = 'public' and tablename in ('game_rooms', 'players');

-- Проверка: выводим статус Realtime
select '✅ Realtime включён для таблиц:' as status;
select tablename from pg_publication_tables where pubname = 'supabase_realtime' and tablename in ('game_rooms', 'players');
