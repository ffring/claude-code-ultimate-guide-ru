# Трекер упоминаний в СМИ

Отслеживает все внешние источники, в которых упоминается полное руководство Claude Code (GitHub или cc.bruniaux.com).

Этот файл остается специфичным для руководства. Публичный межпроектный каталог, включая Cowork, StarMapper,
CCBoard, CC-Copilot Bridge, ctxharness, Dep Scope, flow-lean, плагины GSC MCP и Claude Code, живут в
`src/data/mentions.json` в репозитории портфолио и опубликован по адресу
`https://www.florian.bruniaux.com/mentions/`. RTK по своей природе находится за пределами этого каталога.

## Источник истины

- `mentions.yaml`: одна запись на каждое подтвержденное упоминание.
- `review-queue.yaml`: недоступные кандидаты и отклоненные ложные срабатывания сохраняются для будущей дедупликации.

## Схема

```yaml
- id: "001"                  # Sequential, zero-padded
  platform: article          # article | reddit | linkedin-own | linkedin-other | twitter | directory | instagram | podcast | forum | video | translation
  url: "https://..."
  title: "..."
  author: "..."              # Handle, name, or publication name. Use "unknown" if not found.
  date: "YYYY-MM-DD"         # Publication date, or null if unknown
  angle: "..."               # One sentence: how they framed the guide
  reach: unknown             # low (<1K) | medium (1K-10K) | high (10K-100K) | viral (100K+) | unknown | null (own property)
  status: active             # active | dead | paywall
  notes: "..."               # Optional. Anything worth remembering (quote, context, SEO value).
  first_seen: "YYYY-MM-DD"   # Date we logged it
```

## Добавление нового упоминания

1. Добавьте запись в `mentions.yaml` со следующим последовательным идентификатором.
2. Обновите `meta.total_mentions` и `meta.last_updated`.
3. Зафиксировать: `docs: add media mention: [platform] [author/publication]`

## Слэш-команда

`/track-mention <url>` еще не реализован. Добавляйте пока вручную.

## Статистика (по состоянию на 31 августа 2026 г.)

| Платформа | Считать |
|---|---|
| Статьи/блоги | 12 |
| Видео (YouTube) | 2 |
| Подкасты | 1 |
| Реддит | 4 |
| LinkedIn (собственный) | 2 |
| LinkedIn (сторонний) | 7 |
| Твиттер / Х | 3 |
| Инстаграм | 1 |
| Каталоги/реестры | 14 |
| Форумы (HN) | 1 |
| Переводы/адаптации | 2 |
| **Итого** | **49** |

Среди 49 отслеживаемых ссылок есть 2 сообщения от Флориана Бруньо. Поэтому каталог путеводителей содержит
47 сторонних ссылок: 32 упоминания в редакционных статьях или сообществах, 2 перевода и 13 справочников.
записи. Автоматизированные индексы — это сигналы открытий, а не независимые подтверждения. Каталог портфолио
синхронизируется отдельно и может временно отставать от этого источника при одновременной работе.

### Языки обнаружены

| Язык | Упоминания |
|---|---|
| Английский | 39 |
| Французский | 3 |
| испанский | 2 |
| корейский | 1 |
| китайский | 2 |
| Украинский | 1 |
| Неизвестный | 1 |

## Слэш-команда

Запустите `/track-mentions` для поиска новых упоминаний через Perplexity и автоматически обновите этот файл.

Для автоматических запусков используйте `/track-mentions --scheduled`. В этом режиме создается только отчет-кандидат:
он не должен изменять каталог или создавать фиксацию. Точная процедура подсказки и проверки Perplexity
живу в `perplexity-scheduled-search.md`.

Проверяйте каталог и очередь проверки после каждого принятого обновления:

```bash
python3 scripts/check-media-mentions.py
```
