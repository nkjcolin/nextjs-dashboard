import postgres from 'postgres';
import { DefaultAzureCredential, ClientSecretCredential } from "@azure/identity";

// For system-assigned identity.
const credential = new DefaultAzureCredential();

// Acquire the access token.
var accessToken = await credential.getToken('https://ossrdbms-aad.database.windows.net/.default');


const sql = postgres({
  host: process.env.AZURE_POSTGRESQL_ENTRA_AZURE_HOST,
  user: process.env.AZURE_POSTGRESQL_ENTRA_AZURE_USER,
  password: accessToken.token,
  database: process.env.AZURE_POSTGRESQL_ENTRA_AZURE_DATABASE,
  port: Number(process.env.AZURE_POSTGRESQL_ENTRA_AZURE_PORT),
  ssl: 'require',
});

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
