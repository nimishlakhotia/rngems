import { pgTable, text, integer, decimal, timestamp, boolean, pgEnum, varchar, json } from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['USER', 'ADMIN']);
export const stoneTypeEnum = pgEnum('stone_type', ['DIAMOND', 'RUBY', 'SAPPHIRE', 'EMERALD', 'AMETHYST', 'CITRINE', 'QUARTZ', 'OTHER']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']);

// Sessions table for express-session
export const sessions = pgTable('sessions', {
  sid: varchar('sid', { length: 255 }).primaryKey(),
  sess: json('sess').notNull(),
  expire: timestamp('expire').notNull(),
});

// Users
export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: roleEnum('role').notNull().default('USER'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Stones
export const stones = pgTable('stones', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  type: stoneTypeEnum('type').notNull(),
  color: varchar('color', { length: 100 }).notNull(),
  weight: decimal('weight', { precision: 10, scale: 2 }).notNull(),
  origin: varchar('origin', { length: 255 }).notNull(),
  shortInfo: text('short_info').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  stock: integer('stock').notNull().default(0),
  images: json('images').$type<string[]>().notNull().default([]),
  isFeatured: boolean('is_featured').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Cart Items
export const cartItems = pgTable('cart_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stoneId: integer('stone_id').notNull().references(() => stones.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Orders
export const orders = pgTable('orders', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: orderStatusEnum('status').notNull().default('PENDING'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentRef: varchar('payment_ref', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Order Items
export const orderItems = pgTable('order_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  stoneId: integer('stone_id').notNull().references(() => stones.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 10, scale: 2 }).notNull(),
});

// Addresses
export const addresses = pgTable('addresses', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  line1: varchar('line1', { length: 255 }).notNull(),
  line2: varchar('line2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Wishlist Items
export const wishlistItems = pgTable('wishlist_items', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stoneId: integer('stone_id').notNull().references(() => stones.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// FAQs
export const faqs = pgTable('faqs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Content Blocks
export const contentBlocks = pgTable('content_blocks', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Add this table definition at the end before the last export
export const contactMessages = pgTable('contact_messages', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});