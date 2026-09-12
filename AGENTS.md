# Project constraints

Build SludgeSense locally in VS Code with Next.js App Router, TypeScript, Tailwind CSS and npm. Preserve existing work and lockfile. Use npm.cmd and npx.cmd on Windows PowerShell; do not change execution policy.

## Scope
Current delivery is Stage 4: deterministic, explainable screening using the explicitly invented versioned demo profile. Input validation and CSV import are preserved. No regulatory approval, AI model or treatment simulation is implemented. Stage 1 foundation is preserved. Add future stages only when requested. One repository with frontend and server endpoints. Separate validation, screening, treatment and AI modules. No login, database, payment, IoT or marketplace. Future batch data starts in session memory. Demo must work without an API key. Do not publish or deploy unless explicitly requested.

## Scientific integrity
Decision support is not reuse certification. No invented references, accuracy metrics, laboratory results or treatment outcomes. Label synthetic samples and illustrative profiles. Missing critical measurements produce Insufficient data and must never be treated as zero. Keep measurement units and basis explicit. Rules determine statuses; optional AI may explain but never override them. Rule-based logic must not be described as a trained model. Preserve original measurements in future treatment simulations.

## Engineering
Keep keys server-side and out of git, logs, browser bundles and exports. Do not retain uploaded files unless requested. Preserve accessibility, responsive layouts and honest loading/empty/error states. Run production build and typecheck for relevant changes. Add focused logic tests when screening and validation are implemented; do not create tests merely mirroring static markup. Report limitations and distinguish mocked checks from live verification.

## Parameter scope
Use docs/DATA_REQUIREMENTS.md and src/lib/parameters.ts as the agreed parameter inventory. Preserve units, basis, method, analyte, qualifiers and provenance. Do not silently substitute related measurements or merge distinct biological tests. Runtime validation is not implemented by TypeScript types alone.



