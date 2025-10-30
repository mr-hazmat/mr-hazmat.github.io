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
// Smooth scrolling with easing + header offset
// ------------------------------

// easing curve
function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}

// animate scroll
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

// capture clicks on all in-page links
document.addEventListener("click", function (e) {
  const t = e.target;
  if (
    t.tagName.toLowerCase() === "a" &&
    t.getAttribute("href") &&
    t.getAttribute("href").startsWith("#") &&
    t.getAttribute("href") !== "#"
  ) {
    const href = t.getAttribute("href");
    const targetEl = document.querySelector(href);
    if (!targetEl) return;

    e.preventDefault();

    const rect = targetEl.getBoundingClientRect();
    const absoluteY = rect.top + window.scrollY;

    const headerHeight = header ? header.offsetHeight : 0;
    const finalY = absoluteY - headerHeight - 8;

    smoothScrollTo(finalY, 450);
  }
});


// ------------------------------
// Fade-in on scroll using IntersectionObserver
// ------------------------------
const faders = document.querySelectorAll(".fade-section");

const fadeObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        // stop observing after first reveal
        obs.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15 // trigger when ~15% visible
  }
);

faders.forEach(el => fadeObserver.observe(el));


// ------------------------------
// Quote carousel logic
// ------------------------------
const track = document.getElementById("quote-track");
const prevBtn = document.getElementById("quote-prev");
const nextBtn = document.getElementById("quote-next");

let currentIndex = 0;

function updateQuotePosition() {
  const cards = track.querySelectorAll(".quote-card");
  if (!cards.length) return;

  const cardWidth = cards[0].getBoundingClientRect().width;

  // gap between cards (1rem = 16px usually but we read it)
  const gap = parseFloat(
    window.getComputedStyle(track).columnGap ||
    window.getComputedStyle(track).gap ||
    "16"
  );

  // move left by index * (cardWidth + gap)
  const offset = -(currentIndex * (cardWidth + gap));
  track.style.transform = `translateX(${offset}px)`;
}

if (prevBtn && nextBtn && track) {
  prevBtn.addEventListener("click", () => {
    const cards = track.querySelectorAll(".quote-card");
    currentIndex = Math.max(0, currentIndex - 1);
    updateQuotePosition();
  });

  nextBtn.addEventListener("click", () => {
    const cards = track.querySelectorAll(".quote-card");
    currentIndex = Math.min(cards.length - 1, currentIndex + 1);
    updateQuotePosition();
  });

  // Initialize
  updateQuotePosition();

  // Recalculate on resize so the math stays correct on mobile/desktop
  window.addEventListener("resize", updateQuotePosition);
}
