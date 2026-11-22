# Оценка: «5 советов по рабочему дереву Claude Code от создателя» — Reddit/Twitter

**Дата оценки**: 22 февраля 2026 г.
**оценщик**: Claude Code (авто)
**Ressource**: Reddit r/ClaudeAI + твит Бориса Черного (@bcherny)

---

## Метадонне

| Чемпион | Валер |
|-------|--------|
| **Первоначальный источник** | Твит @bcherny, 21 февраля 2026 г. · 40,2 тыс. просмотров |
| **Вторичный источник** | Reddit r/ClaudeAI, 164 голоса "за" |
| **Автор** | Борис Черный (создатель и руководитель Claude Code @ Anthropic) |
| **Категория** | Производительность — Рабочие деревья |
| **URL Reddit** | https://www.reddit.com/r/ClaudeAI/comments/1rae05r/ |
| **Оригинальный твит** | https://x.com/bcherny/status/2025007393290272904 |

---

## 📄 Резюме содержания

- **Официальное объявление**: флаг `claude --worktree` / `-w` доступен в CLI (существует на рабочем столе, поддерживается портом в CLI)
- **Modèle concurrent natif**: агент обработки доступен только в изолированном рабочем дереве, без вмешательства между параллельными сеансами
- **Действующие общие шаблоны**: управление портами для каждого рабочего дерева (скрипты, переопределение Docker-Compose, порты), настройка `.claude/settings.json` для каждого рабочего дерева, «основное рабочее дерево как ветвь интеграции».
- **Внешний идентификатор ресурса**: [claude-worktree-hooks](https://github.com/tfriedel/claude-worktree-hooks): автоматическая изоляция портов для `claude --worktree`
- **Обсудите рабочие деревья и мультиклоны**: Рабочие деревья являются частью объекта git (ветви, коммиты, файлы на диске), а другие мультиклоны остаются действительными для незнакомых пользователей.

---

## 🎯 Оценка актуальности

| Счет | Значение |
|-------|---------------|
| 5 | Эссентьель — Большой пробел в руководстве |
| **4** | **Très уместно – значимое улучшение** |
| 3 | Уместно – дополнительная утилита |
| 2 | Маргинальный – вторичная информация |
| 1 | Горизонтальный объем — неуместно |

**Оценка: 4/5**

**Justification**: Трое сходящихся фактов:
1. **Пробел в документе**: `claude --worktree` / `-w` есть в `claude-code-releases.md` (v2.1.49), но больше **отсутствует в главном руководстве** (раздел 13408), который может вызвать уникальность `git worktree add` вручную
2. **Patterns actionnables manquants**: управление портами, настройка settings.json для каждого рабочего дерева, шаблон ветки интеграции — rien de cela в руководстве
3. **Первоначальный автор**: Борис Черный является создателем Claude Code → соответствующее содержание, pas de filtre communautaire не проверено

---

## ⚖️ Сравнительный

| Аспект | Этот ресурс | Путеводитель по Нотру (раздел 13408) |
|--------|----------------|------------------------------|
| `claude --worktree` CLI флаг | ✅ Аннонсе + контекст | ❌ Отсутствие главного гида |
| `git worktree add` руководство | ✅ Mentionné (сравнение) | ✅ Документация с примерами |
| Управление портовыми конфликтами | ✅ Конкретные шаблоны (докер, скрипты, рандомные порты) | ❌ Не скрытно |
| Для каждого рабочего дерева `.claude/settings.json` | ✅ Совет BP041 (7 голосов "за") | ❌ Не скрытно |
| Шаблон ветки интеграции | ✅ Совет BP041 | ❌ Не скрытно |
| 4 пользовательские команды (/git-worktree и т. д.) | ❌ Не упоминается | ✅ Документация |
| Рабочие деревья и компромиссы между несколькими клонами | ✅ Богатые дебаты | ❌ Не скрытно |

---

## 📍Рекомендации по интеграции

**Оценка ≥ 3 → Интегратор**

### Уникальное действие, рекомендуемое

**Fichier**: `guide/ultimate-guide.md`
**Section**: 13408 — «Рабочие деревья Git для параллельной разработки»
**Priorité**: Haute (в течение недели — дата флага 20 февраля 2026 г.)

**Дополнительная информация** (~30-40 строк):

```markdown
#### Using the `--worktree` CLI Flag (v2.1.49+)

Since v2.1.49, Claude Code includes built-in worktree support:

```bash
# Create an isolated worktree automatically
claude --worktree        # or -w (short form)

# Equivalent manual setup
git worktree add ../myproject-feature feature-a && cd ../myproject-feature && claude
```

**Что делает `--worktree`**: Создает временное рабочее дерево git, запускает в нем Claude,
и очищается при выходе, если не было внесено никаких изменений.

**Практические шаблоны:**

**Изоляция портов** (когда службы должны запускаться для каждого рабочего дерева):
- Используйте файлы переопределения docker-compose, автоматически создаваемые при создании рабочего дерева.
- Назначайте случайные порты динамически и вводите их через переменные env.
- См. [claude-worktree-hooks](https://github.com/tfriedel/claude-worktree-hooks) для автоматизации портов.

**Настройка поведения каждого рабочего дерева:**
```bash
# In each worktree, create a .claude/settings.json
# Tighter permissions for refactoring worktrees, looser for exploration
```

**Шаблон ветки интеграции:**
Оставьте одно «основное» рабочее дерево в качестве ветки интеграции.
Сливайтесь с ним только из параллельных рабочих деревьев — никогда не разрабатывайте непосредственно там.
```

**Ne pas créer** de section séparée pour `claude-worktree-hooks` — juste une note de bas de section.

---

## 🔥 Challenge (technical-writer agent)

> *Score 4/5 justifié, mais pour la mauvaise raison. L'argument "créateur = autorité" est biaisé — c'est la convergence (gap documenté + patterns actionnables vérifiables via release v2.1.49 + communauté) qui justifie le score.*
>
> *Plan d'intégration initial trop dispersé (3 points d'entrée). Bonne simplification : une seule extension de la section 13408.*
>
> *Risque de non-intégration : modéré. Le flag est dans les releases (trouvable), mais la section 13408 devient incohérente si elle n'inclut pas la commande native — elle enseigne encore uniquement le git manuel alors que la feature native existe depuis 2 jours.*

- **Score ajusté**: 4/5 (confirmé)
- **Points manqués**: Source primaire = changelog v2.1.49, pas le tweet (le tweet disparaît, le changelog reste)
- **Risques de non-intégration**: Incohérence interne (section 13408 outdated vs releases.md à jour)

---

## ✅ Fact-check

| Affirmation | Vérifiée | Source |
|-------------|----------|--------|
| `claude --worktree` / `-w` existe en v2.1.49 | ✅ | `guide/core/claude-code-releases.md` ligne 53 |
| Boris Cherny = créateur de Claude Code | ✅ | Perplexity (ITPro, Lenny's Newsletter, YouTube) |
| Tweet date: 21 Feb 2026 | ✅ | Screenshot utilisateur |
| 40.2K views sur le tweet | ✅ | Screenshot utilisateur |
| Reddit: 164 upvotes | ✅ | Screenshot utilisateur |
| `claude-worktree-hooks` existe sur GitHub | ⚠️ | Mentionné par u/cygn — non vérifié directement |
| `workmux` existe sur GitHub | ⚠️ | Mentionné par u/philosophical_lens — non vérifié directement |

**Corrections apportées**: Aucune (aucune stat inventée)

**Stats nécessitant vérification externe avant intégration**: Les repos GitHub (`claude-worktree-hooks`, `workmux`) — vérifier existence + activité avant de les mentionner dans le guide.

---

## 🔗 Sources complémentaires

| Source | Apport principal |
|--------|-----------------|
| [LinkedIn Guillaume Moigneu (2026-02-22)](./2026-02-22-guillaume-moigneu-worktree-linkedin.md) | `WorktreeCreate`/`WorktreeRemove` hooks, `isolation: worktree` déclaratif (v2.1.50), support Desktop + IDE, article externe |

**Clarification versions** (Guillaume attribue tout à v2.1.50, incorrect) :
- `--worktree` CLI + `isolation: "worktree"` subagents → **v2.1.49**
- `WorktreeCreate`/`WorktreeRemove` hooks + déclaratif agent defs → **v2.1.50**

---

## 🎯 Décision finale

- **Score final**: 4/5
- **Action**: **Intégrer**
- **Délai recommandé**: Dans la semaine (feature sortie le 2026-02-20)
- **Effort estimé**: ~50-60 lignes dans la section 13408 + ~10 lignes section hooks
- **Confiance**: Haute (confirmé dans nos propres release notes v2.1.49 + v2.1.50)

### Périmètre d'intégration complet (après les deux évals)

1. Section `13408` — ajouter :
   - `claude --worktree` / `-w` native flag avec exemple
   - `isolation: worktree` déclaratif dans agent defs (YAML)
   - Subagents + worktrees pour migrations parallèles
   - Port management patterns (docker-compose override, random ports)
   - Per-worktree `.claude/settings.json` tuning
   - Integration branch pattern
   - Note Desktop + IDE support
2. Section hooks — ajouter `WorktreeCreate`/`WorktreeRemove` (non-git SCM use case)
3. Références externes : `claude-worktree-hooks` + article Guillaume Moigneu (à vérifier avant publication)
