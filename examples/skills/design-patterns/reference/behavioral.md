---
title: "Поведенческие шаблоны проектирования"
description: "Справочник по наблюдателю, стратегии, командованию, цепочке ответственности и другим моделям поведения."
tags: [reference, design-patterns, architecture]
---

# Поведенческие шаблоны проектирования

Шаблоны связаны с алгоритмами и распределением обязанностей между объектами с упором на шаблоны общения.

## <a name="chain-of-responsibility"></a>Цепочка ответственности

### Определение
Передаёт запросы по цепочке обработчиков, где каждый обработчик решает либо обработать запрос, либо передать его следующему обработчику.

### <a name="when-to-use"></a>Когда использовать
- [x] Запрос может обрабатывать более одного объекта, и обработчик заранее неизвестен.
- [x] Хотите отправить запрос без явного указания получателя
- [x] Набор обработчиков можно указать динамически.
- [x] Порядок обработки имеет значение

### Подпись TypeScript
```typescript
interface Handler {
  setNext(handler: Handler): Handler;
  handle(request: string): string | null;
}

abstract class AbstractHandler implements Handler {
  private nextHandler: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler; // Allows chaining: h1.setNext(h2).setNext(h3)
  }

  handle(request: string): string | null {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

class ConcreteHandlerA extends AbstractHandler {
  handle(request: string): string | null {
    if (request === 'A') {
      return `HandlerA processed ${request}`;
    }
    return super.handle(request);
  }
}

class ConcreteHandlerB extends AbstractHandler {
  handle(request: string): string | null {
    if (request === 'B') {
      return `HandlerB processed ${request}`;
    }
    return super.handle(request);
  }
}

// Usage
const handlerA = new ConcreteHandlerA();
const handlerB = new ConcreteHandlerB();
handlerA.setNext(handlerB);

console.log(handlerA.handle('B')); // HandlerB processed B
```

### Альтернативы для стека

**Промежуточное программное обеспечение Express**:
```typescript
app.use(authMiddleware);
app.use(loggingMiddleware);
app.use(errorMiddleware);
```

**NestJS Guards/Interceptors**:
```typescript
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor)
```

### Код пахнет, он исправляет
- **Тесная связь с обработчиком запроса.**: клиент не знает, какой обработчик обрабатывает запрос.
- **Сложная условная логика**: Каждый обработчик имеет простую логику.

---

## <a name="command"></a>Команда

### Определение
Инкапсулирует запрос как объект, позволяя параметризовать клиентов с различными запросами, ставить в очередь или регистрировать запросы, а также поддерживать отменяемые операции.

### Когда использовать
- [x] Параметризация объектов с помощью операций
- [x] Ставьте в очередь, указывайте и выполняйте запросы в разное время.
- [x] Поддержка операций undo/redo
- [x] Журнал изменений для восстановления системы после сбоя

### Подпись TypeScript
```typescript
// Command interface
interface Command {
  execute(): void;
  undo?(): void;
}

// Receiver
class Light {
  turnOn(): void {
    console.log('Light is on');
  }
  turnOff(): void {
    console.log('Light is off');
  }
}

// Concrete commands
class TurnOnCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOn();
  }

  undo(): void {
    this.light.turnOff();
  }
}

class TurnOffCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOff();
  }

  undo(): void {
    this.light.turnOn();
  }
}

// Invoker
class RemoteControl {
  private history: Command[] = [];

  execute(command: Command): void {
    command.execute();
    this.history.push(command);
  }

  undo(): void {
    const command = this.history.pop();
    if (command?.undo) {
      command.undo();
    }
  }
}

// Usage
const light = new Light();
const remote = new RemoteControl();

remote.execute(new TurnOnCommand(light));  // Light is on
remote.execute(new TurnOffCommand(light)); // Light is off
remote.undo();                             // Light is on
```

### Stack-Native: действия Redux
```typescript
const incrementAction = { type: 'INCREMENT', payload: 1 };
dispatch(incrementAction); // Command pattern
```

---

## Итератор

### Определение
Предоставляет способ последовательного доступа к элементам коллекции, не раскрывая ее базовое представление.

### Когда использовать
- [x] Необходимость доступа к содержимому коллекции, не раскрывая внутреннюю структуру.
- [x] Поддержка многократного обхода коллекций
- [x] Обеспечить единый интерфейс для перемещения по различным структурам.

### Подпись TypeScript
```typescript
// Iterator interface
interface Iterator<T> {
  next(): { value: T; done: boolean };
  hasNext(): boolean;
}

// Iterable collection
interface Iterable<T> {
  createIterator(): Iterator<T>;
}

// Concrete iterator
class ArrayIterator<T> implements Iterator<T> {
  private position = 0;

  constructor(private collection: T[]) {}

  next(): { value: T; done: boolean } {
    if (this.position < this.collection.length) {
      return { value: this.collection[this.position++], done: false };
    }
    return { value: null as any, done: true };
  }

  hasNext(): boolean {
    return this.position < this.collection.length;
  }
}

// Collection
class NumberCollection implements Iterable<number> {
  constructor(private items: number[]) {}

  createIterator(): Iterator<number> {
    return new ArrayIterator(this.items);
  }
}
```

### Встроенная поддержка JavaScript
```typescript
// Symbol.iterator
const collection = {
  items: [1, 2, 3],
  [Symbol.iterator]() {
    let index = 0;
    const items = this.items;
    return {
      next() {
        return index < items.length
          ? { value: items[index++], done: false }
          : { done: true, value: undefined };
      }
    };
  }
};

for (const item of collection) {
  console.log(item); // 1, 2, 3
}

// Generator (simpler)
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

for (const num of numberGenerator()) {
  console.log(num);
}
```

---

## <a name="mediator"></a>Посредник

### Определение
Определяет объект, который инкапсулирует взаимодействие набора объектов, обеспечивая слабую связь, не позволяя объектам явно ссылаться друг на друга.

### Когда использовать
- [x] Множество объектов взаимодействуют сложным образом
- [x] Повторное использование объекта затруднено, поскольку он ссылается на множество других.
- [x] Поведение, распределенное между классами, должно быть настраиваемым без создания подклассов.

### Подпись TypeScript
```typescript
// Mediator interface
interface Mediator {
  notify(sender: object, event: string): void;
}

// Concrete mediator
class ConcreteMediator implements Mediator {
  private component1: Component1;
  private component2: Component2;

  constructor(c1: Component1, c2: Component2) {
    this.component1 = c1;
    this.component1.setMediator(this);
    this.component2 = c2;
    this.component2.setMediator(this);
  }

  notify(sender: object, event: string): void {
    if (event === 'A') {
      console.log('Mediator reacts to A and triggers:');
      this.component2.doC();
    }
    if (event === 'D') {
      console.log('Mediator reacts to D and triggers:');
      this.component1.doB();
    }
  }
}

// Base component
class BaseComponent {
  protected mediator: Mediator | null = null;

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }
}

// Concrete components
class Component1 extends BaseComponent {
  doA(): void {
    console.log('Component 1 does A');
    this.mediator?.notify(this, 'A');
  }

  doB(): void {
    console.log('Component 1 does B');
  }
}

class Component2 extends BaseComponent {
  doC(): void {
    console.log('Component 2 does C');
  }

  doD(): void {
    console.log('Component 2 does D');
    this.mediator?.notify(this, 'D');
  }
}

// Usage
const c1 = new Component1();
const c2 = new Component2();
const mediator = new ConcreteMediator(c1, c2);

c1.doA();
// Output:
// Component 1 does A
// Mediator reacts to A and triggers:
// Component 2 does C
```

### Stack-Native: контекст реагирования
```typescript
const ChatContext = createContext<ChatMediator>(null!);

// Mediator as context
function ChatRoom({ children }: Props) {
  const sendMessage = (from: string, to: string, msg: string) => {
    // Mediator logic
  };

  return (
    <ChatContext.Provider value={{ sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}
```

### Код пахнет, он исправляет
- **Комплексная сеть взаимодействий**: Централизовано в посреднике
- **Объект Бога с множеством обязанностей**: Посредник фокусируется только на координации

---

## <a name="memento"></a>сувенир

### Определение
Захватывает и выводит внутреннее состояние объекта без нарушения инкапсуляции, поэтому объект можно восстановить в это состояние позже.

### Когда использовать
- [x] Нужны снимки объекта save/restore (undo/redo)
- [x] Прямой интерфейс с состоянием раскроет реализацию
- [x] Хотите сохранить границы инкапсуляции

### Подпись TypeScript
```typescript
// Memento
class Memento {
  constructor(private state: string, private date: Date) {}

  getState(): string {
    return this.state;
  }

  getDate(): Date {
    return this.date;
  }
}

// Originator
class Editor {
  private content: string = '';

  type(text: string): void {
    this.content += text;
  }

  getContent(): string {
    return this.content;
  }

  save(): Memento {
    return new Memento(this.content, new Date());
  }

  restore(memento: Memento): void {
    this.content = memento.getState();
  }
}

// Caretaker
class History {
  private mementos: Memento[] = [];

  push(memento: Memento): void {
    this.mementos.push(memento);
  }

  pop(): Memento | undefined {
    return this.mementos.pop();
  }
}

// Usage
const editor = new Editor();
const history = new History();

editor.type('Hello ');
history.push(editor.save());

editor.type('World');
history.push(editor.save());

editor.type('!!!');
console.log(editor.getContent()); // Hello World!!!

editor.restore(history.pop()!);
console.log(editor.getContent()); // Hello World
```

### Код пахнет, он исправляет
- **Отображение внутреннего состояния для отмены**: Memento инкапсулирует состояние
- **Комплексная логика отмены**: история управляет снимками

---

## <a name="observer"></a>наблюдатель

### Определение
Определяет зависимость между объектами «один ко многим», так что при изменении состояния одного объекта все его зависимые объекты уведомляются автоматически.

### Когда использовать
- [x] Изменение одного объекта требует изменения других (неизвестное число)
- [x] Объект должен уведомлять других, не зная, кто они.
- [x] Архитектуры, управляемые событиями
- [x] Реактивное программирование

### Подпись TypeScript
```typescript
// Observer interface
interface Observer {
  update(subject: Subject): void;
}

// Subject
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

// Concrete subject
class ConcreteSubject implements Subject {
  private observers: Observer[] = [];
  private state: number = 0;

  attach(observer: Observer): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }

  setState(state: number): void {
    this.state = state;
    this.notify();
  }

  getState(): number {
    return this.state;
  }
}

// Concrete observers
class ConcreteObserverA implements Observer {
  update(subject: ConcreteSubject): void {
    console.log(`ObserverA: State is now ${subject.getState()}`);
  }
}

class ConcreteObserverB implements Observer {
  update(subject: ConcreteSubject): void {
    console.log(`ObserverB: State is now ${subject.getState()}`);
  }
}

// Usage
const subject = new ConcreteSubject();
const observerA = new ConcreteObserverA();
const observerB = new ConcreteObserverB();

subject.attach(observerA);
subject.attach(observerB);

subject.setState(5);
// Output:
// ObserverA: State is now 5
// ObserverB: State is now 5
```

### Альтернативы для стека

**React**:
```typescript
const [value, setValue] = useState(0);
useEffect(() => {
  // Auto-notified on value change
}, [value]);
```

**RxJS**:
```typescript
const subject = new BehaviorSubject(0);
subject.subscribe(value => console.log(value));
subject.next(5); // Notifies subscribers
```

**Angular**:
```typescript
private data$ = new BehaviorSubject<Data>(initial);
getData() { return this.data$.asObservable(); }
```

### Код пахнет, он исправляет
- **Разрозненная логика уведомлений**: Централизовано по теме
- **Тесная связь**: Наблюдатели ничего не знают друг о друге

### Распространенные ошибки
- **Утечки памяти**: Забываем unsubscribe/detach
- **Штормы уведомлений**: слишком много обновлений запускают каскады
- **Зависимость от порядка**: Наблюдатели должны быть независимыми.

---

## Состояние

### Определение
Позволяет объекту изменять свое поведение при изменении его внутреннего состояния, что приводит к изменению его класса.

### Когда использовать
- [x] Поведение объекта зависит от его состояния
- [x] Операции имеют большие условные операторы, которые зависят от состояния.
- [x] Переходы между состояниями четко определены

### Подпись TypeScript
```typescript
// State interface
interface State {
  handle(context: Context): void;
}

// Context
class Context {
  private state: State;

  constructor(initialState: State) {
    this.state = initialState;
  }

  setState(state: State): void {
    console.log(`Context: Transitioning to ${state.constructor.name}`);
    this.state = state;
  }

  request(): void {
    this.state.handle(this);
  }
}

// Concrete states
class ConcreteStateA implements State {
  handle(context: Context): void {
    console.log('StateA handles request');
    context.setState(new ConcreteStateB());
  }
}

class ConcreteStateB implements State {
  handle(context: Context): void {
    console.log('StateB handles request');
    context.setState(new ConcreteStateA());
  }
}

// Usage
const context = new Context(new ConcreteStateA());
context.request(); // StateA handles request, transitions to StateB
context.request(); // StateB handles request, transitions to StateA
```

### Реальный мир: состояния документа
```typescript
interface DocumentState {
  publish(doc: Document): void;
  review(doc: Document): void;
}

class Draft implements DocumentState {
  publish(doc: Document): void {
    console.log('Cannot publish draft directly');
  }
  review(doc: Document): void {
    console.log('Sending for review');
    doc.setState(new InReview());
  }
}

class InReview implements DocumentState {
  publish(doc: Document): void {
    console.log('Publishing document');
    doc.setState(new Published());
  }
  review(doc: Document): void {
    console.log('Already in review');
  }
}

class Published implements DocumentState {
  publish(doc: Document): void {
    console.log('Already published');
  }
  review(doc: Document): void {
    console.log('Cannot review published document');
  }
}

class Document {
  private state: DocumentState = new Draft();

  setState(state: DocumentState): void {
    this.state = state;
  }

  publish(): void {
    this.state.publish(this);
  }

  review(): void {
    this.state.review(this);
  }
}
```

### Stack-Native: React useReducer
```typescript
const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'DRAFT': return { status: 'draft' };
    case 'REVIEW': return { status: 'review' };
    case 'PUBLISHED': return { status: 'published' };
  }
};

const [state, dispatch] = useReducer(reducer, { status: 'draft' });
```

### Код пахнет, он исправляет
- **Сложные условия для состояния**: каждое состояние представляет собой отдельный класс.
- **Разрозненное поведение, зависящее от состояния.**: локализовано в классах состояний.

---

## <a name="strategy"></a>Стратегия

### Определение
Определяет семейство алгоритмов, инкапсулирует каждый из них и делает их взаимозаменяемыми, позволяя алгоритму изменяться независимо от клиентов.

### Когда использовать
- [x] Многие родственные классы отличаются только поведением.
- [x] Нужны разные варианты алгоритма
- [x] Алгоритм использует данные, о которых клиенты не должны знать
- [x] Класс имеет несколько условных операторов для выбора поведения.

### Подпись TypeScript
```typescript
// Strategy interface
interface Strategy {
  execute(a: number, b: number): number;
}

// Concrete strategies
class AddStrategy implements Strategy {
  execute(a: number, b: number): number {
    return a + b;
  }
}

class MultiplyStrategy implements Strategy {
  execute(a: number, b: number): number {
    return a * b;
  }
}

// Context
class Calculator {
  constructor(private strategy: Strategy) {}

  setStrategy(strategy: Strategy): void {
    this.strategy = strategy;
  }

  calculate(a: number, b: number): number {
    return this.strategy.execute(a, b);
  }
}

// Usage
const calculator = new Calculator(new AddStrategy());
console.log(calculator.calculate(5, 3)); // 8

calculator.setStrategy(new MultiplyStrategy());
console.log(calculator.calculate(5, 3)); // 15
```

### Stack-Native: хуки React
```typescript
// Strategies as hooks
const useCreditPayment = () => ({ process: async (amount) => { /* ... */ } });
const usePaypalPayment = () => ({ process: async (amount) => { /* ... */ } });

const usePaymentStrategy = (type: PaymentType) => {
  const strategies = {
    credit: useCreditPayment(),
    paypal: usePaypalPayment(),
  };
  return strategies[type];
};

// Usage in component
const PaymentForm = ({ type }: Props) => {
  const strategy = usePaymentStrategy(type);
  const handlePay = () => strategy.process(amount);
};
```

### Код пахнет, он исправляет
- **Тип включения**: `switch (type) { case 'A': ... case 'B': ... }`
  → Заменить выбором стратегии
- **Жестко закодированные алгоритмы**: стратегии взаимозаменяемы

### Распространенные ошибки
- **Разрыв стратегий**: Слишком много мелких стратегий
- **Осведомленность клиента**: Клиент не должен знать детали стратегии

---

## <a name="template-method"></a>Шаблонный метод

### Определение
Определяет скелет алгоритма в методе, передавая некоторые шаги подклассам, позволяя подклассам переопределять определенные шаги без изменения структуры.

### Когда использовать
- [x] Реализуйте инвариантные части алгоритма один раз, а изменяющиеся части оставьте подклассам.
- [x] Общее поведение среди подклассов должно быть учтено и локализовано.
- [x] Расширения подкласса управления (операции-перехватчики)

### Подпись TypeScript
```typescript
abstract class AbstractClass {
  // Template method
  templateMethod(): void {
    this.baseOperation1();
    this.requiredOperation1();
    this.baseOperation2();
    this.hook();
    this.requiredOperation2();
  }

  // Implemented operations
  baseOperation1(): void {
    console.log('AbstractClass: base operation 1');
  }

  baseOperation2(): void {
    console.log('AbstractClass: base operation 2');
  }

  // Must be implemented by subclasses
  abstract requiredOperation1(): void;
  abstract requiredOperation2(): void;

  // Hook (optional override)
  hook(): void {
    // Default empty implementation
  }
}

class ConcreteClassA extends AbstractClass {
  requiredOperation1(): void {
    console.log('ConcreteClassA: operation 1');
  }

  requiredOperation2(): void {
    console.log('ConcreteClassA: operation 2');
  }

  hook(): void {
    console.log('ConcreteClassA: hook override');
  }
}

class ConcreteClassB extends AbstractClass {
  requiredOperation1(): void {
    console.log('ConcreteClassB: operation 1');
  }

  requiredOperation2(): void {
    console.log('ConcreteClassB: operation 2');
  }
}

// Usage
const classA = new ConcreteClassA();
classA.templateMethod();
```

### Код пахнет, он исправляет
- **Дублированная структура алгоритма**: Шаблон определяет общие шаги
- **Несогласованный порядок шагов**: шаблон обеспечивает соблюдение порядка

---

## Посетитель

### Определение
Представляет операцию, выполняемую над элементами структуры объекта, позволяющую определять новые операции без изменения классов элементов.

### Когда использовать
- [x] Структура объекта содержит множество классов с разными интерфейсами.
- [x] Над объектами необходимо выполнить множество различных операций.
- [x] Структура объекта меняется редко, но операции над ним происходят часто.

### Подпись TypeScript
```typescript
// Element interface
interface Element {
  accept(visitor: Visitor): void;
}

// Concrete elements
class ConcreteElementA implements Element {
  accept(visitor: Visitor): void {
    visitor.visitConcreteElementA(this);
  }

  operationA(): string {
    return 'A';
  }
}

class ConcreteElementB implements Element {
  accept(visitor: Visitor): void {
    visitor.visitConcreteElementB(this);
  }

  operationB(): string {
    return 'B';
  }
}

// Visitor interface
interface Visitor {
  visitConcreteElementA(element: ConcreteElementA): void;
  visitConcreteElementB(element: ConcreteElementB): void;
}

// Concrete visitor
class ConcreteVisitor implements Visitor {
  visitConcreteElementA(element: ConcreteElementA): void {
    console.log(`Visiting A: ${element.operationA()}`);
  }

  visitConcreteElementB(element: ConcreteElementB): void {
    console.log(`Visiting B: ${element.operationB()}`);
  }
}

// Usage
const elements: Element[] = [
  new ConcreteElementA(),
  new ConcreteElementB(),
];

const visitor = new ConcreteVisitor();
for (const element of elements) {
  element.accept(visitor);
}
```

### Код пахнет, он исправляет
- **Добавление новых операций требует изменения элементов.**: Посетитель выполняет внешние операции.
- **Операции, разбросанные по классам.**: Операции, связанные с группами посетителей.

### Распространенные ошибки
- **Добавление новых типов элементов**: требует изменения всех посетителей (жесткий)
- **Нарушение инкапсуляции**: посетителю может потребоваться доступ к внутренним компонентам

---

## Устный переводчик

### Определение
Определяет представление грамматики вместе с интерпретатором, который использует это представление для интерпретации предложений на языке.

### Когда использовать
- [x] Грамматика проста (для сложных грамматик используйте генераторы парсеров)
- [x] Эффективность не имеет решающего значения
- [x] Создание простого предметно-ориентированного языка (DSL)

### Подпись TypeScript
```typescript
// Context
class Context {
  constructor(public input: string) {}
}

// Abstract expression
interface Expression {
  interpret(context: Context): number;
}

// Terminal expression
class NumberExpression implements Expression {
  constructor(private value: number) {}

  interpret(context: Context): number {
    return this.value;
  }
}

// Non-terminal expressions
class AddExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  interpret(context: Context): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

class MultiplyExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  interpret(context: Context): number {
    return this.left.interpret(context) * this.right.interpret(context);
  }
}

// Usage: (5 + 3) * 2
const context = new Context('(5 + 3) * 2');
const expression = new MultiplyExpression(
  new AddExpression(
    new NumberExpression(5),
    new NumberExpression(3)
  ),
  new NumberExpression(2)
);

console.log(expression.interpret(context)); // 16
```

### Код пахнет, он исправляет
- **Сложная логика синтаксического анализа**: правила грамматики представляют собой явные классы.
- **Жесткая языковая интерпретация**: расширяемая грамматика

---

## Сводная таблица

| Шаблон | Сложность | Использовать частоту | Основное преимущество |
|---------|------------|---------------|--------------|
| Цепочка ответственности | Середина | Середина | Отделить отправителя от получателя |
| Команда | Середина | Середина | Параметризация, постановка в очередь, отмена операций |
| Итератор | Низкий | Высокий | Последовательный доступ без воздействия |
| Посредник | Середина | Середина | Уменьшить связь между объектами |
| сувенир | Середина | Низкий | Состояние Save/restore |
| наблюдатель | Низкий | Очень высокий | Уведомления «один ко многим» |
| Состояние | Середина | Середина | Зависимое от состояния поведение |
| Стратегия | Низкий | Высокий | Взаимозаменяемые алгоритмы |
| Шаблонный метод | Середина | Середина | Скелет алгоритма с вариантами |
| Посетитель | Высокий | Низкий | Операции над структурой объекта |
| Устный переводчик | Высокий | Очень низкий | Простая интерпретация DSL |

## Лучшие практики

1. **Observer**: всегда отписываться, чтобы предотвратить утечку памяти.
2. **Strategy против State**: стратегия меняет поведение извне; Состояние меняется внутри
3. **Использовать шаблоны фреймворка**: хуки React, RxJS, Redux предоставляют эти шаблоны.
4. **Команда для отмены**: сохранение истории объектов команд.
5. **Цепочка ответственности**: Сохраняйте простоту обработчиков, обеспечивайте обработку запросов

## Ссылки

- *Шаблоны проектирования: элементы многоразового объектно-ориентированного программного обеспечения* (Банда четырех)
- [Гуру рефакторинга: шаблоны поведения](https://refactoring.guru/design-patterns/behavioral-patterns)
- Документация [RxJS](https://rxjs.dev/)
