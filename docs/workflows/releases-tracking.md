# Отслеживание релизов Claude Code

В этом репозитории хранится сокращенная история официальных выпусков Claude Code.

## Файлы

| Файл | Роль |
|------|------|
| `machine-readable/claude-code-releases.yaml` | Локальный источник достоверной информации о сокращенной истории выпусков и значении `latest`. |
| `guide/core/claude-code-releases.md` | Удобочитаемая версия (Markdown) |
| `mcp-server/content/claude-code-releases.yaml` | Идентичный по байтам реестр выпусков, входящий в пакет MCP. |
| `llms.txt`, `machine-readable/llms.txt`, `mcp-server/content/llms.txt` | Индексы обнаружения, идентичные байтам и объявляющие об отслеживаемой версии `latest`. |
| `scripts/update-cc-releases.sh` | Скрипт проверки новых версий |

Anthropicофициальный Claude Code журнал изменений является исходным источником. Местный YAML является проверенным объединением, поэтому локальная согласованность не доказывает, что отслеживание восходящего потока является актуальным или полным.

## Проверьте наличие новых версий

```bash
./scripts/update-cc-releases.sh
```

Сценарий:
1. Получает официальный CHANGELOG от GitHub.
2. Сравнивается с нашей отслеживаемой версией
3. Отображает новые выпуски для сжатия

## Обновить рабочий процесс

1. **Проверить**: `./scripts/update-cc-releases.sh`
2. **Обновить YAML**: добавить новую запись в `claude-code-releases.yaml`.
   - Обновите `latest` и `updated`.
   - Добавить запись в `releases` (сокращенно: максимум 2–4 выделения)
   - Добавьте в `breaking_summary`, если применимо.
   - Добавьте в `milestones`, если есть основная функция.
3. **Update Markdown**: последовательно обновлять `claude-code-releases.md`.
4. **Обновление зеркал**: Скопируйте проверенный YAML в `mcp-server/content/claude-code-releases.yaml`
5. **Обновить версию обнаружения**: Измените предложение версии во всех трех зеркалах `llms.txt` на значение YAML `latest`.
6. **Проверка локальной связи**:

   ```bash
   python3 scripts/validate-reference-yaml.py --ci
   (cd mcp-server && node --test --test-name-pattern='canonical MCP guide is complete' test/render-product-docs.test.mjs)
   ```

7. **Синхронизация приземления**: `./scripts/check-landing-sync.sh`
8. **Зафиксировать**: `docs: update Claude Code releases (vX.Y.Z)`

Тест MCP сначала требует, чтобы три файла `llms.txt` были байтово-идентичными, затем анализирует `machine-readable/claude-code-releases.yaml` и сравнивает его значение `latest` с версией, объявленной в `llms.txt`. `npm run release:check` выполняет этот тест в рабочем процессе CI `index-integrity`. Проверка подтверждает согласованность репозитория и пакета. Он не извлекает журнал изменений Anthropic и не подтверждает полноту сводки выпуска.

## Формат записи YAML

```yaml
- version: "2.1.13"
  date: "2026-01-20"
  highlights:
    - "Main feature"
    - "Other notable feature"
  breaking:
    - "Description of breaking change (if applicable)"
```
