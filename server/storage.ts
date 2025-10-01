import { db } from './db.js';
import { users, stones, cartItems, orders, orderItems, addresses, wishlistItems, faqs, contentBlocks } from '../shared/schema.js';
import { eq, and, sql, desc, asc, like, gte, lte } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export class Storage {
  // User methods
  async createUser(email: string, name: string, password: string, role: 'USER' | 'ADMIN' = 'USER') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      email,
      name,
      password: hashedPassword,
      role,
    }).returning();
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async verifyPassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Stone methods
  async createStone(data: any) {
    const [stone] = await db.insert(stones).values(data).returning();
    return stone;
  }

  async getStones(filters: {
    type?: string;
    color?: string;
    priceMin?: number;
    priceMax?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = db.select().from(stones);
    let conditions: any[] = [];

    if (filters.type) {
      conditions.push(eq(stones.type, filters.type as any));
    }
    if (filters.color) {
      conditions.push(eq(stones.color, filters.color));
    }
    if (filters.priceMin !== undefined) {
      conditions.push(gte(stones.price, String(filters.priceMin)));
    }
    if (filters.priceMax !== undefined) {
      conditions.push(lte(stones.price, String(filters.priceMax)));
    }
    if (filters.search) {
      conditions.push(
        sql`LOWER(${stones.name}) LIKE LOWER(${`%${filters.search}%`})`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query
      .orderBy(desc(stones.createdAt))
      .limit(filters.limit || 12)
      .offset(filters.offset || 0);

    return result;
  }

  async getFeaturedStones() {
    return db.select().from(stones).where(eq(stones.isFeatured, true)).limit(8);
  }

  async getStoneById(id: number) {
    const [stone] = await db.select().from(stones).where(eq(stones.id, id));
    return stone;
  }

  async getStoneBySlug(slug: string) {
    const [stone] = await db.select().from(stones).where(eq(stones.slug, slug));
    return stone;
  }

  async updateStone(id: number, data: any) {
    const [stone] = await db.update(stones).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(stones.id, id)).returning();
    return stone;
  }

  async deleteStone(id: number) {
    await db.delete(stones).where(eq(stones.id, id));
  }

  // Cart methods
  async getCart(userId: number) {
    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        stone: stones,
      })
      .from(cartItems)
      .innerJoin(stones, eq(cartItems.stoneId, stones.id))
      .where(eq(cartItems.userId, userId));
    return items;
  }

  async addToCart(userId: number, stoneId: number, quantity: number = 1) {
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.stoneId, stoneId)));

    if (existing) {
      const [updated] = await db
        .update(cartItems)
        .set({ 
          quantity: existing.quantity + quantity,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }

    const [item] = await db.insert(cartItems).values({
      userId,
      stoneId,
      quantity,
    }).returning();
    return item;
  }

  async updateCartItem(userId: number, stoneId: number, quantity: number) {
    const [updated] = await db
      .update(cartItems)
      .set({ 
        quantity,
        updatedAt: new Date(),
      })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.stoneId, stoneId)))
      .returning();
    return updated;
  }

  async removeFromCart(userId: number, stoneId: number) {
    await db.delete(cartItems).where(and(eq(cartItems.userId, userId), eq(cartItems.stoneId, stoneId)));
  }

  async clearCart(userId: number) {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order methods
  async createOrder(userId: number, orderData: {
    subtotal: number;
    shippingFee: number;
    total: number;
    paymentRef?: string;
  }, items: Array<{ stoneId: number; quantity: number; unitPrice: number; lineTotal: number }>) {
    const [order] = await db.insert(orders).values({
      userId,
      subtotal: String(orderData.subtotal),
      shippingFee: String(orderData.shippingFee),
      total: String(orderData.total),
      paymentRef: orderData.paymentRef,
    }).returning();

    const orderItemsData = items.map(item => ({
      orderId: order.id,
      stoneId: item.stoneId,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      lineTotal: String(item.lineTotal),
    }));

    await db.insert(orderItems).values(orderItemsData);

    return order;
  }

  async getOrders(userId: number) {
    return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getOrderById(orderId: number, userId?: number) {
    const query = db
      .select({
        order: orders,
        items: orderItems,
        stone: stones,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .innerJoin(stones, eq(orderItems.stoneId, stones.id))
      .where(userId ? and(eq(orders.id, orderId), eq(orders.userId, userId)) : eq(orders.id, orderId));

    const results = await query;
    
    if (results.length === 0) return null;

    const order = results[0].order;
    const items = results.map(r => ({
      ...r.items,
      stone: r.stone,
    }));

    return { ...order, items };
  }

  async getAllOrders() {
    const ordersData = await db
      .select({
        order: orders,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    return ordersData.map(({ order, user }) => ({
      ...order,
      user,
    }));
  }

  async updateOrderStatus(orderId: number, status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    const [updated] = await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  }

  // Wishlist methods
  async getWishlist(userId: number) {
    const items = await db
      .select({
        id: wishlistItems.id,
        stone: stones,
        createdAt: wishlistItems.createdAt,
      })
      .from(wishlistItems)
      .innerJoin(stones, eq(wishlistItems.stoneId, stones.id))
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.createdAt));
    return items;
  }

  async addToWishlist(userId: number, stoneId: number) {
    const [existing] = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.stoneId, stoneId)));

    if (existing) {
      return existing;
    }

    const [item] = await db.insert(wishlistItems).values({
      userId,
      stoneId,
    }).returning();
    return item;
  }

  async removeFromWishlist(userId: number, stoneId: number) {
    await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.stoneId, stoneId)));
  }

  // Address methods
  async getAddresses(userId: number) {
    return db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.isDefault));
  }

  async createAddress(userId: number, data: any) {
    if (data.isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    }

    const [address] = await db.insert(addresses).values({
      userId,
      ...data,
    }).returning();
    return address;
  }

  async updateAddress(id: number, userId: number, data: any) {
    if (data.isDefault) {
      await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
    }

    const [address] = await db
      .update(addresses)
      .set(data)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .returning();
    return address;
  }

  async deleteAddress(id: number, userId: number) {
    await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, userId)));
  }

  // FAQ methods
  async getFAQs() {
    return db.select().from(faqs).orderBy(asc(faqs.sortOrder));
  }

  // Content methods
  async getContentBlocks() {
    return db.select().from(contentBlocks);
  }

  async getContentByKey(key: string) {
    const [content] = await db.select().from(contentBlocks).where(eq(contentBlocks.key, key));
    return content;
  }
}