/* ==========================================================================
   ALLIN — main.js
   Nav, mobile menu, scroll reveal, animated counters, marquee duplication,
   interactive roadmap, accordions, back-to-top, form validation + Formspree.
   Uses GSAP/ScrollTrigger when present (progressive enhancement); never required.
   ========================================================================== */
(function () {
  "use strict";
  var d = document;
  var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- current year ---- */
  d.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- navbar: scrolled state + mobile toggle ---- */
  var nav = d.querySelector(".nav");
  var toggle = d.querySelector(".nav-toggle");
  var links = d.querySelector(".nav-links");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
    var tt = d.querySelector(".to-top");
    if (tt) tt.classList.toggle("show", window.scrollY > 480);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- back to top ---- */
  var topBtn = d.querySelector(".to-top");
  if (topBtn) topBtn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ---- marquee: duplicate track for seamless loop ---- */
  d.querySelectorAll(".marquee-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

  /* ---- scroll reveal ---- */
  var revealEls = d.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("in"); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { ro.observe(el); });
    }
  }

  /* ---- animated counters ---- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var dec = (target % 1 !== 0) ? 1 : 0;
    if (prefersReduced) { el.textContent = prefix + target.toLocaleString("en-IN") + suffix; return; }
    var start = null, dur = 1500;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + (dec ? val.toFixed(1) : Math.round(val)).toLocaleString("en-IN") + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var counters = d.querySelectorAll("[data-count]");
  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { co.observe(el); });
    }
  }

  /* ---- accordions (curriculum / FAQ) ---- */
  d.querySelectorAll(".acc").forEach(function (acc) {
    var single = acc.hasAttribute("data-single");
    acc.querySelectorAll(".acc-item").forEach(function (item) {
      var head = item.querySelector(".acc-head");
      var body = item.querySelector(".acc-body");
      if (!head || !body) return;
      head.setAttribute("aria-expanded", item.classList.contains("open") ? "true" : "false");
      if (item.classList.contains("open")) body.style.maxHeight = body.scrollHeight + "px";
      head.addEventListener("click", function () {
        var willOpen = !item.classList.contains("open");
        if (single) {
          acc.querySelectorAll(".acc-item.open").forEach(function (o) {
            if (o !== item) { o.classList.remove("open"); o.querySelector(".acc-body").style.maxHeight = null;
              o.querySelector(".acc-head").setAttribute("aria-expanded", "false"); }
          });
        }
        item.classList.toggle("open", willOpen);
        head.setAttribute("aria-expanded", String(willOpen));
        body.style.maxHeight = willOpen ? body.scrollHeight + "px" : null;
      });
    });
  });

  /* ---- interactive roadmap ---- */
  var roadmap = d.querySelector(".roadmap-road");
  var rmSection = d.querySelector(".roadmap");
  if (roadmap && rmSection) {
    var steps = Array.prototype.slice.call(roadmap.querySelectorAll(".ms"));
    var roadFill = roadmap.querySelector(".road-fill");
    var roadLen = roadFill && roadFill.getTotalLength ? roadFill.getTotalLength() : 0;
    if (roadFill && roadLen) { roadFill.style.strokeDasharray = roadLen; roadFill.style.strokeDashoffset = roadLen; }
    var visual = d.querySelector(".roadmap-visual");
    var n = steps.length;
    var cur = 0, autoTimer = null, userInteracted = false;
    var ICONS = {
      compass: '<circle cx="12" cy="12" r="9"/><polygon points="16 8 10 10 8 16 14 14 16 8"/>',
      book: '<path d="M3 5h6a3 3 0 0 1 3 3v11a2.5 2.5 0 0 0-2.5-2.5H3zM21 5h-6a3 3 0 0 0-3 3v11a2.5 2.5 0 0 1 2.5-2.5H21z"/>',
      tools: '<path d="M14.7 6.3a4 4 0 0 1 5 5l-8 8-4.5 1 1-4.5 8-8z"/><path d="M5 19l3-3"/>',
      target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
      network: '<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="M7.6 7.7l3.2 8.1M16.4 7.7l-3.2 8.1M8.3 6h7.4"/>'
    };
    var rv = {
      icon: visual.querySelector(".rv-icon"), phase: visual.querySelector(".rv-phase"),
      dur: visual.querySelector(".rv-dur"), count: visual.querySelector(".rv-count"),
      title: visual.querySelector(".rv-title"), prog: visual.querySelector(".rv-prog i"),
      desc: visual.querySelector(".rv-desc"), list: visual.querySelector(".rv-list"),
      outcome: visual.querySelector(".rv-outcome span"), dots: visual.querySelector(".rv-dots"),
      prev: visual.querySelector(".rv-prev"), next: visual.querySelector(".rv-next")
    };
    function pad(x) { return x < 10 ? "0" + x : "" + x; }
    /* build dot navigation */
    if (rv.dots) {
      steps.forEach(function (s, i) {
        var b = d.createElement("button");
        b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-label", "Go to stage " + (i + 1));
        b.addEventListener("click", function () { userPick(i); });
        rv.dots.appendChild(b);
      });
    }
    function selectStep(i) {
      cur = i;
      steps.forEach(function (s, idx) {
        s.classList.toggle("active", idx === i);
        s.classList.toggle("done", idx < i);
        s.setAttribute("aria-selected", idx === i ? "true" : "false");
      });
      var active = steps[i];
      if (roadFill && roadLen) {
        var frac = n > 1 ? i / (n - 1) : 1;
        roadFill.style.strokeDashoffset = (roadLen * (1 - frac)) + "";
      }
      var o = {};
      try { o = JSON.parse(active.getAttribute("data-rv") || "{}"); } catch (e) {}
      if (rv.icon) rv.icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[o.icon] || ICONS.compass) + "</svg>";
      if (rv.phase) rv.phase.textContent = o.phase || "";
      if (rv.dur) rv.dur.textContent = o.dur || "";
      if (rv.count) rv.count.innerHTML = "<b>" + pad(i + 1) + "</b> / " + pad(n);
      if (rv.title) rv.title.textContent = o.title || "";
      if (rv.prog) rv.prog.style.width = ((i + 1) / n * 100) + "%";
      if (rv.desc) rv.desc.textContent = o.desc || "";
      if (rv.outcome) rv.outcome.textContent = o.outcome || "";
      if (rv.list && o.items) {
        rv.list.innerHTML = o.items.map(function (t, k) {
          return '<div style="animation-delay:' + (k * 0.07) + 's"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>' + t + "</span></div>";
        }).join("");
      }
      if (rv.dots) Array.prototype.forEach.call(rv.dots.children, function (b, idx) { b.classList.toggle("on", idx === i); });
      if (rv.prev) rv.prev.disabled = i === 0;
      if (rv.next) rv.next.disabled = i === n - 1;
    }
    function userPick(i) { userInteracted = true; stopAuto(); selectStep(Math.max(0, Math.min(n - 1, i))); }
    function startAuto() {
      if (prefersReduced || autoTimer || userInteracted) return;
      autoTimer = setInterval(function () { selectStep((cur + 1) % n); }, 4200);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
    steps.forEach(function (s, i) {
      s.setAttribute("tabindex", "0");
      s.setAttribute("role", "button");
      s.addEventListener("click", function () { userPick(i); });
      s.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); userPick(i); }
      });
    });
    if (rv.prev) rv.prev.addEventListener("click", function () { userPick(cur - 1); });
    if (rv.next) rv.next.addEventListener("click", function () { userPick(cur + 1); });
    rmSection.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); userPick(cur - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); userPick(cur + 1); }
    });
    roadmap.addEventListener("mouseenter", stopAuto);
    visual.addEventListener("mouseenter", stopAuto);
    selectStep(0);
    if ("IntersectionObserver" in window && !prefersReduced) {
      var rio = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) startAuto(); else stopAuto(); });
      }, { threshold: 0.35 });
      rio.observe(rmSection);
    }
    /* keep line fill aligned after resize */
    window.addEventListener("resize", function () { selectStep(cur); }, { passive: true });
  }

  /* ---- smooth anchor scroll with nav offset ---- */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var tgt = d.querySelector(id);
      if (!tgt) return;
      e.preventDefault();
      window.scrollTo({ top: tgt.getBoundingClientRect().top + window.scrollY - 84, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---- forms: validation + Formspree submission ---- */
  d.querySelectorAll("form[data-form]").forEach(function (form) {
    var statusEl = form.querySelector(".form-status");
    function setErr(field, msg) {
      var wrap = field.closest(".field");
      if (!wrap) return;
      wrap.classList.toggle("invalid", !!msg);
      var e = wrap.querySelector(".err");
      if (e) e.textContent = msg || "";
    }
    function validate() {
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var v = (f.value || "").trim();
        var msg = "";
        if (!v) msg = "This field is required.";
        else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Enter a valid email.";
        else if (f.type === "tel" && !/^[+\d][\d\s-]{7,15}$/.test(v)) msg = "Enter a valid phone number.";
        if (msg) ok = false;
        setErr(f, msg);
      });
      return ok;
    }
    form.querySelectorAll("[required]").forEach(function (f) {
      f.addEventListener("blur", function () {
        var v = (f.value || "").trim();
        setErr(f, v ? "" : "This field is required.");
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (statusEl) { statusEl.textContent = ""; statusEl.className = "form-status"; }
      if (!validate()) {
        if (statusEl) { statusEl.textContent = "Please fix the highlighted fields."; statusEl.className = "form-status bad"; }
        return;
      }
      var action = form.getAttribute("action") || "";
      var btn = form.querySelector('[type="submit"]');
      // No backend wired yet (placeholder Formspree id) → graceful fallback message.
      if (!action || action.indexOf("YOUR_FORM_ID") !== -1) {
        if (statusEl) { statusEl.textContent = "Thanks! Your details are recorded. (Connect Formspree to receive emails.)"; statusEl.className = "form-status ok"; }
        form.reset();
        return;
      }
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…"; }
      fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (r.ok) {
            if (statusEl) { statusEl.textContent = "Thank you! We'll be in touch within 24 hours."; statusEl.className = "form-status ok"; }
            form.reset();
          } else { throw new Error("bad"); }
        })
        .catch(function () {
          if (statusEl) { statusEl.textContent = "Something went wrong. Please email us directly."; statusEl.className = "form-status bad"; }
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || "Submit"; }
        });
    });
  });

  /* ---- GSAP progressive enhancement (hero) ---- */
  if (window.gsap && !prefersReduced) {
    try {
      gsap.from(".mentor-row .mentor", {
        y: 60, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.35,
        clearProps: "opacity,transform"
      });
    } catch (e) {}
  }

  /* ---- mentor cards: subtle 3D tilt + cursor sheen ---- */
  if (!prefersReduced && window.matchMedia("(pointer:fine)").matches) {
    d.querySelectorAll(".mentor").forEach(function (card) {
      var base = card.classList.contains("mentor-raise") ? -64 : 0;
      card.style.transformStyle = "preserve-3d";
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "translateY(" + (base - 6) + "px) perspective(700px) rotateY(" + (px * 7) + "deg) rotateX(" + (-py * 7) + "deg)";
        card.style.setProperty("--mx", (px * 100 + 50) + "%");
        card.style.setProperty("--my", (py * 100 + 50) + "%");
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---- magnetic gold buttons ---- */
  if (!prefersReduced && window.matchMedia("(pointer:fine)").matches) {
    d.querySelectorAll(".btn-gold.btn-lg").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.18 + "px," + (e.clientY - r.top - r.height / 2) * 0.28 + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }
})();
