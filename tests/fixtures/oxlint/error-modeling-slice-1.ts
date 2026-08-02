import { Effect } from "effect";

declare const program: any;

export function genericError(): Effect.Effect<string, Error, never> {
  return program;
}

export function unknownError(): Effect.Effect<string, unknown, never> {
  return program;
}

export function mixedError(): Effect.Effect<string, Error | string, never> {
  return program;
}

export function taggedError(): Effect.Effect<string, UserNotFound | UserForbidden, never> {
  return program;
}

declare class UserNotFound {
  readonly _tag: "UserNotFound";
}

declare class UserForbidden {
  readonly _tag: "UserForbidden";
}
