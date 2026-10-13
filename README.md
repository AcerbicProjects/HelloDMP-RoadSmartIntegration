# Hello DMP + RoadSmart prototype

A clickable, responsive web prototype of the existing Hello DMP app (six modules, rebuilt from screenshots and the v1.0.5 APK) extended with the DMP RoadSmart proposal and the workbook recommendations. It has three views: citizen app (`/`), officer app (`#/officer`) and control room (`#/admin`).

## Stack
React 18, TypeScript (strict), Vite 5, React Router (hash routes), Leaflet + OpenStreetMap, qrcode, lucide-react icons, Noto Sans Bengali. Tests: Playwright + axe-core (dev only).

## Run
```
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist on http://localhost:4173
node tests/crawl.mjs   # route crawl at phone/tablet/desktop (needs preview running)
node tests/flows.mjs   # 18 end-to-end workflows
node tests/a11y.mjs    # axe WCAG A/AA scan + offline reload check
```
`dist/` is a static build; it also works from any static file host.

## Mock data and simulated services
- Sample data lives in `src/data/seed.ts` (deterministic); all screens and dashboards read from the same store and it is saved in the browser (localStorage key `hellodmp-roadsmart-demo`). Nothing is sent to a server.
- Simulated: OTP (code shown on screen), NID/BRTA checks, payment gateway (no money moves), SMS, SOS dispatch, push (in-app inbox only), DARC submission. Each screen says so.
- Real in the browser: SHA-256 photo fingerprints, HMAC-signed QR codes (demo key in the client, so a demonstration only), service-worker offline cache.
- The assistant is keyword search over a small verified knowledge base, not an AI model.
- Settings → Demo controls: "Simulate network failure" to see error/retry states.

## Reset
Settings → Demo controls → **Reset demo data** (keeps language and consent), or **Delete my data** (full wipe).

## Needs verification
Online service name↔link pairing is inferred from APK resource order; the Women Support & Investigation Division card target (dmpwsid.gov.bd) is inferred; a second women & child number (01320-042085) and a hidden contact list in "Your complaint" exist in APK code but are not shown and were not used.

## Limitations
No backend, accounts or real integrations. Map tiles need internet. Camera QR scanning, voice input and read-aloud depend on browser support and were not tested headless (sample-scan fallbacks exist). Bangla copy is not reviewed by a native editor. See `HelloDMP_Feature_Report.pdf` for the full feature list and status.
