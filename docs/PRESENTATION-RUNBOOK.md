# UroRef Mega Hub presentation runbook

## The 8-minute route

1. Open `/showcase/` and say: “One stone, one source-led learning journey.”
2. Use the three journey cards: UroRef → CalyxView → UrOops3D.
3. Open the evidence desk and point out the visible source boundary, especially that NICE NG118 excludes the infected obstructed kidney.
4. Use the local model to demonstrate rotation; use phone AR only if the deployed HTTPS page has been device-tested.
5. Show the five-project portfolio, keeping ProstateView and Cystosight as adjacent demonstrations rather than extra stops in the stone story.
6. Finish on the 90-day pilot: one learning route, named reviewers, no patient data, a pre-agreed scorecard and a day-90 stop/iterate decision.

The guided-presentation button enters full-screen mode where supported. Arrow keys or Page Up/Page Down move between chapters; Escape exits.

## Offline contingency

The safest Sunday fallback is the completed static build served locally. It contains the search index and selected GLB, USDZ and poster assets without requiring an API.

Before travelling:

```sh
npm ci
npm run build
npm run check:links
npm run presentation
```

Then open `http://127.0.0.1:4321/showcase/` and test it with Wi-Fi disconnected. Do not open `dist/index.html` directly because browser security rules can block modules, search workers and 3D asset requests.

Keep these fallbacks ready:

- the production site in a second tab;
- the local presentation tab;
- a screen recording of the model interaction;
- one static screenshot of the stone journey;
- a copy of the final `dist/` folder on a second device.

The site may fall back to system fonts while offline. Core content, search and the selected 3D teaching asset remain local.

## Presentation claims

- Say “deployed” or “teaching prototype,” never “clinically validated” unless a specific study supports it.
- Say “links checked 27 Aug 2026,” not “verified” as a clinical-quality badge.
- Do not imply BAUS endorsement, patient outcome improvement, clinical competence or medical-device status.
- The BAUS President is **Mr Joe Philip**.
- This public showcase uses no patient record. Do not enter patient-identifiable information into search, Ariadne or a demonstration.
- Source dates, jurisdictions and exclusions stay visible; current originals, local policy, senior advice and clinical judgement remain authoritative.

## Final pre-room check

- Laptop power and charger connected.
- Browser zoom at 100%; notifications and sleep disabled for the meeting.
- `/showcase/`, search and guided mode tested at the room's display resolution.
- Model rotated once; static fallback visible with scripting disabled.
- Phone and laptop on the same reliable connection before attempting QR/AR hand-off.
- Contact QR and `/nity/` available as the final screen.
