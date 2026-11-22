---
name: costs
description: "Открыть вкладку анализа затрат на ccboard"
category: "аналитика"
---

# Команда анализа затрат

Запустите ccboard и перейдите непосредственно на вкладку отслеживания и аналитики затрат.

## <a name="features"></a>Функции

- **3 Просмотра**:
  - Обзор: общие затраты и их разбивка
  - По модели: стоимость за модель AI (Opus, Sonnet, Haiku)
  - Ежедневный тренд: изменение затрат с течением времени

- **Распределение токенов**:
  - Ввод токенов (подсказка)
  - Выходные токены (генерация)
  - Токены чтения кэша (повторное использование)
  - Токены записи в кэш (хранятся)

- **Pricing**: автоматический расчет на основе ставок Anthropic 2024 года.

## Использование

```bash
# Open costs tab directly
/costs

# Alternative: run with tab argument
ccboard --tab costs
```

## Навигация по вкладке «Расходы»

- `1` : Обзорный вид
- `2`: По модели.
- `3`: просмотр дневного тренда
- `Tab` : Переключение между представлениями.
- `↑/↓` : Прокрутка данных.

## Пример вывода

```
Total Tokens: 17.32M
Total Cost: $9,145.20

Breakdown by Model:
- Opus 4.5:   76% ($7,828)  ████████████████
- Sonnet 4.5: 14% ($1,314)  ███
- Haiku 3.5:  10% ($3)      █

Token Distribution:
- Input:       10.70M (65%)
- Output:      4.58M  (28%)
- Cache Read:  1.01M  (6%)
- Cache Write: 1.04B  (1%)
```

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

# Launch ccboard with Costs tab (tab index 5, accessible with '6' key)
# For now, launch and user presses '6'
exec ccboard
```

**Note**: в настоящее время запускает ccboard в виде информационной панели. Нажмите `6`, чтобы получить доступ к вкладке «Затраты».
Будущая версия будет поддерживать `ccboard --tab costs` для прямого доступа.
