/* UroRef portfolio - interactions.
   Everything motion-related routes through motionOK() so that
   Easy read mode and prefers-reduced-motion switch it all off. */
(function () {
  'use strict';
  var root = document.documentElement;
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function easyOn() { return root.getAttribute('data-mode') === 'easy'; }
  function motionOK() { return !easyOn() && !mqReduce.matches; }
  function syncMotionClass() { root.classList.toggle('no-motion', mqReduce.matches); }
  syncMotionClass();
  if (mqReduce.addEventListener) mqReduce.addEventListener('change', syncMotionClass);

  /* ---------------------------------------------- easy read toggle */
  var toggles = document.querySelectorAll('[data-easy-toggle]');
  function renderToggleState() {
    var on = easyOn();
    toggles.forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
  }
  function applyMode(next) {
    if (next === 'easy') root.setAttribute('data-mode', 'easy');
    else root.removeAttribute('data-mode');
    try { localStorage.setItem('uroref-mode', next); } catch (e) {}
    renderToggleState();
    resetMotionState();
  }
  function toggleMode(btn) {
    var next = easyOn() ? 'default' : 'easy';
    var canVT = document.startViewTransition && !mqReduce.matches;
    if (!canVT) {
      root.classList.add('mode-anim');
      applyMode(next);
      setTimeout(function () { root.classList.remove('mode-anim'); }, 500);
      return;
    }
    root.classList.add('vt-circle');
    var vt = document.startViewTransition(function () { applyMode(next); });
    vt.ready.then(function () {
      var r = btn.getBoundingClientRect();
      var cx = r.left + r.width / 2;
      var cy = r.top + r.height / 2;
      var maxR = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      root.animate(
        { clipPath: ['circle(0px at ' + cx + 'px ' + cy + 'px)', 'circle(' + maxR + 'px at ' + cx + 'px ' + cy + 'px)'] },
        { duration: 650, easing: 'cubic-bezier(.2,.6,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () {});
    vt.finished.finally(function () { root.classList.remove('vt-circle'); });
  }
  toggles.forEach(function (b) { b.addEventListener('click', function () { toggleMode(b); }); });
  renderToggleState();

  /* ---------------------------------------------- header + progress */
  var progress = document.querySelector('.progress');
  var hdr = document.querySelector('.hdr');
  var lastY = 0;
  var ticking = false;
  function onScrollFrame() {
    ticking = false;
    var h = root;
    var max = h.scrollHeight - h.clientHeight;
    var y = h.scrollTop || document.body.scrollTop;
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    if (hdr) {
      if (y > 420 && y > lastY + 4) hdr.classList.add('hdr-hidden');
      else if (y < lastY - 4 || y < 420) hdr.classList.remove('hdr-hidden');
    }
    lastY = y;
    if (motionOK()) parallaxFrame(y);
    spyFrame(y);
    ariadneProgress();
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }, { passive: true });

  /* ---------------------------------------------- mobile menu */
  var navBtn = document.querySelector('.navtoggle');
  var menu = document.querySelector('.mobile-menu');
  if (navBtn && menu) {
    navBtn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        menu.classList.remove('open');
        navBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------------------------------------- reveals + draw-in */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in-view');
        if (e.target.classList.contains('draw')) e.target.classList.add('drawn');
        if (e.target.hasAttribute('data-countup')) runCountups(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('[data-reveal], .draw, [data-countup]').forEach(function (el) { io.observe(el); });
  } else {
    root.classList.add('no-io');
    document.querySelectorAll('.draw').forEach(function (el) { el.classList.add('drawn'); });
  }

  /* ---------------------------------------------- count-up stats */
  function runCountups(scope) {
    scope.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (!motionOK()) { el.textContent = target; return; }
      var start = null;
      var dur = 1400;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------------------------------------------- lazy 3D models */
  var mvEls = document.querySelectorAll('model-viewer[data-mv-src]');
  if (mvEls.length) {
    var mvLibLoaded = false;
    function loadMvLib() {
      if (mvLibLoaded) return;
      mvLibLoaded = true;
      var own = document.querySelector('script[src*="site.js"]');
      var base = own ? own.getAttribute('src').replace(/site\.js.*$/, '') : 'js/';
      var tag = document.createElement('script');
      tag.type = 'module';
      tag.src = base + 'model-viewer.min.js';
      document.head.appendChild(tag);
    }
    function armModel(el) {
      loadMvLib();
      el.setAttribute('src', el.getAttribute('data-mv-src'));
      if (motionOK()) {
        el.setAttribute('auto-rotate', '');
        el.setAttribute('autoplay', '');
      }
    }
    if ('IntersectionObserver' in window) {
      var mvIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          armModel(e.target);
          mvIO.unobserve(e.target);
        });
      }, { rootMargin: '600px 0px' });
      mvEls.forEach(function (el) { mvIO.observe(el); });
    } else {
      mvEls.forEach(armModel);
    }
  }

  /* ---------------------------------------------- headline cascade */
  var words = document.querySelector('.js-words');
  if (words) {
    if (motionOK()) requestAnimationFrame(function () { words.classList.add('play'); });
    else words.classList.add('play');
  }

  /* ---------------------------------------------- parallax */
  var pxEls = [];
  document.querySelectorAll('[data-px]').forEach(function (el) {
    pxEls.push({ el: el, k: parseFloat(el.getAttribute('data-px')) || 0.1 });
  });
  function parallaxFrame(y) {
    for (var i = 0; i < pxEls.length; i++) {
      var it = pxEls[i];
      var host = it.el.closest('section') || it.el.parentElement;
      var r = host.getBoundingClientRect();
      if (r.bottom < -80 || r.top > innerHeight + 80) continue;
      var mid = r.top + r.height / 2 - innerHeight / 2;
      var extra = it.el.hasAttribute('data-px-center') ? ' translateY(-50%)' : '';
      it.el.style.transform = 'translateY(' + (-mid * it.k).toFixed(1) + 'px)' + extra;
    }
  }
  function resetMotionState() {
    if (!motionOK()) {
      pxEls.forEach(function (it) {
        it.el.style.transform = it.el.hasAttribute('data-px-center') ? 'translateY(-50%)' : '';
      });
      document.querySelectorAll('[data-count]').forEach(function (el) {
        el.textContent = el.getAttribute('data-count');
      });
      document.querySelectorAll('.tiltable').forEach(function (el) { el.style.transform = ''; });
      document.querySelectorAll('model-viewer[src]').forEach(function (el) {
        el.removeAttribute('auto-rotate');
        el.removeAttribute('autoplay');
        if (typeof el.pause === 'function') { try { el.pause(); el.currentTime = 0; } catch (e) {} }
      });
    } else {
      document.querySelectorAll('model-viewer[src]').forEach(function (el) {
        el.setAttribute('auto-rotate', '');
        el.setAttribute('autoplay', '');
        if (typeof el.play === 'function') { try { el.play(); } catch (e) {} }
      });
    }
    ariadneProgress();
  }

  /* ---------------------------------------------- scroll spy */
  var spyLinks = document.querySelectorAll('.navlink[data-spy]');
  var spySections = [];
  spyLinks.forEach(function (l) {
    var el = document.getElementById(l.getAttribute('data-spy'));
    if (el) spySections.push({ link: l, el: el });
  });
  function spyFrame() {
    if (!spySections.length) return;
    var current = null;
    for (var i = 0; i < spySections.length; i++) {
      var r = spySections[i].el.getBoundingClientRect();
      if (r.top <= 140) current = spySections[i];
    }
    spySections.forEach(function (s) { s.link.classList.toggle('active', s === current); });
  }

  /* ---------------------------------------------- card cursor glow */
  document.querySelectorAll('.card, .mini').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      if (!motionOK()) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------------------------------------------- magnetic buttons */
  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      if (!motionOK()) return;
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      btn.style.transform = 'translate(' + (dx * 5).toFixed(1) + 'px,' + (dy * 4 - 2).toFixed(1) + 'px)';
    });
    btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
  });

  /* ---------------------------------------------- scene frame tilt */
  document.querySelectorAll('.tiltable').forEach(function (fig) {
    fig.addEventListener('pointermove', function (e) {
      if (!motionOK()) return;
      var r = fig.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      fig.style.transform = 'perspective(1100px) rotateY(' + (dx * 4).toFixed(2) + 'deg) rotateX(' + (-dy * 3.2).toFixed(2) + 'deg)';
    });
    fig.addEventListener('pointerleave', function () { fig.style.transform = ''; });
  });

  /* ---------------------------------------------- ariadne scene embed */
  var ariadne = document.querySelector('iframe[data-ariadne-src]');
  var ariadneHost = ariadne ? ariadne.closest('.scene-frame') : null;
  var ariadneSection = ariadne ? ariadne.closest('section') : null;
  function ariadnePost(msg) {
    if (!ariadne || !ariadne.contentWindow || !ariadne.hasAttribute('src')) return;
    try { ariadne.contentWindow.postMessage(msg, window.location.origin); } catch (e) {}
  }
  function ariadneProgress() {
    if (!ariadne || !ariadneSection) return;
    if (!motionOK()) {
      ariadnePost({ type: 'ariadne', p: 0.82, reduced: true });
      return;
    }
    var r = ariadneSection.getBoundingClientRect();
    var span = r.height + innerHeight;
    var p = span > 0 ? (innerHeight - r.top) / span : 0;
    p = Math.max(0, Math.min(1, p * 1.3));
    ariadnePost({ type: 'ariadne', p: p, reduced: false });
  }
  if (ariadne) {
    var armAriadne = function () {
      if (ariadne.hasAttribute('src')) return;
      ariadne.addEventListener('load', ariadneProgress);
      ariadne.setAttribute('src', ariadne.getAttribute('data-ariadne-src'));
    };
    if ('IntersectionObserver' in window) {
      var arIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          armAriadne();
          arIO.unobserve(e.target);
        });
      }, { rootMargin: '600px 0px' });
      arIO.observe(ariadne);
    } else {
      armAriadne();
    }
    if (ariadneHost) {
      ariadneHost.addEventListener('pointermove', function (e) {
        if (!motionOK()) return;
        var r = ariadneHost.getBoundingClientRect();
        ariadnePost({
          type: 'ariadne',
          mx: (e.clientX - r.left) / Math.max(1, r.width),
          my: (e.clientY - r.top) / Math.max(1, r.height)
        });
      });
    }
  }

  /* ---------------------------------------------- phone emulator panel */
  var emuTrigger = document.querySelector('[data-emu-trigger]');
  var emuPanel = document.querySelector('[data-emu-panel]');
  var emuBackdrop = document.querySelector('[data-emu-backdrop]');
  if (emuTrigger && emuPanel && emuBackdrop) {
    var emuCloseBtn = emuPanel.querySelector('[data-emu-close]');
    var emuTrack = emuPanel.querySelector('[data-emu-track]');
    var emuDots = Array.prototype.slice.call(emuPanel.querySelectorAll('[data-emu-dot]'));
    var emuShots = Array.prototype.slice.call(emuPanel.querySelectorAll('img[data-emu-src]'));
    var emuArmed = false;
    var emuIsOpen = false;

    function emuArm() {
      if (emuArmed) return;
      emuArmed = true;
      var pending = emuShots.length;
      if (!pending) { emuPanel.classList.add('emu-ready'); return; }
      emuShots.forEach(function (img) {
        img.addEventListener('load', function () {
          pending -= 1;
          if (pending <= 0) emuPanel.classList.add('emu-ready');
        }, { once: true });
        img.src = img.getAttribute('data-emu-src');
      });
    }
    function emuSetDot(idx) {
      emuDots.forEach(function (dot, i) {
        if (i === idx) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }
    function emuOpenPanel() {
      if (emuIsOpen) return;
      emuIsOpen = true;
      emuArm();
      emuBackdrop.hidden = false;
      emuPanel.hidden = false;
      if (motionOK()) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            emuBackdrop.classList.add('open');
            emuPanel.classList.add('open');
          });
        });
      } else {
        emuBackdrop.classList.add('open');
        emuPanel.classList.add('open');
      }
      document.documentElement.style.overflow = 'hidden';
      emuCloseBtn.focus();
    }
    function emuClosePanel() {
      if (!emuIsOpen) return;
      emuIsOpen = false;
      emuBackdrop.classList.remove('open');
      emuPanel.classList.remove('open');
      document.documentElement.style.overflow = '';
      var finish = function () { emuBackdrop.hidden = true; emuPanel.hidden = true; };
      if (motionOK()) setTimeout(finish, 380);
      else finish();
      emuTrigger.focus();
    }
    emuTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      emuOpenPanel();
    });
    emuCloseBtn.addEventListener('click', emuClosePanel);
    emuBackdrop.addEventListener('click', emuClosePanel);
    document.addEventListener('keydown', function (e) {
      if (!emuIsOpen) return;
      if (e.key === 'Escape') { emuClosePanel(); return; }
      if (e.key !== 'Tab') return;
      var items = Array.prototype.slice.call(
        emuPanel.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
      );
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    emuDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        emuTrack.scrollTo({ left: emuTrack.clientWidth * i, behavior: motionOK() ? 'smooth' : 'auto' });
        emuSetDot(i);
      });
    });
    emuTrack.addEventListener('scroll', function () {
      var idx = Math.round(emuTrack.scrollLeft / Math.max(1, emuTrack.clientWidth));
      emuSetDot(Math.max(0, Math.min(emuDots.length - 1, idx)));
    }, { passive: true });
  }

  onScrollFrame();
})();
