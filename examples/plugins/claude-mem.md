---
title: "Шаблон плагина claude-mem"
description: "Автоматический плагин постоянной памяти, фиксирующий вызовы инструментов и решения во время сеансов"
tags: [plugin, memory, integration]
---

# Шаблон плагина Claude-Mem

**Purpose**: автоматическая постоянная память во время сеансов Claude Code.
**Репозиторий**: https://github.com/thedotmack/claude-mem
**Type**: Официальный плагин (26,5 тыс.+ звезд)
**Версия**: v10.6.3
**License**: AGPL-3.0 + PolyForm для некоммерческого использования

---

## Что он делает

claude-mem автоматически записывает **все, что Claude делает** во время сеансов кодирования:
- Вызовы инструментов (Read, Edit, Bash, Grep и т. д.)
- Наблюдения и открытия
- Архитектурные решения
- Модификации файлов

Затем **разумно вставляет** соответствующий контекст при повторном подключении к проекту.

**Result**: Больше никаких вопросов «что мы делали в прошлый раз?» → Claude помнит.

---

## Установка

### Через магазин плагинов (рекомендуется)

```bash
# Add marketplace
/plugin marketplace add thedotmack/claude-mem

# Install plugin
/plugin install claude-mem

# Restart Claude Code
exit
claude
```

### Ручная установка

```bash
# Requires Bun runtime (not Node) — install first if needed:
# curl -fsSL https://bun.sh/install | bash

# Clone repository
git clone https://github.com/thedotmack/claude-mem.git ~/.claude/plugins/claude-mem

# Install dependencies
cd ~/.claude/plugins/claude-mem
bun install

# Restart Claude Code
```

> **Dependency**: рабочий процесс claude-mem работает на [Bun](https://bun.sh), а не на Node. Если у вас установлен только Node, сначала установите Bun. Без него воркер не запустится и сессии не будут перехвачены (fail-open — Claude Code продолжает работать, только без захвата памяти).

---

## Конфигурация

### Конфигурация по умолчанию

claude-mem работает с **«из коробки»** с разумными настройками по умолчанию:

```json
{
  "worker": {
    "port": 37777,
    "host": "127.0.0.1"
  },
  "storage": {
    "location": "~/.claude-mem/claude-mem.db",
    "backend": "sqlite"
  },
  "indexation": {
    "provider": "chroma",
    "embeddings": "claude"
  },
  "privacy": {
    "excludeTags": ["<private>", "</private>"]
  }
}
```

> ⚠️ **Security**: Всегда используйте `host: "127.0.0.1"`, а не `"0.0.0.0"`. Конечная точка `GET /api/settings` возвращает ключи API в виде обычного текста — любой локальный процесс (расширение браузера, пакет npm) может его прочитать. Привязка только к локальному хосту уменьшает поверхность атаки, но не устраняет ее на общих машинах.

### Пользовательская конфигурация

Создайте `~/.claude-mem/config.json`:

```json
{
  "worker": {
    "port": 38888,
    "host": "localhost"
  },
  "compression": {
    "enabled": true,
    "summaryLength": "medium"
  },
  "privacy": {
    "excludeTags": ["<private>", "</private>", "<secret>", "</secret>"],
    "autoDetectSecrets": false
  },
  "storage": {
    "maxObservations": 10000,
    "retentionDays": 90
  }
}
```

**Options**:

| Вариант | Ценности | Описание |
|--------|--------|-------------|
| `compression.enabled` | true/false | Включить сжатие AI (по умолчанию: true) |
| `compression.summaryLength` | short/medium/long | Подробность сводки |
| `privacy.autoDetectSecrets` | true/false | Автоматическое определение ключей API (по умолчанию: false) |
| `storage.maxObservations` | число | Максимальное количество наблюдений для хранения |
| `storage.retentionDays` | число | Автоматическое удаление через N дней |

---

## Использование

### Автоматический захват (поведение по умолчанию)

**Команды не нужны**: claude-mem автоматически:

1. Использование инструмента **Captures** через перехватчики жизненного цикла
2. **Сжимает наблюдения** со сводками AI.
3. **Indexes** через базу данных векторов Chroma
4. **Injects** соответствующий контекст в начале сеанса

**Пример потока сеанса**:

```
Session 1 (Day 1):
User: "Explore auth module"
Claude: [Reads auth.service.ts, session.middleware.ts]
claude-mem: [Captures] "Auth exploration: JWT validation, session middleware"

Session 2 (Day 2):
Claude: [Auto-injected]
"Previously: Explored auth module.
 Files: auth.service.ts, session.middleware.ts
 Key finding: JWT validation in validateToken()"
User: "Refactor auth to use jose library"
Claude: [Already has context, no re-reading]
```

---

### Доступные навыки

Claude-mem предлагает 5 навыков, доступных через `/claude-mem:<skill>`:

| Навык | Курок | Вариант использования |
|-------|---------|----------|
| `mem-search` | «Как мы исправили X?» | Поиск истории сеансов по естественному языку |
| `smart-explore` | «Изучите модуль аутентификации» | Навигация по коду на основе AST (с использованием токенов) |
| `make-plan` | «Запланируйте рефакторинг Y» | План поэтапного внедрения с документацией |
| `do` | «Выполнить план» | Запускает вывод `make-plan` через субагентов. |
| `timeline-report` | «Покажи мое путешествие» | Повествовательный отчет о полной истории проекта |

### Поиск на естественном языке (навык `mem-search`)

Выполните поиск в истории сеансов, используя естественный язык:

```bash
# Search for specific topics
"Search my memory for authentication decisions"
"What files did we modify for the payment bug?"
"Remind me why we chose Zod over Yup"
"Show me all sessions where we worked on the API"
```

Навык возвращается:
- Сопоставление сессий с подведением итогов
- Соответствующие наблюдения (введите: ОБНАРУЖЕНИЕ/ИЗМЕНЕНИЕ/ФУНКЦИЯ/ИСПРАВЛЕНИЕ ОШИБКИ)
- История изменений файлов
- Архитектурные решения

---

### Веб-панель

Доступ к пользовательскому интерфейсу в реальном времени по адресу `http://localhost:37777`:

```bash
# Open dashboard
open http://localhost:37777

# Features:
# - Timeline view (all sessions chronologically)
# - Natural language search bar
# - Observation details (tool calls + results)
# - Session statistics (duration, tool usage, files modified)
# - Export/import functionality
```

**Разделы панели управления**:

| Раздел | Описание |
|---------|-------------|
| **Временная шкала** | Хронологический просмотр всех сессий |
| **Поиск** | Интерфейс запросов на естественном языке |
| **Сеансы** | Просмотр списка с фильтрами |
| **Статистика** | Аналитика использования и тенденции |
| **Настройки** | Контроль конфиденциальности, управление хранилищем |

---

### Контроль конфиденциальности

#### Использование тегов `<private>`

```markdown
<!-- In your prompts -->
Modify the database connection to use:
<private>
Host: prod-db-123.aws.com
Username: admin
Password: super-secret-password
API Key: sk-1234567890abcdef
</private>

<!-- claude-mem excludes content between <private> tags -->
```

#### Исключение наблюдений вручную

```bash
# Delete specific observation
curl -X DELETE http://localhost:37777/api/observations/obs_123

# Clear all observations for a session
curl -X DELETE http://localhost:37777/api/sessions/session_456/observations
```

#### Расположение данных

```bash
# Database location
~/.claude-mem/claude-mem.db

# Chroma index
~/.claude-mem/chroma/

# View database size
du -sh ~/.claude-mem/
```

---

## Расширенные функции

### <a name="progressive-disclosure"></a>Прогрессивное раскрытие информации

claude-mem использует трехуровневый подход для минимизации токенов:

```
Layer 1: Search (50-100 tokens)
├─ Query: "Find authentication work"
├─ Returns: 5 session summaries
│
Layer 2: Timeline (500-1000 tokens)
├─ Query: "Show session abc123 timeline"
├─ Returns: Observation list
│
Layer 3: Details (full context)
└─ Query: "Get observation obs_456 details"
    Returns: Complete tool call + result
```

**Экономия токенов**: сокращение примерно в 10 раз по сравнению с загрузкой полной истории.

---

### Бесконечный режим (бета)

Экспериментальная функция для расширенных сеансов:

```bash
# Enable in config
{
  "experimental": {
    "endlessMode": true
  }
}
```

**Claims** (независимо проверено):
- ~95% уменьшение контекста
- В 20 раз больше вызовов инструментов, прежде чем будут достигнуты пределы
- Агрессивное сжатие + умное суммирование

⚠️ **Note**: бета-функция, используйте с осторожностью в рабочей среде.

---

### Export/import

**Экспорт истории сеансов**:

```bash
# Via dashboard
http://localhost:37777/export

# Via CLI
curl http://localhost:37777/api/export > claude-mem-backup.json
```

**Импортировать на другую машину**:

```bash
# Via dashboard
http://localhost:37777/import

# Via CLI
curl -X POST http://localhost:37777/api/import \
  -H "Content-Type: application/json" \
  -d @claude-mem-backup.json
```

---

## Соображения стоимости

### Стоимость сжатия API

| Уровень использования | Sessions/Month | Наблюдения | Стандартное восточное время. Стоимость (Claude Haiku) | Стандартное восточное время. Стоимость (Gemini Lite) |
|-------------|----------------|--------------|--------------------------|-------------------------|
| **Light** | 10-20 | 200-400 | $0.30-0.60 | ~$0.05 |
| **Средний** | 50-80 | 1000-1600 | $1.50-2.40 | ~$0.20 |
| **Тяжелый** | 100-150 | 2000-3000 | $3.00-4.50 | ~$0.45 |
| **Очень тяжелый** | ~400 сеансов | ~8000 | ~$102 | ~$14 |

**Formula**: ~0,15 доллара за 100 наблюдений (Claude Haiku) против ~0,02 доллара (Gemini 2.5 Flash Lite)

**Перейдите на Gemini за -86% стоимости**:

```json
// ~/.claude-mem/settings.json
{
  "provider": "gemini",
  "model": "gemini-2.5-flash-lite",
  "auth_method": "cli"
}
```

> Компромисс **Flash против Flash Lite**: Gemini 2.5 Flash Lite стоит дешевле, но генерирует более слабые сводки. Для большинства проектов это приемлемо. Для сложных и длительных проектов, где важна точность внедрения контекста, рассмотрите Gemini 2.5 Flash (не Lite).

**Дальнейшее снижение затрат (пакетирование)**:

```json
{
  "compression": {
    "batchSize": 50,
    "interval": "hourly"
  }
}
```

Пакетное сжатие (ежечасно) уменьшает количество вызовов API по сравнению со сжатием для каждого наблюдения.

---

### Затраты на хранение

**Локальное хранилище** (SQLite + Chroma):

| Уровень использования | Хранилище |
|-------------|---------|
| **Light** (10 sessions/week) | 10-20 MB/month |
| **Средний** (50 sessions/week) | 50-100 MB/month |
| **Тяжелый** (100 sessions/week) | 100-200 MB/month |

**Стратегии очистки**:

```json
{
  "storage": {
    "retentionDays": 90,
    "autoCleanup": true
  }
}
```

---

## <a name="troubleshooting"></a>Поиск неисправностей

### Панель управления не загружается

```bash
# Check if worker is running
curl http://localhost:37777/health
# Expected: {"status":"ok"}

# Restart worker
claude-mem restart

# Check logs
tail -f ~/.claude-mem/logs/worker.log
```

---

### Высокие затраты API

```bash
# Check observation count
curl http://localhost:37777/api/stats
# Returns: {"observations": 5234, "sessions": 123}

# If too many observations:
# 1. Enable batching
# 2. Increase compression interval
# 3. Lower retention days
```

---

### Память не вставлена

```bash
# Verify indexation
curl http://localhost:37777/api/index/status
# Expected: {"indexed": true, "observations": 1234}

# Manually trigger re-indexation
curl -X POST http://localhost:37777/api/index/rebuild
```

---

### Повреждение базы данных

```bash
# Backup first
cp ~/.claude-mem/claude-mem.db ~/.claude-mem/claude-mem.db.backup

# Rebuild index
claude-mem index rebuild

# If still broken, reset (⚠️ loses all data)
rm -rf ~/.claude-mem/
claude-mem init
```

---

## Вопросы лицензирования

### AGPL-3.0

**Что это значит**:

- ✅ Бесплатно для личного использования.
- ✅ Бесплатно для проектов с открытым исходным кодом
- ⚠️ Использование сети = необходимо раскрыть источник
- ⚠️ Модификации = необходимо раскрыть источник
- ❌ Невозможно использовать в SaaS с закрытым исходным кодом без соблюдения требований.

**Коммерческое использование**:

При использовании в коммерческом продукте:
1. Ознакомьтесь с требованиями AGPL-3.0.
2. Учитывайте соблюдение законодательства
3. Альтернатива: свяжитесь с автором для получения коммерческой лицензии.

**PolyForm Noncommercial** (каталог ragtime/):
- Отдельная лицензия на отдельные компоненты
- Более строгие коммерческие ограничения

---

## Когда использовать claude-mem

### ✅ Используйте, когда:

- Многосессионные проекты (>1 недели)
- Необходимо помнить решения по days/weeks
- Частое повторное подключение к одному и тому же проекту
- Автоматический сбор преимуществ по сравнению с ведением заметок вручную
- Хотите веб-панель для исследования

### ❌ Не используйте, если:

- Разовые быстрые задачи (<10 минут)
- Чрезвычайно конфиденциальные данные (вместо этого рассмотрите ручную Серену)
- Коммерческие проекты без проверки соответствия AGPL
- Требуется межмашинная синхронизация (не поддерживается изначально)
- Бюджетные ограничения (<$5/month для сжатия API)

---

## Сравнение с альтернативами

| Инструмент | Цель | Захватывать | Запрос |
|------|---------|---------|-------|
| **claude-mem** | Сеансовая память | Авто (хуки) | Естественный язык |
| **Серена** | Память символов | Руководство (`write_memory`) | Ключевой поиск |
| **grepai** | Семантический поиск | N/A (только поиск) | Семантический |
| **CLAUDE.md** | Контекст проекта | Руководство (запись файла) | Claude читает при запуске |

**Лучше всего использовать вместе**:
- claude-mem: автоматический захват сеанса
- Серена: архитектурные решения вручную
- grepai: обнаружение кода
- CLAUDE.md: Рекомендации по проекту

---

## <a name="resources"></a>Ресурсы

**Official**:
- [GitHub Репозиторий](https://github.com/thedotmack/claude-mem)
- [Документация](https://github.com/thedotmack/claude-mem/wiki)
- [Примечания к выпуску](https://github.com/thedotmack/claude-mem/releases)

**Guides**:
- [Corti.com: глубокое погружение](https://corti.com/claude-mem-persistent-memory-for-ai-coding-assistants/)
- [yuv.ai: Руководство по установке](https://yuv.ai/blog/claude-mem)
- [YouTube: установка за 5 минут](https://www.youtube.com/watch?v=ryqpGVWRQxA)

**Community**:
- Проблемы [GitHub](https://github.com/thedotmack/claude-mem/issues)
- [GitHub Обсуждения](https://github.com/thedotmack/claude-mem/discussions)

---

**Версия шаблона**: 1.1.0
**Последнее обновление**: 30 марта 2026 г.
**Версия руководства**: 3.38.1
