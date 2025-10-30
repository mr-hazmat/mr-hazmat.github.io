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
// Smooth scrolling for anchor links
// ------------------------------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const targetID = this.getAttribute("href");
    const targetEl = document.querySelector(targetID);

    // Only apply if target element exists on the page
    if (targetEl) {
      e.preventDefault();

      // Smooth scroll to target
      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      // Optionally close any mobile nav menus (if you add one later)
      // Example: document.querySelector(".mobile-nav").classList.remove("open");
    }
  });
});
