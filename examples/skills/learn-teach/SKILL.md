---
name: learn-teach
description: "Пошаговое объяснение концепции с прогрессирующей глубиной"
argument-hint: <concept>
effort: low
---

# Научи меня

Пошаговое объяснение концепции с прогрессирующей глубиной.

## Использование

```
/learn:teach React hooks         # Learn about React hooks
/learn:teach async/await         # Understand async patterns
/learn:teach SOLID principles    # Learn design principles
/learn:teach --deep SQL joins    # In-depth explanation
```

## Инструкции

1. Начните с **определение из одного предложения** концепции
2. Объясните **, почему это важно** (реальная проблема, которую он решает)
3. Показать **минимальный пример** (простейший возможный код)
4. Разбейте **каждую часть** примера с комментариями.
5. Показать **практический пример** (реальный вариант использования)
6. Выделите **распространенные ошибки**, которые допускают новички.
7. Предложить **следующие концепции** для изучения

## Формат ответа

```markdown
## [Concept Name]

**In one sentence**: [Clear, simple definition]

### Why It Matters

[1-2 sentences on the problem this solves]

### Minimal Example

\`\`\`[language]
// Simplest possible demonstration
[code]
\`\`\`

**Line by line**:
- Line 1: [explanation]
- Line 2: [explanation]
...

### Practical Example

\`\`\`[language]
// Real-world scenario
[code]
\`\`\`

### Common Mistakes

1. **[Mistake]**: [Why it's wrong and what to do instead]
2. **[Mistake]**: [Why it's wrong and what to do instead]

### Key Takeaways

- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

### Learn Next

- [Related concept 1]: [why it connects]
- [Related concept 2]: [why it connects]

---

**Practice challenge**: [Small exercise to reinforce the concept]
```

## Режимы глубины

### По умолчанию
- Определение в одно предложение
- Один минимальный пример
- Один практический пример
- 2-3 типичные ошибки

### `--deep`
- Расширенное объяснение с помощью history/context
- Несколько примеров возрастающей сложности
- Краевые случаи и ошибки
- Вопросы производительности
- Сравнение с альтернативами
- Подробности, важные для собеседования

### `--quick`
- Только определение
- Одиночный пример
- Никаких дополнений

## Правила адаптации

### Для начинающих
- Используйте аналогии из повседневной жизни.
- Избегайте жаргона (или сразу объясните)
- Больше комментариев в коде
- Меньшие примеры кода

### Для промежуточных
- Предполагаем базовые знания синтаксиса
- Сосредоточьтесь на «почему», а не на «что»
- Включите компромиссы
- Показать идиоматические шаблоны

### Для продвинутых тем
- Справочная официальная документация
- Обсудите внутреннюю реализацию, когда это необходимо.
- Включите влияние на производительность
- Упоминание связанных шаблонов

## Пример сеанса

```
User: /learn:teach useEffect

Claude: ## useEffect

**In one sentence**: useEffect lets you run side effects (data fetching, subscriptions, DOM changes) after React renders a component.

### Why It Matters

React components are pure functions that render UI. But real apps need to interact with the outside world: APIs, browser events, timers. useEffect is the bridge between React's declarative world and imperative side effects.

### Minimal Example

\`\`\`jsx
import { useEffect, useState } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(id);  // Cleanup
  }, []);  // Empty array = run once

  return <div>{seconds}s</div>;
}
\`\`\`

**Line by line**:
- `useEffect(() => {...}, [])`: Run this function after first render
- `setInterval(...)`: Start a timer (side effect)
- `return () => clearInterval(id)`: Cleanup when component unmounts
- `[]`: Empty dependency array = only run on mount

### Common Mistakes

1. **Missing dependency array**: Without `[]`, effect runs on EVERY render
2. **Forgetting cleanup**: Intervals/subscriptions leak without return function
3. **Stale closures**: Using old state values instead of functional updates

---

**Practice challenge**: Add a pause button that stops and resumes the timer.
```

## Темы, хорошо подходящие для /learn:учить

| Категория | Примеры |
|----------|----------|
| **React** | хуки, контекст, приостановка, серверные компоненты |
| **JavaScript** | замыкания, промисы, цикл событий, прототипы |
| **TypeScript** | дженерики, отображаемые типы, служебные типы |
| **Шаблоны** | SOLID, DI, состав, фабрики |
| **Бэкенд** | REST, GraphQL, аутентификация, кэширование |
| **База данных** | индексы, соединения, транзакции, нормализация |
| **DevOps** | контейнеры, CI/CD, инфраструктура как код |

$ARGUMENTS
