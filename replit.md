# Workspace — Boost & Earn

## Overview

**Boost & Earn** is a digital visibility + earnings platform for Congo (DRC) users. Users complete social media engagement tasks (TikTok, Facebook, YouTube, Instagram) and earn 200 CDF per validated task. Advertisers can submit campaigns, and an admin panel manages the full workflow.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/boost-earn), hosted at `/`
- **API framework**: Express 5 (artifacts/api-server), hosted at `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (bcrypt + jsonwebtoken)
- **File uploads**: Multer (images saved to `artifacts/api-server/uploads/`)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **PWA**: manifest.json + service worker at `public/sw.js`

## Admin Account

- **Phone**: 0980687851
- **Password**: admin

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   ├── src/routes/     # auth, tasks, submissions, withdrawals, notifications, deposits, admin, referrals
│   │   ├── src/lib/auth.ts # JWT auth helpers
│   │   └── uploads/        # User-uploaded files (submissions, payment proofs)
│   └── boost-earn/         # React + Vite frontend
│       ├── src/pages/      # auth/login, auth/register, home, tasks, submit, team, profile
│       ├── src/pages/admin/# admin-layout, users, validate-tasks, deposits, withdrawals, add-task
│       ├── src/components/ # image-uploader, task-card, platform-icon, layout/
│       ├── src/lib/        # auth-store (zustand), fetch-interceptor
│       ├── public/         # logo.png, manifest.json, sw.js
│       └── index.html      # PWA-enabled
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/
│       └── schema/         # users, tasks, submissions, withdrawals, notifications, deposits
└── scripts/
```

## Features

### User Features
- Registration with referral code support
- Login with JWT token (stored in localStorage)
- Home: 4 platform cards (TikTok, Facebook, YouTube, Instagram) with task counts
- Tasks: list all active tasks with time remaining, upload screenshots, submit
- Submit: advertiser form to submit campaign + payment proof
- Team: referral link + team list
- Profile: balance display, withdrawal request, WhatsApp support links
- Notifications: bell icon with unread count, mark all read
- PWA: installable on mobile and desktop

### Admin Features (phone: 0980687851, password: admin)
- **Users**: view all users with team count, add/subtract balance, suspend/unsuspend, reset password
- **Validate Tasks**: ordered by submission date, grouped by user, all images per submission visible and zoomable, approve (→ +200 CDF + notification) / reject (with mandatory reason + notification)
- **Deposits**: view payment proofs (zoomable), approve to create/publish task
- **Withdrawals**: approve/reject withdrawal requests
- **Add Task**: manually add tasks with link, platform, task name, duration

### Business Rules
- 1 validated task = 200 CDF
- Minimum withdrawal: 6000 CDF (24-72h processing, Mon-Sat)
- Task duration: auto-expires after set days
- External links open in native apps (target="_blank")
- Images only accepted in all upload fields

## API Endpoints

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `GET /api/tasks` — List active tasks
- `GET /api/tasks/platform-counts` — Platform task counts
- `POST /api/tasks` — Create task (admin)
- `POST /api/submissions` — Submit task proof (multipart)
- `GET /api/submissions/admin` — All submissions (admin)
- `POST /api/submissions/:id/approve` — Approve submission
- `POST /api/submissions/:id/reject` — Reject submission
- `POST /api/withdrawals` — Request withdrawal
- `GET /api/withdrawals/admin` — All withdrawals (admin)
- `POST /api/withdrawals/:id/approve` — Approve withdrawal
- `POST /api/deposits` — Submit advertiser campaign (multipart)
- `GET /api/deposits` — All deposits (admin)
- `POST /api/deposits/:id/approve` — Approve deposit → publish task
- `GET /api/notifications` — User notifications
- `POST /api/notifications/read-all` — Mark all read
- `GET /api/admin/users` — All users (admin)
- `POST /api/admin/users/:id/balance` — Adjust balance (admin)
- `POST /api/admin/users/:id/suspend` — Toggle suspension (admin)
- `POST /api/admin/users/:id/reset-password` — Reset password (admin)
- `GET /api/referrals/link` — Get referral info
- `GET /api/referrals/team` — Get team members

## Payment Info (for advertisers)
- Airtel Money: 0980687851
- M-Pesa: 0835836829
- Orange Money: 0845691564
- Nom: Jonas Mbusa
