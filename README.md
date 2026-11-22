# Полное руководство по Claude Code

Русское издание **Claude Code Ultimate Guide** Флориана Брюньо (Florian Bruniaux), версия **3.46.0**. Канал проекта перевода в Telegram — [@aiffring](https://t.me/aiffring).

- [Быстрый старт](guide/chapters/01-1-quick-start-day-1.md)
- [Полное руководство](guide/chapters/README.md) · [Оглавление](guide/README.md)
- [Практический курс из семи модулей](guide/learning-path/README.md) · [Учебные слайды](docs/distribution/claude-code-learning-path-slides.pptx)
- [Шпаргалка](guide/cheatsheet.md) · [Шпаргалка в PDF](cheatsheet.pdf)
- [Примеры и шаблоны](examples/README.md) · [Викторина](quiz/README.md)
- [Технические статьи](whitepapers/ru/) · [Карточки для повторения](whitepapers/recap-cards/ru/)

Перевод выполнен машинно, ключевые точки входа и форматы проверены. В командах и исполняемых примерах сохранён синтаксис оригинала. Часть текста внутри примеров, диаграмм и изображений доступна на языке оригинала.

Автор оригинала — **Florian Bruniaux**. Перевод распространяется по лицензии [CC BY-SA 4.0](LICENSE), а переиспользуемые шаблоны — по [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) согласно условиям автора. [Исходный проект](https://github.com/FlorianBruniaux/claude-code-ultimate-guide) · [Ревизия перевода `4db037e`](https://github.com/FlorianBruniaux/claude-code-ultimate-guide/tree/4db037e0de5779a4836430da681e40a048fb0f95)

<table>
  <tr>
    <td width="64">
      <a href="https://www.florian.bruniaux.com/about/?utm_source=github&amp;utm_medium=readme&amp;utm_campaign=claude-code-ultimate-guide"><img src="https://cc.bruniaux.com/author.png" width="56" height="56" alt="Florian Bruniaux" /></a>
    </td>
    <td>
      <strong><a href="https://www.florian.bruniaux.com/about/?utm_source=github&amp;utm_medium=readme&amp;utm_campaign=claude-code-ultimate-guide">Флориан BRUNIAUX</a></strong> &middot; Внешний директор по ИИ (CAIO) <br />
      Около 15 лет в программном обеспечении, в том числе от 8 до 10 лет в техническом руководстве &middot; <a href="https://www.florian.bruniaux.com/blog/?utm_source=github&amp;utm_medium=readme&amp;utm_campaign=claude-code-ultimate-guide">Блог &#8599;</a> &middot; <a href="https://www.florian.bruniaux.com/projects/?utm_source=github&amp;utm_medium=readme&amp;utm_campaign=claude-code-ultimate-guide">Проекты &#8599;</a>
    </td>
  </tr>
</table>

<p align="center">
  <a href="https://cc.bruniaux.com/"><img src="https://img.shields.io/badge/Interactive_Guide-cc.bruniaux.com-ff6b35?style=for-the-badge" alt="Open the interactive guide" /></a>
</p>

<p align="center">
  <a href="./CHANGELOG.md"><img src="https://img.shields.io/badge/Guide-v3.46.0-brightgreen?style=flat-square" alt="Guide version 3.46.0" /></a>
  <a href="./CHANGELOG.md"><img src="https://img.shields.io/badge/Updated-Nov_22,_2026_·_v3.46.0-brightgreen?style=flat-square" alt="Updated Oct 17, 2026, guide version 3.46.0" /></a>
  <a href="https://creativecommons.org/licenses/by-sa/4.0/"><img src="https://img.shields.io/badge/Guide-CC_BY--SA_4.0-blue?style=flat-square" alt="Guide license: CC BY-SA 4.0" /></a>
  <a href="https://cc.bruniaux.com/mcp/"><img src="https://img.shields.io/badge/MCP-npx_ready-blueviolet?style=flat-square" alt="MCP server available through npx" /></a>
  <a href="https://deepwiki.com/FlorianBruniaux/claude-code-ultimate-guide"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki" /></a>
</p>

Руководство охватывает работу с Claude Code от установки и первой сессии до агентов, MCP и эксплуатации в команде. Интерактивный сайт и внешние ресурсы доступны в оригинале.

## Выберите свой следующий шаг

Таблица ниже создана на основе [`machine-readable/navigation.json`](./machine-readable/navigation.json). Один и тот же контракт передает общедоступную карту сайта, поэтому репозиторий и веб-сайт предоставляют одну и ту же модель намерений.

<!-- BEGIN GENERATED INTENT NAVIGATION -->
| Намерение | Просмотр онлайн |
|---|---|
| **Начало** | [Портал гидов](https://cc.bruniaux.com/guide/) · [Краткий старт](https://cc.bruniaux.com/guide/ultimate-guide/01-quick-start/) · [Схемы обучения](https://cc.bruniaux.com/learning/) · [Краткий справочник](https://cc.bruniaux.com/cheatsheet/) · [AI Роли](https://cc.bruniaux.com/roles/) |
| **Build** | [Проектирование проводки агентов](https://cc.bruniaux.com/guide/agent-harness/) · [Проектирование циклов и графов](https://cc.bruniaux.com/guide/loop-graph-engineering/) · [AI Шаблоны проектирования](https://cc.bruniaux.com/ai-design-patterns/) · [Контекстное проектирование](https://cc.bruniaux.com/context-engineering/) · [Системы памяти](https://cc.bruniaux.com/memory-systems/) · [Рабочие процессы](https://cc.bruniaux.com/guide/workflows/) · [Методики](https://cc.bruniaux.com/methodologies/) · [MCP или CLI?](https://cc.bruniaux.com/mcp-or-cli/) · [Примеры](https://cc.bruniaux.com/examples/) |
| **Масштаб** | [Безопасность](https://cc.bruniaux.com/security/) · [Управление предприятием](https://cc.bruniaux.com/guide/enterprise-governance/) · [Наблюдаемость](https://cc.bruniaux.com/guide/observability/) · [Командные показатели](https://cc.bruniaux.com/team-metrics/) · [Внедрение в команду](https://cc.bruniaux.com/guide/adoption-approaches/) · [AI FinOps](https://cc.bruniaux.com/finops/) · [LLM Обзор рынка](https://cc.bruniaux.com/guide/llm-market-snapshot/) · [Стратегия подписки](https://cc.bruniaux.com/guide/subscription-strategy/) · [AI Экономика подразделения](https://cc.bruniaux.com/guide/ai-unit-economics/) · [Командные знания](https://cc.bruniaux.com/guide/team-knowledge-base/) · [API Шлюз](https://cc.bruniaux.com/guide/api-gateway/) |
| **Ресурсы** | [Ресурсный центр](https://cc.bruniaux.com/resources/) · [Загрузки](https://cc.bruniaux.com/downloads/) · [Шпаргалки](https://cc.bruniaux.com/cheatsheets/) · [Электронные книги](https://cc.bruniaux.com/whitepapers/) · [Диаграммы](https://cc.bruniaux.com/diagrams/) · [Экосистема](https://cc.bruniaux.com/ecosystem/) · [Сравнить](https://cc.bruniaux.com/compare/) · [Глоссарий](https://cc.bruniaux.com/guide/glossary/) · [FAQ](https://cc.bruniaux.com/faq/) · [Руководство MCP Сервер](https://cc.bruniaux.com/mcp/) · [Связанные проекты](https://cc.bruniaux.com/projects/) |
| **Обновления** | [Справочник изменений](https://cc.bruniaux.com/changelog/) · [Claude Code Релизы](https://cc.bruniaux.com/releases/) · [RSS-канал](https://cc.bruniaux.com/rss.xml) |
<!-- END GENERATED INTENT NAVIGATION -->

## Почему существует это руководство

Документация Claude Code объясняет продукт. Это руководство связывает поведение продукта с инженерными решениями: что относится к контексту, когда использовать агента вместо навыка, как проверять выполненную работу и что контролирует ситуацию, когда использование выходит за пределы одного разработчика.

| Нуждаться | Начните с |
|---|---|
| Понимание внутреннего устройства Claude Code | [Архитектура](./guide/core/architecture.md) и [Справочник инструментов](./guide/core/tools-reference.md) |
| Проектирование агентских систем | [Проектирование проводки агентов](./guide/core/agent-harness.md), [Проектирование циклов и графов](./guide/core/loop-graph-engineering.md) и [AI Шаблоны проектирования](./guide/core/ai-design-patterns.md) |
| Структура доставки с помощью искусственного интеллекта | [Методики](./guide/core/methodologies.md) и [Руководства по рабочим процессам](./guide/workflows/) |
| Установите границу безопасности | [Усиление безопасности](./guide/security/security-hardening.md) и [Изоляция песочницы](./guide/security/sandbox-isolation.md) |
| Подтвердите понимание | [Контроль знаний](https://cc.bruniaux.com/quiz/) и [Карточки для подведения итогов](https://cc.bruniaux.com/cheatsheets/) |

Руководство отдает предпочтение явным компромиссам и проверяемым процедурам. Если доказательства неполны, соответствующая страница должна сохранить это ограничение вместо того, чтобы представлять один рабочий процесс как универсальный.

## Начинать

### Установить Claude Code

Anthropic рекомендует использовать собственный установщик, который обновляется сам:

```bash
# macOS, Linux, WSL
curl -fsSL https://claude.ai/install.sh | bash
```

```powershell
# Windows PowerShell
irm https://claude.ai/install.ps1 | iex
```

Альтернативы, которые не обновляются автоматически: `brew install --cask claude-code`, `winget install Anthropic.ClaudeCode` или `npm install -g @anthropic-ai/claude-code` (Node.js 22+). См. официальную страницу настройки [](https://code.claude.com/docs/en/setup).

Проверьте установку и авторизуйтесь:

```bash
claude --version
claude doctor
claude auth login
```

В главе [Quick Start](./guide/ultimate-guide.md#1-quick-start-day-1) описаны варианты установки, аутентификация, обновления, режимы разрешений и распространенные сбои в первый день.

### Выполните первое задание

Откройте небольшой репозиторий с чистым или понятным состоянием Git, затем запустите Claude Code:

```bash
cd your-project
claude
```

Дайте Claude ограниченный запрос, включающий ожидаемый результат и проверку:

```text
Explain how this project runs its tests. Do not modify files.
Name the relevant commands and cite the files that define them.
```

Прежде чем просить Claude отредактировать код, добавьте `CLAUDE.md` уровня проекта, в котором записаны команды и ограничения, которым должен следовать Claude:

```markdown
# Project instructions

## Commands
- Test: `npm test`
- Lint: `npm run lint`

## Boundaries
- Do not edit generated files.
- Do not change dependencies without approval.
- Run the relevant tests before claiming completion.
```

Продолжайте выполнять первый рабочий процесс [](./guide/ultimate-guide.md#12-first-workflow) или используйте стартовые шаблоны [CLAUDE.md](./examples/claude-md/).

### Выберите путь обучения

| Ситуация | Предлагаемый маршрут |
|---|---|
| Новое в Claude Code | [Семимодульный курс обучения](./guide/learning-path/README.md) |
| Уже использую CLI | [Основные понятия](./guide/ultimate-guide.md#2-core-concepts), затем [Контекстная инженерия](./guide/core/context-engineering.md) |
| Старший разработчик или технический руководитель | [Методологии](./guide/core/methodologies.md), [Проектирование систем управления агентами](./guide/core/agent-harness.md), затем [Производственная безопасность](./guide/security/production-safety.md) |
| Технический менеджер или технический директор | [Подходы к внедрению](./guide/roles/adoption-approaches.md), [Показатели команды](./guide/ops/team-metrics.md), затем [Стратегия подписки](./guide/ops/subscription-strategy.md) |
| Роль безопасности или платформы | [Усиление безопасности](./guide/security/security-hardening.md), [Управление предприятием](./guide/security/enterprise-governance.md), затем [Observability](./guide/ops/observability.md) |
| Менеджер по продукту или дизайнер | [Руководство менеджера по продуктам](./docs/for-product-managers.md) или [Рабочий процесс проектирования в код](./guide/workflows/design-to-code.md) |
| Интеллектуальный работник, не являющийся разработчиком | [Claude Cowork Руководство](https://github.com/FlorianBruniaux/claude-cowork-guide) |

Для персонализированного маршрута используйте приглашение для подключения к репозиторию:

```bash
claude "Fetch and follow the onboarding instructions from: https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/tools/onboarding-prompt.md"
```

## Строить

### Агент инжиниринг

Агент — это один из компонентов более крупной системы. Окружающая проводка управляет контекстом, инструментами, разрешениями, состоянием, условиями остановки, восстановлением и оценкой.

| Ресурс | Решение, которое он поддерживает |
|---|---|
| [Проектирование жгутов агентов](./guide/core/agent-harness.md) | Определите элементы управления, необходимые для цикла агента. |
| [Минимальная обвязка](https://www.florian.bruniaux.com/resources/minimal-harness/?utm_source=github&utm_medium=readme&utm_campaign=harness-minimal&utm_content=readme) | Воспроизведите три версии службы регистрации, чтобы обнаружить ложное срабатывание. Заполняемый PDF-файл по электронной почте. |
| [Проектирование циклов и графов](./guide/core/loop-graph-engineering.md) | Выбирайте ограниченные циклы обратной связи или явные графики рабочего процесса. |
| [AI Шаблоны проектирования](./guide/core/ai-design-patterns.md) | Объясните конструкцию агента с помощью шаблонов GoF, интеграции и устойчивости, известных разработчикам. |
| [Карта проводки агента](./guide/ecosystem/agent-harness-landscape.md) | Различать среды выполнения, оркестраторы, платформы, плоскости управления и инструменты поддержки. |
| [Agentic Tools](./guide/ecosystem/agentic-tools.md) | Сравните выбранные агенты кодирования и продукты оркестрации |
| [Оценка агента](./guide/roles/agent-evaluation.md) | Тестовое поведение, регрессии и результаты на уровне задач |
| [Глоссарий обвязок](./guide/core/glossary.md) | Согласуйте терминологию при проектировании и проверке. |
| [AI Границы концепции](./guide/core/ai-concept-boundaries.md) | Разрешите семь распространенных ошибок с помощью примеров репозиториев и проверок понимания. |

### Контекст и память

Качество контекста влияет на каждый вызов инструмента и решение. Начните с инструкций по проекту, добавляйте специализированный контекст только тогда, когда это необходимо для повторяющейся задачи, и проверяйте, меняет ли поведение дополнительный материал.

| Ресурс | Фокус |
|---|---|
| [Контекстная инженерия](./guide/core/context-engineering.md) | Контекстный бюджет, модульные инструкции, сборка и измерение |
| [Системы памяти](./guide/core/memory-systems.md) | Встроенная память, кросс-сессионные системы, совместное использование командой и риски хранения |
| [Инструменты контекстного проектирования](./guide/ecosystem/context-engineering-tools.md) | Сжатие вывода, извлечение, шлюзы и проверка контекста |
| [Аудит контекста](./tools/context-audit-prompt.md) | Измерьте контекстную архитектуру проекта |
| [Инструкции для Team AI](./guide/workflows/team-ai-instructions.md) | Поддерживать общие инструкции для всей команды разработчиков. |

### Рабочие процессы

| Цель | Рабочий процесс |
|---|---|
| Сначала реализуйте с помощью тестов | [TDD с Claude](./guide/workflows/tdd-with-claude.md) |
| Определите поведение перед реализацией | [Специальная разработка](./guide/workflows/spec-first.md) |
| Отделить планирование от исполнения | [Плановая разработка](./guide/workflows/plan-driven.md) |
| Сравнить независимых кандидатов | [Best-of-N](./guide/workflows/best-of-n.md) |
| Координируйте работу нескольких агентов | [Команды агентов](./guide/workflows/agent-teams.md) |
| Построение ограниченных автономных циклов | [Агентические фабрики программного обеспечения](./guide/workflows/agentic-software-factories.md) |
| Систематически проверяйте код | [Просмотр кода](./guide/workflows/code-review.md) |
| Сделайте изменения, написанные агентом, доступными для проверки | [Просматриваемые изменения агента](./guide/workflows/reviewable-agent-changes.md) |
| Подготовьте вклад, который сможет просмотреть другая команда. | [ZВклады с открытым исходным кодом с помощью AI](./guide/workflows/ai-assisted-open-source-contributions.md) |
| Диагностика незнакомых репозиториев | [Рабочий процесс разведки](./guide/workflows/exploration-workflow.md) |

[Просматривайте каждый рабочий процесс](./guide/workflows/) для управления задачами, GitHub Actions, надежности производства, агентов, управляемых событиями, проектирования в код, создания PDF-файлов, поиска и командных инструкций.

### Выбирайте самый маленький интерфейс

Claude Code может вызывать локальные команды, навыки, агенты, перехватчики, плагины и серверы MCP. Дополнительная инфраструктура добавляет настройку, разрешения, режимы сбоя и обслуживание.

| Если задача требует | Предпочитать |
|---|---|
| Детерминированное местное командование | CLI или скрипт |
| Многоразовые инструкции и вспомогательные файлы | Навык |
| Отдельный контекст и роль | Агент |
| Реакция на событие жизненного цикла | Хук |
| Упакованный набор возможностей | Плагин |
| Типизированный интерфейс к удаленному сервису | MCP сервер |

Прежде чем вводить еще одну интеграцию, воспользуйтесь руководством по принятию решений [MCP или CLI](./guide/ecosystem/mcp-vs-cli.md) и системой компромиссов [](./guide/ultimate-guide.md#when-to-use-what).

## Шкала

### Надежность и безопасность

| Беспокойство | Основной ресурс | Оперативный компаньон |
|---|---|---|
| Разрешения и быстрое внедрение | [Усиление безопасности](./guide/security/security-hardening.md) | [Аудит разрешений](./tools/permissions-audit-prompt.md) |
| Изоляция ненадежного выполнения | [Изоляция песочницы](./guide/security/sandbox-isolation.md) | [Встроенная песочница](./guide/security/sandbox-native.md) |
| Производственные изменения и откат | [Производственная безопасность](./guide/security/production-safety.md) | [Надежность производства](./guide/workflows/production-reliability.md) |
| Конфиденциальные данные и их хранение | [Конфиденциальность данных](./guide/security/data-privacy.md) | [Управление предприятием](./guide/security/enterprise-governance.md) |
| Активное тестирование авторизованных приложений | [Агентное пентестирование](./guide/security/agentic-pentesting.md) | [DarkMoon и оценка Стрикса](./docs/resource-evaluations/darkmoon-strix-agentic-pentesting.md) |
| MCP и расширение цепочки поставок | [MCP Экосистема](./guide/ecosystem/mcp-servers-ecosystem.md) | [База данных угроз](./examples/commands/resources/threat-db.yaml) |
| Готовность делегирования | [Аудит полноты спецификации](./tools/spec-completeness-audit.md) | [Оценка агента](./guide/roles/agent-evaluation.md) |

Заявления о безопасности и количество угроз меняются по мере добавления или исправления источников. Используйте связанную базу данных и руководства в качестве текущего источника вместо копирования их показателей в проектную документацию.

### Оценка и операции

| Нуждаться | Ресурс |
|---|---|
| Поведение и сбои агента трассировки | [Наблюдаемость](./guide/ops/observability.md) |
| Атрибутировать изменения с помощью ИИ | [AI Прослеживаемость](./guide/ops/ai-traceability.md) |
| Оценивайте результаты команды | [Командные показатели](./guide/ops/team-metrics.md) |
| Рассчитать стоимость на уровне задачи | [AI Экономика подразделения](./guide/ops/ai-unit-economics.md) |
| Управление рабочими процессами инфраструктуры | [DevOps & SRE](./guide/ops/devops-sre.md) |
| Маршрут регулируется трафиком API | [API Шлюзы](./guide/ops/api-gateway.md) |

Зелёная структурная проверка доказывает только то, что она проверяла. Поведение во время выполнения, принятие задач, границы безопасности и бизнес-результаты требуют отдельных доказательств.

### Организация и экономика

| Решение | Ресурс |
|---|---|
| Распространите Claude Code в команде | [Подходы к усыновлению](./guide/roles/adoption-approaches.md) |
| Определение уровней использования и утверждений | [Управление предприятием](./guide/security/enterprise-governance.md) |
| Сохраняйте знания команды | [База знаний команды](./guide/ecosystem/team-knowledge-base.md) |
| Сравните подписки, API и шлюзы | [Стратегия подписки](./guide/ops/subscription-strategy.md) |
| Сравните размещенный и локальный вывод | [Локальный или облачный вывод](./guide/ecosystem/local-vs-cloud-inference.md) |
| Карта изменения ролей ИИ | [AI Роли](./guide/roles/ai-roles.md) |

На страницах экономики наблюдаемые затраты отделены от оценок и сценариев. Пересчитайте их с учетом вашей рабочей нагрузки, критериев приемки, усилий по проверке и ограничений риска.

## Используйте формат, соответствующий задаче

| Формат | Используйте его для | Читать онлайн | Источник или скачать |
|---|---|---|---|
| Полная ссылка | Подробные объяснения и связанные разделы | [Полное руководство](https://cc.bruniaux.com/guide/ultimate-guide/) | [Markdown](./guide/ultimate-guide.md) |
| Ежедневная справка | Команды, сочетания клавиш и проверки | [Краткая справка](https://cc.bruniaux.com/cheatsheet/) | [Markdown](./guide/cheatsheet.md) |
| Курс с гидом | Прогрессивные упражнения с сохраненными доказательствами | [Пути обучения](https://cc.bruniaux.com/learning/) | [Источники курсов](./guide/learning-path/) |
| Рабочие материалы | Агенты, навыки, приемы, рабочие процессы и сценарии | [Примеры](https://cc.bruniaux.com/examples/) | [Файлы](./examples/) |
| Визуальное объяснение | Карты архитектуры, контекста, безопасности и рабочих процессов | [Диаграммы](https://cc.bruniaux.com/diagrams/) | [Источники диаграмм](./guide/diagrams/) |
| Проверка знаний | Вопросы со ссылками на документацию | [Викторина](https://cc.bruniaux.com/quiz/) | [Источники вопросов](./quiz/) |
| Справочник для печати | Одна концепция на странице на французском и английском языках. | [Шпаргалки](https://cc.bruniaux.com/cheatsheets/) | [Источники карт](./whitepapers/recap-cards/) |
| Полное издание | Оффлайн PDF и EPUB | [Электронные книги](https://cc.bruniaux.com/whitepapers/) | [Загрузки](https://cc.bruniaux.com/downloads/) |
| Машиночитаемый индекс | Поиск и извлечение с помощью ИИ-помощника | [Руководство MCP](https://cc.bruniaux.com/mcp/) | [llms.txt](./machine-readable/llms.txt) и [reference.yaml](./machine-readable/reference.yaml) |

## Сервер MCP: используйте руководство любого клиента кодирования.

<!-- mcp-product:start -->
Установите руководство как сервер stdio MCP и отправляйте запросы к нему из Claude Code, Codex, Cursor, VS Code или другого клиента MCP.

```bash
claude mcp add --scope user claude-code-guide -- npx -y claude-code-ultimate-guide-mcp@1.3.8
codex mcp add claude-code-guide -- npx -y claude-code-ultimate-guide-mcp@1.3.8
```

Конфигурация Claude Code в рамках проекта принадлежит `.mcp.json`:

```json
{
  "mcpServers": {
    "claude-code-guide": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "claude-code-ultimate-guide-mcp@1.3.8"]
    }
  }
}
```

| Возможность | Считать | Имена |
| --- | ---: | --- |
| Инструменты | 17 | `compare_versions`, `diff_official_docs`, `get_changelog`, `get_cheatsheet`, `get_digest`, `get_example`, `get_release`, `get_threat`, `init_official_docs`, `list_examples`, `list_threats`, `list_topics`, `read_section`, `refresh_official_docs`, `search_examples`, `search_guide`, `search_official_docs` |
| Ресурсы | 7 | `claude-code-guide://agent-harnesses`, `claude-code-guide://ai-design-patterns`, `claude-code-guide://distribution-channels`, `claude-code-guide://llms`, `claude-code-guide://reference`, `claude-code-guide://releases`, `claude-code-guide://translations` |
| Промпты | 1 | `claude-code-expert` |
| Сопутствующие команды | 5 | `/ccguide:daily`, `/ccguide:diff-docs`, `/ccguide:init-docs`, `/ccguide:refresh-docs`, `/ccguide:search-docs` |

Операции со списками и индекс поиска используют связанное содержимое. Раздел, пример, шпаргалка, журнал изменений, дайджест (`get_digest`) и инструменты угроз могут получать содержимое GitHub и записывать 24-часовой локальный кеш. Инструменты инициализации и обновления официального документа извлекают документацию Anthropic и записывают отдельные локальные снимки.

[Каноническое техническое руководство, установка, конфиденциальность, ограничения и датированная статистика](./guide/ecosystem/claude-code-guide-mcp.md)

[Пакет README и диагностика](./mcp-server/README.md)

Сопутствующие команды, полученные из репозитория: `/ccguide:daily`, `/ccguide:diff-docs`, `/ccguide:init-docs`, `/ccguide:refresh-docs`, `/ccguide:search-docs`.
<!-- mcp-product:end -->

### Загрузите руководство в другой помощник

Используйте небольшой индекс для обнаружения:

```bash
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/machine-readable/llms.txt
```

Используйте [reference.yaml](./machine-readable/reference.yaml), когда помощнику нужны структурированные маршруты по темам и ссылки на полное руководство. Инструкции по техническому обслуживанию содержатся в машиночитаемой документации [](./machine-readable/README.md), а не в данном README.

## Дополнительная экосистема

Ни один репозиторий не должен охватывать обучение, установку, курирование, справочные материалы и каждый специализированный интерфейс. Выберите ресурс, соответствующий текущей задаче.

| Нуждаться | Ресурс | Что это дает |
|---|---|---|
| Проверьте поведение Claude Code | [Официальная документация Claude Code](https://code.claude.com/docs) | Первичная документация на продукт |
| Изучите архитектуру, компромиссы, безопасность и рабочие процессы. | [Claude Code Руководство](https://cc.bruniaux.com/guide/) | Пояснения, рекомендации по принятию решений, эксплуатационные проверки и примеры |
| Откройте для себя общественные проекты | [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | Кураторские ссылки в экосистеме |
| Установить коллекцию конфигураций | [everything-claude-code](https://github.com/affaan-m/everything-claude-code) | Пакетированные агенты, навыки, перехватчики и конфигурации |
| Просмотрите устанавливаемые шаблоны | [claude-code-templates](https://github.com/davila7/claude-code-templates) | Каталог шаблонов и дистрибутив CLI |
| Начните с официальных примеров навыков | [anthropics/skills](https://github.com/anthropics/skills) | Примеры навыков, поддерживаемых Anthropic |
| Просмотрите рынок навыков | [skills.sh](https://skills.sh/) | Маршруты поиска и установки опубликованных навыков |
| Кураторские хуки Claude Code | [awesome-claude-code-hooks](https://github.com/loqimean/awesome-claude-code-hooks) | Кураторский список хуков Claude Code |
| Работа за пределами разработки программного обеспечения | [Claude Cowork Руководство](https://github.com/FlorianBruniaux/claude-cowork-guide) | Рабочие процессы для работников умственного труда |
| Сравните возможности агента кодирования | [AI Матрица кодирующих агентов](https://coding-agents-matrix.dev) | Сравнение функций между агентами |

Этот краткий список был рассмотрен 31 августа 2026 г. Деятельность проекта, методы установки и объем могут измениться. Сначала просмотрите общедоступные страницы [Ecosystem](https://cc.bruniaux.com/ecosystem/) и [Compare](https://cc.bruniaux.com/compare/). Источник экосистемы [AI](./guide/ecosystem/ai-ecosystem.md), [Источник сторонних инструментов](./guide/ecosystem/third-party-tools.md)и [Resource Evaluations](./docs/resource-evaluations/) содержат более глубокие доказательства.

Информацию о рабочих пространствах рабочего стола поверх существующих интерфейсов командной строки агента см. в документе «Сравнение рабочих пространств [» за октябрь 2026 г.](./guide/ecosystem/third-party-tools.md#desktop-agent-workspace-comparison), включая рабочий процесс local/cloud в Conductor и примечания по обслуживанию Vibe Kanban.

## Обновления

Изменения в руководствах и выпуски продуктов Claude Code отвечают на разные вопросы:

| Кормить | Треки | Источник |
|---|---|---|
| [Справочник изменений](https://cc.bruniaux.com/changelog/) | Новые страницы, исправления и основные изменения репозитория. | [CHANGELOG.md](./CHANGELOG.md) |
| [Claude Code Релизы](https://cc.bruniaux.com/releases/) | Claude Code Версии продукта и влияние на эксплуатацию | [Источник выпуска](./guide/core/claude-code-releases.md) |
| [RSS-канал](https://cc.bruniaux.com/rss.xml) | Опубликованное руководство и обновления продукта в программе чтения каналов. | Создано на сайте |

Недавние дополнения к руководству включают в себя:

- [Mistral Large 4: оценка](./docs/resource-evaluations/mistral-large-4.md): данные о запуске 6 октября, рекламные цены, независимые результаты, региональные выводы и ожидаемые веса; интегрирован в моментальный снимок рынка [](./guide/ops/llm-market-snapshot.md) и экосистему [AI](./guide/ecosystem/ai-ecosystem.md#21-mistral-large-4-multimodal-api-candidate).
- [Loop & Graph Engineering](https://cc.bruniaux.com/guide/loop-graph-engineering/) ([source](./guide/core/loop-graph-engineering.md)): ограниченная обратная связь, состояние рабочего процесса, правила остановки, восстановление и распределение оценок.
- [AI Шаблоны проектирования](https://cc.bruniaux.com/ai-design-patterns/) ([source](./guide/core/ai-design-patterns.md)): классические шаблоны, сопоставленные с механизмами Claude Code, где каждая аналогия нарушается, собственные шаблоны агентов и антишаблоны.
- [Стратегия подписки](https://cc.bruniaux.com/guide/subscription-strategy/) ([source](./guide/ops/subscription-strategy.md)): места, API, шлюзы, сценарии самостоятельного размещения и шлюзы принятия решений в масштабе команды.
- [Межсессионный обмен сообщениями](https://cc.bruniaux.com/guide/workflows/cross-session-messaging/) ([source](./guide/workflows/cross-session-messaging.md)): обнаружение одноранговых узлов, доставка, границы безопасности и средства управления коррелированным дрейфом.

Используйте журнал изменений для полной истории. README должен предоставлять только небольшой выбор тока.

## Языки и переводы

Английское является каноническим изданием. В этом репозитории поддерживается французский язык. Упрощенный китайский, украинский и латиноамериканский испанский языки являются независимыми изданиями сообщества с отдельными графиками обновлений.

| Язык | Версия |
|---|---|
| Английский | [Каноническое руководство](./guide/ultimate-guide.md) |
| Франсэ | [Руководство на французском языке находится в этом репозитории](./guide/ultimate-guide.fr.md) |
| 简体中文 | [Издание сообщества от JAYcodr](https://github.com/JAYcodr/claude-code-ultimate-guide-zh) |
| Українська | [Издание сообщества от gerasimsergey](https://github.com/gerasimsergey/claude-code-ultimate-guide-ua) |
| Латиноамериканский испанский | [Издание сообщества от Richardls](https://github.com/Richardls/claude-code-ultimate-guide-es) |

Страница статуса перевода [](./guide/core/translations.md) записывает сопровождающих, исходные фиксации, покрытие, измеренную задержку и статус проверки.

## Карта репозитория

```text
guide/
├── ultimate-guide.md       Complete reference
├── learning-path/          Guided course
├── core/                   Architecture, tools, context, methods
├── security/               Hardening, isolation, privacy, governance
├── ecosystem/              Agents, MCP, tools, inference, knowledge
├── roles/                  Adoption, learning, evaluation, careers
├── ops/                    Observability, metrics, economics, gateways
├── workflows/              Task-oriented delivery guides
└── diagrams/               Mermaid diagrams with text fallbacks

examples/                   Reusable agents, skills, hooks, and workflows
machine-readable/           Structured indexes and release data
mcp-server/                 Packaged guide access for MCP clients
quiz/                       Local knowledge validation
docs/resource-evaluations/  Reviewed external resources
whitepapers/                French and English long-form sources
```

Подробный указатель [guide](./guide/README.md), [каталог примеров](./examples/README.md)и [индекс инструментов](./tools/README.md) являются каноническими страницами навигации для этих каталогов.

## Содействие

Исправления, недостающие доказательства, неработающие ссылки, примеры, вопросы викторины и улучшения документации приветствуются. Прочтите [CONTRIBUTING.md](./CONTRIBUTING.md) перед открытием запроса на извлечение.

Полезные направления вклада:

- Сообщите о неправильной или устаревшей претензии через [GitHub Issues](https://github.com/FlorianBruniaux/claude-code-ultimate-guide/issues).
- Отправьте внешний ресурс через процесс оценки ресурса [](./docs/resource-evaluations/README.md).
- Предложите целенаправленное руководство или рабочий процесс с его источниками, границами и методом проверки.
- Улучшите пример, не ослабляя существующие проверки безопасности.

## Сопровождающий

Флориан Бруньо поддерживает это руководство.

[GitHub](https://github.com/FlorianBruniaux) · [LinkedIn](https://www.linkedin.com/in/florian-bruniaux-43408b83/) · [Портфолио](https://www.florian.bruniaux.com/)

<!-- BEGIN GENERATED RELATED PROJECTS -->
<!-- Source: https://github.com/FlorianBruniaux/FlorianBruniaux/blob/main/ecosystem/projects.json; project: claude-code-guide -->
## Исследуйте экосистему

Эти проекты расширяют рабочий процесс без дублирования этого инструмента:

- **Установить с помощью [claude-code-plugins](https://github.com/FlorianBruniaux/claude-code-plugins)**: перейти от пояснений к устанавливаемым шаблонам.
- **Проверка с помощью [ctxharness](https://github.com/FlorianBruniaux/ctxharness)**: проверьте, соответствуют ли документированный контекст и инструкции репозиторию.
- **Защита с помощью [agentsec-triage](https://github.com/FlorianBruniaux/agentsec-triage)**: подключение рекомендаций по безопасности к версионному оперативному каналу.
- **Продолжить работу с руководством [Claude Cowork](https://github.com/FlorianBruniaux/claude-cowork-guide)**: переключитесь на рабочие процессы, предназначенные для работников умственного труда и лиц, не являющихся разработчиками.

[Просмотреть всю галактику с открытым исходным кодом](https://github.com/FlorianBruniaux#open-source-galaxy)
<!-- END GENERATED RELATED PROJECTS -->

## Лицензия

В руководстве используется [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). В шаблонах многократного использования используется [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Прежде чем распространять смешанный контент, проверьте файлы лицензий репозитория.

Следите за выпусками [GitHub](https://github.com/FlorianBruniaux/claude-code-ultimate-guide/releases) или подпишитесь на канал [RSS](https://cc.bruniaux.com/rss.xml) для получения обновлений.

---

*Версия 3.46.0 | Обновление ежедневно · 22 ноября 2026 г.*
