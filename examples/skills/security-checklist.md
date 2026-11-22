---
name: security-checklist
description: "Комплексный контрольный список безопасности для веб-приложений"
effort: medium
---

# Навык проверки безопасности

## Быстрый аудит безопасности

### Аутентификация
- [ ] Пароли, хешированные с помощью bcrypt/argon2 (коэффициент стоимости >= 10).
- [ ] Токены сеанса являются криптографически случайными.
- [ ] Токены JWT имеют короткий срок действия (доступ 15 минут, обновление 7 дней).
- [ ] Ограничение скорости на конечных точках входа
- [ ] Блокировка аккаунта после неудачных попыток

### Авторизация
- [ ] Каждая конечная точка API проверяет разрешения.
- [ ] Нет IDOR (небезопасные прямые ссылки на объекты)
- [ ] Реализовано ролевое управление доступом
- [ ] Чувствительные операции требуют повторной аутентификации.

### Проверка ввода
- [ ] Все вводимые пользователем данные проверяются на стороне сервера.
- [ ] Загрузка файлов ограничена типом и размером
- [ ] SQL-запросы используют параметризованные операторы
- [ ] Вывод HTML закодирован для предотвращения XSS

### <a name="data-protection"></a>Защита данных
- [ ] Конфиденциальные данные зашифрованы при хранении
- [ ] HTTPS применяется повсюду
- [ ] Безопасные файлы cookie (HttpOnly, Secure, SameSite)
- [ ] Никаких конфиденциальных данных в URL-адресах или журналах.

### Заголовки и CORS
- [ ] Набор заголовков Content-Security-Policy
- [ ] X-Content-Type-Options: nosniff
- [ ] Параметры X-Frame: DENY (или SAMEORIGIN)
- [ ] Строгая транспортная безопасность включена
- [ ] CORS должным образом ограничен

## Шаблоны кода

### Предотвращение SQL-инъекций
```javascript
// VULNERABLE
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// SECURE
db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### предотвращение XSS
```javascript
// VULNERABLE
element.innerHTML = userInput;

// SECURE
element.textContent = userInput;

// SECURE (with sanitization)
element.innerHTML = DOMPurify.sanitize(userInput);
```

### CSRF-защита
```javascript
// Generate token
const csrfToken = crypto.randomBytes(32).toString('hex');
session.csrfToken = csrfToken;

// Validate on POST
if (req.body.csrf !== session.csrfToken) {
  throw new ForbiddenError('Invalid CSRF token');
}
```

### Управление секретами
```javascript
// NEVER in code
const API_KEY = 'sk-abc123...';

// Environment variables
const API_KEY = process.env.API_KEY;

// Secrets manager (production)
const secret = await secretsManager.getSecret('api-key');
```

## Пример заголовков безопасности

```javascript
// Express middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

## Безопасность зависимостей

```bash
# Check for vulnerabilities
npm audit

# Auto-fix what's possible
npm audit fix

# Check outdated packages
npm outdated

# Update dependencies
npm update
```

## Регистрация событий безопасности

```javascript
// Events to log
logger.security({
  event: 'login_failed',
  ip: req.ip,
  email: req.body.email,
  reason: 'invalid_password',
  timestamp: new Date().toISOString()
});

// Never log
// - Passwords
// - Full credit card numbers
// - Session tokens
// - Personal data (in production)
```

## Контрольный список перед развертыванием

1. [ ] Запускаем `npm audit` - критических уязвимостей нет.
2. [ ] Все секреты в переменных среды
3. [ ] Режим отладки отключен
4. [ ] Сообщения об ошибках не раскрывают внутренние компоненты
5. [ ] Только HTTPS (HTTP перенаправляет на HTTPS)
6. [ ] Учетные данные базы данных заменены
7. [ ] Ведение журнала настроено (без конфиденциальных данных)
8. [ ] Стратегия резервного копирования протестирована
