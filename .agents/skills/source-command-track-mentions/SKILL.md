---
name: "source-command-track-mentions"
description: "Найдите в Интернете новые упоминания о Claude Code Ultimate Guide или публичном портфолио проектов Флориана Бруньо и обновите соответствующий трекер."
---

# source-command-track-mentions

Используйте этот навык, когда пользователь просит запустить перенесенную исходную команду `track-mentions`.

## Шаблон команды

# Рабочий процесс отслеживания упоминаний

Найдите в Интернете новые упоминания о полном руководстве Claude Code или о более широком портфолио общедоступных проектов.
Каталог путеводителей находится по адресу `docs/media-mentions/mentions.yaml`. Межпроектный каталог живет в
`~/Sites/perso/florian-portfolio/src/data/mentions.json`.

## Использование

```
/track-mentions            # Search + report new mentions, confirm before adding
/track-mentions --dry-run  # Search + report only, no YAML changes
/track-mentions --scheduled # Unattended report-only run, equivalent to --dry-run
/track-mentions --add-all  # Add all confirmed results after explicit approval in this session
/track-mentions --all-projects # Search the active GitHub portfolio and update the portfolio catalog
/track-mentions --commit   # Commit only the validated tracker files after an approved update
```

`--scheduled` всегда побеждает флаги записи. Запланированный запуск не должен редактировать файлы, создавать фиксации,
push, откройте запрос на включение или опубликуйте обновление трекера.

## Шаг 1. Загрузите существующий трекер

Для режима руководства по умолчанию прочтите `docs/media-mentions/mentions.yaml`, чтобы получить:
- Текущее количество `meta.total_mentions`
- Все существующие поля `url` → создайте набор дедупликации.
- `docs/media-mentions/review-queue.yaml` → оставлять недоступных кандидатов в ожидании и исключать отклоненные URL-адреса.

Для `--all-projects`:

1. Прочтите общедоступный профиль `FlorianBruniaux` GitHub и перечислите активные репозитории, принадлежащие этой учетной записи.
2. Исключите форки, репозитории только для целевой аудитории, репозитории поддержки, такие как `homebrew-tap` и RTK.
3. Прочтите `~/Sites/perso/florian-portfolio/src/data/mentions.json`, чтобы получить отслеживаемые проекты, исходные URL-адреса,
   и существующие многопроектные задания.
4. Считайте один канонический URL-адрес одним источником, даже если он называет несколько проектов.

## Шаг 2. Проведите глубокое исследование Perplexity.

Используйте `mcp__perplexity__perplexity_research` с `reasoning_effort: "high"`. Добавьте нормализованные URL-адреса
из подтвержденного каталога и очереди проверки как `<KNOWN_URLS>`. Широкий поиск при каждом запуске вместо
при условии, что еженедельное временное окно захватывает страницы, проиндексированные поздно.

```
Find all articles, blog posts, newsletters, Reddit threads, Twitter/X posts, LinkedIn posts,
YouTube videos, podcasts, GitHub issues/repos, and directories that mention "Claude Code
Ultimate Guide" by Florian Bruniaux (GitHub: FlorianBruniaux/claude-code-ultimate-guide,
website: cc.bruniaux.com). Search broadly for third-party content only - exclude the GitHub
repo itself and cc.bruniaux.com own pages.

Return exactly three groups:
- `new_confirmed`: evidence is accessible and contains an explicit project identifier
- `already_tracked`: canonical URL matches `<KNOWN_URLS>`
- `rejected_or_unverified`: title collision, inaccessible evidence, owned property, or uncertain attribution

For each result provide: canonical URL, publication date if available, author/platform name, language,
project identifier found, evidence location, one sentence on how the source references the guide,
classification, confidence, and metadata problems.

Also search explicitly for:
- "cc.bruniaux.com" cited as a resource on third-party sites
- "claude-code-ultimate-guide florian bruniaux" in blog posts and tutorials
- "FlorianBruniaux" in dev tutorials referencing the guide
- The guide mentioned in non-English content (French, Spanish, German, Korean, Portuguese, etc.)

Known canonical URLs for deduplication:
<KNOWN_URLS>
```

**Если Perplexity не возвращает результатов** (модель отказывается ссылаться на ограничение знаний), вернитесь к
WebSearch с этими параллельными запросами:
```
"Claude Code Ultimate Guide" -site:github.com -site:cc.bruniaux.com
site:reddit.com "cc.bruniaux.com" OR "Claude Code Ultimate Guide"
site:dev.to OR site:hashnode.com OR site:medium.com "Claude Code Ultimate Guide" "florian" OR "bruniaux"
"Claude Code Ultimate Guide" twitter OR x.com
```
Затем используйте `WebFetch` для каждого URL-адреса-кандидата, чтобы убедиться, что руководство явно упомянуто по имени или URL-адресу.

Считайте результат подтвержденным только в том случае, если сама страница, ее общедоступные метаданные или проиндексированный фрагмент
содержит хотя бы один идентификатор проекта: имя руководства, пул канонического репозитория или
`cc.bruniaux.com`. Соответствующего общего названия, такого как «полное руководство по Claude Code», недостаточно.

Классифицируйте каждый подтвержденный результат, прежде чем сообщать о нем:
- `editorial`: статья, информационный бюллетень, подкаст или видео с независимыми комментариями.
- `social`: стороннее сообщение в LinkedIn, X, Instagram или Facebook.
- `forum`: Reddit, Hacker News, форум или обсуждение сообщества.
- `translation`: переведенный или адаптированный репозиторий, в котором указан оригинал.
- `mirror`: скопированное или переизданное содержимое руководства.
- `adoption`: сторонний репозиторий явно встраивает, настраивает или использует проект.
- `registry`: запись в реестре пакета или протокола, подтверждающая покрытие распространения.
- `automated_directory`: сгенерированный индекс, каталог, каталог MCP или служба документации репозитория.

Не учитывайте собственные страницы проекта, собственные публикации автора в социальных сетях, сгенерированные страницы тем GitHub.
из собственных метаданных репозитория или параметров реферального запроса, как заработанные сторонние упоминания.
Держите автоматические каталоги отдельно от органических упоминаний. Пометить неправильные команды установки пакета
имена, количество звезд, количество строк, авторство или возможности вместо того, чтобы молча копировать их.

## Шаг 3. Дедупликация

За каждый результат от Perplexity:
1. Нормализовать URL-адрес (очистить косую черту в конце, домен в нижнем регистре)
2. Проверьте существующие URL-адреса в YAML.
3. Проверьте ожидающие и отклоненные URL-адреса в `review-queue.yaml`.
4. Устраните очевидные перенаправления и сравните канонический пункт назначения.
5. Пропустить, если уже отслеживается
6. Держите недоступных кандидатов в ожидании; никогда не рекламируйте их только на основе повторяющегося фрагмента

## Шаг 4. Сообщите о новых упоминаниях

Отобразите таблицу для ознакомления:

```
New mentions found: N

| # | Kind | Platform | Author | Title | Evidence | Metadata issues | URL | Date |
|---|------|----------|--------|-------|----------|-----------------|-----|------|
| 1 | ...  | ...      | ...    | ...   | Confirmed | None          | ... | ...  |
```

После таблицы укажите отдельные подсчеты:
- органические упоминания: `editorial`, `social` и `forum`.
- адаптации: `translation` и `mirror`
- видимое внедрение: `adoption`
- зона распространения: `registry`
- автоматизированные индексы: `automated_directory`

Перечислите вероятных или недоступных кандидатов отдельно. Никогда не добавляйте их в качестве подтвержденных записей без
одобрение пользователя и явное примечание о неопределенности.

Если `--dry-run` или `--scheduled`: остановитесь здесь, никаких изменений.

## Шаг 5. Добавьте в соответствующий каталог (если --dry-run).

В режиме по умолчанию добавьте записи в `docs/media-mentions/mentions.yaml`, используя приведенные ниже правила.

В режиме `--all-projects` добавьте одну запись в портфель JSON с массивом `projects`, содержащим все
явно указанный идентификатор проекта и явный `group`. Никогда не дублируйте источник для подсчета итогов по проекту.
больше. Добавить недавно обнаруженный активный проект в массив `projects` верхнего уровня, даже если он проверен.
количество упоминаний равно нулю.

Написание требует явного одобрения пользователя в текущем интерактивном сеансе. `--add-all` не в счет
как одобрение при воспроизведении с помощью автоматизации. За каждое одобренное новое упоминание:

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

Run:

```bash
python3 scripts/check-media-mentions.py
```

Не выполняйте фиксацию, если идентификаторы, канонические URL-адреса, итоговые значения, платформы или границы очереди проверки не прошли проверку.

## Шаг 9. Принимайте обязательства только по запросу

Без `--commit` сообщить об измененных файлах и остановиться. При использовании `--commit` подключайте только проверенный трекер.
файлы. Никогда не используйте широкий `git add` в «грязном» рабочем дереве.

```bash
git add docs/media-mentions/mentions.yaml docs/media-mentions/README.md docs/media-mentions/review-queue.yaml
git commit -m "docs: track-mentions - add N new mentions (YYYY-MM-DD)"
```

## Примечания

- Пропускать собственные свойства (страницы cc.bruniaux.com, сам репозиторий GitHub, профиль FlorianBruniaux)
- Пропускать упоминания, в которых руководство цитируется только по смыслу или контексту, а не по имени или URL-адресу.
- Поместите неоднозначные или недоступные случаи в `review-queue.yaml`; не добавляйте их в `mentions.yaml`
- Сохраняйте отклоненные ложные срабатывания в очереди на проверку, чтобы при последующих запланированных запусках они не обнаруживались повторно.
- Если Perplexity обнаружит 0 новых упоминаний, сообщите: «С момента последнего запуска новых упоминаний не обнаружено».
