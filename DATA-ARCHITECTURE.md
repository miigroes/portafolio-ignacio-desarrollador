# Data architecture recommendation (next step)

This project currently uses Netlify Forms for lead capture (fast and low-maintenance for MVP stage).

## Recommended upgrade path

When lead volume grows, move to a managed DB stack:

- **Supabase Postgres** (fast setup)
- Table: `leads`
  - `id` (uuid, primary key)
  - `created_at` (timestamp)
  - `name` (text)
  - `email` (text)
  - `country` (text)
  - `service` (text)
  - `message` (text)
  - `source` (text)
- Use a **serverless endpoint** (Netlify Functions) to validate and insert leads.
- Add bot protection + rate limiting at edge layer.

## Why not now?

For a first commercial product, Netlify Forms is faster to ship and validate demand.
