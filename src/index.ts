import { definePlugin, defineRule } from "@oxlint/plugins";
import type { Context as OxlintContext, ESTree } from "@oxlint/plugins";

type Node = {
  type?: string;
  [key: string]: unknown;
};

function isIdentifier(node: unknown, name?: string): node is Node & { name: string } {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "Identifier" &&
    typeof (node as Node).name === "string" &&
    (name === undefined || (node as Node).name === name)
  );
}

function isMemberExpression(node: unknown, objectName: string, propertyName: string): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const member = node as Node;
  return (
    member.type === "MemberExpression" &&
    member.computed !== true &&
    isIdentifier(member.object, objectName) &&
    isIdentifier(member.property, propertyName)
  );
}

function isEffectMemberCall(node: unknown): node is Node & { arguments: unknown[] } {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    Array.isArray(call.arguments) &&
    typeof call.callee === "object" &&
    call.callee !== null &&
    (call.callee as Node).type === "MemberExpression" &&
    (call.callee as Node).computed !== true &&
    isIdentifier((call.callee as Node).object, "Effect") &&
    isIdentifier((call.callee as Node).property)
  );
}

function firstArgument(node: Node & { arguments: unknown[] }): unknown {
  return node.arguments[0];
}

function isEffectMemberCallNamed(
  node: unknown,
  propertyName: string,
): node is Node & { arguments: unknown[] } {
  if (!isEffectMemberCall(node)) {
    return false;
  }

  const callee = node.callee as Node;
  return isIdentifier((callee.property as Node | undefined), propertyName);
}

function hasDeepNestedEffectFirstArgument(node: unknown): node is Node & { arguments: unknown[] } {
  if (!isEffectMemberCall(node)) {
    return false;
  }

  const inner = firstArgument(node);
  if (!isEffectMemberCall(inner)) {
    return false;
  }

  return isEffectMemberCall(firstArgument(inner));
}

function hasNestedEffectCallArgument(node: unknown): node is Node & { arguments: unknown[] } {
  if (!isEffectMemberCall(node)) {
    return false;
  }

  return node.arguments.slice(0, 2).some((argument) => isEffectMemberCall(argument));
}

function containsEffectMemberCallNamed(node: unknown, propertyName: string): boolean {
  if (isEffectMemberCallNamed(node, propertyName)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsEffectMemberCallNamed(child, propertyName));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  return Object.values(node).some((child) => containsEffectMemberCallNamed(child, propertyName));
}

function getFlatMapLadderMessage(node: unknown): string | undefined {
  if (
    isEffectMemberCallNamed(node, "flatMap") &&
    containsEffectMemberCallNamed(node.arguments, "flatMap")
  ) {
    return "Rule: avoid nested Effect.flatMap. Why: it hides sequencing and pushes laddered control flow. Fix: build context once (Effect.all/Effect.map) and run a single flatMap.";
  }

  if (
    isEffectMemberCallNamed(node, "flatten") &&
    containsEffectMemberCallNamed(firstArgument(node), "map")
  ) {
    return "Rule: avoid map+flatten ladders. Why: they hide sequencing. Fix: build context once (Effect.all/Effect.map) and run a single flatMap.";
  }

  return undefined;
}

const orElseSequencingCalls = ["flatMap", "zipRight", "as", "tap"] as const;

function hasOrElseSequencingFirstArgument(node: unknown): node is Node & { arguments: unknown[] } {
  if (!isEffectMemberCallNamed(node, "orElse")) {
    return false;
  }

  const first = firstArgument(node);
  return orElseSequencingCalls.some((propertyName) => (
    containsEffectMemberCallNamed(first, propertyName)
  ));
}

function isPipeCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  if (call.type !== "CallExpression") {
    return false;
  }

  if (isIdentifier(call.callee, "pipe")) {
    return true;
  }

  const callee = call.callee;
  return (
    typeof callee === "object" &&
    callee !== null &&
    (callee as Node).type === "MemberExpression" &&
    (callee as Node).computed !== true &&
    isIdentifier((callee as Node).property, "pipe")
  );
}

function containsPipeCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isPipeCall(node)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsPipeCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsPipeCall(child, seen)
  ));
}

function isArrowIifeCall(node: unknown): node is Node & { callee: Node; arguments: unknown[] } {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    Array.isArray(call.arguments) &&
    typeof call.callee === "object" &&
    call.callee !== null &&
    (call.callee as Node).type === "ArrowFunctionExpression"
  );
}

function isInlineFunctionIifeCall(node: unknown): node is Node & { callee: Node; arguments: unknown[] } {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    Array.isArray(call.arguments) &&
    typeof call.callee === "object" &&
    call.callee !== null &&
    ((call.callee as Node).type === "ArrowFunctionExpression" ||
      (call.callee as Node).type === "FunctionExpression")
  );
}

function findArrowIifeCall(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (isArrowIifeCall(node)) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findArrowIifeCall(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findArrowIifeCall(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findReturnStatements(node: unknown, seen = new WeakSet<object>()): unknown[] {
  if (Array.isArray(node)) {
    return node.flatMap((child) => findReturnStatements(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return [];
  }

  if (seen.has(node)) {
    return [];
  }
  seen.add(node);

  if ((node as Node).type === "ReturnStatement") {
    return [node];
  }

  return Object.entries(node).flatMap(([key, child]) => (
    key === "parent" ? [] : findReturnStatements(child, seen)
  ));
}

function isSchemaFilterCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    (isMemberExpression(call.callee, "S", "filter") ||
      isMemberExpression(call.callee, "Schema", "filter"))
  );
}

function directArrowCallbackReturns(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const call = node as Node;
  if (call.type !== "CallExpression" || !Array.isArray(call.arguments) || isSchemaFilterCall(call)) {
    return [];
  }

  return call.arguments.flatMap((argument) => {
    if (
      typeof argument !== "object" ||
      argument === null ||
      (argument as Node).type !== "ArrowFunctionExpression"
    ) {
      return [];
    }

    const body = (argument as Node).body;
    if (typeof body !== "object" || body === null || (body as Node).type !== "BlockStatement") {
      return [];
    }

    return findReturnStatements(body);
  });
}

function directFunctionCallbackReturns(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const call = node as Node;
  if (call.type !== "CallExpression" || !Array.isArray(call.arguments)) {
    return [];
  }

  return call.arguments.flatMap((argument) => {
    if (
      typeof argument !== "object" ||
      argument === null ||
      (argument as Node).type !== "FunctionExpression" ||
      (argument as Node).generator === true
    ) {
      return [];
    }

    return findReturnStatements((argument as Node).body);
  });
}

function isGeneratorFunctionExpression(node: unknown): node is Node & { body: unknown } {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "FunctionExpression" &&
    (node as Node).generator === true
  );
}

function getEffectGeneratorArgument(
  node: unknown,
  propertyName: "fn" | "gen",
): (Node & { body: unknown }) | undefined {
  if (!isEffectMemberCallNamed(node, propertyName)) {
    return undefined;
  }

  const fn = firstArgument(node);
  return isGeneratorFunctionExpression(fn) ? fn : undefined;
}

function isEffectGeneratorCall(node: unknown, propertyName: "fn" | "gen"): boolean {
  return getEffectGeneratorArgument(node, propertyName) !== undefined;
}

function findYieldWithoutStar(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findYieldWithoutStar(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  if ((node as Node).type === "YieldExpression" && (node as Node).delegate !== true) {
    return node;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findYieldWithoutStar(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findYieldWithoutStarInEffectGen(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  return generator ? findYieldWithoutStar(generator.body) : undefined;
}

function findPipedYields(node: unknown, seen = new WeakSet<object>()): unknown[] {
  if (Array.isArray(node)) {
    return node.flatMap((child) => findPipedYields(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return [];
  }

  if (seen.has(node)) {
    return [];
  }
  seen.add(node);

  if (
    (node as Node).type === "YieldExpression" &&
    (node as Node).delegate === true &&
    isPipeCall((node as Node).argument)
  ) {
    return [node];
  }

  return Object.entries(node).flatMap(([key, child]) => (
    key === "parent" ? [] : findPipedYields(child, seen)
  ));
}

function repeatedPipedYieldInEffectGen(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  if (!generator) {
    return undefined;
  }

  const pipedYields = findPipedYields(generator.body);
  return pipedYields.length >= 2 ? pipedYields[1] : undefined;
}

function containsNodeType(node: unknown, type: string, seen = new WeakSet<object>()): boolean {
  if (Array.isArray(node)) {
    return node.some((child) => containsNodeType(child, type, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  if ((node as Node).type === type) {
    return true;
  }

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsNodeType(child, type, seen)
  ));
}

function containsIdentifierNamed(node: unknown, name: string, seen = new WeakSet<object>()): boolean {
  if (isIdentifier(node, name)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsIdentifierNamed(child, name, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsIdentifierNamed(child, name, seen)
  ));
}

function containsEffectMemberCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isEffectMemberCall(node)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsEffectMemberCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsEffectMemberCall(child, seen)
  ));
}

function singleYieldVariableName(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "VariableDeclaration") {
    return undefined;
  }

  const declarations = (node as Node).declarations;
  if (!Array.isArray(declarations) || declarations.length !== 1) {
    return undefined;
  }

  const declaration = declarations[0];
  if (
    typeof declaration !== "object" ||
    declaration === null ||
    (declaration as Node).type !== "VariableDeclarator" ||
    !isIdentifier((declaration as Node).id) ||
    typeof (declaration as Node).init !== "object" ||
    (declaration as Node).init === null ||
    ((declaration as Node).init as Node).type !== "YieldExpression" ||
    ((declaration as Node).init as Node).delegate !== true
  ) {
    return undefined;
  }

  return ((declaration as Node).id as Node & { name: string }).name;
}

function isPureMappingReturn(node: unknown, yieldedName: string): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "ReturnStatement") {
    return false;
  }

  const argument = (node as Node).argument;
  return (
    argument !== undefined &&
    !isIdentifier(argument, yieldedName) &&
    !containsNodeType(argument, "YieldExpression") &&
    !containsNodeType(argument, "AwaitExpression") &&
    !containsEffectMemberCall(argument) &&
    !containsIdentifierNamed(argument, "Promise")
  );
}

function genForMappingNode(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  if (!generator || typeof generator.body !== "object" || generator.body === null) {
    return undefined;
  }

  const body = generator.body as Node;
  const statements = Array.isArray(body.body) ? body.body : [];
  if (statements.length !== 2) {
    return undefined;
  }

  const yieldedName = singleYieldVariableName(statements[0]);
  return yieldedName && isPureMappingReturn(statements[1], yieldedName)
    ? node
    : undefined;
}

const workflowSequencingCombinators = new Set(["andThen", "flatMap", "tap", "zipRight"]);

function pipeOperatorArguments(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return [];
  }

  const call = node as Node;
  const args = Array.isArray(call.arguments) ? call.arguments : [];
  if (isIdentifier(call.callee, "pipe")) {
    return args.slice(1);
  }

  const callee = call.callee;
  if (
    typeof callee === "object" &&
    callee !== null &&
    (callee as Node).type === "MemberExpression" &&
    (callee as Node).computed !== true &&
    isIdentifier((callee as Node).property, "pipe")
  ) {
    return args;
  }

  return [];
}

function isWorkflowSequencingOperator(node: unknown): boolean {
  if (!isEffectMemberCall(node)) {
    return false;
  }

  const property = ((node.callee as Node).property as Node | undefined);
  return isIdentifier(property) && workflowSequencingCombinators.has(property.name);
}

function workflowSequencingPipeline(node: unknown): unknown | undefined {
  if (!isPipeCall(node)) {
    return undefined;
  }

  const sequencingCount = pipeOperatorArguments(node)
    .filter((argument) => isWorkflowSequencingOperator(argument))
    .length;

  return sequencingCount >= 3 ? node : undefined;
}

function isFlowCall(node: unknown): node is Node & { arguments: unknown[] } {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "CallExpression" &&
    Array.isArray((node as Node).arguments) &&
    isIdentifier((node as Node).callee, "flow")
  );
}

function isLargeFlowCall(node: unknown): boolean {
  return isFlowCall(node) && node.arguments.length >= 5;
}

function containsAsyncFunction(node: unknown, seen = new WeakSet<object>()): boolean {
  if (
    typeof node === "object" &&
    node !== null &&
    ((node as Node).type === "ArrowFunctionExpression" ||
      (node as Node).type === "FunctionExpression") &&
    (node as Node).async === true
  ) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsAsyncFunction(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsAsyncFunction(child, seen)
  ));
}

function isEffectfulFlowArgument(node: unknown): boolean {
  return (
    containsEffectMemberCall(node) ||
    containsNodeType(node, "YieldExpression") ||
    containsNodeType(node, "AwaitExpression") ||
    containsAsyncFunction(node) ||
    containsConsoleCall(node) ||
    containsIdentifierNamed(node, "Promise") ||
    containsIdentifierNamed(node, "Runtime")
  );
}

function effectfulFlowArgument(node: unknown): unknown | undefined {
  if (!isFlowCall(node)) {
    return undefined;
  }

  return node.arguments.find((argument) => isEffectfulFlowArgument(argument));
}

function inlineNonTrivialFlowArgument(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const call = node as Node & { arguments?: unknown[] };
  return (call.arguments ?? []).find((argument) => (
    isFlowCall(argument) && argument.arguments.length >= 3
  ));
}

const behaviorDecorationOperators = new Set([
  "annotateLogs",
  "as",
  "catchAll",
  "catchSome",
  "catchTag",
  "map",
  "mapBoth",
  "provide",
  "retry",
  "tap",
  "tapError",
  "timeout",
  "timeoutFail",
  "withSpan",
]);

function isBehaviorDecorationOperator(node: unknown): boolean {
  if (!isEffectMemberCall(node)) {
    return false;
  }

  const property = ((node.callee as Node).property as Node | undefined);
  return isIdentifier(property) && behaviorDecorationOperators.has(property.name);
}

function isExistingEffectExpression(node: unknown): boolean {
  return isEffectMemberCall(node) || isPipeCall(node);
}

function staticBehaviorCall(node: unknown): unknown | undefined {
  if (!isBehaviorDecorationOperator(node)) {
    return undefined;
  }

  const first = (node as Node & { arguments: unknown[] }).arguments[0];
  return isExistingEffectExpression(first) ? node : undefined;
}

function isBehaviorDecoratedYield(node: unknown): boolean {
  if (
    typeof node !== "object" ||
    node === null ||
    (node as Node).type !== "YieldExpression" ||
    (node as Node).delegate !== true ||
    !isPipeCall((node as Node).argument)
  ) {
    return false;
  }

  return pipeOperatorArguments((node as Node).argument)
    .some((argument) => isBehaviorDecorationOperator(argument));
}

function findBehaviorDecoratedYields(node: unknown, seen = new WeakSet<object>()): unknown[] {
  if (Array.isArray(node)) {
    return node.flatMap((child) => findBehaviorDecoratedYields(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return [];
  }

  if (seen.has(node)) {
    return [];
  }
  seen.add(node);

  if (isBehaviorDecoratedYield(node)) {
    return [node];
  }

  return Object.entries(node).flatMap(([key, child]) => (
    key === "parent" ? [] : findBehaviorDecoratedYields(child, seen)
  ));
}

function repeatedDecoratedYieldInEffectGen(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  if (!generator) {
    return undefined;
  }

  const decoratedYields = findBehaviorDecoratedYields(generator.body);
  return decoratedYields.length >= 2 ? decoratedYields[1] : undefined;
}

function workflowInBehaviorPipe(node: unknown): unknown | undefined {
  if (!isPipeCall(node)) {
    return undefined;
  }

  const parts = pipeOperatorArguments(node);
  const hasBehaviorDecoration = parts.some((part) => isBehaviorDecorationOperator(part));
  if (!hasBehaviorDecoration) {
    return undefined;
  }

  const workflowCount = parts
    .filter((part) => isWorkflowSequencingOperator(part))
    .length;
  const hasEmbeddedControlFlow = parts.some((part) => (
    containsNodeType(part, "IfStatement") ||
    containsNodeType(part, "SwitchStatement") ||
    containsNodeType(part, "ForStatement") ||
    containsNodeType(part, "ForInStatement") ||
    containsNodeType(part, "ForOfStatement") ||
    containsNodeType(part, "WhileStatement")
  ));

  return workflowCount >= 2 || hasEmbeddedControlFlow ? node : undefined;
}

type StylePillar = "workflow" | "pure" | "behavior" | "layer";

function stylePillarsInNode(
  node: unknown,
  pillars = new Set<StylePillar>(),
  seen = new WeakSet<object>(),
): Set<StylePillar> {
  if (isEffectMemberCallNamed(node, "gen") || isWorkflowSequencingOperator(node)) {
    pillars.add("workflow");
  }

  if (isFlowCall(node)) {
    pillars.add("pure");
  }

  if (isBehaviorDecorationOperator(node)) {
    pillars.add("behavior");
  }

  if (isMemberCall(node, "Layer") || isMemberExpression(node, "Layer", "pipe")) {
    pillars.add("layer");
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      stylePillarsInNode(child, pillars, seen);
    }
    return pillars;
  }

  if (typeof node !== "object" || node === null) {
    return pillars;
  }

  if (seen.has(node)) {
    return pillars;
  }
  seen.add(node);

  for (const [key, child] of Object.entries(node)) {
    if (key !== "parent") {
      stylePillarsInNode(child, pillars, seen);
    }
  }

  return pillars;
}

function isFunctionLike(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (
      (node as Node).type === "FunctionDeclaration" ||
      (node as Node).type === "FunctionExpression" ||
      (node as Node).type === "ArrowFunctionExpression"
    )
  );
}

function mixedPillarFunctionNode(node: unknown): unknown | undefined {
  if (!isFunctionLike(node)) {
    return undefined;
  }

  const body = (node as Node).body;
  return stylePillarsInNode(body).size >= 3 ? node : undefined;
}

function callExpressionDepth(node: unknown, seen = new WeakSet<object>()): number {
  if (Array.isArray(node)) {
    return node.reduce((maxDepth, child) => Math.max(maxDepth, callExpressionDepth(child, seen)), 0);
  }

  if (typeof node !== "object" || node === null) {
    return 0;
  }

  if (seen.has(node)) {
    return 0;
  }
  seen.add(node);

  const childDepth = Object.entries(node).reduce((maxDepth, [key, child]) => (
    key === "parent" ? maxDepth : Math.max(maxDepth, callExpressionDepth(child, seen))
  ), 0);

  return (node as Node).type === "CallExpression" ? childDepth + 1 : childDepth;
}

function cleverEffectExpressionNode(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const pillars = stylePillarsInNode(node);
  const hasWrapperTrick = isInlineFunctionIifeCall(node) || findArrowIifeCall(node) !== undefined;
  return pillars.size >= 2 && (callExpressionDepth(node) >= 4 || hasWrapperTrick) ? node : undefined;
}

function oversizedAnonymousConceptNode(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const call = node as Node & { arguments?: unknown[] };
  for (const argument of call.arguments ?? []) {
    if (
      typeof argument !== "object" ||
      argument === null ||
      !isFunctionLike(argument)
    ) {
      continue;
    }

    const body = (argument as Node).body;
    if (
      typeof body === "object" &&
      body !== null &&
      (body as Node).type === "BlockStatement" &&
      Array.isArray((body as Node).body) &&
      ((body as Node).body as unknown[]).length >= 3
    ) {
      return argument;
    }
  }

  return undefined;
}

function calleeContainsEffectService(node: unknown): boolean {
  if (isMemberExpression(node, "Effect", "Service")) {
    return true;
  }

  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  return calleeContainsEffectService((node as Node).callee);
}

function effectServiceOptionsObject(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const call = node as Node & { arguments?: unknown[] };
  if (!calleeContainsEffectService(call.callee)) {
    return undefined;
  }

  return [...(call.arguments ?? [])]
    .reverse()
    .find((argument) => (
      typeof argument === "object" &&
      argument !== null &&
      (argument as Node).type === "ObjectExpression"
    ));
}

function effectServiceClassOptions(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "ClassDeclaration") {
    return undefined;
  }

  return effectServiceOptionsObject((node as Node).superClass);
}

function isContextTagCall(node: unknown): boolean {
  return isMemberCall(node, "Context", "Tag") || isMemberCall(node, "Context", "GenericTag");
}

function containsLayerProvideCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isMemberCall(node, "Layer", "provide")) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsLayerProvideCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsLayerProvideCall(child, seen)
  ));
}

function hasAccessorsTrue(options: unknown): boolean {
  return isBooleanLiteral(objectPropertyValue(options, "accessors"), true);
}

function namespaceEffectImport(node: unknown): unknown | undefined {
  if (!isEffectEcosystemImport(getImportSource(node) ?? "")) {
    return undefined;
  }

  const specifiers = typeof node === "object" && node !== null ? (node as Node).specifiers : undefined;
  return Array.isArray(specifiers)
    ? specifiers.find((specifier) => (
      typeof specifier === "object" &&
      specifier !== null &&
      (specifier as Node).type === "ImportNamespaceSpecifier"
    ))
    : undefined;
}

function isYieldedServiceDependency(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "YieldExpression" &&
    (node as Node).delegate === true &&
    isIdentifier((node as Node).argument) &&
    ((node as Node).argument as { name: string }).name.endsWith("Service")
  );
}

function findNode(
  node: unknown,
  predicate: (node: unknown) => boolean,
  seen = new WeakSet<object>(),
): unknown | undefined {
  if (predicate(node)) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findNode(child, predicate, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findNode(child, predicate, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function serviceDependencyWithoutDeclaration(options: unknown): unknown | undefined {
  if (objectPropertyValue(options, "dependencies")) {
    return undefined;
  }

  return findNode(
    objectPropertyValue(options, "effect") ?? objectPropertyValue(options, "scoped"),
    isYieldedServiceDependency,
  );
}

function isLayerCompositionCall(node: unknown): boolean {
  if (!isMemberCall(node, "Layer")) {
    return false;
  }

  const property = ((node as Node).callee as Node).property;
  return isIdentifier(property) && (property.name === "provide" || property.name.startsWith("merge"));
}

function isRequestHandler(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "FunctionDeclaration") {
    return false;
  }

  const id = (node as Node).id;
  return isIdentifier(id) && /(handler|route|request)$/i.test(id.name);
}

function layerCompositionInRequestHandler(node: unknown): unknown | undefined {
  if (!isRequestHandler(node)) {
    return undefined;
  }

  return findNode((node as Node).body, isLayerCompositionCall) ? node : undefined;
}

function layerProvideCallTower(node: unknown): unknown | undefined {
  if (!isMemberCall(node, "Layer", "provide")) {
    return undefined;
  }

  return findNode(firstArgument(node as Node & { arguments: unknown[] }), (child) => (
    child !== node && isMemberCall(child, "Layer", "provide")
  ));
}

function isEffectOrLayerProvideCall(node: unknown): boolean {
  return isEffectMemberCallNamed(node, "provide") || isMemberCall(node, "Layer", "provide");
}

function inlineLayerProvideInProgram(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  return generator ? findNode(generator.body, isEffectOrLayerProvideCall) : undefined;
}

function layerMergeChain(node: unknown): unknown | undefined {
  if (!isMemberCall(node, "Layer", "merge")) {
    return undefined;
  }

  return ((node as Node).arguments as unknown[] | undefined)
    ?.find((argument) => findNode(argument, (child) => (
      child !== node && isMemberCall(child, "Layer", "merge")
    )));
}

function isLayerLikeDeclarationName(node: unknown): boolean {
  return isIdentifier(node) && /(Layer|Live)$/.test(node.name);
}

function scatteredLayerProvideDeclaration(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "VariableDeclaration") {
    return undefined;
  }

  return ((node as Node).declarations as unknown[] | undefined)
    ?.find((declarator) => (
      typeof declarator === "object" &&
      declarator !== null &&
      isLayerLikeDeclarationName((declarator as Node).id) &&
      findNode((declarator as Node).init, isEffectOrLayerProvideCall)
    ));
}

function functionReturnsPromise(node: unknown): boolean {
  if (!isFunctionLike(node)) {
    return false;
  }

  return (
    isIdentifierTypeReference(returnTypeAnnotation(node), "Promise") ||
    findPromiseApiCall((node as Node).body) !== undefined
  );
}

function isPromiseReturningProperty(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "Property" &&
    functionReturnsPromise((node as Node).value)
  );
}

function promiseReturningServiceMethod(node: unknown): unknown | undefined {
  return findNode(node, isPromiseReturningProperty);
}

function objectHasServiceMethod(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "ObjectExpression") {
    return false;
  }

  const properties = (node as Node).properties;
  return Array.isArray(properties) && properties.some((propertyNode) => (
    typeof propertyNode === "object" &&
    propertyNode !== null &&
    (propertyNode as Node).type === "Property" &&
    (isFunctionLike((propertyNode as Node).value) ||
      isEffectMemberCallNamed((propertyNode as Node).value, "fn"))
  ));
}

function manualServiceObjectExport(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const declaration = (node as Node).declaration;
  if (typeof declaration !== "object" || declaration === null) {
    return undefined;
  }

  if ((declaration as Node).type !== "VariableDeclaration") {
    return undefined;
  }

  for (const declarator of ((declaration as Node).declarations as unknown[] | undefined) ?? []) {
    if (
      typeof declarator === "object" &&
      declarator !== null &&
      isIdentifier((declarator as Node).id) &&
      ((declarator as Node).id as { name: string }).name.endsWith("Service") &&
      objectHasServiceMethod((declarator as Node).init)
    ) {
      return declarator;
    }
  }

  return undefined;
}

function isAsyncFunctionCallback(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    ((node as Node).type === "ArrowFunctionExpression" ||
      (node as Node).type === "FunctionExpression") &&
    (node as Node).async === true
  );
}

const effectAsyncCallbackCombinators = new Set([
  "andThen",
  "catchAll",
  "catchTag",
  "filterOrFail",
  "flatMap",
  "forEach",
  "map",
  "orElse",
  "tap",
]);

function findAsyncEffectCombinatorCallback(node: unknown): unknown | undefined {
  if (!isEffectMemberCall(node)) {
    return undefined;
  }

  const callee = node.callee as Node;
  const property = callee.property;
  if (!isIdentifier(property) || !effectAsyncCallbackCombinators.has(property.name)) {
    return undefined;
  }

  return node.arguments.find((argument) => isAsyncFunctionCallback(argument));
}

function findThrowStatement(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findThrowStatement(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  if ((node as Node).type === "ThrowStatement") {
    return node;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findThrowStatement(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findThrowInEffectLogic(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  if (generator) {
    return findThrowStatement(generator.body);
  }

  if (!isEffectMemberCall(node)) {
    return undefined;
  }

  const callee = node.callee as Node;
  const property = callee.property;
  if (!isIdentifier(property) || !effectAsyncCallbackCombinators.has(property.name)) {
    return undefined;
  }

  for (const argument of node.arguments) {
    const body = callbackBody(argument);
    const match = body ? findThrowStatement(body) : undefined;
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findTryStatement(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findTryStatement(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  if ((node as Node).type === "TryStatement") {
    return node;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findTryStatement(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findTryCatchInEffectLogic(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  if (generator) {
    return findTryStatement(generator.body);
  }

  if (!isEffectMemberCall(node)) {
    return undefined;
  }

  const callee = node.callee as Node;
  const property = callee.property;
  if (!isIdentifier(property) || !effectAsyncCallbackCombinators.has(property.name)) {
    return undefined;
  }

  for (const argument of node.arguments) {
    const body = callbackBody(argument);
    const match = body ? findTryStatement(body) : undefined;
    if (match) {
      return match;
    }
  }

  return undefined;
}

function isPromiseStaticApiCall(node: unknown): boolean {
  return (
    isMemberCall(node, "Promise", "all") ||
    isMemberCall(node, "Promise", "allSettled") ||
    isMemberCall(node, "Promise", "any") ||
    isMemberCall(node, "Promise", "race") ||
    isMemberCall(node, "Promise", "reject") ||
    isMemberCall(node, "Promise", "resolve")
  );
}

function isPromiseChainCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  const callee = (node as Node).callee;
  return (
    typeof callee === "object" &&
    callee !== null &&
    (callee as Node).type === "MemberExpression" &&
    (callee as Node).computed !== true &&
    (isIdentifier((callee as Node).property, "then") ||
      isIdentifier((callee as Node).property, "catch") ||
      isIdentifier((callee as Node).property, "finally"))
  );
}

function findPromiseApiCall(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findPromiseApiCall(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  if (isPromiseStaticApiCall(node) || isPromiseChainCall(node)) {
    return node;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findPromiseApiCall(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findPromiseApiInEffectLogic(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  if (generator) {
    return findPromiseApiCall(generator.body);
  }

  if (!isEffectMemberCall(node)) {
    return undefined;
  }

  const callee = node.callee as Node;
  const property = callee.property;
  if (!isIdentifier(property) || !effectAsyncCallbackCombinators.has(property.name)) {
    return undefined;
  }

  for (const argument of node.arguments) {
    const body = callbackBody(argument);
    const match = body ? findPromiseApiCall(body) : undefined;
    if (match) {
      return match;
    }
  }

  return undefined;
}

const promiseConcurrencyMethods = new Set(["all", "allSettled", "any", "race"]);

function isPromiseConcurrencyCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  const callee = (node as Node).callee;
  return (
    typeof callee === "object" &&
    callee !== null &&
    (callee as Node).type === "MemberExpression" &&
    (callee as Node).computed !== true &&
    isIdentifier((callee as Node).object, "Promise") &&
    isIdentifier((callee as Node).property) &&
    promiseConcurrencyMethods.has(((callee as Node).property as { name: string }).name)
  );
}

function findPromiseConcurrencyCall(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findPromiseConcurrencyCall(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  if (isPromiseConcurrencyCall(node)) {
    return node;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findPromiseConcurrencyCall(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findPromiseConcurrencyInEffectLogic(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  if (generator) {
    return findPromiseConcurrencyCall(generator.body);
  }

  if (isEffectMemberCallNamed(node, "sync")) {
    const body = callbackBody(firstArgument(node));
    return body ? findPromiseConcurrencyCall(body) : undefined;
  }

  if (!isEffectMemberCall(node)) {
    return undefined;
  }

  const callee = node.callee as Node;
  const property = callee.property;
  if (!isIdentifier(property) || !effectAsyncCallbackCombinators.has(property.name)) {
    return undefined;
  }

  for (const argument of node.arguments) {
    const body = callbackBody(argument);
    const match = body ? findPromiseConcurrencyCall(body) : undefined;
    if (match) {
      return match;
    }
  }

  return undefined;
}

function callbackHasParameter(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const callback = node as Node;
  return (
    (callback.type === "ArrowFunctionExpression" || callback.type === "FunctionExpression") &&
    Array.isArray(callback.params) &&
    callback.params.length > 0
  );
}

function isCancellationAwareTryPromise(node: unknown): boolean {
  if (!isEffectMemberCallNamed(node, "tryPromise")) {
    return false;
  }

  const argument = firstArgument(node);
  if (callbackHasParameter(argument)) {
    return true;
  }

  return callbackHasParameter(objectPropertyValue(argument, "try"));
}

function isNoninterruptiblePromiseEffect(node: unknown): boolean {
  if (isEffectMemberCallNamed(node, "promise")) {
    return true;
  }

  return isEffectMemberCallNamed(node, "tryPromise") && !isCancellationAwareTryPromise(node);
}

function noninterruptiblePromiseTimeoutNode(node: unknown): unknown | undefined {
  if (!isEffectMemberCallNamed(node, "timeout")) {
    return undefined;
  }

  const effect = firstArgument(node);
  return isNoninterruptiblePromiseEffect(effect) ? effect : undefined;
}

const blockingSyncObjectNames = new Set(["crypto", "fs", "zlib"]);

function isBlockingSyncCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  const callee = (node as Node).callee;
  if (isIdentifier(callee)) {
    return callee.name.endsWith("Sync");
  }

  if (
    typeof callee !== "object" ||
    callee === null ||
    (callee as Node).type !== "MemberExpression" ||
    (callee as Node).computed === true ||
    !isIdentifier((callee as Node).object) ||
    !isIdentifier((callee as Node).property)
  ) {
    return false;
  }

  const objectName = ((callee as Node).object as { name: string }).name;
  const propertyName = ((callee as Node).property as { name: string }).name;
  return blockingSyncObjectNames.has(objectName) && propertyName.endsWith("Sync");
}

function findBlockingSyncCall(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findBlockingSyncCall(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  if (isBlockingSyncCall(node)) {
    return node;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findBlockingSyncCall(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findBlockingSyncCallInEffectLogic(node: unknown): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen");
  if (generator) {
    return findBlockingSyncCall(generator.body);
  }

  if (isEffectMemberCallNamed(node, "sync")) {
    const body = callbackBody(firstArgument(node));
    return body ? findBlockingSyncCall(body) : undefined;
  }

  return undefined;
}

const effectRunMethods = new Set([
  "runCallback",
  "runFork",
  "runPromise",
  "runPromiseExit",
  "runSync",
  "runSyncExit",
]);

function isEffectRunCall(node: unknown): boolean {
  if (!isEffectMemberCall(node)) {
    return false;
  }

  const callee = node.callee as Node;
  const property = callee.property;
  return isIdentifier(property) && effectRunMethods.has(property.name);
}

function isEffectOrDieReference(node: unknown): boolean {
  return (
    isMemberExpression(node, "Effect", "orDie") ||
    isMemberExpression(node, "Effect", "orDieWith") ||
    isEffectMemberCallNamed(node, "orDie") ||
    isEffectMemberCallNamed(node, "orDieWith")
  );
}

function findEffectOrDieOutsideBoundary(node: unknown): unknown | undefined {
  if (isEffectOrDieReference(node)) {
    return node;
  }

  if (isPipeCall(node)) {
    return pipeParts(node).find((part) => isEffectOrDieReference(part));
  }

  return undefined;
}

function isSwallowedCatchAllBody(node: unknown): boolean {
  return (
    isEffectMemberCallNamed(node, "succeed") ||
    isEffectMemberCallNamed(node, "asVoid") ||
    isEffectMemberCallNamed(node, "ignore") ||
    isEffectVoidMember(node)
  );
}

function getSwallowedCatchAllHandler(node: unknown): unknown | undefined {
  if (!isEffectMemberCallNamed(node, "catchAll")) {
    return undefined;
  }

  const handler = firstArgument(node);
  const body = callbackBody(handler);
  return isSwallowedCatchAllBody(body) ? body : undefined;
}

function isEffectIgnoreReference(node: unknown): boolean {
  return isMemberExpression(node, "Effect", "ignore") || isEffectMemberCallNamed(node, "ignore");
}

function findEffectIgnore(node: unknown): unknown | undefined {
  if (isEffectIgnoreReference(node)) {
    return node;
  }

  if (isPipeCall(node)) {
    return pipeParts(node).find((part) => isEffectIgnoreReference(part));
  }

  return undefined;
}

function isConsoleCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    typeof call.callee === "object" &&
    call.callee !== null &&
    (call.callee as Node).type === "MemberExpression" &&
    (call.callee as Node).computed !== true &&
    isIdentifier((call.callee as Node).object, "console") &&
    isIdentifier((call.callee as Node).property)
  );
}

function isIdentifierCall(node: unknown, name: string): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return call.type === "CallExpression" && isIdentifier(call.callee, name);
}

function isMemberCall(node: unknown, objectName: string, propertyName?: string): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    typeof call.callee === "object" &&
    call.callee !== null &&
    (call.callee as Node).type === "MemberExpression" &&
    (call.callee as Node).computed !== true &&
    isIdentifier((call.callee as Node).object, objectName) &&
    isIdentifier((call.callee as Node).property) &&
    (propertyName === undefined || isIdentifier((call.callee as Node).property, propertyName))
  );
}

function isEffectLogCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  if (
    call.type !== "CallExpression" ||
    typeof call.callee !== "object" ||
    call.callee === null ||
    (call.callee as Node).type !== "MemberExpression" ||
    (call.callee as Node).computed === true ||
    !isIdentifier((call.callee as Node).object, "Effect") ||
    !isIdentifier((call.callee as Node).property)
  ) {
    return false;
  }

  return ((call.callee as Node).property as { name: string }).name.startsWith("log");
}

function containsConsoleCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isConsoleCall(node)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsConsoleCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsConsoleCall(child, seen)
  ));
}

function containsWrapperSideEffect(node: unknown, seen = new WeakSet<object>()): boolean {
  if (
    isIdentifierCall(node, "setState") ||
    isMemberCall(node, "Atom", "set") ||
    isIdentifierCall(node, "invalidate") ||
    isEffectLogCall(node) ||
    isConsoleCall(node)
  ) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsWrapperSideEffect(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsWrapperSideEffect(child, seen)
  ));
}

function containsAllStepSideEffect(node: unknown, seen = new WeakSet<object>()): boolean {
  if (
    isMemberCall(node, "Ref", "set") ||
    isMemberCall(node, "Atom", "set") ||
    isMemberCall(node, "SubscriptionRef", "set") ||
    isMemberCall(node, "Reactivity", "invalidate") ||
    isMemberCall(node, "Fiber", "interrupt") ||
    isEffectLogCall(node)
  ) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsAllStepSideEffect(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsAllStepSideEffect(child, seen)
  ));
}

function hasConcurrencyOne(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const object = node as Node;
  if (object.type !== "ObjectExpression" || !Array.isArray(object.properties)) {
    return false;
  }

  return object.properties.some((entry) => {
    if (typeof entry !== "object" || entry === null) {
      return false;
    }

    const prop = entry as Node;
    const key = prop.key;
    const value = prop.value as Node | undefined;
    return (
      ((isIdentifier(key, "concurrency")) ||
        (typeof key === "object" && key !== null && (key as Node).value === "concurrency")) &&
      typeof value === "object" &&
      value !== null &&
      ((value.type === "Literal" || value.type === "NumericLiteral") && value.value === 1)
    );
  });
}

function hasConcurrencyOption(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const object = node as Node;
  if (object.type !== "ObjectExpression" || !Array.isArray(object.properties)) {
    return false;
  }

  return object.properties.some((entry) => {
    if (typeof entry !== "object" || entry === null) {
      return false;
    }

    const key = (entry as Node).key;
    return (
      isIdentifier(key, "concurrency") ||
      (typeof key === "object" && key !== null && (key as Node).value === "concurrency")
    );
  });
}

function isCollectionMapCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    typeof call.callee === "object" &&
    call.callee !== null &&
    (call.callee as Node).type === "MemberExpression" &&
    (call.callee as Node).computed !== true &&
    isIdentifier((call.callee as Node).property, "map")
  );
}

function isUnboundedMappedEffectAll(node: unknown): boolean {
  return (
    isEffectMemberCallNamed(node, "all") &&
    isCollectionMapCall(firstArgument(node)) &&
    !hasConcurrencyOption((node as Node & { arguments: unknown[] }).arguments[1])
  );
}

function containsEffectForkCall(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (isEffectMemberCallNamed(node, "fork")) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = containsEffectForkCall(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = containsEffectForkCall(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function containsEffectMemberCallInSet(
  node: unknown,
  propertyNames: ReadonlySet<string>,
  seen = new WeakSet<object>(),
): boolean {
  if (isEffectMemberCall(node)) {
    const callee = node.callee as Node;
    const property = callee.property;
    if (isIdentifier(property) && propertyNames.has(property.name)) {
      return true;
    }
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsEffectMemberCallInSet(child, propertyNames, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsEffectMemberCallInSet(child, propertyNames, seen)
  ));
}

const raceCleanupCalls = new Set([
  "acquireRelease",
  "acquireUseRelease",
  "ensuring",
  "forkIn",
  "forkScoped",
  "scoped",
]);

function isEffectRaceWithoutCleanup(node: unknown): boolean {
  if (!isEffectMemberCallNamed(node, "race") && !isEffectMemberCallNamed(node, "raceAll")) {
    return false;
  }

  return !containsEffectMemberCallInSet((node as Node & { arguments: unknown[] }).arguments, raceCleanupCalls);
}

function isUnboundedEffectForEach(node: unknown): boolean {
  return (
    isEffectMemberCallNamed(node, "forEach") &&
    !hasConcurrencyOption((node as Node & { arguments: unknown[] }).arguments[2])
  );
}

const retryCalls = new Set(["retry"]);

function isUnboundedConcurrentRetry(node: unknown): boolean {
  return (
    (isUnboundedMappedEffectAll(node) || isUnboundedEffectForEach(node)) &&
    containsEffectMemberCallInSet((node as Node & { arguments: unknown[] }).arguments, retryCalls)
  );
}

function variableDeclarationIdentifierNames(node: unknown): string[] {
  if (typeof node !== "object" || node === null || (node as Node).type !== "VariableDeclaration") {
    return [];
  }

  const declarations = (node as Node).declarations;
  if (!Array.isArray(declarations)) {
    return [];
  }

  return declarations.flatMap((declaration) => {
    if (typeof declaration !== "object" || declaration === null) {
      return [];
    }

    const id = (declaration as Node).id;
    return isIdentifier(id) ? [id.name] : [];
  });
}

function collectDeclaredIdentifierNames(
  node: unknown,
  names = new Set<string>(),
  seen = new WeakSet<object>(),
): Set<string> {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectDeclaredIdentifierNames(child, names, seen);
    }
    return names;
  }

  if (typeof node !== "object" || node === null) {
    return names;
  }

  if (seen.has(node)) {
    return names;
  }
  seen.add(node);

  if ((node as Node).type === "VariableDeclaration") {
    for (const name of variableDeclarationIdentifierNames(node)) {
      names.add(name);
    }
  }

  for (const [key, child] of Object.entries(node)) {
    if (key !== "parent") {
      collectDeclaredIdentifierNames(child, names, seen);
    }
  }

  return names;
}

const mutatingCollectionMethods = new Set([
  "add",
  "clear",
  "delete",
  "pop",
  "push",
  "reverse",
  "set",
  "shift",
  "sort",
  "splice",
  "unshift",
]);

function mutatedIdentifierName(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const candidate = node as Node;
  if (
    candidate.type === "AssignmentExpression" &&
    isIdentifier(candidate.left)
  ) {
    return candidate.left.name;
  }

  if (
    candidate.type === "UpdateExpression" &&
    isIdentifier(candidate.argument)
  ) {
    return candidate.argument.name;
  }

  if (
    candidate.type === "CallExpression" &&
    typeof candidate.callee === "object" &&
    candidate.callee !== null &&
    (candidate.callee as Node).type === "MemberExpression" &&
    (candidate.callee as Node).computed !== true &&
    isIdentifier((candidate.callee as Node).object) &&
    isIdentifier((candidate.callee as Node).property) &&
    mutatingCollectionMethods.has(((candidate.callee as Node).property as { name: string }).name)
  ) {
    return ((candidate.callee as Node).object as { name: string }).name;
  }

  return undefined;
}

function findSharedMutableStateMutation(
  node: unknown,
  mutableNames: ReadonlySet<string>,
  localNames = collectDeclaredIdentifierNames(node),
  seen = new WeakSet<object>(),
): unknown | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findSharedMutableStateMutation(child, mutableNames, localNames, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  const mutatedName = mutatedIdentifierName(node);
  if (mutatedName && mutableNames.has(mutatedName) && !localNames.has(mutatedName)) {
    return node;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findSharedMutableStateMutation(child, mutableNames, localNames, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function concurrentEffectWorkNode(node: unknown): unknown | undefined {
  if (
    isEffectMemberCallNamed(node, "fork") ||
    isEffectMemberCallNamed(node, "all") ||
    isEffectMemberCallNamed(node, "forEach")
  ) {
    return (node as Node & { arguments: unknown[] }).arguments;
  }

  return undefined;
}

const concurrentEffectCalls = new Set(["all", "forEach", "fork", "race", "raceAll"]);

function containsConcurrentOperation(node: unknown, seen = new WeakSet<object>()): boolean {
  if (containsEffectMemberCallInSet(node, concurrentEffectCalls)) {
    return true;
  }

  if (isMemberCall(node, "Queue", "take")) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsConcurrentOperation(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsConcurrentOperation(child, seen)
  ));
}

function isUninterruptibleConcurrentRegion(node: unknown): boolean {
  return (
    isEffectMemberCallNamed(node, "uninterruptible") &&
    containsConcurrentOperation((node as Node & { arguments: unknown[] }).arguments[0])
  );
}

function isUnboundedQueueOrPubSub(node: unknown): boolean {
  return isMemberCall(node, "Queue", "unbounded") || isMemberCall(node, "PubSub", "unbounded");
}

function isMutableContainerInit(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const candidate = node as Node;
  return (
    candidate.type === "ObjectExpression" ||
    candidate.type === "ArrayExpression" ||
    (
      candidate.type === "NewExpression" &&
      (isIdentifier(candidate.callee, "Map") || isIdentifier(candidate.callee, "Set"))
    ) ||
    (
      candidate.type === "CallExpression" &&
      (isIdentifier(candidate.callee, "Map") || isIdentifier(candidate.callee, "Set"))
    )
  );
}

function mutableGlobalDeclarationNames(node: unknown): string[] {
  if (typeof node !== "object" || node === null || (node as Node).type !== "VariableDeclaration") {
    return [];
  }

  const declaration = node as Node;
  const declarations = Array.isArray(declaration.declarations) ? declaration.declarations : [];
  if (declaration.kind === "let" || declaration.kind === "var") {
    return variableDeclarationIdentifierNames(node);
  }

  return declarations.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) {
      return [];
    }

    const id = (entry as Node).id;
    return isIdentifier(id) && isMutableContainerInit((entry as Node).init) ? [id.name] : [];
  });
}

function forkedFiberVariableName(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "VariableDeclarator") {
    return undefined;
  }

  const declarator = node as Node;
  return isIdentifier(declarator.id) && isEffectMemberCallNamed(declarator.init, "fork")
    ? declarator.id.name
    : undefined;
}

const fiberObservationCalls = new Set(["await", "interrupt", "join"]);

function observedFiberVariableName(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const call = node as Node & { arguments?: unknown[] };
  const callee = call.callee;
  if (
    typeof callee !== "object" ||
    callee === null ||
    (callee as Node).type !== "MemberExpression" ||
    (callee as Node).computed === true ||
    !isIdentifier((callee as Node).object, "Fiber") ||
    !isIdentifier((callee as Node).property) ||
    !fiberObservationCalls.has(((callee as Node).property as { name: string }).name) ||
    !Array.isArray(call.arguments)
  ) {
    return undefined;
  }

  const [fiber] = call.arguments;
  return isIdentifier(fiber) ? fiber.name : undefined;
}

function isEffectAsVoidPipeArgument(node: unknown): boolean {
  return isMemberExpression(node, "Effect", "asVoid") || isMemberCall(node, "Effect", "asVoid");
}

function isEffectAllAsVoidPipe(node: unknown): node is Node & { callee: Node; arguments: unknown[] } {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  if (
    call.type !== "CallExpression" ||
    !Array.isArray(call.arguments) ||
    typeof call.callee !== "object" ||
    call.callee === null ||
    (call.callee as Node).type !== "MemberExpression" ||
    (call.callee as Node).computed === true ||
    !isIdentifier((call.callee as Node).property, "pipe")
  ) {
    return false;
  }

  return (
    isEffectMemberCallNamed((call.callee as Node).object, "all") &&
    call.arguments.some((argument) => isEffectAsVoidPipeArgument(argument))
  );
}

function pipeParts(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null || !isPipeCall(node)) {
    return [];
  }

  const call = node as Node & { arguments: unknown[] };
  if (isIdentifier(call.callee, "pipe")) {
    return call.arguments;
  }

  const callee = call.callee as Node;
  return [callee.object, ...call.arguments];
}

function isPipeStartingWithEffect(node: unknown): boolean {
  const [first] = pipeParts(node);
  return first !== undefined && containsAnyEffectMemberCall(first);
}

function isEffectWrapperAliasExpression(node: unknown): boolean {
  if (isPipeStartingWithEffect(node)) {
    return true;
  }

  if (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "ArrowFunctionExpression"
  ) {
    const body = (node as Node).body;
    return isEffectMemberCall(body) || isPipeStartingWithEffect(body);
  }

  return false;
}

function hasEffectWrapperAliasReturn(node: unknown): boolean {
  return findReturnStatements(node).some((returnNode) => (
    typeof returnNode === "object" &&
    returnNode !== null &&
    (isEffectWrapperAliasExpression((returnNode as Node).argument) ||
      isEffectMemberCall((returnNode as Node).argument))
  ));
}

function isQualifiedTypeReference(node: unknown, leftName: string, rightName: string): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "TSTypeReference") {
    return false;
  }

  const typeName = (node as Node).typeName;
  return (
    typeof typeName === "object" &&
    typeName !== null &&
    (typeName as Node).type === "TSQualifiedName" &&
    isIdentifier((typeName as Node).left, leftName) &&
    isIdentifier((typeName as Node).right, rightName)
  );
}

function isIdentifierTypeReference(node: unknown, name: string): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "TSTypeReference" &&
    isIdentifier((node as Node).typeName, name)
  );
}

function typeArguments(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const container = (node as Node).typeParameters ?? (node as Node).typeArguments;
  if (typeof container !== "object" || container === null) {
    return [];
  }

  const params = (container as Node).params ?? (container as Node).arguments;
  return Array.isArray(params) ? params : [];
}

function isGenericErrorType(node: unknown): boolean {
  return isIdentifier(node, "Error") || isIdentifierTypeReference(node, "Error");
}

function returnTypeAnnotation(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const returnType = (node as Node).returnType;
  if (typeof returnType !== "object" || returnType === null) {
    return undefined;
  }

  return (returnType as Node).typeAnnotation ?? returnType;
}

function genericEffectErrorReturnType(node: unknown): unknown | undefined {
  const annotation = returnTypeAnnotation(node);
  if (!isQualifiedTypeReference(annotation, "Effect", "Effect")) {
    return undefined;
  }

  const [, error] = typeArguments(annotation);
  return isGenericErrorType(error) ? annotation : undefined;
}

function exportedGenericEffectErrorTarget(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const exportNode = node as Node;
  if (
    exportNode.type !== "ExportNamedDeclaration" &&
    exportNode.type !== "ExportDefaultDeclaration"
  ) {
    return undefined;
  }

  const declaration = exportNode.declaration;
  if (typeof declaration !== "object" || declaration === null) {
    return undefined;
  }

  if ((declaration as Node).type === "FunctionDeclaration") {
    return genericEffectErrorReturnType(declaration);
  }

  if ((declaration as Node).type !== "VariableDeclaration") {
    return undefined;
  }

  for (const declarator of ((declaration as Node).declarations as unknown[] | undefined) ?? []) {
    if (typeof declarator !== "object" || declarator === null) {
      continue;
    }

    const init = (declarator as Node).init;
    if (
      typeof init === "object" &&
      init !== null &&
      ((init as Node).type === "ArrowFunctionExpression" ||
        (init as Node).type === "FunctionExpression")
    ) {
      const target = genericEffectErrorReturnType(init);
      if (target) {
        return target;
      }
    }
  }

  return undefined;
}

function containsQualifiedTypeReference(
  node: unknown,
  leftName: string,
  rightName: string,
  seen = new WeakSet<object>(),
): boolean {
  if (isQualifiedTypeReference(node, leftName, rightName)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsQualifiedTypeReference(child, leftName, rightName, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsQualifiedTypeReference(child, leftName, rightName, seen)
  ));
}

function containsWrapGraphqlCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isIdentifierCall(node, "wrapGraphqlCall")) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsWrapGraphqlCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsWrapGraphqlCall(child, seen)
  ));
}

function isApplyResponseFlatMap(node: unknown): boolean {
  return (
    isEffectMemberCallNamed(node, "flatMap") &&
    isIdentifier(firstArgument(node), "applyResponse")
  );
}

function containsApplyResponseFlatMap(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isApplyResponseFlatMap(node)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsApplyResponseFlatMap(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsApplyResponseFlatMap(child, seen)
  ));
}

function findEffectCatchAll(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (isEffectMemberCallNamed(node, "catchAll")) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findEffectCatchAll(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findEffectCatchAll(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function getWrapGraphqlCatchAll(node: unknown): unknown | undefined {
  const parts = pipeParts(node);
  if (parts.length === 0) {
    return undefined;
  }

  const catchAll = findEffectCatchAll(parts);
  if (!catchAll) {
    return undefined;
  }

  return containsWrapGraphqlCall(parts) || containsApplyResponseFlatMap(parts)
    ? catchAll
    : undefined;
}

const atomOperationMethods = new Set(["get", "set", "update", "modify", "refresh"]);

function callbackBody(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const callback = node as Node;
  if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") {
    return undefined;
  }

  return callback.body;
}

function isAtomOperationCall(node: unknown): node is Node & { arguments: unknown[] } {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  if (
    call.type !== "CallExpression" ||
    !Array.isArray(call.arguments) ||
    typeof call.callee !== "object" ||
    call.callee === null ||
    (call.callee as Node).type !== "MemberExpression" ||
    (call.callee as Node).computed === true
  ) {
    return false;
  }

  const callee = call.callee as Node;
  return (
    (isIdentifier(callee.object, "Atom") || isIdentifier(callee.object, "atomRegistry")) &&
    isIdentifier(callee.property) &&
    atomOperationMethods.has((callee.property as { name: string }).name)
  );
}

function findAtomOperationCall(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (isAtomOperationCall(node)) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findAtomOperationCall(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findAtomOperationCall(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findAtomOperationInsideEffectSync(node: unknown): unknown | undefined {
  if (!isEffectMemberCallNamed(node, "sync")) {
    return undefined;
  }

  const body = callbackBody(firstArgument(node));
  return body ? findAtomOperationCall(body) : undefined;
}

function isCollectionAtomIdentifier(node: unknown): boolean {
  if (!isIdentifier(node)) {
    return false;
  }

  return /(CollectionAtom|ListAtom|Visible.*Atom|ResultsAtom|ReadStateAtom)$/.test(node.name);
}

function getCollectionAtomReadTarget(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const call = node as Node;
  if (call.type !== "CallExpression" || !Array.isArray(call.arguments)) {
    return undefined;
  }

  const isFamilyRead =
    isIdentifier(call.callee, "get") ||
    isMemberExpression(call.callee, "Atom", "get") ||
    isMemberExpression(call.callee, "get", "get");

  if (!isFamilyRead) {
    return undefined;
  }

  const [atom] = call.arguments;
  return isCollectionAtomIdentifier(atom) ? atom : undefined;
}

function findFamilyCollectionRead(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  const target = getCollectionAtomReadTarget(node);
  if (target) {
    return target;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findFamilyCollectionRead(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findFamilyCollectionRead(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function isEffectProvideWithSingleArgument(node: unknown): boolean {
  return isEffectMemberCallNamed(node, "provide") && node.arguments.length === 1;
}

function findInlineRuntimeProvide(node: unknown): unknown | undefined {
  if (!isPipeCall(node)) {
    return undefined;
  }

  return pipeParts(node).find((part) => isEffectProvideWithSingleArgument(part));
}

function hasObjectSpread(node: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof node === "object" && node !== null && (node as Node).type === "SpreadElement") {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => hasObjectSpread(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && hasObjectSpread(child, seen)
  ));
}

function isRefStateUpdateWithSpread(node: unknown): boolean {
  if (!isMemberCall(node, "Ref", "update") && !isMemberCall(node, "Ref", "modify")) {
    return false;
  }

  const callback = (node as Node & { arguments: unknown[] }).arguments[1];
  const body = callbackBody(callback);
  return hasObjectSpread(body);
}

function isEmptyObjectExpression(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "ObjectExpression" &&
    Array.isArray((node as Node).properties) &&
    ((node as Node).properties as unknown[]).length === 0
  );
}

function containsObjectEntriesCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isMemberCall(node, "Object", "entries")) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsObjectEntriesCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsObjectEntriesCall(child, seen)
  ));
}

function isNakedObjectStateUpdate(node: unknown): boolean {
  if (isRefStateUpdateWithSpread(node)) {
    return true;
  }

  if (isMemberCall(node, "Object", "assign")) {
    const args = (node as Node & { arguments: unknown[] }).arguments;
    return args.length >= 3 && isEmptyObjectExpression(args[0]);
  }

  if (isMemberCall(node, "Object", "fromEntries")) {
    return containsObjectEntriesCall((node as Node & { arguments: unknown[] }).arguments[0]);
  }

  return isMemberCall(node, "JSON", "stringify") || isMemberCall(node, "JSON", "parse");
}

function isEffectSucceedVariableArgument(node: unknown): boolean {
  if (isIdentifier(node)) {
    return true;
  }

  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "MemberExpression"
  );
}

function isVariableAsAssertion(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "VariableDeclaration") {
    return false;
  }

  return ((node as Node).declarations as unknown[] | undefined)?.some((declaration) => {
    if (typeof declaration !== "object" || declaration === null) {
      return false;
    }

    const init = (declaration as Node).init;
    return (
      typeof init === "object" &&
      init !== null &&
      (init as Node).type === "TSAsExpression" &&
      typeof (init as Node).typeAnnotation === "object" &&
      (init as Node).typeAnnotation !== null &&
      ((init as Node).typeAnnotation as Node).type !== "TSConstKeyword"
    );
  }) ?? false;
}

function isTypeofBooleanCheck(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "BinaryExpression") {
    return false;
  }

  const binary = node as Node;
  if (binary.operator !== "===") {
    return false;
  }

  const left = binary.left;
  const right = binary.right;
  return (
    typeof left === "object" &&
    left !== null &&
    (left as Node).type === "UnaryExpression" &&
    (left as Node).operator === "typeof" &&
    typeof right === "object" &&
    right !== null &&
    ((right as Node).type === "Literal" || (right as Node).type === "StringLiteral") &&
    (right as Node).value === "boolean"
  );
}

function isMatchOrElseNullCall(node: unknown): boolean {
  return isMatchBranchCall(node, "orElse") && isNullLiteral(arrowCallbackBody(node.arguments[0]));
}

function isStringLiteral(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    ((node as Node).type === "Literal" || (node as Node).type === "StringLiteral") &&
    typeof (node as Node).value === "string"
  );
}

function isUndefinedIdentifier(node: unknown): boolean {
  return isIdentifier(node, "undefined");
}

function isNullishRewrap(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "LogicalExpression" &&
    (node as Node).operator === "??" &&
    (isNullLiteral((node as Node).right) || isUndefinedIdentifier((node as Node).right))
  );
}

function isOptionFromNullableNullishCoalesce(node: unknown): boolean {
  return (
    isMemberCall(node, "Option", "fromNullable") &&
    isNullishRewrap((node as Node & { arguments: unknown[] }).arguments[0])
  );
}

function objectPropertyValue(node: unknown, keyName: string): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "ObjectExpression") {
    return undefined;
  }

  for (const property of ((node as Node).properties as unknown[] | undefined) ?? []) {
    if (typeof property !== "object" || property === null) {
      continue;
    }

    const key = (property as Node).key;
    if (isIdentifier(key, keyName)) {
      return (property as Node).value;
    }
  }

  return undefined;
}

function isBooleanTrueComparison(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "BinaryExpression") {
    return false;
  }

  const binary = node as Node;
  return (
    binary.operator === "===" &&
    (isBooleanLiteral(binary.left, true) || isBooleanLiteral(binary.right, true))
  );
}

function isOptionBooleanNormalization(node: unknown): boolean {
  if (!isMemberCall(node, "Option", "match")) {
    return false;
  }

  const config = (node as Node & { arguments: unknown[] }).arguments[1];
  const onSome = objectPropertyValue(config, "onSome");
  const onNone = objectPropertyValue(config, "onNone");
  return (
    isBooleanTrueComparison(arrowCallbackBody(onSome)) &&
    isBooleanLiteral(arrowCallbackBody(onNone), false)
  );
}

function isStringSentinelConst(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "VariableDeclaration") {
    return false;
  }

  return ((node as Node).declarations as unknown[] | undefined)?.some((declaration) => (
    typeof declaration === "object" &&
    declaration !== null &&
    isStringLiteral((declaration as Node).init)
  )) ?? false;
}

function isBooleanLiteral(node: unknown, value: boolean): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    ((node as Node).type === "Literal" || (node as Node).type === "BooleanLiteral") &&
    (node as Node).value === value
  );
}

function isEffectVoidMember(node: unknown): boolean {
  return isMemberExpression(node, "Effect", "void");
}

function isMatchBranchCall(node: unknown, propertyName?: "when" | "orElse"): node is Node & { arguments: unknown[] } {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    Array.isArray(call.arguments) &&
    typeof call.callee === "object" &&
    call.callee !== null &&
    (call.callee as Node).type === "MemberExpression" &&
    (call.callee as Node).computed !== true &&
    isIdentifier((call.callee as Node).object, "Match") &&
    isIdentifier((call.callee as Node).property) &&
    (propertyName === undefined || isIdentifier((call.callee as Node).property, propertyName))
  );
}

function arrowCallbackBody(node: unknown): unknown | undefined {
  if (
    typeof node !== "object" ||
    node === null ||
    (node as Node).type !== "ArrowFunctionExpression"
  ) {
    return undefined;
  }

  return (node as Node).body;
}

function isVoidMatchBranch(node: unknown): boolean {
  if (!isMatchBranchCall(node)) {
    return false;
  }

  const [first, second] = node.arguments;
  if (isIdentifier((node.callee as Node).property, "when")) {
    return (
      (isBooleanLiteral(first, true) || isBooleanLiteral(first, false)) &&
      isEffectVoidMember(arrowCallbackBody(second))
    );
  }

  return (
    isIdentifier((node.callee as Node).property, "orElse") &&
    isEffectVoidMember(arrowCallbackBody(first))
  );
}

const branchSequencingEffectCalls = ["flatMap", "map", "andThen", "tap", "zipRight"] as const;

function isStreamMemberCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return (
    call.type === "CallExpression" &&
    typeof call.callee === "object" &&
    call.callee !== null &&
    (call.callee as Node).type === "MemberExpression" &&
    (call.callee as Node).computed !== true &&
    isIdentifier((call.callee as Node).object, "Stream") &&
    isIdentifier((call.callee as Node).property)
  );
}

function containsAnyEffectMemberCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isEffectMemberCall(node)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsAnyEffectMemberCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsAnyEffectMemberCall(child, seen)
  ));
}

function containsBranchSequencingCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (
    branchSequencingEffectCalls.some((propertyName) => isEffectMemberCallNamed(node, propertyName)) ||
    isPipeCall(node) ||
    isStreamMemberCall(node)
  ) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsBranchSequencingCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsBranchSequencingCall(child, seen)
  ));
}

function isSequencingBranchBody(node: unknown): boolean {
  return containsAnyEffectMemberCall(node) && containsBranchSequencingCall(node);
}

function containsSequencingMatchBranch(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isMatchBranchCall(node)) {
    const body = isIdentifier((node.callee as Node).property, "when")
      ? arrowCallbackBody(node.arguments[1])
      : arrowCallbackBody(node.arguments[0]);

    if (isSequencingBranchBody(body)) {
      return true;
    }
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsSequencingMatchBranch(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsSequencingMatchBranch(child, seen)
  ));
}

function containsMatchBranchCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isMatchBranchCall(node)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsMatchBranchCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsMatchBranchCall(child, seen)
  ));
}

function isOptionMatchCall(node: unknown): node is Node & { arguments: unknown[] } {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "CallExpression" &&
    Array.isArray((node as Node).arguments) &&
    isMemberExpression((node as Node).callee, "Option", "match")
  );
}

function isExpressionBodiedArrowCall(node: unknown): boolean {
  const body = arrowCallbackBody(node);
  return (
    typeof body === "object" &&
    body !== null &&
    (body as Node).type === "CallExpression"
  );
}

function findEffectGenCall(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  if (isEffectMemberCallNamed(node, "gen")) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findEffectGenCall(child, seen);
      if (match) {
        return match;
      }
    }
    return undefined;
  }

  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  if (seen.has(node)) {
    return undefined;
  }
  seen.add(node);

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    const match = findEffectGenCall(child, seen);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function isMatchValuePipeCall(node: unknown): boolean {
  if (!isPipeCall(node) || typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  const callee = call.callee as Node;
  const object = callee.object;
  return (
    typeof object === "object" &&
    object !== null &&
    (object as Node).type === "CallExpression" &&
    isMemberExpression((object as Node).callee, "Match", "value")
  );
}

function isObjectBranchCall(node: unknown): boolean {
  return (
    isMatchValuePipeCall(node) ||
    (typeof node === "object" &&
      node !== null &&
      (node as Node).type === "CallExpression" &&
      (isMemberExpression((node as Node).callee, "Option", "match") ||
        isMemberExpression((node as Node).callee, "Either", "match")))
  );
}

function containsObjectBranchCall(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isObjectBranchCall(node)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsObjectBranchCall(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsObjectBranchCall(child, seen)
  ));
}

function objectPropertyValues(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const object = node as Node;
  if (object.type !== "ObjectExpression" || !Array.isArray(object.properties)) {
    return [];
  }

  return object.properties
    .map((property) => (
      typeof property === "object" && property !== null ? (property as Node).value : undefined
    ))
    .filter((value) => value !== undefined);
}

function isRawDomainIdAlias(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "TSTypeAliasDeclaration") {
    return false;
  }

  const aliasName = (node as Node).id;
  const typeAnnotation = (node as Node).typeAnnotation as Node | undefined;
  return (
    isIdentifier(aliasName) &&
    /(?:Id|ID)$/.test(aliasName.name) &&
    (typeAnnotation?.type === "TSStringKeyword" || typeAnnotation?.type === "TSNumberKeyword")
  );
}

function isBooleanTypeAnnotation(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const annotation = node as Node;
  if (annotation.type === "TSBooleanKeyword") {
    return true;
  }

  return (
    annotation.type === "TSTypeAnnotation" &&
    typeof annotation.typeAnnotation === "object" &&
    annotation.typeAnnotation !== null &&
    (annotation.typeAnnotation as Node).type === "TSBooleanKeyword"
  );
}

function unwrapTypeAnnotation(node: unknown): Node | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const annotation = node as Node;
  if (
    annotation.type === "TSTypeAnnotation" &&
    typeof annotation.typeAnnotation === "object" &&
    annotation.typeAnnotation !== null
  ) {
    return annotation.typeAnnotation as Node;
  }

  return annotation;
}

function isStringOrNumberTypeAnnotation(node: unknown): boolean {
  const annotation = unwrapTypeAnnotation(node);
  return annotation?.type === "TSStringKeyword" || annotation?.type === "TSNumberKeyword";
}

function isAnyOrObjectTypeAnnotation(node: unknown): boolean {
  const annotation = unwrapTypeAnnotation(node);
  return annotation?.type === "TSAnyKeyword" || annotation?.type === "TSObjectKeyword";
}

function isDateTypeAnnotation(node: unknown): boolean {
  const annotation = unwrapTypeAnnotation(node);
  return (
    annotation?.type === "TSTypeReference" &&
    isIdentifier((annotation as Node).typeName, "Date")
  );
}

function primitiveDomainParameters(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null || !Array.isArray((node as Node).params)) {
    return [];
  }

  const domainNamePattern =
    /(?:id|amount|currency|account|user|order|customer|invoice|payment|price|total|quantity|transfer|fund|balance)/i;
  return ((node as Node).params as unknown[]).filter((param) => (
    isIdentifier(param) &&
    isStringOrNumberTypeAnnotation((param as Node).typeAnnotation) &&
    domainNamePattern.test(param.name)
  ));
}

function hasPrimitiveHeavyDomainParameters(node: unknown): boolean {
  return primitiveDomainParameters(node).length >= 3;
}

function isBooleanDomainFlagParameter(node: unknown): boolean {
  if (!isIdentifier(node)) {
    return false;
  }

  return (
    /^(?:is|has|should|with|allow|enable|can|use)[A-Z0-9_]/.test(node.name) &&
    isBooleanTypeAnnotation((node as Node).typeAnnotation)
  );
}

function functionBooleanDomainFlagParameters(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null || !Array.isArray((node as Node).params)) {
    return [];
  }

  return ((node as Node).params as unknown[]).filter(isBooleanDomainFlagParameter);
}

function getPropertyName(node: unknown): string | undefined {
  if (isIdentifier(node)) {
    return node.name;
  }

  if (typeof node === "object" && node !== null && typeof (node as Node).value === "string") {
    return (node as Node).value as string;
  }

  return undefined;
}

function isRawTimeFieldName(name: string): boolean {
  return /(?:createdAt|updatedAt|expiresAt|expiredAt|renewedAt|startedAt|endedAt|deletedAt|timestamp|timeoutMs|durationMs|ttlMs|ttl)$/i.test(name);
}

function isRawTimeDomainField(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "TSPropertySignature") {
    return false;
  }

  const property = node as Node;
  const propertyName = getPropertyName(property.key);
  const typeAnnotation = property.typeAnnotation;
  return (
    propertyName !== undefined &&
    isRawTimeFieldName(propertyName) &&
    (isStringOrNumberTypeAnnotation(typeAnnotation) || isDateTypeAnnotation(typeAnnotation))
  );
}

function typeMembers(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const object = node as Node;
  if (
    object.type === "TSInterfaceDeclaration" &&
    typeof object.body === "object" &&
    object.body !== null &&
    Array.isArray((object.body as Node).body)
  ) {
    return (object.body as Node).body as unknown[];
  }

  if (object.type === "TSTypeLiteral" && Array.isArray(object.members)) {
    return object.members as unknown[];
  }

  return [];
}

function rawTimeDomainFields(node: unknown): unknown[] {
  return typeMembers(node).filter(isRawTimeDomainField);
}

function isOverloadedOptionsParameter(node: unknown): boolean {
  if (!isIdentifier(node)) {
    return false;
  }

  return (
    /^(?:opts|options|config)$/i.test(node.name) &&
    isAnyOrObjectTypeAnnotation((node as Node).typeAnnotation)
  );
}

function overloadedOptionsParameters(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null || !Array.isArray((node as Node).params)) {
    return [];
  }

  return ((node as Node).params as unknown[]).filter(isOverloadedOptionsParameter);
}

const comparisonOperators = new Set(["==", "===", "!=", "!==", ">", ">=", "<", "<="]);

function comparisonCount(node: unknown, seen = new WeakSet<object>()): number {
  if (Array.isArray(node)) {
    return node.reduce((count, child) => count + comparisonCount(child, seen), 0);
  }

  if (typeof node !== "object" || node === null) {
    return 0;
  }

  if (seen.has(node)) {
    return 0;
  }
  seen.add(node);

  const expression = node as Node;
  if (expression.type === "BinaryExpression" && comparisonOperators.has(String(expression.operator))) {
    return 1;
  }

  if (expression.type !== "LogicalExpression") {
    return 0;
  }

  return comparisonCount(expression.left, seen) + comparisonCount(expression.right, seen);
}

function isDomainLogicConditional(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "LogicalExpression" &&
    comparisonCount(node) >= 3
  );
}

function stateFlagMember(node: unknown): { objectName: string; propertyName: string } | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "MemberExpression") {
    return undefined;
  }

  const member = node as Node;
  if (member.computed === true || !isIdentifier(member.object) || !isIdentifier(member.property)) {
    return undefined;
  }

  const propertyName = member.property.name;
  if (!/(?:cancelled|canceled|shipped|approved|rejected|pending|active|inactive|enabled|disabled|locked|archived|deleted|submitted|processing|failed|complete|completed)$/i.test(propertyName)) {
    return undefined;
  }

  return {
    objectName: member.object.name,
    propertyName,
  };
}

function collectStateFlagMembers(
  node: unknown,
  members = new Map<string, Set<string>>(),
  seen = new WeakSet<object>(),
): Map<string, Set<string>> {
  const member = stateFlagMember(node);
  if (member) {
    const properties = members.get(member.objectName) ?? new Set<string>();
    properties.add(member.propertyName);
    members.set(member.objectName, properties);
    return members;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      collectStateFlagMembers(child, members, seen);
    }
    return members;
  }

  if (typeof node !== "object" || node === null) {
    return members;
  }

  if (seen.has(node)) {
    return members;
  }
  seen.add(node);

  const expression = node as Node;
  if (expression.type !== "LogicalExpression") {
    return members;
  }

  collectStateFlagMembers(expression.left, members, seen);
  collectStateFlagMembers(expression.right, members, seen);
  return members;
}

function isImplicitStateMachineObject(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "LogicalExpression") {
    return false;
  }

  return Array.from(collectStateFlagMembers(node).values()).some((properties) => properties.size >= 2);
}

function isAdhocEffectFail(node: unknown): boolean {
  return isEffectMemberCallNamed(node, "fail") && isStringLiteral(firstArgument(node));
}

function isThrowNewStringError(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "ThrowStatement") {
    return false;
  }

  const argument = (node as Node).argument;
  return (
    typeof argument === "object" &&
    argument !== null &&
    (argument as Node).type === "NewExpression" &&
    isIdentifier((argument as Node).callee, "Error") &&
    Array.isArray((argument as Node).arguments) &&
    isStringLiteral(((argument as Node).arguments as unknown[])[0])
  );
}

function hasRawDomainIdParameter(node: unknown): boolean {
  if (typeof node !== "object" || node === null || !Array.isArray((node as Node).params)) {
    return false;
  }

  return ((node as Node).params as unknown[]).some((param) => (
    isIdentifier(param) &&
    /(?:^id$|Id$|ID$)/.test(param.name) &&
    isStringOrNumberTypeAnnotation((param as Node).typeAnnotation)
  ));
}

function isContextEncodedDomainFunction(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "FunctionDeclaration") {
    return false;
  }

  const id = (node as Node).id;
  return (
    isIdentifier(id) &&
    /(?:Admin|Public|Internal|External|Private|Backoffice|Panel)/.test(id.name) &&
    hasRawDomainIdParameter(node)
  );
}

function isStringLiteralComparison(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "BinaryExpression") {
    return false;
  }

  const binary = node as Node;
  return (
    ["==", "===", "!=", "!=="].includes(String(binary.operator)) &&
    (isStringLiteral(binary.left) || isStringLiteral(binary.right)) &&
    !isTypeofBooleanCheck(binary)
  );
}

function report(context: OxlintContext, node: unknown, message: string) {
  context.report({ message, node: node as ESTree.Node });
}

function isNullLiteral(node: unknown): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const literal = node as Node;
  return (
    literal.type === "NullLiteral" ||
    (literal.type === "Literal" && literal.value === null)
  );
}

function getImportSource(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const source = (node as Node).source;
  if (typeof source === "string") {
    return source;
  }

  if (typeof source === "object" && source !== null) {
    const value = (source as Node).value;
    if (typeof value === "string") {
      return value;
    }
  }

  return undefined;
}

function isEffectEcosystemImport(source: string): boolean {
  return (
    source === "effect" ||
    source.startsWith("effect/") ||
    source === "@effect-atom/atom-react"
  );
}

function createEffectGatedStatementRule(
  visitorName: "IfStatement" | "SwitchStatement" | "ConditionalExpression",
  message: string,
) {
  return defineRule({
    create(context: OxlintContext) {
      let hasEffectEcosystemImport = false;

      return {
        ImportDeclaration(node: any) {
          const source = getImportSource(node);
          if (source && isEffectEcosystemImport(source)) {
            hasEffectEcosystemImport = true;
          }
        },
        [visitorName](node: any) {
          if (hasEffectEcosystemImport) {
            report(context, node, message);
          }
        },
      };
    },
  });
}

const reactStateHooks = new Set([
  "useState",
  "useReducer",
  "useContext",
  "useCallback",
  "useEffect",
  "useSyncExternalStore",
]);

const noReactState = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        const callee = node.callee;
        const hookName = isIdentifier(callee)
          ? callee.name
          : typeof callee === "object" &&
              callee !== null &&
              (callee as Node).type === "MemberExpression" &&
              isIdentifier((callee as Node).property)
            ? ((callee as Node).property as { name: string }).name
            : undefined;

        if (hookName && reactStateHooks.has(hookName)) {
          report(
            context,
            callee,
            "Rule: avoid React state hooks. Why: they bypass the atom runtime and break reactive flow. Fix: use @effect-atom/atom-react instead.",
          );
        }
      },
    };
  },
});

const noIfStatement = createEffectGatedStatementRule(
  "IfStatement",
  "Rule: avoid imperative if branching. Why: Effect code should keep branching explicit and typed. Fix: use Match.value/Match.type or Effect combinators instead.",
);

const noSwitchStatement = createEffectGatedStatementRule(
  "SwitchStatement",
  "Rule: avoid imperative switch branching. Why: Effect code should keep branching explicit and typed. Fix: use Match.value/Match.type instead.",
);

const noTernary = createEffectGatedStatementRule(
  "ConditionalExpression",
  "Rule: avoid ternary expressions. Why: they hide control flow inside expressions. Fix: use Option.match/Either.match/Match.value or data combinators, then run one Effect pipeline.",
);

const noReturnNull = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ReturnStatement(node: any) {
        if (hasEffectEcosystemImport && isNullLiteral(node.argument)) {
          report(
            context,
            node,
            "Rule: avoid returning null. Why: null is a sentinel that forces defensive guards. Fix: use Option.none for absence or Effect.fail for errors.",
          );
        }
      },
    };
  },
});

const noOptionAs = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isMemberExpression(node.callee, "Option", "as")) {
          report(
            context,
            node,
            "Rule: avoid Option.as. Why: it hides selection and encourages placeholder flows. Fix: use Option.map or Option.match and return the value explicitly.",
          );
        }
      },
    };
  },
});

const noEffectNever = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      MemberExpression(node: any) {
        if (hasEffectEcosystemImport && isMemberExpression(node, "Effect", "never")) {
          report(
            context,
            node,
            "Rule: avoid Effect.never. Why: it hides lifecycle and leaks resources. Fix: use Stream or explicit acquire/release lifecycles with clear teardown.",
          );
        }
      },
    };
  },
});

const noArrowLadder = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport || !isArrowIifeCall(node)) {
          return;
        }

        const nested = findArrowIifeCall(node.callee.body);
        if (nested) {
          report(
            context,
            nested,
            "Rule: avoid nested IIFEs. Why: they hide sequencing and push wrapper hacks. Fix: bind a named context with const and keep one flat pipeline with a single Match/Option decision.",
          );
        }
      },
    };
  },
});

const noBranchInObject = defineRule({
  create(context: OxlintContext) {
    return {
      ObjectExpression(node: any) {
        if (objectPropertyValues(node).some((value) => containsObjectBranchCall(value))) {
          report(
            context,
            node,
            "Rule: avoid Match/Option/Either inside object literals. Why: it hides the decision and invites workaround scaffolding. Fix: compute the value first (context), then build the object from named values with one flat decision.",
          );
        }
      },
    };
  },
});

const noIifeWrapper = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isInlineFunctionIifeCall(node)) {
          report(
            context,
            node,
            "Rule: avoid immediate invocation of inline functions. Why: it hides decisions and sequencing. Fix: bind a named context with const and keep one Match/Option decision in a flat pipeline.",
          );
        }
      },
    };
  },
});

const noReturnInArrow = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        for (const returnNode of directArrowCallbackReturns(node)) {
          report(
            context,
            returnNode,
            "Rule: avoid block-bodied arrow callbacks with returns. Why: they hide local control flow. Fix: use expression-only callbacks and move the logic into a single pipeline (pipe/Match/Option/A.map).",
          );
        }
      },
    };
  },
});

const noReturnInCallback = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        for (const returnNode of directFunctionCallbackReturns(node)) {
          report(
            context,
            returnNode,
            "Rule: avoid returns inside inline callbacks. Why: they hide control flow. Prefer expression-only callbacks, but leaf-level Effect branches with local bindings may use returns when needed.",
          );
        }
      },
    };
  },
});

const noEffectFnGenerator = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isEffectGeneratorCall(node, "fn")) {
          report(
            context,
            node,
            "Rule: avoid Effect.fn generator wrappers. Why: they hide sequencing and dodge ladder rules. Fix: keep a single flat pipeline or use one Effect.gen.",
          );
        }
      },
    };
  },
});

const noEffectSyncConsole = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (
          hasEffectEcosystemImport &&
          isEffectMemberCallNamed(node, "sync") &&
          containsConsoleCall(firstArgument(node))
        ) {
          report(
            context,
            node,
            "Rule: avoid console.* inside Effect.sync. Why: it hides side effects. Fix: replace with Effect.log* or remove the console call.",
          );
        }
      },
    };
  },
});

const noNestedEffectGen = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const generator = getEffectGeneratorArgument(node, "gen");
        if (!hasEffectEcosystemImport || !generator) {
          return;
        }

        const nested = findEffectGenCall(generator.body);
        if (nested) {
          report(
            context,
            nested,
            "Rule: avoid nested Effect.gen. Why: nested generators hide sequencing. Fix: flatten to a single Effect.gen per method or a single flat pipeline.",
          );
        }
      },
    };
  },
});

const noYieldWithoutStarInEffectGen = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const yieldNode = findYieldWithoutStarInEffectGen(node);
        if (yieldNode) {
          report(
            context,
            yieldNode,
            "Rule: use yield* inside Effect.gen. Why: plain yield returns an Effect value without delegating to the Effect interpreter. Fix: replace `yield Effect.x` with `yield* Effect.x`.",
          );
        }
      },
    };
  },
});

const noPipedYieldInGen = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const pipedYield = repeatedPipedYieldInEffectGen(node);
        if (pipedYield) {
          report(
            context,
            pipedYield,
            "Rule: avoid repeated piped yields inside Effect.gen. Why: decorated effects hidden inside generator steps obscure the workflow. Fix: extract decorated effects first, then yield the named workflow steps.",
          );
        }
      },
    };
  },
});

const noGenForMapping = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const mappingGen = genForMappingNode(node);
        if (mappingGen) {
          report(
            context,
            mappingGen,
            "Rule: avoid Effect.gen for simple mapping. Why: tiny generators hide pure transformations behind workflow syntax. Fix: map the yielded effect with Effect.map or a named pure transformation.",
          );
        }
      },
    };
  },
});

const preferGenForWorkflow = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const workflow = workflowSequencingPipeline(node);
        if (workflow) {
          report(
            context,
            workflow,
            "Rule: prefer Effect.gen for workflow sequencing. Why: long flatMap/andThen/tap pipelines read like imperative workflow. Fix: move the sequential story into one Effect.gen and keep pipe for behavior decoration.",
          );
        }
      },
    };
  },
});

const noLargeAnonymousFlow = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isLargeFlowCall(node)) {
          report(
            context,
            node,
            "Rule: avoid large anonymous flow expressions. Why: long pure transformation chains need a domain name. Fix: extract a named flow or split the transformation into named pure steps.",
          );
        }
      },
    };
  },
});

const noEffectInFlow = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const effectfulArgument = effectfulFlowArgument(node);
        if (effectfulArgument) {
          report(
            context,
            effectfulArgument,
            "Rule: avoid Effect work inside flow. Why: flow should stay a reusable pure transformation boundary. Fix: keep Effect sequencing, logging, retries, and dependency access in Effect pipelines.",
          );
        }
      },
    };
  },
});

const preferNamedFlow = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const inlineFlow = inlineNonTrivialFlowArgument(node);
        if (inlineFlow) {
          report(
            context,
            inlineFlow,
            "Rule: prefer named flow transformations. Why: non-trivial pure transformations passed inline are hard to reuse and review. Fix: extract the flow to a named const.",
          );
        }
      },
    };
  },
});

const preferPipeForBehavior = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const behaviorCall = staticBehaviorCall(node);
        if (behaviorCall) {
          report(
            context,
            behaviorCall,
            "Rule: prefer .pipe() for behavior decoration. Why: retry, timeout, spans, logging, recovery, DI, and value transforms decorate an existing effect. Fix: write `program.pipe(Effect.retry(policy))` instead of `Effect.retry(program, policy)`.",
          );
        }
      },
    };
  },
});

const preferDecoratedEffectBeforeGen = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const decoratedYield = repeatedDecoratedYieldInEffectGen(node);
        if (decoratedYield) {
          report(
            context,
            decoratedYield,
            "Rule: extract decorated effects before Effect.gen. Why: repeated retry/timeout/span/logging decorators inside generator yields bury behavior policy in workflow steps. Fix: name the decorated effects first, then yield the workflow story.",
          );
        }
      },
    };
  },
});

const noWorkflowInBehaviorPipe = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const workflowPipe = workflowInBehaviorPipe(node);
        if (workflowPipe) {
          report(
            context,
            workflowPipe,
            "Rule: avoid workflow sequencing inside behavior pipes. Why: behavior pipes should answer how an effect behaves, not hide the workflow story. Fix: move multi-step sequencing into Effect.gen and keep retry/timeout/spans/logging as decorators around named effects.",
          );
        }
      },
    };
  },
});

const noMixedPillarFunction = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    function check(node: any) {
      const mixedFunction = mixedPillarFunctionNode(node);
      if (hasEffectEcosystemImport && mixedFunction) {
        report(
          context,
          mixedFunction,
          "Rule: avoid mixing Effect style pillars in one function. Why: workflow, pure transformation, behavior decoration, and Layer wiring each need a clear boundary. Fix: extract named concepts for each pillar and compose them at the call site.",
        );
      }
    }

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      FunctionDeclaration: check,
      FunctionExpression: check,
      ArrowFunctionExpression: check,
    };
  },
});

const noCleverEffectExpression = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const cleverExpression = cleverEffectExpressionNode(node);
        if (hasEffectEcosystemImport && cleverExpression) {
          report(
            context,
            cleverExpression,
            "Rule: avoid clever Effect expressions. Why: deeply nested expressions that combine style pillars hide the domain story. Fix: extract named workflow, pure transformation, and behavior steps.",
          );
        }
      },
    };
  },
});

const preferExtractedConcept = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const anonymousConcept = oversizedAnonymousConceptNode(node);
        if (hasEffectEcosystemImport && anonymousConcept) {
          report(
            context,
            anonymousConcept,
            "Rule: prefer extracting named concepts from oversized anonymous callbacks. Why: multi-step inline callbacks hide domain intent. Fix: name the transformation, policy, or workflow step before passing it into Effect.",
          );
        }
      },
    };
  },
});

const preferEffectService = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isContextTagCall(node)) {
          report(
            context,
            node,
            "Rule: prefer Effect.Service. Fix: replace Context.Tag service definitions.",
          );
        }
      },
    };
  },
});

const noLayerProvideInServiceDefinition = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ClassDeclaration(node: any) {
        const options = effectServiceClassOptions(node);
        if (hasEffectEcosystemImport && options && containsLayerProvideCall(options)) {
          report(
            context,
            options,
            "Rule: do not call Layer.provide inside Effect.Service. Fix: move layer wiring to app/test boundaries.",
          );
        }
      },
    };
  },
});

const requireServiceAccessors = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ClassDeclaration(node: any) {
        const options = effectServiceClassOptions(node);
        if (hasEffectEcosystemImport && options && !hasAccessorsTrue(options)) {
          report(
            context,
            options,
            "Rule: set accessors: true. Fix: add it to Effect.Service options.",
          );
        }
      },
    };
  },
});

const requireServiceDependencies = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ClassDeclaration(node: any) {
        const options = effectServiceClassOptions(node);
        const dependency = options ? serviceDependencyWithoutDeclaration(options) : undefined;
        if (hasEffectEcosystemImport && dependency) {
          report(
            context,
            dependency,
            "Rule: declare service dependencies.",
          );
        }
      },
    };
  },
});

const noNamespaceEffectImport = defineRule({
  create(context: OxlintContext) {
    return {
      ImportDeclaration(node: any) {
        const namespaceImport = namespaceEffectImport(node);
        if (namespaceImport) {
          report(
            context,
            namespaceImport,
            "Rule: avoid namespace imports from Effect packages.",
          );
        }
      },
    };
  },
});

const noManualServiceObjectExport = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ExportNamedDeclaration(node: any) {
        const target = hasEffectEcosystemImport ? manualServiceObjectExport(node) : undefined;
        if (target) {
          report(
            context,
            target,
            "Rule: avoid exported manual service objects.",
          );
        }
      },
    };
  },
});

const preferLayerPipe = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const tower = hasEffectEcosystemImport ? layerProvideCallTower(node) : undefined;
        if (tower) {
          report(
            context,
            tower,
            "Rule: prefer Layer.pipe for nested layer provisioning.",
          );
        }
      },
    };
  },
});

const noInlineLayerProvideInProgram = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const provide = hasEffectEcosystemImport ? inlineLayerProvideInProgram(node) : undefined;
        if (provide) {
          report(
            context,
            provide,
            "Rule: avoid inline layer provisioning inside programs.",
          );
        }
      },
    };
  },
});

const preferLayerMergeallForInfrastructure = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const chain = hasEffectEcosystemImport ? layerMergeChain(node) : undefined;
        if (chain) {
          report(
            context,
            chain,
            "Rule: prefer Layer.mergeAll for infrastructure layer groups.",
          );
        }
      },
    };
  },
});

const noServiceLayerScatter = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    let scatteredLayerCount = 0;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      VariableDeclaration(node: any) {
        const target = hasEffectEcosystemImport ? scatteredLayerProvideDeclaration(node) : undefined;
        if (!target) {
          return;
        }

        scatteredLayerCount += 1;
        if (scatteredLayerCount >= 3) {
          report(
            context,
            target,
            "Rule: group service layers by concern.",
          );
        }
      },
    };
  },
});

const noLayerMergeInRequestHandler = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      FunctionDeclaration(node: any) {
        const handler = layerCompositionInRequestHandler(node);
        if (hasEffectEcosystemImport && handler) {
          report(
            context,
            handler,
            "Rule: avoid Layer composition inside request handlers.",
          );
        }
      },
    };
  },
});

const noServiceMethodReturningPromise = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ClassDeclaration(node: any) {
        const options = effectServiceClassOptions(node);
        const method = options ? promiseReturningServiceMethod(options) : undefined;
        if (hasEffectEcosystemImport && method) {
          report(
            context,
            method,
            "Rule: return Effect from service methods.",
          );
        }
      },
    };
  },
});

const noMatchVoidBranch = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isVoidMatchBranch(node)) {
          report(
            context,
            node,
            "Rule: avoid void Match branches. Why: they hide guard-style control flow. Fix: remove the no-op branch or select a value and run one Effect pipeline outside the Match.",
          );
        }
      },
    };
  },
});

const noMatchEffectBranch = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (isMatchValuePipeCall(node) && containsSequencingMatchBranch(node.arguments)) {
          report(
            context,
            node,
            "Rule: avoid multi-step sequencing inside Match branches. Why: it hides control flow. Fix: select a value in Match, then run one Effect pipeline outside. Avoid data-encoded conditionals (Option.toArray/forEach) that only rewrap the branch.",
          );
        }

        if (isOptionMatchCall(node) && isSequencingBranchBody(node.arguments)) {
          report(
            context,
            node,
            "Rule: avoid multi-step sequencing inside Option.match branches. Why: it hides control flow. Prefer selecting a value in Option.match, then run one Effect pipeline outside. Leaf-level flows with local bindings may keep Option.match but should stay linear.",
          );
        }
      },
    };
  },
});

const warnEffectSyncWrapper = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const callback = firstArgument(node);
        const body = arrowCallbackBody(callback);
        if (
          hasEffectEcosystemImport &&
          isEffectMemberCallNamed(node, "sync") &&
          isExpressionBodiedArrowCall(callback) &&
          !isConsoleCall(body)
        ) {
          report(
            context,
            node,
            "Rule: avoid Effect.sync around side effects. Why: it hides intent. Fix: use Effect.log* or an explicit pipeline step for the side effect.",
          );
        }
      },
    };
  },
});

const noEffectSideEffectWrapper = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (isEffectMemberCallNamed(node, "as") && containsWrapperSideEffect(firstArgument(node))) {
          report(
            context,
            node,
            "Rule: avoid Effect.as for side effects. Why: it hides side effects and turns them into placeholders. Fix: use explicit pipeline steps that return real values with Effect.flatMap, Effect.andThen, or Effect.tap.",
          );
        }

        if (
          isEffectMemberCallNamed(node, "zipRight") &&
          containsWrapperSideEffect(firstArgument(node))
        ) {
          report(
            context,
            node,
            "Rule: avoid Effect.zipRight for side effects. Why: it hides side effects and discards values. Fix: use explicit pipeline steps that return real values with Effect.flatMap, Effect.andThen, or Effect.tap.",
          );
        }
      },
    };
  },
});

const noEffectAllStepSequencing = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (
          isEffectMemberCallNamed(node, "all") &&
          containsAllStepSideEffect(node.arguments[0]) &&
          hasConcurrencyOne(node.arguments[1])
        ) {
          report(
            context,
            node,
            "Rule: avoid Effect.all for sequential side-effect steps. Why: it hides imperative sequencing in an array. Fix: use one explicit linear pipeline with Effect.andThen/flatMap and reserve Effect.all for real value aggregation.",
          );
        }

        if (
          isEffectAllAsVoidPipe(node) &&
          containsAllStepSideEffect(firstArgument((node.callee as Node).object as Node & {
            arguments: unknown[];
          }))
        ) {
          report(
            context,
            node,
            "Rule: avoid Effect.all for sequential side-effect steps. Why: it hides imperative sequencing in an array. Fix: use one explicit linear pipeline with Effect.andThen/flatMap and reserve Effect.all for real value aggregation.",
          );
        }
      },
    };
  },
});

const noAsyncEffectCombinatorCallback = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const callback = findAsyncEffectCombinatorCallback(node);
        if (callback) {
          report(
            context,
            callback,
            "Rule: avoid async callbacks in Effect combinators. Why: async callbacks return Promises and bypass Effect failure, interruption, and tracing semantics. Fix: return an Effect and compose with Effect.flatMap/fromPromise at the boundary.",
          );
        }
      },
    };
  },
});

const noThrowInEffectLogic = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const throwNode = findThrowInEffectLogic(node);
        if (throwNode) {
          report(
            context,
            throwNode,
            "Rule: avoid throw inside Effect logic. Why: thrown exceptions bypass typed Effect error channels and interruption semantics. Fix: return Effect.fail with a structured tagged error.",
          );
        }
      },
    };
  },
});

const noOrDieOutsideBoundary = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const target = findEffectOrDieOutsideBoundary(node);
        if (target) {
          report(
            context,
            target,
            "Rule: avoid Effect.orDie outside runtime boundaries. Why: converting typed failures into defects hides recoverable domain errors. Fix: keep typed errors in domain logic and reserve orDie/orDieWith for explicit application boundaries.",
          );
        }
      },
    };
  },
});

const noSwallowedCatchAll = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const handlerBody = getSwallowedCatchAllHandler(node);
        if (handlerBody) {
          report(
            context,
            handlerBody,
            "Rule: avoid swallowing errors in catchAll. Why: succeed/void recovery can hide failures without telemetry or typed recovery. Fix: log, re-fail with a structured error, or recover through an explicit domain branch.",
          );
        }
      },
    };
  },
});

const noEffectIgnore = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const target = findEffectIgnore(node);
        if (target) {
          report(
            context,
            target,
            "Rule: avoid Effect.ignore. Why: ignoring failable effects hides failure ownership. Fix: handle the error with typed recovery, log and re-fail, or isolate the ignore at an explicit boundary with a documented reason.",
          );
        }
      },
    };
  },
});

const noTryCatchInEffectLogic = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const tryNode = findTryCatchInEffectLogic(node);
        if (tryNode) {
          report(
            context,
            tryNode,
            "Rule: avoid try/catch inside Effect logic. Why: it bypasses typed error channels and can miss interruption/cause semantics. Fix: use Effect.try, Effect.catchAll, Effect.catchTag, or typed error combinators.",
          );
        }
      },
    };
  },
});

const noPromiseApiInEffectLogic = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const promiseNode = findPromiseApiInEffectLogic(node);
        if (promiseNode) {
          report(
            context,
            promiseNode,
            "Rule: avoid Promise APIs inside Effect logic. Why: Promise APIs bypass Effect scheduling, typed errors, cancellation, and tracing. Fix: use Effect.all, Effect.tryPromise, or move Promise interop to a boundary adapter.",
          );
        }
      },
    };
  },
});

const noTryCatch = defineRule({
  create(context: OxlintContext) {
    return {
      TryStatement(node: any) {
        report(
          context,
          node,
          "Rule: avoid try/catch in Effect files. Why: it bypasses Effect error channels and reintroduces imperative control flow. Fix: model failures in Effect and handle them with typed errors and Effect combinators.",
        );
      },
    };
  },
});

const noEffectWrapperAlias = defineRule({
  create(context: OxlintContext) {
    return {
      VariableDeclaration(node: any) {
        for (const declaration of node.declarations ?? []) {
          if (isEffectWrapperAliasExpression(declaration.init)) {
            report(
              context,
              node,
              "Rule: avoid Effect wrapper aliases (`const x = ...Effect...`). Why: it creates wrapper choreography and bloats consts. Fix: inline the pipeline at the call site or define a real domain function that returns data, not an Effect wrapper.",
            );
          }
        }
      },
      FunctionDeclaration(node: any) {
        if (hasEffectWrapperAliasReturn(node.body)) {
          report(
            context,
            node,
            "Rule: avoid Effect wrapper aliases (`function x(...) { return Effect... }`). Why: it creates wrapper choreography and bloats consts. Fix: inline the pipeline at the call site or define a real domain function that returns data, not an Effect wrapper.",
          );
        }
      },
    };
  },
});

const noManualEffectChannels = defineRule({
  create(context: OxlintContext) {
    return {
      TSTypeReference(node: any) {
        if (
          isQualifiedTypeReference(node, "Effect", "Effect") ||
          isQualifiedTypeReference(node, "Layer", "Layer")
        ) {
          report(
            context,
            node,
            "Rule: avoid manual Effect channel tuples (`Effect.Effect<...>` / `Layer.Layer<...>`). Why: channels compose through the Effect pipeline and services; hand-written tuples desync from the real flow. Fix: drop the generic and let the return type infer from the Effect/Layer you return, or expose a service method that returns the effect directly.",
          );
        }
      },
    };
  },
});

const noWrapgraphqlCatchall = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const catchAll = hasEffectEcosystemImport ? getWrapGraphqlCatchAll(node) : undefined;
        if (catchAll) {
          report(
            context,
            catchAll,
            "Rule: avoid catchAll after wrapGraphqlCall/applyResponse. Why: the envelope already surfaces structured errors. Fix: handle errors in the response mapping instead of catchAll.",
          );
        }
      },
    };
  },
});

const noRenderSideEffects = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ExpressionStatement(node: any) {
        if (
          hasEffectEcosystemImport &&
          isMatchValuePipeCall(node.expression) &&
          containsMatchBranchCall((node.expression as Node).arguments)
        ) {
          report(
            context,
            node.expression,
            "Rule: avoid Match.value(...).pipe(...) as a statement. Why: it runs side effects during render. Fix: move the side effect into an Effect runtime action or event handler, and keep Match as a pure expression.",
          );
        }
      },
    };
  },
});

const noAtomRegistryEffectSync = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const atomOperation = hasEffectEcosystemImport
          ? findAtomOperationInsideEffectSync(node)
          : undefined;
        if (atomOperation) {
          report(
            context,
            atomOperation,
            "Rule: do not wrap Atom/atomRegistry ops in Effect.sync. Why: it hides side effects and breaks atom flow. Fix: call Atom.get/Atom.set/Atom.update/Atom.modify/Atom.refresh directly.",
          );
        }
      },
    };
  },
});

const noFamilyCollectionRead = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (!isMemberCall(node, "Atom", "family")) {
          return;
        }

        const collectionAtom = findFamilyCollectionRead(node.arguments);
        if (collectionAtom) {
          report(
            context,
            collectionAtom,
            "Keyed projection atom reads collection atom. Why: Atom.family should project from keyed/source atoms, not broad collection state. Fix: pass the keyed atom into the family or create a keyed source atom before reading.",
          );
        }
      },
    };
  },
});

const noInlineRuntimeProvide = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const provide = hasEffectEcosystemImport ? findInlineRuntimeProvide(node) : undefined;
        if (provide) {
          report(
            context,
            provide,
            "Rule: do not inline runtime provisioning inside local helper Effect code. Why: `yield* SomeRuntime.pipe(Effect.provide(SomeRuntimeLive))` and equivalent inline provide chains hide dependency assembly instead of owning it at an Effect.Service boundary or one exported Effect boundary. Fix: declare the live dependency on the owning service or provide it once at the exported boundary, then `yield*` the runtime or service directly inside the body.",
          );
        }
      },
    };
  },
});

const noNakedObjectStateUpdate = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (isNakedObjectStateUpdate(node)) {
          report(
            context,
            node,
            "Rule: avoid naked JS state patching/rebuild and raw JSON shortcuts in Effect transitions. Why: spread/Object.assign/fromEntries and inline JSON parse/stringify hide state intent and bypass explicit model contracts. Fix: use `effect/Record` combinators (`Record.set` / `Record.modify` / `Record.remove`) inside `Struct.evolve`, rebuild with schema constructors (`Schema.make` or field `.make`), and keep serialization at boundaries with schema encode/decode flows. Use `linting.md` guidance when available.",
          );
        }
      },
    };
  },
});

const noEffectSucceedVariable = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (
          hasEffectEcosystemImport &&
          isEffectMemberCallNamed(node, "succeed") &&
          isEffectSucceedVariableArgument(firstArgument(node))
        ) {
          report(
            context,
            node,
            "Rule: avoid Effect.succeed(variable) as a branch placeholder. Why: it hides a decision and turns data into pseudo-control flow. Fix: select a plain value (Option/Match) and then run one Effect pipeline after the decision; if you already read the state, return it as a value. Avoid Option.toArray/forEach hacks that just re-encode the branch.",
          );
        }
      },
    };
  },
});

const noEffectTypeAlias = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      TSTypeAliasDeclaration(node: any) {
        if (
          hasEffectEcosystemImport &&
          containsQualifiedTypeReference(node.typeAnnotation, "Effect", "Effect")
        ) {
          report(
            context,
            node.typeAnnotation,
            "Rule: avoid Effect.Effect type aliases. Why: they hide the service surface and make types opaque. Fix: keep Effect types on service methods or inline at the call site.",
          );
        }
      },
    };
  },
});

const noPublicGenericEffectError = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ExportNamedDeclaration(node: any) {
        const target = hasEffectEcosystemImport ? exportedGenericEffectErrorTarget(node) : undefined;
        if (target) {
          report(
            context,
            target,
            "Rule: avoid public Effect APIs with generic Error. Why: public services need recoverable, typed error contracts. Fix: expose tagged domain errors instead of Error.",
          );
        }
      },
      ExportDefaultDeclaration(node: any) {
        const target = hasEffectEcosystemImport ? exportedGenericEffectErrorTarget(node) : undefined;
        if (target) {
          report(
            context,
            target,
            "Rule: avoid public Effect APIs with generic Error. Why: public services need recoverable, typed error contracts. Fix: expose tagged domain errors instead of Error.",
          );
        }
      },
    };
  },
});

const noModelOverlayCast = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      VariableDeclaration(node: any) {
        if (hasEffectEcosystemImport && isVariableAsAssertion(node)) {
          report(
            context,
            node,
            "Rule: avoid `as` assertions on decoded model flow. Why: assertions hide schema drift and allow untyped overlays. Fix: decode with the correct schema type and read fields directly.",
          );
        }
      },
    };
  },
});

const noUnknownBooleanCoercionHelper = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    let hasMatchOrElseNull = false;
    const booleanChecks: unknown[] = [];
    const reported = new WeakSet<object>();

    const reportBooleanCheck = (node: unknown) => {
      if (typeof node !== "object" || node === null || reported.has(node)) {
        return;
      }

      reported.add(node);
      report(
        context,
        node,
        "Rule: avoid local unknown-to-boolean coercion helpers in services. Why: runtime coercion belongs at schema boundary, not in service flow. Fix: decode boolean optionality in schema and read typed booleans in the Effect pipeline.",
      );
    };

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      BinaryExpression(node: any) {
        if (!hasEffectEcosystemImport || !isTypeofBooleanCheck(node)) {
          return;
        }

        if (hasMatchOrElseNull) {
          reportBooleanCheck(node);
        } else {
          booleanChecks.push(node);
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport || !isMatchOrElseNullCall(node)) {
          return;
        }

        hasMatchOrElseNull = true;
        for (const check of booleanChecks) {
          reportBooleanCheck(check);
        }
      },
    };
  },
});

const noFromnullableNullishCoalesce = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isOptionFromNullableNullishCoalesce(node)) {
          report(
            context,
            node,
            "Rule: avoid nullish re-wrap inside Option.fromNullable. Why: `x ?? null` and `x ?? undefined` add noise and hide source shape. Fix: pass the source directly to Option.fromNullable.",
          );
        }
      },
    };
  },
});

const noOptionBooleanNormalization = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isOptionBooleanNormalization(node)) {
          report(
            context,
            node,
            "Rule: avoid repeated Option boolean normalization (`onSome: value === true, onNone: false`). Why: it scatters coercion rules across services. Fix: normalize once at schema boundary and read booleans directly.",
          );
        }
      },
    };
  },
});

const noStringSentinelReturn = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (isEffectMemberCallNamed(node, "succeed") && isStringLiteral(firstArgument(node))) {
          report(
            context,
            node,
            "Rule: avoid returning string tokens. Why: it encodes control flow and forces defensive branching. Fix: return domain values (Option/Either/tagged unions) or real Effect results instead.",
          );
        }
      },
    };
  },
});

const noStringSentinelConst = defineRule({
  create(context: OxlintContext) {
    return {
      VariableDeclaration(node: any) {
        if (isStringSentinelConst(node)) {
          report(
            context,
            node,
            "Rule: avoid string status constants. Why: they encode control flow and force defensive branching. Fix: use tagged unions, Option/Either, or meaningful domain values instead of string tokens.",
          );
        }
      },
    };
  },
});

const noRawDomainIdAlias = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      TSTypeAliasDeclaration(node: any) {
        if (hasEffectEcosystemImport && isRawDomainIdAlias(node)) {
          report(
            context,
            node,
            "Rule: avoid raw primitive domain ID aliases. Why: `type UserId = string` does not protect boundaries from swapped IDs. Fix: use Schema branded IDs or a domain constructor that validates and brands the value.",
          );
        }
      },
    };
  },
});

const noBooleanDomainFlag = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    const checkFunctionParameters = (node: unknown) => {
      if (!hasEffectEcosystemImport) {
        return;
      }

      for (const param of functionBooleanDomainFlagParameters(node)) {
        report(
          context,
          param,
          "Rule: avoid boolean behavior flags in domain operations. Why: flags like `shouldNotify` hide use cases and create implicit branching. Fix: model intent with a command/tagged union or split the operation into explicit functions.",
        );
      }
    };

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      FunctionDeclaration: checkFunctionParameters,
      FunctionExpression: checkFunctionParameters,
      ArrowFunctionExpression: checkFunctionParameters,
    };
  },
});

const noMagicDomainString = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      BinaryExpression(node: any) {
        if (hasEffectEcosystemImport && isStringLiteralComparison(node)) {
          report(
            context,
            node,
            "Rule: avoid magic domain string comparisons. Why: comparing domain state to raw strings scatters status vocabulary and misses exhaustiveness. Fix: use a tagged union, Schema literal union, or Match over a named domain status.",
          );
        }
      },
    };
  },
});

const noRawDomainPrimitiveParams = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    const checkFunction = (node: unknown) => {
      if (hasEffectEcosystemImport && hasPrimitiveHeavyDomainParameters(node)) {
        report(
          context,
          node,
          "Rule: avoid primitive-heavy domain parameters. Why: clusters of raw string/number domain values are easy to swap and have no invariant boundary. Fix: introduce branded types or a command/schema object with named validated fields.",
        );
      }
    };

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
});

const noRawTimeDomainField = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    const checkTypeMembers = (node: unknown) => {
      if (!hasEffectEcosystemImport) {
        return;
      }

      for (const field of rawTimeDomainFields(node)) {
        report(
          context,
          field,
          "Rule: avoid raw time fields in domain models. Why: number and Date fields hide units, clock ownership, and duration semantics. Fix: model durations with Effect Duration and keep raw timestamps at decode/encode boundaries.",
        );
      }
    };

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      TSInterfaceDeclaration: checkTypeMembers,
      TSTypeLiteral: checkTypeMembers,
    };
  },
});

const noOverloadedOptionsObject = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    const checkFunctionParameters = (node: unknown) => {
      if (!hasEffectEcosystemImport) {
        return;
      }

      for (const param of overloadedOptionsParameters(node)) {
        report(
          context,
          param,
          "Rule: avoid overloaded options objects. Why: `opts`, `options`, and `config` typed as any/object hide required fields and validation. Fix: accept unknown at the boundary and decode with Schema, or use a named typed command/config model.",
        );
      }
    };

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      FunctionDeclaration: checkFunctionParameters,
      FunctionExpression: checkFunctionParameters,
      ArrowFunctionExpression: checkFunctionParameters,
    };
  },
});

const noDomainLogicInConditional = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      LogicalExpression(node: any) {
        if (hasEffectEcosystemImport && isDomainLogicConditional(node)) {
          report(
            context,
            node,
            "Rule: avoid embedding domain logic in conditionals. Why: multi-clause business rules become hard to test, reuse, and audit. Fix: extract a named domain predicate or validation Effect and call that from the branch.",
          );
        }
      },
    };
  },
});

const noImplicitStateMachineObject = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      LogicalExpression(node: any) {
        if (hasEffectEcosystemImport && isImplicitStateMachineObject(node)) {
          report(
            context,
            node,
            "Rule: avoid implicit state machines made from boolean flags. Why: multiple flags on one domain object allow impossible states. Fix: model the lifecycle as a tagged union or Data.TaggedEnum.",
          );
        }
      },
    };
  },
});

const noAdhocDomainError = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isAdhocEffectFail(node)) {
          report(
            context,
            node,
            "Rule: avoid ad hoc domain errors. Why: string failures hide recovery semantics and observability. Fix: use Data.TaggedError or a structured domain error union.",
          );
        }
      },
      ThrowStatement(node: any) {
        if (hasEffectEcosystemImport && isThrowNewStringError(node)) {
          report(
            context,
            node,
            "Rule: avoid ad hoc domain errors. Why: thrown string Error values bypass typed Effect error channels. Fix: return Effect.fail with a structured tagged domain error.",
          );
        }
      },
    };
  },
});

const noDomainMeaningByFolderOnly = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      FunctionDeclaration(node: any) {
        if (hasEffectEcosystemImport && isContextEncodedDomainFunction(node)) {
          report(
            context,
            node,
            "Rule: avoid domain meaning by folder or context naming alone. Why: admin/public/internal meaning should be represented in types or services, not inferred from helper names. Fix: encode context with branded IDs, commands, policies, or service boundaries.",
          );
        }
      },
    };
  },
});

const noEffectAs = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (isMemberExpression(node.callee, "Effect", "as")) {
          report(
            context,
            node.callee,
            "Rule: avoid Effect.as wrappers. Why: they can hide meaningful sequencing or value flow. Fix: return the intended value directly or use explicit Effect.map/andThen.",
          );
        }
      },
    };
  },
});

const noEffectDo = defineRule({
  create(context: OxlintContext) {
    return {
      MemberExpression(node: any) {
        if (isMemberExpression(node, "Effect", "Do")) {
          report(
            context,
            node,
            "Rule: avoid Effect.Do. Why: it hides sequencing behind builder state. Fix: use Effect.gen or a direct pipe.",
          );
        }
      },
    };
  },
});

function createForbiddenMemberCallRule(objectName: string, propertyName: string, message: string) {
  return defineRule({
    create(context: OxlintContext) {
      return {
        CallExpression(node: any) {
          if (isMemberExpression(node.callee, objectName, propertyName)) {
            report(context, node.callee, message);
          }
        },
      };
    },
  });
}

const noEffectBind = createForbiddenMemberCallRule(
  "Effect",
  "bind",
  "Rule: avoid Effect.bind. Why: it obscures linear data flow behind builder-style binding. Fix: use Effect.gen or a direct pipe with flatMap/map.",
);

const noRuntimeRunFork = createForbiddenMemberCallRule(
  "Runtime",
  "runFork",
  "Rule: avoid Runtime.runFork. Why: detached fibers hide lifetime and interruption ownership. Fix: run effects through the application runtime boundary.",
);

const noRunEffectOutsideBoundary = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isEffectRunCall(node)) {
          report(
            context,
            node.callee,
            "Rule: avoid running Effects outside runtime boundaries. Why: direct Effect.run* calls scatter execution ownership. Fix: return Effects from domain logic and run them at the app, CLI, worker, route, or test boundary.",
          );
        }
      },
    };
  },
});

const noEffectAsync = createForbiddenMemberCallRule(
  "Effect",
  "async",
  "Rule: avoid Effect.async. Why: manual callback bridges are easy to leak or resume incorrectly. Fix: use scoped Effect APIs or a dedicated platform adapter.",
);

const noNestedEffectCall = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (hasDeepNestedEffectFirstArgument(node)) {
          report(
            context,
            node,
            "Rule: avoid deeply nested Effect calls (Effect.xx(Effect.yy(Effect.zz(...)))). Why: they hide sequencing and spread flow. Fix: build values first, then run one flat Effect pipeline.",
          );
        }
      },
    };
  },
});

const noEffectLadder = defineRule({
  create(context: OxlintContext) {
    return {
      VariableDeclaration(node: any) {
        for (const declaration of node.declarations ?? []) {
          if (hasDeepNestedEffectFirstArgument(declaration.init)) {
            report(
              context,
              declaration.init,
              "Rule: avoid nested Effect combinators. Why: they hide sequencing and create laddered control flow. Fix: build context once (Effect.all/Effect.map) and then run a single flat pipeline.",
            );
          }
        }
      },
      ReturnStatement(node: any) {
        if (hasDeepNestedEffectFirstArgument(node.argument)) {
          report(
            context,
            node.argument,
            "Rule: avoid nested Effect combinators. Why: they hide sequencing and create laddered control flow. Fix: build context once (Effect.all/Effect.map) and then run a single flat pipeline.",
          );
        }
      },
    };
  },
});

const noFlatMapLadder = defineRule({
  create(context: OxlintContext) {
    return {
      VariableDeclaration(node: any) {
        for (const declaration of node.declarations ?? []) {
          const message = getFlatMapLadderMessage(declaration.init);
          if (message) {
            report(context, declaration.init, message);
          }
        }
      },
      ReturnStatement(node: any) {
        const message = getFlatMapLadderMessage(node.argument);
        if (message) {
          report(context, node.argument, message);
        }
      },
    };
  },
});

const noPipeLadder = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (isPipeCall(node) && containsPipeCall(node.arguments)) {
          report(
            context,
            node,
            "Rule: avoid nested pipe() chains. Why: they hide sequencing. Fix: refactor into one flat pipeline with a single decision point.",
          );
        }
      },
    };
  },
});

const noCallTower = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (hasNestedEffectCallArgument(node)) {
          report(
            context,
            node,
            "Rule: avoid nested Effect call towers (Effect.fn(Effect.fn(...))). Why: it hides sequencing. Fix: build the inner Effect first, then use pipe/Effect.flatMap/Effect.andThen for a single flat pipeline.",
          );
        }
      },
    };
  },
});

const noEffectOrElseLadder = defineRule({
  create(context: OxlintContext) {
    return {
      CallExpression(node: any) {
        if (hasOrElseSequencingFirstArgument(node)) {
          report(
            context,
            node,
            "Rule: avoid Effect.orElse around sequencing chains. Why: it hides error handling and splits the flow. Fix: move error handling to a single terminal decision after the pipeline.",
          );
        }
      },
    };
  },
});

const noUnboundedEffectAll = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isUnboundedMappedEffectAll(node)) {
          report(
            context,
            node,
            "Rule: avoid unbounded Effect.all over mapped collections. Why: it can launch work for every item at once and fail under load. Fix: pass an explicit `{ concurrency: n }` option or use a bounded batching strategy.",
          );
        }
      },
    };
  },
});

const noFireAndForgetFork = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ExpressionStatement(node: any) {
        if (hasEffectEcosystemImport && isEffectMemberCallNamed(node.expression, "fork")) {
          report(
            context,
            node.expression,
            "Rule: avoid fire-and-forget Effect.fork. Why: detached fibers hide failure, interruption, and ownership. Fix: bind the fiber and join/await/interrupt it, or use Effect.forkScoped / Effect.forkIn with an explicit scope.",
          );
        }
      },
    };
  },
});

const noForkInLoop = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    const checkLoop = (node: unknown) => {
      if (!hasEffectEcosystemImport) {
        return;
      }

      const fork = containsEffectForkCall((node as Node).body);
      if (fork) {
        report(
          context,
          fork,
          "Rule: avoid Effect.fork inside loops. Why: loop-spawned fibers create unbounded concurrency and unclear ownership. Fix: use Effect.forEach / Effect.all with an explicit concurrency limit or a scoped supervisor.",
        );
      }
    };

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ForStatement: checkLoop,
      ForInStatement: checkLoop,
      ForOfStatement: checkLoop,
      WhileStatement: checkLoop,
      DoWhileStatement: checkLoop,
    };
  },
});

const noRaceWithoutCleanup = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isEffectRaceWithoutCleanup(node)) {
          report(
            context,
            node,
            "Rule: avoid Effect.race without loser cleanup. Why: racing effects without ensuring/scoped cleanup can leak losing work or resources. Fix: wrap raced effects with Effect.ensuring/acquireRelease or use a scoped race boundary.",
          );
        }
      },
    };
  },
});

const noUnobservedFiber = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const forkedFibers = new Map<string, unknown>();
    const observedFibers = new Set<string>();

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      VariableDeclarator(node: any) {
        const name = forkedFiberVariableName(node);
        if (name) {
          forkedFibers.set(name, node);
        }
      },
      CallExpression(node: any) {
        const name = observedFiberVariableName(node);
        if (name) {
          observedFibers.add(name);
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) {
          return;
        }

        for (const [name, node] of forkedFibers) {
          if (!observedFibers.has(name)) {
            report(
              context,
              node,
              "Rule: avoid unobserved forked fibers. Why: forked fiber failures and interruption should be observed. Fix: pass the fiber to Fiber.join, Fiber.await, Fiber.interrupt, or use scoped fork APIs.",
            );
          }
        }
      },
    };
  },
});

const noUnboundedConcurrentRetry = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isUnboundedConcurrentRetry(node)) {
          report(
            context,
            node,
            "Rule: avoid unbounded concurrent retry. Why: retry inside unbounded parallel collection effects can amplify load and create retry storms. Fix: add an explicit concurrency limit or move retry behind a bounded queue/backoff policy.",
          );
        }
      },
    };
  },
});

const noBlockingCallInEffect = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const blockingNode = findBlockingSyncCallInEffectLogic(node);
        if (blockingNode) {
          report(
            context,
            blockingNode,
            "Rule: avoid blocking sync calls inside Effect logic. Why: sync fs/crypto/zlib calls block the runtime worker and hide throughput costs. Fix: use Effect.async/tryPromise at a platform boundary, stream APIs, or a dedicated blocking executor.",
          );
        }
      },
    };
  },
});

const noPromiseConcurrencyInEffect = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const promiseNode = findPromiseConcurrencyInEffectLogic(node);
        if (promiseNode) {
          report(
            context,
            promiseNode,
            "Rule: avoid Promise concurrency APIs inside Effect logic. Why: Promise.all/allSettled/race/any bypass Effect concurrency, interruption, tracing, and error channels. Fix: use Effect.all, Effect.forEach, Effect.race, or a boundary adapter with explicit cancellation ownership.",
          );
        }
      },
    };
  },
});

const noSharedMutableStateAcrossFibers = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const mutableNames = new Set<string>();

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      VariableDeclaration(node: any) {
        if (node.kind !== "let" && node.kind !== "var") {
          return;
        }

        for (const name of variableDeclarationIdentifierNames(node)) {
          mutableNames.add(name);
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const workNode = concurrentEffectWorkNode(node);
        if (!workNode) {
          return;
        }

        const mutationNode = findSharedMutableStateMutation(workNode, mutableNames);
        if (mutationNode) {
          report(
            context,
            mutationNode,
            "Rule: avoid mutating shared state across fibers. Why: outer let/var state mutated from forked or parallel work creates nondeterministic races. Fix: model shared state with Ref/SynchronizedRef/Queue or aggregate immutable results with bounded Effect.all/forEach.",
          );
        }
      },
    };
  },
});

const noTimeoutWithNoninterruptiblePromise = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const promiseNode = noninterruptiblePromiseTimeoutNode(node);
        if (promiseNode) {
          report(
            context,
            promiseNode,
            "Rule: avoid timeout around noninterruptible Promise effects. Why: timing out Effect.promise or tryPromise without a signal leaves the underlying Promise running after interruption. Fix: use Effect.tryPromise with an AbortSignal parameter and pass it to the async API.",
          );
        }
      },
    };
  },
});

const noUninterruptibleConcurrentRegion = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isUninterruptibleConcurrentRegion(node)) {
          report(
            context,
            node,
            "Rule: avoid uninterruptible concurrent regions. Why: wrapping fork/race/all/forEach or queue work in uninterruptible blocks cancellation and can strand work under shutdown. Fix: keep only the critical section uninterruptible and leave concurrent work interruptible or scoped.",
          );
        }
      },
    };
  },
});

const noUnboundedQueueOrPubSub = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isUnboundedQueueOrPubSub(node)) {
          report(
            context,
            node,
            "Rule: avoid unbounded Queue or PubSub constructors. Why: unbounded buffers hide backpressure and can fail under load. Fix: use Queue.bounded / PubSub.bounded with an explicit capacity at the owning boundary.",
          );
        }
      },
    };
  },
});

const noGlobalMutableConcurrencyState = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const globalMutableNames = new Set<string>();

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      VariableDeclaration(node: any) {
        for (const name of mutableGlobalDeclarationNames(node)) {
          globalMutableNames.add(name);
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        const workNode = concurrentEffectWorkNode(node);
        if (!workNode) {
          return;
        }

        const mutationNode = findSharedMutableStateMutation(workNode, globalMutableNames);
        if (mutationNode) {
          report(
            context,
            mutationNode,
            "Rule: avoid global mutable concurrency state. Why: module-scope mutable state touched from concurrent Effect work behaves like shared mutable global state. Fix: move ownership into Ref/SynchronizedRef/Queue/Layer state or pass immutable values through bounded effects.",
          );
        }
      },
    };
  },
});

const preventDynamicImports = defineRule({
  create(context: OxlintContext) {
    return {
      ImportExpression(node: any) {
        report(
          context,
          node,
          "Rule: avoid dynamic imports. Why: runtime module loading obscures dependency boundaries. Fix: use static imports.",
        );
      },
    };
  },
});

const rules = {
  "no-react-state": noReactState,
  "no-if-statement": noIfStatement,
  "no-switch-statement": noSwitchStatement,
  "no-ternary": noTernary,
  "no-return-null": noReturnNull,
  "no-option-as": noOptionAs,
  "no-effect-never": noEffectNever,
  "no-arrow-ladder": noArrowLadder,
  "no-branch-in-object": noBranchInObject,
  "no-iife-wrapper": noIifeWrapper,
  "no-return-in-arrow": noReturnInArrow,
  "no-return-in-callback": noReturnInCallback,
  "no-effect-fn-generator": noEffectFnGenerator,
  "no-effect-sync-console": noEffectSyncConsole,
  "no-nested-effect-gen": noNestedEffectGen,
  "no-yield-without-star-in-effect-gen": noYieldWithoutStarInEffectGen,
  "no-piped-yield-in-gen": noPipedYieldInGen,
  "no-gen-for-mapping": noGenForMapping,
  "prefer-gen-for-workflow": preferGenForWorkflow,
  "no-large-anonymous-flow": noLargeAnonymousFlow,
  "no-effect-in-flow": noEffectInFlow,
  "prefer-named-flow": preferNamedFlow,
  "prefer-pipe-for-behavior": preferPipeForBehavior,
  "prefer-decorated-effect-before-gen": preferDecoratedEffectBeforeGen,
  "no-workflow-in-behavior-pipe": noWorkflowInBehaviorPipe,
  "no-mixed-pillar-function": noMixedPillarFunction,
  "no-clever-effect-expression": noCleverEffectExpression,
  "prefer-extracted-concept": preferExtractedConcept,
  "prefer-effect-service": preferEffectService,
  "no-layer-provide-in-service-definition": noLayerProvideInServiceDefinition,
  "require-service-accessors": requireServiceAccessors,
  "require-service-dependencies": requireServiceDependencies,
  "no-namespace-effect-import": noNamespaceEffectImport,
  "no-manual-service-object-export": noManualServiceObjectExport,
  "no-layer-merge-in-request-handler": noLayerMergeInRequestHandler,
  "no-service-method-returning-promise": noServiceMethodReturningPromise,
  "prefer-layer-pipe": preferLayerPipe,
  "no-inline-layer-provide-in-program": noInlineLayerProvideInProgram,
  "prefer-layer-mergeall-for-infrastructure": preferLayerMergeallForInfrastructure,
  "no-service-layer-scatter": noServiceLayerScatter,
  "no-match-void-branch": noMatchVoidBranch,
  "no-match-effect-branch": noMatchEffectBranch,
  "warn-effect-sync-wrapper": warnEffectSyncWrapper,
  "no-effect-side-effect-wrapper": noEffectSideEffectWrapper,
  "no-effect-all-step-sequencing": noEffectAllStepSequencing,
  "no-async-effect-combinator-callback": noAsyncEffectCombinatorCallback,
  "no-throw-in-effect-logic": noThrowInEffectLogic,
  "no-or-die-outside-boundary": noOrDieOutsideBoundary,
  "no-swallowed-catch-all": noSwallowedCatchAll,
  "no-effect-ignore": noEffectIgnore,
  "no-try-catch-in-effect-logic": noTryCatchInEffectLogic,
  "no-promise-api-in-effect-logic": noPromiseApiInEffectLogic,
  "no-try-catch": noTryCatch,
  "no-effect-wrapper-alias": noEffectWrapperAlias,
  "no-manual-effect-channels": noManualEffectChannels,
  "no-wrapgraphql-catchall": noWrapgraphqlCatchall,
  "no-render-side-effects": noRenderSideEffects,
  "no-atom-registry-effect-sync": noAtomRegistryEffectSync,
  "no-family-collection-read": noFamilyCollectionRead,
  "no-inline-runtime-provide": noInlineRuntimeProvide,
  "no-naked-object-state-update": noNakedObjectStateUpdate,
  "no-effect-succeed-variable": noEffectSucceedVariable,
  "no-effect-type-alias": noEffectTypeAlias,
  "no-public-generic-effect-error": noPublicGenericEffectError,
  "no-model-overlay-cast": noModelOverlayCast,
  "no-unknown-boolean-coercion-helper": noUnknownBooleanCoercionHelper,
  "no-fromnullable-nullish-coalesce": noFromnullableNullishCoalesce,
  "no-option-boolean-normalization": noOptionBooleanNormalization,
  "no-string-sentinel-return": noStringSentinelReturn,
  "no-string-sentinel-const": noStringSentinelConst,
  "no-raw-domain-id-alias": noRawDomainIdAlias,
  "no-boolean-domain-flag": noBooleanDomainFlag,
  "no-magic-domain-string": noMagicDomainString,
  "no-raw-domain-primitive-params": noRawDomainPrimitiveParams,
  "no-raw-time-domain-field": noRawTimeDomainField,
  "no-overloaded-options-object": noOverloadedOptionsObject,
  "no-domain-logic-in-conditional": noDomainLogicInConditional,
  "no-implicit-state-machine-object": noImplicitStateMachineObject,
  "no-adhoc-domain-error": noAdhocDomainError,
  "no-domain-meaning-by-folder-only": noDomainMeaningByFolderOnly,
  "no-effect-as": noEffectAs,
  "no-effect-do": noEffectDo,
  "no-effect-bind": noEffectBind,
  "no-runtime-runfork": noRuntimeRunFork,
  "no-run-effect-outside-boundary": noRunEffectOutsideBoundary,
  "no-effect-async": noEffectAsync,
  "prevent-dynamic-imports": preventDynamicImports,
  "no-nested-effect-call": noNestedEffectCall,
  "no-effect-ladder": noEffectLadder,
  "no-flatmap-ladder": noFlatMapLadder,
  "no-pipe-ladder": noPipeLadder,
  "no-call-tower": noCallTower,
  "no-effect-orElse-ladder": noEffectOrElseLadder,
  "no-unbounded-effect-all": noUnboundedEffectAll,
  "no-fire-and-forget-fork": noFireAndForgetFork,
  "no-fork-in-loop": noForkInLoop,
  "no-race-without-cleanup": noRaceWithoutCleanup,
  "no-unobserved-fiber": noUnobservedFiber,
  "no-unbounded-concurrent-retry": noUnboundedConcurrentRetry,
  "no-blocking-call-in-effect": noBlockingCallInEffect,
  "no-promise-concurrency-in-effect": noPromiseConcurrencyInEffect,
  "no-shared-mutable-state-across-fibers": noSharedMutableStateAcrossFibers,
  "no-timeout-with-noninterruptible-promise": noTimeoutWithNoninterruptiblePromise,
  "no-uninterruptible-concurrent-region": noUninterruptibleConcurrentRegion,
  "no-unbounded-queue-or-pubsub": noUnboundedQueueOrPubSub,
  "no-global-mutable-concurrency-state": noGlobalMutableConcurrencyState,
};

type RuleName = keyof typeof rules;

function rulesFromNames<const T extends readonly RuleName[]>(ruleNames: T) {
  return Object.fromEntries(
    ruleNames.map((ruleName) => [`linteffect/${ruleName}`, "error"]),
  ) as Record<`linteffect/${T[number]}`, "error">;
}

function presetFor<const T extends Record<`linteffect/${string}`, "error">>(groupRules: T) {
  return {
    jsPlugins,
    rules: groupRules,
  } as const;
}

export const jsPlugins = [
  {
    name: "linteffect",
    specifier: "@opsydyn/oxlint-effect",
  },
] as const;

export const reactAndRuntimeBoundariesRules = rulesFromNames([
  "no-react-state",
  "no-runtime-runfork",
  "no-run-effect-outside-boundary",
  "no-or-die-outside-boundary",
  "prevent-dynamic-imports",
  "no-render-side-effects",
  "no-inline-runtime-provide",
] as const);

export const effectCompositionRules = rulesFromNames([
  "no-effect-as",
  "no-effect-do",
  "no-effect-bind",
  "no-effect-async",
  "no-effect-ignore",
  "no-effect-never",
  "no-effect-fn-generator",
  "no-nested-effect-gen",
  "no-yield-without-star-in-effect-gen",
  "no-async-effect-combinator-callback",
  "no-throw-in-effect-logic",
  "no-try-catch-in-effect-logic",
  "no-promise-api-in-effect-logic",
  "no-swallowed-catch-all",
  "no-manual-effect-channels",
  "no-effect-type-alias",
  "no-public-generic-effect-error",
] as const);

export const concurrencySafetyRules = rulesFromNames([
  "no-unbounded-effect-all",
  "no-fire-and-forget-fork",
  "no-fork-in-loop",
  "no-race-without-cleanup",
  "no-unobserved-fiber",
  "no-unbounded-concurrent-retry",
  "no-blocking-call-in-effect",
  "no-promise-concurrency-in-effect",
  "no-shared-mutable-state-across-fibers",
  "no-timeout-with-noninterruptible-promise",
  "no-uninterruptible-concurrent-region",
  "no-unbounded-queue-or-pubsub",
  "no-global-mutable-concurrency-state",
] as const);

export const pipelineShapeAndSequencingRules = rulesFromNames([
  "no-nested-effect-call",
  "no-effect-ladder",
  "no-flatmap-ladder",
  "no-pipe-ladder",
  "no-call-tower",
  "no-effect-orElse-ladder",
  "no-effect-wrapper-alias",
  "warn-effect-sync-wrapper",
  "no-effect-side-effect-wrapper",
  "no-effect-all-step-sequencing",
  "no-effect-succeed-variable",
] as const);

export const branchingAndLocalControlFlowRules = rulesFromNames([
  "no-if-statement",
  "no-switch-statement",
  "no-ternary",
  "no-try-catch",
  "no-arrow-ladder",
  "no-iife-wrapper",
  "no-return-in-arrow",
  "no-return-in-callback",
  "no-return-null",
  "no-branch-in-object",
] as const);

export const optionMatchAndDataNormalizationRules = rulesFromNames([
  "no-option-as",
  "no-match-void-branch",
  "no-match-effect-branch",
  "no-model-overlay-cast",
  "no-unknown-boolean-coercion-helper",
  "no-fromnullable-nullish-coalesce",
  "no-option-boolean-normalization",
  "no-string-sentinel-return",
  "no-string-sentinel-const",
] as const);

export const atomStateAndPlatformBoundariesRules = rulesFromNames([
  "no-effect-sync-console",
  "no-atom-registry-effect-sync",
  "no-family-collection-read",
  "no-naked-object-state-update",
  "no-wrapgraphql-catchall",
] as const);

export const domainModelingRules = rulesFromNames([
  "no-raw-domain-id-alias",
  "no-boolean-domain-flag",
  "no-magic-domain-string",
  "no-raw-domain-primitive-params",
  "no-raw-time-domain-field",
  "no-overloaded-options-object",
  "no-domain-logic-in-conditional",
  "no-implicit-state-machine-object",
  "no-adhoc-domain-error",
  "no-domain-meaning-by-folder-only",
] as const);

export const effectFlowRules = rulesFromNames([
  "no-piped-yield-in-gen",
  "no-gen-for-mapping",
  "prefer-gen-for-workflow",
] as const);

export const pureTransformationRules = rulesFromNames([
  "no-large-anonymous-flow",
  "no-effect-in-flow",
  "prefer-named-flow",
] as const);

export const behaviorDecorationRules = rulesFromNames([
  "prefer-pipe-for-behavior",
  "prefer-decorated-effect-before-gen",
  "no-workflow-in-behavior-pipe",
] as const);

export const styleSeparationRules = rulesFromNames([
  "no-mixed-pillar-function",
  "no-clever-effect-expression",
  "prefer-extracted-concept",
] as const);

export const serviceAndLayerArchitectureRules = rulesFromNames([
  "prefer-effect-service",
  "no-layer-provide-in-service-definition",
  "require-service-accessors",
  "require-service-dependencies",
  "no-namespace-effect-import",
  "no-manual-service-object-export",
  "no-layer-merge-in-request-handler",
  "no-service-method-returning-promise",
  "prefer-layer-pipe",
  "no-inline-layer-provide-in-program",
  "prefer-layer-mergeall-for-infrastructure",
  "no-service-layer-scatter",
] as const);

export const allRules = rulesFromNames(Object.keys(rules) as RuleName[]);

export const ruleGroups = {
  reactAndRuntimeBoundaries: reactAndRuntimeBoundariesRules,
  effectComposition: effectCompositionRules,
  concurrencySafety: concurrencySafetyRules,
  pipelineShapeAndSequencing: pipelineShapeAndSequencingRules,
  branchingAndLocalControlFlow: branchingAndLocalControlFlowRules,
  optionMatchAndDataNormalization: optionMatchAndDataNormalizationRules,
  atomStateAndPlatformBoundaries: atomStateAndPlatformBoundariesRules,
  domainModeling: domainModelingRules,
  effectFlow: effectFlowRules,
  pureTransformation: pureTransformationRules,
  behaviorDecoration: behaviorDecorationRules,
  styleSeparation: styleSeparationRules,
  serviceAndLayerArchitecture: serviceAndLayerArchitectureRules,
  ddd: domainModelingRules,
} as const;

export const recommended = presetFor(allRules);
export const reactAndRuntimeBoundaries = presetFor(reactAndRuntimeBoundariesRules);
export const effectComposition = presetFor(effectCompositionRules);
export const concurrencySafety = presetFor(concurrencySafetyRules);
export const pipelineShapeAndSequencing = presetFor(pipelineShapeAndSequencingRules);
export const branchingAndLocalControlFlow = presetFor(branchingAndLocalControlFlowRules);
export const optionMatchAndDataNormalization = presetFor(optionMatchAndDataNormalizationRules);
export const atomStateAndPlatformBoundaries = presetFor(atomStateAndPlatformBoundariesRules);
export const domainModeling = presetFor(domainModelingRules);
export const ddd = domainModeling;
export const effectFlow = presetFor(effectFlowRules);
export const pureTransformation = presetFor(pureTransformationRules);
export const behaviorDecoration = presetFor(behaviorDecorationRules);
export const styleSeparation = presetFor(styleSeparationRules);
export const serviceAndLayerArchitecture = presetFor(serviceAndLayerArchitectureRules);

export const presets = {
  recommended,
  reactAndRuntimeBoundaries,
  effectComposition,
  concurrencySafety,
  pipelineShapeAndSequencing,
  branchingAndLocalControlFlow,
  optionMatchAndDataNormalization,
  atomStateAndPlatformBoundaries,
  domainModeling,
  ddd,
  effectFlow,
  pureTransformation,
  behaviorDecoration,
  styleSeparation,
  serviceAndLayerArchitecture,
} as const;

export default definePlugin({
  meta: {
    name: "linteffect",
  },
  rules,
});
