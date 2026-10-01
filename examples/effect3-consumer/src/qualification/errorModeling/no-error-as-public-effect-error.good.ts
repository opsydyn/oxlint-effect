import { Data, Effect } from "effect";

export class UserNotFound extends Data.TaggedError("UserNotFound")<{ readonly userId: string }> {}
export class UserForbidden extends Data.TaggedError("UserForbidden")<{ readonly userId: string }> {}
export function named(): Effect.Effect<string, UserNotFound | UserForbidden> { return Effect.fail(new UserNotFound({ userId: "user-1" })); }
export default function defaultOperation(): Effect.Effect<string, UserNotFound> { return Effect.fail(new UserNotFound({ userId: "user-1" })); }
export const arrow = (): Effect.Effect<string, UserNotFound> => Effect.fail(new UserNotFound({ userId: "user-1" }));
export const callable: () => Effect.Effect<string, UserNotFound> = () => Effect.fail(new UserNotFound({ userId: "user-1" }));
export const expression = function (): Effect.Effect<string, UserForbidden> { return Effect.fail(new UserForbidden({ userId: "user-1" })); };
// Non-exported errors and non-Effect return annotations are outside this public contract.
function privateOperation(): Effect.Effect<string, Error> { return Effect.fail(new Error("private")); }
export function plain(): Error { return new Error("plain"); }
void privateOperation;
