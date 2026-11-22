---
name: park
description: "Припарковать текущий сеанс для последующего возобновления (добавить в файл Markdown)"
argument-hint: "[session description]"
---

# Парковая сессия

Сохраните информацию о текущем сеансе, чтобы возобновить его после перезагрузки.

## Использование

```
/park fix du bug auth JWT     # description inline
/park                          # will ask for description
```

## Шаг 1: Получите описание

Если `$ARGUMENTS` не пуст → используйте его в качестве описания сеанса.
В противном случае → спросите:

> «Комментарий к этому сеансу? (например: исправление ошибки аутентификации JWT, изменение страницы цен, миграция базы данных)»

## Шаг 2. Выберите файл назначения.

Спросите пользователя, где сохранить:

> «Фикшер пункт назначения?»

Options:
1. `~/Desktop/parked-sessions.md` (по умолчанию, рекомендуется)
2. `~/.claude/parked-sessions.md` (скрыт, всегда доступен)
3. Другое (свободный ввод текста)

Если пользователь просто нажимает Enter → используйте вариант 1.

## Шаг 3. Определите идентификатор сеанса

Запустите эти команды, чтобы найти текущий сеанс:

```bash
# Get current directory encoded path (/ → -, prefixed with -)
PWD_ENCODED=$(pwd | sed 's|/|-|g' | sed 's|^|projects-|' | sed 's|^projects-||')
SESSIONS_FILE="$HOME/.claude/projects/-$(echo "$PWD" | sed 's|/|-|g' | sed 's|^-||')/sessions-index.json"
```

Точнее, путь индекса сеансов Claude:
```
~/.claude/projects/<encoded-pwd>/sessions-index.json
```

Где `<encoded-pwd>` — текущий путь к каталогу, где каждый `/` заменен на `-` (а ведущий `/` становится началом закодированного пути, поэтому `/Users/flo/myproject` → `-Users-flo-myproject`).

**Чтобы определить идентификатор сеанса:**

1. Запустите: `ls -t ~/.claude/projects/ | head -5`, чтобы найти наиболее вероятную папку проекта.
2. Прочтите `sessions-index.json` из соответствующей папки.
3. sessions-index.json содержит массив объектов сеанса — возьмите самый последний (последний в массиве или с самой высокой временной меткой).
4. Извлеките поле сеанса `id` (формат UUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

**Откат в случае сбоя обнаружения.**: используйте в выходных данных `claude --continue` вместо `claude --resume <id>`.

## Шаг 4. Сбор контекста

Запустить параллельно:
```bash
pwd                         # → repo path
git branch --show-current   # → active branch (or "no git" if not a repo)
date "+%Y-%m-%d %H:%M"     # → timestamp
```

## Шаг 5: Запись в файл

**Проверьте, существует ли файл:**
- Если он НЕ существует → создайте его с заголовком: `# Parked Sessions\n\n`.
- Если он существует → допишите до конца (НИКОГДА не перезаписывайте существующий контент)

**Добавьте этот блок Markdown:**

```markdown
## <description>
- **Date** : <YYYY-MM-DD HH:MM>
- **Repo** : <pwd output>
- **Branch** : <git branch or "N/A">
- **Resume** : `cd <pwd> && claude --resume <session-id>`

---
```

Если идентификатор сеанса не был обнаружен, используйте:
```markdown
- **Resume** : `cd <pwd> && claude --continue`
```

## Шаг 6. Отображение сводной информации

Вывод в терминале:

```
Session parkée dans <destination-file>

Pour reprendre :
  cd <pwd> && claude --resume <session-id>
```

Если ранее было припарковано несколько сеансов, напомните: «Содержимое файла содержит N сеансов. Для просмотра всех сеансов: cat <destination-file>»

## Обработка ошибок

| Ошибка | Действие |
|-------|--------|
| Не git-репо | Используйте `N/A` для ветки, продолжайте. |
| sessions-index.json не найден | Используйте `claude --continue` в качестве запасного варианта. |
| Разрешение на запись файла отклонено | Попробуйте `~/.claude/parked-sessions.md` в качестве запасного варианта. |
| sessions-index.json искажен | Используйте `claude --continue` в качестве запасного варианта. |

## Пример вывода (успех)

```
Session parkée dans ~/Desktop/parked-sessions.md

Pour reprendre :
  cd /Users/flo/Sites/perso/mon-projet && claude --resume 84287c0d-8778-4a8d-abf1-eb2807e327a8
```
