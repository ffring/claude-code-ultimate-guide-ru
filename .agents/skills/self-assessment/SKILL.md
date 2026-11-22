---
name: self-assessment
version: 1.0.0
description: "Интерактивная оценка навыков с созданием индивидуального пути обучения"
trigger: /self-assessment
invocation: manual

profiles:
  - name: junior
    label: "Beginner"
    min_score: 0
    max_score: 6
  - name: intermediate
    label: "Intermediate"
    min_score: 7
    max_score: 13
  - name: advanced
    label: "Advanced"
    min_score: 14
    max_score: 20

topics:
  - id: 01
    name: "Quick Start"
    guide_section: "guide/ultimate-guide.md#1-quick-start-day-1"
    importance: "critical"
    depends_on: []
    
  - id: 02
    name: "Core Concepts"
    guide_section: "guide/ultimate-guide.md#2-core-concepts"
    importance: "critical"
    depends_on: [01]
    
  - id: 03
    name: "Memory & Settings"
    guide_section: "guide/ultimate-guide.md#3-memory--settings"
    importance: "high"
    depends_on: [02]
    
  - id: 04
    name: "Agents"
    guide_section: "guide/ultimate-guide.md#4-agents"
    importance: "high"
    depends_on: [02, 03]
    
  - id: 05
    name: "Skills"
    guide_section: "guide/ultimate-guide.md#5-skills"
    importance: "high"
    depends_on: [02, 03]
    
  - id: 06
    name: "Commands"
    guide_section: "guide/ultimate-guide.md#6-commands-user-invocable-skills"
    importance: "medium"
    depends_on: [02]
    
  - id: 07
    name: "Hooks"
    guide_section: "guide/ultimate-guide.md#7-hooks"
    importance: "medium"
    depends_on: [02, 03]
    
  - id: 08
    name: "MCP Servers"
    guide_section: "guide/ultimate-guide.md#8-mcp-servers"
    importance: "medium"
    depends_on: [02]
    
  - id: 09
    name: "Advanced Patterns"
    guide_section: "guide/ultimate-guide.md#9-advanced-patterns"
    importance: "low"
    depends_on: [04, 05, 06, 07, 08]
    
  - id: 10
    name: "Security & Production"
    guide_section: "guide/security/"
    importance: "critical"
    depends_on: [02, 03]

modes:
  - id: quick
    name: "Quick Assessment"
    duration: "5 minutes"
    questions_per_topic: 1
    total_questions: 10
    description: "Быстрая оценка по основным темам. Получите уровень навыка + определите 2-3 непосредственных пробела."
    
  - id: comprehensive
    name: "Comprehensive Assessment"
    duration: "20 minutes"
    questions_per_topic: 2
    total_questions: 20
    description: "Глубокое погружение в каждую тему. Получите оценки по темам + подробный план обучения + практические проекты."
---

# Codex Самооценка

**Совершенствуйте свои навыки Codex с помощью индивидуального обучения.**

Эта интерактивная оценка определяет ваш текущий уровень знаний и создает индивидуальный путь обучения, адаптированный к вашим пробелам и целям.

---

## <a name="how-it-works"></a>Как это работает

### Шаг 1. Выберите свой режим

**Быстрый режим** (5 мин)
- 10 вопросов по 10 темам
- Подходит для: быстрой проверки навыков, понимания вашего общего уровня.
- Результат: общий профиль (Beginner/Intermediate/Advanced) + 2–3 верхних пробела.

**Комплексный режим** (20 мин)
- 20 вопросов (по 2 на тему)
- Подходит для: детальной оценки мастерства, планирования командных тренировок.
- Результат: баллы по темам + подробный план обучения + 3 практических проекта.

### Шаг 2. Ответьте на вопросы

Вопросы охватывают:
- Практическое использование (как делать что-либо)
- Принятие решений (когда и что использовать)
- Шаблоны архитектуры (почему все работает)
- Лучшие практики производства (безопасность, производительность, масштабирование)

В каждом вопросе есть:
- 4 варианта (A-D)
- Немедленная обратная связь при правильном ответе
- Ссылка на соответствующий раздел руководства

### Шаг 3: Получите свой профиль

**Вывод в быстром режиме:**
```
╔═══════════════════════════════════════════════╗
║ Your Profile: Intermediate Developer          ║
╠═══════════════════════════════════════════════╣
║ Overall Score: 14/20                          ║
║ Level: Intermediate (strong)                  ║
╠═══════════════════════════════════════════════╣
║ Immediate Gaps:                               ║
║  • MCP Servers (5/5 topics weak)              ║
║  • Advanced Patterns (4/5 weak)               ║
║  • Hooks (3/5 partially weak)                 ║
║                                               ║
║ → Recommended learning time: 4-6 hours        ║
╚═══════════════════════════════════════════════╝
```

**Вывод в комплексном режиме:**
```
╔═══════════════════════════════════════════════════════════════╗
║ Detailed Mastery Profile                                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║ 01 Quick Start          ████░░░░░░  8/10  Proficient         ║
║ 02 Core Concepts        ██████░░░░  6/10  Proficient         ║
║ 03 Memory & Settings    ██████░░░░  6/10  Proficient         ║
║ 04 Agents              ████░░░░░░  4/10  Basic               ║
║ 05 Skills              ████░░░░░░  4/10  Basic               ║
║ 06 Commands            ██████░░░░  6/10  Proficient          ║
║ 07 Hooks               ██░░░░░░░░  2/10  None                ║
║ 08 MCP Servers         ██░░░░░░░░  2/10  None                ║
║ 09 Advanced Patterns   ░░░░░░░░░░  0/10  None                ║
║ 10 Security            ███░░░░░░░  3/10  Basic               ║
║                                                               ║
║ OVERALL: Intermediate (14/100 points)                         ║
╚═══════════════════════════════════════════════════════════════╝
```

### Шаг 4. Получите свой путь обучения

В зависимости от ваших баллов вы получаете:

**Приоритетная последовательность обучения** (с учетом зависимостей):
1. Темы упорядочены по слабости + важности.
2. Показаны предварительные условия (фундаменты нельзя пропустить)
3. Оценка времени для каждой темы (суммируется только то, что вам нужно)
4. Шаблоны и примеры, связанные с каждой темой

**Пример пути для разработчика среднего уровня:**
```
Phase 1: Hooks Fundamentals (2 hours)
  → Read: guide/ultimate-guide.md#7-hooks
  → Try: examples/hooks/event-driven-formatting.sh
  → Quiz: /lesson-quiz 07-hooks

Phase 2: MCP Integration (3 hours)
  → Read: guide/ultimate-guide.md#8-mcp-servers
  → Try: examples/mcp-configs/github-integration.json
  → Quiz: /lesson-quiz 08-mcp-servers

Phase 3: Advanced Patterns (4 hours)
  → Read: guide/ultimate-guide.md#9-advanced-patterns
  → Practice: 3 real-world projects (see below)
  → Quiz: /lesson-quiz 09-advanced-patterns
```

**3 Практические проекты**
На основе вашего профиля вы получаете целевые упражнения:
- Проект 1. Объедините 2–3 темы, в которых вы слабы.
- Проект 2: Интеграция реальных рабочих процессов
- Проект 3: сценарий Team/production

---

## <a name="getting-started"></a>Начиная

### Быстрая оценка
```
/self-assessment quick
```

### Полная оценка
```
/self-assessment comprehensive
```

### Варианты
```
/self-assessment quick --verbose      # Show explanations
/self-assessment comprehensive --save  # Save results to file
```

---

## Что вы узнаете

Эта оценка предназначена для выявления:

### Фундаментальные пробелы
- Основные циклы взаимодействия, которые вы еще не пробовали
- Основные функции, которые вы упустили из виду
- Заблуждения ментальной модели

### Слепые зоны принятия решений
- Когда использовать агентов, навыки или команды
- Какое событие перехвата использовать для какой проблемы
- Выбор сервера MCP под ваши нужды

### Готовность производства
- Лучшие практики безопасности
- Шаблоны оптимизации производительности
- Масштабирование мультиагентных систем
- Конфигурация и управление командой

---

## После вашей оценки

### Немедленные действия
1. **Посмотреть свой профиль** — Узнайте свой текущий уровень мастерства
2. **Определить пробелы** — точно знать, чему учиться дальше
3. **Получите путь обучения** — Персонализированная последовательность действий с учетом зависимостей
4. **Practice** — 3 целевых проекта, соответствующих вашему уровню

### Рекомендуемые навыки последующего наблюдения
- `/lesson-quiz [topic]` — Проверьте себя по конкретным темам.
- `/audit-agents-skills` — Проведите аудит качества вашей конфигурации.
- `/Codex-md` — Управляйте конфигурацией AGENTS.md.

### Интеграция с схемой обучения

После оценки навык `/lesson-quiz` обеспечивает проверку каждого модуля:
- Ответьте на 5 вопросов по каждому модулю.
- Получите мгновенную обратную связь по слабым местам
- Разблокируйте следующий модуль, когда будете готовы.

---

## Оценка и профили

### Младший разработчик (0-6 баллов)
- Только что установил Codex
- Знать основные команды и рабочие процессы
- memory/agents/hooks еще не трогал
- **Следующий шаг:** Основные концепции + модуль памяти

### Средний разработчик (7-13 баллов)
- Ежедневное использование Codex
- Удобно работать с AGENTS.md и базовыми агентами.
- Изучение навыков и команд.
- Некоторое использование перехватчиков, нет серверов MCP
- **Следующий шаг:** Deep MCP + Расширенные шаблоны

### Продвинутый разработчик (14-20 баллов)
- Мастерская многоагентная оркестровка
- Безопасность и масштабирование промышленного уровня
- Пользовательские навыки и сложные хуки
- Опыт работы с серверами MCP
- **Следующий шаг:** Командное обучение, корпоративные модели

---

## Советы для лучших результатов

1. **Ответить честно** — Не угадывай, пропускай неизвестные вопросы
2. **Пояснения к обзору** — к каждому вопросу есть ссылка-руководство.
3. **Повторно посетите перед повышением уровня** — пересдайте экзамен после изучения новых тем.
4. **Поделиться результатами** — используйте свой профиль для координации действий с командой

---

## Нужна помощь?

- **Вопросы по оценке?** → Проверить `/help self-assessment`
- **Хотите обсудить результаты?** → См. `guide/roles/learning-with-ai.md`
- **Нашли ошибку?** → Сообщить о проблемах с GitHub

---

**Готовы освоить Codex?** Начните с `/self-assessment quick` прямо сейчас.
