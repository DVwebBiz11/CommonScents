/* ============================================================
   COMMONCENTSS — Hero entrance choreography
   Everything converges inward on load. Web Animations API only
   (no libraries). All motion is transform/opacity. Under 1.8s.
   Layout, copy, spacing, and final resting positions are unchanged
   — this is pure entrance choreography layered on top.
   ============================================================ */

/* Tell main.js to hold the live-feed simulation until the entrance
   is done (set synchronously so it's readable when main.js runs). */
window.__ccHeroIntro = true;

(function () {
  "use strict";

  var root = document.documentElement;
  var hero = document.querySelector(".hero");
  if (!hero) { if (window.__ccStartFeed) window.__ccStartFeed(); return; }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smooth expo-style glide (long, soft deceleration) + a gentle overshoot.
  var EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
  var BACK = "cubic-bezier(0.34, 1.38, 0.5, 1)";

  var q = function (s) { return hero.querySelector(s); };
  var qa = function (s, c) { return Array.prototype.slice.call((c || hero).querySelectorAll(s)); };

  /* ---------- Shared state (top-level so failsafe can reach it) ---------- */
  var anims = [];
  var counters = [];
  var willChange = [];
  var doneCalled = false;
  var panel = null, chartLine = null, chartFill = null;

  /* ---------- Reduced motion: single 0.2s fade, numbers final ---------- */
  if (reduce) {
    setFinalNumbers();
    startFeed();
    var f = hero.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "linear", fill: "both" });
    f.finished.then(function () { try { f.cancel(); } catch (e) {} });
    return;
  }

  var buildRan = false;

  /* Failsafe: only force-reveal if the timeline never got built (font hang,
     JS error). It must NOT snap a healthy, in-flight animation to its end. */
  var failsafe = setTimeout(function () {
    root.classList.remove("js-preload");
    if (!buildRan || !anims.length) { setFinalNumbers(); startFeed(); }
  }, 1500);

  /* Wait for fonts so headline line-wrapping measures correctly, but never
     let a slow font block the hero — 800ms cap, then build immediately. */
  var fontGate = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  Promise.race([fontGate, wait(800)]).then(function () {
    try { build(); }
    catch (e) { root.classList.remove("js-preload"); setFinalNumbers(); startFeed(); }
  });

  /* ---------- Build + run the timeline ---------- */
  function build() {
    if (doneCalled) return;
    buildRan = true;

    panel = q('[data-hero="panel"]');
    if (panel) panel.classList.add("hero-live-hold"); // hold LIVE pulse until panel lands

    var splitChars = splitHeadline(q('[data-hero="headline"]'));

    var eyebrow = q('[data-hero="eyebrow"]');
    var subhead = q('[data-hero="subhead"]');
    var ctas = qa('[data-hero="ctas"] .btn');
    var ministats = q('[data-hero="ministats"]');
    var tiles = qa(".dash-metric");
    var feed = q("#lead-feed");
    var chips = qa('[data-hero="chip"]');
    chartLine = q(".chart-line");
    chartFill = q(".chart-fill");

    [eyebrow, subhead, ministats, panel, feed].forEach(wc);
    splitChars.forEach(wc);
    ctas.forEach(wc); tiles.forEach(wc); chips.forEach(wc);

    // Timeline positions (seconds). Overlapping, gently paced.
    var t = {
      eyebrow: 0.00, headline: 0.14, panel: 0.32, subhead: 0.52,
      tiles: 0.60, ctas: 0.70, chart: 0.82, count: 0.92,
      fill: 1.08, feed: 1.12, chips: 1.30
    };

    // 0.00 — eyebrow pill from the left
    add(eyebrow, [{ opacity: 0, transform: "translate3d(-26px,0,0)" }, { opacity: 1, transform: "none" }], 760, t.eyebrow);

    // 0.14 — headline characters rise from behind the line mask
    splitChars.forEach(function (ch, i) {
      add(ch, [{ transform: "translate3d(0,110%,0)", opacity: 0 }, { transform: "none", opacity: 1 }],
        860, t.headline + i * 0.015);
    });

    // 0.32 — dashboard panel enters as one solid unit from the right
    add(panel, [{ opacity: 0, transform: "translate3d(64px,0,0) scale(0.965)" }, { opacity: 1, transform: "none" }],
      1050, t.panel, EASE, function () { if (panel) panel.classList.remove("hero-live-hold"); });

    // 0.52 — subheadline from the left
    add(subhead, [{ opacity: 0, transform: "translate3d(-22px,0,0)" }, { opacity: 1, transform: "none" }], 760, t.subhead);

    // 0.60 — dashboard stat tiles rise, staggered
    tiles.forEach(function (el, i) {
      add(el, [{ opacity: 0, transform: "translate3d(0,18px,0)" }, { opacity: 1, transform: "none" }], 680, t.tiles + i * 0.10);
    });

    // 0.70 — both CTAs rise, staggered
    ctas.forEach(function (el, i) {
      add(el, [{ opacity: 0, transform: "translate3d(0,16px,0)" }, { opacity: 1, transform: "none" }], 680, t.ctas + i * 0.10);
    });

    // mini-stats (left column) join with the CTAs so nothing is left hidden
    add(ministats, [{ opacity: 0, transform: "translate3d(0,16px,0)" }, { opacity: 1, transform: "none" }], 720, t.ctas + 0.08);

    // 0.82 — chart line draws left→right (length via getTotalLength)
    if (chartLine && chartLine.getTotalLength) {
      var len = chartLine.getTotalLength();
      chartLine.style.animation = "none";
      chartLine.style.strokeDasharray = len;
      add(chartLine, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], 1050, t.chart);
    }

    // 0.92 — count-ups to real final values
    startCounters(t.count);

    // 1.08 — chart area gradient fills in
    if (chartFill) { chartFill.style.animation = "none"; add(chartFill, [{ opacity: 0 }, { opacity: 1 }], 700, t.fill); }

    // 1.12 — activity feed rows slide in (seed 3 rows, then hand off to live sim)
    if (feed) {
      seedFeedRows(feed, 3);
      add(feed, [{ opacity: 0, transform: "translate3d(16px,0,0)" }, { opacity: 1, transform: "none" }], 500, t.feed);
      qa(".feed-item", feed).forEach(function (row, i) {
        add(row, [{ opacity: 0, transform: "translate3d(16px,0,0)" }, { opacity: 1, transform: "none" }], 620, t.feed + i * 0.11);
      });
    }

    // 1.30 — floating badges ease in from the diagonal with a soft overshoot
    chips.forEach(function (el, i) {
      add(el, [{ opacity: 0, transform: "scale(0.86)" }, { opacity: 1, transform: "none" }], 700, t.chips + i * 0.09, BACK);
    });

    // Preload gate off now — WAAPI (fill:both) already holds every from-state.
    root.classList.remove("js-preload");

    // Finalize when the whole timeline resolves; belt-and-suspenders timeout too.
    Promise.all(anims.map(function (a) { return a.finished.catch(function () {}); }))
      .then(function () { finalize(false); });
    setTimeout(function () { finalize(false); }, 2600);
  }

  function wc(el) { if (el) { el.style.willChange = "transform, opacity"; willChange.push(el); } }

  function add(el, frames, dur, pos, ease, onEnd) {
    if (!el) return;
    var a = el.animate(frames, { duration: dur, delay: Math.max(0, pos * 1000), easing: ease || EASE, fill: "both" });
    if (onEnd) a.finished.then(onEnd).catch(function () {});
    anims.push(a);
    return a;
  }

  function finalize(force) {
    if (doneCalled) return;
    doneCalled = true;
    clearTimeout(failsafe);
    root.classList.remove("js-preload");

    // Chart pieces rest at a state that ISN'T their CSS base (base = hidden),
    // so pin their final values inline before we clear the animations.
    if (chartLine) { chartLine.style.strokeDashoffset = "0"; }
    if (chartFill) { chartFill.style.opacity = "1"; }

    // Finish + clear entrance animations so hover/tilt inline transforms work
    // again (their natural resting state is the correct final layout position).
    anims.forEach(function (a) {
      try { a.finish(); } catch (e) {}
      try { a.cancel(); } catch (e) {}
    });
    counters.forEach(function (c) { c.stop(true); });
    willChange.forEach(function (el) { el.style.willChange = ""; });
    if (panel) panel.classList.remove("hero-live-hold");

    startFeed();
    if (force) { hero.style.opacity = ""; setFinalNumbers(); }
  }

  /* ---------- Headline splitter: chars, word-safe, per-line masks ---------- */
  function splitHeadline(h1) {
    if (!h1) return [];
    var words = [];
    Array.prototype.forEach.call(h1.childNodes, function (node) {
      if (node.nodeType === 3) { collectWords(node.textContent, false); }
      else if (node.nodeType === 1) { collectWords(node.textContent, node.classList && node.classList.contains("grad-text")); }
    });
    function collectWords(text, accent) {
      text.split(/(\s+)/).forEach(function (tok) {
        if (tok === "") return;
        if (/^\s+$/.test(tok)) words.push({ space: true });
        else words.push({ text: tok, accent: accent });
      });
    }

    // Render words (inline-block) so the browser wraps them naturally.
    h1.textContent = "";
    var chars = [], wordEls = [];
    words.forEach(function (w) {
      if (w.space) { h1.appendChild(document.createTextNode(" ")); return; }
      var wEl = document.createElement("span");
      wEl.className = "hl-word" + (w.accent ? " grad-text" : "");
      wEl.setAttribute("aria-hidden", "true");
      Array.prototype.forEach.call(w.text, function (chr) {
        var c = document.createElement("span");
        c.className = "hl-char";
        c.setAttribute("aria-hidden", "true");
        c.textContent = chr;
        wEl.appendChild(c);
        chars.push(c);
      });
      h1.appendChild(wEl);
      wordEls.push(wEl);
    });

    // Group words into lines by measured offsetTop, then wrap each line in an
    // overflow:hidden mask so characters rise from behind it.
    var lines = [], cur = null, top = null;
    wordEls.forEach(function (wEl) {
      var ot = wEl.offsetTop;
      if (top === null || Math.abs(ot - top) > 2) { cur = []; lines.push(cur); top = ot; }
      cur.push(wEl);
    });

    h1.textContent = "";
    lines.forEach(function (line) {
      var lineEl = document.createElement("span");
      lineEl.className = "hl-line";
      lineEl.setAttribute("aria-hidden", "true");
      line.forEach(function (wEl, i) {
        lineEl.appendChild(wEl);
        if (i < line.length - 1) lineEl.appendChild(document.createTextNode(" "));
      });
      h1.appendChild(lineEl);
    });

    return chars;
  }

  /* ---------- Count-ups (rAF, integer rounding, preserves format) ---------- */
  function startCounters(pos) {
    qa("[data-hero-count]").forEach(function (el) {
      counters.push(countUp(el, parseFloat(el.getAttribute("data-hero-count")),
        el.getAttribute("data-hero-prefix") || "", 1200, pos * 1000));
    });
  }

  function countUp(el, target, prefix, dur, delay) {
    var startT = null, raf = null, stopped = false;
    function fmt(v) { return prefix + Math.round(v).toLocaleString("en-US"); }
    function frame(now) {
      if (stopped) return;
      if (startT === null) startT = now;
      var p = Math.min((now - startT) / dur, 1);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(frame);
    }
    var to = setTimeout(function () { raf = requestAnimationFrame(frame); }, delay);
    return { stop: function (setFinal) { stopped = true; clearTimeout(to); if (raf) cancelAnimationFrame(raf); if (setFinal) el.textContent = fmt(target); } };
  }

  function setFinalNumbers() {
    qa("[data-hero-count]").forEach(function (el) {
      var prefix = el.getAttribute("data-hero-prefix") || "";
      el.textContent = prefix + Math.round(parseFloat(el.getAttribute("data-hero-count"))).toLocaleString("en-US");
    });
  }

  /* ---------- Feed seeding + handoff to main.js live simulation ---------- */
  function seedFeedRows(feed, n) {
    var seed = [
      { ico: "✨", text: "New lead — Botox consult", when: "just now" },
      { ico: "📅", text: "Consultation booked — Filler", when: "12s ago" },
      { ico: "💬", text: "SMS follow-up sent automatically", when: "47s ago" }
    ];
    feed.textContent = "";
    for (var i = 0; i < n; i++) {
      var s = seed[i % seed.length];
      var el = document.createElement("div");
      el.className = "feed-item";
      el.style.animation = "none"; // entrance owns these rows
      el.innerHTML = '<span class="feed-ico">' + s.ico + "</span><span>" + s.text + "</span><small>" + s.when + "</small>";
      feed.appendChild(el);
    }
  }

  function startFeed() { if (window.__ccStartFeed) { window.__ccStartFeed(); window.__ccStartFeed = null; } }

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
})();
