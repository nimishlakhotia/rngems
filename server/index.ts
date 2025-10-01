import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import { registerVite } from './vite.js';
import postgres from 'postgres';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL session store
const PgSession = connectPgSimple(session);
const pgPool = postgres(process.env.DATABASE_URL!);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    store: new PgSession({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      tableName: 'sessions',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API routes
app.use('/api', routes);

// Vite setup for development
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

if (process.env.NODE_ENV !== 'production') {
  await registerVite(app, server);
}

// Session type declaration
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      email: string;
      name: string;
      role: 'USER' | 'ADMIN';
    };
  }
}