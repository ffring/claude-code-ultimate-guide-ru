---
title: "Скрипты"
description: "Служебные сценарии для опытных пользователей Claude Code: аудит, проверки работоспособности и управление сеансами."
tags: [template, debugging, security, workflows]
---

# Скрипты

Скрипты утилит для опытных пользователей Claude Code.

## Обзор

| Скрипт | Описание |
|--------|-------------|
| `pptx-to-pdf.sh` | Пакетное преобразование PPTX в PDF через Keynote на macOS (без зависимостей) |
| `audit-scan.sh` | Аудит безопасности и качества установки Claude Code |
| `check-claude.sh/.ps1` | Проверка работоспособности установки Claude Code |
| `clean-reinstall-claude.sh/.ps1` | Чистая переустановка Claude Code |
| `fresh-context-loop.sh` | Запустите Claude Code в новых контекстных циклах. |
| `session-search.sh` | Поиск по истории сеансов Claude Code |
| `cc-sessions.py` | Расширенный поиск сеансов с инкрементной индексацией (Python) |
| `session-stats.sh` | Статистика по сессиям Claude Code |
| `bridge.py` | Мост: Claude Code → doobidoo → LM Studio |
| `bridge-plan-schema.json` | JSON Схема для формата плана моста v1 |
| `migrate-arguments-syntax.sh` | Перенос синтаксиса аргумента команды косой черты v1 → v2 (bash) |
| `migrate-arguments-syntax.ps1` | Перенести синтаксис аргумента команды с косой чертой v1 → v2 (PowerShell) |
| `rtk-benchmark.sh` | Сравните экономию токенов RTK по сравнению с необработанными командами |
| `sync-claude-config.sh` | Синхронизировать файлы конфигурации Claude между компьютерами. |
| `sonnetplan.sh` | Запустите Claude, заменив Sonnet Opus (псевдоним оптимизации затрат). |
| `test-prompt-caching.ts` | Убедитесь, что кэширование подсказок Anthropic активно (без задержек, только выборка) |
| `smart-suggest-roi.py` | Анализируйте уровень принятия предложений-перехватчиков Smart-Suggest в сравнении с активностью сеанса. |
| `supply-chain-triage.py` | Проверка рабочей станции после инцидента в цепочке поставок npm (файлы блокировки, предустановленные дропперы, хэши полезной нагрузки, перехватчики запуска, наблюдатели отзыва, выход) |

---

## Скрипт моста (Claude Code → LM Studio)

**Purpose**: выполнение планов Claude Code локально через LM Studio для экономии средств.

### Архитектура

```
┌──────────────┐     store_memory      ┌─────────────────┐
│ Claude Code  │ ─────────────────────►│    doobidoo     │
│   (Opus)     │   tag: "plan"         │   SQLite + Vec  │
│   PLANNER    │   status: "pending"   │ ~/.mcp-memory-  │
└──────────────┘                       │  service/       │
                                       └────────┬────────┘
                                                │
                                                │ Direct SQLite read
                                                ▼
                                       ┌─────────────────┐
                                       │   bridge.py     │
                                       │                 │
                                       │ • PlanReader    │
                                       │ • StepExecutor  │
                                       │ • Validator     │
                                       └────────┬────────┘
                                                │
                                                │ HTTP POST
                                                │ /v1/chat/completions
                                                ▼
                                       ┌─────────────────┐
                                       │    LM Studio    │
                                       │  localhost:1234 │
                                       └─────────────────┘
```

### Требования

```bash
pip install httpx
```

- **doobidoo MCP сервер** с серверной частью SQLite (`~/.mcp-memory-service/`)
- **LM Studio**, работающая на `localhost:1234` с загруженной моделью

### Использование

```bash
# Check LM Studio is running
python bridge.py --health

# List pending plans
python bridge.py --list

# Execute all pending plans
python bridge.py

# Execute specific plan
python bridge.py --plan plan_auth_refactor

# Verbose mode
python bridge.py -v
```

### <a name="workflow"></a>Рабочий процесс

#### 1. Claude Code создает план

В Claude Code (Opus) сохраняем план через doobidoo:

```
store_memory("""
{
  "$schema": "bridge-plan-v1",
  "id": "plan_auth_refactor",
  "status": "pending",
  "context": {
    "project": "/path/to/project",
    "objective": "Refactor authentication to use JWT",
    "files_context": {
      "src/auth.py": "LOAD",
      "src/config.py": "REFERENCE"
    }
  },
  "steps": [
    {
      "id": 1,
      "type": "analysis",
      "description": "Analyze current auth implementation",
      "prompt": "Analyze the authentication code and identify migration points for JWT.",
      "validation": {"type": "non_empty"}
    },
    {
      "id": 2,
      "type": "code_generation",
      "description": "Generate JWT middleware",
      "prompt": "Generate a JWT authentication middleware based on the analysis.",
      "depends_on": [1],
      "validation": {"type": "syntax_check"},
      "file_output": "src/jwt_auth.py"
    }
  ]
}
""", tags=["plan"])
```

#### 2. Выполнить через мост

```bash
python bridge.py
# Reads plan from doobidoo SQLite
# Executes each step via LM Studio
# Stores results back in doobidoo
```

#### 3. Получить результаты в Claude Code

```
search_by_tag(["result", "plan_auth_refactor"])
# Returns all execution results
```

### Схема плана

См. `bridge-plan-schema.json` для полной схемы JSON.

| Поле | Необходимый | Описание |
|-------|----------|-------------|
| `$schema` | Да | Должно быть `"bridge-plan-v1"` |
| `id` | Да | Уникальный идентификатор плана (например, `plan_auth_refactor`) |
| `status` | Да | `pending`, `in_progress`, `completed`, `failed` |
| `context.objective` | Да | Общее описание цели |
| `context.project` | Нет | Абсолютный путь к корню проекта |
| `context.files_context` | Нет | Файлы для внедрения (`LOAD`) или ссылки |
| `steps` | Да | Массив шагов выполнения |

### Типы шагов

| Тип | Вариант использования |
|------|----------|
| `analysis` | Анализируйте код, выявляйте шаблоны, планируйте изменения |
| `code_generation` | Генерировать новый код с нуля |
| `code_modification` | Изменить существующий код |
| `decision` | Принимайте архитектурные или дизайнерские решения |

### Типы проверки

| Тип | Описание |
|------|-------------|
| `non_empty` | Вывод не пуст (по умолчанию) |
| `json` | Действительный вывод JSON |
| `syntax_check` | Действительный синтаксис Python |
| `contains_keys` | JSON содержит определенные ключи. |

### Обработка сбоев

| on_failure | Поведение |
|------------|----------|
| `retry_with_context` | Повторить попытку с сообщением об ошибке (по умолчанию) |
| `skip` | Пропустить шаг, продолжить выполнение |
| `halt` | Остановить весь план |

### Экономия затрат

- **Планирование** (Opus): ~$0,50–2,00 за комплексный план.
- **Execution** (LM Studio): бесплатно (локально)
- **ROI**: снижение затрат на задачи внедрения на 80-90%.

### <a name="limitations"></a>Ограничения

| Ограничение | смягчение последствий |
|------------|------------|
| Качество локальной модели варьируется | Строгая проверка + повторные попытки |
| В LM Studio нет инструментов MCP. | Внедрить содержимое файла в контекст |
| Ограниченное контекстное окно | Усечь старые результаты |
| Нет потоковой передачи | Таймаут 120 секунд на шаг |

---

## Аудит сканирования

Аудит безопасности и качества вашей конфигурации Claude Code.

```bash
./audit-scan.sh
```

Checks:
- Конфиденциальные данные в файлах CLAUDE.md
- Конфигурации разрешений
- Безопасность сервера MCP
- Безопасность сценария перехвата

---

## Проверка здоровья

Быстрая проверка установки Claude Code.

```bash
# macOS/Linux
./check-claude.sh

# Windows
./check-claude.ps1
```

---

## Чистая переустановка

Полная переустановка с сохранением настроек.

```bash
# macOS/Linux
./clean-reinstall-claude.sh

# Windows
./clean-reinstall-claude.ps1
```

---

## Свежий контекстный цикл

Запустите Claude Code с новым контекстом для длительных задач.

```bash
./fresh-context-loop.sh --iterations 5 --project /path/to/project
```

---

## Поиск сеанса

Поиск по всей истории сеансов Claude Code.

```bash
./session-search.sh "authentication"
```

---

## Менеджер сеансов (расширенный)

Расширенный CLI для поиска сеансов, просмотра, возобновления и обнаружения шаблонов с инкрементальной индексацией.

**против session-search.sh**: более быстрый поиск (~200 мс против ~400 мс), частичное возобновление идентификатора, фильтр ветвей, поддержка рабочего дерева, инкрементный индекс JSONL и подкоманда `discover` для автоматической оптимизации конфигурации.

**GitHub**: [FlorianBruniaux/cc-sessions](https://github.com/FlorianBruniaux/cc-sessions)

```bash
# Search in current project
cc-sessions search "notion"

# Search all projects
cc-sessions --all search "stripe"

# Filter by date and branch
cc-sessions search "auth" --since 7d --branch develop

# Recent sessions
cc-sessions recent 10

# Resume with partial ID
cc-sessions resume 8d472d

# JSON output for scripting
cc-sessions --json search "prisma" | jq -r '.[].id'

# Discover recurring patterns (n-gram, local, free)
cc-sessions --all discover

# Discover with semantic analysis via claude --print
cc-sessions --all discover --llm

# JSON output for scripting
cc-sessions --all discover --json | jq '.[] | select(.category == "skill")'
```

**Установить из GitHub**:
```bash
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/cc-sessions/main/cc-sessions \
  -o ~/.local/bin/cc-sessions && chmod +x ~/.local/bin/cc-sessions
```

**Или скопируйте локально**: `cp cc-sessions.py ~/bin/cc-sessions && chmod +x ~/bin/cc-sessions`

> [GitHub репо](https://github.com/FlorianBruniaux/cc-sessions) · [Gist](https://gist.github.com/FlorianBruniaux/992d4d1107592d9e98ca9d89838871c6)

---

## Статистика сеанса

Получите статистику об использовании Claude Code.

```bash
./session-stats.sh
```

---

## PPTX в PDF (macOS)

Пакетное преобразование презентаций PPTX в PDF с помощью Keynote. Никакого LibreOffice, никакого Python — только macOS + Keynote.

```bash
# Convert all PPTX in a folder (recursive)
./pptx-to-pdf.sh ~/Downloads/Prose

# Convert current directory
./pptx-to-pdf.sh
```

**Требования**: macOS + Keynote установлен.

**Behavior**:
- Рекурсивный: находит все файлы `.pptx` в подкаталогах.
- Идемпотент: пропускает файлы, в которых уже существует `.pdf`.
- Вывод: PDF-файл, созданный вместе с каждым PPTX, в той же папке, с тем же именем.
- Резюме напечатано в конце

**Key gotcha**: скрипт открывает файлы через `open -a "Keynote"` из оболочки, а не через собственную команду AppleScript `open`. Когда Keynote открывает PPTX через AppleScript, он иногда не регистрирует документ в своем внутреннем списке, что приводит к ошибке -1719 в `document 1`. Шаблон «Открытие оболочки + 8-секундный сон» надежно исправляет это.
