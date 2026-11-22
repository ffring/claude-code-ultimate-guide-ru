# Интерактивные инструменты

Подсказки и утилиты для настройки и оптимизации Claude Code.

## Содержание

| Файл | Описание | Использование |
|------|-------------|-------|
| [audit-prompt.md](./audit-prompt.md) | Комплексный аудит настройки с персонализированными рекомендациями (8 параметров, оценка /100) | `cat audit-prompt.md \| claude` |
| [permissions-audit-prompt.md](./permissions-audit-prompt.md) | Проверьте, образуют ли ваши правила разрешений границы: общие разрешения на выполнение, запрет и запрос покрытия, состояние песочницы (6 этапов, оценка / 100, включая проверку парка) | `cat permissions-audit-prompt.md \| claude` |
| [context-audit-prompt.md](./context-audit-prompt.md) | Измеряйте и улучшайте свою контекстную архитектуру | `cat context-audit-prompt.md \| claude` |
| [spec-completeness-audit.md](./spec-completeness-audit.md) | Проверка того, насколько хорошо проект соответствует делегированию безопасного агента (5 уровней спецификации, оценка /100). | `cat spec-completeness-audit.md \| claude` |
| [audit-cheatsheet-prompt.md](./audit-cheatsheet-prompt.md) | Оцените, нужна ли проекту шпаргалка, и проведите аудит существующих | `cat audit-cheatsheet-prompt.md \| claude` |
| [onboarding-prompt.md](./onboarding-prompt.md) | Персонализированная экскурсия по вашему профилю | `cat onboarding-prompt.md \| claude` |
| [mobile-access.md](./mobile-access.md) | Руководство по настройке мобильного доступа через ttyd + Tailscale | Step-by-step |

## Какой аудит когда

| Вопрос | Инструмент |
|----------|------|
| Вся ли моя установка здорова? | `audit-prompt.md` |
| Действительно ли мои правила разрешений запрещают что-либо? | `permissions-audit-prompt.md` |
| Я теряю контекст? | `context-audit-prompt.md` |
| Могу ли я безопасно делегировать работу агенту здесь? | `spec-completeness-audit.md` |
| Есть ли в этом репозитории секреты или поверхности для инъекций? | `/security-audit` (команда косой черты) |

## Быстрый аудит

Для быстрого автоматического сканирования используйте вместо этого скрипт:

```bash
# Pinned to a reviewed commit: download, read, then run, instead of piping a moving branch into bash
AUDIT_SCAN_REF=eab8adc215822f67629b6a0f9366f60a1db9b03c
curl -fsSL "https://raw.githubusercontent.com/FlorianBruniaux/claude-code-ultimate-guide/${AUDIT_SCAN_REF}/examples/scripts/audit-scan.sh" -o audit-scan.sh
less audit-scan.sh
bash audit-scan.sh
```

---

*Вернуться к [main README](../README.md)*
