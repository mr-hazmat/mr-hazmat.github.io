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
function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}

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

// capture clicks on in-page links for smooth scroll
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
// Fade-in on scroll
// ------------------------------
const faders = document.querySelectorAll(".fade-section");

const fadeObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

faders.forEach(el => fadeObserver.observe(el));
/// ------------------------------
// Perfect seamless quote carousel (no snap, no jump, no flicker)
// ------------------------------
const track = document.getElementById("quote-track");
const prevBtn = document.getElementById("quote-prev");
const nextBtn = document.getElementById("quote-next");

let cardWidth = 0;
let gapSize = 0;
let isTransitioning = false;

function measure() {
  const firstCard = track.querySelector(".quote-card");
  const styles = window.getComputedStyle(track);
  gapSize = parseFloat(styles.columnGap || styles.gap || "16");
  cardWidth = firstCard.getBoundingClientRect().width;
}

function moveNext() {
  if (isTransitioning) return;
  isTransitioning = true;

  const moveAmount = cardWidth + gapSize;
  track.style.transition = "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
  track.style.transform = `translateX(${-moveAmount}px)`;

  track.addEventListener(
    "transitionend",
    () => {
      track.style.transition = "none";
      // Move first slide to end (so visually nothing changes)
      track.appendChild(track.firstElementChild);
      track.style.transform = "translateX(0)";
      void track.offsetHeight;
      isTransitioning = false;
    },
    { once: true }
  );
}

function movePrev() {
  if (isTransitioning) return;
  isTransitioning = true;

  const moveAmount = cardWidth + gapSize;
  // Instantly move last slide to front before animating
  track.style.transition = "none";
  track.insertBefore(track.lastElementChild, track.firstElementChild);
  track.style.transform = `translateX(${-moveAmount}px)`;
  void track.offsetHeight; // reflow before transition starts
  track.style.transition = "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
  track.style.transform = "translateX(0)";

  track.addEventListener(
    "transitionend",
    () => {
      track.style.transition = "none";
      isTransitioning = false;
    },
    { once: true }
  );
}

if (track && prevBtn && nextBtn) {
  measure();
  window.addEventListener("resize", measure);
  nextBtn.addEventListener("click", moveNext);
  prevBtn.addEventListener("click", movePrev);
}
