const text = document.getElementById("text-wrap-1");
const backgroundImage = background.querySelector("img");

window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY+200;
  const backgroundHeight = backgroundImage.offsetHeight;
  const textOffsetTop = text.offsetTop+800;

  // Calculate maximum scroll position for parallax effect to end at image bottom:
  const maxScrollPosition = backgroundHeight - window.innerHeight + textOffsetTop;

  // Improved logic for smooth parallax effect and ending condition:
  const parallaxFactor = 0.5;
  let targetTranslation;
  if (scrollPosition < maxScrollPosition) {
    targetTranslation = (scrollPosition - textOffsetTop) * parallaxFactor;
  } else {
    // Fix text position at the bottom when scroll reaches maxScrollPosition:
    targetTranslation = (maxScrollPosition - textOffsetTop) * parallaxFactor;
  }

  // Smoothly transition using requestAnimationFrame (optional):
  let lastTranslation = 0;
  const animate = () => {
    lastTranslation = lerp(lastTranslation, targetTranslation, 0.1);
    text.style.transform = `translateY(${lastTranslation}px)`;
    requestAnimationFrame(animate);
  };

  // Initial animation or basic approach (remove animate() call if using requestAnimationFrame):
  text.style.transform = `translateY(${targetTranslation}px)`;
  // animate(); // Uncomment for smoother animation
});

// Linear interpolation function (optional, for smoother animation):
function lerp(start, end, amount) {
  return (end - start) * amount + start;
}
