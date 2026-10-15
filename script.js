var d=document.getElementById('dlg'),b=document.getElementById('big'),mb=document.getElementById('mb'),mn=document.getElementById('menu');
document.querySelectorAll('.ph').forEach(function(p){p.onclick=function(){var i=p.querySelector('img');b.src=i.src;b.alt=i.alt;d.showModal()}});
document.getElementById('x').onclick=function(){d.close()};d.onclick=function(e){if(e.target===d)d.close()};
function tg(o){mn.hidden=!o;mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close ✕':'Menu ☰'}
mb.onclick=function(){tg(mn.hidden)};mn.addEventListener('click',function(e){if(e.target.closest('a'))tg(false)});document.addEventListener('keydown',function(e){if(e.key==='Escape')tg(false)});

(function(){var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;var nv=document.querySelector('nav'),pg=document.getElementById('prog');
function sc(){var h=document.documentElement.scrollHeight-innerHeight;nv.style.setProperty('--p',h>0?scrollY/h:0);pg.style.transform='scaleX('+(h>0?scrollY/h:0)+')'}addEventListener('scroll',sc,{passive:true});sc();
if(rm)return;var sk=document.getElementById('sky');for(var i=0;sk&&i<7;i++){var l=document.createElement('i');l.className='lf';l.style.left=(i*14+Math.random()*8)+'%';l.style.animationDelay=(-Math.random()*15)+'s';l.style.animationDuration=(13+Math.random()*8)+'s';sk.appendChild(l)}
if(!('IntersectionObserver' in window))return;document.documentElement.classList.add('js');
var q='section h2,section .sub,.topic,.hc a,.q,.mc,.bc,.oc,.tl li,.cmp>div,.obs,.inv,.pics,.sig,.note p,blockquote,.disc,#connect .row,#contact .row,.ideaform,.ideainfo';
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var t=e.target;t.classList.add('vis');io.unobserve(t);setTimeout(function(){t.style.transitionDelay=''},1200)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll(q).forEach(function(el){var n=Array.prototype.indexOf.call(el.parentNode.children,el)%4;el.style.transitionDelay=(n*70)+'ms';el.classList.add('rv');io.observe(el)});
var pend=null;addEventListener('scroll',function(){if(pend)return;pend=requestAnimationFrame(function(){pend=null;document.querySelectorAll('.rv:not(.vis)').forEach(function(el){if(el.getBoundingClientRect().top<innerHeight*0.9){el.classList.add('vis');io.unobserve(el)}})})},{passive:true});
addEventListener('beforeprint',function(){document.querySelectorAll('.rv').forEach(function(el){el.classList.add('vis')})});
})();
(function(){var f=document.getElementById('ideaForm'),st=document.getElementById('ideaMsg'),E=(f&&f.dataset.email)||'',tt=document.getElementById('totop');
addEventListener('scroll',function(){tt.classList.toggle('on',scrollY>700)},{passive:true});tt.onclick=function(){scrollTo({top:0,behavior:'smooth'})};
if(!f)return;
function get(){var x=f.elements,n=x.n.value.trim(),e=x.e.value.trim(),t=x.t.value,m=x.m.value.trim();return{m:m,sub:'Dimag Me Bhukh - '+t+(n?' from '+n:''),body:t+'\n\n'+m+'\n\n- '+(n||'Anonymous')+(e?' ('+e+')':'')}}
f.onsubmit=function(ev){ev.preventDefault();var d=get();if(!d.m){st.textContent='Please write your message first.';f.elements.m.focus();return}
location.href='mailto:'+E+'?subject='+encodeURIComponent(d.sub)+'&body='+encodeURIComponent(d.body);
st.textContent='Your email app should open with your message ready. Press Send there to finish. If nothing opens, tap Copy message and email '+E+'.'};
document.getElementById('cp').onclick=function(){var d=get();if(!d.m){st.textContent='Please write your message first.';f.elements.m.focus();return}
var t='To: '+E+'\nSubject: '+d.sub+'\n\n'+d.body;
(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){st.textContent='Copied. Paste it into an email to '+E+'.'},function(){st.textContent='Could not copy automatically. Please select your message and email it to '+E+'.'})}})();

(function(){
document.querySelectorAll('.mc').forEach(function(c){var m=c.querySelector('.m p'),f=c.querySelector('.f');if(!m||!f||f.querySelector('.share'))return;
var fact=f.textContent.replace(/^\s*Fact/,'').trim();var t='Myth: '+m.textContent.trim()+'\n\nFact: '+fact+'\n\n'+location.href.split('#')[0]+'#myths';
var a=document.createElement('a');a.className='share';a.href='https://wa.me/?text='+encodeURIComponent(t);a.target='_blank';a.rel='noopener';a.textContent='Share on WhatsApp';f.appendChild(a)});
var cl=document.getElementById('chk2');if(cl){var mt=document.getElementById('mt2'),mr=document.getElementById('mr2');
cl.addEventListener('change',function(){var n=cl.querySelectorAll('input:checked').length,t=cl.querySelectorAll('input').length;mt.style.width=(n/t*100)+'%';mr.textContent=n===t?'Wonderful – your space looks like a safe home for sparrows.':n+' of '+t+' done. Pick one more to try this week.'})}
})();
/* Posts: category filter and share buttons */
(function () {
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-filter');
      chips.forEach(function (x) { x.classList.toggle('on', x === c); });
      document.querySelectorAll('.pcard').forEach(function (p) { p.classList.toggle('hide', !!f && p.getAttribute('data-cat') !== f); });
    });
  });
  document.querySelectorAll('[data-share]').forEach(function (a) {
    var t = a.getAttribute('data-share'), u = location.href.split('#')[0], ti = document.title;
    if (t === 'wa') a.href = 'https://wa.me/?text=' + encodeURIComponent(ti + '\n' + u);
    else if (t === 'fb') a.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(u);
    else if (t === 'copy') a.addEventListener('click', function () {
      var done = function () { a.textContent = 'Link copied ✓'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done, function () { prompt('Copy this link:', u); });
      else prompt('Copy this link:', u);
    });
  });
})();

/* Show more / Show less for long boxes */
(function () {
  var LIM = 280, SLACK = 70, uid = 0, items = [];
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.q,.oc,.mc,.stp,.bc,.pf').forEach(function (c) {
    var w = document.createElement('x-clip'); w.id = 'cl' + (++uid);
    while (c.firstChild) w.appendChild(c.firstChild);
    c.appendChild(w);
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'more-btn'; b.hidden = true; b.textContent = 'Show more';
    b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', w.id);
    c.appendChild(b);
    var o = { c: c, w: w, b: b }; items.push(o);
    b.onclick = function () { toggle(o); };
  });
  function isOpen(o) { return o.b.getAttribute('aria-expanded') === 'true'; }
  function measure() {
    items.forEach(function (o) {
      if (isOpen(o)) return;
      var long = o.w.scrollHeight > LIM + SLACK;
      o.w.classList.toggle('cl-on', long);
      o.c.classList.toggle('cl-card', long);
      o.b.hidden = !long;
    });
  }
  function toggle(o) {
    var w = o.w, b = o.b;
    if (!isOpen(o)) {
      b.setAttribute('aria-expanded', 'true'); b.textContent = 'Show less'; w.classList.add('cl-open');
      if (rm) { w.style.maxHeight = 'none'; return; }
      w.style.maxHeight = w.scrollHeight + 'px';
      var fin = function () { if (isOpen(o)) w.style.maxHeight = 'none'; };
      w.addEventListener('transitionend', function f(e) { if (e.propertyName !== 'max-height') return; w.removeEventListener('transitionend', f); fin(); });
      setTimeout(fin, 500);
    } else {
      var top = o.c.getBoundingClientRect().top;
      b.setAttribute('aria-expanded', 'false'); b.textContent = 'Show more'; w.classList.remove('cl-open');
      if (!rm) { w.style.maxHeight = w.scrollHeight + 'px'; void w.offsetHeight; }
      w.style.maxHeight = '';
      if (top < 80) o.c.scrollIntoView({ block: 'start', behavior: rm ? 'auto' : 'smooth' });
    }
  }
  measure();
  addEventListener('load', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  var t; addEventListener('resize', function () { clearTimeout(t); t = setTimeout(measure, 150); });
})();
