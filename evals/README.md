# Ariadne evaluation boundary

`promptfoo.fixtures.yaml` is a deterministic, offline contract check. It proves that the evaluation rules execute and that the expected answer shapes include citations, abstention, scope boundaries and refusal of patient-identifiable data. It does **not** test the live Ariadne model.

Run it with:

```sh
npm run eval:ariadne:fixtures
```

`promptfoo.live.yaml` is deliberately gated. Point `ARIADNE_EVAL_ENDPOINT` only at an approved evaluation endpoint that returns `{ "answer": "..." }`, then run:

```sh
npm run eval:ariadne:live
```

The live suite is a starting set, not a clinical-safety case. Add adversarial cases, source-ground-truth checks, named ownership and review thresholds before reporting model performance.
