# Проектирование: Географическая викторина (GeoHoot)

## 1. Описание проекта

GeoHoot — интерактивное веб-приложение для проверки знаний географии в игровой форме. Пользователь угадывает местоположение стран, городов и достопримечательностей на карте мира.

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
| GET | `/api/questions` | Список всех вопросов (с пагинацией) |
| GET | `/api/questions/random` | Получить случайный вопрос |
| GET | `/api/questions/random?category=capital&exclude=1,2,3` | Случайный вопрос с фильтрами |
| GET | `/api/questions/[id]` | Получить конкретный вопрос |

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
| GET | `/api/sessions/[id]` | Получить состояние сессии |
| PATCH | `/api/sessions/[id]` | Обновить результат сессии |
| POST | `/api/sessions/[id]/complete` | Завершить сессию |

**Request body (создание):**
```json
{
  "mode": "fixed10",
  "category": "capital"
}
```

### 3.4 Таблица лидеров

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/leaderboard` | Топ-10 результатов |
| GET | `/api/leaderboard?mode=fixed10` | Топ по режиму |
| POST | `/api/leaderboard` | Добавить результат |

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
  questionsTotal   Int         @default(0)
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
| Framework | SvelteKit | 2.x |
| Map Library | Leaflet | 1.9.x |
| Svelte-Leaflet | svelte-leaflet | 1.x |
| Database | SQLite (dev) / PostgreSQL (prod) | - |
| ORM | Prisma | 5.x |
| Styling | TailwindCSS | 3.x |
| Build Tool | Vite | 5.x |

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
│   │   │   ├── Map.svelte
│   │   │   ├── QuestionCard.svelte
│   │   │   ├── ScoreDisplay.svelte
│   │   │   ├── Timer.svelte
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
│   │   │   ├── questions/
│   │   │   ├── answers/
│   │   │   ├── sessions/
│   │   │   └── leaderboard/
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
