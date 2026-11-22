---
title: "RPI: исследование → планирование → реализация"
description: "Трехэтапный шаблон разработки функций с явными воротами проверки между этапами."
tags: [workflow, architecture, design-patterns, validation]
---

# RPI: исследование → планирование → реализация.

> **Confidence**: Уровень 2, синтезированный на основе шаблонов производственной группы. Структура на основе вентилей соответствует рекомендациям Anthropic по декомпозиции задач агента и управлению агентским циклом.

Создавайте функции в три последовательных этапа: сначала исследуйте осуществимость, затем спланируйте реализацию, затем напишите код. Каждая фаза производит конкретный артефакт. Каждые ворота требуют явного GO перед началом следующей фазы.

---

## Оглавление

1. [TL;DR](#tldr)
2. [Когда использовать RPI](#when-to-use-rpi)
3. [Как работают ворота](#how-the-gates-work)
4. [Фаза 1: Исследования](#phase-1-research)
5. [Фаза 2: План](#phase-2-plan)
6. [Фаза 3: Реализация](#phase-3-implement)
7. [Шаблоны команд косой черты](#slash-command-templates)
8. [Работающий пример](#worked-example)
9. [Сравнение с другими рабочими процессами](#comparison-to-other-workflows)
10. [Советы и устранение неполадок](#tips-and-troubleshooting)
11. [См. также](#see-also)

---

## <a name="tldr"></a>ТЛ;ДР

```
Phase 1 — Research:
  Claude explores feasibility, surfaces risks, asks decision questions
  Output: RESEARCH.md
  Gate: You decide GO / NO-GO

Phase 2 — Plan:
  Claude writes architecture decisions, user stories, test plan
  Output: PLAN.md
  Gate: You approve the plan before any code is written

Phase 3 — Implement:
  Claude implements step by step, tests pass before each next step
  Output: working code + passing tests
  Gate: each implementation step validated before the next begins
```

**Наилучший вариант для**: функции с неясной осуществимостью, работа более одного дня, неизвестная техническая территория или что-то еще, где позднее обнаружение неправильного предположения обходится дорого.

---

## <a name="when-to-use-rpi"></a>Когда использовать RPI

### Используйте RPI, когда

- **Выполнимость неизвестна.**: у вас есть идея, но вы не уверены, что она выполнима технически.
- **Объем большой**: работа по внедрению заняла более одного дня
- **Требования нечеткие**: вы знаете желаемый результат, а не путь к нему.
- **Высокий риск неверного направления**: Безопасность, платежи, миграция данных, интеграция с внешними системами.
- **Вы уже были удивлены**: функция выглядела простой, но на самом деле она задействовала 6 других систем.

### Пропустить RPI, когда

| Сценарий | Лучший подход |
|----------|----------------|
| Исправление очевидно (опечатка, неправильный цвет) | Прямое редактирование |
| Функция понятна, требования ясны. | [Spec-First](./spec-first.md) или [двойной экземпляр](./dual-instance-planning.md) |
| Режим исследования (вы еще не знаете, чего хотите) | Рабочий процесс исследования |
| Небольшое изменение, один файл | Просто сделай это |

### Эвристика принятия решений

Спросите себя: «Если на этапе исследования выяснится серьезная проблема, рад ли я, что не потратил два дня на ее реализацию?»

Если да, запустите RPI. Этап исследования обычно занимает 30–60 минут и может сэкономить много часов.

---

## <a name="how-the-gates-work"></a>Как работают ворота

RPI имеет два человеческих шлюза и один автоматический шлюз на каждом этапе реализации.

```
[Idea]
   |
   v
[Phase 1: Research]
   |
   +- NO-GO -> Stop. Document why. Archive RESEARCH.md.
   |
   +- GO -------------------------------------------------------->
                                                                 |
                                                       [Phase 2: Plan]
                                                                 |
                                          +- Needs revision -> iterate with Claude
                                          |
                                          +- Approved -------------------------------->
                                                                                      |
                                                                          [Phase 3: Implement]
                                                                              Step 1 -> Test gate
                                                                              Step 2 -> Test gate
                                                                              Step 3 -> Test gate
                                                                                   |
                                                                                [Done]
```

**Ворота 1 (после исследования)**: Вы читаете RESEARCH.md и принимаете решение GO/NO-GO. Это самые важные ворота, потому что они полностью предотвращают построение неправильных вещей.

**Gate 2 (после Плана)**: вы проверяете PLAN.md до написания кода. Незначительные изменения происходят здесь без каких-либо затрат.

**Шаговые элементы (во время реализации)**: Каждый шаг реализации должен пройти тесты, прежде чем Claude перейдет к следующему шагу. Автоматизировано, никаких действий человека не требуется, за исключением случаев сбоя на этапе.

---

## <a name="phase-1-research"></a>Этап 1: Исследования

### Что охватывает исследование

Этап исследования отвечает на пять вопросов:

1. **Что уже существует?** Соответствующий код, библиотеки, предыдущие попытки в кодовой базе
2. **Что нужно построить?** Граница области действия, компоненты, которые необходимо создать или изменить
3. **Каковы риски?** Технические вопросы, безопасность, интеграция, производительность
4. **Каковы точки принятия решений?** Выбор архитектуры, влияющий на весь план
5. **Какова оценка усилий?** Приблизительный расчет перед принятием плана

Claude исследует базу кода, читает соответствующие файлы, проверяет зависимости и выявляет любые ограничения, которые могут изменить план. Результат: RESEARCH.md.

### Начало исследования

Создайте папку объектов и вызовите исследование:

```bash
mkdir -p .claude/features/[feature-name]
```

Тогда в Claude:

```
/rpi:research [feature description]
```

Или без команды косой черты:

```
Run RPI Phase 1 (Research) for: [feature description]

Save output to .claude/features/[feature-name]/RESEARCH.md
Use Plan Mode to explore without modifying code.
```

### Шаблон RESEARCH.md

```markdown
# Research: [Feature Name]

**Date**: [YYYY-MM-DD]
**Requested**: [One-sentence description of the feature]
**Status**: PENDING DECISION

---

## What Exists Today

### Relevant Code
- [file path]: [what it does, why it matters]
- [file path]: [what it does, why it matters]

### Relevant Libraries
- [library]: [currently used / available / needs to be added]

### Prior Attempts or Related Work
- [any existing partial implementation, related PR, note in codebase]

---

## What Needs to Be Built

### New Files
- [file path]: [purpose]
- [file path]: [purpose]

### Files to Modify
- [file path]: [what changes, why]

### External Dependencies
- [dependency]: [reason needed, version constraint if any]

---

## Risks

| Risk | Likelihood | Impact | Notes |
|------|-----------|--------|-------|
| [risk description] | Low/Med/High | Low/Med/High | [mitigation or blocker] |

---

## Architecture Decision Points

Questions that need a decision before planning can start:

1. **[Decision]**: Option A (pros: X, cons: Y) vs Option B (pros: X, cons: Y)
2. **[Decision]**: [Options and trade-offs]

---

## Effort Estimate

- Research-to-plan: [time]
- Implementation: [time range]
- Testing: [time]
- **Total estimate**: [range]

**Confidence in estimate**: Low / Medium / High
**Why**: [reason for confidence level]

---

## Recommendation

[GO / NO-GO / NEEDS CLARIFICATION]

[1-3 sentences explaining the recommendation]

---

**Decision**: [ ] GO  [ ] NO-GO  [ ] NEEDS CLARIFICATION
**Notes**: [human fills this in]
```

### Как выглядит NO-GO

Не каждая фаза исследования заканчивается в GO. Распространенные причины отказа:

- **Технический блокировщик**: Внешний API не поддерживает требуемую операцию.
- **Обнаружено нарушение области действия**: «Простая функция» требует перезаписи уровня аутентификации
- **Существует лучшая альтернатива**: Исследование выявило существующую библиотеку или изменение конфигурации, которое проще решает проблему.
- **Риск на данный момент слишком высок.**: функция действительна, но время выбрано неправильно.

Архивируйте исследовательскую документацию NO-GO. Это ценные записи о принятых решениях и причинах.

---

## <a name="phase-2-plan"></a>Этап 2: План

### Что включает в себя план

Фаза 2 начнется только после того, как вы отметите RESEARCH.md с помощью GO. Claude читает исследовательский документ и составляет точный план реализации.

Хороший план достаточно конкретен, чтобы другой инженер (или Claude в новом сеансе) мог выполнить его, не задавая вопросов.

```
/rpi:plan .claude/features/[feature-name]/RESEARCH.md
```

Или без команды косой черты:

```
Run RPI Phase 2 (Plan) using:
- Research: .claude/features/[feature-name]/RESEARCH.md

Save output to .claude/features/[feature-name]/PLAN.md
Do not write any code yet. Plan only.
```

### Шаблон PLAN.md

```markdown
# Plan: [Feature Name]

**Date**: [YYYY-MM-DD]
**Research**: [link to RESEARCH.md]
**Estimated effort**: [from research]
**Risk level**: Low / Medium / High

---

## Summary

[2-4 sentences: what this implements, major design decisions taken, what it does NOT include]

---

## Architecture Decisions

[Record decisions made from the research decision points]

1. **[Decision]**: Chose [Option] because [reason]
2. **[Decision]**: Chose [Option] because [reason]

---

## Implementation Steps

Steps must be sequential and independently testable.

### Step 1: [Name]

**Files**: [list of files to create or modify]
**What to build**: [precise description]
**Test gate**: [specific test or check that must pass before Step 2 starts]

### Step 2: [Name]

**Files**: [list of files to create or modify]
**What to build**: [precise description]
**Test gate**: [specific test or check that must pass before Step 3 starts]

[...continue for all steps]

---

## Success Criteria

- [ ] [Testable criterion — describes observable behavior, not implementation]
- [ ] [Testable criterion]
- [ ] All step test gates pass

---

## Out of Scope

Explicitly list what this plan does NOT cover:
- [thing excluded]
- [thing excluded]

---

## Risks Accepted

[From RESEARCH.md risks, list which are accepted and how they're mitigated]

---

## Rollback Plan

If implementation fails mid-way:
- [what to undo]
- [how to restore previous state]

---

**Plan approved?** [ ] YES — proceed to implementation
**Revision notes**: [human fills this in if changes needed]
```

### Обзор плана

Прежде чем утвердить, внимательно прочитайте PLAN.md. Цель состоит в том, чтобы выявить проблемы проектирования сейчас, а не во время реализации. Конкретные вещи, которые следует проверить:

- Шаги реализации расположены в правильном порядке, без скрытых зависимостей.
- Тестовые ворота бетонны и пригодны для эксплуатации (а не «выглядят правильно»)
- Выход за рамки явный (предотвращает чрезмерное создание Claude)
- План отката существует для всего, что касается данных или общего состояния.

Если план нуждается в изменениях, попросите Claude внести изменения перед утверждением. Это бесплатно. Пересмотр после утверждения требует времени на реализацию.

---

## <a name="phase-3-implement"></a>Этап 3: Реализация

### Схема ступенчатых ворот

Реализация идет шаг за шагом. На каждом этапе есть контрольные ворота. Claude не начинает следующий шаг, пока не пройдут текущие ворота.

```
/rpi:implement .claude/features/[feature-name]/PLAN.md
```

Или без команды косой черты:

```
Run RPI Phase 3 (Implement) using:
- Plan: .claude/features/[feature-name]/PLAN.md

Rules:
- Implement one step at a time
- After each step, run the test gate specified in the plan
- Do not start the next step until the test gate passes
- If a test gate fails, stop and report the failure — do not improvise a fix
- Commit after each step that passes its gate
```

### Что происходит во время реализации

Claude последовательно выполняет шаги плана. Для каждого шага:

1. Реализует указанные файлы и изменения
2. Запускает тестовый шлюз (модульные тесты, проверка интеграции или ручная проверка).
3. Если ворота пройдены: фиксируется с сообщением, ссылающимся на шаг, объявляет о готовности к следующему шагу.
4. Если ворота выходят из строя: сообщает о сбое, конкретных результатах теста и вероятной причине. Не пытается исправить, пока вы не подтвердите.

Шаблон пошаговой фиксации дает вам чистую историю git, отражающую план. Если что-то пойдет не так на шаге 4, вы можете без проблем вернуться к коммиту шага 3.

### Протокол отказа Step-Gate

При сбое тестового шлюза Claude сообщает:

```
Step [N] gate failed.

Gate: [what was supposed to pass]
Output:
[actual test output]

Likely cause: [Claude's diagnosis]
Options:
1. Fix: [specific change that would likely fix it]
2. Revise plan: [if the plan step itself has a flaw]
3. Stop and investigate: [if the failure reveals something unexpected]

Which should I do?
```

Вы решаете. Claude не выполняет автоматическое исправление и не продолжает работу, потому что именно так реализация отклоняется от планов.

---

## <a name="slash-command-templates"></a>Шаблоны команд слэша

Сохраните их в `.claude/commands/`, чтобы напрямую вызывать каждую фазу.

### `/rpi:research`

Сохраняем в `.claude/commands/rpi-research.md`:

```markdown
# RPI Phase 1: Research

Run feasibility research for the requested feature.

## Instructions

1. Enter Plan Mode (do not modify files during research)
2. Explore the codebase to answer these questions:
   - What already exists that's relevant?
   - What files will need to change or be created?
   - What are the technical risks?
   - What decisions need to be made before planning?
   - What is a rough effort estimate?
3. Save output to `.claude/features/$ARGUMENTS/RESEARCH.md` using the template below
4. End with a clear recommendation: GO, NO-GO, or NEEDS CLARIFICATION
5. Ask the user for their GO/NO-GO decision before proceeding

## Constraints

- Do NOT write any code
- Do NOT modify any files
- Do NOT start planning implementation steps
- If uncertain about scope, surface it as a decision point
```

### `/rpi:plan`

Сохраняем в `.claude/commands/rpi-plan.md`:

```markdown
# RPI Phase 2: Plan

Create an implementation plan based on approved research.

## Pre-check

Before starting:
1. Read the RESEARCH.md file specified in $ARGUMENTS
2. Verify it has a GO decision marked
3. If no GO decision found, stop and ask the user to decide first

## Instructions

1. Read RESEARCH.md carefully
2. Create PLAN.md in the same feature folder
3. Architecture decisions: resolve all decision points from research
4. Implementation steps: each step must have a concrete test gate
5. Success criteria: observable, testable, not implementation-internal
6. Out-of-scope: explicit list of what this plan does NOT cover
7. Do NOT write any implementation code
8. After writing the plan, ask the user to review and approve

## Constraints

- Do NOT write implementation code
- Steps must be sequential and independently testable
- Test gates must be runnable commands or precise manual checks, not vague descriptions
- Each step should be achievable in a single focused session
```

### `/rpi:implement`

Сохраняем в `.claude/commands/rpi-implement.md`:

```markdown
# RPI Phase 3: Implement

Implement the feature following an approved plan, one step at a time.

## Pre-check

Before starting:
1. Read the PLAN.md file specified in $ARGUMENTS
2. Verify it has an approval marked
3. If no approval found, stop and ask the user to approve first

## Instructions

For each step in the plan:
1. Read the step description carefully
2. Implement only what the step specifies — nothing more
3. Run the test gate exactly as written in the plan
4. If the gate passes:
   - Commit with message: "feat([feature]): step [N] — [step name]"
   - Announce step completion and readiness for next step
5. If the gate fails:
   - Report the exact failure output
   - Diagnose the likely cause
   - Present options (fix, revise plan, stop)
   - Wait for human decision before proceeding

## Constraints

- Never skip a test gate
- Never start the next step before the current gate passes
- Never modify files outside the scope of the current step
- If you encounter something unexpected that changes the plan, stop and report it
- Commit after each passing step — not at the end
```

---

## <a name="worked-example"></a>Рабочий пример

**Request**: «Добавьте ограничение скорости для общедоступных конечных точек API».

### Этап 1: Результаты исследования (сокращенно)

```markdown
# Research: API Rate Limiting

**Date**: 2026-03-12
**Status**: PENDING DECISION

## What Exists Today

- `src/middleware/` — has auth middleware, no rate limiting
- `package.json` — express-rate-limit not installed, redis available
- `src/routes/api.ts` — 14 public endpoints, unauthenticated routes mixed with authenticated ones

## What Needs to Be Built

- Rate limiter middleware for public endpoints
- Separate limits for authenticated vs unauthenticated users
- Redis store for distributed rate limiting (app runs on 3 instances)

## Risks

| Risk | Likelihood | Impact | Notes |
|------|-----------|--------|-------|
| Redis connection failure disables all API access | Low | High | Need fallback to in-memory if Redis unavailable |
| Rate limit too aggressive — breaks existing integrations | Medium | High | Need to survey current usage patterns first |

## Architecture Decision Points

1. **Library**: express-rate-limit (maintained, battle-tested) vs custom middleware
2. **Bypass for trusted IPs**: Allow internal services to bypass rate limiting?

## Effort Estimate

- Implementation: 2-4 hours
- Testing: 2 hours
- **Total**: 4-6 hours

**Recommendation**: GO — standard problem, good library options, main risk is Redis fallback which is solvable.
```

**Человеческое решение**: ВПЕРЕД. Используйте экспресс-ограничение скорости. Обхода IP пока нет.

### Этап 2: План (сокращенно)

```markdown
# Plan: API Rate Limiting

**Risk level**: Medium (shared Redis state, potential to block legitimate traffic)

## Architecture Decisions

1. Library: express-rate-limit with rate-limit-redis store
2. No IP bypass initially — revisit if internal service issues arise
3. Unauthenticated: 100 requests/15 minutes. Authenticated: 1000 requests/15 minutes.
4. Redis failure fallback: in-memory store (accepts single-instance inconsistency)

## Implementation Steps

### Step 1: Install dependencies and configure Redis store

**Files**: `package.json`, `src/config/rate-limit.ts`
**Test gate**: `npm install` completes, `src/config/rate-limit.ts` exports config without errors

### Step 2: Implement rate limiter middleware

**Files**: `src/middleware/rate-limit.ts`
**Test gate**: Unit test — limiter blocks 101st request from same IP within 15 minutes

### Step 3: Apply to routes

**Files**: `src/routes/api.ts`
**Test gate**: Integration test — unauthenticated route returns 429 after 100 requests; authenticated route does not

### Step 4: Add Redis fallback

**Files**: `src/config/rate-limit.ts`
**Test gate**: Test with Redis unavailable — API still responds (200, not 500), in-memory limiting active
```

**Человеческий обзор**: Одобрено.

### Этап 3: Реализация

Claude реализует шаг 1, запускает шлюз (`npm install` + проверка импорта), фиксирует `feat(rate-limit): step 1 — dependencies and config`. Затем последовательно Шаг 2, Шаг 3, Шаг 4. Каждый коммит чистый. Прежде чем продолжить, необходимо пройти каждые ворота.

---

## <a name="comparison-to-other-workflows"></a>Сравнение с другими рабочими процессами

| Рабочий процесс | Фазовая структура | Человеческие ворота | Лучшее для |
|----------|----------------|------------|----------|
| **RPI** | Исследование + Планирование + Реализация | GO/NO-GO + утверждение плана | Неизвестная осуществимость, >1 день, высокий риск неправильного направления |
| **Dual-Instance** | Планирование + реализация (отдельные экземпляры Claude) | Утверждение плана | Известные функции, требующие тщательного выполнения и кропотливой работы. |
| **Spec-First** | Спецификация + реализация | Нет (спецификация — неявный шлюз) | Работа, ориентированная на дизайн, контракты API, сплоченность команды |
| **TDD** | Сначала протестируйте + внедрите | Нет (тесты – это ворота) | Тестовое покрытие как драйвер, рефакторинг, инкрементное поведение |
| **Прямой** | Никто | Никто | Простые изменения, очевидный объем, менее 2 часов |

### RPI против двойного экземпляра

Двойной экземпляр разделяет планирование и реализацию на два экземпляра Claude со строгим соблюдением ролей. Это хорошо работает, когда вы уже знаете, что создаете, и хотите иметь качественный план. RPI добавляет этап технико-экономического обоснования перед планированием, что делает его более удобным для неоднозначных запросов. Если у вас уже есть четкая спецификация, пропустите исследование и используйте двойной экземпляр или сначала спецификацию.

### RPI против спецификации в первую очередь

Spec-first ориентирован на проектирование: вы определяете, что должна делать система, а затем Claude это реализует. RPI ориентирован на реализацию и имеет шлюзы проверки: вы описываете цель, Claude исследует, как ее достичь, затем вы двое согласовываете план, прежде чем прикасаться к коду. Используйте спецификацию в первую очередь, когда проект ясен. Используйте RPI, когда технического пути нет.

### RPI против прямого кодирования

Для чего-либо продолжительностью менее 2 часов с четким объемом просто попросите Claude сделать это. RPI добавляет накладные расходы, которые не оправданы для небольших задач. Сама фаза исследования занимает 30-60 минут. Эти накладные расходы окупаются при работе с многодневными функциями, где позднее обнаружение неверного предположения обходится гораздо дороже.

---

## <a name="tips-and-troubleshooting"></a>Советы и устранение неполадок

### Claude переходит к реализации на этапе исследования

**Проблема**: Claude начинает писать код на этапе исследования.

**Решение**: используйте режим планирования (дважды Shift+Tab) специально для этапа исследования. Включите эту строку в команду исследования:

```
You are in Plan Mode. Do not modify files. Do not write implementation code.
Research only. Output goes to RESEARCH.md.
```

Или добавьте в свой CLAUDE.md:

```markdown
## RPI Rules
- /rpi:research runs in Plan Mode only — no file modifications
- /rpi:plan produces only PLAN.md — no implementation code
- /rpi:implement runs one step at a time, waits for test gate before next step
```

### Фаза исследования длится слишком долго

**Проблема**: Claude исследует всю кодовую базу вместо того, чтобы сосредоточиться на том, что важно.

**Решение**: Четко определите масштаб исследования:

```
/rpi:research payment-processing

Focus area: src/payments/, src/routes/checkout.ts
Do not explore: frontend, auth, unrelated backend modules
Time budget: complete research in one session
```

### В плане слишком много шагов

**Проблема**: PLAN.md состоит из 12 шагов, что делает реализацию громоздкой.

**Решение**: План, содержащий более 6–8 шагов, обычно требует сокращения объема, а не более детальной реализации. Спросите Claude:

```
The plan has too many steps. What is the minimal viable scope that delivers
the core value? Revise the plan to implement only that, with a clear
"Future work" section for the rest.
```

### Тестовые ворота расплывчаты

**Проблема**: Тестовый шлюз шага говорит «проверьте, работает», а не конкретную команду.

**Решение**: Отклоните неопределенные ворота перед утверждением плана. Оттолкнитесь с помощью:

```
Step 3's test gate is "verify rate limiting works." Make it specific:
what command do I run, and what output do I expect to see when it passes?
```

Хороший тестовый гейт:

```
Test gate: `npm test src/middleware/rate-limit.test.ts` — all 4 tests pass
```

Плохой тестовый гейт:

```
Test gate: rate limiting is working correctly
```

### Ступенчатые ворота неоднократно выходят из строя

**Проблема**: ворота шага 2 продолжают выходить из строя даже после попыток исправления.

**Решение**: Две ошибки означают, что нужно изучить план, а не продолжать вносить исправления.

```
Stop implementation. The Step 2 gate has failed twice.
Review the plan — is the test gate achievable given the Step 1 output?
Do we need to revise the plan before continuing?
```

---

## Сводная информация о структуре файла

```
.claude/
└── features/
    └── [feature-name]/
        ├── RESEARCH.md     # Phase 1 output (human annotates GO/NO-GO)
        └── PLAN.md         # Phase 2 output (human annotates approval)

.claude/commands/
├── rpi-research.md         # /rpi:research slash command
├── rpi-plan.md             # /rpi:plan slash command
└── rpi-implement.md        # /rpi:implement slash command
```

Архив завершенных функций:

```bash
mkdir -p .claude/features/_archive
mv .claude/features/payment-processing .claude/features/_archive/
```

Архив представляет собой обучающий ресурс: завершенные файлы RESEARCH.md и PLAN.md показывают, как рассматривались предыдущие функции.

---

## <a name="see-also"></a>См. также

- [dual-instance-planning.md](./dual-instance-planning.md): шаблон с двумя экземплярами для реализации со сложными спецификациями.
- [spec-first.md](./spec-first.md): рабочий процесс «сначала проектирование» с использованием CLAUDE.md в качестве контракта.
- [tdd-with-claude.md](./tdd-with-claude.md): объедините с TDD для реализации тестового шлюза.
- [task-management.md](./task-management.md): Управление многоэтапными задачами в рамках сеансов.
- **Основное руководство**: раздел «Расширенные шаблоны», обзор нескольких экземпляров и шаблонов планирования