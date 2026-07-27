/* =====================================================
   AGRILINK — profile.js  (FIXED)
   Loads the logged-in user's profile from MongoDB via
   the backend API, lets them edit details and change
   their avatar (stored as base64).

   ⚠️ BACKEND CONTRACT ASSUMED — confirm/adjust if your
   real routes differ:

   GET  /api/users/me
        Headers: Authorization: Bearer <token>
        Returns: { _id, name, email, role, phone, profileImage,
                   farmName, location, address, ... }

   PUT  /api/users/me
        Headers: Authorization: Bearer <token>, Content-Type: application/json
        Body: { name, phone, image, farmName, location, address }
        Returns updated user object (same shape as GET)
===================================================== */

const _API = `${window.API_BASE || "http://localhost:5000"}/api`;

const els = {
  loading:     document.getElementById("profileLoading"),
  error:       document.getElementById("profileError"),
  errorMsg:    document.getElementById("profileErrorMsg"),
  retryBtn:    document.getElementById("retryLoadBtn"),
  content:     document.getElementById("profileContent"),

  avatarCircle:   document.getElementById("avatarCircle"),
  avatarImg:      document.getElementById("avatarImg"),
  avatarInitials: document.getElementById("avatarInitials"),
  avatarInput:    document.getElementById("avatarInput"),
  avatarSpinner:  document.getElementById("avatarSpinner"),

  name:      document.getElementById("profileName"),
  roleBadge: document.getElementById("profileRoleBadge"),
  stats:     document.getElementById("profileStats"),

  editToggleBtn: document.getElementById("editToggleBtn"),
  viewMode:      document.getElementById("viewMode"),
  editForm:      document.getElementById("editForm"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  saveEditBtn:   document.getElementById("saveEditBtn"),

  vName: document.getElementById("vName"),
  vEmail: document.getElementById("vEmail"),
  vPhone: document.getElementById("vPhone"),
  vFarmName: document.getElementById("vFarmName"),
  vFarmLocation: document.getElementById("vFarmLocation"),
  vAddress: document.getElementById("vAddress"),

  eName: document.getElementById("eName"),
  eEmail: document.getElementById("eEmail"),
  ePhone: document.getElementById("ePhone"),
  eFarmName: document.getElementById("eFarmName"),
  eFarmLocation: document.getElementById("eFarmLocation"),
  eAddress: document.getElementById("eAddress"),

  toast: document.getElementById("toast"),
};

// ---------------------------------------------------------
// FIX #0: fail loudly (in the console) if the HTML markup is
// out of sync with this script, instead of silently leaving
// `els.something` as null and crashing later with a confusing
// "Cannot read properties of null" deep inside renderProfile.
// That kind of crash is a classic cause of "infinite spinner,
// blank page" because it can happen BEFORE the loading screen
// is hidden.
// ---------------------------------------------------------
(function checkMarkup() {
  const missing = Object.entries(els)
    .filter(([, el]) => el === null)
    .map(([key]) => key);
  if (missing.length) {
    console.error(
      "[profile.js] These element IDs were not found in the HTML:",
      missing,
      "\nDouble-check profile.html has matching ids, otherwise the page will silently fail."
    );
  }
})();

// FIX: renamed from `currentUser` — app.js (loaded before this file)
// already declares `const currentUser` in the same global scope (these
// are plain <script> tags, not modules, so they all share one scope).
// Re-declaring the same identifier with `let` here threw:
//   "Uncaught SyntaxError: Identifier 'currentUser' has already been declared"
// which happens at parse time, BEFORE any code in this file runs — so
// loadProfile() was never even called. That's why the spinner span
// forever with zero network requests and zero console output beyond
// that one syntax error.
let currentProfileUser = null;
let pendingAvatarBase64 = null; // staged until "Save changes" is pressed

/* =====================================================
   TOAST HELPER
===================================================== */
function showToast(message, isError = false) {
  els.toast.textContent = message;
  els.toast.classList.toggle("error", isError);
  els.toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => els.toast.classList.remove("show"), 3000);
}

/* =====================================================
   AUTH GUARD
===================================================== */
function getToken() {
  // FIX: if your login page saves the token under a different
  // key (e.g. localStorage.setItem("authToken", ...) or nested
  // inside a "user" object), this will ALWAYS return null and
  // the profile page will look exactly like this bug report:
  // infinite spinner because requireAuth() keeps failing.
  // Confirm login.js uses the same key: "token".
  return localStorage.getItem("token");
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    // FIX: hide the loading screen immediately instead of
    // leaving it spinning while we wait 900ms to redirect.
    els.loading.classList.add("hidden");
    els.content.classList.add("hidden");
    showToast("Please log in to view your profile.", true);
    setTimeout(() => (location.href = "login.html"), 900);
    return false;
  }
  return true;
}

/* =====================================================
   FETCH PROFILE FROM MONGODB (via backend API)
===================================================== */
async function loadProfile() {
  els.loading.classList.remove("hidden");
  els.error.classList.add("hidden");
  els.content.classList.add("hidden");

  if (!requireAuth()) return; // requireAuth() now cleans up the loading state itself

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${_API}/users/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.status === 401) {
      // FIX: hide loading before bouncing to login — previously
      // the spinner stayed visible for the full 900ms (and forever
      // if the redirect ever failed to fire for any reason).
      els.loading.classList.add("hidden");
      localStorage.removeItem("token");
      showToast("Session expired. Please log in again.", true);
      setTimeout(() => (location.href = "login.html"), 900);
      return;
    }

    if (res.status === 404) {
      throw new Error(
        "Profile route not found on the server. Check that /api/users is mounted in server.js."
      );
    }

    // Guard against non-JSON responses (HTML error pages, proxy errors, etc.)
    // — without this, res.json() throws and the loading screen never clears.
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const rawText = await res.text();
      console.error("Non-JSON response from /users/me:", rawText.slice(0, 300));
      throw new Error(
        "Server returned an unexpected response. Is the backend running, and is CORS configured to allow this origin?"
      );
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Could not load profile (status ${res.status}).`);
    }

    const user = await res.json();
    currentProfileUser = user;
    renderProfile(user);

    els.loading.classList.add("hidden");
    els.content.classList.remove("hidden");
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("Profile load error:", err);
    // FIX: always make sure loading is hidden and SOMETHING is shown
    // (the error box), so the user never sees an indefinite blank spinner.
    els.loading.classList.add("hidden");
    els.content.classList.add("hidden");
    els.errorMsg.textContent =
      err.name === "AbortError"
        ? "The server took too long to respond. Is it running?"
        : err.message || "Something went wrong. Please try again.";
    els.error.classList.remove("hidden");
  }
}

/* =====================================================
   RENDER PROFILE INTO THE PAGE
===================================================== */
function renderProfile(user) {
  const isFarmer = user.role === "farmer";

  // Header
  els.name.textContent = user.name || "Unnamed user";
  els.roleBadge.textContent = isFarmer ? "🚜 Farmer" : "🛒 Customer";
  els.roleBadge.className = `role-badge ${isFarmer ? "farmer" : "customer"}`;

  // Avatar
  setAvatarDisplay(user.profileImage, user.name);

  // Stats strip
  renderStats(user, isFarmer);

  // View mode values
  els.vName.textContent = user.name || "—";
  els.vEmail.textContent = user.email || "—";
  setFieldValue(els.vPhone, user.phone);

  document.querySelectorAll(".farmer-only").forEach((el) =>
    el.classList.toggle("hidden", !isFarmer)
  );
  document.querySelectorAll(".customer-only").forEach((el) =>
    el.classList.toggle("hidden", isFarmer)
  );

  if (isFarmer) {
    setFieldValue(els.vFarmName, user.farmName);
    setFieldValue(els.vFarmLocation, user.location);
  } else {
    setFieldValue(els.vAddress, user.address);
  }

  // Pre-fill edit form (kept in sync even while hidden)
  els.eName.value = user.name || "";
  els.eEmail.value = user.email || "";
  els.ePhone.value = user.phone || "";
  els.eFarmName.value = user.farmName || "";
  els.eFarmLocation.value = user.location || "";
  els.eAddress.value = user.address || "";
}

function setFieldValue(el, value) {
  if (value && value.trim()) {
    el.textContent = value;
    el.classList.remove("empty");
  } else {
    el.textContent = "Not added yet";
    el.classList.add("empty");
  }
}

function setAvatarDisplay(imageData, name) {
  if (imageData) {
    els.avatarImg.src = imageData;
    els.avatarImg.alt = name ? `${name}'s profile photo` : "Profile photo";
    els.avatarImg.classList.remove("hidden");
    els.avatarInitials.classList.add("hidden");
  } else {
    els.avatarImg.classList.add("hidden");
    els.avatarInitials.classList.remove("hidden");
    els.avatarInitials.textContent = getInitials(name);
  }
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0][0];
  return initials.toUpperCase();
}

function renderStats(user, isFarmer) {
  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
    : "—";

  const statsData = isFarmer
    ? [
        { value: user.productCount ?? 0, label: "Products listed" },
        { value: user.ordersServed ?? 0, label: "Orders served" },
        { value: joined, label: "Member since" },
      ]
    : [
        { value: user.orderCount ?? 0, label: "Orders placed" },
        { value: user.favoriteCount ?? 0, label: "Saved items" },
        { value: joined, label: "Member since" },
      ];

  els.stats.innerHTML = statsData
    .map(
      (s) => `
      <div class="stat-box">
        <strong>${s.value}</strong>
        <span>${s.label}</span>
      </div>`
    )
    .join("");
}

/* =====================================================
   AVATAR UPLOAD — convert to base64, stage, preview
===================================================== */
els.avatarInput.addEventListener("change", () => {
  const file = els.avatarInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file.", true);
    return;
  }
  // FIX: base64 encoding inflates the original file size by ~33%.
  // The old 3MB frontend limit could still produce a base64 string
  // that exceeds the backend's 4MB check, causing a confusing
  // "Image is too large" error even though the frontend said it was fine.
  // 2.5MB original file → ~3.3MB base64, safely under the 4MB backend cap.
  if (file.size > 2.5 * 1024 * 1024) {
    showToast("Image must be smaller than 2.5MB.", true);
    return;
  }

  els.avatarSpinner.classList.remove("hidden");

  const reader = new FileReader();
  reader.onload = async () => {
    pendingAvatarBase64 = reader.result; // data:image/...;base64,...

    // Live preview immediately
    els.avatarImg.src = pendingAvatarBase64;
    els.avatarImg.classList.remove("hidden");
    els.avatarInitials.classList.add("hidden");

    // Auto-save the photo right away (separate from text-field edits)
    await saveAvatarOnly(pendingAvatarBase64);
    els.avatarSpinner.classList.add("hidden");
  };
  reader.onerror = () => {
    els.avatarSpinner.classList.add("hidden");
    showToast("Couldn't read that image. Try another file.", true);
  };
  reader.readAsDataURL(file);
});

async function saveAvatarOnly(base64Image) {
  try {
    const res = await fetch(`${_API}/users/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64Image }),
    });

    // FIX: guard against non-JSON error pages (e.g. a 500 HTML stack
    // trace) so this doesn't throw an unreadable "Unexpected token <" error.
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : null;

    if (!res.ok) {
      throw new Error((data && data.message) || `Couldn't update photo (status ${res.status}).`);
    }
    if (!data) {
      throw new Error("Server returned an unexpected response while saving the photo.");
    }

    currentProfileUser = data;
    pendingAvatarBase64 = null;
    showToast("✅ Profile photo updated!");
  } catch (err) {
    console.error("Avatar update error:", err);
    showToast(`❌ ${err.message}`, true);
    // Revert preview on failure
    setAvatarDisplay(currentProfileUser?.profileImage, currentProfileUser?.name);
  }
}

/* =====================================================
   EDIT MODE TOGGLE
===================================================== */
function enterEditMode() {
  els.viewMode.classList.add("hidden");
  els.editForm.classList.remove("hidden");
  els.editToggleBtn.classList.add("hidden");
}

function exitEditMode() {
  els.viewMode.classList.remove("hidden");
  els.editForm.classList.add("hidden");
  els.editToggleBtn.classList.remove("hidden");
}

els.editToggleBtn.addEventListener("click", enterEditMode);

els.cancelEditBtn.addEventListener("click", () => {
  if (currentProfileUser) renderProfile(currentProfileUser); // discard unsaved changes
  exitEditMode();
});

/* =====================================================
   SAVE EDITED DETAILS
===================================================== */
els.editForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isFarmer = currentProfileUser?.role === "farmer";

  const payload = isFarmer
    ? {
        name: els.eName.value.trim(),
        phone: els.ePhone.value.trim(),
        farmName: els.eFarmName.value.trim(),
        location: els.eFarmLocation.value.trim(),
      }
    : {
        name: els.eName.value.trim(),
        phone: els.ePhone.value.trim(),
        address: els.eAddress.value.trim(),
      };

  if (!payload.name) {
    showToast("Name can't be empty.", true);
    return;
  }

  els.saveEditBtn.disabled = true;
  els.saveEditBtn.textContent = "Saving…";

  try {
    const res = await fetch(`${_API}/users/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // FIX: same non-JSON guard as above.
    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : null;

    if (!res.ok) {
      throw new Error((data && data.message) || `Couldn't save changes (status ${res.status}).`);
    }
    if (!data) {
      throw new Error("Server returned an unexpected response while saving.");
    }

    currentProfileUser = data;
    renderProfile(currentProfileUser);

    // Keep cached user in sync if other pages read it (e.g. navbar greeting)
    const cached = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (cached) {
      localStorage.setItem("currentUser", JSON.stringify({ ...cached, ...currentProfileUser }));
    }

    exitEditMode();
    showToast("✅ Profile updated!");
  } catch (err) {
    console.error("Profile save error:", err);
    showToast(`❌ ${err.message}`, true);
  } finally {
    els.saveEditBtn.disabled = false;
    els.saveEditBtn.textContent = "Save changes";
  }
});

/* =====================================================
   RETRY ON ERROR
===================================================== */
els.retryBtn.addEventListener("click", loadProfile);

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", loadProfile);