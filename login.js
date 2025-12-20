// Practice Tracker - Login Module
// Handles user authentication and local credential storage

console.log("Login script loaded");

// Check if Chrome API is available
function isChromeAvailable() {
  return (
    typeof chrome !== "undefined" && chrome.storage && chrome.storage.local
  );
}

// ==================== INITIALIZATION ====================

// Initialize login page when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLogin);
} else {
  initLogin();
}

async function initLogin() {
  try {
    console.log("Login initialization started");

    // Setup event listeners for login form (always do this for UI)
    setupTabSwitching();
    setupFormHandlers();
    showDemoNote();

    // Check Chrome API availability for data operations
    if (!isChromeAvailable()) {
      console.error(
        "Chrome extension API not available - storage features will not work"
      );
      return;
    }

    // Ensure demo user exists
    await ensureDemoUserExists();

    console.log("Login initialization complete");
  } catch (error) {
    console.error("Error initializing login:", error);
  }
}

// ==================== TAB SWITCHING ====================

function setupTabSwitching() {
  const loginContainer = document.querySelector(".login-container");
  if (!loginContainer) return;

  const tabButtons = loginContainer.querySelectorAll(".tab-btn");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;

      // Update active tab button
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Update active form content
      loginContainer.querySelectorAll(".form-content").forEach((form) => {
        form.classList.remove("active");
      });

      if (tabName === "login") {
        document.getElementById("loginForm").classList.add("active");
      } else if (tabName === "signup") {
        document.getElementById("signupForm").classList.add("active");
      }

      // Clear error messages
      clearAllErrors();
    });
  });
}

// ==================== FORM HANDLERS ====================

function setupFormHandlers() {
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");

  loginBtn.addEventListener("click", handleLogin);
  signupBtn.addEventListener("click", handleSignup);

  // Allow Enter key to submit forms
  document.getElementById("loginPassword").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  document
    .getElementById("signupConfirmPassword")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSignup();
    });
}

// ==================== LOGIN HANDLER ====================

async function handleLogin() {
  console.log("Login button clicked!");
  try {
    clearAllErrors();

    if (!isChromeAvailable()) {
      showError("loginError", "Extension APIs not available. Please reload.");
      return;
    }

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    console.log("Login attempt with email:", email);

    // Validation
    if (!email) {
      showError("loginEmailError", "Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      showError("loginEmailError", "Please enter a valid email");
      return;
    }

    if (!password) {
      showError("loginPasswordError", "Password is required");
      return;
    }

    // Get stored users
    const result = await chrome.storage.local.get("users");
    const users = result.users || [];

    console.log("Users in storage:", users);

    // Find user with matching email
    const user = users.find((u) => u.email === email);

    if (!user) {
      console.log("User not found for email:", email);
      showError("loginError", "Email or password is incorrect");
      return;
    }

    console.log("User found:", user.email);
    console.log("Password match:", user.password === password);

    // Verify password (simple comparison - in production, use bcrypt)
    if (user.password !== password) {
      showError("loginError", "Email or password is incorrect");
      return;
    }

    console.log("Login successful for user:", user.email);

    // Login successful
    await setCurrentUser(user);
    showSuccess("loginError", "Login successful! Redirecting...");

    // Redirect to popup after short delay
    setTimeout(() => {
      redirectToPopup();
    }, 1000);
  } catch (error) {
    console.error("Login error:", error);
    showError("loginError", "An error occurred. Please try again.");
  }
}

// ==================== SIGNUP HANDLER ====================

async function handleSignup() {
  console.log("Signup button clicked!");
  try {
    clearAllErrors();

    if (!isChromeAvailable()) {
      showError("signupError", "Extension APIs not available. Please reload.");
      return;
    }

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword"
    ).value;

    // Validation
    if (!name) {
      showError("signupNameError", "Full name is required");
      return;
    }

    if (name.length < 2) {
      showError("signupNameError", "Name must be at least 2 characters");
      return;
    }

    if (!email) {
      showError("signupEmailError", "Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      showError("signupEmailError", "Please enter a valid email");
      return;
    }

    if (!password) {
      showError("signupPasswordError", "Password is required");
      return;
    }

    if (password.length < 6) {
      showError(
        "signupPasswordError",
        "Password must be at least 6 characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      showError("signupConfirmError", "Passwords do not match");
      return;
    }

    // Get existing users
    const result = await chrome.storage.local.get("users");
    const users = result.users || [];

    console.log("Existing users:", users);
    console.log("Checking email:", email);

    // Check if email already exists
    if (users.some((u) => u.email === email)) {
      console.log("Email already registered:", email);
      showError("signupEmailError", "Email is already registered");
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In production, hash this with bcrypt
      createdAt: Date.now(),
    };

    console.log("Creating new user:", newUser);

    // Save user
    users.push(newUser);
    console.log("Users array before save:", users);

    try {
      await chrome.storage.local.set({ users });
    } catch (storageError) {
      console.error("Chrome storage error:", storageError);
      console.error("Trying alternative save method...");
      // If chrome.storage fails, it's a permission issue
      throw new Error(
        "Storage permission denied. Please check extension permissions."
      );
    }
    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("signupConfirmPassword").value = "";

    // Show success message
    const successMsg = document.getElementById("signupSuccess");
    successMsg.textContent = "✓ Account created successfully! Please login.";
    successMsg.classList.add("show");

    // Switch to login tab after 2 seconds
    setTimeout(() => {
      document.querySelector('[data-tab="login"]').click();
    }, 2000);
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    showError("signupError", "Error: " + error.message);
  }
}

// ==================== AUTHENTICATION HELPERS ====================

async function ensureDemoUserExists() {
  try {
    if (!isChromeAvailable()) {
      console.error("Chrome storage not available in ensureDemoUserExists");
      return;
    }

    const result = await chrome.storage.local.get("users");
    let users = result.users || [];

    // Check if demo user already exists
    const demoUserExists = users.some((u) => u.email === "demo@example.com");

    if (!demoUserExists) {
      const demoUser = {
        id: "demo-user-001",
        name: "Demo User",
        email: "demo@example.com",
        password: "demo123",
        createdAt: Date.now(),
      };

      users.push(demoUser);
      await chrome.storage.local.set({ users });
      console.log("Demo user created");
    }
  } catch (error) {
    console.error("Error ensuring demo user exists:", error);
  }
}

async function checkIfLoggedIn() {
  try {
    const result = await chrome.storage.local.get("currentUser");
    return !!result.currentUser;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}

async function setCurrentUser(user) {
  try {
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      loginTime: Date.now(),
    };
    await chrome.storage.local.set({ currentUser: userData });
    console.log("User set with ID:", userData.id);
  } catch (error) {
    console.error("Error setting current user:", error);
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ==================== UI HELPERS ====================

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.add("show");
  }
}

function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.color = "#27ae60";
    element.textContent = message;
    element.classList.add("show");
  }
}

function clearAllErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.classList.remove("show");
    el.textContent = "";
  });

  document.querySelectorAll(".success-message").forEach((el) => {
    el.classList.remove("show");
    el.textContent = "";
  });
}

function showDemoNote() {
  // Show demo note on login tab for first-time users
  const demoNote = document.getElementById("demoNote");
  if (demoNote) {
    demoNote.classList.add("show");
  }
}

// ==================== NAVIGATION ====================

function redirectToPopup() {
  // Hide login page and show main app
  const loginPage = document.getElementById("loginPage");
  const mainApp = document.getElementById("mainApp");

  if (loginPage) {
    loginPage.classList.remove("show");
  }
  if (mainApp) {
    mainApp.classList.remove("hidden");
  }

  console.log("Redirected to main app");

  // If we are on login.html as a separate page, redirect to popup.html
  if (window.location.pathname.includes("login.html")) {
    window.location.href = "popup.html";
  } else {
    // Otherwise just reload to re-run init in popup.js
    window.location.reload();
  }
}

// ==================== EXPORT FUNCTIONS ====================

// Make checkIfLoggedIn available globally for popup.js
window.checkIfLoggedIn = checkIfLoggedIn;
