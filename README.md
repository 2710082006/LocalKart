# Farm2Door — Hyperlocal Farmer-to-Customer Marketplace

A production-grade full-stack marketplace connecting local farmers directly with nearby customers.

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS 3 + ShadCN UI
- Redux Toolkit + React Query
- Framer Motion + GSAP
- React Router DOM v6
- React Hook Form
- Lucide Icons
- Recharts

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer + Cloudinary (image uploads)
- Razorpay (payments)
- Google Maps API (location)

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone and install all dependencies
npm run install-all

# Copy environment variables
cp .env.example server/.env

# Edit server/.env with your API keys

# Seed the database
npm run seed

# Start development (both client + server)
npm run dev
```

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1

### Demo Credentials (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@farm2door.com | Admin@123456 |
| Customer | customer@demo.com | Demo@123456 |
| Farmer | farmer@demo.com | Demo@123456 |
| Delivery | delivery@demo.com | Demo@123456 |

## Project Structure

```
farm2door/
├── client/                # React frontend
│   ├── src/
│   │   ├── animations/    # GSAP + Framer Motion
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks
│   │   ├── layouts/       # Page layouts
│   │   ├── lib/           # ShadCN utils
│   │   ├── pages/         # All pages
│   │   ├── services/      # API layer
│   │   ├── store/         # Redux store
│   │   └── utils/         # Helpers
│   └── ...
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # DB, cloud configs
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, error, etc.
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helpers
│   │   └── validators/    # Input validation
│   └── ...
└── docker-compose.yml
```

## Docker

```bash
docker-compose up --build
```

## License

MIT
