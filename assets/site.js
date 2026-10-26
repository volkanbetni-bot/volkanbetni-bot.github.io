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

  // Editor cost calculator.
  var S = { n: 8, f: 750 };
  function fmt(x) { return x.toLocaleString('tr-TR'); }
  function draw() {
    document.getElementById('c-n').textContent = S.n;
    document.getElementById('c-f').textContent = fmt(S.f) + ' TL';
    document.getElementById('c-m').textContent = fmt(S.n * S.f) + ' TL';
    document.getElementById('c-y').textContent = fmt(S.n * S.f * 12) + ' TL';
  }
  document.querySelectorAll('[data-calc]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-calc'), d = +b.getAttribute('data-d');
      S[k] = k === 'n' ? Math.max(1, Math.min(60, S[k] + d)) : Math.max(250, Math.min(10000, S[k] + d));
      draw();
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
})();
