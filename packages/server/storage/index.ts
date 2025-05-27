import { PgStorage } from './pg-storage';
import { MemStorage } from './mem-storage';
import { drizzle } from "drizzle-orm/node-postgres";

const DATABASE_URL = process.env.DATABASE_URL;
console.log('Direct DATABASE_URL check:', DATABASE_URL ? 'exists' : 'undefined');

import type { IStorage } from './istorage';

let storage: IStorage;
try {
  if (DATABASE_URL) {
    console.log('Using PgStorage with direct DATABASE_URL');
    const db = drizzle(DATABASE_URL);
    storage = new PgStorage(db);
    console.log('Successfully initialized PgStorage with direct DATABASE_URL');
  } else {
    console.log('DATABASE_URL not found, using MemStorage');
    storage = new MemStorage();
    console.log('Successfully initialized MemStorage as fallback');
  }
} catch (error) {
  console.error('Failed to initialize storage, falling back to MemStorage:', error);
  storage = new MemStorage();
  console.log('Successfully initialized MemStorage as fallback after error');
}

export { storage };
