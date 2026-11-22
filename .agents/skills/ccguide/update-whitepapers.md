---
name: update-whitepapers
description: "Обновите технические документы (FR + EN) на основе последних записей CHANGELOG с помощью команды параллельного агента."
argument-hint: "[--since <version>] [--wp <00-08|cheatsheet>]"
---

# Рабочий процесс обновления технической документации

Проанализируйте последние записи CHANGELOG и обновите затронутые технические документы (FR + EN), используя команду параллельного агента.

## Использование

```
/update-whitepapers                        # Update WPs based on latest CHANGELOG entry
/update-whitepapers --since 3.27.0         # Update WPs for all changes since v3.27.0
/update-whitepapers --wp 03                # Force update WP03 only (FR + EN)
/update-whitepapers --wp 07,08             # Force update WP07 + WP08
```

## Шаг 1: Анализ аргументов

Разбираем `$ARGUMENTS`:
- `--since <version>` → проанализировать все записи CHANGELOG от этой версии до последней.
- `--wp <list>` → пропустить анализ, принудительно обновить указанные WP (через запятую: `03`, `07,08`, `cheatsheet`)
- Нет аргументов → используйте только самую последнюю запись CHANGELOG (последний блок `## [X.Y.Z]`)

## Шаг 2: Прочтите ИЗМЕНЕНИЯ

Прочтите `CHANGELOG.md`. Извлеките соответствующие записи:
- Если `--since <version>`: извлеките все блоки `## [X.Y.Z]` с версией > указанной версии.
- Если нет `--since`: извлеките только первый (самый последний) блок `## [X.Y.Z]`.

Отобразите извлеченные записи пользователю для подтверждения.

## Шаг 3. Составьте карту изменений в технических документах

Если не указан `--wp`, проанализируйте текст журнала изменений и сопоставьте изменения с затронутыми техническими документами, используя следующую матрицу:

| Ключевые слова/темы | Затронутые WP |
|-------------------|-------------|
| перехватчики, безопасность, разрешения, угроза, внедрение, сканер, белый список, черный список | WP03, WP07 |
| контекст, мышление, архитектура, ценообразование, токены, модель, API, память | WP04, WP07 |
| CLAUDE.md, settings.json, настройка, проект, личность, тип агента, MCP | WP02, WP07 |
| подсказки, косая черта, команды, формат вывода, `#`, `!` | WP01, WP07 |
| команда, мультиагент, оркестровка, субагент, фон, рабочее дерево | WP05, WP08 |
| конфиденциальность, ZDR, хранение, данные, предприятие, телеметрия | WP06, WP07 |
| выпуск, версия, новая функция, введение | WP00, WP07 |
| шпаргалка | шпаргалка |
| агентские команды, агентские команды | WP08, WP05 |

Всегда включайте WP07 (справочное руководство), если обнаружено какое-либо существенное изменение функции — это всеобъемлющий справочник.

Создайте список затронутых WP. Удалите дубликаты. Отобразить список:
```
Affected whitepapers: WP00, WP03, WP07, WP08
Changes to integrate: [summary of relevant changes]
```

Спросите: «Запустить команду для обновления этих WP? (y/n)»

Если пользователь подтвердит, продолжайте. Если был указан `--wp`, пропустите подтверждение.

## Шаг 4. Команда агента запуска

### <a name="setup"></a>Настройка

```bash
# Team name includes timestamp for uniqueness
TEAM_NAME="wp-update-$(date +%Y%m%d-%H%M)"
```

Создать команду: `TeamCreate(team_name=TEAM_NAME)`

Создайте одну задачу для каждого затронутого WP.

### Запускайте агенты параллельно

Для каждого затронутого WP запустите один агент (`run_in_background: true`) с помощью этого шаблона приглашения:

---
**Шаблон запроса агента:**

```
You are wp-updater for [WP_ID].

You have changelog changes to integrate into two files:
- FR: whitepapers/fr/[FR_FILENAME]
- EN: whitepapers/en/[EN_FILENAME]

## Changes to integrate

[CHANGELOG_EXCERPT]

## Instructions

1. Read the FR file completely
2. Identify sections that need updating based on the changelog
3. Apply targeted edits using the Edit tool (do NOT rewrite entire sections unless necessary)
4. Read the EN file completely
5. Apply the same changes in English
6. Be surgical: only change what's factually outdated or newly relevant
7. Do not change the structure, tone, or style
8. Keep version numbers in frontmatter at [CURRENT_VERSION]

When done, send message to team-lead: "wp-updater [WP_ID] done: [list of sections updated]"
```
---

### WP → Сопоставление файлов

| идентификатор WP | имя файла FR | RU имя файла |
|-------|-------------|-------------|
| WP00 | fr/00-introduction-serie.qmd | en/00-series-introduction.qmd |
| WP01 | fr/01-prompts-efficaces.qmd | en/01-effective-prompts.qmd |
| WP02 | fr/02-personnalisation.qmd | en/02-customization.qmd |
| WP03 | fr/03-securite.qmd | en/03-security.qmd |
| WP04 | fr/04-architecture.qmd | en/04-architecture.qmd |
| WP05 | fr/05-equipe.qmd | en/05-team.qmd |
| WP06 | fr/06-privacy.qmd | en/06-privacy.qmd |
| WP07 | fr/07-guide-reference.qmd | en/07-reference-guide.qmd |
| WP08 | fr/08-agent-teams.qmd | en/08-agent-teams.qmd |
| шпаргалка | fr/cheatsheet.qmd | en/cheatsheet.qmd |

Все пути указаны относительно каталога `whitepapers/` внутри текущего рабочего каталога.
Агент должен разрешать абсолютные пути во время выполнения, используя корень проекта (текущий рабочий каталог).

## Шаг 5: Подождите и соберите результаты

Подождите, пока все агенты сообщат о завершении. Отслеживать:
- ✅ Готовые агенты
- ❌ Неудавшиеся агенты (если есть)

Когда все агенты закончат работу, отобразите сводную таблицу:

```
WP00 ✅ — Updated: intro section (9 WPs → 10 WPs)
WP03 ✅ — Updated: hooks count (14 → 17), new scanner hook added
WP07 ✅ — Updated: flags table, reference section
WP08 ✅ — No changes needed
```

## Шаг 6. Обновите версию Frontmatter

Если журнал изменений содержит информацию о версии:
- Прочитать файл `VERSION` → получить текущую версию
- Обновить поле `version:` во вступительной части ВСЕХ обновленных файлов (FR + EN)

## Шаг 7: Очистка

Завершите работу всех агентов через `SendMessage(type: shutdown_request)`.
Удалить команду через `TeamDelete()`.

## Шаг 8. Проверка после обновления

Выполните быструю проверку работоспособности:
```bash
# No leftover stale versions
grep -r "3\.26\." whitepapers/fr/*.qmd whitepapers/en/*.qmd

# Frontmatter versions consistent
grep "^version:" whitepapers/fr/*.qmd whitepapers/en/*.qmd | sort -u
```

Отображение результатов. Отмечайте любые несоответствия.

## Важные примечания

- **Только хирургическое редактирование** — агенты используют инструмент редактирования, а не полную перезапись
- **Оба FR и EN всегда обновляются вместе** — никогда одно без другого
- **WP07 — эталонный хаб** — почти всегда в комплекте
- **Источник истины**: CHANGELOG.md + `guide/ultimate-guide.md` (если необходим более глубокий контекст)
- **Без галлюцинаций**: агенты должны указать конкретные строки журнала изменений, на основании которых они действуют.
