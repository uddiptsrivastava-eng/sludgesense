# Stage 2 verification

Completed 2026-09-12.

- Production build: passed.
- TypeScript check: passed.
- Browser: empty batch preview produced an actionable identifier error and focused the identifier input.
- All three samples loaded and produced their labelled demonstration stories.
- Changing a sample measurement marked the previous snapshot out of date.
- Comparison navigation displayed four Not assessed pathways.
- Treatment navigation displayed the planned three-step workflow and no generated plan.
- Biological category displayed fecal coliform, E. coli, helminth and other pathogen fields separately.
- Clear draft restored blank fields and empty preview.
- Mobile 390px viewport inspected; document scrollWidth equalled clientWidth (375px excluding scrollbar), no horizontal overflow.
- Desktop 1440px viewport visually inspected.
- Browser error log: no errors captured during these checks.
- Port 3000 failed with Windows EACCES; local preview succeeded at 127.0.0.1:3100.

## Manual walkthrough
1. Open the app, click Preview assessment layout with no batch ID and check the error.
2. Choose SYN-001; preview its synthetic story.
3. Change moisture and check the stale banner; refresh the preview and check Unassessed batch.
4. Switch between all three views and confirm draft values remain.
5. Open each parameter category and expand result notes.
6. Load SYN-002 and SYN-003 and preview each.
7. Clear draft and confirm the empty state. Reload and confirm no data persists.
8. Use Tab to navigate controls and test the narrow layout.

Full regulatory validation, scientific screening, CSV parsing, repeated observations, AI and exports are not part of Stage 2. Keyboard styling/labels are implemented; a full accessibility audit was not performed.
