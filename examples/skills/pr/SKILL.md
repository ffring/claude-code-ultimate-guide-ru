---
name: pr
description: "Анализируйте изменения, выявляйте проблемы с содержанием и создавайте хорошо структурированный PR."
argument-hint: "[--base <branch>] [--draft]"
effort: medium
when_to_use: "Use when ready to open a PR: analyzes changes and drafts the PR description."
disable-model-invocation: true
---

# Создать запрос на включение

Анализируйте изменения, выявляйте проблемы с объемом и создавайте хорошо структурированный PR в соответствии с соглашениями проекта.

## Процесс

1. **Анализ изменений**: вычисление оценки сложности на основе файлов, коммитов и каталогов.
2. **Обнаружение проблем с объемом.**: предупреждение, если PR слишком велик или смешивает несвязанные изменения.
3. **Предложить разделение**: При необходимости сгруппируйте коммиты по объему и предложите отдельные PR.
4. **Собрать информацию**: запросить тип, целевую ветку, статус черновика, метки.
5. **Создать контент**: создать TLDR + описание + контрольный список
6. **Create PR**: выполнить `gh pr create` с правильным форматированием.
7. **Напомнить о последующих действиях**: Отобразить контрольный список после PR (SonarQube, обзор Claude)

## Оценка сложности

Рассчитайте сложность PR, чтобы определить необходимость разделения:

| Критерий | Масса | Описание |
|-----------|--------|-------------|
| Файлы кода | x2 | `*.ts, *.tsx` (исключая тесты) |
| Тестовые файлы | x0.5 | `*.test.ts, *.spec.ts` |
| Конфигурационные файлы | x1 | `*.json, *.yml, *.md` |
| Каталоги | x3 | Отдельные каталоги `src/*` |
| фиксирует | x1 | Количество коммитов |

**Пороги**: 0–15 ✅ Нормальный | 16-25 ⚠️ Большой | 26+ 🔴 Рекомендуется Сплит

## Согласованность объема

| Шаблон | Вердикт |
|---------|---------|
| Единая область применения | ✅ ОК |
| Связанные области (сеансы + календарь) | ✅ ОК |
| Несвязанные области (платежи + аутентификация) | 🔴 Сплит |
| подвиг + исправить тот же объем | ✅ ОК |
| подвиг + исправление различных прицелов | 🔴 Сплит |

## Разделить формат предложения

Если рекомендуется разделение, отобразите:

```
🔴 Scope trop large (score: 32)

Commits par scope :
├── payments (5 commits, 8 fichiers)
│   ├── feat(payments): add Stripe checkout
│   └── fix(payments): handle currency
│
└── notifications (3 commits, 6 fichiers)
    └── feat(notifications): add email templates

💡 Suggestion :
1. PR #1 : feature/payments-stripe → Commits payments
2. PR #2 : feature/notifications → Commits notifications

Options :
[A] Continuer avec une seule PR (non recommandé)
[B] Découper (semi-auto - commandes git fournies)
[C] Voir détail fichiers
```

**Полуавтоматическое разделение** предоставляет команды копирования и вставки:
```bash
git checkout develop
git checkout -b feature/payments-stripe
git cherry-pick abc1234 def5678
git push -u origin feature/payments-stripe
```

## Вопросы, которые стоит задать

1. **Type**: функция | исправить | технология | документы | безопасность
2. **Target Branch**: Показать последние ветки (разработка, основная, другие).
3. **Draft**: Да (НЗП) | Нет (готово к рассмотрению)
4. **Labels**: в зависимости от типа + опционально (критическое изменение, безопасность)

## Формат PR-заголовка

```
<type>(<scope>): <description>
```

Examples:
- `feat(payments): add Stripe checkout integration`
- `fix(sessions): resolve timezone calculation bug`

## Шаблон тела PR

```markdown
## TLDR
<!-- 2 lines max - Executive summary -->

---

## Type
{Feature | Fix | Tech | Docs | Security}

## Description
{Context and changes}

## Technical Changes
{List of main modifications}

## Tests
- [ ] Unit tests added/passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows conventions
- [ ] No console.log left
- [ ] Types OK (`pnpm typecheck`)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Доступные этикетки

| Этикетка | Цвет | Использовать, когда |
|-------|-------|----------|
| `feature` | 🟢 | Новый функционал |
| `fix` | 🔴 | Исправление ошибки |
| `tech` | 🔵 | Рефакторинг, технический долг |
| `docs` | 📘 | Только документация |
| `security` | 🟣 | Исправление безопасности |
| `breaking-change` | ⚫ | Критические изменения |
| `WIP` | 🟡 | В разработке (проект) |

## Команды для выполнения

```bash
# 1. Get base branch (usually develop)
BASE_BRANCH="develop"

# 2. Calculate complexity score
CODE=$(git diff --name-only $BASE_BRANCH..HEAD | grep -E '\.(ts|tsx)$' | grep -v test | wc -l)
TESTS=$(git diff --name-only $BASE_BRANCH..HEAD | grep -E '\.test\.|\.spec\.' | wc -l)
DIRS=$(git diff --name-only $BASE_BRANCH..HEAD | cut -d'/' -f1-2 | sort -u | wc -l)
COMMITS=$(git rev-list --count $BASE_BRANCH..HEAD)
SCORE=$((CODE * 2 + TESTS / 2 + DIRS * 3 + COMMITS))

# 3. Get scopes from commits
git log --oneline $BASE_BRANCH..HEAD --format="%s" | sed -n 's/^\w*(\([^)]*\)).*/\1/p' | sort | uniq -c

# 4. Recent branches for selection
git branch --sort=-committerdate --format='%(refname:short)' | head -5

# 5. Create PR
gh pr create \
  --title "<type>(<scope>): <description>" \
  --body "$BODY" \
  --base $BASE_BRANCH \
  --label "<label>" \
  --draft  # if WIP
```

## Пост-PR выход

После создания PR ВСЕГДА отображайте:

```
✅ PR créée : https://github.com/org/repo/pull/XXX

📋 Prochaines étapes automatiques :
   • SonarQube analysera la qualité du code (bugs, vulnérabilités, code smells)
   • Claude Code Review fournira un feedback IA sur votre PR

⏳ Pensez à surveiller ces analyses dans les prochaines minutes.
   Si des problèmes sont détectés, corrigez-les avant de demander une review humaine.
```

## Краевые случаи

| Ситуация | Поведение |
|-----------|----------|
| Нет объема в коммитах | Анализировать по каталогам |
| Нетрадиционные коммиты | Предупредить + спросить, введите вручную |
| Никаких коммитов (то же, что и базовый) | Ошибка: «Изменение Aucun» |
| Одиночный коммит | Использовать сообщение о фиксации в качестве заголовка |
| Объединить коммиты | Игнорировать (`--no-merges`) |

## Использование

```
/pr
/pr --base main
/pr --draft
```

Цель: $ARGUMENTS (необязательно: --base, --draft)
