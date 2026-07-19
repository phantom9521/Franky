(() => {
  const config = window.BIRTHDAY_CONFIG || BIRTHDAY_CONFIG;

  const $ = (selector) => document.querySelector(selector);

  const welcomeScreen = $("#welcomeScreen");
  const mainContent = $("#mainContent");
  const openButton = $("#openButton");
  const musicButton = $("#musicButton");
  const audio = $("#backgroundMusic");

  let currentSlide = 0;
  let slideTimer;
  let musicPlaying = false;

  function applyTheme() {
    document.documentElement.style.setProperty("--primary", config.theme.primary);
    document.documentElement.style.setProperty("--secondary", config.theme.secondary);
    document.documentElement.style.setProperty("--accent", config.theme.accent);
  }

  function setTextContent() {
    document.title = config.pageTitle || `Happy Birthday, ${config.friendName}!`;

    ["#welcomeName", "#heroName", "#messageName", "#finalName"].forEach((id) => {
      const element = $(id);
      if (element) element.textContent = config.friendName;
    });

    $("#heroSubtitle").textContent = config.heroSubtitle;
    $("#personalMessage").textContent = config.personalMessage;
    $("#signature").textContent = `— ${config.fromName}`;
    $("#finalMessage").textContent = config.finalMessage;
    $("#footerText").textContent = config.footerText;
  }

  function buildGallery() {
    const container = $("#slidesContainer");
    const dotsContainer = $("#slideDots");

    container.innerHTML = "";
    dotsContainer.innerHTML = "";

    const photos = config.photos && config.photos.length
      ? config.photos
      : [{ file: "", caption: "Add your favourite photo here." }];

    photos.forEach((photo, index) => {
      const slide = document.createElement("div");
      slide.className = `slide${index === 0 ? " active" : ""}`;

      const image = document.createElement("img");
      image.src = photo.file;
      image.alt = `${config.friendName} memory ${index + 1}`;
      image.loading = index === 0 ? "eager" : "lazy";

      const placeholder = document.createElement("div");
      placeholder.className = "photo-placeholder";
      placeholder.innerHTML = `
        <div>
          <span>📷</span>
          <strong>Photo ${index + 1} goes here</strong>
          <small>Add a file named <b>${photo.file.split("/").pop() || "photo.jpg"}</b> inside the photos folder.</small>
        </div>
      `;

      image.addEventListener("error", () => {
        image.remove();
        if (!slide.contains(placeholder)) {
          slide.prepend(placeholder);
        }
      });

      const caption = document.createElement("div");
      caption.className = "slide-caption";
      caption.textContent = photo.caption || "";

      slide.append(image, caption);
      container.appendChild(slide);

      const dot = document.createElement("button");
      dot.className = `slide-dot${index === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Go to photo ${index + 1}`);
      dot.addEventListener("click", () => showSlide(index));
      dotsContainer.appendChild(dot);
    });
  }

  function showSlide(index) {
    const slides = [...document.querySelectorAll(".slide")];
    const dots = [...document.querySelectorAll(".slide-dot")];

    if (!slides.length) return;

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => slide.classList.toggle("active", i === currentSlide));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === currentSlide));

    restartSlideshow();
  }

  function restartSlideshow() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => showSlide(currentSlide + 1), 5000);
  }

  function buildWishes() {
    const grid = $("#wishCards");
    grid.innerHTML = "";

    config.wishes.forEach((wish) => {
      const card = document.createElement("article");
      card.className = "wish-card glass";
      card.innerHTML = `
        <div class="wish-icon">${wish.icon}</div>
        <h3>${wish.title}</h3>
        <p>${wish.text}</p>
      `;
      grid.appendChild(card);
    });
  }

  function buildFloatingShapes() {
    const holder = $(".floating-shapes");
    const icons = ["♡", "✦", "✧", "●", "♥"];

    for (let i = 0; i < 25; i += 1) {
      const shape = document.createElement("span");
      shape.className = "float-shape";
      shape.textContent = icons[Math.floor(Math.random() * icons.length)];
      shape.style.left = `${Math.random() * 100}%`;
      shape.style.fontSize = `${12 + Math.random() * 22}px`;
      shape.style.animationDuration = `${10 + Math.random() * 13}s`;
      shape.style.animationDelay = `${-Math.random() * 20}s`;
      holder.appendChild(shape);
    }
  }

  async function startMusic() {
    if (!config.songFile) return;

    audio.src = config.songFile;

    try {
      await audio.play();
      musicPlaying = true;
      musicButton.textContent = "❚❚ Pause Music";
    } catch (error) {
      musicPlaying = false;
      musicButton.textContent = "♫ Play Music";
    }
  }

  function toggleMusic() {
    if (!audio.src) audio.src = config.songFile;

    if (musicPlaying) {
      audio.pause();
      musicPlaying = false;
      musicButton.textContent = "♫ Play Music";
    } else {
      startMusic();
    }
  }

  audio.addEventListener("error", () => {
    musicPlaying = false;
    musicButton.textContent = "♫ Add Song";
    musicButton.title = "Add birthday-song.mp3 inside assets/music/";
  });

  openButton.addEventListener("click", () => {
    welcomeScreen.classList.add("fade-out");
    mainContent.classList.remove("hidden");
    document.body.style.overflow = "";
    startMusic();
    launchConfetti(220);

    setTimeout(() => {
      welcomeScreen.style.display = "none";
    }, 900);
  });

  musicButton.addEventListener("click", toggleMusic);
  $("#prevSlide").addEventListener("click", () => showSlide(currentSlide - 1));
  $("#nextSlide").addEventListener("click", () => showSlide(currentSlide + 1));
  $("#celebrateButton").addEventListener("click", () => launchConfetti(180));
  $("#finalConfettiButton").addEventListener("click", () => launchConfetti(320));

  applyTheme();
  setTextContent();
  buildGallery();
  buildWishes();
  buildFloatingShapes();
  restartSlideshow();

  // ---------------- CONFETTI ----------------
  const canvas = $("#confettiCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];
  let animationFrame;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function launchConfetti(count = 180) {
    const colours = [
      config.theme.primary,
      config.theme.secondary,
      config.theme.accent,
      "#ffffff",
      "#7cf7d4",
      "#ff9f1c"
    ];

    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 180,
        y: window.innerHeight * 0.25,
        width: 5 + Math.random() * 7,
        height: 8 + Math.random() * 10,
        colour: colours[Math.floor(Math.random() * colours.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: -5 - Math.random() * 9,
        gravity: 0.18 + Math.random() * 0.13,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        life: 160 + Math.random() * 80
      });
    }

    if (!animationFrame) animateConfetti();
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.995;
      p.rotation += p.rotationSpeed;
      p.life -= 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.colour;
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.restore();
    });

    particles = particles.filter(
      (p) => p.life > 0 && p.y < window.innerHeight + 50
    );

    if (particles.length) {
      animationFrame = requestAnimationFrame(animateConfetti);
    } else {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
})();
