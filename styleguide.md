# Effect Style Guide
## A practical style guide for readable, composable Effect applications
> Philosophy:
>
> Make the happy path obvious.
> Make cross-cutting concerns invisible.
> Make pure code effortless to reuse.
The goal is not to minimise lines of code.
The goal is to maximise understanding.
---
# The Four Pillars
Every piece of code should naturally fall into one of four styles.
| Concern | Tool |
|----------|------|
| Workflow / orchestration | `Effect.gen` |
| Behaviour composition | `.pipe()` |
| Pure reusable transformations | `flow()` |
| Dependency graph construction | `Layer.pipe()` |
Think of them as four different languages.
- `gen` tells a story.
- `pipe` adds capabilities.
- `flow` describes data.
- `Layer` builds systems.
---
# 1. Effect.gen
## Purpose
Use `Effect.gen` whenever the code represents a workflow.
Examples include:
- retrieving dependencies
- sequential operations
- branching
- loops
- early returns
- orchestrating several effects together
If the code would naturally be written imperatively, use `gen`.
```ts
const processPayment = (payment: Payment) =>
  Effect.gen(function* () {
    const config = yield* Config
    const payments = yield* PaymentService
    if (payment.amount > config.largePaymentThreshold) {
      return yield* payments.processLarge(payment)
    }
    return yield* payments.processStandard(payment)
  })
```
Notice how the business logic is obvious.
---
## Good candidates
```text
✔ if
✔ switch
✔ for
✔ while
✔ dependency retrieval
✔ multiple service calls
✔ orchestration
✔ early return
✔ yield*
```
---
## Avoid
Don't wrap tiny one-line transforms in `gen`.
Bad
```ts
Effect.gen(function* () {
  const user = yield* getUser(id)
  return User.toDto(user)
})
```
Good
```ts
getUser(id).pipe(
  Effect.map(User.toDto)
)
```
---
# 2. pipe()
## Purpose
Use `.pipe()` to add behaviour around an existing effect.
Think of it as decorating an effect.
It should answer the question
> "How should this effect behave?"
rather than
> "What does this effect do?"
---
## Typical uses
```ts
program.pipe(
  Effect.retry(policy),
  Effect.timeout("5 seconds"),
  Effect.withSpan("checkout"),
  Effect.catchTag("PaymentError", recover),
  Effect.tap(Logger.info)
)
```
---
## Common operators
### Error handling
```ts
Effect.catchTag(...)
Effect.catchAll(...)
Effect.catchSome(...)
```
---
### Resilience
```ts
Effect.retry(...)
Effect.timeout(...)
Effect.timeoutFail(...)
Effect.race(...)
```
---
### Observability
```ts
Effect.withSpan(...)
Effect.annotateLogs(...)
Effect.tap(...)
Effect.tapError(...)
```
---
### Dependency injection
```ts
Effect.provide(...)
```
---
### Value transforms
```ts
Effect.map(...)
Effect.mapBoth(...)
Effect.as(...)
```
---
## Rule
If you're changing **behaviour**, use `.pipe()`.
---
# 3. flow()
## Purpose
Use `flow()` to compose reusable pure functions.
Think
> "A named path through data."
Instead of
```ts
const toVehicle =
  (vehicle) =>
    toCard(
      withPrice(
        withImages(vehicle)
      )
    )
```
write
```ts
const toVehicleCard = flow(
  withImages,
  withPrice,
  toCard
)
```
Now the transformation has a name.
---
## Great uses
DTO mapping
```ts
const toVehicle =
  flow(
    Vehicle.fromApi,
    Vehicle.withDisplayPrice,
    Vehicle.toCard
  )
```
---
Validation
```ts
const sanitise =
  flow(
    trim,
    removeHtml,
    normaliseWhitespace
)
```
---
Business rules
```ts
const calculatePremium =
  flow(
    addTax,
    applyDiscount,
    applyInsurance
)
```
---
## Don't use flow for
- effects
- branching
- dependency retrieval
- retries
- spans
- logging
- async work
Those belong in `Effect.gen`.
---
# 4. Layers
Layers describe your application's dependency graph.
Treat them like infrastructure.
```ts
const InfrastructureLayer =
  Layer.mergeAll(
    Database.layer,
    Logger.layer,
    Cache.layer,
    Metrics.layer
  )
```
Then compose.
```ts
const AppLayer =
  InfrastructureLayer.pipe(
    Layer.provide(Config.layer)
  )
```
Large applications should group layers by concern.
```text
Infrastructure
Application
Domain
External Services
```
rather than hundreds of individual provides.
---
# A Complete Example
```ts
import { Effect, Layer } from "effect"
import { flow } from "effect/Function"
const toVehicleCard = flow(
  Vehicle.fromApi,
  Vehicle.withDisplayPrice,
  Vehicle.withPrimaryImage,
  Vehicle.toCard
)
const getVehicleCard =
  (id: VehicleId) =>
    Effect.gen(function* () {
      const api = yield* VehicleApi
      const vehicle =
        yield* api.get(id)
      return toVehicleCard(vehicle)
    }).pipe(
      Effect.retry(policy),
      Effect.withSpan("vehicle.get"),
      Effect.catchTag(
        "VehicleNotFound",
        VehicleErrors.notFound
      )
    )
```
Each construct has exactly one responsibility.
---
# Smells
## Smell 1
Huge flatMap chains
```ts
Effect.flatMap(...)
Effect.flatMap(...)
Effect.flatMap(...)
Effect.flatMap(...)
```
Prefer
```ts
Effect.gen(...)
```
---
## Smell 2
Everything inside gen is piped
```ts
yield* service.pipe(...)
yield* other.pipe(...)
yield* another.pipe(...)
```
Extract decorated effects first.
```ts
const saveVehicle =
  repository.save.pipe(
    Effect.retry(policy)
  )
Effect.gen(function* () {
    yield* saveVehicle(vehicle)
})
```
---
## Smell 3
Huge anonymous flow
```ts
flow(
 ...
 ...
 ...
 ...
 ...
 ...
 ...
 ...
)
```
Break into named pipelines.
---
## Smell 4
Business logic hidden inside pipe
```ts
.pipe(
    Effect.flatMap(...)
)
```
Business logic belongs in `gen`.
---
## Smell 5
Using gen for mapping
Bad
```ts
Effect.gen(function* () {
   return transform(value)
})
```
Good
```ts
Effect.succeed(value).pipe(
    Effect.map(transform)
)
```
---
# Decision Tree
```
Am I building a workflow?
        │
        ├── Yes
        │
        ▼
   Effect.gen
        │
        └── No
Am I composing pure functions?
        │
        ├── Yes
        │
        ▼
       flow()
        │
        └── No
Am I changing behaviour?
        │
        ├── Yes
        │
        ▼
       pipe()
        │
        └── No
Am I building dependencies?
        │
        ├── Yes
        │
        ▼
     Layer.pipe()
```
---
# Team Principles
## 1
Optimise for the next reader.
Not the current writer.
---
## 2
Business logic should read like prose.
Infrastructure should disappear.
---
## 3
Pure code should stay pure.
Effects should stay explicit.
---
## 4
Decorate effects.
Don't bury workflows.
---
## 5
Small named functions beat clever pipelines.
---
## 6
Extract concepts before extracting code.
---
## 7
Every function should have one obvious style.
Avoid mixing all four pillars together.
---
# The Effect Style Mantra
> **gen for flow.**
>
> **pipe for power.**
>
> **flow for form.**
>
> **layers for architecture.**
If every developer follows these four rules, an Effect codebase becomes remarkably consistent. You can tell at a glance whether a piece of code is orchestrating work, decorating behaviour, transforming data, or assembling the application's dependency graph. That consistency is what keeps large Effect codebases approachable as they grow.

I think this is strong enough to become a team-wide convention. It doesn’t try to encode every API in Effect; instead, it teaches the mental model. Once everyone shares that model, most style decisions become obvious without needing dozens of additional rules.