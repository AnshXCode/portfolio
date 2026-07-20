(function () {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const yearEl = document.getElementById("year");
  const canvas = document.getElementById("fx-canvas");
  const cursor = document.querySelector(".cursor");
  const cursorRing = document.querySelector(".cursor-ring");
  const progressBar = document.querySelector(".scroll-progress span");
  const hero = document.querySelector(".hero");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function scrollToTop(smooth) {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth && !reduceMotion ? "smooth" : "auto",
    });
  }

  document.querySelectorAll('a[href="#top"], [data-scroll-top]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      scrollToTop(true);
      if (history.replaceState) {
        history.replaceState(null, "", "#top");
      }
    });
  });

  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);

    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (y / max) * 100 : 0;
      progressBar.style.width = pct + "%";
    }

    document.querySelectorAll(".nav a[href^='#']").forEach(function (link) {
      const id = link.getAttribute("href").slice(1);
      const section = document.getElementById(id);
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const active = rect.top <= 120 && rect.bottom >= 160;
      link.classList.toggle("is-active", active);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", function () {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      menuToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
      if (open) mobileNav.setAttribute("hidden", "");
      else mobileNav.removeAttribute("hidden");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        mobileNav.setAttribute("hidden", "");
      });
    });
  }

  if (reduceMotion) {
    document.querySelectorAll(".reveal, .reveal-line").forEach(function (el) {
      el.classList.add("is-visible");
    });
    if (hero) hero.classList.add("is-ready");
    document.querySelectorAll(".metric").forEach(function (metric) {
      const el = metric.querySelector(".count");
      if (el) el.textContent = metric.dataset.count || "0";
    });
    return;
  }

  /* Hero name slide-up */
  requestAnimationFrame(function () {
    if (hero) hero.classList.add("is-ready");
    document.querySelectorAll(".reveal-line").forEach(function (el) {
      el.classList.add("is-visible");
    });
    setTimeout(function () {
      document.querySelectorAll(".hero-name .line").forEach(function (line) {
        line.style.overflow = "visible";
      });
    }, 1200);
  });

  /* Reveal on scroll */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -48px 0px" }
    );
    reveals.forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index % 5, 4) * 80 + "ms";
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Count-up */
  const metrics = document.querySelectorAll(".metric");
  const metricObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        metricObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.45 }
  );
  metrics.forEach(function (m) {
    metricObserver.observe(m);
  });

  function animateCount(metric) {
    const el = metric.querySelector(".count");
    if (!el) return;
    const target = parseFloat(metric.dataset.count || "0");
    const decimals = parseInt(metric.dataset.decimals || "0", 10);
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const value = target * eased;
      el.textContent = decimals ? value.toFixed(decimals) : String(Math.round(value));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Cursor + spotlight + magnetic */
  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;

  window.addEventListener(
    "pointermove",
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      document.documentElement.style.setProperty("--mx", mx + "px");
      document.documentElement.style.setProperty("--my", my + "px");
    },
    { passive: true }
  );

  if (canHover && cursor && cursorRing) {
    document.body.classList.add("has-cursor");

    window.addEventListener(
      "pointermove",
      function (e) {
        const x = e.clientX;
        const y = e.clientY;
        cursor.style.transform = "translate(" + x + "px," + y + "px)";
        cursorRing.style.transform = "translate(" + x + "px," + y + "px)";
      },
      { passive: true }
    );

    document.addEventListener("pointerdown", function () {
      document.body.classList.add("cursor-click");
    });
    document.addEventListener("pointerup", function () {
      document.body.classList.remove("cursor-click");
    });

    document.querySelectorAll("a, button, .process-item, .metric, .skill-tags li, .edu-block").forEach(function (el) {
      el.addEventListener("pointerenter", function () {
        document.body.classList.add("cursor-hover");
      });
      el.addEventListener("pointerleave", function () {
        document.body.classList.remove("cursor-hover");
      });
    });

    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + x * 0.1 + "px," + y * 0.12 + "px)";
      });
      btn.addEventListener("pointerleave", function () {
        btn.style.transform = "";
      });
    });

    document.querySelectorAll(".tilt-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const tiltX = (0.5 - y) * 8;
        const tiltY = (x - 0.5) * 10;
        card.style.transform = "perspective(1000px) rotateX(" + tiltX + "deg) rotateY(" + tiltY + "deg)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* Name scramble on hover */
  const scrambleRoot = document.querySelector("[data-scramble]");
  if (scrambleRoot) {
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#*<>/";
    scrambleRoot.querySelectorAll(".word").forEach(function (word) {
      const original = word.textContent;
      let timer = null;

      word.addEventListener("pointerenter", function () {
        let frame = 0;
        word.classList.add("is-scrambling");
        clearInterval(timer);
        timer = setInterval(function () {
          word.textContent = original
            .split("")
            .map(function (ch, i) {
              if (ch === " ") return " ";
              if (i < frame / 2) return original[i];
              return glyphs[Math.floor(Math.random() * glyphs.length)];
            })
            .join("");
          frame += 1;
          if (frame > original.length * 2) {
            clearInterval(timer);
            word.textContent = original;
            word.classList.remove("is-scrambling");
          }
        }, 28);
      });

      word.addEventListener("pointerleave", function () {
        clearInterval(timer);
        word.textContent = original;
        word.classList.remove("is-scrambling");
      });
    });
  }

  /* Green binary rain (0 / 1) */
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let columns = [];
    let fontSize = 16;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      fontSize = w < 720 ? 13 : 16;
      const colCount = Math.floor(w / fontSize);
      columns = new Array(colCount).fill(0).map(function () {
        return {
          y: Math.random() * -80,
          speed: 0.35 + Math.random() * 0.85,
          trail: 8 + Math.floor(Math.random() * 16),
        };
      });
    }

    function tick() {
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;

      // stronger fade so rain stays atmospheric, not loud
      ctx.fillStyle = "rgba(5, 5, 5, 0.14)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = fontSize + "px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "center";

      for (let i = 0; i < columns.length; i++) {
        const col = columns[i];
        const x = i * fontSize + fontSize / 2;

        for (let t = 0; t < col.trail; t++) {
          const gy = (col.y - t) * fontSize;
          if (gy < -fontSize || gy > h + fontSize) continue;

          const bit = Math.random() > 0.5 ? "1" : "0";
          const head = t === 0;
          const alpha = head ? 0.95 : Math.max(0.06, 0.5 - t * 0.032);

          if (head) {
            ctx.fillStyle = "rgba(180, 255, 180," + alpha + ")";
            ctx.shadowColor = "rgba(0, 255, 70, 0.55)";
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = "rgba(0, 220, 70," + alpha + ")";
            ctx.shadowBlur = 0;
          }

          ctx.fillText(bit, x, gy);
        }

        col.y += col.speed;

        if (col.y * fontSize > h + col.trail * fontSize) {
          col.y = Math.random() * -40;
          col.speed = 0.35 + Math.random() * 0.85;
          col.trail = 8 + Math.floor(Math.random() * 16);
        }
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(tick);
    }

    resize();
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
    tick();
    window.addEventListener("resize", resize);
  }
})();
