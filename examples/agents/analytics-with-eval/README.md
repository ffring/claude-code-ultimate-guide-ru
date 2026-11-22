---
title: "Аналитический агент со встроенной оценкой"
description: "Готовый к работе аналитический агент с автоматическим сбором метрик и проверкой безопасности"
tags: [agents, template, testing, performance]
---

# Агент аналитики со встроенной оценкой

**Template**: Готовый к работе аналитический агент с автоматическим сбором метрик.

**Use Case**: создание SQL-запросов с отслеживанием качества, мониторингом производительности и проверкой безопасности.

**Связанное руководство**: [Оценка агента](../../../guide/roles/agent-evaluation.md)

---

## Что включено

| Файл | Цель |
|------|---------|
| `analytics-agent.md` | Определение агента с критериями оценки |
| `hooks/post-response-metrics.sh` | Автоматизированная регистрация показателей после каждого ответа |
| `eval/metrics.sh` | Скрипт анализа для агрегирования собранных метрик |
| `eval/report-template.md` | Шаблон ежемесячных отчетов об оценке |

---

## <a name="setup"></a>Настройка

### 1. Скопируйте агент в проект

```bash
# Copy agent definition
cp analytics-agent.md ~/.claude/agents/

# Or for project-specific:
cp analytics-agent.md /path/to/project/.claude/agents/
```

### 2. Установите хук

```bash
# Copy hook to project
cp hooks/post-response-metrics.sh /path/to/project/.claude/hooks/

# Make executable
chmod +x /path/to/project/.claude/hooks/post-response-metrics.sh
```

### 3. Настройте триггер-перехватчик

Добавьте в `.claude/settings.json`:

```json
{
  "hooks": {
    "postToolUse": [
      {
        "command": ".claude/hooks/post-response-metrics.sh",
        "enabled": true,
        "description": "Log analytics agent metrics"
      }
    ]
  }
}
```

### 4. Создайте каталог журналов.

```bash
mkdir -p /path/to/project/.claude/logs
```

---

## Использование

### Вызов агента

```bash
# In Claude Code session
"Use analytics-agent to generate a SQL query for [task description]"
```

### Проверьте метрики

```bash
# View raw metrics log
cat .claude/logs/analytics-metrics.jsonl

# Run analysis
./examples/agents/analytics-with-eval/eval/metrics.sh
```

### Создать ежемесячный отчет

```bash
# Copy template
cp eval/report-template.md reports/analytics-2026-02.md

# Fill in metrics from metrics.sh output
```

---

## Собранные показатели

Хук автоматически регистрирует:

| Метрика | Описание | Источник |
|--------|-------------|--------|
| `timestamp` | Временная метка ISO 8601 | Система |
| `query` | Сгенерированный SQL-запрос | Ответ агента |
| `exec_time` | Время выполнения запроса | База данных |
| `safety` | PASS/FAIL для разрушительных операций | Анализ запросов |
| `row_count` | Строки возвращены | База данных |
| `error` | Сообщение об ошибке, если запрос не выполнен | База данных |

**Формат журнала**: JSONL (строки JSON) в `.claude/logs/analytics-metrics.jsonl`

---

## Пример вывода показателей

```bash
$ ./eval/metrics.sh

=== Analytics Agent Metrics Report ===
Period: 2026-02-01 to 2026-02-10

Total queries: 45
Safety checks:
  - PASS: 42 (93%)
  - FAIL: 3 (7%)

Execution time:
  - Mean: 2.3s
  - Median: 1.8s
  - P95: 5.2s
  - P99: 8.1s

Common failures:
  1. DELETE without WHERE clause (2 occurrences)
  2. DROP TABLE in query (1 occurrence)

Recommendations:
  - Review agent instructions to emphasize WHERE clause requirement
  - Add explicit prohibition on DROP operations
```

---

## <a name="customization"></a>Кастомизация

### Изменить проверки безопасности

Отредактируйте строку 12-16 `hooks/post-response-metrics.sh`:

```bash
# Add more patterns
if echo "$QUERY" | grep -iE 'DELETE|DROP|TRUNCATE|ALTER'; then
  SAFETY="FAIL"
fi
```

### Добавить специальные показатели

Расширьте структуру журнала JSON:

```bash
echo "{
  \"timestamp\":\"$(date -Iseconds)\",
  \"query\":\"$QUERY\",
  \"your_metric\":\"$VALUE\"
}" >> .claude/logs/analytics-metrics.jsonl
```

### Изменить местоположение журнала

Обновите переменную `POST_RESPONSE_LOG` в скрипте ловушки.

---

## <a name="troubleshooting"></a>Поиск неисправностей

### Хук не срабатывает

**Check**:
1. Хук является исполняемым: `ls -l .claude/hooks/*.sh`
2. Хук включен в settings.json
3. Имя агента соответствует: `analytics-agent` (через дефис).

**Debug**:
```bash
# Test hook manually
export CLAUDE_RESPONSE='{"content":"SELECT * FROM users;"}'
./.claude/hooks/post-response-metrics.sh
```

### Нет показателей в журнале

**Check**:
1. Каталог журналов существует: `mkdir -p .claude/logs`.
2. Разрешения на запись: `touch .claude/logs/test.log`
3. Шаблон извлечения запроса соответствует вашему формату SQL.

### Анализ метрик не удался

**Check**:
1. `jq` установлен: `which jq`
2. Файл журнала действителен. JSONL: `jq . .claude/logs/analytics-metrics.jsonl`.

---

## Производственные соображения

### Производительность

- Хук добавляет около 50 мс накладных расходов на каждый ответ
- Файл журнала увеличивается примерно на 200 байт за запрос.
- Ротация журналов ежемесячно, чтобы предотвратить раздувание

### Конфиденциальность

- Журналы содержат фактические SQL-запросы (могут включать конфиденциальные данные).
- Добавить в `.gitignore`: `.claude/logs/`
- Рассмотрите возможность редактирования конфиденциальных значений в скрипте-перехватчике.

### Подключение к базе данных

- Хуку требуется доступ к базе данных для измерения `exec_time`
- Настройте соединение в скрипте перехвата или используйте переменные среды.
- Обеспечьте учетные данные только для чтения в целях безопасности.

---

## <a name="related-resources"></a>Связанные ресурсы

- **[Руководство по оценке агента](../../../guide/roles/agent-evaluation.md)**: Полная методология оценки
- **[Hooks Documentation](../../../guide/ultimate-guide.md#7-hooks)**: Справочник по системе Hooks
- **[nao Framework](https://github.com/getnao/nao/)**: Платформа агента производственного анализа (вдохновение)

---

## Лицензия

То же, что родительский репозиторий (MIT)

**Questions?** Откройте вопрос или обсуждение в основном репозитории.
