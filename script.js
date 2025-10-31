// ------------------------------
// Dynamic footer year
// ------------------------------
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ------------------------------
// Hide / show header on scroll
// ------------------------------
let lastScrollY = window.scrollY;
const header = document.getElementById("site-header");

window.addEventListener("scroll", () => {
  const currentY = window.scrollY;

  if (currentY > lastScrollY && currentY > 80) {
    // Scrolling down → hide header
    header.classList.add("hidden");
  } else {
    // Scrolling up → show header
    header.classList.remove("hidden");
  }

  lastScrollY = currentY;
});


// ------------------------------
// Smooth scrolling (brute force version)
// ------------------------------

// Easing function (easeInOutQuad)
function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}

// Animate scroll from current position to targetY in `duration` ms
function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const distanceY = targetY - startY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeInOutQuad(t);

    window.scrollTo(0, startY + distanceY * eased);

    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Global click handler for ANY <a href="#something">
document.addEventListener("click", function (e) {
  // Only care about left-click normal navigation
  if (
    e.target.tagName.toLowerCase() === "a" &&
    e.target.getAttribute("href") &&
    e.target.getAttribute("href").startsWith("#")
  ) {
    const href = e.target.getAttribute("href");

    // If it's just "#", let it through (no scrolling)
    if (href === "#") {
      return;
    }

    const targetEl = document.querySelector(href);
    if (!targetEl) {
      return;
    }

    // BLOCK default jump completely
    e.preventDefault();

    // Current scroll before browser tries to snap
    const currentScroll = window.scrollY;

    // Where do we actually want to land?
    const rect = targetEl.getBoundingClientRect();
    const absoluteY = rect.top + window.scrollY;

    // Account for sticky header height so the section title isn't hidden
    const headerHeight = header ? header.offsetHeight : 0;
    const finalY = absoluteY - headerHeight - 8;

    // Force us back to where we were (prevents "instant jump" flash)
    window.scrollTo(0, currentScroll);

    // Now animate to finalY
    smoothScrollTo(finalY, 450);
  }
});