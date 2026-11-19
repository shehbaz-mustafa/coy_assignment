# Coy Discover 💖

> A mobile-first, swipe-based discovery app inspired by Bumble and Tinder, built with a playful neo-brutalist design system.

---

## 📸 Preview

```
┌─────────────────────────────────────────┐
│ Coy.                                    │
│ ┌─────────────────────────────────────┐ │
│ │ [ Photo ]                           │ │
│ │                                     │ │
│ │                                     │ │
│ │ Maya, 23                            │ │
│ │ 📍 Brooklyn, NY                     │ │
│ │ Ceramics nerd who throws pots...    │ │
│ │ [Ceramics] [Architecture] [Coffee]  │ │
│ └─────────────────────────────────────┘ │
│         ( ✕ )          ( ♥ )           │
│                                         │
│ [ 🏠 Home ]           [ 🧭 Discover ]   │
└─────────────────────────────────────────┘
```
*(Add production screenshots here)*

---

## ⚡ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom neo-brutalist tokens
- **Animations & Gestures**: [Framer Motion](https://www.framer.com/motion/) (smooth 60fps drag gestures, spring animations, stamp overlays)
- **Database**: SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (local persistent file at `data/coy.db`)
- **Architecture**: Clean repository layer (`lib/db.ts`) decoupling route handlers from SQLite for easy swapping with Turso, LibSQL, or PostgreSQL
- **Testing**: [Vitest](https://vitest.dev/) for unit testing swipe mechanics, idempotency, feed filtering, and zero-leakage security guarantees
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🎨 Design System

Matches the Coy app neo-brutalist visual style:
- **Palette**:
  - Page Background: `#FFFFFF`
  - Surfaces: `#F5F2FB` (soft lavender-gray)
  - Hero / Feature Panels: `#E6E0FF` (lavender)
  - Ink (Outlines & Typography): `#1A1530`
  - Primary Pink: `#FF3D7F` (hover `#F0286D`, pressed `#D91E5E`)
  - Accent Pastels: Yellow `#FFE15C`, Peach `#FFDCCB`, Light Pink `#FFDDEA`, Lavender `#E6E0FF`
  - Muted Text: `#6B6680` (WCAG AA 4.5:1 contrast compliant)
- **Borders & Shadows**:
  - 2px solid ink outlines on all interactive elements
  - Hard offset drop shadows (no blur): `3px 3px 0 #1A1530` on cards & buttons, `2px 2px 0 #1A1530` on chips and pills
  - Tactile pressed states: `transform: translate(2px, 2px)` with collapsed shadow
- **Typography**:
  - `Plus Jakarta Sans` rounded geometric sans-serif
  - Weights 500 (body), 600 (small/chips), 700 (buttons/tabs), 800 (headings with tight `-0.02em` tracking)
  - Tabular numbers for ages and match counts
- **Layout**:
  - Mobile-first shell (safe-area insets supported)
  - Centered 430px column on desktop with crisp borders and soft lavender surrounding background

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/coy-discover.git
cd coy-discover

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (switch to mobile responsive view in DevTools or test directly on mobile).

### Running Unit Tests

```bash
npm run test
```

Tests run via Vitest covering all core swipe, matching, idempotency, and privacy requirements.

---

## 🛡️ The Core Promise: Zero Information Leakage

> **Guarantee**: A user can **never** discover who liked them unless the match is mutual.

### Server-Enforced Privacy Guarantees:
1. **Separate Secret Table**: Incoming likes are stored strictly in `incoming_likes (profile_id)`. This table is **never queried** by the feed endpoint or returned in any client payload.
2. **No Secret Flags**: The `/api/feed` response contains only public fields: `id`, `name`, `age`, `photo`, `bio`, `location`, `interests`. There is no `likedMe`, `hasLiked`, `matchLikelihood`, or hidden count.
3. **Deterministic Unbiased Shuffle**: Feed order uses a mathematical hash shuffle based purely on row IDs and fixed salts:
   ```sql
   ORDER BY (CAST('0x' || substr(hex(id), 1, 8) AS INTEGER) * 2654435761) % 4294967296
   ```
   Profiles that liked the user are distributed uniformly throughout the deck and never clustered at the beginning or sorted by like status.
4. **Isolated Evaluation**: Incoming likes are checked **exclusively inside `POST /api/swipe`** when the user commits an explicit `'like'`. A `'pass'` **never** creates a match, even if the other person liked the user.

---

## 📊 Data Model

SQLite schema initialized automatically on first startup (`lib/db.ts`):

```sql
-- Public user profiles (32 seeded records)
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  photo TEXT NOT NULL,
  bio TEXT NOT NULL,
  location TEXT NOT NULL,
  interests TEXT NOT NULL  -- JSON string array
);

-- Profiles that pre-liked the user (secret, never exposed)
CREATE TABLE incoming_likes (
  profile_id TEXT PRIMARY KEY,
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- User's recorded actions
CREATE TABLE swipes (
  profile_id TEXT PRIMARY KEY,
  direction TEXT NOT NULL CHECK(direction IN ('like', 'pass')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Mutual matches
CREATE TABLE matches (
  profile_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (profile_id) REFERENCES profiles(id)
);

-- Logged-in user record (id = 'me')
CREATE TABLE me (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo TEXT NOT NULL
);
```

---

## 🔌 API Documentation

All routes live under Next.js App Router route handlers (`app/api/*`) and return standard JSON.

### 1. `GET /api/feed`
Returns unswiped profiles in a consistent, non-biased shuffle.

- **Query Parameters**:
  - `limit` (optional, default `10`, max `50`): Number of cards to fetch.
- **Response `200 OK`**:
  ```json
  {
    "profiles": [
      {
        "id": "p1",
        "name": "Maya",
        "age": 23,
        "photo": "https://i.pravatar.cc/600?img=1",
        "bio": "Ceramics nerd who throws pots at 6am before my architecture studio opens.",
        "location": "Brooklyn, NY",
        "interests": ["Ceramics", "Architecture", "Coffee", "Hiking"]
      }
    ]
  }
  ```

### 2. `POST /api/swipe`
Records a user's swipe action. Fully idempotent.

- **Request Body**:
  ```json
  {
    "profileId": "p3",
    "direction": "like"
  }
  ```
- **Validation**: Schema validated via [Zod](https://zod.dev/). Returns `400` if malformed, `404` if profile doesn't exist.
- **Response `200 OK` (Mutual Match)**:
  ```json
  {
    "matched": true,
    "match": {
      "profile": {
        "id": "p3",
        "name": "Priya",
        "age": 22,
        "photo": "https://i.pravatar.cc/600?img=3",
        "bio": "CS major at Stanford. I build keyboards and argue about fonts.",
        "location": "Stanford University",
        "interests": ["Mechanical Keyboards", "Typography", "Coding", "Boba"]
      }
    }
  }
  ```
- **Response `200 OK` (No Match / Pass)**:
  ```json
  {
    "matched": false
  }
  ```

### 3. `GET /api/matches`
Returns the user's mutual matches, ordered newest first.

- **Response `200 OK`**:
  ```json
  {
    "matches": [
      {
        "profile": {
          "id": "p3",
          "name": "Priya",
          "age": 22,
          "photo": "https://i.pravatar.cc/600?img=3",
          "bio": "CS major at Stanford. I build keyboards and argue about fonts.",
          "location": "Stanford University",
          "interests": ["Mechanical Keyboards", "Typography", "Coding", "Boba"]
        },
        "matchedAt": "2026-11-19 04:52:59"
      }
    ]
  }
  ```

### 4. `POST /api/reset`
*Demo utility*: Clears all swipes and matches, resetting the feed to the initial 32 profiles.

- **Response `200 OK`**:
  ```json
  {
    "success": true
  }
  ```

---

## ♿ Accessibility & Performance

- **Keyboard Support**: Left Arrow to Pass, Right Arrow to Like.
- **Screen Readers**: Descriptive alt tags on portraits, `aria-labels` on Pass/Like controls, and `aria-live="polite"` announcements for swipe outcomes.
- **Focus Trap**: Match dialog traps focus inside the overlay and supports quick dismissal via `Escape`.
- **Motion Sensitivity**: Respects `prefers-reduced-motion` by disabling confetti particles and replacing card fly-out translations with smooth opacity fades.
- **Performance**:
  - Preloads next 2 profile portraits in the background.
  - Automatically prefetches the next batch of cards when 3 cards remain.
  - 60fps animations utilizing hardware-accelerated CSS `transform` and `opacity` exclusively.

---

## 🚢 Deployment Note

This project is configured with `better-sqlite3` storing data in a local file (`data/coy.db`). For serverless edge deployments (e.g. Vercel, Netlify):
- The repository layer in `lib/db.ts` is intentionally decoupled from route handlers.
- To deploy serverlessly, replace `better-sqlite3` in `lib/db.ts` with [Turso](https://turso.tech/) (`@libsql/client`) or Neon Postgres without modifying any API routes or UI components.
- For Docker/VPS deployments (e.g. Railway, Render, Fly.io), the SQLite file persists cleanly using a mounted volume.

---

## 🔮 What I'd Build Next

1. **Direct Messaging**: Chat screen opening directly from mutual matches with real-time optimistic messaging.
2. **Profile Detail Modal**: Tap to expand full profile with multiple photos, Instagram integration, and voice prompts.
3. **Undo / Rewind**: A "rewind" button to reverse accidental passes with a 5-second undo window.
4. **Discovery Filters**: Filter drawer by age range, distance radius, and common interests.
5. **Interactive Match Celebration**: Sound effects using Web Audio API on mutual match.
