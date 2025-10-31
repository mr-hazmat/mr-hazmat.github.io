// Footer Year
document.getElementById("year").textContent = new Date().getFullYear();

// Hide Header on Scroll
let lastScrollY = window.scrollY;
const header = document.getElementById("site-header");
window.addEventListener("scroll", () => {
  const currentY = window.scrollY;
  if (currentY > lastScrollY && currentY > 80) header.classList.add("hidden");
  else header.classList.remove("hidden");
  lastScrollY = currentY;
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", e => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
});

// Fade-in on Scroll
const faders = document.querySelectorAll(".fade-section");
const obs = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
faders.forEach(el => obs.observe(el));
