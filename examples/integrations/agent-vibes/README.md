---
title: "Agent Vibes TTS — преобразование текста в речь для Claude Code"
description: "Сервер сообщества MCP, добавляющий возможности преобразования текста в речь в Claude Code"
tags: [mcp, integration, plugin]
---

# Agent Vibes TTS — преобразование текста в речь для Claude Code

**Status**: Сервер сообщества MCP (необязательно)
**Версия**: 3.0.0
**Maintainer**: [Пол Прейбиш](https://github.com/paulpreibisch/AgentVibes)
**License**: Apache 2.0

---

## Матрица быстрого принятия решений

Стоит ли устанавливать Agent Vibes? Используйте эту матрицу:

| Вариант использования | Рекомендация | Причина |
|----------|----------------|--------|
| Обзоры кода (слушайте во время многозадачности) | ⭐️⭐️⭐️⭐️⭐️ | Аудиоповествование освобождает ваши глаза |
| Длительные сеансы отладки | ⭐️⭐️⭐️⭐️ | Звуковые уведомления держат вас в курсе |
| Фокус-интенсивная работа | ⚠️ Может отвлекать | Рассмотрите возможность отключения звука во время глубокой работы |
| Оффлайн TTS (без интернета) | ✅Идеальная посадка | Piper TTS на 100% офлайн. |
| Премиальное качество передачи голоса | ❌ Используйте ElevenLabs | Agent Vibes = бесплатно, хорошее качество |
| французский язык | ⭐️⭐️⭐️⭐️ | 4 голоса FR (128 динамиков) |
| английский язык | ⭐️⭐️⭐️⭐️⭐️ | 12 EN-голосов (высокое качество) |

---

## 30-секундный обзор

Агент Вайбс добавляет **звуковое повествование** к Claude Code ответы с использованием:

- **15 голосов** (12 английских, 4 французских, включая 124 говорящих)
- **100% бесплатно** (Piper TTS + macOS Say)
- **100% автономен** (без зависимости от облака)
- **Установка за 18 минут** (5 фаз с КПП)
- **34 команды слэша** для голосового управления

**Установка**: [Полное руководство](./installation.md) | [Быстрый рабочий процесс](../../../guide/workflows/tts-setup.md)
**Использование**: [Голосовой каталог](./voice-catalog.md) | [Устранение неполадок](./troubleshooting.md)

---

## <a name="how-it-works"></a>Как это работает

### Архитектура

```
Claude Code Response
    ↓
.claude/hooks/play-tts.sh (Router)
    ↓
[Mute Check] → Exit if muted
    ↓
[Provider Manager]
    ├─ piper   → Piper TTS (offline, neural voices)
    ├─ macos   → macOS Say (native, instant)
    └─ termux  → Android via SSH
    ↓
[Voice Processing]
    ├─ Load voice model (~60MB)
    ├─ Generate audio (~200ms)
    ├─ Apply effects (reverb, echo)
    └─ Mix background music (optional)
    ↓
[Audio Output] → afplay (macOS) / speaker
```

**Производительность (M1 Mac)**:
- Генерация звука: ~200 мс
- Общая задержка: ~280 мс (генерация + эффекты + воспроизведение)
- Использование оперативной памяти: ~50 МБ
- ЦП: ~80% пик (200 мс), затем бездействие

---

## Быстрый старт (5 минут)

### <a name="prerequisites"></a>Предварительные условия

- macOS с Homebrew
- Bash 5.x (Агент Vibes поможет установить)
- Node.js 16+ (для установки)

### Установка

```bash
# 1. Install Agent Vibes (interactive, 4 pages)
npx agentvibes install

# 2. Choose Piper TTS provider (recommended)
# Select: Piper > fr_FR-tom-medium > Light reverb > Low verbosity

# 3. Verify installation
ls -la .claude/hooks/play-tts.sh
ls -la ~/.claude/piper-voices/
```

**Застрял?** См. [Полное руководство по установке](./installation.md) или [Устранение неполадок](./troubleshooting.md)

### Первый тест

```bash
# Launch Claude Code
claude

# In Claude, test TTS
/agent-vibes:whoami
/agent-vibes:list
> "Say hello in French"
```

Вы должны услышать аудио-повествование!

---

## Активация и деактивация

### Быстрый mute/Unmute

```bash
# In Claude Code
/agent-vibes:mute      # Mute (persists across sessions)
/agent-vibes:unmute    # Unmute

# Or manually
touch .claude/agentvibes-muted      # Project mute
touch ~/.agentvibes-muted           # Global mute
rm .claude/agentvibes-muted         # Project unmute
```

### Отключить иерархию

```
Priority 1: .claude/agentvibes-unmuted  (project override)
Priority 2: .claude/agentvibes-muted    (project mute)
Priority 3: ~/.agentvibes-muted         (global mute)
Priority 4: Active by default
```

**Example**: отключить звук глобально, включить звук для конкретного проекта:
```bash
touch ~/.agentvibes-muted                 # All projects muted
touch .claude/agentvibes-unmuted          # This project unmuted
```

### Полное удаление

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

## <a name="essential-commands"></a>Основные команды

### Управление провайдером

```bash
/agent-vibes:provider list              # List available providers
/agent-vibes:provider switch piper      # Switch to Piper TTS
/agent-vibes:provider switch macos      # Switch to macOS Say
/agent-vibes:provider info              # Current provider details
```

### Голосовое управление

```bash
/agent-vibes:list                       # List all voices
/agent-vibes:list first 5               # Show first 5 voices
/agent-vibes:switch fr_FR-tom-medium    # Switch to French male voice
/agent-vibes:whoami                     # Current voice & provider
/agent-vibes:preview                    # Preview first 3 voices
/agent-vibes:sample fr_FR-tom-medium    # Test specific voice
```

### Аудио контроль

```bash
/agent-vibes:mute                       # Mute all TTS
/agent-vibes:unmute                     # Unmute TTS
/agent-vibes:replay                     # Replay last audio
/agent-vibes:replay 2                   # Replay second-to-last
/agent-vibes:verbosity low              # Speak less (recommended)
/agent-vibes:verbosity medium           # Speak more
```

### Эффекты и персонализация

```bash
/agent-vibes:effects reverb light       # Add light reverb
/agent-vibes:effects off                # Disable all effects
/agent-vibes:background-music on        # Enable background music
/agent-vibes:background-music off       # Disable background music
/agent-vibes:personality sarcastic      # Change personality
/agent-vibes:personality professional   # Professional mode
```

### Команды утилиты

```bash
/agent-vibes:hide                       # Hide all 34 commands
/agent-vibes:show                       # Show commands again
/agent-vibes:version                    # Agent Vibes version
/agent-vibes:update                     # Update Agent Vibes
```

**Полный справочник команд**: доступно 34 команды. Используйте `/agent-vibes:hide`, если они загромождают вашу палитру команд.

---

## Краткий справочник по голосовому каталогу

### French Voices (4 модели, 128 динамиков)

| Голос | Пол | Качество | Спикеры | Вариант использования |
|-------|--------|---------|----------|----------|
| **fr_FR-tom-medium** | Мужской | Середина | 1 | ⭐️⭐️⭐️⭐️⭐️ Лучший кобель ФР |
| fr_FR-siwis-medium | Женский | Середина | 1 | Чистый, натуральный |
| fr_FR-upmc-medium | Нейтральный | Середина | 1 | Multi-purpose |
| **fr_FR-mls-medium** | Смешанный | Середина | 124 | ⭐️⭐️⭐️⭐️⭐️ Максимальное разнообразие |

**Мультидинамики**: `fr_FR-mls-medium` имеет 124 разных голоса (49 женских, 75 мужских). Используйте флаг `-s 0-123` для выбора конкретного динамика.

### Английские голоса (12 моделей)

| Голос | Пол | Качество | Характер |
|-------|--------|---------|-----------|
| **en_US-ryan-high** | Мужской | Высокий | ⭐️⭐️⭐️⭐️⭐️ Профессионал |
| en_US-amy-medium | Женский | Середина | Теплый, натуральный. |
| en_US-lessac-medium | Мужской | Середина | Авторитетный |
| en_US-libritts-high | Смешанный | Высокий | Очень естественно |
| ... | ... | ... | еще 8 голосов |

**Полный каталог с аудиосэмплами**: [Голосовой каталог](./voice-catalog.md)

---

## Распространенные случаи использования

### 1. Слушайте во время проверки кода

```bash
# Enable TTS with low verbosity
/agent-vibes:verbosity low

# Work on other tasks while listening to Claude's analysis
> "Review the authentication middleware for security issues"
```

### 2. Звуковые уведомления для длительных задач.

```bash
# Run long test suite, get notified when done
> "Run the full test suite and report failures"
# → Audio alert when tests complete
```

### 3. Режим изучения языка

```bash
# Enable dual-language TTS
/agent-vibes:learn on
/agent-vibes:target es_ES
/agent-vibes:target-voice es_ES-davefx-medium

# Responses spoken in both English and Spanish
> "Explain dependency injection"
```

### 4. Пользовательские хуки (только ошибки)

```bash
# Create selective TTS hook
cat > .claude/hooks/speak-errors-only.sh << 'EOF'
#!/opt/homebrew/bin/bash
INPUT=$(cat)
BODY=$(echo "$INPUT" | jq -r '.notification.body // empty')

# Speak only if contains "error" or "failed"
if [[ "$BODY" =~ (error|failed|Error|Failed) ]]; then
  ~/.claude/hooks/play-tts.sh "$BODY"
fi
exit 0
EOF

chmod +x .claude/hooks/speak-errors-only.sh
```

---

## Советы по производительности

### Уменьшите задержку

```bash
# Use low-quality voice (faster generation)
/agent-vibes:switch fr_FR-siwis-low  # If available

# Disable effects
/agent-vibes:effects off

# Disable background music
/agent-vibes:background-music off

# Result: ~150ms latency instead of ~280ms
```

### Оптимизация для аккумулятора

```bash
# macOS Say (instant, no CPU burst)
/agent-vibes:provider switch macos

# Trade-off: Lower quality, but 0ms generation time
```

### Уменьшите отвлечение

```bash
# Minimum verbosity
/agent-vibes:verbosity low

# Professional personality (less chatty)
/agent-vibes:personality professional

# Or mute during focus work
/agent-vibes:mute
```

---

## <a name="troubleshooting"></a>Поиск неисправностей

### Нет звука

```bash
# 1. Check mute status
ls -la .claude/agentvibes-muted ~/.agentvibes-muted

# 2. Verify provider
cat .claude/tts-provider.txt

# 3. Test Piper manually
echo "Test" | piper -m ~/.claude/piper-voices/fr_FR-tom-medium.onnx \
  --output-file /tmp/test.wav && afplay /tmp/test.wav
```

**Решение**: См. [Руководство по устранению неполадок](./troubleshooting.md) для получения подробной диагностики.

### Голос звучит как робот

**Решение**: Переключиться на качественную модель:
```bash
# Download high-quality voice
cd ~/.claude/piper-voices
curl -L -o fr_FR-siwis-high.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/high/fr_FR-siwis-high.onnx"

/agent-vibes:switch fr_FR-siwis-high
```

### 34 команды загромождают палитру команд

**Решение**: Скрыть их:
```bash
/agent-vibes:hide

# Unhide later if needed
/agent-vibes:show
```

**Еще проблемы?** Проверьте [Руководство по устранению неполадок](./troubleshooting.md)

---

## Конфигурационные файлы

| Файл | Цель | Формат |
|------|---------|--------|
| `.claude/tts-provider.txt` | Активный провайдер | `piper` или `macos` или `termux` |
| `.claude/tts-voice.txt` | Активный залог | `fr_FR-tom-medium` |
| `.claude/agentvibes-muted` | Статус проекта без звука | Существование = отключено |
| `~/.agentvibes-muted` | Глобальный статус отключения звука | Существование = отключено |
| `.claude/config/audio-effects.cfg` | Конфигурация аудиоэффектов | Ключ=Формат значения |
| `~/.claude/piper-voices/*.onnx` | Голосовые модели | Модели нейронных сетей |

---

## Сопутствующая документация

- **[Руководство по установке](./installation.md)** — полная 18-минутная процедура установки
- **[Каталог голосов](./voice-catalog.md)** — все 15 голосов с аудиосэмплами.
- **[Устранение неполадок](./troubleshooting.md)** — распространенные проблемы и решения
- **[TTS Рабочий процесс установки](../../../guide/workflows/tts-setup.md)** — Пошаговая установка
- **[AI Ecosystem](../../../guide/ecosystem/ai-ecosystem.md#5-voice-to-text-tools-wispr-flow-superwhisper)** — TTS в контексте ИИ

---

## <a name="resources"></a>Ресурсы

- **GitHub**: https://github.com/paulpreibisch/AgentVibes
- **Веб-сайт**: https://agentvibes.org
- **Демо-видео**: https://youtu.be/ngLiA_KQtTA
- **Голоса Пайпер**: https://huggingface.co/rhasspy/piper-voices
- **Образцы Piper**: https://rhasspy.github.io/piper-samples/

---

## Содействие

Agent Vibes — это общественный проект. Сообщите о проблемах или внесите свой вклад:
- **Проблемы**: https://github.com/paulpreibisch/AgentVibes/issues
- **License**: Apache 2.0

---

*Руководство по интеграции, поддерживаемое [Claude Code Ultimate Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)*
*Последнее обновление: 22 января 2026 г. | Агент Vibes v3.0.0 | Пайпер ТТС v1.3.0*
