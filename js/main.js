/* ============================================================
   COMMONCENTSS — Site interactions (v2 premium)
   Particle hero · aurora + cursor spotlight · magnetic buttons ·
   3D tilt with glare · scroll-linked stacking cards · horizontal
   process timeline · parallax · odometer counters · scroll reveal ·
   live lead feed · FAQ accordion · nav behaviors
   All effects use translate3d/scale/opacity only.
   ============================================================ */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Ambient layers: aurora gradient + cursor spotlight ---------- */
  const aurora = document.createElement("div");
  aurora.className = "aurora";
  aurora.setAttribute("aria-hidden", "true");
  aurora.innerHTML = "<span></span><span></span><span></span>";
  document.body.prepend(aurora);

  let spot = null;
  if (finePointer && !prefersReduced) {
    spot = document.createElement("div");
    spot.className = "spotlight";
    spot.setAttribute("aria-hidden", "true");
    document.body.appendChild(spot);
    let sx = -9999, sy = -9999, shown = false, spotRaf = null;
    window.addEventListener("mousemove", (e) => {
      sx = e.clientX; sy = e.clientY;
      if (!shown) { spot.style.opacity = "1"; shown = true; }
      if (!spotRaf) spotRaf = requestAnimationFrame(() => {
        spot.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
        spotRaf = null;
      });
    }, { passive: true });
  }

  /* ---------- Navbar: scroll state + mobile menu ---------- */
  const nav = document.querySelector(".nav");
  const progressBar = document.querySelector(".scroll-progress");
  const toTop = document.querySelector(".to-top");

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

  /* ---------- Odometer-style counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          co.unobserve(e.target);
          runOdometer(e.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => co.observe(el));
  }

  function runOdometer(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const final = prefix + target.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;

    if (prefersReduced) { el.textContent = final; return; }

    el.textContent = "";
    el.classList.add("odo");
    const reels = [];
    [...final].forEach((ch) => {
      if (/\d/.test(ch)) {
        const reel = document.createElement("span");
        reel.className = "odo-reel";
        const col = document.createElement("span");
        col.className = "odo-col";
        for (let d = 0; d <= 9; d++) {
          const s = document.createElement("span");
          s.textContent = d;
          col.appendChild(s);
        }
        reel.appendChild(col);
        el.appendChild(reel);
        reels.push({ col, digit: +ch });
      } else {
        const s = document.createElement("span");
        s.className = "odo-char";
        s.textContent = ch;
        el.appendChild(s);
      }
    });
    // roll each digit reel to its target with a stagger
    requestAnimationFrame(() => requestAnimationFrame(() => {
      reels.forEach((r, i) => {
        r.col.style.transitionDelay = (i * 90) + "ms";
        r.col.style.transform = `translate3d(0, ${-r.digit}em, 0)`;
      });
    }));
  }

  /* ---------- 3D tilt with glare (dashboard, media frames) ---------- */
  if (!prefersReduced && finePointer) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const strength = parseFloat(el.dataset.tilt) || 8;
      el.addEventListener("mousemove", (ev) => {
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${py * -strength}deg) translate3d(0,0,0)`;
        el.style.setProperty("--gx", ((px + 0.5) * 100) + "%");
        el.style.setProperty("--gy", ((py + 0.5) * 100) + "%");
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
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

  /* ---------- Magnetic buttons ---------- */
  if (!prefersReduced && finePointer) {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.classList.add("magnetic");
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate3d(${x * 0.22}px, ${y * 0.32}px, 0)`;
      });
      btn.addEventListener("mouseleave", () => { btn.style.transform = ""; });
    });
  }

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

  /* ============================================================
     Unified scroll-linked frame: progress bar · nav state ·
     horizontal process timeline · stacking cards · parallax
     ============================================================ */
  const hscroll = document.querySelector(".hscroll");
  const hsTrack = hscroll ? hscroll.querySelector(".hscroll-track") : null;
  const hsFill = hscroll ? hscroll.querySelector(".process-line-fill") : null;
  const stackCards = Array.from(document.querySelectorAll(".stack-card"));
  const plxEls = Array.from(document.querySelectorAll("[data-plx]"));
  const desktop = () => window.matchMedia("(min-width: 761px)").matches;

  let ticking = false;

  function onFrame() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;

    if (nav) nav.classList.toggle("scrolled", y > 24);
    if (toTop) toTop.classList.toggle("show", y > 600);
    if (progressBar) {
      const h = document.documentElement.scrollHeight - vh;
      progressBar.style.transform = `scaleX(${h > 0 ? clamp(y / h, 0, 1) : 0})`;
    }

    if (prefersReduced) return;

    // Horizontal process timeline
    if (hscroll && hsTrack && desktop()) {
      const r = hscroll.getBoundingClientRect();
      const total = r.height - vh;
      if (total > 0) {
        const p = clamp(-r.top / total, 0, 1);
        const max = Math.max(0, hsTrack.scrollWidth - hscroll.clientWidth);
        hsTrack.style.transform = `translate3d(${-p * max}px, 0, 0)`;
        if (hsFill) hsFill.style.transform = `scaleX(${p})`;
      }
    }

    // Stacking service cards: earlier cards recede as the next covers them
    if (stackCards.length && desktop()) {
      for (let i = 0; i < stackCards.length - 1; i++) {
        const card = stackCards[i];
        const next = stackCards[i + 1];
        const stickTop = parseFloat(getComputedStyle(card).top) || 100;
        const nr = next.getBoundingClientRect();
        const p = clamp(1 - (nr.top - stickTop) / (vh * 0.6), 0, 1);
        card.style.transform = `translate3d(0, ${-p * 14}px, 0) scale(${1 - p * 0.05})`;
        card.style.opacity = String(1 - p * 0.35);
      }
    }

    // Parallax layers
    for (const el of plxEls) {
      const speed = parseFloat(el.dataset.plx) || 0.2;
      const host = el.closest(".media-frame") || el;
      const r = host.getBoundingClientRect();
      const offset = (r.top + r.height / 2 - vh / 2) * speed;
      if (el.classList.contains("plx-img")) {
        el.style.transform = `translate3d(0, ${clamp(offset, -26, 26)}px, 0) scale(1.18)`;
      } else {
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
    }
  }

  function requestFrame() {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }
  window.addEventListener("scroll", requestFrame, { passive: true });
  window.addEventListener("resize", requestFrame);
  requestFrame();

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

    let feedStarted = false;
    function startFeed() {
      if (feedStarted) return;
      feedStarted = true;
      // If the hero entrance seeded rows, keep them and just continue the
      // live simulation; otherwise prime the panel with a first row.
      if (!feed.querySelector(".feed-item")) pushLead();
      setTimeout(pushLead, 900);
      setTimeout(pushLead, 1800);
      if (!prefersReduced) setInterval(pushLead, 4200);
    }

    // Hand feed control to the hero entrance if it's running; it calls back
    // via __ccStartFeed once the panel has landed. Otherwise start now.
    if (window.__ccHeroIntro) {
      window.__ccStartFeed = startFeed;
    } else {
      startFeed();
    }
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
