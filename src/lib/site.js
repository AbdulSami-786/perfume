// Central business constants + helpers shared across the storefront.

export const SITE = {
  name: 'Zareen Fragrance',
  city: 'Karachi, Pakistan',
  phoneDisplay: '+92 371 1191925',
  whatsappNumber: '923711191925',
  email: 'zareenfragrances@gmail.com',
  instagram: 'https://instagram.com/zareenfragrance',
  instagramHandle: '@zareenfragrance',
};

// Bank account shown at checkout for bank-transfer payments.
export const BANK = {
  bankName: 'Meezan Bank', // inferred from the "MEZN" code in the IBAN
  accountTitle: 'Muhammad Saim Shaikh',
  accountNumber: '01220113219080',
  iban: 'PK25MEZN0001220113219080',
  branch: 'Dhoraji Branch, Karachi',
};

export const DISCOUNT_RATE = 0.1; // storewide 10% sale
export const FREE_SHIPPING_THRESHOLD = 5000;
export const SHIPPING_FEE = 200;
export const PROMO_CODE = 'ZAREEN10';
export const PROMO_RATE = 0.1;

export const applyDiscount = (price) => Math.round(price - price * DISCOUNT_RATE);

export const formatPrice = (price) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

// Always resolve images from the site root so nested routes never break them.
export const assetUrl = (path) => {
  if (!path) return '/image.png';
  if (/^(https?:)?\/\//.test(path)) return path;
  return '/' + path.replace(/^(\.{0,2}\/)+/, '');
};

export const whatsappLink = (message = '') =>
  `https://wa.me/${SITE.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
