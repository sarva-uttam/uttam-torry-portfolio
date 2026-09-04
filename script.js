/* ============================================================
   Uttam Torry — scroll-scrubbed frame sequence
   The pinned hero scrubs the full video (frames 1 → 300).
   Overlay panels cross-fade as you scroll:
     1 – 55   hero headline
     ~66–124  Selected work
     ~146–206 About
     ~224–300 Core-capabilities ring  (then the footer scrolls in)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- config ---------- */
  var FRAME_COUNT = 300;
  var LAST_FRAME  = 300;                                   // scrub spans the whole video
  var FRAME_PATH  = function (i) {
    return "assets/frames/ezgif-frame-" + String(i).padStart(3, "0") + ".jpg";
  };

  var HERO_OUT      = [56, 74];        // frame range the hero overlay fades out over
  var WORK_IN       = [66, 88];        // Selected work fades in
  var WORK_OUT      = [124, 140];      // Selected work fades out
  var ABOUT_IN      = [146, 168];      // About fades in
  var ABOUT_OUT     = [206, 222];      // About fades out
  var RING_IN       = [226, 242];      // ring fades in, then holds to the end (no fade-out)
  var RING_ROT_WIN  = [0.12, 0.72];    // fraction of the ring's life where it actually revolves
  var RING_ROT      = [-248, 22.5];    // start / end angle — a big ~270° turn

  /* ---------- elements ---------- */
  var canvas    = document.getElementById("frameCanvas");
  var HAS_HERO  = !!canvas;
  var ctx       = HAS_HERO ? canvas.getContext("2d", { alpha: false }) : null;
  var hero      = document.getElementById("hero");
  var heroLeft  = document.getElementById("heroLeft");
  var heroRight = document.getElementById("heroRight");
  var heroHint  = document.getElementById("heroHint");
  var workPanel = document.getElementById("workPanel");
  var aboutPanel= document.getElementById("aboutPanel");
  var aboutEls  = aboutPanel ? [].slice.call(aboutPanel.querySelectorAll("[data-anim]")) : [];
  var ringPanel = document.getElementById("ringPanel");
  var ringStage = document.getElementById("ringStage");
  var ringOrbit = document.getElementById("ringOrbit");
  var ringCards = ringStage ? [].slice.call(ringStage.querySelectorAll(".rp__card")) : [];
  var mqCompact = window.matchMedia("(max-width: 1080px)");
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
          loaderBar.style.width = pct + "%";
          loaderCt.textContent = pct;
          if (idx === 0) needsDraw = true;
          if (loadedCount === FRAME_COUNT) finishLoading();
        };
        img.src = FRAME_PATH(idx + 1);
        images[idx] = img;
      })(i);
    }
  }

  function finishLoading() {
    loader.classList.add("is-done");
    setTimeout(function () { loader.setAttribute("hidden", ""); }, 700);
  }

  /* ============================================================
     Canvas drawing (cover fit)
     ============================================================ */
  function resizeCanvas() {
    if (!HAS_HERO) return;
    canvas.width  = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
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
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale, dh = ih * scale;
    var dx = (cw - dw) / 2;
    var dy = (ch - dh) / 2 + dh * 0.05; // bias down so his head isn't cropped at the top

    ctx.fillStyle = "#05080a";
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* ============================================================
     Helpers
     ============================================================ */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function fp(frame) { return (frame - 1) / (LAST_FRAME - 1); }   // frame -> progress
  function ss(x, a, b) {                                          // smoothstep
    var t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }
  function setVisible(el, on) {
    var v = on ? "visible" : "hidden";
    if (el.style.visibility !== v) el.style.visibility = v;
  }

  /* Staggered scroll-scrubbed reveal (About panel):
     each element rises up from below while fading in, holds, then
     keeps travelling up and fades out once the panel is scrolled past. */
  var RISE = 70;
  function staggerReveal(els, inP, outP) {
    var n = els.length;
    for (var i = 0; i < n; i++) {
      var el = els[i];
      var frac = i / n;
      var e = clamp01((inP - frac * 0.45) / 0.5); e = e * e * (3 - 2 * e);
      var o = clamp01((outP - frac * 0.35) / 0.55); o = o * o * (3 - 2 * o);
      var ty = (1 - e) * RISE - o * RISE;
      el.style.opacity = Math.min(e, 1 - o).toFixed(3);
      el.style.transform = "translate3d(0," + ty.toFixed(1) + "px,0)";
    }
  }

  /* ============================================================
     Panel 4 — a big circle of upright cards around the character.
       scroll to it  → cards sit still (start angle)
       scroll through → the ring makes a big turn
       scroll past    → the ring freezes and holds
     The circle is wide enough that its path stays well outside his
     face; cards ride the left / right arcs near the screen edges and
     the top / bottom of the circle run off-screen.
     ============================================================ */
  function updateRing(progress, inP) {
    var n = ringCards.length;

    if (mqCompact.matches) {                     // small screens use the CSS grid
      for (var m = 0; m < n; m++) {
        ringCards[m].style.opacity = inP.toFixed(3);
        ringCards[m].style.transform = "";
        ringCards[m].style.zIndex = "";
      }
      return;
    }

    var vw = window.innerWidth, vh = window.innerHeight;
    var stage = ringStage.getBoundingClientRect();
    var cx = stage.left, cy = stage.top;

    var R    = Math.max(340, Math.min(vw * 0.30, vh * 0.54, 460));
    var card = Math.max(132, Math.min(vw * 0.11, 168));

    var t0   = fp(RING_IN[0]);
    var life = clamp01((progress - t0) / (1 - t0));
    var rp = clamp01((life - RING_ROT_WIN[0]) / (RING_ROT_WIN[1] - RING_ROT_WIN[0]));
    rp = rp * rp * (3 - 2 * rp);
    var rot = RING_ROT[0] + rp * (RING_ROT[1] - RING_ROT[0]);

    // safety keep-out around his face (the big radius already clears it)
    var faceCx = vw * 0.52, faceCy = vh * 0.52;
    var faceRx = vw * 0.13 + card * 0.5;
    var faceRy = vh * 0.24 + card * 0.5;

    for (var i = 0; i < n; i++) {
      var el = ringCards[i];
      var a  = (i / n) * 360 + rot;
      var rad = a * Math.PI / 180;
      var sin = Math.sin(rad);
      var x = Math.cos(rad) * R, y = sin * R;
      var sx = cx + x, sy = cy + y;

      var front = (sin + 1) / 2;
      var sc = 0.88 + 0.12 * front;

      var dx = (sx - faceCx) / faceRx, dy = (sy - faceCy) / faceRy;
      var faceClear = clamp01((Math.sqrt(dx * dx + dy * dy) - 1) / 0.1);

      var mind = Math.min(sx, sy - 58, vw - sx, vh - sy);
      var edge = clamp01((mind + card * 0.38) / (card * 0.62));

      var hx = (sx - vw * 0.11) / (vw * 0.2), hy = (sy - vh * 0.13) / (vh * 0.16);
      var headClear = clamp01((Math.sqrt(hx * hx + hy * hy) - 1) / 0.3);

      el.style.setProperty("--card", card.toFixed(1) + "px");
      el.style.opacity = (inP * faceClear * headClear * edge).toFixed(3);
      el.style.zIndex = String(Math.round(front * 20));
      el.style.transform =
        "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) scale(" + sc.toFixed(3) + ")";
    }

    ringOrbit.style.width = ringOrbit.style.height = (R * 2).toFixed(0) + "px";
    ringOrbit.style.transform = "translate(-50%,-50%)";
    ringOrbit.style.opacity = (0.45 * inP).toFixed(3);
  }

  /* ============================================================
     Scroll → progress → frame + panels
     ============================================================ */
  function updateFromScroll() {
    if (!HAS_HERO) return;
    var rect = hero.getBoundingClientRect();
    var runway = hero.offsetHeight - window.innerHeight;
    var scrolled = -rect.top;
    var progress = clamp01(runway > 0 ? scrolled / runway : 0);

    targetFrame = progress * (LAST_FRAME - 1);   // progress 0..1 -> frame 1..LAST_FRAME

    /* hero overlay */
    var out  = ss(progress, fp(HERO_OUT[0]), fp(HERO_OUT[1]));
    var outR = ss(progress, fp(HERO_OUT[0] - 6), fp(HERO_OUT[1] - 6));
    heroLeft.style.opacity    = String(1 - out);
    heroLeft.style.transform  = "translateY(" + (-70 * out) + "px)";
    heroRight.style.opacity   = String(1 - outR);
    heroRight.style.transform = "translateY(" + (-95 * outR) + "px)";
    var heroGone = out >= 1 && outR >= 1;
    setVisible(heroLeft, !heroGone);
    setVisible(heroRight, !heroGone);

    /* Selected work */
    var workIn  = ss(progress, fp(WORK_IN[0]),  fp(WORK_IN[1]));
    var workOut = ss(progress, fp(WORK_OUT[0]), fp(WORK_OUT[1]));
    var workOp  = workIn * (1 - workOut);
    workPanel.style.opacity = String(workOp);
    workPanel.style.transform = "translateY(" + ((1 - workIn) * 48 - workOut * 60) + "px)";
    setVisible(workPanel, workOp > 0.02);

    /* About */
    var aboutIn  = ss(progress, fp(ABOUT_IN[0]),  fp(ABOUT_IN[1]));
    var aboutOut = ss(progress, fp(ABOUT_OUT[0]), fp(ABOUT_OUT[1]));
    var aboutOp  = aboutIn * (1 - aboutOut);
    aboutPanel.style.opacity = String(aboutOp);
    setVisible(aboutPanel, aboutOp > 0.02);
    if (aboutOp > 0.001) staggerReveal(aboutEls, aboutIn, aboutOut);

    /* Core-capabilities ring — fades in, then holds until the pin releases */
    var ringIn = ss(progress, fp(RING_IN[0]), fp(RING_IN[1]));
    ringPanel.style.opacity = String(ringIn);
    setVisible(ringPanel, ringIn > 0.02);
    if (ringIn > 0.001) updateRing(progress, ringIn);

    heroHint.style.opacity = progress > 0.015 ? "0" : "1";

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
     Nav + reveal on scroll
     ============================================================ */
  function onScrollNav() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 40);
  }

  /* ============================================================
     Mobile navigation drawer
     ============================================================ */
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
        setOpen(false);
        navToggle.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target)) setOpen(false);
    });
  }

  /* ============================================================
     FAQ accordion — native <details>, one open per group
     ============================================================ */
  function initFaq() {
    var groups = document.querySelectorAll(".faq-group .faq-list");
    if (!groups.length) return;
    groups.forEach(function (list) {
      var items = [].slice.call(list.querySelectorAll("details.faq-item"));
      items.forEach(function (d) {
        d.addEventListener("toggle", function () {
          if (!d.open) return;
          items.forEach(function (o) { if (o !== d) o.open = false; });
        });
      });
    });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px 4% 0px" });
    els.forEach(function (el, i) {
      el.style.transitionDelay = (i % 5) * 0.07 + "s";
      io.observe(el);
    });
  }

  /* ============================================================
     "Start a conversation" chooser
     ============================================================ */
  function initConnect() {
    var modal = document.getElementById("connectModal");
    if (!modal) return;
    var open = function (e) { e.preventDefault(); if (modal.showModal) modal.showModal(); else modal.setAttribute("open", ""); };
    var close = function () { if (modal.close) modal.close(); else modal.removeAttribute("open"); };

    document.querySelectorAll("[data-connect]").forEach(function (b) {
      b.addEventListener("click", open);
    });
    modal.querySelectorAll("[data-connect-close]").forEach(function (b) {
      b.addEventListener("click", close);
    });
    // click on the backdrop (the dialog element itself, outside the content)
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    modal.addEventListener("cancel", function (e) { e.preventDefault(); close(); }); // Esc
    modal.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    // a channel was picked — let it open, then dismiss the chooser
    modal.querySelectorAll(".connect__list a").forEach(function (a) {
      a.addEventListener("click", function () { setTimeout(close, 60); });
    });
  }

  /* ============================================================
     Boot
     ============================================================ */
  function onScroll() {
    updateFromScroll();
    onScrollNav();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    resizeCanvas();
    updateFromScroll();
  });

  onScrollNav();
  initNav();
  initReveal();
  initConnect();
  initFaq();

  if (HAS_HERO) {
    resizeCanvas();
    updateFromScroll();
    preload();
    requestAnimationFrame(tick);
  }
})();
