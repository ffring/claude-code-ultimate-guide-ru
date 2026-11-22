# Журнал подтверждения проверки

Скопируйте этот файл в рабочий элемент перед тестированием изменения, рабочего процесса агента или выбора Best-of-N. Заполните поля доказательствами. Используйте `UNKNOWN`, если проверка не была проведена, не может быть выполнена или имеет неполное покрытие. Не заменяйте его проходным заключением.

Ссылка на метод: [Best-of-N: создать, выбрать и проверить](../../guide/workflows/best-of-n.md). Процедуру многократного создания и выбора см. в навыке [Best-of-N](../skills/best-of-n/SKILL.md).

## 1. Объем и договор приемки

| Поле | Записывать |
| --- | --- |
| Рабочий элемент | `<issue, task, or request>` |
| Дата и владелец | `<ISO date, person or agent>` |
| Репозиторий и редакция | `<remote or path, commit SHA>` |
| В объеме | `<behavior, files, and environments>` |
| Вне области действия | `<explicit exclusions>` |
| Критерии приемки | `<observable requirements>` |
| Обязательные отказы | `<conditions that disqualify delivery>` |
| Граница полномочий | `<permissions, external actions, and approvals>` |

## 2. Окружающая среда и ресурсы

| Поле | Записывать |
| --- | --- |
| ОС и среда выполнения | `<OS, language/runtime versions>` |
| Состояние зависимости или файла блокировки | `<lockfile revision and install state>` |
| Конфигурация и секреты | `<redacted names only; never paste secrets>` |
| Версия данных или прибора | `<source, hash, retention boundary>` |
| Версии инструмента и модели | `<tool, model, harness, and prompt version>` |
| Бюджет времени и затрат | `<limit and actual if available>` |

## 3. Кандидат и протокол отбора

Используйте этот раздел только в том случае, если было создано более одного кандидата. Идентификаторы кандидатов должны быть непрозрачными во время подсчета баллов, где это возможно. Добавьте одну строку таблицы для каждого сгенерированного кандидата. Не пропускайте отклоненных кандидатов или кандидатов, созданных в более позднем пакете.

| Поле | Записывать |
| --- | --- |
| Замороженная версия рубрики | `<path, hash, or dated identifier>` |
| Количество кандидатов, пакетный график и правило остановки | `<N, every declared batch, and between-batch trigger>` |
| Элементы управления изоляцией | `<separate prompts, worktrees, models, or fresh contexts>` |
| Известная корреляция | `<shared model, prompt, tools, state, or none known>` |
| Выбранный кандидат | `<ID and artifact link>` |
| Тай-брейк или синтезаторный рекорд | `<rule used, or new synthesized ID>` |

| Кандидат | Обязательные критерии | Оценка по рубрикам и доказательства | Ссылка на артефакт | Статус |
| --- | --- | --- | --- | --- |
| `<generated candidate ID>` | `<pass/fail>` | `<score, criterion evidence>` | `<path, diff, or URL>` | `<selected/rejected>` |

## 4. Исполняемые проверки

Записывайте каждую фактически выполненную команду. Команда, не указанная здесь, не была проверена этим журналом.

| Проверять | Команда | Среда | Статус выхода | Результат | Ссылка на артефакт |
| --- | --- | --- | ---: | --- | --- |
| Модульные тесты | `<exact command>` | `<environment ID>` | `<0/nonzero>` | `<pass/fail>` | `<output path>` |
| Проверка типа или схемы | `<exact command>` | `<environment ID>` | `<0/nonzero>` | `<pass/fail>` | `<output path>` |
| Линт или статический анализ | `<exact command>` | `<environment ID>` | `<0/nonzero>` | `<pass/fail>` | `<output path>` |
| Сборка или упаковка | `<exact command>` | `<environment ID>` | `<0/nonzero>` | `<pass/fail>` | `<artifact path/hash>` |
| Интеграция или сквозное | `<exact command>` | `<environment ID>` | `<0/nonzero>` | `<pass/fail/UNKNOWN>` | `<output path>` |

## 5. Независимая экспертиза

| Поле | Записывать |
| --- | --- |
| Рецензент | `<person, agent, or service>` |
| Роль рецензента | `<human, fresh-context agent, different model, deterministic system>` |
| Разделение поколений | `<what the reviewer did not receive>` |
| Общий контекст и стимулы | `<model, repository, tools, prompt, or access overlap>` |
| Объем проверки | `<requirements and artifacts examined>` |
| Вердикт и выводы | `<accept/reject/needs changes; links>` |

## 6. Сбои, неизвестные и окончательная претензия

| Категория | Записывать |
| --- | --- |
| Наблюдаемые сбои | `<failed command, symptom, and disposition>` |
| Проверки не выполняются | `<reason and impact>` |
| Неизвестные | `<uncovered behavior, environment, or external state>` |
| Сохранение артефактов | `<paths, hashes, access boundary, and expiry if applicable>` |
| Окончательный статус | `PASS`, `FAIL` или `UNKNOWN` |
| Претензия обоснована этим журналом | `<bounded statement only>` |

`PASS` означает перечисленные критерии приемки, принятые в указанной среде. Это не доказывает поведение, выходящее за рамки этой сферы. `FAIL` означает обязательный критерий или объявленную проверку не удалось. `UNKNOWN` означает, что имеющиеся доказательства не могут поддержать запрошенное утверждение.
