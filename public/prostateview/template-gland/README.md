# Template Gland Assets

This folder is reserved for the generated template-gland assets used by the report checklist visualiser.

Real assets are generated offline with:

```powershell
python scripts/template_mesh_pipeline.py --output public/template-gland --require-draco
```

If the visual orientation needs a human-reviewed trial remap, pass one explicit axis flag:

```powershell
python scripts/template_mesh_pipeline.py --output public/template-gland --require-draco --axes=-y,z,x
```

`--axes` is a mechanical output transform only. It does not determine or assert the correct anatomical orientation. The default is `x,y,z`.

The pipeline resamples masks to isotropic spacing before marching cubes to reduce low-slice terracing. By default it targets the smallest input voxel spacing. Use `--isotropic-spacing-mm 1.0` to set a spacing explicitly, or `--no-isotropic-resample` to disable that step.

Preview the real derived assets at:

```text
/template-gland/preview.html
```

Preview the synthetic dry-run at:

```text
/template-gland/preview.html?dryrun=1
```

Do not place source imaging here. Do not commit real generated meshes until the ProstateZones / PROSTATEx licence has been verified for the intended published use.

Dry-run outputs are written to `_dryrun/` and ignored by git.
