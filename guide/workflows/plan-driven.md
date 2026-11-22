---
title: "Плановое развитие"
description: "Используйте режим /plan для нетривиальных задач, чтобы изучить и предложить планы реализации."
tags: [workflow, guide, architecture]
---

# Плановое развитие

> **Confidence**: Уровень 1 (на основе встроенных в Claude Code функций режима /plan).

Используйте режим `/plan` для чего-то нетривиального. Claude исследует кодовую базу (только для чтения), а затем предлагает план реализации на ваше одобрение.

---

## Оглавление

1. [TL;DR](#tldr)
2. [Рабочий процесс /plan](#the-plan-workflow)
3. [Когда использовать](#when-to-use)
4. Структура файла [Plan](#plan-file-structure)
5. [Интеграция с другими рабочими процессами](#integration-with-other-workflows)
6. [Советы](#tips)
7. [Дополнительно: пользовательские планы уценки (шаблон Бориса Тане)](#advanced-custom-markdown-plans-boris-tane-pattern)
8. [См. также](#see-also)

---

## <a name="tldr"></a>ТЛ;ДР

```
1. Enter Plan Mode (Shift+Tab twice) or ask complex question
2. Claude explores codebase (read-only)
3. Claude writes plan to .claude/plans/
4. You review and approve
5. Claude executes
```

---

## <a name="the-plan-workflow"></a>Рабочий процесс /plan

### Шаг 1. Войдите в режим планирования

Переключите режим планирования с помощью `Shift+Tab` (нажмите дважды, чтобы циклически переключаться между Обычным → Автопринятием → Планом):
```
# Press Shift+Tab twice to enter Plan Mode
# (Plan Mode indicator appears in the UI)
```

Или задайте сложный вопрос, который автоматически активирует режим планирования:
```
How should I refactor the authentication system to support OAuth?
```

### Шаг 2: Claude исследует

В режиме плана Claude:
- Читает соответствующие файлы
- Поиск шаблонов
- Понимает существующую архитектуру
- НЕ МОГУ внести изменения

### Шаг 3: Claude записывает план

Claude создает файл плана по адресу `.claude/plans/[name].md`:

```markdown
# Plan: Refactor Authentication for OAuth

## Summary
Add OAuth support while maintaining existing email/password auth.

## Files to Modify
- src/auth/providers/index.ts (add OAuth provider)
- src/auth/middleware.ts (handle OAuth tokens)
- src/config/auth.ts (OAuth config)

## Files to Create
- src/auth/providers/oauth.ts
- src/auth/providers/google.ts

## Implementation Steps
1. Create OAuth provider interface
2. Implement Google OAuth provider
3. Update middleware to detect token type
4. Add OAuth routes
5. Update config schema

## Risks
- Breaking existing sessions during migration
- Token format differences between providers
```

### Шаг 4. Вы проверяете

Ознакомьтесь с планом:
- Полнота (учтены все требования)
- Корректность (правильный подход для вашей кодовой базы)
- Область применения (не чрезмерная инженерия)

### Шаг 5: Утвердить и выполнить

```
Looks good. Proceed with the plan.
```

Или запросите изменения:
```
Modify the plan: also add support for GitHub OAuth, not just Google.
```

---

## <a name="when-to-use"></a>Когда использовать

### Использовать режим планирования

| Сценарий | Зачем |
|----------|-----|
| Многофайловые изменения | Просмотреть все затронутые файлы заранее |
| Изменения архитектуры | Проверьте подход перед кодированием |
| Новые возможности | Обеспечить полную реализацию |
| Незнакомая кодовая база | Пусть Claude сначала исследует |
| Рискованные операции | Проверка перед выполнением |

### Пропустить режим планирования

| Сценарий | Зачем |
|----------|-----|
| Однострочные исправления | Очевидно, низкий риск |
| Исправления опечаток | Планирование не требуется |
| Простые вопросы | Исследование, а не реализация |
| Добавление комментариев | Тривиальное изменение |

---

## <a name="plan-file-structure"></a>Структура файла плана

Планы хранятся в `.claude/plans/` с автоматически сгенерированными именами.

### Типовые разделы плана

```markdown
# Plan: [Title]

## Summary
[1-2 sentence overview]

## Context
[Why this change is needed]

## Files to Modify
[List of existing files that will change]

## Files to Create
[List of new files]

## Files to Delete
[List of files to remove, if any]

## Implementation Steps
[Ordered list of steps]

## Testing Strategy
[How to verify the changes]

## Risks & Mitigations
[What could go wrong and how to handle it]

## Open Questions
[Things to clarify before proceeding]
```

---

## <a name="integration-with-other-workflows"></a>Интеграция с другими рабочими процессами

### План + TDD

```
# Enter Plan Mode (Shift+Tab twice), then:

I need to implement a rate limiter.
Plan the test cases first, then the implementation.
```

Claude планирует как тесты, так и реализацию в правильном порядке TDD.

### План + спецификация сначала

```
# Enter Plan Mode (Shift+Tab twice), then:

Review the Payment Processing spec in CLAUDE.md.
Create an implementation plan that satisfies all acceptance criteria.
```

### Инструмент «План + задача»

После утверждения плана Claude можно разбить на задачи:

```
Approved. Create tasks from this plan and start implementing.
```

---

## <a name="tips"></a>Советы

### Будьте конкретны в отношении объема

```
# Too vague (after entering Plan Mode via Shift+Tab twice)
Improve the API

# Better
Add pagination to the /users endpoint with cursor-based navigation.
Maintain backwards compatibility with existing clients.
```

### Запросить изменения плана

```
The plan looks good but:
- Add error handling for network failures
- Skip the caching optimization for now
- Include rollback procedure
```

### Использование для архитектурных решений

```
# Enter Plan Mode (Shift+Tab twice), then:

I'm considering two approaches for state management:
A) Redux Toolkit
B) Zustand

Explore the codebase and recommend which fits better.
```

### Сохраняйте планы для документации

Планы в `.claude/plans/` служат документацией для принятия решений:
- Почему были выбраны те или иные подходы
- Какие файлы должны были измениться
- Обоснование порядка реализации

---

## <a name="advanced-custom-markdown-plans-boris-tane-pattern"></a>Дополнительно: Пользовательские планы уценки (шаблон Бориса Тане)

> **Источник**: Борис Тане, руководитель отдела разработки Cloudflare, в [«Как я использую Claude Code»](https://boristane.com/blog/how-i-use-claude-code/) (февраль 2026 г.). 9 месяцев производственного использования.
> **Confidence**: Уровень 2 (шаблон, проверенный практикующим специалистом, а не официальная документация Anthropic).

Когда режима планирования недостаточно, используйте итеративное планирование human/agent перед написанием кода.

### <a name="why-custom-plans-over-plan"></a>Почему индивидуальные планы вместо /plan

| Фактор | Режим планирования (собственный) | Индивидуальный план .md |
|--------|----------------|-----------------|
| **Постоянство** | Потеряно при сжатии контекста | Выдерживает уплотнение, доступен для совместного использования |
| **Обзорная поверхность** | На основе чата, линейный | Структурированный файл, различия |
| **Итерация** | Перемотка вперед-назад в разговоре | Аннотировать файл, повторить запуск |
| **Общее состояние** | Per-session | «Общее изменяемое состояние» между человеком и агентом |
| **Подходит для** | Стандартные функции, задачи <30 минут | Комплексные особенности, архитектурные решения |

**Правило принятия решения**: используйте режим планирования (дважды Shift+Tab) для известного объема. Используйте специальные планы `.md`, если вы ожидаете недопонимания или хотите явного подтверждения подхода перед одной строкой кода.

---

### Трехэтапный рабочий процесс

```
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1: RESEARCH                                              │
│  → Emphatic prompt → research.md (written, not verbal)          │
├─────────────────────────────────────────────────────────────────┤
│  Phase 2: PLANNING (Annotation Cycle)                           │
│  → plan.md draft → human annotates → agent updates → repeat    │
│  → Exit: plan approved, no open questions                       │
├─────────────────────────────────────────────────────────────────┤
│  Phase 3: IMPLEMENTATION                                        │
│  → Mechanical execution, decisions already made                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Этап 1: Целенаправленное исследование

Claude скользит без сильного сигнала. Используйте выразительный язык, чтобы усилить глубину:

```
Research the authentication system in this codebase deeply.
Understand the intricacies of how sessions are managed, in great detail.
Cover edge cases, existing patterns, and any non-obvious dependencies.

Write your findings to research.md — do not implement anything.
```

**Почему это работает**: «глубоко», «очень подробно», «тонкости» переводят Claude от поверхностного сканирования к тщательному исследованию. Вывод должен быть записан в файл. Словесные резюме исчезают при сжатии контекста.

**Research.md должен включать**:
- Существующие шаблоны и соглашения
- Пути к файлам и ключевые функции
- Неочевидные зависимости
- Выявлены ограничения и риски

В старую или общую базу кода добавьте то, что код не может сообщить в следующем сеансе: владельцы, вызывающие объекты, существующие тесты, производственные сигналы, соответствующая история и открытые вопросы. Заставьте каждое утверждение указывать доказательства (файл и строку, проблему, запись о владельце, панель мониторинга), чтобы следующий сеанс мог проверить его, а не доверять ему. Адди Османи называет это меморандумом о понимании и утверждает, что, если в результате исследования агента не получается долговечного артефакта, «следующий агент снова платит за ту же самую археологию» ([Brownfield Agentic Engineering](https://addyo.substack.com/p/brownfield-agentic-engineering), сентябрь 2026 г.).

---

### <a name="phase-2-the-annotation-cycle"></a>Этап 2: Цикл аннотаций

Ядро паттерна Бориса Тане. Выполняйте итерацию `plan.md` до готовности, **перед любой реализацией**.

```
┌──────────────────────────────────────────────────────────────┐
│                    ANNOTATION CYCLE                           │
│                                                              │
│  Human prompt ──→ Agent writes plan.md                       │
│       ↑                    ↓                                 │
│  Annotate plan    Human reviews plan.md                      │
│  (add comments,          ↓                                   │
│   ask questions,   Issues found?                             │
│   flag trade-offs)       ├─ Yes → Annotate → loop           │
│                          └─ No  → Approved → Phase 3        │
│                                                              │
│  Typical: 1-6 iterations before approval                     │
└──────────────────────────────────────────────────────────────┘
```

**Подсказка охраны**. Всегда включайте это, чтобы предотвратить преждевременное внедрение:

```
Based on research.md, write a plan for implementing [feature].

Include: approach, affected file paths, code snippets for key decisions,
trade-offs considered, and open questions.

Write to plan.md. Do NOT implement anything yet.
```

**Что должен содержать plan.md**:

```markdown
# Plan: [Feature Name]

## Approach
[Strategy and rationale]

## Files Affected
- path/to/file.ts — what changes and why
- path/to/other.ts — what changes and why

## Key Implementation Details
[Code snippets for non-obvious parts — not the full implementation]

## Trade-offs
- Option A vs B: chose A because X
- Considered but rejected: Y (reason)

## Open Questions
- [ ] Should we handle edge case Z?
- [ ] Does this affect the mobile client?
```

**Пример аннотации**:

```markdown
## Approach
Use JWT tokens stored in httpOnly cookies.
<!-- Human annotation: ✓ Agreed. But also consider refresh token rotation -->

## Open Questions
- [ ] Should we handle token expiry in middleware?
<!-- Human annotation: Yes, centralize this — don't leave it to each route -->
```

**Критерии выхода**. План готов, когда:
- Открытых вопросов не осталось
- Компромиссы документированы и согласованы
- Пути к файлам специфичны (а не «какой-то файл аутентификации»)
- Ключевые фрагменты демонстрируют подход, а не просто описывают его.

> «Файл уценки действует как общее изменяемое состояние между вами и агентом». (Борис Тане)

---

### Этап 3: Механическая реализация

После утверждения плана его реализация переходит в исполнение; не осталось творческих решений.

```
Implement everything in plan.md.
Work through each item sequentially.
Mark tasks as completed as you go with [x].
Do not stop between tasks to ask for confirmation — keep going until done.
```

**Отзывы в ходе реализации**:
- Будьте лаконичны: короткие фразы или скриншоты, а не абзацы.
- Решения уже приняты; перенаправить изменения области обратно на plan.md
- Если произойдет что-то неожиданное: сделайте паузу, обновите plan.md, продолжайте.

**Изменение мышления**: Фаза 3 — механическая. Все размышления происходили на этапе 2.

---

### Дополнительные методы

| Техника | Что | Когда |
|-----------|------|------|
| **Cherry-picking** | Реализуйте подмножество plan.md | План слишком большой, реализуйте постепенно |
| **Обрезка прицела** | Удалите элементы из плана перед реализацией | Снизьте риск, сосредоточьтесь на главном |
| **Справочное руководство** | Укажите на существующий код: «сделайте это как auth.ts». | Обеспечьте согласованность |
| **Вернуть и изменить область действия** | `git revert` + перезапуск с более узким планом | План пошел не так, сбросьте настройки |

---

## <a name="see-also"></a>См. также

- [AI Шаблоны проектирования: «Планируй, затем исполняй».](../core/ai-design-patterns.md#plan-then-execute): план как проверяемый артефакт и контрольная точка перед выполнением.
- [exploration-workflow.md](./exploration-workflow.md): изучите альтернативы перед планированием.
- [../ultimate-guide.md](../ultimate-guide.md): Раздел 2.3 Режим планирования
- [tdd-with-claude.md](./tdd-with-claude.md): объединить с TDD
- [spec-first.md](./spec-first.md): объединить со Spec-First
- [iterative-refinement.md](./iterative-refinement.md): итерация после плана.
- [task-management.md](./task-management.md): отслеживайте выполнение плана в разных сеансах с помощью задач API.
- [dual-instance-planning.md](./dual-instance-planning.md): Дополнительно: используйте два экземпляра Claude (планировщик + исполнитель) для рабочих процессов, ориентированных на качество.
