---
title: "Оглавление руководства"
description: "Указатель всех основных файлов документации для освоения Claude Code"
tags: [guide, reference]
---

# Оглавление руководства

[Полное руководство на русском](chapters/README.md) · [Быстрый старт](chapters/01-1-quick-start-day-1.md) · [Семь учебных модулей](learning-path/README.md) · [Telegram @aiffring](https://t.me/aiffring)

Основная документация для освоения Claude Code, организованная по темам.

---

## <a name="getting-started"></a>Начиная

| Файл | Описание | Время |
|------|-------------|------|
| [**путь обучения/**](./learning-path/README.md) | **Структурированный курс обучения из 7 модулей** для начинающих: установка, основной цикл, память, агенты, навыки, приемы, расширенные шаблоны. | 8-11 часов |
| [core/ai-concept-boundaries.md](./core/ai-concept-boundaries.md) | Семь практических отличий понятий, примеры хранилищ и семь сценариев понимания; выборочная адаптация лексиграфа с указанием авторства | Self-paced |
| [learning-path/01-installation.md](./learning-path/01-installation.md) | Модуль 01. Установите Claude Code и убедитесь, что он работает. | 15 мин. |
| [learning-path/02-core-loop.md](./learning-path/02-core-loop.md) | Модуль 02: Понимание цикла взаимодействия и контекста | 45 мин. |
| [learning-path/03-memory.md](./learning-path/03-memory.md) | Модуль 03: Создайте CLAUDE.md и настройте память. | 1 час |
| [learning-path/04-agents.md](./learning-path/04-agents.md) | Модуль 04: Создание специализированных агентов | 1,5 часа |
| [learning-path/05-skills.md](./learning-path/05-skills.md) | Модуль 05: Формируйте многоразовые навыки | 1,5 часа |
| [learning-path/06-hooks.md](./learning-path/06-hooks.md) | Модуль 06: Создание хуков автоматизации | 1 час |
| [learning-path/07-advanced.md](./learning-path/07-advanced.md) | Модуль 07: Многоагентная оркестровка | 2-3 часа |

---

## Основная ссылка

| Файл | Описание | Время |
|------|-------------|------|
| [ultimate-guide.md](./ultimate-guide.md) | Полный справочник, охватывающий все функции Claude Code. | ~3 часа |
| [ultimate-guide.fr.md](./ultimate-guide.fr.md) | Французский перевод полного справочного руководства | ~3 часа |
| [core/translations.md](./core/translations.md) | **Переводы и управление языками**: проверенная атрибуция, исходные данные, измеренная задержка и официальный статус по сравнению с статусом сообщества. | 5 минут |
| [cowork.md](./cowork.md) | Claude Cowork: сводка агентского рабочего стола для нетехнических специалистов. | 10 минут |
| [cheatsheet.md](./cheatsheet.md) | Краткий справочник на 1 странице в печатном виде | 5 минут |
| [core/architecture.md](./core/architecture.md) | Как Claude Code работает внутри (главный цикл, инструменты, контекст) | 25 мин. |
| [core/computer-use.md](./core/computer-use.md) | **Использование компьютера**: границы разрешений, резервный порядок, процедура безопасной работы и пределы проверки. | 12 мин. |
| [core/agent-harness.md](./core/agent-harness.md) | **Agent Harness Engineering**: компоненты времени выполнения, горизонты цикла, безопасность, оценка и оптимизация внешнего цикла. | 35 мин. |
| [core/loop-graph-engineering.md](./core/loop-graph-engineering.md) | **Loop & Graph Engineering**: ограниченная обратная связь, исполняемые графики рабочего процесса, устойчивое состояние, восстановление и распределение оценок. | 25 мин. |
| [core/ai-design-patterns.md](./core/ai-design-patterns.md) | **AI Шаблоны проектирования**: шаблоны GoF, интеграции и устойчивости, сопоставленные с механизмами Claude Code, с режимами сбоя, проверками, собственными шаблонами агентов и антишаблонами. | 20 мин. |
| [core/tools-reference.md](./core/tools-reference.md) | **Полный справочник по инструментам**: все 40 встроенных инструментов, форматы правил разрешений, поведение каждого инструмента (тайм-ауты Bash, редактирование с возможностью чтения перед редактированием, ограничение Glob, WebFetch с потерями), а также инструкции по мониторингу, рабочему процессу, командам агентов, Cron, задачам API | 20 мин. |
| [core/hooks-events-reference.md](./core/hooks-events-reference.md) | **Полный справочник по перехватчикам**: все 33 события перехватчиков, поля сопоставления, схемы ввода, форматы управления принятием решений и значения времени ожидания по умолчанию, с примерами копирования и вставки JSON | 15 мин. |
| [core/settings-reference.md](./core/settings-reference.md) | **Полная ссылка на settings.json**: все подтвержденные настройки и переменные среды. | 15 мин. |
| [core/methodologies.md](./core/methodologies.md) | Справочник по 15 методологиям разработки (TDD, SDD, BDD и т. д.) | 20 мин. |
| [core/visual-reference.md](./core/visual-reference.md) | Визуальная шпаргалка: диаграммы ASCII для ключевых понятий | 5 минут |
| [core/claude-code-releases.md](./core/claude-code-releases.md) | Официальная история выпусков (сокращенная) | 10 минут |
| [core/known-issues.md](./core/known-issues.md) | **Отслеживание критических ошибок**: проблемы безопасности, потребление токенов, проверенные отчеты сообщества | 15 мин. |
| [core/context-engineering.md](./core/context-engineering.md) | **Контекстное проектирование**: бюджет токена, модульная архитектура, сборка команды, конвейер ACE, измерение качества | 25 мин. |
| [core/memory-systems.md](./core/memory-systems.md) | **Memory Systems**: собственный стек (CLAUDE.md, Auto Memory, Auto Dream), межсессионные инструменты (claude-mem, Agentmemory, ICM), совместное использование команд, многоагентные шаблоны, архитектура, риски, блок-схема принятия решений | 30 мин. |
| [core/glossary.md](./core/glossary.md) | **Глоссарий**: терминология Claude Code и смежные понятия агентов (41 термин, формат абзаца, со ссылками на разделы руководства) | 5 минут |
| [core/community-patterns.md](./core/community-patterns.md) | **Шаблоны сообщества**: около 130 шаблонов, придуманных сообществом, термины рабочих процессов, инженерные концепции искусственного интеллекта и краткие справочные определения. | 10 минут |
| [core/skill-design-patterns.md](./core/skill-design-patterns.md) | **Skill Design Patterns**: архитектурные шаблоны для надежных, эффективных с использованием токенов навыков с помощью многоагентных конвейеров. | 20 мин. |
| [core/credits.md](./core/credits.md) | Проекты с открытым исходным кодом и команды инженеров, чья работа легла в основу конкретных закономерностей, описанных в этом руководстве. | 5 минут |
| [диаграммы/](./diagrams/) | **Визуальные диаграммы Series**: 41 интерактивная диаграмма Mermaid для выбора модели, жизненного цикла агента, безопасности, многоагентных шаблонов. | 15 мин. |

---

## Визуальные диаграммы

**48 интерактивных Mermaid диаграммы** в 12 тематических файлах, с GitHub-native Mermaid рендеринг и ASCII запасной вариант для каждой диаграммы. Видеть [diagrams/README.md](./diagrams/README.md) полный навигационный указатель и руководства по вариантам использования.

| Файл | Диаграммы | Темы |
|------|----------|--------|
| [diagrams/01-foundations.md](./diagrams/01-foundations.md) | 4 | 4-слойная модель, конвейер рабочего процесса, дерево решений, режимы разрешений |
| [diagrams/02-context-and-sessions.md](./diagrams/02-context-and-sessions.md) | 4 | Контекстные зоны, иерархия памяти, телепортация сеанса, свежий контекст |
| [diagrams/03-configuration-system.md](./diagrams/03-configuration-system.md) | 4 | Приоритет конфигурации, навыки, команды и агенты, жизненный цикл агента, перехватчики |
| [diagrams/04-architecture-internals.md](./diagrams/04-architecture-internals.md) | 4 | Главный цикл, категории инструментов, сборка системных подсказок, изоляция субагента |
| [diagrams/05-mcp-ecosystem.md](./diagrams/05-mcp-ecosystem.md) | 4 | Карта экосистемы MCP, архитектура MCP, атака с использованием коврика, иерархия конфигурации |
| [diagrams/06-development-workflows.md](./diagrams/06-development-workflows.md) | 5 | Цикл TDD, конвейер с приоритетом спецификации, управление планом, итеративное уточнение, пути беглости ИИ |
| [diagrams/07-multi-agent-patterns.md](./diagrams/07-multi-agent-patterns.md) | 5 | Топологии агентов, рабочие деревья, двойной экземпляр, горизонтальное масштабирование, матрица решений |
| [diagrams/08-security-and-production.md](./diagrams/08-security-and-production.md) | 4 | Трехуровневая защита, решение в песочнице, парадокс проверки, конвейер CI/CD |
| [diagrams/09-cost-and-optimization.md](./diagrams/09-cost-and-optimization.md) | 4 | Выбор модели, оптимизация затрат, уровни подписки, сокращение токенов |
| [diagrams/10-adoption-and-learning.md](./diagrams/10-adoption-and-learning.md) | 3 | Пути адаптации, протокол UVAL, калибровка доверия |
| [diagrams/11-context-engineering.md](./diagrams/11-context-engineering.md) | 4 | Трехуровневая контекстная система, ухудшение соблюдения, модульная архитектура, размещение правил |
| [diagrams/12-enterprise-governance.md](./diagrams/12-enterprise-governance.md) | 3 | Уровни управленческого риска, рабочий процесс утверждения MCP, классификация данных |

---

## Безопасность

| Файл | Описание | Время |
|------|-------------|------|
| [security/security-hardening.md](./security/security-hardening.md) | Угрозы безопасности, проверка MCP, защита от инъекций | 25 мин. |
| [security/sandbox-isolation.md](./security/sandbox-isolation.md) | Docker Песочницы, облачные альтернативы, безопасные автономные рабочие процессы | 10 минут |
| [security/sandbox-native.md](./security/sandbox-native.md) | Нативная песочница Claude Code: конфигурация и модель безопасности | 10 минут |
| [security/production-safety.md](./security/production-safety.md) | Безопасность производства: ограждения, контрольные ворота, стратегии отката | 15 мин. |
| [security/data-privacy.md](./security/data-privacy.md) | Руководство по хранению данных и конфиденциальности | 10 минут |
| [security/agentic-pentesting.md](./security/agentic-pentesting.md) | DarkMoon и Strix: объем выполнения, доказательства использования эксплойтов, раскрытие данных модели и протокол оценки. | Ссылка |
| [security/enterprise-governance.md](./security/enterprise-governance.md) | **Управление на уровне организации**: уставы использования, рабочий процесс утверждения MCP, уровни ограждения (Starter/Standard/Strict/Regulated), соответствие требованиям | 25 мин. |

---

## Экосистема

| Файл | Описание | Время |
|------|-------------|------|
| [ecosystem/ai-ecosystem.md](./ecosystem/ai-ecosystem.md) | Дополнительные инструменты искусственного интеллекта (Perplexity, Gemini, Kimi, NotebookLM, TTS), а также кандидат Mistral Large 4 API. | 30 мин. |
| [ecosystem/plugin-distribution.md](./ecosystem/plugin-distribution.md) | **Распространение плагинов**: границы пакета, доверие на рынке, подсказки по рекомендациям и проверки выпуска | 15 мин. |
| [ecosystem/agentic-tools.md](./ecosystem/agentic-tools.md) | **Сравнение инструментов агента**: Hermes Agent, Codex CLI, Aider, Devin, SWE-агент, CrewAI, LangGraph, AutoGen, система принятия решений | 20 мин. |
| [ecosystem/mcp-vs-cli.md](./ecosystem/mcp-vs-cli.md) | Руководство по принятию решений **MCP и CLI**: когда использовать серверы MCP и инструменты CLI в рабочих процессах Claude Code, компромиссы и аспекты принятия решений | 15 мин. |
| [ecosystem/claude-code-guide-mcp.md](./ecosystem/claude-code-guide-mcp.md) | **Guide Технический справочник MCP**: установка по клиенту, опубликованные и возможные возможности, архитектура, границы сети и конфиденциальности, поведение в автономном режиме, устранение неполадок и устаревшие метрики | 12 мин. |
| [ecosystem/agent-harness-landscape.md](./ecosystem/agent-harness-landscape.md) | **Agent Harness Map**: строгие среды выполнения, оркестраторы, смежные проекты и исходный исследовательский уровень для оптимизаторов проводки и мета-обвязки. | 10 минут |
| [ecosystem/mcp-servers-ecosystem.md](./ecosystem/mcp-servers-ecosystem.md) | **Серверы сообщества MCP**: 8 проверенных серверов (Playwright, Semgrep, Kubernetes и т. д.) с производственными конфигурациями | 25 мин. |
| [ecosystem/third-party-tools.md](./ecosystem/third-party-tools.md) | **Инструменты сообщества**: графические интерфейсы, TUI, менеджеры конфигурации, трекеры токенов; [Сравнение рабочего пространства рабочего стола](./ecosystem/third-party-tools.md#desktop-agent-workspace-comparison) | 15 мин. |
| [ecosystem/context-engineering-tools.md](./ecosystem/context-engineering-tools.md) | **Оптимизация контекста и токенов**: сжатие вывода (RTK, в создании которого ранее участвовал автор руководства; запас), оперативное сжатие (LLMLingua), шлюзы AI (Edgee, Portkey), RAG, LLMOps | 20 мин. |
| [ecosystem/remarkable-ai.md](./ecosystem/remarkable-ai.md) | Замечательные модели использования ИИ и методы опытных пользователей | 10 минут |
| [ecosystem/practitioner-insights.md](./ecosystem/practitioner-insights.md) | **Полевые отчеты практиков**: 75 перефразированных идей из IFTTD, Devoxx, Dev With AI Meetup, ByteByteGo, Stanford Online и корпуса видео Павана Белагатти за 2026 год, организованных по темам (контекстная инженерия, агентные шаблоны, оценка LLM, безопасность агентов, DevX и внедрение). | 20 мин. |
| [ecosystem/team-knowledge-base.md](./ecosystem/team-knowledge-base.md) | **Инфраструктура знаний команды**: трехуровневая структура (статическое хранилище Markdown, соединители MCP для работающих систем, RAG в масштабе), порог RAG (~100–1000 документов), Atlassian/Notion/GitBook MCP, Onyx/LlamaCloud/Ragie, распространение плагинов, мост Code+Cowork | 18 мин. |
| [ecosystem/local-vs-cloud-inference.md](./ecosystem/local-vs-cloud-inference.md) | **Локальная и облачная экономика**: 10 сопоставимых сборок оборудования (размером llmfit), цены на аренду графического процессора OVH/AWS/Lambda/RunPod, прогноз совокупной стоимости владения на 1 год, облачная пропускная способность Claude по сравнению с GPT-5.6, структура принятия решений | 20 мин. |
| [ecosystem/ai-executive-agents.md](./ecosystem/ai-executive-agents.md) | **AI исполнительные агенты**: глубокое погружение в OpenExecutive, альтернативы с открытым исходным кодом (станьте генеральным директором, OneManCompany, CrewAI) с проверенной статистикой GitHub, таблицей маршрутизации по ролям (финансовый директор, директор по маркетингу, руководитель отдела кадров, главный юрисконсульт, совет директоров), пополнение или замена и угол управления синтетическим директором | 12 мин. |

---

## Роли и усыновление

| Файл | Описание | Время |
|------|-------------|------|
| [roles/ai-roles.md](./roles/ai-roles.md) | Ограниченная фактическими данными карта семейств ролей ИИ, специализаций, конвергенции крошечных команд и карьерных путей | 25 мин. |
| [roles/adoption-approaches.md](./roles/adoption-approaches.md) | Стратегии реализации для команд | 15 мин. |
| [roles/learning-with-ai.md](./roles/learning-with-ai.md) | Руководство для юниоров по использованию ИИ без потери навыков | 15 мин. |
| [roles/agent-evaluation.md](./roles/agent-evaluation.md) | **Показатели качества агентов**: измерение эффективности индивидуального агента с помощью ловушек, тестов и циклов обратной связи. | 20 мин. |

---

## Операции

| Файл | Описание | Время |
|------|-------------|------|
| [ops/devops-sre.md](./ops/devops-sre.md) | Система FIRE для диагностики инфраструктуры и реагирования на инциденты | 30 мин. |
| [ops/observability.md](./ops/observability.md) | Мониторинг сеансов и отслеживание затрат | 15 мин. |
| [ops/api-gateway.md](./ops/api-gateway.md) | Шлюзы **API**: отдельное поведение шлюза приложений Claude от сторонних элементов управления прокси, таких как LiteLLM и Portkey. | 15 мин. |
| [ops/ai-traceability.md](./ops/ai-traceability.md) | Атрибуция ИИ, политика раскрытия информации, git-ai, соответствие требованиям | 20 мин. |
| [ops/team-metrics.md](./ops/team-metrics.md) | **Командные показатели для разработки дополненной ИИ**: DORA, SPACE, DX Core 4, сигналы, специфичные для ИИ, по размеру команды (5–25 человек). | 20 мин. |
| [ops/ai-unit-economics.md](./ops/ai-unit-economics.md) | **AI Экономика подразделения**: разложение затрат на каждую задачу, рычаги реальных затрат (маршрутизация, изоляция субагентов, критерии выхода), точка безубыточности автономного агента, управление командным бюджетом | 15 мин. |
| [ops/subscription-strategy.md](./ops/subscription-strategy.md) | **Стратегия подписки в масштабе команды**: упражнения по портфолио Claude, Codex, Copilot, Gemini, Cursor и Mistral; элементы управления шлюзом API; пробелы в контрактах по личному плану; и сценарная автономная экономика | 20 мин. |
| [ops/ai-finops.md](./ops/ai-finops.md) | **AI FinOps (точка входа в раздел)**: три режима затрат (квота подписки, измеренные токены, собственные мощности), цикл «Информирование-оптимизация-эксплуатация», применяемый к агентам, и карта каждого рычага затрат с указанием того, что он не решает. | 12 мин. |
| [ops/llm-market-snapshot.md](./ops/llm-market-snapshot.md) | **LLM Снимок рынка (30 сентября 2026 г., Mistral Large 4 добавлен 06 октября 2026 г.)**: цены на основе проверенных источников, квоты на подписку, региональная обработка, контрольные показатели и рабочая нагрузка одного гипотетического агента. | 20 мин. |

---

## Рабочие процессы

Практические руководства по эффективным шаблонам разработки:

| Файл | Описание |
|------|-------------|
| [workflows/tdd-with-claude.md](./workflows/tdd-with-claude.md) | Разработка через тестирование с помощью Claude |
| [workflows/spec-first.md](./workflows/spec-first.md) | Специализированная разработка (SDD) |
| [workflows/plan-driven.md](./workflows/plan-driven.md) | Эффективное использование режима /plan |
| [workflows/iterative-refinement.md](./workflows/iterative-refinement.md) | Итеративные циклы улучшения |
| [workflows/best-of-n.md](./workflows/best-of-n.md) | Создавайте независимых кандидатов, выбирайте с помощью замороженных критериев, проверяйте и сохраняйте журнал проверки. |
| [workflows/tts-setup.md](./workflows/tts-setup.md) | Добавление голосового комментария в Claude Code (18 минут) |
| [workflows/task-management.md](./workflows/task-management.md) | Многосессионное отслеживание задач, миграция TodoWrite |
| [workflows/agent-teams.md](./workflows/agent-teams.md) | Организация мультиагентных команд для решения сложных задач. |
| [workflows/agent-teams-quick-start.md](./workflows/agent-teams-quick-start.md) | Краткое руководство по шаблонам групп агентов |
| [workflows/agentic-software-factories.md](./workflows/agentic-software-factories.md) | Карта ориентации: от одного сеанса до фабрики ПО и когда закрытая платформа действительно побеждает |
| [../examples/workflows/bounded-loop-contract.md](../examples/workflows/bounded-loop-contract.md) | Работоспособный контракт с ограниченным циклом с отдельным интерфейсом проверки, бюджетом попыток, доказательствами и эскалацией. |
| [workflows/dynamic-workflows.md](./workflows/dynamic-workflows.md) | Многоагентные конвейеры, управляемые JavaScript: детерминированный поток управления, параллельное разветвление, автоматическое возобновление |
| [workflows/dual-instance-planning.md](./workflows/dual-instance-planning.md) | Планирование с двумя экземплярами: Opus планирует, Sonnet выполняет |
| [workflows/event-driven-agents.md](./workflows/event-driven-agents.md) | Шаблоны координации агентов, управляемые событиями |
| [workflows/monitor-event-delegation.md](./workflows/monitor-event-delegation.md) | Монитор command/WebSocket, подключаемые мониторы, каналы, процедуры и безопасное делегирование Codex |
| [workflows/github-actions.md](./workflows/github-actions.md) | Пошаговая настройка действия клауд-кода: проверка PR при упоминании, автоматическая проверка при нажатии, сортировка проблем |
| [workflows/reviewable-agent-changes.md](./workflows/reviewable-agent-changes.md) | Обоснование различий: что заметка агента записывает для каждого фрагмента, хранение и перезапись заметок в git, устаревшие заметки, отзывы, вводимые в виде вопроса или изменения, протестированный шаблон. | 15 мин. |
| [workflows/code-review.md](./workflows/code-review.md) | Автоматизированный многоагентный PR-анализ для Teams и Enterprise: настройка, триггеры, конфигурация REVIEW.md, управление затратами |
| [workflows/ai-assisted-open-source-contributions.md](./workflows/ai-assisted-open-source-contributions.md) | Политика вклада, воспроизведение, понимание автора, доказательства проверки и последующие действия со стороны сопровождающего |
| [workflows/production-reliability.md](./workflows/production-reliability.md) | Модели надежности производства: проектирование эскалации, автоматические выключатели, структурированное распространение ошибок, постепенное ухудшение |
| [workflows/support-csm-agent.md](./workflows/support-csm-agent.md) | Внутренний агент support/CSM: сортировка заявок, диагностика БД, CRM через MCP |
| [workflows/plan-pipeline.md](./workflows/plan-pipeline.md) | Конвейер комплексного планирования: запуск, проверка, выполнение |
| [workflows/design-to-code.md](./workflows/design-to-code.md) | Преобразовать Figma/wireframes в рабочий код |
| [workflows/exploration-workflow.md](./workflows/exploration-workflow.md) | Систематически исследуйте незнакомые кодовые базы. |
| [workflows/pdf-generation.md](./workflows/pdf-generation.md) | Создавайте профессиональные PDF-файлы с помощью Quarto/Typst |
| [workflows/search-tools-mastery.md](./workflows/search-tools-mastery.md) | Объединенные рабочие процессы Master rg, grepai, Serena, ast-grep |
| [workflows/skeleton-projects.md](./workflows/skeleton-projects.md) | Используйте проверенные в боевых условиях репозитории в качестве основы для новых проектов. |
| [workflows/talk-pipeline.md](./workflows/talk-pipeline.md) | 6-этапная подготовка выступления: от исходного материала до слайдов |
| [workflows/team-ai-instructions.md](./workflows/team-ai-instructions.md) | Масштабируйте CLAUDE.md в командах, состоящих из нескольких разработчиков. |

---

## Коворкинговая документация

Для работников умственного труда, использующих Claude Cowork (агентный рабочий стол):

| Ресурс | Описание |
|----------|-------------|
| **[Cowork Hub](https://github.com/FlorianBruniaux/claude-cowork-guide/blob/main/README.md)** | Полная документация Cowork |
| [Начало работы](https://github.com/FlorianBruniaux/claude-cowork-guide/blob/main/guide/01-getting-started.md) | Настройка и первый рабочий процесс |
| [Возможности](https://github.com/FlorianBruniaux/claude-cowork-guide/blob/main/guide/02-capabilities.md) | Чем занимается Cowork can/cannot |
| [Руководство по безопасности](https://github.com/FlorianBruniaux/claude-cowork-guide/blob/main/guide/03-security.md) | Практика безопасного использования |
| [Библиотека подсказок](https://github.com/FlorianBruniaux/claude-cowork-guide/tree/main/prompts) | 50+ готовых к использованию подсказок |
| [Шпаргалка](https://github.com/FlorianBruniaux/claude-cowork-guide/blob/main/reference/cheatsheet.md) | Краткий справочник на 1 страницу |

---

## Рекомендуемый порядок чтения

1. **Новые пользователи**: Начните с раздела быстрого запуска в `ultimate-guide.md`
2. **Ежедневный справочник**: Распечатать `cheatsheet.md`
3. **Руководители группы**: прочитайте `roles/adoption-approaches.md`, чтобы узнать о стратегиях развертывания.
4. **Фокус безопасности**: `security/security-hardening.md`, затем `security/sandbox-isolation.md`
5. **Глубокая архитектура**: `core/architecture.md`, затем `diagrams/`

---

*Вернуться к [main README](../README.md)*
