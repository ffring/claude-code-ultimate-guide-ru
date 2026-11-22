---
title: "Наблюдение и мониторинг сеансов"
description: "Отслеживайте использование Claude Code, оценивайте затраты и выявляйте закономерности в ходе сеансов разработки."
tags: [observability, guide, performance]
keywords:
  - "monitor claude traffic"
  - "monitor claude mentions"
  - "track claude traffic"
  - "claude code observability"
---

# Наблюдение и мониторинг сеанса

> Отслеживайте использование Claude Code, оценивайте затраты и выявляйте закономерности в ходе сеансов разработки.

Для систем с явными циклами или графами рабочих процессов инструментируйте уровень принятия решений, а также модель и инструменты. [Loop & Graph Engineering](../core/loop-graph-engineering.md#7-observe-and-evaluate-the-system) определяет минимальные доказательства для маршрутов, переходов между состояниями, контрольных точек, вердиктов и действий человека.

## Оглавление

1. [Зачем отслеживать сеансы](#why-monitor-sessions)
2. [Поиск и возобновление сеанса](#session-search--resume)
3. [Настройка регистрации сеансов](#setting-up-session-logging)
4. [Анализ данных сеанса](#analyzing-session-data)
5. [Отслеживание затрат](#cost-tracking)
6. [Мониторинг активности](#activity-monitoring)
7. [Внешние средства мониторинга](#external-monitoring-tools)
8. [Проксирование Claude Code](#proxying-claude-code)
9. [Шаблоны и лучшие практики](#patterns--best-practices)
10. [Ограничения](#limitations)

---

## <a name="why-monitor-sessions"></a>Зачем контролировать сеансы

Использование Claude Code может быстро накапливаться, особенно при активной разработке. Мониторинг поможет вам:

- **Понимание затрат**: оценка расходов API до получения счетов
- **Определите шаблоны**: посмотрите, какие инструменты вы используете чаще всего, какие файлы неоднократно редактируются.
- **Оптимизация рабочего процесса**: обнаружение недостатков (например, многократное чтение одного и того же большого файла)
- **Отслеживание проектов**: сравнение использования в разных базах кода.
- **Видимость команды**: совокупное использование для составления бюджета команды (при объединении журналов)

---

## Наблюдаемость по слою жгутов

Собирайте доказательства на уровне, принявшем решение. Для среды выполнения необходимы трассировки вызовов модели, вызовов инструментов, разрешений, контекста и восстановления. Для использования репозитория требуется команда установки, измененный артефакт и результат проверки. Оркестратору необходимы события отправки, передачи обслуживания, повторной попытки, постановки в очередь и эскалации человеком. Панель мониторинга, сообщающая только о токенах, не может определить, правильно ли вел себя цикл или шлюзы его доставки.

[Agent Harness Map](../ecosystem/agent-harness-landscape.md) отделяет среды выполнения, владеющие циклами, от более широкого каталога платформ и проектов, смежных с плоскостью управления. [Agent Harness Engineering](../core/agent-harness.md) объясняет эти уровни, а [Agent Evaluation](../roles/agent-evaluation.md) определяет меры для их оценки. Примените [Security Hardening](../security/security-hardening.md) перед экспортом трассировок или предоставлением доступа инструменту мониторинга. Глоссарий [](../core/glossary.md) обеспечивает единообразие терминов.

Используйте стабильные имена событий и версии каждого поля протокола, которое может изменить поведение. Реестр атрибутов генеративного искусственного интеллекта [OpenTelemetry](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/) определяет атрибуты для данных агента, модели, поставщика, операции, запроса, ответа, токена и инструмента. Считайте текст подсказки, аргументы инструментов, результаты инструментов, пути к файлам и идентификаторы пользователей как конфиденциальные полезные данные: редактируйте или хэшируйте их перед экспортом и документируйте, какие поля были удалены.

Оптимизатору необходим второй уровень трассировки. Свяжите каждую версию комплектации кандидата с ее родительской версией, мутацией, оценочными задачами, бюджетом, баллами и решением о повышении. Без этого происхождения более высокий итоговый балл не может определить, какое изменение вызвало его или потратил ли кандидат больше бюджета на поиск и исполнение.

### <a name="graph-level-observability"></a>Наблюдаемость на уровне графа

Рабочий процесс на основе графиков требует большего, чем просто наборы моделей и инструментов. Трассировка должна восстановить, почему работа была перемещена, ожидала, повторялась или останавливалась.

| Поле | Вопрос, на который он отвечает |
|-------|---------------------|
| `graph.version`, `policy.version` | Какая топология исполняемого файла и политика управления управляли запуском? |
| `node.id`, `edge.id`, `route.reason` | Какая ветвь работала и почему она была выбрана? |
| `state.before`, `state.after` | Что изменилось на границе перехода? |
| `join.expected`, `join.received`, `join.wait_ms` | Была ли параллельная работа завершена, отсутствовала или заблокирована? |
| `retry.count`, `interrupt.reason`, `resume.from` | Восстановление повторило работу или возобновилось с контрольной точки? |
| `reviewer.model`, `reviewer.provider`, `evidence.refs` | Насколько независимым и доказательным был приговор? |
| `human.checkpoint`, `human.wait_ms`, `verdict.overturned` | Откуда к человеку вернулось осуждение и с каким эффектом? |

Официальный граф [LangGraph API](https://docs.langchain.com/oss/python/langgraph/graph-api) раскрывает состояние, узлы, ребра, условную маршрутизацию, параллельные супершаги и метаданные времени выполнения. Его модель персистентности [](https://docs.langchain.com/oss/python/langgraph/persistence) добавляет контрольные точки, воспроизведение, прерывание с участием человека и восстановление после сбоев. Это отслеживаемые события, а не просто детали реализации.

Лиза иллюстрирует ту же потребность в плоскости управления кодированием. В закрепленном журнале проблем архитектуры [](https://github.com/liza-mas/liza/blob/a22c12381c5d884d2586a48aaaa517bca184f9cf/specs/architecture/architectural-issues.md) задержка ручной проверки, проверка перекрестных пар, пробелы в разнообразии поставщиков и неизмеренная точность рецензентов являются открытыми проблемами. Сами по себе токены и статус задачи не могут выявить эти режимы сбоя. Отдельно записывайте маршрутизацию, состав кворума, доказательства проверки, время ожидания и результаты вынесения вердикта.

---

## <a name="session-search--resume"></a>Поиск и возобновление сеанса

После нескольких недель использования Claude Code найти прошлые разговоры становится сложно. В этом разделе рассматриваются встроенные опции и инструменты сообщества.

### <a name="native-commands"></a>Родные команды

| Команда | Вариант использования |
|---------|----------|
| `claude -c` / `claude --continue` | Возобновить последний сеанс |
| `claude -r <id>` / `claude --resume <id>` | Возобновить конкретный сеанс по идентификатору |
| `claude --resume` | Интерактивный выбор сеанса |

Сеансы хранятся локально по адресу `~/.claude/projects/<project>/` в виде файлов JSONL.

### Сравнение инструментов сообщества

| Инструмент | Установка | Список скорости | Скорость поиска | Зависимости | Возобновить команду |
|------|---------|------------|--------------|--------------|----------------|
| **session-search.sh** (это репо) | Копировать скрипт | **10ms** | **400ms** | Нет (баш) | ✅ Отображается |
| claude-conversation-extractor | `pip install` | 230 мс | 1.7s | Питон | ❌ |
| claude-code-transcripts | `uvx` | N/A | N/A | Питон | ❌ |
| пробежал CLI | `npm -g` | N/A | Быстрый | Node.js | ❌ (только команды) |

### <a name="recommended-session-searchsh"></a>Рекомендуется: session-search.sh

Скрипт bash с нулевой зависимостью, оптимизированный по скорости, с готовыми к использованию командами возобновления.

**Install:**
```bash
cp examples/scripts/session-search.sh ~/.claude/scripts/cs
chmod +x ~/.claude/scripts/cs
echo "alias cs='~/.claude/scripts/cs'" >> ~/.zshrc
source ~/.zshrc
```

**Usage:**
```bash
cs                          # List 10 most recent sessions (~15ms)
cs "authentication"         # Single keyword search (~400ms)
cs "Prisma migration"       # Multi-word AND search (both must match)
cs -n 20                    # Show 20 results
cs -p myproject "bug"       # Filter by project name
cs --since 7d               # Sessions from last 7 days
cs --since today            # Today's sessions only
cs --json "api" | jq .      # JSON output for scripting
cs --rebuild                # Force index rebuild
```

**Output:**
```
2026-01-15 08:32 │ my-project             │ Implement OAuth flow for...
  claude --resume 84287c0d-8778-4a8d-abf1-eb2807e327a8

2026-01-14 21:13 │ other-project          │ Fix database migration...
  claude --resume 1340c42e-eac5-4181-8407-cc76e1a76219
```

Скопируйте и вставьте команду `claude --resume`, чтобы продолжить любой сеанс.

### <a name="how-it-works"></a>Как это работает

1. **Index mode** (без фильтров): использует кэшированный индекс TSV. Автоматически обновляется при смене сеансов. Поиск ~15 мс.
2. **Режим поиска** (с keyword/filters): Полнотекстовый поиск с таймаутом 3 секунды. Запросы из нескольких слов используют логику AND.
3. **Filters**: `--project` (совпадение подстроки), `--since` (поддерживает `today`, `yesterday`, `7d`, `YYYY-MM-DD`)
4. **Output**: по умолчанию человекочитаемый, `--json` для сценариев. Исключает сеансы agent/subagent.

### Альтернатива: инструменты Python

Если вы предпочитаете более широкие возможности (экспорт HTML, несколько форматов):

```bash
# Install
pip install claude-conversation-extractor

# Interactive UI
claude-start

# Direct search
claude-search "keyword"

# Export to markdown
claude-extract --format markdown
```

Полный сценарий см. в [session-search.sh](../../examples/scripts/session-search.sh).

---

### <a name="session-resume-limitations--cross-folder-migration"></a>Ограничения на возобновление сеанса и миграция между папками

**TL;DR**: встроенный `--resume` по своей конструкции ограничен текущим рабочим каталогом. Для миграции между папками используйте ручные операции с файловой системой (рекомендуется) или инструменты автоматизации сообщества (непроверено).

#### Почему резюме ограничивается каталогом

Claude Code сохраняет сеансы по адресу `~/.claude/projects/<encoded-path>/`, где `<encoded-path>` является производным от абсолютного пути вашего проекта. Например:
- Проект в `/home/user/myapp` → Сессии в `~/.claude/projects/-home-user-myapp-/`
- Проект перемещен в `/home/user/projects/myapp` → Claude ищет `~/.claude/projects/-home-user-projects-myapp-/` (другой каталог)

**Обоснование дизайна**: В сеансах хранятся абсолютные пути к файлам, контекст, специфичный для проекта (конфигурации сервера MCP, правила `.claudeignore`, переменные среды). Возобновление между папками потребует перезаписи пути и проверки контекста, что еще не реализовано.

**Related**: Проблема GitHub [#1516](https://github.com/anthropics/claude-code/issues/1516) отслеживает запросы сообщества на встроенную поддержку нескольких папок.

#### <a name="manual-migration-recommended"></a>Ручная миграция (рекомендуется)

**При перемещении папки проекта:**

```bash
# Before moving project
cd ~/.claude/projects/
ls -la  # Note the current encoded path

# Move your project
mv /old/location/myapp /new/location/myapp

# Rename session directory to match new path
cd ~/.claude/projects/
mv -- -old-location-myapp- -new-location-myapp-

# Verify
cd /new/location/myapp
claude --continue  # Should resume successfully
```

**При разветвлении сеансов на новый проект:**

```bash
# Copy session files (preserves original)
cd ~/.claude/projects/
cp -n ./-source-project-/*.jsonl ./-target-project-/

# Copy subagents directory if exists
if [ -d ./-source-project-/subagents ]; then
  cp -r ./-source-project-/subagents ./-target-project-/
fi

# Resume in target project
cd /path/to/target/project
claude --continue
```

#### <a name="️-migration-risks--caveats"></a>⚠️ Миграционные риски и предостережения

**Перед миграцией сеансов проверьте совместимость:**

| Риск | Влияние | смягчение последствий |
|------|--------|------------|
| **Жестко закодированные секреты** | Полномочия, представленные в новом контексте | Проверяйте файлы `.jsonl` перед миграцией, при необходимости редактируйте их. |
| **Абсолютные пути** | Ссылки на файлы разрываются, если пути различаются. | Убедитесь, что пути существуют в цели, или примите неработающие ссылки. |
| Конфиги сервера **MCP** | Исходные серверы MCP отсутствуют в цели | Прежде чем возобновить работу, установите соответствующие серверы MCP. |
| **`.claudeignore` правила** | Различные шаблоны игнорирования | Просмотрите различия, при необходимости объедините |
| **Переменные среды** | `process.env` несоответствие контекста | Проверьте совместимость файлов `.env` |

**Когда НЕ переносить сеансы:**

- Конфликтующие зависимости (например, разные версии Node.js, менеджеры пакетов)
- Различия в состоянии базы данных (миграции применяются в источнике, а не в цели)
- Контекст аутентификации (токены API, сеансы OAuth, специфичные для исходного проекта)
- Границы безопасности (переход из частного репозитория в общедоступный)

#### <a name="community-automation-tool"></a>Инструмент автоматизации сообщества

**claude-migrate-session** от Джима Веллера (вдохновленный Алексисом Лапортом) автоматизирует описанный выше ручной процесс:

- **Исторический источник** (до переименования навыка): [jimweller/dotfiles](https://github.com/jimweller/dotfiles/tree/7a1d306b15de0a89ea0a809ca42fff5ad5a16e43/dotfiles/claude-code/skills/claude-migrate-session)
- **Features**: Глобальный поиск с фильтрацией, сохраняет субагенты `.jsonl` +, использует ripgrep для повышения производительности.
- **Status**: персональные точечные файлы (0 stars/forks по состоянию на февраль 2026 г.), ограниченное внедрение.
- **Команда**: `/claude-migrate-session <source> <target>`

**⚠️ Предостережение**: Этот инструмент прошел минимальное тестирование сообществом. Ручной подход более безопасен и дает вам явный контроль над тем, что переносится. Тщательно протестируйте перед использованием в рабочих процессах.

**Случаи использования для миграции:**
- Внедрение прототипа в производственную кодовую базу
- Перенос сеанса отладки в изолированный тестовый репозиторий
- Продолжаем обсуждение архитектуры в новом проекте

#### Альтернатива: полная переносимость сеанса CLI.

**Родное ограничение**: Claude Code's `--resume` привязан к абсолютным путям к файлам, прерываясь при перемещении папок.

**Весь подход CLI**: контрольные точки хранятся в самом репозитории Git (`refs/entire/checkpoints/`), поэтому перемещенная проверка сохраняет их, а нажатие отправляет их на удаленный компьютер. `entire session resume` восстанавливает сеансы ветки в вашем агенте.

**Как это работает:**

```bash
# In source project: capture as you work, then commit and push
cd /old/location/myapp
entire enable
[... work in Claude Code, commit ...]
git push                      # code + checkpoint refs

# Elsewhere: clone the repository
git clone <remote> /new/location/myapp
cd /new/location/myapp
# A plain clone fetches branches and tags, not custom refs. Fetch the checkpoints explicitly:
git fetch origin 'refs/entire/checkpoints/*:refs/entire/checkpoints/*'
entire enable
entire session resume <branch>   # restores the branch's sessions in your agent
```

Здесь не проверяется: извлекает ли `entire enable` или `entire session resume` ссылки на контрольные точки самостоятельно и какая часть возобновленного сеанса Claude Code сохраняется при изменении пути. Целые документы, которые `session resume` проверяет ветку и восстанавливает журнал сеанса; проверьте свой собственный ход, прежде чем полагаться на него.

**Родной против Целого:**

| Аспект | Родной `--resume` | Весь CLI |
|--------|-------------------|-----------|
| **Хранилище** | Локальный JSONL для каждого пути проекта | Ссылки на контрольные точки в репозитории |
| **Кросс-машина/кросс-фальцовщик** | Перерывы (разная кодировка проекта) | Перемещение с отправкой и получением ссылок на контрольные точки (возобновление после изменения пути не проверено) |
| **Сохранение контекста** | Только история подсказок | Подсказки + стенограмма + затронутые файлы |
| **Передача агента** | Нет | Да (возобновить у другого агента) |

**Когда использовать полную миграцию вместо ручной миграции:**

- ✅ Частый проект moves/forks
- ✅ Многоагентные рабочие процессы (возобновление ветки в другом агенте)
- ✅ Необходимо объяснить прошлые решения (`entire checkpoint explain`, `entire why`)

**Trade-off**: добавляет в репозиторий ссылку на зависимость инструмента и контрольные точки (измерить рост); расшифровки отправляются вместе с кодом, если не отправляются в отдельный частный репозиторий.

> **Полная документация**: [AI Руководство по отслеживанию](./ai-traceability.md#51-entire-cli)

---

### Мониторинг многоагентной оркестрации

Для мониторинга нескольких одновременных экземпляров Claude Code через внешние оркестраторы (Gas Town, multiclaude) см.:

- **agent-chat** (https://github.com/justinabrahms/agent-chat): пользовательский интерфейс в стиле Slack для общения агентов в реальном времени.
- **Руководство по архитектуре**: `guide/ecosystem/ai-ecosystem.md` Раздел 8.1 — Системы многоагентной оркестрации

**Архитектурный шаблон** (для пользовательских реализаций):
1. Журналы перехватов. Агент задач порождает: `.claude/hooks/multi-agent-logger.sh`.
2. Хранить в SQLite: `~/.claude/logs/agents.db` (parent_id, child_id, метка времени, задача)
3. Поток через SSE: Простой сервер Go/Node HTTP
4. Панель мониторинга: React/HTML потребляет поток SSE

**Встроенный мониторинг Claude Code** (данное руководство):
- Поиск сеанса: `session-search.sh` (см. [Session Search & Resume](#session-search--resume))
- Журналы активности: перехват `session-logger.sh` (см. [Настройка регистрации сеансов](#setting-up-session-logging))
- Анализ статистики: `session-stats.sh` (см. [Анализ данных сеанса](#analyzing-session-data))

**Когда использовать мониторинг внешнего оркестратора**:
- Запуск Gas Town или мультиклауда с 5+ одновременными агентами
- Нужна видимость координации действий агентов в режиме реального времени.
- Отладка ошибок оркестрации (конфликты агентов, проблемы слияния)

**Когда достаточно встроенного мониторинга**:
- Одиночный сеанс Claude Code или `--delegate` с <3 субагентами
- Последующий анализ (логи, статистика) достаточен.
- Ограничения Budget/complexity

---

## <a name="setting-up-session-logging"></a>Настройка журналирования сеансов

### 1. Установите хук регистратора

Скопируйте журнал сеансов в каталог хуков:

```bash
# Create hooks directory if needed
mkdir -p ~/.claude/hooks

# Copy the logger (from this repo's examples)
cp examples/hooks/bash/session-logger.sh ~/.claude/hooks/
chmod +x ~/.claude/hooks/session-logger.sh
```

### <a name="2-register-in-settings"></a>2. Зарегистрируйтесь в настройках

Добавьте в `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "~/.claude/hooks/session-logger.sh"
      }
    ]
  }
}
```

### 3. Проверьте установку

Запустите несколько команд Claude Code, затем проверьте логи:

```bash
ls ~/.claude/logs/
# Should see: activity-2026-01-14.jsonl

# View recent entries
tail -5 ~/.claude/logs/activity-$(date +%Y-%m-%d).jsonl | jq .
```

### Варианты конфигурации

| Переменная среды | По умолчанию | Описание |
|---------------------|---------|-------------|
| `CLAUDE_LOG_DIR` | `~/.claude/logs` | Где хранить логи |
| `CLAUDE_LOG_TOKENS` | `true` | Включить оценку токенов |
| `CLAUDE_SESSION_ID` | auto-generated | Пользовательский идентификатор сеанса |

---

## <a name="analyzing-session-data"></a>Анализ данных сеанса

### Использование session-stats.sh

```bash
# Copy the script
cp examples/scripts/session-stats.sh ~/.local/bin/
chmod +x ~/.local/bin/session-stats.sh

# Today's summary
session-stats.sh

# Last 7 days
session-stats.sh --range week

# Specific date
session-stats.sh --date 2026-01-14

# Filter by project
session-stats.sh --project my-app

# Machine-readable output
session-stats.sh --json
```

### Пример вывода

```
═══════════════════════════════════════════════════════════
        Claude Code Session Statistics - today
═══════════════════════════════════════════════════════════

Summary
  Total operations:  127
  Sessions:          3

Token Usage
  Input tokens:      45,230
  Output tokens:     12,450
  Total tokens:      57,680

Estimated Cost (Sonnet rates)
  Input:   $0.1357
  Output:  $0.1868
  Total:   $0.3225

Tools Used
  Edit: 45
  Read: 38
  Bash: 24
  Grep: 12
  Write: 8

Projects
  my-app: 89
  other-project: 38
```

### <a name="reading-for-quality-not-just-quantity"></a>Чтение ради качества, а не только количества

Подсчет токенов покажет вам, сколько вы использовали Claude Code. Журналы JSONL также могут сообщить вам **, насколько хорошо работает ваша конфигурация**, если вы знаете, что искать.

Помимо показателей стоимости, три шаблона надежно сигнализируют о том, что навык, правило или раздел CLAUDE.md нуждаются в обновлении:

**Повторное чтение одного и того же файла**

Если Claude читает один и тот же файл более 3 раз за один сеанс, вероятно, нужный ему контент находится не там, где он ожидает его найти. Рассмотрите возможность перемещения соответствующего контекста в раздел навыков или CLAUDE.md.

```bash
# Files read more than 3x in recent sessions
jq -r 'select(.tool == "Read") | .file' ~/.claude/logs/activity-*.jsonl \
  | sort | uniq -c | sort -rn | awk '$1 > 3'
```

**Ошибки инструмента по одной команде**

Команда Bash, которая неоднократно терпит неудачу в течение сеансов, обычно означает, что навык имеет устаревший путь, переименованный двоичный файл или команду, которая больше не работает с вашим текущим стеком.

```bash
# Failing commands
jq -r 'select(.tool == "Bash" and (.exit_code // 0) != 0) | .command' \
  ~/.claude/logs/activity-*.jsonl | sort | uniq -c | sort -rn | head -10
```

**Высокая частота редактирования одного и того же файла**

Файлы, которые сильно редактировались во время сеансов, часто указывают на отсутствие контекста: назначение файла неясно для агента или соглашения, связанные с ним, не задокументированы.

```bash
# Most-edited files (proxy for context gaps)
jq -r 'select(.tool == "Edit") | .file' ~/.claude/logs/activity-*.jsonl \
  | sort | uniq -c | sort -rn | head -10
```

Для каждого шаблона, который вы обнаружите, спросите: есть ли навык, правило или раздел CLAUDE.md, который должен охватывать это? Полный рабочий процесс см. в разделе [§9.23 «Жизненный цикл конфигурации и цикл обновления»](#923-configuration-lifecycle-the-update-loop).

---

### Формат журнала

Каждая запись журнала представляет собой объект JSON:

```json
{
  "timestamp": "2026-01-14T15:30:00Z",
  "session_id": "1705234567-12345",
  "tool": "Edit",
  "file": "src/components/Button.tsx",
  "project": "my-app",
  "tokens": {
    "input": 350,
    "output": 120,
    "total": 470
  }
}
```

---

## <a name="cost-tracking"></a>Отслеживание затрат

### <a name="token-estimation-method"></a>Метод оценки токена

Регистратор оценивает токены, используя простую эвристику: **~4 символа на токен**. Это приблизительное значение и имеет тенденцию к незначительному завышению.

### Стоимость

По умолчанию в регистраторе используются оценки стандарта Sonnet 5.5 API. Ниже указаны цены в долларах за 1000 токенов, подтвержденные 27 октября 2026 г.; они исключают оценку кэша и не могут точно оценить сеанс смешанной модели. [Официальные цены](https://platform.claude.com/docs/en/about-claude/pricing).

```bash
# Sonnet 5.5 rates (logger default)
export CLAUDE_RATE_INPUT=0.002
export CLAUDE_RATE_OUTPUT=0.010

# Opus 5.5 standard rates
export CLAUDE_RATE_INPUT=0.004
export CLAUDE_RATE_OUTPUT=0.020

# Haiku 5.5 rates (prompts up to 100K tokens; 0.0005/0.0025 above)
export CLAUDE_RATE_INPUT=0.0001
export CLAUDE_RATE_OUTPUT=0.0005
```

### Оповещения о бюджете (ручной шаблон)

Добавьте в свой профиль оболочки предупреждения о ежедневном бюджете:

```bash
# ~/.zshrc or ~/.bashrc
claude_budget_check() {
  local cost=$(session-stats.sh --json 2>/dev/null | jq -r '.summary.estimated_cost.total // 0')
  local threshold=5.00  # $5 daily budget

  if (( $(echo "$cost > $threshold" | bc -l) )); then
    echo "⚠️  Claude Code daily spend: \$$cost (threshold: \$$threshold)"
  fi
}

# Run on shell start
claude_budget_check
```

---

## <a name="activity-monitoring"></a>Мониторинг активности

Отслеживание затрат сообщает *, сколько* вы тратите. Мониторинг активности сообщает *, что на самом деле делал Claude Code*: какие файлы он читал, какие команды запускал, какие URL-адреса получал. Это уровень аудита.

### Сессионный JSONL: основная истина

Каждый вызов инструмента Claude Code записывается в файлах JSONL сеанса по адресу `~/.claude/projects/<project>/`. Каждая запись с `type: "assistant"` содержит массив `content`, где блоки `type: "tool_use"` документируют каждое действие.

```bash
# Find your session files
ls ~/.claude/projects/-$(pwd | tr '/' '-')-/

# Inspect tool calls in a session
cat ~/.claude/projects/-your-project-/SESSION_ID.jsonl | \
  jq 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use") | {tool: .name, input: .input}'
```

### Что показывают вызовы инструментов

| Инструмент | Что это раскрывает |
|------|----------------|
| `Read` | Доступ к файлам (путь, диапазон строк) |
| `Write` / `Edit` | Файлы изменены (путь, разница в содержимом) |
| `Bash` | Выполненные команды (полная командная строка) |
| `WebFetch` | Полученные URL-адреса (могут включать данные, отправленные посредством POST) |
| `Task` | Появляется субагент (приглашение передается в подмодель) |
| `Glob` / `Grep` | Шаблоны и область поиска |

### Практические аудиторские запросы

```bash
# All files read in a session
SESSION=~/.claude/projects/-your-project-/SESSION_ID.jsonl
jq 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use" and .name == "Read") | .input.file_path' "$SESSION"

# All bash commands executed
jq 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use" and .name == "Bash") | .input.command' "$SESSION"

# All URLs fetched
jq 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use" and .name == "WebFetch") | .input.url' "$SESSION"

# Count tool usage by type
jq -r 'select(.type == "assistant") | .message.content[]? | select(.type == "tool_use") | .name' "$SESSION" | sort | uniq -c | sort -rn
```

### Чувствительные модели, на которые стоит обратить внимание

Эти шаблоны вызовов инструментов стоит отметить при автоматическом аудите:

| Шаблон | Риск | Обнаружение |
|---------|------|-----------|
| `Read` на `.env`, `*.pem`, `id_rsa` | Доступ к учетным данным | `jq '... | select(.input.file_path | test("\\.(env|pem|key)$"))'` |
| `Bash` с `rm -rf`, `git push --force` | Разрушительное действие | `jq '... | select(.input.command | test("rm -rf\|force-push"))'` |
| `WebFetch` на внешних URL-адресах | Риск утечки данных | `jq '... | select(.name == "WebFetch") | .input.url'` |
| `Write` для файлов вне корня проекта | Ползучесть масштаба | Проверьте пути к рабочему каталогу |

> **Контекст безопасности**: Claude Code выполняет чтение и запись в вашей файловой системе с вашими разрешениями пользователя. Журнал аудита JSONL — это запись того, что произошло. Для команд рассмотрите возможность синхронизации этих журналов с неизменяемым хранилищем.

---

## <a name="external-monitoring-tools"></a>Инструменты внешнего мониторинга

Помимо описанного выше подхода, основанного на хуках, сообщество создало инструменты для конкретных целей. Это фактический снимок по состоянию на начало 2026 года.

**Инструментирование самого помощника по кодированию, а не только приложения, которое он создает, превращает использование ИИ в нечто контролируемое.** Отслеживание каждого решения, принимаемого агентом, включая такие инструменты, как Claude Code и Codex, с помощью OpenTelemetry устраняет разрыв между «ИИ, вероятно, поступил правильно» и наличием точной цепочки вызовов инструментов, которые дали заданный результат. Системе, которую нельзя наблюдать на этом уровне, нельзя структурно доверять реальную автономию.

*Энни Фриман, Devoxx, 2026 г., доклад «Ненаблюдаемый ИИ — ненадежный ИИ»*

| Инструмент | Тип | Что он делает | Установка |
|------|------|-------------|---------|
| **ccusage** | CLI / ТУИ | Отслеживание затрат из JSONL. Де-факто ссылка на данные о ценах. ~10 тысяч звезд GitHub. | `npm i -g ccusage` |
| **claude-code-otel** | Экспортер OpenTelemetry | Выдает пролеты любому коллектору OTEL. Интегрируется с панелями Prometheus + Grafana. Ориентирован на предприятие. | `npm i -g claude-code-otel` |
| **Акто** | SaaS / самостоятельное размещение | API Ограждения безопасности + контрольный журнал. Перехватывает на уровне API, сигнализирует о нарушениях политики. | [akto.io](https://akto.io) |
| **MLТрассировка потока** | CLI + SDK | Точное количество токенов, диапазон инструментов, оценка LLM как судьи. Режим CLI: Python не требуется. Лучше всего подходит для команд ML/MLOps. | `pip install mlflow` → [см. раздел ниже](#mlflow-tracing) |
| **ccboard** | ТУИ + Интернет | Единая панель управления сессиями, расходами, статистикой. Вкладка Activity/audit в разработке. | `cargo install ccboard` |
| **claude-crusts** | CLI | Сканер загрязнения контекста, запускаемый одной командой: помечает устаревшие файлы, слишком большой объем памяти и загрузку избыточных правил. Прежде чем запускать сеансы, определите, что раздувает ваш контекст. | [github.com/Abinesh-L/claude-crusts](https://github.com/Abinesh-L/claude-crusts) |

### Руководство по принятию решений

```
Want cost numbers fast?          → ccusage (CLI, 0 config)
Need enterprise audit trail?     → native OpenTelemetry + Grafana or Akto
Already using MLflow for ML?     → MLflow tracing integration (see below)
Need agent regression detection? → MLflow tracing + LLM-as-judge
Want a persistent TUI/Web UI?    → ccboard
Context pollution audit?         → claude-crusts (1-command scan)
```

### обвинение

```bash
npm i -g ccusage
ccusage          # Today's usage
ccusage --days 7 # Last 7 days
```

Читает напрямую из `~/.claude/projects/**/*.jsonl`. Нет ключей API, нет данных, отправляемых извне. Источник: [github.com/ryoppippi/ccusage](https://github.com/ryoppippi/ccusage).

### Собственная OpenTelemetry

Ранее указанный репозиторий `claude-code-otel` недоступен. Claude Code напрямую поддерживает OpenTelemetry; следуйте официальной документации по мониторингу [](https://code.claude.com/docs/en/monitoring-usage), чтобы настроить экспорт метрик и событий в ваш коллектор.

### ccboard

```bash
cargo install ccboard
ccboard              # Launch TUI
ccboard --web        # Launch Web UI (localhost:3000)
```

Источник: [github.com/FlorianBruniaux/ccboard](https://github.com/FlorianBruniaux/ccboard). Планируется вкладка «Активность», охватывающая доступ к файлам, команды bash и сетевые вызовы (см. `docs/resource-evaluations/ccboard-activity-module-plan.md`).

### <a name="mlflow-tracing"></a>Трассировка MLflow

**Когда использовать**: команды, уже участвующие в экосистеме MLflow/MLOps, или всем, кому требуется точное количество токенов + оценка качества на основе LLM. Не подходит для индивидуальных разработчиков, которым нужны быстрые подсчеты затрат (вместо этого используйте ccusage).

**Что отличает его от других инструментов**: MLflow перехватывает на уровне API, а не апостериорно из JSONL. Он фиксирует количество токенов **exact** (по сравнению с дисперсией ~ 15-25% оценки на основе хуков) и позволяет **LLM-as-judge** обнаруживать регрессию, а не просто «что произошло», но «было ли это хорошо?».

#### Настройка: режим CLI (Python не требуется)

Работает с интерактивными сеансами `claude`. Подключается к `.claude/settings.json`:

```bash
pip install "mlflow[genai]>=3.4"

# Enable tracing in current project directory
mlflow autolog claude

# With custom backend (recommended for persistence)
mlflow autolog claude -u sqlite:///mlflow.db

# With named experiment
mlflow autolog claude -n "my-project"

# Check status / disable
mlflow autolog claude --status
mlflow autolog claude --disable
```

Запустите пользовательский интерфейс для проверки трассировок:

```bash
mlflow server  # → http://localhost:5000
```

**Что фиксируется автоматически**: запросы пользователя, ответы помощника, вызовы инструментов (имя + входы + выходы), количество токенов (точное), задержка на вызов, метаданные сеанса.

#### Настройка: режим SDK (агенты Python)

```python
import mlflow
mlflow.anthropic.autolog()         # one line, before anything else
mlflow.set_experiment("my-agent")

# Use ClaudeSDKClient normally — all interactions are traced
# ⚠️ Only ClaudeSDKClient is supported. Direct API calls are not traced.
from anthropic import claude_agent_sdk
async with ClaudeSDKClient(options=AGENT_OPTIONS) as client:
    await client.query(query)
```

Требуется: `mlflow>=3.5` + `claude-agent-sdk>=0.1.0`.

#### Сервер MCP: двунаправленная интеграция

Claude Code может напрямую запрашивать свои собственные трассировки. Добавьте в `.claude/settings.json`:

```json
{
  "mcpServers": {
    "mlflow-mcp": {
      "command": "uv",
      "args": ["run", "--with", "mlflow[mcp]>=3.5.1", "mlflow", "mcp", "run"],
      "env": { "MLFLOW_TRACKING_URI": "<your-tracking-uri>" }
    }
  }
}
```

После настройки вы можете запросить Claude Code: *«Найти все сеансы, в которых агент серверного архитектора использовал более 20 вызовов инструментов»*. Он запрашивает MLflow напрямую, без копирования идентификаторов.

#### LLM-как судья: обнаружение регрессии агента

Ключевая возможность отсутствует во всех других инструментах этого раздела. После изменения инструкций агента определите, улучшилось или ухудшилось качество:

```python
from mlflow.genai.scorers import scorer, ConversationCompleteness, RelevanceToQuery
from mlflow.entities.model_registry import Feedback

@scorer
def tool_efficiency(trace) -> int:
    """Count tool calls — lower is better for well-scoped tasks."""
    return len(trace.search_spans(span_type="TOOL"))

@scorer
def permission_blocks(trace) -> int:
    """Detect how often the agent was blocked by permission gates."""
    return sum(
        1 for span in trace.search_spans(span_type="TOOL")
        if span.outputs and "requires approval" in str(span.outputs).lower()
    )

# Run evaluation against recorded traces
traces = mlflow.search_traces(experiment_ids=["<id>"], max_results=50)
results = mlflow.genai.evaluate(
    data=traces,
    scorers=[
        tool_efficiency,
        permission_blocks,
        ConversationCompleteness(),
        RelevanceToQuery(),
    ]
)
```

**Встроенные бомбардиры**: `ConversationCompleteness`, `RelevanceToQuery`, `UserFrustration`, `SafetyScorer`.

**Пользовательские системы оценки**: полный доступ к объекту трассировки (все промежутки, входы, выходы, количество токенов).

#### <a name="limitations"></a>Ограничения

| Ограничение | Деталь |
|------------|--------|
| **CLI режим аудитории** | Лучше всего подходит для интерактивных сессий; Режим SDK необходим для программных агентов |
| Ограничение **SDK** | только `ClaudeSDKClient`; прямые вызовы API в обход трассировки |
| **PII риск** | Трассировки фиксируют полное содержание разговора. Отредактируйте перед сохранением при работе с конфиденциальными данными. |
| **Производственная часть** | SQLite = только для разработчиков. Используйте PostgreSQL/MySQL для производства |
| **OpenTelemetry** | MLflow 3.6+ экспортирует в любой OTEL-совместимый сервер (Datadog, Grafana и т. д.). |

---

## <a name="proxying-claude-code"></a>Проксирование Claude Code

Распространенный вопрос: «Могу ли я запустить Proxyman/Charles, чтобы посмотреть, что Claude Code отправляет в Anthropic?»

**Краткий ответ**: Не напрямую. Вот почему и что работает вместо этого.

### Почему системные прокси не работают

Claude Code — это процесс Node.js. По умолчанию Node.js игнорирует настройки прокси-сервера системного уровня (`HTTP_PROXY`, `HTTPS_PROXY`). Он использует собственный стек TLS и не читает конфигурации прокси-сервера macOS/Windows.

Кроме того, даже если трафик проходит через ваш прокси-сервер, несоответствие сертификата TLS приводит к сбою Claude Code (`CERT_UNTRUSTED`).

### Вариант 1. Доверьтесь сертификату MITM (проксимен/Чарльз)

Заставьте Node.js доверять сертификату CA вашего прокси:

```bash
# Export Proxyman's CA cert (File → Export → Root Certificate)
# Then point Node.js at it:
export NODE_EXTRA_CA_CERTS="/path/to/proxyman-ca.pem"

# Start Claude Code — traffic will now route through Proxyman
claude
```

Тот же подход работает и для Чарльза: `Help → SSL Proxying → Export Charles Root Certificate`.

**Caveats**:
- Некоторые версии Claude Code используют закрепление сертификата для `api.anthropic.com`; это все равно может потерпеть неудачу
- Для этого подхода требуется работающий экземпляр Proxyman/Charles, прослушивающий настроенный порт.

### Вариант 2. Перенаправить трафик API с помощью ANTHROPIC_BASE_URL.

Направьте Claude Code на локальный перехватчик вместо `api.anthropic.com`:

```bash
export ANTHROPIC_BASE_URL="http://localhost:8080"
claude
```

Запустите любой HTTP proxy/logger на порту 8080, который перенаправляет на `https://api.anthropic.com`. Это полностью обходит TLS для перехода Claude Code → прокси.

**Случаи использования**: регистрация полезных данных запроса, внедрение заголовков, локальное ограничение скорости, воспроизведение запросов.

### Вариант 3: mitmproxy (рекомендуется)

[mitmproxy](https://mitmproxy.org) — самое чистое решение с открытым исходным кодом. Он предоставляет прокси-сервер HTTPS с возможностью сценариев с веб-интерфейсом и интерфейсом терминала.

```bash
# Install
brew install mitmproxy  # macOS
# or: pip install mitmproxy

# Start transparent proxy on port 8080
mitmproxy --listen-port 8080

# In a new terminal, point Claude Code at it
export NODE_EXTRA_CA_CERTS="$(python3 -c 'import mitmproxy.certs; print(mitmproxy.certs.Cert.default_ca_path())')"
export HTTPS_PROXY="http://localhost:8080"
claude
```

Веб-интерфейс mitmproxy (`mitmweb`) по адресу `http://localhost:8081` показывает полные тела request/response, включая полезные данные JSON, которые Claude Code отправляет в Anthropic.

**Что вы увидите**: системное приглашение, сообщения пользователя, определения инструментов, результаты работы инструментов, параметры модели.

### Вариант 4. Минимальный прокси-сервер для журналирования Python

Для подхода с нулевой зависимостью:

```python
# proxy.py — simple HTTPS logging proxy
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request, json, sys

TARGET = "https://api.anthropic.com"

class LoggingProxy(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers["Content-Length"])
        body = self.rfile.read(length)
        print(json.dumps(json.loads(body), indent=2))  # Log request
        # Forward to Anthropic...

HTTPServer(("localhost", 8080), LoggingProxy).serve_forever()
```

```bash
python3 proxy.py &
export ANTHROPIC_BASE_URL="http://localhost:8080"
claude
```

> **Примечание о конфиденциальности**: Прокси-трафик включает в себя все, что связано с контекстом разговора: содержимое файла, который Claude прочитал, ваш код, любые секреты, с которыми он столкнулся. Обрабатывайте журналы прокси соответствующим образом.

---

## <a name="patterns--best-practices"></a>Шаблоны и лучшие практики

### 1. Еженедельный обзор

Установите напоминание в календаре для просмотра еженедельной статистики:

```bash
session-stats.sh --range week
```

Искать:
- Необычно большое количество дней использования токенов
- Повторяющиеся операции с одними и теми же файлами (сигнал неэффективности)
- Распределение проекта (где тратится время)

### 2. Отслеживание каждого проекта

Используйте `CLAUDE_SESSION_ID`, чтобы пометить сеансы по проектам:

```bash
export CLAUDE_SESSION_ID="project-myapp-$(date +%s)"
claude
```

### 3. Объединение команды

Для отслеживания всей команды синхронизируйте журналы с общим хранилищем:

```bash
# Example: sync to S3 daily
aws s3 sync ~/.claude/logs/ s3://company-claude-logs/$(whoami)/
```

Затем агрегируйте с:

```bash
# Download all team logs
aws s3 sync s3://company-claude-logs/ /tmp/team-logs/

# Combine and analyze
cat /tmp/team-logs/*/activity-$(date +%Y-%m-%d).jsonl | \
  jq -s 'group_by(.project) | map({project: .[0].project, total_tokens: [.[].tokens.total] | add})'
```

### 4. Ротация журналов

Журналы накапливаются с течением времени. Добавьте очистку в cron:

```bash
# Clean logs older than 30 days
find ~/.claude/logs -name "*.jsonl" -mtime +30 -delete
```

### 5. Тестирование устойчивости зависимостей ИИ

**Намеренно имитируйте недоступность ИИ или ухудшение производительности, чтобы убедиться, что команда может продолжать работать без него.** Сбои в работе провайдера, чрезвычайная задержка и низкое качество ответов — это режимы сбоя, которые стоит специально отрепетировать, точно так же, как хаос-инжиниринг репетирует сбои серверов или сетей. Рабочий процесс, который молчаливо предполагает, что ИИ всегда доступен и всегда корректен, проверяет это предположение только в первый раз во время реального инцидента.

*Константин Павлов, Devoxx, 2025*

---

## Ограничения

### <a name="what-this-monitoring-cannot-do"></a>Чего этот мониторинг НЕ МОЖЕТ сделать

| Ограничение | Причина |
|------------|--------|
| **Точное количество токенов** | Claude Code CLI не раскрывает метрики токена API |
| **TTFT (время получения первого токена)** | Хук запускается после завершения работы инструмента, а не во время потоковой передачи |
| **Показатели потоковой передачи в реальном времени** | Нет события перехвата во время генерации ответа |
| **Фактические затраты API** | Оценки токенов являются эвристическими, а не основанными на выставлении счетов. |
| **Выбор модели** | Журнал не фиксирует, какая модель использовалась для каждого запроса. |
| **Использование контекстного окна** | Нет видимости текущего контекста в процентах |

### Примечания по точности

- Оценка **Token**: отклонение ~ 15–25 % от фактического счета.
- **Оценка затрат**: использовать в качестве руководства, а не для учета.
- **Границы сеансов**: сеансы аппроксимируются по идентификатору, а не по точным сеансам API.

### Чему можно доверять

- **Счетчики использования инструментов**: точное количество вызовов каждого инструмента.
- **Шаблоны доступа к файлам**: Какие файлы были затронуты
- **Относительные сравнения**: тенденции Day-to-day/project-to-project
- **Время работы**: Когда использовались инструменты (метка времени)

---

---

## Контрольный список проверки менеджера

Для технических менеджеров и руководителей групп, которым необходимо убедиться, что Claude Code правильно используется в их команде, это практические аудиторские запросы.

### Еженедельная выборочная проверка (5 минут)

```bash
# Did anything unusual happen this week?

# 1. Files accessed outside project scope
find ~/.claude/projects/ -name "*.jsonl" -newer "$(date -d '7 days ago' +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d)" 2>/dev/null | \
  xargs jq -r 'select(.type == "assistant") |
    .message.content[]? |
    select(.type == "tool_use" and .name == "Read") |
    .input.file_path' 2>/dev/null | \
  grep -v "^$(pwd)" | sort -u

# 2. Destructive commands run
find ~/.claude/projects/ -name "*.jsonl" -newer "$(date -d '7 days ago' +%Y-%m-%d 2>/dev/null || date -v-7d +%Y-%m-%d)" 2>/dev/null | \
  xargs jq -r 'select(.type == "assistant") |
    .message.content[]? |
    select(.type == "tool_use" and .name == "Bash") |
    .input.command' 2>/dev/null | \
  grep -iE "(drop|delete|truncate|rm -rf|git push --force)"
```

### Отчетность о соответствии

Для регулируемых сред создайте сводную информацию о деятельности ИИ для аудиторов:

```bash
#!/bin/bash
# Monthly compliance report for Claude Code activity

START_DATE=${1:-$(date -d '30 days ago' +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d)}
END_DATE=${2:-$(date +%Y-%m-%d)}
REPORT_FILE="ai-activity-report-${START_DATE}-${END_DATE}.json"

echo "Generating compliance report: $START_DATE to $END_DATE"

# Count sessions, tool calls, and file accesses
jq -s '{
  report_period: {start: "'"$START_DATE"'", end: "'"$END_DATE"'"},
  tool_usage: (group_by(.tool) | map({tool: .[0].tool, count: length})),
  unique_files_accessed: ([.[].file] | unique | length),
  sessions: ([.[].session_id] | unique | length)
}' ~/.claude/logs/activity-*.jsonl 2>/dev/null > "$REPORT_FILE" || \
  echo "No activity logs found. Set up session-logger.sh hook to enable."

echo "Report saved: $REPORT_FILE"
```

Полную настройку управления с автоматическим ведением журнала аудита см. в разделе [Enterprise AI Governance §6.2](../security/enterprise-governance.md#62-audit-trail-setup).

---

## 10. Агрегация журналов на уровне команды

В разделах выше рассматривается мониторинг отдельных разработчиков. Для команды из более чем 10 разработчиков вам нужны журналы, поступающие в центральное хранилище, чтобы отслеживать общие расходы, отмечать необычные закономерности и отвечать на вопросы о соответствии требованиям.

### Вариант A. Направьте настроенный трафик API через LiteLLM.

В руководстве по шлюзу [API](./api-gateway.md) описывается телеметрия на стороне сервера для клиентов, настроенных с использованием URL-адреса шлюза и виртуального ключа на уровне группы. После этой настройки клиента команде не нужны задания cron для каждого компьютера для сбора метаданных маршрутизируемых запросов. Шлюз по-прежнему отслеживает только трафик, проходящий через него. Использование Claude с аутентификацией по подписке и клиенты, сохраняющие учетные данные прямого поставщика, остаются за пределами этого набора данных.

Для маршрутизируемого трафика API это позволяет избежать синхронизации локальных журналов использования. Приведенный ниже подход JSONL сеанса остается необходимым, когда вам нужны подробности на уровне файлов, например, какие файлы были прочитаны и записаны, а не только телеметрия модели и токена.

### Вариант Б. Отправьте сеанс JSONL в центральное хранилище.

Claude Code записывает журналы сеансов в `~/.claude/projects/**/*.jsonl`. Легкое задание cron или перехватчик PostToolUse могут отправлять новые записи в Loki:

```bash
#!/bin/bash
# Ship new session log entries to Loki
# Add to crontab: */5 * * * * ~/.claude/hooks/ship-logs.sh

LOKI_ENDPOINT="${CENTRAL_LOG_ENDPOINT:-http://loki:3100/loki/api/v1/push}"
TEAM_ID="${CLAUDE_TEAM_ID:-unknown}"
MARKER="/tmp/.claude-last-ship-${USER}"

find ~/.claude/projects -name "*.jsonl" -newer "$MARKER" 2>/dev/null | while read -r f; do
  while IFS= read -r line; do
    curl -s -X POST "$LOKI_ENDPOINT" \
      -H "Content-Type: application/json" \
      -d "{\"streams\":[{\"stream\":{\"app\":\"claude_code\",\"team\":\"$TEAM_ID\",\"user\":\"$(whoami)\"},\"values\":[[\"$(date +%s%N)\",$(echo "$line" | jq -Rs .)]}]}" \
      > /dev/null
  done < "$f"
done
touch "$MARKER"
```

Установите `CLAUDE_TEAM_ID` и `CENTRAL_LOG_ENDPOINT` в профиле оболочки каждого разработчика. Координируйте свои действия с командой вашей платформы, чтобы предоставить конечную точку Loki.

### Конфигурация коллектора OTel

Если вы используете шлюз LiteLLM с экспортом OTel, минимальная конфигурация сборщика для пересылки промежутков в Grafana Tempo:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

processors:
  batch:
    timeout: 5s

exporters:
  otlp:
    endpoint: tempo:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
```

Это передает данные об использовании Claude Code в тот же бэкэнд Tempo, что и трассировки вашего приложения, поэтому вы можете сопоставить сеанс AI с событием развертывания на одной временной шкале.

### Ключевые запросы Grafana

Благодаря метрикам LiteLLM Prometheus и Loki для журналов сеансов три панели охватывают большинство потребностей команды:

```promql
# Daily spend by team (USD)
sum by (team_id) (increase(litellm_spend_total[1d]))

# Request volume by model
sum by (model) (rate(litellm_requests_total[1h]))

# Budget headroom (fraction remaining per team)
1 - (litellm_spend_total / litellm_budget_limit)
```

---

## <a name="related-resources"></a>Связанные ресурсы

- [AI Шаблоны проектирования: источник событий](../core/ai-design-patterns.md#event-sourcing) — расшифровка возобновляет диалог, но не перестраивает файлы, ветки или службы
- [Session Search Script](../../examples/scripts/session-search.sh) - Быстрый поиск и возобновление сеанса
- [Перехватчик регистрации сеансов](../../examples/hooks/bash/session-logger.sh)
- [Скрипт анализа статистики](../../examples/scripts/session-stats.sh)
- [Enterprise AI Governance](../security/enterprise-governance.md) — управление на уровне организации, журналы аудита, соответствие требованиям
- [Сторонние инструменты](../ecosystem/third-party-tools.md) — графические интерфейсы сообщества, TUI и информационные панели (ccusage, ccburn, claude-code-viewer)
- [Руководство по конфиденциальности данных](../security/data-privacy.md) — какие данные покидают ваш компьютер
- [Оптимизация затрат](#cost-optimization-tips) – Советы по сокращению расходов
