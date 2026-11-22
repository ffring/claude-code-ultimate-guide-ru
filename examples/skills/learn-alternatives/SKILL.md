---
name: learn-alternatives
description: "Сравните разные подходы к решению одной и той же проблемы."
argument-hint: "[topic]"
effort: low
---

# Показать альтернативы

Сравните разные подходы к решению одной и той же проблемы.

## Использование

```
/learn:alternatives              # Compare approaches for current code
/learn:alternatives auth         # Compare authentication methods
/learn:alternatives state        # Compare state management options
/learn:alternatives --detailed   # Include code examples for each
```

## Инструкции

1. Определите **решаемую проблему** (из контекста или аргумента)
2. Представлены альтернативные подходы **3-5**
3. По каждому подходу объясните:
   - Что это такое (одно предложение)
   - Когда его использовать
   - Компромиссы (pros/cons)
4. Предоставить **рекомендация** на основе контекста
5. При необходимости покажите примеры кода для лучших вариантов.

## Формат ответа

```markdown
## Problem: [What we're trying to solve]

### Approach 1: [Name]

**What**: [One-sentence description]

**When to use**:
- [Scenario 1]
- [Scenario 2]

**Pros**: [List]
**Cons**: [List]

---

### Approach 2: [Name]
...

---

## Comparison Table

| Criteria | Approach 1 | Approach 2 | Approach 3 |
|----------|------------|------------|------------|
| Complexity | Low | Medium | High |
| Performance | ★★☆ | ★★★ | ★★☆ |
| Bundle size | Small | Medium | Large |
| Learning curve | Easy | Medium | Steep |

## Recommendation

**For your case**: [Recommended approach] because [reason based on context]

**Consider instead if**: [Alternative scenarios]
```

## Критерии сравнения

Стандартные критерии оценки (корректируются в зависимости от проблемы):

| Критерии | Описание |
|----------|-------------|
| **Сложность** | Насколько сложно внедрить и поддерживать |
| **Производительность** | Скорость выполнения, использование памяти |
| **Размер комплекта** | Влияние на пакет внешнего интерфейса |
| **Кривая обучения** | Время понять и использовать правильно |
| **Гибкость** | Простота расширения или изменения |
| **Сообщество** | Документация, экосистема, поддержка |
| **Тестирование** | Как легко протестировать |
| **Тип безопасности** | TypeScript качество поддержки |

## Режимы глубины

### По умолчанию
- 3-4 альтернативы
- Краткое описание каждого
- Сравнительная таблица
- Рекомендация

### `--detailed`
- 4-5 альтернатив
- Пример кода для каждого
- Подробные компромиссы
- Вопросы миграции
- Практические примеры

### `--quick`
- 2-3 альтернативы
- По одной строке каждый
- Быстрая рекомендация

## Пример сеанса

```
User: I'm using useState for form state. /learn:alternatives

Claude: ## Problem: Managing Form State in React

### Approach 1: Multiple useState

**What**: Separate useState for each field

**When to use**:
- Simple forms (< 5 fields)
- No complex validation
- No cross-field dependencies

**Pros**: Simple, no dependencies, easy to understand
**Cons**: Verbose with many fields, scattered state

---

### Approach 2: Single useState with Object

**What**: One useState holding all fields as object

**When to use**:
- Medium forms (5-10 fields)
- Need to reset entire form
- Want cleaner code

**Pros**: Grouped state, easy reset, cleaner
**Cons**: Need spread operator, can cause unnecessary re-renders

---

### Approach 3: useReducer

**What**: Reducer pattern for complex state transitions

**When to use**:
- Complex validation logic
- Multi-step forms
- Undo/redo functionality

**Pros**: Predictable updates, handles complex logic, testable
**Cons**: More boilerplate, learning curve

---

### Approach 4: Form Library (React Hook Form, Formik)

**What**: Dedicated form state management library

**When to use**:
- Large forms (10+ fields)
- Complex validation (async, cross-field)
- Performance critical (many fields)

**Pros**: Optimized re-renders, validation built-in, less code
**Cons**: Dependency, learning curve, bundle size

---

## Comparison Table

| Criteria | useState | useReducer | React Hook Form |
|----------|----------|------------|-----------------|
| Complexity | Low | Medium | Medium |
| Performance | ★★☆ | ★★☆ | ★★★ |
| Bundle size | 0kb | 0kb | ~8kb |
| Validation | Manual | Manual | Built-in |
| Best for | Simple | Complex logic | Large forms |

## Recommendation

**For your case**: If this is a simple login/contact form, stick with **useState**. If you're building a multi-step checkout or admin form, consider **React Hook Form** for the validation and performance benefits.

**Consider useReducer if**: You need undo/redo, complex state machines, or want reducer-style testing.
```

## Общие альтернативные сравнения

| Тема | Типичные альтернативы |
|-------|---------------------|
| **State** | useState, useReducer, Zustand, Redux, Jotai |
| **Стиль** | CSS-модули, Tailwind, стилизованные компоненты, CSS-in-JS |
| **Извлечение данных** | выборка, аксиомы, React Query, SWR |
| **Формы** | useState, форма React Hook, Formik |
| **Auth** | JWT, сеансы, OAuth, магические ссылки |
| **API дизайн** | REST, GraphQL, tRPC, gRPC |
| **Тестирование** | Jest, Vitest, Библиотека тестирования, Cypress |
| **Базы данных** | PostgreSQL, MySQL, MongoDB, SQLite |

$ARGUMENTS
