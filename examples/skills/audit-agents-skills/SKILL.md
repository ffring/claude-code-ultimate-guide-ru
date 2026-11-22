---
name: audit-agents-skills
description: "Проверяйте агентов, навыки и команды Claude Code на предмет качества и производственной готовности. Используйте при оценке качества навыков, проверке показателей производственной готовности или сравнении агентов с шаблонами лучших практик."
allowed-tools: Read Grep Glob Bash Write
effort: high
disable-model-invocation: true
metadata:
  version: 1.0.0
---

# Аудит agents/skills/commands (продвинутый навык)

Комплексная система аудита качества агентов, навыков и команд Claude Code. Обеспечивает количественную оценку, сравнительный анализ и оценку готовности производства на основе лучших отраслевых практик.

## Цель

**Проблема**: Ручная проверка agents/skills подвержена ошибкам и непоследовательна. Согласно отчету LangChain Agent Report 2026, 29,5% организаций развертывают агенты без систематической оценки, что приводит к тому, что «ошибки агентов» становятся основной проблемой (18% команд).

**Решение**: Автоматизированная оценка качества по 16 взвешенным критериям с пороговыми значениями производственной готовности (80 % = минимум категории B для производственного развертывания).

**Основные характеристики**:
- Количественный подсчет очков (32 балла за agents/skills, 20 за команды)
- Взвешенные критерии (идентификация 3x, подсказка 2x, проверка 1x, дизайн 2x)
- Оценка готовности производства (шкала A-F с порогом 80 %).
- Сравнительный анализ против эталонных шаблонов
- JSON/Markdown двойной выход для программной интеграции
- Исправьте предложения для неудовлетворительных критериев

---

## Режимы

| Режим | Использование | Выход |
|------|-------|--------|
| **Быстрый аудит** | Только топ-5 критических критериев | Быстрый pass/fail (3-5 минут для 20 файлов) |
| **Полный аудит** | Все 16 критериев на файл | Подробные оценки + рекомендации (10–15 минут) |
| **Сравнительный** | Полный + тест против шаблонов | Анализ + выявление пробелов (15-20 мин) |

**Default**: Полный аудит (рекомендуется для первого запуска)

---

## Методология

### Почему эти критерии?

Система из 16 критериев основана на:
1. **Claude Code Лучшие практики** (Окончательное руководство, строка 4921: Контрольный список проверки агента)
2. **Industry Data** (Отчет агента LangChain за 2026 год: пробелы в оценке)
3. **Производственные сбои** (отзывы сообщества о жестко запрограммированных путях, отсутствие обработки ошибок)
4. **Шаблоны композиции** (Навыки должны ссылаться на другие навыки, агенты должны быть модульными)

### Философия подсчета очков

**Обоснование веса**:
- **Identity (3x)**: если пользователи не могут find/invoke агента, качество не имеет значения (обнаружимость > качество)
- **Prompt (2x)**: определяет надежность и точность выходных данных.
- **Validation (1x)**: повышает надежность, но является второстепенным по отношению к основной функциональности.
- **Design (2x)**: влияет на долгосрочную ремонтопригодность и масштабируемость.

**Стандарты классов**:
- **A (90–100%)**: Готовность к производству, минимальный риск
- **B (80-89%)**: Хорошо, соответствует производственному порогу.
- **C (70-79%)**: Требуется доработка перед производством.
- **D (60-69%)**: значительные пробелы, неготовность к производству
- **F (<60%)**: критические проблемы, требует серьезного рефакторинга.

**Согласование отрасли**: Пороговое значение в 80 % соответствует передовым практикам разработки программного обеспечения для производственного развертывания (например, покрытие кода >80 %, процент прохождения проверки безопасности).

---

## <a name="workflow"></a>Рабочий процесс

### Фаза 1: Открытие

1. **Сканировать каталоги**:
   ```
   .claude/agents/
   .claude/skills/
   .claude/commands/
   examples/agents/      (if exists)
   examples/skills/      (if exists)
   examples/commands/    (if exists)
   ```

2. **Классифицировать файлы** по типу (agent/skill/command)

3. **Загрузить эталонные шаблоны** (для сравнительного режима):
   ```
   guide/examples/agents/     (benchmark files)
   guide/examples/skills/     (benchmark files)
   guide/examples/commands/   (benchmark files)
   ```

### Этап 2: Система подсчета очков

Критерии оценки нагрузки от `scoring/criteria.yaml`:

```yaml
agents:
  max_points: 32
  categories:
    identity:
      weight: 3
      criteria:
        - id: A1.1
          name: "Clear name"
          points: 3
          detection: "frontmatter.name exists and is descriptive"
        # ... (16 total criteria)
```

Для каждого файла:
1. Разбор заголовка (YAML)
2. Извлечение разделов контента
3. Запуск шаблонов обнаружения (регулярное выражение, поиск по ключевым словам)
4. Подсчитать счет: `(points / max_points) × 100`
5. Присвоить оценку (AF)

### Этап 3: Сравнительный анализ (только сравнительный режим)

Для каждого файла проекта:
1. Найдите наиболее подходящий шаблон (по сходству описания)
2. Сравните оценки по критерию
3. Выявление пробелов: `template_score - project_score`
4. Отмечайте значительные пробелы (разница >10 баллов)

**Example**:
```
Project file: .claude/agents/debugging-specialist.md (Score: 78%, Grade C)
Closest template: examples/agents/debugging-specialist.md (Score: 94%, Grade A)

Gaps:
- Anti-hallucination measures: -2 points (template has, project missing)
- Edge cases documented: -1 point (template has 5 examples, project has 1)
- Integration documented: -1 point (template references 3 skills, project none)

Total gap: 16 points (explains C vs A difference)
```

### Этап 4: Создание отчета

**Отчет об уценке** (`audit-report.md`):
- Сводная таблица (общая + по типам)
- Индивидуальные оценки с главными проблемами
- Подробная разбивка по файлам (складная)
- Приоритетные рекомендации

**JSON Выход** (`audit-report.json`):
```json
{
  "metadata": {
    "project_path": "/path/to/project",
    "audit_date": "2026-02-07",
    "mode": "full",
    "version": "1.0.0"
  },
  "summary": {
    "overall_score": 82.5,
    "overall_grade": "B",
    "total_files": 15,
    "production_ready_count": 10,
    "production_ready_percentage": 66.7
  },
  "by_type": {
    "agents": { "count": 5, "avg_score": 85.2, "grade": "B" },
    "skills": { "count": 8, "avg_score": 78.9, "grade": "C" },
    "commands": { "count": 2, "avg_score": 92.0, "grade": "A" }
  },
  "files": [
    {
      "path": ".claude/agents/debugging-specialist.md",
      "type": "agent",
      "score": 78.1,
      "grade": "C",
      "points_obtained": 25,
      "points_max": 32,
      "failed_criteria": [
        {
          "id": "A2.4",
          "name": "Anti-hallucination measures",
          "points_lost": 2,
          "recommendation": "Add section on source verification"
        }
      ]
    }
  ],
  "top_issues": [
    {
      "issue": "Missing error handling",
      "affected_files": 8,
      "impact": "Runtime failures unhandled",
      "priority": "high"
    }
  ]
}
```

### Этап 5. Исправьте предложения (необязательно)

Для каждого критерия сбоя сгенерируйте **действующее исправление**:

```markdown
### File: .claude/agents/debugging-specialist.md
**Issue**: Missing anti-hallucination measures (2 points lost)

**Fix**:
Add this section after "Methodology":

## Source Verification

- Always cite sources for technical claims
- Use phrases: "According to [documentation]...", "Based on [tool output]..."
- If uncertain, state: "I don't have verified information on..."
- Never invent: statistics, version numbers, API signatures, stack traces

**Detection**: Grep for keywords: "verify", "cite", "source", "evidence"
```

---

## Критерии оценки

Полные определения см. в `scoring/criteria.yaml`. Краткое содержание:

### Агенты (максимум 32 балла)

| Категория | Масса | Количество критериев | Макс. баллы |
|----------|--------|----------------|------------|
| Личность | 3x | 4 | 12 |
| Быстрое качество | 2x | 4 | 8 |
| Валидация | 1x | 4 | 4 |
| Дизайн | 2x | 4 | 8 |

**Ключевые критерии**:
- Четкое имя (3 балла): не общее, например «агент1».
- Описание с триггерами (3 балла): Содержит «когда»/«использовать».
- Роль определена (2 балла): утверждение «Вы...»
- 3+ примера (1 балл): Задокументированные сценарии использования.
- Единая ответственность (2 балла): Целенаправленная, а не «общая цель».

### Навыки (максимум 32 балла)

| Категория | Масса | Количество критериев | Макс. баллы |
|----------|--------|----------------|------------|
| Структура | 3x | 4 | 12 |
| Содержание | 2x | 4 | 8 |
| Технический | 1x | 4 | 4 |
| Дизайн | 2x | 4 | 8 |

**Ключевые критерии**:
- Допустимый SKILL.md (3 балла): правильное наименование.
- Имя допустимо (3 балла): строчные буквы, 1–64 символа, без пробелов.
- Описанная методология (2 балла): существует раздел «Рабочий процесс».
- Нет жестко заданных путей (1 балл): Нет `/Users/`, `/home/`.
- Очистить триггеры (2 балла): раздел «Когда использовать»

### Команды (максимум 20 баллов)

| Категория | Масса | Количество критериев | Макс. баллы |
|----------|--------|----------------|------------|
| Структура | 3x | 4 | 12 |
| Качество | 2x | 4 | 8 |

**Ключевые критерии**:
- Действительная заставка (3 балла): название + описание.
- Подсказка по аргументу (3 балла): Если используется `$ARGUMENTS`
- Пошаговый рабочий процесс (3 балла): Нумерованные разделы.
- Обработка ошибок (2 балла): упоминает виды сбоев.

---

## Шаблоны обнаружения

### Парсинг Frontmatter

```python
import yaml
import re

def parse_frontmatter(content):
    match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        return yaml.safe_load(match.group(1))
    return None
```

### Обнаружение ключевых слов

```python
def has_keywords(text, keywords):
    text_lower = text.lower()
    return any(kw in text_lower for kw in keywords)

# Example
has_trigger = has_keywords(description, ['when', 'use', 'trigger'])
has_error_handling = has_keywords(content, ['error', 'failure', 'fallback'])
```

### Обнаружение перекрытия (проверка дублирования)

```python
def jaccard_similarity(text1, text2):
    words1 = set(text1.lower().split())
    words2 = set(text2.lower().split())
    intersection = words1 & words2
    union = words1 | words2
    return len(intersection) / len(union) if union else 0

# Flag if similarity > 0.5 (50% keyword overlap)
if jaccard_similarity(desc1, desc2) > 0.5:
    issues.append("High overlap with another file")
```

### Подсчет токенов (приблизительный)

```python
def estimate_tokens(text):
    # Rough estimate: 1 token ≈ 0.75 words
    word_count = len(text.split())
    return int(word_count * 1.3)

# Check budget
tokens = estimate_tokens(file_content)
if tokens > 5000:
    issues.append("File too large (>5K tokens)")
```

---

## Отраслевой контекст

**Source**: Отчет агента LangChain за 2026 г. (публичный отчет, стр. 14–22)

**Основные выводы**:
- **29,5%** организаций развертывают агенты без систематической оценки
- **18%** называют «ошибки агентов» своей основной проблемой.
- **Только 12%** используют автоматические проверки качества (88% — вручную или вообще без них)
- **43%** сообщают о трудностях с поддержанием качества агента с течением времени
- **Основные проблемы**: галлюцинации (31%), плохая обработка ошибок (28%), неясные триггеры (22%)

**Implications**:
1. **Пробел в автоматизации**: большинство команд полагаются на ручные контрольные списки (в больших масштабах подвержены ошибкам).
2. **Задолженность по качеству**: агенты, развернутые без проверки, накапливают технический долг.
3. **Обременение по техническому обслуживанию**: 43% испытывают проблемы с качеством с течением времени (нет системы отслеживания)

**Этот навык касается**:
- Автоматизация: заменяет ручные контрольные списки количественной оценкой.
- Отслеживание: выходные данные JSON позволяют анализировать тенденции с течением времени.
- Стандарты: порог в 80 % обеспечивает четкие ворота производства.

---

## Примеры вывода

### Быстрый аудит (топ-5 критериев)

```markdown
# Quick Audit: Agents/Skills/Commands

**Files**: 15 (5 agents, 8 skills, 2 commands)
**Critical Issues**: 3 files fail top-5 criteria

## Top-5 Criteria (Pass/Fail)

| File | Valid Name | Has Triggers | Error Handling | No Hardcoded Paths | Examples |
|------|------------|--------------|----------------|--------------------|----------|
| agent1.md | ✅ | ✅ | ❌ | ✅ | ❌ |
| skill2/ | ✅ | ❌ | ✅ | ❌ | ✅ |

## Action Required

1. **Add error handling**: 5 files
2. **Remove hardcoded paths**: 3 files
3. **Add usage examples**: 4 files
```

### Полный аудит

Полную структуру см. выше в разделе «Этап 4: Создание отчета».

### Сравнительный (полный + тесты)

```markdown
# Comparative Audit

## Project vs Templates

| File | Project Score | Template Score | Gap | Top Missing |
|------|---------------|----------------|-----|-------------|
| debugging-specialist.md | 78% (C) | 94% (A) | -16 pts | Anti-hallucination, edge cases |
| testing-expert/ | 85% (B) | 91% (A) | -6 pts | Integration docs |

## Recommendations

Focus on these gaps to reach template quality:
1. **Anti-hallucination measures** (8 files): Add source verification sections
2. **Edge case documentation** (5 files): Add failure scenario examples
3. **Integration documentation** (4 files): List compatible agents/skills
```

---

## Использование

### Базовый (полный аудит)

```bash
# In Claude Code
Use skill: audit-agents-skills

# Specify path
Use skill: audit-agents-skills for ~/projects/my-app
```

### С опциями

```bash
# Quick audit (fast)
Use skill: audit-agents-skills with mode=quick

# Comparative (benchmark analysis)
Use skill: audit-agents-skills with mode=comparative

# Generate fixes
Use skill: audit-agents-skills with fixes=true

# Custom output path
Use skill: audit-agents-skills with output=~/Desktop/audit.json
```

### Только выход JSON

```bash
# For programmatic integration
Use skill: audit-agents-skills with format=json output=audit.json
```

---

## Интеграция с CI/CD

### Хук предварительной фиксации

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Run quick audit on changed agent/skill/command files
changed_files=$(git diff --cached --name-only | grep -E "^\.claude/(agents|skills|commands)/")

if [ -n "$changed_files" ]; then
    echo "Running quick audit on changed files..."
    # Run audit (requires Claude Code CLI wrapper)
    # Exit with 1 if any file scores <80%
fi
```

### GitHub Actions

```yaml
name: Audit Agents/Skills
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run quality audit
        run: |
          # Run audit skill
          # Parse JSON output
          # Fail if overall_score < 80
```

---

## Сравнение: командование против умения

| Аспект | Команда (`/audit-agents-skills`) | Навык (этот файл) |
|--------|----------------------------------|-------------------|
| **Объем** | Только текущий проект | Многопроектный, сравнительный |
| **Вывод** | Отчет об уценке | Уценка + JSON |
| **Скорость** | Быстро (5-10 мин) | Медленнее (10-20 мин со сравнительным) |
| **Глубина** | Стандартные 16 критериев | То же + сравнительный анализ |
| **Предложения по исправлению** | Через флаг `--fix` | Встроенный с рекомендациями |
| **Программный** | Выходной терминал | JSON для интеграции CI/CD |
| **Подходит для** | Быстрые проверки, рабочий процесс разработки | Глубокие аудиты, отслеживание качества |

**Рекомендация**: используйте команду для ежедневных проверок, навыков открытия ворот и отслеживания качества.

---

## Обслуживание

### Обновление критериев

Редактировать `scoring/criteria.yaml`:
```yaml
agents:
  categories:
    identity:
      criteria:
        - id: A1.5  # New criterion
          name: "API versioning specified"
          points: 3
          detection: "mentions API version or compatibility"
```

Изменение версии: увеличивайте `version` во вступительной части при изменении критериев.

### Добавление типов файлов

Для поддержки новых типов файлов (например, «рабочих процессов»):
1. Добавьте в `scoring/criteria.yaml`:
   ```yaml
   workflows:
     max_points: 24
     categories: [...]
   ```
2. Логика обнаружения обновлений (шаблоны путей к файлам)
3. Обновить шаблоны отчетов

---

## Связанный

- **Версия команды**: `.claude/commands/audit-agents-skills.md`
- **Контрольный список проверки агента**: директива 4921 (руководство, 16 критериев)
- **Skill Validation**: руководящая строка 5491 (спецификация)
- **Справочные шаблоны**: `examples/agents/`, `examples/skills/`, `examples/commands/`

---

## История изменений

**v1.0.0** (2026-02-07):
- Первоначальный выпуск
- Система 16 критериев (agents/skills/commands)
- 3 режима аудита (quick/full/comparative)
- JSON + вывод уценки
- Исправьте предложения
- Отраслевой контекст (отчет LangChain 2026)

---

**Навык готов к использованию**: `audit-agents-skills`
