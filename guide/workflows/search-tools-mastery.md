---
title: "Владение инструментами поиска: сочетание rg, grepai, Serena, ast-grep, scip-search и lilmd."
description: "Мастер-поиск кода и навигация по документации за счет сочетания правильных инструментов для максимальной эффективности."
tags: [workflow, search, guide, mcp]
---

# Владение инструментами поиска: сочетание rg, grepai, Serena, ast-grep, scip-search и lilmd.

> **Основной поиск кода и навигация по документации за счет сочетания правильных инструментов для максимальной эффективности**

**Автор**: Florian BRUNIAUX | Вклад от Claude (Anthropic)
**Время чтения**: ~25 минут
**Последнее обновление**: май 2026 г.

---

## Оглавление

1. [Краткая справочная матрица](#quick-reference-matrix)
2. [Сравнение инструментов](#tool-comparison)
3. [Дерево решений](#decision-tree)
4. [Комбинированные рабочие процессы](#combined-workflows)
5. [Реальные сценарии](#real-world-scenarios)
6. [Оптимизация производительности](#performance-optimization)
7. [Распространенные ошибки](#common-pitfalls)
8. [Расширенный набор инструментов: scip-search и lilmd](#extended-toolkit-scip-search--lilmd)

---

## <a name="quick-reference-matrix"></a>Краткая справочная матрица

| Мне нужно... | Используйте этот инструмент | Пример команды |
|--------------|---------------|-----------------|
| Найти точный текст | `rg` (инструмент Grep) | `rg "authenticate" --type ts` |
| Найти по смыслу | `grepai` | `grepai search "user login flow"` |
| Найти определение функции | `Serena` | `serena find_symbol --name "login"` |
| Найти структурный образец | `ast-grep` | `ast-grep "async function $F"` |
| Посмотрите, кто вызывает функцию | `grepai` | `grepai trace callers "login"` |
| Получить файловую структуру | `Serena` | `serena get_symbols_overview` |
| Рефакторинг файлов | `Serena + ast-grep` | Комбинированный рабочий процесс |
| Исследуйте неизвестную кодовую базу | `grepai → Serena` | Шаблон обнаружения |
| Найти ссылки на символы без MCP (безопасно для рабочего дерева) | `scip-search` | `scip-search refs AuthService.login` |
| Навигация по большому документу Markdown | `lilmd` | `lilmd read docs/arch.md "Authentication"` |

---

## <a name="tool-comparison"></a>Сравнение инструментов

### Полная матрица функций

| Особенность | рг (рипгреп) | грепай | Серена | ast-grep |
|---------|--------------|--------|--------|----------|
| **Тип поиска** | Regex/text | Семантический (значение) | Symbol-aware | Структура АСТ |
| **Технологии** | Сопоставление с образцом | Вложения (Оллама) | Разбор символов | Абстрактное синтаксическое дерево |
| **Скорость** | ⚡ ~20 мс | 🐢 ~500 мс | ⚡ ~100 мс | 🕐 ~200 мс |
| **Настройка** | ✅ Нет (встроенный) | ⚠️ Оллама + установка | ⚠️ Конфигурация MCP | ⚠️ установка npm |
| **Интеграция** | ✅ Родной (`Grep`) | ⚠️ Сервер MCP | ⚠️ Сервер MCP | ⚠️ Плагин |
| **Конфиденциальность** | ✅ 100% местное | ✅ 100% местное | ✅ 100% местное | ✅ 100% местное |
| **Необходим контекст** | Никто | Никто | Индексация проекта | Никто |
| **Языки** | Все (текст) | Все | TS/JS/Py/Rust/Go | TS/JS/Py/Rust/Go/C++ |
| **График вызовов** | ❌ Нет | ✅ Да | ❌ Нет | ❌ Нет |
| **Отслеживание символов** | ❌ Нет | ❌ Нет | ✅ Да | ❌ Нет |
| **Сессионная память** | ❌ Нет | ❌ Нет | ✅ Да | ❌ Нет |
| **Ложные срабатывания** | Середина | Низкий | Очень низкий | Очень низкий |
| **Кривая обучения** | Низкий | Середина | Низкий | Высокий |

### Сравнение стоимости токенов

| Инструмент | Типичный запрос | Токены израсходованы | Результаты возвращены |
|------|---------------|-----------------|------------------|
| **rg** | "аутентифицировать" | ~500 | Только точные совпадения |
| **grepai** | "поток аутентификации" | ~2000 | Совпадения на основе намерений |
| **Серена** | find_symbol | ~1000 | Символ + контекст |
| **ast-grep** | Шаблон AST | ~1500 | Структурные совпадения |

**Ключевая идея**: rg в 4 раза более эффективен, но в 10 раз менее интеллектуален, чем семантические инструменты.

### Расширенный справочник инструментов

Два инструмента, устраняющие пробелы в базовом стеке, подробно рассмотрены в [§ Extended Toolkit](#extended-toolkit-scip-search--lilmd):

| Инструмент | Категория | против существующего стека |
|------|----------|-------------------|
| **scip-search** | Поиск по индексу символов (SCIP) | Как Серена, но без гражданства, без MCP, безопасно для рабочего дерева. |
| **lilmd** | Навигация по разделу Markdown | Нет эквивалента в стеке (целевые документы, а не код) |

---

## <a name="decision-tree"></a>Дерево решений

### Уровень 1: Что вы знаете?

```
Do you know the EXACT text/pattern?
│
├─ YES → Use rg (ripgrep)
│  ├─ Known function name: rg "createSession"
│  ├─ Known import: rg "import.*React"
│  └─ Known pattern: rg "async function"
│
└─ NO → Go to Level 2
```

### Уровень 2: Что вы ищете?

```
What's your search intent?
│
├─ "Find by MEANING/CONCEPT"
│  → Use grepai
│  └─ Example: grepai search "payment validation logic"
│
├─ "Find FUNCTION/CLASS definition"
│  → Use Serena
│  └─ Example: serena find_symbol --name "UserController"
│
├─ "Find by CODE STRUCTURE"
│  → Use ast-grep
│  └─ Example: async without error handling
│
└─ "Understand DEPENDENCIES"
   → Use grepai trace
   └─ Example: grepai trace callers "validatePayment"
```

### Уровень 2 (рабочее дерево / нет MCP)

При работе в среде CI, рабочем дереве git или любом контексте, где серверы MCP недоступны:

```
Known symbol name, no MCP available?
│
└─ Use scip-search (pre-built SCIP index, millisecond cold start)
   └─ scip-search refs "AuthService.login" --format json
```

### Уровень 3: Оптимизация

```
Found too many results?
│
├─ rg → Add --type filter or narrow path
├─ grepai → Add --path filter or use trace
├─ Serena → Filter by symbol type (function/class)
└─ ast-grep → Add constraints to pattern
```

---

## <a name="combined-workflows"></a>Комбинированные рабочие процессы

### Рабочий процесс 1. Исследование неизвестной базы кода.

**Goal**: Быстрое понимание нового проекта.

**Step-by-step**:

```bash
# 1. SEMANTIC DISCOVERY (grepai)
# Find files related to authentication
grepai search "user authentication and session management"
# → Output: auth.service.ts, session.middleware.ts, user.controller.ts

# 2. STRUCTURAL OVERVIEW (Serena)
# Understand each file's structure
serena get_symbols_overview --file auth.service.ts
# → Output:
#   - class AuthService
#     - login(email, password)
#     - logout(sessionId)
#     - validateSession(token)

# 3. DEPENDENCY MAPPING (grepai trace)
# See how login is used
grepai trace callers "login"
# → Output: Called by UserController, ApiGateway, AdminPanel

# 4. EXACT SEARCH (rg)
# Find specific implementation details
rg "validateSession" --type ts -A 5
# → Output: Full function with 5 lines of context
```

**Result**: Полное понимание 4 команд (против 30+ операций чтения файлов)

---

### Рабочий процесс 2: Масштабный рефакторинг

**Цель**: переименовать `createSession` → `initializeUserSession` в более чем 50 файлах.

**Step-by-step**:

```bash
# 1. IMPACT ANALYSIS (grepai trace)
# Understand full scope
grepai trace callers "createSession"
# → Output: 47 callers across 23 files
grepai trace callees "createSession"
# → Output: Calls validateUser, createToken, storeSession

# 2. STRUCTURAL VALIDATION (ast-grep)
# Ensure consistent usage pattern
ast-grep "createSession($$$ARGS)"
# → Output: All invocations with their argument patterns

# 3. SYMBOL-AWARE REFACTORING (Serena)
# Precise renaming
serena find_symbol --name "createSession" --include-body true
# → Get exact definition + all references

serena replace_symbol_body \
  --name "createSession" \
  --new-name "initializeUserSession"
# → Rename across all files maintaining structure

# 4. VERIFICATION (rg)
# Confirm no old references remain
rg "createSession" --type ts
# → Should return 0 results
```

**Result**: безопасный рефакторинг с полным пониманием зависимостей.

---

### Рабочий процесс 3: Аудит безопасности

**Goal**: найти уязвимости безопасности.

**Step-by-step**:

```bash
# 1. SEMANTIC DISCOVERY (grepai)
# Find security-sensitive code
grepai search "SQL query construction"
grepai search "user input validation"
grepai search "password handling"

# 2. STRUCTURAL PATTERNS (ast-grep)
# Find specific vulnerability patterns

# SQL injection risks
ast-grep 'db.query(`${$VAR}`)'

# XSS risks
ast-grep 'innerHTML = $VAR'

# Missing error handling
ast-grep -p 'async function $F($$$) { $$$BODY }' \
  --without 'try { $$$TRY } catch'

# 3. DEPENDENCY TRACING (grepai)
# See where vulnerable code is called
grepai trace callers "executeQuery"
# → Identify all entry points

# 4. EXACT VERIFICATION (rg)
# Confirm findings
rg "innerHTML\s*=" --type ts
rg "password" --type ts | rg -v "hashed"
```

**Result**: Комплексный аудит безопасности за считанные минуты.

---

## Реальные тесты

### grepai против grep (янвьер, 2026 г.)

**Contexte**: Тест на Excalidraw (155 тыс. строк TypeScript)
**Auteur**: YoanDev (обслуживающий грепай - потенциал смещения)
**Méthodologie**: 5 вопросов по расшифровке идентификационного кода

| Метрика | grep | грепай | Разница |
|----------|------|--------|------------|
| Вызовы инструментов | 139 | 62 | **-55%** |
| Входные токены | 51k | 1.3k | **-97%** |

**À сохраняется**: Исследование семантики резко сокращает токены и идентифицирует соответствующие фичи для предварительной предварительной, исключающей итеративные исследования.

**Limitations**:
- Контрольный показатель по обслуживанию бытовой техники
- Проверка одного проекта (только TypeScript)
- Независимая проверка в настоящее время

**Источник**: [yoandev.co/grepai-benchmark](https://yoandev.co/grepai-benchmark)

> **Примечание**: Это эталонный показатель, отражающий состояние января 2026 года. Claude Code и грепай.

---

### Рабочий процесс 4: миграция платформы

**Goal**: Миграция компонентов класса React → перехватчики

**Step-by-step**:

```bash
# 1. INVENTORY (ast-grep)
# Find all class components
ast-grep 'class $C extends React.Component'
# → Output: 34 components to migrate

# 2. DEPENDENCY ANALYSIS (grepai)
# Understand component relationships
for component in $(ast-grep 'class $C extends' --json | jq -r '.[].name'); do
  grepai trace callers "$component"
done
# → Build migration order (leaf components first)

# 3. PATTERN DETECTION (ast-grep)
# Identify lifecycle methods used
ast-grep 'componentDidMount() { $$$BODY }'
ast-grep 'componentWillReceiveProps($$$) { $$$BODY }'
# → Map to equivalent hooks

# 4. INCREMENTAL MIGRATION (Serena + ast-grep)
# Migrate one component at a time
serena find_symbol --name "UserProfile" --include-body true
# → Get full component code

# Use ast-grep to transform
ast-grep --rewrite \
  --from 'class $C extends React.Component' \
  --to 'const $C = () => { }'

# 5. VERIFICATION (rg + grepai)
# Ensure migration successful
rg "React.Component" --type tsx  # Should decrease
grepai search "component lifecycle methods"  # Find any missed
```

**Result**: Систематическая миграция с минимальными поломками

---

### Рабочий процесс 5: оптимизация производительности

**Goal**: выявление и устранение узких мест производительности.

**Step-by-step**:

```bash
# 1. HOTSPOT DISCOVERY (grepai)
# Find performance-critical code
grepai search "heavy computation or loops"
grepai search "database queries in loops"

# 2. PATTERN DETECTION (ast-grep)
# Find N+1 query patterns
ast-grep 'for ($$$) { await db.query($$$) }'

# Find missing memoization
ast-grep 'useMemo' --invert-match \
  --in 'const $VAR = $$$'

# 3. CALL GRAPH ANALYSIS (grepai trace)
# Find hot paths
grepai trace graph "renderUserList" --depth 3
# → Visualize dependency tree

# 4. SYMBOL TRACKING (Serena)
# Track function changes
serena write_memory "perf_baseline" \
  "renderUserList: 450ms avg"

# After optimization
serena write_memory "perf_optimized" \
  "renderUserList: 45ms avg (10x improvement)"

# 5. VERIFICATION (rg)
# Confirm optimizations applied
rg "useMemo|useCallback" --type tsx
```

**Result**: Улучшение производительности на основе данных

---

## <a name="real-world-scenarios"></a>Реальные сценарии

### Сценарий 1: «Я не знаю, что ищу»

**Проблема**: Новый проект, нет документации, необходимо добавить функцию.

**Solution**: семантическое открытие

```bash
# Start broad with meaning
grepai search "user profile management"
# → Discover relevant files

# Then narrow with structure
serena get_symbols_overview --file user-profile.service.ts
# → Understand available functions

# Finally, exact search for details
rg "updateProfile" --type ts -C 3
```

---

### Сценарий 2: «Эта функция вызывается отовсюду»

**Проблема**: необходимо изменить функцию, но вы беспокоитесь о том, что что-то сломается.

**Solution**: сначала сопоставление зависимостей

```bash
# 1. See all callers
grepai trace callers "calculateTotal"
# → 47 callers found

# 2. Analyze caller contexts
for file in $(grepai trace callers "calculateTotal" --json | jq -r '.[].file'); do
  serena get_symbols_overview --file "$file"
done

# 3. Identify safe vs risky call sites
ast-grep 'calculateTotal($ARGS)' --json
# → Group by argument patterns

# 4. Make change with confidence
# Now you know all impact points
```

---

### Сценарий 3: «Найти весь код, выполняющий X»

**Проблема**: необходимо применять согласованный шаблон во всей базе кода.

**Решение**: объединить семантическое и структурное

```bash
# Example: Find all error handling code

# 1. Semantic discovery
grepai search "error handling and exception management"

# 2. Structural patterns
ast-grep 'try { $$$TRY } catch ($ERR) { $$$CATCH }'
ast-grep 'throw new Error($MSG)'

# 3. Verify consistency
rg "catch\s*\(" --type ts | wc -l
# Compare with ast-grep count to find anomalies
```

---

### Сценарий 4: «Мне нужно понять этот модуль»

**Проблема**: Сложный модуль с неясными обязанностями.

**Решение**: Многоинструментальный анализ

```bash
# 1. Get symbol overview (Serena)
serena get_symbols_overview --file payment.module.ts
# → See all exports, classes, functions

# 2. Understand dependencies (grepai)
grepai trace callees "PaymentModule"
# → What does this module use?

grepai trace callers "PaymentModule"
# → Who uses this module?

# 3. Find implementation patterns (ast-grep)
ast-grep 'export class $C' --file payment.module.ts
ast-grep 'async $METHOD($$$)' --file payment.module.ts

# 4. Read specific implementations (rg)
rg "processPayment" --type ts -A 20
```

---

## <a name="performance-optimization"></a>Оптимизация производительности

### Выбор самого быстрого инструмента

**Общие правила**:

1. **Известный точный текст** → Всегда сначала используйте rg
2. **Неизвестный точный текст** → Используйте grepai, затем rg для проверки
3. **Рефакторинг** → Серена для безопасности символов
4. **Большие миграции** → ast-grep для структурной точности

### Тесты производительности

**Test**: найти код аутентификации в кодовой базе длиной 500 тыс. строк.

| Стратегия | Время | Качество результатов |
|----------|------|-----------------|
| только rg «аутентификация» | 0.2s | 5000+ ложных срабатываний |
| grepai только "аутентификация" | 2.5s | 50 релевантных результатов |
| грепай → rg (комбинированный) | 2.7s | 50 актуальных, проверенных |
| Только символы Серены | 1.5s | 12 функций авторизации |
| шаблоны ast-grep | 3.0s | 8 потоков аутентификации |

**Winner**: символы Серены (самые быстрые + качественные) для известных названий функций.

### Стратегия распараллеливания

**Для больших кодовых баз (>100 тыс. строк)**:

```bash
# Run searches in parallel

# Terminal 1: Semantic discovery
grepai search "authentication flow" > /tmp/grepai-results.json &

# Terminal 2: Symbol indexing
serena get_symbols_overview --file src/**/*.ts > /tmp/symbols.json &

# Terminal 3: Pattern detection
ast-grep 'async function $F' --json > /tmp/ast-results.json &

# Wait for all, then combine results
wait
jq -s '.[0] + .[1] + .[2]' \
  /tmp/grepai-results.json \
  /tmp/symbols.json \
  /tmp/ast-results.json
```

---

## <a name="common-pitfalls"></a>Распространенные ловушки

### Ошибка 1. Использование семантического поиска точных совпадений.

❌ **Неверно**:
```bash
grepai search "createSession"  # Slow, overkill
```

✅ **Right**:
```bash
rg "createSession" --type ts  # Fast, precise
```

**Rule**: Если вы знаете точный текст, никогда не используйте семантический поиск.

---

### Ошибка 2. Использование rg для концептуального поиска.

❌ **Неверно**:
```bash
rg "auth.*login.*session" --type ts  # Misses variations
```

✅ **Right**:
```bash
grepai search "authentication and session management"
```

**Rule**: Regex не понимает значения, используйте семантические инструменты.

---

### Ошибка 3: игнорирование графа вызовов перед рефакторингом

❌ **Неверно**:
```bash
# Directly refactor without checking callers
rg "oldFunction" --type ts | sed 's/oldFunction/newFunction/g'
```

✅ **Right**:
```bash
# Check impact first
grepai trace callers "oldFunction"
# See 47 callers across 23 files
# Then plan refactoring strategy
```

**Rule**: всегда отслеживайте зависимости перед изменением общего кода.

---

### Ошибка 4: Не комбинировать инструменты

❌ **Неверно**:
```bash
# Use only one tool for complex task
ast-grep 'async function $F' --json | jq '.[].file' | xargs -I {} vim {}
# Blindly edit without understanding context
```

✅ **Right**:
```bash
# Combine for full understanding
ast-grep 'async function $F' --json > /tmp/async.json
for file in $(jq -r '.[].file' /tmp/async.json); do
  serena get_symbols_overview --file "$file"  # Context
  grepai trace callers "$(jq -r '.[].name' /tmp/async.json)"  # Usage
done
```

**Rule**: Сложные задачи требуют нескольких точек зрения.

---

### Ошибка 5: переусложнение простого поиска

❌ **Неверно**:
```bash
# Setup grepai + Ollama just to find a TODO comment
grepai search "TODO comments in the code"
```

✅ **Right**:
```bash
rg "TODO" --type ts
```

**Rule**: используйте самый простой инструмент, который работает.

---

## Памятка по выбору инструмента

### Матрица быстрого принятия решений

| Ваша ситуация | Используйте это | Не это |
|----------------|----------|----------|
| «Найти функцию `login`» | рг "логин" | grepai поиск "логин" |
| «Найти код для входа» | grepai "поток входа" | рг "логин.*" |
| «Безопасное переименование функции» | Серена find_symbol | рг + СЭД |
| «Кто вызывает эту функцию?» | трассировка вызывающих абонентов grepai | рг + греп |
| «Получить файловую структуру» | Обзор Серены | rg "класс\|функция" |
| «Найти асинхронность без try/catch» | ast-grep | рг "async.*{" |
| «Миграция классов React» | ast-grep | рг + инструкция |
| «Найти TODO» | рг "ТОДО" | Любой другой инструмент |

---

## <a name="extended-toolkit-scip-search--lilmd"></a>Расширенный набор инструментов: scip-search и lilmd

Два инструмента CLI, устраняющие пробелы в стеке rg/grepai/Serena.

### scip-search

scip-search запрашивает предварительно созданные индексы символов SCIP (Sourcegraph Code Intelligence Protocol). Если grepai выполняет поиск по семантическому значению, а Serena требует активного соединения MCP, scip-search работает со статическим двоичным индексом с холодным запуском в миллисекундах.

| Атрибут | Подробности |
|-----------|---------|
| **Источник** | [github.com/liza-mas/scip-search](https://github.com/liza-mas/scip-search) |
| **Установить** | `curl -fsSL https://raw.githubusercontent.com/liza-mas/scip-search/main/install.sh \| bash` |
| **Формат индекса** | SCIP (Go, TypeScript, Python, Java, Rust и другие) |
| **Вывод** | Однострочный текст, JSON или только местоположение. |

**Workflow**: scip-search заменяет 5-10 циклических обходов rg/read, типичных для обнаружения символов.

```bash
# Step 1: generate SCIP index once per language
scip-typescript index --output index.scip

# Step 2: find a symbol definition
scip-search find AuthService

# Step 3: get all references with line numbers
scip-search refs AuthService.login --format json

# Step 4: read only the returned line ranges
```

**vs Serena**: Серена подключается к языковому серверу и имеет сессионную память. scip-search не имеет состояния и работает со снимком: нет MCP, нет постоянного процесса. Это делает его надежным в рабочих деревьях и временных средах CI, где серверная часть LSP Serena может быть недоступна.

**vs grepai**: grepai находит по семантическому намерению («логика проверки платежа»). scip-search находит по точному или почти точному идентификатору символа. Они работают последовательно: grepai находит концепцию, scip-search подтверждает символ.

**Совместимость с рабочим деревом**: индексы представляют собой файлы для каждого репозитория без общего состояния. Запуск `scip-typescript index` внутри рабочего дерева создает локальный индекс для этого рабочего дерева.

---

### лилмд

lilmd рассматривает файлы Markdown как базы данных. Он возвращает оглавление с диапазонами строк и позволяет читать целевые разделы. Агент, читающий руководство из 2000 строк, извлекает один раздел за один вызов вместо того, чтобы читать весь файл.

| Атрибут | Подробности |
|-----------|---------|
| **Источник** | [github.com/molefrog/lilmd](https://github.com/molefrog/lilmd) |
| **Установить** | `npm install -g lilmd` |
| **Runtime** | Узел или булочка |

**Клавиши**:

```bash
# TOC with line ranges (inclusive, 1-indexed)
lilmd docs/architecture.md

# Read a section by name (fuzzy match by default)
lilmd read docs/architecture.md "Authentication"

# Read a nested section
lilmd read docs/architecture.md "Security > JWT"

# Exact match (prefix with =)
lilmd read docs/architecture.md "=Authentication Flow"
```

**Значение, специфичное для агента**: выходные данные TOC содержат диапазоны строк для каждого заголовка. Агент анализирует их и запрашивает только соответствующий раздел, а не загружает весь файл. Естественный конвейер: `rg` (найти какой файл), затем `lilmd` (получить оглавление с диапазонами), затем `Read lines:N-M` (загрузить определенный раздел). Это также работает для CHANGELOG.md, больших файлов README и документов базы знаний.

**Совместимость с рабочим деревом**: без сохранения состояния, без индекса, выполняется для каждого файла. Работает где угодно.

---

## Приоритет настройки

**Рекомендуемый порядок установки**:

1. **Start**: rg (уже встроен в инструмент Grep) ✅
2. **Next**: Серена MCP (распознавание символов, память сеанса)
3. **Then**: grepai (семантический поиск + граф вызовов)
4. **Если рабочие деревья являются частью вашего рабочего процесса**: scip-search (поиск символов без сохранения состояния, MCP не требуется)
5. **Для большой документации**: lilmd (чтение целевого раздела Markdown, без настройки)
6. **Finally**: ast-grep (структурные шаблоны, крупный рефакторинг)

**Rationale**: 90% поисков работают с рг+Сереной. Добавьте grepai для семантических нужд. Добавьте scip-поиск для рабочих деревьев или сред CI, где MCP недоступен. Добавляйте ast-grep только для крупномасштабного рефакторинга.

---

## Резюме: набор инструментов из 6 инструментов

```
┌─────────────────────────────────────────────────────────┐
│                   SEARCH TOOL MASTERY                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  rg (ripgrep)     →  Fast, exact text matching         │
│  ├─ Use: 90% of searches                               │
│  └─ Speed: ~20ms                                        │
│                                                         │
│  grepai           →  Semantic + Call graph             │
│  ├─ Use: Concept discovery, dependency tracing         │
│  └─ Speed: ~500ms (finds what rg cannot)               │
│                                                         │
│  Serena           →  Symbol-aware + Session memory     │
│  ├─ Use: Refactoring, structure understanding          │
│  └─ Speed: ~100ms                                       │
│                                                         │
│  ast-grep         →  AST structural patterns           │
│  ├─ Use: Large migrations, complex patterns            │
│  └─ Speed: ~200ms                                       │
│                                                         │
│  scip-search      →  Symbol index (stateless, SCIP)   │
│  ├─ Use: CI / worktrees / no MCP environments          │
│  └─ Speed: ~5ms cold start                             │
│                                                         │
│  lilmd            →  Markdown section navigation       │
│  ├─ Use: Large docs, TOC + line ranges per section     │
│  └─ Speed: instant, no index                           │
│                                                         │
│  ═══════════════════════════════════════════════════   │
│                                                         │
│  Master the combination, not individual tools.          │
│  Each tool has a sweet spot. Use the right one.        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## <a name="further-reading"></a>Дальнейшее чтение

- [Серена MCP Руководство](#serena-semantic-code-analysis)
- [grepai Документация](#grepai-recommended-semantic-search)
- [ast-grep Навык шаблонов](../../examples/skills/ast-grep-patterns.md)
- [Архитектура: история Grep и RAG](../core/architecture.md#search-strategy-evolution)
- [scip-поиск GitHub](https://github.com/liza-mas/scip-search)
- [lilmd GitHub](https://github.com/molefrog/lilmd)

---

**Последнее обновление**: май 2026 г.
**Совместимость с**: Claude Code 2.1.7+
