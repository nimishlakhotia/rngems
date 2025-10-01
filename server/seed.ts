import { Storage } from './storage.js';
import { db } from './db.js';
import { faqs } from '../shared/schema.js';

const storage = new Storage();

async function seed() {
  try {
    // Create admin user (skip if exists)
    try {
      const admin = await storage.createUser(
        'admin@stones.test',
        'Admin User',
        'Admin@123',
        'ADMIN'
      );
      console.log('✓ Admin created:', admin.email);
    } catch (error: any) {
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        console.log('✓ Admin user already exists');
      } else {
        throw error;
      }
    }

    // Create demo user (skip if exists)
    try {
      const demo = await storage.createUser(
        'demo@stones.test',
        'Demo User',
        'Demo@123',
        'USER'
      );
      console.log('✓ Demo user created:', demo.email);
    } catch (error: any) {
      if (error.message?.includes('duplicate key') || error.code === '23505') {
        console.log('✓ Demo user already exists');
      } else {
        throw error;
      }
    }

    // Create sample stones
    const stones = [
      {
        name: 'Blue Sapphire',
        slug: 'blue-sapphire',
        type: 'SAPPHIRE',
        color: 'Blue',
        weight: '2.50',
        origin: 'Sri Lanka',
        shortInfo: 'Stunning Ceylon blue sapphire',
        description: 'A magnificent blue sapphire with excellent clarity and deep blue color. This gem exhibits the classic cornflower blue hue that Ceylon sapphires are famous for.',
        price: '2500.00',
        currency: 'USD',
        stock: 5,
        images: [],
        isFeatured: true,
      },
      {
        name: 'Ruby Heart',
        slug: 'ruby-heart',
        type: 'RUBY',
        color: 'Red',
        weight: '1.75',
        origin: 'Myanmar',
        shortInfo: 'Premium Burmese ruby',
        description: 'Rare pigeon blood red ruby with exceptional fire. This precious gemstone displays the most sought-after color in rubies.',
        price: '3200.00',
        currency: 'USD',
        stock: 3,
        images: [],
        isFeatured: true,
      },
      {
        name: 'Emerald Dreams',
        slug: 'emerald-dreams',
        type: 'EMERALD',
        color: 'Green',
        weight: '3.20',
        origin: 'Colombia',
        shortInfo: 'Colombian emerald perfection',
        description: 'Vivid green Colombian emerald with minimal inclusions. The color is intense and the clarity is exceptional for emeralds.',
        price: '4500.00',
        currency: 'USD',
        stock: 2,
        images: [],
        isFeatured: true,
      },
      {
        name: 'Diamond Brilliance',
        slug: 'diamond-brilliance',
        type: 'DIAMOND',
        color: 'Clear',
        weight: '1.00',
        origin: 'South Africa',
        shortInfo: '1 carat brilliant cut diamond',
        description: 'Flawless round brilliant cut diamond with excellent cut, clarity, and color grades. Perfect for special occasions.',
        price: '5800.00',
        currency: 'USD',
        stock: 4,
        images: [],
        isFeatured: true,
      },
      {
        name: 'Amethyst Majesty',
        slug: 'amethyst-majesty',
        type: 'AMETHYST',
        color: 'Purple',
        weight: '5.50',
        origin: 'Brazil',
        shortInfo: 'Deep purple Brazilian amethyst',
        description: 'Large, eye-clean amethyst with rich royal purple color. Brazilian amethysts are known for their depth of color.',
        price: '450.00',
        currency: 'USD',
        stock: 8,
        images: [],
        isFeatured: false,
      },
      {
        name: 'Citrine Sunshine',
        slug: 'citrine-sunshine',
        type: 'CITRINE',
        color: 'Yellow',
        weight: '4.20',
        origin: 'Brazil',
        shortInfo: 'Golden yellow citrine',
        description: 'Bright, cheerful citrine with excellent golden yellow color. Natural citrines are rare and highly prized.',
        price: '380.00',
        currency: 'USD',
        stock: 6,
        images: [],
        isFeatured: false,
      },
      {
        name: 'Rose Quartz Serenity',
        slug: 'rose-quartz-serenity',
        type: 'QUARTZ',
        color: 'Pink',
        weight: '8.00',
        origin: 'Madagascar',
        shortInfo: 'Soft pink rose quartz',
        description: 'Beautiful rose quartz with a delicate pink hue. Known as the stone of universal love.',
        price: '220.00',
        currency: 'USD',
        stock: 10,
        images: [],
        isFeatured: false,
      },
      {
        name: 'Black Onyx Elegance',
        slug: 'black-onyx-elegance',
        type: 'OTHER',
        color: 'Black',
        weight: '6.50',
        origin: 'India',
        shortInfo: 'Polished black onyx',
        description: 'Sleek and sophisticated black onyx with a mirror-like polish. Perfect for bold jewelry designs.',
        price: '180.00',
        currency: 'USD',
        stock: 12,
        images: [],
        isFeatured: false,
      },
      {
        name: 'Rare Pink Diamond',
        slug: 'rare-pink-diamond',
        type: 'DIAMOND',
        color: 'Pink',
        weight: '0.50',
        origin: 'Australia',
        shortInfo: 'Extremely rare pink diamond',
        description: 'Exceptional pink diamond from the Argyle mine. These are among the rarest gemstones in the world.',
        price: '15000.00',
        currency: 'USD',
        stock: 1,
        images: [],
        isFeatured: true,
      },
      {
        name: 'Aquamarine Ocean',
        slug: 'aquamarine-ocean',
        type: 'OTHER',
        color: 'Blue',
        weight: '4.80',
        origin: 'Brazil',
        shortInfo: 'Sea blue aquamarine',
        description: 'Beautiful aquamarine with the color of tropical waters. Eye-clean and perfectly cut.',
        price: '680.00',
        currency: 'USD',
        stock: 0,
        images: [],
        isFeatured: false,
      },
    ];

    let stonesCreated = 0;
    for (const stone of stones) {
      try {
        const created = await storage.createStone(stone);
        console.log('✓ Stone created:', created.name);
        stonesCreated++;
      } catch (error: any) {
        if (error.message?.includes('duplicate key') || error.code === '23505') {
          console.log('  Stone already exists:', stone.name);
        } else {
          console.error('  Error creating stone:', stone.name, error.message);
        }
      }
    }

    // Create FAQs
    const faqData = [
      {
        question: 'How do I verify the authenticity of my gemstone?',
        answer: 'Every gemstone purchased from StoneVault comes with a certificate of authenticity from recognized gemological laboratories. We also provide detailed documentation about the stone\'s origin, treatment history, and characteristics.',
        sortOrder: 1,
      },
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for all gemstones. If you\'re not completely satisfied with your purchase, you can return it in its original condition for a full refund. The stone must be unused and in the same condition that you received it.',
        sortOrder: 2,
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship worldwide. International shipping typically takes 7-14 business days depending on your location. All shipments are fully insured and require a signature upon delivery for security.',
        sortOrder: 3,
      },
      {
        question: 'How should I care for my gemstone?',
        answer: 'Different gemstones require different care. Generally, store your stones separately to avoid scratches, clean them with mild soap and water, and avoid exposure to harsh chemicals. We provide specific care instructions with each purchase.',
        sortOrder: 4,
      },
      {
        question: 'Are your gemstones natural or lab-created?',
        answer: 'All our gemstones are 100% natural unless explicitly stated otherwise. We clearly label any treated or enhanced stones, and all lab-created stones are marked as such in their descriptions.',
        sortOrder: 5,
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards, PayPal, bank transfers, and cryptocurrency for international orders. All transactions are secured with SSL encryption.',
        sortOrder: 6,
      },
      {
        question: 'Can I request a custom cut or setting?',
        answer: 'Yes! We work with master craftsmen who can create custom cuts and settings. Contact us with your requirements, and we\'ll provide a quote and timeline for your custom piece.',
        sortOrder: 7,
      },
      {
        question: 'How do I know what size gemstone to buy?',
        answer: 'Gemstone size depends on your intended use. For rings, 1-3 carats is typical for center stones. For earrings, 0.5-1.5 carats per stone works well. We\'re happy to provide guidance based on your specific needs.',
        sortOrder: 8,
      },
    ];

    let faqsCreated = 0;
    for (const faq of faqData) {
      try {
        await db.insert(faqs).values(faq);
        console.log('✓ FAQ created:', faq.question.substring(0, 50) + '...');
        faqsCreated++;
      } catch (error: any) {
        if (error.code === '23505') {
          console.log('  FAQ already exists');
        } else {
          console.error('  Error creating FAQ:', error.message);
        }
      }
    }

    console.log('\n========================================');
    console.log('Seed completed successfully!');
    console.log('========================================');
    console.log(`Stones created: ${stonesCreated}`);
    console.log(`FAQs created: ${faqsCreated}`);
    console.log('\nLogin credentials:');
    console.log('Admin: admin@stones.test / Admin@123');
    console.log('Demo:  demo@stones.test / Demo@123');
    console.log('========================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();