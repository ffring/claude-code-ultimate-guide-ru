---
name: cyber-defense-team
description: "Организуйте конвейер киберзащиты из четырех агентов для анализа файлов журналов на наличие угроз. Используйте при исследовании журналов безопасности, обнаружении аномалий в шаблонах доступа, классификации серьезности нарушений или создании отчетов об инцидентах из файлов nginx/auth/syslog."
allowed-tools: Read Bash
argument-hint: "[log-file-path]"
effort: high
metadata:
  version: 1.0.0
---

# Навыки команды киберзащиты

Организуйте конвейер из четырех агентов, который анализирует файлы журналов на наличие угроз безопасности и формирует отчет об инцидентах.

## Трубопроводная архитектура

```
[You] -> Team Lead (this skill)
           |
           |-[1]-> log-ingestor    (haiku)  -> cyber-defense-events.json
           |
           |-[2]-> anomaly-detector (sonnet) -> cyber-defense-anomalies.json
           |                                    (reads events.json)
           |-[3]-> risk-classifier  (sonnet) -> cyber-defense-risk.json
           |                                    (reads anomalies.json)
           `-[4]-> threat-reporter  (sonnet) -> cyber-defense-report.md
                                               (reads all 3 JSON files)
```

Этапы 2 и 3 являются последовательными (каждый зависит от предыдущего результата). Этап 4 запускается после того, как все данные готовы.

## Этапы выполнения

### Шаг 1. Подтвердите ввод

Убедитесь, что файл журнала существует (или что содержимое журнала было встроено). Если путь не существует, немедленно сообщите об этом пользователю и не продолжайте.

### Шаг 2. Создайте сборщик журналов

Используйте инструмент «Агент», чтобы создать агент `log-ingestor`:

```
Task: Parse the log file at [log_path] and write structured events to cyber-defense-events.json.
Log path: [log_path]
```

Дождитесь завершения. Подтвердите создание `cyber-defense-events.json`.

### Шаг 3: Появление детектора аномалий

Используйте инструмент «Агент», чтобы создать агент `anomaly-detector`:

```
Task: Read cyber-defense-events.json and detect anomalies. Write results to cyber-defense-anomalies.json.
```

Дождитесь завершения. Если `anomalies_found: 0`, перейдите к шагу 5 (репортер все еще работает).

### Шаг 4. Классификатор рисков появления

Используйте инструмент «Агент», чтобы создать агент `risk-classifier`:

```
Task: Read cyber-defense-anomalies.json and classify overall risk. Write result to cyber-defense-risk.json.
```

### Шаг 5: Создайте репортер об угрозах

Используйте инструмент «Агент», чтобы создать агент `threat-reporter`:

```
Task: Read cyber-defense-events.json, cyber-defense-anomalies.json, and cyber-defense-risk.json. Generate a complete incident report and save it to cyber-defense-report.md.
```

### Шаг 6. Подведите итоги для пользователя

Прочитайте `cyber-defense-risk.json` и представьте:

```
Analysis complete

Risk Level : HIGH
Score      : 74/100
Threats    : 2 anomalies detected
Report     : cyber-defense-report.md

Primary threat: Brute force attack from 192.168.1.105
Immediate action required: [first recommended_action]
```

## Обработка ошибок

- Агент терпит неудачу на шаге 2: сообщите пользователю, остановите конвейер, отобразите необработанную ошибку.
- Агент терпит неудачу на шаге 3+: покажите частичные результаты и отметьте, на каком этапе произошел сбой.
- Файл журнала не найден: «Файл [путь] не найден. Укажите действительный путь или вставьте содержимое журнала».

## Смета стоимости

| Этап | Модель | Типичные токены |
|-------|-------|----------------|
| log-ingestor | хайку | ~2K |
| anomaly-detector | сонет | ~3K |
| risk-classifier | сонет | ~2K |
| threat-reporter | сонет | ~3K |
| **Итого** | | **~10K** |

Для больших файлов журналов (> 10 000 строк) сборщик журналов может использовать до 20 000 токенов.

## Пример использования

```
/cyber-defense-team /var/log/nginx/access.log
/cyber-defense-team /tmp/auth.log
```
