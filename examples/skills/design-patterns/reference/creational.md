---
title: "Шаблоны творческого проектирования"
description: "Справочник по шаблонам создания объектов Singleton, Factory, Builder, Prototype и другим."
tags: [reference, design-patterns, architecture]
---

# Шаблоны творческого проектирования

Шаблоны, касающиеся механизмов создания объектов, пытаются создавать объекты в соответствии с ситуацией.

## <a name="singleton"></a>Синглтон

### Определение
Гарантирует, что класс имеет только один экземпляр, и предоставляет глобальную точку доступа к нему.

### <a name="when-to-use"></a>Когда использовать
- [x] Требуется ровно один экземпляр класса (конфигурация, ведение журнала, подключение к базе данных)
- [x] Требуется контролируемый доступ к одному объекту
- [x] Экземпляр должен быть расширяемым путем создания подкласса

**Warning**: Часто злоупотребляют. Сначала рассмотрите внедрение зависимостей или альтернативы на основе контекста.

### Подпись TypeScript
```typescript
class Singleton {
  private static instance: Singleton;
  private constructor() {
    // Private constructor prevents instantiation
  }

  public static getInstance(): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }

  public someMethod(): void {
    // Business logic
  }
}

// Usage
const instance = Singleton.getInstance();
```

### Альтернативы для стека

**React**:
```typescript
// Instead of Singleton, use Context
const ConfigContext = createContext<Config>(defaultConfig);

export const ConfigProvider = ({ children }: Props) => {
  const [config] = useState(() => loadConfig());
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};
```

**Angular**:
```typescript
// Injectable service (singleton by default)
@Injectable({ providedIn: 'root' })
export class ConfigService {
  // Automatically singleton via DI
}
```

**NestJS**:
```typescript
@Injectable() // Default scope is SINGLETON
export class AppService {}
```

### Маркеры обнаружения
- `private constructor`
- `static getInstance()` метод
- Поле `private static instance`
- Проверка ленивой инициализации: `if (!instance)`

### Код пахнет, он исправляет
- **Доступ к глобальному состоянию**: обеспечивает контролируемый доступ вместо разбросанных глобальных переменных.
- **Несколько экземпляров общего ресурса**: обеспечивает одно подключение к базе данных, объект конфигурации и т. д.

### Распространенные ошибки
- **Трудно тестировать**: статические методы и глобальное состояние затрудняют модульное тестирование.
  - *Solution*: вместо этого используйте внедрение зависимостей или предоставьте `resetInstance()` для тестов.
- **Проблемы безопасности потоков**: (менее актуально для однопоточной модели JavaScript, но важно для работников Node.js)
- **Скрытые зависимости**: классы, использующие `getInstance()`, имеют скрытую связь.
- **Нарушает единую ответственность**: часто управляет как созданием экземпляра, так и бизнес-логикой.

### Критерии оценки
- **Testability**: 3/10 (сложно издеваться, глобальное состояние)
- **Thread-safety**: 7/10 (менее критично в JS)
- **Расширяемость**: 5/10 (подклассы сложны)

---

## <a name="factory-method"></a>Фабричный метод

### Определение
Определяет интерфейс для создания объекта, но позволяет подклассам решать, экземпляр какого класса создавать.

### Когда использовать
- [x] Класс не может предвидеть тип объектов, которые ему необходимо создать.
- [x] Класс хочет, чтобы его подклассы указывали объекты, которые он создает.
- [x] Централизуйте логику создания объектов, чтобы избежать дублирования.
- [x] Необходимо отделить создание объекта от его использования.

### Подпись TypeScript
```typescript
// Product interface
interface Product {
  operation(): string;
}

// Concrete products
class ConcreteProductA implements Product {
  operation(): string {
    return 'Product A';
  }
}

class ConcreteProductB implements Product {
  operation(): string {
    return 'Product B';
  }
}

// Creator (Factory)
abstract class Creator {
  // Factory method
  abstract createProduct(): Product;

  // Business logic using the product
  someOperation(): string {
    const product = this.createProduct();
    return `Creator: ${product.operation()}`;
  }
}

// Concrete creators
class CreatorA extends Creator {
  createProduct(): Product {
    return new ConcreteProductA();
  }
}

class CreatorB extends Creator {
  createProduct(): Product {
    return new ConcreteProductB();
  }
}

// Usage
const creator: Creator = new CreatorA();
console.log(creator.someOperation());
```

### Современная альтернатива TypeScript
```typescript
// Simpler approach without inheritance
type ProductType = 'A' | 'B';

function createProduct(type: ProductType): Product {
  switch (type) {
    case 'A': return new ConcreteProductA();
    case 'B': return new ConcreteProductB();
  }
}
```

### Маркеры обнаружения
- Метод с именем `create*()`, возвращающий класс interface/abstract
- `abstract createProduct()` в базовом классе
- Подклассы переопределяют фабричный метод
- `switch` или `if-else` для параметра type/kind

### Код пахнет, он исправляет
- **Тесная связь с конкретными классами**: клиентский код зависит от интерфейса, а не от реализации.
- **Дублирование логики создания экземпляров**: централизованно, фабричным методом.
- **Операторы переключения разбросаны**: объединены в одном месте

### Распространенные ошибки
- **Простая путаница с фабрикой**: Фабричный метод использует наследование; Simple Factory использует композицию
- **Слишком много параметров**: необходимо создавать объекты с конфигурацией по умолчанию.
- **Забыть сделать фабричный метод абстрактным**: противоречит цели специализации подкласса

### Критерии оценки
- **Testability**: 8/10 (продукты легко имитировать)
- **Гибкость**: 9/10 (новые продукты не изменяют существующий код)
- **Complexity**: 6/10 (добавляет иерархию наследования)

---

## Абстрактная фабрика

### Определение
Предоставляет интерфейс для создания семейств связанных или зависимых объектов без указания их конкретных классов.

### Когда использовать
- [x] Система должна быть независимой от того, как создаются ее продукты.
- [x] Система должна быть настроена на использование одного из нескольких семейств продуктов.
- [x] Семейство связанных объектов продукта должно использоваться вместе.
- [x] Вы хотите предоставить библиотеку продуктов и показать только интерфейсы.

### Подпись TypeScript
```typescript
// Abstract products
interface AbstractProductA {
  usefulFunctionA(): string;
}

interface AbstractProductB {
  usefulFunctionB(): string;
  anotherFunctionB(collaborator: AbstractProductA): string;
}

// Concrete products - Family 1
class ConcreteProductA1 implements AbstractProductA {
  usefulFunctionA(): string {
    return 'Product A1';
  }
}

class ConcreteProductB1 implements AbstractProductB {
  usefulFunctionB(): string {
    return 'Product B1';
  }

  anotherFunctionB(collaborator: AbstractProductA): string {
    return `B1 collaborating with ${collaborator.usefulFunctionA()}`;
  }
}

// Concrete products - Family 2
class ConcreteProductA2 implements AbstractProductA {
  usefulFunctionA(): string {
    return 'Product A2';
  }
}

class ConcreteProductB2 implements AbstractProductB {
  usefulFunctionB(): string {
    return 'Product B2';
  }

  anotherFunctionB(collaborator: AbstractProductA): string {
    return `B2 collaborating with ${collaborator.usefulFunctionA()}`;
  }
}

// Abstract factory
interface AbstractFactory {
  createProductA(): AbstractProductA;
  createProductB(): AbstractProductB;
}

// Concrete factories
class ConcreteFactory1 implements AbstractFactory {
  createProductA(): AbstractProductA {
    return new ConcreteProductA1();
  }

  createProductB(): AbstractProductB {
    return new ConcreteProductB1();
  }
}

class ConcreteFactory2 implements AbstractFactory {
  createProductA(): AbstractProductA {
    return new ConcreteProductA2();
  }

  createProductB(): AbstractProductB {
    return new ConcreteProductB2();
  }
}

// Client code
function clientCode(factory: AbstractFactory) {
  const productA = factory.createProductA();
  const productB = factory.createProductB();

  console.log(productB.anotherFunctionB(productA));
}

// Usage
clientCode(new ConcreteFactory1());
clientCode(new ConcreteFactory2());
```

### Маркеры обнаружения
- Несколько методов `create*()` в заводском интерфейсе
- Семейства связанных продуктов (например, кнопка + флажок для Windows/Mac)
- Заводские реализации возвращают разные семейства продуктов.
- Интерфейс с 2+ фабричными методами

### Код пахнет, он исправляет
- **Несовместимые семейства продуктов**: обеспечивает совместное создание совместимых продуктов (кнопка Windows + флажок Windows, не смешанные)
- **Разрозненная логика создания**: централизованное создание связанных объектов.

### Распространенные ошибки
- **Перепроектирование**: часто слишком сложно для простых сценариев; Фабричного метода может быть достаточно
- **Семейства жестких продуктов**: добавление новых типов продуктов требует изменения всех заводов.
- **Замешательство с фабричным методом**: Абстрактная фабрика создает семейства; Фабричный метод создает один тип продукта.

### Критерии оценки
- **Testability**: 8/10 (фабрики легко высмеивать)
- **Consistency**: 10/10 (гарантирует совместимость продуктов)
- **Complexity**: 4/10 (высокая сложность, много классов)

---

## Строитель

### Определение
Отделяет построение сложного объекта от его представления, позволяя осуществлять построение поэтапно.

### Когда использовать
- [x] Объект имеет много необязательных параметров (>4)
- [x] Процесс строительства должен позволять различные представления
- [x] Необходимость строить сложные объекты шаг за шагом.
- [x] Хотите избежать анти-шаблона «телескопический конструктор»

### Подпись TypeScript
```typescript
// Product
class House {
  public walls: string = '';
  public doors: number = 0;
  public windows: number = 0;
  public roof: string = '';
  public garage: boolean = false;
  public pool: boolean = false;

  public describe(): string {
    return `House with ${this.walls} walls, ${this.doors} doors, ${this.windows} windows, ${this.roof} roof, garage: ${this.garage}, pool: ${this.pool}`;
  }
}

// Builder
class HouseBuilder {
  private house: House;

  constructor() {
    this.house = new House();
  }

  public setWalls(walls: string): this {
    this.house.walls = walls;
    return this;
  }

  public setDoors(doors: number): this {
    this.house.doors = doors;
    return this;
  }

  public setWindows(windows: number): this {
    this.house.windows = windows;
    return this;
  }

  public setRoof(roof: string): this {
    this.house.roof = roof;
    return this;
  }

  public addGarage(): this {
    this.house.garage = true;
    return this;
  }

  public addPool(): this {
    this.house.pool = true;
    return this;
  }

  public build(): House {
    const result = this.house;
    this.house = new House(); // Reset for next build
    return result;
  }
}

// Usage
const house = new HouseBuilder()
  .setWalls('brick')
  .setDoors(2)
  .setWindows(6)
  .setRoof('tile')
  .addGarage()
  .build();
```

### Современная альтернатива TypeScript (типобезопасная сборка)
```typescript
// Progressive type safety: each step unlocks the next
type HouseBuilderState<
  TWalls extends boolean = false,
  TRoof extends boolean = false
> = {
  setWalls: TWalls extends true ? never : (walls: string) => HouseBuilderState<true, TRoof>;
  setRoof: TRoof extends true ? never : (roof: string) => HouseBuilderState<TWalls, true>;
  build: TWalls extends true ? (TRoof extends true ? () => House : never) : never;
};
```

### Маркеры обнаружения
- Цепочка методов (возвращает `this` или тип строителя)
- Метод `build()`, возвращающий конечный продукт
- Методы `with*()` или `set*()`
- Необязательные поля устанавливаются постепенно

### Код пахнет, он исправляет
- **Телескопический конструктор**: Конструктор с множеством параметров.
  ```typescript
  // Bad
  new House(walls, doors, windows, roof, garage, pool, garden, basement, ...);

  // Good with Builder
  new HouseBuilder().setWalls('brick').setRoof('tile').build();
  ```
- **Непонятный порядок параметров**: Именованные методы проясняют намерение
- **Сложность дополнительных параметров**: Builder элегантно обрабатывает дополнительные функции.

### Распространенные ошибки
- **Mutable builder**: повторное использование построителя может привести к неожиданному состоянию.
  - *Решение*: Сброс внутреннего состояния после `build()`
- **Неполный сборщик**: не проверяются обязательные поля в `build()`
  - *Решение*: используйте типы TypeScript для выполнения необходимых действий.
- **Слишком просто для шаблона.**: если <4 параметров, конструктор или литерал объекта могут быть проще.

### Критерии оценки
- **Testability**: 9/10 (простое создание тестовых приспособлений)
- **Читаемость**: 10/10 (быстрый интерфейс самодокументируется)
- **Complexity**: 7/10 (добавляет класс строителя)

---

## Прототип

### Определение
Создает новые объекты путем копирования существующего объекта (прототипа), а не создания с нуля.

### Когда использовать
- [x] Создание объекта стоит дорого (сложная инициализация, запросы к базе данных)
- [x] Необходимо избегать создания подклассов только для изменения инициализации.
- [x] Система должна быть независимой от того, как создаются продукты.
- [x] Классы для создания экземпляров указываются во время выполнения.

### Подпись TypeScript
```typescript
// Prototype interface
interface Prototype {
  clone(): Prototype;
}

// Concrete prototype
class ConcretePrototype implements Prototype {
  public field: number;
  public complexObject: { data: string };

  constructor(field: number, complexObject: { data: string }) {
    this.field = field;
    this.complexObject = complexObject;
  }

  // Shallow clone
  public clone(): ConcretePrototype {
    return Object.create(this);
  }

  // Deep clone
  public deepClone(): ConcretePrototype {
    return new ConcretePrototype(
      this.field,
      { data: this.complexObject.data } // Clone nested objects
    );
  }
}

// Usage
const original = new ConcretePrototype(42, { data: 'important' });
const shallowCopy = original.clone();
const deepCopy = original.deepClone();

// Shallow copy shares nested objects
shallowCopy.complexObject.data = 'modified';
console.log(original.complexObject.data); // 'modified' (!)

// Deep copy is independent
deepCopy.field = 99;
console.log(original.field); // 42 (unchanged)
```

### Современные альтернативы JavaScript
```typescript
// Spread operator (shallow)
const copy1 = { ...original };

// Object.assign (shallow)
const copy2 = Object.assign({}, original);

// structuredClone (deep, modern browsers/Node 17+)
const copy3 = structuredClone(original);

// JSON (deep, but limited: no functions, undefined, etc.)
const copy4 = JSON.parse(JSON.stringify(original));
```

### Маркеры обнаружения
- `clone()` метод
- `Object.create()`
- `structuredClone()`
- Шаблон `JSON.parse(JSON.stringify())`
- Оператор распространения `{ ...obj }`

### Код пахнет, он исправляет
- **Дорогая инициализация**: клонирование вместо повторной инициализации
- **Графы сложных объектов**: клонирование сохраняет связи
- **Спецификация типа времени выполнения**: клонирование прототипа вместо типов жесткого кодирования

### Распространенные ошибки
- **Спутанность мелкого и глубокого клонирования**: поверхностный клон совместно использует вложенные объекты
  ```typescript
  // Dangerous if nested objects are modified
  const shallow = { ...original };
  ```
- **Циркулярные ссылки**: `JSON.stringify` не работает с циклическими ссылками
  - *Решение*: используйте `structuredClone()` или собственную логику клонирования.
- **Клонирование methods/functions**: некоторые подходы теряют методы.
  ```typescript
  JSON.parse(JSON.stringify(obj)); // Loses all methods!
  ```
- **Не клонировать частное состояние.**: убедитесь, что все необходимое состояние скопировано.

### Критерии оценки
- **Performance**: 9/10 (быстрее, чем повторная инициализация)
- **Simplicity**: 7/10 (поверхностное и глубокое клонирование сложны)
- **Reliability**: 6/10 (легко ошибиться с вложенными объектами)

---

## Сводная таблица

| Шаблон | Сложность | Использовать частоту | Основное преимущество |
|---------|------------|---------------|--------------|
| Синглтон | Низкий | Высокий | Глобальный контроль доступа |
| Фабричный метод | Середина | Высокий | Отделяет создание от использования |
| Абстрактная фабрика | Высокий | Середина | Согласованные семейства продуктов |
| Строитель | Середина | Высокий | Свободное строительство сложных объектов |
| Прототип | Низкий | Низкий | Эффективное клонирование |

## Лучшие практики

1. **Предпочитает композицию наследованию**: Factory и Builder часто лучше, чем Singleton
2. **Использовать собственные альтернативы стека**: React Context > Singleton, DI > getInstance()
3. **TypeScript рычаги**: используйте дженерики и ограничения типов для типобезопасных сборщиков.
4. **Удобный для тестирования дизайн**: избегайте синглтона; использовать внедрение зависимостей
5. **Сначала простота**: не используйте абстрактную фабрику, если достаточно фабричного метода.

## Ссылки

- *Шаблоны проектирования: элементы многоразового объектно-ориентированного программного обеспечения* (Банда четырех)
- *Эффективный TypeScript* от Дэна Вандеркама
- [Гуру рефакторинга: шаблоны создания](https://refactoring.guru/design-patterns/creational-patterns)
