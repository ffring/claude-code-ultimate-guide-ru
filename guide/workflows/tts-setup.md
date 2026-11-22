---
title: "Рабочий процесс настройки TTS — установка агента Vibes"
description: "Добавьте текст в речь в Claude Code на macOS"
tags: [workflow, tts, tutorial]
---

# Рабочий процесс настройки TTS — установка Agent Vibes

**Goal**: добавить озвучивание текста в Claude Code.
**Время**: 18 минут
**Сложность**: Средний
**System**: macOS (требуется Homebrew)

---

## Момент принятия решения: стоит ли устанавливать TTS?

Используйте эту быструю оценку:

| Вопрос | Отвечать | Счет |
|----------|--------|-------|
| Вы работаете над длинными проверками кода? | Да | +2 |
| Вы выполняете несколько задач одновременно во время отладки? | Да | +2 |
| Вы предпочитаете звуковые уведомления? | Да | +1 |
| Вам нужен автономный TTS (без облака)? | Да | +2 |
| Критична ли задержка (требуется <100 мс)? | Да | -2 |
| Вы работаете в общественных местах (без звука)? | Да | -3 |
| Вы предпочитаете тихую рабочую обстановку? | Да | -2 |

**Score**:
- **≥3**: Установите TTS (хорошо подходит)
- **0-2**: необязательно (попробуйте, можно удалить)
- **<0**: пропустить TTS (не подходит)

---

## Обзор рабочего процесса

```
Phase 1: Prerequisites (5 min)
    ↓
Phase 2: Agent Vibes Install (5 min)
    ↓
Phase 3: Piper TTS + Voices (5 min)
    ↓
Phase 4: Test & Configure (3 min)
    ↓
Phase 5: Verify (1 min)
```

---

## Этап 1: Предварительные условия (5 минут)

### Контрольная точка 1.1: Системные требования

```bash
# Verify macOS version
sw_vers
# Required: macOS 10.15+

# Verify Homebrew
brew --version
# If missing: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Verify Node.js
node --version
# Required: 16.0.0+
```

### Контрольная точка 1.2: Установите bash 5.x

```bash
# Install
brew install bash

# Verify
/opt/homebrew/bin/bash --version
# Expected: GNU bash, version 5.x

# ✅ Checkpoint: Bash 5.x installed
```

### Контрольная точка 1.3: Установите зависимости

```bash
# Install audio tools
brew install sox ffmpeg util-linux espeak-ng

# Verify all installed
command -v sox && command -v ffmpeg && command -v espeak-ng && echo "✅ Dependencies OK"

# ✅ Checkpoint: Dependencies installed
```

**Общее время фазы 1**: ~5 минут

---

## Этап 2. Установка Agent Vibes (5 минут)

### Шаг 2.1: Запустите установщик

```bash
# Navigate to your project
cd /path/to/your/claude-project

# Launch interactive installer
npx agentvibes install
```

**Expected**: баннер ASCII + 4-страничный интерактивный установщик

### Шаг 2.2: Навигация по страницам

**Page 1/4 - Зависимости**:
- Обзор: Должны отображаться все ✓ зеленые галочки
- Действие: Нажмите «Далее →».

**Страница 2/4 - Поставщик**:
- **Select**: `Piper TTS` (лучшее качество, оффлайн)
- Действие: Нажмите «Далее →».

**Страница 3/4 - Голос**:
- **Французский**: Выберите `fr_FR-tom-medium` (мужской, профессиональный)
- **English**: выберите `en_US-ryan-high` (наилучшее качество)
- Действие: Нажмите «Далее →».

**Страница 4/4 - Настройки**:
- **Reverb**: `Light` (рекомендуется)
- **Фоновая музыка**: `Disabled` (не отвлекайтесь)
- **Verbosity**: `Low` (меньше болтливости)
- Действие: Нажмите «Начать установку».

### Контрольная точка 2.3: Проверка установки

```bash
# Check installed files
ls .claude/hooks/play-tts.sh
ls .claude/commands/agent-vibes/
cat .claude/tts-provider.txt
# Expected: Files exist, provider shows "macos" or "piper"

# ✅ Checkpoint: Agent Vibes installed
```

**Общее время фазы 2**: ~5 минут

---

## Фаза 3: Piper TTS + французские голоса (5 минут)

### Шаг 3.1. Установите Piper через pipx.

```bash
# Install Piper TTS
pipx install piper-tts

# Verify
piper --help
# Expected: Piper usage instructions

# ✅ Checkpoint: Piper installed
```

### Шаг 3.2. Загрузите французские голоса

```bash
# Create voice directory
mkdir -p ~/.claude/piper-voices
cd ~/.claude/piper-voices

# Download French male voice (recommended)
curl -L -o fr_FR-tom-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx"
curl -L -o fr_FR-tom-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx.json"

# Download French female voice (optional)
curl -L -o fr_FR-siwis-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx"
curl -L -o fr_FR-siwis-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json"

# ✅ Checkpoint: Voices downloaded (~120MB)
```

**Общее время фазы 3**: ~5 минут

---

## Этап 4. Настройка и тестирование (3 минуты)

### Шаг 4.1. Настройка провайдера и голосовой связи

```bash
# Set Piper as provider
echo "piper" > .claude/tts-provider.txt

# Set French male voice
echo "fr_FR-tom-medium" > .claude/tts-voice.txt

# Verify configuration
cat .claude/tts-provider.txt  # Expected: piper
cat .claude/tts-voice.txt     # Expected: fr_FR-tom-medium

# ✅ Checkpoint: Configuration set
```

### Шаг 4.2. Тестирование аудиоконвейера

```bash
# Test Piper directly
echo "Bonjour, je suis Claude et je parle français" | \
  piper -m ~/.claude/piper-voices/fr_FR-tom-medium.onnx \
  --output-file /tmp/test-fr.wav && afplay /tmp/test-fr.wav

# Test TTS hook
~/.claude/hooks/play-tts.sh "Ceci est un test audio"

# ✅ Checkpoint: Audio works
```

**Ожидаемый**: Вы должны услышать французский мужской голос.

**Общее время фазы 4**: ~3 минуты

---

## Этап 5: Проверка в Claude Code (1 минута)

### Шаг 5.1: Запуск и тестирование

```bash
# Start Claude Code
claude

# In Claude, run:
/agent-vibes:whoami
# Expected: Shows "piper" provider and "fr_FR-tom-medium" voice

# Test simple request
> "Dis-moi bonjour en français"
# Expected: Audio response in French male voice

# ✅ Checkpoint: TTS active in Claude Code
```

### Шаг 5.2: Настройте предпочтения

```bash
# Reduce verbosity (recommended)
/agent-vibes:verbosity low

# Hide 34 commands if cluttered
/agent-vibes:hide

# ✅ Checkpoint: Preferences set
```

**Общее время фазы 5**: ~1 минута

---

## Общее время: ~18 минут ✅

---

## Рекомендации после настройки

### Оптимизируйте свой рабочий процесс

**Для проверки кода**:
```bash
/agent-vibes:verbosity low
/agent-vibes:effects off
```

**Для фокусной работы**:
```bash
/agent-vibes:mute  # Mute temporarily
# Work without audio
/agent-vibes:unmute  # Re-enable when done
```

**Для оптимизации аккумулятора**:
```bash
# Switch to macOS Say (instant, no CPU burst)
/agent-vibes:provider switch macos
```

### Добавить в .gitignore

```bash
# Prevent committing large audio files
echo ".claude/audio/" >> .gitignore
echo ".claude/piper-voices/" >> .gitignore
echo "*.wav" >> .gitignore
echo "*.onnx" >> .gitignore
```

---

## Краткий справочник по устранению неполадок

| Проблема | Быстрое решение |
|-------|-----------|
| Нет звука | Проверьте `cat .claude/tts-provider.txt` |
| Неправильный голос | Запустите `/agent-vibes:switch fr_FR-tom-medium` |
| Слишком многословно | Запустите `/agent-vibes:verbosity low` |
| Команды беспорядок | Запустите `/agent-vibes:hide` |

**Полное устранение неполадок**: [Устранение неполадок Agent Vibes](../../examples/integrations/agent-vibes/troubleshooting.md)

---

## Следующие шаги

- **[Tools Reference](../core/tools-reference.md)** - Полный список встроенных инструментов Claude Code
- **[Каталог голосов](../../examples/integrations/agent-vibes/voice-catalog.md)** - Изучите 15 голосов
- **[Руководство по интеграции](../../examples/integrations/agent-vibes/README.md)** — Изучение команд
- **[Подробности установки](../../examples/integrations/agent-vibes/installation.md)** — глубокое погружение

---

## Инструкции по удалению

Чтобы полностью удалить Agent Vibes:

```bash
# Automated uninstall
npx agentvibes uninstall --yes

# Manual cleanup (if needed)
rm -rf .claude/hooks/*vibes*
rm -rf .claude/commands/agent-vibes/
rm -rf .claude/audio/
rm -rf ~/.claude/piper-voices/
pipx uninstall piper-tts
```

---

*Руководство по рабочему процессу, поддерживаемое [Claude Code Ultimate Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)*
*Последнее обновление: 22 января 2026 г. | Агент Vibes v3.0.0*
