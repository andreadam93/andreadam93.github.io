const guidanceTopicOrder = [
  "pontryagin-neural-networks",
  "bellman-neural-networks",
  "inspection-missions",
  "lunar-landing",
  "asteroid-proximity-operations",
];

const guidanceTopicList = document.querySelector(".research-topic-list");
if (guidanceTopicList && guidanceTopicOrder.every((id) => document.getElementById(id))) {

  guidanceTopicOrder.forEach((id) => {
    const topic = document.getElementById(id);

    guidanceTopicList.append(topic);
  });
}

const asteroidTrack = document.querySelector("#asteroid-proximity-operations .carousel-track");
const asteroidCopy = document.querySelector("#asteroid-proximity-operations .research-topic-copy p:last-of-type");
if (asteroidCopy) {
  asteroidCopy.textContent += " The expanded gallery includes hopping trajectories at Itokawa and Bennu, together with obstacle-avoidance and RRT planning demonstrations.";
}

if (asteroidTrack) {
  const asteroidMedia = [
    {
      type: "image",
      src: "../../images/research/guidance-control/asteroid-proximity/itokawa-trajectory.png",
      alt: "Hopping and obstacle-avoidance trajectory around asteroid Itokawa",
    },
    {
      type: "image",
      src: "../../images/research/guidance-control/asteroid-proximity/bennu-trajectory.png",
      alt: "Hopping and obstacle-avoidance trajectory around asteroid Bennu",
    },
    {
      type: "video",
      src: "../../videos/asteroid-rrt.mp4",
      label: "Collision-aware RRT trajectory planning around an asteroid",
      poster: "../../images/research/guidance-control/asteroid-proximity/bennu-trajectory.png",
    },
    {
      type: "video",
      src: "../../videos/itokawa-hopping.mp4",
      label: "Hopping trajectory demonstration around asteroid Itokawa",
      poster: "../../images/research/guidance-control/asteroid-proximity/itokawa-trajectory.png",
    },
  ];

  asteroidMedia.forEach((media) => {
    const slide = document.createElement("figure");
    slide.className = "carousel-slide" + (media.type === "video" ? " research-video-slide" : "");

    if (media.type === "image") {
      const image = document.createElement("img");
      image.src = media.src;
      image.alt = media.alt;
      image.loading = "lazy";
      image.decoding = "async";
      slide.append(image);
    } else {
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("aria-label", media.label);
      video.poster = media.poster;
      const source = document.createElement("source");
      source.src = media.src;
      source.type = "video/mp4";
      video.append(source);
      slide.append(video);
    }

    asteroidTrack.append(slide);
  });
}

document.querySelectorAll("video").forEach((video) => {
  video.preload = "auto";
  video.setAttribute("controlslist", "nodownload noremoteplayback");
  video.disablePictureInPicture = true;
  video.addEventListener("contextmenu", (event) => event.preventDefault());
});

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
