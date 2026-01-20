import { ManagedIdentityCredential } from '@azure/identity';
import postgres from 'postgres';

  const credential = new ManagedIdentityCredential(
    process.env.AZURE_POSTGRESQL_UAMI_AZURE_CLIENTID!
  )

  const token = await credential.getToken(
    'https://ossrdbms-aad.database.windows.net/.default'
  )

  console.log('token acquired via Managed Identity.');

  const sql = postgres({
    host: process.env.AZURE_POSTGRESQL_UAMI_AZURE_HOST,
    port: Number(process.env.AZURE_POSTGRESQL_UAMI_AZURE_PORT),
    database: process.env.AZURE_POSTGRESQL_UAMI_AZURE_DATABASE,
    username: process.env.AZURE_POSTGRESQL_UAMI_AZURE_USER,
    password: token.token, 
    ssl: 'require',
    // max: 1 
  })

  console.log('SQL client initialized with Managed Identity.');

async function listInvoices() {
    const data = await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `;

    return data;
}

export async function GET() {
  try {
    return Response.json(await listInvoices());
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
