# Superpowers Documentation

Reference documentation for the Express backend boilerplate. These docs describe how the current codebase works: routes, modules, environment variables, data model, jobs, operational commands, and test coverage.

## Structure

- [`modules/`](./modules/) - source-of-truth module references.
- [`modules/_template.md`](./modules/_template.md) - template for future module docs.

## Source Of Truth

Code wins over docs. When a doc disagrees with the current implementation, update the doc in the same change as the code.

## Quick Start

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

Run the worker in another process when queue jobs are needed:

```bash
npm run worker:dev
```

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run format:check
```
