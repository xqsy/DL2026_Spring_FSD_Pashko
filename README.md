# 🌍 GeoHoot — Географическая викторина

Интерактивное веб-приложение для проверки знаний географии в игровой форме. Пользователь угадывает местоположение стран, городов и достопримечательностей на карте мира.

## 🎮 Возможности

- **Интерактивная карта** — кликайте на карту, чтобы отметить ответ
- **Система очков** — чем ближе к правильному месту, тем больше очков
- **Режимы игры** — 10 вопросов или бесконечный режим
- **Категории** — столицы, достопримечательности, города, страны
- **Подсказки** — помощь при затруднении (-100 очков)
- **Таблица лидеров** — соревнование с другими игроками

## 🛠 Технологии

| Компонент | Технология |
|-----------|------------|
| Framework | SvelteKit 2.x |
| Map | Leaflet |
| Database | SQLite + Prisma 7 (`@prisma/adapter-libsql`) |
| Styling | TailwindCSS 4 |
| Build | Vite |

## 📦 Установка

```bash
# Клонировать репозиторий
git clone <repo-url>

# Перейти в папку проекта
cd DL2026_Spring_FSD_Pashko

# Установить зависимости
npm install

# Настроить переменные окружения (SQLite)
# PowerShell (Windows)
Copy-Item .env.example .env

# Bash (macOS/Linux/Git Bash)
cp .env.example .env

# Сгенерировать Prisma клиент
npx prisma generate

# Применить миграции (создаст файл БД sqlite при первом запуске)
npx prisma migrate dev

# Заполнить базу вопросов
npx tsx prisma/seed.ts

# Запустить dev-сервер
npm run dev
```

## 🚀 Запуск

```bash
# Режим разработки
npm run dev

# Продакшн сборка
npm run build
npm run preview
```

## � Документация

- **Проектирование и анализ**: `docs/design.md`
- **Рефлексия по использованию AI**: `docs/AI_REFLECTION.md`

## �📁 Структура проекта

```
geohoot/
├── docs/
│   ├── design.md           # Документация проектирования
│   └── AI_REFLECTION.md    # Рефлексия по использованию AI
├── prisma/
│   ├── schema.prisma       # Схема базы данных
│   └── seed.ts             # Начальные данные
├── src/
│   ├── lib/
│   │   ├── components/     # Svelte компоненты
│   │   ├── stores/         # Состояние игры
│   │   └── server/         # Server-side утилиты
│   └── routes/
│       ├── api/            # API endpoints
│       ├── play/           # Игровая страница
│       ├── results/        # Результаты
│       └── leaderboard/    # Таблица лидеров
└── README.md
```

## 🎯 API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/questions/random` | Случайный вопрос |
| POST | `/api/sessions` | Создать игровую сессию |
| POST | `/api/answers` | Отправить ответ |
| GET | `/api/leaderboard` | Таблица лидеров |
| POST | `/api/leaderboard` | Сохранить результат |

Подробное описание всех endpoint’ов (включая admin/suggestions/countries) — в `docs/design.md`.

## 📊 Алгоритм очков

- **Максимум**: 1000 очков за точное попадание
- **Штраф**: -1 очко за каждый км от цели
- **Подсказка**: -100 очков