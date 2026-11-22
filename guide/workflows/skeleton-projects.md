---
title: "Рабочий процесс скелетных проектов"
description: "Используйте существующие проверенные в боевых условиях репозитории в качестве основы для новых проектов."
tags: [workflow, architecture, template]
---

# Рабочий процесс скелетных проектов

Используйте существующие, проверенные в боевых условиях репозитории в качестве основы для новых проектов, а не начинать с нуля.

---

## <a name="when-to-use"></a>Когда использовать

- **Начинаем новый проект** с известным стеком технологий
- **Стандартизация шаблонов работы команды** для нескольких служб
- **Быстрое прототипирование**, при котором архитектурные решения уже приняты
- **Приём** новых членов команды через рабочую рекомендацию

**Не используйте, когда**: изучение неизвестной технологии (вместо этого используйте [Vibe Coding](#98-vibe-coding-skeleton-projects)) или когда требования слишком уникальны для существующих шаблонов.

---

## <a name="prerequisites"></a>Предварительные условия

- Claude Code установлен и настроен.
- Git-доступ к справочным репозиториям
- Четкое понимание требований целевого проекта

---

## Пошаговое руководство

### <a name="phase-1-find-and-evaluate-a-skeleton"></a>Этап 1: Найдите и оцените скелет

Не стройте с нуля. Найдите существующий репозиторий, соответствующий вашей целевой архитектуре.

**Шаг 1: Поиск кандидатов**

```bash
# Ask Claude to help find reference repos
claude -p "I need a skeleton for a Next.js 15 app with:
- App Router
- Prisma ORM with PostgreSQL
- tRPC for type-safe API
- Tailwind CSS
- Jest + Playwright testing

Search GitHub for well-maintained starter templates.
Evaluate the top 3 by: last commit date, stars, dependency freshness, test coverage."
```

**Шаг 2. Клонирование и аудит**

```bash
git clone <candidate-repo> skeleton-eval
cd skeleton-eval
claude
```

```markdown
User: Audit this repository as a potential skeleton for our project:
1. List all dependencies and their versions (flag outdated ones)
2. Assess code quality: patterns, consistency, test coverage
3. Identify what we'd keep vs. what we'd remove
4. Flag any security concerns (vulnerable deps, exposed secrets)
5. Rate overall suitability (1-5) with specific justification
```

**Шаг 3: Оценка с помощью субагентов** (для тщательного анализа)

```markdown
User: Run a multi-perspective evaluation of this skeleton:

Agent 1 (Security): Check for vulnerabilities, hardcoded secrets, unsafe patterns
Agent 2 (Architecture): Assess modularity, separation of concerns, scalability
Agent 3 (DX): Evaluate developer experience - setup time, documentation, tooling

Synthesize findings into a go/no-go recommendation.
```

### Этап 2: Форк и настройка

**Шаг 4. Создайте свой проект на основе скелета**

```bash
# Create new repo from skeleton
mkdir my-project
cp -r skeleton-eval/. my-project/
cd my-project
rm -rf .git
git init
```

**Шаг 5. Разборка и адаптация с помощью Claude**

```markdown
User: Customize this skeleton for our project "Acme Dashboard":

1. Remove: example routes, demo data, sample tests
2. Keep: config structure, auth setup, database schema pattern, CI pipeline
3. Update: package.json (name, description, version 0.1.0)
4. Add: our CLAUDE.md with project conventions
5. Verify: `pnpm install && pnpm build && pnpm test` all pass after changes

Important: Don't break the working skeleton. Each removal should be followed
by a build check.
```

### Этап 3: Расширение от скелета до MVP

**Шаг 6. Создайте первую настоящую функцию**

```markdown
User: Using the patterns established in this skeleton, implement our first feature:
User Authentication (login + registration + password reset)

Follow the skeleton's existing patterns for:
- Route structure (match the example routes pattern)
- Service layer (match the existing service pattern)
- Test structure (match the example test pattern)
- Error handling (match the existing error pattern)

Create a task plan before starting implementation.
```

**Шаг 7. Проверка целостности скелета**

```markdown
User: Now that we have one real feature, verify the skeleton still works:
1. Run full test suite
2. Check that the CI pipeline passes
3. Verify no skeleton patterns were broken
4. Confirm new code follows skeleton conventions consistently
```

### Этап 4. Документирование и повторение

**Шаг 8. Документируйте решения в CLAUDE.md**.

```markdown
User: Update CLAUDE.md with:
1. Which skeleton we started from (repo URL, commit hash)
2. What we kept and why
3. What we removed and why
4. Any pattern deviations from the original skeleton
5. Conventions we've added on top
```

---

## График расширения скелета

```
Skeleton (Day 1)     →    MVP (Week 1)      →    Production (Month 1)
──────────────────────────────────────────────────────────────────────
1 example route      →    5 real routes      →    20+ routes
1 example test       →    30 tests           →    200+ tests
Basic config         →    Env-based config   →    Multi-env + secrets
SQLite/local DB      →    Docker PostgreSQL  →    Managed DB + migrations
No CI                →    Basic CI           →    Full CI/CD pipeline
README only          →    CLAUDE.md + ADRs   →    Full documentation
```

---

## Пример из реальной жизни: микросервис из скелета

```bash
# 1. Clone proven skeleton
git clone https://github.com/example/express-prisma-starter skeleton
cd skeleton && claude

# 2. Audit (2 minutes)
User: "Audit this skeleton. Is it suitable for a billing microservice?"
# Claude: Reports deps, patterns, suitability score

# 3. Customize (5 minutes)
User: "Strip examples, rename to billing-service, add our CLAUDE.md"
# Claude: Removes demo code, updates config, adds project context

# 4. First feature (30 minutes)
User: "Implement invoice creation endpoint following skeleton patterns"
# Claude: Creates route, service, repo, tests matching skeleton conventions

# 5. Verify (2 minutes)
User: "Run all tests, verify build, check skeleton patterns preserved"
# Claude: All green, patterns consistent
```

---

## <a name="common-pitfalls"></a>Распространенные ловушки

| ловушка | Симптом | Исправить |
|---------|---------|-----|
| Скелет слишком сложен | Тратьте больше времени на разборку, чем на строительство | Выберите более простой скелет или создайте минимальный самостоятельно. |
| Устаревшие зависимости | Предупреждения безопасности при установке | Проверьте дату последней фиксации перед клонированием (в идеале < 6 месяцев) |
| Разрушение скелетных шаблонов | Новый код отличается от скелетных соглашений | Добавьте шаблоны скелета в CLAUDE.md в качестве ограничений. |
| Сохранение мертвого кода | Неиспользуемый пример кода, загромождающий проект | Безжалостно раздевайте на этапе 2, проверяйте сборку после каждого удаления. |
| Нет документации | Забыв, почему был выбран скелет | Немедленно документировать в CLAUDE.md (этап 4) |

---

## Связанные рабочие процессы

- **[Vibe Coding](#98-vibe-coding-skeleton-projects)**: Изучите, прежде чем выбирать скелет.
- **[Plan-Driven Development](./plan-driven.md)**: Планирование настройки скелета перед выполнением
- **[TDD с Claude](./tdd-with-claude.md)**: расширение функций скелета в первую очередь
- **[Permutation Frameworks](#919-permutation-frameworks)**: протестируйте несколько вариантов скелета перед фиксацией.

---

**Последнее обновление**: январь 2026 г.
