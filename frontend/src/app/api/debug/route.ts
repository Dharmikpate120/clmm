import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  try {
    // List all tables
    const tablesRes = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
    )
    const tables = tablesRes.rows.map((r: { table_name: string }) => r.table_name)

    // Get columns for all tables
    const colsRes = await pool.query(
      `SELECT table_name, column_name, data_type 
       FROM information_schema.columns 
       WHERE table_schema = 'public' 
       ORDER BY table_name, ordinal_position`,
    )

    // Group by table
    const schema: Record<string, { name: string; type: string }[]> = {}
    for (const row of colsRes.rows) {
      if (!schema[row.table_name]) schema[row.table_name] = []
      schema[row.table_name].push({ name: row.column_name, type: row.data_type })
    }

    return NextResponse.json({ tables, schema })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
