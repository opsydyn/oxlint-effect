async function loadValue(): Promise<number> {
  return 1;
}

// EXPECT: typescript/no-floating-promises
// QA: The stable Oxc type-aware engine must report the unhandled Promise.
loadValue();

const values = [1, 2, 3];

// EXPECT: typescript/no-misused-promises
// QA: The callback returns a Promise where the consumer expects void.
values.forEach(async (value) => {
  await loadValue();
  void value;
});
