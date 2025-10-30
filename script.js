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
// Quote carousel with looping
// ------------------------------
const track = document.getElementById("quote-track");
const prevBtn = document.getElementById("quote-prev");
const nextBtn = document.getElementById("quote-next");

let cards;            // NodeList after cloning
let cardWidth = 0;    // width in px of each card (incl. gap logic)
let gapSize = 0;      // px gap between cards
let currentIndex = 1; // start at 1 because index 0 will be clone of "last real"
let isTransitioning = false;

// 1) Setup: clone first and last real cards to fake infinite wrap
function setupCarousel() {
  if (!track) return;

  const originalCards = Array.from(track.querySelectorAll(".quote-card"));
  if (originalCards.length === 0) return;

  // If we've already set it up once, don't set up again
  if (track.dataset.loopReady === "true") {
    cards = track.querySelectorAll(".quote-card");
    measure();
    jumpToIndex(currentIndex, false);
    return;
  }

  const firstClone = originalCards[0].cloneNode(true);
  const lastClone = originalCards[originalCards.length - 1].cloneNode(true);

  // Add identifying data attributes (optional, for debugging)
  firstClone.setAttribute("data-clone", "first");
  lastClone.setAttribute("data-clone", "last");

  // Prepend lastClone, append firstClone
  track.insertBefore(lastClone, originalCards[0]);
  track.appendChild(firstClone);

  track.dataset.loopReady = "true";

  cards = track.querySelectorAll(".quote-card");

  measure();

  // Position so that the first "real" slide is centered
  jumpToIndex(currentIndex, false);

  // Listen for transitionend to handle wrap-around snapping
  track.addEventListener("transitionend", handleTransitionEnd);
}

// measure card width + gap
function measure() {
  const firstCard = cards[0];
  const styles = window.getComputedStyle(track);

  // gap between cards (track has gap: 2rem or 1.5rem mobile)
  gapSize = parseFloat(styles.columnGap || styles.gap || "16");

  cardWidth = firstCard.getBoundingClientRect().width;
}

// center the card at given index
function jumpToIndex(index, animate = true) {
  // index is into "cards" (which includes clones now)

  // we want the chosen card to sit in the horizontal center.
  // We'll translate track so that card[index] is centered in the viewport.
  const viewport = track.parentElement; // .quote-track-viewport
  const viewportWidth = viewport.getBoundingClientRect().width;

  // distance from left edge of track to the card's left edge
  let offsetLeft = 0;
  for (let i = 0; i < index; i++) {
    offsetLeft += cardWidth + gapSize;
  }

  // position so card center aligns with viewport center
  const cardCenterOffset = offsetLeft + cardWidth / 2;
  const viewportCenter = viewportWidth / 2;

  const translateX = viewportCenter - cardCenterOffset;

  if (!animate) {
    track.style.transition = "none";
  } else {
    track.style.transition = "transform 0.5s ease-in-out"; // slower slide
  }

  track.style.transform = `translateX(${translateX}px)`;

  if (!animate) {
    // force browser to flush style so next transition works
    // eslint-disable-next-line no-unused-expressions
    track.offsetHeight;
    track.style.transition = "transform 0.5s ease-in-out";
  }
}

// after slide finishes, if we're on a clone, snap to the real slide
function handleTransitionEnd() {
  if (!track) return;
  if (!cards || cards.length < 3) return;

  // if we're showing the "fake lastClone" at index 0, snap to real last
  if (currentIndex === 0) {
    currentIndex = cards.length - 2; // last real card index
    jumpToIndex(currentIndex, false);
  }

  // if we're showing the "fake firstClone" at last index, snap to real first
  if (currentIndex === cards.length - 1) {
    currentIndex = 1; // first real card index
    jumpToIndex(currentIndex, false);
  }

  isTransitioning = false;
}

// nav click handlers
function goNext() {
  if (isTransitioning || !cards) return;
  isTransitioning = true;
  currentIndex += 1;
  jumpToIndex(currentIndex, true);
}

function goPrev() {
  if (isTransitioning || !cards) return;
  isTransitioning = true;
  currentIndex -= 1;
  jumpToIndex(currentIndex, true);
}

// set up listeners
if (track && prevBtn && nextBtn) {
  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);

  // on resize: re-measure and re-center
  window.addEventListener("resize", () => {
    measure();
    jumpToIndex(currentIndex, false);
  });

  // initial setup
  setupCarousel();
}
