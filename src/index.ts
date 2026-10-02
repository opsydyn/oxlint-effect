import { definePlugin, defineRule } from "@oxlint/plugins";
import { effectVersionFor, legacyOnlyRules, versionSensitiveRules, withEffectVersionSchema } from "./effect-version.ts";
import type { EffectVersion } from "./effect-version.ts";
export type { EffectVersion } from "./effect-version.ts";
import type { RuleOptionsSchema } from "@oxlint/plugins";
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

function containsEffectMemberCallNamed(
  node: unknown,
  propertyName: string,
  seen = new WeakSet<object>(),
): boolean {
  if (isEffectMemberCallNamed(node, propertyName)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsEffectMemberCallNamed(child, propertyName, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }

  seen.add(node);
  return Object.entries(node).some(
    ([key, child]) => key !== "parent" && containsEffectMemberCallNamed(child, propertyName, seen),
  );
}

function getFlatMapLadderMessage(node: unknown, version: EffectVersion): string | undefined {
  if (
    (isEffectMemberCallNamed(node, "flatMap") || (version === 4 && isEffectMemberCallNamed(node, "flatMapEager"))) &&
    (containsEffectMemberCallNamed(node.arguments, "flatMap") || (version === 4 && containsEffectMemberCallNamed(node.arguments, "flatMapEager")))
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

function isSchemaFilterCall(node: unknown, version: EffectVersion): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  const name = version === 3 ? "filter" : "makeFilter";
  return (
    call.type === "CallExpression" &&
    (isMemberExpression(call.callee, "S", name) ||
      isMemberExpression(call.callee, "Schema", name))
  );
}

function directArrowCallbackReturns(node: unknown, version: EffectVersion): unknown[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const call = node as Node;
  if (call.type !== "CallExpression" || !Array.isArray(call.arguments) || isSchemaFilterCall(call, version)) {
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
  version: EffectVersion = 3,
): (Node & { body: unknown }) | undefined {
  const namedFn = version === 4 && propertyName === "fn" && typeof node === "object" && node !== null
    && (node as Node).type === "CallExpression" && isEffectMemberCallNamed((node as Node).callee, "fn");
  if (!isEffectMemberCallNamed(node, propertyName) && !namedFn) {
    return undefined;
  }

  const fn = version === 4 ? ((node as Node).arguments as unknown[]).find(isGeneratorFunctionExpression) : firstArgument(node as Node & { arguments: unknown[] });
  return isGeneratorFunctionExpression(fn) ? fn : undefined;
}

function isEffectGeneratorCall(node: unknown, propertyName: "fn" | "gen", version: EffectVersion = 3): boolean {
  return getEffectGeneratorArgument(node, propertyName, version) !== undefined;
}

const effectConstructionBoundaries = new Set(["gen", "sync", "try", "tryPromise", "fn"]);

function isEffectConstructionBoundary(node: unknown, version: EffectVersion = 3): node is Node & { arguments: unknown[] } {
  if (isEffectMemberCall(node)) {
    const property = (node.callee as Node).property;
    if (isIdentifier(property) && (effectConstructionBoundaries.has(property.name) ||
      (version === 4 && (property.name === "fnUntraced" || property.name === "fnUntracedEager")))) {
      return true;
    }
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  const call = node as Node;
  return call.type === "CallExpression" && isEffectMemberCallNamed(call.callee, "fn");
}

function isDateNowCall(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "CallExpression" &&
    isMemberExpression((node as Node).callee, "Date", "now")
  );
}

function findYieldWithoutStarInEffectGen(node: unknown, version: EffectVersion): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen", version);
  return generator ? findEffectLogicNode(node, version, (child) => typeof child === "object" && child !== null && (child as Node).type === "YieldExpression" && (child as Node).delegate !== true) : undefined;
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

function isWorkflowSequencingOperator(node: unknown, version: EffectVersion = 3): boolean {
  if (!isEffectMemberCall(node)) {
    return false;
  }

  const property = ((node.callee as Node).property as Node | undefined);
  return isIdentifier(property) && (version === 3
    ? workflowSequencingCombinators.has(property.name)
    : property.name === "flatMapEager" || (property.name !== "zipRight" && workflowSequencingCombinators.has(property.name)));
}

function workflowSequencingPipeline(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (!isPipeCall(node)) {
    return undefined;
  }

  const sequencingCount = pipeOperatorArguments(node)
    .filter((argument) => isWorkflowSequencingOperator(argument, version))
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

const pureTransformationImpureNames = new Set([
  "Date",
  "Runtime",
  "fetch",
  "import",
  "queueMicrotask",
  "require",
  "setInterval",
  "setTimeout",
]);

function pureTransformationCallName(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const callee = (node as Node).callee;
  if (isIdentifier(callee)) {
    return callee.name;
  }

  if (
    typeof callee === "object" &&
    callee !== null &&
    (callee as Node).type === "MemberExpression" &&
    (callee as Node).computed !== true &&
    isIdentifier((callee as Node).property)
  ) {
    return ((callee as Node).property as Node & { name: string }).name;
  }

  return undefined;
}

function isPureTransformationCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  const name = pureTransformationCallName(node);
  return (
    !containsEffectMemberCall(node) &&
    !containsNodeType(node, "AwaitExpression") &&
    !containsNodeType(node, "YieldExpression") &&
    !containsIdentifierNamed(node, "Promise") &&
    !containsConsoleCall(node) &&
    !pureTransformationImpureNames.has(name ?? "") &&
    !(
      typeof (node as Node).callee === "object" &&
      (node as Node).callee !== null &&
      isIdentifier(((node as Node).callee as Node).object, "console")
    )
  );
}

function pureTransformationCallDepth(node: unknown): number {
  if (!isPureTransformationCall(node)) {
    return 0;
  }

  const call = node as Node & { arguments?: unknown[]; callee?: unknown };
  const childDepth = [call.callee, ...(call.arguments ?? [])]
    .filter((child) => !isFunctionLike(child))
    .reduce<number>((maxDepth, child) => Math.max(maxDepth, pureTransformationCallDepth(child)), 0);
  return childDepth + 1;
}

function preferFlowForPurePipelineNode(node: unknown): unknown | undefined {
  if (pureTransformationCallDepth(node) < 3) {
    return undefined;
  }

  const parent = typeof node === "object" && node !== null ? (node as Node).parent : undefined;
  return isPureTransformationCall(parent) ? undefined : node;
}

function businessLogicInPipeCallback(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (!isPipeCall(node)) {
    return undefined;
  }

  for (const part of pipeOperatorArguments(node)) {
    if (!isEffectMemberCallNamed(part, "flatMap") &&
      !(version === 4 && isEffectMemberCallNamed(part, "flatMapEager"))) {
      continue;
    }

    const callback = part.arguments.find(isFunctionLike);
    if (!callback) {
      continue;
    }

    const body = (callback as Node).body;
    const hasControlFlow = [
      "IfStatement",
      "SwitchStatement",
      "ForStatement",
      "ForInStatement",
      "ForOfStatement",
      "WhileStatement",
      "DoWhileStatement",
    ].some((type) => containsNodeType(body, type));
    const hasServiceRetrieval = findNode(body, isYieldedServiceDependency) !== undefined;
    const effectStepCount = findNodes(body, isEffectMemberCall).length;

    if (hasControlFlow || hasServiceRetrieval || effectStepCount >= 2) {
      return callback;
    }
  }

  return undefined;
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

const effect4RecoveryOperatorNames = [
  "catch", "catchEager", "catchCause", "catchDefect", "catchIf", "catchFilter",
  "catchCauseIf", "catchCauseFilter", "catchTag", "catchTags", "catchReason", "catchReasons",
] as const;
function isBehaviorDecorationOperator(node: unknown, version: EffectVersion = 3): boolean {
  if (!isEffectMemberCall(node)) {
    return false;
  }

  const property = ((node.callee as Node).property as Node | undefined);
  if (!isIdentifier(property)) return false;
  const name = property.name;
  return version === 3 ? behaviorDecorationOperators.has(name)
    : (name !== "catchAll" && name !== "catchSome" && name !== "timeoutFail" && behaviorDecorationOperators.has(name)) ||
      (effect4RecoveryOperatorNames as readonly string[]).includes(name) || name === "timeoutOption" || name === "timeoutOrElse" || name === "catchNoSuchElement";
}

function isExistingEffectExpression(node: unknown): boolean {
  return isEffectMemberCall(node) || isPipeCall(node);
}

function staticBehaviorCall(node: unknown, version: EffectVersion): unknown | undefined {
  if (!isBehaviorDecorationOperator(node, version)) {
    return undefined;
  }

  const first = (node as Node & { arguments: unknown[] }).arguments[0];
  return isExistingEffectExpression(first) ? node : undefined;
}

function isBehaviorDecoratedYield(node: unknown, version: EffectVersion): boolean {
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
    .some((argument) => isBehaviorDecorationOperator(argument, version));
}

function repeatedDecoratedYieldInEffectGen(node: unknown, version: EffectVersion): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen", version);
  if (!generator) {
    return undefined;
  }

  const decoratedYields = findNodes(generator.body, (child) => isBehaviorDecoratedYield(child, version), new WeakSet<object>(), true, version === 4);
  return decoratedYields.length >= 2 ? decoratedYields[1] : undefined;
}

function workflowInBehaviorPipe(node: unknown, version: EffectVersion): unknown | undefined {
  if (!isPipeCall(node)) {
    return undefined;
  }

  const parts = pipeOperatorArguments(node);
  const hasBehaviorDecoration = parts.some((part) => isBehaviorDecorationOperator(part, version));
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
  version: EffectVersion,
  pillars = new Set<StylePillar>(),
  seen = new WeakSet<object>(),
): Set<StylePillar> {
  if (isEffectMemberCallNamed(node, "gen") || isWorkflowSequencingOperator(node, version)) {
    pillars.add("workflow");
  }

  if (isFlowCall(node)) {
    pillars.add("pure");
  }

  if (isBehaviorDecorationOperator(node, version)) {
    pillars.add("behavior");
  }

  if (isMemberCall(node, "Layer") || isMemberExpression(node, "Layer", "pipe")) {
    pillars.add("layer");
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      stylePillarsInNode(child, version, pillars, seen);
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
      stylePillarsInNode(child, version, pillars, seen);
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

function mixedPillarFunctionNode(node: unknown, version: EffectVersion): unknown | undefined {
  if (!isFunctionLike(node)) {
    return undefined;
  }

  const body = (node as Node).body;
  return stylePillarsInNode(body, version).size >= 3 ? node : undefined;
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

function cleverEffectExpressionNode(node: unknown, version: EffectVersion): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const pillars = stylePillarsInNode(node, version);
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

function calleeContainsEffectService(node: unknown, version: EffectVersion = 3): boolean {
  if (isMemberExpression(node, version === 3 ? "Effect" : "Context", "Service")) {
    return true;
  }

  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  return calleeContainsEffectService((node as Node).callee, version);
}

function effectServiceOptionsObject(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const call = node as Node & { arguments?: unknown[] };
  if (!calleeContainsEffectService(call.callee, version)) {
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

function serviceConstructionOptions(node: unknown, version: EffectVersion): unknown | undefined {
  if (version === 3) return effectServiceClassOptions(node);
  const kind = (node as Node | undefined)?.type;
  return effectServiceOptionsObject(kind === "ClassDeclaration" || kind === "ClassExpression" ? (node as Node).superClass : node, version);
}

function serviceConstructionImplementation(options: unknown, version: EffectVersion): unknown {
  return version === 3 ? objectPropertyValue(options, "effect") ?? objectPropertyValue(options, "scoped") : objectPropertyValue(options, "make");
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
  ownScope = false,
): unknown | undefined {
  if (ownScope && (typeof node !== "object" || node === null || seen.has(node) || isFunctionLike(node) ||
    (node as Node).type === "ClassDeclaration" || (node as Node).type === "ClassExpression")) return undefined;
  if (predicate(node)) {
    return node;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const match = findNode(child, predicate, seen, ownScope);
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

    const match = findNode(child, predicate, seen, ownScope);
    if (match) {
      return match;
    }
  }

  return undefined;
}

function findNodes(
  node: unknown,
  predicate: (node: unknown) => boolean,
  seen = new WeakSet<object>(),
  stopAtMatch = false,
  ownScope = false,
): unknown[] {
  if (ownScope && isFunctionLike(node)) return [];
  if (stopAtMatch && typeof node === "object" && node !== null && seen.has(node)) return [];
  const matches = predicate(node) ? [node] : [];
  if (stopAtMatch && matches.length) return matches;

  if (Array.isArray(node)) {
    return node.flatMap((child) => findNodes(child, predicate, seen, stopAtMatch, ownScope)).concat(matches);
  }

  if (typeof node !== "object" || node === null) {
    return matches;
  }

  if (seen.has(node)) {
    return matches;
  }
  seen.add(node);

  return Object.entries(node).reduce<unknown[]>(
    (collected, [key, child]) => (
      key === "parent" ? collected : collected.concat(findNodes(child, predicate, seen, stopAtMatch, ownScope))
    ),
    matches,
  );
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

function inlineLayerProvideInProgram(node: unknown, version: EffectVersion = 3): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen", version) ??
    (version === 4 ? getEffectGeneratorArgument(node, "fn", version) : undefined);
  return generator ? (version === 4
    ? findOwnCallbackNode(generator.body, isEffectOrLayerProvideCall)
    : findNode(generator.body, isEffectOrLayerProvideCall)) : undefined;
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

function functionReturnsPromise(node: unknown, version: EffectVersion = 3): boolean {
  if (!isFunctionLike(node)) {
    return false;
  }

  if (isIdentifierTypeReference(returnTypeAnnotation(node), "Promise")) return true;
  if (version === 3) return findPromiseApiCall((node as Node).body) !== undefined;
  if ((node as Node).async === true) return true;
  const isPromise = (value: unknown) => isPromiseStaticApiCall(value) || isPromiseChainCall(value, version) ||
    (typeof value === "object" && value !== null && (value as Node).type === "NewExpression" && isIdentifier((value as Node).callee, "Promise"));
  const body = (node as Node).body;
  return isPromise(body) || findOwnCallbackNode(body, (child) => typeof child === "object" && child !== null &&
    (child as Node).type === "ReturnStatement" && isPromise((child as Node).argument)) !== undefined;
}

function isPromiseReturningProperty(node: unknown, version: EffectVersion = 3): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "Property" &&
    functionReturnsPromise((node as Node).value, version)
  );
}

function promiseReturningServiceMethod(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (version === 3) return findNode(node, isPromiseReturningProperty);
  // Inspect constructed shapes, not callback options inside Promise adapters.
  const seen = new WeakSet<object>();
  const inspect = (value: unknown): unknown | undefined => {
    if (typeof value !== "object" || value === null || seen.has(value)) return undefined;
    seen.add(value);
    const current = value as Node;
    if (current.type === "ObjectExpression") return (current.properties as unknown[] | undefined)?.find((property) => isPromiseReturningProperty(property, version));
    if (isFunctionLike(value)) {
      const body = current.body as Node | undefined;
      if (body?.type !== "BlockStatement") return inspect(body);
      for (const returned of findNodes(body, (child) => typeof child === "object" && child !== null && (child as Node).type === "ReturnStatement", new WeakSet<object>(), true, true)) {
        const method = inspect((returned as Node).argument);
        if (method) return method;
      }
      return undefined;
    }
    const generator = getEffectGeneratorArgument(value, "gen", version) ?? getEffectGeneratorArgument(value, "fn", version);
    if (generator) return inspect(generator);
    const first = Array.isArray(current.arguments) ? current.arguments[0] : undefined;
    if (isEffectMemberCallNamed(value, "succeed") || isEffectMemberCallNamed(value, "sync")) return inspect(first);
    if (isPipeCall(value)) {
      const callee = current.callee as Node | undefined;
      return inspect(callee?.type === "MemberExpression" ? callee.object : first);
    }
    return undefined;
  };
  return inspect(objectPropertyValue(node, "make"));
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

const effect4LogicCallbackOperators = new Set([
  ...[...effectAsyncCallbackCombinators].filter((name) => name !== "catchAll" && name !== "orElse"),
  ...effect4RecoveryOperatorNames,
]);

function effectLogicCallbackOperators(version: EffectVersion): ReadonlySet<string> {
  return version === 3 ? effectAsyncCallbackCombinators : effect4LogicCallbackOperators;
}

function effectLogicCallbacks(node: unknown, version: EffectVersion): unknown[] {
  if (!isEffectMemberCall(node)) return [];
  const property = (node.callee as Node).property;
  if (!isIdentifier(property) || !effectLogicCallbackOperators(version).has(property.name)) return [];
  return node.arguments.flatMap((argument) => {
    if (isFunctionLike(argument)) return [argument];
    if (version === 4 && (property.name === "catchTags" || property.name === "catchReasons") && isObjectExpression(argument)) {
      return ((argument as Node).properties as Node[]).map((entry) => entry.value).filter(isFunctionLike);
    }
    return [];
  });
}

function findOwnCallbackNode(node: unknown, predicate: (node: unknown) => boolean): unknown | undefined {
  return findNode(node, predicate, new WeakSet<object>(), true);
}

function findAsyncEffectCombinatorCallback(node: unknown, version: EffectVersion): unknown | undefined {
  return effectLogicCallbacks(node, version).find(isAsyncFunctionCallback);
}

function findEffectLogicNode(node: unknown, version: EffectVersion, predicate: (child: unknown) => boolean): unknown | undefined {
  const search = version === 3 ? findNode : findOwnCallbackNode;
  const generator = getEffectGeneratorArgument(node, "gen", version);
  if (generator) return search(generator.body, predicate);
  for (const callback of effectLogicCallbacks(node, version)) {
    const match = search(callbackBody(callback), predicate);
    if (match) return match;
  }
  return undefined;
}

function findEffectStatement(node: unknown, version: EffectVersion, type: "ThrowStatement" | "TryStatement"): unknown | undefined {
  return findEffectLogicNode(node, version, (child) => typeof child === "object" && child !== null && (child as Node).type === type);
}

const promiseStaticApiMethods = new Set(["all", "allSettled", "any", "race", "reject", "resolve"]);

function isPromiseStaticApiCall(node: unknown): boolean {
  return isMemberCall(node, "Promise") && promiseStaticApiMethods.has(String((((node as Node).callee as Node).property as Node).name));
}

function isPromiseChainCall(node: unknown, version: EffectVersion = 3): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  const callee = (node as Node).callee;
  const receiver = (callee as Node | undefined)?.object as Node | undefined;
  return (
    typeof callee === "object" &&
    callee !== null &&
    (callee as Node).type === "MemberExpression" &&
    (callee as Node).computed !== true &&
    (version === 3 || isPromiseStaticApiCall(receiver) ||
      (receiver?.type === "NewExpression" && isIdentifier(receiver.callee, "Promise")) ||
      isPromiseChainCall(receiver, version)) &&
    (isIdentifier((callee as Node).property, "then") ||
      isIdentifier((callee as Node).property, "catch") ||
      isIdentifier((callee as Node).property, "finally"))
  );
}

function findPromiseApiCall(node: unknown): unknown | undefined {
  return findNode(node, (child) => isPromiseStaticApiCall(child) || isPromiseChainCall(child));
}

function findPromiseApiInEffectLogic(node: unknown, version: EffectVersion): unknown | undefined {
  return findEffectLogicNode(node, version, (child) => isPromiseStaticApiCall(child) || isPromiseChainCall(child, version));
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

function findPromiseConcurrencyInEffectLogic(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (version === 4) {
    const callback = getEffectGeneratorArgument(node, "fn", version) ?? (isEffectMemberCallNamed(node, "sync") ? firstArgument(node) : undefined);
    return (callback ? findOwnCallbackNode(callbackBody(callback), isPromiseConcurrencyCall) : undefined) ?? findEffectLogicNode(node, version, isPromiseConcurrencyCall);
  }
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

const effect4TimeoutMembers = new Set(["timeout", "timeoutOption", "timeoutOrElse"]);

function pipeSource(node: Node): unknown {
  return isIdentifier(node.callee, "pipe") ? (node.arguments as unknown[])[0] : (node.callee as Node).object;
}

function noninterruptiblePromiseTimeoutNode(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (version === 4) {
    let effect: unknown;
    if ([...effect4TimeoutMembers].some(name => isEffectMemberCallNamed(node, name))) effect = firstArgument(node as Node & { arguments: unknown[] });
    else if (typeof node === "object" && node !== null && (node as Node).type === "CallExpression" &&
      [...effect4TimeoutMembers].some(name => isEffectMemberCallNamed((node as Node).callee, name))) effect = firstArgument(node as Node & { arguments: unknown[] });
    else if (isPipeCall(node) && [...effect4TimeoutMembers].some(name => isEffectMemberCallNamed(((node as Node).arguments as unknown[]).at(-1), name))) effect = pipeSource(node as Node);
    if (isEffectMemberCallNamed(effect, "promise")) return callbackHasParameter(firstArgument(effect as Node & { arguments: unknown[] })) ? undefined : effect;
    return isEffectMemberCallNamed(effect, "tryPromise") && !isCancellationAwareTryPromise(effect) ? effect : undefined;
  }
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

function findBlockingSyncCallInEffectLogic(node: unknown, version: EffectVersion = 3): unknown | undefined {
  const generator = getEffectGeneratorArgument(node, "gen", version) ?? (version === 4 ? getEffectGeneratorArgument(node, "fn", version) : undefined);
  const search = version === 4 ? (body: unknown) => findOwnCallbackNode(body, isBlockingSyncCall) : findBlockingSyncCall;
  if (generator) {
    return search(generator.body);
  }

  if (isEffectMemberCallNamed(node, "sync")) {
    const body = callbackBody(firstArgument(node));
    return body ? search(body) : undefined;
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

function effectRunExecution(node: unknown, version: EffectVersion): { program: unknown; hasContext: boolean } | undefined {
  if (isEffectMemberCall(node)) {
    const property = (node.callee as Node).property;
    if (isIdentifier(property) && effectRunMethods.has(property.name)) {
      return { program: firstArgument(node), hasContext: false };
    }
  }
  if (version !== 4 || typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") return undefined;
  const factory = (node as Node).callee;
  if (!isEffectMemberCall(factory)) return undefined;
  const property = (factory.callee as Node).property;
  if (isIdentifier(property) && property.name.endsWith("With") && effectRunMethods.has(property.name.slice(0, -4))) {
    return { program: firstArgument(node as Node & { arguments: unknown[] }), hasContext: true };
  }
  return undefined;
}

function isEffectRunCall(node: unknown, version: EffectVersion): boolean {
  return effectRunExecution(node, version) !== undefined;
}

function isEffectOrDieReference(node: unknown, version: EffectVersion): boolean {
  return (
    isMemberExpression(node, "Effect", "orDie") ||
    isEffectMemberCallNamed(node, "orDie") ||
    (version === 3 && (isMemberExpression(node, "Effect", "orDieWith") || isEffectMemberCallNamed(node, "orDieWith")))
  );
}

function findEffectOrDieOutsideBoundary(node: unknown, version: EffectVersion): unknown | undefined {
  if (isEffectOrDieReference(node, version)) {
    return node;
  }

  if (isPipeCall(node)) {
    return pipeParts(node).find((part) => isEffectOrDieReference(part, version));
  }

  return undefined;
}

function isSwallowedCatchAllBody(node: unknown, version: EffectVersion = 3): boolean {
  return (
    isEffectMemberCallNamed(node, "succeed") ||
    (isEffectMemberCallNamed(node, "asVoid") && (version === 3 || isSwallowedCatchAllBody(firstArgument(node as Node & { arguments: unknown[] }), version))) ||
    isEffectMemberCallNamed(node, "ignore") ||
    isEffectVoidMember(node)
  );
}

function getSwallowedCatchAllHandler(node: unknown, version: EffectVersion): unknown | undefined {
  if (version === 3) {
    if (!isEffectMemberCallNamed(node, "catchAll")) return undefined;
    const body = callbackBody(firstArgument(node));
    return isSwallowedCatchAllBody(body) ? body : undefined;
  }
  for (const callback of errorHandlerCallbacks(node, plainCatchOperators(version))) {
    const body = callbackBody(callback);
    if (isSwallowedCatchAllBody(body, version)) return body;
    for (const statement of handlerReturnStatements(body)) {
      if (isSwallowedCatchAllBody((statement as Node).argument, version)) return (statement as Node).argument;
    }
  }
  return undefined;
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

function consoleCallsInEffectFlow(node: unknown, version: EffectVersion = 3): unknown[] {
  if (isEffectConstructionBoundary(node, version)) {
    return findNodes((node as Node).arguments, isConsoleCall);
  }

  const options = serviceConstructionOptions(node, version);
  return options
    ? findNodes(
        serviceConstructionImplementation(options, version),
        isConsoleCall,
      )
    : [];
}

const errorHandlingOperators = new Set(["catchAll", "catchTag", "catchTags", "tapError"]);

function isStaticLogMessage(node: unknown): boolean {
  return isStringLiteral(node) || (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "TemplateLiteral"
  );
}

function isEffectErrorLogCall(node: unknown): node is Node & { arguments: unknown[] } {
  return isEffectMemberCallNamed(node, "logError") || isEffectMemberCallNamed(node, "logWarning");
}

function isObjectExpression(node: unknown): boolean {
  return typeof node === "object" && node !== null && (node as Node).type === "ObjectExpression";
}

function hasStructuredLogContext(candidate: unknown, logCall: Node & { arguments: unknown[] }): boolean {
  if (findNode(candidate, (node) => isEffectMemberCallNamed(node, "annotateLogs"))) {
    return true;
  }

  return logCall.arguments.slice(1).some((argument) => (
    isObjectExpression(argument) || !isStaticLogMessage(argument)
  ));
}

function contextlessErrorLogs(node: unknown): unknown[] {
  return findNodes(node, (candidate) => (
    isEffectErrorLogCall(candidate) &&
    isStaticLogMessage(firstArgument(candidate)) &&
    !hasStructuredLogContext(node, candidate)
  ));
}

function errorHandlerBodies(node: unknown, version: EffectVersion = 3): unknown[] {
  if (!isEffectMemberCall(node)) {
    return [];
  }

  const property = ((node as Node).callee as Node).property;
  if (!isIdentifier(property) || !(version === 3 ? errorHandlingOperators.has(property.name)
    : property.name === "tapError" || property.name === "catchNoSuchElement" || (effect4RecoveryOperatorNames as readonly string[]).includes(property.name))) {
    return [];
  }

  const arguments_ = (node as Node).arguments as unknown[];
  return (version === 4 ? arguments_.flatMap(argument =>
    (property.name === "catchTags" || property.name === "catchReasons") && isObjectExpression(argument)
      ? ((argument as Node).properties as Node[]).map(entry => entry.value).filter(isFunctionLike) : [argument]) : arguments_)
    .map(callbackBody)
    .filter((body): body is unknown => body !== undefined);
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

function v4ForkConstruction(node: unknown): unknown | undefined {
  if (isEffectMemberCallNamed(node, "forkChild") || isEffectMemberCallNamed(node, "forkDetach")) return node;
  if (typeof node === "object" && node !== null && (node as Node).type === "CallExpression" &&
    (isEffectMemberCallNamed((node as Node).callee, "forkChild") || isEffectMemberCallNamed((node as Node).callee, "forkDetach"))) return node;
  if (!isPipeCall(node)) return undefined;
  const operator = ((node as Node).arguments as unknown[] | undefined)?.at(-1);
  if (isEffectMemberCallNamed(operator, "forkChild") || isEffectMemberCallNamed(operator, "forkDetach")) return operator;
  if (typeof operator !== "object" || operator === null || (operator as Node).type !== "MemberExpression") return undefined;
  const member = operator as Node;
  return member.computed !== true && isIdentifier(member.object, "Effect") &&
    (isIdentifier(member.property, "forkChild") || isIdentifier(member.property, "forkDetach")) ? operator : undefined;
}

function discardedFork(node: unknown, version: EffectVersion): unknown | undefined {
  if (version === 3) return isEffectMemberCallNamed(node, "fork") ? node : undefined;
  const expression = typeof node === "object" && node !== null && (node as Node).type === "YieldExpression"
    ? (node as Node).argument : node;
  return v4ForkConstruction(expression);
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

const highRiskEffectMembers = new Set([
  "sleep",
  "await",
  "promise",
  "tryPromise",
  "fork",
  "forkDaemon",
  "forkScoped",
  "all",
  "forEach",
  "race",
  "raceAll",
]);

const effectfulSynchronizedRefMembers = new Set([
  "modifyEffect",
  "modifySomeEffect",
  "updateEffect",
  "updateAndGetEffect",
]);

function containsHighRiskSuspension(node: unknown, seen = new WeakSet<object>()): boolean {
  if (isEffectMemberCall(node)) {
    const property = ((node as Node).callee as Node).property;
    if (isIdentifier(property) && highRiskEffectMembers.has(property.name)) {
      return true;
    }
  }

  if (isMemberCall(node, "Queue", "take") || isMemberCall(node, "Deferred", "await")) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsHighRiskSuspension(child, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsHighRiskSuspension(child, seen)
  ));
}

function isAnyObjectMemberCallNamed(node: unknown, propertyName: string): node is Node & { arguments: unknown[] } {
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
    isIdentifier((call.callee as Node).property, propertyName)
  );
}

function heldSemaphoreWork(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (version === 4 && isPipeCall(node)) {
    const operator = ((node as Node).arguments as unknown[]).at(-1);
    return isAnyObjectMemberCallNamed(operator, "withPermit") || isAnyObjectMemberCallNamed(operator, "withPermits") ? pipeSource(node as Node) : undefined;
  }
  if (version === 4 && [node, typeof node === "object" && node !== null ? (node as Node).callee : undefined].some(call => isMemberCall(call, "TSemaphore", "withPermit") || isMemberCall(call, "TSemaphore", "withPermits"))) return undefined;
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const call = node as Node & { arguments?: unknown[] };
  if (!Array.isArray(call.arguments)) {
    return undefined;
  }

  if (
    typeof call.callee === "object" &&
    call.callee !== null &&
    (call.callee as Node).type === "CallExpression"
  ) {
    const inner = call.callee as Node;
    if (
      (isAnyObjectMemberCallNamed(inner, "withPermit") || isAnyObjectMemberCallNamed(inner, "withPermits")) &&
      call.arguments.length > 0
    ) {
      return call.arguments[0];
    }
  }

  if (isMemberCall(call, "TSemaphore", "withPermit") || isMemberCall(call, "TSemaphore", "withPermits")) {
    return call.arguments[0];
  }

  if (isAnyObjectMemberCallNamed(call, "withPermit") || isAnyObjectMemberCallNamed(call, "withPermits")) {
    return call.arguments.at(-1);
  }

  return undefined;
}

function synchronizedRefModifierWork(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (version === 4) {
    const operator = isPipeCall(node) ? ((node as Node).arguments as unknown[]).at(-1) : (node as Node)?.callee;
    const owner = [node, operator].find(call => isEffectfulSynchronizedRefCall(call, "SynchronizedRef") || isEffectfulSynchronizedRefCall(call, "SubscriptionRef"));
    if (owner) {
      const arguments_ = (owner as Node).arguments as unknown[];
      return owner !== node || arguments_.length > 1 ? arguments_.at(-1) : undefined;
    }
    return undefined;
  }
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return undefined;
  }

  const call = node as Node & { arguments?: unknown[] };
  if (!Array.isArray(call.arguments)) {
    return undefined;
  }

  if (isEffectfulSynchronizedRefCall(call.callee, "SynchronizedRef") && call.arguments.length > 0) return ((call.callee as Node).arguments as unknown[]).at(-1);

  if (isEffectfulSynchronizedRefCall(call, "SynchronizedRef") && call.arguments.length > 1) {
    return call.arguments.at(-1);
  }

  if (isAnyEffectfulSynchronizedRefCall(call) && !isEffectfulSynchronizedRefCall(call, "SynchronizedRef")) {
    return call.arguments.at(-1);
  }

  return undefined;
}

function isEffectfulSynchronizedRefCall(node: unknown, objectName: string): boolean {
  return isAnyEffectfulSynchronizedRefCall(node) && isIdentifier(((node as Node).callee as Node).object, objectName);
}

function isAnyEffectfulSynchronizedRefCall(node: unknown): boolean {
  return [...effectfulSynchronizedRefMembers].some((propertyName) => isAnyObjectMemberCallNamed(node, propertyName));
}

const deferredConstructorMembers = new Set(["make", "unsafeMake", "makeUnsafe"]);
const deferredTimeoutMembers = new Set([
  "timeout",
  "timeoutOption",
  "timeoutFail",
  "timeoutFailCause",
  "timeoutTo",
]);
const deferredInterruptionMembers = new Set(["race", "raceFirst", "raceAll", "interruptible", "scoped"]);

function isEffectMemberExpressionNamed(node: unknown, propertyName: string): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const member = node as Node;
  return (
    member.type === "MemberExpression" &&
    member.computed !== true &&
    isIdentifier(member.object, "Effect") &&
    isIdentifier(member.property, propertyName)
  );
}

function isDeferredConstructorCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  const call = node as Node;
  const callee = call.callee;
  if (typeof callee !== "object" || callee === null || (callee as Node).type !== "MemberExpression") {
    return false;
  }

  const member = callee as Node;
  return (
    member.computed !== true &&
    isIdentifier(member.object, "Deferred") &&
    isIdentifier(member.property) &&
    deferredConstructorMembers.has(member.property.name)
  );
}

function isDeferredAwaitCall(node: unknown): node is Node & { arguments: unknown[] } {
  return isMemberCall(node, "Deferred", "await") && Array.isArray((node as Node).arguments);
}

function deferredBindingName(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null || (node as Node).type !== "VariableDeclarator") {
    return undefined;
  }

  const declaration = node as Node;
  if (!isIdentifier(declaration.id) || !findNode(declaration.init, isDeferredConstructorCall)) {
    return undefined;
  }

  return declaration.id.name;
}

function hasMatchingDeferredFinalizer(node: unknown, bindingName: string): boolean {
  return Boolean(findNode(node, (candidate) => {
    if (!isMemberCall(candidate, "Effect", "addFinalizer") && !isMemberCall(candidate, "Scope", "addFinalizer")) {
      return false;
    }

    const arguments_ = (candidate as Node & { arguments?: unknown[] }).arguments;
    return Array.isArray(arguments_) && arguments_.some((argument) => {
      const body = callbackBody(argument);
      return body !== undefined && containsIdentifierNamed(body, bindingName);
    });
  }));
}

function isEffectScopedPipeCall(node: unknown): boolean {
  if (!isPipeCall(node)) {
    return false;
  }

  const arguments_ = (node as Node & { arguments?: unknown[] }).arguments;
  return Array.isArray(arguments_) && arguments_.some((argument) => isEffectMemberExpressionNamed(argument, "scoped"));
}

function isDeferredAwaitProtected(node: unknown, bindingName: string, version: EffectVersion = 3, references: readonly { identifier: unknown }[] = []): boolean {
  let current = typeof node === "object" && node !== null ? (node as Node).parent : undefined;
  const seen = new WeakSet<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) {
      return false;
    }
    seen.add(current);

    if (
      (isEffectMemberCall(current) && (() => {
        const property = ((current as Node).callee as Node).property;
        return isIdentifier(property) && (
          (version === 4 ? effect4TimeoutMembers.has(property.name) || v4RaceMembers.has(property.name) || property.name === "interruptible" || property.name === "scoped" : deferredTimeoutMembers.has(property.name) || deferredInterruptionMembers.has(property.name))
        );
      })()) ||
      (version === 3 ? isEffectScopedPipeCall(current) : isPipeCall(current) && (() => {
        const operator = ((current as Node).arguments as unknown[]).at(-1);
        return [...effect4TimeoutMembers, ...v4RaceMembers, "interruptible", "scoped"].some(name => isEffectMemberCallNamed(operator, name) || isEffectMemberExpressionNamed(operator, name));
      })()) ||
      (version === 4 && (current as Node).type === "CallExpression" && isEffectMemberCall((current as Node).callee) && (() => {
        const name = (((current as Node).callee as Node).callee as Node).property;
        return isIdentifier(name) && (effect4TimeoutMembers.has(name.name) || v4RaceMembers.has(name.name));
      })())
    ) {
      return true;
    }

    if (isFunctionLike(current)) {
      if (version === 3 ? hasMatchingDeferredFinalizer(current, bindingName) : references.some(reference => {
        for (let owner = (reference.identifier as Node).parent as Node | undefined; owner && nodeWithin(owner, current); owner = owner.parent as Node | undefined) {
          if (isMemberCall(owner, "Effect", "addFinalizer") || isMemberCall(owner, "Scope", "addFinalizer")) return true;
        }
        return false;
      })) return true;
      if (version === 4) {
        const parent = (current as Node).parent;
        if (getEffectGeneratorArgument(parent, "gen", 4) !== current && getEffectGeneratorArgument(parent, "fn", 4) !== current && !effectLogicCallbacks(parent, 4).includes(current)) return false;
      }
    }

    current = (current as Node).parent;
  }

  return false;
}

const raceCleanupCalls = new Set([
  "acquireRelease",
  "acquireUseRelease",
  "ensuring",
  "forkIn",
  "forkScoped",
  "scoped",
]);

const v4RaceMembers = new Set(["race", "raceAll", "raceFirst", "raceAllFirst"]);

function isV4RaceMember(node: unknown): boolean {
  return [...v4RaceMembers].some(name => isEffectMemberCallNamed(node, name) || isEffectMemberExpressionNamed(node, name));
}

function v4RaceConstruction(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") return false;
  return isV4RaceMember(node) || isV4RaceMember((node as Node).callee) ||
    (isPipeCall(node) && isV4RaceMember(((node as Node).arguments as unknown[] | undefined)?.at(-1)));
}

function isEffectRaceWithoutCleanup(node: unknown, version: EffectVersion = 3): boolean {
  if (version === 4) {
    if (!v4RaceConstruction(node)) return false;
    const parent = (node as Node).parent;
    if (typeof parent === "object" && parent !== null && v4RaceConstruction(parent) &&
      ((parent as Node).callee === node || (isPipeCall(parent) && ((parent as Node).arguments as unknown[] | undefined)?.at(-1) === node))) return false;
    const hasCleanup = (value: unknown) => findNode(value, candidate => [...raceCleanupCalls].some(name =>
      isEffectMemberCallNamed(candidate, name) || isEffectMemberExpressionNamed(candidate, name))) !== undefined;
    if (hasCleanup((node as Node).arguments) || hasCleanup(((node as Node).callee as Node | undefined)?.arguments)) return false;
    let current = parent;
    const seen = new WeakSet<object>();
    while (typeof current === "object" && current !== null && !seen.has(current)) {
      seen.add(current);
      if (isFunctionLike(current) &&
        getEffectGeneratorArgument((current as Node).parent, "gen", 4) !== current &&
        getEffectGeneratorArgument((current as Node).parent, "fn", 4) !== current &&
        !(isEffectMemberCallNamed((current as Node).parent, "acquireUseRelease") &&
          (((current as Node).parent as Node).arguments as unknown[] | undefined)?.[1] === current)) break;
      if (isEffectMemberCall(current) && raceCleanupCalls.has(((current.callee as Node).property as Node).name as string)) return false;
      if (isPipeCall(current) && hasCleanup((current as Node).arguments)) return false;
      current = (current as Node).parent;
    }
    return true;
  }
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

function v4SharedStateWork(node: unknown): unknown | undefined {
  if (isEffectMemberCallNamed(node, "all") || isEffectMemberCallNamed(node, "forEach")) return (node as Node).arguments;
  if (!v4ForkConstruction(node)) return undefined;
  if (!isPipeCall(node)) return firstArgument(node as Node & { arguments: unknown[] });
  const receiver = ((node as Node).callee as Node).object;
  return isIdentifier((node as Node).callee, "pipe") ? firstArgument(node as Node & { arguments: unknown[] }) : receiver;
}

function nodeWithin(node: unknown, owner: unknown): boolean {
  if (Array.isArray(owner)) return owner.some(entry => nodeWithin(node, entry));
  for (let current = node as Node | undefined; current; current = current.parent as Node | undefined) {
    if (current === owner) return true;
  }
  return false;
}

function mutationAtReference(reference: unknown): unknown | undefined {
  const identifier = reference as Node;
  const parent = identifier.parent as Node | undefined;
  if (parent?.type === "AssignmentExpression" && parent.left === identifier) return parent;
  if (parent?.type === "UpdateExpression" && parent.argument === identifier) return parent;
  if (parent?.type === "MemberExpression" && parent.object === identifier && parent.computed !== true &&
    isIdentifier(parent.property) && mutatingCollectionMethods.has(parent.property.name)) {
    const call = parent.parent as Node | undefined;
    if (call?.type === "CallExpression" && call.callee === parent) return call;
  }
  return undefined;
}

function lexicalWorkMutation(work: unknown, variables: ReturnType<OxlintContext["sourceCode"]["getDeclaredVariables"]>): unknown | undefined {
  for (const variable of variables) {
    if (variable.identifiers.some(identifier => nodeWithin(identifier, work))) continue;
    const mutation = variable.references.map(reference => mutationAtReference(reference.identifier)).find(node => node && nodeWithin(node, work));
    if (mutation) return mutation;
  }
  return undefined;
}

const concurrentWorkMembers = new Set([
  "fork",
  "forkScoped",
  "forkDaemon",
  "all",
  "forEach",
  "race",
  "raceFirst",
  "raceAll",
]);

const resourceAcquisitionVerbs = new Set([
  "open",
  "connect",
  "create",
  "start",
  "listen",
  "subscribe",
  "acquire",
]);

const resourceLikeTerms = new Set([
  "client",
  "connection",
  "conn",
  "pool",
  "db",
  "database",
  "file",
  "socket",
  "stream",
  "server",
  "subscription",
  "handle",
]);

const resourceCleanupMethods = new Set(["close", "destroy", "dispose", "cleanup"]);

function identifierNameTokens(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((token) => token.toLowerCase());
}

function isResourceLikeName(name: string): boolean {
  return identifierNameTokens(name).some((token) => resourceLikeTerms.has(token));
}

function isResourceLikeExpression(node: unknown): boolean {
  if (isIdentifier(node)) {
    return isResourceLikeName(node.name);
  }

  if (!isMemberExpressionNode(node)) {
    return false;
  }

  const member = node as Node;
  if (member.computed === true) {
    return false;
  }

  return (
    (isIdentifier(member.property) && isResourceLikeName(member.property.name)) ||
    isResourceLikeExpression(member.object)
  );
}

function isResourceCleanupCall(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  const call = node as Node;
  const callee = call.callee;
  if (
    typeof callee !== "object" ||
    callee === null ||
    (callee as Node).type !== "MemberExpression" ||
    (callee as Node).computed === true ||
    !isIdentifier((callee as Node).property)
  ) {
    return false;
  }

  const member = callee as Node & { property: Node & { name: string } };
  return (
    resourceCleanupMethods.has(member.property.name) &&
    isResourceLikeExpression(member.object)
  );
}

function concurrentWorkArguments(node: unknown, version: EffectVersion = 3): unknown[] | undefined {
  if (version === 4) {
    const operator = isPipeCall(node) ? ((node as Node).arguments as unknown[]).at(-1) : (node as Node)?.callee;
    const matches = (call: unknown) => [...effect4ConcurrentCalls].some(name => isEffectMemberCallNamed(call, name) || isEffectMemberExpressionNamed(call, name));
    if (matches(node)) return (node as Node).arguments as unknown[];
    if (matches(operator)) return [...((operator as Node).arguments as unknown[] ?? []), ...(isPipeCall(node) ? [pipeSource(node as Node)] : (node as Node).arguments as unknown[])];
    return undefined;
  }
  if (!isEffectMemberCall(node)) {
    return undefined;
  }

  const property = ((node as Node).callee as Node).property;
  return isIdentifier(property) && concurrentWorkMembers.has(property.name)
    ? (node as Node & { arguments: unknown[] }).arguments
    : undefined;
}

function resourceAcquisitionCall(node: unknown): node is Node & { callee: Node } {
  if (typeof node !== "object" || node === null || (node as Node).type !== "CallExpression") {
    return false;
  }

  const call = node as Node;
  const callee = call.callee;
  let name: string | undefined;

  if (isIdentifier(callee)) {
    name = callee.name;
  } else if (typeof callee === "object" && callee !== null && (callee as Node).type === "MemberExpression") {
    const member = callee as Node;
    if (member.computed !== true && isIdentifier(member.property)) {
      name = member.property.name;
    }
  }

  if (!name || name === "acquireRelease" || name === "acquireUseRelease") {
    return false;
  }

  const tokens = identifierNameTokens(name);
  return (
    tokens.some((token) => resourceAcquisitionVerbs.has(token)) &&
    isResourceLikeName(name)
  );
}

function hasScopedReleaseEvidence(node: unknown, bindingName?: string): boolean {
  if (
    isEffectMemberCallNamed(node, "acquireRelease") ||
    isEffectMemberCallNamed(node, "acquireUseRelease") ||
    isEffectMemberCallNamed(node, "scoped") ||
    isEffectScopedPipeCall(node)
  ) {
    return true;
  }

  return bindingName !== undefined && hasMatchingDeferredFinalizer(node, bindingName);
}

function matchingFinalizerBindingNames(node: unknown): Set<string> {
  const bindingNames = new Set<string>();
  for (const candidate of findNodes(node, (child) => (
    typeof child === "object" && child !== null && (child as Node).type === "VariableDeclarator"
  ))) {
    const declaration = candidate as Node;
    if (
      isIdentifier(declaration.id) &&
      findNode(declaration.init, resourceAcquisitionCall) &&
      hasMatchingDeferredFinalizer(node, declaration.id.name)
    ) {
      bindingNames.add(declaration.id.name);
    }
  }
  return bindingNames;
}

function collectUnscopedResourceAcquisitions(
  node: unknown,
  matches: unknown[],
  seen = new WeakSet<object>(),
  ownedBindings = new Set<string>(),
  owned = false,
  version: EffectVersion = 3,
): void {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectUnscopedResourceAcquisitions(child, matches, seen, ownedBindings, owned, version);
    }
    return;
  }

  if (typeof node !== "object" || node === null || seen.has(node)) {
    return;
  }
  seen.add(node);

  if (version === 4 && isFunctionLike(node)) {
    const parent = (node as Node).parent;
    if (getEffectGeneratorArgument(parent, "gen", 4) !== node && getEffectGeneratorArgument(parent, "fn", 4) !== node && !effectLogicCallbacks(parent, 4).includes(node) &&
      !["sync", "suspend", "promise", "tryPromise"].some(name => isEffectMemberCallNamed(parent, name)) && !isAnyObjectMemberCallNamed(parent, "map")) return;
  }

  if (hasScopedReleaseEvidence(node)) {
    return;
  }

  const nextOwnedBindings = isFunctionLike(node) ? new Set([...ownedBindings, ...matchingFinalizerBindingNames(node)]) : ownedBindings;

  const declaration = (node as Node).type === "VariableDeclarator" ? node as Node : undefined;
  const declarationName = declaration && isIdentifier(declaration.id) ? declaration.id.name : undefined;
  const declarationIsOwned = declarationName !== undefined && nextOwnedBindings.has(declarationName);

  if (resourceAcquisitionCall(node) && !owned) {
    matches.push(node);
    return;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") {
      continue;
    }

    collectUnscopedResourceAcquisitions(
      child,
      matches,
      seen,
      nextOwnedBindings,
      owned || declarationIsOwned,
      version,
    );
  }
}

function findUnscopedResourceAcquisition(node: unknown, seen = new WeakSet<object>()): unknown | undefined {
  const matches: unknown[] = [];
  collectUnscopedResourceAcquisitions(node, matches, seen);
  return matches[0];
}

function findUnscopedResourceAcquisitions(node: unknown, version: EffectVersion = 3): unknown[] {
  const matches: unknown[] = [];
  collectUnscopedResourceAcquisitions(node, matches, undefined, undefined, false, version);
  return matches;
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

const effect4ConcurrentCalls = new Set(["all", "forEach", "forkChild", "forkDetach", "forkScoped", "forkIn", "race", "raceAll", "raceFirst", "raceAllFirst"]);

function containsEffect4ConcurrentOperation(node: unknown, permit = false): boolean {
  return !!findOwnCallbackNode(node, child => {
    if (isMemberCall(child, "Queue", "take") || isMemberCall(child, "PubSub", "take") ||
      [...effect4ConcurrentCalls].some(name => isEffectMemberCallNamed(child, name) || isEffectMemberExpressionNamed(child, name)) ||
      permit && (["sleep", "promise", "tryPromise"].some(name => isEffectMemberCallNamed(child, name)) || isMemberCall(child, "Deferred", "await"))) return true;
    const generator = getEffectGeneratorArgument(child, "gen", 4) ?? getEffectGeneratorArgument(child, "fn", 4);
    if (generator && containsEffect4ConcurrentOperation(generator.body, permit)) return true;
    return effectLogicCallbacks(child, 4).some(callback => containsEffect4ConcurrentOperation(callbackBody(callback), permit));
  });
}

function isUninterruptibleConcurrentRegion(node: unknown, version: EffectVersion = 3): boolean {
  if (version === 4) {
    const work = isEffectMemberCallNamed(node, "uninterruptible") ? firstArgument(node as Node & { arguments: unknown[] }) :
      isPipeCall(node) && isEffectMemberExpressionNamed(((node as Node).arguments as unknown[]).at(-1), "uninterruptible") ? pipeSource(node as Node) : undefined;
    return work !== undefined && containsEffect4ConcurrentOperation(work);
  }
  return (
    isEffectMemberCallNamed(node, "uninterruptible") &&
    containsConcurrentOperation((node as Node & { arguments: unknown[] }).arguments[0])
  );
}

function isUnboundedQueueOrPubSub(node: unknown, version: EffectVersion = 3): boolean {
  if (isMemberCall(node, "Queue", "unbounded") || isMemberCall(node, "PubSub", "unbounded")) return true;
  if (version !== 4) return false;
  if (isMemberCall(node, "PubSub", "makeAtomicUnbounded")) return true;
  if (!isMemberCall(node, "Queue", "make")) return false;
  const options = firstArgument(node as Node & { arguments: unknown[] });
  if (!options || isIdentifier(options, "undefined")) return true;
  if (!isObjectExpression(options)) return false;
  if (((options as Node).properties as Node[]).some(entry => entry.type === "SpreadElement")) return false;
  const capacity = objectPropertyValue(options, "capacity");
  return !capacity ||
    isIdentifier(capacity, "undefined") || isIdentifier(capacity, "Infinity") ||
    (typeof capacity === "object" && capacity !== null && (capacity as Node).type === "MemberExpression" &&
      (capacity as Node).computed !== true && isIdentifier((capacity as Node).object, "Number") && isIdentifier((capacity as Node).property, "POSITIVE_INFINITY"));
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

function v4FiberObservedReference(reference: unknown): boolean {
  if (!isIdentifier(reference)) return false;
  const parent = reference.parent as Node | undefined;
  if (!parent) return false;
  if (parent.type === "ReturnStatement" && parent.argument === reference) return true;
  if (observedFiberVariableName(parent) === reference.name && firstArgument(parent as Node & { arguments: unknown[] }) === reference) return true;
  const pipe = parent.type === "MemberExpression" && parent.object === reference ? parent.parent : parent;
  return isPipeCall(pipe) && findNode((pipe as Node).arguments, candidate =>
    [...fiberObservationCalls].some(name => isMemberExpression(candidate, "Fiber", name))) !== undefined;
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
  return first !== undefined && containsEffectMemberCall(first);
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

function hasExplicitEffectReturnType(node: unknown, declaredReturnType?: unknown): boolean {
  return (
    isQualifiedTypeReference(returnTypeAnnotation(node), "Effect", "Effect") ||
    isQualifiedTypeReference(declaredReturnType, "Effect", "Effect")
  );
}

function operationReturnExpressions(node: unknown): unknown[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const body = (node as Node).body;
  if (typeof body !== "object" || body === null) {
    return [];
  }

  if ((body as Node).type !== "BlockStatement") {
    return [body];
  }

  const collectReturns = (current: unknown, seen = new WeakSet<object>()): unknown[] => {
    if (Array.isArray(current)) {
      return current.flatMap((child) => collectReturns(child, seen));
    }

    if (typeof current !== "object" || current === null || seen.has(current)) {
      return [];
    }
    seen.add(current);

    const currentNode = current as Node;
    if (currentNode.type === "ReturnStatement") {
      return [currentNode.argument];
    }
    if (
      currentNode.type === "ArrowFunctionExpression" ||
      currentNode.type === "FunctionExpression" ||
      currentNode.type === "FunctionDeclaration"
    ) {
      return [];
    }

    return Object.entries(currentNode).flatMap(([key, child]) => (
      key === "parent" ? [] : collectReturns(child, seen)
    ));
  };

  return collectReturns(body);
}

function returnedEffectExpressions(node: unknown): unknown[] {
  return operationReturnExpressions(node).filter((expression) => (
    isEffectMemberCall(expression) || isPipeStartingWithEffect(expression)
  ));
}

function containsDirectEffectSpan(expression: unknown): boolean {
  return isEffectMemberCallNamed(expression, "withSpan") || (
    isPipeCall(expression) && pipeParts(expression).some((part) => isEffectMemberCallNamed(part, "withSpan"))
  );
}

function publicEffectOperationWithoutSpan(node: unknown, declaredReturnType?: unknown): unknown | undefined {
  if (!hasExplicitEffectReturnType(node, declaredReturnType)) {
    return undefined;
  }

  const expressions = returnedEffectExpressions(node);
  return expressions.length === 0 || expressions.some((expression) => !containsDirectEffectSpan(expression))
    ? node
    : undefined;
}

type ExportedFunctionValue = {
  readonly functionNode: unknown;
  readonly declaredReturnType?: unknown;
};

function declaredFunctionReturnType(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const annotation = (node as Node).typeAnnotation;
  if (typeof annotation !== "object" || annotation === null) {
    return undefined;
  }

  return returnTypeAnnotation((annotation as Node).typeAnnotation ?? annotation);
}

function exportedFunctionValues(node: unknown): ExportedFunctionValue[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const exportNode = node as Node;
  if (exportNode.type !== "ExportNamedDeclaration" && exportNode.type !== "ExportDefaultDeclaration") {
    return [];
  }

  const declaration = exportNode.declaration;
  if (typeof declaration !== "object" || declaration === null) {
    return [];
  }

  if ((declaration as Node).type === "FunctionDeclaration") {
    return [{ functionNode: declaration }];
  }

  if ((declaration as Node).type !== "VariableDeclaration") {
    return [];
  }

  return (((declaration as Node).declarations as unknown[] | undefined) ?? []).flatMap((declarator) => {
    if (typeof declarator !== "object" || declarator === null) {
      return [];
    }

    const init = (declarator as Node).init;
    return (
      typeof init === "object" &&
      init !== null &&
      ((init as Node).type === "ArrowFunctionExpression" || (init as Node).type === "FunctionExpression")
    ) ? [{
      functionNode: init,
      declaredReturnType: declaredFunctionReturnType((declarator as Node).id),
    }] : [];
  });
}

function serviceMethodFunctions(options: unknown, version: EffectVersion = 3): unknown[] {
  if (version === 4) {
    const seen = new WeakSet<object>();
    const objects = (value: unknown): unknown[] => {
      if (typeof value !== "object" || value === null || seen.has(value)) return [];
      seen.add(value);
      if (isObjectExpression(value)) return [value];
      if (isFunctionLike(value)) return operationReturnExpressions(value).flatMap(objects);
      const generator = getEffectGeneratorArgument(value, "gen", version) ?? getEffectGeneratorArgument(value, "fn", version);
      if (generator) return objects(generator);
      if (isEffectMemberCallNamed(value, "succeed") || isEffectMemberCallNamed(value, "sync") || isEffectMemberCallNamed(value, "suspend")) return objects(firstArgument(value as Node & { arguments: unknown[] }));
      if (isPipeCall(value)) {
        const callee = (value as Node).callee as Node;
        return objects(callee.type === "MemberExpression" ? callee.object : firstArgument(value as Node & { arguments: unknown[] }));
      }
      return [];
    };
    return objects(objectPropertyValue(options, "make")).flatMap(value => ((value as Node).properties as Node[]).filter(entry => entry.type === "Property" && isFunctionLike(entry.value)).map(entry => entry.value));
  }
  const implementation = objectPropertyValue(options, "effect") ?? objectPropertyValue(options, "scoped");
  const generator = getEffectGeneratorArgument(implementation, "gen");
  const returnedObject = generator
    ? operationReturnExpressions(generator).find(isObjectExpression)
    : isEffectMemberCallNamed(implementation, "succeed") && isObjectExpression(firstArgument(implementation))
      ? firstArgument(implementation)
      : undefined;

  if (!returnedObject) {
    return [];
  }

  const properties = (returnedObject as Node).properties;
  if (!Array.isArray(properties)) {
    return [];
  }

  return properties.flatMap((property) => {
    if (typeof property !== "object" || property === null || (property as Node).type !== "Property") {
      return [];
    }

    const value = (property as Node).value;
    return (
      typeof value === "object" &&
      value !== null &&
      ((value as Node).type === "ArrowFunctionExpression" || (value as Node).type === "FunctionExpression")
    ) ? [value] : [];
  });
}

function serviceEffectOperationWithoutSpan(node: unknown): unknown | undefined {
  const expressions = returnedEffectExpressions(node);
  return expressions.some((expression) => !containsDirectEffectSpan(expression)) ? node : undefined;
}

function genericEffectErrorReturnType(node: unknown): unknown | undefined {
  const target = effectErrorChannelTarget(node);
  return target && isGenericErrorType(target.errorChannel)
    ? target.annotation
    : undefined;
}

type PublicEffectErrorTarget = {
  readonly annotation: unknown;
  readonly errorChannel: unknown;
};

function effectErrorChannelTarget(
  node: unknown,
  declaredReturnType?: unknown,
): PublicEffectErrorTarget | undefined {
  const annotation = returnTypeAnnotation(node) ?? declaredReturnType;
  if (!isQualifiedTypeReference(annotation, "Effect", "Effect")) {
    return undefined;
  }

  const [, errorChannel] = typeArguments(annotation);
  return errorChannel === undefined ? undefined : { annotation, errorChannel };
}

function exportedEffectErrorTargets(node: unknown): PublicEffectErrorTarget[] {
  if (typeof node !== "object" || node === null) {
    return [];
  }

  const exportNode = node as Node;
  if (
    exportNode.type !== "ExportNamedDeclaration" &&
    exportNode.type !== "ExportDefaultDeclaration"
  ) {
    return [];
  }

  return exportedFunctionValues(exportNode).flatMap(({ functionNode, declaredReturnType }) => {
    const target = effectErrorChannelTarget(functionNode, declaredReturnType);
    return target ? [target] : [];
  });
}

function exportedGenericEffectErrorTarget(node: unknown): unknown | undefined {
  return exportedEffectErrorTargets(node).find((target) => (
    isGenericErrorType(target.errorChannel)
  ))?.annotation;
}

type ErrorChannelShape = "Error" | "unknown" | "string" | "number" | "boolean";

function unwrappedType(node: unknown): unknown {
  let current = node;
  const seen = new WeakSet<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) return current;
    seen.add(current);

    if ((current as Node).type !== "TSParenthesizedType") return current;
    current = (current as Node).typeAnnotation;
  }

  return current;
}

function errorChannelShape(node: unknown): ErrorChannelShape | undefined {
  const type = unwrappedType(node);
  if (isGenericErrorType(type)) return "Error";

  if (typeof type !== "object" || type === null) return undefined;

  switch ((type as Node).type) {
    case "TSUnknownKeyword":
      return "unknown";
    case "TSStringKeyword":
      return "string";
    case "TSNumberKeyword":
      return "number";
    case "TSBooleanKeyword":
      return "boolean";
    default:
      return undefined;
  }
}

function mixedErrorChannelShapes(node: unknown): Set<ErrorChannelShape> {
  const type = unwrappedType(node);
  if (typeof type !== "object" || type === null || (type as Node).type !== "TSUnionType") {
    return new Set();
  }

  const types = (type as Node).types;
  if (!Array.isArray(types)) return new Set();

  return new Set(types.flatMap((member) => {
    const shape = errorChannelShape(member);
    return shape ? [shape] : [];
  }));
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

function isVariableAsAssertion(node: unknown, version: EffectVersion = 3): boolean {
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
      ((init as Node).typeAnnotation as Node).type !== "TSConstKeyword" &&
      !(version === 4 && ((init as Node).typeAnnotation as Node).type === "TSTypeReference" &&
        isIdentifier(((init as Node).typeAnnotation as Node).typeName, "const"))
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

function isOptionFromNullableNullishCoalesce(node: unknown, version: EffectVersion = 3): boolean {
  return (
    isMemberCall(node, "Option", version === 3 ? "fromNullable" : "fromNullishOr") &&
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
  return containsEffectMemberCall(node) && containsBranchSequencingCall(node);
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

function findEffectGenCall(node: unknown): unknown | undefined {
  return findNode(node, (child) => isEffectMemberCallNamed(child, "gen"));
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

function isObjectBranchCall(node: unknown, version: EffectVersion): boolean {
  return (
    isMatchValuePipeCall(node) ||
    (typeof node === "object" &&
      node !== null &&
      (node as Node).type === "CallExpression" &&
      (isMemberExpression((node as Node).callee, "Option", "match") ||
        isMemberExpression((node as Node).callee, version === 3 ? "Either" : "Result", "match")))
  );
}

function containsObjectBranchCall(node: unknown, version: EffectVersion, seen = new WeakSet<object>()): boolean {
  if (isObjectBranchCall(node, version)) {
    return true;
  }

  if (Array.isArray(node)) {
    return node.some((child) => containsObjectBranchCall(child, version, seen));
  }

  if (typeof node !== "object" || node === null) {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }
  seen.add(node);

  return Object.entries(node).some(([key, child]) => (
    key !== "parent" && containsObjectBranchCall(child, version, seen)
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

function isErrorLikeTypeName(node: unknown): boolean {
  return isIdentifier(node) && /(?:Error|Failure|Fault)$/i.test(node.name);
}

function isTagOnlyTypeShape(node: unknown): boolean {
  const members = typeMembers(node);
  return members.length === 1 && getPropertyName((members[0] as Node).key) === "_tag";
}

function isEmptyTaggedErrorPayload(node: unknown): boolean {
  const superTypeArguments = typeof node === "object" && node !== null
    ? (node as Node).superTypeArguments
    : undefined;
  const superParameters = typeof superTypeArguments === "object" && superTypeArguments !== null
    ? ((superTypeArguments as Node).params ?? (superTypeArguments as Node).arguments)
    : undefined;
  const parameters = Array.isArray(superParameters) ? superParameters : typeArguments(node);
  if (parameters.length === 0) {
    return true;
  }

  const payload = parameters[0];
  return (
    typeof payload === "object" &&
    payload !== null &&
    ((payload as Node).type === "TSObjectKeyword" ||
      ((payload as Node).type === "TSTypeLiteral" && typeMembers(payload).length === 0))
  );
}

function emptyErrorTagNode(node: unknown): unknown | undefined {
  if (typeof node !== "object" || node === null) {
    return undefined;
  }

  const declaration = node as Node;
  if (
    (declaration.type === "TSTypeAliasDeclaration" || declaration.type === "TSInterfaceDeclaration") &&
    isErrorLikeTypeName(declaration.id) &&
    isTagOnlyTypeShape(
      declaration.type === "TSTypeAliasDeclaration" ? declaration.typeAnnotation : declaration,
    )
  ) {
    return node;
  }

  if (
    declaration.type === "ClassDeclaration" &&
    isMemberCall(declaration.superClass, "Data", "TaggedError") &&
    isEmptyTaggedErrorPayload(declaration)
  ) {
    return node;
  }

  return undefined;
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

function isErrorLikeIdentifier(node: unknown): boolean {
  return isIdentifier(node) && /(?:error|err|cause|failure|reason)/i.test(node.name);
}

function isErrorMessageReference(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "MemberExpression") {
    return false;
  }

  const member = node as Node;
  return (
    member.computed !== true &&
    isIdentifier(member.property, "message") &&
    isErrorLikeIdentifier(member.object)
  );
}

function isStringifiedErrorMessage(node: unknown): boolean {
  if (isErrorMessageReference(node)) return true;
  if (typeof node !== "object" || node === null) return false;

  const expression = node as Node;
  if (expression.type === "BinaryExpression" && expression.operator === "+") {
    return isStringifiedErrorMessage(expression.left) || isStringifiedErrorMessage(expression.right);
  }

  return expression.type === "TemplateLiteral" && Array.isArray(expression.expressions) && (
    expression.expressions as unknown[]
  ).some((child) => isStringifiedErrorMessage(child));
}

function isEffectFailFromErrorMessage(node: unknown): boolean {
  return isEffectMemberCallNamed(node, "fail") && isStringifiedErrorMessage(firstArgument(node));
}

function isGenericErrorConstruction(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "NewExpression" &&
    isIdentifier((node as Node).callee, "Error")
  );
}

function isEffectFailWithGenericError(node: unknown): boolean {
  return isEffectMemberCallNamed(node, "fail") && isGenericErrorConstruction(firstArgument(node));
}

function errorHandlerCallbacks(node: unknown, operators: ReadonlySet<string>): unknown[] {
  if (!isEffectMemberCall(node)) return [];

  const property = ((node as Node).callee as Node).property;
  if (!isIdentifier(property) || !operators.has(property.name)) return [];

  return (node as Node & { arguments: unknown[] }).arguments.filter(isFunctionLike);
}

function plainCatchOperators(version: EffectVersion): ReadonlySet<string> {
  return version === 3 ? catchAllOperators : catchOperators;
}

function handlerReturnStatements(node: unknown, seen = new WeakSet<object>()): unknown[] {
  if (Array.isArray(node)) return node.flatMap((child) => handlerReturnStatements(child, seen));
  if (typeof node !== "object" || node === null || seen.has(node) || isFunctionLike(node)) return [];
  seen.add(node);
  if ((node as Node).type === "ReturnStatement") return [node];
  return Object.entries(node).flatMap(([key, child]) => key === "parent" ? [] : handlerReturnStatements(child, seen));
}

function catchAllGenericRethrow(node: unknown, version: EffectVersion): unknown | undefined {
  for (const callback of errorHandlerCallbacks(node, plainCatchOperators(version))) {
    const body = callbackBody(callback);
    if (isEffectFailWithGenericError(body)) return body;

    for (const returnNode of handlerReturnStatements(body)) {
      if (isEffectFailWithGenericError((returnNode as Node).argument)) {
        return (returnNode as Node).argument;
      }
    }
  }

  return undefined;
}

const modeledErrorOperators = new Set([
  "catchSome",
  "catchTag",
  "catchTags",
  "fail",
  "mapBoth",
  "mapError",
]);

function isModeledErrorOperation(node: unknown): boolean {
  if (!isEffectMemberCall(node)) return false;

  const property = ((node as Node).callee as Node).property;
  return isIdentifier(property) && modeledErrorOperators.has(property.name);
}

const legacyLogOnlyOperators = new Set(["catchAll", "tapError"]);

function logOnlyErrorHandler(node: unknown, version: EffectVersion): unknown | undefined {
  const callbacks = version === 3
    ? errorHandlerCallbacks(node, legacyLogOnlyOperators)
    : effectLogicCallbacks(node, version).filter(() =>
      /^catch/.test(String((((node as Node).callee as Node).property as Node).name)));
  for (const callback of callbacks) {
    const body = callbackBody(callback);
    const search = version === 3 ? findNode : findOwnCallbackNode;
    const log = search(body, isEffectLogCall);
    if (!log) continue;

    const modeled = search(body, (child) => isModeledErrorOperation(child) ||
      (version === 4 && (isEffectMemberCallNamed(child, "failCause") || isEffectMemberCallNamed(child, "die"))));
    if (!modeled) return log;
  }

  return undefined;
}

const catchAllOperators = new Set(["catchAll"]);
const catchOperators = new Set(["catch", "catchEager"]);
const expectedDomainStateNames = new Set(["NotFound", "Missing", "Empty", "None"]);

function isFallbackRecoveryValue(node: unknown): boolean {
  return (
    isNullLiteral(node) ||
    isUndefinedIdentifier(node) ||
    (isIdentifier(node) && /(?:fallback|default)/i.test(node.name))
  );
}

function isFallbackRecoveryEffect(node: unknown): boolean {
  return isEffectMemberCallNamed(node, "succeed") && isFallbackRecoveryValue(firstArgument(node));
}

function earlyCatchAllFallback(node: unknown, version: EffectVersion): unknown | undefined {
  for (const callback of errorHandlerCallbacks(node, plainCatchOperators(version))) {
    const body = callbackBody(callback);
    if (isFallbackRecoveryEffect(body)) return body;

    for (const returnNode of handlerReturnStatements(body)) {
      if (isFallbackRecoveryEffect((returnNode as Node).argument)) {
        return (returnNode as Node).argument;
      }
    }
  }

  return undefined;
}

function isExpectedDomainStateFailure(node: unknown): boolean {
  if (!isEffectMemberCallNamed(node, "fail")) return false;

  const argument = firstArgument(node);
  return isStringLiteral(argument) && expectedDomainStateNames.has(String((argument as Node).value));
}

function isDomainErrorConstruction(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "NewExpression") {
    return false;
  }

  const callee = (node as Node).callee;
  return isIdentifier(callee) && /(?:Error|Exception)$/.test(callee.name);
}

function isDomainExceptionThrow(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "ThrowStatement") {
    return false;
  }

  return isDomainErrorConstruction((node as Node).argument);
}

function findDomainExceptionInEffectLogic(node: unknown, version: EffectVersion): unknown | undefined {
  return findEffectLogicNode(node, version, isDomainExceptionThrow);
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

const defaultBoundaryPaths = [
  "bin/**", "scripts/**", "cli/**", "**/main.ts",
  "app/api/**/route.ts", "server/**", "*.test.ts", "*.spec.ts",
] as const;

const defaultTestPaths = ["**/*.test.*", "**/*.spec.*", "**/__tests__/**"] as const;

const defaultConfigPaths = ["**/config/**", "**/*Config.ts", "**/*ConfigLayer.ts"] as const;

const boundaryPathOptionsSchema = [{
  type: "object",
  properties: {
    boundaryPaths: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
}] as const;

const processEnvPathOptionsSchema = [{
  type: "object",
  properties: {
    boundaryPaths: { type: "array", items: { type: "string" } },
    configPaths: { type: "array", items: { type: "string" } },
  },
  additionalProperties: false,
}] as const;

function rulePathOptions(context: OxlintContext): Record<string, unknown> {
  const firstOption = context.options[0];
  return typeof firstOption === "object" && firstOption !== null
    ? firstOption as Record<string, unknown>
    : {};
}

function stringArrayOption(options: Record<string, unknown>, name: string): readonly string[] | undefined {
  const value = options[name];
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

function normalisePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/\/{2,}/g, "/").replace(/\/$/, "");
}

function globSegmentToRegExp(segment: string): string {
  return segment.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, "[^/]*");
}

function globToRegExp(pattern: string): RegExp {
  const normalisedPattern = normalisePath(pattern);
  if (normalisedPattern === "**") {
    return /^.*$/;
  }

  const segments = normalisedPattern.split("/");
  const startsWithGlobstar = segments[0] === "**";
  const firstSegment = startsWithGlobstar ? 1 : 0;
  let expression = startsWithGlobstar ? "^(?:.*/)?" : "(?:^|.*/)";

  for (let index = firstSegment; index < segments.length; index += 1) {
    const segment = segments[index];
    const isLastSegment = index === segments.length - 1;

    if (segment === "**") {
      expression += isLastSegment ? "(?:/.*)?" : "(?:/[^/]+)*";
      continue;
    }

    if (index > firstSegment) {
      expression += "/";
    }
    expression += globSegmentToRegExp(segment);
  }

  return new RegExp(`${expression}$`);
}

function pathMatchesPattern(filename: string, pattern: string): boolean {
  return globToRegExp(pattern).test(normalisePath(filename));
}

function boundaryPathsFor(context: OxlintContext): readonly string[] {
  return stringArrayOption(rulePathOptions(context), "boundaryPaths") ?? defaultBoundaryPaths;
}

function isBoundaryPath(context: OxlintContext): boolean {
  return boundaryPathsFor(context).some((pattern) => pathMatchesPattern(context.filename, pattern));
}

function isTestPath(context: OxlintContext): boolean {
  return defaultTestPaths.some((pattern) => pathMatchesPattern(context.filename, pattern));
}

function configPathsFor(context: OxlintContext): readonly string[] {
  return stringArrayOption(rulePathOptions(context), "configPaths") ?? defaultConfigPaths;
}

function isConfigPath(context: OxlintContext): boolean {
  return configPathsFor(context).some((pattern) => pathMatchesPattern(context.filename, pattern));
}

function isEffectEcosystemImport(source: string): boolean {
  return (
    source === "effect" ||
    source.startsWith("effect/") ||
    source === "@effect-atom/atom-react"
  );
}

function directTestCallback(node: unknown): Node | undefined {
  if (
    !isIdentifierCall(node, "it") &&
    !isIdentifierCall(node, "test") &&
    !isIdentifierCall(node, "specify") &&
    !isIdentifierCall(node, "bench")
  ) {
    return undefined;
  }

  const arguments_ = (node as Node & { arguments?: unknown[] }).arguments;
  const callback = arguments_?.at(-1);
  return isFunctionLike(callback) ? callback as Node : undefined;
}

function isPromiseRunExecution(node: unknown, version: EffectVersion): boolean {
  return isEffectMemberCallNamed(node, "runPromise") || (version === 4 &&
    typeof node === "object" && node !== null &&
    isEffectMemberCallNamed((node as Node).callee, "runPromiseWith") &&
    effectRunExecution(node, version)?.program !== undefined);
}

function discardedRunPromiseInTestCallback(callback: Node, version: EffectVersion = 3): Node | undefined {
  const body = callback.body;
  if (isPromiseRunExecution(body, version)) {
    return undefined;
  }

  if (
    typeof body !== "object" ||
    body === null ||
    (body as Node).type !== "BlockStatement" ||
    !Array.isArray((body as Node).body)
  ) {
    return undefined;
  }

  for (const statement of (body as Node & { body: unknown[] }).body) {
    if (
      typeof statement === "object" &&
      statement !== null &&
      (statement as Node).type === "ExpressionStatement" &&
      isPromiseRunExecution((statement as Node).expression, version)
    ) {
      return (statement as Node).expression as Node;
    }
  }

  return undefined;
}

function nodesInDirectTestCallback(
  callback: Node,
  predicate: (node: Node) => boolean,
): Node[] {
  const matches: Node[] = [];
  const seen = new WeakSet<object>();

  function visit(node: unknown, isRoot = false): void {
    if (Array.isArray(node)) {
      for (const child of node) {
        visit(child);
      }
      return;
    }

    if (typeof node !== "object" || node === null || seen.has(node)) {
      return;
    }
    seen.add(node);

    const candidate = node as Node;
    if (!isRoot && isFunctionLike(candidate)) {
      return;
    }
    if (predicate(candidate)) {
      matches.push(candidate);
    }

    for (const [key, child] of Object.entries(candidate)) {
      if (key !== "parent") {
        visit(child);
      }
    }
  }

  visit(callback, true);
  return matches;
}

function isEffectRunPromiseRejectsMember(node: unknown, version: EffectVersion = 3): node is Node {
  if (
    typeof node !== "object" ||
    node === null ||
    (node as Node).type !== "MemberExpression" ||
    (node as Node).computed === true ||
    !isIdentifier((node as Node).property, "rejects")
  ) {
    return false;
  }

  const expectation = (node as Node).object;
  if (!isIdentifierCall(expectation, "expect")) {
    return false;
  }

  const arguments_ = (expectation as Node).arguments;
  if (!Array.isArray(arguments_)) {
    return false;
  }

  const argument = arguments_[0];
  return isPromiseRunExecution(argument, version);
}

function isServiceDefaultReference(node: unknown): boolean {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as Node).type === "MemberExpression" &&
    (node as Node).computed !== true &&
    isIdentifier((node as Node).property, "Default")
  );
}

function isManualTestLayer(node: unknown): boolean {
  return isMemberCall(node, "Layer", "succeed") || isMemberCall(node, "Layer", "effect");
}

function manualLayersNextToServiceDefault(node: unknown): Node[] {
  if (!isMemberCall(node, "Layer", "provide")) {
    return [];
  }

  const arguments_ = (node as Node).arguments;
  if (!Array.isArray(arguments_) || !arguments_.some(isServiceDefaultReference)) {
    return [];
  }

  return arguments_.filter(isManualTestLayer) as Node[];
}

function importsEffectSchema(node: unknown): boolean {
  const source = getImportSource(node);
  if (source === "effect/Schema") {
    return true;
  }

  if (source !== "effect" || typeof node !== "object" || node === null) {
    return false;
  }

  const specifiers = (node as Node).specifiers;
  return Array.isArray(specifiers) && specifiers.some((specifier) => {
    if (typeof specifier !== "object" || specifier === null) {
      return false;
    }

    const item = specifier as Node;
    return item.type === "ImportSpecifier" && isIdentifier(item.imported, "Schema");
  });
}

function createEffectGatedStatementRule(
  visitorName: "IfStatement" | "SwitchStatement" | "ConditionalExpression",
  message: string | ((version: EffectVersion) => string),
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
            report(context, node, typeof message === "string" ? message : message(effectVersionFor(context.options)));
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
    const version = effectVersionFor(context.options);
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
            version === 3
              ? "Rule: avoid React state hooks. Why: they bypass the atom runtime and break reactive flow. Fix: use @effect-atom/atom-react instead."
              : "Rule: avoid React state hooks. Why: they bypass externally owned reactive state. Fix: pass explicit state as props or use a compatible reactive adapter at the UI boundary.",
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
  (version) => `Rule: avoid ternary expressions. Why: they hide control flow inside expressions. Fix: use Option.match/${version === 3 ? "Either" : "Result"}.match/Match.value or data combinators, then run one Effect pipeline.`,
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
    const version = effectVersionFor(context.options);
    return {
      ObjectExpression(node: any) {
        if (objectPropertyValues(node).some((value) => containsObjectBranchCall(value, version))) {
          report(
            context,
            node,
            `Rule: avoid Match/Option/${version === 3 ? "Either" : "Result"} inside object literals. Why: it hides the decision and invites workaround scaffolding. Fix: compute the value first (context), then build the object from named values with one flat decision.`,
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
    const version = effectVersionFor(context.options);
    return {
      CallExpression(node: any) {
        for (const returnNode of directArrowCallbackReturns(node, version)) {
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
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isEffectGeneratorCall(node, "fn", version)) {
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

function createCollectedEffectRule(
  find: (node: unknown, version: EffectVersion) => unknown[],
  message: string,
  visitorNames: string[],
) {
  return defineRule({
    create(context: OxlintContext) {
      const version = effectVersionFor(context.options);
      let imported = false;
      const candidates: object[] = [];
      const seen = new WeakSet<object>();
      const collect = (node: unknown) => {
        for (const target of find(node, version)) {
          if (typeof target !== "object" || target === null || seen.has(target)) continue;
          seen.add(target);
          candidates.push(target);
        }
      };
      return {
        ImportDeclaration(node: unknown) {
          const source = getImportSource(node);
          if (source && isEffectEcosystemImport(source)) imported = true;
        },
        ...Object.fromEntries(visitorNames.map(name => [name, collect])),
        "Program:exit"() {
          if (imported) for (const target of candidates) report(context, target, message);
        },
      };
    },
  });
}

const observabilityVisitors = ["CallExpression", "ClassDeclaration", "ClassExpression"];
const noConsoleInEffectFlow = createCollectedEffectRule(
  consoleCallsInEffectFlow,
  "Rule: avoid console.* in Effect flow. Why: console output bypasses Effect observability. Fix: use Effect.log* with structured context.",
  observabilityVisitors,
);

const noEffectLogWithoutStructuredContext = createCollectedEffectRule(
  (node, version) => {
    const options = serviceConstructionOptions(node, version);
    const implementation = options && serviceConstructionImplementation(options, version);
    return [...errorHandlerBodies(node, version), ...(implementation ? [implementation] : [])].flatMap(contextlessErrorLogs);
  },
  "Rule: add structured context to Effect.logError or Effect.logWarning. Why: static failure messages cannot be correlated. Fix: include an error or context object, or use Effect.annotateLogs(...).",
  observabilityVisitors,
);

const requireSpanOnPublicServiceMethod = createCollectedEffectRule(
  (node, version) => {
    const options = serviceConstructionOptions(node, version);
    return [
      ...exportedFunctionValues(node).map(operation => publicEffectOperationWithoutSpan(operation.functionNode, operation.declaredReturnType)),
      ...(options ? serviceMethodFunctions(options, version).map(serviceEffectOperationWithoutSpan) : []),
    ].filter(candidate => candidate !== undefined);
  },
  "Rule: add Effect.withSpan to public Effect operations. Why: service work needs trace boundaries. Fix: wrap the returned Effect with Effect.withSpan(...).",
  [...observabilityVisitors, "ExportNamedDeclaration", "ExportDefaultDeclaration"],
);

const noRunpromiseInNonAsyncTestBody = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;
    const candidates: Node[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!isTestPath(context)) {
          return;
        }

        const callback = directTestCallback(node);
        const candidate = callback && discardedRunPromiseInTestCallback(callback, version);
        if (candidate) {
          candidates.push(candidate);
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) {
          return;
        }

        for (const candidate of candidates) {
          report(
            context,
            candidate,
            "Rule: do not discard Effect.runPromise in a test body. Why: the test can finish before the Effect result is observed. Fix: await or return Effect.runPromise so the test framework observes completion.",
          );
        }
      },
    };
  },
});

const requireEffectFlipForErrorTest = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;
    const candidates: Node[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!isTestPath(context)) {
          return;
        }

        const callback = directTestCallback(node);
        if (callback) {
          candidates.push(...nodesInDirectTestCallback(callback, candidate => isEffectRunPromiseRejectsMember(candidate, version)));
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) {
          return;
        }

        for (const candidate of candidates) {
          report(
            context,
            candidate,
            "Rule: prefer Effect.flip for expected typed Effect failures in tests. Why: it turns the expected failure into a successful error value for structural assertions. Fix: flip the Effect, then assert the error _tag, message, and fields.",
          );
        }
      },
    };
  },
});

const noTestMockLayerWhenDefaultAvailable = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const candidates: Node[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (isTestPath(context)) {
          candidates.push(...manualLayersNextToServiceDefault(node));
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) {
          return;
        }

        for (const candidate of candidates) {
          report(
            context,
            candidate,
            "Rule: avoid a manual test layer beside an explicit service Default layer. Why: the test is already opting into the service's real default composition and the sibling mock can hide that contract. Fix: use the Default layer with its required infrastructure, or remove Default when a replacement is intentional.",
          );
        }
      },
    };
  },
});

const noNestedEffectGen = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const generator = getEffectGeneratorArgument(node, "gen", version);
        if (!hasEffectEcosystemImport || !generator) {
          return;
        }

        const nested = version === 3 ? findEffectGenCall(generator.body)
          : findOwnCallbackNode(generator.body, (child) => isEffectMemberCallNamed(child, "gen"));
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
    const version = effectVersionFor(context.options);
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

        const yieldNode = findYieldWithoutStarInEffectGen(node, version);
        if (yieldNode) {
          report(
            context,
            yieldNode,
            version === 3
              ? "Rule: use yield* inside Effect.gen. Why: plain yield returns an Effect value without delegating to the Effect interpreter. Fix: replace `yield Effect.x` with `yield* Effect.x`."
              : "Rule: use yield* inside Effect.gen. Why: delegation preserves the yielded Effect's result typing and keeps workflow style consistent. Fix: replace `yield Effect.x` with `yield* Effect.x`.",
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
    const version = effectVersionFor(context.options);
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

        const workflow = workflowSequencingPipeline(node, version);
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

const preferFlowForPurePipeline = defineRule({
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

        const tower = preferFlowForPurePipelineNode(node);
        if (tower) {
          report(
            context,
            tower,
            "Rule: prefer flow for a deep pure call pipeline. Why: nested transformation towers hide the data pipeline and make reuse difficult. Fix: name the pure steps and compose them with flow, or keep the pipeline short.",
          );
        }
      },
    };
  },
});

const noBusinessLogicInPipe = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
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

        const callback = businessLogicInPipeCallback(node, version);
        if (callback) {
          report(
            context,
            callback,
            "Rule: keep business workflow logic out of Effect.pipe callbacks. Why: branching, service lookup, and multi-step effects are hard to read as decoration. Fix: move the workflow into Effect.gen and reserve pipe for behavior around the completed effect.",
          );
        }
      },
    };
  },
});

const preferPipeForBehavior = createVersionedEffectCallbackRule(
  staticBehaviorCall,
  () => "Rule: prefer .pipe() for behavior decoration. Why: retry, timeout, spans, logging, recovery, DI, and value transforms decorate an existing effect. Fix: write `program.pipe(Effect.retry(policy))` instead of `Effect.retry(program, policy)`.",
);
const preferDecoratedEffectBeforeGen = createVersionedEffectCallbackRule(
  repeatedDecoratedYieldInEffectGen,
  () => "Rule: extract decorated effects before Effect.gen. Why: repeated retry/timeout/span/logging decorators inside generator yields bury behavior policy in workflow steps. Fix: name the decorated effects first, then yield the workflow story.",
);
const noWorkflowInBehaviorPipe = createVersionedEffectCallbackRule(
  workflowInBehaviorPipe,
  () => "Rule: avoid workflow sequencing inside behavior pipes. Why: behavior pipes should answer how an effect behaves, not hide the workflow story. Fix: move multi-step sequencing into Effect.gen and keep retry/timeout/spans/logging as decorators around named effects.",
);
const noMixedPillarFunction = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    function check(node: any) {
      const mixedFunction = mixedPillarFunctionNode(node, version);
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
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        const cleverExpression = cleverEffectExpressionNode(node, version);
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
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && (isContextTagCall(node) || (version === 4 && isEffectMemberCallNamed(node, "Service")))) {
          report(
            context,
            node,
            version === 3
              ? "Rule: prefer Effect.Service. Fix: replace Context.Tag service definitions."
              : "Rule: prefer Context.Service. Fix: migrate legacy Context.Tag, Context.GenericTag or Effect.Service definitions to Context.Service; construct implementations with make and explicit Layer wiring where needed.",
          );
        }
      },
    };
  },
});

const noLayerProvideInServiceDefinition = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ClassDeclaration(node: any) {
        if (version === 4) return;
        const options = effectServiceClassOptions(node);
        if (hasEffectEcosystemImport && options && containsLayerProvideCall(options)) {
          report(
            context,
            options,
            "Rule: do not call Layer.provide inside Effect.Service. Fix: move layer wiring to app/test boundaries.",
          );
        }
      },
      CallExpression(node: any) {
        if (version === 3 || !hasEffectEcosystemImport) return;
        const options = effectServiceOptionsObject(node, version);
        const make = options && objectPropertyValue(options, "make");
        if (make && containsLayerProvideCall(make)) {
          report(context, options, "Rule: do not assemble layers inside Context.Service make. Fix: keep make focused on constructing the implementation and compose Layer.provide at app/test boundaries.");
        }
      },
    };
  },
});

const requireServiceAccessors = defineRule({
  create(context: OxlintContext) {
    if (effectVersionFor(context.options) === 4) return {};
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
    if (effectVersionFor(context.options) === 4) return {};
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
        const provide = hasEffectEcosystemImport ? inlineLayerProvideInProgram(node, effectVersionFor(context.options)) : undefined;
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
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      ClassDeclaration(node: any) {
        if (version === 4) return;
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
      CallExpression(node: any) {
        if (version === 3 || !hasEffectEcosystemImport) return;
        const options = effectServiceOptionsObject(node, version);
        const method = options && promiseReturningServiceMethod(options, version);
        if (method) report(context, method, "Rule: return Effect from service methods. Fix: expose an Effect-returning Context.Service method and keep Promise interop inside an Effect adapter.");
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
    const sequencing = effectVersionFor(context.options) === 3 ? "zipRight" : "andThen";
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
          isEffectMemberCallNamed(node, sequencing) &&
          containsWrapperSideEffect(firstArgument(node))
        ) {
          report(
            context,
            node,
            `Rule: avoid Effect.${sequencing} for side effects. Why: it hides side effects and discards values. Fix: use explicit pipeline steps that return real values with Effect.flatMap, Effect.andThen, or Effect.tap.`,
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

function createVersionedEffectCallbackRule(
  find: (node: unknown, version: EffectVersion, context: OxlintContext) => unknown,
  message: (version: EffectVersion) => string,
  multiple = false,
  boundary = false,
  visitorNames = ["CallExpression"],
) {
  return defineRule({
    ...(boundary ? { meta: { schema: boundaryPathOptionsSchema } } : {}),
    create(context: OxlintContext) {
      const version = effectVersionFor(context.options);
      let imported = false;
      const reported = multiple ? new WeakSet<object>() : undefined;
      const visit = (node: unknown) => {
        const target = imported && (!boundary || !isBoundaryPath(context)) ? find(node, version, context) : undefined;
        if (!target) return;
        for (const entry of multiple ? target as object[] : [target]) {
          if (reported?.has(entry as object)) continue;
          reported?.add(entry as object);
          report(context, entry, message(version));
        }
      };
      return {
        ImportDeclaration(node: unknown) {
          const source = getImportSource(node);
          if (source && isEffectEcosystemImport(source)) imported = true;
        },
        ...Object.fromEntries(visitorNames.map(name => [name, visit])),
      };
    },
  });
}

const noAsyncEffectCombinatorCallback = createVersionedEffectCallbackRule(
  findAsyncEffectCombinatorCallback,
  (version) => `Rule: avoid async callbacks in Effect combinators. Why: async callbacks return Promises and bypass Effect failure, interruption, and tracing semantics. Fix: return an Effect and compose with Effect.flatMap/${version === 3 ? "fromPromise" : "tryPromise"} at the boundary.`,
);
const noThrowInEffectLogic = createVersionedEffectCallbackRule(
  (node, version) => findEffectStatement(node, version, "ThrowStatement"),
  (version) => `Rule: avoid throw inside Effect logic. Why: thrown exceptions ${version === 3 ? "bypass typed Effect error channels and interruption semantics" : "become defects rather than typed domain failures"}. Fix: return Effect.fail with a structured tagged error.`,
);
const noOrDieOutsideBoundary = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
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

        const target = findEffectOrDieOutsideBoundary(node, version);
        if (target) {
          report(
            context,
            target,
            `Rule: avoid Effect.orDie outside runtime boundaries. Why: converting typed failures into defects hides recoverable domain errors. Fix: keep typed errors in domain logic and reserve ${version === 3 ? "orDie/orDieWith" : "orDie"} for explicit application boundaries.`,
          );
        }
      },
    };
  },
});

const noSwallowedCatchAll = createVersionedEffectCallbackRule(
  getSwallowedCatchAllHandler,
  (version) => `Rule: avoid swallowing errors in ${version === 3 ? "catchAll" : "catch/catchEager"}. Why: succeed/void recovery can hide failures without telemetry or typed recovery. Fix: log, re-fail with a structured error, or recover through an explicit domain branch.`,
);

const noEmptyErrorTag = defineRule({
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
        if (hasEffectEcosystemImport && emptyErrorTagNode(node)) {
          report(
            context,
            node,
            "Rule: give tagged domain errors meaningful payloads. Why: a tag-only error loses operation context and recovery detail. Fix: add structured fields or use a more appropriate expected-state model when no context is needed.",
          );
        }
      },
      TSInterfaceDeclaration(node: any) {
        if (hasEffectEcosystemImport && emptyErrorTagNode(node)) {
          report(
            context,
            node,
            "Rule: give tagged domain errors meaningful payloads. Why: a tag-only error loses operation context and recovery detail. Fix: add structured fields or use a more appropriate expected-state model when no context is needed.",
          );
        }
      },
      ClassDeclaration(node: any) {
        if (hasEffectEcosystemImport && emptyErrorTagNode(node)) {
          report(
            context,
            node,
            "Rule: give tagged domain errors meaningful payloads. Why: a tag-only error loses operation context and recovery detail. Fix: add structured fields or use a more appropriate expected-state model when no context is needed.",
          );
        }
      },
    };
  },
});

const noEarlyCatchallNull = defineRule({
  meta: { schema: boundaryPathOptionsSchema },
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && !isBoundaryPath(context)) {
          const target = earlyCatchAllFallback(node, version);
          if (target) {
            report(
              context,
              target,
              "Rule: avoid catching errors too early. Why: null, undefined, or fallback recovery inside domain logic forces higher layers to handle an untyped absence. Fix: let the typed error propagate and recover at a meaningful boundary with catchTag or an explicit Option result.",
            );
          }
        }
      },
    };
  },
});

const noExpectedStateAsError = createVersionedEffectCallbackRule(
  (node) => isExpectedDomainStateFailure(node) ? node : undefined,
  (version) => `Rule: model expected domain states as data. Why: failing with NotFound, Missing, Empty, or None overloads the error channel and encourages broad ${version === 3 ? "catchAll" : "catch"} recovery. Fix: return Option, ${version === 3 ? "Either" : "Result"}, or a tagged result for expected state and reserve Effect.fail for exceptional failures.`,
);
const noExceptionDomainError = createVersionedEffectCallbackRule(
  findDomainExceptionInEffectLogic,
  () => "Rule: do not use exceptions for domain errors. Why: throw new *Error inside Effect logic bypasses typed failure channels, supervision, and structured recovery. Fix: return Effect.fail with a Data.TaggedError or structured domain error.",
);
const noEffectFailErrorMessage = defineRule({
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
        if (hasEffectEcosystemImport && isEffectFailFromErrorMessage(node)) {
          report(
            context,
            node,
            "Rule: preserve structured errors instead of strings. Why: converting error.message to a string loses the original tag, cause, and context. Fix: fail with the error or map it to a structured Data.TaggedError.",
          );
        }
      },
    };
  },
});

const noCatchallGenericRethrow = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) return;

        const target = catchAllGenericRethrow(node, version);
        if (target) {
          report(
            context,
            target,
            `Rule: do not rethrow generic Error from ${version === 3 ? "catchAll" : "catch"}. Why: ${version === 3 ? "catchAll" : "catch"} should preserve or model the original failure instead of erasing its domain type. Fix: use mapError, catchTag, or Effect.fail with a structured tagged error and cause.`,
          );
        }
      },
    };
  },
});

const noLogOnlyErrorHandling = createVersionedEffectCallbackRule(
  logOnlyErrorHandler,
  () => "Rule: do not stop at logging an Effect error. Why: logs alone do not preserve a typed failure or define recovery ownership. Fix: map or re-fail with a structured domain error after adding observability.",
);
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

const noTryCatchInEffectLogic = createVersionedEffectCallbackRule(
  (node, version) => findEffectStatement(node, version, "TryStatement"),
  (version) => `Rule: avoid try/catch inside Effect logic. Why: it bypasses typed error channels and can miss interruption/cause semantics. Fix: use Effect.try, Effect.${version === 3 ? "catchAll" : "catch"}, Effect.catchTag, or typed error combinators.`,
);
const noPromiseApiInEffectLogic = createVersionedEffectCallbackRule(
  findPromiseApiInEffectLogic,
  () => "Rule: avoid Promise APIs inside Effect logic. Why: Promise APIs bypass Effect scheduling, typed errors, cancellation, and tracing. Fix: use Effect.all, Effect.tryPromise, or move Promise interop to a boundary adapter.",
);
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
    const service = effectVersionFor(context.options) === 3 ? "an Effect.Service" : "a Context.Service";
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
            `Rule: do not inline runtime provisioning inside local helper Effect code. Why: \`yield* SomeRuntime.pipe(Effect.provide(SomeRuntimeLive))\` and equivalent inline provide chains hide dependency assembly instead of owning it at ${service} boundary or one exported Effect boundary. Fix: declare the live dependency on the owning service or provide it once at the exported boundary, then \`yield*\` the runtime or service directly inside the body.`,
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

function createPublicEffectErrorChannelRule(
  context: OxlintContext,
  matches: (target: PublicEffectErrorTarget) => boolean,
  message: string,
) {
  let hasEffectEcosystemImport = false;

  const visitExport = (node: any) => {
    if (!hasEffectEcosystemImport) return;

    for (const target of exportedEffectErrorTargets(node)) {
      if (matches(target)) {
        report(context, target.annotation, message);
      }
    }
  };

  return {
    ImportDeclaration(node: any) {
      const source = getImportSource(node);
      if (source && isEffectEcosystemImport(source)) {
        hasEffectEcosystemImport = true;
      }
    },
    ExportNamedDeclaration: visitExport,
    ExportDefaultDeclaration: visitExport,
  };
}

const noErrorAsPublicEffectError = defineRule({
  create(context: OxlintContext) {
    return createPublicEffectErrorChannelRule(
      context,
      ({ errorChannel }) => isGenericErrorType(errorChannel),
      "Rule: model public errors as tagged Effect failures, not generic Error. Why: Error hides recovery semantics and domain context. Fix: return a domain-specific Data.TaggedError or tagged error union.",
    );
  },
});

const noUnknownPublicErrorChannel = defineRule({
  create(context: OxlintContext) {
    return createPublicEffectErrorChannelRule(
      context,
      ({ errorChannel }) => errorChannelShape(errorChannel) === "unknown",
      "Rule: do not expose unknown as a public Effect error channel. Why: callers cannot recover by tag or type. Fix: return a tagged domain error union with operation-specific context.",
    );
  },
});

const noMixedEffectErrorShapes = defineRule({
  create(context: OxlintContext) {
    return createPublicEffectErrorChannelRule(
      context,
      ({ errorChannel }) => mixedErrorChannelShapes(errorChannel).size > 1,
      "Rule: keep the public Effect error channel structurally consistent. Why: mixing Error, primitives, and unknown makes recovery ambiguous. Fix: map failures to one tagged error union.",
    );
  },
});

const noModelOverlayCast = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      VariableDeclaration(node: any) {
        if (hasEffectEcosystemImport && isVariableAsAssertion(node, version)) {
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
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && isOptionFromNullableNullishCoalesce(node, version)) {
          report(
            context,
            node,
            `Rule: avoid nullish re-wrap inside Option.${version === 3 ? "fromNullable" : "fromNullishOr"}. Why: \`x ?? null\` and \`x ?? undefined\` add noise and hide source shape. Fix: pass the source directly to Option.${version === 3 ? "fromNullable" : "fromNullishOr"}.`,
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
    const version = effectVersionFor(context.options);
    return {
      CallExpression(node: any) {
        if (isEffectMemberCallNamed(node, "succeed") && isStringLiteral(firstArgument(node))) {
          report(
            context,
            node,
            `Rule: avoid returning string tokens. Why: it encodes control flow and forces defensive branching. Fix: return domain values (Option/${version === 3 ? "Either" : "Result"}/tagged unions) or real Effect results instead.`,
          );
        }
      },
    };
  },
});

const noStringSentinelConst = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    return {
      VariableDeclaration(node: any) {
        if (isStringSentinelConst(node)) {
          report(
            context,
            node,
            `Rule: avoid string status constants. Why: they encode control flow and force defensive branching. Fix: use tagged unions, Option/${version === 3 ? "Either" : "Result"}, or meaningful domain values instead of string tokens.`,
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

const nodeFsImportSources = new Set(["fs", "node:fs", "fs/promises", "node:fs/promises"]);

const nodeBuiltinImportSources = new Set([
  "assert", "assert/strict", "async_hooks", "buffer", "child_process", "cluster", "console",
  "constants", "crypto", "dgram", "diagnostics_channel", "dns", "dns/promises", "domain",
  "events", "fs", "fs/promises", "http", "http2", "https", "inspector", "inspector/promises",
  "module", "net", "os", "path", "path/posix", "path/win32", "perf_hooks", "process",
  "punycode", "querystring", "readline", "readline/promises", "repl", "stream",
  "stream/consumers", "stream/promises", "stream/web", "string_decoder", "sys", "timers",
  "timers/promises", "tls", "trace_events", "tty", "url", "util", "util/types", "v8", "vm",
  "wasi", "worker_threads", "zlib",
]);

function isNodeBuiltinImport(source: string): boolean {
  return source.startsWith("node:") || nodeBuiltinImportSources.has(source);
}

function isMemberExpressionNode(node: unknown): node is Node {
  return (
    typeof node === "object" &&
    node !== null &&
    ((node as Node).type === "MemberExpression" || (node as Node).type === "OptionalMemberExpression")
  );
}

function isNamedMemberProperty(member: Node, name: string): boolean {
  return (
    (member.computed !== true && isIdentifier(member.property, name)) ||
    (member.computed === true && isStringLiteral(member.property) && (member.property as Node).value === name)
  );
}

function isProcessEnvMember(node: unknown): boolean {
  return (
    isMemberExpressionNode(node) &&
    isIdentifier(node.object, "process") &&
    isNamedMemberProperty(node, "env")
  );
}

function isProcessEnvRead(node: unknown): boolean {
  if (!isMemberExpressionNode(node)) return false;
  if (isProcessEnvMember(node.object)) return true;
  if (!isProcessEnvMember(node)) return false;

  const parent = node.parent;
  return !isMemberExpressionNode(parent) || parent.object !== node;
}

function isProcessEnvWriteTarget(node: unknown): boolean {
  if (!isMemberExpressionNode(node) || typeof node.parent !== "object" || node.parent === null) {
    return false;
  }

  const parent = node.parent as Node;
  return parent.type === "AssignmentExpression" && parent.left === node;
}

const noNodePlatformInSharedCode = defineRule({
  meta: { schema: boundaryPathOptionsSchema },
  create(context: OxlintContext) {
    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isNodeBuiltinImport(source) && !isBoundaryPath(context)) {
          report(
            context,
            node,
            "Rule: avoid Node platform imports in shared code. Why: reusable modules must not require a Node runtime. Fix: move the import behind a configured application boundary or an Effect platform service.",
          );
        }
      },
    };
  },
});

const noProcessEnvDirectRead = defineRule({
  meta: { schema: processEnvPathOptionsSchema },
  create(context: OxlintContext) {
    return {
      MemberExpression(node: any) {
        if (
          isProcessEnvRead(node) &&
          !isProcessEnvWriteTarget(node) &&
          !isBoundaryPath(context) &&
          !isConfigPath(context)
        ) {
          report(
            context,
            node,
            "Rule: avoid direct process.env reads outside configuration boundaries. Why: ambient configuration leaks runtime coupling into domain code. Fix: decode environment values in a configured Config service or Layer and depend on that service.",
          );
        }
      },
    };
  },
});

function getNodeFsRequireSource(node: unknown): string | undefined {
  if (
    typeof node !== "object" ||
    node === null ||
    (node as Node).type !== "CallExpression" ||
    !isIdentifier((node as Node).callee, "require")
  ) {
    return undefined;
  }

  const argument = ((node as Node).arguments as unknown[] | undefined)?.[0];
  if (!isStringLiteral(argument)) return undefined;

  const source = (argument as Node).value as string;
  return nodeFsImportSources.has(source) ? source : undefined;
}

const noNodeFsInEffectCode = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    let functionDepth = 0;
    const nodeFsReferences: Array<{ node: unknown; source: string }> = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
        if (source && nodeFsImportSources.has(source)) {
          nodeFsReferences.push({ node, source });
        }
      },
      FunctionDeclaration() {
        functionDepth += 1;
      },
      "FunctionDeclaration:exit"() {
        functionDepth -= 1;
      },
      FunctionExpression() {
        functionDepth += 1;
      },
      "FunctionExpression:exit"() {
        functionDepth -= 1;
      },
      ArrowFunctionExpression() {
        functionDepth += 1;
      },
      "ArrowFunctionExpression:exit"() {
        functionDepth -= 1;
      },
      CallExpression(node: any) {
        if (functionDepth !== 0) return;
        const source = getNodeFsRequireSource(node);
        if (source) nodeFsReferences.push({ node, source });
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) return;
        for (const { node, source } of nodeFsReferences) {
          report(context, node, `Rule: avoid Node fs imports or require calls in Effect code (${source}). Why: direct Node filesystem APIs make reusable Effect modules platform-specific. Fix: move filesystem work behind an Effect platform service at the application boundary.`);
        }
      },
    };
  },
});

const noHiddenEffectExecution = defineRule({
  meta: { schema: boundaryPathOptionsSchema },
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;
    const runCalls: unknown[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
      },
      CallExpression(node: any) {
        if (isEffectRunCall(node, version)) runCalls.push(node);
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport || isBoundaryPath(context)) return;
        for (const node of runCalls) {
          report(
            context,
            (node as Node).callee,
            "Rule: avoid hidden Effect execution. Why: Effect.run* fixes runtime ownership inside reusable code. Fix: return the Effect and execute it from a configured application, CLI, worker, route, or test boundary.",
          );
        }
      },
    };
  },
});

const boundaryEffectHandlingMethods = new Set([
  "try",
  "tryPromise",
  "mapError",
  "catchAll",
  "catchTag",
  "catchTags",
]);

function containsBoundaryEffectHandling(
  node: unknown,
  version: EffectVersion,
): boolean {
  return findNode(node, candidate => {
    if (isEffectRunCall(candidate, version)) return true;
    if (!isEffectMemberCall(candidate)) return false;
    const property = ((candidate as Node).callee as Node).property;
    if (!isIdentifier(property)) return false;
    return version === 3 ? boundaryEffectHandlingMethods.has(property.name)
      : (property.name !== "catchAll" && boundaryEffectHandlingMethods.has(property.name)) ||
        (effect4RecoveryOperatorNames as readonly string[]).includes(property.name) || property.name === "catchNoSuchElement";
  }) !== undefined;
}

const noBoundaryTryCatchWithoutEffectMap = defineRule({
  meta: { schema: boundaryPathOptionsSchema },
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    return {
      TryStatement(node: any) {
        if (!node.handler || !isBoundaryPath(context) || containsBoundaryEffectHandling(node, version)) {
          return;
        }

        report(
          context,
          node,
          version === 3
            ? "Rule: map failures through Effect at application boundaries. Why: imperative try/catch hides typed failure handling and recovery policy. Fix: use Effect.try, Effect.tryPromise, mapError, catchAll, or execute a mapped Effect program."
            : "Rule: map failures through Effect at application boundaries. Why: imperative try/catch hides typed failure handling and recovery policy. Fix: use Effect.try, Effect.tryPromise, mapError, Effect.catch, or execute a mapped Effect program.",
        );
      },
    };
  },
});

const noJsonParseWithoutSchema = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;
    let hasEffectSchemaImport = false;
    const jsonParseCalls: unknown[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
        if (importsEffectSchema(node)) hasEffectSchemaImport = true;
      },
      CallExpression(node: any) {
        if (isMemberExpression(node.callee, "JSON", "parse")) {
          jsonParseCalls.push(node);
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport || hasEffectSchemaImport) return;
        for (const node of jsonParseCalls) {
          report(
            context,
            node,
            version === 3
              ? "Rule: avoid JSON.parse without an Effect Schema boundary. Why: parsed JSON is unknown input and unchecked casts hide malformed data. Fix: decode unknown input with Schema.decodeUnknown at the boundary."
              : "Rule: avoid JSON.parse without an Effect Schema boundary. Why: parsed JSON is unknown input and unchecked casts hide malformed data. Fix: use Schema.fromJsonString with Schema.decodeUnknownEffect at the boundary.",
          );
        }
      },
    };
  },
});

const noDateNowInEffect = defineRule({
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;
    const collectedDateCalls = new WeakSet<object>();
    const dateNowCalls: unknown[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
      },
      CallExpression(node: any) {
        if (!isEffectConstructionBoundary(node, version)) return;

        for (const dateNowCall of findNodes(node.arguments, isDateNowCall)) {
          if (collectedDateCalls.has(dateNowCall as object)) continue;
          collectedDateCalls.add(dateNowCall as object);
          dateNowCalls.push(dateNowCall);
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) return;
        for (const dateNowCall of dateNowCalls) {
          report(
            context,
            dateNowCall,
            "Rule: avoid Date.now inside Effect logic. Why: direct wall-clock reads make programs nondeterministic and difficult to test. Fix: obtain time through Effect Clock or DateTime at the boundary.",
          );
        }
      },
    };
  },
});

const noNewDateInDomainLogic = defineRule({
  meta: { schema: boundaryPathOptionsSchema },
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const dateConstructions: unknown[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) hasEffectEcosystemImport = true;
      },
      NewExpression(node: any) {
        if (isIdentifier(node.callee, "Date")) dateConstructions.push(node);
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport || isBoundaryPath(context)) return;
        for (const node of dateConstructions) {
          report(
            context,
            node,
            "Rule: avoid new Date in Effect domain logic. Why: direct wall-clock construction makes domain behaviour nondeterministic and difficult to test. Fix: obtain time through Effect Clock or model time at the boundary.",
          );
        }
      },
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

function createForbiddenMemberCallRule(objectName: string, propertyName: string, message: string, legacyOnly = false) {
  return defineRule({
    create(context: OxlintContext) {
      if (legacyOnly && effectVersionFor(context.options) === 4) return {};
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
  true,
);

const noRunEffectOutsideBoundary = defineRule({
  meta: { schema: boundaryPathOptionsSchema },
  create(context: OxlintContext) {
    const version = effectVersionFor(context.options);
    let hasEffectEcosystemImport = false;

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      CallExpression(node: any) {
        if (hasEffectEcosystemImport && !isBoundaryPath(context) && isEffectRunCall(node, version)) {
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
  true,
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
    const version = effectVersionFor(context.options);
    return {
      VariableDeclaration(node: any) {
        for (const declaration of node.declarations ?? []) {
          const message = getFlatMapLadderMessage(declaration.init, version);
          if (message) {
            report(context, declaration.init, message);
          }
        }
      },
      ReturnStatement(node: any) {
        const message = getFlatMapLadderMessage(node.argument, version);
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
    if (effectVersionFor(context.options) === 4) return {};
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
            "Rule: avoid unbounded Effect.all policies over mapped collections. Why: an explicit concurrency option makes scheduling policy visible; omission defaults to sequential execution, not unlimited parallelism. Fix: pass an explicit `{ concurrency: n }` option or use a bounded batching strategy.",
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
        const version = effectVersionFor(context.options);
        const fork = hasEffectEcosystemImport ? discardedFork(node.expression, version) : undefined;
        if (fork) {
          report(
            context,
            fork,
            version === 3
              ? "Rule: avoid fire-and-forget Effect.fork. Why: detached fibers hide failure, interruption, and ownership. Fix: bind the fiber and join/await/interrupt it, or use Effect.forkScoped / Effect.forkIn with an explicit scope."
              : "Rule: avoid discarded Effect.forkChild / Effect.forkDetach constructions or handles. Why: a bare construction is lazy and starts no work; yielding then discarding the fiber loses explicit observation. Child fibers follow parent lifetime, detached fibers do not. Fix: retain and join/await/interrupt the fiber, or use forkScoped / forkIn with explicit scope ownership.",
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

      const version = effectVersionFor(context.options);
      const fork = version === 3 ? containsEffectForkCall((node as Node).body)
        : findOwnCallbackNode((node as Node).body, child => v4ForkConstruction(child) !== undefined);
      if (fork) {
        report(
          context,
          version === 4 ? v4ForkConstruction(fork) : fork,
          version === 3
            ? "Rule: avoid Effect.fork inside loops. Why: loop-spawned fibers create unbounded concurrency and unclear ownership. Fix: use Effect.forEach / Effect.all with an explicit concurrency limit or a scoped supervisor."
            : "Rule: avoid Effect.forkChild / Effect.forkDetach inside loops. Why: per-item forks lack a collection-wide concurrency budget even when handles are retained. Fix: use Effect.forEach / Effect.all with an explicit concurrency limit; preserve observation and lifetime ownership.",
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
        const version = effectVersionFor(context.options);
        if (hasEffectEcosystemImport && isEffectRaceWithoutCleanup(node, version)) {
          report(
            context,
            node,
            version === 3
              ? "Rule: avoid Effect.race without loser cleanup. Why: racing effects without ensuring/scoped cleanup can leak losing work or resources. Fix: wrap raced effects with Effect.ensuring/acquireRelease or use a scoped race boundary."
              : "Rule: require visible cleanup ownership around Effect races. Why: race operators interrupt losers, but resource release still needs a finalizer or scope. Fix: expose ensuring/acquireRelease or a scoped race boundary; race/raceAll select success, raceFirst/raceAllFirst select first completion.",
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
    const v4Bindings = new Set<any>();

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      VariableDeclarator(node: any) {
        if (effectVersionFor(context.options) === 4) {
          if (isIdentifier(node.id) && node.init?.type === "YieldExpression" && v4ForkConstruction(node.init.argument)) v4Bindings.add(node);
          return;
        }
        const name = forkedFiberVariableName(node);
        if (name) {
          forkedFibers.set(name, node);
        }
      },
      CallExpression(node: any) {
        if (effectVersionFor(context.options) === 4) return;
        const name = observedFiberVariableName(node);
        if (name) {
          observedFibers.add(name);
        }
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport) {
          return;
        }

        if (effectVersionFor(context.options) === 4) {
          for (const node of v4Bindings) {
            const variables = context.sourceCode?.getDeclaredVariables(node) ?? [];
            if (!variables.some(variable => variable.references.some(reference => v4FiberObservedReference(reference.identifier)))) {
              report(context, node, "Rule: avoid unobserved forked fibers. Why: yielded child/detached handles need explicit observation or ownership transfer. Fix: join/await/interrupt the same lexical binding, return it to its owner, or use scoped fork APIs. This checks reference syntax, not whether observation executes.");
            }
          }
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

const noUnboundedConcurrentRetry = createVersionedEffectCallbackRule(
  node => isUnboundedConcurrentRetry(node) ? node : undefined,
  () => "Rule: avoid unbounded concurrent retry policies. Why: inline retries need an explicit collection scheduling policy; omitted concurrency defaults to sequential execution, not unlimited parallelism. Fix: add an explicit concurrency limit and a bounded retry/backoff policy. This heuristic checks option presence, not its bound or retry count.",
);
const noBlockingCallInEffect = createVersionedEffectCallbackRule(
  findBlockingSyncCallInEffectLogic,
  version => `Rule: avoid blocking sync calls inside Effect logic. Why: synchronous I/O or CPU work blocks the executing JavaScript thread; wrapping it in a Promise does not offload it. Fix: use genuinely asynchronous platform APIs via Effect.${version === 4 ? "callback" : "async"}/tryPromise, or a dedicated worker for blocking work. Sync suffix recognition is a heuristic.`,
);

const noPromiseConcurrencyInEffect = createVersionedEffectCallbackRule(
  findPromiseConcurrencyInEffectLogic,
  version => `Rule: avoid Promise concurrency APIs inside Effect logic. Why: raw Promise aggregation does not own interruption of its underlying operations. Fix: use bounded Effect.all/forEach, Effect.${version === 4 ? "result" : "either"} for settled outcomes, raceFirst for first completion or race for first success, with signal-aware boundary adapters. Preserve application error semantics explicitly.`,
);

const noSharedMutableStateAcrossFibers = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const mutableNames = new Set<string>();
    const declarations: any[] = [];
    const workNodes: unknown[] = [];

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

        if (effectVersionFor(context.options) === 4) {
          declarations.push(node);
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

        if (effectVersionFor(context.options) === 4) {
          const work = v4SharedStateWork(node);
          if (work) workNodes.push(work);
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
      "Program:exit"() {
        if (!hasEffectEcosystemImport || effectVersionFor(context.options) !== 4) return;
        const variables = declarations.flatMap(node => context.sourceCode.getDeclaredVariables(node));
        for (const work of workNodes) {
          const mutation = lexicalWorkMutation(work, variables);
          if (mutation) report(context, mutation, "Rule: avoid mutating shared state across fibers. Why: outer let/var writes in child/detached or collection work couple workers through mutable state. Fix: use Ref updates or aggregate immutable results. This checks lexical inline work, not execution or a proven data race; collections default to sequential execution.");
        }
      },
    };
  },
});

const noTimeoutWithNoninterruptiblePromise = createVersionedEffectCallbackRule(
  noninterruptiblePromiseTimeoutNode,
  () => "Rule: avoid timeout around noninterruptible Promise effects. Why: Effect timeout interrupts the wrapper, but the underlying operation stops only if it observes cancellation. Fix: accept and forward AbortSignal in the adapter to an API that honours it. Parameter presence is a syntax heuristic, not proof of cancellation.",
);
const noUninterruptibleConcurrentRegion = createVersionedEffectCallbackRule(
  (node, version) => isUninterruptibleConcurrentRegion(node, version) ? node : undefined,
  () => "Rule: avoid uninterruptible concurrent regions. Why: broad masking around collection, fork, race or waiting work can defer cancellation and shutdown. Fix: keep only a short critical section masked and explicitly restore interruption for long-running work. Scoping alone does not restore interruptibility; syntax does not prove the mask is actually executed.",
);
const noUnboundedQueueOrPubSub = createVersionedEffectCallbackRule(
  (node, version) => isUnboundedQueueOrPubSub(node, version) ? node : undefined,
  () => "Rule: avoid unbounded Queue or PubSub constructors. Why: unbounded buffers hide backpressure and can fail under load. Fix: use Queue.bounded / PubSub.bounded with an explicit capacity at the owning boundary.",
);

const noGlobalMutableConcurrencyState = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const globalMutableNames = new Set<string>();
    const declarations: any[] = [];
    const workNodes: unknown[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      VariableDeclaration(node: any) {
        if (effectVersionFor(context.options) === 4) { declarations.push(node); return; }
        for (const name of mutableGlobalDeclarationNames(node)) {
          globalMutableNames.add(name);
        }
      },
      CallExpression(node: any) {
        if (!hasEffectEcosystemImport) {
          return;
        }

        if (effectVersionFor(context.options) === 4) {
          const work = v4SharedStateWork(node);
          if (work) workNodes.push(work);
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
      "Program:exit"() {
        if (!hasEffectEcosystemImport || effectVersionFor(context.options) !== 4) return;
        const variables = declarations.flatMap(node => context.sourceCode.getDeclaredVariables(node).filter(variable =>
          (variable.scope.type === "module" || variable.scope.type === "global") && mutableGlobalDeclarationNames(node).includes(variable.name)));
        for (const work of workNodes) {
          const mutation = lexicalWorkMutation(work, variables);
          if (mutation) report(context, mutation, "Rule: avoid global mutable concurrency state. Why: module-owned let/var or mutable containers couple inline workers. Fix: own Ref or immutable results in a service/layer. Lexical syntax does not prove execution or a data race; default collections are sequential.");
        }
      },
    };
  },
});

const noManualDeferredCoordination = defineRule({
  create(context: OxlintContext) {
    let hasEffectEcosystemImport = false;
    const deferredScopes = [new Set<string>()];
    const reported = new WeakSet<object>();
    const bindings: any[] = [];

    return {
      ImportDeclaration(node: any) {
        const source = getImportSource(node);
        if (source && isEffectEcosystemImport(source)) {
          hasEffectEcosystemImport = true;
        }
      },
      FunctionDeclaration() {
        deferredScopes.push(new Set());
      },
      "FunctionDeclaration:exit"() {
        deferredScopes.pop();
      },
      FunctionExpression() {
        deferredScopes.push(new Set());
      },
      "FunctionExpression:exit"() {
        deferredScopes.pop();
      },
      ArrowFunctionExpression() {
        deferredScopes.push(new Set());
      },
      "ArrowFunctionExpression:exit"() {
        deferredScopes.pop();
      },
      VariableDeclarator(node: any) {
        if (effectVersionFor(context.options) === 4) {
          const init = node.init?.type === "YieldExpression" ? node.init.argument : node.init;
          if (isIdentifier(node.id) && (isMemberCall(init, "Deferred", "make") || isMemberCall(init, "Deferred", "makeUnsafe"))) bindings.push(node);
          return;
        }
        const name = deferredBindingName(node);
        if (name) {
          deferredScopes.at(-1)?.add(name);
        }
      },
      CallExpression(node: any) {
        if (effectVersionFor(context.options) === 4) return;
        if (!hasEffectEcosystemImport || !isDeferredAwaitCall(node)) {
          return;
        }

        const binding = firstArgument(node);
        if (!isIdentifier(binding) || !deferredScopes.at(-1)?.has(binding.name)) {
          return;
        }

        if (isDeferredAwaitProtected(node, binding.name) || reported.has(node)) {
          return;
        }

        reported.add(node);
        report(
          context,
          node,
          "Rule: avoid unbounded manual Deferred coordination. Why: a local latch can wait forever and make shutdown or failure ownership implicit. Fix: bound the await with a timeout/race, keep it interruptible, or tie completion and cleanup to a scope finalizer.",
        );
      },
      "Program:exit"() {
        if (!hasEffectEcosystemImport || effectVersionFor(context.options) !== 4) return;
        for (const binding of bindings) for (const variable of context.sourceCode.getDeclaredVariables(binding)) for (const reference of variable.references) {
          const call = (reference.identifier as unknown as Node).parent;
          if (isDeferredAwaitCall(call) && firstArgument(call) === reference.identifier && !isDeferredAwaitProtected(call, variable.name, 4, variable.references)) {
            report(context, call, "Rule: avoid unbounded manual Deferred coordination. Why: a local latch needs visible completion or cancellation ownership. Fix: use a timeout/race or an interruptible owner with a same-binding finalizer. Scope/interruptibility/finalizer markers alone do not prove eventual completion.");
          }
        }
      },
    };
  },
});

const noAcquireWithoutScopedRelease = createVersionedEffectCallbackRule(
  (node, version) => {
    const work = concurrentWorkArguments(node, version);
    return work ? findUnscopedResourceAcquisitions(work, version) : undefined;
  },
  version => `Rule: avoid resource acquisition without scoped release. Why: acquiring a client, connection, file, or handle inside concurrent work can outlive failures and interruption. Fix: ${version === 3 ? "wrap acquisition in acquireRelease/acquireUseRelease, use Effect.scoped, or register a matching finalizer." : "own release; a scope marker is insufficient."}`,
  true,
);

const noYieldWithHeldSemaphorePermit = createVersionedEffectCallbackRule(
  (node, version) => {
    const work = heldSemaphoreWork(node, version);
    return work && (version === 4 ? containsEffect4ConcurrentOperation(work, true) : containsHighRiskSuspension(work)) ? node : undefined;
  },
  () => "Rule: avoid suspension while holding a semaphore permit. Why: unrelated waits hold capacity needed by other work. Fix: narrow coordination critical sections when semantics allow. Async work may intentionally be permit-bound; moving it outside changes concurrency limits. This strict policy is not leak detection.",
);

const noYieldWithHeldMutableRef = createVersionedEffectCallbackRule(
  (node, version) => {
    const callback = synchronizedRefModifierWork(node, version);
    return callback && (version === 3 ? containsHighRiskSuspension(callback) : containsEffect4ConcurrentOperation(callbackBody(callback) ?? callback, true)) ? node : undefined;
  },
  version => `Rule: avoid suspension while holding synchronized reference coordination. Why: effectful SynchronizedRef modifiers hold internal coordination while the callback sleeps, awaits, or starts concurrent work. Fix: ${version === 3 ? "compute the effect outside the modifier and commit a short synchronous state transition." : "move independent work outside; retain atomicity."}`,
);

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

const noUnscopedBackgroundFiber = createVersionedEffectCallbackRule(
  (node, version) => {
    if (version === 3) return isEffectMemberCallNamed(node, "forkDaemon") && !containsEffectMemberCallNamed(firstArgument(node), "supervised") ? node : undefined;
    const operator = isPipeCall(node) ? ((node as Node).arguments as unknown[]).at(-1) : (node as Node)?.callee;
    if (isEffectMemberCallNamed(node, "forkDetach")) {
      const input = firstArgument(node);
      return input && !isIdentifier(input, "undefined") && !isObjectExpression(input) ? node : undefined;
    }
    return isEffectMemberCallNamed(operator, "forkDetach") || isEffectMemberExpressionNamed(operator, "forkDetach") ? node : undefined;
  },
  version => `Rule: avoid unscoped background fibers. Why: Effect.${version === 3 ? "forkDaemon" : "forkDetach"} detaches work from the caller's scope and can outlive failures and shutdown. Fix: use forkScoped/forkIn ${version === 3 ? "or make supervisor ownership explicit in the child effect." : "or child ownership; join is not lifetime ownership."}`,
);

function resourceReleaseCallbackArguments(node: unknown, version: EffectVersion = 3): readonly unknown[] {
  if (typeof node !== "object" || node === null || !Array.isArray((node as Node).arguments)) {
    return [];
  }

  const arguments_ = (node as Node & { arguments: unknown[] }).arguments;
  const offset = isEffectMemberCallNamed(node, "acquireUseRelease") ? 2
    : isResourceAcquireReleaseCall(node, version) ? 1
    : isEffectMemberCallNamed(node, "addFinalizer") ? 0
    : isMemberCall(node, "Scope", "addFinalizer") || isMemberCall(node, "Scope", "addFinalizerExit") ? 1
    : -1;
  return offset < 0 ? [] : arguments_.slice(offset, version === 4 || offset === 0 ? offset + 1 : undefined);
}

function resourceAncestor(node: unknown, matches: (node: Node) => boolean): Node | undefined {
  let current = typeof node === "object" && node !== null ? (node as Node).parent : undefined;
  const seen = new WeakSet<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) return undefined;
    seen.add(current);
    if (matches(current as Node)) return current as Node;
    current = (current as Node).parent;
  }

  return undefined;
}

function hasReleaseOwnership(node: unknown, version: EffectVersion = 3): boolean {
  return resourceAncestor(node, current => (version === 4 || isFunctionLike(current)) &&
    resourceReleaseCallbackArguments(current.parent, version).some(argument => argument === current)) !== undefined;
}

function createResourceLifetimeRule(
  matches: (node: unknown, version: EffectVersion) => boolean,
  message: (version: EffectVersion) => string,
) {
  return createVersionedEffectCallbackRule((node, version) => matches(node, version) ? node : undefined, message, false, true);
}

const noManualResourceClose = createResourceLifetimeRule(
  (node, version) => isResourceCleanupCall(node) && !hasReleaseOwnership(node, version),
  () => "Rule: avoid manual resource cleanup. Why: direct close/dispose calls can bypass Effect scope ownership. Fix: acquire the resource with Effect.acquireRelease or register cleanup with a Scope finalizer.",
);

function isScopeMakeCall(node: unknown): node is Node & { arguments: unknown[] } {
  return isMemberCall(node, "Scope", "make") && Array.isArray((node as Node).arguments);
}

function isScopeCloseFor(node: unknown, bindingName: string): boolean {
  return isMemberCall(node, "Scope", "close") && isIdentifier(firstArgument(node as Node & { arguments: unknown[] }), bindingName);
}

const lexicalScopeNodeTypes = new Set([
  "BlockStatement",
  "CatchClause",
  "ForInStatement",
  "ForOfStatement",
  "ForStatement",
  "Program",
  "SwitchStatement",
]);

function lexicalScopeNode(node: unknown): Node | undefined {
  let current = typeof node === "object" && node !== null ? (node as Node).parent : undefined;
  const seen = new WeakSet<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) return undefined;
    seen.add(current);

    if (lexicalScopeNodeTypes.has((current as Node).type ?? "")) {
      return current as Node;
    }

    if (isFunctionLike(current)) return current as Node;
    current = (current as Node).parent;
  }

  return undefined;
}

function isWithinLexicalScope(node: unknown, scope: Node): boolean {
  let current = node;
  const seen = new WeakSet<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) return false;
    seen.add(current);

    if (current === scope) return true;
    current = (current as Node).parent;
  }

  return false;
}

function lexicalScopeDepth(scope: Node): number {
  let depth = 0;
  let current: unknown = scope;
  const seen = new WeakSet<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) return depth;
    seen.add(current);
    depth += 1;
    current = (current as Node).parent;
  }

  return depth;
}

function patternBindingIdentifiers(pattern: unknown): Node[] {
  if (isIdentifier(pattern)) return [pattern];
  if (typeof pattern !== "object" || pattern === null) return [];

  const node = pattern as Node;
  switch (node.type) {
    case "ArrayPattern":
      return Array.isArray(node.elements)
        ? node.elements.flatMap((element) => patternBindingIdentifiers(element))
        : [];
    case "AssignmentPattern":
      return patternBindingIdentifiers(node.left);
    case "ObjectPattern":
      return Array.isArray(node.properties)
        ? node.properties.flatMap((property) => {
          if (typeof property !== "object" || property === null) return [];

          const propertyNode = property as Node;
          if (propertyNode.type === "Property") {
            return patternBindingIdentifiers(propertyNode.value);
          }
          if (propertyNode.type === "RestElement") {
            return patternBindingIdentifiers(propertyNode.argument);
          }
          return [];
        })
        : [];
    case "RestElement":
      return patternBindingIdentifiers(node.argument);
    case "TSParameterProperty":
      return patternBindingIdentifiers(node.parameter);
    default:
      return [];
  }
}

function lexicalBindingsInFunction(functionNode: Node): Node[] {
  return findNodes(functionNode.body, (candidate) => (
    typeof candidate === "object" &&
    candidate !== null &&
    lexicalBindingIdentifiers(candidate as Node).length > 0 &&
    enclosingFunction(candidate) === functionNode
  )) as Node[];
}

function lexicalBindingIdentifiers(binding: Node): Node[] {
  if (binding.type === "VariableDeclarator") {
    return patternBindingIdentifiers(binding.id);
  }

  if (binding.type === "CatchClause") {
    return patternBindingIdentifiers(binding.param);
  }

  return (
    (binding.type === "ClassDeclaration" || binding.type === "FunctionDeclaration") &&
    isIdentifier(binding.id)
  )
    ? [binding.id]
    : [];
}

function lexicalBindingScope(binding: Node): Node | undefined {
  return binding.type === "CatchClause"
    ? lexicalScopeNode(binding.param)
    : lexicalScopeNode(binding);
}

function variableBindingForReference(reference: unknown, functionNode: Node): Node | undefined {
  if (!isIdentifier(reference)) return undefined;

  let best: Node | undefined;
  let bestDepth = -1;

  for (const binding of lexicalBindingsInFunction(functionNode)) {
    if (!lexicalBindingIdentifiers(binding).some((identifier) => (
      isIdentifier(identifier, reference.name)
    ))) continue;

    const scope = lexicalBindingScope(binding);
    if (scope === undefined || !isWithinLexicalScope(reference, scope)) continue;

    const depth = lexicalScopeDepth(scope);
    if (depth > bestDepth) {
      best = binding;
      bestDepth = depth;
    }
  }

  return best;
}

function directScopeMakeInitializer(init: unknown, scopeMake: unknown): boolean {
  if (init === scopeMake) return true;

  return (
    typeof init === "object" &&
    init !== null &&
    (init as Node).type === "YieldExpression" &&
    (init as Node).delegate === true &&
    (init as Node).argument === scopeMake
  );
}

function enclosingFunction(node: unknown): Node | undefined {
  let current = typeof node === "object" && node !== null ? (node as Node).parent : undefined;
  const seen = new WeakSet<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) return undefined;
    seen.add(current);
    if (isFunctionLike(current)) return current as Node;
    current = (current as Node).parent;
  }

  return undefined;
}

function scopeMakeBindingDeclaration(node: unknown): Node | undefined {
  let current = typeof node === "object" && node !== null ? (node as Node).parent : undefined;
  const seen = new WeakSet<object>();

  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) return undefined;
    seen.add(current);

    if (
      (current as Node).type === "VariableDeclarator" &&
      isIdentifier((current as Node).id) &&
      directScopeMakeInitializer((current as Node).init, node)
    ) {
      return current as Node;
    }

    if (isFunctionLike(current)) return undefined;
    current = (current as Node).parent;
  }

  return undefined;
}

function hasMatchingScopeClose(node: unknown): boolean {
  const declaration = scopeMakeBindingDeclaration(node);
  const functionNode = enclosingFunction(node);
  if (declaration === undefined || functionNode === undefined) return false;

  const bindingName = ((declaration.id as Node & { name: string }).name);

  return findNodes(
    functionNode.body,
    (candidate) => (
      isScopeCloseFor(candidate, bindingName) &&
      enclosingFunction(candidate) === functionNode &&
      variableBindingForReference(
        firstArgument(candidate as Node & { arguments: unknown[] }),
        functionNode,
      ) === declaration
    ),
  ).length > 0;
}

function scopeCloseUsesCallbackParameter(
  node: unknown,
  parameter: Node & { name: string },
  callback: Node,
): boolean {
  const reference = firstArgument(node as Node & { arguments: unknown[] });
  if (!isIdentifier(reference, parameter.name)) return false;

  return (
    variableBindingForReference(reference, callback) === undefined &&
    Array.isArray(callback.params) &&
    (callback.params as unknown[]).some((candidate) => candidate === parameter)
  );
}

function hasMatchingScopeReleaseCallback(node: Node & { arguments: unknown[] }): boolean {
  const arguments_ = (node as Node & { arguments: unknown[] }).arguments;
  const callbacks = isEffectMemberCallNamed(node, "acquireUseRelease")
    ? arguments_.slice(2)
    : arguments_.slice(1);

  return callbacks.some((callback) => {
    if (!isFunctionLike(callback)) return false;
    const parameter = ((callback as Node).params as unknown[] | undefined)?.[0];
    if (!isIdentifier(parameter)) return false;

    return findNodes(
      (callback as Node).body,
      (candidate) => (
        isScopeCloseFor(candidate, parameter.name) &&
        enclosingFunction(candidate) === callback &&
        scopeCloseUsesCallbackParameter(candidate, parameter, callback as Node)
      ),
    ).length > 0;
  });
}

function hasScopeOwner(node: unknown, version: EffectVersion = 3): boolean {
  return resourceAncestor(node, current => (
    version === 3 && (isEffectMemberCallNamed(current, "scoped") || isMemberCall(current, "Layer", "scoped"))
  ) || (
    isResourceAcquireReleaseCall(current, version) && firstArgument(current) === node && hasMatchingScopeReleaseCallback(current)
  )) !== undefined || hasMatchingScopeClose(node);
}

const noUnboundScope = createResourceLifetimeRule(
  (node, version) => isScopeMakeCall(node) && !hasScopeOwner(node, version),
  version => `Rule: bind Scope.make to an owned lifecycle. Why: an unbound Scope can leak resources and finalizers. Fix: ${version === 3 ? "use Effect.scoped/Layer.scoped, close the scope explicitly, or acquire it with a matching release callback." : "use Effect.scope or acquire it with a matching Scope.close release callback. Effect.scoped alone does not own a separate scope."}`,
);

const noResourceSucceedEscape = createResourceLifetimeRule(
  node => isEffectMemberCallNamed(node, "succeed") && isResourceLikeExpression(firstArgument(node)),
  () => "Rule: do not let live resources escape through Effect.succeed. Why: ordinary success values do not express resource lifetime ownership. Fix: keep the resource inside Effect.acquireRelease, Scope, or a service layer.",
);

function isResourceLikeConstruction(node: unknown): boolean {
  if (typeof node !== "object" || node === null || (node as Node).type !== "NewExpression") {
    return false;
  }

  const callee = (node as Node).callee;
  let name: string | undefined;
  if (isIdentifier(callee)) {
    name = callee.name;
  } else if (
    typeof callee === "object" &&
    callee !== null &&
    (callee as Node).type === "MemberExpression" &&
    (callee as Node).computed !== true &&
    isIdentifier((callee as Node).property)
  ) {
    name = ((callee as Node).property as Node & { name: string }).name;
  }

  return name !== undefined && isResourceLikeName(name);
}

function isResourceLifecycleCandidate(node: unknown): boolean {
  return resourceAcquisitionCall(node) || isResourceLikeConstruction(node);
}

function isResourceAcquireReleaseCall(node: unknown, version: EffectVersion = 3): node is Node & { arguments: unknown[] } {
  return (
    isEffectMemberCallNamed(node, "acquireRelease") ||
    (version === 3 && isEffectMemberCallNamed(node, "acquireReleaseInterruptible")) ||
    isEffectMemberCallNamed(node, "acquireUseRelease")
  );
}

function hasResourceLifecycleOwner(node: unknown, version: EffectVersion = 3): boolean {
  if (hasReleaseOwnership(node, version)) {
    return true;
  }

  return resourceAncestor(node, current => (
      isResourceAcquireReleaseCall(current, version) ||
      isEffectMemberCallNamed(current, "scoped") ||
      (version === 3 && isMemberCall(current, "Layer", "scoped")) ||
      isEffectScopedPipeCall(current)
  )) !== undefined;
}

function resourceLexicalScope(node: unknown): Node | undefined {
  return resourceAncestor(node, current => isFunctionLike(current) || current.type === "Program");
}

function unownedResourcesInScope(scope: Node, version: EffectVersion = 3): unknown[] {
  return findNodes(scope, (candidate) => (
    isResourceLifecycleCandidate(candidate) &&
    resourceLexicalScope(candidate) === scope &&
    !hasResourceLifecycleOwner(candidate, version)
  ));
}

function nestedAcquireReleaseNode(node: unknown, version: EffectVersion = 3): unknown | undefined {
  if (!isResourceAcquireReleaseCall(node, version)) {
    return undefined;
  }

  return findNodes(node, candidate => isResourceAcquireReleaseCall(candidate, version)).length >= 3 ? node : undefined;
}

function requestLifecycleFunctionName(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null || !isFunctionLike(node)) {
    return undefined;
  }

  const functionNode = node as Node;
  if (isIdentifier(functionNode.id)) {
    return functionNode.id.name;
  }

  const parent = functionNode.parent;
  if (typeof parent !== "object" || parent === null) {
    return undefined;
  }

  if ((parent as Node).type === "VariableDeclarator" && isIdentifier((parent as Node).id)) {
    return ((parent as Node).id as Node & { name: string }).name;
  }

  if (
    (parent as Node).type === "Property" &&
    isIdentifier((parent as Node).key)
  ) {
    return ((parent as Node).key as Node & { name: string }).name;
  }

  return undefined;
}

function isRequestLifecycleFunction(node: unknown): boolean {
  const name = requestLifecycleFunctionName(node);
  return name !== undefined && /(?:handler|route|request|endpoint|controller)$/i.test(name);
}

function requestResourceOwner(node: unknown, version: EffectVersion): Node | undefined {
  if (version === 3) return enclosingFunction(node);
  return resourceAncestor(node, current => {
    if (!isFunctionLike(current)) return false;
    const parent = current.parent;
    return getEffectGeneratorArgument(parent, "gen", 4) !== current &&
      getEffectGeneratorArgument(parent, "fn", 4) !== current &&
      !effectLogicCallbacks(parent, 4).includes(current) &&
      !["sync", "suspend", "promise", "tryPromise"].some(name => isEffectMemberCallNamed(parent, name) && parent.arguments.includes(current));
  });
}

function requestScopedResourceNodes(node: unknown, version: EffectVersion = 3): unknown[] {
  if (!isRequestLifecycleFunction(node) || typeof node !== "object" || node === null) {
    return [];
  }

  const functionNode = node as Node;
  return findNodes(functionNode.body, (candidate) => (
    isResourceLifecycleCandidate(candidate) && requestResourceOwner(candidate, version) === functionNode
  ));
}

function openResourceInRunScope(node: unknown, version: EffectVersion = 3): unknown | undefined {
  const scope = resourceLexicalScope(node);
  if (scope === undefined) {
    return undefined;
  }

  return unownedResourcesInScope(scope, version)[0];
}

function programInitializerForReference(reference: unknown, version: EffectVersion = 3, context?: OxlintContext): unknown | undefined {
  if (!isIdentifier(reference)) {
    return undefined;
  }

  if (version === 4) {
    const root = resourceAncestor(reference, node => node.type === "Program");
    if (!root || !context?.sourceCode) return undefined;
    const declaration = findNodes(root, node => typeof node === "object" && node !== null && (node as Node).type === "VariableDeclarator")
      .find(node => context.sourceCode.getDeclaredVariables(node as ESTree.VariableDeclarator).some(variable => variable.references.some(entry => Object.is(entry.identifier, reference))));
    return (declaration as Node | undefined)?.init;
  }

  const functionScope = enclosingFunction(reference);
  const scopes = functionScope === undefined ? [] : [functionScope];
  let current = typeof reference === "object" && reference !== null
    ? (reference as Node).parent
    : undefined;
  const seen = new WeakSet<object>();
  while (typeof current === "object" && current !== null) {
    if (seen.has(current)) {
      break;
    }
    seen.add(current);
    if ((current as Node).type === "Program") {
      scopes.push(current as Node);
      break;
    }
    current = (current as Node).parent;
  }

  for (const scope of scopes) {
    const declaration = findNode(scope, (candidate) => (
      typeof candidate === "object" &&
      candidate !== null &&
      (candidate as Node).type === "VariableDeclarator" &&
      isIdentifier((candidate as Node).id, reference.name) &&
      (candidate as Node).init !== undefined
    ));
    if (declaration) {
      return (declaration as Node).init;
    }
  }

  return undefined;
}

function effectRunMissingLayerProvision(node: unknown, version: EffectVersion, context: OxlintContext): boolean {
  const execution = effectRunExecution(node, version);
  if (!execution) {
    return false;
  }

  const argument = execution.program;
  const search = (program: unknown, predicate: (node: unknown) => boolean) => version === 3
    ? findNode(program, predicate)
    : findNode(program, node => predicate(node) && requestResourceOwner(node, 4) === enclosingFunction(program));
  const program = search(argument, isYieldedServiceDependency) !== undefined
    ? argument
    : programInitializerForReference(argument, version, context) ?? argument;

  return (
    search(program, isYieldedServiceDependency) !== undefined &&
    search(program, isEffectOrLayerProvideCall) === undefined
  );
}

const noResourceWithoutAcquireRelease = createResourceLifetimeRule(
  (node, version) => resourceAcquisitionCall(node) && !hasResourceLifecycleOwner(node, version),
  version => `Rule: acquire resources with an Effect release owner. Why: open/connect/create calls can leak across failure and interruption when they are ordinary calls. Fix: use Effect.acquireRelease, Effect.acquireUseRelease, ${version === 3 ? "Effect.scoped, " : ""}or a matching finalizer.`,
);

const noRequestScopedLongLivedResource = createVersionedEffectCallbackRule(
  requestScopedResourceNodes,
  () => "Rule: do not acquire long-lived resources inside request-scoped handlers. Why: per-request clients and pools multiply connections and make shutdown ownership ambiguous. Fix: provide the resource through a Layer or a longer-lived service boundary.",
  true, true, ["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"],
);

const noGlobalResourceSingleton = createVersionedEffectCallbackRule(
  node => enclosingFunction(node) === undefined && isResourceLikeConstruction(node) ? node : undefined,
  version => `Rule: do not create global resource singletons in Effect modules. Why: module-level clients and pools bypass Layer ownership and make tests and shutdown order implicit. Fix: construct the resource in a Layer${version === 3 ? " or Effect.Service" : " using Context.Service"} and provide it at the application boundary.`,
  false, true, ["NewExpression"],
);

const noRunWithOpenResource = createVersionedEffectCallbackRule(
  (node, version) => isEffectRunCall(node, version) && openResourceInRunScope(node, version) !== undefined ? node : undefined,
  () => "Rule: do not run an Effect while an unowned resource is open in the same scope. Why: runtime execution can finish without closing the resource. Fix: move acquisition into acquireRelease/scoped ownership and run only the managed effect.",
);

const noNestedAcquireRelease = createVersionedEffectCallbackRule(
  nestedAcquireReleaseNode,
  () => "Rule: avoid deeply nested resource acquisition. Why: nested release stacks are difficult to audit and compose. Fix: build a named Layer or combine independent resources into one managed acquisition boundary.",
);

const noMissingLayerProvisionAtRun = createVersionedEffectCallbackRule(
  (node, version, context) => effectRunMissingLayerProvision(node, version, context) ? node : undefined,
  version => version === 3
    ? "Rule: provide service layers before running an Effect that retrieves services. Why: an unprovided tag fails at runtime and hides the dependency contract at the boundary. Fix: compose the required Layer and use Effect.provide or Layer.provide before Effect.run*."
    : "Rule: make service layer provision visible before running. Why: a context argument or Service-shaped yield does not prove Layer ownership. Fix: provide the required Layer before Effect.run*. This is syntax policy, not dependency type checking.",
);

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
  "no-console-in-effect-flow": noConsoleInEffectFlow,
  "no-effect-log-without-structured-context": noEffectLogWithoutStructuredContext,
  "require-span-on-public-service-method": requireSpanOnPublicServiceMethod,
  "no-runpromise-in-non-async-test-body": noRunpromiseInNonAsyncTestBody,
  "require-effect-flip-for-error-test": requireEffectFlipForErrorTest,
  "no-test-mock-layer-when-default-available": noTestMockLayerWhenDefaultAvailable,
  "no-nested-effect-gen": noNestedEffectGen,
  "no-yield-without-star-in-effect-gen": noYieldWithoutStarInEffectGen,
  "no-piped-yield-in-gen": noPipedYieldInGen,
  "no-gen-for-mapping": noGenForMapping,
  "prefer-gen-for-workflow": preferGenForWorkflow,
  "no-business-logic-in-pipe": noBusinessLogicInPipe,
  "no-large-anonymous-flow": noLargeAnonymousFlow,
  "no-effect-in-flow": noEffectInFlow,
  "prefer-named-flow": preferNamedFlow,
  "prefer-flow-for-pure-pipeline": preferFlowForPurePipeline,
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
  "no-json-parse-without-schema": noJsonParseWithoutSchema,
  "no-date-now-in-effect": noDateNowInEffect,
  "no-new-date-in-domain-logic": noNewDateInDomainLogic,
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
  "no-early-catchall-null": noEarlyCatchallNull,
  "no-empty-error-tag": noEmptyErrorTag,
  "no-expected-state-as-error": noExpectedStateAsError,
  "no-exception-domain-error": noExceptionDomainError,
  "no-effect-fail-error-message": noEffectFailErrorMessage,
  "no-catchall-generic-rethrow": noCatchallGenericRethrow,
  "no-log-only-error-handling": noLogOnlyErrorHandling,
  "no-error-as-public-effect-error": noErrorAsPublicEffectError,
  "no-unknown-public-error-channel": noUnknownPublicErrorChannel,
  "no-mixed-effect-error-shapes": noMixedEffectErrorShapes,
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
  "no-hidden-effect-execution": noHiddenEffectExecution,
  "no-boundary-try-catch-without-effect-map": noBoundaryTryCatchWithoutEffectMap,
  "no-node-fs-in-effect-code": noNodeFsInEffectCode,
  "no-node-platform-in-shared-code": noNodePlatformInSharedCode,
  "no-process-env-direct-read": noProcessEnvDirectRead,
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
  "no-manual-deferred-coordination": noManualDeferredCoordination,
  "no-acquire-without-scoped-release": noAcquireWithoutScopedRelease,
  "no-manual-resource-close": noManualResourceClose,
  "no-unbound-scope": noUnboundScope,
  "no-resource-succeed-escape": noResourceSucceedEscape,
  "no-resource-without-acquire-release": noResourceWithoutAcquireRelease,
  "no-request-scoped-long-lived-resource": noRequestScopedLongLivedResource,
  "no-global-resource-singleton": noGlobalResourceSingleton,
  "no-run-with-open-resource": noRunWithOpenResource,
  "no-nested-acquire-release": noNestedAcquireRelease,
  "no-missing-layer-provision-at-run": noMissingLayerProvisionAtRun,
  "no-yield-with-held-semaphore-permit": noYieldWithHeldSemaphorePermit,
  "no-yield-with-held-mutable-ref": noYieldWithHeldMutableRef,
  "no-unscoped-background-fiber": noUnscopedBackgroundFiber,
};

for (const ruleName of versionSensitiveRules) {
  const rule = rules[ruleName];
  rule.meta = {
    ...rule.meta,
    schema: withEffectVersionSchema(Array.isArray(rule.meta?.schema) ? rule.meta.schema : []) as RuleOptionsSchema,
  };
}

type RuleName = keyof typeof rules;

const strictTestingObservabilityAndQaRuleNames = [
  "no-runpromise-in-non-async-test-body",
  "require-effect-flip-for-error-test",
  "no-test-mock-layer-when-default-available",
] as const satisfies readonly RuleName[];

type StrictTestingObservabilityAndQaRuleName =
  typeof strictTestingObservabilityAndQaRuleNames[number];

const strictConcurrencySafetyRuleNames = [
  "no-manual-deferred-coordination",
  "no-yield-with-held-semaphore-permit",
  "no-yield-with-held-mutable-ref",
  "no-unscoped-background-fiber",
] as const satisfies readonly RuleName[];

const strictErrorModelingRuleNames = [
  "no-early-catchall-null",
  "no-empty-error-tag",
] as const satisfies readonly RuleName[];

const strictEffectFlowRuleNames = [
  "no-business-logic-in-pipe",
] as const satisfies readonly RuleName[];

const strictPureTransformationRuleNames = [
  "prefer-flow-for-pure-pipeline",
] as const satisfies readonly RuleName[];

const strictResourceLifetimeRuleNames = [
  "no-request-scoped-long-lived-resource",
  "no-global-resource-singleton",
  "no-nested-acquire-release",
  "no-missing-layer-provision-at-run",
] as const satisfies readonly RuleName[];

type StrictRuleName = StrictTestingObservabilityAndQaRuleName |
  typeof strictConcurrencySafetyRuleNames[number] |
  typeof strictErrorModelingRuleNames[number] |
  typeof strictEffectFlowRuleNames[number] |
  typeof strictPureTransformationRuleNames[number] |
  typeof strictResourceLifetimeRuleNames[number];

export type EffectRuleOptions = {
  effectVersion?: EffectVersion;
  boundaryPaths?: readonly string[];
  configPaths?: readonly string[];
};
export type EffectRuleEntry = "error" | ["error", EffectRuleOptions];

type ApplicableRuleName<N extends RuleName, V extends EffectVersion> =
  V extends 4 ? Exclude<N, typeof legacyOnlyRules[number]> : N;
type VersionedRuleEntry<N extends RuleName, V extends EffectVersion> =
  N extends typeof versionSensitiveRules[number] ? ["error", { effectVersion: V }] : "error";

function rulesFromNames<const T extends readonly RuleName[], const V extends EffectVersion>(ruleNames: T, version: V) {
  return Object.fromEntries(
    ruleNames.filter((ruleName) => version === 3 || !(legacyOnlyRules as readonly string[]).includes(ruleName))
      .map((ruleName) => [`linteffect/${ruleName}`, (versionSensitiveRules as readonly string[]).includes(ruleName)
        ? ["error", { effectVersion: version }] : "error"]),
  ) as { [N in ApplicableRuleName<T[number], V> as `linteffect/${N}`]: VersionedRuleEntry<N, V> };
}

function presetFor<const T extends Record<`linteffect/${string}`, EffectRuleEntry>>(groupRules: T) {
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

function createVersionedConfigurations<const V extends EffectVersion>(version: V) {
  const reactAndRuntimeBoundariesRules = rulesFromNames([
    "no-react-state",
    "no-runtime-runfork",
    "no-run-effect-outside-boundary",
    "no-or-die-outside-boundary",
    "prevent-dynamic-imports",
    "no-render-side-effects",
    "no-inline-runtime-provide",
  ] as const, version);

  const effectCompositionRules = rulesFromNames([
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
  ] as const, version);

  const concurrencySafetyRules = rulesFromNames([
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
    ...strictConcurrencySafetyRuleNames,
    "no-acquire-without-scoped-release",
  ] as const, version);

  const resourceLifetimeRules = rulesFromNames([
    "no-manual-resource-close",
    "no-unbound-scope",
    "no-resource-succeed-escape",
    "no-resource-without-acquire-release",
    ...strictResourceLifetimeRuleNames,
    "no-run-with-open-resource",
  ] as const, version);

  const pipelineShapeAndSequencingRules = rulesFromNames([
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
  ] as const, version);

  const branchingAndLocalControlFlowRules = rulesFromNames([
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
  ] as const, version);

  const optionMatchAndDataNormalizationRules = rulesFromNames([
    "no-option-as",
    "no-match-void-branch",
    "no-match-effect-branch",
    "no-model-overlay-cast",
    "no-unknown-boolean-coercion-helper",
    "no-fromnullable-nullish-coalesce",
    "no-option-boolean-normalization",
    "no-string-sentinel-return",
    "no-string-sentinel-const",
  ] as const, version);

  const atomStateAndPlatformBoundariesRules = rulesFromNames([
    "no-effect-sync-console",
    "no-atom-registry-effect-sync",
    "no-family-collection-read",
    "no-naked-object-state-update",
    "no-wrapgraphql-catchall",
  ] as const, version);

  const domainModelingRules = rulesFromNames([
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
    "no-new-date-in-domain-logic",
  ] as const, version);

  const dddErrorModelingRuleNames = [
    "no-error-as-public-effect-error",
    "no-unknown-public-error-channel",
    "no-mixed-effect-error-shapes",
    "no-expected-state-as-error",
  ] as const;
  type DddErrorModelingRuleName = typeof dddErrorModelingRuleNames[number];

  const errorModelingRuleNames = [
    ...dddErrorModelingRuleNames,
    "no-early-catchall-null",
    "no-empty-error-tag",
    "no-exception-domain-error",
    "no-effect-fail-error-message",
    "no-catchall-generic-rethrow",
    "no-log-only-error-handling",
  ] as const;

  const errorModelingRules = rulesFromNames(errorModelingRuleNames, version);

  const dddRules = {
    ...domainModelingRules,
    ...errorModelingRules,
  } as const;

  const effectFlowRules = rulesFromNames([
    "no-piped-yield-in-gen",
    "no-gen-for-mapping",
    "prefer-gen-for-workflow",
    ...strictEffectFlowRuleNames,
  ] as const, version);

  const pureTransformationRules = rulesFromNames([
    "no-large-anonymous-flow",
    "no-effect-in-flow",
    "prefer-named-flow",
    ...strictPureTransformationRuleNames,
  ] as const, version);

  const behaviorDecorationRules = rulesFromNames([
    "prefer-pipe-for-behavior",
    "prefer-decorated-effect-before-gen",
    "no-workflow-in-behavior-pipe",
  ] as const, version);

  const styleSeparationRules = rulesFromNames([
    "no-mixed-pillar-function",
    "no-clever-effect-expression",
    "prefer-extracted-concept",
  ] as const, version);

  const serviceAndLayerArchitectureRules = rulesFromNames([
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
  ] as const, version);

  const platformAndBoundaryHygieneRules = rulesFromNames([
    "no-hidden-effect-execution",
    "no-boundary-try-catch-without-effect-map",
    "no-node-fs-in-effect-code",
    "no-json-parse-without-schema",
    "no-date-now-in-effect",
    "no-node-platform-in-shared-code",
    "no-process-env-direct-read",
  ] as const, version);

  const testingObservabilityAndQaRules = rulesFromNames([
    "no-console-in-effect-flow",
    "no-effect-log-without-structured-context",
    "require-span-on-public-service-method",
    ...strictTestingObservabilityAndQaRuleNames,
  ] as const, version);

  const allRules = rulesFromNames(Object.keys(rules) as RuleName[], version);
  const recommendedExcludedRuleNames = [
    ...strictTestingObservabilityAndQaRuleNames,
    ...strictConcurrencySafetyRuleNames,
    ...strictErrorModelingRuleNames,
    ...strictEffectFlowRuleNames,
    ...strictPureTransformationRuleNames,
    ...strictResourceLifetimeRuleNames,
    ...dddErrorModelingRuleNames,
    "no-resource-succeed-escape",
  ] as readonly RuleName[];
  const recommendedRuleNames = (Object.keys(rules) as RuleName[]).filter(
    (ruleName): ruleName is Exclude<
      RuleName,
      StrictRuleName | DddErrorModelingRuleName | "no-resource-succeed-escape"
    > => (
      !recommendedExcludedRuleNames.includes(ruleName)
    ),
  );
  const recommendedRules = rulesFromNames(recommendedRuleNames, version);

  const ruleGroups = {
    reactAndRuntimeBoundaries: reactAndRuntimeBoundariesRules,
    effectComposition: effectCompositionRules,
    concurrencySafety: concurrencySafetyRules,
    resourceLifetime: resourceLifetimeRules,
    pipelineShapeAndSequencing: pipelineShapeAndSequencingRules,
    branchingAndLocalControlFlow: branchingAndLocalControlFlowRules,
    optionMatchAndDataNormalization: optionMatchAndDataNormalizationRules,
    atomStateAndPlatformBoundaries: atomStateAndPlatformBoundariesRules,
    domainModeling: domainModelingRules,
    errorModeling: errorModelingRules,
    ddd: dddRules,
    effectFlow: effectFlowRules,
    pureTransformation: pureTransformationRules,
    behaviorDecoration: behaviorDecorationRules,
    styleSeparation: styleSeparationRules,
    serviceAndLayerArchitecture: serviceAndLayerArchitectureRules,
    platformAndBoundaryHygiene: platformAndBoundaryHygieneRules,
    testingObservabilityAndQa: testingObservabilityAndQaRules,
  } as const;

  const recommended = presetFor(recommendedRules);
  const typeAware = {
    options: {
      typeAware: true,
    },
    jsPlugins,
    rules: recommended.rules,
  } as const;
  const reactAndRuntimeBoundaries = presetFor(reactAndRuntimeBoundariesRules);
  const effectComposition = presetFor(effectCompositionRules);
  const concurrencySafety = presetFor(concurrencySafetyRules);
  const resourceLifetime = presetFor(resourceLifetimeRules);
  const pipelineShapeAndSequencing = presetFor(pipelineShapeAndSequencingRules);
  const branchingAndLocalControlFlow = presetFor(branchingAndLocalControlFlowRules);
  const optionMatchAndDataNormalization = presetFor(optionMatchAndDataNormalizationRules);
  const atomStateAndPlatformBoundaries = presetFor(atomStateAndPlatformBoundariesRules);
  const domainModeling = presetFor(domainModelingRules);
  const errorModeling = presetFor(errorModelingRules);
  const ddd = presetFor(dddRules);
  const effectFlow = presetFor(effectFlowRules);
  const pureTransformation = presetFor(pureTransformationRules);
  const behaviorDecoration = presetFor(behaviorDecorationRules);
  const styleSeparation = presetFor(styleSeparationRules);
  const serviceAndLayerArchitecture = presetFor(serviceAndLayerArchitectureRules);
  const platformAndBoundaryHygiene = presetFor(platformAndBoundaryHygieneRules);
  const testingObservabilityAndQa = presetFor(testingObservabilityAndQaRules);

  const presets = {
    recommended,
    typeAware,
    reactAndRuntimeBoundaries,
    effectComposition,
    concurrencySafety,
    resourceLifetime,
    pipelineShapeAndSequencing,
    branchingAndLocalControlFlow,
    optionMatchAndDataNormalization,
    atomStateAndPlatformBoundaries,
    domainModeling,
    errorModeling,
    ddd,
    effectFlow,
    pureTransformation,
    behaviorDecoration,
    styleSeparation,
    serviceAndLayerArchitecture,
    platformAndBoundaryHygiene,
    testingObservabilityAndQa,
  } as const;

  return {
    jsPlugins,
    reactAndRuntimeBoundariesRules,
    effectCompositionRules,
    concurrencySafetyRules,
    resourceLifetimeRules,
    pipelineShapeAndSequencingRules,
    branchingAndLocalControlFlowRules,
    optionMatchAndDataNormalizationRules,
    atomStateAndPlatformBoundariesRules,
    domainModelingRules,
    errorModelingRules,
    dddRules,
    effectFlowRules,
    pureTransformationRules,
    behaviorDecorationRules,
    styleSeparationRules,
    serviceAndLayerArchitectureRules,
    platformAndBoundaryHygieneRules,
    testingObservabilityAndQaRules,
    allRules,
    recommendedRules,
    ruleGroups,
    recommended,
    typeAware,
    reactAndRuntimeBoundaries,
    effectComposition,
    concurrencySafety,
    resourceLifetime,
    pipelineShapeAndSequencing,
    branchingAndLocalControlFlow,
    optionMatchAndDataNormalization,
    atomStateAndPlatformBoundaries,
    domainModeling,
    errorModeling,
    ddd,
    effectFlow,
    pureTransformation,
    behaviorDecoration,
    styleSeparation,
    serviceAndLayerArchitecture,
    platformAndBoundaryHygiene,
    testingObservabilityAndQa,
    presets,
  } as const;
}

export const {
  reactAndRuntimeBoundariesRules,
  effectCompositionRules,
  concurrencySafetyRules,
  resourceLifetimeRules,
  pipelineShapeAndSequencingRules,
  branchingAndLocalControlFlowRules,
  optionMatchAndDataNormalizationRules,
  atomStateAndPlatformBoundariesRules,
  domainModelingRules,
  errorModelingRules,
  dddRules,
  effectFlowRules,
  pureTransformationRules,
  behaviorDecorationRules,
  styleSeparationRules,
  serviceAndLayerArchitectureRules,
  platformAndBoundaryHygieneRules,
  testingObservabilityAndQaRules,
  allRules,
  recommendedRules,
  ruleGroups,
  recommended,
  typeAware,
  reactAndRuntimeBoundaries,
  effectComposition,
  concurrencySafety,
  resourceLifetime,
  pipelineShapeAndSequencing,
  branchingAndLocalControlFlow,
  optionMatchAndDataNormalization,
  atomStateAndPlatformBoundaries,
  domainModeling,
  errorModeling,
  ddd,
  effectFlow,
  pureTransformation,
  behaviorDecoration,
  styleSeparation,
  serviceAndLayerArchitecture,
  platformAndBoundaryHygiene,
  testingObservabilityAndQa,
  presets,
} = createVersionedConfigurations(4);

/** Legacy Effect 3 presets; default exports target Effect 4. */
export const effect3 = createVersionedConfigurations(3);

export default definePlugin({
  meta: {
    name: "linteffect",
  },
  rules,
});
