# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PeaceHub is a task allocation and scheduling platform that uses Google OAuth for authentication and implements a greedy algorithm-based task assignment system. The project consists of:

- **Backend**: Node.js/Express API server with MySQL database (via Prisma ORM)
- **Frontend**: Next.js 16 application with TypeScript and Tailwind CSS

## Development Setup

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables in .env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
SESSION_SECRET="YOUR_SESSION_SECRET"

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server (runs on port 8000)
nodemon app.js
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Testing

Backend tests use Jest and Supertest:

```bash
cd backend
npm test
```

## Architecture

### Backend Structure

The backend follows a three-layer architecture pattern:

**Routes → Controllers → Services**

- **Routes** (`/routes`): Define API endpoints and connect them to controllers
  - `auth.router.js`: Google OAuth authentication endpoints
  - `rooms.router.js`: Room creation and joining
  - `schedules.router.js`: Weekly schedule/timetable management
  - `users.router.js`: User-related operations

- **Controllers** (`/controllers`): Handle request/response logic and call services

- **Services** (`/services`): Contain business logic and database operations
  - All services use Prisma transactions for data consistency
  - Custom error classes (e.g., `RoomError`) are used for standardized error handling

- **Config** (`/config`): Configuration files
  - `passport/passportSetup.js`: Passport session serialization/deserialization
  - `passport/google.strategy.js`: Google OAuth strategy implementation

- **Middlewares** (`/middlewares`): Authentication and validation middleware
  - `checkAuth.middleware.js`: Session validation middleware

- **Prisma** (`/prisma`): Database schema and migrations
  - `prismaClient.js`: Singleton Prisma client instance used throughout the app

### Database Design

The schema implements a task allocation system with the following key relationships:

- **User ↔ Room**: 1-to-1 participation (users can only be in one room)
- **Room → Owner**: Each room has one owner (User)
- **User → ScheduleBlock**: Weekly schedule with time blocks (QUIET, BUSY, TASK)
- **RoomTaskTemplate → RoomTask**: Tasks are copied from templates when rooms are created
- **User → TaskPreference**: Users select 1st and 2nd choice tasks (priority 1, 2)
- **AssignedTask**: Results from greedy algorithm allocation using knapsack-like approach
  - `difficulty`: knapsack value
  - `estimatedTime`: knapsack capacity

Time blocks in `ScheduleBlock` use minutes-since-midnight format: `(hour * 60) + minutes`

### Authentication Flow

1. User initiates OAuth at `/api/auth/google`
2. Google redirects to `/api/auth/google/callback`
3. Passport serializes user ID into session
4. `deserializeUser` loads full user object from database on subsequent requests
5. Protected routes use `checkAuth` middleware to verify session

All protected API routes (users, rooms, schedules) require authentication.

### Frontend Structure

The frontend is built with Next.js 16 App Router, TypeScript, and Tailwind CSS v4.

**Technology Stack:**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS variables-based)
- **UI Components**: shadcn/ui
- **State Management**: Zustand (with persist middleware)
- **API Client**: SWR for data fetching and caching
- **Date Utils**: date-fns

**Directory Structure:**
```
frontend/
├── app/                      # Next.js App Router pages
│   ├── login/               # Login page
│   ├── onboarding/          # Onboarding flow (3 steps)
│   │   ├── profile/         # Step 1: Profile setup
│   │   ├── room/            # Step 2: Room create/join
│   │   └── timetable/       # Step 3: Weekly schedule
│   └── dashboard/           # Main dashboard (TODO)
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   ├── RoomCodeDisplay.tsx  # Room code with copy button
│   ├── TimetableGrid.tsx    # (TODO) Interactive 7x24 grid
│   ├── TimelineView.tsx     # (TODO) Daily timeline
│   └── CountdownBadge.tsx   # (TODO) D-day counter
├── store/                   # Zustand global stores
│   ├── userStore.ts         # User state (persisted)
│   └── roomStore.ts         # Room state (persisted)
├── lib/                     # Utilities
│   ├── api.ts               # API client with session auth
│   └── utils.ts             # shadcn utils
└── types/                   # TypeScript definitions
    └── index.ts             # All type definitions
```

**Design System (peaceHub Minimal):**
- **Primary (Lime Green)**: `#8DC63F` - All buttons, active states, task blocks
- **Accent (Coral Pink)**: `#FF9AA2` - Busy blocks, urgent badges
- **Brand (SKKU Blue)**: `#0B7BC1` - Logo only
- **Neutral**: Gray scale (50-900) - Text, backgrounds, borders
- **Border Radius**: 12px (buttons), 16px (cards)
- **Shadows**: Soft (2px/8px), Card (4px/12px)

## Key Implementation Notes

### Backend
- **Transaction Safety**: Critical operations (room creation, task copying) use Prisma transactions to ensure atomicity
- **Session Management**: Express-session with Passport handles authentication state
- **Single Room Rule**: Users can only join one room at a time (enforced in `createRoom` and `joinRoom`)
- **Task Allocation**: System uses a greedy algorithm considering user workload, preferences (1st/2nd choice), and time availability
- **Database**: MySQL is the production database; ensure Prisma migrations are run after schema changes

### Frontend
- **Session-based Auth**: All API calls use `credentials: 'include'` to send session cookies
- **401 Auto-redirect**: API client automatically redirects to `/login` on 401 Unauthorized
- **SWR Caching**: User and schedule data are cached with SWR to minimize backend calls
- **Optimistic UI**: Room creation/join updates Zustand store immediately for instant feedback
- **Component Reusability**:
  - `RoomCodeDisplay`: Used in onboarding and sidebar (with copy-to-clipboard)
  - `TimetableGrid`: Planned for onboarding, dashboard, and settings (edit/view modes)
  - `TimelineView`: Planned for daily schedule visualization
- **Time Format**: Follows backend convention - minutes since midnight (e.g., 16:00 = 960)
- **Schedule Validation**: Must cover all 24 hours with no gaps; empty time = TASK type

## Testing Patterns

Backend tests mock authenticated sessions and test full request/response cycles. See `tests/roomrouter.test.js` and `tests/schedules.router.test.js` for examples.

---

## Development Progress

### ✅ Completed (Frontend)

**Phase 1: Project Setup**
- [x] shadcn/ui initialization with custom components (Button, Input, Card, Dialog, Calendar, Badge)
- [x] Tailwind CSS v4 configuration with peaceHub color system
- [x] TypeScript type definitions for all API models
- [x] API client with session authentication (`lib/api.ts`)
- [x] Zustand stores for user and room state (with localStorage persistence)
- [x] Environment variable configuration (`.env.local`)

**Phase 2: Authentication & Onboarding**
- [x] Login page with Google OAuth integration (`app/login/page.tsx`)
- [x] Onboarding layout with 3-step progress indicator (`app/onboarding/layout.tsx`)
- [x] Step 1/3: Profile setup - name input (`app/onboarding/profile/page.tsx`)
- [x] Step 2/3: Room creation/joining (`app/onboarding/room/page.tsx`)
  - Two-card selection UI (create vs join)
  - Room creation with 6-digit code generation
  - Room joining with invite code validation
  - Error handling for 404 (invalid code), 409 (already in room)
- [x] Reusable component: `RoomCodeDisplay` with clipboard copy

### 🚧 In Progress (Frontend)

**Phase 3: Timetable Setup (Step 3/3)**
- [ ] `TimetableGrid` component - Interactive 7×24 hour grid
  - [ ] Drag-and-drop time block creation
  - [ ] Three block types: QUIET (neutral-800), BUSY (accent), TASK (primary)
  - [ ] Quick actions: Apply to weekdays, weekends, copy day
  - [ ] Validate 24-hour coverage with no gaps
  - [ ] Convert UI state to API format (minutes since midnight)
- [ ] POST `/api/schedules` integration with error handling

### 📋 Planned (Frontend)

**Phase 4: Main Dashboard**
- [ ] Dashboard layout with sidebar (`app/dashboard/layout.tsx`)
  - [ ] Hamburger menu navigation
  - [ ] User info display (from SWR cached `/api/users/`)
  - [ ] Room code display (reuse `RoomCodeDisplay`)
  - [ ] Navigation: Dashboard, Task Assignment, Timetable Settings, Results
  - [ ] Logout button
- [ ] Dashboard home (`app/dashboard/page.tsx`)
  - [ ] Monthly calendar with date selection
  - [ ] "All Members' Timetable" - overlay view
  - [ ] "My Timetable" - personal view
  - [ ] Reuse `TimelineView` component for both

**Phase 5: Reusable Components**
- [ ] `TimetableGrid` (edit/view modes)
- [ ] `TimelineView` (0-24h visualization)
- [ ] `CountdownBadge` (D-day timer)
- [ ] `DashboardSidebar` (navigation)

**Phase 6: Task Preference & Assignment**
- [ ] Task preference submission UI (1st/2nd choice)
- [ ] Deadline countdown display
- [ ] Roommate submission status
- [ ] Weekly assignment results view
- [ ] Backend API integration (once preference/assignment APIs are ready)

**Future Enhancements**
- [ ] Dark mode toggle
- [ ] Mobile responsive improvements
- [ ] Task history and statistics
- [ ] Push notifications for deadlines
- [ ] Multi-language support (i18n)

---

## Roadmap & Next Steps

### Immediate Priority (Week 1-2)
1. **Complete Timetable Setup** (Step 3/3)
   - Build interactive grid with drag functionality
   - Implement quick action buttons
   - Test API integration with backend

2. **Dashboard Foundation**
   - Create layout with sidebar
   - Implement basic navigation
   - Test session persistence

### Short-term (Week 3-4)
3. **Dashboard Features**
   - Calendar integration
   - Timeline visualization
   - Multi-user timetable overlay

4. **Testing & Polish**
   - End-to-end onboarding flow testing
   - Session expiration handling
   - Error state improvements

### Medium-term (Month 2)
5. **Task System** (depends on backend APIs)
   - Task preference UI
   - Assignment display
   - Notification system

6. **Production Readiness**
   - Performance optimization (code splitting, lazy loading)
   - SEO improvements
   - Accessibility audit (WCAG compliance)
   - CI/CD pipeline setup

---

## Common Commands

### Development
```bash
# Start both servers (recommended to use separate terminals)
cd backend && nodemon app.js    # Backend on :8000
cd frontend && npm run dev       # Frontend on :3000

# Add new shadcn component
npx shadcn@latest add [component-name]

# Type checking
cd frontend && npx tsc --noEmit

# Database operations
cd backend && npx prisma studio  # GUI for database
cd backend && npx prisma migrate dev --name [migration-name]
```

### Troubleshooting
- **Session not persisting**: Check backend CORS settings and `credentials: 'include'`
- **401 errors**: Verify backend is running on port 8000 and `.env.local` has correct API URL
- **Tailwind classes not working**: Check `globals.css` for color variable definitions
- **Type errors**: Run `npm run build` to see all TypeScript errors
