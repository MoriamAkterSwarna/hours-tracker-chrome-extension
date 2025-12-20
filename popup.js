// Practice Tracker - Main Popup Logic
// Handles timer, UI updates, storage operations, and all user interactions

console.log("Practice Tracker script loaded");

// ==================== STATE MANAGEMENT ====================

let currentSession = null;
let timerInterval = null;
let categories = [];
let sessions = [];
let settings = {
  dailyGoal: 60, // minutes
  darkMode: false,
  currentMode: "10000", // '10000' or '20'
};

// ==================== INITIALIZATION ====================

// Initialize immediately when script loads (DOM might already be ready)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

async function init() {
  try {
    // Check if user is logged in
    const isLoggedIn = await checkIfUserLoggedIn();
    if (!isLoggedIn) {
      // Show login page
      const loginPage = document.getElementById("loginPage");
      const mainApp = document.getElementById("mainApp");
      if (loginPage) loginPage.classList.add("show");
      if (mainApp) mainApp.classList.add("hidden");

      // Initialize login system
      console.log("User not logged in, showing login page");
      return;
    }

    // Hide login page, show main app
    const loginPage = document.getElementById("loginPage");
    const mainApp = document.getElementById("mainApp");
    if (loginPage) loginPage.classList.remove("show");
    if (mainApp) mainApp.classList.remove("hidden");

    await loadData();
  } catch (error) {
    console.error("Error loading data:", error);
    // Continue even if loading fails
  }

  try {
    initializeUI();
  } catch (error) {
    console.error("Error initializing UI:", error);
    alert("Error initializing extension. Please reload.");
    return;
  }

  try {
    startTimerCheck();
    updateAllDisplays();
  } catch (error) {
    console.error("Error updating displays:", error);
    console.error("Stack trace:", error.stack);
  }
}

// Check if user is logged in
async function checkIfUserLoggedIn() {
  try {
    const result = await chrome.storage.local.get("currentUser");
    return !!result.currentUser;
  } catch (error) {
    console.error("Error checking user login:", error);
    return false;
  }
}

// Default categories to initialize on first load
const DEFAULT_CATEGORIES = [
  // Technical Skills
  { id: "cat-english", name: "English", createdAt: Date.now() },
  { id: "cat-ai", name: "Artificial Intelligence", createdAt: Date.now() },
  { id: "cat-software", name: "Software Engineering", createdAt: Date.now() },
  { id: "cat-problem", name: "Problem Solving", createdAt: Date.now() },
  { id: "cat-web", name: "Web Development", createdAt: Date.now() },
  { id: "cat-system", name: "System Design", createdAt: Date.now() },
  {
    id: "cat-dsa",
    name: "Data Structures & Algorithms",
    createdAt: Date.now(),
  },
  { id: "cat-database", name: "Database Design", createdAt: Date.now() },
  { id: "cat-mobile", name: "Mobile Development", createdAt: Date.now() },
  { id: "cat-devops", name: "DevOps", createdAt: Date.now() },
  { id: "cat-cloud", name: "Cloud Computing", createdAt: Date.now() },
  { id: "cat-security", name: "Cybersecurity", createdAt: Date.now() },

  // Soft Skills
  { id: "cat-communication", name: "Communication", createdAt: Date.now() },
  { id: "cat-leadership", name: "Leadership", createdAt: Date.now() },
  { id: "cat-teamwork", name: "Teamwork", createdAt: Date.now() },
  {
    id: "cat-presentation",
    name: "Presentation Skills",
    createdAt: Date.now(),
  },
  { id: "cat-time", name: "Time Management", createdAt: Date.now() },
  { id: "cat-networking", name: "Networking", createdAt: Date.now() },
  { id: "cat-negotiation", name: "Negotiation", createdAt: Date.now() },
  {
    id: "cat-empathy",
    name: "Empathy & Emotional Intelligence",
    createdAt: Date.now(),
  },
  { id: "cat-adaptability", name: "Adaptability", createdAt: Date.now() },
  { id: "cat-creativity", name: "Creativity", createdAt: Date.now() },
  {
    id: "cat-critical-thinking",
    name: "Critical Thinking",
    createdAt: Date.now(),
  },
  {
    id: "cat-conflict-resolution",
    name: "Conflict Resolution",
    createdAt: Date.now(),
  },
];

// Load all data from storage (filtered by current user)
async function loadData() {
  try {
    // Get current user
    const userResult = await chrome.storage.local.get("currentUser");
    const currentUser = userResult.currentUser;

    if (!currentUser) {
      console.log("No user logged in, cannot load data");
      return;
    }

    const userId = currentUser.id;

    const result = await chrome.storage.local.get([
      "allCategories",
      "allSessions",
      "settings",
      "currentSession",
      "initialized",
    ]);

    // Initialize default categories for user if this is first time
    if (!result.initialized) {
      const defaultCategoriesWithUserId = DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        userId,
      }));
      const allCategories = result.allCategories || [];
      allCategories.push(...defaultCategoriesWithUserId);

      await chrome.storage.local.set({
        allCategories,
        initialized: true,
      });
      console.log("Default categories initialized for user:", userId);
      categories = defaultCategoriesWithUserId;
    } else {
      // Filter categories for current user
      const allCategories = result.allCategories || [];
      categories = allCategories.filter((cat) => cat.userId === userId);
    }

    // Filter sessions for current user
    const allSessions = result.allSessions || [];
    sessions = allSessions.filter((s) => s.userId === userId);

    settings = { ...settings, ...(result.settings || {}) };

    // Load current session if it belongs to this user
    const session = result.currentSession || null;
    currentSession = session && session.userId === userId ? session : null;

    // Apply dark mode
    if (settings.darkMode) {
      document.body.classList.add("dark-mode");
      const darkModeBtn = document.getElementById("darkModeToggle");
      if (darkModeBtn) {
        darkModeBtn.textContent = "☀️";
      }
    }
  } catch (error) {
    console.error("Storage error:", error);
    // Use defaults if storage fails
    // Note: userId will be added when data is saved
    categories = [...DEFAULT_CATEGORIES];
    sessions = [];
    settings = {
      dailyGoal: 60,
      darkMode: false,
      currentMode: "10000",
    };
    currentSession = null;
  }
}

// Save data to storage (with userId for all entries)
async function saveData() {
  try {
    // Get current user
    const userResult = await chrome.storage.local.get("currentUser");
    const currentUser = userResult.currentUser;

    if (!currentUser) {
      console.error("Cannot save data: No user logged in");
      return;
    }

    const userId = currentUser.id;

    // Get all data from storage
    const result = await chrome.storage.local.get([
      "allCategories",
      "allSessions",
    ]);

    let allCategories = result.allCategories || [];
    let allSessions = result.allSessions || [];

    // Remove old entries for this user
    allCategories = allCategories.filter((cat) => cat.userId !== userId);
    allSessions = allSessions.filter((s) => s.userId !== userId);

    // Add updated entries with userId
    const categoriesWithUserId = categories.map((cat) => ({
      ...cat,
      userId,
    }));
    const sessionsWithUserId = sessions.map((s) => ({
      ...s,
      userId,
    }));

    allCategories.push(...categoriesWithUserId);
    allSessions.push(...sessionsWithUserId);

    // Update currentSession with userId if it exists
    const currentSessionToSave = currentSession
      ? { ...currentSession, userId }
      : null;

    await chrome.storage.local.set({
      allCategories,
      allSessions,
      settings,
      currentSession: currentSessionToSave,
    });
  } catch (error) {
    console.error("Error saving data:", error);
  }
}

// Initialize UI event listeners
function initializeUI() {
  try {
    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout);
    }

    // Timer controls
    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const resumeBtn = document.getElementById("resumeBtn");
    const endBtn = document.getElementById("endBtn");
    const endTaskBtn = document.getElementById("endTaskBtn");

    if (startBtn) startBtn.addEventListener("click", startTimer);
    if (pauseBtn) pauseBtn.addEventListener("click", pauseTimer);
    if (resumeBtn) resumeBtn.addEventListener("click", resumeTimer);
    if (endBtn)
      endBtn.addEventListener("click", () => {
        endTimer(false);
      });
    if (endTaskBtn)
      endTaskBtn.addEventListener("click", () => {
        endTimer(true);
      });

    // Category management
    const manageCategoriesBtn = document.getElementById("manageCategoriesBtn");
    if (manageCategoriesBtn) {
      manageCategoriesBtn.addEventListener("click", () => {
        switchTab("settings");
      });
    }

    // Quick add category button
    const quickAddCategoryBtn = document.getElementById("quickAddCategoryBtn");
    if (quickAddCategoryBtn) {
      quickAddCategoryBtn.addEventListener("click", () => {
        showCategoryModal();
      });
    }

    // Tabs - Only within main app
    const mainApp = document.getElementById("mainApp");
    if (mainApp) {
      mainApp.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const tab =
            e.target.dataset.tab || e.target.closest(".tab-btn")?.dataset.tab;
          if (tab) {
            switchTab(tab);
          }
        });
      });
    }

    // Category select change listener
    const categorySelect = document.getElementById("categorySelect");
      if (categorySelect) {
        categorySelect.addEventListener("change", (e) => {
          console.log("[DEBUG] Category select changed", e.target.value);
          handleCategoryChange(e);
        });
      }

    // Target hours input
    const hoursTargetInput = document.getElementById("hoursTargetInput");
    if (hoursTargetInput) {
      // Set initial value based on selected category or settings
      syncTargetHoursWithSelectedCategory();
      // Apply changes from input
      const applyTarget = () => {
        const value = Number(hoursTargetInput.value);
        if (!value || value <= 0) return;
        const categorySelect = document.getElementById("categorySelect");
        const selectedId = categorySelect?.value;
        if (selectedId) {
          const cat = categories.find((c) => c.id === selectedId);
          if (cat) {
            cat.targetHours = value;
          }
        } else {
          settings.currentMode = String(value);
        }
        saveData();
        updateProgressDisplay();
      };
      hoursTargetInput.addEventListener("change", applyTarget);
      hoursTargetInput.addEventListener("input", applyTarget);
    }

    // Settings
    const addCategoryBtn = document.getElementById("addCategoryBtn");
    if (addCategoryBtn) {
      addCategoryBtn.addEventListener("click", () => {
        showCategoryModal();
      });
    }

    const setDailyGoalBtn = document.getElementById("setDailyGoalBtn");
    if (setDailyGoalBtn) {
      setDailyGoalBtn.addEventListener("click", () => {
        const input = document.getElementById("dailyGoalInput");
        if (input) {
          input.value = settings.dailyGoal;
        }
        switchTab("settings");
      });
    }

    const saveDailyGoalBtn = document.getElementById("saveDailyGoalBtn");
    if (saveDailyGoalBtn) {
      saveDailyGoalBtn.addEventListener("click", saveDailyGoal);
    }

    // Dark mode
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", toggleDarkMode);
    }

    // Export
    const exportJsonBtn = document.getElementById("exportJsonBtn");
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener("click", exportHistoryJSON);
    }

    const exportCsvBtn = document.getElementById("exportCsvBtn");
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener("click", exportHistoryCSV);
    }

    // Backward compatibility - old export button
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", exportHistoryJSON);
    }

    // History filter
    const historyCategoryFilter = document.getElementById(
      "historyCategoryFilter"
    );
    if (historyCategoryFilter) {
      historyCategoryFilter.addEventListener("change", updateHistoryDisplay);
    }

    // Manual hours
    const manualAddHoursBtn = document.getElementById("manualAddHoursBtn");
    if (manualAddHoursBtn) {
      manualAddHoursBtn.addEventListener("click", showManualHoursModal);
    }

    // Category Modal setup
    const saveCategoryBtn = document.getElementById("saveCategoryBtn");
    if (saveCategoryBtn) {
      saveCategoryBtn.addEventListener("click", saveCategory);
    }

    const cancelCategoryBtn = document.getElementById("cancelCategoryBtn");
    if (cancelCategoryBtn) {
      cancelCategoryBtn.addEventListener("click", closeCategoryModal);
    }

    const deleteCategoryBtn = document.getElementById("deleteCategoryBtn");
    if (deleteCategoryBtn) {
      deleteCategoryBtn.addEventListener("click", deleteCategory);
    }

    const categoryModal = document.getElementById("categoryModal");
    if (categoryModal) {
      // Close button
      const closeBtn = categoryModal.querySelector(".close");
      if (closeBtn) {
        closeBtn.addEventListener("click", closeCategoryModal);
      }

      // Close on outside click
      categoryModal.addEventListener("click", (e) => {
        if (e.target.id === "categoryModal") {
          closeCategoryModal();
        }
      });
    }

    // Manual Hours Modal setup
    const saveManualHoursBtn = document.getElementById("saveManualHoursBtn");
    if (saveManualHoursBtn) {
      saveManualHoursBtn.addEventListener("click", saveManualHours);
    }

    const cancelManualHoursBtn = document.getElementById(
      "cancelManualHoursBtn"
    );
    if (cancelManualHoursBtn) {
      cancelManualHoursBtn.addEventListener("click", closeManualHoursModal);
    }

    const manualHoursModal = document.getElementById("manualHoursModal");
    if (manualHoursModal) {
      // Close button
      const closeBtn = manualHoursModal.querySelector(".close");
      if (closeBtn) {
        closeBtn.addEventListener("click", closeManualHoursModal);
      }

      // Close on outside click
      manualHoursModal.addEventListener("click", (e) => {
        if (e.target.id === "manualHoursModal") {
          closeManualHoursModal();
        }
      });
    }

    console.log("UI initialized successfully");
  } catch (error) {
    console.error("Error in initializeUI:", error);
    throw error;
  }
}

// Ensure dropdown reflects the selected category's target hours
function syncTargetHoursWithSelectedCategory() {
  try {
    const categorySelect = document.getElementById("categorySelect");
    const hoursTargetInput = document.getElementById("hoursTargetInput");
    if (!hoursTargetInput) return;

    const selectedId = categorySelect?.value;
    if (!selectedId) {
      hoursTargetInput.value = String(Number(settings.currentMode) || 10000);
      return;
    }
    const cat = categories.find((c) => c.id === selectedId);
    const target = cat?.targetHours ?? Number(settings.currentMode) ?? 10000;
    hoursTargetInput.value = String(target);
  } catch (error) {
    console.error("Error syncing target hours:", error);
  }
}

// Handle category selection change
function handleCategoryChange() {
  try {
    console.log("Category changed");
    const categorySelect = document.getElementById("categorySelect");
    const selectedId = categorySelect?.value;

    if (!selectedId) return;

    // Sync the target hours display with the newly selected category
    syncTargetHoursWithSelectedCategory();

    // Reset today's practice to 0 by removing today's sessions for this category
    const todayStr = getLocalDateString();
    const initialSessionCount = sessions.length;
    sessions = sessions.filter(
      (s) => !(s.categoryId === selectedId && s.date === todayStr)
    );
    const sessionsRemoved = initialSessionCount - sessions.length;

    // Reset the daily target for this category
    const cat = categories.find((c) => c.id === selectedId);
    if (cat) {
      cat.targetHours = undefined; // Reset to default
    }

    // If there were sessions removed, save and update displays
    if (sessionsRemoved > 0) {
      saveData();
      try {
        console.log("Category changed", e.target.value);
      );
    }

    // Update all displays
    updateAllDisplays();
    updateTimerControls();
  } catch (error) {
    console.error("Error handling category change:", error);
  }
}

// ==================== TIMER FUNCTIONS ====================

function startTimer() {
  try {
    console.log("Start timer clicked");
    const categorySelect = document.getElementById("categorySelect");
    if (!categorySelect) {
      console.error("Category select not found");
      return;
    }

    const categoryId = categorySelect.value;
    if (!categoryId) {
      alert("Please select a category first");
      return;
    }

    if (currentSession) {
      alert("A session is already running. Please end it first.");
      return;
    }

    const startTime = Date.now();
    const notesInput = document.getElementById("notesInput");
    currentSession = {
      categoryId,
      startTime,
      pausedTime: 0,
      isPaused: false,
      notes: notesInput ? notesInput.value.trim() : "",
    };

    saveData();
    updateTimerControls();
    startTimerCheck();
    console.log("Timer started");
  } catch (error) {
    console.error("Error starting timer:", error);
    alert("Error starting timer. Please try again.");
  }
}

function pauseTimer() {
  try {
    console.log("Pause timer clicked");
    if (!currentSession || currentSession.isPaused) return;

    currentSession.isPaused = true;
    currentSession.pauseStartTime = Date.now();
    saveData();
    updateTimerControls();
    updateTimerDisplay();
    updateStats();
  } catch (error) {
    console.error("Error pausing timer:", error);
  }
}

function resumeTimer() {
  try {
    console.log("Resume timer clicked");
    if (!currentSession || !currentSession.isPaused) return;

    const pauseDuration = Date.now() - currentSession.pauseStartTime;
    currentSession.pausedTime += pauseDuration;
    currentSession.isPaused = false;
    delete currentSession.pauseStartTime;

    // Save the session and update displays
    saveData();

    // Restart the timer check to ensure proper interval handling
    clearInterval(timerInterval);
    startTimerCheck();
    updateTimerControls();
    updateTimerDisplay();
    updateStats();
    updateAllDisplays();

    // Notify user that session has been resumed
    const statusElement = document.getElementById("statusMessage");
    if (statusElement) {
      statusElement.textContent = "Session resumed";
      statusElement.style.display = "block";
      setTimeout(() => {
        statusElement.style.display = "none";
      }, 3000);
    }
  } catch (error) {
    console.error("Error resuming timer:", error);
    alert("Error resuming session. Please try again.");
  }
}

function endTimer(isTask = false) {
  try {
    console.log("End timer clicked, isTask:", isTask);
    if (!currentSession) return;

    const endTime = Date.now();
    const totalPaused =
      currentSession.pausedTime +
      (currentSession.isPaused ? endTime - currentSession.pauseStartTime : 0);
    const duration = endTime - currentSession.startTime - totalPaused;

    if (duration < 1000) {
      if (confirm("Session is very short. Are you sure you want to end it?")) {
        saveSession(isTask);
      }
    } else {
      saveSession(isTask);
    }
  } catch (error) {
    console.error("Error ending timer:", error);
    alert("Error ending timer. Please try again.");
  }
}

function saveSession(isTask = false) {
  const endTime = Date.now();
  const totalPaused =
    currentSession.pausedTime +
    (currentSession.isPaused ? endTime - currentSession.pauseStartTime : 0);
  const duration = endTime - currentSession.startTime - totalPaused;

  const todayStr = getLocalDateString();

  const session = {
    id: Date.now().toString(),
    categoryId: currentSession.categoryId,
    startTime: currentSession.startTime,
    endTime,
    duration, // milliseconds
    notes: currentSession.notes,
    date: todayStr,
    isTask: isTask, // Distinguish between block/session and full tasks
  };

  sessions.push(session);
  currentSession = null;

  // Clear notes input
  const notesInput = document.getElementById("notesInput");
  if (notesInput) notesInput.value = "";

  saveData();
  updateTimerControls();
  if (isTask) {
    switchTab("history"); // Auto-switch to history on task end? Optional, but helpful
  } else {
    switchTab("progress");
  }
  updateAllDisplays();
}

// Check timer and update display
function startTimerCheck() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    updateTimerDisplay();
    updateStats();

    // Only update progress display if the progress tab is currently active
    // to save performance, or just update it anyway for immediate feedback
    const progressTab = document.getElementById("progressTab");
    if (progressTab && progressTab.classList.contains("active")) {
      updateProgressDisplay();
    }
  }, 100);

  updateTimerDisplay();
  updateStats();
}

function updateTimerDisplay() {
  const display = document.getElementById("timerDisplay");
  if (!display) return;

  if (!currentSession) {
    display.textContent = "00:00:00";
    return;
  }

  const now = Date.now();
  let elapsed = now - currentSession.startTime;

  // Subtract paused time
  elapsed -= currentSession.pausedTime;
  if (currentSession.isPaused) {
    elapsed -= now - currentSession.pauseStartTime;
  }

  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);

  display.textContent = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerControls() {
  const hasSession = !!currentSession;
  const isPaused = currentSession?.isPaused;

  const categorySelect = document.getElementById("categorySelect");
  if (categorySelect) categorySelect.disabled = hasSession;

  const targetInput = document.getElementById("hoursTargetInput");
  if (targetInput) targetInput.disabled = hasSession;

  const startBtn = document.getElementById("startBtn");
  if (startBtn) startBtn.disabled = hasSession;

  const pauseBtn = document.getElementById("pauseBtn");
  if (pauseBtn) pauseBtn.disabled = !hasSession || isPaused;

  const resumeBtn = document.getElementById("resumeBtn");
  if (resumeBtn) resumeBtn.disabled = !hasSession || !isPaused;

  const endBtn = document.getElementById("endBtn");
  if (endBtn) endBtn.disabled = !hasSession;

  const endTaskBtn = document.getElementById("endTaskBtn");
  if (endTaskBtn) endTaskBtn.disabled = !hasSession;
}

// ==================== CATEGORY MANAGEMENT ====================

function updateCategorySelect() {
  const select = document.getElementById("categorySelect");
  const filterSelect = document.getElementById("historyCategoryFilter");

  if (!select || !filterSelect) {
    console.warn("Category selection elements not found");
    return;
  }

  // Clear existing options (except first)
  while (select.options && select.options.length > 1) {
    select.remove(1);
  }
  while (filterSelect.options && filterSelect.options.length > 1) {
    filterSelect.remove(1);
  }

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    select.appendChild(option);

    const filterOption = document.createElement("option");
    filterOption.value = cat.id;
    filterOption.textContent = cat.name;
    filterSelect.appendChild(filterOption);
  });

  updateCategoriesList();
}

function showCategoryModal(categoryId = null) {
  try {
    console.log("Show category modal");
    const modal = document.getElementById("categoryModal");
    const title = document.getElementById("modalTitle");
    const input = document.getElementById("categoryNameInput");
    const deleteBtn = document.getElementById("deleteCategoryBtn");

    if (!modal || !title || !input) {
      console.error("Modal elements not found");
      return;
    }

    if (categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        title.textContent = "Edit Category";
        input.value = category.name;
        if (deleteBtn) {
          deleteBtn.style.display = "block";
          deleteBtn.dataset.categoryId = categoryId;
        }
      }
    } else {
      title.textContent = "Add Category";
      input.value = "";
      if (deleteBtn) {
        deleteBtn.style.display = "none";
      }
    }

    modal.classList.add("active");
    input.focus();
  } catch (error) {
    console.error("Error showing category modal:", error);
  }
}

function closeCategoryModal() {
  try {
    const modal = document.getElementById("categoryModal");
    if (modal) {
      modal.classList.remove("active");
    }
  } catch (error) {
    console.error("Error closing modal:", error);
  }
}

function saveCategory() {
  try {
    console.log("Save category clicked");
    const input = document.getElementById("categoryNameInput");
    if (!input) {
      console.error("Category name input not found");
      return;
    }

    const name = input.value.trim();
    const deleteBtn = document.getElementById("deleteCategoryBtn");
    const categoryId = deleteBtn ? deleteBtn.dataset.categoryId : null;

    if (!name) {
      alert("Category name cannot be empty");
      return;
    }

    if (categoryId) {
      // Edit existing
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        category.name = name;
      }
    } else {
      // Add new
      if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        alert("Category with this name already exists");
        return;
      }

      categories.push({
        id: Date.now().toString(),
        name,
        createdAt: Date.now(),
      });
    }

    saveData();
    updateCategorySelect();
    closeCategoryModal();
  } catch (error) {
    console.error("Error saving category:", error);
    alert("Error saving category. Please try again.");
  }
}

function deleteCategory() {
  const deleteBtn = document.getElementById("deleteCategoryBtn");
  const categoryId = deleteBtn.dataset.categoryId;

  if (!categoryId) return;

  // Check if category is in use
  const hasSessions = sessions.some((s) => s.categoryId === categoryId);
  if (hasSessions) {
    if (
      !confirm(
        "This category has sessions. Are you sure you want to delete it?"
      )
    ) {
      return;
    }
  }

  // Remove category and its sessions
  categories = categories.filter((c) => c.id !== categoryId);
  sessions = sessions.filter((s) => s.categoryId !== categoryId);

  // Clear current session if it uses this category
  if (currentSession && currentSession.categoryId === categoryId) {
    currentSession = null;
  }

  saveData();
  updateCategorySelect();
  updateAllDisplays();
  closeCategoryModal();
}

// ==================== MANUAL HOURS FUNCTIONS ====================

function showManualHoursModal() {
  try {
    const modal = document.getElementById("manualHoursModal");
    const categorySelect = document.getElementById("manualCategory");
    const dateInput = document.getElementById("manualDate");
    const mainCategorySelect = document.getElementById("categorySelect");

    if (!modal || !categorySelect) {
      console.error("Manual hours modal elements not found");
      return;
    }

    // Populate categories
    categorySelect.innerHTML = '<option value="">Select a category</option>';
    categories.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id;
      option.textContent = cat.name;
      categorySelect.appendChild(option);
    });

    // Sync with main category selector if one is selected
    if (mainCategorySelect && mainCategorySelect.value) {
      categorySelect.value = mainCategorySelect.value;
    }

    // Set today's date
    if (dateInput) {
      dateInput.valueAsDate = new Date();
    }

    // Clear inputs
    document.getElementById("manualHours").value = "";
    document.getElementById("manualMinutes").value = "";
    document.getElementById("manualNotes").value = "";

    modal.classList.add("active");
  } catch (error) {
    console.error("Error showing manual hours modal:", error);
  }
}

function closeManualHoursModal() {
  try {
    const modal = document.getElementById("manualHoursModal");
    if (modal) {
      modal.classList.remove("active");
    }
  } catch (error) {
    console.error("Error closing manual hours modal:", error);
  }
}

function saveManualHours() {
  try {
    const categoryId = document.getElementById("manualCategory").value;
    const hours = parseInt(document.getElementById("manualHours").value) || 0;
    const minutes =
      parseInt(document.getElementById("manualMinutes").value) || 0;
    const dateStr = document.getElementById("manualDate").value;
    const notes = document.getElementById("manualNotes").value.trim();

    // Validation
    if (!categoryId) {
      alert("Please select a category");
      return;
    }

    if (hours === 0 && minutes === 0) {
      alert("Please enter at least some hours or minutes");
      return;
    }

    if (hours > 24 || minutes > 59) {
      alert("Please enter valid hours (0-24) and minutes (0-59)");
      return;
    }

    if (!dateStr) {
      alert("Please select a date");
      return;
    }

    // Calculate duration in milliseconds
    const duration = (hours * 60 + minutes) * 60 * 1000;

    // Create a session for this manual entry
    const sessionDate = new Date(dateStr);
    const startTime = sessionDate.getTime();
    const endTime = startTime + duration;

    // Ensure the date matches the YYYY-MM-DD format strictly
    const formattedDate =
      sessionDate.getFullYear() +
      "-" +
      String(sessionDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(sessionDate.getDate()).padStart(2, "0");

    const session = {
      id: Date.now().toString(),
      categoryId,
      startTime,
      endTime,
      duration,
      notes,
      date: formattedDate,
      isTask: true, // Manual hours are usually considered "tasks"
    };

    sessions.push(session);
    saveData();
    updateAllDisplays();
    closeManualHoursModal();

    alert(
      `Successfully added ${hours}h ${minutes}m to ${
        categories.find((c) => c.id === categoryId)?.name
      }`
    );
  } catch (error) {
    console.error("Error saving manual hours:", error);
    alert("Error saving hours. Please try again.");
  }
}

function updateCategoriesList() {
  const list = document.getElementById("categoriesList");
  if (!list) return;
  list.innerHTML = "";

  if (categories.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><div class="empty-state-text">No categories yet. Add one to get started!</div></div>';
    return;
  }

  categories.forEach((cat) => {
    const item = document.createElement("div");
    item.className = "category-item";

    const totalHours = getCategoryTotalHours(cat.id);

    const nameSpan = document.createElement("span");
    nameSpan.className = "category-item-name";
    nameSpan.textContent = cat.name;

    const actionsDiv = document.createElement("div");
    actionsDiv.className = "category-item-actions";

    const hoursSpan = document.createElement("span");
    hoursSpan.style.cssText =
      "font-size: 12px; color: #666; margin-right: 8px;";
    hoursSpan.textContent = formatHours(totalHours);

    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => showCategoryModal(cat.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-icon danger";
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete "${cat.name}"?`)) {
        deleteCategoryById(cat.id);
      }
    });

    actionsDiv.appendChild(hoursSpan);
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);

    item.appendChild(nameSpan);
    item.appendChild(actionsDiv);

    list.appendChild(item);
  });
}

function deleteCategoryById(categoryId) {
  const hasSessions = sessions.some((s) => s.categoryId === categoryId);
  if (hasSessions) {
    if (
      !confirm(
        "This category has sessions. Delete category and all its sessions?"
      )
    ) {
      return;
    }
  }

  categories = categories.filter((c) => c.id !== categoryId);
  sessions = sessions.filter((s) => s.categoryId !== categoryId);

  if (currentSession && currentSession.categoryId === categoryId) {
    currentSession = null;
  }

  saveData();
  updateCategorySelect();
  updateAllDisplays();
}

// ==================== DISPLAY UPDATES ====================

function updateAllDisplays() {
  updateCategorySelect();
  updateStats();
  updateProgressDisplay();
  updateHistoryDisplay();
  updateTimerControls();
}

// Helper to get duration of current active session
function getCurrentSessionDuration() {
  if (!currentSession) return 0;

  const now = Date.now();
  let elapsed = now - currentSession.startTime;

  // Subtract paused time
  elapsed -= currentSession.pausedTime;
  if (currentSession.isPaused) {
    elapsed -= now - currentSession.pauseStartTime;
  }

  return Math.max(0, elapsed);
}

function updateStats() {
  const today = getLocalDateString();
  const categorySelect = document.getElementById("categorySelect");
  const selectedCategoryId = categorySelect ? categorySelect.value : null;

  // Filter sessions by today AND by selected category
  const todaySessions = sessions.filter(
    (s) =>
      s.date === today &&
      (!selectedCategoryId || s.categoryId === selectedCategoryId)
  );

  const todayTotal = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  // Include live elapsed time from an active session (only if it matches the selected category)
  let liveElapsedMs = 0;
  if (
    currentSession &&
    (!selectedCategoryId || currentSession.categoryId === selectedCategoryId)
  ) {
    liveElapsedMs = getCurrentSessionDuration();
  }

  const todayTotalElement = document.getElementById("todayTotal");
  if (todayTotalElement) {
    todayTotalElement.textContent = formatDuration(todayTotal + liveElapsedMs);
  }

  // Show remaining time towards the daily goal (Now category-specific as requested)
  const goalMs = (settings.dailyGoal || 0) * 60000;
  const totalForGoal = todayTotal + liveElapsedMs;
  const remainingMs = Math.max(goalMs - totalForGoal, 0);

  const dailyGoalElement = document.getElementById("dailyGoal");
  if (dailyGoalElement) {
    dailyGoalElement.textContent = formatDuration(remainingMs);
  }

  // Calculate streak (Global)
  const streak = calculateStreak();
  const currentStreakElement = document.getElementById("currentStreak");
  if (currentStreakElement) {
    currentStreakElement.textContent = `${streak.current} days`;
  }
  const bestStreakElement = document.getElementById("bestStreak");
  if (bestStreakElement) {
    bestStreakElement.textContent = `${streak.best} days`;
  }

  // Weekly total (Global)
  const weekTotal = getWeeklyTotal();
  const weeklyTotalElement = document.getElementById("weeklyTotal");
  if (weeklyTotalElement) {
    weeklyTotalElement.textContent = formatDuration(weekTotal);
  }

  // Visual warning for daily goal (Global)
  const goalCard = document.querySelector(".stat-card:nth-child(2)");
  if (goalCard) {
    if (remainingMs > 0) {
      goalCard.style.border = "2px solid #ffc107";
    } else {
      goalCard.style.border = "2px solid #28a745";
    }
  }
}

function updateProgressDisplay() {
  const list = document.getElementById("progressList");
  if (!list) return;
  list.innerHTML = "";

  const todayStr = getLocalDateString();
  const activeCategoryIds = new Set(
    sessions.filter((s) => s.date === todayStr).map((s) => s.categoryId)
  );

  // Include the category if a timer is currently running
  if (currentSession) activeCategoryIds.add(currentSession.categoryId);

  // 1. Render Category Progress Bars (Only for categories with activity today)
  const categoriesToDisplay = categories.filter((cat) =>
    activeCategoryIds.has(cat.id)
  );

  if (categoriesToDisplay.length > 0) {
    const header = document.createElement("h3");
    header.textContent = "Category Progress (Today)";
    header.style.marginBottom = "15px";
    list.appendChild(header);

    categoriesToDisplay.forEach((cat) => {
      const targetHours = cat.targetHours || 1; // Default to 1 if not set
      const totalHours = getCategoryTotalHours(cat.id);
      const percentage = Math.min((totalHours / targetHours) * 100, 100);
      const isCompleted = totalHours >= targetHours;

      const item = document.createElement("div");
      item.className = `progress-item ${isCompleted ? "completed-target" : ""}`;

      item.innerHTML = `
        <div class="progress-item-header">
          <span class="progress-item-name">${escapeHtml(cat.name)}</span>
          <span class="progress-item-hours">${totalHours.toFixed(
            2
          )} / ${targetHours}h</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar ${
            isCompleted ? "completed" : ""
          }" style="width: ${percentage}%">
            ${percentage.toFixed(1)}%
          </div>
        </div>
      `;
      list.appendChild(item);
    });
  }

  // 2. Render Today's Session Blocks (The 'End Block' list)
  const todayBlocks = sessions.filter(
    (s) => s.date === todayStr && s.isTask !== true
  );

  if (todayBlocks.length > 0) {
    const blockHeader = document.createElement("h3");
    blockHeader.textContent = "Recent Blocks (Today)";
    blockHeader.style.margin = "20px 0 10px 0";
    list.appendChild(blockHeader);

    const blockListContainer = document.createElement("div");
    blockListContainer.className = "history-list"; // Reuse history styles

    // Sort by latest first
    const sortedBlocks = [...todayBlocks].sort(
      (a, b) => b.startTime - a.startTime
    );

    sortedBlocks.forEach((session) => {
      const category = categories.find((c) => c.id === session.categoryId);
      const item = document.createElement("div");
      item.className = "history-item";
      item.style.padding = "10px";
      item.style.marginBottom = "8px";

      item.innerHTML = `
        <div class="history-item-header" style="font-size: 13px;">
          <span class="history-item-category" style="font-weight: 600;">${escapeHtml(
            category?.name || "Unknown"
          )}</span>
          <span class="history-item-duration" style="color: #667eea;">${formatDuration(
            session.duration
          )}</span>
        </div>
        <div class="history-item-date" style="font-size: 11px; opacity: 0.7;">
          ${formatTime(new Date(session.startTime))} - ${formatTime(
        new Date(session.endTime)
      )}
        </div>
      `;
      blockListContainer.appendChild(item);
    });
    list.appendChild(blockListContainer);
  }

  // 3. Show in-progress session with Resume/End if exists
  if (currentSession) {
    const cat = categories.find((c) => c.id === currentSession.categoryId);
    const inProgressDiv = document.createElement("div");
    inProgressDiv.className = "in-progress-block";
    inProgressDiv.style.margin = "24px 0 0 0";
    inProgressDiv.style.padding = "14px";
    inProgressDiv.style.border = "2px solid #667eea";
    inProgressDiv.style.borderRadius = "8px";
    inProgressDiv.style.background = "#f7f8ff";
    inProgressDiv.innerHTML = `
      <div style="font-weight: 600; font-size: 15px; margin-bottom: 6px; color: #333;">In Progress: ${escapeHtml(
        cat?.name || "Unknown"
      )}</div>
      <div style="font-size: 13px; margin-bottom: 10px;">
        Started: ${formatTime(new Date(currentSession.startTime))}
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="progressResumeBtn" class="btn btn-secondary" ${
          !currentSession.isPaused ? "disabled" : ""
        }>Resume</button>
        <button id="progressEndBtn" class="btn btn-danger">End Block</button>
      </div>
    `;
    list.appendChild(inProgressDiv);

    // Add event listeners for Resume/End
    setTimeout(() => {
      const resumeBtn = document.getElementById("progressResumeBtn");
      const endBtn = document.getElementById("progressEndBtn");
      if (resumeBtn) resumeBtn.addEventListener("click", resumeTimer);
      if (endBtn) endBtn.addEventListener("click", () => endTimer(false));
    }, 0);
  } else if (categoriesToDisplay.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><div class="empty-state-text">No activity yet today. End a block or task to see progress!</div></div>';
  }
}

function updateHistoryDisplay() {
  const list = document.getElementById("historyList");
  if (!list) return;

  const filterSelect = document.getElementById("historyCategoryFilter");
  if (!filterSelect) {
    console.warn("History filter not found");
    return;
  }
  const filter = filterSelect.value;

  let filteredSessions = sessions;
  if (filter !== "all") {
    filteredSessions = sessions.filter((s) => s.categoryId === filter);
  }

  // ONLY Show "Tasks" in the history log as requested
  const displaySessions = [...filteredSessions]
    .filter((s) => s.isTask === true)
    .sort((a, b) => b.startTime - a.startTime);

  list.innerHTML = "";

  if (displaySessions.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><div class="empty-state-text">No completed tasks found. Use "End Task" to save sessions to History.</div></div>';
    return;
  }

  // Group by date
  const grouped = {};
  displaySessions.forEach((session) => {
    if (!grouped[session.date]) {
      grouped[session.date] = [];
    }
    grouped[session.date].push(session);
  });

  Object.keys(grouped)
    .sort()
    .reverse()
    .forEach((date) => {
      const dateHeader = document.createElement("div");
      dateHeader.style.cssText =
        "font-weight: 600; margin: 12px 0 8px 0; color: #666; font-size: 14px;";
      if (document.body.classList.contains("dark-mode")) {
        dateHeader.style.color = "#aaa";
      }
      dateHeader.textContent = formatDate(date);
      list.appendChild(dateHeader);

      grouped[date].forEach((session) => {
        const category = categories.find((c) => c.id === session.categoryId);
        const item = document.createElement("div");
        item.className = "history-item";

        const startTime = new Date(session.startTime);
        const endTime = new Date(session.endTime);

        // Determine if target was reached at this point (Optional enhancement)
        const targetReached =
          category?.targetHours &&
          getCategoryTotalHours(session.categoryId) >= category.targetHours;

        item.innerHTML = `
        <div class="history-item-header">
          <span class="history-item-category">${escapeHtml(
            category?.name || "Unknown"
          )}</span>
          <span class="history-item-duration">${formatDuration(
            session.duration
          )}</span>
        </div>
        <div class="history-item-date">
          ${formatTime(startTime)} - ${formatTime(endTime)}
        </div>
        ${
          session.notes
            ? `<div class="history-item-notes">${escapeHtml(
                session.notes
              )}</div>`
            : ""
        }
        ${
          targetReached
            ? '<div class="completion-badge" style="margin-top: 8px;">🎯 Target Active/Reached</div>'
            : ""
        }
      `;

        list.appendChild(item);
      });
    });
}

// ==================== UTILITY FUNCTIONS ====================

function getLocalDateString(date = new Date()) {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

function getCategoryTotalHours(categoryId) {
  const categorySessions = sessions.filter((s) => s.categoryId === categoryId);
  const totalMs = categorySessions.reduce((sum, s) => sum + s.duration, 0);

  // Include live time if this category is currently being practiced
  let liveMs = 0;
  if (currentSession && currentSession.categoryId === categoryId) {
    liveMs = getCurrentSessionDuration();
  }

  return (totalMs + liveMs) / 3600000; // Convert to hours
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatHours(hours) {
  if (hours >= 1) {
    return `${hours.toFixed(1)}h`;
  } else {
    return `${Math.round(hours * 60)}m`;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = getLocalDateString(today);
  const yesterdayStr = getLocalDateString(yesterday);

  if (dateString === todayStr) {
    return "Today";
  } else if (dateString === yesterdayStr) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }
}

function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function calculateStreak() {
  if (sessions.length === 0) {
    return { current: 0, best: 0 };
  }

  // Get unique dates with sessions
  const datesWithSessions = [...new Set(sessions.map((s) => s.date))]
    .sort()
    .reverse();

  if (datesWithSessions.length === 0) {
    return { current: 0, best: 0 };
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = getLocalDateString();
  let checkDate = new Date(); // Start with today's local date

  for (let i = 0; i < datesWithSessions.length; i++) {
    const dateStr = getLocalDateString(checkDate);
    if (datesWithSessions.includes(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0) {
      // If today doesn't have a session, check if yesterday does
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = getLocalDateString(checkDate);
      if (datesWithSessions.includes(yesterdayStr)) {
        // Streak is still alive if yesterday has a session
        continue;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Calculate best streak
  let bestStreak = 0;
  let tempStreak = 0;
  const sortedDates = datesWithSessions.sort();

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const daysDiff = Math.floor(
        (currDate - prevDate) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  return { current: currentStreak, best: bestStreak };
}

function getWeeklyTotal() {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  const weekSessions = sessions.filter((s) => {
    const sessionDate = new Date(s.startTime);
    return sessionDate >= weekStart;
  });

  return weekSessions.reduce((sum, s) => sum + s.duration, 0);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ==================== TAB AND MODE FUNCTIONS ====================

function switchTab(tabName) {
  try {
    const mainApp = document.getElementById("mainApp");
    if (!mainApp) return;

    // Only select tabs within the main app
    mainApp.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    mainApp.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });

    // Find the specific button and content
    const tabBtn = mainApp.querySelector(`[data-tab="${tabName}"]`);
    const tabContent = document.getElementById(`${tabName}Tab`);

    if (tabBtn) {
      tabBtn.classList.add("active");
    }
    if (tabContent) {
      tabContent.classList.add("active");
    }

    if (tabName === "history") {
      updateHistoryDisplay();
    } else if (tabName === "progress") {
      updateProgressDisplay();
    }
  } catch (error) {
    console.error("Error switching tab:", error);
  }
}

function switchMode(mode) {
  try {
    settings.currentMode = mode;
    saveData();

    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    const modeBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (modeBtn) {
      modeBtn.classList.add("active");
    }

    updateProgressDisplay();
  } catch (error) {
    console.error("Error switching mode:", error);
  }
}

function toggleDarkMode() {
  try {
    settings.darkMode = !settings.darkMode;
    document.body.classList.toggle("dark-mode", settings.darkMode);
    const darkModeBtn = document.getElementById("darkModeToggle");
    if (darkModeBtn) {
      darkModeBtn.textContent = settings.darkMode ? "☀️" : "🌙";
    }
    saveData();
  } catch (error) {
    console.error("Error toggling dark mode:", error);
  }
}

async function handleLogout() {
  try {
    if (confirm("Are you sure you want to logout?")) {
      // Clear current user from storage
      await chrome.storage.local.remove("currentUser");

      // Redirect to login page
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error during logout:", error);
    alert("Error logging out. Please try again.");
  }
}

function saveDailyGoal() {
  try {
    const input = document.getElementById("dailyGoalInput");
    if (!input) {
      console.error("Daily goal input not found");
      return;
    }

    const minutes = parseInt(input.value);

    if (isNaN(minutes) || minutes < 1) {
      alert("Please enter a valid number of minutes");
      return;
    }

    settings.dailyGoal = minutes;
    saveData();
    updateStats();
    input.value = "";
  } catch (error) {
    console.error("Error saving daily goal:", error);
    alert("Error saving daily goal. Please try again.");
  }
}

// ==================== EXPORT FUNCTION ====================

function exportHistoryJSON() {
  const data = {
    exportDate: new Date().toISOString(),
    categories,
    sessions: sessions.map((s) => ({
      ...s,
      categoryName:
        categories.find((c) => c.id === s.categoryId)?.name || "Unknown",
    })),
    settings,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `practice-tracker-export-${getLocalDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportHistoryCSV() {
  try {
    // Prepare CSV header
    const headers = [
      "Date",
      "Category",
      "Start Time",
      "End Time",
      "Duration (hours)",
      "Duration (formatted)",
      "Notes",
    ];

    // Prepare CSV rows
    const rows = sessions.map((s) => {
      const category = categories.find((c) => c.id === s.categoryId);
      const startDate = new Date(s.startTime);
      const endDate = new Date(s.endTime);
      const durationHours = (s.duration / 3600000).toFixed(2);

      return [
        s.date,
        category?.name || "Unknown",
        startDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        endDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        durationHours,
        formatDuration(s.duration),
        s.notes ? `"${s.notes.replace(/"/g, '""')}"` : "",
      ];
    });

    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `practice-tracker-export-${getLocalDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    alert("Error exporting CSV. Please try again.");
  }
}

function exportHistory() {
  // Backward compatibility - call JSON export by default
  exportHistoryJSON();
}
