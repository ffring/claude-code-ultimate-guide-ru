---
name: sandbox-status
description: "Отображение статуса, конфигурации и недавних нарушений встроенной песочницы."
effort: low
when_to_use: "Use to check whether Claude Code sandbox mode is active and what restrictions apply."
disable-model-invocation: true
---

# Команда статуса песочницы

Проверьте состояние собственной песочницы Claude Code, активную конфигурацию и события безопасности.

## Использование

```
/sandbox-status
```

## Что он делает

1. **Проверить доступность песочницы**
   - Убедитесь, что установлены примитивы ОС (пузырчатая пленка на Linux, ремень безопасности на macOS).
   - Отображение статуса поддержки платформы

2. **Показать активную конфигурацию**
   - Режим песочницы (автоматическое разрешение или обычные разрешения)
   - Политики файловой системы (разрешенная запись, запрещенное чтение)
   - Сетевые политики (домен allowlist/denylist)
   - Исключенные команды

3. **Перечислить недавние нарушения в песочнице**
   - Заблокированные попытки доступа к файловой системе
   - Заблокированные сетевые подключения
   - Вызов аварийного люка (`dangerouslyDisableSandbox`)

## Выполнение

```bash
#!/bin/bash

echo "=== Native Sandbox Status ==="
echo

# 1. Platform Check
echo "Platform:"
case "$OSTYPE" in
  darwin*)
    echo "  ✅ macOS (Seatbelt built-in)"
    ;;
  linux*)
    if which bubblewrap >/dev/null 2>&1; then
      echo "  ✅ Linux (bubblewrap installed)"
      bubblewrap --version 2>/dev/null | head -1
    else
      echo "  ❌ Linux (bubblewrap NOT installed)"
      echo "     Install: sudo apt-get install bubblewrap socat"
    fi
    if which socat >/dev/null 2>&1; then
      echo "  ✅ socat installed"
    else
      echo "  ❌ socat NOT installed"
    fi
    ;;
  *)
    echo "  ❌ Unsupported platform: $OSTYPE"
    ;;
esac
echo

# 2. Configuration
echo "Configuration (from settings.json):"
if [ -f .claude/settings.json ]; then
  CONFIG=".claude/settings.json"
elif [ -f ~/.claude/settings.json ]; then
  CONFIG="~/.claude/settings.json"
else
  echo "  ⚠️  No settings.json found"
  CONFIG=""
fi

if [ -n "$CONFIG" ]; then
  echo "  Source: $CONFIG"

  # Auto-allow mode
  AUTO_ALLOW=$(jq -r '.sandbox.autoAllowBashIfSandboxed // "not set"' "$CONFIG" 2>/dev/null)
  echo "  Auto-allow: $AUTO_ALLOW"

  # Escape hatch
  ESCAPE=$(jq -r '.sandbox.allowUnsandboxedCommands // "not set"' "$CONFIG" 2>/dev/null)
  echo "  dangerouslyDisableSandbox allowed: $ESCAPE"

  # Allowed write paths
  WRITE_PATHS=$(jq -r '.sandbox.filesystem.allowWrite[]? // empty' "$CONFIG" 2>/dev/null | tr '\n' ', ')
  echo "  Allowed writes: ${WRITE_PATHS:-not set}"

  # Credential files denied to every subprocess
  CRED_FILES=$(jq -r '.sandbox.credentials.files[]?.path // empty' "$CONFIG" 2>/dev/null | tr '\n' ', ')
  echo "  Denied credential files: ${CRED_FILES:-not set}"

  # Strict allowlist switch
  STRICT=$(jq -r '.sandbox.network.strictAllowlist // "not set (default false)"' "$CONFIG" 2>/dev/null)
  echo "  Strict allowlist: $STRICT"

  # Allowed domains
  DOMAINS=$(jq -r '.sandbox.network.allowedDomains[]? // empty' "$CONFIG" 2>/dev/null | head -3 | tr '\n' ', ')
  DOMAINS_COUNT=$(jq -r '.sandbox.network.allowedDomains | length' "$CONFIG" 2>/dev/null)
  if [ -n "$DOMAINS" ]; then
    echo "  Allowed domains: $DOMAINS... ($DOMAINS_COUNT total)"
  else
    echo "  Allowed domains: not set"
  fi

  # Excluded commands
  EXCLUDED=$(jq -r '.sandbox.excludedCommands[]? // empty' "$CONFIG" 2>/dev/null | tr '\n' ', ')
  echo "  Excluded commands: ${EXCLUDED:-not set}"
fi
echo

# 3. Recent Violations (placeholder - actual implementation would read Claude Code logs)
echo "Recent sandbox violations:"
echo "  ℹ️  Log inspection not yet implemented"
echo "  Tip: Check Claude Code session logs for sandbox violation notifications"
echo

# 4. Open-Source Runtime
echo "Open-Source Runtime:"
if which npx >/dev/null 2>&1; then
  echo "  ✅ npx available - can use @anthropic-ai/sandbox-runtime"
  echo "  Usage: npx @anthropic-ai/sandbox-runtime <command>"
else
  echo "  ⚠️  npx not found (install Node.js)"
fi
echo

# 5. Documentation
echo "Documentation:"
echo "  Guide: guide/security/sandbox-native.md"
echo "  Official: https://code.claude.com/docs/en/sandboxing"
echo "  Runtime: https://github.com/anthropic-experimental/sandbox-runtime"
```

## Пример вывода

```
=== Native Sandbox Status ===

Platform:
  ✅ macOS (Seatbelt built-in)

Configuration (from settings.json):
  Source: .claude/settings.json
  Auto-allow: true
  dangerouslyDisableSandbox allowed: false
  Allowed writes: ${CWD}, /tmp
  Denied credential files: ~/.ssh, ~/.aws, ~/.gnupg
  Strict allowlist: not set (default false)
  Allowed domains: api.anthropic.com, registry.npmjs.com, github.com... (9 total)
  Excluded commands: docker, kubectl, podman

Recent sandbox violations:
  ℹ️  Log inspection not yet implemented
  Tip: Check Claude Code session logs for sandbox violation notifications

Open-Source Runtime:
  ✅ npx available - can use @anthropic-ai/sandbox-runtime
  Usage: npx @anthropic-ai/sandbox-runtime <command>

Documentation:
  Guide: guide/security/sandbox-native.md
  Official: https://code.claude.com/docs/en/sandboxing
  Runtime: https://github.com/anthropic-experimental/sandbox-runtime
```

## Варианты использования

- **Предварительное развертывание**: проверьте конфигурацию песочницы перед запуском автономных рабочих процессов.
- **Debugging**: выясните, почему определенные команды блокируются.
- **Аудит безопасности**: просмотр разрешенных доменов и доступа к файловой системе.
- **Onboarding**: Помогите новым членам команды понять политику песочницы проекта.

## <a name="see-also"></a>См. также

- [Руководство по встроенной песочнице](../../../guide/security/sandbox-native.md) — Полный технический справочник
- [/sandbox-unblock](../sandbox-unblock/SKILL.md) — протокол диагностики, когда что-то выглядит заблокированным
- [Sandbox Validation Hook](../../hooks/bash/sandbox-validation.sh) — проверка перед командой
- [Пример конфигурации песочницы](../../config/sandbox-native.json) — готовые к работе настройки
