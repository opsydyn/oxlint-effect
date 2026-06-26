const value = Math.random();

if (value > 0.5) {
  console.log("large");
}

switch (Math.floor(value)) {
  case 0:
    console.log("zero");
    break;
  default:
    console.log("other");
}
