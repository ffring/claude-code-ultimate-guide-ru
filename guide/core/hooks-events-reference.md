---
title: "Claude Code Справочник событий перехватчиков: все 33 события, средства сопоставления и схемы"
description: "Полный справочник по всем 33 событиям перехвата Claude Code: поля сопоставления, схемы ввода, контроль принятия решений и значения тайм-аута по умолчанию, с примерами копирования и вставки JSON для каждого события."
tags: [reference, hooks]
---

# Справочник по событиям перехватчиков

Полный справочник по всем 33 событиям перехвата Claude Code: поля сопоставления, схемы ввода, контроль принятия решений и значения тайм-аута по умолчанию. Источник: официальная документация Anthropic (ссылка на[hooks](https://code.claude.com/docs/en/hooks)), проверено на Claude Code v2.1.284.

О навыках аудита см. `examples/skills/eval-hooks/SKILL.md`.

См. также: [Event-Driven Agent Automation](../workflows/event-driven-agents.md) для создания рабочих процессов, управляемых перехватчиками, и [Укрепление безопасности: перехватчики запуска](../security/security-hardening.md#16-startup-hooks-code-execution-before-your-first-prompt), чтобы узнать о рисках выполнения кода через перехватчики.

---

## <a name="quick-reference"></a>Шпаргалка

| Событие | Срабатывает, когда | Поле сопоставления | Может заблокировать? | Тайм-аут по умолчанию |
|-------|-----------|---------------|------------|----------------|
| `SessionStart` | Сеанс начинается или возобновляется | `source` | Нет | 600s |
| `Setup` | `--init-only` или `-p --init/--maintenance` | `trigger` | Нет | 600s |
| `UserPromptSubmit` | Пользователь отправляет запрос | никто | Да | **30s** |
| `UserPromptExpansion` | Команда косой черты расширяется до подсказки | `command_name` | Да | 600s |
| `PreToolUse` | Перед выполнением вызова инструмента | `tool_name` | Да | 600s |
| `PermissionRequest` | Для вызова инструмента требуется решение о разрешении | `tool_name` | Не у выхода 2; JSON `decision` только объект | 600s |
| `PermissionDenied` | Классификатор автоматического режима отклоняет вызов | `tool_name` | Нет (только повторная попытка) | 600s |
| `PostToolUse` | После успешного вызова инструмента | `tool_name` | Нет (stderr для Claude) | 600s |
| `PostToolUseFailure` | После сбоя вызова инструмента | `tool_name` | Нет | 600s |
| `PostToolBatch` | После разрешения полного параллельного пакета | никто | Да (остановка цикла) | 600s |
| `Notification` | Claude отправляет уведомление | `notification_type` | Нет | 600s |
| `MessageDisplay` | Текстовые потоки сообщений Ассистента | никто | Нет | **10s** |
| `SubagentStart` | Субагент, созданный с помощью инструмента «Агент» | `agent_type` | Нет | 600s |
| `SubagentStop` | Субагент отделки | `agent_type` | Да | 600s |
| `TaskCreated` | Задача создается через TaskCreate | никто | Да | 600s |
| `TaskCompleted` | Задача помечается как выполненная | никто | Да | 600s |
| `Stop` | Claude заканчивает отвечать | никто | Да (продолжает поворот) | 600s |
| `StopFailure` | Поворот завершается из-за ошибки API | `error` | Нет (игнорируется) | 600s |
| `TeammateIdle` | Товарищ по команде агента бездействует | никто | Да | 600s |
| `InstructionsLoaded` | CLAUDE.md или файл правил загружен. | `load_reason` | Нет | 600s |
| `ConfigChange` | Изменения файла конфигурации во время сеанса | `source` | Да (не `policy_settings`) | 600s |
| `CwdChanged` | Изменения в рабочем каталоге | никто | Нет | 600s |
| `DirectoryAdded` | Каталог добавлен через `/add-dir` или SDK `register_repo_root`. | `source` | Нет | 600s |
| `FileChanged` | Наблюдаемые изменения файлов на диске | имя файла (буквальное) | Нет | 600s |
| `WorktreeCreate` | Создается рабочее дерево | никто | Да (любое ненулевое значение) | 600s |
| `WorktreeRemove` | Рабочее дерево удаляется | никто | Да (любое ненулевое значение приведет к сбою удаления, если каталог останется) | 600s |
| `PreCompact` | До сжатия контекста | `trigger` | Да | 600s |
| `PostCompact` | После завершения уплотнения | `trigger` | Нет | 600s |
| `PreModelSwitch` | Прежде чем будет применено запрошенное переключение модели | каноническая целевая модель | Да | **30s** |
| `PostModelSwitch` | После изменения модели сеанса, включая автоматические изменения | каноническая целевая модель | Нет | **30s** |
| `Elicitation` | Сервер MCP запрашивает ввод данных пользователем | `mcp_server_name` | Да | 600s |
| `ElicitationResult` | Пользователь отвечает на запрос MCP | `mcp_server_name` | Да | 600s |
| `SessionEnd` | Сеанс завершается | `reason` | Нет | **Бюджет 1.5s** |

**Исключения таймаута**: значение по умолчанию для `command`, `http` и `mcp_tool`, равное 600 с, снижается до 30 с на `UserPromptSubmit`, `PreModelSwitch` и `PostModelSwitch` и до 10 с на `MessageDisplay`. `prompt` перехватывает по умолчанию 30 секунд. `agent` по умолчанию перехватывает значение 60 с. `SessionEnd` имеет общий бюджет 1,5 секунды; каждый хук `timeout` повышает его до максимального настроенного значения, вплоть до 60 с. Таймауты на перехватах плагинов не увеличивают бюджет. Перехватчик `command`, `http` или `mcp_tool` на `PreToolUse` с истекшим временем ожидания не блокирует вызов инструмента; на `PreModelSwitch` он блокирует переключатель.

---

## <a name="matcher-values-by-event"></a>Значения сопоставителя по событию

Поле `matcher` фильтруется по разным полям в зависимости от типа события.

### События инструмента: фильтры сопоставления на `tool_name`

События: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`

Значения: `Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `Agent`, `WebFetch`, `WebSearch`, `AskUserQuestion`, `ExitPlanMode` и MCP, как `mcp__<server>__<tool>`.

Правила сопоставления (все события с поддержкой сопоставления):
- Только буквы, цифры, `_`, `-`, пробелы, `,` и `|`: точная строка или список точных строк, разделенных `|` или `,` (`Edit|Write`, `Edit, Write`). Для дефисов в точном наборе требуется версия 2.1.195 или новее.
- Содержит любой другой символ: незакрепленное регулярное выражение JavaScript (`mcp__memory__.*`). `Edit.*` также соответствует `NotebookEdit`; привязка с помощью `^...$` для совпадения всей строки.
- `"*"`, `""` или отсутствует: соответствует всем.
- `FileChanged` и `StopFailure` используют более узкий точный набор (только буквы, цифры, `_`, `|`); дефис, пробел или запятая удерживают средство сопоставления на пути регулярного выражения.

Чтобы сопоставить каждый инструмент с сервера MCP: `mcp__memory__.*` (требуется `.*`; без него `mcp__memory` является точной строкой и не соответствует ни одному инструменту).

### SessionStart: фильтры сопоставления на `source`

| Ценить | Когда |
|-------|------|
| `startup` | Новая сессия |
| `resume` | `--resume`, `--continue` или `/resume` |
| `clear` | `/clear` |
| `compact` | Автоматическое или ручное уплотнение |
| `fork` | Разветвленная сессия |

### Настройка: фильтры-сопоставители на `trigger`

| Ценить | Когда |
|-------|------|
| `init` | `claude --init-only` или `claude -p --init` |
| `maintenance` | `claude -p --maintenance` |

### SessionEnd: фильтры сопоставления на `reason`

| Ценить | Когда |
|-------|------|
| `clear` | Команда `/clear` |
| `resume` | Интерактивный переключатель `/resume` |
| `logout` | Пользователь вышел из системы |
| `prompt_input_exit` | Вышел, пока был виден ввод подсказки |
| `other` | Другие причины выхода |

`bypass_permissions_disabled` был удален в версии 2.1.234; удалите его из сопоставителей `SessionEnd`.

### Уведомление: фильтры сопоставления на `notification_type`

Значения: `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`, `elicitation_url_dialog`, `elicitation_complete`, `elicitation_response`, `agent_needs_input`, `agent_completed`, `quota_auto_resume_fired`, `quota_auto_resume_stale`, `quota_auto_resume_disabled`

### SubagentStart / SubagentStop: фильтры сопоставления на `agent_type`

Значения: `general-purpose`, `Explore`, `Plan` или пользовательские имена агентов (поле `name` из заголовка агента, а не имя файла).

### PreCompact/PostCompact: фильтры сопоставления на `trigger`

Значения: `manual` (из `/compact`), `auto` (автоматический)

### Инструкции Загружено: фильтры-сопоставители на `load_reason`

Значения: `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`

### ConfigChange: фильтры сопоставления на `source`

Значения: `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills`

### StopFailure: фильтры сопоставления на `error`

Значения: `rate_limit`, `overloaded`, `authentication_failed`, `oauth_org_not_allowed`, `account_on_hold`, `billing_error`, `invalid_request`, `model_not_found`, `server_error`, `max_output_tokens`, `cloud_credential_error` (v2.1.267+), `unknown`

### UserPromptExpansion: фильтры сопоставления на `command_name`

Название вашего навыка или команды, введенное пользователем (без начального `/`).

### Elicitation / ElicitationResult: фильтры сопоставления на `mcp_server_name`

Ваше настроенное имя сервера MCP.

### DirectoryAdded: фильтры сопоставления на `source`.

Значения: `slash_command` (`/add-dir`), `register_repo_root` (запрос управления SDK)

### PreModelSwitch/PostModelSwitch: фильтры сопоставления канонической целевой модели.

Сопоставитель сравнивается с каноническим именем, полученным из `to_model`, игнорируя любой суффикс `[1m]`: `claude-opus-5`, `claude-opus-4-6|claude-opus-5`, `.*opus.*`. Когда Claude Code не может получить каноническое имя (например, пользовательский идентификатор только для шлюза), каждый перехват PreModelSwitch выполняется независимо от сопоставителя, поэтому блокирующий перехват также должен проверять `to_model`.

### FileChanged: matcher = буквальные имена файлов

Разделение на `|`, каждый сегмент регистрируется как буквальное имя файла, просматриваемого в текущем каталоге. Пример: `".envrc|.env"`. В отличие от других событий, здесь не применяются шаблоны регулярных выражений. Это же значение создает список наблюдения И фильтры, которые запускают перехватчики.

### События без поддержки сопоставления

`UserPromptSubmit`, `PostToolBatch`, `Stop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `WorktreeCreate`, `WorktreeRemove`, `CwdChanged`, `MessageDisplay`

Добавление поля `matcher` к этим событиям игнорируется.

---

## <a name="exit-code-2-behavior-per-event"></a>Поведение кода выхода 2 для каждого события

Код выхода 2 — единственный код выхода, который блокирует только код. Claude Code считывает выходные поля JSON из стандартного вывода для каждого кода выхода, а не только 0: для событий, использующих стандартную модель решения, допустимое решение JSON (например, `permissionDecision: "deny"` или `decision: "block"`) вступает в силу с выходом 0 или любым другим кодом, отличным от 2, а выход 2 по-прежнему блокируется, даже если JSON говорит `allow`. Код выхода 1 без действительного JSON является неблокирующей ошибкой: действие продолжается, и в расшифровке появляется первая строка stderr. `WorktreeCreate` и `WorktreeRemove` являются исключениями: любой ненулевой код не подходит для них.

| Событие | Что происходит на выходе 2 |
|-------|------------------------|
| `PreToolUse` | Блокирует вызов инструмента; stderr передается в Claude |
| `PermissionRequest` | Не соблюдается: поток разрешений продолжается без изменений, а поток stderr отбрасывается. Запретить через объект JSON `decision` |
| `UserPromptSubmit` | Блокирует подсказку и удаляет ее из контекста |
| `UserPromptExpansion` | Блокирует расширение |
| `Stop` | Предотвращает остановку; продолжает поворот |
| `SubagentStop` | Предотвращает остановку субагента |
| `TeammateIdle` | Товарищ по команде продолжает работать; stderr вернул ответ |
| `TaskCreated` | Отменяет создание задачи; stderr вернул ответ |
| `TaskCompleted` | Препятствует завершению; stderr вернул ответ |
| `ConfigChange` | Блокирует изменение конфигурации (не `policy_settings`) |
| `PostToolBatch` | Останавливает агентный цикл перед следующим вызовом модели. |
| `PreCompact` | Блокирует уплотнение |
| `Elicitation` | Отрицает выявление |
| `ElicitationResult` | Блокирует реакцию (эффективное действие превращается в упадок) |
| `WorktreeCreate` | **Any** ненулевой код выхода не может быть создан |
| `WorktreeRemove` | **Any** ненулевой код выхода не может быть удален, если после этого каталог все еще существует. |
| `PreModelSwitch` | Блокирует переключение модели и показывает пользователю stderr. |
| `PostModelSwitch` | Показывает stderr только пользователю; модель уже сменилась |
| `PostToolUse` | Показывает stderr для Claude (инструмент уже запущен) |
| `PostToolUseFailure` | Показывает stderr для Claude |
| `StopFailure` | Полностью игнорируется (вывод и код выхода игнорируются) |
| `SessionEnd` | Показывает stderr только пользователю |
| `SessionStart`, `Setup`, `SubagentStart` | Показывает stderr только пользователю |
| `Notification` | Показывает stderr только пользователю |
| `InstructionsLoaded` | Код выхода игнорируется |
| `PermissionDenied` | Код выхода и stderr игнорируются |
| `CwdChanged`, `FileChanged` | Показывает stderr только пользователю |
| `DirectoryAdded` | Stderr обращается к журналу отладки; каталог уже добавлен |
| `PostCompact` | Показывает stderr только пользователю |
| `MessageDisplay` | Исходный текст отображается без изменений |

---

## <a name="decision-control-format-per-event"></a>Формат контроля принятия решений для каждого события

### Поле `decision` верхнего уровня

Используется: `UserPromptSubmit`, `UserPromptExpansion`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `Stop`, `SubagentStop`, `ConfigChange`, `PreCompact`.

```json
{ "decision": "block", "reason": "Explanation" }
```

Действителен только `"block"`. Чтобы разрешить, опустите `decision`. Для `Stop` и `SubagentStop` `reason` становится следующей инструкцией Claude.

### PreToolUse

Использует `hookSpecificOutput` для более широкого управления. Приоритет при конфликте хуков: `deny > defer > ask > allow`.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow | deny | ask | defer",
    "permissionDecisionReason": "Shown to user (allow/ask) or to Claude (deny)",
    "updatedInput": { "field": "new value" },
    "additionalContext": "Context injected next to tool result"
  }
}
```

`defer` работает только в `-p` (неинтерактивном) режиме. Процесс завершается с помощью `stop_reason: "tool_deferred"`, и вызывающий процесс может возобновиться позже. `defer` не работает, когда Claude одновременно вызывает несколько инструментов.

### Премоделсвитч

Код выхода 2 или `decision: "block"` верхнего уровня отменяет переключение. Для более точного управления используйте `hookSpecificOutput.permissionDecision` с `allow`, `deny` или `ask` (без `defer`, `updatedInput` или `additionalContext`).

### Задача создана

Код выхода 2 или `decision: "block"` верхнего уровня отменяет создание задачи. `continue: false` игнорируется.

### Запрос разрешения

Перехватчик, который завершает 2 без объекта `decision`, оставляет поток разрешений неизменным. Только объект `decision` разрешает или запрещает. Перехватчики `agent` в этом событии пропускаются. В сеансах, которые не могут отображать приглашение, таких как фоновые субагенты в режиме `-p`, эти перехватчики все равно выполняются, и вызов отклоняется, если ни один перехватчик не принимает решения.

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionRequest",
    "decision": {
      "behavior": "allow | deny",
      "updatedInput": {},
      "updatedPermissions": [],
      "message": "Reason for deny",
      "interrupt": false
    }
  }
}
```

### Доступ запрещен

Код выхода и stderr игнорируются. Чтобы сигнализировать о повторной попытке:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PermissionDenied",
    "retry": true
  }
}
```

### PostToolUse

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "Context injected next to tool result",
    "updatedToolOutput": { "stdout": "...", "stderr": "", "interrupted": false, "isImage": false }
  }
}
```

`updatedToolOutput` изменяет то, что видит Claude, а не то, что уже выполнено. Должен точно соответствовать выходной форме инструмента. Встроенные инструменты неправильной формы возвращаются к исходной форме.

### РабочеедеревоСоздать

Командные перехватчики выводят абсолютный путь на стандартный вывод. Хуки HTTP возвращают:

```json
{ "hookSpecificOutput": { "hookEventName": "WorktreeCreate", "worktreePath": "/abs/path" } }
```

Любой сбой или отсутствующий путь не позволяют создать рабочее дерево.

### СообщениеДисплей

```json
{
  "hookSpecificOutput": {
    "hookEventName": "MessageDisplay",
    "displayContent": "Replacement text shown on screen"
  }
}
```

Изменяет только то, что появляется на экране. Claude и расшифровка сохраняют оригинал.

### SessionStart (дополнительные поля)

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Context before first prompt",
    "sessionTitle": "branch-or-feature-name",
    "watchPaths": ["/absolute/path/to/watch"],
    "reloadSkills": true,
    "initialUserMessage": "First turn in -p mode"
  }
}
```

`reloadSkills: true` повторно сканирует каталоги навыков после завершения перехвата, поэтому навыки, установленные перехватчиком, доступны сразу же в том же сеансе.

### выявление

```json
{
  "hookSpecificOutput": {
    "hookEventName": "Elicitation",
    "action": "accept | decline | cancel",
    "content": { "field_name": "value" }
  }
}
```

### Результат выявления

Тот же формат, что и выходные данные выявления. Переопределяет то, что отправил пользователь.

### Универсальные поля (все события)

```json
{
  "continue": false,
  "stopReason": "Message shown to user (not Claude)",
  "suppressOutput": true,
  "systemMessage": "Warning shown to user",
  "terminalSequence": "\033]777;notify;Title;Body\007"
}
```

`continue: false` полностью останавливает Claude и имеет приоритет над всеми полями решения.

`terminalSequence`: уведомления на рабочем столе и заголовки окон через последовательности OSC. Ограничено OSC `0/1/2/9/99/777` и BEL. Запись в `/dev/tty` напрямую невозможна, начиная с версии 2.1.139, поскольку перехватчики выполняются без управляющего терминала.

---

## Ключевые поля ввода для каждого события

Все события получают: `session_id`, `transcript_path`, `cwd`, `hook_event_name` и обычно `permission_mode`. Хуки субагента также получают `agent_id` и `agent_type`.

| Событие | Дополнительные поля ввода для конкретного события |
|-------|----------------------------------|
| `SessionStart` | `source`, `model`, опционально `agent_type`, `session_title` |
| `Setup` | `trigger` (`"init"` или `"maintenance"`) |
| `UserPromptSubmit` | `prompt` |
| `UserPromptExpansion` | `expansion_type`, `command_name`, `command_args`, `command_source`, `prompt` |
| `PreToolUse` | `tool_name`, `tool_input`, `tool_use_id` |
| `PermissionRequest` | `tool_name`, `tool_input`, `permission_suggestions` |
| `PermissionDenied` | `tool_name`, `tool_input`, `tool_use_id`, `reason` |
| `PostToolUse` | `tool_name`, `tool_input`, `tool_response`, `tool_use_id`, `duration_ms` |
| `PostToolUseFailure` | `tool_name`, `tool_input`, `tool_use_id`, `error`, `is_interrupt`, `duration_ms` |
| `PostToolBatch` | `tool_calls` (массив с `tool_name`, `tool_input`, `tool_use_id`, `tool_response`) |
| `Notification` | `message`, `title`, `notification_type` |
| `MessageDisplay` | `turn_id`, `message_id`, `index`, `final`, `delta` |
| `SubagentStart` | `agent_id`, `agent_type` |
| `SubagentStop` | `stop_hook_active`, `agent_id`, `agent_type`, `agent_transcript_path`, `last_assistant_message` |
| `TaskCreated` | `task_id`, `task_subject`, `task_description`, `teammate_name`, `team_name` |
| `TaskCompleted` | `task_id`, `task_subject`, `task_description`, `teammate_name`, `team_name` |
| `Stop` | `stop_hook_active`, `last_assistant_message`, `background_tasks`, `session_crons` |
| `StopFailure` | `error`, `error_details`, `last_assistant_message` |
| `TeammateIdle` | `teammate_name`, `team_name` |
| `InstructionsLoaded` | `file_path`, `memory_type`, `load_reason`, `globs`, `trigger_file_path`, `parent_file_path` |
| `ConfigChange` | `source`, `file_path` |
| `CwdChanged` | `old_cwd`, `new_cwd` |
| `DirectoryAdded` | `directory`, `source` |
| `FileChanged` | `file_path`, `event` (`"change"`, `"add"`, `"unlink"`) |
| `WorktreeCreate` | `name` (ссылка для нового рабочего дерева) |
| `WorktreeRemove` | `worktree_path` |
| `PreCompact` | `trigger`, `custom_instructions` |
| `PostCompact` | `trigger`, `compact_summary` |
| `PreModelSwitch` | `from_model`, `to_model`, `requested_model`, `source`, `context_tokens`, `prompt_cache_warm`, `cache_ttl`, `estimated_cache_write_usd`, `pricing` |
| `PostModelSwitch` | То же, что `PreModelSwitch`; `source` добавляет `auto` и `resume`. |
| `Elicitation` | `mcp_server_name`, `message`, `mode`, `url`, `elicitation_id`, `requested_schema` |
| `ElicitationResult` | `mcp_server_name`, `action`, `mode`, `elicitation_id`, `content` |
| `SessionEnd` | `reason` |

---

## Поля обработчика хуков

### Общие поля (все типы)

| Поле | Описание |
|-------|-------------|
| `type` | `command`, `http`, `mcp_tool`, `prompt` или `agent` |
| `if` | Синтаксис правила разрешения для сужения обработчика. Только события инструмента (`PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied`). В любом другом событии перехватчик с набором `if` никогда не запускается. |
| `timeout` | Секунды до отмены. Не применяется при работающем командном перехватчике `async: true`; все еще применяется с `asyncRewake` |
| `statusMessage` | Пользовательское сообщение счетчика во время запуска хука |
| `once` | Запустите один раз за сеанс, затем удалите. Уважается только в описании навыков, игнорируется в файлах настроек. |

### Поля хука команды

| Поле | Описание |
|-------|-------------|
| `command` | Команда оболочки или путь к исполняемому файлу |
| `args` | Вектор аргумента: запускает форму выполнения (оболочка не задействована) |
| `async` | `true` для работы в фоновом режиме без блокировки |
| `asyncRewake` | Как `async: true`, но пробуждает Claude на выходе 2, показывая stderr (или stdout, если stderr пуст) в качестве системного напоминания. |
| `shell` | `"bash"` (по умолчанию) или `"powershell"` (Windows) |

**Оболочка** (`args` отсутствует): `command` перешла в `sh -c`. Поддерживает каналы, `&&`, glob.
Форма **Exec** (присутствует `args`): `command` — это исполняемый файл, каждый элемент `args` представляет собой один дословный аргумент. Используйте для путей с пробелами или при ссылке на `${CLAUDE_PROJECT_DIR}`.

### Поля перехвата HTTP

| Поле | Описание |
|-------|-------------|
| `url` | URL-адрес конечной точки POST |
| `headers` | Дополнительные заголовки (поддерживает интерполяцию `$VAR`) |
| `allowedEnvVars` | Переменные Env разрешены для интерполяции в значениях заголовков. |

Ответы, отличные от 2xx, не блокируются. Чтобы заблокировать, верните 2xx с `decision: "block"` в теле JSON.

### Поля привязки инструмента MCP

| Поле | Описание |
|-------|-------------|
| `server` | Имя подключенного сервера MCP |
| `tool` | Имя инструмента на этом сервере |
| `input` | Инструментальные аргументы. Строковые значения поддерживают замену `${path}` из ввода перехватчика. |

Сервер уже должен быть подключен. `SessionStart` и `Setup` обычно срабатывают до того, как серверы завершат подключение.

### Поля подсказки

| Поле | Описание |
|-------|-------------|
| `prompt` | Текст подсказки. Используйте `$ARGUMENTS` для входа JSON хука. |
| `model` | Переопределение модели (по умолчанию: быстрая модель, обычно Haiku) |
| `continueOnBlock` | Когда `ok: false`, верните причину Claude и продолжайте вместо остановки. |

Возвращает `{ "ok": true/false, "reason": "..." }`. См. поддержку типа [Hook для каждого события](#hook-type-support-per-event), чтобы узнать о событиях, которые принимают перехватчики `prompt`.

### Поля ловушки агента

| Поле | Описание |
|-------|-------------|
| `prompt` | Описание задачи. Используйте `$ARGUMENTS` для входа JSON хука. |
| `model` | Переопределение модели |

Создает субагент, который может использовать Read, Grep, Glob (до 50 ходов), а затем возвращает ту же схему `{ "ok": true/false }`. Экспериментальный.

### <a name="hook-type-support-per-event"></a>Поддержка типов перехватчиков для каждого события

| Группа событий | Поддерживаемые типы обработчиков |
|-------------|-------------------------|
| `PermissionDenied`, `PostToolBatch`, `PostToolUse`, `PostToolUseFailure`, `PreToolUse`, `Stop`, `SubagentStop`, `TaskCompleted`, `TaskCreated`, `TeammateIdle`, `UserPromptExpansion`, `UserPromptSubmit` | `command`, `http`, `mcp_tool`, `prompt`, `agent` |
| `PermissionRequest` | `command`, `http`, `mcp_tool`, `prompt` (хук `agent` пропускается) |
| `ConfigChange`, `CwdChanged`, `DirectoryAdded`, `Elicitation`, `ElicitationResult`, `FileChanged`, `InstructionsLoaded`, `MessageDisplay`, `Notification`, `PostCompact`, `PostModelSwitch`, `PreCompact`, `PreModelSwitch`, `SessionEnd`, `StopFailure`, `SubagentStart`, `WorktreeCreate`, `WorktreeRemove` | `command`, `http`, `mcp_tool` |
| `SessionStart`, `Setup` | `command`, `mcp_tool` |

На `PermissionDenied` запускаются перехватчики приглашений и агентов, но их выходные данные отбрасываются.

---

## Заполнители пути

| Заполнитель | решает |
|-------------|-------------|
| `${CLAUDE_PROJECT_DIR}` | Корневой каталог проекта |
| `${CLAUDE_PLUGIN_ROOT}` | Каталог установки плагина (меняется при обновлении) |
| `${CLAUDE_PLUGIN_DATA}` | Постоянный каталог данных плагина (выдерживает обновления) |

Для перехватчиков, ссылающихся на них, предпочтительнее использовать форму exec: каждый элемент `args` передается дословно, пробелы или специальные символы не заключаются в кавычки.

---

## CLAUDE_ENV_FILE

Доступны хуки `SessionStart`, `Setup`, `CwdChanged` и `FileChanged`. Запишите строки `export VAR=value` по этому пути, чтобы сохранить переменные в последующих командах Bash для сеанса.

```bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=production' >> "$CLAUDE_ENV_FILE"
fi
```

Используйте добавление (`>>`), чтобы сохранить переменные, установленные другими перехватчиками.

---

## <a name="common-gotchas"></a>Распространенные ошибки

**Stop хук продолжения**: и `decision: "block"`, и `additionalContext` проходят через вход `stop_hook_active` и 8 последовательных продолжений. Прочитайте `stop_hook_active` со стандартного ввода и выйдите из 0, если это `true`, чтобы позволить Claude корректно остановиться.

**Exit 1 не блокирует**: без допустимого вывода JSON только выход 2 блокирует вызов PreToolUse или UserPromptSubmit. Выход 1 неблокируемый: действие продолжается. Хук также может блокироваться с выходом 0 плюс решением JSON, например `permissionDecision: "deny"`. Несуществующий путь к сценарию завершается сбоем с кодом типа 127, который также не блокируется, поэтому неправильно введенный путь автоматически отключает шлюз политики.

**asyncRewake против async**: `asyncRewake: true` запускает перехватчик в фоновом режиме И пробуждает сеанс, когда процесс завершается с кодом 2, даже если Claude простаивает. Используйте, когда длительная проверка данных должна сообщить об ошибке в середине сеанса.

**Бюджет окончания сеанса**: Общий бюджет составляет 1,5 секунды. Установка `timeout: 30` на хук увеличивает бюджет до 30 с (максимум 60 с), но хук без собственного `timeout` сохраняет значение по умолчанию 1,5 с. Таймауты перехвата плагина не увеличивают бюджет. `CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS=5000` переопределяет бюджет и, начиная с v2.1.268, также устанавливает таймаут хуков без своих.

**MessageDisplay batting**: срабатывает несколько раз для каждого сообщения (один раз для каждого пакета строк) в интерактивном режиме, один раз после полного сообщения в режиме `-p`/Agent SDK. `final: true` отмечает последнюю партию; не полагайтесь на непустой `delta` в качестве сигнала завершения.

**WorktreeCreate полностью заменяет git.**: этот хук должен обрабатывать полную настройку рабочего дерева. `.worktreeinclude` не обрабатывается. Скопируйте `.env` и другие локальные файлы внутри хука.

Поле **if для событий, не связанных с инструментом.**: добавление `if` к `SessionStart`, `Stop` или любому событию, не связанному с инструментом, автоматически предотвращает запуск перехватчика вообще.

**Несколько перехватчиков PreToolUse с обновленнымInput**: все соответствующие перехватчики выполняются параллельно. Конфликтующие решения разрешаются как `deny > defer > ask > allow`, но документация не определяет, какой `updatedInput` побеждает, когда несколько перехватчиков переписывают один и тот же вызов. Избегайте использования двух перехватчиков на одном и том же сопоставителе, возвращающих `updatedInput`.

**PermissionRequest не препятствует выходу 2**: используйте `hookSpecificOutput.decision.behavior: "deny"` в выходных данных JSON. Выход 2 не учитывается в этом событии, а перехваты `agent` пропускаются, начиная с версии 2.1.280.

**Дубликаты обработчиков**: один и тот же обработчик, определенный в нескольких файлах настроек, запускается один раз. Копия одного и того же обработчика плагина или навыка остается отдельной.

**Prompt перехватывает PermissionDenied**: вывод отбрасывается. Единственное поле, которое считывает это событие, — это `hookSpecificOutput.retry`, которое не могут быть установлены перехватчиками подсказок и агентов. Используйте командную ловушку для сигналов повтора.

**Hooks без управляющего терминала**: Начиная с версии 2.1.139, перехватчики работают без `/dev/tty`. Используйте `terminalSequence` в выводе JSON для вывода уведомлений на рабочем столе или заголовков окон вместо прямого написания escape-последовательностей.

**UserPromptОтправить таймаут по умолчанию**: 30 с, а не 600 с. Застрявший здесь хук блокирует весь пользовательский ввод. Установите явный `timeout`, если вам нужно больше времени.

**Hooks как шаблоны проектирования**: [AI Design Patterns](./ai-design-patterns.md#observer) сопоставляет перехватчики с наблюдателем, декоратором, командным и детерминированным вентилем и указывает, где каждая аналогия нарушается.
