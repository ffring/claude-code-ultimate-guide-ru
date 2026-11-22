---
name: ast-grep-patterns
description: "Навыки обучения Claude, когда и как использовать ast-grep для поиска в структурном коде."
effort: low
---

# шаблоны ast-grep для Claude Code

> **Skill**: научите Claude, когда и как использовать ast-grep для поиска в структурном коде.

## Установка

```bash
# Install ast-grep skill
npx skills add ast-grep/agent-skill

# Or via plugin marketplace
/plugin marketplace add
```

## Когда предлагать as-grep

Предложите пользователю as-grep, если:

| Сценарий | Сигнальные слова | Почему аст-греп? |
|----------|--------------|---------------|
| **Крупный рефакторинг** | «переименовать все вызовы в...», «изменить подпись API», «>50 тыс. строк» | Необходима структурная точность |
| **Миграция платформы** | «React 17→18», «Vue 2→3», «зависимости обновления» | Преобразования с поддержкой AST |
| **Обнаружение образов** | «найти функции без...», «найти неиспользуемые...», «определить антишаблоны» | Структурные правила |
| **Анализ кодовой базы** | "какие компоненты зависят от...", "найти тесно связанные..." | Графики зависимостей |

**Не предлагать для**:
- Простой поиск строк (имена функций, импорт) → Используйте Grep
- Небольшие проекты (<10 тыс. строк) → Grep достаточно.
- Разовые поиски → Grep работает быстрее
- Семантический поиск → Используйте Serena MCP или grepai.

## <a name="decision-tree"></a>Дерево решений

```
User request analysis:
├─ "Find string/text" → Grep (native)
├─ "Find by meaning" → Serena MCP or grepai
├─ "Find by structure" → ast-grep (plugin)
└─ Mixed requirements → Start with Grep, escalate if needed
```

## Общие шаблоны

### 1. Асинхронные функции без обработки ошибок

**Случай использования**: Найдите асинхронные функции, в которых отсутствуют блоки try/catch.

```yaml
# ast-grep rule
rule:
  pattern: |
    async function $FUNC($$$PARAMS) {
      $$$BODY
    }
  not:
    has:
      pattern: try { $$$TRY } catch
```

**Когда использовать**: аудит безопасности, проверка готовности к производству.

### 2. Реагируйте на компоненты с помощью специальных хуков

**Сценарий использования**: найти все компоненты с помощью `useEffect` без очистки.

```yaml
rule:
  pattern: |
    useEffect(() => {
      $$$BODY
    })
  not:
    has:
      pattern: return () => { $$$CLEANUP }
```

**Когда использовать**: обнаружение утечек памяти, аудит лучших практик React.

### 3. Функции, превышающие порог параметра

**Случай использования**: поиск функций с >5 параметрами (запах сложности)

```yaml
rule:
  pattern: function $NAME($P1, $P2, $P3, $P4, $P5, $P6, $$$REST) { $$$BODY }
```

**Когда использовать**: улучшение качества кода, кандидаты на рефакторинг

### 4. Console.log в рабочем коде

**Случай использования**: удаление журнала отладки из рабочих файлов.

```yaml
rule:
  pattern: console.log($$$ARGS)
  inside:
    pattern: |
      class $CLASS {
        $$$METHODS
      }
```

**Когда использовать**: Очистка производства, предварительный аудит

### 5. Неиспользуемые реквизиты React

**Использовать вариант**: обнаружение переданных реквизитов, но никогда не использованных.

```yaml
rule:
  pattern: |
    function $COMP({ $PROP, $$$OTHER }) {
      $$$BODY
    }
  not:
    has:
      pattern: $PROP
      inside: $$$BODY
```

**Когда использовать**: устранение мертвого кода, оптимизация производительности

### 6. Устарело использование API.

**Случай использования**: Найдите использование старых методов API.

```yaml
rule:
  any:
    - pattern: React.Component
    - pattern: componentWillMount
    - pattern: componentWillReceiveProps
```

**Когда использовать**: миграция платформы, очистка от устаревшей версии

### 7. Шаблоны рисков SQL-инъекций

**Сценарий использования**: Найдите потенциальные уязвимости, связанные с внедрением SQL-кода.

```yaml
rule:
  pattern: |
    db.query($TEMPLATE_LITERAL)
  where:
    $TEMPLATE_LITERAL:
      kind: template_string
```

**Когда использовать**: аудит безопасности, сканирование уязвимостей.

### 8. Отсутствуют возвращаемые типы TypeScript.

**Использовать вариант**: принудительно указывать явные типы возвращаемых значений.

```yaml
rule:
  pattern: |
    function $NAME($$$PARAMS) {
      $$$BODY
    }
  not:
    has:
      pattern: ': $TYPE'
```

**Когда использовать**: лучшие практики TypeScript, улучшения безопасности типов

### 9. Большие операторы переключения (кандидаты на рефакторинг)

**Использовать case**: найти операторы переключения с >10 вариантами.

```yaml
rule:
  pattern: |
    switch ($EXPR) {
      $C1: $$$B1
      $C2: $$$B2
      $C3: $$$B3
      $C4: $$$B4
      $C5: $$$B5
      $C6: $$$B6
      $C7: $$$B7
      $C8: $$$B8
      $C9: $$$B9
      $C10: $$$B10
      $C11: $$$B11
    }
```

**Когда использовать**: снижение сложности, рефакторинг полиморфизма.

### 10. Пустые блоки catch (проглоченные ошибки)

**Использовать вариант**: найти обработку ошибок, которые автоматически завершаются неудачно.

```yaml
rule:
  pattern: |
    try {
      $$$TRY
    } catch ($ERR) {
      // empty or only comment
    }
```

**Когда использовать**: отладка загадочных сбоев, аудит обработки ошибок.

## Сложность установки и ценность

| Размер кодовой базы | Установка того стоит? | Альтернатива |
|---------------|-----------------|-------------|
| <10 тыс. строк | ❌ Нет | Используйте Греп |
| 10-50 тысяч строк | ⚠️ Возможно | Начните с Grep, при необходимости увеличьте масштаб |
| 50-200 тысяч строк | ✅ Да | ast-grep для структурных, Grep для текста |
| >200 тыс. строк | ✅ Определенно | комбинация ast-grep + Серена MCP |

## <a name="troubleshooting"></a>Поиск неисправностей

### ast-grep не найден

```bash
# Verify installation
npx ast-grep --version

# Reinstall skill
npx skills add ast-grep/agent-skill --force
```

### Claude Не используется ast-grep

**Проблема**: Claude использует Grep вместо ast-grep

**Решение**: Будьте откровенны в своем запросе.
- ❌ «Найти асинхронные функции»
- ✅ «Используйте ast-grep для поиска асинхронных функций»

### Проблемы с производительностью

**Проблема**: ast-grep работает медленно на большой базе кода

**Solutions**:
1. Узкая область поиска: `ast-grep --path src/components/`
2. Используйте фильтры файлов: `ast-grep --lang tsx`
3. Кэшируйте результаты для итеративного уточнения

### Шаблон не соответствует

**Проблема**: шаблон ast-grep не соответствует ожидаемому коду

**Шаги отладки**:
1. Изолированная тестовая таблица: `ast-grep -p 'your-pattern' file.js`
2. Проверьте структуру AST: `ast-grep --debug-query`
3. Упрощайте шаблон постепенно
4. Проверьте синтаксис языка (JS, TS или JSX)

## Примеры интеграции

### Рабочий процесс: перехватчик предварительной фиксации с помощью ast-grep

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Check for console.log in staged files
if ast-grep -p 'console.log($$$)' $(git diff --cached --name-only); then
  echo "❌ Found console.log statements"
  exit 1
fi
```

### Рабочий процесс: сценарий миграции

```bash
#!/bin/bash
# Migrate React class components to hooks

# Find all class components
ast-grep -p 'class $C extends React.Component' --json > components.json

# Process each component
jq -r '.[] | .file' components.json | while read file; do
  echo "Migrating: $file"
  # ... transformation logic
done
```

### Рабочий процесс: аудит безопасности

```bash
#!/bin/bash
# security-audit.sh

echo "=== Security Audit ==="

# SQL injection risks
ast-grep -p 'db.query(`${$VAR}`)' --lang ts

# XSS risks
ast-grep -p 'innerHTML = $VAR' --lang js

# Hardcoded secrets
ast-grep -p 'password: "$PASSWORD"' --lang ts
```

## Шаблоны подсказок Claude

### Шаблон 1: Большой рефакторинг

```
I need to refactor [FEATURE] across our codebase (~[SIZE] lines).

Use ast-grep to:
1. Find all instances of [OLD_PATTERN]
2. Identify which files will be affected
3. Suggest transformation strategy
4. Create a phased migration plan

Start with analysis only, wait for my approval before making changes.
```

### Шаблон 2: Миграция платформы

```
We're migrating from [OLD_FRAMEWORK v1] to [NEW_FRAMEWORK v2].

Use ast-grep to:
1. Find all deprecated API usage
2. Map to new API equivalents
3. Estimate migration effort (files affected)
4. Identify high-risk changes

Provide a dependency graph showing migration order.
```

### Шаблон 3. Аудит качества кода

```
Run a code quality audit on [DIRECTORY] using ast-grep.

Focus on:
- Functions with >5 parameters
- Async functions without error handling
- Empty catch blocks
- Unused function parameters

Rank issues by severity and provide refactoring suggestions.
```

## Дополнительно: объединение ast-grep с другими инструментами.

### ast-grep + Серена MCP

```bash
# 1. ast-grep finds structural patterns
ast-grep -p 'async function $F' --json > async-funcs.json

# 2. Serena finds symbols and dependencies
claude mcp call serena find_symbol --name "authenticate"

# 3. Combine insights for full context
# ast-grep: "This is an async function"
# Serena: "Called by 12 other functions"
```

### ast-grep + грепай

```bash
# 1. grepai for semantic search
# "Find authentication-related code"

# 2. ast-grep for structural refinement
# "Among those results, which are async without error handling?"
```

## Лучшие практики

1. **Start Simple**: начните с Grep, при необходимости переходите к ast-grep.
2. **Тестовые шаблоны**: проверка небольших файлов перед запуском всей базы кода.
3. **Шаблоны документов**: сохранение успешных шаблонов в качестве повторно используемых правил.
4. **Explicit Requests**: Всегда явно сообщайте Claude, когда использовать ast-grep.
5. **Объединение инструментов**: используйте ast-grep для структуры, Grep для текста, Serena для символов

## <a name="resources"></a>Ресурсы

- [ast-grep Документация](https://ast-grep.github.io/)
- [Площадка с узорами](https://ast-grep.github.io/playground.html)
- [ast-grep GitHub](https://github.com/ast-grep/ast-grep)
- [Claude Навык](https://github.com/ast-grep/claude-skill)

---

**Последнее обновление**: январь 2026 г.
**Совместимость с**: Claude Code 2.1.7+
