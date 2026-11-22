# Машиночитаемые ссылки

Файлы, оптимизированные для использования LLM/AI. Числовые размеры округляются от байтов текущего файла (КиБ). В оценках токенов используются символы, разделенные на четыре, в качестве грубой эвристики бюджетирования, а не подсчета токенов для конкретной модели.

## Содержание

| Файл | Описание | Размер | Стандартное восточное время. жетоны |
|------|-------------|------|-------------|
| [reference.yaml](./reference.yaml) | Главный индекс: пути к файлам, привязки разделов и номера строк в `guide/ultimate-guide.md` и тематических руководствах. Также содержит деревья решений, ссылки на CLI и окружение, настройки разрешений и MCP, шаблоны агентов и навыков, поток вопросов для адаптации. | ~304 КиБ | ~76K |
| [claude-code-releases.yaml](./claude-code-releases.yaml) | Краткая история официальных выпусков Claude Code: основные сведения о каждой версии, `breaking_summary` сгруппированы по категориям, краткий справочник `milestones`. Источник истины для `guide/core/claude-code-releases.md`. | ~170 КиБ | ~43K |
| [cowork-reference.yaml](./cowork-reference.yaml) | Индекс для Claude Cowork (Claude Desktop, аудитория, не связанная с разработчиками). Пути разрешаются в специальном репозитории [claude-cowork-guide](https://github.com/FlorianBruniaux/claude-cowork-guide), а не в этом. | ~21 КиБ | ~4K |
| [agentsec-security-feed.v1.json](./agentsec-security-feed.v1.json) | Метаданные базы данных AgentSec, охват детекторов, счетчики безопасности и проверенные описания инцидентов, использованные при посадке. | ~125 КиБ | ~32K |
| [agent-harnesses.json](./agent-harnesses.json) | Неизменяемая нормализованная карта обвязки агента: закрепленный снимок восходящего потока на 160 проектов, 33 дополнения к руководствам, 42 строгих среды выполнения, 16 смежных плоскостей управления, состояния свидетельств и URL-адреса проектов. | Сгенерировано | Сгенерировано |
| `agent-harnesses-github.json` | Дополнительная рассмотренная дополнительная программа наблюдения GitHub: звезды, состояние архива, язык, сигнал SPDX, временная метка ветвления и отправки, привязанная к контрольной сумме каталога. Он не фиксируется до тех пор, пока не будет повышена полная проверенная коллекция. | Неустойчивый | Неустойчивый |
| [agent-harnesses-github.schema.json](./agent-harnesses-github.schema.json) | JSON Схема для энергозависимой коляски наблюдения GitHub. | Сгенерировано | N/A |
| [agent-harnesses.schema.json](./agent-harnesses.schema.json) | JSON Схема для проверки нормализованного каталога жгутов перед публикацией. | Сгенерировано | N/A |
| [translations.json](./translations.json) | Датированный реестр канонических, поддерживаемых проектом и общественных изданий: URL-адреса, сопровождающие, статус, фиксации источников, атрибуция, охват, закрепленная задержка и корни двуязычных публикаций. | ~11 КиБ | ~3K |
| [distribution-channels.yaml](./distribution-channels.yaml) | JSON-совместимый реестр YAML для каналов публикации, атрибутированных URL-адресов, состояний активов, дат и 30-дневных полей результатов. | ~8 КиБ | ~2K |
| [navigation.json](./navigation.json) | Общий контракт навигации `Start`, `Build`, `Scale`, `Resources` и `Updates` для репозитория README и общедоступной карты сайта. Каждый общедоступный маршрут может указывать на источник своего канонического репозитория. | Сгенерировано | <2K |
| [navigation.schema.json](./navigation.schema.json) | JSON Схема для контракта общей навигации. | Сгенерировано | N/A |
| [llms.txt](./llms.txt) | Стандартный контекстный файл LLM для индексации репозитория: охват темы, точки входа, ключевые URL-адреса. | ~11 КиБ | ~3K |

`reference.yaml` — это полный индекс, а не сводка. Найдите нужную тему и следуйте полученному пути или номеру строки, а не загружайте весь указатель в контекст.

`llms.txt` и `llms-full.txt` корневого уровня выполняют одну и ту же роль AI-индексации для сканеров. Сохраняйте корневые `llms.txt`, `machine-readable/llms.txt` и `mcp-server/content/llms.txt` байтовыми.

## Использование

### Найдите тему, не загружая все руководство.

```bash
# Find where a topic lives, then read only that file or line range
grep -i "memory_systems" machine-readable/reference.yaml
grep -i "hooks_events" machine-readable/reference.yaml
grep -i "lean_ai_flow_adaptation" machine-readable/reference.yaml
```

### Ссылка в Claude Code

```
@machine-readable/reference.yaml
```

### Получить удаленно

```bash
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/machine-readable/reference.yaml
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/machine-readable/agent-harnesses.json
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/machine-readable/translations.json
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/machine-readable/distribution-channels.yaml
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/machine-readable/navigation.json
```

### Контракт на государственное судоходство

[`navigation.json`](./navigation.json) обеспечивает согласованность сводки репозитория и общедоступного веб-сайта, не превращая ни один из них в источник для руководства. Ему принадлежат курируемые группы намерений, общедоступные маршруты, краткие описания и исходные пути. Файлы Markdown остаются каноническими по своему содержанию.

Проверьте манифест и сгенерированный блок в `README.md`:

```bash
python3 scripts/sync-navigation.py
```

После редактирования манифеста заново создайте только отмеченный блок README:

```bash
python3 scripts/sync-navigation.py --write
```

Целевая сборка копирует тот же манифест в свой каталог данных, прежде чем Astro отобразит читаемую карту сайта. Целевые страницы могут использовать `null` вместо `source_path`. Каждый ненулевой источник должен существовать внутри этого репозитория, а объявленная привязка источника должна разрешаться в заголовок.

### Статус перевода

[`translations.json`](./translations.json) различает каноническое английское издание, поддерживаемое французское издание и независимо поддерживаемые адаптации сообщества. Состояние `stale` — это правдивый опубликованный статус, а не неудачная сборка. Неправильные контрольные суммы, исходное происхождение, закрепленная задержка, поля атрибуции, отсутствующие языковые пары или состояние, которое противоречит доказательствам, не проходят проверку целостности.

```bash
python3 scripts/check-translations.py --check
python3 scripts/check-translations.py --check --require-current-maintained
```

Пакет MCP предоставляет свой встроенный реестр как `claude-code-guide://translations`. Вторая фиксация в приведенной ниже последовательности обновления восстанавливает равенство байтов с каноническим реестром.

Каноническое происхождение — это операция с двумя фиксации. Сначала зафиксируйте `guide/ultimate-guide.md` и связанные с ним индексы, затем запустите `python3 scripts/check-translations.py --update-local`, отразите результат в `mcp-server/content/translations.json`, проверьте равенство байтов и зафиксируйте эти два реестра отдельно. Программа обновления отказывается от грязного канонического руководства, поскольку хэш незафиксированного файла не может быть связан с более старым коммитом. См. [Рабочий процесс статуса перевода](../docs/workflows/translations.md#after-changing-the-english-full-guide).

### Статус распространения

[`distribution-channels.yaml`](./distribution-channels.yaml) отделяет создание активов от внешней публикации. Ресурс `ready` прошел локальные проверки, но не был отправлен или опубликован. Недостающие меры остаются `null`.

```bash
python3 scripts/check-distribution-channels.py
python3 -m unittest scripts/test-check-distribution-channels.py
```

Пакет MCP предоставляет тот же реестр, что и `claude-code-guide://distribution-channels`.

### Различия понятий

Начните с [AI Концептуальные границы](../guide/core/ai-concept-boundaries.md), когда вопрос путает контекст с памятью, модель с ее оборудованием, агент с рабочим процессом, инструмент с MCP, инструкции с принудительным доступом, результаты оценки с производственными данными или архитектуру модели, размер, модальность и метки задач. Каждое отличие связано с подробным руководством и имеет оригинальную проверку сценария [](../guide/core/ai-concept-boundaries.md#check-your-understanding).

В оценке [Lexigraph](../docs/resource-evaluations/lexigraph-ai-lexicon.md) фиксируются источник, атрибуция CC BY 4.0, пробелы в экспорте и причины выборочной адаптации. Концептуальная страница адаптирует структуру обучения и избранные различия; он не импортирует корпус, банк викторин или инфографику. Используйте ссылки на продукты в руководстве для определения поведения во время выполнения.

### Используйте средства контроля и наблюдения

- [Запускаемая симуляция управления и восстановления](../examples/workflows/review-control-demo.py): 13 локальных тестов, симулированный пункт назначения, отсутствие действующего заявления о приемке GitHub.
- [Walkinglabs](../docs/resource-evaluations/learn-harness-engineering-2026.md) и [AutoHarness](../docs/resource-evaluations/autoharness-2026.md): проверенные случаи обучения и обслуживания с целевыми доказательствами сбоев.
- [Доклад с изложением позиции человеческого надзора](../docs/resource-evaluations/human-oversight-agents-2608-23642.md) и [двуязычная инфографика](../guide/images/harness-review/README.md): практика оценки ненаблюдаемых местных последствий для человека.

### Передача управления, владение контекстом и улучшение возможностей

| Нуждаться | Точка входа |
|---|---|
| Контракт архитектора-инженера, ADR, положения task/run, обзор отзывов | [Двойное планирование](../guide/workflows/dual-instance-planning.md), [Шаблон плана](../guide/workflows/dual-instance-planning.md#plan-template)и [Оценка источника](../docs/resource-evaluations/honkonen-architect-engineer.md) |
| Стабильные контракты против организационных знаний и живого состояния | [Граница знаний](../guide/ultimate-guide.md#9252-what-the-agent-cant-see-doesnt-exist) |
| Локальные требования к качеству, семантические владельцы, канонические примеры, завершение миграции | [Баланс восстанавливаемого качества](../guide/ultimate-guide.md#make-the-local-quality-bar-recoverable) |
| Наблюдения агента перед продвижением памяти | [MLD телеметрия](../guide/core/memory-systems.md#mld-observations-for-the-harness-builder) и [Цикл обновления на основе фактических данных](../guide/core/context-engineering.md#the-update-loop) |
| Изоляция кандидатов, права на публикацию, закрепление редакций и истечение срока действия | [Публикация в курируемом контексте](../guide/core/context-engineering.md#publication-contract-for-curated-context) |
| Реквалификация после повышения квалификации; отдельная обратная связь, пробег, внимание, приемочные часы | [Оценочные эпохи и четыре часа](../guide/roles/agent-evaluation.md#evaluation-epochs-and-four-clocks) |

Эти дополнения адаптируют практический материал. [Антология Лопополо](../docs/resource-evaluations/lopopolo-harness-engineering.md) — это контекстный корпус, а не исполняемая среда выполнения. Команды `eng` Хонконена относятся к его специальному инструменту. Ни один из источников не устанавливает измеренного местного качества, стоимости или выгод от доставки.

### Память агента: типы, объем и фактическое использование

| Нуждаться | Точка входа |
|---|---|
| Классифицируйте память по содержанию, форме, объему и жизненному циклу. | [Типы памяти: координаты, а не стек](../guide/core/memory-systems.md#memory-types-coordinates-not-a-stack) |
| Узнайте, остается ли воспоминание на одной машине или доходит до команды (Claude Code, Codex, Gemini CLI, Copilot, Kiro) | [Где живет память](../guide/core/memory-systems.md#where-memory-lives-local-repository-shared) |
| Убедитесь, что введенная память меняет действия агента. | [Шестиэтапный конвейер](../guide/core/memory-systems.md#from-captured-to-effective-the-six-stage-pipeline) и [Тесты использования 2026 года](../guide/core/memory-systems.md#measuring-whether-memory-is-used-2026) |
| Выберите или проверьте межсессионный инструмент (claude-mem, AgentMemory, Memorix, Basic-Memory) | [Кросс-сессионные инструменты](../guide/core/memory-systems.md#3-cross-session-tools-single-user) и [Сравнительная таблица](../guide/core/memory-systems.md#39-master-comparison-table) |
| Доказательства отравления постоянной памяти | [Отравление памяти](../guide/core/memory-systems.md#71-memory-poisoning-via-prompt-injection) |

Сведения об инструменте были прочитаны в тегах выпуска и документации поставщика 3 ноября 2026 г. Значения по умолчанию, версии и количество звезд меняются; перепроверьте, прежде чем цитировать их.

### <a name="agent-harness-landscape"></a>Агентский ландшафт

Используйте удобочитаемые страницы в соответствии с задаваемым вопросом:

| Нуждаться | Точка входа |
|---|---|
| Архитектура среды выполнения, компоненты, элементы управления, реализация Claude Code и протокол оценки оптимизатора. | [Проектирование жгутов агентов](../guide/core/agent-harness.md) |
| Контрольные тесты, рецензентские абляции, независимые критерии приемки и стоимость каждой принятой задачи. | [Оценка агента](../guide/roles/agent-evaluation.md#freeze-the-oracle-and-the-decision-rule) и [Оценка источника](../docs/resource-evaluations/harness-evidence-marmelab-2026.md) |
| Контракты циклов, контракты графов, распределение оценок, долговечность, наблюдаемость и выбор структуры управления | [Проектирование циклов и графов](../guide/core/loop-graph-engineering.md) |
| Классические шаблоны проектирования, сопоставленные с механизмами использования агентов, с режимами сбоев, проверками, источниками и ссылками для каждой карты на соответствующие рабочие процессы, шаблоны, а также авторские инструменты и статьи. | [AI Шаблоны проектирования](../guide/core/ai-design-patterns.md) и [`ai-design-patterns.json`](./ai-design-patterns.json) |
| Датированная карта перекрестных продуктов, классификация, выбор, протокол тест-драйва и уровень мета-исследований | [Пейзаж агента](../guide/ecosystem/agent-harness-landscape.md) |
| Подробные профили выбранных кодирующих агентов | [Инструменты агента: за пределами Claude Code](../guide/ecosystem/agentic-tools.md) |
| Среда выполнения, репозиторий, средства оценки и терминология оркестратора | [Глоссарий](../guide/core/glossary.md) |
| Поведение Claude Code на уровне версии | [claude-code-releases.yaml](./claude-code-releases.yaml) |
| Стабильные темы и маршруты разделов | [reference.yaml](./reference.yaml) |

`agent-harnesses.json` создается на основе зафиксированного моментального снимка `best-of-Agent-Harnesses@ece314654d2c23fe7bd69fc6ef7088f093207e49` и тщательно подобранных ручных переопределений. Перед анализом исходный источник проверяется на соответствие `best-of-agent-harnesses-ece314654d2c.manifest.json` и SHA-256 `4c02e547e11b056aa4d7e519305b7f4ca4f02550c27018d70757a59d26ace65f`. Записи, полученные из восходящего потока, сохраняют атрибуцию источника CC-BY-SA-4.0 и звездный снимок от 23 августа 2026 г.

В файле хранятся четыре набора отдельно:

- `upstream_snapshot`: 160 исходных проектов в 12 категориях;
- `guide_supplement`: официальные продукты и проверенные репозитории отсутствуют в этом снимке;
- `strict_runtime_map`: проекты, свидетельства которых свидетельствуют о том, что они владеют агентным циклом;
- `adjacent_control_planes`: оболочки, менеджеры парка, контроллеры задач и уровни выполнения, которые вызывают другую среду выполнения.

Поле `interfaces` использует шесть значений: `cli`, `tui`, `ide`, `desktop`, `web` и `chat`. Восходящие теги `cli`, `tui`, `ide` и `browser` детерминированно сопоставляются с этим словарем. Для курируемых исключений требуется официальный, закрепленный за коммитом исходный код в `agent-harnesses-overrides.json`. Интерфейс не кодирует место выполнения или владение циклом.

В доказательствах используются `confirmed`, `claimed`, `unknown` или `not_applicable`. `unknown` не означает отсутствие этой функции. `owns_loop` использует `confirmed`, `claimed`, `unknown` или `no`. Экстрактор никогда не запускает агент и не отправляет текст README в модель. Он выдает детерминированные предложения `unknown` для проверки вручную. Внешние предложения остаются на рассмотрении и никогда не публикуются автоматически.

Каждое предложение по извлечению привязывает свои входные данные к каноническому URL-адресу репозитория GitHub, относительному репозиторию пути README и SHA-256 фактически прочитанных байтов. Необработанное содержимое README и пути к локальной файловой системе не копируются в предложение.

Пересоберите и проверьте без доступа к сети:

```bash
python3 scripts/build-agent-harnesses.py \
  --source machine-readable/sources/best-of-agent-harnesses-ece314654d2c.json \
  --overrides machine-readable/agent-harnesses-overrides.json \
  --output machine-readable/agent-harnesses.json
python3 scripts/build-agent-harnesses.py \
  --source machine-readable/sources/best-of-agent-harnesses-ece314654d2c.json \
  --overrides machine-readable/agent-harnesses-overrides.json \
  --output machine-readable/agent-harnesses.json \
  --check
uv run --offline --with jsonschema python scripts/test-agent-harnesses.py
```

Тестовая команда `uv` является обязательным шлюзом проверки. Он всегда загружает `jsonschema` и проверяет как зафиксированный каталог, так и свидетели враждебной схемы; бегун немедленно завершает работу, если `jsonschema` недоступен.

Намеренно обновите исходный код с помощью `scripts/collect-agent-harnesses.py`. Коллектор отклоняет любой первоначальный снимок, в котором больше нет ровно 160 проектов, 12 категорий и необходимой лицензии. Новая восходящая фиксация требует проверенного обновления контракта, а не автоматического изменения количества.

### Дополнительный модуль метаданных GitHub

Запланированный рабочий процесс `Collect Agent Harness GitHub Metadata` доступен только для чтения. Он получает 179 URL-адресов канонического репозитория из `agent-harnesses.json`, отправляет последовательные запросы GitHub API, используя закрепленную версию `2022-11-28` API, и загружает артефакт-кандидат на 14 дней. Кэш действий с контрольной суммой сохраняет проверенные ETag между запусками, не пересекая версии каталога. Он никогда не фиксирует и не открывает запрос на включение.

Сборщик не закрывается из-за отсутствующего токена, неполного результата, ошибки HTTP, включая 404 или 429, переименования, дублирования, несовпадения мощности или несоответствия контрольной суммы каталога. Он пишет атомарно только после того, как все репозитории прошли проверку. `license_spdx` является наблюдением GitHub и никогда не заменяет редакционную статью `license_signal`; коляска никогда не меняет `freshness.checked_at`.

Чтобы собрать кандидата локально, сначала напишите его за пределами репозитория:

```bash
GITHUB_TOKEN=... python3 scripts/collect-agent-harnesses-github.py \
  --catalog machine-readable/agent-harnesses.json \
  --output /tmp/agent-harnesses-github.json \
  --captured-at "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

Продвижение — это отдельный человеческий обзор. Сначала проверьте всю коляску и отобразите ее во временную страницу. При этом проверяется пересчитанная контрольная сумма каталога, версия схемы, точные поля, временные метки, идентификаторы репозитория, мощность, порядок и неотрицательные звезды без изменения опубликованной страницы:

```bash
cp guide/ecosystem/agent-harness-landscape.md /tmp/agent-harness-landscape-candidate.md
python3 scripts/build-agent-harness-page.py \
  --catalog machine-readable/agent-harnesses.json \
  --github-sidecar /tmp/agent-harnesses-github.json \
  --page /tmp/agent-harness-landscape-candidate.md
```

После просмотра различий метаданных скопируйте кандидата в `machine-readable/agent-harnesses-github.json` и `mcp-server/content/agent-harnesses-github.json`, а затем проверьте побайтовое зеркало. Конструктор страниц может явно использовать продвигаемый дополнительный вариант, сохраняя при этом резервный вариант каталога:

```bash
python3 scripts/build-agent-harness-page.py \
  --catalog machine-readable/agent-harnesses.json \
  --github-sidecar machine-readable/agent-harnesses-github.json \
  --page guide/ecosystem/agent-harness-landscape.md \
  --check
diff -q machine-readable/agent-harnesses-github.json mcp-server/content/agent-harnesses-github.json
```

## Обслуживание

`version` вверху `reference.yaml` должен соответствовать корневому файлу `VERSION`; `updated` записывает дату редакции индекса. Запустите `./scripts/sync-version.sh --check` перед фиксацией.

`latest` в `claude-code-releases.yaml` также управляет предложением версии Claude Code во всех трех зеркалах `llms.txt`. Обновление выпуска должно одновременно изменить корневые `llms.txt`, `machine-readable/llms.txt` и `mcp-server/content/llms.txt`. Тест документации MCP обеспечивает как равенство байтов, так и четность версий:

```bash
(cd mcp-server && node --test --test-name-pattern='canonical MCP guide is complete' test/render-product-docs.test.mjs)
```

Тот же тест выполняется внутри `npm run release:check` в CI. Это доказывает согласованность локального реестра с индексом, а не то, что реестр выпуска соответствует текущему журналу изменений Anthropic.

Сохраняйте `reference.yaml` байтовым, идентичным `mcp-server/content/reference.yaml` после редактирования индекса. Обновляйте описания обнаружения при изменении покрытия и сохраняйте оценки источников отдельно от свидетельств реализации.

Привязки и номера строк смещаются при реструктуризации файлов направляющих. После значительного редактирования `guide/` убедитесь, что каждый `path#anchor` в `reference.yaml` по-прежнему преобразуется в реальный заголовок и что каждый `path:N` остается в своем файле.

Добавление, удаление или переименование ключа `deep_dive` изменяет палитру Cmd+K целевого сайта. Восстановите его из целевого репозитория с помощью `pnpm build:search`.

Для изменения общедоступной навигационной группы, маршрута, метки или исходного пути требуется `python3 scripts/sync-navigation.py --write` здесь и целевая сборка с текущим репозиторием руководств, доступным через `GUIDE_REPO_PATH` или родственный путь по умолчанию.

---

*Вернуться к [main README](../README.md)*
