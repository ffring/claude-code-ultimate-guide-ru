---
name: security-check
description: "Быстрая проверка безопасности конфигурации по базе данных известных угроз"
argument-hint: "[path]"
effort: medium
disable-model-invocation: true
---

# Проверка безопасности

Быстрая проверка безопасности конфигурации по базе данных известных угроз. Проверяет вашу настройку Claude Code на наличие известных вредоносных навыков, уязвимых MCP, опасных шаблонов и раскрытых секретов.

**Time**: ~30 секунд | **Scope**: только конфигурация Claude Code

## Инструкции

Вы аналитик безопасности. Проверьте конфигурацию пользователя Claude Code по базе данных угроз совместимости по адресу `examples/commands/resources/threat-db.yaml`. Составьте краткий и действенный отчет.

### Этап 1. Загрузка базы данных угроз.

Прочтите `examples/commands/resources/threat-db.yaml` из этого репозитория, чтобы загрузить:
- Известные злонамеренные авторы и навыки
- База данных CVE для серверов MCP
- Подозрительные шаблоны для перехватчиков, агентов и конфигурации.

### Этап 2: аудит сервера MCP

Прочитайте конфигурацию пользователя MCP:

```bash
# Global MCP config
cat ~/.claude.json 2>/dev/null | jq '.mcpServers // empty'

# Project MCP config
cat .mcp.json 2>/dev/null
```

**Проверьте threat-db.yaml:**
- [ ] Любой сервер MCP, соответствующий записи CVE? → КРИТИЧЕСКИЙ
- [ ] Привязка версий: все ли серверы MCP привязаны к точным версиям (не `@latest`)? → ВЫСОКИЙ, если не закреплено
- [ ] Есть ли флаги `--dangerous-*` в аргументах MCP? → КРИТИЧЕСКИЙ
- [ ] Какие-либо серверы MCP не включены в безопасный список (см. `guide/security/security-hardening.md` §1.1)? → СРЕДНИЙ (отметка для проверки вручную)

### Этап 3: Аудит навыков и агентов

```bash
# List installed skills
ls -la .claude/skills/ 2>/dev/null
ls -la ~/.claude/skills/ 2>/dev/null

# List agents
ls -la .claude/agents/ 2>/dev/null
ls -la ~/.claude/agents/ 2>/dev/null

# Check agent tools field
grep -r "^tools:" .claude/agents/ 2>/dev/null
grep -r "^tools:" ~/.claude/agents/ 2>/dev/null
```

**Проверьте threat-db.yaml:**
- [ ] Любое имя skill/agent, соответствующее записям `malicious_skills`? → КРИТИЧЕСКИЙ
- [ ] Есть ли автор skill/agent, соответствующий записям `malicious_authors`? → КРИТИЧЕСКИЙ
- [ ] Любой агент только с `tools: Bash`? → ВЫСОКИЙ
- [ ] Какой-нибудь агент со слишком широким доступом к инструментам + расплывчатым описанием? → СРЕДНИЙ

**Глубокий анализ содержания навыков (шаблоны на основе SkillSpector):**

```bash
# Hidden instructions: HTML comments, zero-width chars, large base64 blobs
grep -rn '<!--' .claude/skills/ ~/.claude/skills/ 2>/dev/null | grep -iv 'example\|comment\|html'
grep -rPn '[\x{200B}-\x{200D}\x{FEFF}\x{00AD}]' .claude/skills/ ~/.claude/skills/ 2>/dev/null
grep -rn -E '[A-Za-z0-9+/]{40,}={0,2}' .claude/skills/ ~/.claude/skills/ 2>/dev/null | grep -v 'sha\|hash\|checksum' | head -10

# Unicode deception: RTL override characters
grep -rPn '[\x{202E}\x{202D}\x{200F}]' .claude/skills/ ~/.claude/skills/ 2>/dev/null

# Trigger abuse: generic keywords that shadow built-in commands
grep -rn "trigger\|keyword\|when.*user" .claude/skills/ ~/.claude/skills/ 2>/dev/null | \
  grep -iE '\b(help|run|go|do|yes|ok|the|a |an |it)\b' | head -10

# Supply chain: remote execution patterns in skill scripts
find .claude/skills/ ~/.claude/skills/ \( -name "*.sh" -o -name "*.py" \) 2>/dev/null | \
  xargs grep -l "curl.*|\|wget.*|\|bash.*http\|eval.*curl" 2>/dev/null

# Rogue agent: cron/startup persistence written by skill scripts
find .claude/skills/ ~/.claude/skills/ -type f 2>/dev/null | \
  xargs grep -l "crontab\|launchctl\|systemctl\|~/.bashrc\|~/.zshrc\|autostart" 2>/dev/null

# Data exfiltration: env harvesting combined with network calls
find .claude/skills/ ~/.claude/skills/ -type f 2>/dev/null | \
  xargs grep -l "os.environ\|process.env\|getenv\|printenv" 2>/dev/null | \
  xargs grep -l "curl\|requests\|fetch\|http" 2>/dev/null
```

- [ ] Скрытые комментарии HTML или символы нулевой ширины в файлах навыков? → ВЫСОКИЙ
- [ ] Base64 содержит более 40 символов в содержании навыков? → ВЫСОКИЙ (проверьте: может быть действительным хэшем)
- [ ] RTL символы переопределения Юникода? → ВЫСОКИЙ
- [ ] Ключевое слово триггера навыка затеняет встроенную функцию (помощь, запуск, очистка…)? → ВЫСОКИЙ
- [ ] Исполняемые сценарии с `curl | bash` или удаленной проверкой? → КРИТИЧЕСКИЙ
- [ ] Навык записывает в файлы crontab, launchctl или rc оболочки? → КРИТИЧЕСКИЙ
- [ ] Навык читает переменные окружения И совершает исходящие сетевые вызовы? → КРИТИЧЕСКИЙ

### Этап 4: Безопасность хука

```bash
# List all hooks
find .claude/hooks/ -type f 2>/dev/null
find ~/.claude/hooks/ -type f 2>/dev/null

# Scan hooks for suspicious patterns
grep -rn "curl\|wget\|nc \|ncat\|netcat\|base64\|eval\|exec\|/dev/tcp\|/dev/udp" .claude/hooks/ 2>/dev/null
grep -rn "curl\|wget\|nc \|ncat\|netcat\|base64\|eval\|exec\|/dev/tcp\|/dev/udp" ~/.claude/hooks/ 2>/dev/null

# Check for credential access in hooks
grep -rn "ssh\|id_rsa\|id_ed25519\|\.env\|credentials\|secret\|password\|token\|api.key" .claude/hooks/ 2>/dev/null
grep -rn "ssh\|id_rsa\|id_ed25519\|\.env\|credentials\|secret\|password\|token\|api.key" ~/.claude/hooks/ 2>/dev/null
```

**Проверьте threat-db.yaml `suspicious_patterns.hooks`:**
- [ ] Сетевые вызовы (`curl`, `wget`) → ВЫСОКИЙ
- [ ] Индикаторы обратной оболочки (`nc`, `/dev/tcp`) → КРИТИЧЕСКИЙ
- [ ] Доступ к учетным данным (`ssh`, `.env`, `password`) → КРИТИЧЕСКИЙ
- [ ] Кодировка Base64 → MEDIUM (контекст обзора)

**Архивы и исполняемые файлы Windows внутри каталогов агентов:**

```bash
# FakeGit lures hid SmartLoader ZIPs under .claude/hooks/config/ (Nov 2026)
find .claude .codex .agents .cursor .gemini ~/.claude/skills -type f \
  \( -iname '*.zip' -o -iname '*.7z' -o -iname '*.rar' -o -iname '*.exe' \
     -o -iname '*.dll' -o -iname '*.bat' -o -iname '*.cmd' -o -iname '*.msi' \) 2>/dev/null
```

- [ ] Архив или исполняемый файл Windows внутри каталога агента? → ВЫСОКИЙ (никогда не извлекайте и не запускайте его; сравните его SHA-256 с хэшами FakeGit в `iocs.malware_hashes`)

### Фаза 5: Проверка отравления памяти

```bash
# Check for suspicious instructions in memory/config files
grep -in "ignore\|forget\|override\|disregard\|you are now\|new role\|system prompt" \
  CLAUDE.md .claude/CLAUDE.md SOUL.md .claude/SOUL.md MEMORY.md .claude/MEMORY.md \
  ~/.claude/CLAUDE.md ~/.claude/MEMORY.md 2>/dev/null
```

- [ ] Подскажите схемы внедрения в CLAUDE.md/SOUL.md/MEMORY.md? → ВЫСОКИЙ
- [ ] Инструкции по отключению безопасности, пропуску проверок или предоставлению широких разрешений? → КРИТИЧЕСКИЙ

### Этап 6: Разрешения и настройки

```bash
# Check settings
cat .claude/settings.json 2>/dev/null
cat ~/.claude/settings.json 2>/dev/null
```

- [ ] `permissions.deny` существует и охватывает `.env*`, `*.pem`, `*.key`, секреты? → СРЕДНИЙ, если отсутствует
- [ ] Нет подстановочного знака `permissions.allow` для Bash или Write? → ВЫСОКИЙ, если присутствует
- [ ] Нет `dangerouslySkipPermissions` или подобных флагов? → КРИТИЧЕСКИЙ, если присутствует

### Этап 7: раскрытие секретов в конфигурации

```bash
# Check for secrets in .claude/ directory
grep -rn "sk-[a-zA-Z0-9]\{20,\}\|sk-ant-[a-zA-Z0-9]\{20,\}\|ghp_[a-zA-Z0-9]\{36\}\|AKIA[A-Z0-9]\{16\}" \
  .claude/ ~/.claude/ 2>/dev/null

# Check for private keys
grep -rn "BEGIN.*PRIVATE KEY" .claude/ ~/.claude/ 2>/dev/null
```

- [ ] Ключи или токены API в файлах конфигурации? → КРИТИЧЕСКИЙ
- [ ] Приватные ключи в конфигурации? → КРИТИЧЕСКИЙ

## Выходной формат

```
## 🛡️ Security Check Report

**Date**: [timestamp]
**Scope**: Claude Code configuration

### Results Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | X | [PASS/FAIL] |
| 🟠 HIGH | X | [PASS/FAIL] |
| 🟡 MEDIUM | X | [PASS/FAIL] |
| 🟢 LOW | X | [PASS/FAIL] |

### 🔴 Critical Issues
[List each critical finding with location and fix]

### 🟠 High Issues
[List each high finding with location and fix]

### 🟡 Medium Issues
[List each medium finding with location and fix]

### ✅ Passed Checks
[List what passed, important for confidence]

### 🔧 Recommended Actions (Priority Order)
1. [Most urgent fix with exact command]
2. [Second priority]
3. [...]

### 📚 References
- Full security guide: guide/security/security-hardening.md
- Threat database: examples/commands/resources/threat-db.yaml
- MCP scan: `uvx snyk-agent-scan@latest` (Snyk Agent Scan, formerly mcp-scan)
```

Если ВСЕ проверки пройдены, выведите:

```
## 🛡️ Security Check Report: ALL CLEAR ✅

**Date**: [timestamp]
No known threats detected in your Claude Code configuration.

**Recommendations for continued security:**
- Re-run `/security-check` after installing new skills or MCP servers
- Run `/security-audit` for a comprehensive project + config audit
- Keep Claude Code updated (current security fixes in v2.1.34+)
```

$ARGUMENTS
