import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import ts from "typescript";
import { Effect } from "effect";
import plugin, * as exports from "../src/index";
import { decodeInvoiceId, decodeUserId, rejectTransfer, settleInvoice, TransferRejected } from "../skills/oxlint-effect/assets/domain.good";
import {
  createPaymentIntent,
  decodePaymentIntent,
  decodeSessionLease,
  decodeTransferCommand,
  encodePaymentIntent,
  encodeSessionLease,
  encodeTransferCommand,
  transferFunds,
} from "../skills/oxlint-effect/assets/domain-shapes.good";
import {
  canApplyDiscount as baselineDiscount,
  isApproved as baselineApproval,
} from "../skills/oxlint-effect/assets/domain-decisions.bad";
import {
  canApplyDiscount,
  cancelOrder,
  Cancelled,
  decodeLegacyOrderState,
  decodeOrderStatus,
  encodeLegacyOrderState,
  isApproved,
  Open,
  shipOrder,
  Shipped,
} from "../skills/oxlint-effect/assets/domain-decisions.good";

const root = path.resolve(import.meta.dir, "..");
const skillRoot = "skills/oxlint-effect";
const skillFiles = [
  `${skillRoot}/SKILL.md`,
  `${skillRoot}/references/configuration.md`,
  `${skillRoot}/references/domain-modeling.md`,
  `${skillRoot}/references/domain-decisions.md`,
  `${skillRoot}/references/domain-context.md`,
  `${skillRoot}/references/public-errors.md`,
  `${skillRoot}/references/error-preservation.md`,
  `${skillRoot}/assets/domain.bad.ts`,
  `${skillRoot}/assets/domain.good.ts`,
  `${skillRoot}/assets/domain-shapes.bad.ts`,
  `${skillRoot}/assets/domain-shapes.good.ts`,
  `${skillRoot}/assets/domain-decisions.bad.ts`,
  `${skillRoot}/assets/domain-decisions.good.ts`,
  `${skillRoot}/assets/domain-context.bad.ts`,
  `${skillRoot}/assets/domain-context.good.ts`,
  `${skillRoot}/assets/public-errors.bad.ts`,
  `${skillRoot}/assets/public-errors.good.ts`,
  `${skillRoot}/assets/error-preservation.bad.ts`,
  `${skillRoot}/assets/error-preservation.good.ts`,
];

describe("agent skill contract", () => {
  it("ships a self-contained skill with valid rule and preset references", async () => {
    for (const file of skillFiles) {
      expect(await Bun.file(file).exists()).toBe(true);
      const text = await Bun.file(file).text();
      for (const match of text.matchAll(/linteffect\/([a-z0-9-]+)/g)) {
        expect(plugin.rules).toHaveProperty(match[1]!);
      }
      if (!file.endsWith(".md")) continue;
      for (const match of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
        const target = match[1]!;
        if (/^https?:/.test(target)) continue;
        expect(await Bun.file(path.resolve(path.dirname(file), target)).exists()).toBe(true);
      }
      for (const match of text.matchAll(/```ts\n([\s\S]*?)```/g)) {
        const source = ts.createSourceFile("snippet.ts", match[1]!, ts.ScriptTarget.Latest);
        for (const statement of source.statements) {
          if (!ts.isImportDeclaration(statement)
            || !ts.isStringLiteral(statement.moduleSpecifier)
            || statement.moduleSpecifier.text !== "@opsydyn/oxlint-effect") continue;
          const bindings = statement.importClause?.namedBindings;
          if (!bindings || !ts.isNamedImports(bindings)) continue;
          for (const specifier of bindings.elements) {
            expect(exports).toHaveProperty((specifier.propertyName ?? specifier.name).text);
          }
        }
      }
    }
    const entry = await Bun.file(`${skillRoot}/SKILL.md`).text();
    expect(entry).toMatch(/^---\nname: oxlint-effect\ndescription: .+\n---/);
  });

  it("packs the skill, its references, and all example controls", () => {
    const packed = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
      cwd: root, encoding: "utf8",
    });
    expect(packed.status).toBe(0);
    const result = JSON.parse(packed.stdout) as Array<{ files: Array<{ path: string }> }>;
    const paths = result[0]!.files.map((file) => file.path);
    for (const file of skillFiles) expect(paths).toContain(file);
  });

  it("reports every annotated failure and leaves the DDD repair clean", async () => {
    for (const pair of ["domain", "domain-shapes", "domain-decisions", "domain-context", "public-errors", "error-preservation"]) {
      const badPath = `${skillRoot}/assets/${pair}.bad.ts`;
      const bad = await Bun.file(badPath).text();
      const expected = [...bad.matchAll(/EXPECT: linteffect\/([a-z0-9-]+)/g)]
        .map((match) => match[1]!).sort();
      expect(expected).toHaveLength(3);
      for (const file of [badPath, `${skillRoot}/assets/${pair}.good.ts`]) {
        const result = spawnSync(path.join(root, "node_modules/.bin/oxlint"), [
          "--config", "tests/fixtures/oxlint/oxlint.agent-skill.config.ts", file,
        ], { cwd: root, encoding: "utf8" });
        const observed = [...`${result.stdout}${result.stderr}`.matchAll(/linteffect\(([^)]+)\)/g)]
          .map((match) => match[1]!).sort();
        expect(result.status).toBe(file === badPath ? 1 : 0);
        expect(observed).toEqual(file === badPath ? expected : []);
      }
    }
  });

  it("typechecks the failure examples and repaired domain contracts", () => {
    const result = spawnSync(path.join(root, "node_modules/.bin/tsc"), [
      "--noEmit", "--strict", "--skipLibCheck", "--target", "ES2022",
      "--module", "ESNext", "--moduleResolution", "Bundler",
      `${skillRoot}/assets/domain.bad.ts`, `${skillRoot}/assets/domain.good.ts`,
      `${skillRoot}/assets/domain-shapes.bad.ts`, `${skillRoot}/assets/domain-shapes.good.ts`,
      `${skillRoot}/assets/domain-decisions.bad.ts`, `${skillRoot}/assets/domain-decisions.good.ts`,
      `${skillRoot}/assets/domain-context.bad.ts`, `${skillRoot}/assets/domain-context.good.ts`,
      `${skillRoot}/assets/public-errors.bad.ts`, `${skillRoot}/assets/public-errors.good.ts`,
      `${skillRoot}/assets/error-preservation.bad.ts`, `${skillRoot}/assets/error-preservation.good.ts`,
      "tests/fixtures/agent-skill-domain-types.ts",
      "tests/fixtures/agent-skill-domain-decisions-types.ts",
      "tests/fixtures/agent-skill-domain-context-types.ts",
      "tests/fixtures/agent-skill-public-errors-types.ts",
      "tests/fixtures/agent-skill-error-preservation-types.ts",
    ], { cwd: root, encoding: "utf8" });
    expect(`${result.stdout}${result.stderr}`).toBe("");
    expect(result.status).toBe(0);
  });

  it("preserves both notification payloads and exposes structured failure context", () => {
    const invoiceId = decodeInvoiceId("invoice-1");
    expect(settleInvoice(invoiceId, "Notify")).toEqual({ invoiceId, shouldNotifyCustomer: true });
    expect(settleInvoice(invoiceId, "Silent")).toEqual({ invoiceId, shouldNotifyCustomer: false });
    expect(() => decodeUserId(123)).toThrow();
    expect(() => decodeUserId("")).toThrow();
    const userId = decodeUserId("user-1");
    const failure = Effect.runSync(Effect.flip(rejectTransfer(userId)));
    expect(failure).toBeInstanceOf(TransferRejected);
    expect(failure._tag).toBe("TransferRejected");
    expect(failure.userId).toBe(userId);
    expect(failure.reason).toBe("not allowed");
  });

  it("retains transfer fields and avoids invented amount or identifier constraints", () => {
    for (const transferAmount of [0, -12.5, 12.5]) {
      const input = { fromAccountId: "", toAccountId: "account-2", transferAmount };
      const command = decodeTransferCommand(input);
      expect(encodeTransferCommand(transferFunds(command))).toEqual(input);
    }
    expect(() => decodeTransferCommand({ fromAccountId: 1, toAccountId: "account-2", transferAmount: 12.5 })).toThrow();
    expect(() => decodeTransferCommand({ fromAccountId: "account-1", toAccountId: "account-2", transferAmount: "12.5" })).toThrow();
  });

  it("roundtrips epoch milliseconds without converting to seconds or reading the clock", () => {
    for (const expiresAt of [0, -1, 1700000000123, 1700000000123.5]) {
      expect(encodeSessionLease(decodeSessionLease({ expiresAt }))).toEqual({ expiresAt });
    }
    expect(() => decodeSessionLease({ expiresAt: "1700000000123" })).toThrow();
  });

  it("preserves optional memo omission and rejects invalid payment fields", () => {
    for (const input of [
      { invoiceId: "invoice-1", amount: 12.5 },
      { invoiceId: "invoice-1", amount: 12.5, memo: undefined },
      { invoiceId: "invoice-1", amount: 12.5, memo: "" },
      { invoiceId: "invoice-1", amount: 12.5, memo: "renewal" },
    ]) {
      const output = encodePaymentIntent(createPaymentIntent(decodePaymentIntent(input)));
      expect(output).toStrictEqual(input);
      expect(Object.hasOwn(output, "memo")).toBe(Object.hasOwn(input, "memo"));
    }
    expect(() => decodePaymentIntent({ invoiceId: "invoice-1" })).toThrow();
    expect(() => decodePaymentIntent({ invoiceId: "invoice-1", amount: 12.5, memo: 7 })).toThrow();
    expect(() => decodePaymentIntent({ invoiceId: "invoice-1", amount: 12.5, metadata: "extension" })).toThrow();
  });

  it("preserves supported status decisions and rejects unsupported boundary values", () => {
    for (const status of ["pending", "approved", "shipped", "cancelled"]) {
      expect(isApproved(decodeOrderStatus(status))).toBe(baselineApproval({ status }));
    }
    expect(() => decodeOrderStatus("lost")).toThrow();
    expect(() => decodeOrderStatus(1)).toThrow();
  });

  it("preserves the discount truth table, including threshold and non-finite inputs", () => {
    for (const total of [99, 100, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
      for (const itemCount of [1, 2, 3, Number.NaN]) {
        for (const discountPercentage of [19, 20, 21, Number.NaN]) {
          const candidate = { total, itemCount, discountPercentage };
          expect(canApplyDiscount(candidate)).toBe(baselineDiscount(candidate));
        }
      }
    }
  });

  it("roundtrips every valid flag state and rejects contradictory or malformed flags", () => {
    for (const input of [
      { cancelled: false, shipped: false },
      { cancelled: true, shipped: false },
      { cancelled: false, shipped: true },
    ]) {
      expect(encodeLegacyOrderState(decodeLegacyOrderState(input))).toStrictEqual(input);
    }
    expect(() => decodeLegacyOrderState({ cancelled: true, shipped: true })).toThrow();
    expect(() => decodeLegacyOrderState({ cancelled: false })).toThrow();
    expect(() => decodeLegacyOrderState({ cancelled: "false", shipped: false })).toThrow();
    expect(() => decodeLegacyOrderState({ cancelled: false, shipped: false, orderId: "order-1" })).toThrow();
    const extraShipped: { readonly _tag: "Shipped"; readonly cancelled: boolean } = {
      _tag: "Shipped", cancelled: true,
    };
    expect(() => encodeLegacyOrderState(extraShipped)).toThrow();
  });

  it("enforces the example transitions at runtime as well as at compile time", () => {
    const open = Open.make({});
    expect(encodeLegacyOrderState(shipOrder(open))).toStrictEqual({ cancelled: false, shipped: true });
    expect(encodeLegacyOrderState(cancelOrder(open))).toStrictEqual({ cancelled: true, shipped: false });
    expect(() => {
      // @ts-expect-error Unchecked JavaScript callers still receive a runtime rejection.
      cancelOrder(Shipped.make({}));
    }).toThrow();
    expect(() => {
      // @ts-expect-error Unchecked JavaScript callers still receive a runtime rejection.
      shipOrder(Cancelled.make({}));
    }).toThrow();
    const contradictoryOpen: {
      readonly _tag: "Open";
      readonly cancelled: boolean;
      readonly shipped: boolean;
    } = { _tag: "Open", cancelled: true, shipped: true };
    expect(() => shipOrder(contradictoryOpen)).toThrow();
    expect(() => cancelOrder(contradictoryOpen)).toThrow();
  });

  it("requires the deletion policy and propagates its structured denial", async () => {
    const { DeletionPolicy, DeletionDenied, deleteUserFromAdminPanel } = await import("../skills/oxlint-effect/assets/domain-context.good");
    const userId = decodeUserId("user-1");
    const checked: Array<typeof userId> = [];
    const allowed = Effect.provideService(deleteUserFromAdminPanel(userId), DeletionPolicy, {
      authorizeDelete: (candidate) => {
        checked.push(candidate);
        return Effect.void;
      },
    });
    expect(Effect.runSync(allowed)).toBe(userId);
    expect(checked).toEqual([userId]);
    const denial = new DeletionDenied({ userId, reason: "actor lacks deletion permission" });
    const denied = Effect.provideService(deleteUserFromAdminPanel(userId), DeletionPolicy, {
      authorizeDelete: () => Effect.fail(denial),
    });
    const failure = Effect.runSync(Effect.flip(denied));
    expect(failure).toBe(denial);
    expect(failure._tag).toBe("DeletionDenied");
    expect(failure.userId).toBe(userId);
    expect(failure.reason).toBe("actor lacks deletion permission");
  });

  it("makes expiry decisions from explicit epoch milliseconds at the inclusive boundary", async () => {
    const { isLeaseExpired, decodeEpochMillis } = await import("../skills/oxlint-effect/assets/domain-context.good");
    const lease = decodeSessionLease({ expiresAt: 1700000000123 });
    for (const [now, expired] of [[1700000000122, false], [1700000000123, true], [1700000000124, true]] as const) {
      expect(isLeaseExpired(lease, decodeEpochMillis(now))).toBe(expired);
    }
    expect(isLeaseExpired(decodeSessionLease({ expiresAt: -1 }), decodeEpochMillis(-1))).toBe(true);
    expect(isLeaseExpired(decodeSessionLease({ expiresAt: 0.5 }), decodeEpochMillis(0.25))).toBe(false);
    expect(() => decodeEpochMillis("1700000000123")).toThrow();
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => decodeEpochMillis(value)).toThrow();
      expect(() => isLeaseExpired(decodeSessionLease({ expiresAt: value }), decodeEpochMillis(0))).toThrow();
    }
    const uncheckedTime = decodeSessionLease({ expiresAt: Number.NaN }).expiresAt;
    expect(() => isLeaseExpired(lease, uncheckedTime)).toThrow();
  });

  it("preserves public operation successes and wraps generic errors without losing the cause", async () => {
    const { loadProfile, refreshSession, readInventory, ProfileUnavailable } = await import("../skills/oxlint-effect/assets/public-errors.good");
    expect(Effect.runSync(loadProfile(Effect.succeed("profile-1")))).toBe("profile-1");
    expect(Effect.runSync(refreshSession(Effect.succeed("session-1")))).toBe("session-1");
    expect(Effect.runSync(readInventory(Effect.succeed(7)))).toBe(7);
    const cause = new Error("storage offline");
    const failure = Effect.runSync(Effect.flip(loadProfile(Effect.fail(cause))));
    expect(failure).toBeInstanceOf(ProfileUnavailable);
    expect(failure._tag).toBe("ProfileUnavailable");
    expect(failure.cause).toBe(cause);
  });

  it("retains arbitrary unknown failure values without pretending they are known business errors", async () => {
    const { refreshSession, SessionRefreshFailed } = await import("../skills/oxlint-effect/assets/public-errors.good");
    for (const cause of [undefined, null, "transport closed", 0, false, { extension: "payload" }, new Error("offline")]) {
      const failure = Effect.runSync(Effect.flip(refreshSession(Effect.fail(cause))));
      expect(failure).toBeInstanceOf(SessionRefreshFailed);
      expect(failure._tag).toBe("SessionRefreshFailed");
      expect(failure.cause).toBe(cause);
      expect(Object.hasOwn(failure, "cause")).toBe(true);
    }
  });

  it("maps both mixed failure shapes and recovers selectively by tag", async () => {
    const { readInventory, InventoryRejected, InventoryUnavailable } = await import("../skills/oxlint-effect/assets/public-errors.good");
    for (const detail of ["", "not available"]) {
      const failure = Effect.runSync(Effect.flip(readInventory(Effect.fail(detail))));
      expect(failure).toBeInstanceOf(InventoryRejected);
      expect(failure._tag).toBe("InventoryRejected");
      if (failure._tag !== "InventoryRejected") throw new Error("unexpected error variant");
      expect(failure.detail).toBe(detail);
      const recovered = Effect.catchTag(Effect.fail(failure), "InventoryRejected", () => Effect.succeed(-1));
      expect(Effect.runSync(recovered)).toBe(-1);
    }
    for (const code of [0, -1, 503, Number.NaN]) {
      const failure = Effect.runSync(Effect.flip(readInventory(Effect.fail(code))));
      expect(failure).toBeInstanceOf(InventoryUnavailable);
      expect(failure._tag).toBe("InventoryUnavailable");
      if (failure._tag !== "InventoryUnavailable") throw new Error("unexpected error variant");
      expect(failure.code).toBe(code);
      const operation: Effect.Effect<number, InstanceType<typeof InventoryRejected> | InstanceType<typeof InventoryUnavailable>> = Effect.fail(failure);
      const unrecovered = Effect.catchTag(operation, "InventoryRejected", () => Effect.succeed(-1));
      expect(Effect.runSync(Effect.flip(unrecovered))).toBe(failure);
    }
  });

  it("leaves defects and interruptions outside the mapped typed error channel", async () => {
    const { Cause, Exit, Option } = await import("effect");
    const { loadProfile, refreshSession, readInventory } = await import("../skills/oxlint-effect/assets/public-errors.good");
    const defect = new Error("unexpected exception");
    const defectiveOperations: Array<Effect.Effect<unknown, unknown>> = [
      loadProfile(Effect.die(defect)), refreshSession(Effect.die(defect)), readInventory(Effect.die(defect)),
    ];
    for (const operation of defectiveOperations) {
      const exit = Effect.runSyncExit(operation);
      expect(Exit.isFailure(exit)).toBe(true);
      if (!Exit.isFailure(exit)) throw new Error("expected defect");
      expect(Option.getOrThrow(Cause.dieOption(exit.cause))).toBe(defect);
      expect(Option.isNone(Cause.failureOption(exit.cause))).toBe(true);
    }
    const interruptedOperations: Array<Effect.Effect<unknown, unknown>> = [
      loadProfile(Effect.interrupt), refreshSession(Effect.interrupt), readInventory(Effect.interrupt),
    ];
    for (const operation of interruptedOperations) {
      const exit = Effect.runSyncExit(operation);
      expect(Exit.isFailure(exit)).toBe(true);
      if (!Exit.isFailure(exit)) throw new Error("expected interruption");
      expect(Cause.isInterruptedOnly(exit.cause)).toBe(true);
    }
  });

  it("retains the original structured failure instead of its message or a generic rethrow", async () => {
    const { rejectProfile, rethrowProfile } = await import("../skills/oxlint-effect/assets/error-preservation.good");
    const { ProfileUnavailable } = await import("../skills/oxlint-effect/assets/public-errors.good");
    const cause = new Error("storage offline");
    const failure = new ProfileUnavailable({ cause });
    expect(Effect.runSync(Effect.flip(rejectProfile(failure)))).toBe(failure);
    const propagated = Effect.runSync(Effect.flip(rethrowProfile(Effect.fail(failure))));
    expect(propagated).toBe(failure);
    expect(propagated.cause).toBe(cause);
    expect(propagated._tag).toBe("ProfileUnavailable");
    expect(Effect.runSync(rethrowProfile(Effect.succeed("profile-1")))).toBe("profile-1");
  });

  it("logs once and preserves failure while leaving successful operations unlogged", async () => {
    const { Logger } = await import("effect");
    const { observeProfile } = await import("../skills/oxlint-effect/assets/error-preservation.good");
    const { ProfileUnavailable } = await import("../skills/oxlint-effect/assets/public-errors.good");
    const entries: Array<unknown> = [];
    const logger = Logger.make(({ message }) => entries.push(message));
    const logging = Logger.replace(Logger.defaultLogger, logger);
    const failure = new ProfileUnavailable({ cause: new Error("offline") });
    const observed = Effect.provide(observeProfile(Effect.fail(failure)), logging);
    expect(Effect.runSync(Effect.flip(observed))).toBe(failure);
    expect(entries).toEqual([[failure]]);
    entries.length = 0;
    expect(Effect.runSync(Effect.provide(observeProfile(Effect.succeed("profile-1")), logging))).toBe("profile-1");
    expect(entries).toEqual([]);
  });
});
