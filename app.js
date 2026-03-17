// ============================================
// GigShield AI — App Logic (CRED Style)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  calculatePremium();
  updateDateTime();
  setInterval(updateDateTime, 60000);
});

// === Navigation ===
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.page;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      document.querySelectorAll('.page-view').forEach(p => {
        p.classList.remove('active');
        if (p.id === target) p.classList.add('active');
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function navigateTo(pageId) {
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('active');
    if (n.dataset.page === pageId) n.classList.add('active');
  });
  document.querySelectorAll('.page-view').forEach(p => {
    p.classList.remove('active');
    if (p.id === pageId) p.classList.add('active');
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// === Plan Selection ===
function selectPlan(el) {
  document.querySelectorAll('.plan-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  calculatePremium();
}

// === Premium Calculator ===
function calculatePremium() {
  const sel = document.querySelector('.plan-card.selected');
  if (!sel) return;

  const base = parseInt(sel.dataset.price);
  const city = document.getElementById('calcCity').value;
  const season = document.getElementById('calcSeason').value;
  const claims = document.getElementById('calcClaims').value;

  const zones = {
    mumbai: { f: 1.3, s: '82' }, delhi: { f: 1.2, s: '75' },
    bangalore: { f: 1.0, s: '48' }, chennai: { f: 1.3, s: '80' },
    pune: { f: 0.8, s: '28' }, kolkata: { f: 1.2, s: '72' }
  };
  const seasons = { monsoon: { f: 1.4, l: 'Monsoon' }, summer: { f: 1.1, l: 'Summer' }, winter: { f: 0.9, l: 'Winter' } };
  const claimsMap = { '0': { f: 0.85, l: '15% Bonus' }, '1-2': { f: 1.0, l: 'Standard' }, '3+': { f: 1.2, l: 'Higher' } };

  const z = zones[city], s = seasons[season], c = claimsMap[claims];
  const ai = season === 'monsoon' ? 0.10 : season === 'summer' ? 0.05 : -0.10;
  const aiLabel = ai > 0 ? `+${ai * 100}%` : `${ai * 100}%`;

  const final = Math.round(base * z.f * s.f * c.f * (1 + ai));

  animateCounter('premiumAmount', final);

  document.getElementById('premiumBreakdown').innerHTML = `
    <div class="breakdown-row"><span class="label">Base (${sel.dataset.name})</span><span class="val">₹${base}</span></div>
    <div class="breakdown-row"><span class="label">Zone Risk (Score: ${z.s})</span><span class="val">×${z.f}</span></div>
    <div class="breakdown-row"><span class="label">Season (${s.l})</span><span class="val">×${s.f}</span></div>
    <div class="breakdown-row"><span class="label">Claims (${c.l})</span><span class="val">×${c.f}</span></div>
    <div class="breakdown-row"><span class="label">AI Adjustment</span><span class="val" style="color:${ai > 0 ? 'var(--orange)' : 'var(--green)'}">${aiLabel}</span></div>
    <div class="breakdown-row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:12px;font-weight:700;">
      <span class="label" style="color:var(--text-primary)">Final Premium</span>
      <span class="val" style="color:var(--lime);font-size:1rem;">₹${final}</span>
    </div>
  `;
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const dur = 600;
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = `₹${Math.round(target * ease)}`;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// === Tabs ===
function switchTab(group, tab) {
  const container = document.querySelector(`[data-tab-group="${group}"]`);
  container.querySelectorAll('.tab-btn').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll(`[data-tab-content-group="${group}"]`).forEach(c => {
    c.style.display = c.dataset.tabContent === tab ? 'block' : 'none';
  });
}

// === Date Time ===
function updateDateTime() {
  const el = document.getElementById('liveDateTime');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }) +
      ' · ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
}

// === Modal ===
function openClaimModal() {
  document.getElementById('claimModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeClaimModal() {
  document.getElementById('claimModal').classList.remove('active');
  document.body.style.overflow = '';
}

// === Toast ===
function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;top:72px;left:50%;transform:translateX(-50%);
    padding:12px 24px;border-radius:12px;z-index:9999;font-size:0.8rem;font-weight:600;
    font-family:'Inter',sans-serif;background:#CBFF00;color:#0D0D0D;max-width:85%;
    text-align:center;animation:fadeIn 0.3s ease;`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 2200);
  setTimeout(() => t.remove(), 2600);
}

function fileClaim() {
  closeClaimModal();
  showToast('Claim submitted! Verifying with 2+ sources...');
}
