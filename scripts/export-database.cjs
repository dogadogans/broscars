// Export public application records in one consistent, read-only snapshot.
// Credentials come from .env.local and are never printed.
const fs = require('node:fs');
const path = require('node:path');
const { loadEnvConfig } = require('@next/env');
const { Client } = require('pg');

loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.SUPABASE_DB_URL) throw Object.assign(new Error(), { code: 'MISSING_DATABASE_URL' });
  const connectionUrl = new URL(process.env.SUPABASE_DB_URL);
  // Prevent URI SSL options from overriding the verified certificate configuration.
  for (const key of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) connectionUrl.searchParams.delete(key);
  const ca = fs.readFileSync(path.join(__dirname, 'supabase-ca.crt'), 'utf8');
  const client = new Client({ connectionString: connectionUrl.toString(), ssl: { ca, rejectUnauthorized: true }, connectionTimeoutMillis: 15000, query_timeout: 60000 });
  try {
    await client.connect();
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const { rows: names } = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    const tables = {};
    for (const { tablename } of names) {
      const quoted = '"' + tablename.replace(/"/g, '""') + '"';
      // Let Postgres serialize values, preserving timestamp precision and numeric values.
      const { rows } = await client.query(`SELECT row_to_json(t)::text AS record FROM public.${quoted} t`);
      tables[tablename] = rows.map(row => row.record);
    }
    await client.query('COMMIT');
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = path.join(process.cwd(), 'local-backups');
    fs.mkdirSync(dir, { recursive: true });
    const destination = path.join(dir, `supabase-records-${stamp}.json`);
    const contents = '{"formatVersion":1,"exportedAt":' + JSON.stringify(new Date().toISOString()) + ',"schema":"public","tables":{' + Object.entries(tables).map(([name, rows]) => JSON.stringify(name) + ':[' + rows.join(',') + ']').join(',') + '}}';
    JSON.parse(contents);
    fs.writeFileSync(destination, contents, { flag: 'wx', mode: 0o600 });
    console.log('Application record export saved: ' + destination);
    for (const [name, rows] of Object.entries(tables)) console.log(`${name}: ${rows.length} records`);
  } finally {
    await client.end();
  }
}

main().catch(error => {
  // Avoid exposing connection URLs, credentials, or row data in error messages.
  console.error('Export failed. Error code: ' + (error.code || 'UNKNOWN'));
  process.exitCode = 1;
});
