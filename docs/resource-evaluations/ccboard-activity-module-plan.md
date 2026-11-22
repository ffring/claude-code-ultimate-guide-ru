# Модуль деятельности ccboard: План реализации

**Дата**: 21 февраля 2026 г.
**Status**: Черновик
**Целевой репозиторий**: [ccboard](https://github.com/FlorianBruniaux/ccboard)
**По инициативе**: Вопрос пользователя по мониторингу активности Claude Code file/command/network

---

## Контекст

ccboard в настоящее время охватывает управление сеансами, отслеживание затрат и базовую статистику. Недостающий слой — это *аудит деятельности*: какие файлы делал Claude Code читал, какие команды он выполнял, какие URL-адреса получал?

Файлы JSONL сеанса уже содержат эти данные — каждый блок `tool_use` в сообщениях `type: "assistant"` представляет собой полную запись действий Claude Code. Модуль «Активность» анализирует их и отображает на специальной вкладке 10.

---

## Архитектура

### Новые файлы

```
ccboard-core/
├── src/
│   ├── parsers/
│   │   └── activity.rs          # Parse tool_use blocks from JSONL
│   └── models/
│       └── activity.rs          # Structs: ToolCall, FileAccess, BashCommand, NetworkCall, Alert

ccboard-tui/
└── src/
    └── tabs/
        └── activity.rs          # Tab 10 — TUI rendering

ccboard-web/
└── src/
    └── pages/
        └── activity.rs          # /activity route — Web UI rendering
```

### Измененные файлы

```
ccboard-core/src/db/schema.rs    # Add activity_events table
ccboard-core/src/db/queries.rs   # Add activity query functions
ccboard-tui/src/app.rs           # Register Tab 10
ccboard-web/src/router.rs        # Register /activity route
```

---

## Модели данных

```rust
// ccboard-core/src/models/activity.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCall {
    pub id: String,
    pub session_id: String,
    pub timestamp: DateTime<Utc>,
    pub tool_name: String,
    pub input: serde_json::Value,
    pub duration_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileAccess {
    pub session_id: String,
    pub timestamp: DateTime<Utc>,
    pub path: String,
    pub operation: FileOperation,   // Read | Write | Edit | Glob | Grep
    pub line_range: Option<(usize, usize)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FileOperation {
    Read,
    Write,
    Edit,
    Glob,
    Grep,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BashCommand {
    pub session_id: String,
    pub timestamp: DateTime<Utc>,
    pub command: String,
    pub is_destructive: bool,       // Heuristic: rm -rf, git push --force, etc.
    pub output_preview: String,     // First 200 chars of output
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkCall {
    pub session_id: String,
    pub timestamp: DateTime<Utc>,
    pub url: String,
    pub tool: NetworkTool,          // WebFetch | WebSearch | McpCall
    pub domain: String,             // Extracted from URL
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkTool {
    WebFetch,
    WebSearch,
    McpCall { server: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Alert {
    pub session_id: String,
    pub timestamp: DateTime<Utc>,
    pub severity: AlertSeverity,
    pub category: AlertCategory,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertCategory {
    CredentialAccess,    // .env, *.pem, id_rsa
    DestructiveCommand,  // rm -rf, git push --force, DROP TABLE
    ExternalExfil,       // WebFetch to unknown domain
    ScopeViolation,      // Write outside project root
    ForcePush,           // git push --force
}
```

---

## Парсер

```rust
// ccboard-core/src/parsers/activity.rs

pub fn parse_tool_calls(session_jsonl: &Path) -> Result<Vec<ToolCall>> {
    // 1. Stream-read JSONL (don't load entire file)
    // 2. Filter lines where .type == "assistant"
    // 3. Extract .message.content[].type == "tool_use" blocks
    // 4. Map to ToolCall structs
    // 5. Return Vec<ToolCall>
}

pub fn classify_tool_calls(calls: Vec<ToolCall>) -> ActivitySummary {
    // Fan out into typed collections
    ActivitySummary {
        file_accesses: extract_file_accesses(&calls),
        bash_commands: extract_bash_commands(&calls),
        network_calls: extract_network_calls(&calls),
        alerts: generate_alerts(&calls),
    }
}

fn is_destructive_command(cmd: &str) -> bool {
    let patterns = [
        "rm -rf", "rm -r ", "git push --force", "git push -f",
        "DROP TABLE", "DROP DATABASE", "truncate ", "git reset --hard",
        "git clean -f", "pkill", "kill -9",
    ];
    patterns.iter().any(|p| cmd.to_lowercase().contains(p))
}

fn is_sensitive_file(path: &str) -> bool {
    let patterns = [".env", ".pem", "id_rsa", "id_ed25519", ".p12",
                    "secrets.json", "credentials.json", ".npmrc", ".netrc"];
    patterns.iter().any(|p| path.contains(p))
}
```

---

## Схема SQLite

```sql
-- Add to ccboard-core/src/db/schema.rs migrations

CREATE TABLE IF NOT EXISTS activity_events (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL,
    timestamp   TEXT NOT NULL,
    tool_name   TEXT NOT NULL,
    input_json  TEXT NOT NULL,      -- Full tool input as JSON
    duration_ms INTEGER,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_activity_session ON activity_events(session_id);
CREATE INDEX IF NOT EXISTS idx_activity_tool    ON activity_events(tool_name);
CREATE INDEX IF NOT EXISTS idx_activity_ts      ON activity_events(timestamp);

CREATE TABLE IF NOT EXISTS activity_alerts (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL,
    timestamp   TEXT NOT NULL,
    severity    TEXT NOT NULL,      -- 'info' | 'warning' | 'critical'
    category    TEXT NOT NULL,
    detail      TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
);
```

---

## Вкладка TUI (вкладка 10)

### Макет

```
┌─ Activity ─────────────────────────────────────────────────────────┐
│ Session: my-project / 2026-02-21 14:32  [←][→] navigate sessions  │
├─────────────────────────────────────────────────────────────────────┤
│ [Files 47] [Commands 12] [Network 3] [Alerts ⚠ 2] [Timeline]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FILES                                                               │
│  14:32:01  READ   src/main.rs                                       │
│  14:32:04  READ   src/lib.rs                                        │
│  14:32:09  EDIT   src/main.rs          ← lines 45-67               │
│  14:32:15  WRITE  src/new_module.rs                                 │
│  14:32:20  READ   ⚠ .env              ← credential access          │
│                                                                      │
│  [j/k scroll] [Enter: expand] [f: filter] [a: alerts only]         │
└─────────────────────────────────────────────────────────────────────┘
```

### Вкладки в активности

| Sub-tab | Ключ | Содержание |
|---------|-----|---------|
| Файлы | `1` | Файл reads/writes/edits с путем, меткой времени и диапазоном строк. |
| Команды | `2` | Команды Bash, флаг разрушения, предварительный просмотр вывода |
| Сеть | `3` | URL-адреса WebFetch, вызовы MCP, список доменов |
| Оповещения | `4` | События с автоматической пометкой по серьезности |
| Хронология | `5` | Хронологический просмотр всех действий (объединен) |

### Сочетания клавиш

| Ключ | Действие |
|-----|--------|
| `Tab` / `Shift+Tab` | Переключить вложенные вкладки |
| `j` / `k` | Прокрутить список |
| `Enter` | Развернуть элемент (полная команда/полный путь/предварительный просмотр ответа) |
| `f` | Фильтровать по шаблону |
| `a` | Перейти на подвкладку «Оповещения» |
| `s` | Перейти к выбору сеанса |
| `/` | Поиск в текущем представлении |
| `y` | Скопировать выбранный элемент в буфер обмена |
| `e` | Экспортировать текущий вид в JSON |

---

## Страница веб-интерфейса (/activity)

```
GET /activity                    → Session picker → redirect to /activity?session=ID
GET /activity?session=ID         → Full activity view for session
GET /activity?session=ID&tab=files
GET /activity?session=ID&tab=commands
GET /activity?session=ID&tab=network
GET /activity?session=ID&tab=alerts
GET /activity?session=ID&tab=timeline

GET /api/activity/:session_id              → Full ActivitySummary JSON
GET /api/activity/:session_id/files        → Vec<FileAccess>
GET /api/activity/:session_id/commands     → Vec<BashCommand>
GET /api/activity/:session_id/network      → Vec<NetworkCall>
GET /api/activity/:session_id/alerts       → Vec<Alert>
GET /api/activity/:session_id/timeline     → Vec<ToolCall> sorted by timestamp
```

---

## Правила обнаружения оповещений

| Правило | Состояние | Серьезность |
|------|-----------|----------|
| Доступ к файлу учетных данных | Путь `Read` соответствует `*.env`, `*.pem`, `id_rsa`, `id_ed25519`, `secrets.json` | Предупреждение |
| Разрушительная команда bash | Вход `Bash` соответствует `rm -rf`, `git push --force`, `DROP TABLE`, `git reset --hard` | Критический |
| Силовой толчок | Вход `Bash` содержит `git push` с флагом `--force` или `-f`. | Критический |
| Получение внешнего URL-адреса | `WebFetch` URL-домен не входит в известные домены проекта. | Информация |
| Запись вне корня проекта | Путь `Write`/`Edit` находится за пределами `$PWD` в начале сеанса. | Предупреждение |
| Запись большого файла | Размер содержимого `Write` > 100 КБ | Информация |
| Секреты вывода bash | Предварительный просмотр вывода `Bash` соответствует `sk-`, `ghp_`, `AKIA` (префикс ключа AWS) | Критический |

Оповещения генерируются во время анализа и сохраняются в `activity_alerts`. Они делают **not** блок Claude Code — ccboard доступен только для чтения.

---

## Ограничения производительности

### Требования

- Время запуска: < 2 с для более чем 1000 сеансов (так же, как и текущая гарантия ccboard)
- Анализ JSONL: ленивый — анализируется только при выборе сеанса, а не при запуске.
- Кэш SQLite: анализ один раз, кеширование `activity_events` по session_id + mtime. Недействителен при изменении файла.
- Память: построчная потоковая передача JSONL, никогда не загружайте полный файл.

### Стратегия кэширования

```
Session selected
    → Check SQLite: activity_events WHERE session_id = ? AND mtime = file_mtime
    → Cache hit: return from DB (< 10ms)
    → Cache miss: parse JSONL → insert to DB → return (< 500ms for typical session)
```

### Индексная стратегия

Индекс активности синтаксического анализа (количество инструментов, количество предупреждений) при запуске вместе с метаданными сеанса — тот же шаблон отложенного индекса, который используется для списка сеансов. Полная информация только по запросу.

```
Startup:
    For each session: read first/last line only → session metadata
    Do NOT parse tool_use blocks

On session select:
    Check SQLite cache → parse if stale → display
```

---

## Этапы реализации

### Этап 1: Парсер + Модели (1-2 дня)

- [ ] Модели `activity.rs`
- [ ] Парсер `activity.rs` (поток JSONL, экстракт Tool_use)
- [ ] Правила обнаружения оповещений
- [ ] Модульные тесты для парсера с файлами JSONL фиксации

### Этап 2. Интеграция SQLite (1 день)

- [ ] Миграция схемы
- [ ] Запросы к кешу (вставка/выбор/аннулирование)
- [ ] Тест: 1000 сеансов холодного запуска.

### Этап 3: вкладка TUI (2–3 дня)

- [ ] Регистрация вкладки 10 в `app.rs`
- [ ] Рендеринг подвкладки «Файлы»
- [ ] Отрисовка подвкладки команд
- [ ] Рендеринг сетевых вкладок
- [ ] Отрисовка подвкладки «Оповещения»
- [ ] Рендеринг подвкладки временной шкалы
- [ ] Сочетания клавиш

### Этап 4. Веб-интерфейс (1–2 дня)

- [ ] Конечные точки API
- [ ] Маршрутизация страниц /activity
- [ ] HTML-рендеринг (тот же стиль, что и существующие страницы)

### Этап 5: Польский (1 день)

- [ ] Экспорт в JSON (ключ `e` в TUI)
- [ ] Копия из буфера обмена (клавиша `y`)
- [ ] Фильтр (ключ `f`)
- [ ] Обновление документации в ccboard README

---

## Вне области действия

- **Мониторинг в реальном времени** (наблюдение за сеансом в реальном времени) — будущий этап
- **Агрегация между сеансами** (например, «все файлы, прочитанные на этой неделе») — будущий этап
- **Уведомления об оповещениях** (уведомления desktop/Slack) — будущий этап
- **Правила блокировки** (ccboard остается доступным только для чтения, без взаимодействия с процессом Claude Code)

---

## Связанный

- `guide/ops/observability.md` — Раздел «Мониторинг активности» и «Инструменты внешнего мониторинга»
- `guide/security/data-privacy.md` — Что покидает вашу машину и почему
- ccboard README — Руководство по архитектуре и вкладу
