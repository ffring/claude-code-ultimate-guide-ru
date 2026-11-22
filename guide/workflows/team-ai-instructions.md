---
title: "Управление инструкциями команды AI"
description: "Масштабируйте CLAUDE.md в команде из нескольких разработчиков с помощью сборки модулей на основе профилей."
tags: [workflow, team, claude-md, configuration]
---

# Управление инструкциями командного ИИ

Управляйте инструкциями ИИ (CLAUDE.md, .cursorrules) внутри команды без фрагментации.

**Pattern**: сборка модулей на основе профилей, общие модули, профили для каждого разработчика и автоматический ассемблер.

**Когда использовать**: команда разработчиков из 5+, несколько инструментов искусственного интеллекта (Claude Code + Cursor/Windsurf), смешанная ОС.
**Пропустить if**: Индивидуальный разработчик, однородная команда (тот же инструмент, та же ОС), короткий проект (<3 месяцев).

---

## Проблема: фрагментация N x M x P

Когда команда растет, инструкции ИИ быстро фрагментируются:

| Фактор | Ценности | Пример |
|--------|--------|---------|
| Разработчики **N** | 5-20 | Алиса, Боб, Чарли... |
| **M инструменты** | 2-4 | Claude Code, Курсор, Виндсерфинг, Второй пилот |
| **P операционные системы** | 2-3 | macOS, Linux, WSL |

**Всего вариантов**: N x M x P = 5 x 3 x 2 = **30 возможных конфигураций**.

Без системы что происходит:

```
Week 1: Team agrees on shared CLAUDE.md
Week 3: Alice adds TypeScript strict rules locally
Week 5: Bob copies Alice's file, removes half the rules
Week 8: New hire Charlie gets Bob's outdated copy
Week 12: 5 developers, 5 different CLAUDE.md files, nobody knows what's canonical
```

**Основная причина**: CLAUDE.md рассматривается как монолитный файл, а не как составная конфигурация.

---

## <a name="architecture-overview"></a>Обзор архитектуры

```
profiles/                    modules/
├── alice.yaml               ├── core-standards.md
├── bob.yaml                 ├── git-workflow.md
├── charlie.yaml             ├── typescript-rules.md
│                            ├── test-conventions.md
│                            ├── macos-paths.md
│                            ├── linux-paths.md
│                            ├── cursor-rules.md
│                            └── communication-verbose.md
│
├── skeleton/
│   └── claude-skeleton.md   ← Template with {{MODULE:name}} placeholders
│
└── sync-ai-instructions.ts  ← Reads profile → injects modules → writes output
        │
        ▼
output/
├── alice/CLAUDE.md          ← Generated (read-only)
├── bob/CLAUDE.md
└── charlie/CLAUDE.md
```

**Flow**: Профиль (YAML) + Скелет (шаблон) + Модули (фрагменты) → Ассемблер → Сгенерированный CLAUDE.md

---

## Этап 1. Проведите аудит вашего текущего CLAUDE.md.

**Goal**: Классифицируйте каждую строку как универсальную, условную или личную.

```markdown
# Audit template

## Universal (all devs, all tools)
- Architecture: hexagonal
- Tests: must pass before PR
- Naming: kebab-case for files

## Conditional (depends on tool or OS)
- Cursor: use @filename syntax → module: cursor-rules
- macOS paths: /opt/homebrew → module: macos-paths
- Linux paths: /usr/local → module: linux-paths

## Personal (individual preference)
- Style: verbose explanations → profile preference
- Language: French comments → profile preference
```

**Команда для измерения**:
```bash
wc -l CLAUDE.md  # Total lines before modularization
# Tag each line with [U]niversal, [C]onditional, [P]ersonal
# Count by category to estimate module split
```

**Типичный результат**: 60% универсальные, 25% условные, 15% личные.

---

## Этап 2: Извлечение модулей

**Goal**: один файл `.md` на каждую тематическую группу.

**Рекомендуемая структура**:

```
modules/
├── core-standards.md         # Architecture, naming, patterns (all devs)
├── git-workflow.md           # Git conventions (all devs)
├── typescript-rules.md       # TS strict config (if TypeScript)
├── test-conventions.md       # Testing patterns (all devs)
├── macos-paths.md            # macOS-specific paths (if macOS)
├── linux-paths.md            # Linux paths (if Linux)
├── cursor-rules.md           # Cursor-specific rules (if Cursor)
└── communication-verbose.md  # Verbose explanation style (if preferred)
```

**Формат модуля** (каждый модуль представляет собой отдельный фрагмент Markdown):

```markdown
<!-- modules/typescript-rules.md -->
## TypeScript Rules

- Use strict mode: `"strict": true` in tsconfig
- Prefer `type` over `interface` for unions
- No `any` — use `unknown` + type guards
- Zod for runtime validation at boundaries
```

**Guidelines**:
- Сохраняйте модули автономными (без перекрестных ссылок между модулями)
- 15-50 строк на модуль — оптимальное решение.
- Назовите модули для своего домена, а не для своей аудитории.
- Один модуль = одна причина для изменений

---

## Этап 3. Создайте профили разработчиков.

**Goal**: по одному YAML на каждого разработчика со списком их модулей.

```yaml
# profiles/alice.yaml
name: "Alice"
os: "macos"
tools:
  - claude-code
  - cursor
communication_style: "concise"
modules:
  core:
    - core-standards
    - git-workflow
    - typescript-rules
    - test-conventions
  conditional:
    - macos-paths          # auto-included when os: macos
    - cursor-rules         # auto-included when cursor in tools
preferences:
  language: "english"
```

**Правила профиля**:
- Модули `core`: включены для каждого разработчика (стандарты команды).
- Модули `conditional`: включены на основе полей `os` и `tools`.
- `preferences`: персональные настройки, внедренные в переменные скелета.

**Шаблон для новых членов команды**: см. [profile-template.yaml](../../examples/team-config/profile-template.yaml).

---

## Этап 4. Написание ассемблерного сценария.

**Goal**: Скрипт, который читает профиль, внедряет модули и выводит CLAUDE.md.

```typescript
// sync-ai-instructions.ts (simplified ~30 lines)
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';

const profile = parse(readFileSync(`profiles/${process.argv[2]}.yaml`, 'utf8'));
let skeleton = readFileSync('skeleton/claude-skeleton.md', 'utf8');

// Collect modules from profile
const modules = [...profile.modules.core, ...profile.modules.conditional];

// Replace each placeholder with module content
for (const mod of modules) {
  const content = readFileSync(`modules/${mod}.md`, 'utf8');
  skeleton = skeleton.replace(`{{MODULE:${mod}}}`, content);
}

// Remove unused placeholders
skeleton = skeleton.replace(/\{\{MODULE:\w+\}\}/g, '');

// Write output
const outDir = `output/${process.argv[2]}`;
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'CLAUDE.md'), skeleton);
console.log(`Generated ${outDir}/CLAUDE.md (${modules.length} modules)`);
```

**Run**:
```bash
npx ts-node sync-ai-instructions.ts alice   # Single dev
npx ts-node sync-ai-instructions.ts --all   # Generate all profiles
npx ts-node sync-ai-instructions.ts --check # Verify no drift
```

Полный шаблон: [sync-script.ts](../../examples/team-config/sync-script.ts).

---

## Этап 5: Обнаружение дрейфа CI

**Goal**: перехват, когда выходные файлы не синхронизированы с profiles/modules..

```yaml
# .github/workflows/ai-instructions-check.yml
name: AI Instructions Drift Check
on:
  push:
    paths:
      - 'modules/**'
      - 'profiles/**'
      - 'skeleton/**'
  schedule:
    - cron: '0 9 * * 1-5'  # Weekdays at 9am

jobs:
  check-drift:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx ts-node sync-ai-instructions.ts --check
      - name: Fail if drift detected
        run: |
          if git diff --quiet output/; then
            echo "No drift detected"
          else
            echo "::error::AI instructions are out of sync!"
            git diff output/
            exit 1
          fi
```

**Что он обнаруживает**:
- Модуль был отредактирован, но ассемблер не был перезапущен.
- Профиль был добавлен, но выходных данных CLAUDE.md не существует.
- Разработчик вручную отредактировал сгенерированный CLAUDE.md.

**Policy**: созданные файлы доступны только для чтения. Все изменения проходят через profiles/modules, затем перезапускаем ассемблер.

---

## Этап 6. Привлечение новых разработчиков

**Goal**: Новый разработчик получает свой CLAUDE.md менее чем за 5 минут.

```bash
# 1. Clone repo
git clone <repo>

# 2. Copy profile template
cp examples/team-config/profile-template.yaml profiles/dave.yaml
# Edit: name, os, tools, modules

# 3. Generate
npx ts-node sync-ai-instructions.ts dave

# 4. Install
cp output/dave/CLAUDE.md .claude/CLAUDE.md
```

Напоминание о размещении **CLAUDE.md**:
- Для всего проекта: `project/CLAUDE.md` (обязательно, для командных совещаний)
- Персональные переопределения: `.claude/CLAUDE.md` (gitignored, для индивидуальных предпочтений)

---

## <a name="troubleshooting"></a>Поиск неисправностей

| Проблема | Причина | Исправить |
|---------|-------|-----|
| Сгенерированный файл слишком длинный | Включено слишком много модулей | Обзор профиля: удаление редко используемых модулей |
| На выходе отсутствует модуль | Опечатка заполнителя в скелете | Проверьте, что `{{MODULE:name}}` соответствует имени файла. |
| Предупреждение о дрейфе CI | Вывод не восстанавливается после редактирования модуля | Запустите `sync-ai-instructions.ts` и зафиксируйте |
| У разработчика A есть правила, которых нет у разработчика B | Ожидаемо, в этом суть | Убедитесь, что профиль верен для этого разработчика. |
| Устаревший вывод после слияния | Слияние не вызвало регенерацию | Запустите ассемблер после слияния (добавьте git-хук) |

---

## Пороги масштабирования

| Размер команды | Подход |
|-----------|----------|
| 1-2 разработчика | Общий CLAUDE.md + правила приоритета ([Раздел 3.4](#34-precedence-rules)) |
| 3-5 разработчиков, одни и те же инструменты | Опционально: только модули, без профилей |
| 5+ разработчиков или мультиинструмент | Сборка модуля на основе профиля (этот рабочий процесс) |
| 20+ разработчиков | Рассмотрим конфигурационный сервер CLAUDE.md + изменения модуля на основе PR. |

---

## Результаты измерений

От производственной команды (5 разработчиков, 3 инструмента, 2 ОС):

| Метрика | До | После |
|--------|--------|-------|
| Строки по CLAUDE.md | ~380 (монолитный) | ~185 (в сборе) |
| Сокращение токенов | N/A | На 59% меньше потребляемого контекста |
| Модули извлечены | 0 | 12 |
| Время регистрации | "копировать чей-то файл" | 5 мин (шаблон + генерация) |
| Инциденты с дрифтом | Еженедельно | 0 (CI ловит) |

---

## Связанный

- [AI Шаблоны проектирования: Фасад](../core/ai-design-patterns.md#facade): почему файл CLAUDE.md является контекстом, который считывает модель, а не обязательным фасадом
- [Memory Systems](../core/memory-systems.md): как Claude Code загружает и объединяет CLAUDE.md между сеансами
- [Раздел 3.5 Конфигурация команды в Scale](#35-team-configuration-at-scale): обзор концепции и измеренные результаты
- [Раздел 3.4. Правила приоритета](#34-precedence-rules): как Claude читает несколько файлов CLAUDE.md
- [profile-template.yaml](../../examples/team-config/profile-template.yaml): шаблон профиля
- [claude-skeleton.md](../../examples/team-config/claude-skeleton.md): шаблон скелета
- [sync-script.ts](../../examples/team-config/sync-script.ts): полный ассемблерный скрипт.
