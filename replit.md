# Shake Yes - Milkshake Menu App

## Overview
A React-based milkshake/menu ordering application with database persistence. Customers can browse a menu and place orders, while admins can manage menu items, categories, and orders through a dashboard.

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Styling**: Tailwind CSS with custom theme (pastel colors)
- **UI Components**: Shadcn/ui (Radix primitives)
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Build Tool**: Vite

## Project Structure
```
├── server/                 # Backend
│   ├── index.ts           # Express server entry
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database storage interface
│   ├── db.ts              # Database connection
│   └── vite.ts            # Vite integration
├── shared/
│   └── schema.ts          # Drizzle database schema
├── src/                   # Frontend
│   ├── components/
│   │   ├── admin/         # Admin panel components
│   │   ├── ui/            # Shadcn UI components
│   │   └── *.tsx          # Feature components
│   ├── contexts/          # React Context providers
│   ├── data/              # Configuration types
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── pages/             # Route pages
│   └── services/
│       └── configService.ts # API client
├── drizzle.config.ts      # Drizzle configuration
└── migrations/            # Database migrations
```

## Running the App
The app runs on port 5000 with `npm run dev`.

## Database Commands
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## API Endpoints
- `/api/menu-config` - Full menu configuration (GET/PUT)
- `/api/checkout-config` - Checkout steps (GET/PUT)
- `/api/design-config` - Store branding (GET/PUT)
- `/api/orders` - Order management (CRUD)
- `/api/menu-items` - Menu items (CRUD)
- `/api/categories` - Categories (CRUD)
- `/api/extras` - Extra toppings (CRUD)
- `/api/drink-options` - Drink options (CRUD)
- `/api/acai-turbine` - Acai turbine items (CRUD)
- `/api/checkout-steps` - Checkout steps (CRUD)

## Routes
- `/` - Main menu page
- `/:mesa` - Menu with table number
- `/login` - Admin login
- `/admin` - Admin dashboard (requires login)

## Admin Access
Default credentials (hardcoded in AuthContext.tsx):
- Email: gabrieljporfirio@gmail.com
- Password: 12345678

## Features
- Menu browsing with categories
- Shopping cart
- Order placement with WhatsApp integration
- Admin panel for:
  - Menu item management
  - Category management
  - Order management
  - Design/theme customization
  - Checkout steps configuration
- **Data syncs across browsers** via PostgreSQL database

## Recent Changes
- Migrated from Lovable to Replit environment
- Added PostgreSQL database with Drizzle ORM
- Created Express.js backend with full REST API
- Updated frontend to use API instead of localStorage
- Data now persists in database and syncs across browsers

## User Preferences
- Portuguese (Brazilian) language interface
- Pastel color theme with pink accents
