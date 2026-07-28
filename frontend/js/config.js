/* =====================================================
   AgriLink — API base URL
   Every other script/page reads window.API_BASE instead of
   hardcoding "http://localhost:5000" — so going to production
   only means editing PROD_API_URL below, once, in one place.
===================================================== */
(function () {
  // 👉 Set this to your deployed backend's URL (no trailing slash)
  //    once you deploy it, e.g. "https://agrilink-api.onrender.com"
  const PROD_API_URL = "https://your-backend-domain.example.com";

  const isLocal = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

  window.API_BASE = isLocal ? "http://localhost:5000" : PROD_API_URL;
})();
