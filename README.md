# StoneVault - E-Commerce Gemstone Platform

A full-stack e-commerce platform for selling premium gemstones with admin management, user authentication, shopping cart, wishlist, and order management.

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Wouter (routing)
- React Query (data fetching)
- React Hook Form + Zod (forms/validation)

### Backend
- Express.js + TypeScript
- PostgreSQL (Neon serverless)
- Drizzle ORM
- Session-based auth (express-session + connect-pg-simple)
- Bcrypt (password hashing)
- Multer (file uploads)

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Neon recommended)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=your-super-secret-session-key-change-this
PORT=5000
NODE_ENV=development
```

### 3. Database Setup
Push the schema to your database:

```bash
npm run db:push
```

### 4. Create Upload Directory
```bash
mkdir -p public/uploads
```

### 5. Seed Database (Optional)
You can manually create seed data or use the admin panel once the app is running.

Default accounts to create:
- Admin: `admin@stones.test` / `Admin@123`
- Demo User: `demo@stones.test` / `Demo@123`

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
project-root/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities and services
│   │   └── types/         # TypeScript types
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   ├── db.ts             # Database connection
│   └── vite.ts           # Vite middleware
├── shared/               # Shared code
│   └── schema.ts         # Database schema
└── public/
    └── uploads/          # Uploaded images
```

## Features

### Public Features
- Browse gemstones with filters (type, color, price)
- Search functionality
- View stone details
- FAQ page
- Contact form

### User Features (requires authentication)
- Shopping cart
- Wishlist
- Order history
- Profile management
- Multiple shipping addresses

### Admin Features
- Dashboard with statistics
- Stone management (CRUD)
- Order management
- Update order status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Stones
- `GET /api/stones` - Get all stones (with filters)
- `GET /api/stones/featured` - Get featured stones
- `GET /api/stones/:id` - Get stone by ID
- `GET /api/stones/slug/:slug` - Get stone by slug
- `POST /api/admin/stones` - Create stone (admin)
- `PUT /api/admin/stones/:id` - Update stone (admin)
- `DELETE /api/admin/stones/:id` - Delete stone (admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:stoneId` - Update cart item
- `DELETE /api/cart/:stoneId` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order
- `GET /api/admin/orders` - Get all orders (admin)
- `PUT /api/admin/orders/:id` - Update order status (admin)

### Wishlist
- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:stoneId` - Remove from wishlist

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

## Development Notes

- All state is managed through React Query cache and server sessions (no localStorage/sessionStorage)
- File uploads are stored in `public/uploads/`
- Session-based authentication (no JWT)
- Admin middleware checks `req.session.user.role === "ADMIN"`
- ES Modules used throughout (import/export)

## Production Build

```bash
npm run build
npm run preview
```

## Database Studio

To view and manage your database:

```bash
npm run db:studio
```

## License

MIT