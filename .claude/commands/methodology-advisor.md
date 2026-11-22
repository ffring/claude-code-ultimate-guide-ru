---
name: methodology-advisor
description: "Анализирует вашу кодовую базу и задает 3 целевых вопроса, чтобы порекомендовать правильный стек методологии разработки с использованием искусственного интеллекта."
---

# Советник по методологии

Проанализируйте этот проект и порекомендуйте лучший набор методологий разработки с использованием искусственного интеллекта. Сначала прочитайте то, что можете, из кодовой базы, а затем спрашивайте только то, что вы не можете сделать вывод.

**Time**: 2–4 минуты | **Output**: один рекомендуемый стек + контекстный быстрый старт.

---

## Этап 1. Тихий анализ кодовой базы

Запускайте эти чтения молча. Результаты пока не выводите — постройте только внутреннюю картину.

### 1.1 Идентичность проекта

```bash
# Config files
cat CLAUDE.md 2>/dev/null || cat claude.md 2>/dev/null
cat package.json 2>/dev/null | grep -E '"name"|"description"|"scripts"' | head -10
cat Cargo.toml 2>/dev/null | grep -E '^name|^description' | head -5
cat pyproject.toml 2>/dev/null | grep -E '^name|^description' | head -5
cat go.mod 2>/dev/null | head -3
```

### 1.2 Размер команды

```bash
# Unique contributors in last 90 days
git log --since="90 days ago" --format="%ae" 2>/dev/null | sort -u | wc -l
# Total commits
git log --oneline 2>/dev/null | wc -l
```

### 1.3 Зрелость теста

```bash
# Test files exist?
find . -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" -o -name "test_*.py" \
  2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l
# Test framework hints
grep -rn --include="*.json" --include="*.toml" --include="*.yaml" \
  -l "jest\|vitest\|pytest\|rspec\|mocha\|cypress\|playwright" \
  2>/dev/null | grep -v node_modules | head -5
# CI config
ls .github/workflows/*.yml 2>/dev/null | wc -l
ls .gitlab-ci.yml .circleci/config.yml 2>/dev/null | wc -l
```

### 1.4 Сигналы спецификации и документации

```bash
# Spec files
find . -name "*.spec.md" -o -name "SPEC*.md" -o -name "spec.md" -o -name "DESIGN*.md" \
  -o -name "ADR*.md" -o -name "RFC*.md" \
  2>/dev/null | grep -v node_modules | grep -v ".git" | head -10
# OpenAPI / contract files
find . -name "openapi*.yaml" -o -name "openapi*.json" -o -name "swagger*.yaml" \
  -o -name "*.proto" \
  2>/dev/null | grep -v node_modules | head -5
# BDD feature files
find . -name "*.feature" 2>/dev/null | grep -v node_modules | wc -l
```

### 1.5 Размер и структура кодовой базы

```bash
# File count (rough)
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.py" \
  -o -name "*.rs" -o -name "*.go" -o -name "*.java" -o -name "*.rb" \) \
  2>/dev/null | grep -v node_modules | grep -v ".git" | wc -l
# Services / packages (monorepo signal)
ls packages/ apps/ services/ 2>/dev/null | head -10
```

### 1.6 Сигналы AI и LLM

```bash
# LLM API usage in code
grep -rn --include="*.ts" --include="*.py" --include="*.js" \
  -l "anthropic\|openai\|groq\|mistral\|langchain\|llm\|ChatCompletion\|claude" \
  2>/dev/null | grep -v node_modules | grep -v ".git" | head -5
# Eval framework hints
find . -name "evals*" -o -name "*eval*" -type d 2>/dev/null | grep -v node_modules | head -5
```

---

## Фаза 2 — Наберите 8 стопок

Используя то, что вы нашли, оцените каждую стопку от 0 до 10 на основе сигналов соответствия:

| Куча | Ключевые сигналы, повышающие рейтинг |
|-------|----------------------------------|
| **solo-mvp** | 1 участник, мало файлов, пока нет CI, новый проект |
| **team-greenfield** | 2–10 участников, новый проект, никаких устаревших файлов. |
| **микросервисы** | `packages/`, `services/`, файлы OpenAPI, `.proto` |
| **brownfield-saas** | Большое количество коммитов, большое количество файлов, мало тестовых файлов |
| **enterprise-gov** | Более 10 участников, файлы CI, ADR, `AGENTS.md` |
| **llm-native** | Импорт LLM, каталоги оценки, сигналы продуктов AI |
| **power-solo** | 1 участник, высокая частота коммитов, итеративные коммиты |
| **plan-moderate** | Смешанные сигналы, присутствует CLAUDE.md, средний размер |

---

## Этап 3. Спрашивайте только то, о чем вы не можете сделать вывод.

После молчаливого анализа представьте пользователю свою предварительную картинку в 2-3 строчках, затем задайте ровно 3 вопроса. Больше не надо.

Format:

```
From your codebase I can see: [2-3 concrete observations].
Before recommending, 3 quick questions:

1. [Pain point question — pick the most relevant from below]
2. [Deploy frequency — if not inferable from CI/CD signals]
3. [Setup appetite — how much ceremony are you willing to invest?]
```

**Банк вопросов — выберите 3 наиболее актуальных с учетом того, что вы нашли:**

- Пейн: «Что вас сейчас тормозит больше всего — регрессии, неясные требования, гниение контекста между сессиями или отсутствие возможности отслеживания?»
- Пейн: «Когда Claude генерирует большой кусок кода, что вас больше всего беспокоит — качество, отклонение от спецификации или потеря контроля над тем, что было создано?»
- Развертывание: «Как часто вы отправляете продукт в производство — несколько раз в день, еженедельно или в рамках более длительных циклов выпуска?»
- Развертывание: «Это продукт, имеющий сегодня реальных пользователей, прототип или внутренний инструмент?»
- Управление: «Какую первоначальную настройку вы готовы вложить — ничего (просто начать), 30 минут или полдня?»
- Управление: «Нужно ли кому-либо за пределами вашей команды разработчиков (PM, QA, отдел обеспечения соответствия) проверять то, что создается?»
- Продукт ИИ: «Предоставляет ли ваш продукт результаты, созданные ИИ, непосредственно конечным пользователям?»
- Масштаб: «Нужно ли нескольким службам или командам согласовывать контракты API перед реализацией?»

---

## Этап 4. Рекомендация

Выведите рекомендацию в такой структуре:

---

### Ваш стек: [Название стека] [значок]

**Почему это подходит для вашего проекта:**
- [Находка из фазы 1] → [объясняет выбор стека]
- [Находка из фазы 1] → [объясняет выбор стека]
- [Ответ на вопрос N] → [объясняет выбор стека]

**Включенные методики:** `[Method A]` + `[Method B]` (+ `[Method C]`, если применимо)

**Как это выглядит на практике:**
[2-3 предложения, описывающие конкретный рабочий процесс ЭТОГО проекта, с использованием реальных имен файлов или найденных путей.]

**Быстрый старт вашего проекта:**
1. [Конкретный первый шаг с использованием реального контекста проекта]
2. [Второй шаг]
3. [Третий шаг]

**Прежде чем начать, обратите внимание:**
- [Один честный компромисс или ограничение этого стека]
- [Одна вещь, на которую следует обратить внимание, учитывая то, что вы нашли]

**Глубже:** https://cc.bruniaux.com/methodologies/ — интерактивный тест и полное сравнение стека
**Полное методическое руководство:** https://cc.bruniaux.com/guide/methodologies/

---

## Ссылка на стек (внутренняя)

Используйте это, чтобы сопоставить свою оценку с языком быстрого старта:

**solo-mvp** (SDD + TDD): запись спецификации функции в CLAUDE.md → `"Write failing tests for this spec, then implement until green."`

**team-greenfield** (Spec Kit + TDD + BDD): сценарии `/speckit.constitution` → Given/When/Then с PM → TDD для каждого сценария.

**microservices** (CDD + Specmatic + TDD): сначала напишите спецификацию OpenAPI → Specmatic для контрактных тестов → реализация TDD.

**brownfield-saas** (OpenSpec + BDD + JiTTesting): OpenSpec фиксирует текущее состояние → BDD для изменения поведения → предварительное слияние: `"Generate tests that catch regressions in this diff."`

**enterprise-gov** (BMAD + Spec Kit + Specmatic): `constitution.md` → определения ролей агента → требования Specmatic → обеспечение соблюдения контракта Specmatic.

**llm-native** (управление оценкой + мультиагент): определение критериев оценки (точность, безопасность, формат) → создание системы оценки → повторение до тех пор, пока оценки не пройдут.

**power-solo** (TDD + Ralph Loop + Iterative): плотный цикл тестирования → свежий контекст для каждой задачи через git stash + файлы прогресса → `"Keep iterating until all tests pass and lint is clean."`

**plan-moderate** (Plan-First + SDD + Context Engineering): каждая сложная задача запускается в режиме планирования (Shift+Tab) → проверка → запись спецификации в CLAUDE.md → выполнение с прогрессивной загрузкой контекста.
