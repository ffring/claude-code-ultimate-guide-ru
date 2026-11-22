# Проверьте ошибки кэша (CC#40524)

Проверьте настройку Claude Code на наличие трех ошибок кэша, обнаруженных в марте 2026 года, которые могут незаметно увеличить затраты на API в 10–20 раз.

**Time**: ~20 секунд | **Scope**: версия, файлы конфигурации, CLAUDE.md, навыки, хуки, профили оболочки, все двоичные файлы Claude.

**Ссылка**: `anthropics/claude-code#40524` | **Обнаружено**: `u/skibidi-toaleta-2137` (r/ClaudeAI) + `@whiletrue0x` (GitHub)

---

## Фон

Три независимые ошибки приводят к бесшумному сбою кэша подсказок Claude Code:

- **Ошибка 1** (автономный двоичный файл, версия 2.1.36+, крайний регистр): встроенная замена строк в Anthropicэто обычай Bun/Zig вилка запечена в зигзаге HTTP построитель заголовков на родном слое — невидим JavaScript, срабатывает после `JSON.stringify` но до TLS. На каждом `/v1/messages` запрос, он ищет JSON тело при первом появлении `cch=00000` и заменяет его 5-символьным хешем тела. Только при обычном использовании `system[0]` затронут (который имеет `cache_control: null`), поэтому никакого влияния на кеш нет. Это ломает кеш только в том случае, если `cch=00000` просачивается в `messages[]` - из CLAUDE.md обсуждение механизма, инструмента, читающего исходный код пакета CC, или пользователя, вводящего его буквально. Проверено 62 стенограммы реальных проектов: отсутствие случайных утечек при нормальном использовании.
- **Bug 2** (v2.1.69+): вложение `deferred_tools_delta`, представленное в версии 2.1.69, приводит к тому, что `messages[0]` различается между новыми и возобновленными сеансами, независимо нарушая сопоставление префиксов кэша для каждого `--resume` или `--continue`. Подтверждено, что он все еще присутствует в версии 2.1.88.
- **Ошибка 3** (v2.1.69+, самое широкое влияние): `cli.js` вставляет `x-anthropic-billing-header` в качестве первого блока системных подсказок, содержащего хеш для каждого разговора (3-символьный SHA-256 первого сообщения пользователя + версия), который изменяется при каждом новом сеансе и каждом вызове субагента. Это приводит к тому, что в системном приглашении отображается полный `cache_creation` (~ 12 000 токенов) вместо `cache_read` при каждом запуске сеанса и вызове агента. A/B протестировал: коэффициент попадания в кеш увеличился с 48% до 99,98% с исправлением env var.

Статус: частичное исправление добавлено в версии 2.1.88 (байты схемы инструмента). Ошибки 2 и 3 все еще активны, начиная с версии 2.1.88.

---

## Инструкции

Вы аудитор. Выполните все этапы по порядку, соберите все результаты и подготовьте окончательный отчет. Не пропускайте фазы и не останавливайтесь раньше времени.

---

### Этап 1 — версия Claude Code и способ установки

```bash
# Version check
claude --version

# All installed claude binaries
which -a claude 2>/dev/null

# Check if active binary is standalone or npm
file $(which claude) 2>/dev/null
ls -la $(which claude) 2>/dev/null
```

- Версия >= 2.1.36 И автономный двоичный файл → флаг **BUG 1 МЕХАНИЗМ ПРИСУТСТВУЕТ** (крайний случай, срабатывает только в том случае, если дозорный в сообщениях)
- Версия >= 2.1.69 → флаг **BUG 2 RISK** и **BUG 3 RISK**
- Двоичный файл — это исполняемый файл Mach-O / ELF → автономный → **Присутствует механизм ошибки 1**
- Двоичный файл является символической ссылкой на `node_modules` или содержит `cli.js` → npm/npx → **Ошибка 1 не применяется**

---

### Этап 2. Дозорное сканирование (ошибка 1)

Найдите буквальную строку `cch=` во всех статических файлах конфигурации. Исключите файлы `.jsonl` (временная история разговоров) и сам этот командный файл.

```bash
# Global config files
grep -r "cch=" \
  ~/.claude/CLAUDE.md \
  ~/.claude/MEMORY.md \
  ~/.claude/TONE.md \
  ~/.claude/FLAGS.md \
  ~/.claude/RULES.md \
  ~/.claude/RTK.md \
  ~/.claude/ANTI_AI.md \
  2>/dev/null

# Global skills, commands, agents, hooks (excluding this command file)
grep -rl "cch=" ~/.claude/skills/ 2>/dev/null
grep -rl "cch=" ~/.claude/commands/ --exclude="check-cache-bugs.md" 2>/dev/null
grep -rl "cch=" ~/.claude/agents/ 2>/dev/null
grep -rl "cch=" ~/.claude/hooks/ 2>/dev/null

# Project-level config
grep -r "cch=" CLAUDE.md .claude/CLAUDE.md .claude/MEMORY.md 2>/dev/null
grep -rl "cch=" .claude/skills/ 2>/dev/null
grep -rl "cch=" .claude/commands/ --exclude="check-cache-bugs.md" 2>/dev/null
grep -rl "cch=" .claude/agents/ 2>/dev/null
grep -rl "cch=" .claude/hooks/ 2>/dev/null

# Broader scan: all CLAUDE.md files across projects
find ~ -name "CLAUDE.md" \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  2>/dev/null | xargs grep -l "cch=" 2>/dev/null
```

Отметьте как **BUG 1 RISK**, если какое-либо совпадение обнаружено за пределами файлов `.jsonl`.

---

### Этап 3 — использование Resume/continue (ошибка 2)

```bash
# settings.json
grep -i -- "--resume\|--continue" ~/.claude/settings.json 2>/dev/null
grep -i -- "--resume\|--continue" .claude/settings.json 2>/dev/null

# Hooks
grep -rn -- "--resume\|--continue" ~/.claude/hooks/ 2>/dev/null
grep -rn -- "--resume\|--continue" .claude/hooks/ 2>/dev/null

# Commands and skills
grep -rn -- "--resume\|--continue" ~/.claude/commands/ 2>/dev/null
grep -rn -- "--resume\|--continue" .claude/commands/ 2>/dev/null

# Shell profiles (aliases, functions)
grep -n -- "--resume\|--continue" ~/.zshrc ~/.bashrc ~/.bash_profile ~/.zprofile 2>/dev/null

# Project scripts
find . -name "*.sh" -o -name "Makefile" 2>/dev/null | \
  xargs grep -l -- "--resume\|--continue" 2>/dev/null
```

- Любое попадание в hooks/settings → флаг **BUG 2 AUTOMATED** (постоянная экспозиция)
- Любое попадание в commands/skills/scripts → флаг **BUG 2 MANUAL** (воздействие при вызове)

---

### Этап 4. Проверка заголовка атрибуции (ошибка 3)

Проверьте, отключена ли уже переменная env заголовка биллинга.

```bash
# Global settings
grep -i "CLAUDE_CODE_ATTRIBUTION_HEADER\|ENABLE_TOOL_SEARCH" \
  ~/.claude/settings.json 2>/dev/null

# Project settings
grep -i "CLAUDE_CODE_ATTRIBUTION_HEADER\|ENABLE_TOOL_SEARCH" \
  .claude/settings.json 2>/dev/null

# Shell profiles
grep -i "CLAUDE_CODE_ATTRIBUTION_HEADER" \
  ~/.zshrc ~/.bashrc ~/.bash_profile ~/.zprofile 2>/dev/null
```

- Для `CLAUDE_CODE_ATTRIBUTION_HEADER` не установлено значение `false` И версия >= 2.1.69 → флаг **BUG 3 ACTIVE**
- Уже установлено `false` → **BUG 3 MITIGATED**

---

### Этап 5 — Проверка нескольких двоичных файлов

```bash
for b in $(which -a claude 2>/dev/null | sort -u); do
  echo "=== $b ==="
  $b --version 2>/dev/null || echo "unavailable"
  file $b 2>/dev/null
  ls -la $b 2>/dev/null
done
```

Отметьте любой отдельный двоичный файл >= 2.1.69 как подверженный риску всех трех ошибок.
Обратите внимание на устаревшие двоичные файлы npm, которые могут быть вызваны по ошибке.

---

## Выходной формат

```
## Claude Code Cache Bug Audit — CC#40524

**Date**: [today]
**Active claude version**: [version]
**Install method**: [standalone binary | npm/npx | mixed]

---

### Bug 1 — Sentinel replacement (standalone binary v2.1.36+, edge case)
**Status**: [SAFE / AT RISK / NOT APPLICABLE]

**Mechanism active (standalone binary >= v2.1.36)**: [YES / NO]
**Trigger sentinel found in static config**: [YES — locations | NO]

[If AT RISK] `cch=00000` found in static config files:
- [file path]: [matching line]
→ Fix: remove the `cch=00000` string from those files.
→ Temporary workaround: `npx @anthropic-ai/claude-code` (npm package uses standard Bun, no replacement).
→ Note: sentinel in `.jsonl` conversation history is normal and harmless — only static config matters.

[If SAFE] Mechanism present in binary but no trigger in static config. Normal usage unaffected.
[If NOT APPLICABLE] npm/npx install — Bug 1 mechanism absent at the binary level.

---

### Bug 2 — Cache prefix mismatch on --resume / --continue (v2.1.69+)
**Status**: [SAFE / AT RISK (automated) / AT RISK (manual) / NOT APPLICABLE]

**Version in affected range (>= 2.1.69)**: [YES / NO]
**Automated usage (hooks/settings)**: [YES — locations | NO]
**Manual usage (commands/skills/scripts)**: [YES — locations | NO]

**Root cause**: `deferred_tools_delta` attachment introduced in v2.1.69 causes `messages[0]` to differ between fresh and resumed sessions, breaking cache prefix matching independently of Bug 1.

[If AT RISK]
→ Avoid `--resume` and `--continue` until fix ships.
→ Downgrade workaround: `npm install -g @anthropic-ai/claude-code@2.1.68` (last version before regression)

[If NOT APPLICABLE] Version < 2.1.69 — not affected.

---

### Bug 3 — Attribution header per-session hash (widest impact)
**Status**: [ACTIVE / MITIGATED / NOT APPLICABLE]

**Version in affected range (>= 2.1.69)**: [YES / NO]
**CLAUDE_CODE_ATTRIBUTION_HEADER=false already set**: [YES / NO]

[If ACTIVE] Every session start and every subagent call misses the system prompt cache (~12K tokens rebuilt at cache_creation rate).
→ Fix: add to ~/.claude/settings.json:
  {
    "env": {
      "CLAUDE_CODE_ATTRIBUTION_HEADER": "false",
      "ENABLE_TOOL_SEARCH": "false"
    }
  }
→ Expected impact: cache hit ratio 48% → ~99.98% (measured, source: @whiletrue0x CC#40524)

[If MITIGATED] Header already disabled. No action needed.
[If NOT APPLICABLE] Version < 2.1.69 — not affected.

---

### Multiple binaries
[List each binary found, version, type (standalone/npm), and per-bug status]

---

### Summary

| Bug | Impact | Status | Action |
|-----|--------|--------|--------|
| Bug 1 — sentinel in config | Edge case | [SAFE / AT RISK / N/A] | [action or "none"] |
| Bug 2 — --resume/--continue | Per-resume cache miss | [SAFE / AT RISK / N/A] | [action or "none"] |
| Bug 3 — attribution header | Every session + subagent | [ACTIVE / MITIGATED / N/A] | [action or "none"] |
| Stale binaries | — | [CLEAN / PRESENT] | [remove or none] |

[If Bug 3 ACTIVE — always show this]
⚡ Quick win: add CLAUDE_CODE_ATTRIBUTION_HEADER=false to settings.json — immediate effect, no restart needed.

[If all SAFE/MITIGATED/N/A]
✅ No active exposure. Re-run after updating Claude Code.

⚠️ Track fixes: github.com/anthropics/claude-code/issues/40524
```
