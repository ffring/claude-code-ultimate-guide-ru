---
title: "Рабочий процесс управления задачами"
description: "Многосессионная координация задач с использованием Tasks API и TodoWrite для сложных проектов."
tags: [workflow, guide, agents]
---

# Рабочий процесс управления задачами

**Версия**: Claude Code v2.1.16+
**Предварительные требования**: Понимание многосессионных рабочих процессов, базовые знания CLI.
**Time**: 15–30 минут на обучение, применимо ко всем сложным проектам.

## Обзор

Управление задачами в Claude Code существенно изменилось в версии 2.1.16 с появлением **Tasks API**, дополняющего исходный инструмент **TodoWrite**. Этот рабочий процесс научит вас, когда использовать каждую систему и как координировать задачи между сеансами для сложных проектов.

**Когда использовать этот рабочий процесс:**
- Проекты, охватывающие несколько сеансов кодирования
- Сценарии мультиагентной координации
- Сложные иерархии задач с зависимостями
- Необходимость возобновить работу после сжатия контекста или прерывания сеанса

**Когда НЕ использовать:**
- Простая реализация за один сеанс
- Быстрые исправления или исследовательское кодирование
- Задачи, выполняемые менее чем за 10 минут

---

## Краткий справочник по сравнению систем

| Особенность | TodoWrite (устаревшая версия) | Задачи API (v2.1.16+) |
|---------|-------------------|---------------------|
| **Постоянство** | Только сессионная память | Дисковое хранилище (`~/.claude/tasks/`) |
| **Multi-session** | ❌ Потерян в конце сеанса | ✅ Выживает во время сеансов |
| **Зависимости** | ❌ Ручной заказ | ✅ Блокировка задач (А блокирует Б) |
| **Координация** | Один агент | ✅ Мультиагент с трансляцией |
| **Отслеживание статуса** | pending/in_progress/completed | pending/in_progress/completed |
| **Когда использовать** | Простые задачи за один сеанс | Сложные многосессионные проекты |

**Флаг миграции** (v2.1.19+):
```bash
# Use old system (TodoWrite)
CLAUDE_CODE_ENABLE_TASKS=false claude

# Use new system (Tasks API) - default since v2.1.19
claude
```

---

## <a name="workflow-phase-1-task-planning"></a>Этап рабочего процесса 1. Планирование задач

**Цель**: Разложить сложную работу на отслеживаемые, исполняемые блоки.

### Шаг 1. Анализ объема

Прежде чем создавать задачи, поймите, что вы строите:

```bash
# Discovery pattern
claude
> "Analyze this codebase for implementing JWT authentication:
  - Glob for existing auth patterns
  - Grep for security-related code
  - Identify integration points"
```

### Шаг 2. Разработка иерархии задач

Разбейте работу на логические фазы с помощью зависимостей:

**Пример: Система аутентификации**
```
Authentication System (parent)
├── 1. Login endpoint (no dependencies)
├── 2. Token refresh (depends on #1)
├── 3. Logout endpoint (depends on #1)
└── 4. Integration tests (depends on #1, #2, #3)
```

### Шаг 3. Создайте структуру задачи.

Используйте `TaskCreate`, чтобы реализовать свой план:

```bash
# Session 1: Planning phase
export CLAUDE_CODE_TASK_LIST_ID="auth-system-v2"
claude

# Inside Claude session:
> "Create a task hierarchy for JWT authentication:

  Parent task: 'Implement JWT authentication system'
  - Description: Add JWT-based auth with refresh tokens and secure storage

  Child tasks:
  1. 'Create login endpoint' (no dependencies)
  2. 'Implement token refresh logic' (depends on task 1)
  3. 'Create logout endpoint' (depends on task 1)
  4. 'Write integration tests' (depends on tasks 1, 2, 3)

  Use TaskCreate with proper metadata."
```

**Ожидаемый результат от Claude:**
```json
{
  "tasks": [
    {
      "id": "task-auth-parent",
      "title": "Implement JWT authentication system",
      "status": "pending",
      "children": ["task-login", "task-refresh", "task-logout", "task-tests"]
    },
    {
      "id": "task-login",
      "title": "Create login endpoint",
      "status": "pending",
      "dependencies": [],
      "metadata": {"priority": "high", "estimated_duration": "2h"}
    },
    {
      "id": "task-refresh",
      "title": "Implement token refresh logic",
      "status": "pending",
      "dependencies": ["task-login"],
      "metadata": {"priority": "high", "estimated_duration": "1h"}
    }
    // ... other tasks
  ]
}
```

---

## <a name="workflow-phase-2-task-execution"></a>Этап рабочего процесса 2: выполнение задачи

**Goal**: систематическое выполнение задач с отслеживанием прогресса.

### Шаблон выполнения

```
TaskList → TaskGet (next pending) → Execute → TaskUpdate → Validate → Repeat
```

### Шаг 1. Найдите следующую задачу

```bash
# Session 2: Start implementation
export CLAUDE_CODE_TASK_LIST_ID="auth-system-v2"
claude

> "TaskList to show all pending tasks"
```

**Output:**
```
Tasks for 'auth-system-v2':
✅ task-login: Create login endpoint [completed]
⏳ task-refresh: Implement token refresh logic [pending, blocked by: none]
⏳ task-logout: Create logout endpoint [pending, blocked by: none]
⏳ task-tests: Write integration tests [pending, blocked by: task-refresh, task-logout]
```

### Шаг 2. Получите сведения о задаче

```bash
> "TaskGet task-refresh to see full requirements"
```

**Output:**
```json
{
  "id": "task-refresh",
  "title": "Implement token refresh logic",
  "description": "Create endpoint POST /auth/refresh that validates refresh token and issues new access token",
  "status": "pending",
  "dependencies": ["task-login"],
  "metadata": {
    "priority": "high",
    "estimated_duration": "1h",
    "files": ["src/auth/refresh.ts", "src/middleware/auth.ts"]
  }
}
```

### Шаг 3. Выполнение и обновление

```bash
> "Mark task-refresh as in_progress, then implement the token refresh endpoint according to requirements"

# Claude executes: TaskUpdate task-refresh status=in_progress
# Claude implements the feature...
# Upon completion:

> "Mark task-refresh as completed"
# Claude executes: TaskUpdate task-refresh status=completed
```

### Шаг 4. Подтвердите

```bash
> "Run tests for token refresh functionality"

# If tests pass:
# ✅ Task remains completed

# If tests fail:
> "TaskUpdate task-refresh status=in_progress, add error details to metadata and fix issues"
```

---

## Этап рабочего процесса 3: Управление сеансами

**Goal**: плавное возобновление работы независимо от сеансов и границ контекста.

### Механизм сохранения

**Место хранения**: `~/.claude/tasks/<task-list-id>/`

Задачи выживают:
- Завершение сеанса
- Сжатие контекста (`/compact`)
- Система перезагружается
- Несколько дней перерыва

#### ⚠️ Ограничения видимости поля

**TaskList возвращает только**: `id`, `subject`, `status`, `owner`, `blockedBy`

**Отсутствует в выводе списка задач**:
- `description` (требуется TaskGet для каждой задачи)
- `metadata` (настраиваемые поля, такие как приоритет, оценки)
- `activeForm` (текст индикатора прогресса)

**Регулировка рабочего процесса**:

```bash
# DON'T: Assume you can scan all descriptions
TaskList  # Shows subjects only

# DO: Fetch selectively
TaskList                    # Get overview (which tasks exist, statuses)
TaskGet(task-auth-login)    # Get full details for specific task
TaskGet(task-auth-tests)    # Get details for next task
```

**Когда это важно**:
- Сложные проекты с подробным описанием задач (>50 слов на задачу)
- Многоагентная координация, требующая общей видимости контекста
- Необходимо быстро просмотреть все заметки о задачах, чтобы определить точку возобновления.

**Осведомленность о затратах**:
- TaskList = 1 вызов API
- Получение описаний для N задач = 1 + N вызовов
- Для 20 задач это накладные расходы в 20 раз, если вам нужны все описания.

**Mitigation**:
- Используйте поле `subject` для важной информации (видно в TaskList)
- Держите `description` кратким (максимум 50–100 слов).
- Храните подробные планы в файлах уценки (`docs/plan-*.md`).

### Шаблон резюме

```bash
# Days later, different terminal session
export CLAUDE_CODE_TASK_LIST_ID="auth-system-v2"
claude

> "TaskList to show current state"

# Output shows exactly where you left off:
# ✅ task-login [completed]
# ✅ task-refresh [completed]
# ⏳ task-logout [pending]
# ⏳ task-tests [pending, blocked by: task-logout]

> "Continue with next pending task that isn't blocked"
```

### Многотерминальная координация

**Случай использования**: запуск нескольких экземпляров Claude, работающих над одним и тем же проектом.

```bash
# Terminal 1: Frontend work
export CLAUDE_CODE_TASK_LIST_ID="auth-system-v2"
claude
> "Work on task-logout endpoint"

# Terminal 2: Test writing (simultaneous)
export CLAUDE_CODE_TASK_LIST_ID="auth-system-v2"
claude
> "TaskList - check what's completed so I can write tests"

# Both terminals see real-time state updates
```

**⚠️ Предупреждение**: используйте идентификаторы списка задач для конкретного репозитория, чтобы избежать межпроектного загрязнения:
```bash
# ❌ BAD: Generic ID used across multiple repos
export CLAUDE_CODE_TASK_LIST_ID="my-project"

# ✅ GOOD: Repo-specific with context
export CLAUDE_CODE_TASK_LIST_ID="mycompany-api-auth-refactor"
```

---

## <a name="integration-tdd--task-management"></a>Интеграция: TDD + управление задачами

Объедините разработку через тестирование с отслеживанием задач для систематического покрытия тестов.

### Шаблон: выполнение задачи «сначала тестирование»

```bash
export CLAUDE_CODE_TASK_LIST_ID="tdd-feature-x"
claude

# Create tasks with test-first approach
> "Create task hierarchy for feature X:

  For each feature component:
  1. Task: 'Write failing tests for [component]'
  2. Task: 'Implement [component] to pass tests' (depends on #1)
  3. Task: 'Refactor [component]' (depends on #2)

  Use TDD red-green-refactor cycle per task."
```

### Пример: функция входа с помощью TDD

```bash
# Phase 1: Red (failing tests)
TaskCreate: {
  title: "Write failing tests for login endpoint",
  description: "Test cases: valid credentials, invalid password, user not found, rate limiting",
  status: "pending"
}

# Execute test writing
> "Implement task-login-tests, ensure all tests fail initially"

# Phase 2: Green (minimal implementation)
TaskCreate: {
  title: "Implement login endpoint (minimal)",
  description: "Make tests pass with simplest possible implementation",
  dependencies: ["task-login-tests"],
  status: "pending"
}

# Phase 3: Refactor
TaskCreate: {
  title: "Refactor login endpoint",
  description: "Optimize, remove duplication, improve readability",
  dependencies: ["task-login-impl"],
  status: "pending"
}
```

**Полный справочник по рабочему процессу**: см. [TDD с Claude](tdd-with-claude.md#task-management-integration).

---

## Интеграция: Планирование + управление задачами

Преобразуйте стратегические планы в исполняемые иерархии задач.

### Шаблон: преобразование плана в задачу

```bash
# Step 1: Enter plan mode
claude
> [Press Shift+Tab to enter Plan Mode]

# Step 2: Create architectural plan
> "Design architecture for microservices migration:
  - Identify service boundaries
  - Plan data migration strategy
  - Design API contracts"

# Step 3: Exit plan mode with task creation
> "Convert this plan into a task hierarchy using TaskCreate"
```

### Пример: миграция микросервисов

**Выход плана:**
```
Phase 1: Analysis (Week 1)
- Map monolith dependencies
- Identify bounded contexts
- Design service boundaries

Phase 2: Infrastructure (Week 2)
- Set up service templates
- Configure API gateway
- Establish monitoring

Phase 3: Migration (Week 3-6)
- Extract user service
- Extract order service
- Migrate database schemas
```

**Преобразование задач:**
```bash
TaskCreate: {
  title: "Microservices migration",
  children: [
    {
      title: "Phase 1: Analysis",
      children: [
        {title: "Map monolith dependencies", priority: "critical"},
        {title: "Identify bounded contexts", dependencies: ["map-deps"]},
        {title: "Design service boundaries", dependencies: ["bounded-contexts"]}
      ]
    },
    {
      title: "Phase 2: Infrastructure",
      dependencies: ["phase-1"],
      children: [
        {title: "Set up service templates"},
        {title: "Configure API gateway", dependencies: ["templates"]},
        {title: "Establish monitoring"}
      ]
    }
    // ... Phase 3
  ]
}
```

**Полный справочник по рабочему процессу**: см. [Plan-Driven Development](plan-driven.md#task-hierarchy-design)

---

## Руководство по миграции TodoWrite

### Когда мигрировать

**Оставайтесь с TodoНапишите, если:**
- ✅Все работы выполняются за один сеанс.
- ✅ Не требуется межагентная координация
- ✅ Простые линейные списки задач (без зависимостей)
- ✅ Использование Claude Code < v2.1.16

**Перейти в Задачи API, если:**
- ✅ Работа занимает несколько сессий.
- ✅ Требуется сохранение задач в days/weeks.
- ✅ Сложные графики зависимостей
- ✅ Мультитерминальное сотрудничество
- ✅ Хотите возобновить работу после сжатия контекста

### Этапы миграции

#### Шаг 1. Определите использование TodoWrite

```bash
# Find existing TodoWrite usage in your CLAUDE.md or workflows
grep -r "TodoWrite" .claude/
```

#### Шаг 2. Преобразуйте списки TodoWrite в задачи

**Before (TodoWrite):**
```markdown
- [ ] Implement user authentication
- [ ] Add password hashing
- [ ] Create session management
- [ ] Write tests
```

**After (Задачи API):**
```bash
export CLAUDE_CODE_TASK_LIST_ID="user-auth-2026"
claude

> "Create tasks:
  1. 'Implement user authentication' (parent)
     - Child: 'Add password hashing'
     - Child: 'Create session management' (depends on hashing)
     - Child: 'Write tests' (depends on auth, hashing, sessions)"
```

#### Шаг 3. Обновите инструкции CLAUDE.md.

**Before:**
```markdown
For complex tasks:
- Use TodoWrite to create task list
- Execute tasks sequentially
```

**After:**
```markdown
For complex tasks:
- Set CLAUDE_CODE_TASK_LIST_ID=<project-name>
- Use TaskCreate for hierarchical planning
- Execute with TaskUpdate status tracking
- Resume with TaskList in new sessions
```

#### Шаг 4. Тестовая миграция

```bash
# Create test task list
export CLAUDE_CODE_TASK_LIST_ID="migration-test"
claude

> "Create 3 test tasks with dependencies, mark one completed, then exit"

# Relaunch in new session
export CLAUDE_CODE_TASK_LIST_ID="migration-test"
claude

> "TaskList - verify tasks persisted correctly"

# Expected: See all 3 tasks with correct states
```

---

## Паттерны и антипаттерны

### ✅ Хорошие выкройки

#### 1. Иерархическая декомпозиция задачи

```bash
Project (parent)
└── Feature A (child of project)
    ├── Component A1 (child of Feature A)
    │   ├── Implementation (leaf task)
    │   └── Tests (leaf task, depends on Implementation)
    └── Component A2
        └── ...
```

**Почему это работает**: отражает естественную структуру проекта, делает зависимости явными.

#### 2. Упорядочение с приоритетом зависимостей

```bash
# Always define dependencies when creating tasks
TaskCreate: {
  title: "Deploy to production",
  dependencies: ["run-tests", "code-review", "backup-database"],
  metadata: {blocking_reason: "Safety checks required"}
}
```

**Почему это работает**: предотвращает преждевременное выполнение, обеспечивает контроль качества

#### 3. Подробные обновления статуса

```bash
# Bad: Large task marked completed without intermediate updates
TaskCreate: {title: "Build entire auth system"}
# ... hours later ...
TaskUpdate: {id: "auth-system", status: "completed"}

# Good: Frequent status updates as work progresses
TaskUpdate: {id: "auth-system", status: "in_progress", progress: "25%"}
TaskUpdate: {id: "auth-system", status: "in_progress", progress: "50%"}
TaskUpdate: {id: "auth-system", status: "in_progress", progress: "75%"}
TaskUpdate: {id: "auth-system", status: "completed"}
```

**Почему это работает**: Обеспечивает видимость, позволяет контекстно-зависимое возобновление

#### 4. Задачи, насыщенные метаданными

```bash
TaskCreate: {
  title: "Optimize database queries",
  description: "Reduce query time for user dashboard from 2s to <200ms",
  metadata: {
    priority: "high",
    estimated_duration: "3h",
    related_files: ["src/db/queries.ts", "src/db/indexes.sql"],
    performance_baseline: "2000ms",
    performance_target: "200ms",
    related_issue: "https://github.com/org/repo/issues/123"
  }
}
```

**Почему это работает**: возобновление с учетом контекста, упрощенное делегирование, улучшенная документация

### ❌ Антипаттерны

#### 1. Монолитные задачи (>10 шагов)

```bash
# ❌ BAD: Task too large, hard to track progress
TaskCreate: {
  title: "Implement entire payment system",
  description: "Stripe integration, webhooks, refunds, disputes, reporting, admin UI, ..."
}

# ✅ GOOD: Break into phases
TaskCreate: {
  title: "Payment system - Phase 1: Core integration",
  children: [
    {title: "Stripe SDK setup"},
    {title: "Payment intent creation"},
    {title: "Webhook handling"}
  ]
}
```

#### 2. Отсутствующие зависимости

```bash
# ❌ BAD: Tasks can execute in wrong order
TaskCreate: {title: "Deploy to production"} # No dependencies
TaskCreate: {title: "Write tests"} # No dependencies

# ✅ GOOD: Explicit ordering
TaskCreate: {
  title: "Deploy to production",
  dependencies: ["write-tests", "run-tests", "code-review"]
}
```

#### 3. Бесхозные задачи без контекста

```bash
# ❌ BAD: Future you won't remember what this means
TaskCreate: {
  title: "Fix the bug",
  description: "That one from yesterday"
}

# ✅ GOOD: Self-contained context
TaskCreate: {
  title: "Fix login timeout on Safari",
  description: "Users on Safari 17.2+ experience session timeout after 5min. Expected: 30min timeout. Root cause: cookie SameSite=Strict not supported.",
  metadata: {
    browser: "Safari 17.2+",
    error_message: "Session expired",
    related_commit: "a1b2c3d",
    slack_thread: "https://slack.com/archives/C123/p456"
  }
}
```

#### 4. Несоответствие статуса

```bash
# ❌ BAD: Task marked completed but tests fail
TaskUpdate: {id: "login-feature", status: "completed"}
# Tests run later: 3 failures

# ✅ GOOD: Validation before completion
> "Run tests for login feature"
# If tests pass:
TaskUpdate: {id: "login-feature", status: "completed", metadata: {test_results: "pass"}}
# If tests fail:
TaskUpdate: {id: "login-feature", status: "in_progress", metadata: {test_results: "3 failures", error_log: "..."}}
```

---

## <a name="troubleshooting"></a>Поиск неисправностей

### Вопрос: Задачи не сохраняются между сеансами.

**Симптом**: `TaskList` показывает пустое сообщение после перезапуска Claude

**Solution**:
```bash
# Ensure CLAUDE_CODE_TASK_LIST_ID is set before launching
export CLAUDE_CODE_TASK_LIST_ID="your-project-name"
claude

# Verify storage directory exists
ls ~/.claude/tasks/your-project-name/
```

### Вопрос: Несколько проектов используют общие списки задач.

**Симптом**: просмотр задач из проекта A при работе над проектом B

**Cause**: использование одного и того же идентификатора списка задач в разных репозиториях.

**Solution**:
```bash
# Use repo-specific IDs with context
cd ~/projects/api
export CLAUDE_CODE_TASK_LIST_ID="api-v2-migration"
claude

cd ~/projects/frontend
export CLAUDE_CODE_TASK_LIST_ID="frontend-redesign"
claude
```

### Вопрос: TodoWrite по-прежнему используется вместо Tasks API.

**Симптом**: задачи не сохраняются даже при установленном идентификаторе списка задач.

**Cause**: `CLAUDE_CODE_ENABLE_TASKS=false` установлен в среде

**Solution**:
```bash
# Check environment
env | grep CLAUDE_CODE_ENABLE_TASKS

# Unset if present
unset CLAUDE_CODE_ENABLE_TASKS

# Or explicitly enable (v2.1.19+ defaults to enabled)
export CLAUDE_CODE_ENABLE_TASKS=true
```

### Вопрос: Зависимости задач не применяются принудительно.

**Симптом**: Claude выполняет заблокированные задачи до завершения зависимостей.

**Cause**: зависимости неправильно определены в TaskCreate.

**Solution**:
```bash
# Ensure dependencies use correct task IDs
TaskCreate: {
  title: "Task B",
  dependencies: ["task-a-id"], # ✅ Use actual task ID
  # NOT dependencies: ["Task A"] # ❌ Task title won't work
}

# Verify dependencies:
TaskGet task-b-id
# Should show: "blockedBy": ["task-a-id"]
```

---

## Дополнительно: метаданные настраиваемых задач

Расширяйте задачи с помощью метаданных, специфичных для предметной области, для улучшения рабочих процессов.

### Соглашения о метаданных

**Задачи по оптимизации производительности:**
```json
{
  "metadata": {
    "type": "performance",
    "baseline_metric": "2000ms",
    "target_metric": "200ms",
    "profiling_tool": "Chrome DevTools",
    "measurement_location": "dashboard load time"
  }
}
```

**Задачи безопасности:**
```json
{
  "metadata": {
    "type": "security",
    "severity": "critical",
    "cve_id": "CVE-2024-1234",
    "affected_versions": "< 2.1.0",
    "mitigation": "Update package X to v3.0+"
  }
}
```

**Задачи по исправлению ошибок:**
```json
{
  "metadata": {
    "type": "bugfix",
    "issue_url": "https://github.com/org/repo/issues/456",
    "reported_by": "user@example.com",
    "reproduction_steps": "1. Login 2. Navigate to dashboard 3. Click export",
    "error_message": "TypeError: Cannot read property 'map' of undefined"
  }
}
```

### Запрос по метаданным

```bash
# Filter tasks by type (requires scripting, not built-in)
TaskList | jq '.tasks[] | select(.metadata.type == "security")'

# Find high-priority pending tasks
TaskList | jq '.tasks[] | select(.metadata.priority == "high" and .status == "pending")'
```

---

## Протокол жизненного цикла сеанса

Каждый сеанс агента следует одной и той же последовательности из десяти шагов: от загрузки до фиксации. Явное определение этих шагов, а не оставление их неявными, обеспечивает надежное возобновление сеансов после прерывания. Собственная команда инженеров Anthropic наблюдала это непосредственно: в эксперименте с игровым редактором запуск голого Claude не удался на полпути, в то время как та же рабочая нагрузка, завернутая в структурированный сеансовый пакет, завершилась успешно (источник: [Anthropic Engineering Blog](https://www.anthropic.com/engineering/harness-design-long-running-apps)).

| Шаг | Действие | Артефакт |
|------|--------|----------|
| НАЧИНАТЬ | Читать инструкции по проекту | `AGENTS.md` или `CLAUDE.md` |
| ИНИТ | Запустите загрузку среды | `init.sh` / `npm install && npm run check` |
| ЧИТАТЬ | Загрузить состояние предыдущего сеанса | `progress.md` |
| ВЫБИРАТЬ | Выберите одну функцию, установите статус активным | `feature_list.json` |
| ВЫПОЛНЯТЬ | Реализуйте только эту функцию | Исходные файлы |
| Проверить | Запустите трехуровневую проверку (lint, тесты, e2e) | Коды выхода |
| ЗАВОРАЧИВАТЬ | Запись о завершении и доказательства | `progress.md`, `feature_list.json` |
| УБОРКА | Удалите временные файлы, проверьте чистоту перезапуска репо | Состояние репо |
| СОВЕРШИТЬ | Отметить границу сеанса в git | История Git |
| ПЕРЕДАВАТЬ | Напишите или обновите записку о передаче | `claudedocs/handoffs/` |

### <a name="the-continuity-artifact-progressmd"></a>Артефакт непрерывности: `progress.md`.

`progress.md` — это компактная отправная точка для следующей сессии. Он записывает активную функцию, проверенную версию, блокировщики и следующее действие. Передача может содержать больше контекста: решения, критерии приемки, доказательства и право собственности. Любой артефакт может служить человеку или агенту. Выбирайте по необходимой информации, а не по фиксированному разделению аудитории.

```markdown
# Session Progress

last_updated: 2026-05-04
active_feature: feat-002
last_commit: a3f92c1
session_count: 3

## Status
- feat-001: passing (verified 2026-05-01)
- feat-002: active (in progress)
- feat-003: not_started

## Next action
Finish chunking implementation, then run: npm test -- --grep 'chunking'

## Blockers
None
```

На этапе ЧТЕНИЕ используйте это как путь к задаче, а затем проверьте соответствующее актуальное состояние и текущую авторизацию, прежде чем действовать. Записанная фиксация и статус являются историческими утверждениями; они не устанавливают, что тесты все еще пройдены или что предыдущее внешнее действие следует повторить.

### <a name="how-this-composes-with-the-handoff-triad"></a>Как это сочетается с триадой передачи управления

Триада передачи обслуживания (создание, возобновление, обновление) и `progress.md` могут сосуществовать, если их роли ясны: компактный указатель и более полный контракт. Выберите авторитетного владельца для каждого факта и свяжите с ним полученные резюме. Запись обоих в WRAP UP сама по себе не предотвращает дрейф. При возобновлении согласуйте редакцию, свидетельства о приемке, блокировщиков и следующего владельца. См. [передача обслуживания двух экземпляров](dual-instance-planning.md#plan-template) и [контракты между сеансами](cross-session-messaging.md).

### Шаг COMMIT как граница сеанса

Фиксация на этапе COMMIT — это не просто операция VCS. Это утверждение о том, что репозиторий находится в перезапускаемом состоянии. Правило такое же, как и в триаде передачи: фиксируйте только тогда, когда функция завершена и проверена. Если наполовину реализованная функция остается в неработающем состоянии, это означает, что следующий сеанс начнется с неработающей средой, и `npm run check` шага INIT немедленно завершится сбоем, выявив проблему до начала какой-либо новой работы. Этот сбой информативен, но лучше предотвратить его, удерживая фиксацию до тех пор, пока шаг VERIFY не пройдет без ошибок.

Информацию о режиме сбоя, возникающем при пропуске шага VERIFY, см. в разделе «Пробел в проверке» в [tdd-with-claude.md](tdd-with-claude.md#the-verification-gap).

---

## Связанные рабочие процессы

- **[TDD с Claude](tdd-with-claude.md)** — разработка с упором на тестирование с отслеживанием задач
- **[Plan-Driven Development](plan-driven.md)** — стратегическое планирование для иерархии задач
- **[Итеративное уточнение](iterative-refinement.md)** - Постепенные улучшения с помощью задач
- **[Рабочий процесс исследования](exploration-workflow.md)** — этап обнаружения перед созданием задачи

---

## Ссылка

**Документация по инструменту**: см. [Полное руководство, раздел 5.X](#task-management-system)

**Sources:**
- Официально: [Claude Code CHANGELOG v2.1.16](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- Официально: [Системные подсказки — TaskCreate](https://github.com/Piebald-AI/claude-code-system-prompts)
- Сообщество: [paddo.dev - От бусинок к задачам](https://paddo.dev/blog/from-beads-to-tasks/)
- Сообщество: [llbbl.blog — Два изменения в Claude Code](https://llbbl.blog/2026/01/25/two-changes-in-claude-code.html)

**Отслеживание версий**: Этот рабочий процесс документирует Claude Code v2.1.16+ (выпущен 22 января 2026 г.). Проверьте последние изменения в [claude-code-releases.yaml](../../machine-readable/claude-code-releases.yaml).