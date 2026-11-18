// Product catalogue. `price` is the list price; the storewide sale discount
// is applied at display / cart time (see lib/site.js).

export const categoryMeta = {
  men: {
    label: 'For Him',
    description: 'Bold, refined Eau de Parfum for men',
    image: '/products/white-sultan-1.webp',
  },
  women: {
    label: 'For Her',
    description: 'Floral, graceful Eau de Parfum for women',
    image: '/products/pink-aura-1.webp',
  },
  home: {
    label: 'Reed Diffusers',
    description: 'Household aroma therapy for every room',
    image: '/products/rose-petal-reed-1.webp',
  },
  accessories: {
    label: 'Car Diffusers',
    description: 'Take your signature scent on the road',
    image: '/p6.jpeg',
  },
  testers: {
    label: 'Discovery Set',
    description: 'Five signature scents to explore',
    image: '/p11.jpeg',
  },
};

export const categoryOrder = ['men', 'women', 'home', 'accessories', 'testers'];

export const products = [
  {
    id: 1,
    name: 'Musk Al Rawdah – Zareen Fragrance 50 ml Eau de Parfum',
    shortName: 'Musk Al Rawdah',
    nameAr: 'مسک الروضۃ',
    subtitle: 'Eau de Parfum · 50 ml',
    price: 2850,
    images: ['/p1.jpeg', '/p1-2.jpeg', '/p1-3.jpeg'],
    mainImage: '/products/musk-al-rawdah-1.webp',
    lifestyle: ['/products/musk-al-rawdah-1.webp', '/products/musk-al-rawdah-2.webp', '/products/musk-al-rawdah-3.webp'],
    description:
      'An elegant, luxurious scent inspired by traditional musk notes.\n\nThe fragrance blends rich oriental musk with subtle floral hints for a sophisticated aura.',
    category: 'men',
  },
  {
    id: 2,
    name: 'Pink Aura – Zareen Fragrance 50 ml Eau de Parfum',
    shortName: 'Pink Aura',
    subtitle: 'Eau de Parfum · 50 ml',
    price: 2900,
    images: ['/p2.jpeg', '/p2-2.jpeg', '/p2-3.jpeg'],
    mainImage: '/products/pink-aura-1.webp',
    lifestyle: ['/products/pink-aura-1.webp', '/products/pink-aura-2.webp', '/products/pink-aura-3.webp', '/products/pink-aura-4.webp', '/products/pink-aura-5.webp'],
    description:
      'A fresh and captivating scent that elevates your day.\n\nPink Aura blends floral and fruity notes for a boost of confidence and energy.',
    category: 'women',
  },
  {
    id: 3,
    name: 'Fresh Aura – Zareen Fragrance 50 ml Eau de Parfum',
    shortName: 'Fresh Aura',
    subtitle: 'Eau de Parfum · 50 ml',
    price: 3100,
    images: ['/p3.jpeg', '/p3-2.jpeg', '/p3-3.jpeg'],
    mainImage: '/products/card-fresh-aura.webp',
    description:
      'A crisp, invigorating scent that leaves a lasting impression of elegance.\n\nFresh Aura captures bright citrus and clean floral notes for all-day freshness.',
    category: 'men',
  },
  {
    id: 4,
    name: 'White Sultan by Zareen Fragrance',
    shortName: 'White Sultan',
    subtitle: 'Eau de Parfum · 50 ml',
    price: 3250,
    images: ['/p4.jpeg', '/p4-2.jpeg', '/p4-3.jpeg'],
    mainImage: '/products/white-sultan-1.webp',
    lifestyle: ['/products/white-sultan-1.webp', '/products/white-sultan-2.webp', '/products/white-sultan-3.webp'],
    // These photos have a grey backdrop; match it so the image blends into its frame.
    imageBg: '#8a8b86',
    description: 'A royal scent that elevates your vibe. White Sultan is made for those who like to be remembered.',
    category: 'men',
  },
  {
    id: 5,
    name: 'Jasmine Bloom Car Diffuser by Zareen Fragrance',
    shortName: 'Jasmine Bloom',
    subtitle: 'Car Diffuser',
    price: 1200,
    images: ['/p5.jpeg'],
    mainImage: '/products/card-car-jasmine-bloom.webp',
    description: 'Transform your drive into a floral paradise with the soft, sweet character of jasmine.',
    category: 'accessories',
  },
  {
    id: 6,
    name: 'Rose Petal Car Diffuser by Zareen Fragrance',
    shortName: 'Rose Petal',
    subtitle: 'Car Diffuser',
    price: 1200,
    images: ['/p6.jpeg'],
    mainImage: '/products/card-car-rose-petal.webp',
    description: 'A timeless, elegant scent that brings the freshness of a rose garden to your car.',
    category: 'accessories',
  },
  {
    id: 7,
    name: 'Lavender Car Diffuser by Zareen Fragrance',
    shortName: 'Lavender',
    subtitle: 'Car Diffuser',
    price: 1200,
    images: ['/p7.jpeg'],
    mainImage: '/products/card-car-lavender.webp',
    description:
      'A calming and elegant car air freshener featuring soothing lavender notes, housed in a stylish glass bottle with a hanging cord.',
    category: 'accessories',
  },
  {
    id: 8,
    name: 'Rose Petal Reed Diffuser by Zareen Fragrance',
    shortName: 'Rose Petal',
    subtitle: 'Reed Diffuser · Household Aroma Therapy',
    price: 2650,
    images: ['/p8.jpeg'],
    mainImage: '/products/rose-petal-reed-1.webp',
    lifestyle: ['/products/rose-petal-reed-1.webp', '/products/rose-petal-reed-2.webp'],
    description:
      'Transform your home into a floral sanctuary with this household aroma therapy diffuser, featuring the delicate and romantic scent of fresh rose petals.',
    category: 'home',
  },
  {
    id: 9,
    name: 'Lavender Reed Diffuser by Zareen Fragrance',
    shortName: 'Lavender',
    subtitle: 'Reed Diffuser · Household Aroma Therapy',
    price: 2650,
    images: ['/p9.jpeg'],
    mainImage: '/products/card-reed-lavender.webp',
    description:
      'A premium household aroma therapy solution that infuses your space with the timeless, tranquil scent of blooming lavender fields.',
    category: 'home',
  },
  {
    id: 10,
    name: 'Jasmine Bloom Reed Diffuser by Zareen Fragrance',
    shortName: 'Jasmine Bloom',
    subtitle: 'Reed Diffuser · Household Aroma Therapy',
    price: 2650,
    images: ['/p10.jpeg'],
    mainImage: '/products/card-reed-jasmine-bloom.webp',
    description:
      'An enchanting household aroma therapy diffuser that captures the essence of midnight jasmine, filling your home with a sweet and exotic floral bloom.',
    category: 'home',
  },
  {
    id: 11,
    name: 'Zareen Fragrance Discovery Tester Set',
    shortName: 'Discovery Tester Set',
    subtitle: 'Collection of five scents',
    price: 1388,
    images: ['/p11.jpeg', '/p11-2.jpeg', '/p11-3.jpeg'],
    mainImage: '/products/card-discovery-set.webp',
    description:
      'A premium collection of five signature scents. Explore the world of Zareen Fragrance with this curated tester box, featuring everything from floral blooms to fresh, earthy notes.',
    category: 'testers',
  },
  {
    id: 12,
    name: 'Maison Flora by Zareen Fragrance',
    shortName: 'Maison Flora',
    subtitle: 'Eau de Parfum · 50 ml',
    price: 3250,
    images: ['/p12.jpeg', '/p12-2.jpeg', '/p12-3.jpeg'],
    mainImage: '/products/maison-flora-1.webp',
    lifestyle: ['/products/maison-flora-1.webp', '/products/maison-flora-2.webp', '/products/maison-flora-3.webp'],
    description:
      'Maison Flora is a go-to Eau de Parfum that fills your day with an enchanting fragrance.\n\n50 ml of a luxurious floral-woody blend.',
    category: 'women',
  },
  {
    id: 13,
    name: 'Fateh by Zareen Fragrance 50 ml Eau de Parfum',
    shortName: 'Fateh',
    nameAr: 'فاتح',
    subtitle: 'Eau de Parfum · 50 ml',
    price: 2860,
    images: [],
    mainImage: '/products/fateh-1.webp',
    lifestyle: ['/products/fateh-1.webp', '/products/fateh-2.webp', '/products/fateh-3.webp'],
    notes: ['Grapefruit', 'Marine accord', 'Mandarin orange'],
    description:
      'Fateh is for those who want to win in every field. A sporty, fresh, and powerful fragrance that makes you feel energetic and confident.\n\nIt starts with a burst of citrus and marine freshness, then settles into a clean, masculine scent that lasts all day. Perfect for gym, office, daily wear, and night outs.',
    category: 'men',
  },
  {
    id: 14,
    name: 'Gazal by Zareen Fragrance 50 ml Eau de Parfum',
    shortName: 'Gazal',
    nameAr: 'غزل',
    subtitle: 'Eau de Parfum · 50 ml',
    price: 2850,
    images: [],
    mainImage: '/products/gazal-1.webp',
    lifestyle: ['/products/gazal-1.webp', '/products/gazal-2.webp', '/products/gazal-3.webp', '/products/gazal-4.webp'],
    description:
      'Gazal is a refined Eau de Parfum from Zareen Fragrance, in a clear 50 ml bottle finished with a pink cap and a satin ribbon.',
    category: 'women',
  },
];

// Styled photos live in /public/products and are shown in the product-page gallery.
// `card-*.webp` are the same-size, centred first images made from the white studio shots.
export const isCardImage = (src) => String(src).includes('/products/card-');
export const isLifestylePhoto = (src) => String(src).startsWith('/products/');

// How a product picture should sit in its frame: the styled photos fill it, the old white studio shots sit inside it.
export const photoFit = (src, pad = 'p-1') => (isLifestylePhoto(src) ? 'object-cover' : `object-contain ${pad}`);

export const isPerfume = (product) => product.category === 'men' || product.category === 'women';

export const getProduct = (id) => products.find((p) => p.id === Number(id));

// Background colour of a product's photo (white unless the photo says otherwise).
export const imageBgFor = (id) => getProduct(id)?.imageBg || '#ffffff';
