// ---- Gráfica unificada: tendencia diaria (línea suave + área + tooltip) ----
const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function fmtDayShort(dStr){
  const d = new Date(dStr+"T00:00:00");
  return d.getDate() + '/' + (d.getMonth()+1);
}
function fmtDayLong(dStr){
  const d = new Date(dStr+"T00:00:00");
  return d.getDate() + ' de ' + MESES[d.getMonth()] + ' ' + d.getFullYear();
}
function fmtHora(hDec){
  const hh = Math.floor(hDec);
  const mm = Math.round((hDec - hh) * 60);
  const mm2 = mm === 60 ? 0 : mm;
  const hh2 = mm === 60 ? hh + 1 : hh;
  return String(hh2).padStart(2,'0') + ':' + String(mm2).padStart(2,'0');
}

// Promedio diario de ambas series, sobre el mismo eje de días
const uniqueDates = [...new Set(records.map(r=>r[0]))].sort();
const dailyMin = uniqueDates.map(d=>{
  const vals = records.filter(r=>r[0]===d).map(r=>r[2]);
  return vals.reduce((a,b)=>a+b,0) / vals.length;
});
const dailyHora = uniqueDates.map(d=>{
  const vals = requestTimes.filter(r=>r[0]===d).map(r=>r[2]);
  return vals.reduce((a,b)=>a+b,0) / vals.length;
});

const trendSvg = document.getElementById('trendChart');
const TW = 1000, TH = 380, tPadL = 44, tPadR = 44, tPadT = 24, tPadB = 40;
const n = uniqueDates.length;
const plotW = TW - tPadL - tPadR;
const plotH = TH - tPadT - tPadB;

function txFor(i){ return tPadL + (i/(n-1)) * plotW; }

const minMax = Math.max(...dailyMin) * 1.15;
const minMin = 0;
const horaMax = Math.max(...dailyHora) + 1.2;
const horaMin = Math.min(...dailyHora) - 1.2;

function tyForMin(v){ return TH - tPadB - ((v - minMin) / (minMax - minMin)) * plotH; }
function tyForHora(v){ return TH - tPadB - ((v - horaMin) / (horaMax - horaMin)) * plotH; }

const ptsMin = dailyMin.map((v,i)=>[txFor(i), tyForMin(v)]);
const ptsHora = dailyHora.map((v,i)=>[txFor(i), tyForHora(v)]);

// Catmull-Rom -> Bezier suave
function smoothPath(pts){
  if(pts.length < 2) return '';
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for(let i=0; i<pts.length-1; i++){
    const p0 = pts[i-1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i+1];
    const p3 = pts[i+2] || p2;
    const c1x = p1[0] + (p2[0]-p0[0])/6;
    const c1y = p1[1] + (p2[1]-p0[1])/6;
    const c2x = p2[0] - (p3[0]-p1[0])/6;
    const c2y = p2[1] - (p3[1]-p1[1])/6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const lineMinPath = smoothPath(ptsMin);
const lineHoraPath = smoothPath(ptsHora);
const areaMinPath = `${lineMinPath} L ${ptsMin[ptsMin.length-1][0]},${TH-tPadB} L ${ptsMin[0][0]},${TH-tPadB} Z`;
const areaHoraPath = `${lineHoraPath} L ${ptsHora[ptsHora.length-1][0]},${TH-tPadB} L ${ptsHora[0][0]},${TH-tPadB} Z`;

let tContent = `<defs>
  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="var(--teal)" stop-opacity="0.28"/>
    <stop offset="100%" stop-color="var(--teal)" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="gradCoral" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="var(--coral)" stop-opacity="0.24"/>
    <stop offset="100%" stop-color="var(--coral)" stop-opacity="0"/>
  </linearGradient>
</defs>`;

// Grid horizontal (escala de minutos, eje izquierdo)
const gridSteps = 4;
for(let s=0; s<=gridSteps; s++){
  const v = (minMax/gridSteps) * s;
  const y = tyForMin(v);
  tContent += `<line class="grid-line" x1="${tPadL}" y1="${y}" x2="${TW-tPadR}" y2="${y}"/>`;
  tContent += `<text class="axis-label" x="4" y="${y+4}" fill="var(--teal-dark)">${Math.round(v)}</text>`;
}
// Eje derecho: horas
for(let s=0; s<=gridSteps; s++){
  const v = horaMin + (horaMax-horaMin)/gridSteps * s;
  const y = tyForHora(v);
  tContent += `<text class="axis-label" x="${TW-tPadR+8}" y="${y+4}" fill="var(--coral)">${fmtHora(v)}</text>`;
}
// Etiquetas de día en el eje X
uniqueDates.forEach((d,i)=>{
  const x = txFor(i);
  tContent += `<text class="day-label" x="${x}" y="${TH-tPadB+16}" text-anchor="middle">${fmtDayShort(d)}</text>`;
});

// Áreas + líneas
tContent += `<path d="${areaMinPath}" fill="url(#gradTeal)" stroke="none"/>`;
tContent += `<path d="${areaHoraPath}" fill="url(#gradCoral)" stroke="none"/>`;
tContent += `<path class="trend-line" d="${lineMinPath}" stroke="var(--teal)" stroke-dasharray="900" stroke-dashoffset="900"/>`;
tContent += `<path class="trend-line" d="${lineHoraPath}" stroke="var(--coral)" stroke-dasharray="900" stroke-dashoffset="900"/>`;

// Línea guía + puntos de hover (ocultos por defecto)
tContent += `<line class="guide-line" id="guideLine" x1="0" y1="${tPadT}" x2="0" y2="${TH-tPadB}"/>`;
tContent += `<circle class="hover-pt" id="hoverMin" r="5.5" fill="#fff" stroke="var(--teal)" stroke-width="2.5"/>`;
tContent += `<circle class="hover-pt" id="hoverHora" r="5.5" fill="#fff" stroke="var(--coral)" stroke-width="2.5"/>`;

// Rect transparente para capturar el puntero
tContent += `<rect class="capture-rect" id="captureRect" x="${tPadL}" y="0" width="${plotW}" height="${TH}"/>`;

trendSvg.innerHTML = tContent;

// Animación de dibujo al hacer scroll a la sección
const ioTrend = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      trendSvg.querySelectorAll('.trend-line').forEach(p=>{ p.style.transition = 'stroke-dashoffset 1.4s ease'; p.style.strokeDashoffset = '0'; });
      ioTrend.unobserve(e.target);
    }
  });
}, {threshold:0.25});
ioTrend.observe(trendSvg);

// ---- Interactividad: hover (desktop) y tap (móvil) ----
const tooltip = document.getElementById('chartTooltip');
const guideLine = document.getElementById('guideLine');
const hoverMin = document.getElementById('hoverMin');
const hoverHora = document.getElementById('hoverHora');
const captureRect = document.getElementById('captureRect');
const chartWrap = trendSvg.closest('.chart-svg-wrap');

function nearestIndex(svgX){
  let closest = 0, minDist = Infinity;
  for(let i=0;i<n;i++){
    const dist = Math.abs(txFor(i) - svgX);
    if(dist < minDist){ minDist = dist; closest = i; }
  }
  return closest;
}

function showTooltipAt(i){
  const x = txFor(i);
  guideLine.setAttribute('x1', x);
  guideLine.setAttribute('x2', x);
  guideLine.classList.add('show');
  hoverMin.setAttribute('cx', x); hoverMin.setAttribute('cy', ptsMin[i][1]); hoverMin.classList.add('show');
  hoverHora.setAttribute('cx', x); hoverHora.setAttribute('cy', ptsHora[i][1]); hoverHora.classList.add('show');

  const rect = trendSvg.getBoundingClientRect();
  const wrapRect = chartWrap.getBoundingClientRect();
  const scaleX = rect.width / TW, scaleY = rect.height / TH;
  const pxX = (rect.left - wrapRect.left) + x * scaleX;
  const pxY = (rect.top - wrapRect.top) + Math.min(ptsMin[i][1], ptsHora[i][1]) * scaleY;

  tooltip.innerHTML = `
    <div class="tt-date">${fmtDayLong(uniqueDates[i])}</div>
    <div class="tt-row"><span class="dot" style="background:var(--teal)"></span>${Math.round(dailyMin[i])} <span class="tt-label">min · cotización final</span></div>
    <div class="tt-row"><span class="dot" style="background:var(--coral)"></span>${fmtHora(dailyHora[i])} <span class="tt-label">hora de llegada</span></div>
  `;
  let left = pxX;
  const min = 90, max = wrapRect.width - 90;
  if(left < min) left = min;
  if(left > max) left = max;
  tooltip.style.left = left + 'px';
  tooltip.style.top = pxY + 'px';
  tooltip.classList.add('show');
}

function hideTooltip(){
  guideLine.classList.remove('show');
  hoverMin.classList.remove('show');
  hoverHora.classList.remove('show');
  tooltip.classList.remove('show');
}

function svgXFromEvent(evt){
  const rect = trendSvg.getBoundingClientRect();
  const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
  return ((clientX - rect.left) / rect.width) * TW;
}

captureRect.addEventListener('mousemove', (evt)=>{
  showTooltipAt(nearestIndex(svgXFromEvent(evt)));
});
captureRect.addEventListener('mouseleave', hideTooltip);
captureRect.addEventListener('touchstart', (evt)=>{
  evt.preventDefault();
  showTooltipAt(nearestIndex(svgXFromEvent(evt)));
}, {passive:false});
captureRect.addEventListener('touchmove', (evt)=>{
  evt.preventDefault();
  showTooltipAt(nearestIndex(svgXFromEvent(evt)));
}, {passive:false});
document.addEventListener('touchstart', (evt)=>{
  if(!chartWrap.contains(evt.target)) hideTooltip();
});
