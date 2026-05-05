# Caietul

Caietul is a match management web app built with React, TypeScript, Vite, Express, GraphQL, and Sequelize.
It lets you create, browse, inspect, and manage match entries using a clean page-based flow.

## Purpose

This project was created as a practical frontend exercise focused on:

- organizing a React app by feature and responsibility
- adding server-side persistence with an ORM-backed relational database
- keeping business types and utilities separated from UI
- writing and running unit and integration tests with Vitest

## Main Features

- Landing page and app entry flow
- Match listing/home page
- Match details page
- Match creation/edit form page
- Delete confirmation page
- Reusable layout components (header/footer)
- REST + GraphQL backend for matches and champions
- Server-side persistence with Sequelize and PostgreSQL
- CRUD, pagination, validation, and basic stats

## Tech Stack

- React
- TypeScript
- Vite
- Node.js / Express
- GraphQL
- Sequelize
- PostgreSQL
- CSS Modules
- Vitest
- ESLint

## Assignment 3 Submission Notes

The persistence layer is documented in [ASSIGNMENT_3_SUBMISSION.md](ASSIGNMENT_3_SUBMISSION.md).

If you need a short summary for submission, the backend uses two relational tables:

- `Champions` for champion metadata
- `Matches` for individual match records

The schema is in 3NF because each table stores facts about a single entity, all non-key attributes depend on the key, and there are no repeating groups or transitive dependencies inside a table.

The app is designed to be deployed with:

- a Node/Express web service for the backend
- a hosted PostgreSQL database for persistence
- a separate client machine/browser connecting to the deployed backend

## Project Structure

```text
src/
  components/   # Shared UI pieces (e.g., Header, Footer)
  pages/        # Route/page-level screens
  store/        # Match state logic and tests
  styles/       # CSS module files for pages/layout
  types/        # Domain types (match models)
  utils/        # Helpers, storage, persistence
  data/         # Seed/mock match data
```

## Quick Start

Install dependencies:

```bash
npm install
```

Run the ORM integration test:

```bash
npm exec vitest run server/store/matchStore.integration.test.js
```

To run the backend against PostgreSQL, set `DATABASE_URL` and use the migration commands in `package.json`.
