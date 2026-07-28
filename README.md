# 🌱 AgriLink — Smart Agriculture Marketplace

A full-stack e-commerce platform connecting local farmers directly to
customers — organic vegetables, fruits, grains, spices and fish, farm
to home.

## Project structure

```
agrilink/
├── backend/            Node.js + Express + MongoDB API
│   ├── controllers/     auth, products, cart, orders, users(profile)
│   ├── middleware/      JWT auth, role guard, file upload, zod validation
│   ├── models/          User, Product, Cart, Order
│   ├── routes/          /api/auth, /api/products, /api/users, /api/cart, /api/orders
│   ├── schemas/         zod request-body validation
│   ├── uploads/         product images uploaded via the farmer panel (created at runtime)
│   ├── .env             ⚠️ contains real credentials — see security note below
│   ├── .env.example      safe template for a fresh setup
│   └── index.js
└── frontend/            Plain HTML/CSS/JS (no build step needed)
    ├── index.html        homepage — product grid, search, category filters, farmer "add product" panel
    ├── css/
    ├── js/                storage.js, product.js, app.js, profile.js
    ├── images/            hero/background art + a few sample product photos
    └── pages/
        ├── login.html / register.html
        ├── dashboard.html   farmer dashboard (products, orders, analytics)
        ├── orders.html      customer order history
        ├── cart.html        cart + checkout
        ├── profile.html     account details, avatar
        └── product-details.html
```

## Running it locally

### 1. Backend

```bash
cd backend
npm install
npm run dev        # nodemon index.js  →  http://localhost:5000
```

The `.env` already contains a working MongoDB Atlas connection string so
it should connect immediately. See the security note below before you
put this anywhere public.

### 2. Frontend

The frontend is static — no build step. Serve the `frontend/` folder
with any static server, for example VS Code's **Live Server**
extension (defaults to `http://127.0.0.1:5500`, which is already
whitelisted by the backend's CORS config), or:

```bash
cd frontend
npx http-server -p 5500
```

Then open `http://127.0.0.1:5500/index.html`.

> The frontend talks to the API at `http://localhost:5000/api` — make
> sure the backend is running first.

## Accounts & roles

Registering lets you choose **Customer** or **Farmer**:

- **Farmers** get an "Add Product" panel on the homepage and a full
  dashboard (`pages/dashboard.html`) with products, orders and basic
  analytics. **Farmers cannot buy products** — "Add to Cart" / "Buy
  Now" are disabled everywhere in the UI, the Cart nav link is
  hidden, and the backend also rejects it server-side: `/api/cart`
  and `/api/orders` require the `customer` role, so this isn't just
  a UI restriction. There's also a defense-in-depth check blocking
  anyone from adding their own listed product to a cart.
- **Customers** can browse, search, add to cart, checkout, and see
  their order history (`pages/orders.html`).

## Going to production

The frontend no longer hardcodes `http://localhost:5000` anywhere —
every page loads `frontend/js/config.js` first, which exposes
`window.API_BASE`. To deploy:

1. Deploy `backend/` (Render, Railway, Fly.io, a VPS, etc.), copy the
   values from `.env.example` into that host's environment variables,
   and set `NODE_ENV=production`.
2. Open `frontend/js/config.js` and set `PROD_API_URL` to your
   deployed backend's URL.
3. Set `CLIENT_URL` in the backend's environment to your deployed
   frontend's URL — CORS is actually enforced (not permissive) once
   `NODE_ENV=production`.
4. Deploy `frontend/` as a static site (Netlify, Vercel, GitHub
   Pages, S3, etc.) — it's plain HTML/CSS/JS, no build step needed.

## What was fixed / added on top of the original files

- **Missing backend pieces built from scratch**: `Cart` and `Order`
  models, cart/order/profile controllers, and every route file
  (`routes/` was empty — `index.js` was importing files that didn't
  exist yet).
- **Cart** now lives in MongoDB instead of `localStorage`, so it's
  shared across devices and survives logging in from a different
  browser — and it actually matches what `product.js` and
  `product-details.html` were already calling (`POST /api/cart`).
- **Checkout** creates a real `Order` document, decrements product
  stock, and clears the cart.
- **Farmer dashboard "Orders" tab** and the new **customer
  "My Orders" page** both read from the same `Order` collection.
- Fixed a real bug in `authSchema.js`: Zod strips any field not
  declared in the schema, so `farmName` / `location` / `address` were
  being silently deleted before `registerUser` ever saw them — every
  farmer signup was losing its farm details.
- Fixed a duplicate `const currentUser` declaration in `cart.html`'s
  inline script — since `app.js` already declares it in the same
  global scope, this threw a `SyntaxError` that silently killed the
  whole cart page script (classic "nothing works, no visible error"
  bug).
- Fixed `dashboard.html`'s auth guard sending customers to the login
  page in a loop — they're logged in, just not farmers — customers
  are now sent to `orders.html` instead.
- Added a "Fish" category across the homepage filters and the
  dashboard's add/edit/filter product forms.
- Cleaned `package.json` — removed a stray, unrelated dependency
  (`coo`), a redundant native `bcrypt` alongside `bcryptjs`, and an
  unused `express-validator` (the project validates with Zod).
- Compressed the product images (one was a 970KB `.webp` that's now
  ~210KB) and added a generated placeholder image for products
  without a photo / broken image links.
- Removed a dead "Settings" nav link pointing at a page that was
  never built, and two unused/buggy JS files (`api.js`, `auth.js`)
  that weren't linked from any page.

## ⚠️ Security note

The uploaded `_env` file contained a **live** MongoDB Atlas username
and password and a JWT signing secret. Those are carried into
`backend/.env` here so the project runs immediately, but since they've
now passed through this chat, please:

1. Rotate the MongoDB Atlas password for the `shahrier` user (Atlas →
   Database Access).
2. Generate a new `JWT_SECRET` (any long random string) before
   deploying this anywhere real.
3. Never commit `.env` to a public repo — `.gitignore` is already set
   up to exclude it.

## API overview

| Method | Endpoint                     | Auth          | Description |
|--------|-------------------------------|---------------|--------------|
| POST   | `/api/auth/register`         | —             | Create account (customer/farmer) |
| POST   | `/api/auth/login`             | —             | Login, returns JWT |
| GET    | `/api/products`               | —             | List all products |
| GET    | `/api/products/:id`            | —             | Single product |
| GET    | `/api/products/my-products`    | farmer        | Farmer's own listings |
| POST   | `/api/products`                | farmer        | Create product (multipart, `image` field) |
| PUT    | `/api/products/:id`             | farmer (owner)| Update product |
| DELETE | `/api/products/:id`             | farmer (owner)| Delete product |
| GET    | `/api/users/me`                 | any           | Current profile + stats |
| PUT    | `/api/users/me`                 | any           | Update profile / avatar |
| GET    | `/api/cart`                      | any           | Get current cart |
| POST   | `/api/cart`                      | any           | Add item `{productId, quantity}` |
| PUT    | `/api/cart/:productId`            | any           | Update quantity |
| DELETE | `/api/cart/:productId`            | any           | Remove item |
| DELETE | `/api/cart`                       | any           | Clear cart |
| POST   | `/api/orders`                     | any           | Checkout current cart |
| GET    | `/api/orders/my-orders`           | any           | Customer's order history |
| GET    | `/api/orders/farmer`               | farmer        | Orders containing farmer's products |
| PUT    | `/api/orders/:id/status`            | farmer        | Update order status |
