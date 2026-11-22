---
title: "Agent Vibes - Полный голосовой каталог"
description: "Справочный каталог доступных голосов TTS с рейтингами качества и языковой поддержкой."
tags: [reference, tts, integration]
---

# Agent Vibes - полный голосовой каталог

**Всего голосов**: 15 установленных + 50+ доступных
**Языки**: французский (4 модели, 128 динамиков), английский (12 моделей)

---

## Французские голоса (voix françaises)

### Обзор

| Голосовой идентификатор | Пол | Качество | Спикеры | Размер | Рекомендуется |
|----------|--------|---------|----------|------|-------------|
| **fr_FR-tom-medium** | Мужской | Середина | 1 | 60 МБ | ⭐️⭐️⭐️⭐️⭐️ Лучший кобель ФР |
| fr_FR-siwis-medium | Женский | Середина | 1 | 60 МБ | ⭐️⭐️⭐️⭐️ Чистый, натуральный. |
| fr_FR-upmc-medium | Нейтральный | Середина | 1 | 73 МБ | ⭐️⭐️⭐️ Многоцелевой. |
| **fr_FR-mls-medium** | Смешанный | Середина | **124** | 73 МБ | ⭐️⭐️⭐️⭐️⭐️ Максимальное разнообразие |

---

### fr_FR-tom-medium ⭐️⭐️⭐️⭐️⭐️

**Пол**: Мужской
**Качество**: Среднее
**Характер**: профессиональное, четкое произношение, нейтральный акцент.
**Best For**: техническая документация, обзоры кода, профессиональный контекст.
**Latency**: ~200 мс

**Usage**:
```bash
# In Claude Code
/agent-vibes:switch fr_FR-tom-medium

# Manual test
echo "Bonjour, je m'appelle Tom. Je suis une voix synthétique française." | \
  piper -m ~/.claude/piper-voices/fr_FR-tom-medium.onnx \
  --output-file /tmp/tom.wav && afplay /tmp/tom.wav
```

**Audio Sample**: Слушайте на https://rhasspy.github.io/piper-samples/ (поиск «fr_FR tom»)

---

### fr_FR-siwis-medium ⭐️⭐️⭐️⭐️

**Пол**: Женский
**Качество**: Среднее
**Character**: Теплый, естественный, слегка швейцарский акцент.
**Лучший вариант для**: учебные пособия, образовательный контент, дружеское общение.
**Latency**: ~200 мс

**Usage**:
```bash
# In Claude Code
/agent-vibes:switch fr_FR-siwis-medium

# Manual test
echo "Bonjour, je suis Siwis. J'ai une voix claire et agréable." | \
  piper -m ~/.claude/piper-voices/fr_FR-siwis-medium.onnx \
  --output-file /tmp/siwis.wav && afplay /tmp/siwis.wav
```

**Audio Sample**: https://rhasspy.github.io/piper-samples/ (поиск «fr_FR siwis»)

---

### fr_FR-upmc-medium ⭐️⭐️⭐️

**Gender**: нейтральный (слегка женский)
**Качество**: Среднее
**Характер**: Технический, точный, академический тон.
**Лучший вариант для**: научный контент, анализ данных, формальные презентации.
**Latency**: ~220 мс (большая модель)

**Usage**:
```bash
# In Claude Code
/agent-vibes:switch fr_FR-upmc-medium

# Manual test
echo "Analyse des données en cours. Résultats disponibles dans quelques instants." | \
  piper -m ~/.claude/piper-voices/fr_FR-upmc-medium.onnx \
  --output-file /tmp/upmc.wav && afplay /tmp/upmc.wav
```

**Audio Sample**: https://rhasspy.github.io/piper-samples/ (поиск «fr_FR upmc»)

---

### fr_FR-mls-medium ⭐️⭐️⭐️⭐️⭐️ (мультидинамик)

**Gender**: смешанный (49 женщин, 75 мужчин)
**Качество**: Среднее
**Ораторы**: **124 разных голоса**
**Персонаж**: Огромное разнообразие (молодые, старые, акценты, тона)
**Лучший вариант для**: симуляция диалогов, разнообразие, голоса персонажей.
**Latency**: ~200 мс + выбор динамика

**Usage**:
```bash
# In Claude Code (uses default speaker)
/agent-vibes:switch fr_FR-mls-medium

# Manual test with specific speaker (0-123)
echo "Je suis le speaker numéro 42" | \
  piper -m ~/.claude/piper-voices/fr_FR-mls-medium.onnx -s 42 \
  --output-file /tmp/mls-42.wav && afplay /tmp/mls-42.wav

# Test multiple speakers
for speaker in {0..5}; do
  echo "Bonjour, speaker $speaker" | \
    piper -m ~/.claude/piper-voices/fr_FR-mls-medium.onnx -s $speaker \
    --output-file /tmp/mls-$speaker.wav
  afplay /tmp/mls-$speaker.wav
  sleep 1
done
```

**Выбор динамика**:
- `0-48`: Женские голоса (всего 49)
- `49-123`: Мужские голоса (всего 75)

**Рекомендуемые динамики**:
| Идентификатор докладчика | Пол | Характер |
|------------|--------|-----------|
| 7 | Женский | Молодой, энергичный |
| 15 | Женский | Зрелый, профессиональный |
| 23 | Женский | Теплый, дружелюбный |
| 55 | Мужской | Глубокий, авторитетный |
| 72 | Мужской | Понятно, технично |
| 99 | Мужской | Молодой, непринужденный |

**Аудиообразцы**: https://rhasspy.github.io/piper-samples/ (поиск "fr_FR mls")

---

## Английские голоса (voix anglaises)

### Обзор

| Голосовой идентификатор | Пол | Качество | Характер | Рекомендуется |
|----------|--------|---------|-----------|-------------|
| **en_US-ryan-high** | Мужской | Высокий | Профессиональный | ⭐️⭐️⭐️⭐️⭐️ Best EN |
| en_US-amy-medium | Женский | Середина | Теплый, натуральный. | ⭐️⭐️⭐️⭐️ |
| en_US-lessac-medium | Мужской | Середина | Авторитетный | ⭐️⭐️⭐️⭐️ |
| en_US-libritts-high | Смешанный | Высокий | Очень естественно | ⭐️⭐️⭐️⭐️⭐️ |
| en_US-hfc_female-medium | Женский | Середина | Технический | ⭐️⭐️⭐️ |
| en_US-bryce-medium | Мужской | Середина | Молодой, динамичный | ⭐️⭐️⭐️ |
| en_US-danny-low | Мужской | Низкий | Быстро, эффективно | ⭐️⭐️ |
| en_US-kathleen-low | Женский | Низкий | Быстро, эффективно | ⭐️⭐️ |
| en_US-kusal-medium | Мужской | Середина | Индийский акцент | ⭐️⭐️⭐️ |
| en_US-kristin-medium | Женский | Середина | Чистый, нейтральный | ⭐️⭐️⭐️⭐️ |
| en_US-libritts_r-high | Смешанный | Высокий | Очень естественно | ⭐️⭐️⭐️⭐️⭐️ |
| 16динамиков | Мульти | Середина | 16 разных | ⭐️⭐️⭐️⭐️ |

---

### en_US-ryan-high ⭐️⭐️⭐️⭐️⭐️

**Пол**: Мужской
**Quality**: High (лучший английский голос)
**Персонаж**: профессиональный ведущий новостей, четкое произношение.
**Best For**: профессиональные презентации, документация, обзоры кода.
**Latency**: ~400 мс (модель высокого качества)

**Usage**:
```bash
/agent-vibes:switch en_US-ryan-high
```

---

### ru_US-amy-medium ⭐️⭐️⭐️⭐️

**Пол**: Женский
**Качество**: Среднее
**Персонаж**: Теплый, дружелюбный, разговорчивый.
**Лучший вариант для**: обучающие материалы, случайное взаимодействие, образовательный контент.
**Latency**: ~200 мс

**Usage**:
```bash
/agent-vibes:switch en_US-amy-medium
```

---

### ru_US-libritts-high ⭐️⭐️⭐️⭐️⭐️

**Gender**: смешанный (с несколькими динамиками)
**Качество**: Высокое
**Характер**: Очень естественный, выразительный.
**Best For**: высококачественное звуковое сопровождение.
**Latency**: ~400 мс

**Usage**:
```bash
/agent-vibes:switch en_US-libritts-high
```

---

### 16 динамиков ⭐️⭐️⭐️⭐️ (многоговорящий английский)

**Gender**: смешанный (8 женщин, 8 мужчин)
**Качество**: Среднее
**Speakers**: 16 разных английских голосов.
**Персонаж**: Разнообразие возрастов, акцентов, тонов.
**Лучший вариант для**: диалоги, разнообразие, повествование персонажей.
**Latency**: ~200 мс + выбор динамика

**Usage**:
```bash
# Default speaker
/agent-vibes:switch 16Speakers

# Specific speaker (0-15)
echo "I am speaker number 5" | \
  piper -m ~/.claude/piper-voices/16Speakers.onnx -s 5 \
  --output-file /tmp/16sp-5.wav && afplay /tmp/16sp-5.wav
```

---

## Голоса низкого качества (быстрее, низкое качество)

### Когда использовать некачественные

- Оптимизация батареи (производительность на 50 % быстрее)
- Приложения, чувствительные к задержке (требование <150 мс)
- Быстрое прототипирование или тестирование
- Фоновые уведомления (качество менее важно)

### В наличии некачественные модели.

| Голосовой идентификатор | Пол | Задержка | Качество |
|----------|--------|---------|---------|
| en_US-danny-low | Мужской | ~100 мс | ⭐️⭐️ |
| en_US-kathleen-low | Женский | ~100 мс | ⭐️⭐️ |
| fr_FR-gilles-low | Мужской | ~100 мс | ⭐️⭐️ |
| fr_FR-siwis-low | Женский | ~100 мс | ⭐️⭐️ |

**Загрузить голос низкого качества**:
```bash
cd ~/.claude/piper-voices
curl -L -o fr_FR-gilles-low.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx"
curl -L -o fr_FR-gilles-low.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx.json"
```

---

## Высококачественные голоса (медленнее, лучшее качество)

### Когда использовать высококачественные

- Профессиональные презентации
- Создание контента (видео, подкасты)
- Демонстрации или публичные витрины
- Когда задержка не критична

### Доступные модели высокого качества.

| Голосовой идентификатор | Пол | Задержка | Качество |
|----------|--------|---------|---------|
| en_US-ryan-high | Мужской | ~400 мс | ⭐️⭐️⭐️⭐️⭐️ |
| en_US-libritts-high | Смешанный | ~400 мс | ⭐️⭐️⭐️⭐️⭐️ |
| en_US-libritts_r-high | Смешанный | ~400 мс | ⭐️⭐️⭐️⭐️⭐️ |
| fr_FR-siwis-high | Женский | ~400 мс | ⭐️⭐️⭐️⭐️⭐️ |

**Загрузить высококачественный голос**:
```bash
cd ~/.claude/piper-voices
curl -L -o fr_FR-siwis-high.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/high/fr_FR-siwis-high.onnx"
curl -L -o fr_FR-siwis-high.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/high/fr_FR-siwis-high.onnx.json"
```

---

## Дополнительные языки

Piper TTS поддерживает языки **50+**. Загрузите дополнительные голоса из Hugging Face.

### Доступны популярные языки

| Язык | Доступные голоса | Репозиторий |
|----------|------------------|------------|
| испанский (es_ES) | 10+ голосов | [Link](https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES) |
| немецкий (de_DE) | 8+ голосов | [Link](https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE) |
| Итальянский (it_IT) | 6+ голосов | [Link](https://huggingface.co/rhasspy/piper-voices/tree/main/it/it_IT) |
| Португальский (pt_BR) | 5+ голосов | [Link](https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR) |
| Русский (ru_RU) | 4+ голоса | [Link](https://huggingface.co/rhasspy/piper-voices/tree/main/ru/ru_RU) |
| Китайский (zh_CN) | 3+ голоса | [Link](https://huggingface.co/rhasspy/piper-voices/tree/main/zh/zh_CN) |

### Скачать пример испанского голоса

```bash
cd ~/.claude/piper-voices

# Spanish male voice (Davefx - high quality)
curl -L -o es_ES-davefx-medium.onnx \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx"
curl -L -o es_ES-davefx-medium.onnx.json \
  "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx.json"

# Test
echo "Hola, soy Claude y hablo español" | \
  piper -m es_ES-davefx-medium.onnx \
  --output-file /tmp/es.wav && afplay /tmp/es.wav
```

---

## Рекомендации по выбору голоса

### По варианту использования

| Вариант использования | Рекомендуемый голос | Причина |
|----------|-------------------|--------|
| **Техническая документация** | fr_FR-tom-medium | Четкий, профессиональный, технический тон |
| **Проверки кода** | en_US-ryan-high | Авторитетное, четкое произношение |
| **Руководства** | fr_FR-siwis-medium | Теплый, дружелюбный, поучительный |
| **Фоновые уведомления** | fr_FR-gilles-low | Быстрый, эффективный, низкая задержка |
| **Профессиональные презентации** | en_US-ryan-high | Лучшее качество, профессионал |
| **Variety/Dialogue** | fr_FR-mls-medium | 124 разных голоса |
| **Оптимизация батареи** | Любой «-низкий» голос | Генерация на 50% быстрее |

### По языку

| Основной язык | Лучший голос | Альтернатива |
|------------------|------------|-------------|
| **Французский** | fr_FR-tom-medium | fr_FR-mls-medium (разновидность) |
| **Английский** | en_US-ryan-high | en_US-libritts-high |
| **Испанский** | es_ES-davefx-medium | es_ES-carlfm-medium |
| **Немецкий** | de_DE-thorsten-high | de_DE-kerstin-low |

---

## Инструмент сравнения голосов

Сравните голоса рядом:

```bash
# Create comparison script
cat > /tmp/compare-voices.sh << 'EOF'
#!/bin/bash
TEXT="$1"
VOICES=("fr_FR-tom-medium" "fr_FR-siwis-medium" "fr_FR-upmc-medium")

for voice in "${VOICES[@]}"; do
  echo "Testing $voice..."
  echo "$TEXT" | piper -m ~/.claude/piper-voices/${voice}.onnx \
    --output-file /tmp/${voice}.wav
  afplay /tmp/${voice}.wav
  sleep 2
done
EOF

chmod +x /tmp/compare-voices.sh

# Compare voices
/tmp/compare-voices.sh "Bonjour, ceci est un test de comparaison"
```

---

## <a name="resources"></a>Ресурсы

- **Репозиторий голосовых сообщений Piper**: https://huggingface.co/rhasspy/piper-voices
- **Аудиопримеры**: https://rhasspy.github.io/piper-samples/
- **Голосовое обучение**: https://github.com/rhasspy/piper/blob/master/TRAINING.md
- **Пользовательские голоса**: https://community.rhasspy.org/c/piper/

---

*Голосовой каталог, поддерживаемый [Claude Code Ultimate Guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide)*
*Последнее обновление: 22 января 2026 г. | Пайпер ТТС v1.3.0*
