---
name: smart-explore
description: "Прогрессивное исследование кода с использованием древовидного AST — сначала структура, потом детализация. Уменьшает чтение кода с 10-15 тысяч токенов на файл до 200-500 токенов."
effort: low
---

# Smart explore: прогрессивное исследование кода

> **Skill**: прочитать структуру кода перед чтением кода. Сначала покажите сигнатуры и типы функций Claude, а затем позволяйте ему детализировать конкретные функции только при необходимости.

**Вдохновлен**: Алекс Ньюман (Claude-MEM) + шаблон карты репозитория Aider (подтверждено более чем 40 тысячами звезд)

## <a name="the-problem"></a>Проблема

Когда Claude читает файлы, чтобы понять кодовую базу, он читает всё:

```
# What actually happens
Read src/auth.rs    → 400 lines → ~2,800 tokens
Read src/session.rs → 300 lines → ~2,100 tokens
Read src/user.rs    → 500 lines → ~3,500 tokens
# Total: 8,400 tokens for 3 files
```

Большая часть этого контента не имеет значения. Claude нужно было знать, что у `auth.rs` есть `fn login()` и `fn logout()`, а не 400 строк реализации.

**Прогрессивное исследование исправляет эту проблему**:

```
Step 1: What's in auth.rs?       →  ~200 tokens (signatures only)
Step 2: Show me fn login() body  →  ~350 tokens (one function)
Step 3: Who calls login()?       →  ~150 tokens (cross-reference)
# Total: 700 tokens instead of 8,400 — 92% reduction
```

## <a name="when-to-use"></a>Когда использовать

| Сигнал | Используйте смарт-эксплорер | Используйте стандартное чтение |
|--------|-------------------|-------------------|
| «Пойми это module/feature» | ✅ | ❌ |
| Изучение незнакомой кодовой базы | ✅ | ❌ |
| Поиск места для добавления функции | ✅ | ❌ |
| Нужно прочитать одну конкретную функцию | ❌ | ✅ |
| Отладка известной строки | ❌ | ✅ |
| Размер файла < 100 строк | ❌ | ✅ (просто прочитайте) |

**Не использовать для**:
- Небольшие проекты (< 20 файлов) — накладные расходы того не стоят.
- Однофайловые задачи — чтение быстрее
- Уже знаете, что читать — идите прямо

## <a name="decision-tree"></a>Дерево решений

```
Exploration task?
├─ Yes, understand a module
│  └─ Files > 200 lines each?
│     ├─ Yes → smart-explore (structure first)
│     └─ No  → just Read (file is small)
├─ Search for something specific
│  └─ By name/pattern → Grep
│  └─ By meaning → grepai semantic search
└─ Need one specific function → Read with offset
```

## Три подхода (восходящая установка)

### Подход А: без настройки — прогрессивная дисциплина чтения.

Никакой установки не требуется. Просто измените способ запроса Claude.

**Добавьте в свой CLAUDE.md** (или проинструктируйте Claude напрямую):

```markdown
## Code Exploration Protocol

When asked to explore a codebase or understand a module:

1. **Structure first**: Use Grep to find function/class definitions

   Rust:
   `rg "^\s*(pub\s+)?(async\s+)?fn |^\s*(pub\s+)?(struct|enum|trait|impl)\s" src/ --no-heading -n`

   Python/TypeScript/JS:
   `rg "^\s*(async\s+)?(def |function |class |export (function|class|const))" src/ --no-heading -n`

   Note: use `^\s*` not `^` — methods inside impl blocks and class bodies are indented.
   The `^` pattern misses ~70% of Rust methods.

2. **Identify relevant symbols**: Based on names, pick 2-3 to read

3. **Targeted read**: Use Read with offset/limit to read specific functions
   - Read lines 45-90 of auth.rs, not the whole file

4. **Cross-reference**: Use Grep to find callers only if needed
   - `rg "fn_name" --type rust -n`

Never read a file start-to-finish when exploring. Always structure first.
```

**Работает с**: любой сеанс Claude Code, никаких зависимостей.

---

### Подход Б: сидящий на дереве CLI + скрипт извлечения

Установите Tree-sitter CLI и используйте облегченный скрипт Python для извлечения подписей.

**Installation**:

```bash
# macOS
brew install tree-sitter

# Verify
tree-sitter --version
```

**Извлечь скрипт подписей**: сохранить как `~/.claude/scripts/extract-signatures.py`:

```python
#!/usr/bin/env python3
"""Extract function/class signatures from source files using tree-sitter CLI."""

import subprocess
import sys
import json
import re
from pathlib import Path


def extract_signatures(file_path: str) -> list[str]:
    """Extract function and type signatures without bodies."""
    path = Path(file_path)

    # Detect language from extension
    lang_map = {
        ".rs": "rust", ".py": "python", ".ts": "typescript",
        ".tsx": "tsx", ".js": "javascript", ".jsx": "jsx",
        ".go": "go", ".rb": "ruby", ".java": "java",
    }
    lang = lang_map.get(path.suffix)
    if not lang:
        return [f"# Unsupported: {path.suffix}"]

    # Use tree-sitter to parse and get JSON AST
    try:
        result = subprocess.run(
            ["tree-sitter", "parse", file_path, "--json"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            return [f"# Parse error: {result.stderr[:100]}"]
    except FileNotFoundError:
        return ["# tree-sitter not installed: brew install tree-sitter"]
    except subprocess.TimeoutExpired:
        return ["# Parse timeout"]

    # Read actual source for signature extraction
    source_lines = path.read_text().splitlines()

    signatures = []

    # Regex-based signature extraction (faster than full AST for this use case)
    patterns = {
        "rust": [
            (r"^(\s*(?:pub\s+)?(?:async\s+)?fn\s+\w+[^{]*?)(?:\{|$)", "fn"),
            (r"^(\s*(?:pub\s+)?struct\s+\w+[^{]*?)(?:\{|$)", "struct"),
            (r"^(\s*(?:pub\s+)?enum\s+\w+[^{]*?)(?:\{|$)", "enum"),
            (r"^(\s*(?:pub\s+)?trait\s+\w+[^{]*?)(?:\{|$)", "trait"),
            (r"^(\s*impl\s+[^{]+?)(?:\{|$)", "impl"),
        ],
        "python": [
            (r"^(\s*(?:async\s+)?def\s+\w+[^:]*:)", "fn"),
            (r"^(\s*class\s+\w+[^:]*:)", "class"),
        ],
        "typescript": [
            (r"^(\s*(?:export\s+)?(?:async\s+)?function\s+\w+[^{]*?)(?:\{|$)", "fn"),
            (r"^(\s*(?:export\s+)?(?:default\s+)?class\s+\w+[^{]*?)(?:\{|$)", "class"),
            (r"^(\s*(?:export\s+)?(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)", "arrow"),
            (r"^(\s*(?:export\s+)?(?:interface|type)\s+\w+[^{=]*?)(?:\{|=|$)", "type"),
        ],
        "go": [
            (r"^(\s*func\s+[^{]+?)(?:\{|$)", "fn"),
            (r"^(\s*type\s+\w+\s+(?:struct|interface)[^{]*?)(?:\{|$)", "type"),
        ],
        "javascript": [
            (r"^(\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+\w+[^{]*?)(?:\{|$)", "fn"),
            (r"^(\s*(?:export\s+)?(?:default\s+)?class\s+\w+[^{]*?)(?:\{|$)", "class"),
            (r"^(\s*(?:export\s+)?(?:const|let)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)", "arrow"),
        ],
    }

    lang_patterns = patterns.get(lang, [])

    for i, line in enumerate(source_lines, 1):
        for pattern, sig_type in lang_patterns:
            match = re.match(pattern, line)
            if match:
                sig = match.group(1).strip().rstrip("{").strip()
                signatures.append(f"  {sig_type} {sig}  (line {i})")
                break

    return signatures


def explore_directory(directory: str, extensions: list[str] | None = None) -> None:
    """Print structure of all source files in directory."""
    if extensions is None:
        extensions = [".rs", ".py", ".ts", ".tsx", ".js", ".go"]

    path = Path(directory)
    files = sorted(
        f for ext in extensions
        for f in path.rglob(f"*{ext}")
        if not any(part.startswith(".") or part in ("node_modules", "target", "__pycache__", "dist")
                   for part in f.parts)
    )

    for file in files:
        rel_path = file.relative_to(path)
        sigs = extract_signatures(str(file))
        if sigs:
            print(f"\n{rel_path}:")
            for sig in sigs:
                print(sig)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: extract-signatures.py <file_or_dir> [ext1 ext2 ...]")
        sys.exit(1)

    target = sys.argv[1]
    exts = sys.argv[2:] if len(sys.argv) > 2 else None

    if Path(target).is_file():
        sigs = extract_signatures(target)
        for sig in sigs:
            print(sig)
    else:
        explore_directory(target, exts)
```

**Сделать исполняемый файл**:

```bash
chmod +x ~/.claude/scripts/extract-signatures.py
```

**Usage**:

```bash
# Single file
python3 ~/.claude/scripts/extract-signatures.py src/auth.rs

# Whole directory
python3 ~/.claude/scripts/extract-signatures.py src/

# Specific extensions
python3 ~/.claude/scripts/extract-signatures.py src/ .ts .tsx
```

**Пример вывода** (в 500-строчном файле Rust):

```
src/auth.rs:
  fn  pub fn new(config: AuthConfig) -> Self  (line 12)
  fn  pub async fn login(username: &str, password: &str) -> Result<Session>  (line 28)
  fn  pub async fn logout(session_id: Uuid) -> Result<()>  (line 67)
  fn  pub fn validate_session(token: &str) -> bool  (line 89)
  struct  pub struct AuthConfig  (line 110)
  struct  pub struct Session  (line 125)
  impl  impl AuthService  (line 140)
```

**Tokens**: ~50–150 на файл против 2000–5000 при полном чтении.

**Добавьте к CLAUDE.md**, чтобы сделать это автоматически:

```markdown
## Code Structure Tool

Before reading multiple files, run:
`python3 ~/.claude/scripts/extract-signatures.py <directory>`

This shows all function signatures without file bodies. Use this to identify
which specific functions to read, then use Read with line offset.
```

---

### Подход C: сервер MCP (рекомендуется для крупных проектов).

Для кодовых баз, содержащих более 50 файлов, индексированный сервер MCP обеспечивает более быстрый поиск и обработку межфайловых ссылок.

**Лучшие варианты в зависимости от варианта использования**:

| Вариант использования | Рекомендуется | Установка |
|---|---|---|
| Общее исследование кода | mcp-server-tree-sitter | `pip install mcp-server-tree-sitter` |
| Обзоры PR-кода | code-review-graph | `pip install code-review-graph` |
| Рабочие процессы с большим количеством символов | jCodeMunch (некоммерческий) | `claude mcp add jcodemunch uvx jcodemunch-mcp` |

#### Вариант C1: mcp-server-tree-sitter

```bash
pip install mcp-server-tree-sitter

# Add to Claude Code
claude mcp add tree-sitter python -m mcp_server_tree_sitter
```

**Инструменты, доступные после установки**:
- `get_file_structure` — подписи и типы файла
- `run_ast_query` — пользовательский запрос Tree-Sitter (расширенный)
- `find_symbols` — поиск по имени по кодовой базе
- `analyze_dependencies` — анализ межфайловых ссылок

**Настройте в Claude Code** (`~/.claude/settings.json`):
```json
{
  "mcpServers": {
    "tree-sitter": {
      "command": "python",
      "args": ["-m", "mcp_server_tree_sitter"]
    }
  }
}
```

#### Вариант C2: график code-review (лучше всего подходит для PR-проверок)

```bash
pip install code-review-graph
code-review-graph install
```

**Что добавляет**: При просмотре PR Claude автоматически получает измененные файлы И график их зависимостей. Вместо чтения 30 файлов, чтобы понять влияние изменения, Claude видит 5 файлов, которые действительно имеют значение.

**Usage**:

```
/review-pr 123
# code-review-graph automatically provides:
# - Changed files
# - Files that import changed modules
# - Type definitions affected
# - Test coverage for changed code
```

#### Вариант C3: jCodeMunch (поиск символов)

```bash
claude mcp add jcodemunch uvx jcodemunch-mcp
```

**Note**: бесплатно для проектов personal/OSS. $79/developer для коммерческого использования. Проверьте лицензирование перед принятием командой.

После добавления Claude может вызывать:
```
get_symbol("login")          → function body
find_callers("login")         → who calls it
get_class_hierarchy("User")   → inheritance tree
get_dependencies("auth.rs")   → what it imports
```

---

## <a name="workflow-examples"></a>Примеры рабочих процессов

### Пример 1. Знакомство с незнакомым модулем

**Старый путь** (4 чтения, ~12 тыс. токенов):
```
Read src/payments/processor.rs   # 400 lines
Read src/payments/validator.rs   # 300 lines
Read src/payments/gateway.rs     # 500 lines
Read src/payments/types.rs       # 200 lines
```

**Умное исследование** (1 сканирование структуры + 2 целевых чтения, ~1,5 тыс. токенов):
```bash
# Step 1: Get structure (~400 tokens for all 4 files)
python3 ~/.claude/scripts/extract-signatures.py src/payments/

# Step 2: Identify what matters from signatures
# "process_payment() calls validate_amount() — read those two"

# Step 3: Read only those functions (with line offsets)
Read src/payments/processor.rs (lines 45-90)   # ~300 tokens
Read src/payments/validator.rs (lines 12-40)   # ~200 tokens
```

**Result**: То же понимание, примерно на 87 % меньше токенов.

### Пример 2. Найдите, куда добавить функцию

```bash
# Goal: Add rate limiting to the auth service
# Step 1: What's in the auth module?
python3 ~/.claude/scripts/extract-signatures.py src/auth/

# Output:
# src/auth/middleware.rs:
#   fn  pub fn authenticate(req: &Request) -> Result<Claims>  (line 15)
#   fn  pub fn refresh_token(token: &str) -> Result<String>   (line 45)
#
# src/auth/service.rs:
#   fn  pub fn validate(claims: &Claims) -> bool  (line 8)
#   fn  pub async fn login(creds: &Credentials) -> Result<Token>  (line 20)

# Step 2: Rate limiting goes in middleware.rs before authenticate()
# Read ONLY the authenticate function to understand injection point
Read src/auth/middleware.rs lines 15-44

# Step 3: Add feature — done
```

### Пример 3: Интеграция Claude Code CLAUDE.md

Добавьте в `CLAUDE.md` вашего проекта:

```markdown
## Code Exploration Protocol

**For any exploration/refactoring task on this codebase:**

1. **Never read full files when exploring** — use structure scan first
2. Run `python3 ~/.claude/scripts/extract-signatures.py <module_dir>`
3. Identify 2-3 relevant functions from the output
4. Read only those functions (use Read with line offset from signature output)
5. For cross-file dependencies: Grep for the function name, don't read the caller file

**Rationale**: This codebase has ~80 files averaging 300 lines. Full reads = 15k+ tokens per task. Structure-first = 1-2k tokens.
```

---

## Тесты токенов (честные)

Измеренные шаблоны, а не маркетинг:

| Операция | Без смарт-исследования | С умным исследованием | Экономия |
|---|---|---|---|
| Понимание 5-файлового модуля | ~18 000 токенов | ~2500 токенов | ~86% |
| Найдите, куда добавить функцию | ~8000 токенов | ~800 жетонов | ~90% |
| PR-обзор (10 измененных файлов) | ~25 000 токенов | ~3500 токенов | ~86% |
| Поиск одной функции | ~3000 токенов | ~350 жетонов | ~88% |

**Context**: Числа на основе типичных файлов (200–500 строк). Экономия увеличивается для больших файлов и уменьшается для маленьких. Проект Aider (более 40 тысяч звезд) независимо проверяет этот подход и создает около 1000 сводок токенов для всех крупных репозиториев.

---

## Сравнение с дополнительными инструментами

| Инструмент | Что это экономит | Когда |
|---|---|---|
| **RTK** | Токены вывода команды (git, Cargo, npm) | После запуска команд CLI |
| **smart-explore** (этот навык) | Токены чтения кода | Прежде чем читать исходные файлы |
| **grepai** | Несколько раундов Grep → один семантический запрос | При поиске по concept/intent |
| **ast-grep** | Сложные структурные рефакторинги | Масштабные преобразования кода |

Они аддитивны, а не конкурируют. Типичный 30-минутный сеанс Claude Code использует все четыре.

---

## <a name="troubleshooting"></a>Поиск неисправностей

**дерево-няня CLI не найден**:
```bash
brew install tree-sitter  # macOS
# or: npm install -g tree-sitter-cli
```

**Script ничего не извлекает**:
- Проверьте, что расширение файла находится в списке поддерживаемых
- Убедитесь, что шаблоны регулярных выражений соответствуют стилю вашего языка.
- При необходимости добавьте языковые шаблоны в словарь `patterns` скрипта.

Сервер **MCP не подключается**:
```bash
# Verify install
python -m mcp_server_tree_sitter --help

# Restart Claude Code after adding MCP server
# Check ~/.claude/settings.json has correct config
```

**Результаты слишком многословны** (слишком много подписей):
- Фильтровать по определенным подкаталогам: `extract-signatures.py src/payments/`.
- Использовать фильтр расширений: `extract-signatures.py src/ .rs` (только Rust)
- Для больших баз кода запросы по области функций, а не по всему src/

---

## <a name="resources"></a>Ресурсы

- [Aider Repo Map Architecture](https://aider.chat/docs/repomap.html): эталонная реализация (PageRank + Tree-Sitter)
- [mcp-server-tree-sitter](https://github.com/wrale/mcp-server-tree-sitter): чистый подход MCP
- [code-review-graph](https://github.com/tirth8205/code-review-graph): фокус PR-обзора, MIT, ~2 тыс. звезд
- [jCodeMunch](https://github.com/jgravelle/jcodemunch-mcp): поиск символов MCP (бесплатная некоммерческая версия)
- [tree-sitter.github.io](https://tree-sitter.github.io/tree-sitter/): официальная документация

---

**Последнее обновление**: март 2026 г.
**Совместимость с**: Claude Code 2.0+
**Зависит от**: сидящий на дереве CLI (подход B), Python 3.10+ (скрипт)
