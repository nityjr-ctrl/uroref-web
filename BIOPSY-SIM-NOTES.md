# Biopsy Simulator Notes

## Files added

- `public/prostateview/v2/biopsy-ar/index.html`
- `public/prostateview/v2/biopsy-ar/assets/biopsy-ar.css`
- `public/prostateview/v2/biopsy-ar/assets/biopsy-ar.js`
- `public/prostateview/models/biopsy/anatomical-scaffold.glb`
- `public/prostateview/models/biopsy/anatomical-scaffold.usdz`
- `BIOPSY-SIM-NOTES.md`

## Schema additions

- `assets.mriAxial`: preferred axial MRI image for the live axial panel. Falls back to `assets.mriSource` when absent.
- `assets.mriSagittal`: preferred sagittal MRI image for the live sagittal panel. `null` triggers the schematic reconstructed sagittal fallback.
- `targetSextant`: explicit lesion sextant in `{left,right}-{anterior,mid,posterior}` form. The simulator falls back to `target.side` plus `target.ap` when absent.

## Model directory

- AR scaffold assets are wired from `/prostateview/models/biopsy/`.
- Current files are placeholders copied from the TURP scaffold convention so the route can launch `<model-viewer>` and iOS Quick Look while final biopsy meshes are validated.

## Placeholders and schematic panels

- The sagittal panel is currently a labelled schematic reconstructed sagittal for the demo case because no verified source sagittal asset is present.
- The AR scaffold is a placeholder mesh pair and is labelled as a secondary teaching scaffold only.

## TODOs

- Replace `/prostateview/models/biopsy/anatomical-scaffold.glb` and `.usdz` with a validated prostate plus sextant teaching scaffold.
- Add verified sagittal source assets per exercise and set `assets.mriSagittal`.
- Validate final lesion and sextant placements against teaching case metadata before adding more exercises.
