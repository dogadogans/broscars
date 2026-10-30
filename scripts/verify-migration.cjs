// Run against a local production server using Neon. Temporary test records are removed.
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
require('@next/env').loadEnvConfig(process.cwd());
const base = 'http://localhost:3100';
const original = 'https://broscars.vercel.app';
const backupName = fs.readdirSync('local-backups').filter(n => /^supabase-records-.*\.json$/.test(n)).sort().at(-1);
const backup = JSON.parse(fs.readFileSync(path.join('local-backups', backupName), 'utf8')).tables;
function check(condition, label) { if (!condition) throw new Error(label); }
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, normalize(value[k])]));
  if (typeof value === 'string' && /^\d{4}-\d\d-\d\dT/.test(value) && !Number.isNaN(Date.parse(value))) return new Date(value).toISOString();
  return value;
}
const equal = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
async function request(url, options) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
  const json = await response.json();
  return { status: response.status, ...json };
}
async function post(route, body, headers = {}, expected = 200) {
  const result = await request(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
  check(result.status === expected, `Unexpected status for ${route}`);
  if (expected < 400) check(!result.error, `API error for ${route}`);
  return result.data;
}

async function main() {
  for (const route of ['/api/years', '/api/all-time', ...backup.years.flatMap(y => ['state', 'nominees', 'participants', 'picks', 'results'].map(s => `/api/${y.year}/${s}`))]) {
    const [before, after] = await Promise.all([request(original + route), request(base + route)]);
    check(before.status === 200 && after.status === 200, `Read failed: ${route}`);
    check(equal(before, after), `Response mismatch: ${route}`);
    console.log('Matches live Supabase: ' + route);
  }
  for (const user of backup.users) {
    for (const y of backup.years) {
      const route = `/api/${y.year}/my-picks`;
      const options = { headers: { 'x-device-token': user.token } };
      const [before, after] = await Promise.all([request(original + route, options), request(base + route, options)]);
      check(before.status === 200 && after.status === 200 && equal(before, after), 'Existing player token/picks mismatch');
    }
  }
  console.log('All existing player tokens and personal picks match.');

  const url = new URL(process.env.DATABASE_URL); url.searchParams.set('sslmode', 'verify-full');
  const client = new Client({ connectionString: url.toString(), connectionTimeoutMillis: 15000 });
  let testYearId, testUserId;
  const year = 9900 + Math.floor(Math.random() * 99);
  const token = randomUUID(), name = 'migration-check-' + randomUUID().slice(0, 8);
  const admin = { 'x-admin-password': process.env.ADMIN_PASSWORD };
  try {
    await client.connect();
    check((await client.query('SELECT 1 FROM years WHERE year=$1', [year])).rowCount === 0, 'Test year already exists');
    const categories = [{ name: 'Migration category', name_tr: 'Migration category', group: 'solo_picture', order_index: 1, nominees: [{ name: 'Winner' }, { name: 'Other' }] }];
    await post(`/api/${year}/admin/nominees`, { categories }, {}, 401);
    await post(`/api/${year}/admin/nominees`, { categories }, admin);
    testYearId = (await client.query('SELECT id FROM years WHERE year=$1', [year])).rows[0].id;
    const joined = await post('/api/users', { display_name: name, pin: '1742', token, year }, {}, 201);
    testUserId = joined.user.id;
    const again = await post('/api/users', { display_name: name, token, year });
    check(again.user.id === testUserId, 'Token rejoin mismatch');
    await post('/api/users', { display_name: name, pin: '0000', token: randomUUID(), year }, {}, 401);
    const replacementToken = randomUUID();
    await post('/api/users', { display_name: name, pin: '1742', token: replacementToken, year });
    const nominees = await request(base + `/api/${year}/nominees`);
    const category = nominees.data[0];
    const winner = category.nominees.find(n => n.name === 'Winner');
    const other = category.nominees.find(n => n.name === 'Other');
    const picks = [{ category_id: category.id, head_nominee_id: winner.id, heart_nominee_id: other.id, note: "Migration check: ' quotes and Türkçe" }];
    const auth = { 'x-device-token': replacementToken };
    await post(`/api/${year}/picks`, { picks }, auth);
    await post(`/api/${year}/picks`, { picks }, auth);
    const personal = await request(base + `/api/${year}/my-picks`, { headers: auth });
    check(personal.data.submitted_count === 1 && personal.data.picks[0].pick.note === picks[0].note, 'Pick upsert mismatch');
    check((await request(base + `/api/${year}/participants`)).data.count === 1, 'Duplicate participation');
    await post(`/api/${year}/admin/winners`, { winners: [{ nominee_id: winner.id }] }, admin);
    await post(`/api/${year}/admin/nominees`, { categories }, admin);
    check((await client.query('SELECT is_winner FROM nominees WHERE id=$1', [winner.id])).rows[0].is_winner, 'Nominee reimport lost winner');
    await post(`/api/${year}/admin/state`, { state: 'results' }, admin);
    const results = await request(base + `/api/${year}/results`);
    check(results.data.length === 1 && results.data[0].score === 1 && results.data[0].heart_correct === 0 && results.data[0].rank === 1, 'Scoring/ranking mismatch');
    await post(`/api/${year}/picks`, { picks }, auth, 403);
    console.log('Passed: admin authorization, join, PIN recovery, participation, pick upsert, winners, scoring, voting lock.');
  } finally {
    if (testYearId) await client.query('DELETE FROM years WHERE id=$1', [testYearId]);
    if (testUserId) await client.query('DELETE FROM users WHERE id=$1', [testUserId]);
    await client.end();
  }
  console.log('Temporary test records removed.');
}
main().catch(error => { console.error(error.code ? 'Verification failed: ' + error.code : error.message); process.exitCode = 1; });
