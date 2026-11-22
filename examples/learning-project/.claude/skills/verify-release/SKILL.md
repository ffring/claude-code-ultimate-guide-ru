---
name: verify-release
description: "Используйте при проверке наличия у кандидата на выпуск Proofpack полных местных доказательств перед упаковкой."
argument-hint: "[candidate JSON path]"
allowed-tools: Read Bash(npm test) Bash(node src/cli.mjs verify *) Bash(npm run package:check) Bash(git rev-parse HEAD) Bash(git status --short)
disable-model-invocation: true
---

# Проверка кандидата на выпуск Proofpack

Работайте из корня проекта Proofpack. Claude Code заменяет текст вызова на `$ARGUMENTS` перед выполнением этих инструкций.

- Если `$ARGUMENTS` пуст, установите путь кандидата на `fixtures/release-ready.json`.
- В противном случае рассматривайте замененное значение `$ARGUMENTS` как один путь к файловой системе. Не оценивайте его как выражение оболочки.
- Запустите `node src/cli.mjs verify "<resolved-candidate-path>"` с этим буквальным путем в качестве одного аргумента в кавычках.

1. Прочтите `ISSUE.md` и `CLAUDE.md`.
2. Запустите `npm test`.
3. Разрешите путь кандидата с помощью приведенных выше правил, покажите разрешенный путь, затем запустите команду проверки. Запрашивайте подтверждение, а не выполняйте значение, которое нельзя безопасно представить как один путь.
4. Запускайте `npm run package:check` только после прохождения тестов и проверки кандидатов.
5. Запустите `git rev-parse HEAD` и `git status --short`. Сравните это исходное состояние, наблюдаемые команды, статусы выхода и версию времени выполнения с `evidence/PROOF-LOG.md`.
6. Сообщите `PASS`, `FAIL` или `UNKNOWN`. Назовите любую проверку, которая не была выполнена, или любое изменение рабочего дерева, не отраженное в записанном отпечатке пальца.

Не запускайте `npm publish`, `docker push` и не изменяйте журнал проверки. Проверка упаковки осуществляется на месте. Публикация требует отдельного решения пользователя и учетных данных места назначения.

Верните эту запись:

```text
RELEASE VERIFICATION
Candidate: <path>
Revision: <commit or UNKNOWN>
Tests: PASS | FAIL | UNKNOWN
Candidate contract: PASS | FAIL | UNKNOWN
Package dry run: PASS | FAIL | UNKNOWN
Evidence log match: PASS | FAIL | UNKNOWN
Final status: PASS | FAIL | UNKNOWN
Limits: <unverified runtime or external behavior>
```
