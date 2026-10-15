/* Builds the whole web page from the content in content.js.
   Used by the admin panel (preview, Publish and Download ZIP). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SiteTemplate = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var ICON = {
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>'
  };
  var BIRD = '<svg class="bird" viewBox="0 0 60 30"><path d="M4 18q12-14 26 0q14-14 26 0q-12-4-26 8q-14-12-26-8z" fill="currentColor"/></svg>';
  var FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Karla:wght@400;600&display=swap';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function attr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function safeUrl(u) { u = String(u || '').trim(); return /^(https?:\/\/|mailto:|#|\/|images\/)/i.test(u) ? u : '#'; }
  /* Small text format: **bold**  *italic*  [link text](https://address)  and line breaks. */
  function fmt(s) {
    var t = esc(s);
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, a, u) {
      u = safeUrl(u.replace(/&amp;/g, '&'));
      var ext = /^https?:/i.test(u) ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + attr(u) + '"' + ext + '>' + a + '</a>';
    });
    t = t.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*\n]+)\*/g, '<i>$1</i>');
    return t.replace(/\n/g, '<br>');
  }
  function paras(s) {
    return String(s || '').split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p) { return '<p>' + fmt(p) + '</p>'; }).join('');
  }
  function lis(a) { return (a || []).map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join(''); }

  function slugify(s) { return String(s || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70); }
  function isAbs(u) { return /^(data:|https?:|mailto:|\/|#)/i.test(u); }
  function fmtDate(d) {
    var m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return '';
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }
  function rfcDate(d) { var m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).toUTCString() : ''; }
  function published(C) {
    return (C.posts || []).filter(function (p) { return p.status === 'published' && p.slug && p.title; })
      .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  }
  function readMin(p) { var w = String(p.body || '').split(/\s+/).filter(Boolean).length; return Math.max(1, Math.round(w / 200)); }
  function postPath(p) { return 'posts/' + p.slug + '.html'; }
  /* YouTube: video id from a link, and the "latest updates" section rules */
  function ytId(u) {
    u = String(u || '').trim(); var m;
    if ((m = u.match(/^https?:\/\/(?:www\.|m\.|music\.)?youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/|v\/)([\w-]{11})/i))) return m[1];
    if ((m = u.match(/^https?:\/\/youtu\.be\/([\w-]{11})/i))) return m[1];
    return /^[\w-]{11}$/.test(u) ? u : '';
  }
  function chanOk(id) { return /^UC[\w-]{22}$/.test(String(id || '').trim()); }
  function updVideos(C) { return ((C.updates || {}).videos || []).filter(function (v) { return ytId(v.url); }); }
  function hasUpdates(C) { var U = C.updates; return !!U && U.show !== 'no' && (chanOk((C.site || {}).youtubeChannelId) || updVideos(C).length > 0); }
  /* Post body: ## heading, ### sub-heading, - bullets, 1. numbers, > quote, ![description](images/photo.jpg), --- line */
  function blocks(src, U) {
    var lines = String(src || '').replace(/\r/g, '').split('\n'), out = [], i = 0, m;
    var START = /^(#{2,3}\s|[-*]\s|\d+[.)]\s|>|!\[|-{3,}\s*$)/;
    while (i < lines.length) {
      var l = lines[i];
      if (!l.trim()) { i++; continue; }
      if ((m = l.match(/^(#{2,3})\s+(.+)$/))) { out.push('<h' + m[1].length + '>' + fmt(m[2]) + '</h' + m[1].length + '>'); i++; continue; }
      if (/^(-{3,}|\*{3,})\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
      if ((m = l.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
        out.push('<figure class="pfig"><img loading="lazy" src="' + attr(U(m[2])) + '" alt="' + attr(m[1]) + '">' + (m[1] ? '<figcaption>' + esc(m[1]) + '</figcaption>' : '') + '</figure>'); i++; continue;
      }
      if (/^>\s?/.test(l)) { var q = []; while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, '')); i++; } out.push('<blockquote>' + fmt(q.join('\n')) + '</blockquote>'); continue; }
      if (/^[-*]\s+/.test(l)) { var it = []; while (i < lines.length && /^[-*]\s+/.test(lines[i])) { it.push(lines[i].replace(/^[-*]\s+/, '')); i++; } out.push('<ul>' + lis(it) + '</ul>'); continue; }
      if (/^\d+[.)]\s+/.test(l)) { var nt = []; while (i < lines.length && /^\d+[.)]\s+/.test(lines[i])) { nt.push(lines[i].replace(/^\d+[.)]\s+/, '')); i++; } out.push('<ol>' + lis(nt) + '</ol>'); continue; }
      var p = []; while (i < lines.length && lines[i].trim() && !(p.length && START.test(lines[i]))) { p.push(lines[i]); i++; }
      out.push('<p>' + fmt(p.join('\n')) + '</p>');
    }
    return out.join('\n');
  }


  /* ---------- recommended order, defaults and upgrading older content ---------- */
  var LAYOUT = 2;
  var DEFAULT_MENU = [['top', 'Home'], ['updates', 'Latest Updates'], ['blog', 'Blog'], ['about', 'About'], ['journey', 'My 3-Year Sparrow Journey'],
    ['observed', 'What I Have Observed'], ['hub', 'Sparrow Knowledge Hub'], ['invite', 'How to Invite Sparrows'], ['balcony', 'Sparrow-Friendly Home / Balcony'],
    ['indepth', 'In Depth: Daily Life of Sparrows'], ['babies', 'Sparrow Babies & Nesting'], ['myths', 'Myths vs Facts'], ['rescue', 'Rescue & Help'],
    ['stories', 'Stories from My Sparrow Family'], ['connect', 'On Social Media'], ['idea', 'Share Your Idea'], ['contact', 'Contact']];
  var BLOG_OLD = { title: 'Latest Posts', viewAll: 'View all posts', indexTitle: 'All Posts', emptyText: 'Posts are coming soon.' };
  var BLOG_NEW = {
    title: 'Latest from the Blog',
    sub: 'Notes, observations and guides from three years of living with sparrows.',
    viewAll: 'Read all blog posts',
    indexTitle: 'All Blog Posts',
    indexSub: 'Everything I have written about sparrows, nesting, food and living together.',
    homeCount: 3,
    emptyText: 'My first blog posts are on the way: notes on sparrow food, nests, chicks and everyday life. Follow along to hear when they are out.'
  };
  var HUB_OLD = 'How to Invite Sparrows>invite|Sparrow Behaviour>t-behaviour|Nesting & Breeding>babies|Caring for Chicks>babies|Food & Feeding>t-food|Water>t-food|Creating Sparrow-Friendly Spaces>balcony|Common Dangers>t-harm|Myths vs Facts>myths';
  var HUB_NEW = [['🏡', 'How to Invite Sparrows', 'invite'], ['🌿', 'Creating Sparrow-Friendly Spaces', 'balcony'], ['🌅', 'Daily Life of Sparrows', 't-rhythm'],
    ['🐦', 'Sparrow Behaviour', 't-behaviour'], ['🌾', 'Food & Feeding', 't-food'], ['💧', 'Water', 't-food'], ['⚠️', 'Common Dangers', 't-harm'],
    ['🪺', 'Nesting & Breeding', 'babies'], ['🐣', 'Caring for Chicks', 'babies'], ['❓', 'Myths vs Facts', 'myths'], ['🆘', 'Rescue & Help', 'rescue'], ['📝', 'Read the Blog', 'blog']]
    .map(function (c) { return { icon: c[0], label: c[1], target: c[2] }; });
  var INDEPTH_ORDER = ['t-rhythm', 't-behaviour', 't-food', 't-harm'];
  /* Brings any content (an old draft, an older published version) up to date. Safe to run again and again. */
  function normalize(C) {
    var i, k;
    C.blog = C.blog || {}; C.posts = Array.isArray(C.posts) ? C.posts : [];
    if (!C.updates) C.updates = { show: 'yes', title: 'Latest Updates', sub: 'The newest video from my YouTube channel. It updates by itself whenever I upload a new one.', videosTitle: 'More to watch', videos: [], watchText: 'Watch all videos on YouTube', subscribeText: 'Subscribe' };
    if (C.site && C.site.youtubeChannelId === undefined) C.site.youtubeChannelId = '';
    var old = (C.layoutVersion || 0) < LAYOUT;
    if (old) {
      for (k in BLOG_OLD) if (C.blog[k] === BLOG_OLD[k]) delete C.blog[k];
      if (C.indepth && C.indepth.items && C.indepth.sub === 'Daily rhythm, food and water, behaviour and dangers, with photos from my home.') C.indepth.sub = 'Daily rhythm, behaviour, food and water, and dangers, with photos from my home.';
      if (C.indepth && C.indepth.items) {
        var rank = function (t) { var n = INDEPTH_ORDER.indexOf(t.id); return n < 0 ? 99 : n; };
        C.indepth.items = C.indepth.items.map(function (t, n) { return { t: t, n: n }; }).sort(function (a, b) { return rank(a.t) - rank(b.t) || a.n - b.n; }).map(function (x) { return x.t; });
      }
      if (C.hub && C.hub.cards && C.hub.cards.map(function (c) { return c.label + '>' + c.target; }).join('|') === HUB_OLD) C.hub.cards = JSON.parse(JSON.stringify(HUB_NEW));
    }
    for (k in BLOG_NEW) if (C.blog[k] === undefined || C.blog[k] === '') C.blog[k] = BLOG_NEW[k];
    /* the menu: also decides the order of the sections on the page */
    var labels = {}, menu = [];
    (C.menu || []).forEach(function (m) { labels[m.id] = m.label; });
    if (labels.blog === undefined || labels.blog === 'Latest Posts') labels.blog = 'Blog';
    if (old || !C.menu) {
      DEFAULT_MENU.forEach(function (m) { menu.push({ id: m[0], label: labels[m[0]] || m[1] }); });
      (C.menu || []).forEach(function (m) { if (!DEFAULT_MENU.some(function (d) { return d[0] === m.id; })) menu.push(m); });
    } else {
      menu = C.menu.map(function (m) { return m.id === 'blog' && m.label === 'Latest Posts' ? { id: 'blog', label: 'Blog' } : m; });
      DEFAULT_MENU.forEach(function (m, n) {
        if (menu.some(function (x) { return x.id === m[0]; })) return;
        var at = 0; for (i = n - 1; i >= 0; i--) { var j = menu.map(function (x) { return x.id; }).indexOf(DEFAULT_MENU[i][0]); if (j > -1) { at = j + 1; break; } }
        menu.splice(at, 0, { id: m[0], label: m[1] });
      });
    }
    var topAt = menu.map(function (x) { return x.id; }).indexOf('top');
    if (topAt > 0) menu.unshift(menu.splice(topAt, 1)[0]);
    C.menu = menu; C.layoutVersion = LAYOUT;
    return C;
  }

  function mkU(R, pre) { return function (p) { var r = R(p); return isAbs(r) ? r : (pre || '') + r; }; }
  function chrome(C, o) {
    var S = C.site, pre = o.pre || '', domain = String(S.domain || '').replace(/\/+$/, ''), hasPosts = published(C).length > 0, hasUp = hasUpdates(C);
    var soc = [['facebook', 'Facebook', S.facebook], ['youtube', 'YouTube', S.youtube], ['instagram', 'Instagram', S.instagram]]
      .filter(function (x) { return x[2]; });
    var socHtml = '<div class="socs">' + soc.map(function (x) {
      return '<a class="soc" href="' + attr(safeUrl(x[2])) + '" target="_blank" rel="noopener" aria-label="' + x[1] + '">' + ICON[x[0]] + '</a>';
    }).join('') + '</div>';
    var org = { '@context': 'https://schema.org', '@type': 'Organization', name: S.brand, alternateName: S.altNames || [],
      founder: { '@type': 'Person', name: S.founder }, sameAs: soc.map(function (x) { return x[2]; }) };
    if (domain) org.url = domain + '/';
    var lds = [org].concat(o.extraLd || []);
    var img = o.ogImage && domain ? (isAbs(o.ogImage) ? o.ogImage : domain + '/' + o.ogImage) : '';
    if (/^data:/.test(img)) img = '';
    var head = (o.base ? '<base href="' + attr(o.base) + '">' : '') + '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<title>' + esc(o.title) + '</title>\n<meta name="description" content="' + attr(o.desc) + '">\n' +
      '<link href="' + FONTS + '" rel="stylesheet">\n<link rel="stylesheet" href="' + pre + 'style.css"><meta name="theme-color" content="#1f3d2b">\n' +
      '<link rel="icon" href="' + pre + 'favicon.svg" type="image/svg+xml">\n' +
      '<meta property="og:type" content="' + (o.ogType || 'website') + '"><meta property="og:title" content="' + attr(o.title) + '">\n' +
      '<meta property="og:description" content="' + attr(o.desc) + '">\n' +
      (domain ? '<link rel="canonical" href="' + attr(domain + '/' + (o.path || '')) + '"><meta property="og:url" content="' + attr(domain + '/' + (o.path || '')) + '">' +
        (img ? '<meta property="og:image" content="' + attr(img) + '">' : '') + '\n' : '') +
      (domain && hasPosts ? '<link rel="alternate" type="application/rss+xml" title="' + attr(S.brand) + '" href="' + attr(domain) + '/feed.xml">\n' : '') +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      lds.map(function (l) { return '<script type="application/ld+json">' + JSON.stringify(l).replace(/</g, '\\u003c') + '</script>\n'; }).join('');
    var menu = (C.menu || []).filter(function (m) { return m.id !== 'updates' || hasUp; }).map(function (m, n) {
      return '<a href="' + pre + '#' + attr(m.id) + '"><b>' + ('0' + (n + 1)).slice(-2) + '</b> ' + esc(m.label) + '</a>';
    }).join('');
    var nav = '<nav><i id="prog"></i><div class="wrap"><a class="brand" href="' + pre + '#top">' + esc(S.brand) + '</a><div class="l">' + socHtml +
      '<a class="h" href="' + pre + '#blog">Blog</a><a class="h" href="' + pre + '#idea">Share an Idea</a><button id="mb" class="menu-btn" type="button" aria-expanded="false" aria-controls="menu">Menu ☰</button></div></div>' +
      '<div id="menu" hidden><div class="mg">' + menu + '</div></div></nav>\n';
    var email = S.email;
    var foot = '<footer>© ' + esc(S.brand) + ' · ' + esc(S.founder) + ' · <a href="mailto:' + attr(email) + '">' + esc(email) + '</a>' +
      (S.youtube ? ' · <a href="' + attr(safeUrl(S.youtube)) + '" target="_blank" rel="noopener">YouTube</a>' : '') +
      (S.facebook ? ' · <a href="' + attr(safeUrl(S.facebook)) + '" target="_blank" rel="noopener">Facebook</a>' : '') +
      (S.instagram ? ' · <a href="' + attr(safeUrl(S.instagram)) + '" target="_blank" rel="noopener">Instagram</a>' : '') +
      (hasPosts ? ' · <a href="' + pre + 'posts/">Blog</a>' : '') + '</footer>';
    var tail = '<dialog id="dlg"><button type="button" id="x">Close</button><img id="big" alt=""></dialog><button id="totop" class="totop" type="button" aria-label="Back to top">↑</button>' +
      '<script src="' + pre + 'script.js" defer></script>\n';
    return { soc: soc, head: head, nav: nav, foot: foot, tail: tail, domain: domain };
  }
  function pcard(p, pre, U) {
    var href = pre + postPath(p);
    var cover = p.cover && p.cover.src ? '<img loading="lazy" src="' + attr(U(p.cover.src)) + '" alt="">' : '<span aria-hidden="true">🐦</span>';
    return '<article class="pcard" data-cat="' + attr(p.category || '') + '"><a class="pimg" href="' + attr(href) + '" tabindex="-1" aria-hidden="true">' + cover + '</a><div class="pbd">' +
      (p.category ? '<span class="cat">' + esc(p.category) + '</span>' : '') + '<h3><a href="' + attr(href) + '">' + esc(p.title) + '</a></h3><p>' + fmt(p.excerpt) + '</p>' +
      '<span class="dt">' + esc(fmtDate(p.date)) + ' · ' + readMin(p) + ' min read</span><a class="btn alt" href="' + attr(href) + '">Read post →</a></div></article>';
  }

  function render(C, opt) {
    opt = opt || {};
    var R = opt.resolve || function (x) { return x; };
    var S = C.site, H = C.hero, domain = String(S.domain || '').replace(/\/+$/, '');
    var fbName = (String(S.facebook).match(/facebook\.com\/([^\/?#]+)/) || [])[1];
    function pic(i) {
      return '<button class="ph" aria-label="Open photo: ' + attr(i.alt) + '"><img loading="lazy" src="' + attr(R(i.src)) + '" alt="' + attr(i.alt) + '"></button>';
    }
    function pics(list, cls) { return list && list.length ? '<div class="pics' + (cls ? ' ' + cls : '') + '">' + list.map(pic).join('') + '</div>' : ''; }
    function secHead(o) { return '<h2>' + esc(o.title) + '</h2>' + (o.sub ? '<p class="sub">' + fmt(o.sub) + '</p>' : ''); }
    /* A section is kept as a piece; render() puts the pieces in menu order and alternates the background bands. */
    function sec(id, cls, o, inner) { return { id: id, cls: cls || '', html: '<div class="wrap">' + secHead(o) + inner + '</div>' }; }
    function card(cls, o) { return '<div class="' + cls + '"><h3>' + esc(o.title) + '</h3>' + paras(o.text) + '</div>'; }

    var ch = chrome(C, { title: S.seoTitle, desc: S.seoDescription, base: opt.base, ogImage: H.image.src });
    var soc = ch.soc, head = ch.head, nav = ch.nav;

    var hero = '<header class="hero" id="top"><div class="sky" id="sky" aria-hidden="true">' + BIRD + BIRD + BIRD + '</div><div class="wrap"><div>' +
      '<p class="eye">' + esc(H.eyebrow) + '</p><h1>' + esc(H.title) + '</h1>\n<p class="tag">' + fmt(H.tagline) + '</p>\n<p class="s">' + fmt(H.intro) + '</p>\n</div>\n' +
      '<figure><img src="' + attr(R(H.image.src)) + '" alt="' + attr(H.image.alt) + '"></figure></div></header>\n';

    var Up = C.updates || {}, chan = String(S.youtubeChannelId || '').trim(), vids = updVideos(C), yurl = S.youtube ? safeUrl(S.youtube) : '';
    var player = chanOk(chan) ? '<div class="vframe">' + (opt.base ? '<div class="vph"><span aria-hidden="true">▶</span><p>Your newest YouTube video plays here on the live website.</p></div>' :
      '<iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=UU' + attr(chan.slice(2)) + '" title="' + attr('Latest video from ' + S.brand) + '" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>') + '</div>' : '';
    var vcards = vids.length ? (Up.videosTitle ? '<h3 class="vmore">' + esc(Up.videosTitle) + '</h3>' : '') + '<div class="vgrid">' + vids.map(function (v) {
      var id = ytId(v.url);
      return '<a class="vcard" href="https://www.youtube.com/watch?v=' + id + '" target="_blank" rel="noopener"><span class="vth"><img loading="lazy" src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt=""><i aria-hidden="true">▶</i></span><b>' + esc(v.title || 'Watch on YouTube') + '</b></a>';
    }).join('') + '</div>' : '';
    var vbtns = yurl ? '<div class="row vbtns"><a class="btn" href="' + attr(yurl) + '" target="_blank" rel="noopener">' + esc(Up.watchText || 'Watch all videos on YouTube') + '</a>' +
      '<a class="btn alt" href="' + attr(yurl + (yurl.indexOf('?') > -1 ? '&' : '?') + 'sub_confirmation=1') + '" target="_blank" rel="noopener">' + esc(Up.subscribeText || 'Subscribe') + '</a></div>' : '';
    var updates = hasUpdates(C) ? sec('updates', 'yt', Up, player + vcards + vbtns) : null;

    var A = C.about;
    var about = { id: 'about', cls: 'note', html: '<div class="wrap">\n<h2>' + esc(A.title) + '</h2>\n<p class="namenote">' + fmt(A.nameNote) + '</p>\n<p class="lead">' + fmt(A.lead) + '</p>\n' +
      paras(A.paragraphs) + '\n<blockquote>' + fmt(A.quote) + '</blockquote>\n<p>' + fmt(A.thanks) + '</p>\n' +
      '<div class="sig"><span>' + esc(A.sigWith) + '</span><b>' + esc(A.sigName) + '</b><span>' + esc(A.sigRole) + '</span></div></div>' };

    var J = C.journey, journey = sec('journey', '', J, '<ol class="tl">' + J.items.map(function (i) { return '<li><h3>' + esc(i.title) + '</h3>' + paras(i.text) + '</li>'; }).join('') + '</ol>');
    var O = C.observed, observed = sec('observed', '', O, '<div class="og">' + O.items.map(function (i) { return card('oc', i); }).join('') + '</div>' +
      (O.pull ? '<blockquote class="pq">“' + fmt(O.pull) + '”<span>' + esc(O.pullBy) + '</span></blockquote>' : ''));
    var V = C.invite, invite = sec('invite', '', V, '<ol class="steps">' + V.items.map(function (i) { return '<li class="stp"><h3>' + esc(i.title) + '</h3>' + paras(i.text) + '</li>'; }).join('') + '</ol>' +
      (V.note ? '<p class="disc">' + fmt(V.note) + '</p>' : ''));
    var D = C.indepth, indepth = sec('indepth', '', D, D.items.map(function (t, n) {
      return '<div class="topic" id="' + attr(t.id) + '"><div><span class="num">' + ('0' + (n + 1)).slice(-2) + '</span><h3>' + esc(t.title) + '</h3>' + paras(t.text) +
        ((t.bullets || []).length ? '<ul>' + lis(t.bullets) + '</ul>' : '') + '</div>' + pics(t.images) + '</div>';
    }).join(''));
    var B = C.babies;
    function cbox(cls, b) { return '<div class="' + cls + '"><span>' + esc(b.label) + '</span><ul>' + lis(b.bullets) + '</ul><p>' + fmt(b.text) + '</p></div>'; }
    var babies = sec('babies', '', B, pics(B.images) + '<div class="qg">' + B.items.map(function (i) { return card('q', i); }).join('') + '</div>' +
      '<div class="cmp">' + cbox('ok2', B.fine) + cbox('help', B.help) + '</div>');
    var M = C.myths, ob = M.obs, pr = M.proof;
    var myths = sec('myths', '', M, '<div class="mf">' + M.items.map(function (m) {
      return '<div class="mc"><div class="m"><span>Myth</span><p>' + fmt(m.myth) + '</p></div><div class="f"><span>Fact</span>' + paras(m.fact) + '</div></div>';
    }).join('') + '</div>' +
      '<div class="obs"><span class="tg">' + esc(ob.tag) + '</span>\n<div class="m2"><span>Myth</span><p>' + fmt(ob.myth) + '</p></div>\n<div class="f2"><span>Fact</span>' + paras(ob.fact) + '</div>\n<p class="cav">' + fmt(ob.caveat) + '</p></div>' +
      '<div class="proof"><h3>' + esc(pr.title) + '</h3><p class="pnote">' + fmt(pr.note) + '</p><div class="pg">' + pr.cards.map(function (c) {
        return '<div class="pf"><h4>' + esc(c.claim) + '</h4><p>' + fmt(c.text) + '</p><ul>' + (c.links || []).map(function (l) {
          return '<li><a href="' + attr(safeUrl(l.url)) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a></li>';
        }).join('') + '</ul></div>';
      }).join('') + '</div><p class="pnote">' + fmt(pr.general) + '</p><p class="pnote">' + fmt(pr.disclaimer) + '</p></div>');
    var L = C.balcony;
    var balcony = sec('balcony', '', L, '<div class="bg">' + L.items.map(function (i) {
      return '<div class="bc">' + (i.icon ? '<span>' + esc(i.icon) + '</span>' : '') + '<h3>' + esc(i.title) + '</h3>' + paras(i.text) + '</div>';
    }).join('') + '</div>' + pics(L.images, 'three') +
      '<h3 class="in2">' + esc(L.seasonsTitle) + '</h3><div class="seasons">' + L.seasons.map(function (s) {
        return '<div class="sn"><span>' + esc(s.icon) + '</span><h4>' + esc(s.title) + '</h4><p>' + fmt(s.text) + '</p></div>';
      }).join('') + '</div>\n<h3 class="in2">' + esc(L.checkTitle) + '</h3><div id="chk2" class="chkl">' +
      L.checklist.map(function (c) { return '<label><input type="checkbox"> ' + esc(c) + '</label>'; }).join('') +
      '</div><div class="meter2"><i id="mt2"></i></div><p class="fnote" id="mr2">' + esc(L.checkHint) + '</p>');
    var Z = C.rescue, rescue = sec('rescue', '', Z, '<div class="qg">' + Z.items.map(function (i) { return card('q', i); }).join('') + '</div>' +
      (Z.disclaimer ? '<p class="disc">' + fmt(Z.disclaimer) + '</p>' : ''));
    var T = C.stories, stories = sec('stories', '', T, '<div class="sg">' + T.items.map(function (s) {
      return '<article class="sc"><div class="th">' + (s.image && s.image.src ? '<img loading="lazy" src="' + attr(R(s.image.src)) + '" alt="' + attr(s.image.alt || s.title) + '">' : esc(s.icon)) +
        '</div><div class="bd"><h3>' + esc(s.title) + '</h3>' + paras(s.text) + '</div></article>';
    }).join('') + '</div>');
    var btns = soc.map(function (x) { return '<a class="btn" href="' + attr(safeUrl(x[2])) + '" target="_blank" rel="noopener">' + x[1] + '</a>'; }).join('');
    var posts = published(C), Bg = C.blog || {}, U0 = mkU(R, '');
    var blogInner = posts.length
      ? '<div class="pgrid">' + posts.slice(0, Bg.homeCount || 3).map(function (p) { return pcard(p, '', U0); }).join('') + '</div><p class="center"><a class="btn" href="posts/">' + esc(Bg.viewAll || 'Read all blog posts') + '</a></p>'
      : '<div class="blogsoon"><span aria-hidden="true">✍️</span><p>' + fmt(Bg.emptyText || 'Blog posts are coming soon.') + '</p>' +
        (soc.length ? '<div class="row">' + soc.map(function (x) { return '<a class="btn alt" href="' + attr(safeUrl(x[2])) + '" target="_blank" rel="noopener">Follow on ' + x[1] + '</a>'; }).join('') + '</div>' : '') + '</div>';
    var blog = sec('blog', '', { title: Bg.title || 'Latest from the Blog', sub: Bg.sub }, blogInner);
    var connect = sec('connect', '', C.connect, '<div class="row">' + btns + '</div>');
    var I = C.idea, email = S.email;
    var idea = sec('idea', '', I, '\n<div class="ig"><form class="ideaform" id="ideaForm" novalidate data-email="' + attr(email) + '">\n' +
      '<label>Your name (optional)<input name="n" maxlength="60" autocomplete="name"></label>\n' +
      '<label>Your email (so we can reply, optional)<input name="e" type="email" maxlength="80" autocomplete="email"></label>\n' +
      '<label>What would you like to share?<select name="t"><option>Idea</option><option>Question</option><option>Observation</option><option>Story</option></select></label>\n' +
      '<label>Your message<textarea name="m" rows="5" maxlength="900" placeholder="Write your idea here..." required></textarea></label>\n' +
      '<div class="row"><button class="btn" type="submit">Send by Email</button><button class="btn alt" type="button" id="cp">Copy message</button></div>\n' +
      '<p class="fnote" id="ideaMsg" role="status" aria-live="polite">This opens your email app with your message ready. Press Send there to finish.</p></form>\n' +
      '<div class="ideainfo"><h3>How it works</h3><ol>' + (I.steps || []).map(function (s) { return '<li>' + fmt(s.replace(/\{email\}/g, '[' + email + '](mailto:' + email + ')')) + '</li>'; }).join('') + '</ol>\n' +
      (I.note ? '<p class="disc">' + fmt(I.note) + '</p>' : '') + '</div></div>');
    var messenger = fbName ? 'https://m.me/' + fbName : S.facebook;
    var contact = sec('contact', '', C.contact, '<div class="row"><a class="btn" href="mailto:' + attr(email) + '">Email us</a>' +
      (S.facebook ? '<a class="btn alt" href="' + attr(messenger) + '" target="_blank" rel="noopener">Message on Facebook</a>' : '') +
      (S.youtube ? '<a class="btn alt" href="' + attr(safeUrl(S.youtube)) + '" target="_blank" rel="noopener">Comment on YouTube</a>' : '') + '</div>');
    var K = C.hub, hub = sec('hub', '', K, '<div class="hc">' + K.cards.filter(function (c) { return c.target !== 'updates' || hasUpdates(C); }).map(function (c) {
      return '<a href="#' + attr(c.target) + '"><span>' + esc(c.icon) + '</span>' + esc(c.label) + '</a>';
    }).join('') + '</div>');
    var foot = ch.foot, tail = ch.tail;
    var PIECES = { updates: updates, blog: blog, about: about, journey: journey, observed: observed, invite: invite, indepth: indepth, babies: babies, myths: myths,
      balcony: balcony, rescue: rescue, stories: stories, connect: connect, idea: idea, contact: contact, hub: hub };
    var order = [];
    (C.menu || []).forEach(function (m) { if (PIECES[m.id] && order.indexOf(m.id) < 0) order.push(m.id); });
    DEFAULT_MENU.forEach(function (m) { if (PIECES[m[0]] && order.indexOf(m[0]) < 0) order.push(m[0]); });
    var flip = !updates, page = order.map(function (id) {
      var x = PIECES[id], cls = x.cls;
      if (!/(^| )yt( |$)/.test(cls)) { if (flip) cls += (cls ? ' ' : '') + 'alt'; flip = !flip; }
      return '<section id="' + x.id + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + x.html + '</section>\n';
    }).join('');
    return '<!DOCTYPE html>\n<html lang="en"><head>' + head + '</head><body><a class="skip" href="#' + (order[0] || 'top') + '">Skip to content</a>\n' + nav + hero + page + foot + tail + '</body></html>\n';
  }

  function renderPost(C, post, opt) {
    opt = opt || {};
    var R = opt.resolve || function (x) { return x; }, pre = opt.prefix != null ? opt.prefix : '../', U = mkU(R, pre), S = C.site;
    var domain = String(S.domain || '').replace(/\/+$/, ''), others = published(C).filter(function (p) { return p.slug !== post.slug; }).slice(0, 3);
    var ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, datePublished: post.date, description: post.excerpt,
      author: { '@type': 'Person', name: S.founder }, publisher: { '@type': 'Organization', name: S.brand } };
    if (domain) ld.mainEntityOfPage = domain + '/' + postPath(post);
    if (domain && post.cover && post.cover.src && !/^data:/.test(post.cover.src)) ld.image = isAbs(post.cover.src) ? post.cover.src : domain + '/' + post.cover.src;
    var ch = chrome(C, { pre: pre, base: opt.base, title: post.title + ' | ' + S.brand, desc: post.excerpt || S.seoDescription, path: postPath(post), ogType: 'article', ogImage: post.cover && post.cover.src, extraLd: [ld] });
    var body = '<main class="postpage" id="main"><div class="wrap narrow"><p class="crumbs"><a href="' + pre + 'posts/">← All posts</a></p>' +
      (post.category ? '<span class="cat">' + esc(post.category) + '</span>' : '') + '<h1>' + esc(post.title) + '</h1>' +
      '<p class="meta">' + esc(fmtDate(post.date)) + ' · by ' + esc(S.founder) + ' · ' + readMin(post) + ' min read</p>' +
      (post.cover && post.cover.src ? '<figure class="pcover"><img src="' + attr(U(post.cover.src)) + '" alt="' + attr(post.cover.alt || post.title) + '"></figure>' : '') +
      '<div class="pbody">' + blocks(post.body, U) + '</div>' +
      '<div class="shr"><span>Share this post:</span><a class="btn alt" data-share="wa" href="#" target="_blank" rel="noopener">WhatsApp</a>' +
      '<a class="btn alt" data-share="fb" href="#" target="_blank" rel="noopener">Facebook</a><button class="btn alt" type="button" data-share="copy">Copy link</button></div>' +
      (others.length ? '<h2 class="moreh">More posts</h2><div class="pgrid">' + others.map(function (p) { return pcard(p, pre, U); }).join('') + '</div>' : '') +
      '</div></main>\n';
    return '<!DOCTYPE html>\n<html lang="en"><head>' + ch.head + '</head><body><a class="skip" href="#main">Skip to content</a>\n' + ch.nav + body + ch.foot + ch.tail + '</body></html>\n';
  }
  function renderPostsIndex(C, opt) {
    opt = opt || {};
    var R = opt.resolve || function (x) { return x; }, pre = opt.prefix != null ? opt.prefix : '../', U = mkU(R, pre), S = C.site, B = C.blog || {};
    var all = published(C), cats = [];
    all.forEach(function (p) { if (p.category && cats.indexOf(p.category) < 0) cats.push(p.category); });
    var ch = chrome(C, { pre: pre, base: opt.base, title: (B.indexTitle || 'All Blog Posts') + ' | ' + S.brand, desc: B.indexSub || S.seoDescription, path: 'posts/', ogImage: C.hero.image.src });
    var body = '<main class="postpage" id="main"><div class="wrap"><p class="crumbs"><a href="' + pre + '#top">← Home</a></p><h1>' + esc(B.indexTitle || 'All Blog Posts') + '</h1><p class="sub">' + fmt(B.indexSub || '') + '</p>' +
      (cats.length ? '<div class="chips"><button type="button" class="chip on" data-filter="">All</button>' + cats.map(function (c) { return '<button type="button" class="chip" data-filter="' + attr(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' : '') +
      (all.length ? '<div class="pgrid">' + all.map(function (p) { return pcard(p, pre, U); }).join('') + '</div>' : '<p>' + esc(B.emptyText || 'Posts are coming soon.') + '</p>') +
      '</div></main>\n';
    return '<!DOCTYPE html>\n<html lang="en"><head>' + ch.head + '</head><body><a class="skip" href="#main">Skip to content</a>\n' + ch.nav + body + ch.foot + ch.tail + '</body></html>\n';
  }
  function xml(s) { return esc(s).replace(/"/g, '&quot;'); }
  function renderFeed(C) {
    var S = C.site, d = String(S.domain || '').replace(/\/+$/, '');
    return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>' + xml(S.brand) + '</title><link>' + xml(d) + '/</link><description>' + xml(S.seoDescription) + '</description>\n' +
      published(C).map(function (p) { var u = d + '/' + postPath(p); return '<item><title>' + xml(p.title) + '</title><link>' + xml(u) + '</link><guid>' + xml(u) + '</guid><pubDate>' + rfcDate(p.date) + '</pubDate><description>' + xml(p.excerpt || '') + '</description></item>'; }).join('\n') + '\n</channel></rss>\n';
  }
  function renderSitemap(C) {
    var d = String(C.site.domain || '').replace(/\/+$/, ''), ps = published(C), today = new Date().toISOString().slice(0, 10);
    var urls = [[d + '/', today]];
    if (ps.length) urls.push([d + '/posts/', ps[0].date || today]);
    ps.forEach(function (p) { urls.push([d + '/' + postPath(p), p.date || today]); });
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      urls.map(function (u) { return '<url><loc>' + xml(u[0]) + '</loc><lastmod>' + u[1] + '</lastmod></url>'; }).join('') + '</urlset>\n';
  }
  return { normalize: normalize, render: render, renderPost: renderPost, renderPostsIndex: renderPostsIndex, renderFeed: renderFeed, renderSitemap: renderSitemap, published: published, slugify: slugify, postPath: postPath, blocks: blocks, esc: esc, fmt: fmt };
});
