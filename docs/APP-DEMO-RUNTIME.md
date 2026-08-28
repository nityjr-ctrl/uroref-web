# UroRef interactive app preview

The browser preview at `/try/` runs the production web payload packaged inside the official UroRef Android APK. It is not a hand-authored mock-up and it does not run Android bytecode in the browser.

## Provenance

- Source package: `63.apk`
- Android package: `com.nityg.uroref`
- Release: `3.0.1` (`versionCode 63`)
- Source APK SHA-256: `23ED59D2250FBEDA6A21CF97CC6786C901E5C268C4E29798D254A1EE8F021F63`
- APK signature verification: v1, v2 and v3 verified; Google Play source stamp verified

Only the Capacitor web payload is published under `public/app-demo/`: the production HTML, minified JavaScript and CSS, icons, and the JavaScript licence notice. Android DEX, signing material and native package metadata are not copied into the website.

The embedded `index.html` differs from the packaged file only to use relative asset URLs, point at local icons, add `noindex` plus a strict referrer policy, and darken the light-theme `#94a3b8` helper text that failed WCAG AA contrast. The wrapper page sandboxes the iframe and repeats the educational/no-patient-data boundary.

## Updating the preview

Replace the runtime only from a user-supplied official UroRef APK. Before replacing it, record the package identity, version, APK SHA-256 and signing certificate; then re-run the site build, link check, accessibility check and interactive phone-viewport test.
