---
name: security
description: "Быстрая оценка безопасности, сосредоточенная на 10 наиболее уязвимых местах OWASP."
argument-hint: "[path] [--depth quick|full]"
effort: medium
when_to_use: "Use when reviewing code for security vulnerabilities or before merging sensitive changes."
disable-model-invocation: true
---

# Быстрый аудит безопасности

Быстрая оценка безопасности сосредоточена на 10 наиболее уязвимых местах OWASP.

## Цель

Выполните быстрое сканирование безопасности для выявления распространенных уязвимостей:
- Жестко закодированные секреты и учетные данные
- Риски SQL-инъекций
- XSS-уязвимости
- Небезопасные зависимости
- Проблемы с Authentication/authorization

## Инструкции

### Шаг 1. Сканирование секретов

```bash
# Common secret patterns
grep -rn --include="*.{js,ts,py,go,java,rb,php,env}" \
  -E "(password|secret|api_key|apikey|token|auth|credential).*[=:].*['\"][^'\"]{8,}['\"]" \
  --exclude-dir={node_modules,vendor,.git,dist,build} . 2>/dev/null | head -20

# .env files that might be committed
find . -name ".env*" -not -path "*/node_modules/*" -type f 2>/dev/null

# Check if secrets are gitignored
[ -f ".gitignore" ] && grep -q "\.env" .gitignore && echo "✅ .env in .gitignore" || echo "⚠️ .env NOT in .gitignore"
```

### Шаг 2. Внедрение уязвимостей

```bash
# SQL injection patterns (raw queries with string concat)
grep -rn --include="*.{js,ts,py,go,java,php}" \
  -E "(query|execute|raw|sql).*\+.*\$|f['\"].*SELECT|\.format\(.*SELECT" \
  --exclude-dir={node_modules,vendor,.git} . 2>/dev/null | head -15

# Command injection patterns
grep -rn --include="*.{js,ts,py,go,rb,php}" \
  -E "(exec|spawn|system|shell_exec|popen)\s*\(" \
  --exclude-dir={node_modules,vendor,.git} . 2>/dev/null | head -15
```

### Шаг 3. Шаблоны XSS

```bash
# Dangerous innerHTML/dangerouslySetInnerHTML usage
grep -rn --include="*.{js,ts,jsx,tsx,vue}" \
  -E "(innerHTML|dangerouslySetInnerHTML|v-html)" \
  --exclude-dir={node_modules,.git,dist} . 2>/dev/null | head -15

# Unescaped template literals in HTML context
grep -rn --include="*.{js,ts,jsx,tsx}" \
  -E "\`.*\$\{.*\}.*<" \
  --exclude-dir={node_modules,.git,dist} . 2>/dev/null | head -10
```

### Шаг 4. Проверка зависимостей

```bash
# Check for known vulnerabilities in npm packages
[ -f "package-lock.json" ] && npm audit --json 2>/dev/null | jq '{vulnerabilities: .metadata.vulnerabilities}' 2>/dev/null

# Check for outdated packages with security issues
[ -f "package.json" ] && npm outdated --json 2>/dev/null | jq 'to_entries | map(select(.value.current != .value.latest)) | length' 2>/dev/null
```

### Шаг 5. Проблемы с аутентификацией и сеансом

```bash
# Hardcoded JWT secrets
grep -rn --include="*.{js,ts,py,go}" \
  -E "(jwt|JWT).*secret.*[=:].*['\"].{8,}['\"]" \
  --exclude-dir={node_modules,vendor,.git} . 2>/dev/null

# Missing CSRF protection patterns
grep -rn --include="*.{js,ts,py}" \
  -E "(POST|PUT|DELETE|PATCH).*fetch|axios\.(post|put|delete|patch)" \
  --exclude-dir={node_modules,vendor,.git} . 2>/dev/null | head -10
```

## Выходной формат

---

### 🛡️ Отчет о проверке безопасности

**Сканировать дату**: [метка времени]
**Scope**: [каталог просканирован]

### 🔴 Критические проблемы

| Проблема | Расположение | Описание |
|-------|----------|-------------|
| [тип] | [файл:строка] | [краткое описание] |

### 🟠 Высокая степень тяжести

| Проблема | Расположение | Рекомендация |
|-------|----------|----------------|
| [тип] | [файл:строка] | [исправить предложение] |

### 🟡 Средняя степень тяжести

| Проблема | Расположение | Примечание |
|-------|----------|------|
| [тип] | [файл:строка] | [контекст] |

### 📊 Резюме

- **Critical**: X проблем
- **High**: X проблем
- **Medium**: X проблем
- **Зависимости**: X уязвимостей

### 🔧 Быстрые исправления

1. [Исправление с наивысшим приоритетом для command/code]
2. [Второй приоритет]
3. [Третий приоритет]

---

## Уровни серьезности

| Уровень | Примеры | Действие |
|-------|----------|--------|
| 🔴 Критический | Жестко закодированные секреты продукта, SQL-инъекция | Исправьте немедленно |
| 🟠 Высокий | Отсутствуют векторы аутентификации и XSS. | Исправьте перед развертыванием |
| 🟡 Средний | Устаревшие описания, отсутствует CSRF | План исправления |
| 🟢 Низкий | Нарушения передовой практики | Отслеживайте улучшения |

## Использование

**Полный аудит:**
```
/security
```

**Фокус на конкретной области:**
```
/security auth
/security deps
/security injection
```

**Конкретный file/directory:**
```
/security src/api/
```

## Примечания

- Это быстрое эвристическое сканирование, а не комплексный аудит безопасности.
- Для производственных систем дополните специальными инструментами (Snyk, SonarQube, OWASP ZAP).
- Возможны ложные срабатывания — проверьте результаты вручную
- См. `examples/hooks/security-hooks.sh` для автоматических проверок безопасности перед фиксацией.

$ARGUMENTS
