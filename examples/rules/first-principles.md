---
description: "Инвариантный шаблон сеанса — жесткие ограничения, пороги качества и антишаблоны, которые Claude должен соблюдать на протяжении всего сеанса."
---

# Первые принципы: инварианты сеанса

Это шаблон для слоя «Контракт» ваших правил Claude Code. Это ограничения, которые должны соблюдаться в течение всего сеанса, независимо от того, какая задача активна или сколько контекста накопилось.

Настройте разделы ниже в соответствии со стандартами вашей команды. Замените значения примера собственными пороговыми значениями.

> **Почему это важно**: По мере расширения контекста разговора предыдущие инструкции теряют влияние на поведение Claude. Это называется «распад контекста». Инварианты сеанса, помещенные в CLAUDE.md или файлы правил, действуют как якоря сжатия, которые противостоят этому распаду, поскольку они вводятся в начало каждого контекстного окна.

## Жесткие ограничения

Эти правила никогда не имеют исключений. Если Claude собирается нарушить один из них, он должен остановиться и отметить конфликт, а не продолжать его.

```markdown
# Hard Constraints (never-break rules)

## Data Safety
- Never delete production data without explicit user confirmation in the same message
- Never store secrets (API keys, passwords, tokens) in code files or commit them
- Never run DROP, TRUNCATE, or DELETE without WHERE on production databases

## Code Safety
- Never disable TypeScript strict mode or ESLint rules to make code compile
- Never catch errors silently (empty catch blocks, swallowed promises)
- Never use `any` type in TypeScript except in test fixtures

## Process Safety
- Never force-push to main/master
- Never skip pre-commit hooks (no --no-verify)
- Never amend a commit that has been pushed to a shared branch

## Scope Safety
- Never modify files outside the directories specified in the current task
- Never add dependencies without stating the reason and checking bundle size impact
- Never refactor code that isn't part of the current task (note it for later instead)
```

## Пороги качества

Пороги превосходят расплывчатые прилагательные. «Хорошее освещение» для разных людей означает разные вещи; «80% покрытие линии» однозначно. Определите свои цифры здесь.

```markdown
# Quality Thresholds

## Testing
- Minimum test coverage: 80% line coverage for new code
- Every public function must have at least one test
- Every bug fix must include a regression test
- Integration tests required for any endpoint that touches the database

## Performance
- API response time: p95 < 200ms for read endpoints, < 500ms for writes
- Bundle size: Total JS < 250KB gzipped (check with `npx bundlesize`)
- No N+1 queries (use DataLoader or equivalent for batch fetching)
- Database queries: no query > 100ms in development (enable slow query log)

## Code Quality
- Cyclomatic complexity: no function > 15 (enforce via ESLint rule)
- File length: no file > 400 lines (split when approaching limit)
- Function length: no function > 50 lines
- Nesting depth: no code > 4 levels of indentation

## Dependencies
- No dependency with known critical CVE
- No dependency abandoned > 2 years (check last publish date)
- Maximum 3 direct dependencies per feature module
```

## Инварианты рабочего процесса

Ограничения процесса, обеспечивающие согласованность во всем сеансе, особенно при переключении между задачами или при участии субагентов.

```markdown
# Workflow Invariants

## Commit Discipline
- Every commit must pass all existing tests before being created
- Commit messages follow Conventional Commits format (feat:, fix:, docs:, etc.)
- One logical change per commit (don't mix refactor with feature)

## Review Before Action
- Read a file before modifying it (no blind edits)
- Run tests after every significant change (not just at the end)
- Verify imports after adding/removing dependencies

## Communication
- When uncertain between two approaches, present both with trade-offs (don't pick silently)
- When a task will take more than 5 tool calls, outline the plan first
- When hitting an unexpected error, diagnose before retrying
```

## Антипаттерны для обнаружения

Шаблоны Claude должны помечаться, когда они встречаются в базе кода или в собственных выходных данных. Они работают как правила автоматической проверки кода, но касаются поведения ИИ во время сеанса.

```markdown
# Anti-Patterns to Detect

## Code Smells to Flag
- God objects: classes with >10 public methods or >5 injected dependencies
- Feature envy: a function that references another module's internals more than its own
- Primitive obsession: passing >3 related primitives instead of a typed object
- Temporal coupling: functions that must be called in a specific order without enforcement

## Process Smells to Flag
- Yak shaving: spending >3 tool calls on something tangential to the task
- Gold plating: adding features, abstractions, or error handling not requested
- Shotgun surgery: a single change requiring edits in >5 files (suggests missing abstraction)
- Copy-paste programming: duplicating >5 lines instead of extracting a function

## AI-Specific Anti-Patterns
- Hallucinated APIs: calling a method that doesn't exist in the current version
- Stale context: referencing file contents from earlier in the conversation that may have changed
- Over-apology: spending tokens on apologies instead of fixing the issue
- Premature optimization: adding caching, lazy loading, or memoization without evidence of a perf problem
```

## Смягчение разрушения контекста

Три практические стратегии, позволяющие сохранить эффективность этих инвариантов во время длительных сеансов:

1. **Place в CLAUDE.md**: правила в CLAUDE.md вводятся в начало каждого контекстного окна, выдерживая автоматическое сжатие. Это самая сильная позиция для инвариантов.

2. **Использовать файлы правил для ограничений, специфичных для домена.**: поместите пороги тестирования в `.claude/rules/testing.md`, правила безопасности в `.claude/rules/security.md`. Они загружаются с помощью CLAUDE.md, но сохраняют фокус на каждом файле.

3. **LEARNINGS.md шаблон перехвата**: настройте перехватчик, который вводит накопленные знания сеанса в субагенты, чтобы ограничения, обнаруженные в середине сеанса, распространялись на делегированную работу:

```json
// .claude/settings.json (hooks section)
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Task",
      "command": "cat .claude/LEARNINGS.md 2>/dev/null || true"
    }]
  }
}
```

Это гарантирует, что когда Claude создает субагентов с помощью инструмента Task, они получают одинаковые знания и ограничения для конкретного сеанса.

---

**Sources**:
- Трехслойная контекстная модель (Контракт/Рабочий набор/Шум): codeaholicguy.com (февраль 2026 г.)
- CLAUDE.md как «якоря сжатия контекста»: Крейг Джонстон (imti.co)
- Шаблон «Пороги, а не вибрации»: конкретные цифры вместо расплывчатых прилагательных.
- Шаблон перехвата LEARNINGS.md: практика сообщества по передаче контекста субагентам.
