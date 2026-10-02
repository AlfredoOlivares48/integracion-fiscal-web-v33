const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a:not(.nav-dropdown__trigger)').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      if (status) status.textContent = 'Por favor complete los campos obligatorios.';
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const get = (name) => (data.get(name) || '').toString().trim();
    const recipient = form.dataset.recipient || 'abogados@integracionfiscal.com';
    const subject = `Solicitud desde integracionfiscal.com — ${get('asunto') || 'Contacto'}`;
    const lines = [
      'Solicitud recibida desde integracionfiscal.com', '',
      `Motivo: ${get('asunto')}`,
      `Necesidad: ${get('intencion')}`,
      `Nombre: ${get('nombre')}`,
      `Teléfono: ${get('telefono')}`,
      `Correo: ${get('correo')}`,
      `Plazo o fecha próxima: ${get('plazo') || 'No indicado'}`
    ];
    if (get('intencion') === 'cita') {
      lines.push(`Modalidad: ${get('modalidad') || 'No indicada'}`);
      lines.push(`Fecha preferida: ${get('fecha_preferida') || 'No indicada'}`);
      lines.push(`Horario preferido: ${get('horario') || 'No indicado'}`);
    }
    lines.push('', 'Mensaje:', get('mensaje'));
    const cc = (form.dataset.cc || '').split(',').map(s => s.trim()).filter(Boolean).join(',');
    const href = `mailto:${recipient}?${cc ? 'cc=' + encodeURIComponent(cc) + '&' : ''}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    if (status) status.textContent = 'Se abrirá su aplicación de correo. Revise el mensaje y pulse Enviar.';
    window.location.href = href;
  });
}

// v5 carousel: preserves the supplied image order 1 -> 2 -> 3.
(() => {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.hero-slide')];
  const dots = [...carousel.querySelectorAll('[data-slide]')];
  let current = 0, timer;
  const show = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((el,n)=>el.classList.toggle('is-active',n===current));
    dots.forEach((el,n)=>el.classList.toggle('is-active',n===current));
  };
  const restart = () => { clearInterval(timer); timer=setInterval(()=>show(current+1),6500); };
  carousel.querySelector('[data-prev]')?.addEventListener('click',()=>{show(current-1);restart();});
  carousel.querySelector('[data-next]')?.addEventListener('click',()=>{show(current+1);restart();});
  dots.forEach((d,i)=>d.addEventListener('click',()=>{show(i);restart();}));
  restart();
})();
// v11 contact intent: appointment fields are progressively disclosed in contacto.html.

// v30 — Menú móvil: "Servicios" se despliega en lugar de navegar; se marca la página actual.
(() => {
  const mq = window.matchMedia('(max-width: 980px)');
  document.querySelectorAll('.nav-dropdown').forEach(dd => {
    const trigger = dd.querySelector('.nav-dropdown__trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      if (!mq.matches) return;
      e.preventDefault();
      e.stopPropagation();
      const open = dd.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
    });
  });
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav > a:not(.btn)').forEach(a => {
    if ((a.getAttribute('href') || '').split('/').pop() === here) a.setAttribute('aria-current', 'page');
  });
  if (location.pathname.includes('/servicios/')) document.querySelector('.nav-dropdown')?.classList.add('is-current');
})();

// v33 — WhatsApp con mini formulario: prellena el servicio de la página visitada y arma el mensaje.
(() => {
  const WA = '528132751809';
  const SERVICES = {
    'defensa-fiscal.html': 'Defensa y Litigio Fiscal',
    'atencion-auditorias.html': 'Atención de Auditorías',
    'planeacion-tributaria.html': 'Planeación Tributaria',
    'consultoria-prevencion.html': 'Consultoría y Prevención',
    'recursos-administrativos.html': 'Recursos Administrativos',
    'predial-catastro.html': 'Predial y Catastro',
    'organismos-entidades-publicas.html': 'Organismos y Entidades Públicas',
    'imss-infonavit.html': 'IMSS e INFONAVIT',
    'derecho-corporativo-fiscal.html': 'Derecho Corporativo Fiscal',
    'comercio-exterior-aduanero.html': 'Comercio Exterior y Legislación Aduanera',
    'juicio-de-amparo.html': 'Amparo'
  };
  const GUIDES = {
    'credito-fiscal.html': 'Defensa y Litigio Fiscal',
    'requerimiento-multa.html': 'Defensa y Litigio Fiscal',
    'amparo-acto-autoridad.html': 'Amparo'
  };
  const file = location.pathname.split('/').pop();
  const inServ = location.pathname.includes('/servicios/');
  const inGuide = location.pathname.includes('/recursos/');
  const current = (inServ && SERVICES[file]) || (inGuide && GUIDES[file]) || '';
  const triggers = document.querySelectorAll('.wa-float, .wa-link:not(.tel-link)');
  if (!triggers.length || typeof HTMLDialogElement === 'undefined') return;

  const opts = Object.values(SERVICES).map(s => `<option${s === current ? ' selected' : ''}>${s}</option>`).join('');
  const dlg = document.createElement('dialog');
  dlg.className = 'wa-dialog';
  dlg.setAttribute('aria-labelledby', 'wa-dialog-title');
  dlg.innerHTML = `
    <form method="dialog" class="wa-dialog__form" novalidate>
      <button type="button" class="wa-dialog__close" aria-label="Cerrar">×</button>
      <p class="wa-dialog__eyebrow">WhatsApp</p>
      <h2 id="wa-dialog-title">Escríbanos por WhatsApp</h2>
      <p class="wa-dialog__lead">Complete estos datos y se abrirá WhatsApp con su mensaje listo para enviar.</p>
      <label>Servicio de interés
        <select name="servicio" required><option value="">Seleccione una opción</option>${opts}<option>Otro asunto fiscal o administrativo</option></select>
      </label>
      <label>¿Qué necesita?
        <select name="necesidad" required>
          <option value="">Seleccione una opción</option>
          <option>Una primera orientación</option>
          <option>Agendar una cita</option>
          <option>Dar seguimiento a un asunto</option>
        </select>
      </label>
      <label>Nombre<input name="nombre" type="text" autocomplete="name" required></label>
      <label>¿Hay alguna fecha o plazo próximo? <span class="wa-dialog__opt">(opcional)</span><input name="plazo" type="text" placeholder="Ej. notificado hoy / vence el 20 de octubre"></label>
      <label>Mensaje breve <span class="wa-dialog__opt">(opcional)</span><textarea name="mensaje" rows="2" placeholder="Sin contraseñas ni datos bancarios."></textarea></label>
      <p class="wa-dialog__status" role="status" aria-live="polite"></p>
      <button type="submit" class="btn wa-dialog__send">Continuar en WhatsApp</button>
      <a class="wa-dialog__direct" href="https://wa.me/${WA}" target="_blank" rel="noopener">Prefiero escribir directamente</a>
    </form>`;
  document.body.appendChild(dlg);
  const form = dlg.querySelector('form');
  const status = dlg.querySelector('.wa-dialog__status');
  dlg.querySelector('.wa-dialog__close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.wa-float, .wa-link:not(.tel-link)');
    if (!t) return;
    e.preventDefault();
    status.textContent = '';
    dlg.showModal();
    const first = form.querySelector(current ? 'select[name=necesidad]' : 'select[name=servicio]');
    first && first.focus();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form); const g = n => (d.get(n) || '').toString().trim();
    if (!g('servicio') || !g('necesidad') || !g('nombre')) { status.textContent = 'Por favor indique el servicio, lo que necesita y su nombre.'; return; }
    const lines = [
      `Hola, soy ${g('nombre')}. Les escribo desde integracionfiscal.com.`,
      `Servicio: ${g('servicio')}`,
      `Necesito: ${g('necesidad')}`
    ];
    if (g('plazo')) lines.push(`Fecha o plazo: ${g('plazo')}`);
    if (g('mensaje')) lines.push('', g('mensaje'));
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    dlg.close();
  });
})();
