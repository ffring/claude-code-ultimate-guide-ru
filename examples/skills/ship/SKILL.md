---
name: ship
description: "Комплексная проверка перед развертыванием для обеспечения готовности к выпуску."
argument-hint: "[--no-push] [--changelog-only] [--dry-run]"
effort: medium
when_to_use: "Use when ready to stage, commit, and push the current work."
disable-model-invocation: true
---

# Командование корабля – контрольный список перед развертыванием

Комплексная проверка перед развертыванием для обеспечения готовности к выпуску.

## Цель

Запускайте перед каждым производственным развертыванием, чтобы проверить:
- Ворота качества кода
- Тестовое покрытие
- Проверки безопасности
- Обновления документации
- Готовность окружающей среды

## Контрольный список перед развертыванием

### 🔴 Блокаторы (обязательно пройти)

```bash
# 1. All tests passing
npm test 2>/dev/null || pnpm test 2>/dev/null || yarn test 2>/dev/null
echo "Exit code: $?"

# 2. No TypeScript/lint errors
npm run typecheck 2>/dev/null || npx tsc --noEmit
npm run lint 2>/dev/null || npx eslint .

# 3. Build succeeds
npm run build 2>/dev/null || pnpm build 2>/dev/null

# 4. No secrets in code
grep -rn "API_KEY=\|SECRET=\|PASSWORD=" --include="*.{ts,js,json}" . 2>/dev/null | grep -v node_modules | grep -v ".env.example"
```

### 🟠 Высокий приоритет (должно пройти)

```bash
# 5. Security audit
npm audit --audit-level=high 2>/dev/null || echo "Run manually: npm audit"

# 6. No console.log in production code
grep -rn "console\.log\|console\.debug" --include="*.{ts,js,tsx,jsx}" src/ 2>/dev/null | grep -v "// allowed" | head -10

# 7. No TODO/FIXME in critical paths
grep -rn "TODO\|FIXME\|XXX\|HACK" --include="*.{ts,js}" src/ 2>/dev/null | head -10

# 8. Database migrations ready
[ -d "prisma/migrations" ] && echo "Prisma migrations: $(ls prisma/migrations | wc -l) total"
[ -d "migrations" ] && echo "Migrations: $(ls migrations | wc -l) total"
```

### 🟡 Рекомендуется (приятно иметь)

```bash
# 9. Documentation updated
git diff --name-only HEAD~5 | grep -E "README|CHANGELOG|docs/" | head -10

# 10. Version bumped
cat package.json | jq -r '.version' 2>/dev/null || echo "Check version manually"

# 11. Environment variables documented
[ -f ".env.example" ] && echo "✅ .env.example exists" || echo "⚠️ Missing .env.example"
```

## Выходной формат

---

### 🚀 Отчет о готовности корабля

**Branch**: [текущая ветка]
**Commit**: [короткий хеш HEAD]
**Target**: [production/staging]
**Timestamp**: [date/time]

### Блокировщики (необходимо исправить перед развертыванием)

| Проверять | Статус | Подробности |
|-------|--------|---------|
| Тесты | ✅/❌ | X прошел, Y не прошел |
| TypeScript | ✅/❌ | Х ошибок |
| Ворс | ✅/❌ | X предупреждений, Y ошибок |
| Строить | ✅/❌ | Success/Failed |
| Секреты | ✅/❌ | X потенциальных утечек |

### Высокий приоритет

| Проверять | Статус | Действие |
|-------|--------|--------|
| Аудит безопасности | ⚠️/✅ | Х уязвимостей |
| Журналы консоли | ⚠️/✅ | X найден в src/ |
| TODO | ⚠️/✅ | X критических задач |
| Миграции | ⚠️/✅ | X в ожидании |

### Рекомендуется

| Проверять | Статус | Примечание |
|-------|--------|------|
| Документы обновлены | ⚠️/✅ | ИЗМЕНЕНИЯ обновлены |
| Версия изменена | ⚠️/✅ | Текущий: XYZ |
| Конверт документирован | ⚠️/✅ | .env.example присутствует |

### 📊 Резюме

```
🔴 Blockers:    X/5 passed
🟠 High:        X/4 passed
🟡 Recommended: X/3 passed
─────────────────────────
Overall:        [READY TO SHIP / NOT READY]
```

### 🎯 Предметы действий

1. [Требуется самое критическое исправление]
2. [Второй приоритет]
3. [Третий приоритет]

---

## Проверки, специфичные для окружающей среды

### Развертывание производства

```bash
# Verify production env vars
[ -f ".env.production" ] && echo "Production env exists"

# Check for debug flags
grep -rn "DEBUG=true\|NODE_ENV=development" .env* 2>/dev/null

# Verify API endpoints point to production
grep -rn "localhost\|127\.0\.0\.1" --include="*.{ts,js,json}" src/ 2>/dev/null | grep -v test | head -5
```

### Промежуточное развертывание

```bash
# Staging-specific checks
[ -f ".env.staging" ] && echo "Staging env exists"

# Feature flags for staging
grep -rn "FEATURE_FLAG\|ENABLE_" .env* 2>/dev/null
```

## Интеграция CI/CD

Добавьте в свой конвейер:

```yaml
# GitHub Actions example
ship-check:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run ship checklist
      run: |
        npm ci
        npm test
        npm run typecheck
        npm run lint
        npm run build
        npm audit --audit-level=high
```

## Проверка после развертывания

После развертывания проверьте:

```bash
# 1. Health check
curl -s https://your-app.com/health | jq .

# 2. Version check
curl -s https://your-app.com/version | jq .

# 3. Smoke tests
npm run test:smoke 2>/dev/null || echo "Run smoke tests manually"
```

## Подготовка к откату

Перед отправкой убедитесь, что вы можете выполнить откат:

```bash
# Note current production tag
git describe --tags --abbrev=0

# Verify rollback procedure exists
[ -f "docs/runbooks/rollback.md" ] && echo "✅ Rollback docs exist"

# Check database migration reversibility
# Prisma: prisma migrate diff
# Rails: rails db:rollback (dry-run)
```

## Использование

**Полный контрольный список:**
```
/ship
```

**Производственное развертывание:**
```
/ship --production
```

**Быстрая проверка (только блокировщики):**
```
/ship --quick
```

**С конкретной целью:**
```
/ship --target=staging
```

## <a name="tips"></a>Советы

1. **Запускайте раньше, запускайте часто**: не ждите дня развертывания
2. **Автоматизация в CI**: заставить блокировщики выходить из строя конвейера
3. **Командное соглашение**: определите, что такое блокировка и предупреждение.
4. **Исключения для документов**: если проверка пропущена, укажите, почему
5. **Монитор после развертывания**: Отгрузка не будет завершена, пока мониторинг не подтвердит успех.

## Связанные команды

- `/release-notes` — создание журнала изменений и объявлений.
- `/validate-changes` — проверка кода на основе LLM
- `/security` — Глубокий аудит безопасности

$ARGUMENTS
