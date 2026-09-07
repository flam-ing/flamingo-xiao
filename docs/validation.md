# Verification and evidence boundaries

## Automated — 24 tests

`npm test` covers:

- Title gating, movement bounds, facing, two-axis depth, and attack range.
- Pressed-edge attack handling instead of held-key auto-repeat.
- Recovery input buffering and early-buffer expiration.
- Jump physics and airborne attack selection.
- Real approaching-enemy parry and follow-up counter after hit-stop.
- Held guard producing blocks and spending guard stamina.
- Pause/input clearing, hit-stop X retention, and discarding queued actions on focus-reset hooks.
- Idle-player knockout through ordinary enemy attacks.
- Deterministic three-area victory using ordinary movement, jump, attack and guard inputs only.
- Restart cleanliness, stage-advance gating, timer expiration and practice timer behavior.
- Eleven finite joint positions over all move timelines, plus limb extension from anticipation to contact.
- A global native `[hidden]` override that outranks modal-button display rules; pause/help/result initial hidden flags, and rejection of next-area actions after loss/final victory.

`scripts/bot.mjs` observes the public simulation state and emits the same booleans that normal controls produce. It **does not** teleport the player, change HP, set an enemy dead, modify the score or assign a victory state. It calls `nextArea` only after the actual clear state. The tested strategy emphasizes approaching at the same depth and using timed flying kicks. It is a deterministic acceptance route, not a claim that a human played a perfect game or that difficulty is extensively balanced.

The initial baseline controller failed in the second area. The verified controller uses jump attacks and range control; the project did not turn that failed route into a passing result by editing HP. A no-input player loses through enemy attacks, establishing an ordinary failure path.

Two narrow tests deliberately set a short **timer** or **hit-stop** fixture to isolate those branches. They are unit fixtures, not gameplay-completion evidence. Geometry tests also construct small position examples to test facing/depth. The normal victory and knockout tests do not use those fixtures.

## Build and assets

`npm ci` installs the independent lockfile. `npm run build` produces the static game and local WOFF2 font. `public/licenses/Galmuri-OFL.txt` is copied into the build distribution. `npm audit` is a dependency check, not a gameplay-quality proof.

`npm run capture` uses the same renderer, assets and Galmuri TTF under `@napi-rs/canvas`. It saves one combat image per area during ordinary-input progression and a joint-track sheet. Those images are explicitly **offline CPU previews**. The developer inspected the monitor fight, three distinct desk environments and joint-track silhouettes.

## Browser boundary

Actual browser rendering, quick Z/X inputs, combo feedback, pause/resume, loss/retry, native hidden result buttons and 1280×720 fit were reviewed separately in [browser-qa.md](browser-qa.md). Pointer cancellation, multi-touch, every focus/visibility path and physical mobile devices remain unverified. This document does not claim unperformed UI checks.

The app implements a fixed 60 Hz simulation with capped catch-up, pending action edges, a minimum movement-tap pulse, and explicit clearing on pause/blur/hidden/restart. Those are code-level facts; their browser-level verification belongs in the root QA report. Full human three-area completion remains separate from the automated acceptance route.
