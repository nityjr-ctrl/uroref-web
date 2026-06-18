# ProstateView mirror latest state

Last updated: 2026-06-18 16:05 Europe/London

This UroRef repository serves the ProstateView static mirror at:

- https://uroref.com/prostateview/v2/
- https://uroref.com/prostateview/viewer/pv-case-001/
- https://uroref.com/prostateview/v2/template-report-visualiser/

Authoritative ProstateView source repo:

```text
nityjr-ctrl/prostateview-web
```

Authoritative handover file in the ProstateView source repo:

```text
LATEST_VERSION_AND_CLAUDE_HANDOVER.md
```

Latest UroRef mirror functional baseline commit:

```text
aa7f69059cb99f9203fe40e6c11f248a2965071a
Fix ProstateView AR side labels
```

Current AR asset cache tag:

```text
side-labels-20260618
```

Important convention: in the apex-facing / lithotomy view, patient `R` appears on viewer-left and patient `L` appears on viewer-right. GLB and USDZ assets must both be checked for any AR-side-label work.

Do not hand-edit `public/prostateview` as source. Rebuild ProstateView, sync the generated `dist` into `public/prostateview`, build UroRef, then push the mirror.
