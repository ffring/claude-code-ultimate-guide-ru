---
name: mcp-status
description: "Откройте вкладку серверов ccboard MCP."
category: "мониторинг"
---

# Команда статуса MCP

Запустите ccboard и перейдите непосредственно на вкладку управления серверами MCP.

## <a name="features"></a>Функции

- **Server List**: все настроенные серверы MCP из `claude_desktop_config.json`.
- **Обнаружение статуса**: Активный статус ( ● Работает, ○ Остановлено, ? Неизвестно)
- **Сведения о сервере**: полная команда, аргументы, переменные среды.
- **Быстрые действия**:
  - `e`: изменить конфигурацию MCP.
  - `o`: показать конфигурацию в поисковике.
  - `r` : Обновить статус сервера.

## Использование

```bash
# Open MCP tab directly
/mcp-status

# Alternative: run with tab argument
ccboard --tab mcp
```

## MCP навигация по вкладкам

- `h/j/k/l` или `←/→/↑/↓` : Навигация.
- `Enter` : Панель сведений о фокусе.
- `e` : Редактировать `~/.claude/claude_desktop_config.json`
- `o`: показать файл конфигурации.
- `r` : Обновить статус сервера.

## Статус сервера

- **● Зеленый**: серверный процесс запущен.
- **○ Red** : Серверный процесс остановлен.
- **? Gray**: статус неизвестен (Windows или не удалось обнаружить)

## Требования

ccboard должен быть установлен. При необходимости запустите `/ccboard-install`.

## Выполнение

```bash
#!/bin/bash

# Check if ccboard is installed
if ! command -v ccboard &> /dev/null; then
    echo "❌ ccboard is not installed"
    echo "Run: /ccboard-install"
    exit 1
fi

# Launch ccboard with MCP tab (tab index 7, accessible with '8' key)
# For now, launch and user presses '8'
# TODO: Add --tab flag to ccboard CLI in future version
exec ccboard
```

**Note**: в настоящее время запускает ccboard в виде информационной панели. Нажмите `8`, чтобы получить доступ к вкладке MCP.
Будущая версия будет поддерживать `ccboard --tab mcp` для прямого доступа.
