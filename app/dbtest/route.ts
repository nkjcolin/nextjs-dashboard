import { NextResponse } from 'next/server'
import { getSql } from '../lib/db'

export async function GET() {
  try {
    const sql = await getSql()

    const result = await sql`
      SELECT
        current_user,
        current_database(),
        now() AS connected_at
    `

    return NextResponse.json({
      success: true,
      result: result[0]
    })
  } catch (error: any) {
    console.error(error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
