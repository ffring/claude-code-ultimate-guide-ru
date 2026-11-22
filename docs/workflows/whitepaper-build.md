# Технический документ и руководство по экспортной сборке

Команды и сведения о стеке для создания PDF-файлов, EPUB и карточек резюме из исходных файлов `.qmd`.

## Создание технической документации (PDF + EPUB)

```bash
# --- PDF (default format: whitepaper-typst → Typst → PDF) ---

# Single file
cd whitepapers/fr && quarto render 00-introduction-serie.qmd

# All FR whitepapers
cd whitepapers/fr && quarto render *.qmd

# All EN whitepapers
cd whitepapers/en && quarto render *.qmd

# Preview with hot-reload
cd whitepapers/fr && quarto preview 00-introduction-serie.qmd

# Batch with error summary (loop)
cd whitepapers/fr && for f in *.qmd; do echo "→ $f" && quarto render "$f" 2>&1 | grep -E "(Output created|ERROR)"; done

# --- EPUB (format: epub → Pandoc → EPUB3) ---

# Single file
cd whitepapers/fr && quarto render 00-introduction-serie.qmd --to epub

# All EPUBs (FR + EN) → epub-output/{fr,en}/
cd whitepapers && ./render-epub.sh all
cd whitepapers && ./render-epub.sh fr   # French only
cd whitepapers && ./render-epub.sh en   # English only
```

**PDF стек**: Quarto → в комплекте Typst → PDF. Шаблон: `whitepapers/_extensions/whitepaper/`. Палитра Bold Guy (теплый беж + жженый оранжевый).

Стек **EPUB**: Quarto → Pandoc → EPUB3. CSS: `whitepapers/epub-styles.css`. Обложка: `_extensions/whitepaper/assets/claude-code-ai-logo.jpg`.

**Доступный навык**: `/pdf-generator` для контекстной помощи (шаблон YAML, стек, устранение неполадок).

**Формат белой бумаги**: используйте `--to whitepaper-typst`, чтобы выбрать шаблон проекта. Карточки для подведения итогов и шпаргалки используют свои собственные форматы.

## Карточки-резюмы (тематические памятные листы)

Одностраничные листы формата А4 для печати, что-то среднее между шпаргалкой и техническими документами.

```bash
# Single card
cd whitepapers/recap-cards/fr && quarto render 01-commandes-essentielles.qmd --to recap-card-typst

# All FR cards (via script)
cd whitepapers/recap-cards && ./render-recap-cards.sh fr

# All cards (FR + EN)
cd whitepapers/recap-cards && ./render-recap-cards.sh all
```

**Stack**: расширение `recap-card` (`whitepapers/_extensions/recap-card/`). Формат `recap-card-typst`. Та же палитра Bold Guy.

**Источники**: `whitepapers/recap-cards/fr/*.qmd` (FR), `whitepapers/recap-cards/en/*.qmd` (EN).

**58 карточек на каждый язык** в сериях «Техника», «Методология» и «Дизайн».

## Полная сборка двуязычной публикации

Запускаем из корня клонированного репозитория:

```bash
# Inventory only: 146 PDFs and 28 EPUB companions
python3 scripts/render-publications.py --list

# Build both languages; resume only when all recorded input/output hashes match
python3 scripts/render-publications.py --resume

# Check every output, source hash, one-page card, EPUB and PDF page boundary
python3 scripts/validate-publications.py

# Full guides only, using the same templates as the public downloads
python3 scripts/render-publications.py --collections guides

# A single language or collection
python3 scripts/render-publications.py --lang en --collections whitepapers cards
```

Полный каталог содержит два полных руководства, 26 технических документов, 116 карточек с резюме.
и две ежедневные шпаргалки. Сопутствующие файлы EPUB создаются для руководств и
технические документы. Выходные данные, журналы рендеринга и `manifest.json` отправляются в папку
`dist/publications/`, который игнорируется Git. Источник записей манифеста и
выходные хеши; успешный рендеринг не обеспечивает семантическую точность.

Требования: Python 3, Quarto 1.10.18 с включенным Typst, а также Inter и
Шрифты JetBrains Mono. Расширения выбирают собственную подсветку синтаксиса Typst.
(`syntax-highlighting: idiomatic`) для сохранения строк кода с пользовательским необработанным текстом.
стили. В Quarto 1.9 изменен маркер по умолчанию; увидеть его
[Typst документация](https://quarto.org/docs/output-formats/typst.html). `pdfinfo` при установке также проверяет читаемость и
записывает количество страниц. При сборке одновременно выполняются независимые источники, в то время как
Рендеринг PDF и EPUB одного источника остается последовательным.

Препроцессор с полным руководством удаляет таблицу вручную на английском или французском языке.
содержимое и внутренние якорные ссылки перед рендерингом. Quarto предоставляет PDF-файл.
оглавление. Перекрестные ссылки на внутренние привязки Markdown представляют собой обычный текст.
в этом экспорте.

`scripts/generate-guide-exports.sh` остается устаревшим экспортным продуктом английского Pandoc.
Используйте `scripts/render-publications.py` для стилизованных общедоступных выпусков и CI.

## Свежесть французского перевода

`guide/ultimate-guide.fr.md` сохраняется в соответствии с записанным английским источником.
Двуязычная сборка отказывается отображать устаревшее полное руководство на французском языке. Перед маркировкой
обновление завершено, просмотрите полную дельту английского языка, восстановите все недостающие
разделы, сохраняйте исполняемые примеры и просматривайте французскую прозу. Структурный
одних подсчетов недостаточно.

```bash
# Only after the translation review and source commit are complete
python3 scripts/check-translations.py --update-local --record-french-refresh
python3 scripts/check-translations.py --check --require-current-maintained
python3 scripts/render-publications.py --collections guides --lang fr
```

В обновлении за сентябрь 2026 г. используются рабочие Codex. Существующие
`scripts/translate-guide.py` — это отдельный устаревший инструмент Anthropic API, который не является
вызывается сборкой. Его наличие не выбирает модель, используемую Codex.

Обертки с полными направляющими — `whitepapers/guide-export.qmd` и
`whitepapers/guide-export-fr.qmd`. Предварительно обработанный Markdown генерируется и игнорируется.
См. [поддержание перевода](translations.md) для реестра доказательств.

## Шаблоны Typst: обновите копию, используемую источником.

В настоящее время исходные местоположения используют следующие шаблоны:

| Источник | Шаблон |
| --- | --- |
| `whitepapers/fr/*.qmd` | `whitepapers/fr/_extensions/whitepaper/typst-template.typ` |
| `whitepapers/en/*.qmd` | `whitepapers/en/_extensions/whitepaper/typst-template.typ` |
| Обертки с полным руководством в `whitepapers/` | `whitepapers/_extensions/whitepaper/typst-template.typ` |

Редактирование корневой копии не приводит к обновлению копий FR или EN. Просмотр общего исправления
против всех трех шаблонов, сохраняя их предполагаемые различия. Не
предположим, что родительское расширение будет доступно после удаления локальной копии.

Карты резюме используют `whitepapers/_extensions/recap-card/`. Их источник на французском и английском языках.
каталоги предоставляют его через символические ссылки каталогов `_extensions`. Держите эти
рабочие ссылки. Более старый `recap-card-template.typ` в расширении технического описания.
уже отличается от шаблона выделенной карты; сравнить изменения перед
копирование между ними.

## Quarto/Typst устранение неполадок

Прежде чем сравнивать результаты, запишите установленную цепочку инструментов. Целевые репродукции
на Quarto 1.10.19 в комплекте Pandoc 3.10 и Typst 0.15.1 подтвердились случаи, указанные ниже;
они не проверяют полный каталог публикаций.

```bash
quarto --version
quarto pandoc --version
quarto typst --version
```

### Список становится частью вводного абзаца.

С помощью программы чтения Pandoc Markdown по умолчанию можно перечислять элементы сразу после
абзац без пустой строки может оставаться внутри этого абзаца. Добавить пробел
строка перед первым маркером или флажком в источнике. Это проблема разбора,
не обычное представление жесткого списка (элементы `BulletList`, содержащие `Plain`).

`scripts/render-publications.py` уже выбирает
`markdown+lists_without_preceding_blankline` и препроцессор с полным руководством.
уже вставляет разделители. Для ручного рендеринга из клонированного репозитория.
root:

```bash
cd whitepapers/fr
quarto render 00-introduction-serie.qmd --to whitepaper-typst \
  -M from:markdown+lists_without_preceding_blankline
```

Опция считывателя описана в
[Руководство Pandoc](https://pandoc.org/MANUAL.html#extension-lists_without_preceding_blankline).
Фильтр списка Lua не может восстановить список, который программа чтения никогда не анализировала.

### Буквальное упоминание файла становится цитатой в заголовке выноски.

Голый `@file` в заголовке Markdown становится цитатой и может не соответствовать Typst.
составление при отсутствии библиографии. Сохраняйте упоминания файлов как встроенный код:

```markdown
::: {.callout-note title="Memo `@file`"}

Callout content.

:::
```

Это также работает, когда заголовок является заголовком внутри выноски. Одиночный
обратная косая черта перед `@file` в атрибуте `title` не предотвратила
цитата в тестируемой версии. Сохраняйте подлинные библиографические ссылки без изменений.

### Пользовательский формат Typst не может загрузить свой шаблон.

`recap-card-typst` выбирает расширение `recap-card` и базовый формат `typst`.
При использовании шаблона по умолчанию используются два частичных шаблона-функции:
`typst-template.typ` и `typst-show.typ`; произвольные переименованные фрагменты были отклонены.
Существуют и другие поддерживаемые частичные слоты, как описано в
[Quartoэто обычай Typst форматы](https://quarto.org/docs/output-formats/typst-custom.html).

Quarto расширяет частичные элементы в сгенерированный `.typ`. Не добавляйте импорт
`typst-template.typ` внутри `typst-show.typ`, чтобы соединить эти два файла.
Импорт отдельных библиотек Typst — это другой случай и требует решения.
пути ресурсов. Сохраните эти два частичных файла как обычные файлы: символическую ссылку для
`typst-template.typ` опустил свое определение в воспроизведении, хотя
существующие символические ссылки на каталог `_extensions` работали.

Если исходный код не работает, выполните рендеринг с помощью `--debug` в черновой копии, проверьте
сохраните `.typ` и полный журнал компилятора, затем перезапустите публикацию.
валидатор. Также ознакомьтесь с предупреждениями о шрифтах: компиляция с резервными шрифтами не
установить предполагаемую типографику или нумерацию страниц.

## Контрольный список развертывания в формате PDF: 3 файла для обновления

При отправке обновленных PDF-файлов в landing/portfolio файлы **3 всегда должны обновляться вместе с**. Отсутствие любого из них приводит к обслуживанию старых файлов.

| Файл | Репо | Роль |
|------|------|------|
| `florian-portfolio/public/guides/` | портфель | Физические PDF-файлы (копировать с новым именем файла) |
| `landing/src/data/whitepapers-data.ts` | приземление | Кнопки прямой загрузки (`const V`, `hashedFileFr/En`) |
| `florian-portfolio/api/guides.mjs` | портфель | **Ссылки электронной почты**: `GUIDE_MANIFEST` стабильный идентификатор → имя версии файла |

**`guides.mjs` — это тот, который легко забыть.** Он контролирует, какой URL-адрес отправляется по электронной почте, когда пользователь подписывается. Старые ссылки в электронных письмах перенаправляются через `/api/guides?id=...`, поэтому обновление этого файла задним числом исправляет и всех прошлых получателей электронной почты.

```bash
# Verify all 3 are in sync after an update:
grep "const V" landing/src/data/whitepapers-data.ts          # should show new version
grep "08-agent-teams.en" florian-portfolio/api/guides.mjs    # should show new version
ls florian-portfolio/public/guides/ | grep "v3.40.0" | wc -l # should show 18+ files
```

## Управление версиями электронной книги

У каждой электронной книги есть своя версия, независимая от версии руководства.

**Два поля заголовка**:
- `version: "3.30.0"` → версия руководства (синхронизирована через `./scripts/sync-version.sh`)
- `wp-version: "1.0.0"` → версия электронной книги (увеличить вручную)

**Обновление рабочего процесса**:
1. Удар `wp-version` во фронтовой теме `.qmd`
2. Добавьте запись в `whitepapers/CHANGELOG.md`
3. Ребилд: `cd whitepapers/fr && quarto render XX.qmd --to whitepaper-typst`

**Соглашение Semver**: MAJOR = структурная перезапись, MINOR = новый sections/angles, PATCH = мелкие исправления.
