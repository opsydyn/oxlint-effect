import { Effect, flow } from "effect";

declare const loadVehicle: Effect.Effect<Vehicle, never, never>;

type Vehicle = {
  readonly id: string;
  readonly price: number;
};

const toDto = (vehicle: Vehicle) => ({ id: vehicle.id, price: vehicle.price });
const withLabel = (vehicle: { readonly id: string; readonly price: number }) => ({
  ...vehicle,
  label: vehicle.id.toUpperCase(),
});

const addSelection = (value: string) => `${value}:selected`;
const addRoute = (value: string) => `${value}/details`;
const addSummary = (value: string) => ({ value });

// EXPECT: linteffect/no-large-anonymous-flow
// QA: large pure transformations should be extracted to a named domain mapper.
const largeAnonymousVehicleCard = flow(
  toDto,
  withLabel,
  (vehicle) => ({ ...vehicle, href: `/vehicles/${vehicle.id}` }),
  (vehicle) => ({ ...vehicle, searchable: vehicle.label.toLowerCase() }),
  (vehicle) => ({ ...vehicle, selected: false }),
);

// EXPECT: linteffect/no-effect-in-flow
// QA: flow should stay pure; Effect work belongs in an Effect pipeline.
const effectfulTransformation = flow(
  toDto,
  Effect.map((vehicle) => vehicle.id),
);

// EXPECT: linteffect/prefer-named-flow
// QA: non-trivial flow callbacks should be named before being passed to Effect.map.
const inlineFlowCallback = Effect.map(
  loadVehicle,
  flow(
    toDto,
    withLabel,
    (vehicle) => ({ ...vehicle, selected: false }),
  ),
);

// EXPECT: linteffect/prefer-flow-for-pure-pipeline
// QA: A deep pure call tower hides a reusable transformation pipeline.
const nestedPureTransformation = addSummary(addRoute(addSelection("vehicle")));

void largeAnonymousVehicleCard;
void effectfulTransformation;
void inlineFlowCallback;
void nestedPureTransformation;
