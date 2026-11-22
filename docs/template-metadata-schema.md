# Схема метаданных шаблона

Полная спецификация метаданных для всех шаблонов в `examples/`.

---

## Цель

Метаданные шаблона позволяют:
- **Discovery**: поиск шаблонов по сложности, времени и домену.
- **Automation**: создание каталогов, указателей и документации.
- **Quality**: проверка согласованности более чем 181 шаблона.
- **Learning**: помогите пользователям найти шаблоны, соответствующие их уровню навыков.

---

## Формат фронтмена YAML

Все шаблоны (`agents/`, `commands/`, `skills/`, `hooks/`, `workflows/`, `scripts/`) должны включать метаданные во вступительной части YAML:

```yaml
---
name: template-name
description: One-line description of what this template does
complexity: beginner|intermediate|advanced
time: 5 min|15 min|30 min|1 hour|2 hours|4+ hours|varies
domain: security|testing|deployment|performance|architecture|automation|general
prerequisites: []
status: stable|experimental|deprecated
keywords: [tag1, tag2, tag3]
---
```

### Правила формата файла

**Markdown** (`.md`):
```markdown
---
name: code-reviewer
description: Code review agent with security and quality checks
...
---

# Code Reviewer Agent

Content starts here...
```

**Bash/PowerShell** (`.sh`, `.ps1`):
```bash
#!/bin/bash
# ---
# name: pre-commit-validator
# description: Validates code before commit
# ...
# ---

# Script content starts here
```

---

## Полевые характеристики

### `name` (обязательно)

Уникальный идентификатор шаблона. Должен быть безопасным для URL-адресов и содержать кебаб.

**Rules:**
- Используйте только строчные буквы, цифры и дефисы.
- Никаких пробелов и специальных символов
- Должно совпадать с именем файла (без расширения).
- Примеры: `code-reviewer`, `unit-test-generator`, `security-auditor`.

**Usage:**
- Становится текстом ссылки на каталог.
- Используется в командах `/agent code-reviewer`.
- Ссылка в документации

---

### `description` (обязательно)

Однострочное описание того, что делает шаблон.

**Rules:**
- Не превышайте 100 символов
- Будьте конкретны, а не расплывчаты
- Если возможно, начните с глагола
- Сосредоточьтесь на результате, а не на деталях реализации

**Examples:**
```yaml
# ✅ Good
description: Automated code review for security and performance issues

# ❌ Bad
description: A tool for reviewing code
description: Code analyzer that checks things
```

---

### `complexity` (обязательно)

Уровень навыков, необходимый для эффективного использования шаблона.

**Действительные значения:**
- `beginner`: Никаких предварительных знаний не требуется.
- `intermediate`: Требуется базовый опыт Claude Code.
- `advanced`: глубокие знания Claude Code или специализированный опыт в предметной области.

**Guidelines:**
- **Beginner**: простой agents/skills, не требующий настройки.
  - Примеры: простые агенты тестирования, базовые генераторы документации.
- **Intermediate**: шаблоны, требующие некоторой настройки или знания предметной области.
  - Примеры: агенты проверки кода, шаблоны команд CI/CD, общие рабочие процессы.
- **Advanced**: сложная оркестровка, специализированные домены или многокомпонентные системы.
  - Примеры: мультиагентные системы, аудит безопасности, оптимизация производительности, киберзащита.

**Usage:**
- Помогает пользователям фильтровать пути обучения и `/self-assessment`.
- Уровень сложности документации руководств
- Информирует о предварительных предложениях

---

### `time` (обязательно)

Примерное время на понимание и адаптацию шаблона к вашему проекту.

**Действительные значения:**
- `5 min`: Краткая справка, минимальная настройка.
- `15 min`: Простой шаблон, легкая адаптация.
- `30 min`: стандартный шаблон, необходима некоторая настройка.
- `1 hour`: Умеренная сложность или значительное обучение.
- `2 hours`: Сложный шаблон или крутая кривая обучения
- `4+ hours`: Очень сложные системы или несколько компонентов.
- `varies`: сильно зависит от контекста (например, зависит от домена).

**Что включает в себя «время»:**
- Reading/understanding шаблон
- Адаптация под ваш проект
- Тестирование шаблона
- Проверяем, что это работает

**Что НЕ включает в себя «время»:**
- Изучение основ Claude Code (описано в модуле 01-02)
- Знания, специфичные для предметной области (например, изучение Kubernetes перед использованием шаблона DevOps)

**Examples:**
- Агент `code-reviewer`: `30 min` (понять контрольный список, адаптировать правила)
- Команда `test-writer`: `15 min` (выбор структуры тестирования, легкая настройка)
- Многоагентная киберзащита: `4+ hours` (несколько агентов, схема событий, конвейер)

---

### `domain` (необязательно)

Category/domain, которому принадлежит шаблон.

**Общие домены:**
- `security`: сканирование уязвимостей, обнаружение угроз, аудит безопасности.
- `testing`: создание тестов, проверка тестов, анализ покрытия.
- `deployment`: CI/CD, автоматизация выпуска, инфраструктура
- `performance`: оптимизация, профилирование, обнаружение узких мест.
- `architecture`: Обзор дизайна, рефакторинг, анализ шаблонов.
- `automation`: оркестровка рабочих процессов, автоматизация повторяющихся задач.
- `general`: нет конкретного домена, широкое применение.

**Rules:**
- Используйте один домен (предпочтительнее основной)
- Если шаблон охватывает несколько доменов, выберите наиболее подходящий.
- Если сомневаетесь, используйте `general`.

**Usage:**
- Включает фильтрацию на основе домена в каталогах.
- Помогает пользователям найти инструменты для конкретной области знаний.
- Организует разделы документации

---

### `prerequisites` (необязательно)

Какие знания или настройки необходимы перед использованием шаблона.

**Format:**
```yaml
prerequisites: [skill-name, agent-name, module-number]
```

**Examples:**
```yaml
# Security auditor requires understanding Module 02 (context)
prerequisites: [Module-02-Core-Loop]

# This agent is built on top of code-reviewer
prerequisites: [code-reviewer agent]

# Requires familiarity with testing concepts
prerequisites: [testing-patterns skill]
```

**Rules:**
- Перечислите конкретные модули, навыки или другие агенты
- Будьте краткими (максимум 3 обязательных условия)
- Если больше 3, подумайте, не слишком ли расширен шаблон.
- Должно соответствовать фактическим элементам пути обучения.

**Usage:**
- Автоматически создаваемые цепочки обязательных требований в каталоге
- Проверка в `/self-assessment` (предложить предварительные требования)
- Документация может выявить предварительные условия

---

### `status` (необязательно)

Статус жизненного цикла шаблона.

**Действительные значения:**
- `stable` (по умолчанию): протестировано, задокументировано, готово к производству.
- `experimental`: Новое, еще не полностью протестировано, могут измениться
- `deprecated`: больше не рекомендуется, рассмотрите альтернативы.

**Rules:**
- Пропустить, если `stable` (по умолчанию)
- Четко отметьте значком предупреждения в каталоге, если `experimental` или `deprecated`.
- Экспериментальные шаблоны должны включать примечания по пути миграции.

**Examples:**
```yaml
# Experimental new feature
status: experimental
# Consider alternatives: code-reviewer agent

# Deprecated, replaced by newer version
status: deprecated
# Use instead: security-auditor-v2 agent
```

---

### `keywords` (необязательно)

Поисковые теги для обнаружения.

**Format:**
```yaml
keywords: [keyword1, keyword2, keyword3, ...]
```

**Examples:**
```yaml
# Code reviewer keywords
keywords: [review, quality, security, performance, linting]

# Test generator keywords
keywords: [testing, jest, unit-test, tdd, bdd, coverage]
```

**Rules:**
- Используйте максимум 3–5 ключевых слов.
- Ключевые слова должны быть короткими (1–2 слова).
- Включите общие поисковые термины (структуры, шаблоны, практики)
- Включите словарь, специфичный для предметной области

**Usage:**
- Включает полнотекстовый поиск в расширенном каталоге.
- Улучшает видимость с помощью тегов
- Поддерживает сопоставление псевдонимов (например, «обзоры» → «рецензент кода»).

---

## Правила валидации

Инструмент `scripts/generate-template-catalog.py --validate` обеспечивает:

1. **Обязательные поля** существуют: `name`, `description`, `complexity`, `time`
2. **Действительные значения** для перечислений: `complexity`, `time`, `status`
3. **Правила формата**: `name` — кебаб-кебаб, описание до 100 символов.
4. **Согласованность файла**: имя файла соответствует полю `name`.
5. **Действительность ссылки**: Предварительные требования, домены и ключевые слова правильно сформированы.

---

## Минимальный шаблон

Каждый шаблон ДОЛЖЕН включать как минимум:

```yaml
---
name: my-template
description: Brief description of what this does
complexity: intermediate
time: 30 min
---
```

---

## Полный пример

```yaml
---
name: security-auditor
description: Comprehensive security scan with OWASP Top 10 checks
complexity: advanced
time: 2 hours
domain: security
prerequisites: [Module-02-Core-Loop, code-reviewer agent]
status: stable
keywords: [security, audit, vulnerability, owasp, injection, xss, sqlinjection]
---

# Security Auditor Agent

Agent definition and content follows...
```

---

## Автоматизированная генерация

Каталог автоматически генерируется на основе метаданных:

```bash
# Generate CATALOG.md from all template metadata
python3 scripts/generate-template-catalog.py

# Validate all templates have correct metadata
python3 scripts/generate-template-catalog.py --validate

# Generate and save to specific file
python3 scripts/generate-template-catalog.py --output examples/CATALOG.md
```

Точки интеграции:
- **HookPre-commit**: проверяет метаданные перед фиксацией.
- **Рабочий процесс выпуска**: автоматическое создание каталога во время `/release`
- **CI/CD**: проверяет метаданные при каждом нажатии.

---

## Руководство по миграции

### Существующие шаблоны

При обновлении существующего шаблона:

1. Добавьте заставку в начало файла
2. Запустите проверку: `python3 scripts/generate-template-catalog.py --validate`
3. Зафиксировать с сообщением: `docs: add metadata to [template-name]`

### Пакетные обновления

Обновите несколько шаблонов одновременно:

```bash
# Find all templates without metadata
find examples -name "*.md" -exec grep -L "^---" {} \;

# Add minimal metadata to all
find examples -name "*.md" | xargs -I {} \
  python3 scripts/add-default-metadata.py {}
```

---

## <a name="faq"></a>Частые вопросы

**Q: Должен ли каждый шаблон иметь все поля?**  
О: Нет. Требуется: `name`, `description`, `complexity`, `time`. Необязательные поля можно опустить, если они неприменимы.

**Q: Могу ли я добавить пользовательские поля?**  
О: Да, но они не будут проиндексированы инструментом каталога. Полезно для внутреннего отслеживания (например, `author`, `date_added`).

**Q: Как часто следует обновлять метаданные?**  
Ответ: Обновляйте, когда: шаблон существенно изменен, изменяется статус, изменяются предварительные требования или сдвигается домен.

**Q: Что, если шаблон охватывает несколько доменов?**  
О: Выберите домен primary/strongest. Если действительно многодоменный, рассмотрите возможность разделения на отдельные шаблоны или используйте `general`.

---

## Связанные файлы

- `examples/CATALOG.md` — Автоматически создаваемый индекс шаблона
- `scripts/generate-template-catalog.py` — Инструмент создания каталога
- `.claude/hooks/validate-template-metadata.sh` — Проверка перед фиксацией
- `guide/learning-path/` — Путь обучения ссылается на определенные шаблоны.

---

**Последнее обновление**: 21 апреля 2026 г.  
**Версия**: 1.0.0
