/**
 * Zareen Fragrance — store backend (Google Apps Script + Google Sheets)
 *
 * Bound to a Google Sheet. Every request is a POST with a JSON body:
 *   { action: 'placeOrder', token: '...', ...payload }
 * and every response is JSON:  { ok: true, data } | { ok: false, error }
 *
 * Sheet tabs are created automatically on first use:
 *   Orders · Users · Reviews · Subscribers · Wishlists · Messages
 *
 * See backend/README.md for the 5-minute setup.
 */

var CONFIG = {
  OWNER_EMAIL: '',              // optional: get an email for every new order / message
  ADMIN_PASSWORD: '',           // master password for /admin (min. 8 chars). Use it once to make your own account an Admin, then you may clear it.
  ADMIN_SESSION_HOURS: 12,
  SESSION_DAYS: 30,
  PROOF_FOLDER: 'Zareen Payment Proofs',
  PASSWORD_ROUNDS: 300,
  MAX_PROOF_BYTES: 4 * 1024 * 1024,

  // Pricing rules — keep identical to src/lib/site.js
  SALE_DISCOUNT: 0.10,
  PROMO_CODE: 'ZAREEN10',
  PROMO_RATE: 0.10,
  FREE_SHIPPING_THRESHOLD: 5000,
  SHIPPING_FEE: 200
};

// Prices are re-calculated here so a customer can never tamper with their total.
// Keep identical to src/data/products.jsx (id → list price).
var CATALOG = {
  1:  { name: 'Musk Al Rawdah – Eau de Parfum 50 ml',        price: 2850 },
  2:  { name: 'Pink Aura – Eau de Parfum 50 ml',             price: 2900 },
  3:  { name: 'Fresh Aura – Eau de Parfum 50 ml',            price: 3100 },
  4:  { name: 'White Sultan – Eau de Parfum 50 ml',          price: 3250 },
  5:  { name: 'Jasmine Bloom – Car Diffuser',                price: 1200 },
  6:  { name: 'Rose Petal – Car Diffuser',                   price: 1200 },
  7:  { name: 'Lavender – Car Diffuser',                     price: 1200 },
  8:  { name: 'Rose Petal – Reed Diffuser',                  price: 2650 },
  9:  { name: 'Lavender – Reed Diffuser',                    price: 2650 },
  10: { name: 'Jasmine Bloom – Reed Diffuser',               price: 2650 },
  11: { name: 'Discovery Tester Set',                        price: 1388 },
  12: { name: 'Maison Flora – Eau de Parfum 50 ml',          price: 3250 },
  13: { name: 'Fateh – Eau de Parfum 50 ml',                 price: 2860 },
  14: { name: 'Gazal – Eau de Parfum 50 ml',                 price: 2850 }
};

var ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
var PAYMENT_STATUSES = ['Cash on delivery', 'Awaiting verification', 'Verified', 'Rejected'];

var SHEETS = {
  Orders: ['OrderID', 'Created', 'Status', 'PaymentMethod', 'PaymentStatus', 'ProofURL', 'Name', 'Phone', 'Email',
           'City', 'Address', 'Notes', 'Items', 'Subtotal', 'PromoDiscount', 'Shipping', 'Total', 'UserEmail', 'ItemsJSON', 'PostalCode'],
  Users: ['Email', 'Name', 'Phone', 'Address', 'City', 'Salt', 'Hash', 'Created', 'Role', 'PostalCode'],
  Reviews: ['ReviewID', 'Created', 'ProductID', 'UserEmail', 'Name', 'Rating', 'Title', 'Text', 'Verified', 'Status'],
  Subscribers: ['Email', 'Created', 'Source'],
  Wishlists: ['Email', 'ProductIDs', 'Updated'],
  Messages: ['Created', 'Name', 'Email', 'Message']
};

/* ------------------------------------------------------------------ */
/* Entry points                                                        */
/* ------------------------------------------------------------------ */

function UserError(message) {
  this.name = 'UserError';
  this.message = message;
}

var ACTIONS = {
  signup: signup_,
  login: login_,
  me: me_,
  updateProfile: updateProfile_,
  getWishlist: getWishlist_,
  saveWishlist: saveWishlist_,
  placeOrder: placeOrder_,
  myOrders: myOrders_,
  getReviews: getReviews_,
  addReview: addReview_,
  subscribe: subscribe_,
  contact: contact_,
  adminLogin: adminLogin_,
  adminOverview: adminOverview_,
  adminUpdateOrder: adminUpdateOrder_,
  adminSetReview: adminSetReview_,
  adminProof: adminProof_,
  adminSetUserRole: adminSetUserRole_
};

function doGet() {
  return json_({ ok: true, data: 'Zareen Fragrance API is running.' });
}

function doPost(e) {
  var out;
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var req = JSON.parse(e.postData.contents);
    var handler = ACTIONS[req.action];
    if (!handler) throw new UserError('Unknown request.');
    out = { ok: true, data: handler(req) };
  } catch (err) {
    if (err instanceof UserError) {
      out = { ok: false, error: err.message };
    } else {
      console.error(err && err.stack ? err.stack : err);
      out = { ok: false, error: 'Something went wrong. Please try again.' };
    }
  } finally {
    try { lock.releaseLock(); } catch (ignore) { /* not held */ }
  }
  return json_(out);
}

/** Run once from the editor to create all tabs and authorise Drive / Mail access. */
function setup() {
  Object.keys(SHEETS).forEach(function (name) { sheet_(name); });
  folder_();
  return 'Setup complete';
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
    if (name === 'Orders') {
      var head = SHEETS.Orders;
      sh.getRange(2, head.indexOf('Status') + 1, 1000, 1)
        .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(ORDER_STATUSES, true).build());
      sh.getRange(2, head.indexOf('PaymentStatus') + 1, 1000, 1)
        .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(PAYMENT_STATUSES, true).build());
    }
    if (name === 'Reviews') {
      sh.getRange(2, SHEETS.Reviews.indexOf('Status') + 1, 1000, 1)
        .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Approved', 'Hidden'], true).build());
    }
    if (name === 'Users') addRoleValidation_(sh);
  } else if (TAIL_COLUMNS[name]) {
    ensureTailColumns_(sh, name);
  }
  return sh;
}

// Columns added after launch. Older sheets get them added automatically.
var TAIL_COLUMNS = { Orders: ['PostalCode'], Users: ['Role', 'PostalCode'] };

function ensureTailColumns_(sh, name) {
  TAIL_COLUMNS[name].forEach(function (col) {
    var idx = SHEETS[name].indexOf(col) + 1;
    if (sh.getRange(1, idx).getValue() === col) return;
    sh.getRange(1, idx).setValue(col);
    if (name === 'Users' && col === 'Role') addRoleValidation_(sh);
  });
}

function addRoleValidation_(sh) {
  sh.getRange(2, SHEETS.Users.indexOf('Role') + 1, 1000, 1)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['user', 'admin'], true).build());
}

function rows_(name) {
  var values = sheet_(name).getDataRange().getValues();
  var head = values[0];
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var o = { _row: i + 1 };
    for (var j = 0; j < head.length; j++) o[head[j]] = values[i][j];
    out.push(o);
  }
  return out;
}

/**
 * Text coming from customers is stored with a leading apostrophe so Sheets never
 * treats it as a formula (=, +, -, @) or strips zeros from phone numbers.
 */
function t_(value) {
  return "'" + String(value === undefined || value === null ? '' : value);
}

function writeRow_(name, obj, textCols) {
  var head = SHEETS[name];
  var row = head.map(function (h) {
    var v = obj[h];
    if (v === undefined || v === null) return '';
    return typeof v === 'string' && (!textCols || textCols.indexOf(h) !== -1) ? t_(v) : v;
  });
  sheet_(name).appendRow(row);
}

function setCell_(name, rowNumber, column, value) {
  sheet_(name).getRange(rowNumber, SHEETS[name].indexOf(column) + 1).setValue(value);
}

function str_(v, max) {
  var s = String(v === undefined || v === null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim();
  return max ? s.substring(0, max) : s;
}

function cleanEmail_(v) {
  var e = str_(v, 120).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) throw new UserError('Please enter a valid email address.');
  return e;
}

function iso_(v) {
  return v instanceof Date ? v.toISOString() : String(v);
}

function hex_(bytes) {
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function hash_(salt, password) {
  var h = salt + ':' + password;
  for (var i = 0; i < CONFIG.PASSWORD_ROUNDS; i++) {
    h = hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + salt));
  }
  return h;
}

function secret_() {
  var props = PropertiesService.getScriptProperties();
  var s = props.getProperty('TOKEN_SECRET');
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('TOKEN_SECRET', s);
  }
  return s;
}

function sign_(payload) {
  var body = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  var sig = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body, secret_()));
  return body + '.' + sig;
}

function verifyToken_(token) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) return null;
  var parts = token.split('.');
  var expected = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(parts[0], secret_()));
  if (expected.length !== parts[1].length) return null;
  var diff = 0;
  for (var i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ parts[1].charCodeAt(i);
  if (diff !== 0) return null;
  try {
    var payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

function findUser_(email) {
  var users = rows_('Users');
  for (var i = 0; i < users.length; i++) {
    if (String(users[i].Email).toLowerCase() === email) return users[i];
  }
  return null;
}

function requireUser_(req) {
  var payload = verifyToken_(req.token);
  if (!payload) throw new UserError('Please log in to continue.');
  var user = findUser_(payload.email);
  if (!user) throw new UserError('Please log in to continue.');
  return user;
}

function optionalUser_(req) {
  var payload = verifyToken_(req.token);
  return payload ? findUser_(payload.email) : null;
}

function roleOf_(u) {
  return String(u.Role || '').toLowerCase() === 'admin' ? 'admin' : 'user';
}

function publicUser_(u) {
  return {
    email: String(u.Email), name: String(u.Name), phone: String(u.Phone), address: String(u.Address),
    city: String(u.City), postalCode: String(u.PostalCode || ''), role: roleOf_(u)
  };
}

function sessionFor_(u) {
  var exp = Date.now() + CONFIG.SESSION_DAYS * 24 * 3600 * 1000;
  return { token: sign_({ email: String(u.Email).toLowerCase(), exp: exp }), user: publicUser_(u) };
}

function notifyOwner_(subject, body) {
  if (!CONFIG.OWNER_EMAIL) return;
  try { MailApp.sendEmail(CONFIG.OWNER_EMAIL, subject, body); } catch (e) { console.error(e); }
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */

function signup_(req) {
  var email = cleanEmail_(req.email);
  var name = str_(req.name, 80);
  var phone = str_(req.phone, 30);
  var password = String(req.password || '');
  if (name.length < 2) throw new UserError('Please enter your name.');
  if (password.length < 8) throw new UserError('Your password must be at least 8 characters.');
  if (password.length > 100) throw new UserError('That password is too long.');
  if (findUser_(email)) throw new UserError('An account with this email already exists. Please log in.');

  var salt = Utilities.getUuid();
  writeRow_('Users', {
    Email: email, Name: name, Phone: phone, Address: '', City: '', PostalCode: '',
    Salt: salt, Hash: hash_(salt, password), Created: new Date(), Role: 'user'
  }, ['Email', 'Name', 'Phone', 'Address', 'City', 'PostalCode', 'Salt', 'Hash', 'Role']);
  return sessionFor_(findUser_(email));
}

function login_(req) {
  var email = str_(req.email, 120).toLowerCase();
  var user = findUser_(email);
  var ok = user && hash_(String(user.Salt), String(req.password || '')) === String(user.Hash);
  if (!ok) {
    Utilities.sleep(400);
    throw new UserError('Incorrect email or password.');
  }
  return sessionFor_(user);
}

function me_(req) {
  return { user: publicUser_(requireUser_(req)) };
}

function updateProfile_(req) {
  var user = requireUser_(req);
  var name = str_(req.name, 80);
  if (name.length < 2) throw new UserError('Please enter your name.');
  setCell_('Users', user._row, 'Name', t_(name));
  setCell_('Users', user._row, 'Phone', t_(str_(req.phone, 30)));
  setCell_('Users', user._row, 'Address', t_(str_(req.address, 300)));
  setCell_('Users', user._row, 'City', t_(str_(req.city, 60)));
  setCell_('Users', user._row, 'PostalCode', t_(cleanPostal_(req.postalCode, false)));
  return { user: publicUser_(findUser_(String(user.Email).toLowerCase())) };
}

function getWishlist_(req) {
  var user = requireUser_(req);
  var email = String(user.Email).toLowerCase();
  var rows = rows_('Wishlists');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].Email).toLowerCase() === email) {
      return { ids: String(rows[i].ProductIDs).split(',').map(Number).filter(function (n) { return CATALOG[n]; }) };
    }
  }
  return { ids: [] };
}

function saveWishlist_(req) {
  var user = requireUser_(req);
  var email = String(user.Email).toLowerCase();
  var ids = (Array.isArray(req.ids) ? req.ids : []).map(Number).filter(function (n, i, a) {
    return CATALOG[n] && a.indexOf(n) === i;
  });
  var rows = rows_('Wishlists');
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].Email).toLowerCase() === email) {
      setCell_('Wishlists', rows[i]._row, 'ProductIDs', t_(ids.join(',')));
      setCell_('Wishlists', rows[i]._row, 'Updated', new Date());
      return { ids: ids };
    }
  }
  writeRow_('Wishlists', { Email: email, ProductIDs: ids.join(','), Updated: new Date() }, ['Email', 'ProductIDs']);
  return { ids: ids };
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

/** Postal / ZIP code: letters, digits, space or hyphen, 3–10 characters. */
function cleanPostal_(v, required) {
  var p = str_(v, 12);
  if (!p && !required) return '';
  if (!/^[A-Za-z0-9][A-Za-z0-9 \-]{2,9}$/.test(p)) throw new UserError('Please enter a valid postal code.');
  return p;
}

function folder_() {
  var it = DriveApp.getFoldersByName(CONFIG.PROOF_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(CONFIG.PROOF_FOLDER);
}

function saveProof_(dataUrl, orderId) {
  var m = /^data:(image\/(png|jpeg|webp));base64,([A-Za-z0-9+\/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw new UserError('Please upload your payment screenshot as an image (JPG or PNG).');
  var bytes = Utilities.base64Decode(m[3]);
  if (bytes.length > CONFIG.MAX_PROOF_BYTES) throw new UserError('That screenshot is too large. Please upload one under 4 MB.');
  var ext = m[2] === 'jpeg' ? 'jpg' : m[2];
  var blob = Utilities.newBlob(bytes, m[1], orderId + '-payment-proof.' + ext);
  return folder_().createFile(blob).getUrl();
}

function priceOrder_(items, promoCode) {
  if (!Array.isArray(items) || items.length === 0) throw new UserError('Your bag is empty.');
  if (items.length > 30) throw new UserError('Too many items in one order.');
  var lines = [];
  var subtotal = 0;
  items.forEach(function (it) {
    var id = Number(it.id);
    var qty = Math.floor(Number(it.quantity));
    var p = CATALOG[id];
    if (!p) throw new UserError('One of the products in your bag is no longer available.');
    if (!(qty >= 1 && qty <= 20)) throw new UserError('Invalid quantity.');
    var unit = Math.round(p.price - p.price * CONFIG.SALE_DISCOUNT);
    lines.push({ id: id, name: p.name, price: unit, quantity: qty });
    subtotal += unit * qty;
  });
  var promo = String(promoCode || '').trim().toUpperCase() === CONFIG.PROMO_CODE ? Math.round(subtotal * CONFIG.PROMO_RATE) : 0;
  var after = subtotal - promo;
  var shipping = after >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.SHIPPING_FEE;
  return { lines: lines, subtotal: subtotal, promoDiscount: promo, shipping: shipping, total: after + shipping };
}

function nextOrderId_() {
  var tz = Session.getScriptTimeZone();
  var day = Utilities.formatDate(new Date(), tz, 'yyMMdd');
  var prefix = 'ZF-' + day + '-';
  var count = rows_('Orders').filter(function (o) { return String(o.OrderID).indexOf(prefix) === 0; }).length;
  return prefix + ('00' + (count + 1)).slice(-3);
}

function placeOrder_(req) {
  if (req.hp) return { orderId: 'ZF-000000-000' }; // honeypot: silently drop bots
  var c = req.customer || {};
  var customer = {
    name: str_(c.name, 80), phone: str_(c.phone, 30), email: cleanEmail_(c.email),
    city: str_(c.city, 60), address: str_(c.address, 300), notes: str_(c.notes, 300)
  };
  customer.postalCode = cleanPostal_(c.postalCode, true);
  if (customer.name.length < 2) throw new UserError('Please enter your full name.');
  if (customer.phone.replace(/\D/g, '').length < 10) throw new UserError('Please enter a valid phone number.');
  if (customer.address.length < 8) throw new UserError('Please enter your full delivery address.');
  if (customer.city.length < 2) throw new UserError('Please enter your city.');

  var method = req.paymentMethod === 'bank' ? 'bank' : 'cod';
  var priced = priceOrder_(req.items, req.promoCode);
  var user = optionalUser_(req);
  var orderId = nextOrderId_();
  var proofUrl = '';
  if (method === 'bank') proofUrl = saveProof_(req.proof, orderId);

  var itemsText = priced.lines.map(function (l) { return l.name + ' x ' + l.quantity; }).join('; ');
  var paymentStatus = method === 'bank' ? 'Awaiting verification' : 'Cash on delivery';
  var now = new Date();

  writeRow_('Orders', {
    OrderID: orderId, Created: now, Status: 'Pending',
    PaymentMethod: method === 'bank' ? 'Bank transfer' : 'Cash on delivery',
    PaymentStatus: paymentStatus, ProofURL: proofUrl,
    Name: customer.name, Phone: customer.phone, Email: customer.email,
    City: customer.city, PostalCode: customer.postalCode, Address: customer.address, Notes: customer.notes,
    Items: itemsText, Subtotal: priced.subtotal, PromoDiscount: priced.promoDiscount,
    Shipping: priced.shipping, Total: priced.total,
    UserEmail: user ? String(user.Email).toLowerCase() : '',
    ItemsJSON: JSON.stringify(priced.lines)
  }, ['OrderID', 'Status', 'PaymentMethod', 'PaymentStatus', 'ProofURL', 'Name', 'Phone', 'Email', 'City', 'Address',
      'Notes', 'Items', 'UserEmail', 'ItemsJSON', 'PostalCode']);

  notifyOwner_('New order ' + orderId + ' — Rs ' + priced.total,
    customer.name + ' (' + customer.phone + ')\n' + customer.address + ', ' + customer.city + ' ' + customer.postalCode + '\n\n' + itemsText +
    '\n\nPayment: ' + (method === 'bank' ? 'Bank transfer — screenshot: ' + proofUrl : 'Cash on delivery') +
    '\nTotal: Rs ' + priced.total);

  return {
    orderId: orderId, createdAt: now.toISOString(), status: 'Pending', paymentStatus: paymentStatus,
    total: priced.total, subtotal: priced.subtotal, promoDiscount: priced.promoDiscount, shipping: priced.shipping
  };
}

function myOrders_(req) {
  var user = requireUser_(req);
  var email = String(user.Email).toLowerCase();
  var orders = rows_('Orders')
    .filter(function (o) { return String(o.UserEmail).toLowerCase() === email; })
    .map(function (o) {
      var items = [];
      try { items = JSON.parse(o.ItemsJSON); } catch (e) { /* ignore */ }
      return {
        orderId: String(o.OrderID), createdAt: iso_(o.Created), status: String(o.Status),
        paymentMethod: String(o.PaymentMethod), paymentStatus: String(o.PaymentStatus),
        city: String(o.City), postalCode: String(o.PostalCode || ''), address: String(o.Address), items: items,
        subtotal: Number(o.Subtotal), promoDiscount: Number(o.PromoDiscount),
        shipping: Number(o.Shipping), total: Number(o.Total)
      };
    });
  orders.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
  return { orders: orders };
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

function getReviews_(req) {
  var pid = Number(req.productId);
  var list = rows_('Reviews')
    .filter(function (r) { return Number(r.ProductID) === pid && String(r.Status) === 'Approved'; })
    .map(function (r) {
      return {
        id: String(r.ReviewID), createdAt: iso_(r.Created), name: String(r.Name), rating: Number(r.Rating),
        title: String(r.Title), text: String(r.Text), verified: String(r.Verified) === 'Yes'
      };
    });
  list.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
  var sum = list.reduce(function (s, r) { return s + r.rating; }, 0);
  return { reviews: list, count: list.length, average: list.length ? Math.round((sum / list.length) * 10) / 10 : 0 };
}

function hasPurchased_(email, pid) {
  return rows_('Orders').some(function (o) {
    if (String(o.UserEmail).toLowerCase() !== email || String(o.Status) === 'Cancelled') return false;
    try {
      return JSON.parse(o.ItemsJSON).some(function (l) { return Number(l.id) === pid; });
    } catch (e) { return false; }
  });
}

function addReview_(req) {
  var user = requireUser_(req);
  var pid = Number(req.productId);
  var rating = Math.floor(Number(req.rating));
  if (!CATALOG[pid]) throw new UserError('Unknown product.');
  if (!(rating >= 1 && rating <= 5)) throw new UserError('Please choose a star rating.');
  var text = str_(req.text, 1000);
  if (text.length < 5) throw new UserError('Please write a few words about the product.');
  var email = String(user.Email).toLowerCase();
  var verified = hasPurchased_(email, pid) ? 'Yes' : 'No';
  var existing = rows_('Reviews').filter(function (r) {
    return Number(r.ProductID) === pid && String(r.UserEmail).toLowerCase() === email;
  })[0];

  if (existing) {
    setCell_('Reviews', existing._row, 'Rating', rating);
    setCell_('Reviews', existing._row, 'Title', t_(str_(req.title, 100)));
    setCell_('Reviews', existing._row, 'Text', t_(text));
    setCell_('Reviews', existing._row, 'Verified', verified);
    setCell_('Reviews', existing._row, 'Created', new Date());
  } else {
    writeRow_('Reviews', {
      ReviewID: Utilities.getUuid().substring(0, 8), Created: new Date(), ProductID: pid, UserEmail: email,
      Name: String(user.Name), Rating: rating, Title: str_(req.title, 100), Text: text, Verified: verified, Status: 'Approved'
    }, ['ReviewID', 'UserEmail', 'Name', 'Title', 'Text', 'Verified', 'Status']);
  }
  return getReviews_({ productId: pid });
}

/* ------------------------------------------------------------------ */
/* Newsletter + contact form                                           */
/* ------------------------------------------------------------------ */

function subscribe_(req) {
  if (req.hp) return { subscribed: true };
  var email = cleanEmail_(req.email);
  var exists = rows_('Subscribers').some(function (s) { return String(s.Email).toLowerCase() === email; });
  if (!exists) writeRow_('Subscribers', { Email: email, Created: new Date(), Source: str_(req.source, 40) || 'website' }, ['Email', 'Source']);
  return { subscribed: true, already: exists };
}

function contact_(req) {
  if (req.hp) return { sent: true };
  var name = str_(req.name, 80);
  var message = str_(req.message, 2000);
  var email = cleanEmail_(req.email);
  if (name.length < 2) throw new UserError('Please enter your name.');
  if (message.length < 5) throw new UserError('Please write your message.');
  writeRow_('Messages', { Created: new Date(), Name: name, Email: email, Message: message }, ['Name', 'Email', 'Message']);
  notifyOwner_('New message from ' + name, message + '\n\n' + email);
  return { sent: true };
}

/* ------------------------------------------------------------------ */
/* Admin panel (/admin on the website)                                 */
/* ------------------------------------------------------------------ */

function safeEqual_(a, b) {
  a = String(a);
  b = String(b);
  var diff = a.length ^ b.length;
  for (var i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// Tied to the current password, so changing ADMIN_PASSWORD signs every admin out.
function adminFingerprint_() {
  return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, 'zf-admin:' + CONFIG.ADMIN_PASSWORD)).substring(0, 16);
}

function adminLogin_(req) {
  var pw = String(CONFIG.ADMIN_PASSWORD || '');
  if (pw.length < 8) throw new UserError('The admin panel is switched off. Set ADMIN_PASSWORD (at least 8 characters) at the top of Code.gs and redeploy.');
  if (!safeEqual_(req.password || '', pw)) {
    Utilities.sleep(1200);
    throw new UserError('Incorrect admin password.');
  }
  return { adminToken: sign_({ role: 'admin', k: adminFingerprint_(), exp: Date.now() + CONFIG.ADMIN_SESSION_HOURS * 3600 * 1000 }) };
}

/**
 * Allows the request if EITHER the master admin token is valid OR the logged-in
 * customer account has type "admin" (checked fresh from the sheet on every call).
 * Returns who is acting, so an admin can't remove their own access by accident.
 */
function requireAdmin_(req) {
  var pw = String(CONFIG.ADMIN_PASSWORD || '');
  var payload = verifyToken_(req.adminToken);
  if (pw.length >= 8 && payload && payload.role === 'admin' && payload.k === adminFingerprint_()) {
    return { email: '' };
  }
  var user = optionalUser_(req);
  if (user && roleOf_(user) === 'admin') return { email: String(user.Email).toLowerCase() };
  throw new UserError('Admin session expired. Please log in again.');
}

function byNewest_(a, b) {
  return a.createdAt < b.createdAt ? 1 : -1;
}

function adminOverview_(req) {
  requireAdmin_(req);

  var orders = rows_('Orders').map(function (o) {
    var items = [];
    try { items = JSON.parse(o.ItemsJSON); } catch (e) { /* ignore */ }
    return {
      orderId: String(o.OrderID), createdAt: iso_(o.Created), status: String(o.Status),
      paymentMethod: String(o.PaymentMethod), paymentStatus: String(o.PaymentStatus), proofUrl: String(o.ProofURL),
      name: String(o.Name), phone: String(o.Phone), email: String(o.Email), city: String(o.City), postalCode: String(o.PostalCode || ''),
      address: String(o.Address), notes: String(o.Notes), items: items,
      subtotal: Number(o.Subtotal), promoDiscount: Number(o.PromoDiscount), shipping: Number(o.Shipping),
      total: Number(o.Total), userEmail: String(o.UserEmail)
    };
  }).sort(byNewest_);

  var reviews = rows_('Reviews').map(function (r) {
    var pid = Number(r.ProductID);
    return {
      id: String(r.ReviewID), createdAt: iso_(r.Created), productId: pid, productName: CATALOG[pid] ? CATALOG[pid].name : '',
      userEmail: String(r.UserEmail), name: String(r.Name), rating: Number(r.Rating), title: String(r.Title),
      text: String(r.Text), verified: String(r.Verified) === 'Yes', status: String(r.Status)
    };
  }).sort(byNewest_);

  var subscribers = rows_('Subscribers').map(function (x) {
    return { email: String(x.Email), createdAt: iso_(x.Created), source: String(x.Source) };
  }).sort(byNewest_);

  var messages = rows_('Messages').map(function (m) {
    return { createdAt: iso_(m.Created), name: String(m.Name), email: String(m.Email), message: String(m.Message) };
  }).sort(byNewest_);

  var customers = rows_('Users').map(function (u) {
    return { email: String(u.Email), name: String(u.Name), phone: String(u.Phone), city: String(u.City), postalCode: String(u.PostalCode || ''), role: roleOf_(u), createdAt: iso_(u.Created) };
  }).sort(byNewest_);

  return { orders: orders, reviews: reviews, subscribers: subscribers, messages: messages, customers: customers };
}

function adminUpdateOrder_(req) {
  requireAdmin_(req);
  var id = String(req.orderId || '');
  var order = rows_('Orders').filter(function (o) { return String(o.OrderID) === id; })[0];
  if (!order) throw new UserError('Order not found.');
  if (req.status !== undefined) {
    if (ORDER_STATUSES.indexOf(req.status) === -1) throw new UserError('Invalid order status.');
    setCell_('Orders', order._row, 'Status', req.status);
  }
  if (req.paymentStatus !== undefined) {
    if (PAYMENT_STATUSES.indexOf(req.paymentStatus) === -1) throw new UserError('Invalid payment status.');
    setCell_('Orders', order._row, 'PaymentStatus', req.paymentStatus);
  }
  var fresh = rows_('Orders').filter(function (o) { return String(o.OrderID) === id; })[0];
  return { orderId: id, status: String(fresh.Status), paymentStatus: String(fresh.PaymentStatus) };
}

function adminSetReview_(req) {
  requireAdmin_(req);
  var status = req.status === 'Hidden' ? 'Hidden' : 'Approved';
  var review = rows_('Reviews').filter(function (r) { return String(r.ReviewID) === String(req.reviewId); })[0];
  if (!review) throw new UserError('Review not found.');
  setCell_('Reviews', review._row, 'Status', status);
  return { id: String(req.reviewId), status: status };
}

/** Returns the payment screenshot so the panel can show it without opening Drive. */
function adminProof_(req) {
  requireAdmin_(req);
  var order = rows_('Orders').filter(function (o) { return String(o.OrderID) === String(req.orderId); })[0];
  if (!order || !order.ProofURL) throw new UserError('This order has no payment screenshot.');
  var m = /\/d\/([A-Za-z0-9_-]+)/.exec(String(order.ProofURL));
  if (!m) throw new UserError('Screenshot link is not valid.');
  var blob = DriveApp.getFileById(m[1]).getBlob();
  return { dataUrl: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()), url: String(order.ProofURL) };
}

/** Admin → Customers tab: change a customer's type between "user" and "admin". */
function adminSetUserRole_(req) {
  var actor = requireAdmin_(req);
  var email = String(req.email || '').toLowerCase();
  var role = req.role === 'admin' ? 'admin' : req.role === 'user' ? 'user' : '';
  if (!role) throw new UserError('Invalid type.');
  if (actor.email && actor.email === email) throw new UserError('You can’t change your own type. Ask another admin.');
  var user = findUser_(email);
  if (!user) throw new UserError('Customer not found.');
  setCell_('Users', user._row, 'Role', t_(role));
  return { email: email, role: role };
}
