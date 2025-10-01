import express, { Request, Response, NextFunction } from 'express';
import { Storage } from './storage.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { Storage } from './storage.js';
import { db } from './db.js';
import { contactMessages } from '../shared/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const storage = new Storage();

// Multer setup for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Auth middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.user || req.session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Auth routes
router.post('/auth/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await storage.createUser(email, name, password);
    const { password: _, ...userWithoutPassword } = user;

    req.session.user = userWithoutPassword;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await storage.verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { password: _, ...userWithoutPassword } = user;
    req.session.user = userWithoutPassword;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out' });
  });
});

router.get('/auth/me', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(req.session.user);
});

// Stone routes
router.get('/stones', async (req, res) => {
  try {
    const filters = {
      type: req.query.type as string,
      color: req.query.color as string,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      search: req.query.search as string,
      limit: req.query.limit ? Number(req.query.limit) : 12,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    };

    const stones = await storage.getStones(filters);
    res.json(stones);
  } catch (error) {
    console.error('Get stones error:', error);
    res.status(500).json({ error: 'Failed to fetch stones' });
  }
});

router.get('/stones/featured', async (req, res) => {
  try {
    const stones = await storage.getFeaturedStones();
    res.json(stones);
  } catch (error) {
    console.error('Get featured stones error:', error);
    res.status(500).json({ error: 'Failed to fetch featured stones' });
  }
});

router.get('/stones/:id', async (req, res) => {
  try {
    const stone = await storage.getStoneById(Number(req.params.id));
    if (!stone) {
      return res.status(404).json({ error: 'Stone not found' });
    }
    res.json(stone);
  } catch (error) {
    console.error('Get stone error:', error);
    res.status(500).json({ error: 'Failed to fetch stone' });
  }
});

router.get('/stones/slug/:slug', async (req, res) => {
  try {
    const stone = await storage.getStoneBySlug(req.params.slug);
    if (!stone) {
      return res.status(404).json({ error: 'Stone not found' });
    }
    res.json(stone);
  } catch (error) {
    console.error('Get stone by slug error:', error);
    res.status(500).json({ error: 'Failed to fetch stone' });
  }
});

// Admin stone routes
router.post('/admin/stones', requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const images = (req.files as Express.Multer.File[])?.map(file => `/uploads/${file.filename}`) || [];
    
    const stoneData = {
      ...req.body,
      images,
      weight: String(req.body.weight),
      price: String(req.body.price),
      stock: Number(req.body.stock),
      isFeatured: req.body.isFeatured === 'true',
    };

    const stone = await storage.createStone(stoneData);
    res.json(stone);
  } catch (error) {
    console.error('Create stone error:', error);
    res.status(500).json({ error: 'Failed to create stone' });
  }
});

router.put('/admin/stones/:id', requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const newImages = (req.files as Express.Multer.File[])?.map(file => `/uploads/${file.filename}`) || [];
    const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
    
    const stoneData: any = {
      ...req.body,
      images: [...existingImages, ...newImages],
      weight: String(req.body.weight),
      price: String(req.body.price),
      stock: Number(req.body.stock),
      isFeatured: req.body.isFeatured === 'true',
    };

    const stone = await storage.updateStone(Number(req.params.id), stoneData);
    res.json(stone);
  } catch (error) {
    console.error('Update stone error:', error);
    res.status(500).json({ error: 'Failed to update stone' });
  }
});

router.delete('/admin/stones/:id', requireAdmin, async (req, res) => {
  try {
    await storage.deleteStone(Number(req.params.id));
    res.json({ message: 'Stone deleted' });
  } catch (error) {
    console.error('Delete stone error:', error);
    res.status(500).json({ error: 'Failed to delete stone' });
  }
});

// Cart routes
router.get('/cart', requireAuth, async (req, res) => {
  try {
    const cart = await storage.getCart(req.session.user!.id);
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/cart', requireAuth, async (req, res) => {
  try {
    const { stoneId, quantity } = req.body;
    const item = await storage.addToCart(req.session.user!.id, Number(stoneId), Number(quantity) || 1);
    res.json(item);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

router.put('/cart/:stoneId', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await storage.updateCartItem(req.session.user!.id, Number(req.params.stoneId), Number(quantity));
    res.json(item);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

router.delete('/cart/:stoneId', requireAuth, async (req, res) => {
  try {
    await storage.removeFromCart(req.session.user!.id, Number(req.params.stoneId));
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

router.delete('/cart', requireAuth, async (req, res) => {
  try {
    await storage.clearCart(req.session.user!.id);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// Order routes
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const orders = await storage.getOrders(req.session.user!.id);
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', requireAuth, async (req, res) => {
  try {
    const order = await storage.getOrderById(Number(req.params.id), req.session.user!.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.post('/orders', requireAuth, async (req, res) => {
  try {
    const { items, subtotal, shippingFee, total, paymentRef } = req.body;
    const order = await storage.createOrder(
      req.session.user!.id,
      { subtotal, shippingFee, total, paymentRef },
      items
    );
    await storage.clearCart(req.session.user!.id);
    res.json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.get('/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await storage.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.put('/admin/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await storage.updateOrderStatus(Number(req.params.id), status);
    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Wishlist routes
router.get('/wishlist', requireAuth, async (req, res) => {
  try {
    const wishlist = await storage.getWishlist(req.session.user!.id);
    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

router.post('/wishlist', requireAuth, async (req, res) => {
  try {
    const { stoneId } = req.body;
    const item = await storage.addToWishlist(req.session.user!.id, Number(stoneId));
    res.json(item);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

router.delete('/wishlist/:stoneId', requireAuth, async (req, res) => {
  try {
    await storage.removeFromWishlist(req.session.user!.id, Number(req.params.stoneId));
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Address routes
router.get('/addresses', requireAuth, async (req, res) => {
  try {
    const addresses = await storage.getAddresses(req.session.user!.id);
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

router.post('/addresses', requireAuth, async (req, res) => {
  try {
    const address = await storage.createAddress(req.session.user!.id, req.body);
    res.json(address);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Failed to create address' });
  }
});

router.put('/addresses/:id', requireAuth, async (req, res) => {
  try {
    const address = await storage.updateAddress(Number(req.params.id), req.session.user!.id, req.body);
    res.json(address);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

router.delete('/addresses/:id', requireAuth, async (req, res) => {
  try {
    await storage.deleteAddress(Number(req.params.id), req.session.user!.id);
    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// FAQ routes
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await storage.getFAQs();
    res.json(faqs);
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

// Content routes
router.get('/content', async (req, res) => {
  try {
    const content = await storage.getContentBlocks();
    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Failed to fetch content' });
  }
});

// Contact route
// Find this line (around line 440)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Save to database
    await db.insert(contactMessages).values({
      name,
      email,
      message,
    });
    
    console.log('Contact form submission saved:', { name, email });
    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;