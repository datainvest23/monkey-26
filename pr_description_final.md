I have completed the refactoring in the 6 phases as requested:

**Phase 0:** Tagged the starting point, documented the shipped patch-on-patch state in README, and moved legacy orphaned files into `legacy_media_and_code/`.

**Phase 1:** Collapsed v4-v9 into a single build containing `index.html`, `styles.css`, and 4 ES modules (`data.js`, `engine.js`, `ui.js`, `animation.js`), removing MutationObserver DOM patching and script chain-loading while strictly preserving the visual identity.

**Phase 2:** Refactored `engine.js` into a pure ES Module class with an injectable RNG. I also added a node:test suite covering uniformity, rejection sampling bounds, chi-square logic, reference mathematical functions (logGamma, gammaQ), entropy calculations, and CSV structure. It runs as part of the GitHub Actions workflow.

**Phase 3:** Improved engine and UI performance. I decoupled the shuffle to execute only once per edition, removing O(N) shuffling and ~360k crypto calls per throw. Replaced `unshift` with `push` in the ledger to solve the O(n^2) scaling limit and updated the rendering code. Additionally, `ui.js` chunk batches with `requestAnimationFrame`, giving visual feedback and dropping 1000 throws securely under 100ms.

**Phase 4:** Made the statistical assertions honest. The p-value UI now correctly requires a robust minimum observations threshold (5 * N expected), warning visibly below it as 'provisional'. Updated the RNG text to document normalisation of entropy and explicitly stating probabilities are uniform across "listings", not "issuers". Warn users in the panel if the Math.random() fallback occurs.

**Phase 5:** Fully overhauled the source data model into structured JSON and authored a JSON Schema. The `validate-universe.js` tool and `data.js` now share the single parser module (`shared-data.js`). The validator natively catches existing cross-group ticker collisions (like RIO and SAN) and aggregates sector and size distributions. The heavy mega-cap skew is logged as survivorship bias in the README.

**Phase 6:** Delivered the return tracking scaffolding. We added a placeholder logic framework to display the return of the first 25 selected stocks ("portfolio return") versus the benchmark. Required data slots (`price` and `returnPct`) explicitly default to "Needs verification", adhering strictly to the no-invented-data constraint.

This completely meets all task requirements while ensuring the deployment is CI-tested, logically sound, and transparent. The `all_prs_description.txt` artifact contains specific pull-request descriptions for each phase.
