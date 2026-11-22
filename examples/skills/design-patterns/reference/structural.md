---
title: "Структурные шаблоны проектирования"
description: "Справочник по адаптерам, декораторам, фасадам, прокси и другим шаблонам композиции."
tags: [reference, design-patterns, architecture]
---

# Структурные шаблоны проектирования

Шаблоны, которые касаются композиции объектов и отношений между сущностями, предоставляя способы сборки объектов и классов в более крупные структуры.

## <a name="adapter"></a>Адаптер

### Определение
Преобразует интерфейс класса в другой интерфейс, ожидаемый клиентами, позволяя несовместимым интерфейсам работать вместе.

### <a name="when-to-use"></a>Когда использовать
- [x] Хотите использовать существующий класс с несовместимым интерфейсом
- [x] Необходимость интеграции сторонних библиотек с разными интерфейсами
- [x] Хотите создать повторно используемый класс, который взаимодействует с несвязанными классами.
- [x] Устаревший код должен работать с новыми системами

### Подпись TypeScript
```typescript
// Target interface (what client expects)
interface Target {
  request(): string;
}

// Adaptee (existing incompatible class)
class Adaptee {
  specificRequest(): string {
    return '.eetpadA eht fo roivaheb laicepS';
  }
}

// Adapter (makes Adaptee compatible with Target)
class Adapter implements Target {
  private adaptee: Adaptee;

  constructor(adaptee: Adaptee) {
    this.adaptee = adaptee;
  }

  public request(): string {
    const result = this.adaptee.specificRequest().split('').reverse().join('');
    return `Adapter: ${result}`;
  }
}

// Client code
function clientCode(target: Target) {
  console.log(target.request());
}

// Usage
const adaptee = new Adaptee();
const adapter = new Adapter(adaptee);
clientCode(adapter);
```

### Пример из реальной жизни: интеграция сторонних библиотек
```typescript
// Third-party library (can't modify)
class XMLDataProvider {
  getXMLData(): string {
    return '<data><item>1</item></data>';
  }
}

// Your application expects JSON
interface JSONDataProvider {
  getJSONData(): object;
}

// Adapter
class XMLToJSONAdapter implements JSONDataProvider {
  constructor(private xmlProvider: XMLDataProvider) {}

  getJSONData(): object {
    const xml = this.xmlProvider.getXMLData();
    // Convert XML to JSON (simplified)
    return { data: { item: '1' } };
  }
}

// Usage
const xmlProvider = new XMLDataProvider();
const adapter = new XMLToJSONAdapter(xmlProvider);
const data = adapter.getJSONData();
```

### Маркеры обнаружения
- Класс реализует целевой интерфейс
- Содержит ссылку на адаптируемого
- Делегаты для адаптации с преобразованием интерфейса
- Такие имена, как `*Adapter`, `*Wrapper`.

### Код пахнет, он исправляет
- **Несовместимые интерфейсы**: обеспечивает совместимость устаревшего или стороннего кода.
- **Распространение интерфейсов**: один адаптер против изменения нескольких клиентских вызовов

### Распространенные ошибки
- **Двусторонние адаптеры**: двунаправленное преобразование является сложным; создать два адаптера
- **Цепочки адаптеров**: несколько последовательных адаптеров указывают на проблемы конструкции.
- **Overusing для нового кода**: проектируйте совместимые интерфейсы с самого начала

---

## Мост

### Определение
Отделяет абстракцию от ее реализации, чтобы они могли изменяться независимо.

### Когда использовать
- [x] Хотите избежать постоянной привязки между абстракцией и реализацией.
- [x] И абстракции, и реализации должны быть расширяемы путем создания подклассов.
- [x] Изменения в реализации не должны влиять на клиентов
- [x] Хотите поделиться реализацией между несколькими объектами (как у наилегчайшего веса)

### Подпись TypeScript
```typescript
// Implementation interface
interface Implementation {
  operationImpl(): string;
}

// Concrete implementations
class ConcreteImplementationA implements Implementation {
  operationImpl(): string {
    return 'ConcreteImplementationA';
  }
}

class ConcreteImplementationB implements Implementation {
  operationImpl(): string {
    return 'ConcreteImplementationB';
  }
}

// Abstraction
class Abstraction {
  constructor(protected implementation: Implementation) {}

  public operation(): string {
    return `Abstraction: ${this.implementation.operationImpl()}`;
  }
}

// Refined abstraction
class ExtendedAbstraction extends Abstraction {
  public operation(): string {
    return `ExtendedAbstraction: ${this.implementation.operationImpl()}`;
  }
}

// Usage
const implA = new ConcreteImplementationA();
const abstraction1 = new Abstraction(implA);
console.log(abstraction1.operation());

const implB = new ConcreteImplementationB();
const abstraction2 = new ExtendedAbstraction(implB);
console.log(abstraction2.operation());
```

### Пример из реальной жизни: компоненты пользовательского интерфейса с несколькими модулями рендеринга
```typescript
// Implementation: Renderers
interface Renderer {
  renderCircle(radius: number): string;
  renderSquare(side: number): string;
}

class VectorRenderer implements Renderer {
  renderCircle(radius: number): string {
    return `Drawing circle (vector) with radius ${radius}`;
  }
  renderSquare(side: number): string {
    return `Drawing square (vector) with side ${side}`;
  }
}

class RasterRenderer implements Renderer {
  renderCircle(radius: number): string {
    return `Drawing circle (pixels) with radius ${radius}`;
  }
  renderSquare(side: number): string {
    return `Drawing square (pixels) with side ${side}`;
  }
}

// Abstraction: Shapes
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): string;
}

class Circle extends Shape {
  constructor(renderer: Renderer, private radius: number) {
    super(renderer);
  }
  draw(): string {
    return this.renderer.renderCircle(this.radius);
  }
}

class Square extends Shape {
  constructor(renderer: Renderer, private side: number) {
    super(renderer);
  }
  draw(): string {
    return this.renderer.renderSquare(this.side);
  }
}

// Usage: Can mix any shape with any renderer
const vectorCircle = new Circle(new VectorRenderer(), 5);
const rasterSquare = new Square(new RasterRenderer(), 10);
```

### Маркеры обнаружения
- Абстракция содержит ссылку на интерфейс реализации.
- Конструктор внедряет реализацию
- Две параллельные иерархии (абстракция и реализация)

### Распространенные ошибки
- **Замешательство с адаптером**: мост создан во время разработки; Адаптер — исправление во время выполнения
- **Проектирование простых сценариев**: используйте только тогда, когда необходимо изменить обе иерархии.

---

## <a name="composite"></a>Композитный

### Определение
Собирает объекты в древовидные структуры для представления иерархий «части-целые», позволяя клиентам единообразно обрабатывать отдельные объекты и композиции.

### Когда использовать
- [x] Хотите представить иерархию объектов частично или целиком.
- [x] Хотите, чтобы клиенты игнорировали разницу между композициями и отдельными объектами
- [x] Древовидные структуры естественны для предметной области (файловые системы, компоненты пользовательского интерфейса, организационные диаграммы).

### Подпись TypeScript
```typescript
// Component interface
interface Component {
  operation(): string;
  add?(component: Component): void;
  remove?(component: Component): void;
  getChild?(index: number): Component;
}

// Leaf (no children)
class Leaf implements Component {
  constructor(private name: string) {}

  operation(): string {
    return this.name;
  }
}

// Composite (has children)
class Composite implements Component {
  private children: Component[] = [];

  constructor(private name: string) {}

  add(component: Component): void {
    this.children.push(component);
  }

  remove(component: Component): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getChild(index: number): Component {
    return this.children[index];
  }

  operation(): string {
    const results = this.children.map(child => child.operation());
    return `${this.name}(${results.join(', ')})`;
  }
}

// Usage
const tree = new Composite('root');
const branch1 = new Composite('branch1');
branch1.add(new Leaf('leaf1'));
branch1.add(new Leaf('leaf2'));

const branch2 = new Composite('branch2');
branch2.add(new Leaf('leaf3'));

tree.add(branch1);
tree.add(branch2);
tree.add(new Leaf('leaf4'));

console.log(tree.operation());
// Output: root(branch1(leaf1, leaf2), branch2(leaf3), leaf4)
```

### Пример из реальной жизни: файловая система
```typescript
interface FileSystemComponent {
  getName(): string;
  getSize(): number;
  print(indent: string): void;
}

class File implements FileSystemComponent {
  constructor(private name: string, private size: number) {}

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.size;
  }

  print(indent: string): void {
    console.log(`${indent}📄 ${this.name} (${this.size} bytes)`);
  }
}

class Directory implements FileSystemComponent {
  private children: FileSystemComponent[] = [];

  constructor(private name: string) {}

  add(component: FileSystemComponent): void {
    this.children.push(component);
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }

  print(indent: string): void {
    console.log(`${indent}📁 ${this.name} (${this.getSize()} bytes)`);
    this.children.forEach(child => child.print(indent + '  '));
  }
}

// Usage
const root = new Directory('root');
const home = new Directory('home');
home.add(new File('photo.jpg', 2048));
home.add(new File('document.pdf', 4096));

const work = new Directory('work');
work.add(new File('report.docx', 8192));

root.add(home);
root.add(work);
root.print('');
```

### Маркеры обнаружения
- Древовидная структура с единым интерфейсом
- Коллекция детских компонентов
- Методы `add()`, `remove()`, `getChild()`
- Рекурсивные вызовы операций

### Код пахнет, он исправляет
- **Проверка типа на состав и лист.**: единый интерфейс исключает проверки `instanceof`.
- **Различное обращение с частями и целыми частями**: клиенты одинаково обращаются с обоими

### Распространенные ошибки
- **Нарушение единообразия**: Leaf и Composite должны иметь одинаковый интерфейс.
- **Неправильное управление детьми**: Неправильная обработка удаления
- **Глубокая рекурсия**: может вызвать переполнение стека на очень глубоких деревьях.

---

## <a name="decorator"></a>Декоратор

### Определение
Динамически прикрепляет дополнительные обязанности к объекту, предоставляя гибкую альтернативу созданию подклассов для расширения функциональности.

### Когда использовать
- [x] Необходимо динамически и прозрачно добавлять обязанности к объектам.
- [x] Ответственность можно снять
- [x] Расширение путем создания подклассов непрактично (много возможных комбинаций).
- [x] Хотите добавлять функции постепенно

### Подпись TypeScript
```typescript
// Component interface
interface Component {
  operation(): string;
}

// Concrete component
class ConcreteComponent implements Component {
  operation(): string {
    return 'ConcreteComponent';
  }
}

// Base decorator
abstract class Decorator implements Component {
  constructor(protected component: Component) {}

  operation(): string {
    return this.component.operation();
  }
}

// Concrete decorators
class DecoratorA extends Decorator {
  operation(): string {
    return `DecoratorA(${super.operation()})`;
  }
}

class DecoratorB extends Decorator {
  operation(): string {
    return `DecoratorB(${super.operation()})`;
  }
}

// Usage: Stack decorators
const simple = new ConcreteComponent();
const decorated1 = new DecoratorA(simple);
const decorated2 = new DecoratorB(decorated1);
console.log(decorated2.operation());
// Output: DecoratorB(DecoratorA(ConcreteComponent))
```

### Альтернативы для стека

**React — компоненты высшего порядка**:
```typescript
// HOC decorator
function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    const { user } = useAuth();
    if (!user) return <Redirect to="/login" />;
    return <Component {...props} />;
  };
}

// Usage: Stack decorators
const AuthenticatedProfile = withAuth(Profile);
const AuthenticatedAdminProfile = withLogging(withAuth(Profile));
```

**NestJS — Перехватчики**:
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');
    return next.handle().pipe(
      tap(() => console.log('After...'))
    );
  }
}

// Apply decorator
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {}
```

### Маркеры обнаружения
- Реализует тот же интерфейс, что и обернутый объект.
- Содержит ссылку на завернутый объект
- Делегаты в упаковке, добавление поведения
- Можно складывать

### Код пахнет, он исправляет
- **Взрыв класса**: избегайте создания подкласса для каждой комбинации функций.
- **Жесткое дополнение функций**: Add/remove работает динамически

### Распространенные ошибки
- **Зависимость заказа**: ДекораторA(ДекораторB(x)) ≠ ДекораторB(ДекораторA(x))
- **Взрыв декоратора**: управлять слишком большим количеством маленьких декораторов может быть сложно.
- **Нарушение интерфейса**: декоратор должен поддерживать контракт интерфейса

---

## <a name="facade"></a>Фасад

### Определение
Предоставляет унифицированный интерфейс для набора интерфейсов в подсистеме, что упрощает использование подсистемы.

### Когда использовать
- [x] Хотите предоставить простой интерфейс для сложной подсистемы
- [x] Между клиентами и классами реализации существует множество зависимостей.
- [x] Хотите разложить подсистемы по уровням
- [x] Необходимо отделить подсистему от клиентов

### Подпись TypeScript
```typescript
// Complex subsystem classes
class SubsystemA {
  operationA(): string {
    return 'SubsystemA';
  }
}

class SubsystemB {
  operationB(): string {
    return 'SubsystemB';
  }
}

class SubsystemC {
  operationC(): string {
    return 'SubsystemC';
  }
}

// Facade
class Facade {
  private subsystemA: SubsystemA;
  private subsystemB: SubsystemB;
  private subsystemC: SubsystemC;

  constructor() {
    this.subsystemA = new SubsystemA();
    this.subsystemB = new SubsystemB();
    this.subsystemC = new SubsystemC();
  }

  // Simplified interface
  public simpleOperation(): string {
    const resultA = this.subsystemA.operationA();
    const resultB = this.subsystemB.operationB();
    const resultC = this.subsystemC.operationC();
    return `Facade coordinates: ${resultA}, ${resultB}, ${resultC}`;
  }
}

// Client code
const facade = new Facade();
console.log(facade.simpleOperation());
// Instead of:
// const a = new SubsystemA(); const b = new SubsystemB(); const c = new SubsystemC();
// a.operationA(); b.operationB(); c.operationC();
```

### Пример из реальной жизни: обработка платежей
```typescript
// Complex subsystems
class PaymentValidator {
  validate(amount: number, card: string): boolean {
    // Complex validation logic
    return amount > 0 && card.length === 16;
  }
}

class PaymentGateway {
  charge(amount: number, card: string): string {
    return `Charged $${amount} to ${card}`;
  }
}

class NotificationService {
  sendReceipt(email: string, transactionId: string): void {
    console.log(`Receipt sent to ${email}: ${transactionId}`);
  }
}

class TransactionLogger {
  log(transaction: string): void {
    console.log(`Logged: ${transaction}`);
  }
}

// Facade
class PaymentFacade {
  private validator = new PaymentValidator();
  private gateway = new PaymentGateway();
  private notifications = new NotificationService();
  private logger = new TransactionLogger();

  processPayment(amount: number, card: string, email: string): boolean {
    // Simplified interface for complex process
    if (!this.validator.validate(amount, card)) {
      return false;
    }

    const result = this.gateway.charge(amount, card);
    this.logger.log(result);
    this.notifications.sendReceipt(email, result);
    return true;
  }
}

// Client code (simple!)
const payment = new PaymentFacade();
payment.processPayment(100, '1234567890123456', 'user@example.com');
```

### Маркеры обнаружения
- Класс с несколькими зависимостями подсистемы
- Простые общедоступные методы, координирующие подсистемы
- Назван `*Facade`, `*API`, `*Service`

### Код пахнет, он исправляет
- **Комплексное использование подсистемы**: клиентам не нужно знать детали подсистемы.
- **Плотная связь**: Клиенты зависят от фасада, а не от многих классов

### Распространенные ошибки
- **God Facade**: Фасад делает слишком много; должен согласовывать, а не содержать логику
- **Дырявая абстракция**: раскрытие деталей подсистемы противоречит цели

---

## Наилегчайший вес

### Определение
Использует совместное использование для эффективной поддержки большого количества детализированных объектов за счет внешнего хранения общего состояния.

### Когда использовать
- [x] Приложение использует большое количество объектов
- [x] Стоимость хранения высока из-за количества объектов.
- [x] Большую часть состояний объектов можно сделать внешними (внешними).
- [x] Многие группы объектов могут быть заменены относительно небольшим количеством общих объектов.

### Подпись TypeScript
```typescript
// Flyweight
class Flyweight {
  constructor(private sharedState: string) {}

  operation(uniqueState: string): void {
    console.log(`Flyweight: Shared (${this.sharedState}) and unique (${uniqueState}) state.`);
  }
}

// Flyweight factory
class FlyweightFactory {
  private flyweights: Map<string, Flyweight> = new Map();

  constructor(initialFlyweights: string[][]) {
    for (const state of initialFlyweights) {
      this.flyweights.set(this.getKey(state), new Flyweight(state.join('_')));
    }
  }

  private getKey(state: string[]): string {
    return state.join('_');
  }

  getFlyweight(sharedState: string[]): Flyweight {
    const key = this.getKey(sharedState);

    if (!this.flyweights.has(key)) {
      console.log('Creating new flyweight');
      this.flyweights.set(key, new Flyweight(key));
    } else {
      console.log('Reusing existing flyweight');
    }

    return this.flyweights.get(key)!;
  }

  listFlyweights(): void {
    console.log(`FlyweightFactory: ${this.flyweights.size} flyweights:`);
    for (const key of this.flyweights.keys()) {
      console.log(key);
    }
  }
}

// Usage
const factory = new FlyweightFactory([
  ['Chevrolet', 'Camaro2018', 'pink'],
  ['Mercedes Benz', 'C300', 'black'],
]);

const flyweight1 = factory.getFlyweight(['Chevrolet', 'Camaro2018', 'pink']);
flyweight1.operation('license-123');

const flyweight2 = factory.getFlyweight(['Chevrolet', 'Camaro2018', 'pink']);
flyweight2.operation('license-456'); // Reuses same flyweight
```

### Пример из реальной жизни: символы текстового редактора
```typescript
// Flyweight: Character formatting (shared)
class CharacterFormat {
  constructor(
    public font: string,
    public size: number,
    public color: string
  ) {}
}

// Flyweight factory
class FormatFactory {
  private formats = new Map<string, CharacterFormat>();

  getFormat(font: string, size: number, color: string): CharacterFormat {
    const key = `${font}_${size}_${color}`;
    if (!this.formats.has(key)) {
      this.formats.set(key, new CharacterFormat(font, size, color));
    }
    return this.formats.get(key)!;
  }
}

// Character with extrinsic state
class Character {
  constructor(
    private char: string,
    private format: CharacterFormat // Shared flyweight
  ) {}

  render(position: number): string {
    return `'${this.char}' at ${position} (${this.format.font}, ${this.format.size}px, ${this.format.color})`;
  }
}

// Document
const formatFactory = new FormatFactory();
const arial12Black = formatFactory.getFormat('Arial', 12, 'black');
const arial12Red = formatFactory.getFormat('Arial', 12, 'red');

// 10,000 characters, but only 2 format objects
const characters: Character[] = [];
for (let i = 0; i < 10000; i++) {
  const format = i % 2 === 0 ? arial12Black : arial12Red;
  characters.push(new Character('A', format));
}
```

### Маркеры обнаружения
- Фабрика управляет пулом общих объектов
- Внутреннее (общее) и внешнее (уникальное) разделение состояний
- Map/cache легковесов

### Распространенные ошибки
- **Преждевременная оптимизация**: используйте только в том случае, если действительно есть проблемы с памятью.
- **Неправильное разделение состояний.**: смешивание внутреннего и внешнего состояний.

---

## Прокси

### Определение
Предоставляет суррогат или заполнитель для другого объекта для управления доступом к нему.

### Когда использовать
- [x] Ленивая инициализация (виртуальный прокси): создавайте дорогостоящий объект только при необходимости.
- [x] Контроль доступа (защитный прокси): контроль доступа к исходному объекту.
- [x] Локальный представитель удаленного объекта (удаленный прокси)
- [x] Ведение журнала, кэширование или мониторинг доступа

### Подпись TypeScript
```typescript
// Subject interface
interface Subject {
  request(): void;
}

// Real subject
class RealSubject implements Subject {
  request(): void {
    console.log('RealSubject: Handling request');
  }
}

// Proxy
class Proxy implements Subject {
  private realSubject: RealSubject | null = null;

  request(): void {
    // Access control
    if (this.checkAccess()) {
      // Lazy initialization
      if (!this.realSubject) {
        this.realSubject = new RealSubject();
      }

      // Logging
      this.logAccess();

      // Delegate to real subject
      this.realSubject.request();
    }
  }

  private checkAccess(): boolean {
    console.log('Proxy: Checking access');
    return true;
  }

  private logAccess(): void {
    console.log('Proxy: Logging access time');
  }
}

// Usage
const proxy = new Proxy();
proxy.request();
// Output:
// Proxy: Checking access
// Proxy: Logging access time
// RealSubject: Handling request
```

### Современный прокси JavaScript
```typescript
const target = {
  message: 'Hello',
  getValue() {
    return this.message;
  }
};

const handler = {
  get(target: any, prop: string) {
    console.log(`Accessing property: ${prop}`);
    return target[prop];
  },
  set(target: any, prop: string, value: any) {
    console.log(`Setting property: ${prop} = ${value}`);
    target[prop] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);
console.log(proxy.message); // Logs: Accessing property: message
proxy.message = 'World';     // Logs: Setting property: message = World
```

### Маркеры обнаружения
- Реализует тот же интерфейс, что и реальный субъект
- Содержит ссылку на реальный предмет
- Контролирует доступ (проверки, журналирование, кеширование)
- Ленивая инициализация реального объекта

### Распространенные ошибки
- **Цепочки прокси**: несколько прокси, обертывающих друг друга
- **Накладные расходы на производительность**: каждый доступ осуществляется через прокси-сервер.
- **Смешение с Decorator**: доступ контролируется прокси-сервером; Декоратор добавляет поведение

---

## Сводная таблица

| Шаблон | Сложность | Использовать частоту | Основное преимущество |
|---------|------------|---------------|--------------|
| Адаптер | Низкий | Высокий | Совместимость интерфейса |
| Мост | Высокий | Низкий | Отделить абстракцию от реализации |
| Композитный | Середина | Высокий | Единообразная обработка древовидной структуры |
| Декоратор | Середина | Высокий | Динамическое добавление ответственности |
| Фасад | Низкий | Очень высокий | Упрощенный интерфейс подсистемы |
| Наилегчайший вес | Высокий | Низкий | Оптимизация памяти |
| Прокси | Середина | Середина | Контролируемый доступ |

## Лучшие практики

1. **Adapter vs Bridge**: адаптер исправляет несовместимость; Гибкость конструкции моста
2. **Decorator против Proxy**: Decorator добавляет функции; Прокси контролирует доступ
3. **Простота фасада**: Должна координироваться, а не содержать бизнес-логику
4. **Композитное единообразие**: Leaf и Composite должны использовать общий интерфейс.
5. **Использовать собственный объект Proxy**: JavaScript `Proxy` для динамического доступа к свойствам.

## Ссылки

- *Шаблоны проектирования: элементы многоразового объектно-ориентированного программного обеспечения* (Банда четырех)
- [MDN: Прокси](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [Гуру рефакторинга: структурные шаблоны](https://refactoring.guru/design-patterns/structural-patterns)
