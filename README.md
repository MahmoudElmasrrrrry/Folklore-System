# Egyptian Folklore Archiving System (Mawwal Project)

A full-stack digital archiving platform for documenting and publicly exploring Egyptian folklore — traditional vocal poetry (Mawwals), folk dances, traditional crafts, and Sufi heritage figures (Walis). Built as freelance archiving infrastructure for the Center for Folk Art Studies, Egypt.

The system has two sides: a **secured admin dashboard** for structured, multi-step data entry, and a **public archive** where visitors can search and browse a chronological timeline of documented material.

---

## Features

- **Shared metadata layer**: Every folklore item is linked to a common `FolkloreMaterial` record (narrator, mission, collector, subject classification, collection place/date), with type-specific details (Mawwal, Dance, Craft, Wali) stored in their own schemas.
- **Multi-step data entry**: Adding a new item first captures the shared field data, then routes dynamically to the correct type-specific form based on a central category/element registry.
- **Reference normalization**: Narrators, missions, and collectors are found-or-created rather than duplicated, so the same person/expedition is reused across multiple archived items.
- **Media uploads**: Images, audio, and video are uploaded via Multer to Cloudinary, including a signed-URL endpoint that lets the browser upload large files directly to Cloudinary without routing through the server.
- **Session-based admin auth**: Login is protected with bcrypt password hashing, rate-limited login attempts, and a temporary session-based lockout after repeated failures.
- **Cascading, reference-safe deletion**: Deleting an item removes its shared metadata record and only deletes shared Narrator/Mission/Collector documents if nothing else still references them; associated Cloudinary files are cleaned up asynchronously in the background.
- **Searchable public timeline**: An aggregated, paginated timeline across all four content types, filterable by category/type and full-text search.
- **Centralized error handling**: Mongoose validation errors and Multer upload errors are normalized into user-facing flash messages (browser flow) or JSON error responses (API flow).
- **Baseline hardening**: Helmet with a custom Content Security Policy, MongoDB input sanitization, gzip compression, and graceful shutdown on SIGINT/SIGTERM.

---

## Tech Stack

- **Runtime / Framework**: Node.js, Express.js
- **Database / ODM**: MongoDB, Mongoose
- **Views**: EJS, express-ejs-layouts, vanilla CSS/JS
- **Media storage**: Cloudinary, Multer, multer-storage-cloudinary
- **Auth & sessions**: express-session, connect-mongo (MongoDB-backed sessions), bcryptjs
- **Security & performance**: Helmet, express-mongo-sanitize, express-rate-limit, compression
- **Dev tooling**: nodemon

---

## Architecture

MVC, server-rendered:

```
Request → Routes → Controllers → Mongoose Models → MongoDB
                        ↓
                   EJS Views (rendered response)
```

- **`routes/`** — Express routers per resource (`mawwal`, `category`, `folkloreMaterial`, `cloudinarySign`, `pages`). API routes under `/api/*` are gated by the `requireAuth` session middleware.
- **`controller/`** — Business logic: creating/editing/deleting content, the admin dashboard, and public page rendering. `admin.controller.js` also owns Cloudinary cleanup and reference-counted cascading deletes.
- **`models/`** — Mongoose schemas. `FolkloreMaterial` acts as a shared parent; `Mawwal`, `Dance`, `Craft`, and `Wali` are independent schemas linked back to it, each using embedded subdocuments (e.g. craftsmen, tools, work steps, performers, mawlids, shrines) to model their nested real-world structure.
- **`middleware/`** — `requireAuth`/`requireGuest` (session guards), `errorHandler` (global error normalization), `rateLimiter` (login brute-force protection), `upload` (Multer + Cloudinary storage configs for audio vs. general media).
- **`utils/`** — `categoryElementMap.js` (central registry mapping categories to their content-type elements and readiness state), `appError.js` (custom error class), seed scripts for the admin user and base categories.
- **`views/`** — EJS templates for the public site, admin dashboard, and per-type add/edit/detail pages.

---

## Prerequisites

- [Node.js](https://nodejs.org/en/) v16+
- [MongoDB](https://www.mongodb.com/) (local instance or Atlas cluster)
- A [Cloudinary](https://cloudinary.com/) account for media storage

---

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MahmoudElmasrrrrry/Folklore-System.git
   cd Folklore-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your MongoDB connection string, a strong session secret, Cloudinary API credentials, and the initial admin username/password.

4. **Seed the admin user** (one-time)
   ```bash
   npm run seed:admin
   ```

5. **Run the app**
   ```bash
   npm run dev    # development, auto-restart via nodemon
   npm start      # production
   ```

6. **Access**
   - Public archive: `http://localhost:5000/`
   - Admin login: `http://localhost:5000/login`

---

## Project Structure

```
mawwal-project/
├── config/            # Cloudinary config
├── controller/        # Route handlers / business logic
├── middleware/         # Auth guards, error handling, rate limiting, uploads
├── models/            # Mongoose schemas
├── public/            # Static assets (CSS, JS)
├── routes/            # Express route definitions
├── utils/             # Category registry, custom error class, seed scripts
├── views/             # EJS templates
├── app.js             # Application entry point
└── .env.example       # Environment variable template
```

---

## Notes & Known Limitations

- Authentication is **session-based**, not token-based (no JWT).
- A `role` field exists on the `User` model, but authorization currently only checks "is authenticated" — there is no enforced role-based access control yet.
- CSRF mitigation is limited to the session cookie's `sameSite: "lax"` setting; there is no dedicated CSRF token middleware.
- No automated test suite or CI pipeline yet.

---

## Contribution

Developed as core archiving infrastructure for the Center for Folk Art Studies, Egypt.