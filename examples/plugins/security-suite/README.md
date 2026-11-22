# Плагин пакета безопасности

**Полное усиление безопасности рабочих процессов Claude Code за 5 минут.**

Этот плагин объединяет все, что вам нужно для защиты вашей установки Claude Code: автоматическое сканирование безопасности, шлюзы предварительной фиксации, отслеживание угроз, проверки соответствия и аудит конфигурации.

## Что включено

✓ **Агент аудитора безопасности**: Специалист по моделированию угроз и анализу CVE.
✓ **Быстрая проверка безопасности**: 30-секундное сканирование конфигурации
✓ **Полный аудит безопасности**: 6-этапное глубокое погружение с оценкой /100.
✓ **Шлюзы безопасности Pre-Commit**: блокируйте опасные операции перед выполнением.
✓ **Аудит конфигурации**: Проверка операторов, навыков и качества команд.
✓ **Шаблоны соответствия**: Автоматизированные контрольные списки для управления

## Быстрая установка

```bash
# From this directory:
bash install.sh

# Verify installation:
/security-check
/security-audit
/audit-agents-skills
```

**Время:** 5 минут. Никаких внешних зависимостей.

## Компоненты

### 1. Агент аудитора безопасности

Специалист-агент, специализирующийся исключительно на анализе безопасности.

```bash
# Assign to a complex threat modeling task:
@security-auditor Analyze this multi-agent setup for supply chain risks
```

**Capabilities:**
- Отслеживание CVE и оценка воздействия
- Обнаружение уязвимостей цепочки поставок
- Проверка безопасности сервера MCP
- Пользовательский анализ рисков skill/hook
- Сопоставление требований соответствия

### 2. Быстрая проверка безопасности (`/security-check`)

30-секундное сканирование. Запускайте перед фиксацией или развертыванием.

```bash
/security-check
```

**Что он проверяет:**
- ✓ Изоляция CLAUDE.md (секреты не раскрываются)
- ✓ Конфигурации сервера MCP (опасные разрешения?)
- ✓ Объем выполнения хука (слишком либерален?)
- ✓ Ограничения инструментов агента (правильно изолированы?)
- ✓ Разрешения Settings.json (заблокированы?)

**Output:**
```
Security Check: 87/100 ✓ PASS
- Agents properly isolated ✓
- No dangerous MCP configs ⚠️ REVIEW: 1 issue
- Hooks validated ✓
- CLAUDE.md secure ✓
```

### 3. Полный аудит безопасности (`/security-audit`)

6-фазное глубокое погружение, 2-5 минут. Комплексная оценка угроз.

```bash
/security-audit
```

**6 Фазы:**
1. **Аудит конфигурации**: настройки, разрешения, секреты
2. **Agent Security**: ограничения инструмента, изоляция, возможности
3. **Skill/Hook Анализ**: Качество кода, опасные шаблоны
4. **MCP Проверка**: разрешения сервера, обработка токенов.
5. **Цепочка поставок**: анализ зависимостей, внешняя интеграция
6. **Проверка соответствия**: корпоративные требования, управление

**Output:**
```
Security Audit Report
════════════════════════════════════════════
Config Audit:      ████░░░░░░  80/100
Agent Security:    ██████░░░░  85/100
Skill/Hook Review: ██░░░░░░░░  20/100  ⚠️ ACTION REQUIRED
MCP Vetting:       ███░░░░░░░  65/100  ⚠️ WARNINGS
Supply Chain:      ████░░░░░░  78/100
Compliance:        ██████░░░░  88/100

OVERALL: 72/100 — Intermediate Security Posture

Critical Issues (fix immediately):
  • 3 skills use eval() — Replace with safe parsing
  • GitHub MCP has write access to all repos — Scope to specific repos
  • Hook security-check.sh runs as root — Drop privileges

Warnings (fix within 2 weeks):
  • CLAUDE.md stores test API keys — Use environment variables
  • Agent tool permissions not clearly documented

Recommendations:
  • Read: guide/security/security-hardening/
  • Reference: guide/security/ for threat patterns
  • Use: /self-assessment → identify security gaps → take training
```

### 4. Аудит конфигурации (`/audit-agents-skills`)

Проверьте качество ваших пользовательских агентов, навыков и команд.

```bash
/audit-agents-skills
/audit-agents-skills --fix          # Get fix suggestions
/audit-agents-skills ~/other-dir    # Audit another project
```

**Checks:**
- ✓ У агентов есть соответствующие ограничения по инструментам.
- ✓ В навыках используется правильная структура фронтмена.
- ✓ Команды имеют понятные описания
- ✓ Никаких жестко запрограммированных секретов или ключей API.
- ✓ Все вызовы инструментов безопасны

### 5. Хуки безопасности

**Хук предварительной фиксации:** `security-gate.sh`
Блокирует опасные операции до их выполнения:
- Предотвращает `eval()` в пользовательском коде.
- Останавливает секретное раскрытие (ключи API, токены)
- Проверяет синтаксис ловушки
- Проверяет шаблоны внедрения команд

**Хук после выполнения:** `security-check.sh`
Проверяет выходные данные на предмет проблем безопасности:
- Обнаруживает случайное раскрытие секрета
- Проверяет попытки обхода пути
- Мониторинг использования ресурсов (обнаружение DoS)
- Отмечает опасные закономерности

## Сценарии использования

### Сценарий 1. Обеспечение безопасности команды

```
1. Run: /security-audit
2. Review report and fix Critical issues
3. Run: /audit-agents-skills --fix
4. Share results with team
5. Monthly re-audits to track improvement
```

### Сценарий 2: Оценка стороннего навыка

```
1. Download skill to examples/skills/
2. Run: /audit-agents-skills
3. Review tool restrictions and code patterns
4. If safe, integrate; otherwise reject
```

### Сценарий 3: Усиление производства

```
1. Run: /security-audit (current posture baseline)
2. Address all Critical issues
3. Read: guide/security/production-safety/
4. Implement recommended patterns
5. Re-audit until 90+ score achieved
```

### Сценарий 4: Проверка соответствия

```
1. Run: /security-audit
2. Check Compliance phase (item 6)
3. Map gaps to regulatory requirements
4. Create compliance.md documenting adherence
5. Audit quarterly
```

## Конфигурация

### Включение хука

Если хуки не включаются автоматически, добавьте в `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/bash/security-gate.sh",
            "timeout": 3000
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": ".*",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/bash/security-check.sh",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### <a name="environment-variables"></a>Переменные среды

Настройте параметры безопасности:

```bash
# Maximum tool timeouts (prevent DoS)
export CLAUDE_SECURITY_TIMEOUT=30000

# Enable strict mode (block all unreviewed code)
export CLAUDE_SECURITY_STRICT=true

# Security audit level (quick|standard|paranoid)
export CLAUDE_SECURITY_LEVEL=standard
```

## Путь обучения

**После установки:**

1. **Понимать угрозы** → Читать `guide/security/security-hardening/`
2. **Оцените свои настройки** → Запустите `/security-check`
3. **Получить подробный отчет** → Запустить `/security-audit`
4. **Исправить проблемы** → Следовать рекомендациям
5. **Глубокое погружение** → Используйте `/self-assessment` для выявления пробелов в знаниях по безопасности.
6. **Verify** → Повторяйте аудит, пока не достигнете целевого показателя (рекомендуется 85+/100)

## Удалить

```bash
bash uninstall.sh
```

При этом будут удалены все компоненты Security Suite, но сохранены ваши резервные копии (файлы `.bak`).

## Получение помощи

- **Вопросы?** → См. `guide/security/`, чтобы узнать о шаблонах угроз и способах их устранения.
- **Конкретные вопросы аудита?** → Используйте агент аудита безопасности
- **Нужна информация об угрозах?** → Проверьте `guide/core/known-issues/` на наличие активных CVE.
- **Принятие в команде?** → Проведите аудит всей команды, обобщите результаты, выявите общие пробелы

## Версия

- **Версия плагина:** 1.0.0
- **Требуется:** Claude Code 2.1.0+
- **Совместимые модели:** Opus 5,5, Sonnet 5,5, Haiku 5,5

## Лицензия

CC BY-SA 4.0 — Пользуйтесь свободно, изменяйте по мере необходимости, делитесь улучшениями.

---

**Готовы усилить настройки?** Запустите `/security-check` прямо сейчас.
