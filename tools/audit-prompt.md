# Проведите аудит настройки Claude Code

> Автономная подсказка, которая проверяет вашу конфигурацию Claude Code — память проекта, гигиену правил, навыки, agents/commands, безопасность, MCP, команды рабочего процесса и актуальность — за один проход.

**Автор**: [Флориан БРУНИО](https://github.com/FlorianBruniaux) | Внешний директор по ИИ

**Ссылка**: [Полное руководство по Claude Code](https://github.com/FlorianBruniaux/claude-code-ultimate-guide/blob/main/guide/ultimate-guide.md)

---

## 1. Что это делает

Эта подсказка превращает Claude в оркестратор **audit** по 8 взвешенным измерениям (всего 100 баллов). Он запускает быструю инвентаризацию bash, затем делегирует каждый домен специализированному навыку или команде, если таковая установлена, а в противном случае возвращается к встроенным проверкам.

| Что он проверяет | Как |
|---|---|
| Память и контекст (CLAUDE.md, правила, бюджет токена) | Делегирует `/token-audit`, если установлен, в противном случае оценка bash |
| Правила гигиены (срок действия `.claude/rules/`, `paths:`) | Делегирует `/eval-rules`, если он установлен, в противном случае сканирование bash. |
| Качество навыков (главная тема, усилия, разрешенные инструменты) | Делегирует `/eval-skills`, если он установлен, в противном случае быстрая проверка. |
| Agents/Commands Качество (16 критериев, оценки A–F) | Делегирует `/audit-agents-skills`, если установлен, в противном случае проверьте |
| Положение безопасности (разрешения, хуки, песочница) | Делегирует `/security-check`, если он установлен, в противном случае проверка bash. |
| MCP Экосистема (серверы, риск БД, безопасность версий) | Встроенный bash (специальных навыков не требуется) |
| Команды рабочего процесса (/investigate, /qa, /canary…) | Встроенное сканирование bash |
| Свежесть и лучшие практики (устаревшие ссылки, ошибки кеша) | Встроенный bash + проверка шаблонов |

**Чего это НЕ делает**: заменяет инструменты глубокого погружения, которым он делегирует. Используйте `/security-audit`, `/token-audit`, `/eval-rules` напрямую, если вам нужна полная информация по определенному измерению.

**Time**: ~5–8 минут, если установлены все навыки аудита, ~3–4 минуты в резервном режиме.

**Важно**: Claude НЕ будет вносить никаких изменений без вашего явного согласия.

---

## 2. Для кого это

| Уровень | Что вы получите |
|-------|-----------------|
| **Начинающий** | Узнайте, чего вам не хватает, и получите начальные шаблоны |
| **Средний** | Определить возможности оптимизации и расширенные шаблоны |
| **Опытный пользователь** | Проверьте правильность настройки и найдите крайние случаи, требующие доработки. |

**Prerequisites**:
- Claude Code установлен и работает.
- Каталог проекта для анализа (или просто глобальная конфигурация)
- Оболочка Bash (родная для macOS/Linux, WSL для Windows)

**Дополнительно** (более подробные результаты): установлены `/token-audit`, `/eval-rules`, `/eval-skills`, `/audit-agents-skills`, `/security-check`. См. раздел 8 для команд установки.

---

## 3. Как его использовать

### Шаг 1. Скопируйте приглашение

Скопируйте все внутри блока кода в [Раздел 4](#4-the-prompt) ниже.

### Шаг 2. Запустите Claude Code.

```bash
cd your-project-directory
claude
```

### Шаг 3. Вставьте и выполните.

Вставьте приглашение и нажмите Enter. Чтобы также проверить глобальную конфигурацию `~/.claude/`, добавьте `--include-global` после вставки.

### Шаг 4. Просмотрите результаты

Claude представляет 8-мерную систему показателей и запрашивает проверку перед внесением каких-либо изменений.

### Примечание платформы

| Платформа | Глобальный путь конфигурации |
|----------|-------------------|
| **macOS/Linux** | `~/.claude/` |
| **Windows** | `%USERPROFILE%\.claude\` |

---

## <a name="4-the-prompt"></a>4. Подсказка

````markdown
# Audit My Claude Code Setup — v5.0

## Scope Detection

Check if the user appended `--include-global` to this prompt.
- **Default (project only)**: audit `.` + `.claude/` in the current directory.
- **With `--include-global`**: also audit `~/.claude/` and `~/.claude.json`.

Set SCOPE accordingly. All bash blocks below note which paths apply per scope.

## Instructions

Do NOT modify any files. Do NOT make any changes. Audit and report only.

Use efficient bash commands for discovery. Only read file content when needed for scoring.

---

## Phase 1 — Inventory (30 seconds, bash-only)

Run this single block to gather all structural data at once:

```bash
bash -c '
echo "=== SCOPE ==="
SCOPE="project"
[[ "$*" == *"--include-global"* ]] && SCOPE="project+global"
echo "Audit scope: $SCOPE"
CURRENT_DIR=$(pwd)

echo ""
echo "=== CONFIG FILES ==="
# Project
for f in ./CLAUDE.md ./.claude/CLAUDE.md ./.claude/settings.json ./.claude/settings.local.json; do
  [ -f "$f" ] && echo "✅ $f" || echo "❌ $f"
done
# Global (always check for context, even in project-only scope)
[ -f ~/.claude/CLAUDE.md ] && echo "✅ ~/.claude/CLAUDE.md (global)" || echo "❌ ~/.claude/CLAUDE.md (global)"
[ -f ~/.claude.json ] && echo "✅ ~/.claude.json (MCP config)" || echo "❌ ~/.claude.json"

echo ""
echo "=== FOLDER STRUCTURE ==="
for d in agents commands skills hooks rules styles; do
  if [ -d "./.claude/$d" ]; then
    count=$(find "./.claude/$d" -maxdepth 2 -type f | wc -l | tr -d " ")
    echo "✅ .claude/$d/ ($count files)"
  else
    echo "❌ .claude/$d/"
  fi
done

echo ""
echo "=== TECH STACK ==="
[ -f package.json ] && grep -o '"name": *"[^"]*"' package.json | head -1 | sed "s/\"name\": /nodejs: /"
[ -f pyproject.toml ] && grep "^name" pyproject.toml | head -1 | sed "s/name/python:/"
[ -f requirements.txt ] && echo "python: requirements.txt"
[ -f go.mod ] && head -1 go.mod | sed "s/module /go: /"
[ -f Cargo.toml ] && grep "^name" Cargo.toml | head -1 | sed "s/name/rust:/"
[ -f composer.json ] && echo "php: detected"
[ -f Gemfile ] && echo "ruby: detected"

echo ""
echo "=== MCP SERVERS ==="
if command -v jq &>/dev/null && [ -f ~/.claude.json ]; then
  MCP=$(jq -r --arg p "$CURRENT_DIR" '.projects[$p].mcpServers // {} | keys[]' ~/.claude.json 2>/dev/null)
  [ -n "$MCP" ] && echo "$MCP" | sed "s/^/  /" || echo "  (none for this project)"
  DB_MCP=$(echo "$MCP" | grep -iE "postgres|neon|supabase|mysql|database" || true)
  [ -n "$DB_MCP" ] && echo "  ⚠️  DB MCPs detected: $DB_MCP (verify not production)"
else
  echo "  (jq not installed or ~/.claude.json absent)"
fi

echo ""
echo "=== RULES INVENTORY ==="
RULES_DIR="./.claude/rules"
if [ -d "$RULES_DIR" ]; then
  count=$(find "$RULES_DIR" -name "*.md" | wc -l | tr -d " ")
  size=$(find "$RULES_DIR" -name "*.md" | xargs wc -c 2>/dev/null | tail -1 | awk "{print \$1}")
  echo "  $count rules files, ~$size total chars"
  echo "  Top 3 by size:"
  find "$RULES_DIR" -name "*.md" | xargs wc -c 2>/dev/null | sort -rn | head -4 | grep -v "total" | awk "{print \"    \" \$0}"
  with_paths=$(grep -rl "^paths:" "$RULES_DIR"/*.md 2>/dev/null | wc -l | tr -d " ")
  always_on=$(( count - with_paths ))
  echo "  path-scoped: $with_paths | always-on: $always_on"
else
  echo "  No .claude/rules/ directory"
fi

echo ""
echo "=== AUDIT SKILLS AVAILABLE ==="
for skill in token-audit eval-rules eval-skills audit-agents-skills; do
  found=false
  [ -f "$HOME/.claude/skills/$skill/SKILL.md" ] && found=true
  [ -f ".claude/skills/$skill/SKILL.md" ] && found=true
  $found && echo "  ✅ /$skill" || echo "  ❌ /$skill (fallback mode)"
done
for cmd in security-check security-audit; do
  found=false
  [ -f "$HOME/.claude/commands/$cmd.md" ] && found=true
  [ -f ".claude/commands/$cmd.md" ] && found=true
  [ -f "$HOME/.claude/skills/$cmd/SKILL.md" ] && found=true
  [ -f ".claude/skills/$cmd/SKILL.md" ] && found=true
  $found && echo "  ✅ /$cmd" || echo "  ❌ /$cmd (fallback mode)"
done

echo ""
echo "=== CACHE BUG INDICATORS ==="
grep -rl "disableSkillShellExecution\|--resume" .claude/ ~/.claude/ 2>/dev/null | head -3 | sed "s/^/  /" || echo "  No cache bug workarounds found"
' "$@"
```

Store this full output. Use it for all dimension scoring below.

---

## Phase 2 — Dimension Audit

Score each dimension. For dimensions with a delegated skill, check if that skill is available (per Phase 1 output). If ✅: invoke the skill and use its output for scoring. If ❌: run the inline fallback bash and apply the simplified heuristic.

### Dimension 1 — Memory & Context (20 pts)

**Full audit** (if `/token-audit` is available):
Invoke: `/token-audit`
Use the Token Audit output:
- Fixed context <20K tokens → 18-20 pts
- 20-40K tokens → 12-17 pts
- 40-60K tokens → 6-11 pts
- >60K tokens → 0-5 pts. Deduct 2 pts if CLAUDE.md is missing, 3 pts if global CLAUDE.md is missing.

**Fallback** (if `/token-audit` is not installed):

```bash
GLOBAL=$(cat ~/.claude/CLAUDE.md ~/.claude/*.md 2>/dev/null | wc -c || echo 0)
PROJECT=$(wc -c < CLAUDE.md 2>/dev/null || echo 0)
RULES=$(find .claude/rules -name "*.md" 2>/dev/null | xargs cat 2>/dev/null | wc -c || echo 0)
TOTAL=$(( (GLOBAL + PROJECT + RULES) / 4 + 7500 ))
echo "Estimated fixed context: ~$TOTAL tokens (~$(( TOTAL * 100 / 200000 ))% of 200K window)"
```

Fallback scoring (max 14 pts):
- Global CLAUDE.md exists and non-empty: 3 pts
- Project CLAUDE.md exists: 3 pts
- Rules count reasonable (<15 files): 2 pts
- Token estimate <20K: 6 pts | 20-40K: 3 pts | >40K: 0 pts

### Dimension 2 — Rules Hygiene (10 pts)

**Full audit** (if `/eval-rules` is available):
Invoke: `/eval-rules`
Take the average score across all rules files (12 pts each). Map to 10 pts proportionally.

**Fallback** (if `/eval-rules` is not installed):

```bash
RULES_DIR=".claude/rules"
[ -d "$RULES_DIR" ] || { echo "No rules dir"; exit 0; }
total=$(find "$RULES_DIR" -name "*.md" | wc -l | tr -d " ")
with_front=$(grep -rl "^---" "$RULES_DIR"/*.md 2>/dev/null | wc -l | tr -d " ")
with_paths=$(grep -rl "^paths:" "$RULES_DIR"/*.md 2>/dev/null | wc -l | tr -d " ")
valid_patterns=0
for f in "$RULES_DIR"/*.md; do
  pattern=$(grep -A1 "^paths:" "$f" 2>/dev/null | grep "^\s*-" | head -1 | sed "s/.*- //;s/['\"]//g")
  [ -n "$pattern" ] && ls $pattern 2>/dev/null | head -1 | grep -q . && valid_patterns=$(( valid_patterns + 1 ))
done
echo "Total: $total | With frontmatter: $with_front | With paths: $with_paths | Valid patterns: $valid_patterns"
```

Fallback scoring (max 8 pts):
- Rules directory exists: 1 pt
- All files have YAML frontmatter: 2 pts
- At least half have `paths:` field: 3 pts
- No file >150 lines (check with `wc -l`): 2 pts

### Dimension 3 — Skills Quality (10 pts)

**Full audit** (if `/eval-skills` is available):
Invoke: `/eval-skills`
Take the average score across all skill files (14 pts each). Map to 10 pts proportionally.

**Fallback** (if `/eval-skills` is not installed):

```bash
SKILLS_DIR=".claude/skills"
[ -d "$SKILLS_DIR" ] || { echo "No skills dir (0 pts)"; exit 0; }
total=$(find "$SKILLS_DIR" -name "SKILL.md" | wc -l | tr -d " ")
with_effort=$(grep -rl "^effort:" "$SKILLS_DIR"/*/SKILL.md 2>/dev/null | wc -l | tr -d " ")
with_tools=$(grep -rl "^allowed-tools:" "$SKILLS_DIR"/*/SKILL.md 2>/dev/null | wc -l | tr -d " ")
with_desc=$(grep -rl "^description:" "$SKILLS_DIR"/*/SKILL.md 2>/dev/null | wc -l | tr -d " ")
echo "Skills: $total | effort field: $with_effort | allowed-tools: $with_tools | description: $with_desc"
```

Fallback scoring (max 8 pts):
- Skills directory exists: 1 pt
- All SKILL.md have `description:` field: 2 pts
- All SKILL.md have `effort:` field: 3 pts
- All SKILL.md have `allowed-tools:` field: 2 pts

### Dimension 4 — Agents/Commands Quality (10 pts)

**Full audit** (if `/audit-agents-skills` is available):
Invoke: `/audit-agents-skills`
Take the overall score from its report (score/100). Multiply by 0.10 to get pts on 10.

**Fallback** (if `/audit-agents-skills` is not installed):

```bash
agents=$(find .claude/agents -name "*.md" 2>/dev/null | wc -l | tr -d " ")
commands=$(find .claude/commands -name "*.md" 2>/dev/null | wc -l | tr -d " ")
skills=$(find .claude/skills -name "SKILL.md" 2>/dev/null | wc -l | tr -d " ")
with_front=$(find .claude/agents .claude/commands .claude/skills -name "*.md" 2>/dev/null | xargs grep -l "^---" 2>/dev/null | wc -l | tr -d " ")
with_desc=$(find .claude/agents .claude/commands .claude/skills -name "*.md" 2>/dev/null | xargs grep -l "^description:" 2>/dev/null | wc -l | tr -d " ")
# Check argument-hint on legacy commands still using $ARGUMENTS
uses_args=$(find .claude/commands -name "*.md" 2>/dev/null | xargs grep -l '\$ARGUMENTS' 2>/dev/null | wc -l | tr -d " ")
with_hint=$(find .claude/commands -name "*.md" 2>/dev/null | xargs grep -l 'argument-hint' 2>/dev/null | wc -l | tr -d " ")
echo "Agents: $agents | Commands: $commands | Skills: $skills | With frontmatter: $with_front | With description: $with_desc"
echo "Commands using \$ARGUMENTS: $uses_args | With argument-hint: $with_hint"
```

Fallback scoring (max 8 pts):
- Has agents, commands, or skills: 2 pts
- All have YAML frontmatter: 2 pts
- All have `description:` field: 2 pts
- `argument-hint:` present in all legacy commands that use `$ARGUMENTS`: 2 pts

### Dimension 5 — Security Posture (20 pts)

**Full audit** (if `/security-check` is available):
Invoke: `/security-check`
Map its findings to 20 pts:
- No critical findings: 18-20 pts
- 1-2 medium findings: 12-17 pts
- 3+ findings or any critical: 0-11 pts

**Fallback** (if `/security-check` is not installed):

```bash
# permissions.deny check
echo "=== Permissions Deny ==="
for setting in ".claude/settings.json" "~/.claude/settings.json"; do
  [ -f "$setting" ] && {
    echo "File: $setting"
    grep -E "\.env|\.pem|credentials|secrets" "$setting" 2>/dev/null && echo "  ✅ Sensitive patterns found" || echo "  ❌ No .env/.pem/credentials blocked"
    grep -i "sandbox\|failIfUnavailable" "$setting" 2>/dev/null | head -3 | sed "s/^/  /"
  }
done

echo ""
echo "=== Hooks ==="
if [ -d ".claude/hooks" ]; then
  hooks=$(ls .claude/hooks/*.sh 2>/dev/null | wc -l | tr -d " ")
  pretool=$(grep -rl "PreToolUse" .claude/hooks/ 2>/dev/null | wc -l | tr -d " ")
  echo "  Hooks: $hooks | PreToolUse: $pretool"
else
  echo "  ❌ No hooks directory"
fi

echo ""
echo "=== Dangerous Patterns ==="
# Check for hardcoded tokens/keys in config
grep -rn "sk-\|ghp_\|xox[baprs]-\|AKIA" .claude/ CLAUDE.md 2>/dev/null | grep -v "example\|sample\|template" | head -5 || echo "  No obvious secrets found"
```

Fallback scoring (max 17 pts):
- `.env*` blocked in `permissions.deny`: 4 pts
- `*.pem` and `credentials*` also blocked: 3 pts
- At least one `PreToolUse` hook exists: 4 pts
- Sandbox configured (`failIfUnavailable`): 3 pts
- No hardcoded secrets in config: 3 pts

### Dimension 6 — MCP Ecosystem (10 pts)

Inline bash only (no dedicated skill for this dimension):

```bash
CURRENT_DIR=$(pwd)
echo "=== MCP Servers for this project ==="
if command -v jq &>/dev/null && [ -f ~/.claude.json ]; then
  jq -r --arg p "$CURRENT_DIR" '
    .projects[$p].mcpServers // {} | to_entries[] |
    "\(.key): \(.value.command // .value.url // "configured")"
  ' ~/.claude.json 2>/dev/null || echo "  No project-specific MCPs"

  echo ""
  echo "=== DB MCP Risk ==="
  jq -r --arg p "$CURRENT_DIR" '.projects[$p].mcpServers // {} | keys[]' ~/.claude.json 2>/dev/null \
    | grep -iE "postgres|neon|supabase|mysql|database|mongo" \
    | sed "s/^/  ⚠️  /" || echo "  No DB MCPs found"

  echo ""
  echo "=== Guide MCP ==="
  jq -r --arg p "$CURRENT_DIR" '.projects[$p].mcpServers // {} | keys[]' ~/.claude.json 2>/dev/null \
    | grep -iE "claude-code-ultimate-guide|ccguide" \
    | sed "s/^/  ✅ /" || echo "  ❌ Guide MCP not installed"
else
  echo "  (install jq for MCP analysis)"
fi
```

Scoring (max 10 pts):
- At least 1 MCP configured: 3 pts
- Documentation MCP present (Context7 or similar): 2 pts
- No DB MCP, or DB MCP is clearly scoped to dev/staging: 3 pts
- Guide MCP installed: 2 pts

### Dimension 7 — Workflow Commands (10 pts)

```bash
echo "=== Core Workflow Skills/Commands ==="
for cmd in investigate qa canary land-and-deploy review-pr; do
  found=false
  [ -f ".claude/commands/$cmd.md" ] && found=true
  [ -f "$HOME/.claude/commands/$cmd.md" ] && found=true
  [ -f ".claude/skills/$cmd/SKILL.md" ] && found=true
  [ -f "$HOME/.claude/skills/$cmd/SKILL.md" ] && found=true
  $found && echo "  ✅ /$cmd" || echo "  ❌ /$cmd"
done

echo ""
echo "=== Additional Debug/Deploy Skills/Commands ==="
for cmd in ship commit release-notes diagnose; do
  found=false
  [ -f ".claude/commands/$cmd.md" ] && found=true
  [ -f "$HOME/.claude/commands/$cmd.md" ] && found=true
  [ -f ".claude/skills/$cmd/SKILL.md" ] && found=true
  [ -f "$HOME/.claude/skills/$cmd/SKILL.md" ] && found=true
  $found && echo "  ✅ /$cmd" || echo "  ❌ /$cmd"
done
```

Scoring: 2 pts per core command present (`/investigate`, `/qa`, `/canary`, `/land-and-deploy`, `/review-pr`). Max 10 pts.

### Dimension 8 — Freshness & Best Practices (10 pts)

```bash
echo "=== Deprecated Model References ==="
grep -rn "claude-3-haiku\|gpt-3.5\|claude-2\b\|claude-instant\|claude-3-5-sonnet\b" \
  .claude/ CLAUDE.md ~/.claude/CLAUDE.md 2>/dev/null | grep -v ".git" | head -8 \
  || echo "  No deprecated model names found"

echo ""
echo "=== Config Freshness ==="
git log --oneline -1 --format="  Last commit: %ar (%h)" 2>/dev/null || echo "  (not a git repo)"

echo ""
echo "=== Cache Bug Workarounds ==="
# Bug 2 HIGH: --resume causes 87-118K token re-announcement
grep -rn "disableSkillShellExecution" ~/.claude/settings.json .claude/settings.json 2>/dev/null \
  | sed "s/^/  /" || echo "  disableSkillShellExecution: not set"

echo ""
echo "=== argument-hint Coverage (legacy commands) ==="
missing=0
for f in $(find .claude/commands -name "*.md" 2>/dev/null); do
  grep -q '\$ARGUMENTS' "$f" && ! grep -q "argument-hint" "$f" && {
    echo "  ⚠️  Missing argument-hint: $f"
    missing=$(( missing + 1 ))
  }
done
[ $missing -eq 0 ] && echo "  ✅ All commands using \$ARGUMENTS have argument-hint (skills use effort: field instead)"

echo ""
echo "=== Hook Profiles (env vars) ==="
grep -rn "CLAUDE_HOOK_PROFILE\|HOOK_PROFILE" .claude/ CLAUDE.md 2>/dev/null | head -3 | sed "s/^/  /" || echo "  No hook profiles configured"
```

Scoring (max 10 pts):
- No deprecated model names: 3 pts
- Git activity in last 90 days (or not a git repo): 2 pts
- `disableSkillShellExecution: false` OR not using `--resume` pattern: 3 pts
- All commands using `$ARGUMENTS` have `argument-hint:`: 2 pts

---

## Phase 3 — Unified Report

Produce the report in this exact structure:

### Executive Summary

State:
- **Total Score**: X/100
- **Maturity Tier**: Starter (<40) | Growing (40-59) | Established (60-79) | Optimized (80+)
- **Detected Stack**: [from Phase 1]
- **Top 3 Quick Wins**: highest-ROI gaps that can be fixed in <15 min each
- **Top 3 Critical Gaps**: highest-severity missing items

### Dimension Scorecard

| # | Dimension | Score | Max | Status | Key Finding |
|---|-----------|-------|-----|--------|-------------|
| 1 | Memory & Context | X | 20 | ✅/⚠️/❌ | one-line finding |
| 2 | Rules Hygiene | X | 10 | ✅/⚠️/❌ | one-line finding |
| 3 | Skills Quality | X | 10 | ✅/⚠️/❌ | one-line finding |
| 4 | Agents/Commands Quality | X | 10 | ✅/⚠️/❌ | one-line finding |
| 5 | Security Posture | X | 20 | ✅/⚠️/❌ | one-line finding |
| 6 | MCP Ecosystem | X | 10 | ✅/⚠️/❌ | one-line finding |
| 7 | Workflow Commands | X | 10 | ✅/⚠️/❌ | one-line finding |
| 8 | Freshness & Best Practices | X | 10 | ✅/⚠️/❌ | one-line finding |
| | **TOTAL** | **X** | **100** | | |

Status thresholds: ✅ ≥80% of max, ⚠️ 50-79%, ❌ <50%.

### Detailed Findings

Group by dimension. For each gap (❌ or ⚠️):

```
**[Dimension N — Name]**
Gap: [what is missing or suboptimal]
Impact: [what breaks or degrades without it]
Fix: [concrete action with file path]
```

### Stack-Specific Templates

Propose at most 3 templates, chosen for the highest-impact gaps on the detected stack. Include only file path + starter content. Do not repeat existing content.

### Deepen Your Audit

List which audit skills are not installed and what they would unlock:

```
Skills not installed — install for deeper analysis:

# token-audit (Dimension 1 — adds rule classification, hook overhead analysis)
mkdir -p ~/.claude/skills/token-audit
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/examples/skills/token-audit/SKILL.md \
  > ~/.claude/skills/token-audit/SKILL.md

# eval-rules (Dimension 2 — adds glob validation, interactive review)
mkdir -p ~/.claude/skills/eval-rules
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/examples/skills/eval-rules/SKILL.md \
  > ~/.claude/skills/eval-rules/SKILL.md

# eval-skills (Dimension 3 — adds 14-pt scoring per skill)
mkdir -p ~/.claude/skills/eval-skills
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/examples/skills/eval-skills/SKILL.md \
  > ~/.claude/skills/eval-skills/SKILL.md

# audit-agents-skills (Dimension 4 — adds grades A-F, comparative analysis)
mkdir -p ~/.claude/skills/audit-agents-skills
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/examples/skills/audit-agents-skills/SKILL.md \
  > ~/.claude/skills/audit-agents-skills/SKILL.md

# security-check (Dimension 5 — scans against threat-db, 55 CVEs, 24 techniques)
mkdir -p ~/.claude/skills/security-check
curl -sL https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/main/examples/skills/security-check/SKILL.md \
  > ~/.claude/skills/security-check/SKILL.md

# Alternative for dimension 1 — context-evaluator.ai
# Zero-install LLM-native audit: 17 AI evaluators for CLAUDE.md/AGENTS.md,
# automated .patch remediation. Complements /token-audit with deeper rule analysis.
# Visit: https://context-evaluator.ai
```

---

## Phase 4 — Validation Request

After presenting the report, ask:

"Implement the top 3 quick wins? Reply:
- **yes** → I'll implement all three
- **high** → only critical gaps (Dimensions 5 and 1 if ❌)
- **1, 3** → specific items by number from findings
- **none** → keep the report, no changes"

Wait for explicit user response before taking any action.
````

---

## 5. Чего ожидать

### Пример резюме

```
## Executive Summary

Total Score: 52/100 — Growing

Detected Stack: TypeScript + Next.js + Prisma

Top 3 Quick Wins:
- Add permissions.deny for .env* (15 min) → fixes Dimension 5 critical gap
- Install /investigate and /qa commands (5 min) → +4 pts on Dimension 7
- Add paths: frontmatter to 3 always-on rules (20 min) → reduces fixed context ~3K tokens

Top 3 Critical Gaps:
1. ❌ Security — no permissions.deny, no PreToolUse hooks (0/20)
2. ⚠️ Memory — project CLAUDE.md missing, global is 22K tokens (8/20)
3. ❌ Workflow — 3/5 core commands absent (4/10)
```

### Пример системы показателей измерения

| # | Измерение | Счет | Макс | Статус | Ключевой вывод |
|---|-----------|-------|-----|--------|-------------|
| 1 | Память и контекст | 8 | 20 | ⚠️ | 22 тыс. фиксированных токенов, без проекта CLAUDE.md |
| 2 | Правила гигиены | 7 | 10 | ⚠️ | 4 правила, ни в одном нет путей: поле |
| 3 | Качество навыков | 8 | 10 | ✅ | 3 навыка, все требуют усилий + разрешенные инструменты |
| 4 | Agents/Commands Качество | 6 | 10 | ⚠️ | 8 команд, 2 недостающих аргумента-подсказки |
| 5 | Положение безопасности | 0 | 20 | ❌ | Никаких запретных правил, никаких хуков |
| 6 | MCP Экосистема | 7 | 10 | ✅ | Контекст7 + последовательная настройка |
| 7 | Команды рабочего процесса | 4 | 10 | ⚠️ | /investigate ✅ /qa ❌ /canary ❌ |
| 8 | Свежесть и лучшие практики | 12 | 10 | — | ограничено максимумом |
| | **TOTAL** | **52** | **100** | ⚠️ | |

---

## 6. Понимание результатов

### Глоссарий

| Срок | Определение |
|------|------------|
| **Файлы памяти** | Файлы CLAUDE.md, которые обеспечивают постоянный контекст для Claude между сеансами. |
| **Контекстный бюджет** | Общая стоимость постоянно действующих токенов до начала любой задачи. Цвета: зеленый <20К, желтый 20-40К, красный >40К. |
| **Правила (автозагрузка)** | Файлы `.claude/rules/*.md`, которые загружаются при каждом запуске сеанса. Файлы с `paths:` загружаются только при чтении соответствующего файла. |
| **пути: frontmatter** | Поле в правиле YAML, которое ограничивает правило определенными шаблонами файлов — снижает постоянные накладные расходы. |
| **Оценочный навык** | Специализированный навык, проверяющий один домен: `eval-skills`, `eval-rules`, `token-audit`, `audit-agents-skills`. |
| **Единый источник истины** | Шаблон, в котором соглашения документируются один раз и на них ссылаются через `@path`. |
| **Инструмент SEO** | Написание описаний agent/command, чтобы Claude автоматически выбирал правильный инструмент. |
| Серверы **MCP** | Model Context Protocol — внешние инструменты, расширяющие возможности Claude. Конфигурация хранится в `~/.claude.json` для каждого проекта. |
| **Крюковые профили** | Уровни безопасности minimal/standard/strict для перехватчиков, переключаемые через env var (добавлена ​​версия 3.38.0) |
| **PreToolUse** | Хук, который срабатывает ДО того, как Claude запустит инструмент, используемый для проверок безопасности и шлюзов утверждения. |
| **усилие: поле** | Обозначение навыков для сигнала сложности low/medium/high — используется Claude для распределения бюджета на мышление. |
| **argument-hint** | Поле Frontmatter, показывающее текст-заполнитель в меню команд с косой чертой для команд, использующих `$ARGUMENTS`. |
| **База данных угроз** | `examples/commands/resources/threat-db.yaml` — версии CVE, методы атак, записи IOC и минимально безопасные версии. |
| **Ошибка кэша № 40524** | Ошибка 2 (ВЫСОКИЙ): `--resume` вызывает повторное объявление полного контекста (87–118 000 токенов перестраиваются на одно резюме). |
| **Смещение прицела** | Когда PR меняет файлы, выходящие за рамки заявленного плана. Обнаружено путем сравнения `~/.claude/plans/` и `git diff --stat`. |
| **Эвристика «первое исправление»** | Схема проверки: автоматическое устранение механических проблем, запрос оценки решений security/design. |
| **LLM Выходная граница доверия** | Категория просмотра для значений, сгенерированных ИИ, записываемых в БД без проверки формата |
| **managed-settings.d/** | Корпоративный каталог для правил управления, которые переопределяют настройки пользователя (добавлена ​​версия 2.1.83). |
| **Процедуры** | Запланированные задачи, размещенные в облаке, с тремя типами триггеров: расписание, события API, GitHub (запущено в апреле 2026 г.) |
| **Контекстные зоны** | <70% оптимально, 75% автокомпактный триггер, рекомендуется 85% хэндовер |
| **Песочница** | Изоляция на уровне ОС (контейнер Docker или собственный уровень процесса). Настроен в settings.json |
| **Железный закон** | Принцип отладки: никаких исправлений без предварительного исследования основной причины. См. `/investigate`. |

### Пороговые значения баллов

| Счет | Уровень | Что это значит |
|-------|------|----------------|
| 80-100 | Оптимизированный | Конфигурация надежная. Сосредоточьтесь на свежести и крайних случаях |
| 60-79 | Учредил | Хорошая основа. Заполните ⚠️ размеры |
| 40-59 | Растущий | Основные части существуют, но есть несколько пробелов. Следуйте за быстрыми победами |
| <40 | Стартер | Начните с измерения 5 (Безопасность) и 1 (Память). |

### Значки состояния

| Икона | Значение |
|------|---------|
| ✅ | ≥80 % от максимального количества баллов по этому параметру |
| ⚠️ | 50-79% от максимального количества очков |
| ❌ | <50% от максимального количества баллов |

---

## 7. Общие проблемы

### «Навыки аудита не установлены»

**Cause**: Специализированные навыки являются необязательными и по умолчанию недоступны глобально.

**Что происходит**: приглашение запускается в резервном режиме для этого измерения. Оценки ограничены ниже (8 баллов вместо 10 для некоторых параметров). Результаты по-прежнему действенны, но менее подробны.

**Fix**: используйте команды установки в разделе «Углубление аудита» отчета. Установка каждого навыка занимает ~1 минуту и ​​сразу же улучшает будущие аудиты.

### «Claude не нашел мои файлы»

**Cause**: Неверные различия в пути к рабочему каталогу или платформе.

**Fix**:
- Убедитесь, что вы запускаете `claude` из корня вашего проекта.
- На Windows пути используют `%USERPROFILE%\.claude\`, а не `~/.claude/`.

### «Кажется, счет занижен»

**Cause**: оценка резервного режима упрощена: в нем нельзя проверять валидность общих данных, выполнять 14-точечные проверки навыков или сканировать базу данных угроз.

**Fix**: Установите соответствующие навыки аудита (см. «Углубление аудита»). Повторите запуск, чтобы получить точные оценки измерений.

### «Слишком много рекомендаций»

**Cause**: первый аудит проекта без конфигурации Claude Code.

**Fix**: используйте быстрые победы из сводного описания. Реализуйте эти три. Повторный аудит. Стройте постепенно.

### «Claude внес изменения без спроса»

**Cause**: проверка фазы 4 не была достигнута или была пропущена.

**Fix**: убедитесь, что вы скопировали полное приглашение, включая этап 4. Перед вставкой используйте режим планирования (`Shift+Tab` дважды) для дополнительной безопасности.

---

## 8. Сопутствующие ресурсы

**Дополнительные инструменты аудита** (подробнее о конкретных аспектах):

| Инструмент | Измерение | Установка |
|------|-----------|---------|
| `/token-audit` | Память и контекст | `mkdir -p ~/.claude/skills/token-audit && curl -sL .../examples/skills/token-audit/SKILL.md > ...` |
| `/eval-rules` | Правила гигиены | Тот же образец |
| `/eval-skills` | Качество навыков | Тот же образец |
| `/audit-agents-skills` | Agents/Commands | Тот же образец |
| `/security-check` | Положение безопасности (быстро, ~30 с) | `mkdir -p ~/.claude/skills/security-check && curl -sL ...` |
| `/security-audit` | Поза безопасности (полная, 2–5 мин, балл /100) | Тот же образец |
| [`tools/context-audit-prompt.md`](context-audit-prompt.md) | Глубокое погружение в контекстную инженерию | Автономная подсказка, установка не требуется. |
| [`tools/onboarding-prompt.md`](onboarding-prompt.md) | Настройка с нуля | Автономная подсказка, установка не требуется. |
| [context-evaluator.ai](https://context-evaluator.ai) | Память и контекст (альтернативный вариант) — LLM-родной, 17 оценщиков, автоматический `.patch` | Веб-инструмент без установки |

**Справочная документация**:
- [Полное руководство по Claude Code](../guide/ultimate-guide.md) — полный справочник
- [Cheatsheet](../guide/cheatsheet.md) — краткий ежедневный справочник
- [Security Hardening](../guide/security/security-hardening.md) — шаблоны безопасности производства
- [Context Engineering](../guide/core/architecture.md) — стратегии бюджета токенов
- [Claude Code Официальная документация](https://docs.anthropic.com/en/docs/claude-code) — Документация Anthropic

**Для интеграции CI/CD** (вывод JSON, пакетный режим): [`examples/scripts/audit-scan.sh`](../examples/scripts/audit-scan.sh)

---

*Версия 5.2 (гайд v3.41.0+) | v5.2: обнаружение навыков обновлено для унификации навыков и команд CC 2.1.3 — измерение 4/7/8 bash теперь проверяет как `.claude/skills/`, так и `.claude/commands/`; Путь установки проверки безопасности исправлен на канонический SKILL.md. v5.1: добавлен context-evaluator.ai. v5.0: преобразован из контрольного списка в оркестратор с 8 взвешенными измерениями.*
