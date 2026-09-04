/* ============================================================
   Device routing — loaded synchronously in <head>, runs before
   first paint. Phones -> m.html; everything else -> index.html.
   An explicit choice (footer "Mobile site" / "Desktop site" links,
   or ?mobile=1 / ?desktop=1) is stored in localStorage and wins
   over detection. Same-origin, no external calls, no DOM writes.
   ============================================================ */
(function () {
  "use strict";
  try {
    var loc = location, q = loc.search;
    var VALID = { mobile: 1, desktop: 1 };

    var pref = null;
    try { var stored = localStorage.getItem("siteView"); if (VALID[stored]) pref = stored; } catch (e) {}

    if (/[?&](?:desktop|full)=1(?:&|$)/.test(q)) {
      pref = "desktop";
      try { localStorage.setItem("siteView", "desktop"); } catch (e) {}
    }
    if (/[?&]mobile=1(?:&|$)/.test(q)) {
      pref = "mobile";
      try { localStorage.setItem("siteView", "mobile"); } catch (e) {}
    }

    var mm = window.matchMedia;
    var coarse  = !!(mm && (mm("(pointer: coarse)").matches || mm("(hover: none)").matches));
    var minSide = Math.min(screen.width || 9999, screen.height || 9999);
    var ua = /Android|iPhone|iPod|Windows Phone|IEMobile|BlackBerry|Opera Mini|Mobile Safari|webOS/i.test(navigator.userAgent);
    var isPhone = ua || (coarse && (minSide <= 560 || window.innerWidth <= 760));

    var wantMobile = pref === "mobile" || (pref !== "desktop" && isPhone);
    var page = loc.pathname.split("/").pop() || "index.html";

    /* destinations are fixed string literals — only the fragment is carried
       across, so this can never become an open redirect */
    if (wantMobile && page !== "m.html") loc.replace("m.html" + loc.hash);
    else if (!wantMobile && page === "m.html") loc.replace("index.html" + loc.hash);
  } catch (e) { /* routing is best-effort; never block the page */ }
})();
