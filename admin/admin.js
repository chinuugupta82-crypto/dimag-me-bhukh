/* Admin panel: edits the website content in the browser and prepares an update ZIP to upload. */
(function () {
  'use strict';
  var KEY = 'dmb_admin_draft_v1';
  var SCHEMA = window.ADMIN_SCHEMA;
  var ORIG = SiteTemplate.normalize(JSON.parse(JSON.stringify(window.SITE)));
  var content, files = {}, draftFound = false, current = SCHEMA[0].id, counter = 0, activePost = null;
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && saved.content) { content = saved.content; files = saved.files || {}; draftFound = true; }
  } catch (e) {}
  if (!content) content = JSON.parse(JSON.stringify(ORIG));
  /* A draft saved earlier (or an older published version) is brought up to date: new sections, the recommended order, blog wording. */
  content = SiteTemplate.normalize(content);

  var $ = function (s) { return document.querySelector(s); };
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') e.className = attrs[k]; else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') e[k] = attrs[k]; else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function today() { return new Date().toISOString().slice(0, 10); }
  var slugInputs = new WeakMap();
  function uniqueSlug(base, self) {
    base = base || 'post'; var s = base, n = 2, used = function (x) { return (content.posts || []).some(function (p) { return p !== self && p.slug === x; }); };
    while (used(s)) s = base + '-' + (n++); return s;
  }
  function afterEdit(obj, f) {
    if (f.k === 'title' && Object.prototype.hasOwnProperty.call(obj, 'slug') && !obj.slugLocked) {
      obj.slug = uniqueSlug(SiteTemplate.slugify(obj.title), obj); var e = slugInputs.get(obj); if (e) e.value = obj.slug;
    }
  }
  function resolve(p) { return files[p] || p; }
  function thumbSrc(p) { return files[p] || (/^(https?:|data:)/.test(p) ? p : '../' + p); }

  /* ---------- saving the draft and refreshing the preview ---------- */
  var tSave = null, tPrev = null;
  function changed() {
    setStatus('Saving…');
    clearTimeout(tSave); tSave = setTimeout(saveDraft, 400);
    clearTimeout(tPrev); tPrev = setTimeout(refreshPreview, 500);
  }
  function isDirty() { return JSON.stringify(content) !== JSON.stringify(ORIG) || Object.keys(usedFiles()).length > 0; }
  function setStatus(t, cls) { var s = $('#status'); s.textContent = t; s.className = 'status ' + (cls || ''); }
  function saveDraft() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ content: content, files: usedFiles() }));
      setStatus(isDirty() ? '● Draft saved in this browser. Not on the website yet.' : 'No changes yet.', isDirty() ? 'warn' : '');
    } catch (e) { setStatus('Draft too big to keep in the browser. Please download your update now.', 'bad'); }
  }
  function usedFiles() {
    var s = JSON.stringify(content), out = {};
    Object.keys(files).forEach(function (p) { if (s.indexOf(p) > -1) out[p] = files[p]; });
    return out;
  }

  /* ---------- photos ---------- */
  function processPhoto(file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var im = new Image();
      im.onload = function () {
        var max = 1100, sc = Math.min(1, max / Math.max(im.width, im.height));
        var c = document.createElement('canvas'); c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
        var path = 'images/photo-' + Date.now().toString(36) + (counter++) + '.jpg';
        files[path] = c.toDataURL('image/jpeg', 0.8); cb(path);
      };
      im.onerror = function () { alert('That file could not be read as a photo. Please choose a JPG or PNG.'); };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  }

  /* ---------- form fields ---------- */
  function wrap(label, help, input) {
    return el('label', { class: 'fld' }, [el('span', { class: 'lab', text: label }), input, help ? el('span', { class: 'help', text: help }) : null]);
  }
  function blank(fields) {
    var o = {};
    fields.forEach(function (f) {
      o[f.k] = f.type === 'lines' || f.type === 'images' || f.type === 'list' ? [] : f.type === 'image' ? (f.optional ? null : { src: '', alt: '' }) : f.type === 'group' ? blank(f.item) : (f.default === 'today' ? today() : (f.default !== undefined ? f.default : ''));
    });
    return o;
  }
  function buildField(obj, f, onTitle) {
    var t = f.type;
    if (t === 'text') {
      var i = el('input', { type: 'text', value: obj[f.k] || '' });
      if (f.k === 'slug') { slugInputs.set(obj, i); }
      i.oninput = function () { if (f.k === 'slug') { i.value = SiteTemplate.slugify(i.value) || ''; obj.slugLocked = true; } obj[f.k] = i.value; afterEdit(obj, f); if (onTitle) onTitle(); changed(); };
      return wrap(f.label, f.help, i);
    }
    if (t === 'textarea') {
      var a = el('textarea', { rows: f.rows || 3 }); a.value = obj[f.k] || '';
      a.oninput = function () { obj[f.k] = a.value; afterEdit(obj, f); if (onTitle) onTitle(); changed(); };
      return wrap(f.label, f.help, a);
    }
    if (t === 'number') {
      var nn = el('input', { type: 'number', min: '1', max: '12', value: obj[f.k] || f.default || 3 });
      nn.oninput = function () { obj[f.k] = Math.max(1, parseInt(nn.value, 10) || 3); changed(); };
      return wrap(f.label, f.help, nn);
    }
    if (t === 'date') {
      var dd = el('input', { type: 'date', value: obj[f.k] || today() });
      dd.oninput = function () { obj[f.k] = dd.value; changed(); };
      return wrap(f.label, f.help, dd);
    }
    if (t === 'select') {
      var sl = el('select', {}, f.options.map(function (o) { return el('option', { value: o[0], text: o[1] }); }));
      sl.value = obj[f.k] || f.default || f.options[0][0];
      sl.onchange = function () { obj[f.k] = sl.value; if (onTitle) onTitle(); changed(); };
      return wrap(f.label, f.help, sl);
    }
    if (t === 'richtext') return buildRich(obj, f);
    if (t === 'lines') {
      var l = el('textarea', { rows: f.rows || 4 }); l.value = (obj[f.k] || []).join('\n');
      l.oninput = function () { obj[f.k] = l.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); changed(); };
      return wrap(f.label, f.help || 'One per line.', l);
    }
    if (t === 'image') return buildImage(obj, f);
    if (t === 'images') return buildImages(obj, f);
    if (t === 'group') {
      if (!obj[f.k]) obj[f.k] = blank(f.item);
      var box = el('fieldset', { class: 'group' }, [el('legend', { text: f.label })]);
      f.item.forEach(function (sf) { box.appendChild(buildField(obj[f.k], sf)); });
      return box;
    }
    if (t === 'list') return buildList(obj, f);
    return el('div');
  }
  function buildRich(obj, f) {
    var ta = el('textarea', { rows: f.rows || 16, class: 'rich' }); ta.value = obj[f.k] || '';
    function sync() { obj[f.k] = ta.value; changed(); }
    ta.oninput = sync;
    function sel() { return { s: ta.selectionStart, e: ta.selectionEnd, t: ta.value.slice(ta.selectionStart, ta.selectionEnd) }; }
    function put(text, selStart, selEnd) {
      var x = sel(); ta.value = ta.value.slice(0, x.s) + text + ta.value.slice(x.e); ta.focus();
      ta.setSelectionRange(x.s + (selStart == null ? text.length : selStart), x.s + (selEnd == null ? text.length : selEnd)); sync();
    }
    function wrapSel(a, b, ph) { var x = sel(), t = x.t || ph; put(a + t + b, a.length, a.length + t.length); }
    function linePrefix(pfx, ph) {
      var x = sel(), start = ta.value.lastIndexOf('\n', x.s - 1) + 1, endIdx = ta.value.indexOf('\n', x.e); if (endIdx < 0) endIdx = ta.value.length;
      var block = ta.value.slice(start, endIdx) || ph, out = block.split('\n').map(function (l, n) { return (pfx === '1. ' ? (n + 1) + '. ' : pfx) + l; }).join('\n');
      ta.value = ta.value.slice(0, start) + out + ta.value.slice(endIdx); ta.focus(); ta.setSelectionRange(start, start + out.length); sync();
    }
    var photo = el('input', { type: 'file', accept: 'image/*', class: 'hidden' });
    photo.onchange = function () {
      if (!photo.files[0]) return; var d = prompt('Short description of this photo (for people who cannot see it):', '') || '';
      processPhoto(photo.files[0], function (p) { put('\n\n![' + d.replace(/[\[\]]/g, '') + '](' + p + ')\n\n'); }); photo.value = '';
    };
    function btn(label, title, fn) { return el('button', { type: 'button', class: 'mini', text: label, title: title, onclick: fn }); }
    var bar = el('div', { class: 'toolbar' }, [
      btn('B', 'Bold', function () { wrapSel('**', '**', 'bold text'); }), btn('I', 'Italic', function () { wrapSel('*', '*', 'italic text'); }),
      btn('Heading', 'Big heading', function () { linePrefix('## ', 'Heading'); }), btn('Sub-heading', 'Smaller heading', function () { linePrefix('### ', 'Sub-heading'); }),
      btn('• List', 'Bullet list', function () { linePrefix('- ', 'Item'); }), btn('1. List', 'Numbered list', function () { linePrefix('1. ', 'Item'); }),
      btn('❝ Quote', 'Quote', function () { linePrefix('> ', 'Quote'); }),
      btn('Link', 'Link', function () { var u = prompt('Web address (https://...):', 'https://'); if (u) wrapSel('[', '](' + u + ')', 'link text'); }),
      btn('📷 Photo', 'Insert a photo', function () { photo.click(); })]);
    return wrap(f.label, 'Blank line = new paragraph. Use the buttons above the box. A line with only --- draws a divider.', el('div', {}, [bar, ta, photo]));
  }
  function buildImage(obj, f) {
    var box = el('div', { class: 'fld imgf' }, [el('span', { class: 'lab', text: f.label })]);
    function draw() {
      box.innerHTML = ''; box.appendChild(el('span', { class: 'lab', text: f.label }));
      var im = obj[f.k];
      var row = el('div', { class: 'imgrow' });
      var th = el('div', { class: 'thumb' });
      if (im && im.src) th.appendChild(el('img', { src: thumbSrc(im.src), alt: '' })); else th.textContent = 'No photo';
      var file = el('input', { type: 'file', accept: 'image/*' });
      file.onchange = function () {
        if (!file.files[0]) return;
        processPhoto(file.files[0], function (path) { if (!obj[f.k]) obj[f.k] = { src: '', alt: '' }; obj[f.k].src = path; draw(); changed(); });
      };
      var side = el('div', { class: 'imgside' }, [el('span', { class: 'help', text: im && im.src ? 'Choose a new photo to replace this one.' : 'Choose a photo to add.' }), file]);
      if (f.optional && im && im.src) side.appendChild(el('button', { type: 'button', class: 'mini', text: 'Remove photo', onclick: function () { obj[f.k] = null; draw(); changed(); } }));
      row.appendChild(th); row.appendChild(side); box.appendChild(row);
      if (im && im.src) {
        var alt = el('input', { type: 'text', value: im.alt || '' });
        alt.oninput = function () { im.alt = alt.value; changed(); };
        box.appendChild(wrap('Photo description (for people who cannot see it, and for Google)', '', alt));
      }
    }
    draw(); return box;
  }
  function buildImages(obj, f) {
    if (!obj[f.k]) obj[f.k] = [];
    var box = el('div', { class: 'fld imgf' });
    function draw() {
      box.innerHTML = ''; box.appendChild(el('span', { class: 'lab', text: f.label }));
      obj[f.k].forEach(function (im, n) {
        var row = el('div', { class: 'imgrow' });
        var th = el('div', { class: 'thumb' }); if (im.src) th.appendChild(el('img', { src: thumbSrc(im.src), alt: '' }));
        var alt = el('input', { type: 'text', value: im.alt || '', placeholder: 'Photo description' });
        alt.oninput = function () { im.alt = alt.value; changed(); };
        var file = el('input', { type: 'file', accept: 'image/*' });
        file.onchange = function () { if (file.files[0]) processPhoto(file.files[0], function (p) { im.src = p; draw(); changed(); }); };
        var side = el('div', { class: 'imgside' }, [alt, el('span', { class: 'help', text: 'Replace this photo:' }), file, el('div', { class: 'btns' }, [
          el('button', { type: 'button', class: 'mini', text: '↑', title: 'Move up', onclick: function () { move(obj[f.k], n, -1); draw(); changed(); } }),
          el('button', { type: 'button', class: 'mini', text: '↓', title: 'Move down', onclick: function () { move(obj[f.k], n, 1); draw(); changed(); } }),
          el('button', { type: 'button', class: 'mini danger', text: 'Remove', onclick: function () { if (confirm('Remove this photo from the page?')) { obj[f.k].splice(n, 1); draw(); changed(); } } })])]);
        row.appendChild(th); row.appendChild(side); box.appendChild(row);
      });
      var add = el('input', { type: 'file', accept: 'image/*' });
      add.onchange = function () { if (add.files[0]) processPhoto(add.files[0], function (p) { obj[f.k].push({ src: p, alt: '' }); draw(); changed(); }); };
      box.appendChild(el('div', { class: 'addrow' }, [el('span', { class: 'help', text: 'Add another photo:' }), add]));
    }
    draw(); return box;
  }
  function move(arr, i, d) { var j = i + d; if (j < 0 || j >= arr.length) return; var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  function buildList(obj, f) {
    if (!obj[f.k]) obj[f.k] = [];
    var box = el('div', { class: 'list' });
    function draw() {
      box.innerHTML = ''; box.appendChild(el('div', { class: 'lab big', text: f.label + ' (' + obj[f.k].length + ')' }));
      obj[f.k].forEach(function (it, n) {
        var title = el('span', { class: 'ititle' });
        function setTitle() { title.textContent = (n + 1) + '. ' + (String(it[f.itemTitle] || '').slice(0, 60) || '(empty)') + (f.itemBadge ? '  ·  ' + (it[f.itemBadge] === 'published' ? '✅ Published' : '📝 Draft') : ''); }
        setTitle();
        var d = el('details', { class: 'item' });
        var tools = el('span', { class: 'tools' }, [
          el('button', { type: 'button', class: 'mini', text: '↑', title: 'Move up', onclick: function (e) { e.preventDefault(); move(obj[f.k], n, -1); draw(); changed(); } }),
          el('button', { type: 'button', class: 'mini', text: '↓', title: 'Move down', onclick: function (e) { e.preventDefault(); move(obj[f.k], n, 1); draw(); changed(); } })]);
        if (!f.fixed) {
          tools.appendChild(el('button', { type: 'button', class: 'mini', text: 'Copy', title: 'Duplicate', onclick: function (e) { e.preventDefault(); var c = clone(it); if (f.autoId) c.id = 't-copy-' + Date.now().toString(36); obj[f.k].splice(n + 1, 0, c); draw(); changed(); } }));
          tools.appendChild(el('button', { type: 'button', class: 'mini danger', text: 'Delete', onclick: function (e) { e.preventDefault(); if (confirm('Delete this ' + (f.itemName || 'item') + '? This cannot be undone (but you can discard your draft).')) { obj[f.k].splice(n, 1); draw(); changed(); } } }));
        }
        d.appendChild(el('summary', {}, [title, tools]));
        var body = el('div', { class: 'ibody' });
        f.item.forEach(function (sf) { body.appendChild(buildField(it, sf, (sf.k === f.itemTitle || sf.k === f.itemBadge) ? setTitle : null)); });
        if (f.previewPost) d.addEventListener('toggle', function () { if (d.open) { activePost = it; refreshPreview(); } });
        d.appendChild(body); box.appendChild(d);
      });
      if (!f.fixed) box.appendChild(el('button', { type: 'button', class: 'add', text: '+ Add ' + (f.itemName || 'item'), onclick: function () {
        var o = blank(f.item); if (f.autoId) o.id = 't-new-' + Date.now().toString(36); obj[f.k].push(o); draw(); changed();
        var ds = box.querySelectorAll('details'); if (ds.length) ds[ds.length - 1].open = true;
      } }));
    }
    draw(); return box;
  }

  /* ---------- screens ---------- */
  function showSection(id) {
    current = id; if (id === 'posts') activePost = null; var sec = SCHEMA.filter(function (s) { return s.id === id; })[0];
    document.querySelectorAll('.side button').forEach(function (b) { b.classList.toggle('on', b.dataset.id === id); });
    var p = $('#panel'); p.innerHTML = '';
    p.appendChild(el('h2', { text: sec.icon + ' ' + sec.label })); p.appendChild(el('p', { class: 'lead', text: sec.help }));
    var obj = sec.root ? content[sec.root] : content;
    var form = el('div', { class: 'form' });
    sec.fields.forEach(function (f) { form.appendChild(buildField(obj, f)); });
    p.appendChild(form); p.scrollTop = 0; window.scrollTo(0, 0);
    previewTo(sec.preview);
    if (shownPost) refreshPreview(); /* the preview was showing one post's page: go back to the website page */
  }
  function buildSide() {
    var s = $('.side'); s.innerHTML = '';
    var lastGroup = null;
    SCHEMA.forEach(function (sec) {
      if (sec.group && sec.group !== lastGroup) { s.appendChild(el('div', { class: 'grp', text: sec.group })); lastGroup = sec.group; }
      var b = el('button', { type: 'button', text: sec.icon + ' ' + sec.label, onclick: function () { showSection(sec.id); } }); b.dataset.id = sec.id; s.appendChild(b);
    });
  }

  /* ---------- preview ---------- */
  var scrollY = 0, targetId = null, shownPost = false;
  function refreshPreview() {
    var f = $('#pv'); if (!f) return;
    try { scrollY = f.contentWindow ? f.contentWindow.scrollY : 0; } catch (e) {}
    var keep = scrollY;
    f.onload = function () {
      try { var w = f.contentWindow; if (targetId) { var t = f.contentDocument.getElementById(targetId); if (t) w.scrollTo(0, t.getBoundingClientRect().top + w.scrollY - 70); targetId = null; } else w.scrollTo(0, keep); } catch (e) {}
    };
    var o = { base: new URL('../', location.href).href, resolve: resolve, prefix: '' };
    var post = current === 'posts' && activePost && (content.posts || []).indexOf(activePost) > -1 ? activePost : null;
    shownPost = !!post;
    if (post) { targetId = null; keep = 0; }
    f.srcdoc = post ? SiteTemplate.renderPost(content, post, o) : SiteTemplate.render(content, o);
  }
  function previewTo(id) {
    if (!id) return; targetId = id;
    var f = $('#pv'); try { var t = f.contentDocument && f.contentDocument.getElementById(id); if (t && f.contentWindow) { f.contentWindow.scrollTo(0, t.getBoundingClientRect().top + f.contentWindow.scrollY - 70); targetId = null; } } catch (e) {}
  }

  /* ---------- download ---------- */
  function crc32(buf) {
    if (!crc32.t) { crc32.t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crc32.t[n] = c >>> 0; } }
    var crc = 0xFFFFFFFF; for (var i = 0; i < buf.length; i++) crc = crc32.t[(crc ^ buf[i]) & 255] ^ (crc >>> 8); return (crc ^ 0xFFFFFFFF) >>> 0;
  }
  function makeZip(list) {
    var enc = new TextEncoder(), chunks = [], central = [], offset = 0, d = new Date();
    var time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    list.forEach(function (f) {
      var name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      chunks.push(new Uint8Array(lh.buffer), name, f.data);
      var ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name); offset += 30 + name.length + size;
    });
    var cs = 0; central.forEach(function (c) { cs += c.length; });
    var end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, list.length, true); end.setUint16(10, list.length, true); end.setUint32(12, cs, true); end.setUint32(16, offset, true);
    return new Blob(chunks.concat(central, [new Uint8Array(end.buffer)]), { type: 'application/zip' });
  }
  function dataToBytes(u) { var b = atob(u.split(',')[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function postFileNames(C) {
    var out = [], ps = SiteTemplate.published(C), dom = String(C.site.domain || '').trim();
    if (ps.length) { out.push('posts/index.html'); ps.forEach(function (p) { out.push(SiteTemplate.postPath(p)); }); if (dom) out.push('feed.xml'); }
    if (dom) out.push('sitemap.xml');
    return out;
  }
  function removedFiles() {
    var now = postFileNames(content); return postFileNames(ORIG).filter(function (n) { return now.indexOf(n) < 0; });
  }
  /* Posts the person changed in this session but left on Draft: they will not show on the website. */
  function pendingDrafts() {
    var was = {}; (ORIG.posts || []).forEach(function (p) { was[p.slug + '|' + p.title] = JSON.stringify(p); });
    return (content.posts || []).filter(function (p) { return p.status !== 'published' && was[p.slug + '|' + p.title] !== JSON.stringify(p); });
  }
  function draftsOk() {
    var dr = pendingDrafts(); if (!dr.length) return true;
    var ok = confirm('These blog posts are still marked Draft, so visitors will NOT see them on the website:\n\n' +
      dr.map(function (p) { return '\u2022 ' + (p.title || '(no title yet)'); }).join('\n') + '\n\nPress OK to continue anyway, or Cancel to go back and set Status to Published.');
    if (!ok) { showSection('posts'); }
    return ok;
  }
  function validatePosts() {
    var bad = [], seen = {};
    (content.posts || []).forEach(function (p) {
      if (p.status !== 'published') return; var name = '"' + (p.title || '(no title)') + '"';
      if (!p.title) bad.push('A published post has no title.');
      if (!p.slug) bad.push(name + ' needs a page name (slug).');
      if (p.slug && seen[p.slug]) bad.push(name + ' has the same page name as another post: ' + p.slug);
      if (p.slug) seen[p.slug] = 1;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || '')) bad.push(name + ' needs a date.');
    });
    return bad;
  }
  function buildFiles() {
    var enc = new TextEncoder(), dom = String(content.site.domain || '').replace(/\/+$/, '');
    var list = [
      { name: 'index.html', data: enc.encode(SiteTemplate.render(content)) },
      { name: 'content.js', data: enc.encode('/* All website content lives here. The admin panel edits this file. */\nwindow.SITE = ' + JSON.stringify(content, null, 1) + ';\n') },
      { name: 'robots.txt', data: enc.encode('User-agent: *\nAllow: /\nDisallow: /admin/\n' + (dom ? 'Sitemap: ' + dom + '/sitemap.xml\n' : '')) }
    ];
    var ps = SiteTemplate.published(content);
    if (ps.length) {
      list.push({ name: 'posts/index.html', data: enc.encode(SiteTemplate.renderPostsIndex(content)) });
      ps.forEach(function (p) { list.push({ name: SiteTemplate.postPath(p), data: enc.encode(SiteTemplate.renderPost(content, p)) }); });
    }
    if (dom) { list.push({ name: 'sitemap.xml', data: enc.encode(SiteTemplate.renderSitemap(content)) }); if (ps.length) list.push({ name: 'feed.xml', data: enc.encode(SiteTemplate.renderFeed(content)) }); }
    var used = usedFiles();
    Object.keys(used).forEach(function (p) { list.push({ name: p, data: dataToBytes(used[p]) }); });
    return list;
  }
  function download() {
    var bad = validatePosts(); if (bad.length) { alert('Please fix this first:\n\n' + bad.join('\n')); return; }
    if (!draftsOk()) return;
    var enc = new TextEncoder(), list = buildFiles(), n = list.filter(function (f) { return f.name.indexOf('images/') === 0; }).length, rm = removedFiles();
    list.push({ name: 'READ-ME-FIRST.txt', data: enc.encode('Backup of your website files. To use it, upload these files to your website, replacing the old ones. Keep the "images" folder name.\nDo not upload this text file.\n' + (rm.length ? 'These old pages should now be deleted from your website: ' + rm.join(', ') + '\n' : '')) });
    var blob = makeZip(list), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'dimag-me-bhukh-backup-' + new Date().toISOString().slice(0, 10) + '.zip';
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    setStatus('Backup ZIP downloaded (' + list.length + ' files).');
  }

  /* ---------- publishing straight to the website (through GitHub) ---------- */
  var CFG_KEY = 'dmb_admin_github', cfg = null;
  try { cfg = JSON.parse(localStorage.getItem(CFG_KEY) || 'null'); } catch (e) {}
  function connected() { return !!(cfg && cfg.o && cfg.r && cfg.t); }
  function apiBase() { return (cfg && cfg.a) || 'https://api.github.com'; }
  function gh(method, path, body, raw) {
    var h = { 'Authorization': 'Bearer ' + cfg.t, 'Accept': raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    var o = { method: method, headers: h };
    if (body) { h['Content-Type'] = 'application/json'; o.body = JSON.stringify(body); }
    return fetch(apiBase() + path, o).then(function (res) {
      if (res.ok) return raw ? res.text() : res.json();
      return res.text().then(function (t) { var m = ''; try { m = JSON.parse(t).message; } catch (e) {} var err = new Error(m || ('Error ' + res.status)); err.status = res.status; throw err; });
    });
  }
  function repo(p) { return '/repos/' + encodeURIComponent(cfg.o) + '/' + encodeURIComponent(cfg.r) + p; }
  function folder() { var p = String(cfg.p || '').replace(/^\/+|\/+$/g, ''); return p ? p + '/' : ''; }
  function branch() { return cfg.b || 'main'; }
  function friendly(e) {
    if (e.name === 'TypeError') return 'Could not reach GitHub. Please check your internet connection and try again.';
    if (e.status === 401) return 'The secret key was not accepted. Open More → Connection settings and enter the key again.';
    if (e.status === 403) return 'The secret key does not have permission to change this website. It needs "Contents: Read and write" for this repository.';
    if (e.status === 404) return 'The repository or branch was not found, or the key cannot see it. Check the names in Connection settings.';
    if (e.status === 422 || e.status === 409) return 'Someone else published at the same moment. Please press Publish again.';
    return 'Could not publish: ' + e.message;
  }
  function toBase64(bytes) { var s = ''; for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
  function updateTop() {
    $('#pub').textContent = connected() ? '🚀 Publish to website' : '🔗 Connect to publish';
    $('#notice').innerHTML = connected()
      ? '<strong>Edit freely.</strong> Nothing goes live until you press <b>Publish to website</b>. Your changes are kept as a draft in this browser meanwhile. Connected to <b>' + cfg.o.replace(/</g, '') + '/' + cfg.r.replace(/</g, '') + '</b>.'
      : '<strong>Edit freely.</strong> To make <b>Publish</b> update your website by itself, connect once under <b>More → Connection settings</b>. Until then you can use <b>More → Download ZIP</b>.';
  }
  function publish() {
    if (!connected()) { openConnect(); return; }
    var bad = validatePosts(); if (bad.length) { alert('Please fix this first:\n\n' + bad.join('\n')); return; }
    if (!draftsOk()) return;
    var btn = $('#pub'); btn.disabled = true; $('#pubBox').hidden = true; setStatus('Publishing… please wait', 'warn');
    var files = buildFiles(), shas = [], chain = Promise.resolve();
    files.forEach(function (f, i) {
      chain = chain.then(function () {
        setStatus('Uploading ' + (i + 1) + ' of ' + files.length + '…', 'warn');
        return gh('POST', repo('/git/blobs'), { content: toBase64(f.data), encoding: 'base64' }).then(function (r) { shas[i] = r.sha; });
      });
    });
    function commit(attempt) {
      return gh('GET', repo('/git/ref/heads/' + encodeURI(branch()))).then(function (ref) {
        var head = ref.object.sha;
        return gh('GET', repo('/git/commits/' + head)).then(function (c) {
          var rm = removedFiles(), existing = rm.length ? gh('GET', repo('/git/trees/' + c.tree.sha + '?recursive=1')).then(function (tr) { return (tr.tree || []).map(function (x) { return x.path; }); }) : Promise.resolve([]);
          return existing.then(function (have) {
            var tree = files.map(function (f, i) { return { path: folder() + f.name, mode: '100644', type: 'blob', sha: shas[i] }; });
            rm.forEach(function (n) { if (have.indexOf(folder() + n) > -1) tree.push({ path: folder() + n, mode: '100644', type: 'blob', sha: null }); });
            return gh('POST', repo('/git/trees'), { base_tree: c.tree.sha, tree: tree });
          }).then(function (t) {
            return gh('POST', repo('/git/commits'), { message: 'Update website content (admin) ' + new Date().toISOString().slice(0, 16).replace('T', ' '), tree: t.sha, parents: [head] }).then(function (cm) {
              return gh('PATCH', repo('/git/refs/heads/' + encodeURI(branch())), { sha: cm.sha });
            });
          });
        });
      }).catch(function (e) { if (attempt < 2 && (e.status === 422 || e.status === 409)) return commit(attempt + 1); throw e; });
    }
    return chain.then(function () { return commit(0); }).then(function () {
      ORIG = clone(content); try { localStorage.removeItem(KEY); } catch (e) {}
      setStatus('✅ Published at ' + new Date().toLocaleTimeString() + '. Your website updates in about a minute.', '');
      $('#pubBox').hidden = false;
    }).catch(function (e) { setStatus(friendly(e), 'bad'); }).then(function () { btn.disabled = false; });
  }
  function initRemote() {
    if (!connected()) return;
    gh('GET', repo('/contents/' + folder() + 'content.js?ref=' + encodeURIComponent(branch())), null, true).then(function (txt) {
      var m = String(txt).match(/window\.SITE\s*=\s*([\s\S]*?);\s*$/), o = SiteTemplate.normalize(JSON.parse(m ? m[1] : txt));
      if (JSON.stringify(o) === JSON.stringify(ORIG)) return;
      var hadDraft = draftFound && isDirty(); ORIG = o;
      if (!hadDraft) { content = clone(o); showSection(current); refreshPreview(); setStatus('Loaded the latest published version.'); }
      else setStatus('● Your draft was loaded. A different published version exists on your website.', 'warn');
    }).catch(function () {});
  }
  function openHistory() {
    if (!connected()) { openConnect(); return; }
    var ul = $('#histList'); ul.innerHTML = '<li>Loading…</li>'; $('#hist').showModal();
    gh('GET', repo('/commits?path=' + encodeURIComponent(folder() + 'content.js') + '&sha=' + encodeURIComponent(branch()) + '&per_page=15')).then(function (list) {
      ul.innerHTML = ''; if (!list.length) ul.innerHTML = '<li>No earlier versions found.</li>';
      list.forEach(function (c) {
        var when = new Date(c.commit.author.date).toLocaleString();
        var b = el('button', { type: 'button', class: 'mini', text: 'Load this version' });
        b.onclick = function () {
          gh('GET', repo('/contents/' + folder() + 'content.js?ref=' + c.sha), null, true).then(function (txt) {
            var m = String(txt).match(/window\.SITE\s*=\s*([\s\S]*?);\s*$/), o = SiteTemplate.normalize(JSON.parse(m ? m[1] : txt));
            content = o; $('#hist').close(); showSection(current); refreshPreview(); changed(); setStatus('● Older version loaded as a draft. Check it, then press Publish.', 'warn');
          }).catch(function (e) { alert(friendly(e)); });
        };
        ul.appendChild(el('li', {}, [el('span', {}, [String(c.commit.message).split('\n')[0].slice(0, 60), el('br'), el('small', { text: when })]), b]));
      });
    }).catch(function (e) { ul.innerHTML = ''; ul.appendChild(el('li', { text: friendly(e) })); });
  }
  function openConnect() {
    $('#cOwner').value = (cfg && cfg.o) || ''; $('#cRepo').value = (cfg && cfg.r) || ''; $('#cBranch').value = (cfg && cfg.b) || 'main';
    $('#cPath').value = (cfg && cfg.p) || ''; $('#cToken').value = (cfg && cfg.t) || ''; $('#cMsg').textContent = ''; $('#cMsg').className = 'status'; $('#cOut').hidden = true;
    $('#conn').showModal();
  }
  function readForm() { return { o: $('#cOwner').value.trim(), r: $('#cRepo').value.trim(), b: $('#cBranch').value.trim() || 'main', p: $('#cPath').value.trim(), t: $('#cToken').value.trim(), a: (cfg && cfg.a) || '' }; }
  function cmsg(t, cls) { $('#cMsg').textContent = t; $('#cMsg').className = 'status ' + (cls || ''); }
  $('#cFill').onclick = function () {
    try { var o = JSON.parse(decodeURIComponent(escape(atob($('#cCode').value.trim())))); $('#cOwner').value = o.o || ''; $('#cRepo').value = o.r || ''; $('#cBranch').value = o.b || 'main'; $('#cPath').value = o.p || ''; $('#cToken').value = o.t || ''; cfg = Object.assign({}, cfg || {}, { a: o.a || '' }); cmsg('Filled in. Press Test connection, then Save.', 'good'); }
    catch (e) { cmsg('That code could not be read. Please copy it again.', 'bad'); }
  };
  $('#cMake').onclick = function () { var o = readForm(); if (!o.t) { cmsg('Enter the secret key first.', 'bad'); return; } var out = $('#cOut'); out.value = btoa(unescape(encodeURIComponent(JSON.stringify(o)))); out.hidden = false; cmsg('Copy this code and send it privately. It contains the secret key.', 'good'); };
  $('#cTest').onclick = function () {
    var o = readForm(); if (!o.o || !o.r || !o.t) { cmsg('Please fill in the user name, repository and secret key.', 'bad'); return; }
    var old = cfg; cfg = o; cmsg('Testing…');
    gh('GET', repo('')).then(function (r) {
      if (r.permissions && r.permissions.push === false) cmsg('Connected, but this key can only read. It needs permission to write.', 'bad'); else cmsg('✅ Connected to ' + r.full_name + '. Press Save.', 'good');
    }).catch(function (e) { cmsg(friendly(e), 'bad'); }).then(function () { cfg = old; });
  };
  $('#cSave').onclick = function () {
    var o = readForm(); if (!o.o || !o.r || !o.t) { cmsg('Please fill in the user name, repository and secret key.', 'bad'); return; }
    cfg = o; try { localStorage.setItem(CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
    $('#conn').close(); updateTop(); initRemote(); setStatus('Connected. You can now press Publish to website.');
  };
  $('#cOff').onclick = function () { if (!confirm('Disconnect this browser from your website? You can connect again any time.')) return; cfg = null; try { localStorage.removeItem(CFG_KEY); } catch (e) {} $('#conn').close(); updateTop(); setStatus('Disconnected.'); };
  $('#cClose').onclick = function () { $('#conn').close(); };
  $('#histClose').onclick = function () { $('#hist').close(); };
  $('#pubClose').onclick = function () { $('#pubBox').hidden = true; };
  $('#pub').onclick = publish;
  $('#newPost').onclick = function () {
    var pf = SCHEMA.filter(function (s) { return s.id === 'posts'; })[0].fields[0];
    if (!content.posts) content.posts = [];
    content.posts.unshift(blank(pf.item)); showSection('posts');
    var d = document.querySelector('#panel details.item'); if (d) { d.open = true; var t = d.querySelector('input[type=text]:not([readonly])'); if (t) setTimeout(function () { t.focus(); }, 50); }
    changed();
  };
  $('#connBtn').onclick = function () { document.querySelector('.more').open = false; openConnect(); };
  $('#histBtn').onclick = function () { document.querySelector('.more').open = false; openHistory(); };

  /* ---------- buttons ---------- */
  $('#dl').onclick = download;
  $('#pvBtn').onclick = function () { document.body.classList.toggle('showpv'); $('#pvBtn').setAttribute('aria-pressed', document.body.classList.contains('showpv')); refreshPreview(); };
  $('#helpBtn').onclick = function () { $('#help').showModal(); };
  $('#helpClose').onclick = function () { $('#help').close(); };
    $('#discard').onclick = function () {
    if (!confirm('Throw away all your unpublished changes and go back to the current website version?')) return;
    localStorage.removeItem(KEY); content = clone(ORIG); files = {}; showSection(current); refreshPreview(); setStatus('Draft discarded. Showing the current website.');
  };
  $('#restore').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () {
      try {
        var m = String(r.result).match(/window\.SITE\s*=\s*([\s\S]*?);\s*$/); var o = JSON.parse(m ? m[1] : r.result);
        if (!o.site || !o.hero || !o.about) throw new Error('not a content file');
        content = SiteTemplate.normalize(o); showSection(current); changed(); alert('Loaded. Check the preview, then download your update.');
      } catch (err) { alert('That does not look like a content.js file from this website.'); }
    };
    r.readAsText(f); e.target.value = '';
  };
  
  buildSide(); showSection(current); refreshPreview(); updateTop(); initRemote();
  if (draftFound && isDirty()) setStatus('● Your earlier draft was loaded. Not on the website yet.', 'warn'); else setStatus('No changes yet.');
})();
