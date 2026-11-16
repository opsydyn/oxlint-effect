import { expect, test } from "bun:test";
import * as Cookies from "@effect/platform/Cookies";
import { Either } from "effect";

// GHSA-chp3-j5qr-2vfr: untrusted fields must not append Set-Cookie attributes.
const attacks = [
  { field: "name", name: "session; Secure", options: {}, reason: "InvalidName" },
  { field: "domain", name: "session", options: { domain: "example.com; Domain=.example.com" }, reason: "InvalidDomain" },
  { field: "path", name: "session", options: { path: "/; SameSite=None" }, reason: "InvalidPath" },
] as const;

for (const attack of attacks) {
  test(`cookie construction rejects ${attack.field} attribute injection`, () => {
    const result = Cookies.makeCookie(attack.name, "token", attack.options);
    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) expect(result.left.reason).toBe(attack.reason);
  });

  test(`throwing cookie constructor rejects ${attack.field} attribute injection`, () => {
    expect(() => Cookies.unsafeMakeCookie(attack.name, "token", attack.options)).toThrow(attack.reason);
  });
}

test("legitimate cookie attributes and encoded values still serialize", () => {
  const result = Cookies.makeCookie("session", "token; value", {
    domain: "example.com", path: "/account", httpOnly: true, secure: true, sameSite: "lax",
  });
  expect(Either.isRight(result)).toBe(true);
  if (Either.isRight(result)) {
    expect(Cookies.serializeCookie(result.right)).toBe(
      "session=token%3B%20value; Domain=example.com; Path=/account; HttpOnly; Secure; SameSite=Lax",
    );
  }
});
