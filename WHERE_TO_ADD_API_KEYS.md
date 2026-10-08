# 🔑 Куда вводить API ключи Supabase

## 📁 У вас уже есть файл с ключами

В корне проекта есть файл **`.env.local`** со следующими значениями:

```
VITE_SUPABASE_URL=https://rzuxumehpmonbencsyxl.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_62JP-XZpECQqxB_Iixhdvg_xHvKLtp1
```

Этот файл используется **только для локальной разработки** и НЕ загружается в Git (для безопасности).

---

## 🌐 Куда вводить ключи для Vercel

### Пошаговая инструкция:

### Шаг 1: Откройте настройки проекта на Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите в аккаунт
3. Нажмите на ваш проект
4. Вверху найдите вкладку **Settings** (Настройки)

```
┌─────────────────────────────────────────────────────────┐
│  Overview  Deployments  Analytics  Settings  Activity  │
│                                          ↑             │
│                                     НАЖМИТЕ СЮДА      │
└─────────────────────────────────────────────────────────┘
```

### Шаг 2: Перейдите в Environment Variables

В левом меню найдите раздел **Environment Variables**:

```
┌──────────────────────────────┐
│  Settings                    │
│  ├─ General                  │
│  ├─ Domains                  │
│  ├─ Git                      │
│  ├─ Environment Variables  ← НАЖМИТЕ СЮДА
│  ├─ Serverless Functions     │
│  └─ ...                      │
└──────────────────────────────┘
```

### Шаг 3: Добавьте первую переменную

1. Нажмите кнопку **Add** (Добавить)
2. Заполните поля:

```
┌─────────────────────────────────────────────────────┐
│  Add Environment Variable                           │
│                                                     │
│  Key:   [VITE_SUPABASE_URL                    ]    │
│         ↑                                           │
│    Введите точно это имя                            │
│                                                     │
│  Value: [https://rzuxumehpmonbencsyxl.supabase.co] │
│         ↑                                           │
│    Вставьте ваш URL                                 │
│                                                     │
│  Environment:                                       │
│  ☑ Production   ← ОБЯЗАТЕЛЬНО отметьте             │
│  ☑ Preview      ← Отметьте                         │
│  ☑ Development  ← Отметьте                         │
│                                                     │
│              [ Add Variable ]                       │
└─────────────────────────────────────────────────────┘
```

### Шаг 4: Добавьте вторую переменную

Повторите процедуру:

1. Снова нажмите **Add**
2. Заполните поля:

```
┌──────────────────────────────────────────────────────────┐
│  Add Environment Variable                                │
│                                                          │
│  Key:   [VITE_SUPABASE_ANON_KEY                    ]    │
│         ↑                                                │
│    Введите точно это имя                                 │
│                                                          │
│  Value: [sb_publishable_62JP-XZpECQqxB_Iixhdvg_xHvKLtp1]│
│         ↑                                                │
│    Вставьте ваш ключ                                     │
│                                                          │
│  Environment:                                            │
│  ☑ Production   ← ОБЯЗАТЕЛЬНО отметьте                  │
│  ☑ Preview      ← Отметьте                              │
│  ☑ Development  ← Отметьте                              │
│                                                          │
│              [ Add Variable ]                            │
└──────────────────────────────────────────────────────────┘
```

### Шаг 5: Пересоберите проект (Redeploy)

После добавления переменных:

1. Перейдите в вкладку **Deployments**
2. Найдите самый верхний (последний) деплой
3. Справа от него нажмите **⋮** (три точки)
4. Выберите **Redeploy**
5. Подтвердите действие

```
┌──────────────────────────────────────────────────────┐
│  Deployments                                         │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ Production Deployment                          │ │
│  │                                                │ │
│  │ 2 hours ago  ·  1 commit                       │ │
│  │                                                │ │
│  │                          [⋮] ← НАЖМИТЕ СЮДА   │ │
│  │                           │                    │ │
│  │                           ├─ Inspect           │ │
│  │                           ├─ Promote           │ │
│  │                           └─ Redeploy ← ВЫБЕРИТЕ│ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## ✅ Как проверить что всё работает

### Проверка на Vercel:

1. Откройте ваш сайт на Vercel
2. Нажмите **F12** (откроется DevTools)
3. Перейдите во вкладку **Console**
4. Введите команду:

```javascript
import.meta.env.VITE_SUPABASE_URL
```

5. Должно вывести: `https://rzuxumehpmonbencsyxl.supabase.co`

Если выводит `undefined` → переменные не добавлены или не применились.

### Проверка в коде:

Откройте файл `src/hooks/useMultiplayer.ts` и найдите строки:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

Эти строки читают переменные окружения.

---

## 🎯 Итого: что нужно сделать

### Для локальной разработки (на вашем компьютере):
✅ Файл `.env.local` уже создан с ключами - ничего делать не нужно

### Для Vercel (продакшен):
1. ✅ Добавить `VITE_SUPABASE_URL` в Environment Variables
2. ✅ Добавить `VITE_SUPABASE_ANON_KEY` в Environment Variables
3. ✅ Отметить все три окружения (Production, Preview, Development)
4. ✅ Сделать Redeploy

---

## 📸 Где найти ключи в Supabase

Если нужно скопировать ключи заново:

1. Откройте [supabase.com](https://supabase.com)
2. Выберите ваш проект `rzuxumehpmonbencsyxl`
3. В левом меню нажмите **Settings** (иконка шестерёнки ⚙️)
4. Нажмите **API**

```
┌──────────────────────────────┐
│  Settings                    │
│  ├─ General                  │
│  ├─ API                   ← НАЖМИТЕ СЮДА
│  ├─ Database                 │
│  ├─ Authentication           │
│  └─ ...                      │
└──────────────────────────────┘
```

5. Найдите раздел **Project API keys**

```
┌─────────────────────────────────────────────────────┐
│  Project API keys                                   │
│                                                     │
│  Project URL:                                       │
│  [https://rzuxumehpmonbencsyxl.supabase.co] [Copy] │
│                                                     │
│  anon public key:                                   │
│  [sb_publishable_62JP-XZpECQqxB_Iixhdvg_xHvKLtp1] │
│  [Copy]                                             │
└─────────────────────────────────────────────────────┘
```

6. Скопируйте оба значения

---

## ⚠️ Важно

- **НЕ загружайте** `.env.local` в Git (он уже в `.gitignore`)
- Ключи на Vercel хранятся безопасно и шифруются
- После изменения переменных **всегда** делайте Redeploy
- Переменные должны начинаться с `VITE_` чтобы быть доступными в коде

---

## 🆘 Если не работает

### Проблема: Пустая страница после Redeploy

**Решение:**
1. Проверьте что отметили все три окружения (Production, Preview, Development)
2. Убедитесь что имена переменных точно совпадают:
   - `VITE_SUPABASE_URL` (не `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (не `SUPABASE_KEY`)
3. Проверьте что нет лишних пробелов в начале/конце значений
4. Сделайте Redeploy ещё раз

### Проблема: Ошибка "Supabase не настроен" в консоли

**Решение:**
1. Переменные не применились
2. Сделайте Redeploy
3. Подождите 2-3 минуты
4. Обновите страницу с очисткой кэша (Ctrl+Shift+R)

---

Удачи! 🚀
