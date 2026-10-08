-- ============================================
-- SQL скрипт для настройки мультиплеера Тетрис
-- Выполните этот скрипт в Supabase SQL Editor
-- ============================================

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

-- Включить Realtime для таблицы players
alter publication supabase_realtime add table players;

-- Функция для автоматического обновления updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Триггер для game_rooms
create trigger update_game_rooms_updated_at
  before update on game_rooms
  for each row
  execute function update_updated_at_column();

-- ============================================
-- Настройка Row Level Security (RLS)
-- ============================================

-- Включаем RLS для таблиц
alter table game_rooms enable row level security;
alter table players enable row level security;

-- Политики для game_rooms
create policy "Enable read access for all users" on game_rooms
  for select using (true);

create policy "Enable insert access for all users" on game_rooms
  for insert with check (true);

create policy "Enable update access for all users" on game_rooms
  for update using (true);

create policy "Enable delete access for all users" on game_rooms
  for delete using (true);

-- Политики для players
create policy "Enable read access for all users" on players
  for select using (true);

create policy "Enable insert access for all users" on players
  for insert with check (true);

create policy "Enable update access for all users" on players
  for update using (true);

create policy "Enable delete access for all users" on players
  for delete using (true);

-- ============================================
-- Готово! Теперь мультиплеер должен работать
-- ============================================
