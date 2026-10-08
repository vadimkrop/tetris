# 🚀 Инструкция по деплою на Vercel

## Проблема: Пустая страница после деплоя

Если после деплоя на Vercel вы видите пустую страницу, выполните следующие шаги:

---

## ✅ Решение

### 1. Проверьте переменные окружения на Vercel

**Где найти:**
1. Откройте [vercel.com](https://vercel.com)
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**

**Добавьте две переменные:**

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://rzuxumehpmonbencsyxl.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_62JP-XZpECQqxB_Iixhdvg_xHvKLtp1` |

**Важно:** Убедитесь что переменные добавлены для **Production**, **Preview** и **Development** окружений.

### 2. Redeploy проект

После добавления переменных:
1. Перейдите в **Deployments**
2. Найдите последний деплой
3. Нажмите **⋮** (три точки) справа
4. Выберите **Redeploy**
5. Подтвердите

### 3. Проверьте Supabase

**Убедитесь что выполнили SQL скрипт:**
1. Откройте [supabase.com](https://supabase.com) → ваш проект
2. Перейдите в **SQL Editor**
3. Выполните скрипт из файла `supabase-schema.sql`

**Проверьте что таблицы созданы:**
1. Перейдите в **Table Editor** в левом меню
2. Должны быть таблицы: `game_rooms` и `players`

---

## 🔍 Диагностика

### Проверка в консоли браузера

1. Откройте ваш сайт на Vercel
2. Нажмите **F12** (откроется DevTools)
3. Перейдите во вкладку **Console**
4. Проверьте ошибки:

**Если видите:**
```
Supabase не настроен. Мультиплеер будет недоступен.
```
→ Переменные окружения не добавлены или не применились. Сделайте Redeploy.

**Если видите:**
```
Failed to load resource: the server responded with a status of 404
```
→ Проблема с путями к файлам. Проверьте что `vercel.json` на месте.

**Если видите:**
```
relation "game_rooms" does not exist
```
→ Не выполнен SQL скрипт в Supabase.

---

## 📋 Чек-лист

- [ ] Переменные `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` добавлены на Vercel
- [ ] Сделан Redeploy после добавления переменных
- [ ] SQL скрипт выполнен в Supabase
- [ ] Таблицы `game_rooms` и `players` существуют в Supabase
- [ ] Realtime включён для таблицы `players` в Supabase
- [ ] Файл `vercel.json` находится в корне проекта
- [ ] Файл `.env.local` содержит правильные значения (для локальной разработки)

---

## 🎯 Быстрая проверка

### Локально (на вашем компьютере):

```bash
# 1. Убедитесь что .env.local существует
cat .env.local

# Должно вывести:
# VITE_SUPABASE_URL=https://rzuxumehpmonbencsyxl.supabase.co
# VITE_SUPABASE_ANON_KEY=sb_publishable_62JP-XZpECQqxB_Iixhdvg_xHvKLtp1

# 2. Запустите dev сервер
npm run dev

# 3. Откройте http://localhost:3000
# 4. Нажмите F12 → Console
# 5. НЕ должно быть ошибки "Supabase не настроен"
```

### На Vercel:

1. Откройте ваш сайт
2. Нажмите F12 → Console
3. Запустите в консоли:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```
4. Должно вывести: `https://rzuxumehpmonbencsyxl.supabase.co`

Если выводит `undefined` → переменные не добавлены или не применились.

---

## 🆘 Если ничего не помогло

### Проверьте логи деплоя на Vercel:

1. Перейдите в **Deployments**
2. Нажмите на последний деплой
3. Посмотрите **Build Logs**
4. Проверьте что:
   - `npm install` прошёл успешно
   - `npm run build` прошёл успешно
   - Нет ошибок TypeScript

### Проверьте настройки проекта на Vercel:

1. **Settings** → **General**
2. **Framework Preset** должен быть **Vite**
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

---

## 📞 Поддержка

Если проблема не решена:
1. Сделайте скриншот консоли браузера (F12 → Console)
2. Сделайте скриншот логов деплоя на Vercel
3. Проверьте что все файлы из чек-листа на месте

---

## ✅ Что должно работать после исправления

1. Сайт загружается (не пустая страница)
2. Игра работает в одиночном режиме
3. Кнопка "🎮 Мультиплеер" доступна
4. Можно создать комнату и получить код
5. Можно присоединиться по коду
6. Оба игрока видят друг друга в реальном времени

Удачи! 🚀
