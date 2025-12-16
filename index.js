const circle = document.querySelector(".circle");
let circleWidth = circle.offsetWidth;
let circleHeight = circle.offsetHeight;
window.addEventListener("resize", () => {
  circleWidth = circle.offsetWidth;
  circleHeight = circle.offsetHeight;
});
let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animate() {
  const offsetX = circleWidth / 2;
  const offsetY = circleHeight / 2;
  const currentLeft = parseFloat(circle.style.left) || 0;
  const currentTop = parseFloat(circle.style.top) || 0;
  const targetLeft = mouseX - offsetX;
  const targetTop = mouseY - offsetY;
  const easeAmount = 0.12;
  
  const newLeft = currentLeft + (targetLeft - currentLeft) * easeAmount;
  const newTop = currentTop + (targetTop - currentTop) * easeAmount;
  
  circle.style.left = newLeft + "px";
  circle.style.top = newTop + "px";
  
  requestAnimationFrame(animate);
}

animate();

// Counting animation for stats(LOOK AT THE ABOUT ME SECTION)
function startCountingAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        const target = parseInt(entry.target.dataset.target);
        let current = 0;
        const increment = target / 50;
        const duration = 2000;
        const startTime = Date.now();

        const count = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          current = Math.floor(target * progress);
          
          entry.target.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(count);
          } else {
            entry.target.textContent = target;
            entry.target.classList.add('counted');
          }
        };

        count();
      }
    });
  }, observerOptions);

  statNumbers.forEach(number => observer.observe(number));
}

// Start counting when page loads(IMPORTANT!!)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startCountingAnimation);
} else {
  startCountingAnimation();

}
