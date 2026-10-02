# Legacy Domain Modelling Qualification

See the [current group guide](../../../../effect4-consumer/src/qualification/domainModeling/README.md)
for the Q30 contract and policy limits. This consumer pins Effect 3.21.4 and
uses Schema.minLength, Schema.Schema.Type and variadic Schema.Literal. Do not
copy these APIs into the Effect 4 consumer. Its failures, clean controls, compiler
negative checks and runtime contracts are independently checked by the packed
harness; shared policy does not imply shared API spelling.
