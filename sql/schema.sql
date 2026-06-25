-- Digital Cafe (کافه دیجیتال) — Supabase Schema
-- Run this once in the Supabase SQL Editor to set up the database.

CREATE TABLE IF NOT EXISTS orders (
  id          TEXT PRIMARY KEY,
  items       JSONB NOT NULL DEFAULT '[]',
  table_number TEXT NOT NULL,
  phone       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  timestamp   BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id       TEXT PRIMARY KEY,
  name_en  TEXT NOT NULL,
  name_fa  TEXT NOT NULL,
  price    INTEGER NOT NULL,
  category TEXT NOT NULL
);
