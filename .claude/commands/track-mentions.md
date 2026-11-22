---
name: track-mentions
description: "Найдите в Интернете новые упоминания о Claude Code Ultimate Guide и обновите трекер."
argument-hint: "[--add-all | --dry-run]"
---

# Рабочий процесс отслеживания упоминаний

Найдите в Интернете новые упоминания о полном руководстве Claude Code (GitHub + cc.bruniaux.com) и обновите `docs/media-mentions/mentions.yaml`.

## Использование

```
/track-mentions            # Search + report new mentions, confirm before adding
/track-mentions --dry-run  # Search + report only, no YAML changes
/track-mentions --add-all  # Search + add all found mentions automatically
```

## Шаг 1. Загрузите существующий трекер

Прочтите `docs/media-mentions/mentions.yaml`, чтобы получить:
- Текущее количество `meta.total_mentions`
- Все существующие поля `url` → создайте набор дедупликации.

## Шаг 2. Проведите глубокое исследование Perplexity.

Используйте `mcp__perplexity__perplexity_deep_research` с `reasoning_effort: "high"` и этим запросом
(НЕ упоминайте конкретные даты или «последние 30 дней» — вызывает отказ в предоставлении информации о дате):

```
Find all articles, blog posts, newsletters, Reddit threads, Twitter/X posts, LinkedIn posts,
YouTube videos, podcasts, GitHub issues/repos, and directories that mention "Claude Code
Ultimate Guide" by Florian Bruniaux (GitHub: FlorianBruniaux/claude-code-ultimate-guide,
website: cc.bruniaux.com). Search broadly for third-party content only — exclude the GitHub
repo itself and cc.bruniaux.com own pages.

For each result provide: URL, publication date if available, author/platform name, language,
and one sentence on how they reference the guide.

Also search explicitly for:
- "cc.bruniaux.com" cited as a resource on third-party sites
- "claude-code-ultimate-guide florian bruniaux" in blog posts and tutorials
- "FlorianBruniaux" in dev tutorials referencing the guide
- The guide mentioned in non-English content (French, Spanish, German, Korean, Portuguese, etc.)
```

**Если Perplexity не возвращает результатов** (модель отказывается ссылаться на ограничение знаний), вернитесь к
WebSearch с этими параллельными запросами:
```
"claude code ultimate guide" -site:github.com -site:cc.bruniaux.com 2026
site:reddit.com "cc.bruniaux.com" OR "claude code ultimate guide"
site:dev.to OR site:hashnode.com OR site:medium.com "claude code ultimate guide" "florian" OR "bruniaux"
"claude code ultimate guide" twitter OR x.com
```
Затем используйте `WebFetch` для каждого URL-адреса-кандидата, чтобы убедиться, что руководство явно упомянуто по имени или URL-адресу.

## Шаг 3. Дедупликация

За каждый результат от Perplexity:
1. Нормализовать URL-адрес (очистить косую черту в конце, домен в нижнем регистре)
2. Проверьте существующие URL-адреса в YAML.
3. Пропустить, если уже отслеживается

## Шаг 4. Сообщите о новых упоминаниях

Отобразите таблицу для ознакомления:

```
New mentions found: N

| # | Platform | Author | Title | URL | Date |
|---|----------|--------|-------|-----|------|
| 1 | article  | ...    | ...   | ... | ...  |
```

Если `--dry-run`: остановитесь здесь, никаких изменений.

## Шаг 5: Добавьте в YAML (если --dry-run)

Для каждого нового упоминания (все если `--add-all`, иначе запрашивайте подтверждение для каждого элемента):

1. Назначить следующий последовательный идентификатор (дополненный нулями до 3 цифр)
2. Выведите `platform` из исходного типа:
   - Blog/newsletter → `article`
   - reddit.com → `reddit`
   - linkedin.com/posts/* (собственный профиль florian-bruniaux) → `linkedin-own`
   - linkedin.com/posts/* (другое) → `linkedin-other`
   - twitter.com / x.com → `twitter`
   - youtube.com → `video`
   - github.com/issues или github.com/discussions → `forum`
   - news.ycombinator.com → `forum`
   - Кураторский список/реестр/каталог → `directory`
   - podcasts.apple.com / Spotify.com → `podcast`
   - instagram.com → `instagram`
3. Установите `reach: unknown` (если количество просмотров не отображается во фрагменте)
4. Установить `status: active`
5. Установить `first_seen: <today's date>`
6. Напишите запись в YAML под соответствующим комментарием раздела.

## Шаг 6. Обновите мета

- Увеличить `meta.total_mentions` на количество добавленных записей.
- Установите `meta.last_updated` на сегодняшнюю дату.

## Шаг 7. Обновите таблицу статистики README.

Пересчитайте записи по платформам и обновите таблицу статистики в `docs/media-mentions/README.md`.

## Шаг 8: Подтвердите

```bash
git add docs/media-mentions/
git commit -m "docs: track-mentions — add N new mentions (YYYY-MM-DD)"
```

## Примечания

- Пропускать собственные свойства (страницы cc.bruniaux.com, сам репозиторий GitHub, профиль FlorianBruniaux)
- Пропускать упоминания, в которых руководство цитируется только по смыслу или контексту, а не по имени или URL-адресу.
- В неоднозначных случаях (руководство не названо, но имеется URL-адрес) добавьте с примечанием
- Если Perplexity обнаружит 0 новых упоминаний, сообщите: «С момента последнего запуска новых упоминаний не обнаружено».