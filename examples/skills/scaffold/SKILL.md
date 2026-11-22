---
name: scaffold
description: "Интерактивный тренер, который задает 4–5 вопросов, чтобы определить, нужен ли вам агент, команда, навык, хук или правило, а затем генерирует готовый шаблон. Использование: /scaffold (аргументы не нужны, начинается сеанс коучинга)"
effort: medium
disable-model-invocation: true
---

# Claude Code тренер по лесам

Интерактивный мастер, который определяет подходящий компонент Claude Code для вашего варианта использования и создает готовый к использованию шаблон.

**Usage**: `/scaffold` (аргументы не нужны). Начните разговор.

---

## Фаза 1: Открытие

Откройте это приглашение, затем дождитесь ответа пользователя, прежде чем спрашивать что-либо еще:

> Что вы хотите автоматизировать или создать? Одного предложения достаточно, чтобы начать.

Как только у вас появится примерное представление, задайте следующие вопросы по порядку. Пропустите вопрос, если предыдущий ответ уже дает на него ответ.

### Q1: Триггер

> Как это срабатывает?
>
> а) запускаю сам командой (например `/something`)
> б) Он должен срабатывать автоматически, когда Claude выполняет действие (записывает файл, запускает bash, завершает сеанс...)
> в) Это должно применяться постоянно, на каждом сеансе, без моего вмешательства.

- Если **b** → скорее всего **Hook** (перейдите к Q_hook)
- Если **c** → скорее всего **Rule** (перейдите к Q_rule)
- Если **a** → перейдите к Q2.

### Q2: Экспертиза предметной области

> Требуется ли для этого глубокая экспертиза по конкретному проекту?
> Например: знание вашей схемы GraphQL, ваших соглашений о миграции, ваших внутренних шаблонов API, вашей модели затрат...

- Если **да, глубокая экспертиза** → скорее всего, **Agent** (перейдите к Q_agent)
- Если **нет, больше контрольного списка или процедуры** → перейдите к вопросу 3.

### Вопрос 3: Сложность

> Насколько это связано с контекстом и логикой?
>
> а) Много: множество правил, примеры из конкретной предметной области, тонкие суждения.
> б) Просто: несколько шагов, шаблон, немного bash

- Если **a** → скорее всего **Skill**
- Если **b** → скорее всего **Command**

### Вопрос 4. Повторное использование области действия.

> Кому это нужно?
>
> а) Только я
> б) Вся моя команда
> в) Он должен автоматически вызываться другими агентами.

- **c** → усиливает **Agent** (необходимо поле `description:`, которое могут прочитать другие агенты)
- **b** → усиливает **Command** или **Skill** (общая конфигурация)
- **a** → может оставаться простой личной **Command**

### В5: Тип выхода

> Что должно произойти в конце?
>
> а) Отчет или анализ: Claude читает и объясняет, файлы не затрагиваются.
> б) Сгенерированный код или файлы
> в) Предпринятое действие (фиксация, отправка, вызов API...)
> г) Поведение Claude постоянно меняется (всегда делает X, никогда не делает Y)

- **a** → Агент только для чтения (в инструментах нет `Write` или `Bash`)
- **b/c** → Агент или Command/Skill с доступом на запись
- **d** → Правило или Перехват, если это обусловлено определенным событием.

---

## Внутреннее дерево решений (не отображать, использовать для обоснования)

```
Triggered automatically?
  ├─ On Claude action (Write, Bash, SessionEnd...) -> Hook
  └─ Always active, no trigger -> Rule

Triggered manually?
  ├─ Deep domain expertise required?
  │   ├─ Yes + invokable by other agents -> Agent
  │   └─ Yes + manual use only -> Agent or Skill
  └─ Procedure / checklist, no special expertise?
      ├─ Complex, lots of project-specific context -> Skill
      └─ Simple, a few steps -> Command

Common hybrid cases:
  - Agent + Command: specialist agent + a shortcut command to invoke it
  - Rule + Hook: permanent behavior + blocking on a specific action
  - Skill + Agent: skill that delegates analysis to an agent
```

---

## Этап 2: Рекомендация

После вопросов отобразите следующую структуру:

```
## Diagnosis

You want to: [one-line summary of the use case]

## Recommendation: [TYPE]

**Why?**
[2-3 sentences: trigger type, complexity level, reuse scope]

**What it would NOT be, and why:**
- Not an agent because [short reason]
- Not a rule because [short reason]
[adjust based on actual candidates]

**Hybrid case?** [Yes / No]
[If yes: explain the combination and which file to create first]
```

---

## Этап 3: Строительные леса

Спросите: «Сгенерировать файл scaffold?»

Если да, создайте приведенный ниже шаблон на основе обнаруженного типа.

---

### Агентский эшафот

```markdown
---
name: [kebab-case-name]
description: "[What this agent does in one sentence. When to invoke it. Example triggers for other agents.]"
model: sonnet
tools: Read, Grep, Glob[, Write, Bash (add only if this agent must modify files or run commands)]
---

# [Agent Name]

[One paragraph: what this agent is for, what it is NOT for, and when to prefer another agent.]

## Context

[Stack, conventions, or domain knowledge this agent needs to be effective.]

## When to invoke

- [Concrete trigger 1]
- [Concrete trigger 2]
- [Concrete trigger 3]

## Protocol

### Step 1: Read context

```bash
# What to read before reasoning
cat CLAUDE.md 2>/dev/null
```

### Шаг 2: Анализируйте

[Что искать. Шаблоны для обнаружения. Красные флаги на поверхность.]

### Шаг 3: Вывод

[Точный формат вывода: используйте блок кода уценки, чтобы показать структуру.]

## Красные флаги

| Шаблон | Риск |
|---------|------|
| [шаблон] | [влияние] |

## Что НЕ делает этот агент

- [Граница области 1]
- [Граница области действия 2: укажите другого агента, если это необходимо]
```

**File**: `.claude/agents/[name].md`

---

### Command scaffold

```markdown
---
name: [name]
description: "[What this command does in one sentence]"
argument-hint: "[arg] [--flag]"
---

# [Command Name]

[Brief description. What problem it solves. When to use it vs alternatives.]

## Arguments

- `[arg]`: [description] (default: [value])
- `--flag`: [description]

## Usage

```bash
/[name]              # Basic usage
/[name] --flag       # With flag
```

---

## Этап 1: [Название первого этапа]

[Что Claude делает на этом этапе.]

```bash
# Example commands if applicable
```

## Этап 2: [Название второго этапа]

[Что делает Claude.]

## Этап 3: Выход

[Формат вывода. Используйте блок уценки, чтобы показать структуру.]

$ARGUMENTS
```

**File**: `.claude/commands/[name].md`

---

### Skill scaffold

```markdown
---
name: [skill-name]
description: "[What this skill does. Trigger phrases that activate it. Usage: /[name] [arg]]"
---

# [Skill Name]

[What this skill does and when it applies. Distinguish from similar skills.]

## Trigger phrases

- "[phrase that activates this skill]"
- "[alternative phrasing]"

## When to use

- [Scenario 1]
- [Scenario 2]

## Workflow

### 1. [First action]: [brief description]

[Details]

### 2. [Second action]: [brief description]

[Details]

### 3. Deliver output

[Output format]

## Conventions to follow

[Project-specific rules, naming conventions, or patterns this skill must respect.]

## Common pitfalls

- [Mistake 1 and how to avoid it]
- [Mistake 2 and how to avoid it]

$ARGUMENTS
```

**Файл**: `.claude/skills/[name].md`

---

### Крюк для строительных лесов

```bash
#!/usr/bin/env bash
# =============================================================================
# [name].sh: [PreToolUse | PostToolUse | UserPromptSubmit | Stop] Hook
# =============================================================================
# [What this hook does in one line]
# Fires on: [event] matching [tool or pattern]
#
# Exit 0 = allow / continue
# Exit 2 = block with message (PreToolUse only)
#
# stdin: JSON payload from Claude Code
# =============================================================================

set -euo pipefail

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# --- Main logic ---

# [Your validation logic here]
# Example: block writes to protected paths
# FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
# if [[ "$FILE" == *"/secrets/"* ]]; then
#   echo "Blocked: writes to /secrets/ are not allowed" >&2
#   exit 2
# fi

exit 0
```

**Файл**: `.claude/hooks/[name].sh`

Также добавьте в `.claude/settings.json`:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": ".claude/hooks/[name].sh" }]
      }
    ]
  }
}
```

---

### Правило эшафота

```markdown
# [Rule Title] (Auto-loaded)

## Directive

[The rule in one imperative sentence.]

## When it applies

[Triggers, file types, or situations where this rule activates.]

## Required behavior

[What Claude must do concretely, be specific.]

## Anti-patterns

Do NOT:
- [Forbidden example]

Do:
- [Correct behavior]

---

**Auto-loaded**: This file is loaded automatically at session start.
```

**Файл**: `.claude/rules/[name].md`

Ссылка в `CLAUDE.md`, если не в автоматически загружаемом каталоге.

---

## <a name="quick-reference"></a>Шпаргалка

Если пользователь не уверен, покажите эту таблицу:

| Тип | Курок | Необходима экспертиза | Сложность | Типичный пример |
|------|---------|-----------------|------------|-----------------|
| **Агент** | Ручной или автоматический | Высокий, специфичный для предметной области | Многоэтапный анализ | `migration-reviewer`, `dbt-specialist` |
| **Команда** | Руководство `/name` | От низкого до среднего | Просто, несколько шагов | `/commit`, `/pr`, `/release` |
| **Навык** | Руководство `/name` | От среднего до высокого | Богатый рабочий процесс, много контекста | `tdd-workflow`, `api-review` |
| **Крюк** | Автоматически по событию | Нет (логика bash) | Скрипт | `security-gate.sh`, `format-on-save.sh` |
| **Правило** | Постоянно, каждый сеанс | Нет (проза) | Инструкции | `no-direct-push.md`, `english-only.md` |

---

## <a name="sources"></a>Источники

- Обзор типов компонентов: [Раздел 3](../../../guide/ultimate-guide.md)
- Примеры агентов: [agents/](../../agents/)
- Примеры хуков: [hooks/](../../hooks/)
- Примеры навыков: [skills/](../../skills/).
