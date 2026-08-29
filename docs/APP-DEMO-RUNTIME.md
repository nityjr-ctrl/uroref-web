# UroRef interactive app preview

The browser preview at `/try/` runs the production web payload packaged inside the official UroRef Android APK. It is not a hand-authored mock-up and it does not run Android bytecode in the browser.

## Provenance

- Google Play Console production release: `3.1.1` (`versionCode 70`), released 10 July 2026
- Android package: `com.nityg.uroref`; minimum SDK 22; target SDK 35
- Original Console bundle: `70.aab`; SHA-256 `DFB39DA01E37529D58728E2FF66EE081406141C5D51E900AB26955EBA53E90C8`
- Play-signed universal APK: Console file `70.apk` (saved locally as `70 (1).apk`); SHA-256 `061B485C550C7DC9E92C83EA95FD84D621E115C11B079655D165D8509DECBF3A`
- APK signature verification: v1, v2 and v3 verified; Google Play source stamp verified
- Play app-signing certificate SHA-256: `1B0D0ADB215E2DE72DEB95E4090A59A8D37AA73E2FDBF8F644C197A2C6DA3D21` (matches the prior production APK)
- AAB upload certificate SHA-256: `DD4149FCBA93F16A1447D321D90BD278B6444EA422EE5692F84B0CDFBF87F967` (the expected separate upload key)
- Google Play source-stamp certificate SHA-256: `3257D599A49D2C961A471CA9843F59D341A405884583FC087DF4237B733BBD6D`
- Packaged web payload: 20 files, 2,701,068 bytes; AAB and APK trees byte-identical; tree SHA-256 `856A8CCC736E40674A100D51A9CC9A43204D8F49F0200C98AE0AF599A74EDD2D`
- Packaged JavaScript: `main.bf23a7b9.js`; SHA-256 `FCBE4CAD36E1BEAFDA8233D9F704F7951188E86267A002F7593C857D7390EF23`
- Browser-adapted JavaScript: `main.6d7b4626.js`; SHA-256 `6D7B4626333629641B2586153DE706C36D98A3D7E0464E40685C2912E5D4D14C`
- Published CSS: `main.de79c777.css`; SHA-256 `95B80E13BF90CA1B947366355167F872BCD245F6CEDCDD897B44E82F9865E553`
- Published licence notice: `main.6d7b4626.js.LICENSE.txt`; SHA-256 `438E8719657F377607EAEB464FF664655CA0CA89EF38B7B1F22D854EE888E6EF`
- Browser-patched `index.html` SHA-256: `B89D753F815F2969D076CA70FE23EE2FAC714F0CBE46F040EAED9F4F707FF156`
- Browser-patched `manifest.json` SHA-256: `4D74E600FA6F3F7392EACA5AD1E6F21225C6A20A6FA666CEA085F3874F937823`

Only the Capacitor web payload is published under `public/app-demo/`: the production HTML, minified JavaScript and CSS, icons, and the JavaScript licence notice. Android DEX, signing material, native package metadata, source maps, Cordova bridge files and the Android service worker are not copied into the website.

The embedded `index.html` differs from the packaged file only to use relative asset URLs, point at local icons, add `noindex` plus a strict referrer policy, and darken low-contrast light-theme helper text. The wrapper page sandboxes the iframe and repeats the educational/no-patient-data boundary.

The published JavaScript has one deterministic browser-only accessibility adaptation, applied by `scripts/adapt-app-demo.mjs`: each procedure's open action and pin action are emitted as sibling buttons instead of one button nested inside another. Text, clinical data, navigation targets and event handlers are unchanged. The script verifies the original packaged hash and the exact source template before applying the change.

The signed Android manifest and Play release metadata are authoritative for `versionCode 70`. The embedded Capacitor config correctly carries app version `3.1.1` but retains a stale internal `buildCode 46`, which is not used for the published release identity.

## Updating the preview

Replace the runtime only from the official UroRef Play Console release. Before replacing it, record the package identity, version, bundle and APK SHA-256 values, signing certificate and source stamp; then re-run the site build, link check, accessibility check and interactive phone-viewport test.
