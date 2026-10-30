import 'server-only'
import { Pool, types } from 'pg'
import type { Year, Category, Nominee, User, UserPick, Score, PickWithDetails } from '@/types'

type Tables = {
  years: Year; categories: Category; nominees: Nominee; users: User;
  picks: UserPick; scores: Score;
  year_participants: { user_id: string; year_id: string; joined_at: string }
}
export type PickRow = UserPick & Omit<PickWithDetails, 'pick'>

const globalDb = globalThis as typeof globalThis & { broscarsPool?: Pool }
function pool() {
  if (!globalDb.broscarsPool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured')
    const url = new URL(process.env.DATABASE_URL)
    url.searchParams.set('sslmode', 'verify-full')
    globalDb.broscarsPool = new Pool({
      connectionString: url.toString(), max: 3, idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000, statement_timeout: 30000,
      allowExitOnIdle: true,
      types: { getTypeParser: (oid, format) => oid === 1184
        ? (value: string) => new Date(value).toISOString()
        : types.getTypeParser(oid, format) },
    })
    globalDb.broscarsPool.on('error', () => console.error('Idle database connection failed'))
  }
  return globalDb.broscarsPool
}

// Keep database details and user values out of route logs and API responses.
function safeError(error: unknown): Error {
  const code = (error as { code?: string })?.code
  return new Error(`Database query failed${code && /^[A-Z0-9_]+$/.test(code) ? ` (${code})` : ''}`)
}

async function many<T>(sql: string, values: unknown[] = []): Promise<{ data: T[]; error: Error | null }> {
  try {
    const result = await pool().query(sql, values)
    return { data: result.rows as T[], error: null }
  } catch (error) {
    return { data: [], error: safeError(error) }
  }
}

async function one<T>(sql: string, values: unknown[] = []): Promise<{ data: T | null; error: Error | null }> {
  const result = await many<T>(sql, values)
  if (result.error) return { data: null, error: result.error }
  if (result.data.length > 1) return { data: null, error: new Error('Expected at most one database record') }
  return { data: result.data[0] ?? null, error: null }
}

async function count(sql: string, values: unknown[] = []) {
  const result = await one<{ count: number }>(sql, values)
  return { count: result.data?.count ?? 0, error: result.error }
}

function identifier(value: string) {
  if (!/^[a-z_][a-z_0-9]*$/.test(value)) throw new Error('Invalid database identifier')
  return `"${value}"`
}

// Table/column names come only from server code; all record values are bound parameters.
async function write<K extends keyof Tables>(
  table: K, input: Partial<Tables[K]> | Partial<Tables[K]>[],
  conflict?: string, ignoreDuplicates = false,
) {
  const rows = Array.isArray(input) ? input : [input]
  if (!rows.length) return { data: [] as Tables[K][], error: null }
  const columns = Object.keys(rows[0])
  if (rows.some(row => Object.keys(row).sort().join() !== [...columns].sort().join())) {
    return { data: [] as Tables[K][], error: new Error('Inconsistent database record columns') }
  }
  const values: unknown[] = []
  const tuples = rows.map(row => '(' + columns.map(column => {
    values.push((row as Record<string, unknown>)[column])
    return `$${values.length}`
  }).join(', ') + ')')
  let sql = `INSERT INTO ${identifier(table)} (${columns.map(identifier).join(', ')}) VALUES ${tuples.join(', ')}`
  if (conflict) {
    const keys = conflict.split(',').map(key => key.trim())
    const updated = columns.filter(column => !keys.includes(column))
    sql += ` ON CONFLICT (${keys.map(identifier).join(', ')}) DO `
    sql += ignoreDuplicates || !updated.length ? 'NOTHING' : 'UPDATE SET ' + updated.map(column => `${identifier(column)} = EXCLUDED.${identifier(column)}`).join(', ')
  }
  return many<Tables[K]>(sql + ' RETURNING *', values)
}

async function writeOne<K extends keyof Tables>(table: K, row: Partial<Tables[K]>, conflict?: string, ignoreDuplicates = false) {
  const result = await write(table, row, conflict, ignoreDuplicates)
  return { data: result.data[0] ?? null, error: result.error }
}

export const db = { many, one, count, write, writeOne }
