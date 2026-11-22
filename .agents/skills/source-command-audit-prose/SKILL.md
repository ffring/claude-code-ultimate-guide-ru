---
name: "source-command-audit-prose"
description: "Добавьте описательную прозу к пустым разделам в официальных документах (FR + EN), используя 9 параллельных агентов."
---

# source-command-audit-prose

Используйте этот навык, когда пользователь просит запустить перенесенную исходную команду `audit-prose`.

## Шаблон команды

# Проза аудита — Обогащение разделов Bare

Описательная часть прозы (2–4 фразы) из раздела «голых» официальных документов.
Раздел «голый» = заголовок, соответствующий указанию таблицы, блока кода или списка без вводного абзаца.

## Использование

```
/audit-prose        # Tous les WPs (00-08), FR + EN
/audit-prose 07     # WP07 seulement (FR + EN)
/audit-prose 03 07  # WP03 et WP07 seulement
```

## Определение «Голая секция»

Раздел (`##` или `###`) соответствует НАПРАВЛЕНИЮ:
- Одна таблица Markdown (`|`)
- Блок кода Un (` ``` `)
- Список цветов (`-`) или номер

Без параграфа введения (минимум 2 фразы).

## Règles Strictes (необоротные)

1. **NE JAMAIS** завершает абзац, соответствующий `:`, перед началом списка → ошибка Typst, которая объединяет пули в строке
2. **NE PAS** изобретатель символов, метрик и цитат
3. **NE PAS** — средство настройки выносок (`:::`), Mermaid или персональные сценарии
4. **NE PAS** за проход +15% от линий по стоимости
5. Поддерживаются версии **3.27.6**.
6. Проза EN = английская натуральная, **pas** de traduction mot-à-mot du FR
7. Chaque ajout = **минимум 2 фразы, максимум 4 фразы**

## Пример трансформации

```
AVANT :
### Exit Codes
| Code | Signification |
|------|---------------|
| 0    | Autorisé      |

APRÈS :
### Exit Codes
Les hooks communiquent avec Codex via des codes de sortie standardisés.
C'est le mécanisme qui permet de bloquer ou autoriser une action en temps réel,
sans intervention humaine.

| Code | Signification |
|------|---------------|
| 0    | Autorisé      |
```

## Рабочий процесс: 9 агентов Parallèles

### Источники контекста

- `machine-readable/reference.yaml` : отображение объектов → основные линии руководства
- `guide/ultimate-guide.md` : справочное руководство (aux lignes indiquées dans reference.yaml)
- Connaissance Codex (v3.27.6, MCP, хуки, агентские команды и т.д.)

### Сопоставление рабочих мест

| # | фр. | RU | ~Голые разделы |
|---|----|----|----------------|
| 00 | `whitepapers/fr/00-introduction-serie.qmd` | `whitepapers/en/00-series-introduction.qmd` | ~10 |
| 01 | `whitepapers/fr/01-prompts-efficaces.qmd` | `whitepapers/en/01-effective-prompts.qmd` | ~14 |
| 02 | `whitepapers/fr/02-personnalisation.qmd` | `whitepapers/en/02-customization.qmd` | ~18 |
| 03 | `whitepapers/fr/03-securite.qmd` | `whitepapers/en/03-security.qmd` | ~20 |
| 04 | `whitepapers/fr/04-architecture.qmd` | `whitepapers/en/04-architecture.qmd` | ~14 |
| 05 | `whitepapers/fr/05-equipe.qmd` | `whitepapers/en/05-team.qmd` | ~20 |
| 06 | `whitepapers/fr/06-privacy.qmd` | `whitepapers/en/06-privacy.qmd` | ~12 |
| 07 | `whitepapers/fr/07-guide-reference.qmd` | `whitepapers/en/07-reference-guide.qmd` | ~36 |
| 08 | `whitepapers/fr/08-agent-teams.qmd` | `whitepapers/en/08-agent-teams.qmd` | ~16 |

### Исполнение

Аргумент **Si = номер конкретного WP**: агент lancer 1 для уникальности этой пары FR/EN.

**Si pas d'argument (или «все»)**: создайте экипировку `audit-prose-{date}` и 9 параллельных агентов.

Залейте один раз в WP, найдите агента и получите подсказку:

```
Tu es un éditeur technique senior. Ta mission : ajouter de la PROSE DESCRIPTIVE
aux sections "bare" du whitepaper [XX - Titre].

## Définition "bare section"
Section (## ou ###) suivie DIRECTEMENT par une table, un code block, ou une
liste à puces, SANS paragraphe d'introduction (2+ phrases).

## Ce que tu fais
Pour CHAQUE bare section identifiée :
1. Ajouter 2-4 phrases AVANT le contenu structuré
2. Chaque phrase apporte une INFO NOUVELLE : le pourquoi, le quand utiliser,
   les implications, le choix de design, ou le contexte pratique
3. PAS de reformulation de ce qui suit — COMPLETER avec du contexte manquant

## Sources de contexte
- `machine-readable/reference.yaml` : mapping complet sujets → guide principal
- Ta connaissance de Codex (v3.27.6, MCP, hooks, agent teams, etc.)

## Règles strictes
- NE PAS inventer de chiffres, métriques, ou citations
- NE PAS ajouter de callouts (:::), Mermaid, ou scénarios persona
- NE JAMAIS terminer un paragraphe par ":" avant une liste à puces (bug Typst)
- NE PAS dépasser +15% de lignes
- Garder les versions à 3.27.6
- Prose EN = anglais naturel, pas traduction mot-à-mot
- Chaque ajout = minimum 2 phrases, maximum 4 phrases

## Processus
1. LIRE reference.yaml (sections pertinentes au WP)
2. LIRE le WP FR complet
3. IDENTIFIER toutes les bare sections
4. ÉDITER le fichier FR (Edit tool, section par section)
5. LIRE le WP EN complet
6. ÉDITER le fichier EN
7. VÉRIFIER : aucun paragraphe ne finit par ":" avant une liste
8. Rapporter : sections traitées, delta lignes FR/EN
```

### Внимание и отчетность

Посетите возвращение всех агентов. Заливка WP завершена, афиша:

```
WP[XX] ✅ — [N] sections, +[X]% FR/EN
```

### Неисправность

Когда все агенты завершат работу, отправьте команду «shutdown_request» и нажмите TeamDelete.

## Проверка после обогащения

```bash
# 1. Delta lignes (max +15%)
for f in whitepapers/fr/*.qmd; do
  echo "$(wc -l < "$f") $(basename $f)"
done

# 2. Vérifier bug Typst : paragraphe finissant par ":" suivi de liste
grep -n ':$' whitepapers/fr/*.qmd whitepapers/en/*.qmd | head -20

# 3. Versions intactes
grep "^version:" whitepapers/fr/*.qmd whitepapers/en/*.qmd

# 4. Rebuild PDFs
for f in whitepapers/fr/*.qmd whitepapers/en/*.qmd; do
  quarto render "$f"
done
```

## Бюджетные линии по WP

| WP | Максимальный бюджет во Франции | Максимальный бюджет EN |
|----|--------------|--------------|
| 00 | +54 линии | +54 линии |
| 01 | +142 линии | +142 линии |
| 02 | +189 линий | +189 линий |
| 03 | +145 линий | +145 линий |
| 04 | +120 линий | +120 линий |
| 05 | +143 линии | +143 линии |
| 06 | +79 линий | +79 линий |
| 07 | +281 линия | +281 линия |
| 08 | +241 линия | +241 линия |
