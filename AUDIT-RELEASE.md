# ATLAS Website Manager — audited repair

## Changes
- Market catalog is scoped to each website; admin manual mappings take precedence over agent responses.
- A partial agent catalog no longer erases previously saved mappings.
- Deleted market name/ID tombstones block automatic recreation by the same agent; explicit manual edit/import can restore them.
- Import validates all rows and duplicate names/IDs before committing catalog changes.
- Website removal moves configuration into archivedWebsites, retaining history. Restore from Website Manager.
- Docker image now contains market-catalog.js and the initial data seed.
- Existing routes, 2FA, encrypted session credentials and tests are preserved.

## Limits / important operations
- This is a local source validation, NOT a claim of successful Railway deployment or real-agent verification.
- JSON-backed storage requires ONE application writer. Do not scale Railway replicas > 1 while using this store; concurrent instance writes are not transaction-safe.
- Keep persistent DATA_DIR volume and stable SESSION_CREDENTIAL_KEY. Backup volume before replacing the deployed image.
- Existing data in /data/store.json is deliberately not overwritten by seed files.
- Existing catalog entries from earlier deployments are preserved; no destructive migration.
- Syncing with real agent credentials and browser Playwright checks still require environment-specific testing.
- Restore from archive requires a matching administrator session; archive is not a separate backup.

## Validation
Run `npm run check` (76 tests, 0 fails in local run on Node 22.16.0).
