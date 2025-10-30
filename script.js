// Dynamically set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Smooth scroll behavior (in case browser doesn't support CSS scroll-behavior)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth' });
  });
});
