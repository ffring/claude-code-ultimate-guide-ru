---
title: "Claude Code: Визуальные диаграммы"
description: "53 интерактивных диаграммы Mermaid, охватывающие все основные концепции Claude Code."
tags: [reference, architecture, diagrams, mermaid]
---

# Claude Code: Визуальные диаграммы

53 диаграммы Mermaid, организованные в 12 тематических файлов. Каждый из них включает резервный вариант ASCII и ссылки на руководство и текущую документацию по продукту. Концептуальные модели и политика организации помечены как таковые; они не гарантируют поведение, производительность или соответствие продукта.

> Для диаграмм только для ASCII и визуального справочника для печати → [visual-reference.md](../core/visual-reference.md)

---

## Визуальная палитра

На всех диаграммах используется единая палитра Bold Guy:

| Цвет | Шестигранник | Использование |
|-------|-----|-------|
| Теплый бежевый | `#F5E6D3` | Действия пользователя, узлы ввода |
| Оранжевое Брюле | `#E87E2F` | Ключевые решения, действия Claude |
| Мягкий зеленый | `#7BC47F` | Пути успеха, рекомендации |
| Оповещение красный | `#E85D5D` | Опасность, антипаттерны, риски |
| Нейтральный серый | `#B8B8B8` | Инфраструктура, пассивные элементы |
| Светло-голубой | `#6DB3F2` | Информация, ссылки на документацию |

## Соглашения Mermaid

| Форма | Синтаксис | Значение |
|-------|--------|---------|
| Закругленный прямоугольник | `(text)` | Этап процесса, действие |
| Алмаз | `{text}` | Точка принятия решения |
| Стадион | `([text])` | Начальный / Конечный терминал |
| Шестиугольник | `{{text}}` | Внешняя система или API |
| Подпрограмма | `[[text]]` | Внутренний компонент Claude Code |
| Цилиндр | `[(text)]` | Хранилище данных, постоянное состояние |

---

## Навигация

| Файл | Диаграммы | Темы |
|------|----------|--------|
| [01-foundations.md](./01-foundations.md) | 4 | концептуальная контекстная модель, конвейер рабочего процесса, дерево решений, режимы разрешений |
| [02-context-and-sessions.md](./02-context-and-sessions.md) | 4 | Контекстные зоны, иерархия памяти, возобновление сеанса, свежий контекст |
| [03-configuration-system.md](./03-configuration-system.md) | 4 | Приоритет конфигурации, навыки, команды и агенты, жизненный цикл агента, перехватчики |
| [04-architecture-internals.md](./04-architecture-internals.md) | 5 | Главный цикл, категории инструментов, сборка системных подсказок, изоляция субагентов, модельные конвейеры |
| [05-mcp-ecosystem.md](./05-mcp-ecosystem.md) | 4 | Карта экосистемы MCP, архитектура MCP, атака с использованием коврика, иерархия конфигурации |
| [06-development-workflows.md](./06-development-workflows.md) | 6 | Цикл TDD, конвейер «сначала спецификации», управляемый планом, итеративное уточнение, пути беглости ИИ, где объясняется смена агента |
| [07-multi-agent-patterns.md](./07-multi-agent-patterns.md) | 6 | Топологии агентов, рабочие деревья, двойной экземпляр, горизонтальное масштабирование, матрица решений, обмен сообщениями между сеансами |
| [08-security-and-production.md](./08-security-and-production.md) | 4 | Трехуровневая защита, решение в песочнице, парадокс проверки, конвейер CI/CD |
| [09-cost-and-optimization.md](./09-cost-and-optimization.md) | 4 | Выбор модели, оптимизация затрат, уровни подписки, сокращение токенов |
| [10-adoption-and-learning.md](./10-adoption-and-learning.md) | 4 | Пути адаптации, протокол UVAL, калибровка доверия, одобряйте только то, что вы можете объяснить |
| [11-context-engineering.md](./11-context-engineering.md) | 4 | Трехуровневая контекстная система, проверка контекстного бюджета, модульная архитектура, размещение правил |
| [12-enterprise-governance.md](./12-enterprise-governance.md) | 4 | Уровни рисков управления, рабочий процесс утверждения MCP, классификация данных, атрибуция ИИ посредством переписывания истории |
| **Итого** | **50** | |

---

## Навигация по варианту использования

### «Я новичок в Claude Code, с чего мне начать?»
1. [Дерево быстрого принятия решений](./01-foundations.md#quick-decision-tree-should-i-use-claude-code): Стоит ли мне использовать Claude Code?
2. [9-этапный конвейер рабочего процесса](./01-foundations.md#9-step-workflow-pipeline): Как это работает?
3. [Режимы разрешений](./01-foundations.md#permission-modes-comparison): Каковы режимы безопасности?
4. [Пути адаптации](./10-adoption-and-learning.md#onboarding-adaptive-learning-paths): Какой путь мне подходит?

### «Я хочу понять архитектуру»
1. [The Master Loop](./04-architecture-internals.md#the-master-loop): Основной механизм выполнения
2. [Системная подсказка в сборе](./04-architecture-internals.md#system-prompt-assembly): как строится контекст
3. [4-уровневая контекстная система](./01-foundations.md#chatbot-to-context-system-4-layer-model): Модель трансформации
4. [Категории инструментов](./04-architecture-internals.md#tool-categories--selection): Какие инструменты доступны
5. [Модель трубопроводов](./04-architecture-internals.md#three-model-pipelines-dense-moe-and-vlm): сравнение конструкций Dense, MoE и VLM

### «Я беспокоюсь о безопасности»
1. [MCP Rug Pull Attack](./05-mcp-ecosystem.md#mcp-rug-pull-attack-chain): Как может измениться описание надежного инструмента
2. [3-уровневая защита](./08-security-and-production.md#security-3-layer-defense-model): Как защитить себя
3. [Дерево решений песочницы](./08-security-and-production.md#sandbox-decision-tree): когда использовать песочницу
4. [Парадокс проверки](./08-security-and-production.md#the-verification-paradox): Требовать доказательства выполнения и проверку в пределах объема

### «Я хочу снизить стоимость своих токенов»
1. [Последовательность принятия решения по выбору модели](./09-cost-and-optimization.md#model-selection-decision-flow): выберите правильную модель
2. [Дерево оптимизации затрат](./09-cost-and-optimization.md#cost-optimization-decision-tree): Систематическое снижение затрат
3. [Конвейер сокращения токенов](./09-cost-and-optimization.md#token-reduction-strategies-pipeline): RTK + гигиена сеанса
4. [Области управления контекстом](./02-context-and-sessions.md#context-management-zones): Управление размером контекста

### «Я хочу использовать несколько агентов»
1. [Топологии оркестрации агентов](./07-multi-agent-patterns.md#agent-teams-conceptual-orchestration-topologies): 3 шаблона оркестрации
2. [Многоэкземплярная матрица решений](./07-multi-agent-patterns.md#multi-instance-decision-matrix): Какой шаблон использовать?
3. [Git Worktree Multi-Instance](./07-multi-agent-patterns.md#git-worktree-multi-instance-pattern): параллельная изоляция
4. [Изоляция контекста субагента](./04-architecture-internals.md#sub-agent-context-isolation): как изолируются агенты
5. [Межсессионный обмен сообщениями](./07-multi-agent-patterns.md#cross-session-messaging-discovery--delivery): Как независимые сеансы обнаруживают друг друга и отправляют сообщения друг другу

### «Я хочу настроить серверы MCP»
1. [MCP Карта экосистемы](./05-mcp-ecosystem.md#mcp-server-ecosystem-map): Какие серверы существуют
2. [MCP Архитектура](./05-mcp-ecosystem.md#mcp-architecture-client-server-protocol): Как это работает
3. [MCP Иерархия конфигураций](./05-mcp-ecosystem.md#mcp-config-hierarchy): Где хранятся конфигурации

### «Я хочу управлять Claude Code всей своей командой»
1. [Уровни государственного риска](./12-enterprise-governance.md#governance-risk-tiers-what-to-control-and-when): Какой уровень контроля соответствует вашему контексту?
2. [MCP Рабочий процесс управления](./12-enterprise-governance.md#mcp-governance-workflow): конвейер утверждения для серверов MCP
3. [Правила классификации данных](./12-enterprise-governance.md#data-classification--claude-code-access-rules): Как определить и проверить границы доступа к данным
4. [AI Атрибуция посредством перезаписи](./12-enterprise-governance.md#ai-attribution-through-history-rewrites): Какие переписывания сохраняют атрибуцию ИИ в заметках git?

### «Я хочу улучшить соответствие контексту Claude»
1. [Дерево принятия решений о размещении правила](./11-context-engineering.md#rule-placement-decision-tree): Куда относится это правило?
2. [3-уровневая контекстная система](./11-context-engineering.md#the-3-layer-context-system): глобальный/проект/сеанс
3. [Проверка контекстного бюджета и выполнения задач](./11-context-engineering.md#context-budget--adherence-checks): Как проверить контекст и соблюдение задач
4. [Модульная архитектура](./11-context-engineering.md#monolithic-vs-modular-architecture): Как определить область действия правил с использованием собственных механизмов

---

*Вернуться к [guide/README.md](../README.md) | ASCII диаграммы → [visual-reference.md](../core/visual-reference.md)*
