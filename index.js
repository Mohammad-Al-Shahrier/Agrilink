import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

// Routes
import authRoutes from "./routes/authRoutes.js";

// Load Environment Variables
dotenv.config();

// Initialize Express App
const app = express();

// ======================================
// Middleware
// ======================================

app.use(
cors({
origin:
process.env.CLIENT_URL ||
"http://127.0.0.1:5500",
credentials: true
})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Uploads Folder
app.use(
"/uploads",
express.static(
path.join(process.cwd(), "uploads")
)
);

// ======================================
// Routes
// ======================================

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
database: "connected"
});
});

// Authentication Routes
app.use(
"/api/auth",
authRoutes
);

// ======================================
// 404 Handler
// ======================================

app.use((req, res) => {
res.status(404).json({
success: false,
message: "Route Not Found"
});
});

// ======================================
// Global Error Handler
// ======================================

app.use((err, req, res, next) => {

console.error(err);

res.status(500).json({
success: false,
message: "Internal Server Error"
});

});

// ======================================
// MongoDB Connection
// ======================================

const PORT =
process.env.PORT || 5000;

const startServer = async () => {

try {

await mongoose.connect(
  process.env.MONGO_URI
);

console.log(
  "✅ MongoDB Connected"
);

app.listen(PORT, () => {

  console.log(
    `🚀 Server Running On http://localhost:${PORT}`
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