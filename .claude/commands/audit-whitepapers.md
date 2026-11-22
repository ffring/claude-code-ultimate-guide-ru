---
name: audit-whitepapers
description: "Аудит актуальности версий, четности FR/EN и качества метаданных всех технических документов и карточек резюме."
argument-hint: "[--fix] [--verbose] [--cards-only] [--wp-only]"
---

# Технические документы и карточки аудита

Комплексный аудит актуальности и качества всех технических документов (FR + EN) и карточек резюме (FR + EN). Сравнивает каждый документ с текущей версией руководства, проверяет четность FR/EN и проверяет согласованность метаданных.

## Аргументы

- `--fix` — генерировать предложения по обновлениям и патчи интерфейса (не изменяет файлы).
- `--verbose` - Показать все критерии, включая проходные, а не только неудачи.
- `--cards-only` — аудит только карточек итогов (пропустить основные технические документы)
- `--wp-only` — Аудит только основных технических документов (пропуск карточек с резюме)

## Использование

```bash
/audit-whitepapers                  # Full audit, failures only
/audit-whitepapers --fix            # Audit + prioritized update suggestions
/audit-whitepapers --verbose        # Full details for all criteria
/audit-whitepapers --cards-only     # Recap cards only
/audit-whitepapers --wp-only        # Whitepapers only
```

---

## Фаза 1: Открытие

**Цель**: найти и провести инвентаризацию всех документов, подлежащих проверке.

### Шаги

1. **Читать текущую версию руководства.**: Прочтите файл `VERSION` в корне проекта. Это целевая версия, с которой должны синхронизироваться все документы.

2. **Сканировать каталоги** на наличие файлов `.qmd`:
   ```
   whitepapers/fr/         (main whitepapers FR)
   whitepapers/en/         (main whitepapers EN)
   whitepapers/recap-cards/fr/    (recap cards FR)
   whitepapers/recap-cards/en/    (recap cards EN)
   ```

3. **Классифицировать каждый файл**:
   - **Основной технический документ**: файлы, соответствующие `[0-9][0-9]-*.qmd` в `whitepapers/fr/` или `whitepapers/en/`
   - **Cheatsheet**: файлы, соответствующие `*cheatsheet*.qmd` (отслеживаются отдельно, не оцениваются)
   - **Пользовательский технический документ**: файлы, соответствующие `*-whitepaper.qmd` или `*-cheatsheet.qmd` от внешних партнеров (strangebee, Purchasey, devwithai) – исключены из оценки и перечислены отдельно.
   - **Recap card**: все файлы `.qmd` в `recap-cards/fr/` или `recap-cards/en/`.
   - **Bundle/include**: `fiches-recap-serie.qmd`, файлы в подкаталоге `fiches/` -- исключены (они представляют собой составные документы)

4. **Parse YAML frontmatter** для каждого включенного файла (читается между первым `---` и вторым `---`). Извлекать:
   - `title`, `subtitle`, `author`, `date`
   - `version` (версия руководства отслеживается в основных WP и карточках резюме)
   - `wp-version` (собственный документ, только основные рабочие места)
   - `guide-version` (поле явной версии руководства, используемое в карточках резюме)
   - `card-number`, `category`, `difficulty` (только карты резюме)
   - `series` (только основные WP)

5. **Показать сводку обнаружения**:
   ```
   Guide version: {VERSION}
   Found: {N} main whitepapers ({FR}/{EN} FR/EN), {N} recap cards ({FR}/{EN} FR/EN)
   Excluded: {N} custom files (strangebee, purchasely, devwithai), {N} bundle files
   ```

---

## Этап 2: Анализ разрывов версий (40 баллов на файл)

**Objective**: Оцените актуальность каждого документа по сравнению с руководством.

### Логика сравнения семверов

Разберите строки версии как `MAJOR.MINOR.PATCH`. Метрика устаревания — `minor_gap = current_minor - file_minor` (с использованием того же MAJOR). Если MAJOR отличается, считайте это критическим.

Для **основные технические документы**, поле версии руководства `version`.
Для карт **recap**поле версии руководства — `guide-version` (возврат к `version`, если отсутствует).

### Таблица подсчета очков

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Текущая версия руководства (0-1 минор позади) | 15 | `minor_gap` <= 1 |
| Последняя версия руководства (отстает на 2-3 минорные) | 10 | `minor_gap` 2-3 (частичный зачет, заменяет 15) |
| Старая версия руководства (отстает на 4-10 минор) | 5 | `minor_gap` 4–10 (частичный зачет) |
| Поле wp-version присутствует и допустимо | 5 | Поле существует И соответствует `\d+\.\d+\.\d+` (только WP) |
| wp-версия соответствует паре FR/EN | 10 | То же значение `wp-version` в файле-аналоге (только WP) |
| руководство-версия соответствует паре FR/EN | 10 | Тот же `guide-version` (или `version`) в аналоге (картах) |

**Этикетки свежести**:
- Отставание со счетом 0:1: Свежий
- Отставание на 2-3 минор: устаревший
- Отставание на 4-10 незначительно: очень устаревшее
- Отставание от 11+ незначительных: Критический

Примечание. 15, 10, 5 баллов за версию руководства являются взаимоисключающими (присуждается только самый высокий применимый уровень).

---

## Этап 3: Проверка устаревания контента (20 баллов за файл)

**Objective**: Определить, изменились ли разделы руководства, которые освещает технический документ, с момента его последнего обновления.

### Сопоставление технических документов и руководств (встроено)

| WP# | Префикс имени файла FR | RU префикс имени файла | Разделы руководства |
|-----|--------------------|--------------------|----------------|
| 00 | `00-introduction` | `00-series-introduction` | `guide/ultimate-guide.md` Глава 1-2 |
| 01 | `01-prompts` | `01-effective-prompts` | Глава 2. Разделы подсказок |
| 02 | `02-personnalisation` | `02-customization` | Гл.3 Память, Гл.4 Агенты, Гл.5 Навыки |
| 03 | `03-securite` | `03-security` | Гл.7 Хуки, защитные секции |
| 04 | `04-architecture` | `04-architecture` | Глава 2. Внутреннее устройство, разделы архитектуры. |
| 05 | `05-equipe` | `05-team` | Конфигурация команды гл.3, гл.9 CI/CD |
| 06 | `06-privacy` | `06-privacy` | Глава 2. Разделы data/privacy |
| 07 | `07-guide-reference` | `07-reference-guide` | Глава 10. Справка |
| 08 | `08-agent-teams` | `08-agent-teams` | Команды агентов гл.9 |
| 09 | `09-apprendre` | `09-learning` | `guide/roles/learning-with-ai.md` |
| 10 | `10-budget` | `10-ai-budget` | Business/ROI контент |
| 11 | `11-team-metrics` | `11-team-metrics` | `guide/ops/team-metrics.md`, `guide/ops/observability.md` |
| 12 | `12-agent-engineering` | `12-agent-engineering` | Команды агентов главы 9, `guide/core/methodologies.md` |

### Шаги

1. Для каждого основного технического документа извлеките поле `date`. Если дата не в формате `YYYY-MM-DD`, проанализируйте ее (например, «12 февраля 2026 г.» или «Март 2026 г.»).
2. Запустите `git log --since="{date}" --oneline -- guide/ultimate-guide.md guide/roles/ guide/core/`, чтобы подсчитать коммиты, затронувшие содержимое руководства с момента публикации технического документа.
3. Score:

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Ни одно руководство не совершает коммитов с даты wp | 10 | `git log` возвращает 0 коммитов |
| Мало коммитов с даты wp (1-5) | 7 | 1-5 коммитов (частичные) |
| Умеренные коммиты (6–15) | 4 | 6-15 коммитов (частичные) |
| Много коммитов (>15) | 0 | Более 15 коммитов |
| Сопоставление определено для этого WP | 5 | Номер WP указан в таблице сопоставлений выше. |
| Доступна история Git | 5 | Команда `git log` выполняется без ошибок |

**Резюме карточек**: пропустить подробный анализ git. Присудите фиксированную оценку устаревания на основе `minor_gap`:
- Отставание 0-1: 20 очков
- Отставание 2-3: 15 очков
- Отставание от 4 до 10: 8 очков
- Отставание 11+: 0 очков

---

## Этап 4: Проверка четности FR/EN (20 точек на файл)

**Objective**: Каждый документ должен иметь полный, согласованный по версии аналог на другом языке.

### Стратегия спаривания

**Основные технические документы**: Сопоставьте двузначный цифровой префикс (например, `00`, `03`, `10`). Имена файлов FR и EN различаются, но префикс одинаков.

**Recap card**: совпадение по идентичному имени файла (в обоих языковых каталогах используются одни и те же имена файлов).

### Таблица подсчета очков

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Файл-аналог существует на другом языке | 10 | Найден файл с совпадающим префиксом (WP) или идентичным именем (карты). |
| wp-версия совпадает между парами | 5 | То же значение `wp-version` (только WP) |
| версия руководства совпадает между парами | 5 | То же значение `version`/`guide-version` |

Оба файла FR и EN пары оцениваются одинаково по четности (если пара завершена, оба получают 20; если один отсутствует, существующий файл получает 0 баллов по четности).

---

## Этап 5: Качество метаданных (20 баллов за файл)

**Objective**: проверка полноты вступительной части, форматов полей и согласованности между файлами одного и того же типа.

### Основные технические документы (максимум 20 баллов)

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Обязательные поля присутствуют | 6 | Имеет все: `title`, `subtitle`, `author`, `date`, `version`, `wp-version`, `series`. |
| `version` следует шаблону семвера | 3 | Совпадает с `\d+\.\d+\.\d+` |
| `wp-version` следует шаблону семвера | 3 | Совпадает с `\d+\.\d+\.\d+` |
| `date` доступен для анализа и не в будущем | 3 | Действительная дата, не позднее сегодняшнего дня |
| Значение `series` соответствует | 2 | Равно «Claude Code Ultimate Guide». |
| Нет отсутствующих `wp-version` (не остается пустым или отсутствует) | 3 | Поле имеет непустое значение |

### Карточки с подведением итогов (максимум 20 баллов)

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Обязательные поля присутствуют | 5 | Имеет все: `title`, `subtitle`, `card-number`, `category`, `difficulty`, `guide-version`, `author`, `version`, `date`. |
| `card-number` соответствует префиксу имени файла | 4 | например, `C01` в `card-number` соответствует `c01-` в имени файла |
| `category` действителен для языка | 4 | ФР: один из «Техника», «Методология», «Концепция»; EN: один из «Технических», «Методологии», «Дизайна» (пометить «Концептуальный» как несоответствующий в EN) |
| `difficulty` — допустимое значение. | 3 | Один из: «начинающий», «средний», «продвинутый». |
| Поля `guide-version` и `version` соответствуют друг другу. | 4 | Оба поля существуют и имеют одинаковое значение в одном файле. |

**Известная проблема, обнаруживаемая автоматически**: EN Карты серии C используют два разных значения категории («Концептуальная» для c01-c05, «Дизайн» для c06+). Явно отметьте это несоответствие в разделе «Проблемы с метаданными» отчета.

---

## Этап 6: Подсчет баллов и выставление оценок

### Формула оценки (за файл)

```
Total = Version Gap (40) + Content Staleness (20) + FR/EN Parity (20) + Metadata Quality (20)
Score = (Total / 100) * 100  [as a percentage]
```

### Шкала оценок

| Оценка | Счет | Статус |
|-------|-------|--------|
| A | 90-100 | Свежий, полностью синхронизированный |
| B | 80-89 | Хорошо (производственный порог) |
| C | 70-79 | Требуется обновление в ближайшее время |
| D | 60-69 | Устарело, следует расставить приоритеты |
| F | <60 | Критично: вероятно, устаревший контент. |

### Общий балл здоровья

```
Weighted Health = (Sum of WP scores * 2 + Sum of card scores * 1) / (WP count * 2 + card count * 1)
```

Официальные документы имеют двойной вес, поскольку каждая из них состоит из 20–80 страниц, а не двухстраничных карточек с резюме. Устаревший технический документ несет в себе больший риск.

---

## Этап 7: Отчет

Выведите следующий отчет Markdown. Используйте блоки `<details>` для разбивки отдельных файлов, чтобы сохранить возможность сканирования верхнего уровня.

```markdown
# Whitepaper & Recap Card Audit

**Date**: {today}
**Guide Version**: {VERSION}
**Overall Health**: {score}% ({grade})
**Files Audited**: {total} ({wp_count} whitepapers, {card_count} recap cards)

---

## Version Status Dashboard

| Status | Whitepapers | Recap Cards | Total |
|--------|-------------|-------------|-------|
| Fresh (0-1 minor behind)   | N | N | N |
| Stale (2-3 minor behind)   | N | N | N |
| Very Stale (4-10 behind)   | N | N | N |
| Critical (11+ behind)      | N | N | N |

**Versions currently in use**:
- Main WP 00-09: {version} ({gap} minor versions behind)
- Main WP 10: {version} ({gap} minor versions behind)
- Recap cards: {guide-version} ({gap} minor versions behind)

---

## Whitepaper Scores

| WP# | Title | version | Gap | wp-version | Parity | Score | Grade |
|-----|-------|---------|-----|------------|--------|-------|-------|
| 00  | ...   | ...     | -N  | ...        | OK/gap | N%    | X     |
...

<details>
<summary>Individual criteria breakdown (WP 00)</summary>

| Phase | Criterion | Result | Points |
|-------|-----------|--------|--------|
| Version Gap | Guide version current | Critical (-11) | 0/15 |
| Version Gap | wp-version valid semver | OK | 5/5 |
| ... | ... | ... | ... |
| **Total** | | | **N/100** |
</details>

---

## Recap Card Scores

| Series | Cards | Avg guide-version | Avg Gap | Avg Score | Grade |
|--------|-------|-------------------|---------|-----------|-------|
| T (Technical)    | 22 | ... | -N | N% | X |
| M (Methodology)  | 22 | ... | -N | N% | X |
| C (Conceptual)   | 13 | ... | -N | N% | X |

<details>
<summary>Individual card scores</summary>

| Card | Category | guide-version | Gap | Parity | Metadata | Score | Grade |
|------|----------|---------------|-----|--------|----------|-------|-------|
...
</details>

---

## FR/EN Parity Report

### Whitepapers
| WP# | FR | EN | wp-version Match | version Match |
|-----|----|----|------------------|---------------|
...

### Recap Cards
- **FR count**: {N} | **EN count**: {N}
- **Missing FR**: [list or "None"]
- **Missing EN**: [list or "None"]
- **Version mismatches**: [list or "None"]

---

## Metadata Issues

### Known: EN Recap Card Category Inconsistency
EN C-series cards use two different values for the "Conceptual/Design" category:
- "Conceptual": c01, c02, c03, c04, c05
- "Design": c06, c07, c08, ...
Recommendation: standardize to "Design" to match guide terminology.
Affected files: whitepapers/recap-cards/en/c01-*.qmd through c05-*.qmd (change "Conceptual" to "Design")

### Other issues
[List any missing fields, bad formats, date issues...]

---

## Prioritized Action Items

### Critical (Grade F, 11+ versions behind)
[List specific whitepapers with filename paths]

### High (Grade D-F, 2+ versions behind)
[List specific files]

### Medium (Metadata quality, category fixes)
[List specific issues]

### Low (Polish, date alignment)
[List specific issues]

---

## Next Steps

1. Run `/update-whitepapers --since {oldest_version}` to update all stale WPs
2. Fix EN category inconsistency (5 files: c01 through c05, change "Conceptual" to "Design")
3. Re-run `/audit-whitepapers` after updates to track progress
4. Target: 80%+ health (Grade B) across all files
```

---

## Режим исправления (`--fix`)

Если передан `--fix`, добавьте после отчета раздел **Fix Offers**. В этом разделе представлены конкретные исправления, но НЕ модифицируются никакие файлы.

### Патчи версии Frontmatter

Для каждого файла с устаревшей версией руководства выведите:
```yaml
# File: whitepapers/fr/00-introduction-serie.qmd
# Change:
version: "3.27.6"  ->  version: "{current_VERSION}"
date: 2026-02-12   ->  date: {today}
```

### Патчи для исправлений категорий (карточки с резюме на английском языке)

```
Files to update (category: "Conceptual" -> "Design"):
- whitepapers/recap-cards/en/c01-trust-calibration.qmd
- whitepapers/recap-cards/en/c02-*.qmd
- whitepapers/recap-cards/en/c03-*.qmd
- whitepapers/recap-cards/en/c04-*.qmd
- whitepapers/recap-cards/en/c05-*.qmd
```

### Обновление контрольного списка команд

На основе обнаруженных устаревших WP выведите команды `/update-whitepapers` для запуска по порядку:
```
Suggested update sequence:
1. /update-whitepapers --since {oldest_stale_version} --wp 00,01,02,03,04,05,06,07,08,09
2. /update-whitepapers --since {oldest_stale_version} --wp 10
3. Review and bump wp-version for each updated WP (patch = content corrections, minor = new sections)
4. Bump guide-version in all recap cards to {current_VERSION}
5. Re-run /audit-whitepapers to verify
```

---

## Подробный режим (`--verbose`)

При передаче `--verbose` по умолчанию разворачиваются все блоки `<details>` и отображается полная таблица критериев для каждого файла (все критерии, а не только сбои) для каждого проверяемого файла.

---

## Ссылка на исключения

Следующие файлы исключены из оценки (перечислены только в сводке обнаружения):

| Шаблон | Причина |
|---------|--------|
| `strangebee-*.qmd`, `purchasely-*.qmd`, `devwithai-*.qmd` | Пользовательские файлы Client/partner, отдельный жизненный цикл |
| `fiches-recap-serie.qmd`, `fiches/*.qmd` | Файлы Bundle/include, независимое управление версиями отсутствует. |
| `*_quarto.yml`, `references.bib` | Создавайте конфигурацию, а не контент |
| `cheatsheet.qmd` | Перечислено отдельно при обнаружении, не оценивается в основном аудите |
