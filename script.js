/* ============================================================
   Uttam Torry — scroll-scrubbed frame sequence
   ------------------------------------------------------------
   The pinned hero composes the scene on a LOCKED 1280x720 stage
   that is cover-scaled to the viewport (--hsc). Everything inside
   the stage is positioned in fixed design pixels / container units,
   so the overlay components stay welded to the portrait at any
   zoom level or window size.

   Overlay panels assemble / disassemble (staggered, reversible)
   as you scroll:
     ~1 – 46   hero headline      (starts assembled, disassembles up)
     ~64–140   Selected work
     ~148–224  About
     ~226–300  Core-capabilities ring  (assembles, revolves, holds)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- config ---------- */
  var FRAME_COUNT = 300;
  var LAST_FRAME  = 300;
  var STAGE_W = 1280, STAGE_H = 720;
  var FRAME_PATH = function (i) {
    return "assets/frames/ezgif-frame-" + String(i).padStart(3, "0") + ".jpg";
  };

  /* frame windows -> converted to scroll progress via fp().
     Generous, overlapping ranges so panels cross-dissolve gently rather
     than snapping. */
  var HERO_OUT   = [34, 68];
  var WORK_IN    = [58, 98];
  var WORK_OUT   = [118, 150];
  var ABOUT_IN   = [140, 182];
  var ABOUT_OUT  = [204, 236];
  var RING_IN    = [228, 272];
  var RING_REV   = [262, 298];      // the revolve
  var RING_ROT   = [-224, 26];      // start / end angle (~250deg turn)

  /* ring geometry — fixed design px inside the stage
     (centre comes from .rp__ring in CSS: 640, 400). A big circle so the
     side arcs clear the portrait's face and the top / bottom run off-stage. */
  var RING_R = 452, RING_CARD = 146;

  /* ---------- elements ---------- */
  var canvas    = document.getElementById("frameCanvas");
  var HAS_HERO  = !!canvas;
  var ctx       = HAS_HERO ? canvas.getContext("2d", { alpha: false }) : null;
  var hero      = document.getElementById("hero");
  var sticky    = hero ? hero.querySelector(".hero__sticky") : null;
  var stage     = document.getElementById("heroStage");
  var heroPanel = document.getElementById("heroPanel");
  var heroHint  = document.getElementById("heroHint");
  var workPanel = document.getElementById("workPanel");
  var aboutPanel= document.getElementById("aboutPanel");
  var ringPanel = document.getElementById("ringPanel");
  var ringStage = document.getElementById("ringStage");
  var ringOrbit = document.getElementById("ringOrbit");
  var ringCards = ringStage ? [].slice.call(ringStage.querySelectorAll(".rp__card")) : [];
  var nav       = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var loader    = document.getElementById("loader");
  var loaderBar = document.getElementById("loaderBar");
  var loaderCt  = document.getElementById("loaderCount");

  /* ---------- state ---------- */
  var images       = new Array(FRAME_COUNT);
  var loadedFlags  = new Array(FRAME_COUNT);
  var loadedCount  = 0;
  var targetFrame  = 0;
  var currentFrame = 0;
  var needsDraw    = true;
  var dpr          = Math.min(window.devicePixelRatio || 1, 2);

  /* panel element lists, each entry { el, dir, order } */
  var heroEls = [], workEls = [], aboutEls = [];
  var ringHeadEls = [];

  /* ============================================================
     Helpers
     ============================================================ */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function fp(frame)  { return (frame - 1) / (LAST_FRAME - 1); }
  function ss(x, a, b) {
    var t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }
  function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }

  var DIRV = {
    l:  [-1,  0, -1],
    r:  [ 1,  0,  1],
    u:  [ 0,  1,  0],
    d:  [ 0, -1,  0],
    ul: [-1,  1, -1],
    ur: [ 1,  1,  1],
    s:  [ 0,  0,  0]
  };

  /* ============================================================
     Image preloading
     ============================================================ */
  function preload() {
    for (var i = 0; i < FRAME_COUNT; i++) {
      (function (idx) {
        var img = new Image();
        img.onload = img.onerror = function () {
          loadedFlags[idx] = true;
          loadedCount++;
          var pct = Math.round((loadedCount / FRAME_COUNT) * 100);
          if (loaderBar) loaderBar.style.width = pct + "%";
          if (loaderCt) loaderCt.textContent = pct;
          if (idx === 0) needsDraw = true;
          if (loadedCount === FRAME_COUNT) finishLoading();
        };
        img.src = FRAME_PATH(idx + 1);
        images[idx] = img;
      })(i);
    }
  }
  function finishLoading() {
    if (!loader) return;
    loader.classList.add("is-done");
    setTimeout(function () { loader.setAttribute("hidden", ""); }, 700);
  }

  /* ============================================================
     Stage scaling + canvas
     ============================================================ */
  function setStageScale() {
    if (!stage) return;
    /* contain-fit: the whole 1280x720 poster (portrait + every overlay) scales
       by ONE factor, so nothing can drift relative to anything else at any zoom
       level. The stage shares the frame's 16:9 ratio, so the letterbox strips
       (theme background) only appear on genuinely off-ratio windows. */
    var s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    stage.style.setProperty("--hsc", s.toFixed(4));
  }

  function resizeCanvas() {
    if (!HAS_HERO) return;
    canvas.width  = Math.round(STAGE_W * dpr);
    canvas.height = Math.round(STAGE_H * dpr);
    needsDraw = true;
  }

  function nearestLoaded(idx) {
    if (loadedFlags[idx]) return images[idx];
    for (var d = 1; d < FRAME_COUNT; d++) {
      if (idx - d >= 0 && loadedFlags[idx - d]) return images[idx - d];
      if (idx + d < FRAME_COUNT && loadedFlags[idx + d]) return images[idx + d];
    }
    return null;
  }

  function drawFrame(frameFloat) {
    var idx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(frameFloat)));
    var img = nearestLoaded(idx);
    if (!img || !img.naturalWidth) return;
    var cw = canvas.width, ch = canvas.height;
    // source frames are 1280x720 — same aspect as the stage, so fill exactly
    ctx.fillStyle = "#05080a";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, cw, ch);
  }

  /* ============================================================
     Panel assemble / disassemble
     ------------------------------------------------------------
     inP  0..1  assemble progress (0 = scattered, 1 = in place)
     outP 0..1  disassemble progress (0 = in place, 1 = scattered)
     Both are pure functions of scroll position, so the effect is
     fully reversible when scrolling back up.
     ============================================================ */
  function panelAnim(list, inP, outP) {
    var n = list.length;
    for (var i = 0; i < n; i++) {
      var item = list[i];
      var f = n > 1 ? item.order / (n - 1) : 0;
      var a = smooth((inP - f * 0.5) / 0.5);
      var d = smooth((outP - (1 - f) * 0.45) / 0.55);
      var vis  = a * (1 - d);
      var away = (1 - a) + d;                 // 0 = seated, ~1 = flung out
      var v = DIRV[item.dir] || DIRV.u;
      var D = 78;
      item.el.style.opacity = vis.toFixed(3);
      item.el.style.transform =
        "translate3d(" + (v[0] * away * D).toFixed(1) + "px," +
                         (v[1] * away * D).toFixed(1) + "px,0) " +
        "scale(" + (1 - away * 0.14).toFixed(3) + ") " +
        "rotate(" + (v[2] * away * 2).toFixed(2) + "deg)";
    }
  }

  function setPanel(el, op) {
    if (!el) return;
    el.style.opacity = op.toFixed(3);
    var vis = op > 0.001 ? "visible" : "hidden";
    if (el.style.visibility !== vis) el.style.visibility = vis;
  }

  /* Core-capabilities ring — cards fly out from the centre along
     their radial, revolve, then hold. Reverses on scroll-up. */
  function updateRing(inP, revP) {
    var n = ringCards.length;
    if (!n) return;
    var rot = RING_ROT[0] + smooth(revP) * (RING_ROT[1] - RING_ROT[0]);

    for (var i = 0; i < n; i++) {
      var el = ringCards[i];
      var f = n > 1 ? i / (n - 1) : 0;
      var asm = smooth((inP - f * 0.45) / 0.55);

      var ang = (i / n) * 360 + rot;
      var rad = ang * Math.PI / 180;
      var x = Math.cos(rad) * RING_R;
      var y = Math.sin(rad) * RING_R;
      var rr = 0.26 + 0.74 * asm;                 // radial fraction (centre -> ring)
      var sc = 0.5 + 0.5 * asm;
      var depth = (Math.sin(rad) + 1) / 2;        // 0 back .. 1 front

      el.style.setProperty("--card", RING_CARD + "px");
      el.style.opacity = asm.toFixed(3);
      el.style.zIndex = String(10 + Math.round(depth * 8));
      el.style.transform =
        "translate3d(" + (x * rr).toFixed(1) + "px," + (y * rr).toFixed(1) + "px,0) " +
        "scale(" + sc.toFixed(3) + ")";
    }

    if (ringOrbit) {
      ringOrbit.style.width = ringOrbit.style.height = (RING_R * 2) + "px";
      ringOrbit.style.transform = "translate(-50%,-50%)";
      ringOrbit.style.opacity = (0.4 * smooth(inP)).toFixed(3);
    }
  }

  /* ============================================================
     Scroll -> progress -> frame + panels
     ============================================================ */
  function updateFromScroll() {
    if (!HAS_HERO) return;
    var rect = hero.getBoundingClientRect();
    var runway = hero.offsetHeight - window.innerHeight;
    var scrolled = -rect.top;
    var progress = clamp01(runway > 0 ? scrolled / runway : 0);

    targetFrame = progress * (LAST_FRAME - 1);

    /* hero headline — seated at rest, disassembles as you scroll down */
    var heroOut = ss(progress, fp(HERO_OUT[0]), fp(HERO_OUT[1]));
    panelAnim(heroEls, 1, heroOut);

    /* Selected work */
    var wIn  = ss(progress, fp(WORK_IN[0]),  fp(WORK_IN[1]));
    var wOut = ss(progress, fp(WORK_OUT[0]), fp(WORK_OUT[1]));
    setPanel(workPanel, ss(progress, fp(WORK_IN[0] - 4), fp(WORK_IN[1])) * (1 - wOut));
    panelAnim(workEls, wIn, wOut);

    /* About */
    var aIn  = ss(progress, fp(ABOUT_IN[0]),  fp(ABOUT_IN[1]));
    var aOut = ss(progress, fp(ABOUT_OUT[0]), fp(ABOUT_OUT[1]));
    setPanel(aboutPanel, ss(progress, fp(ABOUT_IN[0] - 4), fp(ABOUT_IN[1])) * (1 - aOut));
    panelAnim(aboutEls, aIn, aOut);

    /* Core-capabilities ring — assembles then holds (no disassemble down) */
    var rIn  = ss(progress, fp(RING_IN[0]), fp(RING_IN[1]));
    var rRev = ss(progress, fp(RING_REV[0]), fp(RING_REV[1]));
    setPanel(ringPanel, ss(progress, fp(RING_IN[0] - 4), fp(RING_IN[1])));
    panelAnim(ringHeadEls, rIn, 0);
    if (rIn > 0.0005 || progress > fp(RING_IN[0]) - 0.02) updateRing(rIn, rRev);

    if (heroHint) heroHint.style.opacity = progress > 0.012 ? "0" : "1";

    needsDraw = true;
  }

  /* ============================================================
     rAF loop — smooth frame interpolation
     ============================================================ */
  function tick() {
    currentFrame += (targetFrame - currentFrame) * 0.16;
    if (Math.abs(targetFrame - currentFrame) < 0.05) currentFrame = targetFrame;
    if (needsDraw || Math.abs(targetFrame - currentFrame) >= 0.01) {
      drawFrame(currentFrame);
      needsDraw = false;
    }
    requestAnimationFrame(tick);
  }

  /* ============================================================
     Build panel element lists (measure once — the stage never
     reflows, so rest positions are stable forever)
     ============================================================ */
  function collect(container, selector, forceDir) {
    if (!container) return [];
    var els = [].slice.call(container.querySelectorAll(selector));
    return els.map(function (el, i) {
      var dir = forceDir;
      if (!dir) {
        var r = el.getBoundingClientRect();
        var cs = stage.getBoundingClientRect();
        var sc = parseFloat(getComputedStyle(stage).getPropertyValue("--hsc")) || 1;
        var cx = (r.left + r.width / 2 - cs.left) / sc;   // design-px centre
        dir = cx < STAGE_W * 0.46 ? "l" : cx > STAGE_W * 0.54 ? "r" : "u";
      }
      return { el: el, dir: dir, order: i };
    });
  }

  function initPanels() {
    if (!stage) return;
    heroEls = collect(document.getElementById("heroLeft"), "[data-anim]", "l")
      .concat(collect(document.getElementById("heroRight"), "[data-anim]", "r"));
    heroEls.forEach(function (it, i) { it.order = i; });

    workEls = collect(workPanel, "[data-anim]");
    workEls.forEach(function (it, i) { it.order = i; });

    aboutEls = collect(aboutPanel, "[data-anim]");
    aboutEls.forEach(function (it, i) { it.order = i; });

    ringHeadEls = collect(ringPanel, "[data-anim]", "l");
    ringHeadEls.forEach(function (it, i) { it.order = i; });
  }

  /* ============================================================
     Nav + reveal + mobile drawer + FAQ accordion + view switch
     ============================================================ */
  function onScrollNav() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 40);
  }

  function initNav() {
    if (!nav || !navToggle) return;
    var links = document.getElementById("navLinks");
    var setOpen = function (on) {
      nav.classList.toggle("is-open", on);
      navToggle.setAttribute("aria-expanded", on ? "true" : "false");
    };
    navToggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });
    if (links) {
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { setOpen(false); });
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false); navToggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target)) setOpen(false);
    });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal, .m-reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px 4% 0px" });
    els.forEach(function (el, i) {
      el.style.transitionDelay = (i % 6) * 0.06 + "s";
      io.observe(el);
    });
  }

  function initConnect() {
    var modal = document.getElementById("connectModal");
    if (!modal) return;
    var open = function (e) { e.preventDefault(); if (modal.showModal) modal.showModal(); else modal.setAttribute("open", ""); };
    var close = function () { if (modal.close) modal.close(); else modal.removeAttribute("open"); };
    document.querySelectorAll("[data-connect]").forEach(function (b) { b.addEventListener("click", open); });
    modal.querySelectorAll("[data-connect-close]").forEach(function (b) { b.addEventListener("click", close); });
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    modal.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
    modal.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    modal.querySelectorAll(".connect__list a").forEach(function (a) {
      a.addEventListener("click", function () { setTimeout(close, 60); });
    });
  }

  function initFaq() {
    var lists = document.querySelectorAll(".faq-group .faq-list");
    if (!lists.length) return;
    lists.forEach(function (list) {
      var items = [].slice.call(list.querySelectorAll("details.faq-item"));
      items.forEach(function (d) {
        d.addEventListener("toggle", function () {
          if (!d.open) return;
          items.forEach(function (o) { if (o !== d) o.open = false; });
        });
      });
    });
  }

  /* remember an explicit "view desktop / mobile site" choice */
  function initViewSwitch() {
    document.querySelectorAll("[data-view]").forEach(function (a) {
      a.addEventListener("click", function () {
        try { localStorage.setItem("siteView", a.getAttribute("data-view")); } catch (e) {}
      });
    });
  }

  /* ============================================================
     Boot
     ============================================================ */
  function onScroll() { updateFromScroll(); onScrollNav(); }

  onScrollNav();
  initNav();
  initReveal();
  initConnect();
  initFaq();
  initViewSwitch();

  if (HAS_HERO) {
    setStageScale();
    resizeCanvas();
    initPanels();
    updateFromScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      setStageScale();
      resizeCanvas();
      updateFromScroll();
    });

    preload();
    requestAnimationFrame(tick);
  } else {
    window.addEventListener("scroll", onScrollNav, { passive: true });
  }
})();
