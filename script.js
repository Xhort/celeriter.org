const body = document.body;
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

const tabButtons = document.querySelectorAll("[data-tab]");
const panels = document.querySelectorAll(".tab-panel");

const THEME_KEY = "kaleb-portfolio-theme";

function setTheme(theme) {
  const isDark = theme === "dark";
  body.classList.toggle("dark", isDark);

  if (themeIcon) {
    themeIcon.textContent = isDark ? "☀" : "☾";
  }

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
    themeToggle.setAttribute(
      "title",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  localStorage.setItem(THEME_KEY, theme);
}

function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function setActiveTab(tabId, moveFocus = true) {
  if (!tabId) return;

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabId;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  panels.forEach((panel) => {
    const isActive = panel.id === tabId;
    panel.classList.toggle("active", isActive);
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");

    if (isActive && moveFocus) {
      panel.focus();
    }
  });
}

function closeMobileMenu() {
  if (!mobileMenu || !menuToggle) return;
  mobileMenu.classList.remove("open");
  mobileMenu.hidden = true;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  menuToggle.textContent = "☰";
}

function openMobileMenu() {
  if (!mobileMenu || !menuToggle) return;
  mobileMenu.hidden = false;
  mobileMenu.classList.add("open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close menu");
  menuToggle.textContent = "✕";
}

function toggleMobileMenu() {
  if (!mobileMenu) return;
  const isOpen = mobileMenu.classList.contains("open");
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

if (themeToggle) {
  setTheme(getSavedTheme());

  themeToggle.addEventListener("click", () => {
    const nextTheme = body.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
  });
}

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMobileMenu);
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tabId = button.dataset.tab;
    setActiveTab(tabId);

    if (window.innerWidth <= 900) {
      closeMobileMenu();
    }
  });

  button.addEventListener("keydown", (event) => {
    const currentIndex = Array.from(tabButtons).indexOf(button);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % tabButtons.length;
      tabButtons[nextIndex].focus();
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
      tabButtons[nextIndex].focus();
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      button.click();
    }
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900) {
    closeMobileMenu();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  panels.forEach((panel) => {
    panel.setAttribute("tabindex", "0");
  });

  tabButtons.forEach((button) => {
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", button.classList.contains("active") ? "true" : "false");
  });

  const activePanel =
    document.querySelector(".tab-panel.active") || document.getElementById("about");

  if (activePanel) {
    setActiveTab(activePanel.id, false);
  } else {
    setActiveTab("about", false);
  }

  closeMobileMenu();
});