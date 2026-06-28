import { describe, expect, it } from "bun:test";
import plugin from "../src/index";

type Report = { message: string; node: unknown };
type Visitor = Record<string, (node: any) => void>;

function runRule(ruleName: string, visitorName: string, node: unknown): Report[] {
  const reports: Report[] = [];
  const rule = plugin.rules[ruleName];

  if (!rule || !("create" in rule) || !rule.create) {
    throw new Error(`Rule ${ruleName} is not exported`);
  }

  const visitor = rule.create({
    report(report: Report) {
      reports.push(report);
    },
  } as any) as Visitor;

  visitor[visitorName]?.(node);
  return reports;
}

function runRuleSequence(
  ruleName: string,
  visits: Array<{ visitorName: string; node: unknown }>,
): Report[] {
  const reports: Report[] = [];
  const rule = plugin.rules[ruleName];

  if (!rule || !("create" in rule) || !rule.create) {
    throw new Error(`Rule ${ruleName} is not exported`);
  }

  const visitor = rule.create({
    report(report: Report) {
      reports.push(report);
    },
  } as any) as Visitor;

  for (const visit of visits) {
    visitor[visit.visitorName]?.(visit.node);
  }

  return reports;
}

const identifier = (name: string) => ({ type: "Identifier", name });

const memberCall = (object: string, property: string) => ({
  type: "CallExpression",
  callee: {
    type: "MemberExpression",
    object: identifier(object),
    property: identifier(property),
    computed: false,
  },
});

const effectCall = (property: string, ...args: unknown[]) => ({
  type: "CallExpression",
  callee: {
    type: "MemberExpression",
    object: identifier("Effect"),
    property: identifier(property),
    computed: false,
  },
  arguments: args,
});

const pipeCall = (...args: unknown[]) => ({
  type: "CallExpression",
  callee: identifier("pipe"),
  arguments: args,
});

const methodPipeCall = (target: unknown, ...args: unknown[]) => ({
  type: "CallExpression",
  callee: {
    type: "MemberExpression",
    object: target,
    property: identifier("pipe"),
    computed: false,
  },
  arguments: args,
});

const matchValuePipeCall = () => methodPipeCall(
  {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: identifier("Match"),
      property: identifier("value"),
      computed: false,
    },
    arguments: [identifier("value")],
  },
  identifier("branch"),
);

const objectExpression = (value: unknown) => ({
  type: "ObjectExpression",
  properties: [
    {
      type: "Property",
      key: identifier("result"),
      value,
      computed: false,
      method: false,
      shorthand: false,
      kind: "init",
    },
  ],
});

const arrowIife = (body: unknown, ...args: unknown[]) => ({
  type: "CallExpression",
  callee: {
    type: "ArrowFunctionExpression",
    params: [identifier("value")],
    body,
  },
  arguments: args,
});

const functionIife = (body: unknown, ...args: unknown[]) => ({
  type: "CallExpression",
  callee: {
    type: "FunctionExpression",
    id: null,
    params: [identifier("value")],
    body,
  },
  arguments: args,
});

const callbackCall = (callee: unknown, ...args: unknown[]) => ({
  type: "CallExpression",
  callee,
  arguments: args,
});

const arrowCallback = (body: unknown) => ({
  type: "ArrowFunctionExpression",
  params: [identifier("value")],
  body,
});

const functionCallback = (body: unknown) => ({
  type: "FunctionExpression",
  id: identifier("callback"),
  params: [identifier("value")],
  body,
});

const generatorCallback = (body: unknown) => ({
  type: "FunctionExpression",
  id: null,
  generator: true,
  params: [],
  body,
});

const blockStatement = (...body: unknown[]) => ({
  type: "BlockStatement",
  body,
});

const expressionStatement = (expression: unknown) => ({
  type: "ExpressionStatement",
  expression,
});

const callExpression = (callee: unknown, ...args: unknown[]) => ({
  type: "CallExpression",
  callee,
  arguments: args,
});

const importFrom = (source: string) => ({
  type: "ImportDeclaration",
  source: {
    type: "Literal",
    value: source,
  },
});

const variableDeclarationWithInit = (init: unknown) => ({
  type: "VariableDeclaration",
  declarations: [
    {
      type: "VariableDeclarator",
      id: identifier("program"),
      init,
    },
  ],
});

const returnStatement = (argument: unknown) => ({
  type: "ReturnStatement",
  argument,
});

const nullLiteral = () => ({
  type: "Literal",
  value: null,
});

const booleanLiteral = (value: boolean) => ({
  type: "Literal",
  value,
});

const numericLiteral = (value: number) => ({
  type: "Literal",
  value,
});

const property = (key: string, value: unknown) => ({
  type: "Property",
  key: identifier(key),
  value,
  computed: false,
  method: false,
  shorthand: false,
  kind: "init",
});

const spreadElement = (argument: unknown) => ({
  type: "SpreadElement",
  argument,
});

const objectLiteral = (...properties: unknown[]) => ({
  type: "ObjectExpression",
  properties,
});

const arrayLiteral = (...elements: unknown[]) => ({
  type: "ArrayExpression",
  elements,
});

const conditionalExpr = (test: unknown, consequent: unknown, alternate: unknown) => ({
  type: "ConditionalExpression",
  test,
  consequent,
  alternate,
});

const arrayExpression = (...elements: unknown[]) => ({
  type: "ArrayExpression",
  elements,
});

const functionDeclarationReturning = (argument: unknown) => ({
  type: "FunctionDeclaration",
  id: identifier("loadProgram"),
  params: [],
  body: blockStatement(returnStatement(argument)),
});

const qualifiedTypeName = (left: string, right: string) => ({
  type: "TSQualifiedName",
  left: identifier(left),
  right: identifier(right),
});

const typeReference = (left: string, right: string) => ({
  type: "TSTypeReference",
  typeName: qualifiedTypeName(left, right),
});

const typeAliasDeclaration = (typeAnnotation: unknown, name = "ProgramEffect") => ({
  type: "TSTypeAliasDeclaration",
  id: identifier(name),
  typeAnnotation,
});

const tsAsExpression = (expression: unknown, typeAnnotation: unknown) => ({
  type: "TSAsExpression",
  expression,
  typeAnnotation,
});

const tsTypeReference = (name: string) => ({
  type: "TSTypeReference",
  typeName: identifier(name),
});

const tsConstKeyword = () => ({
  type: "TSConstKeyword",
});

const tsStringKeyword = () => ({
  type: "TSStringKeyword",
});

const tsNumberKeyword = () => ({
  type: "TSNumberKeyword",
});

const tsBooleanKeyword = () => ({
  type: "TSBooleanKeyword",
});

const tsTypeAnnotation = (typeAnnotation: unknown) => ({
  type: "TSTypeAnnotation",
  typeAnnotation,
});

const typedIdentifier = (name: string, typeAnnotation: unknown) => ({
  ...identifier(name),
  typeAnnotation: tsTypeAnnotation(typeAnnotation),
});

const functionDeclarationWithParams = (...params: unknown[]) => ({
  type: "FunctionDeclaration",
  id: identifier("domainOperation"),
  params,
  body: blockStatement(returnStatement(identifier("value"))),
});

const unaryExpression = (operator: string, argument: unknown) => ({
  type: "UnaryExpression",
  operator,
  argument,
  prefix: true,
});

const binaryExpression = (left: unknown, operator: string, right: unknown) => ({
  type: "BinaryExpression",
  left,
  operator,
  right,
});

const logicalExpression = (left: unknown, operator: string, right: unknown) => ({
  type: "LogicalExpression",
  left,
  operator,
  right,
});

const stringLiteral = (value: string) => ({
  type: "Literal",
  value,
});

const conditionalExpression = () => ({
  type: "ConditionalExpression",
  test: identifier("condition"),
  consequent: identifier("thenValue"),
  alternate: identifier("elseValue"),
});

const matchWhenCall = (condition: unknown, branch: unknown) => ({
  type: "CallExpression",
  callee: {
    type: "MemberExpression",
    object: identifier("Match"),
    property: identifier("when"),
    computed: false,
  },
  arguments: [condition, arrowCallback(branch)],
});

const matchOrElseCall = (branch: unknown) => ({
  type: "CallExpression",
  callee: {
    type: "MemberExpression",
    object: identifier("Match"),
    property: identifier("orElse"),
    computed: false,
  },
  arguments: [arrowCallback(branch)],
});

describe("linteffect Oxlint plugin", () => {
  it("exports package metadata", () => {
    expect(plugin.meta?.name).toBe("linteffect");
  });

  it("catches React state hooks", () => {
    const reports = runRule("no-react-state", "CallExpression", {
      type: "CallExpression",
      callee: identifier("useState"),
    });

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid React state hooks");
  });

  it("allows unrelated calls for the React hook rule", () => {
    const reports = runRule("no-react-state", "CallExpression", {
      type: "CallExpression",
      callee: identifier("useAtomValue"),
    });

    expect(reports).toHaveLength(0);
  });

  it("catches imperative switch statements in Effect files", () => {
    const reports = runRuleSequence("no-switch-statement", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "SwitchStatement", node: { type: "SwitchStatement" } },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid imperative switch branching");
  });

  it("allows imperative switch statements outside Effect files", () => {
    const reports = runRule("no-switch-statement", "SwitchStatement", {
      type: "SwitchStatement",
    });

    expect(reports).toHaveLength(0);
  });

  it("catches imperative if statements in Effect files", () => {
    const reports = runRuleSequence("no-if-statement", [
      { visitorName: "ImportDeclaration", node: importFrom("@effect-atom/atom-react") },
      { visitorName: "IfStatement", node: { type: "IfStatement" } },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid imperative if branching");
  });

  it("allows imperative if statements outside Effect files", () => {
    const reports = runRule("no-if-statement", "IfStatement", {
      type: "IfStatement",
    });

    expect(reports).toHaveLength(0);
  });

  it("catches direct Effect.as wrappers", () => {
    const reports = runRule("no-effect-as", "CallExpression", memberCall("Effect", "as"));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.as");
  });

  it("catches Effect.Do", () => {
    const reports = runRule("no-effect-do", "MemberExpression", {
      type: "MemberExpression",
      object: identifier("Effect"),
      property: identifier("Do"),
      computed: false,
    });

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.Do");
  });

  it("catches Effect.bind", () => {
    const reports = runRule("no-effect-bind", "CallExpression", memberCall("Effect", "bind"));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.bind");
  });

  it("catches Runtime.runFork", () => {
    const reports = runRule(
      "no-runtime-runfork",
      "CallExpression",
      memberCall("Runtime", "runFork"),
    );

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Runtime.runFork");
  });

  it("catches Effect.async", () => {
    const reports = runRule("no-effect-async", "CallExpression", memberCall("Effect", "async"));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.async");
  });

  it("catches dynamic imports", () => {
    const reports = runRule("prevent-dynamic-imports", "ImportExpression", {
      type: "ImportExpression",
    });

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid dynamic imports");
  });

  it("catches deeply nested Effect calls in Effect files", () => {
    const reports = runRuleSequence("no-nested-effect-call", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("map", effectCall("flatMap", effectCall("succeed", identifier("value")))),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid deeply nested Effect calls");
  });

  it("allows shallow nested Effect calls", () => {
    const reports = runRuleSequence("no-nested-effect-call", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("map", effectCall("succeed", identifier("value"))),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Effect ladders assigned to const", () => {
    const reports = runRule("no-effect-ladder", "VariableDeclaration", variableDeclarationWithInit(
      effectCall("map", effectCall("flatMap", effectCall("succeed", identifier("value")))),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested Effect combinators");
  });

  it("catches Effect ladders returned directly", () => {
    const reports = runRule("no-effect-ladder", "ReturnStatement", returnStatement(
      effectCall("map", effectCall("flatMap", effectCall("succeed", identifier("value")))),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested Effect combinators");
  });

  it("allows shallow Effect assignments", () => {
    const reports = runRule("no-effect-ladder", "VariableDeclaration", variableDeclarationWithInit(
      effectCall("map", effectCall("succeed", identifier("value"))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches nested Effect.flatMap ladders assigned to const", () => {
    const reports = runRule("no-flatmap-ladder", "VariableDeclaration", variableDeclarationWithInit(
      effectCall(
        "flatMap",
        effectCall("flatMap", effectCall("succeed", identifier("value")), identifier("first")),
        identifier("second"),
      ),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested Effect.flatMap");
  });

  it("catches Effect.flatten over Effect.map returned directly", () => {
    const reports = runRule("no-flatmap-ladder", "ReturnStatement", returnStatement(
      effectCall(
        "flatten",
        effectCall("map", effectCall("succeed", identifier("value")), identifier("next")),
      ),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid map+flatten ladders");
  });

  it("allows shallow Effect.flatMap assignments", () => {
    const reports = runRule("no-flatmap-ladder", "VariableDeclaration", variableDeclarationWithInit(
      effectCall("flatMap", effectCall("succeed", identifier("value")), identifier("next")),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches nested pipe calls", () => {
    const reports = runRule("no-pipe-ladder", "CallExpression", pipeCall(
      identifier("value"),
      pipeCall(identifier("next"), identifier("finish")),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested pipe() chains");
  });

  it("catches nested method pipe chains", () => {
    const reports = runRule("no-pipe-ladder", "CallExpression", methodPipeCall(
      identifier("program"),
      methodPipeCall(identifier("inner"), identifier("step")),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested pipe() chains");
  });

  it("allows flat pipe calls", () => {
    const reports = runRule("no-pipe-ladder", "CallExpression", pipeCall(
      identifier("value"),
      identifier("first"),
      identifier("second"),
    ));

    expect(reports).toHaveLength(0);
  });

  it("allows flat pipe calls when AST nodes expose parent links", () => {
    const value = identifier("value") as { parent?: unknown };
    const node = pipeCall(value, identifier("first"));
    value.parent = node;

    const reports = runRule("no-pipe-ladder", "CallExpression", node);

    expect(reports).toHaveLength(0);
  });

  it("catches unary nested Effect call towers", () => {
    const reports = runRule("no-call-tower", "CallExpression", effectCall(
      "asVoid",
      effectCall("succeed", identifier("value")),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested Effect call towers");
  });

  it("catches nested Effect call towers in binary arguments", () => {
    const reports = runRule("no-call-tower", "CallExpression", effectCall(
      "zipRight",
      identifier("left"),
      effectCall("succeed", identifier("right")),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested Effect call towers");
  });

  it("allows flat Effect calls", () => {
    const reports = runRule("no-call-tower", "CallExpression", effectCall(
      "map",
      identifier("program"),
      identifier("next"),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.orElse around sequencing chains", () => {
    const reports = runRule("no-effect-orElse-ladder", "CallExpression", effectCall(
      "orElse",
      effectCall("flatMap", effectCall("succeed", identifier("value")), identifier("next")),
      identifier("fallback"),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.orElse around sequencing chains");
  });

  it("catches Effect.orElse when the first argument contains sequencing", () => {
    const reports = runRule("no-effect-orElse-ladder", "CallExpression", effectCall(
      "orElse",
      effectCall("map", effectCall("tap", identifier("program"), identifier("sideEffect"))),
      identifier("fallback"),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.orElse around sequencing chains");
  });

  it("allows Effect.orElse when only the fallback contains sequencing", () => {
    const reports = runRule("no-effect-orElse-ladder", "CallExpression", effectCall(
      "orElse",
      identifier("program"),
      effectCall("flatMap", effectCall("succeed", identifier("value")), identifier("next")),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches ternary expressions in Effect files", () => {
    const reports = runRuleSequence("no-ternary", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "ConditionalExpression", node: conditionalExpression() },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid ternary expressions");
  });

  it("allows ternary expressions outside Effect files", () => {
    const reports = runRule("no-ternary", "ConditionalExpression", conditionalExpression());

    expect(reports).toHaveLength(0);
  });

  it("catches return null in Effect files", () => {
    const reports = runRuleSequence("no-return-null", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "ReturnStatement", node: returnStatement(nullLiteral()) },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid returning null");
  });

  it("allows return null outside Effect files", () => {
    const reports = runRule("no-return-null", "ReturnStatement", returnStatement(nullLiteral()));

    expect(reports).toHaveLength(0);
  });

  it("allows non-null returns in Effect files", () => {
    const reports = runRuleSequence("no-return-null", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "ReturnStatement", node: returnStatement(identifier("value")) },
      { visitorName: "ReturnStatement", node: returnStatement(null) },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Option.as calls in Effect files", () => {
    const reports = runRuleSequence("no-option-as", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "CallExpression", node: memberCall("Option", "as") },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Option.as");
  });

  it("allows Option.as calls outside Effect files", () => {
    const reports = runRule("no-option-as", "CallExpression", memberCall("Option", "as"));

    expect(reports).toHaveLength(0);
  });

  it("allows unrelated Option calls in Effect files", () => {
    const reports = runRuleSequence("no-option-as", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "CallExpression", node: memberCall("Option", "map") },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.never in Effect files", () => {
    const reports = runRuleSequence("no-effect-never", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "MemberExpression",
        node: {
          type: "MemberExpression",
          object: identifier("Effect"),
          property: identifier("never"),
          computed: false,
        },
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.never");
  });

  it("allows Effect.never outside Effect files", () => {
    const reports = runRule("no-effect-never", "MemberExpression", {
      type: "MemberExpression",
      object: identifier("Effect"),
      property: identifier("never"),
      computed: false,
    });

    expect(reports).toHaveLength(0);
  });

  it("catches nested arrow IIFEs in Effect files", () => {
    const reports = runRuleSequence("no-arrow-ladder", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: arrowIife(
          arrowIife(identifier("value"), identifier("inner")),
          identifier("outer"),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested IIFEs");
  });

  it("allows nested arrow IIFEs outside Effect files", () => {
    const reports = runRule("no-arrow-ladder", "CallExpression", arrowIife(
      arrowIife(identifier("value"), identifier("inner")),
      identifier("outer"),
    ));

    expect(reports).toHaveLength(0);
  });

  it("allows single arrow IIFEs in Effect files", () => {
    const reports = runRuleSequence("no-arrow-ladder", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: arrowIife(identifier("value"), identifier("outer")),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Match.value branches inside object literals", () => {
    const reports = runRule("no-branch-in-object", "ObjectExpression", objectExpression(
      matchValuePipeCall(),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Match/Option/Either inside object literals");
  });

  it("catches Option.match branches inside object literals", () => {
    const reports = runRule("no-branch-in-object", "ObjectExpression", objectExpression(
      memberCall("Option", "match"),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Match/Option/Either inside object literals");
  });

  it("allows Match.value branches outside object literals", () => {
    const reports = runRule("no-branch-in-object", "CallExpression", matchValuePipeCall());

    expect(reports).toHaveLength(0);
  });

  it("catches arrow IIFE wrappers in Effect files", () => {
    const reports = runRuleSequence("no-iife-wrapper", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: arrowIife(identifier("value"), identifier("outer")),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid immediate invocation of inline functions");
  });

  it("catches function IIFE wrappers in Effect files", () => {
    const reports = runRuleSequence("no-iife-wrapper", [
      { visitorName: "ImportDeclaration", node: importFrom("effect/Option") },
      {
        visitorName: "CallExpression",
        node: functionIife(blockStatement(returnStatement(identifier("value"))), identifier("outer")),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid immediate invocation of inline functions");
  });

  it("allows IIFE wrappers outside Effect files", () => {
    const reports = runRule("no-iife-wrapper", "CallExpression", arrowIife(
      identifier("value"),
      identifier("outer"),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches returns in block-bodied arrow callbacks", () => {
    const reports = runRule("no-return-in-arrow", "CallExpression", callbackCall(
      identifier("map"),
      identifier("items"),
      arrowCallback(blockStatement(returnStatement(identifier("value")))),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid block-bodied arrow callbacks with returns");
  });

  it("allows expression-bodied arrow callbacks", () => {
    const reports = runRule("no-return-in-arrow", "CallExpression", callbackCall(
      identifier("map"),
      arrowCallback(identifier("value")),
    ));

    expect(reports).toHaveLength(0);
  });

  it("allows S.filter arrow callbacks with returns", () => {
    const reports = runRule("no-return-in-arrow", "CallExpression", callbackCall(
      {
        type: "MemberExpression",
        object: identifier("S"),
        property: identifier("filter"),
        computed: false,
      },
      arrowCallback(blockStatement(returnStatement(identifier("value")))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("allows Schema.filter arrow callbacks with returns", () => {
    const reports = runRule("no-return-in-arrow", "CallExpression", callbackCall(
      {
        type: "MemberExpression",
        object: identifier("Schema"),
        property: identifier("filter"),
        computed: false,
      },
      arrowCallback(blockStatement(returnStatement(identifier("value")))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches returns in inline function callbacks", () => {
    const reports = runRule("no-return-in-callback", "CallExpression", callbackCall(
      identifier("map"),
      identifier("items"),
      functionCallback(blockStatement(returnStatement(identifier("value")))),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid returns inside inline callbacks");
  });

  it("allows inline function callbacks without returns", () => {
    const reports = runRule("no-return-in-callback", "CallExpression", callbackCall(
      identifier("map"),
      functionCallback(blockStatement({
        type: "ExpressionStatement",
        expression: identifier("value"),
      })),
    ));

    expect(reports).toHaveLength(0);
  });

  it("allows generator callbacks with returns", () => {
    const reports = runRule("no-return-in-callback", "CallExpression", callbackCall(
      memberCall("Effect", "gen").callee,
      generatorCallback(blockStatement(returnStatement(identifier("value")))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.fn generator wrappers in Effect files", () => {
    const reports = runRuleSequence("no-effect-fn-generator", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("fn", generatorCallback(blockStatement(returnStatement(identifier("value"))))),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.fn generator wrappers");
  });

  it("allows Effect.fn generator wrappers outside Effect files", () => {
    const reports = runRule("no-effect-fn-generator", "CallExpression", effectCall(
      "fn",
      generatorCallback(blockStatement(returnStatement(identifier("value")))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches console calls inside Effect.sync in Effect files", () => {
    const reports = runRuleSequence("no-effect-sync-console", [
      { visitorName: "ImportDeclaration", node: importFrom("@effect-atom/atom-react") },
      {
        visitorName: "CallExpression",
        node: effectCall(
          "sync",
          arrowCallback(blockStatement(expressionStatement(memberCall("console", "log")))),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid console.* inside Effect.sync");
  });

  it("allows Effect.sync without console calls in Effect files", () => {
    const reports = runRuleSequence("no-effect-sync-console", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall(
          "sync",
          arrowCallback(blockStatement(returnStatement(identifier("value")))),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("allows console calls outside Effect.sync", () => {
    const reports = runRuleSequence("no-effect-sync-console", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      { visitorName: "CallExpression", node: memberCall("console", "log") },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches nested Effect.gen inside Effect.gen generator bodies", () => {
    const reports = runRuleSequence("no-nested-effect-gen", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall(
          "gen",
          generatorCallback(blockStatement(expressionStatement(effectCall("gen", identifier("inner"))))),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nested Effect.gen");
  });

  it("allows a single Effect.gen generator body", () => {
    const reports = runRuleSequence("no-nested-effect-gen", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall(
          "gen",
          generatorCallback(blockStatement(returnStatement(identifier("value")))),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("allows nested Effect.gen outside Effect files", () => {
    const reports = runRule("no-nested-effect-gen", "CallExpression", effectCall(
      "gen",
      generatorCallback(blockStatement(expressionStatement(effectCall("gen", identifier("inner"))))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches true Match branches returning Effect.void in Effect files", () => {
    const reports = runRuleSequence("no-match-void-branch", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: matchWhenCall(booleanLiteral(true), {
          type: "MemberExpression",
          object: identifier("Effect"),
          property: identifier("void"),
          computed: false,
        }),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid void Match branches");
  });

  it("catches Match.orElse branches returning Effect.void in Effect files", () => {
    const reports = runRuleSequence("no-match-void-branch", [
      { visitorName: "ImportDeclaration", node: importFrom("@effect-atom/atom-react") },
      {
        visitorName: "CallExpression",
        node: matchOrElseCall({
          type: "MemberExpression",
          object: identifier("Effect"),
          property: identifier("void"),
          computed: false,
        }),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid void Match branches");
  });

  it("allows void Match branches outside Effect files", () => {
    const reports = runRule("no-match-void-branch", "CallExpression", matchWhenCall(
      booleanLiteral(true),
      {
        type: "MemberExpression",
        object: identifier("Effect"),
        property: identifier("void"),
        computed: false,
      },
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches sequencing Effect calls inside Match.value branches", () => {
    const reports = runRule("no-match-effect-branch", "CallExpression", methodPipeCall(
      {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: identifier("Match"),
          property: identifier("value"),
          computed: false,
        },
        arguments: [identifier("value")],
      },
      matchWhenCall(identifier("condition"), effectCall(
        "flatMap",
        effectCall("succeed", identifier("value")),
        identifier("next"),
      )),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid multi-step sequencing inside Match branches");
  });

  it("catches sequencing Effect calls inside Option.match branches", () => {
    const reports = runRule("no-match-effect-branch", "CallExpression", {
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: identifier("Option"),
        property: identifier("match"),
        computed: false,
      },
      arguments: [
        identifier("option"),
        objectExpression(effectCall("map", effectCall("succeed", identifier("value")))),
      ],
    });

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid multi-step sequencing inside Option.match branches");
  });

  it("allows simple Effect values inside Match.value branches", () => {
    const reports = runRule("no-match-effect-branch", "CallExpression", methodPipeCall(
      {
        type: "CallExpression",
        callee: {
          type: "MemberExpression",
          object: identifier("Match"),
          property: identifier("value"),
          computed: false,
        },
        arguments: [identifier("value")],
      },
      matchWhenCall(identifier("condition"), effectCall("succeed", identifier("value"))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.sync wrappers around non-console calls in Effect files", () => {
    const reports = runRuleSequence("warn-effect-sync-wrapper", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("sync", arrowCallback(memberCall("Date", "now"))),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.sync around side effects");
  });

  it("allows Effect.sync wrappers around console calls for the warning rule", () => {
    const reports = runRuleSequence("warn-effect-sync-wrapper", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("sync", arrowCallback(memberCall("console", "log"))),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("allows block-bodied Effect.sync callbacks for the warning rule", () => {
    const reports = runRuleSequence("warn-effect-sync-wrapper", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall(
          "sync",
          arrowCallback(blockStatement(expressionStatement(memberCall("Date", "now")))),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.as wrappers around side effects", () => {
    const reports = runRule("no-effect-side-effect-wrapper", "CallExpression", effectCall(
      "as",
      memberCall("console", "log"),
      identifier("done"),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.as for side effects");
  });

  it("catches Effect.zipRight wrappers around side effects", () => {
    const reports = runRule("no-effect-side-effect-wrapper", "CallExpression", effectCall(
      "zipRight",
      memberCall("Atom", "set"),
      effectCall("succeed", identifier("done")),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.zipRight for side effects");
  });

  it("allows Effect.as without side-effect operands for the side-effect wrapper rule", () => {
    const reports = runRule("no-effect-side-effect-wrapper", "CallExpression", effectCall(
      "as",
      effectCall("succeed", identifier("value")),
      identifier("done"),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.all concurrency 1 side-effect sequencing", () => {
    const reports = runRule("no-effect-all-step-sequencing", "CallExpression", effectCall(
      "all",
      arrayExpression(memberCall("Ref", "set")),
      {
        type: "ObjectExpression",
        properties: [property("concurrency", numericLiteral(1))],
      },
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.all for sequential side-effect steps");
  });

  it("catches Effect.all side-effect sequencing discarded with Effect.asVoid", () => {
    const reports = runRule("no-effect-all-step-sequencing", "CallExpression", methodPipeCall(
      effectCall("all", arrayExpression(memberCall("Fiber", "interrupt"))),
      {
        type: "MemberExpression",
        object: identifier("Effect"),
        property: identifier("asVoid"),
        computed: false,
      },
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.all for sequential side-effect steps");
  });

  it("allows Effect.all concurrency 1 without side-effect sequencing", () => {
    const reports = runRule("no-effect-all-step-sequencing", "CallExpression", effectCall(
      "all",
      arrayExpression(effectCall("succeed", identifier("value"))),
      {
        type: "ObjectExpression",
        properties: [property("concurrency", numericLiteral(1))],
      },
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches try/catch statements", () => {
    const reports = runRule("no-try-catch", "TryStatement", {
      type: "TryStatement",
      block: blockStatement(expressionStatement(identifier("work"))),
      handler: {
        type: "CatchClause",
        param: identifier("error"),
        body: blockStatement(expressionStatement(identifier("recover"))),
      },
      finalizer: null,
    });

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid try/catch in Effect files");
  });

  it("catches const pipe aliases around Effect calls", () => {
    const reports = runRule("no-effect-wrapper-alias", "VariableDeclaration", variableDeclarationWithInit(
      pipeCall(effectCall("succeed", identifier("value")), identifier("next")),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect wrapper aliases");
  });

  it("allows direct const Effect values for wrapper alias rule", () => {
    const reports = runRule("no-effect-wrapper-alias", "VariableDeclaration", variableDeclarationWithInit(
      effectCall("gen", generatorCallback(blockStatement(returnStatement(identifier("value"))))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches arrow aliases returning Effect calls", () => {
    const reports = runRule("no-effect-wrapper-alias", "VariableDeclaration", variableDeclarationWithInit(
      arrowCallback(effectCall("succeed", identifier("value"))),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect wrapper aliases");
  });

  it("catches function aliases returning Effect calls", () => {
    const reports = runRule("no-effect-wrapper-alias", "FunctionDeclaration", functionDeclarationReturning(
      effectCall("succeed", identifier("value")),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect wrapper aliases");
  });

  it("allows const aliases that return domain values", () => {
    const reports = runRule("no-effect-wrapper-alias", "VariableDeclaration", variableDeclarationWithInit(
      arrowCallback(identifier("value")),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches manual Effect channel type references", () => {
    const reports = runRule("no-manual-effect-channels", "TSTypeReference", typeReference(
      "Effect",
      "Effect",
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid manual Effect channel tuples");
  });

  it("catches manual Layer channel type references", () => {
    const reports = runRule("no-manual-effect-channels", "TSTypeReference", typeReference(
      "Layer",
      "Layer",
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid manual Effect channel tuples");
  });

  it("allows unrelated type references for manual channel rule", () => {
    const reports = runRule("no-manual-effect-channels", "TSTypeReference", typeReference(
      "Option",
      "Option",
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches catchAll after wrapGraphqlCall in Effect files", () => {
    const reports = runRuleSequence("no-wrapgraphql-catchall", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: pipeCall(
          {
            type: "CallExpression",
            callee: identifier("wrapGraphqlCall"),
            arguments: [identifier("request")],
          },
          effectCall("catchAll", identifier("handler")),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid catchAll after wrapGraphqlCall");
  });

  it("catches catchAll after applyResponse in Effect files", () => {
    const reports = runRuleSequence("no-wrapgraphql-catchall", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: pipeCall(
          identifier("program"),
          effectCall("flatMap", identifier("applyResponse")),
          effectCall("catchAll", identifier("handler")),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid catchAll after wrapGraphqlCall");
  });

  it("allows catchAll without GraphQL wrapper context", () => {
    const reports = runRuleSequence("no-wrapgraphql-catchall", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: pipeCall(identifier("program"), effectCall("catchAll", identifier("handler"))),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Match.value pipelines used as render-time statements in Effect files", () => {
    const reports = runRuleSequence("no-render-side-effects", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "ExpressionStatement",
        node: expressionStatement(methodPipeCall(
          {
            type: "CallExpression",
            callee: {
              type: "MemberExpression",
              object: identifier("Match"),
              property: identifier("value"),
              computed: false,
            },
            arguments: [identifier("condition")],
          },
          matchWhenCall(identifier("condition"), effectCall("succeed", identifier("value"))),
        )),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Match.value(...).pipe(...) as a statement");
  });

  it("allows Match.value pipelines used as expressions for render side effect rule", () => {
    const reports = runRuleSequence("no-render-side-effects", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: methodPipeCall(
          {
            type: "CallExpression",
            callee: {
              type: "MemberExpression",
              object: identifier("Match"),
              property: identifier("value"),
              computed: false,
            },
            arguments: [identifier("condition")],
          },
          matchWhenCall(identifier("condition"), identifier("value")),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Atom operations wrapped in Effect.sync", () => {
    const reports = runRuleSequence("no-atom-registry-effect-sync", [
      { visitorName: "ImportDeclaration", node: importFrom("@effect-atom/atom-react") },
      {
        visitorName: "CallExpression",
        node: effectCall("sync", arrowCallback(blockStatement(expressionStatement(
          callExpression({
            type: "MemberExpression",
            object: identifier("Atom"),
            property: identifier("set"),
            computed: false,
          }, identifier("atom"), identifier("value")),
        )))),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("do not wrap Atom/atomRegistry ops in Effect.sync");
  });

  it("catches atomRegistry operations wrapped in Effect.sync", () => {
    const reports = runRuleSequence("no-atom-registry-effect-sync", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("sync", arrowCallback(callExpression({
          type: "MemberExpression",
          object: identifier("atomRegistry"),
          property: identifier("get"),
          computed: false,
        }, identifier("atom")))),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("do not wrap Atom/atomRegistry ops in Effect.sync");
  });

  it("allows unrelated Effect.sync callbacks for atom registry rule", () => {
    const reports = runRuleSequence("no-atom-registry-effect-sync", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("sync", arrowCallback(callExpression(identifier("readLocalValue")))),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Atom.family reads from collection atoms", () => {
    const reports = runRule("no-family-collection-read", "CallExpression", callExpression(
      {
        type: "MemberExpression",
        object: identifier("Atom"),
        property: identifier("family"),
        computed: false,
      },
      arrowCallback(callExpression(identifier("get"), identifier("UsersCollectionAtom"))),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("Keyed projection atom reads collection atom");
  });

  it("catches Atom.family reads through Atom.get", () => {
    const reports = runRule("no-family-collection-read", "CallExpression", callExpression(
      {
        type: "MemberExpression",
        object: identifier("Atom"),
        property: identifier("family"),
        computed: false,
      },
      arrowCallback(callExpression({
        type: "MemberExpression",
        object: identifier("Atom"),
        property: identifier("get"),
        computed: false,
      }, identifier("SearchResultsAtom"))),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("Keyed projection atom reads collection atom");
  });

  it("allows Atom.family reads from keyed source atoms", () => {
    const reports = runRule("no-family-collection-read", "CallExpression", callExpression(
      {
        type: "MemberExpression",
        object: identifier("Atom"),
        property: identifier("family"),
        computed: false,
      },
      arrowCallback(callExpression(identifier("get"), identifier("UserByKeyAtom"))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches inline runtime Effect.provide calls inside runtime pipe chains", () => {
    const reports = runRuleSequence("no-inline-runtime-provide", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: methodPipeCall(
          identifier("SomeRuntime"),
          effectCall("provide", identifier("SomeRuntimeLive")),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("do not inline runtime provisioning");
  });

  it("allows Effect.provide pipe calls with explicit program arguments", () => {
    const reports = runRuleSequence("no-inline-runtime-provide", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: methodPipeCall(
          identifier("SomeRuntime"),
          effectCall("provide", identifier("SomeRuntimeLive"), identifier("program")),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Ref.update object spread state patches", () => {
    const reports = runRule("no-naked-object-state-update", "CallExpression", callExpression(
      {
        type: "MemberExpression",
        object: identifier("Ref"),
        property: identifier("update"),
        computed: false,
      },
      identifier("stateRef"),
      arrowCallback(objectLiteral(
        spreadElement(identifier("state")),
        property("count", identifier("count")),
      )),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid naked JS state patching");
  });

  it("catches Object.assign state rebuild shortcuts", () => {
    const reports = runRule("no-naked-object-state-update", "CallExpression", callExpression(
      {
        type: "MemberExpression",
        object: identifier("Object"),
        property: identifier("assign"),
        computed: false,
      },
      objectLiteral(),
      identifier("state"),
      identifier("patch"),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid naked JS state patching");
  });

  it("allows Ref.update without object spread state patches", () => {
    const reports = runRule("no-naked-object-state-update", "CallExpression", callExpression(
      {
        type: "MemberExpression",
        object: identifier("Ref"),
        property: identifier("update"),
        computed: false,
      },
      identifier("stateRef"),
      arrowCallback(objectLiteral(property("count", identifier("count")))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.succeed around variables in Effect files", () => {
    const reports = runRuleSequence("no-effect-succeed-variable", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: effectCall("succeed", identifier("value")),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.succeed(variable)");
  });

  it("allows Effect.succeed around literals, object values, arrays, calls, and conditionals", () => {
    const visits = [
      objectLiteral(property("value", identifier("value"))),
      arrayLiteral(identifier("value")),
      callExpression(identifier("makeValue")),
      conditionalExpr(identifier("flag"), identifier("yes"), identifier("no")),
      numericLiteral(1),
    ].map((argument) => ({
      visitorName: "CallExpression",
      node: effectCall("succeed", argument),
    }));

    const reports = runRuleSequence("no-effect-succeed-variable", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      ...visits,
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.Effect references inside type aliases", () => {
    const reports = runRuleSequence("no-effect-type-alias", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "TSTypeAliasDeclaration",
        node: typeAliasDeclaration(typeReference("Effect", "Effect")),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid Effect.Effect type aliases");
  });

  it("allows Effect.Effect type references outside type aliases for the alias rule", () => {
    const reports = runRuleSequence("no-effect-type-alias", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "TSTypeReference",
        node: typeReference("Effect", "Effect"),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches model overlay as assertions in Effect files", () => {
    const reports = runRuleSequence("no-model-overlay-cast", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "VariableDeclaration",
        node: variableDeclarationWithInit(tsAsExpression(
          identifier("decoded"),
          tsTypeReference("DecodedModel"),
        )),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid `as` assertions on decoded model flow");
  });

  it("allows as const assertions for model overlay cast rule", () => {
    const reports = runRuleSequence("no-model-overlay-cast", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "VariableDeclaration",
        node: variableDeclarationWithInit(tsAsExpression(
          objectLiteral(property("tag", stringLiteral("ok"))),
          tsConstKeyword(),
        )),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches unknown boolean coercion helpers paired with Match.orElse null", () => {
    const reports = runRuleSequence("no-unknown-boolean-coercion-helper", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "BinaryExpression",
        node: binaryExpression(
          unaryExpression("typeof", identifier("value")),
          "===",
          stringLiteral("boolean"),
        ),
      },
      {
        visitorName: "CallExpression",
        node: matchOrElseCall(nullLiteral()),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid local unknown-to-boolean coercion helpers");
  });

  it("allows typeof boolean checks without Match.orElse null", () => {
    const reports = runRuleSequence("no-unknown-boolean-coercion-helper", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "BinaryExpression",
        node: binaryExpression(
          unaryExpression("typeof", identifier("value")),
          "===",
          stringLiteral("boolean"),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches nullish coalesce inside Option.fromNullable", () => {
    const reports = runRuleSequence("no-fromnullable-nullish-coalesce", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: callExpression(
          {
            type: "MemberExpression",
            object: identifier("Option"),
            property: identifier("fromNullable"),
            computed: false,
          },
          logicalExpression(identifier("value"), "??", nullLiteral()),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid nullish re-wrap inside Option.fromNullable");
  });

  it("allows direct Option.fromNullable sources", () => {
    const reports = runRuleSequence("no-fromnullable-nullish-coalesce", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: callExpression(
          {
            type: "MemberExpression",
            object: identifier("Option"),
            property: identifier("fromNullable"),
            computed: false,
          },
          identifier("value"),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches repeated Option boolean normalization", () => {
    const reports = runRuleSequence("no-option-boolean-normalization", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: callExpression(
          {
            type: "MemberExpression",
            object: identifier("Option"),
            property: identifier("match"),
            computed: false,
          },
          identifier("input"),
          objectLiteral(
            property("onSome", arrowCallback(binaryExpression(identifier("value"), "===", booleanLiteral(true)))),
            property("onNone", arrowCallback(booleanLiteral(false))),
          ),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid repeated Option boolean normalization");
  });

  it("allows Option.match branches that do not normalize booleans", () => {
    const reports = runRuleSequence("no-option-boolean-normalization", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "CallExpression",
        node: callExpression(
          {
            type: "MemberExpression",
            object: identifier("Option"),
            property: identifier("match"),
            computed: false,
          },
          identifier("input"),
          objectLiteral(
            property("onSome", arrowCallback(identifier("value"))),
            property("onNone", arrowCallback(booleanLiteral(false))),
          ),
        ),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches Effect.succeed string sentinel returns", () => {
    const reports = runRule("no-string-sentinel-return", "CallExpression", effectCall(
      "succeed",
      stringLiteral("done"),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid returning string tokens");
  });

  it("allows Effect.succeed non-string values for string sentinel return rule", () => {
    const reports = runRule("no-string-sentinel-return", "CallExpression", effectCall(
      "succeed",
      objectLiteral(property("status", stringLiteral("done"))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches string status constants", () => {
    const reports = runRule("no-string-sentinel-const", "VariableDeclaration", variableDeclarationWithInit(
      stringLiteral("loading"),
    ));

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid string status constants");
  });

  it("allows non-string constants for string sentinel const rule", () => {
    const reports = runRule("no-string-sentinel-const", "VariableDeclaration", variableDeclarationWithInit(
      objectLiteral(property("status", stringLiteral("loading"))),
    ));

    expect(reports).toHaveLength(0);
  });

  it("catches raw primitive aliases for domain IDs", () => {
    const reports = runRuleSequence("no-raw-domain-id-alias", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "TSTypeAliasDeclaration",
        node: typeAliasDeclaration(tsStringKeyword(), "UserId"),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid raw primitive domain ID aliases");
  });

  it("allows non-ID primitive aliases for the domain ID alias rule", () => {
    const reports = runRuleSequence("no-raw-domain-id-alias", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "TSTypeAliasDeclaration",
        node: typeAliasDeclaration(tsStringKeyword(), "StatusLabel"),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches boolean domain flags in function parameters", () => {
    const reports = runRuleSequence("no-boolean-domain-flag", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "FunctionDeclaration",
        node: functionDeclarationWithParams(
          typedIdentifier("invoiceId", tsStringKeyword()),
          typedIdentifier("shouldNotifyCustomer", tsBooleanKeyword()),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid boolean behavior flags");
  });

  it("allows neutral boolean parameters for the domain flag rule", () => {
    const reports = runRuleSequence("no-boolean-domain-flag", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "FunctionDeclaration",
        node: functionDeclarationWithParams(typedIdentifier("enabled", tsBooleanKeyword())),
      },
    ]);

    expect(reports).toHaveLength(0);
  });

  it("catches magic domain string comparisons", () => {
    const reports = runRuleSequence("no-magic-domain-string", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "BinaryExpression",
        node: binaryExpression(
          {
            type: "MemberExpression",
            object: identifier("order"),
            property: identifier("status"),
            computed: false,
          },
          "===",
          stringLiteral("approved"),
        ),
      },
    ]);

    expect(reports).toHaveLength(1);
    expect(reports[0].message).toContain("avoid magic domain string comparisons");
  });

  it("allows non-string comparisons for the magic domain string rule", () => {
    const reports = runRuleSequence("no-magic-domain-string", [
      { visitorName: "ImportDeclaration", node: importFrom("effect") },
      {
        visitorName: "BinaryExpression",
        node: binaryExpression(identifier("count"), "===", {
          type: "Literal",
          value: 1,
        }),
      },
    ]);

    expect(reports).toHaveLength(0);
  });
});
