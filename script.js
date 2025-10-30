// dynamic year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// hide / show header on scroll
let lastScrollY = window.scrollY;
const header = document.getElementById("site-header");

window.addEventListener("scroll", () => {
  const currentY = window.scrollY;

  if (currentY > lastScrollY && currentY > 80) {
    // scrolling down
    header.classList.add("hidden");
  } else {
    // scrolling up
    header.classList.remove("hidden");
  }

  lastScrollY = currentY;
});
