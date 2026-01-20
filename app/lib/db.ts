import postgres from 'postgres'
import { ManagedIdentityCredential } from '@azure/identity'

let sql: postgres.Sql | null = null

export async function getSql() {
  if (sql) return sql

  const credential = new ManagedIdentityCredential(
    process.env.AZURE_POSTGRESQL_UAMI_AZURE_CLIENTID!
  )

  const token = await credential.getToken(
    'https://ossrdbms-aad.database.windows.net/.default'
  )

  sql = postgres({
    host: process.env.AZURE_POSTGRESQL_UAMI_AZURE_HOST,
    port: Number(process.env.AZURE_POSTGRESQL_UAMI_AZURE_PORT),
    database: process.env.AZURE_POSTGRESQL_UAMI_AZURE_DATABASE,
    username: process.env.AZURE_POSTGRESQL_UAMI_AZURE_USER,
    password: token.token,     // 👈 access token, NOT a password
    ssl: 'require',
    // max: 1                     // recommended for serverless
  })

  return sql
}