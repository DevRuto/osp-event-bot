# OSP Event Bot

## Getting started

1. Clone repo (currently in v2 branch)
2. Run `npm run prisma:migrate` to generate the database or update if need
3. Run `npm run prisma:generate`
   - This generates the prisma client for your code
   - You need to run this every time the database schema is updated

## Dev Commands

- `npm run prisma:studio` - Database browser
- `npm run prisma:migrate` - Update database on migrations
- `npm run prisma:generate` - Generate prisma client
