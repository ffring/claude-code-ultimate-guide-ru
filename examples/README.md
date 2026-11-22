---
title: "Claude Code Примеры"
description: "Аннотированные шаблоны объясняют, почему шаблоны работают, с компромиссами и альтернативами."
tags: [template, reference, workflows, architecture]
---

# Claude Code примеры

Аннотированные шаблоны, которые научат вас **зачем** шаблоны работают, а не только то, как их настроить. Каждый шаблон включает комментарии, объясняющие компромиссы, альтернативы и моменты отклонения.

> **[📚 Просмотр автоматически созданного каталога](./CATALOG.md)**: индексируется по сложности, времени и домену (238 шаблонов в шести категориях каталога; всего 271 производственный шаблон)
> **[🔍 Просмотр интерактивного каталога](./index.html)**: просмотр, копирование и загрузка шаблонов с подсветкой синтаксиса.

## Новинка: автоматически создаваемый каталог.

**[`CATALOG.md`](./CATALOG.md)** теперь автоматически генерируется на основе метаданных шаблона, организованных по:
- **Сложность**: начинающий, средний, продвинутый
- **Time**: от 5 минут до 4+ часов
- **Domain**: безопасность, тестирование, развертывание, производительность, архитектура, автоматизация.
- **Keywords**: Теги с возможностью поиска для удобства обнаружения

Каждый шаблон включает метаданные:
```yaml
---
name: template-name
description: One-line description
complexity: beginner|intermediate|advanced
time: 5 min|15 min|30 min|1 hour|2 hours|4+ hours|varies
domain: security|testing|deployment|etc
prerequisites: []
status: stable|experimental|deprecated
keywords: [tag1, tag2]
---
```

**Полную спецификацию см. в [`docs/template-metadata-schema.md`](../docs/template-metadata-schema.md)**.

## Структура

| Папка | Описание | Считать |
|--------|-------------|-------|
| [`agents/`](./agents/) | Пользовательские персонажи ИИ для специализированных задач | 21 + 2 коллекции |
| [`commands/`](./commands/) | Слэш-команды (автоматизация рабочего процесса) | 52 |
| [`hooks/`](./hooks/) | Сценарии безопасности и автоматизации, управляемые событиями | 39 записей в каталоге |
| [`skills/`](./skills/) | Многоразовые модули знаний, включая [9 на SkillHub](https://skills.palebluedot.live/owner/FlorianBruniaux). | 118 записей в каталоге |
| [`claude-md/`](./claude-md/) | Профили конфигурации CLAUDE.md | 7 |
| [`config/`](./config/) | Настройки, MCP, шаблоны git | 6 |
| [`memory/`](./memory/) | Шаблоны файлов памяти CLAUDE.md | 1 |
| [`rules/`](./rules/) | Правила поведения для распространенных шаблонов отзывов | 5 |
| [`scripts/`](./scripts/) | Диагностические и служебные сценарии | 17 |
| [`team-config/`](./team-config/) | Шаблоны адаптации команды | 3 |
| [`templates/`](./templates/) | Шаблоны сеансов и рабочих процессов | 2 |
| [`github-actions/`](./github-actions/) | Рабочие процессы CI/CD | 6 |
| [`workflows/`](./workflows/) | Расширенные рабочие процессы разработки, включая ограниченные циклы, эксперименты по использованию и прием на рассмотрение. | 6 |
| [`plugins/`](./plugins/) | Плагины сообщества (SE-CoVe, claude-mem) | 2 |
| [`integrations/`](./integrations/) | Интеграция внешних инструментов (Agent Vibes TTS) | 3 |
| [`context-engineering/`](./context-engineering/) | Шаблоны и профили контекстной инженерии | 10 |
| [`mcp-configs/`](./mcp-configs/) | Конфигурации сервера MCP | 1 |
| [`modes/`](./modes/) | Поведенческие режимы (СуперКлод) | 1 |
| [`semantic-anchors/`](./semantic-anchors/) | Точный словарь для улучшения результатов LLM | 1 |
| [`multi-provider/`](https://github.com/FlorianBruniaux/cc-copilot-bridge) | Межпровайдерский мост → выделенный репозиторий | - |

## Вклад, способность обзора и понимание

- Пакет вкладов, подготовленный при содействии [AI](templates/ai-assisted-contribution.md): доказательства и пояснения автора перед отправкой
- [Просмотр рабочего листа допуска](workflows/review-admission.md): общие мощности, правила pause/resume и настольное упражнение
- [Инструкция по противодействию подключению](workflows/lean-harness-experiment.md): протестируйте один повторяющийся сбой, разрешенный случай, альтернативные пути и затраты на контроль
- [Упражнение на понимание обзора](learning-project/review-comprehension-exercise.md): объясните, встревожьте, диагностируйте и эскалируйте

Эти рабочие листы представляют собой предлагаемые процедуры. Их примеры не подтверждают соблюдение требований во время выполнения или измерение прироста обучения и пропускной способности.

## <a name="quick-start"></a>Быстрый старт

1. Скопируйте нужный вам шаблон
2. Настройте под свой проект
3. Поместите в правильное место (см. пути ниже)

## Расположение файлов

| Тип | Местоположение проекта | Глобальное местоположение |
|------|------------------|-----------------|
| Агенты | `.claude/agents/` | `~/.claude/agents/` |
| Навыки | `.claude/skills/` | `~/.claude/skills/` |
| Команды | `.claude/commands/` | `~/.claude/commands/` |
| Хуки | `.claude/hooks/` | `~/.claude/hooks/` |
| Конфигурация | `.claude/` | `~/.claude/` |
| Память | `./CLAUDE.md` или `.claude/CLAUDE.md` | `~/.claude/CLAUDE.md` |
| Режимы | - | `~/.claude/MODE_*.md` |

> **Windows**: Замените `~/.claude/` на `%USERPROFILE%\.claude\`.

## Индекс шаблонов

### Агенты (23)

| Файл | Цель | Модель |
|------|---------|-------|
| [code-reviewer.md](./agents/code-reviewer.md) | Тщательный анализ кода | Sonnet |
| [test-writer.md](./agents/test-writer.md) | Генерация тестов TDD/BDD | Sonnet |
| [security-auditor.md](./agents/security-auditor.md) | Обнаружение уязвимостей безопасности | Sonnet |
| [refactoring-specialist.md](./agents/refactoring-specialist.md) | Чистый рефакторинг кода | Sonnet |
| [output-evaluator.md](./agents/output-evaluator.md) | LLM — ворота качества судьи | Haiku |
| [devops-sre.md](./agents/devops-sre.md) | Устранение неполадок инфраструктуры с помощью FIRE framework | Sonnet |
| [planner.md](./agents/planner.md) | Стратегическое планирование, только для чтения, перед реализацией | Opus |
| [implementer.md](./agents/implementer.md) | Механическое исполнение, ограниченный объем | Haiku |
| [architecture-reviewer.md](./agents/architecture-reviewer.md) | Обзор архитектуры и дизайна, только для чтения | Opus |
| [adr-writer.md](./agents/adr-writer.md) | Генератор записей решений по архитектуре, только для чтения | Opus |
| [integration-reviewer.md](./agents/integration-reviewer.md) | Валидатор интеграции во время выполнения, только для чтения | Sonnet |
| [plan-challenger.md](./agents/plan-challenger.md) | Обзор состязательного плана по 5 измерениям, только для чтения | Sonnet |
| [planning-coordinator.md](./agents/planning-coordinator.md) | Агент синтеза для динамичных исследовательских групп, только для чтения. | Sonnet |
| [security-patcher.md](./agents/security-patcher.md) | Применяет исправления безопасности на основе результатов аудита и предлагает на рассмотрение | Sonnet |
| [analytics-with-eval/](./agents/analytics-with-eval/) | Сборник: агент аналитики + хуки оценки | - |
| [кибер-защита/](./agents/cyber-defense/) | Коллекция: детектор аномалий, сборщик журналов, классификатор рисков, репортер угроз. | - |

### Навыки (68) · [9 на SkillHub](https://skills.palebluedot.live/owner/FlorianBruniaux)

| Файл | Цель |
|------|---------|
| [agent-обоснование/](./skills/agent-rationale/) | Записывайте намерение, отклоненную альтернативу, риск, доказательства и открытые вопросы для каждого фрагмента в заметках git, привязанных к хешу фрагмента, с обнаружением и тестированием устаревших примечаний. |
| [git-ai-archeology/](./skills/git-ai-archaeology/) | Археология Git-истории кода ИИ: создание, удаление, копирование и удаление каждого файла конфигурации, использование ИИ-трейлера в месяц, этапы зрелости |
| [токен-аудит/](./skills/token-audit/) | Измерьте накладные расходы токена с фиксированным контекстом, классифицируйте правила по частоте использования, стоимости проверки, составьте план приоритетных действий. |
| [дизайн-шаблоны/](./skills/design-patterns/) | Обнаружение и анализ шаблонов проектирования GoF с помощью рекомендаций по стеку. |
| [tdd-workflow.md](./skills/tdd-workflow.md) | Процесс разработки через тестирование |
| [security-checklist.md](./skills/security-checklist.md) | Топ-10 проверок безопасности OWASP |
| [pdf-generator.md](./skills/pdf-generator.md) | Профессиональное создание PDF-файлов (Quarto/Typst) |
| [уточнение голоса/](./skills/voice-refine/) | Написание уточнения голоса с помощью примеров before/after |
| [ast-grep-patterns.md](./skills/ast-grep-patterns.md) | Шаблоны поиска кода на основе AST |
| [rtk-оптимизатор/](./skills/rtk-optimizer/) | Анализ оптимизации токена RTK |
| [audit-агенты-навыки/](./skills/audit-agents-skills/) | Аудит качества агентов, навыков и команд |
| [skill-создатель/](./skills/skill-creator/) | Создавайте новые навыки с помощью правильной структуры и лучших практик. |
| [генератор целевых страниц/](./skills/landing-page-generator/) | Создавайте готовые к развертыванию целевые страницы из любого репозитория. |
| [ccboard/](./skills/ccboard/) | Комплексная панель управления TUI/Web для мониторинга Claude Code |
| [руководство-резюме/](./skills/guide-recap/) | Преобразование записей CHANGELOG в социальный контент (LinkedIn, Twitter/X, Slack) |
| [генератор примечаний к выпуску/](./skills/release-notes-generator/) | Создавайте примечания к выпуску в трех форматах на основе коммитов git. |
| [pr-triage/](./skills/pr-triage/) | 4-этапное управление резервом PR (аудит, глубокий анализ, подтвержденные комментарии, настройка рабочего дерева) |
| [issue-triage/](./skills/issue-triage/) | Трехэтапное управление журналом невыполненных задач (аудит, глубокий анализ, проверенные действия) |
| [команда киберзащиты/](./skills/cyber-defense-team/) | Организация многоагентной группы киберзащиты |
| [talk-конвейер/](./skills/talk-pipeline/) | Шестиступенчатый конвейер: сырье к направляющим через Кими |
| [eval-правила/](./skills/eval-rules/) | Аудит `.claude/rules/` и `~/.claude/rules/`: вступление, `paths` сравнивается с реальными файлами, состояние загрузки символических ссылок, проверка полезности, затем редактирование на месте. |

### Команды (52)

| Файл | Курок | Цель |
|------|---------|---------|
| [commit.md](./commands/commit.md) | `/commit` | Обычные сообщения о фиксации |
| [pr.md](./commands/pr.md) | `/pr` | Создавайте хорошо структурированные PR с анализом объема |
| [review-pr.md](./commands/review-pr.md) | `/review-pr` | Рабочий процесс PR-анализа |
| [release-notes.md](./commands/release-notes.md) | `/release-notes` | Создание примечаний к выпуску в трех форматах |
| [sonarqube.md](./commands/sonarqube.md) | `/sonarqube` | Анализ проблем с качеством SonarCloud для PR-специалистов |
| [generate-tests.md](./commands/generate-tests.md) | `/generate-tests` | Генерация тестов |
| [git-worktree.md](./commands/git-worktree.md) | `/git-worktree` | Настройка изолированного рабочего дерева git |
| [git-worktree-status.md](./commands/git-worktree-status.md) | `/git-worktree-status` | Проверка задач фоновой проверки рабочего дерева |
| [git-worktree-remove.md](./commands/git-worktree-remove.md) | `/git-worktree-remove` | Безопасное удаление рабочего дерева с помощью проверок слияния |
| [git-worktree-clean.md](./commands/git-worktree-clean.md) | `/git-worktree-clean` | Пакетная очистка устаревших рабочих деревьев |
| [diagnose.md](./commands/diagnose.md) | `/diagnose` | Интерактивный помощник по устранению неполадок (FR/EN) |
| [validate-changes.md](./commands/validate-changes.md) | `/validate-changes` | LLM-as-a-Judge проверка перед фиксацией |
| [catchup.md](./commands/catchup.md) | `/catchup` | Восстановить контекст после /clear |
| [security.md](./commands/security.md) | `/security` | Быстрый аудит безопасности OWASP |
| [security-check.md](./commands/security-check.md) | `/security-check` | Сканирование конфигурации в сравнении с известными угрозами (~30 с) |
| [security-audit.md](./commands/security-audit.md) | `/security-audit` | Полный 6-этапный аудит с баллом /100 |
| [update-threat-db.md](./commands/update-threat-db.md) | `/update-threat-db` | Исследование и обновление информации об угрозах |
| [audit-agents-skills.md](./commands/audit-agents-skills.md) | `/audit-agents-skills` | Аудит качества для .claude/config |
| [sandbox-status.md](./commands/sandbox-status.md) | `/sandbox-status` | Проверка состояния изоляции песочницы |
| [refactor.md](./commands/refactor.md) | `/refactor` | Улучшения кода на основе SOLID |
| [explain.md](./commands/explain.md) | `/explain` | Пояснения к коду (3 уровня глубины) |
| [optimize.md](./commands/optimize.md) | `/optimize` | Анализ производительности и дорожная карта |
| [ship.md](./commands/ship.md) | `/ship` | Контрольный список перед развертыванием |
| [learn/quiz.md](./commands/learn/quiz.md) | `/learn:quiz` | Самотестирование концепций изучения |
| [learn/teach.md](./commands/learn/teach.md) | `/learn:teach` | Пошаговое объяснение концепции |
| [learn/alternatives.md](./commands/learn/alternatives.md) | `/learn:alternatives` | Сравните разные подходы |
| [audit-codebase.md](./commands/audit-codebase.md) | `/audit-codebase` | Аудит работоспособности кодовой базы с оценкой 7 категорий |
| [plan-start.md](./commands/plan-start.md) | `/plan-start` | 5-этапное планирование: анализ PRD, анализ проекта, технические решения, исследовательская группа, метрики. |
| [plan-execute.md](./commands/plan-execute.md) | `/plan-execute` | Выполнение проверенного плана: изоляция рабочего дерева, создание каркасов TDD, параллельные агенты, создание PR. |
| [plan-validate.md](./commands/plan-validate.md) | `/plan-validate` | Двухуровневая проверка плана: структурные проверки + специальные агенты, автоматическое исправление проблем. |
| [review-plan.md](./commands/review-plan.md) | `/review-plan` | Структурированный анализ плана по 4 осям перед написанием кода |
| [check-cache-bugs.md](./commands/check-cache-bugs.md) | `/check-cache-bugs` | Аудит ошибок кэша CC#40524, которые могут незаметно увеличить затраты API в 10–20 раз. |

### Хуки (37)

Безопасность прежде всего: 12 хуков безопасности, 8 хуков производительности, 5 хуков автоматизации, 5 хуков мониторинга.

**Крючки безопасности** (13 ударов):

| Файл | Событие | Цель |
|------|-------|---------|
| [dangerous-actions-blocker.sh](./hooks/bash/dangerous-actions-blocker.sh) | PreToolUse | Блокировать `rm -rf`, принудительное нажатие, производственные операции |
| [prompt-injection-detector.sh](./hooks/bash/prompt-injection-detector.sh) | PreToolUse | Обнаружение шаблонов внедрения в подсказках |
| [unicode-injection-scanner.sh](./hooks/bash/unicode-injection-scanner.sh) | PreToolUse | Обнаружение нулевой ширины, переопределение RTL, выход ANSI |
| [repo-integrity-scanner.sh](./hooks/bash/repo-integrity-scanner.sh) | PreToolUse | Сканируйте README/package.json на наличие скрытой инъекции. |
| [security-check.sh](./hooks/bash/security-check.sh) | PreToolUse | Блокировать секреты в командах |
| [sandbox-validation.sh](./hooks/bash/sandbox-validation.sh) | PreToolUse | Проверка изоляции песочницы |
| [file-guard.sh](./hooks/bash/file-guard.sh) | PreToolUse | Защитите конфиденциальные файлы от изменений |
| [permission-request.sh](./hooks/bash/permission-request.sh) | PreToolUse | Явный поток разрешений для рискованных операций |
| [mcp-config-integrity.sh](./hooks/bash/mcp-config-integrity.sh) | Начало сеанса | Проверьте хеш конфигурации MCP (защита CVE) |
| [claudemd-scanner.sh](./hooks/bash/claudemd-scanner.sh) | Начало сеанса | Обнаружение атак путем внедрения CLAUDE.md |
| [output-secrets-scanner.sh](./hooks/bash/output-secrets-scanner.sh) | PostToolUse | Запретить API keys/tokens в ответах Claude |
| [pre-commit-secrets.sh](./hooks/bash/pre-commit-secrets.sh) | Git-хук | Блокировать секреты от входа в коммиты |
| [security-gate.sh](./hooks/bash/security-gate.sh) | PreToolUse | Обнаружение уязвимых шаблонов кода перед записью в исходные файлы |

**Крючки для повышения производительности** (10):

| Файл | Событие | Цель |
|------|-------|---------|
| [auto-format.sh](./hooks/bash/auto-format.sh) | PostToolUse | Автоматическое форматирование после редактирования (Prettier, Black, go fmt) |
| [auto-checkpoint.sh](./hooks/bash/auto-checkpoint.sh) | PostToolUse | Авто-КПП работает с определенной периодичностью |
| [typecheck-on-save.sh](./hooks/bash/typecheck-on-save.sh) | PostToolUse | Запустите проверку TypeScript при сохранении. |
| [test-on-change.sh](./hooks/bash/test-on-change.sh) | PostToolUse | Запуск тестов изменений файлов |
| [rtk-auto-wrapper.sh](./hooks/bash/rtk-auto-wrapper.sh) | PreToolUse | Автоматический перенос команд с помощью RTK для экономии токенов |
| [rtk-baseline.sh](./hooks/bash/rtk-baseline.sh) | Начало сеанса | Сохраните базовый уровень RTK для отслеживания экономии сеанса. |
| [setup-init.sh](./hooks/bash/setup-init.sh) | Начало сеанса | Инициализировать среду сеанса |
| [subagent-stop.sh](./hooks/bash/subagent-stop.sh) | Останавливаться | Очистка ресурсов субагента |
| [auto-rename-session.sh](./hooks/bash/auto-rename-session.sh) | Конец сеанса | Генерация заголовков сеансов с помощью искусственного интеллекта (Haiku) |
| [velocity-governor.sh](./hooks/bash/velocity-governor.sh) | PreToolUse | Вызовы инструментов ограничения скорости, чтобы избежать регулирования API |

**Крышки мониторинга** (6):

| Файл | Событие | Цель |
|------|-------|---------|
| [output-validator.sh](./hooks/bash/output-validator.sh) | PostToolUse | Эвристическая проверка вывода |
| [session-logger.sh](./hooks/bash/session-logger.sh) | PostToolUse | Журнал операций для мониторинга |
| [session-summary.sh](./hooks/bash/session-summary.sh) | Конец сеанса | Отображение статистики сеанса (продолжительность, инструменты, стоимость, экономия RTK) |
| [session-summary-config.sh](./hooks/bash/session-summary-config.sh) | Инструмент CLI | Настройте разделы сводки сеанса и отобразите |
| [learning-capture.sh](./hooks/bash/learning-capture.sh) | Останавливаться | Запрос на запись ежедневного обучения |
| [privacy-warning.sh](./hooks/bash/privacy-warning.sh) | PostToolUse | Предупреждайте о возможных утечках конфиденциальной информации |

**Уведомление и TTS** (3):

| Файл | Событие | Цель |
|------|-------|---------|
| [notification.sh](./hooks/bash/notification.sh) | Уведомление | Контекстные звуковые оповещения macOS |
| [tts-selective.sh](./hooks/bash/tts-selective.sh) | PostToolUse | Преобразование текста в речь для выбранных выходных данных |
| [pre-commit-evaluator.sh](./hooks/bash/pre-commit-evaluator.sh) | Git-хук | LLM-как судья перед фиксацией |

**PowerShell** (2):

| Файл | Событие | Цель |
|------|-------|---------|
| [security-check.ps1](./hooks/powershell/security-check.ps1) | PreToolUse | Блокировать секреты в командах |
| [auto-format.ps1](./hooks/powershell/auto-format.ps1) | PostToolUse | Автоматическое форматирование после редактирования |

> **См. [hooks/README.md](./hooks/README.md) для получения полной документации, примеров конфигурации и шаблонов усиления безопасности.**

### Конфигурация (6)

| Файл | Цель |
|------|---------|
| [settings.json](./config/settings.json) | Конфигурация хуков |
| [mcp.json](./config/mcp.json) | Настройка серверов MCP |
| [.gitignore-claude](./config/.gitignore-claude) | Git игнорирует шаблоны |
| [CONTRIBUTING-ai-disclosure.md](./config/CONTRIBUTING-ai-disclosure.md) | Шаблон раскрытия информации об искусственном интеллекте для CONTRIBUTING.md |
| [PULL_REQUEST_TEMPLATE-ai.md](./config/PULL_REQUEST_TEMPLATE-ai.md) | PR-шаблон с AI-атрибуцией |
| [sandbox-native.json](./config/sandbox-native.json) | Собственная конфигурация песочницы Claude Code |
| [settings-personalization.json](./config/settings-personalization.json) | Персонализация пользовательского интерфейса: вращающиеся глаголы, настраиваемая карусель подсказок. |
| [settings.local.json.example](./config/settings.local.json.example) | Пример локальных переопределений (gitignored) |

### Память (1)

| Файл | Цель |
|------|---------|
| [CLAUDE.md.project-template](./memory/CLAUDE.md.project-template) | Память командного проекта |
| [CLAUDE.md.personal-template](./memory/CLAUDE.md.personal-template) | Персональная глобальная память |

### Конфигурации CLAUDE.md (7)

| Файл | Цель |
|------|---------|
| [learning-mode.md](./claude-md/learning-mode.md) | Конфигурация разработки, ориентированной на обучение |
| [devops-sre.md](./claude-md/devops-sre.md) | Конфигурация проекта DevOps/SRE |
| [product-designer.md](./claude-md/product-designer.md) | Конфигурация рабочего процесса дизайнера продуктов |
| [tts-enabled.md](./claude-md/tts-enabled.md) | Конфигурация с поддержкой преобразования текста в речь |
| [rtk-optimized.md](./claude-md/rtk-optimized.md) | Конфигурация, оптимизированная для токена RTK |
| [session-naming.md](./claude-md/session-naming.md) | Автоматическое переименование сеансов с описательными заголовками для параллельной работы. |
| [design-reference-file.md](./claude-md/design-reference-file.md) | Контекст брендбука и набора пользовательского интерфейса для единообразного создания пользовательского интерфейса. |

> **Документацию по режиму обучения см. в [guide/roles/learning-with-ai.md](../guide/roles/learning-with-ai.md)**
> **См. руководство [guide/ops/devops-sre.md](../guide/ops/devops-sre.md) для DevOps/SRE**

### Скрипты (17)

| Файл | Цель | Выход |
|------|---------|--------|
| [audit-scan.sh](./scripts/audit-scan.sh) | Быстрая настройка сканера аудита | JSON / Человек |
| [check-claude.sh](./scripts/check-claude.sh) | Диагностика проверки работоспособности (macOS/Linux) | Человек |
| [check-claude.ps1](./scripts/check-claude.ps1) | Диагностика проверки работоспособности (Windows) | Человек |
| [clean-reinstall-claude.sh](./scripts/clean-reinstall-claude.sh) | Чистая процедура переустановки (macOS/Linux) | Человек |
| [clean-reinstall-claude.ps1](./scripts/clean-reinstall-claude.ps1) | Чистая процедура переустановки (Windows) | Человек |
| [session-stats.sh](./scripts/session-stats.sh) | Анализ журналов сеансов и затрат | JSON / Человек |
| [session-search.sh](./scripts/session-search.sh) | Быстрый поиск и возобновление сеанса | Человек |
| [cc-sessions.py](./scripts/cc-sessions.py) | Расширенный поиск сеансов с инкрементной индексацией | Человек |
| [fresh-context-loop.sh](./scripts/fresh-context-loop.sh) | Автоматический перезапуск сеансов при ограничениях контекста | Человек |
| [bridge.py](./scripts/bridge.py) | Планируйте переключение между сеансами | JSON |
| [bridge-plan-schema.json](./scripts/bridge-plan-schema.json) | JSON Схема для формата плана моста v1 | - |
| [migrate-arguments-syntax.sh](./scripts/migrate-arguments-syntax.sh) | Перенос синтаксиса аргументов v1 → v2 (bash) | Человек |
| [migrate-arguments-syntax.ps1](./scripts/migrate-arguments-syntax.ps1) | Перенос синтаксиса аргументов v1 → v2 (PowerShell) | Человек |
| [rtk-benchmark.sh](./scripts/rtk-benchmark.sh) | Сравнительный анализ экономии токенов RTK | Человек |
| [sync-claude-config.sh](./scripts/sync-claude-config.sh) | Синхронизировать конфигурацию Claude между компьютерами | Человек |
| [sonnetplan.sh](./scripts/sonnetplan.sh) | Псевдоним для запуска Claude с Sonnet вместо Opus (оптимизация затрат) | Человек |

> **Подробное описание использования см. в [scripts/README.md](./scripts/README.md)**

### Правила (5)

| Файл | Цель |
|------|---------|
| [architecture-review.md](./rules/architecture-review.md) | Правила проведения сессий обзора архитектуры |
| [code-quality-review.md](./rules/code-quality-review.md) | Правила проведения сеансов проверки качества кода |
| [first-principles.md](./rules/first-principles.md) | Правила рассуждения из первых принципов |
| [performance-review.md](./rules/performance-review.md) | Правила проведения сессий оценки эффективности |
| [test-review.md](./rules/test-review.md) | Правила проведения сессий проверки тестов |

### Конфигурация команды (3)

| Файл | Цель |
|------|---------|
| [claude-skeleton.md](./team-config/claude-skeleton.md) | Минимальный скелет CLAUDE.md для новых членов команды. |
| [profile-template.yaml](./team-config/profile-template.yaml) | Шаблон сборки профиля для многоинструментальных бригад |
| [sync-script.ts](./team-config/sync-script.ts) | Синхронизируйте конфигурацию Claude на компьютерах команды. |

### Шаблоны (1)

| Файл | Цель |
|------|---------|
| [session-handoff-lorenz.md](./templates/session-handoff-lorenz.md) | Шаблон передачи сеанса для обеспечения непрерывности контекста |

### GitHub Actions (6)

| Файл | Курок | Цель |
|------|---------|---------|
| [claude-code-review.yml](./github-actions/claude-code-review.yml) ⭐ | PR open/sync + `/claude-review` комментарий | Обзор на основе подсказок (внешняя подсказка + протокол борьбы с галлюцинациями) |
| [claude-pr-auto-review.yml](./github-actions/claude-pr-auto-review.yml) | PR open/update | Автоматическая проверка кода со встроенными комментариями |
| [claude-security-review.yml](./github-actions/claude-security-review.yml) | PR open/update | Сканирование, ориентированное на безопасность (OWASP) |
| [claude-issue-triage.yml](./github-actions/claude-issue-triage.yml) | Проблема открыта | Автоматическая сортировка с метками и серьезностью |

> **Инструкции по установке и настройке см. в [github-actions/README.md](./github-actions/README.md)**

### Рабочие процессы (3)

| Файл | Цель |
|------|---------|
| [database-branch-setup.md](./workflows/database-branch-setup.md) | Разработка изолированных функций с ветвями базы данных (Neon/PlanetScale) |
| [memory-stack-integration.md](./workflows/memory-stack-integration.md) | Многодневный рабочий процесс с инструментами памяти (claude-mem + Serena + grepai) |
| [remotion-quickstart.md](./workflows/remotion-quickstart.md) | Рабочий процесс создания видео с помощью Remotion |

### Плагины (2)

| Файл | Цель |
|------|---------|
| [se-cove.md](./plugins/se-cove.md) | Цепочка проверок для независимой проверки кода (Meta AI, ACL 2024) |
| [claude-mem.md](./plugins/claude-mem.md) | Плагин управления постоянной памятью |

### Интеграции (3)

| Инструмент | Цель |
|------|---------|
| [Агент Vibes TTS](./integrations/agent-vibes/) | Преобразование текста в речь для ответов Claude Code |

> **См. [agent-vibes/README.md](./integrations/agent-vibes/README.md) для установки и голосового каталога**

### Конфиги MCP (1)

| Файл | Цель |
|------|---------|
| [figma.json](./mcp-configs/figma.json) | Конфигурация сервера Figma MCP |

### Режимы (1)

| Файл | Цель | Активация |
|------|---------|------------|
| [MODE_Learning.md](./modes/MODE_Learning.md) | Разъяснения точно в срок | Флаг `--learn` |

> **См. [modes/README.md](./modes/README.md) для установки и ссылку на структуру SuperClaude**

### Семантические якоря (1)

| Файл | Цель |
|------|---------|
| [anchor-catalog.md](./semantic-anchors/anchor-catalog.md) | Рекомендуемые термины, источники и ограничения на использование подсказок. |

> **См. [Раздел 2.9](../guide/ultimate-guide.md#29-semantic-anchors) в руководстве, чтобы узнать, как использовать семантические якоря**

### Мультипровайдерский мост

| Инструмент | Цель |
|------|---------|
| [cc-copilot-bridge](https://github.com/FlorianBruniaux/cc-copilot-bridge) | Мост GitHub Copilot к Claude Code CLI для доступа по фиксированной ставке |

> Перемещено в специальный репозиторий: [github.com/FlorianBruniaux/cc-copilot-bridge](https://github.com/FlorianBruniaux/cc-copilot-bridge).

---

*Подробные объяснения см. в главном руководстве [](../guide/ultimate-guide.md) или в руководстве по архитектуре [](../guide/core/architecture.md), чтобы узнать, как Claude Code работает внутри.*
