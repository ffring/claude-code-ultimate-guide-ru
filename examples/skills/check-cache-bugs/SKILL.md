---
name: check-cache-bugs
description: "Аудит настройки Claude Code на наличие ошибок кэша (CC#40524): Sentinel, --resume/--continue, заголовок атрибуции + ArkNill B3/B4/B5"
effort: low
disable-model-invocation: true
---

# Проверьте ошибки кэша (CC#40524)

Проверьте настройку Claude Code на наличие ошибок кэша и затрат, обнаруженных в марте–апреле 2026 года.

**Time**: ~30 секунд | **Scope**: версия, файлы конфигурации, CLAUDE.md, навыки, хуки, профили оболочки, все двоичные файлы Claude.

> **Примечание о загрязнении кэша.**: этот навык загружает содержимое, содержащее строки `cch=`, в массив сообщений текущего сеанса. Для получения наиболее чистых результатов запустите эту команду в самом начале нового сеанса или через `claude -p "$(cat .claude/commands/check-cache-bugs.md)"` в качестве однократного вызова режима печати.

**Ссылка**: `anthropics/claude-code#40524` | **Обнаружено**: `@jmarianski` + `@whiletrue0x` | **Расширено**: `@ArkNill` (ArkNill/claude-code-cache-analysis, апрель 2026 г.)

---

## Фон

### Статус исправления (текущий по состоянию на версию 2.1.92)

| Ошибка | Затронутые версии | Статус |
|-----|------------------|--------|
| Ошибка 1: cch Sentinel (автономный двоичный файл) | v2.1.36-v2.1.90 | **ИСПРАВЛЕНО в версии 2.1.91** |
| Ошибка 2: deferred_tools_delta в --resume | v2.1.69-v2.1.89 | **ИСПРАВЛЕНО в версии 2.1.90** |
| Ошибка 3: хеш заголовка атрибуции для каждого сеанса. | v2.1.69+ | **Active** (обходной путь env var) |
| B4: Микрокомпактное/бесшумное удаление контекста | все версии до v2.1.92 | **Active** (контролируется GrowthBook) |
| B5: Ограничение бюджета на результат инструмента — 200 тыс. | все версии до v2.1.92 | **Active** (инструменты MCP исключены) |

### Исходные три ошибки (CC#40524)

- **Ошибка 1** (ИСПРАВЛЕНО v2.1.91): собственный слой HTTP Bun выполнял замену байтов той же длины
  Заполнитель аттестации `cch=00000` после `JSON.stringify`, но перед TLS. Срабатывает только если
  `cch=00000` появился буквально в контенте `messages[]`. Подтверждено закрыто; npm и автономный
  двоичные файлы теперь эквивалентны версии 2.1.91+.

- **Ошибка 2** (ИСПРАВЛЕНО v2.1.90): модуль записи JSONL сеанса удалил вложение `deferred_tools_delta`.
  записи перед записью на диск. На `--resume` эти записи отсутствовали; отложенные инструменты
  слой не имел предыдущей истории и повторно анонсировал все инструменты с нуля, меняя каждое сообщение
  позиции и полностью нарушить префикс кэша уровня сообщений. Каждое резюме перестроено 87-118К
  токены как `cache_creation`. Anthropic отслеживался внутри как inc-4747.

- **Ошибка 3** (ACTIVE, v2.1.69+): Claude Code вставляет заголовок биллинга в качестве первого блока
  системное приглашение. Заголовок содержит трехсимвольный хэш SHA-256, полученный из символов [4, 7, 20].
  первого сообщения пользователя + версия CC, уникальная для каждого сеанса, для каждого субагента, для каждого побочного запроса. С
  кэш основан на префиксах, это приводит к «холодному» пропуску ~ 12 тыс. токенов системного приглашения на каждом
  призыв. Сеанс с 5 субагентами = 6 холодных промахов. Эмпирические данные: попадание в кеш 48% -> 99,98%
  обходное решение env var.

### Дополнительные ошибки (ArkNill, апрель 2026 г.)

- **B4: Microcompact** (все версии): три механизма незаметно заменяют результаты инструмента на
  `[Old tool result content cleared]` перед отправкой на API. Контролируется на стороне сервера
  Флаги GrowthBook обходят `DISABLE_AUTO_COMPACT`. Команда `/export` показывает исходный
  контекст, а НЕ то, что получила модель. За одну сессию измерено 327 клиринговых событий.

- **B5: ограничение бюджета результатов инструмента.** (все версии): `applyToolResultBudget()` усекает результаты инструмента.
  когда совокупное количество символов превышает 200 КБ. Затрагиваются встроенные инструменты (Read, Bash, Grep, Glob, Edit).
  Инструменты MCP могут переопределяться через `_meta["anthropic/maxResultSizeChars"]` (v2.1.91+).

Краткое описание влияния на стоимость: 2–5 раз за сеанс start/subagent для изолированной ошибки 3; 10-20 раз за ход для
Ошибка 2 с 10+ навыками и 3-4 резюме (обе оценки верны в соответствующем контексте).

---

## Инструкции

Вы аудитор. Выполните все этапы по порядку, соберите все результаты и подготовьте окончательный отчет. Не пропускайте фазы и не останавливайтесь раньше времени.

---

### Этап 1: версия Claude Code и метод установки

```bash
# Version check
claude --version

# All installed claude binaries
which -a claude 2>/dev/null

# Check if active binary is standalone or npm
file $(which claude) 2>/dev/null
ls -la $(which claude) 2>/dev/null
```

- Версия < 2.1.90 -> флаг **BUG 2 RISK** (resume/DTD; исправлено в версии 2.1.90)
- Версия < 2.1.91 И автономный двоичный файл -> флаг **BUG 1 MECHANISM** (дозорный; исправлено в версии 2.1.91)
- Версия >= 2.1.69 -> флаг **BUG 3 RISK** (заголовок атрибуции; исправлений пока нет, проверьте этап 4)
- Двоичный файл — это исполняемый файл Mach-O/ELF -> автономный (актуально для ошибки 1 в версиях 2.1.36-v2.1.90).
- Двоичный файл является символической ссылкой на `node_modules` или содержит `cli.js` -> npm/npx.

---

### Этап 2: Дозорное сканирование (ошибка 1)

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

Отметьте как **BUG 1 RISK**, если обнаружено какое-либо совпадение за пределами файлов `.jsonl` И версия < v2.1.91.
В версии 2.1.91+: механизм дозорного исправлен, риска нет, независимо от содержимого конфигурации.

---

### Этап 3: использование Resume/continue (ошибка 2)

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

- Версия >= v2.1.90: Ошибка 2 – **FIXED**, пометка помечена только как информационная (нет активного риска затрат)
- Версия < v2.1.90 И любое попадание в hooks/settings -> флаг **BUG 2 AUTOMATED** (постоянная экспозиция)
- Версия < v2.1.90 И любое попадание в commands/skills/scripts -> флаг **BUG 2 MANUAL** (воздействие при вызове)

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

- Для `CLAUDE_CODE_ATTRIBUTION_HEADER` не установлено значение `false` И версия >= 2.1.69 -> флаг **BUG 3 ACTIVE**
- Уже установлено `false` -> **BUG 3 MITIGATED**

---

### Этап 5: проверка нескольких двоичных файлов

```bash
for b in $(which -a claude 2>/dev/null | sort -u); do
  echo "=== $b ==="
  $b --version 2>/dev/null || echo "unavailable"
  file $b 2>/dev/null
  ls -la $b 2>/dev/null
done
```

Отметьте любой автономный двоичный файл <v2.1.91 как подверженный риску ошибки 1.
Отметьте любой двоичный файл < v2.1.90 как подверженный риску ошибки 2.
Пометить любой двоичный файл >= v2.1.69 как подверженный риску ошибки 3 (если только переменная env заголовка атрибута еще не установлена).
Обратите внимание на устаревшие двоичные файлы, которые могут быть вызваны по ошибке.

---

## Выходной формат

```
## Claude Code Cache Bug Audit: CC#40524

**Date**: [today]
**Active claude version**: [version]
**Install method**: [standalone binary | npm/npx | mixed]

---

### Bug 1: Sentinel replacement (standalone binary v2.1.36-v2.1.90)
**Status**: [FIXED (v2.1.91+) / SAFE / AT RISK / NOT APPLICABLE]

**Version >= v2.1.91**: [YES -> FIXED | NO -> check below]
**Mechanism active (standalone binary, v2.1.36-v2.1.90)**: [YES / NO]
**Trigger sentinel found in static config**: [YES (locations) | NO]

[If FIXED] Running v2.1.91+. Sentinel mechanism patched; npm and standalone are equivalent. No action needed.
[If AT RISK (v < 2.1.91 AND standalone AND sentinel found)]
-> Update to v2.1.91+: `npm install -g @anthropic-ai/claude-code@latest`
-> Temporary: remove `cch=00000` string from the flagged files, or use npm instead.
[If SAFE] Mechanism present in binary but no trigger in static config. Update to v2.1.91 still recommended.
[If NOT APPLICABLE] npm/npx install: Bug 1 mechanism absent.

---

### Bug 2: Cache prefix mismatch on --resume / --continue (v2.1.69-v2.1.89)
**Status**: [FIXED (v2.1.90+) / AT RISK (automated) / AT RISK (manual) / NOT APPLICABLE]

**Version >= v2.1.90**: [YES -> FIXED | NO -> check below]
**Automated usage found (hooks/settings)**: [YES (locations) | NO]
**Manual usage found (commands/skills/scripts)**: [YES (locations) | NO]

**Root cause**: JSONL writer stripped `deferred_tools_delta` records before writing to disk. On `--resume`,
the deferred tools layer had no announcement history and re-announced all tools from scratch, shifting every
message position and breaking messages-level cache prefix. Each resume rebuilt 87-118K tokens as cache_creation.
Anthropic tracked as inc-4747. Fixed in v2.1.90.

[If FIXED] Running v2.1.90+. Bug resolved. `--resume` usage found in config is now safe at the cache level.
[If AT RISK]
-> Update to v2.1.90+: `npm install -g @anthropic-ai/claude-code@latest`
-> Immediate: avoid `--resume` and `--continue` until updated.
[If NOT APPLICABLE] Version < 2.1.69: not affected.

---

### Bug 3: Attribution header per-session hash (v2.1.69+, no fix yet)
**Status**: [ACTIVE / MITIGATED / NOT APPLICABLE]

**Version in affected range (>= v2.1.69)**: [YES / NO]
**CLAUDE_CODE_ATTRIBUTION_HEADER set to false/0/no/off**: [YES -> MITIGATED | NO -> ACTIVE]

[If ACTIVE] Every session start and every subagent call misses the system prompt cache (~12K tokens
rebuilt at cache_creation rate). A session with 5 subagents = 6 cold misses.
-> Fix (immediate, no restart needed): add to ~/.claude/settings.json:
  {
    "env": {
      "CLAUDE_CODE_ATTRIBUTION_HEADER": "false"
    }
  }
-> Expected impact: cache hit ratio 48% -> ~99.98% (measured, source: @whiletrue0x CC#40524)

[If MITIGATED] Header already disabled. No action needed.
[If NOT APPLICABLE] Version < 2.1.69: not affected.

---

### B4/B5: Context mutation (informational, all versions)

These bugs are controlled by server-side GrowthBook flags and cannot be mitigated client-side.
No config check is possible; report as informational.

**B4: Microcompact**: Three mechanisms silently replace tool results with `[Old tool result content cleared]`
before sending to the API. The `/export` command shows original context, NOT what the model received.
Workaround: start fresh sessions periodically to reset the tool result pool.

**B5: Tool result budget cap (200K chars aggregate)**: Built-in tools (Read, Bash, Grep, Glob, Edit)
hit a 200K character cap on aggregate tool results per session. Results are truncated beyond this threshold.
MCP tools can partially override via `_meta["anthropic/maxResultSizeChars"]` (v2.1.91+, up to 500K).

---

### Multiple binaries
[List each binary found, version, type (standalone/npm), and per-bug status]

---

### Summary

| Bug | Versions | Status | Action |
|-----|----------|--------|--------|
| Bug 1: sentinel (standalone) | v2.1.36-v2.1.90 | [FIXED / SAFE / AT RISK / N/A] | [update to v2.1.91+ or "none"] |
| Bug 2: --resume/--continue | v2.1.69-v2.1.89 | [FIXED / AT RISK / N/A] | [update to v2.1.90+ or "none"] |
| Bug 3: attribution header | v2.1.69+ | [ACTIVE / MITIGATED / N/A] | [add env var or "none"] |
| B4: microcompact | all versions | INFORMATIONAL | start fresh sessions |
| B5: tool result budget 200K | all versions | INFORMATIONAL | use MCP tools for large reads |
| Stale binaries | -- | [CLEAN / PRESENT] | [remove or none] |

[If Bug 3 ACTIVE (always show this)]
Quick win: add CLAUDE_CODE_ATTRIBUTION_HEADER=false to settings.json, immediate effect, no restart needed.

[If all SAFE/MITIGATED/FIXED/N/A on Bugs 1-3]
No active cache exposure on the original CC#40524 bugs. B4/B5 are informational, monitor session length.

Track: github.com/anthropics/claude-code/issues/40524 | github.com/ArkNill/claude-code-cache-analysis
```
