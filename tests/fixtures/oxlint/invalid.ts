import { Effect, Match, Option, Ref, Runtime, pipe } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { useState } from "react";

const count = useState(0);

const program = Effect.as(Effect.succeed(count), "done").pipe(
  Effect.bind("next", () => Effect.succeed("next")),
);

const bridge = Effect.async<never, never, void>(() => {});

const nested = Effect.map(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => value,
);

const flatMapLadder = Effect.flatMap(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  (value) => Effect.succeed(value),
);

const callTower = Effect.zipRight(
  Effect.succeed(count),
  Effect.succeed("next"),
);

const orElseLadder = Effect.orElse(
  Effect.flatMap(Effect.succeed(count), () => Effect.succeed("next")),
  () => Effect.succeed("fallback"),
);

const ternary = count ? "yes" : "no";

function maybeValue() {
  return null;
}

const optionAs = Option.as(Option.some(count), "value");

const neverEffect = Effect.never;

const arrowLadder = ((value) => ((next) => next)(value))(count);

const branchInObject = {
  label: Match.value(count).pipe((value) => value),
};

const iifeWrapper = ((value) => value)(count);

const arrowReturn = pipe(
  count,
  (value) => {
    return value;
  },
);

const callbackReturn = [count].map(function callback(value) {
  return value;
});

const fnGenerator = Effect.fn(function* () {
  return yield* Effect.succeed(count);
});

const syncConsole = Effect.sync(() => {
  console.log(count);
});

const nestedGen = Effect.gen(function* () {
  return yield* Effect.gen(function* () {
    return count;
  });
});

const matchVoidBranch = Match.when(true, () => Effect.void);

const matchEffectBranch = Match.value(count).pipe(
  Match.when(1, () => Effect.flatMap(Effect.succeed(count), (value) => Effect.succeed(value))),
);

const syncWrapper = Effect.sync(() => String(count));

const sideEffectWrapper = Effect.as(console.log(count), "done");

const allStepSequencing = Effect.all([
  Ref.set({} as any, count),
], { concurrency: 1 });

const wrapperAlias = () => Effect.succeed(count);

type ManualEffect = Effect.Effect<number, Error, never>;

const modelOverlay = count as unknown;

const booleanCoercion = Match.value(typeof count === "boolean").pipe(
  Match.orElse(() => null),
);

const nullableOption = Option.fromNullable(count ?? null);

const booleanNormalized = Option.match(Option.some(count), {
  onSome: (value) => value === true,
  onNone: () => false,
});

const statusToken = "loading";

declare const order: { readonly status: string };
declare const domainOrder: {
  readonly total: number;
  readonly customerTier: string;
  readonly cancelled: boolean;
  readonly shipped: boolean;
};
declare const currency: string;

type UserId = string;

function settleInvoice(invoiceId: string, shouldNotifyCustomer: boolean) {
  return { invoiceId, shouldNotifyCustomer };
}

const approvedOrder = order.status === "approved";

function transferFunds(fromAccountId: string, toAccountId: string, transferAmount: number) {
  return { fromAccountId, toAccountId, transferAmount };
}

interface SessionLease {
  readonly sessionId: string;
  readonly expiresAt: number;
  readonly renewedAt: Date;
}

function createPaymentIntent(opts: any) {
  return opts;
}

const canApplyPremiumDiscount =
  domainOrder.total > 100 && domainOrder.customerTier === "premium" && currency !== "test";

const impossibleOrderState = domainOrder.cancelled && domainOrder.shipped;

const rejectedTransfer = Effect.fail("not allowed");

function deleteUserFromAdminPanel(id: string) {
  return { deletedUserId: id };
}

const badYield = Effect.gen(function* () {
  yield Effect.succeed(count);
});

const asyncCombinatorCallback = Effect.map(Effect.succeed(count), async (value) => value);

Effect.runPromise(program);

const throwingEffectLogic = Effect.gen(function* () {
  throw new Error("unexpected");
});

const dyingEffectLogic = Effect.orDie(program);

const swallowedCatchAll = Effect.catchAll(() => Effect.succeed({ fallback: true }));

const ignoredEffect = Effect.ignore(program);

const tryCatchEffectLogic = Effect.gen(function* () {
  try {
    yield* Effect.succeed(count);
  } catch {
    yield* Effect.fail({ _tag: "Unexpected" });
  }
});

const promiseEffectLogic = Effect.gen(function* () {
  Promise.all([Promise.resolve(count)]);
});

export function loadPublicUser(): Effect.Effect<{ readonly id: string }, Error, never> {
  return program as any;
}

const unboundedParallelism = Effect.all(
  [1, 2, 3].map((value) => Effect.succeed(value)),
);

Effect.fork(program);

for (const value of [1, 2, 3]) {
  Effect.fork(Effect.succeed(value));
}

const raceWithoutCleanup = Effect.race(
  Effect.succeed("fast"),
  Effect.succeed("slow"),
);

const unobservedFiber = Effect.fork(program);

const retryStorm = Effect.all(
  [1, 2, 3].map((value) => Effect.retry(Effect.succeed(value))),
);

declare const fs: { readonly readFileSync: (path: string) => string };

const blockingRead = Effect.sync(() => fs.readFileSync("/tmp/session.json"));

const promiseConcurrency = Effect.gen(function* () {
  Promise.allSettled([Promise.resolve(count)]);
});

let completedWorkers = 0;

const sharedMutableState = Effect.all(
  [1, 2, 3].map((value) => Effect.sync(() => {
    completedWorkers++;
    return value;
  })),
  { concurrency: 2 },
);

const timedOutPromise = Effect.timeout(
  Effect.promise(() => Promise.resolve(count)),
  "1 second",
);

declare const policy: any;
declare const loadUser: any;
declare const saveUser: any;
declare const auditUser: any;
declare const getUser: (id: string) => Effect.Effect<{ readonly id: string }, never, never>;
declare const id: string;
declare const User: {
  readonly toDto: (user: { readonly id: string }) => { readonly id: string };
};

const pipedYieldFlow = Effect.gen(function* () {
  yield* loadUser.pipe(Effect.retry(policy));
  yield* saveUser.pipe(Effect.timeout("5 seconds"));
});

const genForMapping = Effect.gen(function* () {
  const user = yield* getUser(id);
  return User.toDto(user);
});

const longSequencingPipeline = Effect.succeed(id).pipe(
  Effect.flatMap(loadUser),
  Effect.andThen(saveUser),
  Effect.tap(auditUser),
);

const graphqlCatchAll = pipe(
  wrapGraphqlCall({ query: "query" }),
  Effect.catchAll(() => Effect.succeed(count)),
);

Match.value(count).pipe(
  Match.when(1, () => Effect.succeed(count)),
);

const atomRegistrySync = Effect.sync(() => Atom.set({} as any, count));

const familyCollectionRead = Atom.family((id: string) => get(UsersCollectionAtom));

const inlineRuntimeProvide = Effect.gen(function* () {
  return yield* SomeRuntime.pipe(Effect.provide(SomeRuntimeLive));
});

const objectStatePatch = Ref.update({} as any, (state) => ({
  ...state,
  count,
}));

try {
  throw new Error("boom");
} catch {
  console.log("handled");
}

const pipeLadder = pipe(count, pipe(count, (value) => value));

Runtime.runFork(program);

void import("./lazy");
