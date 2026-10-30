# Broscars database migration

The app now uses PostgreSQL through `src/lib/db.ts`. Only server API routes can
access the connection. Scoring and ranking rules are unchanged.

## Configuration

- `DATABASE_URL`: Neon pooled PostgreSQL connection string (server-only).
- `ADMIN_PASSWORD`: retain the existing admin password.
- `MOCK_MODE=false`: use actual records.

Set these in the Vercel project environment before deploying the updated code.
The application no longer needs Supabase API environment variables. Keep the old
credentials privately until the migration is confirmed, for recovery/export.

## Backup and import

`node scripts/export-database.cjs` reads `SUPABASE_DB_URL` from `.env.local` and
uses `scripts/supabase-ca.crt` to verify TLS. It exports all public application
tables in a single read-only snapshot to the Git-ignored `local-backups` folder.
This is an application-record export, not a complete Postgres server dump.
Keep a separate private copy outside this project as well.

`node scripts/import-database.cjs <backup.json>` creates the schema from
`supabase/schema.sql`, using native `gen_random_uuid()`, and imports all seven
tables into an **empty** Neon database. It preserves IDs, player tokens, PIN
hashes, winners, picks, scores, and timestamps. Every record is compared before
committing. It refuses a nonempty target; do not clear a live database to rerun it.

## Validation

Run `npm run build` and `npm run lint`. Start the production server on port 3100:

```sh
npm run start -- -p 3100
node scripts/verify-migration.cjs
```

The verification script expects the live Broscars site still to use Supabase.
It compares public results and existing users' personal picks with local Neon,
then exercises a temporary year/player, PIN recovery, participation, pick upsert,
winners, scoring, and the voting lock. It deletes those temporary records.
Do not run the mutation checks during a live game.

## Cutover and recovery

Before switching, ensure nobody is submitting picks or changing winners and
check that source and target still match. Deploy the updated app with the Neon
environment configured, then check `/api/years`, nominees, picks, and rankings.
Keep the previous Vercel deployment and Supabase project until verification is
complete. Rolling back the code uses Supabase again; any new writes made to Neon
after cutover must be reconciled before rolling back, to avoid losing changes.
