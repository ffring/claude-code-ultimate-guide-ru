# Стартер сеанса ICM
> Вставьте это в начало любого сеанса Claude Code, чтобы активировать контекст ICM.
> Требуется установленный и настроенный ICM: `brew tap rtk-ai/tap && brew install icm`
> тогда `icm init --mode mcp && icm init --mode hook && icm init --mode skill`

---

# Контекст: ICM (бесконечная контекстная память), активная в этом сеансе.

ICM установлен и настроен на этом компьютере. Используйте его для хранения и извлечения постоянных
память между сеансами, минуя ограничения контекстного окна.

## Доступные инструменты MCP

Сервер `icm` MCP запущен. У вас есть доступ к 22 инструментам `icm_*` для хранения,
вспоминание и управление постоянной памятью.

**Direct CLI** (при необходимости через Bash):

```bash
# Store a memory
icm store --topic "<project-slug>" --content "<fact>" --importance high|medium|low|critical

# Recall by semantic query
icm recall "<natural language query>"

# Inspect
icm stats          # count, topics, avg weight
icm topics         # list all topics
icm list           # list recent memories

# Manage
icm forget <id>    # delete by ID
icm decay          # apply temporal decay
icm prune          # remove low-weight entries
```

**Важно (синтаксис версии 0.5.0)**:
- `--importance` — это перечисление: `critical / high / medium / low` — не число с плавающей запятой
- Нет подкоманды `memory` — используйте `icm store`, `icm recall` напрямую.
- Граф постоянных знаний: `icm memoir` (отдельный слой, без распада)

## Слэш-команды

- `/recall <query>` — поиск в памяти ICM
- `/remember <content>` — сохранить память в ICM

## Как работают воспоминания

Два слоя:
- **Memories** (эпизодический): записи с временной меткой и временным затуханием в зависимости от важности.
  Важность `critical` никогда не снижается. `low` со временем тускнеет.
- **Memoir** (семантика): постоянный граф знаний с типизированными отношениями.
  (`depends_on`, `contradicts`, `superseded_by`, `part_of` и еще 5).

Поиск гибридный: полнотекстовый BM25 (30%) + векторное сходство (70%).

Перехват `PostToolUse` запускается автоматически — при каждом вызове N инструмента ICM извлекает контекст.
и сохраняет его без каких-либо явных действий с вашей стороны.

## Рекомендуемое использование в этом сеансе

```bash
# At session start — recall relevant context
icm recall "<current feature or topic>"

# When making a key decision
icm store --topic "<project>" --content "<decision and rationale>" --importance high

# For permanent architectural facts
icm memoir add-concept -m "<project>" -n "<concept>"
```

## Расположение базы данных

`~/Library/Application Support/dev.icm.icm/memories.db`
