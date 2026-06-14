# CarbonTracker

CarbonTracker is a full-stack carbon footprint awareness platform that helps users understand, track, and reduce their environmental impact. Users can record everyday activities, estimate their CO2 emissions, monitor progress through visual dashboards, receive personalized recommendations, and chat with an AI sustainability assistant.

## Features

- Secure user registration, login, logout, and session refresh
- Record travel, food, household, and other carbon-producing activities
- AI-assisted carbon footprint calculations
- Personal dashboard with emissions summaries and progress charts
- Category-based carbon footprint breakdowns
- Personalized carbon reduction tips
- AI sustainability chat with saved message history
- Paginated activity history
- Delete previously recorded activities
- Export activity data as CSV
- Responsive design with light and dark themes
- Protected application routes
- Input validation, sanitization, rate limiting, and secure HTTP headers
- Optional Redis caching for improved performance

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- Radix UI
- Recharts
- Zod
- Vitest and Testing Library

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL with Neon
- Google Gemini API
- JSON Web Tokens
- bcrypt
- Optional Redis caching with ioredis
- Jest and Supertest

## Project Architecture

```text
Browser
   |
   v
React + Vite Client
   |
   v
Node.js + Express REST API
   |                    |
   v                    v
Neon PostgreSQL    Google Gemini API
```

The frontend and backend are stored in a single repository:

```text
carbon/
|-- client/              React frontend
|-- server/              Express backend
|-- .env.example         Environment variable template
|-- .gitignore           Git exclusions
|-- .prettierrc          Prettier configuration
|-- eslint.config.mjs    ESLint configuration
|-- package.json         Shared project scripts
|-- package-lock.json    Locked dependency versions
`-- README.md
```

## Application Pages

- **Landing:** Project introduction, footprint estimator, features, and FAQs
- **Register:** New user account creation
- **Login:** Existing user authentication
- **Dashboard:** Emission summary, category breakdown, and daily progress
- **Activities:** Add, view, paginate, and delete carbon activities
- **Tips:** Personalized AI-generated sustainability recommendations
- **Chat:** AI sustainability assistant with conversation history

## Getting Started

### Requirements

- Node.js 20 or newer
- npm
- A PostgreSQL database or Neon project
- A Google Gemini API key
- Redis is optional

### Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Install all dependencies:

```bash
npm install
npm run install:all
```

Create the environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the values inside `.env`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="your-long-random-secret"
JWT_REFRESH_SECRET="your-different-long-random-secret"
CLIENT_URL="http://localhost:5173"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

Apply the Prisma schema:

```bash
npm run db:setup
```

Start the backend:

```bash
npm run dev:server
```

Start the frontend in another terminal:

```bash
npm run dev:client
```

Open `http://localhost:5173` in your browser.

## Environment Variables

| Variable             | Required | Purpose                                  |
| -------------------- | -------- | ---------------------------------------- |
| `PORT`               | No       | Backend server port; defaults to `5000`. |
| `NODE_ENV`           | Yes      | Application environment.                 |
| `DATABASE_URL`       | Yes      | PostgreSQL database connection string.   |
| `GEMINI_API_KEY`     | Yes      | Google Gemini API key.                   |
| `JWT_SECRET`         | Yes      | Access-token signing secret.             |
| `JWT_REFRESH_SECRET` | Yes      | Refresh-token signing secret.            |
| `CLIENT_URL`         | Yes      | Frontend origin allowed by CORS.         |
| `REDIS_HOST`         | No       | Optional Redis server hostname.          |
| `REDIS_PORT`         | No       | Optional Redis server port.              |

Never commit `.env` or expose database credentials, Gemini keys, or JWT secrets.

## Available Scripts

### Root Scripts

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm run install:all`  | Install frontend and backend dependencies. |
| `npm run dev:server`   | Start the backend in development mode.     |
| `npm run dev:client`   | Start the frontend in development mode.    |
| `npm run db:setup`     | Push the Prisma schema to the database.    |
| `npm run lint`         | Check frontend and backend source code.    |
| `npm run lint:fix`     | Fix supported lint issues.                 |
| `npm run format`       | Format source code with Prettier.          |
| `npm run format:check` | Check source-code formatting.              |

### Backend Scripts

Run these commands from `server/`:

| Command                 | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Start the API in watch mode.                   |
| `npm run build`         | Generate Prisma Client and compile TypeScript. |
| `npm start`             | Start the compiled API.                        |
| `npm test`              | Run backend tests.                             |
| `npm run test:coverage` | Run backend tests with coverage.               |
| `npm run db:push`       | Push schema changes to the database.           |
| `npm run db:seed`       | Seed the database.                             |

### Frontend Scripts

Run these commands from `client/`:

| Command                 | Description                           |
| ----------------------- | ------------------------------------- |
| `npm run dev`           | Start the Vite development server.    |
| `npm run build`         | Type-check and build the frontend.    |
| `npm run preview`       | Preview the production build locally. |
| `npm test`              | Run frontend tests.                   |
| `npm run test:coverage` | Run frontend tests with coverage.     |

## API Overview

All application endpoints use the `/api` prefix.

| Method   | Endpoint                   | Description                           |
| -------- | -------------------------- | ------------------------------------- |
| `POST`   | `/api/auth/register`       | Create a user account.                |
| `POST`   | `/api/auth/login`          | Authenticate a user.                  |
| `POST`   | `/api/auth/refresh`        | Refresh authentication tokens.        |
| `POST`   | `/api/auth/logout`         | Log out and revoke the refresh token. |
| `GET`    | `/api/auth/me`             | Get the current user.                 |
| `POST`   | `/api/activities`          | Calculate and save an activity.       |
| `GET`    | `/api/activities`          | Get paginated activities.             |
| `DELETE` | `/api/activities/:id`      | Delete an activity.                   |
| `GET`    | `/api/dashboard/summary`   | Get dashboard totals.                 |
| `GET`    | `/api/dashboard/breakdown` | Get emissions by category.            |
| `GET`    | `/api/dashboard/progress`  | Get daily progress data.              |
| `GET`    | `/api/tips`                | Get personalized reduction tips.      |
| `GET`    | `/api/tips/status`         | Check the Gemini integration.         |
| `POST`   | `/api/chat/message`        | Send an AI chat message.              |
| `GET`    | `/api/chat/history`        | Get saved chat messages.              |
| `GET`    | `/api/export`              | Export activity data as CSV.          |
| `GET`    | `/health`                  | Check backend health.                 |

## Database Models

### User

Stores account details, secure password hashes, refresh tokens, and relationships to activities and chat messages.

### Activity

Stores the activity type, category, amount, unit, calculated carbon footprint, date, and owner.

### ChatMessage

Stores AI conversation messages by user, role, content, and creation time.

## Security

- Passwords are hashed with bcrypt.
- Access and refresh tokens use separate JWT secrets.
- Refresh tokens are stored in HTTP-only cookies.
- Protected routes require a valid access token.
- Zod validates incoming data.
- Request sanitization reduces unsafe input.
- Rate limiting protects authentication and AI routes.
- Helmet adds secure HTTP response headers.
- CORS restricts requests to the configured frontend origin.
- Logger redaction prevents sensitive headers and passwords from appearing in logs.

## Testing

The frontend uses Vitest and Testing Library for component tests. The backend uses Jest and Supertest for unit and integration tests covering authentication, activities, dashboards, tips, validation, JWT handling, caching, and error handling.

Run all frontend tests:

```bash
cd client
npm test
```

Run all backend tests:

```bash
cd server
npm test
```

## License

This project currently does not include a license.
