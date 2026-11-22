---
name: optimize
description: "Анализируйте и предлагайте улучшения производительности кода, запросов или систем."
argument-hint: "<file_or_module> [--focus speed|memory|bundle]"
effort: medium
when_to_use: "Use when a function or module needs performance analysis or improvements."
disable-model-invocation: true
---

# Оптимизатор производительности

Анализируйте и предлагайте улучшения производительности кода, запросов или систем.

## Цель

Определите возможности оптимизации:
- Узкие места производительности во время выполнения
- Проблемы с использованием памяти
- Неэффективность запросов к базе данных
- Проблемы с размером пакета
- Сложность алгоритма

## Инструкции

### Шаг 1: Определение области применения

Определите цель оптимизации:
- **Function**: выполнение одной функции
- **Модуль**: Связанный functions/classes
- **Query**: оптимизация запросов к базе данных.
- **Bundle**: Анализ пакета внешнего интерфейса
- **System**: оптимизация на уровне архитектуры.

### Шаг 2: Анализ производительности

#### Анализ времени выполнения

```bash
# Find potentially slow patterns
grep -rn "forEach\|\.map\|\.filter\|\.reduce" --include="*.{ts,js}" . | head -20

# Find nested loops (O(n²) potential)
grep -rn "for.*for\|\.forEach.*\.forEach\|\.map.*\.map" --include="*.{ts,js}" . | head -10

# Find sync operations that could be async
grep -rn "readFileSync\|writeFileSync\|execSync" --include="*.{ts,js}" . | head -10
```

#### Анализ памяти

```bash
# Large array operations
grep -rn "new Array\|Array\.from\|\.concat\|spread" --include="*.{ts,js}" . | head -10

# Potential memory leaks (event listeners, intervals)
grep -rn "addEventListener\|setInterval\|setTimeout" --include="*.{ts,js}" . | head -10
```

#### Анализ запросов к базе данных

```bash
# N+1 query patterns
grep -rn "await.*find\|await.*query" --include="*.{ts,js}" . | head -15

# Missing indexes hints
grep -rn "WHERE\|ORDER BY\|GROUP BY" --include="*.{ts,js,sql}" . | head -15
```

#### Пакетный анализ

```bash
# Check bundle size (if applicable)
[ -f "package.json" ] && npm run build 2>/dev/null && ls -lh dist/*.js 2>/dev/null

# Large dependencies
[ -f "package.json" ] && cat package.json | jq '.dependencies | keys[]' | head -20
```

### Шаг 3: Расстановка приоритетов

Ранжируйте результаты по:
1. **Impact**: Насколько это улучшит производительность?
2. **Effort**: Насколько сложно это исправить?
3. **Risk**: Что может сломаться?

## Выходной формат

---

### ⚡ Анализ производительности

**Target**: [file/module/system]
**Дата анализа**: [метка времени]

### 📊 Текущие показатели (если их можно измерить)

| Метрика | Текущий | Цель | Зазор |
|--------|---------|--------|-----|
| Время ответа | Рождество | <Да | -Z% необходимо |
| Использование памяти | ХМБ | <ЮМБ | -Z% необходимо |
| Размер пакета | ХКБ | <ЮКБ | -Z% необходимо |

### 🔴 Критические проблемы

#### 1. [название проблемы] - [местоположение]

**Проблема**: [Что медленно и почему]

**Current**:
```typescript
// O(n²) - nested loops
users.forEach(user => {
  permissions.forEach(perm => {
    if (user.id === perm.userId) { ... }
  });
});
```

**Optimized**:
```typescript
// O(n) - Map lookup
const permMap = new Map(permissions.map(p => [p.userId, p]));
users.forEach(user => {
  const perm = permMap.get(user.id);
  if (perm) { ... }
});
```

**Impact**: ~ в 10 раз быстрее для 1000 пользователей.
**Effort**: низкий (5 мин)
**Риск**: Низкий

### 🟠 Высокий приоритет

| Проблема | Расположение | Влияние | Усилие |
|-------|----------|--------|--------|
| [описание] | file:line | [оценивать] | [время] |

### 🟡 Средний приоритет

| Проблема | Расположение | Влияние | Усилие |
|-------|----------|--------|--------|
| [описание] | file:line | [оценивать] | [время] |

### 💡 Быстрые победы

1. [Небольшое изменение с хорошим эффектом]
2. [Еще одна быстрая оптимизация]
3. [Низко висящие фрукты]

### 📈 Дорожная карта оптимизации

```
Week 1: Critical fixes (items 1-3)
Week 2: High priority (items 4-6)
Week 3: Measure and validate improvements
```

---

## Общие шаблоны

### Операции с массивами

| Шаблон | Проблема | Исправить |
|---------|-------|-----|
| `arr.filter().map()` | Две итерации | Одиночный `reduce()` или `flatMap()` |
| `arr.find()` в цикле | O(n²) | Сначала соберите Map/Set |
| `[...arr1, ...arr2]` | Распределение памяти | `arr1.concat(arr2)` или нажмите |

### База данных

| Шаблон | Проблема | Исправить |
|---------|-------|-----|
| Цикл с ожиданием | N+1 запросов | Пакетный запрос с `IN` |
| `SELECT *` | Over-fetching | Выберите только необходимые столбцы |
| Отсутствует индекс WHERE | Полное сканирование таблицы | Добавить составной индекс |

### React/frontend

| Шаблон | Проблема | Исправить |
|---------|-------|-----|
| Встроенные функции в JSX | Re-renders | `useCallback` |
| Рендеринг большого списка | ДОМ бьется | Виртуализация |
| Неоптимизированные изображения | Медленная ЛКП | Next/Image, ленивая загрузка |

### Node.js

| Шаблон | Проблема | Исправить |
|---------|-------|-----|
| Синхронизировать файловые операции | Блокирует цикл событий | Асинхронные альтернативы |
| JSON.анализ больших файлов | Скачок памяти | Потоковый парсер |
| Нет пула соединений | Накладные расходы на соединение | Пул с pg-pool и т.д. |

## Использование

**Анализ конкретного файла:**
```
/optimize src/services/user.ts
```

**Фокус на конкретной области:**
```
/optimize --queries src/repositories/
/optimize --bundle
/optimize --memory src/workers/
```

**С целевыми показателями:**
```
/optimize --target=100ms src/api/search.ts
```

**Быстрое сканирование:**
```
/optimize --quick
```

## Примечания

- Измерения превосходят предположения: профиль перед оптимизацией
- Преждевременная оптимизация — корень всех зол (Кнут)
- Сосредоточьтесь на горячих путях: оптимизируйте то, что запускается чаще всего
- Рассмотрите компромиссы: скорость, читаемость и удобство обслуживания.

$ARGUMENTS
