---
name: sync
description: "Проверьте статус синхронизации guide/landing"
---

# Проверка синхронизации

Запустите комплексную проверку синхронизации между хранилищем руководств и целевой площадкой.

## Что проверить

Выполните `./scripts/check-landing-sync.sh` и отобразите результаты с расширенным форматированием.

## Выходной формат

```
🔄 Guide ↔ Landing Synchronization Check

═══════════════════════════════════════════════════════════

1️⃣ Guide Version
   Guide:   3.9.11
   Landing: 3.9.11
   Status:  ✅ Synchronized

2️⃣ Templates Count
   Guide Files:      65
   Landing (index):  65
   Landing (examples): 65
   Status:  ✅ Synchronized

3️⃣ Quiz Questions
   Source (JSON):     227
   Landing (index):   227
   Landing (quiz):    227
   Status:  ✅ Synchronized

4️⃣ Guide Lines
   Actual Count:      11,560
   Landing Display:   11,000+ (approximate)
   Status:  ✅ Within Tolerance

5️⃣ Claude Code Version
   Releases YAML:     v2.1.14
   Landing Badge:     v2.1.14
   Status:  ✅ Synchronized

═══════════════════════════════════════════════════════════

✅ All Components Synchronized

No action required. Guide and landing site are in sync.
```

## Если обнаружено несоответствие

```
🔄 Guide ↔ Landing Synchronization Check

═══════════════════════════════════════════════════════════

1️⃣ Guide Version
   [... as above ...]

2️⃣ Templates Count
   Guide Files:      65
   Landing (index):  63
   Landing (examples): 65
   Status:  ⚠️ MISMATCH

3️⃣ Quiz Questions
   [... etc ...]

═══════════════════════════════════════════════════════════

❌ Synchronization Issues Detected (1 issue)

Issues to Fix:

1. Templates Count Mismatch
   Location: claude-code-ultimate-guide-landing/index.html
   Current:  63
   Expected: 65
   Action:   Update badge and meta tags with correct count

Quick Fixes:
   # Update landing templates count
   cd /Users/florianbruniaux/Sites/perso/claude-code-ultimate-guide-landing
   # Edit index.html lines: 6, 9, 188, 204, 455
   # Change "63 templates" → "65 templates"
   git add index.html
   git commit -m "fix: sync templates count (63 → 65)"
   git push

Recommended:
   Run /update-infos-release to automate synchronization
```

## Выполнение

1. Выполнить скрипт проверки синхронизации
2. Захват выходных данных и анализ кодов состояния
3. Форматируйте результаты с четкой визуальной иерархией
4. Если обнаружены проблемы:
   - Перечислите каждое несоответствие
   - Укажите расположение файлов
   - Предложите точные исправления
   - Рекомендовать команды автоматизации
5. Цветовые индикаторы состояния
6. Добавьте действенные следующие шаги

## Связанные команды

- `/update-infos-release` — автоматическая синхронизация + управление версиями
- `/version` - Просмотр текущих версий
- `/changelog` — просмотр последних записей CHANGELOG.
