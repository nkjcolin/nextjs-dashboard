import postgres from 'postgres';

// const sql = postgres(process.env.POSTGRES_URL!);

const sql = postgres({
  host: process.env.AZURE_POSTGRESQL_HOST,
  port: 5432,
  database: process.env.AZURE_POSTGRESQL_DATABASE,
  username: process.env.AZURE_POSTGRESQL_USER,
  password: process.env.AZURE_POSTGRESQL_PASSWORD,
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
