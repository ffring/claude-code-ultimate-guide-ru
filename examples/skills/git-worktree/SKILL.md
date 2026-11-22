---
name: git-worktree
description: "Создавайте изолированные рабочие деревья git для разработки функций без переключения ветвей."
argument-hint: "<branch_name> [--from <base>]"
effort: medium
when_to_use: "Use when starting feature work that needs isolation from main workspace."
disable-model-invocation: true
---

# Настройка рабочего дерева Git

Создавайте изолированные рабочие деревья git для разработки функций без переключения ветвей.

**Основной принцип:** Умный выбор каталога + оптимизация символических ссылок + фоновая проверка = быстрая и надежная изоляция.

**Требуется:** Git 2.5.0+ (июль 2015 г.)

**Сопутствующие команды:** [`/git-worktree-status`](../../commands/git-worktree-status.md) | [`/git-worktree-remove`](../../commands/git-worktree-remove.md) | [`/git-worktree-clean`](../../commands/git-worktree-clean.md)

## Процесс

1. **Проверить имя ветки**: проверить соглашение об именах и конфликты.
2. **Проверьте существующие каталоги**: `.worktrees/` или `worktrees/`
3. **Verify .gitignore**: убедитесь, что каталог рабочего дерева игнорируется.
4. **Создать рабочее дерево**: `git worktree add`
5. **Symlink Dependency**: повторное использование `node_modules/` из основного рабочего дерева.
6. **Определить поставщика базы данных**: проверить возможность ветвления БД.
7. **Install Dependency**: автоматическое обнаружение менеджера пакетов (если нет символических ссылок)
8. **Запустить фоновую проверку**: проверка типа + тесты в фоновом режиме
9. **Расположение отчета**: подтвердите готовность с помощью статуса

## Флаги

| Флаг | Эффект |
|------|--------|
| `--fast` | Пропустить установку зависимостей и базовые тесты |
| `--isolated` | Свежая установка `node_modules` (без символической ссылки) |
| `--skip-install` | Пропустить установку зависимостей, сохранить базовые тесты |

## Проверка названия ветки

```bash
# Auto-prefix based on naming convention
# "auth" → "feat/auth" (default prefix)
# "fix/login-bug" → kept as-is
# "refactor/db-layer" → kept as-is

# Accepted prefixes: feat/, fix/, refactor/, chore/, docs/, test/, perf/
# If no prefix → default to feat/

# Reject invalid characters
echo "$BRANCH_NAME" | grep -qE '^[a-zA-Z0-9/_-]+$' || exit 1

# Check branch doesn't already exist
git show-ref --verify --quiet "refs/heads/$BRANCH_NAME" && echo "Branch already exists" && exit 1
```

## Выбор каталога

### Приоритетный порядок

```bash
# 1. Check existing directories
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative

# 2. Check CLAUDE.md for preference
grep -i "worktree.*director" CLAUDE.md 2>/dev/null

# 3. Ask user if neither exists
```

**Если оба существуют:** `.worktrees/` побеждает.

## Проверка безопасности

**Для локальных каталогов проекта:**

```bash
# Check if directory in .gitignore
grep -q "^\.worktrees/$" .gitignore || grep -q "^worktrees/$" .gitignore
```

**Если НЕ в .gitignore:**
1. Добавить строку в .gitignore
2. Зафиксируйте изменение
3. Приступаем к созданию рабочего дерева

**Почему критично:** Предотвращает случайное сохранение содержимого рабочего дерева.

## Этапы создания

```bash
# 1. Detect project name
project=$(basename "$(git rev-parse --show-toplevel)")

# 2. Create worktree with new branch
git worktree add .worktrees/$BRANCH_NAME -b $BRANCH_NAME

# 3. Navigate
cd .worktrees/$BRANCH_NAME
```

## Оптимизация зависимостей (node.js)

**Поведение по умолчанию:** Символическая ссылка `node_modules` из основного рабочего дерева во избежание дублирования установок (сохраняется ~30 с).

```bash
# Symlink node_modules (default, unless --isolated)
if [ -d "../../node_modules" ] && [ ! "$ISOLATED" = true ]; then
  ln -s "$(cd ../.. && pwd)/node_modules" node_modules
  echo "Symlinked node_modules from main worktree"
fi

# With --isolated: fresh install
if [ "$ISOLATED" = true ]; then
  pnpm install   # or npm/yarn based on lockfile detection
fi
```

**Когда использовать `--isolated`:**
- Изменения схемы, требующие разных версий пакета
- Тестирование обновлений зависимостей
- Отладка проблем `node_modules`

## Настройка автоматического обнаружения (многостековый)

```bash
# Node.js (if not symlinked)
if [ -f package.json ] && [ ! -L node_modules ]; then
  pnpm install   # Detect from lockfile: pnpm-lock.yaml / yarn.lock / package-lock.json
fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

## Проверка данных

**Вместо блокировки полного набора тестов запустите проверку в фоновом режиме:**

```bash
# Create log directory
mkdir -p .worktree-logs

# Background type check (Node.js)
if [ -f tsconfig.json ]; then
  npx tsc --noEmit > .worktree-logs/typecheck.log 2>&1 &
  echo "Type check running in background (check with /git-worktree-status)"
fi

# Background test run
if [ -f package.json ]; then
  npx vitest run --reporter=json > .worktree-logs/tests.log 2>&1 &
  echo "Tests running in background (check with /git-worktree-status)"
fi
```

**С `--fast`:** Пропустить все проверки.

## Итоговый отчет

```
Worktree ready at <full-path>
Branch: feat/auth (created from main)
Dependencies: symlinked from main worktree
Background checks: type check + tests running
Check status: /git-worktree-status

Ready to implement <feature-name>
```

## Предложение ветки базы данных

**После создания рабочего дерева определите поставщика базы данных и предложите изоляцию.**

### Краткий справочник команд

| Поставщик | Предлагаемая команда |
|----------|-------------------|
| **Неон** | `neonctl branches create --name <branch> --parent main` |
| **PlanetScale** | `pscale branch create <db> <branch>` |
| **Локальный Postgres** | `psql -c "CREATE SCHEMA <schema>;"` |
| **Другое** | Ручная настройка или общая БД |

**Пример вывода:**

```
Worktree created at .worktrees/feat/auth

DB Isolation: neonctl branches create --name feat-auth --parent main
   Then update .env with new DATABASE_URL
   Full guide: ../workflows/database-branch-setup.md
```

### Настройка .worktreeinclude

**Критично для переменных среды:**

```bash
# .worktreeinclude (at project root)
.env
.env.local
.env.development
**/.claude/settings.local.json
```

**Почему:** Без этого файлы `.env` не будут копироваться в рабочие деревья.

### Когда создавать ветку базы данных

| Сценарий | Создать филиал? |
|----------|---------------|
| Миграции схемы | Да |
| Рефакторинг модели данных | Да |
| Исправлена ​​ошибка (без изменения схемы) | Нет |
| Эксперименты с производительностью | Да |

**См.:** [Руководство по настройке ветки базы данных](../../workflows/database-branch-setup.md) для получения полной информации о рабочих процессах.

## <a name="quick-reference"></a>Шпаргалка

| Ситуация | Действие |
|-----------|--------|
| `.worktrees/` существует | Используйте его (проверьте .gitignore) |
| `worktrees/` существует | Используйте его (проверьте .gitignore) |
| Оба существуют | Используйте `.worktrees/` |
| Ни того, ни другого не существует | Проверьте CLAUDE.md, затем спросите пользователя |
| Не в .gitignore | Добавить + зафиксировать немедленно |
| Нет префикса ветки | Автопрефикс с `feat/` |
| проект Node.js | Симлинк `node_modules` по умолчанию |
| Флаг `--fast` | Пропустить установку + тесты |
| Флаг `--isolated` | Свежая установка `node_modules` |
| Неон обнаружен | Предложить `neonctl branches create` |
| PlanetScale обнаружен | Предложить `pscale branch create` |
| Нет.worktreeinclude | Создать с помощью шаблона `.env` |

## Распространенные ошибки

**Пропуск проверки .gitignore**
- Содержимое рабочего дерева отслеживается, загрязняет статус git

**Предполагая расположение каталога**
- Следуйте приоритету: существующий > CLAUDE.md > спросить

**Установка полных узлов node_modules в каждом рабочем дереве**
- Трата диска и времени. Используйте символическую ссылку по умолчанию, `--isolated` только при необходимости.

**Не копировать .env в рабочее дерево**
- Признак: Claude выходит из строя с сообщением «DATABASE_URL не найден».
- Исправлено: добавьте `.env` в `.worktreeinclude`.

**Использование общей базы данных для изменения схемы**
- Признак: конфликты миграции, нарушенная среда разработки.
- Исправлено: создайте ветку базы данных перед изменением схемы.

## Использование

```
/git-worktree auth
/git-worktree fix/session-bug
/git-worktree feature/new-api --fast
/git-worktree refactor/db-layer --isolated
```

Название ветки: $ARGUMENTS