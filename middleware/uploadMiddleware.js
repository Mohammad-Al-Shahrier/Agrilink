<<<<<<< HEAD
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
=======
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/products";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true
  });
}

const storage = multer.diskStorage({

  destination: (
    req,
    file,
    cb
  ) => {

    cb(null, uploadPath);

  },

  filename: (
    req,
    file,
    cb
  ) => {

    cb(
      null,
      Date.now() +
      path.extname(
        file.originalname
      )
    );
  }
});

const upload = multer({
  storage
>>>>>>> 996f52fab8cbb13c1c980eb0f3f6865a3c35da21
});

export default upload;