[К оглавлению](README.md) · [Предыдущая глава](11-10-reference.md) · [Следующая глава](13-11-ai-ecosystem-complementary-tools.md)

# <a name="appendix-templates-collection"></a>Приложение: Коллекция шаблонов

> **💡 Готовые к использованию примеры**: полные, проверенные в бою шаблоны, включая расширенные команды (`/pr`, `/release-notes`, `/sonarqube`) и средства безопасности, см. в каталоге [`examples/`](../../examples/). Приведенные ниже шаблоны являются минимальными отправными точками.

## A.1 Шаблон агента

```markdown
---
name: your-agent-name
description: Use this agent when [specific trigger]
model: sonnet
tools: Read, Write, Edit, Bash, Grep, Glob
skills: []
---

# Agent name

## Role definition
You are an expert in [domain].

## Activation triggers
Use this agent when:
- [Trigger 1]
- [Trigger 2]

## Methodology
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Output format
[Expected deliverables]

## Examples
[Concrete usage examples]
```

## A.2 Шаблон навыков

```markdown
---
name: skill-name
description: Expert guidance for [domain]
allowed-tools: Read Grep Bash
argument-hint: "[--option] <required_arg>"   # if the skill accepts $ARGUMENTS
---

# Skill name

## Expertise areas
- [Area 1]
- [Area 2]

## Methodology
1. [Step 1]
2. [Step 2]

## Checklists
- [ ] [Check 1]
- [ ] [Check 2]

## Examples
[Good and bad patterns]
```

## A.3 Шаблон команды

```markdown
---
description: Brief description of what this command does
argument-hint: "<first_arg> [second_arg] [--flag]"
---
# Command name

## Purpose
[What this command does]

## Process
1. **Step 1**: [Instructions]
2. **Step 2**: [Instructions]

## Arguments
- $ARGUMENTS[0] (or $0): First argument - [How to handle]
- $ARGUMENTS[1] (or $1): Second argument - [How to handle]

## Output format
[Expected output]
```

## A.4 Шаблоны хуков

### PreToolUse (Безопасность)

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Block dangerous patterns
[[ "$COMMAND" =~ "dangerous-pattern" ]] && { echo "BLOCKED" >&2; exit 2; }

exit 0
```

### PostToolUse (Форматирование)

```bash
#!/bin/bash
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // ""')

# Auto-format
[[ "$FILE_PATH" =~ \.(ts|tsx)$ ]] && npx prettier --write "$FILE_PATH" 2>/dev/null

exit 0
```

### Юзерпромптсубмит (контекст)

```bash
#!/bin/bash
CONTEXT="[Custom context here]"
cat << EOF
{"hookSpecificOutput":{"additionalContext":"$CONTEXT"}}
EOF
exit 0
```

## A.5 Шаблон settings.json

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": ".claude/hooks/security.sh", "timeout": 5000}]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{"type": "command", "command": ".claude/hooks/format.sh"}]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [{"type": "command", "command": ".claude/hooks/context.sh"}]
      }
    ]
  }
}
```

## A.6 Шаблон settings.local.json

```json
{
  "permissions": {
    "allow": [
      "Bash(git *)",
      "Bash(npm test)",
      "Bash(pnpm *)",
      "Edit",
      "Write"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ],
    "ask": [
      "Bash(npm publish)",
      "Bash(git push --force)"
    ]
  }
}
```

## A.7 Шаблон CLAUDE.md

```markdown
# Project name

## Tech stack
- [Technology 1]
- [Technology 2]

## Code conventions
- [Convention 1]
- [Convention 2]

## Architecture
- [Pattern 1]
- [Pattern 2]

## Commands
- `npm run dev` - Start development
- `npm test` - Run tests
```

---
