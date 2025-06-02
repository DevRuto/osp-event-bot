import path from 'path';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './prisma/client.js';

// Note, db is created in the prisma directory
const rawUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
const relativePath = rawUrl.replace(/^file:/, '');

const dbRelativePath = relativePath.startsWith('prisma/')
  ? relativePath
  : path.join('prisma', relativePath);

const absolutePath = path.resolve(process.cwd(), dbRelativePath);

const adapter = new PrismaBetterSQLite3({
  url: `file:${absolutePath}`,
});
const prisma = new PrismaClient({ adapter });

export default prisma;
