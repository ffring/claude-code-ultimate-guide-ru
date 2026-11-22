export const TOPICS = Object.freeze({
  1: 'Быстрый старт и установка',
  2: 'Основные понятия',
  3: 'Память и настройки',
  4: 'Агенты',
  5: 'Навыки',
  6: 'Команды',
  7: 'Хуки',
  8: 'Серверы MCP',
  9: 'Продвинутые паттерны',
  10: 'Справочник и диагностика',
  11: 'Обучение с ИИ',
  12: 'Устройство Claude Code',
  13: 'Усиление защиты',
  14: 'Конфиденциальность и наблюдаемость',
  15: 'Экосистема ИИ',
  16: 'Обвязка агента и контекст',
  17: 'Метрики команды при разработке с ИИ'
});

export const TOPIC_IDS = Object.freeze(Object.keys(TOPICS).map(Number));

export function parseTopicIds(value) {
  return value
    .split(',')
    .map(topic => parseInt(topic.trim(), 10))
    .filter(topic => TOPIC_IDS.includes(topic));
}
