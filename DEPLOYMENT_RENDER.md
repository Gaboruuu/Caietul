# Render Deployment Guide

## What to do first with Postgres

Create the PostgreSQL database on Render, then copy the external connection string into `DATABASE_URL`.

Your current database details are:

- host: `dpg-d7sva0ok1i2s73a5k7ag-a.frankfurt-postgres.render.com`
- port: `5432`
- database: `caietul`
- username: `gaboruu`

Do not commit the password into the repository. Store it only in Render environment variables.

## Recommended order

1. Create the Render PostgreSQL database or verify that the one you already have is active.
2. Create the Render Web Service from this repository.
3. Set `DATABASE_URL` in the Render service environment settings.
4. Deploy the web service.
5. Run migrations and seed the database.
6. Open the backend URL from another machine/browser to satisfy the cross-machine requirement.

## DATABASE_URL format

Use the external URL format from Render:

```text
postgresql://gaboruu:PASSWORD@dpg-d7sva0ok1i2s73a5k7ag-a.frankfurt-postgres.render.com/caietul
```

For your `psql` connection test, use:

```bash
PGPASSWORD=PASSWORD psql -h dpg-d7sva0ok1i2s73a5k7ag-a.frankfurt-postgres.render.com -U gaboruu caietul
```

## Migrations and seeders

After the service is deployed, run:

```bash
npm run db:migrate
npm run db:seed
```

If you want to test the database connection manually from your machine, use `psql` with the host, database, and username from Render.
