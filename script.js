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


// ------------------------------
// Stable fade-in animations (no flicker)
// ------------------------------

// All sections with fade effect
const fadeSections = document.querySelectorAll(".fade-section");

const fadeObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      const el = entry.target;
      // Add when 30% visible; remove only if <10% visible
      if (entry.intersectionRatio > 0.3) {
        el.classList.add("is-visible");
      } else if (entry.intersectionRatio < 0.1) {
        el.classList.remove("is-visible");
      }
    });
  },
  {
    threshold: [0, 0.1, 0.3, 0.6, 1],
  }
);

fadeSections.forEach(el => fadeObserver.observe(el));


// Quotes boxes (independent staggered fade)
const quoteBoxes = document.querySelectorAll(".quote-box");

const quoteObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      const el = entry.target;
      // Add when 40% visible; remove only if <20% visible
      if (entry.intersectionRatio > 0.4) {
        el.classList.add("visible");
      } else if (entry.intersectionRatio < 0.2) {
        el.classList.remove("visible");
      }
    });
  },
  {
    threshold: [0, 0.2, 0.4, 0.6, 1],
  }
);

quoteBoxes.forEach(box => quoteObserver.observe(box));
// ------------------------------
// Contact Form "Sending..." state
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form-horizontal");
  if (!form) return; // only run on contact page

  const submitBtn = form.querySelector("#submitBtn");

  form.addEventListener("submit", () => {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      submitBtn.style.opacity = "0.7";
      submitBtn.style.cursor = "not-allowed";
    }
  });
});
// ------------------------------
// Contact Form "Sending..." spinner + state
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form-horizontal");
  if (!form) return; // only run on contact page

  const submitBtn = form.querySelector("#submitBtn");
  const btnText = form.querySelector("#btnText");
  const spinner = form.querySelector("#spinner");

  form.addEventListener("submit", () => {
    if (submitBtn && btnText && spinner) {
      submitBtn.classList.add("sending");
      btnText.textContent = "Sending...";
      submitBtn.disabled = true;
      submitBtn.style.cursor = "not-allowed";
    }
  });
});
// ------------------------------
// Free-plan Formspree submission + redirect (fixed)
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const submitBtn = document.getElementById("submitBtn");
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Disable + show spinner
    submitBtn.classList.add("sending");
    btnText.textContent = "Sending...";
    submitBtn.disabled = true;

    // Collect data using FormData (for Formspree compatibility)
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mblppqzl", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      });

      if (response.ok) {
        // ✅ Success: redirect to custom thank-you page
        window.location.href = "thankyou.html";
      } else {
        // ❌ Formspree returned an error (e.g. missing fields)
        const data = await response.json();
        console.error("Formspree error:", data);
        alert(
          data.error || "There was a problem sending your message. Please try again later."
        );
        submitBtn.disabled = false;
        btnText.textContent = "Send Message";
        submitBtn.classList.remove("sending");
      }
    } catch (err) {
      console.error("Network or CORS error:", err);
      alert("Network error. Please try again later.");
      submitBtn.disabled = false;
      btnText.textContent = "Send Message";
      submitBtn.classList.remove("sending");
    }
  });
});
