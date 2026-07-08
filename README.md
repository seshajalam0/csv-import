# GrowEasy AI CSV Importer

AI-assisted CSV importer for mapping arbitrary spreadsheet columns into a GrowEasy CRM lead schema.

## Features

- Drag-and-drop CSV upload with local preview.
- Backend CSV parsing and batch processing.
- Gemini-powered field extraction with a deterministic fallback when `GEMINI_API_KEY` is not configured.
- Zod validation, email/date checks, phone normalization, and skipped-record reporting.
- Result dashboard with imported and skipped rows.

## Project Structure

```text
frontend/   Next.js App Router UI
backend/    Express TypeScript API
```

## Environment

Copy `.env.example` into the relevant app env files:

```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
PORT=4000
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000
```

The backend works without `GEMINI_API_KEY` by using a heuristic mapper. Add the key for LLM mapping.

## Local Development

```bash
npm install
npm run dev:backend
npm run dev:frontend
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000`

## API

### `GET /health`

Returns service status.

### `POST /upload`

Accepts `multipart/form-data` with a `file` field. Parses the CSV and returns columns, row count, and a preview.

### `POST /process`

Accepts `multipart/form-data` with a `file` field. Parses, batches, maps, validates, and returns CRM records.

## Docker

```bash
docker compose up --build
```
