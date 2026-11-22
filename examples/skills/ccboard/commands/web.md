---
name: ccboard-web
description: "Запустить веб-интерфейс ccboard"
category: "мониторинг"
---

# Команда веб-интерфейса

Запустите веб-интерфейс ccboard для мониторинга и визуализации с помощью браузера.

## <a name="features"></a>Функции

- **Веб-панель**: доступ к панели управления из любого браузера.
- **Live Updates**: события, отправленные сервером (SSE) для данных в реальном времени
- **Адаптивный дизайн**: работает на настольных компьютерах, планшетах и ​​мобильных устройствах.
- **Same Data**: общий уровень данных с TUI (один двоичный файл)
- **Одновременный доступ**: несколько пользователей могут просматривать одновременно

## Использование

```bash
# Launch web UI on default port 3333
/ccboard-web

# Or specify custom port
ccboard web --port 8080
```

## Доступ

После запуска откройте в браузере:
```
http://localhost:3333
```

## Режимы

ccboard поддерживает 3 режима выполнения:

1. Только **TUI** (по умолчанию):
   ```bash
   ccboard
   ```

2. **Только в Интернете**:
   ```bash
   ccboard web --port 3333
   ```

3. **Оба одновременно**:
   ```bash
   ccboard both --port 3333
   ```
   Запускает TUI в терминале + веб-сервере на порту 3333.

## Функции веб-интерфейса

- Панель управления со статистикой в ​​реальном времени
- Браузер сессий с нумерацией страниц
- Просмотрщик конфигурации (только чтение)
- Хуки, агенты, визуализация затрат
- Статус сервера MCP
- История и поиск

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

# Default port
PORT="${1:-3333}"

echo "🌐 Launching ccboard web interface..."
echo "Access at: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Launch web UI
exec ccboard web --port "$PORT"
```

**Note**: веб-интерфейс в настоящее время находится в разработке. TUI — это основной интерфейс с полным набором функций.
