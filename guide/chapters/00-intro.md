---
title: "Полное руководство по Claude Code"
description: "Самодостаточное руководство по Claude Code от первого запуска до продвинутой работы."
tags: [guide, reference, workflows, agents, hooks, mcp, security]
---

[К оглавлению](README.md) · [Следующая глава](01-1-quick-start-day-1.md)


# Полное руководство по Claude Code

> Освойте Claude Code от первого запуска до продвинутой работы.

**Автор**: Florian BRUNIAUX | Внешний директор по ИИ

**Написано с помощью**: Claude (Anthropic)

**Время чтения**: ~30-40 часов (полное) | ~15 минут (только быстрый старт)

**Последнее обновление**: 6 октября 2026 г. (полное обновление), 24 октября 2026 г. (уточнения о кэше и обвязке агента)

**Версия**: 3.46.0

---

## Прежде чем начать

**Это руководство не является официальной документацией Anthropic.** Это ресурс сообщества, основанный на моем исследовании Claude Code в течение нескольких месяцев.

**Что вы найдете:**
- Шаблоны, которые сработали для меня
- Наблюдения, которые не могут быть применимы к вашему рабочему процессу
- Оценки времени и проценты являются грубыми приближениями, а не измерениями.

**Чего вы не найдете:**
- Точные ответы (инструмент слишком новый)
- Заявления о сравнительной производительности
- Гарантии, что любая техника подойдет вам.

**Используйте критически. Экспериментируйте. Поделитесь тем, что вам подходит.**

> **⚠️ Примечание (январь 2026 г.)**: Если вы слышали о **ClawdBot** недавно это **другой инструмент**. ClawdBot — это чат-помощник для самостоятельного развёртывания, доступный через приложения для обмена сообщениями (Telegram, WhatsApp и т. д.), предназначенный для персональной автоматизации и использования в умном доме. Claude Code это инструмент командной строки для разработчиков с интеграцией в терминал и IDE, ориентированная на рабочие процессы разработки программного обеспечения. Оба используют модели Claude, но служат разным аудиториям и вариантам использования. [Более подробную информацию можно найти в Приложении Б: Часто задаваемые вопросы.](13-11-ai-ecosystem-complementary-tools.md#appendix-b-faq).

---

## <a name="tldr---the-5-minute-summary"></a>TL;DR — 5-минутное резюме

Если у вас есть всего 5 минут, вот что вам нужно знать:

### <a name="essential-commands"></a>Основные команды
```bash
claude                    # Start Claude Code
/help                     # Show all commands
/powerup                  # Interactive lessons: CLAUDE.md, /rewind, memory, effort modes
/status                   # Check context usage
/compact                  # Compress context when >70%
/clear                    # Fresh start
/plan                     # Safe read-only mode
Ctrl+C                    # Cancel operation
```

### <a name="the-workflow"></a>Рабочий процесс
```
Describe → Claude Analyzes → Review Diff → Accept/Reject → Verify
```

### Управление контекстом (важно!)
| Контекст % | Действие |
|-----------|--------|
| 0-50% | Работайте свободно |
| 50-70% | Будьте избирательны |
| 70-90% | `/compact` сейчас |
| 90%+ | Требуется `/clear` |

*Эти пороговые значения основаны на моем опыте. Оптимальный рабочий процесс может отличаться в зависимости от сложности задачи и стиля работы.*

### <a name="memory-hierarchy"></a>Иерархия памяти
```
~/.claude/CLAUDE.md       → Global (all projects)
/project/CLAUDE.md        → Project (committed)
/project/.claude/         → Personal (not committed)
```

### Продвинутые возможности
| Особенность | Что он делает |
|---------|--------------|
| **Агенты** | Специализированные ИИ-персонажи для конкретных задач |
| **Навыки** | Многоразовые модули знаний |
| **Крючки** | Скрипты автоматизации, запускаемые событиями |
| Серверы **MCP** | Внешние инструменты (Серена, Context7, Playwright...) |
| **Плагины** | Пакеты расширений, созданные сообществом |

### <a name="the-golden-rules"></a>Золотые правила
1. **Всегда просматривайте diff**, прежде чем принимать изменения
2. **Используйте `/compact`** до того, как контекст станет критическим.
3. **Будьте конкретны** в своих запросах (ЧТО, ГДЕ, КАК, ПРОВЕРЬТЕ)
4. **Начните с режима планирования** для сложных и рискованных задач
5. **Создайте CLAUDE.md** для каждого проекта.

### Дерево быстрых решений
```
Simple task → Just ask Claude
Complex task → Use TodoWrite to plan
Risky change → Enter Plan Mode first
Repeating task → Create an agent or command
Context full → /compact or /clear
```

**Теперь прочитайте Раздел 1, чтобы получить полное краткое руководство, или перейдите к любому нужному разделу.**

---

## Выберите свой путь

В руководстве 11 глав и более 22 000 строк. Вам не нужно читать все: вот что важно для вашей ситуации.

| Я... | Прочтите это | Пропустить это | Время |
|---------|-----------|-----------|------|
| **Разработчик, начало работы** | Гл.1 → Гл.2 → Гл.3 | Гл.9, Гл.11, Приложение | 3h |
| **Разработчик, средний уровень** | Гл.2.6 → Гл.4 → Гл.5 → Гл.7 | Глава 1, глава 10, только ссылка | 4h |
| **Опытный пользователь/старший** | Глава 9 (Дополнительно) → Глава 4–8. | Глава 1. Быстрый старт | 2h |
| **Технический руководитель / EM** | Гл.3.5 → Гл.9.17 → Гл.9.20 → Гл.11 | Гл.5-6 подробно | 1h30 |
| **Просто нужна ссылка** | [Ch.10.5 Шпаргалка](11-10-reference.md#105-cheatsheet) | Все остальное | 5 минут |

---

## Топ-5 разделов по рентабельности инвестиций

Если у вас есть время только на 5 разделов:

1. **[2.6 Ментальная модель](02-2-core-concepts.md#26-mental-model)**: понять, как думает Claude Code (20 мин)
2. **[3.1 CLAUDE.md](03-3-memory--settings.md#31-memory-files-claudemd)**: постоянная память, сохраняющая работоспособность при сеансах (30 минут)
3. **[9.1 The Trinity](09-9-advanced-patterns-part-1.md#91-the-trinity)**: основной шаблон агентской работы (20 мин)
4. **[7.4 Хуки безопасности](07-7-hooks.md#74-security-hooks)**: автоматизируйте ограждения, которые вы не забудете (30 мин)
5. **[10.5 Шпаргалка](11-10-reference.md#105-cheatsheet)**: Ежедневный справочник, добавьте в закладки (5 минут)

---

## Оглавление

- [1. Быстрый старт (день 1)](01-1-quick-start-day-1.md#1-quick-start-day-1) `🟢 Beginner` `⏱ 45 min`
  - [1.1 Установка](01-1-quick-start-day-1.md#11-installation)
  - [1.2 Первый рабочий процесс](01-1-quick-start-day-1.md#12-first-workflow)
  - [1.3 Основные команды](01-1-quick-start-day-1.md#13-essential-commands)
  - [1.4 Режимы разрешений](01-1-quick-start-day-1.md#14-permission-modes)
  - [1.5 Контрольный список производительности](01-1-quick-start-day-1.md#15-productivity-checklist)
  - [1.6 Переход с других инструментов ИИ-кодирования](01-1-quick-start-day-1.md#16-migrating-from-other-ai-coding-tools)
  - [1.7 Доверительная калибровка](01-1-quick-start-day-1.md#17-trust-calibration-when-and-how-much-to-verify)
  - [1.8 Восемь ошибок новичка](01-1-quick-start-day-1.md#18-eight-beginner-mistakes-and-how-to-avoid-them)
- [2. Основные понятия](02-2-core-concepts.md#2-core-concepts) `🟡 Intermediate` `⏱ 60 min`
  - [2.1 Цикл взаимодействия](02-2-core-concepts.md#21-the-interaction-loop)
  - [2.2 Управление контекстом](02-2-core-concepts.md#22-context-management)
  - [2.3 Режим планирования](02-2-core-concepts.md#23-plan-mode) (включая [OpusPlan](02-2-core-concepts.md#opusplan-mode))
  - [2.4 Перемотка назад](02-2-core-concepts.md#24-rewind)
  - [2.5 Руководство по выбору модели и размышлениям](02-2-core-concepts.md#25-model-selection--thinking-guide)
  - [2.6 Ментальная модель](02-2-core-concepts.md#26-mental-model)
  - [2.8 Структурированные запросы с XML-тегами](02-2-core-concepts.md#28-structured-prompting-with-xml-tags)
  - [2.9 Семантические привязки](02-2-core-concepts.md#29-semantic-anchors)
  - [2.10 Шаблоны быстрого проектирования](02-2-core-concepts.md#210-prompt-engineering-patterns)
  - [2.11 Структурированные выходы и проектирование схемы](02-2-core-concepts.md#211-structured-outputs--schema-design)
  - [2.12 Поток данных и конфиденциальность](02-2-core-concepts.md#212-data-flow--privacy)
  - [2.13 Под капотом](02-2-core-concepts.md#213-under-the-hood)
- [3. Память и настройки](03-3-memory--settings.md#3-memory--settings) `🟢 Beginner` `⏱ 30 min`
  - [3.1 Файлы памяти (CLAUDE.md)](03-3-memory--settings.md#31-memory-files-claudemd)
  - [3.2 Структура папки .claude/](03-3-memory--settings.md#32-the-claude-folder-structure)
  - [3.3 Настройки и разрешения](03-3-memory--settings.md#33-settings--permissions)
  - [3.4 Правила приоритета](03-3-memory--settings.md#34-precedence-rules)
  - [3.5 Конфигурация команды в Scale](03-3-memory--settings.md#35-team-configuration-at-scale)
- [4. Агенты](04-4-agents.md#4-agents) `🟡 Intermediate` `⏱ 45 min`
  - [4.1 Что такое агенты](04-4-agents.md#41-what-are-agents)
  - [4.2 Создание собственных агентов](04-4-agents.md#42-creating-custom-agents)
  - [4.3 Шаблон агента](04-4-agents.md#43-agent-template)
  - [4.4 Рекомендации](04-4-agents.md#44-best-practices)
  - [4.5 Память агента](04-4-agents.md#45-agent-memory)
  - [4.6 Примеры агентов](04-4-agents.md#46-agent-examples)
  - [4.7 Расширенные шаблоны агентов](04-4-agents.md#47-advanced-agent-patterns)
- [5. Навыки](05-5-skills.md#5-skills) `🟡 Intermediate` `⏱ 30 min`
  - [5.1 Понимание навыков](05-5-skills.md#51-understanding-skills)
  - [5.2 Создание навыков](05-5-skills.md#52-creating-skills)
  - [5.3 Шаблон навыков](05-5-skills.md#53-skill-template)
  - [5.4 Примеры навыков](05-5-skills.md#54-skill-examples)
- [6. Команды](06-6-commands-user-invocable-skills.md#6-commands-user-invocable-skills) `🟡 Intermediate` `⏱ 30 min`
  - [6.1 Слэш-команды](06-6-commands-user-invocable-skills.md#61-slash-commands)
  - [6.2 Создание пользовательских команд](06-6-commands-user-invocable-skills.md#62-creating-custom-commands)
  - [6.3 Шаблон команды](06-6-commands-user-invocable-skills.md#63-command-template)
  - [6.4 Примеры команд](06-6-commands-user-invocable-skills.md#64-command-examples)
- [7. Крючки](07-7-hooks.md#7-hooks) `🟡 Intermediate` `⏱ 45 min`
  - [7.1 Система событий](07-7-hooks.md#71-the-event-system)
  - [7.2 Создание перехватчиков](07-7-hooks.md#72-creating-hooks)
  - [7.3 Шаблоны крючков](07-7-hooks.md#73-hook-templates)
  - [7.4 Защитные крючки](07-7-hooks.md#74-security-hooks)
  - [7.5 Примеры крючков](07-7-hooks.md#75-hook-examples)
- [8. Серверы MCP](08-8-mcp-servers.md#8-mcp-servers) `🟡 Intermediate` `⏱ 40 min`
  - [8.1 Что такое MCP](08-8-mcp-servers.md#81-what-is-mcp)
  - [8.2 Доступные серверы](08-8-mcp-servers.md#82-available-servers)
  - [8.3 Конфигурация](08-8-mcp-servers.md#83-configuration)
  - [8.4 Руководство по выбору сервера](08-8-mcp-servers.md#84-server-selection-guide)
  - Система плагинов [8.5](08-8-mcp-servers.md#85-plugin-system)
  - [8.6 MCP Безопасность](08-8-mcp-servers.md#86-mcp-security)
- [9. Расширенные шаблоны](09-9-advanced-patterns-part-1.md#9-advanced-patterns) `🔴 Advanced` `⏱ 3h`
  - [9.1 Троица](09-9-advanced-patterns-part-1.md#91-the-trinity)
  - [9.2 Шаблоны композиции](09-9-advanced-patterns-part-1.md#92-composition-patterns)
  - [9.3 CI/CD Интеграция](09-9-advanced-patterns-part-1.md#93-cicd-integration)
  - [9.4 IDE Интеграция](09-9-advanced-patterns-part-1.md#94-ide-integration)
  - [9.5 Плотные петли обратной связи](09-9-advanced-patterns-part-1.md#95-tight-feedback-loops)
  - [9.6 Todo как инструкция Зеркала](09-9-advanced-patterns-part-1.md#96-todo-as-instruction-mirrors)
  - [9.7 Стили вывода](09-9-advanced-patterns-part-1.md#97-output-styles)
  - [9.8 Vibe Coding и скелетные проекты](09-9-advanced-patterns-part-1.md#98-vibe-coding--skeleton-projects)
  - [9.9 Шаблон пакетных операций](09-9-advanced-patterns-part-1.md#99-batch-operations-pattern)
  - [9.10 Настрой на постоянное совершенствование](09-9-advanced-patterns-part-1.md#910-continuous-improvement-mindset)
  - [9.11 Распространенные ошибки и рекомендации](09-9-advanced-patterns-part-1.md#911-common-pitfalls--best-practices)
  - [9.12 Рекомендации и рабочие процессы Git](09-9-advanced-patterns-part-1.md#912-git-best-practices--workflows)
  - [9.13 Стратегии оптимизации затрат](09-9-advanced-patterns-part-1.md#913-cost-optimization-strategies)
  - [9.14 Методологии разработки](09-9-advanced-patterns-part-1.md#914-development-methodologies)
  - [9.15 Именованные шаблоны подсказок](09-9-advanced-patterns-part-1.md#915-named-prompting-patterns)
  - [9.16 Сеансовая телепортация](09-9-advanced-patterns-part-1.md#916-session-teleportation)
  - [9.17 Шаблоны масштабирования: рабочие процессы с несколькими экземплярами](10-9-advanced-patterns-part-2.md#917-scaling-patterns-multi-instance-workflows)
  - [9.18 Проектирование кодовой базы для повышения производительности агентов](10-9-advanced-patterns-part-2.md#918-codebase-design-for-agent-productivity)
  - [9.19 Платформы перестановок](10-9-advanced-patterns-part-2.md#919-permutation-frameworks)
  - [9.20 Команды агентов (многоагентная координация)](10-9-advanced-patterns-part-2.md#920-agent-teams-multi-agent-coordination)
  - [9.21 Модернизация устаревшей кодовой базы](10-9-advanced-patterns-part-2.md#921-legacy-codebase-modernization)
  - [9.22 Пульт дистанционного управления (мобильный доступ)](10-9-advanced-patterns-part-2.md#922-remote-control-mobile-access)
  - [9.23 Жизненный цикл конфигурации и цикл обновления](10-9-advanced-patterns-part-2.md#923-configuration-lifecycle--the-update-loop)
  - [9.24 Непрерывное обучение, основанное на инстинктах](10-9-advanced-patterns-part-2.md#924-instinct-based-continuous-learning)
  - [9.25 Проектирование жгута репозитория](10-9-advanced-patterns-part-2.md#925-harness-engineering)
  - [9.26 Оптимизация контекста на основе отзывов](10-9-advanced-patterns-part-2.md#926-review-driven-context-optimization)
  - [9.27 Межсессионный обмен сообщениями (одноранговая координация)](10-9-advanced-patterns-part-2.md#927-cross-session-messaging-peer-coordination)
  - [9.28 Прием событий и безопасное делегирование](10-9-advanced-patterns-part-2.md#928-event-ingestion-and-safe-delegation)
- [10. Артикул](11-10-reference.md#10-reference) `🟢 All levels` `⏱ As needed`
  - [10.1 Таблица команд](11-10-reference.md#101-commands-table)
  - [10.2 Сочетания клавиш](11-10-reference.md#102-keyboard-shortcuts)
  - [10.3 Справочник по конфигурации](11-10-reference.md#103-configuration-reference)
  - [10.4 Устранение неполадок](11-10-reference.md#104-troubleshooting)
  - Шпаргалка [10.5](11-10-reference.md#105-cheatsheet)
  - [10.6 Ежедневный рабочий процесс и контрольные списки](11-10-reference.md#106-daily-workflow--checklists)
- [11. Экосистема искусственного интеллекта: дополнительные инструменты](13-11-ai-ecosystem-complementary-tools.md#11-ai-ecosystem-complementary-tools) `🟡 Intermediate` `⏱ 20 min`
  - [11.1 Почему важна взаимодополняемость](13-11-ai-ecosystem-complementary-tools.md#111-why-complementarity-matters)
  - [11.2 Матрица инструментов](13-11-ai-ecosystem-complementary-tools.md#112-tool-matrix)
  - [11.3 Практические рабочие процессы](13-11-ai-ecosystem-complementary-tools.md#113-practical-workflows)
  - [11.4 Шаблоны интеграции](13-11-ai-ecosystem-complementary-tools.md#114-integration-patterns)
  - [Для неразработчиков: Claude Cowork](13-11-ai-ecosystem-complementary-tools.md#for-non-developers-claude-cowork)
- [Приложение: Коллекция шаблонов](12-appendix-templates-collection.md#appendix-templates-collection)
  - [Приложение A. Справочник по расположению файлов](13-11-ai-ecosystem-complementary-tools.md#appendix-a-file-locations-reference)
  - [Приложение B: Часто задаваемые вопросы](13-11-ai-ecosystem-complementary-tools.md#appendix-b-faq)

---
