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
- [ ] Описать основной игровой сценарий (запуск → вопрос → клик → результат → следующий)
- [ ] Описать сценарий выбора режима (10 вопросов / бесконечный)
- [ ] Описать сценарий использования подсказок
- [ ] Описать сценарий таблицы лидеров

### 1.2 API Endpoints
- [ ] `GET /api/questions` — список вопросов (с пагинацией)
- [ ] `GET /api/questions/random` — случайный вопрос
- [ ] `POST /api/answers` — отправка ответа, возврат очков
- [ ] `GET /api/leaderboard` — топ игроков
- [ ] `POST /api/sessions` — создание игровой сессии
- [ ] `PATCH /api/sessions/:id` — обновление результата сессии

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
- [ ] Создать SvelteKit проект: `npm create svelte@latest geohoot`
- [ ] Установить зависимости: TailwindCSS, Prisma, Leaflet
- [ ] Настроить TailwindCSS
- [ ] Настроить Prisma с SQLite
- [ ] Создать структуру папок

### Этап 2.2: База данных
- [ ] Создать schema.prisma с моделями
- [ ] Написать миграции
- [ ] Создать seed-скрипт с 20+ вопросами (столицы, достопримечательности)
- [ ] Протестировать БД

### Этап 2.3: Backend (Server Routes)
- [ ] `/src/routes/api/questions/+server.ts` — CRUD вопросов
- [ ] `/src/routes/api/questions/random/+server.ts` — случайный вопрос
- [ ] `/src/routes/api/answers/+server.ts` — обработка ответа
- [ ] `/src/routes/api/leaderboard/+server.ts` — таблица лидеров
- [ ] `/src/routes/api/sessions/+server.ts` — игровые сессии

### Этап 2.4: Frontend компоненты

**Базовые компоненты:**
- [ ] `Map.svelte` — интерактивная карта с Leaflet
- [ ] `QuestionCard.svelte` — панель с текстом вопроса
- [ ] `ScoreDisplay.svelte` — отображение очков за ответ
- [ ] `Timer.svelte` — таймер с обратным отсчётом
- [ ] `ProgressBar.svelte` — прогресс в серии вопросов
- [ ] `Leaderboard.svelte` — таблица лидеров

**Страницы:**
- [ ] `/` — главная страница с описанием и кнопкой "Играть"
- [ ] `/play` — игровой экран (карта + вопрос + UI)
- [ ] `/play/config` — выбор режима и настроек
- [ ] `/results` — результаты игры
- [ ] `/leaderboard` — таблица лидеров

### Этап 2.5: Игровая логика
- [ ] Состояние игры (stores): текущий вопрос, очки, прогресс
- [ ] Обработка клика по карте
- [ ] Расчёт расстояния и очков (Haversine)
- [ ] Визуализация правильного ответа (маркер + линия)
- [ ] Переход к следующему вопросу
- [ ] Завершение игры и сохранение результата

### Этап 2.6: UI/UX
- [ ] Анимация попадания (пульсация маркера)
- [ ] Анимация линии от клика до правильного места
- [ ] Звуковые эффекты (опционально)
- [ ] Адаптивный дизайн (мобильные устройства)
- [ ] Тёмная/светлая тема

### Этап 2.7: Дополнительные фичи
- [ ] Таймер на вопрос (опционально)
- [ ] Подсказки (показать континент/страну)
- [ ] Категории вопросов (фильтр)
- [ ] Имя игрока для таблицы лидеров

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
