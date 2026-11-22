---
name: audit-agents-skills
description: "Аудит качества агентов, навыков и команд в проекте Claude Code"
argument-hint: "[path] [--fix] [--verbose]"
---

# Аудит качества Agents/Skills/Commands

Комплексный аудит качества агентов, навыков и команд Claude Code. Оценивает каждый файл по взвешенным критериям с оценкой готовности к производству.

## Аргументы

- `[path]` — каталог для аудита (по умолчанию: текущий проект `.claude/`)
- `--fix` — генерировать предложения по исправлению для несоответствующих критериев.
- `--verbose` — Показать подробную информацию по всем критериям (а не только по сбоям).

## Использование

```bash
/audit-agents-skills              # Audit current project
/audit-agents-skills --fix        # Audit + fix suggestions
/audit-agents-skills ~/other-repo # Audit another project
/audit-agents-skills --verbose    # Full details for all criteria
```

---

## Фаза 1: Открытие

**Objective**: Найдите и классифицируйте всех агентов, навыки и команды.

### Шаги

1. **Сканировать каталоги**:
   ```
   .claude/agents/
   .claude/skills/
   .claude/commands/
   examples/agents/      (if exists)
   examples/skills/      (if exists)
   examples/commands/    (if exists)
   ```

2. **Классифицировать файлы**:
   - **Agent**: файл в каталоге `agents/` с заголовком YAML, содержащим поле `tools:`.
   - **Skill**: файл в каталоге `skills/` ИЛИ имеет имя `SKILL.md` ИЛИ заголовок с полем `allowed-tools:`.
   - **Command**: файл в каталоге `commands/` с заголовком, содержащим `name:` и `description:`.

3. **Отображение сводки**:
   ```
   Found: X agents, Y skills, Z commands
   ```

---

## Этап 2. Проверка отдельных файлов

Каждый тип файла оценивается по **взвешенные критерии**. Максимальные баллы:
- **Агенты**: 32 очка
- **Skills**: 32 очка
- **Команды**: 20 очков

### Агенты (максимум 32 балла)

#### Идентичность (вес: 3x) – 12 баллов

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Очистить поле `name` | 3 | Frontmatter YAML имеет описательное поле `name:` (не общее, например «agent1»). |
| `description` с триггерами | 3 | Описание содержит ключевые слова «когда», «использовать» или «триггер», указывающие контекст активации. |
| `model` указан | 3 | Frontmatter имеет поле `model:` (sonnet/haiku/opus). |
| `tools` ограничен соответствующим образом | 3 | Список инструментов не включает Bash, если это не оправдано, или не включает объяснение рискованных инструментов. |

**Обоснование**: Личность определяет **обнаруживаемость** и **активация**. Если пользователи не могут найти или вызвать агент, качество нисходящего потока не имеет значения.

#### Быстрое качество (вес: 2x) - 8 баллов

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Роль определена | 2 | Содержит заявление «Вы» или «Ваша роль», определяющее личность агента. |
| Указан выходной формат | 2 | Имеет раздел под названием «Выход», «Формат» или «Результаты», определяющий ожидаемую структуру. |
| Scope/limits определен | 2 | Имеет раздел, определяющий область действия, триггеры или когда НЕ использовать агент. |
| Меры борьбы с галлюцинациями | 2 | Содержит ключевые слова: «проверить», «цитировать», «источник», «доказательства» или предупреждения против галлюцинаций. |

**Rationale**: Качество оперативности определяет **надежность** и **точность** ответов агента.

#### Валидация (вес: 1x) – 4 балла

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| 3+ примера использования | 1 | Имеет раздел «Примеры», «Использование» или «Сценарии», содержащий как минимум 3 различных примера. |
| Краевые случаи задокументированы | 1 | Упоминает сценарии «крайнего случая», «ошибки», «сбоя» или «ограничения». |
| Интеграция документирована | 1 | Ссылается на других агентов, навыки или инструменты, с которыми он работает. |
| Описана обработка ошибок | 1 | Упоминает «резервный вариант», «восстановление», «обработку ошибок» или режимы сбоя. |

**Rationale**: Валидация обеспечивает **надежность** посредством комплексных сценариев тестирования.

#### Дизайн (вес: 2x) - 8 баллов

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Единая ответственность | 2 | Размер файла <5000 токенов И описание сфокусировано (не «общее назначение» или несколько глаголов) |
| Никакого дублирования | 2 | Описание не сильно пересекается с другими агентами (проверка на сходство ключевых слов >50 %) |
| Составной (ссылки на навыки) | 2 | Ссылается на навыки или другие агенты, которые он может вызвать, демонстрируя модульность. |
| Разумный бюджет токенов | 2 | Размер файла <8000 токенов (во избежание раздувания контекста) |

**Rationale**: Шаблоны проектирования определяют **обслуживаемость** и **масштабируемость** архитектуры агента.

---

### Навыки (максимум 32 балла)

#### Структура (вес: 3x) – 12 баллов

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Действительный SKILL.md или вступительная часть | 3 | Файл с именем `SKILL.md` OR имеет заголовок YAML с полем `name:`. |
| `name` действителен | 3 | Имя в нижнем регистре, 1–64 символа, соответствует шаблону `[a-z0-9-]+` (без символов spaces/special). |
| `description` непустой | 3 | Поле описания существует и содержит >20 символов. |
| `allowed-tools` указан | 3 | Frontmatter имеет разрешения для инструмента списка полей `allowed-tools:` |

**Обоснование**: Соответствие структуры обеспечивает **совместимость спецификаций** с Claude Code runtime.

#### Контент (вес: 2x) - 8 баллов

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Methodology/workflow описано | 2 | Имеет разделы с заголовками «Методология», «Рабочий процесс», «Процесс» или пронумерованными шагами. |
| Указан выходной формат | 2 | Имеет раздел, определяющий формат результата (Markdown, JSON, структура отчета). |
| Предоставленные примеры | 2 | Имеет раздел «Примеры», «Использование» или «Сценарии» с конкретными экземплярами. |
| Контрольные списки включены | 2 | Содержит синтаксис флажка Markdown `- [ ]` или `- [x]` для элементов, требующих действий. |

**Rationale**: Богатство контента определяет **usability** и **кривую обучения**.

#### Технический (вес: 1х) – 4 балла

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Скрипты имеют обработку ошибок | 1 | Если существуют связанные сценарии, они содержат шаблоны `set -e`, `trap` или `|| exit`. |
| Нет жестко запрограммированных путей | 1 | Никаких абсолютных путей, таких как `/Users/`, `/home/`, `C:\`, в коде или инструкциях. |
| Никаких секретов | 1 | Нет ключевых слов: «пароль», «секрет», «токен», «api_key», «учетные данные» в открытом тексте. |
| Зависимости документированы | 1 | Если требуются внешние инструменты, имеется раздел «Требования», «Зависимости» или «Предварительные условия». |

**Обоснование**: Техническая гигиена предотвращает **проблемы с переносимостью** и **риски безопасности**.

#### Дизайн (вес: 2x) - 8 баллов

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Единая ответственность | 2 | Описание ориентировано на один домен (не «общий» или многоцелевой) |
| Очистить триггеры | 2 | Имеет раздел, определяющий «Когда использовать», «Триггеры» или «Критерии активации». |
| Никакого дублирования с другими навыками | 2 | Описание не дублирует >50 % ключевых слов из других навыков в проекте. |
| Портативный | 2 | Никаких расширений, специфичных для Claude Code, которые нарушают переносимость (проверьте наличие пользовательских API). |

**Rationale**: Проект определяет **находимость** и **обслуживаемость** во всех проектах.

---

### Команды (максимум 20 баллов)

#### Структура (вес: 3x) – 12 баллов

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Действительная заставка | 3 | Имеет фронтальную часть YAML с полями `name:` и `description:`. |
| `argument-hint`, если принимает аргументы | 3 | Если в теле используется переменная `$ARGUMENTS`, во вступительной части имеется поле `argument-hint:`. |
| Пошаговый рабочий процесс | 3 | Тело содержит пронумерованные разделы (1., 2., 3.) или четкую фазовую структуру. |
| Примеры использования | 3 | Имеет разделы «Использование», «Примеры» или показывает шаблоны вызова. |

**Rationale**: структура определяет **usability** и **learnability** для командных пользователей.

#### Качество (вес: 2х) - 8 баллов

| Критерий | Очки | Обнаружение |
|-----------|--------|-----------|
| Обработка ошибок | 2 | Упоминает «ошибку», «сбой», «резервный вариант» или условные пути для сбоев. |
| Определен выходной формат | 2 | Указывает, какие выходные данные команды (отчет, файл, сводка) и ее структуру. |
| Ворота валидации | 2 | Содержит контрольные точки, этапы проверки или проверки «перед продолжением». |
| Аргументы анализируются правильно | 2 | Если принимает аргументы, показывает, как parse/validate `$ARGUMENTS` (значения по умолчанию, проверка) |

**Обоснование**: Качество определяет **надежность** и **готовность к производству**.

---

## Этап 3: Подсчет очков

### Индивидуальная оценка файла

```
Score = (Points Obtained / Max Points) × 100
```

**Пример**: Агент набирает очки 26/32 → 81% баллов

### Присвоение оценок

| Оценка | Диапазон очков | Статус |
|-------|-------------|--------|
| A | 90-100% | Готовность к производству ✅ |
| B | 80-89% | Хорошо (порог производства) ⚠️ |
| C | 70-79% | Требует улучшения 🔧 |
| D | 60-69% | Значительные пробелы ⚠️ |
| F | <60% | Критические вопросы ❌ |

**Производственный порог**: 80% (класс B или выше)

### Общая оценка проекта

Средневзвешенное значение по типам файлов:
```
Overall = (Σ Agent Scores × Agent Count + Σ Skill Scores × Skill Count + Σ Command Scores × Command Count) / Total Files
```

---

## Этап 4: Создание отчета

### Структура отчета

```markdown
# Audit: Agents/Skills/Commands

**Project**: {path}
**Date**: {date}
**Overall Score**: {score}% ({grade})
**Files Audited**: {total} ({n} agents, {n} skills, {n} commands)
**Production Ready**: {count} files ({percentage}%)

---

## Summary

| Type | Files | Avg Score | Grade | Production Ready |
|------|-------|-----------|-------|------------------|
| Agents | X | Y% | Z | N/X (%) |
| Skills | X | Y% | Z | N/X (%) |
| Commands | X | Y% | Z | N/X (%) |

---

## Individual Scores

| File | Type | Score | Grade | Top Issues |
|------|------|-------|-------|------------|
| agent-name.md | Agent | 85% | B | Missing anti-hallucination measures, no edge cases |
| skill-name/ | Skill | 72% | C | Hardcoded paths, no error handling |
| command.md | Command | 95% | A | None |

---

## Top Issues (Across All Files)

1. **Missing error handling** (8 files affected)
   - Impact: Runtime failures unhandled
   - Fix: Add error handling sections, fallback strategies

2. **Hardcoded paths** (5 files affected)
   - Impact: Portability broken across systems
   - Fix: Use relative paths or environment variables

3. **No usage examples** (4 files affected)
   - Impact: Poor learnability, unclear invocation
   - Fix: Add "Examples" section with 3+ scenarios

---

## Detailed Breakdown

<details>
<summary>agent-name.md (Agent, 85%, Grade B)</summary>

### Scores by Category

| Category | Points | Max | Pass |
|----------|--------|-----|------|
| Identity | 12 | 12 | ✅ |
| Prompt Quality | 6 | 8 | ⚠️ |
| Validation | 2 | 4 | ❌ |
| Design | 6 | 8 | ⚠️ |

### Failed Criteria

- ❌ **Anti-hallucination measures** (2 pts): No keywords found for source verification
- ❌ **Edge cases documented** (1 pt): No mention of failure scenarios
- ❌ **Integration documented** (1 pt): No references to other agents/skills

### Recommendations

1. Add "Source Verification" section requiring citation of claims
2. Document edge cases: API failures, timeout scenarios, invalid input
3. List compatible skills/agents for composition patterns

</details>

---

## Recommendations (Prioritized)

### High Priority (Critical for production)

1. **Add error handling to 8 files**
   - Files: [list]
   - Action: Add error handling sections, define fallback behaviors

2. **Remove hardcoded paths from 5 files**
   - Files: [list]
   - Action: Replace with `$HOME`, relative paths, or env vars

### Medium Priority (Improves quality)

3. **Add usage examples to 4 files**
   - Files: [list]
   - Action: Create "Examples" section with 3+ scenarios

4. **Define output formats in 3 files**
   - Files: [list]
   - Action: Specify deliverable structure (Markdown/JSON/report)

### Low Priority (Polish)

5. **Add integration docs to 2 files**
   - Files: [list]
   - Action: List compatible agents/skills for composition

---

## Next Steps

1. Review failures: Focus on Grade D/F files first
2. Run with `--fix` for automated suggestions
3. Re-audit after improvements to track progress
4. Aim for 80%+ (Grade B) across all files for production readiness
```

---

## Этап 5: режим исправления (необязательно)

**Trigger**: флаг `--fix`

Для каждого критерия сбоя сгенерируйте конкретное предложение по исправлению:

### Примеры предложений по исправлению

**Файл**: `agent-name.md`
**Issue**: Отсутствуют меры по борьбе с галлюцинациями (потеряно 2 очка)

**Предлагаемое исправление**:
```markdown
Add this section after the "Methodology" section:

## Source Verification

- Always cite sources for factual claims
- Use phrases like "According to [source]..." or "Based on [documentation]..."
- If uncertain, explicitly state "I don't have verified information on..."
- Never invent statistics, version numbers, or API details
```

**Файл**: `skill-debugging/scripts/analyze.sh`
**Issue**: нет обработки ошибок (1 балл потерян)

**Предлагаемое исправление**:
```bash
Add to top of script:

set -e  # Exit on error
trap 'echo "Error on line $LINENO"' ERR

# Replace risky commands:
curl https://api.example.com        # ❌ No error check
curl https://api.example.com || {   # ✅ Error handled
    echo "API call failed"
    exit 1
}
```

---

## Подробный режим (необязательно)

**Trigger**: флаг `--verbose`

По умолчанию в отчете отображаются только критерии **, не прошедшие проверку**. Подробный режим отображает критерии **all** со статусом pass/fail:

```markdown
### All Criteria (Verbose)

| Criterion | Status | Points | Notes |
|-----------|--------|--------|-------|
| Clear name | ✅ Pass | 3/3 | Name is "debugging-specialist" (descriptive) |
| Description with triggers | ✅ Pass | 3/3 | Contains "Use when debugging..." |
| Model specified | ❌ Fail | 0/3 | No `model:` field in frontmatter |
| Tools restricted | ⚠️ Partial | 2/3 | Includes Bash but no justification |
| ... | ... | ... | ... |
```

---

## Отраслевой контекст

**Source**: Отчет агента LangChain за 2026 г. (проверено)

**Основная статистика**:
- 29,5% организаций используют агентов без систематической оценки
- 18% называют «ошибки агентов» своей главной проблемой.
- Только 12% используют автоматизированные проверки качества.

**Импликация**: Этот аудит устраняет **реальный пробел в отрасли**. Большинство команд развертывают agents/skills без проверки, что приводит к производственным проблемам. Порог 80 % (уровень B) соответствует передовым отраслевым практикам готовности производства.

**Comparison**: Ручные контрольные списки (например, Контрольный список проверки агента в Руководстве в строке 4921) являются полными, но подвержены ошибкам. Автоматизированная оценка снижает количество человеческих ошибок и предоставляет количественные показатели для отслеживания улучшений с течением времени.

---

## Связанный

- **Контрольный список проверки агента** (руководство 4921): ручной контрольный список из 16 критериев
- **Skill Validation** (руководство 5491): документация о соответствии техническим требованиям.
- **Примеры**: `examples/agents/`, `examples/skills/`, `examples/commands/`
- **Расширенный аудит**: используйте навык `audit-agents-skills` (см. `examples/skills/`) для сравнительного анализа с шаблонами.

---

## Замечания по реализации

### Шаблоны обнаружения

**Разбор фронтматтера**:
```python
import re
yaml_match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
if yaml_match:
    import yaml
    frontmatter = yaml.safe_load(yaml_match.group(1))
```

**Обнаружение ключевых слов** (без учета регистра):
```python
has_trigger = any(word in description.lower() for word in ['when', 'use', 'trigger'])
```

**Подсчет токенов** (приблизительно):
```python
tokens = len(content.split()) * 1.3  # Rough estimate: 1 token ≈ 0.75 words
```

### Обнаружение перекрытия

Сравните описания, используя сходство Жаккара:
```python
def jaccard_similarity(desc1, desc2):
    words1 = set(desc1.lower().split())
    words2 = set(desc2.lower().split())
    intersection = words1 & words2
    union = words1 | words2
    return len(intersection) / len(union) if union else 0

# Flag if similarity > 0.5 (50% keyword overlap)
```

### Цветовая маркировка класса (выходной терминал)

```python
COLORS = {
    'A': '\033[92m',  # Green
    'B': '\033[93m',  # Yellow
    'C': '\033[93m',  # Yellow
    'D': '\033[91m',  # Red
    'F': '\033[91m'   # Red
}
```

---

**Команда готова к использованию**: `/audit-agents-skills`
