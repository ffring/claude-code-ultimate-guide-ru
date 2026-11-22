# Аудит команд и моделей, 24 сентября 2026 г.

Рабочие ссылки были проверены на соответствие официальной документации, полученной 24 сентября, и журналу изменений Claude Code до версии 2.1.281. Это аудит документации и примеров кода, а не живое тестирование каждого плана, поставщика или модели API.

## <a name="sources"></a>Источники

- [Claude Code Конфигурация модели](https://code.claude.com/docs/en/model-config): псевдонимы, различия поставщиков, настройки учетной записи по умолчанию, усилия, настойчивость и контроль мышления.
- [Справочник команд](https://code.claude.com/docs/en/commands), [CLI справочник](https://code.claude.com/docs/en/cli-reference)и [интерактивные элементы управления](https://code.claude.com/docs/en/interactive-mode): команды, флаги и ярлыки.
- [Спецификации модели](https://platform.claude.com/docs/en/models/overview) и [API Цены](https://platform.claude.com/docs/en/about-claude/pricing): идентификаторы моделей, контекст, выходные ограничения и стандартные тарифы.
- [Быстрый режим](https://code.claude.com/docs/en/fast-mode), [Удаленное управление](https://code.claude.com/docs/en/remote-control), [Команды агентов](https://code.claude.com/docs/en/agent-teams)и [Настройки](https://code.claude.com/docs/en/settings-reference): поведение, зависящее от функции.
- [Структурированные выходные данные](https://platform.claude.com/docs/en/build-with-claude/structured-outputs): текущая схема JSON и строгий инструментальный синтаксис.
- [Журнал изменений Upstream](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md): границы версий, включая удаление TaskOutput в версии 2.1.278. На справочной странице инструмента он по-прежнему описывается как устаревший; более позднее явное удаление имеет здесь приоритет.

## Текущая ссылка

Стандартные цены прямого API в долларах США за миллион токенов input/output:

| Модель | ИДЕНТИФИКАТОР | Ввод/вывод | Контекст | Claude Code усилие по умолчанию |
|-------|----|----------------|---------|----------------------------|
| Opus 5.5 | `claude-opus-5-5` | $4 / $20 | 1M | середина |
| Sonnet 5 | `claude-sonnet-5` | $2 / $10 | 1M | высокий |
| Haiku 4.5 | `claude-haiku-4-5-20251001` | $1 / $5 | 200K | Не поддерживается |
| Басня 5.1 | `claude-fable-5-1` | $10 / $50 | 1M | высокий |

Быстрый режим Opus 5.5 стоит 8/40 долларов. Собственные модели 1M не наследуют старую премию выше 200 000 или требования к бета-заголовку. Псевдонимы поставщиков могут разрешаться для более старых моделей, поэтому псевдоним облака не является универсальным идентификатором версии.

## Охват и решения

| Поверхность | Действие |
|---------|--------|
| Основное руководство по английскому языку и ежедневная шпаргалка | Обновите выбор модели, цены, мышление, настройки, список команд, ярлыки, дистанционное управление и рекомендации по инструментам для задач. |
| Полное руководство на французском языке | Исправьте затронутые разделы модели, ценообразования, мышления и команд; сохранить заявленный статус устаревшего перевода, поскольку это не полный повторный перевод |
| Страницы «Архитектура, контекст, операции, экосистема и команды агентов» | Исправьте активные примеры и утверждения; сохранять измерения привязанными к фактически измеренной модели |
| Шпаргалки English/French и источники для печати | Обновите разделы model/command в WP02, WP04, WP07, WP08 и затронутых карточках резюме; увеличить версии документа |
| Викторина | Правильное наследование модели, переключение мышления, требования к команде, отладка MCP и вопросы в быстром режиме в каноническом веб-банке и сгенерированном банке CLI. |
| Примеры | Правильная цена резервной модели, настроенные скорости регистрации, структурированные выходные данные и чтение выходных данных фонового агента. |
| Машиночитаемые индексы и индексы MCP. | Синхронизируйте описания, дополнения команд, ссылки и позиционные ссылки. |
| Исторические выпуски, рекомендации по безопасности, оценки ресурсов и тесты. | Сохраните исходные названия моделей, даты, затронутые версии и измеренные затраты. |
| Значки сторонних моделей и образцы исторических расшифровок | Сохраните документированный исходный выбор или образец; не заявляйте о непроверенной совместимости с новой моделью |
| Установленные личные навыки и глобальная конфигурация модели | Вне этого аудита; распространяемые примеры редактируются без их установки |

Все 114 названий команд, представленных строками в полученном официальном справочнике, присутствуют в основном руководстве на английском языке. В это число входят удаленные команды и записи с ограниченным доступом к функциям; это не утверждение, что одна установка предоставляет 114 команд.

Распределенные примеры навыков `plan-pipeline` меняют только инструкции по чтению вывода. Их заголовок, имена обнаружения и описания маршрутизации остаются неизменными. Это переносимые шаблоны, а не установленные проекции хоста; активация активного маршрутизатора не заявлена.

## Границы проверки

Регрессия резервного ценообразования использует десять идентификаторов моделей, включая датированный идентификатор Haiku. Семь случаев не увенчались успехом до исправления, и все они проходят позже. В оценках используются стандартные курсы токенов; они не являются счетами поставщика услуг и не включают в себя премии за быстрый режим.

Проверки синтаксиса, индекса, зеркала, теста и рендеринга записываются вместе с изменением. Никакие платные запросы моделей, настройки организации или глобальные навыки не изменяются для проверки документации. Успешная статическая сборка не обеспечивает постоянную доступность для каждого поставщика.

Происхождение перевода должно быть обновлено из проверенного английского источника. Обновление выбранных разделов на французском языке не означает, что полный французский перевод является текущим.

## Проверки завершены перед публикацией

- Позиционный индекс: проверено 906 ссылок, ноль сломан; разрешаются все 793 связанных привязки и 61 объявленная позиционная привязка. Все 106 отслеживаемых страниц справочника индексируются.
- Викторина CLI: все 17 категорий соответствуют каноническому веб-банку; пройдены три теста CLI.
- Посадка: пройдено 258 тестов, включая фиксы localhost HTTP. Статическая сборка создает 462 страницы; инвентарь ссылок проверяет 583 HTML-документа и 1782 локальных объекта. Внешние URL-адреса находятся за пределами этого автономного результата. Сорок шесть диаграмм отображаются в формате SVG; три сохраняют свой резервный текст.
- Резервное ценообразование: прошло десять модельных случаев; оба измененных сценария оболочки проходят проверку синтаксиса. В сводке сеанса теперь отображаются пиковые входные токены, не предполагая, что каждая модель имеет окно в 200 КБ.
- Экспорт печати: восстановлено 22 PDF-файла. Двенадцать карточек резюме остаются на одной странице каждая; Две ежедневные шпаргалки состоят из пяти страниц каждая. В восьми затронутых технических документах также были перестроены файлы EPUB. В четырех архивах серий хранится по 22 карты каждый.
- Пакет MCP: все 37 тестов и полный этап проверки выпуска, включая восстановленный манифест продукта, документацию, метаданные реестра и содержимое пакета.
- Сканирование общедоступного контента: отсутствие нарушений пути к рабочей станции в 1438 исходных и обработанных файлах. Исходные и связанные справочные файлы MCP побайтно идентичны.

## Изменены файлы руководства.

Сопутствующий лендинг содержит соответствующую веб-викторину, шпаргалку, данные reader/search и файлы для загрузки. Портфель содержит версии PDF/ZIP и список разрешенных для них загрузок.

- `CHANGELOG.md`
- `README.md`
- `docs/audits/2026-09-24-commands-models.md`
- `examples/config/settings-personalization.json`
- `examples/hooks/bash/session-summary.sh`
- `examples/modes/README.md`
- `examples/scripts/session-stats.sh`
- `examples/skills/plan-pipeline/execute/SKILL.md`
- `examples/skills/plan-pipeline/start/SKILL.md`
- `examples/skills/plan-pipeline/validate/SKILL.md`
- `examples/styles/custom-style-template.md`
- `guide/cheatsheet.md`
- `guide/core/architecture.md`
- `guide/core/community-patterns.md`
- `guide/core/context-engineering.md`
- `guide/core/known-issues.md`
- `guide/core/settings-reference.md`
- `guide/core/tools-reference.md`
- `guide/diagrams/09-cost-and-optimization.md`
- `guide/ecosystem/agentic-tools.md`
- `guide/ecosystem/ai-ecosystem.md`
- `guide/ecosystem/local-vs-cloud-inference.md`
- `guide/learning-path/03-memory.md`
- `guide/ops/ai-unit-economics.md`
- `guide/ops/api-gateway.md`
- `guide/ops/devops-sre.md`
- `guide/ops/observability.md`
- `guide/ops/subscription-strategy.md`
- `guide/roles/agent-evaluation.md`
- `guide/ultimate-guide.fr.md`
- `guide/ultimate-guide.md`
- `guide/workflows/agent-teams-quick-start.md`
- `guide/workflows/agent-teams.md`
- `guide/workflows/dual-instance-planning.md`
- `guide/workflows/iterative-refinement.md`
- `guide/workflows/plan-pipeline.md`
- `llms.txt`
- `machine-readable/llms.txt`
- `machine-readable/mcp-product.json`
- `machine-readable/reference.yaml`
- `machine-readable/translations.json`
- `mcp-server/content/llms.txt`
- `mcp-server/content/reference.yaml`
- `mcp-server/content/translations.json`
- `quiz/questions/01-quick-start.yaml`
- `quiz/questions/02-core-concepts.yaml`
- `quiz/questions/03-memory-settings.yaml`
- `quiz/questions/04-agents.yaml`
- `quiz/questions/05-skills.yaml`
- `quiz/questions/06-commands.yaml`
- `quiz/questions/07-hooks.yaml`
- `quiz/questions/08-mcp-servers.yaml`
- `quiz/questions/09-advanced-patterns.yaml`
- `quiz/questions/10-reference.yaml`
- `quiz/questions/11-learning-with-ai.yaml`
- `quiz/questions/12-architecture.yaml`
- `quiz/questions/13-security.yaml`
- `quiz/questions/14-privacy-observability.yaml`
- `quiz/questions/15-ai-ecosystem.yaml`
- `quiz/questions/16-agent-harness-context.yaml`
- `quiz/questions/17-team-metrics.yaml`
- `scripts/test-session-summary-pricing.py`
- `whitepapers/CHANGELOG.md`
- `whitepapers/en/02-customization.qmd`
- `whitepapers/en/04-architecture.qmd`
- `whitepapers/en/07-reference-guide.qmd`
- `whitepapers/en/08-agent-teams.qmd`
- `whitepapers/en/cheatsheet.pdf`
- `whitepapers/en/cheatsheet.qmd`
- `whitepapers/fr/02-personnalisation.qmd`
- `whitepapers/fr/04-architecture.qmd`
- `whitepapers/fr/07-guide-reference.qmd`
- `whitepapers/fr/08-agent-teams.qmd`
- `whitepapers/fr/cheatsheet.pdf`
- `whitepapers/fr/cheatsheet.qmd`
- `whitepapers/recap-cards/en/01-commandes-essentielles.qmd`
- `whitepapers/recap-cards/en/m08-agents-custom.qmd`
- `whitepapers/recap-cards/en/m16-multi-agent-topologie.qmd`
- `whitepapers/recap-cards/en/t18-modeles-thinking-modes.qmd`
- `whitepapers/recap-cards/en/t19-context-window-200k-1m.qmd`
- `whitepapers/recap-cards/en/t21-fast-mode-api.qmd`
- `whitepapers/recap-cards/fr/01-commandes-essentielles.qmd`
- `whitepapers/recap-cards/fr/m08-agents-custom.qmd`
- `whitepapers/recap-cards/fr/m16-multi-agent-topologie.qmd`
- `whitepapers/recap-cards/fr/t18-modeles-thinking-modes.qmd`
- `whitepapers/recap-cards/fr/t19-context-window-200k-1m.qmd`
- `whitepapers/recap-cards/fr/t21-fast-mode-api.qmd`
