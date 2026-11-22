---
title: "Правила производственной безопасности"
description: "Необсуждаемые правила безопасности для команд, развертывающих Claude Code в производственных средах."
tags: [security, guide, devops]
---

# Правила безопасности производства

> **Audience**: команды, развертывающие Claude Code в производственных средах.
> **Для индивидуальных учащихся**: вместо этого см. [Начало работы](#getting-started).

---

## TL;DR (30 секунд)

**6 не подлежащие обсуждению правила для производственных команд**:

1. ✅ **Стабильность порта**: Никогда не меняйте backend/frontend порты
2. ✅ **Безопасность базы данных**: Всегда делайте резервные копии перед разрушительными операциями.
3. ✅ **Полнота функций**: Никогда не поставляйте наполовину реализованные функции.
4. ✅ **Infrastructure Lock**: изменения Docker/env требуют разрешения.
5. ✅ **Безопасность зависимостей**: никаких новых зависимостей без одобрения.
6. ✅ **Pattern Follow**: соответствие существующим соглашениям кодовой базы.

---

## Когда использовать эти правила

| Тип проекта | Использовать эти правила? | Зачем |
|--------------|------------------|-----|
| Обучение / Учебники | ❌ Нет | Слишком ограничено для исследования |
| Индивидуальные прототипы | ❌ Нет | Накладные расходы того не стоят |
| Небольшие команды (2-3), постановка окружения | ⚠️ Частичное | Только правила 1, 3, 6 |
| Производственные приложения, команды из нескольких разработчиков | ✅ Да | Все 6 правил |
| Регулируемые отрасли (HIPAA, SOC2) | ✅ Да + добавить правила соответствия | Критическая безопасность |

---

## Правило 1: Стабильность порта

### <a name="the-problem"></a>Проблема

Изменение портов прерывает:
- Локальные среды разработки
- Docker Составление конфигураций
- Развернутые конфигурации службы
- Настройки членов команды

**Реальный инцидент**: Внутренний порт изменен с 3000 → 8080 во время рефакторинга. Все разработчики потеряли день на перенастройку локальных окружений. Промежуточное развертывание не удалось выполнить автоматически, поскольку прокси-сервер nginx все еще указывал на 3000.

### Правило

**Никогда не изменяйте порты backend/frontend без явного разрешения команды.**

### Выполнение

**Опция A: Отказ в разрешении в `settings.json`**

```json
{
  "permissions": {
    "deny": [
      "Edit(docker-compose.yml:*ports*)",
      "Edit(package.json:*PORT*)",
      "Edit(.env.example:*PORT*)",
      "Edit(vite.config.ts:*port*)"
    ]
  }
}
```

**Опция B: перехватчик предварительной фиксации**

```bash
# .claude/hooks/PreToolUse.sh
if [[ "$TOOL" == "Edit" ]]; then
    FILE=$(echo "$INPUT" | jq -r '.tool.input.file_path')
    CONTENT=$(echo "$INPUT" | jq -r '.tool.input.new_string')

    if [[ "$FILE" =~ (docker-compose|vite.config|package.json) ]] && \
       [[ "$CONTENT" =~ (port|PORT):[[:space:]]*[0-9] ]]; then
        echo "⚠️ BLOCKED: Port modification detected in $FILE"
        echo "Ports must remain stable across team. Request permission first."
        exit 2
    fi
fi
```

**Опция C: ограничение CLAUDE.md**

```markdown
## Port Configuration

**CRITICAL**: Ports are locked for team coordination.

Current ports:
- Frontend (Vite): 5173
- Backend (Express): 3000
- Database: 5432

To change ports:
1. Create RFC document in `/docs/rfcs/`
2. Get team approval (3+ reviewers)
3. Update all environments simultaneously
4. Notify team 48h in advance
```

### Краевые случаи

| Сценарий | Поведение |
|----------|----------|
| Добавляем НОВУЮ услугу | ОК (не нарушает существующее) |
| Изменение порта тестовой среды | ОК (изолировано от dev/prod) |
| Конфликт портов на машине | Попросите пользователя разрешить локально (.env.local). |

---

## Правило 2: Безопасность базы данных

### Проблема

Случайное удаление в производстве = потеря данных.

**Реальные происшествия**:
- `DELETE FROM users WHERE id = 123` → Забыл `WHERE` → Все пользователи удалены
- `DROP TABLE sessions` во время очистки → Производственный стол упал.
- Откат миграции → Потеря данных из-за отсутствия резервной копии

### Правило

**Всегда выполнять резервное копирование перед разрушительными операциями.**

Разрушительные операции:
- `DELETE FROM` (без `LIMIT 1`)
- `DROP TABLE`
- `TRUNCATE`
- `ALTER TABLE ... DROP COLUMN`
- Миграции баз данных, которые невозможно откатить

### Выполнение

**Опция A: привязка предварительного инструмента с принудительной резервной копией**

```bash
# .claude/hooks/PreToolUse.sh
#!/bin/bash
INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool.name')

if [[ "$TOOL" == "Bash" ]]; then
    COMMAND=$(echo "$INPUT" | jq -r '.tool.input.command')

    # Detect destructive database operations
    if [[ "$COMMAND" =~ (DROP TABLE|DELETE FROM|TRUNCATE|ALTER.*DROP) ]]; then
        echo "🚨 BLOCKED: Destructive database operation detected"
        echo ""
        echo "Required steps:"
        echo "1. Create backup: pg_dump -U user dbname > backup_\$(date +%Y%m%d_%H%M%S).sql"
        echo "2. Verify backup size is reasonable"
        echo "3. Re-run after backup confirmation"
        exit 2
    fi
fi

exit 0
```

**Опция B: оболочка безопасности миграции**

```bash
# scripts/safe-migrate.sh
#!/bin/bash
set -e

echo "🔍 Pre-migration checks..."

# 1. Check environment
if [[ "$NODE_ENV" == "production" ]]; then
    echo "❌ BLOCKED: Use migration service for production"
    exit 1
fi

# 2. Create backup
BACKUP_FILE="backups/pre-migration-$(date +%Y%m%d_%H%M%S).sql"
mkdir -p backups
pg_dump $DATABASE_URL > "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# 3. Run migration
echo "🚀 Running migration..."
npm run prisma:migrate:dev

# 4. Verify
echo "🔍 Verifying database state..."
npm run prisma:validate

echo "✅ Migration complete. Backup: $BACKUP_FILE"
```

**Опция C: протокол CLAUDE.md**

```markdown
## Database Operations

### Destructive Operations Protocol

**NEVER run these without backup**:
- DELETE, DROP, TRUNCATE, ALTER...DROP

**Required steps**:
1. Announce in #dev-ops Slack channel
2. Create backup: `./scripts/backup-db.sh`
3. Verify backup: `ls -lh backups/` (should be >0 bytes)
4. Execute in staging FIRST
5. Wait 24h for issues
6. Execute in production with on-call engineer present

**Emergency rollback**:
```bash
psql $DATABASE_URL < backups/[latest].sql
```
```

### MCP database safety

If using MCP database servers (Postgres, MySQL, etc.):

```json
{
  "mcpServers": {
    "database": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_URL": "postgres://readonly:***@dev-db.example.com:5432/appdb"
      },
      "comment": "READ-ONLY user for safety"
    }
  }
}
```

**Critical**: использовать пользователей базы данных только для чтения для MCP. См. [Руководство по конфиденциальности данных](./data-privacy.md#risk-2-mcp-database-access).

---

## Правило 3: Полнота функций

### Проблема

Claude Code иногда "полузадает" функции, когда контекст заканчивается:
- Удаляет существующий функционал вместо исправления ошибок.
- Добавляет комментарии `TODO` для основных функций.
- Оставляет состояния ошибок необработанными
- Создает макеты реализации

**Реальные происшествия**:
- Проверка платежа «исправлена» путем полного удаления проверки.
- Обработка ошибок "добавлена" с `throw new Error("Not implemented")`
- Функция «завершена» с `// TODO: Add actual logic here`

### Правило

**Никогда не поставляйте наполовину реализованные функции. Если вы начнете, вы доведете до рабочего состояния.**

### Выполнение

**Опция A: ограничение CLAUDE.md**

```markdown
## Feature Implementation Standards

### NON-NEGOTIABLE

1. **No TODOs for core functionality**
   - TODOs allowed ONLY for future enhancements
   - Core features must be complete and working

2. **No mock implementations**
   - No `throw new Error("Not implemented")`
   - No fake data generators in production code paths

3. **Complete error handling**
   - Every async call has try/catch
   - Every user input is validated
   - Every API call has timeout and retry logic

4. **Downgrade = Delete the feature entirely**
   - If you can't fix properly, remove the feature
   - Document why in commit message
   - Create issue for proper implementation

### Validation

Before accepting changes, verify:
- [ ] No `TODO` in modified files (except future enhancements)
- [ ] No `throw new Error("Not implemented")`
- [ ] No commented-out code without explanation
- [ ] All new functions have error handling
```

**Опция B: git-перехватчик предварительной фиксации**

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check staged files for "half-assing" patterns
STAGED=$(git diff --cached --name-only --diff-filter=ACM)

for FILE in $STAGED; do
    if [[ "$FILE" =~ \.(ts|tsx|js|jsx|py)$ ]]; then
        # Check for TODOs in core logic (not tests)
        if ! [[ "$FILE" =~ test|spec ]]; then
            if git diff --cached "$FILE" | grep -E "^\+.*TODO.*implement|^\+.*Not implemented"; then
                echo "❌ COMMIT BLOCKED: TODO/Not implemented in $FILE"
                echo "   Complete the feature or remove it entirely."
                exit 1
            fi
        fi

        # Check for mock placeholders
        if git diff --cached "$FILE" | grep -E "^\+.*(MOCK_DATA|fakeData|placeholder)"; then
            echo "⚠️ WARNING: Mock data detected in $FILE"
            echo "   Ensure this is intentional for staging/dev only."
        fi
    fi
done

exit 0
```

**Опция C: Команда оценки выходных данных**

```bash
# Before committing
/validate-changes

# This runs the output-evaluator agent (see examples/agents/output-evaluator.md)
# which scores changes on:
# - Correctness (10/10)
# - Completeness (10/10)  ← Detects half-assing
# - Safety (10/10)
```

---

## Правило 4: Блокировка инфраструктуры

### Проблема

Claude может изменять конфигурации инфраструктуры, не понимая последствий для производства:
- Изменения Docker Создание томов → потеря данных
- Изменяет `.env.example` → прерывает адаптацию
- Обновления Terraform → непреднамеренные изменения ресурсов
- Твики манифестов Kubernetes → время простоя

### Правило

**Для внесения изменений в инфраструктуру требуется явное разрешение команды.**

Файлы для защиты:
- `docker-compose.yml`, `Dockerfile`
- `.env.example` (шаблоны, НЕ личный .env.local)
- `kubernetes/`, `k8s/`, `terraform/`, `helm/`
- Конфиги CI/CD (`.github/workflows/`, `.gitlab-ci.yml`)
- Схемы базы данных (требуется проверка миграции)

### Выполнение

**Опция A: Отказ в разрешении**

```json
{
  "permissions": {
    "deny": [
      "Edit(docker-compose.yml)",
      "Edit(Dockerfile)",
      "Edit(.env.example)",
      "Edit(terraform/**)",
      "Edit(kubernetes/**)",
      "Edit(.github/workflows/**)",
      "Edit(prisma/schema.prisma)"
    ]
  }
}
```

**Опция B: правило CLAUDE.md**

```markdown
## Infrastructure Changes

You are **FORBIDDEN** from modifying these without explicit permission:

- `docker-compose.yml`, `Dockerfile`
- `.env.example` (template for new developers)
- `terraform/`, `kubernetes/` (infrastructure as code)
- `.github/workflows/` (CI/CD pipelines)
- `prisma/schema.prisma` (database schema)

**If infrastructure change is needed**:
1. Ask user: "This requires infrastructure change. Should I create an RFC?"
2. Create RFC document in `docs/rfcs/YYYYMMDD-<title>.md`
3. Do NOT modify files until RFC approved
```

**Note**: Личные файлы `.env.local` можно изменять (они игнорируются git).

---

## Правило 5: Безопасность зависимостей

### Проблема

Добавление зависимостей без одобрения команды:
- Увеличивает размер пакета (производительность)
- Представляет уязвимости безопасности
- Создает проблемы с соблюдением лицензий
- Добавляет нагрузку на обслуживание

**Реальные происшествия**:
- Добавлен `moment.js` (200 КБ), когда `date-fns` (крошечный) уже в проекте.
- Установлен `lodash`, когда проект использует `ramda`.
- Добавлена ​​библиотека GPL → нарушение лицензии на проприетарную кодовую базу.

Шлюзы одобрения зависимостей работают только в том случае, если кто-то действительно проверяет, что получает новый пакет. [A: пошаговое руководство по сортировке цепочки поставок в сравнении с реальной скомпрометированной зависимостью](https://www.florian.bruniaux.com/guides/claude-code-attack-surface/) показывает, как это выглядит на практике.

### Правило

**Нет новых зависимостей без явного одобрения.**

### Выполнение

**Опция A: отказ в разрешении для менеджеров пакетов**

```json
{
  "permissions": {
    "deny": [
      "Bash(npm install *)",
      "Bash(npm i *)",
      "Bash(pnpm add *)",
      "Bash(yarn add *)",
      "Bash(pip install *)",
      "Bash(poetry add *)"
    ],
    "allow": [
      "Bash(npm install)",
      "Bash(pnpm install)",
      "Bash(pip install -r requirements.txt)"
    ]
  }
}
```

**Опция B: протокол CLAUDE.md**

```markdown
## Dependency Management

### Immutable Stack Rule

**You are FORBIDDEN from adding new dependencies** (`npm install <package>`).

**If new dependency is needed**:
1. Check if existing dependency solves it:
   - Date manipulation? Use existing `date-fns`
   - HTTP requests? Use existing `axios`
   - State management? Use existing `zustand`
2. If genuinely needed, ASK:
   - "I need [package] for [reason]. Existing alternatives: [X, Y]. Should I add it?"
3. Wait for explicit approval
4. User will run: `npm install <package>` manually

**Allowed without asking**:
- `npm install` (installs existing package.json deps)
- Dev dependencies for testing (`-D` flag after approval)
```

**Опция C: хук для предварительного инструмента**

```bash
# .claude/hooks/PreToolUse.sh
if [[ "$TOOL" == "Bash" ]]; then
    COMMAND=$(echo "$INPUT" | jq -r '.tool.input.command')

    # Block dependency installation
    if [[ "$COMMAND" =~ (npm|pnpm|yarn)[[:space:]]+(install|add|i)[[:space:]]+[a-zA-Z] ]]; then
        echo "🚨 BLOCKED: New dependency installation"
        echo ""
        echo "Dependencies must be approved by team lead."
        echo "Create PR with RFC explaining:"
        echo "1. Why this dependency is needed"
        echo "2. Alternatives considered"
        echo "3. Bundle size impact"
        echo "4. License compatibility"
        exit 2
    fi

    # Allow: npm install (no args), npm install -g, pnpm install
    if [[ "$COMMAND" =~ ^(npm|pnpm|yarn)[[:space:]]+install$ ]]; then
        exit 0
    fi
fi
```

---

## Правило 6: Следование шаблону

### Проблема

Claude вводит новые шаблоны, несовместимые с кодовой базой:
- Использует компоненты `class`, когда проект функционален. React
- Импортирует `lodash`, когда проект использует `ramda`.
- Записывает конечные точки REST, когда проект является GraphQL.
- Использует `fetch`, когда проект стандартизирован на `axios`.

### Правило

**Соответствует существующим соглашениям кодовой базы. Проверьте перед внедрением.**

### Выполнение

**Вариант A: соглашения CLAUDE.md**

```markdown
## Code Conventions

### Tech Stack (DO NOT DEVIATE)

**Frontend**:
- React 18 with **function components + hooks** (NO class components)
- State: Zustand (NOT Redux, Context)
- HTTP: axios (NOT fetch)
- Styling: Tailwind CSS (NOT styled-components, emotion)
- Forms: React Hook Form + Zod

**Backend**:
- Node.js + Express
- Database: Prisma ORM (NOT raw SQL, TypeORM)
- Auth: JWT via jose library
- Validation: Zod schemas

**Testing**:
- Unit: Vitest (NOT Jest)
- E2E: Playwright (NOT Cypress)

### Import Patterns

**Always use**:
```typescript
import { useState } from 'react'           // ✅ Named imports
import axios from 'axios'                  // ✅ Default import
```

**Никогда не используйте**:
```typescript
import React from 'react'                  // ❌ Deprecated pattern
import * as axios from 'axios'             // ❌ Namespace import
```

### Структура файла

```
src/
  features/          ← Group by feature (NOT by type)
    auth/
      components/
      hooks/
      api/
  shared/            ← Shared utilities
    components/
    hooks/
```

### Система проектирования

Изменения пользовательского интерфейса ДОЛЖНЫ использовать существующую систему дизайна:
- Проверьте `src/shared/components/` на наличие существующих компонентов.
- Используйте служебные классы Tailwind из `tailwind.config.js`.
- ТОЛЬКО цвета из палитры `colors.ts`
- Типография от `typography.config.js`

**Перед созданием нового компонента**:
1. Поиск: `rg "Button" src/shared/components/`
2. Если существует, используйте его
3. Если его не существует, спросите: «Должен ли я создать новый компонент Button или использовать существующий примитив?»
```

**Option B: Pre-implementation analysis**

```markdown
## Before Implementing

**ALWAYS** run these checks:

1. **Pattern check**:
```bash
# How does codebase handle X?
rg "import.*useState" src/  # Check React patterns
rg "axios\." src/           # Check HTTP patterns
rg "prisma\." src/          # Check DB patterns
```

2. **Существующие компоненты**:
```bash
# Does component already exist?
find src/shared/components -name "*Button*"
find src/shared/components -name "*Modal*"
```

3. **Спросите пользователя, если что-то неясно**:
   - «Я вижу, что в проекте используется [X]. Должен ли я следовать этому шаблону или использовать [Y]?»
```

**Option C: Automated validation**

```bash
# .claude/hooks/PostToolUse.sh
#!/bin/bash
if [[ "$TOOL" == "Write" ]] || [[ "$TOOL" == "Edit" ]]; then
    FILE=$(echo "$INPUT" | jq -r '.tool.input.file_path')

    # Check for pattern violations
    if [[ "$FILE" =~ \.(tsx?)$ ]]; then
        CONTENT=$(cat "$FILE")

        # Violation: class components in React
        if echo "$CONTENT" | grep -q "class.*extends.*Component"; then
            echo "⚠️ WARNING: Class component detected in $FILE"
            echo "   Project uses function components. Consider refactoring."
        fi

        # Violation: wrong HTTP library
        if echo "$CONTENT" | grep -q "import.*fetch\|window.fetch"; then
            echo "⚠️ WARNING: fetch() detected in $FILE"
            echo "   Project uses axios. Use: import axios from 'axios'"
        fi
    fi
fi
```

---

## <a name="rule-7-the-verification-paradox"></a>Правило 7: Парадокс проверки

### Проблема

Когда ИИ добивается успеха в 99% случаев, традиционная проверка человеком становится хрупкой:

**Парадокс**: По мере повышения надежности ИИ качество проверки человеком снижается.

- **Усталость бдительности**: Редкие ошибки (1%) ускользают, когда люди бессознательно доверяют шаблонам, которые обычно работают.
- **Поведение, доверяющее шаблону**: качество ручной проверки ухудшается, поскольку рецензенты перестают ожидать ошибок
- **Ложная уверенность**: «Последние 50 раз это сработало» создает слепые пятна для 51-го отказа
- **Когнитивная нагрузка**: люди не приспособлены для последовательного обнаружения 1 ошибки из 100.

**Реальные происшествия**:
- Проверка платежа обойдена после 200 успешных транзакций → мошенничество в транзакции № 201
- Проверка безопасности пропущена, поскольку «ИИ всегда получает право авторизации» → учетные данные просочились.
- Набор тестов пройден на 99 % → производственная ошибка из 1 % случая, который не был протестирован

**Источник**: [Команда инженеров Alan (Шарль Горинтен, Максим Ле Бра), февраль 2026 г.](https://www.linkedin.com/pulse/le-principe-de-la-tour-eiffel-et-ralph-wiggum-maxime-le-bras-psmxe/)

### Правило

**Создавайте автоматизированные системы безопасности вместо того, чтобы полагаться на человеческую бдительность.**

Когда надежность ИИ превысит ~95 %, переходите от ручного контроля к автоматизированному контролю.

### Антипаттерны против лучших подходов

| Anti-Pattern | Лучший подход |
|--------------|-----------------|
| Ручной просмотр каждого выхода AI | Наборы автоматизированных тестов + выборочная проверка |
| Доверяйте, потому что «в прошлый раз это сработало» | Контракты проверки (тесты, типы, линты) |
| Человек как единственный детектор ошибок | Ограждения, которые быстро выходят из строя (ворота CI/CD) |
| Стратегия «выборочной проверки» для высокочастотных операций ИИ | Комплексная автоматизированная проверка |
| Усталость рецензента = снижение стандартов с течением времени | Стабильные автоматические шкалы качества |

### Выполнение

**Опция A: Автоматизированный штабель ограждений**

```yaml
# .github/workflows/ai-safety.yml
name: AI Output Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Type safety
        run: npm run typecheck      # Catch type errors AI missed

      - name: Lint rules
        run: npm run lint            # Enforce code standards

      - name: Unit tests
        run: npm run test            # Verify behavior contracts

      - name: E2E tests
        run: npm run test:e2e        # Catch integration failures

      - name: Security audit
        run: npm audit               # Detect vulnerable dependencies

      - name: Bundle analysis
        run: npm run analyze         # Catch bloat/regressions

      # Human review ONLY after all automation passes
```

**Опция B: Контракты проверки в CLAUDE.md**

```markdown
## Verification Protocol

### NEVER rely on human review alone

**Automated verification required**:
1. **Type safety**: `npm run typecheck` must pass (zero errors)
2. **Tests**: `npm run test` coverage ≥ 80% for new code
3. **Lint**: `npm run lint` must pass (zero warnings)
4. **Security**: `npm audit` must show zero high/critical vulnerabilities
5. **Performance**: Lighthouse score ≥ 90 for affected pages

**Human review is for**:
- Architecture decisions
- UX/design choices
- Business logic validation
- Edge cases automation can't catch

**Human review is NOT for**:
- Syntax errors (use linters)
- Type errors (use TypeScript)
- Performance regressions (use benchmarks)
- Security issues (use automated scanners)
```

**Вариант C: Контрольный список перед объединением (автоматически)**

```bash
# .claude/hooks/PreCommit.sh
#!/bin/bash

echo "🔍 Running automated verification (Verification Paradox defense)..."

# 1. Type safety
npm run typecheck || { echo "❌ Type errors detected"; exit 1; }

# 2. Lint
npm run lint || { echo "❌ Lint errors detected"; exit 1; }

# 3. Tests
npm run test || { echo "❌ Tests failing"; exit 1; }

# 4. Security
npm audit --audit-level=high || { echo "❌ Security vulnerabilities detected"; exit 1; }

echo "✅ All automated checks passed"
echo "💡 Human review can now focus on architecture/UX/business logic"
```

### Краевые случаи

| Сценарий | Поведение |
|----------|----------|
| ИИ пишет идеальный код 99,9% | ВСЕ ЕЩЕ запускайте автоматизацию (парадокс применим даже в 99,9%) |
| Временной цейтнот: «Просто отправь это» | Автоматизация не подлежит обсуждению (быстро ≠ безопасность пропуска) |
| Тривиальные изменения (исправление опечатки) | Запуск автоматизации (опечатки могут сломать продукт) |
| Экстренное исправление | ТРЕБУЕТСЯ автоматизация (стресс = более высокий уровень ошибок) |

### Почему это важно

**Старая модель (до AI)**:
- Качество кода = человеческая экспертиза + тщательная проверка
- Ошибки, обнаруженные опытными разработчиками
- Качество обзора остается стабильным

**Новая модель (с помощью искусственного интеллекта)**:
- ИИ создает высококачественный код более чем в 95 % случаев.
- Люди становятся самодовольными («ИИ обычно все делает правильно»)
- 5 % ошибок ускользают из-за утомительного обзора

**Решение**: автоматизируйте скучную проверку (синтаксис, типы, тесты), оставьте внимание человека для проверки creative/strategic.

### Интеграция с другими правилами

- **Правило 3 (Полнота функций)**: Автоматические тесты подтверждают фактическую завершенность функций.
- **Правило 2 (Безопасность баз данных)**: тесты миграции выявляют разрушительные операции.
- **Правило 6 (следование шаблону)**: Линтеры автоматически обеспечивают соблюдение соглашений проекта

Аналогом этого парадокса на стороне агента является шаблон Verification Gap, описанный в рабочем процессе [TDD](../workflows/tdd-with-claude.md#the-verification-gap).

---

## Интеграция с существующими рабочими процессами

### В режиме плана

```bash
# Before multi-file changes
/plan

# Claude enters read-only mode, explores codebase
# Identifies patterns, conventions, existing implementations
# Proposes plan following project conventions
# You review before execution
```

### С git-хуками

Эти правила интегрируются с существующими рабочими процессами git:

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run safety checks
./.claude/hooks/production-safety-check.sh

# If blocked, commit fails
exit $?
```

### С CI/CD

Добавьте этап проверки:

```yaml
# .github/workflows/pr-validation.yml
name: PR Validation
on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Check for half-assing
        run: |
          if git diff origin/main...HEAD | grep -E "TODO.*implement|Not implemented"; then
            echo "❌ PR contains incomplete features"
            exit 1
          fi

      - name: Check for unauthorized deps
        run: |
          git diff origin/main...HEAD -- package.json | grep -E '^\+.*"[^"]+": "[^"]+"' || exit 0
          echo "⚠️ New dependencies detected. Review required."
```

---

## <a name="troubleshooting"></a>Поиск неисправностей

### «Эти правила слишком строгие»

**Решение**: адаптируйтесь в зависимости от размера и стадии вашей команды.

| Размер команды | Рекомендуемые правила |
|-----------|-------------------|
| 1-2 разработчика | Только правила 1, 3, 6 |
| 3–10 разработчиков | Правила 1, 3, 5, 6 |
| 10+ разработчиков или продюсеров | Все 6 правил |

### «Claude продолжает блокироваться»

**Решение**: Правила работают! Параметры:

1. **Предоставить временное разрешение**:
   ```bash
   # In CLAUDE.md
   ## Temporary Override (expires 2026-01-25)
   For this feature only: infrastructure changes allowed.
   Reason: Setting up new microservice.
   ```

2. **Создать исключение**:
   ```json
   {
     "permissions": {
       "allow": ["Edit(docker-compose.dev.yml)"],
       "deny": ["Edit(docker-compose.prod.yml)"]
     }
   }
   ```

3. **Проверьте, подходит ли правило**:
   - Соло-разработчик блокирует себя? → Удалить правило
   - Команде нужна гибкость? → Используйте «спросить» вместо «отрицать».

### «Как обеспечить соблюдение правил в команде?»

**Решение**: использовать репозиторий, а не персональную конфигурацию.

```bash
# Shared team rules
/project/.claude/settings.json        # Committed
/project/CLAUDE.md                    # Committed

# Personal overrides
/project/.claude/settings.local.json  # Gitignored
/project/.claude/CLAUDE.md            # Gitignored
```

Настройки команды имеют приоритет, но отдельные пользователи могут согласиться на более строгие правила.

---

## <a name="see-also"></a>См. также

- [AI Шаблоны проектирования: Saga](../core/ai-design-patterns.md#saga): контрольные точки не отменяют команды оболочки или удаленные эффекты, поэтому каждый внешний эффект требует письменной компенсации.
- [Полное руководство §9.12 Лучшие практики Git](#912-git-best-practices-workflows): Рабочий процесс фиксации, шаблон «Планировать → Действовать»
- [Руководство по усилению безопасности](./security-hardening.md): безопасность MCP, секретная защита, стек перехватчиков
- [Руководство по конфиденциальности данных](./data-privacy.md): риски базы данных MCP, политики хранения
- [Корпоративное управление искусственным интеллектом](./enterprise-governance.md): управление на уровне организации, уставы использования, рабочий процесс утверждения MCP, уровни защиты, соответствие требованиям
- [Подходы к внедрению](../roles/adoption-approaches.md): создание команды, общие соглашения, корпоративное внедрение
- [Plan Mode](#23-plan-mode): безопасное исследование перед выполнением.
- [Permissions System](#33-settings-permissions): правила Allow/deny, перехватчики

---

## <a name="quick-reference"></a>Шпаргалка

### Серьезность правила

| Правило | Серьезность | Нарушение этого приводит к |
|------|----------|----------------------|
| 1. Стабильность порта | 🔴 Критический | Простои команды, сбои развертывания |
| 2. Безопасность базы данных | 🔴 Критический | Потеря данных, влияние на клиента |
| 3. Полнота функций | 🟡 Высокий | Производственные ошибки, технический долг |
| 4. Блокировка инфраструктуры | 🟠 Высокий | Простои, проблемы безопасности |
| 5. Безопасность зависимостей | 🟡 Средний | Раздувание пакета, проблемы с лицензией |
| 6. Следование шаблону | 🟢 Низкий | Несогласованность кода, нагрузка на обслуживание |

### Методы обеспечения исполнения

| Метод | Строгость | Время установки | Лучшее для |
|--------|------------|------------|----------|
| **Отказ в доступе** | 100% (блоки) | 2 мин | Критические правила (1, 2, 4) |
| **Крючки для инструментов** | 100% (блоки) | 10 минут | Пользовательская логика, специфичная для команды |
| **CLAUDE.md правила** | ~70% (с уважением Claude) | 5 минут | Конвенции, руководящие принципы |
| **Предупреждения после инструмента** | ~30% (только предупреждение) | 5 минут | Лучшие практики, предложения |
| **Git-хуки** | 100% (блокирует коммиты) | 15 мин. | Последняя страховочная сетка перед толчком |

### Общие шаблоны

**Разрешить внесение изменений, производство блоков**:
```json
{
  "permissions": {
    "allow": ["Edit(docker-compose.dev.yml)"],
    "deny": ["Edit(docker-compose.prod.yml)"]
  }
}
```

**Требовать подтверждения для конфиденциальных операций**:
```json
{
  "permissions": {
    "ask": ["Bash(rm -rf *)", "Bash(DROP TABLE *)"]
  }
}
```

**Временное переопределение с истечением срока действия**:
```markdown
## Temporary Override (expires 2026-02-01)
Infrastructure changes allowed for migration project.
After expiry: revert to standard rules.
```

---

## <a name="rule-6-autonomous-loop-safety"></a>Правило 6: Безопасность автономного контура

### Проблема

Автономные циклы агентов (сеанс Claude, работающий без присмотра в течение нескольких часов, обработка очереди, мониторинг системы) имеют режим сбоя, который трудно отладить: процесс *кажется запущенным*, но молча остановился. Никакой ошибки. Нет кода выхода. Просто ничего не происходит и съедает ваш бюджет API.

Это происходит, когда:
- Claude входит в цикл рассуждений без условий выхода.
- Вызов инструмента зависает в ожидании отсутствия ресурса
- Сеанс попадает в крайний случай, который не выдает никаких результатов, но и не приводит к сбою.

### Правило

Для любого автономного сеанса, который, как ожидается, будет длиться дольше нескольких минут, внедрите механизм контрольного сигнала. Если сердцебиение прекратится, убейте всех **группа процессов**, а не только родительский процесс.

**Почему группа процессов, а не только родительский**: Claude Code порождает дочерние процессы (команды оболочки, вызовы инструментов). Убийство только родителя оставляет детей-сирот, потребляющих ресурсы и потенциально совершающих действия без надзора.

### Выполнение

**Heartbeat Writer**: выполняется внутри автономного цикла как перехватчик PostToolUse:

```bash
#!/bin/bash
# .claude/hooks/autonomous-heartbeat.sh
# PostToolUse hook: write timestamp after every tool use

HEARTBEAT_FILE="${CLAUDE_HEARTBEAT_FILE:-/tmp/claude-heartbeat-$$}"
date +%s > "$HEARTBEAT_FILE"
```

**Сторожевой таймер мертвеца**: выполняется как отдельный процесс вместе с Claude:

```bash
#!/bin/bash
# scripts/watchdog.sh
# Usage: ./scripts/watchdog.sh <timeout_seconds> <pid>

TIMEOUT="${1:-30}"
TARGET_PID="${2:-}"
HEARTBEAT_FILE="${CLAUDE_HEARTBEAT_FILE:-/tmp/claude-heartbeat-$TARGET_PID}"

if [[ -z "$TARGET_PID" ]]; then
  echo "Usage: watchdog.sh <timeout_seconds> <pid>" >&2
  exit 1
fi

while true; do
  sleep 5

  if ! kill -0 "$TARGET_PID" 2>/dev/null; then
    echo "Watchdog: process $TARGET_PID has exited cleanly"
    exit 0
  fi

  if [[ -f "$HEARTBEAT_FILE" ]]; then
    LAST_BEAT=$(cat "$HEARTBEAT_FILE")
    NOW=$(date +%s)
    AGE=$(( NOW - LAST_BEAT ))

    if [[ "$AGE" -gt "$TIMEOUT" ]]; then
      echo "Watchdog: no heartbeat for ${AGE}s (limit: ${TIMEOUT}s) — killing process group"
      kill -TERM -"$TARGET_PID" 2>/dev/null || kill -TERM "$TARGET_PID"
      sleep 2
      kill -KILL -"$TARGET_PID" 2>/dev/null || true
      rm -f "$HEARTBEAT_FILE"
      exit 1
    fi
  fi
done
```

**Запустите скрипт**, который соединяет их вместе:

```bash
#!/bin/bash
export CLAUDE_HEARTBEAT_FILE="/tmp/claude-heartbeat-$$"

claude --print "Process the task queue in tasks.json" &
CLAUDE_PID=$!

./scripts/watchdog.sh 30 "$CLAUDE_PID" &
WATCHDOG_PID=$!

wait "$CLAUDE_PID"
EXIT_CODE=$?

kill "$WATCHDOG_PID" 2>/dev/null
rm -f "$CLAUDE_HEARTBEAT_FILE"
exit "$EXIT_CODE"
```

### Настройка таймаута

| Тип задачи | Рекомендуемый тайм-аут |
|-----------|-------------------|
| Простые файловые операции | 15–30s |
| Веб-запросы, вызовы API | 60s |
| Компиляция кода, тестовые прогоны | 120s |
| Долгосрочные исследовательские задачи | 300s |

Начните с 30 секунд и увеличивайте только тогда, когда вы наблюдаете допустимые паузы, превышающие время тайм-аута.

### Когда НЕ использовать это

- Интерактивные сеансы (вы смотрите): сторожевой таймер не приносит никакой пользы
- Задачи менее 5 минут: затраты на настройку не оправданы
- Конвейеры, в которых ожидается сбой и который обрабатывается логикой повторных попыток.

> **Credit**: шаблон переключения Heartbeat для автономных агентов из [Everything Claude Code Security Guide](https://github.com/affaan-m/everything-claude-code) (Аффаан Мустафа). Их вкладом является уничтожение группы процессов и разделение сторожевого таймера.

---

**Версия**: 1.0.0
**Последнее обновление**: 21 января 2026 г.
**Changelog**: первоначальная версия, основанная на проверенных сообществом производственных шаблонах.
