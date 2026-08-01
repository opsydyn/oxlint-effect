---
"@opsydyn/oxlint-effect": minor
---

Add strict concurrency-safety diagnostics for suspension inside semaphore permits, effectful SynchronizedRef modifiers, and unscoped daemon fibers. The rules use conservative direct-call syntax detection and keep custom abstractions outside their analysis scope.
