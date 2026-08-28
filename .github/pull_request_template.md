## What changed

<!-- Summarise the user-visible change and link the approved design-system source. -->

## Design mapping

<!-- Map the major design-system components/tokens to the Astro/CSS implementation. -->

## Visual evidence

- [ ] Desktop homepage screenshot attached
- [ ] Mobile homepage screenshot attached
- [ ] Keyboard and visible-focus states checked
- [ ] 200% zoom and reduced motion checked

## UroRef safeguards

- [ ] Canonical five project names and supplied logos are preserved
- [ ] No unsupported metric, outcome, endorsement or clinical-use claim was added
- [ ] Educational-use boundaries and source limitations remain visible
- [ ] No patient data, real patient imaging or search/free-text analytics were introduced
- [ ] Existing routes and the shared `Base.astro` shell remain intact
- [ ] `public/prostateview/` was not overwritten unless explicitly in scope

## Verification

- [ ] `npm run build`
- [ ] `npm run check:logos`
- [ ] `npm run check:links`
- [ ] `npm run audit:production`
- [ ] `npm run eval:ariadne:fixtures`
- [ ] `npm run check:a11y`

## Publishing

- [ ] Pull request targets `master`
- [ ] Publishing to `uroref.com` is authorised in the current task/conversation
- [ ] After merge, the Pages workflow and deployed `uroref-build-ref` marker were verified
