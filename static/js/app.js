// SPA pedagogie.tablonoir.fr — modules / parties / veille / récap / bibliothèque

const APP = document.getElementById('app');
const STATE = { data: null, currentModule: null, currentPartie: null };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = (s) => {
  if (!s) return '';
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString('fr-FR', {day:'2-digit', month:'short', year:'numeric'});
};

// --------- BOOTSTRAP ---------
async function boot() {
  const r = await fetch('/api/bootstrap', {cache: 'no-cache'});
  STATE.data = await r.json();
  route();
  window.addEventListener('hashchange', route);
}

// --------- ROUTING ---------
function route() {
  const h = location.hash.replace(/^#/, '');
  const parts = h.split('/').filter(Boolean);
  if (parts.length === 0) return renderHome();
  if (parts[0] === 'module' && parts.length === 2) return renderModule(parseInt(parts[1],10));
  if (parts[0] === 'module' && parts[2] === 'partie' && parts.length === 4) return renderPartie(parseInt(parts[1],10), parseInt(parts[3],10));
  if (parts[0] === 'veille') return renderVeille(parts[1] || 'all');
  if (parts[0] === 'recap') return renderRecap();
  if (parts[0] === 'bibliotheque') return renderBibliotheque();
  return renderHome();
}

// --------- HOME ---------
function renderHome() {
  const peda = STATE.data.pedagogie;
  const veille = STATE.data.veille;
  const themes = STATE.data.themes;
  const recap = STATE.data.recap;
  const lastArticles = (veille.articles || []).slice(0, 6);

  APP.innerHTML = `
    <div class="hero-video-wrap">
      <video class="hero-video" src="/static/videos/hero-home.mp4" autoplay muted loop playsinline poster=""></video>
      <div class="hero-video-overlay"></div>
      <div class="hero-video-caption">
        <span class="home-eyebrow">Parcours certifiant interne · Eduservices</span>
        <h1>Apprendre &amp; transmettre<br><span class="hero-accent">avec les outils numériques</span></h1>
      </div>
    </div>
    <section class="home-hero">
      <div class="home-hero-inner">
        <p class="home-lead" style="font-size:20px;margin-top:6px;">Le support en ligne du parcours de formation des formateurs. Vous y retrouvez les contenus des modules, la veille spécialisée sur le numérique éducatif, le multimodal et l'IA, ainsi que les références pour préparer, animer et certifier.</p>
        <div class="home-cta-row">
          <a class="cta-primary" href="#module/2">Voir le Module 2</a>
          <a class="cta-secondary" href="#veille">Explorer la veille</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div class="section-eyebrow">Le site en 3 points</div>
        <h2>À quoi sert ce site ?</h2>
      </div>
      <div class="value-grid">
        <div class="value-card">
          <span class="value-num">01</span>
          <h3>Un support de présentation</h3>
          <p>Chaque module est un déroulé fluide à projeter ou parcourir en classe. Le formateur ouvre les popups au fil de l'animation pour développer les points.</p>
        </div>
        <div class="value-card">
          <span class="value-num">02</span>
          <h3>Une veille curée, vérifiée</h3>
          <p>Des ressources sélectionnées et fetchées — pas de liens cassés, pas de paywall. Pour nourrir vos pratiques entre deux sessions.</p>
        </div>
        <div class="value-card">
          <span class="value-num">03</span>
          <h3>Un récap hebdomadaire</h3>
          <p>Chaque semaine, trois lectures choisies sur les sujets clés de la pédagogie numérique. Téléchargeable en PDF.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div class="section-eyebrow">Modules de formation</div>
        <h2>Le parcours certifiant</h2>
      </div>
      <div class="modules-grid">
        ${peda.modules.map(m => `
          <a class="module-card ${m.status === 'coming-soon' ? 'module-card--soon' : ''}" href="${m.status === 'coming-soon' ? '#' : '#module/'+m.num}">
            <div class="module-card-eyebrow">Module ${m.num} · ${esc(m.duree)}</div>
            <h3>${esc(m.title)}</h3>
            <p>${esc(m.tagline)}</p>
            ${m.status === 'coming-soon'
              ? '<div class="module-card-status">À venir</div>'
              : `<div class="module-card-cta">Explorer le module →</div>`}
          </a>
        `).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div class="section-eyebrow">Dernier récap</div>
        <h2>${esc(recap.titre || 'Récap')}</h2>
      </div>
      <div class="recap-teaser">
        <p class="recap-intro">${esc(recap.intro || '')}</p>
        <div class="recap-items-row">
          ${(recap.items||[]).map(it => `
            <a class="recap-mini" href="${esc(it.url)}" target="_blank" rel="noopener">
              <div class="recap-mini-eyebrow">${esc(it.theme_label)}</div>
              <h4>${esc(it.titre)}</h4>
              <div class="recap-mini-source">${esc(it.source)}</div>
            </a>
          `).join('')}
        </div>
        <div class="recap-actions">
          <a class="cta-secondary" href="${esc(recap.pdf)}" target="_blank">Télécharger le PDF du récap</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div class="section-eyebrow">Veille curée</div>
        <h2>Les dernières ressources</h2>
      </div>
      <div class="veille-grid">
        ${lastArticles.map(a => `
          <a class="veille-card" href="${esc(a.url)}" target="_blank" rel="noopener">
            <div class="veille-img" style="background:#0a1628 url('${esc(a.img)}') center/cover no-repeat;"></div>
            <div class="veille-body">
              <div class="veille-meta">${esc(a.source)} · ${fmtDate(a.date)}</div>
              <h3>${esc(a.titre)}</h3>
              <p>${esc(a.lead)}</p>
            </div>
          </a>
        `).join('')}
      </div>
      <div style="text-align:center;margin-top:24px;">
        <a class="cta-secondary" href="#veille">Voir toutes les ressources de veille</a>
      </div>
    </section>
  `;
}

// --------- MODULE (page module avec ses parties) ---------
async function renderModule(num) {
  const r = await fetch(`/api/module/${num}`, {cache: 'no-cache'});
  if (!r.ok) { APP.innerHTML = '<section class="section"><p>Module introuvable.</p></section>'; return; }
  const m = await r.json();
  STATE.currentModule = m;
  APP.innerHTML = `
    <section class="home-hero module-hero">
      <div class="home-hero-inner">
        <span class="home-eyebrow">Module ${m.num} · ${esc(m.duree)}</span>
        <h1>${esc(m.title)}</h1>
        <p class="home-lead">${esc(m.tagline)}</p>
      </div>
    </section>
    <section class="section">
      <div class="section-head">
        <div class="section-eyebrow">Les ${m.parties.length} parties du module</div>
        <h2>Parcourir</h2>
      </div>
      <div class="parties-grid">
        ${m.parties.map(p => `
          <a class="partie-card" href="#module/${m.num}/partie/${p.num}">
            <div class="partie-num">P${p.num}</div>
            <div class="partie-body">
              <div class="partie-eyebrow">${esc(p.duree)}</div>
              <h3>${esc(p.title)}</h3>
              <p>${esc(p.tagline)}</p>
              <div class="partie-cta">Ouvrir la partie →</div>
            </div>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

// --------- PARTIE (cours fluide + sidebar vignettes + modals) ---------
async function renderPartie(num, p) {
  const r = await fetch(`/api/module/${num}/partie/${p}`, {cache: 'no-cache'});
  if (!r.ok) { APP.innerHTML = '<section class="section"><p>Partie introuvable.</p></section>'; return; }
  const part = await r.json();
  STATE.currentPartie = part;
  const hasVignettes = Array.isArray(part.vignettes) && part.vignettes.length > 0;
  APP.innerHTML = `
    <section class="partie-hero">
      <div class="partie-hero-inner">
        <a class="back-link" href="#module/${num}">← Module ${num} · ${esc(part.module_title || '')}</a>
        <span class="home-eyebrow">Partie ${part.num} · ${esc(part.duree)}</span>
        <h1>${esc(part.title)}</h1>
        <p class="home-lead">${esc(part.tagline)}</p>
      </div>
    </section>
    <section class="section section-full">
      <div class="module-layout ${hasVignettes ? 'has-sidebar' : ''}">
        <div class="module-main">
          ${part.sections.map(s => `
            <details ${s.type === 'cours' ? 'open' : ''} class="section-block">
              <summary>
                <div>
                  <div class="section-block-type">${esc(s.type)}</div>
                  <h3>${esc(s.titre)}</h3>
                  ${s.lead ? `<p class="section-block-lead">${esc(s.lead)}</p>` : ''}
                </div>
                <span class="section-block-chev">▾</span>
              </summary>
              <div class="content">${s.html || ''}</div>
            </details>
          `).join('')}
          ${part.linked_actus && part.linked_actus.length ? `
            <div class="linked-actus">
              <div class="linked-actus-eye">⚡ Ressources liées</div>
              ${part.linked_actus.map(a => `
                <a href="${esc(a.url)}" target="_blank" rel="noopener" class="linked-actu-item">
                  <div class="meta">${esc(a.type)} · ${fmtDate(a.date)} · ${esc(a.source)}</div>
                  <div class="t">${esc(a.titre)}</div>
                </a>`).join('')}
            </div>` : ''}
        </div>
        ${hasVignettes ? `
        <aside class="module-sidebar">
          <div class="sidebar-eye">Pour aller plus loin</div>
          ${part.vignettes.map((v, i) => renderVignette(v, i)).join('')}
        </aside>` : ''}
      </div>
    </section>
    <div id="modal-root"></div>
  `;
  bindVignetteClicks();
}

function renderVignette(v, idx) {
  const t = v.type || 'article';
  const isExternal = !!v.url;
  const isModal = !isExternal && v.modal_id != null;

  const tag = isExternal
    ? `<a class="vignette vignette-${t}" href="${esc(v.url)}" target="_blank" rel="noopener" data-vignette="${idx}">`
    : isModal
      ? `<button class="vignette vignette-${t}" type="button" data-modal="${esc(v.modal_id)}" data-vignette="${idx}">`
      : `<div class="vignette vignette-${t}" data-vignette="${idx}">`;
  const closetag = isExternal ? '</a>' : isModal ? '</button>' : '</div>';

  let body;
  if (t === 'video' && v.thumb) {
    body = `<div class="vignette-thumb"><img src="${esc(v.thumb)}" alt=""><span class="vignette-play">▶</span></div>
            <div class="vignette-body">
              <div class="vignette-label"><span class="vignette-icon">${v.icon||'▶'}</span>${esc(v.label||'Vidéo')}</div>
              <div class="vignette-title">${esc(v.titre)}</div>
              <p class="vignette-lead">${esc(v.lead)}</p>
              ${v.source ? `<div class="vignette-meta">${esc(v.source)}</div>` : ''}
            </div>`;
  } else if (t === 'chiffre') {
    body = `<div class="vignette-body">
              <div class="vignette-label"><span class="vignette-icon">${v.icon||'📊'}</span>${esc(v.label||'Chiffre-clé')}</div>
              <div class="vignette-bignum">${esc(v.titre)}</div>
              <p class="vignette-lead">${esc(v.lead)}</p>
            </div>`;
  } else if (t === 'citation') {
    body = `<div class="vignette-body">
              <div class="vignette-label"><span class="vignette-icon">${v.icon||'💬'}</span>${esc(v.label||'Citation')}</div>
              <blockquote class="vignette-quote">${esc(v.titre)}</blockquote>
              <p class="vignette-lead">${esc(v.lead)}</p>
              ${v.source ? `<div class="vignette-meta">— ${esc(v.source)}</div>` : ''}
            </div>`;
  } else {
    // article, podcast, dossier, rapport, etude, approfondir
    body = `<div class="vignette-body">
              <div class="vignette-label"><span class="vignette-icon">${v.icon||'📄'}</span>${esc(v.label||'')}</div>
              <div class="vignette-title">${esc(v.titre)}</div>
              <p class="vignette-lead">${esc(v.lead)}</p>
              ${v.source ? `<div class="vignette-meta">${esc(v.source)}${v.duree ? ' · ' + esc(v.duree) : ''}</div>` : ''}
              ${isExternal ? `<div class="vignette-cta">Ouvrir ↗</div>` : isModal ? `<div class="vignette-cta">Voir le détail →</div>` : ''}
            </div>`;
  }
  return tag + body + closetag;
}

function bindVignetteClicks() {
  document.querySelectorAll('[data-modal]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(el.getAttribute('data-modal'));
    });
  });
}

function openModal(id) {
  const p = STATE.currentPartie;
  if (!p || !p.modals || !p.modals[id]) return;
  const data = p.modals[id];
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.innerHTML = `
    <div class="modal-backdrop" onclick="closeModal()"></div>
    <div class="modal-window" role="dialog" aria-modal="true">
      <button class="modal-close" onclick="closeModal()" aria-label="Fermer">✕</button>
      <div class="modal-head"><h2>${esc(data.titre)}</h2></div>
      <div class="modal-body">${data.html || ''}</div>
    </div>
  `;
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', escClose);
}
function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) root.innerHTML = '';
  document.body.style.overflow = '';
  document.removeEventListener('keydown', escClose);
}
function escClose(e) { if (e.key === 'Escape') closeModal(); }
window.closeModal = closeModal;

// --------- VEILLE ---------
function renderVeille(theme) {
  const arts = STATE.data.veille.articles || [];
  const themes = STATE.data.themes.themes || [];
  const filtered = theme === 'all' ? arts : arts.filter(a => (a.themes||[]).includes(theme));
  APP.innerHTML = `
    <section class="home-hero">
      <div class="home-hero-inner">
        <span class="home-eyebrow">Veille pédagogique curée</span>
        <h1>Curation de ressources</h1>
        <p class="home-lead">${filtered.length} ressources sélectionnées, fetchées et vérifiées. Sources françaises prioritaires. Aucun paywall, aucun lien cassé.</p>
      </div>
    </section>
    <section class="section">
      <div class="theme-filter">
        <a class="chip ${theme==='all'?'active':''}" href="#veille">Toutes</a>
        ${themes.map(t => `<a class="chip ${theme===t.slug?'active':''}" href="#veille/${esc(t.slug)}" style="--theme-color:${esc(t.color||'#4dd0ff')}">${esc(t.label)}</a>`).join('')}
      </div>
      <div class="veille-grid">
        ${filtered.map(a => `
          <a class="veille-card" href="${esc(a.url)}" target="_blank" rel="noopener">
            <div class="veille-img" style="background:#0a1628 url('${esc(a.img)}') center/cover no-repeat;"></div>
            <div class="veille-body">
              <div class="veille-meta">${esc(a.type)} · ${esc(a.source)} · ${fmtDate(a.date)}</div>
              <h3>${esc(a.titre)}</h3>
              <p>${esc(a.lead)}</p>
            </div>
          </a>`).join('')}
      </div>
    </section>
  `;
}

// --------- RÉCAP ---------
function renderRecap() {
  const r = STATE.data.recap;
  APP.innerHTML = `
    <section class="home-hero">
      <div class="home-hero-inner">
        <span class="home-eyebrow">Récap · ${esc(r.edition || '')}</span>
        <h1>${esc(r.titre || 'Récap')}</h1>
        <p class="home-lead">${esc(r.intro || '')}</p>
        <div class="home-cta-row"><a class="cta-primary" href="${esc(r.pdf)}" target="_blank">Télécharger le PDF</a></div>
      </div>
    </section>
    <section class="section">
      <div class="recap-list">
        ${(r.items||[]).map(it => `
          <article class="recap-item">
            <div class="recap-item-eyebrow">${esc(it.theme_label)}</div>
            <h2><a href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.titre)}</a></h2>
            <div class="recap-item-meta">${esc(it.source)} · ${esc(it.auteur||'')} · ${fmtDate(it.date)}</div>
            <p class="recap-item-lead">${esc(it.lead)}</p>
            <div class="recap-item-why"><strong>Pourquoi le lire ?</strong> ${esc(it.pourquoi)}</div>
            <a href="${esc(it.url)}" target="_blank" rel="noopener" class="recap-item-cta">Lire la ressource ↗</a>
          </article>`).join('')}
      </div>
    </section>
  `;
}

// --------- BIBLIOTHÈQUE ---------
function renderBibliotheque() {
  APP.innerHTML = `
    <section class="home-hero">
      <div class="home-hero-inner">
        <span class="home-eyebrow">Bibliothèque</span>
        <h1>Documents et ressources</h1>
        <p class="home-lead">Livrets et supports téléchargeables liés à la formation.</p>
      </div>
    </section>
    <section class="section">
      <p style="color:var(--ink2);">À venir : livrets formateurs, fiches méthode, supports d'animation.</p>
    </section>
  `;
}

boot();
