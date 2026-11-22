---
name: audit-codebase
description: "Аудит работоспособности кодовой базы с оценкой 7 категорий и планом развития"
argument-hint: "[path] [--focus security|performance|quality]"
effort: medium
disable-model-invocation: true
---

# Аудит работоспособности кодовой базы

Оцените свою кодовую базу по 7 категориям работоспособности, определите слабые места и получите приоритетный план развития. Каждая категория оценивается по шкале от 1 до 10 с конкретными практическими выводами.

**Time**: 3–8 минут в зависимости от размера кодовой базы | **Scope**: Полный проект

## Инструкции

Вы — старший инженер-консультант, выполняющий оценку работоспособности кодовой базы. Проанализируйте проект по всем 7 категориям (или подмножеству, если в `$ARGUMENTS` указаны категории), оцените каждую из них и составьте план развития.

Если `$ARGUMENTS` содержит названия категорий (например, «секретные тесты безопасности»), проверяйте только эти категории. В противном случае одитируйте все 7.

---

### Категория 1: Секреты (вес: 15%)

Сканируйте жестко запрограммированные учетные данные, ключи API и конфиденциальные данные в коде.

```bash
# API keys and tokens in code
grep -rn --include="*.{js,ts,py,go,java,rb,php,yaml,yml,json,toml,env,cfg,ini,conf}" \
  -E '(?i)(api[_-]?key|apikey|secret[_-]?key|password|passwd|token|bearer)\s*[=:]\s*["'\''"][^"'\'']{8,}' \
  --exclude-dir={node_modules,vendor,.git,dist,build,target,__pycache__,.venv} . 2>/dev/null | head -20

# Known provider patterns
grep -rn -E 'sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AKIA[A-Z0-9]{16}|xox[bps]-[a-zA-Z0-9\-]{20,}' \
  --exclude-dir={node_modules,vendor,.git,dist,build,target} . 2>/dev/null | head -10

# .env files committed
find . -name ".env*" -not -name ".env.example" -not -path "*/node_modules/*" -not -path "*/.git/*" -type f 2>/dev/null

# .gitignore coverage
[ -f ".gitignore" ] && {
  for pattern in ".env" "*.pem" "*.key" "*.p12"; do
    grep -q "$pattern" .gitignore 2>/dev/null && echo "OK: $pattern in .gitignore" || echo "MISSING: $pattern not in .gitignore"
  done
}
```

**Scoring:**
- 10: Никаких секретов, .gitignore охватывает все конфиденциальные шаблоны, существует .env.example.
- 7-9: Никаких секретов в коде, незначительные пробелы в .gitignore.
- 4–6: обнаружено 1–3 потенциальных секрета (могут быть ложными срабатываниями) или зафиксирован .env.
- 1–3: несколько секретов в коде, закрытые ключи зафиксированы, защита .gitignore отсутствует.

---

### Категория 2: Безопасность (вес: 15%)

Проверьте наличие уязвимостей в стиле OWASP и небезопасных шаблонов.

```bash
# SQL injection patterns
grep -rn --include="*.{js,ts,py,java,go,rb,php}" \
  -E '(query|execute|exec)\s*\(\s*[`"'\''"].*\+|\$\{|%s|\.format\(' \
  --exclude-dir={node_modules,vendor,.git,dist,build,target,test,__test__} . 2>/dev/null | head -15

# eval/exec usage
grep -rn -E '\b(eval|exec|execSync|Function\(|setTimeout\([^,]*[+`]|setInterval\([^,]*[+`])' \
  --include="*.{js,ts,py}" --exclude-dir={node_modules,vendor,.git,dist} . 2>/dev/null | head -10

# Unsafe deserialization
grep -rn -E '(pickle\.loads|yaml\.load\(|JSON\.parse\(.*user|unserialize\()' \
  --exclude-dir={node_modules,vendor,.git,dist} . 2>/dev/null | head -10

# Missing input validation on routes/endpoints
grep -rn -E '(app\.(get|post|put|delete|patch)|router\.(get|post|put|delete))' \
  --include="*.{js,ts}" --exclude-dir={node_modules,.git,dist} . 2>/dev/null | wc -l
```

**Scoring:**
- 10: Нет шаблонов внедрения, нет eval/exec, проверка ввода на всех конечных точках, заголовки CSP.
- 7–9: Незначительные проблемы (1–2 использования оценки в коде, не ориентированном на пользователя)
- 4–6: Некоторые шаблоны внедрения, отсутствует проверка на нескольких конечных точках.
- 1–3: риск активного внедрения SQL, оценка с учетом пользовательского ввода, без очистки ввода

---

### Категория 3: Зависимости (вес: 15%)

Проверяйте работоспособность пакетов, известные CVE и актуальность.

```bash
# Node.js audit
[ -f "package-lock.json" ] && npm audit --json 2>/dev/null | jq '.metadata.vulnerabilities' 2>/dev/null
[ -f "package.json" ] && npx npm-check 2>/dev/null | tail -20

# Python
[ -f "requirements.txt" ] && pip-audit -r requirements.txt 2>/dev/null | tail -20
[ -f "pyproject.toml" ] && pip-audit 2>/dev/null | tail -20

# Rust
[ -f "Cargo.toml" ] && cargo audit 2>/dev/null | tail -20

# Go
[ -f "go.mod" ] && govulncheck ./... 2>/dev/null | tail -20

# Lockfile presence
for lockfile in package-lock.json yarn.lock pnpm-lock.yaml Cargo.lock go.sum poetry.lock; do
  [ -f "$lockfile" ] && echo "OK: $lockfile exists"
done
[ ! -f "package-lock.json" ] && [ ! -f "yarn.lock" ] && [ ! -f "pnpm-lock.yaml" ] && [ -f "package.json" ] && echo "MISSING: No lockfile for Node.js project"
```

**Scoring:**
- 10: отсутствие CVE, наличие файла блокировки, все зависимости <6 месяцев назад.
- 7-9: Нет CVE critical/high, незначительные устаревшие пакеты.
- 4–6: 1–3 CVE с высоким уровнем или зависимости >50 %, устаревшие более чем на год.
- 1-3: Критические CVE, нет файла блокировки, заброшенные зависимости

---

### Категория 4: Структура (вес: 10%)

Оцените организацию файлов, соглашения об именах и границы модулей.

```bash
# File count per top-level directory
for dir in */; do
  [ -d "$dir" ] && [ "$dir" != "node_modules/" ] && [ "$dir" != ".git/" ] && [ "$dir" != "vendor/" ] && \
    echo "$dir: $(find "$dir" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l) files"
done

# Deeply nested files (complexity indicator)
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/vendor/*" -mindepth 6 2>/dev/null | head -10

# Mixed naming conventions
find . -type f -name "*_*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -5
find . -type f -name "*-*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -5

# Circular dependency indicators (for JS/TS projects)
[ -f "package.json" ] && npx madge --circular --extensions ts,js src/ 2>/dev/null | head -20
```

**Scoring:**
- 10: Четкие границы модулей, согласованное наименование, отсутствие циклических подразделений, плоская иерархия
- 7–9: Хорошая структура с небольшими несоответствиями.
- 4-6: Смешанные соглашения, некоторые циклические описания, неясные границы модулей.
- 1-3: Нет четкой структуры, глубоко вложенные файлы, широко распространенные циклические хранилища.

---

### Категория 5: Тесты (вес: 15%)

Оцените тестовое покрытие, качество тестирования и методы тестирования.

```bash
# Test file count vs source file count
TEST_COUNT=$(find . -type f \( -name "*.test.*" -o -name "*.spec.*" -o -name "test_*" -o -path "*/test/*" -o -path "*/__tests__/*" \) \
  -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | wc -l)
SRC_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.go" -o -name "*.java" \) \
  -not -name "*.test.*" -not -name "*.spec.*" -not -name "test_*" \
  -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" 2>/dev/null | wc -l)
echo "Test files: $TEST_COUNT | Source files: $SRC_COUNT | Ratio: $(echo "scale=2; $TEST_COUNT / ($SRC_COUNT + 1)" | bc)"

# Coverage config presence
for cfg in jest.config.* vitest.config.* .nycrc .coveragerc pytest.ini setup.cfg; do
  [ -f "$cfg" ] && echo "OK: $cfg exists"
done

# Coverage report (if available)
[ -d "coverage" ] && [ -f "coverage/coverage-summary.json" ] && cat coverage/coverage-summary.json | jq '.total' 2>/dev/null

# Snapshot test count (potential maintenance burden)
find . -name "*.snap" -not -path "*/node_modules/*" 2>/dev/null | wc -l
```

**Scoring:**
- 10: коэффициент тестирования >0,8, охват >80%, CI запускает тесты, нет устаревших снимков
- 7-9: коэффициент тестирования >0,5, охват >60%, конфигурация покрытия присутствует.
- 4-6: Некоторые тесты существуют, но пробелы очевидны, покрытие не отслеживается.
- 1–3: коэффициент тестирования <0,2 или отсутствие тестов вообще.

---

### Категория 6: Импорт (вес: 10%)

Проверьте наличие неиспользуемого импорта, циклических зависимостей и покрытия типов.

```bash
# Unused imports (TypeScript/JavaScript)
[ -f "tsconfig.json" ] && npx tsc --noEmit 2>&1 | grep -c "declared but" 2>/dev/null
[ -f "tsconfig.json" ] && npx tsc --noEmit 2>&1 | grep "declared but" | head -10

# TypeScript strict mode
[ -f "tsconfig.json" ] && grep -E '"strict"|"noImplicitAny"|"strictNullChecks"' tsconfig.json 2>/dev/null

# Python unused imports
[ -f "pyproject.toml" ] || [ -f "setup.py" ] && python -m pyflakes . 2>/dev/null | grep "imported but unused" | head -10

# Wildcard imports (code smell)
grep -rn 'import \*' --include="*.{py,ts,js}" --exclude-dir={node_modules,vendor,.git} . 2>/dev/null | head -10
```

**Scoring:**
- 10: Ноль неиспользуемых импортов, строгий режим TypeScript, без импорта с подстановочными знаками.
- 7–9: <5 неиспользуемых импортов, включен строгий режим с небольшими пробелами.
- 4–6: 5–20 неиспользуемых импортов, без строгого режима, некоторые импорты с подстановочными знаками.
- 1-3: >20 неиспользуемых импортов, широко распространенный импорт с подстановочными знаками, без проверки типа.

---

### Категория 7: Модели ИИ (вес: 20%)

Оцените зрелость конфигурации Claude Code и готовность к разработке с помощью искусственного интеллекта.

```bash
# CLAUDE.md presence and quality
[ -f "CLAUDE.md" ] && echo "OK: CLAUDE.md exists ($(wc -l < CLAUDE.md) lines)" || echo "MISSING: No CLAUDE.md"
[ -f ".claude/settings.json" ] && echo "OK: .claude/settings.json exists" || echo "MISSING: No .claude/settings.json"

# Custom commands
COMMANDS=$(find .claude/commands -name "*.md" 2>/dev/null | wc -l)
echo "Custom commands: $COMMANDS"

# Hooks
HOOKS_CFG=$(grep -c "hooks" .claude/settings.json 2>/dev/null || echo "0")
echo "Hook configurations: $HOOKS_CFG"

# Rules files
RULES=$(find .claude/rules -name "*.md" 2>/dev/null | wc -l)
echo "Rule files: $RULES"

# Agents
AGENTS=$(find .claude/agents -name "*.md" 2>/dev/null | wc -l)
echo "Agent definitions: $AGENTS"

# Skills
SKILLS=$(find .claude/skills -name "*.md" 2>/dev/null | wc -l)
echo "Skills: $SKILLS"

# .gitignore for AI artifacts
grep -q "claude" .gitignore 2>/dev/null && echo "OK: Claude patterns in .gitignore" || echo "INFO: No Claude patterns in .gitignore"
```

**Scoring:**
- 10: CLAUDE.md с соглашениями, настроенными перехватчиками, пользовательскими командами, правилами, агентами.
- 7-9: CLAUDE.md существует с контекстом проекта, некоторыми командами или правилами.
- 4-6: Базовый CLAUDE.md, без хуков и команд.
- 1-3: нет CLAUDE.md или пустой CLAUDE.md.

---

## Оценка и отчет

### Подсчет общего балла

```
Overall = (Secrets * 0.15) + (Security * 0.15) + (Dependencies * 0.15) +
          (Structure * 0.10) + (Tests * 0.15) + (Imports * 0.10) +
          (AI Patterns * 0.20)
```

Округляем до одного десятичного знака.

### Выходной формат

```markdown
## Codebase Health Audit

**Project**: [directory name]
**Date**: [timestamp]
**Categories audited**: [all 7 or filtered subset]

### Overall Score: [X.X] / 10

| Category | Score | Weight | Weighted | Key Finding |
|----------|-------|--------|----------|-------------|
| Secrets | X/10 | 15% | X.XX | [one-line summary] |
| Security | X/10 | 15% | X.XX | [one-line summary] |
| Dependencies | X/10 | 15% | X.XX | [one-line summary] |
| Structure | X/10 | 10% | X.XX | [one-line summary] |
| Tests | X/10 | 15% | X.XX | [one-line summary] |
| Imports | X/10 | 10% | X.XX | [one-line summary] |
| AI Patterns | X/10 | 20% | X.XX | [one-line summary] |
| **Overall** | | **100%** | **X.XX** | |

### Detailed Findings

#### 🔴 Critical (fix immediately)
- [Finding with file:line reference and concrete fix]

#### 🟡 Warning (fix this week)
- [Finding with context and suggested approach]

#### 🟢 Info (nice to improve)
- [Observation with optional suggestion]

### Progression Plan

[Based on overall score, show the appropriate tier]

#### Tier 1: Foundation (current score <5, target: 5)
Focus on eliminating critical risks before anything else.

| Priority | Action | Category | Impact | Effort |
|----------|--------|----------|--------|--------|
| 1 | [specific action] | [category] | [score gain] | [time estimate] |
| 2 | [specific action] | [category] | [score gain] | [time estimate] |
| ... | | | | |

#### Tier 2: Solid (current score 5-7, target: 8)
Build reliable practices on top of the foundation.

| Priority | Action | Category | Impact | Effort |
|----------|--------|----------|--------|--------|
| 1 | [specific action] | [category] | [score gain] | [time estimate] |
| ... | | | | |

#### Tier 3: Excellent (current score 8+, target: 10)
Polish and optimize for maximum team velocity.

| Priority | Action | Category | Impact | Effort |
|----------|--------|----------|--------|--------|
| 1 | [specific action] | [category] | [score gain] | [time estimate] |
| ... | | | | |

### Quick Wins (< 30 minutes each)
1. [Action that improves score with minimal effort]
2. [...]
3. [...]
```

### Распределение серьезности

Примерно 70% находок должны быть автоматизированы (скрипты, линтеры, CI-проверки могут их обнаружить). Отметьте оставшиеся 30% как требующие человеческого решения и объясните, почему автоматизация не подходит для этих случаев.

---

**Sources**:
- Плагин анализатора кодовой базы Variant Systems (variantsystems.io, февраль 2026 г.): платформа анализа по 7 категориям.
- Топ-10 OWASP (2021 г.): Шаблоны категорий безопасности
- Claude Code Руководство по усилению безопасности: базовые показатели категории «Модели искусственного интеллекта»

$ARGUMENTS
