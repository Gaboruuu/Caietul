# Assignment 3 Submission Notes

## What is implemented

The server now stores domain data in a relational database through Sequelize.

- `Champions` holds champion metadata
- `Matches` holds match records and references champions by foreign key

The backend supports:

- create, read, update, delete operations for matches and champions
- pagination for match lists
- basic statistics for champions
- validation for domain constraints
- migration-based database creation and seed loading

## 3NF justification

The database is in Third Normal Form because:

1. Each table represents one entity type.
2. Every non-key column depends on the whole key.
3. There are no repeating groups.
4. There are no transitive dependencies inside a table.

### `Champions`

- Primary key: `id`
- Attributes: `name`, `icon`, `role`
- All attributes describe the champion itself and depend only on the key.

### `Matches`

- Primary key: `id`
- Foreign key: `championId`
- Attributes: `role`, `result`, `kills`, `deaths`, `assists`, `cs`, `visionScore`, `duration`, `date`, `patch`, `notes`
- All match facts depend only on the match key.
- Champion data is not duplicated in the match table.

## Deployment model

For a correct public deployment, the database must also be hosted online.

Recommended setup:

- backend: Render web service
- database: hosted PostgreSQL service
- client: separate browser or machine

The backend reads `DATABASE_URL` from the environment and listens on the platform-provided port.

## Local setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm run server
```

## Test command

```bash
cd caietul
.\node_modules\.bin\vitest.cmd run server\store\matchStore.integration.test.js
```

## Submission checklist

- source code committed
- migrations and seeders included
- database design documented
- integration test passing
- deployment instructions available
