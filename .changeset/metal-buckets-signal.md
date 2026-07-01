---
"@opsydyn/oxlint-effect": minor
---

Add the remaining concurrency-safety rules.

This release adds diagnostics for blocking sync calls inside Effect logic,
Promise concurrency APIs inside Effect logic, shared mutable state across
forked or parallel work, and timeout boundaries around noninterruptible Promise
interop.
