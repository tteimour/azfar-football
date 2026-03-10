# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tapadam Football - A platform to find players and manage football matches at premium stadiums in Baku, Azerbaijan.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build Next.js production bundle |
| `npm run lint` | Run ESLint |
| `npm run pages:build` | Build for Cloudflare Pages |
| `npm run preview` | Build and preview on Wrangler (Cloudflare) |

## Architecture

**Stack:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + Storage + Realtime), Leaflet (Maps)

**Path Alias:** `@/` maps to `./src/`

### Source Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/cron/           # Cron job endpoints
│   ├── auth/               # Login/Register + OAuth callback
│   ├── rooms/              # Matches listing and detail ([id])
│   └── profile/            # User profile management + PlayerCard
├── components/
│   ├── AuthProvider.tsx    # Auth context
│   ├── Navbar.tsx          # Navigation with notification badge
│   ├── NotificationBadge.tsx # Real-time notifications dropdown
│   ├── LocationMap.tsx     # Read-only map display
│   ├── LocationPicker.tsx  # Interactive location selector
│   ├── RoomChat.tsx        # Real-time chat for match participants
│   ├── ShareButton.tsx     # Share match via Web Share API / social
│   ├── PlayerCard.tsx      # FIFA-style player stats card
│   └── RatePlayersModal.tsx # Modal to rate players after games
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── database.ts         # CRUD operations for production
│   ├── data.ts             # Unified data layer (routes demo/production)
│   ├── store.ts            # localStorage demo mode store
│   ├── storage.ts          # Avatar upload functions
│   ├── notifications.ts    # Notification functions (Supabase)
│   ├── notificationStore.ts # Notification functions (demo mode)
│   ├── chat.ts             # Chat functions (Supabase Realtime)
│   ├── chatStore.ts        # Chat functions (demo mode)
│   ├── email.ts            # Email sending via nodemailer
│   ├── dateUtils.ts        # Date formatting utilities (dd/mm format)
│   └── sample-data.ts      # Mock data for demo mode
└── types/index.ts          # TypeScript interfaces
```

### Dual Mode Architecture

- **Demo Mode:** Activated when `NEXT_PUBLIC_SUPABASE_URL` is not set. Uses localStorage via `store.ts` with sample data.
- **Production Mode:** Uses Supabase with `database.ts` functions. Requires environment variables.

### Data Models

- **User/Profile:** id, email, full_name, preferred_position, skill_level, games_played, avatar_url
- **Room (Match):** id, title, stadium_name, stadium_address, stadium_latitude, stadium_longitude, stadium_price_per_hour, creator_id, date, times, max_players, status
- **JoinRequest:** room_id, user_id, status (pending/approved/rejected)
- **RoomParticipant:** room_id, user_id
- **Notification:** id, user_id, type, title, message, room_id, is_read
- **ChatMessage:** id, room_id, user_id, message
- **PlayerStats:** user_id, pace, shooting, passing, dribbling, defense, physical, overall, total_ratings
- **PlayerRating:** room_id, rater_id, rated_id, pace, shooting, passing, dribbling, defense, physical

### Authentication

Uses `AuthProvider` context with `useAuth()` hook providing: `user`, `loading`, `login()`, `register()`, `logout()`, `updateProfile()`.

## Environment Variables

For production, create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Configuration (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@football.innovariance.com

# Cron job security
CRON_SECRET=your-secure-random-string

# App URL for email links
NEXT_PUBLIC_APP_URL=https://football.innovariance.com
```

## Database

Schema in `supabase/schema.sql`. Uses Row-Level Security (RLS) policies on all tables.

### Migrations

1. `supabase/schema.sql` - Base schema (profiles, stadiums, rooms, join_requests, room_participants)
2. `supabase/migrations/002_player_stats.sql` - Player stats and ratings tables
3. `supabase/migrations/003_notifications_chat_stadium.sql` - Notifications, chat, inline stadium fields

## Styling

Custom Tailwind components in `globals.css`: `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.card`, `.input`, `.badge`

Color scheme: Primary green (#00A651), dark backgrounds (#1a1a2e, #16213e)

## Deployment

- **Primary:** Cloudflare Pages via `@cloudflare/next-on-pages`
- **Fallback:** Vercel (direct git deploy)

---

## Key Features

### 1. Custom Stadium Entry
Users can enter any stadium/location when creating a match:
- Stadium name (required)
- Address (optional)
- Price per hour (optional)
- Map location via interactive picker (optional)

### 2. Notification System
Real-time notifications for:
- `join_request` - Someone wants to join your match
- `request_approved` - Your join request was approved
- `request_rejected` - Your join request was rejected
- `match_reminder` - Match starting in 2 hours
- `match_completed` - Match ended, rate your teammates

### 3. Room Chat
Real-time chat for match participants:
- Only visible to room participants and creator
- Supabase Realtime in production, localStorage in demo mode
- Collapsible UI

### 4. Map Integration
Powered by Leaflet/OpenStreetMap:
- `LocationMap` - Read-only display on room detail page
- `LocationPicker` - Click to select or drag marker when creating a room
- Geolocation support to use current location

### 5. Share Functionality
- Web Share API (native) on supported devices
- Fallback dropdown with copy link, WhatsApp, Telegram

### 6. Email Reminders
Cron job at `/api/cron/send-reminders`:
- Sends email reminders ~2 hours before match
- Requires SMTP configuration
- Protected by CRON_SECRET header

### 7. Date Format
Uses dd/mm format with automatic year detection:
- Input: `25/01` → Stored as `2026-01-25`
- If date passed this year, assumes next year

---

## Component Usage

```tsx
// LocationMap (read-only)
import LocationMap from '@/components/LocationMap';
<LocationMap latitude={40.4093} longitude={49.8671} name="Stadium" />

// LocationPicker (interactive)
import LocationPicker from '@/components/LocationPicker';
<LocationPicker onLocationChange={(lat, lng) => { ... }} />

// RoomChat
import RoomChat from '@/components/RoomChat';
<RoomChat roomId={room.id} isParticipant={isInRoom} />

// ShareButton
import ShareButton from '@/components/ShareButton';
<ShareButton roomId={room.id} roomTitle={room.title} />

// NotificationBadge (in Navbar)
import NotificationBadge from '@/components/NotificationBadge';
<NotificationBadge />
```

### Data Layer Functions

```tsx
import { createRoom } from '@/lib/data';

// Create room with custom stadium
await createRoom({
  title: 'Saturday Game',
  stadium_name: 'Central Stadium',
  stadium_address: 'Main Street 123',
  stadium_price_per_hour: 80,
  stadium_latitude: 40.4093,
  stadium_longitude: 49.8671,
  creator_id: user.id,
  date: '2026-02-15',
  start_time: '18:00',
  end_time: '20:00',
  max_players: 14,
  skill_level_required: 'any',
});
```

### Date Utilities

```tsx
import { formatDateDDMM, formatDateDisplay, parseDateDDMM, isValidDDMM } from '@/lib/dateUtils';

formatDateDDMM('2026-01-25');      // '25/01'
formatDateDisplay('2026-01-25');   // '25/01 (Sat)'
parseDateDDMM('25/01');            // '2026-01-25'
isValidDDMM('25/01');              // true
```
