// main.js - moved from inline for better CSP

// reveal on scroll
const io = new IntersectionObserver((entries)=>{entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); })},{threshold:0.08});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// typing effect for hero
const words = ['Full-Stack Developer', 'Cybersecurity Expert', 'App Developer', 'Security-first Engineer'];
let ti=0, ci=0, forward=true;
const dest = document.getElementById('typed');
function tick(){
  const w = words[ti];
  if(!dest) return;
  dest.textContent = w.slice(0, ci);
  if(forward){ if(ci++ >= w.length){ forward=false; setTimeout(tick,900); return }}
  else{ if(ci-- <=0){ forward=true; ti=(ti+1)%words.length; setTimeout(tick,300); return }}
  setTimeout(tick,80);
}
try{ tick(); }catch(e){ /* fail silently */ }

// project card tilt and modal
const projects = document.querySelectorAll('.project');
projects.forEach(p=>{
  p.addEventListener('mousemove', (ev)=>{
    const r = p.getBoundingClientRect();
    const px = (ev.clientX - r.left) / r.width - 0.5; // -0.5..0.5
    const py = (ev.clientY - r.top) / r.height - 0.5;
    const rx = -py * 6; const ry = px * 8; const s = 1.02;
    p.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
  });
  p.addEventListener('mouseleave', ()=>{ p.style.transform=''; });
  p.addEventListener('click', ()=>{
    const m = document.getElementById('modal');
    if(!m) return;
    document.getElementById('mTitle').textContent = p.dataset.title || p.querySelector('strong').textContent;
    document.getElementById('mType').textContent = p.dataset.type || '';
    document.getElementById('mDesc').textContent = p.dataset.desc || '';
    document.getElementById('mTech').textContent = 'Tech: ' + (p.dataset.tech || '');
    // add live link inside modal if available
    const existing = document.getElementById('mLive');
    if(existing) existing.remove();
    if(p.dataset.url){
      const a = document.createElement('a');
      a.id = 'mLive';
      a.href = p.dataset.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Open live site';
      a.style.cssText = 'display:inline-block;margin-top:12px;padding:8px 12px;border-radius:10px;background:linear-gradient(90deg,var(--accent),var(--accent-2));color:#041018;font-weight:700;text-decoration:none';
      document.getElementById('modalCard').appendChild(a);
    }
    // store the element that opened the modal so we can restore focus
    m._trigger = p;
    m.classList.add('open'); m.setAttribute('aria-hidden','false');
    // focus close button for keyboard users
    const closeBtn = document.getElementById('modalClose');
    if(closeBtn) closeBtn.focus();
  });
});
const modal = document.getElementById('modal');
const closeModal = ()=>{
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  try{ if(modal._trigger) modal._trigger.focus(); }catch(e){}
};
const modalCloseBtn = document.getElementById('modalClose');
if(modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if(modal) modal.addEventListener('click',(e)=>{ if(e.target===e.currentTarget){ closeModal(); } });

// keyboard shortcut
window.addEventListener('keydown', e=>{
  if(e.key==='g') location.hash='#contact';
  if(e.key==='Escape'){ closeModal(); }
});

// contact form handling: allow submission only when action points to a known receiver (FormSubmit) or mailto
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', (e)=>{
    const action = (contactForm.getAttribute('action') || '').trim();
    const isFormSubmit = action.includes('formsubmit.co');
    const isMailto = action.startsWith('mailto:');
    if(isFormSubmit || isMailto){
      // allow the browser to submit the form normally
      return true;
    }
    // otherwise prevent submission and show guidance
    e.preventDefault();
    alert('This demo site will not send messages because no form receiver is configured. To receive emails, replace the form action with a FormSubmit address (https://formsubmit.co/you@example.com) or configure a secure backend.');
    return false;
  });
}
