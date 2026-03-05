# План разработки: Географическая викторина (GeoHoot)

План разработки fullstack приложения — интерактивной географической викторины на SvelteKit.

---

## Стек технологий

| Компонент | Технология | Обоснование |
|-----------|------------|-------------|
| Framework | SvelteKit | Fullstack, SSR, server routes, компактность |
| Map | Leaflet + svelte-leaflet | Бесплатный, лёгкий, проверенный |
| Database | SQLite + Prisma | Простота для демо, лёгкая миграция на PostgreSQL |
| Styling | TailwindCSS | Быстрая разработка UI |
| Build | Vite (встроен в SvelteKit) | Быстрая сборка |

---

## Часть 1: Проектирование (docs/design.md)

### 1.1 Сценарии использования
- [x] Описать основной игровой сценарий (запуск → вопрос → клик → результат → следующий)
- [x] Описать сценарий выбора режима (10 вопросов / бесконечный)
- [x] Описать сценарий использования подсказок
- [x] Описать сценарий таблицы лидеров

### 1.2 API Endpoints
- [x] `GET /api/questions` — список вопросов (с пагинацией)
- [x] `GET /api/questions/random` — случайный вопрос
- [x] `POST /api/answers` — отправка ответа, возврат очков
- [x] `GET /api/leaderboard` — топ игроков
- [x] `POST /api/sessions` — создание игровой сессии
- [x] `PATCH /api/sessions/:id` — обновление результата сессии

### 1.3 Модель данных
```
Question:
  - id: string
  - text: string (название объекта)
  - correctLat: float
  - correctLng: float
  - category: enum (capital, landmark, city, country)
  - difficulty: int (1-3)
  - hint: string (опционально)

GameSession:
  - id: string
  - mode: enum (fixed10, endless)
  - score: int
  - questionsAnswered: int
  - createdAt: datetime

Answer:
  - id: string
  - sessionId: string
  - questionId: string
  - clickedLat: float
  - clickedLng: float
  - distanceKm: float
  - points: int
  - createdAt: datetime

LeaderboardEntry:
  - id: string
  - playerName: string
  - score: int
  - mode: enum
  - createdAt: datetime
```

### 1.4 Алгоритм подсчёта очков
- Расчёт расстояния по формуле Haversine
- Максимальные очки: 1000 за точное попадание
- Штраф: -1 очко за каждый км от цели
- Минимум: 0 очков

---

## Часть 2: Реализация

### Этап 2.1: Инициализация проекта
- [x] Создать SvelteKit проект: `npm create svelte@latest geohoot`
- [x] Установить зависимости: TailwindCSS, Prisma, Leaflet
- [x] Настроить TailwindCSS
- [x] Настроить Prisma с SQLite
- [x] Создать структуру папок

### Этап 2.2: База данных
- [x] Создать schema.prisma с моделями
- [x] Написать миграции
- [x] Создать seed-скрипт с 20+ вопросами (столицы, достопримечательности)
- [x] Протестировать БД

### Этап 2.3: Backend (Server Routes)
- [x] `/src/routes/api/questions/+server.ts` — CRUD вопросов
- [x] `/src/routes/api/questions/random/+server.ts` — случайный вопрос
- [x] `/src/routes/api/answers/+server.ts` — обработка ответа
- [x] `/src/routes/api/leaderboard/+server.ts` — таблица лидеров
- [x] `/src/routes/api/sessions/+server.ts` — игровые сессии

### Этап 2.4: Frontend компоненты

**Базовые компоненты:**
- [x] `GameMap.svelte` — интерактивная карта с Leaflet
- [x] `QuestionCard.svelte` — панель с текстом вопроса
- [x] `ScoreDisplay.svelte` — отображение очков за ответ
- [ ] `Timer.svelte` — таймер с обратным отсчётом (опционально)
- [x] `ProgressBar.svelte` — прогресс в серии вопросов
- [x] `Leaderboard.svelte` — таблица лидеров

**Страницы:**
- [x] `/` — главная страница с описанием и кнопкой "Играть"
- [x] `/play` — игровой экран (карта + вопрос + UI)
- [ ] `/play/config` — выбор режима и настроек (интегрировано в главную)
- [x] `/results` — результаты игры
- [x] `/leaderboard` — таблица лидеров

### Этап 2.5: Игровая логика
- [x] Состояние игры (stores): текущий вопрос, очки, прогресс
- [x] Обработка клика по карте
- [x] Расчёт расстояния и очков (Haversine)
- [x] Визуализация правильного ответа (маркер + линия)
- [x] Переход к следующему вопросу
- [x] Завершение игры и сохранение результата
- [x] Кнопка выхода из режима игры

### Этап 2.6: UI/UX
- [ ] Анимация попадания (пульсация маркера)
- [x] Анимация линии от клика до правильного места
- [ ] Звуковые эффекты (опционально)
- [x] Адаптивный дизайн (мобильные устройства)
- [ ] Тёмная/светлая тема

### Этап 2.7: Дополнительные фичи
- [ ] Таймер на вопрос (опционально)
- [x] Подсказки (показать континент/страну)
- [x] Категории вопросов (фильтр)
- [x] Имя игрока для таблицы лидеров

---

## Часть 3: Рефлексия (docs/AI_REFLECTION.md)

- [ ] Перечислить использованные AI-инструменты
- [ ] Привести примеры промптов
- [ ] Описать, где AI помог, а где ошибся
- [ ] Сформулировать выводы

---

## Структура проекта

```
geohoot/
├── docs/
│   ├── design.md
│   ├── AI_REFLECTION.md
│   └── images/
├── src/
│   ├── lib/
│   │   ├── components/       # Svelte компоненты
│   │   ├── stores/           # Svelte stores
│   │   ├── utils/            # Вспомогательные функции
│   │   └── server/           # Server-side утилиты
│   ├── routes/
│   │   ├── api/              # Server routes (API)
│   │   ├── play/             # Игровые страницы
│   │   ├── leaderboard/      # Таблица лидеров
│   │   └── +page.svelte      # Главная
│   └── app.html
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── static/
├── README.md
├── package.json
└── tailwind.config.js
```

---

## Очередность выполнения

1. **Инициализация** → проект, зависимости, структура
2. **База данных** → схема, миграции, seed
3. **Backend** → API endpoints
4. **Frontend базовый** → карта, компоненты
5. **Игровая логика** → stores, расчёты, переходы
6. **UI/UX** → анимации, стили, адаптивность
7. **Доп. фичи** → таймер, подсказки, категории
8. **Документация** → design.md, AI_REFLECTION.md, README.md
