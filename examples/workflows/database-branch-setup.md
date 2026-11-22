---
title: "Настройка ветки базы данных с помощью рабочих деревьев"
description: "Руководство по разработке изолированных функций с использованием ветвей базы данных с помощью Neon или PlanetScale"
tags: [workflow, git, devops]
---

# Настройка ветки базы данных с рабочими деревьями

Полное руководство по разработке изолированных функций с использованием ветвей базы данных.

**Source**: на основе [Neon ветвления базы данных](https://neon.com/docs/introduction/branching) и [PlanetScale рабочих процессов ветвления](https://planetscale.com/docs/concepts/branching).

---

## TL;DR (вариант использования 90%)

**Использование неона:**
```bash
/git-worktree feature/auth
cd .worktrees/feature-auth
neonctl branches create --name feature-auth --parent main
# Copy DATABASE_URL from output to .env
pnpm prisma migrate dev
```

Сделанный. Перейдите к примерам рабочих процессов [](#workflow-examples).

---

## Настройка провайдера

### Неон (рекомендуется)

**Установите CLI:**
```bash
npm install -g neonctl
neonctl auth
```

**Создать ветку:**
```bash
neonctl branches create --name <branch-name> --parent main
```

**Получить строку подключения:**
```bash
neonctl connection-string --branch <branch-name>
```

**Обновить .env в рабочем дереве:**
```bash
echo "DATABASE_URL=<connection-string>" > .worktrees/<branch>/.env
```

**Удалить, когда закончите:**
```bash
neonctl branches delete <branch-name>
```

**Strengths:**
- Мгновенное создание ветки (~1 с)
- Настоящее копирование при записи (эффективное хранение)
- Сброс ветки без потери данных
- Отлично CLI

**Limitations:**
- Требуется настройка пула соединений

---

### PlanetScale

**Установите CLI:**
```bash
brew install pscale
pscale auth login
```

**Создать ветку:**
```bash
pscale branch create <database-name> <branch-name>
```

**Connect (создает локальный прокси):**
```bash
pscale connect <database-name> <branch-name> --port 3309
```

**Обновите .env для использования localhost:3309:**
```bash
echo "DATABASE_URL=mysql://root@127.0.0.1:3309/<database-name>" > .worktrees/<branch>/.env
```

**Удалить, когда закончите:**
```bash
pscale branch delete <database-name> <branch-name>
```

**Strengths:**
- Git-подобный рабочий процесс для схемы
- Встроенная разница в схеме
- Запросы на безопасное развертывание

**Limitations:**
- Разная строка подключения для каждой ветки
- Требуется `pscale connect` для локальной разработки.

---

### Локальный Postgres (на основе схемы)

Для проектов без облачной БД:

**Создать схему:**
```bash
psql $DATABASE_URL -c "CREATE SCHEMA <schema-name>;"
```

**Обновите .env для использования схемы:**
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=<schema-name>"
```

**Запуск миграции в схеме:**
```bash
npx prisma migrate deploy
```

**Cleanup:**
```bash
psql $DATABASE_URL -c "DROP SCHEMA <schema-name> CASCADE;"
```

**Strengths:**
- Бесплатно
- Полный контроль

**Limitations:**
- Ручная настройка
- Нет автоматического копирования при записи

---

## Когда использовать ветки базы данных

### <a name="decision-tree"></a>Дерево решений

```
Does feature touch database schema?
├─ No → Use shared database, skip branch creation
└─ Yes → Create database branch
    ├─ Using Neon/PlanetScale? → Use native branching
    ├─ Using local Postgres? → Create dedicated schema
    └─ Other provider? → Consider Docker or shared DB with caution
```

### Таблица сценариев

| Сценарий | Использовать ветку БД? | Обоснование |
|----------|---------------|-----------|
| Добавление миграции базы данных | ✅ Да | Изолировать изменения схемы |
| Рефакторинг модели данных | ✅ Да | Безопасно экспериментировать |
| Тестирование производительности | ✅ Да | Выделенные ресурсы |
| Исправлена ​​ошибка (без изменения схемы) | ❌ Нет | Общая БД в порядке |
| Функция с изменениями схемы | ✅ Да | Избегайте конфликтов |
| Исправление (срочное) | ❌ Нет | Скорость превыше изоляции |

---

## <a name="workflow-examples"></a>Примеры рабочих процессов

### Пример 1. Функция миграции схемы

```bash
# 1. Create worktree + DB branch
/git-worktree feature/add-user-roles
cd .worktrees/feature-add-user-roles

# 2. Create Neon branch
neonctl branches create --name feature-add-user-roles --parent main

# 3. Update .env with new DATABASE_URL
# (Copy from neonctl output)

# 4. Create migration in steps
npx prisma migrate dev --name step1_add_role_column
npx prisma migrate dev --name step2_migrate_existing_users
npx prisma migrate dev --name step3_add_constraints

# 5. Test entire migration sequence
pnpm prisma migrate reset --skip-seed
pnpm prisma migrate deploy
pnpm test

# 6. If successful, merge PR
# 7. Apply to main DB after deploy
```

---

### Пример 2. Эксперименты с моделью данных

```bash
# Try different schemas without commitment
/git-worktree experiment/normalize-addresses
cd .worktrees/experiment-normalize-addresses

# Create DB branch
neonctl branches create --name experiment-normalize-addresses --parent main

# Completely remodel data
# Test with real-ish data
# Compare performance

# If better → merge
# If worse → delete branch (no cleanup needed)
```

---

### Пример 3: Параллельная разработка функций

```bash
# Terminal 1
/git-worktree feature/payments
cd .worktrees/feature-payments
neonctl branches create --name feature-payments --parent main
# DATABASE_URL → feature-payments branch

# Terminal 2
/git-worktree feature/subscriptions
cd .worktrees/feature-subscriptions
neonctl branches create --name feature-subscriptions --parent main
# DATABASE_URL → feature-subscriptions branch

# Both can modify schema independently
# No conflicts until merge
```

---

## Контрольный список

### Прежде чем начать работу в рабочем дереве с изменениями БД:
- [ ] `.worktreeinclude` содержит `.env`
- [ ] Создана ветка базы данных (если провайдер поддерживает это)
- [ ] `.env` в рабочем дереве обновлен новым `DATABASE_URL`
- [ ] Соединение проверено (`npx prisma db execute --stdin <<< "SELECT 1;"`)
- [ ] Применены миграции (`npx prisma migrate dev`)

### После PR-слияния:
- [ ] Рабочее дерево Git удалено
- [ ] Ветка базы данных удалена
- [ ] Никаких потерянных связей

---

## <a name="troubleshooting"></a>Поиск неисправностей

### Проблема: «База данных не найдена» в рабочем дереве.
**Fix:** Убедитесь, что `.env` был скопирован, проверьте настройку `.worktreeinclude`.

### Проблема: миграция влияет на основную базу данных.
**Fix:** Убедитесь, что `DATABASE_URL` указывает на ветку, а не на главную

### Проблема: невозможно создать ветку Neon — «не аутентифицировано».
**Fix:** Запустите `neonctl auth`, чтобы войти в систему.

### Проблема: ветка PlanetScale существует, но не может подключиться.
**Fix:** Используйте прокси-сервер `pscale connect`, не подключайтесь напрямую

### Проблема: «Ветка уже существует»
```bash
# List existing branches
neonctl branches list

# Delete if stale
neonctl branches delete <branch-name> --force
```

### Проблема: миграция не удалась.
```bash
# Reset DB branch to clean state
neonctl branches reset <branch-name> --parent main

# Re-apply migrations
npx prisma migrate deploy
```

---

## Примечания по безопасности

⚠️ **Запомните:**
- Ветви базы данных НЕ находятся в `.gitignore` по умолчанию.
- Добавьте `.env` в `.worktreeinclude`, чтобы учетные данные были скопированы.
- Никогда не совершайте `DATABASE_URL` с реальными учетными данными.
- Используйте разные учетные данные для каждой среды

✅ **Лучшая практика:**
```bash
# .worktreeinclude
.env
.env.local
.env.development

# Each worktree gets copy of credentials
# But each points to different DB branch
```

---

## <a name="advanced-patterns"></a>Расширенные шаблоны

### Шаблон: прогрессивная миграция схемы

```bash
# 1. Create worktree + DB branch
/git-worktree migration/split-user-table
cd .worktrees/migration-split-user-table

# 2. Create migration in steps
npx prisma migrate dev --name step1_add_new_columns
npx prisma migrate dev --name step2_migrate_data
npx prisma migrate dev --name step3_drop_old_columns

# 3. Test entire migration sequence
pnpm prisma migrate reset --skip-seed
pnpm prisma migrate deploy

# 4. If successful, merge PR
# 5. Apply to main DB after deploy
```

### Шаблон: Сравнительный анализ производительности

```bash
# Create worktree with isolated DB
/git-worktree perf/optimize-queries
cd .worktrees/perf-optimize-queries

# DB branch lets you:
# - Add indexes without affecting dev
# - Run load tests safely
# - Compare before/after metrics

# Merge proven optimizations only
```

---

**Связанные руководства:**
- [Git Worktree Справочник команд](../commands/git-worktree.md)
- [Неоновая документация по ветвлению](https://neon.com/docs/introduction/branching)
- [Ветвление в масштабе планеты](https://planetscale.com/docs/concepts/branching)