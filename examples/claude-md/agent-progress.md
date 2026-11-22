# Ход сеанса

<!--
agent-progress.md — Session handoff template for harness engineering.
Written at the end of every session, read at the start of the next.
Keep it short and concrete. The "Notes for Next Session" section is
the highest-ROI part: file paths and line numbers save 5-10 minutes
of orientation at session start.

Related: examples/templates/feature-list.json, §9.25 Harness Engineering
-->

## Последнее обновление
ГГГГ-ММ-ДД — сеанс N

## Активная функция
feat-XXX: Название функции

## Завершить этот сеанс
- [x] Завершенный элемент
- [x] Еще один завершенный объект

## В ходе выполнения
- [ ] Текущий рабочий элемент
  - Статус: краткое описание того, как далеко продвинулись
  - Блокировщик: нет (или опишите блокировщик)

## Следующие шаги
1. Первое действие для следующего сеанса
2. Второе действие
3. Третье действие

## Доказательство
- ворс: очистить/N ошибок
- проверка типа: очистить / N ошибок
- модульные тесты: N/N пройден
- интеграционные тесты: N/N пройден/еще не запущен
- e2e: пройден/еще не запущен

## Примечания к следующему сеансу
Определенные пути к файлам, имена функций и номера строк, которые сохраняют
время реконструкции. Пример: «Точка подключения
src/services/DocumentService.import() в строке 67. Он ожидает
Тип ChunkResult[] определен в src/types/documents.ts:18."
