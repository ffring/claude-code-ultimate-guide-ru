---
title: "reMarkable 2 + AI: хаки, инструменты и рабочие процессы"
description: "Полное отображение интеграции искусственного интеллекта для reMarkable 2: сервер MCP, OCR, конвейеры Obsidian/Notion и автоматизация."
tags: [mcp, integration, hardware, workflow, remarkable]
---

# reMarkable 2 + AI: полное описание хаков, инструментов и рабочих процессов.

> **Последняя проверка**: февраль 2026 г.

ReMarkable 2 — это планшет с электронными чернилами Linux с полным корневым доступом. Его философия отсутствия отвлечений делает его инструментом мышления, но его встроенная интеграция минимальна. На этой странице описано все, что существует для дополнения ИИ, от самых простых до самых технических.

См. также: [AI Ecosystem](ai-ecosystem.md) для более широкого отображения экосистемы искусственного интеллекта (помимо аппаратного обеспечения).

## Оглавление

1. [remarkable-mcp: прямой доступ к MCP через SSH](#1-remarkable-mcp-direct-mcp-access-via-ssh)
2. [Ghostwriter: Интерфейс Vision-LLM](#2-ghostwriter-vision-llm-interface)
3. [Sync reMarkable → Obsidian](#3-sync-remarkable--obsidian)
4. [OCR + Пользовательский конвейер AI](#4-ocr--custom-ai-pipeline)
5. [SSH Инструменты доступа и сообщества](#5-ssh-access-and-community-tools)
6. [Неиспользуемые встроенные функции](#6-underused-native-features)
7. [Официальный API и портал разработчиков](#7-official-api-and-developer-portal)
8. [Zapier Automation](#8-zapier-automation)
9. [Читать позже: Интернет для reMarkable](#9-read-it-later-web-to-remarkable)
10. [Записи встречи → Обзор AI](#10-meeting-notes--ai-summary)
11. [Zotero to reMarkable (исследование)](#11-zotero-to-remarkable-research)
12. [Совместное использование экрана в виде доски с помощью искусственного интеллекта](#12-screen-sharing-as-an-ai-assisted-whiteboard)
13. [Пользовательские приложения и забавные лайфхаки](#13-custom-apps-and-fun-hacks)
14. Рабочие процессы, дополненные [AI, для сборки](#14-ai-augmented-workflows-to-build)
15. [С чего начать](#15-where-to-start)

---

## <a name="1-remarkable-mcp-direct-mcp-access-via-ssh"></a>1. замечательно-mcp: прямой доступ к MCP через SSH

**ROI: максимальный | Усилие: среднее | Подключение: SSH через USB (без облака)**

Сэм Морроу создал сервер **MCP**, который подключает reMarkable напрямую к Claude Code, VS Code Copilot и любому MCP-совместимому помощнику искусственного интеллекта.

| Атрибут | Подробности |
|---------|---------|
| **Репо** | https://github.com/SamMorrowDrums/remarkable-mcp |
| **Блог** | https://sam-morrow.com/blog/building-an-mcp-server-for-remarkable |
| **Соединение** | SSH через USB (без облака, без подписки) |
| **Язык** | Питон (FastMCP) |

### Что он делает

- **Встроенное извлечение печатного текста** (Type Folio/виртуальная клавиатура), мгновенное, без оптического распознавания символов
- **Рукописный ввод OCR** через Google Cloud Vision (1000 бесплатных requests/month)
- **Умный поиск** по всей вашей библиотеке
- **Извлечение текста** из PDF и EPUB, а также аннотации
- **Полный обход** документов

### Почему это №1

Вы можете спросить Claude: «Что я заметил об X во время встречи 15 января?» Он будет искать ваши рукописные заметки. ReMarkable становится **запрашиваемым вторым мозгом**.

### Технический стек

```
FastMCP + rmscene (native .rm parsing) + PyMuPDF (PDF)
+ Google Cloud Vision (OCR) + Paramiko (SSH)
```

### Быстрая установка

```bash
# 1. Enable SSH on the reMarkable
# Settings → Help → Copyrights and licenses → IP + root password

# 2. Clone the repo
git clone https://github.com/SamMorrowDrums/remarkable-mcp
cd remarkable-mcp && pip install -e .

# 3. Add to Claude Code
# In ~/.claude.json or via "claude mcp add"
```

### Конфигурация в Claude Code

```json
{
  "mcpServers": {
    "remarkable": {
      "command": "python",
      "args": ["-m", "remarkable_mcp"],
      "env": {
        "REMARKABLE_HOST": "10.11.99.1",
        "REMARKABLE_PASSWORD": "<root-password>"
      }
    }
  }
}
```

---

## <a name="2-ghostwriter-vision-llm-interface"></a>2. Ghostwriter: интерфейс Vision-LLM.

**ROI: экспериментальный | Усилия: низкие (двоичный файл Rust для копирования)**

| Атрибут | Подробности |
|---------|---------|
| **Репо** | https://github.com/awwaiid/ghostwriter |
| **Модель** | GPT-4o Видение |
| **HN обсуждение** | https://news.ycombinator.com/item?id=42979986 |

### Концепция

Пишешь подсказку от руки на reMarkable. Vision-LLM (GPT-4o) читает ваш почерк и рисунки и отвечает **прямо на планшете**.

### Установка

```bash
# 1. Download the compiled Rust binary
scp ghostwriter root@10.11.99.1:/home/root/

# 2. SSH in and launch
ssh root@10.11.99.1
chmod +x ghostwriter && ./ghostwriter
```

### Поддерживаемые взаимодействия

- Распознавание рукописного ввода
- Эскизный анализ (каркасы, диаграммы)
- Малый иконографический язык
- Жесты

### Конкретный вариант использования

Рисуешь схему архитектуры, пишешь «оптимизируй это». LLM визуально анализирует его и реагирует. Увлекательный прототип взаимодействия человека и искусственного интеллекта с помощью ручки.

**Честное ограничение**: встроенное приложение для рисования reMarkable минимально (нет свободного размещения текста в ответе).

---

## <a name="3-sync-remarkable--obsidian"></a>3. Синхронизация reMarkable → Обсидиан

**ROI: высокий, если вы используете Obsidian | Усилие: от низкого до среднего**

### Вариант А: Scribble (наиболее полный)

| Атрибут | Подробности |
|---------|---------|
| **Сайт** | scrybble.ink |
| **Плагин Obsidian** | Плагин сообщества (настройки хранилища) |
| **Хостинг** | Локальный сервер или сервер Scribble |
| **Обсуждение** | https://forum.obsidian.md/t/scrybble-sync-plugin/103194 |

**Что он делает:**

- Синхронизируйте блокноты, PDF-файлы и электронные публикации с хранилищем Obsidian.
- Извлечь основные моменты PDF/ePub как Markdown
- Извлечь введенный текст как Markdown
- Полная отрисовка блокнотов в формате PDF в хранилище
- Организация по страницам с тегами

**Сценарий использования**: академические исследования, ведение заметок на собраниях с поиском Obsidian.

### Вариант Б: собственный плагин синхронизации с облаком.

- **Демо**: https://www.youtube.com/watch?v=EsRdi8J9Cnc
- Команда «remarkable Insert», извлекает файлы из облака reMarkable.
- PDF в папке `rm/`, встроенный в заметки Obsidian.
- Автоматическая повторная загрузка при внесении изменений на планшете.

---

## <a name="4-ocr--custom-ai-pipeline"></a>4. OCR + собственный конвейер AI

**ROI: высокий для пользовательского рабочего процесса | Усилие: средне-высокое**

### rmirror + Claude API (рекомендуемый шаблон)

Источник: https://news.ycombinator.com/item?id=47110872 (февраль 2026 г.)

**Concept**: фоновый агент macOS, который:
1. Синхронизирует блокноты из reMarkable
2. OCR через Claude API (лучше, чем Tesseract для рукописного ввода с контекстом)
3. Отправляет расшифрованные заметки в Notion в виде страниц с возможностью поиска.

**Почему Claude превосходит Tesseract для OCR**: Claude понимает контекст, исправляет неверные слова и автоматически структурирует списки и таблицы.

### трубопровод своими руками

```
reMarkable → SSH/USB
  → extract .rm files
  → rmscene parse (native text if Type Folio)
  → Claude Vision API (page screenshots for handwriting)
  → structured text + auto tags
  → Notion/Obsidian/GitHub via API
```

### Инструменты синтаксического анализа

| Инструмент | Использование | Связь |
|-------|-------|------|
| **rmscene** | Собственный анализ файлов .rm | https://github.com/ricklupton/rmscene |
| **rmc** | Преобразует .rm в SVG/PNG | https://github.com/ricklupton/rmc |
| **rmapi** | Облачный интерфейс API в Go | https://github.com/juruen/rmapi |

---

## <a name="5-ssh-access-and-community-tools"></a>5. Доступ по SSH и инструменты сообщества

**Незаменимая основа для всего остального**

### Включить SSH

```bash
# Via the tablet interface:
# Settings → Help → Copyrights and licenses
# → Displays: IP + root password

# USB (direct connection)
ssh root@10.11.99.1

# WiFi (after activation)
rm-ssh-over-wlan on
# or via "Simply Customize It"
```

### Основные инструменты

| Инструмент | Использование | Связь |
|-------|-------|------|
| **RMHacks/xovi** | Мод фреймворк для rM1/2/Paper Pro | https://www.nilorea.net/2025/08/11/latest-rmhacks-with-xovi-for-remarkable-1-2-paper-pro/ |
| **Просто настройте** | Графический интерфейс для переключения функций (WLAN SSH и т. д.) | Стороннее приложение |
| **ReMy** | Графический интерфейс для документов browse/preview/export через SSH (без облака) | https://github.com/bordaigorl/remy |
| **rmirro** | Двунаправленная синхронизация PDF, планшет ↔ локальная папка | https://github.com/hersle/rmirro |
| **reStream** | Трансляция экрана reMarkable на Mac/PC | https://github.com/rien/reStream |
| **KOReader** | Альтернативная программа чтения (больше форматов, настраиваемая) | Через SSH |
| **reGitable** | Автоматическое резервное копирование через git | awesome-reMarkable |

### <a name="custom-templates"></a>Пользовательские шаблоны

```bash
# Create an SVG template, copy via SSH
scp mon-template.svg root@10.11.99.1:/usr/share/remarkable/templates/

# Edit templates.json to register it
ssh root@10.11.99.1 'vi /usr/share/remarkable/templates/templates.json'
```

**Инструменты генерации**: ReCalendar.me, Замечательный генератор сеток, Замечательный планировщик

---

## <a name="6-underused-native-features"></a>6. Недостаточно используемые встроенные функции

**Effort: ноль | Входит в состав Connect (~6 EUR/month)**

| Особенность | Использование |
|---------|-------|
| **Преобразование рукописного ввода** | Выберите, конвертируйте copy/paste в любое приложение. |
| **Облачная синхронизация** | Гугл Диск, Дропбокс, OneDrive |
| **Отправить в Slack** | Делитесь заметками о собраниях прямо в канале |
| **Поиск по рукописному вводу** (бета-ИИ) | Просмотрите свои прошлые рукописные заметки |
| **Совместное использование экрана** | Совместное использование экрана на ПК (презентации, встречи) |
| **Отправить на почту** | Отправить в формате PDF или PNG |

**Tip**: Преобразование рукописного текста в текст хорошо работает для отдельных слов, но хуже для плотных рукописных предложений. Для конвертации отдавайте предпочтение печатному почерку.

---

## <a name="7-official-api-and-developer-portal"></a>7. Официальный API и портал разработчиков.

| Ресурс | Связь |
|-----------|------|
| **Портал разработчика** | https://developer.remarkable.com |
| **Облако API документы** | https://github.com/splitbrain/ReMarkableAPI |
| **Руководство сообщества** | https://remarkable.guide/ |
| **rmfakecloud** | Самостоятельное облако (без подписки Connect) |

**OS**: Linux (Codex), полный root-доступ по SSH, соответствует GPL. Набор инструментов кросс-компилятора позволяет развертывать собственные собственные приложения.

**rmfakecloud**: альтернатива облаку reMarkable с открытым исходным кодом для самостоятельной синхронизации с хостингом и пропуска подписки Connect.

---

## <a name="8-zapier-automation"></a>8. Автоматизация Zapier

**ROI: средний | Усилие: низкое | Код не требуется**

**Механизм**: reMarkable, затем электронное письмо (my@remarkable.com), затем Zapier перехватывает, затем автоматическое действие

### Возможные направления

Google Диск, Асана, ClickUp, Trello, Slack, WordPress, Evernote, Notion

### Бесплатный план

- 100 tasks/month
- 2-шаговые Запсы
- Проверяйте каждые 15 минут

### Конкретные рабочие процессы

```
Meeting notes → PDF auto-uploaded to Google Drive
Sketches → File sent to a Slack channel
Action items → Tasks created in Asana/ClickUp
```

**Источник**: https://myremarkable.substack.com/p/integrating-remarkable

---

## <a name="9-read-it-later-web-to-remarkable"></a>9. Прочитайте позже: Web to reMarkable

**ROI: высокий для чтения | Усилие: около нуля**

| Инструмент | Описание |
|-------|-------------|
| **Расширение Chrome «Чтение на reMarkable»** | Сохраните любую веб-страницу на планшете как EPUB/PDF (реклама удалена) |
| **гусиная бумага** | Ежедневный RSS-канал + новости + Википедия в формате e-ink |
| **remarkable_news** | Daily news/comics/images в качестве заставки |
| **Обходной путь в Instapaper** | Загружайте статьи в формате EPUB, импортируйте через настольное приложение. |

Опция **PDF**: щелкните правой кнопкой мыши расширение «Читать в reMarkable как PDF» (регулируемые поля для аннотирования).

---

## <a name="10-meeting-notes--ai-summary"></a>10. Заметки о встрече → Резюме AI

**ROI: высокий | Усилие: очень низкое**

### Ручной рабочий процесс (без MCP)

```
1. Handwritten notes during the meeting
2. Screenshot via the reMarkable mobile app (or cloud sync)
3. Upload the image to Claude/ChatGPT
4. Prompt: "Summarize these notes, extract action items with deadlines and owners"
```

### Рабочий процесс MCP (с установленным замечательным mcp)

```
Claude, summarize my notes from today's meeting
→ Claude fetches the files via SSH
→ OCR if needed
→ Structured summary, directly
```

Преимущество **MCP**: пропуск снимков экрана и шагов загрузки. Работает даже без подписки Connect.

### Рекомендуемый шаблон

Блокнот для собраний Paper Pro Move: 60 собраний, 5 взаимосвязанных страниц на каждое собрание (обзор + заметки + действия + последующие действия).

---

## <a name="11-zotero-to-remarkable-research"></a>11. Zotero для reMarkable (исследование)

**ROI: высокий, если читать статьи | Усилие: среднее**

| Инструмент | Использование |
|-------|-------|
| **Zotero2reMarkable Bridge** | Синхронизация PDF-файлов из Zotero с поддержкой выделения |
| **KOReader + Toltec + плагин Zotero** | Улучшенное чтение PDF-файлов с двумя столбцами, двунаправленная синхронизация |
| **sync_zotero_remarkable** | Легкая альтернатива |

**Честное ограничение**: reMarkable — закрытая система. Интеграция Zotero требует обходных путей. Не так гладко, как в электронной книге Android с родным Zotero. Функционально, но с трениями.

---

## <a name="12-screen-sharing-as-an-ai-assisted-whiteboard"></a>12. Совместное использование экрана в виде доски с помощью искусственного интеллекта

**ROI: presentation/facilitation | Усилия: ноль (встроенная функция Connect)**

- **Screen Share**: ваш живой почерк отображается на внешнем собрании screen/virtual.
- **Лазерная указка**: Перо в верхней части экрана активирует лазерную указку.
- **Комбинированный рабочий процесс**: общий доступ к экрану + коллега, отправляющий ваши заметки в ChatGPT в режиме реального времени = дополненная доска

**Price**: включено в Connect (~$30/year для США, ~6 EUR/month для ЕС).

---

## <a name="13-custom-apps-and-fun-hacks"></a>13. Пользовательские приложения и забавные лайфхаки

| App/Hack | Описание |
|----------|-------------|
| **Эфемериды** | Ежедневная повестка дня, создаваемая из ваших календарей (Python) |
| **Ремаркал** | Синхронизируйте календари Google/Outlook/Apple с reMarkable |
| **reМаркируемый брелок** | Приложение для заметок на клавиатуре, не отвлекающее внимание |
| **remarkable-wikipedia** | Офлайн-читатель Википедии |
| **whiteboard-hypercard** | Живое сотрудничество, общий рисунок |
| **NetSurf** | Минимальный веб-браузер (через SSH) |
| **pdf2замечательный** | Загрузка PDF-файлов в облако из командной строки |
| **send-to-remarkable** | Загрузка документов по электронной почте (стиль отправки в Kindle) |
| **libreMarkable** | Фреймворк для разработки нативных приложений |
| **oxide/remux/draft** | Лаунчеры для многозадачности |
| **latex-yearly-planner** | Годовой планировщик, созданный в LaTeX |

**Полный каталог**: https://github.com/reHackable/awesome-reMarkable

---

## <a name="14-ai-augmented-workflows-to-build"></a>14. Рабочие процессы, дополненные искусственным интеллектом, для создания

Рабочие процессы еще не упакованы, но достижимы с помощью доступных строительных блоков.

### A. Журнал, проанализированный ИИ

```
Every evening → write 1 page of reflection on the reMarkable
→ remarkable-mcp + Claude → weekly analysis of patterns, emotions, decisions
→ Output: insights in Obsidian with a connection graph
```

### Б. Помощь в обработке входящих сообщений

```
Papers/articles read and annotated on reMarkable
→ OCR via Claude Vision → structured summaries
→ Automatic tags + filing in Obsidian/Notion
```

### C. Преобразование эскиза в код

```
Draw a UI wireframe on reMarkable
→ Screenshot → Claude Vision → HTML/React code
```

### D. Автоматические карточки

```
Course/reading notes on reMarkable
→ remarkable-mcp → Claude extracts the key concepts
→ Automatically generates Anki flashcards
```

### E. Автоматизированный ежедневный стендап

```
TODOs written every morning (custom template)
→ OCR → Slack/email automatically formatted
→ End of day: check off items, diff sent
```

### F. Мозговой штурм → Карта разума

```
Freely scribbled ideas
→ Claude Vision analyzes the spatial layout + text
→ Generates a structured mind map (Mermaid/Markmap)
```

---

## <a name="15-where-to-start"></a>15. С чего начать

### Этап 1: В эти выходные (2 часа)

1. Включите SSH через Настройки → Справка → Авторские права и лицензии.
2. Установите **remarkable-mcp** и подключите его к Claude Code.
3. Тест: попросите Claude выполнить поиск по вашим заметкам.

### Этап 2: На следующей неделе

4. Если вы используете Obsidian, установите Scrybble.
5. Попробуйте **Ghostwriter** (10 минут на установку, удовольствие гарантировано)

### Этап 3: Когда вы хотите пойти дальше

6. Создайте собственный конвейер оптического распознавания символов с помощью Claude Vision API.
7. Изучите rmfakecloud, чтобы пропустить подписку Connect

---

## <a name="sources"></a>Источники

**GitHub проекты**

- https://github.com/SamMorrowDrums/remarkable-mcp (сервер MCP, ноябрь 2025 г.)
- https://github.com/awwaiid/ghostwriter (интерфейс Vision-LLM)
- https://github.com/reHackable/awesome-reMarkable (каталог сообщества)
- https://github.com/hersle/rmirro (синхронизация без облака)
- https://github.com/bordaigorl/remy (SSH графического интерфейса)
- https://github.com/rien/reStream (потоковое воспроизведение экрана)
- https://github.com/splitbrain/ReMarkableAPI (документация Cloud API)
- https://github.com/ricklupton/rmscene (собственный анализ .rm)

**Статьи и обсуждения**

- https://sam-morrow.com/blog/building-an-mcp-server-for-remarkable
- https://news.ycombinator.com/item?id=47110872 (rmirror + Claude OCR, февраль 2026 г.)
- https://news.ycombinator.com/item?id=42979986 (писатель-призрак HN)
- https://news.ycombinator.com/item?id=46099997 (Взлом reMarkable 2, HN 2025)
- https://sgt.hootr.club/blog/hacking-on-the-remarkable-2/ (руководство по взлому SSH)
- https://myremarkable.substack.com/p/integrating-remarkable (интеграция Zapier)

**Обсидиан**

- https://forum.obsidian.md/t/scrybble-sync-plugin/103194
- https://www.youtube.com/watch?v=EsRdi8J9Cnc (демо-версия облачной синхронизации)

**Официальный**

- https://developer.remarkable.com (Портал разработчиков, SDK, API)
- https://remarkable.guide/ (Руководство сообщества)
