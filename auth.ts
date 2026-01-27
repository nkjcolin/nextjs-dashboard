import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { User } from './app/lib/definitions';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import { DefaultAzureCredential } from '@azure/identity';

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

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
 
 
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
            const { email, password } = parsedCredentials.data;
            const user = await getUser(email);
            if (!user) return null;
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) return user;
        }
        console.log('Invalid credentials');
        return null;
      },
    }),
  ],
});