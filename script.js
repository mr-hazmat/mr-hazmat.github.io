// ------------------------------
// Dynamic footer year
// ------------------------------
document.getElementById("year").textContent = new Date().getFullYear();


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
// Custom smooth scroll for in-page links
// ------------------------------

// Ease function (easeInOutQuad)
function easeInOutQuad(t) {
  return t < 0.5
    ? 2 * t * t
    : -1 + (4 - 2 * t) * t;
}

// Smooth scroll animation
function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const distanceY = targetY - startY;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / duration, 1); // clamp [0,1]
    const eased = easeInOutQuad(t);
    window.scrollTo(0, startY + distanceY * eased);

    if (elapsed < duration) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Attach to all internal hash links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const targetID = this.getAttribute("href");

    // ignore empty "#" links (like href="#")
    if (!targetID || targetID === "#") return;

    const targetEl = document.querySelector(targetID);
    if (!targetEl) return;

    // stop the default instant jump
    e.preventDefault();

    // how far from the top the element is
    const rect = targetEl.getBoundingClientRect();
    const absoluteY = rect.top + window.scrollY;

    // adjust for sticky header height so the section title isn't hidden
    const headerHeight = header.offsetHeight || 0;
    const finalY = absoluteY - headerHeight - 8; // small padding

    // do the smooth scroll (400ms feels snappy but smooth)
    smoothScrollTo(finalY, 400);
  });
});
