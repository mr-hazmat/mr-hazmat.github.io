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
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + window.scrollY - 60;
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

// Smooth Infinite Carousel
const track = document.querySelector(".carousel-track");
if (track) {
  const slides = Array.from(track.children);
  const nextBtn = document.querySelector(".carousel-btn.next");
  const prevBtn = document.querySelector(".carousel-btn.prev");

  const firstClone = slides[0].cloneNode(true);
  const lastClone = slides[slides.length - 1].cloneNode(true);
  firstClone.dataset.clone = "first";
  lastClone.dataset.clone = "last";
  track.appendChild(firstClone);
  track.insertBefore(lastClone, slides[0]);

  const allSlides = Array.from(track.children);
  let currentIndex = 1;
  let isAnimating = false;
  let slideWidth = allSlides[0].getBoundingClientRect().width;

  track.style.transform = `translateX(-${slideWidth}px)`;
  allSlides[1].classList.add("active");

  function moveTo(index) {
    if (isAnimating) return;
    isAnimating = true;
    allSlides.forEach(s => s.classList.remove("active"));
    allSlides[index].classList.add("active");
    track.style.transition = "transform 1.4s cubic-bezier(0.4, 0, 0.2, 1)";
    track.style.transform = `translateX(-${slideWidth * index}px)`;
  }

  track.addEventListener("transitionend", () => {
    const currentSlide = allSlides[currentIndex];
    if (currentSlide.dataset.clone === "last") {
      track.style.transition = "none";
      currentIndex = slides.length;
      track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    }
    if (currentSlide.dataset.clone === "first") {
      track.style.transition = "none";
      currentIndex = 1;
      track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
    }
    isAnimating = false;
  });

  nextBtn.addEventListener("click", () => {
    if (isAnimating) return;
    currentIndex++;
    moveTo(currentIndex);
  });

  prevBtn.addEventListener("click", () => {
    if (isAnimating) return;
    currentIndex--;
    moveTo(currentIndex);
  });

  window.addEventListener("resize", () => {
    slideWidth = allSlides[0].getBoundingClientRect().width;
    track.style.transition = "none";
    track.style.transform = `translateX(-${slideWidth * currentIndex}px)`;
  });
}
