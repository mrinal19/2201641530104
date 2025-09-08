# AffordMed — URL Shortener (Full Stack)

A small URL shortener microservice (Node + Express + MongoDB) with a simple React frontend.  
This repo contains two parts:

- `backend/` (root `src/` in this repo): Express microservice exposing REST endpoints to create short links, redirect, and fetch stats.
- `frontend/`: Minimal React UI to create short links and quickly test the backend.

> NOTE: This project was implemented by me (student). The code uses a small custom logging middleware and simple validation. No third-party "auto-generated" solutions were copy-pasted.

---

## Features

- `POST /shorturls` — create short URL (random or custom shortcode, optional validity in minutes).
- `GET /:code` — redirect to original URL (returns 410 if expired).
- `GET /shorturls/:code/stats` — retrieve statistics (hits, createdAt, expireAt, lastAccessedAt).
- MongoDB persistence (supports Atlas or local MongoDB).
- Lightweight logging middleware that writes JSON lines to `logs/app.log`.
- Simple React frontend to create short links and view results.

---

## Quick start (macOS / Linux)

### 1. Backend — prepare and run

1. From repo root:
```bash
# ensure you're in the project root:
cd /path/to/affordmed-urlshort

# install backend deps (already in repo package.json)
npm install
