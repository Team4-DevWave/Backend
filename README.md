# Threadit - Backend

REST API for **Threadit**, a Reddit-style social platform for web and mobile clients. Built with **Node.js**, **Express**, and **MongoDB**, with real-time chat (**Socket.IO**), push notifications (**Firebase Cloud Messaging**, **web-push**), and media uploads (**Cloudinary**).

---

## Features

- **Authentication** - Email/password signup and login, JWT (Bearer header or `jwt` cookie), password reset, Google OAuth-style signup/login (via Google userinfo API), email verification (Nodemailer).
- **Users & profiles** - Profiles, saved/hidden posts, vote history, friends, block lists, favorites, settings (notifications, password, email, country, social links, display name, profile picture).
- **Communities (“subreddits”)** - Create communities, browse/list by category, subscribe/unsubscribe, private communities with invites, moderation roles (creator is moderator), moderator-only community deletion, community rules, in-community search (posts, comments, media).
- **Posts & feeds** - Create/edit/delete posts, sorting (hot, top, new, best), voting, polls, NSFW/spoiler/lock, save/hide/report (report handlers partially stubbed), share, insights; image/video handling via Cloudinary.
- **Comments** - Threaded comments, vote, edit/delete, save, report (partial).
- **Homepage & discovery** - Trending, category browsing, global search.
- **Notifications** - In-app notification documents, read/unread counts, per-user and per-community notification settings, moderator-oriented notification tuning; **FCM** for mobile device tokens.
- **Messaging** - Inbox/sent/unread, replies, mentions; endpoints tailored for cross-platform clients (`/allmessages`, etc.); web push used from message flows.
- **Real-time chat** - HTTP REST for chat rooms and message history; **Socket.IO** on port **3005** for live messages (JWT via handshake query).
- **Observability** - Prometheus-style metrics at `/api/v1/metrics` (counts/latency when host matches production domain).

---

## Tech stack

| Area | Technology |
|------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose) |
| Real-time | Socket.IO |
| Push | Firebase Admin SDK, web-push |
| Media | Cloudinary |
| Email | Nodemailer (Gmail transport in repo — prefer env-based config for deployments) |
| Testing | Jest, Supertest |
| Other | JWT, bcryptjs, cookie-parser, CORS, prom-client |

---

## Prerequisites

- **Node.js**: (compatible with the versions pinned in `package-lock.json`)
- **MongoDB**: Atlas URI or local instance
- Optional: **Firebase** service account JSON for FCM (see below)

---

## Setup

1. **Clone and install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `config.env` to a local file you do not commit (or create `config.env` next to `server.js`). The app loads `./config.env` via `dotenv`.

   Required variables used in code:

   | Variable | Purpose |
   |----------|---------|
   | `DATABASE` | MongoDB connection string; use literal `<password>` where the password goes — it is substituted with `DATABASE_PASSWORD` in `server.js` |
   | `DATABASE_PASSWORD` | Password substituted into `DATABASE` |
   | `JWT_SECRET` | Signing key for access tokens |
   | `JWT_EXPIRES_IN` | JWT expiry (e.g. `90d`) |
   | `JWT_COOKIE_EXPIRES_IN` | Cookie lifetime in days |
   | `PORT` | HTTP API port (default **8000** if unset) |
   | `NODE_ENV` | `development` or `production` (affects errors and cookie `secure`) |

   **Security:** If this repository is public or shared, rotate any credentials that appear in `config.env`, hardcoded Cloudinary keys, email credentials, or the Firebase Admin JSON filename referenced in `utils/firebaseinit.js`. Prefer moving all secrets into environment variables or a secret manager and adding `config.env` (and service account JSON) to `.gitignore`.

3. **Firebase (mobile push)**

   `utils/firebaseinit.js` initializes Firebase Admin with a service account file in the project root. Replace with your own Firebase project file and keep it out of version control in production.

---

## Running the server

```bash
npm run start:dev
```

- **REST API:** `http://localhost:<PORT>` (default **8000**)
- **Socket.IO:** separate listener on port **3005** after MongoDB connects; CORS origins include `http://localhost:3000` and `https://www.threadit.tech` (adjust in `server.js` for other frontends)

Production-style script (Windows-oriented env in `package.json`):

```bash
npm run start:prod
```

---

## API overview

Base path: **`/api/v1`**

| Prefix | Responsibility |
|--------|----------------|
| `/users` | Auth, profile, `/me/*` settings and social features |
| `/posts` | Global post feeds and post CRUD (mounted at root `/posts`; also nested under communities) |
| `/comments` | Comments (often nested under `/posts/:postid/comments`) |
| `/r` | Communities: `/create`, `/:subreddit`, subscribe, rules, nested `/:subredditid/posts`, etc. |
| `/messages` | Direct/reddit-style messaging |
| `/homepage` | `trending`, `subreddits_by_category`, `search` |
| `/notifications` | Notification CRUD and settings (authenticated) |
| `/chatrooms`, `/chatmessages` | Chat rooms and messages |
| `/metrics` | Prometheus metrics |

Detailed shapes are defined by the Mongoose models under `models/` and controllers under `controllers/`.

---

## Testing

```bash
npm test
```

Tests live under `tests/routes/` and use **Jest** with **Supertest**. Many suites target a **running API** at `http://localhost:8000` (see test files). Start the server and ensure MongoDB and env match test expectations before running the full suite.

---

## Project layout (high level)

```
├── app.js                 # Express app, middleware, route mounting
├── server.js              # HTTP server, MongoDB, Socket.IO
├── config.env             # Environment (keep secrets private)
├── routes/                # Route definitions
├── controllers/           # Request handlers
├── models/                # Mongoose schemas
├── utils/                 # Helpers (errors, Firebase init, pagination, etc.)
├── nodemailer-gmail/      # Email sending helper
└── tests/                 # Jest + Supertest tests
```

---

## License

Add a license here if applicable.
