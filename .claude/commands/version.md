---
name: version
description: "Отобразить текущий справочник и версии Claude Code"
---

# Информация о версии

Отображение информации о текущей версии руководства и отслеживаемой версии Claude Code.

## Что отображать

```
Claude Code Ultimate Guide
├─ Guide Version:        X.Y.Z (from VERSION file)
├─ Claude Code Tracked:  vA.B.C (from claude-code-releases.yaml)
├─ Last CC Update:       YYYY-MM-DD
├─ Templates:            N files
├─ Quiz Questions:       N questions
├─ Guide Lines:          ~N lines
└─ Landing Synced:       ✅ Yes / ❌ No

Recent Guide Updates:
- [Date]: Version X.Y.Z-1 → X.Y.Z (reason)
- [Date]: Version X.Y.Z-2 → X.Y.Z-1 (reason)
- [Date]: Version X.Y.Z-3 → X.Y.Z-2 (reason)

Recent Claude Code Releases:
- vA.B.C (YYYY-MM-DD): [2-3 highlights]
- vA.B.C-1 (YYYY-MM-DD): [2-3 highlights]
- vA.B.C-2 (YYYY-MM-DD): [2-3 highlights]
```

## Файлы для чтения

1. `VERSION` — версия руководства
2. `machine-readable/claude-code-releases.yaml` — версия CC + дата
3. `CHANGELOG.md` - Последние 3 обновления руководства
4. `machine-readable/claude-code-releases.yaml` — последние 3 выпуска CC
5. Запустите `find examples/ -type f ! -name README.md ! -name index.html | wc -l` — количество шаблонов
6. Запустите `jq '. | length' questions.json` - подсчёт викторины
7. Запустите `wc -l guide/ultimate-guide.md | awk '{print $1}'` — направляющие линии
8. Запустите `./scripts/check-landing-sync.sh` - Статус синхронизации.

## Выходной формат

Используйте чистое, читаемое форматирование с помощью смайлов для наглядности:

```
📊 Claude Code Ultimate Guide - Version Info

📦 Guide Version: 3.9.11
🔧 Claude Code: v2.1.14 (2026-01-21)

📈 Content Stats:
   • Templates:      65 files
   • Quiz Questions: 227 questions
   • Guide Lines:    ~11,560 lines

🔄 Landing Sync: ✅ Synchronized

📝 Recent Guide Updates:
   • 2026-01-20 - v3.9.10 → v3.9.11: Production Safety Rules
   • 2026-01-19 - v3.9.9 → v3.9.10: DevOps & SRE Guide (FIRE)
   • 2026-01-18 - v3.9.8 → v3.9.9: Documentation improvements

🚀 Recent Claude Code Releases:
   • v2.1.14 (2026-01-21)
     - History-based autocomplete in bash mode
     - Plugin search and SHA pinning
     - Context window + memory fixes

   • v2.1.12 (2026-01-18)
     - Message rendering bugfix

   • v2.1.11 (2026-01-17)
     - MCP connection optimization
```

## Выполнение

1. Прочтите все необходимые файлы
2. Выполнение команд оболочки для подсчета
3. Разбор YAML для выпусков CC
4. Разобрать CHANGELOG для получения обновлений руководства.
5. Форматирование вывода с правильным выравниванием
6. Дисплей с четкой визуальной иерархией
