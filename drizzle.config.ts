import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db-schema',
  dialect: 'postgresql',
  out: './.drizzle',

  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: true
  },
});
