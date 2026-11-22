/**
 * User prompts using inquirer
 */

import inquirer from 'inquirer';
import chalk from 'chalk';

export async function selectProfile(profiles) {
  const { profile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'profile',
      message: 'Выберите профиль:',
      choices: Object.entries(profiles).map(([key, value]) => ({
        name: `${value.name} (${value.description})`,
        value: key
      }))
    }
  ]);
  return profile;
}

export async function selectTopics(topics, defaultTopics) {
  const { topicChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'topicChoice',
      message: 'Выберите темы викторины:',
      choices: [
        { name: chalk.green('Все темы (рекомендуется)'), value: 'all' },
        { name: 'Темы по умолчанию для профиля', value: 'defaults' },
        { name: 'Выбрать вручную…', value: 'custom' }
      ]
    }
  ]);

  if (topicChoice === 'all') {
    return Object.keys(topics).map(Number);
  }

  if (topicChoice === 'defaults') {
    return defaultTopics;
  }

  // Custom selection
  const { selectedTopics } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedTopics',
      message: 'Выберите темы (пробел — отметить, Enter — подтвердить):',
      choices: Object.entries(topics).map(([id, name]) => ({
        name: `[${id}] ${name}`,
        value: parseInt(id),
        checked: defaultTopics.includes(parseInt(id))
      })),
      validate: (answer) => {
        if (answer.length === 0) {
          return 'Выберите хотя бы одну тему.';
        }
        return true;
      }
    }
  ]);

  return selectedTopics;
}

export async function promptAnswer() {
  const { answer } = await inquirer.prompt([
    {
      type: 'list',
      name: 'answer',
      message: 'Ваш ответ:',
      choices: [
        { name: 'A', value: 'a' },
        { name: 'B', value: 'b' },
        { name: 'C', value: 'c' },
        { name: 'D', value: 'd' },
        new inquirer.Separator(),
        { name: chalk.gray('Пропустить вопрос'), value: 'skip' },
        { name: chalk.gray('Завершить викторину'), value: 'quit' }
      ]
    }
  ]);
  return answer;
}

export async function promptContinue() {
  const { cont } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'cont',
      message: 'Перейти к следующему вопросу?',
      default: true
    }
  ]);
  return cont;
}

export async function promptRetry() {
  const { retry } = await inquirer.prompt([
    {
      type: 'list',
      name: 'retry',
      message: 'Что дальше?',
      choices: [
        { name: 'Повторить вопросы с ошибками', value: 'retry-wrong' },
        { name: 'Новая викторина с другими вопросами', value: 'new-quiz' },
        { name: 'Выйти', value: 'exit' }
      ]
    }
  ]);
  return retry;
}
