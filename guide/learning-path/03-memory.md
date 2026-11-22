---
title: "Модуль 03: Память и конфигурация"
description: "Модуль 03 курса обучения: заставьте Claude Code запомнить ваши предпочтения и правила проекта и создайте свой первый файл CLAUDE.md. 1 час, средний."
---

# Модуль 03: Память и конфигурация

**Time**: 1 час | **Сложность**: ⭐⭐ Средний уровень

## Цель

Настройте Claude Code, чтобы запомнить ваши предпочтения и правила, специфичные для проекта. Создайте свой первый файл CLAUDE.md.

---

## Что вы узнаете

- Как работает иерархия памяти Claude Code
- Создание и структурирование файлов CLAUDE.md.
- Настройки и их приоритет
- Пользовательские инструкции и определения агентов
- Проект против глобальной конфигурации

---

## Иерархия памяти

Claude Code запоминает предпочтения на трёх уровнях:

```
┌──────────────────────────────────────────┐
│ 1. GLOBAL (~/.claude/CLAUDE.md)          │
│    Applies to ALL your projects          │
│    Example: Your coding style, timezone  │
└──────────────────────────────────────────┘
                    ▲
                    │ (overridden by)
                    │
┌──────────────────────────────────────────┐
│ 2. PROJECT (/your-project/CLAUDE.md)    │
│    Applies to THIS project only          │
│    Example: Team standards, tech stack   │
└──────────────────────────────────────────┘
                    ▲
                    │ (overridden by)
                    │
┌──────────────────────────────────────────┐
│ 3. PERSONAL (/your-project/.claude/)    │
│    Local settings, not committed to git  │
│    Example: API keys, personal prefs     │
└──────────────────────────────────────────┘
```

### Правило
Настройки уровня 3 переопределяют уровень 2, который имеет приоритет над уровнем 1.

---

## Создание вашего первого CLAUDE.md

CLAUDE.md — это простой файл уценки, который сообщает Claude Code ваши правила.

### Базовая структура

```markdown
# My Project

## Purpose
Brief description of what this project does.

## Tech Stack
- TypeScript
- React 18
- Next.js
- PostgreSQL

## Coding Standards
- Use functional components only
- All exports must be typed
- Max 300 lines per file
- Use meaningful variable names (no `x`, `temp`)

## Behavioral Rules
Always review diffs before accepting.
Use /plan for any breaking changes.

## Git Workflow
- All work on feature branches
- PRs require 1 approval
- Commits must be squashed

## Current Status
What you're currently working on.
```

### Минимальный пример (начните здесь)

Создайте `/your-project/CLAUDE.md`:

```markdown
# My Project

## Quick Context
- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Package manager: pnpm

## Coding Rules
- Functional programming preferred
- All functions must have type signatures
- Tests are required for features
- No console.log in production code

## My Preferences
- Use /plan for architectural changes
- Be verbose in comments, not code
- Ask before making cross-file refactors
```

Claude автоматически прочитает этот файл при запуске сеанса и будет следовать вашим правилам.

---

## Что может идти в CLAUDE.md?

Вы можете настроить практически все. Общие разделы:

### 1. Обзор проекта
```markdown
## Purpose
This is our payment processing backend.
It handles credit card validation and transaction logging.

## Important
- Handles PCI-DSS compliance critical code
- Must never log card numbers
- All changes need security review
```

### 2. Технический стек
```markdown
## Stack
- Language: Python 3.10+
- Framework: Django 4.0
- Database: PostgreSQL 13
- Cache: Redis
- Task queue: Celery
```

### 3. Стандарты кодирования
```markdown
## Code Style
- Follow PEP 8
- Type hints on all functions
- Docstrings in Google format
- No wildcard imports
- Max line length: 100 chars

## Testing
- Minimum 80% coverage
- Unit + integration tests
- Use pytest
```

### 4. Правила
```markdown
## Rules
- All PRs require review
- No direct pushes to main
- Database migrations need approval
- Security changes flagged automatically
- /plan mode for refactors >100 lines
```

### 5. Текущая работа
```markdown
## Current Task
Building the checkout flow.
Working on: src/checkout/payment-form.tsx
Dependencies: stripe-js library, payment API
```

---

## Глобальный CLAUDE.md

Для настроек, применимых к **все ваши проекты**, создавать `~/.claude/CLAUDE.md`:

```markdown
# My Global Preferences

## Communication Style
- Be direct and factual
- Show working in steps
- Suggest alternatives when unclear

## Tools I Use
- TypeScript for all JS projects
- Python for data/scripts
- Docker for deployment
- Git for all version control

## My Timezone
America/New_York

## Work Hours
Mon-Fri 9am-5pm (UTC-5)
```

Claude загрузит это при запуске и объединит с вашим проектом CLAUDE.md.

---

## Специфический для проекта или глобальный

### Используйте глобально для:
- Ваш общий стиль кодирования (соглашения об именах, подход)
- Инструменты, которые вы всегда используете
- Коммуникационные предпочтения
- Общие принципы

### Используйте проект для:
- Командные стандарты (если они отличаются от ваших глобальных)
- Специализированный технологический стек проекта
- Бизнес-правила (соответствие PCI и т. д.)
- Текущий контекст работы

### Пример

**Global** (~/.claude/CLAUDE.md):
```markdown
## My Style
Functional programming, clear variable names, typed functions
```

**Проект** (my-payment-app/CLAUDE.md):
```markdown
## Special Rules
Security critical: use /plan for all changes.
Must handle PCI compliance.
```

Claude сочетает в себе и то, и другое: ваш стиль + правила проекта.

---

## <a name="exercise-create-your-claudemd"></a>Упражнение: Создайте свой CLAUDE.md.

### Шаг 1: Выберите проект

Используйте существующий проект или создайте тестовый каталог:

```bash
mkdir test-claude-config
cd test-claude-config
git init
```

### Шаг 2. Создайте CLAUDE.md.

```bash
cat > CLAUDE.md << 'EOF'
# My Test Project

## Tech Stack
- Language: [your main language]
- Framework: [what you use]
- Database: [if applicable]

## Coding Standards
- [Rule 1]
- [Rule 2]

## My Preferences
- [Preference 1]
- [Preference 2]
EOF
```

### Шаг 3: Запустите Claude

```bash
claude
```

Claude покажет, что он загрузил CLAUDE.md при запуске.

### Шаг 4: Проверьте это

Попросите Claude что-нибудь сделать. Оно должно следовать вашим правилам.

```
Add a function called greet that returns "Hello, World!"
```

Claude должен:
1. Упомяните свой технологический стек
2. Следуйте своим стандартам кодирования
3. Уважайте свои предпочтения

---

## Каталог .claude/

Для локальных настроек (не зафиксированных) используйте `.claude/`:

```
my-project/
├── CLAUDE.md           (committed - team rules)
├── .claude/
│   ├── settings.json   (not committed - personal settings)
│   ├── agents/         (custom agents)
│   ├── skills/         (custom skills)
│   └── hooks/          (automation scripts)
```

Добавьте в `.gitignore`:
```
.claude/
.claude/settings.json
```

Исключение: вы можете зафиксировать `.claude/agents/`, если они являются общекомандными.

---

## Settings.json (необязательно)

Для детального управления создайте `.claude/settings.json`:

```json
{
  "model": "claude-opus-5-5",
  "temperature": 0.7,
  "context_threshold": 0.75,
  "auto_compact": true,
  "require_diff_review": true,
  "max_file_size": 10000
}
```

Общие настройки:
- **model**: какую модель Claude использовать
- **context_threshold**: Когда предупреждать о контексте (0,7 = 70%)
- **auto_compact**: автоматически сжимать при достижении порогового значения.
- **require_diff_review**: Принудительная проверка всех изменений (безопасное значение по умолчанию).

---

## Агенты и навыки (предварительная версия)

В CLAUDE.md вы можете ссылаться на собственные агенты:

```markdown
## Available Agents
- /code-reviewer: Reviews code for quality
- /security-auditor: Scans for vulnerabilities
- /test-writer: Generates test cases

Use with: /agent code-reviewer
```

Они определены в `.claude/agents/` (описано в Модуле 04).

---

## Лучшие практики

### ДЕЛАТЬ

✅ Держите CLAUDE.md в курсе событий по мере развития вашего проекта.

✅ Контроль версий вашего проекта CLAUDE.md (помогает товарищам по команде)

✅ Будьте конкретны в требованиях (не расплывчаты)

✅ Включите раздел «Текущий статус», чтобы Claude имел контекст.

✅ Документируйте важные бизнес-правила

### НЕ

❌ Храните пароли или секреты в CLAUDE.md (используйте .env или менеджер секретов)

❌ Сделайте его слишком длинным (>500 строк — это слишком много).

❌ Используйте конфликтующие правила между глобальными и проектными правилами.

❌ Предположим, что Claude запомнит настройки предыдущих сеансов.

---

## Проверка: вы готовы, если...

✓ Вы создали файл CLAUDE.md в проекте.

✓ Вы можете объяснить трехуровневую иерархию (глобальная, проектная, личная)

✓ Вы понимаете, что должно быть в коммитированных CLAUDE.md и .claude/

✓ Вы запустили Claude и видели, как он загружает CLAUDE.md.

✓ Claude выполнил хотя бы одно правило из вашего CLAUDE.md.

---

## Что дальше?

**Модуль 04: Агенты и специализация** охватывает:
- Создание специализированных агентов под конкретные задачи
- Ограничение возможностей агента
- Управление несколькими агентами
- Командные рабочие процессы с агентами

Здесь вы узнаете, как создавать целенаправленные персонажи ИИ вместо использования одного общего Claude.

---

**Завершен модуль 03?** → Готов к модулю 04: Агенты и специализация

---

## Идем дальше: кросс-сессия и командная память

В разделах выше описаны основные паттерны CLAUDE.md. Когда вы будете готовы пойти глубже, в экосистеме появится больше:

**Auto Memory и Auto Dream (родной, v2.1.59+)**

Claude Code может записывать свой собственный MEMORY.md между сеансами (Auto Memory) и консолидировать его в фоновом режиме (Auto Dream). Оба готовы к работе с `/memory` для управления сохраненными записями. См. [Системы памяти: автоматическая память](../core/memory-systems.md#22-auto-memory-v2159) и [Auto Dream](../core/memory-systems.md#23-auto-dream-memory-consolidation).

**Кросс-сессионные инструменты для индивидуальных разработчиков**

- **claude-mem** (111 тыс. звезд, проверено 3 ноября 2026 г.) автоматическое сжатие сеанса с помощью перехватчиков, ручные вызовы не требуются. Включите секретное редактирование, которое по умолчанию отключено. Установить: `/plugin marketplace add thedotmack/claude-mem`
- **agentmemory** (30 тыс. звезд, проверено 3 ноября 2026 г.) BM25 + гибридный поиск векторов + графов, 12 перехватчиков, захватывающих по умолчанию (внедрение контекста включено), 95,2% R@5 по самооценке на LongMemEval-S
- **ICM** (двоичный файл Rust): эпизодическое затухание + постоянный граф знаний, `brew install icm`, 14 клиентов IDE

**Обмен командой**

- Шаблон «Тринити»: CLAUDE.md + `.mcp.json` + `/skills` — все зафиксировано в репо. Ноль инфра-нулевых затрат.
- **Mem0 Cloud MCP**: общий пул памяти через `npx mcp-add --url https://mcp.mem0.ai/mcp`, уровень бесплатного пользования
- **doobidoo**: семантический поиск в более чем 13 IDE, локальном SQLite или бэкэнде Cloudflare D1.

Полный обзор всех инструментов, шаблонов архитектуры, рисков и блок-схемы принятия решений: [Руководство по системам памяти](../core/memory-systems.md).
