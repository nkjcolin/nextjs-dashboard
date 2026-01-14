import bcrypt from 'bcrypt';
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const sql = postgres({
  host: process.env.AZURE_POSTGRESQL_HOST,
  port: 5432,
  database: process.env.AZURE_POSTGRESQL_DATABASE,
  username: process.env.AZURE_POSTGRESQL_USER,
  password: process.env.AZURE_POSTGRESQL_PASSWORD,
  ssl: 'require',
});

async function seedUsers() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      return sql`
        INSERT INTO users (id, name, email, password)
        VALUES (
          ${user.id ?? randomUUID()},
          ${user.name},
          ${user.email},
          ${hashedPassword}
        )
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedCustomers() {
  await sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map((customer) =>
      sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (
          ${customer.id ?? randomUUID()},
          ${customer.name},
          ${customer.email},
          ${customer.image_url}
        )
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedInvoices() {
  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map((invoice) =>
      sql`
        INSERT INTO invoices (id, customer_id, amount, status, date)
        VALUES (
        ${invoice.id ?? randomUUID()},
          ${invoice.customer_id},
          ${invoice.amount},
          ${invoice.status},
          ${invoice.date}
        )
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

async function seedRevenue() {
  await sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map((rev) =>
      sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  try {
    await sql.begin(() => [
      seedUsers(),
      seedCustomers(),
      seedInvoices(),
      seedRevenue(),
    ]);

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
