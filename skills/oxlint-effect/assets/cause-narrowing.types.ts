// Compile-only contract. Do not execute this file.
import { Effect } from "effect";
import { mapProfile, ProfileBoundaryFailure, ProviderFailure, toPublicFailure } from "./cause-narrowing.good";

declare const operation: Effect.Effect<string, ProviderFailure, "ProfileStore">;
declare const failure: ProfileBoundaryFailure;
const mapped = mapProfile(operation);
const preserved: Effect.Effect<string, ProfileBoundaryFailure, "ProfileStore"> = mapped;
// @ts-expect-error Mapping failures must not erase the dependency requirement.
const missingDependency: Effect.Effect<string, ProfileBoundaryFailure> = mapped;
// @ts-expect-error The new error is structured, not a string error channel.
const stringFailure: Effect.Effect<string, string, "ProfileStore"> = mapped;
// @ts-expect-error The public projection deliberately has no raw cause field.
toPublicFailure(failure).cause;
void preserved;
void missingDependency;
void stringFailure;
