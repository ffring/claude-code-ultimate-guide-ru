# Оценка: «Встроенная поддержка рабочего дерева git Claude Code» — LinkedIn Гийом Муанье

**Дата оценки**: 22 февраля 2026 г.
**оценщик**: Claude Code (авто)
**Ressource**: сообщение LinkedIn Гийома Муанье

---

## Метадонне

| Чемпион | Валер |
|-------|--------|
| **Источник** | Сообщение LinkedIn о Гийоме Муанье, 22 февраля 2026 г. |
| **Автор** | Гийом Муанье — Решение Architecture/Advocacy @ Upsun, технический спикер |
| **Авторите** | Praticien (под Anthropic) — Архитектор решений с опытом внедрения |
| **Категория** | Производительность — рабочие деревья + субагенты |
| **Статья** | https://lnkd.in/gCicQRHP (статья «Персонал на рабочих деревьях») |
| **Отношения** | Дополнение к [2026-02-22-boris-cherny-worktree-tips-reddit.md](./2026-02-22-boris-cherny-worktree-tips-reddit.md) |

---

## 📄 Резюме содержания

- **Комбинированные субагенты + рабочие деревья**: Claude могут создавать рабочие деревья для собственных субагентов — массовые параллельные миграции без конфликтов описания
- **`isolation: worktree` объявлен** (v2.1.50): в определениях агента, а также в дополнительных указаниях для каждого приложения.
- **Hooks `WorktreeCreate`/`WorktreeRemove`**: Setup/teardown пользовательская система управления версиями → **, не поддерживающая git SCM, поддержка** (Perforce, SVN и т. д.)
- **Отображается на**: CLI (`--worktree`), настольное приложение, IDE — отдельное CLI
- **Подробная статья**: Собственная статья о рабочих деревьях (lnkd.in/gCicQRHP)

---

## 🔍 Уточняющие версии

Атрибут Гийома для версии 2.1.50 — это неточное описание:

| Особенность | Реальная версия |
|---------|----------------|
| `--worktree` / `-w` CLI флаг | **v2.1.49** (2026-02-20) |
| `isolation: "worktree"` субагенты для заливки | **v2.1.49** (2026-02-20) |
| Хуки `WorktreeCreate`/`WorktreeRemove` | **v2.1.50** (2026-02-21) |
| `isolation: worktree` объявлен в определениях агента | **v2.1.50** (2026-02-21) |
| Поддержка рабочего стола + IDE | **v2.1.50** (подтверждено) |

---

## 🎯 Оценка актуальности

**Score: 3/5** (дополнение — не является оправданием независимой интеграции)

**Justification**: Автономная публикация контента достаточна для позднего раздела. Sa valeur est dans les **deltas** по взаимопониманию с основной оценкой:
1. Хуки `WorktreeCreate`/`WorktreeRemove` → не-git SCM (не кувертные переключатели)
2. `isolation: worktree` объявлен в определениях агента (точная версия v2.1.50)
3. Рабочий стол подтверждения + IDE (по сравнению с CLI только в дополнительной оценке)
4. Статья вне ссылки

---

## ⚖️ Дельта против принципа оценки (Борис Черный Reddit)

| Аспект | Reddit/Tweet | LinkedIn Гийом | В гиде |
|--------|-------------|-------------------|---------------|
| `--worktree` CLI | ✅ | ✅ | ❌ руководитель направления |
| Субагенты + рабочие деревья | Эвоке | **Подробнее (параллельные миграции)** | ❌ |
| Хуки `WorktreeCreate`/`WorktreeRemove` | ❌ | **✅ Не-git SCM** | ❌ |
| `isolation: worktree` декларативный | ❌ | **✅** | ❌ |
| Рабочий стол + IDE (как CLI) | ❌ | **✅** | ❌ |
| Внешняя ссылочная статья | ❌ | **✅** | ❌ |

---

## 📍Рекомендуется интеграция

**Полная интеграция в основной принцип.** Добавлен в раздел мемов `guide/ultimate-guide.md:13408`:

```markdown
#### Subagents + Worktree Isolation

Claude can spin up worktrees for its own subagents. Declare isolation directly in agent definitions:

```yaml
# .claude/agents/migration-agent.md
---
isolation: worktree   # Each invocation gets its own worktree (v2.1.50+)
background: true
---
```

Это обеспечивает безопасную для записи параллельную миграцию: 4 агента выполняют рефакторинг различных модулей,
никаких конфликтов слияния, поскольку каждый работает в своей собственной копии.
```

**Aussi**: Ajouter une note sur les hooks `WorktreeCreate`/`WorktreeRemove` dans la section hooks du guide (non-git SCM use case).

---

## ✅ Fact-check

| Affirmation | Vérifiée | Source |
|-------------|----------|--------|
| `WorktreeCreate`/`WorktreeRemove` hooks en v2.1.50 | ✅ | `guide/core/claude-code-releases.md` ligne 30-31 |
| `isolation: worktree` déclaratif en v2.1.50 | ✅ | `guide/core/claude-code-releases.md` ligne 32 |
| `--worktree` en v2.1.49 (pas v2.1.50) | ✅ | `guide/core/claude-code-releases.md` ligne 53 |
| Support Desktop + IDE | ✅ (implicite) | v2.1.50 notes |
| Non-git SCM via hooks | ✅ | `WorktreeCreate`/`WorktreeRemove` hook events |
| Article Guillaume: lnkd.in/gCicQRHP | ⚠️ | URL LinkedIn raccourcie — non vérifié directement |

---

## 🎯 Décision finale

- **Score final**: 3/5
- **Action**: **Intégrer comme complément**: pas de section séparée, enrichit l'intégration de l'éval principale
- **Nouveaux éléments à ajouter au guide**:
  1. `isolation: worktree` déclaratif dans agent defs (YAML example)
  2. `WorktreeCreate`/`WorktreeRemove` hooks → section hooks
  3. Mention Desktop + IDE support
  4. Article Guillaume comme référence externe
