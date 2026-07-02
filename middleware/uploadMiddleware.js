/* ================================================================
   middleware/uploadMiddleware.js  —  AgriLink
   
   Fixes:
   ① Uses diskStorage (not memoryStorage) so file is saved to disk
   ② Saves filename as "uploads/filename.jpg" path
   ③ ES Module syntax (import/export)
================================================================ */

import multer from "multer";
import path   from "path";
import fs     from "fs";
import { fileURLToPath } from "url";

/* __dirname equivalent for ES Modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ── Ensure uploads folder exists ── */
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ── Disk Storage ── */
const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    /* e.g. 1718000000000_potato.jpg */
    const ext      = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(/\.[^/.]+$/, "")   /* remove extension */
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase()
      .slice(0, 30);              /* max 30 chars */
    cb(null, `${Date.now()}_${safeName}${ext}`);
  }
});

/* ── File type filter ── */
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, or WebP images are allowed"), false);
  }
};

/* ── Export configured multer instance ── */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }  /* 5 MB */
});

export default upload;