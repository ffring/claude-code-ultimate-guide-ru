---
name: dashboard
description: "Запустить панель управления ccboard TUI"
category: "мониторинг"
---

# Команда панели мониторинга

Запустите интерактивный TUI ccboard для визуализации и мониторинга использования Claude Code.

## <a name="features"></a>Функции

- **8 Интерактивные вкладки**: Панель управления, Сеансы, Конфигурация, Хуки, Агенты, Затраты, История, MCP
- **Мониторинг в реальном времени**: средство отслеживания файлов для обновлений в реальном времени
- **MCP Management**: состояние и конфигурация сервера.
- **Отслеживание затрат**: аналитика использования токенов и цен.
- **Session Explorer**: просмотр и поиск истории разговоров.
- **Редактирование файлов**: Нажмите `e`, чтобы редактировать файлы в $EDITOR.

## Использование

```bash
# Launch TUI dashboard
/dashboard

# Alternative: run directly
ccboard
```

## Навигация

- `1-8`: переход на определенную вкладку.
- `Tab` / `Shift+Tab`: переход по вкладкам.
- `q` : Выйти
- `F5` : Обновить данные.
- `e`: Редактировать выбранный файл.
- `o`: Показать файл в поисковике.

## Требования

ccboard должен быть установлен. Если не установлено, запустите:
```bash
/ccboard-install
```

## Выполнение

```bash
#!/bin/bash

# Check if ccboard is installed
if ! command -v ccboard &> /dev/null; then
    echo "❌ ccboard is not installed"
    echo ""
    echo "Install with:"
    echo "  /ccboard-install"
    echo ""
    echo "Or manually:"
    echo "  cargo install ccboard"
    exit 1
fi

# Launch ccboard TUI
exec ccboard
```
