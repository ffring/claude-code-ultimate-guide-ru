---
title: "Модуль 04: Агенты и специализация"
description: "Модуль 04 курса обучения: создайте специализированные агенты Claude Code с помощью AGENT.md, ограничьте их возможности и решите, когда использовать агента, а не напрямую задавать Claude. 1,5 часа, средний уровень."
---

# Модуль 04: Агенты и специализация

**Time**: 1,5 часа | **Сложность**: ⭐⭐ Средний уровень

**Предыдущий:** [Модуль 03: Память и конфигурация](03-memory.md)

## Цель

Создавайте специализированных агентов для конкретных задач. Узнайте, как сосредоточить возможности ИИ на решении целевых проблем.

---

## Что вы узнаете

- Что такое агенты и почему они полезны
- Создание пользовательских агентов с помощью AGENT.md
- Ограничение возможностей агента (песочница)
- Использование агентов для конкретных задач
- Когда использовать агентов напрямую, а не Claude

---

## Что такое агенты?

**agent** — это специализированная версия Claude Code, настроенная для одной конкретной задачи.

### Пример: агент проверки кода

Вместо того, чтобы запрашивать у Claude проверку кода (что требует мысленного переключения контекста), вы используете:

```bash
/agent code-reviewer
Review this function for bugs and performance issues
```

Агент проверки кода:
- Осуществляет только проверку кода
- Имеет инструменты для проверки
- Знает шаблоны уязвимостей безопасности
- Не отвлекается на другие задачи

### Обычный Claude против агентов

| Аспект | Обычный Claude | Агент |
|--------|---------------|-------|
| Область применения | Общее назначение | Специализированный |
| Контекст | Помнит все | Целенаправленная память задач |
| Инструменты | Все доступно | Ограниченный набор |
| Скорость | Многозадачность | Быстро в одном |
| Использовать | Исследование, обучение | Повторяющиеся, специфические задачи |

---

## Создание своего первого агента

Агенты определены в файлах `.claude/agents/AGENT.md`.

### Базовая структура

```markdown
---
name: code-reviewer
type: agent
description: Reviews code for bugs, performance, and security
auto_invoke: false
requires_approval: true
---

# Code Reviewer Agent

## Purpose
Review code for:
- Bugs and logical errors
- Performance issues
- Security vulnerabilities
- Code style consistency
- Test coverage

## Tools
- Code analysis
- Git diff viewer
- Test runner
- Linting tools

## Instructions
When reviewing:
1. Check for null pointers and edge cases
2. Look for performance bottlenecks (O(n²), nested loops)
3. Scan for security issues (SQL injection, XSS)
4. Verify tests cover the change
5. Suggest improvements without being harsh

## Example Usage
/agent code-reviewer
Review src/auth.js for security issues
```

### Местоположение файла

Поместите его в свой проект:

```
my-project/
└── .claude/
    └── agents/
        └── code-reviewer.md
```

### Делаем это доступным

В своем проекте CLAUDE.md укажите на него ссылку:

```markdown
## Available Agents
Run agents with: /agent [name]

- **code-reviewer** - Code quality and security review
  Usage: /agent code-reviewer <description>
  
- **test-writer** - Generate tests for code
  Usage: /agent test-writer <file path>
```

---

## Шаблоны проектирования агентов

Приведенные ниже шаблоны представляют собой шаблоны агентов для распространенных заданий. Информацию об архитектурных шаблонах (Наблюдатель, Посредник, Выключатель и другие, сопоставленные с механизмами Claude Code) см. в разделе Шаблоны проектирования [AI](../core/ai-design-patterns.md).

### Схема 1: Проверка качества

```markdown
---
name: quality-auditor
description: Audits code quality metrics
---

# Quality Auditor

## Purpose
Check code for:
- Test coverage (<80% = fail)
- Type safety (TypeScript strict mode)
- Code duplication
- Cyclomatic complexity

## Tools
- Code analysis
- Coverage reporter
- Type checker

## Output Format
- ✅ Passed: [metric] = X
- ⚠️ Warning: [metric] = X
- ❌ Failed: [metric] = X

## Scoring
Score /100 based on all metrics.
```

### Схема 2: Специалист по безопасности

```markdown
---
name: security-auditor
description: Scans code for vulnerabilities
requires_approval: true
---

# Security Auditor

## Purpose
Find security vulnerabilities:
- Injection attacks (SQL, NoSQL, command)
- Authentication/authorization issues
- Cryptography mistakes
- Data exposure risks
- OWASP Top 10

## Tools
- Static analysis
- Dependency checker
- Secret detection

## Severity Levels
- CRITICAL: Stop work immediately
- HIGH: Fix before merge
- MEDIUM: Fix in next sprint
- LOW: Consider fixing
```

### Схема 3: Автор документации

```markdown
---
name: doc-writer
description: Generates documentation
---

# Documentation Writer

## Purpose
Create or improve:
- README files
- API documentation
- Architecture docs
- User guides
- CHANGELOG entries

## Output Format
- Clear headings
- Code examples for each feature
- Link to related docs
- Numbered lists for sequences

## Style
- Beginner-friendly
- No jargon without explanation
- Show before/after examples
```

---

## Возможности и ограничения агента

### Возможности по умолчанию

Все агенты могут:
- Чтение файлов (с поддержкой git)
- Анализ кода
- Написание документации
- Проверьте синтаксис
- Запуск тестов

### Ограничение возможностей

Используйте `capabilities` для изолированной изоляции агента:

```markdown
---
name: code-reviewer
capabilities:
  - read_files      # Can read code
  - run_tests       # Can run test suites
  - check_syntax    # Can lint
  - write_comments  # Can suggest changes but...
  - NO: commit      # ...cannot commit
  - NO: push        # ...cannot push to git
---
```

Этот агент может просматривать, но не может случайно отправить неработающий код.

### Общие ограничения

```markdown
# Analyzer (read-only)
capabilities:
  - read_files
  - run_tests
# Can't modify anything

# Refactoring Agent (write, no push)
capabilities:
  - read_files
  - write_files
  - run_tests
  - NO: commit
  - NO: push
# Can change code but you review before pushing

# Full Agent (unrestricted)
capabilities:
  - all
# Can do anything (use with caution)
```

---

## Использование агентов в вашем рабочем процессе

### Звонок агенту

```bash
/agent code-reviewer
Review the changes I just made to src/auth.js
```

Claude переключается на агента проверки кода и отвечает.

### Связывающие агенты

Используйте агенты последовательно:

```bash
# Step 1: Test Writer generates tests
/agent test-writer
Write tests for src/utils/validators.js

# Step 2: Code Reviewer checks the tests
/agent code-reviewer
Review the tests that were just written

# Step 3: Security Auditor scans
/agent security-auditor
Check the tests and code for vulnerabilities
```

### Агент с режимом плана

Для рискованных операций используйте `/plan` внутри агента:

```bash
/agent refactoring-specialist
/plan
Refactor the payment processing module to use async/await
```

---

## <a name="exercise-create-a-test-writer-agent"></a>Упражнение. Создание агента написания тестов.

### Шаг 1. Создайте файл агента.

```bash
cat > .claude/agents/test-writer.md << 'EOF'
---
name: test-writer
description: Generates comprehensive tests
capabilities:
  - read_files
  - write_files
  - run_tests
---

# Test Writer Agent

## Purpose
Generate high-quality tests for:
- Unit tests (pure functions)
- Integration tests (component interactions)
- Edge cases and error conditions
- Performance tests

## Style
- Arrange-Act-Assert pattern
- Descriptive test names
- Each test focuses on ONE behavior
- 70%+ code coverage target

## Tools
- Test framework (Jest, pytest, etc)
- Mock libraries
- Assertion libraries

## Output
- Tests in same directory as source
- Naming: [file].test.js or [file].spec.js
- Include setup/teardown code
EOF
```

### Шаг 2: Ссылка в CLAUDE.md

```markdown
## Available Agents
- test-writer: Generate tests for any function or module
  Usage: /agent test-writer <file path>
```

### Шаг 3: Используйте это

```bash
/agent test-writer
Write tests for src/utils/formatDate.js
```

Агент будет:
1. Читать formatDate.js
2. Поймите, что он делает
3. Создавайте комплексные тесты
4. Покажу вам тестовый файл

### Шаг 4: Обзор

Перед принятием проверьте тесты:
- Охватывают ли они крайние случаи?
- Именование понятно?
- Они действительно бегают?

---

## Когда использовать агентов

### Используйте агентов, когда:

✅ Вы выполняете одну и ту же задачу неоднократно (ревью кода, тестирование, аудит безопасности)
✅ Вам нужен сфокусированный ИИ для одной работы
✅ Вы хотите ограничить возможности (безопасность)
✅ Вы строите командные рабочие процессы
✅ Задача имеет четкие критерии успеха

### Используйте обычный Claude, когда:

✅ Вы exploring/learning
✅ Задача новая
✅ Вам нужна универсальная помощь
✅ Вы отлаживаете что-то сложное
✅ Вы хотите общаться взад и вперед

---

## Лучшие практики

### ДЕЛАТЬ

✅ Дайте агентам четкие и узкие цели

✅ Формат вывода документа в определении агента

✅ Ограничьте возможности, которые вам не нужны

✅ Сначала тестируйте агентов на примерных задачах

✅ Контроль версий ваших агентов (в .claude/agents/)

### НЕ

❌ Создавайте агентов с пересекающимися целями (сбивает с толку).

❌ Сделать агентов слишком общими (противоречит цели)

❌ Полностью доверяйте агенту (всегда проверяйте)

❌ Создайте агента для разовой задачи (просто используйте Claude)

---

## Проверка: вы готовы, если...

✓ Вы создали хотя бы один собственный агент.

✓ Вы понимаете цель агентов против Claude

✓ Вы можете ограничить возможности агента

✓ Вы знаете, как позвонить агенту (имя /agent)

✓ Вы протестировали свой агент на реальной задаче

---

## Что дальше?

**Модуль 05: Навыки и автоматизация** охватывает:
- Создание повторно используемых навыков (модулей знаний)
- Возможности объединения для распространения
- Автовызов навыков
- Создание собственной базы знаний

Это научит вас, как упаковывать знания так, чтобы Claude запоминал их во время сеансов.

---

**Завершен модуль 04?** → Готов к [Модуль 05: Навыки и автоматизация](05-skills.md)
