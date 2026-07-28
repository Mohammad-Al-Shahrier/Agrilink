/* ================================================================
   middleware/uploadMiddleware.js  —  AgriLink
   
   Fixes:
   ① Uses diskStorage (not memoryStorage) so file is saved to disk
   ② Saves filename as "uploads/filename.jpg" path
   ③ ES Module syntax (import/export)
});

export default upload;