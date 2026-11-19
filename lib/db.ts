import Database from 'better-sqlite3';
import path from 'path';
import { PROFILES, INCOMING_LIKE_IDS, ME, type ProfileSeed } from './seed-data';

// --- Database connection (singleton) ---

const DB_PATH = path.join(process.cwd(), 'data', 'coy.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    // Ensure data directory exists
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
    seedIfEmpty(_db);
  }
  return _db;
}

// --- Schema ---

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      photo TEXT NOT NULL,
      bio TEXT NOT NULL,
      location TEXT NOT NULL,
      interests TEXT NOT NULL  -- JSON array
    );

    CREATE TABLE IF NOT EXISTS incoming_likes (
      profile_id TEXT PRIMARY KEY,
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS swipes (
      profile_id TEXT PRIMARY KEY,
      direction TEXT NOT NULL CHECK(direction IN ('like', 'pass')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS matches (
      profile_id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );

    CREATE TABLE IF NOT EXISTS me (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photo TEXT NOT NULL
    );
  `);
}

// --- Seed ---

function seedIfEmpty(db: Database.Database) {
  const count = db.prepare('SELECT COUNT(*) as c FROM profiles').get() as { c: number };
  if (count.c > 0) return;

  const insertProfile = db.prepare(
    'INSERT OR IGNORE INTO profiles (id, name, age, photo, bio, location, interests) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertIncomingLike = db.prepare(
    'INSERT OR IGNORE INTO incoming_likes (profile_id) VALUES (?)'
  );
  const insertMe = db.prepare(
    'INSERT OR IGNORE INTO me (id, name, photo) VALUES (?, ?, ?)'
  );

  const transaction = db.transaction(() => {
    for (const p of PROFILES) {
      insertProfile.run(p.id, p.name, p.age, p.photo, p.bio, p.location, JSON.stringify(p.interests));
    }
    for (const id of INCOMING_LIKE_IDS) {
      insertIncomingLike.run(id);
    }
    insertMe.run(ME.id, ME.name, ME.photo);
  });

  transaction();
}

// --- Repository (public API) ---

export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[];
}

export interface Match {
  profile: Profile;
  matchedAt: string;
}

export interface MeProfile {
  id: string;
  name: string;
  photo: string;
}

function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    photo: row.photo as string,
    bio: row.bio as string,
    location: row.location as string,
    interests: JSON.parse(row.interests as string),
  };
}

/**
 * Returns profiles the user hasn't swiped on, in a stable shuffled order.
 * The order is a deterministic shuffle (by rowid XOR a fixed salt) so it doesn't
 * depend on incoming likes — no information leakage.
 */
export function getFeed(limit: number = 10): Profile[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, name, age, photo, bio, location, interests
    FROM profiles
    WHERE id NOT IN (SELECT profile_id FROM swipes)
    ORDER BY (CAST('0x' || substr(hex(id), 1, 8) AS INTEGER) * 2654435761) % 4294967296
    LIMIT ?
  `).all(limit) as Record<string, unknown>[];
  return rows.map(rowToProfile);
}

/** Returns a profile by ID, or null. */
export function getProfile(id: string): Profile | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  return row ? rowToProfile(row) : null;
}

/** Check if a profile exists */
export function profileExists(id: string): boolean {
  const db = getDb();
  const row = db.prepare('SELECT 1 FROM profiles WHERE id = ?').get(id);
  return !!row;
}

/** Check if a swipe already exists for this profile */
export function getExistingSwipe(profileId: string): { direction: string; matched: boolean } | null {
  const db = getDb();
  const swipe = db.prepare('SELECT direction FROM swipes WHERE profile_id = ?').get(profileId) as { direction: string } | undefined;
  if (!swipe) return null;

  const matchExists = !!db.prepare('SELECT 1 FROM matches WHERE profile_id = ?').get(profileId);
  return { direction: swipe.direction, matched: matchExists };
}

/**
 * Records a swipe and potentially creates a match.
 * Returns { matched, match? }.
 * Idempotent: repeating returns the same result without duplicates.
 */
export function recordSwipe(profileId: string, direction: 'like' | 'pass'): { matched: boolean; match?: { profile: Profile } } {
  const db = getDb();

  // Check for existing swipe (idempotency)
  const existing = getExistingSwipe(profileId);
  if (existing) {
    if (existing.matched) {
      const profile = getProfile(profileId)!;
      return { matched: true, match: { profile } };
    }
    return { matched: false };
  }

  // Record the swipe
  db.prepare('INSERT INTO swipes (profile_id, direction) VALUES (?, ?)').run(profileId, direction);

  // Check for mutual match (only on like)
  if (direction === 'like') {
    const incomingLike = db.prepare('SELECT 1 FROM incoming_likes WHERE profile_id = ?').get(profileId);
    if (incomingLike) {
      db.prepare('INSERT INTO matches (profile_id) VALUES (?)').run(profileId);
      const profile = getProfile(profileId)!;
      return { matched: true, match: { profile } };
    }
  }

  return { matched: false };
}

/** Returns all matches, newest first. */
export function getMatches(): Match[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT p.id, p.name, p.age, p.photo, p.bio, p.location, p.interests, m.created_at as matched_at
    FROM matches m
    JOIN profiles p ON p.id = m.profile_id
    ORDER BY m.created_at DESC
  `).all() as (Record<string, unknown> & { matched_at: string })[];

  return rows.map(row => ({
    profile: rowToProfile(row),
    matchedAt: row.matched_at,
  }));
}

/** Returns the logged-in user's profile. */
export function getMe(): MeProfile {
  const db = getDb();
  const row = db.prepare('SELECT * FROM me').get() as MeProfile;
  return row;
}

/** Returns the count of matches */
export function getMatchCount(): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as c FROM matches').get() as { c: number };
  return row.c;
}

/** Resets swipes and matches for demo purposes. */
export function resetDemo() {
  const db = getDb();
  db.exec('DELETE FROM swipes; DELETE FROM matches;');
}

/** For testing: close and reopen db */
export function _closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
