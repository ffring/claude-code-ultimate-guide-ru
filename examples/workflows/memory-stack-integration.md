---
title: "Интеграция стека памяти: реальный многодневный рабочий процесс"
description: "Пример 5-дневного спринта, объединяющего claude-mem, Serena, grepai и rg для рефакторинга аутентификации"
tags: [workflow, memory, integration]
---

# Интеграция стека памяти: реальный многодневный рабочий процесс

**Сценарий**: Рефакторинг системы аутентификации с сеансовой на JWT за 5-дневный спринт

**Используемые инструменты**: claude-mem (автозахват) + Serena (решения вручную) + grepai (обнаружение) + rg (точный поиск)

**Project**: Электронная коммерция API (Node.js/TypeScript, 50 тыс. строк, более 200 файлов)

---

## День 1: Открытие и планирование

### Утро: Первоначальное исследование.

**User**: «Давайте изучим текущую систему аутентификации»

**Claude** (пока без claude-mem):
```bash
# Manual discovery
rg "authenticate|session" --type ts | head -20
# 47 matches across 12 files
```

**Проблема**: слишком много файлов, нет контекста при принятии архитектурных решений.

---

### После установки claude-mem

```bash
# Install claude-mem
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
# Restart Claude Code
```

**User**: «Изучите архитектуру аутентификации»

**Claude** (теперь с автозахватом):
```bash
# 1. SEMANTIC DISCOVERY (grepai)
grepai search "authentication and session management"
# → Finds:
#   - src/auth/auth.service.ts (main service)
#   - src/middleware/session.middleware.ts (session handling)
#   - src/controllers/user.controller.ts (endpoints)
#   - config/session.config.ts (session config)

# 2. STRUCTURAL OVERVIEW (Serena)
serena get_symbols_overview --file src/auth/auth.service.ts
# → AuthService class:
#   - login(email, password)
#   - logout(sessionId)
#   - validateSession(sessionId)
#   - createSession(userId)

# 3. CALL GRAPH (grepai)
grepai trace callers "createSession"
# → Called by:
#   - UserController.login() (47 times)
#   - AdminController.authenticate() (12 times)
#   - OAuthController.callback() (8 times)

# 4. EXACT SEARCH (rg)
rg "express-session" --type ts
# → Found in:
#   - package.json (dependency)
#   - session.middleware.ts (import)
#   - app.ts (config)
```

**claude-mem** автоматически записывает:
- Прочитано 4 файла (auth.service.ts, session.middleware.ts, user.controller.ts, session.config.ts)
- 67 вызовов инструментов (чтение, поиск, трассировка)
- Ключевой вывод: «Текущая система использует экспресс-сессию, хранящуюся в Redis».

---

### Вторая половина дня: Архитектурное решение.

**User**: «Следует ли нам использовать JWT или придерживаться сеансов?»

**Discussion**:
- JWT: без сохранения состояния, масштабируемый, без зависимости от Redis.
- Сеансы: управление на стороне сервера, простой отзыв
- **Decision**: JWT для API, сохранение сеансов для веб-панели.

**Рекордное решение (Серена)**:
```bash
serena write_memory "auth_architecture" "$(cat <<'EOF'
Decision: Migrate API to JWT, keep sessions for web dashboard.

Rationale:
- API clients (mobile, SPA) benefit from stateless JWT
- Web dashboard needs session revocation (admin logout)
- Hybrid approach: /api/* uses JWT, /admin/* uses sessions

Library choice: jose (vs jsonwebtoken)
- Lighter (40% fewer dependencies)
- Better TypeScript support
- Active maintenance (last update: 2 weeks ago)

Next steps:
1. Install jose
2. Create JwtService
3. Update UserController to use JWT for /api/* routes
4. Keep SessionMiddleware for /admin/* routes
EOF
)"
```

**claude-mem** автоматически записывает:
- Обсуждение решения (сжатое резюме)
- Серена, вызов write_memory
- Обоснование использования библиотеки JWT + jose

---

### Конец дня 1

**Claude** автоматически генерирует сводку сеанса:
```
Session Summary (Day 1):
- Explored authentication system (4 key files identified)
- Current: express-session + Redis
- Decision: Migrate to JWT for API, keep sessions for admin
- Library: jose (lighter, better TS support)
- Next: Install jose, create JwtService
```

**claude-mem приборная панель** (`http://localhost:37777`):
- Хронология: 67 наблюдений
- Ключевые файлы: auth.service.ts, session.middleware.ts.
- Решение записано: auth_architecture

---

## День 2: Начало реализации

### Утро: возобновление сессии

**Claude** (автоматически внедряемый контекст):
```
📋 Previous Session (Day 1):
- Explored auth system (4 files: auth.service.ts, session.middleware.ts, user.controller.ts, session.config.ts)
- Decision: JWT for API, sessions for admin
- Library: jose (40% lighter than jsonwebtoken)
- Next steps: Install jose, create JwtService
```

**User**: «Давайте реализуем сервис JWT»

**Claude** (уже есть контекст, без перечитывания):
```bash
# Install jose
npm install jose

# Create JWT service
```

**Implementation**:
```typescript
// src/auth/jwt.service.ts
import * as jose from 'jose';

export class JwtService {
  private secret: Uint8Array;

  constructor(secretKey: string) {
    this.secret = new TextEncoder().encode(secretKey);
  }

  async generateToken(userId: string, email: string): Promise<string> {
    const jwt = await new jose.SignJWT({ userId, email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(this.secret);

    return jwt;
  }

  async verifyToken(token: string): Promise<{ userId: string; email: string }> {
    const { payload } = await jose.jwtVerify(token, this.secret);
    return payload as { userId: string; email: string };
  }
}
```

**claude-mem** автоматически записывает:
- npm install jose
- Реализация JwtService
- Сигнатуры методов (generateToken,verifyToken)

---

### Вторая половина дня: контрольный пункт принятия решения.

**User**: «Должны ли мы добавить токены обновления сейчас или позже?»

**Discussion**:
- Обновление токенов = лучшая безопасность (токены короткого доступа)
- НО: больше сложности, требуется хранилище базы данных.
- **Decision**: добавить на этапе 2 (после работы базового JWT)

**Рекордное решение (Серена)**:
```bash
serena write_memory "jwt_refresh_tokens" "$(cat <<'EOF'
Decision: Defer refresh tokens to Phase 2

Rationale:
- Phase 1: Basic JWT (access tokens only, 24h expiry)
- Phase 2: Add refresh tokens (1 week expiry, stored in DB)

Why defer:
- Validate JWT flow works first
- Avoid premature complexity
- Need to design refresh token storage schema

Reminder for Phase 2:
- Refresh tokens in separate table (id, userId, token, expiresAt)
- Rotation on refresh (invalidate old, issue new)
- Endpoint: POST /api/auth/refresh
EOF
)"
```

**claude-mem** автоматически записывает:
- Обновить обсуждение токена
- Решение об отсрочке
- Напоминание о втором этапе

---

### Конец дня 2

**Claude** автоматически генерирует сводку сеанса:
```
Session Summary (Day 2):
- Installed jose library
- Implemented JwtService (generateToken, verifyToken)
- Decision: Defer refresh tokens to Phase 2
- Next: Update UserController to use JwtService
```

**Состояние стека памяти**:

| Слой | Содержание | Инструмент |
|-------|---------|------|
| **Захват сеанса** | Наблюдения в дни 1-2 (всего 134) | claude-mem |
| **Решения вручную** | 2 памяти (auth_architecture, jwt_refresh_tokens) | Серена |
| **Обнаружение кода** | 4 файла проиндексированы, граф вызовов сопоставлен | грепай |

---

## День 3: Интеграция

### Утро: возобновление сессии

**Claude** (автоматически внедряемый контекст):
```
📋 Previous Sessions (Day 1-2):
- Day 1: Explored auth, decided JWT for API
- Day 2: Implemented JwtService, deferred refresh tokens to Phase 2
- Files modified: jwt.service.ts
- Next: Update UserController to use JwtService
```

**User**: «Обновить конечную точку входа, чтобы вернуть JWT»

**Claude** (уже знает контекст):
```bash
# 1. FIND DEPENDENCIES (grepai)
grepai trace callers "login"
# → UserController.login() called by 47 routes

# 2. READ CURRENT IMPLEMENTATION (rg + Read)
rg "async login" src/controllers/user.controller.ts -A 10
```

**Текущая реализация**:
```typescript
// src/controllers/user.controller.ts (before)
async login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await this.authService.authenticate(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // OLD: Create session
  const sessionId = await this.authService.createSession(user.id);
  req.session.userId = user.id;

  return res.json({ success: true, sessionId });
}
```

**Обновить до JWT**:
```typescript
// src/controllers/user.controller.ts (after)
import { JwtService } from '../auth/jwt.service';

async login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await this.authService.authenticate(email, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // NEW: Generate JWT
  const token = await this.jwtService.generateToken(user.id, user.email);

  return res.json({ success: true, token });
}
```

**claude-mem** автоматически записывает:
- Модификация UserController
- Удалены: вызов createSession, хранилище сеансов.
- Добавлено: генерация JWT.

---

### Вторая половина дня: обновление промежуточного программного обеспечения.

**User**: «Создать промежуточное программное обеспечение аутентификации JWT»

**Implementation**:
```typescript
// src/middleware/jwt.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../auth/jwt.service';

export function jwtAuthMiddleware(jwtService: JwtService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    try {
      const payload = await jwtService.verifyToken(token);
      req.user = payload; // Attach user to request
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
```

**Применить к маршрутам API**:
```typescript
// src/app.ts
import { jwtAuthMiddleware } from './middleware/jwt.middleware';

// Apply JWT middleware to /api/* routes
app.use('/api/*', jwtAuthMiddleware(jwtService));

// Keep session middleware for /admin/* routes
app.use('/admin/*', sessionMiddleware);
```

**claude-mem** автоматически записывает:
- Новое промежуточное программное обеспечение: jwt.middleware.ts.
- Разделение маршрута: /api/* (JWT) против /admin/* (сессии)
- Обратная совместимость сохраняется.

---

### Конец третьего дня

**User**: «Записать статус миграции»

**Обновление памяти Серены**:
```bash
serena write_memory "jwt_migration_status" "$(cat <<'EOF'
JWT Migration Status (Day 3):

✅ Completed:
- JwtService implemented (jose library)
- UserController.login() updated to return JWT
- jwtAuthMiddleware created and applied to /api/* routes
- Admin routes still use sessions (/admin/*)

📝 Files Modified:
- src/auth/jwt.service.ts (new)
- src/middleware/jwt.middleware.ts (new)
- src/controllers/user.controller.ts (updated)
- src/app.ts (route split)

🧪 Next Steps (Day 4):
1. Write tests for JwtService
2. Test login flow end-to-end
3. Update API clients to use JWT (frontend, mobile)
4. Monitor logs for any session-related errors

⚠️ Rollback Plan:
- Keep session code intact (not deleted)
- Can revert by changing app.ts route config
- Database unchanged (no schema migration needed)
EOF
)"
```

Панель управления **claude-mem** показывает:
- 3 дня истории
- всего 217 наблюдений
- 3 воспоминания Серены (arch,refresh_tokens,migration_status)
- 8 файлов изменено

---

## День 4: Тестирование и проверка

### Утро: возобновление сессии

**Claude** (автоматически внедряемый контекст):
```
📋 Previous Sessions (Day 1-3):
- Day 1: Explored auth, decided JWT
- Day 2: Implemented JwtService
- Day 3: Updated login endpoint, created JWT middleware
- Status: /api/* uses JWT, /admin/* uses sessions
- Next: Write tests, validate end-to-end
```

**User**: «Написание тестов для JwtService»

**Claude** (знает реализацию со второго дня):
```typescript
// src/auth/__tests__/jwt.service.test.ts
import { JwtService } from '../jwt.service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService('test-secret-key-32-chars-long!!');
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', async () => {
      const token = await jwtService.generateToken('user-123', 'test@example.com');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include userId and email in payload', async () => {
      const token = await jwtService.generateToken('user-456', 'user@example.com');
      const payload = await jwtService.verifyToken(token);

      expect(payload.userId).toBe('user-456');
      expect(payload.email).toBe('user@example.com');
    });

    it('should set 24h expiration', async () => {
      const token = await jwtService.generateToken('user-789', 'exp@example.com');
      const payload = await jwtService.verifyToken(token);

      // JWT exp is in seconds, not milliseconds
      const now = Math.floor(Date.now() / 1000);
      const expectedExp = now + (24 * 60 * 60); // 24 hours

      expect(payload.exp).toBeGreaterThan(now);
      expect(payload.exp).toBeLessThanOrEqual(expectedExp + 10); // 10s tolerance
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const token = await jwtService.generateToken('user-abc', 'valid@example.com');
      const payload = await jwtService.verifyToken(token);

      expect(payload).toEqual({
        userId: 'user-abc',
        email: 'valid@example.com',
        iat: expect.any(Number),
        exp: expect.any(Number)
      });
    });

    it('should throw on invalid token', async () => {
      await expect(jwtService.verifyToken('invalid.token.here'))
        .rejects.toThrow();
    });

    it('should throw on expired token', async () => {
      // Create token with -1h expiration (already expired)
      const jwtService2 = new JwtService('test-secret');
      const expiredToken = await jwtService2.generateToken('user-old', 'old@example.com');

      // Wait 2 seconds (simulate expiration)
      await new Promise(resolve => setTimeout(resolve, 2000));

      await expect(jwtService2.verifyToken(expiredToken))
        .rejects.toThrow('expired');
    });

    it('should throw on token with wrong secret', async () => {
      const token = await jwtService.generateToken('user-123', 'test@example.com');

      // Try to verify with different secret
      const jwtService2 = new JwtService('different-secret-key-here!!!!');
      await expect(jwtService2.verifyToken(token))
        .rejects.toThrow();
    });
  });
});
```

**Выполнить тесты**:
```bash
npm test jwt.service.test.ts

# Output:
# JwtService
#   generateToken
#     ✓ should generate valid JWT token (45ms)
#     ✓ should include userId and email in payload (32ms)
#     ✓ should set 24h expiration (28ms)
#   verifyToken
#     ✓ should verify valid token (21ms)
#     ✓ should throw on invalid token (15ms)
#     ✓ should throw on expired token (2018ms)
#     ✓ should throw on token with wrong secret (19ms)
#
# Tests: 7 passed, 7 total
```

**claude-mem** автоматически записывает:
- Тестовый файл создан (jwt.service.test.ts)
- 7 тестовых случаев (все пройдены)
- Проверены крайние случаи (недействительный, просроченный, неверный секретный код)

---

### Вторая половина дня: сквозное тестирование.

**User**: «Протестируйте весь процесс входа в систему»

**Ручное тестирование E2E**:
```bash
# 1. Login (get JWT)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTcwNzU4MjAwMCwiZXhwIjoxNzA3NjY4NDAwfQ.xYz..."
# }

# 2. Access protected API endpoint
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
# {
#   "userId": "user-123",
#   "email": "test@example.com",
#   "profile": { ... }
# }

# 3. Test without token (should fail)
curl -X GET http://localhost:3000/api/profile

# Response:
# { "error": "Missing or invalid token" }

# 4. Test admin route (should still use sessions)
curl -X GET http://localhost:3000/admin/dashboard \
  -H "Cookie: connect.sid=s%3A..."

# Response:
# { "dashboard": "admin data" }
```

**©Все тесты пройдены!**

**Подтверждение рекорда (Серена)**:
```bash
serena write_memory "jwt_validation_results" "$(cat <<'EOF'
JWT Validation Results (Day 4):

✅ Unit Tests: 7/7 passed
- Token generation works
- Token verification works
- Expiration handling correct
- Error cases handled (invalid, expired, wrong secret)

✅ E2E Tests: 4/4 passed
- Login returns JWT
- Protected routes accept JWT
- Unauthorized requests rejected
- Admin routes still use sessions (backward compatibility)

📊 Performance:
- Token generation: ~30ms
- Token verification: ~20ms
- No Redis dependency (stateless)

⚠️ Observations:
- Frontend needs update to store JWT (localStorage)
- Mobile app needs update to send Authorization header
- Consider token refresh after 24h (Phase 2)

✅ Ready for deployment
EOF
)"
```

---

### Конец четвертого дня

**Демо-версия поиска в памяти**:

```bash
# User searches session history
"Search my memory for JWT decisions"
```

**claude-mem возвращает**:
```
🔍 Found 3 relevant sessions:

Session 1 (Day 1):
- Decision: JWT for API, sessions for admin
- Library: jose (40% lighter)

Session 2 (Day 2):
- Implemented JwtService
- Deferred refresh tokens to Phase 2

Session 4 (Day 4):
- All tests passing (7/7 unit, 4/4 E2E)
- Ready for deployment
```

**Окончательное состояние стека памяти**:

| Слой | Содержание | Инструмент |
|-------|---------|------|
| **Захват сеанса** | 4 дня, 312 наблюдений | claude-mem |
| **Решения вручную** | 4 памяти (архивация, обновление, миграция, проверка) | Серена |
| **Обнаружение кода** | Изменено 8 файлов, обновлен график вызовов | грепай |

---

## День 5: Развертывание

### Утро: проверка перед развертыванием

**User**: «Чего мы достигли на этой неделе?»

**Claude** (запрос claude-mem):
```
"Show summary of JWT migration project"
```

**claude-mem подробное описание**:
```
📋 JWT Migration Project Summary (5 days):

Day 1: Discovery & Planning
- Explored auth system (4 key files)
- Decision: JWT for API, sessions for admin
- Library: jose (40% lighter, better TS)

Day 2: Implementation
- Installed jose
- Created JwtService (generateToken, verifyToken)
- Deferred refresh tokens to Phase 2

Day 3: Integration
- Updated UserController.login()
- Created jwtAuthMiddleware
- Applied to /api/*, kept sessions for /admin/*

Day 4: Testing
- Unit tests: 7/7 passed
- E2E tests: 4/4 passed
- Validation complete

📊 Impact:
- Files modified: 8
- Tool calls: 312
- Dependencies removed: express-session, connect-redis
- Dependencies added: jose
- Performance: Stateless (no Redis lookups)

✅ Ready for deployment
```

**Доступны воспоминания о Серене**:
```bash
serena list_memories

# Output:
# 1. auth_architecture (Day 1)
# 2. jwt_refresh_tokens (Day 2)
# 3. jwt_migration_status (Day 3)
# 4. jwt_validation_results (Day 4)
```

---

### Вторая половина дня: развертывание и передача

**User**: «Развертывание в промежуточной версии»

```bash
# Deploy to staging
git checkout -b feature/jwt-migration
git add .
git commit -m "feat: migrate API authentication to JWT

- Replace express-session with JWT (jose library)
- Apply JWT to /api/* routes
- Keep sessions for /admin/* routes
- Add comprehensive tests (7 unit, 4 E2E)
- All tests passing

Breaking changes: None (backward compatible)
Migration: None required (no DB changes)
Rollback: Change app.ts route config"

git push origin feature/jwt-migration

# Create PR
gh pr create --title "Migrate API to JWT authentication" \
  --body "$(serena read_memory jwt_migration_status)"
```

**Handoff Document** (автоматически генерируется из воспоминаний):
```bash
# Generate handoff doc from Serena memories
serena read_memory auth_architecture > docs/jwt-migration.md
serena read_memory jwt_migration_status >> docs/jwt-migration.md
serena read_memory jwt_validation_results >> docs/jwt-migration.md
```

**Result**: Полная документация архитектурных решений, деталей реализации и результатов проверки.

---

## 🎯 Ключевые выводы

### Стек памяти в действии

**Без стека памяти**:
- Перечитывайте файлы каждый день (~200 файлов × 5 дней = 1000 чтений)
- Потеря контекста между сессиями
- Забудьте об архитектурных решениях
- Ручное документирование решений

**со стеком памяти (claude-mem + Serena + grepai)**:
- Автоматическое добавление контекста каждое утро (0 перечитываний)
- Сохранившиеся архитектурные решения (4 воспоминания Серены)
- Граф вызовов поддерживается (следы grepai)
- Полная история сеанса (312 наблюдений)
- **Result**: 5-дневный проект завершен с полным сохранением контекста.

---

### Эффективность токена

| Метрика | Без | Со стеком памяти | Экономия |
|--------|---------|-------------------|---------|
| **Файл читает** | 1000 | 150 (снижение на 85%) | 850 прочтений |
| **Ввод токенов** | ~500k | ~75 тыс. (снижение 85%) | 425 тыс. токенов |
| **Потеря контекста** | Каждая сессия | Никогда | 100% удержание |
| **Отзыв решения** | Примечания к руководству | 4 воспоминания Серены | Мгновенный |

**Влияние прогрессивного раскрытия информации**:
- Сводный запрос дня 5: 3 слоя (поиск → временная шкала → подробности)
- Без: загрузить все 312 наблюдений (~ 50 тыс. токенов).
- С: Загрузить сводку → 5 сеансов → 1 деталь (~ 5 тыс. токенов)
- **Экономия**: 90% токенов

---

### Практические идеи

**Когда использовать каждый инструмент**:

1. **claude-mem** (автоматически):
   - Сеанс start/end (авто)
   - «Что мы делали вчера?»
   - «Покажи мне полную историю проекта»

2. **Serena** (ручной, повышенное значение):
   - Архитектурные решения
   - Выбор библиотеки
   - Статус миграции
   - Планы отката

3. **grepai** (семантическое открытие):
   - «Найти код аутентификации»
   - «Кто вызывает эту функцию?»
   - «Показать график зависимостей»

4. **rg** (точный поиск):
   - «Найти заявления об импорте»
   - «Показать все TODO»
   - «Grep для конкретного шаблона»

---

### <a name="cost-analysis"></a>Анализ затрат

**5-дневный проект**:

| Инструмент | Стоимость | Примечания |
|------|------|-------|
| **claude-mem** | $4.68 | 312 наблюдений × $0.15/100 |
| **Серена** | Бесплатно | Локальное хранилище |
| **grepai** | Бесплатно | Местный Оллама |
| **Итого** | **$4.68** | За 5 дней идеальной памяти |

**ROI**: на 850 меньше операций чтения файлов × ~500 tokens/read = 425 тыс. сохраненных токенов = 4,25 доллара США (при токенах $0.01/1k)

**Чистая стоимость**: 0,43 доллара США за полную память в течение 5 дней.

---

## 🔗 Ресурсы

**Инструменты стека памяти**:
- [claude-mem GitHub](https://github.com/thedotmack/claude-mem)
- [Серена GitHub](https://github.com/oraios/serena)
- [грепай GitHub](https://github.com/yoanbernabeu/grepai)

**Разделы руководства**:
- Раздел 8.2.3: Серена (память символов)
- Раздел 8.2.4: grepai (семантический поиск)
- Раздел 8.2.5: claude-mem (автоматическая память сеанса)
- Матрица решений для инструментов памяти: guide/ultimate-guide.md:8630

---

**Рабочий процесс создан**: 10 февраля 2026 г.
**Версия руководства**: 3.24.0
**Автор**: Florian BRUNIAUX + Claude (Anthropic)
