---
title: "Модели надежности производства"
description: "Проектирование эскалации, автоматические выключатели, структурированное распространение ошибок, постепенное ухудшение, передача обслуживания человеком и разрешение конфликтов источников для систем на базе Claude"
tags: [workflow, reliability, production, escalation, circuit-breaker, error-handling]
---

# Модели надежности производства

> **Confidence**: Уровень 2. Шаблоны, полученные в результате производственных развертываний. Основные принципы проектирования стабильны; конкретные пороговые значения и имена полей будут различаться в зависимости от системы.

Системы на базе Claude выходят из строя способами, отличными от традиционного программного обеспечения. Модель может выдавать синтаксически допустимые выходные данные, которые являются семантически неправильными, может отказываться продолжать работу, когда она не может продвигаться вперед, или может давать частичные результаты, когда исходные данные неполны. Приведенные ниже шаблоны описывают каждый из этих режимов сбоев в производстве.

---

## Оглавление

1. [Проект расширения](#escalation-design)
2. [Схема автоматического выключателя](#circuit-breaker-pattern)
3. [Распространение структурированных ошибок](#structured-error-propagation)
4. [Частичные результаты и аннотации к покрытию](#partial-results-and-coverage-annotations)
5. [Структурированная передача управления персоналом](#structured-human-handoff)
6. [Разрешение конфликта источников](#source-conflict-resolution)
7. [Anti-Patterns](#anti-patterns)
8. [См. также](#see-also)

---

## <a name="escalation-design"></a>Дизайн эскалации

Самая распространенная ошибка надежности — использование показателей достоверности LLM в качестве основного сигнала эскалации. Оценки уверенности не являются калиброванными вероятностями: модель может выдавать высокое значение достоверности, хотя фактически она неверна. Рост производства должен определяться программными сигналами, а не числовыми значениями достоверности.

### Три канонических триггера эскалации

В хорошо спроектированной системе эскалация происходит при выполнении ровно одного из трех условий.

**1. Явный запрос пользователя:** Клиент явно запрашивает человека. Это не подлежит обсуждению и имеет приоритет над любым другим сигналом, включая обнаружение разочарования. «Я хочу поговорить с человеком» — это сигнал, отличный от гневного тона, и он требует немедленной передачи управления, независимо от того, что ИИ мог бы сделать дальше.

**2. Пробел в политике:** Запрос выходит за рамки определенной системы и не может быть обработан никаким доступным инструментом или знаниями. Это не провал модели; это граница области действия. Правильный ответ — это структурированная эскалация с учетом контекста, а не цикл извинений.

**3. Невозможность прогресса:** После определенного количества попыток или вызовов инструментов система не выдала действительный результат. Это измеряется программно: исчерпан бюджет повторных попыток, разомкнут автоматический выключатель или произошел сбой цикла проверки.

### Программные сигналы эскалации

```python
from enum import Enum
from dataclasses import dataclass

class EscalationReason(Enum):
    EXPLICIT_REQUEST = "explicit_request"
    POLICY_GAP = "policy_gap"
    MAX_RETRIES_EXCEEDED = "max_retries_exceeded"
    CIRCUIT_BREAKER_OPEN = "circuit_breaker_open"
    MISSING_REQUIRED_TOOL = "missing_required_tool"

@dataclass
class EscalationSignal:
    should_escalate: bool
    reason: EscalationReason | None
    context: dict

def evaluate_escalation(
    user_message: str,
    attempt_count: int,
    policy_coverage: str,  # "covered" | "gap" | "out_of_scope"
    max_attempts: int = 3
) -> EscalationSignal:

    # Priority 1: explicit user request, check first, unconditionally
    if contains_explicit_escalation_request(user_message):
        return EscalationSignal(
            should_escalate=True,
            reason=EscalationReason.EXPLICIT_REQUEST,
            context={"trigger": "user_stated_intent"}
        )

    # Priority 2: policy gap
    if policy_coverage in ("gap", "out_of_scope"):
        return EscalationSignal(
            should_escalate=True,
            reason=EscalationReason.POLICY_GAP,
            context={"coverage": policy_coverage}
        )

    # Priority 3: inability to progress
    if attempt_count >= max_attempts:
        return EscalationSignal(
            should_escalate=True,
            reason=EscalationReason.MAX_RETRIES_EXCEEDED,
            context={"attempts": attempt_count, "max": max_attempts}
        )

    return EscalationSignal(should_escalate=False, reason=None, context={})

def contains_explicit_escalation_request(message: str) -> bool:
    explicit_phrases = [
        "speak to a human", "talk to a person", "real agent",
        "human agent", "transfer me", "escalate this",
        "supervisor", "manager"
    ]
    message_lower = message.lower()
    return any(phrase in message_lower for phrase in explicit_phrases)
```

### Разочарование против явной эскалации

Это два совершенно разных сигнала, которые требуют противоположной реакции. Разочарование (гневный тон, повторяющиеся вопросы, «это бесполезно») — это сигнал, чтобы сочувственно признать ситуацию и попробовать другой подход. Явный запрос на эскалацию («Я хочу поговорить с человеком») является сигналом к ​​немедленному прекращению связи.

Их объединение — распространенная ошибка с реальными последствиями: перенаправление разочарованных пользователей к людям, когда они просто хотели получить лучший ответ, или продолжение попыток, когда пользователь уже решил, что им нужен агент-человек.

```python
def classify_user_signal(message: str) -> dict:
    # These patterns can coexist: check both independently
    frustration_markers = [
        "this is ridiculous", "not helpful", "keep asking",
        "not answering", "useless", "terrible", "waste"
    ]
    escalation_markers = [
        "speak to a human", "real person", "agent", "transfer",
        "supervisor", "escalate", "don't want ai"
    ]

    message_lower = message.lower()

    return {
        "frustrated": any(m in message_lower for m in frustration_markers),
        "wants_escalation": any(m in message_lower for m in escalation_markers)
    }

# Usage:
signals = classify_user_signal(user_message)

if signals["wants_escalation"]:
    initiate_human_handoff(context)   # immediate, unconditional
elif signals["frustrated"]:
    adjust_response_approach()        # more empathetic, different angle
```

### <a name="rule-based-routing-from-structured-output"></a>Маршрутизация на основе правил из структурированного вывода

Там, где это возможно, получайте решения по эскалации на основе структурированных выходных полей, а не на основе уверенности на уровне модели. Если модель дает структурированный результат с `policy_gap: true` или `requires_human_review: true`, эти поля являются детерминированными сигналами маршрутизации, без необходимости интерпретации показателя достоверности.

```python
@dataclass
class AgentDecision:
    response_text: str
    policy_gap: bool
    requires_human_review: bool
    coverage_level: str  # "full" | "partial" | "none"
    missing_information: list[str]

def route_from_structured_output(decision: AgentDecision) -> str:
    if decision.policy_gap or decision.coverage_level == "none":
        return "escalate"
    if decision.requires_human_review or decision.coverage_level == "partial":
        return "queue_for_review"
    return "respond"
```

---

## <a name="circuit-breaker-pattern"></a>Схема автоматического выключателя

Автоматический выключатель не позволяет сбойной зависимости (API, инструмент, внешняя служба) создавать каскадные сбои. Без него каждый вызов агента, затрагивающий неисправную службу, будет зависать до истечения времени ожидания, потребляя ресурсы и ухудшая работу всего конвейера.

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"        # normal operation
    OPEN = "open"            # failing, reject calls immediately
    HALF_OPEN = "half_open"  # testing recovery

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        success_threshold: int = 2
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.success_threshold = success_threshold

        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time: float | None = None

    def call(self, func, *args, **kwargs):
        if self.state == CircuitState.OPEN:
            if self._should_attempt_recovery():
                self.state = CircuitState.HALF_OPEN
                self.success_count = 0
            else:
                raise CircuitOpenError(
                    f"Circuit open since {self.last_failure_time:.0f}. "
                    f"Recovery in {self._time_until_recovery():.0f}s"
                )

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception:
            self._on_failure()
            raise

    def _on_success(self):
        if self.state == CircuitState.HALF_OPEN:
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = CircuitState.CLOSED
                self.failure_count = 0

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

    def _should_attempt_recovery(self) -> bool:
        if self.last_failure_time is None:
            return True
        return time.time() - self.last_failure_time >= self.recovery_timeout

    def _time_until_recovery(self) -> float:
        if self.last_failure_time is None:
            return 0.0
        return max(0.0, self.recovery_timeout - (time.time() - self.last_failure_time))

class CircuitOpenError(Exception):
    pass
```

### Изоляция каждого документа в пакетных конвейерах

В конвейерах пакетной обработки каждый документ должен иметь собственную границу ошибок. Сбой одного документа не должен прерывать выполнение оставшегося пакета.

```python
def process_document_batch(documents: list[str], processor) -> list[dict]:
    results = []
    circuit_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=30.0)

    for doc_id, document in enumerate(documents):
        try:
            result = circuit_breaker.call(processor, document)
            results.append({"doc_id": doc_id, "status": "success", "result": result})
        except CircuitOpenError as e:
            # Circuit open: skip remaining docs and surface the condition upstream
            results.append({"doc_id": doc_id, "status": "circuit_open", "error": str(e)})
            for remaining_id in range(doc_id + 1, len(documents)):
                results.append({
                    "doc_id": remaining_id,
                    "status": "skipped",
                    "reason": "circuit_open"
                })
            break
        except Exception as e:
            results.append({"doc_id": doc_id, "status": "error", "error": str(e)})

    return results
```

Автоматический выключатель замыкается на уровне партии, а не на уровне документа. Когда он открывается, вы хотите знать, что базовая служба недоступна, а не что три отдельных документа последовательно вышли из строя.

---

## <a name="structured-error-propagation"></a>Структурированное распространение ошибок

В многоагентных системах ошибки, передаваемые как общие строки исключений, теряют контекст, необходимый для восстановления. Структурированные ошибки содержат информацию, необходимую вышестоящему оркестратору для принятия решения о повторной попытке, изменении маршрута или эскалации.

```python
from dataclasses import dataclass

@dataclass
class StructuredAgentError:
    error_category: str           # "tool_failure" | "validation_error" | "policy_gap" | "timeout"
    is_retryable: bool
    failure_type: str             # specific subtype within the category
    attempted_query: str | None   # what was tried (useful for debugging)
    partial_results: dict | None  # any usable output produced before the failure
    alternative_approach: str | None  # suggestion for the orchestrator
    error_message: str
    attempt_count: int = 1

    def to_dict(self) -> dict:
        return {
            "error_category": self.error_category,
            "is_retryable": self.is_retryable,
            "failure_type": self.failure_type,
            "attempted_query": self.attempted_query,
            "has_partial_results": self.partial_results is not None,
            "alternative_approach": self.alternative_approach,
            "error_message": self.error_message,
            "attempt_count": self.attempt_count
        }

# Usage in a sub-agent:
def search_database(query: str) -> dict:
    try:
        return db.search(query)
    except DatabaseTimeoutError:
        raise StructuredAgentError(
            error_category="tool_failure",
            is_retryable=True,
            failure_type="database_timeout",
            attempted_query=query,
            partial_results=None,
            alternative_approach="retry with narrower query or use cached results",
            error_message="Database query timed out after 30s"
        )
    except NoResultsError:
        raise StructuredAgentError(
            error_category="tool_failure",
            is_retryable=False,
            failure_type="no_results",
            attempted_query=query,
            partial_results=None,
            alternative_approach="try broader search terms or escalate to human",
            error_message=f"No results found for query: {query}"
        )

# Orchestrator handling:
def orchestrate_with_recovery(agent_fn, query: str, max_retries: int = 2) -> dict:
    for attempt in range(max_retries + 1):
        try:
            return agent_fn(query)
        except StructuredAgentError as e:
            if not e.is_retryable or attempt == max_retries:
                return {
                    "status": "failed",
                    "error": e.to_dict(),
                    "partial_results": e.partial_results,
                    "requires_escalation": not e.is_retryable
                }
            # Retryable: apply the suggested alternative approach if present
            if e.alternative_approach:
                query = refine_query(query, e.alternative_approach)
```

Ключевое поле — `is_retryable`. Оркестратор, который не может определить, следует ли повторять попытку или эскалацию, по умолчанию будет повторять все, что приводит к трате бюджета на неповторяемые ошибки и пропуску окна на временные ошибки.

---

## <a name="partial-results-and-coverage-annotations"></a>Частичные результаты и аннотации покрытия

Когда конвейер не может полностью выполнить задачу, возврат частичных результатов с явными аннотациями покрытия более полезен, чем возврат ничего. Затем потребитель может решить, является ли частичный результат действенным, без необходимости понимать внутреннюю структуру того, что не удалось.

```python
from dataclasses import dataclass

@dataclass
class AnalysisResult:
    full_analysis: str | None
    section_results: dict[str, dict]  # section_id -> result
    coverage_summary: dict

def annotate_coverage(section_results: dict) -> dict:
    coverage_map = {}
    for section_id, result in section_results.items():
        if result.get("status") == "success" and result.get("confidence", 0) >= 0.8:
            coverage_map[section_id] = "well-supported"
        elif result.get("status") == "success":
            coverage_map[section_id] = "partially-supported"
        else:
            coverage_map[section_id] = "gap"

    counts = {"well-supported": 0, "partially-supported": 0, "gap": 0}
    for v in coverage_map.values():
        counts[v] += 1

    return {
        "sections": coverage_map,
        "counts": counts,
        "overall_coverage": counts["well-supported"] / len(coverage_map) if coverage_map else 0.0,
        "has_gaps": counts["gap"] > 0
    }
```

Поверхностные аннотации покрытия в ответе, чтобы последующие потребители могли действовать с ними без анализа внутреннего состояния:

```
CONTRACT ANALYSIS SUMMARY

Section 1 (Payment Terms): well-supported (full analysis available)
Section 2 (Liability Clauses): partially-supported (analysis based on partial text; recommend manual review)
Section 3 (Termination Rights): gap (source text was unreadable; human review required)

Overall coverage: 67% (2 of 3 sections fully analyzed)
```

Этот шаблон применим везде, где конвейер может выдать неполный результат: извлечение документов, исследование из нескольких источников, пакетный перевод или проверки соответствия нормативным требованиям, когда в некоторых разделах отсутствуют подтверждающие данные.

---

## <a name="structured-human-handoff"></a>Структурированная передача управления человеком

Когда происходит эскалация, агент-человек получает структурированную полезную информацию, а не необработанную историю разговоров. Цель состоит в том, чтобы человек мог начать работать в течение 30 секунд, не перечитывая весь журнал разговоров.

```python
from dataclasses import dataclass
from datetime import datetime

@dataclass
class HandoffPayload:
    customer_id: str
    session_id: str
    escalation_reason: str        # from EscalationReason enum
    original_request: str         # verbatim first user message
    conversation_summary: str     # 3-5 sentence summary of what happened
    root_cause: str               # why the AI could not resolve this
    actions_taken: list[str]      # what was tried
    recommended_next_action: str  # specific suggestion for the human agent
    partial_results: dict | None  # any useful output produced
    urgency: str                  # "high" | "medium" | "low"
    created_at: str               # ISO 8601

def build_handoff(
    session: dict,
    escalation_signal: EscalationSignal,
    conversation_history: list[dict]
) -> HandoffPayload:
    return HandoffPayload(
        customer_id=session["customer_id"],
        session_id=session["session_id"],
        escalation_reason=escalation_signal.reason.value,
        original_request=conversation_history[0]["content"] if conversation_history else "",
        conversation_summary=summarize_conversation(conversation_history),
        root_cause=derive_root_cause(escalation_signal),
        actions_taken=extract_actions_taken(session),
        recommended_next_action=suggest_next_action(escalation_signal),
        partial_results=session.get("partial_results"),
        urgency="high" if escalation_signal.reason == EscalationReason.EXPLICIT_REQUEST else "medium",
        created_at=datetime.utcnow().isoformat()
    )
```

### Формат отображения передачи обслуживания

То, что на самом деле видит агент-человек, следует воспринимать как структурированное описание, а не как дамп данных:

```
ESCALATION BRIEF: Session a1b2c3d4
Reason: Customer requested human agent
Urgency: HIGH

ORIGINAL REQUEST
"I need to cancel my subscription and get a refund for last month's charge"

WHAT HAPPENED
The customer asked to cancel their subscription and requested a refund for the
charge processed on May 18. The AI confirmed account details and found the charge
($49.00) but hit a policy gap: refund approval for charges older than 7 days
requires manual authorization. Two escalation attempts were made; the customer
then explicitly requested a human agent.

ACTIONS TAKEN
- Account verified (customer_id: 88821)
- Charge located: $49.00 on 2026-05-18
- Subscription status: active

RECOMMENDED NEXT ACTION
Authorize refund for $49.00 (charge is 6 days old, within 7-day window) and
process cancellation. No additional verification needed.
```

Поле `recommended_next_action` — самая ценная часть. Человек-агент, получивший конкретную рекомендацию, решает проблему быстрее и с меньшей вероятностью будет просить клиента повторить информацию.

---

## <a name="source-conflict-resolution"></a>Разрешение конфликта источников

Когда несколько источников не согласны, стратегия разрешения зависит от того, почему они не согласны. Временные различия (один источник новее другого) требуют иного подхода, чем фактические конфликты (источники примерно одного и того же периода времени расходятся во мнениях относительно фактов).

```python
@dataclass
class Source:
    source_id: str
    content: str
    publication_date: str | None  # ISO 8601, mandatory for temporal disambiguation
    source_type: str              # "official" | "news" | "user_generated" | "internal"
    authority_score: float        # 0.0-1.0, domain-specific

def resolve_conflict(sources: list[Source], field: str) -> dict:
    values = [s for s in sources if get_field_value(s, field) is not None]

    if len(values) <= 1:
        return {"resolved": values[0] if values else None, "conflict": False}

    # Check for temporal difference first
    dated = [s for s in values if s.publication_date is not None]
    if len(dated) == len(values):
        sorted_by_date = sorted(dated, key=lambda s: s.publication_date, reverse=True)
        newest = sorted_by_date[0]
        second_newest = sorted_by_date[1] if len(sorted_by_date) > 1 else None

        if (second_newest is not None and
                get_field_value(newest, field) == get_field_value(second_newest, field)):
            # Two most recent sources agree: likely a correct update
            return {
                "resolved": newest,
                "conflict": False,
                "resolution_method": "temporal_precedence"
            }

    # Genuine factual conflict: do not resolve automatically
    return {
        "resolved": None,
        "conflict": True,
        "conflict_type": "factual",
        "conflicting_sources": [s.source_id for s in values],
        "requires_human_review": True
    }
```

Всегда включайте `publication_date` в исходные метаданные. Без этого временное устранение неоднозначности невозможно, и то, что выглядит как фактический конфликт, может быть просто устаревшим источником, который еще не удален.

### Выявление конфликтов на выходе

Если настоящий конфликт не может быть разрешен автоматически, выявите его явно, а не молча выбирайте один источник:

```
FIELD: regulatory_status

SOURCE A (internal-policy-doc, 2026-01-15): "Approved for EU markets"
SOURCE B (legal-review-2026, 2026-03-22): "Pending re-approval: EU regulatory update in progress"

CONFLICT TYPE: factual (same field, same jurisdiction, different values)
RESOLUTION: Cannot auto-resolve. Human review required before using this field.
```

Это лучше, чем возвращать один ответ без указания авторства. Потребитель, который видит уверенный ответ, не зная, что он оспаривается, не может принять обоснованное решение о том, действовать ли в соответствии с ним.

---

## Anti-patterns

**Использование оценок уверенности в качестве логики маршрутизации.** Оценки уверенности из LLM не являются калиброванными вероятностями. Вместо этого используйте программные сигналы: счетчик повторов, состояние схемы, структурированные поля вывода.

**Объединение разочарования с намерением эскалации.** Разочарованные пользователи часто хотят получить лучший ответ, а не человека. Пользователи, которые говорят: «Мне нужен человек», всегда хотят человека. Относитесь к ним как к отдельным сигналам с разными реакциями.

**Передача неструктурированных исключений между агентами.** Строка типа `"DatabaseError: connection refused"` ничего не сообщает оркестратору о том, следует ли повторять попытку или переходить на более высокий уровень. Используйте структурированные типы ошибок с `is_retryable`, `error_category` и `alternative_approach`.

**Ничего не возвращать, если существуют частичные результаты.** Частичный результат с четкой аннотацией покрытия почти всегда более полезен, чем пустой ответ с сообщением об ошибке. Потребитель может решить, что делать с «покрытием 67%»; они не могут ничего решить из-за «анализ не удался».

**Пропуск `publication_date` в исходных метаданных.** Без дат временные конфликты выглядят как фактические конфликты. Каждый источник, попадающий в конвейер, должен иметь дату, даже приблизительную.

**Создание передачи обслуживания как дампа разговора.** Вставка последних 20 ходов разговора в заявку не является передачей обслуживания; это работа-перевод. Структурированная полезная нагрузка передачи обслуживания с помощью `recommended_next_action` — это то, что отличает хорошую систему эскалации от медленной.

---

## <a name="see-also"></a>См. также

- [Команды агентов](agent-teams.md): архитектура orchestrator/subagent и маршрутизация инструментов
- [Event-Driven Agents](event-driven-agents.md): автоматизация на основе триггеров и циклы повтора
- [Task Management](task-management.md): постоянное состояние для многоэтапных рабочих процессов агента.
- [Plan-Driven Workflow](plan-driven.md): этап планирования перед выполнением для уменьшения сбоев в середине задачи
