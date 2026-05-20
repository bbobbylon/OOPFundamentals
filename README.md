# OOP & Programming Fundamentals — a Live Walkthrough

A runnable, self-narrating tour of everything an entry-level software developer
is expected to know. Every concept is a small Java program with verbose console
output, so you can read the code top-to-bottom and watch each variable change
as it runs.

Think of it as a personal wiki you can `git clone` and execute.

---

## What's covered

| # | Section | What it teaches |
|---|---|---|
| 1 | Encapsulation | private fields, validating getters/setters |
| 2 | Inheritance | `extends`, `super`, `@Override`, protected |
| 3 | Polymorphism | method overriding + overloading |
| 4 | Abstraction | interfaces, abstract classes, default methods |
| 5 | Data structures | LinkedList, Stack, Queue, BST (hand-built) |
| 6 | Algorithms | bubble / quick / merge sort, linear / binary search |
| 7 | SOLID | the five design principles, one runnable example each |
| 8 | Composition over inheritance | "has-a" with swappable parts |
| 9 | Generics | `<T>`, `<K,V>`, generic methods |
| 10 | Exceptions | try/catch/finally, checked vs unchecked, custom exceptions |
| 11 | Object essentials | equals/hashCode/toString, immutability, static, enum |
| 12 | Java Collections Framework | ArrayList, LinkedList, HashMap, HashSet, TreeMap |
| 13 | Lambdas & Streams | filter/map/collect, method references |
| 14 | Design patterns | Singleton, Factory, Builder, Observer, Strategy |
| 15 | Recursion | factorial with call-stack trace, fibonacci, sumDigits |
| 16 | Big O / complexity | live timing of O(n) vs O(log n) on 10M items |
| 17 | String classics | reverse, palindrome, anagram, first-unique-char |
| 18 | HashMap from scratch | buckets + chaining, visualized |
| 19 | Graphs | adjacency list, BFS, DFS |
| 20 | Concurrency | threads, race conditions, `synchronized`, AtomicInteger, ExecutorService |
| 21 | Generic wildcards | `? extends T`, `? super T`, PECS |
| 22 | JVM internals | heap vs stack, garbage collection, classloaders |
| 23 | Reflection & annotations | custom annotation, scan + invoke at runtime |
| 24 | Networking | real TCP server + client in one JVM |
| 25 | SQL & JDBC | CRUD against H2 in-memory, prepared statements, SQL injection |
| 26 | REST API design | HTTP verbs, status codes, idempotency, JSON |

---

## Prerequisites

- **Java 21** (`java --version` should report 21 or newer)
- Maven (not strictly required — the project ships with the Maven wrapper)
- Any IDE with Java support (IntelliJ, VS Code, Eclipse) — optional but nice

---

## How to run

From the project root:

**Windows (PowerShell or cmd):**
```
.\mvnw.cmd -q exec:java -Dexec.mainClass=com.bob.oopfundamentals.OopFundamentalsApplication
```

**macOS / Linux:**
```
./mvnw -q exec:java -Dexec.mainClass=com.bob.oopfundamentals.OopFundamentalsApplication
```

**Or in your IDE:** open `OopFundamentalsApplication.java` and run its `main` method.

The full walkthrough takes about 4–5 seconds and prints all 26 sections in order.
Scroll up to read each section, or pipe the output to a file:

```
.\mvnw.cmd -q exec:java -Dexec.mainClass=com.bob.oopfundamentals.OopFundamentalsApplication > walkthrough.txt
```

> The project's `pom.xml` is wired for a full Spring Boot 4 server, but the
> demo deliberately bypasses Spring and runs as plain Java (`public static
> void main`). That keeps the focus on the fundamentals, with no datasource
> or API keys required.

---

## Project structure

```
src/main/java/com/bob/oopfundamentals/
├── OopFundamentalsApplication.java   ← entry point (just calls runAll)
├── OopDemoRunner.java                ← orchestrates all 26 sections
│
├── demos/                            ← the "narrators" — read these first
│   ├── EncapsulationDemo.java
│   ├── InheritanceDemo.java
│   ├── ...
│   └── RestApiDemo.java
│
└── <support packages>                ← the actual implementations
    ├── encapsulation/                ← BankAccount
    ├── inheritance/                  ← Animal, Dog, Cat, Bird
    ├── polymorphism/                 ← Shape, Circle, Rectangle, ...
    ├── abstraction/                  ← Drivable, Vehicle, Car, Motorcycle
    ├── datastructures/               ← MyLinkedList, MyStack, MyQueue, MyBinarySearchTree, MyHashMap, MyGraph
    ├── algorithms/                   ← SortingAlgorithms, SearchingAlgorithms
    ├── solid/                        ← one file per S/O/L/I/D principle
    ├── composition/                  ← Engine, GpsModule, ComposedCar
    ├── generics/                     ← Box, Pair, Utilities
    ├── exceptions/                   ← InsufficientFundsException, Wallet
    ├── objectessentials/             ← Person, Money, IdGenerator, Priority
    ├── designpatterns/               ← AppSettings, ShapeFactory, Pizza, NewsAgency, PaymentProcessor
    ├── recursion/                    ← RecursionExamples
    ├── complexity/                   ← BigODemo
    ├── strings/                      ← StringClassics
    ├── concurrency/                  ← Counter
    ├── wildcards/                    ← WildcardExamples
    └── reflection/                   ← Important (annotation), Service
```

### How to read it

1. **Start with a `demos/*.java` file** — that's the narrator. It explains the
   concept in prose, runs short experiments, and prints a takeaway at the end.
2. **When a demo references a class** (say `Dog` or `MyHashMap`), open the
   corresponding support package — those files have deep inline comments
   explaining the implementation line by line.
3. **Run the whole thing** to see your reading match the live output.

Some sections (Collections, Lambdas/Streams, JVM internals, Networking, SQL,
REST) are self-contained inside their demo file because they exercise the JDK
directly rather than a custom class.

---

## Bonus: interactive sorting visualizer

There's a tiny browser-based visualizer in [`frontend/sorting-visualizer.html`](frontend/sorting-visualizer.html)
that animates Bubble, Quick, and Merge sort as colored bars. Just open the
file in any modern browser — no server needed.

It's a prototype to show what a full visual frontend for these fundamentals
could look like.

---

## What's deliberately NOT covered

Topics worth learning eventually, but outside the scope of "entry-level interview":

- Build tools deep dive (Maven/Gradle internals)
- Advanced concurrency (locks, semaphores, `CompletableFuture` pipelines)
- Memory model details (`volatile`, happens-before)
- JPA/Hibernate (we use raw JDBC instead)
- Spring framework specifics beyond DI concepts
- Frontend frameworks (React, Vue, etc.)
- Cloud and containerization (Docker, Kubernetes, AWS)

Each of these deserves its own project.

---

## License

Personal study project — use freely.
