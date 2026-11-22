# CLAUDE.md: [Название проекта]

<!--
HOW TO USE THIS SKELETON

Fill in each section based on your project. Delete placeholder comments when done.
Goal: give Claude enough context to make correct decisions without asking, while staying under 500 lines.

Key principles:
- Specific beats vague: "Use zod for external input validation" beats "validate inputs"
- Anti-patterns are as valuable as rules: tell Claude what NOT to do
- Update after each significant session (see rules/update-loop-retro.md)
- Run `canary-check.sh` weekly to catch drift
-->

## Обзор проекта

<!--
Write 2-3 sentences answering:
- What does this project do?
- Who uses it? (internal tool, public API, consumer app, etc.)
- What's the primary language and deployment target?

Example:
"A REST API that processes financial transactions for retail merchants, consumed by a Next.js
dashboard and a React Native mobile app. Built with Node.js + TypeScript, deployed to AWS ECS.
PCI-DSS compliance applies to all payment-adjacent code."
-->

[ОПИСАНИЕ ПРОЕКТА]

## Архитектура

<!--
Describe the shape of the system. Not a tutorial — just the decisions Claude needs to
make correct assumptions. Diagrams are optional; prose is fine.

Cover:
- Monolith or services? If services, how many and how do they communicate?
- How is state managed (database, cache, event sourcing)?
- Key data flow (request lifecycle, async patterns)
- Folder structure if non-obvious
-->

### Куча

| Слой | Технология | Версия |
|-------|-----------|---------|
| Язык | TypeScript | 5.x |
| Время выполнения | Node.js | 20.x |
| Рамки | [например, Express, Fastify, NestJS] | x.x |
| База данных | [например, PostgreSQL] | x.x |
| ORM/Построитель запросов | [например, Призма, Морось, Кнекс] | x.x |
| Кэш | [например, Redis, нет] | - |
| Очередь сообщений | [например, BullMQ, SQS, нет] | - |
| Внешний интерфейс | [например, Next.js, нет] | x.x |
| Тестирование | [например, Витест, Джест] | x.x |
| CI/CD | [e.g., GitHub Actions] | - |

### Структура папок

```
src/
  [describe key directories and what belongs in each]
  [example: api/ — route handlers only, no business logic]
  [example: services/ — business logic, called by handlers]
  [example: db/ — Prisma schema, migrations, query functions]
```

### Ключевые архитектурные решения

<!--
Record the "why" behind non-obvious choices. This prevents Claude from suggesting
alternatives that were already considered and rejected.

Example:
- Repository pattern is NOT used — we use Prisma directly in services (decision: team
  familiarity, added abstraction not worth it at current scale)
- Zod schemas are colocated with route handlers, not in a shared schemas/ directory
-->

- [РЕШЕНИЕ 1]
- [РЕШЕНИЕ 2]

## Стандарты кода

<!--
Be specific. "Write clean code" is useless. "Use named exports only — no default exports" is actionable.
Organize by language/domain if you have multiple.
-->

### TypeScript

- Строгий режим включен (`"strict": true` в tsconfig). Никогда не используйте `any` — используйте `unknown` и сужайте.
- Все сигнатуры общедоступных функций должны иметь явные типы возвращаемых значений.
- Используйте `type` для объединений и пересечений, `interface` для фигур объектов, которые можно расширять.
- [ДОБАВИТЬ СВОИ ПРАВИЛА]

### Именование

- Файлы: `kebab-case.ts` (например, `user-service.ts`, `create-order.test.ts`)
- Классы: `PascalCase`
- Функции и переменные: `camelCase`
- Константы: `SCREAMING_SNAKE_CASE`
- [ДОБАВИТЬ ИСКЛЮЧЕНИЯ]

### Обработка ошибок

<!--
Undefined behavior here causes the most inconsistency. Be explicit.

Example:
- All async functions must be wrapped in try/catch at the handler boundary
- Errors propagate up as typed error objects, never raw strings
- Use the AppError class in src/errors.ts — never throw plain Error objects in service layer
-->

- [ПРАВИЛА ОБРАБОТКИ ОШИБОК]

### Комментарии

<!--
Example:
- Inline comments only on non-obvious logic (never explain what the code does, only why)
- All exported functions must have a JSDoc block with @param and @returns
- TODO comments are not allowed in production code — open an issue instead
-->

- [ПРАВИЛА КОММЕНТАРИЙ]

## Рабочий процесс разработки

### Соглашения Git

- Именование ветки: `[type]/[short-description]` — например, `feat/add-refund-flow`, `fix/order-status-race`.
- Формат фиксации: [Обычные фиксации](https://www.conventionalcommits.org/)
  - `feat:` новая функция
  - Исправление ошибки `fix:`
  - Обслуживание `chore:`, обновления зависимостей
  - Только документация `docs:`
  - Только тесты `test:`
  - `refactor:` поведение не изменилось
- Коммиты должны быть атомарными — одно логическое изменение на каждый коммит.
- [ДОБАВЬТЕ ИСКЛЮЧЕНИЯ ИЛИ ДОПОЛНИТЕЛЬНЫЕ ТИПЫ]

### PR-требования

<!--
Example:
- All PRs require at least one reviewer
- CI must be green before merge
- PR description must include "Why" not just "What"
- Link to issue or ticket in PR body
-->

- [ПРАВИЛА ПР]

### Локальная настройка

```bash
# Install dependencies
[INSTALL COMMAND]

# Set up environment
cp .env.example .env
# Edit .env with your local values

# Run database migrations
[MIGRATION COMMAND]

# Start development server
[DEV COMMAND]
```

## Тестирование

<!--
Vague testing rules produce no tests. Specific rules produce correct tests.
Tell Claude: what framework, what to test, how to structure tests, what coverage means here.
-->

### Каркас и расположение

- Фреймворк: [например, Vitest]
- Тестовые файлы: расположены рядом с исходным кодом (`foo.ts` → `foo.test.ts`) ИЛИ в `__tests__/` [выберите один]
- Запуск тестов: `[TEST COMMAND]`
- Запуск с покрытием: `[COVERAGE COMMAND]`

### Что требует испытаний

- Все функции сервисного уровня (модульные тесты с имитируемыми зависимостями)
- Все маршруты API (интеграционные тесты с использованием супертеста или его эквивалента)
- Все служебные функции, содержащие логику ветвления.
- **Не требуется**: чистые сквозные функции, простой getters/setters, определения модели Prisma

### Структура теста

```typescript
// Follow this pattern:
describe('[unit under test]', () => {
  describe('[method or scenario]', () => {
    it('[expected behavior in plain English]', async () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Насмешливый

- Издевайтесь над границей: издевайтесь над внешними сервисами, а не над внутренними модулями.
- [ДОБАВЬТЕ СВОИ ИЗДАТЕЛЬСКИЕ СОГЛАШЕНИЯ — например, «Используйте vi.mock() на уровне файла, а не внутри тестов»]

## Развертывание

### Окружающая среда

| Среда | Ветвь | URL-адрес | Примечания |
|------------|--------|-----|-------|
| Местный | любой | локальный хост: [ПОРТ] | |
| Постановка | `main` | [ПЕРЕДАЧА URL-адреса] | Auto-deploys |
| Производство | [TAG/BRANCH] | [URL-адрес ПРОД] | Ручной триггер |

### Развертывать

```bash
# Staging (auto on merge to main — no manual step needed)

# Production
[DEPLOY COMMAND OR PROCESS]
```

### Проверки после развертывания

<!--
Tell Claude what to verify after deploying so it can suggest this when relevant.

Example:
- Check /health endpoint returns 200
- Verify Sentry has no new errors in first 5 minutes
- Confirm database migrations ran (check migration table)
-->

- [Проверки после развертывания]

## Чего Claude НЕ должен делать

<!--
This section is high-value. Anti-patterns prevent regressions and stop Claude from
suggesting alternatives that were already rejected.

Be specific about the pattern AND why it's banned.
-->

### Технологии, которые не используются

- НЕ предлагайте GraphQL — REST — архитектурное решение для этого проекта.
- НЕ используйте [ИМЯ БИБЛИОТЕКИ] — заменено на [АЛЬТЕРНАТИВА] в [VERSION/DATE]
- [ДОБАВЬТЕ СВОИ ЗАПРЕЩЕННЫЕ ТЕХНОЛОГИИ]

### Шаблоны, которых следует избегать

<!--
Example:
- Never use class components in React — functional components only
- Never mutate request/response objects directly — use immutable patterns
- Never use console.log in production code — use the logger at src/lib/logger.ts
- Never hardcode environment-specific values — use process.env with validation in src/config.ts
-->

- [АНТИ-ШАБЛОН 1]
- [АНТИ-ШАБЛОН 2]
- [АНТИ-ШАБЛОН 3]

### Известные проблемные места

<!--
Patterns that caused production bugs or significant rework. Claude should be extra careful here.

Example:
- The order state machine in src/orders/state.ts is complex — always read it fully before modifying
- Payment webhooks are idempotent — every handler must check for duplicate event IDs
-->

- [ИЗВЕСТНАЯ ПРОБЛЕМА 1]
- [ИЗВЕСТНАЯ ПРОБЛЕМА 2]
