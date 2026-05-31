const CONFIG = {
  THEME_KEY: "kaleb-portfolio-theme",
  MOBILE_BREAKPOINT: 900,
  LOCAL_API_URL: "http://127.0.0.1:8000/chat",
  LIVE_API_URL: "https://celeriterorg-production.up.railway.app",
  REQUEST_TIMEOUT_MS: 10000
};

const SELECTORS = {
  themeToggle: "#theme-toggle",
  themeIcon: ".theme-icon",
  menuToggle: "#menu-toggle",
  mobileMenu: "#mobile-menu",
  tabButton: "[data-tab]",
  panel: ".tab-panel",
  chatInput: "#chatInput",
  chatMessages: "#chatMessages",
  sendChatButton: "#sendChatButton"
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  body: document.body,
  themeToggle: $(SELECTORS.themeToggle),
  themeIcon: $(SELECTORS.themeIcon),
  menuToggle: $(SELECTORS.menuToggle),
  mobileMenu: $(SELECTORS.mobileMenu),
  tabButtons: $$(SELECTORS.tabButton),
  panels: $$(SELECTORS.panel),
  chatInput: $(SELECTORS.chatInput),
  chatMessages: $(SELECTORS.chatMessages),
  sendChatButton: $(SELECTORS.sendChatButton)
};

const isLocalSite = ["127.0.0.1", "localhost"].includes(window.location.hostname);
const API_URL = isLocalSite ? CONFIG.LOCAL_API_URL : CONFIG.LIVE_API_URL;

function setTheme(theme) {
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  elements.body.classList.toggle("dark", isDark);

  if (elements.themeIcon) {
    elements.themeIcon.textContent = isDark ? "☀" : "☾";
  }

  if (elements.themeToggle) {
    elements.themeToggle.setAttribute("aria-label", label);
    elements.themeToggle.setAttribute("title", label);
  }

  localStorage.setItem(CONFIG.THEME_KEY, theme);
}

function getSavedTheme() {
  const saved = localStorage.getItem(CONFIG.THEME_KEY);

  if (["light", "dark"].includes(saved)) {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setActiveTab(tabId, moveFocus = true) {
  if (!tabId) return;

  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabId;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  elements.panels.forEach((panel) => {
    const isActive = panel.id === tabId;

    panel.classList.toggle("active", isActive);
    panel.setAttribute("aria-hidden", String(!isActive));

    if (isActive && moveFocus) {
      panel.focus();
    }
  });
}

function setMobileMenu(open) {
  const { mobileMenu, menuToggle } = elements;

  if (!mobileMenu || !menuToggle) return;

  mobileMenu.hidden = !open;
  mobileMenu.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuToggle.textContent = open ? "✕" : "☰";
}

function appendMessage(type, text) {
  if (!elements.chatMessages) return;

  const message = document.createElement("div");

  message.className = `${type}-message message`;
  message.textContent = text;

  elements.chatMessages.appendChild(message);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function postChatMessage(message) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    CONFIG.REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    return await response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function sendChatMessage() {
  const input = elements.chatInput;
  const button = elements.sendChatButton;
  const userText = input?.value.trim();

  if (!userText) return;

  appendMessage("user", userText);
  input.value = "";

  if (button) {
    button.disabled = true;
    button.textContent = "Sending...";
  }

  try {
    const data = await postChatMessage(userText);
    appendMessage("bot", data.reply || "No reply received.");
  } catch (error) {
    appendMessage(
      "bot",
      "I could not reach the chatbot backend. Check that the public API is running."
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Send";
    }

    input?.focus();
  }
}

function handleTabKeydown(event, index) {
  const keys = {
    ArrowRight: 1,
    ArrowDown: 1,
    ArrowLeft: -1,
    ArrowUp: -1
  };

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    event.currentTarget.click();
    return;
  }

  if (!(event.key in keys)) return;

  event.preventDefault();

  const nextIndex =
    (index + keys[event.key] + elements.tabButtons.length) %
    elements.tabButtons.length;

  elements.tabButtons[nextIndex].focus();
}

function initTheme() {
  if (!elements.themeToggle) return;

  setTheme(getSavedTheme());

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = elements.body.classList.contains("dark")
      ? "light"
      : "dark";

    setTheme(nextTheme);
  });
}

function initNavigation() {
  elements.panels.forEach((panel) => {
    panel.setAttribute("tabindex", "0");
  });

  elements.tabButtons.forEach((button, index) => {
    button.setAttribute("role", "tab");

    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tab);

      if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
        setMobileMenu(false);
      }
    });

    button.addEventListener("keydown", (event) => {
      handleTabKeydown(event, index);
    });
  });

  elements.menuToggle?.addEventListener("click", () => {
    setMobileMenu(!elements.mobileMenu?.classList.contains("open"));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
      setMobileMenu(false);
    }
  });

  const activePanel = $(".tab-panel.active") || $("#about");
  setActiveTab(activePanel?.id || "about", false);
  setMobileMenu(false);
}

function initChatbot() {
  elements.sendChatButton?.addEventListener("click", sendChatMessage);

  elements.chatInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendChatMessage();
    }
  });
}

function init() {
  initTheme();
  initNavigation();
  initChatbot();
}

init();
