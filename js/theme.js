/* ==========================================================================
   ALLIN — theme.js
   Dark/Light toggle with localStorage persistence + system-preference fallback.
   The initial theme is set by an inline snippet in <head> (prevents flash);
   this file only wires up the toggle button(s) and the meta theme-color.
   ========================================================================== */
(function () {
  "use strict";
  var KEY = "allin-theme";
  var root = document.documentElement;
  var META = { dark: "#0a0e1d", light: "#f6f6fc" };

  function current() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function apply(theme, persist) {
    root.setAttribute("data-theme", theme);
    if (persist) {
      try { localStorage.setItem(KEY, theme); } catch (e) {}
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", META[theme]);
    document.querySelectorAll(".theme-toggle").forEach(function (b) {
      b.setAttribute("aria-pressed", String(theme === "light"));
      b.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " theme");
    });
  }

  // bind toggles
  document.addEventListener("DOMContentLoaded", function () {
    apply(current(), false);
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(current() === "dark" ? "light" : "dark", true);
      });
    });
  });

  // follow OS changes only when the user hasn't chosen explicitly
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
      var saved;
      try { saved = localStorage.getItem(KEY); } catch (x) {}
      if (!saved) apply(e.matches ? "light" : "dark", false);
    });
  }
})();
