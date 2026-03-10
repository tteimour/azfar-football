# Tapadam Football

A web platform to find players and organize football matches in Baku, Azerbaijan. Connect with football enthusiasts, create matches, and join games at local stadiums.

## Features

### Core Features
- **User Authentication** - Register/login with email and password via Supabase Auth
- **Match Creation** - Create football matches with custom stadium details, date/time, and player limits
- **Join Requests** - Request to join matches; room creators can approve/reject requests
- **Player Profiles** - User profiles with position preferences, skill levels, and game history

### Player Rating System (FIFA-style)
- **Player Cards** - Visual FIFA-style cards showing player stats with bronze/silver/gold tiers
- **6-Stat Ratings** - Pace, Shooting, Passing, Dribbling, Defense, Physical
- **Post-Match Ratings** - Rate other players after completed matches
- **Leaderboard** - Top players ranked by overall rating

### Real-time Features
- **Room Chat** - Real-time chat for match participants (Supabase Realtime)
- **Notifications** - Bell icon with live notification updates for join requests, approvals, and match reminders
- **Player Slots** - Visual football emoji grid showing filled/empty player spots

### Map Integration
- **Location Picker** - Interactive map (OpenStreetMap/Leaflet) to set stadium location when creating matches
- **Location Display** - Map view of stadium location on match detail pages

### Additional Features
- **Share Functionality** - Share matches via Web Share API, WhatsApp, Telegram, or copy link
- **Email Reminders** - Cron endpoint to send email reminders 2 hours before matches
- **Profile Photos** - Upload avatar images via Supabase Storage
- **Date Format** - User-friendly dd/mm date format with auto-year detection

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Light theme)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (avatars)
- **Real-time**: Supabase Realtime (chat, notifications)
- **Maps**: Leaflet + OpenStreetMap
- **Deployment**: Cloudflare Pages

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Login/Register page
│   │   └── callback/             # OAuth callback handler
│   ├── rooms/                    # Matches listing
│   │   └── [id]/                 # Match detail page
│   ├── profile/                  # User profile
│   ├── stadiums/                 # Stadium listing
│   └── api/cron/send-reminders/  # Email reminder endpoint
├── components/
│   ├── AuthProvider.tsx          # Auth context provider
│   ├── Navbar.tsx                # Navigation bar
│   ├── PlayerCard.tsx            # FIFA-style player card
│   ├── PlayerSlots.tsx           # Player emoji grid
│   ├── RatePlayersModal.tsx      # Rating modal
│   ├── RoomChat.tsx              # Real-time chat
│   ├── NotificationBadge.tsx     # Notification bell dropdown
│   ├── LocationMap.tsx           # Read-only map display
│   ├── LocationPicker.tsx        # Interactive location picker
│   └── ShareButton.tsx           # Share functionality
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── database.ts               # Database operations (production)
│   ├── store.ts                  # localStorage operations (demo mode)
│   ├── data.ts                   # Unified data layer
│   ├── notifications.ts          # Notification operations
│   ├── notificationStore.ts      # Demo mode notifications
│   ├── chat.ts                   # Chat operations
│   ├── chatStore.ts              # Demo mode chat
│   ├── storage.ts                # Avatar upload
│   ├── email.ts                  # Email sending (Nodemailer)
│   ├── dateUtils.ts              # Date formatting utilities
│   └── sample-data.ts            # Sample data for demo mode
└── types/index.ts                # TypeScript interfaces
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for production)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tapadam-football.git
cd tapadam-football

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create `.env.local` for production mode:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Email reminders
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
EMAIL_FROM=noreply@football.innovariance.com
CRON_SECRET=your-secret-key
```

**Demo Mode**: If environment variables are not set, the app runs in demo mode using localStorage.

### Database Setup

1. Create a Supabase project
2. Run the migrations in order:
   - `supabase/schema.sql` - Base schema
   - `supabase/migrations/002_player_stats.sql` - Player stats and ratings
   - `supabase/migrations/003_notifications_chat_stadium.sql` - Notifications, chat, inline stadium fields

3. Create an `avatars` storage bucket (public) in Supabase Dashboard

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run pages:build` | Build for Cloudflare Pages |
| `npm run preview` | Preview Cloudflare build |

## Deployment

### Cloudflare Pages

1. Push to GitHub
2. Go to Cloudflare Dashboard → Workers & Pages → Create
3. Connect your GitHub repository
4. Configure:
   - **Build command**: `npm run pages:build`
   - **Build output**: `.vercel/output/static`
5. Add environment variables
6. Deploy

## Data Models

### User/Profile
- id, email, full_name, phone, age
- preferred_position (goalkeeper, defender, midfielder, forward, any)
- skill_level (beginner, intermediate, advanced, professional)
- avatar_url, bio, games_played

### Room (Match)
- id, title, description, creator_id
- stadium_name, stadium_address, stadium_price_per_hour
- stadium_latitude, stadium_longitude
- date, start_time, end_time
- max_players, current_players
- skill_level_required, status (open, full, cancelled, completed)

### PlayerStats
- user_id, pace, shooting, passing, dribbling, defense, physical
- overall, total_ratings

### Notification
- id, user_id, type, title, message, room_id, is_read

### ChatMessage
- id, room_id, user_id, message, created_at

## UI Theme

Light theme with green accents:
- Background: Light green gradient (#f0fdf4 → #ecfdf5 → #f0fdfa)
- Cards: White with subtle shadows
- Primary color: Green (#00A651)
- Text: Dark gray (#1f2937)

## License

MIT

---

Built with Next.js and Supabase
