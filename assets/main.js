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

// mobile menu
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const navLinks = document.querySelectorAll('nav a');

function toggleMenu() {
  hamburger.classList.toggle('active');
  nav.classList.toggle('active');
  document.body.classList.toggle('menu-open');
}

hamburger.addEventListener('click', toggleMenu);

// Close menu when clicking a link
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    document.body.classList.remove('menu-open');
  });
});

// Close menu with Escape key
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hamburger.classList.remove('active');
    nav.classList.remove('active');
    document.body.classList.remove('menu-open');
    closeModal();
  }
  if (e.key === 'g') location.hash = '#contact';
});

// contact form handling: allow submission only when action points to a known receiver (FormSubmit) or mailto
const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', (e)=>{
    // helpful debug info for local testing
    const action = (contactForm.getAttribute('action') || '').trim();
    console.log('Contact form submit attempt', { action, origin: location.href, protocol: location.protocol, host: location.host });

    // If the page is opened via the file system, block and show a clear message.
    if(location.protocol === 'file:'){
      e.preventDefault();
      alert('FormSubmit will not accept submissions from pages opened with the file:// protocol. Serve the site via a local web server (for example: `python -m http.server 8000`) and open http://localhost:8000');
      return false;
    }

    const isFormSubmit = action.includes('formsubmit.co');
    const isMailto = action.startsWith('mailto:');
    const isApiSend = action === '/api/send' || action.endsWith('/api/send');
    if(isFormSubmit || isMailto){
      // allow the browser to submit the form normally
      return true;
    }

    if(isApiSend){
      // Submit via fetch so we can show friendly feedback without leaving the page
      e.preventDefault();
      const formData = new FormData(contactForm);
      const payload = Object.fromEntries(formData.entries());
      // basic UI feedback
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.textContent : '';
      if(submitBtn) submitBtn.disabled = true, submitBtn.textContent = 'Sending...';
      fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(async res => {
        if(res.ok){
          if(submitBtn) submitBtn.textContent = 'Sent ✓';
          contactForm.reset();
          setTimeout(()=>{ if(submitBtn) submitBtn.textContent = origText, submitBtn.disabled = false; }, 2200);
        } else {
          const json = await res.json().catch(()=>null);
          const text = json && (json.error || json.details) ? JSON.stringify(json) : await res.text().catch(()=>null);
          alert('Failed to send message. ' + (text || 'Please try again later.'));
          if(submitBtn) submitBtn.disabled = false, submitBtn.textContent = origText;
        }
      }).catch(err => {
        console.error('send error', err);
        alert('Failed to send message. Network error.');
        if(submitBtn) submitBtn.disabled = false, submitBtn.textContent = origText;
      });
      return false;
    }
    // otherwise prevent submission and show guidance
    e.preventDefault();
    alert('This demo site will not send messages because no form receiver is configured. To receive emails, replace the form action with a FormSubmit address (https://formsubmit.co/you@example.com) or configure a secure backend.');
    return false;
  });
}
