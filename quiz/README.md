# Claude Code Тест знаний

Для запуска русской викторины установите зависимости из корня репозитория.

```bash
npm --prefix quiz ci
npm --prefix quiz start
```

Проверьте свое понимание Claude Code с помощью интерактивных вопросов с несколькими вариантами ответов.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Платформа](https://img.shields.io/badge/Platform-macOS%20%7C%20Linux%20%7C%20Windows-blue.svg)]()

## <a name="quick-start"></a>Быстрый старт

```bash
# Navigate to quiz directory
cd quiz

# Install dependencies
npm install

# Run the quiz
npm start

# Or run directly
node src/index.js
```

## <a name="features"></a>Функции

- Профили пользователей **4**: младший, старший, опытный пользователь, менеджер по продукту
- **17 Категории тем**: От быстрого старта к расширенным шаблонам
- **473 Кураторские вопросы**: практические знания, а не пустяки
- **Немедленная обратная связь**: Учитесь на ошибках с объяснениями
- **Ссылки на документацию**: Прямые ссылки на разделы руководства.
- **Отслеживание результатов**: просмотр сильных и слабых сторон
- **Session Persistence**: история сохранена в `~/.claude-quiz/`
- **Кросс-платформенный**: работает на macOS, Linux и Windows.

## Использование

### Интерактивный режим (рекомендуется)

```bash
npm start
```

Вам будет предложено:
1. Выберите свой профиль (Junior/Senior/Power User/PM)
2. Выбирайте темы (все или отдельные разделы)
3. Отвечайте на вопросы с помощью A/B/C/D

### Параметры командной строки

```bash
node src/index.js [options]

Options:
  -p, --profile <type>   Pre-select profile (junior|senior|power|pm)
  -t, --topics <list>    Quiz specific sections (1-17, comma-separated)
  -c, --count <n>        Limit number of questions (1-50)
  -d, --dynamic          Enable dynamic question generation via claude -p
  -h, --help             Show help message
  -v, --version          Show version
```

### Примеры

```bash
# Interactive mode
npm start

# Senior profile, default topics
node src/index.js -p senior

# Power user, specific topics (Agents, Hooks, MCP)
node src/index.js -p power -t 4,7,8

# Quick 10-question quiz
node src/index.js -c 10

# Junior profile with dynamic generation
node src/index.js -p junior -d
```

## Пример сеанса

Вот как выглядит типичная викторина:

```
============================================================
   CLAUDE CODE KNOWLEDGE QUIZ
   Master Claude Code: The Complete Guide
============================================================

? Select your profile: Senior Developer (40 min to mastery)
? Select topics to quiz: Custom selection...
? Select topics (space to toggle, enter to confirm):
  ◉ [2] Core Concepts
  ◉ [4] Agents
  ◉ [7] Hooks

------------------------------------------------------------
Starting quiz: 20 questions for senior profile
------------------------------------------------------------

------------------------------------------------------------
Question 1/20 [Core Concepts]

At what context percentage should you use /compact?

  A) 0-50%
  B) 50-70%
  C) 70-90%
  D) Only at 100%

? Your answer: C

✓ CORRECT!

Progress: █░░░░░░░░░░░░░░░░░░░ 1/20 | Score: 1/1 (100%)

------------------------------------------------------------
Question 2/20 [Hooks]

What exit code should a PreToolUse hook return to BLOCK an operation?

  A) 0
  B) 1
  C) 2
  D) -1

? Your answer: A

✗ INCORRECT. The correct answer is C) 2

Explanation:
Exit code 2 blocks the operation. Exit code 0 allows it to proceed.
Other exit codes are treated as errors and logged but don't block.

See: https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md#72-creating-hooks
     (Line 4164)

Progress: ██░░░░░░░░░░░░░░░░░░ 2/20 | Score: 1/2 (50%)
? Continue to next question? Yes

... (more questions) ...

============================================================
   QUIZ COMPLETE
============================================================

Overall Score: 16/20 (80%)

By Category:
  Core Concepts       6/7  (86%)  [████████░░]
  Agents              5/7  (71%)  [███████░░░]
  Hooks               5/6  (83%)  [████████░░]

Weak Areas (< 75%):
  - Agents: Review section 4 in the guide

Recommended Reading:
  4. guide/ultimate-guide.md#4-agents

Time: 9 minutes 2 seconds

------------------------------------------------------------
? What would you like to do? (Use arrow keys)
❯ Retry wrong questions only
  New quiz (different questions)
  Exit
```

## Профили

| Профиль | Вопросы | Направления деятельности |
|---------|-----------|-------------|
| **Младший разработчик** | 15 | Разделы 1-3, 6 (основное) |
| **Старший разработчик** | 20 | Разделы 2-4, 7, 9 (архитектура, автоматизация) |
| **Опытный пользователь** | 25 | Все разделы |
| **Менеджер по продукту** | 10 | Разделы 1–3, 16–17 (концептуальный обзор и обзор команды) |

## Темы

| # | Тема | Ключевые понятия |
|---|-------|--------------|
| 1 | Быстрый старт и установка | Установка, первый рабочий процесс, основные команды |
| 2 | Основные понятия | Управление контекстом, режим планирования, цикл взаимодействия |
| 3 | Память и настройки | CLAUDE.md, папка .claude/, разрешения |
| 4 | Агенты | Пользовательские агенты, специализация, оркестровка |
| 5 | Навыки | Многоразовые знания, состав навыков |
| 6 | Команды | Слэш-команды, пользовательские команды |
| 7 | Хуки | Система событий, хуки безопасности, коды выхода |
| 8 | Серверы MCP | Context7, Serena, Sequential, плагины |
| 9 | Расширенные шаблоны | Троица, CI/CD, композиция |
| 10 | Ссылка | Ярлыки, устранение неполадок, ежедневный рабочий процесс |
| 11 | Обучение с помощью ИИ | Обучение рабочим процессам, анализ привычек, развитие навыков |
| 12 | Внутреннее устройство архитектуры | Архитектура времени выполнения, контекст, инструменты и исполнение |
| 13 | Усиление безопасности | Модели угроз, безопасная конфигурация и проверки безопасности |
| 14 | Конфиденциальность и наблюдаемость | Обработка данных, контроль конфиденциальности и телеметрия |
| 15 | Экосистема искусственного интеллекта | Дополнительные инструменты и шаблоны интеграции |
| 16 | Агентские возможности и контекст | Среды выполнения агентов и контекстная инженерия |
| 17 | Командные метрики для разработки с использованием искусственного интеллекта | Метрики доставки DORA, SPACE и AI |

## Порядок прохождения викторины

```
┌─────────────────────────────────────────────┐
│          CLAUDE CODE KNOWLEDGE QUIZ         │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  Select Profile (Junior/Senior/Power/PM)    │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  Select Topics (All or Specific 1-17)       │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  Question 1/20 [Category]                   │
│                                             │
│  What is the recommended action when...?    │
│                                             │
│    A) Option A                              │
│    B) Option B                              │
│    C) Option C                              │
│    D) Option D                              │
└─────────────────────────────────────────────┘
                     │
            ┌────────┴────────┐
            ▼                 ▼
     ┌──────────┐      ┌──────────────────┐
     │ CORRECT! │      │ INCORRECT        │
     │          │      │ Correct: C       │
     │          │      │ Explanation...   │
     │          │      │ See: guide#...   │
     └──────────┘      └──────────────────┘
            │                 │
            └────────┬────────┘
                     ▼
              (Next Question)
                     │
                     ▼
┌─────────────────────────────────────────────┐
│           QUIZ COMPLETE                     │
│                                             │
│  Overall Score: 16/20 (80%)                 │
│                                             │
│  By Category:                               │
│    Core Concepts:  6/7  (86%)  [████████░░] │
│    Agents:         5/7  (71%)  [███████░░░] │
│    Hooks:          5/6  (83%)  [████████░░] │
│                                             │
│  Weak Areas: Agents (review section 4)      │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  [R] Retry wrong questions only             │
│  [N] New quiz (different questions)         │
│  [E] Exit                                   │
└─────────────────────────────────────────────┘
```

## Сохранение сеанса

Сеансы викторин автоматически сохраняются в `~/.claude-quiz/`:

```
~/.claude-quiz/
  sessions/
    2026-01-12_143052.json   # Individual session data
    2026-01-12_150623.json
  stats.json                  # Aggregate statistics
```

### Данные сеанса включают в себя:
- Профиль и выбранные темы
- Ответы на вопросы (correct/incorrect/skipped)
- Затраченное время
- Разбивка по категориям
- Неправильные вопросы с правильными ответами

## Динамическая генерация вопросов

Если флаг `--dynamic` включен и установлен Claude CLI, викторина может генерировать дополнительные вопросы на лету с помощью `claude -p`:

```bash
node src/index.js -d
```

Для этого необходимо:
- Claude CLI установлен (`npm install -g @anthropic-ai/claude-code`)
- Активный ключ API настроен.

Динамические вопросы дополняют статический пул, если:
- Статический пул исчерпан для выбранных тем.
- Пользователь запрашивает свежие вопросы
- Для повторяющихся викторин необходимо разнообразие.

## Банк вопросов: источник истины

Файлы под `questions/*.yaml` созданы **, а не отредактированы вручную**. Сингл
Источником истины для вопросов викторины является веб-викторина в целевом репозитории, один
Файл уценки для каждого вопроса под `src/content/questions/`. CLI YAML - это
регенерировал из него.

Это намеренно. Банк CLI и веб-банк когда-то разделились на два отдельных
наборы вопросов (разные суммы, разные ответы в одних и тех же слотах идентификаторов). Один
канонический источник плюс генератор — вот что предотвращает повторение этого.

### Регенерация CLI YAML

Из этого каталога `quiz/`:

```bash
# Rewrite questions/*.yaml from the web bank (sibling landing repo)
pnpm sync-from-web

# CI / pre-push guard: fail if the YAML is out of sync with the web bank
pnpm sync-from-web:check
```

Генератор находится по адресу [`scripts/generate-from-web.mjs`](./scripts/generate-from-web.mjs).
По умолчанию это `../../claude-code-ultimate-guide-landing/src/content/questions`;
передайте `--web <dir>`, чтобы указать в другом месте. Он сохраняет заголовок каждой категории
(имя `source_file`) и заменяет только вопросы.

## Дополнительные вопросы

Добавляйте или редактируйте вопросы в **веб-банк** (`src/content/questions/<NN-slug>/`),
затем регенерируйте CLI YAML. Не редактируйте `questions/*.yaml` вручную; следующий
`sync-from-web` перезапишет ваши изменения.

### Рекомендации по обеспечению качества

**Тест хороших вопросов:**
- Практическое применение («Когда следует…»)
- Принятие решений («Какой подход лучше всего подходит для...»)
- Понимание («Почему Claude...»)
- Устранение неполадок («Что бы вы сделали, если...»)

**Avoid:**
- Общая информация («Каков точный синтаксис команды...»)
- Чистое запоминание («Перечислить все сочетания клавиш...»)
- Подробности, относящиеся к версии, которые могут измениться

### Отправка вопросов

1. Форк посадочного репозитория
2. Добавьте вопрос Markdown в разделе `src/content/questions/<NN-category-slug>/`.
3. Убедитесь, что `doc_reference` указывает на действительный раздел руководства.
4. Запустите `pnpm sync-from-web` в `quiz/`, чтобы восстановить CLI YAML.
5. Отправьте PR как с новым Markdown, так и с обновленным YAML.

## <a name="troubleshooting"></a>Поиск неисправностей

### «Нет вопросов»

- Убедитесь, что в выбранных темах есть вопросы в каталоге `questions/`.
- Убедитесь, что файлы YAML действительны (используйте валидатор YAML).
- Попробуйте выбрать разные темы или «Все темы».

### «Невозможно найти модуль «yaml»»

```bash
cd quiz
npm install
```

### Викторина зависает при вводе

- Убедитесь, что вы работаете в интерактивном терминале
- Попробуйте нажать Enter, если зависло
- Используйте Ctrl+C для выхода и перезапуска.

## Лицензия

То же, что и родительский репозиторий: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

---

**Часть**: [claude-code-ultimate-guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)
