# Legacy Selection Qualification

See the [current guide](../../../../effect4-consumer/src/qualification/optionMatchAndDataNormalization/README.md).
This consumer independently checks the matching Effect 3 API, warnings, clean
controls and runtime contracts. Its andThen plain-constant compiler control is
legacy-only behaviour; use an Effect-returning callback with Effect 4.
