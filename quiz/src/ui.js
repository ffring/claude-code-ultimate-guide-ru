/**
 * UI utilities for terminal display
 */

import chalk from 'chalk';
import { TOPICS } from './topics.js';

export function displayHeader() {
  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(chalk.cyan.bold('   ВИКТОРИНА ПО CLAUDE CODE'));
  console.log(chalk.gray('   К полному руководству по Claude Code'));
  console.log(chalk.cyan('='.repeat(60) + '\n'));
}

export function displayHelp() {
  console.log(`
${chalk.cyan.bold('Викторина по Claude Code')}
Проверьте знание Claude Code в викторине с вариантами ответов.

${chalk.yellow('Запуск:')}
  node quiz/src/index.js [options]

${chalk.yellow('Параметры:')}
  -p, --profile <type>   Выбрать профиль (junior|senior|power|pm)
  -t, --topics <list>    Выбрать темы (1–17, через запятую)
  -c, --count <n>        Число вопросов (1–50)
  -d, --dynamic          Генерировать вопросы через claude -p
  -h, --help             Показать справку
  -v, --version          Показать версию

${chalk.yellow('Профили:')}
  junior   Начинающий разработчик (15 вопросов, темы 1–3, 6)
  senior   Опытный разработчик (20 вопросов, темы 2–4, 7, 9)
  power    Продвинутый пользователь (25 вопросов, все темы)
  pm       Продакт-менеджер (10 вопросов, темы 1–3, 16–17)

${chalk.yellow('Темы:')}
${Object.entries(TOPICS).map(([id, name]) => `  ${id.padStart(2)} ${name}`).join('\n')}

${chalk.yellow('Примеры:')}
  node quiz/src/index.js                      # Интерактивный режим
  node quiz/src/index.js -p senior            # Профиль senior, темы по умолчанию
  node quiz/src/index.js -p power -t 4,7,8    # Профиль power, выбранные темы
  node quiz/src/index.js -c 10                # Викторина из 10 вопросов

${chalk.gray('Руководство: https://github.com/ffring/claude-code-ultimate-guide-ru')}
`);
}

export function displayQuestion(question, index, total, categoryName) {
  console.log(chalk.gray('\n' + '-'.repeat(60)));
  console.log(chalk.yellow(`Вопрос ${index + 1}/${total}`) + chalk.gray(` [${categoryName}]`));
  console.log();
  console.log(chalk.white.bold(question.question));
  console.log();

  const options = ['A', 'B', 'C', 'D'];
  Object.entries(question.options).forEach(([key, value], i) => {
    console.log(chalk.cyan(`  ${options[i]}) `) + value);
  });
  console.log();
}

export function displayCorrect() {
  console.log(chalk.green.bold('\n✓ ВЕРНО!\n'));
}

export function displayIncorrect(question, userAnswer) {
  const options = ['a', 'b', 'c', 'd'];
  const correctLetter = question.correct.toUpperCase();
  const correctText = question.options[question.correct];

  console.log(chalk.red.bold(`\n✗ НЕВЕРНО.`) + chalk.white(` Правильный ответ — ${chalk.green(correctLetter)}) ${correctText}`));
  console.log();
  console.log(chalk.yellow('Разбор:'));
  console.log(chalk.gray(question.explanation.trim()));
  console.log();

  if (question.doc_reference) {
    const ref = question.doc_reference;
    const githubUrl = `https://github.com/ffring/claude-code-ultimate-guide-ru/blob/main/${ref.file}${ref.anchor || ''}`;
    console.log(chalk.blue('В руководстве: ') + chalk.underline(githubUrl));
    if (ref.line) {
      console.log(chalk.gray(`     (строка ${ref.line})`));
    }
  }
  console.log();
}

export function displayProgress(current, total, correct) {
  const percentage = Math.round((correct / current) * 100) || 0;
  const progressBar = createProgressBar(current, total, 20);
  console.log(chalk.gray(`Прогресс: ${progressBar} ${current}/${total} | Счёт: ${correct}/${current} (${percentage}%)`));
}

function createProgressBar(current, total, width) {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

export function displayCategoryScore(categoryName, correct, total) {
  const percentage = Math.round((correct / total) * 100);
  const barWidth = 10;
  const filled = Math.round((percentage / 100) * barWidth);
  const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(barWidth - filled));

  let color = chalk.green;
  if (percentage < 50) color = chalk.red;
  else if (percentage < 75) color = chalk.yellow;

  return `  ${categoryName.padEnd(30)} ${correct}/${total}  ${color(`(${percentage}%)`)}  [${bar}]`;
}
