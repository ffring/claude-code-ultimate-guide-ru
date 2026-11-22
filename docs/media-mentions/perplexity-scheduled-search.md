# Плановый поиск публичных упоминаний

Используйте эту подсказку для еженедельного запланированного поиска Perplexity. Поиск предназначен только для обнаружения: локальный
Навык `source-command-track-mentions` проверяет, дедуплицирует и применяет принятых кандидатов позже.

## Запланированное приглашение

```text
Search the public web for third-party references to Florian Bruniaux's active public projects,
especially Claude Code Ultimate Guide, Claude Cowork Guide, StarMapper, CCBoard,
CC-Copilot Bridge, ctxharness, Dep Scope, flow-lean, Google Search Console MCP,
Claude Code Plugins, CC-Sessions, cc-skill-usage, YouTube Video Insights,
AgentSec Triage, and GitHub Roast TPC.

Search articles, newsletters, podcasts, YouTube, Reddit, Hacker News, LinkedIn, X,
GitHub repositories and discussions, package or MCP registries, automated directories,
translations, adaptations, and mirrors. Search broadly on every run because pages may be
indexed late. Exclude Florian Bruniaux's own sites, repositories, and social posts from
third-party totals.

Confirm a result only when the page, public metadata, or indexed snippet contains an explicit
project name, canonical repository slug, or official domain. A generic title such as
"ultimate Claude Code guide" is not evidence.

Return exactly three sections:
1. new_confirmed
2. already_tracked
3. rejected_or_unverified

For every result return: canonical URL, title, author, platform, publication date when available,
language, project, identifier found, evidence location, classification, confidence, metadata
problems, and one sentence describing the reference.

Classifications: editorial, social, forum, translation, mirror, adoption, registry,
automated_directory.

Do not treat directory counters, token counts, trust scores, saves, or repository stars as
audience measurements. Flag stale install commands, package names, content counts, authorship,
or capabilities. Do not modify a repository or publish a result.
```

## Обзор контракта

1. Экспортируйте или вставьте запланированный результат в задачу руководства.
2. Запустите `/track-mentions --dry-run` против `mentions.yaml` и `review-queue.yaml`.
3. Проверьте каждый URL-адрес `new_confirmed` независимо.
4. Добавляйте недоступных кандидатов в очередь на рассмотрение.
5. Отклонять конфликты заголовков и принадлежащих им свойств.
6. Применяйте только те записи, которые явно одобрены пользователем.
7. Запустите `python3 scripts/check-media-mentions.py`.
8. Фиксируйте только тогда, когда был запрошен `/track-mentions --commit`.

Запланированный поиск никогда не владеет источником истины. `mentions.yaml` и каталог портфолио есть.
