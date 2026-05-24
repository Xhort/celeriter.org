const body = document.body;

const elements = {
  themeToggle: document.getElementById("theme-toggle"),
  themeIcon: document.querySelector(".theme-icon"),
  menuToggle: document.getElementById("menu-toggle"),
  mobileMenu: document.getElementById("mobile-menu"),
  tabButtons: [...document.querySelectorAll("[data-tab]")],
  panels: [...document.querySelectorAll(".tab-panel")],
  chatInput: document.getElementById("chatInput"),
  chatMessages: document.getElementById("chatMessages")
};

const CONFIG = {
  THEME_KEY: "kaleb-portfolio-theme",
  MOBILE_BREAKPOINT: 900,
  API_URL: "https://celeriter.org/chat", "http://127.0.0.1:8000/chat",
};

/* =========================
   THEME
========================= */

function setTheme(theme) {
  const isDark = theme === "dark";

  body.classList.toggle("dark", isDark);

  if (elements.themeIcon) {
    elements.themeIcon.textContent = isDark ? "☀" : "☾";
  }

  if (elements.themeToggle) {
    const label = isDark
      ? "Switch to light mode"
      : "Switch to dark mode";

    elements.themeToggle.setAttribute("aria-label", label);
    elements.themeToggle.setAttribute("title", label);
  }

  localStorage.setItem(CONFIG.THEME_KEY, theme);
}

function getSavedTheme() {
  const saved = localStorage.getItem(CONFIG.THEME_KEY);

  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/* =========================
   TABS
========================= */

function setActiveTab(tabId, moveFocus = true) {
  if (!tabId) return;

  elements.tabButtons.forEach((button) => {
    const active = button.dataset.tab === tabId;

    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", active);
  });

  elements.panels.forEach((panel) => {
    const active = panel.id === tabId;

    panel.classList.toggle("active", active);
    panel.setAttribute("aria-hidden", !active);

    if (active && moveFocus) {
      panel.focus();
    }
  });
}

/* =========================
   MOBILE MENU
========================= */

function setMobileMenu(open) {
  const { mobileMenu, menuToggle } = elements;

  if (!mobileMenu || !menuToggle) return;

  mobileMenu.classList.toggle("open", open);
  mobileMenu.hidden = !open;

  menuToggle.setAttribute("aria-expanded", open);

  if (open) {
    menuToggle.setAttribute("aria-label", "Close menu");
    menuToggle.textContent = "✕";
  } else {
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.textContent = "☰";
  }
}

/* =========================
   CHATBOT
========================= */

function appendMessage(type, text) {
  const message = document.createElement("div");

  message.className = `${type}-message message`;
  message.textContent = text;

  elements.chatMessages.appendChild(message);
  elements.chatMessages.scrollTop =
    elements.chatMessages.scrollHeight;
}

async function sendChatMessage() {
  const input = elements.chatInput;
  const userText = input.value.trim();

  if (!userText) return;

  appendMessage("user", userText);

  input.value = "";

  try {
    const response = await fetch(CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userText
      })
    });

    const data = await response.json();

    appendMessage("bot", data.reply);

  } catch (error) {
    appendMessage("bot", "Backend is not connected.");
  }
}

/* =========================
   EVENT LISTENERS
========================= */

if (elements.themeToggle) {
  setTheme(getSavedTheme());

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = body.classList.contains("dark")
      ? "light"
      : "dark";

    setTheme(nextTheme);
  });
}

if (elements.menuToggle) {
  elements.menuToggle.addEventListener("click", () => {
    const isOpen =
      elements.mobileMenu.classList.contains("open");

    setMobileMenu(!isOpen);
  });
}

elements.tabButtons.forEach((button, index) => {

  button.addEventListener("click", () => {
    setActiveTab(button.dataset.tab);

    if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
      setMobileMenu(false);
    }
  });

  button.addEventListener("keydown", (event) => {

    let nextIndex = index;

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();
      nextIndex =
        (index + 1) % elements.tabButtons.length;
    }

    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
      nextIndex =
        (index - 1 + elements.tabButtons.length) %
        elements.tabButtons.length;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      button.click();
      return;
    }

    elements.tabButtons[nextIndex].focus();
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
    setMobileMenu(false);
  }
});

document.addEventListener("DOMContentLoaded", () => {

  elements.panels.forEach((panel) => {
    panel.setAttribute("tabindex", "0");
  });

  elements.tabButtons.forEach((button) => {
    button.setAttribute("role", "tab");
  });

  const activePanel =
    document.querySelector(".tab-panel.active") ||
    document.getElementById("about");

  setActiveTab(activePanel?.id || "about", false);

  setMobileMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    document.activeElement.id === "chatInput"
  ) {
    sendChatMessage();
  }
});