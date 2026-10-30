// Import a private export into an empty Neon database. All changes are atomic.
const fs = require('node:fs');
const path = require('node:path');
const { loadEnvConfig } = require('@next/env');
const { Client } = require('pg');
loadEnvConfig(process.cwd());
const order = ['years', 'categories', 'nominees', 'users', 'picks', 'year_participants', 'scores'];
const canonical = value => JSON.stringify(value, Object.keys(value).sort());
const normalizedRows = rows => rows.map(canonical).sort();

async function main() {
  const source = process.argv[2];
  if (!source || !process.env.DATABASE_URL) throw Object.assign(new Error(), { code: 'MISSING_INPUT' });
  const backup = JSON.parse(fs.readFileSync(source, 'utf8'));
  if (backup.formatVersion !== 1 || Object.keys(backup.tables).sort().join() !== [...order].sort().join()) throw Object.assign(new Error(), { code: 'UNEXPECTED_BACKUP_TABLES' });
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('sslmode', 'verify-full');
  const client = new Client({ connectionString: url.toString(), connectionTimeoutMillis: 15000 });
  try {
    await client.connect();
    await client.query('BEGIN');
    const { rows } = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
    if (rows.length) throw Object.assign(new Error(), { code: 'TARGET_NOT_EMPTY' });
    const schema = fs.readFileSync(path.join(__dirname, '../supabase/schema.sql'), 'utf8')
      .replace('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', '')
      .replaceAll('uuid_generate_v4()', 'gen_random_uuid()');
    await client.query(schema);
    for (const table of order) {
      const records = backup.tables[table];
      const { rows: columns } = await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position", [table]);
      const names = columns.map(c => c.column_name);
      for (const row of records) {
        if (Object.keys(row).sort().join() !== [...names].sort().join()) throw Object.assign(new Error(), { code: 'SCHEMA_MISMATCH_' + table });
      }
      await client.query(`INSERT INTO public."${table}" SELECT * FROM json_populate_recordset(NULL::public."${table}", $1::json)`, [JSON.stringify(records)]);
      const { rows: actual } = await client.query(`SELECT row_to_json(t)::text AS record FROM public."${table}" t`);
      if (JSON.stringify(normalizedRows(actual.map(r => JSON.parse(r.record)))) !== JSON.stringify(normalizedRows(records))) throw Object.assign(new Error(), { code: 'VERIFICATION_FAILED_' + table });
      console.log(`${table}: ${records.length} records matched exactly`);
    }
    await client.query('COMMIT');
    console.log('Import committed. All seven tables match the source export.');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}
main().catch(error => {
  console.error('Import failed; transaction rolled back. Error code: ' + (error.code || 'UNKNOWN'));
  process.exitCode = 1;
});
