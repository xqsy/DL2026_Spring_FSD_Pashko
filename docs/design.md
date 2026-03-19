# Проектирование: Географическая викторина (GeoHoot)

## 1. Описание проекта

GeoHoot — интерактивное веб-приложение для проверки знаний географии в игровой форме. Пользователь угадывает местоположение стран, городов и достопримечательностей на карте мира.

---

## Часть 1. Проектирование и анализ

### 1.1 Пользовательские сценарии (user story)

- **Игровая сессия**: Как игрок, я хочу получать вопрос и отмечать ответ кликом на карте, чтобы проверить знания географии и получить мгновенную оценку точности.
- **Выбор режима и тематики**: Как игрок, я хочу выбрать режим (например, 10 вопросов или бесконечный) и категорию вопросов, чтобы подстроить игру под своё настроение и уровень.
- **Сохранение результата**: Как игрок, я хочу сохранить итоговый результат в таблицу лидеров, чтобы сравнивать свои достижения с другими.

### 1.2 Функциональные требования

#### Обязательные

- **Frontend**
  - **Отображение карты**: интерактивная карта мира, возможность поставить маркер кликом.
  - **Игровой цикл**: старт/выбор режима, показ вопроса, отправка ответа, экран результата, переход к следующему вопросу.
  - **Отображение прогресса**: текущие очки, номер вопроса/прогресс для режима серии.
  - **Таблица лидеров**: просмотр топа, форма ввода имени игрока после завершения.
- **Backend**
  - **Выдача вопросов**: получение случайного вопроса с фильтрацией по категории и исключением уже заданных.
  - **Проверка ответа**: вычисление расстояния (Haversine) и начисление очков, возврат правильной точки.
  - **Игровые сессии**: создание/получение/завершение сессии и накопление результата.
  - **Лидеры**: сохранение и выдача топ-результатов по режиму/категории.

#### Опциональные

- **Frontend**
  - **Подсказки**: кнопка подсказки с штрафом к очкам.
  - **Таймер/анимации/темы**: таймер на вопрос, звуки, тёмная тема, PWA.
- **Backend**
  - **Анти-чит / rate limit**: ограничения частоты запросов для публичного API.
  - **Расширенная статистика**: хранение метрик по ответам, подбор сложности.

### 1.3 Проектирование API

Ниже приведены предполагаемые endpoint’ы вашего бэкенда: метод, путь, ожидаемые параметры запроса и формат ответа. Если API использует авторизацию, укажите это.

- **Вопросы**
  - **GET** `/api/questions/random`
    - **Query**: `category?`, `exclude?`
    - **Response**: объект вопроса (id, text, category, ...).
- **Ответ и оценка**
  - **POST** `/api/answers`
    - **Body**: `questionId`, `clickedLat`, `clickedLng`, `sessionId`
    - **Response**: `distanceKm`, `points`, `correctLat`, `correctLng`, `maxPoints`.
- **Сессии**
  - **POST** `/api/sessions` (создать)
  - **GET** `/api/sessions?id=[id]` (получить состояние)
- **Таблица лидеров**
  - **GET** `/api/leaderboard` (топ-10, фильтры по mode/category)
  - **POST** `/api/leaderboard` (добавить результат)
 - **Прочее (при необходимости)**
  - **POST** `/api/suggestions` (предложить вопрос)
  - **POST** `/api/admin/login` (вход администратора)

**Авторизация**: на базовом уровне не требуется (публичная викторина). При необходимости можно добавить капчу/rate limit или пользовательские аккаунты как расширение.

### 1.4 Модель данных

Хранение предполагается в БД через Prisma (схема — в разделе **4. Модель данных**). Ключевые сущности:

- **Question**
  - **Поля**: `id: string`, `text: string`, `correctLat: number`, `correctLng: number`, `category: enum`, `difficulty: number`, `hint?: string`, `createdAt: datetime`.
- **GameSession**
  - **Поля**: `id: string`, `mode: enum`, `category?: enum`, `score: number`, `questionsTotal: number`, `questionsAnswered: number`, `isCompleted: boolean`, `createdAt: datetime`, `completedAt?: datetime`.
- **Answer**
  - **Поля**: `id: string`, `sessionId: string`, `questionId: string`, `clickedLat: number`, `clickedLng: number`, `distanceKm: number`, `points: number`, `usedHint: boolean`, `createdAt: datetime`.
- **LeaderboardEntry**
  - **Поля**: `id: string`, `playerName: string`, `score: number`, `mode: enum`, `category?: enum`, `sessionId?: string`, `createdAt: datetime`.

### 1.5 Ключевые технические решения

- **Frontend framework**: SvelteKit — быстрый DX, удобная маршрутизация, SSR при необходимости и простая интеграция API-роутов.
- **Карта**: Leaflet (динамический импорт на клиенте) — зрелая библиотека, простая работа с маркерами/оверлеями; тайлы можно брать из OSM/CARTO.
- **База и ORM**: Prisma 7 + SQLite с `@prisma/adapter-libsql` — быстрый старт и предсказуемое локальное хранилище; Prisma даёт типобезопасность и удобные миграции.
- **Стили**: TailwindCSS — быстрый итеративный UI без разрастания CSS.
- **Алгоритмы**: Haversine для расстояния и простая линейная формула очков (см. раздел **5. Алгоритм подсчёта очков**).

---

## 2. Сценарии использования

### 2.1 Основной игровой сценарий

```
1. Игрок открывает приложение → видит приветственный экран с кнопкой "Играть"
2. Выбирает режим игры (10 вопросов / бесконечный)
3. Видит вопрос (например, "Где находится Эйфелева башня?") и карту мира
4. Кликает в предполагаемое место на карте
5. Получает мгновенную обратную связь:
   - Очки за ответ (зависят от точности)
   - Визуальное указание правильного места (маркер + линия)
6. Переходит к следующему вопросу
7. По завершении видит итоговый результат
```

### 2.2 Сценарий выбора режима

```
1. На стартовом экране игрок выбирает режим:
   - "Серия 10" — 10 вопросов, подсчёт суммы очков
   - "Бесконечный" — игра до первого промаха или по желанию игрока
2. Опционально выбирает категорию:
   - Столицы
   - Достопримечательности
   - Города
   - Смешанный
```

### 2.3 Сценарий использования подсказок

```
1. При затруднении игрок нажимает кнопку "Подсказка"
2. Система показывает континент или страну, где находится объект
3. Стоимость подсказки: -100 очков от текущего результата вопроса
```

### 2.4 Сценарий таблицы лидеров

```
1. После завершения игры игрок вводит своё имя
2. Результат сохраняется в таблицу лидеров
3. Игрок может просмотреть таблицу лидеров на отдельной странице
4. Таблица показывает топ-10 результатов по каждому режиму
```

---

## 3. API Endpoints

### 3.1 Вопросы

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/questions/random` | Получить случайный вопрос |
| GET | `/api/questions/random?category=CAPITAL&exclude=1,2,3` | Случайный вопрос с фильтрами |

### 3.2 Ответы и оценка

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/answers` | Отправить ответ и получить оценку |

**Request body:**
```json
{
  "questionId": "clx123...",
  "clickedLat": 48.8584,
  "clickedLng": 2.2945,
  "sessionId": "sess123..."
}
```

**Response:**
```json
{
  "distanceKm": 0.5,
  "points": 995,
  "correctLat": 48.8584,
  "correctLng": 2.2945,
  "maxPoints": 1000
}
```

### 3.3 Игровые сессии

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/sessions` | Создать новую игровую сессию |
| GET | `/api/sessions?id=[id]` | Получить состояние сессии |

**Request body (создание):**
```json
{
  "mode": "FIXED_10",
  "category": "CAPITAL"
}
```

### 3.4 Таблица лидеров

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/leaderboard` | Топ-10 результатов |
| GET | `/api/leaderboard?mode=FIXED_10` | Топ по режиму |
| POST | `/api/leaderboard` | Добавить результат |

### 3.5 Дополнительные endpoints (реализовано в репозитории)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/countries` | Список стран |
| GET | `/api/countries/border?code=XX` | GeoJSON границы страны |
| POST | `/api/suggestions` | Предложить новый вопрос (модерация) |
| POST | `/api/admin/login` | Вход администратора |
| POST | `/api/admin/logout` | Выход администратора |
| GET/POST | `/api/admin/questions` | Управление вопросами |
| GET/PATCH | `/api/admin/suggestions` | Модерация предложений |

---

## 4. Модель данных

### 4.1 Схема Prisma

```prisma
enum GameMode {
  FIXED_10
  ENDLESS
}

enum QuestionCategory {
  CAPITAL
  LANDMARK
  CITY
  COUNTRY
}

enum SuggestionStatus {
  PENDING
  APPROVED
  REJECTED
}

model Question {
  id          String           @id @default(cuid())
  text        String           // "Где находится Эйфелева башня?"
  correctLat  Float            // Широта
  correctLng  Float            // Долгота
  category    QuestionCategory
  difficulty  Int              @default(1) // 1-3
  hint        String?          // "Находится в Европе"
  createdAt   DateTime         @default(now())
  answers     Answer[]
  
  @@index([category])
}

model GameSession {
  id               String      @id @default(cuid())
  mode             GameMode
  category         QuestionCategory?
  score            Int         @default(0)
  questionsTotal   Int         @default(10)
  questionsAnswered Int        @default(0)
  isCompleted      Boolean     @default(false)
  createdAt        DateTime    @default(now())
  completedAt      DateTime?
  answers          Answer[]
  
  @@index([isCompleted, score])
}

model Answer {
  id          String      @id @default(cuid())
  sessionId   String
  session     GameSession @relation(fields: [sessionId], references: [id])
  questionId  String
  question    Question    @relation(fields: [questionId], references: [id])
  clickedLat  Float
  clickedLng  Float
  distanceKm  Float
  points      Int
  usedHint    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  
  @@index([sessionId])
}

model LeaderboardEntry {
  id          String      @id @default(cuid())
  playerName  String
  score       Int
  mode        GameMode
  category    QuestionCategory?
  sessionId   String?     @unique
  createdAt   DateTime    @default(now())
  
  @@index([mode, score])
}

model QuestionSuggestion {
  id            String           @id @default(cuid())
  questionText  String
  lat           Float
  lng           Float
  country       String?
  city          String?
  status        SuggestionStatus @default(PENDING)
  adminNote     String?
  createdAt     DateTime         @default(now())
  reviewedAt    DateTime?
  approvedAt    DateTime?
  rejectedAt    DateTime?
  approvedBy    String?
  rejectedBy    String?
  createdQuestionId String?

  @@index([status, createdAt])
}
```

---

## 5. Алгоритм подсчёта очков

### 5.1 Формула расчёта расстояния

Используется формула Haversine для расчёта расстояния между двумя точками на сфере:

```typescript
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
```

### 5.2 Расчёт очков

```typescript
function calculatePoints(distanceKm: number, usedHint: boolean): number {
  const MAX_POINTS = 1000;
  const POINTS_PER_KM = 1;
  const HINT_PENALTY = 100;
  
  let points = Math.max(0, MAX_POINTS - Math.floor(distanceKm * POINTS_PER_KM));
  
  if (usedHint) {
    points = Math.max(0, points - HINT_PENALTY);
  }
  
  return points;
}
```

**Примеры:**
- Точное попадание (0 км): 1000 очков
- 50 км от цели: 950 очков
- 500 км от цели: 500 очков
- 1000+ км от цели: 0 очков
- С подсказкой: -100 очков

---

## 6. Технический стек

| Компонент | Технология | Версия |
|-----------|------------|--------|
| Framework | SvelteKit | 2.50.x |
| Map Library | Leaflet | 1.9.x |
| Database | SQLite + libSQL adapter | - |
| ORM | Prisma | 7.4.x |
| Styling | TailwindCSS | 4.2.x |
| Build Tool | Vite | 7.3.x |

---

## 7. Структура проекта

```
geohoot/
├── docs/
│   ├── design.md           # Этот документ
│   ├── AI_REFLECTION.md    # Рефлексия по использованию AI
│   └── images/             # Скриншоты
├── prisma/
│   ├── schema.prisma       # Схема БД
│   └── seed.ts             # Начальные данные
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── GameMap.svelte
│   │   │   ├── QuestionCard.svelte
│   │   │   ├── ScoreDisplay.svelte
│   │   │   ├── ProgressBar.svelte
│   │   │   └── Leaderboard.svelte
│   │   ├── stores/
│   │   │   └── game.ts
│   │   ├── utils/
│   │   │   ├── haversine.ts
│   │   │   └── scoring.ts
│   │   └── server/
│   │       └── db.ts
│   ├── routes/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── answers/
│   │   │   ├── countries/
│   │   │   ├── leaderboard/
│   │   │   ├── questions/
│   │   │   ├── sessions/
│   │   │   └── suggestions/
│   │   ├── play/
│   │   │   └── +page.svelte
│   │   ├── leaderboard/
│   │   │   └── +page.svelte
│   │   ├── results/
│   │   │   └── +page.svelte
│   │   └── +page.svelte
│   └── app.html
├── static/
├── README.md
├── package.json
├── svelte.config.js
├── tailwind.config.js
└── vite.config.ts
```

---

## 8. UI/UX решения

### 8.1 Игровой экран

```
┌─────────────────────────────────────────────────┐
│  [Logo]  GeoHoot         [Очки: 850]  [5/10]   │
├─────────────────────────────────────────────────┤
│                                                 │
│   Вопрос: Где находится Эйфелева башня?        │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │           ИНТЕРАКТИВНАЯ КАРТА           │   │
│  │              (Leaflet)                 │   │
│  │                                         │   │
│  │    [Клик пользователя → маркер]         │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  [Подсказка]              [Ответить]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 8.2 Экран результата ответа

```
┌─────────────────────────────────────────────────┐
│  ✓ Отлично!                                     │
│                                                 │
│  Очки за ответ: 995                             │
│  Расстояние: 0.5 км                             │
│                                                 │
│  [Карта с линией от клика до правильного места] │
│                                                 │
│              [Следующий вопрос →]               │
└─────────────────────────────────────────────────┘
```

### 8.3 Анимации

- **Попадание**: Пульсация маркера при клике
- **Результат**: Анимированная линия от клика до правильного места
- **Очки**: Счётчик с эффектом "накрутки" чисел
- **Переходы**: Fade между экранами

---

## 9. Дополнительные фичи (приоритет: низкий)

- [ ] Таймер на вопрос (опционально, настраивается)
- [ ] Звуковые эффекты
- [ ] Тёмная тема
- [ ] Мобильная адаптация (touch events)
- [ ] PWA (оффлайн режим)
- [ ] Мультиплеер (WebSocket)
