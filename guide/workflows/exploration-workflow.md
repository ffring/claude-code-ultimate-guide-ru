---
title: "Исследование перед реализацией"
description: "Спросите Claude о нескольких подходах с компромиссами перед кодированием, чтобы предотвратить предвзятость привязки."
tags: [workflow, architecture, design-patterns]
---

# Исследование перед реализацией

> **Confidence**: Уровень 2, подтвержденный практическими исследованиями (+20–30 % качества решений, +40 % выявленных альтернатив).
> **Источник**: [Блог MetalBear Engineering](https://metalbear.com/blog/engineering-ai-use/), исследования практиков arXiv

Прежде чем писать код, спросите Claude о нескольких подходах с компромиссами. Это предотвращает предвзятость привязки: тенденцию зацикливаться на первом предложенном решении.

---

## Оглавление

1. [TL;DR](#tldr)
2. [Шаблон](#the-pattern)
3. [Подсказки против привязки](#anti-anchoring-prompts)
4. [Когда использовать](#when-to-use)
5. [Интеграция с Claude Code](#integration-with-claude-code)
6. [Anti-Patterns](#anti-patterns)
7. [См. также](#see-also)

---

## <a name="tldr"></a>ТЛ;ДР

```
1. Describe problem (no code, no preconception)
2. Request 3-5 approaches with trade-offs
3. Ask for quantified comparison
4. Choose approach
5. Then implement
```

Основная идея: **Как только модель предлагает конкретное решение, она может непреднамеренно сузить ваше мышление.**

---

## <a name="the-pattern"></a>Узор

### Шаг 1: Только формулировка проблемы

Начните с проблемы, а не с направления решения:

```
I need to handle user sessions in a Node.js API.
Requirements:
- Support 10K concurrent users
- Session data: user ID, permissions, preferences
- Must survive server restarts
```

**Не это** (привязка к Redis):
```
I'm thinking of using Redis for sessions. How should I implement it?
```

### Шаг 2. Запросите несколько подходов

```
Give me 4 different approaches to solve this.
For each, include:
- Architecture overview
- Pros and cons
- Performance characteristics
- Complexity to implement
```

### Шаг 3: Количественное сравнение

```
Now rank these approaches on a 1-10 scale for:
- Latency (lower is better)
- Scalability (10K → 100K users)
- Operational complexity
- Development time
```

### Шаг 4. Выберите и реализуйте

```
I'll go with approach B (JWT + Redis hybrid).
Now implement it following our existing patterns in src/auth/.
```

---

## <a name="anti-anchoring-prompts"></a>Подсказки против привязки

LLM могут зациклиться на своем первом предложении. Эти подсказки борются с тем, что:

| Тип подсказки | Шаблон | Эффект |
|-------------|----------|--------|
| **Новый старт** | «Игнорируйте любые предыдущие идеи. Создайте 4 новых подхода к [X]» | Разнообразие сил |
| **Отражающая петля** | «Создайте 3 варианта, затем оцените каждый, а затем порекомендуйте» | Самокоррекция (погрешность привязки -25 %) |
| **Количественные компромиссы** | «Ранг по [показатель1], [показатель2], [показатель3] с баллами 1–10» | Объективное сравнение |
| **Адвокат дьявола** | «Каковы самые сильные аргументы против вашей рекомендации?» | Поверхностные скрытые компромиссы |
| **Вариация ограничений** | «Теперь решите ту же задачу с [противоположным ограничением]» | Расширить пространство решений |

### Пример: запрос на защиту от привязки

```
I need pagination for a REST API with 1M+ records.

IMPORTANT: Don't suggest offset-based pagination first.
Generate 4 different pagination strategies, including at least one
unconventional approach. For each:

1. How it works (2-3 sentences)
2. Best use case
3. Worst use case
4. Performance at 1M records

Then recommend one, explaining why it beats the others for my use case.
```

### Подсказка цикла отражения

```
For implementing real-time notifications:

Phase 1: Generate 3 approaches (WebSockets, SSE, Long Polling)
Phase 2: For each, list 2 things that could go wrong in production
Phase 3: Based on Phase 2, which approach is most resilient?

Show your reasoning for each phase.
```

---

## <a name="when-to-use"></a>Когда использовать

### Используйте исследование

| Сценарий | Зачем |
|----------|-----|
| Особенности Гринфилда | Нет существующего шаблона, которому можно было бы следовать |
| Архитектурные решения | Сильное воздействие, которое трудно повернуть вспять |
| Несколько действенных подходов | Нужен осознанный выбор |
| Незнакомый домен | Не знаю, чего ты не знаешь |
| Разногласия в команде | Получите нейтральный анализ вариантов |

### Пропустить исследование

| Сценарий | Зачем |
|----------|-----|
| Исправления ошибок | Решение обычно очевидно по симптомам |
| Единственный действительный подход | Нет реального выбора, чтобы сделать |
| Срочные исправления | Скорость > совершенство |
| Следуя существующему шаблону | Решение уже принято |
| Тривиальные изменения | Накладные расходы того не стоят |

---

## <a name="integration-with-claude-code"></a>Интеграция с Claude Code

### В режиме плана

Исследование происходит **до перехода** в режим планирования:

```
# Step 1: Explore (not in Plan Mode yet)
I need to add caching to the API. What are my options?

# Claude responds with 4 approaches

# Step 2: Choose
Let's go with approach C (edge caching with Cloudflare).

# Step 3: Plan (press Shift+Tab twice to enter Plan Mode)
Implement edge caching using Cloudflare Workers.
Follow the patterns in our existing middleware.
```

### С CLAUDE.md

Добавьте триггеры исследования в инструкции по проекту:

```markdown
## Workflow Preferences

### Before New Features
When implementing new features, first explore 3-4 approaches
with trade-offs before committing to implementation.
Use quantified comparison (1-10 scale) for:
- Performance
- Maintainability
- Time to implement
```

### С инструментом задач

Отслеживайте исследование как задачи:

```
TaskCreate: "Explore caching approaches"
TaskCreate: "Choose approach based on analysis"
TaskCreate: "Implement cache invalidation"
TaskCreate: "Add cache headers to responses"
# Mark completed as you progress with TaskUpdate
```

---

## Anti-patterns

### Преждевременное прикрепление

```
# Wrong
"I want to use Redis for caching. How do I set it up?"

# Right
"I need caching for API responses. What are my options?"
```

Вы исключили 90% решений перед исследованием.

### Неглубокое сравнение

```
# Wrong
"Which is better: Redis or Memcached?"

# Right
"Compare Redis, Memcached, and in-process caching for:
- 50MB cache size
- Read-heavy workload (95% reads)
- Single server deployment
Include latency, memory overhead, and operational complexity."
```

### Игнорирование компромиссов

```
# Wrong
"Just tell me the best approach"

# Right
"What would I give up by choosing approach A over B?
What scenarios would make me regret this choice?"
```

### Аналитический паралич

```
# Wrong
Exploring 10 options for a simple feature

# Right
Set a limit: "Give me your top 3 approaches, no more"
Make a decision and iterate if needed
```

---

## Пример сеанса

### Начальная разведка

```
User: I need to implement real-time updates in our React dashboard.
      The dashboard shows ~50 metrics that update every 5 seconds.
      Currently we poll, but users complain about stale data.

Claude: Here are 4 approaches:

**A) WebSockets**
- Full duplex, server can push anytime
- Pros: Lowest latency, true real-time
- Cons: Connection management, scaling complexity
- Best for: Sub-second updates, bidirectional communication

**B) Server-Sent Events (SSE)**
- Unidirectional server → client stream
- Pros: Simple, HTTP-based, auto-reconnect
- Cons: One-way only, limited browser connections
- Best for: Dashboard feeds, notifications

**C) Long Polling**
- Client holds request until data ready
- Pros: Works everywhere, simple fallback
- Cons: Higher latency, more server load
- Best for: Legacy compatibility

**D) GraphQL Subscriptions**
- WebSocket-based with GraphQL schema
- Pros: Type-safe, selective updates
- Cons: Requires GraphQL infrastructure
- Best for: Existing GraphQL APIs

User: Rank these for our use case (React, 50 metrics, 5s refresh,
      team has no WebSocket experience).

Claude: Scores (1-10, higher is better):

| Approach | Latency | Complexity | Team Fit | Scalability |
|----------|---------|------------|----------|-------------|
| WebSockets | 10 | 4 | 3 | 7 |
| SSE | 8 | 8 | 8 | 8 |
| Long Polling | 5 | 9 | 9 | 5 |
| GraphQL Subs | 9 | 3 | 2 | 7 |

**Recommendation: SSE**
Best balance of simplicity and real-time capability.
Your team can implement it in a day, and it handles your
50 metrics × 5s updates easily. Upgrade to WebSockets later
if you need bidirectional or sub-second updates.

User: Let's go with SSE. Now implement it.
```

---

## <a name="see-also"></a>См. также

- [plan-driven.md](./plan-driven.md): для исследования кодовой базы (режим /plan)
- [iterative-refinement.md](./iterative-refinement.md): уточнить после выбора подхода.
- [../examples/semantic-anchors/anchor-catalog.md](../../examples/semantic-anchors/anchor-catalog.md): точный словарь для подсказок.
- [spec-first.md](./spec-first.md): определите требования перед изучением
