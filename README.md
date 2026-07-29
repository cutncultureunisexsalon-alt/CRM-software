# Salon CRM

Production-ready Salon Customer Relationship Management system with WhatsApp automation, built with React, Node.js, Express, and Supabase.

## Features

- **Admin Login** — JWT-based secure authentication
- **Dashboard** — Real-time stats for customers, messages, and WhatsApp status
- **Customer CRUD** — Full create, read, update, delete with validation
- **Excel Import/Export** — Bulk customer management via `.xlsx` files
- **Search & Filters** — Search by name/phone/email, filter by gender and status
- **WhatsApp QR Login** — Connect via QR code using `whatsapp-web.js`
- **Automated Messages** — Cron jobs for birthdays, anniversaries, monthly offers, and 30-day follow-ups
- **Message Templates** — Customizable templates with placeholder variables
- **Message Logs** — Full audit trail of all sent/failed messages
- **Responsive Dark UI** — Modern dark theme, mobile-friendly

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | Node.js, Express (MVC architecture) |
| Database   | Supabase (PostgreSQL)               |
| Auth       | JWT + bcrypt                        |
| WhatsApp   | whatsapp-web.js                     |
| Scheduling | node-cron                           |
| Deployment | Vercel + Render + Supabase          |

## Project Structure

```
salon-crm/
├── backend/                 # Express API (MVC)
│   ├── src/
│   │   ├── config/          # App & Supabase config
│   │   ├── controllers/     # Request handlers
│   │   ├── cron/            # Scheduled jobs
│   │   ├── middleware/      # Auth, validation, errors
│   │   ├── models/          # Database queries
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── validators/      # Input validation
│   │   └── scripts/         # Seed scripts
│   └── package.json
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   └── services/        # API client
│   └── package.json
├── supabase/
│   └── migrations/          # Database schema
└── render.yaml              # Render deployment config
```

## Setup

### 1. Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Copy your **Project URL** and **Service Role Key** from Settings → API

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials and JWT secret
npm install
npm run seed    # Creates admin user
npm run dev     # Starts on http://localhost:5000
```

Default admin credentials (change after first login):
- Email: `admin@salon.com`
- Password: `Admin@123456`

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev     # Starts on http://localhost:5173
```

## API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/auth/login`               | Admin login              |
| GET    | `/api/auth/profile`             | Get admin profile        |
| GET    | `/api/customers`                | List customers (paginated)|
| POST   | `/api/customers`                | Create customer          |
| PUT    | `/api/customers/:id`            | Update customer          |
| DELETE | `/api/customers/:id`            | Delete customer          |
| POST   | `/api/customers/import`         | Import Excel file        |
| GET    | `/api/customers/export`         | Export Excel file        |
| GET    | `/api/templates`                | List message templates   |
| POST   | `/api/templates`                | Create template          |
| GET    | `/api/message-logs`             | List message logs        |
| GET    | `/api/whatsapp/status`          | WhatsApp connection status|
| POST   | `/api/whatsapp/initialize`      | Start WhatsApp & get QR  |
| POST   | `/api/whatsapp/logout`          | Disconnect WhatsApp      |
| POST   | `/api/whatsapp/cron/:job`       | Manually trigger cron job|
| GET    | `/api/whatsapp/dashboard`       | Dashboard statistics     |

## Cron Schedule (Default)

| Job            | Schedule       | Description                        |
|----------------|----------------|------------------------------------|
| Birthday       | `0 9 * * *`    | Daily at 9:00 AM                   |
| Anniversary    | `0 9 * * *`    | Daily at 9:00 AM                   |
| Monthly Offer  | `0 10 1 * *`   | 1st of every month at 10:00 AM     |
| Follow-up      | `0 10 * * *`   | Daily at 10:00 AM (30-day rule)    |

Timezone defaults to `Asia/Kolkata`. Configure via `CRON_TIMEZONE` env var or app settings.

## Message Template Placeholders

Use these in template content:

- `{{name}}` — Customer name
- `{{phone}}` — Customer phone
- `{{email}}` — Customer email
- `{{salon_name}}` — Salon name from settings
- `{{birthday}}` — Customer birthday
- `{{anniversary}}` — Customer anniversary
- `{{last_visit}}` — Last visit date

## Deployment

### Supabase
Run the migration SQL in your production Supabase project.

### Backend (Render)

1. Push code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Use the `render.yaml` blueprint or configure manually:
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
4. Set environment variables from `backend/.env.example`
5. Add a **Persistent Disk** mounted at `backend/.wwebjs_auth` for WhatsApp session persistence
6. Run seed once via Render shell: `cd backend && npm run seed`

### Frontend (Vercel)

1. Import the repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Set environment variable:
   ```
   VITE_API_URL=https://your-render-api.onrender.com/api
   ```
4. Deploy

### Post-Deployment Checklist

- [ ] Run database migration on Supabase
- [ ] Seed admin user on Render
- [ ] Set `FRONTEND_URL` on Render to your Vercel URL
- [ ] Set `VITE_API_URL` on Vercel to your Render API URL
- [ ] Connect WhatsApp via the admin panel
- [ ] Change default admin password

## Security

- JWT tokens with configurable expiry
- bcrypt password hashing (12 rounds)
- Rate limiting on API and login endpoints
- Helmet security headers
- Input validation with express-validator
- CORS restricted to frontend URL
- Service role key used only on backend (never exposed to client)

## License

MIT
