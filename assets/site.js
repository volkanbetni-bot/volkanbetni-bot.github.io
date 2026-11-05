(function () {
  'use strict';
  var ua = navigator.userAgent || '';
  var mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  var os = mobile ? null : /Mac/i.test(ua) ? 'mac' : /Windows/i.test(ua) ? 'win' : null;

  // Highlight the buy button for the visitor's computer; on phones remind that the product runs on a computer.
  if (os) {
    document.querySelectorAll('[data-buy] [data-os="' + os + '"]').forEach(function (b) { b.classList.add('pick'); });
    var name = os === 'mac' ? 'Mac' : 'Windows';
    document.querySelectorAll('[data-os-hint]').forEach(function (e) { e.textContent = name + ' kullanıyorsun'; });
    document.querySelectorAll('[data-os-note]').forEach(function (e) { e.textContent = 'Bilgisayarın ' + name + ' görünüyor; ' + name + ' sürümünü seç.'; });
  } else if (mobile) {
    document.querySelectorAll('[data-os-note]').forEach(function (e) {
      e.textContent = 'ReelsKlon bilgisayarda çalışır. Telefondan satın alabilirsin; kullanacağın bilgisayarın sürümünü seç.';
    });
  }

  var videos = [].slice.call(document.querySelectorAll('video'));
  function pauseOthers(keep) { videos.forEach(function (v) { if (v !== keep && !v.muted) v.pause(); }); }

  // Hero: muted autoplay loop + "Sesli izle" toggle.
  var hero = document.getElementById('hero-video');
  var snd = document.querySelector('[data-sound]');
  function setHeroSound(on) {
    hero.muted = !on;
    snd.setAttribute('aria-pressed', on ? 'true' : 'false');
    snd.querySelector('span').textContent = on ? 'Sesi kapat' : 'Sesli izle';
  }
  if (hero && snd) {
    snd.addEventListener('click', function () {
      var on = hero.muted;
      setHeroSound(on);
      if (on) { hero.currentTime = 0; pauseOthers(hero); }
      var p = hero.play(); if (p && p.catch) p.catch(function () {});
    });
  }

  // Muted loops play only while on screen.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (v.muted) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.35 });
    [hero].concat([].slice.call(document.querySelectorAll('[data-autoview]'))).forEach(function (v) { if (v) io.observe(v); });
  }

  // Gallery: poster button -> real video with sound; one at a time.
  document.querySelectorAll('[data-play]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = btn.parentNode.querySelector('video');
      btn.hidden = true; v.hidden = false;
      if (hero && snd && !hero.muted) setHeroSound(false);
      pauseOthers(v);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
  });
  videos.forEach(function (v) { v.addEventListener('play', function () { if (!v.muted) pauseOthers(v); }); });

  // Cost calculator: business tab (editor fee vs ReelsKlon) and editor tab (hours won back).
  var S = { n: 8, f: 750, en: 20, eh: 2, ef: 750 };
  var LIM = { n: [1, 60], f: [250, 10000], en: [2, 200], eh: [0.5, 12], ef: [250, 10000] };
  function fmt(x) { return x.toLocaleString('tr-TR'); }
  function set(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }
  function draw() {
    set('c-n', S.n); set('c-f', fmt(S.f) + ' TL'); set('c-m', fmt(S.n * S.f) + ' TL'); set('c-y', fmt(S.n * S.f * 12) + ' TL');
    set('e-n', S.en); set('e-h', fmt(S.eh) + ' saat'); set('e-f', fmt(S.ef) + ' TL');
    // ~30 min of the editor's own review and touch-up per draft is assumed (stated next to the result).
    var won = Math.max(0, S.en * (S.eh - 0.5));
    set('e-s', fmt(Math.round(won)) + ' saat'); set('e-y', fmt(Math.round(won * 12)) + ' saat');
    set('e-a', Math.ceil(1000 / S.ef) + ' Reels');
  }
  document.querySelectorAll('[data-calc]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-calc'), d = +b.getAttribute('data-d');
      S[k] = Math.max(LIM[k][0], Math.min(LIM[k][1], S[k] + d));
      draw();
    });
  });
  document.querySelectorAll('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-tab');
      document.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      document.querySelectorAll('[data-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== k; });
    });
  });
  if (document.getElementById('c-n')) draw();

  // Mobile buy bar steps aside while the price card or final CTA is on screen.
  var bar = document.querySelector('.mbar');
  var targets = [document.getElementById('satin-al'), document.querySelector('.final')].filter(Boolean);
  if (bar && targets.length && 'IntersectionObserver' in window) {
    var vis = new Set();
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.isIntersecting ? vis.add(e.target) : vis.delete(e.target); });
      bar.classList.toggle('hide', vis.size > 0);
    }, { threshold: 0.2 });
    targets.forEach(function (t) { io2.observe(t); });
  }

  // Launch price: real deadline 2026-11-05 23:59 (Europe/Istanbul, UTC+3). Days only, no ticking seconds.
  var END = Date.parse('2026-11-05T23:59:59+03:00');
  var cdBoxes = document.querySelectorAll('[data-cd]');
  function tick() {
    var ms = END - Date.now();
    if (ms <= 0) { cdBoxes.forEach(function (el) { el.hidden = true; }); return; }
    var d = Math.floor(ms / 86400000);
    cdBoxes.forEach(function (el) {
      var left = el.querySelector('.cd-left');
      if (left) left.innerHTML = d > 0 ? '<b>' + d + '</b> gün kaldı' : '<b>Son gün</b>';
    });
  }
  tick();

  // Reviews: show 6, expand to all.
  var revMore = document.querySelector('[data-rev-more]');
  if (revMore) revMore.addEventListener('click', function () { document.querySelector('[data-revs]').classList.add('open'); });
})();
