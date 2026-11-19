import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { PROFILES, INCOMING_LIKE_IDS, ME } from '../lib/seed-data';

// We test the core logic directly against a fresh SQLite DB
// to avoid coupling to Next.js route handlers.

const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test-coy.db');

let db: Database.Database;

function setupDb() {
  // Close existing connection if any
  if (db) {
    try { db.close(); } catch {}
  }

  // Remove old test db
  try {
    if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
    if (fs.existsSync(TEST_DB_PATH + '-wal')) fs.unlinkSync(TEST_DB_PATH + '-wal');
    if (fs.existsSync(TEST_DB_PATH + '-shm')) fs.unlinkSync(TEST_DB_PATH + '-shm');
  } catch {}

  const dir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(TEST_DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      photo TEXT NOT NULL,
      bio TEXT NOT NULL,
      location TEXT NOT NULL,
      interests TEXT NOT NULL
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

  // Seed
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

// Helper: get feed
function getFeed(limit = 50): Record<string, unknown>[] {
  return db.prepare(`
    SELECT id, name, age, photo, bio, location, interests
    FROM profiles
    WHERE id NOT IN (SELECT profile_id FROM swipes)
    ORDER BY (CAST('0x' || substr(hex(id), 1, 8) AS INTEGER) * 2654435761) % 4294967296
    LIMIT ?
  `).all(limit) as Record<string, unknown>[];
}

// Helper: record swipe
function recordSwipe(profileId: string, direction: 'like' | 'pass') {
  // Check existing
  const existing = db.prepare('SELECT direction FROM swipes WHERE profile_id = ?').get(profileId) as { direction: string } | undefined;
  if (existing) {
    const matchExists = !!db.prepare('SELECT 1 FROM matches WHERE profile_id = ?').get(profileId);
    if (matchExists) {
      const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId);
      return { matched: true, match: { profile } };
    }
    return { matched: false };
  }

  db.prepare('INSERT INTO swipes (profile_id, direction) VALUES (?, ?)').run(profileId, direction);

  if (direction === 'like') {
    const incomingLike = db.prepare('SELECT 1 FROM incoming_likes WHERE profile_id = ?').get(profileId);
    if (incomingLike) {
      db.prepare('INSERT INTO matches (profile_id) VALUES (?)').run(profileId);
      const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId);
      return { matched: true, match: { profile } };
    }
  }

  return { matched: false };
}

describe('Swipe Logic', () => {
  beforeEach(() => {
    setupDb();
  });

  afterEach(() => {
    if (db) {
      try { db.close(); } catch {}
    }
  });

  it('should create a match when liking a profile that liked me', () => {
    // p3 (Priya) has liked the user
    expect(INCOMING_LIKE_IDS).toContain('p3');
    const result = recordSwipe('p3', 'like');
    expect(result.matched).toBe(true);
    expect(result.match).toBeDefined();
  });

  it('should NOT create a match when liking a profile that has NOT liked me', () => {
    // p1 (Maya) has NOT liked the user
    expect(INCOMING_LIKE_IDS).not.toContain('p1');
    const result = recordSwipe('p1', 'like');
    expect(result.matched).toBe(false);
  });

  it('should NEVER match on a pass, even if the profile liked me', () => {
    // p6 (Kai) has liked the user
    expect(INCOMING_LIKE_IDS).toContain('p6');
    const result = recordSwipe('p6', 'pass');
    expect(result.matched).toBe(false);

    // Verify no match was created
    const matchRow = db.prepare('SELECT 1 FROM matches WHERE profile_id = ?').get('p6');
    expect(matchRow).toBeUndefined();
  });

  it('should be idempotent: repeating a swipe returns the same result', () => {
    const result1 = recordSwipe('p3', 'like');
    const result2 = recordSwipe('p3', 'like');

    expect(result1.matched).toBe(true);
    expect(result2.matched).toBe(true);

    // Only one swipe and one match in the DB
    const swipeCount = db.prepare('SELECT COUNT(*) as c FROM swipes WHERE profile_id = ?').get('p3') as { c: number };
    expect(swipeCount.c).toBe(1);

    const matchCount = db.prepare('SELECT COUNT(*) as c FROM matches WHERE profile_id = ?').get('p3') as { c: number };
    expect(matchCount.c).toBe(1);
  });

  it('should remove swiped profiles from the feed', () => {
    // Swipe on p1
    recordSwipe('p1', 'pass');

    const feed = getFeed();
    const feedIds = feed.map((r) => r.id);
    expect(feedIds).not.toContain('p1');

    // Swipe on p2
    recordSwipe('p2', 'like');

    const feed2 = getFeed();
    const feedIds2 = feed2.map((r) => r.id);
    expect(feedIds2).not.toContain('p1');
    expect(feedIds2).not.toContain('p2');
  });

  it('should never expose incoming likes in the feed response', () => {
    const feed = getFeed();

    // The feed should not contain any field that reveals incoming likes
    for (const row of feed) {
      const keys = Object.keys(row);
      // Should only have public fields
      expect(keys).not.toContain('likedMe');
      expect(keys).not.toContain('liked_me');
      expect(keys).not.toContain('incoming');
      expect(keys).not.toContain('incoming_like');

      // Verify only expected fields
      const allowedFields = ['id', 'name', 'age', 'photo', 'bio', 'location', 'interests'];
      for (const key of keys) {
        expect(allowedFields).toContain(key);
      }
    }
  });

  it('should not order the feed by incoming likes', () => {
    const feed = getFeed();
    const feedIds = feed.map((r) => r.id as string);

    // The incoming like IDs should NOT all be clustered at the beginning
    const positions = INCOMING_LIKE_IDS.map((id) => feedIds.indexOf(id)).filter(
      (pos) => pos >= 0
    );

    if (positions.length >= 3) {
      const maxPosition = Math.max(...positions);
      // At least one should be in the later half of the results
      expect(maxPosition).toBeGreaterThan(Math.floor(feedIds.length / 4));
    }
  });

  it('should seed 32 profiles', () => {
    const count = db.prepare('SELECT COUNT(*) as c FROM profiles').get() as { c: number };
    expect(count.c).toBe(32);
  });

  it('should seed 8 incoming likes', () => {
    const count = db.prepare('SELECT COUNT(*) as c FROM incoming_likes').get() as { c: number };
    expect(count.c).toBe(8);
  });
});
