# Shake Yes - Milkshake Menu App

## Overview
A React-based milkshake/menu ordering application originally from Lovable, migrated to Replit. The app allows customers to browse a menu and place orders, with an admin panel for managing menu items, categories, and orders.

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme (pastel colors)
- **UI Components**: Shadcn/ui (Radix primitives)
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Data Storage**: localStorage (client-side)
- **Build Tool**: Vite

## Project Structure
```
src/
├── components/
│   ├── admin/          # Admin panel components
│   ├── ui/             # Shadcn UI components
│   └── *.tsx           # Feature components (Cart, Menu, etc.)
├── contexts/           # React Context providers
│   ├── AuthContext.tsx     # Simple auth with hardcoded credentials
│   ├── CheckoutContext.tsx # Cart/checkout state
│   ├── DesignContext.tsx   # Theme/design customization
│   └── MenuContext.tsx     # Menu items state
├── data/               # Configuration and default data
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Route pages
│   ├── Index.tsx       # Main menu page
│   ├── Admin.tsx       # Admin dashboard
│   ├── Login.tsx       # Admin login
│   └── NotFound.tsx    # 404 page
└── services/
    └── configService.ts # localStorage config management
```

## Running the App
The app runs on port 5000 with `npm run dev`.

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

## Recent Changes
- Migrated from Lovable to Replit environment
- Removed Supabase integration (was not actively used - app uses localStorage)
- Updated Vite config for Replit (port 5000, allowedHosts)
- Removed lovable-tagger plugin

## User Preferences
- Portuguese (Brazilian) language interface
- Pastel color theme with pink accents
