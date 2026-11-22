---
name: design-patterns
description: "Обнаруживайте, предлагайте и оценивайте шаблоны проектирования GoF в кодовых базах TypeScript/JavaScript. Используйте при рефакторинге кода, применении шаблонов singleton/factory/observer/strategy, проверке качества шаблонов или поиске собственных стековых альтернатив для React, Angular, NestJS и Vue."
allowed-tools: Read Grep Glob mcp__grepai__grepai_search
context: fork
agent: specialist
effort: high
---

# Навыки анализа шаблонов проектирования

**Purpose**: Обнаружение, предложение и оценка шаблонов проектирования «Банды четырех» (GoF) в кодовых базах TypeScript/JavaScript с адаптацией с учетом стека.

## Основные возможности

1. **Stack Detection**: определите основной framework/library (React, Angular, NestJS, Vue, Express, RxJS, Redux, ORM).
2. **Pattern Detection**: Найдите существующие реализации 23 шаблонов GoF.
3. **Умные предложения**: рекомендуйте шаблоны для устранения запахов кода, используя, если доступны, собственные идиомы стека.
4. **Оценка качества**: оценка качества реализации шаблона на основе передового опыта.

## Режимы работы

### Режим 1: Обнаружение

**Trigger**: обнаружение или анализ шаблонов запросов пользователя.
**Output**: отчет JSON о найденных закономерностях с оценкой достоверности и контекстом стека.

**Workflow**:
```
1. Stack Detection (package.json, tsconfig.json, framework files)
2. Pattern Search (Glob for candidates -> Grep for signatures -> Read for validation)
3. Classification (native to stack vs custom implementations)
4. Confidence Scoring (0.0-1.0 based on detection rules)
5. JSON Report Generation
```

**Пример вызова**:
```
/design-patterns detect src/
/design-patterns analyze --format=json
```

### Режим 2: Предложение

**Trigger**: пользователь запрашивает предложения по шаблонам или советы по рефакторингу.
**Output**: отчет Markdown с приоритетными предложениями и примерами, адаптированными к стеку.

**Workflow**:
```
1. Code Smell Detection (switch statements, long parameter lists, global state, etc.)
2. Pattern Matching (map smell -> applicable patterns)
3. Stack Adaptation (prefer native framework patterns over custom implementations)
4. Priority Ranking (impact x feasibility)
5. Markdown Report with Code Examples
```

**Пример вызова**:
```
/design-patterns suggest src/payment/
/design-patterns refactor --focus=creational
```

### Режим 3: Оценка

**Trigger**: Пользователь запрашивает оценку качества шаблона.
**Output**: отчет JSON с баллами по каждому критерию оценки.

**Workflow**:
```
1. Pattern Identification (which pattern is implemented)
2. Criteria Assessment (correctness, testability, SOLID compliance, documentation)
3. Issue Detection (common mistakes, anti-patterns)
4. Scoring (0-10 per criterion)
5. JSON Report with Recommendations
```

**Пример вызова**:
```
/design-patterns evaluate src/services/singleton.ts
/design-patterns quality --pattern=observer
```

## Методология

### Этап 1: Обнаружение стека

**Sources** (в порядке приоритета):
1. `package.json` -> Проверить зависимости и devDependency
2. Файлы, специфичные для платформы -> `angular.json`, `next.config.*`, `nest-cli.json`, `vite.config.*`
3. `tsconfig.json` -> Проверить параметры компилятора, пути, библиотеки
4. Расширения файлов -> наличие `*.jsx`, `*.tsx`, `*.vue`

**Правила обнаружения** (из `signatures/stack-patterns.yaml`):
- Реакция: `react` в файлах + `*.jsx/*.tsx`
- Угловой: `@angular/core` + `angular.json`
- NestJS: `@nestjs/core` + `nest-cli.json`
- Vue: файлы `vue` v3+ + `*.vue`
- Экспресс: `express` в деталях + шаблоны `app.use`
- RxJS: `rxjs` в деталях + наблюдаемое использование
- Redux/Zustand: `redux`/`zustand` в депсах + шаблоны магазинов
- Prisma/TypeORM: `prisma`/`typeorm` в файлах deps + схемы

**Output**:
```json
{
  "stack_detected": {
    "primary": "react",
    "version": "18.2.0",
    "secondary": ["typescript", "zustand", "prisma"],
    "detection_sources": ["package.json", "tsconfig.json", "37 *.tsx files"],
    "confidence": 0.95
  }
}
```

### Этап 2: Обнаружение закономерностей

**Стратегия поиска**:
1. **Glob Phase**: поиск файлов-кандидатов по соглашению об именах.
   - `*Singleton*.ts`, `*Factory*.ts`, `*Strategy*.ts`, `*Observer*.ts` и т. д.
   - `*Manager*.ts`, `*Builder*.ts`, `*Adapter*.ts`, `*Proxy*.ts` и т. д.

2. **Grep Phase**: поиск сигнатур шаблонов (из `signatures/detection-rules.yaml`)
   - Первичные сигналы: `private constructor`, `static getInstance()`, `subscribe()`, `createXxx()` и т. д.
   - Вторичные сигналы: именование интерфейсов, шаблоны делегирования, сигнатуры методов.

3. **Read Phase**: проверка структуры шаблона
   - Анализ определений class/interface
   - Проверка связей (наследование, состав, делегирование)
   - Проверьте полную реализацию шаблона и частичное использование.

**Оценка уверенности**:
- 0,9-1,0: Присутствуют все первичные и вторичные сигналы, структура точно совпадает.
- 0,7-0,89: Все первичные сигналы + некоторые вторичные, незначительные отклонения.
- 0,5–0,69: Первичные сигналы присутствуют, вторичная проверка отсутствует.
- 0,3–0,49: Соответствие соглашениям об именах, слабые структурные доказательства.
- 0,0–0,29: Недостаточно доказательств, вероятно ложноположительный результат.

**Classification**:
- `native`: шаблон, реализованный с использованием встроенных в стек функций (React Context, Angular Services, NestJS Guards и т. д.).
- `custom`: Ручная реализация TypeScript
- `library`: шаблон предоставления сторонней библиотеки (тема RxJS, Redux Store и т. д.).

### Этап 3: Обнаружение запаха кода

**Целевые запахи** (из `signatures/code-smells.yaml`):
1. **Включить тип** -> шаблон Strategy/Factory
2. **Длинный список параметров (>4)** -> Шаблон Builder
3. **Global State Access** -> Singleton (или предпочтительно DI)
4. **Дублированные условные выражения для State** -> Шаблон состояния
5. **Разбросанная логика уведомлений** -> Шаблон наблюдателя
6. **Создание сложных объектов** -> Factory/Abstract Factory
7. **Жесткая связь с конкретными классами** -> Adapter/Bridge
8. **Повторяющиеся преобразования интерфейса** -> Шаблон адаптера
9. **Глубокое вложение для добавления функций** -> Шаблон декоратора
10. **Большой класс с множеством обязанностей** -> Шаблон фасада

**Эвристика обнаружения**:
- Grep для `switch (.*type)`, `switch (.*kind)`, `switch (.*mode)`
- Параметры функции подсчета: `function \w+\([^)]{60,}\)` (приблизительно для >4 параметров)
- Поиск глобального доступа: `window\.`, `global\.`, `process\.env\.\w+` (нет в конфигах)
- Найдите условные обозначения состояния: `if.*state.*===.*&&.*if.*state.*===`
- Найдите шаблоны уведомлений: `forEach.*notify`, `map.*\.emit\(`.

### Этап 4. Предложения с учетом стека

**Логика адаптации** (из `signatures/stack-patterns.yaml`):

```
IF pattern_detected == "custom" AND stack_has_native_equivalent:
  SUGGEST: "Use stack-native pattern instead"
  PROVIDE: Side-by-side comparison (current vs recommended)

ELSE IF code_smell_detected AND pattern_missing:
  IF stack_provides_pattern:
    SUGGEST: Stack-native implementation with examples
  ELSE:
    SUGGEST: Custom TypeScript implementation with best practices

ELSE IF pattern_implemented_incorrectly:
  PROVIDE: Refactoring steps to fix anti-patterns
```

**Пример адаптации**:

| Шаблон | Куча | Родная альтернатива | Рекомендация |
|---------|-------|-------------------|----------------|
| Синглтон | Реагировать | Контекст API + Поставщик | Используйте `createContext()` вместо `getInstance()`. |
| наблюдатель | Угловой | RxJS Subject/BehaviorSubject | Используйте встроенные Observable, а не пользовательскую реализацию. |
| Декоратор | NestJS | Декораторы @Injectable() + перехватчики | Используйте перехватчики фреймворка |
| Стратегия | Вю 3 | Составные части API | Используйте `ref()` + составные элементы вместо классов. |
| Цепочка ответственности | Выражать | Промежуточное ПО (`app.use()`) | Использовать цепочку промежуточного программного обеспечения Express |
| Команда | Редукс | Создатели действий + редукторы | Используйте действия Redux, а не пользовательские объекты команд. |

### Этап 5: Оценка качества

**Criteria** (из `checklists/pattern-evaluation.md`):
1. **Правильность (0-10)**: Соответствует ли это канонической структуре шаблона?
2. **Тестируемость (0-10)**: Могут ли зависимости легко быть mocked/stubbed?
3. **Одна ответственность (0-10)**: Он делает только одну вещь?
4. **Open/Closed Принцип (0-10)**: Расширяемо без изменений?
5. **Документация (0-10)**: Четкое намерение, описательное наименование?

**Правила подсчета очков**:
- 9-10: Образцовая реализация эталонного качества
- 7-8: Хорошо, возможны незначительные улучшения.
- 5-6: Приемлемые и важные проблемы, требующие решения
- 3-4: Проблема, необходим значительный рефакторинг
- 0-2: Неверно или серьезно ошибочно.

**Обнаружение проблем**:
- Жестко закодированные зависимости (Singleton с новым внутри getInstance)
- Классы Бога (слишком много обязанностей)
- Дырявые абстракции (обнажающие внутреннюю структуру)
- Отсутствует обработка ошибок
- Плохое именование (Стратегия1, Стратегия2 вместо описательных названий)

## Выходные форматы

### Режим обнаружения (JSON)

```json
{
  "metadata": {
    "scan_date": "2026-01-21T10:30:00Z",
    "scope": "src/",
    "files_scanned": 147,
    "execution_time_ms": 2341
  },
  "stack_detected": {
    "primary": "react",
    "version": "18.2.0",
    "secondary": ["typescript", "zustand", "prisma"],
    "detection_sources": ["package.json", "tsconfig.json", "37 *.tsx files"],
    "confidence": 0.95
  },
  "patterns_found": {
    "singleton": [
      {
        "file": "src/lib/api-client.ts",
        "lines": "5-28",
        "confidence": 0.85,
        "type": "custom",
        "signals": ["private constructor", "static getInstance", "private static instance"],
        "note": "Consider using React Context instead for better testability"
      }
    ],
    "observer": [
      {
        "file": "src/hooks/useAuth.ts",
        "lines": "12-45",
        "confidence": 0.92,
        "type": "native",
        "implementation": "React useState + useEffect",
        "note": "Correctly using React's built-in observer pattern"
      }
    ],
    "factory": [
      {
        "file": "src/services/notification-factory.ts",
        "lines": "8-67",
        "confidence": 0.78,
        "type": "custom",
        "signals": ["createNotification method", "type discrimination", "returns interface"]
      }
    ]
  },
  "summary": {
    "total_patterns": 7,
    "native_to_stack": 4,
    "custom_implementations": 3,
    "by_category": {
      "creational": 2,
      "structural": 3,
      "behavioral": 2
    },
    "by_confidence": {
      "high": 5,
      "medium": 2,
      "low": 0
    }
  },
  "recommendations": [
    "Consider replacing custom Singleton (api-client.ts) with React Context for better DI",
    "Review Factory pattern (notification-factory.ts) - could be simplified with strategy pattern"
  ]
}
```

### Режим предложений (уценка)

```markdown
# Design Pattern Suggestions

**Scope**: `src/payment/`
**Stack**: React 18 + TypeScript + Stripe
**Date**: 2026-01-21

---

## High Priority

### 1. Strategy Pattern: `src/payment/processor.ts:45-89`

**Code Smell**: Switch statement on payment type (4 cases, 78 lines)

**Current Implementation** (lines 52-87):
```typescript
switch (paymentType) {
  case 'credit':
    // 20 lines of credit card logic
    break;
  case 'paypal':
    // 15 lines of PayPal logic
    break;
  case 'crypto':
    // 18 lines of crypto logic
    break;
  case 'bank':
    // 12 lines of bank transfer logic
    break;
}
```

**Рекомендуется (стратегия, адаптированная к React)**:
```typescript
// Define strategy interface
interface PaymentStrategy {
  process: (amount: number) => Promise<PaymentResult>;
}

// Custom hooks as strategies
const useCreditPayment = (): PaymentStrategy => ({
  process: async (amount) => { /* credit logic */ }
});

const usePaypalPayment = (): PaymentStrategy => ({
  process: async (amount) => { /* PayPal logic */ }
});

// Strategy selection hook
const usePaymentStrategy = (type: PaymentType): PaymentStrategy => {
  const strategies = {
    credit: useCreditPayment(),
    paypal: usePaypalPayment(),
    crypto: useCryptoPayment(),
    bank: useBankPayment(),
  };
  return strategies[type];
};

// Usage in component
const PaymentForm = ({ type }: Props) => {
  const strategy = usePaymentStrategy(type);
  const handlePay = () => strategy.process(amount);
  // ...
};
```

**Impact**:
- **Complexity**: цикломатическая сложность снижена с 12 до 2.
- **Extensibility**: новые способы оплаты = новый хук, без изменений существующего кода.
- **Testability**: каждый хук стратегии можно протестировать отдельно.
- **Effort**: ~2 часа (извлечение логики в хуки, добавление тестов)

---

## Средний приоритет

### 2. Модель наблюдателя: `src/cart/CartManager.ts:23-156`.

**Code Smell**: логика ручного уведомления, разбросанная по 8 методам.

**Current**: Ручные циклы, вызывающие функции обновления.
**Рекомендуется**: использовать магазин Zustand (уже в зависимостях)

```typescript
// Instead of custom observer:
import create from 'zustand';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  // Zustand automatically notifies subscribers
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}));

// Components auto-subscribe:
const CartDisplay = () => {
  const items = useCartStore((state) => state.items);
  // Re-renders automatically on cart changes
};
```

**Impact**:
- **LOC**: уменьшено со 156 до ~25 строк.
- **Stack-native**: использует существующую зависимость Zustand.
- **Testability**: магазины Zustand легко тестируются.
- **Effort**: ~1,5 часа

---

## Краткое содержание

- **Всего предложений**: 4
- **Высокий приоритет**: 2 (Стратегия, Наблюдатель)
- **Средний приоритет**: 2 (Строитель, Фасад)
- **Оценочное общее время работы**: ~6 часов.
- **Основные преимущества**: пониженная сложность, улучшенная тестируемость, встроенные в стек идиомы.
```

### Evaluation mode (JSON)

```json
{
  "file": "src/services/config-singleton.ts",
  "pattern": "singleton",
  "lines": "5-34",
  "scores": {
    "correctness": 8,
    "testability": 4,
    "single_responsibility": 9,
    "open_closed": 7,
    "documentation": 6,
    "overall": 6.8
  },
  "details": {
    "correctness": {
      "score": 8,
      "rationale": "Implements singleton structure correctly with private constructor and static getInstance",
      "issues": ["Missing thread-safety consideration (not critical in JS single-threaded context)"]
    },
    "testability": {
      "score": 4,
      "rationale": "Hard to mock or reset instance in tests",
      "issues": [
        "No reset method for test isolation",
        "Static instance makes dependency injection impossible",
        "Tests must run in specific order or share state"
      ],
      "suggestions": [
        "Add resetInstance() method for tests (with appropriate guards)",
        "Consider using dependency injection instead"
      ]
    },
    "single_responsibility": {
      "score": 9,
      "rationale": "Focuses solely on configuration management",
      "issues": []
    },
    "open_closed": {
      "score": 7,
      "rationale": "Configuration can be extended but requires modification for new sources",
      "suggestions": ["Consider strategy pattern for configuration sources"]
    },
    "documentation": {
      "score": 6,
      "rationale": "Has JSDoc but missing rationale for singleton choice",
      "suggestions": ["Document why singleton is chosen over DI", "Add usage examples"]
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "suggestion": "Add test-friendly reset mechanism or refactor to use DI",
      "rationale": "Current implementation makes testing difficult"
    },
    {
      "priority": "medium",
      "suggestion": "Document singleton rationale in JSDoc",
      "rationale": "Team members should understand why global state is necessary here"
    }
  ]
}
```

## Ограничения и рекомендации

### Анализ только для чтения
- **Без изменений**: этот навык только анализирует и предлагает, но не изменяет код.
- **Не создавать файлы**: не создавать файлы рефакторизованного кода.
- **Решение пользователя**: все предложения требуют явного одобрения пользователя перед реализацией.

### Языковой фокус
- **Первичный**: TypeScript (`.ts`, `.tsx`)
- **Вторичный**: JavaScript (`.js`, `.jsx`)
- **Exclusions**: другие языки (Python, Java, C#) не поддерживаются.

### Покрытие рисунка
- **Creational (5)**: Синглтон, Фабричный метод, Абстрактная фабрика, Построитель, Прототип
- **Structural (7)**: адаптер, мост, композит, декоратор, фасад, легковес, прокси
- **Поведенческий (11)**: Цепочка ответственности, Команда, Итератор, Посредник, Сувенир, Наблюдатель, Состояние, Стратегия, Шаблонный метод, Посетитель, Интерпретатор

### Вопросы производительности
- **Большие кодовые базы (>500 файлов)**: используйте `--scope`, чтобы ограничить сканирование определенными каталогами.
- **Параллельный поиск**: поиск Grep выполняется независимо для каждого шаблона.
- **Caching**: результаты обнаружения стека кэшируются для каждого сеанса, чтобы избежать избыточных операций чтения package.json.

## Примеры использования

### Базовое обнаружение
```bash
# Detect all patterns in src/
/design-patterns detect src/

# Detect only creational patterns
/design-patterns detect src/ --category=creational

# Focus on specific pattern
/design-patterns detect src/ --pattern=singleton
```

### Целевые предложения
```bash
# Get suggestions for payment module
/design-patterns suggest src/payment/

# Focus on specific smell
/design-patterns suggest src/ --smell=switch-on-type

# High priority only
/design-patterns suggest src/ --priority=high
```

### Оценка качества
```bash
# Evaluate specific file
/design-patterns evaluate src/services/api-client.ts

# Evaluate all singletons
/design-patterns evaluate src/ --pattern=singleton

# Full quality report
/design-patterns evaluate src/ --detailed
```

## Интеграция с другими навыками

Этот навык может быть унаследован:
- `refactoring-specialist.md`: предоставляет знания о шаблонах для рефакторинга.
- `code-reviewer.md`: добавляет обнаружение шаблонов в процесс проверки.
- `architecture-advisor.md`: информирует архитектурные решения с помощью использования шаблонов.

## Справочные файлы

- `reference/patterns-index.yaml`: Машиночитаемый индекс из 23 шаблонов с метаданными.
- `reference/creational.md`: Документация по шаблонам создания
- `reference/structural.md`: Документация по структурным шаблонам.
- `reference/behavioral.md`: Документация по шаблонам поведения.
- `signatures/detection-rules.yaml`: шаблоны регулярных выражений и эвристика для обнаружения.
- `signatures/code-smells.yaml`: Сопоставление запахов кода с применимыми шаблонами.
- `signatures/stack-patterns.yaml`: правила обнаружения стека и эквиваленты собственных шаблонов.
- `checklists/pattern-evaluation.md`: Критерии оценки качества и рекомендации по выставлению оценок.

## Версия

**Skill Версия**: 1.0.0
**Охват шаблонов**: 23 шаблона GoF
**Поддерживаемые стеки**: 8 (React, Angular, NestJS, Vue, Express, RxJS, Redux/Zustand, ORM)
**Последнее обновление**: 21 января 2026 г.
