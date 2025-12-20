// Practice Tracker - Background Service Worker
// Handles timer persistence across browser restarts and popup closes

// Listen for extension installation
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Practice Tracker installed");

  // Initialize demo user on first installation
  const result = await chrome.storage.local.get("users");
  if (!result.users) {
    const demoUser = {
      id: "demo-user-001",
      name: "Demo User",
      email: "demo@example.com",
      password: "demo123",
      createdAt: Date.now(),
    };

    await chrome.storage.local.set({
      users: [demoUser],
    });
    console.log("Demo user initialized");
  }
});

// Restore timer state when extension starts
chrome.runtime.onStartup.addListener(async () => {
  await restoreTimerState();
  setupAlarms();
});

// Also restore when service worker wakes up
chrome.runtime.onConnect.addListener(async () => {
  await restoreTimerState();
});

// Listener for alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "updateSessionTimestamp") {
    await updateSessionTimestamp();
  } else if (alarm.name === "dailyReminder") {
    await checkDailyReminder();
  }
});

// Setup periodic alarms
function setupAlarms() {
  chrome.alarms.create("updateSessionTimestamp", { periodInMinutes: 1 });
  chrome.alarms.create("dailyReminder", {
    when: Date.now() + 60000,
    periodInMinutes: 60 * 24,
  });
}

// Restore timer state from storage
async function restoreTimerState() {
  const result = await chrome.storage.local.get("currentSession");
  const session = result.currentSession;

  if (session && !session.isPaused) {
    // Timer was running, update paused time to account for browser being closed
    const now = Date.now();
    const timeSinceLastUpdate =
      now - (session.lastUpdateTime || session.startTime);

    // If browser was closed for more than 5 minutes, pause the timer
    if (timeSinceLastUpdate > 5 * 60 * 1000) {
      session.isPaused = true;
      session.pauseStartTime = session.lastUpdateTime || session.startTime;
      await chrome.storage.local.set({ currentSession: session });
    }
  }
}

// Update session timestamp periodically
async function updateSessionTimestamp() {
  const result = await chrome.storage.local.get("currentSession");
  const session = result.currentSession;

  if (session && !session.isPaused) {
    session.lastUpdateTime = Date.now();
    await chrome.storage.local.set({ currentSession: session });
    console.log("Session timestamp updated");
  }
}

// Check daily reminder
async function checkDailyReminder() {
  const userResult = await chrome.storage.local.get("currentUser");
  const currentUser = userResult.currentUser;

  if (!currentUser) return;

  const result = await chrome.storage.local.get(["allSessions"]);
  const allSessions = result.allSessions || [];

  // Filter for current user's sessions
  const sessions = allSessions.filter((s) => s.userId === currentUser.id);

  const now = new Date();
  const today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  const todaySessions = sessions.filter((s) => s.date === today);

  if (todaySessions.length === 0) {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Practice Tracker",
      message:
        "You haven't practiced today. Start a session to maintain your streak!",
      priority: 1,
    });
  }
}

// Initial setup
setupAlarms();
