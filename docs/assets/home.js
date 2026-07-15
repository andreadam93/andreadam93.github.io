document.querySelectorAll(".area-carousel").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const previous = carousel.querySelector(".carousel-prev");
  const next = carousel.querySelector(".carousel-next");
  const toggle = carousel.querySelector(".carousel-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!track || slides.length < 2 || !previous || !next || !toggle) return;

  let index = 0;
  let timer = null;
  let manuallyPaused = false;
  let interacting = false;
  let mediaPlaying = false;

  const label = carousel.getAttribute("aria-label") || "research image carousel";
  previous.setAttribute("aria-label", "Previous image in " + label);
  next.setAttribute("aria-label", "Next image in " + label);

  const render = () => {
    track.style.transform = "translateX(-" + index * 100 + "%)";
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== index));
    });
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (reduceMotion || manuallyPaused || interacting || mediaPlaying || document.hidden) return;
    timer = window.setInterval(() => {
      index = (index + 1) % slides.length;
      render();
    }, 6500);
  };

  const move = (direction) => {
    index = (index + direction + slides.length) % slides.length;
    render();
    start();
  };

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));

  toggle.addEventListener("click", () => {
    manuallyPaused = !manuallyPaused;
    const action = manuallyPaused ? "Play" : "Pause";
    carousel.classList.toggle("is-paused", manuallyPaused);
    toggle.setAttribute("aria-pressed", String(manuallyPaused));
    toggle.textContent = action;
    toggle.setAttribute("aria-label", action + " " + label);
    manuallyPaused ? stop() : start();
  });

  carousel.addEventListener("mouseenter", () => {
    interacting = true;
    stop();
  });

  carousel.addEventListener("mouseleave", () => {
    interacting = false;
    start();
  });

  carousel.addEventListener("focusin", () => {
    interacting = true;
    stop();
  });

  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      interacting = false;
      start();
    }
  });


  carousel.querySelectorAll("video").forEach((video) => {
    video.addEventListener("play", () => {
      mediaPlaying = true;
      stop();
    });

    const resume = () => {
      mediaPlaying = false;
      start();
    };

    video.addEventListener("pause", resume);
    video.addEventListener("ended", resume);
  });
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  render();
  start();
});