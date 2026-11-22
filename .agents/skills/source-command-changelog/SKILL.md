---
name: "source-command-changelog"
description: "Просмотр последних записей CHANGELOG"
---

# source-command-changelog

Используйте этот навык, когда пользователь просит запустить перенесенную исходную команду `changelog`.

## Шаблон команды

# Просмотрщик журнала изменений

Отобразить последние записи из CHANGELOG.md с дополнительным ограничением количества.

## Использование

```
/changelog       # Show last 5 entries (default)
/changelog 10    # Show last 10 entries
/changelog all   # Show all entries
```

## Что отображать

Прочтите `CHANGELOG.md` и извлеките последние записи версии N с помощью:
- Номер версии
- Дата выпуска
- Все разделы (Добавлено, Изменено, Исправлено и т.д.)
- Полное содержание каждого раздела

## Выходной формат

```
📋 Recent CHANGELOG Entries

═══════════════════════════════════════════════════════════

## [3.9.11] - 2026-01-20

### Added
- Production Safety Rules (Section 14.3)
  - Critical safety practices for production deployments
  - Rollback procedures and monitoring guidelines

### Documentation
- Enhanced deployment workflow documentation
- Added safety checklist templates

═══════════════════════════════════════════════════════════

## [3.9.10] - 2026-01-19

### Added
- DevOps & SRE Guide with FIRE Framework
  - Fault tolerance patterns
  - Incident response protocols
  - Recovery procedures
  - Escalation guidelines

### Documentation
- New Section 9.18: DevOps & SRE Practices
- 45+ operational best practices

═══════════════════════════════════════════════════════════

[... more entries ...]

───────────────────────────────────────────────────────────
Showing 5 of N total entries
Use /changelog 10 for more, or /changelog all for complete history
```

## Выполнение

1. Читать CHANGELOG.md
2. Анализ записей с использованием регулярного выражения: `## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})`
3. Извлечение содержимого между заголовками версий
4. Ограничить до N записей (по умолчанию 5)
5. Формат с четкими разделителями
6. Добавить нижний колонтитул с общим количеством

## Специальное обращение

- Пропустить раздел `[Unreleased]`, если он присутствует вверху.
- Грамотно обрабатывайте пропущенные даты
- Сохранять форматирование уценки в описаниях
- Показать иерархию разделов (###, пункты списка)
