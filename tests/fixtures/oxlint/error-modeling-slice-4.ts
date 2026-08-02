import { Data } from "effect";

type EmptyError = {
  readonly _tag: "EmptyError";
};

interface EmptyInterfaceError {
  readonly _tag: "EmptyInterfaceError";
}

class EmptyTaggedError extends Data.TaggedError("EmptyTaggedError") {}

type RichError = {
  readonly _tag: "RichError";
  readonly reason: string;
};

class RichTaggedError extends Data.TaggedError("RichTaggedError")<{
  readonly reason: string;
}> {}

void EmptyError;
void EmptyInterfaceError;
void EmptyTaggedError;
void RichError;
void RichTaggedError;
