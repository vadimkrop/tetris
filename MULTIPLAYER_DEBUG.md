# 🔧 Диагностика проблемы с мультиплеером

## Проблема: "Комната не найдена"

Вы видите ошибку "Комната не найдена", хотя комнаты создаются в Supabase.

---

## ✅ Шаг 1: Выполните обновлённый SQL скрипт

**ВАЖНО:** Нужно выполнить скрипт заново! Я обновил его.

1. Откройте [supabase.com](https://supabase.com) → ваш проект
2. Перейдите в **SQL Editor**
3. Создайте **New query**
4. Скопируйте **ВЕСЬ** содержимое файла `supabase-schema.sql`
5. Вставьте и нажмите **Run**

**Что делает новый скрипт:**
- ✅ Удаляет старые таблицы
- ✅ Создаёт новые таблицы
- ✅ Включает Realtime для **ОБЕИХ** таблиц (game_rooms И players)
- ✅ Настраивает RLS политики (разрешает всё)
- ✅ Создаёт индексы для быстрого поиска

---

## 🔍 Шаг 2: Проверьте что Realtime включён

В Supabase выполните этот SQL запрос:

```sql
-- Проверяем что Realtime включён для таблиц
select tablename 
from pg_publication_tables 
where pubname = 'supabase_realtime' 
and tablename in ('game_rooms', 'players');
```

**Должно вывести:**
```
tablename
-----------
game_rooms
players
```

Если выводит только одну таблицу или ничего → Realtime не включён правильно.

**Решение:** Выполните SQL скрипт из `supabase-schema.sql` заново.

---

## 🧪 Шаг 3: Тестовый запрос в Supabase

Выполните этот SQL чтобы проверить что поиск работает:

```sql
-- Создаём тестовую комнату
insert into game_rooms (code, status) 
values ('TEST-123', 'waiting')
returning *;

-- Ищем её
select * from game_rooms where code = 'TEST-123';

-- Удаляем тестовую комнату
delete from game_rooms where code = 'TEST-123';
```

**Если поиск работает** → проблема в коде приложения
**Если поиск не работает** → проблема в RLS или индексах

---

## 🌐 Шаг 4: Проверьте консоль браузера

1. Откройте ваш сайт на Vercel
2. Нажмите **F12** → вкладка **Console**
3. Попробуйте создать комнату
4. Посмотрите логи:

**Должно быть:**
```
✅ Supabase настроен: https://rzuxumehpmonbencsyxl.supabase.co
🏠 Создаю комнату с кодом: TETRIS-XXXXX
✅ Комната создана: {id: "...", code: "TETRIS-XXXXX", ...}
✅ Игрок создан: {id: "...", ...}
📡 Подписка на комнату ...
```

5. Теперь на втором устройстве попробуйте присоединиться
6. Посмотрите логи:

**Должно быть:**
```
🔗 Ищу комнату с кодом: TETRIS-XXXXX
📋 Все комнаты с таким кодом: [...]
✅ Найдена комната: {...}
```

**Если видите ошибку** → пришлите скриншот консоли

---

## 🎯 Шаг 5: Проверьте код комнаты

**Частые ошибки:**

### Проблема 1: Пробелы в коде
- ❌ `TETRIS-ABC12 ` (пробел в конце)
- ✅ `TETRIS-ABC12`

**Решение:** Код автоматически очищается от пробелов в коде.

### Проблема 2: Разный регистр
- ❌ Хост создал `TETRIS-abc12`
- ❌ Игрок ввёл `TETRIS-ABC12`

**Решение:** Код автоматически приводится к верхнему регистру.

### Проблема 3: Неправильный код
- Убедитесь что копируете код **точно** как показано

---

## 🔬 Шаг 6: Проверьте RLS политики

Выполните в Supabase SQL Editor:

```sql
-- Проверяем политики для game_rooms
select * from pg_policies where tablename = 'game_rooms';

-- Проверяем политики для players
select * from pg_policies where tablename = 'players';
```

**Должно вывести политики с `using: true` и `with check: true`**

Если политик нет или они другие → выполните SQL скрипт заново.

---

## 🚀 Шаг 7: Быстрый тест

### Тест 1: Создайте комнату вручную в Supabase

1. Откройте **Table Editor** → `game_rooms`
2. Нажмите **Insert** → **New row**
3. Заполните:
   - `code`: `MANUAL-TEST`
   - `status`: `waiting`
4. Нажмите **Save**

### Тест 2: Попробуйте присоединиться

1. Откройте сайт
2. Нажмите **🎮 Мультиплеер** → **🔗 Присоединиться**
3. Введите код: `MANUAL-TEST`
4. Нажмите **Присоединиться**

**Если работает** → проблема в создании комнаты из кода
**Если не работает** → проблема в поиске комнаты

---

## 📊 Шаг 8: Проверьте логи Supabase

1. Откройте [supabase.com](https://supabase.com) → ваш проект
2. Перейдите в **Logs** → **API**
3. Попробуйте создать/присоединиться к комнате
4. Посмотрите запросы

**Ищите:**
- Запросы к `game_rooms` с `select`
- Ошибки `403 Forbidden` (проблема с RLS)
- Ошибки `404 Not Found` (комната не найдена)

---

## 🆘 Если ничего не помогло

### Проверка 1: Очистите кэш браузера

```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```

Выберите:
- ✅ Cached images and files
- ✅ Cookies and other site data

### Проверка 2: Попробуйте в режиме инкогнито

Откройте сайт в режиме инкогнито и попробуйте снова.

### Проверка 3: Проверьте переменные окружения

В консоли браузера выполните:

```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Должно вывести:**
```
URL: https://rzuxumehpmonbencsyxl.supabase.co
Key: sb_publishable_62JP-XZpECQqxB_Iixhdvg_xHvKLtp1
```

Если выводит `undefined` → переменные не добавлены на Vercel.

---

## 📋 Чек-лист

- [ ] Выполнен обновлённый SQL скрипт `supabase-schema.sql`
- [ ] Realtime включён для **ОБЕИХ** таблиц (game_rooms и players)
- [ ] RLS политики настроены (разрешают всё)
- [ ] Переменные окружения добавлены на Vercel
- [ ] Сделан Redeploy после добавления переменных
- [ ] Консоль браузера показывает логи (✅ Комната создана)
- [ ] Код комнаты вводится точно (без пробелов, правильный регистр)

---

## 💡 Самое важное

**Если комнаты создаются в БД, но не находятся:**

99% что проблема в **Realtime** или **RLS**.

**Решение:**
1. Выполните SQL скрипт `supabase-schema.sql` **заново**
2. Проверьте что Realtime включён для **ОБЕИХ** таблиц
3. Проверьте что RLS политики разрешают всё

---

## 🎯 Быстрое решение

Если не хотите разбираться, выполните эти шаги:

```sql
-- 1. В Supabase SQL Editor выполните:

-- Удаляем старые таблицы
drop table if exists players;
drop table if exists game_rooms;

-- Создаём таблицы заново
create table game_rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  status text default 'waiting',
  created_at timestamp with time zone default now()
);

create table players (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references game_rooms(id) on delete cascade,
  player_number integer,
  score integer default 0,
  lines integer default 0,
  level integer default 1,
  board_state jsonb default '[]'::jsonb,
  is_alive boolean default true,
  next_piece text,
  last_update timestamp with time zone default now()
);

-- Включаем Realtime
alter publication supabase_realtime add table game_rooms;
alter publication supabase_realtime add table players;

-- Отключаем RLS (для простоты)
alter table game_rooms disable row level security;
alter table players disable row level security;
```

**Это создаст таблицы заново и отключит RLS** (самый простой вариант).

После этого попробуйте создать и присоединиться к комнате снова.

---

Удачи! 🚀
