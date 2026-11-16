# Store backend — Google Sheets + Apps Script

This is what powers **orders, bank-transfer proofs, accounts, order history, wishlist sync, reviews,
newsletter and the contact form**. Everything is stored in *your* Google Sheet and Google Drive. No
server and no monthly cost.

## One-time setup (about 5 minutes)

1. Create a new Google Sheet (name it e.g. **Zareen Store**).
2. In the Sheet: **Extensions → Apps Script**.
3. Delete the sample code and paste the whole of `google-apps-script/Code.gs`.
4. (Optional) At the top, set `OWNER_EMAIL` to get an email for every new order and message.
5. Select the function **`setup`** in the toolbar and press **Run**. Approve the permissions
   (Sheets, Drive, Gmail-send). This creates the tabs and the Drive folder *Zareen Payment Proofs*.
6. **Deploy → New deployment → type: Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Press **Deploy** and copy the **Web app URL** (ends with `/exec`).
7. Paste that URL into `src/lib/api.js` (the `API_URL` constant at the top), then redeploy the website.

> If you change `Code.gs` later: **Deploy → Manage deployments → Edit → New version → Deploy**
> (the URL stays the same).

## Admin panel

The website has a private admin screen at **`/admin`** (for example `https://your-site.com/admin`).
It is not linked anywhere on the public site.

**Who can log in** (either way works):

1. **An admin account** (recommended). In the **Customers** tab every person has a **Type**: *User* or *Admin*.
   An Admin logs in at `/admin` with their own email and password.
2. **The master password**, set in `Code.gs` as `ADMIN_PASSWORD` (at least 8 characters). Use it for the very
   first login, because nobody is an Admin yet. After you make your own account an Admin you can clear it
   if you want (leave it empty and the master password is switched off).

**First-time setup**

1. In `Code.gs`, set `ADMIN_PASSWORD`, then **Deploy → Manage deployments → Edit → New version → Deploy**.
2. Create your own customer account on the website (Sign up).
3. Open `/admin`, choose *Use the master admin password instead*, and log in.
4. **Customers** tab → set your own account's **Type** to **Admin**.
5. From now on you can log in with your own email and password. Add staff the same way.

Rules: only an existing admin can change a Type, signing up can never create an admin, and you can't change
your own Type (so you can't lock yourself out by accident). If someone is set back to *User*, their admin access
ends immediately. You can also edit the **Role** column in the *Users* tab of the Sheet (`user` or `admin`).
Sheets created before this feature get the Role column added automatically.

What you can do in the panel: see all orders and update **order status** and **payment status**, view each
bank-transfer **payment screenshot** without leaving the panel, filter and search orders, export orders
to CSV, hide or show customer reviews, see subscribers and contact messages, and manage customers' Type.

Passwords are never put in the website code, and every admin request is checked again on the server.

## Running the shop day to day

You can do everything below in the admin panel, or directly in the Sheet.

| Tab | What you do |
| --- | --- |
| **Orders** | Every order appears here. Change **Status** (Pending → Confirmed → Shipped → Delivered / Cancelled) and **PaymentStatus** with the dropdowns. Customers see both in *My Account → Orders*. |
| | For bank transfers, open the **ProofURL** (a private Drive link, only you can open it), check the payment in your bank app, then set PaymentStatus to **Verified** (or **Rejected**). |
| **Reviews** | New reviews are published straight away. Set **Status** to `Hidden` to remove one. |
| **Subscribers** | Email list from the website footer. |
| **Messages** | Messages from the contact form. |
| **Users / Wishlists** | Customer accounts. Passwords are stored only as salted hashes. |

## Keep these in sync

Prices are re-calculated on the server so nobody can edit their total. If you change a price,
product, the 10% sale, delivery fee or the promo code, update **both**:

- `src/data/products.jsx` and `src/lib/site.js` (website)
- `CATALOG` / `CONFIG` at the top of `Code.gs`, then redeploy a new version

## Good to know

- Login sessions last 30 days. There is no "forgot password" email yet.
- Payment screenshots must be images under 4 MB (the website shrinks them automatically).
- Google limits Apps Script to roughly 20,000 emails / 6 hours of runtime per day, which is far
  above what a shop of this size needs.
