(function(){
  'use strict';

  /* ===================== THEME TOGGLE ===================== */
  var root = document.documentElement;
  var themeBtn = document.getElementById('theme-toggle');
  function setTheme(t){
    root.setAttribute('data-theme', t);
    if(themeBtn){
      themeBtn.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      themeBtn.classList.toggle('active', t === 'dark');
    }
  }
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
  if(themeBtn){
    themeBtn.addEventListener('click', function(){
      var current = root.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ===================== MOBILE SIDEBAR ===================== */
  var hamburger = document.getElementById('hamburger-btn');
  var sidebar = document.getElementById('sidebar');
  var backdrop = document.getElementById('sidebar-backdrop');
  function openSidebar(){
    if(!sidebar) return;
    sidebar.classList.add('open');
    if(backdrop) backdrop.classList.add('show');
    if(hamburger) hamburger.setAttribute('aria-expanded', 'true');
  }
  function closeSidebar(){
    if(!sidebar) return;
    sidebar.classList.remove('open');
    if(backdrop) backdrop.classList.remove('show');
    if(hamburger) hamburger.setAttribute('aria-expanded', 'false');
  }
  if(hamburger){
    hamburger.addEventListener('click', function(){
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
  }
  if(backdrop){ backdrop.addEventListener('click', closeSidebar); }
  if(sidebar){
    sidebar.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ if(window.innerWidth <= 980){ closeSidebar(); } });
    });
  }

  /* ===================== PROGRESS BAR + BACK TO TOP ===================== */
  var progressBar = document.getElementById('progress-bar');
  var backToTop = document.getElementById('back-to-top');

  function onScroll(){
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if(progressBar) progressBar.style.width = pct + '%';
    if(backToTop){
      if(scrollTop > 500) backToTop.classList.add('show');
      else backToTop.classList.remove('show');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if(backToTop){
    backToTop.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ===================== PRINT ===================== */
  var printBtn = document.getElementById('print-btn');
  if(printBtn){ printBtn.addEventListener('click', function(){ window.print(); }); }

  /* ===================== EXPAND / COLLAPSE ALL ===================== */
  var expandBtn = document.getElementById('expand-all-btn');
  var expanded = false;
  if(expandBtn){
    expandBtn.addEventListener('click', function(){
      expanded = !expanded;
      document.querySelectorAll('details').forEach(function(d){ d.open = expanded; });
      expandBtn.classList.toggle('active', expanded);
      expandBtn.title = expanded ? 'Collapse all sections' : 'Expand all sections';
    });
  }

  /* ===================== COPY CODE BUTTON ===================== */
  document.querySelectorAll('.copy-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var card = btn.closest('.code-card');
      var codeEl = card ? card.querySelector('code') : null;
      if(!codeEl) return;
      var text = codeEl.textContent;
      var doCopyFallback = function(){
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch(e){}
        document.body.removeChild(ta);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).catch(doCopyFallback);
      } else {
        doCopyFallback();
      }
      var original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
      btn.classList.add('copied');
      setTimeout(function(){ btn.innerHTML = original; btn.classList.remove('copied'); }, 1800);
    });
  });

  /* ===================== SYNTAX HIGHLIGHTING (lightweight) ===================== */
  var PY_KEYWORDS = ['def','class','import','from','as','return','if','elif','else','for','while',
    'try','except','finally','with','in','is','not','and','or','lambda','None','True','False',
    'raise','yield','pass','break','continue','global','nonlocal','assert','del','async','await'];
  var BASH_KEYWORDS = ['if','then','else','fi','for','do','done','while','echo','export','cd','conda',
    'pip','activate','deactivate','create','install','list','env','docker','curl'];

  function escapeHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function highlightPython(code){
    var tokenRe = /(#.*$)|('''[\s\S]*?'''|"""[\s\S]*?"""|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+\.?\d*\b)|(@\w+)|(\b[A-Za-z_][A-Za-z0-9_]*(?=\())|(\b[A-Za-z_][A-Za-z0-9_]*\b)/gm;
    return code.replace(tokenRe, function(match, comment, str, num, dec, fn, word){
      if(comment !== undefined) return '<span class="tok-com">' + escapeHtml(comment) + '</span>';
      if(str !== undefined) return '<span class="tok-str">' + escapeHtml(str) + '</span>';
      if(num !== undefined) return '<span class="tok-num">' + escapeHtml(num) + '</span>';
      if(dec !== undefined) return '<span class="tok-dec">' + escapeHtml(dec) + '</span>';
      if(fn !== undefined) return '<span class="tok-fn">' + escapeHtml(fn) + '</span>';
      if(word !== undefined){
        if(PY_KEYWORDS.indexOf(word) !== -1) return '<span class="tok-kw">' + escapeHtml(word) + '</span>';
        return escapeHtml(word);
      }
      return escapeHtml(match);
    });
  }

  function highlightBash(code){
    var tokenRe = /(#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+\b)|(\$\w+|\$\{[^}]+\})|(\b[A-Za-z_][A-Za-z0-9_\-]*\b)/gm;
    return code.replace(tokenRe, function(match, comment, str, num, variable, word){
      if(comment !== undefined) return '<span class="tok-com">' + escapeHtml(comment) + '</span>';
      if(str !== undefined) return '<span class="tok-str">' + escapeHtml(str) + '</span>';
      if(num !== undefined) return '<span class="tok-num">' + escapeHtml(num) + '</span>';
      if(variable !== undefined) return '<span class="tok-fn">' + escapeHtml(variable) + '</span>';
      if(word !== undefined){
        if(BASH_KEYWORDS.indexOf(word) !== -1) return '<span class="tok-kw">' + escapeHtml(word) + '</span>';
        return escapeHtml(word);
      }
      return escapeHtml(match);
    });
  }

  function highlightOutput(code){ return escapeHtml(code); }

  document.querySelectorAll('.code-card code').forEach(function(codeEl){
    try {
      var raw = codeEl.textContent;
      var cls = codeEl.className || '';
      var html;
      if(cls.indexOf('language-python') !== -1){ html = highlightPython(raw); }
      else if(cls.indexOf('language-bash') !== -1){ html = highlightBash(raw); }
      else { html = highlightOutput(raw); }
      codeEl.innerHTML = html;
    } catch(highlightErr){ /* leave as plain visible text */ }
  });

  /* ===================== SCROLL REVEAL (safe: never hides content) ===================== */
  try {
    var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    var revealDone = false;
    function forceRevealAll(){
      revealEls.forEach(function(el){
        el.classList.remove('pre-anim');
        el.classList.add('in-view');
      });
      revealDone = true;
    }
    if('IntersectionObserver' in window && revealEls.length){
      revealEls.forEach(function(el){
        var rect = el.getBoundingClientRect();
        if(rect.top > window.innerHeight * 1.05){ el.classList.add('pre-anim'); }
      });
      var revealObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.remove('pre-anim');
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.01, rootMargin: '0px 0px -10px 0px' });
      revealEls.forEach(function(el){ revealObserver.observe(el); });
    }
    setTimeout(function(){ if(!revealDone){ forceRevealAll(); } }, 1200);
    window.addEventListener('load', function(){ setTimeout(forceRevealAll, 300); });
  } catch(revealErr){
    document.querySelectorAll('.reveal').forEach(function(el){
      el.classList.remove('pre-anim');
      el.classList.add('in-view');
    });
  }

  /* ===================== ANIMATED STAT COUNTERS ===================== */
  var statEls = Array.prototype.slice.call(document.querySelectorAll('.stat-grid b[data-count]'));
  var statsAnimated = false;
  function animateStats(){
    if(statsAnimated) return;
    statsAnimated = true;
    statEls.forEach(function(el){
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1100;
      var startTime = null;
      function step(ts){
        if(startTime === null) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = current + suffix;
        if(progress < 1){ requestAnimationFrame(step); }
        else { el.textContent = target + suffix; }
      }
      requestAnimationFrame(step);
    });
  }
  var statGrid = document.querySelector('.stat-grid');
  if(statGrid && 'IntersectionObserver' in window){
    var statObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){ if(entry.isIntersecting){ animateStats(); statObserver.disconnect(); } });
    }, { threshold: 0.4 });
    statObserver.observe(statGrid);
  } else if(statGrid){
    animateStats();
  }

  /* ===================== IN-PAGE SEARCH (current page only) ===================== */
  var searchInput = document.getElementById('site-search');
  var searchCount = document.getElementById('search-count');
  var searchableBlocks = Array.prototype.slice.call(document.querySelectorAll('main .block'));
  var searchTimer = null;

  function clearSearch(){
    searchableBlocks.forEach(function(b){ b.classList.remove('searchable-hide'); });
    if(searchCount) searchCount.style.display = 'none';
  }

  function runSearch(query){
    query = query.trim().toLowerCase();
    if(!query){ clearSearch(); return; }
    var totalMatches = 0;
    searchableBlocks.forEach(function(block){
      var text = block.textContent.toLowerCase();
      var match = text.indexOf(query) !== -1;
      block.classList.toggle('searchable-hide', !match);
      if(match){ totalMatches++; }
    });
    if(searchCount){
      searchCount.textContent = totalMatches + ' results';
      searchCount.style.display = 'inline-block';
    }
  }

  if(searchInput){
    searchInput.addEventListener('input', function(){
      clearTimeout(searchTimer);
      var val = searchInput.value;
      searchTimer = setTimeout(function(){ runSearch(val); }, 180);
    });
  }

  /* ===================== ACTIVE SIDEBAR LINK (based on current URL) ===================== */
  try {
    var here = window.location.pathname.replace(/index\.html$/, '');
    if(!here.endsWith('/')) here += '/';
    document.querySelectorAll('.sidebar nav a[href]').forEach(function(a){
      var linkPath = a.getAttribute('href');
      if(a.dataset.active === 'true'){ a.classList.add('active'); }
    });
  } catch(navErr){ /* no-op */ }

})();
