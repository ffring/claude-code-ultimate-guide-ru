# Аудит безопасности

Комплексный аудит безопасности вашего проекта И конфигурации Claude Code. Анализирует раскрытие секретов, поверхности внедрения, зависимости, безопасность перехвата и выдает оценку состояния безопасности.

**Time**: 2–5 минут | **Scope**: Полный проект + конфигурация Claude Code

> Для быстрой проверки только конфигурации используйте вместо этого `/security-check`.

## Инструкции

Вы старший инженер по безопасности приложений. Выполните шестиэтапный аудит безопасности и подготовьте оценочный отчет с приоритетным планом исправления.

---

### Этап 1: Безопасность конфигурации (через /security-check)

Выполните все проверки из `/security-check` (команда `examples/commands/security-check.md`). Это охватывает:
- Аудит сервера MCP по базе данных CVE
- Навыки и агенты против известных вредоносных записей
- Схемы эксфильтрации с помощью хуков
- Обнаружение отравления памяти
- Проверка разрешений и настроек
- Раскрытые секреты в конфигурации Claude Code

Записывайте результаты: они способствуют итоговому баллу.

---

### Этап 2: сканирование секретов проекта

Сканируйте весь проект на наличие раскрытых секретов и учетных данных:

```bash
# API keys and tokens
grep -rn --include="*.{js,ts,py,go,java,rb,php,yaml,yml,json,toml,env,cfg,ini,conf}" \
  -E '(?i)(api[_-]?key|apikey|secret|password|passwd|token|bearer|auth)\s*[=:]\s*["'\''"][^"'\'']{8,}["'\''"]\s' \
  --exclude-dir={node_modules,vendor,.git,dist,build,target,__pycache__,.venv} . 2>/dev/null | head -30

# Known provider key patterns
grep -rn -E 'sk-[a-zA-Z0-9]{20,}|sk-ant-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{36}|AKIA[A-Z0-9]{16}|xox[bps]-[a-zA-Z0-9\-]{20,}' \
  --exclude-dir={node_modules,vendor,.git,dist,build,target} . 2>/dev/null | head -20

# Private keys
grep -rn 'BEGIN.*PRIVATE KEY' --exclude-dir={node_modules,vendor,.git} . 2>/dev/null

# .env files that might be committed
find . -name ".env*" -not -path "*/node_modules/*" -not -path "*/.git/*" -type f 2>/dev/null

# Check .gitignore coverage
[ -f ".gitignore" ] && {
  grep -q "\.env" .gitignore && echo "✅ .env in .gitignore" || echo "⚠️ .env NOT in .gitignore"
  grep -q "\.pem" .gitignore && echo "✅ .pem in .gitignore" || echo "⚠️ .pem NOT in .gitignore"
  grep -q "\.key" .gitignore && echo "✅ .key in .gitignore" || echo "⚠️ .key NOT in .gitignore"
}
```

**Scoring:**
- Найдено 0 секретов → +20 очков
- 1-3 секрета → +10 очков
- 4+ секретов → 0 очков
- Закрытый ключ зафиксирован → -10 баллов

---

### Этап 3: Поверхность для быстрого впрыска

Анализируем файлы уценки и конфигурации для векторов внедрения:

```bash
# Zero-width characters (invisible instructions)
grep -rPn '[\x{200B}-\x{200D}\x{FEFF}]' --include="*.md" --include="*.yaml" --include="*.json" . 2>/dev/null

# Hidden HTML comments with instructions
grep -rn '<!--' --include="*.md" . 2>/dev/null | grep -i 'ignore\|system\|admin\|instruction\|override\|forget'

# Base64 in comments (potential hidden payloads)
grep -rn -E '[#;].*[A-Za-z0-9+/]{20,}={0,2}' --include="*.py" --include="*.js" --include="*.ts" --include="*.md" \
  --exclude-dir={node_modules,vendor,.git} . 2>/dev/null | head -10

# ANSI escape sequences
grep -rPn '\x1b\[|\x1b\]|\x1b\(' --exclude-dir={node_modules,vendor,.git} . 2>/dev/null | head -10

# Null bytes
grep -rPn '\x00' --exclude-dir={node_modules,vendor,.git,dist} . 2>/dev/null | head -5

# Nested command execution in markdown/config
grep -rn -E '\$\([^)]+\)|`[^`]+`' --include="*.md" --include="*.yaml" --include="*.json" \
  --exclude-dir={node_modules,vendor,.git} . 2>/dev/null | head -10
```

**Scoring:**
- 0 векторов инъекции → +15 баллов
- 1-2 вектора (вероятны ложные срабатывания) → +10 баллов
- 3+ вектора → +5 баллов
- Подтвержденная инъекция в CLAUDE.md → 0 баллов

---

### Этап 4: Аудит зависимостей

Запустите соответствующий аудит пакета для проекта:

```bash
# Node.js
[ -f "package-lock.json" ] && npm audit --json 2>/dev/null | jq '{total: .metadata.vulnerabilities.total, critical: .metadata.vulnerabilities.critical, high: .metadata.vulnerabilities.high}' 2>/dev/null

# Python
[ -f "requirements.txt" ] && pip-audit -r requirements.txt 2>/dev/null || [ -f "pyproject.toml" ] && pip-audit 2>/dev/null

# Rust
[ -f "Cargo.toml" ] && cargo audit 2>/dev/null

# Go
[ -f "go.mod" ] && govulncheck ./... 2>/dev/null
```

Если менеджер пакетов не обнаружен, отметьте это и пропустите (без штрафов).

**Scoring:**
- 0 уязвимостей → +20 очков
- 0 критического + 0 высокого → +15 очков
- 1-3 высокий → +10 очков
- Любой критический → +5 очков
- 10+ высокий или 3+ критический → 0 очков

---

### Этап 5: Оценка безопасности перехватчика

Убедитесь, что перехватчики безопасности из `guide/security/security-hardening.md` установлены правильно:

```bash
# Check for recommended security hooks
echo "=== Checking security hooks ==="

# PreToolUse hooks (should block dangerous patterns)
ls .claude/hooks/PreToolUse* 2>/dev/null || echo "⚠️ No PreToolUse hooks found"

# PostToolUse hooks (should monitor output)
ls .claude/hooks/PostToolUse* 2>/dev/null || echo "⚠️ No PostToolUse hooks found"

# Check if prompt injection detector exists
find . -path "*/hooks/*injection*" -o -path "*/hooks/*security*" -o -path "*/hooks/*scanner*" 2>/dev/null

# Check settings for hook configuration
grep -c "hooks" .claude/settings.json 2>/dev/null || echo "No hooks in settings.json"
```

**Scoring:**
- Установлены хуки безопасности PreToolUse → +10 баллов
- Установлен выходной сканер PostToolUse → +5 баллов
- Хук для быстрого обнаружения впрыска → +5 баллов
- Никаких хуков → 0 баллов

---

### Этап 6: Оценка осанки и отчет

Подсчитайте общий балл и создайте отчет.

**Распределение очков:**

| Категория | Макс. баллы | Источник |
|----------|-----------|--------|
| Безопасность конфигурации (этап 1) | 30 | /security-check результаты |
| Сканирование секретов (фаза 2) | 20 | Секреты, найденные в проекте |
| Поверхность впрыска (фаза 3) | 15 | Найдены векторы инъекций |
| Зависимости (фаза 4) | 20 | Аудит уязвимостей |
| Крюк безопасности (этап 5) | 15 | Установлены защитные хуки |
| **Итого** | **100** | |

**Подсчет очков на этапе 1:**
- 0 КРИТИЧЕСКИХ выводов → +15 баллов
- 0 ВЫСОКИХ результатов → +10 баллов
- 0 СРЕДНИЕ выводы → +5 баллов
- Любой КРИТИЧЕСКИЙ → 0 для этой подоценки

**Шкала оценок:**

| Счет | Оценка | Значение |
|-------|-------|---------|
| 90-100 | A | Отлично: готовая к работе система безопасности |
| 75-89 | B | Хорошо: рекомендуется внести незначительные улучшения. |
| 60-74 | C | Приемлемо: решить ВЫСОКИЕ проблемы до начала производства. |
| 40-59 | D | Плохо: значительные пробелы в безопасности |
| 0-39 | F | Критично: не развертывать, немедленно решать КРИТИЧЕСКИЕ проблемы. |

## Выходной формат

```
## 🛡️ Security Audit Report

**Date**: [timestamp]
**Project**: [directory name]
**Scope**: Full project + Claude Code configuration

### Security Posture Score: [XX]/100 (Grade [X])

[1-sentence assessment]

### Phase Results

| Phase | Score | Max | Key Finding |
|-------|-------|-----|-------------|
| 1. Config Security | XX | 30 | [summary] |
| 2. Secrets Scan | XX | 20 | [summary] |
| 3. Injection Surface | XX | 15 | [summary] |
| 4. Dependencies | XX | 20 | [summary] |
| 5. Hook Security | XX | 15 | [summary] |
| **Total** | **XX** | **100** | |

### 🔴 Critical Findings
[Each finding with location, description, and exact fix]

### 🟠 High Findings
[Each finding with location, description, and fix]

### 🟡 Medium Findings
[Each finding with location, description, and fix]

### 🔧 Remediation Plan (Priority Order)

| # | Action | Severity | Effort | Command/Steps |
|---|--------|----------|--------|---------------|
| 1 | [action] | CRITICAL | [time] | [how] |
| 2 | [action] | HIGH | [time] | [how] |
| ... | | | | |

### 📊 Benchmark

Your score vs security-hardening.md recommendations:
- [X] items from the guide are implemented
- [X] items are missing
- Top 3 missing items to implement next: [...]

### 📚 References
- Security hardening guide: guide/security/security-hardening.md
- Threat database: examples/commands/resources/threat-db.yaml
- Quick check: `/security-check`
- MCP scan tool: `uvx snyk-agent-scan@latest` (Snyk Agent Scan, formerly mcp-scan)
```

$ARGUMENTS
