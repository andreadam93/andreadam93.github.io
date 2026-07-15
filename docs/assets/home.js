document.querySelectorAll(".area-carousel").forEach((carousel) => {
  const toggle = carousel.querySelector(".carousel-toggle");

  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const paused = carousel.classList.toggle("is-paused");
    const action = paused ? "Play" : "Pause";
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = action;
    toggle.setAttribute("aria-label", action + " " + carousel.getAttribute("aria-label"));
  });
});