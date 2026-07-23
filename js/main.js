/* ============================================================
   COMMONCENTSS — Site interactions
   Particle hero · 3D tilt · scroll reveal · count-up ·
   live lead feed · FAQ accordion · nav behaviors
   ============================================================ */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Navbar: scroll state + mobile menu ---------- */
  const nav = document.querySelector(".nav");
  const progressBar = document.querySelector(".scroll-progress");
  const toTop = document.querySelector(".to-top");

  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("scrolled", y > 24);
    if (toTop) toTop.classList.toggle("show", y > 600);
    if (progressBar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        toggle.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }

  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" }));
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Count-up numbers ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          co.unobserve(e.target);
          animateCount(e.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => co.observe(el));
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const dur = prefersReduced ? 1 : 1800;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      const val = target * eased;
      el.textContent = prefix + val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 3D tilt (dashboard, media frames, tilt cards) ---------- */
  if (!prefersReduced && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const strength = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener("mousemove", (ev) => {
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${px * strength}deg) rotateX(${py * -strength}deg) translateZ(0)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "rotateY(0deg) rotateX(0deg)";
      });
    });
  }

  /* Cursor-follow glow on cards */
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mousemove", (ev) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", ((ev.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--my", ((ev.clientY - r.top) / r.height) * 100 + "%");
    });
  });

  /* ---------- 3D flip cards (tap support for touch) ---------- */
  document.querySelectorAll(".flip-card").forEach((fc) => {
    fc.addEventListener("click", () => fc.classList.toggle("flipped"));
    fc.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        fc.classList.toggle("flipped");
      }
    });
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // close siblings within same list
      item.parentElement.querySelectorAll(".faq-item.open").forEach((o) => {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
        o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Process timeline fill ---------- */
  const process = document.querySelector(".process");
  if (process) {
    const po = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            process.classList.add("inview");
            po.disconnect();
          }
        });
      },
      { threshold: 0.35 }
    );
    po.observe(process);
  }

  /* ---------- Hero particle network canvas ---------- */
  const canvas = document.getElementById("hero-canvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let W, H, particles, raf;
    const mouse = { x: -9999, y: -9999 };
    const DENSITY = 14000;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = rect.width * devicePixelRatio;
      H = canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      initParticles();
    }

    function initParticles() {
      const count = Math.min(110, Math.floor((W * H) / (DENSITY * devicePixelRatio * devicePixelRatio)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.22 * devicePixelRatio,
        r: (Math.random() * 1.4 + 0.6) * devicePixelRatio,
      }));
    }

    function step() {
      ctx.clearRect(0, 0, W, H);
      const linkDist = 130 * devicePixelRatio;
      const mDist = 170 * devicePixelRatio;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;

        // gentle attraction to cursor
        const dxm = mouse.x * devicePixelRatio - p.x;
        const dym = mouse.y * devicePixelRatio - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < mDist && dm > 1) {
          p.x += (dxm / dm) * 0.25 * devicePixelRatio;
          p.y += (dym / dm) * 0.25 * devicePixelRatio;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(110, 165, 255, 0.55)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(63, 120, 224, ${(1 - d / linkDist) * 0.28})`;
            ctx.lineWidth = devicePixelRatio * 0.7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(step);
    }

    const hero = canvas.parentElement;
    hero.addEventListener("mousemove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

    // pause when hero offscreen
    const ho = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(step); }
        else { cancelAnimationFrame(raf); raf = null; }
      });
    });
    ho.observe(canvas);

    window.addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(step);
  }

  /* ---------- Live lead feed simulation (hero dashboard) ---------- */
  const feed = document.getElementById("lead-feed");
  if (feed) {
    const leads = [
      { ico: "✨", text: "New lead — Botox consult", when: "just now" },
      { ico: "📅", text: "Consultation booked — Filler", when: "just now" },
      { ico: "💬", text: "SMS follow-up sent automatically", when: "just now" },
      { ico: "✨", text: "New lead — Laser treatment", when: "just now" },
      { ico: "📅", text: "Consultation booked — Med spa facial", when: "just now" },
      { ico: "💬", text: "Email sequence started", when: "just now" },
      { ico: "✨", text: "New lead — Body contouring", when: "just now" },
      { ico: "📅", text: "Consultation booked — Skin rejuvenation", when: "just now" },
    ];
    let idx = 0;
    const leadCounter = document.getElementById("dash-leads");
    let leadTotal = leadCounter ? parseInt(leadCounter.dataset.base || "1284", 10) : 0;

    function pushLead() {
      const l = leads[idx % leads.length];
      idx++;
      const el = document.createElement("div");
      el.className = "feed-item";
      el.innerHTML = `<span class="feed-ico">${l.ico}</span><span>${l.text}</span><small>${l.when}</small>`;
      feed.prepend(el);
      // age existing timestamps
      feed.querySelectorAll(".feed-item small").forEach((s, i) => {
        if (i === 0) return;
        s.textContent = i === 1 ? "12s ago" : i === 2 ? "47s ago" : "2m ago";
      });
      while (feed.children.length > 3) feed.removeChild(feed.lastChild);
      if (leadCounter && l.ico === "✨") {
        leadTotal++;
        leadCounter.textContent = leadTotal.toLocaleString("en-US");
      }
    }

    pushLead();
    setTimeout(pushLead, 900);
    setTimeout(pushLead, 1800);
    if (!prefersReduced) setInterval(pushLead, 4200);
  }

  /* ---------- Contact form (mailto handoff) ---------- */
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get("name") || "";
      const practice = data.get("practice") || "";
      const service = data.get("service") || "";
      const message = data.get("message") || "";
      const phone = data.get("phone") || "";
      const subject = encodeURIComponent(`Strategy Call Request — ${practice || name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nPractice: ${practice}\nPhone: ${phone}\nInterested in: ${service}\n\n${message}`
      );
      window.location.href = `mailto:Kumar_g@commoncentss.com?subject=${subject}&body=${body}`;
      const note = document.getElementById("form-note");
      if (note) note.textContent = "Opening your email client… We'll get back to you within 24 hours.";
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
