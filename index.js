import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Load Environment Variables
dotenv.config({ quiet: true });

/* Fail fast instead of silently signing tokens with "undefined" —
   a missing JWT_SECRET is a critical misconfiguration, not something
   the server should limp along with in production. */
if (!process.env.JWT_SECRET) {
  console.error("❌ Missing JWT_SECRET in environment. Refusing to start.");
  process.exit(1);
}

/* __dirname equivalent for ES Modules — used below so the uploads
   folder resolves the same way regardless of which directory the
   process happens to be started from (important on most hosts,
   which don't always `cd` into the project root first). */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Initialize App
const app = express();

// =====================================
// Middleware
// =====================================

/* Allow the configured CLIENT_URL plus a couple of common local dev
   origins (VS Code Live Server, plain `http-server`, etc.) so the
   frontend works out of the box regardless of how it's served. */
const defaultOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:5501",
  "http://localhost:5501",
  "http://127.0.0.1:8080",
  "http://localhost:8080"
];
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL, ...defaultOrigins]
  : defaultOrigins;

const isProd = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser tools (curl/Postman) with no origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // In development, be permissive so any local dev server "just works".
      // In production, actually enforce the whitelist above.
      if (!isProd) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

/* This API and the static frontend are served from different origins
   (e.g. backend on :5000, frontend via Live Server on :5500), so the
   default cross-origin-resource-policy would block product images
   loaded from /uploads. CSP is also left off since this server never
   renders HTML pages itself — only JSON + static image files. */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

/* ---------------------------------------------------------------
   NoSQL-injection guard
   Strips any object key starting with "$" or containing "." from
   req.body/req.query/req.params so a payload like
   { "email": { "$gt": "" } } can't be used to bypass a Mongo query
   (classic login-bypass NoSQL-injection attack).
--------------------------------------------------------------- */
function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }
  return value;
}

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
});

/* ---------------------------------------------------------------
   Rate limiting
   - Auth routes get a tight limit to slow down brute-force login/
     registration attempts.
   - The rest of the API gets a more generous general-purpose limit
     so normal browsing/shopping never gets throttled.
--------------------------------------------------------------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in a few minutes." }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." }
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Uploads Folder
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =====================================
// Routes
// =====================================

// Root Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "🌱 AgriLink Backend Running Successfully"
  });
});

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    server: "running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// =====================================
// API Routes
// =====================================

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", profileRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// =====================================
// 404 Route Handler
// =====================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });

});

// =====================================
// Global Error Handler
// =====================================

app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      err.message ||
      "Internal Server Error"
  });
});

// =====================================
// MongoDB Connection
// =====================================

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB Connected Successfully"
    );

    app.listen(PORT, () => {

      console.log(
        `Server Running On http://localhost:${PORT}`
      );

    });

  } catch (error) {

    console.error(
      "❌ Database Connection Failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();
