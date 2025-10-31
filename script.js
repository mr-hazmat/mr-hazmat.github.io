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


// ------------------------------
// Quote carousel with seamless looping
// ------------------------------
const track = document.getElementById("quote-track");
const prevBtn = document.getElementById("quote-prev");
const nextBtn = document.getElementById("quote-next");

let cards;
let cardWidth = 0;
let gapSize = 0;
let currentIndex = 1;
let isTransitioning = false;

function setupCarousel() {
  if (!track) return;

  const originals = Array.from(track.querySelectorAll(".quote-card"));
  if (originals.length === 0) return;

  // prevent duplicate setup
  if (track.dataset.loopReady === "true") return;

  const firstClone = originals[0].cloneNode(true);
  const lastClone = originals[originals.length - 1].cloneNode(true);
  firstClone.setAttribute("data-clone", "first");
  lastClone.setAttribute("data-clone", "last");

  track.insertBefore(lastClone, originals[0]);
  track.appendChild(firstClone);
  track.dataset.loopReady = "true";

  cards = track.querySelectorAll(".quote-card");

  measure();
  jumpToIndex(currentIndex, false);

  // listen once for transitionend
  track.addEventListener("transitionend", handleTransitionEnd);
}

function measure() {
  if (!track) return;
  const firstCard = track.querySelector(".quote-card");
  const styles = window.getComputedStyle(track);
  gapSize = parseFloat(styles.columnGap || styles.gap || "16");
  cardWidth = firstCard.getBoundingClientRect().width;
}

function jumpToIndex(index, animate = true) {
  const viewport = track.parentElement;
  const viewportWidth = viewport.getBoundingClientRect().width;

  let offsetLeft = 0;
  for (let i = 0; i < index; i++) offsetLeft += cardWidth + gapSize;

  const cardCenter = offsetLeft + cardWidth / 2;
  const viewportCenter = viewportWidth / 2;
  const translateX = viewportCenter - cardCenter;

  if (!animate) {
    track.style.transition = "none";
    track.style.transform = `translateX(${translateX}px)`;
    // Force reflow so next transition applies cleanly
    void track.offsetHeight;
    track.style.transition = "transform 0.6s ease-in-out";
  } else {
    track.style.transition = "transform 0.6s ease-in-out";
    track.style.transform = `translateX(${translateX}px)`;
  }
}

function handleTransitionEnd() {
  // hide flicker by snapping instantly while transitions are off
  if (currentIndex === 0) {
    currentIndex = cards.length - 2;
    track.style.transition = "none";
    jumpToIndex(currentIndex, false);
  } else if (currentIndex === cards.length - 1) {
    currentIndex = 1;
    track.style.transition = "none";
    jumpToIndex(currentIndex, false);
  }
  isTransitioning = false;
}

function goNext() {
  if (isTransitioning) return;
  isTransitioning = true;
  currentIndex++;
  jumpToIndex(currentIndex, true);
}

function goPrev() {
  if (isTransitioning) return;
  isTransitioning = true;
  currentIndex--;
  jumpToIndex(currentIndex, true);
}

// Init
if (track && prevBtn && nextBtn) {
  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);
  window.addEventListener("resize", () => {
    measure();
    jumpToIndex(currentIndex, false);
  });
  setupCarousel();
}
