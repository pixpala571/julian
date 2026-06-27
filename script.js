'use strict';

// ============================================================
// TAB NAVIGATION
// ============================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// ============================================================
// HELPERS
// ============================================================
function fmt(n, decimals = 6) {
  if (!isFinite(n)) return 'Infini';
  const s = Number(n.toPrecision(6));
  return s.toLocaleString('fr-FR', { maximumFractionDigits: decimals });
}

function pct(n) { return (n * 100).toFixed(4) + ' %'; }

function showResult(id, html, type = 'success') {
  const el = document.getElementById(id);
  el.className = `result show ${type}`;
  el.innerHTML = html;
}

function showError(id, msg) { showResult(id, msg, 'error'); }

function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function combination(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) {
    r = r * (n - i) / (i + 1);
  }
  return Math.round(r);
}

function permutation(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = n; i > n - k; i--) r *= i;
  return r;
}

// Binomial PMF
function binomPMF(n, p, k) {
  if (k < 0 || k > n) return 0;
  return combination(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

// Binomial CDF P(X <= k)
function binomCDF(n, p, k) {
  let s = 0;
  for (let i = 0; i <= k; i++) s += binomPMF(n, p, i);
  return Math.min(s, 1);
}

// Error function approximation
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 =  0.254829592, a2 = -0.284496736, a3 =  1.421413741;
  const a4 = -1.453152027, a5 =  1.061405429, p  =  0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

// Normal CDF Phi(x)
function normalCDF(x, mu = 0, sigma = 1) {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.SQRT2)));
}

// Normal PDF
function normalPDF(x, mu = 0, sigma = 1) {
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

// ============================================================
// 1. PROBABILITE SIMPLE
// ============================================================
function calcSimple() {
  const fav = parseFloat(document.getElementById('s-favorables').value);
  const tot = parseFloat(document.getElementById('s-possibles').value);

  if (isNaN(fav) || isNaN(tot) || tot <= 0) return showError('s-result', 'Veuillez saisir des valeurs valides (total > 0).');
  if (fav > tot) return showError('s-result', 'Les cas favorables ne peuvent pas dépasser les cas possibles.');
  if (fav < 0) return showError('s-result', 'Les cas favorables ne peuvent pas être négatifs.');

  const p = fav / tot;
  showResult('s-result', `
    <strong>Résultat</strong><br>
    <span class="big-num">${fmt(p)}</span>
    <strong>En pourcentage :</strong> ${pct(p)}<br>
    <strong>Fraction :</strong> ${fav} / ${tot}
  `);
}

// ============================================================
// 2. COMPLEMENTAIRE & UNIONS
// ============================================================
function calcCompl() {
  const pa  = parseFloat(document.getElementById('c-pa').value);
  const pb  = parseFloat(document.getElementById('c-pb').value);
  const pab = parseFloat(document.getElementById('c-pab').value);

  if ([pa, pb, pab].some(isNaN)) return showError('c-result', 'Saisissez des valeurs numériques.');
  if (pa < 0 || pa > 1 || pb < 0 || pb > 1 || pab < 0)
    return showError('c-result', 'Les probabilités doivent être entre 0 et 1.');
  if (pab > Math.min(pa, pb) + 1e-9)
    return showError('c-result', 'P(A∩B) ne peut pas dépasser min(P(A), P(B)).');

  const pAunionB = pa + pb - pab;
  showResult('c-result', `
    <strong>P(A') = 1 - P(A)</strong><br>
    <span class="big-num">${fmt(1 - pa)}</span>
    <strong>P(B') = 1 - P(B) :</strong> ${fmt(1 - pb)}<br>
    <strong>P(A∪B) = P(A) + P(B) - P(A∩B) :</strong> ${fmt(pAunionB)} = ${pct(pAunionB)}<br>
    <strong>P(A∩B) donné :</strong> ${fmt(pab)} = ${pct(pab)}
  `);
}

// ============================================================
// 3. COMBINATOIRE
// ============================================================
function calcCombinato() {
  const n = parseInt(document.getElementById('co-n').value);
  const k = parseInt(document.getElementById('co-k').value);

  if (isNaN(n) || isNaN(k) || n < 0 || k < 0)
    return showError('co-result', 'Saisissez des entiers positifs.');
  if (k > n) return showError('co-result', 'k ne peut pas dépasser n.');

  const C = combination(n, k);
  const P = permutation(n, k);
  const Pn = factorial(n);

  showResult('co-result', `
    <strong>C(${n}, ${k}) — Combinaisons (sans ordre)</strong><br>
    <span class="big-num">${C > 1e15 ? C.toExponential(4) : C.toLocaleString('fr-FR')}</span>
    <strong>A(${n}, ${k}) — Arrangements (avec ordre)</strong><br>
    <span class="big-num">${P > 1e15 ? P.toExponential(4) : P.toLocaleString('fr-FR')}</span>
    <strong>${n}! — Factorielle</strong><br>
    ${Pn > 1e15 ? Pn.toExponential(6) : Pn.toLocaleString('fr-FR')}<br>
    <br><small>Formules : C(n,k) = n! / (k!(n-k)!) &nbsp;|&nbsp; A(n,k) = n! / (n-k)!</small>
  `);
}

function calcFacto() {
  const n = parseInt(document.getElementById('fa-n').value);
  if (isNaN(n) || n < 0) return showError('fa-result', 'Saisissez un entier ≥ 0.');
  if (n > 170) return showError('fa-result', 'Trop grand (> 170) : dépassement numérique.');
  const f = factorial(n);
  showResult('fa-result', `
    <strong>${n}! =</strong>
    <span class="big-num">${f.toLocaleString('fr-FR')}</span>
    <small>${f.toExponential(6)}</small>
  `);
}

// ============================================================
// 4. LOI BINOMIALE
// ============================================================
function calcBinomiale() {
  const n = parseInt(document.getElementById('bi-n').value);
  const p = parseFloat(document.getElementById('bi-p').value);
  const k = parseInt(document.getElementById('bi-k').value);
  const type = document.getElementById('bi-type').value;

  if (isNaN(n) || isNaN(p) || isNaN(k) || n < 1 || p < 0 || p > 1 || k < 0)
    return showError('bi-result', 'Paramètres invalides. Vérifiez n ≥ 1, 0 ≤ p ≤ 1, k ≥ 0.');
  if (k > n) return showError('bi-result', 'k ne peut pas dépasser n.');

  let prob;
  let label;
  switch (type) {
    case 'exact':
      prob = binomPMF(n, p, k);
      label = `P(X = ${k})`;
      break;
    case 'le':
      prob = binomCDF(n, p, k);
      label = `P(X ≤ ${k})`;
      break;
    case 'ge':
      prob = 1 - binomCDF(n, p, k - 1);
      label = `P(X ≥ ${k})`;
      break;
    case 'lt':
      prob = binomCDF(n, p, k - 1);
      label = `P(X < ${k})`;
      break;
    case 'gt':
      prob = 1 - binomCDF(n, p, k);
      label = `P(X > ${k})`;
      break;
  }

  const mu = n * p;
  const sigma = Math.sqrt(n * p * (1 - p));

  showResult('bi-result', `
    <strong>${label} =</strong>
    <span class="big-num">${fmt(prob)}</span>
    ${pct(prob)}<br><br>
    <strong>Espérance E[X] = n×p :</strong> ${fmt(mu)}<br>
    <strong>Variance Var(X) = n×p×(1-p) :</strong> ${fmt(n * p * (1 - p))}<br>
    <strong>Écart-type σ :</strong> ${fmt(sigma)}
  `);

  drawBinomChart(n, p, k, type);
}

function drawBinomChart(n, p, kMark, type) {
  const canvas = document.getElementById('bi-chart');
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 700;
  canvas.width  = W;
  canvas.height = 220;

  const maxK = Math.min(n, 60);
  const probs = [];
  for (let i = 0; i <= maxK; i++) probs.push(binomPMF(n, p, i));

  const maxP = Math.max(...probs);
  const padL = 48, padR = 16, padT = 20, padB = 36;
  const W2 = W - padL - padR;
  const H2 = canvas.height - padT - padB;
  const barW = Math.max(2, W2 / (maxK + 1) - 1);

  ctx.clearRect(0, 0, W, canvas.height);

  // Axes
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + H2);
  ctx.lineTo(padL + W2, padT + H2);
  ctx.stroke();

  // Labels axe Y
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = (maxP * i / 4);
    const y = padT + H2 - (v / maxP) * H2;
    ctx.fillText(v.toFixed(3), padL - 5, y + 4);
    ctx.strokeStyle = '#f3f4f6';
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + W2, y);
    ctx.stroke();
  }

  // Bars
  probs.forEach((v, i) => {
    const x = padL + i * (W2 / (maxK + 1)) + 1;
    const barH = (v / maxP) * H2;
    const y = padT + H2 - barH;

    let highlighted = false;
    if (type === 'exact' && i === kMark) highlighted = true;
    if (type === 'le' && i <= kMark) highlighted = true;
    if (type === 'ge' && i >= kMark) highlighted = true;
    if (type === 'lt' && i < kMark) highlighted = true;
    if (type === 'gt' && i > kMark) highlighted = true;

    ctx.fillStyle = highlighted ? '#3b82f6' : '#bfdbfe';
    ctx.fillRect(x, y, barW, barH);
  });

  // Labels axe X
  ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'center';
  const step = Math.max(1, Math.ceil(maxK / 15));
  for (let i = 0; i <= maxK; i += step) {
    const x = padL + i * (W2 / (maxK + 1)) + barW / 2;
    ctx.fillText(i, x, padT + H2 + 18);
  }

  ctx.fillStyle = '#374151';
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('k', padL + W2 / 2, padT + H2 + 32);
}

// ============================================================
// 5. LOI NORMALE
// ============================================================
function toggleNormaleInputs() {
  const type = document.getElementById('no-type').value;
  document.getElementById('no-single-inputs').style.display = type === 'between' ? 'none' : 'block';
  document.getElementById('no-range-inputs').style.display  = type === 'between' ? 'block' : 'none';
}

function calcNormale() {
  const mu    = parseFloat(document.getElementById('no-mu').value);
  const sigma = parseFloat(document.getElementById('no-sigma').value);
  const type  = document.getElementById('no-type').value;

  if (isNaN(mu) || isNaN(sigma) || sigma <= 0)
    return showError('no-result', 'Paramètres invalides. σ doit être strictement positif.');

  let prob, label;

  if (type === 'between') {
    const a = parseFloat(document.getElementById('no-a').value);
    const b = parseFloat(document.getElementById('no-b').value);
    if (isNaN(a) || isNaN(b)) return showError('no-result', 'Saisissez des valeurs pour a et b.');
    if (a > b) return showError('no-result', 'a doit être inférieur ou égal à b.');
    prob  = normalCDF(b, mu, sigma) - normalCDF(a, mu, sigma);
    label = `P(${a} ≤ X ≤ ${b})`;
  } else {
    const x = parseFloat(document.getElementById('no-x').value);
    if (isNaN(x)) return showError('no-result', 'Saisissez une valeur pour x.');
    if (type === 'le') {
      prob  = normalCDF(x, mu, sigma);
      label = `P(X ≤ ${x})`;
    } else if (type === 'ge') {
      prob  = 1 - normalCDF(x, mu, sigma);
      label = `P(X ≥ ${x})`;
    } else {
      prob  = normalPDF(x, mu, sigma);
      label = `f(${x})`;
      const z = (x - mu) / sigma;
      showResult('no-result', `
        <strong>${label} =</strong>
        <span class="big-num">${fmt(prob)}</span>
        <strong>Score Z :</strong> z = (${x} - ${mu}) / ${sigma} = ${fmt(z)}<br>
      `);
      drawNormaleChart(mu, sigma, 'le', x);
      return;
    }
  }

  const z = type !== 'between'
    ? `z = (${document.getElementById('no-x').value} - ${mu}) / ${sigma} = ${fmt((parseFloat(document.getElementById('no-x').value) - mu) / sigma)}`
    : '';

  showResult('no-result', `
    <strong>${label} =</strong>
    <span class="big-num">${fmt(prob)}</span>
    ${pct(prob)}<br>
    ${z ? `<strong>Score Z :</strong> ${z}<br>` : ''}
    <strong>Espérance E[X] = μ :</strong> ${mu}<br>
    <strong>Variance Var(X) = σ² :</strong> ${sigma * sigma}<br>
    <strong>Écart-type σ :</strong> ${sigma}
  `);

  if (type === 'between') {
    const a = parseFloat(document.getElementById('no-a').value);
    const b = parseFloat(document.getElementById('no-b').value);
    drawNormaleChart(mu, sigma, 'between', a, b);
  } else {
    drawNormaleChart(mu, sigma, type, parseFloat(document.getElementById('no-x').value));
  }
}

function drawNormaleChart(mu, sigma, type, xOrA, b) {
  const canvas = document.getElementById('no-chart');
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 700;
  canvas.width  = W;
  canvas.height = 220;

  const span = 4 * sigma;
  const xMin = mu - span, xMax = mu + span;
  const steps = 400;
  const dx = (xMax - xMin) / steps;

  const ys = [];
  for (let i = 0; i <= steps; i++) ys.push(normalPDF(xMin + i * dx, mu, sigma));
  const maxY = Math.max(...ys);

  const padL = 48, padR = 16, padT = 20, padB = 36;
  const W2 = W - padL - padR;
  const H2 = canvas.height - padT - padB;

  ctx.clearRect(0, 0, W, canvas.height);

  const toX = v => padL + ((v - xMin) / (xMax - xMin)) * W2;
  const toY = v => padT + H2 - (v / maxY) * H2;

  // Grid lines
  ctx.strokeStyle = '#f3f4f6';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = maxY * i / 4;
    const y = toY(v);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + W2, y);
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(v.toFixed(3), padL - 5, y + 4);
  }

  // Filled region
  ctx.beginPath();
  ctx.moveTo(toX(xMin), toY(0));
  for (let i = 0; i <= steps; i++) {
    const xv = xMin + i * dx;
    const yv = ys[i];
    let fill = false;
    if (type === 'le'      && xv <= xOrA) fill = true;
    if (type === 'ge'      && xv >= xOrA) fill = true;
    if (type === 'between' && xv >= xOrA && xv <= b) fill = true;
    if (fill) ctx.lineTo(toX(xv), toY(yv));
    else ctx.moveTo(toX(xv), toY(0));
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(59,130,246,.25)';
  ctx.fill();

  // Curve
  ctx.beginPath();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2.5;
  for (let i = 0; i <= steps; i++) {
    const xv = xMin + i * dx;
    i === 0 ? ctx.moveTo(toX(xv), toY(ys[i])) : ctx.lineTo(toX(xv), toY(ys[i]));
  }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + H2);
  ctx.lineTo(padL + W2, padT + H2);
  ctx.stroke();

  // X labels
  ctx.fillStyle = '#6b7280';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'center';
  for (let s = -4; s <= 4; s += 2) {
    const xv = mu + s * sigma;
    ctx.fillText((xv % 1 === 0 ? xv : xv.toFixed(2)), toX(xv), padT + H2 + 18);
  }

  // Mean line
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(toX(mu), padT);
  ctx.lineTo(toX(mu), padT + H2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('μ', toX(mu), padT + 13);
}

// ============================================================
// 6. PROBABILITE CONDITIONNELLE
// ============================================================
function calcConditionnelle() {
  const pab = parseFloat(document.getElementById('pc-pab').value);
  const pb  = parseFloat(document.getElementById('pc-pb').value);

  if (isNaN(pab) || isNaN(pb)) return showError('pc-result', 'Saisissez des valeurs numériques.');
  if (pb <= 0) return showError('pc-result', 'P(B) doit être strictement positif.');
  if (pab > pb + 1e-9) return showError('pc-result', 'P(A∩B) ne peut pas dépasser P(B).');

  const pAgivenB = pab / pb;
  showResult('pc-result', `
    <strong>P(A|B) = P(A∩B) / P(B)</strong><br>
    <span class="big-num">${fmt(pAgivenB)}</span>
    ${pct(pAgivenB)}<br>
    <strong>Calcul :</strong> ${pab} / ${pb} = ${fmt(pAgivenB)}
  `);
}

function calcIndep() {
  const pa  = parseFloat(document.getElementById('in-pa').value);
  const pb  = parseFloat(document.getElementById('in-pb').value);
  const pab = parseFloat(document.getElementById('in-pab').value);

  if ([pa, pb, pab].some(isNaN)) return showError('in-result', 'Saisissez des valeurs numériques.');
  if (pa < 0 || pa > 1 || pb < 0 || pb > 1 || pab < 0)
    return showError('in-result', 'Les probabilités doivent être entre 0 et 1.');

  const produit = pa * pb;
  const diff = Math.abs(pab - produit);
  const eps = 1e-9;
  const independent = diff < eps;

  const couleur = independent ? 'green' : 'orange';
  showResult('in-result', `
    <strong>P(A) × P(B) = ${fmt(produit)}</strong><br>
    <strong>P(A∩B) donné = ${fmt(pab)}</strong><br>
    <span class="big-num ${couleur}">${independent ? 'A et B sont INDEPENDANTS' : 'A et B NE sont PAS indépendants'}</span>
    <small>|P(A∩B) - P(A)×P(B)| = ${fmt(diff)}</small>
  `);
}

// ============================================================
// 7. THEOREME DE BAYES
// ============================================================
function calcBayes() {
  const pA   = parseFloat(document.getElementById('ba-pa').value);
  const pBgA = parseFloat(document.getElementById('ba-pba').value);
  const pBgNA = parseFloat(document.getElementById('ba-pbna').value);

  if ([pA, pBgA, pBgNA].some(isNaN))
    return showError('ba-result', 'Saisissez des valeurs numériques.');
  if (pA < 0 || pA > 1 || pBgA < 0 || pBgA > 1 || pBgNA < 0 || pBgNA > 1)
    return showError('ba-result', 'Toutes les probabilités doivent être entre 0 et 1.');

  const pNA = 1 - pA;
  const pB  = pBgA * pA + pBgNA * pNA;
  if (pB <= 0) return showError('ba-result', 'P(B) calculé est nul : vérifiez les paramètres.');

  const pAgB = (pBgA * pA) / pB;

  showResult('ba-result', `
    <strong>Étapes du calcul :</strong><br>
    P(A') = 1 - P(A) = ${fmt(pNA)}<br>
    P(B) = P(B|A)×P(A) + P(B|A')×P(A') = ${fmt(pBgA)}×${fmt(pA)} + ${fmt(pBgNA)}×${fmt(pNA)} = <strong>${fmt(pB)}</strong><br>
    <br>
    <strong>P(A|B) = P(B|A) × P(A) / P(B)</strong>
    <span class="big-num">${fmt(pAgB)}</span>
    ${pct(pAgB)}<br>
  `);

  drawBayesViz(pA, pAgB, pB, pBgA, pBgNA);
}

function drawBayesViz(pA, pAgB, pB, pBgA, pBgNA) {
  const viz = document.getElementById('ba-viz');
  const rows = [
    { label: 'P(A) — a priori',         value: pA,    color: '#3b82f6' },
    { label: 'P(A|B) — a posteriori',   value: pAgB,  color: '#22c55e' },
    { label: 'P(B) — prob. totale',      value: pB,    color: '#f97316' },
    { label: 'P(B|A) — vraisemblance',  value: pBgA,  color: '#a855f7' },
    { label: "P(B|A') — faux positifs", value: pBgNA, color: '#ef4444' },
  ];

  viz.innerHTML = rows.map(r => `
    <div class="bayes-row">
      <span class="bayes-label">${r.label}</span>
      <div class="bayes-bar-wrap">
        <div class="bayes-bar" style="width:${(r.value * 100).toFixed(2)}%;background:${r.color}"></div>
      </div>
      <span class="bayes-pct" style="color:${r.color}">${pct(r.value)}</span>
    </div>
  `).join('');
}

function calcProbTotales() {
  const pA   = parseFloat(document.getElementById('pt-pa').value);
  const pBgA = parseFloat(document.getElementById('pt-pba').value);
  const pBgNA = parseFloat(document.getElementById('pt-pbna').value);

  if ([pA, pBgA, pBgNA].some(isNaN))
    return showError('pt-result', 'Saisissez des valeurs numériques.');
  if (pA < 0 || pA > 1 || pBgA < 0 || pBgA > 1 || pBgNA < 0 || pBgNA > 1)
    return showError('pt-result', 'Toutes les probabilités doivent être entre 0 et 1.');

  const pNA = 1 - pA;
  const pB  = pBgA * pA + pBgNA * pNA;

  showResult('pt-result', `
    <strong>P(B) = P(B|A)×P(A) + P(B|A')×P(A')</strong><br>
    = ${fmt(pBgA)} × ${fmt(pA)} + ${fmt(pBgNA)} × ${fmt(pNA)}<br>
    = ${fmt(pBgA * pA)} + ${fmt(pBgNA * pNA)}<br>
    <span class="big-num">${fmt(pB)}</span>
    ${pct(pB)}
  `);
}
