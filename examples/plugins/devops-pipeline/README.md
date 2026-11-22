# Плагин конвейера DevOps

CI/CD автоматизация, развертывание и управление инфраструктурой.

## <a name="install"></a>Установка

```bash
bash install.sh
```

## Компоненты

- **devops-sre Agent**: Специалист по инфраструктуре и развертыванию
- Команда **/ship**: полный рабочий процесс развертывания
- Рабочий процесс **GitHub Actions**: Автоматизированный CI/CD в вашем репозитории

## <a name="quick-start"></a>Быстрый старт

```bash
# Deploy to production
/ship --env production

# Check deployment status
!git log --oneline -5

# Configure CI/CD
# Review .github/workflows/claude-code-review.yml
```

## <a name="features"></a>Функции

✓ Автоматизированное развертывание
✓ Проверка инфраструктуры
✓ Поддержка отката
✓ Мониторинг здоровья
✓ Интеграция оповещений

---

Полную документацию смотрите в `guide/ops/devops-sre.md`.
