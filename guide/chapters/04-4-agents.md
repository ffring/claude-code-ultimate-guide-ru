[К оглавлению](README.md) · [Предыдущая глава](03-3-memory--settings.md) · [Следующая глава](05-5-skills.md)

# <a name="4-agents"></a>4. Агенты

_Быстрый переход:_ [Что такое агенты](#41-what-are-agents) · [Создание собственных агентов](#42-creating-custom-agents) · [Шаблон агента](#43-agent-template) · [Рекомендации](#44-best-practices) · [Память агента](#45-agent-memory)

---

## 📌 Раздел 4 TL;DR (60 секунд)

**Что такое агенты**: Специализированные персонажи ИИ для конкретных задач (например, «эксперты-консультанты»)

**Когда создавать**:
- ✅ Задачи часто повторяются (проверки безопасности, дизайн API)
- ✅ Требуется специализированная область знаний
- ✅ Требуется последовательный behavior/tone
- ❌ Разовые задания (спросите Claude напрямую)

**Быстрый старт**:
1. Создать `.claude/agents/my-agent.md`
2. Добавить фронтальную часть YAML (название, описание, инструменты, модель)
3. Напишите инструкции
4. Использование: `@my-agent "task description"`

**Популярные типы агентов**: Аудитор безопасности, Генератор тестов, Рецензент кода, Дизайнер API

**Прочитайте этот раздел, если**: у вас есть повторяющиеся задачи или вам нужен опыт в предметной области.
**Пропустить if**: Все ваши задачи — это разовая исследовательская работа.

---

**Время чтения**: 20 минут
**Уровень навыка**: недели 1–2
**Цель**: Создание специализированных ИИ-помощников.

## <a name="41-what-are-agents"></a>4.1 Что такое агенты

Агенты — это специализированные подпроцессы, которым Claude может делегировать задачи.

### Зачем использовать агентов?

| Без агентов | С агентами |
|----------------|-------------|
| Один Claude делает все | Специализированные эксперты по каждой области |
| Контекст становится загроможденным | Каждый агент имеет сфокусированный контекст |
| Общие ответы | Специализированная экспертиза в предметной области |
| Ручной выбор инструмента | Предварительно настроенный доступ к инструментам |

### <a name="agent-vs-direct-prompt"></a>Агент против прямого приглашения

```
Direct Prompt:
You: Review this code for security issues, focusing on OWASP Top 10,
     checking for SQL injection, XSS, CSRF, and authentication vulnerabilities...

With Agent:
You: Use the security-reviewer agent to audit this code
```

Агент воплощает в себе весь этот опыт.

### Встроенные и пользовательские агенты

| Тип | Источник | Пример |
|------|--------|---------|
| Built-in | Claude Code по умолчанию | Исследуйте, планируйте |
| Обычай | Ваш `.claude/agents/` | Бэкенд-архитектор, ревьюер кода |

## <a name="42-creating-custom-agents"></a>4.2 Создание пользовательских агентов

Агенты представляют собой файлы уценки в формате `.claude/agents/` с заголовком YAML.

### <a name="agent-file-structure"></a>Файловая структура агента

```markdown
---
name: agent-name
description: Clear activation trigger (50-100 chars)
model: sonnet
tools: Read, Write, Edit, Bash, Grep, Glob
---

[Markdown instructions for the agent]
```

### <a name="frontmatter-fields"></a>Поля Frontmatter

Все официальные поля, поддерживаемые Claude Code ([source](https://code.claude.com/docs/en/sub-agents), проверено 27 октября 2026 г.):

| Поле | Необходимый | Описание |
|-------|----------|-------------|
| `name` | ✅ | Уникальный идентификатор длиной не более 256 символов, например `code-reviewer`. Хуки получают его как `agent_type`. Нет `:` (зарезервировано для имен в области плагинов); имя файла не должно совпадать |
| `description` | ✅ | Когда Claude должен делегировать полномочия этому субагенту (в официальных примерах написано «Использовать активно после изменений кода») |
| `model` | ❌ | `sonnet`, `opus`, `haiku`, `fable`, полный идентификатор модели, например `claude-opus-5-5` или `inherit`. Порядок разрешения: параметр `model` для каждого вызова, это поле, `CLAUDE_CODE_SUBAGENT_MODEL`, затем модель основного диалога; `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` (v2.1.257+) пропускает первые два |
| `tools` | ❌ | Разрешенные инструменты, через запятую или список YAML; наследует все доступные субагентам инструменты, если они опущены. `Agent(worker, researcher)` ограничивает порождаемые типы только для агента, работающего в качестве основного потока с `claude --agent` (`Task(...)` по-прежнему работает как псевдоним) |
| `disallowedTools` | ❌ | Инструменты для отклонения, удаления из унаследованного или указанного списка. Спецификатор, такой как `Bash(git push *)`, по-прежнему удаляет весь инструмент. |
| `permissionMode` | ❌ | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan` или `manual` (псевдоним `default`). Игнорируется для субагентов плагина |
| `maxTurns` | ❌ | Максимальные агентские обороты; на пределе вывод помечен как частичный и Claude может возобновить работу субагента |
| `autoCompactWindow` | ❌ | Нижнее окно автосжатия для этого субагента, от токенов `100000` до `1000000` (v2.1.296+) |
| `skills` | ❌ | Навыки предварительной загрузки в контекст агента при запуске (вводится весь контент, а не только доступен) |
| `mcpServers` | ❌ | Серверы MCP для этого субагента: строки имен серверов или встроенные конфигурации. |
| `hooks` | ❌ | Перехватчики жизненного цикла ограничены этим субагентом. Игнорируется для субагентов плагина |
| `memory` | ❌ | Область постоянной памяти: `user`, `project` или `local`. |
| `background` | ❌ | `true` оставляет субагента в фоновом режиме, даже когда Claude просит его подождать. Субагенты, порожденные из основного диалога, по умолчанию уже запускаются в фоновом режиме. |
| `omitClaudeMd` | ❌ | `true` запускает субагент без файлов пользователя, проекта и локальных файлов CLAUDE.md (файлы управляемой политики все еще загружаются) |
| `effort` | ❌ | Усилия во время работы этого субагента: `low`, `medium`, `high`, `xhigh`, `max`. Переопределяет уровень сеанса, а не `CLAUDE_CODE_EFFORT_LEVEL`. |
| `isolation` | ❌ | `worktree` для запуска во временном рабочем дереве git, ответвленном от вашей ветки по умолчанию. |
| `color` | ❌ | Цвет отображения в списке задач и расшифровке: `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink` или `cyan`. |
| `initialPrompt` | ❌ | Автоматически отправляется первая очередь пользователя, когда агент работает в качестве основного агента сеанса (`--agent` или настройка `agent`) |
| `experimental` | ❌ | Экспериментальные параметры, такие как `cacheTtl: 5m` или `1h` для времени жизни кэша подсказок этого субагента (внутри карты, а не на верхнем уровне). |

**Области памяти**: выберите область в зависимости от того, насколько широко должны применяться знания:

| Область применения | Хранилище | Используйте, когда |
|-------|---------|----------|
| `user` | `~/.claude/agent-memory/<name>/` | Межпроектное обучение |
| `project` | `.claude/agent-memory/<name>/` | Специализированный для проекта, доступный для совместного использования через git |
| `local` | `.claude/agent-memory-local/<name>/` | Специфично для проекта, без обязательств |

> Полный охват памяти агента (предел ввода 200 строк, структура MEMORY.md, руководство по выбору области) в [§4.5 Agent Memory](#45-agent-memory).

### <a name="model-selection"></a>Выбор модели

| Модель | Лучшее для | Скорость | Стоимость |
|-------|----------|-------|------|
| `haiku` | Быстрые задачи, простые изменения | Быстрый | Низкий |
| `sonnet` | Большинство задач (явный выбор) | Сбалансированный | Середина |
| `opus` | Сложные рассуждения, архитектура | Медленный | Высокий |

## <a name="43-agent-template"></a>4.3 Шаблон агента

Скопируйте этот шаблон, чтобы создать своего собственного агента:

```markdown
---
name: your-agent-name
description: Use this agent when [specific trigger description]
model: sonnet
tools: Read, Write, Edit, Bash, Grep, Glob
skills: []
---

# Your Agent Name

## Role Definition

You are an expert in [domain]. Your responsibilities include:
- [Responsibility 1]
- [Responsibility 2]
- [Responsibility 3]

## Activation Triggers

Use this agent when:
- [Trigger 1]
- [Trigger 2]
- [Trigger 3]

## Methodology

When given a task, you should:
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step 4]

## Output Format

Your deliverables should include:
- [Output 1]
- [Output 2]

## Constraints

- [Constraint 1]
- [Constraint 2]

## Examples

### Example 1: [Scenario Name]

**User**: [Example prompt]

**Your approach**:
1. [What you do first]
2. [What you do next]
3. [Final output]
```

## <a name="44-best-practices"></a>4.4 Лучшие практики

### Что можно и чего нельзя делать

| ✅ Делай | ❌ Не надо |
|-------|----------|
| Сделать агентов специалистами | Создание универсальных агентов |
| Определите четкие триггеры | Используйте расплывчатые описания |
| Включите конкретные примеры | Оставьте активацию неоднозначной |
| Ограничить доступ к инструментам | Раздайте все инструменты всем агентам |
| Сочиняйте с помощью навыков | Дублирующая экспертиза |

### <a name="specialization-over-generalization"></a>Специализация важнее обобщения

**Good**: Агент для каждой проблемы
```
backend-architect    → API design, database, performance
security-reviewer    → OWASP, auth, encryption
test-engineer        → Test strategy, coverage, TDD
```

**Bad**: Один агент для всего
```
full-stack-expert    → Does everything (poorly)
```

### <a name="explicit-activation-triggers"></a>Явные триггеры активации

**Хорошее описание**:
```yaml
description: Use when designing APIs, reviewing database schemas, or optimizing backend performance
```

**Плохое описание**:
```yaml
description: Backend stuff
```

### <a name="skill-composition"></a>Состав навыков

Вместо дублирования знаний:

```yaml
# security-reviewer.md
skills:
  - security-guardian  # Inherits OWASP knowledge
```

### <a name="agent-validation-checklist"></a>Контрольный список проверки агента

Прежде чем развертывать собственный агент, проверьте его на соответствие следующим критериям:

**Efficacy** (Работает ли это?)
- [ ] Протестировано на 3+ реальных сценариях использования из вашего проекта.
- [ ] Вывод постоянно соответствует ожидаемому формату
- [ ] Грамотно обрабатывает крайние случаи (пустой ввод, ошибки, тайм-ауты)
- [ ] Правильно интегрируется с существующими рабочими процессами

**Efficiency** (Эффективно ли это с точки зрения затрат?)
- [ ] <5000 токенов за типичное исполнение
- [ ] <30 секунд для стандартных задач
- [ ] Не дублирует работу, выполненную другими agents/skills.
- [ ] Оправдывает свое существование по сравнению с собственными возможностями Claude.

**Security** (Безопасно ли это?)
- [ ] Инструменты ограничены необходимым минимумом
- [ ] Нет доступа к Bash, если это не абсолютно необходимо.
- [ ] Доступ к файлам ограничен соответствующими каталогами
- [ ] В определении агента нет учетных данных или секретов.

**Техническое обслуживание** (Прослужит ли это?)
- [ ] Понятное, информативное название и описание.
- [ ] Задокументированы явные триггеры активации.
- [ ] Примеры показывают общие шаблоны использования.
- [ ] Совместимость версий отмечена, если зависит от платформы.

> 💡 **Правило трех**: Если агент не экономит значительное время хотя бы на трех повторяющихся задачах, то, вероятно, это чрезмерная инженерия. Начните с навыков и переходите к агентам только тогда, когда этого требует сложность.

> **Автоматический аудит**: запустите `/audit-agents-skills` для комплексного аудита качества всех операторов, навыков и команд. Оценивает каждый файл по 16 критериям с взвешенной оценкой (32 балла за agents/skills, 20 за команды). См. `examples/skills/audit-agents-skills/` для получения полной методологии подсчета очков.

### Фоновые субагенты

Субагенты могут работать в фоновом режиме, не блокируя основной сеанс. Это полезно для таких задач, как запуск тестов, анализ или уведомления.

| Режим | Поведение | Используйте, когда |
|------|----------|----------|
| По умолчанию | Родитель ждет вывода агента | Прежде чем продолжить, нужен результат |
| Фон | Агент работает параллельно, родительский продолжает | Принцип «выстрелил и забыл» (тесты, линтинг, уведомления) |

**Управление фоновыми агентами:**

```bash
# List running agents + kill overlay
ctrl+f    # Opens agent manager overlay

# Cancel main thread only (background agents keep running)
ESC
ctrl+c
```


## <a name="45-agent-memory"></a>4.5 Память агента

Представлен в **Claude Code v2.1.33** (февраль 2026 г.), `memory` Поле frontmatter дает субагентам постоянные, основанные на уценке знания, которые сохраняются в течение сеансов. До этого каждый вызов агента начинался с чистого листа, независимо от предыдущих запусков.

### Почему память агента имеет значение

Без памяти агент проверки кода, обнаруживший, что ваша команда предпочитает шаблоны раннего возврата вложенным блокам `if`, не сможет продолжить это наблюдение. Следующий вызов начинается с холода. Память агента исправляет это: агент записывает свои выводы в структурированный файл, и будущие вызовы продолжаются с того места, где остановился последний.

Это отличается от других систем памяти в Claude Code. Каждый из них служит разным целям:

| Система | Написал | Читать | Область применения | сохраняется |
|--------|------------|---------|-------|----------|
| **CLAUDE.md** | Вы (вручную) | Основной Claude + все агенты | Проект или глобальный | Git-tracked |
| **Auto-memory** | Главный Claude (автоматический) | Только основной Claude | Для каждого проекта для каждого пользователя | Gitignored |
| **Память агента** | Сам агент | Только этот конкретный агент | Настраиваемый | Зависит от объема |

Агент считывает как `CLAUDE.md` (общий контекст проекта), так и свою собственную память (накопленные знания, специфичные для агента). Эти два слоя дополняют друг друга.

### <a name="memory-scopes"></a>Области памяти

Выбирайте сферу деятельности исходя из того, где знания пригодятся:

| Область применения | Место хранения | Версия контролируется | Лучшее для |
|-------|-----------------|-------------------|----------|
| `user` | `~/.claude/agent-memory/<agent-name>/` | Нет | Межпроектное обучение: рецензент кода, который накапливает знания о шаблонах в каждом репозитории. |
| `project` | `.claude/agent-memory/<agent-name>/` | Да (обязано) | Знания, специфичные для проекта, которыми должна поделиться вся команда (например, соглашения API, обнаруженные агентом по формированию лесов) |
| `local` | `.claude/agent-memory-local/<agent-name>/` | Нет (gitignored) | Знания, специфичные для проекта, которые являются личными и не должны передаваться |

Эти области отражают иерархию настроек (`~/.claude/settings.json` → `.claude/settings.json` → `.claude/settings.local.json`), что делает ментальную модель единообразной для всей системы.

Активируйте память, добавив одну строку в заголовок агента:

```yaml
---
name: code-reviewer
description: Reviews code for quality, security, and consistency
tools: Read, Grep, Glob
memory: user
---
```

### Как работает 200-строчная инъекция

При запуске агента Claude Code считывает первые 200 строк `MEMORY.md` в каталоге памяти агента и вводит их непосредственно в системную подсказку агента. Это происходит автоматически. Никакого явного вызова инструмента не требуется.

```
~/.claude/agent-memory/code-reviewer/
├── MEMORY.md                   ← First 200 lines injected at startup
├── react-patterns.md           ← Topic-specific file, loaded on demand
└── security-checklist.md       ← Topic-specific file, loaded on demand
```

Как только `MEMORY.md` превысит 200 строк, агент должен переместить подробный контент в файлы по конкретной теме и сохранить `MEMORY.md` в виде краткого указателя со ссылками. Агент управляет этим сам: `Read`, `Write` и `Edit` автоматически доступны любому агенту с установленным `memory`.

**Практическое значение**: структура `MEMORY.md` похожа на умную сводку, а не на журнал, предназначенный только для добавления. Записи с высоким уровнем сигнала вверху, файлы тем для глубины.

### <a name="memorymd-structure"></a>Структура MEMORY.md

Хорошо структурированный файл памяти агента делает внедренный контент сразу полезным:

```markdown
# code-reviewer memory
Last updated: 2026-03-10

## Project conventions (confirmed)
- Early return over nested conditionals (consistent across 12 reviews)
- `zod` for all API boundary validation — never `joi` or raw type checks
- Auth middleware must be applied before any controller logic

## Recurring issues
- Missing `await` on async DB calls in `/src/services/` (seen 4× this month)
- `any` casts in migration scripts accepted as a known exception

## Patterns to watch
- New contributors tend to skip error boundary wrapping in React trees

## Topic files
- [react-patterns.md](react-patterns.md) — component structure, hook usage, memoization rules
- [security-checklist.md](security-checklist.md) — OWASP Top 10 per-category notes
```

### Побуждение агентов использовать свою память

Память полезна только в том случае, если агент читает и записывает ее последовательно. Явное приглашение в теле агента имеет большое значение:

```yaml
---
name: api-developer
description: Implement API endpoints following team conventions
tools: Read, Write, Edit, Bash
memory: project
---

Before starting any task, review your memory for relevant conventions and
past decisions. After completing a task, update your memory with new patterns,
architectural decisions, or recurring issues you observed. Keep MEMORY.md
under 200 lines — move detailed notes to topic-specific files.
```

Этот шаблон (навыки для статических стартовых знаний, память для динамических накопленных знаний) дает агентам лучшее из обоих миров. Навыки внедряют тщательно подобранный справочный материал при первом запуске; память сохраняет то, что агент обнаруживает самостоятельно.

### Выбор подходящего объема

| Ситуация | Рекомендуемый объем |
|-----------|------------------|
| Универсальный рецензент кода, используемый в нескольких проектах. | `user`: знания накапливаются по всему миру |
| API Агент леса, который изучает соглашения о конечных точках вашей команды. | `project`: используйте память, чтобы товарищи по команде получили пользу |
| Персональный агент рефакторинга с вашими предпочтениями в стиле. | `local`: остается только на вашем компьютере. |
| Агент клиентского проекта, который вы не хотите смешивать с личными знаниями | `local`: изолирован, не зафиксирован |

> **Источники**: [Создание пользовательских субагентов](https://code.claude.com/docs/en/sub-agents) · [Управление памятью Claude](https://code.claude.com/docs/en/memory) · Claude Code v2.1.33 Примечания к выпуску

> **См. также**: [Системы памяти: Frontmatter памяти агента](../core/memory-systems.md#24-agent-memory-frontmatter), чтобы узнать о структуре MEMORY.md, подробностях внедрения 200 строк и шаблонах подсказок.

---

## <a name="46-agent-examples"></a>4.6 Примеры агентов

### <a name="example-1-code-reviewer-agent"></a>Пример 1: Агент проверки кода

```markdown
---
name: code-reviewer
description: Use for code quality reviews, security audits, and performance analysis
model: sonnet
tools: Read, Grep, Glob
skills:
  - security-guardian
---

# Code Reviewer

## Scope Definition

Perform comprehensive code reviews with isolated context, focusing on:
- Code quality and maintainability
- Security best practices (OWASP Top 10)
- Performance optimization
- Test coverage analysis

Scope: Code review analysis only. Provide findings without implementing fixes.

## Activation Triggers

Use this agent when:
- Completing a feature before PR (need fresh eyes on code)
- Reviewing someone else's code (isolated review context)
- Auditing security-sensitive code (security-focused scope)
- Analyzing performance bottlenecks (performance-focused scope)

## Methodology

1. **Understand Context**: Read the code and understand its purpose
2. **Check Quality**: Evaluate readability, maintainability, DRY principles
3. **Security Scan**: Look for OWASP Top 10 vulnerabilities
4. **Performance Review**: Identify potential bottlenecks
5. **Provide Feedback**: Structured report with severity levels

## Output Format

### Code Review Report

**Summary**: [1-2 sentence overview]

**Critical Issues** (Must Fix):
- [Issue with file:line reference]

**Warnings** (Should Fix):
- [Issue with file:line reference]

**Suggestions** (Nice to Have):
- [Improvement opportunity]

**Positive Notes**:
- [What was done well]
```

### <a name="example-2-debugger-agent"></a>Пример 2: Агент отладчика

```markdown
---
name: debugger
description: Use when encountering errors, test failures, or unexpected behavior
model: sonnet
tools: Read, Bash, Grep, Glob
---

# Debugger

## Scope Definition

Perform systematic debugging with isolated context:
- Investigate root causes, not symptoms
- Use evidence-based debugging approach
- Verify rather than assume (always review output, LLMs can make mistakes)

Scope: Debugging analysis only. Focus on root cause identification without context pollution from previous debugging attempts.

## Methodology

1. **Reproduce**: Confirm the issue exists
2. **Isolate**: Narrow down to smallest reproducible case
3. **Analyze**: Read code, check logs, trace execution
4. **Hypothesize**: Form theories about the cause
5. **Test**: Verify hypothesis with minimal changes
6. **Fix**: Implement the solution
7. **Verify**: Confirm fix works and doesn't break other things

## Output Format

### Debug Report

**Issue**: [Description]
**Root Cause**: [What's actually wrong]
**Evidence**: [How you know]
**Fix**: [What to change]
**Verification**: [How to confirm it works]
```

### Пример 3: Агент серверного архитектора

```markdown
---
name: backend-architect
description: Use for API design, database optimization, and system architecture decisions
model: opus
tools: Read, Write, Edit, Bash, Grep
skills:
  - backend-patterns
---

# Backend Architect

## Scope Definition

Analyze backend architecture with isolated context, focusing on:
- API design (REST, GraphQL, tRPC)
- Database modeling and optimization
- System scalability
- Clean architecture patterns

Scope: Backend architecture analysis only. Focus on design decisions without frontend or DevOps considerations.

## Activation Triggers

Use this agent when:
- Designing new API endpoints (need architecture-focused analysis)
- Optimizing database queries (database scope isolation)
- Planning system architecture (system design scope)
- Refactoring backend code (backend-only scope)

## Methodology

1. **Requirements Analysis**: Understand the business need
2. **Architecture Review**: Check current system state
3. **Design Options**: Propose 2-3 approaches with trade-offs
4. **Recommendation**: Suggest best approach with rationale
5. **Implementation Plan**: Break down into actionable steps

## Constraints

- Follow existing project patterns
- Prioritize backward compatibility
- Consider performance implications
- Document architectural decisions
```

## <a name="47-advanced-agent-patterns"></a>4.7 Расширенные шаблоны агентов

### Инструмент SEO - оптимизация описаний агентов

Поле `description` определяет, когда Claude автоматически активирует вашего агента. Оптимизируйте его как SEO:

```yaml
# ❌ Bad description
description: Reviews code

# ✅ Good description (Tool SEO)
description: |
  Security code reviewer - use PROACTIVELY when:
  - Reviewing authentication/authorization code
  - Analyzing API endpoints
  - Checking input validation
  - Auditing data handling
  Triggers: security, auth, vulnerability, OWASP, injection
```

**Инструмент SEO-методы**:
1. **"используйте ПРОАКТИВНО"**: Поощряет автоматическую активацию
2. **Явные триггеры**: Ключевые слова, которые запускают агента
3. **Перечисленные контексты**: Когда агент актуален
4. **Короткие ники**: `sec-1`, `perf-a`, `doc-gen`

### <a name="agent-weight-classification"></a>Классификация агентов по весу

| Категория | Токены | Время инициализации | Оптимальное использование |
|----------|--------|-----------|-------------|
| **Легкий** | <3K | <1s | Частые задачи, работники |
| **Средний** | 10-15K | 2-3s | Анализ, отзывы |
| **Тяжелый** | 25K+ | 5-10s | Архитектура, полный аудит |

**Золотое правило**: легкий агент используется в 100 раз > тяжелый агент используется в 10 раз

### <a name="the-7-parallel-task-method"></a>Метод 7 параллельных задач

Запустите параллельно 7 субагентов, ориентированных на конкретный объем, чтобы получить полные функции:

```
┌─────────────────────────────────────────────────────────────┐
│   PARALLEL FEATURE IMPLEMENTATION                           │
│                                                             │
│   Task 1: Components     → Create React components          │
│   Task 2: Styles         → Generate Tailwind styles         │
│   Task 3: Tests          → Write unit tests                 │
│   Task 4: Types          → Define TypeScript types          │
│   Task 5: Hooks          → Create custom hooks              │
│   Task 6: Integration    → Connect with API/state           │
│   Task 7: Config         → Update configurations            │
│                                                             │
│   All in parallel → Final consolidation                     │
└─────────────────────────────────────────────────────────────┘
```

**Пример запроса**:
```
Implement the "User Profile" feature using 7 parallel sub-agents:

1. COMPONENTS: Create UserProfile.tsx, UserAvatar.tsx, UserStats.tsx
2. STYLES: Define Tailwind classes in a styles file
3. TESTS: Write tests for each component
4. TYPES: Create types in types/user-profile.ts
5. HOOKS: Create useUserProfile and useUserStats hooks
6. INTEGRATION: Connect with existing tRPC router
7. CONFIG: Update exports and routing

Launch all agents in parallel.
```

### <a name="split-role-sub-agents"></a>Разделение ролей субагентов

**Concept**: Параллельный многоперспективный анализ.

**Process**:
```
┌─────────────────────────────────────────────────────────────┐
│   SPLIT ROLE ANALYSIS                                       │
│                                                             │
│   Step 1: Setup                                             │
│   └─ Activate Plan Mode (thinking enabled by default)       │
│                                                             │
│   Step 2: Role Suggestion                                   │
│   └─ "What expert roles would analyze this code?"           │
│      Claude suggests: Security, Performance, UX, etc.       │
│                                                             │
│   Step 3: Selection                                         │
│   └─ "Use: Security Expert, Senior Dev, Code Reviewer"      │
│                                                             │
│   Step 4: Parallel Analysis                                 │
│   ├─ Security Agent: [Vulnerability analysis]               │
│   ├─ Senior Agent: [Architecture analysis]                  │
│   └─ Reviewer Agent: [Readability analysis]                 │
│                                                             │
│   Step 5: Consolidation                                     │
│   └─ Synthesize 3 reports into recommendations              │
└─────────────────────────────────────────────────────────────┘
```

**Подсказка для проверки кода** (ориентирована на область действия):
```
Analyze this PR with isolated scopes:
1. Architecture Scope: Design patterns, SOLID principles, modularity
2. Security Scope: Vulnerabilities, injection risks, auth/authz flaws
3. Performance Scope: Database queries, algorithmic complexity, caching
4. Maintainability Scope: Code clarity, documentation, naming conventions
5. Testing Scope: Test coverage, edge cases, testability

Context: src/**, tests/**, only files changed in PR
```

**UX Подсказка для проверки** (с учетом объема):
```
Evaluate this interface with isolated scopes:
1. Visual Design Scope: Consistency with design system, spacing, typography
2. Usability Scope: Discoverability, user flow, cognitive load
3. Efficiency Scope: Keyboard shortcuts, power user features, quick actions
4. Accessibility Scope: WCAG 2.1 AA compliance, screen reader, keyboard nav
5. Responsive Scope: Mobile breakpoints, touch targets, viewport handling

Context: src/components/**, styles/**, only UI-related files
```

**Производственный пример: проверка многоагентного кода** (Пэт Каллен, январь 2026 г.):

Агенты, ориентированные на масштабы, для всестороннего PR-анализа:

1. **Область согласованности**: повторяющаяся логика, нарушения шаблона, соответствие DRY (контекст: полная разница PR)
2. **SOLID Область применения**: нарушения SRP, вложенные условные выражения (>3 уровней), цикломатическая сложность >10 (контекст: изменен classes/functions)
3. **Область защитного кода**: тихие перехваты, проглатываемые исключения, скрытые резервные варианты (контекст: код обработки ошибок)

**Шаблоны клавиш** (помимо общего разделения ролей):

- **Предполетная проверка**: `git log --oneline -10 | grep "Co-Authored-By: Claude"` для обнаружения последующих пропусков и предотвращения повторения предложений.
- **Антигаллюцинация**: Используйте `Grep`/`Glob` для проверки шаблонов, прежде чем рекомендовать их (правило возникновения: >10 = установлено, <3 = не установлено)
- **Согласование**: отдавайте приоритет существующим шаблонам проектов над идеальными шаблонами, пропускайте предложения с документированным обоснованием.
- **Классификация серьезности**: 🔴 Необходимо исправить (блокировщики) / 🟡 Следует исправить (улучшения) / 🟢 Можно пропустить (желательно)
- **Петля конвергенции**: просмотр → исправление → повторный просмотр → повтор (максимум 3 итерации), пока не останутся только необязательные улучшения.

**Производственные гарантии**:

- Чтение полного контекста файла (а не только строк сравнения)
- Условная загрузка контекста на основе содержимого различий (запросы к базе данных → проверка индексов, маршруты API → проверка промежуточного программного обеспечения аутентификации)
- Список пропуска защищенных файлов (package.json, миграции, .env)
- Контроль качества: проверка `tsc && lint` перед каждой итерацией.

**Источник**: [Заключительный обзор Пэта Каллена](https://gist.github.com/patyearone/c9a091b97e756f5ed361f7514d88ef0b)
**Реализация**: см. расширенный раздел `/review-pr`, `examples/agents/code-reviewer.md`, `guide/workflows/iterative-refinement.md` (проверка цикла автокоррекции).

### Названные перспективные агенты

В руководстве «персонажи с опытом ролевой игры» перечислены как плохая причина для использования агентов (см. §3.x, Когда НЕ использовать агентов). Именованные перспективные агенты представляют собой другой шаблон, и его не следует путать с ним.

**Различие**:

| Шаблон | Что это такое | Проблема |
|---------|-----------|---------|
| Персона ролевая игра (анти-шаблон) | «Вы старший бэкенд-разработчик с 10-летним опытом» | Общая роль, ничего не добавляет к хорошей подсказке |
| Именованная перспектива | «Обзор с точки зрения DHH» | Кодирует конкретный, узнаваемый набор инженерных мнений. |

Именованный перспективный агент использует широко известное инженерное имя в качестве сжатого приглашения. Название агента «DHH» объединяет в себе следующее, не уточняя это: толстые модели, тонкие контроллеры, соглашения REST о конфигурации, скептицизм в отношении преждевременной абстракции, прагматизм Rails. Это имя является ярлыком для четкого самоуверенного стиля, а не костюма.

**Когда это работает**: Только для инженеров, чьи взгляды Claude были изучены и чьи мнения соответствуют стабильному, узнаваемому стилю. DHH (Rails), Кент Бек (TDD, простота), Мартин Фаулер (рефакторинг, шаблоны) — хорошие кандидаты. Случайные имена — нет.

**Example** (из плагина Every.to Compound-Engineering):

```markdown
---
name: dhh-reviewer
description: Review code from DHH's perspective. Prioritize Rails conventions, fat models, thin controllers, pragmatic REST, and skepticism of unnecessary abstraction.
allowed-tools: Read, Grep
---
```

Ценность агента заключается в том, чтобы выявить последовательную точку зрения, которая может противоречить вашему подходу по умолчанию, а не в имитации человека.

**Предостережение**: Назначенные перспективные агенты могут меняться по мере развития обучения Claude. Относитесь к имени как к удобному сокращению, а не как к гарантии того, что агент будет отслеживать текущее мнение реального человека.

*Источник: плагин Every.to для комплексного проектирования (2026 г.)*

### <a name="parallelization-decision-matrix"></a>Матрица решений по распараллеливанию

```
┌─────────────────────────────────────────────────────────────┐
│   PARALLELIZABLE?                                           │
│                                                             │
│              Non-destructive          Destructive           │
│              (read-only)              (write)               │
│                                                             │
│   Independent   ✅ PARALLEL           ⚠️ SEQUENTIAL        │
│                 Max efficiency         Plan Mode first      │
│                                                             │
│   Dependent     ⚠️ SEQUENTIAL         ❌ CAREFUL            │
│                 Order matters          Risk of conflicts    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**✅ Идеально распараллеливаемый**:
```
"Search 8 different GitHub repos for best practices on X"
"Analyze these 5 files for vulnerabilities (without modifying)"
"Compare 4 libraries and produce a comparative report"
```

**⚠️ Рекомендуется последовательное**:
```
"Refactor these 3 files (they depend on each other)"
"Migrate DB schema then update models then update routers"
```

**❌ Требует особого ухода**:
```
"Modify these 10 files in parallel"
→ Risk: conflicts if files share imports/exports
→ Solution: Plan Mode → Identify dependencies → Sequence if needed
```

### <a name="multi-agent-orchestration-pattern"></a>Шаблон многоагентной оркестровки

```
┌─────────────────────────────────────────────────────────────┐
│   ORCHESTRATION PATTERN                                     │
│                                                             │
│                    ┌──────────────┐                         │
│                    │  Sonnet 5.5  │                         │
│                    │ Orchestrator │                         │
│                    └──────┬───────┘                         │
│                           │                                 │
│              ┌────────────┼────────────┐                    │
│              │            │            │                    │
│              ▼            ▼            ▼                    │
│        ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│        │ Haiku   │  │ Haiku   │  │ Haiku   │                │
│        │ Worker1 │  │ Worker2 │  │ Worker3 │                │
│        └────┬────┘  └────┬────┘  └────┬────┘                │
│              │            │            │                    │
│              └────────────┼────────────┘                    │
│                           │                                 │
│                           ▼                                 │
│                    ┌──────────────┐                         │
│                    │  Sonnet 5.5  │                         │
│                    │  Validator   │                         │
│                    └──────────────┘                         │
│                                                             │
│   Cost: 2-2.5x cheaper than Opus everywhere                 │
│   Quality: Equivalent for most common tasks                 │
└─────────────────────────────────────────────────────────────┘
```

### Матрица выбора тактической модели

> См. [Раздел 2.5 «Руководство по выбору модели и анализу»](02-2-core-concepts.md#25-model-selection--thinking-guide), где приведена каноническая таблица решений с уровнями усилий и оценками затрат.

**Пример оптимизации затрат**:
```
Scenario: Refactoring 100 files

❌ Naive approach:
- Opus for everything
- Cost: ~$50-100
- Time: 2-3h

✅ Optimized approach:
- Sonnet: Analysis and plan (1x)
- Haiku: Parallel workers (100x)
- Sonnet: Final validation (1x)
- Cost: ~$5-15
- Time: 1h (parallelized)

Estimated savings: significant (varies by project)
```

---

### Модель саморазвивающегося агента

Агент, который обновляет свои навыки после каждого выполнения. Вместо ведения документации вручную агент считывает текущее состояние своего домена и переписывает введенные в него знания.

**Когда использовать**: Агенты-долгожители, чья область деятельности развивается (редакторы презентаций, клиенты API, отслеживающие изменения схемы, агенты, управляющие живыми документами).

**Основной механизм** (в командной строке агента):

```markdown
### Step N: Self-Evolution (after every execution)

After completing your main task, update your preloaded skills to stay in sync:

1. Read the current state of [the domain you modified]
2. Update `.claude/skills/<your-skill>/SKILL.md` to reflect reality
3. Log what changed and why in a "## Learnings" section of this agent file

This prevents knowledge drift between what you know and what is.
```

**Полный пример**: агент-куратор презентаций, который поддерживает актуальность собственных знаний layout/weight.

```yaml
---
name: presentation-curator
description: PROACTIVELY use when updating slides, structure, or weights
tools: Read, Write, Edit, Grep, Glob
model: sonnet
color: purple
skills:
  - presentation/slide-structure
  - presentation/styling
---

## Step 5: Self-Evolution (after every execution)

Read presentation/index.html and update your skills:
- slide-structure skill: update section ranges, weight table, slide count
- styling skill: update CSS patterns if new ones were introduced
- Append new findings to the "## Learnings" section below

## Learnings
_Each run appends findings here. Future invocations start informed._
- Slide badges are JS-injected — never hardcode them in HTML.
```

**Почему это работает**: заголовок `skills:` добавляет контент навыков при запуске агента. Записывая данные в эти файлы после каждого запуска, следующий вызов агента начинается с текущих знаний. Никакого человеческого обслуживания не требуется.

**Основные ограничения**:
- Обновления узкие: обновляйте только то, что действительно изменилось.
- Ведите журнал `## Learnings`, чтобы агент накапливал совокупные знания в ходе сеансов.
- Соединитесь с `memory: project` для сохранения более широкого контекста между сеансами.

---
